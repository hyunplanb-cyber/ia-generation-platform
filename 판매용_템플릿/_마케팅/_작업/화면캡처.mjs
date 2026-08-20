/* 팩의 «완성화면» 을 영상 재료로 캡처한다 — 1440 폭 · 길게.
 *
 * 영상굽기.mjs 는 캡처에서 1440×1125 를 «골라» 잘라 쓴다(빽빽한 자리를 스스로 찾는다).
 * 그러니 캡처는 화면 아래까지 길게 떠 둬야 고를 거리가 생긴다. 1150 으로 뜨면
 * 고를 자리가 없어 늘 같은 데만 나온다.
 *
 * ⚠ 한글 경로에서 헤드리스 크롬은 조용히 아무것도 안 만든다.
 *   그래서 완성화면 폴더를 통째로 «아스키 자리»에 복사해 놓고 찍는다.
 *   페이지가 css·js 를 상대 경로로 부르므로 파일만 옮기면 민얼굴로 찍힌다.
 *
 * 쓰는 법
 *   node 판매용_템플릿/_마케팅/_작업/화면캡처.mjs <완성화면폴더> <나갈폴더> [화면ID ...]
 *   화면ID 를 안 주면 pages/ 안 전부를 찍는다.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, cpSync } from "node:fs";
import { readdirSync as 훑기, rmSync as 지우기 } from "node:fs";

/* ⛔ 헤드리스 크롬은 부를 때마다 %TEMP% 아래 HeadlessChrome<난수> 를 만들고 «끝나도 안 지운다».
   한 쪽에 한 번씩 부르는 도구는 그것이 그대로 쌓인다 —
   2026-08-20 에 23,299개 · 12.6GB 가 쌓여 C 드라이브를 먹고 있었다.
   프로필 자리를 우리가 정해 주고, 시작할 때와 끝날 때 치운다.
   ⚠ .mjs 는 ES 모듈이라 require 가 없다. 처음에 require 로 썼다가 15개를 다 깨뜨렸다. */
const 크롬찌꺼기 = `${(process.env.TEMP || "/tmp").split(String.fromCharCode(92)).join("/")}/cc-chrome-${process.pid}`;
(() => {                       /* 시작할 때 «묵은 것»부터 — 크롬이 물고 있어 못 지운 자리들 */
  const 방 = 크롬찌꺼기.slice(0, 크롬찌꺼기.lastIndexOf("/"));
  try {
    for (const d of 훑기(방)) {
      if (!d.startsWith("cc-chrome-")) continue;
      try { 지우기(방 + "/" + d, { recursive: true, force: true }); } catch { /* 아직 쓰는 중이면 다음에 */ }
    }
  } catch { /* 폴더가 없으면 그만 */ }
})();
process.on("exit", () => { try { 지우기(크롬찌꺼기, { recursive: true, force: true }); } catch {} });


const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 인자 = process.argv.slice(2);
/** `--가로` 를 주면 1440×1000 으로 짧게 찍는다.
 *  홈페이지 상세 카드에 올리는 그림은 «옆으로 미는 카드»라 긴 세로가 안 맞는다
 *  (팩화면-웹용.mts 가 이 「가로」를 읽어 webp 로 줄인다). 영상 재료는 긴 쪽을 쓴다. */
const 가로인가 = 인자.includes("--가로");
const [완성화면, 나갈곳, ...고른것] = 인자.filter((x) => x !== "--가로");
if (!완성화면 || !나갈곳) throw new Error("쓰는 법: 화면캡처.mjs [--가로] <완성화면폴더> <나갈폴더> [화면ID ...]");

const 폭 = 1440, 높이 = 가로인가 ? 1000 : 2600;
const W = `${process.env.TEMP.replace(/\\/g, "/")}/cc-shot-src`;

rmSync(W, { recursive: true, force: true });
cpSync(완성화면, W, { recursive: true });
mkdirSync(나갈곳, { recursive: true });

const 있는것 = readdirSync(`${W}/pages`).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, ""));
const 찍을것 = 고른것.length ? 고른것 : 있는것;
const 없는것 = 찍을것.filter((id) => !있는것.includes(id));
if (없는것.length) throw new Error(`팩에 없는 화면입니다: ${없는것.join(", ")}`);

let n = 0;
for (const id of 찍을것) {
  const 낼길 = `${나갈곳}/${id}.png`;
  if (existsSync(낼길)) rmSync(낼길);
  execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", `--window-size=${폭},${높이}`,
    `--screenshot=${낼길}`, "--virtual-time-budget=6000", `file:///${W}/pages/${id}.html`],
    { stdio: "pipe" });
  /* 안 생겼으면 바로 멈춘다 — 조용히 넘어가면 묵은 캡처로 영상을 굽게 된다. */
  if (!existsSync(낼길)) throw new Error(`못 찍었습니다: ${id} (경로에 한글이 있나?)`);
  n++;
  if (n % 10 === 0) console.log(`  ${n}/${찍을것.length}`);
}
console.log(`\n${n}장 → ${나갈곳}  (${폭}×${높이})`);
