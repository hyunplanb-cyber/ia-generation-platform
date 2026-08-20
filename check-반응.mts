/* 눌러도 «아무 일도 안 일어나는» UI 를 찾아낸다. 실제로 눌러 보고 잰다.
 *
 * 왜 만드나 (2026-08-17 사장님 지적)
 *   인테리어 디럭스를 눈으로 훑다가 사장님이 짚었다 —
 *   ES-02 의 마감 등급 탭과 「포함」 토글이 눌러도 금액이 안 바뀌고,
 *   HO-01 의 평수 칩은 강조만 되고 옆 문구가 그대로였다.
 *   CS-04 는 「고르면 미리보기 사진이 바뀝니다」라고 화면에 «적어 두고도» 안 바뀌었다.
 *
 *   check-design 은 색·간격을 보고, check-pack 은 파일과 글자 수를 세고,
 *   check-사진 은 그려진 «자리»를 잰다. 셋 중 **어느 것도 눌러 보지 않는다.**
 *   눌러 봐야만 아는 것은 눌러서 재는 수밖에 없다.
 *
 *   ⚠ 이건 «완성화면»만 잡는다. 스펙팩(07_AI빌드_스펙팩)의 acts 에 적어 둔 약속이
 *     화면에 실제로 붙었는지는 --약속 으로 같이 본다. 손님은 스펙팩을 넣어
 *     제 화면을 만들므로, 약속만 있고 장치가 없으면 손님 화면도 똑같이 죽는다.
 *
 * 무엇을 «반응»으로 치나
 *   ① 화면 안 어딘가의 글자·클래스가 바뀐다  ② 알림(토스트)이 뜬다
 *   ③ 다른 화면으로 넘어간다               ④ 제 켜짐/꺼짐 상태가 바뀐다
 *   넷 다 아니면 죽은 UI 다.
 *
 * ⚠ 한글 경로에서 헤드리스 크롬은 조용히 아무것도 안 한다. 반드시 아스키 자리로 옮겨 잰다.
 *
 * 쓰는 법
 *   npx tsx check-반응.mts 인테리어_디럭스
 *   npx tsx check-반응.mts 인테리어_디럭스 --약속   (스펙팩 acts 도 같이 훑는다)
 *   npx tsx check-반응.mts                        (완성화면이 든 팩 전부)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

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
const 고른팩 = process.argv.slice(2).find((a) => !a.startsWith("--"));
const 약속도 = process.argv.includes("--약속");

/** 브라우저 안에서 도는 글. 결과는 document.title 로 꺼낸다(--dump-dom 으로 읽는다). */
const 눌러보는글 = `
(async () => {
  /* ⚠ scroll-behavior:smooth 는 굴림을 ~300ms 에 걸쳐 «천천히» 옮긴다.
     한 틱 뒤에 재면 아직 안 움직여서 «죽었다»고 잘못 센다. 재는 동안만 꺼 둔다. */
  const 굴림끄기 = document.createElement("style");
  굴림끄기.textContent = "*{scroll-behavior:auto !important}";
  document.head.appendChild(굴림끄기);

  const 죽은것 = [];
  const 값만 = [];
  const 종류 = {};
  let 눌러본수 = 0;

  /* 누를 만한 것들. <a href> 는 «넘어가는 것»이 곧 반응이라 빼고,
     글자를 치는 칸도 뺀다(누르는 것이 아니다). 꺼진 것도 뺀다. */
  const 고르개 = [
    'button:not([disabled])',
    '.chip:not([disabled])', '.tab:not([disabled])', '.toggle:not([disabled])',
    'input[type=checkbox]:not([disabled])', 'input[type=radio]:not([disabled])',
    'select:not([disabled])',
  ].join(',');

  const 후보 = Array.from(document.querySelectorAll(고르개)).filter((el) => {
    if (el.closest('template')) return false;
    if (el.closest('.dev')) return false;              // 화면 정보 패널은 견본 장치라 뺀다
    if (el.classList.contains('is-off')) return false;
    /* ⚠ «이미 골라져 있는» 것을 누르면 아무 일도 안 일어나는 게 맞다.
       지금 켜진 탭·칩·달력 날짜와 이미 찍힌 라디오는 죽은 게 아니다.
       ⚠ 다만 <select> 는 빼면 안 된다 — 이 팩들은 고르는 칸에 class="sel" 을 준다.
         그것까지 건너뛰는 바람에 인테리어의 고르는 칸이 통째로 안 재어지고 있었다
         (2026-08-18 에 달력 겹침을 쫓다가 드러났다). */
    if ((el.classList.contains('on') || el.classList.contains('sel')) && el.tagName !== 'SELECT') return false;
    if (el.type === 'radio' && el.checked) return false;
    return el.offsetParent !== null || el.type === 'checkbox' || el.type === 'radio';
  });

  /* 가로·세로로 굴러가는 것도 «반응»이다 — 굴린 자리는 innerHTML 에 안 남는다.
     화살표로 목록을 굴리는 화면이 이것 때문에 죽은 것으로 잘못 세어졌다. */
  const 굴린자리 = () => Array.prototype.map.call(
    document.querySelectorAll("*"),
    (n) => (n.scrollLeft || 0) + ":" + (n.scrollTop || 0)
  ).join(",");

  const 이름 = (el) => {
    const t = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 24);
    if (t) return t;
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').slice(0, 24);
    if (el.dataset && el.dataset.space) return el.dataset.space + ' 체크';
    return el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase();
  };

  for (const el of 후보) {
    /* 손잡이가 setTimeout 으로 나중에 도는 것도 있다(마지막 그물이 그렇다).
       한 틱 기다렸다 재야 «늦게 답하는 것»을 죽었다고 잘못 세지 않는다. */
    /* 알림(토스트)을 붙이는 것은 그 자체가 반응이다 — 먼저 인정하고 넘어간다. */
    /* ⚠ <select> 는 알림이 붙어 있어도 그냥 넘기지 않는다 (2026-08-18 검수 A 가 짚었다).
       LMS 의 「기간」 고르개는 data-toast 만 걸려 있어 «반응함»으로 통과했는데,
       스펙팩 acts 는 「표와 합계가 그 기간 것으로 다시 계산된다」고 약속하고 있었다.
       알림 한 줄은 그 약속이 아니다 — 거르는 고르개는 옆이 같이 움직여야 한다. */
    const 고르개인가 = el.tagName === 'SELECT';
    if (!고르개인가 && el.dataset && (el.dataset.toast || el.dataset.modal || el.dataset.go || el.dataset.close || el.dataset.dismiss)) { 눌러본수++; continue; }

    /* 알림(토스트)은 «옆이 움직였나»를 볼 때 셈에서 뺀다 — 고르개가 알림만 띄우고
       표를 안 고쳐도 화면이 바뀐 것처럼 보이기 때문이다. */
    const 알림뺀글 = () => {
      const 사본 = document.body.cloneNode(true);
      사본.querySelectorAll('.toast').forEach((t) => t.remove());
      return 사본.innerHTML;
    };
    const 전HTML = 고르개인가 ? 알림뺀글() : document.body.innerHTML;
    const 전주소 = location.href;
    const 전켜짐 = el.checked === undefined ? el.className : String(el.checked);
    const 전굴림 = 굴린자리();

    try {
      if (el.tagName === 'SELECT') {
        if (el.options.length < 2) continue;
        el.selectedIndex = (el.selectedIndex + 1) % el.options.length;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        el.click();
      }
    } catch (e) { /* 눌리다 터지면 그것도 죽은 것으로 친다 */ }
    await new Promise((r) => setTimeout(r, 0));

    눌러본수++;
    const 바뀜 = (고르개인가 ? 알림뺀글() : document.body.innerHTML) !== 전HTML
      || location.href !== 전주소
      || (el.checked === undefined ? el.className : String(el.checked)) !== 전켜짐
      || 굴린자리() !== 전굴림;

    if (!바뀜) {
      /* ⚠ <select> 는 고른 값이 «닫힌 칸에 그대로 보인다» — 그것만으로도 손님 눈에는
         반응한 것이다. 그래서 죽었다고 못 박지 않고 «값만 바뀜»으로 따로 센다.
         다만 그 select 가 목록을 거르거나 숫자를 다시 세라고 둔 것이면 반쪽짜리다 —
         그건 기계가 못 가리므로 사람이 스펙팩 acts 와 견줘 봐야 한다. */
      if (el.tagName === 'SELECT') { 값만.push(이름(el)); continue; }
      죽은것.push(이름(el));
      /* «무엇이» 죽었나를 같이 센다 — 고칠 자리는 글자가 아니라 이 종류다.
         button.bell 이 146개면 낱낱이 고칠 게 아니라 ui.mjs 에 한 번 붙이면 된다. */
      var 종 = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
      종류[종] = (종류[종] || 0) + 1;
    }
  }

  return JSON.stringify({ 눌러본수, 죽은수: 죽은것.length, 죽은것: 죽은것.slice(0, 6), 종류, 값만수: 값만.length });
})()`;

