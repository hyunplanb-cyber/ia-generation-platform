/* 공통 UI 조각 — 반려견 유치원 등원 예약·운영 (프리미엄 · 3뎁스 172화면)
   - 색·글꼴·모서리·간격은 가이드 프리셋 03 「모던 네이비」
   - 화면 뼈대(좌측 세로 사이드바 + 상단 계정 줄 · 본문 전체 폭 · 사진 없는 카드)는
     레이아웃 프리셋 B 「대시보드형」
   ⚠ 디럭스(코럴 × 여백 중심형)와 «일부러 다른 얼굴»이다.

   조각을 여기 모아 두는 까닭: 같은 것을 화면마다 다시 적으면 반드시 갈라진다.
   ★ 이 팩의 알맹이는 checkRow()(등하원 체크·회차권 차감) · board()(반 편성 보드) ·
     noteCard()/gal()(알림장) · vacBadge()(백신 상태)다. */
import { SITE, NAV, NAV_OWNER, ST_CLS, CLASSES, clsNow, inClass, ME, MINE, STAFF } from './data.mjs';

/* ---------- 유틸 ---------- */
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const won = (n) => Number(n).toLocaleString('ko-KR') + '원';
export const man = (n) => Math.round(Number(n) / 10000).toLocaleString('ko-KR') + '만원';
export const num = (n) => Number(n).toLocaleString('ko-KR');
function hash(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0; return Math.abs(h); }
/** 받침을 보고 조사를 고른다 — 「초코가」·「보리가」처럼 읽히게 */
export function 조사(말, 있, 없) {
  const c = String(말).charCodeAt(String(말).length - 1) - 0xac00;
  return String(말) + (c >= 0 && c <= 11171 && c % 28 !== 0 ? 있 : 없);
}

/** 받침에 맞는 «토씨만» 돌려준다 — <b>이름</b>으로 처럼 태그 «밖»에 붙일 때 쓴다. */
export const 토씨 = (말, 있, 없) => 조사(말, 있, 없).slice(String(말).length);

/* 스펙팩이 정한 화면만 있으므로, 없는 화면을 가리키는 링크는 같은 메뉴의 첫 화면으로 옮긴다.
   ⚠ 이것을 빠뜨리면 «끊어진 링크»가 무더기로 생긴다.
   ⚠ 링크는 «반드시» link() 로만 적는다. href 를 손으로 적으면 반드시 하나가 어긋난다. */
let PAGES = null;
export const setPages = (ids) => { PAGES = new Set(ids); };
export function toPageId(id) {
  const s = String(id);
  if (!PAGES || PAGES.has(s)) return s;
  /* ⭐ 프리미엄은 3뎁스라 화면 이름이 «네 자리»다 — HO0101. 디럭스에서 옮겨 온 조각들은
     아직 두 자리 짧은 이름(HO-01)으로 적혀 있으므로 여기서 이어 준다.
     이 한 줄이 없으면 옮겨 온 화면의 링크가 통째로 끊어진다. */
  const 짧은 = /^([A-Z]{2})-(\d{2})$/.exec(s);
  if (짧은 && PAGES.has(`${짧은[1]}${짧은[2]}01`)) return `${짧은[1]}${짧은[2]}01`;
  const m = /^([A-Z]{2})(\d{2})\d{2}$/.exec(s);
  const want = m ? `${m[1]}-${m[2]}` : s;
  if (PAGES.has(want)) return want;
  const code = want.slice(0, 2);
  /* 그래도 못 찾으면 같은 메뉴의 첫 화면으로 옮긴다 — 끊어진 링크를 만들지 않는다 */
  return [...PAGES].find((p) => p.startsWith(`${code}-`))
      || [...PAGES].find((p) => p.startsWith(code)) || want;
}
export const link = (id) => `${toPageId(id)}.html`;

/* ---------- 이미지 자리 ----------
   가이드 imagePlaceholder: 테마 색으로 칠하지 않는다. 옅은 한 톤 + 1px 테두리로 두고,
   무엇이 들어갈 자리인지와 권장 크기를 적는다. 적은 비율은 «실제로» 지킨다.
   ⚠ 손님이 스스로 올릴 사진(반려견 사진·알림장 사진·사고 사진)은 끝까지 이 자리로 둔다.
     가짜 사진 주소를 지어내지 않는다 — 어디에 무엇을 넣어야 하는지가 보여야 한다. */
