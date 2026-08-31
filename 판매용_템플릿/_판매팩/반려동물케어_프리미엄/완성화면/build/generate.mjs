/* 07_AI빌드_스펙팩.json 의 3뎁스 화면(프리미엄 · 172화면)을 정적 HTML 로 생성한다.
   실행: node build/generate.mjs  (완성화면/ 폴더에서, 또는 어디서든 — 경로는 __dirname 기준)

   ⚠ pageId 는 스펙팩이 정한 것을 «그대로» 쓴다. 프리미엄은 네 자리(HO0101)다.
     디럭스에서 옮겨 온 조각은 아직 두 자리 짧은 이름(HO-01)으로 링크를 적으므로
     ui.mjs 의 toPageId() 가 이어 준다. 링크는 반드시 link()/toPageId() 로만 적는다.

   ⚠ 부모 41화면은 디럭스의 빌더를 그대로 쓴다(BUILDERS 에 HO-01 로 들어 있다).
     잎사귀 131화면은 pages-*-sub.mjs 가 네 자리 이름으로 직접 등록한다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as UI from './ui.mjs';
import { SITE } from './data.mjs';
import { PAGES as HO } from './pages-ho.mjs';
import { PAGES as PL } from './pages-pl.mjs';
import { PAGES as RE } from './pages-re.mjs';
import { PAGES as MY } from './pages-my.mjs';
import { PAGES as AT } from './pages-at.mjs';
import { PAGES as NW } from './pages-nw.mjs';
import { PAGES as HL } from './pages-hl.mjs';
import { PAGES as MG } from './pages-mg.mjs';
import { PAGES as CS } from './pages-cs.mjs';
import { PAGES as HOS } from './pages-ho-sub.mjs';
import { PAGES as PLS } from './pages-pl-sub.mjs';
import { PAGES as RES } from './pages-re-sub.mjs';
import { PAGES as MYS } from './pages-my-sub.mjs';
import { PAGES as ATS } from './pages-at-sub.mjs';
import { PAGES as NWS } from './pages-nw-sub.mjs';
import { PAGES as HLS } from './pages-hl-sub.mjs';
import { PAGES as MGS } from './pages-mg-sub.mjs';
import { PAGES as CSS } from './pages-cs-sub.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(ROOT, 'pages');

/* 스펙팩·프리셋은 «만드는중» 폴더에 있다가, 나중에 포장 스크립트가 스펙팩/ 아래로 옮긴다.
   두 자리를 모두 찾아 본다 — 옮겨진 뒤에도 이 스크립트가 그대로 돌아야 한다. */
function 찾기(이름, 후보) {
  for (const p of 후보) if (p && fs.existsSync(p)) return p;
  throw new Error(`${이름} 을 못 찾았습니다. 찾아본 자리:\n  ${후보.join('\n  ')}`);
}
const SPEC = 찾기('스펙팩', [
  process.env.SPEC_PATH,
  path.resolve(ROOT, '스펙팩/07_AI빌드_스펙팩.json'),
  path.resolve(ROOT, '../07_AI빌드_스펙팩.json'),
]);
const PRESET = 찾기('가이드 프리셋', [
  path.resolve(ROOT, '스펙팩/가이드_03_모던네이비.json'),
  path.resolve(ROOT, '../디자인프리셋/가이드_03_모던네이비.json'),
]);
const LAYOUT = 찾기('레이아웃 프리셋', [
  path.resolve(ROOT, '스펙팩/레이아웃_B_대시보드형.json'),
  path.resolve(ROOT, '../디자인프리셋/레이아웃_B_대시보드형.json'),
]);

const BUILDERS = {
  ...HO, ...PL, ...RE, ...MY, ...AT, ...NW, ...HL, ...MG, ...CS,
  ...HOS, ...PLS, ...RES, ...MYS, ...ATS, ...NWS, ...HLS, ...MGS, ...CSS,
};

const spec = JSON.parse(fs.readFileSync(SPEC, 'utf8'));
const preset = JSON.parse(fs.readFileSync(PRESET, 'utf8'));
const layout = JSON.parse(fs.readFileSync(LAYOUT, 'utf8'));

fs.mkdirSync(OUT, { recursive: true });

