/* MG 원 관리자 — 잎사귀 15장.
   부모(MG0101·MG0201·MG0301·MG0401·MG0501)의 뼈대·색·톤은 U.shell() 이 그대로 유지해 준다.
   여기서는 그 화면의 «상태·갈래» 하나만 또렷이 보여 준다.

   ⛔ 이 파일이 지키는 세 가지
     ① 돈이 걸린 숫자는 손으로 두 번 적지 않는다 — 「합계」는 언제나 reduce 로 «세어» 만든다.
        요금은 data.mjs 의 PRICE, 매출은 SALES_PACK·SALES_REG·REFUNDS 에서만 읽는다.
     ② MG05xx(로그인 갈래 넷)는 «아직 아무도 아닌» 화면이다 — o.solo 로 사이드바도 계정 줄도 뗀다.
        비로그인 화면에 「김보육 선생님」이 적혀 있으면 손님이 먼저 알아챈다.
     ③ 브라우저 기본 확인창을 쓰지 않는다. 물어볼 것은 U.modal() + data-modal 로 묻는다. */
import {
  esc, won, num, man, btn, chip, chips, tabs, pane, tabBox,
  sec, card, box, banner, empty, table, kv, sumRows, steps, timeline, accordion,
  pageHd, leafHd, modal, stat, field, input, select, textarea, check, toggle, radioRow,
  link, solo, dogPh, badge, stBadge, progress, 조사,
} from './ui.mjs';
import {
  SITE, TODAY, DOGS, CLASSES, clsNow, inClass, PRICE, unit, STAFF, ROSTER_TOTAL,
  SALES, SALES_PACK, SALES_REG, REFUNDS, TODAY_STAT, NOTES, HEALTH_LOG, MY_REG,
} from './data.mjs';

const P = {};
export const PAGES = P;

/* ---------- 이 파일 안에서만 쓰는 셈 도구 ---------- */
/** 할증을 붙인 값 — 지어내지 않고 PRICE 의 퍼센트로 «계산»한다 */
const 할증 = (원값, pct) => Math.round(원값 * (100 + pct) / 100);
/** 2026-09-01 → 9월 1일 */
const 날짜말 = (ymd) => { const [, m, d] = ymd.split('-').map(Number); return `${m}월 ${d}일`; };
const 하루 = 86400000;
const 날 = (ymd) => { const [y, m, d] = ymd.split('-').map(Number); return Date.UTC(y, m - 1, d); };
/** 두 기간이 겹치는 날수 — 손으로 세지 않는다 */
const 겹친날 = (a, b) => Math.max(0, Math.round((Math.min(날(a[1]), 날(b[1])) - Math.max(날(a[0]), 날(b[0]))) / 하루) + 1);
/** 몸무게 → 반 (경계값 두 개로 정해진다). MG0201 의 규칙과 같은 셈이다 */
const 반기준 = (kg, 소, 대) => (kg < 소 ? 'sm' : (kg < 대 ? 'md' : 'lg'));
const 반이름 = (id) => (CLASSES.find((c) => c.id === id) || {}).nm || '-';
/** DOGS 의 st → 배지에 쓰는 상태 이름 (ST_CLS 가 아는 말로 옮긴다) */
const 오늘상태 = (st) => ({ 재원: '등원중', 하원: '하원', 대기: '예약', 잠김: '예약', 미등원: '미등원', 지각: '지각', 결석: '결석' }[st] || '예약');

/* 역할이 볼 수 있는 화면 — MG0401 의 표와 «같은 사실»이다.
   여기서 「새로 열리는 화면 몇 개」를 세어 쓴다. 손으로 3 이라 적지 않는다. */
const 권한표 = [
  ['등하원 체크 · 반 편성 보드', true, true],
  ['알림장 작성 · 발송', true, true],
  ['건강기록 · 사고 기록', true, true],
  ['백신 만료 대시보드', true, true],
  ['정원·요금 설정', true, false],
  ['정산·매출', true, false],
  ['직원·계정 관리', true, false],
];

/* 사교성 평가 문항 — MG0201 에 있는 다섯 문항 그대로다. 새 문항을 지어내지 않는다. */
const 문항 = [
  { q: '다른 아이에게 먼저 다가가나', d: '적극성 · 소그룹 배정 판단', on: true },
  { q: '낯선 소리에 짖나', d: '짖음 정도 · 소그룹 전환 판단', on: true },
  { q: '장난감을 두고 다투나', d: '공격성 · 개별 관리 판단', on: true },
  { q: '사람이 다가가면 어떤가', d: '사람 반응 · 보육교사 배치 판단', on: true },
  { q: '보호자와 떨어질 때 어떤가', d: '분리 불안 · 첫 주 관찰 강도', on: false },
];

/* 정산 기간 — 부모(MG0301)와 같은 배수를 쓴다. 배수가 갈라지면 두 화면이 다른 말을 한다.
   ⚠ 「직접 지정」은 8/1~8/15 로, 이번 달(8/1~8/24) 24일 가운데 15일이다 — 일수 비례로 좁힌다. */
const 기간들 = [
  { t: '이번 달 (8월)', lb: SALES.period, m: 1 },
  { t: '지난 달 (7월)', lb: '2026년 7월 1일 ~ 7월 31일', m: 1.24 },
  { t: '올해 전체', lb: '2026년 1월 1일 ~ 8월 24일', m: 7.6 },
  { t: '직접 지정 (8월 1일 ~ 8월 15일)', lb: '2026년 8월 1일 ~ 8월 15일', m: 15 / 24 },
];
const 기간값 = (p) => ({
  total: Math.round(SALES.total * p.m), pack: Math.round(SALES.pack * p.m),
  reg: Math.round(SALES.reg * p.m), refund: Math.round(SALES.refund * p.m),
});
/** 기간 고르개 — 고르면 [data-sales] 넷과 [data-period-label] 이 «실제로» 다시 계산된다 */
const 기간고르개 = () => `<select class="sel" data-period aria-label="기간">
  ${기간들.map((p, i) => { const v = 기간값(p); return `<option${i === 0 ? ' selected' : ''} data-label="${esc(p.lb)}"
    data-total="${v.total}" data-pack="${v.pack}" data-reg="${v.reg}" data-refund="${v.refund}">${esc(p.t)}</option>`; }).join('')}
</select>`;

/* ============================================================
   MG0102 정원·요금 설정 > 정원 축소 경고
   ⛔ 「몇 마리가 넘치나」를 글로 적지 않는다 — clsNow() 에서 읽어 «센다».
      그리고 넘치는 동안에는 저장이 «실제로» 잠긴다(체크해야 열린다).
   ============================================================ */
