/* OR 주문·매출 (4) */
import * as U from './ui.mjs';
import { ORDERS, CUSTOMERS } from './data.mjs';

export const PAGES = {};

const 총매출 = ORDERS.filter((o) => o.st !== '환불').reduce((a, o) => a + o.amt, 0);
const 환불액 = ORDERS.filter((o) => o.st === '환불').reduce((a, o) => a + o.amt, 0) + 14_000;

const 필터 = () => U.card('필터', `
  ${U.field('기간', U.select(['최근 7일', '오늘', '이번 달', '지난 달', '직접 지정'], 0))}
  ${U.field('상태', `<div class="stack">${['결제완료', '배송중', '완료', '취소', '환불'].map((s) => U.check(s, { on: true, none: true })).join('')}</div>`)}
  ${U.field('결제수단', U.select(['전체', '카드', '간편결제', '현금', '계좌이체'], 0))}
  <div class="btns-v mt6">
    ${U.btn('필터 적용', { cls: 'btn-pri', w: true, attr: ' data-toast="필터를 적용했어요"' })}
    ${U.btn('초기화', { w: true, href: 'OR-01' })}
  </div>`);

PAGES['OR-01'] = () => ({
  body: `${U.pageHd('주문 목록', '2026.08.04 ~ 08.10',
    `${U.btn('엑셀 내보내기', { attr: ' data-toast="주문 목록을 엑셀로 내려받았어요" data-toast-kind="ok"' })}`)}

${U.listPage(필터(), `
  ${U.statRow([
    [`${ORDERS.length}건`, '총 주문'],
    [U.won(총매출), '총 매출'],
    [U.won(환불액), '환불액', { cls: 'warn' }],
    [U.won(Math.round(총매출 / ORDERS.length / 1000) * 1000), '평균 결제액'],
  ], 'g4 mb6')}

  <div class="filters">
    <input class="in search" type="search" placeholder="주문번호 또는 고객명으로 검색">
    ${U.btn('검색', { attr: ' data-toast="검색했어요"' })}
    ${U.btn('상태 일괄 변경', { attr: ' data-modal="m-bulk"' })}
    ${U.btn('결과 없을 때', { sm: true, href: 'OR-04' })}
  </div>

  ${U.table(
    [{ t: '<input type="checkbox" aria-label="전체 선택">', w: '34px', cls: 'c' },
     { t: '주문번호', w: '128px' }, { t: '일시', w: '124px' }, '고객', '상품',
     { t: '금액', w: '96px', cls: 'r nowrap' }, { t: '결제수단', w: '78px' }, { t: '상태', w: '76px' }],
    ORDERS.map((o) => ({
      href: 'OR-02',
      cls: o.st === '환불' ? 'warn' : '',
      cells: [
        { t: `<input type="checkbox" aria-label="${o.id} 선택">`, cls: 'c' },
        `<span class="num strong">${o.id}</span>`, `<span class="num sub">${o.at}</span>`, o.nm, o.sum,
        { t: `<span class="num">${U.won(o.amt)}</span>`, cls: 'r nowrap' }, o.pay, U.stBadge(o.st),
      ],
    })),
    { foot: ['', '합계', '', '', `${ORDERS.length}건`, { t: U.won(총매출), cls: 'r' }, '', ''] },
  )}

  <div class="row-b mt6">
    <span class="t-sub">1–${ORDERS.length} / ${ORDERS.length}건</span>
    <div class="btns">${U.btn('‹ 이전', { sm: true, off: true })}${U.btn('1', { sm: true, cls: 'btn-pri' })}${U.btn('다음 ›', { sm: true, off: true })}</div>
  </div>`)}

${U.modal('m-bulk', '고른 주문의 상태를 바꿉니다',
  `<p class="t-sub mb4">2건이 선택되어 있습니다.</p>
   ${U.field('바꿀 상태', U.select(['배송중', '완료', '취소'], 1))}
   ${U.check('고객에게 상태 변경 안내를 보냅니다', { on: true })}`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('바꾸기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="2건의 상태를 바꿨어요" data-toast-kind="ok"' })}`)}`,
});

PAGES['OR-02'] = () => {
  const o = ORDERS[0];
  const 품목 = [
    { nm: '뿌리 염색', opt: '중간 길이', qty: 1, price: 72_000 },
    { nm: '홈케어 샴푸 300ml', opt: '건성용', qty: 1, price: 28_000 },
  ];
  const 소계 = 품목.reduce((a, i) => a + i.price * i.qty, 0);
  return {
    body: `${U.pageHd(`주문 ${o.id}`, `${o.at} · ${o.nm}`, U.btn('영수증 발행', { attr: ' data-toast="영수증을 발행했어요" data-toast-kind="ok"' }))}

