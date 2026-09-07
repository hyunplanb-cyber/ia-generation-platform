/* PA 안전결제 — 안내 / 결제 / 발송 등록 / 수령 확인 / 거래 진행 상태
   ⚠ 남의 돈을 다루는 화면이다. 「지금 돈이 어디에 있나」와 「지금 누구 차례인가」가
     모든 화면에서 한 줄로 읽혀야 한다.
   ⚠ 세 숫자(물건 값 · 수수료 · 판매자 수령액)는 U.feeRows 한 곳에서 낸다.
     화면마다 손으로 적으면 반드시 갈라진다. */
import * as U from './ui.mjs';
import {
  DEALS, ESCROW_STEPS, FEE_RATE, fee, payout, itemBy, userBy, ITEMS, ago, SITE,
} from './data.mjs';

/* ---------------- PA-01 안전결제 시작·안내 ---------------- */
function PA01() {
  const it = itemBy('i9');
  const u = userBy(it.by);
  const 예시 = 300000;

  const 왼쪽 = `
  ${U.card('이 거래', `<div class="row-b wrap-row">
    <div class="row-c" style="gap:12px">
      ${U.phItem(64, it.id)}
      <div><b>${U.esc(it.t)}</b>
        <div class="row-c wrap-row mt1"><b class="price">${U.won(it.price)}</b>${U.wayBadges(it.ways)}</div></div>
    </div>
    <div><a class="link" href="${U.link('MY-01')}">${u.nick}</a> ${U.manner(u.manner)}</div>
  </div>`)}

  <div class="mt-block">${U.sec('안전결제는 이렇게 굴러갑니다', `
    ${U.escrow(0)}
    ${U.turnLine('아직 시작 전이에요 — 결제하면 ① 칸이 채워집니다')}
    <div class="mt-block">${U.accordion([
    { q: '① 결제 — 이때 돈은 어디 있나요?', a: `<b>${SITE.name}가 맡아 둡니다.</b> 판매자에게 바로 가지 않아요. 판매자에게는 「결제됐다」는 알림만 갑니다.` },
    { q: '② 발송 — 판매자가 안 보내면요?', a: '기한(3일) 안에 운송장을 안 올리면 <b>자동으로 취소되고 전액 환불</b>됩니다. 기다리는 동안 돈은 계속 맡아 둡니다.' },
    { q: '③ 수령 확인 — 물건이 설명과 다르면요?', a: '<b>「받았어요」를 누르기 전에</b> 신고하세요. 사진을 붙여 신청하면 정산이 멈추고 운영자가 양쪽 말을 듣습니다.' },
    { q: '④ 정산 — 판매자는 언제 받나요?', a: '구매확정 뒤 <b>영업일 5일 안에</b> 등록한 계좌로 들어갑니다.' },
  ], 0)}</div>`)}</div>

  <div class="mt-block">${U.sec('직거래와 무엇이 다른가요', U.table(
    [{ t: '', w: '26%' }, { t: '직거래' }, { t: '안전결제' }],
    [
      ['돈이 언제 넘어가나', '만나서 바로', '물건을 받고 확인한 뒤'],
      ['드는 비용', '없음', `물건 값의 ${(FEE_RATE * 100).toFixed(1)}% (파는 쪽)`],
      ['만나야 하나', '네', '아니요'],
      ['문제가 생기면', '둘이 풀어야 합니다', '운영자가 판단합니다'],
    ]))}</div>

  <div class="mt-block">${U.sec('반품·환불', U.accordion([
    { q: '언제까지 반품할 수 있나요?', a: '받은 날부터 <b>7일 안에</b>, 그리고 <b>구매확정을 누르기 전</b>에만 됩니다. 확정한 뒤에는 돈이 이미 넘어가서 되돌리기 어렵습니다.' },
    { q: '배송비는 누가 내나요?', a: '설명과 다른 물건이면 <b>판매자</b>가, 단순 변심이면 <b>구매자</b>가 냅니다. 다투게 되면 운영자가 판단합니다.' },
    { q: '중고인데 반품이 되나요?', a: '중고라도 <b>설명과 다르면</b> 반품할 수 있습니다. 「사용감 있음」이라고 적혀 있는데 흠집이 있는 것은 반품 사유가 아니에요.' },
  ], -1))}</div>
  `;

  const 오른쪽 = `
  ${U.card('수수료 셈', `
    <div class="fld"><label class="lb" for="pv">물건 값</label>
      <input class="input" id="pv" type="text" inputmode="numeric" value="${U.num(예시)}"></div>
    <div class="mt3">${U.feeRows(예시, fee(예시), payout(예시))}</div>
    <p class="t-sub mt3">수수료는 <b>파는 쪽</b>이 냅니다. 사는 쪽은 물건 값과 배송비만 내면 돼요.</p>`)}

  <div class="mt-block">${U.card('이 거래에 드는 돈', U.sumRows([
    ['물건 값', U.won(it.price)],
    ['배송비', U.won(it.ship)],
  ], ['내가 낼 돈', U.won(it.price + it.ship)]))}</div>

  <div class="mt-block">${U.card('', `
    ${U.btn('안전결제로 진행하기', { href: 'PA-02', cls: 'btn-pri btn-block btn-lg' })}
    <div class="mt2">${U.btn('직거래로 만나서 할게요', { href: 'CH-03', cls: 'btn-ghost btn-block' })}</div>`)}</div>

  <div class="mt-block">${U.banner('warn', '⚠', `<b>바깥 링크로 결제하라는 말은 사기입니다</b>
    <div class="t-sub mt1">안전결제는 채팅 안의 [안전결제로 거래하기] 단추로만 시작합니다.</div>`)}</div>
  `;
  return { body: U.detail2(왼쪽, 오른쪽), o: {} };
}

