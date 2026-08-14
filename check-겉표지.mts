/* 손님이 zip 을 열면 처음 보는 `index.html` 이 «참말»을 하는지 본다. (검수항목 C1·C2·C3)
 *
 * 왜 만드나
 *   index.html 은 팩의 겉표지다. 「가이드 03 코럴 선셋 × 레이아웃 A 대시보드형」처럼
 *   무엇이 들어 있는지 손님에게 알려 준다. **그 말이 틀리면 손님은 열자마자 속는다.**
 *
 *   실제로 세 번 틀렸다 (2026-08-11)
 *     · 뷰티샵·매칭·여행 세 팩이 「소프트 파스텔」이라 적고 있었다 — 이미 폐기한 색이다
 *     · 뷰티샵 디럭스가 「목록 중심형」이라 적었는데 그 팩에는 그 레이아웃이 없었다
 *     · 여행 두 팩이 «없는 JSON 파일 이름»을 손님에게 알려 주고 있었다
 *
 * ⚠ 「이름이 유효한가」로는 부족하다 (2026-08-14 에 알았다)
 *   「목록 중심형」은 lib/design-presets.ts 에 «있는» 이름이다. 그런데도 틀렸다 —
 *   **그 팩에 그 파일이 없었기** 때문이다. 그러니 참값은 목록이 아니라
 *   «그 팩의 디자인프리셋 폴더»다. 번호(03)와 글자(B)까지 맞아야 한다.
 *
 * 무엇을 보나
 *   C1 「가이드 03 코럴 선셋」  → 가이드_03_코럴선셋.md 가 그 팩에 있나
 *   C2 「레이아웃 A 대시보드형」 → 레이아웃_A_대시보드형.md 가 그 팩에 있나
 *   C3 「07_AI빌드_스펙팩.json」 → 그 파일이 그 팩에 있나
 *
 * 쓰는 법
 *   npx tsx check-겉표지.mts 뷰티샵_디럭스
 *   npx tsx check-겉표지.mts                (팩 전부)
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const 팩방 = "판매용_템플릿/_판매팩";
const 고른팩 = process.argv[2];

/** 파일 이름과 겉표지 글은 띄어쓰기가 다르다 — 「코럴 선셋」 vs 「코럴선셋」. 지우고 견준다. */
const 붙이기 = (s: string) => s.replace(/\s+/g, "");

const 팩들 = readdirSync(팩방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /_(디럭스|프리미엄)$/.test(e.name))
  .map((e) => e.name)
  .filter((n) => !고른팩 || n === 고른팩);

let 틀린팩 = 0;
console.log("겉표지가 참말을 하나 — index.html ↔ 팩에 실제로 든 파일\n");

for (const 팩 of 팩들) {
  const 표지길 = join(팩방, 팩, "완성화면", "index.html");
  if (!existsSync(표지길)) { console.log(`  ⊘ ${팩.padEnd(18)} index.html 이 없습니다`); 틀린팩 += 1; continue; }
  const 표지 = readFileSync(표지길, "utf8");
  const 프리셋방 = join(팩방, 팩, "디자인프리셋");
  const 있는것 = existsSync(프리셋방) ? readdirSync(프리셋방) : [];
  const 흠: string[] = [];

  /* C1 — 「가이드 03 코럴 선셋」이 가이드_03_코럴선셋.* 로 있나 */
  for (const [, 번호, 이름] of 표지.matchAll(/가이드\s*(\d{1,2})\s+([가-힣A-Za-z]+(?:\s+[가-힣A-Za-z]+)*?)\s*(?:×|<|·|\)|$)/gm)) {
    const 바라는 = `가이드_${번호.padStart(2, "0")}_${붙이기(이름)}`;
    if (!있는것.some((f) => f.startsWith(바라는))) {
      const 진짜 = 있는것.filter((f) => f.startsWith(`가이드_${번호.padStart(2, "0")}`) && f.endsWith(".md"));
      흠.push(`C1 색  「가이드 ${번호} ${이름}」이라 적었는데 ${바라는}.md 가 없다` +
        (진짜.length ? ` — 실제로는 ${진짜[0].replace(/\.md$/, "")}` : ""));
    }
  }

  /* C2 — 「레이아웃 A 대시보드형」이 레이아웃_A_대시보드형.* 로 있나 */
  for (const [, 글자, 이름] of 표지.matchAll(/레이아웃\s*([A-Z])\s+([가-힣]+(?:\s+[가-힣]+)*?형)/g)) {
    const 바라는 = `레이아웃_${글자}_${붙이기(이름)}`;
    if (!있는것.some((f) => f.startsWith(바라는))) {
      const 진짜 = 있는것.filter((f) => f.startsWith(`레이아웃_${글자}`) && f.endsWith(".md"));
      흠.push(`C2 뼈대 「레이아웃 ${글자} ${이름}」이라 적었는데 ${바라는}.md 가 없다` +
        (진짜.length ? ` — 실제로는 ${진짜[0].replace(/\.md$/, "")}` : ""));
    }
  }

  /* C3 — 겉표지가 가리키는 .json 이 팩 안에 있나.
     팩 뿌리와 디자인프리셋 두 곳을 본다 — 스펙팩은 뿌리에, 프리셋 토큰은 프리셋 폴더에 있다. */
  const 뿌리것 = readdirSync(join(팩방, 팩));
  for (const [, 파일] of 표지.matchAll(/([가-힣A-Za-z0-9_]+\.json)/g)) {
    if (!뿌리것.includes(파일) && !있는것.includes(파일)) 흠.push(`C3 파일 「${파일}」을 가리키는데 그 파일이 없다`);
  }

  if (흠.length) {
    틀린팩 += 1;
    console.log(`  ✗ ${팩}`);
    for (const h of [...new Set(흠)]) console.log(`      ${h}`);
  } else {
    console.log(`  ✓ ${팩.padEnd(18)} 가이드·레이아웃·JSON 이 다 제자리에 있다`);
  }
}

console.log(틀린팩 ? `\n${틀린팩}개 팩의 겉표지가 틀립니다.` : "\n겉표지가 모두 참말을 합니다.");
process.exit(틀린팩 ? 1 : 0);