export function ph(spec, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const cls = ['ph', tone, o.cls || '', o.tiny ? 'ph-tiny' : ''].join(' ');
  const label = o.tiny
    ? `<span class="lb">${w}×${h}</span>`
    : `<span class="lb">이미지 영역 (${esc(what)} · <span class="sz">권장 ${w}×${h}</span>)</span>`;
  return `<div class="${cls}" style="aspect-ratio:${w}/${h}${o.style ? ';' + o.style : ''}">${label}</div>`;
}
/** 크기가 고정된 자리(프로필·썸네일) — 목록 안에서 flex 가 잡아당겨 타원이 되지 않게 못 박는다 */
export function phFix(spec, px, o = {}) {
  const [what, w, h] = spec;
  const tone = 't' + (hash(o.seed || what) % 5 + 1);
  const hh = Math.round(px * h / w);
  const cls = ['ph', 'ph-fix', tone, o.cls || 'ph-sq', 'ph-tiny'].join(' ');
  return `<div class="${cls}" style="width:${px}px;height:${hh}px" title="이미지 영역 (${esc(what)} · 권장 ${w}×${h})">${px >= 64 ? `<span class="lb">${w}×${h}</span>` : ''}</div>`;
}
/** 반려견 얼굴 — 언제나 정사각. 이름을 씨앗으로 삼아 화면마다 같은 톤이 나온다.
 *  ⚠ cls 를 'ph-round' 로 두면 안 된다 — 이미지-끼우기.mts 의 얼굴인가() 가
 *  ph-round/ph-circle/ph-ava 를 «사람 얼굴»로 보고 공용 인물(사람) 사진을 끼운다.
 *  강아지 사진 자리에 사람 얼굴이 들어가는 사고를 막으려고 'ph-dog' 를 따로 둔다
 *  (base.css 의 .ph-dog 는 .ph-round 와 같은 모서리 값을 쓴다 — 생김새는 그대로다). */
export const dogPh = (nm, px = 56) => phFix([`${nm} 사진`, 400, 400], px, { cls: 'ph-dog', seed: nm });
export const av = (nm) => `<span class="av">${esc(String(nm).slice(0, 1))}</span>`;

/* ---------- 작은 조각 ---------- */
export const badge = (t, k = '') => `<span class="badge ${k}">${t}</span>`;
export const stBadge = (st) => badge(esc(st), ST_CLS[st] || 'b-mut');
export const stars = (r) => `<span class="stars" aria-hidden="true">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;

/**
 * ⚠ 잠기는 버튼은 <a> 로 만들 수 없다 — <a> 에는 disabled 가 없다.
 * 잠글 것이 있으면(id·off) href 가 있어도 <button> 으로 만들고,
 * 옮기는 일은 data-go 로 app.js 에 맡긴다. 이 규칙을 두 번 어겼던 자리다.
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
  `<div class="chips"${o.boxAttr || ''}>${list.map((t, i) => chip(t, Array.isArray(onIdx) ? onIdx.includes(i) : i === onIdx, o.extra || '')).join('')}</div>`;

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
/** 탭 + 몸통을 «한 상자»로 묶어 준다 — 갈라 놓는 실수를 아예 못 하게.
    ⚠ app.js 의 탭 손잡이는 탭 «제 부모» 안에서만 몸통을 찾는다.
      tabs() 와 몸통을 따로 늘어놓으면 «눌리기는 하는데 내용이 안 바뀌는» 탭이 된다. */
export const tabBox = (list, panes, onIdx = 0, o = {}) =>
  `<div class="${o.cls || ''}">${tabs(list, onIdx, o)}<div class="mt6">${panes}</div></div>`;

export const sec = (title, body, o = {}) => `<section class="sec ${o.cls || ''}">
  ${title ? `<div class="sec-hd"><h2 class="t-sec">${title}</h2>${o.more ? `<a class="more" href="${link(o.more)}">${o.moreLabel || '전체 보기'} ›</a>` : (o.aside || '')}</div>` : ''}
  ${o.desc ? `<p class="t-sub mb4">${o.desc}</p>` : ''}
  ${body}</section>`;

export const card = (title, body, o = {}) => `<div class="card ${o.cls || ''}"${o.attr || ''}>
  ${title ? `<div class="card-hd"><h3 class="t-card">${title}</h3>${o.aside || ''}</div>` : ''}
  <div class="card-bd ${o.bdCls || ''}">${body}</div>
  ${o.ft ? `<div class="card-ft">${o.ft}</div>` : ''}</div>`;

export const box = (body, o = {}) => `<div class="box ${o.cls || ''}"${o.attr || ''}>${body}</div>`;

export const banner = (kind, ico, html, o = {}) =>
  `<div class="banner banner-${kind} ${o.cls || ''}"${o.attr || ''}>${ico ? `<span class="ico">${ico}</span>` : ''}<div class="grow">${html}</div>${o.right || ''}</div>`;

/* 가이드 screenGuides.빈 화면 — 「큰 이모지 + 친근한 문구 + 큰 primary 버튼」 */
export const empty = (ico, title, msg, btns = '', o = {}) => `<div class="empty"${o.attr || ''}>
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
    const attr = !Array.isArray(r) && r.attr ? r.attr : '';
    const href = !Array.isArray(r) && r.href ? ` data-href="${link(r.href)}" tabindex="0" role="link"` : '';
    return `<tr${cls}${href}${attr}>${cells.map((c) => (typeof c === 'object' ? `<td class="${c.cls || ''}"${c.attr || ''}>${c.t}</td>` : `<td>${c}</td>`)).join('')}</tr>`;
  }).join('');
  const tf = o.foot ? `<tfoot><tr>${o.foot.map((c) => (typeof c === 'object' ? `<td class="${c.cls || ''}">${c.t}</td>` : `<td>${c}</td>`)).join('')}</tr></tfoot>` : '';
  return `<div class="table-wrap ${o.scroll === false ? '' : 'table-scroll'}"${o.attr || ''}><table class="table ${o.cls || ''}${o.fix ? ' table-fix' : ''}"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody>${tf}</table></div>`;
}

