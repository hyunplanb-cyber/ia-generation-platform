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

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const 팩방 = "판매용_템플릿/_판매팩";
const 고른팩 = process.argv.slice(2).find((a) => !a.startsWith("--"));
const 약속도 = process.argv.includes("--약속");

/** 브라우저 안에서 도는 글. 결과는 document.title 로 꺼낸다(--dump-dom 으로 읽는다). */
const 눌러보는글 = `
(() => {
  const 죽은것 = [];
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
       지금 켜진 탭·칩·달력 날짜와 이미 찍힌 라디오는 죽은 게 아니다. */
    if (el.classList.contains('on') || el.classList.contains('sel')) return false;
    if (el.type === 'radio' && el.checked) return false;
    return el.offsetParent !== null || el.type === 'checkbox' || el.type === 'radio';
  });

  const 이름 = (el) => {
    const t = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 24);
    if (t) return t;
    if (el.getAttribute('aria-label')) return el.getAttribute('aria-label').slice(0, 24);
    if (el.dataset && el.dataset.space) return el.dataset.space + ' 체크';
    return el.className ? '.' + String(el.className).split(' ')[0] : el.tagName.toLowerCase();
  };

  for (const el of 후보) {
    /* 알림(토스트)을 붙이는 것은 그 자체가 반응이다 — 먼저 인정하고 넘어간다. */
    if (el.dataset && (el.dataset.toast || el.dataset.modal || el.dataset.go || el.dataset.close || el.dataset.dismiss)) { 눌러본수++; continue; }

    const 전HTML = document.body.innerHTML;
    const 전주소 = location.href;
    const 전켜짐 = el.checked === undefined ? el.className : String(el.checked);

    try {
      if (el.tagName === 'SELECT') {
        if (el.options.length < 2) continue;
        el.selectedIndex = (el.selectedIndex + 1) % el.options.length;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        el.click();
      }
    } catch (e) { /* 눌리다 터지면 그것도 죽은 것으로 친다 */ }

    눌러본수++;
    const 바뀜 = document.body.innerHTML !== 전HTML
      || location.href !== 전주소
      || (el.checked === undefined ? el.className : String(el.checked)) !== 전켜짐;

    if (!바뀜) 죽은것.push(이름(el));
  }

  return JSON.stringify({ 눌러본수, 죽은수: 죽은것.length, 죽은것: 죽은것.slice(0, 6) });
})()`;

type 결과 = { 화면: string; 눌러본수: number; 죽은수: number; 죽은것: string[] };

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
      `<script>addEventListener("load",function(){setTimeout(function(){try{document.title=${눌러보는글};}catch(e){document.title=JSON.stringify({오류:String(e)});}},80);});</script></body>`,
    );
    writeFileSync(길, 심은글, "utf8");

    let 뽑힌: string;
    try {
      뽑힌 = execFileSync(CHROME, [
        "--headless=new", "--disable-gpu", "--window-size=1440,1000",
        "--virtual-time-budget=2500", "--dump-dom", "file:///" + 길.replace(/\\/g, "/"),
      ], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
    } catch { continue; }

    const m = /<title>([\s\S]*?)<\/title>/.exec(뽑힌);
    if (!m) continue;
    let 값: any;
    try { 값 = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")); } catch { continue; }
    if (!값 || 값.죽은수 === undefined) continue;

    결과.push({ 화면: f.replace(".html", ""), 눌러본수: 값.눌러본수, 죽은수: 값.죽은수, 죽은것: 값.죽은것 || [] });
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
for (const 팩 of 팩들) {
  const r = 팩보기(팩);
  if (!r) { console.log(`  ${팩} — 완성화면이 없어 건너뜁니다`); continue; }

  const 죽은화면 = r.결과.filter((x) => x.죽은수 > 0);
  const 총누름 = r.결과.reduce((n, x) => n + x.눌러본수, 0);
  const 총죽음 = r.결과.reduce((n, x) => n + x.죽은수, 0);

  console.log(`  ${팩} — ${r.잰장}장에서 ${총누름}개를 눌러 봤습니다`);
  if (총죽음 === 0) {
    console.log("    모두 반응합니다.\n");
  } else {
    FAIL += 총죽음;
    for (const x of 죽은화면) {
      console.log(`    ✗ [${x.화면}] ${x.죽은수}개가 눌러도 그대로: ${x.죽은것.join(" · ")}`);
    }
    console.log("");
  }

  if (약속도) {
    const 약속 = 약속보기(팩);
    if (약속) {
      console.log(`    · 스펙팩이 적어 둔 약속 ${약속.length}개 — 손님도 이대로 만듭니다.`);
      console.log("      약속한 장치가 화면에 «아예 없으면» 위 목록에는 안 잡힙니다. 눈으로 같이 봅니다.\n");
    }
  }
}

console.log(FAIL === 0 ? "못 넘긴 것 0건" : `못 넘긴 것 ${FAIL}건 — 눌러도 반응이 없습니다`);
if (FAIL > 0) process.exitCode = 1;
