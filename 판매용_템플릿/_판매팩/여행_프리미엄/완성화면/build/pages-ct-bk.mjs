/* CT — 장바구니 (7) / BK — 예약·결제 (23) */
import * as U from './ui.mjs';
import { PRODUCTS, P, CAT_LABEL, COUPONS } from './data.mjs';

const { ph, phMap, pcard, pcards, sec, card, banner, btn, badge, tabs, table, kv, sumRows,
  won, num, off, link, empty, stars, pageHd, stickBar, calendar, prodSummary, toastEl, modalEl,
  modalTpl, progress, stepbar, esc } = U;

const CART = [
  { p: P('P01'), date: '2026.08.03(월) 14:00', pax: '성인 2 · 아동 1', opt: '집합 장소 이용 · 일반석', amt: 184000 },
  { p: P('P02'), date: '2026.08.05(수) 자유 이용', pax: '성인 2 · 아동 1', opt: '3대 전망대 통합권', amt: 384000 },
  { p: P('P03'), date: '2026.07.28(화) 08:00', pax: '성인 2', opt: '32번가 집합', amt: 84000, dead: '지난 날짜' },
];

/* ===== CT01 장바구니 ===== */
export function CT0101(ctx) {
  const id = ctx.id;
  const dead = id === 'CT0102';
  const changed = id === 'CT0103';
  const del = id === 'CT0104';
  const editOpt = id === 'CT0105';

  const item = (it, i) => {
    const isDead = (dead || id === 'CT0101') && i === 2;
    const isChanged = changed && i === 1;
    return `<div class="hcard ${isDead ? 'is-off' : ''} ${isChanged ? 'is-alert' : ''} mb3">
      <label class="check" style="flex:none;padding:0"><input type="checkbox" ${isDead ? '' : 'checked'} ${isDead ? 'disabled' : ''}></label>
      ${ph(it.p.id, 'ph-thumb')}
      <div class="grow">
        <div class="badges mb1">${badge(CAT_LABEL[it.p.cat], 'b-line')}${isDead ? badge('예약 마감', 'b-mut') : ''}${isChanged ? badge('가격 변동', 'b-warn') : ''}</div>
        <div class="t-card" style="font-size:15px">${esc(it.p.name)}</div>
        <p class="t-sub mt1">${it.date} · ${it.pax}<br>${it.opt}</p>
        ${isDead ? `<div class="mt2"><span class="danger strong" style="font-size:13px">이 날짜는 마감되었어요. 날짜를 바꿔주세요</span></div>` : ''}
        ${isChanged ? `<div class="mt2"><span class="warning strong" style="font-size:13px">담을 때 ${won(360000)} → 지금 ${won(384000)} (24,000원 인상)</span></div>` : ''}
      </div>
      <div class="right" style="flex:none">
        <div class="price">${won(it.amt)}</div>
        <div class="btns mt3" style="justify-content:flex-end">
          ${isDead ? `<a class="btn btn-primary btn-sm" href="${link('PR0301')}">날짜 변경</a>`
        : `<a class="btn btn-ghost btn-sm" href="${link('CT0105')}">수정</a>`}
          <button class="btn btn-ghost btn-sm" type="button" data-toast="장바구니에서 삭제했어요" data-toast-act="되돌리기">삭제</button>
        </div>
      </div></div>`;
  };

  const payable = dead || id === 'CT0101' ? 568000 : (changed ? 592000 : 568000);

  const optEdit = !editOpt ? '' : card('옵션 수정 — 자유의 여신상 크루즈', `
    <div class="g2 g1-m" style="gap:24px">
      <div>${calendar({ sel: 6, month: '2026년 8월', closed: [10, 17, 24, 31], soldout: [5, 12], past: [1, 2], prices: () => '68,000' })}</div>
      <div>
        <div class="label">출발 회차</div>
        <div class="radio-list mb4">
          ${[['10:00', 12], ['14:00', 9], ['16:00', 2]].map(([t, l], i) => `<label class="radio${i === 1 ? ' on' : ''}" data-group="et">
            <input type="radio" name="et" ${i === 1 ? 'checked' : ''}><span class="grow"><b>${t}</b></span>
            <span class="${l <= 4 ? 'danger strong' : 'muted'}" style="font-size:13px">잔여 ${l}석</span></label>`).join('')}
        </div>
        <div class="label">인원</div>
        <div class="box mb4">
          <div class="row-b" style="padding:6px 0"><span>성인</span><div class="stepper"><button type="button" data-step="-">−</button><span class="num">2</span><button type="button" data-toast="사진을 더 올려요">＋</button></div></div>
          <div class="row-b" style="padding:6px 0"><span>아동</span><div class="stepper"><button type="button" data-step="-">−</button><span class="num">1</span><button type="button" data-toast="사진을 더 올려요">＋</button></div></div>
        </div>
        <div class="label">픽업 옵션</div>
        <div class="radio-list">
          <label class="radio on" data-group="ep"><input type="radio" name="ep" checked><span><b>집합 장소 이용</b><span class="sub">추가 요금 없음</span></span></label>
          <label class="radio" data-group="ep"><input type="radio" name="ep"><span><b>호텔 픽업</b><span class="sub">1인당 +12,000원</span></span></label>
        </div>
        ${banner('pri', 'ℹ', '변경한 조건의 잔여 좌석을 다시 확인했어요. <b>9석</b> 남아 예약 가능합니다.', { cls: 'mt4' })}
        ${U.sumRows([['변경 전 금액', won(184000)], ['변경 후 금액', won(190000)]], ['차액', '+6,000원'])}
        <div class="btns mt4"><button class="btn btn-primary" type="button" data-toast="옵션을 저장했어요" data-toast-kind="ok">저장</button>
          <a class="btn btn-ghost" href="${link('CT0101')}">취소</a></div>
      </div>
    </div>`, { cls: 'mb6' });

  const body = `${pageHd('장바구니', '담은 상품 3개 · 선택한 2개를 결제합니다')}
  ${stepbar(['장바구니', '여행자 정보', '결제', '완료'], 0)}

  ${dead ? banner('warn', '⚠', `<b>예약할 수 없는 항목이 1개 있어요.</b> 지난 날짜(7월 28일)라 결제 대상에서 자동으로 제외했습니다. 날짜를 바꾸거나 삭제해주세요.`, { cls: 'mb4' }) : ''}
  ${changed ? banner('warn', '↑', `<b>담아둔 뒤 가격이 바뀐 항목이 있어요.</b> 3대 전망대 통합권이 <b>24,000원 인상</b>되었습니다. 변경된 가격으로 결제하려면 동의해주세요.`, {
    cls: 'mb4',
    right: `<div class="btns"><button class="btn btn-primary btn-sm" type="button" data-toast="변경된 가격을 적용했어요">변경가 적용</button>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="담기를 취소했어요">담기 취소</button></div>`,
  }) : ''}

  ${optEdit}

  <div class="split-r"><div>
    <div class="row-b mb3"><label class="check"><input type="checkbox" checked><span class="strong">전체 선택 (2/3)</span></label>
      <button class="btn btn-ghost btn-sm" type="button" ${del ? 'data-modal="m-del"' : 'data-modal="m-del"'}>선택 삭제</button></div>
    ${CART.map(item).join('')}
    ${sec('이 상품도 함께 보세요', `<div class="carousel">${pcards([P('P04'), P('P06'), P('P10'), P('P12')], { noHeart: true })}</div>`, {})}
  </div><div>
    ${card('금액 요약', `${sumRows([
    ['상품 금액 (2개)', won(payable + 24000)],
    ['할인', '-24,000원', 'minus'],
    ['제외된 항목', '1개 (마감)'],
  ], ['총 결제 금액', won(payable)])}
      <p class="t-sub mt2">현지 통화 기준 약 $${Math.round(payable / 1380)}</p>
      <a class="btn btn-primary btn-block btn-lg mt4" href="${link('BK0101')}">예약하기</a>
      <p class="hint">결제 전까지는 좌석이 확보되지 않아요. 마감임박 상품은 서둘러주세요.</p>`, { cls: 'sticky' })}
  </div></div>

  ${modalTpl('m-del', '선택한 2개 상품을 삭제할까요?',
    `<p>선택 항목 <b>2개</b> · 합계 <b>${won(568000)}</b></p>
     <p class="t-sub mt3">삭제하면 담아둔 날짜와 옵션이 사라져요. 나중에 다시 보려면 찜으로 옮길 수 있어요.</p>`,
    `<button class="btn btn-ghost" type="button" data-dismiss>취소</button>
     <button class="btn btn-ghost" type="button" data-dismiss>찜으로 옮기기</button>
     <button class="btn btn-primary" type="button" data-dismiss>삭제</button>`, { lg: true })}`;

  return {
    body, o: {
      cart: 3,
      after: del ? modalEl('선택한 2개 상품을 삭제할까요?',
        `<p>선택 항목 <b>2개</b> · 합계 <b>${won(568000)}</b></p>
         <p class="t-sub mt3">삭제하면 담아둔 날짜와 옵션이 사라져요. 나중에 다시 보려면 찜으로 옮길 수 있어요.</p>`,
        `<button class="btn btn-ghost" type="button" data-dismiss>취소</button>
         <button class="btn btn-ghost" type="button" data-dismiss>찜으로 옮기기</button>
         <button class="btn btn-primary" type="button" data-dismiss>삭제</button>`, { lg: true }) : '',
      state: { CT0102: '마감 항목 경고 — 흐림 처리와 결제 대상 자동 제외', CT0103: '가격 변동 알림 — 이전가·현재가 비교와 동의', CT0104: '선택 삭제 확인 — 항목 수·금액 요약 모달', CT0105: '옵션 수정 — 날짜·회차·인원 재선택과 차액 반영' }[id] || '',
    },
  };
}

