/* CH 채팅 · PY 결제·이용 · MY 내 요청 · RV 후기 — 3뎁스 하위 화면 24장
 *
 * 고수를 고른 «뒤»에 벌어지는 일이다. 여기서부터 돈과 사람이 걸린다 —
 * 금액이 바뀌고, 결제가 막히고, 일정이 어긋나고, 문제가 생긴다.
 * 그래서 이 메뉴의 화면은 대부분 「무엇이 얼마나 돌아오나」를 숫자로 적어 둔다.
 */
import * as U from './ui.mjs';
import { PROS, MYREQS, REVIEWS } from './data.mjs';

const P = {};
export default P;
export const PAGES = P;

const 고수 = PROS[0];

/* ================= CH0102 채팅 목록 > 대화 없음 ================= */
P['CH0102'] = () => {
  const body = `
${U.pageHd('아직 대화가 없습니다', '고수를 고르시면 여기에 쌓입니다')}

${U.card('', U.empty('💬', '나눈 대화가 없어요',
    '요청서를 보내고 고수를 고르시면 대화방이 열립니다. 고르기 전에도 궁금한 것은 물어보실 수 있어요.',
    `${U.btn('요청서 쓰기', { href: 'RQ-01', cls: 'btn-pri btn-lg' })}
     ${U.btn('고수 둘러보기', { href: 'SE-01', cls: 'btn-ghost btn-lg' })}`))}

${U.card('고르기 전에 물어보고 싶으시면', U.kv([
    ['고수 상세에서', '「채팅으로 물어보기」를 누르시면 바로 열립니다'],
    ['무엇을 물어보나', '「이 조건이면 대략 얼마인가요」가 가장 많습니다'],
    ['답변 시간', '고수 프로필에 <b>평균 응답 시간</b>이 적혀 있습니다'],
    ['비용', '대화는 <b>무료</b>입니다 — 고르지 않으셔도 됩니다'],
  ]), { cls: 'mt6' })}

${U.banner('info', '🔔', `<b>알림이 꺼져 있으면 답이 와도 모르십니다.</b>
  <p class="t-sub mt1">고수가 답하면 알려드립니다. 지금 브라우저 알림이 꺼져 있습니다.</p>`,
    { right: U.btn('알림 켜기', { cls: 'btn-pri', attr: ' data-toast="브라우저가 알림 권한을 물어봅니다"' }) })}`;

  return { body, o: { my: true } };
};