/* 만들기 전에 «이 사이트에 어떤 화면이 있는지»를 UI 에 알려 준다 — 링크를 옮길 때 쓴다 */
UI.setPages(spec.screens.map((s) => s.pageId));
/* 사이드바 항목 옆 숫자 — 스펙팩이 세어 준 값을 그대로 넘긴다. 손으로 두 번 적지 않는다. */
UI.setMenuCounts(Object.fromEntries(spec.menus.map((m) => [`${m.code}-01`, m.screens.length])));
/* 부모 → 잎사귀 지도. 이름은 「부모 > 갈래」이므로 뒤 조각만 떼어 단추 글자로 쓴다. */
{
  const 지도 = {};
  for (const s of spec.screens) {
    const m = /^([A-Z]{2}\d{2})(\d{2})$/.exec(s.pageId);
    if (!m || m[2] === '01') continue;
    const 부모 = `${m[1]}01`;
    (지도[부모] ||= []).push({ id: s.pageId, nm: String(s.pageName).split('>').pop().trim() });
  }
  UI.setLeaves(지도);
}

/** 네 자리 이름(HO0101) → 디럭스의 두 자리 이름(HO-01). 부모 41장만 해당한다. */
const 짧게 = (id) => {
  const m = /^([A-Z]{2})(\d{2})01$/.exec(id);
  return m ? `${m[1]}-${m[2]}` : null;
};

const missing = [];
let written = 0;

for (const s of spec.screens) {
  const 짧은 = 짧게(s.pageId);
  const fn = BUILDERS[s.pageId] || (짧은 ? BUILDERS[짧은] : null);
  if (typeof fn !== 'function') { missing.push(s.pageId); continue; }
  const ctx = {
    id: s.pageId, pageName: s.pageName, funcDef: s.funcDef, menu: s.menu,
    buttons: s.buttons || [], backTo: s.backTo || null,
    acts: s['화면안동작'] || [],
  };
  const { body, o } = fn(ctx);
  fs.writeFileSync(path.join(OUT, `${s.pageId}.html`), UI.shell(ctx, body, o || {}), 'utf8');
  written++;
}

/* ---------- 만들어 놓고 스스로 검사한다 ----------
   ⚠ 「끊어진 링크」와 「아무도 안 가리키는 외톨이 쪽」은 사람이 눈으로 못 센다.
     여기서 세지 않으면 다른 검사기가 나중에 잡거나, 손님이 먼저 본다. */