/* ===== CT02 장바구니 비어 있음 ===== */
export function CT0201(ctx) {
  const fromFav = ctx.id === 'CT0202';
  const body = `${pageHd('장바구니')}
  <div class="card">${empty('🛒', '아직 담은 상품이 없어요',
    '마음에 드는 투어와 입장권을 담아두면 한 번에 결제할 수 있어요.',
    `<a class="btn btn-primary btn-lg" href="${link('PR0101')}">인기 상품 둘러보기</a>`)}</div>

  ${fromFav ? sec('찜한 상품에서 바로 담기', `<div class="carousel">${[P('P11'), P('P02'), P('P07'), P('P04'), P('P12')].map((p) => `
    <div class="pcard">${ph(p.id, 'ph-43')}<div class="body">
      <div class="name">${esc(p.name)}</div>
      <div class="meta">${p.city} · ${p.dur}</div>
      <div class="price-row"><div class="price">${won(p.price)}</div>
        <a class="btn btn-primary btn-block btn-sm mt2" href="${link('PR0301')}">날짜 선택</a></div>
    </div></div>`).join('')}</div>
    <p class="t-sub mt3">찜한 상품이 없으면 이 자리에 인기 상품을 대신 보여드려요.</p>`) : ''}

  ${sec('최근 본 상품', `<div class="g4">${pcards([P('P01'), P('P02'), P('P04'), P('P06')])}</div>`)}
  ${fromFav ? '' : sec('찜한 상품에서 담기', `<div class="box row-b wrap-row"><div><b>찜한 상품 12개가 있어요</b>
    <p class="t-sub mt1">찜 목록에서 날짜만 고르면 바로 담을 수 있어요.</p></div>
    <a class="btn btn-ghost" href="${link('CT0202')}">찜한 상품에서 담기</a></div>`)}`;

  return { body, o: { state: fromFav ? '찜한 상품에서 담기 — 찜 목록 캐러셀과 날짜 선택 진입' : '' } };
}

