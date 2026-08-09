/* CH 채팅 · PY 결제·이용 */
import * as U from './ui.mjs';
import { CHATS, PRO, QUOTES, REQ } from './data.mjs';

/* ---------------- CH-01 채팅 목록 ---------------- */
function CH01(ctx) {
  const body = U.myPage('CH-01', `
  ${U.pageHd('채팅', '고수와 나눈 대화예요. 요청별로 묶여 있어요.')}

  <div class="searchbar sm mb4"><span class="ic">🔍</span><input type="text" placeholder="고수 이름이나 대화 내용으로 찾기"></div>
  <div class="chips mb4">${U.chip('전체 4', true)}${U.chip('안 읽음 2')}${U.chip('진행 중 1')}${U.chip('완료 1')}</div>

  ${U.card('', CHATS.map((c) => {
    const p = PRO(c.pro);
    return `<a class="ch-row" href="${U.link('CH-02')}">
      ${U.phPro(48, p.id)}
      <div class="mid">
        <div class="row-c wrap-row"><b>${U.esc(p.nm)}</b>${U.stBadge(c.st)}
          <span class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)}</span></div>
        <div class="last">${U.esc(c.last)}</div>
        <div class="of">${U.esc(c.of)}</div>
      </div>
      <div class="rt">${c.at}${c.unread ? `<div class="unread">${c.unread}</div>` : ''}</div>
    </a>`;
  }).join(''), { bdCls: 'flush' })}

  <div class="mt-block">${U.banner('warn', '🔒', `<b>앱 밖에서 송금하지 마세요</b>
    <div class="t-sub mt1">계좌 이체를 요구받으시면 응하지 마시고 신고해 주세요. 앱을 거치지 않은 거래는 도와드릴 수 없어요.</div>`)}</div>

  ${U.sec('줄마다 이런 것을 할 수 있어요', `<div class="g3">
    ${[['🔕', '알림 끄기', '이 대화만 알림을 꺼 둘 수 있어요.'],
    ['🚪', '대화 나가기', '나가면 지난 대화를 볼 수 없어요.'],
    ['🚨', '신고하기', '앱 밖 송금 요구·무례한 언행을 신고해 주세요.']]
    .map(([ic, t, d]) => `<div class="box"><div style="font-size:20px">${ic}</div>
      <h3 class="t-card mt2">${t}</h3><p class="t-sub mt1">${d}</p></div>`).join('')}
  </div>`, { desc: '줄을 길게 누르거나 오른쪽 더보기를 누르면 나옵니다.' })}

  ${U.sec('대화가 없을 때는 이렇게 보여요', U.empty('💬', '아직 나눈 대화가 없어요',
    '고수에게 견적을 받거나 궁금한 점을 물어보면 여기에 대화가 생겨요.',
    U.btn('요청서 작성', { href: 'RQ-01', cls: 'btn-pri' }) + U.btn('고수 찾기', { href: 'SE-01', cls: 'btn-ghost' })))}`);

  return { body, o: {} };
}

