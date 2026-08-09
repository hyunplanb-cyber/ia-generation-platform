/* 공통 UI 조각
   - 색·글꼴·모서리·간격은 가이드 프리셋 02 미니멀 모노
   - 화면 뼈대(좌측 세로 사이드바 + 상단 계정만 · 지표 카드 4개 · 표 중심 ·
     상세는 좌 본문 + 우 액션 패널)는 레이아웃 프리셋 A 대시보드형
   - 카드 모양은 "사진 없는 카드(text)" — 좌측에 색 띠 한 줄.
     백오피스는 숫자와 상태가 주인공이라 사진을 쓰지 않는다.

   조각을 여기 모아 두는 까닭: 같은 것을 화면마다 다시 적으면 반드시 갈라진다.
   상태 배지 색이 화면마다 달랐던 적이 있어서 ST_CLS 도 data.mjs 한곳에 뒀다. */
import { SITE, NAV, NAV_CNT, ST_CLS } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const won = (n) => n.toLocaleString('ko-KR') + '원';
export const num = (n) => n.toLocaleString('ko-KR');
/** 만원 단위로 줄여 쓴다 — 지표 카드처럼 자리가 좁을 때 */
export const man = (n) => (n >= 10000 ? `${Math.round(n / 10000).toLocaleString('ko-KR')}만원` : won(n));
function hash(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0; return Math.abs(h); }

/* 스펙팩이 정한 화면만 있으므로, 없는 화면을 가리키는 링크는 같은 메뉴의 첫 화면으로 옮긴다.
   ⚠ 이것을 빠뜨리면 «끊어진 링크»가 100개 단위로 생긴다. 실제로 다른 팩에서 220개 났다. */
let PAGES = null;
export const setPages = (ids) => { PAGES = new Set(ids); };
export function toPageId(id) {
  const s = String(id);
  if (!PAGES || PAGES.has(s)) return s;
  /* 3뎁스 코드(CU0102)가 오면 2뎁스(CU-01)로 내린다 */
  const m = /^([A-Z]{2})(\d{2})\d{2}$/.exec(s);
  const want = m ? `${m[1]}-${m[2]}` : s;
  if (PAGES.has(want)) return want;
  const code = want.slice(0, 2);
  return [...PAGES].find((p) => p.startsWith(`${code}-`)) || want;
}
export const link = (id) => `${toPageId(id)}.html`;

/* ---------- 이미지 자리 ----------
   테마 색으로 칠하지 않는다. 옅은 한 톤 + 1px 테두리로 두고,
   무엇이 들어갈 자리인지와 권장 크기를 적는다. 적은 비율은 실제로 지킨다. */
export function ph(spec, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const cls = ['ph', tone, o.cls || '', o.tiny ? 'ph-tiny' : ''].join(' ');
  const label = o.tiny
    ? `<span class="lb">${w}×${h}</span>`
    : `<span class="lb">이미지 영역 (${esc(what)} · <span class="sz">권장 ${w}×${h}</span>)</span>`;
  return `<div class="${cls}" style="aspect-ratio:${w}/${h}${o.style ? ';' + o.style : ''}">${label}</div>`;
}
/** 크기가 고정된 자리 — 표 안에서 늘어나지 않게 폭·높이를 못 박는다 */
export function phFix(spec, px, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const hh = Math.round(px * h / w);
  const cls = ['ph', 'ph-fix', tone, o.cls || 'ph-sq', 'ph-tiny'].join(' ');
  return `<div class="${cls}" style="width:${px}px;height:${hh}px" title="이미지 영역 (${esc(what)} · 권장 ${w}×${h})">${px >= 52 ? `<span class="lb">${w}×${h}</span>` : ''}</div>`;
}
export const phThumb = (seed, px = 34) => phFix(['상품 사진', 800, 800], px, { seed });
/** 사람 자리는 사진 대신 이름 첫 글자 — 백오피스에서 얼굴 사진은 오히려 방해가 된다 */
export const av = (nm) => `<span class="av">${esc(String(nm).slice(0, 1))}</span>`;

