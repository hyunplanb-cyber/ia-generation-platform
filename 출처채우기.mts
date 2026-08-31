/* 출처.csv 의 빈 줄을 채운다. (2026-08-28)
 *
 * 왜 있나 — 열 개 표의 331줄이 열이레 동안 통째로 비어 있었다. 손으로 채우면
 *   또 비워진다. 그리고 「이 사진 어디서 났느냐」는 물음은 «나중에» 온다.
 *
 * ⛔ 지어내지 않는다. 이 도구는 «아는 것을 한 번에 적어 주는» 것이지
 *   «모르는 것을 그럴듯하게 채우는» 것이 아니다. 모르면 비워 두는 게 맞다.
 *   빈 줄은 정직하지만, 틀린 출처는 방패가 아니라 거짓말이다.
 *
 * ⚠ 칸은 «셋»이어야 한다 — `파일,어디서받았나,주소`.
 *   `이미지-예시만들기.mts` 의 출처챙기기() 가 이 표를 세 칸으로 다시 쓴다.
 *   칸을 늘리면 그 도구가 다음에 돌 때 «아무 소리 없이» 지운다. 실제로 겪기 전에 적어 둔다.
 *
 * 쓰는 법
 *   npx tsx 출처채우기.mts                                  ← 재기만 한다 (기본)
 *   npx tsx 출처채우기.mts <표> "<어디서받았나>" "[주소]"    ← 빈 줄만 채운다
 *   npx tsx 출처채우기.mts <표> "<어디서>" "" --덮어쓰기     ← 이미 적힌 것까지 갈아엎는다
 *
 * 보기
 *   npx tsx 출처채우기.mts 판매용_템플릿/_이미지/마스코트/장면 "우리가 만든 것 (AI 생성)"
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** 폴더를 훑어 이름이 같은 파일을 모두 찾는다.
 *
 * ⛔ `node:fs` 의 `globSync` 를 쓰지 않는다. 이 프로젝트의 타입에 그게 없어서
 *   `next build` 의 타입검사가 여기서 멈춘다. 2026-08-28 에 그렇게 넣었다가
 *   **실서버 배포가 3일 동안 멈췄고**, 8/31 에 결제를 붙이려다 발견했다.
 *   빌드는 「컴파일 성공」까지 찍고 나서 타입검사에서 죽어, 로그를 끝까지 안 보면
 *   성공한 줄로 읽힌다. 루트의 `.mts` 도 `tsconfig` 에 들어 있어 다 검사받는다.
 */
function 찾기(뿌리: string, 파일이름: string): string[] {
  const 나온것: string[] = [];
  const 훑기 = (곳: string) => {
    for (const 것 of readdirSync(곳, { withFileTypes: true })) {
      const 길 = join(곳, 것.name);
      if (것.isDirectory()) 훑기(길);
      else if (것.name === 파일이름) 나온것.push(길.split("\\").join("/"));
    }
  };
  if (existsSync(뿌리)) 훑기(뿌리);
  return 나온것;
}

const 머리 = "파일,어디서받았나,주소";

type 줄 = { 파일: string; 어디: string; 주소: string };

/** 표 하나를 읽는다. 칸이 셋이 아니면 그대로 두고 알려 준다. */
function 표읽기(길: string): 줄[] {
  const 것들: 줄[] = [];
  for (const 줄월 of readFileSync(길, "utf8").split(/\r?\n/).slice(1)) {
    if (!줄월.trim()) continue;
    const [파일, 어디, 주소] = 줄월.split(",");
    것들.push({ 파일: (파일 ?? "").trim(), 어디: (어디 ?? "").trim(), 주소: (주소 ?? "").trim() });
  }
  return 것들;
}

function 표쓰기(길: string, 것들: 줄[]) {
  writeFileSync(길, [머리, ...것들.map((r) => `${r.파일},${r.어디},${r.주소}`)].join("\n") + "\n");
}

const 표들 = 찾기("판매용_템플릿/_이미지", "출처.csv").sort();

/* ── 아무 것도 안 대면 «재기만» 한다 ─────────────────────────── */
const [대상, 어디, 주소 = "", ...나머지] = process.argv.slice(2);
const 덮어쓰기 = 나머지.includes("--덮어쓰기");

if (!대상) {
  console.log("\n출처.csv — 어디까지 채워졌나\n");
  let 빈합 = 0, 총합 = 0;
  for (const 길 of 표들) {
    const 것들 = 표읽기(길);
    const 빈 = 것들.filter((r) => !r.어디 && !r.주소).length;
    빈합 += 빈; 총합 += 것들.length;
    const 표시 = 빈 === 0 ? "✓" : "⬜";
    console.log(`  ${표시} ${String(것들.length - 빈).padStart(3)}/${String(것들.length).padEnd(3)}  ${길.replace("판매용_템플릿/_이미지/", "")}`);
  }
  console.log(`\n  합계 ${총합 - 빈합}/${총합} 채워짐 · ${빈합}줄 비어 있음\n`);
  if (빈합) console.log("  ⛔ 빈 줄은 «모른다»는 뜻이다. 아는 사람에게 물어서 채운다 — 지어내지 않는다.\n");
  process.exit(빈합 ? 1 : 0);
}

/* ── 한 표를 채운다 ──────────────────────────────────────────── */
const 길 = 대상.endsWith("출처.csv") ? 대상 : join(대상, "출처.csv");
if (!existsSync(길)) { console.error(`✗ 그런 표가 없다: ${길}`); process.exit(1); }
if (!어디) { console.error("✗ 「어디서받았나」를 대야 한다."); process.exit(1); }

const 것들 = 표읽기(길);
let 채움 = 0;
for (const r of 것들) {
  if (!덮어쓰기 && (r.어디 || r.주소)) continue;
  r.어디 = 어디; r.주소 = 주소;
  채움 += 1;
}
표쓰기(길, 것들);
console.log(`✓ ${길} — ${채움}/${것들.length}줄 채움  「${어디}${주소 ? " · " + 주소 : ""}」`);
