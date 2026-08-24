/**
 * 결제 경로 확인 — 개발은 «구독», 손님 서비스만 «API 종량제».
 *
 *   npx tsx 결제경로.mts
 *
 * 왜 있나 — 2026-08-24 사장님 지시.
 *   사장님 계정은 Claude Max 구독이다. 여기서 하는 개발·분석·에이전트 작업은
 *   **구독의 주간 사용량**으로만 나가야 한다.
 *   앤트로픽 콘솔의 **API 종량제 잔액**은 «손님이 AI팩을 만들 때»만 빠져야 하는
 *   프로덕션 비용이다. 둘이 섞이면 개발하다가 손님 몫을 다 써 버린다.
 *
 * ⚠ 이 검사는 «지금 이 컴퓨터»를 본다. 세 가지를 가른다.
 *   ① Claude Code 가 무엇으로 인증하나 — 환경에 API 키가 있으면 종량제로 돈다
 *   ② 설정 파일이 API 키를 끌어오나 (apiKeyHelper 같은 것)
 *   ③ «개발용» 스크립트가 앤트로픽 SDK 를 직접 부르나 — 그건 종량제로 나간다
 *      (서비스 코드가 부르는 것은 «맞는» 것이다. 그게 손님 몫이다)
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";

const 집 = (process.env.USERPROFILE ?? process.env.HOME ?? "").split("\\").join("/");
let 탈 = 0;
const 알림: string[] = [];
const 짚기 = (말: string) => { 알림.push(`  ⛔ ${말}`); 탈++; };
const 좋음 = (말: string) => 알림.push(`  ✓ ${말}`);
const 참고 = (말: string) => 알림.push(`  · ${말}`);

/* ── ① Claude Code 의 인증 ─────────────────────────────── */
console.log("\n═══ ① 이 세션은 무엇으로 결제되나 ═══");
for (const 이름 of ["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN"]) {
  if (process.env[이름]) 짚기(`${이름} 가 환경에 있습니다 — Claude Code 가 «종량제»로 돕니다. 지워야 합니다.`);
  else 좋음(`${이름} 없음`);
}
for (const 이름 of ["CLAUDE_CODE_USE_BEDROCK", "CLAUDE_CODE_USE_VERTEX"]) {
  if (process.env[이름]) 짚기(`${이름} 가 켜져 있습니다 — 구독이 아니라 클라우드 과금으로 돕니다.`);
}
const 밑주소 = process.env.ANTHROPIC_BASE_URL;
if (밑주소 && 밑주소 !== "https://api.anthropic.com") 짚기(`ANTHROPIC_BASE_URL 이 딴 곳입니다: ${밑주소}`);
else 참고(`ANTHROPIC_BASE_URL = ${밑주소 ?? "(기본)"}`);

const 자격 = `${집}/.claude/.credentials.json`;
if (existsSync(자격)) 좋음(`구독 자격증명이 있습니다 (.credentials.json · ${new Date(statSync(자격).mtimeMs).toLocaleString("ko-KR")})`);
else 짚기("구독 자격증명(.credentials.json)이 없습니다 — 로그인 상태를 확인하세요.");

const 범위 = process.env.CLAUDE_CODE_OAUTH_SCOPES;
if (범위?.includes("user:inference")) 좋음(`구독 인증으로 돌고 있습니다 (scope: ${범위})`);
else if (범위) 참고(`OAuth scope: ${범위}`);

/* ── ② 설정 파일 ───────────────────────────────────────── */
console.log(알림.join("\n")); 알림.length = 0;
console.log("\n═══ ② 설정 파일이 API 키를 끌어오나 ═══");
for (const 길 of [`${집}/.claude/settings.json`, `${집}/.claude/settings.local.json`, ".claude/settings.local.json"]) {
  if (!existsSync(길)) continue;
  const s = readFileSync(길, "utf8");
  const 걸린것 = ["apiKeyHelper", "ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "awsAuthRefresh"].filter((k) => s.includes(k));
  if (걸린것.length) 짚기(`${길} 에 ${걸린것.join(" · ")} 가 있습니다`);
  else 좋음(`${길} — 깨끗`);
}

/* ── ③ «개발용» 스크립트가 API 를 직접 부르나 ──────────── */
console.log(알림.join("\n")); 알림.length = 0;
console.log("\n═══ ③ 개발용 스크립트가 종량제를 쓰나 ═══");
/* 서비스 코드는 «불러야 맞다» — 그게 손님 몫이다. 개발용만 본다. */
const 서비스자리 = ["adapters/", "app/", "application/", "domain/", "lib/"];
const 볼것: string[] = [];
const 훑기 = (방: string, 깊이 = 0) => {
  if (깊이 > 4) return;
  let 목록: string[];
  try { 목록 = readdirSync(방); } catch { return; }
  for (const 이름 of 목록) {
    if (["node_modules", ".next", ".git", ".claude"].includes(이름)) continue;
    const 길 = `${방}/${이름}`.replace(/^\.\//, "");
    let s; try { s = statSync(길); } catch { continue; }
    if (s.isDirectory()) { 훑기(길, 깊이 + 1); continue; }
    if (!/\.(mts|mjs|ts)$/.test(이름)) continue;
    if (서비스자리.some((자리) => 길.startsWith(자리))) continue;   // 서비스 코드는 맞는 것
    볼것.push(길);
  }
};
훑기(".");
const 부르는것 = 볼것.filter((길) => {
  try {
    const s = readFileSync(길, "utf8");
    return /@anthropic-ai\/sdk|api\.anthropic\.com\/v1\/messages/.test(s);
  } catch { return false; }
});
if (부르는것.length) {
  for (const 길 of 부르는것)
    짚기(`${길} — 앤트로픽 API 를 직접 부릅니다. 개발용이면 «구독»으로 옮기거나 지우세요.`);
} else 좋음("개발용 스크립트 가운데 API 를 직접 부르는 것 없음");

/* ── 마무리 ───────────────────────────────────────────── */
console.log(알림.join("\n"));
console.log("\n═══ 정리 ═══");
if (탈) {
  console.log(`  ⛔ ${탈}군데가 «종량제»로 샐 수 있습니다. 위를 고치세요.\n`);
  process.exit(1);
}
console.log("  ✓ 개발은 구독으로, 종량제는 손님 서비스만 씁니다.");
console.log("  ⚠ 다만 이 검사는 «이 컴퓨터»만 봅니다. Vercel 의 ANTHROPIC_API_KEY 는");
console.log("     손님 서비스가 쓰는 것이라 «있어야 맞습니다» — 그건 지우면 안 됩니다.\n");
