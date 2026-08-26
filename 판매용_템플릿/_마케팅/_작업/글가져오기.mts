/* 검수 화면에서 사장님이 고치신 «글»을 로컬 대본·인트로설정으로 가져온다. (2026-08-17)
 *
 *   npx tsx "판매용_템플릿/_마케팅/_작업/글가져오기.mts" <대본.json> <인트로설정.json> <회차> <이름>
 *
 * 왜 필요한가
 *   사장님은 검수 화면에서 글을 고치시고, 나는 로컬에서 영상을 굽는다.
 *   상단 띠와 커버 글은 «구울 때» 그림에 박히므로, 로컬 파일이 옛 글이면
 *   DB 에는 새 글이 있는데 그림에는 옛 글이 박힌 채로 나간다.
 *   그래서 굽기 «전»에 DB 에서 글을 끌어온다. 손으로 옮겨 적으면 반드시 어긋난다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
config({ path: ".env.local" });
const { db } = await import("@/db/client");
const { snsContent, snsCut } = await import("@/db/schema");

const [, , 대본길, 인트로길, 회차, 이름] = process.argv;
if (!대본길 || !인트로길 || !회차 || !이름) {
  console.error("쓰는 법: npx tsx 글가져오기.mts <대본.json> <인트로설정.json> <회차> <이름>");
  process.exit(2);
}

const [편] = await db
  .select()
  .from(snsContent)
  .where(and(eq(snsContent.batch, 회차), eq(snsContent.slug, 이름)));
if (!편) { console.error(`검수기에 ${회차} · ${이름} 이 없습니다.`); process.exit(1); }

const 대본들 = JSON.parse(readFileSync(대본길, "utf8"));
const 짝 = 대본들.find((p: { 이름?: string }) => p.이름 === 이름);
if (!짝) { console.error(`대본에 「${이름}」 이 없습니다.`); process.exit(1); }
짝.세로제목 = 편.verticalTitle;
짝.가로제목 = 편.horizontalTitle;

/* ⭐ 자막도 가져온다 (2026-08-18). 사장님이 검수 화면에서 22칸을 통째로 다시 쓰셨는데,
   로컬 대본은 옛 글이라 그대로 구우면 **승인하신 글이 아닌 영상**이 나간다.
   칸 번호(ord)로 맞춘다 — 로컬 대본의 칸 수와 다르면 멈춘다. */
const 칸들 = await db.select().from(snsCut).where(eq(snsCut.contentId, 편.id)).orderBy(snsCut.ord);
const 로컬칸 = (짝 as { 칸들?: { cap?: string[] }[] }).칸들 ?? [];
if (칸들.length !== 로컬칸.length) {
  console.error(`칸 수가 다릅니다 — 검수기 ${칸들.length}칸 · 로컬 대본 ${로컬칸.length}칸.`);
  console.error("먼저 칸 수를 맞춘 뒤에 가져오세요. 자막이 엉뚱한 칸에 들어가면 조용히 어긋납니다.");
  process.exit(1);
}
let 바뀐칸 = 0;
칸들.forEach((c, i) => {
  const 새것 = JSON.parse(c.captionJson || "[]") as string[];
  if (JSON.stringify(로컬칸[i].cap ?? []) !== JSON.stringify(새것)) 바뀐칸 += 1;
  로컬칸[i].cap = 새것;
});
/* ⭐ 캡션머리도 가져온다 (2026-08-18).
 *
 * ⛔ 이게 없어서 어긋났다. 사장님은 검수 화면에서 캡션 위 3~5줄을 쓰시는데,
 *   로컬 대본의 `캡션머리` 는 빈 채로 남아 있었다. 그 상태로 `검수보내기` 를
 *   다시 돌리면 «고정 블록만» 써서 **사장님 글이 지워진다.**
 *
 * 어디서 자르나 — 고정 블록은 늘 「📍」로 시작한다. 그 앞이 머리다.
 *   정규식을 안 쓴다. 이 파일을 스크립트로 고칠 때 역슬래시가 먹혀서 몇 번 당했다.
 * ⚠ 「📍」를 못 찾으면 **아무것도 안 건드린다.** 틀이 바뀐 것일 수 있는데,
 *   그때 통째로 머리에 넣으면 고정 블록이 대본에 박혀 두 번 나간다.
 */
