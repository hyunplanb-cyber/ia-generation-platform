/**
 * 우리 숫자를 «터미널»에 찍는다.
 *
 *   npx tsx 대시보드.mts
 *
 * ⭐ 평소에는 이걸 쓸 일이 없다. **화면으로 보는 것이 먼저다** —
 *      https://www.caffeinecolor.com/admin/stats     (사장님 계정으로만 열린다)
 *      http://localhost:3000/admin/stats             (로컬에서 띄웠을 때)
 *    검수 판단(/admin/qa) · SNS 검수기(/admin/sns) 와 같은 자리다.
 *
 * 이 글은 «화면을 못 띄울 때»를 위한 것이다 — 서버가 안 뜰 때, 배포가 죽었을 때,
 * 또는 숫자만 빠르게 보고 싶을 때.
 *
 * ⛔ 세는 법은 여기 없다. `lib/our-numbers.ts` 한 곳에 있다.
 *    화면과 이 글이 같은 것을 봐야 숫자가 안 갈린다.
 *    숫자를 잘못 읽기 쉬운 자리 셋(옛 memo · 생성 시도 시작일 · 다운로드 두 수)도
 *    거기 적어 뒀다.
 *
 * ⚠ 이 글은 «구독»으로 돈다. 앤트로픽 API 를 부르지 않는다(AGENTS.md 결제 경로).
 */
import { config } from "dotenv";
config({ path: ".env.local", quiet: true });

const { readOurNumbers, maskEmail } = await import("@/lib/our-numbers");

const 콤마 = (n: number) => n.toLocaleString("ko-KR");
const 굵게 = (s: string) => `\x1b[1m${s}\x1b[0m`;
const 흐리게 = (s: string) => `\x1b[2m${s}\x1b[0m`;
const 빨강 = (s: string) => `\x1b[31m${s}\x1b[0m`;
const 짧게 = (d: Date | null) =>
  d ? d.toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

const n = await readOurNumbers();

console.log(`\n${굵게("우리 숫자")} — ${n.잰때.toLocaleString("ko-KR")}`);
console.log(흐리게(`  화면으로 보기 → /admin/stats  (검수 판단·SNS 검수기와 같은 자리)\n`));

console.log(`  회원                ${굵게(콤마(n.회원.손님))} 명   ${흐리게(`전체 ${n.회원.전체} · 최근 7일 +${n.회원.이레} · 30일 +${n.회원.한달}`)}`);
for (const [이름, v] of Object.entries(n.만든것))
  console.log(`  ${이름.padEnd(18)}${굵게(콤마(v.손님))} 건   ${흐리게(`전체 ${v.전체}${v.마지막 ? ` · 마지막 ${짧게(v.마지막)}` : ""}`)}`);
console.log(
  `  생성 시도           ${n.시도.전체 === 0 ? 굵게("—") : 굵게(콤마(n.시도.전체)) + " 건"}   ` +
    (n.시도.전체 === 0
      ? 흐리게("2026-08-25 부터 쌓입니다 — 0 이라고 실패가 없었던 게 아닙니다")
      : 흐리게(`성공 ${n.시도.성공} · `) + 빨강(`실패 ${n.시도.실패}`)),
);

console.log(
  `\n  실제로 만들어진 것   프로젝트 ${n.알맹이.프로젝트} ${흐리게(`(생성까지 간 것 ${n.알맹이.생성된프로젝트})`)} · ` +
    `메뉴 ${콤마(n.알맹이.메뉴)} · 화면 ${콤마(n.알맹이.화면)} · 검수 ${n.알맹이.검수돌린것}번`,
);
console.log(
  `  지금 열려 있는 것    산출물 ${n.열린것.산출물} · 검수 ${n.열린것.검수시나리오} · ` +
    `프리셋 ${n.열린것.프리셋} · 판매팩 ${n.열린것.판매팩}`,
);
/* ⚠ 위 「다운로드」(원장)와 여기 「열려 있는 것」(잠금 표)이 다를 수 있다 — 까닭은 lib 주석 ③ */

if (n.실패까닭.length) {
  console.log(`\n  ${빨강("⛔ 생성 실패 까닭")}`);
  for (const r of n.실패까닭) console.log(`     ${r.건수}건  ${r.까닭}`);
}

console.log(`\n${굵게("  요즘 있었던 일")}`);
for (const e of n.있었던일.slice(0, 12)) {
  const 표 = e.우리 ? 흐리게("우리") : "손님";
  const 일 = e.갈래 === "fail" ? 빨강(e.일) : e.일;
  const 줄 = `  ${짧게(e.때).padEnd(17)} ${maskEmail(e.메일).padEnd(26)} ${표}  ${일}`;
  console.log(e.우리 ? 흐리게(줄) : 줄);
}
console.log();

process.exit(0);
