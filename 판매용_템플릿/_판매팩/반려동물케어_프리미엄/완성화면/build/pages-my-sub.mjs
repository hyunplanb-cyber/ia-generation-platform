/* MY 마이페이지 — 잎사귀 16장.
   부모(MY0101·MY0201·MY0301·MY0401·MY0501)의 뼈대·색·톤은 U.shell() 이 그대로 유지해 준다.
   여기서는 그 화면의 «상태·세부»만 보여 준다.

   ⛔ 숫자는 손으로 두 번 적지 않는다.
     - 회차권 잔여·남은 날수 → MY_PASS / MY_PASS2 / PASS_LOG 에서 읽는다
     - 정기 요일·다음 청구일·월 요금 → MY_REG / PRICE 에서 읽는다
     - 알림장 날짜·요일 → NOTES / NO_SHOW_DAYS 에서 읽고, 요일은 달력으로 다시 센다
   ⛔ confirm · prompt · alert 를 쓰지 않는다. 확인은 U.modal() + data-modal 로 한다. */
import * as U from './ui.mjs';
import {
  SITE, TODAY, DOG, MINE, CLS, PRICE, MY_PASS, MY_PASS2, MY_REG,
  PASS_LOG, NOTES, NO_SHOW_DAYS, STAFF, HEALTH_LOG,
} from './data.mjs';

const P = {};
export const PAGES = P;

