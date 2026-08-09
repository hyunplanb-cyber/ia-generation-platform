/* JB 진행 관리 · AU 계정 — 3뎁스 하위 화면 19장
 *
 * JB 는 고수가 «돈을 받는» 자리다 — 추가 금액, 완료 처리, 정산, 세금.
 * AU 는 «못 들어올 때»의 자리다 — 비밀번호가 틀리고, 인증번호가 안 맞고,
 * 이미 가입된 이메일이고, 소셜로 가입해 놓고 잊는다.
 * 둘 다 정상 흐름은 한 줄인데 어긋나는 길이 열 갈래다.
 */
import * as U from './ui.mjs';
import { JOBS, PROS } from './data.mjs';

const P = {};
export default P;
export const PAGES = P;

/* ================= JB0102 일감 목록 > 상태별 탭 ================= */
P['JB0102'] = () => {
  const body = `
${U.pageHd('내 일감', '상태로 나눠 봅니다')}

${U.tabs([
    { label: '보낸 견적', cnt: 4 }, { label: '성사', cnt: 2 },
    { label: '진행 중', cnt: 1 }, { label: '완료', cnt: 18 },
  ], 1, { pill: true })}

${U.card('', `<div class="list">
  ${(JOBS ?? []).slice(0, 3).map((j) => `<a class="row-item" href="${U.link('JB-02')}">
    <span class="grow"><b>${j.svc}</b>
      <span class="t-sub" style="display:block">${j.no} · ${j.cus} · ${j.when}</span></span>
    ${U.stBadge(j.st)}
    <b class="price nowrap">${U.won(j.price)}</b>
    <span class="muted">›</span></a>`).join('')}
</div>`, { cls: 'mt4' })}

${U.card('상태가 뜻하는 것', U.kv([
    ['보낸 견적', '견적을 보냈고 손님이 아직 안 골랐습니다'],
    ['성사', '손님이 고르셨습니다 — 일정 맞추고 방문하시면 됩니다'],
    ['진행 중', '방문했고 일이 끝나지 않았습니다'],
    ['완료', '완료 처리했고 정산을 기다리거나 받았습니다'],
  ]) + `<p class="t-sub mt4">탭을 옮겨도 <b>정렬은 그대로</b> 둡니다.</p>`, { cls: 'mt6' })}

${U.card('빈 탭일 때', U.empty('📭', '이 상태의 일감이 없어요',
    '다른 탭을 보시거나 새 요청에 견적을 보내 보세요.',
    U.btn('새 요청 보기', { href: 'LD-01', cls: 'btn-ghost' })), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= JB0103 일감 목록 > 오늘 일정 ================= */
P['JB0103'] = () => {
  const body = `
${U.pageHd('오늘 일정', '2건 · 지금 오전 7시 40분')}

${U.banner('warn', '🚚', `<b>첫 일정이 <b>1시간 20분</b> 뒤입니다.</b>
  <p class="t-sub mt1">강남구 테헤란로까지 지금 출발하시면 <b>48분</b> 걸립니다.</p>`,
    { right: U.btn('길찾기', { cls: 'btn-pri', attr: ' data-toast="지도 앱을 엽니다"' }) })}

${U.card('', `<div class="list">
  ${[
    ['09:00', '원룸 이사', '김O늘', '강남구 테헤란로 123', 280000, '다음'],
    ['14:00', '용달', '박O수', '송파구 올림픽로 45', 90000, ''],
  ].map(([시각, 서비스, 손님, 주소, 값, 표시]) => `<div class="row-item">
    <b class="num nowrap" style="width:56px">${시각}</b>
    <span class="grow"><b>${서비스}</b>${표시 ? ` ${U.badge(표시, 'b-pri')}` : ''}
      <span class="t-sub" style="display:block">${손님} · ${주소}</span></span>
    <b class="price nowrap">${U.won(값)}</b>
    <div class="row-c">
      ${U.btn('길찾기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="지도 앱을 엽니다"' })}
      ${U.btn('연락', { cls: 'btn-ghost btn-sm', href: 'CH-02' })}
    </div>
  </div>`).join('')}
</div>`)}

