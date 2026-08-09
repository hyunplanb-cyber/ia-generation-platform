/* JO 참여·결제 13장 · MY 내 공구함 12장
   부모 화면에 상태를 붙여 3뎁스를 만든다. 바뀐 자리만 바꾸고 나머지는 그대로 둔다. */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, countdown, tierTable, dealCards, leftText, timeline, sumRows, stepbar, accordion,
  toastNow, modalNow, sheetNow, review,
  pageHd, stickBar, detail2, myPage, num, won, esc, link, off,
} from './ui.mjs';
import { DEALS, dealById, pctOf, TIERS, OPTIONS, MY_JOINS } from './data.mjs';

/* ── JO-01 옵션·수량 선택 ─────────────────────────────
   v: 'opterr' 옵션 미선택 오류 · 'stock' 재고 부족 · 'addr' 배송지 변경 */
function jo01(ctx, v) {
  const d = dealById('d1');
  const pct = pctOf(d);
  const err = v === 'opterr';
  const low = v === 'stock';
  const main = `
    ${card('', `<div class="row wrap-row" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 120, { seed: d.id })}
      <div class="grow"><h2 class="t-card">${esc(d.nm)}</h2>
        <div class="t-sub">${esc(d.host)} · ${esc(d.ship)}</div>
        <div class="mt2"><span class="price-old">${won(d.was)}</span> <span class="price">${won(d.now)}</span></div>
      </div>
      <div class="nowrap">${countdown(d.left)}</div>
    </div>`)}

    ${low ? banner('warn', '📦', `<b>남은 물량이 얼마 없습니다.</b>
      <p class="t-sub">진행자가 확보한 수량이 정해져 있어, 목표 인원과 별개로 물량이 먼저 떨어질 수 있습니다.</p>`, { cls: 'mt6' }) : ''}

    ${card('옵션 고르기', `<div class="radio-list${err ? ' is-err' : ''}">
      ${OPTIONS.map((o, i) => {
    const soldout = o.soldout || (low && i === 1);
    const left = low ? [2, 0, 0][i] : null;
    return `<label class="radio${soldout ? ' is-off' : ''}${!err && !soldout && i === 0 ? ' on' : ''}" data-group="opt">
        <input type="radio" name="opt"${!err && i === 0 && !soldout ? ' checked' : ''}${soldout ? ' disabled' : ''}>
        <span class="grow"><b>${esc(o.nm)}</b>${soldout ? ' <span class="badge b-mut">품절</span>' : ''}
          ${left ? `<div class="t-sub">${left}개 남았어요 — 이 옵션은 곧 닫힙니다</div>` : ''}</span>
        <span class="nowrap">${o.add ? `+${won(o.add)}` : '기본가'}</span></label>`;
  }).join('')}
    </div>
    ${err ? '<p class="err">옵션을 하나 골라 주세요. 고르지 않으면 다음으로 넘어갈 수 없습니다.</p>' : ''}`,
    { cls: 'mt6' })}

    ${card('수량', `<div class="row-b wrap-row">
      <div><b>몇 개 받으실까요?</b><p class="t-sub mt1">1인당 최대 3개까지 참여하실 수 있습니다.${low ? ' 지금 이 옵션은 <b>2개</b>까지만 담을 수 있습니다.' : ''}</p></div>
      <div class="stepper"><button type="button" data-step="-">−</button><span class="num">${low ? 2 : 1}</span><button type="button"${low ? ' data-toast="남은 물량이 2개라 더 담을 수 없어요"' : ''}>＋</button></div>
    </div>
    ${low ? '<p class="hint">수량을 남은 물량에 맞춰 2개로 맞췄습니다.</p>' : ''}`, { cls: 'mt6' })}

    ${card('배송지', v === 'addr'
    ? `<div class="radio-list">
      ${[['김하늘', '서울 성동구 아차산로 111, 302동 1804호 (04781)', '010-1234-5678', true],
      ['회사', '서울 강남구 테헤란로 231 8층 (06142)', '010-1234-5678', false],
      ['부모님 댁', '경기 고양시 일산동구 중앙로 1275 (10403)', '031-***-****', false]]
      .map(([nm, addr, tel, on], i) => `<label class="radio${i === 1 ? ' on' : ''}" data-group="addr">
        <input type="radio" name="addr"${i === 1 ? ' checked' : ''}>
        <span class="grow"><b>${nm}</b>${on ? ' <span class="badge b-pri">기본</span>' : ''}
          <div class="t-sub mt1">${addr}</div><div class="t-sub">${tel}</div></span></label>`).join('')}
    </div>
    <div class="btns mt3">${btn('새 배송지 추가', { cls: 'btn-ghost btn-sm', href: 'AC0202' })}
      ${btn('이 배송지로 받기', { cls: 'btn-primary btn-sm', attr: ' data-toast="배송지를 회사로 바꿨어요" data-toast-kind="ok"' })}</div>`
    : `<div class="row-b wrap-row">
      <div><b>김하늘</b> <span class="badge b-pri">기본</span>
        <p class="t-sub mt1">서울 성동구 아차산로 111, 302동 1804호 (04781)</p>
        <p class="t-sub">010-1234-5678</p></div>
      <div class="btns">${btn('배송지 바꾸기', { cls: 'btn-ghost btn-sm', href: 'JO0104' })}</div>
    </div>
    <div class="box mt3"><p class="t-sub">성사가 확정되기 전까지는 내 공구함에서 배송지를 고치실 수 있습니다.</p></div>`,
    { cls: 'mt6' })}

    ${card('내가 참여하면', `<div class="row-b wrap-row" style="gap:20px">
      <div class="grow" style="min-width:260px">
        <div class="t-sub mb2">지금 달성률</div>${gauge(pct)}
        <div class="t-sub mt3 mb2">내가 참여하면</div>${gauge(Math.round((d.joined + 1) / d.goal * 100))}
      </div>
      <div class="box box-pri" style="min-width:220px">
        <b class="pri">${num(d.goal - d.joined - 1)}명만 더 모이면 성사!</b>
        <p class="t-sub mt2">지금 참여하시면 ${num(d.joined)}명 → <b>${num(d.joined + 1)}명</b>이 되어, 성사까지 ${num(d.goal - d.joined - 1)}명만 남습니다.</p>
      </div>
    </div>`, { cls: 'mt6' })}

    ${card('사람이 더 모이면 더 싸집니다', tierTable(TIERS, { next: '250명이 되면 24,900원 → <b>21,900원</b>. 차액은 성사 뒤 자동으로 돌려드립니다.' }), { cls: 'mt6' })}`;

  const qty = low ? 2 : 1;
  const aside = card('예상 결제 금액', `${sumRows([
    [err ? '옵션을 고르지 않았어요' : '5kg (특대과 12~14과)', err ? '<span class="muted">—</span>' : won(d.now)],
    ['수량', `${err ? '—' : qty + '개'}`],
    ['배송비', '무료'],
  ], ['예상 결제 금액', err ? '—' : won(d.now * qty)])}
    <div class="box mt3"><p class="t-sub">지금 결제되지만 목표에 못 미치면 <b>전액 자동 환불</b>됩니다.</p></div>
    <div class="btns mt4">${err
      ? '<button class="btn btn-primary btn-lg btn-block" type="button" disabled>참여하고 결제하기</button>'
      : btn('참여하고 결제하기', { cls: 'btn-primary btn-lg btn-block', href: 'JO-02' })}</div>
    ${err ? '<p class="err center">옵션을 골라 주세요</p>' : ''}
    ${btn('관심 공구에 담기', { cls: 'btn-ghost btn-block', attr: ' data-toast="관심 공구에 담았어요" data-toast-kind="ok"' })}`);

  const stick = stickBar(`<div class="t-sub">예상 결제 금액</div><b style="font-size:16px">${err ? '—' : won(d.now * qty)}</b>`,
    err ? '<button class="btn btn-primary" type="button" disabled>참여하고 결제하기</button>'
      : btn('참여하고 결제하기', { cls: 'btn-primary', href: 'JO-02' }));

  const body = `${pageHd('참여하기')}${stepbar(['옵션·수량', '결제', '완료'], 0)}<div class="mt6">${detail2(main, aside)}</div>`;
  const o = { wrapCls: 'wrap wrap-full', stick };
  if (err) { o.state = '옵션 미선택 오류'; o.after = toastNow('옵션을 하나 골라 주세요'); }
  if (low) o.state = '재고 부족 — 5kg 2개 남음 · 10kg 품절';
  if (v === 'addr') o.state = '배송지 변경 중';
  return { body, o };
}