/* ===== BK01 여행자 정보 입력 ===== */
export function BK0101(ctx) {
  const id = ctx.id;
  const nameErr = id === 'BK0102';
  const same = id === 'BK0103';
  const ageErr = id === 'BK0104';
  const agreeErr = id === 'BK0105';
  const p = P('P01');

  const traveler = (n, o = {}) => `<div class="card mb3"><div class="card-hd">
      <h3 class="t-card">여행자 ${n} ${o.type ? `<span class="muted" style="font-weight:400">(${o.type})</span>` : ''}</h3>
      ${n === 1 ? `<label class="check" style="padding:0"><input type="checkbox" ${same ? 'checked' : ''}><span>대표 예약자와 동일</span></label>` : ''}</div>
    <div class="card-bd"><div class="field-row">
      <div class="field"><label class="label">여권 영문명<span class="req">*</span></label>
        <input class="input ${o.err ? 'is-err' : ''}" value="${o.name || ''}" placeholder="HONG GILDONG"${o.dis ? ' disabled' : ''}>
        ${o.err ? `<p class="err">여권 영문명은 <b>대문자</b>로, 성과 이름 사이에만 공백을 넣어주세요. (예: HONG GILDONG)</p>
          <button class="btn btn-ghost btn-sm mt2" type="button" data-toast="대문자로 바꿨어요">자동 대문자 변환</button>`
      : `<p class="hint">여권과 똑같이 입력해주세요. 다르면 현지에서 입장이 거절될 수 있어요.</p>`}</div>
      <div class="field"><label class="label">생년월일<span class="req">*</span></label>
        <input class="input ${o.ageErr ? 'is-err' : ''}" value="${o.birth || ''}" placeholder="2014-05-20"${o.dis ? ' disabled' : ''}>
        ${o.ageErr ? `<p class="err">이용일(2026.08.03) 기준 <b>만 13세</b> 예요. 아동 요금(3~12세) 적용 대상이 아닙니다.</p>` : ''}
      </div>
    </div></div></div>`;

  const body = `${stepbar(['장바구니', '여행자 정보', '결제', '완료'], 1)}
  ${prodSummary(p, {
    date: '2026.08.03(월) 14:00', pax: '성인 2 · 아동 1',
    right: `<div class="price">${won(184000)}</div><div class="t-sub">총 결제 예정</div>`,
  })}
  <div class="mt6"></div>

  ${nameErr ? banner('danger', '⚠', '<b>여권 영문명 형식을 확인해주세요.</b> 아래 표시된 칸을 수정하면 다음 단계로 넘어갈 수 있어요.', { cls: 'mb4' }) : ''}
  ${ageErr ? banner('warn', '⚠', `<b>아동 나이 기준이 맞지 않아요.</b> 여행자 3의 나이가 아동 요금 기준(만 3~12세)을 넘습니다.
    <div class="mt2">성인 요금으로 바꾸면 <b>차액 20,000원</b> 이 추가돼요.</div>
    <div class="btns mt3"><a class="btn btn-primary btn-sm" href="${link('PR0301')}">인원 구성 수정</a>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="성인 요금으로 변경했어요">성인 요금으로 변경</button></div>`, { cls: 'mb4' }) : ''}
  ${same ? banner('pri', '✓', '<b>대표 예약자와 동일</b>을 체크해 여행자 1 칸을 자동으로 채웠어요. 체크를 해제하면 입력값이 지워집니다.', { cls: 'mb4' }) : ''}

  <div class="split-r"><div>
    ${card('대표 예약자', `<div class="field-row">
      <div class="field"><label class="label">한글 이름<span class="req">*</span></label><input class="input" value="김여행"></div>
      <div class="field"><label class="label">여권 영문명<span class="req">*</span></label><input class="input" value="KIM YEOHAENG">
        <p class="hint">여권과 동일하게 대문자로 입력</p></div>
    </div>
    <div class="field-row">
      <div class="field"><label class="label">휴대폰<span class="req">*</span></label><input class="input" value="010-1234-5678">
        <p class="hint">예약 확정·출발 알림을 이 번호로 보내드려요</p></div>
      <div class="field"><label class="label">이메일<span class="req">*</span></label><input class="input" value="kim@example.com">
        <p class="hint">바우처가 이 주소로 발송됩니다</p></div>
    </div>`, { cls: 'mb6' })}

    ${sec('여행자 정보 (3명)', `
      ${traveler(1, same ? { name: 'KIM YEOHAENG', birth: '1990-03-11', dis: true, type: '성인' } : { name: nameErr ? 'hong gildong' : 'KIM YEOHAENG', birth: '1990-03-11', err: nameErr, type: '성인' })}
      ${traveler(2, { name: 'LEE SORA', birth: '1992-07-02', type: '성인' })}
      ${traveler(3, { name: 'KIM HANEUL', birth: ageErr ? '2013-04-18' : '2016-04-18', ageErr, type: '아동' })}`)}

    ${card('호텔 픽업 정보', `<p class="t-sub mb3">픽업 옵션을 선택하셨어요. 호텔 정보를 입력해주세요.</p>
      <div class="field"><label class="label">호텔명</label><input class="input" value="Hilton Times Square"></div>
      <div class="field"><label class="label">호텔 주소</label><input class="input" value="234 W 42nd St, New York, NY 10036"></div>
      <p class="hint">픽업 예상 시각은 확정 후 바우처에 표시됩니다.</p>`, { cls: 'mb6' })}

    ${card('요청사항 (선택)', `<textarea class="textarea" placeholder="휠체어 이용, 알레르기, 좌석 요청 등 현지에 전달할 내용을 적어주세요">아이가 있어 앞쪽 좌석을 부탁드립니다.</textarea>
      <p class="hint">요청은 현지 사정에 따라 반영되지 않을 수 있어요.</p>`, { cls: 'mb6' })}

    ${card('약관 동의', `
      ${agreeErr ? banner('danger', '⚠', '<b>필수 항목에 동의해주세요.</b> 아래 두 항목을 체크하면 결제로 넘어갈 수 있어요.', { cls: 'mb3' }) : ''}
      <label class="check" style="${agreeErr ? 'background:rgba(192,57,43,.06);border-radius:8px;padding:8px' : ''}">
        <input type="checkbox" ${agreeErr ? '' : 'checked'}><span><b>[필수]</b> 취소·환불 규정에 동의합니다
        <span class="sub">출발 8일 전까지 100% · 7~4일 전 70% · 3~2일 전 50% · 1일 전부터 환불 불가 (현지 시각 기준)
        <a class="pri strong" href="${link('CS0501')}">전문 보기</a></span></span></label>
      <label class="check" style="${agreeErr ? 'background:rgba(192,57,43,.06);border-radius:8px;padding:8px' : ''}">
        <input type="checkbox" ${agreeErr ? '' : 'checked'}><span><b>[필수]</b> 개인정보 제3자 제공에 동의합니다
        <span class="sub">제공받는 자: 현지 운영사 (Statue Cruises LLC) · 제공 항목: 영문명, 생년월일, 연락처 · 목적: 예약 확인 및 현지 이용</span></span></label>
      <label class="check"><input type="checkbox"><span>[선택] 마케팅 정보 수신에 동의합니다<span class="sub">특가·기획전 소식을 카카오톡으로 받아요</span></span></label>`)}
  </div><div>
    ${card('결제 예정 금액', `${sumRows([
    ['성인 2명', won(136000)], ['아동 1명', won(48000)], ['유아 0명', '0원'],
  ], ['합계', won(184000)])}
      ${nameErr || ageErr || agreeErr
        ? `<span class="btn btn-primary btn-block btn-lg mt4 is-off"  aria-disabled="true">결제하기</span>`
        : `<a class="btn btn-primary btn-block btn-lg mt4 " href="${link('BK0201')}">결제하기</a>`}
      ${nameErr ? '<p class="err">여권 영문명을 수정해주세요.</p>' : ''}
      ${ageErr ? '<p class="err">인원 구성을 수정해주세요.</p>' : ''}
      ${agreeErr ? '<p class="err">필수 동의 항목을 체크해주세요.</p>' : ''}
      <p class="hint">결제 단계에서 쿠폰과 포인트를 사용할 수 있어요.</p>`, { cls: 'sticky' })}
  </div></div>`;

  return {
    body, o: {
      cart: 3, logged: true,
      state: { BK0102: '영문명 형식 오류 — 규칙 위반 강조와 자동 변환 제안', BK0103: '대표 예약자와 동일 체크 — 첫 칸 자동 채움', BK0104: '아동 나이 기준 불일치 — 만 나이 계산과 차액 안내', BK0105: '필수 동의 미체크 — 항목 강조와 결제 버튼 비활성' }[id] || '',
    },
  };
}

