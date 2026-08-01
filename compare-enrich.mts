// 다운로드 보강을 하이쿠·소넷·오푸스로 각각 돌려 비교한다.
// 실제 운영 코드(claudeIaEnricher)를 그대로 타므로, 여기서 나온 숫자가 곧 실제 원가다.
//
// 흐름: 하이쿠로 IA를 한 번 생성(= 지금 미리보기가 만들어지는 방식)
//       → 그 결과 중 3화면을 골라 → 세 모델로 각각 보강 → 결과·시간·토큰 비교
import { config } from "dotenv";
config({ path: ".env.local" });

import { writeFileSync } from "node:fs";
import { claudeIaGenerator } from "./adapters/generation/llm/claude-ia-generator";
import { claudeIaEnricher } from "./adapters/generation/llm/claude-ia-enricher";
import type { EnrichScreenInput } from "./domain/ports/ia-enricher";
import { TRAVEL } from "./template-data-travel";

const MODELS = ["claude-haiku-4-5", "claude-sonnet-5", "claude-opus-5"] as const;

// $ / 1M 토큰. 소넷5는 2026-08-31까지 도입가($2/$10)가 적용된다.
const PRICE: Record<string, { in: number; out: number }> = {
  "claude-haiku-4-5": { in: 1, out: 5 },
  "claude-sonnet-5": { in: 2, out: 10 },
  "claude-opus-5": { in: 5, out: 25 },
};
const KRW = 1400;

function won(model: string, u: { inputTokens: number; cacheReadTokens: number; cacheWriteTokens: number; outputTokens: number }) {
  const p = PRICE[model];
  const usd =
    (u.inputTokens * p.in +
      u.cacheReadTokens * p.in * 0.1 +
      u.cacheWriteTokens * p.in * 1.25 +
      u.outputTokens * p.out) /
    1_000_000;
  return usd * KRW;
}

async function main() {
  const project = TRAVEL.project;

  console.log("1단계: 하이쿠로 IA 생성(지금 미리보기가 만들어지는 방식)…");
  const t0 = Date.now();
  const gen = await claudeIaGenerator.generate({
    concept: project.concept,
    menuDraft: null,
    designConcept: project.designConcept,
    deviceMode: "responsive",
  });
  const flat = gen.menus.flatMap((m) =>
    m.screens.map((s) => ({ ...s, menuKo: m.nameKo })),
  );
  console.log(`   화면 ${flat.length}개 · ${Math.round((Date.now() - t0) / 1000)}초`);

  // 성격이 다른 3화면을 고른다 — 모델 차이가 가장 잘 드러나는 조합.
  const pick = (test: (r: string, n: string) => boolean) =>
    flat.find((s) => test(s.screenRole.toLowerCase(), s.pageName));
  const chosen = [
    pick((r) => r.includes("main") || r.includes("home")) ?? flat[0],
    pick((r) => r.includes("list") && !r.includes("empty")) ?? flat[1],
    pick((r, n) => r.includes("empty") || n.includes("없음") || n.includes("비어")) ?? flat[2],
  ];

  const inputs: EnrichScreenInput[] = chosen.map((s) => ({
    ref: s.ref,
    menuKo: s.menuKo,
    screenGroup: s.screenGroup ?? null,
    pageName: s.pageName,
    screenRole: s.screenRole,
    funcDef: s.funcDef,
    prompt: s.prompt,
    keepFuncDef: false,
    keepPrompt: false,
  }));

  const ctx = {
    concept: project.concept,
    designConcept: project.designConcept,
    deviceMode: "responsive",
    roster: flat.map((s) => `${s.ref}: ${s.pageName}`).join("\n"),
  };

  const md: string[] = [
    "# 다운로드 보강 — 하이쿠 / 소넷 / 오푸스 비교",
    "",
    `대상: 여행 예약 플랫폼 · 하이쿠가 생성한 ${flat.length}화면 중 성격이 다른 3화면`,
    "",
    "## 보강 전 (하이쿠 생성 결과 = 지금 미리보기에 보이는 내용)",
    "",
  ];
  for (const s of inputs) {
    md.push(`### ${s.pageName} (${s.screenRole})`, "", `**기능정의**  \n${s.funcDef}`, "", `**프롬프트**  \n${s.prompt}`, "");
  }

  const rows: string[] = [];
  for (const model of MODELS) {
    console.log(`2단계: ${model} 보강…`);
    const started = Date.now();
    const r = await claudeIaEnricher.enrich(ctx, inputs, { model });
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    const u = r.usage;
    const cost = won(model, u);
    const chars = r.screens.reduce((n, s) => n + s.funcDef.length + s.prompt.length, 0);
    const items = r.screens.reduce((n, s) => n + s.funcDef.split("·").length, 0);

    console.log(
      `   ${secs}초 · 실패 ${r.failedChunks}/${r.totalChunks} · 출력 ${u.outputTokens}토큰 · ${cost.toFixed(1)}원`,
    );
    rows.push(
      `| ${model} | ${secs}초 | ${u.outputTokens} | ${u.inputTokens}/${u.cacheReadTokens}/${u.cacheWriteTokens} | ${chars} | ${items} | ${cost.toFixed(1)}원 | ${r.failedChunks}/${r.totalChunks} |`,
    );

    md.push(`## 보강 후 — ${model}`, "", `> ${secs}초 · 출력 ${u.outputTokens}토큰 · ${cost.toFixed(1)}원 · 실패 묶음 ${r.failedChunks}/${r.totalChunks}`, "");
    for (const s of r.screens) {
      const src = inputs.find((i) => i.ref === s.ref);
      md.push(`### ${src?.pageName ?? s.ref}`, "", `**기능정의**  \n${s.funcDef}`, "", `**프롬프트**  \n${s.prompt}`, "");
    }
  }

  md.splice(
    4,
    0,
    "## 요약",
    "",
    "| 모델 | 시간 | 출력토큰 | 입력/캐시읽기/캐시쓰기 | 글자수 | 요건항목 | 3화면 원가 | 실패 |",
    "|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "*소넷5는 2026-08-31까지 도입가($2/$10) 기준. 환율 1,400원.*",
    "",
  );

  const out = "비교_보강모델.md";
  writeFileSync(out, md.join("\n"), "utf8");
  console.log(`\n결과: ${out}`);
  console.log("\n| 모델 | 시간 | 출력토큰 | 입/캐시읽기/캐시쓰기 | 글자수 | 요건항목 | 3화면 원가 | 실패 |");
  rows.forEach((r) => console.log(r));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