/* ── JO-02 참여 결제 ──────────────────────────────────
   v: 'agree' 동의 미체크 · 'coupon' 쿠폰·적립금 적용 · 'pay' 결제수단 확장 */
function jo02(ctx, v) {
  const d = dealById('d1');
  const noAgree = v === 'agree';
  const cp = v === 'coupon';
  const main = `
    ${card('참여 내용', `<div class="row wrap-row" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 104, { seed: d.id })}
      <div class="grow"><b>${esc(d.nm)}</b>
        <div class="t-sub mt1">5kg (특대과 12~14과) · 1개</div>
        <div class="t-sub">${esc(d.host)} · ${esc(d.ship)}</div></div>
      <div class="right nowrap"><span class="price">${won(d.now)}</span></div>
    </div>`)}

    ${card('배송지', `<div class="radio-list">
      <label class="radio" data-group="addr"><input type="radio" name="addr" checked>
        <span class="grow"><b>김하늘</b> <span class="badge b-pri">기본</span>
          <div class="t-sub mt1">서울 성동구 아차산로 111, 302동 1804호 (04781) · 010-1234-5678</div></span></label>
      <label class="radio" data-group="addr"><input type="radio" name="addr">
        <span class="grow"><b>회사</b><div class="t-sub mt1">서울 강남구 테헤란로 231 8층 (06142) · 010-1234-5678</div></span></label>
    </div>
    <div class="field mt3"><label class="label">배송 요청사항</label>
      <select class="select"><option>문 앞에 두세요</option><option>경비실에 맡겨 주세요</option><option>배송 전 연락 주세요</option><option>직접 입력</option></select></div>
    ${btn('새 배송지 추가', { cls: 'btn-ghost btn-sm', href: 'AC-02' })}`, { cls: 'mt6' })}

    ${card('쿠폰·적립금', cp
    ? `<div class="box"><div class="row-b wrap-row">
        <div><b>첫 참여 2,000원 할인 쿠폰을 적용했습니다</b>
          <p class="t-sub mt1">이 공구에 쓸 수 있는 쿠폰 중 가장 많이 깎이는 것으로 골랐습니다.</p></div>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="쿠폰 적용을 취소했어요">적용 취소</button>
      </div></div>
      <div class="radio-list mt4">
        ${[['첫 참여 2,000원 할인', '남은 기간 26일 · 최소 주문 없음', true],
      ['식품 카테고리 1,500원', '남은 기간 3일 · 2만원 이상', false],
      ['생일 축하 5,000원', '이 공구에는 쓸 수 없어요 (뷰티 전용)', null]]
      .map(([t, s, on], i) => `<label class="radio${on ? ' on' : ''}${on === null ? ' is-off' : ''}" data-group="cp">
          <input type="radio" name="cp"${on ? ' checked' : ''}${on === null ? ' disabled' : ''}>
          <span class="grow"><b>${t}</b><div class="t-sub">${s}</div></span></label>`).join('')}
      </div>
      <div class="hr"></div>
      <div class="row-b wrap-row">
        <div><b>적립금</b><p class="t-sub mt1">보유 3,240원 · 1,000원부터 쓸 수 있어요</p></div>
        <div class="field-btn" style="min-width:260px">
          <input class="input" value="3,240">
          ${btn('전액 사용', { cls: 'btn-ghost', attr: ' data-toast="적립금 3,240원을 모두 적용했어요"' })}
        </div>
      </div>`
    : `<div class="field-btn">
      <input class="input" placeholder="쿠폰 코드를 넣으세요">
      ${btn('적용', { cls: 'btn-ghost', href: 'JO0203' })}
    </div>
    <div class="radio-list mt3">
      ${['첫 참여 2,000원 할인 (남은 기간 26일)', '식품 카테고리 1,500원', '쿠폰 사용 안 함']
      .map((t, i) => `<label class="radio" data-group="cp"><input type="radio" name="cp"${i === 0 ? ' checked' : ''}><span class="grow">${t}</span></label>`).join('')}
    </div>
    <div class="field-btn mt3">
      <input class="input" placeholder="적립금 (보유 3,240원)">
      ${btn('전액 사용', { cls: 'btn-ghost', href: 'JO0203' })}
    </div>`, { cls: 'mt6' })}

    ${card('결제 수단', v === 'pay'
    ? `<div class="radio-list">
      ${[['신용·체크카드', '국민 1234-**-**-5678'], ['카카오페이', '간편결제'], ['네이버페이', '간편결제'], ['토스페이', '간편결제'], ['계좌이체', '실시간 이체'], ['휴대폰 결제', '월 한도 30만원']]
      .map(([t, s], i) => `<label class="radio${i === 0 ? ' on' : ''}" data-group="pay"><input type="radio" name="pay"${i === 0 ? ' checked' : ''}>
        <span class="grow"><b>${t}</b><span class="t-sub"> ${s}</span></span></label>`).join('')}
    </div>
    <div class="box mt4"><b>카드로 결제하실 때</b>
      <div class="mt3">${kv([
      ['등록 카드', '국민카드 1234-**-**-5678 (기본)'],
      ['다른 카드', '결제 창에서 새 카드를 넣으실 수 있습니다'],
      ['무이자 할부', '5만원 이상 2~3개월 (카드사별로 다름)'],
      ['승인 취소', '불발 시 승인 자체가 취소됩니다'],
    ])}</div></div>
    <div class="btns mt3">${btn('결제 수단 관리', { cls: 'btn-ghost btn-sm', href: 'AC0203' })}</div>`
    : `<div class="radio-list">
      ${[['신용·체크카드', '국민 1234-**-**-5678'], ['카카오페이', '간편결제'], ['네이버페이', '간편결제'], ['계좌이체', '실시간 이체']]
      .map(([t, s], i) => `<label class="radio" data-group="pay"><input type="radio" name="pay"${i === 0 ? ' checked' : ''}>
        <span class="grow"><b>${t}</b><span class="t-sub"> ${s}</span></span></label>`).join('')}
    </div>
    <div class="btns mt3">${btn('결제 수단 모두 보기', { cls: 'btn-ghost btn-sm', href: 'JO0204' })}</div>`, { cls: 'mt6' })}

    ${card('꼭 확인해 주세요', `<div class="box">
      <b>이 공구는 조건부 결제입니다</b>
      <p class="t-sub mt1">지금 결제되지만, 마감까지 목표 인원(${num(d.goal)}명)에 못 미치면 <b>전액 자동 환불</b>됩니다. 따로 신청하실 것은 없습니다.</p>
    </div>
    <label class="check mt3"><input type="checkbox" data-unlock="payBtn"${noAgree ? '' : ' checked'}><span><b>조건부 결제와 자동 환불 내용을 확인했습니다</b> <span class="danger">(필수)</span></span></label>
    <label class="check"><input type="checkbox"${noAgree ? '' : ' checked'}><span><b>진행자에게 배송 정보 제공에 동의합니다</b> <span class="danger">(필수)</span>
      <div class="t-sub">제공 항목: 이름·연락처·주소 / 목적: 상품 배송 / 보유: 배송 완료 후 3개월</div></span></label>
    ${noAgree ? '<p class="err">필수 항목 2개에 동의하셔야 결제하실 수 있습니다.</p>' : ''}`,
    { cls: 'mt6' })}`;

  const useCoupon = cp ? 2000 : 2000;
  const usePoint = cp ? 3240 : 0;
  const total = d.now - useCoupon - usePoint;
  const aside = card('결제 금액', `${sumRows([
    ['정가', won(d.was)],
    ['공구 할인', '−' + won(d.was - d.now)],
    ['쿠폰', '−' + won(useCoupon)],
    ...(usePoint ? [['적립금', '−' + won(usePoint)]] : []),
    ['배송비', '무료'],
  ], ['최종 결제 금액', won(total)])}
    <div class="box mt3"><b>250명이 모이면 3,000원 더 싸집니다</b>
      <p class="t-sub mt1">차액은 성사 확정 뒤 자동으로 돌려드립니다.</p></div>
    <div class="btns mt4">
      <button class="btn btn-primary btn-lg btn-block${noAgree ? ' is-off' : ''}" id="payBtn" type="button"${noAgree ? ' disabled' : ''} data-toast="결제 창이 열려요">결제하기</button>
    </div>
    <p class="t-sub center mt2">${noAgree ? '필수 항목에 동의하시면 눌리게 됩니다' : '누르면 결제 창이 열립니다'}</p>
    <div class="hr"></div>
    <div class="row" style="gap:8px">
      ${btn('참여 완료 화면', { cls: 'btn-ghost btn-sm grow', href: 'JO-03' })}
      ${btn('결제 실패 화면', { cls: 'btn-ghost btn-sm grow', href: 'JO-04' })}
    </div>`);

  const body = `${pageHd('참여 결제')}${stepbar(['옵션·수량', '결제', '완료'], 1)}<div class="mt6">${detail2(main, aside)}</div>`;
  const o = { wrapCls: 'wrap wrap-full' };
  if (noAgree) { o.state = '필수 동의 미체크 — 결제 버튼 잠김'; o.after = toastNow('필수 항목에 동의해 주세요'); }
  if (cp) { o.state = '쿠폰 2,000원 + 적립금 3,240원 적용'; o.after = toastNow('쿠폰과 적립금을 적용했어요', { ok: true }); }
  if (v === 'pay') o.state = '결제 수단 6종 펼침';
  return { body, o };
}

