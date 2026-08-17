/* SNS 콘텐츠 검수 — 한 편 보기·고치기. (2026-08-17 사장님 지시)
 *
 * 「컷별로 캡쳐를 해서 그 컷에 나올 자막 텍스트로 보여줘.」
 *
 * ⭐ 이 화면의 요점은 «나란히»다. 프레임 한 장과 그 칸 자막을 붙여 놓아야
 *   ① 화면이 잘렸나 ② 자막이 화면과 맞나 — 두 가지가 한눈에 잡힌다.
 *   2026-08-17 에 세 번 다시 올린 까닭이 바로 그 둘이었고, 검사기는 ②를 못 본다.
 */
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { snsContent, snsCut } from "@/db/schema";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";
import { countLetters } from "@/lib/sns-caption-rules";
import { SnsReviewForm } from "./review-form";

export const metadata = { title: "SNS 콘텐츠 검수 — 카페인컬러" };

export default async function SnsReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!isOwner(session?.user.email)) notFound();

  const { id } = await params;
  const [편] = await db.select().from(snsContent).where(eq(snsContent.id, id));
  if (!편) notFound();
  const 칸들 = await db.select().from(snsCut).where(eq(snsCut.contentId, id)).orderBy(snsCut.ord);

  const 글자수 = countLetters(칸들.map((c) => ({ cap: JSON.parse(c.captionJson || "[]") as string[] })));
  const 초 = (칸들.length * (Number(편.secPerCard) || 1.8)).toFixed(1);

  return (
    <SnsReviewForm
      편={{
        id: 편.id,
        batch: 편.batch,
        slug: 편.slug,
        status: 편.status,
        verticalTitle: 편.verticalTitle,
        horizontalTitle: 편.horizontalTitle,
        ep: 편.ep,
        music: 편.music,
        captionYoutube: 편.captionYoutube,
        captionInstagram: 편.captionInstagram,
        hashtags: 편.hashtags,
        slotLabel: 편.slotLabel,
        checkResult: 편.checkResult,
        youtubeVerticalId: 편.youtubeVerticalId,
        youtubeHorizontalId: 편.youtubeHorizontalId,
      }}
      칸들={칸들.map((c) => ({
        id: c.id,
        ord: c.ord,
        자막: JSON.parse(c.captionJson || "[]") as string[],
        frameDataUri: c.frameDataUri,
        pose: c.pose,
        clip: c.clip,
        ss: c.ss,
        zoom: c.zoom,
        screenNote: c.screenNote,
      }))}
      요약={{ 글자수, 초, 칸수: 칸들.length }}
    />
  );
}
