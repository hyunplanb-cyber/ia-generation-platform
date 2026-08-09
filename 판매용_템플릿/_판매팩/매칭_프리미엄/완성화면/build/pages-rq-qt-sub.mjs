/* RQ 요청서 · QT 받은 견적 — 3뎁스 하위 화면 25장
 *
 * 이 서비스의 심장이다. 요청서를 쓰고 → 견적을 받고 → 한 명을 고른다.
 * 그런데 실제로는 견적이 안 오고, 마감되고, 숨기고, 골랐다가 무른다.
 * 그 스물다섯 갈래를 안 그리면 「그때는 어떻게 하죠」가 스물다섯 번 나온다.
 */
import * as U from './ui.mjs';
import { CATS, SUBCATS, PROS, QUOTES } from './data.mjs';

const P = {};
export default P;
export const PAGES = P;

/* ================= RQ0102 서비스 고르기 > 소분류 펼침 ================= */
P['RQ0102'] = () => {
  const 소 = ['원룸 이사', '가정 이사', '사무실 이사', '보관 이사', '용달·화물', '포장만', '짐 정리', '폐기물 처리'];

  const body = `
${U.pageHd('무엇을 맡기시겠어요?', '이사·운송 안에서 하나만 골라 주세요')}

${U.card('', `
  <div class="searchbar mb4"><span class="ic">🔍</span>
    <input type="text" placeholder="원하는 것을 적어 좁혀 보세요" aria-label="소분류 검색"></div>

  <p class="t-th mb2">고른 것</p>
  ${U.chips(['원룸 이사'], 0)}

  <p class="t-th mt6 mb2">이사·운송 (8종)</p>
  <div class="list">
    ${소.map((s, i) => `<label class="row-item chk-row">
      <input type="radio" name="sub"${i === 0 ? ' checked' : ''} data-toast="「${s}」로 골랐어요">
      <span class="grow"><b>${s}</b>${i < 2 ? ` ${U.badge('많이 찾아요', 'b-pri')}` : ''}</span>
      <span class="t-sub">고수 ${[1240, 890, 340, 210, 620, 180, 150, 260][i]}명</span>
    </label>`).join('')}
  </div>

  <div class="btns mt-block">
    ${U.btn('다음', { cls: 'btn-pri btn-lg', href: 'RQ-02' })}
    ${U.btn('대분류 다시 고르기', { cls: 'btn-ghost btn-lg', href: 'RQ-01' })}
  </div>`)}

${U.banner('info', '☝', `<b>하나만 고르실 수 있습니다.</b>
  <p class="t-sub mt1">이사와 청소를 같이 맡기시려면 <b>요청서를 두 장</b> 쓰셔야 합니다.
  분야가 다르면 물어보는 질문도, 답하는 고수도 다르기 때문입니다.</p>`)}`;

  return { body, o: {} };
};

/* ================= RQ0103 서비스 고르기 > 어떤 걸 골라야 할지 모를 때 ================= */
P['RQ0103'] = () => {
  const body = `
${U.pageHd('무엇을 고를지 모르겠다면', '두세 가지만 여쭤보고 찾아 드립니다')}

${U.card('', `
  <p class="t-th mb3">1. 어떤 일인가요?</p>
  ${U.chips(['집을 옮긴다', '집을 치운다', '무언가 고친다', '사람에게 배운다', '사진·영상을 찍는다'], 0)}

  <p class="t-th mt6 mb3">2. 언제 하실 건가요?</p>
  ${U.chips(['이번 주', '이번 달', '한 달 뒤', '아직 미정'], 1)}

  <p class="t-th mt6 mb3">3. 혼자 하시기 어려운 이유는?</p>
  ${U.chips(['짐이 많아서', '시간이 없어서', '장비가 없어서', '전문 기술이 필요해서'], 0)}

  <div class="box box-pri mt6">
    <b>이런 서비스를 찾으시는 것 같아요</b>
    <div class="list mt3">
      <a class="row-item" href="${U.link('RQ-02')}">
        <span class="grow"><b>원룸 이사</b>
          <span class="t-sub" style="display:block">포장·운반·배치까지 · 평균 25~35만원</span></span>
        ${U.badge('추천', 'b-pri')}<span class="muted">›</span></a>
      <a class="row-item" href="${U.link('RQ-02')}">
        <span class="grow"><b>용달·화물</b>
          <span class="t-sub" style="display:block">운반만 · 포장은 직접 · 평균 8~15만원</span></span>
        <span class="muted">›</span></a>
    </div>
  </div>`)}

${U.card('둘이 어떻게 다른가요', U.table(['', '원룸 이사', '용달·화물'], [
    ['포장', '고수가 합니다', '<b>직접 하셔야 합니다</b>'],
    ['운반', '고수가 합니다', '고수가 합니다'],
    ['배치', '고수가 합니다', '<b>직접 하셔야 합니다</b>'],
    ['값', '25~35만원', '<b>8~15만원</b>'],
    ['걸리는 시간', '반나절', '2~3시간'],
  ]), { cls: 'mt6' })}

${U.card('', `<p class="t-sub">그래도 모르시겠으면 물어봐 주세요. 사람이 답해 드립니다.</p>
  <div class="btns mt3">${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'AU-05' })}</div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= RQ0202 요청서 > 객관식 질문 ================= */
