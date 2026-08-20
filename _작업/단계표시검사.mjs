/* 단계 표시(.hsteps)가 «한 줄»에 있는지 실제로 그려서 잰다.
 *
 * 왜 (2026-08-13)
 *   `.hsteps .st{min-width:120px}` 이라 셋에 384px 이 필요한데 좁은 단(310px)에 들어가면
 *   둘만 남고 셋째가 아래로 밀린다. 「1 2 / 3」 꼴로 깨져 보였다.
 *   ⚠ 좁아지는 까닭이 «화면 폭»이 아니라 «단»이라 반응형 예외로는 안 잡힌다 —
 *     1440 에서도 깨져 있었다. 그래서 «그려서» 재야 안다.
 *
 * 쓰는 법:  node _작업/단계표시검사.mjs [팩이름 ...]
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/* ⛔ 헤드리스 크롬은 부를 때마다 %TEMP% 아래 HeadlessChrome<난수> 를 만들고 «끝나도 안 지운다».
   한 쪽에 한 번씩 부르는 도구는 그것이 그대로 쌓인다 —
   2026-08-20 에 23,299개 · 34GB 가 쌓여 C 드라이브를 먹고 있었다.
   프로필 자리를 우리가 정해 주고, 다 돌면 그 자리를 지운다. */
const 크롬찌꺼기 = `${(process.env.TEMP || "/tmp").split(String.fromCharCode(92)).join("/")}/cc-chrome-${process.pid}`;
(() => {                       /* 시작할 때 «묵은 것»부터 치운다 — 크롬이 물고 있어 못 지운 자리들 */
  const fs_ = require("node:fs");
  const 방 = 크롬찌꺼기.slice(0, 크롬찌꺼기.lastIndexOf("/"));
  try {
    for (const d of fs_.readdirSync(방)) {
      if (!d.startsWith("cc-chrome-")) continue;
      try { fs_.rmSync(방 + "/" + d, { recursive: true, force: true }); } catch { /* 아직 쓰는 중이면 다음에 */ }
    }
  } catch { /* 폴더가 없으면 그만 */ }
})();
process.on("exit", () => { try { require("node:fs").rmSync(크롬찌꺼기, { recursive: true, force: true }); } catch {} });

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 팩방 = "판매용_템플릿/_판매팩";
const W = `${process.env.TEMP.replace(/\\/g, "/")}/cc-hsteps`;

const 팩들 = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(팩방, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);

const 잴것 = `
  addEventListener("load", () => {
    const 것 = [...document.querySelectorAll(".hsteps")].map((g) => {
      const 칸 = [...g.children].map((el) => {
        const b = el.getBoundingClientRect();
        return { 위: Math.round(b.top), 폭: Math.round(b.width), 글: el.textContent.trim().slice(0, 12) };
      });
      return { 묶음폭: Math.round(g.getBoundingClientRect().width), 칸수: 칸.length,
               줄수: new Set(칸.map((c) => c.위)).size, 칸 };
    });
    document.title = JSON.stringify(것);
  });`;

let 본것 = 0, 깨진것 = 0;
for (const 팩 of 팩들) {
  const pages = join(팩방, 팩, "완성화면", "pages");
  if (!existsSync(pages)) continue;
  const 있는것 = readdirSync(pages).filter((f) => f.endsWith(".html") && readFileSync(join(pages, f), "utf8").includes('class="hsteps"'));
  if (!있는것.length) continue;

  /* 한글 경로에서는 크롬이 «아무 말 없이» 아무것도 안 만든다. 영문 폴더에 옮겨 놓고 연다. */
  rmSync(W, { recursive: true, force: true });
  cpSync(join(팩방, 팩, "완성화면"), W, { recursive: true });

  const 흠 = [];
  for (const f of 있는것) {
    const 길 = join(W, "pages", `_잴것_${f}`);
    writeFileSync(길, readFileSync(join(W, "pages", f), "utf8").replace("</body>", `<script>${잴것}<\/script></body>`), "utf8");
    const dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--hide-scrollbars",
      "--force-device-scale-factor=1", "--window-size=1536,1200", "--virtual-time-budget=4000",
      "--dump-dom", `file:///${길.replace(/\\/g, "/")}`], { encoding: "utf8", maxBuffer: 1 << 26 });
    const 것들 = JSON.parse(/<title>([\s\S]*?)<\/title>/.exec(dom)?.[1] ?? "[]");
    for (const g of 것들) {
      본것 += 1;
      if (g.줄수 > 1) { 깨진것 += 1; 흠.push(`    ${f}  단계 ${g.칸수}개가 ${g.줄수}줄로 깨짐 (묶음 ${g.묶음폭}px · 칸 ${g.칸.map((c) => c.폭).join("/")})`); }
    }
  }
  console.log(`  ${흠.length ? "✗" : "✓"} ${팩.padEnd(18)} ${있는것.length}장 · 단계표시 ${있는것.length ? "" : ""}${흠.length ? `깨짐 ${흠.length}` : "모두 한 줄"}`);
  if (흠.length) console.log(흠.join("\n"));
}
rmSync(W, { recursive: true, force: true });
console.log(`\n모두 ${본것}곳 · 깨진 것 ${깨진것}곳`);
process.exit(깨진것 ? 1 : 0);
