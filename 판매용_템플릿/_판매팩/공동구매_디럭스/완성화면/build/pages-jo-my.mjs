/* JO 참여·결제 4장 · MY 내 공구함 4장 */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, countdown, tierTable, dealCards, leftText, timeline, sumRows, stepbar,
  pageHd, stickBar, detail2, myPage, num, won, esc, link, off,
} from './ui.mjs';
import { DEALS, dealById, pctOf, TIERS, OPTIONS, MY_JOINS } from './data.mjs';

/* ── JO-01 옵션·수량 선택 ───────────────────────────── */
function jo01() {
  const d = dealById('d1');
  const pct = pctOf(d);
  const main = `
    ${card('', `<div class="row wrap-row" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 120, { seed: d.id })}
      <div class="grow"><h2 class="t-card">${esc(d.nm)}</h2>
        <div class="t-sub">${esc(d.host)} · ${esc(d.ship)}</div>
        <div class="mt2"><span class="price-old">${won(d.was)}</span> <span class="price">${won(d.now)}</span></div>
      </div>
      <div class="nowrap">${countdown(d.left)}</div>
    </div>`)}

    ${card('옵션 고르기', `<div class="radio-list">
      ${OPTIONS.map((o, i) => `<label class="radio${o.soldout ? ' is-off' : ''}" data-group="opt">
        <input type="radio" name="opt"${i === 0 ? ' checked' : ''}${o.soldout ? ' disabled' : ''}>
        <span class="grow"><b>${esc(o.nm)}</b>${o.soldout ? ' <span class="badge b-mut">품절</span>' : ''}</span>
        <span class="nowrap">${o.add ? `+${won(o.add)}` : '기본가'}</span></label>`).join('')}
    </div>`, { cls: 'mt6' })}

    ${card('수량', `<div class="row-b wrap-row">
      <div><b>몇 개 받으실까요?</b><p class="t-sub mt1">1인당 최대 3개까지 참여하실 수 있습니다.</p></div>
      <div class="stepper"><button type="button" data-step="-">−</button><span class="num">1</span><button type="button">＋</button></div>
    </div>`, { cls: 'mt6' })}

    ${card('배송지', `<div class="row-b wrap-row">
      <div><b>김하늘</b> <span class="badge b-pri">기본</span>
        <p class="t-sub mt1">서울 성동구 아차산로 111, 302동 1804호 (04781)</p>
        <p class="t-sub">010-1234-5678</p></div>
      <div class="btns">${btn('배송지 바꾸기', { cls: 'btn-ghost btn-sm', href: 'AC-02' })}</div>
    </div>
    <div class="box box-mut mt3"><p class="t-sub">성사가 확정되기 전까지는 내 공구함에서 배송지를 고치실 수 있습니다.</p></div>`,
    { cls: 'mt6' })}

    ${card('내가 참여하면', `<div class="row-b wrap-row" style="gap:20px">
      <div class="grow" style="min-width:260px">
        <div class="t-sub mb2">지금 달성률</div>${gauge(pct)}
        <div class="t-sub mt3 mb2">내가 참여하면</div>${gauge(Math.round((d.joined + 1) / d.goal * 100))}
      </div>
      <div class="box box-pri" style="min-width:220px">
        <b class="pri">${num(d.goal - d.joined - 1)}명만 더 모이면 성사!</b>
        <p class="t-sub mt2">지금 참여하시면 달성률이 ${pct}% → ${Math.round((d.joined + 1) / d.goal * 100)}%가 됩니다.</p>
      </div>
    </div>`, { cls: 'mt6' })}

    ${card('사람이 더 모이면 더 싸집니다', tierTable(TIERS, { next: '250명이 되면 24,900원 → <b>21,900원</b>. 차액은 성사 뒤 자동으로 돌려드립니다.' }), { cls: 'mt6' })}`;

  const aside = card('예상 결제 금액', `${sumRows([
    ['5kg (특대과 12~14과)', won(d.now)],
    ['수량', '1개'],
    ['배송비', '무료'],
  ], ['예상 결제 금액', won(d.now)])}
    <div class="box box-mut mt3"><p class="t-sub">지금 결제되지만 목표에 못 미치면 <b>전액 자동 환불</b>됩니다.</p></div>
    <div class="btns mt4">${btn('참여하고 결제하기', { cls: 'btn-primary btn-lg btn-block', href: 'JO-02' })}</div>
    ${btn('관심 공구에 담기', { cls: 'btn-ghost btn-block', attr: ' data-toast="관심 공구에 담았어요" data-toast-kind="ok"' })}`);

  const stick = stickBar(`<div class="t-sub">예상 결제 금액</div><b style="font-size:17px">${won(d.now)}</b>`,
    btn('참여하고 결제하기', { cls: 'btn-primary', href: 'JO-02' }));

  const body = `${pageHd('참여하기')}${stepbar(['옵션·수량', '결제', '완료'], 0)}<div class="mt6">${detail2(main, aside)}</div>`;
  return { body, o: { wrapCls: 'wrap wrap-full', stick } };
}

