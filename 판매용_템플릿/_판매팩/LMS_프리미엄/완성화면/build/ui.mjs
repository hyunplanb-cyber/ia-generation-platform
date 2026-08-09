/* 공통 부품 — 가이드_03 코럴선셋 + 레이아웃_A 대시보드형 규칙을 마크업으로 고정한다 */
import { SITE, NAV_USER, NAV_ADMIN } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const nf = (n) => Number(n).toLocaleString('ko-KR');
export const won = (n) => nf(n) + '원';
export const offRate = (was, price) => Math.round((1 - price / was) * 100);
/* 링크가 «있는 화면»을 가리키게 옮겨 준다.
 *
 * 왜 필요한가 — 2026-08-09
 *   2뎁스 빌더는 'CL-03' 으로 링크를 건다. 그런데 3뎁스 팩의 파일은 'CL0301.html' 이다.
 *   그대로 두면 **132장 전부 링크가 죽는다** — 화면 사이를 오갈 수가 없다.
 *   눈으로는 안 보인다. 눌러야 보이고, 132장을 다 눌러 볼 수는 없다.
 *   (check-pack.mts 가 이걸 잡아 줬다.)
 *
 * 옮기는 규칙
 *   'CL-03'  → 'CL0301'   그 화면의 «기본 상태»로 보낸다
 *   'CL0302' → 그대로       이미 3뎁스 이름이면 손대지 않는다
 *   없는 것  → 같은 메뉴의 첫 화면으로. 끊긴 링크보다 낫다.
 */
let PAGES = null;
export const setPages = (ids) => { PAGES = new Set(ids); };
export function toPageId(id) {
  const s = String(id);
  if (!PAGES || PAGES.has(s)) return s;
  const m = /^([A-Z]{2})-(\d{2})$/.exec(s);
  if (m) {
    const want = `${m[1]}${m[2]}01`;
    if (PAGES.has(want)) return want;
  }
  const code = s.slice(0, 2);
  return [...PAGES].find((p) => p.startsWith(code)) || s;
}
export const link = (id) => `${toPageId(id)}.html`;

/* ---------- 이미지 자리 ----------
   테마 색으로 칠하지 않는다. 옅은 파스텔 한 톤 + 1px 테두리 + 무엇·권장 크기.
   적어 둔 크기의 비율을 실제로 지킨다. */
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
/** ph('강의 썸네일', 'ph-43', seed) → 이미지 영역 (강의 썸네일 · 권장 1200×900) */
export function ph(what, cls = 'ph-43', seed = '') {
  const size = SIZES[cls] || '1200×900';
  const small = cls === 'ph-thumb' || cls === 'ph-thumb-sm' || cls === 'ph-ava' || cls === 'ph-ava-sm';
  const label = small ? size : `이미지 영역 (${esc(what)} · 권장 ${size})`;
  return `<div class="ph ${cls} ${tone(seed || what)}" role="img" aria-label="${esc(what)} 이미지 자리, 권장 ${size}"><span>${label}</span></div>`;
}

