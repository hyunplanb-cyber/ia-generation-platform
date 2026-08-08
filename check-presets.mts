/* 레이아웃 문서(글)와 뼈대(코드)가 같은 말을 하는지 본다.
 *
 * 왜 만드나
 *   2026-08-08 에 sidebar·multi 뼈대로 실물을 만들어 보다가 찾았다.
 *   `showcase.list` 는 「매거진형 2열」이라고 적혀 있었는데
 *   `STRUCTURE_COLS.multi` 는 [3,2,1] — 1440px 에서 3열이다.
 *   split 도 같았고, calm 은 글이 2열인데 코드는 1열이었다.
 *
 *   글과 코드가 싸우면 만드는 쪽은 아무거나 고른다. 그래서 셋을 코드에 맞췄다.
 *   사람이 글을 고칠 때 또 어긋날 수 있으므로 검사를 남긴다.
 *
 * 쓰는 법: npx tsx check-presets.mts
 *   어긋난 게 있으면 1 로 끝난다. 팩을 굽기 전에 돌린다.
 */
import { LAYOUTS, STRUCTURE_COLS, THUMBS, cardWidth } from "./lib/design-presets";

/* 「N열」만 본다. 「N단」은 히어로·상세의 좌우 나눔을 뜻해서 카드 칸 수와 무관하다. */
const 열찾기 = /([0-9])\s*열/g;

let 어긋남 = 0;

for (const L of LAYOUTS) {
  const [c1, c2, c3] = STRUCTURE_COLS[L.structure];
  const T = THUMBS.find((t) => t.key === L.thumb)!;
  const 글: [string, string][] = [
    ["hero", L.hero], ["list", L.list], ["nav", L.nav], ["detail", L.detail],
  ];

  const 문제: string[] = [];
  for (const [자리, 문장] of 글) {
    let m;
    열찾기.lastIndex = 0;
    while ((m = 열찾기.exec(문장)) !== null) {
      const 적힌수 = Number(m[1]);
      /* 좁은 화면 칸수(c2·c3)를 같이 적어 두는 것은 맞는 서술이다. */
      if (적힌수 !== c1 && 적힌수 !== c2 && 적힌수 !== c3) {
        문제.push(`${자리}에 「${m[0]}」 — 코드는 ${c1}/${c2}/${c3}열`);
      }
    }
  }

  const 표 = `${L.key.padEnd(10)}${L.label.padEnd(10)}뼈대=${L.structure.padEnd(10)}카드=${L.thumb.padEnd(8)}`
    + `${c1}/${c2}/${c3}열 · 카드 ${cardWidth(c1, 1440, L.structure)}px`
    + (T.aspect ? ` · 비율 ${T.aspect}` : "");

  if (문제.length) {
    어긋남 += 문제.length;
    console.log(`✗ ${표}`);
    문제.forEach((x) => console.log(`    ${x}`));
  } else {
    console.log(`· ${표}`);
  }
}

console.log("");
if (어긋남) {
  console.log(`어긋난 곳 ${어긋남}군데. lib/design-presets.ts 의 글을 코드에 맞추세요.`);
  process.exit(1);
}
console.log(`레이아웃 ${LAYOUTS.length}개, 글과 코드가 같은 말을 합니다.`);