export const kv = (pairs, o = {}) => `<dl class="kv ${o.cls || ''}">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
export const sumRows = (rows, total) => `${rows.map(([k, v, cls]) => `<div class="sum-row ${cls || ''}"><span class="muted">${k}</span><span>${v}</span></div>`).join('')}
  ${total ? `<div class="sum-row total"><span>${total[0]}</span><span class="price">${total[1]}</span></div>` : ''}`;

export const progress = (pct, kind) => `<div class="progress"><div class="fill ${kind || ''}" style="width:${Math.min(100, Math.max(0, pct))}%"></div></div>`;

export const timeline = (items) => `<div class="tl">${items.map((it) => `<div class="tl-item ${it.k || ''}">
  ${it.hh ? `<div class="hh">${esc(it.hh)}</div>` : ''}<div class="t">${it.t}</div>${it.d ? `<div class="d">${it.d}</div>` : ''}</div>`).join('')}</div>`;

export const steps = (list, onIdx) => `<div class="steps">${list.map(([t, d], i) =>
  `<div class="st ${i < onIdx ? 'done' : (i === onIdx ? 'on' : '')}">${t}${d ? `<span class="dt">${d}</span>` : ''}</div>`).join('')}</div>`;

export const accordion = (items, openIdx = -1) => `<div class="card"><div class="card-bd" style="padding-top:0;padding-bottom:0">
  ${items.map((it, i) => `<div class="acc-item${(Array.isArray(openIdx) ? openIdx.includes(i) : i === openIdx) ? ' on' : ''}"${it.attr || ''}>
    <button class="acc-q" type="button">${it.q}<span class="mk">＋</span></button>
    <div class="acc-a">${it.a}</div></div>`).join('')}</div></div>`;

/* ---------- 폼 ---------- */
export const field = (label, input, o = {}) => `<label class="field ${o.cls || ''}"${o.id ? ` id="${o.id}"` : ''}${o.hide ? ' hidden' : ''}>
  <span class="lb">${label}${o.req ? '<span class="req">*</span>' : ''}</span>
  ${input}${o.hint ? `<span class="hint">${o.hint}</span>` : ''}${o.err ? `<span class="err">${o.err}</span>` : ''}</label>`;
export const input = (o = {}) => `<input class="in ${o.cls || ''}" type="${o.type || 'text'}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.v ? ` value="${esc(o.v)}"` : ''}${o.off ? ' disabled' : ''}${o.attr || ''}>`;
export const select = (list, onIdx = 0, o = {}) => `<select class="sel"${o.attr || ''}>${list.map((t, i) => `<option${i === onIdx ? ' selected' : ''}${o.vals ? ` value="${esc(o.vals[i])}"` : ''}>${esc(t)}</option>`).join('')}</select>`;
export const textarea = (o = {}) => `<textarea class="ta"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.attr || ''}>${o.v ? esc(o.v) : ''}</textarea>`;
export const check = (label, o = {}) => `<label class="check${o.none ? ' none' : ''}">
  <input type="checkbox"${o.on ? ' checked' : ''}${o.attr || ''}>
  <span>${label}${o.sub ? `<span class="sub">${o.sub}</span>` : ''}</span></label>`;
export const radioRow = (name, list, onIdx = 0, o = {}) => `<div class="btns"${o.boxAttr || ''}>${list.map((t, i) =>
  `<label class="check none"><input type="radio" name="${name}"${i === onIdx ? ' checked' : ''}${o.extra || ''}${o.vals ? ` value="${esc(o.vals[i])}"` : ''}><span>${esc(t)}</span></label>`).join('')}</div>`;