/* ---------- 작은 조각 ---------- */
export const stars = (r) => `<span class="stars" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
export const rateLine = (r, rv) => `${stars(r)} <b>${r.toFixed(1)}</b> <span class="muted">(${nf(rv)})</span>`;
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
export const delta = (n, unit = '') => {
  const up = n > 0, flat = n === 0;
  return `<span class="delta ${flat ? 'flat' : up ? 'up' : 'dn'}">${flat ? '—' : up ? '▴' : '▾'} ${nf(Math.abs(n))}${unit}</span>`;
};

export const btn = (t, o = {}) => {
  const cls = `btn ${o.cls || 'btn-ghost'}${o.off ? ' is-off' : ''}`;
  const attr = `${o.attr || ''}${o.off ? ' disabled' : ''}`;
  return o.href
    ? `<a class="${cls}" href="${link(o.href)}"${o.attr || ''}>${t}</a>`
    : `<button class="${cls}" type="button"${attr}>${t}</button>`;
};
/* 서버가 있어야 하는 일 — 짧은 안내로 대신한다 */
export const btnSay = (t, msg, o = {}) => btn(t, { ...o, attr: ` data-toast="${esc(msg)}"${o.attr || ''}` });

export const chip = (t, o = {}) =>
  `<button class="chip${o.on ? ' on' : ''}${o.sm ? ' chip-sm' : ''}" type="button"${o.attr || ''}>${t}${o.x ? ' <span class="x">✕</span>' : ''}</button>`;
/** 목록을 실제로 거르는 칩 묶음 */
export function fchips(list, key, values, o = {}) {
  const items = values.map((raw) => {
    const v = Array.isArray(raw) ? raw[0] : raw;
    const isAll = v === '*';
    const label = isAll ? (o.allLabel || '전체') : (Array.isArray(raw) ? raw[1] : v);
    return `<button class="chip${(o.on === v || (isAll && !o.on)) ? ' on' : ''}" type="button" data-fgroup="${list}" data-f="${key}" data-v="${v}">${label}${o.x && !isAll ? ' <span class="x">✕</span>' : ''}</button>`;
  }).join('');
  return `<div class="chips" data-fset${o.multi ? ' data-multi' : ''}>${items}</div>`;
}

export function tabs(items, onIdx = 0, o = {}) {
  const cls = o.pill ? 'tabs-pill' : 'tabs';
  const inner = items.map((t, i) => {
    const label = typeof t === 'string' ? t : t.label;
    const cnt = (typeof t === 'object' && t.cnt != null) ? `<span class="cnt">${t.cnt}</span>` : '';
    const a = [];
    if (typeof t === 'object') {
      if (t.go) a.push(`data-go="${link(t.go)}"`);
      if (t.pane) a.push(`data-pane="${t.pane}"`);
      if (t.f) a.push(`data-fgroup="${o.list}" data-f="${t.f}" data-v="${t.v}"`);
      if (t.swap) a.push(`data-swap="${t.swap}"`);
    }
    return `<button class="tab${i === onIdx ? ' on' : ''}" type="button" ${a.join(' ')}>${label}${cnt}</button>`;
  }).join('');
  const attr = [o.panes ? `data-panes="${o.panes}"` : '', o.list ? `data-fset` : ''].join(' ');
  return `<div class="${cls}" ${attr}>${inner}</div>`;
}
export const pane = (key, body, show = false) => `<div data-pane-body="${key}"${show ? '' : ' hidden'}>${body}</div>`;

export const sec = (title, body, o = {}) => `<section class="sec ${o.cls || ''}">
  ${title ? `<div class="sec-hd"><div><h2 class="t-sec">${title}</h2>${o.desc ? `<p class="t-sub mt1">${o.desc}</p>` : ''}</div>${o.more ? `<a class="more" href="${link(o.more)}">${o.moreLabel || '전체 보기'} ›</a>` : (o.aside || '')}</div>` : ''}
  ${body}</section>`;

export const card = (title, body, o = {}) => `<div class="card ${o.cls || ''}">
  ${(title || o.aside) ? `<div class="card-hd">${title ? `<h3 class="t-card">${title}</h3>` : '<span></span>'}${o.aside || ''}</div>` : ''}
  <div class="card-bd ${o.bdCls || ''}">${body}</div>
  ${o.ft ? `<div class="card-ft">${o.ft}</div>` : ''}</div>`;

export const banner = (kind, ico, html, right = '') =>
  `<div class="banner banner-${kind}">${ico ? `<span class="ico">${ico}</span>` : ''}<div class="grow">${html}</div>${right}</div>`;

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
    const sort = (typeof h === 'object' && h.sort) ? ` class="sortable" data-sort="${h.sort}"` : '';
    const w = (typeof h === 'object' && h.w) ? ` style="width:${h.w}"` : '';
    const ar = (typeof h === 'object' && h.sort) ? ' <span class="ar">↕</span>' : '';
    return `<th${sort}${w}>${t}${ar}</th>`;
  }).join('');
  const tr = rows.map((r) => {
    const cells = (r.cells || r).map((c) => (typeof c === 'object' && c !== null)
      ? `<td${c.v != null ? ` data-v="${esc(c.v)}"` : ''}${c.cls ? ` class="${c.cls}"` : ''}>${c.t}</td>`
      : `<td>${c}</td>`).join('');
    return `<tr${r.attr || ''}${r.cls ? ` class="${r.cls}"` : ''}>${cells}</tr>`;
  }).join('');
  return `<div class="table-wrap ${o.scroll ? 'table-scroll' : ''}"${o.attr || ''}><table class="table ${o.cls || ''}">
    <thead><tr>${th}</tr></thead><tbody${o.bodyAttr || ''}>${tr}</tbody>${o.foot ? `<tfoot>${o.foot}</tfoot>` : ''}</table></div>`;
}

export const kv = (pairs) => `<dl class="kv">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
export const sumRows = (rows, total) => `${rows.map(([k, v, attr]) => `<div class="sum-row"><span class="muted">${k}</span><span ${attr || ''}>${v}</span></div>`).join('')}
  ${total ? `<div class="sum-row total"><span>${total[0]}</span><span class="v" ${total[2] || ''}>${total[1]}</span></div>` : ''}`;