/* ===== BK02 결제 ===== */
export function BK0201(ctx) {
  const id = ctx.id;
  const cpn = id === 'BK0202';
  const cpnFail = id === 'BK0203';
  const oversea = id === 'BK0204';
  const paying = id === 'BK0205';
  const fx = id === 'BK0206';
  const p = P('P01');

  const base = 184000;
  const disc = cpn ? 27600 : 0;
  const point = 3000;
  const total = base - disc - point;

  const couponBox = card('쿠폰 · 포인트', `
    <div class="field"><label class="label">보유 쿠폰</label>
      <select class="select"><option ${cpn ? 'selected' : ''}>15% 기획전 쿠폰 (최대 30,000원)</option>
        <option>10% 첫 예약 쿠폰</option><option ${cpnFail ? 'selected' : ''}>5,000원 야경 쿠폰 — 적용 불가</option><option>쿠폰 사용 안 함</option></select>
      ${cpn ? `<p class="ok">15% 할인 <b>27,600원</b> 이 적용되었어요.</p>` : ''}
      ${cpnFail ? `<p class="err">이 쿠폰은 적용할 수 없어요 — <b>야경 카테고리 전용</b> 쿠폰입니다.</p>` : ''}
    </div>
    ${cpn ? `<div class="col mb4">
      ${COUPONS.slice(0, 3).map((c, i) => `<div class="row-b box" style="padding:12px 16px">
        <div><b>${c.v} ${c.name}</b><div class="t-sub">${c.min} · ${c.until}까지 · ${c.target}</div></div>
        ${i === 0 ? badge('적용 중', 'b-ok') : (i === 2 ? badge('최소 금액 미달', 'b-mut') : `<button class="btn btn-ghost btn-sm" type="button" data-toast="적용했어요">적용</button>`)}</div>`).join('')}
      <p class="hint">쿠폰끼리는 중복 사용할 수 없어요. 포인트와는 함께 쓸 수 있습니다.</p></div>` : ''}
    ${cpnFail ? `<div class="box-warn mb4">
      <b>적용할 수 없는 이유</b>
      <ul class="mt2">${['대상 상품이 아니에요 — 야경 카테고리 전용 쿠폰입니다', '이 쿠폰의 최소 결제 금액은 50,000원이며 조건은 충족했습니다', '기한(2026.08.02)은 아직 남아 있어요']
      .map((t) => `<li class="t-sub" style="padding:2px 0">· ${t}</li>`).join('')}</ul>
      <div class="btns mt3"><button class="btn btn-primary btn-sm" type="button" data-toast="10% 첫 예약 쿠폰을 적용했어요">대체 쿠폰 적용 (10%)</button>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="쿠폰 적용을 해제했어요">적용 해제</button></div></div>` : ''}
    <div class="field"><label class="label">쿠폰 코드 직접 입력</label>
      <div class="row"><input class="input" placeholder="예: SUMMER2026"><button class="btn btn-ghost" type="button" style="flex:none" data-toast="쿠폰을 등록했어요. 결제할 때 고르실 수 있어요" data-toast-kind="ok">등록</button></div></div>
    <div class="field"><label class="label">포인트 사용 <span class="muted" style="font-weight:400">(보유 3,500P)</span></label>
      <div class="row"><input class="input" value="3,000"><button class="btn btn-ghost" type="button" style="flex:none" data-toast="가진 적립금을 모두 썼어요">전액 사용</button></div>
      <p class="hint">100P 단위로 사용할 수 있어요.</p></div>`, { cls: 'mb6' });

  const payMethod = card('결제 수단', `
    ${tabs([{ label: '신용·체크카드', pane: 'card' }, { label: '간편결제', pane: 'easy' }, { label: '해외 발행 카드', pane: 'oversea' }], oversea ? 2 : 0, { pill: true })}
    <div data-pane-body="card" ${oversea ? 'hidden' : ''}>
      <div class="g2 g1-m">
        <div class="field"><label class="label">카드 종류</label><select class="select"><option>신한카드</option><option>국민카드</option><option>현대카드</option></select></div>
        <div class="field"><label class="label">할부</label><select class="select"><option>일시불</option><option>2개월 무이자</option><option>3개월 무이자</option></select></div>
      </div>
      <p class="hint">카드 정보는 결제창에서 안전하게 입력합니다. 이 화면에서는 카드번호를 받지 않아요.</p>
    </div>
    <div data-pane-body="easy" hidden>
      <div class="g3 g1-m">${['카카오페이', '네이버페이', '토스페이'].map((t, i) => `<label class="radio${i === 0 ? ' on' : ''}" data-group="ez"><input type="radio" name="ez" ${i === 0 ? 'checked' : ''}><span><b>${t}</b></span></label>`).join('')}</div>
    </div>
    <div data-pane-body="oversea" ${oversea ? '' : 'hidden'}>
      <div class="field-row">
        <div class="field"><label class="label">카드 번호</label><input class="input" placeholder="1234 5678 9012 3456" inputmode="numeric"></div>
        <div class="field"><label class="label">유효기간 / CVC</label><div class="row"><input class="input" placeholder="MM/YY"><input class="input" placeholder="CVC"></div></div>
      </div>
      <div class="field"><label class="label">결제 통화</label>
        <div class="radio-list">
          <label class="radio on" data-group="cur"><input type="radio" name="cur" checked><span><b>원화 결제 (KRW ${num(total)}원)</b><span class="sub">국내 승인 · 이중환전 수수료 없음</span></span></label>
          <label class="radio" data-group="cur"><input type="radio" name="cur"><span><b>현지 통화 결제 (USD $${Math.round(total / 1380)})</b><span class="sub">카드사에서 원화로 환전하며 1~3% 수수료가 붙을 수 있어요</span></span></label>
        </div></div>
      ${banner('warn', '⚠', '해외 발행 카드는 카드사에서 <b>해외결제가 차단</b>되어 있으면 승인이 거절됩니다. 차단 상태는 카드사 앱에서 해제할 수 있어요.', { cls: 'mt4' })}
    </div>`, { cls: 'mb6' });

  const sumCard = card('금액 요약', `${sumRows([
    ['상품 금액', won(base)],
    ...(disc ? [['쿠폰 할인 (15%)', '-' + won(disc), 'minus']] : []),
    ['포인트 사용', '-' + won(point), 'minus'],
  ], ['최종 결제 금액', won(total)])}
    <p class="t-sub mt2">현지 통화 기준 약 <b>$${Math.round(total / 1380)}</b> (1 USD = 1,380원)</p>
    ${fx ? banner('warn', '💱', `<b>환율은 계속 바뀝니다.</b> 기준 시각 2026.07.30 09:00<br>
      카드사 적용 환율과 차이가 있어 <b>최종 청구액이 달라질 수 있어요.</b>`, { cls: 'mt3' }) : ''}
    <button class="btn btn-primary btn-block btn-lg mt4" type="button" ${paying ? 'disabled' : `onclick="location.href='${link('BK0301')}'"`}>
      ${paying ? '결제 진행 중…' : won(total) + ' 결제하기'}</button>
    ${paying ? `<div class="center mt4"><div class="spinner"></div>
      <p class="t-sub mt3"><b>결제창을 불러오고 있어요.</b><br>새로고침하거나 창을 닫지 말아주세요.</p>
      <p class="t-sub mt2">30초 이상 응답이 없으면 자동으로 취소되고 다시 시도할 수 있어요.</p></div>` : ''}
    <p class="hint">결제 버튼을 누른 뒤에는 중복 결제되지 않도록 버튼이 비활성화됩니다.</p>
    <p class="t-sub mt3"><a class="pri" href="${link('BK0401')}">결제 실패 화면 보기</a></p>`, { cls: 'sticky' });

  const body = `${stepbar(['장바구니', '여행자 정보', '결제', '완료'], 2)}
  ${fx ? banner('pri', '💱', '<b>환율 변동 안내</b> — 현재 1 USD = 1,380원 (2026.07.30 09:00 기준). 결제 시점과 카드사 청구 시점의 환율이 달라질 수 있어요.', { cls: 'mb4' }) : ''}
  <div class="split-r"><div>
    ${card('예약 내역', `${prodSummary(p, { date: '2026.08.03(월) 14:00', pax: '성인 2 · 아동 1' })}
      <div class="mt4">${kv([
    ['여행자', 'KIM YEOHAENG · LEE SORA · KIM HANEUL'],
    ['미팅 장소', '배터리파크 11번 부두 (13:45 집합)'],
    ['픽업', 'Hilton Times Square · 예상 13:05'],
    ['확정 방식', '즉시확정 — 결제 후 바로 바우처 발급'],
  ])}</div>`, { cls: 'mb6' })}
    ${couponBox}
    ${payMethod}
    ${card('결제 전 확인', `<label class="check"><input type="checkbox" checked><span><b>[필수]</b> 결제 대행 서비스 이용약관에 동의합니다</span></label>
      <label class="check"><input type="checkbox" checked><span><b>[필수]</b> 위 예약 내용과 취소·환불 규정을 확인했습니다</span></label>`)}
  </div><div>${sumCard}</div></div>`;

  return {
    body, o: {
      cart: 3, logged: true,
      after: paying ? '' : '',
      state: { BK0202: '쿠폰 적용 — 보유 쿠폰 목록과 즉시 반영', BK0203: '쿠폰 적용 불가 — 사유별 문구와 대체 쿠폰 추천', BK0204: '해외결제 카드 탭 — 결제 통화 선택과 수수료 안내', BK0205: '결제 진행 중 — 중복 클릭 차단과 타임아웃 경로', BK0206: '환율 변동 안내 — 기준 시각과 청구액 차이 고지' }[id] || '',
    },
  };
}

