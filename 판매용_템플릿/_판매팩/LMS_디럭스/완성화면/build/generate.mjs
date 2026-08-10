/* 07_AI빌드_스펙팩.json 의 화면 44개를 정적 HTML 로 만든다.
   실행 : node build/generate.mjs   (완성화면 폴더에서) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as U from './ui.mjs';
import { SITE } from './data.mjs';
import HOTC from './pages-ho-tc.mjs';
import CO from './pages-co.mjs';
import CL from './pages-cl.mjs';
import CU from './pages-cu.mjs';
import STGR from './pages-st-gr.mjs';
import MYAU from './pages-my-au.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPEC = process.env.SPEC_PATH || path.resolve(ROOT, '스펙팩/07_AI빌드_스펙팩.json');
const OUT = path.resolve(ROOT, 'pages');

const BUILDERS = { ...HOTC, ...CO, ...CL, ...CU, ...STGR, ...MYAU };
const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));

fs.mkdirSync(OUT, { recursive: true });

const missing = [];
let written = 0;

for (const s of spec.screens) {
  const fn = BUILDERS[s.pageId];
  if (!fn) { missing.push(s.pageId); continue; }
  const ctx = {
    id: s.pageId, pageName: s.pageName, funcDef: s.funcDef, menu: s.menu,
    backTo: s.backTo || null, buttons: s.buttons || [], acts: s.acts || [],
  };
  const { body, o = {} } = fn(ctx);
  const html = o.solo ? U.solo(ctx, body, o) : U.shell(ctx, body, o);
  fs.writeFileSync(path.join(OUT, `${s.pageId}.html`), html, 'utf8');
  written++;
}

/* ---------- 전체 화면 목록 ---------- */
const total = spec.screens.length;
const backCount = spec.screens.filter((s) => s.backTo).length;
const actCount = spec.screens.reduce((a, s) => a + (s.acts || []).length, 0);

const COLORS = [
  ['primary', '#F0654F'], ['primary-hover', '#D9503B'], ['accent', '#F59E0B'], ['background', '#F0EFEB'],
  ['surface', '#FFFFFF'], ['text', '#33221E'], ['text-muted', '#7A6560'], ['border', '#F2E2DD'],
  ['success', '#0F7A52'], ['warning', '#B45309'], ['danger', '#C0392B'],
];

const indexHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>전체 화면 목록 · ${SITE.name}</title>
<meta name="description" content="${U.esc(spec.project.concept).slice(0, 150)}">
<link rel="stylesheet" href="assets/css/base.css">
</head>
<body>
<section class="idx-hero"><div class="wrap">
  <div class="row-c" style="gap:10px"><span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:12px;background:var(--primary);color:#fff;font-size:18px;font-weight:800">${SITE.mark}</span>
    <b style="font-size:18px">${SITE.name}</b></div>
  <h1 class="t-page mt4">${U.esc(spec.project.title)} — 전체 화면</h1>
  <p class="t-sub mt3" style="max-width:820px;font-size:15px">${U.esc(spec.project.concept)}</p>
  <div class="g4 mt6">
    <div class="box"><div class="t-sec">${total}개</div><div class="t-sub">전체 화면</div></div>
    <div class="box"><div class="t-sec">${spec.menus.length}개</div><div class="t-sub">메뉴 그룹</div></div>
    <div class="box"><div class="t-sec">${backCount}개</div><div class="t-sub">뒤로가기가 붙은 화면</div></div>
    <div class="box"><div class="t-sec">${actCount}개</div><div class="t-sub">「눌렀을 때」 동작</div></div>
  </div>
</div></section>

<main class="main"><div class="wrap">
  <div class="card mb6"><div class="card-bd">
    <h2 class="t-card mb4">디자인 프리셋 — 가이드 03 코럴 선셋 · 레이아웃 A 대시보드형</h2>
    <div class="sw">${COLORS.map(([n, c]) => `<div><div class="c" style="background:${c}"></div>
      <div class="t-sub mt1">${n}<br>${c}</div></div>`).join('')}</div>
    <p class="t-sub mt6">Paperlogy · 카드 16px / 버튼·입력 12px / 배지 알약 · 카드 안쪽 24px · 카드 사이 가로 20px · 줄 사이 세로 28px ·
      그림자는 카드에만 (0 2px 8px rgba(51,34,30,.07))</p>
    <p class="t-sub mt2">레이아웃 A — 좌측 세로 사이드바 + 상단 바, 화면 위쪽에 지표 카드, 목록은 표 중심, 상세는 본문 + 우측 액션 패널.
      손님이 쓰는 메뉴와 강사가 쓰는 메뉴는 <b>사이드바를 나눠</b> 두었고, 오갈 때는 사이드바 맨 아래 진입점 하나로만 이동합니다.</p>
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
    <h3><span class="code">${m.code}</span>${m.nameKo}
      <span class="muted" style="font-size:14px;font-weight:500">${m.nameEn} · ${m.screens.length}개</span></h3>
    <div class="idx-list">
      ${m.screens.map((sc) => `<a href="pages/${sc.pageId}.html">
        <span class="pid">${sc.pageId}</span><span>${U.esc(sc.pageName)}</span></a>`).join('')}
    </div></section>`).join('')}

  <div class="card"><div class="card-bd">
    <h3 class="t-card mb3">이 화면들에 대해</h3>
    <p class="t-sub">스펙팩(07_AI빌드_스펙팩.json)의 화면 정의와 디자인 프리셋(가이드_03_코럴선셋 · 레이아웃_A_대시보드형)을 그대로 반영해 만든
    정적 화면 견본입니다. 서버와 데이터베이스는 붙어 있지 않아 로그인·결제·저장은 실제로 동작하지 않고, 짧은 안내 문구로 대신합니다.</p>
    <p class="t-sub mt3">각 화면의 <b>탭·필터·정렬·펼치기·체크·슬라이더</b>처럼 그 화면 안에서 끝나는 조작은 실제로 값이 바뀝니다.
    화면 우하단의 <b>화면 정보</b> 버튼을 누르면 화면ID · 화면명 · 기능정의와 연결 화면을 확인할 수 있습니다.</p>
    <p class="t-sub mt3">내용을 고치려면 <code>build/data.mjs</code>를 고친 뒤 <code>node build/generate.mjs</code>를 다시 실행하세요.</p>
  </div></div>
</div></main>

<footer class="ft"><div class="ft-in"><div class="ft-bot">
  <span>© 2026 ${SITE.name} · 기획 검토용 화면 견본</span>
  <span>화면 ${total}개 · 생성 스크립트 build/generate.mjs</span>
</div></div></footer>
</body></html>`;

fs.writeFileSync(path.resolve(ROOT, 'index.html'), indexHtml, 'utf8');

console.log(`생성 완료 — 화면 ${written}/${total}개, index.html 1개`);
if (missing.length) console.log('빌더 없음:', missing.join(', '));