${U.steps([['주문', '08-10 14:20'], ['결제', '08-10 14:22'], ['처리', '진행 중'], ['완료', '']], 2)}

${U.detail2(`
  ${U.card('주문 상품', `${U.table(
    ['상품', '옵션', { t: '수량', w: '54px', cls: 'c' }, { t: '단가', w: '90px', cls: 'r nowrap' }, { t: '소계', w: '96px', cls: 'r nowrap' }],
    품목.map((i) => [i.nm, `<span class="muted">${i.opt}</span>`,
      { t: `<span class="num">${i.qty}</span>`, cls: 'c' },
      { t: `<span class="num">${U.won(i.price)}</span>`, cls: 'r nowrap' },
      { t: `<span class="num">${U.won(i.price * i.qty)}</span>`, cls: 'r nowrap' }]),
  )}`, { cls: 'mt8' })}

  ${U.card('결제 정보', U.kv([
    ['결제수단', `${o.pay} <span class="muted">(신한 1234)</span>`],
    ['승인번호', '<span class="num">30284471</span>'],
    ['상품 금액', `<span class="num">${U.won(소계)}</span>`],
    ['할인', `<span class="num">-0원</span>`],
    ['쿠폰', '<span class="muted">사용 안 함</span>'],
    ['결제 금액', `<b class="num">${U.won(o.amt)}</b>`],
  ], { cls: 'left' }), { cls: 'mt6' })}

  ${U.card('수령 정보', U.kv([
    ['수령 방법', '매장 방문'],
    ['방문 일시', '<span class="num">2026-08-10 10:00</span>'],
    ['연락처', '<span class="num">010-2847-1130</span>'],
  ], { cls: 'left' }), { cls: 'mt6' })}

  ${U.card('관리자 메모', `${U.textarea({ ph: '이 주문에 대해 남길 말' })}
    <div class="btns mt4">${U.btn('메모 저장', { attr: ' data-toast="메모를 저장했어요" data-toast-kind="ok"' })}</div>`, { cls: 'mt6' })}`, `
  ${U.card('고객', U.kv([
    ['이름', `<b>${o.nm}</b>`],
    ['연락처', '<span class="num">010-2847-1130</span>'],
    ['등급', U.stBadge(CUSTOMERS[0].gr)],
  ]), { ft: U.btn('고객 상세 보기', { href: 'CU-02', w: true }) })}

  ${U.card('상태 변경', `<div class="btns-v">
    ${U.btn('배송중으로', { w: true, attr: ' data-toast="배송중으로 바꿨어요"' })}
    ${U.btn('완료 처리', { cls: 'btn-pri', w: true, attr: ' data-toast="완료로 바꿨어요" data-toast-kind="ok"' })}
    ${U.btn('환불 처리', { cls: 'btn-dan', w: true, href: 'OR-03' })}
  </div>`)}

  ${U.card('서류', `<div class="btns-v">
    ${U.btn('영수증 발행', { w: true, attr: ' data-toast="영수증을 발행했어요" data-toast-kind="ok"' })}
    ${U.btn('거래명세서 발행', { w: true, attr: ' data-toast="명세서를 발행했어요" data-toast-kind="ok"' })}
  </div>`)}`)}`,
  };
};

PAGES['OR-03'] = () => ({
  body: `${U.pageHd('환불 처리', '주문 20260810-0031 · 김서연 · 100,000원')}