/* ---------------- CH-02 채팅방 ---------------- */
function CH02(ctx) {
  const p = PRO('p1'), q = QUOTES[0];

  const bubble = (who, txt, at, read) => `<div class="msg${who === 'me' ? ' me' : ''}">
    ${who === 'me' ? '' : U.phAva(30, p.id)}
    <div class="bubble">${txt}</div>
    <div class="at">${read && who === 'me' ? '읽음<br>' : ''}${at}</div></div>`;

  const body = `
  <div class="split-r" style="grid-template-columns:minmax(0,1fr) 300px">
    <div class="chat">
      <div class="chat-hd">
        ${U.phPro(40, p.id)}
        <div class="grow">
          <div class="row-c"><b>${U.esc(p.nm)}</b>${U.badge('견적 문의', 'b-pri')}</div>
          <div class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)} (${U.num(p.rv)}) · 보통 ${p.respMin}분 안에 답해요</div>
        </div>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="신고 · 차단 · 알림 끄기 메뉴가 열려요">⋯ 더보기</button>
      </div>

      <div class="chat-safe"><span>🔒</span>
        <div>앱 밖에서 송금하지 마세요. 계좌로 먼저 보내달라는 요구를 받으시면 신고해 주세요.
        앱을 거치지 않은 거래는 문제가 생겨도 도와드릴 수 없어요.</div></div>

      <div class="chat-bd">
        <div class="chat-day">2026년 8월 6일</div>
        ${bubble('you', '안녕하세요! 요청서 잘 봤습니다. 사진에서 보니 3층에 승강기가 없으시네요.', '14:02')}
        ${bubble('me', '네 맞아요. 계단으로 옮기면 많이 힘들까요?', '14:05', true)}
        ${bubble('you', '냉장고와 세탁기가 있으면 사다리차를 쓰는 게 낫습니다. 시간도 절반으로 줄고 흠집 위험도 없어요.', '14:07')}

        <div class="chat-card">
          <div class="t-sub">견적서가 도착했어요</div>
          <div class="row-b mt2"><b class="price">${U.won(q.price)}</b>${U.badge('사다리차 포함', 'b-pri')}</div>
          <p class="t-sub mt2">${U.esc(q.one)}</p>
          <div class="btns mt3">
            ${U.btn('견적 보기', { href: 'QT-03', cls: 'btn-pri btn-sm btn-block' })}
          </div>
        </div>

        ${bubble('me', '사다리차 포함이면 괜찮네요. 옷장 분해도 해주시나요?', '14:20', true)}
        ${bubble('you', '네, 공구 챙겨 가겠습니다. 추가 비용은 없습니다.', '14:22')}

        <div class="chat-card">
          <div class="t-sub">일정을 제안했어요</div>
          <div class="row-c mt2"><span style="font-size:20px">📅</span>
            <div><b>8월 20일 (목) 오전 8:00</b><div class="t-sub">약 3~4시간 예상</div></div></div>
          <div class="btns mt3">
            <button class="btn btn-pri btn-sm grow" type="button" data-toast="일정을 수락했어요" data-toast-kind="ok">수락</button>
            <button class="btn btn-ghost btn-sm grow" type="button" data-toast="다른 날짜를 제안하는 창이 열려요">다른 날 제안</button>
          </div>
        </div>

        ${bubble('me', '8시 좋아요! 주차는 건물 앞에 가능할까요?', '14:28', true)}
        ${bubble('you', '네, 8시에 도착하도록 하겠습니다. 주차는 건물 앞에 가능할까요?', '14:31')}
        <div class="chat-typing">${U.esc(p.nm)}님이 입력 중…</div>
      </div>

      <div class="chat-in">
        <button class="ico" type="button" data-toast="사진 고르기 창이 열려요">📷</button>
        <button class="ico" type="button" data-toast="파일 고르기 창이 열려요">📎</button>
        <input type="text" placeholder="메시지를 입력하세요">
        ${U.btn('보내기', { cls: 'btn-pri', attr: ' data-toast="프로토타입이라 실제로 전송되지 않아요"' })}
      </div>
    </div>

    <div class="sticky">
      ${U.card('이 대화의 요청', `
        ${U.kv([['서비스', REQ.svc], ['희망일', REQ.when], ['요청 번호', REQ.no]])}
        <div class="btns col mt-block">
          ${U.btn('견적 상세 보기', { href: 'QT-03', cls: 'btn-ghost btn-sm btn-block' })}
          ${U.btn('요청 상세 보기', { href: 'MY-02', cls: 'btn-ghost btn-sm btn-block' })}
        </div>`)}

      <div class="mt4">${U.card('상대 프로필', `
        <div class="center">${U.phPro(72, p.id)}</div>
        <div class="center mt3"><b class="t-card">${U.esc(p.nm)}</b>
          <div class="t-sub">${U.esc(p.one)}</div></div>
        <div class="mt4">${U.kv([
    ['평점', `${U.stars(p.r)} ${p.r.toFixed(1)}`],
    ['응답률', `${p.resp}%`],
    ['누적 매칭', `${U.num(p.done)}건`],
  ])}</div>
        <div class="verifies mt3">${p.tags.map(U.verify).join('')}</div>
        <div class="btns mt-block">${U.btn('프로필 전체 보기', { href: 'SE-03', cls: 'btn-ghost btn-sm btn-block' })}</div>`)}</div>

      <div class="mt4">${U.card('일이 끝났나요?', `
        <p class="t-sub">작업이 끝난 것을 확인하신 뒤에 결제하시면 됩니다.</p>
        <div class="btns mt-block">${U.btn('결제하기', { href: 'PY-01', cls: 'btn-pri btn-block' })}</div>`, { cls: 'pri' })}</div>
    </div>
  </div>`;

  return { body, o: { wrapCls: 'wrap' } };
}

