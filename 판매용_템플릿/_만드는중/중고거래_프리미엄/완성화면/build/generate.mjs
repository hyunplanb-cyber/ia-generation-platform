/* 07_AI빌드_스펙팩.json 의 3뎁스 화면(프리미엄 · 201화면)을 정적 HTML 로 생성한다.
   실행: node build/generate.mjs  (완성화면/ 폴더에서, 또는 어디서든 — 경로는 __dirname 기준)

   ⚠ pageId 는 스펙팩이 정한 것을 «그대로» 쓴다. 화면 안 짧은 이름(ho1)과
     파일 이름(HO-01)은 다른 글자다. 링크는 반드시 ui.mjs 의 link()/toPageId() 로만 적는다.
     안 이으면 끊어진 링크가 100개 단위로 생긴다(실제로 220개 난 적이 있다). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as UI from './ui.mjs';
import { SITE } from './data.mjs';
import { PAGES as HO } from './pages-ho.mjs';
import { PAGES as SE } from './pages-se.mjs';
import { PAGES as SL } from './pages-sl.mjs';
import { PAGES as BS } from './pages-bs.mjs';
import { PAGES as CH } from './pages-ch.mjs';
import { PAGES as PA } from './pages-pa.mjs';
import { PAGES as MY } from './pages-my.mjs';
import { PAGES as AD } from './pages-ad.mjs';
import { PAGES as CS } from './pages-cs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(ROOT, 'pages');

/* 스펙팩·프리셋은 «만드는중» 폴더에 있다가, 나중에 포장 스크립트가 스펙팩/ 아래로 옮긴다.
   두 자리를 모두 찾아 본다 — 옮겨진 뒤에도 이 스크립트가 그대로 돌아야 한다. */
function 찾기(이름, 후보) {
  for (const c of 후보) if (c && fs.existsSync(c)) return c;
  throw new Error(`${이름} 을 못 찾았습니다. 찾아본 자리:\n  ${후보.join('\n  ')}`);
}
const SPEC = 찾기('스펙팩', [
  process.env.SPEC_PATH,
  path.resolve(ROOT, '스펙팩/07_AI빌드_스펙팩.json'),
  path.resolve(ROOT, '../07_AI빌드_스펙팩.json'),
]);
/* ⚠ 프리미엄은 디럭스와 «일부러» 다른 프리셋을 쓴다 —
   디럭스는 코럴 선셋 + 목록 중심형, 프리미엄(이 팩)은 레트로 페이퍼 + 대시보드형이다. */
const PRESET = 찾기('가이드 프리셋', [
  path.resolve(ROOT, '스펙팩/가이드_03_레트로페이퍼.json'),
  path.resolve(ROOT, '../디자인프리셋/가이드_03_레트로페이퍼.json'),
]);
const LAYOUT = 찾기('레이아웃 프리셋', [
  path.resolve(ROOT, '스펙팩/레이아웃_B_대시보드형.json'),
  path.resolve(ROOT, '../디자인프리셋/레이아웃_B_대시보드형.json'),
]);

const BUILDERS = { ...HO, ...SE, ...SL, ...BS, ...CH, ...PA, ...MY, ...AD, ...CS };

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
  // backTo 는 스펙팩이 화면마다 정해 준 뒤로가기 목적지다(메뉴 첫 화면은 null).
  const ctx = {
    id: s.pageId, pageName: s.pageName, funcDef: s.funcDef, menu: s.menu,
    buttons: s.buttons || [], backTo: s.backTo || null,
  };
  const { body, o } = fn(ctx);
  fs.writeFileSync(path.join(OUT, `${s.pageId}.html`), UI.shell(ctx, body, o || {}), 'utf8');
  written++;
}

/* ---------- 만들어 놓고 스스로 검사한다 ----------
   ⚠ 「끊어진 링크」와 「아무도 안 가리키는 외톨이 쪽」은 사람이 눈으로 못 센다. */
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
const swatch = Object.entries(preset.colors).map(([k, v]) => [k.replace(/ \(.*\)$/, ''), v]);
const firstOf = (code) => spec.screens.find((s) => s.pageId.startsWith(code + '-'))?.pageId;
const 손님홈 = firstOf('HO') ?? spec.screens[0].pageId;
const 운영자홈 = firstOf('AD') ?? 손님홈;

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
  <nav class="gnb-nav"><a href="pages/${손님홈}.html">손님 홈</a><a href="pages/${운영자홈}.html">운영자 화면</a></nav>
</div></header>

<section class="idx-hero"><div class="wrap">
  <h1 class="t-page">회원끼리 사고파는 중고거래 장터 — 전체 화면</h1>
  <p class="mt3" style="max-width:900px">${UI.esc(spec.project.concept)}</p>
  <div class="row mt8 wrap-row" style="gap:40px">
    <div><div class="t-sec">${total}개</div><div class="t-sub">전체 화면</div></div>
    <div><div class="t-sec">2뎁스</div><div class="t-sub">설계 깊이</div></div>
    <div><div class="t-sec">${spec.menus.length}개</div><div class="t-sub">메뉴 그룹</div></div>
  </div>
</div></section>

