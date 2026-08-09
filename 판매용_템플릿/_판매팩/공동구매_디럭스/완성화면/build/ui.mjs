/* 공통 UI 조각
   - 색·글꼴·모서리는 가이드 프리셋 03 코럴 선셋
   - 화면 뼈대(사진 모자이크 히어로 · 매거진 2열 · 2단 헤더 · 상세 하단 고정 바)는
     레이아웃 프리셋 B 사진 중심형
   달성률 게이지와 마감 카운트다운이 이 서비스의 주인공이라, 조각으로 따로 뺐다. */
import { SITE, NAV, NAV_OWNER, CATS, ST_CLS } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const won = (n) => n.toLocaleString('ko-KR') + '원';
export const num = (n) => n.toLocaleString('ko-KR');
export const off = (was, now) => Math.round((1 - now / was) * 100);
function hash(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0; return Math.abs(h); }

/** 남은 시간(분) → 사람이 읽는 말 */
export function leftText(min) {
  if (min <= 0) return '마감';
  if (min < 60) return `${min}분 남음`;
  if (min < 1440) return `${Math.floor(min / 60)}시간 ${min % 60}분 남음`;
  return `${Math.floor(min / 1440)}일 ${Math.floor((min % 1440) / 60)}시간 남음`;
}

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

/* ---------- 이미지 자리 ---------- */
export function ph(spec, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const cls = ['ph', tone, o.cls || '', o.tiny ? 'ph-tiny' : ''].join(' ');
  const label = o.tiny
    ? `<span class="lb">${w}×${h}</span>`
    : `<span class="lb">이미지 영역 (${esc(what)} · <span class="sz">권장 ${w}×${h}</span>)</span>`;
  return `<div class="${cls}" style="aspect-ratio:${w}/${h}${o.style ? ';' + o.style : ''}">${label}${o.after || ''}</div>`;
}
export function phFix(spec, px, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const hh = Math.round(px * h / w);
  const cls = ['ph', 'ph-fix', tone, o.cls || 'ph-sq', 'ph-tiny'].join(' ');
  const label = px >= 52 && hh >= 26 ? `<span class="lb">${w}×${h}</span>` : '';
  return `<div class="${cls}" style="width:${px}px;height:${hh}px" title="이미지 영역 (${esc(what)} · 권장 ${w}×${h})">${label}</div>`;
}
export const phAva = (px, seed = 'p') => phFix(['프로필', 400, 400], px, { cls: 'ph-round', seed });
/** 상품 사진 — 1:1 을 지킨다 */
export const phGoods = (seed, o = {}) => ph(['상품 사진', 1000, 1000], { seed, ...o });

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
export const statRow = (list) => `<div class="g4 mb6">${list.map((s) => stat(s[0], s[1], s[2] || {})).join('')}</div>`;

export const progress = (pct, acc) => `<div class="progress"><div class="fill ${acc ? 'acc' : ''}" style="width:${pct}%"></div></div>`;

/* ---------- 공구 전용 ---------- */
/** 달성률 게이지 — 이 서비스의 주인공 */
export function gauge(pct, o = {}) {
  const k = o.miss ? ' miss' : (pct >= 100 ? ' done' : '');
  return `<div class="gauge-row${pct >= 100 && !o.miss ? ' done' : ''}">
    <div class="gauge${k} grow"><div class="fill" style="width:${Math.min(100, pct)}%"></div></div>
    <span class="pct">${pct}%</span></div>`;
}
/** 마감 카운트다운 배지 — 3시간 안쪽이면 빨갛게.
   초 단위로 실제로 세는 건 큰 타이머(HO-03·HM-03)에만 둔다. 배지에 data-count 를
   붙이면 app.js 가 배지 글자를 통째로 숫자로 바꿔 "⏱"와 "남음"이 사라진다. */
export const countdown = (min) => {
  const urgent = min > 0 && min < 180;
  return `<span class="cd${urgent ? '' : ' calm'}">⏱ ${leftText(min)}</span>`;
};
/** 단계별 가격표 — 인원이 늘수록 싸진다 */
export const tierTable = (tiers, o = {}) => `<div class="tier">
  ${tiers.map((t) => `<div class="t-row">
    <span class="n${t.now ? ' pri' : ''}">${num(t.n)}명~</span>
    <span class="${t.now ? 'now' : ''}" style="padding:4px 8px">${t.done ? '<span class="ok">✓ 달성</span>' : (t.now ? '<b class="pri">지금 이 단계</b>' : '<span class="muted">아직</span>')}</span>
    <span class="${t.now ? 'price' : 'muted'}" style="text-align:right">${won(t.price)}</span>
  </div>`).join('')}</div>
  ${o.next ? `<p class="t-sub mt3">${o.next}</p>` : ''}`;

