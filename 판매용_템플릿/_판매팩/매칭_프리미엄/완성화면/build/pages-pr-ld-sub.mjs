/* PR 고수센터 · LD 요청 받기 — 3뎁스 하위 화면 28장
 *
 * 고수 쪽 화면이다. 손님과 결정적으로 다른 것이 하나 있다 —
 * **고수는 견적을 보낼 때마다 크레딧을 낸다.** 그래서 「보낼까 말까」가 늘 판단이고,
 * 잔액·경쟁·참고가·순위 같은 «숫자»가 화면의 주인공이 된다.
 */
import * as U from './ui.mjs';
import { PROS, LEADS, JOBS } from './data.mjs';

const P = {};
export default P;
export const PAGES = P;

/* ================= PR0102 고수센터 홈 > 크레딧 부족 경고 ================= */
P['PR0102'] = () => {
  const body = `
${U.pageHd('크레딧이 얼마 없습니다', '남은 12 크레딧 · 견적 4건 분량')}

${U.banner('danger', '🪫', `<b>12 크레딧이 남았습니다 — 견적 <b>4건</b>이면 바닥납니다.</b>
  <p class="t-sub mt1">크레딧이 0이 되면 <b>새 요청이 와도 견적을 보낼 수 없습니다.</b>
  요청은 계속 오지만 손만 놓고 봐야 합니다.</p>`,
    { right: U.btn('충전하기', { cls: 'btn-pri', href: 'LD-04' }) })}

${U.card('', `${U.statRow([
    ['12', '남은 크레딧'],
    ['4건', '보낼 수 있는 견적'],
    ['3.2건', '하루 평균 발송'],
    ['1.2일', '이 속도면 남은 기간'],
  ])}`)}

${U.card('견적 한 건에 드는 크레딧', U.table(['요청 규모', '크레딧', '왜 다른가'], [
    ['10만원 미만', '<b>2</b>', '작은 일감은 싸게'],
    ['10~50만원', '<b>3</b>', '가장 흔한 구간'],
    ['50~200만원', '<b>5</b>', '성사되면 크게 남습니다'],
    ['200만원 이상', '<b>8</b>', ''],
  ]) + `<p class="t-sub mt4">보낸 견적이 <b>손님에게 안 읽힌 채 마감</b>되면 크레딧을 돌려드립니다.
    읽혔는데 안 골라진 것은 돌려드리지 않습니다.</p>`, { cls: 'mt6' })}

${U.card('자동 충전을 켜 두시면', `<p class="t-sub mb4">잔액이 기준 아래로 떨어지면 알아서 채웁니다.
  <b>요청이 몰리는 주말</b>에 바닥나는 일을 막습니다.</p>
  <div class="btns">
    ${U.btn('자동 충전 켜기', { cls: 'btn-pri', href: 'LD0402' })}
    ${U.btn('지금 충전', { cls: 'btn-ghost', href: 'LD-04' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= PR0103 고수센터 홈 > 응답률 하락 경고 ================= */
P['PR0103'] = () => {
  const body = `
${U.pageHd('응답률이 떨어졌습니다', '지난 30일 78% · 기준 80%')}

${U.banner('warn', '📉', `<b>기준(80%) 아래로 떨어져 <b>노출이 줄고 있습니다.</b></b>
  <p class="t-sub mt1">응답률이 낮으면 손님 목록에서 뒤로 밀립니다.
  지금 이 분야 <b>18위</b>인데, 80%를 넘기면 <b>11위</b>쯤으로 올라갑니다.</p>`)}

${U.card('', `${U.statRow([
    ['78%', '지난 30일 응답률'],
    ['80%', '기준'],
    ['7건', '놓친 요청'],
    ['-7', '순위 변동'],
  ])}
  <p class="t-sub mt4">응답률은 <b>받은 요청 중 24시간 안에 답한 비율</b>입니다.
    견적을 «보내는» 것뿐 아니라 <b>「관심 없음」으로 넘기는 것도 답한 것</b>으로 칩니다.</p>`)}

${U.card('최근에 놓친 요청', `<div class="list">
  ${(LEADS ?? []).slice(0, 3).map((l) => `<div class="row-item is-off">
    ${U.badge('마감', 'b-mut')}
    <span class="grow"><b>${l.svc ?? '원룸 이사'}</b>
      <span class="t-sub" style="display:block">${l.at ?? '3일 전'} · 답하지 않으셨습니다</span></span>
  </div>`).join('') || `<div class="row-item is-off">
    ${U.badge('마감', 'b-mut')}<span class="grow"><b>원룸 이사</b>
      <span class="t-sub" style="display:block">3일 전 · 답하지 않으셨습니다</span></span></div>`}
</div>
<p class="t-sub mt3">이 요청들은 이미 마감되어 되돌릴 수 없습니다.</p>`, { cls: 'mt6' })}

${U.card('올리는 방법', U.kv([
    ['가장 빠른 길', '<b>「관심 없음」을 쓰세요</b> — 견적을 안 보내도 답한 것으로 칩니다'],
    ['알림 켜기', '요청이 오면 바로 알려드립니다 — 놓치는 것이 절반으로 줍니다'],
    ['조건 좁히기', '안 맞는 요청이 덜 오게 하면 응답률이 올라갑니다'],
    ['휴식 모드', '바쁘실 땐 켜 두세요 — 그동안은 응답률을 세지 않습니다'],
  ]) + `<div class="btns mt4">
    ${U.btn('받을 조건 정하기', { cls: 'btn-pri', href: 'PR0403' })}
    ${U.btn('휴식 모드', { cls: 'btn-ghost', href: 'PR0402' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= PR0104 고수센터 홈 > 처리할 일 없음 ================= */
P['PR0104'] = () => {
  const body = `
${U.pageHd('오늘 할 일이 없습니다', '답할 요청도, 진행 중인 일도 없습니다')}

${U.card('', U.empty('☕', '조용한 날이에요',
    '새 요청이 오면 알려드립니다. 그동안 프로필을 손보시면 다음 요청이 더 옵니다.',
    `${U.btn('프로필 채우기', { href: 'PR-05', cls: 'btn-pri btn-lg' })}
     ${U.btn('새 요청 보기', { href: 'LD-01', cls: 'btn-ghost btn-lg' })}`))}

${U.card('지난주 성과', `${U.statRow([
    ['14건', '받은 요청'],
    ['9건', '보낸 견적'],
    ['3건', '성사'],
    ['33%', '성사율'],
  ])}
  <p class="t-sub mt4">이 분야 평균 성사율은 <b>21%</b>입니다 — 잘하고 계십니다.</p>`, { cls: 'mt6' })}

${U.card('요청이 적을 때 해 두면 좋은 것', `<div class="g3">
  ${U.card('활동 지역 넓히기', `<p class="t-sub">지금 <b>3개 구</b>에서만 받고 계십니다.
    인접 2개 구를 더하면 요청이 <b>주 6건</b> 늘어납니다.</p>
    <div class="btns mt3">${U.btn('지역 설정', { cls: 'btn-ghost btn-sm', href: 'PR0203' })}</div>`)}
  ${U.card('작업 사진 올리기', `<p class="t-sub">사진이 <b>3장</b>뿐입니다. 8장 이상인 고수가
    견적 채택률이 <b>1.6배</b> 높습니다.</p>
    <div class="btns mt3">${U.btn('사진 올리기', { cls: 'btn-ghost btn-sm', href: 'PR-05' })}</div>`)}
  ${U.card('자주 쓰는 문구 만들기', `<p class="t-sub">견적 쓰는 시간이 절반으로 줍니다.
    먼저 보낼수록 채택률이 높습니다.</p>
    <div class="btns mt3">${U.btn('문구 만들기', { cls: 'btn-ghost btn-sm', href: 'LD0302' })}</div>`)}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= PR0105 고수센터 홈 > 노출 순위 상세 ================= */
P['PR0105'] = () => {
  const body = `
${U.pageHd('내 노출 순위', '이사·운송 · 강남구 기준')}

${U.card('', `${U.statRow([
    ['11위', '이사·운송 / 강남구'],
    ['24위', '이사·운송 / 서울'],
    ['6위', '원룸 이사 / 강남구'],
    ['↑ 3', '지난주 대비'],
  ])}
  <p class="t-sub mt4">순위는 <b>분야와 지역마다 따로</b> 매겨집니다.
    손님이 「원룸 이사 · 강남구」로 찾으면 <b>6위</b>로 보입니다.</p>`)}

${U.card('순위를 정하는 것', `${U.table(['무엇이', '얼마나', '내 상태'], [
    ['후기 평점', '<b>30%</b>', '★ 4.9 — 상위 12%'],
    ['응답률·응답 속도', '<b>25%</b>', '98% · 12분 — 상위 8%'],
    ['성사율', '<b>20%</b>', '33% — 상위 20%'],
    ['프로필 완성도', '<b>15%</b>', '<b class="danger">72%</b> — 하위 40%'],
    ['최근 활동', '<b>10%</b>', '어제 활동'],
  ])}
  <p class="t-sub mt4">돈으로 순위를 올릴 수는 없습니다. 광고 자리는 따로 두고
    <b>「광고」라고 표시</b>합니다 — 순위와 섞지 않습니다.</p>`, { cls: 'mt6' })}

${U.card('올리려면 이것부터', `<div class="list">
  ${[
    ['프로필 완성도 72% → 100%', '+4위쯤', 'PR0503'],
    ['작업 사진 3장 → 8장', '+2위쯤', 'PR-05'],
    ['자격증 등록', '+1위쯤', 'PR-05'],
  ].map(([나, 효과, 가기]) => `<a class="row-item" href="${U.link(가기)}">
    <span class="grow"><b>${나}</b></span>
    <b class="acc nowrap">${효과}</b><span class="muted">›</span></a>`).join('')}
</div>
<p class="t-sub mt3">1위 고수와 견주면 <b>프로필 완성도</b>에서 가장 크게 벌어집니다.
  평점과 응답은 이미 비슷합니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= PR0202 고수 등록 > 신원 확인 ================= */
P['PR0202'] = () => {
  const body = `
${U.pageHd('신원 확인', '손님이 믿고 맡길 수 있게')}

${U.card('', `${U.stepbar ? U.stepbar(['기본 정보', '신원 확인', '활동 지역', '심사'], 1)
    : U.timeline([['기본 정보', '완료'], ['신원 확인', '지금'], ['활동 지역', ''], ['심사', '']], 1)}`)}

${U.card('1. 휴대폰 본인인증', `${U.kv([
    ['상태', `${U.badge('완료', 'b-ok')} 2026-08-10 확인`],
    ['이름', '김도현'],
    ['통신사', 'SKT'],
  ])}`, { cls: 'mt6' })}

${U.card('2. 신분증', `<label class="drop" style="cursor:pointer">
    <span style="font-size:28px">🪪</span>
    <b class="mt2">신분증을 찍어 올려 주세요</b>
    <span class="t-sub mt1">주민등록증 · 운전면허증 · 여권</span>
    <input type="file" hidden data-toast="신분증을 올렸어요"></label>
  <div class="box mt4"><b>찍을 때</b>
    ${U.kv([
      ['밝은 곳에서', '그림자가 지면 글자를 못 읽습니다'],
      ['네 귀퉁이가 다 나오게', '잘리면 다시 요청드립니다'],
      ['빛 반사 없이', '코팅에 조명이 비치면 안 됩니다'],
      ['가리셔도 되는 것', '<b>주민번호 뒤 6자리</b>는 가리고 올리셔도 됩니다'],
    ])}</div>`, { cls: 'mt6' })}

${U.card('3. 얼굴 확인', `<p class="t-sub mb3">신분증 사진과 같은 사람인지 확인합니다. 5초면 끝납니다.</p>
  ${U.btn('얼굴 확인 시작', { cls: 'btn-pri btn-lg', attr: ' data-toast="카메라 권한을 물어봅니다"' })}`,
    { cls: 'mt6' })}

${U.card('개인정보는 이렇게 다룹니다', U.kv([
    ['무엇을 보관', '<b>확인 결과만</b> 보관합니다 — 이름과 확인 여부'],
    ['신분증 사진', '확인이 끝나면 <b>즉시 지웁니다</b>. 저장하지 않습니다'],
    ['얼굴 사진', '대조에만 쓰고 <b>남기지 않습니다</b>'],
    ['손님에게', '「신원 확인 완료」 배지만 보입니다 — 이름·생년월일은 안 보입니다'],
  ]), { cls: 'mt6' })}

${U.card('확인이 안 될 때', U.table(['사유', '어떻게'], [
    ['글자가 흐림', '밝은 곳에서 다시 찍어 주세요'],
    ['이름이 다름', '개명하셨으면 서류를 함께 올려 주세요'],
    ['유효기간 지남', '갱신한 신분증으로 올려 주세요'],
    ['3회 실패', '<b>24시간</b> 뒤에 다시 하실 수 있습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= PR0203 고수 등록 > 활동 지역 설정 ================= */
P['PR0203'] = () => {
  const body = `
${U.pageHd('어디까지 가실 수 있나요', '요청이 오는 범위를 정합니다')}

${U.card('', `${U.ph(['지도 (서울 · 강남·서초·송파 선택됨)', 1200, 675])}
  <p class="t-th mt6 mb2">고른 지역 (3개 구)</p>
  ${U.chips(['강남구 ✕', '서초구 ✕', '송파구 ✕'], [0, 1, 2])}

  <p class="t-th mt6 mb2">더 고르기</p>
  ${U.chips(['마포구', '용산구', '성동구', '광진구', '동작구', '관악구'], -1)}

  <p class="t-th mt6 mb2">출장 가능 거리</p>
  <div class="row-c">
    <input type="range" class="range" min="0" max="50" step="5" value="15" data-toast="출장 거리를 바꿨어요">
    <b class="nowrap">15km 까지</b>
  </div>
  <p class="t-sub mt2">고른 구 <b>밖</b>이라도 15km 안이면 요청이 옵니다 — 출장비를 붙이실 수 있습니다.</p>`)}

${U.card('지역별로 요청이 얼마나 오나', `${U.table(['지역', '주당 요청', '고수 수', '경쟁'], [
    ['<b>강남구</b>', '<b>42건</b>', '128명', '높음'],
    ['<b>서초구</b>', '<b>28건</b>', '86명', '보통'],
    ['<b>송파구</b>', '<b>31건</b>', '94명', '보통'],
    ['마포구', '24건', '61명', '<b class="success">낮음</b>'],
    ['성동구', '17건', '38명', '<b class="success">낮음</b>'],
  ])}
  <p class="t-sub mt4">요청이 많다고 좋은 것은 아닙니다 — 고수도 많으면 <b>견적 자리 경쟁</b>이 셉니다.
    마포·성동은 요청이 적어도 <b>경쟁이 낮아</b> 채택률이 높습니다.</p>`, { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btn('다음 (심사 신청)', { cls: 'btn-pri btn-lg', href: 'PR-03' })}
  ${U.btn('임시 저장', { cls: 'btn-ghost btn-lg', attr: ' data-toast="여기까지 저장했어요"' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= PR0204 고수 등록 > 임시 저장·이어 쓰기 ================= */
P['PR0204'] = () => {
  const 항목 = [
    ['기본 정보', true, '활동명 · 소개 · 분야'],
    ['신원 확인', true, '휴대폰 · 신분증 · 얼굴'],
    ['활동 지역', true, '3개 구 · 15km'],
    ['경력·자격', false, '증빙 파일이 없습니다'],
    ['가격표', false, '아직 안 적으셨습니다'],
    ['정산 계좌', false, '나중에 하셔도 됩니다'],
  ];
  const 끝 = 항목.filter(([, ok]) => ok).length;

  const body = `
${U.pageHd('쓰시던 신청서가 있습니다', `${끝} / ${항목.length} 까지 하셨습니다 · 2026-08-09 22:41 저장`)}

${U.card('', `${U.progress(Math.round(끝 / 항목.length * 100))}
  <div class="list mt4">
    ${항목.map(([나, ok, 설명]) => `<div class="row-item${ok ? '' : ''}">
      ${ok ? U.badge('완료', 'b-ok') : U.badge('아직', 'b-mut')}
      <span class="grow"><b>${나}</b>
        <span class="t-sub" style="display:block">${설명}</span></span>
      ${U.btn(ok ? '고치기' : '쓰기', { cls: 'btn-ghost btn-sm', href: 'PR-02' })}
    </div>`).join('')}
  </div>
  <div class="btns mt-block">
    ${U.btn('이어서 쓰기', { cls: 'btn-pri btn-lg', href: 'PR-02' })}
    ${U.btn('처음부터 다시', { cls: 'btn-ghost btn-lg', attr: ' data-toast="저장본을 지우고 처음부터 시작합니다"' })}
  </div>`)}

${U.banner('info', '📋', `<b>필수는 앞의 넷입니다.</b>
  <p class="t-sub mt1">가격표와 정산 계좌는 <b>심사가 끝난 뒤</b>에 하셔도 됩니다.
  지금은 <b>경력·자격</b>만 채우시면 신청하실 수 있습니다.</p>`)}

${U.card('자동 저장', U.kv([
    ['언제', '한 항목을 마칠 때마다'],
    ['어디에', '계정에 저장됩니다 — 다른 기기에서도 이어 쓰실 수 있습니다'],
    ['얼마나', '<b>30일</b> 보관합니다'],
    ['신분증 사진', '<b>저장하지 않습니다</b> — 확인이 끝나면 바로 지웁니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= PR0302 심사 중 > 보완 요청 ================= */
P['PR0302'] = () => {
  const body = `
${U.pageHd('보완이 필요합니다', '두 가지만 다시 올려 주세요')}

${U.banner('warn', '📄', `<b>회신 기한은 <b>2026년 8월 17일</b>까지입니다 (7일 남음).</b>
  <p class="t-sub mt1">기한 안에 안 주시면 신청이 <b>자동으로 취소</b>됩니다.
  다시 신청하실 수는 있지만 처음부터 하셔야 합니다.</p>`)}

${U.card('보완할 것', `${[
    ['자격증 사진', '글자가 흐려 읽을 수 없습니다', '밝은 곳에서 다시 찍어 주세요', 'PR-02'],
    ['활동명', '「최고이사」는 <b>「최고·최상」 같은 최상급 표현</b>이라 쓸 수 없습니다', '다른 이름으로 바꿔 주세요', 'PR-02'],
  ].map(([항목, 왜, 어떻게, 가기]) => `
  <div class="box box-warn mb3">
    <div class="row-b wrap-row">
      <div class="grow" style="min-width:240px">
        <b>${항목}</b>
        <p class="t-sub mt1">${왜}</p>
        <p class="t-sub mt1">→ ${어떻게}</p>
      </div>
      ${U.btn('고치러 가기', { cls: 'btn-ghost', href: 가기 })}
    </div>
  </div>`).join('')}`)}

${U.card('', `<div class="btns">
  ${U.btn('다시 제출', { cls: 'btn-pri btn-lg', attr: ' data-toast="다시 제출했어요. 보통 1영업일 안에 결과를 알려드립니다"' })}
  ${U.btn('심사 담당자에게 묻기', { cls: 'btn-ghost btn-lg', href: 'AU-05' })}
</div>
<p class="t-sub mt3">보완 제출은 <b>처음 심사보다 빠릅니다</b> — 보통 1영업일입니다.</p>`, { cls: 'mt6' })}

${U.card('보완 요청이 자주 나오는 것', U.table(['항목', '왜'], [
    ['자격증 사진', '흐림 · 잘림 · 유효기간 지남'],
    ['활동명', '최상급 표현 · 다른 상호와 비슷함 · 연락처 포함'],
    ['소개 글', '연락처나 외부 링크가 들어감'],
    ['작업 사진', '남의 사진 · 얼굴이 그대로 나옴'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= PR0303 심사 중 > 반려 ================= */
P['PR0303'] = () => {
  const body = `
${U.pageHd('신청이 반려되었습니다', '2026-08-10 심사')}

${U.card('', U.empty('📛', '이번에는 등록해 드리지 못했습니다',
    '아래 사유를 확인해 주세요. 고치신 뒤 다시 신청하실 수 있습니다.',
    ''))}

${U.card('반려 사유', `${U.kv([
    ['주된 사유', '<b>사업자등록증의 업종이 신청 분야와 다릅니다</b>'],
    ['자세히', '등록증에는 「소매업」으로 되어 있는데 이사·운송으로 신청하셨습니다. 화물자동차 운송사업 허가가 필요합니다.'],
    ['심사일', '2026-08-10'],
  ])}`, { cls: 'mt6' })}

${U.card('다시 신청하시려면', U.kv([
    ['언제부터', '<b>지금 바로</b> 하실 수 있습니다 — 대기 기간이 없습니다'],
    ['무엇을 준비', '화물자동차 운송사업 허가증 또는 업종 추가된 사업자등록증'],
    ['다른 분야로', '허가가 필요 없는 분야(청소·정리 등)로는 <b>지금 신청 가능</b>합니다'],
    ['남은 정보', '입력하신 내용은 <b>그대로 남아 있습니다</b> — 다시 안 쓰셔도 됩니다'],
  ]) + `<div class="btns mt4">
    ${U.btn('다시 신청', { cls: 'btn-pri', href: 'PR-02' })}
    ${U.btn('다른 분야로 신청', { cls: 'btn-ghost', href: 'PR-02' })}
  </div>`, { cls: 'mt6' })}

${U.banner('info', '🙋', `<b>손님으로는 계속 쓰실 수 있습니다.</b>
  <p class="t-sub mt1">고수 등록만 반려된 것이라 계정은 그대로입니다.
  요청서를 쓰고 견적을 받는 것은 아무 제한이 없습니다.</p>`)}

${U.card('결과가 잘못됐다고 생각되시면', `<p class="t-sub">이의를 제기하실 수 있습니다.
  다른 담당자가 다시 봅니다 — <b>3영업일</b> 걸립니다.</p>
  <div class="btns mt3">
    ${U.btn('이의 제기', { cls: 'btn-ghost', attr: ' data-toast="이의를 접수했어요. 3영업일 안에 알려드릴게요"' })}
    ${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'AU-05' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= PR0402 활동 설정 > 휴식 모드 ================= */
P['PR0402'] = () => {
  const body = `
${U.pageHd('휴식 모드', '새 요청을 잠시 안 받습니다')}

${U.card('', `<label class="chk mb4"><input type="checkbox" data-toast="휴식 모드를 켰어요">
    <b>휴식 모드 켜기</b></label>

  <p class="t-th mb2">언제 돌아오시나요</p>
  <div class="row-c">
    <input class="input" style="width:180px" value="2026-08-18" aria-label="복귀 예정일">
    ${U.chips(['1주일', '2주일', '한 달', '미정'], 0)}
  </div>
  <p class="t-sub mt2">그날이 되면 <b>자동으로 풀립니다.</b> 미리 켜셔도 됩니다.</p>

  <p class="t-th mt6 mb2">자동 응답 문구</p>
  <textarea class="input" rows="3" aria-label="자동 응답">8월 18일까지 휴가입니다. 그 뒤 일정으로 잡아 주시면 바로 답변드리겠습니다.</textarea>
  <p class="t-sub mt2">채팅으로 연락이 오면 이 문구가 <b>한 번</b> 나갑니다.</p>

  <div class="btns mt-block">
    ${U.btn('저장', { cls: 'btn-pri btn-lg', attr: ' data-toast="휴식 모드를 켰어요. 8월 18일에 자동으로 풀립니다"' })}
  </div>`)}

${U.card('켜면 이렇게 됩니다', U.table(['', '휴식 중'], [
    ['새 요청', '<b class="danger">안 옵니다</b>'],
    ['진행 중인 일감', '<b class="success">그대로 진행됩니다</b>'],
    ['보낸 견적', '살아 있습니다 — 손님이 고르실 수 있습니다'],
    ['프로필', '보입니다 · 「휴식 중」 표시가 붙습니다'],
    ['응답률', '<b>세지 않습니다</b> — 떨어지지 않습니다'],
    ['노출 순위', '휴식 기간은 「최근 활동」 점수에서 <b>빼고</b> 계산합니다'],
  ]), { cls: 'mt6' })}

${U.banner('ok', '💡', `<b>바쁘실 땐 끄지 말고 «켜» 두세요.</b>
  <p class="t-sub mt1">답을 못 하고 놓치면 <b>응답률이 떨어집니다.</b>
  휴식 모드는 그걸 막아 줍니다 — 순위에 오히려 낫습니다.</p>`)}`;

  return { body, o: { pro: true } };
};

/* ================= PR0403 활동 설정 > 요청 받을 조건 ================= */
P['PR0403'] = () => {
  const body = `
${U.pageHd('어떤 요청만 받으시겠어요', '조건을 좁히면 요청이 줍니다')}

${U.card('', `${U.kv([
    ['예산 하한', `<div class="row-c">
      <input type="range" class="range" min="0" max="1000000" step="50000" value="150000" data-toast="예산 하한을 바꿨어요">
      <b class="nowrap">15만원 이상</b></div>`],
    ['최소 규모', `${U.chips(['상관없음', '원룸 이상', '투룸 이상'], 1)}`],
    ['안 받을 유형', `${U.chips(['당일 요청', '심야 작업', '반려동물 있는 집', '5층 이상 계단'], [0, 1])}`],
  ])}
  <div class="box box-pri mt6">
    <div class="row-b wrap-row">
      <div><b>이 조건이면 주당 <span class="acc">18건</span>이 옵니다</b>
        <p class="t-sub mt1">조건 없이 다 받으시면 <b>주당 42건</b>입니다</p></div>
      ${U.btn('저장', { cls: 'btn-pri', attr: ' data-toast="받을 조건을 저장했어요"' })}
    </div>
  </div>`)}

${U.card('조건을 바꾸면', `${U.table(['이렇게 하면', '주당 요청', ''], [
    ['조건 없이 다 받기', '<b>42건</b>', '응답률 관리가 어렵습니다'],
    ['<b>지금 조건</b>', '<b class="acc">18건</b>', '균형이 맞습니다'],
    ['예산 30만원 이상만', '<b>7건</b>', '너무 적습니다'],
  ])}
  <p class="t-sub mt4">요청이 <b>주당 5건 아래</b>로 떨어지면 노출 순위의 「최근 활동」 점수가 내려갑니다 —
    조건을 너무 좁히면 오히려 손해입니다.</p>`, { cls: 'mt6' })}

${U.card('조건에 안 맞는 요청은', U.kv([
    ['목록에', '<b>안 보입니다</b>'],
    ['알림', '가지 않습니다'],
    ['응답률', '<b>세지 않습니다</b> — 안 받은 요청은 안 답해도 괜찮습니다'],
    ['손님에게', '고수가 조건을 걸었다는 것은 알리지 않습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= PR0502 프로필 관리 > 포트폴리오 순서 변경 ================= */
P['PR0502'] = () => {
  const body = `
${U.pageHd('작업 사진 순서', '첫 장이 대표 사진입니다')}

${U.card('', `<div class="g4">
    ${[1, 2, 3, 4, 5, 6].map((i) => `<div class="thumb-del${i === 2 ? ' is-dragging' : ''}">
      ${U.phWork('pf' + i)}
      <span class="ord">${i}</span>
      ${i === 1 ? `<span class="rep">대표</span>` : ''}
      <button class="del" type="button" data-toast="사진을 뺐어요" aria-label="삭제">✕</button>
    </div>`).join('')}
    <label class="drop" style="min-height:0;aspect-ratio:4/3;cursor:pointer">
      <span style="font-size:24px">＋</span>
      <span class="t-sub">여러 장 한 번에</span>
      <input type="file" hidden multiple data-toast="사진을 골랐어요"></label>
  </div>
  <p class="t-sub mt3">사진을 끌어 옮기면 순서가 바뀝니다. <b>첫 장이 목록에 보이는 대표 사진</b>입니다.</p>
  <div class="btns mt-block">
    ${U.btn('2번을 대표로', { cls: 'btn-ghost', attr: ' data-toast="2번 사진을 대표로 바꿨어요"' })}
    ${U.btn('되돌리기', { cls: 'btn-ghost', attr: ' data-toast="방금 바꾼 순서를 되돌렸어요"' })}
  </div>`)}

${U.card('올리는 중 실패한 것', `<div class="list">
  <div class="row-item">
    ${U.badge('실패', 'b-danger')}
    <span class="grow"><b>작업_07.heic</b>
      <span class="t-sub" style="display:block">24.8MB · <b>10MB 를 넘습니다</b></span></span>
    ${U.btn('줄여서 다시', { cls: 'btn-ghost btn-sm', attr: ' data-toast="크기를 줄여 다시 올립니다"' })}
  </div>
</div>`, { cls: 'mt6' })}

${U.card('사진이 몇 장이면 좋나', U.table(['장수', '견적 채택률'], [
    ['0장', '기준'],
    ['3장', '<b>1.2배</b>'],
    ['<b>8장 이상</b>', '<b class="acc">1.6배</b>'],
    ['15장 이상', '1.6배 (더 늘지 않습니다)'],
  ]) + `<p class="t-sub mt4">8장이 고비입니다. 그 위로는 큰 차이가 없으니
    <b>여덟 장을 잘 고르시는 편</b>이 낫습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= PR0503 프로필 관리 > 프로필 완성도 ================= */
P['PR0503'] = () => {
  const 항목 = [
    ['프로필 사진', true, '+3위', ''],
    ['자기소개 (100자 이상)', true, '+2위', ''],
    ['활동 지역', true, '+1위', ''],
    ['가격표', false, '<b>+4위</b>', '가장 크게 오릅니다'],
    ['작업 사진 8장 이상', false, '+3위', '지금 3장'],
    ['자격증·경력 증빙', false, '+2위', ''],
    ['영업 시간', false, '+1위', ''],
  ];
  const 찬것 = 항목.filter(([, ok]) => ok).length;
  const pct = Math.round(찬것 / 항목.length * 100);

  const body = `
${U.pageHd('프로필 완성도', `${pct}% · ${찬것} / ${항목.length}`)}

${U.card('', `${U.progress(pct)}
  <p class="t-sub mt3">완성도는 노출 순위의 <b>15%</b>를 차지합니다.
    지금 <b>11위</b>인데, 다 채우시면 <b class="acc">4위</b>쯤까지 오릅니다.</p>`)}

${U.card('남은 항목', `<div class="list">
  ${항목.map(([나, ok, 효과, 메모]) => `<div class="row-item${ok ? ' is-off' : ''}">
    ${ok ? U.badge('완료', 'b-ok') : U.badge('아직', 'b-mut')}
    <span class="grow"><b>${나}</b>
      ${메모 ? `<span class="t-sub" style="display:block">${메모}</span>` : ''}</span>
    <b class="acc nowrap">${효과}</b>
    ${ok ? '<span class="muted">✓</span>' : U.btn('채우기', { cls: 'btn-ghost btn-sm', href: 'PR-05' })}
  </div>`).join('')}
</div>`, { cls: 'mt6' })}

${U.card('가격표부터 채우세요', `<p class="t-sub">가장 크게 오르고, 손님이 가장 많이 봅니다.
  <b>시작가만 적으셔도</b> 됩니다 — 정확한 값은 견적에서 정하시면 됩니다.</p>
  <p class="t-sub mt3">가격표가 있는 고수는 프로필 조회에서 견적 요청으로 넘어가는 비율이
    <b>2.1배</b>입니다. 값을 모르면 손님이 묻기를 망설입니다.</p>
  <div class="btns mt4">${U.btn('가격표 쓰기', { cls: 'btn-pri', href: 'PR-05' })}</div>`,
    { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= PR0504 프로필 관리 > 손님 화면 미리보기 ================= */
P['PR0504'] = () => {
  const 나 = PROS[0];

  const body = `
${U.pageHd('손님에게 이렇게 보입니다', '고치실 곳을 눌러 바로 가실 수 있습니다')}

${U.card('', `<div class="row-b wrap-row mb4">
    ${U.tabs(['데스크톱', '모바일'], 0, { pill: true })}
    ${U.btn('미리보기 닫기', { cls: 'btn-ghost btn-sm', href: 'PR-05' })}
  </div>
  <div class="preview-frame">
    ${U.proRow(나, { href: false, heart: false })}
    <div class="box mt4">
      <b>자기소개</b>
      <p class="t-sub mt1">${나.one}</p>
    </div>
    <div class="g4 mt4">${[1, 2, 3].map((i) => U.phWork('pv' + i)).join('')}</div>
    <div class="box box-warn mt4">
      <b>가격표가 비어 있습니다</b>
      <p class="t-sub mt1">손님에게 이 자리가 <b>빈 채로</b> 보입니다.</p>
      ${U.btn('채우러 가기', { cls: 'btn-pri btn-sm', href: 'PR-05' })}
    </div>
  </div>`)}

${U.card('미리보기에서 보이는 것과 안 보이는 것', U.table(['', '손님이 보나'], [
    ['활동명 · 소개 · 사진', '<b>봅니다</b>'],
    ['평점 · 후기 · 응답률', '<b>봅니다</b>'],
    ['인증 배지', '<b>봅니다</b> — 무엇을 확인했는지까지'],
    ['실명 · 생년월일', '<b class="danger">못 봅니다</b>'],
    ['연락처', '<b class="danger">못 봅니다</b> — 고르신 뒤에 안심번호로만'],
    ['크레딧 잔액 · 순위', '<b class="danger">못 봅니다</b>'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0102 새 요청 목록 > 새 요청 없음 ================= */
P['LD0102'] = () => {
  const body = `
${U.pageHd('새 요청이 없습니다', '조건에 맞는 것이 아직 안 왔습니다')}

${U.card('', U.empty('📭', '조건에 맞는 요청이 없어요',
    '지금 조건이면 주당 <b>18건</b>쯤 옵니다. 오늘은 아직 없네요.',
    `${U.btn('받을 조건 넓히기', { href: 'PR0403', cls: 'btn-pri btn-lg' })}
     ${U.btn('활동 지역 넓히기', { href: 'PR0203', cls: 'btn-ghost btn-lg' })}`))}

${U.card('넓히면 얼마나 늘어나나', U.table(['이렇게 하면', '주당 요청'], [
    ['지금 조건', '<b>18건</b>'],
    ['예산 하한을 10만원으로', '<b class="acc">+9건</b>'],
    ['마포·성동구 추가', '<b class="acc">+14건</b>'],
    ['「당일 요청」도 받기', '<b class="acc">+6건</b>'],
  ]), { cls: 'mt6' })}

${U.banner('info', '🔔', `<b>알림을 켜 두시면 먼저 보십니다.</b>
  <p class="t-sub mt1">견적 자리는 <b>선착순</b>입니다. 알림을 받고 <b>10분 안에</b> 보내는 고수의
  채택률이 그렇지 않은 쪽보다 <b>2.4배</b> 높습니다.</p>`,
    { right: U.btn('알림 설정', { cls: 'btn-pri', href: 'LD0105' }) })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0103 새 요청 목록 > 견적 자리 마감 ================= */
P['LD0103'] = () => {
  const body = `
${U.pageHd('견적 자리가 찼습니다', '먼저 온 5명이 채웠습니다')}

${U.banner('warn', '🚪', `<b>이 요청은 견적을 보낼 수 없습니다.</b>
  <p class="t-sub mt1">한 요청에 <b>5명</b>까지만 견적을 보낼 수 있습니다.
  요청이 뜬 지 <b>18분</b> 만에 찼습니다.</p>`)}

${U.card('왜 자리를 막나요', U.kv([
    ['손님 쪽', '견적이 열 개 넘게 오면 <b>비교를 포기</b>합니다. 다섯이 적당합니다'],
    ['고수 쪽', '자리를 안 막으면 <b>모두가 크레딧만 쓰고</b> 채택률이 떨어집니다'],
    ['자리 수', '요청 규모에 따라 <b>3~7명</b>으로 다릅니다'],
    ['크레딧', '자리가 없으면 <b>차감되지 않습니다</b> — 쓰지 않은 것입니다'],
  ]), { cls: 'mt6' })}

${U.card('먼저 받으시려면', U.kv([
    ['알림 켜기', '요청이 뜨는 즉시 알려드립니다'],
    ['소리 켜기', '작업 중에도 놓치지 않습니다'],
    ['자동 새로고침', '목록을 열어 두면 <b>30초마다</b> 새로 불러옵니다'],
    ['조건 좁히기', '나에게 맞는 것만 오면 더 빨리 보실 수 있습니다'],
  ]) + `<div class="btns mt4">${U.btn('알림 설정', { cls: 'btn-pri', href: 'LD0105' })}</div>`,
    { cls: 'mt6' })}

${U.sec('비슷한 요청', `<div class="list">
  ${[['원룸 이사 · 강남구', '3자리 남음'], ['투룸 이사 · 서초구', '5자리 남음']].map(([나, 자리]) =>
    `<a class="row-item" href="${U.link('LD-02')}">
      <span class="grow"><b>${나}</b></span>
      ${U.badge(자리, 'b-ok')}<span class="muted">›</span></a>`).join('')}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0104 새 요청 목록 > 관심 없음 처리 ================= */
P['LD0104'] = () => {
  const body = `
${U.pageHd('관심 없음으로 넘기기', '응답률에는 «답한 것»으로 칩니다')}

${U.banner('ok', '👍', `<b>넘기셔도 응답률이 떨어지지 않습니다.</b>
  <p class="t-sub mt1">답을 «안 한 것»이 아니라 «안 맞는다고 답한 것»으로 셉니다.
  그냥 두고 마감되는 것보다 <b>훨씬 낫습니다.</b></p>`)}

${U.card('왜 안 맞으셨나요', `
  ${[
    ['분야가 안 맞아요', '이런 분야를 덜 보여드립니다'],
    ['지역이 멀어요', '이 지역 요청을 덜 보여드립니다'],
    ['예산이 낮아요', '이 금액대를 덜 보여드립니다'],
    ['일정이 안 돼요', '목록에서만 숨깁니다'],
    ['그냥 안 맞아요', '이 요청만 숨깁니다'],
  ].map(([나, 효과]) => `<label class="chk mb3">
    <input type="radio" name="skip"> <span><b>${나}</b>
      <span class="t-sub" style="display:block">${효과}</span></span></label>`).join('')}

  <div class="btns mt-block">
    ${U.btn('넘기기', { cls: 'btn-pri btn-lg', attr: ' data-toast="목록에서 숨겼어요. 비슷한 요청을 덜 보여드립니다"' })}
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'LD-01' })}
  </div>`)}

${U.card('넘긴 요청', `<div class="list">
  ${[['사무실 이사 · 종로구', '지역이 멀어요'], ['용달 · 강남구', '예산이 낮아요']].map(([나, 왜]) =>
    `<div class="row-item is-off">
      <span class="grow"><b>${나}</b>
        <span class="t-sub" style="display:block">${왜}</span></span>
      ${U.btn('되돌리기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="다시 목록에 넣었어요"' })}
    </div>`).join('')}
</div>
<p class="t-sub mt3">마감되기 전이면 언제든 되돌리실 수 있습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0105 새 요청 목록 > 실시간 새 요청 ================= */
P['LD0105'] = () => {
  const body = `
${U.pageHd('새 요청이 왔습니다', '방금 3건')}

${U.banner('ok', '🔔', `<b>새 요청 <b>3건</b> — 모두 자리가 남아 있습니다.</b>
  <p class="t-sub mt1">가장 최근 것은 <b>2분 전</b>에 올라왔습니다. 지금 보내시면 첫 번째입니다.</p>`,
    { right: U.btn('바로 보기', { cls: 'btn-pri', href: 'LD-02' }) })}

${U.card('', `<div class="list">
  ${[
    ['원룸 이사 · 강남구', '2분 전', '0 / 5', 240000],
    ['투룸 이사 · 서초구', '14분 전', '2 / 5', 380000],
    ['용달 · 송파구', '31분 전', '3 / 5', 90000],
  ].map(([나, 언제, 자리, 값], i) => `<a class="row-item${i === 0 ? ' is-new' : ''}" href="${U.link('LD-02')}">
    <span class="grow"><b>${나}</b>${i === 0 ? ` ${U.badge('NEW', 'b-pri')}` : ''}
      <span class="t-sub" style="display:block">${언제} · 견적 ${자리}</span></span>
    <b class="price nowrap">~${U.won(값)}</b>
    <span class="muted">›</span></a>`).join('')}
</div>`, { cls: 'mt6' })}

${U.card('알림 설정', `
  <label class="chk mb3"><input type="checkbox" checked data-toast="앱 푸시를 켰어요">
    <b>앱 푸시</b> <span class="t-sub">— 가장 빠릅니다</span></label>
  <label class="chk mb3"><input type="checkbox" data-toast="소리를 켰어요">
    <b>알림 소리</b> <span class="t-sub">— 작업 중에도 놓치지 않습니다</span></label>
  <label class="chk mb3"><input type="checkbox" checked data-toast="자동 새로고침을 켰어요">
    <b>자동 새로고침</b> <span class="t-sub">— 목록을 열어 두면 30초마다</span></label>
  <label class="chk"><input type="checkbox" checked data-toast="밤에는 안 보냅니다">
    <b>밤에는 보내지 않기</b> <span class="t-sub">— 오후 11시 ~ 오전 7시</span></label>`,
    { cls: 'mt6' })}

${U.card('빨리 보내면 얼마나 유리한가', U.table(['보낸 시점', '채택률'], [
    ['<b>10분 안</b>', '<b class="acc">31%</b>'],
    ['1시간 안', '18%'],
    ['3시간 안', '11%'],
    ['그 뒤', '6%'],
  ]) + `<p class="t-sub mt4">먼저 온 견적을 손님이 <b>먼저 읽습니다.</b>
    값이 조금 비싸도 첫 번째가 유리합니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0202 요청 상세 > 손님 정보 ================= */
P['LD0202'] = () => {
  const body = `
${U.pageHd('이 손님은 어떤 분인가', '고르시기 전에 참고하세요')}

${U.card('', `${U.statRow([
    ['1년 4개월', '가입 기간'],
    ['7건', '이용 횟수'],
    ['★ 4.8', '고수가 준 평점'],
    ['1건', '취소 이력'],
  ])}
  <p class="t-sub mt4">이용 횟수가 많고 평점이 높으면 <b>일이 순조로울 가능성</b>이 큽니다.
    취소 이력이 잦은 분은 참고하셔서 판단하세요.</p>`)}

${U.card('무엇이 보이고 무엇이 안 보이나', U.table(['', '지금', '고르신 뒤'], [
    ['이름', '<b>김O늘</b> (가운데 가림)', '<b>전체</b>'],
    ['연락처', '<b class="danger">안 보임</b>', '<b>안심번호</b>'],
    ['주소', '<b>동까지</b> (강남구 역삼동)', '<b>상세 주소까지</b>'],
    ['요청 내용·사진', '<b>전부</b>', '전부'],
    ['이용 이력·평점', '<b>전부</b>', '전부'],
  ]) + `<p class="t-sub mt4">연락처와 상세 주소는 <b>손님이 고수를 고른 뒤</b>에 열립니다 —
    견적만 보고 연락하실 수는 없습니다.</p>`, { cls: 'mt6' })}

${U.card('평점은 이렇게 매겨집니다', U.kv([
    ['누가', '이 손님을 겪은 <b>고수들이</b> 매깁니다'],
    ['무엇을', '연락이 잘 되나 · 약속을 지키나 · 결제가 제때 되나'],
    ['손님에게', '자기 평점은 <b>보이지 않습니다</b>'],
    ['공정성', '한 고수가 여러 번 매겨도 <b>한 번</b>만 셉니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0203 요청 상세 > 참고 견적가 ================= */
P['LD0203'] = () => {
  const body = `
${U.pageHd('얼마를 부르면 좋을까', '비슷한 요청의 실제 견적')}

${U.card('', `${U.statRow([
    ['28만원', '평균 견적'],
    ['18만원', '가장 낮음'],
    ['46만원', '가장 높음'],
    ['26만원', '성사된 값의 중앙'],
  ])}
  <p class="t-sub mt4">최근 3개월 <b>강남구 원룸 이사</b> 견적 1,204건 기준입니다.</p>`)}

${U.card('성사된 견적은 어디에 몰려 있나', `${U.table(['금액대', '보낸 견적', '성사', '성사율'], [
    ['20만원 미만', '12%', '8%', '14%'],
    ['<b>20~30만원</b>', '<b>48%</b>', '<b>61%</b>', '<b class="acc">27%</b>'],
    ['30~40만원', '28%', '25%', '19%'],
    ['40만원 이상', '12%', '6%', '11%'],
  ])}
  <p class="t-sub mt4"><b>20~30만원 구간</b>에서 가장 많이 성사됩니다.
    너무 낮게 부르면 오히려 <b>의심을 받습니다</b> — 14% 밖에 안 됩니다.</p>`, { cls: 'mt6' })}

${U.banner('info', '💡', `<b>값보다 «설명»이 더 큽니다.</b>
  <p class="t-sub mt1">같은 금액이라도 <b>무엇이 포함되는지 적은 견적</b>의 성사율이 1.8배입니다.
  「28만원」보다 「28만원 — 포장 자재 포함, 사다리차 별도」가 훨씬 잘 골라집니다.</p>`)}

${U.card('', `<div class="btns">
  ${U.btn('견적 쓰기', { cls: 'btn-pri btn-lg', href: 'LD-03' })}
  ${U.btn('자주 쓰는 문구 불러오기', { cls: 'btn-ghost btn-lg', href: 'LD0302' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0204 요청 상세 > 경쟁 현황 ================= */
P['LD0204'] = () => {
  const body = `
${U.pageHd('지금 상황', '자리가 2개 남았습니다')}

${U.card('', `${U.statRow([
    ['3 / 5', '보낸 견적'],
    ['2자리', '남음'],
    ['22분', '첫 견적까지 걸린 시간'],
    ['1시간 전', '요청이 올라온 시각'],
  ])}
  ${U.progress(60)}
  <p class="t-sub mt3">자리가 다 차면 더 보낼 수 없습니다. <b>지금 보내시면 네 번째</b>입니다.</p>`)}

${U.card('먼저 보낸 견적은', U.table(['순서', '보낸 시각', '손님이 읽었나'], [
    ['1번째', '22분 전', '<b class="success">읽음</b>'],
    ['2번째', '41분 전', '<b class="success">읽음</b>'],
    ['3번째', '8분 전', '아직'],
  ]) + `<p class="t-sub mt4">금액은 서로 보이지 않습니다 — <b>남의 값을 보고 맞추는 것</b>을 막기 위해서입니다.
    손님도 그래야 제대로 비교합니다.</p>`, { cls: 'mt6' })}

${U.card('지금 보내면 어떤가', U.kv([
    ['순서', '<b>4번째</b> — 1시간 안이라 아직 괜찮습니다'],
    ['채택률', '이 시점이면 <b>18%</b>쯤 (10분 안은 31%)'],
    ['크레딧', '<b>3</b> 차감됩니다'],
    ['안 읽히고 마감되면', '크레딧을 <b>돌려드립니다</b>'],
  ]) + `<div class="btns mt4">
    ${U.btn('견적 보내기', { cls: 'btn-pri btn-lg', href: 'LD-03' })}
    ${U.btn('이번엔 넘기기', { cls: 'btn-ghost btn-lg', href: 'LD0104' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0302 견적 보내기 > 자주 쓰는 문구 ================= */
P['LD0302'] = () => {
  const 문구 = [
    ['원룸 기본', '{손님}님 안녕하세요. {서비스} 견적 드립니다.\n포장 자재 포함이고 오전 8시 시작해 점심 전에 마칩니다.', 42],
    ['사다리차 필요할 때', '엘리베이터가 없어 사다리차가 필요합니다. 그 비용을 포함한 금액입니다.', 18],
    ['보관 이사', '보관 기간 1개월 기준입니다. 더 길어지면 월 5만원씩 붙습니다.', 7],
  ];

  const body = `
${U.pageHd('자주 쓰는 문구', '불러와서 고쳐 쓰시면 됩니다')}

${U.card('', `<div class="list">
  ${문구.map(([나, 글, 쓴횟수]) => `<div class="row-item">
    <span class="grow"><b>${나}</b>
      <span class="t-sub" style="display:block">${글.split('\n')[0].slice(0, 40)}… · ${쓴횟수}번 사용</span></span>
    ${U.btn('불러오기', { cls: 'btn-pri btn-sm', attr: ` data-toast="「${나}」를 불러왔어요. 고쳐서 보내세요"` })}
    ${U.btn('고치기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="문구를 고칠 수 있어요"' })}
  </div>`).join('')}
</div>
<div class="btns mt-block">
  ${U.btn('새 문구 저장', { cls: 'btn-ghost', attr: ' data-toast="지금 쓴 내용을 문구로 저장했어요"' })}
</div>`)}

${U.card('바뀌는 자리 (치환 변수)', U.table(['적으시면', '보낼 때'], [
    ['<code>{손님}</code>', '김O늘'],
    ['<code>{서비스}</code>', '원룸·소형 이사'],
    ['<code>{날짜}</code>', '8월 21일 (금)'],
    ['<code>{지역}</code>', '강남구 → 마포구'],
    ['<code>{내이름}</code>', '한결이사'],
  ]) + `<p class="t-sub mt4">중괄호 안은 <b>요청마다 다른 값</b>으로 바뀝니다.
    「안녕하세요」로만 시작하는 견적보다 <b>이름을 부르는 쪽</b>의 채택률이 1.3배입니다.</p>`,
    { cls: 'mt6' })}

${U.banner('warn', '✍', `<b>그대로 보내지 마세요.</b>
  <p class="t-sub mt1">문구는 <b>시작점</b>입니다. 요청서를 읽고 <b>한두 줄만 고쳐도</b>
  「내 요청을 읽었구나」가 전해집니다 — 그게 채택률을 가장 크게 바꿉니다.</p>`)}`;

  return { body, o: { pro: true } };
};

/* ================= LD0303 견적 보내기 > 크레딧 부족 ================= */
P['LD0303'] = () => {
  const body = `
${U.pageHd('크레딧이 모자랍니다', '남은 1 · 필요한 3')}

${U.banner('danger', '🪫', `<b>이 요청에 견적을 보내려면 <b>3 크레딧</b>이 필요한데 <b>1</b>만 남았습니다.</b>
  <p class="t-sub mt1">지금 쓰신 내용은 <b>그대로 저장했습니다.</b> 충전하고 돌아오시면 이어서 보내실 수 있습니다.</p>`,
    { right: U.btn('충전하기', { cls: 'btn-pri', href: 'LD-04' }) })}

${U.card('쓰시던 견적', U.kv([
    ['요청', '원룸 이사 · 강남구 → 마포구'],
    ['금액', '<b class="price">280,000원</b>'],
    ['일정', '8월 21일 (금) 오전 8시'],
    ['저장', `${U.badge('저장됨', 'b-ok')} 방금`],
  ]), { cls: 'mt6' })}

${U.card('충전 묶음', `<div class="list">
  ${[[30, 30000, ''], [70, 65000, '7% 더'], [150, 130000, '13% 더'], [400, 320000, '20% 더']]
    .map(([크, 원, 덤]) => `<label class="row-item chk-row">
      <input type="radio" name="cr"${크 === 70 ? ' checked' : ''} data-toast="${크} 크레딧을 고르셨어요">
      <span class="grow"><b>${크} 크레딧</b>
        ${덤 ? `<span class="t-sub" style="display:block">${덤} 드립니다</span>` : ''}</span>
      <b class="price nowrap">${U.won(원)}</b>
    </label>`).join('')}
</div>
<div class="btns mt-block">
  ${U.btn('충전하고 이어서 보내기', { cls: 'btn-pri btn-lg', attr: ' data-toast="충전 후 견적 화면으로 돌아옵니다"' })}
</div>`, { cls: 'mt6' })}

${U.banner('info', '⏰', `<b>자리가 찰 수 있습니다.</b>
  <p class="t-sub mt1">지금 이 요청은 <b>2자리</b> 남았습니다. 충전하는 사이 찰 수도 있습니다 —
  그때는 크레딧이 차감되지 않으니 다른 요청에 쓰시면 됩니다.</p>`)}`;

  return { body, o: { pro: true } };
};

/* ================= LD0304 견적 보내기 > 견적 미리보기 ================= */
P['LD0304'] = () => {
  const body = `
${U.pageHd('손님에게 이렇게 갑니다', '보내기 전에 확인하세요')}

${U.card('', `<div class="preview-frame">
    ${U.proRow(PROS[0], { href: false, heart: false })}
    <div class="box box-pri mt4">
      <div class="row-b">
        <b>제안 금액</b><b class="price-lg">280,000원</b>
      </div>
      ${U.kv([
        ['일정', '8월 21일 (금) 오전 8시 · 3~4시간'],
        ['포함', '포장 자재 · 인력 2명 · 기본 운반'],
        ['별도', '사다리차 12만원 (엘리베이터 없을 때)'],
      ])}
      <div class="box mt3">
        <p class="t-sub">김O늘님 안녕하세요. 원룸·소형 이사 견적 드립니다.
          포장 자재 포함이고 오전 8시 시작해 점심 전에 마칩니다.
          4층에 엘리베이터가 없다고 하셔서 사다리차 비용을 따로 적어 두었습니다.</p>
      </div>
    </div>
  </div>`)}

${U.card('보내기 전에 확인', U.kv([
    ['금액', '<b>280,000원</b> — 이 지역 평균 28만원'],
    ['크레딧', '<b>3</b> 차감됩니다 (남은 12 → 9)'],
    ['순서', '<b>4번째</b>로 갑니다'],
    ['고칠 수 있나', '손님이 <b>읽기 전까지</b>는 고치실 수 있습니다'],
  ]) + `<div class="btns mt-block">
    ${U.btn('보내기', { cls: 'btn-pri btn-lg', attr: ' data-toast="견적을 보냈어요. 크레딧 3이 차감됐습니다"' })}
    ${U.btn('고치러 돌아가기', { cls: 'btn-ghost btn-lg', href: 'LD-03' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0305 견적 보내기 > 보낸 견적 수정 ================= */
P['LD0305'] = () => {
  const body = `
${U.pageHd('보낸 견적 고치기', '손님이 아직 안 읽었습니다')}

${U.banner('ok', '✏', `<b>아직 고치실 수 있습니다 — 손님이 읽지 않았습니다.</b>
  <p class="t-sub mt1">읽고 나면 고칠 수 없습니다. 그때는 <b>채팅으로 상의</b>하셔야 합니다.</p>`)}

${U.card('지금 보낸 내용', U.kv([
    ['금액', '<b class="price">280,000원</b>'],
    ['일정', '8월 21일 (금) 오전 8시'],
    ['보낸 시각', '8분 전'],
    ['읽음', `${U.badge('아직', 'b-mut')}`],
  ]), { cls: 'mt6' })}

${U.card('고치기', `${U.kv([
    ['금액', `<input class="input" style="width:180px" value="280000" aria-label="금액"> 원`],
    ['일정', `<input class="input" style="width:200px" value="2026-08-21" aria-label="날짜">`],
  ])}
  <textarea class="input mt3" rows="4" aria-label="제안 문구">김O늘님 안녕하세요. 원룸·소형 이사 견적 드립니다.</textarea>
  <div class="btns mt-block">
    ${U.btn('고쳐서 다시 보내기', { cls: 'btn-pri btn-lg', attr: ' data-toast="견적을 고쳤어요. 크레딧은 더 안 빠집니다"' })}
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'LD-03' })}
  </div>`, { cls: 'mt6' })}

${U.card('고쳐도 크레딧은 안 빠집니다', U.kv([
    ['추가 차감', '<b>없습니다</b> — 같은 요청에 대한 견적은 한 번만 셉니다'],
    ['횟수 제한', '읽히기 전까지 <b>몇 번이든</b> 고치실 수 있습니다'],
    ['손님에게', '「고쳤습니다」 표시가 붙습니다 — 몇 번 고쳤는지는 안 보입니다'],
    ['순서', '처음 보낸 순서가 <b>그대로</b>입니다 — 고쳤다고 뒤로 밀리지 않습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0402 크레딧 충전 > 자동 충전 설정 ================= */
P['LD0402'] = () => {
  const body = `
${U.pageHd('자동 충전', '바닥나기 전에 알아서 채웁니다')}

${U.card('', `<label class="chk mb4"><input type="checkbox" checked data-toast="자동 충전을 켰어요">
    <b>자동 충전 켜기</b></label>
  ${U.kv([
    ['이 아래로 떨어지면', `<div class="row-c">
      <input class="input" style="width:110px" value="10" aria-label="기준 잔액"> 크레딧</div>`],
    ['이만큼 채웁니다', `<div class="row-c">
      <input class="input" style="width:110px" value="70" aria-label="충전 수량"> 크레딧 <span class="t-sub">(65,000원)</span></div>`],
    ['결제 수단', `<select class="input" style="width:auto"><option>신한카드 1234</option><option>카카오페이</option></select>`],
    ['한 달 최대', `<div class="row-c">
      <input class="input" style="width:130px" value="300000" aria-label="월 한도"> 원</div>`],
  ])}
  <div class="btns mt-block">
    ${U.btn('저장', { cls: 'btn-pri btn-lg', attr: ' data-toast="자동 충전을 켰어요"' })}
    ${U.btn('끄기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="자동 충전을 껐어요"' })}
  </div>`)}

${U.card('한 달 한도를 두는 까닭', `<p class="t-sub">한도가 없으면 요청이 몰리는 달에
  생각보다 훨씬 많이 나갈 수 있습니다. 한도에 닿으면 <b>충전을 멈추고 알려드립니다</b> —
  그때 직접 판단하시면 됩니다.</p>`, { cls: 'mt6' })}

${U.card('충전에 실패하면', U.kv([
    ['알림', '<b>바로</b> 알려드립니다 — 조용히 넘기지 않습니다'],
    ['다시 시도', '<b>3시간 뒤</b> 한 번 더 해 봅니다'],
    ['두 번 실패하면', '자동 충전을 <b>끕니다</b>. 카드를 확인해 주세요'],
    ['그동안', '남은 크레딧으로는 계속 보내실 수 있습니다'],
  ]), { cls: 'mt6' })}

${U.card('최근 자동 충전', U.table(['날짜', '수량', '금액', '결과'], [
    ['2026-08-02', '70', '65,000원', U.badge('성공', 'b-ok')],
    ['2026-07-18', '70', '65,000원', U.badge('성공', 'b-ok')],
    ['2026-07-03', '70', '—', U.badge('실패 · 한도 초과', 'b-danger')],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0403 크레딧 충전 > 사용 내역 ================= */
P['LD0403'] = () => {
  const 내역 = [
    ['2026-08-10', '차감', -3, '원룸 이사 · 강남구', 12],
    ['2026-08-09', '차감', -3, '투룸 이사 · 서초구', 15],
    ['2026-08-08', '환불', +3, '용달 · 송파구 (안 읽히고 마감)', 18],
    ['2026-08-02', '충전', +70, '자동 충전', 15],
    ['2026-08-01', '차감', -5, '사무실 이사 · 강남구', -55],
  ];

  const body = `
${U.pageHd('크레딧 사용 내역', '남은 12 크레딧')}

${U.card('', `<div class="row-b wrap-row mb4">
    ${U.chips(['최근 1개월', '최근 3개월', '전체'], 0)}
    ${U.btn('엑셀로 받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="내역을 엑셀로 내려받았어요"' })}
  </div>
  ${U.table(['날짜', '구분', '변동', '어디에', '잔액'], 내역.map(([날, 구, 변, 어디, 잔]) => [
    `<span class="num">${날}</span>`,
    U.badge(구, 구 === '충전' ? 'b-ok' : 구 === '환불' ? 'b-pri' : 'b-mut'),
    `<b class="num ${변 > 0 ? 'success' : ''}">${변 > 0 ? '+' : ''}${변}</b>`,
    어디,
    `<span class="num">${Math.abs(잔)}</span>`,
  ]))}`)}

${U.card('이번 달 요약', `${U.statRow([
    ['70', '충전'],
    ['-14', '차감'],
    ['+3', '환불'],
    ['12', '남음'],
  ])}
  <p class="t-sub mt4">이 속도면 <b>1.2일</b> 뒤에 바닥납니다.
    자동 충전을 켜 두시면 끊기지 않습니다.</p>`, { cls: 'mt6' })}

${U.card('환불이 되는 경우', U.kv([
    ['안 읽히고 마감', '손님이 <b>한 번도 안 열어본 채</b> 마감되면 돌려드립니다'],
    ['요청 취소', '손님이 요청 자체를 취소하면 돌려드립니다'],
    ['중복 발송', '시스템 문제로 두 번 나가면 하나는 돌려드립니다'],
    ['안 되는 경우', '읽혔는데 <b>안 골라진 것</b>은 돌려드리지 않습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { pro: true } };
};

/* ================= LD0404 크레딧 충전 > 환불 규정 ================= */
P['LD0404'] = () => {
  const body = `
${U.pageHd('크레딧 환불', '안 쓰신 것은 돌려드립니다')}

${U.card('환불 조건', U.table(['', '조건'], [
    ['대상', '<b>안 쓰신 크레딧</b>만'],
    ['보너스로 받은 것', '<b class="danger">환불되지 않습니다</b> — 덤으로 드린 것입니다'],
    ['수수료', '환불액의 <b>10%</b>'],
    ['최소 금액', '<b>10,000원</b> 이상부터'],
    ['유효기간', '충전일로부터 <b>1년</b> — 지나면 소멸됩니다'],
  ]))}

${U.card('예를 들면', `${U.sumRows([
    ['남은 크레딧', '70 (충전분 65 + 보너스 5)'],
    ['환불 대상', '65 크레딧 = 60,450원'],
    ['수수료 10%', '−6,045원'],
  ], ['돌려받을 금액', '54,405원'])}
  <p class="t-sub mt3">보너스 5는 빠집니다. 수수료를 떼는 까닭은
    충전할 때 <b>결제 대행 수수료</b>가 이미 나갔기 때문입니다.</p>`, { cls: 'mt6' })}

${U.card('신청하는 법', U.timeline([
    ['신청', '아래 버튼으로 신청하세요'],
    ['확인', '남은 크레딧과 보너스를 나눠 계산합니다 (1영업일)'],
    ['입금', '등록하신 계좌로 <b>3~5영업일</b>'],
  ], 0) + `<div class="btns mt4">
    ${U.btn('환불 신청', { cls: 'btn-ghost', attr: ' data-toast="환불을 신청했어요. 1영업일 안에 확인해 드립니다"' })}
    ${U.btn('사용 내역 보기', { cls: 'btn-ghost', href: 'LD0403' })}
  </div>`, { cls: 'mt6' })}

${U.banner('info', '📅', `<b>유효기간을 넘기지 마세요.</b>
  <p class="t-sub mt1">가장 오래된 크레딧이 <b>2027년 3월 12일</b>에 소멸합니다.
  소멸 30일 전에 알려드리지만, 미리 봐 두시는 편이 낫습니다.</p>`)}`;

  return { body, o: { pro: true } };
};