/* ---------- 작은 조각 ---------- */
export const badge = (t, k = '') => `<span class="badge ${k}">${esc(t)}</span>`;
export const stBadge = (st) => badge(st, ST_CLS[st] || 'b-mut');

export const btn = (t, o = {}) =>
  o.href
    ? `<a class="btn ${o.cls || 'btn-ghost'}${o.sm ? ' btn-sm' : ''}${o.w ? ' btn-w' : ''}" href="${link(o.href)}"${o.attr || ''}>${t}</a>`
    : `<button class="btn ${o.cls || 'btn-ghost'}${o.sm ? ' btn-sm' : ''}${o.w ? ' btn-w' : ''}${o.off ? ' is-off' : ''}"${o.id ? ` id="${o.id}"` : ''} type="button"${o.off ? ' disabled' : ''}${o.attr || ''}>${t}</button>`;

export const chip = (t, on = false, extra = '') => `<button class="chip${on ? ' on' : ''}" type="button"${extra}>${esc(t)}</button>`;
export const chips = (list, onIdx = -1, o = {}) =>
  `<div class="chips">${list.map((t, i) => chip(t, Array.isArray(onIdx) ? onIdx.includes(i) : i === onIdx, o.extra || '')).join('')}</div>`;

export function tabs(list, onIdx = 0, o = {}) {
  const cls = o.pill ? 'tabs-pill' : 'tabs';
  return `<div class="${cls}">${list.map((t, i) => {
    const label = typeof t === 'string' ? t : t.label;
    const cnt = typeof t === 'object' && t.cnt != null ? `<span class="cnt">${t.cnt}</span>` : '';
    /* 다른 화면으로 가는 탭은 data-go, 같은 화면 안에서 바뀌는 탭은 data-pane.
       ⚠ data-pane 이다. data-panes 라고 쓰면 조용히 아무 일도 안 한다. */
    const go = typeof t === 'object' && t.go ? ` data-go="${link(t.go)}"` : '';
    const pane = typeof t === 'object' && t.pane ? ` data-pane="${t.pane}"` : '';
    return `<button class="tab${i === onIdx ? ' on' : ''}" type="button"${go}${pane}>${label}${cnt}</button>`;
  }).join('')}</div>`;
}
/** 탭이 바꿔 끼우는 몸통. 첫 칸만 보이고 나머지는 hidden 으로 둔다. */
export const pane = (key, body, on = false) => `<div data-pane-body="${key}"${on ? '' : ' hidden'}>${body}</div>`;

export const sec = (title, body, o = {}) => `<section class="sec">
  ${title ? `<div class="sec-hd"><h2 class="t-sec">${title}</h2>${o.more ? `<a class="more" href="${link(o.more)}">${o.moreLabel || '전체 보기'} ›</a>` : (o.aside || '')}</div>` : ''}
  ${o.desc ? `<p class="t-sub mb4">${o.desc}</p>` : ''}
  ${body}</section>`;

export const card = (title, body, o = {}) => `<div class="card ${o.cls || ''}">
  ${title ? `<div class="card-hd"><h3 class="t-card">${title}</h3>${o.aside || ''}</div>` : ''}
  <div class="card-bd ${o.bdCls || ''}">${body}</div>
  ${o.ft ? `<div class="card-ft">${o.ft}</div>` : ''}</div>`;

export const box = (body, o = {}) => `<div class="box ${o.cls || ''}">${body}</div>`;

export const banner = (kind, ico, html, o = {}) =>
  `<div class="banner banner-${kind} ${o.cls || ''}">${ico ? `<span class="ico">${ico}</span>` : ''}<div class="grow">${html}</div>${o.right || ''}</div>`;

