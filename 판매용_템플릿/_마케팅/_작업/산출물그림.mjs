/* 팩의 «진짜 산출물»(xlsx)을 영상 재료로 그림을 뜬다.
 *
 * 왜 만들었나 — 2026-08-24.
 *   ⑭ 「기획서 만드는 시간을 줄이는 법」은 화면 목록·기능정의서·WBS 를 보여줘야 하는데,
 *   그 문서를 찍은 녹화본이 하나도 없다. 팩 만드는 과정을 찍은 것 하나뿐이고
 *   그건 같은 주 화요일 편(㉑)이 처음부터 끝까지 다 썼다.
 *   ⛔ 그림을 지어내지 않는다. 팩에 실제로 든 xlsx 를 그대로 읽어서 뜬다.
 *
 * 쓰는 법
 *   node 판매용_템플릿/_마케팅/_작업/산출물그림.mjs <팩폴더> <나갈폴더>
 *
 * 나오는 것 — 화면캡처.mjs 와 같은 1440 폭 · 길게. 영상굽기가 여기서 골라 잘라 쓴다.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import XLSX from "xlsx";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const [팩, 나갈곳] = process.argv.slice(2);
if (!팩 || !나갈곳) throw new Error("쓰는 법: 산출물그림.mjs <팩폴더> <나갈폴더>");

/* ⛔ 한글 경로에서 헤드리스 크롬은 조용히 아무것도 안 만든다 — 아스키 자리에서 찍는다.
   화면캡처.mjs 가 같은 까닭으로 같은 수를 쓴다. */
const 임시 = `${(process.env.TEMP || "/tmp").split("\\").join("/")}/cc-doc-${process.pid}`;
const 찌꺼기 = `${임시}/chrome`;
mkdirSync(임시, { recursive: true });
process.on("exit", () => { try { rmSync(임시, { recursive: true, force: true }); } catch { /* 크롬이 물고 있으면 다음에 */ } });
mkdirSync(나갈곳, { recursive: true });

/** 문서 한 장 — 어느 시트를, 몇 줄까지, 무슨 이름으로. */
const 뜰것 = [
  { 파일: "02_IA_화면목록.xlsx", 시트: "화면목록", 이름: "IA·화면 목록", 낼이름: "화면목록", 줄: 26 },
  { 파일: "03_기능정의서.xlsx", 시트: null, 이름: "기능정의서", 낼이름: "기능정의서", 줄: 26 },
  { 파일: "04_WBS.xlsx", 시트: null, 이름: "WBS·일정", 낼이름: "WBS", 줄: 26 },
];

const 벗기기 = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let 몇 = 0;
for (const d of 뜰것) {
  const 길 = `${팩}/${d.파일}`;
  if (!existsSync(길)) { console.log(`  · ${d.파일} 없음 — 건너뜁니다`); continue; }
  const wb = XLSX.read(readFileSync(길));
  const 시트이름 = d.시트 && wb.SheetNames.includes(d.시트) ? d.시트 : wb.SheetNames[wb.SheetNames.length - 1];
  const 줄들 = XLSX.utils.sheet_to_json(wb.Sheets[시트이름], { header: 1 })
    .filter((r) => r.some((c) => String(c ?? "").trim()));
  const 머리 = 줄들[0] ?? [];
  const 몸 = 줄들.slice(1, 1 + d.줄);
  /* 팩 문서의 «진짜 줄 수»를 같이 적는다 — 지어낸 숫자를 안 쓰려고. */
  const 총줄 = 줄들.length - 1;

  const html = `<!doctype html><meta charset="utf-8"><style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0}
    body{width:1440px;background:#F0EFEB;font-family:'Noto Sans KR',sans-serif;color:#2A2320;padding:40px}
    .hd{display:flex;align-items:baseline;gap:14px;margin-bottom:18px}
    .hd b{font-size:34px;font-weight:700;letter-spacing:-.02em}
    .hd span{font-size:20px;color:#8A7F76}
    .hd em{margin-left:auto;font-style:normal;font-size:22px;font-weight:700;color:#BC5918}
    table{width:100%;border-collapse:collapse;background:#fff;border-radius:14px;overflow:hidden;
          box-shadow:0 2px 10px rgba(0,0,0,.06);font-size:19px}
    th{background:#2A3430;color:#fff;font-weight:600;text-align:left;padding:14px 16px;font-size:18px;white-space:nowrap}
    td{padding:12px 16px;border-top:1px solid #E4D9C4;vertical-align:top;line-height:1.45}
    tr:nth-child(even) td{background:#FBFAF7}
    td:first-child{font-weight:600;white-space:nowrap;color:#BC5918}
  </style>
  <div class="hd"><b>${벗기기(d.이름)}</b><span>${벗기기(팩.split(/[\\/]/).pop())}</span><em>${총줄}줄</em></div>
  <table><thead><tr>${머리.slice(0, 6).map((c) => `<th>${벗기기(c)}</th>`).join("")}</tr></thead>
  <tbody>${몸.map((r) => `<tr>${머리.slice(0, 6).map((_, i) => `<td>${벗기기(r[i]).slice(0, 60)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

  const 임시html = `${임시}/${d.낼이름}.html`;
  writeFileSync(임시html, html, "utf8");
  const 낼길 = `${나갈곳}/${d.낼이름}.png`;
  execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 찌꺼기, "--disable-gpu",
    "--window-size=1440,2400", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--virtual-time-budget=6000", `--screenshot=${낼길}`, `file:///${임시html}`], { stdio: "pipe" });
  if (!existsSync(낼길)) throw new Error(`못 떴습니다: ${낼길}`);
  console.log(`  ✓ ${d.낼이름}.png  — ${d.이름} ${총줄}줄 가운데 ${몸.length}줄`);
  몇++;
}
console.log(`\n  ${몇}장 떴습니다 → ${나갈곳}`);
