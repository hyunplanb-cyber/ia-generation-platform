/* 07_AI빌드_스펙팩.json 의 2뎁스 화면(디럭스 · 39화면)을 정적 HTML 로 생성한다.
   실행: node build/generate.mjs  (완성화면/ 폴더에서, 또는 어디서든 — 경로는 __dirname 기준) */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as UI from './ui.mjs';
import { SITE } from './data.mjs';
import { PAGES as HO } from './pages-ho.mjs';
import { PAGES as CS } from './pages-cs.mjs';
import { PAGES as ES } from './pages-es.mjs';
import { PAGES as VS } from './pages-vs.mjs';
import { PAGES as CT } from './pages-ct.mjs';
import { PAGES as PR } from './pages-pr.mjs';
import { PAGES as AS } from './pages-as.mjs';
import { PAGES as OW } from './pages-ow.mjs';
import { PAGES as AU } from './pages-au.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPEC = process.env.SPEC_PATH || path.resolve(ROOT, '스펙팩/07_AI빌드_스펙팩.json');
const PRESET = path.resolve(ROOT, '스펙팩/가이드_01_미니멀모노.json');
const LAYOUT = path.resolve(ROOT, '스펙팩/레이아웃_A_사진중심형.json');
const OUT = path.resolve(ROOT, 'pages');

const BUILDERS = { ...HO, ...CS, ...ES, ...VS, ...CT, ...PR, ...AS, ...OW, ...AU };

const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
const preset = JSON.parse(fs.readFileSync(PRESET, 'utf8'));
const layout = JSON.parse(fs.readFileSync(LAYOUT, 'utf8'));

fs.mkdirSync(OUT, { recursive: true });

// 만들기 전에 "이 사이트에 어떤 화면이 있는지"를 UI에 알려 준다 — 링크를 옮길 때 쓴다.
UI.setPages(spec.screens.map((s) => s.pageId));

const missing = [];
let written = 0;

