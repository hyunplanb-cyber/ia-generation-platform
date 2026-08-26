/* 검수 화면(`/admin/sns`)에 지금 무엇이 들어 있나. (2026-08-17)
 *
 *   npx tsx "판매용_템플릿/_마케팅/_작업/검수목록.mts"
 *
 * 왜 있나 — 「검수기에 내용이 안 보인다」는 말을 들었을 때 «화면 문제»인지
 *   «데이터 문제»인지 먼저 갈라야 한다. 로그인 벽 뒤라 눈으로 못 보니 여기서 센다.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const { db } = await import("@/db/client");
const { snsContent, snsCut } = await import("@/db/schema");

const 편들 = await db.select().from(snsContent);
const 칸들 = await db.select({ c: snsCut.contentId, f: snsCut.frameDataUri }).from(snsCut);

if (!편들.length) {
  console.log("\n비어 있습니다 — 검수보내기.mts 를 돌리세요.\n");
  process.exit(0);
}

console.log("");
for (const p of 편들) {
  const 내칸 = 칸들.filter((k) => k.c === p.id);
  const 그림 = 내칸.filter((k) => (k.f ?? "").startsWith("data:image")).length;
  console.log(`${p.batch}  ${p.slug}`);
  console.log(`  상태 ${p.status} · 칸 ${내칸.length} (프레임 ${그림})`);
  console.log(`  제목 ${p.verticalTitle.replaceAll("|", " ")}`);
  /* ⏭ 는 사유를 적고 넘어간 줄이라 걸림이 아니다 (2026-08-18) */
  const 줄들 = p.checkResult ? p.checkResult.split(String.fromCharCode(10)).filter(Boolean) : [];
  const 막힘 = 줄들.filter((l) => !l.startsWith("⏭")).length;
  const 넘김 = 줄들.length - 막힘;
  console.log(`  검사 ${막힘 ? 막힘 + "건 걸림" : "통과"}${넘김 ? ` (넘어감 ${넘김})` : ""}`);
  console.log(`  /admin/sns/${p.id}`);
  console.log("");
}
console.log(`합계 — 편 ${편들.length} · 칸 ${칸들.length}\n`);
process.exit(0);