P['RQ0202'] = () => {
  const 보기 = [
    ['원룸 (10평 이하)', '침대·책상·옷장 정도', true],
    ['투룸 (10~20평)', '방 2개 + 거실', false],
    ['쓰리룸 이상 (20평~)', '가족 살림 전체', false],
    ['짐만 조금', '박스 몇 개 정도', false],
  ];

  const body = `
${U.pageHd('짐이 어느 정도인가요?', '3 / 7')}

${U.card('', `${U.progress(43)}
  <p class="t-sub mt2">한 번에 한 가지만 여쭤봅니다. 3분이면 끝나요.</p>

  <div class="pick-cards mt6">
    ${보기.map(([나, 설명, 골랐나]) => `<button class="pick-card${골랐나 ? ' on' : ''}" type="button"
      data-toast="「${나}」로 골랐어요. 다음 질문으로 넘어갑니다">
      <b>${나}</b><span class="t-sub">${설명}</span></button>`).join('')}
  </div>

  <div class="btns mt-block">
    ${U.btn('‹ 이전', { cls: 'btn-ghost btn-lg', href: 'RQ-02' })}
    <span class="t-sub" style="align-self:center">고르면 자동으로 넘어갑니다</span>
  </div>`)}

${U.card('이전으로 돌아가도 답이 남습니다', `<p class="t-sub">앞 질문으로 돌아가 고쳐도 뒤에 답한 것은 지워지지 않습니다.
  다만 <b>답에 따라 뒤 질문이 달라지는</b> 경우가 있어, 그때는 바뀐 질문만 다시 여쭤봅니다.</p>
  <p class="t-sub mt3">예를 들어 「짐만 조금」을 고르시면 <b>엘리베이터·층수 질문을 건너뜁니다.</b></p>`,
    { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= RQ0203 요청서 > 날짜·시간 질문 ================= */
P['RQ0203'] = () => {
  const body = `
${U.pageHd('언제 하실 건가요?', '4 / 7')}

${U.card('', `${U.progress(57)}
  <p class="t-th mt6 mb3">희망일 — 여러 날을 고르시면 견적이 더 옵니다</p>
  ${U.phFix('달력 (2026년 8월 · 20·21·23일 선택됨)', '4/3')}
  ${U.chips(['8월 20일 (목) ✕', '8월 21일 (금) ✕', '8월 23일 (일) ✕'], [0, 1, 2])}

  <p class="t-th mt6 mb3">시간대</p>
  ${U.chips(['오전 (9~12시)', '오후 (12~18시)', '저녁 (18시~)', '상관없음'], 0)}

  <label class="chk mt6"><input type="checkbox" data-toast="날짜를 미정으로 두었어요">
    <b>아직 정하지 못했어요</b> <span class="t-sub">— 고수와 상의해서 정하고 싶습니다</span></label>

  <div class="btns mt-block">
    ${U.btn('‹ 이전', { cls: 'btn-ghost btn-lg', href: 'RQ-02' })}
    ${U.btn('다음 ›', { cls: 'btn-pri btn-lg', href: 'RQ-02' })}
  </div>`)}

${U.card('날짜를 여러 개 고르시면 좋은 점', U.kv([
    ['견적 수', '하루만 고르면 평균 3.2개 · <b>세 날을 고르면 5.8개</b>'],
    ['값', '고수가 비어 있는 날에 맞추면 <b>10~20% 싸집니다</b>'],
    ['주말·공휴일', '평일보다 20% 비쌉니다 — 평일을 하나 끼워 두시면 비교가 됩니다'],
    ['미정', '「상의해서 정하겠다」도 괜찮습니다. 다만 견적이 대략치로 옵니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= RQ0204 요청서 > 주소 입력 질문 ================= */
P['RQ0204'] = () => {
  const body = `
${U.pageHd('어디에서 어디로 옮기시나요?', '5 / 7')}

${U.card('', `${U.progress(71)}
  <p class="t-th mt6 mb2">출발지</p>
  <div class="searchbar mb2"><span class="ic">🔍</span>
    <input type="text" value="서울 강남구 테헤란로 123" aria-label="출발지 주소"></div>
  <input class="input" placeholder="상세 주소 (동·호수) — 선택하신 고수에게만 보입니다" aria-label="출발지 상세">

  <p class="t-th mt6 mb2">도착지</p>
  <div class="searchbar mb2"><span class="ic">🔍</span>
    <input type="text" placeholder="도로명 주소로 찾아 주세요" aria-label="도착지 주소"></div>

  <p class="t-th mt6 mb2">최근에 쓰신 주소</p>
  ${U.chips(['서울 마포구 양화로 45', '서울 강남구 테헤란로 123'], -1)}

  <div class="mt6">${U.phFix('지도 (출발지 위치 확인)', '16/9')}</div>

  <div class="btns mt-block">
    ${U.btn('‹ 이전', { cls: 'btn-ghost btn-lg', href: 'RQ-02' })}
    ${U.btn('다음 ›', { cls: 'btn-pri btn-lg', href: 'RQ-02' })}
  </div>`)}

${U.banner('info', '🔒', `<b>정확한 주소는 고수를 «고르신 뒤»에 공개됩니다.</b>
  <p class="t-sub mt1">견적을 받는 동안에는 고수에게 <b>「강남구 테헤란로 일대」</b>까지만 보입니다.
  동·호수는 한 명을 고르시고 나서야 전달됩니다.</p>`)}`;

  return { body, o: {} };
};

/* ================= RQ0205 요청서 > 예산 질문 ================= */
P['RQ0205'] = () => {
  const body = `
${U.pageHd('예산은 어느 정도 생각하세요?', '6 / 7')}

${U.card('', `${U.progress(86)}
  <p class="t-th mt6 mb3">금액대</p>
  ${U.chips(['20만원 이하', '20~30만원', '30~40만원', '40만원 이상', '잘 모르겠어요'], 1)}

  <p class="t-th mt6 mb2">직접 적으셔도 됩니다</p>
  <div class="row-c">
    <input class="input" style="width:160px" placeholder="250000" aria-label="예산 최소"> 원 ~
    <input class="input" style="width:160px" placeholder="350000" aria-label="예산 최대"> 원
  </div>

  <div class="box box-pri mt6">
    <b>이 지역 · 이 조건의 평균은 <span class="price">28만원</span>입니다</b>
    <p class="t-sub mt1">최근 3개월 강남구 원룸 이사 견적 <b>1,204건</b> 기준입니다.
      가장 낮은 값은 18만원, 가장 높은 값은 46만원이었습니다.</p>
  </div>

  <div class="btns mt-block">
    ${U.btn('‹ 이전', { cls: 'btn-ghost btn-lg', href: 'RQ-02' })}
    ${U.btn('다음 ›', { cls: 'btn-pri btn-lg', href: 'RQ-02' })}
  </div>`)}

${U.banner('warn', '💡', `<b>예산을 너무 낮게 적으면 견적이 적게 옵니다.</b>
  <p class="t-sub mt1">평균의 <b>70% 아래</b>로 적으시면 답하는 고수가 절반으로 줍니다.
  「잘 모르겠어요」를 고르시면 고수가 <b>자기 기준으로</b> 값을 부르니, 오히려 비교하기 좋습니다.</p>`)}`;

  return { body, o: {} };
};

/* ================= RQ0206 요청서 > 사진 첨부 질문 ================= */
P['RQ0206'] = () => {
  const body = `
${U.pageHd('사진이 있으면 올려 주세요', '7 / 7 · 건너뛰셔도 됩니다')}

${U.card('', `${U.progress(100)}
  <div class="drop mt6">
    <div class="ic">📷</div>
    <b>여기에 끌어다 놓으세요</b>
    <p class="t-sub mt1">또는 <label style="cursor:pointer;text-decoration:underline">파일 고르기<input type="file" hidden data-toast="사진을 올렸어요"></label></p>
    <p class="t-sub mt2">최대 <b>10장</b> · 한 장 10MB 이하 · JPG · PNG · HEIC</p>
  </div>

  <p class="t-th mt6 mb2">올리신 사진 3장</p>
  <div class="g4">
    ${[1, 2, 3].map((i) => `<div class="thumb-del">${U.phWork('rq' + i)}
      <button class="del" type="button" data-toast="사진을 뺐어요" aria-label="삭제">✕</button></div>`).join('')}
  </div>

  <div class="btns mt-block">
    ${U.btn('요청서 확인하기', { cls: 'btn-pri btn-lg', href: 'RQ-03' })}
    ${U.btn('사진 없이 진행', { cls: 'btn-ghost btn-lg', href: 'RQ-03' })}
  </div>`)}

${U.banner('ok', '📸', `<b>사진이 있으면 견적이 정확해집니다.</b>
  <p class="t-sub mt1">사진을 올린 요청서는 <b>실제 금액과 견적의 차이가 3분의 1</b>로 줍니다.
  현장에 가서 값이 바뀌는 일이 훨씬 적습니다.</p>`)}

${U.card('무엇을 찍으면 좋나요', U.kv([
    ['짐 전체', '방 가운데에서 한 바퀴 — 양을 가늠할 수 있습니다'],
    ['큰 가구', '냉장고·세탁기·장롱은 따로 한 장씩'],
    ['현관과 복도', '큰 가구가 나갈 수 있는지 봅니다'],
    ['건물 앞', '차를 댈 자리가 있는지 — 사다리차가 필요한지 판단합니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= RQ0207 요청서 > 임시 저장·이어 쓰기 ================= */
P['RQ0207'] = () => {
  const body = `
${U.pageHd('쓰시던 요청서가 있습니다', '2026-08-08 22:41 에 저장됐습니다')}

${U.banner('info', '💾', `<b>7개 질문 중 <b>5개</b>까지 답하셨습니다.</b>
  <p class="t-sub mt1">이어서 쓰시면 <b>예산 질문(6/7)</b>부터 시작합니다.</p>`,
    { right: U.btn('이어서 쓰기', { cls: 'btn-pri', href: 'RQ-02' }) })}

${U.card('지금까지 답하신 것', U.kv([
    ['서비스', '이사·운송 › 원룸 이사'],
    ['짐 양', '원룸 (10평 이하)'],
    ['날짜', '8월 20일 · 21일 · 23일 · 오전'],
    ['출발지', '서울 강남구 테헤란로 일대'],
    ['도착지', '서울 마포구 양화로 일대'],
    ['예산', `${U.badge('아직', 'b-mut')}`],
    ['사진', `${U.badge('아직', 'b-mut')}`],
  ]), { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btn('이어서 쓰기', { cls: 'btn-pri btn-lg', href: 'RQ-02' })}
  ${U.btn('처음부터 다시', { cls: 'btn-ghost btn-lg', attr: ' data-toast="저장본을 지우고 처음부터 시작합니다"' })}
</div>`, { cls: 'mt6' })}

${U.card('자동 저장은 이렇게 돕니다', U.kv([
    ['언제', '질문에 답할 때마다 바로'],
    ['어디에', '이 기기의 브라우저에 저장됩니다 — 서버로 보내지 않습니다'],
    ['얼마나', '<b>7일</b> 보관합니다. 보내시면 바로 지웁니다'],
    ['다른 기기', '로그인하셨으면 계정에도 저장되어 다른 기기에서 이어 쓰실 수 있습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= RQ0302 요청서 확인 > 개인정보 제공 동의 ================= */
P['RQ0302'] = () => {
  const body = `
${U.pageHd('고수에게 무엇이 전달되나요', '고르시기 전과 후가 다릅니다')}

${U.card('', U.table(
    [{ t: '항목', w: '28%' }, '견적 받는 동안', '고수를 고른 뒤'],
    [
      ['이름', '<b>성만</b> (김OO)', '<b>전체</b>'],
      ['연락처', `${U.badge('안 보임', 'b-mut')}`, '<b>안심번호</b> (실제 번호 아님)'],
      ['주소', '<b>동까지</b> (강남구 역삼동)', '<b>상세 주소까지</b>'],
      ['요청 내용', '<b>전부</b>', '전부'],
      ['사진', '<b>전부</b>', '전부'],
      ['예산', '<b>전부</b>', '전부'],
    ],
  ))}

${U.banner('info', '🔒', `<b>실제 전화번호는 «끝까지» 공개되지 않습니다.</b>
  <p class="t-sub mt1">고르신 뒤에도 <b>안심번호</b>로만 연결됩니다.
  일이 끝나고 30일이 지나면 그 번호도 끊깁니다.</p>`)}

${U.card('', `<label class="chk"><input type="checkbox" data-gate="agree" data-label="개인정보 제공 동의">
    <b>위 항목이 고수에게 전달되는 것에 동의합니다</b> <span class="t-sub">(필수)</span></label>
  <div class="err-msg mt3" data-gatemsg="agree" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-pri btn-lg is-off" type="button" data-gated="agree"
      data-toast="요청서를 보냈어요">요청서 보내기</button>
    ${U.btn('요청서 고치기', { cls: 'btn-ghost btn-lg', href: 'RQ-02' })}
  </div>
  <p class="t-sub mt3">동의하지 않으시면 요청서를 보낼 수 없습니다 —
    고수가 아무 정보도 없이 견적을 낼 수는 없기 때문입니다.</p>`, { cls: 'mt6' })}

${U.card('동의를 물리고 싶으시면', `<p class="t-sub">요청을 취소하시면 전달된 정보도 함께 지워집니다.
  이미 견적을 보낸 고수에게는 <b>「손님이 요청을 취소했습니다」</b>만 남고 내용은 지워집니다.</p>
  <div class="btns mt3">${U.btn('개인정보 처리방침', { cls: 'btn-ghost btn-sm', href: 'AU-05' })}</div>`,
    { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= RQ0303 요청서 확인 > 전달 대상 미리보기 ================= */
P['RQ0303'] = () => {
  const body = `
${U.pageHd('이 요청서를 받을 고수', '조건에 맞는 분이 18명 있습니다')}

${U.card('', `${U.statRow([
    ['18명', '요청서를 받습니다'],
    ['27분', '첫 견적까지 평균'],
    ['5.4개', '평균 받는 견적'],
    ['0원', '손님 비용'],
  ])}`)}

${U.card('어떤 분들인가요', `${U.table(['', '인원', ''], [
    ['강남구에서 활동', '<b>11명</b>', U.progress(61)],
    ['서초·송파에서 출장 가능', '<b>7명</b>', U.progress(39)],
    ['인증 고수', '<b>13명</b>', U.progress(72)],
    ['평점 4.5 이상', '<b>15명</b>', U.progress(83)],
  ])}`, { cls: 'mt6' })}

${U.sec('이런 분들이 받습니다', `<div class="list">
  ${PROS.slice(0, 3).map((p) => U.proRow(p, { heart: false })).join('')}
</div>`, { cls: 'mt6', desc: '실제로 누가 답할지는 고수가 정합니다' })}

${U.card('대상이 적을 때는', `<p class="t-sub mb4">지금은 18명이라 충분합니다.
  <b>5명 아래</b>가 되면 아래처럼 조건을 넓히시길 권합니다.</p>
  ${U.table(['이렇게 넓히면', '몇 명'], [
    ['날짜를 하루 더 고르면', '<b class="acc">+6명</b>'],
    ['예산을 30만원까지 올리면', '<b class="acc">+9명</b>'],
    ['지역을 서울 전체로 넓히면', '<b class="acc">+34명</b>'],
  ])}`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= RQ0402 요청 완료 > 기다리는 동안 ================= */
P['RQ0402'] = () => {
  const body = `
${U.pageHd('요청서를 보냈습니다', '18명에게 전달됐습니다 · 8분 지남')}

${U.banner('ok', '📮', `<b>보통 <b>27분</b> 안에 첫 견적이 옵니다.</b>
  <p class="t-sub mt1">알림을 켜 두시면 오는 대로 알려드립니다. 창을 닫으셔도 됩니다.</p>`,
    { right: U.btn('알림 설정', { cls: 'btn-pri', href: 'RQ0403' }) })}

${U.card('비슷한 요청은 이 정도였습니다', `${U.statRow([
    ['28만원', '평균 견적가'],
    ['18~46만원', '값의 범위'],
    ['5.4개', '평균 견적 수'],
    ['3시간', '견적이 다 모이기까지'],
  ])}
  <p class="t-sub mt4">최근 3개월 강남구 원룸 이사 <b>1,204건</b> 기준입니다.
    첫 견적이 가장 싼 경우는 <b>28%</b>뿐이니, 서두르지 마시고 두세 개는 받아 보세요.</p>`,
    { cls: 'mt6' })}

${U.sec('요청서를 받은 고수', `<div class="list">
  ${PROS.slice(0, 4).map((p) => U.proRow(p, { heart: false })).join('')}
</div>`, { cls: 'mt6', more: 'RQ-03', moreLabel: '요청서 다시 보기' })}

${U.card('기다리는 동안 하실 수 있는 것', `<div class="btns">
  ${U.btn('요청서 다시 보기', { cls: 'btn-ghost', href: 'RQ-03' })}
  ${U.btn('고수에게 직접 요청', { cls: 'btn-ghost', href: 'SE-01' })}
  ${U.btn('요청 수정·취소', { cls: 'btn-ghost', href: 'RQ-05' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= RQ0403 요청 완료 > 알림 설정 안내 ================= */
P['RQ0403'] = () => {
  const body = `
${U.pageHd('알림을 어떻게 받으시겠어요?', '견적이 오면 알려드립니다')}

${U.banner('warn', '🔕', `<b>지금 브라우저 알림이 꺼져 있습니다.</b>
  <p class="t-sub mt1">이대로 두시면 견적이 와도 <b>직접 들어와 보셔야</b> 알 수 있습니다.</p>`,
    { right: U.btn('바로 켜기', { cls: 'btn-pri', attr: ' data-toast="브라우저가 알림 권한을 물어봅니다"' }) })}

${U.card('', `${[
    ['앱 푸시', '가장 빠릅니다 · 무료', true],
    ['문자', '앱을 안 켜셔도 옵니다 · 무료', true],
    ['이메일', '요약해서 하루 한 번', false],
  ].map(([나, 설명, 켬]) => `<label class="chk mb3">
    <input type="checkbox"${켬 ? ' checked' : ''} data-toast="${나} 알림을 ${켬 ? '껐어요' : '켰어요'}">
    <span><b>${나}</b><span class="t-sub" style="display:block">${설명}</span></span></label>`).join('')}

  <div class="box mt6">
    <label class="chk"><input type="checkbox" checked data-toast="야간에는 안 보냅니다">
      <b>밤에는 보내지 않기</b> <span class="t-sub">오후 10시 ~ 오전 8시</span></label>
    <p class="t-sub mt2">그 시간에 온 견적은 <b>아침 8시에 모아서</b> 한 번에 알려드립니다.</p>
  </div>

  <div class="btns mt-block">
    ${U.btn('저장', { cls: 'btn-pri btn-lg', attr: ' data-toast="알림 설정을 저장했어요"' })}
    ${U.btn('나중에', { cls: 'btn-ghost btn-lg', href: 'QT-01' })}
  </div>`, { cls: 'mt6' })}

${U.card('얼마나 자주 오나요', U.kv([
    ['첫 견적', '왔을 때 바로 한 번'],
    ['그 뒤', '<b>3개씩 모일 때마다</b> — 하나 올 때마다 보내지 않습니다'],
    ['최저가가 바뀌면', '한 번 더 알려드립니다'],
    ['하루 최대', '<b>4번</b>까지만 보냅니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= RQ0502 요청 수정 > 견적 받은 뒤 수정 ================= */
P['RQ0502'] = () => {
  const body = `
${U.pageHd('요청서를 고치시겠어요?', '이미 견적 4개를 받으셨습니다')}

${U.banner('info', '✏', `<b>받은 견적은 사라지지 않습니다.</b>
  <p class="t-sub mt1">고치신 내용이 그 4명에게 다시 전달되고, <b>고수가 값을 고칠 수 있습니다.</b>
  안 고치면 지금 견적이 그대로 남습니다.</p>`)}

${U.card('고치면 이렇게 됩니다', U.table(['', '어떻게 되나'], [
    ['받은 견적 4개', '<b>그대로 남습니다</b> — 「요청이 바뀌었습니다」 표시가 붙습니다'],
    ['그 고수들', '바뀐 내용을 받고 값을 고칠 수 있습니다 (안 고쳐도 됩니다)'],
    ['새 고수', '바뀐 조건에 맞는 분에게 <b>새로 전달됩니다</b>'],
    ['이미 고르신 고수가 있으면', '<b>수정할 수 없습니다</b> — 채팅으로 상의해 주세요'],
  ]), { cls: 'mt6' })}

${U.card('무엇을 고치시겠어요?', `<div class="list">
  ${[['날짜', '8월 20·21·23일'], ['예산', '20~30만원'], ['짐 양', '원룸 (10평 이하)'], ['사진', '3장']]
    .map(([나, 값]) => `<a class="row-item" href="${U.link('RQ-02')}">
      <span class="grow"><b>${나}</b><span class="t-sub" style="display:block">${값}</span></span>
      <span class="muted">고치기 ›</span></a>`).join('')}
</div>`, { cls: 'mt6' })}

${U.banner('warn', '↗', `<b>많이 달라지면 새 요청서가 낫습니다.</b>
  <p class="t-sub mt1">서비스 자체가 바뀌거나(이사 → 청소) 지역이 아주 멀어지면,
  기존 고수들은 답할 수 없습니다. 그때는 <b>새로 쓰시는 편</b>이 견적이 빨리 옵니다.</p>`,
    { right: U.btn('새 요청서 쓰기', { cls: 'btn-ghost', href: 'RQ-01' }) })}`;

  return { body, o: { my: true } };
};

/* ================= RQ0503 요청 수정 > 취소 확인 ================= */
P['RQ0503'] = () => {
  const body = `
${U.pageHd('요청을 취소하시겠어요?', '받은 견적 4개가 사라집니다')}

${U.banner('danger', '⚠', `<b>되돌릴 수 없습니다.</b>
  <p class="t-sub mt1">취소하시면 <b>견적 4개가 모두 사라지고</b>, 고수들에게 「취소되었습니다」가 전달됩니다.
  같은 요청서를 다시 쓰셔도 견적은 처음부터 다시 받으셔야 합니다.</p>`)}

${U.card('사라지는 것', U.kv([
    ['받은 견적', '<b>4개</b> (최저 28만원 · 최고 39만원)'],
    ['고수와 나눈 대화', '2건 — 대화 기록은 남지만 요청과 연결이 끊깁니다'],
    ['요청서 내용', '지워집니다 — 고수에게 전달된 정보도 함께'],
  ]), { cls: 'mt6' })}

${U.card('취소 대신 «보류»는 어떠세요', `<p class="t-sub">보류하시면 <b>견적은 그대로 두고</b> 새 견적만 안 받습니다.
  나중에 다시 여시면 받아 둔 견적에서 고르실 수 있습니다. 견적 유효기간은 <b>7일</b>입니다.</p>
  <div class="btns mt4">${U.btn('취소 말고 보류하기', { cls: 'btn-pri', attr: ' data-toast="요청을 보류했어요. 견적은 그대로 있습니다"' })}</div>`,
    { cls: 'mt6' })}

${U.card('그래도 취소하시겠다면', `<p class="t-th mb3">이유를 알려 주세요</p>
  ${['직접 해결했어요', '다른 곳에서 했어요', '일정이 없어졌어요', '견적이 비싸요', '마음에 드는 고수가 없어요']
    .map((r) => `<label class="chk mb2"><input type="radio" name="cx"> ${r}</label>`).join('')}

  <label class="chk mt6"><input type="checkbox" data-gate="cx" data-label="취소 확인">
    <b>견적 4개가 사라지는 것을 확인했습니다</b></label>
  <div class="err-msg mt3" data-gatemsg="cx" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-danger btn-lg is-off" type="button" data-gated="cx"
      data-toast="요청을 취소했어요">요청 취소하기</button>
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'QT-01' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0102 견적 목록 > 견적 0개(대기 중) ================= */
P['QT0102'] = () => {
  const body = `
${U.pageHd('아직 견적이 없습니다', '보낸 지 12분 지났습니다')}

${U.card('', U.empty('⏳', '고수들이 검토하고 있어요',
    '보통 <b>27분</b> 안에 첫 견적이 옵니다. 지금은 12분 지났으니 조금만 더 기다려 보세요.',
    ''))}

${U.card('평균은 이렇습니다', `${U.table(['지난 시간', '견적이 온 비율'], [
    ['30분', '<b>62%</b>'],
    ['1시간', '<b>81%</b>'],
    ['3시간', '<b>94%</b>'],
    ['하루', '<b>98%</b>'],
  ])}
  <p class="t-sub mt4">밤이나 주말에 보내시면 조금 늦습니다 — 고수도 쉬는 시간이 있습니다.</p>`,
    { cls: 'mt6' })}

${U.card('더 빨리 받고 싶으시면', `${U.table(['이렇게 하면', '대상'], [
    ['날짜를 하루 더 고르면', '<b class="acc">+6명</b>'],
    ['예산을 30만원까지 올리면', '<b class="acc">+9명</b>'],
    ['지역을 서울 전체로', '<b class="acc">+34명</b>'],
  ])}
  <div class="btns mt4">
    ${U.btn('조건 넓히기', { cls: 'btn-pri', href: 'RQ-05' })}
    ${U.btn('고수에게 직접 요청', { cls: 'btn-ghost', href: 'SE-01' })}
    ${U.btn('요청 취소', { cls: 'btn-ghost', href: 'RQ0503' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0103 견적 목록 > 견적 마감됨 ================= */
P['QT0103'] = () => {
  const body = `
${U.pageHd('견적 받기가 끝났습니다', '받으신 견적 4개 중에서 고르시면 됩니다')}

${U.banner('info', '🏁', `<b>요청하신 지 <b>7일</b>이 지나 새 견적은 받지 않습니다.</b>
  <p class="t-sub mt1">받아 두신 <b>4개</b>는 그대로 보실 수 있고, 고르실 수도 있습니다.
  다만 <b>견적 유효기간도 7일</b>이라 고수에게 다시 확인이 필요할 수 있습니다.</p>`)}

${U.card('받아 두신 견적', `<div class="list">
  ${PROS.slice(0, 4).map((p, i) => `<a class="row-item" href="${U.link('QT-03')}">
    ${U.phAva(38, p.nm)}
    <span class="grow"><b>${p.nm}</b>
      <span class="t-sub" style="display:block">${U.rateLine(p.r, p.rv)} · 8월 2일 보냄</span></span>
    ${i === 0 ? U.badge('최저가', 'b-pri') : ''}
    <b class="price nowrap">${U.won([280000, 320000, 350000, 390000][i])}</b>
    <span class="muted">›</span></a>`).join('')}
</div>`, { cls: 'mt6' })}

${U.card('어떻게 하시겠어요', `<div class="btns">
  ${U.btn('견적 비교하기', { cls: 'btn-pri btn-lg', href: 'QT-02' })}
  ${U.btn('기간 연장 요청', { cls: 'btn-ghost btn-lg', attr: ' data-toast="7일 더 받도록 열었어요"' })}
  ${U.btn('새 요청서 쓰기', { cls: 'btn-ghost btn-lg', href: 'RQ-01' })}
</div>
<p class="t-sub mt3">기간을 연장하시면 새 고수에게 다시 전달됩니다.
  다만 일정이 가까워졌으면 답하는 분이 줄 수 있습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0104 견적 목록 > 숨긴 견적 보기 ================= */
P['QT0104'] = () => {
  const 숨김 = [
    ['너무 비쌈', 520000],
    ['후기가 적음', 310000],
  ];

  const body = `
${U.pageHd('숨긴 견적', '2개를 관심 없음으로 두셨습니다')}

${U.tabs([{ label: '받은 견적', cnt: 4, go: 'QT-01' }, { label: '숨긴 견적', cnt: 2 }], 1)}

${U.card('', `<div class="list">
  ${PROS.slice(4, 6).map((p, i) => `<div class="row-item is-off">
    ${U.phAva(38, p.nm)}
    <span class="grow"><b>${p.nm}</b>
      <span class="t-sub" style="display:block">${U.rateLine(p.r, p.rv)} · 숨긴 이유: ${숨김[i][0]}</span></span>
    <b class="price nowrap">${U.won(숨김[i][1])}</b>
    ${U.btn('다시 보기', { cls: 'btn-ghost btn-sm', attr: ` data-toast="${p.nm} 견적을 다시 목록에 넣었어요"` })}
  </div>`).join('')}
</div>
<div class="btns mt6">
  ${U.btn('전체 다시 보기', { cls: 'btn-ghost', attr: ' data-toast="숨긴 견적 2개를 모두 되돌렸어요"' })}
  ${U.btn('받은 견적으로', { cls: 'btn-ghost', href: 'QT-01' })}
</div>`, { cls: 'mt4' })}

${U.card('숨긴다는 것', U.kv([
    ['고수에게', '알리지 않습니다 — 「관심 없음」은 손님만 보십니다'],
    ['되돌리기', '언제든 다시 보실 수 있습니다'],
    ['비교', '숨긴 견적은 비교 표에 안 들어갑니다'],
    ['왜 지우지 않나', '나중에 마음이 바뀌실 수 있고, 값을 견줄 기준으로도 쓰입니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0105 견적 목록 > 새 견적 도착 ================= */
P['QT0105'] = () => {
  const body = `
${U.pageHd('새 견적이 왔습니다', '방금 · 모두 5개')}

${U.banner('ok', '🔔', `<b>새 견적 1개가 도착했습니다 — <b class="acc">26만원</b>으로 <b>최저가가 바뀌었습니다.</b></b>
  <p class="t-sub mt1">직전 최저가는 28만원이었습니다.</p>`,
    { right: U.btn('바로 보기', { cls: 'btn-pri', href: 'QT-03' }) })}

${U.card('', `<div class="list">
  ${PROS.slice(0, 5).map((p, i) => `<a class="row-item${i === 0 ? ' is-new' : ''}" href="${U.link('QT-03')}">
    ${U.phAva(38, p.nm)}
    <span class="grow"><b>${p.nm}</b>${i === 0 ? ` ${U.badge('NEW', 'b-pri')}` : ''}
      <span class="t-sub" style="display:block">${U.rateLine(p.r, p.rv)} · ${i === 0 ? '방금' : `${i}시간 전`}</span></span>
    ${i === 0 ? U.badge('최저가', 'b-ok') : ''}
    <b class="price nowrap">${U.won([260000, 280000, 320000, 350000, 390000][i])}</b>
    <span class="muted">›</span></a>`).join('')}
</div>`, { cls: 'mt6' })}

${U.card('아직 더 올 수 있습니다', `<p class="t-sub">18명 중 <b>5명</b>이 답했습니다. 보통 3시간이면 대여섯 개가 모입니다.
  지금 고르셔도 되고, 조금 더 기다리셔도 됩니다.</p>
  ${U.kv([
    ['첫 견적이 가장 싼 경우', '<b>28%</b>'],
    ['세 번째까지 기다렸을 때 더 싼 값이 나오는 경우', '<b>54%</b>'],
    ['견적이 다 모이는 데', '평균 <b>3시간</b>'],
  ])}`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0202 견적 비교 > 차이 나는 항목만 ================= */
P['QT0202'] = () => {
  const body = `
${U.pageHd('견적 비교', '다른 값만 남겼습니다')}

${U.card('', `<div class="row-b wrap-row mb4">
    ${U.tabs(['전체 보기', '차이 나는 것만'], 1, { pill: true })}
    <span class="t-sub">같은 값인 <b>6줄</b>을 접었습니다</span>
  </div>
  ${U.table(
    [{ t: '', w: '24%' }, '한결이사', '빠른이사', '더클린'],
    [
      ['<b>금액</b>', '<b class="price">28만원</b>', '<b class="price">32만원</b>', '<b class="price">35만원</b>'],
      ['포장 자재', '<b>포함</b>', '별도 3만원', '<b>포함</b>'],
      ['사다리차', '별도 12만원', '<b>포함</b>', '별도 10만원'],
      ['보관 서비스', `${U.badge('없음', 'b-mut')}`, `${U.badge('7일 가능', 'b-ok')}`, `${U.badge('없음', 'b-mut')}`],
      ['도착 시간', '오전 9시', '오전 8시', '<b>오전 10시</b>'],
      ['취소 수수료', '<b>전날까지 무료</b>', '3일 전까지 무료', '전날까지 무료'],
    ],
  )}
  <div class="btns mt4">
    ${U.btn('접은 6줄 펼치기', { cls: 'btn-ghost', attr: ' data-toast="같은 값인 줄도 모두 보여드릴게요"' })}
  </div>`)}

${U.card('접힌 것 (모두 같음)', `<p class="t-sub">인원 2명 · 차량 1톤 · 폐기물 처리 별도 ·
  엘리베이터 사용료 별도 · 보험 가입 · 부가세 포함 — <b>세 곳이 모두 같습니다.</b></p>
  <p class="t-sub mt3">같은 값은 비교에 도움이 안 되므로 기본으로 접어 둡니다.
    <b>다른 곳만 보면 판단이 빨라집니다.</b></p>`, { cls: 'mt6' })}

${U.card('차이가 가장 큰 것', `${U.table(['항목', '차이', '무엇을 뜻하나'], [
    ['<b>사다리차</b>', '<b class="acc">12만원</b>', '빠른이사만 포함 — 3층 이상이면 이게 값을 뒤집습니다'],
    ['금액', '7만원', '가장 싼 곳과 비싼 곳의 차'],
    ['포장 자재', '3만원', '한결·더클린은 포함'],
  ])}
  <p class="t-sub mt4"><b>사다리차를 넣고 다시 계산하면</b> 한결 40만원 · 빠른 32만원 · 더클린 45만원입니다 —
    순위가 뒤집힙니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0203 견적 비교 > 비교에서 빼기 ================= */
P['QT0203'] = () => {
  const body = `
${U.pageHd('비교에서 빼기', '3개를 비교 중입니다')}

${U.card('', `<div class="row-b wrap-row mb4">
    <b>비교 중 <span class="acc">3개</span></b>
    <span class="t-sub">최소 <b>2개</b>는 남아야 합니다</span>
  </div>
  <div class="list">
    ${PROS.slice(0, 3).map((p, i) => `<div class="row-item">
      ${U.phAva(38, p.nm)}
      <span class="grow"><b>${p.nm}</b>
        <span class="t-sub" style="display:block">${U.rateLine(p.r, p.rv)}</span></span>
      <b class="price nowrap">${U.won([280000, 320000, 350000][i])}</b>
      ${U.btn('빼기', { cls: 'btn-ghost btn-sm', attr: ` data-toast="${p.nm} 을 비교에서 뺐어요"` })}
    </div>`).join('')}
  </div>
  <div class="btns mt6">
    ${U.btn('다른 견적 넣기', { cls: 'btn-ghost', href: 'QT-01' })}
    ${U.btn('되돌리기', { cls: 'btn-ghost', attr: ' data-toast="방금 뺀 것을 되돌렸어요"' })}
  </div>`)}

${U.card('넣을 수 있는 견적', `<div class="list">
  ${PROS.slice(3, 5).map((p, i) => `<div class="row-item">
    ${U.phAva(38, p.nm)}
    <span class="grow"><b>${p.nm}</b>
      <span class="t-sub" style="display:block">${U.rateLine(p.r, p.rv)}</span></span>
    <b class="price nowrap">${U.won([390000, 420000][i])}</b>
    ${U.btn('비교에 넣기', { cls: 'btn-ghost btn-sm', attr: ` data-toast="${p.nm} 을 비교에 넣었어요"` })}
  </div>`).join('')}
</div>
<p class="t-sub mt3">한 번에 <b>최대 4개</b>까지 비교하실 수 있습니다. 더 넣으면 표가 좁아져 읽기 어렵습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0204 견적 비교 > 모바일 가로 비교 ================= */
P['QT0204'] = () => {
  const body = `
${U.pageHd('좁은 화면에서 비교하기', '옆으로 밀어 보세요')}

${U.banner('info', '↔', `<b>항목 이름은 왼쪽에 고정됩니다.</b>
  <p class="t-sub mt1">고수만 옆으로 넘어가므로, 무엇을 보고 있는지 잃지 않습니다.</p>`)}

${U.card('', `<div class="cmp-mobile">
    <div class="row-b mb3">
      <b>한결이사</b>
      <span class="dots"><i class="on"></i><i></i><i></i></span>
    </div>
    ${U.table([{ t: '', w: '44%' }, '한결이사'], [
      ['금액', '<b class="price">28만원</b>'],
      ['포장 자재', '포함'],
      ['사다리차', '별도 12만원'],
      ['도착 시간', '오전 9시'],
      ['취소 수수료', '전날까지 무료'],
      ['평점', '★ 4.9 (328)'],
    ])}
    <div class="row-b mt4">
      ${U.btn('‹ 이전', { cls: 'btn-ghost btn-sm', attr: ' data-toast="이전 고수"' })}
      <span class="t-sub">1 / 3</span>
      ${U.btn('다음 ›', { cls: 'btn-ghost btn-sm', attr: ' data-toast="다음 고수"' })}
    </div>
  </div>`)}

${U.card('', `<div class="btns">
  ${U.btn('한 명씩 보기', { cls: 'btn-ghost', attr: ' data-toast="카드를 하나씩 넘겨 봅니다"' })}
  ${U.btn('표로 보기', { cls: 'btn-ghost', href: 'QT-02' })}
</div>`, { cls: 'mt6' })}

${U.banner('ok', '👇', `<b>고르는 버튼은 화면 아래에 붙어 있습니다.</b>
  <p class="t-sub mt1">표를 아무리 내려도 「이 고수로 정하기」가 사라지지 않습니다 —
  비교하다가 위로 다시 올라갈 일이 없게 합니다.</p>`)}`;

  return { body, o: { my: true } };
};

/* ================= QT0302 견적 상세 > 금액 구성 펼침 ================= */
P['QT0302'] = () => {
  const body = `
${U.pageHd('금액이 어떻게 나왔나', '한결이사 · 28만원')}

${U.card('', `${U.sumRows([
    ['기본료 (원룸 · 1톤 차량 1대)', '180,000원'],
    ['인력 2명 (반나절)', '60,000원'],
    ['포장 자재', '포함'],
    ['출장비 (강남 → 마포 8km)', '20,000원'],
    ['엘리베이터 사용', '0원'],
    ['부가세', '포함'],
  ], ['합계', '280,000원'])}`)}

${U.card('항목이 뜻하는 것', U.kv([
    ['기본료', '차량과 기본 작업이 들어갑니다 — 짐 양과 차량 크기로 정해집니다'],
    ['인력', '반나절 기준입니다. 늦어지면 시간당 <b>15,000원</b>씩 붙습니다'],
    ['포장 자재', '박스·완충재·테이프. 이 고수는 값에 포함해 부릅니다'],
    ['출장비', '활동 지역(강남·서초·송파) 밖으로 나갈 때 붙습니다'],
  ]), { cls: 'mt6' })}

${U.card('값이 달라질 수 있는 조건', `${U.table(['이럴 때', '얼마나'], [
    ['엘리베이터가 없고 3층 이상', '층당 <b>+20,000원</b>'],
    ['사다리차가 필요하면', '<b>+120,000원~</b>'],
    ['짐이 예상보다 많으면', '차량 추가 <b>+80,000원</b>'],
    ['폐기물 처리', '품목당 <b>+10,000원~</b>'],
    ['주말·공휴일', '<b>+20%</b>'],
  ])}
  <div class="box mt4"><b>현장에서 값이 바뀌면</b>
    <p class="t-sub mt1">고수는 <b>일을 시작하기 전에</b> 바뀐 금액을 알려야 합니다.
    시작한 뒤에 올려 부르는 것은 규정 위반입니다 — 그런 일이 있으면 신고해 주세요.</p></div>`,
    { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0303 견적 상세 > 취소·환불 규정 ================= */
P['QT0303'] = () => {
  const body = `
${U.pageHd('취소·환불 규정', '한결이사가 정한 규정입니다')}

${U.card('내가 취소할 때', U.table(['언제', '얼마를 돌려받나'], [
    ['<b>3일 전까지</b>', '<b class="success">전액</b>'],
    ['2일 전', '80%'],
    ['<b>전날</b>', '50%'],
    ['<b>당일</b>', '<b class="danger">0% (환불 없음)</b>'],
    ['고수 도착 후', '0% + 출장비 실비'],
  ]))}

${U.card('고수 사정으로 취소될 때', `${U.table(['언제', '어떻게 되나'], [
    ['3일 전까지', '전액 환불 + <b>다른 고수 연결</b>을 도와드립니다'],
    ['전날·당일', '전액 환불 + <b>위약금 30%</b>를 고수가 냅니다'],
    ['연락 두절', '전액 환불 + <b>고수 활동 정지</b>'],
  ])}
  <p class="t-sub mt4">고수 잘못으로 취소되면 <b>손님은 한 푼도 손해 보지 않습니다.</b>
    위약금은 저희가 받아 손님께 드립니다.</p>`, { cls: 'mt6' })}

${U.card('생각이 다를 때는', `${U.timeline([
    ['이야기 나누기', '먼저 채팅으로 상의해 주세요 — 대부분 여기서 풀립니다'],
    ['중재 요청', '안 풀리면 저희가 양쪽 말을 듣고 판단합니다 (평균 2영업일)'],
    ['결정', '결제한 돈은 <b>결정이 날 때까지 저희가 보관</b>합니다'],
    ['처리', '결정대로 환불하거나 지급합니다'],
  ], 0)}
  <div class="box mt4"><b>돈은 일이 끝난 뒤에 나갑니다</b>
    <p class="t-sub mt1">손님이 「완료」를 누르기 전까지 고수에게 넘어가지 않습니다.
    그래서 문제가 생겨도 <b>돌려받을 돈이 남아 있습니다.</b></p></div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0402 고수 선택 > 선택 후 안내 ================= */
P['QT0402'] = () => {
  const body = `
${U.pageHd('한결이사로 정하셨습니다', '이제 일정을 맞추시면 됩니다')}

${U.card('', U.empty('🤝', '연락처가 서로 열렸습니다',
    '안심번호로 연결됩니다 — 실제 전화번호는 서로 보이지 않습니다.',
    `${U.btn('채팅으로 일정 잡기', { href: 'CH-01', cls: 'btn-pri btn-lg' })}
     ${U.btn('전화 걸기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="안심번호로 연결합니다"' })}`))}

${U.card('지금 어떻게 됐나', U.kv([
    ['고른 고수', '<b>한결이사</b> · 28만원'],
    ['나머지 3명', '<b>자동으로 안내가 갔습니다</b> — 따로 연락 안 하셔도 됩니다'],
    ['내 정보', '이름·연락처·상세 주소가 이 고수에게만 전달됐습니다'],
    ['결제', '<b>아직 안 했습니다</b> — 일이 끝난 뒤에 하십니다'],
  ]), { cls: 'mt6' })}

${U.card('다음에 하실 일', U.timeline([
    ['일정 맞추기', '채팅으로 정확한 시간과 주소를 정하세요'],
    ['방문', '고수가 오면 짐과 조건을 확인합니다'],
    ['일 진행', '값이 달라지면 <b>시작 전에</b> 알려 줍니다'],
    ['완료 확인', '끝나면 손님이 확인하고, 그때 결제됩니다'],
    ['후기', '남겨 주시면 다음 손님에게 도움이 됩니다'],
  ], 0), { cls: 'mt6' })}

${U.card('무를 수 있나요', `<p class="t-sub"><b>24시간 안</b>에는 아무 조건 없이 무르실 수 있습니다.
  그 뒤에는 위 취소 규정이 걸립니다.</p>
  <div class="btns mt3">
    ${U.btn('선택 취소', { cls: 'btn-ghost', href: 'QT0403' })}
    ${U.btn('취소 규정 보기', { cls: 'btn-ghost', href: 'QT0303' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};

/* ================= QT0403 고수 선택 > 선택 취소 ================= */
P['QT0403'] = () => {
  const body = `
${U.pageHd('선택을 무르시겠어요?', '고른 지 3시간 지났습니다')}

${U.banner('ok', '⏱', `<b>지금은 아무 조건 없이 무르실 수 있습니다.</b>
  <p class="t-sub mt1">고르신 지 <b>24시간</b> 안이라 수수료가 없습니다.
  남은 시간은 <b>21시간</b>입니다.</p>`)}

${U.card('무르면 이렇게 됩니다', U.kv([
    ['한결이사', '「손님이 선택을 취소했습니다」가 전달됩니다'],
    ['전달된 내 정보', '<b>바로 지워집니다</b> — 연락처와 상세 주소'],
    ['다른 견적 3개', '<b>그대로 살아납니다</b> — 다시 고르실 수 있습니다'],
    ['고수 평가', '<b>영향 없습니다</b> — 고수 잘못이 아니므로 평점에 안 들어갑니다'],
    ['내 이용 기록', '취소 횟수가 늘어납니다. 잦으면 이용이 제한될 수 있습니다'],
  ]), { cls: 'mt6' })}

${U.card('이유를 알려 주세요', `
  ${['다른 고수가 더 나을 것 같아요', '일정이 안 맞아요', '값이 부담돼요', '일이 없어졌어요', '연락이 안 돼요']
    .map((r) => `<label class="chk mb2"><input type="radio" name="qx"> ${r}</label>`).join('')}
  <textarea class="input mt3" rows="2" placeholder="더 하실 말씀 (선택)" aria-label="상세 사유"></textarea>

  <div class="btns mt-block">
    ${U.btn('선택 무르기', { cls: 'btn-danger btn-lg', attr: ' data-toast="선택을 물렀어요. 다른 견적에서 다시 고르실 수 있습니다"' })}
    ${U.btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'QT-04' })}
  </div>`, { cls: 'mt6' })}

${U.card('연락이 안 되는 것이라면', `<p class="t-sub">고수가 하루 넘게 답이 없으면 <b>저희에게 알려 주세요.</b>
  대신 연락해 보고, 그래도 안 되면 취소 횟수에 넣지 않습니다.</p>
  <div class="btns mt3">${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'AU-05' })}</div>`,
    { cls: 'mt6' })}`;

  return { body, o: { my: true } };
};