for (const s of spec.screens) {
  const fn = BUILDERS[s.pageId];
  if (typeof fn !== 'function') { missing.push(s.pageId); continue; }
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
const swatch = Object.entries(preset.colors).map(([k, v]) => [k.replace(/ ?\(.*\)$/, ''), v]);

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
  <nav class="gnb-nav"><a href="pages/HO-01.html">첫 화면</a><a href="pages/PR-01.html">공정표</a><a href="pages/AS-01.html">하자보수</a></nav>
</div></header>

<section class="idx-hero"><div class="wrap" style="padding-bottom:0">
  <h1 class="t-page">인테리어 시공 견적·시공관리 — 전체 화면</h1>
  <p class="mt4" style="opacity:.94;max-width:900px">${spec.project.concept}</p>
  <div class="row mt8 wrap-row" style="gap:44px">
    <div><div class="t-sec">${total}개</div><div class="t-sub" style="color:rgba(255,255,255,.82)">전체 화면</div></div>
    <div><div class="t-sec">2뎁스</div><div class="t-sub" style="color:rgba(255,255,255,.82)">설계 깊이</div></div>
    <div><div class="t-sec">${spec.menus.length}개</div><div class="t-sub" style="color:rgba(255,255,255,.82)">메뉴 그룹</div></div>
  </div>
</div></section>

<main class="main"><div class="wrap">
  <div class="card mb8"><div class="card-bd">
    <h2 class="t-card mb4">디자인 프리셋 — 가이드 01 ${preset.preset.name} × 레이아웃 A ${layout.layout.name}</h2>
    <div class="row wrap-row" style="gap:8px">
      ${swatch.map(([n, c]) => `<div style="width:116px"><div style="height:46px;border-radius:var(--r-badge);border:1px solid var(--border);background:${c}"></div>
        <div class="t-sub mt1" style="font-size:12px">${n}<br>${c}</div></div>`).join('')}
    </div>
    <p class="t-sub mt4">${preset.typography.fontFamily} (폴백 ${preset.typography.fallback}) · 카드 ${preset.radius.card} / 버튼·입력 ${preset.radius.button} / 배지 ${preset.radius.badge}</p>
    <p class="t-sub mt2">레이아웃 A ${layout.layout.name} — ${layout.slots.hero} ${layout.slots.list} ${layout.slots.nav} ${layout.slots.detail}</p>
    <p class="t-sub mt2">간격은 밀도(컴팩트)에서 뽑은 눈금 12개를 CSS 값으로 박아 두었습니다 — 화면마다 눈대중으로 정하지 않습니다.</p>
  </div></div>

  <div class="box mb8" style="border-left:4px solid var(--primary)">
    <h3 class="t-card mb4">이 팩의 알맹이는 «SaaS 로 안 되는 공정 관리»입니다</h3>
    <p class="t-sub">쇼핑몰은 물건 하나를 담아 한 번에 결제하지만, 인테리어 공사는 실측 뒤 금액이 바뀌고
    여러 날 여러 공정으로 갈라지며, 도중에 추가공사가 붙고, 돈은 계약금·중도금·잔금으로 쪼개져 나갑니다.
    끝나도 끝이 아니라 준공 검수와 하자보수가 남습니다. 카페24 앱 「면적계산기 & 맞춤견적」은 곱셈까지만 하고
    공정도 결제도 없습니다. 그래서 이 다섯 화면을 특히 두껍게 만들었습니다.</p>
    <div class="row wrap-row mt4" style="gap:8px">
      <a class="btn btn-ghost btn-sm" href="pages/PR-01.html">공정표(간트)</a>
      <a class="btn btn-ghost btn-sm" href="pages/PR-03.html">현장 사진 일지</a>
      <a class="btn btn-ghost btn-sm" href="pages/PR-04.html">추가공사 변경 견적 승인</a>
      <a class="btn btn-ghost btn-sm" href="pages/PR-05.html">준공 검수 체크리스트</a>
      <a class="btn btn-ghost btn-sm" href="pages/AS-01.html">하자보수 접수</a>
    </div>
  </div>

  <div class="box mb8" style="border-left:4px solid var(--primary)">
    <h3 class="t-card mb4">화면이 만들어졌습니다 — 목록에서 확인해 보세요</h3>
    <p class="t-sub">한 사이트를 만들기 위해서는 복잡한 흐름과 기능들이 있어요.
    스펙에서 작성되는 지시문은 3,000줄 ~ 5,000줄 이상입니다.
    AI가 스펙을 읽고 화면으로 옮기는 사이에 어긋남이 발생할 수 있어요.</p>
    <p class="t-sub mt4">그래서 <b>'내 서비스 내가 확인할 수 있도록'</b> 화면목록을 작성하고 검수 시나리오를 준비했습니다.</p>
    <p class="t-sub mt4">아래 목록에서 화면을 하나씩 열어 잘 구성됐는지 확인하고,
    배포 전에는 검수 시나리오대로 테스트해 보세요.</p>
  </div>

  ${spec.menus.map((m) => `<section class="idx-menu">
    <h3><span class="code">${m.code}</span>${m.nameKo} <span class="muted" style="font-size:14px;font-weight:400">${m.nameEn} · ${m.screens.length}개</span></h3>
    <div class="idx-list">
      ${m.screens.map((sc) => `<a href="pages/${sc.pageId}.html">
        <span class="pid">${sc.pageId}</span><span>${sc.pageName}</span></a>`).join('')}
    </div></section>`).join('')}

  <div class="box mt8">
    <h3 class="t-card mb2">이 사이트에 대해</h3>
    <p class="t-sub">스펙팩(07_AI빌드_스펙팩.json)의 화면 정의에 디자인 프리셋 두 벌(가이드 01 ${preset.preset.name} · 레이아웃 A ${layout.layout.name})을 함께 넣어 만든 정적 프로토타입입니다.
    화면마다 스펙팩에 적힌 화면 프롬프트를 그대로 따라 만들었습니다. 탭·상태·예외까지 펼친 3뎁스는 프리미엄 등급에 들어 있습니다.
    사진 자리는 실제 사진 대신 <b>무엇이 들어갈 자리인지와 권장 크기</b>를 적은 옅은 블록으로 두었고, 적어 둔 비율을 그대로 지킵니다.
    각 화면 우하단의 <b>화면 정보</b> 버튼을 누르면 pageId · 화면명 · 기능정의와 연결 화면을 볼 수 있습니다.</p>
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
