/* 검수기에서 편을 지운다.  npx tsx _지우기.mts <slug> [slug...] */
import { config } from "dotenv";
config({ path: ".env.local" });
import { eq, inArray } from "drizzle-orm";

const { db } = await import("@/db/client");
const { snsContent, snsCut } = await import("@/db/schema");

const 지울것 = process.argv.slice(2);
if (!지울것.length) { console.error("쓰는 법: _지우기.mts <slug> [slug...]"); process.exit(2); }

const 편들 = await db.select().from(snsContent);
for (const slug of 지울것) {
  const p = 편들.find((x) => x.slug === slug);
  if (!p) { console.log(`  ○ ${slug} — 없습니다`); continue; }
  if (p.status === "published") { console.log(`  ⛔ ${slug} — 이미 나간 편이라 안 지웁니다`); continue; }
  const n = await db.delete(snsCut).where(eq(snsCut.contentId, p.id));
  await db.delete(snsContent).where(eq(snsContent.id, p.id));
  console.log(`  ✓ ${slug} (${p.batch}) — 지웠습니다`);
}