/** 공구 카드 — 목록·추천에 쓴다 */
export function dealCard(d, pct, o = {}) {
  return `<a class="deal" href="${link(o.href || 'DE-01')}">
    ${o.rank ? `<span class="rank"><i>인기</i>${o.rank}<i>위</i></span>` : ''}
    ${ph(['상품 사진', 1000, 1000], { seed: d.id, tiny: true })}
    <div class="bd">
      <div class="row-b"><span class="badge b-acc">${off(d.was, d.now)}%</span>${countdown(d.left)}</div>
      <div class="ttl">${esc(d.nm)}</div>
      <div class="mt2"><span class="price-old">${won(d.was)}</span> <span class="price">${won(d.now)}</span></div>
      <div class="mt3">${gauge(pct)}</div>
      <div class="row-b mt1"><span class="t-sub">${num(d.joined)}명 참여 · 목표 ${num(d.goal)}명</span>
        <span class="t-sub">${esc(d.host)}</span></div>
    </div></a>`;
}
/* 레이아웃 A 규칙 — 카드를 나란히 두지 않고 위아래로 어긋나게(계단) 놓고,
   카드마다 큰 숫자를 하나씩 얹는다. o.rank:false 로 숫자를 뺄 수 있다. */
export const dealCards = (list, pctFn, o = {}) => `<div class="${o.cls || 'stair'}">${list
  .map((d, i) => dealCard(d, pctFn(d), { ...o, rank: o.rank === false ? null : i + 1 }))
  .join('')}</div>`;

/** 공구 행 — 표처럼 훑을 때 */
export function dealRow(d, pct, o = {}) {
  return `<div class="list-row" data-href="${link(o.href || 'DE-01')}" tabindex="0">
    ${phFix(['상품 사진', 1000, 1000], 104, { seed: d.id })}
    <div class="grow">
      <div class="row wrap-row" style="gap:6px">${badge(off(d.was, d.now) + '%', 'b-acc')}${countdown(d.left)}${o.tail || ''}</div>
      <h3 class="t-card mt1">${esc(d.nm)}</h3>
      <div class="t-sub">${esc(d.host)} · ${esc(d.ship)}</div>
      <div class="mt2" style="max-width:420px">${gauge(pct)}</div>
      <div class="t-sub mt1">${num(d.joined)}명 참여 · 목표 ${num(d.goal)}명${pct < 100 ? ` · <b class="pri">${num(d.goal - d.joined)}명이면 성사</b>` : ''}</div>
    </div>
    <div class="right nowrap"><span class="price-old">${won(d.was)}</span><div class="price">${won(d.now)}</div>${o.right || ''}</div></div>`;
}

/** 가로로 넘치는 줄. 아래 스크롤바 대신 좌우 화살표로 넘긴다.
   스크롤바는 있는 줄 모르고 지나치기 쉽다 — 넘길 게 있다는 걸 눈에 보이게 둔다. */
export const carousel = (items, o = {}) => `<div class="car">
  <button class="car-nav prev" type="button" aria-label="이전">‹</button>
  <div class="carousel ${o.cls || ''}">${items}</div>
  <button class="car-nav next" type="button" aria-label="다음">›</button>
</div>`;

/** 배너 — 사진 자리를 함께 둬서 "여기가 배너"임이 보이게 한다 */
export const promo = (o) => `<a class="promo ${o.alt ? 'alt' : ''}" href="${link(o.href)}">
  <div class="promo-ph">${ph([o.imgLabel || '배너 이미지', 1200, 600], { seed: o.title, tiny: true })}</div>
  <div class="in">
    ${o.kicker ? `<span class="badge b-acc">${o.kicker}</span>` : ''}
    <b>${o.title}</b>
    <p>${o.body}</p>
    <span class="btn btn-accent btn-sm mt3">${o.cta}</span>
  </div></a>`;

/** 레이아웃 A 히어로 — 어두운 배경에 큰 제목, 바로 아래 숫자 지표 4개를 가로 한 줄로 */
export const heroBold = (o) => `<section class="hero-bold"><div class="wrap">
  ${o.kicker ? `<div class="kicker">${o.kicker}</div>` : ''}
  <h1>${o.title}</h1>
  ${o.sub ? `<p class="sub">${o.sub}</p>` : ''}
  <div class="figs">${o.figs.map(([n, l]) => `<div class="fig"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('')}</div>
  ${o.btns ? `<div class="btns">${o.btns}</div>` : ''}
</div></section>`;

/** 레이아웃 A 상세 — 상단 어두운 띠에 제목과 핵심 숫자, 아래는 밝은 본문 */
export const darkBar = (o) => `<section class="dark-bar"><div class="wrap">
  ${o.top || ''}
  <h1>${o.title}</h1>
  ${o.sub ? `<p class="t-sub mt2">${o.sub}</p>` : ''}
  ${o.figs ? `<div class="figs">${o.figs.map(([n, l]) => `<div class="fig"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('')}</div>` : ''}
</div></section>`;

