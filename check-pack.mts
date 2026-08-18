/* 「우리가 아는 규칙이 손님 팩에 실제로 나가는가」를 센다.
 *
 *   npx tsx check-pack.mts
 *
 * ── 왜 만들었나 (2026-08-18) ──────────────────────────────────────────
 * 사흘 동안 사장님이 세 번 사이트를 만들어 보시며 결함 여섯 개를 찾았다.
 * 되짚어 보니 그중 **넷이 같은 모양**이었다 —
 *
 *   · `acts` 칸을 만들어 놓고 채우는 곳을 안 만들었다 (146개 화면 전부 빈칸)
 *   · 검수 시나리오의 «올바른 생성기»가 있는데 손님 내려받기가 안 불렀다
 *   · 「줄어드는 지점은 두 곳만」이 코드 주석에만 있고 팩엔 안 나갔다
 *   · 「읽기 폭은 한 값만」은 시켰는데 «확인할 칸»이 없었다
 *
 * 전부 «우리가 이미 아는 것이 손님에게 안 가는» 모양이다. 사람이 눈으로 찾으면
 * 또 놓친다. 그래서 판을 뒤집는다 — **팩을 실제로 뽑아 놓고, 우리가 아는 값이
 * 그 안에 있는지 센다.** 없으면 빨간 줄이 뜬다.
 *
 * check-presets.mts 가 「글과 코드가 같은 말을 하나」를 본다면,
 * 이것은 「코드가 아는 것이 손님에게 가나」를 본다. 짝이다.
 * ─────────────────────────────────────────────────────────────────── */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { config } from "dotenv";
import { desc } from "drizzle-orm";
import * as XLSX from "xlsx";
config({ path: ".env.local" });

import {
  CONTENT_WIDTH, READING_WIDTH, BREAKPOINTS, GRID_GAP,
  NARROW_OVERFLOW, SINGLE_SOURCE_DATA, IMAGE_PLACEHOLDER,
  parsePresetConfig, buildDetailedPresetMarkdown, DESIGN_OPTIONS, LAYOUTS,
} from "./lib/design-presets";
import { buildSpecPackMarkdown, buildSpecPackModel } from "./lib/export/spec-pack";
import { buildPresetPack } from "./lib/preset-pack";
import { buildTemplateVerifySheets } from "./lib/export/template-verify";

let 어긋남 = 0;
const 나쁨 = (이름: string, 왜: string) => { 어긋남++; console.log(`✗ ${이름}\n    ${왜}`); };
const 좋음 = (이름: string, 값 = "") => console.log(`· ${이름}${값 ? "  " + 값 : ""}`);

/* ── 손님 팩을 «실제로» 뽑는다 — 내려받기와 같은 함수로 ───────────── */
/* ⚠ DB 없이도 돌아야 한다 — CI 에는 DB 가 없다. 되면 실제 프로젝트로, 안 되면
   판매팩 자료(template-data-beauty)로 돈다. ①·①-2·③·④·⑤ 는 «규칙이 팩에 나가나»를
   보는 것이라 어느 자료로 돌든 답이 같다. ②(빈 칸)만 실제 프로젝트라야 뜻이 있다. */
