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
  /* ⚠ 파일 전체를 «글자»로 훑으면 안 된다 (2026-09-02).
     permissions.allow 에 승인해 둔 명령 글귀에 ANTHROPIC_API_KEY 가 적혀 있을 수 있다
     — 예: .env.local 의 열쇠가 몇 자인지 세어 보는 awk 한 줄. 그건 무엇도 «켜지» 않는데
     매번 ⛔ 로 끝났고, 그러면 진짜 샐 때 아무도 안 본다.
     돈 가는 길을 실제로 바꾸는 자리는 셋뿐이다 — env 안의 열쇠 · apiKeyHelper · awsAuthRefresh. */
  let 걸린것: string[];
  try {
    const j = JSON.parse(s) as Record<string, unknown>;
    const 환경 = (j.env ?? {}) as Record<string, unknown>;
    걸린것 = [
      ...["ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN"].filter((k) => 환경[k] != null).map((k) => `env.${k}`),
      ...["apiKeyHelper", "awsAuthRefresh"].filter((k) => j[k] != null),
    ];
  } catch {
    /* 못 읽는 파일은 봐주지 않는다 — 옛 방식대로 글자로 훑는다. */
    걸린것 = ["apiKeyHelper", "ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "awsAuthRefresh"].filter((k) => s.includes(k));
  }
  if (걸린것.length) 짚기(`${길} 에 ${걸린것.join(" · ")} 가 있습니다`);
  else 좋음(`${길} — 깨끗`);
}

/* ── ③ «개발용» 스크립트가 API 를 직접 부르나 ──────────── */
console.log(알림.join("\n")); 알림.length = 0;
console.log("\n═══ ③ 개발용 스크립트가 종량제를 쓰나 ═══");
/* 서비스 코드는 «불러야 맞다» — 그게 손님 몫이다. 개발용만 본다. */
const 서비스자리 = ["adapters/", "app/", "application/", "domain/", "lib/"];
/* ⚠ 딱 하나 «불러야 맞는» 개발용 스크립트가 있다 — 열쇠살았나.mts (2026-08-25).
   그것의 일 자체가 «손님 열쇠가 살아 있나»를 재는 것이라, 손님 열쇠로 4토큰짜리
   인사를 보내야만 잴 수 있다. 값은 거의 0 이고, 이 인사를 막으면 8/15~8/24 처럼
   열쇠가 죽은 걸 «손님이 눌러 봐야만» 알게 된다.
   여기 안 적어 두면 매일 도는 검사가 매일 ⛔ 로 끝나고, 그러면 진짜 샐 때 아무도
   안 본다. 예외는 «이 한 줄»뿐이다 — 늘리지 않는다. */
const 봐주는것 = ["열쇠살았나.mts"];
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
    if (봐주는것.includes(길)) continue;                            // 위 ⚠ 참고
    볼것.push(길);
  }
};
훑기(".");

/* ⚠ «직접 import» 만 보면 부족하다 — 개발용 스크립트가 application/ 을 부르고
     그것이 adapters/ 의 SDK 에 닿을 수 있다. 딸린 것을 타고 들어가서 본다. (2026-08-25)
   ⛔ 윈도우에서는 existsSync("파일.ts/") 가 «true» 다. 슬래시를 붙여 파일·폴더를
      가르려 하면 «모든 파일이 걸러져» 한 군데도 안 타고 들어가면서 「깨끗하다」고 한다.
      처음에 그렇게 만들어 24개 전부를 «1개 파일만 보고» 통과시켰다.
      반드시 statSync().isFile() 로 가른다. */
const SDK = /@anthropic-ai\/sdk|api\.anthropic\.com\/v1\/messages/;
const 파일인가 = (q: string) => { try { return statSync(q).isFile(); } catch { return false; } };
const 글읽기 = (q: string) => { try { return readFileSync(q, "utf8"); } catch { return ""; } };

/** import 문에서 «우리 파일» 경로만 뽑는다 (npm 꾸러미는 뺀다) */
function 딸린것(길: string, 글: string): string[] {
  const 나온것: string[] = [];
  for (const m of 글.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
    let p = m[1];
    if (p.startsWith("@/")) p = p.slice(2);
    else if (p.startsWith(".")) {
      const 방 = 길.includes("/") ? 길.slice(0, 길.lastIndexOf("/")) : ".";
      p = `${방}/${p}`.replace(/\/\.\//g, "/");
      while (p.includes("/../")) p = p.replace(/[^/]+\/\.\.\//, "");
    } else continue;
    for (const 끝 of ["", ".ts", ".mts", ".mjs", ".tsx", "/index.ts"])
      if (파일인가(p + 끝)) { 나온것.push(p + 끝); break; }
  }
  return 나온것;
}

let 탄파일 = 0;
const 부르는것: { 길: string; 닿은곳: string }[] = [];
for (const 뿌리 of 볼것) {
  const 본것 = new Set([뿌리]);
  const 줄 = [뿌리];
  while (줄.length) {
    const 이번 = 줄.shift()!;
    const 글 = 글읽기(이번);
    if (SDK.test(글)) { 부르는것.push({ 길: 뿌리, 닿은곳: 이번 }); break; }
    for (const 다음 of 딸린것(이번, 글)) if (!본것.has(다음)) { 본것.add(다음); 줄.push(다음); }
  }
  탄파일 += 본것.size;
}
if (부르는것.length) {
  for (const { 길, 닿은곳 } of 부르는것)
    짚기(길 === 닿은곳
      ? `${길} — 앤트로픽 API 를 직접 부릅니다. 개발용이면 «구독»으로 옮기거나 지우세요.`
      : `${길} — ${닿은곳} 을 타고 API 에 닿습니다.`);
} else 좋음(`개발용 스크립트 ${볼것.length}개 · 딸린 것까지 ${탄파일}개 파일을 타고 봤는데 API 를 부르는 것 없음`);
/* 봐준 것은 «말 없이» 넘기지 않는다 — 안 보이면 없는 것과 같다 */
for (const 이름 of 봐주는것) 참고(`${이름} 은 봐줍니다 — 손님 열쇠가 살았나 재는 것이 그 일입니다(4토큰)`);

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
