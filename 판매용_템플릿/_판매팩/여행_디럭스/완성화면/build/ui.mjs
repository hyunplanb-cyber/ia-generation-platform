/* 공통 UI 컴포넌트 — 프리셋 01 모던 네이비 규칙을 마크업으로 고정 */
import { SITE, NAV, CAT_LABEL } from './data.mjs';

/* ---------- 기본 유틸 ---------- */
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const won = (n) => n.toLocaleString('ko-KR') + '원';
export const num = (n) => n.toLocaleString('ko-KR');
export const off = (was, price) => Math.round((1 - price / was) * 100);
/* 화면 링크.
   만들기 함수는 프리미엄(3뎁스) 화면ID로 쓰여 있는데(HO0101), 디럭스가 내보내는
   파일 이름은 2뎁스 ID(HO-01)다. 그대로 두면 링크가 전부 없는 파일을 가리킨다.
   여기서 옮겨 준다. 3뎁스 상태 화면(HO0102)은 디럭스에 없으니 그 화면의
   기본(HO-01)으로 보내고, 그마저 없으면 메뉴의 첫 화면으로 보낸다. */
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


/* 이미지 자리 — 테마 색으로 칠하지 않는다.
   테마 색을 채우면 화면이 그 색 덩어리로 뒤덮여 "빨간 사이트"처럼 보인다.
   옅은 파스텔 한 톤 + 테두리로 두고, 무엇이 들어갈 자리인지와 권장 크기를 글자로 적는다.
   (lib/design-presets.ts의 IMAGE_PLACEHOLDER와 같은 규칙) */
const PH_TONES = ["#EEF2F7","#F2EFF7","#EDF4F1","#F7F1EC","#F2F4F7"];
const PH_BORDER = '#E3E8F0';
const PH_TEXT = '#8B94A6';
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }

/**
 * @param seed  같은 대상은 어느 화면에서든 같은 톤이 나오게 하는 값
 * @param cls   크기 클래스(ph-16 / ph-43 / ph-sq …)
 * @param label 무엇이 들어갈 자리인지. 예: '매장 대표'
 * @param size  권장 크기. 예: '1200×900'
 */
export function ph(seed, cls = 'ph-16', label = '', size = '') {
  const bg = PH_TONES[hash(String(seed)) % PH_TONES.length];
  const cap = label || size
    ? `이미지 영역 (${[label, size && '권장 ' + size].filter(Boolean).join(' · ')})`
    : '이미지 영역';
  return `<div class="ph ${cls}" style="background:${bg}" data-cap="${esc(cap)}"><span class="cap">${esc(cap)}</span></div>`;
}

export function phMap(cls = 'ph-map', pins = [], cap = '지도 영역') {
  const p = pins.map((x, i) => `<button class="pin${x.on ? ' on' : ''}" style="left:${x.x}%;top:${x.y}%" data-name="${esc(x.name || '')}">${x.n || i + 1}</button>`).join('');
  return `<div class="ph ${cls}">${p}<span class="cap">${esc(cap)}</span></div>`;
}

