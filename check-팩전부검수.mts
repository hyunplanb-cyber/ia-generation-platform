/* 완성화면이 든 팩 «전부»를 손님에게 파는 그 검수 글로 잰다.
 *
 * 왜 만드나 (2026-09-03, 현님 지시 「다른 팩들도 손님 검수 글로 다 재줘」)
 *   인테리어 두 팩은 크롬에서 iframe 으로 한 장씩 재 봤다. 247장이었다.
 *   나머지 열넷까지 2,671장을 그렇게 재려면 예순 번을 눌러야 한다.
 *
 * ⛔ 우리 검사(check-눈으로)로 재면 안 된다. 그건 «우리» 잣대다.
 *   손님이 받는 잣대로 재야 「우리가 파는 도구로 우리 팩을 쟀다」가 된다.
 *   그래서 lib/export/화면검수-글 에서 그대로 꺼내 쓴다 — 손님 스펙팩 7-9 와 같은 글이다.
 *
 * 어떻게 도나 — check-눈으로 가 쓰던 틀을 그대로 빌린다.
 *   ① 팩 폴더를 작은 서버로 연다 (file:// 은 iframe 끼리 서로 못 읽는다)
 *   ② 헤드리스 크롬으로 «한판.html» 한 장만 연다
 *   ③ 그 한 장이 화면을 차례로 iframe 에 띄우고 검수 글을 넣어 잰다
 *   ④ 다 재면 결과를 <pre> 에 적고, --dump-dom 으로 그걸 읽는다
 *   팩 하나에 크롬 한 번. 열여섯 번이면 끝난다.
 *
 * 쓰는 법
 *   npx tsx check-팩전부검수.mts            완성화면이 있는 팩 전부
 *   npx tsx check-팩전부검수.mts 인테리어   그 업종만
 *   npx tsx check-팩전부검수.mts -- 어디.json   결과를 통째로 적어 둔다
 *
 * ⚠ 화면에는 갈래마다 앞 네 건만 보여 준다 — 천 건이 쏟아지면 아무도 안 본다.
 *   전체를 보려면 위처럼 파일로 받아서 셈한다.
 */
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as 검수글모음 from "./lib/export/화면검수-글";

/* ⚠ 한글 export 이름은 곧이 적으면 못 가져온다 — cjs-module-lexer 가 못 읽는다.
   게다가 CJS 로 실려 default 안에 들어온다. 그래서 «찾아» 쓴다(2026-09-02). */
const 속 = ((검수글모음 as Record<string, unknown>).default ?? 검수글모음) as Record<string, string>;
const 검수글 = 속[
  Object.keys(속).find((k) => k.normalize("NFC") === "화면검수글".normalize("NFC")) ?? ""
];
if (!검수글) throw new Error("화면검수-글 에서 화면검수글 을 못 찾았습니다");

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 방 = "판매용_템플릿/_판매팩";
const 고른것 = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : undefined;
const 적을곳 = process.argv[process.argv.indexOf("--") + 1];
const 찌꺼기 = `${(process.env.TEMP || "/tmp").split("\\").join("/")}/cc-팩검수-${process.pid}`;

if (!existsSync(CHROME)) {
  console.error(`크롬을 못 찾았습니다: ${CHROME}`);
  process.exit(1);
}

type 흠 = { 화면: string; 흠: string[] };

/** 팩 하나를 통째로 잰다. 크롬 한 번. */
function 팩재기(팩: string): { 잰것: number; 목록: 흠[] } | null {
  const 뿌리 = join(방, 팩, "완성화면");
  const 화면들 = readdirSync(join(뿌리, "pages")).filter((f) => f.endsWith(".html")).sort();
  if (!화면들.length) return null;

  /* 손님이 받는 그 글을 그대로 놓는다. 다 재면 지운다. */
  const 검수길 = join(뿌리, "_잠깐검수.js");
  const 한판길 = join(뿌리, "_한판.html");
  writeFileSync(검수길, `window.__검수 = function () { return (\n${검수글}\n); };\n`, "utf8");
  writeFileSync(한판길, 한판HTML(화면들), "utf8");

  const 항 = 45000 + (process.pid % 2000);
  const 서버 = spawn("node", ["-e", `
    const http=require("http"),fs=require("fs"),p=require("path");
    const 형=(f)=>f.endsWith(".html")?"text/html; charset=utf-8":f.endsWith(".css")?"text/css":
      f.endsWith(".js")?"text/javascript; charset=utf-8":f.endsWith(".webp")?"image/webp":
      f.endsWith(".svg")?"image/svg+xml":"application/octet-stream";
    http.createServer((q,s)=>{
      const 길=p.join(${JSON.stringify(뿌리)},decodeURIComponent(q.url.split("?")[0]));
      try{const b=fs.readFileSync(길);s.writeHead(200,{"content-type":형(길)});s.end(b);}
      catch{s.writeHead(404);s.end("no");}
    }).listen(${항});
  `], { stdio: "ignore" });

  let dom = "";
  try {
    execFileSync("node", ["-e", "setTimeout(()=>{},900)"], { stdio: "ignore" });  // 서버가 뜨기를 기다린다
    try {
      dom = execFileSync(CHROME, [
        "--headless=new", "--user-data-dir=" + 찌꺼기, "--disable-gpu",
        "--window-size=1280,900",
        /* 화면 한 장에 900ms 쯤. 넉넉히 준다 — 모자라면 «덜 재고» 통과해 버린다. */
        "--virtual-time-budget=" + (5000 + 화면들.length * 900),
        "--dump-dom", `http://127.0.0.1:${항}/_한판.html`,
      ], { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 28 });
    } catch { /* 아래에서 «못 쟀다»로 잡힌다 */ }
  } finally {
    서버.kill();
    rmSync(검수길, { force: true });
    rmSync(한판길, { force: true });
  }

  const m = /<pre id="결과">([\s\S]*?)<\/pre>/.exec(dom);
  if (!m) return null;
  try {
    const j = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&"));
    return { 잰것: j.잰것, 목록: j.목록 };
  } catch { return null; }
}