export const empty = (ico, title, msg, btns = '') => `<div class="empty">
  <div class="ico">${ico}</div><h3 class="t-sec">${title}</h3>
  ${msg ? `<p class="msg">${msg}</p>` : ''}${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;

/* ---------- 표 — 대시보드형의 주인공 ----------
   head 는 문자열이거나 {t, w, cls}. rows 는 셀 배열이거나 {cells, cls, href}. */
export function table(head, rows, o = {}) {
  const th = head.map((h) => {
    const t = typeof h === 'object' ? h.t : h;
    const w = typeof h === 'object' && h.w ? ` style="width:${h.w}"` : '';
    const c = typeof h === 'object' && h.cls ? ` class="${h.cls}"` : '';
    return `<th${w}${c}>${t}</th>`;
  }).join('');
  const tr = rows.map((r) => {
    const cells = Array.isArray(r) ? r : r.cells;
    const cls = !Array.isArray(r) && r.cls ? ` class="${r.cls}"` : '';
    /* 행 전체를 눌러 상세로 가게 한다. 안의 버튼·링크를 누르면 그쪽이 이긴다(app.js). */
    const href = !Array.isArray(r) && r.href ? ` data-href="${link(r.href)}" tabindex="0" role="link"` : '';
    return `<tr${cls}${href}>${cells.map((c) => (typeof c === 'object' ? `<td class="${c.cls || ''}">${c.t}</td>` : `<td>${c}</td>`)).join('')}</tr>`;
  }).join('');
  const tf = o.foot ? `<tfoot><tr>${o.foot.map((c) => (typeof c === 'object' ? `<td class="${c.cls || ''}">${c.t}</td>` : `<td>${c}</td>`)).join('')}</tr></tfoot>` : '';
  return `<div class="table-wrap ${o.scroll === false ? '' : 'table-scroll'}"><table class="table ${o.cls || ''}${o.fix ? ' table-fix' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody>${tf}</table></div>`;
}