/* ---------- 헤더·푸터 ---------- */
const OWNER_CODES = ['HS', 'HM', 'SE'];
export const isOwner = (id) => OWNER_CODES.includes(String(id).slice(0, 2));

function gnb(activeId, o = {}) {
  const owner = o.owner ?? isOwner(activeId);
  const list = owner ? NAV_OWNER : NAV;
  const nav = list.map((n) => `<a href="${link(n.id)}"${String(activeId).slice(0, 2) === n.id.slice(0, 2) ? ' class="on"' : ''}>${n.label}</a>`).join('');
  const util = owner
    ? `<a class="btn btn-ghost btn-sm" href="${link('HO-01')}">참여자 화면 보기</a><a class="gnb-ava" href="${link('AC-01')}" title="내 정보">${phAva(30, 'me')}</a>`
    : `<a href="${link('CS-01')}">이용 안내</a><a class="btn btn-ghost btn-sm" href="${link('HM-01')}">진행자 화면으로</a><a class="gnb-ava" href="${link('AC-01')}" title="내 정보">${phAva(30, 'me')}</a>`;
  // 레이아웃 B — 상단 가로 GNB + 그 아래 카테고리 줄(2단 헤더)
  const catRow = o.noCat || owner ? '' : `<div class="catbar"><div class="catbar-in">
    ${CATS.map((c) => `<a href="${link('HO-02')}"${o.cat === c.key ? ' class="on"' : ''}><span>${c.ic}</span>${c.nm}</a>`).join('')}
    <span class="sep"></span>
    <a href="${link('HO-03')}">마감 임박</a>
    <a href="${link('HS-01')}">진행자 되기</a>
  </div></div>`;

  return `<header class="gnb dark">
  ${o.topbar || ''}
  <div class="gnb-in">
    <a class="logo" href="${link(owner ? 'HM-01' : 'HO-01')}"><span class="mark">${SITE.mark}</span>${SITE.name}${owner ? '<span class="badge b-pri" style="margin-left:4px">진행자</span>' : ''}</a>
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
      <p class="t-sub mt3">당사는 통신판매중개자로서 거래 당사자가 아니며, 상품과 배송에 대한 책임은 각 공구를 연 진행자에게 있습니다.</p>
    </div>
    <div><h4>참여하기</h4><ul>
      <li><a href="${link('HO-02')}">공구 목록</a></li><li><a href="${link('HO-03')}">마감 임박</a></li>
      <li><a href="${link('MY-01')}">내 공구함</a></li><li><a href="${link('RV-03')}">관심 공구</a></li>
      <li><a href="${link('CS-04')}">환불·분쟁 정책</a></li></ul></div>
    <div><h4>진행자</h4><ul>
      <li><a href="${link('HS-01')}">진행자 시작하기</a></li><li><a href="${link('HS-02')}">공구 개설</a></li>
      <li><a href="${link('HM-01')}">진행자 대시보드</a></li><li><a href="${link('SE-01')}">정산 내역</a></li>
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
    <span>이용약관 · 개인정보처리방침 · 환불·분쟁 정책</span>
  </div></div></footer>`;

/* 진행자 영역 사이드바 */
export const hostNav = (activeId) => {
  const groups = [
    ['공구', [['HM-01', '진행자 대시보드'], ['HS-02', '공구 개설'], ['HM-02', '참여 현황'], ['HM-03', '마감·성사 처리']]],
    ['배송', [['HM-04', '발주·배송 관리'], ['HM-05', '참여자 공지']]],
    ['정산', [['SE-01', '정산 내역'], ['SE-02', '계좌·세금 설정']]],
  ];
  return `<aside class="side">${groups.map(([g, items]) => `<div class="gl">${g}</div>${items.map(([id, label]) =>
    `<a href="${link(id)}"${activeId === id ? ' class="on"' : ''}>${label}</a>`).join('')}`).join('')}</aside>`;
};

export const myNav = (activeId) => {
  const items = [['MY-01', '내 공구함'], ['RV-03', '관심·알림'], ['AC-02', '내 정보·배송지'], ['AC-03', '알림 설정'], ['CS-02', '1:1 문의']];
  return `<aside class="side"><div class="gl">내 정보</div>${items.map(([id, label]) =>
    `<a href="${link(id)}"${activeId === id ? ' class="on"' : ''}>${label}</a>`).join('')}</aside>`;
};

/* ---------- 페이지 셸 ---------- */
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

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ctx.pageName)} · ${SITE.name}</title>
<meta name="description" content="${esc(ctx.funcDef).slice(0, 150)}">
<link rel="stylesheet" href="../assets/css/base.css">
</head>
<body data-page="${ctx.id}">
${o.solo ? '' : gnb(ctx.id, o)}
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
</html>`;
}

/* ---------- 자주 쓰는 조합 ---------- */
export const pageHd = (title, sub, aside) => `<div class="page-hd row-b wrap-row"><div>
  <h1 class="t-page">${title}</h1>${sub ? `<p class="t-sub">${sub}</p>` : ''}</div>${aside || ''}</div>`;

/** 레이아웃 B 상세 규칙 — 액션은 하단 고정 바 */
export const stickBar = (left, right) => `<div class="stick"><div class="stick-in"><div>${left}</div><div class="btns">${right}</div></div></div>`;

export const detail2 = (main, aside) => `<div class="split-r"><div>${main}</div><div class="sticky">${aside}</div></div>`;
export const hostPage = (activeId, body) => `<div class="split">${hostNav(activeId)}<div>${body}</div></div>`;
export const myPage = (activeId, body) => `<div class="split">${myNav(activeId)}<div>${body}</div></div>`;

export const soloBox = (title, sub, body, o = {}) => `<div class="solo${o.lg ? ' solo-lg' : ''}"><div class="solo-box">
  <div class="logo mb4"><span class="mark">${SITE.mark}</span>${SITE.name}</div>
  ${o.steps || ''}
  <h1 class="t-sec">${title}</h1>${sub ? `<p class="t-sub mt1">${sub}</p>` : ''}
  <div class="mt6">${body}</div></div></div>`;

export const stepbar = (list, onIdx) => `<div class="stepbar">${list.map((s, i) =>
  `<span class="s ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><span class="n">${i + 1}</span>${s}</span>${i < list.length - 1 ? '<span class="sep">›</span>' : ''}`).join('')}</div>`;

export const hsteps = (list, onIdx) => `<div class="hsteps">${list.map((s, i) =>
  `<div class="st ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><div class="dot">${i < onIdx ? '✓' : i + 1}</div>${s}</div>`).join('')}</div>`;

/** 진행 상태 타임라인 — 참여→마감→성사→발주→배송→완료 */
export const timeline = (steps, onIdx) => `<div class="timeline">${steps.map(([t, d], i) => `<div class="tl-item">
  <span class="${i < onIdx ? 'ok' : (i === onIdx ? 'pri' : 'muted')}">${i < onIdx ? '✓' : (i === onIdx ? '●' : '○')}</span>
  <div class="grow"><b>${t}</b>${d ? `<div class="t-sub">${d}</div>` : ''}</div></div>`).join('')}</div>`;

export const rateSummary = (avg, dist) => `<div class="rate">
  <div class="left"><div class="n">${avg.toFixed(1)}</div>${stars(avg)}<div class="t-sub">후기 ${num(dist.reduce((a, d) => a + d.n, 0))}개</div></div>
  <div class="grow">${dist.map((d) => {
  const tot = dist.reduce((a, x) => a + x.n, 0);
  return `<div class="bar-row"><span class="nowrap">${d.s}점</span>${progress(Math.round(d.n / tot * 100))}<span class="muted nowrap">${num(d.n)}</span></div>`;
}).join('')}</div></div>`;

export const rateIn = (label, v = 0) => `<div class="rate-in"><span class="lb">${label}</span>
  <span class="st">${[1, 2, 3, 4, 5].map((i) => `<b class="${i <= v ? 'on' : ''}">${i <= v ? '★' : '☆'}</b>`).join('')}</span>
  <span class="v">${v ? v + '점' : '눌러서 매기기'}</span></div>`;

export const review = (r, o = {}) => `<div class="review">
  <div class="row-b"><div class="row" style="gap:10px">${phAva(38, r.who)}<div>
    <b>${esc(r.who)}</b><div class="t-sub">${stars(r.r)} · ${r.at} · ${esc(r.opt)}</div></div></div>
  ${o.deal === false ? '' : `<span class="t-sub nowrap">${esc(r.deal || '')}</span>`}</div>
  ${r.photo ? `<div class="row mt3" style="gap:8px">${[1, 2].map((i) => phFix(['후기 사진', 1000, 1000], 84, { seed: r.who + i })).join('')}</div>` : ''}
  <p class="mt3">${esc(r.t)}</p>
  ${o.act === false ? '' : `<div class="row mt3" style="gap:8px">
    <button class="btn btn-ghost btn-sm" type="button" data-toast="도움이 됐다고 표시했어요">👍 도움돼요</button>
    <button class="btn btn-ghost btn-sm" type="button" data-toast="신고를 접수했어요">신고</button></div>`}</div>`;
