"use server";

/* SNS 콘텐츠 검수 — 저장·승인. (2026-08-17 사장님 지시)
 *
 * 「나는 그 콘텐츠를 선택하고 자막과 캡션을 보고 수정 및 검수하고 저장하고,
 *   검토 완료 누르면, 너가 콘텐츠를 영상을 그대로 만들어서 유튜브와 드라이브에 올려줘」
 *
 * ⭐ 저장할 때 **자막 검사를 다시 돈다.** 사장님이 고친 문장도 검사를 받는다 —
 *   안 그러면 「검사기를 통과한 대본」과 「실제로 나가는 자막」이 갈린다.
 *   그렇다고 저장을 «막지는» 않는다. 사장님이 뜻을 알고 쓰신 말을 기계가 되돌리면 안 된다.
 *   대신 걸린 것을 적어 두고 화면에 띄운다. 판단은 사람이 한다.
 *
 * ⚠ 여기서 영상을 굽지 않는다. ffmpeg·헤드리스 크롬·11분짜리 녹화본 원본·유튜브
 *   토큰이 전부 사장님 컴퓨터에 있다. 서버 함수는 그걸 못 돌린다.
 *   승인만 남기고, 굽기·올리기는 로컬이 `_작업/sns올리기.mts` 로 집어 간다.
 */
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { snsContent, snsCut } from "@/db/schema";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";
import { checkScript, type 대본, type 대본칸 } from "@/lib/sns-caption-rules";

async function 주인확인() {
  const session = await getSession();
  if (!isOwner(session?.user.email)) throw new Error("이 화면은 사이트 주인만 볼 수 있습니다.");
}

/** 지금 DB 에 든 것으로 대본 모양을 다시 만들어 검사한다. */
async function 다시검사(contentId: string): Promise<string> {
  const [편] = await db.select().from(snsContent).where(eq(snsContent.id, contentId));
  if (!편) return "";
  const 칸들 = await db.select().from(snsCut).where(eq(snsCut.contentId, contentId)).orderBy(snsCut.ord);

  const 대본: 대본 = {
    이름: 편.slug,
    세로제목: 편.verticalTitle,
    가로제목: 편.horizontalTitle,
    칸초: Number(편.secPerCard) || 1.8,
    칸들: 칸들.map((c): 대본칸 => ({
      cap: JSON.parse(c.captionJson || "[]") as string[],
      pose: c.pose || undefined,
      /* 컷 정보는 굽기 쪽 값이라 여기서 고치지 않는다 — 검사가 볼 수 있게만 넘긴다. */
      shots: c.clip
        ? [{ clip: c.clip, ss: Number(c.ss) || 0, zoom: c.zoom === "" ? undefined : Number(c.zoom) }]
        : [],
    })),
  };
  const 걸림 = checkScript(대본);
  if (!걸림.length) return "";
  return 걸림.map((g) => `[${g.어디}] ${g.무엇} → ${g.대신}`).join("\n");
}

export type 저장결과 = { ok: true; 검사: string } | { ok: false; 왜: string };

/** 자막·제목·캡션을 저장한다. 저장하면서 검사를 다시 돌려 결과를 함께 돌려준다. */
export async function saveContentAction(
  contentId: string,
  값: {
    verticalTitle: string;
    horizontalTitle: string;
    captionYoutube: string;
    captionInstagram: string;
    hashtags: string;
    slotLabel: string;
    /** 칸 id → 자막 줄 배열. 빈 줄은 버린다. */
    자막: Record<string, string[]>;
  },
): Promise<저장결과> {
  try {
    await 주인확인();
    for (const [cutId, 줄들] of Object.entries(값.자막)) {
      const 깨끗한 = 줄들.map((s) => s.trim()).filter(Boolean);
      await db
        .update(snsCut)
        .set({ captionJson: JSON.stringify(깨끗한) })
        .where(eq(snsCut.id, cutId));
    }
    await db
      .update(snsContent)
      .set({
        verticalTitle: 값.verticalTitle,
        horizontalTitle: 값.horizontalTitle,
        captionYoutube: 값.captionYoutube,
        captionInstagram: 값.captionInstagram,
        hashtags: 값.hashtags,
        slotLabel: 값.slotLabel,
        updatedAt: new Date(),
      })
      .where(eq(snsContent.id, contentId));

    const 검사 = await 다시검사(contentId);
    await db.update(snsContent).set({ checkResult: 검사 }).where(eq(snsContent.id, contentId));
    revalidatePath(`/admin/sns/${contentId}`);
    revalidatePath("/admin/sns");
    return { ok: true, 검사 };
  } catch (e) {
    return { ok: false, 왜: e instanceof Error ? e.message : "저장하지 못했습니다." };
  }
}

/** 검토 완료 — 로컬이 이 상태를 보고 굽고 올린다. */
export async function approveContentAction(contentId: string): Promise<저장결과> {
  try {
    await 주인확인();
    const 검사 = await 다시검사(contentId);
    await db
      .update(snsContent)
      .set({ status: "approved", approvedAt: new Date(), checkResult: 검사 })
      .where(eq(snsContent.id, contentId));
    revalidatePath(`/admin/sns/${contentId}`);
    revalidatePath("/admin/sns");
    return { ok: true, 검사 };
  } catch (e) {
    return { ok: false, 왜: e instanceof Error ? e.message : "승인하지 못했습니다." };
  }
}

/** 검토 완료를 되돌린다 — 올리기 전에 마음이 바뀔 수 있다. */
export async function reopenContentAction(contentId: string): Promise<저장결과> {
  try {
    await 주인확인();
    await db
      .update(snsContent)
      .set({ status: "waiting", approvedAt: null })
      .where(eq(snsContent.id, contentId));
    revalidatePath(`/admin/sns/${contentId}`);
    revalidatePath("/admin/sns");
    return { ok: true, 검사: "" };
  } catch (e) {
    return { ok: false, 왜: e instanceof Error ? e.message : "되돌리지 못했습니다." };
  }
}