export const toggle = (on = false, toastMsg = '', extra = '') => `<button class="toggle${on ? ' on' : ''}" type="button" aria-pressed="${on}"${toastMsg ? ` data-toast="${esc(toastMsg)}"` : ''}${extra}></button>`;
export const stepper = (v, o = {}) => `<div class="step"${o.attr || ''}>
  <button type="button" aria-label="줄이기" data-step-mv="-1">−</button>
  <span class="v num">${v}</span>
  <button type="button" aria-label="늘리기" data-step-mv="1">＋</button></div>`;

/* 업로드 — 손님이 스스로 올릴 사진 자리. 가짜 사진을 지어 넣지 않는다. */
export const uploadDrop = (msg, o = {}) => `<div class="upload-drop">${msg || '눌러서 사진을 올려 주세요 (여러 장 가능)'}</div>
  <div class="upload-thumbs">${(o.seed || []).map((s, i) => `<div class="u-item ph t${(i % 5) + 1}"><button type="button" aria-label="지우기">✕</button></div>`).join('')}</div>`;

/* ============================================================
   ★ 백신 상태 배지 — 정상 / 임박 / 만료
   이 배지가 AT-02 의 등원 체크 버튼을 «실제로» 잠근다. 장식이 아니다.
   ============================================================ */
export function vacBadge(dog, o = {}) {
  const d = dog.vacD;
  const t = dog.vac === '만료' ? `백신 만료 ${Math.abs(d)}일 지남`
    : dog.vac === '임박' ? `백신 만료 D-${d}`
      : (o.full ? `백신 정상 (${d}일 남음)` : '백신 정상');
  return badge(t, ST_CLS[dog.vac]);
}

/* ============================================================
   ★ 등하원 체크 줄 — 이 팩의 알맹이 ①
   등원: 시각을 적고 회차권을 1회 깎는다. 5분 안에는 되돌릴 수 있다.
   하원: 인계 보호자를 확인하고 재원 시간을 셈한다.
   ⚠ 잠기는 버튼이므로 «반드시» <button>(btn 의 id/off) 로 만든다.
   ============================================================ */
export function checkRow(dog, o = {}) {
  const 잠김 = dog.vac === '만료';
  const 끝남 = o.mode === 'out' ? !!dog.outAt : !!dog.inAt;
  const id = `${o.mode === 'out' ? 'out' : 'in'}-${dog.id}`;
  const meta = o.mode === 'out'
    ? `${dog.breed} · ${clsNmOf(dog)} · 등원 ${dog.inAt}`
    : `${dog.breed} · ${dog.kg}kg · ${clsNmOf(dog)}${dog.want ? ` · 예약 ${dog.want}` : ''}`;

  let act;
  if (끝남 && o.mode === 'out') {
    act = `<span class="pc-slip"><span class="t">${dog.outAt} 하원 완료</span>${badge('알림장 대상', 'b-acc')}</span>`;
  } else if (끝남) {
    act = `<span class="pc-slip"><span class="t">${dog.inAt} 등원</span>${badge('회차권 1회 차감', 'b-acc')}</span>`;
  } else if (잠김) {
    const 잠긴잔여 = dog.pass == null
      ? `<span class="pc-pass">정기 요일권</span>`
      : `<span class="pc-pass" data-pass-for="${dog.id}">잔여 <b data-pass-n>${dog.pass}</b>회</span>`;
    act = `${잠긴잔여}
      ${btn('등원 체크', { id, off: true, cls: 'btn-pri', sm: true, attr: ` data-checkin="${dog.id}" data-dog="${esc(dog.nm)}" data-want="${esc(dog.want || '09:00')}" data-pass="${dog.pass == null ? '' : dog.pass}"` })}
      <span class="t-sub dan">백신 확인이 필요해요</span>
      ${btn('원장 승인으로 풀기', { cls: 'btn-dan', sm: true, attr: ` data-vac-unlock="${id}" data-dog="${esc(dog.nm)}"` })}`;
  } else if (o.mode === 'out') {
    act = `<span class="pc-pass" data-stay="${dog.inAt}">재원 <b data-stay-out>—</b></span>
      ${btn('하원 체크', { cls: 'btn-pri', sm: true, id, attr: ` data-checkout="${dog.id}" data-dog="${esc(dog.nm)}" data-guardian="${esc(dog.guardian || '보호자')}"` })}`;
  } else {
    const pass = dog.pass == null
      ? `<span class="pc-pass">정기 요일권</span>`
      : `<span class="pc-pass" data-pass-for="${dog.id}">잔여 <b data-pass-n>${dog.pass}</b>회</span>`;
    act = `${pass}
      ${btn('등원 체크', { cls: 'btn-pri', sm: true, id, attr: ` data-checkin="${dog.id}" data-dog="${esc(dog.nm)}" data-want="${esc(dog.want || '09:00')}" data-pass="${dog.pass == null ? '' : dog.pass}"` })}`;
  }

  return `<div class="pc-check${끝남 ? ' done' : ''}${잠김 ? ' locked' : ''}" data-row="${dog.id}">
    <div class="who">${dogPh(dog.nm, 56)}
      <div class="grow"><div class="nm">${esc(dog.nm)} ${잠김 ? vacBadge(dog) : (dog.vac === '임박' ? vacBadge(dog) : '')}</div>
        <div class="ds">${esc(meta)}</div></div></div>
    <div class="act">${act}</div>
  </div>`;
}
function clsNmOf(dog) { const c = CLASSES.find((x) => x.id === dog.cls); return c ? c.nm : '-'; }