/* ---------------- PY-01 결제 ---------------- */
function PY01(ctx) {
  const p = PRO('p1'), q = QUOTES[0];
  const extra = 20000;
  const final = q.price + extra;

  const main = `
  ${U.card('이용 내역', `
    <div class="row-c mb4">${U.phPro(60, p.id)}
      <div class="grow"><b class="t-card">${U.esc(p.nm)}</b>
        <div class="t-sub">${REQ.svc} · ${U.stars(p.r)} ${p.r.toFixed(1)}</div></div>
      ${U.badge('작업 완료', 'b-ok')}</div>
    ${U.kv([
    ['방문 일시', '2026년 8월 20일 (목) 08:00 ~ 12:20'],
    ['장소', '강남구 역삼동 → 송파구 잠실동'],
    ['작업 시간', '4시간 20분'],
    ['완료 확인', '2026-08-20 12:24 · 내가 확인함'],
  ])}`)}

  <div class="mt-block">${U.card('금액이 견적과 달라요', `
    ${U.banner('warn', '📌', `<b>추가 작업으로 20,000원이 늘었어요</b>
      <div class="t-sub mt1">현장에서 옷장 외에 <b>책장 분해</b>가 추가로 필요했습니다. 작업 전에 알려드리고 동의를 받았습니다.</div>`)}
    <div class="g2 mt4">
      <div class="box soft"><div class="t-sub">처음 견적</div><div class="price mt1">${U.won(q.price)}</div></div>
      <div class="box"><div class="t-sub">최종 금액</div><div class="price mt1 pri">${U.won(final)}</div></div>
    </div>
    <div class="mt4">${U.sumRows([
      ['기본료 (원룸 이사)', U.won(q.base)],
      ...q.extra.map(([k, v]) => [k, U.won(v)]),
      ['책장 분해 (추가)', `<b class="acc">＋${U.won(extra)}</b>`],
    ], ['최종 금액', U.won(final)])}</div>
    <p class="t-sub mt3">추가 금액에 동의하지 않으셨다면 결제 전에 <a class="link" href="${U.link('CH-02')}">고수에게 문의</a>하거나 고객센터로 알려 주세요.</p>`)}</div>

  <div class="mt-block">${U.card('쿠폰·포인트', `
    <div class="field">
      <label class="lb">쿠폰</label>
      <div class="inline"><select class="input"><option>쓸 수 있는 쿠폰 1장 — 첫 이용 10,000원 할인</option><option>쓰지 않기</option></select>
        <button class="btn btn-ghost none" type="button" data-toast="쿠폰함이 열려요">쿠폰함</button></div>
    </div>
    <div class="field" style="margin-bottom:0">
      <label class="lb">포인트 <span class="t-sub">(보유 1,000P)</span></label>
      <div class="inline"><input class="input" value="1,000"><button class="btn btn-ghost none" type="button" data-toast="보유 포인트를 모두 적용했어요">전액 사용</button></div>
      <p class="help">1,000P 이상부터 쓸 수 있어요.</p>
    </div>`)}</div>

  <div class="mt-block">${U.card('결제 수단', `
    <div class="g3 mb4">
      ${[['💳', '신용·체크카드', true], ['📱', '간편결제', false], ['🏦', '계좌이체', false]]
    .map(([ic, t, on]) => `<button class="radio${on ? ' on' : ''}" type="button" data-group="pay" style="text-align:center">
      <div style="font-size:22px">${ic}</div><b style="margin-top:6px">${t}</b></button>`).join('')}
    </div>
    <div class="field"><label class="lb">카드 고르기</label>
      <select class="input"><option>신한카드 (1234) · 기본 카드</option><option>＋ 새 카드 등록</option></select></div>
    <div class="field" style="margin-bottom:0"><label class="lb">할부</label>
      <select class="input"><option>일시불</option><option>2개월 (무이자)</option><option>3개월 (무이자)</option></select>
      <p class="help">5만원 이상부터 할부가 가능해요.</p></div>`)}</div>

  <div class="mt-block">${U.card('현금영수증', `
    <label class="check box mb3"><input type="checkbox" checked><span>현금영수증을 신청할게요</span></label>
    <div class="g2">
      <div><label class="lb">용도</label><select class="input"><option>소득공제 (개인)</option><option>지출증빙 (사업자)</option></select></div>
      <div><label class="lb">번호</label><input class="input" value="010-1234-5678"></div>
    </div>
    <p class="help">카드 결제는 매출전표로 자동 처리되므로 따로 신청하지 않으셔도 돼요.</p>`)}</div>`;

  const aside = `
  ${U.card('결제 금액', `
    ${U.sumRows([
    ['최종 이용 금액', U.won(final)],
    ['쿠폰 할인', `<span class="pri">-${U.won(10000)}</span>`],
    ['포인트 사용', `<span class="pri">-${U.won(1000)}</span>`],
  ], ['결제할 금액', U.won(final - 11000)])}
    <label class="check box mt-block" data-unlock="pay"><input type="checkbox">
      <span class="t-sub">결제 내용을 확인했고 <b>전자금융거래 약관</b>에 동의해요</span></label>
    <div class="btns mt-block">${U.btn(`${U.won(final - 11000)} 결제하기`, { cls: 'btn-pri btn-lg btn-block is-off', id: 'pay', off: true })}</div>
    <div class="btns mt2">${U.btn('결제 실패 화면 보기', { href: 'PY-03', cls: 'btn-quiet btn-sm btn-block' })}</div>`, { cls: 'pri' })}

  <div class="mt4">${U.banner('ok', '🔒', `<b>일이 끝난 것을 확인한 뒤 결제됩니다</b>
    <div class="t-sub mt1">미리 보내는 계약금은 없어요. 결제 전에 문제가 있으면 신고해 주세요.</div>`)}</div>

  <div class="mt4">${U.box(`<h4 class="t-card mb2">결제가 되면</h4>
    <div class="col" style="gap:var(--sp-item)">
      <div class="t-sub">· 영수증을 바로 보실 수 있어요</div>
      <div class="t-sub">· 후기를 남기면 1,000 포인트를 드려요</div>
      <div class="t-sub">· 고수에게는 5영업일 뒤에 정산돼요</div>
    </div>`, { cls: 'soft' })}</div>`;

  const body = U.detail2(main, aside);
  return { body, o: { state: '작업 완료 확인됨 — 결제 대기' } };
}

