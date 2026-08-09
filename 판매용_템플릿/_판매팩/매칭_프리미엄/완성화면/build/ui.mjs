/* 공통 UI 조각
   - 색·글꼴·모서리는 가이드 프리셋 01 모던 네이비
   - 화면 뼈대(좌우 2단 히어로 · 2열 카드 · 상단 가로 GNB · 본문 한 단 + 하단 고정 바)는
     레이아웃 프리셋 A 좌우 분할형
   - 카드 모양은 "가로 행(row)" — 왼쪽 정사각 사진, 가운데 정보, 오른쪽 액션.
     비교하며 훑는 목록이 이 서비스의 주인공이라 이 모양을 기본으로 잡았다.
   신뢰 지표(평점·응답률·인증)와 크레딧이 이 서비스의 특징이라 조각으로 따로 뺐다. */
import { SITE, NAV, NAV_PRO, ST_CLS } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const won = (n) => n.toLocaleString('ko-KR') + '원';
export const num = (n) => n.toLocaleString('ko-KR');
function hash(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0; return Math.abs(h); }

/** 분 단위 응답 시간 → 사람이 읽는 말 */
export const respText = (m) => (m < 60 ? `평균 ${m}분` : `평균 ${Math.floor(m / 60)}시간 ${m % 60 ? m % 60 + '분' : ''}`.trim());

/* 스펙팩이 정한 화면만 있으므로, 3뎁스 화면을 가리키는 링크는 같은 메뉴의 2뎁스로 옮긴다 */
let PAGES = null;
export const setPages = (ids) => { PAGES = new Set(ids); };
export function toPageId(id) {
  const s = String(id);
  if (!PAGES || PAGES.has(s)) return s;

  /* 3뎁스 팩에서는 «반대 방향»이 필요하다 — 2026-08-09.
     2뎁스 빌더가 'SE-03' 으로 링크를 거는데 이 팩의 파일은 'SE0301.html' 이다.
     그대로 두면 88장이 전부 끊긴다(check-pack.mts 가 잡아 줬다).
     'SE-03' → 'SE0301' : 그 화면의 «기본 상태»로 보낸다. */
  const 짧은 = /^([A-Z]{2})-(\d{2})$/.exec(s);
  if (짧은) {
    const 긴 = `${짧은[1]}${짧은[2]}01`;
    if (PAGES.has(긴)) return 긴;
  }

  /* 반대 방향도 남겨 둔다 — 2뎁스 팩에서 3뎁스 이름으로 링크를 걸었을 때. */
  const 긴것 = /^([A-Z]{2})(\d{2})\d{2}$/.exec(s);
  const want = 긴것 ? `${긴것[1]}-${긴것[2]}` : s;
  if (PAGES.has(want)) return want;

  // 그래도 못 찾으면 같은 메뉴의 첫 화면으로. 끊긴 링크보다 낫다.
  const code = s.slice(0, 2);
  return [...PAGES].find((p) => p.startsWith(code)) || s;
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
  return `<div class="${cls}" style="aspect-ratio:${w}/${h}${o.style ? ';' + o.style : ''}">${label}${o.after || ''}</div>`;
}
/** 크기가 고정된 자리 — flex 안에서 늘어나지 않게 폭·높이를 못 박는다 */
export function phFix(spec, px, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const hh = Math.round(px * h / w);
  const cls = ['ph', 'ph-fix', tone, o.cls || 'ph-sq', 'ph-tiny'].join(' ');
  const label = px >= 52 && hh >= 26 ? `<span class="lb">${w}×${h}</span>` : '';
  return `<div class="${cls}" style="width:${px}px;height:${hh}px" title="이미지 영역 (${esc(what)} · 권장 ${w}×${h})">${label}</div>`;
}
export const phAva = (px, seed = 'p') => phFix(['프로필', 400, 400], px, { cls: 'ph-round', seed });
/** 고수 프로필 — 목록의 왼쪽 정사각 자리 */
export const phPro = (px, seed) => phFix(['고수 프로필', 400, 400], px, { cls: 'ph-sq', seed });
/** 작업 사진 — 4:3 으로 통일한다 */
export const phWork = (seed, o = {}) => ph(['작업 사진', 1200, 900], { seed, ...o });