/* ============================================================
   ★ 반 편성 보드 — 이 팩의 알맹이 ②
   카드를 끌어다 놓으면 «진짜로» 다른 칸의 자식이 된다(app.js 가 appendChild 한다).
   끌기가 어려운 자리를 위해 «카드를 고르고 → 칸을 누른다» 길도 함께 둔다.
   정원을 넘기면 그 칸 머리가 붉어지고 저장이 잠긴다.
   ============================================================ */
export function board(o = {}) {
  return `<div class="pc-board" data-board>
    ${CLASSES.map((c) => `<div class="pc-col" data-col="${c.id}" data-cap="${c.cap}" data-kg-min="${c.kgMin}" data-kg-max="${c.kgMax}" data-nm="${esc(c.nm)}">
      <div class="pc-colhd">
        <span class="nm">${c.ico} ${esc(c.nm)}</span>
        <span class="n"><b data-col-n>${clsNow(c.id)}</b>/${c.cap}</span>
      </div>
      <div class="pc-drop" data-drop="${c.id}">
        ${inClassCards(c.id)}
      </div>
    </div>`).join('')}
  </div>`;
}
/* 지금 그 반에 있는 아이들만 카드로 올린다 — 머리의 숫자와 카드 수가 어긋날 수 없다.
   둘 다 data.mjs 의 같은 함수(inClass)에서 나온다. */
function inClassCards(clsId) {
  return inClass(clsId).map((d) => `<button class="pc-dog" type="button" draggable="true"
      data-dog="${d.id}" data-nm="${esc(d.nm)}" data-kg="${d.kg}" data-home="${d.cls}">
      ${dogPh(d.nm, 32)}<span class="nm">${esc(d.nm)}</span><span class="kg">${d.kg}kg</span>
    </button>`).join('');
}

/* ============================================================
   ★ 알림장 — 이 팩의 알맹이 ③
   보호자가 저녁마다 가장 먼저 여는 자리다. 목록에서부터 사진이 눈에 띄어야 한다.
   ============================================================ */
/* ⚠ 거르개는 data-tag 만 본다 — data-dog·data-month 를 따로 적어 두면
     칩을 눌러도 목록이 안 줄어든다(값만 바뀌고 목록은 그대로인 그 사고).
     그래서 반려견 이름과 달을 «한 칸(data-tag)»에 함께 적는다. */
export function noteCard(n, o = {}) {
  return `<a class="pc-note${n.read ? '' : ' unread'}" href="${link(o.href || 'MY-05')}"
      data-tag="${esc(n.dog)} ${n.date.slice(0, 7)}">
    <div class="thumb">${ph(['알림장 대표 사진', 800, 600], { seed: n.id, cls: 'ph-card' })}</div>
    <div class="bd">
      <div class="dt">${esc(n.date)} (${esc(n.dow)}) · ${esc(n.dog)} · 사진 ${n.pics}장</div>
      <div class="sum">${esc(n.sum)}</div>
      <div class="t-sub mt2">담당 ${esc(n.teacher)} · 등원 ${n.inAt} · 하원 ${n.outAt}</div>
      ${n.note ? `<div class="mt3">${badge('확인해 주세요', 'b-warn')}</div>` : ''}
    </div></a>`;
}
/** 등원하지 않은 날 — 「이 날은 등원하지 않았어요」 */
export const noteNone = (d) => `<div class="pc-note none" data-tag="${(d.dogs || ['초코', '보리']).join(' ')} ${d.date.slice(0, 7)}">
  <div class="thumb">${ph(['—', 800, 600], { seed: d.date, cls: 'ph-card' })}</div>
  <div class="bd"><div class="dt">${esc(d.date)} (${esc(d.dow)})</div>
    <div class="sum" style="color:var(--muted)">${esc(d.why)}</div></div></div>`;

/** 그날 사진 갤러리 — 첫 장이 두 칸을 먹는다 */
export const gal = (n, seed) => `<div class="pc-gal">${Array.from({ length: n }).map((_, i) =>
  ph(['알림장 사진', 800, 600], { seed: `${seed}-${i}`, cls: 'ph-card' })).join('')}</div>`;

