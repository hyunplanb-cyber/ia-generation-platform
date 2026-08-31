/* 공통 UI 조각
   - 색·글꼴·모서리·간격은 가이드 프리셋 01 내추럴 그린
   - 화면 뼈대(폭 꽉 찬 히어로 + 큰 검색바 · 카드 그리드 3~4열 ·
     상단 가로 GNB · 본문 왼쪽 + 따라다니는 요약 카드)는 레이아웃 프리셋 A 검색 중심형
   - 카드 모양은 «정사각 카드» — 사진이 위쪽을 정사각으로 채우고 아래에 제목·정보·가격

   조각을 여기 모아 두는 까닭: 같은 것을 화면마다 다시 적으면 반드시 갈라진다.
   ★ 이 팩의 주인공은 «날짜별 재고 달력»이다. cal() 이 그것이다. */
import { SITE, NAV, ST_CLS, GEAR, 남은수, 점검일, 할증요일 } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* 받침을 보고 조사를 고른다 — 「텐트를」·「사진을」처럼 읽히게 한다.
   assets/js/app.js 의 조사붙이기와 같은 규칙이되, «끝이 숫자»일 때를 읽는 소리로 가른다
   (1=일 → 을, 2=이 → 를). 닫는 괄호는 건너뛴다 — 「(2개)」는 「개」로 본다.
   ⚠ 이것이 없으면 손님 화면에 「을(를)」이 그대로 나간다(2026-08-19 검수). */
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
export const gearOf = (id) => GEAR.find((g) => g.id === id);

/* 스펙팩이 정한 화면만 있으므로, 없는 화면을 가리키는 링크는 같은 메뉴의 첫 화면으로 옮긴다.
   ⚠ 이것을 빠뜨리면 «끊어진 링크»가 100개 단위로 생긴다. 실제로 다른 팩에서 220개 났다. */
