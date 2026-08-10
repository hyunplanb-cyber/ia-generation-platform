/* BK 예약·일정 (4) */
import * as U from './ui.mjs';
import { BOOKINGS, STAFF, PRODUCTS, CUSTOMERS } from './data.mjs';

export const PAGES = {};

const 재직 = STAFF.filter((s) => s.st === '재직');
const 범례 = [['확정', 'ev-ok'], ['대기', 'ev-wait'], ['완료', 'ev-done'], ['노쇼', 'ev-no'], ['취소', 'ev-done']];
const 시간대 = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const EV = { 확정: 'ev-ok', 대기: 'ev-wait', 완료: 'ev-done', 노쇼: 'ev-no', 취소: 'ev-done' };

PAGES['BK-01'] = () => {
  /* 일 보기 — 직원별 열. 예약은 시작 시간대 칸에 넣는다. */
  const 칸 = (staff, tm) => {
    const b = BOOKINGS.find((x) => x.staff === staff && x.tm.startsWith(tm.slice(0, 2)));
    return `<div class="cell">${b ? `<a class="slot ${EV[b.st]}" href="${U.link('BK-02')}"><b>${b.nm}</b><br>${b.svc}</a>` : ''}</div>`;
  };
  return {
    body: `${U.pageHd('예약 캘린더', '2026년 8월 10일 (월) · 오늘 예약 6건',
      `${U.btn('예약 등록', { cls: 'btn-pri', href: 'BK-03' })}`)}

<div class="row-b wrap-row mb6">
  <div class="row">
    ${U.tabs([{ label: '일' }, { label: '주' }, { label: '월' }], 0, { pill: true })}
    <div class="cal-hd" style="margin:0">
      <button class="cal-mv" type="button" data-mv="-1" aria-label="이전 달">‹</button>
      <span class="cal-m">2026년 8월</span>
      <button class="cal-mv" type="button" data-mv="1" aria-label="다음 달">›</button>
    </div>
  </div>
  <div class="row">
    ${U.select(['직원 전체', ...재직.map((s) => s.nm)], 0)}
    ${U.select(['서비스 전체', ...PRODUCTS.filter((p) => p.cat !== '제품').map((p) => p.nm)], 0)}
  </div>
</div>

<div class="legend mb4">${범례.map(([t, c]) => `<span><i class="${c}" style="background:currentColor;opacity:.35"></i>${t}</span>`).join('')}</div>

${U.card('', `<div class="sched" style="grid-template-columns:56px repeat(${재직.length},minmax(0,1fr))">
  <div class="hd"></div>${재직.map((s) => `<div class="hd">${s.nm}</div>`).join('')}
  ${시간대.map((tm) => `<div class="tm">${tm}</div>${재직.map((s) => 칸(s.nm, tm)).join('')}`).join('')}
</div>
<p class="t-sub mt4">빈 시간대를 누르면 그 시간으로 예약 등록 화면이 열립니다.</p>`, {
      aside: U.btn('빈 시간에 예약 만들기', { sm: true, href: 'BK-03' }),
    })}

${U.sec('오늘 예약 목록', U.table(
  [{ t: '시간', w: '64px' }, { t: '소요', w: '54px' }, '고객', '서비스', '담당', { t: '상태', w: '68px' }, { t: '금액', w: '92px', cls: 'r nowrap' }],
  BOOKINGS.map((b) => ({
    href: 'BK-02',
    cells: [`<b class="num">${b.tm}</b>`, `<span class="num">${b.min}분</span>`, b.nm, b.svc, b.staff, U.stBadge(b.st), { t: U.won(b.amt), cls: 'r nowrap' }],
  })),
  { foot: ['합계', '', '', '', '', `${BOOKINGS.length}건`, { t: U.won(BOOKINGS.reduce((a, b) => a + b.amt, 0)), cls: 'r' }] },
), { cls: 'mt8' })}`,
  };
};

