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

const 팩방 = "판매용_템플릿/_판매팩";
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

const 팩들 = readdirSync(팩방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /_(디럭스|프리미엄)$/.test(e.name))
  .map((e) => e.name)
  .filter((n) => !고른팩 || n === 고른팩);

let 틀린팩 = 0;
console.log(`한 화면에 같은 꼴 카드가 ${참는길이}개 넘게 이어지나 (평평함)\n`);

for (const 팩 of 팩들) {
  const pages = join(팩방, 팩, "완성화면", "pages");
  if (!existsSync(pages)) continue;
  const 흠: string[] = [];
  let 가장긴것 = 0;

  for (const f of readdirSync(pages).filter((x) => x.endsWith(".html"))) {
    const 글월 = readFileSync(join(pages, f), "utf8");
    /* 여는 태그만 차례로 훑는다. 같은 클래스가 «연달아» 나오면 잇는다. */
    let 앞클래스 = "", 이어짐 = 0;
    for (const [, 클래스] of 글월.matchAll(/<div class="([^"]+)"/g)) {
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