/* ---------------- PA-02 결제 ---------------- */
function PA02() {
  const it = itemBy('i9');
  const 총액 = it.price + it.ship;

  const 왼쪽 = `
  ${U.stepbar(['받는 곳', '결제 수단', '동의', '결제'], 0)}

  <div class="mt-block">${U.card('받는 사람', `
    <div class="row wrap-row" style="gap:12px">
      <div class="fld" style="flex:1 1 200px"><label class="lb" for="nm">이름</label>
        <input class="input" id="nm" type="text" value="${SITE.me}"></div>
      <div class="fld" style="flex:1 1 200px"><label class="lb" for="tl">연락처</label>
        <input class="input" id="tl" type="tel" value="010-0000-0000"></div>
    </div>
    <div class="fld">
      <span class="lb">배송지</span>
      <div class="stack-sm">
        <label class="radio on"><input type="radio" name="addr" checked>
          <b>집</b> <span class="t-sub">서울 강남구 역삼로 000, 000호 (06234)</span></label>
        <label class="radio"><input type="radio" name="addr">
          <b>회사</b> <span class="t-sub">서울 강남구 테헤란로 152, 00층 (06236)</span></label>
      </div>
      <button class="link mt2" type="button" data-toast="새 주소를 적어 주세요">＋ 새 주소 추가</button>
    </div>
    <div class="fld"><label class="lb" for="rq">배송 요청</label>
      <select class="input" id="rq"><option>문 앞에 놓아 주세요</option><option>경비실에 맡겨 주세요</option><option>직접 받을게요</option></select></div>`)}</div>

  <div class="mt-block">${U.card('결제 수단', `
    ${U.tabs(['카드', '간편결제', '계좌이체'], 0)}
    <div class="mt3">
      <div data-pane-body="pay0">
        <div class="row wrap-row" style="gap:12px">
          <div class="fld" style="flex:1 1 240px"><label class="lb" for="cd">카드 번호</label>
            <input class="input" id="cd" type="text" inputmode="numeric" placeholder="0000 0000 0000 0000"></div>
          <div class="fld" style="flex:1 1 120px"><label class="lb" for="ex">유효기간</label>
            <input class="input" id="ex" type="text" placeholder="MM/YY"></div>
        </div>
        <div class="fld"><label class="lb" for="ip">할부</label>
          <select class="input" id="ip" data-toast="할부 개월을 골랐어요"><option>일시불</option><option>2개월</option><option>3개월</option><option>6개월</option><option>12개월</option></select></div>
      </div>
    </div>`)}</div>

  <div class="mt-block">${U.card('포인트·쿠폰', `
    <div class="row-c" style="gap:8px">
      <input class="input" type="text" inputmode="numeric" placeholder="쓸 포인트" style="flex:1">
      <button class="btn btn-ghost btn-sm" type="button" data-toast="가진 포인트 4,200P를 모두 담았어요">모두 사용</button>
    </div>
    <p class="t-sub mt2">가진 포인트 <b>4,200P</b></p>
    <div class="fld mt3"><label class="lb" for="cp">쿠폰</label>
      <select class="input" id="cp" data-toast="쿠폰을 적용했어요"><option>쓸 쿠폰 없음</option><option>첫 거래 3,000원 할인</option></select></div>`)}</div>

  <div class="mt-block" data-agree-scope>${U.card('약관 동의', `
    <label class="check strong mb3"><input type="checkbox" data-agree-all><span><b>아래 세 가지에 모두 동의합니다</b></span></label>
    ${[['안전결제 이용약관', '필수'],
    ['개인정보 제3자 제공 — 판매자에게 배송지가 전달됩니다', '필수'],
    ['전자금융거래 이용약관', '필수']].map(([t, k]) =>
      `<label class="check"><input type="checkbox" data-agree data-unlock="paybtn">
        <span class="grow">${U.badge(k, 'b-mut')} ${t}</span>
        <button class="link quiet" type="button" data-toast="약관 전문을 열었어요">보기</button></label>`).join('')}
    <p class="t-sub mt3">셋을 다 체크해야 결제할 수 있어요.</p>`)}</div>
  `;

  const 오른쪽 = `
  ${U.card('주문 요약', `
    <div class="row-c" style="gap:12px">${U.phItem(56, it.id)}
      <div><b>${U.esc(it.t)}</b><p class="t-sub mt1">${U.badge(it.cond, 'b-mut')}</p></div></div>
    <div class="mt4">${U.sumRows([
      ['물건 값', U.won(it.price)],
      ['배송비', U.won(it.ship)],
      ['수수료', '<span class="muted">판매자가 냅니다</span>'],
    ], ['내가 낼 돈', U.won(총액)])}</div>
    <div class="mt4">${U.btn('결제하기', { cls: 'btn-pri btn-block btn-lg', id: 'paybtn', off: true, attr: ` data-go="${U.link('PA-05')}"` })}</div>
    <p class="t-sub mt2 center">약관에 동의하면 열립니다</p>`)}

  <div class="mt-block">${U.banner('info', '🛡', `<b>결제한 돈은 판매자에게 바로 가지 않아요</b>
    <div class="t-sub mt1">${SITE.name}가 맡아 두었다가, 물건을 받고 「받았어요」를 누르면 그때 넘어갑니다.</div>`)}</div>

  <div class="mt-block">${U.banner('warn', '⚠', `<b>결제가 안 될 때</b>
    <div class="t-sub mt1">한도 초과·카드 정보 오류면 다른 수단으로 다시 해 보세요.
    결제가 끝날 때까지 <b>창을 닫지 마세요.</b></div>`)}</div>
  `;
  return { body: U.detail2(왼쪽, 오른쪽), o: {} };
}

