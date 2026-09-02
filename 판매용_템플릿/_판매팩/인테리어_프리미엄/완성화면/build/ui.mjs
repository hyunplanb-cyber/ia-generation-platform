/* 공통 부품 — 가이드_03 레트로페이퍼 + 레이아웃_B 대시보드형 규칙을 마크업으로 고정한다.
   손님이 쓰는 화면과 사장님(현장 관리)이 쓰는 화면은 같은 뼈대(shell)를 쓰되
   사이드바 항목만 NAV_CUSTOMER / NAV_OWNER 로 갈라 둔다. */
import { SITE, NAV_CUSTOMER, NAV_OWNER } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const nf = (n) => Number(n).toLocaleString('ko-KR');
export const won = (n) => nf(n) + '원';
export const link = (id) => `${id}.html`;

/* ---------- 이미지 자리 ----------
   테마 색으로 칠하지 않는다. 옅은 파스텔 한 톤 + 1px 테두리 + 무엇·권장 크기.
   ⚠ 이 함수가 반환하는 조각은 이미 완결된 .ph 다 — 호출부에서 다시 .ph 로 감싸지 않는다
   (레이아웃견본_발견기록.md 지뢰 1: 이중으로 감싸면 라벨 숨김 CSS가 무력화된다). */
const TONES = ['ph-t1', 'ph-t2', 'ph-t3', 'ph-t4', 'ph-t5'];
function tone(seed) {
  let h = 0; const s = String(seed);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return TONES[Math.abs(h) % TONES.length];
}
const SIZES = {
  'ph-43': '1200×900', 'ph-11': '800×800', 'ph-169': '1280×720',
  'ph-banner': '1600×600', 'ph-ava': '400×400', 'ph-ava-sm': '400×400',
  'ph-thumb': '1200×900', 'ph-thumb-sm': '1200×900', 'ph-a4': '2970×2100',
};
export function ph(what, cls = 'ph-43', seed = '') {
  const size = SIZES[cls] || '1200×900';
  const small = cls === 'ph-thumb' || cls === 'ph-thumb-sm' || cls === 'ph-ava' || cls === 'ph-ava-sm';
  const label = small ? size : `이미지 영역 (${esc(what)} · 권장 ${size})`;
  return `<div class="ph ${cls} ${tone(seed || what)}" role="img" aria-label="${esc(what)} 이미지 자리, 권장 ${size}"><span class="lb">${label}</span></div>`;
}