<div class="split-r">
  <div>
    ${U.banner('warn', '⚠', '환불은 <b>되돌릴 수 없습니다.</b> 금액과 품목을 다시 확인해 주세요.')}

    ${U.card('환불 유형', `
      <div class="stack">
        ${U.check('전체 환불 — 100,000원 전부', { none: true })}
        ${U.check('부분 환불 — 품목과 금액을 골라서', { on: true, none: true })}
      </div>`, { cls: 'mt6' })}

    ${U.card('환불할 품목', U.table(
      [{ t: '<input type="checkbox" aria-label="전체 선택">', w: '34px', cls: 'c' }, '상품', { t: '결제액', w: '96px', cls: 'r nowrap' }, { t: '환불액', w: '128px' }],
      [
        [{ t: '<input type="checkbox" aria-label="뿌리 염색 선택">', cls: 'c' }, '뿌리 염색', { t: '<span class="num">72,000원</span>', cls: 'r nowrap' }, '<input class="in" type="text" value="0" aria-label="뿌리 염색 환불액">'],
        [{ t: '<input type="checkbox" checked aria-label="홈케어 샴푸 선택">', cls: 'c' }, '홈케어 샴푸 300ml', { t: '<span class="num">28,000원</span>', cls: 'r nowrap' }, '<input class="in" type="text" value="28,000" aria-label="샴푸 환불액">'],
      ],
    ), { cls: 'mt6' })}

    ${U.card('사유', `
      ${U.field('환불 사유', U.select(['고객 변심', '상품 불량', '서비스 불만', '중복 결제', '매장 사정'], 1), { req: true })}
      ${U.field('상세 사유', U.textarea({ ph: '무슨 일이 있었는지 적어 두세요. 나중에 통계와 활동 로그에 남습니다.' }), { req: true })}`, { cls: 'mt6' })}

    ${U.card('함께 처리할 것', `
      ${U.check('재고를 되돌립니다', { on: true, sub: '홈케어 샴푸 300ml 재고가 22 → 23 이 됩니다.' })}
      ${U.check('고객에게 환불 안내를 보냅니다', { on: true, sub: '알림톡으로 환불 금액과 예상 입금일을 안내합니다.' })}`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack">
    ${U.card('환불 요약', `
      ${U.sumRows([
        ['결제 금액', '<span class="num">100,000원</span>'],
        ['환불 품목', '1건'],
        ['이미 환불된 금액', '<span class="num">0원</span>'],
      ], ['최종 환불액', '<span class="num">28,000원</span>'])}
      ${U.banner('info', '💳', '<b>원결제수단(카드 신한 1234)</b> 으로 자동 환불됩니다. 카드사 사정에 따라 3~5영업일 걸립니다.', { cls: 'mt4' })}`, {
        ft: `${U.check('금액과 품목을 확인했습니다', { attr: ' data-unlock="doRefund"' })}
             <div class="mt4">${U.btn('환불 실행', { cls: 'btn-dan', w: true, id: 'doRefund', off: true, attr: ' data-modal="m-refund"' })}</div>
             <div class="mt3">${U.btn('주문 상세로 돌아가기', { href: 'OR-02', w: true })}</div>`,
      })}
  </div>
</div>

${U.modal('m-refund', '28,000원을 환불합니다',
  `<p>김서연 님의 <b>홈케어 샴푸 300ml</b> 결제액이 원결제수단으로 돌아갑니다.</p>
   <p class="t-sub mt4">되돌릴 수 없습니다. 환불 내역은 활동 로그에 남습니다.</p>`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('환불 확정', { cls: 'btn-dan', attr: ' data-dismiss data-toast="28,000원을 환불했어요" data-toast-kind="ok"' })}`)}`,
});

PAGES['OR-04'] = () => ({
  body: `${U.pageHd('주문 목록', '조건에 맞는 주문이 없습니다')}

${U.listPage(필터(), `
  ${U.banner('info', '🔍', '지금 걸려 있는 조건 — <b>기간 2026.08.01 ~ 08.03</b> · <b>상태 환불</b> · <b>결제수단 계좌이체</b>')}

  ${U.empty('▣', '이 조건에 맞는 주문이 없어요',
    '기간이 짧거나 상태 필터가 좁을 수 있어요. 아래 버튼으로 넓혀 보세요.',
    `${U.btn('필터 초기화', { cls: 'btn-pri', href: 'OR-01' })}${U.btn('전체 기간으로 보기', { href: 'OR-01' })}`)}

  ${U.card('이렇게 넓혀 보세요', `<div class="chips">
    ${['최근 30일', '최근 90일', '상태 전체', '결제수단 전체'].map((t) => `<button class="chip" type="button" data-go="${U.link('OR-01')}">${t}</button>`).join('')}
  </div>`, { cls: 'mt8' })}

  ${U.card('주문은 어디서 들어오나요?', `<ul class="stack">
    <li>· <b>매장 결제</b> — 방문한 손님을 직접 결제 처리한 것</li>
    <li>· <b>온라인 예약 선결제</b> — 예약하면서 미리 낸 것</li>
    <li>· <b>상품 주문</b> — 홈케어 제품 등 물건 주문</li>
  </ul>
  <p class="t-sub mt4">셋 다 이 목록에 함께 나옵니다. 결제수단 필터로 갈라 볼 수 있어요.</p>`, { cls: 'mt6' })}`)}`,
});
