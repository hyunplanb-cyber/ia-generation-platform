/* 오늘 CSV 에 「고침」으로 적힌 팩이 «손님에게 갈 길» 위에 있는지 센다.
 *
 * 왜 있나 — 2026-08-19 에 검수 루틴 넷이 팩 10칸을 고쳐 놓고 대기 파일은 3칸만 남겼다.
 * 마무리 회차는 대기 파일만 보고 굽기 때문에, 나머지 7칸은 고친 것이 zip 에 안 실린다.
 * CSV 에 적는 것과 손님에게 내보내는 것은 다른 일이다.
 *
 * 「길 위에 있다」는 둘 중 하나다
 *   ① 검수/대기/<팩>.json 이 있다        — 아직 안 구워졌지만 마무리가 구울 것이다
 *   ② 검수/나간팩_<날짜>.json 에 들어 있다 — 이미 구워져 나갔다
 *
 * ⚠ ② 가 없으면 마무리가 끝난 «뒤에» 돌릴 때마다 빈 대기 폴더를 보고
 *   「다 빠졌다」고 잘못 알린다. 실제로 그랬다(2026-08-19).
 *
 *   node _작업/대기점검.mjs [날짜]      날짜 없으면 오늘
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { 쪼개, 오늘 } from "./검수표검사.mjs";   /* 따옴표 안의 쉼표까지 제대로 나눈다 */

/* ⛔ 날짜는 «한국 시각»으로 잡는다. UTC 로 잡으면 밤 0시~아침 9시에 어제를 찾아
 *   오늘 CSV 를 통째로 못 보고 「✓ 다 길 위에 있다」고 잘못 알린다 — 검수표검사.mjs 오늘() 참고 */
const 날짜 = process.argv[2] || 오늘();
const 팩이름 = /^[^_\s]+_(스탠다드|플러스|디럭스|프리미엄)$/;

/* ── 오늘 CSV 에서 「고침」인 팩 ── */
const 고친 = new Set();
const 파일들 = existsSync("검수")
  ? readdirSync("검수").filter((x) => x.startsWith(날짜 + "_pack-qa-") && x.endsWith(".csv"))
  : [];

for (const f of 파일들) {
  for (const l of readFileSync("검수/" + f, "utf8").split(/\r?\n/).slice(1).filter(Boolean)) {
    const c = 쪼개(l);
    if (c.length !== 7) continue;                  /* 모양이 틀린 줄은 검수표검사.mjs 가 잡는다 */
    if (!c[6].trim().startsWith("고침")) continue;
    /* 한 줄이 여러 팩을 말할 수 있다 */
    for (const 팩 of c[2].split(",").map((x) => x.trim())) {
      if (팩이름.test(팩)) 고친.add(팩);
    }
  }
}

/* ── ① 아직 대기 중 ── */
const 대기 = new Set(
  existsSync("검수/대기")
    ? readdirSync("검수/대기").filter((x) => x.endsWith(".json")).map((x) => x.slice(0, -5))
    : []
);

/* ── ② 이미 나갔다 ── */
const 나감 = new Set();
if (existsSync("검수")) {
  for (const f of readdirSync("검수").filter((x) => /^나간팩_\d{4}-\d{2}-\d{2}\.json$/.test(x))) {
    try {
      for (const p of JSON.parse(readFileSync("검수/" + f, "utf8")).나간팩 || []) 나감.add(p);
    } catch { /* 깨진 기록은 없는 셈 친다 */ }
  }
}

const 빠짐 = [...고친].filter((p) => !대기.has(p) && !나감.has(p)).sort();

console.log(
  `${날짜} — CSV ${파일들.length}개 · 고친 팩 ${고친.size} · 대기 ${대기.size}칸 · 나감 ${나감.size}칸`
);
if (빠짐.length) {
  console.log("⛔ 고쳤는데 대기에도 없고 나가지도 않은 팩 — 이대로면 옛 zip 이 나간다:");
  빠짐.forEach((p) => console.log("   · " + p));
  process.exit(1);
}
console.log("✓ 고친 팩이 모두 길 위에 있다");
