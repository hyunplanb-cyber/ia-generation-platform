// 진단 화면에 나가는 «모든 글»을 한자리에 펴 놓고, 사고 날 만한 것을 잡는다.
//
// ── 왜 만들었나 ─────────────────────────────────────────
// 2026-08-31·09-01 에 «같은 실수를 두 번» 했다.
//   ① 처방 예시에 「기본 상담은 무료이고, 시술 비용은 30만원부터입니다」
//   ② 고쳐 놓고 두 항목 뒤에 또 「고도 난시 99% 개선 (2016년 아시아·태평양 심포지엄 발표)」
// 둘 다 «특정 손님 사이트»를 보면서 문구를 다듬다가 그 내용이 그대로 박힌 것이고,
// 다른 업종 손님 화면에 떠서 「왜 남의 내용이 나오죠?」가 됐다.
//
// 타입검사도 빌드도 이걸 못 잡는다. 문법은 멀쩡하고 화면도 잘 뜨기 때문이다.
// 사람이 눈으로 봐야 잡히는데, 사람은 «다 만든 뒤 다시 안 읽는다». 그래서 기계에 맡긴다.
//
// 쓰는 법:  npx tsx 검수-진단문구.mts
//          문제가 있으면 1 로 끝난다.

import { CRITERIA, EXCLUDED, SOURCES, axisMax } from "./lib/diagnose/criteria";
import { fixFor, type FixContext } from "./lib/diagnose/fixes";
import { AXIS_LABEL, AXIS_WEIGHT, CRITERIA_VERSION } from "./lib/diagnose/types";

let 탈 = 0;
const 문제 = (m: string) => { console.log(`  ❌ ${m}`); 탈++; };
const 좋음 = (m: string) => console.log(`  ✓ ${m}`);

console.log(`\n═══ 진단 문구 검수 · ${CRITERIA_VERSION} ═══\n`);

// ── ① 손님 화면에 «특정 손님 내용»이 박혀 있나 ──────────────
//
// 판정 방법: 처방 예시(snippet)에 한글이 들어 있으면 «채워 넣을 자리» 표시가 반드시 있어야 한다.
// 표시가 없는 한글 문장은 「누군가의 실제 내용」일 가능성이 높다.
const 자리표시 = ["여기에", "OO", "○○", "회사 이름", "말한 사람", "기준"];

// 어느 사이트에 대해서도 같은 문구가 나와야 하므로, 가짜 사이트 두 곳으로 뽑아 견준다.
function ctxFor(host: string): FixContext {
  return {
    url: new URL(`https://${host}/page`),
    robotsBody: "User-agent: *\nDisallow: /",
    blockedBots: ["ChatGPT 학습"],
    titleLen: 5, descLen: 5,
    internal: 0, external: 0, subs: 3, questions: 0,
    textLength: 120, jsOnly: true, robotPreview: "로딩 중...",
    noindexWhere: "meta", ms: 4000, hops: 3,
    framework: "Next.js", today: "2026-09-01",
    quotes: 0, stats: 0, citeTags: 0, stuffWord: "테스트", stuffRatio: 0.09,
    pairs: 2, goodPairs: 0, tables: 1, goodTables: 0, definitions: 0,
    imgTotal: 5, imgAlt: 1,
  };
}

console.log("① 처방 문구에 «특정 손님 내용»이 박혀 있나");
const A = ctxFor("apple-shop.co.kr");
const B = ctxFor("banana-clinic.kr");