/* ── JO-03 참여 완료 ──────────────────────────────────
   v: 'share' 공유 시트 열림 · 'invite' 초대 보상 안내 */
function jo03(ctx, v) {
  const d = dealById('d1');
  const after = Math.round((d.joined + 1) / d.goal * 100);
  const body = `
  ${stepbar(['옵션·수량', '결제', '완료'], 2)}
  <div class="box box-ok center mt6">
    <div style="font-size:44px">🙌</div>
    <h1 class="t-page mt2">참여가 끝났어요!</h1>
    <p class="t-sub mt2">참여 번호 <b>MG20260804-5182</b> · 2026년 8월 4일 18:24</p>
  </div>

  ${card('지금 상황', `<div class="row-b wrap-row"><b>${esc(d.nm)}</b>${countdown(d.left)}</div>
    <div class="mt3">${gauge(after)}</div>
    <div class="row-b mt2"><span class="t-sub">${num(d.joined + 1)}명 참여 · 목표 ${num(d.goal)}명</span>
      <b class="pri">${num(d.goal - d.joined - 1)}명이면 성사!</b></div>`, { cls: 'mt6' })}

  ${v === 'invite' ? card('초대 보상은 이렇게 쌓입니다', `<div class="g4">
      <div class="stat"><div class="n">3명</div><div class="l">내가 부른 사람</div></div>
      <div class="stat"><div class="n">6,000원</div><div class="l">받은 적립금</div></div>
      <div class="stat"><div class="n">2건</div><div class="l">성사에 보탠 공구</div></div>
      <div class="stat"><div class="n">무제한</div><div class="l">받을 수 있는 횟수</div></div>
    </div>
    <div class="hr"></div>
    ${table(
    ['단계', '언제 주나요', '얼마', '누가 받나'],
    [
      ['친구가 링크로 들어옴', '집계만 됩니다', '—', '—'],
      ['친구가 이 공구에 참여', '참여 즉시', '2,000원', '두 사람 모두'],
      ['그 공구가 성사됨', '성사 확정 후', '1,000원 추가', '부른 사람'],
      ['친구가 첫 후기 작성', '후기 등록 후', '1,000원', '친구'],
    ],
  )}
    <div class="box mt4"><b>적립금은 다음 참여부터 바로 쓰실 수 있습니다.</b>
      <p class="t-sub mt1">쌓인 적립금은 1,000원부터 쓸 수 있고, 받은 날부터 1년 동안 유효합니다.
      같은 사람을 여러 번 불러도 처음 한 번만 인정됩니다.</p></div>
    <div class="mt4">${kv([['내 초대 코드', '<b>HANEUL-4417</b>'], ['이번 달 받은 적립금', '4,000원'], ['지급 예정', '2,000원 (성사 확정 대기)']])}</div>`,
    {
      cls: 'mt6',
      ft: `<div class="row" style="gap:8px">${btn('초대 링크 복사', { cls: 'btn-primary btn-sm grow', attr: ' data-toast="링크를 복사했어요" data-toast-kind="ok"' })}
        ${btn('적립금 내역 보기', { cls: 'btn-ghost btn-sm grow', href: 'AC-02' })}</div>`,
    }) : card('친구를 부르면 성사가 빨라져요', `<p class="t-sub">초대 링크로 친구가 참여하면 두 분 모두에게 <b>2,000원 적립금</b>을 드립니다.</p>
    <div class="field-btn mt3">
      <input class="input is-readonly" value="https://moagonggu.kr/d/d1?ref=haneul" disabled>
      ${btn('링크 복사', { cls: 'btn-primary', attr: ' data-toast="링크를 복사했어요" data-toast-kind="ok"' })}
    </div>
    <div class="row mt3" style="gap:8px">
      ${btn('공유하기', { cls: 'btn-ghost btn-sm grow', href: 'JO0302' })}
      ${btn('초대 보상 자세히', { cls: 'btn-ghost btn-sm grow', href: 'JO0303' })}
    </div>`, { cls: 'mt6' })}

  ${card('앞으로 어떻게 되나요', `<div class="g2">
    <div class="box box-ok"><b>목표 인원이 모이면 (성사)</b>
      <ul class="t-sub mt2" style="padding-left:18px;line-height:1.9">
        <li>결제가 확정되고 진행자가 발주합니다</li>
        <li>단계가 내려갔다면 차액을 자동 환급합니다</li>
        <li>${esc(d.ship)}</li>
      </ul></div>
    <div class="box box-mut"><b>못 모으면 (불발)</b>
      <ul class="t-sub mt2" style="padding-left:18px;line-height:1.9">
        <li>마감 즉시 전액 자동 환불됩니다</li>
        <li>따로 신청하실 것은 없습니다</li>
        <li>카드 기준 2~5영업일 걸립니다</li>
      </ul></div>
  </div>`, { cls: 'mt6' })}

  <div class="btns mt6 center">
    ${btn('내 참여 상세 보기', { cls: 'btn-primary btn-lg', href: 'MY-02' })}
    ${btn('공구 더 둘러보기', { cls: 'btn-ghost btn-lg', href: 'HO-02' })}
  </div>

  <div class="mt8">${sec('이런 공구도 있어요', dealCards(DEALS.slice(1, 5), pctOf, { cls: 'stair' }))}</div>`;

  const o = {};
  if (v === 'share') {
    o.state = '공유 시트 열림';
    o.after = sheetNow(`<h3 class="t-sec mb4">어디로 보낼까요?</h3>
      <div class="g4">
        ${[['카카오톡', '💬'], ['문자', '✉️'], ['인스타 스토리', '📸'], ['링크 복사', '🔗'],
      ['페이스북', '👥'], ['밴드', '🎵'], ['이메일', '📮'], ['더 보기', '⋯']]
      .map(([t, i]) => `<button class="btn btn-ghost" type="button" style="height:auto;flex-direction:column;gap:8px;padding:16px 6px" data-toast="${t}로 공유했어요" data-toast-kind="ok">
          <span style="font-size:22px">${i}</span><span style="font-size:12px">${t}</span></button>`).join('')}
      </div>
      <div class="box mt4"><b>보낼 때 이런 메시지가 함께 갑니다</b>
        <p class="t-sub mt2">“제주 한라봉 5kg 공구에 참여했어요. 300명이 모이면 39,000원 → 24,900원!
        지금 247명, 53명만 더 모으면 성사돼요. 못 모으면 전액 환불이라 부담 없어요.”</p></div>
      <div class="btns mt4">
        <button class="btn btn-primary btn-block" type="button" data-close=".dim">닫기</button></div>`);
  }
  if (v === 'invite') o.state = '초대 보상 안내 · 내 초대 코드 HANEUL-4417';
  return { body, o };
}

