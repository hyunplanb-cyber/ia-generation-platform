/* RE 등원 예약 — 잎사귀 18장.
   부모(RE0101·RE0201·RE0301·RE0401·RE0501·RE0601)의 뼈대·색·톤은 U.shell() 이 그대로 지킨다.
   여기서는 그 화면의 «상태·갈래»만 보여 준다.

   ★ 이 메뉴의 알맹이는 «요일로 잡는 정기 등원»(RE0202·RE0203)이다.
     날짜로만 잡는 뷰티샵 예약과 갈라지는 자리라서 두껍게 만들었다.

   ⚠ 숫자는 전부 data.mjs 에서 읽어 «세어서» 만든다. 손으로 두 번 적지 않는다.
     - 요일 정원 DOW_CAP · 9월 달력 CAL · 회차권 잔여 MY_PASS.left(4회) · 요금 PRICE
   ⚠ 오늘은 2026년 8월 24일 «월요일»이다(TODAY). 날짜를 적을 때마다 요일을 세어 붙인다.
   ⛔ confirm()·prompt()·alert() 는 쓰지 않는다 — 무인 검사기가 그 자리에서 멈춘다. */
import * as U from './ui.mjs';
import {
  SITE, TODAY, DOG, CLS, clsNow, inClass, CLASSES,
  PRICE, unit, DOW_CAP, CAL, MY_PASS, MY_REG, ALERTS,
} from './data.mjs';

const P = {};
export const PAGES = P;

/* ---------- 이 메뉴가 함께 쓰는 값 ---------- */
const 초코 = DOG('d01');
const 중형 = CLS('md');
const 예약단계 = [['① 방법', ''], ['② 요일·날짜', ''], ['③ 반 배정', ''], ['④ 결제', ''], ['⑤ 완료', '']];
const 요일값표 = JSON.stringify(PRICE.reg);
const 정기값 = PRICE.reg[MY_REG.days.length];               // 주 3회 값
const 형제할인 = Math.round(정기값 * PRICE.siblingOff / 100);
const 낼돈 = 정기값 - 형제할인;
const 잔여 = MY_PASS.left;                                   // 초코의 남은 회차권 (4회)

/* ---------- 날짜·요일 ----------
   ⛔ 요일을 손으로 적지 않는다. 「8/22 에 산 것을 8/7 부터 썼다」 같은 사고가 여기서 난다. */
const DOW = ['월', '화', '수', '목', '금', '토', '일'];
const 요일 = (y, m, d) => DOW[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7];
const 날짜글 = (y, m, d) => `${m}월 ${d}일 (${요일(y, m, d)})`;

/* ---------- 달력 한 칸 ----------
   ui.mjs 의 calMulti() 는 «정원»만 본다. 여기서는 «지난 날·오늘 마감·휴무»처럼
   정원과 다른 까닭으로 잠기는 칸이 필요해서 한 칸을 직접 그린다.
   ⚠ 잠기는 칸은 반드시 <button disabled> 다 — <a> 로 만들면 눌린다. */
function 날칸(o) {
  const 막힘 = o.lock || '';
  const 마감 = !막힘 && o.left === 0;
  const 임박 = !막힘 && o.left > 0 && o.left <= 3;
  const cls = ['cal-d', (막힘 || 마감) ? 'full' : '', 임박 ? 'few' : '', o.on ? 'sel' : ''].filter(Boolean).join(' ');
  const 글 = 막힘 || (마감 ? '마감' : `${o.left}자리`);
  const 까닭 = o.why || (마감 ? '정원이 다 찼어요' : `${o.left}자리 남았어요`);
  return `<button class="${cls}" type="button" data-day="${o.d}" data-dow="${o.dw}" data-left="${막힘 ? 0 : o.left}"${(막힘 || 마감) ? ' disabled' : ''} title="${U.esc(까닭)}">
    <span class="dd">${o.d}</span><span class="n">${U.esc(글)}</span></button>`;
}
/** 한 달치 달력 — 미리 골라 둔 날(sel)과 정원 밖의 까닭으로 잠긴 날(lock)을 받는다 */
function 달력(cal, o = {}) {
  const sel = o.sel || [];
  const lock = o.lock || {};
  const 칸 = [];
  for (let i = 0; i < cal.blank; i++) 칸.push('<div class="cal-d cal-blank" aria-hidden="true"></div>');
  for (let d = 1; d <= cal.days; d++) {
    칸.push(날칸({
      d, dw: 요일(cal.y, cal.m, d), left: cal.left[d - 1],
      on: sel.includes(d), lock: lock[d], why: (o.why || {})[d],
    }));
  }
  return `<div${o.attr || ''}>
    <div class="cal-hd">
      <button class="cal-mv" type="button" data-mv="-1"${o.back ? '' : ' disabled'} aria-label="지난 달">‹</button>
      <span class="cal-m">${cal.y}년 ${cal.m}월</span>
      <button class="cal-mv" type="button" data-mv="1" aria-label="다음 달">›</button>
    </div>
    <div class="cal-dow">${DOW.map((x) => `<span>${x}</span>`).join('')}</div>
    <div class="cal-grid" data-cal-multi>${칸.join('')}</div>
  </div>`;
}
/** 달력 아래 색 뜻풀이 — 세 화면이 같은 글을 쓴다 */
const 뜻풀이 = `<div class="row wrap-row mt6">
  <span class="t-sub"><span class="ok">●</span> 여유</span>
  <span class="t-sub"><span class="warn">●</span> 마감 임박 (3자리 이하)</span>
  <span class="t-sub"><span class="muted">●</span> 마감 — 눌리지 않아요</span>
</div>`;

/** 고른 날짜를 app.js 와 «같은 말투»로 적는다 — 새로고침 전후가 달라지면 안 된다 */
const 날짜목록글 = (cal, days) => days.map((d) => `${d}일(${요일(cal.y, cal.m, d)})`).join(', ');
const 차감글 = (n) => (n
  ? `선택한 ${n}일 · 보유 회차권 ${잔여}회 중 ${Math.min(n, 잔여)}회 차감돼요`
  : '날짜를 고르면 차감될 회차권을 알려드려요');

/** 고른 날짜 요약 상자 — 달력을 둔 화면은 «반드시» 이것을 함께 둔다.
    ⚠ [data-pass-left] 가 없으면 app.js 가 잔여를 0 으로 보고 다음 버튼을 영영 잠근다. */
function 날짜요약(n, days, cal) {
  const 모자람 = Math.max(0, n - 잔여);
  return `<div class="t-card" data-day-list>${n ? U.esc(날짜목록글(cal, days)) : '아직 날짜를 고르지 않았어요'}</div>
  <p class="t-sub mt3" data-day-sum>${U.esc(차감글(n))}</p>
  <div class="mt6" data-pass-left="${잔여}">
    ${U.sumRows([
      ['고른 날짜', `<b><span data-pick-out="day">${n}</span>일</b>`],
      ['보유 회차권', `${잔여}회 (${MY_PASS.until}까지)`],
    ], ['예약 후 남는 회차권', `<span data-day-left>${Math.max(0, 잔여 - n)}</span>회`])}
  </div>
  <div class="mt6"${모자람 ? '' : ' hidden'} data-day-short>
    ${U.banner('dan', '⚠', `<b>회차권이 <span data-day-short-n>${모자람}</span>회 모자라요.</b>
      <div class="t-sub mt2">회차권을 더 사시거나, 고른 날짜를 줄여 주세요.</div>`,
      { right: U.btn('회차권 구매', { href: 'RE0501', cls: 'btn-pri', sm: true }) })}
  </div>`;
}

/** 아래 고정 바 — 낱개 예약 갈래가 함께 쓴다 */
const 날짜바 = (n, id) => U.stickBar(
  `<div><div class="t-sub"><span data-pick-out="day">${n}</span>일 골랐어요</div>
    <div class="price" data-day-sum>${U.esc(차감글(n))}</div></div>`,
  `${U.btn('회차권 구매', { href: 'RE0501', cls: 'btn-ghost' })}
   ${U.btn('반 배정 확인', { href: 'RE0401', cls: 'btn-pri', id, off: n === 0 || n > 잔여, attr: ' data-pick-btn="day"' })}`,
);

/* ---------- 요일 칩 ----------
   ⚠ 일요일은 cap 이 0 이다 — 「마감」이 아니라 「휴무」다. 두 말은 뜻이 다르다.
   ⚠ 잠긴 칩은 disabled 라서 눌리지 않는다. 「고를 수 없다」고 적기만 하면 안 된다. */
function 요일칩(고름 = []) {
  return DOW_CAP.map((x) => {
    const 휴무 = x.cap === 0;
    const 마감 = !휴무 && x.now >= x.cap;
    const 잠김 = 휴무 || 마감;
    const 켬 = !잠김 && 고름.includes(x.d);
    return `<button class="chip${잠김 ? ' is-off' : ''}${켬 ? ' on' : ''}" type="button"
      data-dow="${x.d}"${잠김 ? ' disabled' : ''}>${x.d}
      <span class="x">${휴무 ? '휴무' : 마감 ? '마감' : `${x.cap - x.now}자리`}</span></button>`;
  }).join('');
}
const 열린요일 = DOW_CAP.filter((x) => x.cap > 0 && x.now < x.cap);
const 잠긴요일 = DOW_CAP.filter((x) => x.cap === 0 || x.now >= x.cap);
const 남은자리합 = 열린요일.reduce((s, x) => s + (x.cap - x.now), 0);

/* app.js 의 요일값갱신() 과 «같은 말투»로 적는다 */
const 요일목록글 = (고름) => (고름.length ? `매주 ${고름.join('·')} 등원` : '아직 요일을 고르지 않았어요');
const 주횟수글 = (고름) => (고름.length ? `주 ${고름.length}회 · 월 약 ${고름.length * 4}회 등원` : '주 0회');
const 요일값글 = (고름) => (고름.length ? U.won(PRICE.reg[고름.length] || 0) : '—');

/* ============================================================
   RE0102 예약 방법 고르기 > 미등록 경고 배너
   ============================================================ */