/* ---------------- PA-03 발송 등록 (판매자) ---------------- */
function PA03() {
  const d = DEALS[0];
  const it = itemBy(d.item);
  const u = userBy(d.with);

  const 왼쪽 = `
  ${U.card('이 거래', `<div class="row-b wrap-row">
    <div class="row-c" style="gap:12px">${U.phItem(56, it.id)}
      <div><b>${U.esc(it.t)}</b><p class="t-sub mt1">${u.nick}님이 삽니다 · ${U.won(d.price)} 결제됨</p></div></div>
    ${U.badge('결제 완료', 'b-ok')}
  </div>
  <div class="mt4">${U.kv([
    ['받는 사람', `${u.nick} (010-****-0000)`],
    ['받는 주소', '서울 강남구 역삼로 000, 0**호'],
    ['배송 요청', '문 앞에 놓아 주세요'],
  ])}</div>`)}

  <div class="mt-block">${U.card('', `<div class="deadline">
    <div class="t-sub">발송까지</div>
    <div class="big">2일 6시간</div>
    <p class="t-sub mt2">기한을 넘기면 <b>자동으로 취소되고 구매자에게 전액 환불</b>됩니다.
    못 보내게 되셨으면 아래에서 미리 알려 주세요.</p>
  </div>`)}</div>

  <div class="mt-block">${U.card('운송장 등록', `
    <div class="fld"><label class="lb" for="cr">택배사</label>
      <select class="input" id="cr" data-sel-text="carrier">
        <option>고르기</option><option selected>CJ대한통운</option><option>한진택배</option><option>롯데택배</option><option>우체국택배</option></select></div>
    <div class="fld"><label class="lb" for="tr">운송장 번호</label>
      <input class="input" id="tr" type="text" inputmode="numeric" placeholder="12자리 숫자">
      <p class="t-sub mt1" data-sel-out="carrier" data-sel-map='{"고르기":"택배사를 먼저 골라 주세요.","CJ대한통운":"CJ대한통운은 <b>12자리 숫자</b>예요.","한진택배":"한진택배는 <b>10자리 또는 12자리 숫자</b>예요.","롯데택배":"롯데택배는 <b>12자리 숫자</b>예요.","우체국택배":"우체국택배는 <b>13자리</b>이고 영문이 섞일 수 있어요."}'>CJ대한통운은 <b>12자리 숫자</b>예요.</p></div>
    <button class="link mt2" type="button" data-toast="직접 전달로 바꿨어요 · 구매자가 받았다고 확인하면 정산됩니다">
      직접 만나서 전달했어요</button>`)}</div>

  <div class="mt-block">${U.card('포장 사진 (안 넣어도 돼요)', `
    <div class="photo-grid">
      <button class="photo-add" type="button" data-toast="포장 사진을 골라 주세요">
        <span style="font-size:22px">＋</span><span>사진 추가</span></button>
    </div>
    <p class="t-sub mt3">나중에 「물건이 다르다」는 말이 나왔을 때 도움이 됩니다.</p>`)}</div>

  <div class="mt-block">${U.accordion([{
    q: '포장할 때 조심할 것',
    a: '<ul class="dots"><li>깨지는 물건은 완충재로 감싸고 「취급주의」를 붙여 주세요</li><li>액체·배터리는 택배사마다 규정이 다릅니다 — 미리 확인하세요</li><li>구성품을 빠뜨리면 반품 사유가 됩니다</li></ul>',
  }], -1)}</div>
  `;

  const 오른쪽 = `
  ${U.card('지금 어디까지', `${U.escrow(1, [d.paidAt, '', '', ''])}
    ${U.turnLine('내가 보낼 차례예요', d.left)}`)}

  <div class="mt-block">${U.card('정산 예정', U.feeRows(d.price, fee(d.price), payout(d.price))
    + `<p class="t-sub mt3">구매자가 「받았어요」를 누른 뒤 영업일 5일 안에 들어갑니다.</p>`)}</div>

  <div class="mt-block">${U.card('', `
    ${U.btn('발송 등록하기', { href: 'PA-05', cls: 'btn-pri btn-block btn-lg' })}
    <p class="t-sub mt2 center">택배사와 운송장을 채우면 열립니다</p>
    <div class="mt3">${U.btn('채팅으로', { href: 'CH-02', cls: 'btn-ghost btn-block' })}</div>
    <div class="mt4 center"><button class="link quiet" type="button" data-modal="cancel">
      못 보내게 됐어요 — 거래 취소 요청</button></div>`)}</div>

  ${U.modal('cancel', '거래를 취소할까요?', `
    <p class="t-sub mb3">구매자에게 사유가 그대로 전달되고 전액 환불됩니다.</p>
    <div class="stack-sm">
      ${['물건을 이미 다른 분께 팔았어요', '물건에 문제가 생겼어요', '개인 사정이 생겼어요', '그 밖에']
      .map((k, i) => `<label class="radio${i === 0 ? ' on' : ''}"><input type="radio" name="cx"${i === 0 ? ' checked' : ''}>${k}</label>`).join('')}
    </div>
    ${U.banner('warn', '⚠', '<b>취소가 잦으면 판매가 제한될 수 있어요</b>', { cls: 'mt3' })}`,
    U.btn('그냥 둘게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('취소 요청', { cls: 'btn-pri', attr: ' data-dismiss data-toast="취소를 요청했어요 · 구매자에게 알렸습니다"' }))}
  `;
  return { body: U.detail2(왼쪽, 오른쪽), o: {} };
}