const 있는쪽 = new Set(spec.screens.map((s) => s.pageId));
const 끊김 = [];
const 가리킨곳 = new Set();
for (const id of 있는쪽) {
  const f = path.join(OUT, `${id}.html`);
  if (!fs.existsSync(f)) continue;
  const 글 = fs.readFileSync(f, 'utf8');
  for (const m of 글.matchAll(/href="([^"]+)"/g)) {
    const h = m[1];
    /* 화면끼리의 링크만 센다 — 스타일시트·바깥 주소·화면 목록은 대상이 아니다 */
    if (/^(\.\.\/|https?:|mailto:|tel:|#)/.test(h)) continue;
    const 갈곳 = h.replace(/\.html$/, '');
    if (!있는쪽.has(갈곳)) 끊김.push(`${id} → ${h}`);
    else 가리킨곳.add(갈곳);
  }
}
const 외톨이 = [...있는쪽].filter((id) => !가리킨곳.has(id));

/* ---------- 전체 화면 목록 (index.html) ---------- */
const total = spec.screens.length;
const swatch = Object.entries(preset.colors).map(([k, v]) => [k.replace(/ ?\(.*\)$/, ''), v]);
const 알맹이 = [
  ['AT0202', '등원 체크 · 회차권 차감'],
  ['AT0402', '반 편성 보드 · 끌어다 옮기기'],
  ['MY0501', '알림장 상세'],
  ['HL0101', '백신 만료 대시보드'],
  ['RE0201', '정기 등원 요일'],
  ['MY0201', '회차권 현황'],
];

const indexHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>전체 화면 목록 · ${SITE.name}</title>
<meta name="description" content="${UI.esc(spec.project.concept).slice(0, 150)}">
<link rel="stylesheet" href="assets/css/base.css">
</head>
<body data-page="INDEX">
<header class="topbar">
  <a class="logo" href="index.html"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
  <div class="acts">
    <a class="btn btn-ghost btn-sm" href="pages/AT0101.html">등원 현황판</a>
    <a class="btn btn-pri btn-sm" href="pages/HO0101.html">첫 화면 보기</a>
  </div>
</header>

<section class="idx-hero"><div class="wrap" style="padding-bottom:0">
  <h1 class="t-page">반려견 유치원 등원 예약·운영 — 전체 화면 (상세 IA)</h1>
  <p class="mt4" style="opacity:.94;max-width:900px">${UI.esc(spec.project.concept)}</p>
  <div class="row mt8 wrap-row" style="gap:var(--sp-sec)">
    <div><div class="t-sec">${total}개</div><div class="t-sub">전체 화면</div></div>
    <div><div class="t-sec">3뎁스</div><div class="t-sub">설계 깊이</div></div>
    <div><div class="t-sec">${spec.menus.length}개</div><div class="t-sub">메뉴 그룹</div></div>
  </div>
</div></section>

<main class="main"><div class="wrap">
  <div class="card mb8"><div class="card-bd">
    <h2 class="t-card mb4">디자인 프리셋 — 가이드 03 ${preset.preset.name} × 레이아웃 B ${layout.layout.name}</h2>
    <div class="row wrap-row" style="gap:var(--sp-btn)">
      ${swatch.map(([n, c]) => `<div style="width:120px"><div style="height:48px;border-radius:var(--r-btn);border:1px solid var(--border);background:${c}"></div>
        <div class="t-sub mt1" style="font-size:12px">${n}<br>${c}</div></div>`).join('')}
    </div>
    <p class="t-sub mt4">${preset.typography.fontFamily} (폴백 ${preset.typography.fallback}) · 카드 ${preset.radius.card} / 버튼·입력 ${preset.radius.button} / 배지 ${preset.radius.badge}</p>
    <p class="t-sub mt2">레이아웃 B ${layout.layout.name} — ${layout.slots.hero} ${layout.slots.list} ${layout.slots.nav} ${layout.slots.detail}</p>
    <p class="t-sub mt2">같은 설계를 디럭스는 「코럴 선셋 × 여백 중심형」으로, 프리미엄은 이 「모던 네이비 × 대시보드형」으로 지었습니다. 두 얼굴을 나란히 견줘 보세요.</p>
  </div></div>

  <div class="box mb8" style="border-left:4px solid var(--primary)">
    <h3 class="t-card mb4">이 팩의 알맹이는 «맡기는 동안 벌어지는 일»입니다</h3>
    <p class="t-sub">쇼핑몰은 물건을 담아 한 번에 결제하면 끝나지만, 반려견 유치원은 결제한 뒤부터가 본론입니다.
    아침에 등원 체크를 하면 그 한 번이 회차권을 깎고, 백신이 만료된 아이는 체크 자체가 잠깁니다.
    몸무게와 성향으로 반을 나누고, 하루가 끝나면 사진과 하루 일과를 알림장으로 보냅니다.
    카페24 예약 앱은 «날짜를 잡는 것»까지만 하고 이 뒤를 못 합니다. 그래서 아래 여섯 화면을 특히 두껍게 만들었습니다.</p>
    <div class="row wrap-row mt4" style="gap:var(--sp-btn)">
      ${알맹이.map(([id, nm]) => `<a class="btn btn-ghost btn-sm" href="pages/${id}.html">${nm}</a>`).join('')}
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
    <p class="t-sub">스펙팩(07_AI빌드_스펙팩.json)의 화면 정의에 디자인 프리셋 두 벌(가이드 03 ${preset.preset.name} · 레이아웃 B ${layout.layout.name})을 함께 넣어 만든 정적 프로토타입입니다.
    화면마다 스펙팩에 적힌 화면 프롬프트를 그대로 따라 만들었습니다. 탭·상태·예외까지 3뎁스로 펼친 판이라 화면이 ${total}장입니다.
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

fs.writeFileSync(path.resolve(ROOT, 'index.html'), indexHtml, 'utf8');

console.log(`생성 완료 — 화면 ${written}/${total}개, index.html 1개`);
if (missing.length) console.log(`⛔ 빌더 없음 (${missing.length}):`, missing.join(', '));
if (끊김.length) console.log(`⛔ 끊어진 링크 (${끊김.length}):`, 끊김.slice(0, 40).join(', '));
if (외톨이.length) console.log(`⛔ 아무도 안 가리키는 쪽 (${외톨이.length}):`, 외톨이.join(', '));
if (!missing.length && !끊김.length && !외톨이.length) console.log('✓ 끊어진 링크 0 · 외톨이 쪽 0');