for (const c of CRITERIA) {
  const fa = fixFor(c.id, A);
  const fb = fixFor(c.id, B);
  if (!fa || !fb) continue;

  // (1) 사이트가 달라지면 «주소·날짜만» 달라져야 한다. 그 밖의 문장이 다르면 뭔가 샌 것이다.
  const 지우기 = (s: string, host: string) =>
    s.replaceAll(host, "«주소»").replaceAll(`https://${host}/page`, "«주소»");
  if (지우기(fa.how, "apple-shop.co.kr") !== 지우기(fb.how, "banana-clinic.kr")) {
    문제(`${c.label} — 고치는 법이 사이트마다 다릅니다(주소 말고 다른 것이 섞였습니다)`);
  }

  // (2) 한글이 든 예시에는 «채워 넣을 자리» 표시가 있어야 한다.
  if (fa.snippet && /[가-힣]/.test(fa.snippet)) {
    if (!자리표시.some((p) => fa.snippet!.includes(p))) {
      문제(`${c.label} — 예시에 채울 자리 표시가 없습니다. 남의 실제 내용일 수 있습니다:\n       ${fa.snippet.replace(/\n/g, " ").slice(0, 90)}`);
    }
  }
}
if (!탈) 좋음(`처방 ${CRITERIA.length}개 — 특정 손님 내용 없음, 사이트가 달라도 같은 문구`);

// ── ② 배점이 «근거»에 매여 있나 ───────────────────────────
console.log("\n② 배점마다 근거가 달려 있나");
const 근거없음 = CRITERIA.filter((c) => !SOURCES[c.source]);
if (근거없음.length) 문제(`근거를 못 찾는 항목: ${근거없음.map((c) => c.label).join(", ")}`);
else 좋음(`항목 ${CRITERIA.length}개 모두 근거가 달려 있음`);

const 자체판단 = CRITERIA.filter((c) => c.source === "ours");
const 자체점수 = 자체판단.reduce((s, c) => s + c.max, 0);
console.log(`     · 바깥 근거 ${CRITERIA.length - 자체판단.length}개 · 우리 판단 ${자체판단.length}개(${자체점수}점)`);
if (자체점수 > 120) 문제(`우리 판단이 ${자체점수}점입니다. 절반을 넘으면 「근거 기반」이라 말하기 어렵습니다`);

// ── ③ 축 만점이 100 인가 ────────────────────────────────
console.log("\n③ 축 만점과 비중");
for (const ax of ["seo", "aeo", "geo"] as const) {
  const m = axisMax(ax);
  if (m !== 100) 문제(`${AXIS_LABEL[ax]} 만점이 ${m}점입니다(100이어야 합니다)`);
}
const 비중합 = Object.values(AXIS_WEIGHT).reduce((a, b) => a + b, 0);
if (Math.abs(비중합 - 1) > 0.001) 문제(`비중 합이 ${비중합} 입니다(1 이어야 합니다)`);
if (!탈) 좋음("축마다 100점 · 비중 합 1");

// ── ④ 「뺀 항목」이 배점표와 겹치지 않나 ────────────────────
console.log("\n④ 뺀 항목이 배점표에 다시 들어와 있지 않나");
const 이름들 = new Set(CRITERIA.map((c) => c.label));
const 겹침 = EXCLUDED.filter((e) => 이름들.has(e.label));
if (겹침.length) 문제(`뺐다고 적어 놓고 배점에 있는 것: ${겹침.map((e) => e.label).join(", ")}`);
else 좋음(`뺀 항목 ${EXCLUDED.length}개 — 배점표와 겹치지 않음`);

// ── ⑤ 손님이 읽을 글 전부 펴 보기 ──────────────────────────
console.log("\n⑤ 손님 화면에 나가는 글 (눈으로 한 번 읽으세요)");
for (const c of CRITERIA) {
  console.log(`\n  [${AXIS_LABEL[c.axis]}] ${c.label} ${c.max}점  ← ${c.source}`);
  console.log(`     왜   ${c.why}`);
  console.log(`     재는법 ${c.how}`);
  const f = fixFor(c.id, A);
  if (f?.snippet) console.log(`     예시 ${f.snippet.replace(/\n/g, " ⏎ ")}`);
}

console.log(`\n${"═".repeat(50)}`);
if (탈) { console.log(`  ❌ ${탈}건을 고쳐야 합니다.\n`); process.exit(1); }
console.log("  ✓ 모두 통과했습니다.\n");