/* ---------- 작은 조각 ---------- */
export const stars = (r) => `<span class="stars" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
export const delta = (n, unit = '') => {
  const up = n > 0, flat = n === 0;
  return `<span class="delta ${flat ? 'flat' : up ? 'up' : 'dn'}">${flat ? '—' : up ? '▴' : '▾'} ${nf(Math.abs(n))}${unit}</span>`;
};

export const btn = (t, o = {}) => {
  const cls = `btn ${o.cls || 'btn-ghost'}${o.off ? ' is-off' : ''}`;
  /* 잠기는 버튼은 반드시 <button> 으로 만든다 — <a> 는 disabled 가 없어
     href 를 주면 잠금이 조용히 사라진다(레이아웃견본_발견기록.md 지뢰 6).
     그래서 o.off(잠김)나 o.unlockAll 이 있으면 href 가 있어도 button 으로 강제한다. */
  const forceBtn = o.off || o.unlockAll;
  const extraAttr = `${o.unlockAll ? ' data-unlock-all' : ''}${o.attr || ''}`;
  const attr = `${extraAttr}${o.off ? ' disabled' : ''}`;
  return (o.href && !forceBtn)
    ? `<a class="${cls}" href="${link(o.href)}"${extraAttr}>${t}</a>`
    : `<button class="${cls}"${o.id ? ` id="${o.id}"` : ''} type="button"${attr}${o.href ? ` data-go="${link(o.href)}"` : ''}>${t}</button>`;
};
export const btnSay = (t, msg, o = {}) => btn(t, { ...o, attr: ` data-toast="${esc(msg)}"${o.attr || ''}` });

export const chip = (t, o = {}) =>
  `<button class="chip${o.on ? ' on' : ''}${o.sm ? ' chip-sm' : ''}" type="button"${o.attr || ''}>${t}${o.x ? ' <span class="x">✕</span>' : ''}</button>`;
export const chips = (list, onIdx = -1, o = {}) => `<div class="chips">${list.map((t, i) =>
  chip(t, { on: Array.isArray(onIdx) ? onIdx.includes(i) : i === onIdx, attr: o.extra || '' })).join('')}</div>`;

export function tabs(items, onIdx = 0, o = {}) {
  const cls = o.pill ? 'tabs-pill' : 'tabs';
  const inner = items.map((t, i) => {
    const label = typeof t === 'string' ? t : t.label;
    const cnt = (typeof t === 'object' && t.cnt != null) ? `<span class="cnt">${t.cnt}</span>` : '';
    const a = [];
    if (typeof t === 'object') {
      if (t.go) a.push(`data-go="${link(t.go)}"`);
      if (t.pane) a.push(`data-pane="${t.pane}"`);
      /* 거르기 — app.js 의 거르기 장치가 이 표를 읽는다 (2026-09-02). */
      if (t.filter) a.push(`data-filter="${t.filter}"`);
      if (t.all) a.push('data-filter-all');
    }
    return `<button class="tab${i === onIdx ? ' on' : ''}" type="button" ${a.join(' ')}>${label}${cnt}</button>`;
  }).join('');
  return `<div class="${cls}">${inner}</div>`;
}
/* 탭 몸통 — 반드시 탭과 «같은 부모 상자» 안에 둔다(레이아웃견본_발견기록.md 지뢰 3).
   app.js 는 눌린 탭의 .tabs 를 찾아 그 부모 안에서만 [data-pane-body] 를 찾는다. */
export const pane = (key, body, show = false) => `<div data-pane-body="${key}"${show ? '' : ' hidden'}>${body}</div>`;
export const tabBox = (tabsHtml, panesHtml) => `<div>${tabsHtml}${panesHtml}</div>`;

export const sec = (title, body, o = {}) => `<section class="sec ${o.cls || ''}">
  ${title ? `<div class="sec-hd"><div><h2 class="t-sec">${title}</h2>${o.desc ? `<p class="t-sub mt1">${o.desc}</p>` : ''}</div>${o.more ? `<a class="more" href="${link(o.more)}">${o.moreLabel || '전체 보기'} ›</a>` : (o.aside || '')}</div>` : ''}
  ${body}</section>`;

export const card = (title, body, o = {}) => `<div class="card ${o.cls || ''}">
  ${(title || o.aside) ? `<div class="card-hd">${title ? `<h3 class="t-card">${title}</h3>` : '<span></span>'}${o.aside || ''}</div>` : ''}
  <div class="card-bd ${o.bdCls || ''}">${body}</div>
  ${o.ft ? `<div class="card-ft">${o.ft}</div>` : ''}</div>`;

export const banner = (kind, ico, html, o = {}) =>
  `<div class="banner banner-${kind} ${o.cls || ''}"${o.attr || ''}>${ico ? `<span class="ico">${ico}</span>` : ''}<div class="grow">${html}</div>${o.right || ''}</div>`;

export const empty = (ico, title, msg, btns = '') => `<div class="empty">
  <div class="ico">${ico}</div><h3 class="t-sec mt3">${title}</h3>
  ${msg ? `<p class="msg">${msg}</p>` : ''}${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;

export const result = (kind, ico, title, msg, btns = '') => `<div class="result">
  <div class="ico ico-${kind}">${ico}</div>
  <h1 class="t-page">${title}</h1>
  ${msg ? `<p class="t-sub mt3" style="font-size:15px">${msg}</p>` : ''}
  ${btns ? `<div class="btns mt7" style="justify-content:center">${btns}</div>` : ''}</div>`;

export function table(head, rows, o = {}) {
  const th = head.map((h) => {
    const t = typeof h === 'string' ? h : h.t;
    const w = (typeof h === 'object' && h.w) ? ` style="width:${h.w}"` : '';
    return `<th${w}>${t}</th>`;
  }).join('');
  const tr = rows.map((r) => {
    const cells = (r.cells || r).map((c) => (typeof c === 'object' && c !== null)
      ? `<td${c.cls ? ` class="${c.cls}"` : ''}>${c.t}</td>`
      : `<td>${c}</td>`).join('');
    return `<tr${r.attr || ''}${r.cls ? ` class="${r.cls}"` : ''}>${cells}</tr>`;
  }).join('');
  return `<div class="table-wrap ${o.scroll === false ? '' : 'table-scroll'}"><table class="table ${o.cls || ''}">
    <thead><tr>${th}</tr></thead><tbody>${tr}</tbody>${o.foot ? `<tfoot><tr>${o.foot.map((c) => `<td>${c}</td>`).join('')}</tr></tfoot>` : ''}</table></div>`;
}

export const kv = (pairs) => `<dl class="kv">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
export const sumRows = (rows, total) => `${rows.map(([k, v, cls]) => `<div class="sum-row ${cls || ''}"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
  ${total ? `<div class="sum-row total"><span>${total[0]}</span><span class="v">${total[1]}</span></div>` : ''}`;

export const accordion = (items, o = {}) => `<div class="acc" ${o.single ? 'data-acc-single' : ''}>
  ${items.map((it, i) => `<div class="acc-item${i === (o.open != null ? o.open : -1) ? ' on' : ''}">
    <button class="acc-q" type="button">${it.q}<span class="mk">＋</span></button>
    <div class="acc-a"><div><div class="in">${it.a}</div></div></div></div>`).join('')}</div>`;

export const steps = (list, onIdx) => `<div class="steps">${list.map((s, i) =>
  `<span class="s ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><span class="n">${i < onIdx ? '✓' : i + 1}</span>${s}</span>${i < list.length - 1 ? '<span class="sep">›</span>' : ''}`).join('')}</div>`;
export const stepbar = steps;
export const hsteps = (list, onIdx) => `<div class="hsteps">${list.map((s, i) =>
  `<div class="st ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><div class="dot">${i < onIdx ? '✓' : i + 1}</div>${s}</div>`).join('')}</div>`;

export const bar = (pct, o = {}) => `<div class="bar ${o.cls || ''}"${o.title ? ` title="${esc(o.title)}"` : ''}><i style="width:${pct}%"></i></div>`;
export const barRow = (pct, o = {}) => `<div class="bar-row">${bar(pct, o)}<span class="pct">${pct}%</span></div>`;
export const progress = bar;

export const stat = (label, value, o = {}) => `<${o.href ? 'a' : 'button'} class="stat ${o.cls || ''}"${o.href ? ` href="${link(o.href)}"` : ' type="button"'}${o.attr || ''}>
  ${o.ico ? `<span class="ico" aria-hidden="true">${o.ico}</span>` : ''}
  <span class="l">${label}</span>
  <span class="v">${value}${o.unit ? `<small>${o.unit}</small>` : ''}</span>
  <span class="foot">${o.delta != null ? delta(o.delta, o.deltaUnit || '') : `<span class="t-sub">${o.note || ''}</span>`}</span>
</${o.href ? 'a' : 'button'}>`;

export const review = (r) => `<div class="review">
  <div class="row-b"><div class="row-c">
    ${ph('프로필', 'ph-ava-sm', r.who)}
    <div><b>${esc(r.who)}</b> <span class="t-sub">· ${r.date}</span><div class="t-sub">${r.area}평 · ${esc(r.region)}</div></div>
  </div><span>${stars(r.rate)}</span></div>
  <p class="txt">${esc(r.txt)}</p>
</div>`;

/* ================= 차트 ================= */
export function lineChart(vals, o = {}) {
  const w = o.w || 720, h = o.h || 220, pl = 40, pr = 8, pt = 12, pb = 22;
  const max = Math.max(...vals) * 1.12, min = 0;
  const iw = w - pl - pr, ih = h - pt - pb;
  const x = (i) => pl + (vals.length === 1 ? iw / 2 : (i / (vals.length - 1)) * iw);
  const y = (v) => pt + ih - ((v - min) / (max - min)) * ih;
  const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${pl},${pt + ih} ${pts} ${x(vals.length - 1).toFixed(1)},${pt + ih}`;
  const gridN = 4;
  const grid = Array.from({ length: gridN + 1 }, (_, i) => {
    const gy = pt + (ih / gridN) * i;
    const gv = Math.round(max - (max / gridN) * i);
    return `<line class="grid-l" x1="${pl}" y1="${gy.toFixed(1)}" x2="${w - pr}" y2="${gy.toFixed(1)}"/>
      <text class="lb" x="${pl - 6}" y="${(gy + 4).toFixed(1)}" text-anchor="end">${gv}</text>`;
  }).join('');
  const labels = (o.labels || []).map((t, i, arr) => {
    const idx = Math.round((i / Math.max(1, arr.length - 1)) * (vals.length - 1));
    return `<text class="lb" x="${x(idx).toFixed(1)}" y="${h - 6}" text-anchor="${i === 0 ? 'start' : i === arr.length - 1 ? 'end' : 'middle'}">${t}</text>`;
  }).join('');
  const dots = vals.map((v, i) => `<circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="height:${h}px" role="img" aria-label="${esc(o.alt || '추이 차트')}">
    ${grid}<polygon class="ar" points="${area}"/><polyline class="ln" points="${pts}"/>${dots}${labels}</svg>`;
}

/* ---------- 좌측 사이드바 + 상단 바 ---------- */
function sidebar(activeId, owner) {
  const groups = owner ? NAV_OWNER : NAV_CUSTOMER;
  const nav = groups.map(([g, items]) => `<div class="gl">${g}</div>${items.map(([id, label]) =>
    `<a href="${link(id)}"${id === activeId ? ' class="on" aria-current="page"' : ''}>${label}</a>`).join('')}`).join('');
  return `<aside class="side">
    <a class="logo" href="${link(owner ? 'OW0101' : 'HO0101')}"><span class="em">${SITE.mark}</span>${SITE.name}${owner ? ' <span class="t-sub" style="font-weight:500">사장님</span>' : ''}</a>
    ${nav}
    <div class="side-ft">
      <a href="${link(owner ? 'HO0101' : 'OW0101')}">${owner ? '↩ 고객 화면 보기' : '↪ 사장님 화면으로'}</a>
      <a href="../index.html">🗂 화면 목록</a>
    </div>
  </aside>`;
}

function topbar(o = {}) {
  return `<header class="topbar">
    ${o.search === false ? '' : `<form class="tb-search" role="search"><span class="ico" aria-hidden="true">🔍</span>
      <input type="search" placeholder="${o.searchPh || '시공 사례·자재를 검색해 보세요'}" aria-label="검색"></form>`}
    <span class="sp"></span>
    <a class="btn btn-ghost btn-sm" href="../index.html">화면 목록</a>
    <button class="icon-btn" type="button" data-toast="새 알림이 있어요" aria-label="알림">🔔</button>
    <a class="who" href="${link(o.owner ? 'OW0101' : 'AU0401')}"><span class="ava">${o.owner ? SITE.owner.init : SITE.me.init}</span>${o.owner ? SITE.owner.name : SITE.me.name}님</a>
  </header>`;
}

function crumb(ctx) {
  if (!ctx.backTo) return '';
  return `<nav class="crumb" aria-label="현재 위치">
    <a class="back" href="${link(ctx.backTo.pageId)}">‹ ${esc(ctx.backTo.pageName)}</a>
    <span class="path">${esc(ctx.menu)} › <b>${esc(ctx.pageName)}</b></span>
  </nav>`;
}

/* 잎사귀(3뎁스) 화면 상단 — 「지금 어떤 상태를 보고 있는지」를 밝힌다.
   부모 화면의 뼈대·색·톤은 그대로 두고 이 띠만 덧붙는다. */
export const stateBar = (label, desc) => `<div class="state-bar"><div class="in"><span class="tag">상태</span><b>${esc(label)}</b><span class="muted">${esc(desc || '')}</span></div></div>`;

function devPanel(ctx) {
  return `<div class="dev"><div class="spec">
    <div class="id">${ctx.id}</div><div class="nm">${esc(ctx.pageName)}</div>
    <div class="fd">${esc(ctx.funcDef)}</div>
    ${ctx.buttons && ctx.buttons.length ? `<div class="lk">${ctx.buttons.map((b) => `<a href="${link(b.targetPageId)}">${esc(b.label)} ›</a>`).join('')}</div>` : ''}
    <div class="lk"><a href="../index.html">전체 화면 목록</a></div>
  </div><button class="dev-btn" type="button">${ctx.id} 화면 정보</button></div>`;
}

const footer = () => `<footer class="ft"><div class="ft-in"><div class="ft-bot">
  <span>© 2026 ${SITE.name} · ${SITE.company}</span>
  <span><a href="../index.html">화면 목록</a> · 기획 검토용 화면 견본이라 실제로 저장·결제되지 않습니다</span>
</div></div></footer>`;

function head(ctx) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ctx.pageName)} · ${SITE.name}</title>
<meta name="description" content="${esc(ctx.funcDef).slice(0, 150)}">
<link rel="stylesheet" href="../assets/css/base.css">`;
}

/** 사이드바가 있는 화면 (고객 · 사장님 공통 뼈대, 항목만 다르다) */
export function shell(ctx, body, o = {}) {
  return `<!doctype html>
<html lang="ko">
<head>${head(ctx)}</head>
<body data-page="${ctx.id}">
<div class="app">
  ${sidebar(ctx.id, !!o.owner)}
  ${topbar(o)}
  <main class="appmain">
    ${crumb(ctx)}
    ${o.state ? stateBar(o.state, o.stateDesc) : ''}
    ${body}
    ${footer()}
  </main>
</div>
${o.after || ''}
${devPanel(ctx)}
<script src="../assets/js/app.js"></script>
</body>
</html>`;
}

/** 단독 화면 (계정: 로그인·회원가입 등) — 헤더·사이드바 없음 */
export function solo(ctx, body, o = {}) {
  return `<!doctype html>
<html lang="ko">
<head>${head(ctx)}</head>
<body data-page="${ctx.id}">
<main class="solo">
  <div class="solo-box ${o.wide ? 'solo-wide' : ''}">
    <a class="logo" href="${link('HO0101')}"><span class="em">${SITE.mark}</span>${SITE.name}</a>
    ${ctx.backTo ? `<nav class="crumb" aria-label="현재 위치"><a class="back" href="${link(ctx.backTo.pageId)}">‹ ${esc(ctx.backTo.pageName)}</a></nav>` : ''}
    ${o.state ? stateBar(o.state, o.stateDesc) : ''}
    ${body}
    <p class="t-sub center mt6"><a href="../index.html" style="font-weight:700;color:var(--pri-ink)">화면 목록</a> · 화면 견본이라 실제로 가입·로그인되지 않습니다</p>
  </div>
</main>
${o.after || ''}
${devPanel(ctx)}
<script src="../assets/js/app.js"></script>
</body>
</html>`;
}

/* ---------- 자주 쓰는 조합 ---------- */
export const pageHd = (title, sub, aside) => `<div class="page-hd"><div>
  <h1 class="t-page">${title}</h1>${sub ? `<p class="t-sub">${sub}</p>` : ''}</div>${aside ? `<div class="btns">${aside}</div>` : ''}</div>`;

export const statGrid = (list) => `<div class="g4 mb6">${list.join('')}</div>`;

/* 서명란 */
export const sigpad = (o = {}) => `<div class="sigpad${o.signed ? ' on' : ''}">
  ${o.signed ? `서명됨 · ${o.date || ''}` : '여기를 눌러 서명해 주세요'}
  <span class="sig-line"></span>${o.signed ? `<span class="sig-date">${o.date || ''}</span>` : ''}
</div>`;

/* 동의 상자 — 체크박스와 그 체크가 여는 버튼은 반드시 같은 data-agree-scope 상자 안에 둔다
   (레이아웃견본_발견기록.md 「잠금 해제 스코프를 두 상자로 갈라 두면 영영 안 열린다」). */
export const agreeScope = (body) => `<div class="agree-box" data-agree-scope>${body}</div>`;
/* 체크 하나 → 버튼 하나. id 로 직접 잇는다(같은 상자 안일 필요는 없다). */
export const agreeCheck = (label, unlockId, o = {}) => `<label class="check"><input type="checkbox" data-unlock="${unlockId}"${o.attr || ''}>${label}</label>`;
/* 체크 여러 개를 «다» 해야 버튼 하나가 열린다. 체크(data-agree)와 버튼(btn 의 unlockAll:true)이
   반드시 같은 agreeScope() 상자 안에 있어야 한다(레이아웃견본_발견기록.md 지뢰). */
export const agreeCheckAll = (label, o = {}) => `<label class="check"><input type="checkbox" data-agree${o.attr || ''}>${label}</label>`;

/* 캘린더 — 2026년 9월(1일 화요일) */
export function calendar(o = {}) {
  const sel = o.sel === undefined ? 12 : o.sel;
  const closed = o.closed || [6, 13, 20, 27];       // 매주 일요일 정기 휴무
  const full = o.full || [15, 19, 23];
  const past = o.past || Array.from({ length: 9 }, (_, i) => i + 1);
  const marks = o.marks || [];
  const start = 2; // 2026-09-01 은 화요일
  let cells = '';
  for (let i = 0; i < start; i++) cells += '<span></span>';
  for (let d = 1; d <= 30; d++) {
    const isClosed = closed.includes(d), isFull = full.includes(d), isPast = past.includes(d);
    const off = isClosed || isFull || isPast;
    const cls = ['cal-d', off ? 'off' : '', isFull ? 'full' : '', d === sel && !off ? 'sel' : '', marks.includes(d) ? 'mark' : ''].join(' ');
    const why = isPast ? '지난 날짜예요' : isClosed ? '정기 휴무일이에요(일요일)' : '이 날은 방문이 모두 찼어요';
    const note = isPast ? '' : isClosed ? '휴무' : isFull ? '마감' : (o.note ? o.note(d) : '가능');
    cells += `<button class="${cls}" type="button"${off ? ` disabled aria-disabled="true" data-why="${why}"` : ''}><span class="dd">${d}</span><span class="p">${note}</span></button>`;
  }
  return `<div class="cal">
    <div class="cal-hd"><button class="btn btn-ghost btn-sm cal-mv" type="button" data-mv="-1">‹</button><b class="cal-m">${o.month || '2026년 9월'}</b><button class="btn btn-ghost btn-sm cal-mv" type="button" data-mv="1">›</button></div>
    <div class="cal-grid">${['일', '월', '화', '수', '목', '금', '토'].map((d) => `<span class="dow">${d}</span>`).join('')}${cells}</div>
    <div class="row-c mt4 t-sub" style="gap:16px;flex-wrap:wrap"><span>진하게 = 방문 가능</span><span class="muted">취소선 = 휴무·마감</span>${o.legend || ''}</div>
  </div>`;
}

/* 시간 슬롯 */
export function slots(o = {}) {
  const list = o.list || ['09:00', '11:00', '14:00', '16:00'];
  const full = o.full || ['11:00'];
  const sel = o.sel || '14:00';
  return `<div class="slots">${list.map((t) => {
    const isFull = full.includes(t);
    const cls = ['slot', isFull ? 'full' : '', t === sel && !isFull ? 'on' : ''].join(' ');
    const left = isFull ? '마감' : (o.left ? o.left(t) : '2자리');
    return `<button class="${cls}" type="button"${isFull ? ` data-why="이미 방문이 찬 시간이에요"` : ''}><span class="dd">${t}</span><span class="n">${left}</span></button>`;
  }).join('')}</div>`;
}

/* ================= 잎사귀(3뎁스) 화면 — 공용 렌더러 =================
   상위 화면의 뼈대·색·톤은 shell() 이 그대로 유지해 준다. 여기서는
   「이 부분만 바뀐 상태」를 funcDef 문장을 그대로 살려서 보여준다.
   손으로 더 다듬을 화면(특히 PR·AS)은 이 함수를 안 쓰고 따로 쓴다. */
export function leafBody(ctx, o = {}) {
  const bullets = (ctx.funcDef || '').split('·').map((s) => s.trim()).filter(Boolean);
  const label = (ctx.pageName || '').split('>').pop().trim();
  const kind = o.kind || guessKind(ctx.pageName);
  const listHtml = `<div class="col">${bullets.map((b) => `<div class="row-c" style="align-items:flex-start"><span class="badge b-pri" style="flex:none;margin-top:1px">●</span><span>${esc(b)}</span></div>`).join('')}</div>`;

  let mid = '';
  if (kind === 'empty') {
    mid = empty('📭', label, bullets[0] || '', o.btns || '');
  } else if (kind === 'error') {
    mid = banner('danger', '⚠️', `<b>${esc(label)}</b>` + (bullets[0] ? `<div class="t-sub mt1">${esc(bullets[0])}</div>` : ''));
  } else if (kind === 'complete') {
    mid = result('ok', '✓', label, bullets[0] || '');
  } else {
    mid = card('', listHtml);
  }

  const acts = ctx.acts && ctx.acts.length
    ? sec('눌러 보면', `<div class="col">${ctx.acts.map(([a, r]) => `<div class="box"><b>${esc(a)}</b><div class="t-sub mt1">→ ${esc(r)}</div></div>`).join('')}</div>`)
    : '';
  const links = ctx.buttons && ctx.buttons.length
    ? `<div class="btns mt6">${ctx.buttons.map((b) => btn(b.label, { href: b.targetPageId, cls: 'btn-ghost' })).join('')}</div>` : '';

  /* 위 상태 띠(state-bar)가 이미 label 을 보여 준다 — 여기서 또 큰 제목으로 되풀이하지 않는다. */
  return `${mid}${acts}${links}${o.extra || ''}`;
}
function guessKind(name = '') {
  if (/없음|비어있음|미배정/.test(name)) return 'empty';
  if (/실패|오류|경고|충돌|지연|만료|연체/.test(name)) return 'error';
  if (/완료|확정/.test(name)) return 'complete';
  return 'info';
}

/* 공정 가로 막대 일정표 */
export function processBar(rows, o = {}) {
  const total = rows.reduce((a, r) => a + r.days, 0);
  let acc = 0;
  const segs = rows.map((r) => {
    const w = (r.days / total) * 100;
    const left = (acc / total) * 100;
    acc += r.days;
    const cls = r.status === '끝남' ? 'ok' : r.status === '밀림' ? 'danger' : '';
    return `<div class="seg ${cls}" style="left:${left.toFixed(2)}%;width:${w.toFixed(2)}%" title="${esc(r.key)} · ${esc(r.team)} · ${r.days}일 · ${esc(r.status)}"></div>`;
  }).join('');
  return `<div class="pbar-wrap"><div class="pbar">${segs}${o.todayPct != null ? `<div class="pbar-today" style="left:${o.todayPct}%"></div>` : ''}</div></div>`;
}