/* eslint-disable @typescript-eslint/no-explicit-any */
let 대상: any, menus: any[], screens: any[], acts: any[];
let 실제자료 = true;
try {
  const { db } = await import("./db/client");
  const { project } = await import("./db/schema");
  const { drizzleMenuRepository } = await import("./adapters/repository/drizzle/menu-repository");
  const { drizzleScreenRepository } = await import("./adapters/repository/drizzle/screen-repository");
  const { drizzleButtonActionRepository } = await import("./adapters/repository/drizzle/button-action-repository");
  const 찾을말 = process.argv[2] ?? "펫 유치원";
  const 편들 = await db.select().from(project).orderBy(desc(project.createdAt)).limit(40);
  const 고름 = 편들.find((p: { concept: string | null }) => String(p.concept ?? "").includes(찾을말)) ?? 편들[0];
  if (!고름) throw new Error("프로젝트 없음");
  대상 = 고름 as never;
  menus = await drizzleMenuRepository.listByProject(고름.id);
  screens = (await drizzleScreenRepository.listByProject(고름.id)).filter((s: { status: string }) => s.status === "active");
  acts = await drizzleButtonActionRepository.listByProject(고름.id);
} catch {
  실제자료 = false;
  const { BEAUTY } = await import("./template-data-beauty");
  대상 = { ...BEAUTY.project, id: "fixture", presetConfig: null, designConcept: BEAUTY.project.designConcept } as never;
  menus = BEAUTY.menus.map((m, i) => ({ id: `m${i}`, menuCode: m.code, nameKo: m.nameKo, nameEn: m.nameEn, sortOrder: i }));
  screens = BEAUTY.menus.flatMap((m, i) => (m.screens ?? []).map((x: any, j: number) => ({
    id: `s${i}_${j}`, menuId: `m${i}`, pageId: String(x.ref).toUpperCase(), pageName: String(x.name),
    screenGroup: null, funcDef: String(x.func ?? ""), prompt: String(x.prompt ?? ""),
    screenRole: String(x.role ?? ""), status: "active", sortOrder: j,
  })));
  acts = [];
  console.log("⚠ DB 없이 돕니다 — 판매팩 자료(뷰티샵)로 규칙만 봅니다.");
  console.log("");
}

const md = buildSpecPackMarkdown(대상 as never, menus as never, screens as never, acts as never);
const model = buildSpecPackModel(대상 as never, menus as never, screens as never, acts as never);
const 이름 = new Map(menus.map((m: any) => [m.id, m.nameKo] as const));
const 제목 = String(대상.concept).split(String.fromCharCode(10))[0];
const 검수 = buildTemplateVerifySheets(제목, screens.map((s: any) => ({
  pageId: s.pageId, pageName: s.pageName,
  menuName: 이름.get(s.menuId) ?? "",
  funcDef: s.funcDef ?? "", role: s.screenRole ?? "",
})));
const cfg = parsePresetConfig(대상.presetConfig!, 대상.designConcept ?? null);
const 채우기 = (고른: (string | undefined)[], 모두: string[], 몇: number) =>
  [...new Set([...(고른.filter(Boolean) as string[]), ...모두])].slice(0, 몇);
const 프리셋글 = buildPresetPack({
  styles: 채우기([cfg.style, cfg.styleB], DESIGN_OPTIONS.map((d) => d.key), 3),
  layouts: 채우기([cfg.layout], LAYOUTS.map((l) => l.key), 2),
}).map((p) => p.text).join("\n") + buildDetailedPresetMarkdown(cfg, String(대상.concept));
const 손님글 = md + "\n" + 프리셋글;

console.log(`검사 대상: ${String(대상.concept).replace(/\s+/g, " ").slice(0, 40)} · 화면 ${screens.length}개\n`);

/* ── ① 우리가 정한 «값»이 손님 글에 나오나 ─────────────────────────
 * 코드 상수에만 있고 팩에 안 나가면, 만드는 쪽은 그 값을 지어낸다.
 * 실제로 「줄어드는 지점」이 그랬다 — 주석에만 있어서 520·560·860 이 나왔다. */
console.log("① 우리가 정한 값이 손님 글에 나오는가");
const 값들: [string, string][] = [
  ["콘텐츠 폭", CONTENT_WIDTH.max], ["콘텐츠 좌우 여백", CONTENT_WIDTH.padX],
  ["읽기 폭", `${READING_WIDTH}px`],
  ["줄어드는 지점(태블릿 가로)", `${BREAKPOINTS.mid}`], ["줄어드는 지점(세로)", `${BREAKPOINTS.narrow}`],
  ["폰 좌우 여백", BREAKPOINTS.padXNarrow],
  ["칸 사이 가로", `${GRID_GAP.x}`], ["칸 사이 세로", `${GRID_GAP.y}`],
  ["폰 폭 시험값", `${NARROW_OVERFLOW.testWidth}`],
  ["자리표시자 색", IMAGE_PLACEHOLDER.tones[0]], ["자리표시자 테두리", IMAGE_PLACEHOLDER.border],
];
for (const [이름표, 값] of 값들) {
  손님글.includes(값) ? 좋음(이름표, 값) : 나쁨(이름표, `코드엔 ${값} 인데 손님 글 어디에도 안 나옵니다 — 만드는 쪽이 지어냅니다`);
}

