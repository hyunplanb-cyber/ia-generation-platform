/* 로컬의 «상단 띠·커버 글»을 검수 화면으로 올린다. `글가져오기.mts` 의 반대쪽. (2026-08-17)
 *
 *   npx tsx "판매용_템플릿/_마케팅/_작업/글보내기.mts" <대본.json> <인트로설정.json> <회차> <이름>
 *
 * 왜 따로 두나
 *   `검수보내기 --자막만` 은 사장님이 쓰신 글을 «일부러» 안 건드린다. 그게 기본이라야 한다 —
 *   2026-08-17 에 덮어써서 통째로 잃은 적이 있다.
 *   그런데 사장님이 대화로 「커버는 이렇게 해줘」 하고 정해 주시는 자리가 있다.
 *   그때만 이 도구로 올린다. **글을 덮어쓰는 일은 이 파일 하나에만 있다.**
 *
 * ⚠ 자막·캡션은 안 건드린다. 상단 띠(세로·가로)와 커버 글만 올린다.
 */
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
config({ path: ".env.local" });
const { db } = await import("@/db/client");
const { snsContent } = await import("@/db/schema");

const [, , 대본길, 인트로길, 회차, 이름] = process.argv;
if (!대본길 || !인트로길 || !회차 || !이름) {
  console.error("쓰는 법: npx tsx 글보내기.mts <대본.json> <인트로설정.json> <회차> <이름>");
  process.exit(2);
}

const 짝 = (JSON.parse(readFileSync(대본길, "utf8")) as { 이름?: string; 세로제목?: string; 가로제목?: string }[])
  .find((p) => p.이름 === 이름);
const 인짝 = (JSON.parse(readFileSync(인트로길, "utf8")) as { 이름?: string; title?: string; cap?: string; ep?: string }[])
  .find((s) => s.이름 === 이름);
if (!짝) { console.error(`대본에 「${이름}」 이 없습니다.`); process.exit(1); }

const [편] = await db
  .select({ id: snsContent.id })
  .from(snsContent)
  .where(and(eq(snsContent.batch, 회차), eq(snsContent.slug, 이름)));
if (!편) { console.error(`검수기에 ${회차} · ${이름} 이 없습니다.`); process.exit(1); }

await db
  .update(snsContent)
  .set({
    verticalTitle: 짝.세로제목 ?? "",
    horizontalTitle: 짝.가로제목 ?? "",
    ...(인짝?.title ? { coverTitle: 인짝.title } : {}),
    ...(인짝?.cap != null ? { coverSub: 인짝.cap } : {}),
    ...(인짝?.ep ? { ep: 인짝.ep } : {}),
    updatedAt: new Date(),
  })
  .where(eq(snsContent.id, 편.id));

const 보기 = (s: string) => s.replaceAll("|", " / ");
console.log("로컬 → 검수기로 올렸습니다. (자막·캡션은 안 건드렸습니다)");
console.log(`  상단 띠(세로) 「${보기(짝.세로제목 ?? "")}」`);
console.log(`  상단 띠(가로) 「${보기(짝.가로제목 ?? "")}」`);
if (인짝?.title) console.log(`  커버 카피     「${보기(인짝.title)}」`);
process.exit(0);