<main class="main"><div class="wrap">
  <div class="card mb8"><div class="card-bd">
    <h2 class="t-card mb3">디자인 프리셋 — 가이드 ${preset.preset.no} ${preset.preset.name} × 레이아웃 ${layout.layout.no} ${layout.layout.name}</h2>
    <div class="row wrap-row" style="gap:8px">
      ${swatch.map(([n, c]) => `<div style="width:116px"><div style="height:48px;border-radius:var(--r-btn);border:1px solid var(--border);background:${c}"></div>
        <div class="t-sub mt1" style="font-size:12px">${n}<br>${c}</div></div>`).join('')}
    </div>
    <p class="t-sub mt4">${preset.typography.fontFamily} (폴백 ${preset.typography.fallback}) · 카드 ${preset.radius.card} / 버튼·입력 ${preset.radius.button} / 배지 ${preset.radius.badge}</p>
    <p class="t-sub mt2">레이아웃 ${layout.layout.no} ${layout.layout.name} — ${layout.layout.tagline}</p>
    <ul class="t-sub mt2" style="padding-left:18px">
      ${Object.entries(layout.slots).map(([자리, 말]) => `<li><b>${자리}</b> — ${말}</li>`).join('')}
    </ul>
    <p class="t-sub mt2">카드 모양은 <b>${layout.card.name}</b> — ${layout.card.shape}</p>
    <p class="t-sub mt2">간격은 밀도(넉넉하게)에서 뽑은 눈금을 CSS 변수로 박아 두었습니다 — 화면마다 눈대중으로 정하지 않습니다.</p>
  </div></div>

  <div class="box mb8" style="border-left:4px solid var(--primary)">
    <h3 class="t-card mb3">이 팩의 알맹이는 «회원이 스스로 물건을 올린다»는 것입니다</h3>
    <p class="t-sub">카페24·아임웹은 「사장님 한 명이 파는 쇼핑몰」이라, 상품을 올릴 수 있는 사람이 관리자 하나뿐입니다.
    회원이 스스로 물건을 올리는 순간 그 도구는 통째로 못 씁니다. 그리고 회원이 물건을 올리면
    거래가 «대화»로 이뤄지고(값 흥정·약속 잡기), 돈을 잠깐 맡아 두는 안전결제가 필요해지고,
    사는 쪽과 파는 쪽이 «서로» 후기를 남기고, 사기·금지품목 신고를 처리할 운영자 화면이 따라옵니다.
    그래서 아래 여섯 화면을 특히 두껍게 만들었습니다.</p>
    <div class="row wrap-row mt4" style="gap:8px">
      <a class="btn btn-ghost btn-sm" href="pages/SL-01.html">판매글 작성 (회원이 올린다)</a>
      <a class="btn btn-ghost btn-sm" href="pages/SE-02.html">매물 목록 (동네·거리순)</a>
      <a class="btn btn-ghost btn-sm" href="pages/CH-02.html">채팅방 (값 흥정·약속)</a>
      <a class="btn btn-ghost btn-sm" href="pages/PA-05.html">거래 진행 상태 (안전결제)</a>
      <a class="btn btn-ghost btn-sm" href="pages/MY-04.html">거래 후기 (양쪽이 쓴다)</a>
      <a class="btn btn-ghost btn-sm" href="pages/AD-01.html">신고 처리 대기열 (운영자)</a>
    </div>
  </div>

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
    <p class="t-sub">스펙팩(07_AI빌드_스펙팩.json)의 화면 정의에 디자인 프리셋 두 벌(가이드 ${preset.preset.no} ${preset.preset.name} · 레이아웃 ${layout.layout.no} ${layout.layout.name})을 함께 넣어 만든 정적 프로토타입입니다.
    화면마다 스펙팩에 적힌 화면 프롬프트를 그대로 따라 만들었습니다. 탭·상태·예외까지 펼친 3뎁스 201화면은 프리미엄 등급에 들어 있습니다.
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
if (missing.length) console.log(`생성 완료 — 화면 ${written}/${total}개, index.html 1개`);
if (missing.length) console.log('⛔ 빌더 없음:', missing.join(', '));
if (끊김.length) console.log('⛔ 끊어진 링크:', 끊김.join(', '));
if (외톨이.length) console.log('⛔ 아무도 안 가리키는 쪽:', 외톨이.join(', '));
if (!missing.length && !끊김.length && !외톨이.length) console.log('✓ 끊어진 링크 0 · 외톨이 쪽 0');

/* ⛔ 굽는 차례는 «굽기 → 사진 끼우기»다. 거꾸로 하면 사진이 날아간다 (2026-09-11).
     이 생성기는 pages/*.html 을 통째로 다시 쓴다. `이미지-끼우기.mts` 가 넣어 둔 <img> 는
     그 안에 없으므로, 다시 구울 때마다 794자리가 «조용히» 지워진다.
     글로만 적어 두면 또 밟는다 — 그래서 세어서 알려 준다. */
const 예시방 = path.resolve(ROOT, 'assets/예시');
if (fs.existsSync(예시방) && fs.readdirSync(예시방).length) {
  const 든장 = fs.readdirSync(OUT).filter((f) => f.endsWith('.html'))
    .filter((f) => fs.readFileSync(path.join(OUT, f), 'utf8').includes('assets/예시/')).length;
  if (!든장) {
    const 팩이름 = path.basename(path.resolve(ROOT, '..'));
    console.log('');
    console.log('⛔ 예시 사진이 ' + fs.readdirSync(예시방).length + '장 있는데 화면에는 한 장도 안 들어 있습니다.');
    console.log('   다시 구우면서 지워진 것입니다. 이어서 돌리세요:');
    console.log('     npx tsx 이미지-끼우기.mts ' + 팩이름);
  }
}
