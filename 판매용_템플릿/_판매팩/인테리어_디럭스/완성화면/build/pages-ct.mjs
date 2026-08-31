/* CT 계약·결제 (4) — 확정 견적에 서명하고 돈을 나누어 낸다 */
import * as U from './ui.mjs';
import { CONTRACT_TERMS, PAY_SCHEDULE, 계약총액 } from './data.mjs';

export const PAGES = {};

PAGES['CT-01'] = () => ({
  body: `${U.pageHd('계약서 확인·서명', '')}

${U.box(`<div class="t-card">실측으로 금액이 이렇게 바뀌었어요</div>
  ${U.table(['', '금액'], [['처음 견적', '<span class="num">32,400,000원</span>'], ['확정 견적', '<span class="num">34,100,000원</span>'], ['차이', '<span class="num acc">+1,700,000원</span>']])}
  <ul class="stack mt3"><li>· 배관 노후로 교체 (+850,000원)</li><li>· 단열 보강 (+520,000원)</li><li>· 폐기물 증가 (+330,000원)</li></ul>`)}

${U.sec('계약서 조항', U.accordion(CONTRACT_TERMS.map((c) => ({
    q: c.t,
    a: `<p style="color:var(--text);font-weight:600">쉽게 말하면 — ${c.s}</p><p class="mt2">${c.full}</p>`,
  })), 2), { cls: 'mt8' })}

${U.sec('첨부', `<div class="g3">
  ${U.box(`${U.ph(['평면 도면', 800, 600], { seed: 'plan' })}<div class="t-sub mt2">평면 도면 <a class="more">크게 보기</a></div>`)}
  ${U.box(`${U.ph(['자재 목록', 800, 600], { seed: 'materials' })}<div class="t-sub mt2">자재 목록 <a class="more">크게 보기</a></div>`)}
  ${U.box(`${U.ph(['공정표', 800, 600], { seed: 'schedule' })}<div class="t-sub mt2">공정표 <a class="more">크게 보기</a></div>`)}
</div>`, { cls: 'mt8' })}

${U.sec('대금 지급', U.table(['회차', '금액', '예정일'], PAY_SCHEDULE(계약총액).map((p) => [p.nm, `<span class="num">${U.won(p.amt)}</span>`, p.date])), { cls: 'mt8' })}

${U.sec('서명', U.sigPad(), { cls: 'mt8' })}

<div data-agree-scope>
<div class="stack mt4">
  ${U.check('계약 조건에 동의합니다', { attr: ' data-agree' })}
  ${U.check('개인정보 처리에 동의합니다', { attr: ' data-agree' })}
  ${U.check('전자서명에 동의합니다', { attr: ' data-agree' })}
  <button class="btn btn-ghost btn-sm" type="button" data-agree-all style="width:fit-content">전체 동의</button>
</div>

<div class="mt8">${U.btn('계약하고 계약금 결제', { cls: 'btn-pri btn-w', id: 'btn-ct', off: true, href: 'CT-02', attr: ' data-unlock-all="btn-ct"' })}</div>
</div>

<div class="mt8">${U.btn('계약서 PDF 내려받기', { attr: ' data-toast="PDF를 내려받았어요"' })}</div>`,
});

PAGES['CT-02'] = () => {
  const sched = PAY_SCHEDULE(계약총액);
  return {
    body: `${U.pageHd('계약금 결제', '')}

<div class="box"><div class="t-page pri">계약금 ${U.won(sched[0].amt)}</div></div>

${U.sec('대금 단계', U.steps(sched.map((p) => [`${p.nm} ${p.date === '오늘' ? '' : `<span class="dt">${p.date}</span>`}`]), 0), { cls: 'mt6' })}

${U.tabBox(
      [{ label: '신용카드', pane: 'card' }, { label: '계좌이체', pane: 'bank' }, { label: '무통장입금', pane: 'none' }],
      `${U.pane('card', `
        <div class="field mt4"><span class="lb">카드사</span>${U.select(['국민카드', '신한카드', '삼성카드', '현대카드'])}</div>
        ${/* ⚠ 할부 개월을 골라도 월 납입액이 그대로였다(2026-08-18).
              acts: 「할부 개월 고르기 → 옆에 월 납입액이 계산되어 뜬다」 */''}
        <div class="field"><span class="lb">할부 개월</span>${U.select(['일시불', '3개월', '6개월(무이자)'], 0, { attr: ` data-halbu data-amt="${sched[0].amt}"` })}</div>
        <p class="t-sub" data-halbu-out>일시불 — ${U.won(sched[0].amt)}을 한 번에 냅니다</p>
      `, true)}
       ${U.pane('bank', `<div class="field mt4"><span class="lb">은행</span>${U.select(['국민은행', '신한은행'])}</div>`)}
       ${U.pane('none', `<div class="box mt4"><div class="t-card">국민은행 123456-01-123456 (주)집짓다</div></div>`)}`,
      0,
    )}

<div class="stack mt4">${U.check('현금영수증 발급', { none: true })}${U.check('세금계산서 발급', { none: true })}</div>

${U.detail2(
      '',
      U.card('확인 요약', `${U.kv([['현장', '성동구 왕십리로 000'], ['총 계약금액', `<span class="num">${U.won(계약총액)}</span>`], ['이번 결제액', `<span class="num">${U.won(sched[0].amt)}</span>`]])}<p class="t-sub mt3">다음 결제는 9월 10일 착공금 ${U.won(sched[1].amt)}</p>`),
    )}

${U.banner('info', 'ℹ', '공사 전 계약금은 10%를 넘지 않습니다.', { cls: 'mt6' })}

<div class="mt8">${U.btn(`${U.won(sched[0].amt)} 결제하기`, { cls: 'btn-pri btn-w btn-lg', href: 'CT-03' })}</div>`,
  };
};