/* ── ①-2 «규칙 문장»이 손님 글에 있나 ────────────────────────────
 * ⛔ 값(숫자)만 세면 약하다. 2026-08-18 에 스스로 시험해 보다 알았다 —
 *   「줄어드는 지점 — 두 곳만」 절을 통째로 지워도, 1024·720 이 CSS 예시에
 *   남아 있어서 ① 이 통과했다. 손님이 읽는 것은 숫자가 아니라 **문장**이다.
 *   그래서 규칙마다 «그 규칙에만 있는 말»을 하나씩 걸어 둔다. */
console.log("");
console.log("①-2 규칙 문장이 손님 글에 있는가");
const 문장들: [string, string][] = [
  ["줄어드는 지점은 두 곳만", "두 곳만 씁니다"],
  ["읽기 폭은 한 값만", "이 값 하나만 씁니다"],
  ["좁은 화면에서 넘치지 않게", "좁은 화면에서 넘치지 않게"],
  ["바꿀 값은 한 곳에", "바꿀 값은 한 곳에"],
  ["만들고 나서 눌러 보기", "만들고 나서 — 눌러 보기"],
  ["사진 없을 때 어둠막", "어둠막을 걸지 않는다"],
  ["화면 목록이 첫 화면", "홈 화면이 아닙니다"],
  ["거르는 단추는 목록이 줄어야", "목록이 실제로 줄어야"],
];
for (const [이름표, 말] of 문장들) {
  손님글.includes(말) ? 좋음(이름표) : 나쁨(이름표, `「${말}」 이 손님 글에 없습니다 — 규칙을 지웠거나 문장이 바뀌었습니다`);
}

/* ── ② 모델에 «만들어만 두고 안 채운 칸»이 있나 ────────────────────
 * `acts` 가 그랬다. 칸이 있으면 있는 줄 알고 아무도 다시 안 본다. */
console.log("\n② 화면 칸 중 «전부 빈» 것이 있나");
const 칸들 = 실제자료 ? Object.keys(model.screens[0] ?? {}) : [];
for (const 칸 of 칸들) {
  const 찬것 = model.screens.filter((s: any) => {
    const v = s[칸];
    return Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== "";
  }).length;
  찬것 === 0
    ? 나쁨(`화면 칸 「${칸}」`, `${model.screens.length}개 화면 전부 비어 있습니다 — 채우는 곳이 없거나 죽은 칸입니다`)
    : 좋음(`화면 칸 「${칸}」`, `${찬것}/${model.screens.length}`);
}

/* ── ③ 시킨 것 ↔ 보는 것 (지침 원칙 3-2) ──────────────────────────
 * 「가이드에 규칙을 더하면 여기에도 확인 항목을 더한다 — 시킨 것과 보는 것이 같아야 한다.」
 * 한쪽만 고치면 지시는 했는데 확인할 칸이 없는 상태가 된다. */
