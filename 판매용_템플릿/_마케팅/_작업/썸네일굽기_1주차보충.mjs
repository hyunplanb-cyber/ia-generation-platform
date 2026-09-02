/* 1주차에 «빠져 있던» 쇼츠용 9:16 썸네일 두 장을 뒤늦게 굽는다 (2026-08-10).
 *
 * 왜 빠졌나 — 1주차(2026-08-08)에는 썸네일을 5장만 만들었다.
 *   카드뉴스 3 + 영상 16:9 2. **쇼츠용 9:16 두 장이 없었다.**
 *   그래서 쇼츠 두 편에 붙일 것이 없었고, 유튜브 목록에서 비어 보였다.
 *   2주차는 7장(카드 3 + 16:9 2 + 9:16 2)을 만들었고 쇼츠도 잘 나온다.
 *
 * **한 회차에 썸네일은 일곱 장이다.** 카드뉴스 3 · 가로 영상 2 · 쇼츠 2.
 *   가로용을 쇼츠에 돌려 쓰지 않는다 — 쇼츠는 세로 자리라 16:9 를 넣으면 안 맞는다.
 *
 * 문구·부제는 1주차 16:9 썸네일에 있는 것을 그대로 옮겼다. 새로 짓지 않는다 —
 * 같은 편의 가로와 세로가 다른 말을 하면 안 된다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 마케팅 = "C:/Users/glim0/OneDrive/문서/Claude/Projects/02. 웹기획자/판매용_템플릿/_마케팅";
/* ⚠ 2026-08-13 에 그림을 «_이미지» 한 곳으로 모았다.
   전: _마케팅/릴스영상/_모델/고양이   후: _이미지/마스코트/낱장
   영상에 겹치는 것은 «배경이 뚫린» 낱장이라야 한다. 배경 있는 것은 마스코트/배경 에 있다. */
const 고양이방 = `${마케팅}/../_이미지/마스코트/낱장`;
const 낼방 = "G:/내 드라이브/릴스/카페인컬러_주간콘텐츠/1주차_2026-08-10";
const W = process.env.TEMP.replace(/\\/g, "/") + "/cc-thumb-w1";

rmSync(W, { recursive: true, force: true });
mkdirSync(`${W}/fonts`, { recursive: true });
writeFileSync(`${W}/style.css`,
  readFileSync(`${마케팅}/카드뉴스2.css`, "utf8").replaceAll("릴스영상/_폰트/MaruBuriTTF/", "fonts/"), "utf8");
for (const f of ["Regular", "SemiBold", "Bold"])
  copyFileSync(`${마케팅}/릴스영상/_폰트/MaruBuriTTF/MaruBuri-${f}.ttf`, `${W}/fonts/MaruBuri-${f}.ttf`);
writeFileSync(`${W}/thumb.html`,
  readFileSync(`${마케팅}/썸네일틀.html`, "utf8").replace('href="카드뉴스2.css"', 'href="style.css"'), "utf8");

/* pos 는 가로판과 «다르게» 둔다. 같은 자리에 두면 두 장이 한 장처럼 보인다. */
const 목록 = [
  { 파일: "썸네일_영상1_눌러보니까요_9x16",
    sheet: "02_IA_화면목록.xlsx · 콘텐츠 판매", rows: "HO0101,홈,ok|PR0101,상품 목록,q|BK0201,결제,q",
    pose: "똘망", pos: "peek",
    big: "AI가 만든 사이트,|눌러봤습니다",
    sub: "바이브코딩으로 만들어 놓고|진짜 굴러가는지 하나씩 확인했어요.",
    ep: "콘텐츠 판매 사이트 편" },

  { 파일: "썸네일_영상2_준비물_9x16",
    sheet: "02_IA_화면목록.xlsx · 공동구매", rows: "HO0101,홈,ok|PR0101,공구 목록,q|BK0101,참여 신청,q",
    pose: "커피_느긋", pos: "bl",
    big: "바이브코딩 준비물,|여섯 개입니다",
    sub: "AI한테 한 줄 넣기 전에|먼저 적어야 하는 것들.",
    ep: "공동구매 사이트 편" },
];

for (const t of 목록) {
  copyFileSync(`${고양이방}/${t.pose}.png`, `${W}/cat.png`);
  const q = Object.entries({ v: 9, big: t.big, sub: t.sub, ep: t.ep, face: "cat", pos: t.pos, sheet: t.sheet, rows: t.rows })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  const 낼길 = `${W}/${t.파일}.png`;
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", "--window-size=1080,1920",
    `--screenshot=${낼길}`, "--virtual-time-budget=4000", `file:///${W}/thumb.html?${q}`],
    { stdio: "pipe" });
  if (!existsSync(낼길)) throw new Error(`못 구웠습니다: ${t.파일}`);
  copyFileSync(낼길, `${낼방}/${t.파일}.png`);
  console.log(`  ${t.파일}  (${t.pose} · ${t.pos})  → ${낼방}`);
}
console.log(`\n${목록.length}장 구웠습니다. 이제 1주차도 일곱 장입니다.`);