/* ---------------- PY-02 결제 완료 ---------------- */
function PY02(ctx) {
  const p = PRO('p1');
  const body = `
  <div class="center" style="padding:var(--s10) 0 var(--s8)">
    <div style="font-size:56px;color:var(--success)">✓</div>
    <h1 class="t-page mt3">결제가 끝났어요</h1>
    <p class="t-sub mt2">주문번호 <b style="color:var(--text)">P-20260820-0417</b> · 2026-08-20 12:31</p>
  </div>

  ${U.card('결제 내역', `
    ${U.kv([
    ['서비스', REQ.svc],
    ['고수', U.esc(p.nm)],
    ['이용일', '2026년 8월 20일 (목)'],
    ['이용 금액', U.won(260000)],
    ['쿠폰·포인트', `<span class="pri">-${U.won(11000)}</span>`],
    ['결제 수단', '신한카드 (1234) · 일시불'],
    ['결제 금액', '<b class="price">249,000원</b>'],
  ])}`, { ft: `<div class="row-b"><span class="t-sub">현금영수증 신청 완료 (소득공제)</span>
    <button class="link" type="button" data-toast="영수증 창이 열려요">영수증 보기</button></div>` })}

  <div class="mt-block">${U.card('', `<div class="row-b wrap-row">
    <div>
      <span class="badge b-acc">포인트 적립</span>
      <h2 class="t-sec mt2">후기를 남기면 1,000 포인트를 드려요</h2>
      <p class="t-sub mt2">다음에 이 서비스를 찾는 분들에게 큰 도움이 돼요. 사진을 함께 올리면 500 포인트를 더 드립니다.</p>
    </div>
    ${U.btn('후기 쓰기', { href: 'RV-01', cls: 'btn-pri btn-lg' })}
  </div>`, { cls: 'acc' })}</div>

  <div class="g2 mt-block">
    <a class="box" href="${U.link('RQ-01')}">
      <div class="row-c">${U.phPro(48, p.id)}<div><b>이 고수에게 다시 맡기기</b>
        <div class="t-sub">요청서를 다시 쓰지 않아도 바로 보낼 수 있어요.</div></div></div>
    </a>
    <div class="box soft">
      <b>문제가 있었나요?</b>
      <p class="t-sub mt1">약속과 다르거나 물건이 상했다면 알려 주세요. 결제일로부터 14일 안에 접수할 수 있어요.</p>
      <div class="btns mt3">${U.btn('신고하기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="신고 접수 창이 열려요"' })}</div>
    </div>
  </div>

  <div class="btns col mt-block">
    ${U.btn('내 요청으로', { href: 'MY-01', cls: 'btn-pri btn-lg btn-block' })}
    ${U.btn('내 후기 보기', { href: 'RV-02', cls: 'btn-quiet btn-block' })}
  </div>`;

  return { body, o: { wrapCls: 'wrap-read' } };
}