export const accordion = (items, o = {}) => `<div class="acc" ${o.single ? 'data-acc-single' : ''}>
  ${items.map((it, i) => `<div class="acc-item${i === (o.open != null ? o.open : -1) ? ' on' : ''}">
    <button class="acc-q" type="button">${it.q}<span class="mk">＋</span></button>
    <div class="acc-a"><div><div class="in">${it.a}</div></div></div></div>`).join('')}</div>`;

export const steps = (list, onIdx) => `<div class="steps">${list.map((s, i) =>
  `<span class="s ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><span class="n">${i < onIdx ? '✓' : i + 1}</span>${s}</span>${i < list.length - 1 ? '<span class="sep">›</span>' : ''}`).join('')}</div>`;

export const bar = (pct, o = {}) => `<div class="bar ${o.cls || ''}"${o.title ? ` title="${esc(o.title)}"` : ''}><i style="width:${pct}%"></i></div>`;
export const barRow = (pct, o = {}) => `<div class="bar-row">${bar(pct, o)}<span class="pct">${pct}%</span></div>`;

export const stat = (label, value, o = {}) => `<${o.href ? 'a' : 'button'} class="stat ${o.cls || ''}"${o.href ? ` href="${link(o.href)}"` : ' type="button"'}${o.attr || ''}>
  ${o.ico ? `<span class="ico" aria-hidden="true">${o.ico}</span>` : ''}
  <span class="l">${label}</span>
  <span class="v">${value}${o.unit ? `<small>${o.unit}</small>` : ''}</span>
  <span class="foot">${o.delta != null ? delta(o.delta, o.deltaUnit || '') : `<span class="t-sub">${o.note || ''}</span>`}${o.spark || ''}</span>
</${o.href ? 'a' : 'button'}>`;

/* ---------- 가격 묶음 : 판매가 · 정가 · 할인율 ---------- */
export function price(c, o = {}) {
  if (c.price === 0) return `<div class="price price-free ${o.cls || ''}"><span class="now">무료</span></div>`;
  const d = offRate(c.was, c.price);
  return `<div class="price ${o.cls || ''}"><span class="now">${won(c.price)}</span>
    <span class="was">${won(c.was)}</span><span class="off">${d}%</span></div>`;
}

