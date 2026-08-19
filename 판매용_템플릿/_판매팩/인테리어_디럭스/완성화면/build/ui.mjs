/* 공통 UI 조각 — 인테리어 시공 견적·시공관리
   - 색·글꼴·모서리·간격은 가이드 프리셋 01 미니멀 모노
   - 화면 뼈대(사진 히어로 + 카드 그리드 3열 · 상단 가로 GNB · 본문 왼쪽 +
     따라다니는 요약 카드)는 레이아웃 프리셋 A 사진 중심형

   조각을 여기 모아 두는 까닭: 같은 것을 화면마다 다시 적으면 반드시 갈라진다.
   ★ 이 팩의 알맹이는 compare()(비포·애프터) · gantt()(공정표) · plog()(현장 사진 일지) ·
     chkRow()(검수 체크)다. */
import { SITE, NAV, ST_CLS } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const won = (n) => n.toLocaleString('ko-KR') + '원';
export const num = (n) => n.toLocaleString('ko-KR');
function hash(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0; return Math.abs(h); }

/* 스펙팩이 정한 화면만 있으므로, 없는 화면을 가리키는 링크는 같은 메뉴의 첫 화면으로 옮긴다.
   ⚠ 이것을 빠뜨리면 «끊어진 링크»가 무더기로 생긴다. */
