/* 07_AI빌드_스펙팩.json(프리미엄 · 3뎁스 125화면)을 정적 HTML 로 생성한다.
   실행: node build/generate.mjs  (사이트 루트에서) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as UI from './ui.mjs';
import { SITE } from './data.mjs';
import { PAGES as HODE } from './pages-ho-de.mjs';
import { PAGES as JOMY } from './pages-jo-my.mjs';
import { PAGES as RVAC } from './pages-rv-ac.mjs';
import { PAGES as HS } from './pages-hs.mjs';
import { PAGES as HM } from './pages-hm.mjs';
import { PAGES as SECS } from './pages-se-cs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPEC = process.env.SPEC_PATH || path.resolve(ROOT, '스펙팩/07_AI빌드_스펙팩.json');
const PRESET = path.resolve(ROOT, '스펙팩/가이드_02_미니멀모노.json');
const LAYOUT = path.resolve(ROOT, '스펙팩/레이아웃_A_타이포강조형.json');
const OUT = path.resolve(ROOT, 'pages');

/* 화면 안에서는 'HO-01' 처럼 짧게 적는다. 스펙팩 코드(HO0101)로 바꿔 등록한다. */
const short2spec = (k) => (/^[A-Z]{2}-\d{2}$/.test(k) ? `${k.slice(0, 2)}${k.slice(3)}01` : k);
const BUILDERS = {};
for (const src of [HODE, JOMY, RVAC, HS, HM, SECS]) {
  for (const [k, v] of Object.entries(src)) BUILDERS[short2spec(k)] = v;
}

const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
const preset = JSON.parse(fs.readFileSync(PRESET, 'utf8'));
const layout = JSON.parse(fs.readFileSync(LAYOUT, 'utf8'));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 만들기 전에 "이 사이트에 어떤 화면이 있는지"를 UI에 알려 준다 — 링크를 옮길 때 쓴다.
UI.setPages(spec.screens.map((s) => s.pageId));

const missing = [];
let written = 0;

for (const s of spec.screens) {
  const fn = BUILDERS[s.pageId];
  if (typeof fn !== 'function') { missing.push(s.pageId); continue; }
  // backTo 는 스펙팩이 화면마다 정해 준 뒤로가기 목적지다(메뉴 첫 화면은 null).
  const ctx = {
    id: s.pageId, pageName: s.pageName, funcDef: s.funcDef, menu: s.menu,
    buttons: s.buttons || [], backTo: s.backTo || null,
  };
  const { body, o } = fn(ctx);
  fs.writeFileSync(path.join(OUT, `${s.pageId}.html`), UI.shell(ctx, body, o || {}), 'utf8');
  written++;
}

/* ---------- 전체 화면 목록 (index.html) ---------- */
const total = spec.screens.length;
const swatch = Object.entries(preset.colors).map(([k, v]) => [k.replace(/ \(.*\)$/, ''), v]);
const isSub = (id) => !/01$/.test(id);
const subCount = spec.screens.filter((s) => isSub(s.pageId)).length;

const indexHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>전체 화면 목록 · ${SITE.name}</title>
<link rel="stylesheet" href="assets/css/base.css">
</head>
<body>
<header class="gnb dark"><div class="gnb-in">
  <a class="logo" href="index.html"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
  <nav class="gnb-nav"><a href="pages/HO0101.html">참여자 홈</a><a href="pages/HM0101.html">진행자 화면</a></nav>
  <div class="gnb-util"><a class="btn btn-sm" href="pages/DE0101.html">대표 화면 보기</a></div>
</div></header>

