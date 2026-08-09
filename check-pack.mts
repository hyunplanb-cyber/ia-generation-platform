/* 팩 하나를 «손님 눈으로» 검수한다 — 스펙팩과 완성화면을 맞대 본다.
 *
 * check-presets — 가이드끼리 말이 맞나 (글 vs 코드)
 * check-design  — 만들어진 화면이 그 가이드대로인가 (색·간격·구조)
 * 여기          — **스펙팩이 시킨 것을 화면이 다 했나**
 *
 * 왜 필요한가 (2026-08-09)
 *   132장·159장을 손으로 만들면서 눈으로 못 잡은 것이 계속 나왔다.
 *     · CATS 를 그대로 넘겨 [object Object] 가 찍혔다
 *     · 「확인 후 열립니다」 버튼이 그냥 disabled 라 영영 안 열렸다
 *     · 없는 화면으로 가는 링크를 걸었다
 *   전부 «열어 보면 보이는» 것이지만, 291장을 열어 볼 수는 없다.
 *
 * 무엇을 보나
 *   1. 스펙팩의 화면이 전부 만들어졌나
 *   2. 만들어진 화면에 스펙팩에 없는 것이 섞이지 않았나
 *   3. 링크가 «있는 화면»을 가리키나
 *   4. 값이 안 풀린 자국이 남지 않았나 ([object Object] · undefined · NaN)
 *   5. 기능정의의 핵심 낱말이 화면 글에 실제로 나오나
 *   6. 잠긴 버튼이 열릴 «길»이 있나 (data-gated 에 짝이 있나)
 *
 * 쓰는 법
 *   npx tsx check-pack.mts "판매용_템플릿/_판매팩/LMS_프리미엄"
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const 팩 = process.argv[2];
if (!팩 || !existsSync(팩)) {
  console.error(`팩 폴더를 주세요 — 예) npx tsx check-pack.mts "판매용_템플릿/_판매팩/LMS_프리미엄"`);
  process.exit(1);
}

const 화면폴더 = join(팩, "완성화면", "pages");
const 스펙길 = [join(팩, "완성화면", "스펙팩", "07_AI빌드_스펙팩.json"), join(팩, "07_AI빌드_스펙팩.json")]
  .find((p) => existsSync(p));
if (!스펙길) { console.error(`스펙팩(07_AI빌드_스펙팩.json)을 못 찾았어요`); process.exit(1); }
if (!existsSync(화면폴더)) { console.error(`완성화면/pages 가 없어요 — 설계만 파는 등급입니다`); process.exit(0); }

interface 화면 { pageId: string; pageName: string; funcDef?: string }
const 스펙 = JSON.parse(readFileSync(스펙길, "utf8")) as { screens: 화면[] };

const 있는파일 = new Set(readdirSync(화면폴더).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, "")));
const 스펙화면 = new Set(스펙.screens.map((s) => s.pageId));

type 급 = "FAIL" | "WARN";
const 문제: { 급: 급; 어디: string; 무엇: string }[] = [];
const 못됨 = (어디: string, 무엇: string) => 문제.push({ 급: "FAIL", 어디, 무엇 });
const 걸림 = (어디: string, 무엇: string) => 문제.push({ 급: "WARN", 어디, 무엇 });

console.log(`\n검수 — ${팩}`);
console.log(`  스펙팩 ${스펙화면.size}화면 · 만들어진 파일 ${있는파일.size}개\n`);

/* ── 1·2. 스펙과 파일이 1:1 인가 ─────────────────────────── */
{
  const 없는것 = [...스펙화면].filter((id) => !있는파일.has(id));
  const 남는것 = [...있는파일].filter((id) => !스펙화면.has(id));
  if (없는것.length) {
    못됨(`${없는것.length}장`, `스펙팩에 있는데 «안 만들어졌습니다» — ${없는것.slice(0, 8).join(", ")}${없는것.length > 8 ? " …" : ""}`);
  }
  if (남는것.length) {
    /* 스펙에 없는 파일은 옛 화면이 남은 것이다. 손님이 목록에서 못 찾는 유령 화면이 된다. */
    걸림(`${남는것.length}장`, `스펙팩에 없는 파일이 남아 있습니다 — ${남는것.slice(0, 8).join(", ")}`);
  }
}

/* ── 3~6. 화면 하나씩 ─────────────────────────────────────── */
const 죽은링크 = new Map<string, string[]>();
const 값자국 = new Map<string, string[]>();
const 짝없는잠금: string[] = [];
const 얇은화면: string[] = [];

/* 기능정의에서 「핵심 낱말」을 뽑는다.
   조사·군더더기를 걷고 두 글자 이상 한글·영문 낱말만 남긴다.
   완벽한 형태소 분석이 아니라 «있나 없나»를 보는 자다. */
const 낱말뽑기 = (s: string) =>
  [...new Set(
    s.replace(/[·,()[\]{}]/g, " ")
      .split(/\s+/)
      .map((w) => w.replace(/(을|를|이|가|은|는|에|의|로|와|과|도|만|씩|까지|부터|시)$/, ""))
      .filter((w) => /^[가-힣A-Za-z]{2,}$/.test(w)),
  )];

