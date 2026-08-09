/* MY 내 정보·수강 이력·정산 — 3뎁스 하위 화면 9장
 *
 * 계정과 돈을 다루는 화면이다. 되돌릴 수 없는 것(탈퇴)과 법이 걸린 것(환불·세금계산서)이
 * 함께 있어, 「무엇이 사라지는지」와 「왜 안 되는지」를 화면에 그대로 적어 둔다.
 */
import * as U from './ui.mjs';
import { byId } from './data.mjs';

const P = {};
export default P;

const C = byId('C01');

/* ================= MY0102 내 정보 > 비밀번호 변경 ================= */
P['MY0102'] = () => {
  const 규칙 = [
    ['8자 이상', true], ['영문 대소문자 섞기', true],
    ['숫자 넣기', true], ['특수문자 넣기', false],
    ['아이디와 다르게', true],
  ];

  const body = `
${U.pageHd('비밀번호 바꾸기', '바꾸면 다른 기기에서는 다시 로그인하셔야 합니다')}

${U.card('', `
  <div class="mb4">
    <label class="t-th">지금 비밀번호</label>
    <input class="input mt2" type="password" value="••••••••••" aria-label="현재 비밀번호">
    <p class="t-sub mt2">5번 틀리면 <b>10분</b> 동안 잠깁니다. 지금 <b>0/5</b>회입니다.</p>
  </div>

  <div class="mb4">
    <label class="t-th">새 비밀번호</label>
    <input class="input mt2" type="password" value="••••••••••••" aria-label="새 비밀번호">
    <div class="mt3">${U.barRow(75, { cls: 'bar-ok' })}<span class="t-sub">강함</span></div>
    <div class="mt3">
      ${규칙.map(([나, ok]) => `<div class="row-c mb1" style="gap:var(--s2)">
        <span class="${ok ? 'success' : 'muted'}">${ok ? '✓' : '○'}</span>
        <span class="t-sub${ok ? '' : ''}">${나}${!ok ? ' (선택)' : ''}</span></div>`).join('')}
    </div>
  </div>

  <div class="mb4">
    <label class="t-th">새 비밀번호 다시</label>
    <input class="input mt2" type="password" value="••••••••••••" aria-label="새 비밀번호 확인">
    <p class="t-sub mt2 success">✓ 두 개가 같습니다</p>
  </div>

  <div class="btns mt7">
    ${U.btnSay('바꾸기', '비밀번호를 바꿨어요. 다른 기기에서는 다시 로그인해 주세요', { cls: 'btn-primary btn-lg' })}
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'MY-01' })}
  </div>`)}

${U.card('바꾸고 나면', U.kv([
    ['이 기기', '로그인이 유지됩니다'],
    ['다른 기기', '<b>모두 로그아웃</b>됩니다 — 누가 몰래 쓰고 있었다면 그때 끊깁니다'],
    ['알림', '등록하신 이메일로 「비밀번호가 바뀌었습니다」가 갑니다'],
    ['다음 변경', '한 번 바꾸면 <b>24시간</b> 뒤에 다시 바꾸실 수 있습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= MY0103 내 정보 > 강사 전환 신청 ================= */
P['MY0103'] = () => {
  const body = `
${U.pageHd('강사로 활동하기', '심사는 보통 3~5영업일 걸립니다')}

${U.card('', `${U.kv([
    ['활동명', `<input class="input" value="김수현" aria-label="활동명"> <span class="t-sub">강의에 이 이름으로 나옵니다</span>`],
    ['전문 분야', U.fchips('teach', 'cat', ['데이터', '개발', '디자인', '기획', '마케팅', '어학'], { multi: true, on: '데이터' })],
    ['경력 소개', `<textarea class="input" rows="4" placeholder="어디서 무엇을 하셨는지 적어 주세요" aria-label="경력"></textarea>`],
    ['개설 예정 강의', `<input class="input" placeholder="예) 실무자를 위한 SQL 입문" aria-label="개설 예정 강의">`],
  ])}`)}