/* ---------- 날짜 셈 — 손으로 세지 않는다 ---------- */
const 오늘UTC = Date.UTC(TODAY.y, TODAY.m - 1, TODAY.d);
const 쪼개기 = (ymd) => String(ymd).slice(0, 10).split('-').map(Number);
const 며칠뒤 = (ymd) => { const [y, m, d] = 쪼개기(ymd); return Math.round((Date.UTC(y, m - 1, d) - 오늘UTC) / 86400000); };
const 요일 = (ymd) => { const [y, m, d] = 쪼개기(ymd); return ['일', '월', '화', '수', '목', '금', '토'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; };
const 날짜더하기 = (ymd, n) => {
  const [y, m, d] = 쪼개기(ymd);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')}`;
};
const 날짜글 = (ymd) => `${Number(String(ymd).slice(5, 7))}월 ${Number(String(ymd).slice(8, 10))}일 (${요일(ymd)})`;
const 디데이 = (ymd) => { const n = 며칠뒤(ymd); return n === 0 ? '오늘' : (n > 0 ? `D-${n}` : `${-n}일 지남`); };
/** 등원 → 하원 사이에 얼마나 있었나. ⚠ 손으로 적으면 09:02→18:05 를 「8시간 3분」이라 적게 된다. */
const 걸린 = (a, b) => {
  const 분 = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  const m = 분(b) - 분(a);
  return `${Math.floor(m / 60)}시간 ${m % 60}분`;
};

const 초코 = DOG('d01');
const 보리 = DOG('d02');
/** 「토 09:00 – 17:00」 — SITE.hours 에서 떼어 쓴다. 시간을 두 번 적지 않는다. */
const 토요일운영 = (SITE.hours.match(/토[^·]*/) || [''])[0].trim();

/* ============================================================
   예약 목록 — ⚠ 부모 MY0101 이 보여 주는 것과 «같은» 예약이다.
   부모 빌더가 이 값을 내보내 주지 않아 여기 다시 적되, 날짜·반려견·사유를
   한 글자도 바꾸지 않았다. 차례만 날짜순으로 세웠다.
   ============================================================ */
const 예정 = [
  { d: '2026-08-26 (수)', dog: '초코', cls: 'md', kind: '정기', st: '예정' },
  { d: '2026-08-27 (목)', dog: '보리', cls: 'sm', kind: '낱개', st: '예정' },
  { d: '2026-08-28 (금)', dog: '초코', cls: 'md', kind: '정기', st: '예정' },
  { d: '2026-08-31 (월)', dog: '초코', cls: 'md', kind: '정기', st: '예정' },
];
const 완료 = [
  { d: '2026-08-21 (금)', dog: '초코', cls: 'md', kind: '정기', st: '완료', note: 'n1' },
  { d: '2026-08-19 (수)', dog: '초코', cls: 'md', kind: '정기', st: '완료', note: 'n2' },
  { d: '2026-08-17 (월)', dog: '초코', cls: 'md', kind: '정기', st: '완료', note: 'n3' },
  { d: '2026-08-12 (수)', dog: '보리', cls: 'sm', kind: '낱개', st: '완료', note: 'n5' },
];
const 취소 = [
  { d: '2026-08-18 (화)', dog: '보리', cls: 'sm', kind: '낱개', st: '취소', why: '전날 통보 — 병원 진료', refund: '회차권 1회 돌려드림' },
  { d: '2026-08-05 (수)', dog: '초코', cls: 'md', kind: '정기', st: '취소', why: '당일 통보 — 늦잠', refund: '회차권 1회 차감' },
];
const 예약전체 = [...예정, ...완료, ...취소].sort((a, b) => (a.d < b.d ? 1 : -1));
/* 「이번 달 남은 정기 등원」 — 부모 MY0301 이 「3회」라고 적은 그 숫자다. 세어서 쓴다. */
const 남은정기 = 예정.filter((r) => r.dog === 초코.nm && r.kind === '정기').length;

const 예약줄 = (r, 오른쪽) => `<div class="rowcard${r.st === '취소' ? ' mut' : ''}" data-tag="${U.esc(r.dog)} ${U.esc(r.st)} ${U.esc(r.kind)}">
  <div class="thumb">${U.dogPh(r.dog, 96)}</div>
  <div class="bd">
    <div class="row wrap-row">${U.stBadge(r.st)}${U.badge(`${r.kind} 예약`, 'b-line')}${r.st === '예정' ? U.badge(디데이(r.d), 'b-acc') : ''}</div>
    <div class="t-card mt2">${U.esc(r.d)}</div>
    <div class="t-sub mt1">${U.esc(r.dog)} · ${U.esc(CLS(r.cls).nm)} · 등원 ${SITE.open} ~ 하원 ${SITE.close}</div>
    ${r.why ? `<div class="t-sub mt2">${U.esc(r.why)} · <b>${U.esc(r.refund)}</b></div>` : ''}
  </div>
  <div class="side">${오른쪽 ? 오른쪽(r) : ''}</div>
</div>`;

/** 쪽 번호 — 걸러진 뒤의 쪽수만큼만 남는다(app.js 가 센다) */
const 쪽번호 = (key, 쪽수) => (쪽수 <= 1 ? '' : `<div class="btns mt6" style="justify-content:center" data-page-box="${key}">
  ${Array.from({ length: 쪽수 }).map((_, i) => `<button class="chip${i === 0 ? ' on' : ''}" type="button" data-page-for="${key}" data-page-n="${i + 1}">${i + 1}</button>`).join('')}
  <span class="t-sub" style="align-self:center"><b data-page-all="${key}">${쪽수}</b>쪽 중 <b data-page-now="${key}">1</b>쪽</span>
</div>`);

/* ============================================================
   MY0102 예약 내역 > 상태 탭 전환
   ⚠ 탭이 «진짜로» 목록을 바꾼다(탭 = 몸통 전환, 칩 = 거르기).
     탭 옆 건수도 걸러진 수를 따라간다 — data-filter-cnt 를 탭 이름 안에 넣었다.
   ============================================================ */
P['MY0102'] = (ctx) => {
  const 칸 = (key, list, 한쪽, 오른쪽, 빈말) => {
    const 쪽수 = Math.max(1, Math.ceil(list.length / 한쪽));
    return `<p class="t-sub mb4">이 탭에 <b data-filter-cnt="${key}">${list.length}</b>건이 있어요 · 한 쪽에 ${한쪽}건씩 보여 드립니다</p>
      <div class="stack" data-filter-list="${key}" data-per-page="${한쪽}" style="gap:var(--sp-item)">
        ${list.map((r) => 예약줄(r, 오른쪽)).join('')}
      </div>
      ${쪽번호(key, 쪽수)}
      <div hidden data-empty-for="${key}">${U.empty('🐾', '이 탭에는 아무것도 없어요',
      빈말, U.btn('등원 예약하기', { href: 'RE0101', cls: 'btn-pri' }))}</div>`;
  };
  const 탭이름 = (nm, key, n) => `${nm} <span class="cnt"><b data-filter-cnt="${key}">${n}</b></span>`;

  const body = `${U.leafHd(ctx, '예정·완료·취소를 옮겨 다녀도 화면 주소는 그대로입니다 — 뒤로 가기가 탭에 끼어들지 않아요')}

${U.banner('info', '🗂', `<b>탭은 «같은 예약을 상태로 나눈 것»입니다.</b>
  <div class="t-sub mt2">위의 반려견 칩을 함께 누르면 세 탭이 한꺼번에 걸러지고, 탭 옆 건수와 쪽 번호도 걸러진 수를 따라갑니다.</div>`, { cls: 'mb6' })}

<div class="mb6">${U.chips(['전체', ...MINE.map((d) => d.nm)], 0, { boxAttr: ' data-filter-for="my2a my2b my2c"' })}</div>

${U.tabBox(
    [
      { label: 탭이름('예정', 'my2a', 예정.length), pane: 'a' },
      { label: 탭이름('완료', 'my2b', 완료.length), pane: 'b' },
      { label: 탭이름('취소', 'my2c', 취소.length), pane: 'c' },
    ],
    U.pane('a', 칸('my2a', 예정, 3, (r) => U.btn('예약 취소', { href: 'MY0103', cls: 'btn-dan', sm: true }),
      '고르신 반려견의 예정 예약이 없어요. 다른 아이를 골라 보세요.'), true)
    + U.pane('b', 칸('my2b', 완료, 3, () => U.btn('그날 알림장 보기', { href: 'MY0501', cls: 'btn-sub', sm: true }),
      '고르신 반려견의 완료된 등원이 없어요.'))
    + U.pane('c', 칸('my2c', 취소, 3, () => U.btn('다시 예약', { href: 'RE0301', cls: 'btn-ghost', sm: true }),
      '고르신 반려견의 취소 내역이 없어요.')),
    0,
  )}

<div class="mt8">
  <button class="btn btn-ghost" type="button" data-more-toggle="empt" data-more-label="탭이 비었을 때 어떻게 보이나 ▾">탭이 비었을 때 어떻게 보이나 ▾</button>
  <div class="mt4" hidden data-more-body="empt">
    ${U.box(U.empty('🐾', '이 탭에는 아무것도 없어요',
    '예를 들어 «보리»만 골라 놓고 취소 탭을 열면, 보리의 취소 내역이 없는 달에는 이렇게 보입니다.',
    U.btn('등원 예약하기', { href: 'RE0101', cls: 'btn-pri' })))}
  </div>
</div>

<div class="btns mt8">
  ${U.btn('예약 내역으로', { href: 'MY0101', cls: 'btn-ghost' })}
  ${U.btn('반려견 필터', { href: 'MY0104', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0103 예약 내역 > 예약 취소
   ⛔ 브라우저 confirm 을 쓰지 않는다 — U.modal() 로 화면 안에서 묻는다.
   ⚠ 취소 규칙은 부모(MY0101·MY0201)·고객센터 FAQ 와 같아야 한다:
     전날까지 알리면 회차권 그대로, 당일에 알리면 1회 차감. 현금 수수료는 없다.
   ============================================================ */
P['MY0103'] = (ctx) => {
  const 마감 = (r) => 날짜더하기(r.d, -1);
  const 고를줄 = (r, i) => `<label class="check" style="align-items:flex-start">
    <input type="checkbox"${i === 0 ? ' checked' : ''}>
    <span><b>${U.esc(r.d)}</b> · ${U.esc(r.dog)} · ${U.esc(CLS(r.cls).nm)} · ${U.esc(r.kind)} 예약
      <span class="sub">${날짜글(마감(r))} 23:59까지 취소하면 회차권이 차감되지 않아요 (지금은 ${디데이(r.d)})</span></span>
  </label>`;

  const body = `${U.leafHd(ctx, '고른 예약을 취소합니다. 회차권이 어떻게 되는지 먼저 알려 드려요')}

${U.card('취소할 예약 고르기', `
  <div class="stack" data-pick-scope="cxl">
    ${예정.map(고를줄).join('')}
  </div>
  <p class="hint"><b data-pick-out="cxl">1</b>건을 골랐습니다. 하나도 안 고르면 아래 버튼이 눌리지 않아요.</p>`)}

${U.card('취소 사유', `
  ${U.field('사유를 골라 주세요', U.select(
    ['아이 컨디션이 안 좋아요', '병원 진료가 있어요', '가족 일정이 생겼어요', '날씨 때문에 쉬려고요', '직접 적기'], 0,
    { attr: ' data-reveal-when="직접 적기" data-reveal-box="whyBox"' },
  ), { hint: '원이 미리 알면 그날 반 편성과 간식 준비를 바꿀 수 있어요.' })}
  <div id="whyBox" class="mt4" hidden>
    ${U.field('사유를 적어 주세요', U.textarea({ ph: '예) 예방접종을 맞고 와서 하루 쉬려고 합니다' }))}
  </div>`, { cls: 'mt6' })}

${U.card('회차권은 어떻게 되나요', `
  ${U.table(['언제 알려 주셨나', '회차권', '취소 수수료'], [
    [{ t: `전날 23:59까지 <b>(사전 통보)</b>`, cls: 'nowrap' }, { t: '<span class="ok">차감되지 않아요</span>', cls: '' }, '없어요'],
    [{ t: '등원 당일 <b>(당일 통보)</b>', cls: 'nowrap' }, { t: '<span class="dan">1회 차감</span>', cls: '' }, '없어요'],
  ], { scroll: false })}
  ${U.banner('info', '🎟', `<b>따로 떼는 취소 수수료는 없습니다.</b>
    <div class="t-sub mt2">당일에 알려 주신 날만 자리를 비워 둔 몫으로 회차권 1회가 차감됩니다.
    지금 고르신 예약은 모두 전날까지 여유가 있어, 취소해도 ${U.esc(초코.nm)}의 잔여는 <b>${MY_PASS.left}회</b> 그대로예요.</div>`, { cls: 'mt6' })}
  ${U.banner('warn', '📆', `<b>정기 요일권으로 오시는 날을 취소하면 그 주에는 다시 넣을 수 없어요.</b>
    <div class="t-sub mt2">요일 자체를 바꾸시려면 정기 등원 관리에서 바꾸는 편이 낫습니다.</div>`,
    { cls: 'mt4', right: U.btn('정기 등원 관리', { href: 'MY0301', cls: 'btn-ghost', sm: true }) })}`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('예약 취소하기', { cls: 'btn-dan', id: 'cxlBtn', attr: ' data-pick-btn="cxl" data-modal="mCxl"' })}
  ${U.btn('그냥 두기', { href: 'MY0101', cls: 'btn-ghost' })}
</div>`;

  const after = U.modal('mCxl', '고른 예약을 취소할까요?', `
  <p><b>취소하면 그 자리는 바로 다른 아이가 채울 수 있어요.</b></p>
  <ul class="stack mt4">
    <li class="row"><span class="ok">✓</span><span>전날까지 알려 주신 취소라 회차권은 차감되지 않습니다</span></li>
    <li class="row"><span class="ok">✓</span><span>담당 선생님에게 바로 알림이 갑니다</span></li>
    <li class="row"><span class="dan">·</span><span>같은 날로 다시 예약하려면 자리가 남아 있어야 해요</span></li>
  </ul>`,
  `${U.btn('돌아가기', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${U.btn('취소하기', { cls: 'btn-dan', attr: ' data-notify="예약을 취소했어요 — 전날까지라 회차권은 차감되지 않습니다" data-dismiss' })}`);

  return { body, o: { after } };
};

/* ============================================================
   MY0104 예약 내역 > 반려견 필터
   ⚠ 거르개는 data-tag «한 칸»만 본다. 반려견 이름과 상태를 한 칸에 함께 적는다.
   ============================================================ */
P['MY0104'] = (ctx) => {
  const 한쪽 = 5;
  const 쪽수 = Math.max(1, Math.ceil(예약전체.length / 한쪽));
  const body = `${U.leafHd(ctx, `${MINE.map((d) => d.nm).join(' · ')} 두 아이를 함께 맡기고 계셔서, 목록을 아이별로 나눠 볼 수 있어요`)}

<div class="filters">
  ${U.chips(['전체', ...MINE.map((d) => d.nm)], 0, { boxAttr: ' data-filter-for="my4"' })}
  ${U.select(['전체 상태', '예정', '완료', '취소'], 0, { vals: ['전체', '예정', '완료', '취소'], attr: ' data-filter-sel="my4"' })}
</div>

<p class="t-sub mb4">모두 <b data-filter-cnt="my4">${예약전체.length}</b>건이 있어요 · 한 쪽에 ${한쪽}건씩</p>

<div class="stack" data-filter-list="my4" data-per-page="${한쪽}" style="gap:var(--sp-item)">
  ${예약전체.map((r) => 예약줄(r, (x) => (x.st === '완료'
    ? U.btn('그날 알림장', { href: 'MY0501', cls: 'btn-sub', sm: true })
    : (x.st === '예정' ? U.btn('예약 취소', { href: 'MY0103', cls: 'btn-ghost', sm: true }) : '')))).join('')}
</div>
${쪽번호('my4', 쪽수)}
<div hidden data-empty-for="my4">${U.empty('🐾', '결과가 없습니다',
    '고르신 아이와 상태에 맞는 예약이 없어요. 「전체」를 누르면 다시 모두 보입니다.',
    U.btn('등원 예약하기', { href: 'RE0101', cls: 'btn-pri' }))}</div>

${U.banner('info', '🐶', `<b>「전체」를 누르면 두 아이의 예약이 다시 한 줄로 모입니다.</b>
  <div class="t-sub mt2">아이를 고른 채로 상태 고르개를 함께 쓰면 «보리의 취소 내역»처럼 좁혀 볼 수 있어요.
  건수와 쪽 번호도 걸러진 수를 따라갑니다.</div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('예약 내역으로', { href: 'MY0101', cls: 'btn-ghost' })}
  ${U.btn('상태 탭 전환', { href: 'MY0102', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0202 회차권 현황 > 사용 내역 펼치기
   ⚠ 잔여는 PASS_LOG 가 «계산»한 값이다. 손으로 다시 적지 않는다.
   ============================================================ */
P['MY0202'] = (ctx) => {
  const 오래된순 = [...PASS_LOG].reverse();          // PASS_LOG 는 최근 것부터다
  const 차감 = PASS_LOG.filter(([, , delta]) => delta < 0).length;
  const body = `${U.leafHd(ctx, `${U.esc(초코.nm)}의 ${MY_PASS.n}회권을 언제 얼마나 썼는지 하루 단위로 펼쳐 봅니다`)}

${U.card('', `
  <div class="row-b wrap-row">
    <div class="row">${U.dogPh(MY_PASS.dog, 44)}
      <div><div class="t-card">${U.esc(MY_PASS.dog)}의 ${MY_PASS.n}회권</div>
        <div class="t-sub mt1">구매 ${U.esc(MY_PASS.bought)} · 만료 ${U.esc(MY_PASS.until)}</div></div></div>
    <div class="center">
      <div class="t-sub">남은 횟수</div>
      <div class="t-page pri num">${MY_PASS.left}<span class="t-card muted"> / ${MY_PASS.n}회</span></div>
    </div>
    <div class="grow" style="min-width:200px">
      ${U.progress(MY_PASS.left / MY_PASS.n * 100)}
      <div class="t-sub mt2">지금까지 ${차감}번 등원해 ${차감}회를 썼고, 만료까지 ${MY_PASS.leftDays}일 남았어요</div>
    </div>
  </div>`)}

<div class="mt6">
  <button class="btn btn-sub" type="button" data-more-toggle="log" data-more-label="사용 내역 다시 펼치기 ▾">접기 ▴</button>
</div>

<div class="mt6" data-more-body="log">
  ${U.sec('날짜별 차감 기록', U.table(
    ['날짜', '내용', { t: '변동', cls: 'r' }, { t: '잔여', cls: 'r' }],
    PASS_LOG.map(([d, t, delta, left]) => [
      { t: U.esc(d), cls: 'nowrap' },
      U.esc(t),
      { t: delta > 0 ? `<span class="ok">+${delta}회</span>` : `<span class="dan">${delta}회</span>`, cls: 'r' },
      { t: `<b class="num">${left}회</b>`, cls: 'r' },
    ]),
  ), { desc: '가장 최근 것이 맨 위입니다. 등원 체크가 될 때 한 줄씩 쌓여요.' })}

  ${U.sec('잔여 횟수 변화', U.bars(
    오래된순.map(([d, , , left]) => [String(d).slice(5), left, `${left}회`]),
  ), { desc: `${U.esc(오래된순[0][0])}에 산 뒤로 어떻게 줄어들었는지 — 막대가 남은 횟수입니다.` })}
</div>

${U.banner('info', '🎟', `<b>표를 접어도 잔여 ${MY_PASS.left}회는 그대로입니다.</b>
  <div class="t-sub mt2">이 숫자는 등원 체크가 될 때만 움직여요. 예약만 해 두고 오지 않으신 날은 깎이지 않습니다.</div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('회차권 현황으로', { href: 'MY0201', cls: 'btn-ghost' })}
  ${U.btn('회차권 추가 구매', { href: 'RE0501', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0203 회차권 현황 > 만료 임박 경고
   ⚠ 임박한 것은 «보리»의 회차권이다(MY_PASS2). 남은 날수는 leftDays 가 셈한다.
   ============================================================ */
P['MY0203'] = (ctx) => {
  const 보리예정 = 예정.filter((r) => r.dog === MY_PASS2.dog).length;
  const 더써야 = Math.max(0, MY_PASS2.left - 보리예정);
  const body = `${U.leafHd(ctx, `${U.esc(MY_PASS2.dog)}의 ${MY_PASS2.n}회권이 ${MY_PASS2.leftDays}일 뒤에 만료됩니다`)}

${U.banner('dan', '⏳', `<b>${U.esc(MY_PASS2.until)}에 남은 ${MY_PASS2.left}회가 사라집니다 — ${MY_PASS2.leftDays}일 남았어요.</b>
  <div class="t-sub mt2">만료 7일 안으로 들어오면 이렇게 목록 맨 위로 올라옵니다. 알림도 같이 보내드려요.</div>`,
    { right: U.btn('낱개 예약하기', { href: 'RE0301', cls: 'btn-pri', sm: true }) })}

${U.card('', `
  <div class="row-b wrap-row mb4">
    <div class="row">${U.dogPh(MY_PASS2.dog, 44)}<span class="t-card">${U.esc(MY_PASS2.dog)}의 ${MY_PASS2.n}회권</span></div>
    ${U.badge(`곧 만료돼요 · D-${MY_PASS2.leftDays}`, 'b-warn')}
  </div>
  <div class="row-b wrap-row">
    <div><div class="t-sub">남은 횟수</div>
      <div class="t-page pri num">${MY_PASS2.left}<span class="t-card muted"> / ${MY_PASS2.n}회</span></div></div>
    <div class="grow" style="min-width:200px">
      ${U.progress(MY_PASS2.left / MY_PASS2.n * 100, 'warn')}
      <div class="t-sub mt2">구매 ${U.esc(MY_PASS2.bought)} · 유효기간 ${PRICE.packs[0].days}일 · 만료 <b>${U.esc(MY_PASS2.until)}</b></div>
    </div>
  </div>`, { cls: 'mt6' })}

${U.card('만료 전에 다 쓰려면', `
  ${U.kv([
    ['남은 횟수', `<b>${MY_PASS2.left}회</b>`],
    ['쓸 수 있는 날', `오늘부터 ${U.esc(MY_PASS2.until)}까지 <b>${MY_PASS2.leftDays}일</b>`],
    ['이미 잡아 둔 예약', `${보리예정}건 (${U.esc(예정.filter((r) => r.dog === MY_PASS2.dog).map((r) => r.d).join(', ')) || '없어요'})`],
    ['더 잡으면 좋은 횟수', `<b class="pri">${더써야}회</b>`],
  ])}
  <p class="hint">만료일 ${U.esc(MY_PASS2.until)}은 ${요일(MY_PASS2.until)}요일입니다. 토요일도 ${U.esc(토요일운영.replace('토', '').trim())}에 문을 여니 그날까지 쓰실 수 있어요.</p>
  <div class="btns mt6">
    ${U.btn(`${더써야}회 더 예약하기`, { href: 'RE0301', cls: 'btn-pri' })}
    ${U.btn('예약 내역 보기', { href: 'MY0101', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt6' })}

${U.banner('warn', '🚫', `<b>기간을 늘려 드릴 수는 없어요.</b>
  <div class="t-sub mt2">회차권은 산 날부터 ${PRICE.packs[0].days}일까지만 쓸 수 있습니다(${MY_PASS2.n}회권 기준).
  대신 새 회차권을 사시면 <b>남은 이 회차권을 먼저 씁니다</b> — 먼저 산 것이 먼저 나가요.</div>`, { cls: 'mt6' })}

${U.banner('ok', '🎟', `<b>${U.esc(MY_PASS.dog)}의 ${MY_PASS.n}회권은 아직 여유가 있어요 — 잔여 ${MY_PASS.left}회 · ${MY_PASS.leftDays}일 남음.</b>
  <div class="t-sub mt2">만료 7일 안으로 들어오면 이 아이의 카드도 위처럼 붉게 올라옵니다.</div>`, { cls: 'mt4' })}

<div class="btns mt8">
  ${U.btn('회차권 현황으로', { href: 'MY0201', cls: 'btn-ghost' })}
  ${U.btn('회차권 추가 구매', { href: 'RE0501', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0204 회차권 현황 > 정기권 다음 청구일
   ⚠ 9월 등원 횟수는 요일로 «세어서» 만든다. 추석 연휴 휴무(9/24~9/27)는 뺀다.
   ============================================================ */
P['MY0204'] = (ctx) => {
  const 추석 = ['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'];
  const 구월전부 = [];
  for (let d = 1; d <= 30; d++) {
    const ymd = `2026-09-${String(d).padStart(2, '0')}`;
    if (MY_REG.days.indexOf(요일(ymd)) >= 0) 구월전부.push(ymd);
  }
  const 쉬는날 = 구월전부.filter((d) => 추석.indexOf(d) >= 0);
  const 구월등원 = 구월전부.filter((d) => 추석.indexOf(d) < 0);
  const 회당 = Math.round(MY_REG.per / 구월등원.length);
  const 남은날 = 며칠뒤(MY_REG.next);

  const body = `${U.leafHd(ctx, '정기 요일권은 달마다 1일에 자동으로 청구됩니다')}

${U.card('', `
  <div class="row-b wrap-row">
    <div>
      <div class="t-sub">다음 자동 청구일</div>
      <div class="t-page pri num">${U.esc(MY_REG.next)}</div>
      <div class="t-sub mt1">${날짜글(MY_REG.next)} · ${디데이(MY_REG.next)} (${남은날}일 남음)</div>
    </div>
    <div class="center">
      <div class="t-sub">청구 금액</div>
      <div class="t-sec">${U.won(MY_REG.per)}</div>
      <div class="t-sub">매주 ${MY_REG.days.join('·')} · 주 ${MY_REG.days.length}회</div>
    </div>
    <div class="center">
      <div class="t-sub">결제 수단</div>
      <div class="t-card">등록하신 카드</div>
      <div class="t-sub">청구 3일 전에 알림을 보내드려요</div>
    </div>
  </div>`)}

${U.sec('9월에는 며칠 오게 되나요', `
  ${U.kv([
    ['정기 요일', `매주 ${MY_REG.days.join('·')}`],
    ['9월의 정기 요일', `${구월전부.length}일`],
    ['원 휴무로 빠지는 날', 쉬는날.length ? `${쉬는날.map(날짜글).join(', ')} — 추석 연휴 휴무` : '없어요'],
    ['9월 등원 예정', `<b class="pri">${구월등원.length}회</b>`],
    ['1회당', `약 ${U.won(회당)} 꼴`],
  ])}
  <div class="row wrap-row mt4" style="gap:var(--sp-btn)">
    ${구월등원.map((d) => U.badge(`${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))} ${요일(d)}`, 'b-line')).join('')}
    ${쉬는날.map((d) => U.badge(`${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))} ${요일(d)} 휴무`, 'b-mut')).join('')}
  </div>`, { desc: '청구는 달마다 같지만, 휴무가 낀 달은 오는 날이 하루씩 다릅니다.' })}

${U.sec('앞으로의 청구 예정', U.table(
    ['청구일', '내용', { t: '금액', cls: 'r' }],
    [MY_REG.next, '2026-10-01', '2026-11-01'].map((d, i) => [
      { t: `${U.esc(d)} <span class="t-sub">(${요일(d)})</span>`, cls: 'nowrap' },
      `정기 주${MY_REG.days.length}회 — ${MY_REG.days.join('·')} ${i === 0 ? U.badge('다음 청구', 'b-acc') : ''}`,
      { t: U.won(MY_REG.per), cls: 'r' },
    ]),
  ), { desc: `${U.esc(MY_REG.since)}부터 이용 중입니다. 해지하거나 일시정지하면 그 다음 청구부터 멈춰요.` })}

${U.banner('info', '⏸', `<b>쉬어야 할 일이 생기면 청구를 멈출 수 있어요.</b>
  <div class="t-sub mt2">일시정지를 걸어 두면 그 기간의 자동 청구가 멈추고, 정지한 날짜만큼 다음 청구액에서 빼 드립니다.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('일시정지 설정', { href: 'MY0303', cls: 'btn-sub' })}
  ${U.btn('정기 등원 해지', { href: 'MY0304', cls: 'btn-ghost' })}
  ${U.btn('정기 등원 관리', { href: 'MY0301', cls: 'btn-ghost' })}
  ${U.btn('회차권 현황으로', { href: 'MY0201', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0302 정기 등원 관리 > 요일 변경 반영 시점
   ⚠ 「지금 바로」가 아니라 「다음 주부터」. 이번 주 남은 등원은 예정 목록에서 세어 쓴다.
   ============================================================ */
P['MY0302'] = (ctx) => {
  const 새요일 = ['월', '수', '목'];
  const 다음주월 = 날짜더하기('2026-08-24', 7);              // 오늘(월)에서 이레 뒤 = 8/31 (월)
  const 이번주남은 = 예정.filter((r) => r.dog === 초코.nm && r.d.slice(0, 10) < 다음주월);
  const 다음주등원 = [];
  for (let i = 0; i < 7; i++) {
    const d = 날짜더하기(다음주월, i);
    if (새요일.indexOf(요일(d)) >= 0) 다음주등원.push(d);
  }
  const 줄 = (list) => `<div class="stack" style="gap:var(--sp-item)">${list}</div>`;

  const body = `${U.leafHd(ctx, `오늘 ${U.esc(TODAY.label)}에 바꾸면, 이번 주는 그대로 가고 ${날짜글(다음주월)}부터 새 요일이 적용됩니다`)}

<div class="g2 mt6">
  ${U.box(`<div class="t-sub">지금 요일</div>
    <div class="t-sec">매주 ${MY_REG.days.join('·')}</div>
    <div class="t-sub mt2">${U.esc(MY_REG.since)}부터 · 주 ${MY_REG.days.length}회 · 월 ${U.won(MY_REG.per)}</div>`)}
  ${U.box(`<div class="t-sub">바꾸려는 요일</div>
    <div class="t-sec pri">매주 ${새요일.join('·')}</div>
    <div class="t-sub mt2">주 ${새요일.length}회 그대로 · 월 ${U.won(PRICE.reg[새요일.length])} — 값은 달라지지 않아요</div>`)}
</div>

${U.sec('언제부터 바뀌나요', U.steps([
    [`신청 — ${날짜글('2026-08-24')}`, '오늘 눌렀습니다'],
    ['이번 주 — 기존 요일 그대로', `${MY_REG.days.join('·')} 유지`],
    [`${날짜글(다음주월)}부터 — 새 요일`, `${새요일.join('·')} 적용`],
  ], 1), { desc: '이미 자리를 잡아 둔 이번 주 등원은 건드리지 않습니다.' })}

${U.tabBox(
    [{ label: `이번 주 (${이번주남은.length}회 남음)`, pane: 'w1' }, { label: `다음 주 (${다음주등원.length}회)`, pane: 'w2' }],
    U.pane('w1', U.card('이번 주는 기존 요일 그대로예요', `
    ${줄(이번주남은.map((r) => U.box(`<div class="row-b wrap-row">
      <div><div class="t-card">${U.esc(r.d)}</div>
        <div class="t-sub mt1">${U.esc(r.dog)} · ${U.esc(CLS(r.cls).nm)} · ${U.esc(r.kind)} 예약</div></div>
      ${U.badge(`${디데이(r.d)} · 기존 요일`, 'b-line')}
    </div>`)).join(''))}
    <p class="hint">이번 주 남은 등원 ${이번주남은.length}회는 예정대로 진행됩니다. 그날만 쉬고 싶으시면 예약 취소를 쓰세요.</p>
    <div class="btns mt4">${U.btn('예약 취소하기', { href: 'MY0103', cls: 'btn-ghost', sm: true })}</div>`), true)
    + U.pane('w2', U.card(`${날짜글(다음주월)}부터 새 요일이 적용돼요`, `
    ${줄(다음주등원.map((d) => U.box(`<div class="row-b wrap-row">
      <div><div class="t-card">${U.esc(d)} (${요일(d)})</div>
        <div class="t-sub mt1">${U.esc(초코.nm)} · ${U.esc(CLS(초코.cls).nm)} · 정기 예약</div></div>
      ${U.badge('새 요일', 'b-acc')}
    </div>`)).join(''))}
    <p class="hint">금요일 자리는 신청과 동시에 풀립니다. 다시 금요일로 돌아오시려면 그때 자리가 남아 있어야 해요.</p>`))
    ,
    0,
  )}

${U.sec('변경 이력', U.table(
    ['날짜', '무엇을', { t: '적용 시작', cls: 'nowrap' }],
    [
      [{ t: U.esc(MY_REG.since), cls: 'nowrap' }, `정기 요일권 시작 — ${MY_REG.days.join('·')} (주 ${MY_REG.days.length}회)`, { t: U.esc(MY_REG.since), cls: 'nowrap' }],
      [{ t: '2026-08-24', cls: 'nowrap' }, `요일 변경 신청 — ${MY_REG.days.join('·')} → ${새요일.join('·')}`, { t: `${U.esc(다음주월)} <span class="t-sub">(다음 주)</span>`, cls: 'nowrap' }],
    ],
  ), { desc: '요일을 바꾼 기록은 여기에 쌓입니다.' })}

${U.banner('info', '📆', `<b>왜 바로 안 바뀌나요?</b>
  <div class="t-sub mt2">반은 아침마다 몸무게와 성향으로 짜 둡니다. 이번 주 자리는 이미 다른 아이들과 함께 잡혀 있어서,
  바꾼 요일은 다음 주 편성부터 반영합니다. 급하시면 낱개 예약으로 하루 더 오실 수 있어요.</div>`,
    { cls: 'mt8', right: U.btn('낱개 예약', { href: 'RE0301', cls: 'btn-ghost', sm: true }) })}

<div class="btns mt8">
  ${U.btn('정기 등원 관리로', { href: 'MY0301', cls: 'btn-ghost' })}
  ${U.btn('다음 청구일 보기', { href: 'MY0204', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0303 정기 등원 관리 > 일시정지 기간 설정
   ⚠ 「그동안 N회가 차감되지 않습니다」의 N 을 손으로 적지 않는다.
     쉬는 기간을 고르면 거르개가 «건너뛰는 등원일»을 세어 준다.
   ============================================================ */
P['MY0303'] = (ctx) => {
  const 시작 = 날짜더하기('2026-08-24', 7);        // 다음 등원 주의 첫 날 = 8/31 (월)
  const 후보 = [];
  for (let i = 0; i < 21; i++) {
    const d = 날짜더하기(시작, i);
    if (MY_REG.days.indexOf(요일(d)) < 0) continue;
    후보.push({ d, w: i < 7 ? 1 : (i < 14 ? 2 : 3) });
  }
  const 기간 = [1, 2, 3].map((n) => ({
    w: `w${n}`, 주: n, 끝: 날짜더하기(시작, n * 7 - 1),
    n: 후보.filter((x) => x.w <= n).length,
  }));
  const 기본 = 기간[기간.length - 1];
  const 청구멈춤 = MY_REG.next >= 시작 && MY_REG.next <= 기본.끝;

  const body = `${U.leafHd(ctx, '휴가·병원 입원처럼 한동안 쉬어야 할 때 기간을 걸어 둡니다')}

${U.card('언제부터 쉴까요', `
  <div class="f2">
    ${U.field('정지 시작일', U.input({ type: 'date', v: 시작, attr: ' data-start-sel' }),
    { hint: `다음 정기 등원일은 ${날짜글(시작)}입니다.` })}
    ${U.field('쉬는 기간', U.select(
      기간.map((g) => `${g.주}주 — ${날짜글(시작)} ~ ${날짜글(g.끝)}`),
      기간.length - 1,
      { vals: 기간.map((g) => g.w), attr: ' data-filter-sel="pause"' },
    ), { hint: '기간을 고르면 아래에서 건너뛰는 등원일을 다시 세어 드려요.' })}
  </div>
  <p class="hint"><b data-start-out>${시작}</b>부터 쉬는 것으로 잡았습니다. 다른 날부터 쉬시려면 시작일을 바꿔 주세요.</p>`)}

${U.card('그동안 건너뛰는 등원일', `
  <p class="t-sub mb4">그동안 <b class="pri" data-filter-cnt="pause">${기본.n}</b>회가 차감되지 않습니다 —
    매주 ${MY_REG.days.join('·')} 중 쉬는 기간에 든 날을 세었어요.</p>
  <div class="stack" data-filter-list="pause">
    ${후보.map((x) => `<div class="box row-b wrap-row" data-tag="${['w1', 'w2', 'w3'].slice(x.w - 1).join(' ')}">
      <div><div class="t-card">${U.esc(x.d)} (${요일(x.d)})</div>
        <div class="t-sub mt1">${U.esc(초코.nm)} · ${U.esc(CLS(초코.cls).nm)} · 정기 등원</div></div>
      ${U.badge(`${x.w}주차 · 쉬어요`, 'b-mut')}
    </div>`).join('')}
  </div>
  <div hidden data-empty-for="pause">${U.empty('⏸', '건너뛰는 날이 없어요', '쉬는 기간을 다시 골라 주세요.')}</div>`,
    { cls: 'mt6' })}

${U.card('쉬는 동안 어떻게 되나요', `
  ${U.kv([
    ['자동 청구', 청구멈춤 ? `<b>${U.esc(MY_REG.next)} 청구가 멈춥니다</b> — 정지한 날짜만큼 다음 청구액에서 빼 드려요` : '정지 기간의 청구가 멈춥니다'],
    ['정기 등원 예약', '정지 기간에는 자동으로 잡히지 않아요'],
    ['회차권', `쉬는 동안에도 낱개 예약은 회차권(${U.esc(초코.nm)} 잔여 ${MY_PASS.left}회)으로 하실 수 있어요`],
    ['요일 자리', `돌아오시는 ${날짜글(날짜더하기(기본.끝, 1))}에 ${MY_REG.days.join('·')} 자리를 그대로 비워 둡니다`],
  ])}
  ${U.banner('warn', '⏸', `<b>정지 중에는 정기 등원 예약이 잡히지 않아요.</b>
    <div class="t-sub mt2">중간에 하루만 오고 싶으시면 낱개 예약으로 오시면 됩니다. 그날은 회차권이 1회 차감돼요.</div>`,
    { cls: 'mt6', right: U.btn('낱개 예약', { href: 'RE0301', cls: 'btn-ghost', sm: true }) })}`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('일시정지 신청', { cls: 'btn-sub', id: 'pauseBtn', attr: ' data-notify="일시정지를 신청했어요 — 그 기간의 자동 청구가 멈춥니다" data-notify-once="신청했어요 ✓"' })}
  ${U.btn('정기 등원 관리로', { href: 'MY0301', cls: 'btn-ghost' })}
  ${U.btn('해지하고 싶어요', { href: 'MY0304', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0304 정기 등원 관리 > 해지 확인
   ⛔ 브라우저 confirm 대신 U.modal. 부모(MY0301)와 «같은 사실»을 적는다 —
     남은 정기 ${남은정기}회가 회차권으로 전환되어 잔여가 늘어난다.
   ============================================================ */
P['MY0304'] = (ctx) => {
  const 뒤잔여 = MY_PASS.left + 남은정기;
  const 다음주월 = 날짜더하기('2026-08-24', 7);
  const 이번주남은 = 예정.filter((r) => r.dog === 초코.nm && r.kind === '정기' && r.d.slice(0, 10) < 다음주월);
  const body = `${U.leafHd(ctx, '해지하면 다음 달부터 자동 청구가 멈추고, 고르신 요일 자리도 풀립니다')}

${U.banner('dan', '⚠️', `<b>해지는 되돌릴 수 없어요.</b>
  <div class="t-sub mt2">다시 정기 등원을 하시려면 그때 남아 있는 요일로 새로 신청해야 합니다.
  ${MY_REG.days.join('·')} 자리는 해지와 동시에 풀려 다른 아이가 채울 수 있어요.</div>`)}

${U.card('해지하면 이렇게 됩니다', `
  ${U.kv([
    ['자동 청구', `${U.esc(MY_REG.next)}부터 멈춥니다 (월 ${U.won(MY_REG.per)})`],
    ['이번 주 남은 등원', `${이번주남은.map((r) => r.d).join(', ')} — 예정대로 진행돼요`],
    ['이번 달 남은 정기 등원', `<b>${남은정기}회</b> (${예정.filter((r) => r.dog === 초코.nm && r.kind === '정기').map((r) => r.d.slice(5, 10)).join(' · ')}) → 낱개 회차권으로 전환`],
    [`${U.esc(초코.nm)}의 회차권 잔여`, `${MY_PASS.left}회 → <b class="pri">${뒤잔여}회</b>`],
    ['요일 자리', `${MY_REG.days.join('·')} — 바로 풀립니다`],
  ])}
  ${U.banner('info', '🎟', `<b>전환된 회차권은 ${U.esc(MY_PASS.until)}까지 쓰실 수 있어요.</b>
    <div class="t-sub mt2">${U.esc(초코.nm)}가 지금 쓰고 있는 ${MY_PASS.n}회권과 같은 만료일로 붙습니다.
    남은 날수는 ${MY_PASS.leftDays}일이에요.</div>`, { cls: 'mt6' })}`, { cls: 'mt6' })}

${U.card('해지 대신 이런 길도 있어요', `
  <div class="g2">
    ${U.box(`<div class="t-card">한동안만 쉬기</div>
      <p class="t-sub mt2">일시정지를 걸면 그 기간의 자동 청구가 멈추고, 요일 자리는 그대로 비워 둡니다.</p>
      <div class="btns mt4">${U.btn('일시정지 설정', { href: 'MY0303', cls: 'btn-sub', sm: true })}</div>`)}
    ${U.box(`<div class="t-card">요일만 바꾸기</div>
      <p class="t-sub mt2">오는 요일이 안 맞는 것뿐이라면 요일만 바꿔도 됩니다. 다음 주부터 적용돼요.</p>
      <div class="btns mt4">${U.btn('요일 변경 보기', { href: 'MY0302', cls: 'btn-ghost', sm: true })}</div>`)}
  </div>`, { cls: 'mt6' })}

${U.card('최종 확인', `
  <div class="stack">
    ${U.check(`남은 정기 ${남은정기}회가 회차권으로 전환되고, 잔여가 ${뒤잔여}회가 되는 것을 확인했습니다`, { attr: ' data-unlock="quitBtn"' })}
  </div>
  <div class="btns mt6">
    ${U.btn('정기 등원 해지', { cls: 'btn-dan', id: 'quitBtn', off: true, attr: ' data-modal="mQuit"' })}
    ${U.btn('그냥 두기', { href: 'MY0301', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt6' })}`;

  const after = U.modal('mQuit', '정말 해지하시겠어요?', `
  <p><b>매주 ${MY_REG.days.join('·')} 등원이 다음 주부터 멈춥니다.</b></p>
  <ul class="stack mt4">
    <li class="row"><span class="ok">✓</span><span>남은 정기권 ${남은정기}회는 낱개 회차권으로 전환됩니다 (잔여 ${MY_PASS.left} → ${뒤잔여}회)</span></li>
    <li class="row"><span class="ok">✓</span><span>이번 주 남은 등원은 예정대로 진행됩니다</span></li>
    <li class="row"><span class="dan">·</span><span>고르신 요일의 자리는 바로 풀려 다른 아이가 채울 수 있어요</span></li>
    <li class="row"><span class="dan">·</span><span>되돌릴 수 없습니다 — 다시 하시려면 새로 신청해야 해요</span></li>
  </ul>`,
  `${U.btn('돌아가기', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${U.btn('해지하기', { cls: 'btn-dan', attr: ` data-notify="정기 등원을 해지했어요 — 남은 ${남은정기}회를 회차권으로 바꿔 드렸습니다" data-dismiss` })}`);

  return { body, o: { after } };
};

/* ---------- 알림장함에 쓰는 한 달치 목록 ----------
   ⚠ 거르개는 data-tag 한 칸만 본다. noteCard()/noteNone() 이 「이름 2026-08」을
     한 칸에 함께 적어 두므로, 반려견 칩과 달 고르개가 «같은 목록»을 함께 거른다. */
const 알림장목록 = [
  ...NOTES.map((n) => ({ d: n.date, html: U.noteCard(n, { href: 'MY0501' }) })),
  ...NO_SHOW_DAYS.map((n) => ({ d: n.date, html: U.noteNone(n) })),
].sort((a, b) => (a.d < b.d ? 1 : -1));
const 안읽음 = NOTES.filter((n) => !n.read);
const 읽음 = NOTES.filter((n) => n.read);

/* ============================================================
   MY0402 알림장함 > 월별 보기 전환
   ============================================================ */
P['MY0402'] = (ctx) => {
  const body = `${U.leafHd(ctx, '달을 고르면 그달 알림장만 다시 불러옵니다')}

<div class="filters">
  ${U.select(['2026년 8월', '2026년 7월', '2026년 6월'], 0, {
    vals: ['2026-08', '2026-07', '2026-06'], attr: ' data-filter-sel="note2"',
  })}
  ${U.chips(['전체', ...MINE.map((d) => d.nm)], 0, { boxAttr: ' data-filter-for="note2"' })}
</div>

<div class="g4 mb6">
  ${U.stat('고른 달', `<span data-filter-cnt="note2">${알림장목록.length}</span>`, { u: '건', ico: '📓' })}
  ${U.stat('알림장', NOTES.length, { u: '건', ico: '📷' })}
  ${U.stat('등원하지 않은 날', NO_SHOW_DAYS.length, { u: '일', ico: '🏠' })}
  ${U.stat('안 읽음', 안읽음.length, { u: '건', ico: '🔵' })}
</div>

<div class="list1" data-filter-list="note2">
  ${알림장목록.map((x) => x.html).join('')}
</div>
<div hidden data-empty-for="note2">${U.empty('📓', '이 달에는 보여 드릴 알림장이 없어요',
    '목록에는 최근 한 달치가 보입니다. 그 전 알림장은 원에 말씀해 주시면 다시 보내드려요.',
    U.btn('1:1 문의하기', { href: 'CS0201', cls: 'btn-sub' }))}</div>

${U.banner('info', '📆', `<b>등원하지 않은 날도 회색으로 함께 보여 드려요.</b>
  <div class="t-sub mt2">${NO_SHOW_DAYS.map((n) => `${날짜글(n.date)} — ${U.esc(n.why)}`).join(' · ')}.
  알림장이 빠진 것인지, 원래 안 온 날인지 헷갈리지 않게 하려는 자리입니다.</div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('알림장함으로', { href: 'MY0401', cls: 'btn-ghost' })}
  ${U.btn('반려견 필터', { href: 'MY0404', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0403 알림장함 > 안 읽음 배지
   ⚠ 안 읽은 수 · 읽은 수 · 전체 수가 서로 어긋나지 않게 모두 NOTES 에서 센다.
   ============================================================ */
P['MY0403'] = (ctx) => {
  const body = `${U.leafHd(ctx,
    `아직 안 읽은 알림장이 ${안읽음.length}건 있어요 — 목록에서는 요약 옆에 파란 점으로 표시됩니다`,
    U.badge(`안 읽음 ${안읽음.length}`, 'b-solid'))}

${U.sec(`안 읽은 알림장 ${안읽음.length}건`, `<div class="list1">
  ${안읽음.map((n) => U.noteCard(n, { href: 'MY0501' })).join('') || '<p class="t-sub">모두 읽으셨어요.</p>'}
</div>`, { desc: '요약 문장 끝의 파란 점이 「아직 안 읽었어요」라는 뜻입니다. 열어 보면 사라져요.' })}

<div class="btns mt6">
  ${U.btn('모두 읽음으로 표시', { cls: 'btn-sub', attr: ' data-notify="알림장 ' + 안읽음.length + '건을 모두 읽음으로 표시했어요" data-notify-once="모두 읽음 ✓"' })}
  <button class="btn btn-ghost" type="button" data-more-toggle="read" data-more-label="이미 읽은 알림장 ${읽음.length}건 보기 ▾">이미 읽은 알림장 ${읽음.length}건 보기 ▾</button>
</div>

<div class="mt6" hidden data-more-body="read">
  ${U.sec(`이미 읽은 알림장 ${읽음.length}건`, `<div class="list1">${읽음.map((n) => U.noteCard(n, { href: 'MY0501' })).join('')}</div>`,
    { desc: '읽은 알림장에는 파란 점이 없습니다. 언제든 다시 열어 볼 수 있어요.' })}
</div>

${U.card('배지가 붙는 규칙', `
  ${U.kv([
    ['전체 알림장', `${NOTES.length}건`],
    ['안 읽음', `<b class="pri">${안읽음.length}건</b> — 사이드바 「마이페이지」 옆과 이 화면 머리에 같은 숫자가 붙습니다`],
    ['읽음', `${읽음.length}건`],
    ['언제 사라지나', '알림장 상세를 한 번 열면 그 자리에서 사라져요'],
  ])}
  <p class="hint">카카오톡으로 먼저 보신 알림장도 여기서 한 번 열어 주셔야 안 읽음 표시가 사라집니다.</p>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('알림장함으로', { href: 'MY0401', cls: 'btn-ghost' })}
  ${U.btn('안 읽은 알림장 열기', { href: 'MY0501', cls: 'btn-pri' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0404 알림장함 > 반려견 필터
   ============================================================ */
P['MY0404'] = (ctx) => {
  /* 등원하지 않은 날은 두 아이 모두에게 남는다 — noteNone() 의 data-tag 가 두 이름을 함께 적기 때문이다 */
  const 수 = (nm) => NOTES.filter((n) => n.dog === nm).length + NO_SHOW_DAYS.length;
  const body = `${U.leafHd(ctx, `${MINE.map((d) => d.nm).join(' · ')}의 알림장이 한 곳에 쌓입니다. 아이를 고르면 그 아이 것만 남아요`)}

<div class="filters">
  ${U.chips(['전체', ...MINE.map((d) => d.nm)], 0, { boxAttr: ' data-filter-for="note4"' })}
</div>

<p class="t-sub mb4">지금 <b data-filter-cnt="note4">${알림장목록.length}</b>건이 보입니다
  ${MINE.map((d) => `· ${U.esc(d.nm)} ${수(d.nm)}건`).join(' ')}</p>

<div class="list1" data-filter-list="note4">
  ${알림장목록.map((x) => x.html).join('')}
</div>
<div hidden data-empty-for="note4">${U.empty('📓', '결과가 없습니다',
    '고르신 아이의 알림장이 이 달에는 없어요. 「전체」를 누르면 다시 모두 보입니다.',
    U.btn('월별 보기로', { href: 'MY0402', cls: 'btn-sub' }))}</div>

${U.banner('info', '🐶', `<b>등원하지 않은 날은 두 아이 모두에게 보입니다.</b>
  <div class="t-sub mt2">${NO_SHOW_DAYS.map((n) => 날짜글(n.date)).join(' · ')}처럼 원이 쉬거나 아무도 오지 않은 날이라,
  아이를 골라도 회색 줄은 그대로 남아요.</div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('알림장함으로', { href: 'MY0401', cls: 'btn-ghost' })}
  ${U.btn('월별 보기 전환', { href: 'MY0402', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ---------- 알림장 상세가 쓰는 한 장 ---------- */
const 오늘알림장 = NOTES[0];                       // 가장 최근 = 8/21 (금) 초코
const 앞알림장 = NOTES.find((n) => n.dog === 오늘알림장.dog && n.date < 오늘알림장.date);
const 담당 = STAFF.find((s) => s.nm === 오늘알림장.teacher);

/* ============================================================
   MY0502 알림장 상세 > 사진 확대
   ⚠ 사진은 손님이 직접 올릴 자리다. 가짜 사진 주소를 지어 넣지 않는다.
     씨앗은 gal() 이 쓰는 것과 같게 두어 목록·상세·확대에서 같은 톤이 나오게 한다.
   ============================================================ */
P['MY0502'] = (ctx) => {
  const n = 오늘알림장;
  const 장 = Array.from({ length: n.pics });

  const body = `${U.leafHd(ctx,
    `${U.esc(n.dog)}의 ${날짜글(n.date)} 알림장 — 사진 ${n.pics}장을 한 장씩 크게 봅니다`)}

${U.tabBox(
    장.map((_, i) => ({ label: `${i + 1} / ${n.pics}`, pane: `pic${i}` })),
    장.map((_, i) => U.pane(`pic${i}`, `
    ${U.ph(['알림장 사진', 1200, 900], { seed: `${n.id}-${i}`, cls: 'ph-card' })}
    <div class="row-b wrap-row mt4">
      <div><div class="t-card">${i + 1}번째 사진</div>
        <div class="t-sub mt1">${U.esc(n.date)} (${U.esc(n.dow)}) · 담당 ${U.esc(n.teacher)} 선생님 · ${U.esc(n.dog)}</div></div>
      <div class="btns">
        ${U.btn('원본 내려받기', { cls: 'btn-ghost', sm: true, attr: ` data-toast="${i + 1}번째 사진을 원본 크기로 저장했어요"` })}
        ${U.btn('사진 전체 저장', { cls: 'btn-ghost', sm: true, attr: ` data-toast="사진 ${n.pics}장을 한꺼번에 저장했어요"` })}
      </div>
    </div>`, i === 0)).join(''),
    0,
    { pill: true },
  )}

<div class="btns mt6">
  <button class="btn btn-sub" type="button" data-more-toggle="zoom" data-more-label="200%로 크게 보기 ▾">200%로 크게 보기 ▾</button>
</div>
<div class="mt4" hidden data-more-body="zoom">
  ${U.box(`<p class="t-sub mb4">200%로 늘렸습니다. 좌우로 밀어서 구석까지 보실 수 있어요.</p>
    <div style="overflow-x:auto">
      <div style="width:200%">${U.ph(['알림장 사진', 1200, 900], { seed: `${n.id}-0`, cls: 'ph-card' })}</div>
    </div>`)}
</div>

${U.sec('그날 사진 모두', U.gal(n.pics, n.id), { desc: '위 번호를 눌러 한 장씩 크게 보거나, 여기서 원하는 장면을 고르세요.' })}

${U.banner('info', '📷', `<b>이 자리에는 원에서 그날 찍은 사진이 그대로 들어갑니다.</b>
  <div class="t-sub mt2">보기 화면이라 지금은 비어 있는 자리로 두었어요. 권장 크기는 1200×900이고, 하루 4~6장을 올립니다.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('알림장 상세로', { href: 'MY0501', cls: 'btn-ghost' })}
  ${U.btn('알림장함', { href: 'MY0401', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0503 알림장 상세 > 보호자 답장
   ============================================================ */
P['MY0503'] = (ctx) => {
  const n = 오늘알림장;
  const body = `${U.leafHd(ctx, `${U.esc(n.teacher)} 선생님께 짧게 남기면, 다음 날 아침에 확인합니다`)}

${U.card('', `
  <div class="row wrap-row">
    ${U.dogPh(n.dog, 56)}
    <div class="grow">
      <div class="t-card">${U.esc(n.dog)} · ${날짜글(n.date)} 알림장</div>
      <p class="t-sub mt1">${U.esc(n.sum)}</p>
    </div>
    ${U.btn('알림장 다시 보기', { href: 'MY0501', cls: 'btn-ghost', sm: true })}
  </div>
  ${n.note ? U.banner('warn', '🔎', `<b>확인해 주세요</b><div class="mt2">${U.esc(n.note)}</div>`, { cls: 'mt4' }) : ''}`)}

${U.card('선생님께 한마디', `
  ${U.textarea({ ph: '고맙습니다! 발톱은 오늘 저녁에 깎을게요.', attr: ' data-note-text' })}
  <p class="hint"><b data-note-len>0</b>자 적었습니다 · 200자 안으로 짧게 남겨 주세요</p>
  <p class="t-sub mt4">자주 쓰는 말 — 누르면 위 칸에 그대로 들어갑니다</p>
  <div class="btns mt2">
    ${['고맙습니다!', '오늘도 잘 부탁드려요.', '집에서도 살펴볼게요.', '내일은 조금 늦게 갈 것 같아요.']
      .map((t) => U.btn(U.esc(t), { cls: 'btn-ghost', sm: true, attr: ` data-phrase="${U.esc(t)}"` })).join('')}
  </div>
  <div class="btns mt6">
    ${U.btn('답장 보내기', { cls: 'btn-pri', id: 'replyBtn', attr: ' data-notify="답장을 보냈어요 — 내일 아침에 담당 선생님이 확인합니다" data-notify-once="보냈어요 ✓"' })}
    ${U.btn('지우기', { cls: 'btn-ghost', attr: ' data-toast="적던 글을 지웠어요"' })}
  </div>
  <p class="hint">보내면 담당 ${U.esc(n.teacher)} 선생님(${U.esc(담당 ? 담당.cls.join('·') : CLS(초코.cls).nm)})에게 알림이 갑니다.
  급한 일은 카카오톡 ${U.esc(SITE.kakao)}로 남겨 주세요 — 원 전화는 ${U.esc(SITE.tel)}입니다.</p>`, { cls: 'mt6' })}

${U.sec('주고받은 이야기', U.timeline([
    { hh: 오늘알림장.date.slice(5), t: `${U.esc(오늘알림장.teacher)} 선생님`, d: U.esc(오늘알림장.sum), k: 'done' },
    { hh: NOTES[1].date.slice(5), t: '보호자 (나)', d: '사료를 조금 줄여 주세요. 요즘 살이 붙는 것 같아요.', k: 'done' },
    { hh: NOTES[1].date.slice(5), t: `${U.esc(NOTES[1].teacher)} 선생님`, d: '네, 점심 양을 조금 줄여서 드릴게요. 간식도 하나만 주겠습니다.', k: 'done' },
    { hh: NOTES[2].date.slice(5), t: '보호자 (나)', d: '비 오는 날은 마당에 안 나가도 괜찮아요. 감사합니다.', k: 'done' },
  ]), { desc: '답장은 그날 알림장에 붙어 남습니다. 지난 이야기도 여기서 다시 볼 수 있어요.' })}

${U.banner('info', '💬', `<b>답장은 다음 날 아침 등원 인사 때 확인합니다.</b>
  <div class="t-sub mt2">밤에 남기셔도 괜찮아요. 아이 컨디션처럼 그날 바로 알아야 하는 일은 카카오톡이 빠릅니다.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('알림장 상세로', { href: 'MY0501', cls: 'btn-ghost' })}
  ${U.btn('1:1 문의', { href: 'CS0201', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0504 알림장 상세 > 이전·다음 날 이동
   ⚠ 날짜와 요일을 달력으로 다시 센다. 등원하지 않은 날은 건너뛴다.
   ============================================================ */
P['MY0504'] = (ctx) => {
  const 없는날 = Object.fromEntries(NO_SHOW_DAYS.map((n) => [n.date, n.why]));
  /** 한 아이의 «알림장 차례» — 가장 최근 알림장부터 가장 오래된 알림장까지 하루도 빠짐없이 세운다 */
  const 차례 = (dogNm) => {
    const 것들 = NOTES.filter((n) => n.dog === dogNm);
    const 처음 = 것들[것들.length - 1].date;
    const 끝 = 것들[0].date;
    const 줄 = [];
    for (let d = 끝; d >= 처음; d = 날짜더하기(d, -1)) {
      const n = 것들.find((x) => x.date === d);
      const w = 요일(d);
      줄.push({
        d, w, n,
        why: n ? '' : (없는날[d] || (w === '일' ? '일요일은 원이 쉬어요' : '이 날은 등원하지 않았어요')),
      });
    }
    return 줄;
  };

  const 표 = (dogNm, 지금) => {
    const 줄 = 차례(dogNm);
    const 있는날 = 줄.filter((x) => x.n).length;
    return `<p class="t-sub mb4">알림장이 있는 날 <b>${있는날}일</b> · 건너뛰는 날 <b>${줄.length - 있는날}일</b>
      — 화살표를 누르면 회색 줄은 지나치고 다음 알림장으로 바로 갑니다.</p>
    ${U.table([{ t: '날짜', w: '160px' }, '상태', '요약', { t: '', w: '120px' }], 줄.map((x) => ({
      cells: [
        { t: `${U.esc(x.d)} <span class="t-sub">(${x.w})</span>`, cls: 'nowrap' },
        x.n ? U.badge('알림장 있음', 'b-ok') : U.badge('건너뜀', 'b-mut'),
        x.n ? `${U.esc(x.n.sum.slice(0, 28))}… <span class="t-sub">사진 ${x.n.pics}장</span>` : `<span class="muted">${U.esc(x.why)}</span>`,
        {
          t: x.n
            ? (x.d === 지금 ? U.badge('지금 보는 날', 'b-solid') : U.btn('열기', { href: 'MY0501', cls: 'btn-ghost', sm: true }))
            : '',
          cls: 'r',
        },
      ],
    })))}`;
  };

  const n = 오늘알림장;
  const body = `${U.leafHd(ctx, `지금 보고 있는 알림장은 ${U.esc(n.dog)}의 ${날짜글(n.date)}입니다`)}

${U.card('', `
  <div class="row-b wrap-row">
    ${U.btn(`‹ 이전 알림장 · ${날짜글(앞알림장.date)}`, { href: 'MY0501', cls: 'btn-ghost' })}
    <div class="center">
      <div class="t-sub">지금 보는 날</div>
      <div class="t-sec">${날짜글(n.date)}</div>
      <div class="t-sub">등원 ${n.inAt} → 하원 ${n.outAt} · 재원 ${걸린(n.inAt, n.outAt)}</div>
    </div>
    ${U.btn('다음 알림장 ›', { cls: 'btn-ghost', id: 'nextNote', off: true })}
  </div>
  <p class="hint">${날짜글(n.date)}이 가장 최근 알림장이라 「다음」은 잠겨 있어요.
  오늘 ${U.esc(TODAY.short)}은 ${U.esc(초코.nm)}가 아직 등원 체크 전이라, 오늘 알림장은 하원 뒤 저녁에 올라옵니다.</p>`)}

${U.tabBox(
    MINE.map((d, i) => ({ label: `${d.nm}의 알림장 차례`, pane: `dog${i}` })),
    MINE.map((d, i) => U.pane(`dog${i}`, 표(d.nm, i === 0 ? n.date : ''), i === 0)).join(''),
    0,
    { pill: true, cls: 'mt8' },   /* 위 카드와 0px 로 붙어 한 묶음처럼 읽혔다 */
  )}

${U.banner('info', '↔️', `<b>등원하지 않은 날은 건너뜁니다.</b>
  <div class="t-sub mt2">${NO_SHOW_DAYS.map((x) => `${날짜글(x.date)} ${U.esc(x.why)}`).join(' · ')}.
  달력을 하루씩 넘기면 빈 날에서 멈춰 답답하니, 화살표는 «알림장이 있는 날»끼리만 이어 줍니다.</div>`,
    { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('알림장 상세로', { href: 'MY0501', cls: 'btn-ghost' })}
  ${U.btn('알림장함에서 고르기', { href: 'MY0401', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   MY0505 알림장 상세 > 특이사항 강조
   ⚠ 「확인해 주세요」가 붙은 알림장이 목록에서도 상세에서도 어떻게 다르게 보이는지.
   ============================================================ */
P['MY0505'] = (ctx) => {
  const n = 오늘알림장;
  const 맑은날 = NOTES.find((x) => !x.note);
  const 그날기록 = HEALTH_LOG.filter((h) => h.date === n.date);

  const body = `${U.leafHd(ctx, `${날짜글(n.date)} 알림장에 담당 선생님이 남긴 특이사항이 있어요`)}

${U.banner('dan', '🔎', `<b>확인해 주세요 — ${U.esc(n.note)}</b>
  <div class="t-sub mt2">특이사항이 있는 날은 알림장을 열자마자 이 붉은 상자가 맨 위에 나옵니다.
  사진과 하루 요약보다 먼저 보이게 두었어요.</div>`,
    { right: U.btn('건강기록 보기', { href: 'HL0201', cls: 'btn-dan', sm: true }) })}

${U.card('그날 원에서 남긴 기록', `
  ${그날기록.length ? U.timeline(그날기록.map((h) => ({
    hh: h.date.slice(5), t: `${U.esc(h.t)} — ${U.esc(h.by)} 선생님`, d: U.esc(h.d), k: 'done',
  }))) : '<p class="t-sub">이 날 따로 남긴 관찰 기록은 없어요.</p>'}
  <p class="hint">알림장의 특이사항과 원 안의 관찰 기록은 같은 날짜로 묶여 있습니다.
  아이 몸에 관한 것은 알림장에 적더라도 건강기록에 한 번 더 남깁니다.</p>
  <div class="btns mt4">
    ${U.btn('건강기록 자세히 보기', { href: 'HL0201', cls: 'btn-sub', sm: true })}
    ${U.btn('반려견 프로필', { href: 'PL0401', cls: 'btn-ghost', sm: true })}
  </div>`, { cls: 'mt6' })}

${U.sec('목록에서는 이렇게 다릅니다', `<div class="list1">
  ${U.noteCard(n, { href: 'MY0501' })}
  ${U.noteCard(맑은날, { href: 'MY0501' })}
</div>`, { desc: `특이사항이 있는 ${날짜글(n.date)} 알림장에는 「확인해 주세요」 딱지가 붙고, ${날짜글(맑은날.date)}처럼 별일 없던 날에는 붙지 않습니다.` })}

${U.card('무엇을 하면 되나요', `
  <div class="stack">
    ${U.check('집에서 발톱 상태를 살펴봤어요', {})}
    ${U.check('필요하면 병원에 데려가겠습니다', {})}
    ${U.check('다음 등원 때 선생님께 말씀드릴게요', {})}
  </div>
  <div class="btns mt6">
    ${U.btn('확인했다고 알리기', { cls: 'btn-pri', attr: ' data-notify="확인하셨다고 담당 선생님께 전했어요" data-notify-once="전했어요 ✓"' })}
    ${U.btn('선생님께 답장', { href: 'MY0503', cls: 'btn-ghost' })}
  </div>
  <p class="hint">아이 몸에 관한 특이사항은 답장을 남겨 주시면 다음 날 등원 인사 때 함께 살핍니다.
  급하면 협력 병원 ${U.esc(SITE.vet.nm)} — ${U.esc(SITE.vet.dist)} — 으로 바로 이송합니다.</p>`, { cls: 'mt6' })}

${U.banner('info', '🩺', `<b>다치거나 아픈 일은 알림장을 기다리지 않고 그때 바로 알려드려요.</b>
  <div class="t-sub mt2">알림장의 「확인해 주세요」는 «집에서 한 번 봐 주시면 좋을 일»입니다.
  급한 일은 그 자리에서 카카오톡·전화로 먼저 연락드립니다.</div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('알림장 상세로', { href: 'MY0501', cls: 'btn-ghost' })}
  ${U.btn('알림장함', { href: 'MY0401', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};