/* ---------- 강의 카드 (분리형 — 상자를 두르지 않는다) ---------- */
export function ccard(c, o = {}) {
  const cls = o.cols === 4 ? 'ph-11' : 'ph-43';
  const sortKeys = ` data-v-pop="${c.st}" data-v-rate="${c.rate}" data-v-price="${c.price}" data-v-new="${o.idx != null ? o.idx : 0}"`;
  return `<a class="ccard" href="${link(o.href || 'CO-03')}" data-tags="cat:${c.cat} lv:${c.lv} price:${c.price === 0 ? '무료' : '유료'}" data-q="${esc(c.name + ' ' + c.by + ' ' + c.cat)}"${sortKeys}>
    ${o.noHeart ? '' : `<button class="heart" type="button" aria-label="찜하기">♡</button>`}
    ${ph('강의 썸네일', cls, c.id)}
    <div class="nm">${esc(c.name)}</div>
    <div class="by">${esc(c.by)}</div>
    <div class="meta">${stars(c.rate)} <b>${c.rate.toFixed(1)}</b> <span>·</span> <span>수강생 ${nf(c.st)}명</span></div>
    ${o.noBadge ? '' : `<div class="badges">${badge(c.lv, 'b-line')}${c.tag ? badge(c.tag, c.tag === '무료' ? 'b-ok' : 'b-acc') : ''}</div>`}
    ${price(c)}
  </a>`;
}
export const ccards = (list, o = {}) => list.map((c, i) => ccard(c, { ...o, idx: list.length - i })).join('');

/* ---------- 후기 ---------- */
export const review = (r) => `<div class="review">
  <div class="row-b"><div class="row-c">
    ${ph('프로필', 'ph-ava-sm', r.who)}
    <div><b>${esc(r.who)}</b> <span class="t-sub">· ${r.date}</span><div class="t-sub">${esc(r.course)}</div></div>
  </div><span>${stars(r.rate)}</span></div>
  <p class="txt">${esc(r.txt)}</p>
  <div class="row-c mt3"><button class="btn btn-ghost btn-sm" type="button" data-like><span>👍 도움돼요</span> <span class="n">${r.help}</span></button></div>
  ${r.reply ? `<div class="reply"><b>강사 답변</b> <span class="t-sub">· ${r.replyAt}</span><br>${esc(r.reply)}</div>` : ''}
</div>`;

