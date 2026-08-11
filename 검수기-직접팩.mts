/* 손님이 «우리 사이트에서 직접 만든» AI팩을 검수한다.
 *
 * 왜 만드나 (2026-08-11, 사장님 제안)
 *   우리가 파는 24칸은 `check-zip.mts` 가 본다. 그런데 **손님이 직접 만든 팩은
 *   아무도 안 본다.** 그쪽이 오히려 더 많이 팔릴 자리인데 검사가 통째로 없었다.
 *
 *   쓰는 법도 사장님이 정하셨다 —
 *   「내가 우리 사이트에서 사용자처럼 팩을 만들어서 넣어. 그 파일 전체를 검수기에 넣으면
 *    검수기를 돌려서 결과를 보여줘.」
 *
 * 무엇을 보나
 *   `검수항목.md` 의 A·B 항목. C·D·E 는 완성화면이 있는 팩에만 걸리는데
 *   직접 만든 팩에는 완성화면이 없다.
 *
 * 파일 «속»을 열어 보는 부분은 `lib/검수-속보기.mts` 를 판매팩 검사기와 나눠 쓴다.
 * 두 벌로 적으면 한쪽에서 잡히는 결함이 다른 쪽에서 안 잡히게 된다.
 *
 * 쓰는 법
 *   npx tsx 검수기-직접팩.mts "C:/Users/.../다운로드/내팩.zip"
 *   npx tsx 검수기-직접팩.mts "C:/Users/.../압축푼폴더"
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import JSZip from "jszip";
import { 파일보기, 화면목록안내보기, 줄수세기, type 급 } from "./lib/검수-속보기.mjs";

type 흠 = { 급: 급; 무엇: string };
const 흠들: 흠[] = [];
const 담 = (g: 급, _어디: string, 무엇: string) => 흠들.push({ 급: g, 무엇 });

const 준것 = process.argv[2];
if (!준것 || !existsSync(준것)) {
  console.error("쓰는 법: npx tsx 검수기-직접팩.mts <내려받은 zip 또는 압축 푼 폴더>");
  process.exit(1);
}

/* ── 열어서 «이름 → 내용» 으로 만든다. zip 이든 폴더든 그다음은 똑같다 ── */
const 파일들 = new Map<string, Buffer>();

if (statSync(준것).isDirectory()) {
  const 훑기 = (방: string, 앞: string) => {
    for (const e of readdirSync(방, { withFileTypes: true })) {
      const p = join(방, e.name);
      if (e.isDirectory()) 훑기(p, `${앞}${e.name}/`);
      else 파일들.set(`${앞}${e.name}`, readFileSync(p));
    }
  };
  훑기(준것, "");
} else {
  let z: JSZip;
  try { z = await JSZip.loadAsync(readFileSync(준것)); }
  catch { console.error("zip 이 안 열립니다."); process.exit(1); }
  for (const [p, f] of Object.entries(z.files)) {
    if (f.dir) continue;
    /* 최상위 폴더 한 겹은 벗겨 낸다 — 있어도 없어도 같게 본다. */
    파일들.set(p.includes("/") ? p.slice(p.indexOf("/") + 1) : p, Buffer.from(await f.async("uint8array")));
  }
}

if (파일들.size === 0) { console.error("안이 비었습니다."); process.exit(1); }

/* ── 있어야 할 것 ──────────────────────────────────────────────
   직접 만든 팩은 이름 뒤에 «프로젝트 이름»이 붙는다(`화면목록_내서비스.xlsx`).
   그래서 통째로 맞추지 않고 **앞머리로** 찾는다.
   ⚠ 이 목록의 출처는 `app/(app)/dashboard/zip-all-button.tsx` 다.
     거기를 고치면 여기도 같이 고친다 — 안 그러면 멀쩡한 팩을 「빠졌다」고 한다. */
const 있어야 = [
  { 앞: "메뉴구조_", 끝: ".xlsx", 뭐: "메뉴구조" },
  { 앞: "IA_화면목록_", 끝: ".xlsx", 뭐: "화면목록" },
  { 앞: "기능정의서_", 끝: ".xlsx", 뭐: "기능정의서" },
  { 앞: "WBS_", 끝: ".xlsx", 뭐: "개발 일정표" },
  { 앞: "FLOW_", 끝: ".html", 뭐: "흐름도(html)" },
  { 앞: "FLOW_", 끝: ".drawio", 뭐: "흐름도(drawio)" },
  { 앞: "메뉴구조_", 끝: ".pptx", 뭐: "메뉴구조 장표" },
  { 앞: "스펙팩_", 끝: ".md", 뭐: "AI 빌드 지시서(md)" },
  { 앞: "스펙팩_", 끝: ".json", 뭐: "AI 빌드 지시서(json)" },
  { 앞: "디자인시스템_", 끝: ".md", 뭐: "디자인 규칙" },
];
/** 없어도 흠은 아니지만, 없으면 알려는 준다. */
const 있으면좋은것 = [
  { 앞: "검수시나리오_", 끝: ".xlsx", 뭐: "검수 시나리오" },
  { 앞: "사이트_내놓는_법", 끝: ".html", 뭐: "사이트 내놓는 법 안내서" },
  { 앞: "앱으로_내놓는_법", 끝: ".html", 뭐: "앱으로 내놓는 법 안내서" },
];