let 캡션말 = "캡션머리   (검수기에 캡션이 없습니다)";
if (편.captionYoutube) {
  const 자를곳 = 편.captionYoutube.indexOf("📍");
  if (자를곳 < 0) {
    캡션말 = "캡션머리   ⚠ 고정 블록(📍)을 못 찾아 그대로 뒀습니다";
  } else {
    const 머리 = 편.captionYoutube.slice(0, 자를곳).trim();
    const 옛것 = (짝 as { 캡션머리?: string }).캡션머리 ?? "";
    (짝 as { 캡션머리?: string }).캡션머리 = 머리;
    const 몇줄 = 머리 ? 머리.split(String.fromCharCode(10)).filter((l) => l.trim()).length : 0;
    캡션말 = `캡션머리   ${몇줄}줄 · ${[...머리].length}자` + (옛것 === 머리 ? " (그대로)" : " ← 가져왔습니다");
  }
}

/* ⛔ 저장은 «다 고친 뒤에» 한 번씩만 한다 (2026-08-26 사장님: 「왜 여기가 아직도
     한 줄 프롬프트로 나오지? 고수매칭 사이트 편으로 썼는데」).

   여기가 이렇게 돼 있었다:
     ① 대본을 저장한다
     ② 그러고 «나서» 대본의 ep 를 고친다        ← 이미 저장한 뒤라 그대로 버려진다
     ③ 인트로는 «커버 카피가 있을 때만» 저장한다  ← 부제·태그만 고치면 안 저장된다

   그래서 사장님이 「고수매칭 사이트 편」으로 바꾸셔도 영상 아래 띠는
   「-한 줄 프롬프트 편-」 그대로였다. 그 띠를 만드는 것이 «대본의 ep» 다
   (영상굽기.mjs 의 subcap — 대본에 서브카피가 따로 없으면 ep 로 만든다).
   커버(인트로)는 제대로 바뀌었으니 «반쯤만» 반영돼 더 찾기 어려웠다.

   → 고칠 것을 다 고치고, 마지막에 저장한다. 저장을 조건 안에 넣지 않는다.

   ⚠ 인트로설정이 없는 편은 두 길이 «같은 파일»이다(지킴이가 대본 길을 두 번 넘긴다).
     그때 인트로를 따로 읽어 쓰면, 먼저 저장한 자막 고침을 덮어 버린다. */
if (편.ep) 짝.ep = 편.ep;

const 같은파일 = resolve(대본길) === resolve(인트로길);
const 인트로들 = 같은파일 ? 대본들 : JSON.parse(readFileSync(인트로길, "utf8"));
const 인짝 = 인트로들.find((s: { 이름?: string }) => s.이름 === 이름);
if (인짝) {
  if (편.coverSub) 인짝.cap = 편.coverSub;
  if (편.ep) 인짝.ep = 편.ep;
  if (편.coverTitle) 인짝.title = 편.coverTitle;
}

writeFileSync(대본길, JSON.stringify(대본들, null, 2) + "\n");
if (!같은파일) writeFileSync(인트로길, JSON.stringify(인트로들, null, 2) + "\n");

const 보기 = (s: string) => s.replaceAll("|", " / ");
console.log("검수기 → 로컬로 가져왔습니다.");
console.log(`  상단 띠(세로) 「${보기(편.verticalTitle)}」`);
console.log(`  상단 띠(가로) 「${보기(편.horizontalTitle)}」`);
console.log(`  커버 카피     「${보기(편.coverTitle || "(비어 있음)")}」`);
console.log(`  자막          ${칸들.length}칸 (${바뀐칸}칸이 달라져서 가져왔습니다)`);
console.log(`  ${캡션말}`);
console.log("\n⚠ 이제 영상굽기 → 영상인트로 를 다시 돌려야 그림에 이 글이 박힙니다.");
process.exit(0);