/* ================= 차트 — 이미지가 아니라 데이터로 그린다 ================= */
export function lineChart(vals, o = {}) {
  const w = o.w || 720, h = o.h || 220, pl = 34, pr = 8, pt = 12, pb = 22;
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
  const dots = o.dots === false ? '' : vals.map((v, i) => (i % Math.ceil(vals.length / 8) === 0 || i === vals.length - 1)
    ? `<circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3"/>` : '').join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="height:${h}px" role="img" aria-label="${esc(o.alt || '추이 차트')}">
    ${grid}<polygon class="ar" points="${area}"/><polyline class="ln" points="${pts}"/>${dots}${labels}</svg>`;
}

export function spark(vals, o = {}) {
  const w = o.w || 92, h = o.h || 28;
  const max = Math.max(...vals), min = Math.min(...vals);
  const rng = (max - min) || 1;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - 2 - ((v - min) / rng) * (h - 5)).toFixed(1)}`).join(' ');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
    <polygon class="ar" points="0,${h} ${pts} ${w},${h}"/><polyline class="ln" points="${pts}"/></svg>`;
}

export function barChart(vals, labels, o = {}) {
  const w = o.w || 720, h = o.h || 200, pl = 34, pr = 8, pt = 12, pb = 24;
  const max = Math.max(...vals) * 1.15;
  const iw = w - pl - pr, ih = h - pt - pb;
  const bw = (iw / vals.length) * 0.56;
  const grid = Array.from({ length: 4 }, (_, i) => {
    const gy = pt + (ih / 4) * i;
    return `<line class="grid-l" x1="${pl}" y1="${gy.toFixed(1)}" x2="${w - pr}" y2="${gy.toFixed(1)}"/>
      <text class="lb" x="${pl - 6}" y="${(gy + 4).toFixed(1)}" text-anchor="end">${Math.round(max - (max / 4) * i)}</text>`;
  }).join('');
  const bars = vals.map((v, i) => {
    const cx = pl + (iw / vals.length) * (i + 0.5);
    const bh = (v / max) * ih;
    return `<rect class="${o.mutedIdx === i ? 'br-mut' : 'br'}" x="${(cx - bw / 2).toFixed(1)}" y="${(pt + ih - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4"/>
      <text class="lb" x="${cx.toFixed(1)}" y="${h - 7}" text-anchor="middle">${labels[i] || ''}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" style="height:${h}px" role="img" aria-label="${esc(o.alt || '막대 차트')}">
    ${grid}<line class="grid-l" x1="${pl}" y1="${pt + ih}" x2="${w - pr}" y2="${pt + ih}"/>${bars}</svg>`;
}

/* 학습 습관 잔디 — 최근 12주 */
export function grass(weeks = 13) {
  const cells = [];
  const start = new Date(2026, 4, 11);
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const i = w * 7 + d;
      const seed = (i * 37) % 11;
      const min = seed < 3 ? 0 : seed * 9 + (i % 5) * 4;
      const lvl = min === 0 ? '' : min < 30 ? 'l1' : min < 60 ? 'l2' : min < 95 ? 'l3' : 'l4';
      const dt = new Date(start.getTime() + i * 864e5);
      const label = `${dt.getMonth() + 1}월 ${dt.getDate()}일`;
      cells.push(`<i class="${lvl}" data-d="${label}" data-min="${min}" data-t="엑셀로 시작하는 실무 데이터 분석" title="${label} · ${min}분"></i>`);
    }
  }
  return `<div class="grass" role="img" aria-label="최근 3개월 학습 기록">${cells.join('')}</div>`;
}

/* ---------- 좌측 사이드바 + 상단 바 ---------- */
function sidebar(activeId, admin) {
  const groups = admin ? NAV_ADMIN : NAV_USER;
  const nav = groups.map(([g, items]) => `<div class="gl">${g}</div>${items.map(([id, label]) =>
    `<a href="${link(id)}"${id === activeId ? ' class="on" aria-current="page"' : ''}>${label}</a>`).join('')}`).join('');
  return `<aside class="side">
    <a class="logo" href="${link(admin ? 'TC-01' : 'HO-01')}"><span class="em">${SITE.mark}</span>${SITE.name}${admin ? ' <span class="t-sub" style="font-weight:500">강사</span>' : ''}</a>
    ${nav}
    <div class="side-ft">
      <a href="${link(admin ? 'HO-01' : 'TC-01')}">${admin ? '↩ 고객 화면 보기' : '↪ 강사센터 화면으로'}</a>
      <a href="../index.html">🗂 화면 목록</a>
    </div>
  </aside>`;
}

function topbar(o = {}) {
  return `<header class="topbar">
    ${o.search === false ? '' : `<form class="tb-search" role="search"><span class="ico" aria-hidden="true">🔍</span>
      <input type="search" placeholder="${o.searchPh || '배우고 싶은 것을 검색해 보세요'}" value="${o.q ? esc(o.q) : ''}" aria-label="검색"></form>`}
    <span class="sp"></span>
    <a class="btn btn-ghost btn-sm" href="../index.html">화면 목록</a>
    <button class="icon-btn" type="button" data-toast="새 알림이 3개 있어요" aria-label="알림">🔔</button>
    <a class="who" href="${link('MY-01')}"><span class="ava">${SITE.me.init}</span>${SITE.me.name}님</a>
  </header>`;
}

/* 뒤로가기 + 현재 위치 */
function crumb(ctx) {
  if (!ctx.backTo) return '';
  return `<nav class="crumb" aria-label="현재 위치">
    <a class="back" href="${link(ctx.backTo.pageId)}">‹ ${esc(ctx.backTo.pageName)}</a>
    <span class="path">${esc(ctx.menu)} › <b>${esc(ctx.pageName)}</b></span>
  </nav>`;
}

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

/** 사이드바가 있는 화면 (고객 · 운영자 공통 뼈대, 항목만 다르다) */
/* 상단 가로 GNB — 레이아웃_B 에디토리얼형의 nav 슬롯.
   메뉴 이름은 사이드바가 쓰던 묶음(NAV_USER·NAV_ADMIN)의 «첫 항목»을 그대로 쓴다.
   같은 목록을 두 벌로 적으면 한쪽만 고쳐져 갈라진다. */
function ednav(activeId, admin) {
  const groups = admin ? NAV_ADMIN : NAV_USER;
  const 켠묶음 = groups.find(([, items]) => items.some(([id]) => id === activeId));
  const menu = groups.map(([g, items]) => {
    const [id] = items[0];
    const 켬 = 켠묶음 && 켠묶음[0] === g;
    return `<a href="${link(id)}"${켬 ? ' class="on" aria-current="page"' : ''}>${g}</a>`;
  }).join('');
  return `<header class="ednav"><div class="ednav-in">
    <a class="logo" href="${link(admin ? 'TC-01' : 'HO-01')}"><span class="em">${SITE.mark}</span>${SITE.name}${admin ? ' <span class="t-sub" style="font-weight:500">강사</span>' : ''}</a>
    <nav class="ednav-menu" aria-label="주요 메뉴">${menu}</nav>
    <div class="ednav-util">
      <a class="btn btn-ghost btn-sm" href="${link(admin ? 'HO-01' : 'TC-01')}">${admin ? '고객 화면' : '강사센터'}</a>
      <button class="icon-btn" type="button" data-toast="새 알림이 3개 있어요" aria-label="알림">🔔</button>
      <a class="ava" href="${link('MY-01')}" aria-label="${SITE.me.name}님">${SITE.me.init}</a>
    </div>
  </div></header>`;
}

/** 목록 화면 왼쪽에 세우는 세로 카테고리 — 에디토리얼형의 list 슬롯. */
export function edrail(items, activeId) {
  return `<aside class="edrail"><div class="gl">둘러보기</div>
    ${items.map(([id, label, n]) => `<a href="${link(id)}"${id === activeId ? ' class="on" aria-current="page"' : ''}>${label}${n != null ? `<span class="n">${n}</span>` : ''}</a>`).join('')}
  </aside>`;
}

export function shell(ctx, body, o = {}) {
  /* o.rail 이 있으면 왼쪽에 세로 카테고리를 세운다(목록 화면).
     o.read 면 본문을 한 단(760px)으로 좁힌다(상세 화면).
     둘 다 없으면 그냥 넓게 쓴다. */
  const inner = o.rail
    ? `<div class="edcols">${o.rail}<div>${crumb(ctx)}${body}</div></div>`
    : `${crumb(ctx)}${o.read ? `<div class="read">${body}</div>` : body}`;
  return `<!doctype html>