${U.card('증빙 자료', `<div class="drop-zone" style="min-height:140px">
    <div style="font-size:28px">📎</div>
    <b class="mt2">경력·자격 증빙을 올려 주세요</b>
    <p class="t-sub mt1">재직증명서 · 자격증 · 포트폴리오 — PDF · JPG · PNG · 10MB 이하</p>
  </div>
  <p class="t-sub mt3">증빙은 <b>심사에만 씁니다.</b> 손님에게 보이지 않고, 심사가 끝나면 지웁니다.</p>`,
    { cls: 'mt6' })}

${U.card('정산 계좌', `<p class="t-sub mb4">지금 등록하지 않으셔도 됩니다.
  <b>첫 매출이 생기기 전까지</b> 등록하시면 됩니다.</p>
  ${U.kv([
    ['필요한 것', '예금주 이름이 <b>회원 이름과 같아야</b> 합니다'],
    ['사업자', '있으시면 세금계산서를 끊으실 수 있어 원천징수(3.3%)가 없습니다'],
  ])}
  <div class="btns mt4">${U.btn('나중에 등록', { cls: 'btn-ghost', href: 'MY0302' })}</div>`, { cls: 'mt6' })}

${U.card('', `<label class="row-c" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-gate="teach" data-label="강사 약관 동의">
    <b>강사 이용약관에 동의합니다</b> <span class="t-sub">(필수)</span></label>
  <div class="err-msg mt3" data-gatemsg="teach" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-primary btn-lg is-off" type="button" data-gated="teach"
      data-toast="신청했어요. 3~5영업일 안에 결과를 알려드릴게요">신청하기</button>
    ${U.btnSay('임시 저장', '지금까지 쓰신 것을 저장했어요', { cls: 'btn-ghost btn-lg' })}
  </div>
  <p class="t-sub mt3">심사 중에도 <b>수강생으로는 그대로</b> 이용하실 수 있습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= MY0104 내 정보 > 회원 탈퇴 확인 ================= */
P['MY0104'] = () => {
  const body = `
${U.pageHd('정말 탈퇴하시겠어요?', '되돌릴 수 없습니다')}

${U.banner('danger', '⚠', `<b>지금 탈퇴하시면 잃는 것이 있습니다.</b>
  <p class="t-sub mt1">아래를 먼저 확인해 주세요. 탈퇴 뒤에는 저희도 되살릴 수 없습니다.</p>`)}

${U.card('지금 가지고 계신 것', `${U.table(['', '', '탈퇴하면'], [
    ['수강 중인 강의', '<b>3개</b> (남은 기간 125일)', '<b class="danger">못 봅니다 · 환불 안 됩니다</b>'],
    ['쿠폰', '<b>2장</b> (23,000원어치)', '<b class="danger">사라집니다</b>'],
    ['수료증', '<b>1장</b>', '<b class="danger">확인 페이지가 닫힙니다</b>'],
    ['내가 쓴 노트', '<b>42개</b>', '<b class="danger">지워집니다</b>'],
    ['후기·질문', '<b>7건</b>', '익명으로 남습니다'],
  ])}
  <div class="box box-danger mt4"><b>수강 중인 강의가 있습니다</b>
    <p class="t-sub mt1">환불받으실 수 있는 강의가 <b>1개</b> 있습니다(진도 8%).
    탈퇴 전에 환불을 먼저 신청하시면 <b>63,200원</b>을 돌려받으실 수 있습니다.</p>
    <div class="btns mt3">${U.btn('환불 먼저 신청', { cls: 'btn-primary btn-sm', href: 'MY0202' })}</div></div>`)}

${U.card('탈퇴하시는 이유', `
  ${['쓸 일이 없어서', '강의가 마음에 안 들어서', '값이 비싸서', '다른 곳을 쓰게 되어서', '개인정보가 걱정돼서']
    .map((r) => `<label class="row-c mb2" style="gap:var(--s2);cursor:pointer">
      <input type="radio" name="why"> ${r}</label>`).join('')}
  <textarea class="input mt3" rows="2" placeholder="더 하실 말씀이 있으면 적어 주세요 (선택)" aria-label="탈퇴 사유"></textarea>`,
    { cls: 'mt6' })}

${U.card('', `<p class="t-th mb2">확인을 위해 <b>탈퇴합니다</b> 를 그대로 적어 주세요</p>
  <input class="input" placeholder="탈퇴합니다" data-gate="quit" data-label="확인 문구" aria-label="확인 문구">
  <div class="err-msg mt3" data-gatemsg="quit" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-danger btn-lg is-off" type="button" data-gated="quit"
      data-toast="탈퇴 처리는 서버가 연결되면 실제로 진행됩니다">탈퇴하기</button>
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'MY-01' })}
  </div>
  <p class="t-sub mt3">개인정보는 <b>즉시</b> 지웁니다. 다만 전자상거래법에 따라
    <b>결제·환불 기록은 5년</b> 동안 따로 보관합니다 — 법이 정한 것이라 지울 수 없습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= MY0202 수강 이력 > 환불 신청 ================= */
P['MY0202'] = () => {
  const 진도 = 8, 결제 = 79000;
  const 환불 = Math.round(결제 * (1 - 진도 / 100));

  const body = `
${U.pageHd('환불 신청', C.name)}

${U.banner('info', '✅', `<b>환불하실 수 있습니다.</b>
  <p class="t-sub mt1">결제한 지 4일 됐고 진도가 8%입니다 — <b>7일 이내 · 10% 미만</b>이라 전액 대상입니다.</p>`)}

${U.card('얼마를 돌려받나', `${U.sumRows([
    ['결제 금액', U.won(결제)],
    ['진도 차감 (8%)', `−${U.won(결제 - 환불)}`],
  ], ['예상 환불액', U.won(환불)])}
  <div class="box mt4"><b>이 강의는 진도가 10% 미만이라 전액 대상입니다</b>
    <p class="t-sub mt1">다만 규정상 <b>본 만큼은 뺍니다.</b> 8%를 보셨으니 6,320원이 빠집니다.
    한 차시도 안 보셨다면 79,000원 전액입니다.</p></div>`)}

${U.card('환불 기준', `${U.table(['언제 · 얼마나 봤나', '얼마를 돌려받나'], [
    ['7일 이내 · 한 차시도 안 봄', '<b>전액</b>'],
    ['<b>7일 이내 · 10% 미만 (지금)</b>', '<b class="pri">본 만큼 빼고 돌려드립니다</b>'],
    ['7일 이후 · 50% 미만', '남은 기간에 비례해 돌려드립니다'],
    ['50% 이상', '돌려드리지 않습니다'],
  ])}`, { cls: 'mt6' })}

${U.card('환불 사유', `
  ${['생각한 내용과 달라서', '난이도가 안 맞아서', '시간이 없어서', '영상·음질 문제', '실수로 결제']
    .map((r) => `<label class="row-c mb2" style="gap:var(--s2);cursor:pointer">
      <input type="radio" name="rf"> ${r}</label>`).join('')}
  <textarea class="input mt3" rows="3" placeholder="자세히 적어 주시면 강사에게 전달합니다 (선택)" aria-label="상세 사유"></textarea>`,
    { cls: 'mt6' })}

${U.card('', `${U.kv([
    ['환불 수단', '<b>신한카드 1234</b> — 결제하신 수단으로만 돌려드립니다'],
    ['처리 기간', '승인 후 <b>3~5영업일</b>'],
    ['환불 뒤', '이 강의를 못 보게 됩니다. 노트도 함께 지워집니다'],
  ])}
  <div class="btns mt7">
    ${U.btnSay('환불 신청', '신청했어요. 하루 안에 검토 결과를 알려드릴게요', { cls: 'btn-primary btn-lg' })}
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'MY-02' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= MY0203 수강 이력 > 환불 불가 상태 ================= */
P['MY0203'] = () => {
  const body = `
${U.pageHd('환불하실 수 없는 강의입니다', '왜 그런지 규정과 함께 알려드립니다')}

${U.card('', U.result('danger', '🚫', '진도가 50%를 넘었습니다',
    '이 강의는 <b>62%</b>까지 들으셨습니다. 약관 제7조③에 따라 진도 50% 이상은 환불 대상이 아닙니다.',
    U.btn('약관 전문 보기', { cls: 'btn-ghost btn-lg', href: 'MY-04' })))}

${U.card('지금 상태', `${U.kv([
    ['강의', C.name],
    ['결제일', '2026-06-12 (58일 전)'],
    ['진도', '<b class="danger">62%</b> · 30차시 중 18차시'],
    ['환불 기준', '50% 미만'],
  ])}`, { cls: 'mt6' })}

${U.card('불가 사유는 셋입니다', `${U.table(
    [{ t: '사유', w: '26%' }, '기준', '부분 환불'],
    [
      ['<b>진도 초과 (지금)</b>', '50% 이상 들으심', '<b class="danger">안 됩니다</b>'],
      ['<b>기간 경과</b>', '수강 기간이 끝남', '<b class="danger">안 됩니다</b>'],
      ['<b>이벤트 무료 수강</b>', '돈을 안 내신 강의', '해당 없음'],
    ],
  )}
  <p class="t-sub mt4">진도가 50%를 넘으면 <b>부분 환불도 안 됩니다.</b>
    절반 넘게 보신 것은 강의를 다 쓰신 것으로 봅니다.</p>`, { cls: 'mt6' })}

${U.card('그래도 사정이 있으시면', `<p class="t-sub">영상이 오랫동안 안 열렸거나, 강사가 강의를 내렸거나,
  결제가 잘못된 경우는 <b>규정과 상관없이</b> 처리해 드립니다.</p>
  <div class="btns mt4">
    ${U.btn('고객센터 문의', { cls: 'btn-primary', href: 'MY-04' })}
    ${U.btn('수강 이력으로', { cls: 'btn-ghost', href: 'MY-02' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= MY0204 수강 이력 > 기간 필터 ================= */
P['MY0204'] = () => {
  const 이력 = [
    ['2026-06-12', C.name, 79000, '수강 중'],
    ['2026-05-02', '파이썬 업무 자동화 30일 완성', 99000, '수료'],
    ['2026-03-18', '피그마로 만드는 첫 UI 디자인', 69000, '수료'],
    ['2026-02-02', '기획자를 위한 SQL 첫걸음', 0, '만료'],
  ];
  const 합 = 이력.reduce((a, [, , 값]) => a + 값, 0);

  const body = `
${U.pageHd('수강 이력', '최근 1년 · 4건')}

${U.card('', `<div class="row-b wrap-row mb4" style="gap:var(--s4)">
    ${U.tabs(['최근 3개월', '최근 1년', '전체'], 1, { pill: true })}
    ${U.fchips('my-hist', 'cert', [['*', '전체'], ['done', '수료 2'], ['ing', '수강 중 1']])}
  </div>
  <div class="box box-pri">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <div><b>4건 · 결제 합계 <span class="pri">${U.won(합)}</span></b>
        <p class="t-sub mt1">무료 강의 1건은 금액에 안 들어갑니다</p></div>
      ${U.btnSay('초기화', '전체 기간으로 되돌렸어요', { cls: 'btn-ghost btn-sm' })}
    </div>
  </div>`)}

${U.card('', `<div class="card"><div class="card-bd flush">
  ${이력.map(([날, 이름, 값, 상태]) => `<a class="lrow" href="${U.link('MY-02')}">
    <span class="t-sub num" style="width:96px">${날}</span>
    <span class="grow"><b>${이름}</b></span>
    ${U.badge(상태, 상태 === '수료' ? 'b-ok' : 상태 === '만료' ? 'b-mut' : 'b-pri')}
    <span class="nowrap num" style="width:84px;text-align:right">${값 ? U.won(값) : '무료'}</span>
    <span class="muted">›</span></a>`).join('')}
</div></div>`, { cls: 'mt6' })}

${U.card('연말정산에 쓰시려면', `<p class="t-sub">교육비는 조건에 따라 공제 대상이 될 수 있습니다.
  현금영수증을 신청하신 건은 국세청에 자동으로 올라갑니다.</p>
  <div class="btns mt4">
    ${U.btnSay('연도별 내역 받기', '2026년 결제 내역을 엑셀로 내려받았어요', { cls: 'btn-ghost' })}
    ${U.btn('영수증 보기', { cls: 'btn-ghost', href: 'CO0502' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= MY0302 정산 내역 > 정산 계좌 관리 ================= */
P['MY0302'] = () => {
  const body = `
${U.pageHd('정산 계좌', '예금주가 회원 이름과 같아야 합니다')}

${U.card('', `${U.kv([
    ['예금주', `<input class="input" value="김수현" aria-label="예금주"> <span class="t-sub">회원 이름과 같아야 합니다</span>`],
    ['은행', `<select class="input" style="width:auto"><option>국민은행</option><option>신한은행</option><option>카카오뱅크</option></select>`],
    ['계좌번호', `<input class="input" placeholder="- 없이 숫자만" aria-label="계좌번호">`],
  ])}
  <div class="btns mt6">
    ${U.btnSay('1원 보내기', '1원을 보냈어요. 입금자명 뒤 4자리를 넣어 주세요', { cls: 'btn-primary' })}
  </div>
  <div class="box mt4"><b>1원 인증이 왜 필요한가</b>
    <p class="t-sub mt1">계좌번호를 잘못 넣으면 정산금이 <b>남의 통장으로 들어갑니다.</b>
    한 번 나간 돈은 저희가 되돌릴 수 없어서, 1원을 먼저 보내 확인합니다.
    입금자명 뒤 네 자리를 넣어 주시면 끝납니다.</p></div>`)}

${U.card('사업자 정보 (선택)', `<p class="t-sub mb4">사업자로 등록하시면 <b>원천징수 3.3%가 없습니다.</b>
  대신 세금계산서를 끊으셔야 합니다.</p>
  ${U.kv([
    ['사업자등록번호', `<input class="input" placeholder="000-00-00000" aria-label="사업자등록번호">`],
    ['상호', `<input class="input" aria-label="상호">`],
    ['증빙', `<label class="btn btn-ghost btn-sm" style="cursor:pointer">사업자등록증 올리기<input type="file" hidden data-toast="사업자등록증을 올렸어요"></label>`],
  ])}`, { cls: 'mt6' })}

${U.card('바꾸시면 언제부터 적용되나', U.kv([
    ['이번 달 정산', '<b>이미 확정됐다면 기존 계좌</b>로 나갑니다'],
    ['다음 달부터', '새 계좌로 나갑니다'],
    ['확정 전이면', '이번 달부터 바로 새 계좌로 나갑니다'],
    ['바꿀 때마다', '1원 인증을 다시 하셔야 합니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= MY0303 정산 내역 > 세금계산서 발행 ================= */
P['MY0303'] = () => {
  const 이력 = [
    ['2026년 7월', 1284000, '발행 완료', '2026-08-05', true],
    ['2026년 6월', 968000, '발행 완료', '2026-07-04', true],
    ['2026년 5월', 742000, '발행 완료', '2026-06-05', true],
  ];

  const body = `
${U.pageHd('세금계산서', '사업자로 등록하신 분만 쓰십니다')}

${U.card('발행하기', `${U.kv([
    ['대상 월', `<select class="input" style="width:auto" data-toast="대상 월을 바꿨어요">
      <option>2026년 8월 (정산 예정 1,412,000원)</option><option>2026년 7월</option></select>`],
    ['공급가액', '<b>1,283,636원</b>'],
    ['부가세', '<b>128,364원</b>'],
    ['합계', '<b class="t-card">1,412,000원</b>'],
  ])}
  <div class="box mt4"><b>8월 정산은 아직 확정 전입니다</b>
    <p class="t-sub mt1">환불이 들어오면 금액이 바뀝니다. <b>매월 5일 확정</b> 뒤에 발행하시는 편이 안전합니다 —
    미리 끊으면 수정세금계산서를 다시 발행하셔야 합니다.</p></div>`)}

${U.card('사업자 정보', `${U.kv([
    ['상호', '수현데이터'],
    ['사업자등록번호', '<b class="num">608-79-25359</b>'],
    ['업태·종목', '서비스 · 교육서비스업'],
    ['이메일', 'kim****@gmail.com'],
  ])}
  <div class="btns mt4">
    ${U.btn('정보 고치기', { cls: 'btn-ghost', href: 'MY0302' })}
    ${U.btnSay('발행하기', '세금계산서를 발행하고 이메일로 보냈어요', { cls: 'btn-primary' })}
  </div>`, { cls: 'mt6' })}

${U.card('발행 이력', `<div class="card"><div class="card-bd flush">
  ${이력.map(([달, 금액, 상태, 날, ok]) => `<div class="lrow">
    <span class="grow"><b>${달}</b>
      <span class="t-sub" style="display:block">${날} · ${U.won(금액)}</span></span>
    ${U.badge(상태, ok ? 'b-ok' : 'b-mut')}
    ${U.btnSay('다시 보내기', `${달} 세금계산서를 이메일로 다시 보냈어요`, { cls: 'btn-ghost btn-sm' })}
  </div>`).join('')}
</div></div>
<p class="t-sub mt3">국세청 전송은 발행 다음 날 이뤄집니다. 홈택스에서 확인하실 수 있습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= MY0402 정산 내역 없음 > 첫 정산 예정 안내 ================= */
P['MY0402'] = () => {
  const body = `
${U.pageHd('아직 정산 내역이 없습니다', '첫 매출이 생기면 여기에 쌓입니다')}

${U.card('', U.empty('💰', '첫 정산을 기다리고 있어요',
    '강의가 팔리면 그달 매출이 잡히고, 다음 달에 정산됩니다.',
    `${U.btn('강의 개설하기', { cls: 'btn-primary btn-lg', href: 'CU-02' })}
     ${U.btn('내 강의 보기', { cls: 'btn-ghost btn-lg', href: 'CU-01' })}`))}

${U.card('정산은 이렇게 돕니다', `${U.steps(['매출 발생', '월 마감', '정산 확정', '입금'], 0)}
  ${U.kv([
    ['매출 잡히는 날', '수강생이 <b>결제한 날</b>'],
    ['월 마감', '매달 <b>말일</b>'],
    ['정산 확정', '다음 달 <b>5일</b> — 이때 환불분을 뺀 금액이 정해집니다'],
    ['입금', '확정 후 <b>7영업일</b> 안에 등록 계좌로'],
  ])}
  <div class="box mt4"><b>예를 들면</b>
    <p class="t-sub mt1">8월 12일에 79,000원짜리가 하나 팔리면 —
    8월 말에 마감되고, <b>9월 5일에 확정</b>되고, <b>9월 12일쯤 입금</b>됩니다.
    수수료 20%를 뺀 63,200원에서 원천징수 3.3%를 더 빼면 <b>61,114원</b>이 들어옵니다.</p></div>`,
    { cls: 'mt6' })}

${U.card('미리 해 두시면 좋은 것', `<div class="card"><div class="card-bd flush">
  <div class="lrow">
    ${U.badge('안 함', 'b-danger')}
    <span class="grow"><b>정산 계좌 등록</b>
      <span class="t-sub" style="display:block">1원 인증까지 하셔야 입금됩니다</span></span>
    ${U.btn('등록하기', { cls: 'btn-primary btn-sm', href: 'MY0302' })}
  </div>
  <div class="lrow">
    ${U.badge('안 함', 'b-mut')}
    <span class="grow"><b>사업자 등록 (선택)</b>
      <span class="t-sub" style="display:block">있으면 원천징수 3.3%가 없습니다</span></span>
    ${U.btn('알아보기', { cls: 'btn-ghost btn-sm', href: 'MY0302' })}
  </div>
</div></div>
<p class="t-sub mt3">계좌를 안 넣어 두시면 정산이 확정돼도 <b>입금이 밀립니다.</b>
  넣어 두시면 그날 자동으로 나갑니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};