/* ===== BK03 예약 완료 ===== */
export function BK0301(ctx) {
  const id = ctx.id;
  const waiting = id === 'BK0302';
  const cal = id === 'BK0303';

  const body = `<div class="wrap-narrow" style="padding:0">
  <div class="card"><div class="card-bd center" style="padding:48px 20px">
    <div style="font-size:48px;color:var(--success)">✓</div>
    <h1 class="t-page mt3">${waiting ? '예약이 접수되었어요' : '예약이 확정되었어요'}</h1>
    <p class="t-sub mt2">${waiting ? '즉시확정 1건은 확정되었고, 1건은 현지 확인 중이에요' : '바우처가 발급되었어요. 현지에서 QR을 보여주면 바로 이용할 수 있어요'}</p>
    <div class="box mt6" style="display:inline-block;padding:12px 24px"><span class="t-sub">예약번호</span>
      <div class="t-sec" style="letter-spacing:.02em">TN2607-284193</div></div>
  </div></div>

  ${waiting ? `<div class="mt6">
    ${card('즉시확정 1건', `${prodSummary(P('P01'), { date: '2026.08.03(월) 14:00', pax: '성인 2 · 아동 1', state: '확정', stateCls: 'b-ok', right: `<a class="btn btn-primary btn-sm" href="${link('VC0201')}">바우처 보기</a>` })}`, { cls: 'mb4' })}
    ${card('확정 대기 1건', `${prodSummary(P('P04'), { date: '2026.08.04(화) 18:30', pax: '성인 2', state: '확정 대기', stateCls: 'b-warn', right: `<a class="btn btn-ghost btn-sm" href="${link('BK0501')}">대기 상세</a>` })}
      ${banner('warn', '⏱', `<b>예상 확정 시각 — 8월 1일 18:00 (한국 시각)</b><br>
        보통 24시간 안에 확정돼요. 확정되면 카카오톡과 이메일로 알려드릴게요.
        <div class="mt2">확정 전에 취소하시면 <b>전액 환불</b>됩니다.</div>`, { cls: 'mt4' })}
      <div class="row-c mt4"><span class="t-sub">알림 채널</span>${badge('카카오톡 010-****-5678', 'b-line')}${badge('kim@example.com', 'b-line')}</div>`)}
  </div>` : `
  ${sec('예약 상품', card('', prodSummary(P('P01'), {
    date: '2026.08.03(월) 14:00 · 3시간', pax: '성인 2 · 아동 1', state: '확정', stateCls: 'b-ok',
    right: `<div class="price">${won(184000)}</div><div class="t-sub">결제 완료</div>`,
  })), { moreLabel: '' })}`}

  ${sec('', banner('pri', '🎫', `<b>바우처는 마이페이지에서 바로 확인할 수 있어요.</b> 현지에서 인터넷이 안 될 수 있으니 미리 이미지로 저장해두세요.`, {
    right: `<a class="btn btn-primary" href="${link('VC0201')}">바우처 보기</a>`,
  }))}

  ${sec('미팅 장소와 시간', `<div class="box-pri">
    <div class="g2 g1-m" style="gap:24px">
      <div>${kv([
    ['집합 시각', '<b>2026년 8월 3일(월) 13:45</b> (현지 시각)'],
    ['출발 시각', '14:00 — 15분 전까지 도착해주세요'],
    ['집합 장소', '배터리파크 11번 부두 (Battery Park, Pier 11)'],
    ['찾는 법', '파란 깃발을 든 가이드를 찾아주세요'],
    ['픽업', 'Hilton Times Square 로비 · 예상 13:05'],
  ])}
        <div class="btns mt4"><button class="btn btn-ghost btn-sm" type="button" data-toast="지도 앱을 열어 이곳까지 길을 안내해요">길찾기</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="주소를 복사했어요">현지어 주소 복사</button></div></div>
      <div>${phMap('ph-map', [{ x: 44, y: 48, n: '📍', name: '배터리파크 11번 부두', on: true }], '배터리파크 11번 부두')}</div>
    </div></div>`)}

  ${cal ? sec('캘린더에 추가', `<div class="card"><div class="card-bd">
      <p>일정을 캘린더에 저장하면 출발 전날 알림을 받을 수 있어요.</p>
      <div class="btns mt4"><button class="btn btn-primary" type="button" data-toast="구글 캘린더에 저장했어요" data-toast-kind="ok">구글 캘린더에 추가</button>
        <button class="btn btn-ghost" type="button" data-toast="애플 캘린더에 저장했어요" data-toast-kind="ok">애플 캘린더에 추가</button>
        <button class="btn btn-ghost" type="button" data-toast="일정 파일을 내려받았어요. 달력 앱에서 열어 보세요" data-toast-kind="ok">.ics 파일 내려받기</button></div>
      <div class="box mt4">${kv([
    ['제목', '자유의 여신상 크루즈 (트래블나우)'],
    ['시각', '2026.08.03 13:45 ~ 17:00 — <b>현지 시간대(America/New_York)로 저장</b>'],
    ['장소', 'Battery Park, Pier 11, New York'],
    ['알림', '출발 전날 20:00 · 당일 2시간 전'],
    ['메모', '예약번호 TN2607-284193 · 여권 지참 · 파란 깃발 가이드'],
  ])}</div>
      <p class="hint">현지 시간대로 저장되므로 한국에서 보면 8월 4일 02:45로 표시될 수 있어요.</p>
    </div></div>`) : ''}

  ${sec('출발 전 준비물', `<div class="card"><div class="card-bd">
    ${['여권 (현장에서 이름 확인)', '바우처 — 화면 또는 인쇄물', '편한 신발과 바람막이 (갑판은 바람이 셉니다)', '자외선 차단제와 모자', '현장 결제용 소액 현금 또는 카드']
      .map((t) => `<label class="check"><input type="checkbox"><span>${t}</span></label>`).join('')}
  </div></div>`)}

  <div class="btns mt8" style="justify-content:center">
    <a class="btn btn-primary btn-lg" href="${link('MY0301')}">예약 내역 보기</a>
    ${cal ? '' : `<a class="btn btn-ghost btn-lg" href="${link('BK0303')}">캘린더에 추가</a>`}
    <a class="btn btn-ghost btn-lg" href="${link('PR0101')}">다른 상품 둘러보기</a>
  </div></div>`;

  return {
    body, o: {
      logged: true, wrapCls: 'wrap-narrow',
      state: waiting ? '확정 대기 상품 포함 — 즉시확정·대기 분리 표시' : cal ? '캘린더 추가 — 현지 시간대 저장과 알림 설정' : '',
    },
  };
}