${U.card('출발하시기 전에', U.kv([
    ['손님에게 알리기', '「지금 출발합니다」를 보내면 손님이 준비합니다'],
    ['주차', '건물 앞에 댈 수 있는지 미리 물어보세요'],
    ['엘리베이터', '사다리차가 필요한지 다시 확인하세요 — 현장에서 알면 늦습니다'],
    ['완료 처리', '일이 끝나면 <b>그 자리에서</b> 완료를 누르세요 — 정산이 그때부터 셉니다'],
  ]) + `<div class="btns mt4">
    ${U.btn('출발 알리기', { cls: 'btn-pri', attr: ' data-toast="손님에게 출발을 알렸어요"' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= JB0104 일감 목록 > 일감 없음 ================= */
P['JB0104'] = () => {
  const body = `
${U.pageHd('진행 중인 일감이 없습니다', '보낸 견적 4건이 답을 기다리는 중입니다')}

${U.card('', U.empty('🧰', '지금 하실 일이 없어요',
    '보낸 견적 중 하나가 성사되면 여기에 뜹니다. 그동안 새 요청을 더 보시겠어요?',
    `${U.btn('새 요청 보기', { href: 'LD-01', cls: 'btn-pri btn-lg' })}
     ${U.btn('보낸 견적 보기', { href: 'JB-01', cls: 'btn-ghost btn-lg' })}`))}

${U.card('견적을 더 보내려면', `<div class="g3">
  ${U.card('빨리 보내기', `<p class="t-sub">10분 안에 보낸 견적의 채택률이 <b>31%</b>,
    3시간 뒤는 <b>11%</b>입니다. 알림을 켜 두세요.</p>
    <div class="btns mt3">${U.btn('알림 설정', { cls: 'btn-ghost btn-sm', href: 'LD0105' })}</div>`)}
  ${U.card('설명을 붙이기', `<p class="t-sub">무엇이 포함되는지 적은 견적의 성사율이
    <b>1.8배</b>입니다. 금액만 적지 마세요.</p>
    <div class="btns mt3">${U.btn('문구 만들기', { cls: 'btn-ghost btn-sm', href: 'LD0302' })}</div>`)}
  ${U.card('조건 넓히기', `<p class="t-sub">지금 조건이면 주당 <b>18건</b>입니다.
    예산 하한을 낮추면 <b>+9건</b>입니다.</p>
    <div class="btns mt3">${U.btn('조건 보기', { cls: 'btn-ghost btn-sm', href: 'PR0403' })}</div>`)}
</div>`, { cls: 'mt6' })}

${U.card('프로필도 함께 보세요', `<p class="t-sub">완성도가 <b>72%</b>입니다.
  가격표를 채우시면 견적 요청이 <b>2.1배</b>로 늡니다.</p>
  <div class="btns mt3">${U.btn('프로필 채우기', { cls: 'btn-pri', href: 'PR0503' })}</div>`,
    { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= JB0202 일감 상세 > 추가 금액 요청 ================= */
P['JB0202'] = () => {
  const body = `
${U.pageHd('추가 금액 요청', '일을 시작하기 «전»에 알리셔야 합니다')}

${U.banner('danger', '⏱', `<b>일을 시작한 뒤에는 올려 부르실 수 없습니다.</b>
  <p class="t-sub mt1">현장에서 확인하고 <b>작업 전에</b> 알리는 것이 규정입니다.
  시작한 뒤 요청하면 손님이 거절할 수 있고, 반복되면 활동이 제한됩니다.</p>`)}

${U.card('무엇이 더 드나요', `${U.kv([
    ['항목', `<input class="input" value="사다리차" aria-label="추가 항목">`],
    ['금액', `<div class="row-c"><input class="input" style="width:150px" value="120000" aria-label="추가 금액"> 원</div>`],
  ])}
  <p class="t-th mt6 mb2">왜 필요한지 설명</p>
  <textarea class="input" rows="3" aria-label="사유">4층인데 엘리베이터가 없어 사다리차가 필요합니다. 계단으로는 장롱이 안 나갑니다.</textarea>

  <p class="t-th mt6 mb2">사진 (권합니다)</p>
  <label class="drop" style="min-height:110px;cursor:pointer">
    <span style="font-size:24px">📷</span>
    <b class="mt2">현장 사진을 붙여 주세요</b>
    <span class="t-sub mt1">사진이 있으면 손님이 훨씬 빨리 동의합니다</span>
    <input type="file" hidden multiple data-toast="사진을 붙였어요"></label>

  <div class="btns mt-block">
    ${U.btn('손님에게 요청', { cls: 'btn-pri btn-lg', attr: ' data-toast="추가 금액을 요청했어요. 손님 동의를 기다립니다"' })}
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'JB-02' })}
  </div>`)}

${U.card('요청하면 이렇게 됩니다', U.timeline([
    ['요청 보냄', '손님에게 알림이 갑니다'],
    ['손님 확인', '동의하거나 이의를 제기합니다'],
    ['동의하면', '<b>최종 금액이 바뀌고</b> 일을 진행하시면 됩니다'],
    ['거절하면', '<b>원래 금액</b>으로 하시거나, 상의해서 취소하실 수 있습니다'],
  ], 0) + `<p class="t-sub mt4">동의를 기다리는 동안 <b>일을 시작하지 마세요.</b>
    시작하면 「이미 했으니 내라」가 되어 분쟁이 됩니다.</p>`, { cls: 'mt6' })}

${U.card('올릴 수 있는 한도', U.kv([
    ['최대', '견적의 <b>50%</b>까지 — 넘으면 새 견적으로 처리합니다'],
    ['횟수', '한 일감에 <b>한 번</b>만'],
    ['안 알리고 받으면', '손님이 신고하면 <b>차액을 고수가 부담</b>합니다'],
    ['내리는 것', '언제든 가능하고 동의도 필요 없습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= JB0203 일감 상세 > 완료 처리 ================= */
P['JB0203'] = () => {
  const body = `
${U.pageHd('완료 처리', '되돌릴 수 없습니다')}

${U.card('마무리 사진', `<p class="t-sub mb3">끝난 상태를 찍어 두시면 나중에 분쟁이 생겨도 근거가 됩니다.
  <b>필수는 아니지만</b> 올려 두시길 권합니다.</p>
  <div class="g4">
    ${[1, 2].map((i) => `<div class="thumb-del">${U.phWork('done' + i)}
      <button class="del" type="button" data-toast="사진을 뺐어요" aria-label="삭제">✕</button></div>`).join('')}
    <label class="drop" style="min-height:0;aspect-ratio:4/3;cursor:pointer">
      <span style="font-size:24px">＋</span>
      <input type="file" hidden multiple data-toast="사진을 붙였어요"></label>
  </div>`)}

${U.card('최종 금액', `${U.sumRows([
    ['처음 견적', '280,000원'],
    ['추가 (사다리차)', '+120,000원'],
  ], ['최종 금액', '400,000원'])}
  <p class="t-sub mt3">추가 금액은 손님이 <b>8월 21일 08:42</b>에 동의하셨습니다.</p>`, { cls: 'mt6' })}

${U.card('완료를 누르면', U.timeline([
    ['완료 처리', '손님에게 「일이 끝났습니다」가 갑니다'],
    ['손님 확인', '보통 <b>하루 안</b>에 확인합니다'],
    ['결제', '확인하면 그때 결제됩니다'],
    ['정산', '결제 후 <b>7영업일</b> 안에 계좌로'],
  ], 0) + `<p class="t-sub mt4">손님이 <b>7일</b> 동안 확인을 안 하면 <b>자동으로 확인</b>됩니다 —
    돈을 못 받고 끝나는 일은 없습니다.</p>`, { cls: 'mt6' })}

${U.card('', `<label class="chk"><input type="checkbox" data-gate="fin" data-label="완료 확인">
    <b>일이 끝났고, 되돌릴 수 없음을 확인했습니다</b></label>
  <div class="err-msg mt3" data-gatemsg="fin" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-pri btn-lg is-off" type="button" data-gated="fin"
      data-toast="완료 처리했어요. 손님 확인을 기다립니다">완료 처리</button>
    ${U.btn('아직 안 끝났어요', { cls: 'btn-ghost btn-lg', href: 'JB-02' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= JB0204 일감 상세 > 취소 요청 ================= */
P['JB0204'] = () => {
  const body = `
${U.pageHd('일감을 취소하시겠어요?', '성사된 일감입니다 — 불이익이 있습니다')}

${U.banner('danger', '⚠', `<b>고수 사정으로 취소하면 불이익이 큽니다.</b>
  <p class="t-sub mt1">손님은 이미 일정을 잡아 두셨습니다. 다른 고수를 다시 찾아야 합니다.</p>`)}

${U.card('무엇이 걸리나', U.table(['', '어떻게 되나'], [
    ['성사율', '<b class="danger">떨어집니다</b> — 노출 순위의 20%를 차지합니다'],
    ['위약금', '<b>전날·당일이면 금액의 30%</b>를 내셔야 합니다'],
    ['손님에게', '전액 환불되고 <b>위약금이 손님에게</b> 갑니다'],
    ['반복하면', '3개월에 <b>3번</b>이면 활동이 30일 정지됩니다'],
    ['평점', '이 건은 평점을 받지 않습니다'],
  ]), { cls: 'mt6' })}

${U.card('취소 사유', `
  ${[
    ['일정이 겹쳤어요', '위약금이 붙습니다'],
    ['차량·장비 문제', '증빙을 올리시면 위약금이 줄 수 있습니다'],
    ['건강 문제', '증빙을 올리시면 <b>면제</b>될 수 있습니다'],
    ['손님과 연락이 안 돼요', '<b>불이익 없습니다</b> — 저희가 확인합니다'],
    ['현장 조건이 견적과 너무 달라요', '<b>불이익 없습니다</b> — 사진을 올려 주세요'],
  ].map(([나, 결과]) => `<label class="chk mb3">
    <input type="radio" name="jx"> <span><b>${나}</b>
      <span class="t-sub" style="display:block">${결과}</span></span></label>`).join('')}
  <textarea class="input mt3" rows="3" placeholder="자세한 사정을 적어 주세요" aria-label="취소 사유"></textarea>

  <div class="btns mt-block">
    ${U.btn('취소 요청', { cls: 'btn-danger btn-lg', attr: ' data-toast="취소를 요청했어요. 손님에게 알렸습니다"' })}
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'JB-02' })}
  </div>`, { cls: 'mt6' })}

${U.card('취소 대신 할 수 있는 것', `<p class="t-sub">일정을 못 맞추시는 것이라면
  <b>일정 변경을 먼저 제안</b>해 보세요. 손님이 받아 주시면 불이익이 없습니다.</p>
  <div class="btns mt3">${U.btn('일정 변경 제안', { cls: 'btn-pri', href: 'CH0203' })}</div>`,
    { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= JB0302 정산 내역 > 정산 상세 ================= */
P['JB0302'] = () => {
  const body = `
${U.pageHd('정산 상세', 'J-1042 · 원룸 이사')}

${U.card('계산 과정', `${U.sumRows([
    ['손님 결제액', '400,000원'],
    ['플랫폼 수수료 12%', '−48,000원'],
    ['결제 대행 수수료', '수수료에 포함'],
    ['원천징수 3.3% (개인)', '−11,616원'],
  ], ['실제 입금액', '340,384원'])}`)}

${U.card('항목이 뜻하는 것', U.kv([
    ['플랫폼 수수료', '<b>12%</b> — 신뢰 등급에 따라 10~15%로 다릅니다'],
    ['결제 대행 수수료', '<b>따로 떼지 않습니다</b> — 플랫폼 수수료에 들어 있습니다'],
    ['원천징수', '개인은 <b>3.3%</b>. 사업자로 등록하시면 없습니다'],
    ['부가세', '손님 결제액에 포함되어 있습니다'],
  ]), { cls: 'mt6' })}

${U.card('언제 들어오나', U.timeline([
    ['일 완료', '8월 21일'],
    ['손님 확인', '8월 21일'],
    ['정산 확정', '8월 22일 — <b>이때 금액이 확정됩니다</b>'],
    ['입금', '<b>8월 29일 예정</b> (확정 후 7영업일)'],
  ], 2), { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btn('명세서 내려받기', { cls: 'btn-ghost', attr: ' data-toast="정산 명세서를 PDF로 내려받았어요"' })}
  ${U.btn('정산 내역', { cls: 'btn-ghost', href: 'JB-03' })}
</div>`, { cls: 'mt6' })}

${U.card('수수료를 낮추려면', U.table(['신뢰 등급', '수수료', '조건'], [
    ['C', '15%', '기본'],
    ['B', '13%', '성사 20건 + 평점 4.3 이상'],
    ['<b>A (지금)</b>', '<b class="acc">12%</b>', '성사 50건 + 평점 4.5 이상'],
    ['S', '10%', '성사 200건 + 평점 4.7 + 취소 0'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= JB0303 정산 내역 > 정산 계좌·세금 ================= */
P['JB0303'] = () => {
  const body = `
${U.pageHd('정산 계좌와 세금', '예금주가 본인 이름과 같아야 합니다')}

${U.card('계좌', `${U.kv([
    ['예금주', `<input class="input" value="김도현" aria-label="예금주">`],
    ['은행', `<select class="input" style="width:auto"><option>국민은행</option><option>신한은행</option><option>카카오뱅크</option></select>`],
    ['계좌번호', `<input class="input" placeholder="- 없이 숫자만" aria-label="계좌번호">`],
    ['확인', `${U.badge('미인증', 'b-mut')} 1원을 보내 확인합니다`],
  ])}
  <div class="btns mt4">
    ${U.btn('1원 보내기', { cls: 'btn-pri', attr: ' data-toast="1원을 보냈어요. 입금자명 뒤 4자리를 넣어 주세요"' })}
  </div>
  <div class="box mt4"><b>왜 1원을 보내나</b>
    <p class="t-sub mt1">계좌번호가 틀리면 정산금이 <b>남의 통장으로</b> 들어갑니다.
    한 번 나간 돈은 저희가 되돌릴 수 없어서, 먼저 확인합니다.</p></div>`)}

${U.card('세금 구분', `
  <label class="chk mb3"><input type="radio" name="tax" checked>
    <span><b>개인</b> <span class="t-sub">— 지급할 때 3.3%를 원천징수합니다</span></span></label>
  <label class="chk mb4"><input type="radio" name="tax">
    <span><b>사업자</b> <span class="t-sub">— 원천징수가 없고, 세금계산서를 끊으셔야 합니다</span></span></label>

  ${U.kv([
    ['사업자등록번호', `<input class="input" placeholder="000-00-00000" aria-label="사업자등록번호">`],
    ['상호', `<input class="input" aria-label="상호">`],
    ['증빙', `<label class="btn btn-ghost btn-sm" style="cursor:pointer">사업자등록증 올리기<input type="file" hidden data-toast="사업자등록증을 올렸어요"></label>`],
  ])}`, { cls: 'mt6' })}

${U.card('민감한 정보는 이렇게 지킵니다', U.kv([
    ['계좌번호', '<b>암호화</b>해서 보관하고, 화면에는 뒤 4자리만 보여드립니다'],
    ['사업자등록증', '확인이 끝나면 <b>지웁니다</b>'],
    ['누가 볼 수 있나', '정산 담당자만 — 손님에게는 <b>절대 안 보입니다</b>'],
    ['탈퇴하면', '법이 정한 보관 기간(5년) 뒤 지웁니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= JB0304 정산 내역 > 정산 내역 없음 ================= */
P['JB0304'] = () => {
  const body = `
${U.pageHd('이 기간에 정산이 없습니다', '2026년 7월')}

${U.card('', U.empty('💰', '이 기간에는 정산이 없어요',
    '7월에는 완료된 일감이 없었습니다. 다른 기간을 보시겠어요?',
    `${U.btn('8월 보기', { cls: 'btn-pri btn-lg', attr: ' data-toast="2026년 8월로 옮겼어요"' })}
     ${U.btn('전체 보기', { cls: 'btn-ghost btn-lg', href: 'JB-03' })}`))}

${U.card('정산은 이렇게 돕니다', U.timeline([
    ['일 완료', '고수가 완료를 누릅니다'],
    ['손님 확인', '보통 하루 · 7일이 지나면 자동 확인'],
    ['정산 확정', '확인 다음 날 — 이때 금액이 정해집니다'],
    ['입금', '확정 후 <b>7영업일</b> 안에'],
  ], 0) + `<p class="t-sub mt4">완료한 일감이 있는데 여기 안 보이면
    <b>손님이 아직 확인하지 않은 것</b>입니다. 일감 상세에서 상태를 보실 수 있습니다.</p>`,
    { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btn('일감 보러 가기', { cls: 'btn-pri', href: 'JB-01' })}
  ${U.btn('새 요청 보기', { cls: 'btn-ghost', href: 'LD-01' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= AU0102 로그인 > 로그인 실패 ================= */
P['AU0102'] = () => {
  const body = `
${U.soloBox('다시 확인해 주세요', '이메일이나 비밀번호가 맞지 않습니다', `
  <div class="err-msg mb4">⚠ <b>이메일 또는 비밀번호가 맞지 않습니다.</b>
    남은 시도 <b>3</b>회</div>

  <input class="input mb3" value="kim@example.com" aria-label="이메일">
  <input class="input err mb2" type="password" value="••••••••" aria-label="비밀번호" aria-invalid="true">
  <p class="t-sub mb4">어느 쪽이 틀렸는지는 알려드리지 않습니다 —
    <b>가입 여부를 남이 알아낼 수 있기 때문</b>입니다.</p>

  ${U.btn('로그인', { cls: 'btn-pri btn-lg btn-block' })}

  <div class="row-b mt4">
    ${U.btn('비밀번호 찾기', { cls: 'btn-ghost btn-sm', href: 'AU-05' })}
    ${U.btn('회원가입', { cls: 'btn-ghost btn-sm', href: 'AU-02' })}
  </div>`)}

${U.card('5회를 넘기면', U.kv([
    ['잠김', '<b>10분</b> 동안 로그인할 수 없습니다'],
    ['그동안', '비밀번호 찾기는 <b>쓰실 수 있습니다</b>'],
    ['알림', '등록하신 메일로 「로그인 시도가 있었습니다」가 갑니다'],
    ['왜 막나', '남이 비밀번호를 하나씩 찍어 보는 것을 막기 위해서입니다'],
  ]), { cls: 'mt8' })}`;

  return { body, o: { solo: true } };
};

/* ================= AU0103 로그인 > 소셜 로그인 연결 ================= */
P['AU0103'] = () => {
  const body = `
${U.soloBox('카카오로 가입하신 계정입니다', 'kim@example.com', `
  <div class="box box-pri mb4">
    <b>이 이메일은 <b>카카오</b>로 가입하셨습니다.</b>
    <p class="t-sub mt1">비밀번호를 만드신 적이 없어서 이메일 로그인이 안 됩니다.
      카카오로 들어오시면 <b>같은 계정</b>입니다.</p>
  </div>

  ${U.btn('카카오로 로그인', { cls: 'btn-pri btn-lg btn-block', attr: ' data-toast="카카오 로그인 창을 엽니다"' })}

  <p class="t-sub center mt4">다른 방법으로도 들어오고 싶으시면</p>
  ${U.btn('비밀번호 만들기', { cls: 'btn-ghost btn-lg btn-block', href: 'AU-05' })}`)}

${U.card('계정을 합치면', U.kv([
    ['같은 이메일이면', '<b>하나의 계정</b>입니다 — 카카오로 들어오든 이메일로 들어오든'],
    ['이력', '요청·견적·후기가 <b>그대로</b> 있습니다'],
    ['비밀번호 만들기', '비밀번호 찾기로 하나 만드시면 두 방법 다 쓰실 수 있습니다'],
    ['소셜 끊기', '계정 설정에서 연결을 푸실 수 있습니다 — 비밀번호가 있어야 합니다'],
  ]), { cls: 'mt8' })}`;

  return { body, o: { solo: true } };
};

/* ================= AU0202 회원가입 > 이미 가입된 이메일 ================= */
P['AU0202'] = () => {
  const body = `
${U.soloBox('이미 가입하신 이메일입니다', 'kim@example.com', `
  <div class="box mb4">
    ${U.kv([
      ['가입일', '2025년 4월 12일'],
      ['가입 방법', '이메일 · 비밀번호'],
      ['마지막 로그인', '3개월 전'],
    ])}
  </div>

  ${U.btn('이 계정으로 로그인', { cls: 'btn-pri btn-lg btn-block', href: 'AU-01' })}

  <div class="row-b mt4">
    ${U.btn('비밀번호 찾기', { cls: 'btn-ghost btn-sm', href: 'AU-05' })}
    ${U.btn('다른 이메일로 가입', { cls: 'btn-ghost btn-sm', href: 'AU-02' })}
  </div>`)}

${U.card('가입일까지 알려드리는 까닭', `<p class="t-sub">「이미 가입된 이메일입니다」만 보이면
  <b>내가 언제 가입했는지</b> 몰라 당황하십니다. 3개월 전에 로그인하셨다는 것을 아시면
  비밀번호를 떠올리기 쉽습니다.</p>
  <p class="t-sub mt3">다만 <b>로그인 화면에서는</b> 이런 정보를 안 보여드립니다 —
    남이 남의 이메일을 넣어 가입 여부를 알아낼 수 있기 때문입니다.
    여기는 <b>본인 확인이 끝난 뒤</b>라 보여드립니다.</p>`, { cls: 'mt8' })}`;

  return { body, o: { solo: true } };
};

/* ================= AU0203 회원가입 > 약관 전문 보기 ================= */
P['AU0203'] = () => {
  const body = `
${U.pageHd('이용약관', '2026년 7월 1일 시행')}

${U.card('', `<div class="row-b wrap-row mb4">
    ${U.tabs(['이용약관 (필수)', '개인정보 처리방침 (필수)', '마케팅 수신 (선택)'], 0, { pill: true })}
    ${U.btn('개정 이력', { cls: 'btn-ghost btn-sm', attr: ' data-toast="지난 약관을 보실 수 있어요"' })}
  </div>
  <div class="terms-body">
    <h3 class="t-card">제1조 (목적)</h3>
    <p class="t-sub mt2">이 약관은 회사가 제공하는 서비스의 이용 조건과 절차,
      회사와 회원의 권리·의무 및 책임 사항을 정함을 목적으로 합니다.</p>

    <h3 class="t-card mt6">제2조 (정의)</h3>
    <p class="t-sub mt2">① 「서비스」란 회사가 운영하는 매칭 플랫폼을 말합니다.<br>
      ② 「손님」이란 요청서를 등록하고 견적을 받는 회원을 말합니다.<br>
      ③ 「고수」란 심사를 거쳐 견적을 제출할 수 있는 회원을 말합니다.</p>

    <h3 class="t-card mt6">제3조 (중개의 성격)</h3>
    <p class="t-sub mt2">회사는 손님과 고수 간의 거래를 <b>중개</b>할 뿐이며,
      거래의 당사자가 아닙니다. 다만 회사는 결제 대금을 보관하고
      분쟁 발생 시 중재 절차를 제공합니다.</p>

    <h3 class="t-card mt6">제4조 (회원의 의무)</h3>
    <p class="t-sub mt2">회원은 <b>서비스 밖에서의 직접 거래</b>를 유도하거나 응해서는 안 됩니다.
      이를 위반하여 발생한 손해에 대해 회사는 책임지지 않습니다.</p>
  </div>`)}

${U.card('', `<div class="btns">
  ${U.btn('동의하고 닫기', { cls: 'btn-pri btn-lg', href: 'AU-02' })}
  ${U.btn('PDF로 받기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="약관을 PDF로 내려받았어요"' })}
</div>`, { cls: 'mt6' })}

${U.card('개정 이력', U.table(['시행일', '무엇이 바뀌었나'], [
    ['<b>2026-07-01</b>', '분쟁 중재 절차 신설 (제12조)'],
    ['2026-01-15', '외부 거래 금지 조항 강화 (제4조)'],
    ['2025-09-01', '최초 시행'],
  ]) + `<p class="t-sub mt4">약관이 바뀌면 <b>시행 30일 전</b>에 알려드립니다.
    불리하게 바뀌는 내용은 <b>동의하지 않으실 수</b> 있고, 그때는 탈퇴하실 수 있습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= AU0302 휴대폰 인증 > 인증번호 불일치 ================= */
P['AU0302'] = () => {
  const body = `
${U.soloBox('인증번호가 맞지 않습니다', '010-****-9808 로 보낸 번호', `
  <div class="err-msg mb4">⚠ <b>번호가 맞지 않습니다.</b> 남은 시도 <b>2</b>회</div>

  <div class="otp mb3">
    ${[1, 2, 3, 4, 5, 6].map((i) => `<input class="otp-cell${i <= 6 ? ' err' : ''}" maxlength="1"
      value="${[1, 2, 3, 4, 5, 6][i - 1]}" aria-label="인증번호 ${i}번째">`).join('')}
  </div>
  <p class="t-sub center mb4">남은 시간 <b class="num">2:14</b></p>

  ${U.btn('확인', { cls: 'btn-pri btn-lg btn-block' })}

  <div class="row-b mt4">
    ${U.btn('다시 받기 (0:38 뒤)', { cls: 'btn-ghost btn-sm', off: true })}
    ${U.btn('번호 바꾸기', { cls: 'btn-ghost btn-sm', href: 'AU-03' })}
  </div>`)}

${U.card('안 되실 때', U.kv([
    ['문자가 안 와요', '스팸 차단 설정을 확인해 주세요. <b>0507</b>로 시작하는 번호입니다'],
    ['시간이 지났어요', '<b>3분</b>이 지나면 번호가 만료됩니다 — 다시 받으세요'],
    ['다시 받기가 잠겨 있어요', '연속 발송을 막으려고 <b>60초</b>를 기다립니다'],
    ['3회 틀리면', '<b>10분</b> 뒤에 다시 하실 수 있습니다'],
  ]), { cls: 'mt8' })}`;

  return { body, o: { solo: true } };
};

/* ================= AU0303 휴대폰 인증 > 왜 인증이 필요한가 ================= */
P['AU0303'] = () => {
  const body = `
${U.pageHd('왜 휴대폰 인증이 필요한가요', '실제로 만나는 서비스이기 때문입니다')}

${U.card('', `<p class="t-sub">이 서비스는 <b>사람이 집으로 찾아옵니다.</b>
  온라인에서 물건만 사고파는 것과 다릅니다. 그래서 양쪽 모두 «실제 사람»인지 확인합니다.</p>
  ${U.kv([
    ['손님에게', '고수가 실제 인물임을 보장합니다'],
    ['고수에게', '허위 요청으로 크레딧을 낭비하지 않게 합니다'],
    ['문제가 생기면', '연락이 닿아야 해결할 수 있습니다'],
  ])}`)}

${U.card('번호가 어디에 쓰이나', U.table(['', '쓰나'], [
    ['본인 확인', '<b>씁니다</b>'],
    ['안심번호 연결', '<b>씁니다</b> — 고르신 뒤에만'],
    ['중요 알림 (견적 도착·일정)', '<b>씁니다</b>'],
    ['광고 문자', '<b class="danger">안 씁니다</b> — 따로 동의하셔야 보냅니다'],
    ['다른 회사에 넘기기', '<b class="danger">안 합니다</b>'],
  ]), { cls: 'mt6' })}

${U.card('고수에게는 언제 보이나', U.timeline([
    ['요청서 보냄', '고수는 번호를 <b>못 봅니다</b>'],
    ['견적 받음', '아직 <b>못 봅니다</b>'],
    ['고수 선택', '<b>안심번호</b>가 열립니다 — 실제 번호가 아닙니다'],
    ['일 끝나고 30일', '안심번호가 <b>끊깁니다</b>'],
  ], 2) + `<p class="t-sub mt4"><b>실제 번호는 끝까지 공개되지 않습니다.</b>
    통화는 되지만 상대에게 보이는 것은 0507로 시작하는 임시 번호입니다.</p>`,
    { cls: 'mt6' })}

${U.card('보관 기간', U.kv([
    ['이용 중', '계정에 보관합니다'],
    ['탈퇴하면', '<b>즉시 지웁니다</b>'],
    ['예외', '결제·환불 기록은 전자상거래법에 따라 <b>5년</b> 보관합니다'],
    ['안심번호 기록', '<b>3개월</b> 뒤 지웁니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= AU0402 회원가입 완료 > 추천 고수 ================= */
P['AU0402'] = () => {
  const body = `
${U.pageHd('가입을 환영합니다', '관심 있다고 하신 분야의 고수입니다')}

${U.banner('ok', '🎁', `<b>첫 이용 쿠폰 <b>20%</b>를 넣어 두었습니다.</b>
  <p class="t-sub mt1">최대 5만원 · 30일 안에 쓰시면 됩니다.</p>`,
    { right: U.btn('쿠폰 보기', { cls: 'btn-pri', href: 'MY0302' }) })}

${U.sec('이런 고수는 어떠세요', `<div class="list">
  ${PROS.slice(0, 3).map((p) => U.proRow(p)).join('')}
</div>`, { cls: 'mt6', more: 'SE-01', moreLabel: '더 보기',
    desc: '가입하실 때 고르신 「이사·운송」 분야에서 평점이 높은 순' })}

${U.card('바로 시작하시려면', `<div class="g2">
  ${U.card('요청서 쓰기', `<p class="t-sub">조건을 적으시면 고수들이 <b>먼저 값을 보내옵니다.</b>
    3분이면 끝나고 손님은 무료입니다.</p>
    <div class="btns mt4">${U.btn('요청서 쓰기', { cls: 'btn-pri', href: 'RQ-01' })}</div>`)}
  ${U.card('고수 둘러보기', `<p class="t-sub">직접 고르고 싶으시면 목록에서 찾아
    <b>채팅으로 먼저</b> 물어보실 수 있습니다.</p>
    <div class="btns mt4">${U.btn('둘러보기', { cls: 'btn-ghost', href: 'SE-01' })}</div>`)}
</div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= AU0502 비밀번호 찾기 > 메일 보냄 ================= */
P['AU0502'] = () => {
  const body = `
${U.soloBox('메일을 보냈습니다', 'kim@example.com', `
  <div class="box box-pri mb4">
    <b>메일함을 확인해 주세요.</b>
    <p class="t-sub mt1">비밀번호를 새로 정하는 링크를 보냈습니다.
      링크는 <b>30분</b> 동안만 열립니다.</p>
  </div>

  ${U.btn('메일 앱 열기', { cls: 'btn-pri btn-lg btn-block', attr: ' data-toast="메일 앱을 엽니다"' })}

  <p class="t-sub center mt4">메일이 안 왔나요?</p>
  ${U.btn('다시 보내기 (0:47 뒤)', { cls: 'btn-ghost btn-lg btn-block', off: true })}`)}

${U.card('메일이 안 올 때', U.kv([
    ['스팸함', '가장 흔합니다 — <b>스팸함</b>을 먼저 봐 주세요'],
    ['프로모션 탭', 'Gmail 은 「프로모션」으로 갈 때가 있습니다'],
    ['주소 오타', '가입하신 주소가 맞는지 확인해 주세요'],
    ['소셜로 가입', '카카오·네이버로 가입하셨으면 <b>비밀번호가 없습니다</b>'],
  ]) + `<div class="btns mt4">
    ${U.btn('다른 이메일로 찾기', { cls: 'btn-ghost', href: 'AU-05' })}
    ${U.btn('고객센터', { cls: 'btn-ghost', href: 'AU-05' })}
  </div>`, { cls: 'mt8' })}

${U.card('링크가 30분만 열리는 까닭', `<p class="t-sub">메일함이 남에게 열려 있으면
  그 링크로 <b>비밀번호를 바꿀 수 있습니다.</b> 그래서 짧게 둡니다.
  지나면 다시 신청하시면 됩니다 — 몇 번이든 괜찮습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { solo: true } };
};

/* ================= AU0503 비밀번호 찾기 > 등록되지 않은 이메일 ================= */
P['AU0503'] = () => {
  const body = `
${U.soloBox('가입 이력이 없습니다', 'kim2@example.com', `
  <div class="box mb4">
    <b>이 주소로 가입하신 적이 없습니다.</b>
    <p class="t-sub mt1">다른 주소로 가입하셨거나, 소셜(카카오·네이버)로 가입하셨을 수 있습니다.</p>
  </div>

  ${U.btn('카카오로 로그인 해 보기', { cls: 'btn-pri btn-lg btn-block', attr: ' data-toast="카카오 로그인 창을 엽니다"' })}
  ${U.btn('네이버로 로그인 해 보기', { cls: 'btn-ghost btn-lg btn-block mt3', attr: ' data-toast="네이버 로그인 창을 엽니다"' })}

  <div class="row-b mt4">
    ${U.btn('다른 이메일로 찾기', { cls: 'btn-ghost btn-sm', href: 'AU-05' })}
    ${U.btn('회원가입', { cls: 'btn-ghost btn-sm', href: 'AU-02' })}
  </div>`)}

${U.card('여기서는 알려드리는 까닭', `<p class="t-sub">로그인 화면에서는 「이메일이 없다」고 알려드리지 않습니다 —
  남이 남의 주소를 넣어 <b>가입 여부를 알아낼</b> 수 있기 때문입니다.</p>
  <p class="t-sub mt3">비밀번호 찾기는 다릅니다. 여기서 「메일을 보냈습니다」라고만 하면,
  <b>가입한 적 없는 분이 메일함만 계속 들여다보게</b> 됩니다.
  그게 더 답답한 일이라 여기서는 솔직히 말씀드립니다.</p>`, { cls: 'mt8' })}`;

  return { body, o: { solo: true } };
};

/* ================= AU0504 비밀번호 찾기 > 새 비밀번호 설정 ================= */
P['AU0504'] = () => {
  const 규칙 = [
    ['8자 이상', true], ['영문 대소문자 섞기', true],
    ['숫자 넣기', true], ['특수문자 넣기', false],
    ['이전 비밀번호와 다르게', true],
  ];

  const body = `
${U.soloBox('새 비밀번호를 정해 주세요', 'kim@example.com', `
  <input class="input mb3" type="password" value="••••••••••••" aria-label="새 비밀번호">
  <div class="mb3">${U.progress(75)}<span class="t-sub">강함</span></div>

  <div class="box mb4">
    ${규칙.map(([나, ok]) => `<div class="row-c mb1">
      <span class="${ok ? 'success' : 'muted'}">${ok ? '✓' : '○'}</span>
      <span class="t-sub">${나}${!ok ? ' (선택)' : ''}</span></div>`).join('')}
  </div>

  <input class="input mb2" type="password" value="••••••••••••" aria-label="새 비밀번호 확인">
  <p class="t-sub success mb4">✓ 두 개가 같습니다</p>

  ${U.btn('비밀번호 바꾸기', { cls: 'btn-pri btn-lg btn-block', attr: ' data-toast="비밀번호를 바꿨어요. 로그인 화면으로 갑니다"' })}`)}

${U.card('이전 비밀번호는 못 쓰십니다', `<p class="t-sub">지금까지 쓰신 <b>최근 3개</b>는 다시 쓸 수 없습니다.
  같은 것으로 되돌리면 바꾼 뜻이 없어지기 때문입니다.</p>
  <p class="t-sub mt3">「이전 비밀번호와 같습니다」가 나오면 <b>다른 것</b>으로 정해 주세요.</p>`,
    { cls: 'mt8' })}

${U.card('바꾸고 나면', U.kv([
    ['다른 기기', '<b>모두 로그아웃</b>됩니다 — 남이 쓰고 있었다면 그때 끊깁니다'],
    ['알림', '등록하신 메일로 「비밀번호가 바뀌었습니다」가 갑니다'],
    ['이 링크', '한 번 쓰면 <b>바로 만료</b>됩니다'],
    ['다음 변경', '한 번 바꾸면 <b>24시간</b> 뒤에 다시 바꾸실 수 있습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { solo: true } };
};