type 결과 = { 화면: string; 눌러본수: number; 죽은수: number; 죽은것: string[]; 종류: Record<string, number>; 값만수: number };

function 팩보기(팩: string): { 팩: string; 잰장: number; 결과: 결과[] } | null {
  const 완성화면 = join(팩방, 팩, "완성화면");
  const pages = join(완성화면, "pages");
  if (!existsSync(pages)) return null;

  // ⚠ 한글 경로를 크롬이 못 읽는다. 통째로 아스키 자리에 복사해 놓고 잰다.
  const 임시 = join(tmpdir(), "react-check-" + Date.now());
  mkdirSync(임시, { recursive: true });
  cpSync(완성화면, 임시, { recursive: true });

  const 화면들 = readdirSync(pages).filter((f) => f.endsWith(".html")).sort();
  const 결과: 결과[] = [];

  for (const f of 화면들) {
    const 길 = join(임시, "pages", f);
    const 원본 = readFileSync(길, "utf8");
    // load 뒤에 재야 app.js 가 붙어 있다. 결과는 title 로 꺼낸다.
    const 심은글 = 원본.replace(
      "</body>",
      `<script>addEventListener("load",function(){setTimeout(function(){${눌러보는글}.then(function(v){document.title=v;},function(e){document.title=JSON.stringify({오류:String(e)});});},80);});</script></body>`,
    );
    writeFileSync(길, 심은글, "utf8");

    let 뽑힌: string;
    try {
      뽑힌 = execFileSync(CHROME, [
        "--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--window-size=1440,1000",
        "--virtual-time-budget=2500", "--dump-dom", "file:///" + 길.replace(/\\/g, "/"),
      ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
    } catch { continue; }

    const m = /<title>([\s\S]*?)<\/title>/.exec(뽑힌);
    if (!m) continue;
    let 값: any;
    try { 값 = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")); } catch { continue; }
    if (!값 || 값.죽은수 === undefined) continue;

    결과.push({ 화면: f.replace(".html", ""), 눌러본수: 값.눌러본수, 죽은수: 값.죽은수, 죽은것: 값.죽은것 || [], 종류: 값.종류 || {}, 값만수: 값.값만수 || 0 });
  }

  rmSync(임시, { recursive: true, force: true });
  return { 팩, 잰장: 결과.length, 결과 };
}

/** 스펙팩에 적어 둔 «약속(acts)» 을 같이 보여 준다 — 손님이 넣고 만들 때 그대로 따라간다. */
function 약속보기(팩: string) {
  const 스펙 = join(팩방, 팩, "완성화면", "스펙팩", "07_AI빌드_스펙팩.json");
  if (!existsSync(스펙)) return null;
  const s = JSON.parse(readFileSync(스펙, "utf8"));
  const 전부 = s.screens.flatMap((x: any) => (x.acts || []).map((a: any[]) => ({ 화면: x.pageId, 무엇: a[0], 어떻게: a[1] })));
  return 전부;
}

const 팩들 = 고른팩
  ? [고른팩]
  : readdirSync(팩방, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(팩방, e.name, "완성화면", "pages")))
      .map((e) => e.name);

console.log("눌러도 반응 없는 UI 가 있나 — 실제로 눌러서 잽니다\n");

let FAIL = 0;
let WARN = 0;
for (const 팩 of 팩들) {
  const r = 팩보기(팩);
  if (!r) { console.log(`  ${팩} — 완성화면이 없어 건너뜁니다`); continue; }

  const 죽은화면 = r.결과.filter((x) => x.죽은수 > 0);
  const 총누름 = r.결과.reduce((n, x) => n + x.눌러본수, 0);
  const 총죽음 = r.결과.reduce((n, x) => n + x.죽은수, 0);

  const 총값만 = r.결과.reduce((n, x) => n + x.값만수, 0);
  console.log(`  ${팩} — ${r.잰장}장에서 ${총누름}개를 눌러 봤습니다`);
  if (총값만 > 0) {
    WARN += 총값만;
    console.log(`    △ 고른 값만 바뀌고 옆이 그대로인 select ${총값만}개 — 거르라고 둔 것이면 반쪽입니다.`);
    console.log("      스펙팩 acts 에 「고르면 …가 바뀐다」고 적혀 있는지 견줘 보세요.");
  }
  if (총죽음 === 0) {
    console.log("    눌러서 죽은 것은 없습니다.\n");
  } else {
    FAIL += 총죽음;
    for (const x of 죽은화면) {
      console.log(`    ✗ [${x.화면}] ${x.죽은수}개가 눌러도 그대로: ${x.죽은것.join(" · ")}`);
    }
    /* 고칠 자리는 «종류»다. 같은 종류가 여러 화면에 흩어져 있으면 낱낱이 고칠 게 아니라
       그 팩의 ui.mjs·app.js 한 곳에 붙이면 한꺼번에 산다. */
    const 종합: Record<string, number> = {};
    for (const x of r.결과) for (const [k, v] of Object.entries(x.종류)) 종합[k] = (종합[k] || 0) + v;
    const 줄 = Object.entries(종합).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`);
    console.log(`    └ 무엇이 죽었나: ${줄.join(" · ")}`);
    console.log("      같은 종류가 여러 곳이면 그 팩의 build/ui.mjs · assets/js/app.js 에서 한 번에 고칩니다.\n");
  }

  if (약속도) {
    const 약속 = 약속보기(팩);
    if (약속) {
      console.log(`    · 스펙팩이 적어 둔 약속 ${약속.length}개 — 손님도 이대로 만듭니다.`);
      console.log("      약속한 장치가 화면에 «아예 없으면» 위 목록에는 안 잡힙니다. 눈으로 같이 봅니다.\n");
    }
  }
}

console.log(FAIL === 0 ? `못 넘긴 것 0건 · 봐줄 만한 것 ${WARN}건` : `못 넘긴 것 ${FAIL}건 — 눌러도 반응이 없습니다 · 봐줄 만한 것 ${WARN}건`);
if (FAIL > 0) process.exitCode = 1;
