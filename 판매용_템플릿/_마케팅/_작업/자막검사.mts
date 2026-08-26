/* 자막 검사기 — 대본 JSON 을 굽기 «전»에 통과해야 한다. (2026-08-17)
 *
 * 왜 만들었나
 *   2026-08-17 회차에서 사장님이 같은 영상을 세 번 돌려보내셨다.
 *   「얼굴이 나온다」·「뼈대를 고른다」·「혼자 만들면 꼭 빠지는 자리예요」·
 *   「18년 기획하면서」— 넷 다 지시서에 «이미 금지되어 있던» 것들이다.
 *   지시서는 1,000줄이고 규칙은 그 안에 흩어져 있었다. 읽고도 지키지 못했다.
 *   그래서 «읽어서 지키는 규칙»을 «세어서 막는 규칙»으로 바꿨다.
 *
 * ⚠ 규칙은 여기 없다 — `lib/sns-caption-rules.ts` 에 있다.
 *   검수 화면(`/admin/sns`)도 같은 파일을 본다. 두 곳에 두면 반드시 갈린다.
 *   그래서 이 파일은 `.mjs` 가 아니라 **`.mts`** 다(tsx 로 돌린다).
 *
 * 쓰는 법
 *   npx tsx "판매용_템플릿/_마케팅/_작업/자막검사.mts" <대본.json> [인트로설정.json]
 *   → 통과하면 0, 하나라도 걸리면 1 로 죽는다.
 *
 * ⚠ 검사기가 못 잡는 것이 하나 있다 — **자막이 «그 프레임에 실제로 보이는지».**
 *   그건 사람만 볼 수 있다. `/admin/sns` 에서 칸마다 프레임과 자막을 나란히 놓고 본다.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkScript, countLetters, type 대본 } from "@/lib/sns-caption-rules";

const 여기 = dirname(fileURLToPath(import.meta.url));
const 고양이방 = resolve(여기, "../../_이미지/마스코트/낱장");

const 대본길 = process.argv[2];
const 인트로길 = process.argv[3];
if (!대본길) {
  console.error("쓰는 법: npx tsx 자막검사.mts <대본.json> [인트로설정.json]");
  process.exit(2);
}

/** 포즈 별명표 — 대본은 옛 이름(집중·똘망)을 부르고, 실제 파일은 대표_* 다.
 *  중복을 볼 때 «실제 파일»로 견뎌야 한다. 겉이름만 보면 안 잡힌다(8/17 사고). */
const 별명 = (() => {
  const 길 = join(고양이방, "_별명.csv");
  const 표 = new Map<string, string>();
  if (!existsSync(길)) return 표;
  for (const 줄 of readFileSync(길, "utf8").replace(/^﻿/, "").split(/\r?\n/).slice(1)) {
    const [부르는, 실제] = 줄.split(",").map((s) => s?.trim());
    if (부르는 && 실제) 표.set(부르는, 실제);
  }
  return 표;
})();

const 대본들: 대본[] = JSON.parse(readFileSync(대본길, "utf8"));
const 인트로들: { 이름?: string; 영상?: string; title?: string }[] =
  인트로길 && existsSync(인트로길) ? JSON.parse(readFileSync(인트로길, "utf8")) : [];

/* 커버 글도 «손님이 읽는 글»이다 — 금지어가 새면 안 된다. 대본에 붙여서 같이 검사한다. */
for (const 편 of 대본들) {
  const 짝 = 인트로들.find((s) => s.이름 === 편.이름);
  if (짝?.title) 편.커버제목 = 짝.title;
}

console.log(`\n자막 검사 — ${대본길}`);
console.log(`대본 ${대본들.length}편${인트로들.length ? ` · 인트로설정 ${인트로들.length}건` : ""}\n`);

let 탈락 = 0;
for (const 편 of 대본들) {
  const 이름 = 편.이름 ?? "(이름 없음)";
  let 걸림 = checkScript(편, 별명);
  const 칸수 = (편.칸들 ?? []).length;
  const 길이 = (칸수 * (편.칸초 ?? 2.5)).toFixed(1);
  console.log(`— ${이름}: ${칸수}칸 · ${길이}초 · 공백 제외 ${countLetters(편.칸들 ?? [])}자`);
  /* 사유가 적힌 예외는 «알리되 막지 않는다» — 막으면 사유를 적은 뜻이 없다 (2026-08-18). */
  const 넘어간것 = 걸림.filter((g) => g.넘어감);
  걸림 = 걸림.filter((g) => !g.넘어감);
  for (const g of 넘어간것) console.log(`  ⏭ ${g.어디}
     ${g.무엇}`);
  if (!걸림.length) {
    console.log("  ✅ 통과\n");
    continue;
  }
  탈락 += 걸림.length;
  const 묶음 = new Map<string, typeof 걸림>();
  for (const g of 걸림) {
    if (!묶음.has(g.어디)) 묶음.set(g.어디, []);
    묶음.get(g.어디)!.push(g);
  }
  for (const [어디, 떼] of 묶음) {
    console.log(`  ❌ ${어디}`);
    for (const g of 떼) console.log(`     ${g.무엇}\n       → ${g.대신}\n       까닭: ${g.왜}`);
  }
  console.log("");
}

if (!탈락) {
  console.log("✅ 다 통과했습니다.");
  console.log("⚠ 다만 «자막이 그 프레임에 실제로 보이는지»는 검사기가 못 봅니다 — /admin/sns 에서 눈으로 봅니다.\n");
  process.exit(0);
}
console.log(`걸린 것 ${탈락}건. **고친 뒤에 굽습니다.**`);
console.log("⚠ 금지어를 피하려고 뜻을 흐리지 마라 — 「대신」 칸에 적힌 그 말로 바꾼다.\n");
process.exit(1);