export const stars = (r) => `<span class="stars" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
export const rateLine = (r, rv) => `${stars(r)} <b>${r.toFixed(1)}</b> <span class="muted">(${num(rv)})</span>`;
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;

/* ---------- 상품 카드 ---------- */
export function pcard(p, o = {}) {
  const d = off(p.was, p.price);
  const cls = ['pcard', o.dim ? 'is-off' : ''].join(' ');
  return `<a class="${cls}" href="${link(o.href || 'PR0201')}">
  ${o.noHeart ? '' : `<button class="heart${o.faved ? ' on' : ''}" type="button" aria-label="찜하기">${o.faved ? '♥' : '♡'}</button>`}
  ${o.ribbon ? `<span class="ribbon">${o.ribbon}</span>` : ''}
  ${ph(p.id + (o.seed || ''), 'ph-43', '상품 대표', '1200×900')}
  <div class="body">
    <div class="badges">${badge(CAT_LABEL[p.cat], 'b-line')}${p.instant ? badge('즉시확정', 'b-pri') : ''}${p.ko ? badge('한국어', 'b-line') : ''}</div>
    <div class="name">${esc(p.name)}</div>
    <div class="meta">${esc(p.city)} · ${esc(p.dur)}</div>
    <div class="meta">${rateLine(p.rating, p.rv)}</div>
    ${o.note || ''}
    <div class="price-row">
      ${o.soldout ? `<span class="badge b-mut">예약 마감</span>`
      : `<div class="row-c"><span class="rate">${d}%</span><span class="price-old">${won(p.was)}</span></div>
         <div class="price">${won(p.price)} <span class="per">/ 1인</span></div>`}
    </div>
  </div></a>`;
}
export const pcards = (list, o = {}) => list.map((p, i) => pcard(p, typeof o === 'function' ? o(p, i) : o)).join('');

/* ---------- 조각들 ---------- */
export const chip = (t, on = false, extra = '') => `<button class="chip${on ? ' on' : ''}" type="button" ${extra}>${t}${on && extra.indexOf('data-go') < 0 ? ' <span class="x">✕</span>' : ''}</button>`;
export const chips = (list, onIdx = -1) => `<div class="chips">${list.map((t, i) => chip(t, Array.isArray(onIdx) ? onIdx.includes(i) : i === onIdx)).join('')}</div>`;

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

export const empty = (ico, title, msg, btns = '') => `<div class="empty">
  <div class="ico">${ico}</div><h3 class="t-sec mt3">${title}</h3>
  ${msg ? `<p class="msg muted">${msg}</p>` : ''}${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;

export const btn = (t, o = {}) =>
  o.href ? `<a class="btn ${o.cls || 'btn-ghost'}" href="${link(o.href)}"${o.attr || ''}>${t}</a>`
    : `<button class="btn ${o.cls || 'btn-ghost'}" type="button"${o.off ? ' disabled' : ''}${o.attr || ''}>${t}</button>`;

export function table(head, rows, o = {}) {
  const th = head.map((h) => `<th${h.w ? ` style="width:${h.w}"` : ''}>${h.t != null ? h.t : h}</th>`).join('');
  const tr = rows.map((r) => `<tr class="${r.cls || ''}">${(r.cells || r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap ${o.scroll ? 'table-scroll' : ''}"><table class="table ${o.fix ? 'table-fix' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

export const kv = (pairs) => `<dl class="kv">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
export const sumRows = (rows, total) => `${rows.map(([k, v, cls]) => `<div class="sum-row ${cls || ''}"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
  ${total ? `<div class="sum-row total"><span>${total[0]}</span><span class="price">${total[1]}</span></div>` : ''}`;

export const accordion = (items, openIdx = -1) => `<div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">
  ${items.map((it, i) => `<div class="acc-item${i === openIdx ? ' on' : ''}">
    <button class="acc-q" type="button">${it.q}<span class="mk">＋</span></button>
    <div class="acc-a">${it.a}</div></div>`).join('')}</div></div>`;

export const review = (r, o = {}) => `<div class="review">
  <div class="row-b"><div class="who"><span class="ava">${esc(r.init)}</span><b style="color:var(--text)">${esc(r.who)}</b> · ${r.date} · ${r.with}</div>
  <span class="t-sub">${stars(r.rate)}</span></div>
  <p class="txt">${esc(r.txt)}</p>
  ${r.pics ? `<div class="pics">${Array.from({ length: r.pics }, (_, i) => ph(r.who + i, 'ph-11', '후기 사진', '800×800')).join('')}</div>` : ''}
  <div class="row-c mt3"><button class="btn btn-ghost btn-sm" type="button" data-toast="도움돼요를 눌렀어요">👍 도움돼요 ${r.help}</button>
  ${o.trans ? '<button class="btn btn-ghost btn-sm" type="button" data-toast="원문 보기로 전환했어요">원문 번역 보기</button>' : ''}</div>
  ${r.reply ? `<div class="reply"><b>판매자 답변</b> · ${r.replyAt}<br>${esc(r.reply)}</div>` : ''}</div>`;

export const rateSummary = (dist, avg, total) => `<div class="row" style="gap:32px;flex-wrap:wrap;align-items:center">
  <div class="center" style="flex:none"><div class="price-lg">${avg}</div>${stars(avg)}<div class="t-sub">후기 ${num(total)}개</div></div>
  <div class="grow">${dist.map((d) => `<div class="bar-row"><span class="muted">${d.s}점</span><span class="bar"><i style="width:${Math.round(d.n / total * 100)}%"></i></span><span class="muted right">${num(d.n)}</span></div>`).join('')}</div></div>`;

export const progress = (pct, acc) => `<div class="progress"><div class="fill ${acc ? 'acc' : ''}" style="width:${pct}%"></div></div>`;
export const stepbar = (list, onIdx) => `<div class="stepbar">${list.map((s, i) =>
  `<span class="s ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><span class="n">${i + 1}</span>${s}</span>${i < list.length - 1 ? '<span class="sep">›</span>' : ''}`).join('')}</div>`;

export const stat = (n, l) => `<div class="stat"><div class="n">${n}</div><div class="l">${l}</div></div>`;

export function calendar(o = {}) {
  const sel = o.sel || 14;
  const closed = o.closed || [3, 10, 17, 24, 31];
  const soldout = o.soldout || [5, 12, 19];
  const marks = o.marks || [];
  const start = 6; // 2026-08-01 은 토요일
  let cells = '';
  for (let i = 0; i < start; i++) cells += '<span></span>';
  for (let d = 1; d <= 31; d++) {
    const isOff = closed.includes(d) || soldout.includes(d) || (o.past || []).includes(d);
    const cls = ['cal-d', isOff ? 'off' : '', d === sel && !isOff ? 'sel' : '', marks.includes(d) ? 'mark' : ''].join(' ');
    const p = isOff ? (closed.includes(d) ? '휴무' : '마감') : (o.prices ? o.prices(d) : '68,000');
    cells += `<button class="${cls}" type="button" ${isOff ? 'disabled aria-disabled="true"' : ''}>${d}<span class="p">${p}</span></button>`;
  }
  return `<div class="cal">
    <div class="cal-hd"><button class="btn btn-ghost btn-sm cal-mv" type="button" data-mv="-1">‹</button><b>${o.month || '2026년 8월'}</b><button class="btn btn-ghost btn-sm cal-mv" type="button" data-mv="1">›</button></div>
    <div class="cal-grid">${['일', '월', '화', '수', '목', '금', '토'].map((d) => `<span class="dow">${d}</span>`).join('')}${cells}</div>
    <div class="row-c mt4 t-sub" style="gap:16px;flex-wrap:wrap"><span>선택 가능</span><span class="muted">취소선 = 휴무·마감</span>${o.legend || ''}</div>
  </div>`;
}

export const qr = (o = {}) => `<div class="qr ${o.cls || ''}"><i></i>${o.stamp ? `<span class="stamp">${o.stamp}</span>` : ''}</div>`;
export const qrSm = () => `<div class="qr qr-sm"><i></i></div>`;

export const skCard = () => `<div class="pcard"><div class="sk sk-ph"></div><div class="body">
  <div class="sk sk-line" style="width:35%"></div><div class="sk sk-line"></div><div class="sk sk-line" style="width:70%"></div>
  <div class="sk sk-line mt2" style="width:45%;height:18px"></div></div></div>`;

export const toastEl = (msg, act = '', kind = '') => `<div class="toast ${kind === 'ok' ? 'toast-ok' : ''}">
  <span>${msg}</span>${act ? `<span class="act" data-close=".toast">${act}</span>` : `<span class="act" data-close=".toast">닫기</span>`}</div>`;

const modalInner = (title, body, ft, o = {}) => `<div class="modal ${o.lg ? 'modal-lg' : ''}">
  <div class="hd">${title}</div><div class="bd">${body}</div><div class="ft">${ft}</div></div>`;
/** 화면에 바로 떠 있는 모달 (상태 화면용) */
export const modalEl = (title, body, ft, o = {}) => `<div class="dim">${modalInner(title, body, ft, o)}</div>`;
/** 버튼 data-modal 로 열리는 모달 템플릿 */
export const modalTpl = (id, title, body, ft, o = {}) => `<template id="${id}">${modalInner(title, body, ft, o)}</template>`;

export const sheetEl = (body) => `<div class="dim" style="align-items:flex-end;padding:0"><div class="sheet"><div class="grip"></div><div style="padding:0 20px 24px">${body}</div></div></div>`;

/* ---------- 헤더 / 푸터 ---------- */
function gnb(activeId, o = {}) {
  const nav = NAV.map((n) => `<a href="${link(n.id)}"${activeId && n.id.slice(0, 2) === activeId.slice(0, 2) ? ' class="on"' : ''}>${n.label}</a>`).join('');
  return `<header class="gnb">
  ${o.topbar || ''}
  <div class="gnb-in">
    <a class="logo" href="${link('HO0101')}"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
    <form class="gnb-search" role="search"><span class="ico">🔍</span><input class="input" type="search" placeholder="여행지, 상품명으로 검색" value="${o.q ? esc(o.q) : ''}"></form>
    <nav class="gnb-nav">${nav}</nav>
    <div class="gnb-util">
      ${o.logged
      ? `<a class="btn btn-ghost btn-sm" href="${link('MY1301')}">김여행님</a>`
      : `<a class="btn btn-ghost btn-sm" href="${link('MY0101')}">로그인</a>`}
      <a class="icon-btn" href="${link('MY1201')}" aria-label="알림함" style="display:inline-flex;align-items:center;justify-content:center">🔔${o.noti ? `<span class="dot">${o.noti}</span>` : ''}</a>
      <a class="icon-btn" href="${link('CT0101')}" aria-label="장바구니" style="display:inline-flex;align-items:center;justify-content:center">🛒${o.cart ? `<span class="dot">${o.cart}</span>` : ''}</a>
    </div>
  </div></header>`;
}

const footer = () => `<footer class="ft"><div class="ft-in">
  <div class="ft-cols">
    <div>
      <div class="logo mb3"><span class="mark">${SITE.mark}</span>${SITE.name}</div>
      <p class="t-sub">${SITE.company}<br>${SITE.biz}</p>
      <p class="t-sub mt3">당사는 통신판매중개자로서 거래 당사자가 아니며, 상품 정보 및 거래에 대한 책임은 각 판매자에게 있습니다.</p>
    </div>
    <div><h4>서비스</h4><ul>
      <li><a href="${link('PR0101')}">투어·티켓</a></li><li><a href="${link('PR0401')}">패스</a></li>
      <li><a href="${link('HO0501')}">기획전</a></li><li><a href="${link('HO0201')}">여행지</a></li>
      <li><a href="${link('VC0101')}">내 바우처</a></li></ul></div>
    <div><h4>고객지원</h4><ul>
      <li><a href="${link('CS0101')}">자주 묻는 질문</a></li><li><a href="${link('CS0201')}">1:1 문의</a></li>
      <li><a href="${link('CS0401')}">공지사항</a></li><li><a href="${link('CS0501')}">취소·환불 규정</a></li>
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
    <span>이용약관 · 개인정보처리방침 · 여행자 보험 안내</span>
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
${gnb(ctx.id, o)}
${back}
${stateBar}
${o.hero || ''}
<main class="main ${o.mainCls || ''}">${o.full ? body : `<div class="${o.wrapCls || 'wrap'}">${body}</div>`}</main>
${o.stick || ''}
${footer()}
${o.after || ''}
${spec}
<script src="../assets/js/app.js"></script>
</body>
</html>`);
}

/* ---------- 자주 쓰는 조합 ---------- */
export const pageHd = (title, sub, aside) => `<div class="page-hd row-b wrap-row"><div>
  <h1 class="t-page">${title}</h1>${sub ? `<p class="t-sub">${sub}</p>` : ''}</div>${aside || ''}</div>`;

export const stickBar = (left, right) => `<div class="stick"><div class="stick-in"><div>${left}</div><div class="btns">${right}</div></div></div>`;

export const myNav = (activeId) => {
  const groups = [
    ['예약', [['MY0301', '예약 내역'], ['MY1001', '내 여정'], ['VC0101', '내 바우처']]],
    ['활동', [['PR0801', '찜한 상품'], ['MY1101', '내 후기'], ['MY0901', '쿠폰함'], ['MY1201', '알림함']]],
    ['계정', [['MY1301', '계정 설정'], ['CS0301', '문의 내역']]],
  ];
  return `<aside class="side">${groups.map(([g, items]) => `<div class="gl">${g}</div>${items.map(([id, label]) =>
    `<a href="${link(id)}"${id === (activeId || '').slice(0, 6) || id === activeId ? ' class="on"' : ''}>${label}</a>`).join('')}`).join('')}</aside>`;
};

export const csNav = (activeId) => {
  const items = [['CS0101', '자주 묻는 질문'], ['CS0201', '1:1 문의하기'], ['CS0301', '문의 내역'], ['CS0401', '공지사항'], ['CS0501', '취소·환불 규정']];
  return `<aside class="side"><div class="gl">고객센터</div>${items.map(([id, label]) =>
    `<a href="${link(id)}"${(activeId || '').startsWith(id.slice(0, 4)) ? ' class="on"' : ''}>${label}</a>`).join('')}</aside>`;
};

export const prodSummary = (p, o = {}) => `<div class="hcard ${o.cls || ''}">
  ${ph(p.id, 'ph-thumb', '상품')}
  <div class="grow"><div class="badges mb2">${badge(CAT_LABEL[p.cat], 'b-line')}${o.state ? badge(o.state, o.stateCls || 'b-pri') : ''}</div>
  <div class="t-card" style="font-size:15px">${esc(p.name)}</div>
  <p class="t-sub">${o.date || p.city + ' · ' + p.dur}${o.pax ? ' · ' + o.pax : ''}</p>
  ${o.extra || ''}</div>
  ${o.right ? `<div class="right" style="flex:none">${o.right}</div>` : ''}</div>`;