let PAGES = null;
export const setPages = (ids) => { PAGES = new Set(ids); };
export function toPageId(id) {
  const s = String(id);
  if (!PAGES || PAGES.has(s)) return s;
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
export function phFix(spec, px, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const hh = Math.round(px * h / w);
  const cls = ['ph', 'ph-fix', tone, o.cls || 'ph-sq', 'ph-tiny'].join(' ');
  return `<div class="${cls}" style="width:${px}px;height:${hh}px" title="이미지 영역 (${esc(what)} · 권장 ${w}×${h})">${px >= 60 ? `<span class="lb">${w}×${h}</span>` : ''}</div>`;
}
export const phCase = (seed, o = {}) => ph(['시공 사진', 800, 600], { seed, cls: 'ph-card', ...o });
export const av = (nm) => `<span class="av">${esc(String(nm).slice(0, 1))}</span>`;

/* ---------- 작은 조각 ---------- */
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
export const stBadge = (st) => badge(esc(st), ST_CLS[st] || 'b-mut');
export const stars = (r) => `<span class="stars" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;

/**
 * ⚠ 잠기는 버튼은 <a> 로 만들 수 없다 — <a> 에는 disabled 가 없다.
 * 잠글 것이 있으면(id·off) href 가 있어도 <button> 으로 만들고, 옮기는 일은 data-go 로 app.js 에 맡긴다.
 */
export const btn = (t, o = {}) => {
  const cls = `btn ${o.cls || 'btn-ghost'}${o.sm ? ' btn-sm' : ''}${o.lg ? ' btn-lg' : ''}${o.w ? ' btn-w' : ''}`;
  const 잠글것 = o.id || o.off;
  if (o.href && !잠글것) return `<a class="${cls}" href="${link(o.href)}"${o.attr || ''}>${t}</a>`;
  const go = o.href ? ` data-go="${link(o.href)}"` : '';
  return `<button class="${cls}${o.off ? ' is-off' : ''}"${o.id ? ` id="${o.id}"` : ''} type="button"${o.off ? ' disabled' : ''}${go}${o.attr || ''}>${t}</button>`;
};

export const chip = (t, on = false, extra = '') => `<button class="chip${on ? ' on' : ''}" type="button"${extra}>${esc(t)}</button>`;
export const chips = (list, onIdx = -1, o = {}) =>
  `<div class="chips">${list.map((t, i) => chip(t, Array.isArray(onIdx) ? onIdx.includes(i) : i === onIdx, o.extra || '')).join('')}</div>`;

export function tabs(list, onIdx = 0, o = {}) {
  const cls = o.pill ? 'tabs-pill' : 'tabs';
  return `<div class="${cls}">${list.map((t, i) => {
    const label = typeof t === 'string' ? t : t.label;
    const cnt = typeof t === 'object' && t.cnt != null ? `<span class="cnt">${t.cnt}</span>` : '';
    const go = typeof t === 'object' && t.go ? ` data-go="${link(t.go)}"` : '';
    const pane = typeof t === 'object' && t.pane ? ` data-pane="${t.pane}"` : '';
    return `<button class="tab${i === onIdx ? ' on' : ''}" type="button"${go}${pane}>${label}${cnt}</button>`;
  }).join('')}</div>`;
}
export const pane = (key, body, on = false) => `<div data-pane-body="${key}"${on ? '' : ' hidden'}>${body}</div>`;
/** 탭 + 몸통을 «한 상자»로 묶어 준다 — 갈라 놓는 실수를 아예 못 하게 */
export const tabBox = (list, panes, onIdx = 0, o = {}) =>
  `<div class="${o.cls || ''}">${tabs(list, onIdx, o)}<div class="mt6">${panes}</div></div>`;

export const sec = (title, body, o = {}) => `<section class="sec ${o.cls || ''}">
  ${title ? `<div class="sec-hd"><h2 class="t-sec">${title}</h2>${o.more ? `<a class="more" href="${link(o.more)}">${o.moreLabel || '전체 보기'} ›</a>` : (o.aside || '')}</div>` : ''}
  ${o.desc ? `<p class="t-sub mb4">${o.desc}</p>` : ''}
  ${body}</section>`;

export const card = (title, body, o = {}) => `<div class="card ${o.cls || ''}">
  ${title ? `<div class="card-hd"><h3 class="t-card">${title}</h3>${o.aside || ''}</div>` : ''}
  <div class="card-bd ${o.bdCls || ''}">${body}</div>
  ${o.ft ? `<div class="card-ft">${o.ft}</div>` : ''}</div>`;

export const box = (body, o = {}) => `<div class="box ${o.cls || ''}">${body}</div>`;

export const banner = (kind, ico, html, o = {}) =>
  `<div class="banner banner-${kind} ${o.cls || ''}"${o.attr || ''}>${ico ? `<span class="ico">${ico}</span>` : ''}<div class="grow">${html}</div>${o.right || ''}</div>`;

export const empty = (ico, title, msg, btns = '') => `<div class="empty">
  <div class="ico">${ico}</div><h3 class="t-sec">${title}</h3>
  ${msg ? `<p class="msg">${msg}</p>` : ''}${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;

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
    const href = !Array.isArray(r) && r.href ? ` data-href="${link(r.href)}" tabindex="0" role="link"` : '';
    return `<tr${cls}${href}>${cells.map((c) => (typeof c === 'object' ? `<td class="${c.cls || ''}">${c.t}</td>` : `<td>${c}</td>`)).join('')}</tr>`;
  }).join('');
  const tf = o.foot ? `<tfoot><tr>${o.foot.map((c) => (typeof c === 'object' ? `<td class="${c.cls || ''}">${c.t}</td>` : `<td>${c}</td>`)).join('')}</tr></tfoot>` : '';
  return `<div class="table-wrap ${o.scroll === false ? '' : 'table-scroll'}"><table class="table ${o.cls || ''}${o.fix ? ' table-fix' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody>${tf}</table></div>`;
}

