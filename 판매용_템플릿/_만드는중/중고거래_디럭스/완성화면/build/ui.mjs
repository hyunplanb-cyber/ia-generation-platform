/* 공통 UI 조각
   - 색·글꼴·모서리는 가이드 프리셋 01 코럴 선셋
   - 화면 뼈대(히어로 없음 · 좌측 필터 사이드바 · 상단 요약 바 + 탭 상세)는
     레이아웃 프리셋 A 목록 중심형
   - 카드 모양은 "가로 행(row)" — 왼쪽 정사각 사진, 가운데 정보, 오른쪽 값과 액션.
     훑어보고 견주는 목록이 이 장터의 첫 동작이라 이 모양을 기본으로 잡았다.

   이 장터의 특징을 조각으로 따로 뺐다 —
     매너 온도 · 거래 방식 배지 · 끌올 배지 · 안전결제 4단계 · 좌측 필터 패널.

   ⚠ 짧은 상자 이름(.in .on .go .sel)은 이미 쓰이고 있다고 보고 붙이지 않는다.
     2026-08-10 에 히어로 속통을 class="in" 으로 감쌌다가 입력칸 높이(42px)가 먹어
     화면 위쪽 절반이 뭉개진 채로 팔린 적이 있다. */
import { SITE, NAV, NAV_PRO, ST_CLS, userBy, itemBy, ago, ESCROW_STEPS, UNREAD_MSGS } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* 「20~30만원」에서 «윗값»을 뽑는다 — 예산 높은순으로 세울 때 쓴다. */
export const 예산최대 = (s) => {
  const 토막 = String(s).split('만원')[0].split('~');
  const 끝 = 토막[토막.length - 1];
  let n = '';
  for (const c of 끝) if (c >= '0' && c <= '9') n += c;
  return n || '0';
};
/* 받침을 보고 조사를 고른다 — 「한결이사를」·「1만원을」처럼 읽히게 한다.
   assets/js/app.js 의 조사붙이기와 같은 규칙이되, «끝이 숫자»일 때를 읽는 소리로 가른다
   (1=일 → 을, 2=이 → 를). 닫는 괄호는 건너뛴다 — 「(2개)」는 「개」로 본다.
   ⚠ 이것이 없으면 손님 화면에 「깔끔한하루 을」이 그대로 나간다
      (2026-09-07 검수 — 매칭_프리미엄에서 아홉 자리가 그랬다). */
export function 조사붙이기(말, 있, 없) {
  let s = String(말 == null ? '' : 말).trim();
  while (s && ')]}」』'.includes(s[s.length - 1])) s = s.slice(0, -1);
  const c = s[s.length - 1];
  if (!c) return 없;
  if (c >= '0' && c <= '9') return '0136789'.includes(c) ? 있 : 없;
  const code = c.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? 있 : 없;
}
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
/** 매물 썸네일 — 목록의 왼쪽 정사각 자리.
   ⚠ 물건 사진은 품질도 비율도 제각각이다. 그래서 자리를 정사각으로 못 박고
     모든 행에서 같은 크기를 쓴다(2026-08-11 매칭 팩에서 썸네일이 제각각이라 줄이 흔들렸다). */
export const phItem = (px, seed) => phFix(['물건 사진', 1000, 1000], px, { cls: 'ph-sq', seed });
/** 매물 큰 사진 — 4:3 으로 통일한다 */
export const phShot = (seed, o = {}) => ph(['물건 사진', 1200, 900], { seed, ...o });
/** 지도·차트 자리 — 여기에는 사진을 «넣지 않는다».
   이미지-끼우기.mts 가 ph-map 을 보고 건너뛴다. 지도 자리에 물건 사진이 들어가면 거짓말이 된다. */
export const phMap = (what, w, h, o = {}) => ph([what, w, h], { cls: 'ph-map', ...o });

