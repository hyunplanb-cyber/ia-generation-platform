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
import HOTCSUB from './pages-ho-tc-sub.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SPEC = process.env.SPEC_PATH || path.resolve(ROOT, '스펙팩/07_AI빌드_스펙팩.json');
const OUT = path.resolve(ROOT, 'pages');

/* 2뎁스 빌더는 'HO-01' 로 적혀 있고 3뎁스 스펙팩은 'HO0101' 로 부른다.
   같은 화면이라 이름만 맞춰 준다 — 프리미엄 팩이 쓰는 방식과 같다.
   'HO-01' → 'HO' + '01' + '01' : 두 번째 01 은 「그 화면의 기본 상태」다. */
const short2spec = (k) => (/^[A-Z]{2}-\d{2}$/.test(k) ? `${k.slice(0, 2)}${k.slice(3)}01` : k);

const BUILDERS = {};
for (const src of [HOTC, CO, CL, CU, STGR, MYAU, HOTCSUB]) {
  for (const [k, v] of Object.entries(src)) BUILDERS[short2spec(k)] = v;
}
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

/* 색과 프리셋 이름은 «스펙팩 폴더의 JSON에서 읽는다».
   여기에 손으로 적어 두었더니 프리셋을 코럴 선셋에서 모던 네이비로 바꿨는데도
   화면 목록만 옛 색을 계속 보여 줬다(2026-08-09). 파는 문서와 화면이 갈리는 자리다. */
const PRESET = JSON.parse(fs.readFileSync(path.resolve(ROOT, '스펙팩/가이드_01_모던네이비.json'), 'utf8'));
const LAYOUT = JSON.parse(fs.readFileSync(path.resolve(ROOT, '스펙팩/레이아웃_B_에디토리얼형.json'), 'utf8'));
const COLORS = Object.entries(PRESET.colors).map(([k, v]) => [k.replace(/ \(.*\)$/, ''), v]);

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
  <div class="row-c" style="gap:10px"><span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:12px;background:var(--primary);color:var(--on-pri);font-size:18px;font-weight:800">${SITE.mark}</span>
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
    <h2 class="t-card mb4">디자인 프리셋 — 가이드 ${PRESET.preset.no} ${PRESET.preset.name} · 레이아웃 ${LAYOUT.layout.no} ${LAYOUT.layout.name}</h2>
    <div class="sw">${COLORS.map(([n, c]) => `<div><div class="c" style="background:${c}"></div>
      <div class="t-sub mt1">${n}<br>${c}</div></div>`).join('')}</div>
    <p class="t-sub mt6">Paperlogy · 카드 16px / 버튼·입력 12px / 배지 알약 · 카드 안쪽 24px · 카드 사이 가로 20px · 줄 사이 세로 28px ·
      그림자는 카드에만</p>
    <p class="t-sub mt2">레이아웃 ${LAYOUT.layout.no} — ${U.esc(LAYOUT.layout.tagline)}
      ${Object.entries(LAYOUT.slots).map(([k, v]) => `<br><b>${k}</b> · ${U.esc(v)}`).join('')}</p>
    <p class="t-sub mt2">같은 스펙팩이라도 프리셋을 갈아 끼우면 화면이 이렇게 달라집니다 —
      디럭스는 <b>코럴 선셋 + 대시보드형</b>, 이 프리미엄은 <b>${PRESET.preset.name} + ${LAYOUT.layout.name}</b>입니다.</p>
  </div></div>

  ${spec.menus.map((m) => `<section class="idx-menu">
    <h3><span class="code">${m.code}</span>${m.nameKo}
      <span class="muted" style="font-size:14px;font-weight:500">${m.nameEn} · ${m.screens.length}개</span></h3>
    <div class="idx-list">
      ${m.screens.map((sc) => `<a href="pages/${sc.pageId}.html">
        <span class="pid">${sc.pageId}</span><span>${U.esc(sc.pageName)}</span></a>`).join('')}
    </div></section>`).join('')}

  <div class="card"><div class="card-bd">
    <h3 class="t-card mb3">이 화면들에 대해</h3>
    <p class="t-sub">스펙팩(07_AI빌드_스펙팩.json)의 화면 정의와 디자인 프리셋(가이드_01_모던네이비 · 레이아웃_B_에디토리얼형)을 그대로 반영해 만든
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
