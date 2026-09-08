/* 팩의 «모든 쪽»을 실제로 그려서 레이아웃을 잰다. (2026-08-20)
 *
 * 왜 만들었나
 *   촬영 검수 때 사람이 눌러 보는 화면은 한 팩에 열 몇 장이다. 나머지는 안 본다.
 *   그런데 레이아웃이 깨지는 자리는 «짧은 화면»(빈 목록·완료·오류)에 몰려 있어서
 *   손으로 도는 동선에서 자꾸 빠졌다. LMS 에서 나온 넷은 전부 재면 알 수 있는 것들이었다:
 *
 *     ① 가로 넘침      — 칸보다 넓은 내용이 옆 칸을 덮는다 (min-width:0 빠짐)
 *     ② 탭 줄 세로 스크롤바 — overflow-x 만 적으면 y 가 auto 로 딸려 온다
 *     ③ 푸터가 안 붙음   — 짧은 쪽에서 아래가 텅 빈다. 「덜 만든 화면」으로 읽힌다
 *     ④ 글자 겹침       — 서로 포개져 못 읽는다 (ST0401 이 그랬다)
 *     ⑤ CSS 점이 글자를 덮음 — 세로 타임라인용 점(::before)을 가로 줄에 쓰면 앞 글자를 문다
 *
 *   ⚠ 사람 눈에 맡기면 «봤다고 생각하고» 넘어간다. 재면 안 넘어간다.
 *
 * ⛔ 한글 경로에서 헤드리스 크롬은 아무 말 없이 아무것도 안 만든다.
 *    영문 폴더에 옮겨 놓고 연다 (단계표시검사.mjs 와 같은 수법).
 *
 * 쓰는 법
 *   node _작업/레이아웃검사.mjs                    # 팩 전부
 *   node _작업/레이아웃검사.mjs 공동구매_디럭스        # 한 팩만
 *   node _작업/레이아웃검사.mjs 공동구매_디럭스 --폭 390  # 폰 폭으로
 */
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
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
/* ⛔ 이 자리 이름을 «cc-layout» 으로 못 박아 두면 안 된다 — 2026-08-25 에 걸렸다.
   spec-a 와 spec-b 는 «같은 시각»에 돈다. 둘이 이 한 자리를 서로 rmSync 로 지우고
   제 팩을 부어 넣어서, 공동구매를 재라고 했는데 남의 팩(매칭) 화면이 들어 있었다.
   쪽 이름이 달라 «없는 파일»로 멈춘 것이 다행이었다 —
   이름이 겹치는 쪽(MY-01 처럼)은 «남의 팩을 우리 팩이라고» 조용히 재고 지나간다.
   크롬 찌꺼기 자리와 똑같이 제 번호를 붙인다. */
const W = `${process.env.TEMP.replace(/\\/g, "/")}/cc-layout-${process.pid}`;
/* ⚠ 남의 cc-layout* 을 «치워 주지» 않는다. 옆에서 도는 루틴이 지금 쓰고 있는 자리일 수 있다.
   내 것만 끝나면서 지운다. */
process.on("exit", () => { try { 지우기(W, { recursive: true, force: true }); } catch {} });

const 인자 = process.argv.slice(2);
const 폭자리 = 인자.indexOf("--폭");
const 창폭 = 폭자리 >= 0 ? Number(인자[폭자리 + 1]) : 1536;
/* ⚠ 「--폭」이 없으면 폭자리가 -1 이라 «0번 인자»(팩 이름)가 값으로 잡혀 사라진다.
   2026-08-20 에 한 팩만 재라고 했는데 조용히 14팩을 다 돌았다. */
const 값자리 = 폭자리 >= 0 ? 폭자리 + 1 : -1;
const 팩들 = 인자.filter((a, i) => !a.startsWith("--") && i !== 값자리);