for (const s of 스펙.screens) {
  if (!있는파일.has(s.pageId)) continue;
  const html = readFileSync(join(화면폴더, `${s.pageId}.html`), "utf8");

  // 3. 링크가 있는 화면을 가리키나
  const 죽음: string[] = [];
  for (const m of html.matchAll(/href="([A-Z]{2}[-0-9]{2,6})\.html"/g)) {
    if (!있는파일.has(m[1])) 죽음.push(m[1]);
  }
  if (죽음.length) 죽은링크.set(s.pageId, [...new Set(죽음)]);

  // 4. 값이 안 풀린 자국
  const 자국: string[] = [];
  for (const 말 of ["[object Object]", "undefined", "NaN", "[object Undefined]"]) {
    if (html.includes(말)) 자국.push(말);
  }
  if (자국.length) 값자국.set(s.pageId, 자국);

  /* 6. 잠긴 버튼에 «여는 길»이 있나
   *
   * 처음엔 잠긴 버튼을 전부 FAIL 로 올렸는데, 그게 너무 뻣뻣했다.
   * 화면이 «막힌 상태 자체»를 그리는 경우가 있다 —
   *   「수료 조건 미충족」 화면의 발급 버튼은 잠겨 있는 것이 맞다.
   *   「영상 미연결」 화면의 검수 요청도 마찬가지다.
   * 그건 손님이 그 자리에서 풀 수 있는 것이 아니라 «다른 화면에서» 채워야 한다.
   *
   * 그래서 무는 것은 «말과 행동이 다를 때»뿐이다 —
   * 버튼이 「확인 후 열립니다」처럼 «이 화면에서 열린다»고 말해 놓고
   * 여는 길이 없으면, 손님은 눌러 보다가 고장인 줄 안다. */
  const 잠금 = [...html.matchAll(/data-gated="([a-z0-9-]+)"/g)].map((m) => m[1]);
  for (const 키 of new Set(잠금)) {
    if (!html.includes(`data-gate="${키}"`)) 짝없는잠금.push(`${s.pageId} — data-gated="${키}" 에 짝(data-gate)이 없습니다`);
  }
  for (const m of html.matchAll(/<button[^>]*\sdisabled[^>]*>([^<]*)</g)) {
    const 라벨 = m[1];
    const 열린다고했나 = /(후|하면|채우면|동의하면)\s*열립니다/.test(라벨);
    if (열린다고했나 && !잠금.length) {
      짝없는잠금.push(`${s.pageId} — 「${라벨.trim()}」이라고 해 놓고 여는 길이 없습니다`);
    }
  }

  // 5. 기능정의의 낱말이 화면에 나오나
  const 글 = html.replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
  const 낱말 = 낱말뽑기(s.funcDef ?? "");
  if (낱말.length >= 4) {
    const 없는낱말 = 낱말.filter((w) => !글.includes(w));
    const 비율 = 없는낱말.length / 낱말.length;
    if (비율 > 0.7) {
      얇은화면.push(`${s.pageId} ${s.pageName} — 기능정의 낱말 ${낱말.length}개 중 ${없는낱말.length}개가 화면에 없습니다`);
    }
  }

  // 화면이 너무 짧으면(껍데기만) 알린다
  if (글.replace(/\s+/g, "").length < 400) {
    얇은화면.push(`${s.pageId} ${s.pageName} — 글이 ${글.replace(/\s+/g, "").length}자뿐입니다`);
  }
}

if (죽은링크.size) {
  const 줄 = [...죽은링크].slice(0, 6).map(([id, ls]) => `${id} → ${ls.join(", ")}`);
  못됨(`${죽은링크.size}장`, `없는 화면으로 가는 링크가 있습니다 — ${줄.join(" / ")}`);
}
if (값자국.size) {
  const 줄 = [...값자국].slice(0, 6).map(([id, ws]) => `${id} (${ws.join(", ")})`);
  못됨(`${값자국.size}장`, `값이 안 풀린 자국이 남았습니다 — ${줄.join(", ")}`);
}
for (const x of 짝없는잠금.slice(0, 6)) 못됨("잠긴 버튼", x);
if (짝없는잠금.length > 6) 못됨("잠긴 버튼", `그 밖에 ${짝없는잠금.length - 6}건`);
for (const x of 얇은화면.slice(0, 8)) 걸림("내용", x);
if (얇은화면.length > 8) 걸림("내용", `그 밖에 ${얇은화면.length - 8}장`);

/* ── 결과 ────────────────────────────────────────────────── */
const 못한것 = 문제.filter((i) => i.급 === "FAIL");
const 걸린것 = 문제.filter((i) => i.급 === "WARN");
for (const i of 못한것) console.log(`  ✗ [${i.어디}] ${i.무엇}`);
for (const i of 걸린것) console.log(`  △ [${i.어디}] ${i.무엇}`);
console.log(`\n못 넘긴 것 ${못한것.length}건 · 봐줄 만한 것 ${걸린것.length}건`);
if (못한것.length) process.exit(1);