/* ===== BK04 결제 실패 ===== */
export function BK0401(ctx) {
  const id = ctx.id;
  const blocked = id === 'BK0402';
  const expired = id === 'BK0403';

  const reason = blocked ? '카드사에서 해외결제를 차단했어요'
    : expired ? '결제가 지연되어 선점한 좌석이 풀렸어요'
      : '카드사에서 승인을 거절했어요 (한도 초과)';

  const body = `<div class="card"><div class="card-bd center" style="padding:48px 20px">
    <div style="font-size:48px;color:var(--danger)">⚠</div>
    <h1 class="t-page mt3">결제가 완료되지 않았어요</h1>
    <p class="t-sec mt3" style="color:var(--danger)">${reason}</p>
    <div class="box-ok mt6" style="display:inline-block"><b>요금은 청구되지 않았습니다.</b>
      <div class="t-sub mt1">카드사 앱에 승인 내역이 보인다면 승인 취소 대기 상태이며 자동으로 사라져요.</div></div>
  </div></div>

  ${blocked ? `${sec('해외결제 차단 해제 방법', `<div class="steps">
      ${[['카드사 앱 실행', '신한카드 앱 → 카드 관리'], ['해외 사용 설정', '해외 온라인 결제 → 사용 허용으로 변경'], ['다시 결제', '5분 뒤 다시 시도하면 승인됩니다']]
      .map(([t, d], i) => `<div class="step"><div class="n">${i + 1}</div><div class="t-card" style="font-size:16px">${t}</div><p class="t-sub mt1">${d}</p></div>`).join('')}</div>`)}
    ${sec('카드사 연락처', U.table([{ t: '카드사', w: '30%' }, '고객센터', '해외결제 해제 메뉴'], [
      ['신한카드', '1544-7000', '앱 → 카드관리 → 해외사용'],
      ['국민카드', '1588-1688', '앱 → 안심서비스 → 해외거래'],
      ['현대카드', '1577-6000', '앱 → 카드관리 → 해외이용'],
      ['삼성카드', '1588-8700', '앱 → 보안 → 해외결제'],
    ]))}
    ${sec('', banner('pri', '💡', '해제가 번거로우시면 <b>간편결제(카카오페이·네이버페이)</b> 로 결제하시면 바로 승인됩니다.', {
      right: `<a class="btn btn-primary" href="${link('BK0201')}">다른 수단으로 결제</a>`,
    }))}`
      : expired ? `
    ${sec('', banner('warn', '⏱', `<b>좌석 선점 시간(15분)이 지났어요.</b> 결제 중에 다른 여행자가 예약을 완료했을 수 있어요.`))}
    ${sec('선택하신 조건의 잔여 좌석', U.table([{ t: '회차', w: '26%' }, '잔여 좌석', '상태', ''], [
        { cls: '', cells: ['8월 3일 14:00', '<b class="danger">2자리</b>', '요청 3자리 부족', `<span class="badge b-danger">예약 불가</span>`] },
        { cls: '', cells: ['8월 3일 16:00', '9자리', '예약 가능', `<a class="btn btn-primary btn-sm" href="${link('PR0301')}">이 회차로 담기</a>`] },
        { cls: '', cells: ['8월 4일 14:00', '18자리', '예약 가능', `<a class="btn btn-ghost btn-sm" href="${link('PR0301')}">이 회차로 담기</a>`] },
      ]))}
    ${sec('', banner('pri', 'ℹ', '같은 조건으로 다시 담으면 <b>15분 동안</b> 좌석이 다시 선점됩니다. 결제까지 끝내주세요.', {
        right: `<a class="btn btn-primary" href="${link('CT0101')}">같은 조건 다시 담기</a>`,
      }))}`
        : `
    ${sec('이런 경우가 많아요', `<div class="g3 g1-m">${[
          ['카드 한도 초과', '이번 달 사용 한도나 1회 결제 한도를 넘었을 수 있어요. 카드사 앱에서 확인해보세요.'],
          ['해외결제 차단', '해외 가맹점 결제가 막혀 있으면 승인이 거절돼요. 카드사 앱에서 해제할 수 있어요.'],
          ['카드 정보 불일치', '유효기간이나 CVC를 다시 확인해주세요. 3회 이상 틀리면 일시 차단됩니다.'],
        ].map(([t, d]) => `<div class="card"><div class="card-bd"><div class="t-card" style="font-size:16px">${t}</div><p class="t-sub mt2">${d}</p></div></div>`).join('')}</div>`)}`}

  <div class="btns mt8" style="justify-content:center">
    <a class="btn btn-primary btn-lg" href="${link('BK0201')}">다시 시도하기</a>
    <a class="btn btn-ghost btn-lg" href="${link('BK0201')}">다른 결제 수단으로 해보기</a>
    <a class="btn btn-ghost btn-lg" href="${link('CS0201')}">고객센터 문의</a>
  </div>
  <p class="t-sub center mt4">${blocked ? '카드사 차단은 트래블나우에서 해제할 수 없어요. 카드사에 직접 요청해주세요.' : '같은 문제가 반복되면 고객센터로 알려주세요. 예약번호 없이도 도와드립니다.'}</p>`;

  return {
    body, o: {
      cart: 3, logged: true, wrapCls: 'wrap-narrow',
      state: blocked ? '해외결제 차단 사유 — 해제 방법과 카드사 연락처' : expired ? '좌석 선점 만료 — 잔여 좌석 재확인과 대체 회차' : '',
    },
  };
}

