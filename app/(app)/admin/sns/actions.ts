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
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { snsContent, snsCut } from "@/db/schema";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";
import { checkScript, checkCaption, type 대본, type 대본칸 } from "@/lib/sns-caption-rules";

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
    커버제목: 편.coverTitle,
    칸초: Number(편.secPerCard) || 1.8,
    길이예외: 편.lengthExempt || undefined,
    칸들: 칸들.map((c): 대본칸 => ({
      cap: JSON.parse(c.captionJson || "[]") as string[],
      pose: c.pose || undefined,
      /* 컷 정보는 굽기 쪽 값이라 여기서 고치지 않는다 — 검사가 볼 수 있게만 넘긴다. */
      shots: c.clip
        ? [{ clip: c.clip, ss: Number(c.ss) || 0, zoom: c.zoom === "" ? undefined : Number(c.zoom) }]
        : [],
    })),
  };
  /* 자막만 보면 안 된다 — 같은 이야기가 캡션에도 적혀 있다.
     2026-08-17 에 자막에서 지운 말이 유튜브 설명에 그대로 남아 있었다. */
  const 걸림 = [
    ...checkScript(대본),
    ...checkCaption(편.captionYoutube, "유튜브 설명"),
    ...checkCaption(편.captionInstagram, "인스타 캡션"),
  ];
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
    /** 커버(맨 앞 2초 표지) 글. 상단 띠와 따로 둔다 — 2초 안에 읽혀야 해서 더 짧다. */
    coverTitle: string;
    coverSub: string;
    ep: string;
    captionYoutube: string;
    captionInstagram: string;
    hashtags: string;
    slotLabel: string;
    /** ⭐ **칸 번호(ord)** → 자막 줄 배열. 빈 줄은 버린다.
     *
     * ⚠ 전에는 «칸 row id» 로 받았는데, 로컬이 다시 보낼 때 칸을 지우고 새로 넣어서
     *   id 가 통째로 바뀐다. 그러면 화면이 들고 있던 id 는 없는 id 가 되고,
     *   `update … where id = <옛 id>` 가 **아무 줄도 안 고치고 조용히 성공**한다.
     *   2026-08-17 에 사장님이 자막을 다 고쳐 넣으셨는데 그대로 사라졌다.
     *   ord 는 1..N 이라 다시 보내도 안 바뀐다. 열쇠는 «안 바뀌는 것»이어야 한다. */
    자막: Record<string, string[]>;
  },
): Promise<저장결과> {
  try {
    await 주인확인();
    /* 몇 줄이 실제로 바뀌었는지 «세어서» 확인한다. 0 이면 조용히 넘어가지 않고 알린다. */
    const 지금칸들 = await db
      .select({ id: snsCut.id, ord: snsCut.ord })
      .from(snsCut)
      .where(eq(snsCut.contentId, contentId));
    const ord로찾기 = new Map(지금칸들.map((c) => [String(c.ord), c.id]));
    const 못찾은: string[] = [];
    for (const [ord, 줄들] of Object.entries(값.자막)) {
      const cutId = ord로찾기.get(ord);
      if (!cutId) { 못찾은.push(ord); continue; }
      const 깨끗한 = 줄들.map((s) => s.trim()).filter(Boolean);
      await db
        .update(snsCut)
        .set({ captionJson: JSON.stringify(깨끗한) })
        .where(and(eq(snsCut.id, cutId), eq(snsCut.contentId, contentId)));
    }
    if (못찾은.length)
      return {
        ok: false,
        왜: `${못찾은.join("·")}번 칸을 못 찾아 자막을 저장하지 못했습니다. 그 사이에 칸 수가 바뀐 것 같습니다 — 지금 쓰신 글을 복사해 두고 새로고침한 뒤 다시 넣어 주세요.`,
      };
    await db
      .update(snsContent)
      .set({
        verticalTitle: 값.verticalTitle,
        horizontalTitle: 값.horizontalTitle,
        coverTitle: 값.coverTitle,
        coverSub: 값.coverSub,
        ep: 값.ep,
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

/** ⭐ 최종 완료 — 여기서부터가 «바깥»이다. 지킴이가 이것만 집어 유튜브·드라이브로 보낸다.
 *  (2026-08-18 사장님 흐름: 검토완료는 다시 굽기까지, 최종완료라야 올린다) */
export async function finalizeContentAction(contentId: string): Promise<저장결과> {
  try {
    await 주인확인();
    const 검사 = await 다시검사(contentId);
    await db
      .update(snsContent)
      .set({ status: "final", approvedAt: new Date(), checkResult: 검사 })
      .where(eq(snsContent.id, contentId));
    revalidatePath(`/admin/sns/${contentId}`);
    revalidatePath("/admin/sns");
    return { ok: true, 검사 };
  } catch (e) {
    return { ok: false, 왜: e instanceof Error ? e.message : "최종 완료로 두지 못했습니다." };
  }
}

/** ⚠ 지운다 — «되돌릴 수 없다». 칸(sns_cut)은 스키마의 cascade 로 같이 지워진다.
 *  이미 유튜브에 올린 것은 여기서 지워도 유튜브에는 그대로 남는다. 그건 스튜디오에서 지우신다. */
export async function deleteContentAction(contentId: string): Promise<저장결과> {
  try {
    await 주인확인();
    const [편] = await db
      .select({ id: snsContent.id })
      .from(snsContent)
      .where(eq(snsContent.id, contentId));
    if (!편) return { ok: false, 왜: "그 편이 이미 없습니다." };
    await db.delete(snsContent).where(eq(snsContent.id, contentId));
    revalidatePath("/admin/sns");
    return { ok: true, 검사: "" };
  } catch (e) {
    return { ok: false, 왜: e instanceof Error ? e.message : "지우지 못했습니다." };
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