/* ---------------- PA-04 수령 확인·구매확정 ---------------- */
function PA04() {
  const d = DEALS[1];
  const it = itemBy(d.item);
  const u = userBy(d.with);

  const 왼쪽 = `
  ${U.card('배송', `<div class="row-b wrap-row">
    <div class="row-c" style="gap:12px">${U.phItem(56, it.id)}
      <div><b>${U.esc(it.t)}</b><p class="t-sub mt1">${u.nick}님이 보냈어요 · ${d.track}</p></div></div>
    ${U.stBadge('도착')}
  </div>
  <div class="mt4">${U.timeline([
    ['보냄 (구리 터미널)', '9/4 09:40'],
    ['이동 중 (옥천 허브)', '9/4 22:10'],
    ['배달 출발', '9/5 08:12'],
    ['배달 완료', '9/5 14:31'],
  ], 4)}</div>`)}

  <div class="mt-block">${U.card('', `<div class="deadline">
    <div class="t-sub">자동 구매확정까지</div>
    <div class="big">5일 12시간</div>
    <p class="t-sub mt2">이 시간이 지나면 <b>자동으로 확정</b>되고 판매자에게 돈이 넘어갑니다.
    물건에 문제가 있으면 그 전에 알려 주세요.</p>
  </div>`)}</div>

  <div class="mt-block">${U.card('물건은 어떤가요', `
    <div class="stack-sm">
      <label class="radio on"><input type="radio" name="cond" checked data-unlock="confirmbtn">
        <b>설명대로예요</b> <span class="t-sub">받은 물건이 판매글과 같습니다</span></label>
      <label class="radio"><input type="radio" name="cond">
        <b>설명과 달라요</b> <span class="t-sub">사진을 붙여 반품·분쟁을 신청합니다</span></label>
    </div>

    <div class="sub-fld mt4">
      <p class="t-sub mb2">「설명과 달라요」를 고르면 이렇게 바뀝니다</p>
      <div class="photo-grid">
        <button class="photo-add" type="button" data-toast="다른 점이 보이게 찍어 주세요 (최대 5장)">
          <span style="font-size:22px">＋</span><span>사진 추가</span></button>
      </div>
      <textarea class="input mt3" rows="4" placeholder="무엇이 어떻게 다른지 적어 주세요"></textarea>
      <div class="btns mt3">${U.btn('반품·분쟁 신청하기', { href: 'CH-04', cls: 'btn-ghost' })}</div>
    </div>`)}</div>

  <div class="mt-block">${U.accordion([
    { q: '반품은 언제까지 되나요?', a: '받은 날부터 <b>7일 안에</b>, 그리고 <b>구매확정을 누르기 전</b>에만 됩니다.' },
    { q: '배송비는 누가 내나요?', a: '설명과 다르면 판매자가, 단순 변심이면 구매자가 냅니다.' },
    { q: '분쟁은 어떻게 진행되나요?', a: '신청하면 <b>정산이 멈춥니다.</b> 운영자가 양쪽 사진과 대화를 보고 전액 환불·판매자 정산·일부 환불 중에서 판단합니다. 보통 3영업일쯤 걸립니다.' },
  ], -1)}</div>
  `;

  const 오른쪽 = `
  ${U.card('지금 어디까지', `${U.escrow(2, [d.paidAt, d.sentAt, '', ''])}
    ${U.turnLine('내가 확인할 차례예요', d.left)}`)}

  <div class="mt-block">${U.card('낸 돈', U.sumRows([
    ['물건 값', U.won(d.price)],
    ['배송비', U.won(d.ship)],
  ], ['모두', U.won(d.price + d.ship)]))}</div>

  <div class="mt-block">${U.card('', `
    ${U.btn('받았어요 — 구매확정', { cls: 'btn-pri btn-block btn-lg', id: 'confirmbtn', off: true, attr: ' data-modal="ok"' })}
    <p class="t-sub mt2 center">물건 상태를 고르면 열립니다</p>
    <div class="mt3">${U.btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-ghost btn-block' })}</div>`)}</div>

  <div class="mt-block">${U.banner('warn', '⚠', `<b>확정하기 전에 꼭 열어 보세요</b>
    <div class="t-sub mt1">확정하면 돈이 판매자에게 넘어가 되돌리기 어렵습니다.</div>`)}</div>

  ${U.modal('ok', '구매를 확정할까요?', `
    <p style="font-size:16px">확정하면 <b>${U.won(d.price)}</b>이 ${u.nick}님에게 갑니다.</p>
    ${U.banner('warn', '⚠', '<b>되돌릴 수 없어요.</b> 물건에 문제가 있으면 지금 멈추고 신고해 주세요.', { cls: 'mt3' })}
    <div class="mt3">${U.kv([['물건', U.esc(it.t)], ['판매자', u.nick], ['금액', U.won(d.price)]])}</div>`,
    U.btn('아직요', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('확정하기', { href: 'MY-04', cls: 'btn-pri' }))}
  `;
  return { body: U.detail2(왼쪽, 오른쪽), o: {} };
}

/* ---------------- PA-05 거래 진행 상태 ---------------- */
function PA05() {
  const 산것 = DEALS.filter((d) => d.side === '구매');
  const 판것 = DEALS.filter((d) => d.side === '판매');
  const 진행 = (list) => list.filter((d) => d.st === '진행중').length;

  const 카드 = (d) => {
    const it = itemBy(d.item);
    const u = userBy(d.with);
    const 시각 = [d.paidAt || '', d.sentAt || '', d.step >= 3 ? '9/1 10:22' : '', d.settleAt || ''];
    const 다음버튼 = d.st !== '진행중' ? ''
      : (d.side === '구매'
        ? (d.step === 2 ? U.btn('받았어요 — 구매확정', { href: 'PA-04', cls: 'btn-pri' })
          : U.btn('판매자에게 물어보기', { href: 'CH-02', cls: 'btn-ghost' }))
        : (d.step === 1 ? U.btn('발송 등록하기', { href: 'PA-03', cls: 'btn-pri' })
          : U.btn('구매자에게 물어보기', { href: 'CH-02', cls: 'btn-ghost' })));

    return `<div class="card mb6"><div class="card-bd">
      <div class="row-b wrap-row mb4">
        <a class="row-c" style="gap:12px" href="${U.link('SE-04')}">
          ${U.phItem(56, it.id)}
          <span><b>${U.esc(it.t)}</b>
            <span class="row-c wrap-row mt1"><b class="price">${U.won(d.price)}</b>
            <span class="t-sub">${d.side === '구매' ? '판매자' : '구매자'} ${u.nick}</span></span></span>
        </a>
        <div class="row-c" style="gap:8px">${U.stBadge(d.st)}
          <button class="btn btn-quiet btn-sm" type="button" data-modal="more">⋯</button></div>
      </div>

      ${U.escrow(d.step, 시각)}
      ${U.turnLine(d.leftLabel, d.st === '진행중' ? d.left : '')}

      ${d.track ? `<div class="mt4">
        <button class="link" type="button" data-toast="택배 이동 기록을 폈어요">배송 조회 · ${d.track}</button></div>` : ''}

      ${d.side === '판매' && d.st !== '취소' ? `<div class="mt4">${U.feeRows(d.price, fee(d.price), payout(d.price))}
        <p class="t-sub mt2">${d.settleAt ? `정산 예정 <b>${d.settleAt}</b>` : '구매확정 뒤 영업일 5일 안에 들어갑니다'}</p></div>` : ''}

      ${다음버튼 ? `<div class="btns mt4">${다음버튼}</div>` : ''}
    </div></div>`;
  };

  const 본문 = `
  ${U.pageHd('거래', '안전결제로 진행 중인 거래예요')}

  ${U.tabs([
    { label: '내가 산 것', cnt: 진행(산것), pane: 'pa0' },
    { label: '내가 판 것', cnt: 진행(판것), pane: 'pa1' },
  ], 0)}

  <div class="mt4">
    <div data-pane-body="pa0">
      ${산것.filter((d) => d.st === '진행중').map(카드).join('') || U.empty('📦', '진행 중인 구매가 없어요', '', U.btn('매물 보러 가기', { href: 'SE-02', cls: 'btn-pri' }))}
      ${U.sec('끝난 거래', `<div class="stack-sm">
        ${산것.filter((d) => d.st !== '진행중').map((d) => {
    const it = itemBy(d.item);
    return `<div class="cond-row"><span class="grow">${U.esc(it.t)}</span>
            <span class="t-sub">${U.won(d.price)}</span>${U.stBadge(d.st)}
            ${d.st === '완료' ? U.btn('후기 쓰기', { href: 'MY-04', cls: 'btn-ghost btn-sm' }) : ''}</div>`;
  }).join('') || '<p class="t-sub">아직 없어요</p>'}
      </div>`)}
    </div>

    <div data-pane-body="pa1" hidden>
      ${판것.filter((d) => d.st === '진행중').map(카드).join('') || U.empty('📦', '진행 중인 판매가 없어요', '', U.btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' }))}
      ${U.sec('끝난 거래', `<div class="stack-sm">
        ${판것.filter((d) => d.st !== '진행중').map((d) => {
    const it = itemBy(d.item);
    return `<div class="cond-row"><span class="grow">${U.esc(it.t)}</span>
            <span class="t-sub">정산 ${U.won(payout(d.price))}</span>${U.stBadge(d.st)}</div>`;
  }).join('') || '<p class="t-sub">아직 없어요</p>'}
      </div>`)}
    </div>
  </div>

  ${U.modal('more', '이 거래로 무엇을 할까요', `<div class="stack-sm">
    <a class="radio" href="${U.link('CH-02')}">💬 채팅 보내기</a>
    <a class="radio" href="${U.link('CH-04')}">⚑ 신고하기</a>
    <button class="radio" type="button" data-dismiss data-toast="취소 요청을 보냈어요 · 상대의 확인을 기다립니다">✕ 거래 취소 요청</button>
  </div>`, U.btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }))}
  `;
  return { body: U.myPage('PA-05', 본문), o: {} };
}

export const PAGES = { 'PA-01': PA01, 'PA-02': PA02, 'PA-03': PA03, 'PA-04': PA04, 'PA-05': PA05 };
