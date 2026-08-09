/* 07_AI빌드_스펙팩.json 의 43개 화면(2뎁스)을 정적 HTML 로 생성한다.
   실행: node build/generate.mjs  (사이트 루트에서)

   프리미엄(3뎁스 144화면)과 같은 만들기 함수를 쓰되, 상태 변형 없이
   기본 화면 하나씩만 그린다. 색·모서리는 소프트 파스텔 프리셋을 입혔다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as UI from './ui.mjs';
import { SITE } from './data.mjs';
import * as HO from './pages-ho.mjs';
import * as PR from './pages-pr.mjs';
import * as CTBK from './pages-ct-bk.mjs';
import * as VCCS from './pages-vc-cs.mjs';
import * as MY from './pages-my.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPEC = process.env.SPEC_PATH || path.resolve(ROOT, '스펙팩/07_AI빌드_스펙팩.json');
const OUT = path.resolve(ROOT, 'pages');

const BUILDERS = { ...HO, ...PR, ...CTBK, ...VCCS, ...MY };

const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));

fs.mkdirSync(OUT, { recursive: true });

// 만들기 전에 "이 사이트에 어떤 화면이 있는지"를 UI에 알려 준다 — 링크를 옮길 때 쓴다.
UI.setPages(spec.screens.map((s) => s.pageId));

const missing = [];
let written = 0;

for (const s of spec.screens) {
  // 2뎁스 화면ID(HO-01)를 만들기 함수 이름(HO0101)으로 옮긴다.
  const baseId = s.pageId.replace('-', '') + '01';
  const fn = BUILDERS[baseId];
  if (!fn) { missing.push(`${s.pageId} (base ${baseId})`); continue; }
  // backTo 는 스펙팩이 화면마다 정해 준 뒤로가기 목적지다(메뉴 첫 화면은 null).
  const ctx = { id: s.pageId, pageName: s.pageName, funcDef: s.funcDef, menu: s.menu, buttons: s.buttons || [], backTo: s.backTo || null };
  const { body, o } = fn(ctx);
  const html = UI.shell(ctx, body, o || {});
  fs.writeFileSync(path.join(OUT, `${s.pageId}.html`), html, 'utf8');
  written++;
}

/* ---------- 전체 화면 목록 (index.html) ---------- */
const menuOf = new Map();
for (const m of spec.menus) menuOf.set(m.code, m);

const total = spec.screens.length;
// 디럭스는 2뎁스라 전부가 기본 화면이다. 상태·세부로 나누는 건 프리미엄(3뎁스) 얘기다.
const homeId = spec.screens[0]?.pageId ?? 'HO-01';

const indexHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>전체 화면 목록 · ${SITE.name}</title>
<link rel="stylesheet" href="assets/css/base.css">
</head>
<body>
<header class="gnb"><div class="gnb-in">
  <a class="logo" href="index.html"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
  <nav class="gnb-nav"><a href="pages/${homeId}.html">홈 화면 보기</a></nav>
</div></header>

<section class="idx-hero"><div class="wrap">
  <h1 class="t-page" style="color:#fff">${spec.project.concept ? '여행 디럭스 — 전체 화면' : ''}</h1>
  <p class="mt3" style="color:rgba(255,255,255,.9);max-width:760px">${spec.project.concept}</p>
  <div class="row mt6 wrap-row" style="gap:32px">
    <div><div class="t-sec" style="color:#fff">${total}개</div><div class="t-sub" style="color:rgba(255,255,255,.8)">전체 화면</div></div>
    <div><div class="t-sec" style="color:#fff">${spec.menus.length}개</div><div class="t-sub" style="color:rgba(255,255,255,.8)">메뉴 그룹</div></div>
    <div><div class="t-sec" style="color:#fff">2뎁스</div><div class="t-sub" style="color:rgba(255,255,255,.8)">메뉴 → 화면</div></div>
  </div>
</div></section>