/* ===== BK05 예약 확정 대기 ===== */
export function BK0501(ctx) {
  const id = ctx.id;
  const done = id === 'BK0502';
  const rejected = id === 'BK0503';
  const p = P('P04');

  const body = `<div class="card"><div class="card-bd center" style="padding:48px 20px">
    <div style="font-size:48px;color:${done ? 'var(--success)' : rejected ? 'var(--danger)' : 'var(--warning)'}">${done ? '✓' : rejected ? '✕' : '⏱'}</div>
    <h1 class="t-page mt3">${done ? '예약이 확정되었어요' : rejected ? '현지에서 좌석을 확보하지 못했어요' : '현지 확인 중이에요'}</h1>
    <p class="t-sub mt2">${done ? '2026년 7월 30일 11:24 에 확정되었습니다'
      : rejected ? '현지 운영사에서 해당 회차 좌석이 이미 마감되었다고 회신했어요'
        : '보통 24시간 안에 확정돼요. 늦어도 8월 1일 18:00까지 알려드릴게요'}</p>
    <div class="box mt6" style="display:inline-block;padding:12px 24px"><span class="t-sub">예약번호</span>
      <div class="t-sec">TN2607-284188</div></div>
  </div></div>

  <div class="mt6">${card('', prodSummary(p, {
    date: '2026.08.04(화) 18:30 · 4시간', pax: '성인 2',
    state: done ? '확정' : rejected ? '확정 실패' : '확정 대기',
    stateCls: done ? 'b-ok' : rejected ? 'b-danger' : 'b-warn',
    right: `<div class="price">${won(158000)}</div><div class="t-sub">${rejected ? '환불 예정' : '결제 완료'}</div>`,
  }))}</div>

  ${done ? `
  ${sec('', banner('ok', '🎫', '<b>바우처가 발급되었어요.</b> 현지에서 QR을 보여주면 바로 이용할 수 있어요.', {
    right: `<a class="btn btn-primary" href="${link('VC0201')}">바우처 보기</a>`,
  }))}
  ${sec('미팅 장소와 시간', `<div class="box-pri">${kv([
    ['집합 시각', '<b>2026년 8월 4일(화) 18:15</b> (현지 시각)'],
    ['집합 장소', '브루클린브리지역 1번 출구 앞'],
    ['가이드 연락처', '+1 917-000-0000'],
    ['준비물', '삼각대는 현장 대여 가능 · 편한 신발'],
  ])}
    <div class="btns mt4"><button class="btn btn-ghost btn-sm" type="button" data-toast="지도 앱을 열어 이곳까지 길을 안내해요">길찾기</button>
      <a class="btn btn-ghost btn-sm" href="${link('MY0501')}">예약 상세</a></div></div>`)}`
      : rejected ? `
  ${sec('', banner('danger', '⚠', `<b>결제하신 금액은 전액 환불됩니다.</b> 별도 신청이 필요하지 않아요.
    <div class="mt2">환불 예정일 — <b>2026년 8월 3일</b> (카카오페이 1~3영업일)</div>`))}
  ${sec('대체 날짜 · 상품 추천', `<div class="g2 g1-m mb4">
    ${card('같은 상품, 다른 날짜', `<div class="col">
      ${[['8월 5일(수) 18:30', '잔여 6석', true], ['8월 7일(금) 18:30', '잔여 12석', true]].map(([d, l]) => `
        <div class="row-b box" style="padding:12px 16px"><div><b>${d}</b><div class="t-sub">${l} · 확정된 회차</div></div>
        <a class="btn btn-primary btn-sm" href="${link('PR0301')}">예약</a></div>`).join('')}</div>`)}
    ${card('비슷한 야경 상품', `<div class="col">
      ${[P('P06'), P('P02')].map((x) => `<div class="row-b box" style="padding:12px 16px"><div><b style="font-size:14px">${esc(x.name.slice(0, 24))}…</b>
        <div class="t-sub">${won(x.price)} · ${stars(x.rating)} ${x.rating.toFixed(1)}</div></div>
        <a class="btn btn-ghost btn-sm" href="${link('PR0201')}">보기</a></div>`).join('')}</div>`)}
  </div>
  <div class="btns" style="justify-content:center"><a class="btn btn-ghost btn-lg" href="${link('CS0201')}">고객센터 문의</a></div>`)}`
        : `
  ${sec('왜 대기가 필요한가요?', `<div class="card"><div class="card-bd">
    <p>이 상품은 <b>현지 운영사가 직접 좌석을 배정</b>하는 상품이에요. 결제 후 현지에 요청을 보내고, 좌석이 확인되면 확정됩니다.</p>
    ${kv([
          ['예상 확정 시각', '<b>2026년 8월 1일 18:00 (한국 시각)</b> 이전'],
          ['확정 알림', '카카오톡 010-****-5678 · kim@example.com'],
          ['현재 상태', '현지 운영사 확인 요청 전송 완료 (7월 30일 09:12)'],
        ])}
  </div></div>`)}
  ${sec('', banner('ok', '✓', '<b>확정 전에 취소하시면 전액 환불돼요.</b> 취소 수수료가 발생하지 않습니다.', {
          right: `<a class="btn btn-ghost" href="${link('MY0601')}">취소 신청</a>`,
        }))}
  ${sec('확정되면', `<div class="steps">
    ${[['확정 알림 발송', '카카오톡과 이메일로 즉시 알려드려요'], ['바우처 발급', '마이페이지 > 바우처에서 QR을 확인하세요'], ['미팅 정보 안내', '집합 시각·장소가 바우처에 표시됩니다']]
            .map(([t, d], i) => `<div class="step"><div class="n">${i + 1}</div><div class="t-card" style="font-size:16px">${t}</div><p class="t-sub mt1">${d}</p></div>`).join('')}</div>`)}`}

  <div class="btns mt8" style="justify-content:center">
    <a class="btn btn-primary btn-lg" href="${link('MY0301')}">예약 내역 보기</a>
    ${done ? `<a class="btn btn-ghost btn-lg" href="${link('VC0201')}">바우처 보기</a>` : ''}
  </div>`;

  return {
    body, o: {
      logged: true, wrapCls: 'wrap-narrow',
      state: done ? '확정됨 — 확정 시각과 바우처 발급 알림' : rejected ? '현지 거절(확정 실패) — 전액 환불 일정과 대체 추천' : '',
    },
  };
}