PAGES['BK-02'] = () => {
  const b = BOOKINGS[2];
  const c = CUSTOMERS.find((x) => x.nm === b.nm);
  return {
    body: `${U.pageHd(`${b.nm} · ${b.svc}`, `${b.id} · 2026-08-10 ${b.tm} · ${b.min}분 · 담당 ${b.staff}`,
      `${U.btn('알림 보내기', { href: 'MK-01' })}${U.btn('예약 변경', { cls: 'btn-pri', href: 'BK-03' })}`)}

${U.detail2(`
  ${U.card('예약 내용', `
    ${U.kv([
      ['예약 일시', `<b class="num">2026-08-10 ${b.tm}</b> (${b.min}분)`],
      ['서비스', b.svc],
      ['담당 직원', b.staff],
      ['금액', `<b>${U.won(b.amt)}</b>`],
      ['현재 상태', U.stBadge(b.st)],
    ], { cls: 'left' })}`)}

  ${U.card('고객 요청사항', `
    <p>“앞머리는 짧게 자르지 말아 주세요. 두피가 예민해서 약이 닿으면 따가워요.”</p>
    ${U.textarea({ ph: '관리자 메모를 남겨 두세요' })}
    <div class="btns mt4">${U.btn('메모 저장', { attr: ' data-toast="메모를 저장했어요" data-toast-kind="ok"' })}</div>`, { cls: 'mt6' })}

  ${U.card('처리 이력', U.timeline([
    { k: 'on', t: '예약 대기 — 확정을 기다립니다', d: '2026-08-09 21:14 · 온라인 예약' },
    { k: 'done', t: '예약 요청 접수', d: '2026-08-09 21:12 · 고객 직접 예약' },
  ]), { cls: 'mt6' })}`, `
  ${U.card('고객', `
    ${U.kv([
      ['이름', `<b>${c.nm}</b>`],
      ['연락처', `<span class="num">${b.tel}</span>`],
      ['등급', U.stBadge(c.gr)],
      ['노쇼 이력', `<span class="num">1회</span> <span class="muted">(2026-03)</span>`],
    ])}`, { ft: U.btn('고객 상세 보기', { href: 'CU-02', w: true }) })}

  ${U.card('상태 변경', `<div class="btns-v">
    ${U.btn('확정으로 바꾸기', { cls: 'btn-pri', w: true, attr: ' data-toast="예약을 확정했어요. 고객에게 확정 알림이 갑니다" data-toast-kind="ok"' })}
    ${U.btn('완료 처리', { w: true, attr: ' data-toast="완료로 바꿨어요"' })}
    ${U.btn('노쇼 처리', { w: true, attr: ' data-toast="노쇼로 기록했어요"' })}
    ${U.btn('예약 취소', { cls: 'btn-dan', w: true, attr: ' data-modal="m-cancel"' })}
  </div>`)}

  ${U.card('알림 발송', `<div class="btns-v">
    ${U.btn('확정 안내 보내기', { w: true, attr: ' data-toast="확정 안내를 보냈어요" data-toast-kind="ok"' })}
    ${U.btn('하루 전 리마인드 예약', { w: true, attr: ' data-toast="8/9 18:00에 보내도록 예약했어요" data-toast-kind="ok"' })}
  </div>
  <p class="t-sub mt3">문구는 <a href="${U.link('MK-04')}"><b>템플릿 관리</b></a>에서 바꿉니다.</p>`)}`)}

${U.modal('m-cancel', '예약을 취소할까요?',
  `<p>${b.nm} 님의 <b>${b.svc}</b>(8/10 ${b.tm}) 예약이 취소됩니다.</p>
   ${U.field('취소 사유', U.select(['고객 요청', '매장 사정', '중복 예약', '연락 두절'], 0))}
   ${U.check('고객에게 취소 안내를 보냅니다', { on: true })}`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('취소 확정', { cls: 'btn-dan', attr: ' data-dismiss data-toast="예약을 취소했어요"' })}`)}`,
  };
};

PAGES['BK-03'] = () => ({
  body: `${U.pageHd('예약 등록', '고객과 서비스를 고르면 소요시간과 금액이 자동으로 채워집니다.')}