/* ================= CH0103 채팅 목록 > 안 읽음 필터 ================= */
P['CH0103'] = () => {
  const body = `
${U.pageHd('안 읽은 대화', '3개가 기다리고 있습니다')}

${U.card('', `<div class="row-b wrap-row mb4">
    ${U.tabs([{ label: '전체', cnt: 7, go: 'CH-01' }, { label: '안 읽음', cnt: 3 }], 1, { pill: true })}
    <div class="row-c">
      ${U.tabs(['최신순', '오래된 순'], 1, { pill: true })}
      ${U.btn('모두 읽음', { cls: 'btn-ghost btn-sm', attr: ' data-toast="3개를 모두 읽음으로 바꿨어요"' })}
    </div>
  </div>
  <div class="list">
    ${PROS.slice(0, 3).map((p, i) => `<a class="row-item" href="${U.link('CH-02')}">
      ${U.phAva(44, p.nm)}
      <span class="grow"><b>${p.nm}</b> ${U.badge(String(i + 1), 'b-pri')}
        <span class="t-sub" style="display:block">${['네, 8시에 도착하도록 하겠습니다', '사다리차는 따로 부르셔야 합니다', '그 날짜는 어렵고 21일은 어떠신가요'][i]}</span></span>
      <span class="t-sub nowrap">${['2일 전', '3일 전', '5일 전'][i]}</span>
    </a>`).join('')}
  </div>`)}

${U.card('오래된 순으로 보는 까닭', `<p class="t-sub">안 읽은 대화는 <b>오래된 것부터</b> 보여드립니다.
  가장 오래 기다린 사람에게 먼저 답하시는 편이 낫기 때문입니다 —
  최신순으로 두면 오래된 것이 계속 아래로 밀립니다.</p>`, { cls: 'mt6' })}

${U.card('읽음 처리는 이렇게', U.kv([
    ['대화방에 들어가면', '자동으로 읽음이 됩니다'],
    ['미리보기만 봤을 때', '읽음이 아닙니다 — 목록에서 스쳐 본 것은 읽은 게 아닙니다'],
    ['「모두 읽음」', '안 읽은 것을 <b>한 번에</b> 지웁니다. 되돌릴 수 없습니다'],
    ['상대에게', '「읽음」이 보입니다 — 답을 안 하시면 기다리는 쪽이 압니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= CH0202 채팅방 > 사진·파일 보내기 ================= */
P['CH0202'] = () => {
  const body = `
${U.pageHd('사진 보내기', `${고수.nm} 와의 대화`)}

${U.card('', `<div class="g4 mb4">
    ${[1, 2, 3].map((i) => `<div class="thumb-del">${U.phWork('ch' + i)}
      <button class="del" type="button" data-toast="사진을 뺐어요" aria-label="삭제">✕</button></div>`).join('')}
    <label class="drop" style="min-height:0;aspect-ratio:1/1;cursor:pointer">
      <span style="font-size:24px">＋</span>
      <input type="file" hidden multiple data-toast="사진을 골랐어요"></label>
  </div>
  <div class="list">
    <div class="row-item">
      <span class="grow"><b>거실_전체.jpg</b>
        <span class="t-sub" style="display:block">2.4MB · 보내는 중</span>
        <span style="display:block;margin-top:6px">${U.progress(72)}</span></span>
      ${U.btn('취소', { cls: 'btn-ghost btn-sm', attr: ' data-toast="보내기를 취소했어요"' })}
    </div>
    <div class="row-item">
      ${U.badge('실패', 'b-danger')}
      <span class="grow"><b>안방_장롱.heic</b>
        <span class="t-sub" style="display:block">18.2MB · <b>10MB 를 넘습니다</b></span></span>
      ${U.btn('다시 보내기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="크기를 줄여 다시 보냅니다"' })}
    </div>
  </div>
  <div class="btns mt-block">
    ${U.btn('3장 보내기', { cls: 'btn-pri btn-lg', attr: ' data-toast="사진 3장을 보냈어요"' })}
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'CH-02' })}
  </div>`)}

${U.card('보내실 수 있는 것', U.kv([
    ['사진', 'JPG · PNG · HEIC — 한 장 <b>10MB</b> 까지, 한 번에 10장'],
    ['문서', 'PDF · 한글 · 워드 — <b>20MB</b> 까지'],
    ['보낼 수 없는 것', '실행 파일(.exe · .apk) 은 받지 않습니다'],
    ['자동 줄이기', '10MB 를 넘는 사진은 <b>알아서 줄여</b> 보냅니다 — 원본이 필요하면 문서로 보내세요'],
  ]), { cls: 'mt6' })}

${U.banner('warn', '🙈', `<b>사진에 개인정보가 없는지 봐 주세요.</b>
  <p class="t-sub mt1">택배 상자의 주소, 우편물, 서류가 함께 찍히는 일이 잦습니다.
  한 번 보낸 사진은 <b>상대가 이미 봤을 수 있습니다.</b></p>`)}`;

  return { body, o: { my: true } };
};

/* ================= CH0203 채팅방 > 일정 제안·수락 ================= */
P['CH0203'] = () => {
  const body = `
${U.pageHd('일정 제안', `${고수.nm} 가 날짜를 제안했습니다`)}

${U.card('', `<div class="box box-pri">
    <b>${고수.nm} 의 제안</b>
    ${U.kv([
      ['날짜', '<b>2026년 8월 21일 (금)</b>'],
      ['시간', '<b>오전 8시</b> 시작 · 3~4시간'],
      ['한 말', '「20일은 다른 일정이 있어 21일 오전이면 여유 있게 할 수 있습니다」'],
    ])}
    <div class="btns mt4">
      ${U.btn('수락', { cls: 'btn-pri', attr: ' data-toast="일정을 확정했어요. 양쪽 일정에 등록됩니다"' })}
      ${U.btn('다른 날 제안', { cls: 'btn-ghost', attr: ' data-toast="원하는 날짜를 고르세요"' })}
    </div>
  </div>`)}

${U.card('변경 이력', `${U.timeline([
    ['처음 요청', '8월 20일 (목) 오전 — 손님'],
    ['다른 날 제안', '8월 21일 (금) 오전 — 고수 · 방금'],
    ['확정', '아직'],
  ], 1)}
  <p class="t-sub mt4">주고받은 제안이 <b>그대로 남습니다.</b>
    나중에 「그때 뭐라고 했더라」를 다시 찾지 않으셔도 됩니다.</p>`, { cls: 'mt6' })}

${U.card('확정하면 이렇게 됩니다', U.kv([
    ['양쪽 일정', '손님과 고수 모두의 「내 일정」에 등록됩니다'],
    ['알림', '<b>전날 저녁</b>과 <b>당일 아침</b>에 알려드립니다'],
    ['다시 바꾸려면', '확정 뒤에도 바꾸실 수 있지만 <b>양쪽이 다시 수락</b>해야 합니다'],
    ['당일 변경', '취소 수수료가 붙을 수 있습니다 — 취소 규정을 보세요'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= CH0204 채팅방 > 안전 거래 안내 ================= */
P['CH0204'] = () => {
  const body = `
${U.pageHd('안전하게 거래하기', '앱 밖 송금은 보호받지 못합니다')}

${U.banner('danger', '🚨', `<b>「계좌로 먼저 보내 주세요」는 «반드시» 거절하세요.</b>
  <p class="t-sub mt1">앱 밖에서 보낸 돈은 <b>저희가 돌려드릴 수 없습니다.</b>
  앱 안에서 결제하시면 일이 끝날 때까지 저희가 돈을 보관합니다.</p>`)}

${U.card('이런 말이 나오면 조심하세요', `${U.table(
    [{ t: '이런 말', w: '46%' }, '왜 위험한가'],
    [
      ['「수수료 아끼게 계좌로 주세요」', '분쟁이 나도 <b>돌려받을 방법이 없습니다</b>'],
      ['「예약금 먼저 보내 주세요」', '받고 연락이 끊기는 일이 가장 잦습니다'],
      ['「카톡으로 옮겨서 얘기하죠」', '대화 기록이 남지 않아 <b>증거가 사라집니다</b>'],
      ['「현금가가 더 쌉니다」', '영수증도 보증도 없습니다'],
      ['「이 링크로 결제해 주세요」', '가짜 결제창일 수 있습니다'],
    ],
  )}`, { cls: 'mt6' })}

${U.card('앱 안에서 결제하시면', U.kv([
    ['돈은 어디에', '일이 끝날 때까지 <b>저희가 보관</b>합니다 — 고수에게 바로 가지 않습니다'],
    ['문제가 생기면', '보관 중인 돈에서 <b>돌려드립니다</b>'],
    ['고수가 안 오면', '전액 환불 + 고수가 위약금을 냅니다'],
    ['수수료', '<b>손님은 0원</b>입니다 — 수수료는 고수가 냅니다'],
  ]), { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btn('이런 대화를 신고하기', { cls: 'btn-danger', href: 'CH0205' })}
  ${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'AU-05' })}
</div>
<p class="t-sub mt3">외부 거래를 유도한 고수는 <b>즉시 활동 정지</b>됩니다.
  신고하신 분이 누구인지 고수에게 알리지 않습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= CH0205 채팅방 > 신고·차단 ================= */
P['CH0205'] = () => {
  const body = `
${U.pageHd('신고하기', `${고수.nm}`)}

${U.card('무엇이 문제였나요', `
  ${[
    ['외부 거래 유도', '앱 밖에서 결제하자고 합니다', true],
    ['불쾌한 언행', '무례하거나 부적절한 말을 들었습니다', false],
    ['허위 정보', '프로필이나 견적이 사실과 다릅니다', false],
    ['연락 두절', '진행 중인데 답이 없습니다', false],
    ['그 밖에', '위에 없는 문제입니다', false],
  ].map(([나, 설명, 첫]) => `<label class="chk mb3">
    <input type="radio" name="rp"${첫 ? ' checked' : ''}> <span><b>${나}</b>
      <span class="t-sub" style="display:block">${설명}</span></span></label>`).join('')}

  <textarea class="input mt4" rows="3" placeholder="자세히 적어 주시면 확인이 빠릅니다" aria-label="신고 내용"></textarea>

  <div class="box mt4">
    <label class="chk"><input type="checkbox" checked disabled>
      <b>이 대화 내용이 함께 첨부됩니다</b></label>
    <p class="t-sub mt2">대화는 <b>자동으로 붙습니다</b> — 따로 캡처하지 않으셔도 됩니다.
      확인이 끝나면 저희도 다시 보지 않습니다.</p>
  </div>

  <div class="btns mt-block">
    ${U.btn('신고 접수', { cls: 'btn-danger btn-lg', attr: ' data-toast="신고를 접수했어요. 3영업일 안에 알려드릴게요"' })}
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'CH-02' })}
  </div>`)}

${U.card('차단하면 어떻게 되나', U.kv([
    ['이 고수', '더 이상 <b>연락할 수 없습니다</b> — 견적도 안 옵니다'],
    ['진행 중인 일', '<b>그대로 남습니다</b> — 차단해도 끝난 것이 아닙니다'],
    ['상대에게', '차단했다고 알리지 않습니다'],
    ['되돌리기', '계정 설정에서 언제든 풀 수 있습니다'],
  ]) + `<div class="btns mt4">
    ${U.btn('차단하기', { cls: 'btn-ghost', attr: ' data-toast="차단했어요. 더 이상 연락이 오지 않습니다"' })}
  </div>`, { cls: 'mt6' })}

${U.card('처리는 이렇게', U.kv([
    ['기간', '<b>3영업일</b> 안에 결과를 알려드립니다'],
    ['외부 거래 유도', '사실이면 <b>즉시 활동 정지</b>입니다'],
    ['익명', '신고하신 분이 누구인지 알리지 않습니다'],
    ['허위 신고', '반복되면 신고 기능이 제한될 수 있습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= PY0102 결제 > 금액 변경 확인 ================= */
P['PY0102'] = () => {
  const body = `
${U.pageHd('금액이 바뀌었습니다', '견적 28만원 → 최종 34만원')}

${U.banner('warn', '💰', `<b>6만원 올랐습니다.</b>
  <p class="t-sub mt1">고수가 현장에서 확인한 뒤 <b>일을 시작하기 전에</b> 알려 왔습니다.
  동의하지 않으시면 결제하지 않으셔도 됩니다.</p>`)}

${U.card('무엇 때문에 올랐나', `${U.sumRows([
    ['견적가', '280,000원'],
    ['사다리차 (엘리베이터 없음 · 4층)', '+120,000원'],
    ['짐 축소 조정', '−60,000원'],
  ], ['최종 금액', '340,000원'])}
  <div class="box mt4"><b>고수가 남긴 설명</b>
    <p class="t-sub mt1">「엘리베이터가 없어 사다리차를 불렀습니다.
    대신 예상보다 짐이 적어 인력 한 명을 줄였습니다.」</p></div>`)}

${U.card('어떻게 하시겠어요', `<div class="btns">
  ${U.btn('동의하고 결제', { cls: 'btn-pri btn-lg', attr: ' data-toast="34만원으로 결제를 진행합니다"' })}
  ${U.btn('이의 있습니다', { cls: 'btn-ghost btn-lg', attr: ' data-toast="이의를 접수했어요. 중재 절차로 넘어갑니다"' })}
</div>
<p class="t-sub mt3">이의를 제기하시면 <b>돈이 나가지 않은 채로</b> 저희가 양쪽 말을 듣습니다.
  평균 2영업일 걸립니다.</p>`, { cls: 'mt6' })}

${U.card('금액을 바꿀 수 있는 규칙', U.kv([
    ['언제까지', '<b>일을 시작하기 전</b>까지만 — 시작한 뒤 올려 부르는 것은 규정 위반입니다'],
    ['얼마나', '견적의 <b>50% 를 넘길 수 없습니다</b>. 넘으면 새 견적으로 처리합니다'],
    ['안 알리고 올리면', '신고해 주세요 — 확인되면 고수가 <b>차액을 부담</b>합니다'],
    ['내리는 것', '언제든 가능합니다. 동의 없이도 내려갑니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= PY0103 결제 > 쿠폰·포인트 적용 ================= */
P['PY0103'] = () => {
  const 쿠폰 = [
    ['첫 이용 20% 할인', '~2026-08-31', 56000, true, ''],
    ['이사 분야 1만원', '~2026-09-15', 10000, true, ''],
    ['재이용 15% 할인', '~2026-12-31', 0, false, '같은 고수를 두 번 이용하셔야 씁니다'],
  ];

  const body = `
${U.pageHd('할인 적용', '쿠폰과 포인트를 함께 쓰실 수 있습니다')}

${U.card('가지고 계신 쿠폰', `<div class="list">
  ${쿠폰.map(([나, 만료, 액, 쓸수, 왜]) => `<label class="row-item chk-row${쓸수 ? '' : ' is-off'}">
    <input type="radio" name="cp"${쓸수 && 액 === 56000 ? ' checked' : ''}${쓸수 ? '' : ' disabled'}
      data-toast="${나}${U.조사붙이기(나, '을', '를')} 적용했어요">
    <span class="grow"><b>${나}</b>
      <span class="t-sub" style="display:block">${만료}${왜 ? ` · ${왜}` : ''}</span></span>
    ${쓸수 ? `<b class="acc nowrap">−${U.won(액)}</b>` : U.badge('사용 불가', 'b-mut')}
  </label>`).join('')}
</div>
<p class="t-sub mt3">쿠폰은 <b>한 번에 하나</b>만 쓰실 수 있습니다 — 가장 많이 깎이는 것을 골라 두었습니다.</p>`)}

${U.card('포인트', `${U.kv([
    ['가진 포인트', '<b class="price">3,200 P</b>'],
    ['쓸 수 있는 만큼', '결제액의 <b>10%</b>까지 · 지금은 <b>2,240 P</b>'],
  ])}
  <div class="row-c mt3">
    <input class="input" style="width:160px" value="2240" aria-label="쓸 포인트"> P
    ${U.btn('전액 쓰기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="쓸 수 있는 만큼 다 넣었어요"' })}
  </div>`, { cls: 'mt6' })}

${U.card('결제하실 금액', `${U.sumRows([
    ['서비스 금액', '280,000원'],
    ['첫 이용 20% 할인', '−56,000원'],
    ['포인트', '−2,240원'],
  ], ['결제 금액', '221,760원'])}
  <p class="t-sub mt3">조건을 바꾸시면 <b>이 숫자가 바로 따라옵니다.</b> 결제 직전에 다시 계산되지 않습니다 —
    지금 보시는 금액 그대로 청구됩니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= PY0104 결제 > 현금영수증 신청 ================= */
P['PY0104'] = () => {
  const body = `
${U.pageHd('현금영수증', '결제와 함께 자동으로 발급됩니다')}

${U.card('', `
  <label class="chk mb4"><input type="checkbox" checked data-toast="현금영수증을 신청합니다">
    <b>현금영수증 신청</b></label>

  <p class="t-th mb2">용도</p>
  <label class="chk mb2"><input type="radio" name="rc" checked>
    <span><b>소득공제</b> <span class="t-sub">— 개인 · 연말정산에 씁니다</span></span></label>
  <label class="chk mb4"><input type="radio" name="rc">
    <span><b>지출증빙</b> <span class="t-sub">— 사업자 · 비용 처리에 씁니다</span></span></label>

  <p class="t-th mb2">번호</p>
  <input class="input" value="010-6526-9808" aria-label="현금영수증 번호">
  <p class="t-sub mt2">소득공제는 <b>휴대폰 번호</b>, 지출증빙은 <b>사업자등록번호</b>를 넣으세요.</p>

  <label class="chk mt6"><input type="checkbox" checked data-toast="다음부터 자동으로 신청합니다">
    <b>다음부터 자동으로 신청</b> <span class="t-sub">— 매번 안 물어봅니다</span></label>

  <div class="btns mt-block">
    ${U.btn('저장하고 결제', { cls: 'btn-pri btn-lg', attr: ' data-toast="현금영수증 정보를 저장했어요"' })}
    ${U.btn('신청 안 함', { cls: 'btn-ghost btn-lg', href: 'PY-01' })}
  </div>`)}

${U.card('언제 발급되나', U.kv([
    ['발급 시점', '<b>결제가 끝난 직후</b> 자동으로'],
    ['국세청 반영', '<b>다음 날</b> — 홈택스에서 확인하실 수 있습니다'],
    ['나중에 신청', '결제 후 <b>7일</b> 안에는 영수증 화면에서 하실 수 있습니다'],
    ['취소·환불되면', '현금영수증도 <b>자동으로 취소</b>됩니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= PY0202 결제 완료 > 영수증 보기 ================= */
P['PY0202'] = () => {
  const body = `
${U.pageHd('영수증', '주문번호 R-20260806-0142')}

${U.card('', U.kv([
    ['주문번호', '<b class="num">R-20260806-0142</b>'],
    ['결제일시', '2026-08-21 13:42:08'],
    ['서비스', '원룸·소형 이사'],
    ['고수', `${고수.nm}`],
    ['결제수단', '신한카드 1234 · 일시불'],
    ['승인번호', '<b class="num">30284917</b>'],
  ]))}

${U.card('금액', U.sumRows([
    ['서비스 금액', '280,000원'],
    ['첫 이용 20% 할인', '−56,000원'],
    ['포인트', '−2,240원'],
  ], ['결제 금액', '221,760원']), { cls: 'mt6' })}

${U.card('사업자 정보', U.kv([
    ['상호', '카페인컬러'],
    ['대표자', '최현'],
    ['사업자등록번호', '<b class="num">608-79-25359</b>'],
    ['주소', '서울특별시 강남구 학동로4길 15, 719호'],
    ['통신판매업', '제 2026-서울강남-04184 호'],
  ]), { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btn('🖨 인쇄', { cls: 'btn-ghost btn-lg', attr: ' data-toast="인쇄 창을 엽니다"' })}
  ${U.btn('PDF 저장', { cls: 'btn-ghost btn-lg', attr: ' data-toast="영수증을 PDF로 저장했어요"' })}
  ${U.btn('메일로 보내기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="등록하신 메일로 보냈어요"' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= PY0203 결제 완료 > 다시 맡기기 ================= */
P['PY0203'] = () => {
  const body = `
${U.pageHd('다음에 또 맡기시겠어요?', `${고수.nm} 에게 바로 요청하실 수 있습니다`)}

${U.banner('ok', '🎟', `<b>단골 할인 <b>10%</b>를 드립니다.</b>
  <p class="t-sub mt1">같은 고수를 두 번째로 부르시면 자동으로 붙습니다. 쿠폰을 따로 받지 않으셔도 됩니다.</p>`)}

${U.card('지난 조건 그대로', `${U.kv([
    ['서비스', '원룸·소형 이사'],
    ['짐 양', '원룸 (10평 이하)'],
    ['출발·도착', '강남구 → 마포구'],
    ['금액', '<b>280,000원</b> → 단골 할인 <b class="acc">252,000원</b>'],
  ])}
  <div class="btns mt-block">
    ${U.btn('일정만 새로 고르기', { cls: 'btn-pri btn-lg', href: 'RQ-02' })}
    ${U.btn('조건도 바꾸기', { cls: 'btn-ghost btn-lg', href: 'RQ-01' })}
  </div>
  <p class="t-sub mt3">일정만 고르시면 요청서를 다시 안 쓰셔도 됩니다 — <b>30초</b>면 끝납니다.</p>`,
    { cls: 'mt6' })}

${U.card('다른 고수도 보시겠어요', `<p class="t-sub mb4">같은 조건으로 새 요청서를 쓰시면 여러 견적을 다시 받으실 수 있습니다.
  단골 할인은 이 고수에게만 붙습니다.</p>
  <div class="list">
    ${PROS.slice(1, 3).map((p) => U.proRow(p)).join('')}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= PY0302 결제 실패 > 결제 수단 바꾸기 ================= */
P['PY0302'] = () => {
  const body = `
${U.pageHd('다른 수단으로 해 보시겠어요?', '금액과 내역은 그대로 있습니다')}

${U.banner('danger', '💳', `<b>신한카드 1234 로 결제하지 못했습니다 — 한도 초과입니다.</b>
  <p class="t-sub mt1">금액은 청구되지 않았습니다. 다른 수단을 고르시면 <b>같은 내역 그대로</b> 진행됩니다.</p>`)}

${U.card('결제할 내역', U.sumRows([
    ['서비스 금액', '280,000원'],
    ['할인', '−58,240원'],
  ], ['결제 금액', '221,760원']))}

${U.card('다른 수단', `<div class="list">
  <label class="row-item chk-row"><input type="radio" name="pm">
    <span class="grow"><b>국민카드 5678</b><span class="t-sub" style="display:block">2027-08 만료</span></span></label>
  <label class="row-item chk-row"><input type="radio" name="pm" checked>
    <span class="grow"><b>카카오페이</b><span class="t-sub" style="display:block">연결됨</span></span></label>
  <label class="row-item chk-row"><input type="radio" name="pm">
    <span class="grow"><b>새 카드 등록</b><span class="t-sub" style="display:block">이번만 쓰거나 저장하실 수 있습니다</span></span></label>
  <label class="row-item chk-row"><input type="radio" name="pm">
    <span class="grow"><b>계좌이체</b><span class="t-sub" style="display:block">입금 확인까지 5분쯤 걸립니다</span></span></label>
</div>
<div class="btns mt-block">
  ${U.btn('카카오페이로 결제', { cls: 'btn-pri btn-lg', attr: ' data-toast="카카오페이로 결제를 진행합니다"' })}
</div>`, { cls: 'mt6' })}

${U.card('왜 실패했는지에 따라', U.kv([
    ['한도 초과', '다른 카드나 간편결제를 쓰시면 됩니다'],
    ['승인 거절', '카드사에 직접 확인하셔야 합니다 — 해외 결제 차단이 잦습니다'],
    ['잔액 부족', '계좌를 채우시거나 계좌이체로 바꾸세요'],
    ['본인인증 실패', '통신사 인증이 끊긴 것입니다. 다시 시도하시면 대부분 됩니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= PY0303 결제 실패 > 미결제 안내 ================= */
P['PY0303'] = () => {
  const body = `
${U.pageHd('아직 결제하지 않으셨습니다', '일은 8월 21일에 끝났습니다')}

${U.banner('warn', '⏰', `<b>결제 기한이 <b>2일</b> 남았습니다.</b>
  <p class="t-sub mt1">일이 끝난 날로부터 <b>7일</b> 안에 결제하셔야 합니다. 지금 5일 지났습니다.</p>`,
    { right: U.btn('지금 결제', { cls: 'btn-pri', href: 'PY-01' }) })}

${U.card('언제 무엇이 일어나나', `${U.timeline([
    ['일 완료', '8월 21일 · 고수가 완료를 눌렀습니다'],
    ['손님 확인', '8월 21일 · 확인하셨습니다'],
    ['결제 기한', '<b>8월 28일까지</b> — 2일 남음'],
    ['고수에게 안내', '기한이 지나면 고수에게 「미결제」가 전달됩니다'],
    ['이용 제한', '기한 뒤 <b>7일</b>이 더 지나면 새 요청을 보낼 수 없습니다'],
  ], 2)}`, { cls: 'mt6' })}

${U.card('기한이 지나면', U.kv([
    ['고수에게', '「손님이 아직 결제하지 않았습니다」가 전달됩니다'],
    ['독촉', '저희가 대신 연락드립니다 — 고수가 직접 독촉하지 않습니다'],
    ['이용 제한', '14일이 지나면 <b>새 요청을 못 보내십니다</b>. 결제하시면 바로 풀립니다'],
    ['그 뒤에도', '고수에게는 저희가 먼저 정산해 드립니다 — 고수가 손해 보지 않습니다'],
  ]), { cls: 'mt6' })}

${U.card('결제가 어려운 사정이 있으시면', `<p class="t-sub">금액에 이의가 있거나 일이 제대로 안 끝났다면
  <b>결제하지 마시고</b> 문제를 알려 주세요. 저희가 양쪽 말을 듣고 정리해 드립니다.</p>
  <div class="btns mt3">
    ${U.btn('문제 신고', { cls: 'btn-ghost', href: 'MY0204' })}
    ${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'AU-05' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= MY0102 내 요청 목록 > 상태별 탭 ================= */
P['MY0102'] = () => {
  const body = `
${U.pageHd('내 요청', '상태로 나눠 봅니다')}

${U.tabs([
    { label: '견적 대기', cnt: 1 }, { label: '진행 중', cnt: 2 },
    { label: '완료', cnt: 5 }, { label: '취소', cnt: 1 },
  ], 1, { pill: true })}

${U.card('', `<div class="list">
  ${MYREQS.slice(0, 3).map((r) => `<a class="row-item" href="${U.link('MY-02')}">
    <span class="grow"><b>${r.svc}</b>
      <span class="t-sub" style="display:block">${r.no} · ${r.at} · ${r.info}</span></span>
    ${U.stBadge(r.st)}<span class="muted">›</span></a>`).join('')}
</div>`, { cls: 'mt4' })}

${U.card('탭이 비어 있을 때', U.empty('📭', '이 상태의 요청이 없어요',
    '다른 탭을 보시거나 새 요청서를 써 보세요.',
    U.btn('요청서 쓰기', { href: 'RQ-01', cls: 'btn-ghost' })), { cls: 'mt6' })}

${U.card('상태가 뜻하는 것', U.kv([
    ['견적 대기', '요청서를 보냈고 견적을 기다리는 중'],
    ['진행 중', '고수를 골랐고 일이 아직 안 끝남'],
    ['완료', '일이 끝나고 결제까지 마침'],
    ['취소', '요청을 취소했거나 고수 선택을 물림'],
  ]) + `<p class="t-sub mt4">탭을 옮겨도 <b>정렬은 그대로</b> 둡니다 —
    최신순으로 보시다가 탭을 바꿨는데 오래된 순이 되면 헷갈립니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= MY0103 내 요청 목록 > 기간 필터 ================= */
P['MY0103'] = () => {
  const body = `
${U.pageHd('기간으로 걸러 보기', '최근 3개월 · 4건')}

${U.card('', `
  ${U.chips(['최근 1개월', '최근 3개월', '최근 1년', '전체'], 1)}
  <p class="t-th mt6 mb2">직접 정하기</p>
  <div class="row-c">
    <input class="input" style="width:170px" value="2026-05-10" aria-label="시작일"> ~
    <input class="input" style="width:170px" value="2026-08-10" aria-label="종료일">
    ${U.btn('적용', { cls: 'btn-pri', attr: ' data-toast="그 기간으로 걸렀어요"' })}
  </div>
  <div class="box box-pri mt6">
    <div class="row-b wrap-row">
      <div><b>4건 · 결제 합계 <span class="price">886,000원</span></b>
        <p class="t-sub mt1">취소된 1건은 금액에 안 들어갑니다</p></div>
      ${U.btn('초기화', { cls: 'btn-ghost btn-sm', attr: ' data-toast="전체 기간으로 되돌렸어요"' })}
    </div>
  </div>`)}

${U.card('', `<div class="list">
  ${MYREQS.slice(0, 4).map((r) => `<a class="row-item" href="${U.link('MY-02')}">
    <span class="t-sub num nowrap" style="width:96px">${r.at}</span>
    <span class="grow"><b>${r.svc}</b>
      <span class="t-sub" style="display:block">${r.no}</span></span>
    ${U.stBadge(r.st)}<span class="muted">›</span></a>`).join('')}
</div>`, { cls: 'mt6' })}

${U.card('연말정산에 쓰시려면', `<p class="t-sub">현금영수증을 신청하신 건은 국세청에 자동으로 올라갑니다.
  기간을 정해 내려받으시면 한눈에 정리됩니다.</p>
  <div class="btns mt3">
    ${U.btn('이 기간 내역 받기', { cls: 'btn-ghost', attr: ' data-toast="엑셀로 내려받았어요"' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= MY0202 요청 상세 > 일정 변경 요청 ================= */
P['MY0202'] = () => {
  const body = `
${U.pageHd('일정을 바꾸시겠어요?', '지금 확정: 8월 21일 (금) 오전 8시')}

${U.card('원하시는 날짜', `<p class="t-sub mb3">여러 날을 제안하시면 고수가 고르기 쉽습니다.</p>
  ${U.ph(['달력 (8월 · 23·24·25일 선택됨)', 1200, 900])}
  ${U.chips(['8월 23일 (일) ✕', '8월 24일 (월) ✕', '8월 25일 (화) ✕'], [0, 1, 2])}

  <p class="t-th mt6 mb2">시간대</p>
  ${U.chips(['오전', '오후', '저녁', '상관없음'], 0)}

  <p class="t-th mt6 mb2">바꾸시는 이유</p>
  <textarea class="input" rows="3" placeholder="고수가 사정을 알면 맞춰 주기 쉽습니다" aria-label="변경 사유"></textarea>

  <div class="btns mt-block">
    ${U.btn('변경 요청 보내기', { cls: 'btn-pri btn-lg', attr: ' data-toast="변경 요청을 보냈어요. 고수가 확인하면 알려드릴게요"' })}
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'MY-02' })}
  </div>`)}

${U.card('보내고 나면', U.kv([
    ['고수 확인', '보통 <b>몇 시간</b> 안에 답이 옵니다'],
    ['수락하면', '새 일정으로 바뀌고 양쪽에 알림이 갑니다'],
    ['거절하면', '<b>지금 일정이 그대로</b> 남습니다 — 없어지지 않습니다'],
    ['답이 없으면', '<b>48시간</b> 뒤 저희가 한 번 더 알립니다'],
  ]), { cls: 'mt6' })}

${U.card('변경 이력', U.timeline([
    ['처음 확정', '8월 21일 (금) 오전 8시 — 8월 7일 확정'],
    ['변경 요청', '8월 23·24·25일 제안 — 지금'],
    ['고수 답변', '기다리는 중'],
  ], 1), { cls: 'mt6' })}

${U.banner('warn', '⚠', `<b>일정이 하루 앞이면 수수료가 붙을 수 있습니다.</b>
  <p class="t-sub mt1">고수가 이미 차량과 인력을 잡아 두었을 수 있습니다.
  전날·당일 변경은 <b>취소로 처리</b>될 수 있으니 취소 규정을 함께 봐 주세요.</p>`)}`;

  return { body, o: { my: true } };
};

/* ================= MY0203 요청 상세 > 취소·환불 요청 ================= */
P['MY0203'] = () => {
  const body = `
${U.pageHd('취소하시겠어요?', '8월 21일 예정 · 오늘부터 11일 전')}

${U.banner('ok', '💸', `<b>지금 취소하시면 <b>전액</b> 돌려받으십니다.</b>
  <p class="t-sub mt1">이 고수는 <b>3일 전까지</b> 무료 취소입니다. 아직 11일 남았습니다.</p>`)}

${U.card('시점별 환불', U.table(['언제', '돌려받는 비율', '지금이면'], [
    ['<b>3일 전까지</b>', '<b class="success">100%</b>', U.badge('여기', 'b-ok')],
    ['2일 전', '80%', ''],
    ['전날', '50%', ''],
    ['당일', '<b class="danger">0%</b>', ''],
  ]), { cls: 'mt6' })}

${U.card('취소 사유', `
  ${['일이 없어졌어요', '일정이 안 맞아요', '다른 곳에서 하기로 했어요', '금액이 부담돼요', '고수와 연락이 안 돼요']
    .map((r) => `<label class="chk mb2"><input type="radio" name="cx"> ${r}</label>`).join('')}
  <textarea class="input mt3" rows="2" placeholder="더 하실 말씀 (선택)" aria-label="상세 사유"></textarea>`,
    { cls: 'mt6' })}

${U.card('돌려받으실 금액', `${U.sumRows([
    ['결제 금액', '아직 결제 전'],
    ['취소 수수료', '0원'],
  ], ['돌려받을 금액', '해당 없음'])}
  <p class="t-sub mt3">이 요청은 <b>아직 결제 전</b>이라 돌려받을 돈이 없습니다.
    결제 후 취소하시면 위 표대로 계산해 <b>3~5영업일</b> 안에 돌려드립니다.</p>
  <div class="btns mt-block">
    ${U.btn('취소 요청', { cls: 'btn-danger btn-lg', attr: ' data-toast="취소를 요청했어요"' })}
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'MY-02' })}
  </div>`, { cls: 'mt6' })}

${U.card('고수 동의가 필요한가요', `<p class="t-sub"><b>필요 없습니다.</b> 손님은 언제든 취소하실 수 있고,
  위 표대로 수수료만 계산됩니다. 다만 고수가 이미 출발했다면 <b>실비</b>가 더 붙을 수 있습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= MY0204 요청 상세 > 문제 신고 ================= */
P['MY0204'] = () => {
  const body = `
${U.pageHd('문제가 있으셨나요', '돈이 나가기 전에 알려 주세요')}

${U.banner('info', '🛡', `<b>결제 전이면 돈이 저희에게 있습니다.</b>
  <p class="t-sub mt1">신고하시면 <b>결제를 멈추고</b> 양쪽 말을 듣습니다.
  이미 결제하셨어도 <b>7일</b> 안이면 되돌릴 수 있습니다.</p>`)}

${U.card('무엇이 문제였나요', `
  ${[
    ['오지 않았습니다', '약속한 시간에 나타나지 않았습니다'],
    ['일이 제대로 안 됐습니다', '말한 것과 다르거나 마무리가 안 됐습니다'],
    ['추가 요금을 요구했습니다', '일을 시작한 뒤에 값을 올려 불렀습니다'],
    ['불친절했습니다', '무례하거나 불쾌한 언행이 있었습니다'],
    ['물건이 망가졌습니다', '작업 중에 파손이 생겼습니다'],
  ].map(([나, 설명]) => `<label class="chk mb3">
    <input type="radio" name="pb"> <span><b>${나}</b>
      <span class="t-sub" style="display:block">${설명}</span></span></label>`).join('')}

  <p class="t-th mt6 mb2">자세히</p>
  <textarea class="input" rows="4" placeholder="언제 어떤 일이 있었는지 적어 주세요" aria-label="문제 내용"></textarea>

  <p class="t-th mt6 mb2">증빙 사진</p>
  <label class="drop" style="min-height:120px;cursor:pointer">
    <span style="font-size:24px">📷</span>
    <b class="mt2">사진을 붙여 주세요</b>
    <span class="t-sub mt1">파손·미완료 상태가 찍힌 사진이 가장 도움이 됩니다</span>
    <input type="file" hidden multiple data-toast="사진을 붙였어요"></label>`)}

${U.card('어떻게 해결되기를 바라시나요', `
  ${['전액 환불', '일부 환불', '다시 해 주기', '사과와 재발 방지', '아직 모르겠습니다']
    .map((r) => `<label class="chk mb2"><input type="radio" name="want"> ${r}</label>`).join('')}
  <div class="btns mt-block">
    ${U.btn('신고 접수', { cls: 'btn-danger btn-lg', attr: ' data-toast="접수했어요. 결제를 멈추고 확인하겠습니다"' })}
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'MY-02' })}
  </div>`, { cls: 'mt6' })}

${U.card('중재는 이렇게 돕니다', U.timeline([
    ['접수', '결제를 멈추고 고수에게 알립니다'],
    ['양쪽 말 듣기', '고수에게 <b>2영업일</b> 안에 답하도록 합니다'],
    ['판단', '대화 기록·사진·규정을 보고 결정합니다'],
    ['처리', '환불하거나 지급합니다 — 평균 <b>2~4영업일</b>'],
  ], 0), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= MY0302 내 요청 비어 있음 > 첫 이용 쿠폰 ================= */
P['MY0302'] = () => {
  const body = `
${U.pageHd('첫 이용 쿠폰을 드렸습니다', '20% 할인 · 최대 5만원')}

${U.card('', U.empty('🎁', '아직 맡기신 일이 없어요',
    '가입 축하 쿠폰이 쿠폰함에 들어 있습니다. 첫 요청에 바로 쓰실 수 있어요.',
    `${U.btn('요청서 쓰기', { href: 'RQ-01', cls: 'btn-pri btn-lg' })}
     ${U.btn('쿠폰함 보기', { href: 'AU-01', cls: 'btn-ghost btn-lg' })}`))}

${U.card('쿠폰 조건', U.kv([
    ['할인', '<b>20%</b> · 최대 50,000원'],
    ['쓸 수 있는 곳', '<b>모든 분야</b> — 이사·청소·수리·과외 전부'],
    ['최소 금액', '<b>5만원</b> 이상 결제할 때'],
    ['유효기간', '<b>2026-09-09 까지</b> (30일 남음)'],
    ['다른 할인과', '포인트와는 <b>함께</b> 쓰실 수 있습니다. 다른 쿠폰과는 안 됩니다'],
  ]), { cls: 'mt6' })}

${U.sec('이런 것을 많이 맡기십니다', `<div class="cats">
  ${['이사·운송', '청소', '설치·수리', '과외·레슨', '사진·영상', '인테리어'].map((n, i) =>
    `<a class="cat" href="${U.link('RQ-01')}">
      <div class="ic">${['🚚', '🧹', '🔧', '📚', '📷', '🛋'][i]}</div>
      <div class="nm">${n}</div></a>`).join('')}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= RV0102 후기 작성 > 항목별 별점 ================= */
P['RV0102'] = () => {
  const 항목 = [['친절', 5], ['시간 약속', 5], ['마무리', 4], ['가격', 4]];
  const 평균 = (항목.reduce((a, [, n]) => a + n, 0) / 항목.length).toFixed(1);

  const body = `
${U.pageHd('어떠셨나요?', `${고수.nm} · 원룸·소형 이사`)}

${U.card('', `${항목.map(([나, 점]) => `<div class="row-b mb4">
    <b style="width:96px">${나}</b>
    <div class="grow">${U.rateIn ? U.rateIn(나, 점) : U.stars(점)}</div>
  </div>`).join('')}

  <div class="box box-pri mt6">
    <div class="row-b">
      <b>전체 만족도</b>
      <div class="row-c"><b class="big">${평균}</b>${U.stars(Number(평균))}</div>
    </div>
    <p class="t-sub mt2">네 항목의 <b>평균</b>입니다 — 따로 매기지 않으셔도 됩니다.</p>
  </div>`)}

${U.card('낮게 주신 항목이 있습니다', `<p class="t-sub mb3">「마무리」와 「가격」에 4점을 주셨습니다.
  무엇이 아쉬우셨는지 골라 주시면 고수에게 도움이 됩니다.</p>
  ${U.chips(['정리가 덜 됐어요', '시간이 더 걸렸어요', '값이 생각보다 비쌌어요', '추가 요금이 있었어요', '괜찮았어요'], -1)}
  <div class="btns mt-block">
    ${U.btn('다음 (사진 붙이기)', { cls: 'btn-pri btn-lg', href: 'RV0103' })}
    ${U.btn('처음부터 다시', { cls: 'btn-ghost btn-lg', attr: ' data-toast="별점을 모두 지웠어요"' })}
  </div>`, { cls: 'mt6' })}

${U.card('별점이 어떻게 쓰이나', U.kv([
    ['고수 프로필', '항목별 평균이 <b>그대로 보입니다</b>'],
    ['목록 정렬', '전체 만족도로 줄을 세웁니다'],
    ['고수에게', '누가 몇 점을 줬는지 <b>알려주지 않습니다</b> — 항목별 평균만 보입니다'],
    ['고칠 수 있나', '<b>30일</b> 안에는 고치실 수 있습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= RV0103 후기 작성 > 사진 첨부 ================= */
P['RV0103'] = () => {
  const body = `
${U.pageHd('사진을 붙여 주세요', '건너뛰셔도 됩니다')}

${U.banner('ok', '📸', `<b>사진 후기에는 <b>500 P</b>를 더 드립니다.</b>
  <p class="t-sub mt1">글만 쓰시면 300 P, 사진을 붙이시면 800 P 입니다.
  다음 이용 때 현금처럼 쓰실 수 있습니다.</p>`)}

${U.card('', `<div class="g4 mb4">
    ${[1, 2, 3].map((i) => `<div class="thumb-del">${U.phWork('rv' + i)}
      <span class="ord">${i}</span>
      <button class="del" type="button" data-toast="사진을 뺐어요" aria-label="삭제">✕</button></div>`).join('')}
    <label class="drop" style="min-height:0;aspect-ratio:1/1;cursor:pointer">
      <span style="font-size:24px">＋</span>
      <span class="t-sub">3 / 5</span>
      <input type="file" hidden multiple data-toast="사진을 골랐어요"></label>
  </div>
  <p class="t-sub">숫자를 끌어 옮기면 <b>순서가 바뀝니다.</b> 첫 장이 대표 사진이 됩니다.</p>

  <div class="btns mt-block">
    ${U.btn('다음 (비공개 의견)', { cls: 'btn-pri btn-lg', href: 'RV0104' })}
    ${U.btn('사진 없이 넘어가기', { cls: 'btn-ghost btn-lg', href: 'RV0104' })}
  </div>`, { cls: 'mt6' })}

${U.banner('warn', '🙈', `<b>얼굴과 개인정보가 찍히지 않았는지 봐 주세요.</b>
  <p class="t-sub mt1">후기 사진은 <b>누구나 볼 수 있습니다.</b>
  집 주소가 적힌 택배 상자, 우편물, 가족 사진이 함께 찍히는 일이 잦습니다.
  올린 뒤에도 지우실 수 있지만, 그 사이 누군가 봤을 수 있습니다.</p>`)}`;

  return { body, o: { my: true } };
};

/* ================= RV0104 후기 작성 > 비공개 피드백 ================= */
P['RV0104'] = () => {
  const body = `
${U.pageHd('고수에게만 하실 말씀', '공개 후기와 따로 갑니다')}

${U.card('', `<p class="t-sub mb4">공개 후기에 적기는 어려운 이야기를 여기에 적어 주세요.
  <b>고수 본인만</b> 봅니다 — 다른 손님에게는 보이지 않습니다.</p>
  <textarea class="input" rows="5" placeholder="예) 통화가 잘 안 되는 편이라 조금 답답했습니다" aria-label="비공개 의견"></textarea>

  <div class="btns mt-block">
    ${U.btn('후기 올리기', { cls: 'btn-pri btn-lg', attr: ' data-toast="후기를 올렸어요. 800 P를 드렸습니다"' })}
    ${U.btn('건너뛰고 올리기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="후기를 올렸어요"' })}
  </div>`)}

${U.card('누가 보나요', U.table(['', '공개 후기', '비공개 의견'], [
    ['다른 손님', '<b>봅니다</b>', '<b class="danger">못 봅니다</b>'],
    ['이 고수', '봅니다', '<b>봅니다</b>'],
    ['플랫폼(저희)', '봅니다', '<b>봅니다</b>'],
    ['고수의 답글', '달 수 있습니다', '<b>달 수 없습니다</b>'],
  ]) + `<p class="t-sub mt4">저희도 함께 보는 까닭은, 심한 문제가 적혀 있으면
    <b>저희가 확인해야</b> 하기 때문입니다. 그냥 지나치지 않습니다.</p>`, { cls: 'mt6' })}

${U.card('이런 것을 적어 주시면 좋습니다', U.kv([
    ['고치면 좋을 점', '공개로 적기엔 사소하지만 고수에게는 도움이 되는 것'],
    ['개인적인 사정', '「우리 집이 특이해서 어려우셨을 것 같다」 같은 맥락'],
    ['칭찬', '공개 후기에 다 못 적은 것'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= RV0202 내 후기 목록 > 후기 수정·삭제 ================= */
P['RV0202'] = () => {
  const body = `
${U.pageHd('후기 고치기', '2026-07-04 에 쓰신 후기')}

${U.banner('info', '✏', `<b>쓰신 지 <b>37일</b> 지났습니다 — 고칠 수 있는 기간이 지났습니다.</b>
  <p class="t-sub mt1">후기는 <b>30일</b> 안에만 고치거나 지우실 수 있습니다.
  시간이 지난 뒤에 바뀌면 다른 손님이 믿기 어렵기 때문입니다.</p>`)}

${U.card('쓰신 후기', `${U.kv([
    ['서비스', '프로필 촬영 · 스튜디오 온'],
    ['별점', `${U.stars(5)} 5.0`],
    ['쓴 날', '2026-07-04'],
    ['고친 이력', '없음'],
  ])}
  <div class="box mt4"><p>${REVIEWS[0].t}</p></div>`, { cls: 'mt6' })}

${U.card('30일 안이라면 이렇게 됩니다', U.table(['', '고치면', '지우면'], [
    ['공개 여부', '바뀐 내용이 바로 보입니다', '<b>사라집니다</b>'],
    ['표시', '「고침」이 붙습니다', '—'],
    ['받은 포인트', '그대로', '<b class="danger">회수됩니다</b> (800 P)'],
    ['고수 평점', '다시 계산됩니다', '다시 계산됩니다'],
    ['고수 답글', '남습니다', '함께 사라집니다'],
  ]) + `<p class="t-sub mt4">「고침」 표시를 붙이는 까닭은,
    좋게 썼다가 나중에 바꾸는 일이 있어서입니다. 읽는 쪽이 알 수 있어야 합니다.</p>`,
    { cls: 'mt6' })}

${U.card('그래도 지우고 싶으시면', `<p class="t-sub">사실과 다르거나 개인정보가 들어간 것이라면
  기간과 상관없이 지워 드립니다. 알려 주세요.</p>
  <div class="btns mt3">${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'AU-05' })}</div>`,
    { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= RV0203 내 후기 목록 > 고수 답글 ================= */
P['RV0203'] = () => {
  const body = `
${U.pageHd('고수가 답글을 달았습니다', '2건이 새로 왔습니다')}

${U.card('', `<div class="row-b wrap-row mb4">
    ${U.tabs(['답글 온 순', '최신순'], 0, { pill: true })}
    <span class="t-sub">답글 있는 후기 <b>4</b> / 7</span>
  </div>
  ${REVIEWS.slice(0, 2).map((r, i) => `<div class="review-block mb4">
    ${U.review(r, { pro: false })}
    <div class="box box-pri mt3">
      <div class="row-b">
        <b class="acc">${['한결이사', '스튜디오 온'][i]} 답글</b>
        ${i === 0 ? U.badge('NEW', 'b-pri') : ''}
      </div>
      <p class="t-sub mt2">${[
        '좋게 봐 주셔서 고맙습니다. 다음에도 편하게 불러 주세요.',
        '사진이 마음에 드셨다니 다행입니다. 보정본 추가로 필요하시면 언제든 말씀해 주세요.',
      ][i]}</p>
      <div class="btns mt3">
        ${U.btn('부적절한 답글 신고', { cls: 'btn-ghost btn-sm', attr: ' data-toast="신고를 접수했어요"' })}
      </div>
    </div>
  </div>`).join('')}`)}

${U.card('답글에 다시 답할 수는 없습니다', `<p class="t-sub">후기 → 답글로 <b>한 번씩만</b> 주고받습니다.
  말싸움이 이어지면 읽는 사람에게 도움이 안 되기 때문입니다.</p>
  ${U.kv([
    ['더 하실 말씀이 있으면', '채팅으로 직접 하시거나, 후기를 고치실 수 있습니다(30일 안)'],
    ['답글이 부적절하면', '신고해 주세요 — 확인 후 지웁니다'],
    ['답글 알림', '달리면 알려드립니다. 설정에서 끄실 수 있습니다'],
  ])}`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};
