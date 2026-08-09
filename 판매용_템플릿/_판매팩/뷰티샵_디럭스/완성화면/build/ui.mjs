/* 공통 UI 컴포넌트
   - 색·글꼴·모서리는 가이드 프리셋 01 코럴 선셋
   - 화면 뼈대(2단 헤더·사진 모자이크·매거진 2열·상세 하단 고정 바)는 레이아웃 프리셋 A */
import { SITE, NAV, NAV_OWNER, CATS, ST_CLS } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const won = (n) => n.toLocaleString('ko-KR') + '원';
export const num = (n) => n.toLocaleString('ko-KR');
/* 화면 링크.
   만들기 함수는 프리미엄(3뎁스) 화면ID로 쓰여 있는데(HO0101), 디럭스가 내보내는
   파일 이름은 2뎁스 ID(HO-01)다. 그대로 두면 링크가 전부 없는 파일을 가리킨다.
   여기서 옮겨 준다. 3뎁스 상태 화면(HO0102)은 디럭스에 없으니 그 화면의
   기본(HO-01)으로 보내고, 그마저 없으면 그 메뉴의 첫 화면으로 보낸다. */
let PAGES = null; // 이 사이트에 실제로 있는 화면들 (generate.mjs가 넣어 준다)
export const setPages = (ids) => { PAGES = new Set(ids); };

export function toPageId(id) {
  const m = /^([A-Z]{2})(\d{2})\d{2}$/.exec(String(id));
  if (!m) return id; // 이미 2뎁스 ID
  const want = `${m[1]}-${m[2]}`;
  if (!PAGES || PAGES.has(want)) return want;
  const first = [...PAGES].find((p) => p.startsWith(`${m[1]}-`));
  return first || want;
}

export const link = (id) => `${toPageId(id)}.html`;
export const min2h = (m) => (m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''}` : `${m}분`);
function hash(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0; return Math.abs(h); }

/* ---------- 이미지 자리 ----------
   스펙팩 imagePlaceholder 규칙:
   테마 색으로 칠하지 않고 옅은 파스텔 한 톤 + 1px 테두리.
   무엇이 들어갈 자리인지와 권장 크기를 적고, 적어 둔 비율을 실제로 지킨다. */
export function ph(spec, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const cls = ['ph', tone, o.cls || '', o.tiny ? 'ph-tiny' : ''].join(' ');
  const style = `aspect-ratio:${w}/${h}${o.style ? ';' + o.style : ''}`;
  const label = o.tiny
    ? `<span class="lb">${w}×${h}</span>`
    : `<span class="lb">이미지 영역 (${esc(what)} · <span class="sz">권장 ${w}×${h}</span>)</span>`;
  return `<div class="${cls}" style="${style}">${label}${o.after || ''}</div>`;
}
/** 크기가 고정된 자리 — 목록·행 안에서 flex 가 잡아당겨 늘어나지 않게 한다 */
export function phFix(spec, px, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const hh = Math.round(px * h / w);
  const cls = ['ph', 'ph-fix', tone, o.cls || 'ph-sq', 'ph-tiny'].join(' ');
  /* 자리가 너무 작아 크기 글자도 안 들어가면 비워 둔다 — 무엇이 들어갈 자리인지는 title 로 남긴다 */
  const label = px >= 52 && hh >= 26 ? `<span class="lb">${w}×${h}</span>` : '';
  return `<div class="${cls}" style="width:${px}px;height:${hh}px" title="이미지 영역 (${esc(what)} · 권장 ${w}×${h})">${label}</div>`;
}
/** 원형(프로필) — 정사각 비율을 지킨다 */
export const phAva = (px, seed = 'p') => phFix(['프로필', 400, 400], px, { cls: 'ph-round', seed });

/* ---------- 지도 자리 ---------- */
export function map(pins = [], o = {}) {
  const p = pins.map((x, i) => `<button class="pin${x.free ? ' free' : ''}${x.on ? ' on' : ''}" style="left:${x.x}%;top:${x.y}%" data-name="${esc(x.nm || '')}" type="button">${x.n || i + 1}</button>`).join('');
  return `<div class="map ${o.cls || 'map-16'}">${p}<span class="lb">${esc(o.lb || '지도 영역 (매장 위치 · 실제 지도 서비스 연결 필요)')}</span></div>`;
}

/* ---------- 조각 ---------- */
export const stars = (r) => `<span class="stars" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
export const rateLine = (r, rv) => `${stars(r)} <b>${r.toFixed(1)}</b> <span class="muted">(${num(rv)})</span>`;
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
export const stBadge = (st) => badge(st, ST_CLS[st] || 'b-mut');

