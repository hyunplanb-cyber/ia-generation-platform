/* 검수기에 든 캡션을 그대로 찍어 본다 — 규칙에 걸리는지까지. (2026-08-17)
 *   npx tsx "판매용_템플릿/_마케팅/_작업/캡션보기.mts" [slug]
 */
import { config } from "dotenv";
config({ path: ".env.local" });
const { db } = await import("@/db/client");
const { snsContent } = await import("@/db/schema");
const { checkCaption } = await import("@/lib/sns-caption-rules");

const 고른것 = process.argv[2];
for (const p of await db.select().from(snsContent)) {
  if (고른것 && p.slug !== 고른것) continue;
  console.log(`\n===== ${p.batch} · ${p.slug} =====`);
  console.log("[유튜브 설명]\n" + p.captionYoutube);
  console.log("\n[인스타]\n" + p.captionInstagram);
  const 걸림 = [
    ...checkCaption(p.captionYoutube, "유튜브"),
    ...checkCaption(p.captionInstagram, "인스타"),
  ];
  console.log(
    걸림.length
      ? "\n❌ " + 걸림.map((g) => `[${g.어디}] ${g.무엇}`).join("\n❌ ")
      : "\n✅ 캡션 규칙 통과",
  );
}
process.exit(0);