export const kv = (pairs, o = {}) => `<dl class="kv ${o.cls || ''}">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
export const sumRows = (rows, total) => `${rows.map(([k, v, cls]) => `<div class="sum-row ${cls || ''}"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
  ${total ? `<div class="sum-row total"><span>${total[0]}</span><span class="price">${total[1]}</span></div>` : ''}`;

/* ---------- 지표 카드 4개 — "화면 위쪽에 지표 카드 4개"(레이아웃 hero 슬롯) ---------- */
export const stat = (n, l, o = {}) => `<div class="stat ${o.cls || ''}">
  <div class="l">${l}</div><div class="n">${n}</div>${o.d ? `<div class="d">${o.d}</div>` : ''}</div>`;
export const statRow = (list, cls = 'g4') => `<div class="${cls}">${list.map((s) => stat(s[0], s[1], s[2] || {})).join('')}</div>`;
export const up = (t) => `<span class="up">▲ ${t}</span>`;
export const dn = (t) => `<span class="dn">▼ ${t}</span>`;

export const progress = (pct, kind) => `<div class="progress"><div class="fill ${kind || ''}" style="width:${Math.min(100, Math.max(0, pct))}%"></div></div>`;

/* ---------- 이력·단계 ---------- */
export const timeline = (items) => `<div class="tl">${items.map((it) => `<div class="tl-item ${it.k || ''}">
  <div class="t">${it.t}</div>${it.d ? `<div class="d">${it.d}</div>` : ''}</div>`).join('')}</div>`;

export const steps = (list, onIdx) => `<div class="steps">${list.map(([t, d], i) =>
  `<div class="st ${i < onIdx ? 'done' : (i === onIdx ? 'on' : '')}">${t}${d ? `<span class="dt">${d}</span>` : ''}</div>`).join('')}</div>`;

/* ---------- 그래프 ----------
   ⚠ 그림만 주지 않는다. 막대 위에 값을 적고, 필요하면 표를 함께 둔다 —
     눈으로 높이를 재게 하면 «읽을 수 없는 화면»이 된다. */
export function bars(list, o = {}) {
  const max = Math.max(...list.map((x) => x.v)) || 1;
  const fmt = o.fmt || man;
  return `<div class="chart ${o.cls || ''}">
    <div class="bars">${list.map((x, i) => `<div class="b${i === list.length - 1 ? ' on' : ''}" style="height:${Math.max(6, Math.round(x.v / max * 100))}%"><span class="v">${fmt(x.v)}</span></div>`).join('')}</div>
    <div class="bars-x">${list.map((x) => `<span>${x.d}</span>`).join('')}</div>
  </div>`;
}
export const spark = (list) => {
  const max = Math.max(...list) || 1;
  return `<span class="spark">${list.map((v) => `<i style="height:${Math.max(2, Math.round(v / max * 16))}px"></i>`).join('')}</span>`;
};
/** 원그래프 — conic-gradient 로 그리고 옆에 값 표를 붙인다 */
export function donut(list) {
  const total = list.reduce((a, b) => a + b.v, 0) || 1;
  let acc = 0;
  const stops = list.map((x) => {
    const from = acc / total * 100; acc += x.v;
    return `${x.c} ${from.toFixed(1)}% ${(acc / total * 100).toFixed(1)}%`;
  }).join(',');
  return `<div class="donut">
    <div class="ring" style="background:conic-gradient(${stops})"></div>
    <div class="lg">${list.map((x) => `<span><i style="background:${x.c}"></i>${x.d} <b>${Math.round(x.v / total * 100)}%</b> <span class="muted">${man(x.v)}</span></span>`).join('')}</div>
  </div>`;
}

/* ---------- 폼 ---------- */
export const field = (label, input, o = {}) => `<label class="field">
  <span class="lb">${label}${o.req ? '<span class="req">*</span>' : ''}</span>
  ${input}${o.hint ? `<span class="hint">${o.hint}</span>` : ''}${o.err ? `<span class="err">${o.err}</span>` : ''}</label>`;
export const input = (o = {}) => `<input class="in ${o.cls || ''}" type="${o.type || 'text'}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.v ? ` value="${esc(o.v)}"` : ''}${o.off ? ' disabled' : ''}>`;
export const select = (list, onIdx = 0) => `<select class="sel">${list.map((t, i) => `<option${i === onIdx ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
export const textarea = (o = {}) => `<textarea class="ta"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}>${o.v ? esc(o.v) : ''}</textarea>`;
export const check = (label, o = {}) => `<label class="check${o.none ? ' none' : ''}">
  <input type="checkbox"${o.on ? ' checked' : ''}${o.attr || ''}>
  <span>${label}${o.sub ? `<span class="sub">${o.sub}</span>` : ''}</span></label>`;
export const toggle = (on = false, toastMsg = '') => `<button class="toggle${on ? ' on' : ''}" type="button" aria-pressed="${on}"${toastMsg ? ` data-toast="${esc(toastMsg)}"` : ''}></button>`;

/* ---------- 화면 뼈대 ---------- */
export const pageHd = (title, sub, aside) => `<div class="page-hd">
  <div><h1 class="t-page">${title}</h1>${sub ? `<p class="t-sub">${sub}</p>` : ''}</div>
  ${aside ? `<div class="btns">${aside}</div>` : ''}</div>`;

/** 상세 화면 — "좌 본문 + 우 액션 패널 2단. 상태 변경 버튼을 우측에 모은다" */
export const detail2 = (main, aside) => `<div class="split-r"><div>${main}</div><div class="sticky stack">${aside}</div></div>`;
/** 목록 화면 — 좌측 필터 패널 + 우측 표 */
export const listPage = (filter, body) => `<div class="split-l"><div class="sticky">${filter}</div><div>${body}</div></div>`;
/** 로그인처럼 사이드바가 없는 화면 */
export const solo = (title, sub, body) => `<div class="solo-wrap"><div class="solo-card">
  <div class="solo-hd"><span class="mark">${SITE.mark}</span><b>${SITE.name}</b></div>
  <h1 class="t-sec mb2">${title}</h1>${sub ? `<p class="t-sub mb6">${sub}</p>` : ''}${body}</div></div>`;

export const modal = (id, title, body, ft) => `<template id="${id}"><div class="modal">
  <div class="m-hd"><h3 class="t-card">${title}</h3><button class="x" type="button" data-dismiss aria-label="닫기">✕</button></div>
  <div class="m-bd">${body}</div>${ft ? `<div class="m-ft">${ft}</div>` : ''}</div></template>`;

/* ---------- 사이드바 ---------- */
function sideNav(activeId) {
  const code = String(activeId).slice(0, 2);
  return NAV.map((g) => `${g.grp ? `<div class="side-grp">${g.grp}</div>` : ''}
    ${g.items.map(([c, nm, to, ic]) => {
      const n = NAV_CNT[c];
      return `<a class="side-a${c === code ? ' on' : ''}" href="${link(to)}"${c === code ? ' aria-current="page"' : ''}>
        <span class="ic" aria-hidden="true">${ic}</span>${nm}${n ? `<span class="cnt">${n}</span>` : ''}</a>`;
    }).join('')}`).join('');
}

/* ---------- 화면 정보 패널 ----------
   손님이 볼 것이 아니다. 언제나 닫힌 채로 시작하고, 누를 때만 열린다. */
function devPanel(ctx) {
  const lks = (ctx.buttons || []).map((b) => `<a href="${link(b.targetPageId)}">${esc(b.label)} → ${esc(b.targetPageName || b.targetPageId)}</a>`).join('');
  return `<div class="dev">
    <div class="dev-bd">
      <span class="pid">${ctx.id} · ${esc(ctx.pageName)}</span>
      <dl style="margin:0">
        <dt>메뉴</dt><dd>${esc(ctx.menu || '-')}</dd>
        <dt>기능정의</dt><dd>${esc(ctx.funcDef || '-')}</dd>
        ${lks ? `<dt>연결 화면</dt><dd><span class="lks">${lks}</span></dd>` : ''}
      </dl>
    </div>
    <button class="dev-btn" type="button">화면 정보</button>
  </div>`;
}

/**
 * 한 장의 HTML 을 완성한다.
 * o.solo 를 주면 사이드바 없이 가운데 카드 한 장으로 그린다(로그인·권한없음).
 */
export function shell(ctx, body, o = {}) {
  const head = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ctx.pageName)} · ${SITE.name}</title>
<link rel="stylesheet" href="../assets/css/base.css">
</head>
<body>`;
  const foot = `${devPanel(ctx)}
<script src="../assets/js/app.js"></script>
</body></html>`;

  if (o.solo) {
    return `${head}
<style>
.solo-wrap{min-height:100vh;display:grid;place-items:center;padding:var(--sp-block) var(--sp-wrap)}
.solo-card{width:100%;max-width:392px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-card);padding:32px}
.solo-hd{display:flex;align-items:center;gap:8px;margin-bottom:var(--sp-block);font-size:var(--fs-card)}
.solo-hd .mark{width:24px;height:24px;border-radius:var(--r-badge);background:var(--primary);color:var(--on-primary);display:grid;place-items:center;font-size:12px;font-weight:700}
</style>
${body}
${foot}`;
  }

  const back = ctx.backTo
    ? `<a class="back" href="${link(ctx.backTo.pageId || ctx.backTo)}">‹ ${esc(ctx.backTo.pageName || '뒤로')}</a>`
    : '';

  return `${head}
<div class="adm">
  <aside class="side">
    <div class="side-hd"><span class="mark">${SITE.mark}</span><span class="nm">${SITE.short}</span></div>
    <nav class="side-nav" aria-label="주 메뉴">${sideNav(ctx.id)}</nav>
  </aside>
  <div class="main">
    <header class="top"><div class="top-in">
      <span class="biz">${SITE.biz}</span>
      <span class="t-sub">${o.period || '오늘 · 2026.08.10'}</span>
      <span class="grow"></span>
      <button class="ico-btn" type="button" data-toast="새 알림 3건이 있어요" aria-label="알림"><span aria-hidden="true">🔔</span><span class="dot"></span></button>
      <a class="me" href="${link('SE-04')}"><span class="av">박</span>박지우 <span class="t-sub">원장</span></a>
    </div></header>
    <main class="wrap">${back}${body}</main>
  </div>
</div>
${foot}`;
}
