/* HO 홈 · SE 고수 찾기 — 3뎁스 하위 화면 20장
 *
 * 매칭은 «사람을 고르는» 서비스라, 조건에 맞는 사람이 없을 때가 자주 온다.
 * 그때 막다른 길로 두지 않는 것이 이 메뉴의 전부다 —
 * 조건을 얼마나 풀면 몇 명이 되는지, 요청서를 쓰면 어떻게 되는지를 그 자리에서 말해 준다.
 */
import * as U from './ui.mjs';
import { CATS, HOT_WORDS, PROS, REVIEWS } from './data.mjs';
/* 대표 고수 — PRO 는 «함수»라 그대로 쓰면 undefined 가 찍힌다. 목록의 첫 사람을 쓴다. */
const 대표 = PROS[0];

const P = {};
export default P;
export const PAGES = P;

/* ================= HO0102 홈·비로그인 > 서비스 검색 자동완성 ================= */
P['HO0102'] = () => {
  const 제안 = [
    ['서비스', '원룸 이사', '고수 1,240명'],
    ['서비스', '원룸 청소', '고수 860명'],
    ['분야', '이사·운송', '하위 12종'],
  ];
  const 최근 = ['입주 청소', '에어컨 설치', '수학 과외'];

  const body = `
${U.pageHd('검색 자동완성', '검색창에 「원룸」을 넣은 상태입니다')}

${U.card("", `
  <div class="searchbar lg mb4"><span class="ic">🔍</span>
    <input type="text" value="원룸" aria-label="서비스 검색">
    ${U.btn('찾기', { cls: 'btn-pri' })}</div>

  <p class="t-th mb2">추천</p>
  <div class="list">
    ${제안.map(([종, 말, 부]) => `<a class="row-item" href="${U.link('SE-01')}">
      ${U.badge(종, 종 === '분야' ? 'b-line' : 'b-pri')}
      <span class="grow"><b><span class="hl">원룸</span>${말.replace('원룸', '')}</b>
        <span class="t-sub" style="display:block">${부}</span></span>
      <span class="muted">↗</span></a>`).join('')}
  </div>

  <div data-recent><div class="row-b mt6 mb2"><span class="t-th">최근 검색</span>
    ${U.btn('전체 지우기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="최근 검색어를 모두 지웠어요" data-recent-clear' })}</div>
  ${U.chips(최근.map((k) => `${k} ✕`), -1, { extra: 'data-recent-x data-toast="이 검색어만 지웠어요"' })}</div>

  <p class="t-th mt6 mb2">많이 찾는 것</p>
  ${U.chips(HOT_WORDS, -1, { extra: `data-go="${U.link('SE-01')}"` })}`)}

${U.card("", U.empty('🔍', '「원룸 이사 야간」 결과가 없어요',
    '검색어를 줄여 보시거나, 요청서를 쓰시면 조건에 맞는 고수가 먼저 연락드립니다.',
    `${U.btn('요청서 쓰기', { href: 'RQ-01', cls: 'btn-pri' })}
     ${U.btn('전체 고수 보기', { href: 'SE-01', cls: 'btn-ghost' })}`), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= HO0103 홈·비로그인 > 지역 선택 시트 ================= */
P['HO0103'] = () => {
  const 시 = ['서울', '경기', '인천', '부산', '대구', '대전'];
  const 구 = ['강남구', '서초구', '송파구', '마포구', '용산구', '성동구', '광진구', '영등포구'];

  const body = `
${U.pageHd('지역 고르기', '고수는 활동 지역이 정해져 있어 지역부터 고릅니다')}

${U.card("", `
  ${U.btn('📍 지금 있는 곳으로', { cls: 'btn-pri btn-block btn-lg', attr: ' data-toast="위치를 확인하고 있어요"' })}
  <p class="t-sub mt2 center">브라우저가 위치를 물어봅니다. 허락하지 않으셔도 아래에서 직접 고르실 수 있어요.</p>

  <p class="t-th mt6 mb2">최근에 고른 곳</p>
  ${U.chips(['서울 강남구', '서울 마포구'], 0, { extra: 'data-toast="그 지역으로 바꿨어요"' })}

  <p class="t-th mt6 mb2">시·도</p>
  ${U.chips(시, 0, { extra: 'data-toast="시·도를 골랐어요. 아래에서 구를 고르세요"' })}

  <p class="t-th mt6 mb2">구·군</p>
  ${U.chips(구, 0, { extra: 'data-toast="지역을 정했어요"' })}

  <div class="btns mt-block">
    ${U.btn('서울 강남구로 보기', { cls: 'btn-pri btn-lg', href: 'SE-01' })}
    ${U.btn('전국으로 보기', { cls: 'btn-ghost btn-lg', href: 'SE-01' })}
  </div>`)}