PAGES['CT-03'] = () => {
  const sched = PAY_SCHEDULE(계약총액);
  return {
    body: `${U.done('계약이 성사됐어요', '계약번호 CTR-20260817-0018',
      `${U.card('', `${/* ⚠ 착공일을 골라도 위 안내 문구가 그대로였다(2026-08-18).
              acts: 「착공일 고르기 → 고르면 위 안내 문구의 날짜가 바뀐다」 */''}
        <p class="t-card">이제 공사가 시작됩니다 — 착공 예정일 <b data-chakgong-out>9월 8일 (화)</b></p>
        <div class="field mt4"><span class="lb">착공일 고르기</span>${U.select(['9월 8일 (화)', '9월 9일 (수)', '9월 10일 (목)'], 0, { attr: ' data-chakgong' })}</div>
        <p class="t-sub">착공일 5일 전까지는 바꾸실 수 있어요.</p>
        <div class="btns mt4">${U.btn('계약서 내려받기', { attr: ' data-toast="내려받았어요"' })}${U.btn('영수증 보기', { attr: ' data-modal="m-receipt"' })}</div>`)}

      ${U.sec('남은 대금 일정', U.table(['회차', '금액', '예정일', '상태'], sched.slice(1).map((p) => [p.nm, `<span class="num">${U.won(p.amt)}</span>`, p.date, U.badge('예정', 'b-mut')])), { cls: 'mt8' })}

      ${U.sec('착공 전에 준비해 주세요', `<div class="stack">${['짐 빼기', '관리사무소에 공사 신고', '엘리베이터 사용 예약', '이웃에 인사'].map((t) => U.check(t, { none: true })).join('')}</div>`, { cls: 'mt8' })}`,
      `${U.card('현장 소장', `<div class="row" style="gap:var(--sp-card-pad)">${U.av('김')}<div><div class="t-card">김현장 소장</div><div class="t-sub">매일 저녁 사진으로 알려 드려요</div><div class="t-sub">010-0000-0001</div></div></div>`)}
      ${U.btn('공사 진행 보기', { cls: 'btn-pri btn-w btn-lg', href: 'PR-01' })}`,
    )}

    ${U.modal('m-receipt', '결제 상세 내역', U.table(['항목', '금액'], [['계약금', `<span class="num">${U.won(sched[0].amt)}</span>`], ['부가세', '별도']]), U.btn('닫기', { attr: ' data-dismiss' }))}`,
  };
};

PAGES['CT-04'] = () => ({
  body: `${U.pageHd('결제 실패', '')}

<div class="box">
  <div class="t-card dan">결제가 되지 않았어요</div>
  <p class="strong mt2">결제 금액은 빠져나가지 않았습니다</p>
</div>

${U.box(`<div class="row-b"><span>카드 한도를 넘었습니다 (코드 F-2201)</span><a class="more">자세히</a></div>`, { cls: 'mt6' })}

${U.sec('이렇게 해 보세요', `<ul class="stack"><li>· 한도를 확인하고 다시 시도</li><li>· 다른 카드로 결제</li><li>· 계좌이체로 결제</li></ul>`, { cls: 'mt8' })}

<div class="btns mt6">${U.btn('다시 시도하기', { cls: 'btn-pri', href: 'CT-02' })}${U.btn('다른 수단으로 내기', { href: 'CT-02' })}</div>

${U.banner('info', 'ℹ', '계약은 아직 살아 있어요. 8월 20일까지 결제하시면 됩니다.', { cls: 'mt6' })}

${U.sec('무통장입금으로 바꾸기', `${U.box('국민은행 123456-01-123456 (주)집짓다')}`, { cls: 'mt6' })}

<div class="mt8">${U.btn('전화 상담', { cls: 'btn-ghost', attr: ' data-toast="전화 상담으로 연결합니다"' })} <span class="t-sub">평일 10:00~19:00</span></div>`,
});
