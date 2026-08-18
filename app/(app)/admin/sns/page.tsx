/* SNS 콘텐츠 검수 — 목록. (2026-08-17 사장님 지시)
 *
 * 「루틴에 맞춰서 콘텐츠 작업해서 검수하는 사이트를 만들자. …
 *   로컬에만 말고 내 아이디만 볼 수 있게 열어줘 — 로컬이 자꾸 막히니까.」
 *
 * 그래서 «따로 띄우는 서버»가 아니라 우리 사이트 안에 둔다. `isOwner()` 로 막으니
 * 사장님 구글 로그인만 보이고, 끌 서버가 없어서 막힐 일도 없고, **폰에서도 검수**할 수 있다.
 */
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { snsContent, snsCut } from "@/db/schema";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";
import { SnsListRow } from "./list-row";

export const metadata = { title: "SNS 콘텐츠 검수 — 카페인컬러" };

export default async function SnsReviewListPage() {
  const session = await getSession();
  /* 주인이 아니면 «없는 페이지»로 둔다 — 「권한이 없습니다」는 여기 뭐가 있다고 알려 준다. */
  if (!isOwner(session?.user.email)) notFound();

  const 목록 = await db.select().from(snsContent).orderBy(desc(snsContent.createdAt));
  const 칸수 = new Map<string, number>();
  if (목록.length) {
    for (const c of await db.select({ id: snsCut.contentId }).from(snsCut)) {
      칸수.set(c.id, (칸수.get(c.id) ?? 0) + 1);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">SNS 콘텐츠 검수</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
        루틴이 만들어 둔 것을 여기서 보고 고칩니다. 칸마다 <b className="text-foreground">실제로 나갈 화면</b>과
        그 칸 자막이 나란히 있어요. <b className="text-foreground">검토 완료</b>를 누르면 그것만 영상으로 구워
        유튜브(비공개)와 구글 드라이브에 올립니다.
      </p>

      {!목록.length ? (
        <div className="mt-10 rounded-xl border border-border bg-surface p-8 text-center">
          <p className="font-semibold text-foreground">아직 올라온 것이 없습니다.</p>
          <p className="mt-2 text-sm text-muted-foreground [word-break:keep-all]">
            월요일 루틴이 대본을 만들고 영상을 구운 뒤 여기에 넣습니다.
          </p>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {목록.map((c) => (
            <SnsListRow
              key={c.id}
              편={{
                id: c.id, batch: c.batch, slug: c.slug, status: c.status,
                verticalTitle: c.verticalTitle, ep: c.ep, slotLabel: c.slotLabel,
                checkResult: c.checkResult, youtubeVerticalId: c.youtubeVerticalId,
              }}
              칸수={칸수.get(c.id) ?? 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
