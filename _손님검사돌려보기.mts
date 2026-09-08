/* 손님에게 주는 검사 글을 «그대로» 화면에 붙여 넣어 돌려 본다.
 *   npx tsx _손님검사돌려보기.mts <html 파일> [폭]
 * ⚠ import 하지 않고 소스에서 뽑는다 — 화면검수-글 ↔ guide-links 가 서로를 부른다. */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, basename, join } from "node:path";

const [, , 길, 폭] = process.argv;
if (!길 || !existsSync(길)) { console.error("html 파일을 주세요"); process.exit(2); }

/* ⚠ 줄 번호를 박아 두면 안 된다 — 검사 글에 한 줄만 더해도 어긋나서
   조용히 반 토막을 잘라 넣는다(2026-09-08 에 실제로 그랬다). 경계를 찾아 쓴다. */
const 소스 = readFileSync("lib/export/화면검수-글.ts", "utf8");
const 처음 = 소스.indexOf("export const 화면검수글 = String.raw`");
const 몸통 = 소스.slice(소스.indexOf("`", 처음) + 1);
const 검사글 = 몸통.slice(0, 몸통.indexOf("\n})()`") + "\n})()".length);
if (!검사글.trim().startsWith("(() =>")) { console.error("검사 글을 못 뽑았습니다"); process.exit(1); }

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const W = `${(process.env.TEMP ?? "/tmp").replace(/\\/g, "/")}/cc-guide-${process.pid}`;
rmSync(W, { recursive: true, force: true });
mkdirSync(W, { recursive: true });
cpSync(dirname(길), W, { recursive: true });

const 이름 = basename(길);
const 낼길 = join(W, "_잴것_" + 이름);
writeFileSync(
  낼길,
  readFileSync(join(W, 이름), "utf8").replace(
    "</body>",
    "<script>addEventListener('load',function(){setTimeout(function(){document.title=" + 검사글 + ";},400)})<\/script></body>",
  ),
  "utf8",
);

try {
  const dom = execFileSync(CHROME, ["--headless=new", `--user-data-dir=${W}/prof`, "--disable-gpu",
    "--hide-scrollbars", "--force-device-scale-factor=1", `--window-size=${폭 || 1536},1000`,
    "--virtual-time-budget=6000", "--dump-dom", `file:///${낼길.replace(/\\/g, "/")}`],
    { encoding: "utf8", maxBuffer: 1 << 26 });
  const raw = /<title>([\s\S]*?)<\/title>/.exec(dom)?.[1] ?? "";
  const j = JSON.parse(raw.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
  console.log(`\n  ${이름} · 폭 ${폭 || 1536} · 콘텐츠폭 ${j.콘텐츠폭}px · 흠 ${(j.흠 ?? []).length}건`);
  for (const h of j.흠 ?? []) console.log("    " + h);
  console.log("");
} catch (e) {
  console.error("못 쟀습니다: " + (e as Error).message.slice(0, 300));
}
rmSync(W, { recursive: true, force: true });
