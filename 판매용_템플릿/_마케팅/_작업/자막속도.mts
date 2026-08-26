/* 검수기에 든 «지금 자막»이 얼마나 빠른지 칸마다 잰다. 읽기만 한다.
 *
 *   npx tsx "판매용_템플릿/_마케팅/_작업/자막속도.mts" [회차조각]
 *
 * 왜 칸마다 보나 (2026-08-17)
 *   편 전체 평균이 4.9자/초여도, 어떤 칸은 7자/초일 수 있다. 사람은 «제일 빠른 칸»에서
 *   놓치고, 한 칸을 놓치면 그다음 칸도 못 따라간다. 평균은 그걸 못 보여준다.
 *
 * 기준 — 여행 편(우리 최고 성적, 유지율 40%): 칸당 2.99초 · 13.0자 · 초당 4.4자.
 */
import { config } from "dotenv";
import { eq, like } from "drizzle-orm";
config({ path: ".env.local" });
const { db } = await import("@/db/client");
const { snsContent, snsCut } = await import("@/db/schema");

const 조각 = process.argv[2] ?? "";
const 편들 = await db
  .select()
  .from(snsContent)
  .where(조각 ? like(snsContent.batch, `%${조각}%`) : undefined);

const 벗기기 = (s: string) => s.replace(/<[^>]*>/g, "");

for (const 편 of 편들) {
  const 칸들 = await db.select().from(snsCut).where(eq(snsCut.contentId, 편.id)).orderBy(snsCut.ord);
  if (!칸들.length) continue;
  const 칸초 = Number(편.secPerCard) || 2.9;
  console.log(`\n===== ${편.batch} · ${편.slug} =====`);
  console.log(`칸 ${칸들.length}개 × ${칸초}초 = ${(칸들.length * 칸초).toFixed(1)}초`);
  console.log("\n칸  글자  초당  자막");
  console.log("─".repeat(76));

  let 총글자 = 0;
  const 빠른: string[] = [];
  for (const c of 칸들) {
    const 줄들 = JSON.parse(c.captionJson || "[]") as string[];
    const n = 벗기기(줄들.join(" ")).replace(/\s/g, "").length;
    총글자 += n;
    const 초당 = +(n / 칸초).toFixed(1);
    const 표 = 초당 > 6.5 ? "❌" : 초당 > 5.5 ? "⚠ " : "  ";
    if (초당 > 5.5) 빠른.push(`${c.ord}번(${초당})`);
    console.log(
      `${String(c.ord).padStart(2)} ${String(n).padStart(4)} ${String(초당).padStart(5)}${표}${벗기기(줄들.join(" ")).slice(0, 40)}`,
    );
  }
  const 길이 = 칸들.length * 칸초;
  console.log("─".repeat(76));
  console.log(`평균  칸당 ${(총글자 / 칸들.length).toFixed(1)}자 · 초당 ${(총글자 / 길이).toFixed(1)}자 · 모두 ${총글자}자`);
  console.log("기준  칸당 13.0자 · 초당 4.4자 (여행 편, 유지율 40%)");
  if (빠른.length) console.log(`\n⚠ 초당 5.5자를 넘는 칸 — ${빠른.join(" · ")}`);
  else console.log("\n✅ 초당 5.5자를 넘는 칸이 없습니다.");
}
process.exit(0);