/* ── JO-04 결제 실패 ──────────────────────────────────
   v: 'reason' 사유별 변형(한도·취소) */
function jo04(ctx, v) {
  const d = dealById('d1');
  const many = v === 'reason';
  const body = `
  ${stepbar(['옵션·수량', '결제', '완료'], 1)}
  <div class="box center mt6" style="border-color:rgba(207,34,46,.4)">
    <div style="font-size:40px">😥</div>
    <h1 class="t-page mt2">결제가 되지 않았어요</h1>
    <p class="t-sub mt2">${many ? '카드사에서 승인을 취소했습니다 (오류 코드 <b>PG-61</b>)' : '카드 한도를 넘었습니다 (오류 코드 <b>PG-51</b>)'}</p>
    <p class="t-sub">아직 결제되지 않았고, 고르신 내용은 그대로 남아 있습니다.</p>
  </div>

  ${many ? card('무엇 때문에 막혔나요', table(
    [{ t: '오류 코드', w: '16%' }, '무슨 뜻인가요', '이렇게 해 보세요'],
    [
      ['<b>PG-51</b>', '카드 한도를 넘었습니다', '카드사 앱에서 한도를 올리거나 다른 카드로 결제'],
      ['<b>PG-61</b>', '카드사가 승인을 취소했습니다', '해외 결제 차단·이상 거래 탐지일 수 있어 카드사에 문의'],
      ['<b>PG-05</b>', '카드 정보가 맞지 않습니다', '카드번호·유효기간·CVC를 다시 확인'],
      ['<b>PG-33</b>', '유효기간이 지난 카드입니다', '새 카드를 등록'],
      ['<b>PG-99</b>', '결제 창이 시간 초과됐습니다', '다시 시도 — 보통 바로 됩니다'],
      ['<b>간편결제</b>', '앱 비밀번호가 틀렸습니다', '카카오·네이버 앱에서 비밀번호 확인'],
    ],
  ), { cls: 'mt6' }) : ''}

  ${banner('warn', '⏰', `<b>이 공구는 ${leftText(d.left)} 뒤에 마감돼요.</b>
    <p class="t-sub">서두르지 않으셔도 되지만, 마감되면 이 가격으로는 참여하실 수 없습니다.</p>`,
    { cls: 'mt6', right: countdown(d.left) })}

  ${card('고르신 내용은 그대로 있어요', `<div class="row wrap-row" style="gap:16px">
    ${phFix(['상품 사진', 1000, 1000], 96, { seed: d.id })}
    <div class="grow"><b>${esc(d.nm)}</b>
      <div class="t-sub mt1">5kg (특대과 12~14과) · 1개 · 쿠폰 2,000원 적용</div></div>
    <div class="right nowrap"><span class="price">${won(d.now - 2000)}</span></div>
  </div>`, { cls: 'mt6' })}

  ${card('이럴 때 이렇게 해 보세요', [
    ['한도를 넘었을 때', '카드사 앱에서 한도를 올리시거나, 다른 카드로 결제해 보세요.'],
    ['카드 정보가 틀렸을 때', '카드번호·유효기간·CVC를 다시 확인해 주세요.'],
    ['간편결제가 안 될 때', '카카오페이·네이버페이는 앱에서 결제 비밀번호를 확인해 주세요.'],
  ].map(([t, dd]) => `<div class="row mt3" style="gap:10px;align-items:flex-start"><span>•</span><div><b>${t}</b><p class="t-sub">${dd}</p></div></div>`).join(''),
    { cls: 'mt6' })}

  <div class="btns mt6 center">
    ${btn('다시 시도하기', { cls: 'btn-primary btn-lg', href: 'JO-02' })}
    ${btn('다른 결제 수단 고르기', { cls: 'btn-ghost btn-lg', href: 'JO0204' })}
    ${btn('문의하기', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
    ${many ? '' : btn('사유별 안내 보기', { cls: 'btn-ghost btn-lg', href: 'JO0402' })}
  </div>`;
  return { body, o: { state: many ? '결제 실패 · 사유별 안내 (PG-61 승인 취소)' : '결제 실패 · 카드 한도 초과 (PG-51)' } };
}