/* ---------------- PY-03 결제 실패 ---------------- */
function PY03(ctx) {
  const body = `
  <div class="center" style="padding:var(--s10) 0 var(--s8)">
    <div style="font-size:56px;color:var(--danger)">!</div>
    <h1 class="t-page mt3">결제가 되지 않았어요</h1>
    <p class="t-sub mt2">카드 한도를 넘었습니다. (승인 거절 · 코드 51)</p>
  </div>

  ${U.banner('ok', '✅', `<b>아직 결제되지 않았고 이용 내역은 그대로 있어요</b>
    <div class="t-sub mt1">돈이 나가지 않았습니다. 아래에서 다시 시도하시면 됩니다.</div>`)}

  <div class="mt-block">${U.card('이럴 때 이렇게 해보세요', `<div class="col" style="gap:var(--sp-item)">
    ${[['1', '카드 한도를 확인해 주세요', '이번 달 사용 한도가 남아 있는지 카드사 앱에서 볼 수 있어요.'],
    ['2', '다른 카드로 해보세요', '등록된 카드가 여러 장이면 바꿔서 시도할 수 있어요.'],
    ['3', '간편결제를 써 보세요', '카카오페이·네이버페이는 연결된 계좌에서 바로 빠져나가요.']]
    .map(([n, t, d]) => `<div class="row" style="gap:var(--s3)">
      <span class="badge b-pri lg" style="flex:none">${n}</span>
      <div><b>${t}</b><div class="t-sub mt1">${d}</div></div></div>`).join('')}
  </div>`)}</div>

  <div class="mt-block">${U.card('결제하려던 내역', U.kv([
    ['서비스', REQ.svc],
    ['고수', '한결이사'],
    ['결제 금액', '<b class="price">249,000원</b>'],
    ['시도 시각', '2026-08-20 12:29'],
  ]))}</div>

  <div class="btns col mt-block">
    ${U.btn('다시 시도하기', { href: 'PY-01', cls: 'btn-pri btn-lg btn-block' })}
    ${U.btn('다른 결제 수단으로', { href: 'PY-01', cls: 'btn-ghost btn-block' })}
    ${U.btn('고수에게 상황 알리기', { href: 'CH-02', cls: 'btn-ghost btn-block' })}
    ${U.btn('고객센터 문의 (1544-0000)', { cls: 'btn-quiet btn-block', attr: ' data-toast="평일 09:00–18:00에 연결됩니다"' })}
  </div>

  <p class="t-sub center mt-block">3일 안에 결제하지 않으면 고수에게 안내가 갑니다. 사정이 있으시면 고수에게 미리 말씀해 주세요.</p>`;

  return { body, o: { wrapCls: 'wrap-read' } };
}

export const PAGES = { 'CH-01': CH01, 'CH-02': CH02, 'PY-01': PY01, 'PY-02': PY02, 'PY-03': PY03 };
