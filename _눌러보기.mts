/* 사람처럼 «눌러» 본다 — 그리고 누른 뒤에 «무엇이 달라졌는지»를 숫자로 잰다.
 *
 * ⛔ 왜 만드나. 지시서가 「열어 보는 것과 눌러 보는 것은 다른 일」이라고 못 박아 두었다.
 *   check-반응 은 「무언가 바뀌었나」만 본다 — 토스트가 떠도 통과다.
 *   여기서 보는 것은 «맞게» 바뀌었나다: 거르면 목록이 실제로 줄고, 그 수가 화면에 적힌
 *   건수와 같은가. 탭을 누르면 몸통이 바뀌는가. 잠긴 단추가 조건을 채우면 열리는가.
 *
 * ⚠ 무인(scheduled task)으로 돌 때는 브라우저 미리보기를 못 띄운다. 그래서
 *   check-눈으로.mts 와 같은 수법을 쓴다 — 팩을 잠깐 서버로 띄우고 iframe 안에서 누른다.
 *
 * 쓰는 법:  npx tsx _눌러보기.mts <팩폴더>
 */
import { execFileSync, spawn } from "node:child_process";
import { writeFileSync, unlinkSync, mkdtempSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 팩 = process.argv[2] ?? "중고거래_디럭스";
const 방 = ["판매용_템플릿/_만드는중", "판매용_템플릿/_판매팩"]
  .map((d) => `${d}/${팩}/완성화면`).find((d) => existsSync(d));
if (!방) throw new Error(`완성화면 폴더를 못 찾았습니다: ${팩}`);

/* 브라우저 안에서 도는 자. 화면마다 정해 둔 «눌러 보기»를 하고 전후를 잰다. */
const 눌러보는글 = String.raw`
async function 재기(d, w) {
  const 결과 = [];
  const 자 = (s) => d.querySelectorAll(s);
  const 하나 = (s) => d.querySelector(s);
  const 보임 = (el) => !!(el && el.offsetParent !== null && !el.hidden);
  const 쉬기 = () => new Promise((r) => setTimeout(r, 90));
  const 남은줄 = (상자) => Array.prototype.filter.call(상자.children, (c) => !c.hidden).length;
  const 적힌수 = (키) => { const e = hasCount(키); return e ? Number(String(e.textContent).replace(/[^0-9]/g, '')) : null; };
  function hasCount(키) { return hasOne('[data-filter-count="' + 키 + '"]'); }
  function hasOne(s) { return d.querySelector(s); }

  /* ── ① 거르개 — 누르면 목록이 «실제로» 줄고, 적힌 건수와 같은가 ── */
  for (const 상자 of 자('[data-filter-list]')) {
    const 키 = 상자.dataset.filterList;
    const 처음 = 남은줄(상자);
    const 손잡이들 = Array.prototype.slice.call(자('[data-filter="' + 키 + '"]'))
      .filter((el) => 보임(el) && (el.type === 'checkbox' || el.tagName === 'SELECT'));
    if (!손잡이들.length) continue;
    let 걸어본수 = 0, 안줄어든것 = 0, 건수어긋남 = 0;
    for (const 손 of 손잡이들.slice(0, 6)) {
      if (손.tagName === 'SELECT') {
        const 값있는것 = Array.prototype.find.call(손.options, (o) => o.value);
        if (!값있는것) continue;
        손.value = 값있는것.value;
      } else 손.checked = !손.checked;
      손.dispatchEvent(new Event('change', { bubbles: true }));
      await 쉬기();
      걸어본수++;
      const 남음 = 남은줄(상자);
      if (남음 === 처음) 안줄어든것++;
      const 적힘 = 적힌수(키);
      if (적힘 != null && 적힘 !== 남음) 건수어긋남++;
      /* 되돌린다 */
      if (손.tagName === 'SELECT') 손.value = ''; else 손.checked = !손.checked;
      손.dispatchEvent(new Event('change', { bubbles: true }));
      await 쉬기();
    }
    결과.push({ 갈래: '거르개', 키, 처음, 걸어본수, 안줄어든것, 건수어긋남 });
  }

  /* ── ② 탭 — 누르면 몸통이 바뀌는가 (같은 묶음 안에서 하나만 켜지는가) ── */
  for (const 묶음 of 자('.tabs, .tabs-pill')) {
    const 탭들 = Array.prototype.slice.call(묶음.querySelectorAll('.tab')).filter((t) => t.dataset.pane);
    if (탭들.length < 2) continue;
    let 몸통안바뀜 = 0, 여럿켜짐 = 0;
    for (const t of 탭들) {
      t.click();
      await 쉬기();
      const 켜진수 = 묶음.querySelectorAll('.tab.on').length;
      if (켜진수 !== 1) 여럿켜짐++;
      const 몸통 = 묶음.parentElement.querySelector('[data-pane-body="' + t.dataset.pane + '"]');
      if (!몸통 || 몸통.hidden) 몸통안바뀜++;
    }
    결과.push({ 갈래: '탭', 수: 탭들.length, 몸통안바뀜, 여럿켜짐 });
  }

  /* ── ③ 잠긴 단추 — 조건을 채우면 열리는가 ── */
  const 잠긴것 = Array.prototype.slice.call(자('.btn[disabled]')).filter(보임);
  if (잠긴것.length) {
    const 열쇠 = Array.prototype.slice.call(자('[data-unlock]'));
    let 열린수 = 0;
    for (const k of 열쇠) { k.checked = true; k.dispatchEvent(new Event('change', { bubbles: true })); }
    await 쉬기();
    for (const b of 잠긴것) if (!b.disabled) 열린수++;
    결과.push({ 갈래: '잠긴단추', 잠김: 잠긴것.length, 열쇠: 열쇠.length, 열린수 });
  }

  /* ── ④ 칩 — 하나만 고르는 묶음에서 둘이 같이 켜지지 않는가 ── */
  for (const 묶음 of 자('.chips[data-one]')) {
    const 칩들 = Array.prototype.slice.call(묶음.querySelectorAll('.chip'));
    let 여럿 = 0;
    for (const c of 칩들.slice(0, 4)) { c.click(); await 쉬기();
      if (묶음.querySelectorAll('.chip.on').length !== 1) 여럿++; }
    결과.push({ 갈래: '칩', 수: 칩들.length, 여럿켜짐: 여럿 });
  }

  /* ── ⑤ 고르개가 같은 줄 배지를 바꾸는가 ── */
  for (const s of 자('select[data-row-badge]')) {
    const 줄 = s.closest('.item-row, tr, .cond-row, .card');
    const 배지 = 줄 && 줄.querySelector('[data-badge-of]');
    if (!배지) { 결과.push({ 갈래: '줄배지', 흠: '배지 자리가 없다' }); continue; }
    const 전 = 배지.textContent.trim();
    /* ⚠ 「없음·선택·고르기」는 «고르기를 무른다»는 뜻이라 배지가 그대로인 것이 맞다.
       그것을 골라 놓고 「안 바뀐다」고 짚으면 헛짚음이다(2026-09-07에 실제로 그랬다). */
    const 다른것 = Array.prototype.find.call(s.options,
      (o) => o.textContent.trim() !== 전 && !/^(없음|선택|고르기)$/.test(o.textContent.trim()));
    if (!다른것) continue;
    s.value = 다른것.value || 다른것.textContent;
    s.dispatchEvent(new Event('change', { bubbles: true }));
    await 쉬기();
    결과.push({ 갈래: '줄배지', 전, 후: 배지.textContent.trim(), 바뀜: 배지.textContent.trim() !== 전 });
    break;
  }

  /* ── ⑥ 찜 하트 — 누르면 개수가 오르는가 (그리고 사진에 덮여 안 눌리지 않는가) ── */
  const 하트 = Array.prototype.slice.call(자('.heart')).filter(보임).slice(0, 3);
  if (하트.length) {
    let 안오름 = 0, 덮임 = 0;
    for (const h of 하트) {
      const r = h.getBoundingClientRect();
      const 맨위 = d.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      /* ⚠ .dev 는 우리 «화면 정보» 도구다. 오른쪽 아래에 떠 있어 그 자리 하트를 가리는데,
         손님이 받는 화면의 흠이 아니다. 세지 않는다(2026-09-07에 헛짚어서 넣었다). */
      if (맨위 && !h.contains(맨위) && 맨위 !== h && !맨위.closest('.dev')) 덮임++;
      const 칸 = h.querySelector('.n');
      const 전 = 칸 ? Number(칸.textContent) : null;
      h.click(); await 쉬기();
      if (칸 && Number(칸.textContent) === 전) 안오름++;
    }
    결과.push({ 갈래: '찜하트', 수: 하트.length, 안오름, 덮임 });
  }
  return 결과;
}
`;

const 볼것 = process.argv.slice(3).length ? process.argv.slice(3)
  : ["HO-01", "SE-02", "SE-04", "SL-01", "SL-05", "CH-01", "CH-02", "PA-02", "PA-05", "MY-02", "MY-03", "MY-05", "AD-01", "AD-03", "BS-03", "CS-01"];

const 찌꺼기 = mkdtempSync(join(tmpdir(), "click-"));
const 몰이 = join(방, "_눌러보기.html");
writeFileSync(몰이, `<!doctype html><meta charset="utf-8"><body style="margin:0"><script>
${눌러보는글}
const 쪽들=${JSON.stringify(볼것)}, 모음=[]; let i=0;
const f=document.createElement("iframe");
f.style.cssText="width:1280px;height:900px;border:0;position:absolute;left:0;top:0";
document.body.appendChild(f);
function 다음(){ if(i>=쪽들.length){document.title=JSON.stringify(모음);return;}
 const 쪽=쪽들[i++];
 f.onload=()=>{ setTimeout(async()=>{ try{
    const r=await 재기(f.contentDocument, f.contentWindow);
    모음.push({쪽, 잰것:r});
   }catch(e){ 모음.push({쪽, 오류:String(e.message)}); }
   다음(); },350); };
 f.src="pages/"+쪽+".html"; }
다음();
<\/script></body>`, "utf8");

const 항 = 4600 + (process.pid % 300);
const 서버 = spawn("node", ["-e", `
 const http=require("http"),fs=require("fs"),p=require("path");
 http.createServer((q,s)=>{const 길=p.join(${JSON.stringify(방)},decodeURIComponent(q.url.split("?")[0]));
  try{const b=fs.readFileSync(길);
   s.writeHead(200,{"content-type":길.endsWith(".html")?"text/html; charset=utf-8":길.endsWith(".css")?"text/css":길.endsWith(".js")?"text/javascript":"image/webp"});
   s.end(b);}catch{s.writeHead(404);s.end("no");}}).listen(${항});
`], { stdio: "ignore" });

try {
  execFileSync("node", ["-e", "setTimeout(()=>{},900)"], { stdio: "ignore" });
  let dom = "";
  try {
    dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 찌꺼기, "--disable-gpu",
      "--window-size=1400,1000", "--virtual-time-budget=" + (6000 + 볼것.length * 2600), "--dump-dom",
      `http://localhost:${항}/_눌러보기.html`], { encoding: "utf8", stdio: "pipe", maxBuffer: 1 << 26 });
  } catch { /* 아래에서 「못 쟀다」로 지나간다 */ }
  const t = (/<title>([\s\S]*?)<\/title>/.exec(dom)?.[1] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  if (!t.startsWith("[")) { console.log("못 쟀습니다 — 크롬이 결과를 안 돌려줬습니다"); process.exit(1); }

  const 모음 = JSON.parse(t) as { 쪽: string; 잰것?: Record<string, unknown>[]; 오류?: string }[];
  let 흠 = 0;
  const 셈 = { 거르개: 0, 탭: 0, 잠긴단추: 0, 칩: 0, 줄배지: 0, 찜하트: 0 };
  console.log(`\n사람처럼 눌러 봅니다 — ${팩} · ${모음.length}장\n`);
  for (const p of 모음) {
    if (p.오류) { console.log(`  ⛔ ${p.쪽} — ${p.오류}`); 흠++; continue; }
    const 줄 = [];
    for (const r of p.잰것 ?? []) {
      const g = r.갈래 as keyof typeof 셈;
      셈[g] = (셈[g] ?? 0) + 1;
      if (g === "거르개") {
        줄.push(`거르개 ${r.걸어본수}번(줄 ${r.처음}→) 안줄어듦 ${r.안줄어든것} · 건수어긋남 ${r.건수어긋남}`);
        if ((r.안줄어든것 as number) > 0 || (r.건수어긋남 as number) > 0) 흠++;
      } else if (g === "탭") {
        줄.push(`탭 ${r.수}개 몸통안바뀜 ${r.몸통안바뀜} · 여럿켜짐 ${r.여럿켜짐}`);
        if ((r.몸통안바뀜 as number) > 0 || (r.여럿켜짐 as number) > 0) 흠++;
      } else if (g === "잠긴단추") {
        줄.push(`잠긴단추 ${r.잠김}개 · 열쇠 ${r.열쇠}개 · 열림 ${r.열린수}`);
        if ((r.열쇠 as number) > 0 && (r.열린수 as number) === 0) 흠++;
      } else if (g === "칩") {
        줄.push(`칩 ${r.수}개 여럿켜짐 ${r.여럿켜짐}`);
        if ((r.여럿켜짐 as number) > 0) 흠++;
      } else if (g === "줄배지") {
        줄.push(`줄배지 ${r.전}→${r.후}`);
        if (r.바뀜 === false || r.흠) 흠++;
      } else if (g === "찜하트") {
        줄.push(`찜하트 ${r.수}개 안오름 ${r.안오름} · 덮임 ${r.덮임}`);
        if ((r.안오름 as number) > 0 || (r.덮임 as number) > 0) 흠++;
      }
    }
    console.log(`  ${흠 === 0 ? "·" : "·"} ${p.쪽.padEnd(7)} ${줄.join(" | ") || "누를 것 없음"}`);
  }
  console.log(`\n눌러 본 갈래 — ${Object.entries(셈).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  console.log(흠 === 0 ? "\n✓ 누른 대로 바뀝니다.\n" : `\n⛔ 어긋난 곳 ${흠}건\n`);
  process.exit(흠 === 0 ? 0 : 1);
} finally { 서버.kill(); try { unlinkSync(몰이); } catch { /* 이미 없으면 그만 */ } }