/* 재는 코드 — 창 안에서 돈다. 결과는 <title> 로 넘긴다(--dump-dom 으로 받는다). */
const 잴것 = `
  addEventListener("load", () => setTimeout(() => {
    const W = document.documentElement.clientWidth;
    const H = innerHeight;
    const 이름 = (e) => e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\\s+/)[0] : "");

    /* ① 가로 넘침 — 창 밖으로 나간 것. 스스로 가로 스크롤을 갖는 것(캐러셀)은 뺀다. */
    const 넘침 = [];
    for (const e of document.querySelectorAll("body *")) {
      const r = e.getBoundingClientRect();
      if (r.width < 1) continue;
      if (r.right <= W + 1 && r.left >= -1) continue;
      /* ⚠ «일부러 화면 밖에 둔 것»은 넘침이 아니다 (2026-09-08).
         「본문으로 건너뛰기」(a.skip) 같은 도움 링크는 left:-9999px 로 숨겨 두는 것이
         표준 수법이다. 이걸 안 빼면 41쪽 전부가 걸려서 검사가 쓸모없어진다 —
         실제로 반려동물케어_플러스를 재니 41/41 이 이것 하나로 걸렸다.
         «통째로» 왼쪽 밖에 있으면 숨긴 것이고, «걸쳐» 있어야 깨진 것이다. */
      if (r.right < 0) continue;
      /* ⚠ 부모가 «가둬 주면» 페이지가 안 깨진다. auto·scroll 뿐 아니라 hidden·clip 도 가둔다.
         2026-08-20 에 hidden 을 빼먹어서 .ticker ul(overflow:hidden) 안의 li 를 헛짚었다. */
      let p = e.parentElement, 갇힘 = false;
      while (p && p !== document.body) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") { 갇힘 = true; break; }
        p = p.parentElement;
      }
      if (!갇힘) 넘침.push(이름(e) + " " + Math.round(r.left) + "~" + Math.round(r.right));
    }

    /* ② 세로 스크롤바가 딸려 온 «가로 줄»
       찾는 것은 탭·칩 줄이다 — 「overflow-x:auto」 만 적어서 y 가 auto 로 딸려 온 자리.
       ⛔ 스스로 스크롤하는 것을 잡으면 안 된다 (2026-08-20 에 다섯 쪽을 헛짚었다):
          · textarea·select — 원래 스크롤되는 물건이다
          · 모달·바텀시트 — 길면 스크롤하는 것이 맞다
       그래서 «납작한 줄»(높이 200px 미만)만 본다. 탭 줄은 언제나 납작하다. */
    const 딸림 = [];
    const 스스로도는것 = new Set(["TEXTAREA", "SELECT", "INPUT", "PRE", "IFRAME"]);
    for (const e of document.querySelectorAll("body *")) {
      if (스스로도는것.has(e.tagName)) continue;
      if (e.clientHeight >= 200) continue;              /* 판때기는 스크롤해도 된다 */
      const s = getComputedStyle(e);
      const x = s.overflowX === "auto" || s.overflowX === "scroll";
      const y = s.overflowY === "auto" || s.overflowY === "scroll";
      if (x && y && e.scrollHeight > e.clientHeight + 1) 딸림.push(이름(e) + " " + e.scrollHeight + ">" + e.clientHeight);
    }

    /* ③ 푸터가 바닥에 안 붙음 — 짧은 쪽에서만 따진다 */
    const ft = document.querySelector("footer, .ft, .footer");
    const 문서 = document.documentElement.scrollHeight;
    let 푸터틈 = null;
    if (ft) {
      const 아래 = Math.round(문서 - (ft.getBoundingClientRect().bottom + scrollY));
      if (문서 <= H + 4 && 아래 > 4) 푸터틈 = 아래;      /* 한 화면에 다 드는데 아래가 비었다 */
      else if (문서 < H - 4) 푸터틈 = Math.round(H - 문서); /* 문서가 창보다 짧다 */
    }

    /* ④ 글자 겹침 — 형제끼리 «글자»가 포개진 것
       ⛔ 2026-08-20 에 두 번 헛짚었다. 둘 다 «상자»를 쟀기 때문이다:
          · 장비렌탈 PD0201 — 「원 / 1일」이 두 줄로 갈리자 합친 상자가 왼쪽 끝까지 늘어났다
          · LMS ST0101 — 「전체 수강생」은 블록이라 상자가 칸 전체(53~452)를 먹는데
            글자는 53~117 뿐이다. 오른쪽 끝의 👥(424~452)와 상자만 겹쳤다
       ⭐ Range 로 «글자가 실제로 앉은 자리»를 잰다. 상자가 아니라 잉크를 본다. */
    const 잉크 = (e) => {
      const r = document.createRange();
      r.selectNodeContents(e);
      return [...r.getClientRects()].filter((x) => x.width > 4 && x.height > 4);
    };
    const 겹침 = [];
    const 글자 = [...document.querySelectorAll("h1,h2,h3,h4,p,span,strong,em,li,td,th,label,dd,dt")]
      .filter((e) => e.children.length === 0 && e.textContent.trim().length > 1)
      .map((e) => ({ e, 줄: 잉크(e) }))
      .filter((o) => o.줄.length);
    for (let i = 0; i < 글자.length && 겹침.length < 4; i += 1) {
      let 걸림 = false;
      for (let j = i + 1; j < 글자.length && !걸림; j += 1) {
        const a = 글자[i], b = 글자[j];
        if (a.e.parentElement !== b.e.parentElement) continue;
        for (const ra of a.줄) {
          for (const rb of b.줄) {
            const 겹폭 = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
            const 겹높 = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
            if (겹폭 > 4 && 겹높 > 4) {
              겹침.push(a.e.textContent.trim().slice(0, 10) + " ✕ " + b.e.textContent.trim().slice(0, 10));
              걸림 = true; break;
            }
          }
          if (걸림) break;
        }
      }
    }

    /* ⑤ CSS 로 그린 «점»이 옆 글자를 덮는다
       ⛔ 2026-08-20 공동구매 DE-01. .tl-item::before 는 left:-21px 로 «세로» 타임라인의
          왼쪽 여백에 점을 찍는다. 그런데 가로로 늘어놓는 .ticker 안에 쓰면
          그 -21px 이 앞 항목의 글자 위로 간다 — 9px 씩 덮고 있었다.
       ⚠ ④(글자 겹침)로는 못 잡는다. 의사요소라 DOM 에 없어서 사각형을 못 견준다. */
    const 점덮음 = [];
    const 가로줄 = [...document.querySelectorAll("body *")].filter((e) => {
      const s = getComputedStyle(e);
      return s.display === "flex" && s.flexDirection.indexOf("row") === 0 && e.children.length > 1;
    });
    for (const 줄 of 가로줄) {
      const 애들 = [...줄.children].map((e) => ({ e, r: e.getBoundingClientRect(), b: getComputedStyle(e, "::before") }))
        .filter((o) => o.r.width > 4 && o.b.content !== "none" && o.b.position === "absolute");
      for (let i = 1; i < 애들.length && 점덮음.length < 4; i += 1) {
        const 앞 = 애들[i - 1], 이 = 애들[i];
        if (Math.abs(이.r.top - 앞.r.top) > 8) continue;
        const 점왼 = 이.r.left + (parseFloat(이.b.left) || 0);
        /* ⚠ 이 안은 «바깥 템플릿 문자열» 속이다. \${…} 를 쓰면 바깥이 먼저 먹는다 — 이어 붙인다. */
        if (점왼 < 앞.r.right - 1) 점덮음.push(이름(이.e) + " 점이 앞 글자를 " + Math.round(앞.r.right - 점왼) + "px 덮음");
      }
    }

    /* ⑥ 콘텐츠 폭이 한 쪽 «안에서» 갈리는 것 (2026-09-08 사장님 지적)
     *
     *   사장님: 「콘텐츠 영역 엉망, 그리드 하나도 안 맞는 박스들하며」
     *   반려동물케어_플러스 를 AI도구로 지어 보니 한 쪽에서 1440px 과 760px 이
     *   여덟 번 번갈아 나왔다 — 왼쪽 끝이 340px 씩 들락날락한다.
     *
     *   ⚠ 스펙팩은 «이미» 시켰다: 「콘텐츠 영역 최대 1440px … 화면마다 따로 정하지
     *     않는다. 화면마다 폭을 새로 정하면 위아래가 어긋납니다.」
     *     지시가 있어도 AI도구는 어긴다. 글로 적힌 규칙은 안 지켜진다 — 그래서 «잰다».
     *
     *   읽기 폭(760px)은 «글이 주인공인 자리»에만 쓰라고 했으니, 갈리는 것 자체가
     *   아니라 «몇 번 갈리나»를 센다. 두세 번은 뜻이 있고, 여덟 번은 사고다. */
    const 왼끝들 = [];
    for (const e of document.querySelectorAll("main .wrap, main .reading, main > section, main > div")) {
      const r = e.getBoundingClientRect();
      if (r.height < 24 || r.width < 100) continue;
      /* 껍데기가 아니라 «내용이 시작하는 자리»를 잰다 — .wrap 안에 .reading 이 있으면 안쪽이 기준 */
      const 안 = e.querySelector(":scope > .reading") || e;
      const ir = 안.getBoundingClientRect();
      const cs = getComputedStyle(안);
      왼끝들.push(Math.round(ir.left + (parseFloat(cs.paddingLeft) || 0)));
    }
    /* ⚠ 좁은 화면에서는 재지 않는다 (2026-09-08 에 헛걸렸다).
       390px 에서는 --wrap 도 --reading 도 화면 폭에 맞춰 붙으므로 둘이 사실상 같다.
       그때 남는 16px 차이는 그냥 여백이지 «폭이 갈린 것»이 아니다.
       두 폭이 실제로 갈라지는 넓은 화면에서만 뜻이 있다. */
    let 폭갈림 = 0;
    if (W >= 900) for (let i = 1; i < 왼끝들.length; i++) if (Math.abs(왼끝들[i] - 왼끝들[i - 1]) > 40) 폭갈림 += 1;
    const 폭종류 = W >= 900 ? [...new Set(왼끝들)].sort((a, b) => a - b) : [];

    /* ⑦ 같은 격자 안 카드들의 «제목 높이»가 안 맞는 것
     *
     *   배지가 가운데 카드에만 있으면 그 카드 제목만 아래로 밀린다. 값 세 개가
     *   층층이 어긋나 보이고, 사람은 그걸 「그리드가 안 맞는다」로 읽는다.
     *   index.html 에서 실제로 그랬다 — 한 카드에만 badge-row 가 있었다. */
    /* ⚠ «같은 줄에 나란히 선 카드»끼리만 견준다 (2026-09-08 에 헛걸렸다).
       좁은 화면에서 격자가 한 줄로 접히면 카드가 세로로 쌓인다. 그때 제목 높이가
       다른 것은 당연한데, 그걸 「어긋났다」고 세면 390px 에서 7쪽이 헛걸린다.
       카드 «자기 윗변»이 서로 8px 안에 있는 것끼리 한 줄로 묶는다. */
    const 격자어긋남 = [];
    for (const g of document.querySelectorAll(".grid")) {
      const 칸 = [...g.children]
        .map((c) => ({ c, r: c.getBoundingClientRect() }))
        .filter((x) => x.r.height > 20);
      if (칸.length < 2) continue;
      const 줄묶음 = new Map();
      for (const x of 칸) {
        const 줄키 = Math.round(x.r.top / 8);
        if (!줄묶음.has(줄키)) 줄묶음.set(줄키, []);
        줄묶음.get(줄키).push(x);
      }
      for (const 한줄 of 줄묶음.values()) {
        if (한줄.length < 2) continue;   /* 혼자면 견줄 상대가 없다 = 세로로 쌓인 것 */
        const 윗변 = 한줄.map((x) => {
          const h = x.c.querySelector("h2, h3, h4, .num");
          return h ? Math.round(h.getBoundingClientRect().top) : null;
        }).filter((v) => v !== null);
        if (윗변.length < 2) continue;
        const 벌어짐 = Math.max(...윗변) - Math.min(...윗변);
        if (벌어짐 > 8) 격자어긋남.push(이름(g) + " 제목이 " + 벌어짐 + "px 어긋남");
      }
    }

    document.title = JSON.stringify({ 창: W, 문서, 넘침: 넘침.slice(0, 4), 딸림: 딸림.slice(0, 4), 푸터틈, 겹침, 점덮음, 폭갈림, 폭종류: 폭종류.slice(0, 6), 격자어긋남: 격자어긋남.slice(0, 4) });
  }, 300));`;