/* ---------- 작은 조각 ---------- */
export const stars = (r, lg) => `<span class="stars${lg ? ' lg' : ''}" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
export const rateLine = (r, rv) => `${stars(r)} <b>${r.toFixed(1)}</b> <span class="muted">(${num(rv)})</span>`;
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
export const stBadge = (st) => badge(st, ST_CLS[st] || 'b-mut');
/** 인증 배지 — 무엇이 확인됐는지 */
export const verify = (t) => `<span class="verify"><i>✓</i>${t}</span>`;
export const verifies = (list) => `<span class="verifies">${list.map(verify).join('')}</span>`;

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
  ${o.desc ? `<p class="t-sub" style="margin-top:calc(-1 * var(--sp-item));margin-bottom:var(--sp-title)">${o.desc}</p>` : ''}
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

export function table(head, rows, o = {}) {
  const th = head.map((h) => `<th${h.w ? ` style="width:${h.w}"` : ''}${h.cls ? ` class="${h.cls}"` : ''}>${h.t != null ? h.t : h}</th>`).join('');
  const tr = rows.map((r) => `<tr class="${r.cls || ''}">${(r.cells || r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  const tf = o.foot ? `<tfoot><tr>${o.foot.map((c) => `<td>${c}</td>`).join('')}</tr></tfoot>` : '';
  return `<div class="table-wrap ${o.scroll === false ? '' : 'table-scroll'}"><table class="table ${o.cls || ''}${o.fix ? ' table-fix' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody>${tf}</table></div>`;
}

export const kv = (pairs, o = {}) => `<dl class="kv ${o.cls || ''}">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
export const sumRows = (rows, total) => `${rows.map(([k, v, cls]) => `<div class="sum-row ${cls || ''}"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
  ${total ? `<div class="sum-row total"><span>${total[0]}</span><span class="price">${total[1]}</span></div>` : ''}`;

export const accordion = (items, openIdx = -1) => `<div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">
  ${items.map((it, i) => `<div class="acc-item${(Array.isArray(openIdx) ? openIdx.includes(i) : i === openIdx) ? ' on' : ''}">
    <button class="acc-q" type="button">${it.q}<span class="mk">＋</span></button>
    <div class="acc-a">${it.a}</div></div>`).join('')}</div></div>`;

export const stat = (n, l, o = {}) => `<div class="stat ${o.cls || ''}">${o.ic ? `<div class="ic">${o.ic}</div>` : ''}
  <div class="n">${n}</div><div class="l">${l}</div>${o.d ? `<div class="d">${o.d}</div>` : ''}</div>`;
export const statRow = (list, cls = 'g4') => `<div class="${cls}">${list.map((s) => stat(s[0], s[1], s[2] || {})).join('')}</div>`;

export const progress = (pct, kind) => `<div class="progress"><div class="fill ${kind || ''}" style="width:${Math.min(100, pct)}%"></div></div>`;

/* ---------- 매칭 전용 ---------- */

/** 고수 행 카드 — 이 서비스의 기본 카드 모양(row).
   왼쪽 정사각 사진 · 가운데 신뢰 지표 · 오른쪽 시작가와 액션. */
export function proRow(p, o = {}) {
  const met = [
    `<span>${stars(p.r)} <b>${p.r.toFixed(1)}</b> <span class="k">(${num(p.rv)})</span></span>`,
    `<span><span class="k">응답률</span> <b>${p.resp}%</b></span>`,
    `<span><span class="k">응답</span> <b>${respText(p.respMin)}</b></span>`,
    `<span class="k">${esc(p.area)}</span>`,
  ].join('');
  return `<${o.href === false ? 'div' : 'a'} class="pro-row"${o.href === false ? '' : ` href="${link(o.href || 'SE-03')}"`}>
    ${o.pick ? `<label class="check none" style="padding-top:2px"><input type="checkbox" data-pick${o.picked ? ' checked' : ''}></label>` : ''}
    ${phPro(o.sm ? 68 : 92, p.id)}
    <div class="mid">
      <div class="row-c wrap-row"><span class="nm">${esc(p.nm)}</span>${badge(p.cat, 'b-mut')}${o.tail || ''}</div>
      <div class="one">${esc(p.one)}</div>
      <div class="met">${met}</div>
      ${o.noVerify ? '' : `<div class="verifies mt-item">${p.tags.map(verify).join('')}</div>`}
    </div>
    <div class="act">
      ${o.heart === false ? '' : '<button class="heart" type="button" aria-label="찜하기">♡</button>'}
      <span class="from"><span class="k">시작가</span><span class="v">${won(p.from)}</span></span>
      ${o.cta === false ? '' : `<span class="btn btn-pri btn-sm">${o.ctaLabel || '견적 요청'}</span>`}
    </div>
  </${o.href === false ? 'div' : 'a'}>`;
}

/** 고수 2열 카드 — 레이아웃 A 의 list 슬롯. 홈·추천처럼 훑어보는 자리에 쓴다. */
export function proCard(p, o = {}) {
  return `<a class="pro-card" href="${link(o.href || 'SE-03')}">
    ${phPro(64, p.id)}
    <div class="mid">
      <div class="nm">${esc(p.nm)}</div>
      <div class="one">${esc(p.one)}</div>
      <div class="met">${stars(p.r)} <b>${p.r.toFixed(1)}</b> <span class="muted">(${num(p.rv)}) · 응답률 ${p.resp}%</span></div>
      <div class="met"><span class="muted">시작가</span> <b>${won(p.from)}</b></div>
      ${o.why ? `<div class="mt-item">${badge(o.why, 'b-acc')}</div>` : ''}
    </div>
  </a>`;
}

/** 견적 카드 — 왼쪽 고수 사진, 가운데 제안, 오른쪽 금액을 크게 */
export function quoteRow(q, p, o = {}) {
  return `<div class="pro-row">
    ${o.pick ? `<label class="check none" style="padding-top:2px"><input type="checkbox" data-pick${o.picked ? ' checked' : ''}></label>` : ''}
    ${phPro(80, p.id)}
    <div class="mid">
      <div class="row-c wrap-row">
        <a class="nm" href="${link('QT-03')}">${esc(p.nm)}</a>
        ${q.isNew ? badge('NEW', 'b-acc') : ''}
        ${o.best ? badge(o.best, 'b-pri') : ''}
      </div>
      <div class="met mt1">
        <span>${stars(p.r)} <b>${p.r.toFixed(1)}</b> <span class="k">(${num(p.rv)})</span></span>
        <span><span class="k">응답</span> <b>${respText(p.respMin)}</b></span>
        <span class="k">${q.at} 도착</span>
      </div>
      <p class="mt-item">${esc(q.one)}</p>
      <div class="verifies mt-item">${p.tags.map(verify).join('')}</div>
    </div>
    <div class="act">
      <span class="from"><span class="k">예상 소요 ${q.hours}</span><span class="v price">${won(q.price)}</span></span>
      <div class="btns">
        ${btn('견적 보기', { href: 'QT-03', cls: 'btn-ghost btn-sm' })}
        ${btn('이 고수 선택', { href: 'QT-04', cls: 'btn-pri btn-sm' })}
      </div>
      <button class="link quiet" type="button" data-toast="이 견적을 숨겼어요" data-toast-act="되돌리기">관심 없어요</button>
    </div>
  </div>`;
}

/** 신뢰 지표 줄 — 이 서비스에서 가장 크게 보여야 하는 숫자들 */
export const trust = (p) => statRow([
  [`${p.r.toFixed(1)}`, `평점 · 후기 ${num(p.rv)}개`, { cls: 'pri' }],
  [`${p.resp}%`, '견적 요청 응답률'],
  [respText(p.respMin).replace('평균 ', ''), '평균 응답 시간'],
  [`${num(p.done)}건`, `누적 매칭 · ${p.since} 시작`],
]);

/** 견적 자리 배지 — 선착순이라 급하다는 느낌을 준다 */
export const slotBadge = (left, max) =>
  `<span class="badge ${left <= 2 ? 'b-acc' : 'b-mut'}">견적 자리 ${left} / ${max} 남음</span>`;

/** 크레딧 비용 표시 */
export const creditCost = (n) => `<span class="badge b-pri">${n}크레딧</span>`;

/** 세로 타임라인 — 진행 상황 */
export const timeline = (steps, onIdx) => `<div class="timeline">${steps.map(([t, d], i) => `<div class="tl-item ${i < onIdx ? 'done' : (i === onIdx ? 'on' : 'todo')}">
  <span class="dot">${i < onIdx ? '✓' : (i === onIdx ? '●' : '')}</span>
  <b>${t}</b>${d ? `<div class="when">${d}</div>` : ''}</div>`).join('')}</div>`;

/** 가로로 넘치는 줄. 아래 스크롤바 대신 좌우 화살표로 넘긴다.
   스크롤바는 있는 줄 모르고 지나치기 쉽다 — 넘길 게 있다는 걸 눈에 보이게 둔다. */
export const carousel = (items, o = {}) => `<div class="car">
  <button class="car-nav prev" type="button" aria-label="이전">‹</button>
  <div class="carousel ${o.cls || ''}">${items}</div>
  <button class="car-nav next" type="button" aria-label="다음">›</button>
</div>`;

/** 후기 한 건 */
export const review = (r, o = {}) => `<div class="review">
  <div class="row-b">
    <div class="row-c">${phAva(38, r.who)}<div>
      <b>${esc(r.who)}</b><div class="t-sub">${stars(r.r)} · ${r.at} · ${esc(r.svc)}</div></div></div>
    ${o.pro === false ? '' : `<span class="t-sub nowrap">${esc(r.pro || '')}</span>`}
  </div>
  ${r.photo ? `<div class="row mt3" style="gap:8px">${[1, 2].map((i) => phFix(['후기 사진', 1200, 900], 96, { seed: r.who + i })).join('')}</div>` : ''}
  <p class="txt">${esc(r.t)}</p>
  ${r.reply && o.reply !== false ? `<div class="reply"><div class="who">${esc(r.pro)} 답글</div>${esc(r.reply)}</div>` : ''}
  ${o.act === false ? '' : `<div class="row mt3" style="gap:8px">
    <button class="btn btn-ghost btn-sm" type="button" data-toast="도움이 됐다고 표시했어요">👍 도움돼요 ${r.help || 0}</button>
    <button class="btn btn-ghost btn-sm" type="button" data-toast="신고를 접수했어요">신고</button></div>`}</div>`;

/** 별점 분포 */
export const rateSummary = (avg, dist) => `<div class="rate">
  <div class="left"><div class="n">${avg.toFixed(1)}</div>${stars(avg, true)}<div class="t-sub">후기 ${num(dist.reduce((a, d) => a + d.n, 0))}개</div></div>
  <div class="grow">${dist.map((d) => {
  const tot = dist.reduce((a, x) => a + x.n, 0);
  return `<div class="bar-row"><span class="nowrap">${d.s}점</span>${progress(Math.round(d.n / tot * 100))}<span class="muted nowrap">${num(d.n)}</span></div>`;
}).join('')}</div></div>`;

export const rateIn = (label, v = 0, o = {}) => `<div class="rate-in${o.big ? ' big' : ''}"><span class="lb">${label}</span>
  <span class="st">${[1, 2, 3, 4, 5].map((i) => `<b class="${i <= v ? 'on' : ''}">${i <= v ? '★' : '☆'}</b>`).join('')}</span>
  <span class="v">${v ? v + '점' : '눌러서 매기기'}</span></div>`;

/* ---------- 진행 표시 ---------- */
export const stepbar = (list, onIdx) => `<div class="stepbar">${list.map((s, i) =>
  `<span class="s ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><span class="n">${i < onIdx ? '✓' : i + 1}</span>${s}</span>${i < list.length - 1 ? '<span class="sep">›</span>' : ''}`).join('')}</div>`;

export const hsteps = (list, onIdx) => `<div class="hsteps">${list.map((s, i) =>
  `<div class="st ${i === onIdx ? 'on' : (i < onIdx ? 'done' : '')}"><div class="dot">${i < onIdx ? '✓' : i + 1}</div>${s}</div>`).join('')}</div>`;

/* ---------- 헤더·푸터 ---------- */
const PRO_CODES = ['PR', 'LD', 'JB'];
export const isPro = (id) => PRO_CODES.includes(String(id).slice(0, 2));

function gnb(activeId, o = {}) {
  const pro = o.pro ?? isPro(activeId);
  const list = pro ? NAV_PRO : NAV;
  const nav = list.map((n) => `<a href="${link(n.id)}"${String(activeId).slice(0, 2) === n.id.slice(0, 2) ? ' class="on"' : ''}>${n.label}</a>`).join('');
  // 레이아웃 A — 로고 왼쪽, 액션 버튼 오른쪽 끝. 한 줄로 끝낸다.
  const util = pro
    ? `<span class="badge b-pri">크레딧 42</span>
       <button class="bell" type="button" aria-label="알림">🔔<span class="dot">3</span></button>
       <a class="btn btn-ghost btn-sm" href="${link('HO-02')}">손님 화면으로</a><a class="gnb-ava" href="${link('AU-01')}" title="내 정보">${phAva(30, 'me')}</a>`
    : `<a href="${link('PR-01')}">고수센터</a>
       <button class="bell" type="button" aria-label="알림">🔔<span class="dot">2</span></button>
       <a class="btn btn-pri btn-sm" href="${link('RQ-01')}">요청서 작성</a><a class="gnb-ava" href="${link('AU-01')}" title="내 정보">${phAva(30, 'me')}</a>`;

  return `<header class="gnb${pro ? ' pro' : ''}"><div class="gnb-in">
    <a class="logo" href="${link(pro ? 'PR-01' : 'HO-02')}"><span class="mark">${SITE.mark}</span>${SITE.name}${pro ? '<span class="badge b-pri" style="margin-left:2px">고수</span>' : ''}</a>
    <nav class="gnb-nav">${nav}</nav>
    <div class="gnb-util">${util}</div>
  </div></header>`;
}

/** 비로그인 GNB — 로그인·가입 버튼이 오른쪽 끝에 */
function gnbGuest(activeId) {
  const nav = [['HO-01', '홈'], ['SE-01', '고수 찾기'], ['RQ-01', '요청서 작성']]
    .map(([id, label]) => `<a href="${link(id)}"${String(activeId).slice(0, 2) === id.slice(0, 2) ? ' class="on"' : ''}>${label}</a>`).join('');
  return `<header class="gnb"><div class="gnb-in">
    <a class="logo" href="${link('HO-01')}"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
    <nav class="gnb-nav">${nav}</nav>
    <div class="gnb-util">
      <a href="${link('HO-01')}">이용 안내</a>
      <a href="${link('PR-02')}">고수 가입</a>
      <a class="btn btn-ghost btn-sm" href="${link('AU-01')}">로그인</a>
      <a class="btn btn-pri btn-sm" href="${link('RQ-01')}">요청서 작성</a>
    </div></div></header>`;
}

const footer = () => `<footer class="ft"><div class="ft-in">
  <div class="ft-cols">
    <div>
      <div class="logo mb3"><span class="mark">${SITE.mark}</span>${SITE.name}</div>
      <p class="t-sub">${SITE.company}<br>${SITE.biz}</p>
      <p class="t-sub mt3">당사는 통신판매중개자로서 거래 당사자가 아니며, 서비스 제공과 그 결과에 대한 책임은 각 고수에게 있습니다.</p>
    </div>
    <div><h4>맡기기</h4><ul>
      <li><a href="${link('RQ-01')}">요청서 작성</a></li><li><a href="${link('SE-01')}">고수 찾기</a></li>
      <li><a href="${link('QT-01')}">받은 견적</a></li><li><a href="${link('MY-01')}">내 요청</a></li>
      <li><a href="${link('RV-02')}">내 후기</a></li></ul></div>
    <div><h4>고수</h4><ul>
      <li><a href="${link('PR-02')}">고수 등록</a></li><li><a href="${link('PR-01')}">고수센터</a></li>
      <li><a href="${link('LD-01')}">요청 받기</a></li><li><a href="${link('LD-04')}">크레딧</a></li>
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
    <span>이용약관 · 개인정보처리방침 · 안전 거래 정책</span>
  </div></div></footer>`;

/* ---------- 사이드바 ---------- */
export const proNav = (activeId) => {
  const groups = [
    ['일감', [['PR-01', '고수센터 홈', ''], ['LD-01', '새 요청', '12'], ['JB-01', '일감 목록', '']]],
    ['정산', [['JB-03', '정산 내역', ''], ['LD-04', '크레딧 충전', '']]],
    ['내 활동', [['PR-04', '활동 설정', ''], ['PR-05', '프로필·포트폴리오', ''], ['PR-03', '등록 심사 현황', '']]],
  ];
  return `<aside class="side">
    ${groups.map(([g, items]) => `<div class="gl">${g}</div>${items.map(([id, label, n]) =>
    `<a href="${link(id)}"${activeId === id ? ' class="on"' : ''}>${label}${n ? `<span class="n">${n}</span>` : ''}</a>`).join('')}`).join('')}
    <div class="cr">
      <div class="t-sub">남은 크레딧</div>
      <div class="row-b"><b class="big">42</b>${btn('충전', { href: 'LD-04', cls: 'btn-pri btn-xs' })}</div>
    </div>
  </aside>`;
};

export const myNav = (activeId) => {
  const items = [['MY-01', '내 요청'], ['QT-01', '받은 견적'], ['CH-01', '채팅'], ['SE-05', '찜한 고수'], ['RV-02', '내 후기']];
  return `<aside class="side"><div class="gl">내 활동</div>${items.map(([id, label]) =>
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

  const head = o.solo ? '' : (o.guest ? gnbGuest(ctx.id) : gnb(ctx.id, o));

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
${head}
${back}
${stateBar}
${o.hero || ''}
<main class="main ${o.stick ? 'pb-stick' : ''} ${o.mainCls || ''}">${o.full ? body : `<div class="${o.wrapCls || 'wrap'}">${body}</div>`}</main>
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

/** 레이아웃 A 히어로 — 왼쪽에 큰 제목과 설명, 오른쪽에 폼 카드 */
export const heroSplit = (o) => `<section class="hero-split"><div class="wrap in">
  <div>
    ${o.kicker ? `<div class="kicker">${o.kicker}</div>` : ''}
    <h1>${o.title}</h1>
    ${o.sub ? `<p class="sub">${o.sub}</p>` : ''}
    ${o.figs ? `<div class="figs">${o.figs.map(([n, l]) => `<div class="fig"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('')}</div>` : ''}
  </div>
  <div class="hero-card">${o.card}</div>
</div></section>`;

/** 레이아웃 A 상세 — 본문 한 단(최대 760px). 액션은 하단 고정 바로 뺀다. */
export const article = (body) => `<div class="wrap-read">${body}</div>`;

/** 하단 고정 액션 바 */
export const stickBar = (left, right) => `<div class="stick"><div class="stick-in"><div>${left}</div><div class="btns">${right}</div></div></div>`;

export const detail2 = (main, aside) => `<div class="split-r"><div>${main}</div><div class="sticky">${aside}</div></div>`;
export const proPage = (activeId, body) => `<div class="split">${proNav(activeId)}<div>${body}</div></div>`;
export const myPage = (activeId, body) => `<div class="split">${myNav(activeId)}<div>${body}</div></div>`;
export const filterPage = (filter, body) => `<div class="split">${filter}<div>${body}</div></div>`;

export const soloBox = (title, sub, body, o = {}) => `<div class="solo${o.lg ? ' solo-lg' : ''}"><div class="solo-box">
  <div class="logo mb4"><span class="mark">${SITE.mark}</span>${SITE.name}</div>
  ${o.steps || ''}
  <h1 class="t-sec">${title}</h1>${sub ? `<p class="t-sub mt1 center">${sub}</p>` : ''}
  <div class="mt6">${body}</div></div></div>`;

/** 모달 — data-modal 로 연다 */
export const modal = (id, title, body, ft) => `<template id="${id}"><div class="modal">
  <div class="modal-hd"><h3 class="t-card">${title}</h3><button class="btn btn-quiet btn-sm" type="button" data-dismiss>✕</button></div>
  <div class="modal-bd">${body}</div>
  ${ft ? `<div class="modal-ft">${ft}</div>` : ''}</div></template>`;

/** 화면 안에 모달을 펼쳐 보여 준다 — 프로토타입이라 "이렇게 생겼다"를 그대로 둔다 */
export const modalStatic = (title, body, ft, o = {}) => `<div class="modal ${o.cls || ''}" style="margin:0 auto;box-shadow:var(--sh-pop)">
  <div class="modal-hd"><h3 class="t-card">${title}</h3><span class="btn btn-quiet btn-sm">✕</span></div>
  <div class="modal-bd" style="max-height:none">${body}</div>
  ${ft ? `<div class="modal-ft">${ft}</div>` : ''}</div>`;