${U.card("", U.kv([
    ['왜 지역이 필요한가', '고수마다 활동 지역이 다릅니다. 지역을 정해야 «갈 수 있는 사람»만 보입니다'],
    ['출장비', '활동 지역 밖이면 출장비가 붙습니다 — 견적에 따로 적힙니다'],
    ['전국 서비스', '온라인 과외·상담처럼 지역이 상관없는 분야는 지역을 안 물어봅니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= HO0104 홈·비로그인 > 위치 권한 거부 ================= */
P['HO0104'] = () => {
  const body = `
${U.pageHd('위치를 못 가져왔습니다', '그래도 쓰실 수 있습니다')}

${U.banner('info', '📍', `<b>위치 권한 없이도 다 되십니다.</b>
  <p class="t-sub mt1">지역만 직접 골라 주시면 그 뒤로는 똑같습니다. 위치는 «가까운 고수를 먼저 보여 주는 데»만 씁니다.</p>`,
    { right: U.btn('지역 고르기', { cls: 'btn-pri', href: 'HO0103' }) })}

${U.card("", `<b>다시 켜고 싶으시면</b>
  ${U.table(['브라우저', '어디서'], [
    ['크롬', '주소창 왼쪽 자물쇠 → 사이트 설정 → 위치 → 허용'],
    ['사파리', '설정 → 웹사이트 → 위치 → 이 사이트 허용'],
    ['안드로이드', '설정 → 앱 → 브라우저 → 권한 → 위치'],
  ])}
  <p class="t-sub mt3">한 번 거부하면 브라우저가 다시 묻지 않습니다 — 설정에서 켜셔야 합니다.</p>`,
    { cls: 'mt6' })}

${U.sec('전국에서 잘하는 고수', `<div class="list">
  ${PROS.slice(0, 4).map((p) => U.proRow(p)).join('')}
</div>`, { cls: 'mt6', more: 'SE-01', moreLabel: '더 보기',
    desc: '지역을 정하시면 가까운 순으로 다시 보여드립니다' })}`;

  return { body, o: {} };
};

/* ================= HO0202 홈·손님 로그인 > 진행 중 요청 없음 ================= */
P['HO0202'] = () => {
  const body = `
${U.pageHd('진행 중인 요청이 없습니다', '새로 맡기실 일이 있으신가요?')}

${U.card("", U.empty('📝', '보내신 요청이 없어요',
    '요청서를 쓰시면 조건에 맞는 고수들이 값을 보내드립니다. <b>3분</b>이면 끝나고, 손님은 무료입니다.',
    `${U.btn('요청서 쓰기', { href: 'RQ-01', cls: 'btn-pri btn-lg' })}
     ${U.btn('고수 둘러보기', { href: 'SE-01', cls: 'btn-ghost btn-lg' })}`))}

${U.sec('지난번에 이용하신 것', `<div class="list">
  <a class="row-item" href="${U.link('MY-01')}">
    ${U.badge('완료', 'b-ok')}
    <span class="grow"><b>원룸 입주 청소</b>
      <span class="t-sub" style="display:block">2026-05-18 · 김도현 고수 · 12만원</span></span>
    ${U.btn('같은 조건으로 다시', { cls: 'btn-ghost btn-sm', attr: ' data-toast="지난 요청서를 불러왔어요"' })}
  </a>
</div>`, { cls: 'mt6' })}

${U.sec('이런 것도 맡기실 수 있어요', `<div class="cats">
  ${CATS.slice(0, 8).map((c) => `<a class="cat" href="${U.link('RQ-01')}">
    <div class="ic">${c.ic}</div><div class="nm">${c.nm}</div><div class="sub">${c.sub}</div></a>`).join('')}
</div>`, { cls: 'mt6', desc: '지난번에 청소를 맡기셨으니 생활 분야를 먼저 보여드립니다' })}`;

  return { body, o: { my: true } };
};

/* ================= HO0203 홈·손님 로그인 > 견적 도착 알림 ================= */
P['HO0203'] = () => {
  const body = `
${U.pageHd('견적이 도착했습니다', '원룸 이사 · 8월 20일')}

${U.banner('ok', '📬', `<b>견적 <span class="big">4개</span>가 왔습니다 — 가장 싼 것은 <b class="acc">28만원</b>입니다.</b>
  <p class="t-sub mt1">첫 견적은 요청서를 보낸 지 <b>22분</b> 만에 왔습니다. 보통 3시간 안에 대여섯 개가 모입니다.</p>`,
    { right: U.btn('견적 비교하기', { cls: 'btn-pri', href: 'QT-01' }) })}

${U.card("", `<div class="list">
  ${PROS.slice(0, 4).map((p, i) => `<a class="row-item" href="${U.link('QT-01')}">
    ${U.phAva(38, p.nm)}
    <span class="grow"><b>${p.nm}</b>
      <span class="t-sub" style="display:block">${U.rateLine(p.r, p.rv)} · 응답률 %</span></span>
    <b class="price nowrap">${U.won([280000, 320000, 350000, 390000][i])}</b>
    <span class="muted">›</span></a>`).join('')}
</div>
<p class="t-sub mt3">아직 <b>2명</b>이 검토 중입니다. 조금 더 기다리시면 견적이 더 올 수 있습니다.</p>`,
    { cls: 'mt6' })}

${U.card("", U.kv([
    ['알림을 언제 보내나', '첫 견적이 왔을 때 한 번, 그 뒤로는 <b>3개씩 모일 때마다</b>'],
    ['너무 잦으면', `아래에서 끄실 수 있습니다 — 견적은 계속 쌓입니다`],
    ['견적 유효기간', '보낸 지 <b>7일</b>. 지나면 고수에게 다시 물어봐야 합니다'],
  ]) + `<div class="btns mt4">
    ${U.btn('이 요청 알림 끄기', { cls: 'btn-ghost', attr: ' data-toast="이 요청의 알림을 껐어요. 견적은 계속 쌓입니다"' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= HO0204 홈·손님 로그인 > 방문 당일 안내 ================= */
P['HO0204'] = () => {
  const body = `
${U.pageHd('오늘 방문 예정입니다', '원룸 이사 · 김도현 고수')}

${U.banner('warn', '🚚', `<b>오늘 오전 9시에 오십니다 — 지금 <b>7시 40분</b>입니다.</b>
  <p class="t-sub mt1">고수가 <b>8시 12분</b>에 출발 예정이라고 알려 왔습니다. 도착까지 약 48분 걸립니다.</p>`,
    { right: U.btn('연락하기', { cls: 'btn-pri', href: 'CH-01' }) })}

${U.card("", `${U.kv([
    ['고수', '<b>김도현</b> · 이사·운송 · ★ 4.9 (128)'],
    ['연락처', '<b class="num">0507-1234-5678</b> — 안심번호라 실제 번호는 서로 보이지 않습니다'],
    ['예상 도착', '<b>오전 9시</b> (교통 상황에 따라 ±15분)'],
    ['금액', '<b>28만원</b> · 결제는 일이 끝난 뒤에'],
  ])}
  <div class="btns mt-block">
    ${U.btn('전화 걸기', { cls: 'btn-pri', attr: ' data-toast="안심번호로 연결합니다"' })}
    ${U.btn('채팅', { cls: 'btn-ghost', href: 'CH-01' })}
    ${U.btn('내 위치 보내기', { cls: 'btn-ghost', attr: ' data-toast="현재 위치를 보냈어요"' })}
  </div>`, { cls: 'mt6' })}

${U.card("", `<b>일정을 바꾸셔야 하면</b>
  <p class="t-sub mt1">당일 변경은 고수가 이미 출발했을 수 있어 <b>바로 연락</b>이 가장 빠릅니다.
  취소하시면 당일 취소 수수료가 붙을 수 있습니다(고수가 정한 정책에 따릅니다).</p>
  <div class="btns mt4">
    ${U.btn('일정 변경 요청', { cls: 'btn-ghost', attr: ' data-toast="변경 요청을 보냈어요. 고수가 확인하면 알려드릴게요"' })}
    ${U.btn('취소 규정 보기', { cls: 'btn-ghost', href: 'PY-03' })}
  </div>`, { cls: 'mt6' })}

${U.card("", `<b>일이 끝나면</b>
  ${U.timeline([
    ['고수가 완료 요청', '일을 마치면 고수가 「완료」를 누릅니다'],
    ['손님이 확인', '확인하시면 결제가 진행됩니다 — <b>확인 전까지 돈이 나가지 않습니다</b>'],
    ['후기 작성', '후기를 남기시면 다음 손님에게 도움이 됩니다'],
  ], 0)}`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= SE0102 고수 목록 > 필터 적용 상태 ================= */
P['SE0102'] = () => {
  const 걸린것 = ['이사·운송', '서울 강남구', '30만원 이하', '★ 4.5 이상'];

  const body = `
${U.pageHd('고수 찾기', `조건 ${걸린것.length}개가 걸려 있습니다`)}

${U.card("", `
  <div class="row-b wrap-row mb4">
    <b>결과 <span class="acc">18명</span> <span class="t-sub">(전체 1,240명 중)</span></b>
    ${U.btn('조건 모두 지우기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="조건을 모두 지웠어요"' })}
  </div>
  ${U.chips(걸린것.map((c) => `${c} ✕`), [0, 1, 2, 3], { extra: 'data-toast="이 조건만 풀었어요"' })}
  <p class="t-sub mt2">칩의 ✕ 를 누르면 그 조건 하나만 풀립니다.</p>
  <label class="chk mt4"><input type="checkbox" data-toast="인증 고수만 보여드릴게요">
    <b>인증 고수만 보기</b> <span class="t-sub">(11명)</span></label>`)}

${U.card("", `<div class="list">
  ${PROS.slice(0, 4).map((p) => U.proRow(p)).join('')}
</div>`, { cls: 'mt6' })}

${U.card("", U.kv([
    ['조건끼리', '<b>모두 만족</b>하는 고수만 보여드립니다'],
    ['같은 축 안에서', '「이사 또는 청소」처럼 하나만 맞아도 보여드립니다'],
    ['인증 고수', '사업자등록 · 신분 · 자격증을 확인한 분입니다'],
    ['0건이 되면', '어느 조건을 풀면 몇 명이 되는지 짚어 드립니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0103 고수 목록 > 지도로 보기 ================= */
P['SE0103'] = () => {
  const body = `
${U.pageHd('지도로 보기', '가까운 고수부터 찾으실 때')}

${U.card("", `<div class="row-b wrap-row mb4">
    ${U.tabs(['목록', '지도'], 1, { pill: true })}
    <div class="row-c">
      ${U.btn('📍 현재 위치로', { cls: 'btn-ghost btn-sm', attr: ' data-toast="현재 위치로 옮겼어요"' })}
      ${U.btn('이 지역 다시 검색', { cls: 'btn-pri btn-sm', attr: ' data-toast="보고 계신 범위에서 다시 찾았어요 — 12명"' })}
    </div>
  </div>
  ${U.ph(['지도 영역 (서울 강남구 중심 · 고수 18명 핀)', 1200, 675])}`)}

${U.card("", `<b>핀을 누르면 이렇게 보입니다</b>
  <div class="list mt3">${U.proRow(PROS[0], { extra: '<span class="t-sub">여기서 2.4km</span>' })}</div>`,
    { cls: 'mt6' })}

${U.card("", U.kv([
    ['핀 위치', '고수의 <b>활동 중심지</b>입니다 — 실제 집 주소가 아닙니다'],
    ['지도를 움직이면', '「이 지역 다시 검색」 버튼이 뜹니다. 누르셔야 다시 찾습니다'],
    ['왜 자동으로 안 하나', '지도를 조금만 움직여도 목록이 계속 바뀌면 비교를 못 합니다'],
    ['거리', '지도 중심에서 잰 직선거리입니다 — 실제 이동 거리와 다릅니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0104 고수 목록 > 목록 로딩 ================= */
P['SE0104'] = () => {
  const 뼈대 = `<div class="row-item sk-row">
    <span class="sk sk-ava"></span>
    <span class="grow"><span class="sk sk-line" style="width:38%"></span>
      <span class="sk sk-line" style="width:62%"></span></span>
    <span class="sk sk-btn"></span></div>`;

  const body = `
${U.pageHd('고수 찾기', '불러오는 중입니다')}

${U.banner('info', '⏳', `<b>빈 화면 대신 «자리»를 먼저 보여 드립니다.</b>
  <p class="t-sub mt1">줄이 들어올 자리를 잡아 두면 내용이 채워질 때 화면이 튀지 않습니다.
  왼쪽 필터는 그대로 두어 조건을 계속 바꾸실 수 있습니다.</p>`)}

${U.card("", `<div class="list">${Array.from({ length: 8 }, () => 뼈대).join('')}</div>
  <div class="center mt6"><span class="spin"></span>
    <p class="t-sub mt2">다음 8명을 불러오고 있어요</p></div>`, { cls: 'mt6' })}

${U.card("", U.kv([
    ['첫 진입', '줄 자리 8개를 회색으로 잡습니다'],
    ['다음 쪽', '목록 아래에 도는 표시만 놓습니다 — 이미 본 줄은 그대로'],
    ['정렬을 바꿨을 때', '맨 위로 올려 드립니다. 순서가 바뀌었는데 중간에 있으면 헷갈립니다'],
    ['3초가 넘으면', '「조금 오래 걸리고 있어요」를 덧붙입니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0105 고수 목록 > 모바일 필터 시트 ================= */
P['SE0105'] = () => {
  const body = `
${U.pageHd('필터', '좁은 화면에서는 아래에서 올라오는 시트로 엽니다')}

${U.banner('info', '📱', `<b>왼쪽 필터 패널을 그대로 좁히지 않습니다.</b>
  <p class="t-sub mt1">720px 아래에서는 조건이 목록을 덮습니다. 시트로 바꾸고,
  <b>적용을 누르기 전까지 목록은 그대로</b> 둡니다 — 고르는 동안 뒤가 바뀌면 비교를 못 합니다.</p>`)}

${U.card("", `<div class="sheet">
  <div class="sheet-hd"><b>필터</b>${U.btn('초기화', { cls: 'btn-ghost btn-sm', attr: ' data-toast="조건을 지웠어요"' })}</div>
  <div class="sheet-bd">
    ${U.accordion([
      { q: '분야 <span class="t-sub">(1개 선택)</span>', a: U.chips(CATS.slice(0, 8).map((c) => c.nm), 0) },
      { q: '지역', a: U.chips(['강남구', '서초구', '송파구', '전체'], 0) },
      { q: '가격대', a: `<div class="row-c">
          <input type="range" class="range" min="0" max="1000000" step="50000" value="300000" data-toast="30만원 이하로 좁혔어요">
          <b class="nowrap">30만원 이하</b></div>` },
    ], 0)}
  </div>
  <div class="sheet-ft">
    <p class="t-sub">이 조건이면 <b class="acc">18명</b>이 나옵니다</p>
    <div class="btns mt2">
      ${U.btn('초기화', { cls: 'btn-ghost btn-lg', attr: ' data-toast="조건을 지웠어요"' })}
      ${U.btn('18명 보기', { cls: 'btn-pri btn-lg', href: 'SE-01' })}
    </div>
  </div>
</div>`)}

${U.card("", `<b>적용 전에 결과 수를 먼저 보여 드립니다</b>
  <p class="t-sub mt1">조건을 하나 바꿀 때마다 버튼의 숫자가 같이 바뀝니다.
  적용하고 나서야 0명인 걸 알면 시트를 다시 열어 하나씩 되돌려야 합니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0202 결과 없음 > 조건 완화 제안 ================= */
P['SE0202'] = () => {
  const 제안 = [
    ['지역을 <b>서울 전체</b>로', '+34명', '출장비가 붙을 수 있습니다'],
    ['가격을 <b>50만원 이하</b>로', '+12명', ''],
    ['평점을 <b>4.0 이상</b>으로', '+7명', ''],
    ['인증 고수 조건 풀기', '+9명', '인증은 안 받았지만 후기가 좋은 분들입니다'],
  ];

  const body = `
${U.pageHd('조건에 맞는 고수가 없습니다', '조건 하나만 풀면 나옵니다')}

${U.banner('warn', '🔎', `<b>「서울 강남구 · 30만원 이하 · ★4.5 이상 · 인증」 네 조건을 모두 만족하는 분이 없습니다.</b>
  <p class="t-sub mt1">가장 많이 늘어나는 것은 <b>지역을 서울 전체로</b> 넓히는 것입니다 — 34명이 됩니다.</p>`)}

${U.card("", `${U.table(
    [{ t: '이렇게 풀면', w: '46%' }, '몇 명', '알아 두실 것'],
    제안.map(([나, 수, 주]) => [나, `<b class="acc">${수}</b>`, `<span class="t-sub">${주 || '—'}</span>`]),
  )}
  <div class="btns mt4">
    ${U.btn('지역만 넓히기', { cls: 'btn-pri', attr: ' data-toast="서울 전체로 넓혔어요 — 34명이 나왔습니다"' })}
    ${U.btn('한 번에 다 풀기', { cls: 'btn-ghost', attr: ' data-toast="조건을 모두 풀었어요 — 1,240명"' })}
  </div>`, { cls: 'mt6' })}

${U.sec('조건을 푼 인기 고수', `<div class="list">
  ${PROS.slice(0, 3).map((p) => U.proRow(p)).join('')}
</div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0203 결과 없음 > 요청서 유도 배너 ================= */
P['SE0203'] = () => {
  const body = `
${U.pageHd('찾는 대신 «받아» 보세요', '요청서를 쓰면 고수가 먼저 연락합니다')}

${U.card("", `<div class="row wrap-row" style="gap:var(--s8)">
    <div class="grow" style="min-width:280px">
      <h2 class="t-sec">직접 고르지 않으셔도 됩니다</h2>
      <p class="t-sub mt2">요청서를 한 장 쓰시면 조건에 맞는 고수들에게 전달됩니다.
        고수가 각자 값을 불러 주면 <b>받아 보고 고르시면</b> 됩니다.</p>
      ${U.statRow([
        ['3분', '작성에 걸리는 시간'],
        ['27분', '첫 견적까지 평균'],
        ['5.4개', '평균 받는 견적 수'],
        ['0원', '손님 비용'],
      ], 'g4 mt6')}
      <div class="btns mt-block">
        ${U.btn('요청서 쓰기', { href: 'RQ-01', cls: 'btn-pri btn-lg' })}
        ${U.btn('조건 바꿔 다시 찾기', { href: 'SE-01', cls: 'btn-ghost btn-lg' })}
      </div>
    </div>
  </div>`)}

${U.card("", `<b>목록에서 고르는 것과 무엇이 다른가</b>
  ${U.table(['', '목록에서 고르기', '요청서 쓰기'], [
    ['누가 먼저', '내가 찾아서 연락', '<b>고수가 먼저 연락</b>'],
    ['값', '고수 가격표 (시작가)', '<b>내 조건에 맞춘 실제 견적</b>'],
    ['걸리는 시간', '바로', '평균 27분'],
    ['비교', '내가 하나씩 열어 봄', '<b>나란히 놓고 비교</b>'],
    ['조건이 까다로우면', '아무도 안 나올 수 있음', '<b>할 수 있는 사람만 답함</b>'],
  ])}`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0302 고수 상세 > 후기 탭 ================= */
P['SE0302'] = () => {
  const 분포 = [{ s: 5, n: 96 }, { s: 4, n: 22 }, { s: 3, n: 7 }, { s: 2, n: 2 }, { s: 1, n: 1 }];
  const 항목 = [['친절', 4.9], ['시간 약속', 4.8], ['마무리', 4.9], ['가격', 4.6]];

  const body = `
${U.pageHd(`${대표.nm} 고수`, '후기 128개')}

${U.tabs([{ label: '소개', go: 'SE-03' }, { label: '후기' }, { label: '가격표', go: 'SE0303' }, { label: '포트폴리오', go: 'SE-04' }], 1)}

${U.card("", U.rateSummary(4.9, 분포), { cls: 'mt4' })}

${U.card("", `<b>항목별로 보면</b>
  <div class="mt3">${항목.map(([나, 점]) => `<div class="bar-row">
    <span class="nowrap" style="width:72px">${나}</span>
    ${U.progress(Math.round(점 / 5 * 100))}
    <b class="nowrap num">${점.toFixed(1)}</b></div>`).join('')}</div>
  <p class="t-sub mt3">가격 항목이 가장 낮습니다 — 싸지 않지만 나머지가 좋다는 뜻입니다.</p>`, { cls: 'mt6' })}

${U.card("", `<div class="row-b wrap-row mb4">
    ${U.tabs(['최신순', '별점 높은순', '도움된순'], 0, { pill: true })}
    <label class="chk"><input type="checkbox" data-toast="사진 후기만 보여드릴게요"> 사진 후기만 (31)</label>
  </div>
  ${REVIEWS.slice(0, 3).map((r) => U.review(r)).join('')}`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0303 고수 상세 > 가격표 탭 ================= */
P['SE0303'] = () => {
  const 표 = [
    ['원룸 이사 (5톤 미만)', '250,000원~', '짐 양에 따라'],
    ['투룸 이사', '380,000원~', '짐 양에 따라'],
    ['사무실 이사', '별도 견적', '현장 확인 후'],
    ['보관 이사 (1개월)', '450,000원~', '보관 기간에 따라'],
  ];
  const 추가 = [
    ['야간 (오후 8시 ~ 오전 8시)', '+30%'],
    ['주말·공휴일', '+20%'],
    ['엘리베이터 없는 3층 이상', '층당 +20,000원'],
    ['활동 지역 밖 출장', '10km 당 +15,000원'],
    ['사다리차', '+120,000원~'],
  ];

  const body = `
${U.pageHd(`${대표.nm} 고수`, '가격표')}

${U.tabs([{ label: '소개', go: 'SE-03' }, { label: '후기', go: 'SE0302' }, { label: '가격표' }, { label: '포트폴리오', go: 'SE-04' }], 2)}

${U.card("", U.table([{ t: '서비스', w: '46%' }, '시작가', '무엇에 따라 달라지나'], 표), { cls: 'mt4' })}

${U.card("", `<b>이럴 때 더 붙습니다</b>
  ${U.table(['조건', '추가'], 추가)}`, { cls: 'mt6' })}

${U.banner('info', '💡', `<b>여기 적힌 것은 «시작가»입니다.</b>
  <p class="t-sub mt1">짐 양·층수·거리에 따라 달라지므로, 정확한 값은 요청서를 쓰시면
  이 고수가 <b>내 조건에 맞춰</b> 보내 드립니다.</p>`,
    { right: U.btn('이 고수에게 견적 요청', { cls: 'btn-pri', href: 'RQ-01' }) })}`;

  return { body, o: {} };
};

/* ================= SE0304 고수 상세 > 휴무·응답 불가 ================= */
P['SE0304'] = () => {
  const body = `
${U.pageHd(`${대표.nm} 고수`, '지금은 요청을 받지 않습니다')}

${U.banner('warn', '🌙', `<b>휴식 중입니다 — <b>8월 18일</b>부터 다시 활동합니다.</b>
  <p class="t-sub mt1">지금 요청을 보내셔도 답이 늦습니다. 다시 활동할 때 알려드릴까요?</p>`,
    { right: U.btn('알림 신청', { cls: 'btn-pri', attr: ' data-toast="8월 18일에 알려드릴게요"' }) })}

${U.card("", `${U.kv([
    ['상태', `${U.badge('휴식 중', 'b-mut')} 2026-08-05 부터`],
    ['다시 활동', '<b>2026-08-18</b> (9일 뒤)'],
    ['그동안', '프로필·후기·가격표는 그대로 보실 수 있습니다'],
    ['이미 진행 중인 일', '영향 없습니다 — 하던 일은 계속합니다'],
  ])}`, { cls: 'mt6' })}

${U.sec('비슷한 고수', `<div class="list">
  ${PROS.slice(0, 4).map((p) => U.proRow(p)).join('')}
</div>`, { cls: 'mt6', desc: '같은 분야 · 같은 지역 · 평점 4.5 이상' })}`;

  return { body, o: {} };
};

/* ================= SE0305 고수 상세 > 신고하기 ================= */
P['SE0305'] = () => {
  const 유형 = [
    ['허위 정보', '경력·자격증·후기가 사실과 다릅니다'],
    ['불친절·부적절한 언행', '대화 중 무례하거나 불쾌한 말을 들었습니다'],
    ['외부 거래 유도', '앱 밖에서 직접 거래하자고 합니다'],
    ['연락 두절', '진행 중인데 연락이 되지 않습니다'],
    ['그 밖에', '위에 없는 문제입니다'],
  ];

  const body = `
${U.pageHd('신고하기', `${대표.nm} 고수`)}

${U.card("", `<p class="t-th mb3">무엇이 문제였나요?</p>
  ${유형.map(([나, 설명]) => `<label class="chk mb3">
    <input type="radio" name="rt"> <span><b>${나}</b>
      <span class="t-sub" style="display:block">${설명}</span></span></label>`).join('')}

  <p class="t-th mt6 mb2">자세히 적어 주세요</p>
  <textarea class="input" rows="4" placeholder="언제 어떤 일이 있었는지 적어 주시면 확인이 빠릅니다" aria-label="신고 내용"></textarea>

  <p class="t-th mt6 mb2">증빙 (선택)</p>
  <label class="btn btn-ghost" style="cursor:pointer">파일 붙이기
    <input type="file" hidden data-toast="파일을 붙였어요"></label>
  <p class="t-sub mt2">대화 화면 사진이 가장 도움이 됩니다. 채팅 기록은 저희가 따로 확인할 수 있습니다.</p>

  <div class="btns mt-block">
    ${U.btn('신고 접수', { cls: 'btn-pri btn-lg', attr: ' data-toast="신고를 접수했어요. 3영업일 안에 결과를 알려드릴게요"' })}
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'SE-03' })}
  </div>`)}

${U.card("", U.kv([
    ['처리 기간', '<b>3영업일</b> 안에 결과를 알려드립니다'],
    ['익명', '신고하신 분이 누구인지 고수에게 알리지 않습니다'],
    ['외부 거래 유도', '가장 무겁게 봅니다 — 사실이면 <b>즉시 활동 정지</b>입니다'],
    ['허위 신고', '반복되면 신고 기능을 제한할 수 있습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0402 포트폴리오 > 사진 크게 보기 ================= */
P['SE0402'] = () => {
  const body = `
${U.pageHd('작업 사진', `${대표.nm} 고수 · 3 / 12`)}

${U.card("", `<div class="lightbox">
    <div class="lb-stage">${U.ph(['작업 사진 (원룸 이사 · 완료 후)', 1200, 900])}</div>
    <div class="row-b mt4">
      ${U.btn('‹ 이전', { cls: 'btn-ghost', attr: ' data-toast="이전 사진"' })}
      <span class="t-sub num">3 / 12</span>
      ${U.btn('다음 ›', { cls: 'btn-ghost', attr: ' data-toast="다음 사진"' })}
    </div>
  </div>`)}

${U.card("", `${U.kv([
    ['작업', '원룸 이사 (강남구 → 마포구)'],
    ['기간', '<b>반나절</b> (오전 9시 ~ 오후 1시)'],
    ['비용대', '<b>28만원</b>'],
    ['한 일', '포장 · 운반 · 배치 · 폐기물 정리'],
  ])}
  <div class="btns mt-block">
    ${U.btn('이 작업과 같은 조건으로 견적 요청', { cls: 'btn-pri btn-lg', href: 'RQ-01' })}
    ${U.btn('닫기', { cls: 'btn-ghost btn-lg', href: 'SE-04' })}
  </div>`, { cls: 'mt6' })}

${U.card("", `<b>사진에 대해</b>
  <p class="t-sub mt1">고수가 직접 올린 것입니다. 손님 얼굴이나 집 주소가 드러나는 사진은
  올릴 때 걸러집니다. 그래도 문제가 있으면 <b>신고</b>해 주세요.</p>
  <div class="btns mt3">${U.btn('이 사진 신고', { cls: 'btn-ghost btn-sm', href: 'SE0305' })}</div>`,
    { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0403 포트폴리오 > 포트폴리오 없음 ================= */
P['SE0403'] = () => {
  const body = `
${U.pageHd('올린 작업 사진이 없습니다', `${대표.nm} 고수`)}

${U.card("", U.empty('📷', '아직 작업 사진이 없어요',
    '최근에 활동을 시작한 고수입니다. 사진은 없지만 후기와 자격은 확인하실 수 있습니다.',
    `${U.btn('후기 보기', { href: 'SE0302', cls: 'btn-pri btn-lg' })}
     ${U.btn('직접 물어보기', { href: 'CH-01', cls: 'btn-ghost btn-lg' })}`))}

${U.card("", `<b>사진이 없다고 못 미더운 것은 아닙니다</b>
  ${U.table(['확인하실 수 있는 것', '이 고수'], [
    ['신분 인증', U.badge('완료', 'b-ok')],
    ['사업자등록', U.badge('완료', 'b-ok')],
    ['자격증', '이사화물 취급 자격'],
    ['후기', '<b>7개</b> · 평균 ★ 4.7'],
    ['활동 시작', '2026년 6월 (3개월째)'],
  ])}
  <p class="t-sub mt3">새로 시작한 고수는 <b>값을 낮게</b> 부르는 경우가 많습니다.
    후기가 적을 뿐 실력이 없는 것은 아닙니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= SE0502 찜한 고수 > 찜 비어 있음 ================= */
P['SE0502'] = () => {
  const body = `
${U.pageHd('찜한 고수가 없습니다', '마음에 드는 분을 담아 두세요')}

${U.card("", U.empty('🔖', '아직 찜한 고수가 없어요',
    '고수 목록이나 상세에서 하트를 누르면 여기에 모입니다.',
    U.btn('고수 둘러보기', { href: 'SE-01', cls: 'btn-pri btn-lg' })))}

${U.card("", `<b>찜해 두면 좋은 점</b>
  ${U.kv([
    ['가격이 바뀌면', '알려드립니다 — 시작가를 내리는 고수가 있습니다'],
    ['한 번에 요청', '찜한 분들에게 <b>같은 요청서를 한 번에</b> 보내실 수 있습니다'],
    ['휴무가 풀리면', '다시 활동할 때 알려드립니다'],
    ['비교', '찜한 분들만 모아 가격·평점을 나란히 보실 수 있습니다'],
  ])}`, { cls: 'mt6' })}

${U.sec('이런 고수는 어떠세요', `<div class="list">
  ${PROS.slice(0, 4).map((p) => U.proRow(p)).join('')}
</div>`, { cls: 'mt6', desc: '최근 보신 분야에서 평점이 높은 순' })}`;

  return { body, o: { my: true } };
};

/* ================= SE0503 찜한 고수 > 여러 명 한 번에 요청 ================= */
P['SE0503'] = () => {
  const body = `
${U.pageHd('한 번에 요청 보내기', '고른 고수 3명 / 최대 5명')}

${U.card("", `<div class="list">
  ${PROS.slice(0, 4).map((p, i) => `<label class="row-item chk-row">
    <input type="checkbox"${i < 3 ? ' checked' : ''} data-toast="${i < 3 ? '뺐어요' : '골랐어요'}">
    ${U.phAva(38, p.nm)}
    <span class="grow"><b>${p.nm}</b>
      <span class="t-sub" style="display:block">${U.rateLine(p.r, p.rv)} · 시작가 ${U.won(p.from)}</span></span>
  </label>`).join('')}
</div>
<p class="t-sub mt3">한 번에 <b>최대 5명</b>까지 보내실 수 있습니다. 더 보내면 답이 늦어집니다 —
  고수도 견적을 쓰는 데 시간이 들기 때문입니다.</p>`)}

${U.card("", `<p class="t-th mb2">공통으로 전할 내용</p>
  <textarea class="input" rows="5" placeholder="무엇을·언제·어디서 하실 일인지 적어 주세요" aria-label="요청 내용"></textarea>
  <p class="t-sub mt2">이 내용이 <b>세 분께 각각 따로</b> 전달됩니다.
    고수끼리는 서로 누가 함께 받았는지 알 수 없습니다.</p>
  <div class="btns mt-block">
    ${U.btn('3명에게 보내기', { cls: 'btn-pri btn-lg', attr: ' data-toast="3명에게 보냈어요. 견적이 오면 알려드릴게요"' })}
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'SE-05' })}
  </div>`, { cls: 'mt6' })}

${U.card("", U.kv([
    ['왜 따로 보내나', '견적은 서로 안 보이는 편이 공정합니다 — 남의 값을 보고 맞추면 비교가 안 됩니다'],
    ['답이 안 오면', '3일 뒤 안 온 분에게 한 번 더 알려드립니다'],
    ['골라야 하나', '아닙니다. 마음에 드는 분이 없으면 그냥 두셔도 됩니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};