<html lang="ko">
<head>${head(ctx)}</head>
<body data-page="${ctx.id}">
<div class="app-ed">
  ${ednav(ctx.id, !!o.admin)}
  <main class="edmain">
    ${inner}
    ${footer()}
  </main>
</div>
${o.after || ''}
${devPanel(ctx)}
<script src="../assets/js/app.js"></script>
</body>
</html>`;
}

/** 단독 화면 (계정) — 헤더·사이드바 없음 */
export function solo(ctx, body, o = {}) {
  return `<!doctype html>
<html lang="ko">
<head>${head(ctx)}</head>
<body data-page="${ctx.id}">
<main class="solo">
  <div class="solo-box ${o.wide ? 'solo-wide' : ''}">
    <a class="logo" href="${link('HO-01')}"><span class="em">${SITE.mark}</span>${SITE.name}</a>
    ${ctx.backTo ? `<nav class="crumb" aria-label="현재 위치"><a class="back" href="${link(ctx.backTo.pageId)}">‹ ${esc(ctx.backTo.pageName)}</a></nav>` : ''}
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

/* 강의 한 줄 요약 (가로 행) */
export const courseRow = (c, o = {}) => `<div class="row-c" style="gap:var(--gap-title)">
  ${ph('강의 썸네일', 'ph-thumb', c.id)}
  <div class="grow"><div class="t-card" style="font-size:16px">${esc(c.name)}</div>
  <p class="t-sub">${esc(c.by)} · ${c.ep}차시 · ${c.hrs}시간</p>${o.extra || ''}</div>
  ${o.right || ''}</div>`;

export const modalTpl = (id, title, body, ft, o = {}) => `<template id="${id}"><div class="modal ${o.lg ? 'modal-lg' : ''}">
  <div class="hd">${title}<button class="x" type="button" data-dismiss aria-label="닫기">✕</button></div>
  <div class="bd">${body}</div><div class="ft">${ft}</div></div></template>`;