<div class="split-r">
  <div>
    ${U.card('고객', `
      ${U.field('고객 검색', `<div class="in-row">${U.input({ ph: '이름 또는 연락처' })}${U.btn('찾기', { attr: ' data-toast="고객을 찾았어요"' })}</div>`, { req: true })}
      <div class="row-b">
        <span class="t-sub">처음 오신 분인가요?</span>
        ${U.btn('신규 고객 즉시 등록', { sm: true, href: 'CU-03' })}
      </div>
      ${U.banner('ok', '✓', '<b>한소영</b> (010-7745-2098 · VIP) 선택됨 — 노쇼 이력 1회', { cls: 'mt6' })}`)}

    ${U.card('서비스와 담당', `
      <div class="f2">
        ${U.field('서비스', U.select(PRODUCTS.filter((p) => p.cat !== '제품').map((p) => `${p.nm} (${p.price.toLocaleString('ko-KR')}원)`), 2), { req: true })}
        ${U.field('담당 직원', U.select(STAFF.filter((s) => s.st === '재직').map((s) => `${s.nm} (${s.role})`), 0), { req: true })}
      </div>
      ${U.banner('info', '⏱', '소요시간 <b>150분</b> · 금액 <b>148,000원</b> — 고른 서비스에서 자동으로 채웠습니다.')}`, { cls: 'mt6' })}

    ${U.card('날짜와 시간', `
      <div class="f2">
        ${U.field('날짜', U.input({ type: 'date', v: '2026-08-10' }), { req: true })}
        ${U.field('시작 시간', U.select(['10:00', '11:30 (예약 있음)', '13:00', '15:30', '17:00'], 2), { req: true, hint: '고른 직원이 비어 있는 시간만 열립니다.' })}
      </div>
      ${U.check('매주 같은 시간으로 반복', { sub: '4회까지 한 번에 잡습니다. 겹치는 날은 건너뜁니다.' })}
      ${U.banner('warn', '⚠', '<b>13:00~15:30</b> 은 박지우 님의 다른 예약과 겹칩니다.', {
        cls: 'mt4', right: U.btn('겹침 확인', { sm: true, href: 'BK-04' }),
      })}`, { cls: 'mt6' })}

    ${U.card('요청사항', U.textarea({ ph: '고객이 남긴 요청이나 주의할 점' }), { cls: 'mt6' })}
  </div>

  <div class="sticky stack">
    ${U.card('예약 요약', `
      ${U.sumRows([
        ['고객', '한소영 (VIP)'],
        ['서비스', '볼륨 매직 (중단발)'],
        ['담당', '박지우'],
        ['일시', '8/10 (월) 13:00'],
        ['소요', '150분'],
      ], ['결제 예정액', U.won(148_000)])}`, {
        ft: `${U.check('저장하면 확정 알림을 보냅니다', { on: true, none: true })}
             <div class="mt4">${U.btn('예약 저장', { cls: 'btn-pri', w: true, attr: ' data-toast="예약을 저장했어요. 확정 알림을 보냈습니다" data-toast-kind="ok"' })}</div>
             <div class="mt3">${U.btn('취소', { href: 'BK-01', w: true })}</div>`,
      })}
    ${U.card('겹침 확인', `<p class="t-sub">고른 직원·시간에 다른 예약이 있으면 저장 전에 알려 드립니다.</p>
      <div class="mt3">${U.btn('충돌 화면 보기', { sm: true, href: 'BK-04', w: true })}</div>`)}
  </div>
</div>`,
});

PAGES['BK-04'] = () => ({
  body: `${U.pageHd('예약 불가 — 시간이 겹칩니다', '고른 시간에 이미 다른 예약이 있어요.')}

<div style="max-width:760px">
  ${U.banner('dan', '✕', '<b>박지우</b> 님의 <b>8/10 13:00~15:30</b> 은 이미 찬 시간입니다.')}

  ${U.card('겹치는 기존 예약', U.table(['시간', '고객', '서비스', '상태'], [
    { href: 'BK-02', cells: ['<b class="num">13:00~15:30</b>', '한소영', '볼륨 매직 (중단발)', U.stBadge('대기')] },
  ]), { cls: 'mt6' })}

  ${U.card('박지우 님의 가까운 빈 시간', `<div class="chips">
    ${['10:00', '15:30', '17:00', '18:30'].map((t) => `<button class="chip" type="button" data-go="${U.link('BK-03')}">8/10 ${t}</button>`).join('')}
  </div>
  <p class="t-sub mt3">누르면 그 시간으로 예약 등록 화면이 열립니다.</p>`, { cls: 'mt6' })}

  ${U.card('같은 시간에 가능한 다른 직원', U.table(['직원', '역할', '13:00 가능', ''], [
    ['최민서', '디자이너', U.badge('가능', 'b-ok'), U.btn('이 직원으로', { sm: true, href: 'BK-03' })],
    ['김도윤', '디자이너', U.badge('가능', 'b-ok'), U.btn('이 직원으로', { sm: true, href: 'BK-03' })],
  ]), { cls: 'mt6' })}

  ${U.card('그래도 이 시간에 넣고 싶다면', `
    ${U.check('대기 예약으로 등록합니다', { sub: '앞 예약이 취소되면 자동으로 확정 후보가 됩니다. 고객에게는 「대기」로 안내됩니다.', attr: ' data-unlock="wait"' })}
    <div class="mt4">${U.btn('대기 예약으로 등록', { cls: 'btn-pri', id: 'wait', off: true, attr: ' data-toast="대기 예약으로 넣었어요" data-toast-kind="ok"' })}</div>`, { cls: 'mt6' })}

  <div class="btns mt8">${U.btn('시간 다시 고르기', { cls: 'btn-pri', href: 'BK-03' })}${U.btn('캘린더로', { href: 'BK-01' })}</div>
</div>`,
});