function 한판HTML(화면들: string[]): string {
  return `<!doctype html><meta charset="utf-8"><title>한판</title>
<body><pre id="결과"></pre>
<iframe id="틀" style="position:fixed;left:-9999px;top:0;width:1280px;height:900px;border:0"></iframe>
<script>
(async () => {
  const 목 = ${JSON.stringify(화면들)};
  const f = document.getElementById("틀"), 모은것 = [];
  let 잰것 = 0;
  /* 검수 글은 «한 번만» 가져와 화면마다 곧바로 넣는다 — 스크립트 태그를 심고
     onload 를 기다리면 가끔 어긋나서, 잰 적 없는 화면이 조용히 지나간다. */
  const 검수글 = await (await fetch("/_잠깐검수.js")).text();
  for (const nm of 목) {
    await new Promise((ok) => { f.onload = ok; f.src = "/pages/" + nm; });
    await new Promise((r) => setTimeout(r, 60));
    try {
      const w = f.contentWindow;
      w.eval(검수글);
      const 결 = JSON.parse(w.__검수());
      잰것++;
      if (결.흠 && 결.흠.length) 모은것.push({ 화면: nm, 흠: 결.흠 });
    } catch (e) {
      모은것.push({ 화면: nm, 흠: ["[못잼] " + String(e).slice(0, 80)] });
    }
  }
  document.getElementById("결과").textContent = JSON.stringify({ 잰것, 목록: 모은것 });
})();
</script></body>`;
}

/* ───────── 돌리기 ───────── */
mkdirSync(찌꺼기, { recursive: true });
const 팩들 = readdirSync(방, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(방, e.name, "완성화면/pages")))
  .map((e) => e.name)
  .filter((n) => !고른것 || n.includes(고른것))
  .sort();

console.log(`\n손님에게 파는 그 검수 글로 잽니다 — 팩 ${팩들.length}칸\n`);

let 온통잰것 = 0, 온통흠 = 0;
const 못잰팩: string[] = [];
const 모두: { 팩: string; 목록: 흠[] }[] = [];

for (const 팩 of 팩들) {
  process.stdout.write(`  ${팩.padEnd(22)} `);
  const r = 팩재기(팩);
  if (!r) { console.log("⛔ 못 쟀습니다"); 못잰팩.push(팩); continue; }
  const 흠수 = r.목록.reduce((n, x) => n + x.흠.length, 0);
  /* ⚠ 재야 할 장을 다 못 쟀으면 그것부터 말한다. 「깨끗합니다」가 제일 위험하다. */
  const 있어야 = readdirSync(join(방, 팩, "완성화면/pages")).filter((f) => f.endsWith(".html")).length;
  if (r.잰것 < 있어야) {
    console.log(`⛔ ${있어야}장 가운데 ${r.잰것}장만 쟀습니다`);
    못잰팩.push(팩);
    continue;
  }
  온통잰것 += r.잰것; 온통흠 += 흠수;
  if (흠수) 모두.push({ 팩, 목록: r.목록 });
  console.log(`${String(r.잰것).padStart(3)}장 · ${흠수 ? `흠 ${흠수}건 (화면 ${r.목록.length}장)` : "깨끗합니다"}`);
}

rmSync(찌꺼기, { recursive: true, force: true });

if (적을곳 && process.argv.includes("--")) {
  writeFileSync(적을곳, JSON.stringify(모두, null, 1), "utf8");
  console.log(`\n  결과를 통째로 적어 두었습니다 → ${적을곳}`);
}

if (모두.length) {
  console.log("\n  ── 흠 ─────────────────────────────────────────");
  for (const { 팩, 목록 } of 모두) {
    console.log(`\n  ❌ ${팩}`);
    /* 낱낱이 아니라 «갈래»로 묶는다 — 한 건씩 쫓으면 헛돈다(2026-09-02). */
    const 갈래: Record<string, string[]> = {};
    for (const x of 목록) for (const h of x.흠) {
      const k = (/^\[[^\]]+\]/.exec(h) ?? ["[?]"])[0];
      (갈래[k] ||= []).push(`${x.화면}  ${h.slice(k.length + 1)}`);
    }
    for (const [k, v] of Object.entries(갈래)) {
      console.log(`     ${k} ${v.length}건`);
      for (const s of v.slice(0, 4)) console.log(`       ${s.slice(0, 118)}`);
      if (v.length > 4) console.log(`       … 외 ${v.length - 4}건`);
    }
  }
}

console.log(`\n  잰 화면 ${온통잰것}장 · 흠 ${온통흠}건`);
if (못잰팩.length) console.log(`  ⚠ 못 잰 팩: ${못잰팩.join(" · ")}`);
console.log("");
if (온통흠 || 못잰팩.length) process.exit(1);
console.log("  ✓ 다 깨끗합니다.\n");