export const btn = (t, o = {}) =>
  o.href ? `<a class="btn ${o.cls || 'btn-ghost'}" href="${link(o.href)}"${o.attr || ''}>${t}</a>`
    : `<button class="btn ${o.cls || 'btn-ghost'}"${o.id ? ` id="${o.id}"` : ''} type="button"${o.off ? ' disabled' : ''}${o.attr || ''}>${t}</button>`;

export const chip = (t, on = false, extra = '') => `<button class="chip${on ? ' on' : ''}" type="button" ${extra}>${t}${on && extra.indexOf('data-go') < 0 ? ' <span class="x">✕</span>' : ''}</button>`;
export const chips = (list, onIdx = -1, o = {}) => `<div class="chips">${list.map((t, i) => chip(t, Array.isArray(onIdx) ? onIdx.includes(i) : i === onIdx, o.extra || '')).join('')}</div>`;

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

export const sec = (title, body, o = {}) => `<section class="sec">
  ${title ? `<div class="sec-hd"><h2 class="t-sec">${title}</h2>${o.more ? `<a class="more" href="${link(o.more)}">${o.moreLabel || '전체 보기'} ›</a>` : (o.aside || '')}</div>` : ''}
  ${o.desc ? `<p class="t-sub mb4">${o.desc}</p>` : ''}
  ${body}</section>`;

export const card = (title, body, o = {}) => `<div class="card ${o.cls || ''}">
  ${title ? `<div class="card-hd"><h3 class="t-card">${title}</h3>${o.aside || ''}</div>` : ''}
  <div class="card-bd ${o.bdCls || ''}">${body}</div>
  ${o.ft ? `<div class="card-ft">${o.ft}</div>` : ''}</div>`;

export const banner = (kind, ico, html, o = {}) =>
  `<div class="banner banner-${kind} ${o.cls || ''}">${ico ? `<span class="ico">${ico}</span>` : ''}<div class="grow">${html}</div>${o.right || ''}</div>`;