console.log("\n③ 시킨 것마다 «확인할 칸»이 있나");
const 검수글 = 검수.scenarios.map((r) => Object.values(r).join(" ")).join("\n");
const 짝: [string, string][] = [
  ["좁은 화면에서 넘치지 않게", "가로 스크롤"],
  ["거르는 단추", "거르는 단추"],
  ["바꿀 값은 한 곳에", "가게 정보"],
  ["읽기 폭", "읽기 폭"],
  ["줄어드는 지점", "줄어드는 지점"],
  ["뒤로가기", "뒤로가기"],
  ["전체 화면 목록", "전체 화면 목록"],
  ["이미지 자리", "이미지 자리"],
  ["눌러도", "눌러도 반응 없는"],
];
for (const [시킨것, 볼것] of 짝) {
  const 시켰나 = 손님글.includes(시킨것);
  const 보나 = 검수글.includes(볼것);
  if (시켰나 && !보나) 나쁨(`「${시킨것}」`, `팩은 시키는데 검수 시나리오에 «확인할 칸»이 없습니다`);
  else if (!시켰나 && 보나) 나쁨(`「${볼것}」`, `검수표는 보라는데 팩이 시키지 않습니다`);
  else 좋음(`「${시킨것}」`, 시켰나 ? "시킴 + 확인 칸 있음" : "둘 다 없음");
}

/* ── ④ 검수 시나리오가 «점검표» 꼴인가 ────────────────────────────
 * 기대 결과가 없으면 PASS/FAIL 을 못 고른다 — 지침 원칙 3. */
console.log("\n④ 검수 시나리오가 점검표 꼴인가");
const 필수칸 = ["테스트ID", "메뉴", "화면", "화면ID", "확인 항목", "확인 방법", "기대 결과"];
const 있는칸 = Object.keys(검수.scenarios[0] ?? {});
for (const 칸 of 필수칸) {
  if (!있는칸.includes(칸)) { 나쁨(`검수 칸 「${칸}」`, "칸 자체가 없습니다"); continue; }
  const 찬것 = 검수.scenarios.filter((r) => String(r[칸] ?? "").trim()).length;
  if (칸 === "확인 항목" || 칸 === "확인 방법" || 칸 === "기대 결과") {
    찬것 === 검수.scenarios.length ? 좋음(`검수 칸 「${칸}」`, `${찬것}/${검수.scenarios.length}`)
      : 나쁨(`검수 칸 「${칸}」`, `${검수.scenarios.length}줄 중 ${찬것}줄만 채워졌습니다`);
  } else 좋음(`검수 칸 「${칸}」`, `${찬것}/${검수.scenarios.length}`);
}
const 공통 = 검수.scenarios.filter((r) => r.테스트ID === "SCN-000").length;
공통 > 0 ? 좋음("공통 점검(SCN-000)", `${공통}줄`) : 나쁨("공통 점검(SCN-000)", "한 줄도 없습니다 — 화면별 항목만으로는 공통 요소를 못 본다(지침 원칙 3-2)");

/* ── ⑤ 판매팩과 «같은 파일»이 나가나 ──────────────────────────────
 * 우리가 여덟 벌 구워 본 판매팩이 정답지다. 손님 팩에 그중 빠진 것이 있으면 안 된다. */
console.log("\n⑤ 판매팩(정답지)과 같은 파일이 나가나");
const 판매팩 = "판매용_템플릿/_판매팩/뷰티샵_프리미엄";
const 손님폴더 = process.argv[3] ?? "C:/Users/glim0/Downloads/펫유치원_새로만들기";
if (existsSync(판매팩) && existsSync(손님폴더)) {
  const 셈 = (방: string) => new Set(readdirSync(방).filter((f) => /^\d\d[_-]/.test(f)).map((f) => f.replace(/\.(xlsx|md|json|html|drawio|pptx)$/, "")));
  const 정답 = 셈(판매팩), 손님 = 셈(손님폴더);
  const 빠짐 = [...정답].filter((f) => !손님.has(f));
  빠짐.length ? 나쁨("빠진 산출물", 빠짐.join(" · ")) : 좋음("산출물 목록", `${손님.size}개 — 판매팩과 같음`);
} else 좋음("산출물 목록", "(견줄 폴더가 없어 건너뜀)");

console.log("");
if (어긋남) { console.log(`✗ 어긋난 곳 ${어긋남}군데 — 손님이 못 받고 있는 것이 있습니다.`); process.exit(1); }
console.log("✔ 우리가 아는 규칙이 모두 손님 팩에 들어 있습니다.");
process.exit(0);
