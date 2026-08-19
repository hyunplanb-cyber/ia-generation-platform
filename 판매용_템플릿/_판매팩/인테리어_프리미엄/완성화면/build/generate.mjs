/* 07_AI빌드_스펙팩.json 의 3뎁스 화면(프리미엄, 198개)을 정적 HTML 로 생성한다.
   실행: node build/generate.mjs  (완성화면/ 을 사이트 루트로 두고 돌린다)

   부모 39화면은 메뉴별 pages-*.mjs 에 손으로(스펙팩 funcDef 기준) 만들어 두었다.
   잎사귀 159화면 중 PR·AS(이 팩의 알맹이)는 pages-pr-sub.mjs·pages-as-sub.mjs 에
   손으로 만들었고, 나머지는 스펙팩의 funcDef·acts·buttons 를 그대로 살려
   U.leafBody() 로 화면을 만든다 — 상위 화면의 뼈대·색·톤은 shell() 이 그대로 유지한다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as U from './ui.mjs';
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
import { PAGES as PRSUB } from './pages-pr-sub.mjs';
import { PAGES as ASSUB } from './pages-as-sub.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPEC = process.env.SPEC_PATH || path.resolve(ROOT, '스펙팩/07_AI빌드_스펙팩.json');
const PRESET = path.resolve(ROOT, '스펙팩/가이드_03_레트로페이퍼.json');
const OUT = path.resolve(ROOT, 'pages');

/* 부모 화면 빌더 — 함수 이름이 곧 pageId(HO0101 식) */
const PARENT_BUILDERS = {};
for (const src of [HO, CS, ES, VS, CT, PR, AS, OW, AU]) {
  for (const [k, v] of Object.entries(src)) PARENT_BUILDERS[k] = v;
}
/* 손으로 만든 잎사귀(PR·AS) */
const HAND_LEAF_BUILDERS = { ...PRSUB, ...ASSUB };

/* 어느 화면이 사장님(OW) 쪽인지 — sidebar 를 가른다 */
const isOwner = (pageId) => pageId.startsWith('OW');
/* 어느 화면이 단독(계정) 화면인지 — AU0101·AU0201·AU0301 만 */
const SOLO_IDS = new Set(['AU0101', 'AU0201', 'AU0301']);

const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
const preset = JSON.parse(fs.readFileSync(PRESET, 'utf8'));

fs.mkdirSync(OUT, { recursive: true });

const missing = [];
let written = 0, handMade = 0, autoMade = 0;

for (const s of spec.screens) {
  const ctx = {
    id: s.pageId, pageName: s.pageName, funcDef: s.funcDef, menu: s.menu,
    buttons: s.buttons || [], backTo: s.backTo || null, acts: s.acts || [],
  };
  const isParent = /01$/.test(s.pageId);
  const owner = isOwner(s.pageId);
  const solo = SOLO_IDS.has(s.pageId);

  let html;
  if (isParent) {
    const fn = PARENT_BUILDERS[s.pageId];
    if (typeof fn !== 'function') { missing.push(s.pageId); continue; }
    const { body, o } = fn(ctx);
    html = solo ? U.solo(ctx, body, { ...o, owner }) : U.shell(ctx, body, { ...o, owner });
    written++;
  } else if (HAND_LEAF_BUILDERS[s.pageId]) {
    /* 손으로 만든 잎사귀는 U.pageHd() 로 이미 제 이름을 큰 제목으로 보여 준다 —
       상태 띠(state-bar)까지 더하면 같은 말이 두 번 찍힌다. 여기서는 안 붙인다. */
    const { body, o } = HAND_LEAF_BUILDERS[s.pageId](ctx);
    html = solo ? U.solo(ctx, body, { ...o, owner }) : U.shell(ctx, body, { ...o, owner });
    written++; handMade++;
  } else {
    /* 자동 — 스펙팩 funcDef·acts·buttons 를 그대로 살린다(지어내지 않는다) */
    const body = U.leafBody(ctx);
    html = solo ? U.solo(ctx, body, { owner, state: s.pageName.split('>').pop().trim() })
      : U.shell(ctx, body, { owner, state: s.pageName.split('>').pop().trim() });
    written++; autoMade++;
  }
  fs.writeFileSync(path.join(OUT, `${s.pageId}.html`), html, 'utf8');
}

/* ---------- 전체 화면 목록 (index.html) ---------- */
const total = spec.screens.length;
const swatch = Object.entries(preset.colors).map(([k, v]) => [k.replace(/ \(.*\)$/, ''), v]);

const indexHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>전체 화면 목록 · ${SITE.name}</title>
<link rel="stylesheet" href="assets/css/base.css">
</head>
<body>
<header class="gnb" style="background:var(--surface);border-bottom:1px solid var(--border);padding:16px 0"><div class="wrap row-b">
  <a class="logo" href="index.html" style="font-weight:800;font-size:17px"><span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:var(--primary);color:var(--on-primary);margin-right:8px">${SITE.mark}</span>${SITE.name}</a>
  <nav class="row" style="gap:16px"><a href="pages/HO0101.html">손님 홈</a><a href="pages/OW0101.html">사장님 화면</a></nav>
</div></header>

<section class="idx-hero"><div class="wrap">
  <h1 class="t-page">인테리어 시공 견적·시공관리 — 프리미엄(3뎁스) 전체 화면</h1>
  <p class="mt3 t-sub" style="max-width:860px">${spec.project.concept}</p>
  <div class="row mt8 wrap-row" style="gap:40px">
    <div><div class="t-sec">${total}개</div><div class="t-sub">전체 화면</div></div>
    <div><div class="t-sec">3뎁스</div><div class="t-sub">설계 깊이</div></div>
    <div><div class="t-sec">${spec.menus.length}개</div><div class="t-sub">메뉴 그룹</div></div>
  </div>
</div></section>

<main class="main"><div class="wrap">
  <div class="card mb8"><div class="card-bd">
    <h2 class="t-card mb3">디자인 프리셋 — 가이드 03 레트로 페이퍼 × 레이아웃 B 대시보드형</h2>
    <div class="row wrap-row" style="gap:8px">
      ${swatch.map(([n, c]) => `<div style="width:116px"><div style="height:48px;border-radius:10px;border:1px solid var(--border);background:${c}"></div>
        <div class="t-sub mt1" style="font-size:12px">${n}<br>${c}</div></div>`).join('')}
    </div>
    <p class="t-sub mt4">${preset.typography.fontFamily} (폴백 ${preset.typography.fallback}) · 카드 ${preset.radius.card} / 버튼·입력 ${preset.radius.button} / 배지 ${preset.radius.badge}</p>
    <p class="t-sub mt2">레이아웃 B — 좌측 세로 사이드바 + 상단 바. 손님이 쓰는 메뉴와 사장님(현장 관리)이 쓰는
    메뉴는 사이드바를 나누었고, 오갈 때는 사이드바 맨 아래 진입점 하나로만 이동합니다.
    지표 카드는 좌측에 색 띠 한 줄을 두는 「사진 없는 카드」 모양입니다.</p>
    <p class="t-sub mt2">간격은 밀도(넉넉하게)에서 뽑은 눈금 9개를 CSS 값으로 박아 두었습니다 — 화면마다 눈대중으로 정하지 않습니다.</p>
  </div></div>

  <div class="box mb8" style="border-left:4px solid var(--primary)">
    <h3 class="t-card mb3">화면이 만들어졌습니다 — 목록에서 확인해 보세요</h3>
    <p class="t-sub">한 사이트를 만들기 위해서는 복잡한 흐름과 기능들이 있어요.
    스펙에서 작성되는 지시문은 3,000줄 ~ 5,000줄 이상입니다.
    AI가 스펙을 읽고 화면으로 옮기는 사이에 어긋남이 발생할 수 있어요.</p>
    <p class="t-sub mt3">그래서 <b>'내 서비스 내가 확인할 수 있도록'</b> 화면목록을 작성하고 검수 시나리오를 준비했습니다.</p>
    <p class="t-sub mt3">아래 목록에서 화면을 하나씩 열어 잘 구성됐는지 확인하고,
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
    <p class="t-sub">스펙팩(07_AI빌드_스펙팩.json)의 화면 정의에 디자인 프리셋 두 벌(가이드 03 레트로 페이퍼 · 레이아웃 B 대시보드형)을 함께 넣어 만든 정적 프로토타입입니다.
    부모 화면 39장은 스펙팩 funcDef 그대로, 잎사귀 159장 중 공사 진행(PR)·하자보수(AS)는 손으로,
    나머지는 스펙팩의 상태 설명을 그대로 살려 만들었습니다.
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

console.log(`생성 완료 — 화면 ${written}/${total}개 (부모 39 · 손잡이 ${handMade} · 자동 ${autoMade}), index.html 1개`);
if (missing.length) console.log('빌더 없음:', missing.join(', '));