/* ---------- 작은 조각 ---------- */
export const stars = (r, lg) => `<span class="stars${lg ? ' lg' : ''}" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
export const rateLine = (r, rv) => `${stars(r)} <b>${r.toFixed(1)}</b> <span class="muted">(${num(rv)})</span>`;
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
export const stBadge = (st) => badge(st, ST_CLS[st] || 'b-mut');
/** 인증 배지 — 무엇이 확인됐는지 */
export const verify = (t) => `<span class="verify"><i>✓</i>${t}</span>`;
export const verifies = (list) => `<span class="verifies">${list.map(verify).join('')}</span>`;

/* ⛔ 잠글 것은 <a> 로 만들 수 없다 — <a> 에는 disabled 가 없다.
   href 와 off/id 를 함께 주면 예전에는 «조용히» 잠금을 버려서, 「동의하면 열립니다」라고
   써 놓은 단추가 처음부터 열려 있었다(렌탈 팩 5군데, 2026-08-10 · 이 팩 결제 단추, 2026-09-07).
   이제는 만들 때 멈춘다. 잠글 것은 data-go 를 쓰고 옮기는 일은 app.js 에 맡긴다. */
export const btn = (t, o = {}) => {
  if (o.href && (o.off || o.id)) {
    throw new Error(`btn("${t}") — 잠그거나 id 를 붙일 단추에는 href 를 쓸 수 없습니다.`
      + ` <a> 에는 disabled 가 없어 잠금이 조용히 사라집니다.`
      + ` attr: ' data-go="${link(o.href)}"' 로 바꾸세요.`);
  }
  return o.href ? `<a class="btn ${o.cls || 'btn-ghost'}" href="${link(o.href)}"${o.attr || ''}>${t}</a>`
    : `<button class="btn ${o.cls || 'btn-ghost'}"${o.id ? ` id="${o.id}"` : ''} type="button"${o.off ? ' disabled' : ''}${o.attr || ''}>${t}</button>`;
};

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
  const 값들 = (d) => (d ? Object.entries(d).map(([k, v]) => ` data-${k}="${String(v).replace(/"/g, '&quot;')}"`).join('') : '');
  const tr = rows.map((r) => `<tr class="${r.cls || ''}"${값들(r.data)}>${(r.cells || r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  const tf = o.foot ? `<tfoot><tr>${o.foot.map((c) => `<td>${c}</td>`).join('')}</tr></tfoot>` : '';
  return `<div class="table-wrap ${o.scroll === false ? '' : 'table-scroll'}"><table class="table ${o.cls || ''}${o.fix ? ' table-fix' : ''}"><thead><tr>${th}</tr></thead><tbody${o.listKey ? ` data-filter-list="${o.listKey}"` : ''}>${tr}</tbody>${tf}</table></div>`;
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

/* ---------- 중고거래 전용 ---------- */

/** 매너 온도 — 36.5 에서 시작해 후기가 쌓여 오르내린다.
   이 장터에서 「이 사람에게 사도 되나」를 재는 자다. 가장 크게 보여야 한다. */
export const mannerCls = (v) => (v >= 42 ? 'mn-hi' : v >= 37 ? 'mn-ok' : v >= 34 ? 'mn-mid' : 'mn-low');
export const manner = (v, o = {}) => `<span class="manner ${mannerCls(v)}${o.big ? ' big' : ''}" title="매너 온도 (36.5에서 시작)">
  <i>🌡</i><b>${v.toFixed(1)}</b><span class="deg">도</span></span>`;

/** 거래 방식 배지 — 직거래·택배·안전결제 */
export const wayBadges = (ways) => ways.map((w) => badge(w, w === '안전결제' ? 'b-ok' : 'b-mut')).join('');

/** 끌올 배지 — 광고라는 것을 숨기지 않는다 */
export const boostBadge = () => `<span class="badge b-acc" title="유료로 목록 위에 올린 글입니다">끌올</span>`;

/** 매물 가로 행 — 이 장터의 기본 카드 모양(row).
   왼쪽 정사각 썸네일 · 가운데 제목과 동네·시각 · 오른쪽 값과 찜.

   o.i 를 주면 정렬에 쓰는 값이 줄에 실린다 — 없으면 고르개만 바뀌고 차례는 그대로다.
   (2026-09-01 검수에서 매칭 팩이 이걸 빠뜨려 「거르개가 목록을 안 줄인다」로 걸렸다.) */
export function itemRow(it, o = {}) {
  const u = userBy(it.by);
  const 정렬값 = o.i == null ? ''
    : ` data-i="${o.i}" data-price="${it.price}" data-dist="${it.dist}" data-min="${it.min}" data-wish="${it.wish}" data-st="${it.st}" data-cat="${esc(it.cat)}" data-cond="${esc(it.cond)}" data-ways="${it.ways.join(',')}"`;
  const 끝난것 = it.st === '거래완료';
  const 태그 = o.href === false ? 'div' : 'a';
  return `<${태그} class="item-row${끝난것 ? ' done' : ''}"${정렬값}${o.href === false ? '' : ` href="${link(o.href || 'SE-04')}"`}>
    ${o.pick ? `<label class="check none" style="padding-top:2px"><input type="checkbox" data-pick${o.picked ? ' checked' : ''}></label>` : ''}
    <span class="thumb">${phItem(o.sm ? 68 : 92, it.id)}${it.st !== '판매중' ? `<span class="veil" data-t="${it.st}"></span>` : ''}</span>
    <span class="mid">
      <span class="row-c wrap-row">${it.boost ? boostBadge() : ''}<b class="nm">${esc(it.t)}</b></span>
      <span class="met"><span class="k">${esc(it.town)}</span><span class="k">${ago(it.min)}</span><span class="k">${it.dist}km</span></span>
      <span class="price${끝난것 ? ' off' : ''}">${won(it.price)}</span>
      <span class="ways">${wayBadges(it.ways)}${badge(it.cond, 'b-mut')}</span>
    </span>
    <span class="act">
      ${o.heart === false ? '' : `<button class="heart" type="button" aria-label="찜하기" data-wish="${it.wish}">♡<span class="n">${it.wish}</span></button>`}
      <span class="talk"><span class="k">채팅</span> <b>${it.chat}</b></span>
      ${o.tail || ''}
    </span>
  </${태그}>`;
}

/** 매물 작은 카드 — 「비슷한 매물」·「이 판매자의 다른 매물」처럼 넷씩 늘어놓는 자리 */
export function itemCard(it, o = {}) {
  return `<a class="item-card" href="${link(o.href || 'SE-04')}">
    ${phItem(140, it.id)}
    <span class="nm">${esc(it.t)}</span>
    <span class="price">${won(it.price)}</span>
    <span class="met"><span class="k">${esc(it.town)} · ${ago(it.min)}</span></span>
    ${o.why ? badge(o.why, 'b-acc') : ''}
  </a>`;
}

/** 회원 카드 — 「이 사람에게 사도 되나」를 재는 자리 */
export function userCard(u, o = {}) {
  return `<div class="user-card">
    ${phAva(56, u.id)}
    <div class="mid">
      <div class="row-c wrap-row"><a class="nm" href="${link(o.href || 'MY-01')}">${esc(u.nick)}</a>${manner(u.manner)}</div>
      <div class="met"><span class="k">${esc(u.town)}</span><span class="k">판 것 ${u.sold}</span><span class="k">산 것 ${u.bought}</span></div>
      <div class="met"><span class="k">응답률</span> <b>${u.resp}%</b> <span class="k">${respText(u.respMin)}</span></div>
      ${u.tags.length ? `<div class="verifies mt-item">${u.tags.map(verify).join('')}</div>` : `<div class="mt-item t-sub">아직 인증한 것이 없어요</div>`}
    </div>
    ${o.right || ''}
  </div>`;
}

/** 안전결제 4단계 — 지금 어디까지 왔나.
   지난 칸은 채우고 시각을 적고, 지금 칸은 테두리를 굵게, 남은 칸은 회색. */
export const escrow = (step, times = []) => `<div class="escrow">${ESCROW_STEPS.map((t, i) => `
  <div class="es ${i < step ? 'done' : (i === step ? 'on' : 'todo')}">
    <span class="dot">${i < step ? '✓' : i + 1}</span>
    <span class="lb">${t}</span>
    <span class="when">${times[i] || ''}</span>
  </div>`).join('')}</div>`;

/** 지금 누구 차례인지 — 단계 표시 아래에 «반드시» 한 줄로 적는다 */
export const turnLine = (txt, left) => `<div class="turn"><span class="ico">⏳</span><b>${txt}</b>${left ? `<span class="left">${left} 남음</span>` : ''}</div>`;

/** 좌측 필터 사이드바 — 레이아웃 A 가 목록 화면에서만 두라고 한 것 */
export const filterSide = (blocks, o = {}) => `<aside class="side side-filter">
  <div class="row-b mb3"><b>필터</b><button class="link quiet" type="button" data-reset>전체 해제</button></div>
  ${blocks.map((b) => `<div class="fl">
    <div class="fl-hd">${b.t}</div>
    <div class="fl-bd">${b.body}</div></div>`).join('')}
  ${o.after || ''}
</aside>`;

/** 값 내림 표시 — 이전 값에 취소선, 새 값을 굵게 */
export const priceDown = (was, now) =>
  `<span class="pd"><s>${won(was)}</s> <b>${won(now)}</b> ${badge(`${num(was - now)}원 내림`, 'b-acc')}</span>`;

/** 수수료 셈 — 세 숫자가 늘 아귀가 맞아야 한다. 한 함수에서 낸다. */
export const feeRows = (price, feeV, payoutV) => sumRows(
  [['물건 값', won(price)], ['수수료 3.5%', '− ' + won(feeV)]],
  ['판매자가 받는 돈', won(payoutV)],
);
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
const PRO_CODES = ['AD'];
export const isPro = (id) => PRO_CODES.includes(String(id).slice(0, 2));

function gnb(activeId, o = {}) {
  const pro = o.pro ?? isPro(activeId);
  const list = pro ? NAV_PRO : NAV;
  const nav = list.map((n) => `<a href="${link(n.id)}"${String(activeId).slice(0, 2) === n.id.slice(0, 2) ? ' class="on"' : ''}>${n.label}</a>`).join('');
  // 레이아웃 A — 로고 왼쪽, 액션 버튼 오른쪽 끝. 한 줄로 끝낸다.
  const util = pro
    ? `<span class="badge b-warn">대기 3</span>
       <button class="bell" type="button" data-toast="새 신고가 접수됐어요" aria-label="알림">🔔<span class="dot">3</span></button>
       <a class="btn btn-ghost btn-sm" href="${link('HO-01')}">손님 화면으로</a><a class="gnb-ava" href="${link('AD-05')}" title="운영자">${phAva(30, 'admin')}</a>`
    : `<a href="${link('SE-01')}" class="town">📍 ${SITE.myTown}</a>
       <button class="bell" type="button" data-toast="새 알림이 있어요" aria-label="알림">🔔<span class="dot">${UNREAD_MSGS}</span></button>
       <a class="btn btn-pri btn-sm" href="${link('SL-01')}">판매글 쓰기</a><a class="gnb-ava" href="${link('MY-01')}" title="내 정보">${phAva(30, 'me')}</a>`;

  return `<header class="gnb${pro ? ' pro' : ''}"><div class="gnb-in">
    <a class="logo" href="${link(pro ? 'AD-01' : 'HO-01')}"><span class="mark">${SITE.mark}</span>${SITE.name}${pro ? '<span class="badge b-pri" style="margin-left:2px">운영자</span>' : ''}</a>
    <nav class="gnb-nav">${nav}</nav>
    <div class="gnb-util">${util}</div>
  </div></header>`;
}

/** 비로그인 GNB — 로그인·가입 버튼이 오른쪽 끝에.
   ⚠ 비로그인 화면인데 헤더가 로그인 상태이면 안 된다(2026-08-19 LMS 에서 나온 흠). */
function gnbGuest(activeId) {
  const nav = [['HO-01', '홈'], ['SE-02', '매물 찾기'], ['HO-03', '안전거래 안내']]
    .map(([id, label]) => `<a href="${link(id)}"${String(activeId) === id ? ' class="on"' : ''}>${label}</a>`).join('');
  return `<header class="gnb"><div class="gnb-in">
    <a class="logo" href="${link('HO-01')}"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
    <nav class="gnb-nav">${nav}</nav>
    <div class="gnb-util">
      <a href="${link('HO-03')}">이용 안내</a>
      <a class="btn btn-ghost btn-sm" href="${link('SE-01')}">동네 설정</a>
      <a class="btn btn-pri btn-sm" href="${link('SL-01')}">판매글 쓰기</a>
    </div></div></header>`;
}

const footer = () => `<footer class="ft"><div class="ft-in">
  <div class="ft-cols">
    <div>
      <div class="logo mb3"><span class="mark">${SITE.mark}</span>${SITE.name}</div>
      <p class="t-sub">${SITE.company}<br>${SITE.biz}</p>
      <p class="t-sub mt3">당사는 통신판매중개자로서 거래 당사자가 아니며, 회원 간 거래에 관한 책임은 거래 당사자에게 있습니다.</p>
    </div>
    <div><h4>사기</h4><ul>
      <li><a href="${link('SE-02')}">매물 찾기</a></li><li><a href="${link('SE-01')}">내 동네 설정</a></li>
      <li><a href="${link('MY-03')}">찜한 물건</a></li><li><a href="${link('MY-02')}">구매 내역</a></li>
      <li><a href="${link('PA-01')}">안전결제</a></li></ul></div>
    <div><h4>팔기</h4><ul>
      <li><a href="${link('SL-01')}">판매글 쓰기</a></li><li><a href="${link('SL-05')}">내 판매글</a></li>
      <li><a href="${link('SL-03')}">시세 보기</a></li><li><a href="${link('BS-01')}">끌올하기</a></li>
      <li><a href="../index.html">전체 화면 목록</a></li></ul></div>
    <div><h4>고객센터</h4>
      <div class="tel">${SITE.tel}</div>
      <p class="t-sub">${SITE.hours}</p>
      <div class="btns mt3"><button class="btn btn-ghost btn-sm" type="button" data-toast="카카오톡 상담은 서버가 연결되면 열립니다">💬 카카오톡 상담</button><button class="btn btn-ghost btn-sm" type="button" data-toast="앱 내려받기는 서버가 연결되면 열립니다">📱 앱 다운로드</button></div>
      <div class="sns mt4"><span>IG</span><span>YT</span><span>BL</span><span>FB</span></div>
    </div>
  </div>
  <div class="ft-bot">
    <span>© 2026 ${SITE.name}. 이 사이트는 기획 검토용 프로토타입입니다.</span>
    <span>이용약관 · 개인정보처리방침 · 안전거래 정책 · 금지 품목</span>
  </div></div></footer>`;

/* ---------- 사이드바 ---------- */
/** 운영자 사이드바 — 대시보드형은 왼쪽 세로 메뉴가 이동 수단이다 */
export const proNav = (activeId) => {
  const groups = [
    ['신고', [['AD-01', '신고 처리 대기열', '3'], ['AD-02', '신고 상세·조치', '']]],
    ['정책', [['AD-03', '금지품목·거래규칙', '']]],
    ['돈', [['AD-04', '안전결제 정산·분쟁', '4']]],
  ];
  return `<aside class="side">
    ${groups.map(([g, items]) => `<div class="gl">${g}</div>${items.map(([id, label, n]) =>
    `<a href="${link(id)}"${activeId === id ? ' class="on"' : ''}>${label}${n ? `<span class="n">${n}</span>` : ''}</a>`).join('')}`).join('')}
    <div class="cr">
      <div class="t-sub">기한 넘긴 신고</div>
      <div class="row-b"><b class="big">1</b>${btn('보기', { href: 'AD-01', cls: 'btn-pri btn-xs' })}</div>
    </div>
  </aside>`;
};

/** 마이페이지 사이드바 */
export const myNav = (activeId) => {
  const items = [['MY-01', '내 프로필'], ['MY-02', '구매 내역'], ['SL-05', '내 판매글'], ['PA-05', '거래'], ['MY-03', '찜한 물건'], ['MY-05', '받은 후기'], ['BS-03', '끌올·광고'], ['MY-06', '알림 설정']];
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