/* 빈 화면 — 큰 이모지 + 친근한 문구 + 큰 primary 버튼 */
export const empty = (ico, title, msg, btns = '') => `<div class="empty">
  <div class="ico">${ico}</div><h3 class="t-sec">${title}</h3>
  ${msg ? `<p class="msg">${msg}</p>` : ''}${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;

export function table(head, rows, o = {}) {
  const th = head.map((h) => `<th${h.w ? ` style="width:${h.w}"` : ''}>${h.t != null ? h.t : h}</th>`).join('');
  const tr = rows.map((r) => `<tr class="${r.cls || ''}">${(r.cells || r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  const tf = o.foot ? `<tfoot><tr>${o.foot.map((c) => `<td>${c}</td>`).join('')}</tr></tfoot>` : '';
  return `<div class="table-wrap ${o.scroll === false ? '' : 'table-scroll'}"><table class="table ${o.fix ? 'table-fix' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody>${tf}</table></div>`;
}

export const kv = (pairs) => `<dl class="kv">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
export const sumRows = (rows, total) => `${rows.map(([k, v, cls]) => `<div class="sum-row ${cls || ''}"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
  ${total ? `<div class="sum-row total"><span>${total[0]}</span><span class="price">${total[1]}</span></div>` : ''}`;

export const accordion = (items, openIdx = -1) => `<div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">
  ${items.map((it, i) => `<div class="acc-item${(Array.isArray(openIdx) ? openIdx.includes(i) : i === openIdx) ? ' on' : ''}">
    <button class="acc-q" type="button">${it.q}<span class="mk">＋</span></button>
    <div class="acc-a">${it.a}</div></div>`).join('')}</div></div>`;

export const stat = (n, l, o = {}) => `<div class="stat ${o.cls || ''}">${o.ic ? `<div class="ic">${o.ic}</div>` : ''}
  <div class="n">${n}</div><div class="l">${l}</div>${o.d ? `<div class="d">${o.d}</div>` : ''}</div>`;

export const progress = (pct, acc) => `<div class="progress"><div class="fill ${acc ? 'acc' : ''}" style="width:${pct}%"></div></div>`;

export const stepbar = (list, onIdx) => `<div class="stepbar">${list.map((s, i) =>
  `<span class="s ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><span class="n">${i + 1}</span>${s}</span>${i < list.length - 1 ? '<span class="sep">›</span>' : ''}`).join('')}</div>`;

export const hsteps = (list, onIdx) => `<div class="hsteps">${list.map((s, i) =>
  `<div class="st ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><div class="dot">${i < onIdx ? '✓' : i + 1}</div>${s}</div>`).join('')}</div>`;

export const skCard = () => `<div class="mcard"><div class="sk sk-ph"></div><div class="bd">
  <div class="sk sk-line" style="width:38%"></div><div class="sk sk-line"></div><div class="sk sk-line" style="width:66%"></div>
  <div class="sk sk-line mt2" style="width:44%;height:20px"></div></div></div>`;

export const toastEl = (msg, act = '', kind = '') => `<div class="toast ${kind === 'ok' ? 'toast-ok' : ''}">
  <span>${msg}</span><span class="act" data-close=".toast">${act || '닫기'}</span></div>`;

const modalInner = (title, body, ft, o = {}) => `<div class="modal ${o.lg ? 'modal-lg' : ''}">
  <div class="hd">${title}</div><div class="bd">${body}</div><div class="ft">${ft}</div></div>`;
/** 화면에 바로 떠 있는 모달 (상태 화면용) */
export const modalEl = (title, body, ft, o = {}) => `<div class="dim">${modalInner(title, body, ft, o)}</div>`;
/** 버튼 data-modal 로 열리는 모달 템플릿 */
export const modalTpl = (id, title, body, ft, o = {}) => `<template id="${id}">${modalInner(title, body, ft, o)}</template>`;
/** 하단 시트 */
export const sheetEl = (body) => `<div class="dim" style="align-items:flex-end;padding:0"><div class="sheet"><div class="grip"></div><div style="padding:0 24px 28px">${body}</div></div></div>`;

/* 별점 입력 */
export const rateIn = (label, v = 0) => `<div class="rate-in"><span class="lb">${label}</span>
  <span class="st">${[1, 2, 3, 4, 5].map((i) => `<b class="${i <= v ? 'on' : ''}">${i <= v ? '★' : '☆'}</b>`).join('')}</span>
  <span class="v">${v ? v + '점' : '눌러서 매겨주세요'}</span></div>`;

/* 별점 분포 */
export const rateSummary = (dist, avg, total, items = []) => `<div class="row gap6 wrap-row" style="align-items:center">
  <div class="center none" style="min-width:132px"><div class="price-lg pri">${avg}</div>${stars(avg)}<div class="t-sub">리뷰 ${num(total)}개</div></div>
  <div class="grow" style="min-width:220px">${dist.map((d) => `<div class="bar-row"><span class="muted">${d.s}점</span><span class="bar"><i style="width:${Math.round(d.n / total * 100)}%"></i></span><span class="muted right">${num(d.n)}</span></div>`).join('')}</div>
  ${items.length ? `<div class="none" style="min-width:150px">${items.map(([k, v]) => `<div class="row-b" style="font-size:14px;padding:4px 0"><span class="muted">${k}</span><b>${v.toFixed(1)}</b></div>`).join('')}</div>` : ''}
</div>`;

/* 리뷰 카드 */
export const review = (r, o = {}) => `<div class="review">
  <div class="row-b wrap-row"><div class="who"><span class="ava">${esc(r.init)}</span><b style="color:var(--text)">${esc(r.who)}</b> · ${r.date}</div>
  <span>${stars(r.rate)}</span></div>
  <div class="badges mt2">${badge(r.menu, 'b-line')}${r.dz ? badge(r.dz, 'b-line') : ''}</div>
  <p class="txt">${esc(r.txt)}</p>
  ${r.pics ? `<div class="pics">${Array.from({ length: r.pics }, (_, i) => phFix(['리뷰 사진', 800, 800], 88, { seed: r.who + i })).join('')}</div>` : ''}
  <div class="row-c mt3"><button class="btn btn-ghost btn-sm" type="button" data-toast="도움이 됐어요를 눌렀어요">👍 도움이 됐어요 ${r.help}</button>
  ${o.report ? '<button class="btn btn-ghost btn-sm" type="button" data-toast="신고가 접수됐어요">신고</button>' : ''}</div>
  ${r.reply ? `<div class="reply"><b>매장 답글</b> · ${r.replyAt}<br>${esc(r.reply)}</div>` : ''}</div>`;

/* ---------- 매장 카드 (매거진 2열 — 레이아웃 A) ---------- */
export function shopCard(s, o = {}) {
  const cls = ['mcard', o.dim ? 'is-off' : ''].join(' ');
  return `<div class="${cls}" data-href="${link(o.href || 'SE0401')}" tabindex="0">
  <div class="top">
    ${o.noHeart ? '' : `<button class="heart${o.faved ? ' on' : ''}" type="button" aria-label="관심 매장">${o.faved ? '♥' : '♡'}</button>`}
    ${o.ribbon ? `<span class="ribbon">${o.ribbon}</span>` : ''}
    ${ph(['매장 대표', 1200, 900], { seed: s.id, cls: 'ph-flat' })}
    <div class="over">
      <div class="tags">${(o.tags || s.tags).map((t) => badge(t, o.hotTag === t ? 'hot' : '')).join('')}</div>
      <div class="nm">${esc(s.nm)}</div>
    </div>
  </div>
  <div class="bd">
    <div class="row-b"><span class="t-sub">${esc(s.area)}</span><span>${rateLine(s.rate, s.rv)}</span></div>
    <p class="desc">${esc(s.desc)}</p>
    ${o.note || ''}
    <div class="foot">
      <div><div class="t-sub">${o.priceLabel || '대표 시술 최저가'}</div><div class="price">${won(s.from)}~</div></div>
      ${o.right || (s.open ? badge(`가장 빠른 예약 ${s.soon}`, 'b-pri') : badge('오늘 예약 마감', 'b-mut'))}
    </div>
  </div></div>`;
}
export const shopCards = (list, o = {}) => list.map((s, i) => shopCard(s, typeof o === 'function' ? o(s, i) : o)).join('');

/* 작은 매장 카드 (캐러셀·추천) */
export const shopSmall = (s, o = {}) => `<a class="scard" href="${link(o.href || 'SE0401')}">
  ${ph(['매장 대표', 1200, 900], { seed: s.id + 's', cls: 'ph-flat' })}
  <div class="bd">
    <div class="nm">${esc(s.nm)}</div>
    <div class="meta">${esc(s.area)} · ${stars(s.rate)} ${s.rate.toFixed(1)}</div>
    ${o.note || ''}
    <div class="foot"><span class="price">${won(s.from)}~</span></div>
  </div></a>`;

/* 매장 한 줄 요약 (예약·마이 화면용) */
export const shopRow = (s, o = {}) => `<div class="hcard ${o.cls || ''}">
  ${phFix(['매장 대표', 1200, 900], 116, { seed: s.id + 'r' })}
  <div class="grow">
    ${o.top || ''}
    <div class="t-card" style="font-size:16px">${esc(s.nm)}</div>
    <p class="t-sub">${o.sub || s.area}</p>
    ${o.extra || ''}</div>
  ${o.right ? `<div class="none right">${o.right}</div>` : ''}</div>`;

/* 디자이너 카드 */
export const dzCard = (d, o = {}) => `<div class="hcard ${d.off || o.dim ? 'is-off' : ''} ${o.cls || ''}">
  ${phAva(72, d.id)}
  <div class="grow">
    <div class="row-c wrap-row"><b style="font-size:16px">${esc(d.nm)}</b><span class="t-sub">${d.rank}</span>
      ${o.badge || (d.off ? badge('휴직', 'b-mut') : badge(d.load, d.load === '여유' ? 'b-ok' : d.load === '보통' ? 'b-line' : 'b-warn'))}</div>
    <div class="t-sub mt1">${stars(d.rate)} ${d.rate.toFixed(1)} (${d.rv}) · ${esc(d.career)}</div>
    <div class="badges mt2">${d.tags.map((t) => badge(t, 'b-line')).join('')}</div>
    ${o.extra || ''}
  </div>
  <div class="none right">
    <div class="t-sub">지명료</div><b>${d.fee ? won(d.fee) : '없음'}</b>
    ${o.right || ''}
  </div></div>`;

/* 시술 메뉴 행 */
export const menuRow = (m, o = {}) => `<div class="list-row ${o.cls || ''}">
  ${phFix(['시술 대표', 1200, 900], 84, { seed: m.id })}
  <div class="grow">
    <div class="row-c wrap-row"><b>${esc(m.nm)}</b>${m.opt ? badge('옵션 선택', 'b-line') : ''}${o.badge || ''}</div>
    <p class="t-sub">${esc(m.desc)}</p>
    <div class="t-sub mt1">약 ${min2h(m.min)}</div>
  </div>
  <div class="none right"><div class="price">${won(m.price)}</div>${o.right || ''}</div></div>`;

/* 캘린더 — 2026년 9월(1일 화요일) */
export function calendar(o = {}) {
  const sel = o.sel === undefined ? 12 : o.sel;
  const closed = o.closed || [7, 14, 21, 28];       // 매주 월요일 정기 휴무
  const full = o.full || [13, 19, 20, 26];
  const past = o.past || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];   // 오늘은 9월 12일
  const marks = o.marks || [];
  const start = 2; // 2026-09-01 은 화요일
  let cells = '';
  for (let i = 0; i < start; i++) cells += '<span></span>';
  for (let d = 1; d <= 30; d++) {
    const isClosed = closed.includes(d), isFull = full.includes(d), isPast = past.includes(d);
    const off = isClosed || isFull || isPast;
    const cls = ['cal-d', off ? 'off' : '', isFull ? 'full' : '', d === sel && !off ? 'sel' : '', marks.includes(d) ? 'mark' : ''].join(' ');
    const why = isPast ? '지난 날짜예요' : isClosed ? '매장 정기 휴무일이에요' : '이 날은 예약이 모두 찼어요';
    const note = isPast ? '' : isClosed ? '휴무' : isFull ? '마감' : (o.note ? o.note(d) : '예약 가능');
    cells += `<button class="${cls}" type="button"${off ? ` disabled aria-disabled="true" data-why="${why}"` : ''}>${d}<span class="p">${note}</span></button>`;
  }
  return `<div class="cal">
    <div class="cal-hd"><button class="btn btn-ghost btn-sm cal-mv" type="button" data-mv="-1">‹</button><b class="cal-m">${o.month || '2026년 9월'}</b><button class="btn btn-ghost btn-sm cal-mv" type="button" data-mv="1">›</button></div>
    <div class="cal-grid">${['일', '월', '화', '수', '목', '금', '토'].map((d) => `<span class="dow">${d}</span>`).join('')}${cells}</div>
    <div class="row-c mt4 t-sub" style="gap:16px;flex-wrap:wrap"><span>진하게 = 예약 가능</span><span class="muted">취소선 = 휴무·마감</span>${o.legend || ''}</div>
  </div>`;
}

/* 시간 슬롯 — 30분 단위 */
export function slots(o = {}) {
  const list = o.list || ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
  const full = o.full || ['11:00', '11:30', '13:00', '15:00', '15:30', '18:00'];
  const dim = o.dim || [];
  const sel = o.sel || '14:00';
  return `<div class="slots">${list.map((t) => {
    const isFull = full.includes(t), isDim = dim.includes(t);
    const cls = ['slot', isFull ? 'full' : '', isDim ? 'dim' : '', t === sel && !isFull && !isDim ? 'on' : ''].join(' ');
    const why = isFull ? '이미 예약이 찬 시간이에요' : isDim ? `선택한 시술은 ${o.needMin || 180}분이 연속으로 비어야 해요` : '';
    const left = isFull ? '마감' : isDim ? '연속 불가' : (o.left ? o.left(t) : '1자리');
    return `<button class="${cls}" type="button"${isFull || isDim ? ` data-why="${why}"` : ''}>${t}<span class="left">${left}</span></button>`;
  }).join('')}</div>`;
}

/* ---------- 헤더 / 푸터 ---------- */
function gnb(activeId, o = {}) {
  const owner = !!o.owner;
  const nav = (owner ? NAV_OWNER : NAV).map((n) => `<a href="${link(n.id)}"${activeId && n.id.slice(0, 2) === activeId.slice(0, 2) ? ' class="on"' : ''}>${n.label}</a>`).join('');
  const util = owner
    ? `<a class="btn btn-ghost btn-sm" href="${link('MG0101')}">살롱 드 코랄</a>
       <a class="icon-btn" href="${link('ST0501')}" aria-label="접수 대기">🔔<span class="dot">3</span></a>`
    : (o.logged
      ? `<a class="btn btn-ghost btn-sm" href="${link('AC0101')}">유진아님</a>
         <a class="icon-btn" href="${link('MY0101')}" aria-label="내 예약">📅${o.noti ? `<span class="dot">${o.noti}</span>` : ''}</a>`
      : `<a class="btn btn-ghost btn-sm" href="${link('AU0101')}">로그인</a>
         <a class="btn btn-primary btn-sm" href="${link('AU0201')}">회원가입</a>`);

  /* 2단 헤더 — 위 GNB, 아래 카테고리 줄 */
  const catRow = o.noCat ? '' : `<div class="catbar"><div class="catbar-in">
    ${CATS.map((c) => `<a href="${link('SE0101')}"${o.cat === c.key ? ' class="on"' : ''}><span>${c.ic}</span>${c.nm}</a>`).join('')}
    <span class="sep"></span>
    <a href="${link(owner ? 'PT0101' : 'PT0201')}">${owner ? '고객 화면 보기' : '매장 입점'}</a>
    <a href="${link('SE0301')}">지도로 찾기</a>
  </div></div>`;

  return `<header class="gnb">
  ${o.topbar || ''}
  <div class="gnb-in">
    <a class="logo" href="${link(owner ? 'PT0101' : 'HO0101')}"><span class="mark">${SITE.mark}</span>${SITE.name}${owner ? '<span class="badge b-pri" style="margin-left:4px">매장</span>' : ''}</a>
    <nav class="gnb-nav">${nav}</nav>
    <div class="gnb-util">${util}</div>
  </div>
  ${catRow}</header>`;
}

const footer = () => `<footer class="ft"><div class="ft-in">
  <div class="ft-cols">
    <div>
      <div class="logo mb3"><span class="mark">${SITE.mark}</span>${SITE.name}</div>
      <p class="t-sub">${SITE.company}<br>${SITE.biz}</p>
      <p class="t-sub mt3">당사는 통신판매중개자로서 거래 당사자가 아니며, 예약·시술에 대한 책임은 각 매장에 있습니다.</p>
    </div>
    <div><h4>서비스</h4><ul>
      <li><a href="${link('SE0101')}">매장 탐색</a></li><li><a href="${link('SE0301')}">지도로 찾기</a></li>
      <li><a href="${link('MY0101')}">내 예약</a></li><li><a href="${link('RV0301')}">내 리뷰</a></li>
      <li><a href="${link('AC0201')}">쿠폰·적립금</a></li></ul></div>
    <div><h4>매장 사장님</h4><ul>
      <li><a href="${link('PT0201')}">매장 입점 신청</a></li><li><a href="${link('PT0101')}">매장 홈</a></li>
      <li><a href="${link('MG0101')}">시술 메뉴 관리</a></li><li><a href="${link('SA0101')}">정산 내역</a></li>
      <li><a href="../index.html">전체 화면 목록</a></li></ul></div>
    <div><h4>고객센터</h4>
      <div class="tel">${SITE.tel}</div>
      <p class="t-sub">${SITE.hours}</p>
      <div class="btns mt3"><span class="btn btn-ghost btn-sm">💬 카카오톡 상담</span><span class="btn btn-ghost btn-sm">📱 앱 다운로드</span></div>
      <div class="sns mt4"><span>IG</span><span>YT</span><span>BL</span><span>FB</span></div>
    </div>
  </div>
  <div class="ft-bot">
    <span>© 2026 ${SITE.name}. 이 사이트는 기획 검토용 프로토타입입니다.</span>
    <span>이용약관 · 개인정보처리방침 · 취소·환불 규정</span>
  </div></div></footer>`;

/* ---------- 페이지 셸 ---------- */

/* 가로로 넘치는 줄에 좌우 화살표를 붙인다.
   아래 스크롤바만 있으면 넘길 게 있다는 걸 모르고 지나친다.
   호출부가 여럿이라 여기서 한 번에 감싼다 — 여는 태그부터 짝이 맞는
   </div> 까지 세어서 찾으므로 안이 깊어도 어긋나지 않는다(2026-08-06). */
function wrapCarousels(html) {
  const OPEN = /<div class="carousel[^"]*"[^>]*>/g;
  let out = '', last = 0, m;
  while ((m = OPEN.exec(html))) {
    if (html.slice(Math.max(0, m.index - 220), m.index).includes('class="car"')) continue;
    let depth = 1, i = m.index + m[0].length;
    while (depth > 0 && i < html.length) {
      const o = html.indexOf('<div', i), c = html.indexOf('</div>', i);
      if (c < 0) break;
      if (o >= 0 && o < c) { depth++; i = o + 4; } else { depth--; i = c + 6; }
    }
    out += html.slice(last, m.index)
      + '<div class="car"><button class="car-nav prev" type="button" aria-label="이전">\u2039</button>'
      + html.slice(m.index, i)
      + '<button class="car-nav next" type="button" aria-label="다음">\u203a</button></div>';
    last = i;
    OPEN.lastIndex = i;
  }
  return out + html.slice(last);
}

export function shell(ctx, body, o = {}) {
  const spec = `<div class="dev"><div class="spec">
    <div class="id">${ctx.id}</div><div class="nm">${esc(ctx.pageName)}</div>
    <div class="fd">${esc(ctx.funcDef)}</div>
    ${ctx.buttons && ctx.buttons.length ? `<div class="lk">${ctx.buttons.map((b) => `<a href="${link(b.targetPageId)}">${esc(b.label)} ›</a>`).join('')}</div>` : ''}
    <div class="lk"><a href="../index.html">전체 화면 목록</a></div>
  </div>
  <a class="dev-list" href="../index.html">☰ 화면 목록</a>
  <button class="dev-btn" type="button">${ctx.id} 화면 정보</button></div>`;

  const stateBar = o.state ? `<div class="state-bar"><div class="in"><span class="tag">상태</span><b>${esc(o.state)}</b>
    <span class="muted">${esc(ctx.funcDef)}</span></div></div>` : '';

  /* 뒤로가기 — 스펙팩이 화면마다 정해 준다(backTo).
     메뉴의 첫 화면에는 없다. 나갈 길이 GNB라서. */
  /* 사이드바에 나란히 올라와 있는 화면끼리는 형제다 — 탭과 같다.
     그 안을 오가는 길이 이미 사이드바인데 뒤로가기까지 두면,
     같은 줄에 있는 화면인데 어떤 건 있고 어떤 건 없어진다(2026-08-06). */
  const inSideNav = /class="side"/.test(body)
    && new RegExp(`href="${ctx.id}\\.html"[^>]*class="on"`).test(body);
  const back = ctx.backTo && !inSideNav
    ? `<div class="backbar"><div class="in">
        <a class="back" href="${link(ctx.backTo.pageId)}">‹ ${esc(ctx.backTo.pageName)}</a>
        <span class="crumb">${esc(ctx.menu)} <i>›</i> ${esc(ctx.pageName)}</span>
      </div></div>`
    : '';

  const head = o.solo ? '' : gnb(ctx.id, o);

  return wrapCarousels(`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ctx.pageName)} · ${SITE.name}</title>
<meta name="description" content="${esc(ctx.funcDef).slice(0, 150)}">
<link rel="stylesheet" href="../assets/css/base.css">
</head>
<body data-page="${ctx.id}">
${head}
${back}
${stateBar}
${o.hero || ''}
<main class="main ${o.mainCls || ''}">${o.full ? body : `<div class="${o.wrapCls || 'wrap'}">${body}</div>`}</main>
${o.stick || ''}
${o.solo ? '' : footer()}
${o.after || ''}
${spec}
<script src="../assets/js/app.js"></script>
</body>
</html>`);
}

/* ---------- 자주 쓰는 조합 ---------- */
export const pageHd = (title, sub, aside) => `<div class="page-hd row-b wrap-row"><div>
  <h1 class="t-page">${title}</h1>${sub ? `<p class="t-sub">${sub}</p>` : ''}</div>${aside || ''}</div>`;

/* 하단 고정 액션 바 — 레이아웃 A 상세 규칙 */
export const stickBar = (left, right) => `<div class="stick"><div class="stick-in"><div>${left}</div><div class="btns">${right}</div></div></div>`;

export const myNav = (activeId) => {
  const items = [['AC0101', '내 정보'], ['AC0201', '쿠폰·적립금'], ['MY0101', '내 예약'], ['RV0301', '내 리뷰'], ['PT0201', '매장 입점 신청']];
  return `<aside class="side"><div class="gl">마이페이지</div>${items.map(([id, label]) =>
    `<a href="${link(id)}"${(activeId || '').slice(0, 4) === id.slice(0, 4) ? ' class="on"' : ''}>${label}</a>`).join('')}</aside>`;
};

export const mgNav = (activeId) => {
  const groups = [
    ['예약', [['ST0101', '오늘 예약'], ['ST0201', '예약 캘린더'], ['ST0501', '예약 접수 대기']]],
    ['운영', [['MG0101', '시술 메뉴 관리'], ['MG0201', '디자이너 관리'], ['MG0301', '근무 일정 관리'], ['MG0401', '휴무·예약 정책']]],
    ['정산', [['SA0101', '정산 내역'], ['PT0101', '매장 홈']]],
  ];
  return `<aside class="side">${groups.map(([g, items]) => `<div class="gl">${g}</div>${items.map(([id, label]) =>
    `<a href="${link(id)}"${(activeId || '').slice(0, 4) === id.slice(0, 4) ? ' class="on"' : ''}>${label}</a>`).join('')}`).join('')}</aside>`;
};

/* 예약 진행 4단계 */
export const reStep = (i) => stepbar(['시술 선택', '디자이너 선택', '날짜·시간', '확인·결제'], i);

/* 선택 요약 고정 바 */
export const reSummary = (o = {}) => stickBar(
  `<div class="t-sub">${o.label || '선택한 시술'}</div><b style="font-size:17px">${o.text || '선택 2건 · 총 120분 · 85,000원'}</b>`,
  // '이전'에 갈 곳이 없어 눌러도 아무 일이 없었다. 여러 단계 흐름은 되돌아갈 수
  // 있어야 한다 — 안 주면 브라우저 뒤로가기 말고는 길이 없다(2026-08-04).
  o.btns || `${btn('이전', { cls: 'btn-ghost', href: o.prev, off: !o.prev })}${btn('다음 단계', { cls: 'btn-primary', href: o.next })}`
);
