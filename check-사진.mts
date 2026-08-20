/* 끼워 넣은 예시 사진이 «제 칸 안에» 있는지 실제로 그려서 잰다.
 *
 * 왜 만드나 (2026-08-11 사장님 지적)
 *   매칭 팩의 base.css 에는 .ph 에 position:relative 가 없었다(다른 여섯 팩에는 있었다).
 *   그래서 내가 붙인 `position:absolute; inset:0` 사진이 저 멀리 조상을 기준으로 잡혀
 *   **64px 프로필 사진이 페이지를 통째로 덮었다.** 히어로가 아래 카드로 흘러내리고,
 *   고수 목록은 빈 네모가 되고, 분야 목록은 데스크톱에서 안 보였다.
 *   증상은 넷인데 뿌리는 하나였다.
 *
 *   check-design 도 check-zip 도 이걸 못 잡는다. 둘 다 «글자»를 보지 «그려진 자리»를 안 본다.
 *   그려 봐야만 알 수 있는 것은 그려서 재는 수밖에 없다.
 *
 * ⚠ 한글 경로에서 헤드리스 크롬은 «조용히» 아무것도 안 만든다. 반드시 아스키 자리로 옮겨 찍는다.
 * ⚠ --window-size=390 을 줘도 헤드리스는 467 밑으로 안 내려간다. 폭은 데스크톱만 잰다.
 *
 * 쓰는 법
 *   npx tsx check-사진.mts 매칭_프리미엄
 *   npx tsx check-사진.mts               (사진이 든 팩 전부)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
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
const 팩방 = "판매용_템플릿/_판매팩";
const 고른팩 = process.argv[2];

/** 브라우저 안에서 도는 잰다. 결과는 document.title 로 꺼낸다 — --dump-dom 으로 읽는다. */
const 재는글 = `
(() => {
  const 벗어난것 = [];
  for (const img of document.querySelectorAll('img[data-예시]')) {
    const 칸 = img.parentElement;
    if (!칸) continue;
    const a = img.getBoundingClientRect(), b = 칸.getBoundingClientRect();
    // 사진이 자리표보다 «크면» 새어 나온 것이다. 2px 은 반올림 여유.
    if (a.width > b.width + 2 || a.height > b.height + 2 ||
        a.left < b.left - 2 || a.top < b.top - 2) {
      벗어난것.push((img.getAttribute('src')||'').split('/').pop() +
        ' 사진 ' + Math.round(a.width) + 'x' + Math.round(a.height) +
        ' vs 자리 ' + Math.round(b.width) + 'x' + Math.round(b.height));
    }
  }
  const de = document.documentElement;
  return JSON.stringify({
    사진수: document.querySelectorAll('img[data-예시]').length,
    벗어남: 벗어난것.length,
    보기: 벗어난것.slice(0, 3),
    가로넘침: de.scrollWidth > de.clientWidth,
  });
})()`;

function 팩보기(팩: string): { 팩: string; 잰장: number; 사진: number; 벗어남: number; 넘침: number; 보기: string[] } | null {
  const 완성화면 = join(팩방, 팩, "완성화면");
  const pages = join(완성화면, "pages");
  if (!existsSync(pages)) return null;

  // 사진이 제일 많이 든 화면 다섯 장을 고른다 — 거기서 안 새면 대개 안 샌다.
  const 후보 = readdirSync(pages).filter((f) => f.endsWith(".html"))
    .map((f) => ({ f, n: (readFileSync(join(pages, f), "utf8").match(/data-예시/g) ?? []).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  if (!후보.length) return null;

  const W = join(tmpdir(), `cc-photo-${process.pid}`);
  rmSync(W, { recursive: true, force: true });
  mkdirSync(W, { recursive: true });
  cpSync(완성화면, W, { recursive: true });

  let 사진 = 0, 벗어남 = 0, 넘침 = 0;
  const 보기: string[] = [];
  for (const { f } of 후보) {
    const 길 = join(W, "pages", f);
    const 잴것 = 길.replace(/\.html$/, "._잴것.html");
    writeFileSync(잴것,
      readFileSync(길, "utf8").replace("</body>",
        `<script>addEventListener("load",()=>{document.title=${재는글}})<\/script></body>`), "utf8");
    let dom = "";
    try {
      dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--window-size=1440,2000",
        "--virtual-time-budget=6000", "--dump-dom", `file:///${잴것.replace(/\\/g, "/")}`],
        { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 });
    } catch { /* 크롬이 죽으면 아래에서 못 읽었다고 잡힌다 */ }
    const t = /<title>([\s\S]*?)<\/title>/.exec(dom)?.[1];
    if (!t || !t.startsWith("{")) { 보기.push(`${f} — 못 쟀습니다`); continue; }
    const r = JSON.parse(t) as { 사진수: number; 벗어남: number; 보기: string[]; 가로넘침: boolean };
    사진 += r.사진수; 벗어남 += r.벗어남; if (r.가로넘침) 넘침 += 1;
    for (const b of r.보기) if (보기.length < 4) 보기.push(`${f} — ${b}`);
  }
  rmSync(W, { recursive: true, force: true });
  return { 팩, 잰장: 후보.length, 사진, 벗어남, 넘침, 보기 };
}

const 팩들 = readdirSync(팩방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith("_") && (!고른팩 || e.name === 고른팩))
  .map((e) => e.name);

console.log("사진이 제 칸 안에 있나 — 실제로 그려서 잽니다\n");
let 나쁨 = 0;
for (const 팩 of 팩들) {
  const r = 팩보기(팩);
  if (!r) continue;
  const 나쁜가 = r.벗어남 > 0 || r.넘침 > 0;
  if (나쁜가) 나쁨 += 1;
  console.log(`  ${나쁜가 ? "✗" : "✓"} ${팩.padEnd(20)} ${r.잰장}장 · 사진 ${String(r.사진).padStart(3)}개 · ` +
    `칸 벗어남 ${r.벗어남} · 가로넘침 ${r.넘침}`);
  for (const b of r.보기) console.log(`       ${b}`);
}
console.log(`\n${나쁨 ? `못 넘긴 팩 ${나쁨}개` : "모두 제 칸 안에 있습니다."}`);
process.exit(나쁨 ? 1 : 0);
