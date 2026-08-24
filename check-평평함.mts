/* 한 화면에 «똑같이 생긴 카드»가 몇 개나 줄지어 있는지 본다. (검수항목 E3)
 *
 * 왜 만드나
 *   사장님 말씀 — 「비슷한 화면이 연속으로 나와서 오히려 화면이 비어 보여」(2026-08-13).
 *   상세 페이지 완성화면을 고를 때 나온 말인데, 화면 «안»에서도 같은 일이 생긴다.
 *   같은 크기·같은 구조의 카드가 끝없이 이어지면 눈이 멈출 데가 없다.
 *
 * ⚠ 목록 화면은 원래 되풀이가 일이다 — 거기까지 잡으면 거짓 경보가 된다.
 *   그래서 «얼마나»를 재서 기준을 정했다. 2026-08-14 에 열두 팩 1,169화면을 세어 보니
 *   한 줄에 이어지는 같은 꼴 카드는 대개 3~8개였고, 12개를 넘는 화면은 드물었다.
 *   **12개**를 넘으면 알린다 — 목록으로도 지나치게 길다는 뜻이다.
 *   (기준을 바꾸려면 이 숫자만 고치면 된다. 왜 그 숫자인지 여기 같이 적는다.)
 *
 * 무엇을 «같은 꼴»로 보나
 *   클래스가 똑같은 카드가 «형제로 나란히» 있는 것. 클래스가 조금이라도 다르면
 *   다른 꼴로 본다 — 배지 색이나 크기 변화가 있으면 눈이 쉰다.
 *
 * 쓰는 법
 *   npx tsx check-평평함.mts 여행_프리미엄
 *   npx tsx check-평평함.mts               (팩 전부)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/* ⚠ 만드는 중인 팩(_만드는중)도 같이 본다.
   2026-08-25 — 반려견 유치원 41장을 손으로 눌러 다섯 군데가 새는 걸 찾았는데,
   검수기 열한 개가 전부 _판매팩 만 보고 있어서 «옮겨 놓기 전까지 아무 검수도 안 받는»
   자리였다. 만드는 단계 안에서 검수가 돌아야 한다. */
const 팩자리 = ["판매용_템플릿/_판매팩", "판매용_템플릿/_만드는중"];
const 팩방 = 팩자리[0];
/** 팩 이름이 두 자리 중 어디에 있는지 찾아 준다 */
const 팩길 = (팩: string): string => 팩자리.map((r) => `${r}/${팩}`).find((p) => existsSync(p)) ?? `${팩방}/${팩}`;
/** 두 자리를 합쳐 훑는다 — 같은 이름이 겹치면 _판매팩 이 이긴다 */
const 팩훑기 = (거르개?: (e: { name: string }) => boolean): string[] => {
  const 본것 = new Set(), 모음 = [];
  for (const r of 팩자리) {
    let 목록; try { 목록 = readdirSync(r, { withFileTypes: true }); } catch { continue; }
    for (const e of 목록) {
      if (!e.isDirectory() || 본것.has(e.name)) continue;
      if (거르개 && !거르개(e)) continue;
      본것.add(e.name); 모음.push(e.name);
    }
  }
  return 모음;
};
const 고른팩 = process.argv[2];

/** 이보다 길게 이어지면 평평하다고 본다. 위 주석의 셈에서 나온 값이다. */
const 참는길이 = 12;

/** 카드로 볼 클래스 — 팩마다 이름이 다르다.
 *
 * ⚠ 아코디언(`acc-`)은 뺀다 (2026-08-14). 처음엔 걸렸는데, 열어 보니
 *   LMS 「수강생 상세 — 진도 현황」의 차시 목록이었다. 30차시짜리 강의면 줄이 30개인 것이
 *   «맞다» — 접었다 폈다 하는 목록이지 눈으로 훑는 카드가 아니다.
 *   표(`table`)도 같은 까닭으로 애초에 안 본다. **길어야 할 것을 짧게 만들면 더 나쁘다.** */
const 카드인가 = (c: string) => /\b(card|mcard|scard|item|tile|prod|goods)\b/.test(c) && !/\bacc-/.test(c);

const 팩들 = 팩훑기((e) => /_(디럭스|프리미엄)$/.test(e.name)).filter((n) => !고른팩 || n === 고른팩);

let 틀린팩 = 0;
console.log(`한 화면에 같은 꼴 카드가 ${참는길이}개 넘게 이어지나 (평평함)\n`);

for (const 팩 of 팩들) {
  const pages = join(팩길(팩), "완성화면", "pages");
  if (!existsSync(pages)) continue;
  const 흠: string[] = [];
  let 가장긴것 = 0;

  for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
    const 글월 = readFileSync(join(pages, f), "utf8");
    /* 여는 태그만 차례로 훑는다. 같은 클래스가 «연달아» 나오면 잇는다.
       ⚠ data-pane-body(탭 칸)가 끼어들면 «줄 세기」를 끊는다(2026-08-18) —
       인테리어 CS-04 자재 탭은 바닥·벽·주방·욕실·창호 다섯 칸에 나눠 셋씩만
       [hidden] 없이 보이는데, 이 글자 훑기는 다섯 칸을 이어 붙여 13개로 세고 있었다.
       한 번에 하나의 탭만 눈에 보이므로 탭이 바뀌면 다른 줄이다. */
    let 앞클래스 = "", 이어짐 = 0;
    for (const [토큰, 클래스] of 글월.matchAll(/<div class="([^"]+)"|data-pane-body=/g)) {
      if (토큰 === "data-pane-body=") { 앞클래스 = ""; 이어짐 = 0; continue; }
      if (!카드인가(클래스)) continue;
      if (클래스 === 앞클래스) 이어짐 += 1;
      else { 앞클래스 = 클래스; 이어짐 = 1; }
      가장긴것 = Math.max(가장긴것, 이어짐);
      if (이어짐 === 참는길이 + 1) {
        흠.push(`${f} — 「${클래스.slice(0, 28)}」 카드가 ${참는길이}개 넘게 줄지어 있다`);
      }
    }
  }

  if (흠.length) {
    틀린팩 += 1;
    console.log(`  ✗ ${팩}  (가장 긴 줄 ${가장긴것}개)`);
    for (const h of 흠.slice(0, 5)) console.log(`      ${h}`);
    if (흠.length > 5) console.log(`      … 그리고 ${흠.length - 5}건 더`);
  } else {
    console.log(`  ✓ ${팩.padEnd(18)} 가장 긴 줄 ${가장긴것}개`);
  }
}

console.log(틀린팩 ? `\n${틀린팩}개 팩에 평평한 화면이 있습니다.` : "\n지나치게 평평한 화면은 없습니다.");
process.exit(틀린팩 ? 1 : 0);