/* ── MY-01 내 공구함 ──────────────────────────────────
   v: 'ok' 성사 탭 · 'miss' 불발 탭 · 'ship' 배송·완료 탭 */
function my01(ctx, v) {
  const only = { ok: '성사', miss: '불발', ship: '배송 중' }[v];
  const list = only ? MY_JOINS.filter((m) => m.st === only) : MY_JOINS;
  const rows = list.map((m) => {
    const d = dealById(m.id);
    const pct = pctOf(d);
    const right = {
      '진행 중': `${btn('공구 보기', { cls: 'btn-primary btn-sm', href: 'DE-01' })}<div class="mt2">${btn('친구 부르기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="초대 링크를 복사했어요" data-toast-kind="ok"' })}</div>`,
      '성사': `${btn('참여 상세', { cls: 'btn-primary btn-sm', href: 'MY-02' })}<div class="mt2">${btn('배송지 확인', { cls: 'btn-ghost btn-sm', href: 'AC-02' })}</div>`,
      '배송 중': `${btn('배송 조회', { cls: 'btn-primary btn-sm', attr: ' data-toast="택배사 조회 창을 열어요"' })}<div class="mt2">${btn('후기 쓰기', { cls: 'btn-accent btn-sm', href: 'RV-01' })}</div>`,
      '불발': `${btn('환불 상태 보기', { cls: 'btn-ghost btn-sm', href: 'MY-02' })}<div class="mt2">${btn('재오픈 알림', { cls: 'btn-ghost btn-sm', attr: ' data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' })}</div>`,
    }[m.st];

    const sub = {
      '진행 중': `<div class="mt2" style="max-width:380px">${gauge(pct)}</div>
        <div class="t-sub mt1">${num(d.joined)}명 참여 · <b class="pri">${num(d.goal - d.joined)}명이면 성사</b> · ${leftText(d.left)}</div>`,
      '성사': `<div class="t-sub mt2">최종 ${num(d.joined)}명 · 확정가 ${won(d.now)}${m.back ? ` · <b class="ok">차액 ${won(m.back)} 환급 예정</b>` : ''}</div>
        <div class="t-sub">발주 준비 중 · ${esc(d.ship)}</div>`,
      '배송 중': `<div class="t-sub mt2">한진택배 ${m.track} · 8월 5일 도착 예정</div>
        <div class="t-sub"><b class="acc">후기를 아직 안 쓰셨어요</b></div>`,
      '불발': `<div class="mt2" style="max-width:380px">${gauge(pct, { miss: true })}</div>
        <div class="t-sub mt1">최종 ${num(d.joined)}/${num(d.goal)}명 · <b>전액 환불 진행 중</b> (8월 8일쯤 완료)</div>`,
    }[m.st];

    return `<div class="list-row">
      ${phFix(['상품 사진', 1000, 1000], 104, { seed: d.id })}
      <div class="grow">
        <div class="row wrap-row" style="gap:6px">${stBadge(m.st)}<span class="t-sub">${m.at} 참여 · ${m.no}</span></div>
        <h3 class="t-card mt1">${esc(d.nm)}</h3>
        <div class="t-sub">${esc(m.opt)} · ${m.qty}개 · ${won(m.paid)} 결제</div>
        ${sub}
      </div>
      <div class="right nowrap">${right}</div></div>`;
  }).join('');

  /* 탭마다 그 상태에서만 필요한 안내를 하나씩 덧붙인다 */
  const tabNote = {
    ok: banner('ok', '📦', `<b>성사된 공구는 진행자가 발주에 들어갔습니다.</b>
      <p class="t-sub">발주 전까지는 배송지를 고치실 수 있습니다. 단계가 내려간 공구는 차액이 자동 환급됩니다.</p>`,
      { cls: 'mt6', right: btn('차액 환급 보기', { cls: 'btn-ghost btn-sm', href: 'MY0203' }) }),
    miss: banner('mut', '💳', `<b>불발된 공구는 전액 자동 환불됩니다.</b>
      <p class="t-sub">따로 신청하실 것은 없습니다. 카드 기준 2~5영업일 걸립니다.</p>`,
      { cls: 'mt6', right: btn('환불 상태 보기', { cls: 'btn-ghost btn-sm', href: 'DE0402' }) }),
    ship: banner('acc', '✍️', `<b>받으셨다면 후기를 남겨 주세요.</b>
      <p class="t-sub">사진과 함께 남기시면 3,000원 쿠폰을 드립니다.</p>`,
      { cls: 'mt6', right: btn('후기 쓰기', { cls: 'btn-accent btn-sm', href: 'RV0102' }) }),
  }[v] || `${banner('acc', '✍️', `<b>후기를 안 쓰신 공구가 1건 있어요.</b>
      <p class="t-sub">사진과 함께 남기시면 3,000원 쿠폰을 드립니다.</p>`,
    { cls: 'mt6', right: btn('후기 쓰기', { cls: 'btn-accent btn-sm', href: 'RV-01' }) })}
    ${banner('mut', '📭', `<b>참여 내역이 없을 때는 어떻게 보이나요?</b>`,
    { cls: 'mt4', right: btn('비어 있는 화면 보기', { cls: 'btn-ghost btn-sm', href: 'MY-04' }) })}`;

  const tabIdx = { ok: 1, miss: 2, ship: 3 }[v] ?? 4;
  const body = myPage('MY-01', `
    ${pageHd('내 공구함', only ? `${only} 공구 ${list.length}건` : '참여하신 공구 4건',
    `<div class="row wrap-row" style="gap:8px"><input class="input" style="width:200px;max-width:100%" placeholder="상품명 검색">
      <select class="select" style="width:150px;max-width:100%"><option>최근 참여순</option><option>마감 임박순</option><option>금액순</option></select></div>`)}

    ${tabs([
    { label: '진행 중', cnt: 1, go: 'MY0101' }, { label: '성사', cnt: 1, go: 'MY0102' },
    { label: '불발', cnt: 1, go: 'MY0103' }, { label: '배송·완료', cnt: 1, go: 'MY0104' },
    { label: '전체', cnt: 4, go: 'MY0101' },
  ], tabIdx)}

    <div class="mt4">${rows}</div>

    ${v === 'ok' ? card('성사된 공구는 이렇게 진행됩니다', timeline([
    ['성사 확정', '마감 직후 자동 판정 · 완료'],
    ['진행자 발주', '성사 다음 날 · 완료'],
    ['상품 준비·포장', '진행 중'],
    ['발송', '성사 후 3~5일'],
    ['배송 완료', '발송 후 1~2일'],
  ], 2), { cls: 'mt6' }) : ''}

    ${v === 'miss' ? card('환불은 어디까지 갔나요', `${timeline([
    ['불발 확정', '2026년 7월 14일 21:00 · 완료'],
    ['환불 요청 전송', '2026년 7월 14일 21:01 · 완료'],
    ['카드사 처리 중', '보통 2~5영업일'],
    ['환불 완료', '7월 18일쯤 예정'],
  ], 2)}
      <div class="hr"></div>
      ${kv([['환불 금액', won(29900)], ['환불 수단', '국민카드 결제 취소'], ['요청 번호', 'RF-20260714-2884']])}`,
    { cls: 'mt6' }) : ''}

    ${v === 'ship' ? card('배송 조회', `${timeline([
    ['집화', '7월 22일 14:20 · 서울성동'],
    ['간선 상차', '7월 22일 21:40 · 옥천HUB'],
    ['배송 출발', '7월 23일 09:10 · 성수3'],
    ['배송 완료', '7월 23일 예정'],
  ], 2)}
      <div class="hr"></div>
      ${kv([['택배사', '한진택배'], ['송장번호', '640123456789'], ['받는 분', '김하늘']])}`,
    { cls: 'mt6', ft: btn('택배사에서 조회하기', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="택배사 조회 창을 열어요"' }) }) : ''}

    ${tabNote}`);
  return { body, o: { wrapCls: 'wrap wrap-full', state: only ? `${only} 탭 · ${list.length}건` : undefined } };
}