/* ── JO-02 참여 결제 ────────────────────────────────── */
function jo02() {
  const d = dealById('d1');
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

    ${card('쿠폰·적립금', `<div class="field-btn">
      <input class="input" placeholder="쿠폰 코드를 넣으세요">
      ${btn('적용', { cls: 'btn-ghost', attr: ' data-toast="쿠폰을 적용했어요. 2,000원 할인됩니다" data-toast-kind="ok"' })}
    </div>
    <div class="radio-list mt3">
      ${['첫 참여 2,000원 할인 (남은 기간 26일)', '식품 카테고리 1,500원', '쿠폰 사용 안 함']
      .map((t, i) => `<label class="radio" data-group="cp"><input type="radio" name="cp"${i === 0 ? ' checked' : ''}><span class="grow">${t}</span></label>`).join('')}
    </div>
    <div class="field-btn mt3">
      <input class="input" placeholder="적립금 (보유 3,240원)">
      ${btn('전액 사용', { cls: 'btn-ghost', attr: ' data-toast="적립금 3,240원을 모두 적용했어요"' })}
    </div>`, { cls: 'mt6' })}

    ${card('결제 수단', `<div class="radio-list">
      ${[['신용·체크카드', '국민 1234-**-**-5678'], ['카카오페이', '간편결제'], ['네이버페이', '간편결제'], ['계좌이체', '실시간 이체']]
      .map(([t, s], i) => `<label class="radio" data-group="pay"><input type="radio" name="pay"${i === 0 ? ' checked' : ''}>
        <span class="grow"><b>${t}</b><span class="t-sub"> ${s}</span></span></label>`).join('')}
    </div>`, { cls: 'mt6' })}

    ${card('꼭 확인해 주세요', `<div class="box box-pri">
      <b>이 공구는 조건부 결제입니다</b>
      <p class="t-sub mt1">지금 결제되지만, 마감까지 목표 인원(${num(d.goal)}명)에 못 미치면 <b>전액 자동 환불</b>됩니다. 따로 신청하실 것은 없습니다.</p>
    </div>
    <label class="check mt3"><input type="checkbox" data-unlock="payBtn"><span><b>조건부 결제와 자동 환불 내용을 확인했습니다</b> <span class="danger">(필수)</span></span></label>
    <label class="check"><input type="checkbox"><span><b>진행자에게 배송 정보 제공에 동의합니다</b> <span class="danger">(필수)</span>
      <div class="t-sub">제공 항목: 이름·연락처·주소 / 목적: 상품 배송 / 보유: 배송 완료 후 3개월</div></span></label>`,
    { cls: 'mt6' })}`;

  const aside = card('결제 금액', `${sumRows([
    ['정가', won(d.was)],
    ['공구 할인', '−' + won(d.was - d.now)],
    ['쿠폰', '−2,000원'],
    ['배송비', '무료'],
  ], ['최종 결제 금액', won(d.now - 2000)])}
    <div class="box box-ok mt3"><b>250명이 모이면 3,000원 더 싸집니다</b>
      <p class="t-sub mt1">차액은 성사 확정 뒤 자동으로 돌려드립니다.</p></div>
    <div class="btns mt4">
      <button class="btn btn-primary btn-lg btn-block is-off" id="payBtn" type="button" disabled data-toast="결제 창이 열려요">결제하기</button>
    </div>
    <p class="t-sub center mt2">필수 항목에 동의하시면 눌리게 됩니다</p>
    <div class="hr"></div>
    <div class="row" style="gap:8px">
      ${btn('참여 완료 화면', { cls: 'btn-ghost btn-sm grow', href: 'JO-03' })}
      ${btn('결제 실패 화면', { cls: 'btn-ghost btn-sm grow', href: 'JO-04' })}
    </div>`);

  const body = `${pageHd('참여 결제')}${stepbar(['옵션·수량', '결제', '완료'], 1)}<div class="mt6">${detail2(main, aside)}</div>`;
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── JO-03 참여 완료 ────────────────────────────────── */
function jo03() {
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

  ${card('친구를 부르면 성사가 빨라져요', `<p class="t-sub">초대 링크로 친구가 참여하면 두 분 모두에게 <b>2,000원 적립금</b>을 드립니다.</p>
    <div class="field-btn mt3">
      <input class="input is-readonly" value="https://moagonggu.kr/d/d1?ref=haneul" disabled>
      ${btn('링크 복사', { cls: 'btn-primary', attr: ' data-toast="링크를 복사했어요" data-toast-kind="ok"' })}
    </div>
    <div class="row mt3" style="gap:8px">
      ${['카카오톡으로 보내기', '문자로 보내기', '인스타 스토리'].map((t) => `<button class="btn btn-ghost btn-sm grow" type="button" data-toast="${t.replace('으로 보내기', '')}로 공유했어요" data-toast-kind="ok">${t}</button>`).join('')}
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

  <div class="mt8">${sec('이런 공구도 있어요', dealCards(DEALS.slice(1, 5), pctOf, { cls: 'mag mag-4' }))}</div>`;
  return { body, o: {} };
}

/* ── JO-04 결제 실패 ────────────────────────────────── */
function jo04() {
  const d = dealById('d1');
  const body = `
  ${stepbar(['옵션·수량', '결제', '완료'], 1)}
  <div class="box box-danger center mt6">
    <div style="font-size:44px">😥</div>
    <h1 class="t-page mt2">결제가 되지 않았어요</h1>
    <p class="t-sub mt2">카드 한도를 넘었습니다 (오류 코드 <b>PG-51</b>)</p>
    <p class="t-sub">아직 결제되지 않았고, 고르신 내용은 그대로 남아 있습니다.</p>
  </div>

  ${banner('warn', '⏰', `<b>이 공구는 ${leftText(d.left)} 뒤에 마감돼요.</b>
    <p class="t-sub">서두르지 않으셔도 되지만, 마감되면 이 가격으로는 참여하실 수 없습니다.</p>`,
    { cls: 'mt6', right: countdown(d.left, { sec: d.left * 60 }) })}

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
    ${btn('다른 결제 수단 고르기', { cls: 'btn-ghost btn-lg', href: 'JO-02' })}
    ${btn('문의하기', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
  </div>`;
  return { body, o: { state: '결제 실패 · 카드 한도 초과' } };
}

/* ── MY-01 내 공구함 ────────────────────────────────── */
function my01() {
  const rows = MY_JOINS.map((m) => {
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

  const body = myPage('MY-01', `
    ${pageHd('내 공구함', '참여하신 공구 4건',
    `<div class="row" style="gap:8px"><input class="input" style="width:200px" placeholder="상품명 검색">
      <select class="select" style="width:150px"><option>최근 참여순</option><option>마감 임박순</option><option>금액순</option></select></div>`)}

    ${tabs([{ label: '진행 중', cnt: 1 }, { label: '성사', cnt: 1 }, { label: '불발', cnt: 1 }, { label: '배송·완료', cnt: 1 }, { label: '전체', cnt: 4 }], 4)}

    <div class="mt4">${rows}</div>

    ${banner('acc', '✍️', `<b>후기를 안 쓰신 공구가 1건 있어요.</b>
      <p class="t-sub">사진과 함께 남기시면 3,000원 쿠폰을 드립니다.</p>`,
    { cls: 'mt6', right: btn('후기 쓰기', { cls: 'btn-accent btn-sm', href: 'RV-01' }) })}

    ${banner('mut', '📭', `<b>참여 내역이 없을 때는 어떻게 보이나요?</b>`,
    { cls: 'mt4', right: btn('비어 있는 화면 보기', { cls: 'btn-ghost btn-sm', href: 'MY-04' }) })}`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── MY-02 참여 상세 ────────────────────────────────── */
function my02() {
  const m = MY_JOINS[0];
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

    ${card('진행 상태', timeline([
    ['참여 완료', `${m.at} 18:24`],
    ['모집 마감', `${leftText(d.left)} 뒤`],
    ['성사·불발 판정', '마감 직후 자동'],
    ['진행자 발주', '성사 후 1일 이내'],
    ['발송', esc(d.ship)],
    ['배송 완료', '발송 후 1~2일'],
  ], 0), { cls: 'mt6' })}

    ${card('차액 환급 안내', `<div class="box box-ok">
      <b>단계가 내려가면 차액을 돌려드립니다</b>
      <p class="t-sub mt1">지금은 24,900원 단계입니다. 250명이 모이면 21,900원이 되고, 차액 3,000원이 성사 확정 뒤 자동으로 환급됩니다.</p>
    </div>
    <div class="mt3">${tierTable(TIERS)}</div>`, { cls: 'mt6' })}`;

  const aside = card('', `<div class="center">${stBadge(m.st)}
      <div class="price-lg mt2">${won(m.paid)}</div>
      <p class="t-sub">${m.at} 결제</p></div>
    <div class="hr"></div>
    <div class="btns">
      ${btn('친구 불러 성사 돕기', { cls: 'btn-primary btn-block', attr: ' data-toast="초대 링크를 복사했어요" data-toast-kind="ok"' })}
    </div>
    ${btn('영수증 보기', { cls: 'btn-ghost btn-block', attr: ' data-toast="영수증을 새 창에서 열어요"' })}
    ${btn('배송 조회', { cls: 'btn-ghost btn-block', off: true })}
    ${btn('참여 취소·환불', { cls: 'btn-ghost btn-block', href: 'MY-03' })}
    <div class="hr"></div>
    ${btn('진행자에게 문의', { cls: 'btn-ghost btn-block btn-sm', href: 'RV-02' })}
    ${btn('고객센터 문의', { cls: 'btn-ghost btn-block btn-sm', href: 'CS-02' })}`);

  const body = myPage('MY-01', `${pageHd('참여 상세')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── MY-03 참여 취소·환불 요청 ──────────────────────── */
function my03() {
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
        <div class="t-sub mb2">지금</div>${gauge(pctOf(d))}
        <div class="t-sub mt3 mb2">취소하면</div>${gauge(Math.round((d.joined - 1) / d.goal * 100))}
      </div>
      <div class="box box-warn" style="min-width:220px">
        <b>${num(d.goal - d.joined)}명이면 성사되는 상황이에요</b>
        <p class="t-sub mt2">지금 취소하시면 ${num(d.goal - d.joined + 1)}명이 더 필요해집니다. 기다리시는 분들이 있어요.</p>
      </div>
    </div>`, { cls: 'mt6' })}

    ${card('취소 사유', `<div class="radio-list">
      ${['다른 곳에서 더 싸게 샀어요', '마음이 바뀌었어요', '성사가 안 될 것 같아요', '옵션·수량을 바꾸고 싶어요', '배송이 너무 늦어요', '직접 입력']
      .map((t, i) => `<label class="radio" data-group="why"><input type="radio" name="why"${i === 0 ? ' checked' : ''}><span class="grow">${t}</span></label>`).join('')}
    </div>
    <textarea class="textarea mt3" rows="3" placeholder="더 하실 말씀이 있으면 적어 주세요 (선택)"></textarea>`, { cls: 'mt6' })}

    ${card('성사된 뒤에 반품하시려면', `<ul style="padding-left:18px;line-height:1.9" class="t-sub">
      <li>상품을 받으신 날부터 7일 이내에 신청하실 수 있습니다.</li>
      <li>신선식품은 단순 변심으로는 반품이 어렵습니다.</li>
      <li>상품에 하자가 있으면 왕복 배송비 없이 처리됩니다.</li>
    </ul>`, { cls: 'mt6', aside: `<a class="more" href="${link('CS-04')}">환불 정책 ›</a>` })}`;

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
      <div class="bd"><p>취소하시면 달성률이 ${pctOf(d)}% → ${Math.round((d.joined - 1) / d.goal * 100)}%로 내려갑니다.</p>
        <div class="mt3">${kv([['환불 금액', won(m.paid)], ['환불 수단', '국민카드 결제 취소'], ['소요 기간', '2~5영업일']])}</div>
        <p class="t-sub mt3">취소하신 뒤에도 마감 전이면 다시 참여하실 수 있습니다. 다만 그때 단계 가격이 적용됩니다.</p></div>
      <div class="ft">
        <button class="btn btn-ghost" type="button" data-dismiss data-toast="취소하지 않았어요. 참여가 그대로 유지됩니다">그냥 두기</button>
        <button class="btn btn-danger" type="button" data-dismiss data-toast="참여를 취소했어요. 2~5영업일 안에 환불됩니다" data-toast-kind="ok">취소하기</button>
      </div></div></template>`);

  const body = myPage('MY-01', `${pageHd('참여 취소·환불 요청')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
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

    <div class="mt8">${sec('마감이 얼마 안 남았어요', dealCards(DEALS.filter((d) => d.left < 700), pctOf, { cls: 'mag mag-3' }), { more: 'HO-03' })}</div>
    <div class="mt6">${sec('많이 참여하는 공구', dealCards(DEALS.slice(0, 3), pctOf, { cls: 'mag mag-3' }), { more: 'HO-02' })}</div>

    ${card('', `<div class="row-b wrap-row">
      <div><b>관심 공구에 담아 두신 것이 3개 있어요</b>
        <p class="t-sub mt1">담아 두신 공구가 마감에 가까워지면 알려드립니다.</p></div>
      ${btn('관심 공구 보기', { cls: 'btn-primary', href: 'RV-03' })}
    </div>`, { cls: 'mt6' })}`);
  return { body, o: { wrapCls: 'wrap wrap-full', state: '참여 내역 0건' } };
}

export const PAGES = {
  'JO-01': jo01, 'JO-02': jo02, 'JO-03': jo03, 'JO-04': jo04,
  'MY-01': my01, 'MY-02': my02, 'MY-03': my03, 'MY-04': my04,
};