/* ===== BK06 최소 인원 미달 안내 ===== */
export function BK0601(ctx) {
  const id = ctx.id;
  const auto = id === 'BK0602';
  const share = id === 'BK0603';
  const p = P('P07');

  const body = `<div class="card"><div class="card-bd center" style="padding:48px 20px">
    <div style="font-size:48px;color:${auto ? 'var(--muted)' : 'var(--warning)'}">${auto ? '✕' : '👥'}</div>
    <h1 class="t-page mt3">${auto ? '인원이 모이지 않아 자동 취소되었어요' : '아직 출발이 확정되지 않았어요'}</h1>
    <p class="t-sub mt2">${auto ? '확정 마감 시각(8월 1일 18:00)까지 최소 인원 6명이 모이지 않았습니다' : '최소 출발 인원을 채우면 바로 확정돼요'}</p>
  </div></div>

  <div class="mt6">${card('', prodSummary(p, {
    date: '2026.08.03(월) 07:00 · 12시간', pax: '성인 2',
    state: auto ? '자동 취소' : '확정 대기', stateCls: auto ? 'b-mut' : 'b-warn',
    right: `<div class="price">${won(296000)}</div><div class="t-sub">${auto ? '전액 환불 예정' : '결제 완료'}</div>`,
  }))}</div>

  ${sec('출발 확정 현황', `<div class="card"><div class="card-bd">
    <div class="row-b mb3"><span class="t-card">현재 <b class="${auto ? 'muted' : 'pri'}">4명</b> / 최소 출발 <b>6명</b></span>
      <span class="badge ${auto ? 'b-mut' : 'b-warn'}">${auto ? '마감 종료' : '2명 더 필요'}</span></div>
    ${progress(66, !auto)}
    <p class="t-sub mt3">${auto ? '마감 시각까지 5명에서 멈췄어요.' : '같은 회차를 예약한 여행자는 현재 4명입니다.'}</p>
  </div></div>`)}

  ${auto ? `
  ${sec('', banner('ok', '💳', `<b>결제 금액 296,000원이 전액 환불됩니다.</b> 취소 수수료는 없어요.
    <div class="t-sub mt2">환불 처리 일정 — 신한카드 3~5영업일 · 예정일 2026년 8월 6일</div>`))}
  ${sec('', banner('acc' === 'acc' ? 'warn' : 'warn', '🎁', `불편을 드려 죄송해요. <b>10% 사과 쿠폰</b>을 쿠폰함에 넣어드렸어요. 유효기간 60일.`, {
    right: `<a class="btn btn-ghost" href="${link('MY0901')}">쿠폰함 보기</a>`,
  }))}
  ${sec('확정된 다른 회차', U.table([{ t: '출발일', w: '26%' }, '모인 인원', '상태', ''], [
    { cls: '', cells: ['8월 5일(수) 07:00', '9명 / 6명', '<span class="badge b-ok">출발 확정</span>', `<a class="btn btn-primary btn-sm" href="${link('PR0301')}">즉시 예약</a>`] },
    { cls: '', cells: ['8월 8일(금) 07:00', '7명 / 6명', '<span class="badge b-ok">출발 확정</span>', `<a class="btn btn-ghost btn-sm" href="${link('PR0301')}">즉시 예약</a>`] },
    { cls: '', cells: ['8월 10일(일) 07:00', '3명 / 6명', '<span class="badge b-warn">모집 중</span>', `<a class="btn btn-ghost btn-sm" href="${link('PR0301')}">예약</a>`] },
  ]))}`
      : `
  ${sec('', banner('warn', '⏱', `<b>8월 1일 18:00 (현지 시각)</b> 까지 인원이 차지 않으면 <b>자동 취소되고 전액 환불</b>돼요.
    <div class="t-sub mt2">자동 취소 시 취소 수수료는 없으며, 사과 쿠폰을 함께 드립니다.</div>`))}

  ${share ? `${sec('친구에게 공유하기', `<div class="card"><div class="card-bd">
      <div class="box mb4"><p class="t-sub mb2">이런 문구로 전달돼요</p>
        <p>"8월 3일 칸쿤 세노테 투어 같이 갈 사람! <b>2명만 더 모이면 출발 확정</b>이야. 여기서 예약하면 돼 → https://travelnow.kr/i/x8Kd2"</p></div>
      <div class="g4 g1-m mb4">${['카카오톡', '문자', '링크 복사', '인스타 DM'].map((t, i) => `
        <button class="btn ${i === 0 ? 'btn-accent' : 'btn-ghost'}" type="button" data-toast="${i === 2 ? '링크를 복사했어요' : t + '으로 공유했어요'}" data-toast-kind="ok">${t}</button>`).join('')}</div>
      ${banner('ok', '✓', '<b>링크를 복사했어요.</b> 붙여넣어 전달하면 초대 유입 현황이 아래에 표시됩니다.', { cls: 'mb4' })}
      ${U.table([{ t: '초대 현황', w: '40%' }, '수', '비고'], [
        ['링크 열어본 사람', '12명', '최근 1시간 3명'],
        ['상품 상세까지 본 사람', '5명', ''],
        ['예약 완료', '1명', '남은 인원 1명'],
      ])}
    </div></div>`)}` : `${sec('', banner('pri', '👋', `함께 갈 친구가 있다면 초대해보세요. <b>2명만 더</b> 모이면 바로 확정됩니다.`, {
        right: `<a class="btn btn-primary" href="${link('BK0603')}">친구에게 공유하기</a>`,
      }))}`}

  ${sec('확정된 다른 날짜', U.table([{ t: '출발일', w: '26%' }, '모인 인원', '상태', ''], [
        { cls: '', cells: ['8월 5일(수) 07:00', '9명 / 6명', '<span class="badge b-ok">출발 확정</span>', `<a class="btn btn-primary btn-sm" href="${link('PR0301')}">이 날짜로 변경</a>`] },
        { cls: '', cells: ['8월 8일(금) 07:00', '7명 / 6명', '<span class="badge b-ok">출발 확정</span>', `<a class="btn btn-ghost btn-sm" href="${link('PR0301')}">이 날짜로 변경</a>`] },
      ]))}
  ${sec('비슷한 상품', `<div class="g4">${pcards([P('P08'), P('P13'), P('P11'), P('P09')], { noHeart: true })}</div>`)}`}

  <div class="btns mt8" style="justify-content:center">
    <a class="btn btn-primary btn-lg" href="${link('MY0301')}">예약 내역 보기</a>
    <a class="btn btn-ghost btn-lg" href="${link('CS0201')}">고객센터 문의</a></div>`;

  return {
    body, o: {
      logged: true, wrapCls: 'wrap-narrow',
      state: auto ? '자동 취소 확정 — 환불 일정과 사과 쿠폰' : share ? '친구 초대 공유 — 초대 문구 생성과 유입 현황' : '',
    },
  };
}