/* ---------- 지표 카드 — 가이드 screenGuides.대시보드 ---------- */
export const stat = (lb, v, o = {}) => `<div class="stat ${o.cls || ''}"${o.attr || ''}>
  <div class="lb">${o.ico ? `<span>${o.ico}</span>` : ''}${lb}</div>
  <div class="v"><span${o.numAttr || ''}>${v}</span>${o.u ? `<span class="u">${o.u}</span>` : ''}</div>
  ${o.d ? `<div class="d">${o.d}</div>` : ''}</div>`;

/* ---------- 막대·도넛 (MG-03) ---------- */
export const bars = (rows, o = {}) => {
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return `<div class="pc-bars">${rows.map(([lb, v, right]) => `<div class="pc-bar">
    <span class="lb">${esc(lb)}</span>
    <span class="tr"><span class="fl" style="width:${Math.round(v / max * 100)}%"></span></span>
    <span class="n">${right != null ? right : num(v) + (o.u || '건')}</span></div>`).join('')}</div>`;
};
export const donut = (parts) => {
  const tone = ['var(--primary)', 'var(--accent)', 'var(--success)'];
  let at = 0;
  const stops = parts.map(([, pct], i) => { const from = at; at += pct; return `${tone[i % 3]} ${from}% ${at}%`; }).join(',');
  return `<div class="row wrap-row" style="gap:var(--sp-block)">
    <div class="pc-donut" style="background:conic-gradient(${stops})"><span class="in-t">결제 수단<br>비중</span></div>
    <div class="pc-legend">${parts.map(([nm, pct], i) => `<span class="li">
      <span class="sw" style="background:${tone[i % 3]}"></span>${esc(nm)} <b>${pct}%</b></span>`).join('')}</div>
  </div>`;
};

/* ---------- 달력 — RE-03 낱개 예약(여러 날 고르기) ---------- */
export function calMulti(cal, o = {}) {
  const dow = ['월', '화', '수', '목', '금', '토', '일'];
  const cells = [];
  for (let i = 0; i < cal.blank; i++) cells.push('<div class="cal-d cal-blank" aria-hidden="true"></div>');
  for (let d = 1; d <= cal.days; d++) {
    const left = cal.left[d - 1];
    const full = left === 0;
    const few = left > 0 && left <= 3;
    const dowIdx = (cal.blank + d - 1) % 7;
    cells.push(`<button class="cal-d${full ? ' full' : ''}${few ? ' few' : ''}" type="button"
      data-day="${d}" data-dow="${dow[dowIdx]}" data-left="${left}"${full ? ' disabled' : ''}>
      <span class="dd">${d}</span><span class="n">${full ? '마감' : `${left}자리`}</span></button>`);
  }
  return `<div${o.attr || ''}>
    <div class="cal-hd">
      <button class="cal-mv" type="button" data-mv="-1" disabled aria-label="지난 달">‹</button>
      <span class="cal-m">${cal.y}년 ${cal.m}월</span>
      <button class="cal-mv" type="button" data-mv="1" aria-label="다음 달">›</button>
    </div>
    <div class="cal-dow">${dow.map((d) => `<span>${d}</span>`).join('')}</div>
    <div class="cal-grid" data-cal-multi>${cells.join('')}</div>
  </div>`;
}

/* ---------- 화면 뼈대 ---------- */
/** 잎사귀 화면 머리 — 「어느 화면의 어떤 갈래인가」를 맨 위에 못 박는다.
   ⚠ 「부모 > 갈래」를 통째로 큰 제목에 쓰지 않는다. 뒤 조각만 제목으로 쓰고
     부모는 보조 설명 줄에 둔다 — 안 그러면 제목이 두세 줄로 접힌다. */
export const leafHd = (ctx, sub, aside) => pageHd(
  esc(String(ctx.pageName).split('>').pop().trim()),
  sub || (ctx.backTo ? `${esc(ctx.backTo.pageName)} 화면의 한 갈래입니다` : ''),
  aside);

export const pageHd = (title, sub, aside) => `<div class="page-hd">
  <div><h1 class="t-page">${title}</h1>${sub ? `<p class="t-sub">${sub}</p>` : ''}</div>
  ${aside ? `<div class="btns">${aside}</div>` : ''}</div>`;

export const detail2 = (main, aside) => `<div class="split-r"><div>${main}</div><div class="sticky stack" style="gap:var(--sp-block)">${aside}</div></div>`;
export const listPage = (filter, body) => `<div class="split-l"><div class="sticky">${filter}</div><div>${body}</div></div>`;
export const stickBar = (left, right) => `<div class="stick"><div class="stick-in"><div>${left}</div><div class="btns">${right}</div></div></div>`;
/* solo — 로그인처럼 «묻는 게 몇 줄뿐»인 화면용 가운데 상자(420px).
   ⚠ 다 끝난 뒤 «앞서 고른 것을 요약해 보여 주는» 완료 화면에는 쓰지 않는다 — done() 을 쓴다. */