<section class="hero-bold"><div class="wrap">
  <div class="kicker">공동구매 플랫폼 · 프리미엄</div>
  <h1>화면 <em>${total}개</em>를<br>스펙팩 그대로 만들었습니다</h1>
  <p class="sub">${spec.project.concept}</p>
  <div class="figs">
    <div class="fig"><div class="n">${total}개</div><div class="l">전체 화면</div></div>
    <div class="fig"><div class="n">${spec.menus.length}개</div><div class="l">메뉴 그룹</div></div>
    <div class="fig"><div class="n">${subCount}개</div><div class="l">상태·탭·예외</div></div>
    <div class="fig"><div class="n">3뎁스</div><div class="l">설계 깊이</div></div>
  </div>
</div></section>

<main class="main"><div class="wrap">
  <div class="card mb8"><div class="card-bd">
    <h2 class="t-card mb3">디자인 프리셋 — 가이드 ${preset.preset.no} ${preset.preset.name} × 레이아웃 ${layout.layout.no} ${layout.layout.name}</h2>
    <div class="row wrap-row" style="gap:8px">
      ${swatch.map(([n, c]) => `<div style="width:112px"><div style="height:44px;border-radius:var(--r-card);border:1px solid var(--border);background:${c}"></div>
        <div class="t-sub mt1" style="font-size:12px">${n}<br>${c}</div></div>`).join('')}
    </div>
    <p class="t-sub mt4">${preset.typography.fontFamily} (폴백 ${preset.typography.fallback}) · 카드·버튼·입력 ${preset.radius.card} / 배지 ${preset.radius.badge} · ${preset.spacing}</p>
    <p class="t-sub mt2">${preset.shadow}</p>
    <p class="t-sub mt2">레이아웃 ${layout.layout.no} — ${layout.layout.tagline} 히어로는 어두운 배경에 큰 제목과 숫자 지표 4개, 목록은 계단식 카드, 상세는 상단 어두운 띠와 하단 고정 바.</p>
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
    <h3><span class="code">${m.code}</span>${m.nameKo} <span class="muted" style="font-size:13px;font-weight:400">${m.nameEn} · ${m.screens.length}개</span></h3>
    <div class="idx-list">
      ${m.screens.map((sc) => `<a class="${isSub(sc.pageId) ? 'sub' : ''}" href="pages/${sc.pageId}.html">
        <span class="pid">${sc.pageId}</span><span>${sc.pageName}</span></a>`).join('')}
    </div></section>`).join('')}

  <div class="box mt8">
    <h3 class="t-card mb2">이 사이트에 대해</h3>
    <p class="t-sub">스펙팩(07_AI빌드_스펙팩.json)의 화면 정의에 디자인 프리셋 두 벌(가이드 ${preset.preset.no} ${preset.preset.name} · 레이아웃 ${layout.layout.no} ${layout.layout.name})을 함께 넣어 만든 정적 프로토타입입니다.
    화면마다 스펙팩에 적힌 화면 프롬프트를 그대로 따라 만들었습니다. 옅게 표시된 것은 상위 화면의 <b>탭·상태·예외</b>를 펼친 3뎁스 화면입니다.
    사진 자리는 실제 사진 대신 <b>무엇이 들어갈 자리인지와 권장 크기</b>를 적은 옅은 블록으로 두었고, 적어 둔 비율을 그대로 지킵니다.
    각 화면 우하단의 <b>화면 정보</b> 버튼을 누르면 pageId · 화면명 · 기능정의와 연결 화면을 볼 수 있습니다.</p>
  </div>
</div></main>

<footer class="ft"><div class="ft-in"><div class="ft-bot">
  <span>© 2026 ${SITE.name}. 이 사이트는 기획 검토용 프로토타입입니다.</span>
  <span>화면 ${total}개 · 생성 스크립트 build/generate.mjs</span>
</div></div></footer>
<script src="assets/js/app.js"></script>
</body></html>`;

fs.writeFileSync(path.join(ROOT, 'index.html'), indexHtml, 'utf8');

console.log(`생성 완료 — 화면 ${written}/${total}개, index.html 1개`);
if (missing.length) console.log(`빌더 없음 ${missing.length}개:`, missing.join(', '));