<main class="main"><div class="wrap">
  <div class="card mb8"><div class="card-bd">
    <h2 class="t-card mb3">가이드 프리셋 03 — 소프트 파스텔</h2>
    <div class="row wrap-row" style="gap:8px">
      ${[['primary', '#5B4FE5'], ['primary-hover', '#4A3DD1'], ['accent', '#FFD54A'], ['background', '#FAFAFA'],
    ['surface', '#FFFFFF'], ['text', '#1F2024'], ['text-muted', '#6B6F76'], ['border', '#E7E7EA'],
    ['pastel-mint', '#DFF5EC'], ['pastel-lavender', '#EDE9FE'], ['pastel-yellow', '#FFF6D9']]
    .map(([n, c]) => `<div style="width:112px"><div style="height:44px;border-radius:8px;border:1px solid var(--border);background:${c}"></div>
        <div class="t-sub mt1">${n}<br>${c}</div></div>`).join('')}
    </div>
    <p class="t-sub mt4">Pretendard · 카드 16px / 버튼·입력 12px / 배지는 완전 둥글게 · 카드 안 24px, 섹션 간격 40px · 그림자는 카드에만 (0 2px 8px rgba(31,32,36,.06))</p>
  </div></div>

  <div class="box mb8" style="border-left:4px solid var(--primary)">
    <h3 class="t-card mb3">화면이 만들어졌습니다 — 목록에서 확인해 보세요</h3>
    <p class="t-sub">한 사이트를 만들기 위해서는 복잡한 흐름과 기능들이 있어요.
    스펙에서 작성되는 지시문은 3,000줄 ~ 5,000줄 이상입니다.
    AI가 스펙을 읽고 화면으로 옮기는 사이에 어긋남이 발생할 수 있어요.</p>
    <p class="t-sub mt3">그래서 <b>'내 서비스 내가 확인할 수 있도록'</b> 화면목록을 작성하고 검수 시나리오를 준비했습니다.</p>
    <p class="t-sub mt3">📌 전문 에이전시에서는 웹사이트를 제작할 때 가장 먼저 하는 일이 <b>화면목록(IA) 작성</b>이고,
    배포 전에는 빠짐없는 검수를 위해 <b>검수(테스트) 시나리오</b>를 작성합니다.
    바이브코딩은 이 과정을 생략하고 있지요. 그래서 제작 후 검수가 어렵고,
    체계적으로 진행할 수 없어 오히려 시간이 많이 걸려요.</p>
    <p class="t-sub mt3">아래 목록에서 화면을 하나씩 열어 잘 구성됐는지 확인하고,
    배포 전에는 검수 시나리오대로 테스트해 보세요.
    어긋나는 부분, 오류가 발생하는 부분은 AI 도구에
    <b>'화면 ID, ~~ 고쳐줘.'</b> 라고 하면 AI가 쉽게 찾아 수정할 수 있어요.</p>
  </div>

  ${spec.menus.map((m) => `<section class="idx-menu">
    <h3><span class="code">${m.code}</span>${m.nameKo} <span class="muted" style="font-size:14px;font-weight:400">${m.nameEn} · ${m.screens.length}개</span></h3>
    <div class="idx-list">
      ${m.screens.map((sc) => `<a href="pages/${sc.pageId}.html">
        <span class="pid">${sc.pageId}</span><span>${sc.pageName}</span></a>`).join('')}
    </div></section>`).join('')}

  <div class="box mt8">
    <h3 class="t-card mb2">이 사이트에 대해</h3>
    <p class="t-sub">스펙팩(07_AI빌드_스펙팩.json)의 화면 정의와 디자인 프리셋(가이드_03_소프트파스텔.json)을 그대로 반영해 만든 정적 프로토타입입니다.
    화면마다 스펙팩의 화면 프롬프트를 그대로 반영했습니다.
    각 화면 우하단의 <b>화면 정보</b> 버튼을 누르면 pageId · 화면명 · 기능정의와 연결 화면을 확인할 수 있습니다.</p>
  </div>
</div></main>

<footer class="ft"><div class="ft-in"><div class="ft-bot">
  <span>© 2026 ${SITE.name}. 기획 검토용 프로토타입.</span>
  <span>화면 ${total}개 · 생성 스크립트 build/generate.mjs</span>
</div></div></footer>
<script src="assets/js/app.js"></script>
</body></html>`;

fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml, 'utf8');

console.log(`생성 완료 — 화면 ${written}/${total}개, index.html 1개`);
if (missing.length) console.log('빌더 없음:', missing.join(', '));