P['RE0102'] = (ctx) => {
  const 단계 = [
    ['🐶', '반려견 등록', '이름·견종·몸무게·성향을 적습니다', '아직이에요', 'PL0101', 'b-dan'],
    ['💉', '백신 증명서', '종합백신(DHPPL)과 광견병 두 가지가 필요해요', '아직이에요', 'PL0201', 'b-dan'],
    ['🎟', '회차권 또는 정기권', '둘 중 하나가 있어야 날짜를 잡을 수 있어요', '아직이에요', 'RE0501', 'b-mut'],
  ];
  const 끝난수 = 0;

  const body = `${U.leafHd(ctx, '등록이 끝나야 예약할 수 있어요. 지금은 두 방법 모두 잠겨 있습니다.')}

${U.steps(예약단계, 0)}

${U.banner('dan', '⚠', `<b>먼저 반려견을 등록해 주세요.</b>
  <div class="t-sub mt2">아직 등록된 반려견이 없습니다. 등록과 백신 확인이 끝나야
  정기 등원과 낱개 예약을 고를 수 있어요. 등록은 3분이면 끝납니다.</div>`,
  { cls: 'mt8', right: U.btn('반려견 등록하러 가기', { href: 'PL0101', cls: 'btn-pri', sm: true }) })}

${U.card('예약까지 남은 것', `
  <p class="t-sub mb4">세 가지 중 <b>${끝난수}개</b>가 끝났습니다. 위에서부터 차례로 하시면 돼요.</p>
  <div class="list1">
    ${단계.map(([ico, t, d, st, to, k]) => `<div class="row-b wrap-row">
      <div class="row"><span style="font-size:var(--fs-sec)">${ico}</span>
        <div><div class="t-card">${t}</div><div class="t-sub mt1">${d}</div></div></div>
      <div class="row">${U.badge(st, k)}${U.btn('하러 가기', { href: to, cls: 'btn-sub', sm: true })}</div>
    </div>`).join('')}
  </div>`, { cls: 'mt8' })}

<div class="g2 mt8">
  <div class="card"><div class="card-bd">
    <div style="font-size:var(--fs-page)">🔁</div>
    <h2 class="t-sec mt3">정기 등원</h2>
    <p class="mt3">월·수·금처럼 요일을 정해두고 매주 다녀요. <b class="hl">자리를 먼저 확보할 수 있어요.</b></p>
    <p class="t-sub mt3">주 3회 기준 ${U.won(PRICE.reg[3])} · 매월 1일 자동 청구</p>
    <div class="btns mt8">${U.btn('반려견 등록이 먼저예요', { cls: 'btn-pri', w: true, off: true })}</div>
  </div></div>

  <div class="card"><div class="card-bd">
    <div style="font-size:var(--fs-page)">📅</div>
    <h2 class="t-sec mt3">낱개 예약</h2>
    <p class="mt3">필요한 날짜만 골라 예약해요. <b class="hl">자유롭게 쓸 수 있어요.</b></p>
    <p class="t-sub mt3">10회권 기준 1회당 ${U.won(unit(PRICE.packs[0]))} · 고른 날짜 수만큼 차감</p>
    <div class="btns mt8">${U.btn('반려견 등록이 먼저예요', { cls: 'btn-pri', w: true, off: true })}</div>
  </div></div>
</div>

${U.box(`<div class="row-b wrap-row">
  <div class="t-card">백신 증명서는 왜 꼭 필요한가요?</div>
  ${U.btn('접기 ▴', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="why102" data-more-label="자세히 보기 ▾"' })}
</div>
<div class="mt4" data-more-body="why102">
  <p class="t-sub">한 방에 여러 아이가 함께 있는 곳이라, 한 마리가 앓으면 그날 온 아이들이 모두 옮습니다.
  그래서 종합백신(DHPPL)과 광견병 두 가지는 유효기간 안이어야 등원할 수 있어요.
  접종 증명서가 병원에 없으면 접종 내역이 적힌 수첩 사진이나 진료 영수증도 괜찮습니다.
  올려 주시면 접종일에서 유효기간을 저희가 계산해 드려요.</p>
  <div class="btns mt6">${U.btn('백신 접종 기록 올리기', { href: 'PL0201', cls: 'btn-sub', sm: true })}
    ${U.btn('자주 묻는 질문 보기', { href: 'CS0101', cls: 'btn-ghost', sm: true })}</div>
</div>`, { cls: 'mt8' })}`;

  /* ⛔ 등록된 반려견이 없는 상태다 — 상단 계정 줄이 「초코 · 보리」를 말하면 화면과 어긋난다.
     그래서 이 한 장만 손님(비로그인) 줄로 못 박는다. */
  return { body, o: { guest: true } };
};

/* ============================================================
   RE0103 예약 방법 고르기 > 방식별 설명 펼침
   화면안동작: 접기 — 그 자리에서 펴지고 접힌다
   ============================================================ */
P['RE0103'] = (ctx) => {
  const 정기1회 = Math.round(PRICE.reg[3] / 12);          // 주 3회 = 월 약 12회
  const 낱개1회 = unit(PRICE.packs[0]);                    // 10회권 1회당
  const 차이 = 낱개1회 - 정기1회;

  const 비교 = U.table(
    [{ t: '견줄 것', w: '22%' }, '정기 등원', '낱개 예약'],
    [
      ['자리 확보', '고른 요일 자리를 미리 잡아 둡니다', '예약할 때 남아 있어야 잡힙니다'],
      ['값', `주 3회 ${U.won(PRICE.reg[3])} / 월 (1회당 약 ${U.won(정기1회)})`, `10회권 ${U.won(PRICE.packs[0].price)} (1회당 ${U.won(낱개1회)})`],
      ['결제', `매월 1일 자동 청구 (다음 ${MY_REG.next})`, '회차권을 살 때 한 번'],
      ['쉬는 날', '전날까지 알려 주시면 차감되지 않아요', '고른 날짜만 차감돼요'],
      ['기간', '해지할 때까지 계속', `10회권 ${PRICE.packs[0].days}일 · 20회권 ${PRICE.packs[1].days}일 · 30회권 ${PRICE.packs[2].days}일`],
      ['바꾸기', '요일 변경은 다음 주부터 적용됩니다', '남은 회차는 정기권으로 바꿀 수 있어요'],
    ], { cls: 'left' });

  const 시나리오 = [
    ['🏢', '출근이 요일로 고정된 분', '정기 등원',
      `월·수·금처럼 요일이 늘 같으면 정기가 낫습니다. 주 3회 ${U.won(PRICE.reg[3])} 이라 1회당 약 ${U.won(정기1회)} —
       낱개 10회권(1회당 ${U.won(낱개1회)})보다 한 번에 ${U.won(차이)} 싸고, 인기 요일 자리를 먼저 잡아 둡니다.`],
    ['📦', '주마다 일정이 들쭉날쭉한 분', '낱개 예약',
      `이번 주는 두 번, 다음 주는 안 오는 식이면 낱개가 낫습니다. 안 쓰면 남아 있고,
       10회권은 ${PRICE.packs[0].days}일 안에 쓰면 됩니다. 다만 인기 요일은 자리가 먼저 찰 수 있어요.`],
    ['🧪', '아직 잘 맞을지 모르겠는 분', '낱개로 먼저',
      `1회 이용권 ${U.won(PRICE.once)} 으로 하루 맡겨 보고, 아이가 잘 지내면 정기로 바꾸시면 됩니다.
       낱개로 다닌 회차는 그대로 남고, 정기 전환할 때 남은 회차를 그대로 쓸 수 있어요.`],
  ];

  const body = `${U.leafHd(ctx, '두 방식을 끝까지 펼쳐 견줘 봅니다. 접기를 누르면 다시 접힙니다.')}

${U.steps(예약단계, 0)}

${U.card('한눈에 견주기', 비교, { cls: 'mt8' })}

${U.sec('어느 쪽이 나은가요', `<div class="stack" style="gap:var(--sp-card-gap)">
  ${시나리오.map(([ico, who, 답, d]) => U.box(`<div class="row-b wrap-row">
    <div class="row"><span style="font-size:var(--fs-sec)">${ico}</span>
      <div class="t-card">${who}</div></div>
    ${U.badge(답, 'b-solid')}
  </div>
  <p class="t-sub mt3">${d}</p>`)).join('')}
</div>`, { cls: 'mt8' })}

${U.card('', `<div class="row-b wrap-row">
  <div><div class="t-card">두 방식의 자세한 장단점</div>
    <div class="t-sub mt1">지금 펼쳐져 있어요. 접기를 누르면 접힙니다.</div></div>
  ${U.btn('접기 ▴', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="cmp103" data-more-label="장단점 펼치기 ▾"' })}
</div>
<div class="mt6" data-more-body="cmp103">
  ${U.accordion([
    { q: '정기 등원 — 좋은 점', a: `<ul class="stack">
        <li class="row"><span class="ok">✓</span><span>고른 요일의 자리를 미리 잡아 둡니다. 지금 ${잠긴요일.map((x) => x.d).join('·')}요일은 이미 자리가 없어요.</span></li>
        <li class="row"><span class="ok">✓</span><span>매월 1일에 자동으로 청구돼 매번 결제하지 않아요.</span></li>
        <li class="row"><span class="ok">✓</span><span>1회당 값이 가장 쌉니다 — 주 3회 기준 약 ${U.won(정기1회)}.</span></li>
        <li class="row"><span class="ok">✓</span><span>같은 요일에 같은 친구들과 만나 아이가 빨리 적응합니다.</span></li>
      </ul>` },
    { q: '정기 등원 — 아쉬운 점', a: `<ul class="stack">
        <li class="row"><span class="muted">·</span><span>쉬는 날은 <b>전날까지</b> 알려 주셔야 차감되지 않습니다.</span></li>
        <li class="row"><span class="muted">·</span><span>요일을 바꾸면 이번 주는 그대로 가고 다음 주부터 적용됩니다.</span></li>
        <li class="row"><span class="muted">·</span><span>계좌이체로는 자동 청구를 걸 수 없어요. 카드나 간편결제가 필요합니다.</span></li>
      </ul>` },
    { q: '낱개 예약 — 좋은 점', a: `<ul class="stack">
        <li class="row"><span class="ok">✓</span><span>원하는 날짜만 달력에서 골라 잡습니다.</span></li>
        <li class="row"><span class="ok">✓</span><span>안 쓰면 회차가 그대로 남습니다. 10회권은 ${PRICE.packs[0].days}일 동안 쓰실 수 있어요.</span></li>
        <li class="row"><span class="ok">✓</span><span>계좌이체로도 살 수 있습니다.</span></li>
      </ul>` },
    { q: '낱개 예약 — 아쉬운 점', a: `<ul class="stack">
        <li class="row"><span class="muted">·</span><span>인기 요일은 자리가 먼저 찹니다. 9월 달력에도 이미 마감된 날이 있어요.</span></li>
        <li class="row"><span class="muted">·</span><span>1회당 값이 정기보다 ${U.won(차이)} 비쌉니다.</span></li>
        <li class="row"><span class="muted">·</span><span>회차권 기간이 지나면 남은 횟수가 사라집니다. 만료 7일 전에 안내를 보내드려요.</span></li>
      </ul>` },
  ], 0)}
</div>`, { cls: 'mt8' })}

${U.banner('info', '↔', `<b>중간에 바꿔도 됩니다.</b>
  <div class="t-sub mt2">낱개로 다니다 정기로 옮기실 수 있고, 정기를 해지하면 남은 정기권은 낱개 회차권으로 바꿔 드려요.
  두 가지를 함께 쓰셔도 됩니다 — 정기 요일 말고 다른 날에 오실 때는 회차권을 쓰시면 됩니다.</div>`,
  { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('정기 등원 신청', { href: 'RE0201', cls: 'btn-pri' })}
  ${U.btn('낱개 예약', { href: 'RE0301', cls: 'btn-sub' })}
  ${U.btn('요금표 자세히 보기', { href: 'HO0201', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   ★ RE0202 정기 등원 요일 선택 > 요일별 정원 마감  — 이 메뉴의 알맹이 ①
   마감·휴무 요일은 «정말로» 눌리지 않는다(disabled). 왜 못 고르는지 표로 적는다.
   ============================================================ */
P['RE0202'] = (ctx) => {
  const 표 = U.table(
    [{ t: '요일', w: '12%' }, { t: '정원', w: '14%' }, { t: '지금', w: '14%' }, { t: '남은 자리', w: '16%' }, '고를 수 있나요'],
    DOW_CAP.map((x) => {
      const 휴무 = x.cap === 0;
      const 마감 = !휴무 && x.now >= x.cap;
      const 남 = x.cap - x.now;
      return {
        cls: 휴무 ? 'muted' : '',
        cells: [
          `<b>${x.d}</b>`,
          휴무 ? '—' : `${x.cap}마리`,
          휴무 ? '—' : `${x.now}마리`,
          { t: 휴무 ? '—' : (마감 ? U.badge('0자리', 'b-dan') : `<b class="num">${남}</b>자리`), cls: 'num' },
          휴무
            ? `${U.badge('휴무', 'b-mut')} <span class="t-sub">일요일과 공휴일은 쉽니다</span>`
            : (마감
              ? `${U.badge('마감', 'b-dan')} <span class="t-sub">정원 ${x.cap}마리가 다 찼어요</span>`
              : `${U.badge('가능', 'b-ok')} <span class="t-sub">지금 고르면 이 자리가 잡힙니다</span>`),
        ],
      };
    }), { cls: 'left' });

  const body = `${U.leafHd(ctx, `이번 달은 ${잠긴요일.map((x) => x.d).join('·')}요일을 고를 수 없어요. 나머지 ${열린요일.length}개 요일에 ${남은자리합}자리가 남았습니다.`)}

${U.steps(예약단계, 1)}

${U.banner('warn', '📌', `<b>${DOW_CAP.filter((x) => x.cap > 0 && x.now >= x.cap).map((x) => x.d).join('·')}요일은 자리가 다 찼어요.</b>
  <div class="t-sub mt2">흐리게 보이는 요일은 눌러도 골라지지 않습니다. 자리가 나면 카카오톡으로 먼저 알려드릴게요.
  일요일과 공휴일은 원 자체가 쉽니다.</div>`, { cls: 'mt8' })}

${U.card('요일 고르기', `
  <div class="chips" data-multi data-pick-scope="dow" data-price-map='${요일값표}'>${요일칩([])}</div>
  <p class="hint">지금 <b data-pick-out="dow">0</b>개를 골랐습니다. 마감·휴무 요일은 고를 수 없어요.</p>
  ${뜻풀이}`, { cls: 'mt6' })}

${U.card('요일마다 자리가 이렇게 남았어요', 표, { cls: 'mt6' })}

${U.card('자리가 나면 알려드릴까요', `
  <p class="t-sub mb4">마감된 요일은 미리 대기를 걸어 두실 수 있어요. 취소가 나오면 걸어 두신 차례대로 카카오톡을 보내드립니다.</p>
  <div class="list1">
    ${잠긴요일.map((x) => {
      const 휴무 = x.cap === 0;
      return `<div class="row-b wrap-row">
        <div><div class="t-card">${x.d}요일</div>
          <div class="t-sub mt1">${휴무 ? '원이 쉬는 날이라 대기를 걸 수 없어요' : `정원 ${x.cap}마리 · 지금 ${x.now}마리 · 대기 걸어 두기`}</div></div>
        ${휴무
          ? U.badge('휴무', 'b-mut')
          : U.toggle(false, `${x.d}요일 대기를 걸었어요 — 자리가 나면 ${SITE.kakao} 채널로 알려드릴게요`)}
      </div>`;
    }).join('')}
  </div>
  <p class="hint">대기는 언제든 마이페이지에서 끌 수 있습니다.</p>`, { cls: 'mt6' })}

${U.card('요약', `
  ${U.sumRows([
    ['고른 요일', `<b data-dow-list>${요일목록글([])}</b>`],
    ['등원 횟수', `<span data-dow-per>${주횟수글([])}</span>`],
    ['반려견', `${U.esc(초코.nm)} (${U.esc(초코.breed)} · ${초코.kg}kg)`],
    ['배정 예정 반', U.esc(중형.nm)],
  ], ['월 정기권', `<span data-dow-price>${요일값글([])}</span>`])}`, { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: U.stickBar(
        `<div><div class="t-sub" data-dow-list>${요일목록글([])}</div><div class="price" data-dow-price>${요일값글([])}</div></div>`,
        U.btn('반 배정 확인', { href: 'RE0401', cls: 'btn-pri', id: 'goCls202', off: true, attr: ' data-pick-btn="dow"' }),
      ),
    },
  };
};

/* ============================================================
   ★ RE0203 정기 등원 요일 선택 > 예상 이용 요약 실시간  — 이 메뉴의 알맹이 ②
   ⛔ 여기는 «새로 신청하는» 화면이다. 미리 켜 둔 칩이 있으면
      개수·요약·값·버튼 잠금이 «전부» 그 상태와 맞아야 한다.
      (2026-08-25 디럭스 사고: 칩 셋이 켜져 있는데 아래는 「0개를 골랐습니다」)
      그래서 아래 고름 하나만 보고 다섯 자리를 «모두» 계산해서 적는다.
   ============================================================ */
P['RE0203'] = (ctx) => {
  /* 손님이 방금 눌러 고른 요일 — 열려 있는 요일 중에서만 고른다.
     ⚠ MY_REG.days(이미 쓰고 있는 요일)를 여기 갖다 쓰지 않는다. 뜻이 다른 값이다. */
  const 고름 = ['월', '수', '금'].filter((d) => 열린요일.some((x) => x.d === d));
  const n = 고름.length;
  const 값 = PRICE.reg[n];
  const 월횟수 = n * 4;
  const 회당 = Math.round(값 / 월횟수);

  /* 하나를 빼면 얼마가 되나 — 「해제 시 재계산」을 미리 보여 준다 */
  const 하나뺀값 = PRICE.reg[n - 1];
  const 하나더값 = PRICE.reg[n + 1];

  const 값표 = U.table(
    [{ t: '주 몇 회', w: '18%' }, { t: '월 등원', w: '20%' }, '월 정기권', '1회당'],
    Object.keys(PRICE.reg).map((k) => {
      const 회 = Number(k);
      const v = PRICE.reg[k];
      return {
        cls: 회 === n ? '' : 'muted',
        cells: [
          회 === n ? `<b>주 ${회}회</b> ${U.badge('지금 고른 것', 'b-solid')}` : `주 ${회}회`,
          `약 ${회 * 4}회`,
          { t: 회 === n ? `<b class="pri">${U.won(v)}</b>` : U.won(v), cls: 'num' },
          { t: `${U.won(Math.round(v / (회 * 4)))}`, cls: 'num' },
        ],
      };
    }), { cls: 'left' });

  const body = `${U.leafHd(ctx, '요일을 누르거나 다시 눌러 뺄 때마다, 아래 숫자 다섯 자리가 그 자리에서 다시 계산됩니다.')}

${U.steps(예약단계, 1)}

${U.card('요일 고르기', `
  <div class="chips" data-multi data-pick-scope="dow" data-price-map='${요일값표}'>${요일칩(고름)}</div>
  <p class="hint">지금 <b data-pick-out="dow">${n}</b>개를 골랐습니다 — ${U.esc(고름.join('·'))}요일.
    한 번 더 누르면 빠지고, 아래 요약이 곧바로 따라 바뀝니다.</p>
  ${U.banner('info', '🔁', `<b>${잠긴요일.map((x) => x.d).join('·')}요일은 고를 수 없어요.</b>
    <div class="t-sub mt2">자리가 찼거나 원이 쉬는 날입니다. 지금 고를 수 있는 요일은
    ${열린요일.map((x) => `${x.d}(${x.cap - x.now}자리)`).join(' · ')} 입니다.</div>`, { cls: 'mt6' })}`,
  { cls: 'mt8' })}

<div class="g3 mt6">
  ${U.stat('고른 요일 수', `<span data-pick-out="dow">${n}</span>`, { u: '개', ico: '📅', d: `${열린요일.length}개 요일 중에서 골랐어요` })}
  ${U.stat('한 달 등원 횟수', 월횟수, { u: '회', ico: '🐾', d: `주 ${n}회 × 4주 기준` })}
  ${U.stat('1회당 값', U.num(회당), { u: '원', ico: '💳', d: `낱개 10회권은 1회당 ${U.won(unit(PRICE.packs[0]))}` })}
</div>

${U.card('예상 이용 요약', `
  ${U.sumRows([
    ['고른 요일', `<b data-dow-list>${요일목록글(고름)}</b>`],
    ['등원 횟수', `<span data-dow-per>${주횟수글(고름)}</span>`],
    ['반려견', `${U.esc(초코.nm)} (${U.esc(초코.breed)} · ${초코.kg}kg)`],
    ['배정 예정 반', `${U.esc(중형.nm)} (${U.esc(중형.kg)})`],
    ['차감 예정 회차권', `0회 <span class="t-sub">(정기권은 회차를 쓰지 않아요 — 보유 ${잔여}회는 그대로 남습니다)</span>`],
  ], ['월 정기권', `<span data-dow-price>${요일값글(고름)}</span>`])}
  <p class="hint">요일을 하나 빼면 <b>${U.won(하나뺀값)}</b> (−${U.won(값 - 하나뺀값)}),
    하나 더 넣으면 <b>${U.won(하나더값)}</b> (+${U.won(하나더값 - 값)}) 이 됩니다.</p>`,
  { cls: 'mt6' })}

${U.card('요일 수에 따른 값', `${값표}
  <p class="hint">이번 달은 고를 수 있는 요일이 ${열린요일.length}개(${열린요일.map((x) => x.d).join('·')})뿐이라
    주 ${열린요일.length}회까지 고르실 수 있어요. ${잠긴요일.map((x) => x.d).join('·')}요일 자리가 나면 알려드릴게요.</p>`,
  { cls: 'mt6' })}

${U.box(`<div class="t-card">이 값은 언제 나가나요</div>
  <p class="t-sub mt3">첫 결제는 신청하실 때 한 번, 그 뒤로는 <b>매월 1일</b>에 자동으로 청구됩니다.
  형제견 할인 ${PRICE.siblingOff}% 를 받으시면 ${U.won(값)} 이 ${U.won(값 - Math.round(값 * PRICE.siblingOff / 100))} 이 됩니다 —
  결제 화면에서 자동으로 붙습니다.
  쉬고 싶은 날은 전날까지 알려 주시면 차감되지 않고, 길게 쉬실 때는 일시정지를 켜면 청구도 멈춥니다.</p>
  <div class="btns mt6">${U.btn('결제 화면 보기', { href: 'RE0501', cls: 'btn-sub', sm: true })}
    ${U.btn('정기 등원 관리 화면 보기', { href: 'MY0301', cls: 'btn-ghost', sm: true })}</div>`,
  { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: U.stickBar(
        `<div><div class="t-sub" data-dow-list>${요일목록글(고름)}</div><div class="price" data-dow-price>${요일값글(고름)}</div></div>`,
        U.btn('반 배정 확인', { href: 'RE0401', cls: 'btn-pri', id: 'goCls203', attr: ' data-pick-btn="dow"' }),
      ),
    },
  };
};

/* ============================================================
   RE0204 정기 등원 요일 선택 > 시작일 지연 안내
   ⚠ 오늘은 8월 24일 «월요일»이다. 고른 요일이 월·수·금이면
     이번 주 월요일은 이미 지났다 — 그래서 이번 주는 주 2회밖에 못 채운다.
   ============================================================ */
P['RE0204'] = (ctx) => {
  const 고름 = ['월', '수', '금'].filter((d) => 열린요일.some((x) => x.d === d));
  const n = 고름.length;
  const 값 = PRICE.reg[n];

  /* 이번 주(8/24 월 ~ 8/29 토) 중, 고른 요일이면서 «오늘보다 뒤»인 날만 셈한다 */
  const 이번주 = [];
  for (let d = TODAY.d; d <= 29; d++) {
    const dw = 요일(TODAY.y, TODAY.m, d);
    const 칸 = DOW_CAP.find((c) => c.d === dw);
    if (고름.includes(dw)) 이번주.push({ d, dw, 지남: d <= TODAY.d, 남: 칸 ? 칸.cap - 칸.now : 0 });
  }
  const 이번주가능 = 이번주.filter((x) => !x.지남);
  const 모자란횟수 = n - 이번주가능.length;
  const 첫날 = 이번주가능[0];

  const 시작후보 = [
    `이번 주부터 (${날짜글(2026, 8, 26)})`,
    `다음 주부터 (${날짜글(2026, 8, 31)})`,
    `9월 1일부터 (${요일(2026, 9, 1)})`,
  ];

  const body = `${U.leafHd(ctx, `고르신 ${U.esc(고름.join('·'))}요일 중 월요일은 오늘이라 이미 지났어요. 이번 주는 ${이번주가능.length}번밖에 못 채웁니다.`)}

${U.steps(예약단계, 1)}

${U.banner('warn', '🗓', `<b>이번 주부터 시작하면 첫 주는 ${이번주가능.length}번만 다니게 됩니다.</b>
  <div class="t-sub mt2">오늘이 ${U.esc(TODAY.label)}이라 이번 주 월요일은 지났습니다.
  정기권은 주 ${n}회 값(${U.won(값)})이 그대로 나가므로, <b>${날짜글(2026, 8, 31)}</b>부터 시작하시길 권해드려요.
  그러면 첫 주부터 ${n}번을 다 채웁니다.</div>`, { cls: 'mt8' })}

${U.card('이번 주에 남은 등원일', `
  <div class="list1">
    ${이번주.map((x) => `<div class="row-b wrap-row">
      <div><div class="t-card">${날짜글(TODAY.y, TODAY.m, x.d)}</div>
        <div class="t-sub mt1">${x.지남
          ? '오늘입니다 — 당일 예약은 오전 8시에 마감됐어요'
          : `자리 있음 · ${x.dw}요일 남은 자리 ${x.남}자리`}</div></div>
      ${x.지남 ? U.badge('지났어요', 'b-mut') : U.badge('갈 수 있어요', 'b-ok')}
    </div>`).join('')}
  </div>
  <p class="hint">이번 주는 ${n}번 중 ${이번주가능.length}번만 됩니다 — ${모자란횟수}번이 모자랍니다.</p>`,
  { cls: 'mt8' })}

${U.card('언제부터 시작할까요', `
  <div class="f2">
    ${U.field('시작일', U.select(시작후보, 1, { attr: ' data-start-sel' }),
      { hint: '고르시면 아래 요약에 그대로 적힙니다' })}
    ${U.field('', '')}
  </div>
  <div class="mt6">${U.sumRows([
    ['고른 요일', `매주 ${U.esc(고름.join('·'))}`],
    ['시작', '<b data-start-out>—</b>'],
    ['첫 등원일', `${첫날 ? 날짜글(TODAY.y, TODAY.m, 첫날.d) : '—'} (이번 주부터를 고르셨을 때)`],
    ['반려견', `${U.esc(초코.nm)} · ${U.esc(중형.nm)}`],
  ], ['월 정기권', U.won(값)])}</div>`, { cls: 'mt6' })}

${U.card('세 가지 중 하나를 고르시면 됩니다', `<div class="stack" style="gap:var(--sp-card-gap)">
  ${U.box(`<div class="row-b wrap-row">
    <div><div class="t-card">① ${날짜글(2026, 8, 31)}부터 시작 <span class="pri">— 권해드려요</span></div>
      <div class="t-sub mt1">첫 주부터 ${U.esc(고름.join('·'))} ${n}번을 다 채웁니다. 값도 온전히 쓰입니다.</div></div>
    ${U.badge('권장', 'b-solid')}
  </div>`)}
  ${U.box(`<div class="row-b wrap-row">
    <div><div class="t-card">② 이번 주 ${이번주가능.map((x) => `${TODAY.m}/${x.d}(${x.dw})`).join('·')} 는 회차권으로 다녀 두기</div>
      <div class="t-sub mt1">보유 회차권 ${잔여}회 중 ${이번주가능.length}회를 쓰고 ${잔여 - 이번주가능.length}회가 남습니다.
      정기는 ${날짜글(2026, 8, 31)}부터 시작합니다.</div></div>
    ${U.btn('낱개로 이번 주만 잡기', { href: 'RE0301', cls: 'btn-sub', sm: true })}
  </div>`)}
  ${U.box(`<div class="row-b wrap-row">
    <div><div class="t-card">③ ${날짜글(2026, 9, 1)}부터 시작</div>
      <div class="t-sub mt1">자동 청구일이 매월 1일이라 시작일과 청구일이 딱 맞습니다. 첫 청구가 그날 나갑니다.</div></div>
    ${U.badge('청구일과 맞춤', 'b-line')}
  </div>`)}
</div>`, { cls: 'mt6' })}

${U.banner('info', '📣', `<b>정원이 차서 더 밀리면 저희가 먼저 알려드립니다.</b>
  <div class="t-sub mt2">시작일까지 사이에 고르신 요일 자리가 차 버리면, 시작 전날까지
  ${U.esc(SITE.kakao)} 채널로 알려드리고 다음 가능한 날을 다시 잡아 드려요. 그동안 청구는 시작되지 않습니다.</div>`,
  { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: U.stickBar(
        `<div><div class="t-sub">매주 ${U.esc(고름.join('·'))} 등원 · 시작 <span data-start-out>—</span></div>
          <div class="price">${U.won(값)}</div></div>`,
        U.btn('반 배정 확인', { href: 'RE0401', cls: 'btn-pri' }),
      ),
    },
  };
};

/* ============================================================
   RE0302 낱개 예약 - 날짜 선택 > 월 이동
   달은 «정말로» 넘어간다 — data-mv 를 app.js 가 받아 달 이름을 바꾸고 자리를 다시 부른다.
   9월이 가장 이른 달이다(지난 날짜는 고를 수 없다).
   ============================================================ */
P['RE0302'] = (ctx) => {
  /* 10월 자리 — 손으로 적지 않고 규칙으로 만든다. 0 이면 마감이다. */
  const 시월 = {
    y: 2026, m: 10, blank: DOW.indexOf(요일(2026, 10, 1)), days: 31, cap: CAL.cap,
    left: Array.from({ length: 31 }, (_, i) => (i * 7 + 3) % 11),
  };
  const 시월마감 = [];
  for (let d = 1; d <= 시월.days; d++) if (시월.left[d - 1] === 0) 시월마감.push(d);
  const 시월여유 = 시월.days - 시월마감.length;

  const 구월마감 = [];
  for (let d = 1; d <= CAL.days; d++) if (CAL.left[d - 1] === 0) 구월마감.push(d);

  const body = `${U.leafHd(ctx, '‹ › 를 누르면 그 달의 자리를 다시 불러옵니다. 오늘(' + U.esc(TODAY.label) + ') 이전 달로는 갈 수 없어요.')}

${U.steps(예약단계, 1)}

${U.banner('info', '↔', `<b>지금 ${시월.m}월을 보고 있어요.</b>
  <div class="t-sub mt2">‹ 를 누르면 ${CAL.m}월로 돌아갑니다. ${CAL.m}월이 가장 이른 달이라 거기서 ‹ 는 잠깁니다 —
  지난 날짜는 예약할 수 없기 때문이에요. › 를 누르면 11월 자리를 불러옵니다.</div>`, { cls: 'mt8' })}

${U.card(`${시월.y}년 ${시월.m}월 달력`, `
  ${달력(시월, { back: true, attr: ' data-pick-scope="day"' })}
  ${뜻풀이}
  <p class="hint">정원 ${시월.cap}마리 기준입니다. ${시월.m}월은 ${시월여유}일이 열려 있고
    ${시월마감.length}일(${시월마감.map((d) => `${d}일 ${요일(시월.y, 시월.m, d)}`).join(' · ')})이 마감입니다.</p>`,
  { cls: 'mt6' })}

${U.card('고른 날짜', 날짜요약(0, [], 시월), { cls: 'mt6' })}

${U.card('달마다 자리가 이렇게 다릅니다', U.table(
  [{ t: '달', w: '18%' }, { t: '열린 날', w: '20%' }, { t: '마감된 날', w: '20%' }, '메모'],
  [
    [`${CAL.y}년 ${CAL.m}월`, `${CAL.days - 구월마감.length}일`, `${구월마감.length}일`,
      `가장 이른 달입니다. 오늘(${U.esc(TODAY.short)}) 이전으로는 갈 수 없어요`],
    [`<b>${시월.y}년 ${시월.m}월</b> ${U.badge('지금 보는 달', 'b-solid')}`, `<b>${시월여유}일</b>`, `<b>${시월마감.length}일</b>`,
      '추석 연휴가 지난 달이라 자리가 넉넉한 편입니다'],
    ['2026년 11월', '아직 열리지 않았어요', '—', '한 달 앞까지만 미리 잡으실 수 있어요'],
  ], { cls: 'left' }), { cls: 'mt6' })}

${U.banner('warn', '⏰', `<b>당일 예약은 오전 8시까지만 받습니다.</b>
  <div class="t-sub mt2">그 뒤에는 자리가 남아 있어도 반 편성이 끝나 받기 어렵습니다.
  그래서 오늘과 지난 날짜는 달력에서 아예 빠져 있어요.</div>`,
  { cls: 'mt6', right: U.btn('당일 마감 자세히', { href: 'RE0305', cls: 'btn-ghost', sm: true }) })}`;

  return { body, o: { stick: 날짜바(0, 'goCls302') } };
};

/* ============================================================
   RE0303 낱개 예약 - 날짜 선택 > 정원 마감일 선택 차단
   ⚠ 마감일은 «disabled 인 <button>» 이다 — 눌러도 골라지지 않는다.
     왜 못 고르는지 표로 적고, 가장 가까운 여유 날짜를 대신 알려 준다.
   ============================================================ */
P['RE0303'] = (ctx) => {
  const 마감일 = [];
  for (let d = 1; d <= CAL.days; d++) if (CAL.left[d - 1] === 0) 마감일.push(d);

  /* 가장 가까운 여유 날 — 일요일은 원이 쉬므로 추천에서 뺀다. 같은 거리면 뒷날을 권한다. */
  const 가까운여유 = (f) => {
    let 최선 = null;
    for (let d = 1; d <= CAL.days; d++) {
      if (CAL.left[d - 1] === 0) continue;
      if (요일(CAL.y, CAL.m, d) === '일') continue;
      const 거리 = Math.abs(d - f);
      if (!최선 || 거리 < 최선.거리 || (거리 === 최선.거리 && d > 최선.d)) 최선 = { d, 거리, left: CAL.left[d - 1] };
    }
    return 최선;
  };

  const 표 = U.table(
    [{ t: '마감된 날', w: '20%' }, { t: '왜 못 고르나요', w: '34%' }, '가까운 여유 날짜'],
    마감일.map((d) => {
      const dw = 요일(CAL.y, CAL.m, d);
      const 휴무 = dw === '일';
      const 대신 = 가까운여유(d);
      return [
        `<b>${날짜글(CAL.y, CAL.m, d)}</b>`,
        휴무
          ? `${U.badge('휴무', 'b-mut')} 일요일은 원이 쉽니다`
          : `${U.badge('정원 마감', 'b-dan')} 정원 ${CAL.cap}마리가 다 찼어요`,
        `<b>${날짜글(CAL.y, CAL.m, 대신.d)}</b> — ${대신.left}자리 남았어요
          <span class="t-sub">(${대신.거리}일 ${대신.d > d ? '뒤' : '앞'})</span>`,
      ];
    }), { cls: 'left' });

  const body = `${U.leafHd(ctx, `${CAL.m}월에는 ${마감일.length}일이 잠겨 있어요. 눌러도 골라지지 않습니다.`)}

${U.steps(예약단계, 1)}

${U.banner('dan', '🚫', `<b>회색으로 보이는 날은 눌러도 골라지지 않아요.</b>
  <div class="t-sub mt2">정원 ${CAL.cap}마리가 다 찬 날이거나, 원이 쉬는 일요일입니다.
  칸에 마우스를 올리면 왜 잠겼는지가 뜨고, 아래 표에 가까운 여유 날짜를 함께 적어 두었습니다.</div>`, { cls: 'mt8' })}

${U.card(`${CAL.y}년 ${CAL.m}월 달력`, `
  ${U.calMulti(CAL, { attr: ' data-pick-scope="day"' })}
  ${뜻풀이}
  <p class="hint">정원 ${CAL.cap}마리 기준입니다. 일요일은 쉬는 날이라 늘 「마감」으로 표시됩니다.</p>`,
  { cls: 'mt6' })}

${U.card('잠긴 날과, 대신 갈 수 있는 날', 표, { cls: 'mt6' })}

${U.card('고른 날짜', 날짜요약(0, [], CAL), { cls: 'mt6' })}

${U.box(`<div class="t-card">마감된 날에 꼭 맡기셔야 한다면</div>
  <p class="t-sub mt3">취소가 생기면 자리가 도로 열립니다. 대기를 걸어 두시면 자리가 나는 대로
  ${U.esc(SITE.kakao)} 채널로 가장 먼저 알려드려요. 알림을 받고 24시간 안에 잡으시면 됩니다.
  정기 등원으로 요일을 잡아 두시면 그 요일 자리는 매주 미리 확보됩니다.</p>
  <div class="btns mt6">
    ${U.btn('마감일 대기 걸어 두기', { cls: 'btn-sub', sm: true, attr: ` data-toast="${U.esc(마감일.map((d) => `${CAL.m}/${d}`).join(' · '))} 대기를 걸었어요 — 자리가 나면 가장 먼저 알려드릴게요"` })}
    ${U.btn('정기 등원으로 요일 잡기', { href: 'RE0201', cls: 'btn-ghost', sm: true })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { stick: 날짜바(0, 'goCls303') } };
};

/* ============================================================
   ★ RE0304 낱개 예약 - 날짜 선택 > 회차권 부족 경고
   ⚠ 「모자란 만큼」을 세어서 말한다 — 고른 날 수와 MY_PASS.left(4회) 를 견준다.
     숫자를 손으로 두 번 적지 않는다.
   ============================================================ */
P['RE0304'] = (ctx) => {
  /* 9월 첫째·둘째 주 화·수·금 — 열려 있는 날만 골랐다 */
  const 고른날 = [1, 2, 4, 8, 9, 11].filter((d) => CAL.left[d - 1] > 0);
  const n = 고른날.length;
  const 모자람 = Math.max(0, n - 잔여);
  const 회차권가 = PRICE.packs[0];
  const 산뒤남음 = 잔여 + 회차권가.n - n;
  const 낱장값 = PRICE.once * 모자람;
  const 정기주3 = PRICE.reg[3];
  /* 고른 날짜가 무슨 요일로 반복되는지 «세어서» 말한다 — 화·수·금이라고 손으로 적지 않는다 */
  const 요일들 = [...new Set(고른날.map((d) => 요일(CAL.y, CAL.m, d)))]
    .sort((a, b) => DOW.indexOf(a) - DOW.indexOf(b));
  const 고른요일 = 요일들.join('·');
  /* 그 요일이 «정기 등원»에서도 열려 있는지는 다른 이야기다 — DOW_CAP 을 따로 본다 */
  const 막힌요일 = 요일들.filter((d) => 잠긴요일.some((x) => x.d === d));

  const 길 = [
    ['🎟', `${회차권가.n}회권 사기`, U.won(회차권가.price),
      `1회당 ${U.won(unit(회차권가))} · ${회차권가.days}일 안에 쓰시면 됩니다.
       사시면 ${잔여}회 + ${회차권가.n}회 = ${잔여 + 회차권가.n}회가 되고, ${n}일을 예약해도 ${산뒤남음}회가 남습니다.`,
      U.btn('회차권 사러 가기', { href: 'RE0501', cls: 'btn-pri', sm: true })],
    ['🗓', `날짜를 ${모자람}개 줄이기`, '0원',
      `${n}일 중 ${모자람}일을 빼면 ${잔여}일이 되어 보유 회차권 ${잔여}회로 딱 맞습니다.
       달력에서 뺄 날짜를 한 번 더 누르면 곧바로 다시 계산돼요.`,
      U.btn('달력에서 빼기', { cls: 'btn-sub', sm: true, attr: ' data-toast="빼실 날짜를 달력에서 한 번 더 눌러 주세요 — 아래 숫자가 그 자리에서 바뀝니다"' })],
    ['🔁', '정기 등원으로 바꾸기', `${U.won(정기주3)} / 월`,
      `고르신 날이 ${U.esc(고른요일)}으로 반복되네요. 주 3회 정기권이면 월 약 12회라 1회당 약 ${U.won(Math.round(정기주3 / 12))} —
       낱개(1회당 ${U.won(unit(회차권가))})보다 쌉니다. 정기권은 회차를 쓰지 않아 보유 ${잔여}회는 그대로 남아요.
       ${막힌요일.length
         ? `다만 정기 등원에서는 ${U.esc(막힌요일.join('·'))}요일 자리가 이미 찼습니다 —
            지금 잡을 수 있는 요일은 ${열린요일.map((x) => x.d).join('·')} 입니다.`
         : ''}`,
      U.btn('정기 등원 신청', { href: 'RE0201', cls: 'btn-ghost', sm: true })],
    ['🎫', `1회 이용권 ${모자람}장 사기`, U.won(낱장값),
      `모자란 ${모자람}일만 낱장으로 채웁니다. 1회 ${U.won(PRICE.once)} 이라
       ${회차권가.n}회권(1회당 ${U.won(unit(회차권가))})보다 1회당 ${U.won(PRICE.once - unit(회차권가))} 비쌉니다.`,
      U.btn('1회 이용권 사기', { href: 'RE0501', cls: 'btn-ghost', sm: true })],
  ];

  const body = `${U.leafHd(ctx, `${n}일을 고르셨는데 보유 회차권은 ${잔여}회예요. ${모자람}회가 모자랍니다.`)}

${U.steps(예약단계, 1)}

${U.banner('dan', '⚠', `<b>회차권이 ${모자람}회 모자라요.</b>
  <div class="t-sub mt2">${n}일을 고르셨고 보유 회차권은 ${잔여}회입니다 (${MY_PASS.until}까지).
  아래 네 가지 중 하나를 고르시면 됩니다. 지금 상태로는 다음 단계로 넘어갈 수 없어요.</div>`,
  { cls: 'mt8', right: U.btn('회차권 구매', { href: 'RE0501', cls: 'btn-pri', sm: true }) })}

<div class="g3 mt6">
  ${U.stat('고른 날짜', `<span data-pick-out="day">${n}</span>`, { u: '일', ico: '📅', d: `${CAL.m}월 ${U.esc(날짜목록글(CAL, 고른날))}` })}
  ${U.stat('보유 회차권', 잔여, { u: '회', ico: '🎟', d: `${MY_PASS.until}까지 · ${MY_PASS.n}회권을 사서 ${MY_PASS.n - 잔여}회 썼어요` })}
  ${U.stat('모자란 횟수', 모자람, { u: '회', ico: '⚠', cls: 'dan', d: `${n}일 − ${잔여}회 = ${모자람}회` })}
</div>

${U.card(`${CAL.y}년 ${CAL.m}월 달력`, `
  ${달력(CAL, { sel: 고른날, attr: ' data-pick-scope="day"' })}
  ${뜻풀이}
  <p class="hint">파랗게 칠해진 ${n}칸이 지금 고르신 날입니다. 한 번 더 누르면 빠지고, 아래 숫자가 곧바로 다시 계산돼요.</p>`,
  { cls: 'mt6' })}

${U.card('고른 날짜', 날짜요약(n, 고른날, CAL), { cls: 'mt6' })}

${U.card('어떻게 하시겠어요', `<div class="stack" style="gap:var(--sp-card-gap)">
  ${길.map(([ico, t, 값, d, b]) => U.box(`<div class="row-b wrap-row">
    <div class="row"><span style="font-size:var(--fs-sec)">${ico}</span>
      <div><div class="t-card">${t}</div><div class="t-sub mt1">${값}</div></div></div>
    ${b}
  </div>
  <p class="t-sub mt3">${d}</p>`)).join('')}
</div>`, { cls: 'mt6' })}

${U.banner('info', '💡', `<b>회차권을 사면 다음 단계로 바로 이어집니다.</b>
  <div class="t-sub mt2">고르신 ${n}일은 그대로 잡아 두고 결제 화면으로 갑니다.
  결제가 끝나면 반 배정 결과로 돌아와요. 자리는 결제하는 동안 10분간 잡아 둡니다.</div>`, { cls: 'mt6' })}`;

  return { body, o: { stick: 날짜바(n, 'goCls304') } };
};

/* ============================================================
   RE0305 낱개 예약 - 날짜 선택 > 당일 예약 마감 시간
   ⚠ 오늘은 8월 24일 «월요일», 지금은 오전 8시가 지났다.
     오늘(24일 월)은 잠기고 내일(25일 화)부터 고를 수 있다. 일요일(30일)은 휴무다.
   ============================================================ */
P['RE0305'] = (ctx) => {
  const 지금 = '10:20';
  const 마감시각 = '08:00';

  /* 오늘부터 이레 — 요일을 세어서 만든다. 8/24(월) ~ 8/30(일) */
  const 이레 = [];
  for (let i = 0; i < 7; i++) {
    const d = TODAY.d + i;
    const dw = 요일(TODAY.y, TODAY.m, d);
    const 휴무 = dw === '일';
    이레.push({
      d, dw, 휴무,
      lock: i === 0 ? '오늘 마감' : (휴무 ? '휴무' : ''),
      why: i === 0
        ? `오늘은 오전 ${마감시각} 에 마감됐어요 (지금 ${지금})`
        : (휴무 ? '일요일은 원이 쉽니다' : ''),
      left: 휴무 || i === 0 ? 0 : ((d * 3) % 9) + 1,
    });
  }
  const 열린날 = 이레.filter((x) => !x.lock);
  const 고른날 = [열린날[0].d];                   // 내일(8/25 화) 한 날을 골라 둔 상태
  const n = 고른날.length;

  const 칸들 = 이레.map((x) => 날칸({ d: x.d, dw: x.dw, left: x.left, lock: x.lock, why: x.why, on: 고른날.includes(x.d) })).join('');

  const body = `${U.leafHd(ctx, `오늘 예약은 오전 ${마감시각} 에 마감됐어요. ${날짜글(TODAY.y, TODAY.m, TODAY.d + 1)}부터 고르실 수 있습니다.`)}

${U.steps(예약단계, 1)}

${U.banner('dan', '⏰', `<b>오늘(${U.esc(TODAY.label)}) 은 더 이상 예약을 받지 않아요.</b>
  <div class="t-sub mt2">당일 예약은 오전 ${마감시각} 까지만 받습니다. 지금은 ${지금} 이라 마감된 지 두 시간이 넘었어요.
  자리가 남아 있어도 반 편성과 급식 준비가 이미 끝나서 받기 어렵습니다.
  가장 이른 날은 <b>${날짜글(TODAY.y, TODAY.m, TODAY.d + 1)}</b> 입니다.</div>`, { cls: 'mt8' })}

${U.card('오늘부터 이레', `
  <div class="cal-dow">${DOW.map((x) => `<span>${x}</span>`).join('')}</div>
  <div class="cal-grid" data-cal-multi data-pick-scope="day">${칸들}</div>
  ${뜻풀이}
  <p class="hint">${날짜글(TODAY.y, TODAY.m, TODAY.d)}과 ${날짜글(TODAY.y, TODAY.m, TODAY.d + 6)}은 눌러도 골라지지 않습니다 —
    오늘은 마감됐고, 일요일은 원이 쉽니다.</p>`, { cls: 'mt6' })}

${U.card('고른 날짜', 날짜요약(n, 고른날, TODAY), { cls: 'mt6' })}

${U.card('당일 예약 규칙', U.table(
  [{ t: '언제 예약하나요', w: '30%' }, { t: '받나요', w: '16%' }, '왜 그런가요'],
  [
    [`전날 밤 ${SITE.close} 까지`, U.badge('받아요', 'b-ok'), '다음 날 반 편성과 급식 준비에 맞춰 넣을 수 있습니다'],
    [`당일 오전 ${마감시각} 까지`, U.badge('받아요', 'b-ok'), '아침 인원 확인 전이라 한 자리를 더 넣을 수 있어요'],
    [`당일 오전 ${마감시각} 이후`, U.badge('안 받아요', 'b-dan'), '반 편성이 끝나고 보육교사 배치가 확정된 뒤입니다'],
    ['당일 갑작스러운 사정', U.badge('전화 주세요', 'b-warn'), `${U.esc(SITE.tel)} 로 전화 주시면 그날 자리를 보고 알려드립니다`],
  ], { cls: 'left' }), { cls: 'mt6' })}

${U.banner('info', '📞', `<b>오늘 꼭 맡기셔야 한다면 전화 주세요.</b>
  <div class="t-sub mt2">${U.esc(SITE.tel)} · ${U.esc(SITE.hours)}
  갑작스러운 사정은 자리를 보고 받아 드릴 때가 있습니다. 다만 알림장 사진은 그날 몇 장 적을 수 있어요.</div>`,
  { cls: 'mt6', right: U.btn('고객센터 보기', { href: 'CS0101', cls: 'btn-ghost', sm: true }) })}

${U.box(`<div class="t-card">늘 같은 요일에 오신다면</div>
  <p class="t-sub mt3">정기 등원으로 요일을 잡아 두시면 당일 마감 시간을 신경 쓰지 않아도 됩니다.
  고른 요일의 자리를 매주 미리 잡아 두기 때문이에요. 쉬는 날만 전날까지 알려 주시면 됩니다.</p>
  <div class="btns mt6">${U.btn('정기 등원 신청', { href: 'RE0201', cls: 'btn-sub', sm: true })}</div>`,
  { cls: 'mt6' })}`;

  return { body, o: { now: 지금, stick: 날짜바(n, 'goCls305') } };
};

/* ============================================================
   RE0402 반 배정 결과 확인 > 배정 기준 펼치기
   화면안동작: 접기 — 그 자리에서 펴지고 접힌다
   ============================================================ */
P['RE0402'] = (ctx) => {
  const 아래여유 = (초코.kg - 중형.kgMin).toFixed(1);
  const 위여유 = (중형.kgMax - 초코.kg).toFixed(1);

  const 근거 = [
    ['⚖️', '몸무게', `${초코.kg}kg`, `${중형.nm} 구간(${중형.kg}) 안입니다.
      아래 경계(${중형.kgMin}kg)에서 ${아래여유}kg, 위 경계(${중형.kgMax}kg)에서 ${위여유}kg 떨어져 있어 한가운데예요.`,
      '반려견 등록에 적으신 몸무게', 'PL0101'],
    ['🐾', '성향', U.esc(초코.tags.join(' · ')), `자유놀이 시간이 가장 긴 반이 ${중형.nm}입니다.
      사람을 좋아하는 아이라 보육교사가 곁에 있는 시간이 긴 편이 잘 맞습니다.`,
      '반려견 프로필의 성향 태그', 'PL0401'],
    ['🐶', '견종', U.esc(초코.breed), `단두종(코가 짧은 견종)이 아니라 여름철 실외 활동에 제한이 없어요.
      단두종은 더운 날 마당 시간을 줄이고 실내에서 쉽니다.`,
      '반려견 등록의 견종', 'PL0103'],
    ['📋', '적응 테스트', '5문항 모두 「보통 이상」', `${MY_REG.since} 첫 등원 때 30분 동안 봤습니다.
      다른 아이에게 다가가기·이름 부르면 오기·혼자 기다리기·간식 앞에서 참기·낯선 사람 만나기 다섯 가지예요.`,
      '건강·특이사항 기록', 'PL0301'],
    ['💉', '백신', `정상 (${초코.vacD}일 남음)`, `종합백신과 광견병 모두 유효기간 안입니다.
      만료되면 그날부터 등원 체크가 잠기니 미리 알려드려요.`,
      '백신 접종 기록', 'PL0201'],
  ];

  const body = `${U.leafHd(ctx, `${U.esc(초코.nm)}를 ${U.esc(중형.nm)}으로 정한 근거 ${근거.length}가지를 모두 펼쳐 두었습니다.`)}

${U.steps(예약단계, 2)}

${U.card('', `<div class="center">
  <div style="font-size:64px">${중형.ico}</div>
  <h2 class="t-page mt4">${U.esc(초코.nm)}는 <span class="pri">${U.esc(중형.nm)}</span>으로 배정됐어요</h2>
  <p class="t-sub mt3">${U.esc(중형.kg)} · 정원 ${중형.cap}마리 · 오늘 ${clsNow('md')}마리가 함께하고 있어요</p>
</div>`, { cls: 'mt8' })}

${U.card('', `<div class="row-b wrap-row">
  <div><div class="t-card">왜 이 반인가요 — 근거 ${근거.length}가지</div>
    <div class="t-sub mt1">지금 펼쳐져 있어요. 접기를 누르면 접힙니다.</div></div>
  ${U.btn('접기 ▴', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="why402" data-more-label="배정 기준 펼치기 ▾"' })}
</div>
<div class="mt6" data-more-body="why402">
  <div class="list1">
    ${근거.map(([ico, 무엇, 값, 설명, 어디, to]) => `<div>
      <div class="row-b wrap-row">
        <div class="row"><span style="font-size:var(--fs-sec)">${ico}</span>
          <div><div class="t-card">${무엇} — <span class="pri">${값}</span></div></div></div>
        ${U.btn(어디, { href: to, cls: 'btn-ghost', sm: true })}
      </div>
      <p class="t-sub mt3">${설명}</p>
    </div>`).join('')}
  </div>
</div>`, { cls: 'mt6' })}

${U.card('세 반은 이렇게 나뉩니다', U.table(
  [{ t: '반', w: '20%' }, { t: '몸무게', w: '20%' }, { t: '정원', w: '14%' }, '어떤 반인가요'],
  CLASSES.map((c) => ({
    cls: c.id === 초코.cls ? '' : 'muted',
    cells: [
      c.id === 초코.cls ? `<b>${c.ico} ${U.esc(c.nm)}</b> ${U.badge(`${U.esc(초코.nm)}`, 'b-solid')}` : `${c.ico} ${U.esc(c.nm)}`,
      U.esc(c.kg),
      { t: `${clsNow(c.id)} / ${c.cap}`, cls: 'num' },
      U.esc(c.desc),
    ],
  })), { cls: 'left' }), { cls: 'mt6' })}

${U.banner('info', '📏', `<b>몸무게가 첫 기준이고, 성향이 그다음입니다.</b>
  <div class="t-sub mt2">몸무게 차이가 큰 아이들은 놀이 공간을 아예 나눠 씁니다.
  같은 구간 안에서 성향에 따라 놀이 시간을 짧게 여러 번 나누거나, 매트 구역을 따로 둡니다.
  ${U.esc(초코.nm)}는 ${초코.kg}kg 로 ${U.esc(중형.nm)} 한가운데라 몸무게가 조금 늘거나 줄어도 반이 바뀌지 않아요.</div>`,
  { cls: 'mt6', right: U.btn('반 편성 기준 소개', { href: 'HO0401', cls: 'btn-ghost', sm: true }) })}

<div class="btns mt8">
  ${U.btn('결제하기', { href: 'RE0501', cls: 'btn-pri' })}
  ${U.btn('반 재배정 안내 보기', { href: 'RE0404', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   RE0403 반 배정 결과 확인 > 또래 수 실시간
   ⚠ 인원은 손으로 적지 않는다. clsNow()·inClass() 로 «세어» 쓴다.
   ============================================================ */
P['RE0403'] = (ctx) => {
  const 지금인원 = clsNow(중형.id);
  const 오면 = 지금인원 + 1;
  const 남는자리 = 중형.cap - 오면;
  const 임박 = 남는자리 <= 2;
  const 또래 = inClass(중형.id);

  const body = `${U.leafHd(ctx, `${U.esc(중형.nm)}은 지금 ${지금인원}마리, ${U.esc(초코.nm)}가 오면 ${오면}마리가 됩니다 (정원 ${중형.cap}마리).`)}

${U.steps(예약단계, 2)}

${U.banner(임박 ? 'warn' : 'ok', 임박 ? '⏳' : '✓', `<b>${U.esc(중형.nm)} 자리가 ${남는자리}자리 남았어요.</b>
  <div class="t-sub mt2">${U.esc(초코.nm)}를 넣으면 ${오면}/${중형.cap}마리가 됩니다.
  ${임박 ? '정원까지 얼마 남지 않았어요. 결제까지 마치셔야 자리가 확정됩니다 — 지금은 10분 동안만 잡아 두고 있습니다.' : '아직 여유가 있습니다.'}</div>`,
  { cls: 'mt8' })}

<div class="g3 mt6">
  ${U.stat(`${U.esc(중형.nm)} 지금 인원`, 지금인원, { u: `/ ${중형.cap}마리`, ico: 중형.ico, d: '오늘 등원해 지금 원에 있는 아이들' })}
  ${U.stat(`${U.esc(초코.nm)}가 오면`, 오면, { u: `/ ${중형.cap}마리`, ico: '➕', cls: 임박 ? 'warn' : 'ok', d: `남는 자리 ${남는자리}자리` })}
  ${U.stat('정원까지', 남는자리, { u: '자리', ico: '🪑', cls: 임박 ? 'warn' : '', d: 임박 ? '2자리 이하면 마감 임박으로 표시합니다' : '여유 있어요' })}
</div>

${U.card(`${U.esc(중형.nm)} 정원 대비 인원`, `
  <div class="row-b wrap-row mb4">
    <span class="live"><span class="dot"></span>지금 ${U.esc(중형.nm)}에 ${지금인원}마리</span>
    ${U.badge(임박 ? `마감 임박 · ${남는자리}자리` : `여유 · ${남는자리}자리`, 임박 ? 'b-warn' : 'b-ok')}
  </div>
  ${U.progress(Math.round(오면 / 중형.cap * 100), 임박 ? 'warn' : '')}
  <p class="t-sub mt3">${U.esc(초코.nm)}를 넣은 ${오면}마리 기준입니다 (${Math.round(오면 / 중형.cap * 100)}%).
    ${U.esc(중형.desc)}</p>`, { cls: 'mt6' })}

${U.card('세 반의 지금 상황', `
  ${U.bars(CLASSES.map((c) => [`${c.ico} ${c.nm}`, clsNow(c.id), `${clsNow(c.id)} / ${c.cap}마리`]), { u: '마리' })}
  <p class="hint">지금 원에 있는 아이 ${CLASSES.reduce((s, c) => s + clsNow(c.id), 0)}마리를 반별로 나눈 것입니다.
    아침에 등원 체크를 할 때마다 이 숫자가 늘어납니다.</p>`, { cls: 'mt6' })}

${U.card('', `<div class="row-b wrap-row">
  <div><div class="t-card">지금 ${U.esc(중형.nm)}에 있는 ${또래.length}마리</div>
    <div class="t-sub mt1">${U.esc(초코.nm)}가 매일 만나게 될 친구들이에요.</div></div>
  ${U.btn('또래 보기 ▾', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="peer403" data-more-label="또래 보기 ▾"' })}
</div>
<div class="mt6" data-more-body="peer403" hidden>
  <div class="g3">
    ${또래.map((d) => `<div class="box center">
      ${U.dogPh(d.nm, 64)}
      <div class="t-card mt2">${U.esc(d.nm)}</div>
      <div class="t-sub mt1">${U.esc(d.breed)} · ${d.kg}kg</div>
      <div class="mt2">${U.badge(U.esc(d.tags[0]), 'b-line')}</div>
    </div>`).join('')}
  </div>
  <p class="hint">사진은 보호자님이 올려 주신 것을 씁니다. 아직 안 올리신 아이는 자리만 보여요.</p>
</div>`, { cls: 'mt6' })}

${U.banner('info', '🔄', `<b>이 숫자는 아침마다 달라집니다.</b>
  <div class="t-sub mt2">등원 체크를 할 때마다 반 인원이 다시 세어집니다. 결석·지각이 있으면 그날은 더 적어요.
  정원을 넘기는 일은 없습니다 — 넘길 것 같으면 예약 단계에서 미리 막습니다.</div>`,
  { cls: 'mt6', right: U.btn('반 재배정 안내', { href: 'RE0404', cls: 'btn-ghost', sm: true }) })}`;

  return {
    body,
    o: {
      stick: U.stickBar(
        `<div><div class="t-sub">${U.esc(초코.nm)} · ${U.esc(중형.nm)} ${오면}/${중형.cap}마리</div>
          <div class="price">${U.won(정기값)}</div></div>`,
        U.btn('결제하기', { href: 'RE0501', cls: 'btn-pri' }),
      ),
    },
  };
};

/* ============================================================
   RE0404 반 배정 결과 확인 > 반 재배정 안내
   ⚠ 실제로 반이 바뀐 사례는 ALERTS(보호자 알림 발송 이력)에서 가져다 쓴다.
   ============================================================ */
P['RE0404'] = (ctx) => {
  const 바뀐사례 = ALERTS.filter((a) => a.kind === '반 변경');
  const 첫등원 = { y: 2026, m: 8, d: 31 };
  const 아래여유 = (초코.kg - 중형.kgMin).toFixed(1);
  const 위여유 = (중형.kgMax - 초코.kg).toFixed(1);

  const body = `${U.leafHd(ctx, `지금 배정은 ${U.esc(중형.nm)}입니다. 첫날 적응을 보고 바뀔 수 있고, 바뀌면 그날 바로 알려드려요.`)}

${U.steps(예약단계, 2)}

${U.banner('info', '🔄', `<b>반은 «가배정»입니다. 첫 등원 날 확정됩니다.</b>
  <div class="t-sub mt2">등록하신 몸무게(${초코.kg}kg)와 성향으로 ${U.esc(중형.nm)}을 정했습니다.
  첫날 30분 적응 시간에 다른 아이들과 어떻게 지내는지 보고, 그날 오후에 확정합니다.
  바뀌면 ${U.esc(SITE.kakao)} 채널로 그날 바로 알려드려요.</div>`, { cls: 'mt8' })}

${U.card('확정까지 이렇게 갑니다', U.timeline([
  { hh: `${첫등원.m}/${첫등원.d} 09:00`, t: `첫 등원 (${요일(첫등원.y, 첫등원.m, 첫등원.d)}요일)`, d: '보호자님과 함께 오시면 아이가 덜 긴장해요', k: 'done' },
  { hh: '09:00 ~ 09:30', t: '적응 시간 30분', d: `${U.esc(중형.nm)} 아이들과 짧게 만나 봅니다. 보육교사가 곁에서 지켜봅니다`, k: 'on' },
  { hh: '09:30', t: '반 합류', d: '괜찮으면 그대로 자유놀이에 들어갑니다' },
  { hh: '15:00', t: '원장 확인', d: '하루 동안 지켜본 것을 원장이 반 편성 보드에서 확인합니다' },
  { hh: '18:30', t: '알림장과 함께 확정 안내', d: '반이 그대로면 그대로, 바뀌면 왜 바뀌었는지 함께 적어 보내드립니다' },
]), { cls: 'mt8' })}

${U.card('어떤 때 반이 바뀌나요', `
  ${U.accordion([
    { q: '몸무게가 경계에 가까울 때', a: `<p>${U.esc(중형.nm)} 구간은 ${U.esc(중형.kg)} 입니다.
      ${U.esc(초코.nm)}는 ${초코.kg}kg 로 아래 경계에서 ${아래여유}kg, 위 경계에서 ${위여유}kg 떨어져 있어
      경계에서 먼 편이에요. 경계에서 1kg 안쪽인 아이는 첫날 실제로 노는 모습을 보고 옮기는 일이 있습니다.</p>` },
    { q: '큰 아이들 사이에서 겁을 낼 때', a: `<p>몸무게로는 맞아도 아이가 계속 구석에 있으면 한 단계 작은 반으로 옮깁니다.
      반대로 작은 반에서 너무 심심해하면 위 반으로 옮기기도 해요. 이때는 원장이 보호자님께 먼저 전화를 드립니다.</p>` },
    { q: '짖음이 잦아 다른 아이가 힘들어할 때', a: `<p>성향 태그에 「짖음 많음」이 있는 아이는 놀이 시간을 짧게 여러 번 나눕니다.
      그래도 어려우면 조용한 아이들이 모인 반으로 옮깁니다.</p>` },
    { q: '몸무게가 크게 늘거나 줄었을 때', a: `<p>등원할 때마다 몸무게를 재고, 한 달에 한 번 기록을 남깁니다.
      구간을 넘어가면 다음 달부터 반이 바뀝니다. 요금은 달라지지 않아요.</p>` },
  ], -1)}`, { cls: 'mt6' })}

${U.card('실제로 반이 바뀐 아이들', `
  <p class="t-sub mb4">최근 보호자님께 나간 「반 변경」 알림 ${바뀐사례.length}건입니다. 바뀌면 이렇게 알려드려요.</p>
  ${U.table([{ t: '언제', w: '16%' }, { t: '아이', w: '14%' }, { t: '어떻게 알렸나', w: '16%' }, '보낸 내용'],
    바뀐사례.map((a) => [
      a.when, `<b>${U.esc(a.dog)}</b>`, `${U.esc(a.ch)} ${U.stBadge(a.st)}`, U.esc(a.msg),
    ]), { cls: 'left' })}
  <p class="hint">알림이 실패하면 다음 날 다시 보내고, 그래도 안 되면 전화를 드립니다.</p>`,
  { cls: 'mt6' })}

${U.card('반이 바뀌면 무엇이 달라지나요', U.kv([
  ['요금', '<b>달라지지 않습니다.</b> 정기권·회차권 값은 반과 상관없이 같아요'],
  ['담당 보육교사', '반이 바뀌면 담당 선생님도 바뀝니다. 첫 알림장에 새 선생님 이름이 적혀요'],
  ['놀이 공간', '반마다 놀이터가 나뉘어 있어 노는 자리가 바뀝니다'],
  ['적응 시간', `${U.esc(초코.nm)}는 ${MY_REG.since} 에 이미 한 번 적응 테스트를 했어요. 반이 바뀌면 15분 정도만 짧게 다시 봅니다`],
  ['되돌리기', '옮긴 뒤에도 아이가 힘들어하면 언제든 되돌립니다. 원장에게 말씀해 주세요'],
], { cls: 'left' }), { cls: 'mt6' })}

${U.card('반이 바뀌면 어떻게 알려드릴까요', `<div class="list1">
  ${[['카카오톡', `${U.esc(SITE.kakao)} 채널로 바뀐 그날 바로 보내드립니다`, true],
    ['앱 푸시', '휴대폰 알림으로도 함께 받습니다', true],
    ['문자', '카카오톡을 못 받으실 때만 문자로 보냅니다', false]]
    .map(([t, d, on]) => `<div class="row-b wrap-row">
      <div><div class="t-card">${t}</div><div class="t-sub mt1">${d}</div></div>
      ${U.toggle(on, `${t} 알림을 ${on ? '껐어요' : '켰어요'} — 마이페이지에서 언제든 다시 바꿀 수 있습니다`)}
    </div>`).join('')}
</div>
<p class="hint">반이 바뀔 때는 왜 바뀌었는지와 새 담당 선생님 이름을 함께 적어 보내드립니다.</p>`,
  { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('결제하기', { href: 'RE0501', cls: 'btn-pri' })}
  ${U.btn('배정 기준 다시 보기', { href: 'RE0402', cls: 'btn-ghost' })}
  ${U.btn('반 편성 기준 소개', { href: 'HO0401', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   RE0502 결제 > 결제 수단 탭
   ⚠ 탭과 몸통은 «한 상자»여야 한다 — tabBox() 가 묶어 준다.
     갈라 놓으면 눌리기는 하는데 내용이 안 바뀐다.
   ============================================================ */
P['RE0502'] = (ctx) => {
  const 수단 = [
    ['💳', '카드', '국내 모든 카드 · 할부 가능 · 자동 청구 가능'],
    ['📱', '간편결제', '카카오페이 · 네이버페이 · 토스페이 · 자동 청구 가능'],
    ['🏦', '계좌이체', '회차권 구매만 가능 · 자동 청구는 걸 수 없어요'],
  ];

  const body = `${U.leafHd(ctx, '세 가지 중 하나를 고르시면 아래 입력 칸이 그 수단에 맞게 바뀝니다.')}

${U.steps(예약단계, 3)}

${U.card('무엇을 사시나요', `
  <div class="row-b wrap-row">
    <div><div class="t-card">정기 요일권 주 ${MY_REG.days.length}회</div>
      <div class="t-sub mt1">매주 ${MY_REG.days.join('·')} · ${U.esc(초코.nm)} · ${U.esc(중형.nm)}</div></div>
    <div class="t-sec pri">${U.won(정기값)}</div>
  </div>`, { cls: 'mt8' })}

${U.sec('결제 수단', U.tabBox(
  [{ label: '💳 카드', pane: 'c' }, { label: '📱 간편결제', pane: 's' }, { label: '🏦 계좌이체', pane: 'b' }],
  U.pane('c', U.box(`
    ${U.field('카드 번호', U.input({ ph: '0000 0000 0000 0000' }), { req: true })}
    <div class="f3">
      ${U.field('유효기간', U.input({ ph: 'MM/YY' }), { req: true })}
      ${U.field('CVC', U.input({ ph: '뒷면 3자리' }), { req: true })}
      ${U.field('할부', U.select(['일시불', '2개월', '3개월', '6개월', '12개월'], 0, { attr: ` data-inst-for="${낼돈}"` })
        + `<span class="hint" data-inst-out>한 번에 ${U.num(낼돈)}원 나갑니다</span>`)}
    </div>
    ${U.check('이 카드를 매월 자동 청구에 쓰겠습니다', { on: true })}
    <p class="hint">카드 정보는 결제 대행사에 바로 보내고 저희 서버에는 남기지 않습니다.</p>`), true)
  + U.pane('s', U.box(`
    <div class="btns">
      ${['카카오페이', '네이버페이', '토스페이'].map((t) =>
        U.btn(t, { cls: 'btn-ghost', attr: ` data-toast="${t} 창을 엽니다 (프로토타입 화면이라 실제로 열리지는 않아요)"` })).join('')}
    </div>
    <p class="hint mt6">간편결제도 자동 청구를 걸 수 있어요. 앱에서 「정기결제 동의」를 한 번만 눌러 주시면 됩니다.</p>
    ${U.banner('ok', '⚡', `<b>가장 빠릅니다.</b>
      <div class="t-sub mt2">카드 번호를 적지 않아도 되고, 앱에서 지문이나 비밀번호로 끝납니다.</div>`, { cls: 'mt6' })}`))
  + U.pane('b', U.box(`
    ${U.banner('warn', '⚠', `<b>계좌이체는 자동 청구가 안 됩니다.</b>
      <div class="t-sub mt2">정기 요일권은 매월 1일에 자동으로 청구돼야 해서 카드나 간편결제만 됩니다.
      회차권 구매에는 계좌이체를 쓰실 수 있어요.</div>`)}
    <div class="mt6">${U.kv([
      ['입금 은행', '국민은행 123456-04-567890'],
      ['예금주', U.esc(SITE.name)],
      ['입금 기한', '주문 뒤 24시간 안에 입금해 주세요'],
      ['현금영수증', '입금 확인 뒤 등록하신 연락처로 자동 발행됩니다'],
    ], { cls: 'left' })}</div>
    <div class="btns mt6">${U.btn('회차권으로 바꿔 사기', { href: 'HO0201', cls: 'btn-sub' })}</div>`)),
  0,
))}

${U.card('수단마다 이런 점이 다릅니다', U.table(
  [{ t: '수단', w: '22%' }, { t: '자동 청구', w: '18%' }, '메모'],
  수단.map(([ico, nm, d]) => [
    `${ico} <b>${nm}</b>`,
    nm === '계좌이체' ? U.badge('안 됩니다', 'b-dan') : U.badge('됩니다', 'b-ok'),
    d,
  ]), { cls: 'left' }), { cls: 'mt6' })}

${U.card('최종 결제 금액', U.sumRows([
  [`정기 요일권 주 ${MY_REG.days.length}회`, U.won(정기값)],
  [`형제견 할인 (${PRICE.siblingOff}%)`, `−${U.won(형제할인)}`, 'minus'],
], ['오늘 낼 금액', U.won(낼돈)]), { cls: 'mt6' })}`;

  return {
    body,
    o: {
      stick: U.stickBar(
        `<div><div class="t-sub">형제견 할인 −${U.won(형제할인)} 적용</div><div class="price">${U.won(낼돈)}</div></div>`,
        U.btn('동의하고 결제하기', { href: 'RE0503', cls: 'btn-pri' }),
      ),
    },
  };
};

/* ============================================================
   RE0503 결제 > 자동 청구 동의
   ⚠ 필수 체크를 «다» 해야 결제 버튼이 열린다.
     체크(data-agree)·표시자(data-unlock-all)·버튼을 «같은 data-agree-scope 상자» 안에 둔다.
     갈라 두면 영영 안 열린다 (인테리어 팩에서 실제로 겪었다).
   ============================================================ */
P['RE0503'] = (ctx) => {
  const 필수 = [
    ['이용 약관에 동의합니다', '등원·하원 절차, 인계 보호자 확인, 사고가 났을 때의 처리 절차를 포함합니다'],
    ['환불 규정에 동의합니다', '정기권은 일할 계산으로 환불하고, 회차권은 남은 횟수를 구매가 기준으로 환불합니다'],
    [`매월 1일 자동 청구에 동의합니다 (${U.won(낼돈)})`, `첫 청구는 ${MY_REG.next} · 해지하실 때까지 매월 1일에 같은 금액이 나갑니다`],
  ];

  const body = `${U.leafHd(ctx, `필수 ${필수.length}가지에 모두 동의하셔야 결제 버튼이 열립니다.`)}

${U.steps(예약단계, 3)}

${U.card('자동 청구가 어떻게 되나요', `
  <div class="row-b wrap-row">
    <div><div class="t-card">매월 1일에 ${U.won(낼돈)} 이 자동으로 청구됩니다</div>
      <div class="t-sub mt1">첫 청구일 ${MY_REG.next} · 매주 ${MY_REG.days.join('·')} 등원 · ${U.esc(초코.nm)} · ${U.esc(중형.nm)}</div></div>
    ${U.toggle(true, '자동 청구를 켰어요 — 마이페이지에서 언제든 끌 수 있습니다')}
  </div>
  <div class="mt6">${U.sumRows([
    ['오늘 결제', `${U.won(낼돈)} <span class="t-sub">(정기 요일권 주 ${MY_REG.days.length}회 · 형제견 할인 ${PRICE.siblingOff}% 적용)</span>`],
    ['다음 청구', `${MY_REG.next} · ${U.won(낼돈)}`],
    ['그 뒤', '매월 1일 · 해지하실 때까지'],
    ['쉬는 달', '일시정지를 켜시면 그 기간 동안 청구가 멈춥니다'],
  ], ['한 달에 나가는 돈', U.won(낼돈)])}</div>`, { cls: 'mt8' })}

${U.card('', `<div class="row-b wrap-row">
  <div><div class="t-card">해지는 어떻게 하나요</div>
    <div class="t-sub mt1">언제든 할 수 있고, 위약금이 없습니다.</div></div>
  ${U.btn('해지 방법 보기 ▾', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="quit503" data-more-label="해지 방법 보기 ▾"' })}
</div>
<div class="mt6" data-more-body="quit503" hidden>
  <p class="t-sub">마이페이지 › 정기 등원 관리에서 「해지」를 누르시면 됩니다.
  해지하면 <b>그달까지는 그대로 다니시고</b> 다음 달부터 청구가 멈춥니다.
  이미 낸 달의 남은 등원 횟수는 낱개 회차권으로 바꿔 드리고, 회차권은 ${PRICE.packs[0].days}일 동안 쓰실 수 있어요.
  길게 쉬시는 것뿐이면 해지 대신 일시정지를 켜 두시는 편이 낫습니다 — 자리가 그대로 남습니다.</p>
  <div class="btns mt6">
    ${U.btn('정기 등원 관리 화면 보기', { href: 'MY0301', cls: 'btn-sub', sm: true })}
    ${U.btn('환불 규정 자주 묻는 질문', { href: 'CS0101', cls: 'btn-ghost', sm: true })}
  </div>
</div>`, { cls: 'mt6' })}

${U.card('동의', `<div data-agree-scope>
  <label class="check"><input type="checkbox" data-agree-all><span><b>아래 항목에 모두 동의합니다</b></span></label>
  <div style="border-top:1px solid var(--border);margin:var(--sp-item) 0"></div>
  <div data-pick-scope="agree">
    ${필수.map(([t, sub]) => U.check(`<b>[필수]</b> ${t}`, { attr: ' data-agree', sub })).join('')}
  </div>
  ${U.check('[선택] 알림장과 이벤트 소식을 카카오톡으로 받겠습니다', { on: false })}
  <div class="mt6"><span data-unlock-all="payBtn503" hidden></span>
    <p class="t-sub">필수 ${필수.length}개 중 <b data-pick-out="agree">0</b>개에 동의하셨어요.
      ${필수.length}개를 모두 체크하시면 아래 결제 버튼이 열립니다.</p>
  </div>
  <div class="btns mt6">
    ${U.btn(`${U.won(낼돈)} 결제하기`, { href: 'RE0601', cls: 'btn-pri', lg: true, id: 'payBtn503', off: true })}
    ${U.btn('결제 수단 다시 고르기', { href: 'RE0502', cls: 'btn-ghost' })}
  </div>
</div>`, { cls: 'mt6' })}

${U.banner('warn', '🔕', `<b>동의하지 않으시면 결제가 진행되지 않습니다.</b>
  <div class="t-sub mt2">자동 청구에 동의하지 않으시려면 정기 요일권 대신
  회차권을 사시면 됩니다 — 회차권은 살 때 한 번만 결제하고 자동 청구가 없어요.</div>`,
  { cls: 'mt6', right: U.btn('회차권으로 바꿔 사기', { href: 'HO0201', cls: 'btn-sub', sm: true }) })}`;

  return {
    body,
    o: {
      stick: U.stickBar(
        `<div><div class="t-sub">필수 ${필수.length}개 중 <b data-pick-out="agree">0</b>개 동의 · 형제견 할인 −${U.won(형제할인)}</div>
          <div class="price">${U.won(낼돈)}</div></div>`,
        U.btn('위 동의 상자에서 결제하세요', { cls: 'btn-ghost', attr: ' data-toast="필수 항목 세 개를 모두 체크하시면 결제 버튼이 열립니다"' }),
      ),
    },
  };
};

/* ============================================================
   RE0504 결제 > 결제 진행 중
   ⚠ 로딩 상태다. 버튼은 잠기고 「누르지 말고 기다려 주세요」라고 적는다.
   ============================================================ */
P['RE0504'] = (ctx) => {
  const 홀드분 = 10;

  const body = `${U.leafHd(ctx, '결제창에서 승인을 기다리고 있어요. 이 화면을 닫지 말아 주세요.')}

${U.steps(예약단계, 3)}

${U.card('', `<div class="center">
  <div style="font-size:64px">💳</div>
  <h2 class="t-sec mt4">결제창에서 승인을 기다리고 있어요</h2>
  <p class="t-sub mt3">보통 5초 안에 끝납니다. <b>뒤로 가기를 누르거나 창을 닫지 말아 주세요.</b></p>
  <div class="mt6" style="max-width:420px;margin-left:auto;margin-right:auto">${U.progress(62)}</div>
  <div class="mt4"><span class="live"><span class="dot"></span>승인 요청을 보냈습니다 · 응답 대기 중</span></div>
  <div class="btns mt8" style="justify-content:center">
    ${U.btn('결제 진행 중… 누르지 말고 기다려 주세요', { cls: 'btn-pri', lg: true, off: true })}
  </div>
  <p class="hint mt4">같은 결제가 두 번 나가지 않도록 버튼을 잠가 두었습니다.</p>
</div>`, { cls: 'mt8' })}

${U.card('지금 무엇을 하고 있나요', U.timeline([
  { hh: '1단계', t: '자리 잡기', d: `${U.esc(중형.nm)} 자리와 ${MY_REG.days.join('·')}요일 자리를 ${홀드분}분 동안 잡아 두었습니다`, k: 'done' },
  { hh: '2단계', t: '결제 요청 보내기', d: `${U.won(낼돈)} 승인을 결제 대행사에 요청했습니다`, k: 'done' },
  { hh: '3단계', t: '승인 기다리는 중', d: '카드사 응답을 기다리고 있어요. 보통 5초 안에 옵니다', k: 'on' },
  { hh: '4단계', t: '자동 청구 등록', d: `매월 1일 자동 청구를 걸어 둡니다 (첫 청구 ${MY_REG.next})` },
  { hh: '5단계', t: '예약 확정', d: '예약 완료 화면으로 옮겨 드리고 알림장 채널을 안내합니다' },
]), { cls: 'mt6' })}

${U.banner('warn', '🪟', `<b>결제창이 안 보이시나요?</b>
  <div class="t-sub mt2">팝업이 막혀 있으면 결제창이 뜨지 않습니다. 주소창 오른쪽의 팝업 차단 표시를 눌러 허용해 주세요.
  창을 실수로 닫으셨다면 아래 버튼으로 다시 열 수 있어요 — 자리는 아직 잡혀 있습니다.</div>`,
  { cls: 'mt6', right: U.btn('결제창 다시 열기', { cls: 'btn-sub', sm: true, attr: ' data-toast="결제창을 다시 열었어요 — 잡아 둔 자리는 그대로입니다"' }) })}

${U.banner('info', '⏳', `<b>자리를 ${홀드분}분 동안 잡아 두고 있어요.</b>
  <div class="t-sub mt2">${홀드분}분이 지나면 잡아 둔 자리가 풀리고 처음부터 다시 고르셔야 합니다.
  결제가 늦어지면 자리부터 다시 확인해 드릴게요.</div>`, { cls: 'mt6' })}

${U.card('결제 내용', U.sumRows([
  ['상품', `정기 요일권 주 ${MY_REG.days.length}회 · 매주 ${MY_REG.days.join('·')}`],
  ['반려견', `${U.esc(초코.nm)} · ${U.esc(초코.breed)} · ${초코.kg}kg · ${U.esc(중형.nm)}`],
  [`형제견 할인 (${PRICE.siblingOff}%)`, `−${U.won(형제할인)}`, 'minus'],
], ['승인 요청 금액', U.won(낼돈)]), { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('결제가 안 되면 어떻게 되나요', { href: 'RE0505', cls: 'btn-ghost' })}
  ${U.btn('결제 화면으로 돌아가기', { href: 'RE0501', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   RE0505 결제 > 결제 실패
   ⚠ «왜» 실패했는지를 적는다. 「실패했습니다」만 적으면 손님이 할 수 있는 일이 없다.
   ============================================================ */
P['RE0505'] = (ctx) => {
  const 남은분 = 6;
  const 홀드분 = 10;
  const 까닭 = [
    ['한도 초과', '이번 달 카드 한도를 넘었습니다', `다른 카드로 바꾸거나, 간편결제로 결제해 보세요. 회차권(${U.won(PRICE.packs[0].price)})은 계좌이체로도 살 수 있어요.`],
    ['카드 정보 오류', '카드 번호·유효기간·CVC 중 하나가 맞지 않습니다', '카드 앞뒤를 다시 보고 적어 주세요. 유효기간은 MM/YY 형식입니다.'],
    ['해외 결제 차단', '카드사에서 온라인 결제를 막아 두었습니다', '카드사 앱이나 고객센터에서 온라인 결제를 켜 주시면 됩니다.'],
    ['잔액 부족', '체크카드 잔액이 모자랍니다', '입금하신 뒤 다시 시도하거나, 다른 수단으로 결제해 주세요.'],
  ];

  const body = `${U.leafHd(ctx, `${U.won(낼돈)} 결제가 승인되지 않았어요. 돈은 빠져나가지 않았습니다.`)}

${U.steps(예약단계, 3)}

${U.banner('dan', '⚠', `<b>카드 한도를 넘어 결제가 거절됐어요. (승인 거절 51 · 한도 초과)</b>
  <div class="t-sub mt2">${U.won(낼돈)} 승인을 요청했지만 카드사가 거절했습니다.
  <b>돈은 빠져나가지 않았고</b>, 예약도 아직 만들어지지 않았습니다.
  다른 카드나 간편결제로 다시 시도해 주세요.</div>`,
  { cls: 'mt8', right: U.btn('다시 시도하기', { href: 'RE0501', cls: 'btn-pri', sm: true }) })}

${U.banner('warn', '⏳', `<b>고르신 자리를 ${남은분}분 더 잡아 두고 있어요.</b>
  <div class="t-sub mt2">${U.esc(중형.nm)} 자리와 매주 ${MY_REG.days.join('·')}요일 자리를 ${홀드분}분 동안 잡아 두었고,
  ${홀드분 - 남은분}분이 지났습니다. ${남은분}분 안에 결제하시면 그대로 이어집니다.
  시간이 지나면 요일부터 다시 고르셔야 해요.</div>`, { cls: 'mt6' })}

${U.card('자리를 잡아 둔 시간', `
  ${U.progress(Math.round(남은분 / 홀드분 * 100), 'warn')}
  <div class="row-b wrap-row mt3">
    <span class="t-sub">${홀드분 - 남은분}분 지남</span>
    <span class="t-card">${남은분}분 남음</span>
  </div>`, { cls: 'mt6' })}

${U.card('다른 수단으로 해 보시겠어요', `<div class="g3">
  ${U.box(`<div class="center">
    <div style="font-size:var(--fs-page)">💳</div>
    <div class="t-card mt2">다른 카드</div>
    <p class="t-sub mt2">카드 번호를 새로 적습니다. 할부도 고를 수 있어요.</p>
    <div class="btns mt6" style="justify-content:center">${U.btn('카드 다시 적기', { href: 'RE0502', cls: 'btn-pri', sm: true })}</div>
  </div>`)}
  ${U.box(`<div class="center">
    <div style="font-size:var(--fs-page)">📱</div>
    <div class="t-card mt2">간편결제</div>
    <p class="t-sub mt2">카카오페이·네이버페이·토스페이. 자동 청구도 걸 수 있습니다.</p>
    <div class="btns mt6" style="justify-content:center">${U.btn('간편결제로 하기', { href: 'RE0502', cls: 'btn-sub', sm: true })}</div>
  </div>`)}
  ${U.box(`<div class="center">
    <div style="font-size:var(--fs-page)">🏦</div>
    <div class="t-card mt2">계좌이체</div>
    <p class="t-sub mt2">정기권에는 못 쓰고 회차권 구매에만 쓸 수 있어요.</p>
    <div class="btns mt6" style="justify-content:center">${U.btn('회차권으로 바꿔 사기', { href: 'HO0201', cls: 'btn-ghost', sm: true })}</div>
  </div>`)}
</div>`, { cls: 'mt6' })}

${U.card('이런 까닭으로 거절됩니다', U.table(
  [{ t: '거절 사유', w: '20%' }, { t: '무슨 뜻인가요', w: '32%' }, '어떻게 하면 되나요'],
  까닭.map(([t, d, how], i) => ({
    cls: i === 0 ? '' : 'muted',
    cells: [
      i === 0 ? `<b>${t}</b> ${U.badge('이번 건', 'b-dan')}` : t,
      d, how,
    ],
  })), { cls: 'left' }), { cls: 'mt6' })}

${U.card('결제하려던 내용', U.sumRows([
  ['상품', `정기 요일권 주 ${MY_REG.days.length}회 · 매주 ${MY_REG.days.join('·')}`],
  ['반려견', `${U.esc(초코.nm)} · ${U.esc(중형.nm)}`],
  ['정기 요일권', U.won(정기값)],
  [`형제견 할인 (${PRICE.siblingOff}%)`, `−${U.won(형제할인)}`, 'minus'],
], ['다시 시도할 금액', U.won(낼돈)]), { cls: 'mt6' })}

${U.card('', `<div class="row-b wrap-row">
  <div><div class="t-card">돈이 정말 빠져나가지 않았나요?</div>
    <div class="t-sub mt1">승인이 거절되면 결제 자체가 만들어지지 않습니다.</div></div>
  ${U.btn('자세히 보기 ▾', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="paid505" data-more-label="자세히 보기 ▾"' })}
</div>
<div class="mt6" data-more-body="paid505" hidden>
  <p class="t-sub">승인 거절은 카드사가 «허락하지 않았다»는 뜻이라 돈이 나가지 않습니다.
  카드 앱에 「승인 취소」나 「거래 취소」로 잠깐 보였다가 사라지는 일이 있는데, 이는 승인을 시도한 기록일 뿐이고
  실제 청구로 이어지지 않습니다. 체크카드는 드물게 잔액이 몇 분 동안 잡혀 있다가 자동으로 풀립니다.
  하루가 지나도 빠져나간 채로 있으면 ${U.esc(SITE.tel)} 로 알려 주세요 — 결제 기록을 확인해 드립니다.</p>
  <div class="btns mt6">
    ${U.btn('결제 기록 확인 요청', { cls: 'btn-sub', sm: true, attr: ' data-toast="결제 기록 확인을 요청했어요 — 영업일 기준 1일 안에 알려드립니다"' })}
    ${U.btn('회차권 현황 보기', { href: 'MY0201', cls: 'btn-ghost', sm: true })}
  </div>
</div>`, { cls: 'mt6' })}

${U.banner('info', '☎️', `<b>계속 안 되시면 알려 주세요.</b>
  <div class="t-sub mt2">${U.esc(SITE.tel)} · ${U.esc(SITE.email)} · 카카오톡 ${U.esc(SITE.kakao)}
  결제 기록을 보고 어디서 막혔는지 확인해 드립니다. 자리는 그동안 따로 잡아 둘게요.</div>`,
  { cls: 'mt6', right: U.btn('1:1 문의 남기기', { href: 'CS0201', cls: 'btn-ghost', sm: true }) })}`;

  return {
    body,
    o: {
      stick: U.stickBar(
        `<div><div class="t-sub">승인 거절 51 · 한도 초과 · 돈은 빠져나가지 않았어요</div>
          <div class="price">${U.won(낼돈)}</div></div>`,
        `${U.btn('결제 수단 바꾸기', { href: 'RE0502', cls: 'btn-ghost' })}
         ${U.btn('다시 시도하기', { href: 'RE0501', cls: 'btn-pri' })}`,
      ),
    },
  };
};

/* ============================================================
   RE0602 예약 완료 > 캘린더 추가
   ⚠ 등원 날짜는 «세어서» 만든다. 8월 31일(월)부터 MY_REG.days 요일만 골라 담는다.
     추석 연휴(9/24 ~ 9/27)에 걸리는 날은 휴무라 빠진다.
   ============================================================ */
P['RE0602'] = (ctx) => {
  const 연휴 = { from: [2026, 9, 24], to: [2026, 9, 27], nm: '추석 연휴 휴무' };
  const 안에 = (y, m, d) => {
    const t = Date.UTC(y, m - 1, d);
    return t >= Date.UTC(연휴.from[0], 연휴.from[1] - 1, 연휴.from[2])
      && t <= Date.UTC(연휴.to[0], 연휴.to[1] - 1, 연휴.to[2]);
  };
  const 등원일 = [];
  const 걸음 = new Date(Date.UTC(2026, 7, 31));          // 첫 등원일 8/31
  while (등원일.length < 12) {
    const y = 걸음.getUTCFullYear(), m = 걸음.getUTCMonth() + 1, d = 걸음.getUTCDate();
    const dw = DOW[(걸음.getUTCDay() + 6) % 7];
    if (MY_REG.days.includes(dw)) 등원일.push({ y, m, d, dw, 휴무: 안에(y, m, d) });
    걸음.setUTCDate(걸음.getUTCDate() + 1);
  }
  const 쉬는날 = 등원일.filter((x) => x.휴무);
  const 다니는날 = 등원일.length - 쉬는날.length;
  const 첫날 = 등원일[0];
  const 반복글 = `매주 ${MY_REG.days.join('·')} ${SITE.open} ~ ${SITE.close} · 종료 없음`;

  const body = `${U.leafHd(ctx, `${반복글} 일정을 캘린더에 넣어 드립니다. 첫 등원은 ${날짜글(첫날.y, 첫날.m, 첫날.d)}입니다.`)}

${U.banner('ok', '📅', `<b>매주 반복되는 일정 하나로 넣어 드려요.</b>
  <div class="t-sub mt2">${반복글}. 날짜를 하나하나 넣지 않아도 되고,
  나중에 요일을 바꾸시면 캘린더 일정도 함께 바꿔 드립니다.</div>`, { cls: 'mt8' })}

${U.card('어디에 넣을까요', `<div class="g3">
  ${[['🗓', '구글 캘린더', 'Google Calendar'], ['🍎', '애플 캘린더', 'iCloud · .ics 파일'], ['📧', '아웃룩', 'Outlook · Microsoft 365']]
    .map(([ico, nm, d]) => U.box(`<div class="center">
      <div style="font-size:var(--fs-page)">${ico}</div>
      <div class="t-card mt2">${nm}</div>
      <div class="t-sub mt1">${d}</div>
      <div class="btns mt6" style="justify-content:center">
        ${U.btn('넣기', { cls: 'btn-pri', sm: true, attr: ` data-toast="${nm}에 「${U.esc(SITE.name)} 등원」 일정을 넣었어요 — ${U.esc(반복글)}"` })}
      </div>
    </div>`)).join('')}
</div>
<p class="hint">회사 계정 캘린더는 관리자가 막아 두었을 수 있어요. 그때는 .ics 파일을 내려받아 직접 넣으시면 됩니다.</p>`,
  { cls: 'mt8' })}

${U.card('넣을 일정 내용', U.kv([
  ['제목', `${SITE.mark} ${U.esc(초코.nm)} 등원 (${U.esc(SITE.name)})`],
  ['반복', 반복글],
  ['첫 일정', `${날짜글(첫날.y, 첫날.m, 첫날.d)} ${SITE.open}`],
  ['장소', U.esc(SITE.addr)],
  ['알림', '전날 저녁 21시 · 당일 아침 8시 (두 번)'],
  ['메모', `준비물 — 목줄·하네스, 하루치 사료, 여벌 옷(비 오는 날). 문의 ${U.esc(SITE.tel)}`],
], { cls: 'left' }), { cls: 'mt6' })}

${U.card(`앞으로 ${Math.ceil(등원일.length / MY_REG.days.length)}주 등원 날짜`, `
  <p class="t-sub mb4">가까운 ${등원일.length}번을 세어 두었습니다. 이 중 ${쉬는날.length}번은 ${연휴.nm}라 빠지고, ${다니는날}번을 다닙니다.</p>
  ${U.table([{ t: '날짜', w: '30%' }, { t: '요일', w: '14%' }, '메모'],
    등원일.map((x) => ({
      cls: x.휴무 ? 'muted' : '',
      cells: [
        x.휴무 ? `${x.m}월 ${x.d}일` : `<b>${x.m}월 ${x.d}일</b>`,
        `${x.dw}요일`,
        x.휴무
          ? `${U.badge('휴무', 'b-warn')} ${연휴.nm} (${연휴.from[1]}/${연휴.from[2]} ~ ${연휴.to[1]}/${연휴.to[2]}) — 이 날은 캘린더에서 빼 드립니다`
          : `${U.badge('등원', 'b-ok')} ${SITE.open} ~ ${SITE.close}`,
      ],
    })), { cls: 'left' })}`, { cls: 'mt6' })}

${U.banner('warn', '🏮', `<b>${연휴.nm}에 걸리는 ${쉬는날.length}번은 자동으로 빠집니다.</b>
  <div class="t-sub mt2">${연휴.from[1]}월 ${연휴.from[2]}일부터 ${연휴.to[1]}월 ${연휴.to[2]}일까지는 원이 쉽니다.
  ${쉬는날.map((x) => `${x.m}/${x.d}(${x.dw})`).join(' · ')} 은 등원 요일이지만 그 주에는 오지 않으셔도 돼요.
  <b>휴무일은 회차가 차감되지 않고 정기권 값도 그대로입니다.</b></div>`,
  { cls: 'mt6', right: U.btn('휴무 공지 보기', { href: 'HO0501', cls: 'btn-ghost', sm: true }) })}

${U.card('알림도 함께 켜 둘까요', `
  <div class="list1">
    ${[['전날 저녁 21시', '내일 등원하는 날이에요 — 사료와 목줄을 챙겨 두세요', true],
      ['당일 아침 8시', `오늘 ${SITE.open} 등원입니다`, true],
      ['하원 30분 전', `${SITE.close} 하원이에요. 오시는 길이면 미리 알려 주세요`, false]]
      .map(([t, d, on]) => `<div class="row-b wrap-row">
        <div><div class="t-card">${t}</div><div class="t-sub mt1">${d}</div></div>
        ${U.toggle(on, `${t} 알림을 ${on ? '껐어요' : '켰어요'}`)}
      </div>`).join('')}
  </div>
  <p class="hint">알림은 캘린더 앱이 보냅니다. 알림장은 따로 ${U.esc(SITE.kakao)} 채널로 갑니다.</p>`,
  { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('마이페이지로', { href: 'MY0101', cls: 'btn-pri' })}
  ${U.btn('첫 등원 안내 자세히 보기', { href: 'RE0603', cls: 'btn-sub' })}
  ${U.btn('홈으로', { href: 'HO0101', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   RE0603 예약 완료 > 첫 등원 안내 상세
   ⚠ 준비물 넷을 «다» 체크해야 「준비 다 됐어요」 버튼이 열린다 —
     체크·표시자·버튼을 같은 data-agree-scope 안에 둔다.
   ============================================================ */
P['RE0603'] = (ctx) => {
  const 첫날 = { y: 2026, m: 8, d: 31 };
  const 준비물 = [
    ['🦮', '목줄·하네스', '현관에서 인계할 때까지 채워 주세요. 원 안에서는 벗겨 둡니다'],
    ['🍖', '하루치 사료', '한 봉지에 담아 이름을 적어 주세요. 급여 시간은 등록하신 대로 챙깁니다'],
    ['💉', '백신 증명서', `이미 올려 주셨어요 (백신 정상 · ${초코.vacD}일 남음). 원본은 안 가져오셔도 됩니다`],
    ['📞', '보호자 연락처 확인', '등록하신 번호로 급한 일이 있을 때 바로 연락드립니다'],
  ];
  const 선택물 = [
    ['👕', '여벌 옷', '비 오는 날이나 물놀이 하는 날에만 있으면 좋아요'],
    ['🧸', '집에서 쓰던 담요나 인형', '낯을 많이 가리는 아이는 냄새가 밴 물건이 있으면 빨리 안정됩니다'],
    ['💊', '먹는 약', '이름과 급여 시간을 적어 주시면 보육교사가 그 시간에 챙깁니다'],
  ];

  const body = `${U.leafHd(ctx, `첫 등원은 ${날짜글(첫날.y, 첫날.m, 첫날.d)} ${SITE.open} 입니다. 그날만 30분쯤 더 걸려요.`)}

${U.banner('warn', '⏱', `<b>첫날은 하원이 20 ~ 30분 늦어질 수 있어요.</b>
  <div class="t-sub mt2">아침에 적응 시간 30분을 함께 보내고, 오후에는 하루 동안 지켜본 것을 정리해
  반을 확정합니다. 그래서 첫날만 ${SITE.close} 대신 18시 20 ~ 30분쯤 하원하실 수 있어요.
  ${U.esc(초코.nm)}는 ${MY_REG.since} 부터 다니던 아이라 적응 시간은 15분 정도로 짧게 봅니다.</div>`,
  { cls: 'mt8' })}

${U.card(`${날짜글(첫날.y, 첫날.m, 첫날.d)} 첫날 시간표`, U.timeline([
  { hh: '08:50', t: '조금 일찍 도착해 주세요', d: '현관에서 인계 절차를 처음 한 번 안내해 드립니다', k: 'done' },
  { hh: SITE.open, t: '등원·인사', d: '컨디션을 살피고 오늘 특이사항을 받아 적어요. 보호자님도 함께 계시면 아이가 덜 긴장합니다', k: 'done' },
  { hh: '09:00 ~ 09:15', t: '적응 시간 15분', d: `${U.esc(중형.nm)} 아이들과 짧게 만나 봅니다. 처음 오는 아이는 30분을 봅니다`, k: 'on' },
  { hh: '09:30', t: '자유놀이', d: `${U.esc(중형.nm)} 놀이터에서 60분` },
  { hh: '12:30', t: '점심·배변', d: '가져오신 사료를 먹이고 배변 상태를 기록합니다' },
  { hh: '13:30', t: '낮잠', d: '조명을 낮추고 두 시간. 잠자리는 아이마다 따로예요' },
  { hh: '15:00', t: '원장 확인 · 반 확정', d: '하루 동안 지켜본 것을 보고 반을 확정합니다. 바뀌면 그날 알려드려요' },
  { hh: '17:00', t: '알림장 사진', d: '첫날은 사진을 더 많이 남깁니다' },
  { hh: `${SITE.close} ~ 18:30`, t: '하원', d: '첫날은 그날 있었던 일을 말씀드리느라 20 ~ 30분 늦어질 수 있어요' },
]), { cls: 'mt8' })}

${U.card('꼭 챙기실 것', `<div data-agree-scope data-pick-scope="prep">
  <p class="t-sub mb4">네 가지를 다 챙기시면 아래 버튼이 열립니다. 지금 <b data-pick-out="prep">0</b>개를 챙기셨어요.</p>
  <div class="list1">
    ${준비물.map(([ico, t, d]) => `<div class="row">
      <span style="font-size:var(--fs-sec)">${ico}</span>
      <div class="grow">${U.check(`<b>${t}</b>`, { attr: ' data-agree', sub: d })}</div>
    </div>`).join('')}
  </div>
  <div class="mt6"><span data-unlock-all="prepBtn603" hidden></span></div>
  <div class="btns mt4">
    ${U.btn('준비 다 됐어요', { cls: 'btn-pri', id: 'prepBtn603', off: true, attr: ' data-toast="첫 등원 준비를 마쳤어요 — 8월 31일 월요일 08:50에 뵙겠습니다"' })}
    ${U.btn('마이페이지에서 다시 보기', { href: 'MY0101', cls: 'btn-ghost' })}
  </div>
</div>`, { cls: 'mt6' })}

${U.card('있으면 좋은 것 (없어도 괜찮아요)', `<div class="list1">
  ${선택물.map(([ico, t, d]) => `<div class="row">
    <span style="font-size:var(--fs-sec)">${ico}</span>
    <div class="grow"><div class="t-card">${t}</div><div class="t-sub mt1">${d}</div></div>
  </div>`).join('')}
</div>
<p class="hint">먹는 약이 있으시면 반려견 등록의 건강·특이사항에 미리 적어 두시면 좋아요.</p>
<div class="btns mt6">${U.btn('건강·특이사항 적기', { href: 'PL0301', cls: 'btn-sub', sm: true })}</div>`,
  { cls: 'mt6' })}

${U.card('첫날 자주 묻는 것', U.accordion([
  { q: '적응 테스트에서 떨어질 수도 있나요?', a: `<p>떨어지는 시험이 아닙니다. 어떤 반이 잘 맞는지 보는 시간이에요.
    다른 아이에게 다가가기·이름 부르면 오기·혼자 기다리기·간식 앞에서 참기·낯선 사람 만나기 다섯 가지를 봅니다.
    결과에 따라 반이 바뀔 수는 있지만, 못 다니게 되는 일은 없습니다.</p>` },
  { q: '보호자가 같이 있어야 하나요?', a: `<p>등원 인사 때 5분 정도만 함께 계시면 됩니다.
    오래 계시면 오히려 아이가 헤어질 때 더 힘들어해요. 인사하고 바로 나가시는 편이 낫습니다.</p>` },
  { q: '첫날 아이가 힘들어하면요?', a: `<p>많이 불안해하면 그날은 짧게 보내고 보호자님께 연락드립니다.
    다음 등원부터 시간을 조금씩 늘려 갑니다. ${U.esc(SITE.tel)} 로 언제든 물어보셔도 됩니다.</p>` },
  { q: '알림장은 언제 오나요?', a: `<p>하원 후 정리해서 보통 저녁 18시 30분에 ${U.esc(SITE.kakao)} 채널로 보내드립니다.
    첫날은 사진을 더 많이 담아요. 못 받으신 알림장은 마이페이지 알림장함에 그대로 쌓입니다.</p>` },
  { q: '중간에 못 오게 되면요?', a: `<p>전날까지 마이페이지에서 알려 주시면 회차가 차감되지 않습니다.
    당일에 알려 주시면 1회 차감돼요. 정기 요일권은 쉬는 날을 전날까지 알려 주시면 그 주 횟수에서 빼 드립니다.</p>` },
], -1), { cls: 'mt6' })}

${U.banner('info', '📍', `<b>오시는 길</b>
  <div class="t-sub mt2">${U.esc(SITE.addr)} · ${U.esc(SITE.tel)}<br>${U.esc(SITE.hours)}<br>
  협력 동물병원 ${U.esc(SITE.vet.nm)} — ${U.esc(SITE.vet.dist)}</div>`,
  { cls: 'mt6', right: U.btn('시설 둘러보기', { href: 'HO0301', cls: 'btn-ghost', sm: true }) })}

<div class="btns mt8">
  ${U.btn('캘린더에 넣기', { href: 'RE0602', cls: 'btn-pri' })}
  ${U.btn('마이페이지로', { href: 'MY0101', cls: 'btn-ghost' })}
  ${U.btn('홈으로', { href: 'HO0101', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};
