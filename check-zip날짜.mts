/* 파는 zip 이 «지금 팩»으로 구운 것인지 본다. (검수항목 B9)
 *
 * 왜 만드나 (2026-08-11 에 실제로 겪었다)
 *   `npm run pack` 은 zip 을 **안 굽는다.** `package-template.mts --zip` 이 굽는다.
 *   그걸 모르고 팩 넷을 고친 뒤 「zip 다시 구웠다」고 **두 번** 보고했는데,
 *   zip 은 전날 것이었다. 고친 것이 손님에게 안 갔다.
 *   그런데도 검사기가 «옛 zip 을 보고» 조용히 통과시켰다 — 그래서 아무도 몰랐다.
 *
 * ⚠ 「오늘 구웠나」로 재면 안 된다 (2026-08-14 에 바로잡음)
 *   팩을 안 고친 날에도 zip 을 다시 구우라는 말이 되어 버린다. 쓸데없는 일이다.
 *   재야 할 것은 날짜가 아니라 **차례**다 — zip 이 팩보다 «나중»이면 성한 것이다.
 *   그래서 팩 안에서 제일 늦게 고쳐진 파일과 zip 을 견준다.
 *
 * ⚠ zip 이 없으면 «건너뛴다». 저장소에는 zip 을 두지 않으므로(용량) 클라우드나
 *   갓 받은 저장소에서는 잴 것이 없다. 없는 것을 흠이라 하면 늘 빨간불이 켜진다.
 *
 * 쓰는 법
 *   npx tsx check-zip날짜.mts 뷰티샵_디럭스
 *   npx tsx check-zip날짜.mts               (팩 전부)
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const 팩방 = "판매용_템플릿/_판매팩";
const 고른팩 = process.argv[2];

/** 폴더 아래에서 제일 «늦게» 고쳐진 시각. 완성화면·프리셋·문서를 다 본다. */
function 가장늦은시각(방: string): { 때: number; 무엇: string } {
  let 때 = 0, 무엇 = "";
  const 훑기 = (여기: string) => {
    for (const e of readdirSync(여기, { withFileTypes: true })) {
      const 길 = join(여기, e.name);
      if (e.isDirectory()) { 훑기(길); continue; }
      const t = statSync(길).mtimeMs;
      if (t > 때) { 때 = t; 무엇 = 길.slice(방.length + 1); }
    }
  };
  훑기(방);
  return { 때, 무엇 };
}

const 때글 = (ms: number) => new Date(ms).toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" });

const 팩들 = readdirSync(팩방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /_(디럭스|프리미엄|스탠다드|플러스)$/.test(e.name))
  .map((e) => e.name)
  .filter((n) => !고른팩 || n === 고른팩);

let 낡은것 = 0, 건너뛴것 = 0;
console.log("파는 zip 이 지금 팩으로 구운 것인가 — zip 이 팩보다 나중이어야 한다\n");

for (const 팩 of 팩들) {
  const zip길 = join(팩방, `${팩}.zip`);
  if (!existsSync(zip길)) { 건너뛴것 += 1; continue; }
  const zip때 = statSync(zip길).mtimeMs;
  const { 때: 팩때, 무엇 } = 가장늦은시각(join(팩방, 팩));

  if (zip때 < 팩때) {
    낡은것 += 1;
    console.log(`  ✗ ${팩}`);
    console.log(`      zip  ${때글(zip때)}`);
    console.log(`      팩   ${때글(팩때)}  ← ${무엇}`);
    console.log(`      팩을 고친 뒤 zip 을 안 구웠다. npx tsx package-template.mts --zip`);
  } else {
    console.log(`  ✓ ${팩.padEnd(18)} zip ${때글(zip때)}`);
  }
}

if (건너뛴것) console.log(`\n⊘ zip 이 없어 건너뛴 팩 ${건너뛴것}개 — 저장소에는 zip 을 두지 않는다.`);
console.log(낡은것 ? `\n${낡은것}개 팩의 zip 이 낡았습니다.` : "\nzip 이 다 팩보다 나중입니다.");
process.exit(낡은것 ? 1 : 0);