export const solo = (title, sub, body) => `<div class="solo-wrap"><div class="solo-card">
  <h1 class="t-sec mb2">${title}</h1>${sub ? `<p class="t-sub mb6">${sub}</p>` : ''}${body}</div></div>`;

/** 완료 화면 — 끝났다는 표시 + 요약을 제 폭으로 펴고, 다음에 할 일을 오른쪽에 붙인다. */
export const done = (title, sub, main, aside) => `${pageHd(`<span class="ok-mark" aria-hidden="true">✓</span>${title}`, sub)}
${detail2(main, aside)}`;

export const modal = (id, title, body, ft) => `<template id="${id}"><div class="modal">
  <div class="m-hd"><h3 class="t-card">${title}</h3><button class="x" type="button" data-dismiss aria-label="닫기">✕</button></div>
  <div class="m-bd">${body}</div>${ft ? `<div class="m-ft">${ft}</div>` : ''}</div></template>`;

/** ⭐ 프리미엄(레이아웃 B)은 «화면 전체»가 이미 좌측 사이드바를 두르고 있다.
    그래서 화면 안에 또 왼쪽 메뉴를 겹쳐 넣지 않는다 — 디럭스에서 옮겨 온 조각들이
    ownShell() 을 부르므로 이름만 남기고 몸통을 그대로 돌려준다.
    (여백 중심형이던 디럭스는 상단 GNB 뿐이라 운영 화면에서만 이 메뉴가 필요했다.) */
export function ownShell(activeId, body) { return body; }

/* ---------- 화면 정보 패널 ----------
   손님이 볼 것이 아니다. 언제나 «닫힌 채로» 시작하고, 누를 때만 열린다. */
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

/* 푸터 — 스펙팩 common.footer 「저작권 · 기본 링크」.
   상호·주소·전화는 data.mjs 한 곳에서만 읽는다. */
function footer() {
  return `<footer class="ft"><div class="ft-in">
    <div class="ft-top">
      <div>
        <div class="t-card mb2">${SITE.mark} ${SITE.name}</div>
        <p class="t-sub">${esc(SITE.addr)}<br>${esc(SITE.tel)} · ${esc(SITE.email)}<br>${esc(SITE.hours)}</p>
      </div>
      <nav class="ft-nav">
        ${NAV.map(([t, to]) => `<a href="${link(to)}">${t}</a>`).join('')}
        <a href="${link('MG-05')}">원 운영진 로그인</a>
      </nav>
    </div>
    <div class="ft-bot">
      <span>© 2026 ${SITE.name}. 기획 검토용 프로토타입입니다.</span>
      <span>카카오톡 채널 ${esc(SITE.kakao)}</span>
    </div>
  </div></footer>`;
}

/* ---------- 좌측 사이드바 — 레이아웃 B slots.nav ----------
   「좌측 세로 사이드바(그룹 제목 + 항목) + 상단에는 계정만.」
   보호자 메뉴와 원 운영 메뉴를 «같은 사이드바»에 그룹 둘로 담고,
   지금 보고 있는 화면이 어느 그룹인지에 따라 활성 항목만 바뀐다. */
function sidebar(id) {
  const code = String(id).slice(0, 2);
  const 항목 = (list) => list.map(([nm, to]) => {
    const 대상 = toPageId(to);
    const 켬 = String(대상).slice(0, 2) === code;
    return `<a class="${켬 ? 'on' : ''}" href="${link(to)}">${nm}${MENU_N[to] ? `<span class="n">${MENU_N[to]}</span>` : ''}</a>`;
  }).join('');
  return `<nav class="appside" aria-label="주 메뉴">
    <a class="logo" href="${link('HO-01')}"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
    <div class="appside-grp"><b>보호자</b>${항목(NAV)}</div>
    <div class="appside-grp"><b>원 운영</b>${항목(NAV_OWNER)}</div>
    <div class="appside-grp appside-sw"><a href="${link('MG-05')}">원 운영진 로그인</a><a href="../index.html">전체 화면 목록</a></div>
  </nav>`;
}

/* 사이드바 항목 옆 숫자 — 그 메뉴에 화면이 몇 장인지. generate.mjs 가 채운다.
   ⚠ 손으로 두 번째 적지 않는다. 스펙팩이 세어 준 값을 그대로 받는다. */
let MENU_N = {};
export const setMenuCounts = (m) => { MENU_N = m || {}; };

/* 부모 화면 → 그 화면에서 갈라지는 잎사귀들. generate.mjs 가 스펙팩에서 만들어 넘긴다.
   ⛔ 이것이 없으면 잎사귀 131장이 «아무도 안 가리키는 쪽»이 된다 —
      화면은 만들어졌는데 손님이 거기까지 갈 길이 없다(발견기록 지뢰 12). */