const 이름들 = [...파일들.keys()];
const 찾기 = (앞: string, 끝: string) =>
  이름들.find((n) => basename(n).startsWith(앞) && n.endsWith(끝));

for (const { 앞, 끝, 뭐 } of 있어야) {
  if (!찾기(앞, 끝)) 담("FAIL", "", `${뭐} 가 없습니다 (${앞}…${끝})`);
}
for (const { 앞, 끝, 뭐 } of 있으면좋은것) {
  if (!찾기(앞, 끝)) 담("WARN", "", `${뭐} 가 없습니다 — 만들 때 안 고르셨을 수 있습니다`);
}

/* ── 파일마다 «열어» 본다 ────────────────────────────────────── */
for (const [이름, b] of 파일들) {
  if (b.length === 0) { 담("FAIL", "", `${이름} — 0바이트입니다`); continue; }
  await 파일보기("", 이름, b, 담);
  if (이름.includes("화면목록")) 화면목록안내보기("", 이름, b, 담);
}

/* ── 스펙팩과 화면목록이 «같은 화면 수»를 말하나 ────────────────
   서로 다르면 손님은 「목록엔 40개인데 지시서엔 32개」를 보게 된다.
   AI 에 넣는 것은 지시서 쪽이라, 목록만 믿고 세면 화면이 모자라게 나온다. */
const 스펙이름 = 찾기("스펙팩_", ".json");
const 목록이름 = 찾기("IA_화면목록_", ".xlsx");
if (스펙이름 && 목록이름) {
  try {
    const spec = JSON.parse(파일들.get(스펙이름)!.toString("utf8"));
    const 스펙화면 = (spec.menus ?? []).reduce(
      (n: number, m: { screens?: unknown[] }) => n + (m.screens?.length ?? 0), 0);
    const 목록줄 = 줄수세기(파일들.get(목록이름)!);
    if (스펙화면 > 0 && 목록줄 > 0 && 스펙화면 !== 목록줄) {
      담("FAIL", "", `화면 수가 안 맞습니다 — 화면목록 ${목록줄}개 · AI 빌드 지시서 ${스펙화면}개`);
    }
  } catch { /* json 이 깨진 것은 위에서 이미 말했다 */ }
}

/* ── 흐름도가 «없는 화면»을 가리키나 ──────────────────────────── */
const 흐름이름 = 찾기("FLOW_", ".html");
if (흐름이름 && 스펙이름) {
  try {
    const spec = JSON.parse(파일들.get(스펙이름)!.toString("utf8"));
    const 있는화면 = new Set<string>(
      (spec.menus ?? []).flatMap((m: { screens?: { pageId: string }[] }) =>
        (m.screens ?? []).map((s) => String(s.pageId).toUpperCase())));
    const 흐름글 = 파일들.get(흐름이름)!.toString("utf8");
    const 가리킨것 = [...new Set([...흐름글.matchAll(/\b([A-Z]{2}-?\d{2,4})\b/g)].map((m) => m[1].toUpperCase()))];
    const 없는것 = 가리킨것.filter((id) => !있는화면.has(id) && !있는화면.has(id.replace("-", "")));
    if (없는것.length) {
      담("WARN", "", `흐름도가 목록에 없는 화면을 가리킵니다 — ${없는것.slice(0, 6).join(", ")}${없는것.length > 6 ? ` 외 ${없는것.length - 6}` : ""}`);
    }
  } catch { /* 위에서 말했다 */ }
}

/* ── 내놓기 ────────────────────────────────────────────────── */
const 못한것 = 흠들.filter((i) => i.급 === "FAIL");
const 걸린것 = 흠들.filter((i) => i.급 === "WARN");

console.log(`\n직접 만든 AI팩 검수 — ${basename(준것)}`);
console.log(`  파일 ${파일들.size}개\n`);
for (const i of 못한것) console.log(`  ✗ ${i.무엇}`);
for (const i of 걸린것) console.log(`  △ ${i.무엇}`);
if (!흠들.length) console.log("  흠 없음.");

console.log(`\n못 넘긴 것 ${못한것.length}건 · 봐줄 만한 것 ${걸린것.length}건`);
console.log("  ※ 여기서 보는 것은 「파일이 성한가」다. 화면이 예쁜가는 완성화면이 있는 팩에서만 잰다.");
if (못한것.length) process.exit(1);