let PAGES = null;
export const setPages = (ids) => { PAGES = new Set(ids); };
export function toPageId(id) {
  const s = String(id);
  if (!PAGES || PAGES.has(s)) return s;
  /* ⚠ 두 방향을 다 이어야 한다.
     3뎁스 팩에서는 화면 목록이 HO0101 꼴인데, 2뎁스 빌더는 'HO-01' 로 부른다.
     이것을 안 이으면 «끊어진 링크»가 화면 수만큼 생긴다 — 2026-08-10 에 161장 났다.
     같은 병으로 다른 팩에서 220개가 난 적이 있다. 세 번째다. */
  // ① 2뎁스 이름(HO-01) → 3뎁스 코드(HO0101)
  const 짧은 = /^([A-Z]{2})-(\d{2})$/.exec(s);
  if (짧은) {
    const 긴 = `${짧은[1]}${짧은[2]}01`;
    if (PAGES.has(긴)) return 긴;
  }
  // ② 3뎁스 코드(HO0102) → 2뎁스 이름(HO-01)
  const m = /^([A-Z]{2})(\d{2})\d{2}$/.exec(s);
  const want = m ? `${m[1]}-${m[2]}` : s;
  if (PAGES.has(want)) return want;
  // ③ 그래도 없으면 같은 메뉴의 첫 화면으로
  const code = s.slice(0, 2);
  return [...PAGES].find((p) => p.startsWith(`${code}-`))
      || [...PAGES].find((p) => p.startsWith(code))
      || want;
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
/** 장비 사진 — 카드 위쪽을 정사각으로 채운다(레이아웃 card.square) */
export const phGear = (seed, o = {}) => ph(['장비 사진', 800, 800], { seed, cls: 'ph-card', ...o });
export const av = (nm) => `<span class="av">${esc(String(nm).slice(0, 1))}</span>`;

/* ---------- 작은 조각 ---------- */
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
export const stBadge = (st) => badge(esc(st), ST_CLS[st] || 'b-mut');
export const stars = (r) => `<span class="stars" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
export const rateLine = (r, rv) => `${stars(r)} <b>${r.toFixed(1)}</b> <span class="muted">(${num(rv)})</span>`;

/**
 * ⚠ 잠기는 버튼은 <a> 로 만들 수 없다 — <a> 에는 disabled 가 없다.
 *
 * 2026-08-10 에 여기서 크게 걸렸다. 전에는 href 가 있으면 무조건 <a> 를 만들면서
 * id 와 off 를 «조용히 버렸다». 그래서 결제·수령·서명 화면에서
 * 「동의에 체크하시면 버튼이 열립니다」라고 써 놓고 **처음부터 열려 있었다.**
 * 화면은 멀쩡해 보이고 검사기 넷도 다 통과했다. 눌러 보고서야 나왔다.
 *
 * 그래서 잠글 것이 있으면(id·off) href 가 있어도 <button> 으로 만들고,
 * 옮기는 일은 data-go 로 app.js 에 맡긴다.
 */
export const btn = (t, o = {}) => {
  const cls = `btn ${o.cls || 'btn-ghost'}${o.sm ? ' btn-sm' : ''}${o.lg ? ' btn-lg' : ''}${o.w ? ' btn-w' : ''}`;
  const 잠글것 = o.id || o.off;
  if (o.href && !잠글것) return `<a class="${cls}" href="${link(o.href)}"${o.attr || ''}>${t}</a>`;
  const go = o.href ? ` data-go="${link(o.href)}"` : '';
  return `<button class="${cls}${o.off ? ' is-off' : ''}"${o.id ? ` id="${o.id}"` : ''} type="button"${o.off ? ' disabled' : ''}${go}${o.attr || ''}>${t}</button>`;
};

export const chip = (t, on = false, extra = '') => `<button class="chip${on ? ' on' : ''}" type="button"${extra}>${esc(t)}</button>`;
/* 칩 이름에서 «거르개 값»을 뽑는다 — 「텐트 6」은 텐트, 「전체 …」는 * 다.
   무리 이름이 카드의 종류와 다를 때는 { t: '촬영 장비', cat: '촬영' } 처럼 짝을 지어 준다. */
export const 갈래키 = (t) => {
  if (t && typeof t === 'object') return t.cat;
  let s = String(t);
  const i = s.lastIndexOf(' ');
  if (i > 0) {
    const 뒤 = s.slice(i + 1);
    if (뒤.length && [...뒤].every((c) => c >= '0' && c <= '9')) s = s.slice(0, i);
  }
  return s === '전체' ? '*' : s;
};
/* o.cat 을 주면 칩마다 data-catf 가 붙어 «실제로 목록이 줄어든다».
   ⚠ 없으면 켜짐 표시만 바뀌고 카드는 그대로다(검수공통 3단계 첫 줄). */
export const chips = (list, onIdx = -1, o = {}) =>
  `<div class="chips">${list.map((t, i) => chip(typeof t === 'object' ? t.t : t,
    Array.isArray(onIdx) ? onIdx.includes(i) : i === onIdx,
    (o.cat ? ` data-catf="${esc(갈래키(t))}"` : '') + (o.extra || ''))).join('')}</div>`;

export function tabs(list, onIdx = 0, o = {}) {
  const cls = o.pill ? 'tabs-pill' : 'tabs';
  return `<div class="${cls}">${list.map((t, i) => {
    const label = typeof t === 'string' ? t : t.label;
    const cnt = typeof t === 'object' && t.cnt != null ? `<span class="cnt">${t.cnt}</span>` : '';
    /* 다른 화면으로 가는 탭은 data-go, 같은 화면 안에서 바뀌는 탭은 data-pane.
       ⚠ 탭과 몸통은 «같은 상자» 안에 있어야 한다. 갈라 두면 색만 바뀌고 몸통은 그대로다. */
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
  `<div class="banner banner-${kind} ${o.cls || ''}">${ico ? `<span class="ico">${ico}</span>` : ''}<div class="grow">${html}</div>${o.right || ''}</div>`;

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
/** 보증금 줄 — 대여료와 «다른 돈»이라 선으로 갈라 둔다. 여기서 오해가 가장 많다. */
export const depositRow = (amt, note) => `<div class="deposit-line">
  <div class="sum-row"><span class="muted">보증금 <span class="t-sub">(걸어두는 돈)</span></span><span><b>${won(amt)}</b></span></div>
  ${note ? `<p class="t-sub mt2">${note}</p>` : ''}</div>`;

export const progress = (pct, kind) => `<div class="progress"><div class="fill ${kind || ''}" style="width:${Math.min(100, Math.max(0, pct))}%"></div></div>`;
/** 보증금에서 얼마 빠지고 얼마 남는지 — 막대로 */
export const barSplit = (빠짐, 남음) => {
  const 합 = 빠짐 + 남음 || 1;
  return `<div class="bar-split">
    <div class="a" style="width:${Math.round(빠짐 / 합 * 100)}%">차감 ${won(빠짐)}</div>
    <div class="b" style="width:${Math.round(남음 / 합 * 100)}%">환급 ${won(남음)}</div>
  </div>`;
};

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

/* 정렬 고르개 — <select data-sort-cards="…"> 와 <div data-sort-list="…"> 가 «한 벌»이다.
   목록은 [값, 이름, 큰것부터?] 셋으로 준다. assets/js/app.js 가 이 값을 보고 카드를 다시 세운다.
   ⚠ 그냥 select 로 두면 고른 값만 바뀌고 목록은 그대로다 — 2026-09-01 검수에서 되찾았다. */
export const 정렬고르개 = (종류, 목록) =>
  `<select class="sel" data-sort-cards="${종류}">${목록.map(([v, t, 큰것부터]) =>
    `<option value="${v}"${큰것부터 ? ' data-desc' : ''}>${esc(t)}</option>`).join('')}</select>`;
export const textarea = (o = {}) => `<textarea class="ta"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}>${o.v ? esc(o.v) : ''}</textarea>`;
export const check = (label, o = {}) => `<label class="check${o.none ? ' none' : ''}">
  <input type="checkbox"${o.on ? ' checked' : ''}${o.attr || ''}>
  <span>${label}${o.sub ? `<span class="sub">${o.sub}</span>` : ''}</span></label>`;
export const toggle = (on = false, toastMsg = '') => `<button class="toggle${on ? ' on' : ''}" type="button" aria-pressed="${on}"${toastMsg ? ` data-toast="${esc(toastMsg)}"` : ''}></button>`;
export const stepper = (v, o = {}) => `<div class="step">
  <button type="button" aria-label="줄이기"${o.toast ? ` data-toast="${esc(o.toast)}"` : ''}>−</button>
  <span class="v num">${v}</span>
  <button type="button" aria-label="늘리기"${o.toast ? ` data-toast="${esc(o.toast)}"` : ''}>＋</button></div>`;

/* ---------- 장비 카드 ---------- */
export function gearCard(g, o = {}) {
  const 남 = o.left != null ? o.left : g.total;
  const 남배지 = 남 === 0
    ? badge('빌려줄 수 있는 게 없어요', 'left-n none')
    : badge(`${g.total}대 중 ${남}대 남음`, `left-n${남 <= 2 ? ' few' : ''}`);
  /* o.i 를 주면 정렬에 쓰는 값이, o.cat 을 주면 거르기에 쓰는 값이 카드에 실린다.
     이 값이 없으면 고르개를 눌러도 카드가 안 움직인다. */
  const 정렬값 = o.i == null ? ''
    : ` data-rec="${o.i}" data-price="${g.day}" data-rate="${g.r}" data-left="${남}" data-many="${g.rv}"`;
  /* 촬영 쪽 넷(카메라·렌즈·짐벌·조명)은 화면에서 「촬영 장비」 한 무리로 거른다. */
  const 갈래 = ['카메라', '렌즈', '짐벌', '조명'].includes(g.cat) ? '촬영' : g.cat;
  const 갈래값 = o.cat ? ` data-cat="${esc(갈래)}"` : '';
  return `<a class="item${남 === 0 ? ' off' : ''}"${정렬값}${갈래값} href="${link(o.href || 'PD-02')}">
    <div class="thumb">${phGear(g.id)}
      <div class="on-thumb">${남배지}</div>
      <button class="heart" type="button" aria-label="찜하기">♡</button>
    </div>
    <div class="bd">
      <div class="nm">${esc(g.nm)}</div>
      <div class="meta">${esc(g.brand)} · ${rateLine(g.r, g.rv)}</div>
      ${남 === 0 && o.nextDay ? `<div class="t-sub warn">${o.nextDay}부터 가능</div>` : ''}
      <div class="price"><span class="d">${num(g.day)}</span><span class="u">원 / 1일</span>
        <div class="t-sub">보증금 ${won(g.dep)}</div></div>
    </div></a>`;
}

/* ============================================================
   ★ 날짜별 재고 달력 — 이 팩의 주인공
   쇼핑몰 재고는 「몇 개 남았나」인데 렌탈 재고는 「이 날짜에 비었나」다.
   숫자와 색을 «함께» 준다. 색만으로 알리면 못 읽는 사람이 생긴다.
   ============================================================ */
export function cal(gearId, o = {}) {
  const 필요 = o.qty || 1;
  const 고름 = o.sel || [];           // [시작일, 끝일]
  const 요일 = ['일', '월', '화', '수', '목', '금', '토'];
  // 2026년 8월 1일은 토요일이다. 앞을 여섯 칸 비운다.
  const 앞빈칸 = 6;
  const 마지막 = 31;
  const 칸 = [];
  for (let i = 0; i < 앞빈칸; i++) 칸.push('<div class="cal-d past" aria-hidden="true"></div>');
  for (let d = 1; d <= 마지막; d++) {
    const 남 = 남은수(gearId, d);
    const 지남 = d < 10;
    const 점검 = 점검일.includes(d);
    const dow = (앞빈칸 + d - 1) % 7;
    const 할증 = 할증요일.includes(dow);
    const 안 = 고름.length === 2 && d > 고름[0] && d < 고름[1];
    const 끝 = 고름.includes(d);
    let cls = 'cal-d';
    let 못누름 = false;
    if (지남) { cls += ' past'; 못누름 = true; }
    else if (점검) { cls += ' fix'; 못누름 = true; }
    else if (남 < 필요) { cls += ' none'; 못누름 = true; }
    else if (남 <= 2) cls += ' few';
    else cls += ' plenty';
    if (끝) cls += ' sel';
    else if (안) cls += ' mid';
    const 속 = 지남
      ? `<span class="dd">${d}</span>`
      : 점검
        ? `<span class="dd">${d}</span><span class="n">점검일</span>`
        : `<span class="dd">${d}</span><span class="n">${남}대</span>${할증 && !못누름 ? '<span class="fee">주말 +20%</span>' : ''}`;
    칸.push(`<button class="${cls}" type="button"${못누름 ? ' disabled' : ''}${점검 ? ' data-why="반납 다음 날은 손질하는 날이라 못 빌려요"' : ''} aria-label="8월 ${d}일 ${못누름 ? '불가' : `${남}대 가능`}">${속}</button>`);
  }
  return `<div class="cal-hd">
    <button class="cal-mv" type="button" data-mv="-1" aria-label="이전 달" disabled>‹</button>
    <span class="cal-m">2026년 8월</span>
    <button class="cal-mv" type="button" data-mv="1" aria-label="다음 달">›</button>
  </div>
  <div class="cal-grid">
    ${요일.map((w) => `<div class="hd">${w}</div>`).join('')}
    ${칸.join('')}
  </div>
  <div class="cal-legend">
    <span><i style="background:rgba(21,128,61,.10)"></i>넉넉해요 (3대 이상)</span>
    <span><i style="background:rgba(161,98,7,.12)"></i>얼마 안 남았어요 (1~2대)</span>
    <span><i style="background:#F4F6F4"></i>다 나갔어요</span>
    <span><i style="background:repeating-linear-gradient(45deg,#F4F6F4,#F4F6F4 3px,#EDF0ED 3px,#EDF0ED 6px)"></i>점검일</span>
  </div>`;
}

/* ---------- 화면 뼈대 ---------- */
export const pageHd = (title, sub, aside) => `<div class="page-hd">
  <div><h1 class="t-page">${title}</h1>${sub ? `<p class="t-sub">${sub}</p>` : ''}</div>
  ${aside ? `<div class="btns">${aside}</div>` : ''}</div>`;

/** 상세 — "본문 왼쪽 + 오른쪽에 따라다니는 요약·액션 카드(sticky)" */
export const detail2 = (main, aside) => `<div class="split-r"><div>${main}</div><div class="sticky stack" style="gap:var(--sp-block)">${aside}</div></div>`;
/** 목록 — 좌측 필터 + 우측 카드 그리드 */
export const listPage = (filter, body) => `<div class="split-l"><div class="sticky">${filter}</div><div>${body}</div></div>`;
export const stickBar = (left, right) => `<div class="stick"><div class="stick-in"><div>${left}</div><div class="btns">${right}</div></div></div>`;
export const solo = (title, sub, body) => `<div class="solo-wrap"><div class="solo-card">
  <h1 class="t-sec mb2">${title}</h1>${sub ? `<p class="t-sub mb6">${sub}</p>` : ''}${body}</div></div>`;

export const modal = (id, title, body, ft) => `<template id="${id}"><div class="modal">
  <div class="m-hd"><h3 class="t-card">${title}</h3><button class="x" type="button" data-dismiss aria-label="닫기">✕</button></div>
  <div class="m-bd">${body}</div>${ft ? `<div class="m-ft">${ft}</div>` : ''}</div></template>`;

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

/** 한 장의 HTML 을 완성한다. o.solo 를 주면 GNB 만 두고 가운데 카드 한 장으로 그린다. */
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
    <a class="cart" href="${link('CT-01')}" aria-label="장바구니"><span aria-hidden="true">🧺</span><span class="n">2</span></a>
    <a class="btn btn-ghost btn-sm" href="${link('MY-01')}">내 대여</a>
  </div>
</div></header>
${o.hero || ''}
<main class="main">${o.bare ? body : `<div class="wrap">${back}${body}</div>`}</main>
${o.stick || ''}
${devPanel(ctx)}
<script src="../assets/js/app.js"></script>
</body></html>`;
}