let LEAVES = {};
export const setLeaves = (m) => { LEAVES = m || {}; };
function leafNav(id) {
  const 목록 = LEAVES[id];
  if (!목록 || !목록.length) return '';
  return `<section class="leafnav">
    <b>이 화면에서 갈라지는 상태 ${목록.length}가지</b>
    <div class="row wrap-row mt3" style="gap:var(--sp-btn)">
      ${목록.map((l) => `<a class="btn btn-ghost btn-sm" href="${link(l.id)}">${esc(l.nm)}</a>`).join('')}
    </div>
    <p class="t-sub mt3">탭·상태·예외까지 펼친 3뎁스라, 한 화면이 실제로 겪는 갈래를 따로 그려 두었습니다.</p>
  </section>`;
}

/* 상단 계정 줄 — 「상단에는 계정만」.
   ⛔ 로그인 안 한 화면에 로그인한 사람 이름을 적지 않는다 — 발견기록의 「비로그인 화면인데
      헤더는 로그인 상태」가 그것이다. 손님이 먼저 알아채는 종류의 어긋남이다.
   기본 규칙: 홈(HO)·고객센터 첫 화면처럼 «누구나 보는» 화면은 손님(guest),
   나머지는 로그인 상태. 화면이 스스로 정하고 싶으면 o.guest 로 뒤집는다. */
const 손님인가 = (id, o) => (o.guest !== undefined ? !!o.guest : /^HO/.test(String(id)));
function topbar(id, o = {}) {
  const 운영 = /^(AT|NW|HL|MG)/.test(String(id));
  if (손님인가(id, o)) {
    return `<header class="topbar">
  <div class="who"><span class="t-sub">로그인하면 예약 내역과 알림장을 볼 수 있어요</span></div>
  <div class="acts">
    <a class="btn btn-ghost btn-sm" href="${link('PL-01')}">반려견 등록</a>
    <a class="btn btn-pri btn-sm" href="${link('RE-01')}">등원 예약</a>
  </div>
</header>`;
  }
  return `<header class="topbar">
  <div class="who">
    <span class="av">${운영 ? '원' : '보'}</span>
    <span><b>${esc(운영 ? `${STAFF[0].nm} ${STAFF[0].role}님` : `${ME.nm} 보호자님`)}</b><span class="t-sub"> · ${esc(운영 ? SITE.name : MINE.map((d) => d.nm).join(' · '))}</span></span>
  </div>
  <div class="acts">
    <a class="btn btn-ghost btn-sm" href="${link(운영 ? 'AT-01' : 'MY-01')}">${운영 ? '오늘 현황판' : '내 예약'}</a>
    <a class="btn btn-pri btn-sm" href="${link(운영 ? 'NW-01' : 'RE-01')}">${운영 ? '알림장 쓰기' : '등원 예약'}</a>
  </div>
</header>`;
}

/** 한 장의 HTML 을 완성한다. */
export function shell(ctx, body, o = {}) {
  const back = ctx.backTo
    ? `<a class="back" href="${link(ctx.backTo.pageId || ctx.backTo)}">‹ ${esc(ctx.backTo.pageName || '뒤로')}</a>`
    : '';
  const 갈래 = leafNav(ctx.id);
  const 속 = o.bare
    ? `${body}${갈래 ? `<div class="wrap" style="padding-top:0">${갈래}</div>` : ''}`
    : `<div class="wrap"><div class="${o.read ? 'col col-read' : 'col'}">${back}${body}${갈래}</div></div>`;
  /* solo — 로그인처럼 «아직 아무도 아닌» 화면. 사이드바도 계정 줄도 걸지 않는다. */
  const 몸 = o.solo
    ? `<div class="main"><main class="solo">${속}</main>${footer()}</div>`
    : `<div class="app">
  ${sidebar(ctx.id)}
  <div class="main">
    ${topbar(ctx.id, o)}
    ${o.hero || ''}
    <main>${속}</main>
    ${o.stick || ''}
    ${footer()}
  </div>
</div>`;
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ctx.pageName)} · ${SITE.name}</title>
<meta name="description" content="${esc(ctx.funcDef || SITE.tagline).slice(0, 150)}">
<link rel="stylesheet" href="../assets/css/base.css">
</head>
<body data-page="${ctx.id}"${o.now ? ` data-now="${o.now}"` : ''} data-cls="${esc(JSON.stringify(CLASSES.map((c) => [c.nm, c.kg, c.kgMin, c.kgMax])))}">
${몸}
${o.after || ''}
${devPanel(ctx)}
<script src="../assets/js/app.js"></script>
</body></html>`;
}