/* ⭐ «남의 폴더»도 잰다 — 손님이 우리 스펙팩을 AI도구에 넣어 지은 사이트 (2026-09-08)
 *
 *   사장님: 「검수기에서 분명 검수를 하고 만드는 팩인데, 내가 하나하나 또 만들어 보면서
 *          해야 하는 게 맞나?」
 *
 *   맞지 않다. 그런데 여태 이 검사기는 «우리가 손으로 만든 완성화면»만 봤다.
 *   손님이 겪는 것은 «스펙팩으로 지어진 사이트»인데 그건 아무도 안 봤다.
 *   그래서 사장님이 직접 지어 보실 때만 흠이 나왔다.
 *
 *     node _작업/레이아웃검사.mjs --폴더 "D:/…/site"
 *
 *   쪽이 pages/ 안에 있으면 그쪽을, 없으면 폴더 뿌리의 *.html 을 잰다. */
const 폴더자리 = 인자.indexOf("--폴더");
const 남의폴더 = 폴더자리 >= 0 ? 인자[폴더자리 + 1] : null;

const 목록 = 남의폴더
  ? [{ 이름: 남의폴더.split(/[\\/]/).filter(Boolean).slice(-2).join("/"), 뿌리: 남의폴더 }]
  : (팩들.length
      ? 팩들
      : readdirSync(팩방, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    ).map((p) => ({ 이름: p, 뿌리: join(팩방, p, "완성화면") }));

let 본쪽 = 0, 걸린쪽 = 0;
for (const { 이름: 팩, 뿌리 } of 목록) {
  if (!existsSync(뿌리)) continue;
  /* 쪽이 pages/ 안에 있는 판(우리 팩)과 뿌리에 흩어진 판(AI도구가 지은 사이트)을 다 받는다 */
  const 속 = existsSync(join(뿌리, "pages")) ? "pages" : ".";
  const pages = join(뿌리, 속);
  const 쪽들 = readdirSync(pages).filter((f) => f.endsWith(".html") && !f.startsWith("_"));
  if (!쪽들.length) continue;

  rmSync(W, { recursive: true, force: true });
  mkdirSync(W, { recursive: true });
  cpSync(뿌리, W, { recursive: true });

  const 흠 = [];
  for (const f of 쪽들) {
    const 길 = join(W, 속, `_잴것_${f}`);
    writeFileSync(길, readFileSync(join(W, 속, f), "utf8").replace("</body>", `<script>${잴것}<\/script></body>`), "utf8");
    let 것;
    try {
      const dom = execFileSync(CHROME, ["--headless=new", "--user-data-dir=" + 크롬찌꺼기,  "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1", `--window-size=${창폭},1000`, "--virtual-time-budget=5000",
        "--dump-dom", `file:///${길.replace(/\\/g, "/")}`], { encoding: "utf8", maxBuffer: 1 << 26 });
      것 = JSON.parse(/<title>([\s\S]*?)<\/title>/.exec(dom)?.[1] ?? "null");
    } catch { 것 = null; }
    본쪽 += 1;
    if (!것) { 흠.push(`    ${f}  못 쟀다 (크롬이 안 열렸거나 title 을 못 받았다)`); 걸린쪽 += 1; continue; }
    const 줄 = [];
    if (것.넘침.length) 줄.push(`가로 넘침 ${것.넘침.length}곳 — ${것.넘침.join(" · ")}`);
    if (것.딸림.length) 줄.push(`세로 스크롤바 딸림 — ${것.딸림.join(" · ")}`);
    if (것.푸터틈) 줄.push(`푸터 아래 ${것.푸터틈}px 빔`);
    if (것.겹침.length) 줄.push(`글자 겹침 — ${것.겹침.join(" · ")}`);
    if (것.점덮음?.length) 줄.push(`CSS 점이 글자를 덮음 — ${것.점덮음.join(" · ")}`);
    /* 폭 갈림 — 셋부터 걸린다. 한두 번은 「글이 주인공인 자리」라 뜻이 있다.
       ⚠ 2026-09-08 에 넷으로 뒀더니 사장님이 보내신 바로 그 쪽(ho0201)이 안 걸렸다. */
    if (것.폭갈림 >= 3) 줄.push(`콘텐츠 폭이 ${것.폭갈림}번 갈림 — 왼쪽 끝 ${것.폭종류?.join("·")}px`);
    if (것.격자어긋남?.length) 줄.push(`격자 안 카드가 안 맞음 — ${것.격자어긋남.join(" · ")}`);
    if (줄.length) { 걸린쪽 += 1; 흠.push(`    ${f.replace(".html", "").padEnd(8)} ${줄.join(" / ")}`); }
  }

  console.log(`  ${흠.length ? "✗" : "✓"} ${팩.padEnd(18)} ${쪽들.length}쪽 · 폭 ${창폭} · ${흠.length ? `걸린 쪽 ${흠.length}` : "걸리는 곳 없음"}`);
  if (흠.length) console.log(흠.join("\n"));
}
rmSync(W, { recursive: true, force: true });
console.log(`\n모두 ${본쪽}쪽 · 걸린 쪽 ${걸린쪽}쪽`);
process.exit(걸린쪽 ? 1 : 0);