/* ── MY-02 참여 상세 ──────────────────────────────────
   v: 'ing' 진행 중 · 'back' 성사-차액 환급 · 'track' 배송 조회 */
function my02(ctx, v) {
  const m = v === 'back' ? MY_JOINS[1] : (v === 'track' ? MY_JOINS[2] : MY_JOINS[0]);
  const d = dealById(m.id);
  const main = `
    ${card('공구', `<div class="row wrap-row" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 120, { seed: d.id })}
      <div class="grow"><h2 class="t-card">${esc(d.nm)}</h2>
        <div class="t-sub">${esc(d.host)} · ${esc(d.ship)}</div>
        <div class="mt3">${gauge(pctOf(d))}</div>
        <div class="t-sub mt1">${num(d.joined)}명 참여 · <b class="pri">${num(d.goal - d.joined)}명이면 성사</b></div></div>
      <div class="nowrap">${countdown(d.left)}</div>
    </div>`, { aside: `<a class="more" href="${link('DE-01')}">공구 보기 ›</a>` })}

    ${card('내 참여 정보', kv([
    ['참여 번호', m.no],
    ['참여 일시', m.at + ' 18:24'],
    ['옵션', m.opt],
    ['수량', `${m.qty}개`],
    ['결제 금액', won(m.paid)],
    ['결제 수단', '국민카드 1234-**-**-5678'],
    ['배송지', '서울 성동구 아차산로 111, 302동 1804호 · 김하늘 010-1234-5678'],
  ]), { cls: 'mt6', aside: btn('배송지 바꾸기', { cls: 'btn-ghost btn-sm', href: 'AC-02' }) })}

    ${card('진행 상태', v === 'back' ? timeline([
    ['참여 완료', '2026년 7월 28일 11:02'],
    ['모집 마감', '2026년 8월 4일 21:00 · 완료'],
    ['성사 확정', '2026년 8월 4일 21:03 · 151명 달성'],
    ['차액 환급', '진행 중 — 3영업일 안에 들어갑니다'],
    ['진행자 발주', '2026년 8월 5일 · 완료'],
    ['발송', '2026년 8월 8일 예정'],
  ], 3) : v === 'track' ? timeline([
    ['참여 완료', '2026년 7월 21일 09:40'],
    ['성사 확정', '2026년 7월 21일 21:03'],
    ['진행자 발주·발송', '2026년 7월 22일 14:20'],
    ['배송 중', '지금 여기 — 성수3 배송 출발'],
    ['배송 완료', '7월 23일 예정'],
  ], 3) : timeline([
    ['참여 완료', `${m.at} 18:24`],
    ['모집 마감', `${leftText(d.left)} 뒤`],
    ['성사·불발 판정', '마감 직후 자동'],
    ['진행자 발주', '성사 후 1일 이내'],
    ['발송', esc(d.ship)],
    ['배송 완료', '발송 후 1~2일'],
  ], 0), { cls: 'mt6' })}

    ${v === 'track' ? card('배송 조회', `${kv([
    ['택배사', '한진택배'],
    ['송장번호', `<b>${m.track}</b>`],
    ['받는 분', '김하늘 · 010-1234-5678'],
    ['도착 예정', '2026년 7월 23일 (수)'],
  ])}
      <div class="hr"></div>
      ${table(
      [{ t: '시각', w: '22%' }, '위치', '상태'],
      [
        ['7월 22일 14:20', '서울성동', '집화 처리'],
        ['7월 22일 21:40', '옥천HUB', '간선 상차'],
        ['7월 23일 06:05', '성수3', '간선 하차'],
        ['7월 23일 09:10', '성수3', '<b>배송 출발 — 오늘 안에 도착합니다</b>'],
      ],
    )}
      <div class="box mt4"><b>못 받으실 것 같으면</b>
        <p class="t-sub mt1">기사님께 문 앞·경비실 중 어디에 둘지 알려 주실 수 있습니다. 신선식품이라 되도록 빨리 받으시는 것이 좋습니다.</p></div>`,
    {
      cls: 'mt6',
      ft: `<div class="row" style="gap:8px">${btn('택배사에서 조회', { cls: 'btn-primary btn-sm grow', attr: ' data-toast="택배사 조회 창을 열어요"' })}
        ${btn('기사님께 요청 남기기', { cls: 'btn-ghost btn-sm grow', attr: ' data-toast="요청을 남겼어요" data-toast-kind="ok"' })}</div>`,
    }) : ''}

    ${card(v === 'back' ? '차액 환급' : '차액 환급 안내', v === 'back'
    ? `<div class="box">
      <b>${won(14000)}을 돌려드립니다</b>
      <p class="t-sub mt1">참여하실 때는 100명 단계(112,000원)였는데, 마감까지 사람이 더 모여 150명 단계(98,000원)가 적용됐습니다.
      차액은 결제하신 수단으로 그대로 돌아갑니다. 따로 신청하실 것은 없습니다.</p>
    </div>
    <div class="mt4">${table(
      ['구분', '단계', '금액'],
      [
        ['참여 당시', '100명 단계', won(112000)],
        ['최종 확정', '<b>150명 단계</b>', `<b>${won(98000)}</b>`],
        ['환급 금액', '차액', `<b>${won(14000)}</b>`],
      ],
    )}</div>
    <div class="mt4">${kv([
      ['환급 수단', '국민카드 1234-**-**-5678 (부분 취소)'],
      ['환급 요청', '2026년 8월 4일 21:05'],
      ['예상 완료', '2026년 8월 7일 (3영업일)'],
      ['상태', '<b>진행 중</b>'],
    ])}</div>`
    : `<div class="box">
      <b>단계가 내려가면 차액을 돌려드립니다</b>
      <p class="t-sub mt1">지금은 24,900원 단계입니다. 250명이 모이면 21,900원이 되고, 차액 3,000원이 성사 확정 뒤 자동으로 환급됩니다.</p>
    </div>
    <div class="mt3">${tierTable(TIERS)}</div>`, { cls: 'mt6' })}`;

  const aside = card('', `<div class="center">${stBadge(m.st)}
      <div class="price-lg mt2">${won(m.paid)}</div>
      <p class="t-sub">${m.at} 결제</p>
      ${v === 'back' ? `<p class="t-sub mt1"><b>${won(14000)} 환급 예정</b></p>` : ''}</div>
    <div class="hr"></div>
    <div class="btns">
      ${v === 'track'
      ? btn('배송 조회', { cls: 'btn-primary btn-block', attr: ' data-toast="택배사 조회 창을 열어요"' })
      : btn('친구 불러 성사 돕기', { cls: 'btn-primary btn-block', attr: ' data-toast="초대 링크를 복사했어요" data-toast-kind="ok"' })}
    </div>
    ${btn('영수증 보기', { cls: 'btn-ghost btn-block', attr: ' data-toast="영수증을 새 창에서 열어요"' })}
    ${v === 'track' ? btn('후기 쓰기', { cls: 'btn-accent btn-block', href: 'RV0102' }) : btn('배송 조회', { cls: 'btn-ghost btn-block', href: 'MY0204' })}
    ${btn('참여 취소·환불', { cls: 'btn-ghost btn-block', href: 'MY-03' })}
    <div class="hr"></div>
    ${btn('진행자에게 문의', { cls: 'btn-ghost btn-block btn-sm', href: 'RV-02' })}
    ${btn('고객센터 문의', { cls: 'btn-ghost btn-block btn-sm', href: 'CS-02' })}
    ${v ? '' : `<div class="hr"></div>
    <div class="row" style="gap:8px">${btn('차액 환급', { cls: 'btn-ghost btn-sm grow', href: 'MY0203' })}
      ${btn('배송 조회', { cls: 'btn-ghost btn-sm grow', href: 'MY0204' })}</div>`}`);

  const body = myPage('MY-01', `${pageHd('참여 상세')}<div class="mt6">${detail2(main, aside)}</div>`);
  const st = { ing: '진행 중 · 마감까지 3시간 7분', back: '성사 · 차액 14,000원 환급 진행 중', track: '배송 중 · 한진택배 640123456789' }[v];
  return { body, o: { wrapCls: 'wrap wrap-full', state: st } };
}