export const kv = (pairs, o = {}) => `<dl class="kv ${o.cls || ''}">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
export const sumRows = (rows, total) => `${rows.map(([k, v, cls]) => `<div class="sum-row ${cls || ''}"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
  ${total ? `<div class="sum-row total"><span>${total[0]}</span><span class="price">${total[1]}</span></div>` : ''}`;

export const progress = (pct, kind) => `<div class="progress"><div class="fill ${kind || ''}" style="width:${Math.min(100, Math.max(0, pct))}%"></div></div>`;

export const timeline = (items) => `<div class="tl">${items.map((it) => `<div class="tl-item ${it.k || ''}">
  <div class="t">${it.t}</div>${it.d ? `<div class="d">${it.d}</div>` : ''}</div>`).join('')}</div>`;

export const steps = (list, onIdx) => `<div class="steps">${list.map(([t, d], i) =>
  `<div class="st ${i < onIdx ? 'done' : (i === onIdx ? 'on' : '')}">${t}${d ? `<span class="dt">${d}</span>` : ''}</div>`).join('')}</div>`;

export const accordion = (items, openIdx = -1) => `<div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">
  ${items.map((it, i) => `<div class="acc-item${(Array.isArray(openIdx) ? openIdx.includes(i) : i === openIdx) ? ' on' : ''}">
    <button class="acc-q" type="button">${it.q}<span class="mk">＋</span></button>
    <div class="acc-a">${it.a}</div></div>`).join('')}</div></div>`;

/* ---------- 폼 ---------- */
export const field = (label, input, o = {}) => `<label class="field">
  <span class="lb">${label}${o.req ? '<span class="req">*</span>' : ''}</span>
  ${input}${o.hint ? `<span class="hint">${o.hint}</span>` : ''}${o.err ? `<span class="err">${o.err}</span>` : ''}</label>`;
export const input = (o = {}) => `<input class="in ${o.cls || ''}" type="${o.type || 'text'}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.v ? ` value="${esc(o.v)}"` : ''}${o.off ? ' disabled' : ''}${o.attr || ''}>`;
export const select = (list, onIdx = 0, o = {}) => `<select class="sel"${o.attr || ''}>${list.map((t, i) => `<option${i === onIdx ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
export const textarea = (o = {}) => `<textarea class="ta"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}>${o.v ? esc(o.v) : ''}</textarea>`;
export const check = (label, o = {}) => `<label class="check${o.none ? ' none' : ''}">
  <input type="checkbox"${o.on ? ' checked' : ''}${o.attr || ''}>
  <span>${label}${o.sub ? `<span class="sub">${o.sub}</span>` : ''}</span></label>`;
export const toggle = (on = false, toastMsg = '', extra = '') => `<button class="toggle${on ? ' on' : ''}" type="button" aria-pressed="${on}"${toastMsg ? ` data-toast="${esc(toastMsg)}"` : ''}${extra}></button>`;
export const stepper = (v, o = {}) => `<div class="step">
  <button type="button" aria-label="줄이기"${o.toast ? ` data-toast="${esc(o.toast)}"` : ''}>−</button>
  <span class="v num">${v}</span>
  <button type="button" aria-label="늘리기"${o.toast ? ` data-toast="${esc(o.toast)}"` : ''}>＋</button></div>`;

/* 업로드·서명 */
export const uploadDrop = (msg, o = {}) => `<div class="upload-drop">${msg || '눌러서 사진을 올려 주세요 (여러 장 가능)'}</div>
  <div class="upload-thumbs">${(o.seed || []).map((s, i) => `<div class="u-item ph t${(i % 5) + 1}"><button type="button" aria-label="지우기">✕</button></div>`).join('')}</div>`;
export const sigPad = (o = {}) => `<div class="sig-pad${o.signed ? ' signed' : ''}">${o.signed ? `(서명완료) ${o.signed}<button class="btn btn-ghost btn-sm sig-clear" type="button">지우기</button>` : '여기를 눌러 서명해 주세요'}</div>`;

/* ============================================================
   ★ 시공 사례 카드 — 사진이 4:3 을 채우고 아래에 평수·지역·기간·금액
   ============================================================ */
export function caseCard(c, o = {}) {
  return `<a class="item" href="${link(o.href || 'CS-02')}">
    <div class="thumb">${phCase(c.id)}
      ${o.badgeText ? `<div class="on-thumb">${badge(o.badgeText, 'b-solid')}</div>` : ''}
    </div>
    <div class="bd">
      <div class="nm">${esc(c.nm)}</div>
      <div class="meta">${c.pyeong}평 · ${esc(c.area)} · 공사 ${c.days}일</div>
      <div class="price"><span class="d">${esc(c.price)}</span></div>
    </div></a>`;
}

/* ============================================================
   ★ 비포·애프터 손잡이 — 시공사례의 주인공
   input[type=range] 를 겹쳐 두고 app.js 가 --cp 변수를 옮긴다.
   ============================================================ */
export function compare(seed, o = {}) {
  const id = 'cp-' + hash(seed + (o.idx || ''));
  return `<div class="compare" style="--cp:50%">
    <div class="cp-before">${ph(['시공 전 사진', 800, 600], { seed: seed + '-before', cls: 'ph-card' })}</div>
    <div class="cp-after">${ph(['시공 후 사진', 800, 600], { seed: seed + '-after', cls: 'ph-card' })}</div>
    <div class="cp-line"></div>
    <span class="cp-tag before">BEFORE</span>
    <span class="cp-tag after">AFTER</span>
    <div class="cp-handle" aria-hidden="true">↔</div>
    <input class="cp-range" type="range" min="0" max="100" value="50" aria-label="시공 전·후 비교 손잡이" id="${id}">
  </div>`;
}

/* ============================================================
   ★ 공정표(간트) — pr1·ow3, 이 팩의 첫 번째 알맹이
   ============================================================ */
export function gantt(rows, o = {}) {
  const totalDays = o.totalDays || 22;
  const todayDay = o.todayDay != null ? o.todayDay : 14;
  const pct = (d) => Math.min(100, Math.max(0, (d / totalDays) * 100));
  const bars = rows.map((r) => {
    const left = pct(r.from);
    const width = Math.max(pct(r.to - r.from + 1), 100 / totalDays);
    const detail = o.editable ? '' : ` data-detail="${r.code}"`;
    return `<div class="gantt-row">
      <div class="gantt-lb">${esc(r.nm)}${r.st === 'late' ? badge('밀림', 'b-dan') : ''}</div>
      <div class="gantt-track">
        <div class="gantt-bar ${r.st}" style="left:${left}%;width:${width}%"${detail} title="${esc(r.nm)}">${esc(r.nm)}</div>
      </div>
    </div>`;
  }).join('');
  const todayLeft = pct(todayDay);
  return `<div class="gantt"><div class="gantt-in" style="position:relative">
    <div class="gantt-today" style="left:calc(132px + (100% - 132px) * ${todayLeft / 100})"></div>
    ${bars}
  </div></div>
  ${!o.editable ? rows.map((r) => `<div class="gantt-detail" data-detail="${r.code}" hidden>
    <b>${esc(r.nm)}</b> · 담당 ${esc(r.team)} · ${r.from}일차~${r.to}일차
    ${r.today ? `<p class="t-sub mt2">${esc(r.today)}</p>` : '<p class="t-sub mt2">아직 시작 전입니다.</p>'}
  </div>`).join('') : ''}`;
}

/* ============================================================
   ★ 현장 사진 일지 — pr3, 두 번째 알맹이
   ============================================================ */
export function plog(days) {
  return days.map((d, i) => `<div class="plog-day${i > 1 ? ' closed' : ''}">
    <div class="plog-hd">
      <div>
        <span class="t">${esc(d.date)} · 공사 ${d.dayN}일째 · ${esc(d.process)}</span>
        <span class="n"> · 사진 ${d.n}장</span>
      </div>
      <span class="mk">▾</span>
    </div>
    <div class="plog-grid">
      ${Array.from({ length: Math.min(d.n, 8) }).map((_, j) => `<div class="plog-shot">${ph(['현장 사진', 800, 600], { seed: d.date + j, cls: 'ph-card' })}
        <span class="tag">${d.spaces[j % d.spaces.length]}</span></div>`).join('')}
    </div>
    ${d.note ? `<p class="t-sub mt3">${esc(d.note)}</p>` : ''}
  </div>`).join('');
}

/* ============================================================
   ★ 준공 검수·하자 체크 — pr5, 세 번째 알맹이
   ============================================================ */
export function chkRow(item, desc) {
  return `<div class="chk-row">
    <div><div class="nm">${esc(item)}</div>${desc ? `<div class="ds">${esc(desc)}</div>` : ''}</div>
    <div class="go">
      <button class="btn btn-ghost btn-sm" type="button" data-chk="ok">괜찮음</button>
      <button class="btn btn-dan btn-sm" type="button" data-chk="bad">문제 있음</button>
    </div>
    <div class="chk-sub" hidden>${uploadDrop('사진을 올려 주세요')}
      <div class="field mt3"><span class="lb">메모</span>${textarea({ ph: '어떤 문제인지 적어 주세요' })}</div>
      <div class="field mt2"><span class="lb">급한 정도</span>${select(['보통', '급함', '천천히'], 0)}</div>
    </div>
  </div>`;
}

/* ---------- 화면 뼈대 ---------- */
export const pageHd = (title, sub, aside) => `<div class="page-hd">
  <div><h1 class="t-page">${title}</h1>${sub ? `<p class="t-sub">${sub}</p>` : ''}</div>
  ${aside ? `<div class="btns">${aside}</div>` : ''}</div>`;

export const detail2 = (main, aside) => `<div class="split-r"><div>${main}</div><div class="sticky stack" style="gap:var(--sp-block)">${aside}</div></div>`;
export const listPage = (filter, body) => `<div class="split-l"><div class="sticky">${filter}</div><div>${body}</div></div>`;
export const stickBar = (left, right) => `<div class="stick"><div class="stick-in"><div>${left}</div><div class="btns">${right}</div></div></div>`;
/* solo — 로그인·회원가입처럼 «묻는 게 몇 줄뿐»인 화면용 가운데 상자(420px).
   ⚠ 다 끝난 뒤 «앞서 고른 것을 요약해 보여 주는» 완료 화면에는 쓰지 않는다.
     보여 줄 게 많은데 420px 에 가두면 좁은 기둥 하나만 남고 화면이 텅 빈다
     (2026-08-17 사장님 지적). 그런 화면은 아래 done() 을 쓴다. */
export const solo = (title, sub, body) => `<div class="solo-wrap"><div class="solo-card">
  <h1 class="t-sec mb2">${title}</h1>${sub ? `<p class="t-sub mb6">${sub}</p>` : ''}${body}</div></div>`;

/** 완료 화면 — 끝났다는 표시 + 요약을 제 폭으로 펴고, 다음에 할 일을 오른쪽에 붙인다. */
export const done = (title, sub, main, aside) => `${pageHd(`<span class="ok-mark" aria-hidden="true">✓</span>${title}`, sub)}
${detail2(main, aside)}`;

export const modal = (id, title, body, ft) => `<template id="${id}"><div class="modal">
  <div class="m-hd"><h3 class="t-card">${title}</h3><button class="x" type="button" data-dismiss aria-label="닫기">✕</button></div>
  <div class="m-bd">${body}</div>${ft ? `<div class="m-ft">${ft}</div>` : ''}</div></template>`;

/** 현장 관리(업체) — 좌측 사이드바 뼈대 */
export function ownerShell(activeRef, body) {
  const items = [
    ['OW-01', '대시보드'], ['OW-02', '견적 요청함'], ['OW-03', '현장 상세'],
    ['OW-04', '자재·원가'], ['OW-05', '청구·수금'], ['OW-06', '일정 캘린더'],
    ['OW-07', '업체 정보'],
  ];
  return `<div class="owner-shell">
    <nav class="owner-side">${items.map(([id, nm]) => `<a class="${id === activeRef ? 'on' : ''}" href="${link(id)}">${nm}</a>`).join('')}</nav>
    <div class="owner-main">${body}</div>
  </div>`;
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
        <dt>전체</dt><dd><span class="lks"><a href="../index.html">🗂 화면 목록으로</a></span></dd>
      </dl>
    </div>
    <button class="dev-btn" type="button">화면 정보</button>
  </div>`;
}

/** 한 장의 HTML 을 완성한다. */
export function shell(ctx, body, o = {}) {
  const back = ctx.backTo
    ? `<a class="back" href="${link(ctx.backTo.pageId || ctx.backTo)}">‹ ${esc(ctx.backTo.pageName || '뒤로')}</a>`
    : '';
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ctx.pageName)} · ${SITE.name}</title>
<link rel="stylesheet" href="../assets/css/base.css">
</head>
<body>
<header class="gnb"><div class="gnb-in">
  <a class="logo" href="${link('HO-01')}"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
  <nav class="gnb-nav" aria-label="주 메뉴">${NAV.map(([t, to]) => `<a href="${link(to)}">${t}</a>`).join('')}</nav>
  <div class="gnb-right">
    <a class="btn btn-ghost btn-sm" href="${link('OW-01')}">업체 관리자</a>
    <a class="btn btn-pri btn-sm" href="${link('AU-01')}">로그인</a>
  </div>
</div></header>
${o.hero || ''}
<main class="main">${o.bare ? body : `<div class="wrap">${back}${body}</div>`}</main>
${o.stick || ''}
${devPanel(ctx)}
<script src="../assets/js/app.js"></script>
</body></html>`;
}