P['MG0102'] = (ctx) => {
  const 줄이려는 = { sm: 3, md: 4, lg: 6 };          // 원장이 지금 고쳐 넣은 값
  const 표 = CLASSES.map((c) => {
    const 지금 = clsNow(c.id);
    const 새것 = 줄이려는[c.id];
    return { c, 지금, 새것, 넘침: Math.max(0, 지금 - 새것) };
  });
  const 총넘침 = 표.reduce((s, r) => s + r.넘침, 0);
  const 넘친반 = 표.filter((r) => r.넘침 > 0);

  /* app.js 의 [data-cap-in] 손잡이가 숫자를 고칠 때마다 이 자리를 다시 쓴다.
     화면을 열자마자도 «같은 글»이 적혀 있어야 하므로 여기서 미리 같은 모양으로 그려 둔다. */
  const 여유글 = (r) => (r.넘침 > 0
    ? `<span class="dan strong">지금 ${r.지금}마리가 다니고 있어요 — ${r.넘침}마리의 예약을 옮겨야 합니다</span>`
    : `<span class="t-sub">지금 ${r.지금}마리 · 여유 ${r.새것 - r.지금}자리</span>`);

  const body = `${leafHd(ctx, `정원을 지금 다니는 아이보다 적게 줄였습니다 — 저장을 막아 두었어요`)}

${banner('dan', '⛔', `<b>이미 등원 중인 ${총넘침}마리가 새 정원을 넘칩니다. 이대로는 저장할 수 없어요.</b>
  <div class="t-sub mt2">${넘친반.map((r) => `${esc(r.c.nm)} ${r.지금}마리 → 정원 ${r.새것}마리 (${r.넘침}마리 넘침)`).join(' · ')}</div>`)}

${card('반별 정원', `
  <div class="g3">
    ${표.map((r) => `<div class="box${r.넘침 > 0 ? ' dan' : ''}">
      <div class="t-card">${r.c.ico} ${esc(r.c.nm)}</div>
      <div class="t-sub mt1">${esc(r.c.kg)}</div>
      <div class="row mt4">
        <div style="width:120px">${input({ type: 'number', v: String(r.새것), attr: ` data-cap-in="${r.c.id}" data-cap-now="${r.지금}" min="0"` })}</div>
        <span class="t-sub">마리</span>
      </div>
      <div class="mt3" data-cap-out="${r.c.id}">${여유글(r)}</div>
    </div>`).join('')}
  </div>
  <p class="hint">숫자를 다시 고치면 이 자리의 글도 함께 바뀝니다. 넘치는 반이 하나도 없으면 아래 확인 없이도 저장할 수 있어요.</p>`)}

${card(`옮겨야 하는 ${총넘침}마리`, `
  ${넘친반.map((r) => `<div class="box mt3">
    <div class="row-b wrap-row">
      <div><b>${r.c.ico} ${esc(r.c.nm)}</b> <span class="t-sub">지금 ${r.지금}마리 · 새 정원 ${r.새것}마리</span></div>
      ${badge(`${r.넘침}마리 넘침`, 'b-dan')}
    </div>
    <div class="row wrap-row mt3" style="gap:var(--sp-btn)">
      ${inClass(r.c.id).map((d) => `<span class="row" style="gap:var(--sp-half)">${dogPh(d.nm, 32)}<b>${esc(d.nm)}</b><span class="t-sub">${d.kg}kg</span></span>`).join('')}
    </div>
    <p class="hint">이 중 ${r.넘침}마리를 다른 반으로 옮기거나, 등원 요일을 나눠 받아야 합니다.</p>
  </div>`).join('')}`, { cls: 'mt6' })}

${banner('info', '🔗', `<b>정원을 줄여도 이미 잡힌 예약이 저절로 취소되지는 않습니다.</b>
  <div class="t-sub mt2">반 편성 보드에서 직접 옮겨 주셔야 하고, 옮긴 뒤에 이 화면으로 돌아와 저장하시면 됩니다.</div>`, { cls: 'mt6' })}

${card('저장하기 전에', `
  ${check(`넘치는 ${총넘침}마리의 예약을 반 편성 보드에서 옮겼습니다`, { attr: ' data-unlock="capSave"' })}
  <div class="btns mt4">
    ${btn('반 편성 보드로 가기', { href: 'AT0401', cls: 'btn-ghost' })}
    ${btn('저장', { id: 'capSave', off: true, cls: 'btn-pri', attr: ' data-notify="정원을 저장했어요 — 요금 안내와 예약 화면에 반영됩니다"' })}
  </div>`, { cls: 'mt6' })}

<div class="btns mt8">${btn('정원·요금 설정으로 돌아가기', { href: 'MG0101', cls: 'btn-ghost' })}</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0103 정원·요금 설정 > 요금 변경 적용 시점
   ⛔ 「다음 청구일」을 손으로 적지 않는다 — data.mjs 의 MY_REG.next 에서 읽는다.
   ============================================================ */
P['MG0103'] = (ctx) => {
  const 정기합 = SALES_REG.reduce((s, r) => s + r.cnt * r.price, 0);
  const 정기건 = SALES_REG.reduce((s, r) => s + r.cnt, 0);
  const 다음청구 = 날짜말(MY_REG.next);

  const body = `${leafHd(ctx, '값을 바꾸면 누구에게, 언제부터 적용되는지 미리 정합니다')}

${banner('info', '🎟', `<b>값을 바꿔도 이미 산 회차권에는 적용되지 않습니다.</b>
  <div class="t-sub mt2">산 값 그대로 끝까지 쓰십니다. 새 값은 «새로 사는 분»부터 붙습니다.</div>`)}

${card('언제부터 적용할까요', `
  ${field('적용 시점', select(
    ['신규 구매부터 (권장)', `다음 청구일(${다음청구})부터`, '날짜를 직접 지정'],
    0, { attr: ' data-reveal-when="날짜를 직접 지정" data-reveal-box="applyDate"' },
  ), { hint: '고르면 아래 표의 「언제부터」가 그대로 적용됩니다' })}
  ${field('적용 날짜', input({ type: 'date', v: '2026-09-01' }), { id: 'applyDate', hide: true, hint: '이 날 00시부터 새 값으로 팔립니다' })}`, { cls: 'mt6' })}

${card('누구에게 언제부터', table(
    ['대상', { t: '언제부터', cls: 'c' }, '어떻게 됩니다'],
    [
      ['<b>이미 회차권을 산 분</b>', { t: `${badge('적용 안 됨', 'b-mut')}`, cls: 'c' },
        `<span class="t-sub">산 값 그대로 쓰십니다. 유효기간도 그대로예요 — ${PRICE.packs.map((p) => `${p.n}회권 ${p.days}일`).join(' · ')}.</span>`],
      ['<b>정기 요일권 이용자</b>', { t: `${badge(`${다음청구}부터`, 'b-warn')}`, cls: 'c' },
        `<span class="t-sub">이번 달 청구는 옛 값 그대로 나갔고, 다음 자동청구부터 새 값으로 나갑니다.</span>`],
      ['<b>새로 사는 분</b>', { t: `${badge('바로 적용', 'b-ok')}`, cls: 'c' },
        '<span class="t-sub">저장한 순간부터 요금 안내·예약·결제 화면에 새 값이 보입니다.</span>'],
    ],
  ), { cls: 'mt6' })}

${card(`다음 청구일(${다음청구})에 새 값으로 나가는 건`, `
  ${table(
    ['상품', { t: '건수', cls: 'r' }, { t: '지금 값', cls: 'r' }, { t: '이번 달 청구액', cls: 'r' }],
    SALES_REG.map((r) => [
      `<b>${esc(r.nm)}</b>`,
      { t: `<span class="num">${num(r.cnt)}건</span>`, cls: 'r' },
      { t: won(r.price), cls: 'r' },
      { t: won(r.cnt * r.price), cls: 'r' },
    ]),
    { foot: ['합계', { t: `${num(정기건)}건`, cls: 'r' }, '', { t: won(정기합), cls: 'r' }] },
  )}
  <p class="hint">합계는 건수 × 값을 더해서 만든 숫자입니다. 값을 고치면 이 표도 함께 움직입니다.</p>`, { cls: 'mt6' })}

${card('이미 산 회차권은 어떻게 되나요', `
  ${btn('펼쳐서 보기 ▾', { cls: 'btn-sub', sm: true, attr: ' data-more-toggle="applyMore" data-more-label="펼쳐서 보기 ▾"' })}
  <div data-more-body="applyMore" hidden class="mt4">
    ${table(
    ['회차권', { t: '지금 값', cls: 'r' }, { t: '1회당', cls: 'r' }, '유효기간', '값을 올리면'],
    PRICE.packs.map((p) => [
      `<b>${p.n}회 회차권</b>`, { t: won(p.price), cls: 'r' }, { t: won(unit(p)), cls: 'r' }, `${p.days}일`,
      '<span class="t-sub">이미 산 분은 그대로 · 새로 사는 분부터 새 값</span>',
    ]),
  )}
    ${banner('warn', '↩️', `<b>환불은 «산 값» 기준으로 계산합니다.</b>
      <div class="t-sub mt2">값을 올린 뒤 옛 회차권을 환불하시면, 새 값이 아니라 그분이 실제로 낸 값으로 돌려드립니다.</div>`, { cls: 'mt4' })}
  </div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('정원·요금 설정으로 돌아가기', { href: 'MG0101', cls: 'btn-ghost' })}
  ${btn('성수기 할증 설정', { href: 'MG0104', cls: 'btn-ghost' })}
  ${btn('이 시점으로 저장', { cls: 'btn-pri', attr: ' data-notify="적용 시점을 저장했어요 — 요금 안내와 결제 화면에 반영됩니다"' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0104 정원·요금 설정 > 성수기 할증 설정
   ⛔ 할증률을 지어내지 않는다 — PRICE.peakOn(성수기) · PRICE.holidayOn(공휴일) 을 읽는다.
      할증을 켜면 «실제 금액»이 계산돼 나온다(토글이 요금표를 여닫는다).
   ============================================================ */
P['MG0104'] = (ctx) => {
  const 대상 = [['1회 이용권', PRICE.once], ...PRICE.opt.map(([nm, p]) => [nm, p])];
  const 있던기간 = ['2026-07-15', '2026-08-31'];
  const 새기간 = ['2026-08-25', '2026-09-15'];
  const 겹침 = 겹친날(있던기간, 새기간);

  const 요금표 = (pct) => table(
    ['항목', { t: '평상시', cls: 'r' }, { t: `할증 +${pct}%`, cls: 'r' }, { t: '차액', cls: 'r' }],
    대상.map(([nm, p]) => [
      `<b>${esc(nm)}</b>`,
      { t: won(p), cls: 'r' },
      { t: `<b class="pri">${won(할증(p, pct))}</b>`, cls: 'r' },
      { t: `<span class="t-sub">+${won(할증(p, pct) - p)}</span>`, cls: 'r' },
    ]),
  );

  const body = `${leafHd(ctx, '기간과 퍼센트를 정하면, 그 기간의 값이 여기서 계산돼 나옵니다')}

${banner('warn', '⚠️', `<b>기간이 ${겹침}일 겹칩니다 — ${날짜말(새기간[0])}부터 ${날짜말(있던기간[1])}까지.</b>
  <div class="t-sub mt2">겹치는 날에도 할증은 «한 번만» 붙습니다. 그래도 기간이 겹쳐 있으면 나중에 헷갈리니 한쪽을 줄여 두시는 편이 좋아요.</div>`, { cls: 'mt6' })}

${card('성수기 기간', `
  ${table(
    ['이름', '시작', '끝', { t: '할증', cls: 'r' }, { t: '', cls: 'c' }],
    [
      { attr: '', cells: ['<b>여름 성수기</b>', 있던기간[0], 있던기간[1], { t: `+${PRICE.peakOn}%`, cls: 'r' }, { t: btn('고치기', { cls: 'btn-ghost', sm: true, attr: ' data-toast="여름 성수기 기간을 고칠 수 있게 열었어요" ' }), cls: 'c' }] },
      { cls: 'bad', cells: ['<b>여름 끝물</b> ' + badge('겹침', 'b-warn'), 새기간[0], 새기간[1], { t: `+${PRICE.peakOn}%`, cls: 'r' }, { t: btn('지우기', { cls: 'btn-dan', sm: true, attr: ' data-modal="mPeakDel"' }), cls: 'c' }] },
    ],
  )}
  <div class="g3 mt4">
    ${field('기간 이름', input({ ph: '예: 추석 연휴 전후' }))}
    ${field('시작', input({ type: 'date', v: '2026-09-16' }))}
    ${field('끝', input({ type: 'date', v: '2026-09-23' }))}
  </div>
  <div class="btns mt3">${btn('＋ 기간 추가', { cls: 'btn-sub', attr: ' data-toast="새 성수기 기간 줄을 더했어요"' })}</div>`, { cls: 'mt6' })}

${card('성수기 할증', `
  <div class="row-b wrap-row">
    <div><div class="t-card">성수기에 <b class="pri">+${PRICE.peakOn}%</b> 를 붙입니다</div>
      <div class="t-sub mt1">지금 켜져 있어요. 끄면 아래 요금표가 사라지고 평상시 값으로만 팔립니다</div></div>
    ${toggle(true, `성수기 할증을 껐어요 — 이 기간에도 1회 이용권은 ${won(PRICE.once)} 그대로 팔립니다`, ' data-open="peakBox"')}
  </div>
  <div id="peakBox" class="mt4">
    ${요금표(PRICE.peakOn)}
    <p class="hint">${esc(SITE.name)} 예약·결제 화면에서 성수기 날짜를 고르면 이 값이 그대로 보입니다.</p>
  </div>`, { cls: 'mt6' })}

${card('공휴일 할증', `
  <div class="row-b wrap-row">
    <div><div class="t-card">공휴일에 <b class="pri">+${PRICE.holidayOn}%</b> 를 붙입니다</div>
      <div class="t-sub mt1">지금은 꺼져 있어요 — ${esc(SITE.hours)} 라서 공휴일에는 아이를 받지 않습니다. 켜면 값이 이렇게 됩니다</div></div>
    ${toggle(false, `공휴일 할증을 켰어요 — 공휴일에 문을 여는 날에만 +${PRICE.holidayOn}% 가 붙습니다`, ' data-open="holBox"')}
  </div>
  <div id="holBox" class="mt4" hidden>
    ${요금표(PRICE.holidayOn)}
    ${banner('info', '📅', `<b>성수기와 공휴일이 같은 날에 겹치면 «높은 쪽 하나»만 붙습니다.</b>
      <div class="t-sub mt2">둘 다 켜져 있어도 +${PRICE.peakOn}% 와 +${PRICE.holidayOn}% 가 겹쳐 붙지 않습니다 — 그날은 +${Math.max(PRICE.peakOn, PRICE.holidayOn)}% 입니다.</div>`, { cls: 'mt4' })}
  </div>`, { cls: 'mt6' })}

${card('저장하기 전에', `
  ${check(`겹치는 ${겹침}일 동안에도 할증이 한 번만 붙는다는 것을 확인했습니다`, { attr: ' data-unlock="peakSave"' })}
  <div class="btns mt4">
    ${btn('되돌리기', { cls: 'btn-ghost', attr: ' data-toast="고친 값을 되돌렸어요"' })}
    ${btn('할증 저장', { id: 'peakSave', off: true, cls: 'btn-pri', attr: ' data-notify="할증을 저장했어요 — 요금 안내와 결제 화면에 반영됩니다"' })}
  </div>`, { cls: 'mt6' })}

${modal('mPeakDel', '이 기간을 지울까요?', `
  <p><b>「여름 끝물」 ${새기간[0]} ~ ${새기간[1]} 기간을 지웁니다.</b></p>
  ${banner('info', '🗓', `<b>지우면 겹치던 ${겹침}일이 함께 풀립니다.</b>
    <div class="t-sub mt2">이미 그 기간으로 결제된 예약이 있으면 결제된 값은 그대로 둡니다.</div>`, { cls: 'mt4' })}`,
  `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('지우기', { cls: 'btn-dan', attr: ' data-notify="「여름 끝물」 기간을 지웠어요 — 겹침이 풀렸습니다" data-notify-kind="ok" data-dismiss' })}`)}

<div class="btns mt8">
  ${btn('정원·요금 설정으로 돌아가기', { href: 'MG0101', cls: 'btn-ghost' })}
  ${btn('요금 변경 적용 시점', { href: 'MG0103', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0202 반 배정 규칙 설정 > 경계값 변경 미리보기
   ⛔ 「몇 마리가 반이 달라지는가」를 글로 적지 않는다 — DOGS 의 몸무게로 «센다».
      슬라이더를 옮기면 app.js 가 같은 셈을 다시 해서 상자를 고쳐 쓴다.
   ============================================================ */
P['MG0202'] = (ctx) => {
  const 새소형 = 6, 새대형 = 12;                       // 지금 손잡이를 옮겨 둔 자리
  const 옛소형 = CLASSES[0].kgMax, 옛대형 = CLASSES[2].kgMin;   // 5 · 15 — data.mjs 가 정한 지금 값

  const 바뀜 = DOGS.filter((d) => 반기준(d.kg, 새소형, 새대형) !== d.cls);
  const 재원바뀜 = 바뀜.filter((d) => d.st === '재원');
  const 재원 = DOGS.filter((d) => d.st === '재원');
  const 전후 = CLASSES.map((c) => ({
    c,
    전: DOGS.filter((d) => d.cls === c.id).length,
    후: DOGS.filter((d) => 반기준(d.kg, 새소형, 새대형) === c.id).length,
    /* 정원은 «동시에 원에 있는 아이» 수와 견주는 값이다 — 오늘 명단(결석 포함)과 섞지 않는다 */
    재원전: 재원.filter((d) => d.cls === c.id).length,
    재원후: 재원.filter((d) => 반기준(d.kg, 새소형, 새대형) === c.id).length,
  }));
  /* app.js 의 [data-boundary] 손잡이가 읽는 몸무게표 — 화면이 아니라 데이터에서 나온다 */
  const 무게표 = JSON.stringify(DOGS.map((d) => ({ nm: d.nm, kg: d.kg, cls: d.cls })));
  /* 화면을 열자마자도 손잡이가 그리는 것과 «같은 글»이 적혀 있어야 한다 */
  const 미리보기 = 바뀜.length === 0
    ? '<span class="t-sub">이 기준으로 바꿔도 반이 달라지는 아이는 없어요</span>'
    : `<b class="acc">이 기준으로 바꾸면 ${바뀜.length}마리가 반이 달라져요</b>`
      + `<div class="t-sub mt2">${바뀜.map((d) => `${esc(d.nm)} ${d.kg}kg`).join(' · ')}</div>`;

  const body = `${leafHd(ctx, `손잡이를 옮기면 오늘 명단 ${DOGS.length}마리를 다시 세어 보여 드립니다`)}

${card('몸무게 경계값', `
  <div class="g2">
    ${field('소형반 ~ 중형반 경계', `
      <input class="in" type="range" min="2" max="10" step="0.5" value="${새소형}" data-boundary="소형" aria-label="소형반 경계">
      <div class="t-card mt2">소형반은 <b class="pri" data-boundary-v="소형">${새소형}kg</b> 미만
        <span class="t-sub">(지금 규칙은 ${옛소형}kg)</span></div>`)}
    ${field('중형반 ~ 대형반 경계', `
      <input class="in" type="range" min="10" max="25" step="0.5" value="${새대형}" data-boundary="대형" aria-label="대형반 경계">
      <div class="t-card mt2">대형반은 <b class="pri" data-boundary-v="대형">${새대형}kg</b> 이상
        <span class="t-sub">(지금 규칙은 ${옛대형}kg)</span></div>`)}
  </div>
  <div class="box mt6" data-boundary-src='${무게표}'>
    <div data-boundary-out>${미리보기}</div>
  </div>
  <p class="hint">오늘 명단 ${DOGS.length}마리(결석·미등원 포함)를 모두 세어 본 값입니다. 손잡이를 옮기면 이 자리가 바로 다시 계산됩니다.</p>`)}

${card(`반이 달라지는 ${바뀜.length}마리`, `
  ${table(
    ['반려견', { t: '몸무게', cls: 'r' }, { t: '지금 반', cls: 'c' }, { t: '바뀔 반', cls: 'c' }, '보호자', { t: '오늘', cls: 'c' }],
    바뀜.map((d) => [
      { t: `<span class="row" style="gap:var(--sp-half)">${dogPh(d.nm, 32)}<b>${esc(d.nm)}</b></span>`, cls: 'nowrap' },
      { t: `<span class="num">${d.kg}kg</span>`, cls: 'r' },
      { t: badge(반이름(d.cls), 'b-line'), cls: 'c' },
      { t: badge(반이름(반기준(d.kg, 새소형, 새대형)), 'b-acc'), cls: 'c' },
      esc(d.guardian),
      { t: stBadge(오늘상태(d.st)), cls: 'c' },
    ]),
  )}
  <p class="hint">지금 원에 있는 ${TODAY_STAT.재원}마리 가운데서는 ${재원바뀜.length}마리(${재원바뀜.map((d) => esc(d.nm)).join(' · ') || '없음'})가 달라집니다.</p>`, { cls: 'mt6' })}

${card('반별 인원이 이렇게 바뀝니다', `<div class="g3">
  ${전후.map((r) => `<div class="box">
    <div class="t-card">${r.c.ico} ${esc(r.c.nm)}</div>
    <div class="t-sub mt1">${r.c.kgMin === 0 ? `${새소형}kg 미만` : (r.c.id === 'md' ? `${새소형} ~ ${새대형}kg` : `${새대형}kg 이상`)}</div>
    <div class="t-sec mt2">${r.전}마리 <span class="t-sub">→</span> <b class="${r.후 === r.전 ? '' : (r.후 > r.전 ? 'acc' : 'pri')}">${r.후}마리</b></div>
    <div class="t-sub mt1">${r.후 === r.전 ? '그대로' : (r.후 > r.전 ? `${r.후 - r.전}마리 늘어남` : `${r.전 - r.후}마리 줄어듦`)}</div>
    <div class="t-sub mt1">지금 원에 있는 아이로는 ${r.재원전} → <b>${r.재원후}마리</b> · 정원 ${r.c.cap}</div>
  </div>`).join('')}
</div>
<p class="hint">위 숫자는 오늘 명단 ${DOGS.length}마리(결석·미등원 포함)를 새 기준으로 다시 나눈 값이고, 더한 값은 언제나 ${DOGS.length}마리로 같습니다.
아래 줄이 정원과 견주는 숫자입니다 — 정원은 «같은 날 동시에 원에 있는 아이» 수를 말합니다.</p>`, { cls: 'mt6' })}

${banner('warn', '🧩', `<b>규칙을 바꿔도 «지금 있는» 아이의 반이 저절로 바뀌지는 않습니다.</b>
  <div class="t-sub mt2">반 편성 보드에서 ${재원바뀜.length}마리를 옮겨 주셔야 합니다. 새로 들어오는 예약부터는 바뀐 기준으로 자동 배정됩니다.</div>`, { cls: 'mt6' })}

${card('저장하기 전에', `
  ${check(`반 편성 보드에서 ${재원바뀜.length}마리를 옮기겠습니다`, { attr: ' data-unlock="bdSave"' })}
  <div class="btns mt4">
    ${btn('반 편성 보드로 가기', { href: 'AT0401', cls: 'btn-ghost' })}
    ${btn('이 기준으로 저장', { id: 'bdSave', off: true, cls: 'btn-pri', attr: ' data-notify="새 경계값을 저장했어요 — 다음 예약부터 이 기준으로 배정됩니다"' })}
  </div>`, { cls: 'mt6' })}

<div class="btns mt8">${btn('반 배정 규칙으로 돌아가기', { href: 'MG0201', cls: 'btn-ghost' })}</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0203 반 배정 규칙 설정 > 자동 배정 끄기
   ============================================================ */
P['MG0203'] = (ctx) => {
  const 여유 = CLASSES.reduce((s, c) => s + (c.cap - clsNow(c.id)), 0);

  const body = `${leafHd(ctx, '자동 배정을 껐습니다 — 이제 예약이 「반 미정」으로 들어옵니다')}

${banner('warn', '🖐', `<b>지금부터 들어오는 예약은 반이 정해지지 않은 채로 쌓입니다.</b>
  <div class="t-sub mt2">원장님이 반 편성 보드에서 하나씩 배정하셔야 아이가 실제로 자리를 받습니다.</div>`)}

${card('자동 배정', `
  <div class="row-b wrap-row">
    <div><div class="t-card">예약할 때 자동으로 반을 정합니다</div>
      <div class="t-sub mt1">지금 꺼져 있어요. 다시 켜면 몸무게 기준으로 곧바로 반이 정해집니다</div></div>
    ${toggle(false, '자동 배정을 다시 켰어요 — 예약이 들어오는 대로 몸무게 기준으로 반이 정해집니다', ' data-open="autoBox"')}
  </div>
  <div id="autoBox" class="mt4" hidden>
    ${table(
    ['반', '몸무게 기준', { t: '지금', cls: 'r' }, { t: '정원', cls: 'r' }, { t: '여유', cls: 'r' }],
    CLASSES.map((c) => [
      `<b>${c.ico} ${esc(c.nm)}</b>`, esc(c.kg),
      { t: `<span class="num">${clsNow(c.id)}</span>`, cls: 'r' },
      { t: `<span class="num">${c.cap}</span>`, cls: 'r' },
      { t: `<b class="${c.cap - clsNow(c.id) > 0 ? 'ok' : 'dan'}">${c.cap - clsNow(c.id)}자리</b>`, cls: 'r' },
    ]),
    { foot: ['', '', { t: `${TODAY_STAT.재원}`, cls: 'r' }, { t: `${CLASSES.reduce((s, c) => s + c.cap, 0)}`, cls: 'r' }, { t: `${여유}자리`, cls: 'r' }] },
  )}
    <p class="hint">자동 배정이 켜져 있으면 예약이 들어오는 순간 이 표를 보고 몸무게에 맞는 반에 넣습니다. 정원이 찬 반이면 예약 화면에서 마감으로 보입니다.</p>
  </div>`, { cls: 'mt6' })}

${card('꺼 두면 이렇게 흘러갑니다', steps([
    ['보호자가 예약', '요일·날짜만 고른다'],
    ['「반 미정」으로 접수', '아이 카드에 반 배지가 붙지 않는다'],
    ['원장이 보드에서 배정', '몸무게와 성향을 보고 직접 넣는다'],
    ['확정 · 보호자에게 안내', '반이 정해져야 알림장 담당도 정해진다'],
  ], 2), { cls: 'mt6' })}

${banner('dan', '⏱', `<b>오늘 들어온 예약은 ${TODAY_STAT.예약}건입니다 — 자동 배정이 꺼져 있으면 이만큼을 손으로 배정하셔야 합니다.</b>
  <div class="t-sub mt2">며칠만 꺼 두고 다시 켜시는 것을 권합니다. 성향 테스트 기간처럼 «사람이 봐야 하는» 때에만 끄는 손잡이입니다.</div>`, { cls: 'mt6' })}

${card('저장하기 전에', `
  ${check('반 편성 보드에서 매일 직접 배정하겠습니다', { attr: ' data-unlock="autoSave"' })}
  <div class="btns mt4">
    ${btn('반 편성 보드로 가기', { href: 'AT0401', cls: 'btn-ghost' })}
    ${btn('끈 채로 저장', { id: 'autoSave', off: true, cls: 'btn-pri', attr: ' data-notify="자동 배정을 끈 채로 저장했어요 — 새 예약은 「반 미정」으로 들어옵니다"' })}
  </div>`, { cls: 'mt6' })}

<div class="btns mt8">${btn('반 배정 규칙으로 돌아가기', { href: 'MG0201', cls: 'btn-ghost' })}</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0204 반 배정 규칙 설정 > 사교성 평가 문항 관리
   ============================================================ */
P['MG0204'] = (ctx) => {
  const 쓰는수 = 문항.filter((q) => q.on).length;

  const body = `${leafHd(ctx, '첫 등원 날 30분 적응 테스트에서 무엇을 볼지 정합니다')}

<div class="filters">
  <div class="chips" data-filter-for="q">
    ${chip('전체', true, ' data-tag="전체"')}
    ${chip('쓰는 문항', false, ' data-tag="쓴다"')}
    ${chip('안 쓰는 문항', false, ' data-tag="안쓴다"')}
  </div>
  ${select(['정한 차례대로', '문항 이름순'], 0, { vals: ['Ord', 'Nm'], attr: ' data-sort-for="q" aria-label="차례"' })}
  ${btn('＋ 문항 추가', { cls: 'btn-pri', attr: ' data-modal="mAddQ"' })}
</div>

<p class="t-sub mb4">문항 <b data-filter-cnt="q">${문항.length}</b>개가 보입니다 · 이 가운데 실제로 쓰는 문항은 ${쓰는수}개입니다.</p>

${table(
    [{ t: '차례', w: '64px', cls: 'c' }, '문항', '무엇을 보나', { t: '쓰나요', cls: 'c' }, { t: '옮기기', cls: 'c' }, { t: '', cls: 'c' }],
    문항.map((q, i) => ({
      cls: q.on ? '' : 'mut',
      attr: ` data-tag="${q.on ? '쓴다' : '안쓴다'}" data-s-ord="${i + 1}" data-s-nm="${esc(q.q)}"`,
      cells: [
        { t: `<span class="num">${i + 1}</span>`, cls: 'c' },
        `<b>${esc(q.q)}</b>`,
        `<span class="t-sub">${esc(q.d)}</span>`,
        { t: toggle(q.on, q.on ? `「${q.q}」 문항을 껐어요 — 다음 테스트부터 묻지 않습니다` : `「${q.q}」 문항을 켰어요 — 다음 테스트부터 묻습니다`), cls: 'c' },
        {
          t: `${btn('↑', { cls: 'btn-ghost', sm: true, attr: ` data-toast="「${esc(q.q)}」를 한 칸 위로 올렸어요 — 저장하면 이 차례로 굳습니다"` })}
              ${btn('↓', { cls: 'btn-ghost', sm: true, attr: ` data-toast="「${esc(q.q)}」를 한 칸 아래로 내렸어요 — 저장하면 이 차례로 굳습니다"` })}`,
          cls: 'c',
        },
        { t: btn('지우기', { cls: 'btn-dan', sm: true, attr: ' data-modal="mDelQ"' }), cls: 'c' },
      ],
    })),
    { attr: ' data-filter-list="q"' },
  )}

<div hidden data-empty-for="q">${empty('🔎', '그런 문항이 없어요', '거르개를 「전체」로 되돌리면 다시 보입니다')}</div>

${banner('info', '📋', `<b>문항은 3단계(좋음 · 보통 · 주의)로 적습니다.</b>
  <div class="t-sub mt2">「주의」가 둘 이상이면 첫 주 동안 소그룹으로 따로 봅니다. 문항을 지워도 이미 적어 둔 평가 기록은 남아요.</div>`, { cls: 'mt6' })}

${modal('mAddQ', '문항 추가', `
  ${field('문항', input({ ph: '예: 낮잠 시간에 혼자 있어도 괜찮은가' }), { req: true, hint: '테스트하는 선생님이 그대로 읽습니다 — 물음 하나만 담아 주세요' })}
  ${field('무엇을 보나', input({ ph: '예: 분리 불안 · 낮잠방 자리 판단' }), { req: true })}
  ${field('어디에 넣을까요', select(['맨 뒤', '맨 앞'], 0))}`,
  `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('문항 추가', { cls: 'btn-pri', attr: ' data-notify="문항을 더했어요 — 저장하면 다음 테스트부터 묻습니다" data-dismiss' })}`)}

${modal('mDelQ', '이 문항을 지울까요?', `
  <p><b>지우면 다음 테스트부터 이 문항을 묻지 않습니다.</b></p>
  ${banner('info', '📓', `<b>이미 적어 둔 평가 기록은 그대로 남습니다.</b>
    <div class="t-sub mt2">지우는 것이 아니라 «앞으로 안 묻는» 것입니다. 잠시만 쉬게 하시려면 지우지 말고 「쓰나요」를 꺼 두세요.</div>`, { cls: 'mt4' })}
  <div class="mt4">${check('이 문항 없이도 반을 나눌 수 있습니다', { attr: ' data-unlock="qDel"' })}</div>`,
  `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('지우기', { cls: 'btn-dan', id: 'qDel', off: true, attr: ' data-notify="문항을 지웠어요 — 지난 평가 기록은 그대로 남습니다" data-dismiss' })}`)}

<div class="btns mt8">
  ${btn('반 배정 규칙으로 돌아가기', { href: 'MG0201', cls: 'btn-ghost' })}
  ${btn('저장', { cls: 'btn-pri', attr: ' data-notify="문항과 차례를 저장했어요"' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0302 정산·매출 > 기간 선택
   ⛔ 기간을 좁혔는데 합계가 그대로면 안 된다 — [data-period] 를 고르면
      지표 넷([data-sales])과 기간 글자([data-period-label])가 «실제로» 다시 계산된다.
   ============================================================ */
P['MG0302'] = (ctx) => {
  const 팩건 = SALES_PACK.reduce((s, r) => s + r.cnt, 0);
  const 정기건 = SALES_REG.reduce((s, r) => s + r.cnt, 0);

  const body = `${leafHd(ctx, `보고 계신 기간 — <span data-period-label>${esc(SALES.period)}</span>`)}

<div class="filters">
  ${기간고르개()}
  ${btn('정산서 다운로드', { href: 'MG0304', cls: 'btn-ghost' })}
</div>

<div class="g4">
  ${stat('총 매출', man(SALES.total), { ico: '💰', d: '<span data-period-label>' + esc(SALES.period) + '</span>', numAttr: ' data-sales="total"' })}
  ${stat('회차권 판매', man(SALES.pack), { ico: '🎟', cls: 'ok', d: `${팩건}건`, numAttr: ' data-sales="pack"' })}
  ${stat('정기권 자동청구', man(SALES.reg), { ico: '🔁', cls: 'ok', d: `${정기건}건`, numAttr: ' data-sales="reg"' })}
  ${stat('환불', man(SALES.refund), { ico: '↩️', cls: 'dan', d: `${REFUNDS.length}건`, numAttr: ' data-sales="refund"' })}
</div>

${card('기간을 직접 지정하기', `
  <div class="g3">
    ${field('시작일', input({ type: 'date', v: '2026-08-01' }))}
    ${field('종료일', input({ type: 'date', v: '2026-08-15' }))}
    ${field('기준', select(['결제일 기준', '이용일 기준'], 0), { hint: '회차권은 산 날, 정기권은 청구된 날이 결제일입니다' })}
  </div>
  <p class="hint">위 고르개에서 「직접 지정 (8월 1일 ~ 8월 15일)」을 고르시면 이 기간으로 다시 계산해 드립니다.</p>`, { cls: 'mt6' })}

${card('기간별로 나란히 보기', `
  ${table(
    ['기간', { t: '회차권 판매', cls: 'r' }, { t: '정기권 자동청구', cls: 'r' }, { t: '환불', cls: 'r' }, { t: '총 매출', cls: 'r' }],
    기간들.map((p) => {
      const v = 기간값(p);
      return [
        `<b>${esc(p.t)}</b><div class="t-sub">${esc(p.lb)}</div>`,
        { t: man(v.pack), cls: 'r' },
        { t: man(v.reg), cls: 'r' },
        { t: `<span class="dan">−${man(v.refund)}</span>`, cls: 'r' },
        { t: `<b>${man(v.total)}</b>`, cls: 'r' },
      ];
    }),
  )}
  <p class="hint">총 매출은 회차권 판매 + 정기권 자동청구 − 환불로 계산한 값입니다. 기간을 좁히면 그만큼 줄어듭니다.</p>`, { cls: 'mt6' })}

${card('이 기간으로 정산서에 담을 항목', `
  <div class="chips" data-multi data-pick-scope="rep">
    ${chip('매출 요약', true)}
    ${chip('요금제별 판매 건수', true)}
    ${chip('결제 수단 비중', false)}
    ${chip('환불·취소 내역', false)}
  </div>
  <p class="t-sub mt3"><b data-pick-out="rep">2</b>개를 골랐습니다. 하나도 안 고르시면 아래 단추가 잠깁니다.</p>
  <div class="btns mt4">
    ${btn('고른 항목으로 정산서 만들기', { id: 'repBtn', cls: 'btn-pri', attr: ' data-pick-btn="rep" data-notify="고른 항목으로 정산서를 만들고 있어요 — 잠시 뒤 내려받기가 시작됩니다"' })}
  </div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('정산·매출로 돌아가기', { href: 'MG0301', cls: 'btn-ghost' })}
  ${btn('항목별 펼치기', { href: 'MG0303', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0303 정산·매출 > 항목별 펼치기
   ⛔ 펼친 항목들의 합이 위 「합계」와 정확히 같아야 한다.
      그래서 소계도 총계도 전부 같은 reduce 로 만든다 — 손으로 적은 숫자가 하나도 없다.
   ============================================================ */
P['MG0303'] = (ctx) => {
  const 팩소계 = SALES_PACK.reduce((s, r) => s + r.cnt * r.price, 0);
  const 정기소계 = SALES_REG.reduce((s, r) => s + r.cnt * r.price, 0);
  const 환불소계 = REFUNDS.reduce((s, r) => s + r.amt, 0);
  const 총계 = 팩소계 + 정기소계 - 환불소계;
  const 팩건 = SALES_PACK.reduce((s, r) => s + r.cnt, 0);
  const 정기건 = SALES_REG.reduce((s, r) => s + r.cnt, 0);

  const 접이 = (key, 제목, 소계글, 건수, 속) => card(제목, `
    <div class="row-b wrap-row">
      <div><span class="t-sub">${건수}</span></div>
      <div class="row" style="gap:var(--sp-btn)">
        <b class="t-sec">${소계글}</b>
        ${btn('펼치기 ▾', { cls: 'btn-sub', sm: true, attr: ` data-more-toggle="${key}" data-more-label="펼치기 ▾"` })}
      </div>
    </div>
    <div data-more-body="${key}" hidden class="mt4">${속}</div>`, { cls: 'mt6' });

  const body = `${leafHd(ctx, `${esc(SALES.period)} · 항목을 하나씩 펴서 안을 봅니다`)}

${card('매출 구성', `${sumRows([
    ['회차권 판매 (1회권 포함)', won(팩소계)],
    ['정기권 자동청구', won(정기소계)],
    ['환불·취소', `−${won(환불소계)}`, 'minus'],
  ], ['총 매출', won(총계)])}
  <p class="hint">아래 세 항목을 펼쳐 더하면 이 합계와 정확히 같습니다. 한 줄을 고치면 합계도 따라 움직입니다.</p>`)}

${접이('mPack', '🎟 회차권 판매', won(팩소계), `${팩건}건 · ${SALES_PACK.length}개 상품`, `${table(
    ['상품', { t: '건수', cls: 'r' }, { t: '단가', cls: 'r' }, { t: '1회당', cls: 'r' }, { t: '금액', cls: 'r' }],
    SALES_PACK.map((r) => ({
      cls: r.cnt === 0 ? 'mut' : '',
      cells: [
        `<b>${esc(r.nm)}</b>`,
        { t: `<span class="num">${r.cnt}건</span>`, cls: 'r' },
        { t: won(r.price), cls: 'r' },
        { t: r.nm === '1회 이용권' ? won(PRICE.once) : `<span class="t-sub">${won(Math.round(r.price / (PRICE.packs.find((p) => p.price === r.price) || { n: 1 }).n))}</span>`, cls: 'r' },
        { t: r.cnt === 0 ? '<span class="muted">—</span>' : won(r.cnt * r.price), cls: 'r' },
      ],
    })),
    { foot: ['소계', { t: `${팩건}건`, cls: 'r' }, '', '', { t: won(팩소계), cls: 'r' }] },
  )}
  <p class="hint">30회권은 이번 기간에 한 건도 팔리지 않아 금액이 없습니다.</p>`)}

${접이('mReg', '🔁 정기권 자동청구', won(정기소계), `${정기건}건 · 매월 1일에 한 번에 청구`, `${table(
    ['상품', { t: '건수', cls: 'r' }, { t: '월 청구액', cls: 'r' }, { t: '월 등원 횟수', cls: 'r' }, { t: '금액', cls: 'r' }],
    SALES_REG.map((r) => {
      const 주 = Number(String(r.nm).replace(/[^\d]/g, ''));
      return [
        `<b>${esc(r.nm)}</b>`,
        { t: `<span class="num">${r.cnt}건</span>`, cls: 'r' },
        { t: won(r.price), cls: 'r' },
        { t: `<span class="t-sub">약 ${주 * 4}회</span>`, cls: 'r' },
        { t: won(r.cnt * r.price), cls: 'r' },
      ];
    }),
    { foot: ['소계', { t: `${정기건}건`, cls: 'r' }, '', '', { t: won(정기소계), cls: 'r' }] },
  )}
  <p class="hint">일시정지 중인 아이는 청구에서 빠집니다. 위 건수는 실제로 청구된 건만 셉니다.</p>`)}

${접이('mRef', '↩️ 환불·취소', `−${won(환불소계)}`, `${REFUNDS.length}건`, `${table(
    ['날짜', '반려견', '사유', '내용', { t: '금액', cls: 'r' }],
    REFUNDS.map((r) => [
      { t: `<span class="num">${esc(r.date)}</span>`, cls: 'nowrap' },
      `<b>${esc(r.dog)}</b>`,
      esc(r.why),
      `<span class="t-sub">${esc(r.kind)}</span>`,
      { t: `<span class="dan">−${won(r.amt)}</span>`, cls: 'r nowrap' },
    ]),
    { foot: ['', '', '', '소계', { t: `<span class="dan">−${won(환불소계)}</span>`, cls: 'r' }] },
  )}
  <p class="hint">환불은 «산 값» 기준으로 돌려드립니다. 이미 쓴 횟수는 1회 이용권 정가(${won(PRICE.once)})로 계산합니다.</p>`)}

${banner('ok', '🧮', `<b>검산 — ${won(팩소계)} + ${won(정기소계)} − ${won(환불소계)} = ${won(총계)}</b>
  <div class="t-sub mt2">위 「총 매출」과 같은 값입니다. 세 항목의 소계는 각 표의 줄을 더해 만든 숫자예요.</div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('정산·매출로 돌아가기', { href: 'MG0301', cls: 'btn-ghost' })}
  ${btn('기간 선택', { href: 'MG0302', cls: 'btn-ghost' })}
  ${btn('정산서 다운로드', { href: 'MG0304', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0304 정산·매출 > 정산서 다운로드
   ============================================================ */
P['MG0304'] = (ctx) => {
  const body = `${leafHd(ctx, '기간과 담을 항목을 고르면 정산서 파일을 만들어 드립니다')}

${card('어느 기간의 정산서인가요', `
  <div class="filters" style="margin-bottom:0">${기간고르개()}</div>
  <div class="mt4">${kv([
    ['기간', '<span data-period-label>' + esc(SALES.period) + '</span>'],
    ['총 매출', `<b data-sales="total">${man(SALES.total)}</b>`],
    ['회차권 판매', `<span data-sales="pack">${man(SALES.pack)}</span>`],
    ['정기권 자동청구', `<span data-sales="reg">${man(SALES.reg)}</span>`],
    ['환불·취소', `<span data-sales="refund">${man(SALES.refund)}</span>`],
  ])}</div>
  <p class="hint">기간을 바꾸면 이 값들이 바로 다시 계산됩니다. 정산서에는 여기 보이는 값 그대로 담깁니다.</p>`)}

${card('담을 항목', `
  <div class="chips" data-multi data-pick-scope="doc">
    ${chip('매출 요약', true)}
    ${chip('요금제별 판매 건수', true)}
    ${chip('결제 수단 비중', true)}
    ${chip('환불·취소 내역', false)}
    ${chip('반려견별 이용 내역', false)}
  </div>
  <p class="t-sub mt3"><b data-pick-out="doc">3</b>개를 골랐습니다. 하나도 안 고르시면 만들 수 없어요.</p>
  <div class="g3 mt4">
    ${field('파일 형식', radioRow('fmt', ['엑셀 (xlsx)', 'PDF', 'CSV'], 0))}
    ${field('받는 방법', select(['바로 내려받기', '이메일로 보내기'], 0), { hint: `이메일로 받으시면 ${esc(SITE.email)} 에서 발송됩니다` })}
  </div>
  <div class="btns mt6">
    ${btn('되돌리기', { cls: 'btn-ghost', attr: ' data-toast="고른 항목을 처음 상태로 되돌렸어요"' })}
    ${btn('정산서 만들기', { id: 'dlBtn', cls: 'btn-pri', attr: ' data-pick-btn="doc" data-notify="정산서를 만들고 있어요 — 잠시 뒤 내려받기가 시작됩니다"' })}
  </div>`, { cls: 'mt6' })}

${card('세금계산서 발행 요청', `
  <p class="t-sub mb4">정산서와 세금계산서는 다릅니다. 세금계산서가 필요하시면 아래에서 따로 요청해 주세요 — 요청하신 달의 다음 달 10일까지 발행됩니다.</p>
  ${kv([
    ['상호', esc(SITE.name)],
    ['주소', esc(SITE.addr)],
    ['연락처', `${esc(SITE.tel)} · ${esc(SITE.email)}`],
  ])}
  <div class="btns mt4">${btn('세금계산서 발행 요청', { cls: 'btn-sub', attr: ' data-modal="mTax"' })}</div>`, { cls: 'mt6' })}

${banner('info', '📄', `<b>정산서는 «만든 시점»의 값으로 굳습니다.</b>
  <div class="t-sub mt2">나중에 환불이 생기면 그 달 정산서와 화면의 숫자가 달라질 수 있어요. 그때는 정산서를 다시 만들어 주세요.</div>`, { cls: 'mt6' })}

${modal('mTax', '세금계산서 발행 요청', `
  ${field('사업자등록번호', input({ ph: '000-00-00000' }), { req: true })}
  ${field('상호', input({ ph: '받는 분 상호' }), { req: true })}
  ${field('담당자 이메일', input({ type: 'email', ph: 'name@example.com' }), { req: true, hint: '이 주소로 발행 안내가 갑니다' })}
  ${field('발행 기간', select(기간들.map((p) => p.t), 0))}`,
  `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('발행 요청', { cls: 'btn-pri', attr: ' data-notify="세금계산서 발행을 요청했어요 — 다음 달 10일까지 발행됩니다" data-dismiss' })}`)}

<div class="btns mt8">
  ${btn('정산·매출로 돌아가기', { href: 'MG0301', cls: 'btn-ghost' })}
  ${btn('항목별 펼치기', { href: 'MG0303', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0402 직원·계정 관리 > 직원 초대
   ⛔ 새 직원을 지어내지 않는다 — 지금 일하는 사람은 STAFF 에서만 읽고,
      아직 오지 않은 사람(초대 대기)은 «빈 화면»으로 정직하게 둔다.
   ============================================================ */
P['MG0402'] = (ctx) => {
  const 활성 = STAFF.filter((s) => s.st === '활성');
  const 반담당 = CLASSES.map((c) => ({ c, who: STAFF.filter((s) => s.st === '활성' && s.cls.includes(c.nm)) }));

  const body = `${leafHd(ctx, '이메일로 초대 링크를 보냅니다 — 받는 분이 스스로 비밀번호를 정합니다')}

${card('새 직원 초대', `
  <div class="g2">
    ${field('이메일', input({ type: 'email', ph: 'name@dogmaru.kr' }), { req: true, hint: '이 주소로 초대 링크가 갑니다' })}
    ${field('이름', input({ ph: '홍길동' }), { req: true })}
  </div>
  <div class="g2 mt4">
    ${field('역할', select(['보육교사', '원장'], 0), { hint: '보육교사는 정산·매출과 직원 관리 화면을 볼 수 없습니다' })}
    ${field('경력', input({ ph: '예: 3년' }))}
  </div>
  <div class="mt4">
    <span class="t-sub">담당 반 (여러 반을 맡을 수 있어요)</span>
    <div class="chips mt2" data-multi data-pick-scope="cls">
      ${CLASSES.map((c) => chip(`${c.ico} ${c.nm}`, false)).join('')}
    </div>
    <p class="t-sub mt3">담당 반 <b data-pick-out="cls">0</b>개를 골랐습니다. 한 반도 안 고르시면 초대를 보낼 수 없어요.</p>
  </div>
  <div class="btns mt6">
    ${btn('취소', { href: 'MG0401', cls: 'btn-ghost' })}
    ${btn('초대 메일 보내기', { id: 'invBtn', off: true, cls: 'btn-pri', attr: ' data-pick-btn="cls" data-notify="초대 메일을 보냈어요 — 링크는 7일 동안 쓸 수 있습니다"' })}
  </div>`)}

${card('지금 반을 맡고 있는 사람', `
  ${table(
    ['반', { t: '지금 인원', cls: 'r' }, { t: '정원', cls: 'r' }, '담당 선생님'],
    반담당.map(({ c, who }) => [
      `<b>${c.ico} ${esc(c.nm)}</b> <span class="t-sub">${esc(c.kg)}</span>`,
      { t: `<span class="num">${clsNow(c.id)}</span>`, cls: 'r' },
      { t: `<span class="num">${c.cap}</span>`, cls: 'r' },
      who.length ? who.map((s) => badge(`${s.nm} (${s.role})`, s.role === '원장' ? 'b-solid' : 'b-line')).join(' ') : '<span class="muted">없음</span>',
    ]),
  )}
  <p class="hint">지금 ${활성.length}명이 일하고 있습니다. 새로 오시는 분께 어느 반을 맡길지 여기서 보고 정하세요.</p>`, { cls: 'mt6' })}

${card('보낸 초대', empty('✉️', '아직 보낸 초대가 없어요',
    '초대를 보내면 여기에 「대기」로 쌓입니다. 각 줄에서 다시 보내거나 취소할 수 있어요.',
    btn('위에서 초대 보내기', { cls: 'btn-ghost', attr: ' data-toast="위 초대 칸으로 올라가세요 — 이메일과 담당 반을 채우면 단추가 열립니다"' })), { cls: 'mt6' })}

${banner('info', '🔑', `<b>초대 링크는 7일 동안만 쓸 수 있습니다.</b>
  <div class="t-sub mt2">받는 분이 링크를 눌러 비밀번호를 직접 정합니다. 원장님이 비밀번호를 대신 만들어 알려 주실 필요가 없어요.
  7일이 지나면 대기 줄에서 「다시 보내기」를 누르시면 됩니다.</div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('직원·계정 관리로 돌아가기', { href: 'MG0401', cls: 'btn-ghost' })}
  ${btn('권한 변경', { href: 'MG0403', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0403 직원·계정 관리 > 권한 변경
   ⛔ 브라우저 기본 확인창을 쓰지 않는다 — U.modal() + data-modal 로 묻는다.
      직원은 STAFF 에서 읽는다. 새 사람을 지어내지 않는다.
   ============================================================ */
P['MG0403'] = (ctx) => {
  const 대상 = STAFF.find((s) => s.nm === '이도윤');
  const 새로열림 = 권한표.filter(([, 원장, 교사]) => 원장 && !교사);

  const body = `${leafHd(ctx, `${대상.nm} 선생님의 역할과 담당 반을 바꿉니다`)}

${card(`${대상.nm} 선생님`, `
  ${kv([
    ['지금 역할', badge(대상.role, 'b-line')],
    ['지금 담당 반', 대상.cls.map((c) => badge(c, 'b-line')).join(' ')],
    ['이메일', `<span class="t-sub">${esc(대상.email)}</span>`],
    ['경력', esc(대상.career)],
    ['계정', stBadge(대상.st)],
  ])}`)}

${card('역할 바꾸기', `
  ${field('역할', select(['보육교사', '원장'], 0, { attr: ' data-reveal-when="원장" data-reveal-box="chiefBox"' }),
    { hint: '「원장」으로 바꾸면 돈과 관련된 화면까지 볼 수 있게 됩니다' })}
  <div id="chiefBox" hidden class="mt4">
    ${banner('warn', '🔓', `<b>원장으로 올리면 새로 볼 수 있게 되는 화면이 ${새로열림.length}개입니다.</b>
      <div class="t-sub mt2">${새로열림.map(([nm]) => esc(nm)).join(' · ')}</div>`)}
  </div>`, { cls: 'mt6' })}

${card('담당 반 바꾸기', `
  <div class="chips" data-multi data-pick-scope="cls">
    ${CLASSES.map((c) => chip(`${c.ico} ${c.nm}`, 대상.cls.includes(c.nm))).join('')}
  </div>
  <p class="t-sub mt3">담당 반 <b data-pick-out="cls">1</b>개를 골랐습니다. 한 반도 없으면 저장할 수 없어요 — 반이 없는 선생님은 알림장을 쓸 대상이 없습니다.</p>
  ${table(
    ['반', { t: '지금 인원', cls: 'r' }, { t: '정원', cls: 'r' }, { t: `${대상.nm} 선생님`, cls: 'c' }],
    CLASSES.map((c) => [
      `<b>${c.ico} ${esc(c.nm)}</b>`,
      { t: `<span class="num">${clsNow(c.id)}</span>`, cls: 'r' },
      { t: `<span class="num">${c.cap}</span>`, cls: 'r' },
      { t: 대상.cls.includes(c.nm) ? badge('맡는 중', 'b-ok') : '<span class="muted">—</span>', cls: 'c' },
    ]),
    { cls: 'mt4' },
  )}`, { cls: 'mt6' })}

${sec('역할이 볼 수 있는 화면', table(
    ['화면', { t: '원장', cls: 'c' }, { t: '보육교사', cls: 'c' }],
    권한표.map(([nm, 원장, 교사]) => ({
      cls: 원장 && !교사 ? 'bad' : '',
      cells: [
        (원장 && !교사) ? `<b>${esc(nm)}</b> ${badge('역할에 따라 갈림', 'b-warn')}` : esc(nm),
        { t: 원장 ? '✅' : '<span class="muted">✕</span>', cls: 'c' },
        { t: 교사 ? '✅' : '<span class="muted">✕</span>', cls: 'c' },
      ],
    })),
  ), { desc: '보육교사는 돈과 관련된 화면을 볼 수 없습니다. 붉게 표시한 줄이 역할에 따라 갈리는 자리입니다.' })}

${card('바꾼 내용 저장', `
  <p class="t-sub mb4">저장하면 ${대상.nm} 선생님이 다음에 로그인하실 때부터 바뀐 권한이 적용됩니다. 지금 로그인해 계시면 화면을 새로 고쳐야 보입니다.</p>
  <div class="btns">
    ${btn('취소', { href: 'MG0401', cls: 'btn-ghost' })}
    ${btn('권한 저장', { id: 'permSave', cls: 'btn-pri', attr: ' data-pick-btn="cls" data-modal="mPerm"' })}
  </div>`, { cls: 'mt6' })}

${modal('mPerm', '권한을 바꿀까요?', `
  <p><b>${대상.nm} 선생님의 역할과 담당 반을 바꿉니다.</b></p>
  ${banner('info', '🔁', `<b>지난 기록의 담당 선생님 이름은 바뀌지 않습니다.</b>
    <div class="t-sub mt2">이미 보낸 알림장과 건강기록에 적힌 이름은 그대로 남습니다. 앞으로 쓰는 것부터 새 담당 반이 적용돼요.</div>`, { cls: 'mt4' })}
  <div class="mt4">${check('바뀐 담당 반을 본인에게 알렸습니다', { attr: ' data-unlock="permOk"' })}</div>`,
  `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('바꾸기', { cls: 'btn-pri', id: 'permOk', off: true, attr: ` data-notify="${esc(대상.nm)} 선생님의 권한을 바꿨어요 — 다음 로그인부터 적용됩니다" data-dismiss` })}`)}

<div class="btns mt8">
  ${btn('직원·계정 관리로 돌아가기', { href: 'MG0401', cls: 'btn-ghost' })}
  ${btn('퇴사 처리', { href: 'MG0404', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0404 직원·계정 관리 > 퇴사 처리
   ⛔ 브라우저 기본 확인창을 쓰지 않는다 — U.modal() + data-modal, 그리고 체크해야 열리는 단추.
      「남는 기록」의 건수도 지어내지 않는다 — NOTES · HEALTH_LOG 에서 «센다».
   ============================================================ */
P['MG0404'] = (ctx) => {
  const 대상 = STAFF.find((s) => s.nm === '이도윤');
  const 알림장수 = NOTES.filter((n) => n.teacher === 대상.nm).length;
  const 기록수 = HEALTH_LOG.filter((h) => h.by === 대상.nm).length;
  const 인계후보 = STAFF.filter((s) => s.role === '보육교사' && s.st === '활성' && s.nm !== 대상.nm);
  const 맡은반 = CLASSES.filter((c) => 대상.cls.includes(c.nm));
  const 맡은인원 = 맡은반.reduce((s, c) => s + clsNow(c.id), 0);

  const body = `${leafHd(ctx, `${대상.nm} 선생님의 계정을 비활성화합니다 — 지우는 것이 아닙니다`)}

${banner('warn', '🚪', `<b>비활성화하면 ${대상.nm} 선생님은 더 이상 로그인할 수 없습니다.</b>
  <div class="t-sub mt2">먼저 담당하시던 ${맡은반.map((c) => esc(c.nm)).join(' · ')} ${맡은인원}마리를 다른 선생님께 넘겨야 합니다.</div>`)}

${card(`${대상.nm} 선생님`, kv([
    ['역할', badge(대상.role, 'b-line')],
    ['담당 반', 대상.cls.map((c) => badge(c, 'b-line')).join(' ')],
    ['지금 맡고 있는 아이', `${맡은인원}마리`],
    ['이메일', `<span class="t-sub">${esc(대상.email)}</span>`],
    ['경력', esc(대상.career)],
    ['계정', stBadge(대상.st)],
  ]), { cls: 'mt6' })}

${card('① 담당 반을 누구에게 넘길까요', `
  ${맡은반.map((c) => field(`${c.ico} ${c.nm} (${clsNow(c.id)}마리)`,
    select(인계후보.map((s) => `${s.nm} (${s.cls.join('·') || '담당 반 없음'})`), 0),
    { hint: '넘겨받은 선생님이 이 반의 알림장을 쓰게 됩니다' })).join('')}
  <p class="hint">지금 일하고 계신 보육교사 ${인계후보.length}분 가운데 고르실 수 있습니다.</p>`, { cls: 'mt6' })}

${card('② 남는 기록을 확인하세요', `
  ${table(
    ['기록', { t: '건수', cls: 'r' }, '비활성화하면'],
    [
      ['알림장', { t: `<b class="num">${알림장수}건</b>`, cls: 'r' }, '<span class="t-sub">그대로 남습니다. 보호자가 받은 알림장의 담당 선생님 이름도 바뀌지 않아요.</span>'],
      ['원 내 관찰 기록', { t: `<b class="num">${기록수}건</b>`, cls: 'r' }, '<span class="t-sub">그대로 남습니다. 건강 기록은 아이의 이력이라 사람과 함께 지우지 않습니다.</span>'],
      ['등하원 체크 이력', { t: '<span class="t-sub">전부</span>', cls: 'r' }, '<span class="t-sub">그대로 남습니다. 누가 언제 인계했는지는 사고가 났을 때 필요한 기록입니다.</span>'],
    ],
  )}
  ${banner('info', '📓', `<b>계정을 «지우는» 것이 아니라 «들어오지 못하게» 하는 것입니다.</b>
    <div class="t-sub mt2">다시 오시면 직원·계정 관리 화면에서 「다시 활성화」로 되돌릴 수 있어요.</div>`, { cls: 'mt4' })}`, { cls: 'mt6' })}

${card('③ 비활성화', `
  <p class="t-sub mb4">위 두 가지를 마치신 뒤에 눌러 주세요. 확인 창이 한 번 더 뜹니다.</p>
  <div class="btns">
    ${btn('취소', { href: 'MG0401', cls: 'btn-ghost' })}
    ${btn('퇴사 처리하기', { cls: 'btn-dan', attr: ' data-modal="mLeave"' })}
  </div>`, { cls: 'mt6' })}

${modal('mLeave', '계정을 비활성화할까요?', `
  <p><b>${대상.nm} 선생님은 오늘부터 로그인할 수 없습니다.</b></p>
  ${banner('info', '📓', `<b>알림장 ${알림장수}건 · 관찰 기록 ${기록수}건은 그대로 남습니다.</b>
    <div class="t-sub mt2">보호자가 받은 알림장의 담당 선생님 이름도 그대로예요.</div>`, { cls: 'mt4' })}
  <div class="mt4">${check(`${맡은반.map((c) => c.nm).join(' · ')} ${맡은인원}마리를 다른 선생님께 넘겼습니다`, { attr: ' data-unlock="leaveBtn"' })}</div>`,
  `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('비활성화', { cls: 'btn-dan', id: 'leaveBtn', off: true, attr: ` data-notify="${esc(대상.nm)} 선생님의 계정을 비활성화했어요 — 과거 기록은 그대로 남습니다" data-dismiss` })}`)}

<div class="btns mt8">
  ${btn('직원·계정 관리로 돌아가기', { href: 'MG0401', cls: 'btn-ghost' })}
  ${btn('권한 변경', { href: 'MG0403', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   MG0502 운영자 로그인 > 로그인 오류
   ⛔ solo — «아직 아무도 아닌» 화면이다. 사이드바도 계정 줄도 걸지 않는다.
      비로그인 화면인데 헤더가 「김보육 선생님」이면 손님이 먼저 알아챈다.
   ============================================================ */
P['MG0502'] = (ctx) => {
  const 실패 = 3, 잠금 = 5;
  const 계정 = STAFF.find((s) => s.nm === '이도윤').email;   // 지어낸 주소를 쓰지 않는다

  const 비번틀림 = `
    ${banner('dan', '⛔', `<b>이메일 또는 비밀번호가 올바르지 않습니다.</b>
      <div class="t-sub mt2">둘 중 무엇이 틀렸는지는 알려드리지 않습니다 — 남의 계정을 찾아보는 것을 막기 위해서예요.</div>`)}
    <div class="mt4">
      ${field('이메일', input({ type: 'email', v: 계정, cls: 'is-err' }), { req: true })}
      ${field('비밀번호', input({ type: 'password', ph: '비밀번호', cls: 'is-err' }), { req: true, err: `${실패}번 틀렸습니다 · ${잠금 - 실패}번 더 틀리면 계정이 잠깁니다` })}
    </div>
    <div class="row-b mt4 mb6">
      ${check('로그인 상태 유지', { on: true })}
      <a class="more" href="${link('MG0503')}">비밀번호를 잊으셨나요?</a>
    </div>
    ${btn('다시 로그인', { href: 'AT0101', cls: 'btn-pri', w: true, lg: true })}
    <p class="t-sub mt4">대소문자와 앞뒤 빈칸을 한 번 살펴봐 주세요. 원장님이 보낸 임시 비밀번호는 첫 로그인 뒤에는 쓸 수 없습니다.</p>`;

  const 잠김 = `
    ${banner('dan', '🔒', `<b>${잠금}번 틀려 계정이 잠겼습니다.</b>
      <div class="t-sub mt2">10분 뒤에 다시 시도할 수 있어요. 급하시면 아래 방법이 더 빠릅니다.</div>`)}
    <div class="mt4">${kv([
    ['잠긴 계정', '<span class="t-sub">' + esc(계정) + '</span>'],
    ['풀리는 때', '마지막 시도로부터 10분 뒤'],
    ['바로 푸는 법', '비밀번호를 새로 정하거나, 원장님께 초기화를 부탁하세요'],
  ])}</div>
    <div class="btns-v mt6">
      ${btn('비밀번호 새로 정하기', { href: 'MG0503', cls: 'btn-pri', w: true })}
      ${btn('원장님께 초기화 부탁하기', { cls: 'btn-ghost', w: true, attr: ` data-toast="원장님께 초기화 요청을 보냈어요 — ${esc(SITE.tel)} 로 전화하셔도 됩니다"` })}
    </div>
    <p class="t-sub mt4">${esc(SITE.name)} ${esc(SITE.tel)} · ${esc(SITE.email)}</p>`;

  const body = solo(
    `${SITE.mark} 원 운영진 로그인`,
    '로그인하지 못했습니다 — 까닭을 나눠 적었어요',
    `${tabBox(
      [{ label: '비밀번호 오류', pane: 'pw' }, { label: '계정 잠김', pane: 'lock' }],
      `${pane('pw', 비번틀림, true)}${pane('lock', 잠김)}`,
      0,
      { pill: true },
    )}
    <div class="center mt6">
      <p class="t-sub">보호자이신가요?</p>
      <div class="btns mt3" style="justify-content:center">
        ${btn('보호자 화면으로 가기', { href: 'HO0101', cls: 'btn-ghost' })}
        ${btn('운영자 로그인으로', { href: 'MG0501', cls: 'btn-ghost' })}
      </div>
    </div>`,
  );

  return { body, o: { solo: true, bare: true } };
};

/* ============================================================
   MG0503 운영자 로그인 > 비밀번호 찾기
   ============================================================ */
P['MG0503'] = (ctx) => {
  const body = solo(
    '🔑 비밀번호 찾기',
    '가입하신 이메일로 재설정 링크를 보내드립니다',
    `${field('가입 이메일', input({ type: 'email', ph: 'name@dogmaru.kr' }), { req: true, hint: `${esc(SITE.name)} 운영진 계정으로 등록된 주소를 적어 주세요` })}
    ${btn('재설정 링크 보내기', { cls: 'btn-pri', w: true, lg: true, attr: ' data-notify="재설정 링크를 보냈어요 — 메일함을 확인해 주세요. 링크는 30분 동안 쓸 수 있습니다"' })}

    ${banner('info', '⏱', `<b>링크는 30분 동안만 쓸 수 있습니다.</b>
      <div class="t-sub mt2">시간이 지나면 이 화면에서 다시 보내시면 됩니다. 링크를 누르면 새 비밀번호를 직접 정하십니다.</div>`, { cls: 'mt6' })}

    <div class="mt6">
      ${btn('메일이 오지 않으면 ▾', { cls: 'btn-sub', sm: true, w: true, attr: ' data-more-toggle="pwHelp" data-more-label="메일이 오지 않으면 ▾"' })}
      <div data-more-body="pwHelp" hidden class="mt4">
        ${kv([
      ['1. 스팸함', '<span class="t-sub">메일이 스팸함으로 들어가는 일이 가장 많습니다</span>'],
      ['2. 다른 주소', '<span class="t-sub">가입하실 때 쓴 주소가 아닐 수 있어요</span>'],
      ['3. 원장님께', `<span class="t-sub">${esc(SITE.tel)} 로 전화하시면 임시 비밀번호를 새로 보내드립니다</span>`],
    ])}
      </div>
    </div>

    <div class="center mt6">
      <div class="btns" style="justify-content:center">
        ${btn('운영자 로그인으로', { href: 'MG0501', cls: 'btn-ghost' })}
        ${btn('보호자 화면으로', { href: 'HO0101', cls: 'btn-ghost' })}
      </div>
    </div>
    <div class="center mt6"><p class="t-sub">${esc(SITE.tel)} · ${esc(SITE.email)}</p></div>`,
  );

  return { body, o: { solo: true, bare: true } };
};

/* ============================================================
   MG0504 운영자 로그인 > 최초 로그인 비밀번호 변경
   ⛔ 규칙을 «다» 채워야 「변경」 단추가 열린다 —
      data-agree-scope + data-agree + data-unlock-all 로 실제로 잠근다.
   ============================================================ */
P['MG0504'] = (ctx) => {
  const body = solo(
    '🔑 새 비밀번호 설정',
    '임시 비밀번호로 처음 들어오셨어요 — 비밀번호를 바꿔야 다음으로 갈 수 있습니다',
    `${banner('warn', '🕐', `<b>원장님이 보낸 임시 비밀번호는 지금부터 쓸 수 없게 됩니다.</b>
      <div class="t-sub mt2">이 화면을 건너뛸 수 없습니다. 새 비밀번호를 정하셔야 등원 현황판으로 들어갑니다.</div>`)}

    <div class="mt6">
      ${field('임시 비밀번호', input({ type: 'password', ph: '메일로 받은 비밀번호' }), { req: true })}
      ${field('새 비밀번호', input({ type: 'password', ph: '8자 이상' }), { req: true })}
      ${field('새 비밀번호 확인', input({ type: 'password', ph: '한 번 더' }), { req: true })}
    </div>

    ${box(`
      <div class="t-card mb3">아래 세 가지를 모두 확인해 주세요</div>
      ${check('8자 이상으로 정했습니다', { attr: ' data-agree' })}
      ${check('영문·숫자·특수문자를 모두 넣었습니다', { attr: ' data-agree' })}
      ${check('임시 비밀번호와 다른 비밀번호입니다', { attr: ' data-agree' })}
      <div class="row-b mt3">
        ${check('세 가지를 모두 확인했어요', { attr: ' data-agree-all' })}
      </div>
      <div class="t-sub mt3" data-unlock-all="pwSave">세 가지를 모두 확인하시면 아래 단추가 열립니다.</div>`,
      { attr: ' data-agree-scope', cls: 'mt6' })}

    <div class="mt6">${btn('바꾸고 시작하기', { href: 'AT0101', id: 'pwSave', off: true, cls: 'btn-pri', w: true, lg: true })}</div>

    ${banner('info', '🔒', `<b>비밀번호는 원장님도 볼 수 없습니다.</b>
      <div class="t-sub mt2">잊으셨을 때는 비밀번호 찾기로 새로 정하시면 됩니다. 원장님은 임시 비밀번호를 다시 보내드릴 수만 있어요.</div>`, { cls: 'mt6' })}

    <div class="center mt6">
      <div class="btns" style="justify-content:center">
        ${btn('비밀번호 찾기', { href: 'MG0503', cls: 'btn-ghost' })}
        ${btn('운영자 로그인으로', { href: 'MG0501', cls: 'btn-ghost' })}
      </div>
    </div>`,
  );

  return { body, o: { solo: true, bare: true } };
};
