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
 * ⚠ zip 이 없으면 «건너뛴다». 갓 받은 저장소에서는 잴 것이 없다.
 *   없는 것을 흠이라 하면 늘 빨간불이 켜진다.
 *
 * ⭐ 2026-09-10 — «어느 zip» 을 보는지 바꿨다 (현님 지시)
 *   전에는 `_판매팩/<팩>.zip` 을 봤다. 그런데 그건 굽는 쪽이 같은 buf 를 두 곳에 쓰면서
 *   생긴 «사본»이었고, 손님이 실제로 받는 것은 `packs/<pkgId>-<tier>.zip` 이다.
 *   사본 32벌 86MB 를 지우면서, 이 검사도 «손님이 받는 쪽»을 보게 옮겼다.
 *   재는 물음이 「zip 을 다시 구웠나」에서 「손님이 받는 것이 지금 팩인가」로 또렷해진다.
 *
 * 쓰는 법
 *   npx tsx check-zip날짜.mts 뷰티샵_디럭스
 *   npx tsx check-zip날짜.mts               (팩 전부)
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { PACKAGES, PLAN_NAMES, type PlanId } from "@/lib/packages";

const 팩방 = "판매용_템플릿/_판매팩";
const 파는방 = "packs";

/** 「뷰티샵_프리미엄」 → 「packs/beauty-premium.zip」.
 *  굽는 쪽(package-template.mts)이 zipName = `${fileLabel}_${PLAN_NAMES[tier]}` 로 짓고
 *  파는 자리에는 `${pkgId}-${tier}.zip` 으로 둔다. 그 짝을 여기서 되짚는다.
 *  ⚠ 이름을 손으로 적지 않는다 — lib/packages.ts 가 주인이라 거기만 고치면 따라온다. */
function 파는zip길(폴더이름: string): string | null {
  for (const p of PACKAGES) {
    if (!폴더이름.startsWith(`${p.fileLabel}_`)) continue;
    const 등급말 = 폴더이름.slice(p.fileLabel.length + 1);
    for (const [tier, 말] of Object.entries(PLAN_NAMES)) {
      if (말 === 등급말) return join(파는방, `${p.id}-${tier as PlanId}.zip`);
    }
  }
  return null;
}
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
  const zip길 = 파는zip길(팩);
  if (!zip길 || !existsSync(zip길)) { 건너뛴것 += 1; continue; }
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

if (건너뛴것) console.log(`\n⊘ 파는 zip 이 없어 건너뛴 팩 ${건너뛴것}개 — packs/ 에 없는 칸이다.`);
console.log(낡은것 ? `\n${낡은것}개 팩의 zip 이 낡았습니다.` : "\nzip 이 다 팩보다 나중입니다.");
process.exit(낡은것 ? 1 : 0);