/* ── MY-03 참여 취소·환불 요청 ────────────────────────
   v: 'return' 성사 후 반품 규정 · 'confirm' 취소 확인 모달 */
function my03(ctx, v) {
  const m = MY_JOINS[0];
  const d = dealById(m.id);
  const main = `
    ${banner('ok', '✅', `<b>마감 전이라 수수료 없이 취소하실 수 있어요.</b>
      <p class="t-sub">마감 뒤 성사된 공구는 발주가 들어가 취소가 어렵습니다. 지금은 ${leftText(d.left)} 남았습니다.</p>`)}

    ${card('취소할 참여', `<div class="row wrap-row" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 104, { seed: d.id })}
      <div class="grow"><b>${esc(d.nm)}</b>
        <div class="t-sub mt1">${esc(m.opt)} · ${m.qty}개 · ${m.at} 참여</div>
        <div class="t-sub">${m.no}</div></div>
      <div class="right nowrap"><span class="price">${won(m.paid)}</span></div>
    </div>`, { cls: 'mt6' })}

    ${card('취소하면 달성률이 내려갑니다', `<div class="row wrap-row" style="gap:20px">
      <div class="grow" style="min-width:240px">
        <div class="t-sub mb2">지금 — ${num(d.joined)}명 참여</div>${gauge(pctOf(d))}
        <div class="t-sub mt3 mb2">취소하면 — ${num(d.joined - 1)}명</div>${gauge(Math.round((d.joined - 1) / d.goal * 100))}
      </div>
      <div class="box" style="min-width:220px">
        <b>${num(d.goal - d.joined)}명이면 성사되는 상황이에요</b>
        <p class="t-sub mt2">지금 취소하시면 성사까지 <b>${num(d.goal - d.joined + 1)}명</b>이 필요해집니다. 기다리시는 분들이 있어요.</p>
      </div>
    </div>`, { cls: 'mt6' })}

    ${card('취소 사유', `<div class="radio-list">
      ${['다른 곳에서 더 싸게 샀어요', '마음이 바뀌었어요', '성사가 안 될 것 같아요', '옵션·수량을 바꾸고 싶어요', '배송이 너무 늦어요', '직접 입력']
      .map((t, i) => `<label class="radio" data-group="why"><input type="radio" name="why"${i === 0 ? ' checked' : ''}><span class="grow">${t}</span></label>`).join('')}
    </div>
    <textarea class="textarea mt3" rows="3" placeholder="더 하실 말씀이 있으면 적어 주세요 (선택)"></textarea>`, { cls: 'mt6' })}

    ${v === 'return' ? card('성사된 뒤에 반품하시려면', `${table(
      [{ t: '언제', w: '24%' }, '되나요', '배송비', '언제까지'],
      [
        ['마감 전', '<b>취소 가능</b> — 수수료 없음', '없음', '마감 시각까지'],
        ['성사 후 · 발주 전', '<b>취소 가능</b> — 진행자 승인 필요', '없음', '발주 시각까지'],
        ['성사 후 · 발주 후', '취소 불가 — 받으신 뒤 반품으로', '왕복 5,000원', '—'],
        ['상품 받은 뒤 (하자)', '<b>전액 환불 또는 재발송</b>', '진행자 부담', '받은 날부터 7일'],
        ['상품 받은 뒤 (단순 변심)', '신선식품은 불가', '—', '—'],
      ],
    )}
      <div class="box mt4"><b>왜 신선식품은 단순 변심 반품이 어렵나요</b>
        <p class="t-sub mt1">전자상거래법에서도 신선식품처럼 시간이 지나면 상하는 물건은
        단순 변심 청약철회를 제한할 수 있게 되어 있습니다. 대신 <b>마감 전에는 언제든 수수료 없이</b> 취소하실 수 있습니다.</p></div>
      <div class="mt4">${accordion([
      { q: '박스가 눌려서 왔어요', a: '개봉 전 사진과 함께 1:1 문의로 접수해 주세요. 상태를 보고 재발송하거나 전액 환불해 드립니다. 왕복 배송비는 받지 않습니다.' },
      { q: '개수가 모자라요', a: '박스가 나뉘어 하루 차이로 오는 경우가 있습니다. 다음 날까지 안 오면 접수해 주세요.' },
      { q: '반품하면 언제 돌려받나요', a: '반품 상품이 진행자에게 도착한 뒤 1영업일 안에 환불을 겁니다. 카드는 그 뒤 2~5영업일 걸립니다.' },
    ], 0)}</div>`,
    { cls: 'mt6', aside: `<a class="more" href="${link('CS-04')}">환불 정책 ›</a>` })
    : card('성사된 뒤에 반품하시려면', `<ul style="padding-left:18px;line-height:1.9" class="t-sub">
      <li>상품을 받으신 날부터 7일 이내에 신청하실 수 있습니다.</li>
      <li>신선식품은 단순 변심으로는 반품이 어렵습니다.</li>
      <li>상품에 하자가 있으면 왕복 배송비 없이 처리됩니다.</li>
    </ul>
    <div class="btns mt3">${btn('반품 규정 자세히', { cls: 'btn-ghost btn-sm', href: 'MY0302' })}</div>`,
    { cls: 'mt6', aside: `<a class="more" href="${link('CS-04')}">환불 정책 ›</a>` })}`;

  const aside = card('환불 예정', `${sumRows([
    ['결제 금액', won(m.paid)],
    ['취소 수수료', '0원'],
    ['쿠폰 반환', '첫 참여 2,000원 쿠폰 복구'],
  ], ['환불 금액', won(m.paid)])}
    <div class="mt3">${kv([['환불 수단', '국민카드 결제 취소'], ['환불 시점', '즉시 요청 · 2~5영업일']])}</div>
    <div class="btns mt4">${btn('그냥 두기 (참여 유지)', { cls: 'btn-primary btn-block', href: 'MY-02' })}</div>
    ${btn('참여 취소하기', { cls: 'btn-danger btn-block', attr: ' data-modal="mdCancel"' })}
    <template id="mdCancel"><div class="modal">
      <div class="hd">참여를 취소할까요?</div>
      <div class="bd"><p>참여 인원이 ${num(d.joined)}명 → <b>${num(d.joined - 1)}명</b>이 되어, 성사까지 <b>${num(d.goal - d.joined + 1)}명</b>이 필요해집니다.</p>
        <div class="mt3">${kv([['환불 금액', won(m.paid)], ['환불 수단', '국민카드 결제 취소'], ['소요 기간', '2~5영업일']])}</div>
        <p class="t-sub mt3">취소하신 뒤에도 마감 전이면 다시 참여하실 수 있습니다. 다만 그때 단계 가격이 적용됩니다.</p></div>
      <div class="ft">
        <button class="btn btn-ghost" type="button" data-dismiss data-toast="취소하지 않았어요. 참여가 그대로 유지됩니다">그냥 두기</button>
        <button class="btn btn-danger" type="button" data-dismiss data-toast="참여를 취소했어요. 2~5영업일 안에 환불됩니다" data-toast-kind="ok">취소하기</button>
      </div></div></template>`);

  const body = myPage('MY-01', `${pageHd('참여 취소·환불 요청')}<div class="mt6">${detail2(main, aside)}</div>`);
  const o = { wrapCls: 'wrap wrap-full' };
  if (v === 'return') o.state = '성사 후 반품 규정 안내';
  if (v === 'confirm') {
    o.state = '취소 확인 모달 열림';
    o.after = modalNow('참여를 취소할까요?',
      `<p>참여 인원이 <b>${num(d.joined)}명</b> → <b>${num(d.joined - 1)}명</b>이 되어,
        성사까지 <b>${num(d.goal - d.joined)}명</b>이 아니라 <b>${num(d.goal - d.joined + 1)}명</b>이 필요해집니다.
        기다리시는 분들이 있습니다.</p>
      <div class="box mt4">${kv([
        ['환불 금액', won(m.paid)],
        ['취소 수수료', '0원'],
        ['환불 수단', '국민카드 결제 취소'],
        ['소요 기간', '2~5영업일'],
        ['쿠폰', '첫 참여 2,000원 쿠폰이 복구됩니다'],
      ])}</div>
      <p class="t-sub mt3">취소하신 뒤에도 마감 전이면 다시 참여하실 수 있습니다. 다만 그때의 단계 가격이 적용됩니다.</p>`,
      `<button class="btn btn-ghost" type="button" data-close=".dim" data-toast="취소하지 않았어요. 참여가 그대로 유지됩니다">그냥 두기</button>
       <button class="btn btn-danger" type="button" data-close=".dim" data-toast="참여를 취소했어요. 2~5영업일 안에 환불됩니다" data-toast-kind="ok">취소하기</button>`);
  }
  return { body, o };
}

