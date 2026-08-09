/* CU 강의 개설·영상 업로드 — 3뎁스 하위 화면 13장
 *
 * 강사 쪽 화면이다. 손님 쪽보다 «틀릴 여지»가 훨씬 많다 —
 * 필수값을 빼먹고, 영상을 안 붙이고, 업로드가 끊기고, 검수에서 반려된다.
 * 이걸 안 그리면 강사는 무엇이 잘못됐는지 모른 채 검수 요청만 반복한다.
 */
import * as U from './ui.mjs';
import { MYTEACH, byId } from './data.mjs';

const P = {};
export default P;

/* ================= CU0102 내 강의 목록 > 상태별 필터 ================= */
P['CU0102'] = () => {
  const 상태 = [['작성 중', 2, 'b-mut'], ['검수 대기', 1, 'b-warn'], ['게시 중', 3, 'b-ok'], ['게시 중지', 1, 'b-mut']];
  const 게시중 = MYTEACH.filter((t) => t.st === '게시 중');

  const body = `
${U.pageHd('내 강의', '상태로 걸러 봅니다')}

${U.tabs(상태.map(([나, n]) => ({ label: 나, cnt: n })), 2, { pill: true })}

${U.card('', `<div class="row-b wrap-row mb4" style="gap:var(--s4)">
    <b>게시 중 <span class="pri">${게시중.length}개</span></b>
    <div class="row-c" style="gap:var(--s2)">
      ${U.tabs(['최근 수정순', '수강생 많은순'], 0, { pill: true })}
      ${U.btnSay('필터 해제', '전체 7개를 보여드릴게요', { cls: 'btn-ghost btn-sm' })}
    </div>
  </div>
  <div class="card"><div class="card-bd flush">
  ${게시중.map((t) => {
    const c = byId(t.id);
    return `<a class="lrow" href="${U.link('CU-01')}">
      ${U.ph('강의', 'ph-thumb-sm', t.id)}
      <span class="grow"><b>${c.name}</b>
        <span class="t-sub" style="display:block">수강생 ${U.nf(t.students)}명 · ★ ${t.rate} · 완주율 ${t.done}% · 수정 ${t.edited}</span></span>
      ${U.badge(t.st, t.stCls)}<span class="muted">›</span></a>`;
  }).join('')}
  </div></div>`)}

${U.card('상태가 뜻하는 것', U.kv([
    ['작성 중', '아직 검수를 요청하지 않았습니다. 손님에게 안 보입니다'],
    ['검수 대기', '요청하셨고 저희가 보는 중입니다 — <b>보통 2영업일</b>'],
    ['게시 중', '손님이 살 수 있습니다'],
    ['게시 중지', '새 결제만 막습니다 — <b>이미 산 분들은 계속 보실 수 있습니다</b>'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0103 내 강의 목록 > 개설 강의 없음 ================= */
P['CU0103'] = () => {
  const body = `
${U.pageHd('아직 개설한 강의가 없습니다', '첫 강의를 만들어 보세요')}

${U.card('', U.empty('🎬', '첫 강의를 기다리고 있어요',
    '기본 정보 → 커리큘럼 → 영상 → 검수 요청, 네 단계입니다. 중간에 저장하고 나중에 이어 하셔도 됩니다.',
    `${U.btn('강의 개설 시작', { cls: 'btn-primary btn-lg', href: 'CU-02' })}
     ${U.btnSay('개설 가이드 보기', '가이드 문서를 엽니다', { cls: 'btn-ghost btn-lg' })}`))}

${U.sec('잘 팔리는 강의는 이렇게 생겼습니다', `<div class="g3">
  ${U.card('분량', `<div class="t-sec pri">8~15시간</div>
    <p class="t-sub mt2">너무 짧으면 값을 못 받고, 20시간을 넘으면 완주율이 <b>절반으로</b> 떨어집니다.</p>`)}
  ${U.card('한 차시 길이', `<div class="t-sec pri">10~15분</div>
    <p class="t-sub mt2">출퇴근길에 하나를 끝낼 수 있는 길이입니다. 20분을 넘기면 중간에 멈춥니다.</p>`)}
  ${U.card('미리보기', `<div class="t-sec pri">3차시</div>
    <p class="t-sub mt2">미리보기가 있는 강의는 결제 전환율이 <b>1.7배</b>입니다.</p>`)}
</div>`, { cls: 'mt6' })}

${U.card('검수에서 자주 걸리는 것', U.kv([
    ['음질', '주변 소음이 크면 반려됩니다 — 마이크는 입에서 20cm 안쪽으로'],
    ['화면 글씨', '1080p 에서 읽히지 않으면 반려됩니다 — 코드는 폰트를 키우세요'],
    ['저작권', '남의 자료를 그대로 쓰면 반려됩니다 — 출처를 밝혀도 안 됩니다'],
    ['첫 차시', '오리엔테이션이 없으면 반려됩니다 — 무엇을 배우는지 먼저 말해 주세요'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0202 기본 정보 > 썸네일 업로드 ================= */
P['CU0202'] = () => {
  const body = `
${U.pageHd('썸네일', '목록에서 가장 먼저 보이는 것입니다')}

${U.card('', `<div class="drop-zone">
    <div style="font-size:32px">🖼</div>
    <b class="mt3">여기에 파일을 끌어다 놓으세요</b>
    <p class="t-sub mt1">또는 <label style="cursor:pointer;text-decoration:underline">파일 고르기<input type="file" hidden data-toast="썸네일을 올렸어요"></label></p>
  </div>
  <div class="mt4">${U.kv([
    ['권장 크기', '<b>1200 × 900</b> (4:3)'],
    ['형식', 'JPG · PNG · WebP'],
    ['용량', '2MB 이하'],
    ['피할 것', '글씨를 가장자리에 두지 마세요 — 카드에서 잘립니다'],
  ])}</div>`)}

${U.sec('올린 뒤 이렇게 보입니다', `<div class="g3">
  <div>
    <p class="t-th mb2">목록 카드</p>
    ${U.ph('썸네일 1200×900', 'ph-34', 'th1')}
  </div>
  <div>
    <p class="t-th mb2">가로 카드</p>
    ${U.ph('썸네일 1200×900', 'ph-169', 'th1')}
  </div>
  <div>
    <p class="t-th mb2">내 강의실 줄</p>
    ${U.ph('썸네일', 'ph-thumb', 'th1')}
  </div>
</div>
<p class="t-sub mt4">한 장으로 세 군데에 쓰입니다. <b>가운데에 중요한 것을 두세요</b> — 잘리는 쪽이 다릅니다.</p>`,
    { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btnSay('자르기', '자르기 창을 엽니다', { cls: 'btn-ghost' })}
  ${U.btnSay('교체', '다른 파일을 고르세요', { cls: 'btn-ghost' })}
  ${U.btnSay('삭제', '썸네일을 지웠어요', { cls: 'btn-ghost' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0203 기본 정보 > 필수값 누락 ================= */
P['CU0203'] = () => {
  const 칸 = [
    ['강의명', true, '', '무엇을 배우는지 한 줄로 — 40자 안쪽'],
    ['카테고리', true, '', '고르지 않으셨습니다'],
    ['난이도', false, '입문', ''],
    ['썸네일', true, '', '아직 올리지 않으셨습니다'],
    ['한 줄 소개', false, '엑셀을 처음 여는 분도 따라올 수 있게', ''],
  ];
  const 빈칸 = 칸.filter(([, 필수, 값]) => 필수 && !값).length;

  const body = `
${U.pageHd('아직 못 채운 칸이 있습니다', `필수 ${빈칸}개가 비어 있습니다`)}

${U.banner('danger', '✏', `<b>강의명 · 카테고리 · 썸네일</b>을 채우셔야 다음으로 갑니다.
  <p class="t-sub mt1">첫 번째 빈칸으로 옮겨 드렸습니다. 지금까지 쓰신 내용은 그대로 있습니다.</p>`,
    U.btnSay('첫 빈칸으로', '강의명 칸으로 옮겼어요', { cls: 'btn-primary' }))}

${U.card('', `${칸.map(([이름, 필수, 값, 안내]) => `
  <div class="mb4">
    <label class="t-th">${이름}${필수 ? ' <span class="danger">*</span>' : ' <span class="t-sub">(선택)</span>'}</label>
    ${이름 === '썸네일'
      ? `<div class="drop-zone${값 ? '' : ' err'} mt2" style="min-height:120px">
          <span class="t-sub">${값 || '파일을 끌어다 놓거나 눌러서 고르세요'}</span></div>`
      : `<input class="input mt2${필수 && !값 ? ' err' : ''}" value="${값}"
          placeholder="${안내 || ''}" aria-label="${이름}"${필수 && !값 ? ' aria-invalid="true"' : ''}>`}
    ${필수 && !값 ? `<p class="err-msg mt2">⚠ ${안내}</p>` : ''}
  </div>`).join('')}

  <div class="btns mt7">
    <button class="btn btn-primary btn-lg is-off" type="button" data-gated="basic"
      data-toast="다음 단계(커리큘럼)로 갑니다">다음 단계</button>
    ${U.btnSay('임시 저장', '지금까지 쓰신 것을 저장했어요', { cls: 'btn-ghost btn-lg' })}
  </div>
  <p class="t-sub mt2">임시 저장은 언제든 하실 수 있습니다 — 필수값이 비어 있어도 됩니다.</p>`)}`;

  return { body, o: { admin: true } };
};

/* ================= CU0204 기본 정보 > 가격·할인 설정 ================= */
P['CU0204'] = () => {
  const 정가 = 132000, 할인 = 40;
  const 판매가 = Math.round(정가 * (1 - 할인 / 100) / 1000) * 1000;
  const 수수료 = Math.round(판매가 * 0.2);
  const 정산 = 판매가 - 수수료;

  const body = `
${U.pageHd('가격', '수수료를 뗀 예상 정산액을 함께 보여드립니다')}

${U.card('', `${U.kv([
    ['무료 강의', `<label class="row-c" style="gap:var(--s2);cursor:pointer">
      <input type="checkbox" data-toast="무료로 바꾸면 아래 가격 칸이 잠깁니다"> 무료로 열기</label>`],
    ['정가', `<input class="input" style="width:180px" value="${U.nf(정가)}" aria-label="정가"> 원`],
    ['할인율', `<div class="row-c" style="gap:var(--s3)">
      <input type="range" class="slider" min="0" max="70" step="5" value="${할인}" data-toast="할인율을 바꿨어요">
      <b class="nowrap num">${할인}%</b></div>`],
    ['판매가', `<b class="t-sec pri">${U.won(판매가)}</b> <span class="t-sub">(자동 계산)</span>`],
    ['할인 기간', `<input class="input" style="width:150px" value="2026-08-09" aria-label="시작"> ~
      <input class="input" style="width:150px" value="2026-09-30" aria-label="종료">`],
  ])}`)}

${U.card('한 건 팔리면 얼마가 들어오나', `${U.sumRows([
    ['판매가', U.won(판매가)],
    ['플랫폼 수수료 20%', `−${U.won(수수료)}`],
  ], ['예상 정산액', U.won(정산)])}
  <div class="box mt4"><b>세금은 여기서 빼지 않았습니다</b>
    <p class="t-sub mt1">개인이시면 지급할 때 <b>3.3%</b>를 원천징수합니다 —
    실제 입금은 <b>${U.won(Math.round(정산 * 0.967))}</b> 쯤입니다. 사업자면 세금계산서를 끊으시면 됩니다.</p></div>`,
    { cls: 'mt6' })}

${U.card('값을 정하실 때', U.kv([
    ['비슷한 강의', '이 분야 평균 <b>68,000원</b> · 상위 10% 는 120,000원'],
    ['할인', '상시 30~40%가 가장 많습니다. 70%를 넘기면 오히려 덜 팔립니다'],
    ['무료', '수강생은 빨리 모이지만 완주율이 <b>1/4</b>로 떨어집니다'],
    ['값 올리기', '이미 산 분에게는 소급되지 않습니다 — 언제든 올리셔도 됩니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0302 커리큘럼 > 순서 변경 ================= */
P['CU0302'] = () => {
  const 차시 = [
    ['오리엔테이션', '8:12'], ['실습 파일 내려받기', '3:40'],
    ['엑셀 버전 확인', '5:02'], ['셀 서식과 표 변환', '14:20'],
  ];

  const body = `
${U.pageHd('순서 바꾸기', '왼쪽 손잡이를 잡고 끌어 옮기세요')}

${U.banner('info', '⇅', `<b>놓으면 번호가 저절로 다시 매겨집니다.</b>
  <p class="t-sub mt1">3번을 1번 자리로 옮기면 나머지가 하나씩 밀립니다 — 번호를 손으로 고치지 않으셔도 됩니다.</p>`)}

${U.card('1챕터 · 시작하기 전에', `<div class="card"><div class="card-bd flush">
  ${차시.map(([이름, 길이], i) => `<div class="lrow drag-row${i === 1 ? ' is-dragging' : ''}">
    <span class="drag-h" aria-label="끌어 옮기기">⠿</span>
    <span class="muted num" style="width:28px">${i + 1}</span>
    <span class="grow"><b>${이름}</b></span>
    <span class="t-sub num">${길이}</span>
    ${U.btnSay('삭제', '차시를 지웁니다', { cls: 'btn-ghost btn-sm' })}
  </div>${i === 0 ? '<div class="drop-line" aria-hidden="true"></div>' : ''}`).join('')}
</div></div>
<p class="t-sub mt3">파란 선이 <b>놓았을 때 들어갈 자리</b>입니다.</p>`, { cls: 'mt6' })}

${U.card('', `<div class="row-b wrap-row" style="gap:var(--s4)">
  <span class="t-sub">✓ 순서를 바꿀 때마다 저장됩니다 · 마지막 저장 20:41:08</span>
  <div class="btns">
    ${U.btnSay('되돌리기', '방금 바꾼 순서를 되돌렸어요', { cls: 'btn-ghost' })}
    ${U.btnSay('챕터 사이로 옮기기', '다른 챕터로 옮길 수 있어요', { cls: 'btn-ghost' })}
  </div>
</div>`, { cls: 'mt6' })}

${U.card('이미 듣고 있는 사람은 어떻게 되나', `<p class="t-sub">게시 중인 강의의 순서를 바꾸면
  <b>수강생이 보던 자리도 함께 옮겨집니다.</b> 12차시를 듣던 사람은 그 차시가 9번이 되어도
  같은 영상에서 이어 봅니다 — 번호가 아니라 «차시 자체»를 따라갑니다.</p>
  <p class="t-sub mt3">다만 순서가 크게 바뀌면 수강생에게 알림이 나갑니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0303 커리큘럼 > 영상 미연결 경고 ================= */
P['CU0303'] = () => {
  const 미연결 = [['2챕터', '5차시', '데이터 유효성 검사'], ['3챕터', '9차시', '계산 필드 추가'], ['4챕터', '12차시', '최종 과제 안내']];

  const body = `
${U.pageHd('영상이 안 붙은 차시가 있습니다', `${미연결.length}개 차시가 비어 있습니다`)}

${U.banner('danger', '🎞', `<b>영상이 없으면 검수를 요청하실 수 없습니다.</b>
  <p class="t-sub mt1">차시 30개 중 <b>${미연결.length}개</b>가 비어 있습니다. 붙이시면 요청 버튼이 열립니다.</p>`)}

${U.card('비어 있는 차시', `<div class="card"><div class="card-bd flush">
  ${미연결.map(([챕, 차, 이름]) => `<div class="lrow">
    <span class="badge b-danger">⚠ 영상 없음</span>
    <span class="grow"><b>${이름}</b>
      <span class="t-sub" style="display:block">${챕} · ${차}</span></span>
    ${U.btn('영상 붙이기', { cls: 'btn-ghost btn-sm', href: 'CU-04' })}
  </div>`).join('')}
</div></div>`, { cls: 'mt6' })}

${U.card('', `<div class="btns">
  <button class="btn btn-primary btn-lg is-off" type="button" data-gated="submit"
    data-toast="검수를 요청했어요. 보통 2영업일 걸립니다">검수 요청</button>
  ${U.btn('영상 업로드로', { cls: 'btn-ghost btn-lg', href: 'CU-04' })}
</div>
<p class="t-sub mt2">비어 있는 차시가 0개가 되면 요청 버튼이 열립니다.</p>`, { cls: 'mt6' })}

${U.card('영상 없이 두는 방법도 있습니다', U.kv([
    ['차시 지우기', '그 차시가 필요 없다면 지우면 됩니다'],
    ['임시 숨김', '차시를 숨기면 검수에서 빠집니다 — 나중에 영상을 붙여 열 수 있습니다'],
    ['자료만 있는 차시', '영상 없이 첨부 자료만 두는 차시는 <b>「자료 차시」</b>로 바꿔 주세요'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0304 커리큘럼 > 차시 삭제 확인 ================= */
P['CU0304'] = () => {
  const body = `
${U.pageHd('이 차시를 지우시겠어요?', '되돌릴 수 없습니다')}

${U.banner('danger', '⚠', `<b>게시 중인 강의입니다 — 128명이 듣고 있습니다.</b>
  <p class="t-sub mt1">지금 지우면 <b>수강생 화면에서 바로 사라집니다.</b>
  이 차시를 이미 들은 분들의 진도는 그대로 두지만, 전체 차시가 줄어 <b>진도율이 올라갑니다.</b></p>`)}

${U.card('지울 것', `${U.kv([
    ['차시', '<b>12차시 · 슬라이서로 걸러 보기</b>'],
    ['연결된 영상', 'slicer_lesson12.mp4 (312MB) — 함께 지워집니다'],
    ['첨부 자료', '없음'],
    ['이 차시를 들은 사람', '<b>84명</b>'],
    ['이 차시에 달린 질문', '<b>3건</b> — 질문은 남고 「지워진 차시」로 표시됩니다'],
    ['이 차시에 쓴 노트', '<b>21개</b> — 수강생 노트는 지우지 않습니다'],
  ])}`, { cls: 'mt6' })}

${U.card('진도율이 이렇게 바뀝니다', `${U.table(['', '지금', '지운 뒤'], [
    ['전체 차시', '30차시', '<b>29차시</b>'],
    ['12차시까지 들은 사람', '40% (12/30)', '<b class="success">41% (12/29)</b>'],
    ['이 차시만 안 들은 사람', '96% (29/30)', '<b class="success">100% (29/29)</b>'],
  ])}
  <p class="t-sub mt4">수료 조건(80%)에 걸쳐 있던 분들이 갑자기 수료 대상이 될 수 있습니다.</p>`,
    { cls: 'mt6' })}

${U.card('', `<label class="row-c" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-gate="del" data-label="삭제 확인">
    <b>위 내용을 확인했고, 지우겠습니다</b></label>
  <div class="err-msg mt3" data-gatemsg="del" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-danger btn-lg is-off" type="button" data-gated="del"
      data-toast="차시를 지웠어요">지우기</button>
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'CU-03' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0305 커리큘럼 > 총 시간 요약 ================= */
P['CU0305'] = () => {
  const body = `
${U.pageHd('구성 요약', '권장 분량과 견줘 보여드립니다')}

${U.card('', `<div class="g4">
  ${U.stat('챕터', '4', { unit: '개', ico: '📚' })}
  ${U.stat('차시', '30', { unit: '개', ico: '🎬', cls: 's-acc' })}
  ${U.stat('총 시간', '11시간 40분', { ico: '⏱', cls: 's-ok' })}
  ${U.stat('미리보기', '3', { unit: '차시', ico: '👁' })}
</div>`)}

${U.card('권장 분량과 견주면', `${U.table(['항목', '지금', '권장', ''], [
    ['총 시간', '<b>11시간 40분</b>', '8~15시간', U.badge('알맞음', 'b-ok')],
    ['차시 수', '<b>30개</b>', '25~50개', U.badge('알맞음', 'b-ok')],
    ['차시 평균 길이', '<b>23분</b>', '10~15분', U.badge('깁니다', 'b-warn')],
    ['미리보기', '<b>3차시</b>', '2~4차시', U.badge('알맞음', 'b-ok')],
    ['한 챕터당 차시', '<b>7.5개</b>', '5~10개', U.badge('알맞음', 'b-ok')],
  ])}
  <div class="box mt4"><b>차시가 조금 깁니다</b>
    <p class="t-sub mt1">평균 23분이라 출퇴근길에 하나를 못 끝냅니다.
    긴 차시를 둘로 나누면 완주율이 올라갑니다 — 20분이 넘는 차시가 <b>11개</b> 있습니다.</p>
    <div class="btns mt3">${U.btnSay('긴 차시 보기', '20분이 넘는 차시 11개를 보여드릴게요', { cls: 'btn-ghost btn-sm' })}</div></div>`,
    { cls: 'mt6' })}

${U.card('챕터별 분량', `${U.table(['챕터', '차시', '시간', '분량'], [
    ['1. 시작하기 전에', '3개', '17분', U.bar(8)],
    ['2. 표를 표답게 만들기', '8개', '2시간 51분', U.bar(24)],
    ['3. 피벗테이블', '11개', '4시간 22분', U.bar(37)],
    ['4. 실무 대시보드', '8개', '4시간 10분', U.bar(36)],
  ])}
  <p class="t-sub mt4">1챕터가 짧은 것은 괜찮습니다 — 오리엔테이션은 가볍게 시작하는 편이 낫습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0402 영상 업로드 > 업로드 진행 중 ================= */
P['CU0402'] = () => {
  const 파일 = [
    ['lesson_09.mp4', '412MB', 82, '1분 20초'],
    ['lesson_10.mp4', '386MB', 34, '4분 10초'],
    ['lesson_11.mp4', '298MB', 0, '대기 중'],
  ];

  const body = `
${U.pageHd('올리는 중입니다', '창을 닫아도 계속 올라갑니다')}

${U.card('', `<div class="card"><div class="card-bd flush">
  ${파일.map(([이름, 용량, pct, 남음]) => `<div class="lrow">
    <span class="grow"><b>${이름}</b>
      <span class="t-sub" style="display:block">${용량} · ${pct > 0 ? `${남음} 남음` : 남음}</span>
      <span style="display:block;margin-top:6px">${U.barRow(pct)}</span></span>
    ${U.btnSay('취소', `${이름} 업로드를 취소했어요`, { cls: 'btn-ghost btn-sm' })}
  </div>`).join('')}
</div></div>`)}

${U.banner('info', '📤', `<b>다른 화면으로 가셔도 업로드는 계속됩니다.</b>
  <p class="t-sub mt1">다만 <b>브라우저를 닫으면 멈춥니다.</b> 탭만 옮기시는 것은 괜찮습니다.
  나가려 하시면 「올리는 중입니다」라고 한 번 물어봅니다.</p>`)}

${U.card('올리는 동안 알아 두실 것', U.kv([
    ['동시에', '한 번에 <b>3개</b>씩 올라갑니다. 나머지는 줄을 섭니다'],
    ['끊겼을 때', '이어서 올립니다 — 처음부터 다시 올리지 않습니다'],
    ['한 파일 최대', '<b>5GB</b> · MP4 · MOV · MKV'],
    ['다 올린 뒤', '변환(인코딩)이 시작됩니다. 그건 서버가 하므로 창을 닫으셔도 됩니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0403 영상 업로드 > 인코딩 대기 ================= */
P['CU0403'] = () => {
  const body = `
${U.pageHd('변환을 기다리고 있습니다', '업로드는 끝났습니다')}

${U.card('', `${U.steps(['업로드', '변환 대기', '변환 중', '완료'], 1)}
  <div class="mt6">${U.kv([
    ['파일', 'lesson_09.mp4 (412MB · 38분)'],
    ['올린 시각', '2026-08-09 20:44'],
    ['대기 순번', '<b>앞에 4개</b>'],
    ['예상 시작', '20:58 쯤'],
    ['예상 완료', '<b>21:55 쯤</b> (약 1시간 10분)'],
  ])}</div>
  <div class="btns mt7">
    ${U.btnSay('다 되면 알려주기', '변환이 끝나면 알림을 보내드릴게요', { cls: 'btn-primary btn-lg' })}
    ${U.btn('다른 영상 올리기', { cls: 'btn-ghost btn-lg', href: 'CU-04' })}
  </div>`)}

${U.card('왜 변환이 필요한가', `<p class="t-sub">올려 주신 원본 하나로는 여러 기기에서 못 봅니다.
  1080p·720p·480p 세 벌로 만들어 두면 <b>연결이 느린 곳에서도 끊기지 않습니다.</b></p>
  ${U.kv([
    ['걸리는 시간', '보통 영상 길이의 <b>1.5배</b> — 38분짜리면 한 시간쯤'],
    ['변환 중', '미리보기도 안 됩니다. 원본이 아직 재생 가능한 형태가 아닙니다'],
    ['실패하면', '알림을 드리고 원본은 그대로 둡니다 — 다시 올리지 않으셔도 됩니다'],
    ['자막', '변환이 끝난 뒤에 붙이실 수 있습니다'],
  ])}`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0502 업로드 실패 > 실패 파일 부분 재시도 ================= */
P['CU0502'] = () => {
  const 파일 = [
    ['lesson_07.mp4', '한 파일 최대 5GB 를 넘었습니다 (6.2GB)', '나눠서 올리거나 화질을 낮춰 주세요', false],
    ['lesson_08.avi', '받지 않는 형식입니다', 'MP4 · MOV · MKV 로 바꿔 주세요', false],
    ['lesson_09.mp4', '연결이 끊겼습니다', '다시 시도하면 이어서 올라갑니다', false],
    ['lesson_10.mp4', '올림', '', true],
    ['lesson_11.mp4', '올림', '', true],
  ];
  const 실패 = 파일.filter(([, , , ok]) => !ok);

  const body = `
${U.pageHd('일부만 올라갔습니다', `${파일.length - 실패.length}개 성공 · ${실패.length}개 실패`)}

${U.banner('warn', '↻', `<b>성공한 ${파일.length - 실패.length}개는 그대로 두었습니다.</b>
  <p class="t-sub mt1">실패한 것만 골라 다시 올리시면 됩니다 — 전부 다시 하지 않으셔도 됩니다.</p>`,
    U.btnSay('실패한 것만 다시', '실패한 3개를 다시 올립니다', { cls: 'btn-primary' }))}

${U.card('', `<div class="card"><div class="card-bd flush">
  ${파일.map(([이름, 사유, 해결, ok]) => `<div class="lrow${ok ? '' : ''}">
    ${ok ? U.badge('성공', 'b-ok') : U.badge('실패', 'b-danger')}
    <span class="grow"><b>${이름}</b>
      <span class="t-sub" style="display:block">${사유}${해결 ? ` — ${해결}` : ''}</span></span>
    ${ok ? '<span class="muted">✓</span>'
      : (사유.includes('끊겼') ? U.btnSay('다시', `${이름} 을 다시 올립니다`, { cls: 'btn-ghost btn-sm' })
        : U.btnSay('빼기', `${이름} 을 목록에서 뺐어요`, { cls: 'btn-ghost btn-sm' }))}
  </div>`).join('')}
</div></div>`, { cls: 'mt6' })}

${U.card('실패 사유별로 할 일이 다릅니다', `${U.table(
    [{ t: '사유', w: '24%' }, '다시 시도하면 되나', '해야 할 일'],
    [
      ['<b>용량 초과</b>', '아니요', '나눠 올리거나 화질을 낮추기'],
      ['<b>형식 불가</b>', '아니요', 'MP4 로 변환해 다시 고르기'],
      ['<b>연결 끊김</b>', '<b class="success">네</b>', '누르면 이어서 올라갑니다'],
      ['<b>서버 오류</b>', '<b class="success">네</b>', '잠시 뒤 다시 시도'],
    ],
  )}
  <p class="t-sub mt4">「다시 시도」 버튼은 <b>다시 해서 될 것에만</b> 붙입니다.
    형식이 틀린 파일에 재시도 버튼을 붙이면 눌러도 또 실패합니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= CU0602 검수 대기 > 반려됨 ================= */
P['CU0602'] = () => {
  const 사유 = [
    ['음질', '3·7·12차시에서 주변 소음이 큽니다', '마이크를 입에서 20cm 안쪽으로 두고 다시 녹음해 주세요', 'CU-04'],
    ['화면 글씨', '9차시 코드가 1080p 에서 읽히지 않습니다', '편집기 글꼴을 16pt 이상으로 키워 주세요', 'CU-04'],
    ['첫 차시', '오리엔테이션이 없습니다', '무엇을 배우는지 3분 안에 말해 주는 차시를 맨 앞에 넣어 주세요', 'CU-03'],
  ];

  const body = `
${U.pageHd('검수에서 반려되었습니다', `고칠 것 ${사유.length}가지를 짚어 드립니다`)}

${U.banner('danger', '📋', `<b>2026-08-08 에 검수했습니다.</b>
  <p class="t-sub mt1">아래 세 가지를 고쳐 다시 요청해 주세요. <b>재검수는 보통 1영업일</b>입니다 —
  처음보다 빠릅니다.</p>`)}

${U.card('고쳐야 할 것', `${사유.map(([항목, 무엇, 어떻게, 가기]) => `
  <div class="box box-danger mb3">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <div class="grow" style="min-width:240px">
        <b>${항목}</b>
        <p class="t-sub mt1">${무엇}</p>
        <p class="t-sub mt2">→ ${어떻게}</p>
      </div>
      ${U.btn('고치러 가기', { cls: 'btn-ghost', href: 가기 })}
    </div>
  </div>`).join('')}`, { cls: 'mt6' })}

${U.card('', `<label class="row-c" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-gate="re2" data-label="수정 완료 확인">
    <b>세 가지를 모두 고쳤습니다</b></label>
  <div class="err-msg mt3" data-gatemsg="re2" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-primary btn-lg is-off" type="button" data-gated="re2"
      data-toast="재검수를 요청했어요. 보통 1영업일 걸립니다">재검수 요청</button>
    ${U.btnSay('검수 담당자에게 묻기', '문의를 보냈어요', { cls: 'btn-ghost btn-lg' })}
  </div>`, { cls: 'mt6' })}

${U.card('반려는 흠이 아닙니다', `<p class="t-sub">처음 개설하는 강의의 <b>약 절반</b>이 한 번은 반려됩니다.
  가장 잦은 것이 음질이고, 그다음이 화면 글씨입니다. 둘 다 다시 녹음하면 끝납니다.</p>
  <p class="t-sub mt3">반려 횟수는 손님에게 보이지 않고, 강사 평점에도 들어가지 않습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};
