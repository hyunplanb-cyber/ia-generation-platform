/* ST 학생 관리·진도·알림 발송 — 3뎁스 하위 화면 12장
 *
 * 강사가 «사람»을 다루는 화면이다. 그래서 개인정보와 발송 실패가 늘 따라온다 —
 * 엑셀로 내려받을 때 무엇을 가릴지, 알림이 일부만 갔을 때 무엇을 다시 보낼지.
 * 이 판단을 화면에 적어 두지 않으면 개발할 때 그냥 다 내보내게 만든다.
 */
import * as U from './ui.mjs';
import { STUDENTS, STUDY_MONTH } from './data.mjs';

const P = {};
export default P;

/* ================= ST0102 수강생 목록 > 진도 구간 필터 ================= */
P['ST0102'] = () => {
  const 구간 = [['미시작', 14, '0%'], ['진행 중', 62, '1~79%'], ['수료 가능', 41, '80% 이상'], ['수료 완료', 11, '조건 충족']];
  const 뽑힌 = STUDENTS.slice(0, 5);

  const body = `
${U.pageHd('수강생', '진도 구간으로 걸러 봅니다')}

${U.card('', `
  ${U.fchips('st-list', 'seg', 구간.map(([나, n, 범위]) => [나, `${나} ${n}`]), { multi: true, on: '진행 중' })}
  <p class="t-sub mt2">여러 개를 함께 고르실 수 있습니다. ${구간.map(([나, , 범위]) => `<b>${나}</b> ${범위}`).join(' · ')}</p>
  <div class="row-b wrap-row mt4" style="gap:var(--s4)">
    <b>걸린 수강생 <span class="pri">62명</span> <span class="t-sub" style="font-weight:400">(전체 128명 중)</span></b>
    ${U.btnSay('초기화', '전체 128명을 보여드릴게요', { cls: 'btn-ghost btn-sm' })}
  </div>`)}

${U.card('', `<div class="card"><div class="card-bd flush">
  ${뽑힌.map((s) => `<a class="lrow" href="${U.link('ST-03')}">
    ${U.ph(s.name, 'ph-ava-sm', s.id)}
    <span class="grow"><b>${s.name}</b>
      <span class="t-sub" style="display:block">${s.email} · 최근 접속 ${s.last}</span></span>
    <span style="width:140px">${U.barRow(s.pct)}</span>
    <span class="muted">›</span></a>`).join('')}
</div></div>`, { cls: 'mt6' })}

${U.card('구간을 이렇게 나눴습니다', U.kv([
    ['미시작', '결제했지만 영상을 한 번도 안 연 사람 — <b>독려 대상 1순위</b>'],
    ['진행 중', '듣고 있는 사람. 여기서 2주 넘게 안 들어오면 미달자로 넘어갑니다'],
    ['수료 가능', '진도 80%를 넘겨 과제만 내면 수료되는 사람'],
    ['수료 완료', '조건을 다 채운 사람. 독려 대상에서 빠집니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0103 수강생 목록 > 엑셀 다운로드 ================= */
P['ST0103'] = () => {
  const 항목 = [
    ['이름', true, true], ['이메일', true, true], ['휴대폰', false, true],
    ['진도율', true, false], ['최근 접속일', true, false], ['과제 제출 수', true, false],
    ['최종 점수', false, false], ['결제일·결제액', false, true],
  ];

  const body = `
${U.pageHd('엑셀로 내려받기', '무엇을 담을지 고르세요')}

${U.card('담을 항목', `${항목.map(([이름, 기본, 개인]) => `
  <label class="row-c mb2" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox"${기본 ? ' checked' : ''} data-toast="${이름} 을 ${기본 ? '뺐어요' : '담았어요'}">
    ${이름}${개인 ? ` ${U.badge('개인정보', 'b-warn')}` : ''}</label>`).join('')}`)}

${U.card('개인정보 가리기', `
  <label class="row-c mb3" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" checked data-toast="가리기를 켰어요"> <b>가리고 내려받기</b> <span class="t-sub">(권장)</span></label>
  ${U.table(['항목', '가리면', '안 가리면'], [
    ['이메일', 'kim****@gmail.com', 'kimsuhyun@gmail.com'],
    ['휴대폰', '010-****-9808', '010-6526-9808'],
    ['이름', '김*현', '김수현'],
  ])}
  <div class="box mt4"><b>왜 켜 두기를 권하나</b>
    <p class="t-sub mt1">엑셀 파일은 한 번 나가면 어디로 가는지 알 수 없습니다.
    진도를 보시려는 것이라면 이름과 진도율만으로 충분합니다.
    <b>가리지 않고 받으신 기록은 3년간 남습니다</b> — 개인정보 처리 책임이 강사에게도 있기 때문입니다.</p></div>`,
    { cls: 'mt6' })}

${U.card('범위', `<label class="row-c mb2" style="gap:var(--s2);cursor:pointer">
    <input type="radio" name="scope" checked> 지금 걸린 조건대로 <b>62명</b></label>
  <label class="row-c" style="gap:var(--s2);cursor:pointer">
    <input type="radio" name="scope"> 이 강의 전체 <b>128명</b></label>
  <div class="btns mt7">
    ${U.btnSay('파일 만들기', '파일을 만들고 있어요. 다 되면 알려드릴게요', { cls: 'btn-primary btn-lg' })}
  </div>
  <p class="t-sub mt2">100명이 넘으면 만드는 데 잠깐 걸립니다. 다 되면 알림으로 알려 드리고 <b>24시간</b> 동안 받으실 수 있습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0104 수강생 목록 > 수강생 없음 ================= */
P['ST0104'] = () => {
  const body = `
${U.pageHd('이 강의에는 수강생이 없습니다', '「엑셀 고급 매크로 실무」')}

${U.card('', U.empty('👥', '아직 아무도 신청하지 않았어요',
    '게시한 지 3일 됐습니다. 보통 첫 수강생까지 <b>일주일</b>쯤 걸립니다.',
    `${U.btnSay('강의 링크 복사', '링크를 복사했어요', { cls: 'btn-primary btn-lg' })}
     ${U.btn('다른 강의 보기', { cls: 'btn-ghost btn-lg', href: 'CU-01' })}`))}

${U.card('확인해 보실 것', `${U.table(['', '지금', ''], [
    ['게시 상태', `${U.badge('게시 중', 'b-ok')} 손님에게 보입니다`, ''],
    ['썸네일', `${U.badge('있음', 'b-ok')}`, U.btn('보기', { cls: 'btn-ghost btn-sm', href: 'CU0202' })],
    ['미리보기 차시', `<b class="danger">0차시</b> — 없습니다`, U.btn('넣기', { cls: 'btn-ghost btn-sm', href: 'CU-03' })],
    ['소개 글', '<b class="danger">80자</b> — 짧습니다', U.btn('고치기', { cls: 'btn-ghost btn-sm', href: 'CU-02' })],
  ])}
  <div class="box mt4"><b>미리보기부터 넣어 보세요</b>
    <p class="t-sub mt1">미리보기가 있는 강의는 결제 전환율이 <b>1.7배</b>입니다.
    지금 이 강의에는 하나도 없어서, 손님이 강사 말투를 확인할 방법이 없습니다.</p></div>`,
    { cls: 'mt6' })}

${U.card('링크를 어디에 올리면 좋나', U.kv([
    ['블로그·뉴스레터', '가장 잘 팔립니다 — 이미 나를 아는 사람이 옵니다'],
    ['관련 커뮤니티', '홍보 글이 허용되는 곳인지 먼저 확인해 주세요'],
    ['SNS', '미리보기 한 차시를 잘라 올리면 반응이 좋습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0202 검색 결과 없음 > 검색 팁 ================= */
P['ST0202'] = () => {
  const body = `
${U.pageHd('찾으시는 수강생이 없습니다', '「김수현」으로 찾으셨습니다')}

${U.card('', U.empty('🔍', '이름이나 이메일에 맞는 사람이 없어요',
    '띄어쓰기나 오타를 확인해 보세요. <b>일부만 넣어도 찾습니다</b> — 「수현」이나 「kim」으로도 됩니다.',
    U.btnSay('전체 보기', '수강생 128명을 모두 보여드릴게요', { cls: 'btn-primary btn-lg' })))}

${U.card('이런 분들은 목록에 없습니다', `${U.table(['경우', '보이나', '왜'], [
    ['<b>환불한 수강생</b>', '✕', '수강 자격이 없어졌습니다. 환불 내역에서 보실 수 있습니다'],
    ['<b>탈퇴한 회원</b>', '✕', '개인정보를 지웠습니다. 진도 통계에는 익명으로 남습니다'],
    ['<b>다른 강의 수강생</b>', '✕', '지금 고른 강의만 보여드립니다'],
    ['<b>선물 받고 아직 안 쓴 사람</b>', '✕', '수강 코드를 등록해야 목록에 들어옵니다'],
  ])}`, { cls: 'mt6' })}

${U.card('찾는 방법', U.kv([
    ['부분 검색', '「수현」 · 「kim」 · 「9808」 — 이름·이메일·휴대폰 뒷자리 모두 됩니다'],
    ['대소문자', '가리지 않습니다'],
    ['여러 명', '쉼표로 나눠 넣으면 한 번에 찾습니다'],
    ['강의 바꾸기', '위쪽 강의 고르는 칸을 바꾸면 그 강의 수강생을 찾습니다'],
  ]), { cls: 'mt6' })}

${U.card('최근에 찾으신 조건', `<div class="chips">
  ${['진도 50% 미만', '2주 미접속', '과제 미제출', 'gmail.com'].map((k) =>
    `<button class="chip" type="button" data-toast="${k} 조건을 다시 걸었어요">${k}</button>`).join('')}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0302 수강생 상세 > 과제 이력 탭 ================= */
P['ST0302'] = () => {
  const 과제 = [
    ['1. 표 만들기 기초', '2026-07-02', 92, false, '정확합니다'],
    ['2. 함수 조합', '2026-07-14', 88, false, '슬라이서를 연결했으면 더 좋았겠습니다'],
    ['3. 피벗 기본', '2026-07-25', 74, true, '지각 제출로 10% 감점되었습니다'],
    ['4. 계산 필드', null, null, false, ''],
    ['5. 조건부 서식', '2026-08-06', 95, false, '아주 잘하셨습니다'],
    ['6. 최종 대시보드', null, null, false, ''],
  ];
  const 낸것 = 과제.filter(([, 날]) => 날);
  const 평균 = Math.round(낸것.reduce((a, [, , 점]) => a + 점, 0) / 낸것.length);

  const body = `
${U.pageHd('김수현 · 과제 이력', `${낸것.length} / ${과제.length}건 제출 · 평균 ${평균}점`)}

${U.tabs([{ label: '진도', go: 'ST-03' }, { label: '과제', cnt: 낸것.length }, { label: '질문', cnt: 4, go: 'ST0303' }, { label: '학습 시간', go: 'ST0304' }], 1)}

${U.card('', `<div class="card"><div class="card-bd flush">
  ${과제.map(([이름, 날, 점, 지각, 평]) => `<div class="lrow${날 ? '' : ' is-off'}">
    ${날 ? U.badge(지각 ? '지각' : '제출', 지각 ? 'b-warn' : 'b-ok') : U.badge('미제출', 'b-mut')}
    <span class="grow"><b>${이름}</b>
      <span class="t-sub" style="display:block">${날 ? `${날} 제출${평 ? ` · ${평}` : ''}` : '아직 내지 않았습니다'}</span></span>
    ${점 != null ? `<b class="num" style="width:48px;text-align:right">${점}점</b>` : '<span class="muted" style="width:48px;text-align:right">—</span>'}
    ${날 ? U.btn('채점 화면', { cls: 'btn-ghost btn-sm', href: 'ST-05' }) : U.btnSay('독려', '독려 메시지를 보냈어요', { cls: 'btn-ghost btn-sm' })}
  </div>`).join('')}
</div></div>`, { cls: 'mt4' })}

${U.card('총점 요약', `${U.sumRows(
    낸것.map(([이름, , 점]) => [이름, `${점}점`]),
    ['평균', `${평균}점`],
  )}
  <p class="t-sub mt4">수료 조건은 <b>전체 제출</b>입니다. 점수는 조건에 안 들어가지만
    4번과 6번을 내지 않으면 수료되지 않습니다.</p>
  <div class="btns mt4">${U.btnSay('안 낸 과제 독려', '미제출 2건에 대해 독려 메시지를 보냈어요', { cls: 'btn-ghost' })}</div>`,
    { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0303 수강생 상세 > 질문 이력 탭 ================= */
P['ST0303'] = () => {
  const 질문 = [
    ['슬라이서가 다른 피벗에 연결이 안 됩니다', '12차시', '2026-08-08', false],
    ['조건부 서식이 인쇄하면 사라집니다', '18차시', '2026-08-05', true],
    ['피벗 원본이 바뀌면 자동 갱신되나요', '9차시', '2026-07-28', true],
    ['실습 파일이 안 열립니다', '2차시', '2026-07-03', true],
  ];
  const 미답 = 질문.filter(([, , , 답]) => !답).length;

  const body = `
${U.pageHd('김수현 · 질문 이력', `${질문.length}건 · 미답변 ${미답}건`)}

${U.tabs([{ label: '진도', go: 'ST-03' }, { label: '과제', cnt: 5, go: 'ST0302' }, { label: '질문', cnt: 질문.length }, { label: '학습 시간', go: 'ST0304' }], 2)}

${미답 ? U.banner('warn', '💬', `<b>답을 기다리는 질문이 ${미답}건 있습니다.</b>
  <p class="t-sub mt1">가장 오래된 것이 1일 6시간 지났습니다. 이 강의 평균 답변 시간은 4시간입니다.</p>`,
    U.btn('답변 쓰기', { cls: 'btn-primary', href: 'CL-07' })) : ''}

${U.card('', `<div class="card"><div class="card-bd flush">
  ${질문.map(([제목, 차시, 날, 답]) => `<a class="lrow" href="${U.link('CL-07')}">
    ${답 ? U.badge('답변함', 'b-ok') : U.badge('대기', 'b-danger')}
    <span class="grow"><b>${제목}</b>
      <span class="t-sub" style="display:block">${차시} · ${날}</span></span>
    <span class="muted">${답 ? '보기' : '답변 쓰기'} ›</span></a>`).join('')}
</div></div>`, { cls: 'mt6' })}

${U.card('이 수강생의 질문 성향', U.kv([
    ['자주 막히는 곳', '<b>피벗·슬라이서</b> — 3~4챕터에 질문이 몰려 있습니다'],
    ['질문 간격', '평균 <b>9일</b>에 한 번'],
    ['참고', '같은 곳에서 여러 명이 막히면 그 차시를 다시 찍는 편이 낫습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0304 수강생 상세 > 학습 시간 추이 ================= */
P['ST0304'] = () => {
  const body = `
${U.pageHd('김수현 · 학습 시간', '강의 평균과 견줘 보여드립니다')}

${U.tabs([{ label: '진도', go: 'ST-03' }, { label: '과제', cnt: 5, go: 'ST0302' }, { label: '질문', cnt: 4, go: 'ST0303' }, { label: '학습 시간' }], 3)}

${U.card('', `<div class="row-b wrap-row mb4" style="gap:var(--s4)">
    ${U.tabs(['최근 30일', '최근 90일', '전체'], 0, { pill: true })}
    <span class="t-sub">단위: 분</span>
  </div>
  ${U.lineChart(STUDY_MONTH, { labels: ['7/11', '7/21', '7/31', '8/9'], alt: '최근 30일 학습 시간' })}
  <div class="g3 mt6">
    ${U.stat('30일 합계', '18시간 40분', { ico: '⏱', delta: 210, deltaUnit: '분' })}
    ${U.stat('강의 평균', '14시간 20분', { ico: '👥', note: '이 강의 수강생 128명' })}
    ${U.stat('견주면', '+30', { unit: '%', ico: '📈', cls: 's-ok', note: '평균보다 많이 봅니다' })}
  </div>`, { cls: 'mt4' })}

${U.card('안 들어온 구간', `${U.table(['기간', '며칠', '그때 무슨 일이'], [
    ['7/16 ~ 7/22', '<b>7일</b>', '3챕터 시작 직후 — 어려워서 멈춘 것일 수 있습니다'],
    ['8/1 ~ 8/3', '3일', '주말이 낀 구간이라 흔합니다'],
  ])}
  <div class="box mt4"><b>7일 이상 비면 표시합니다</b>
    <p class="t-sub mt1">주말 이틀은 세지 않습니다. 그 정도는 대부분 쉬어 갑니다.
    <b>일주일이 넘게 비고 그 뒤로 진도가 안 오르면</b> 독려 대상으로 올라갑니다.</p></div>`,
    { cls: 'mt6' })}

${U.card('기록이 없을 때', U.empty('📉', '아직 학습 기록이 없어요',
    '이 수강생은 결제 후 한 번도 영상을 열지 않았습니다. 첫 차시 안내를 보내 보세요.',
    U.btnSay('첫 차시 안내 보내기', '안내 메시지를 보냈어요', { cls: 'btn-ghost' })), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0402 진도 미달자 관리 > 기준 설정 ================= */
P['ST0402'] = () => {
  const body = `
${U.pageHd('미달자 기준', '슬라이더를 움직이면 대상 인원이 바로 바뀝니다')}

${U.card('', `${U.kv([
    ['진도율이', `<div class="row-c" style="gap:var(--s3)">
      <input type="range" class="slider" min="0" max="100" step="5" value="30" data-toast="진도 기준을 바꿨어요">
      <b class="nowrap num">30% 미만</b></div>`],
    ['그리고 접속이', `<div class="row-c" style="gap:var(--s3)">
      <input type="range" class="slider" min="3" max="60" step="1" value="14" data-toast="미접속 기준을 바꿨어요">
      <b class="nowrap num">14일 이상 없음</b></div>`],
    ['수료한 사람', `<label class="row-c" style="gap:var(--s2);cursor:pointer">
      <input type="checkbox" checked> 대상에서 빼기</label>`],
    ['최근 독려받은 사람', `<label class="row-c" style="gap:var(--s2);cursor:pointer">
      <input type="checkbox" checked> 7일 안에 받았으면 빼기</label>`],
  ])}
  <div class="box box-pri mt6">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <div><b>이 기준이면 <span class="t-sec pri">23명</span></b>
        <p class="t-sub mt1">전체 128명 중 18%입니다</p></div>
      <div class="btns">
        ${U.btnSay('기준 저장', '기준을 저장했어요. 앞으로 이 기준으로 봅니다', { cls: 'btn-primary' })}
        ${U.btnSay('기본값으로', '진도 30% · 미접속 14일로 되돌렸어요', { cls: 'btn-ghost' })}
      </div>
    </div>
  </div>`)}

${U.card('기준을 바꾸면 이렇게 됩니다', `${U.table(['기준', '대상 인원', ''], [
    ['진도 10% · 미접속 30일', '<b>7명</b>', '정말 손 놓은 사람만'],
    ['<b>진도 30% · 미접속 14일 (지금)</b>', '<b class="pri">23명</b>', '균형이 맞습니다'],
    ['진도 50% · 미접속 7일', '<b>61명</b>', '너무 많습니다 — 독려가 스팸이 됩니다'],
  ])}
  <p class="t-sub mt4">한 번에 30명이 넘으면 독려 메시지가 광고처럼 읽힙니다.
    <b>20명 안팎</b>으로 잡고 자주 보내시는 편이 낫습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0403 진도 미달자 관리 > 대상자 없음 ================= */
P['ST0403'] = () => {
  const body = `
${U.pageHd('독려할 사람이 없습니다', '기준에 걸린 수강생이 0명입니다')}

${U.card('', U.empty('🎉', '모두 잘 따라오고 있어요',
    '진도 30% 미만이면서 14일 넘게 안 들어온 수강생이 없습니다. 지난주에 보내신 독려가 효과가 있었습니다.',
    `${U.btn('수강생 목록 보기', { cls: 'btn-primary btn-lg', href: 'ST-01' })}
     ${U.btn('기준 바꾸기', { cls: 'btn-ghost btn-lg', href: 'ST0402' })}`))}

${U.card('전체 진도 분포', `${U.table(['구간', '인원', '비율', ''], [
    ['0% (미시작)', '<b>14명</b>', '11%', U.bar(11)],
    ['1~29%', '<b>18명</b>', '14%', U.bar(14)],
    ['30~79%', '<b>44명</b>', '34%', U.bar(34)],
    ['80% 이상', '<b>41명</b>', '32%', U.bar(32)],
    ['수료 완료', '<b>11명</b>', '9%', U.bar(9)],
  ])}
  <p class="t-sub mt4">미시작 14명은 <b>미접속 기준(14일)에 아직 안 걸린</b> 사람들입니다 —
    최근에 결제한 분이 많습니다. 며칠 더 두고 보시는 편이 낫습니다.</p>`, { cls: 'mt6' })}

${U.card('기준을 조금 풀어 보시겠어요?', `${U.table(['기준을 이렇게 바꾸면', '대상'], [
    ['미접속 <b>7일</b> 이상', '<b>9명</b>'],
    ['진도 <b>50%</b> 미만', '<b>32명</b>'],
    ['미시작(0%) 전체', '<b>14명</b>'],
  ])}
  <div class="btns mt4">${U.btn('기준 설정으로', { cls: 'btn-ghost', href: 'ST0402' })}</div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0502 알림 발송 > 미리보기 ================= */
P['ST0502'] = () => {
  const 본문 = '{이름}님, 안녕하세요. {강의명} 을 신청하신 지 {경과일}일이 지났어요. 아직 {남은차시}차시가 남았습니다. 오늘 한 차시만 들어 보시는 건 어떠세요?';
  const 실제 = '김수현님, 안녕하세요. 엑셀로 시작하는 실무 데이터 분석 을 신청하신 지 58일이 지났어요. 아직 18차시가 남았습니다. 오늘 한 차시만 들어 보시는 건 어떠세요?';

  const body = `
${U.pageHd('보내기 전에 확인', '치환 자리에 실제 값을 넣어 보여드립니다')}

${U.card('쓰신 내용', `<div class="box"><p class="t-sub">${본문}</p></div>
  <p class="t-sub mt3">중괄호 안은 사람마다 다른 값으로 바뀝니다 —
    <b>{이름} {강의명} {진도율} {남은차시} {경과일} {마감일}</b> 을 쓰실 수 있습니다.</p>`)}

${U.card('김수현님이 받을 모습', `${U.tabs([
    { label: '이메일', pane: 'mail' }, { label: '푸시', pane: 'push' }, { label: '문자', pane: 'sms' },
  ], 0, { panes: 'noti' })}
  <div data-pane-set="noti" class="mt4">
    ${U.pane('mail', `<div class="box">
      <p class="t-th">제목: [배움터] 김수현님, 18차시가 남았어요</p>
      <hr class="hr mt3 mb3">
      <p>${실제}</p>
      <div class="btns mt4">${U.btn('이어보기', { cls: 'btn-primary btn-sm', href: 'CL-03' })}</div>
      <p class="t-sub mt4">수신을 원치 않으시면 <u>여기</u>를 눌러 주세요</p>
    </div>`, true)}
    ${U.pane('push', `<div class="box" style="max-width:360px">
      <p class="t-th">배움터</p>
      <p class="mt1">김수현님, 18차시가 남았어요. 오늘 한 차시만 들어 볼까요?</p>
      <p class="t-sub mt2">지금</p>
    </div>
    <p class="t-sub mt3">푸시는 <b>40자</b>까지만 보입니다. 넘으면 뒤가 잘립니다.</p>`)}
    ${U.pane('sms', `<div class="box" style="max-width:360px"><p>${실제}</p></div>
    <div class="box box-danger mt3"><b>글자 수 ${실제.length}자 — LMS(장문)로 나갑니다</b>
      <p class="t-sub mt1">90바이트(한글 45자)를 넘으면 장문이라 <b>건당 값이 3배</b>입니다.
      23명에게 보내면 문자만 <b>1,380원</b>입니다. 줄이시겠어요?</p></div>`)}
  </div>`, { cls: 'mt6' })}

${U.card('', `<div class="row-b wrap-row" style="gap:var(--s4)">
  <div>
    <b>받는 사람 23명</b>
    <p class="t-sub mt1">이메일 23 · 푸시 18(앱 설치자) · 문자 23</p>
  </div>
  <div class="btns">
    ${U.btnSay('나에게 시험 발송', '내 이메일로 한 통 보냈어요', { cls: 'btn-ghost btn-lg' })}
    ${U.btnSay('23명에게 보내기', '보내는 중입니다. 끝나면 결과를 알려드릴게요', { cls: 'btn-primary btn-lg' })}
  </div>
</div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= ST0503 알림 발송 > 일부 발송 실패 ================= */
P['ST0503'] = () => {
  const 실패 = [
    ['수신 거부', 3, '이 분들은 마케팅 수신을 껐습니다', false, '다시 보낼 수 없습니다 — 법으로 막혀 있습니다'],
    ['주소 오류', 2, '없는 이메일 주소입니다', false, '수강생에게 주소 확인을 요청하세요'],
    ['일시적 오류', 4, '받는 쪽 서버가 잠깐 안 받았습니다', true, '다시 보내면 대부분 갑니다'],
  ];
  const 실패수 = 실패.reduce((a, [, n]) => a + n, 0);

  const body = `
${U.pageHd('일부만 갔습니다', `${23 - 실패수}명 성공 · ${실패수}명 실패`)}

${U.card('', `<div class="g3">
  ${U.stat('보낸 사람', '23', { unit: '명', ico: '📨' })}
  ${U.stat('도착', String(23 - 실패수), { unit: '명', ico: '✅', cls: 's-ok' })}
  ${U.stat('실패', String(실패수), { unit: '명', ico: '⚠', cls: 's-danger' })}
</div>`)}

${U.card('왜 실패했나', `${실패.map(([사유, n, 무엇, 재시도, 할일]) => `
  <div class="box ${재시도 ? 'box-pri' : ''} mb3">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <div class="grow" style="min-width:240px">
        <div class="row-c" style="gap:var(--s2)"><b>${사유}</b>${U.badge(`${n}명`, 재시도 ? 'b-pri' : 'b-mut')}</div>
        <p class="t-sub mt1">${무엇}</p>
        <p class="t-sub mt1">→ ${할일}</p>
      </div>
      ${재시도 ? U.btnSay('이 ' + n + '명만 다시', `${n}명에게 다시 보냈어요`, { cls: 'btn-primary' }) : '<span class="muted">다시 보낼 수 없음</span>'}
    </div>
  </div>`).join('')}`, { cls: 'mt6' })}

${U.card('다시 보낼 때 지키는 것', U.kv([
    ['수신 거부', '<b>절대 다시 보내지 않습니다.</b> 정보통신망법 위반이고 계정이 정지될 수 있습니다'],
    ['주소 오류', '3번 연속 실패하면 그 주소는 발송 목록에서 자동으로 빠집니다'],
    ['일시적 오류', '10분 뒤 한 번 자동으로 다시 시도합니다 — 위 버튼은 그 뒤에도 실패한 건입니다'],
    ['같은 사람에게', '하루 <b>2통</b>까지만 나갑니다'],
  ]), { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btnSay('실패 목록 엑셀로', '실패 9건을 엑셀로 내려받았어요', { cls: 'btn-ghost' })}
  ${U.btn('발송 내역', { cls: 'btn-ghost', href: 'ST-05' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};