/* ── MY-04 내 공구함 - 비어 있음 ────────────────────── */
function my04() {
  const body = myPage('MY-01', `
    ${pageHd('내 공구함')}
    ${empty('📦', '아직 참여하신 공구가 없어요',
    '마음에 드는 공구에 참여해 보세요. 사람이 모이면 값이 내려가고, 못 모으면 전액 돌려드립니다.',
    `${btn('공구 둘러보기', { cls: 'btn-primary btn-lg', href: 'HO-02' })}${btn('마감 임박 보기', { cls: 'btn-ghost btn-lg', href: 'HO-03' })}`)}

    ${banner('acc', '🎟', `<b>첫 참여 2,000원 할인 쿠폰이 있어요</b>
      <p class="t-sub">가입 후 30일 안에 쓰실 수 있습니다. 결제할 때 자동으로 적용됩니다.</p>`,
    { cls: 'mt6', right: btn('쿠폰 확인', { cls: 'btn-accent btn-sm', href: 'AC-02' }) })}

    <div class="mt8">${sec('마감이 얼마 안 남았어요', dealCards(DEALS.filter((d) => d.left < 700), pctOf, { cls: 'stair', rank: false }), { more: 'HO-03' })}</div>
    <div class="mt6">${sec('많이 참여하는 공구', dealCards(DEALS.slice(0, 3), pctOf, { cls: 'stair', rank: false }), { more: 'HO-02' })}</div>

    ${card('', `<div class="row-b wrap-row">
      <div><b>관심 공구에 담아 두신 것이 3개 있어요</b>
        <p class="t-sub mt1">담아 두신 공구가 마감에 가까워지면 알려드립니다.</p></div>
      ${btn('관심 공구 보기', { cls: 'btn-primary', href: 'RV-03' })}
    </div>`, { cls: 'mt6' })}`);
  return { body, o: { wrapCls: 'wrap wrap-full', state: '참여 내역 0건' } };
}

export const PAGES = {
  'JO-01': jo01,
  JO0102: (c) => jo01(c, 'opterr'),
  JO0103: (c) => jo01(c, 'stock'),
  JO0104: (c) => jo01(c, 'addr'),
  'JO-02': jo02,
  JO0202: (c) => jo02(c, 'agree'),
  JO0203: (c) => jo02(c, 'coupon'),
  JO0204: (c) => jo02(c, 'pay'),
  'JO-03': jo03,
  JO0302: (c) => jo03(c, 'share'),
  JO0303: (c) => jo03(c, 'invite'),
  'JO-04': jo04,
  JO0402: (c) => jo04(c, 'reason'),

  'MY-01': my01,
  MY0102: (c) => my01(c, 'ok'),
  MY0103: (c) => my01(c, 'miss'),
  MY0104: (c) => my01(c, 'ship'),
  'MY-02': my02,
  MY0202: (c) => my02(c, 'ing'),
  MY0203: (c) => my02(c, 'back'),
  MY0204: (c) => my02(c, 'track'),
  'MY-03': my03,
  MY0302: (c) => my03(c, 'return'),
  MY0303: (c) => my03(c, 'confirm'),
  'MY-04': my04,
};
