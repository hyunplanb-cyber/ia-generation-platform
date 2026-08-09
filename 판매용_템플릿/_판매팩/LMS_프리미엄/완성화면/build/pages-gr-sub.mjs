/* GR 출결·채점·수료 — 3뎁스 하위 화면 10장
 *
 * 점수와 수료를 다루는 화면이라 «되돌릴 수 없는 것»이 많다.
 * 출석을 고치면 수강생에게 알려야 하고, 수료 기준을 바꾸면 이미 수료한 사람이 걸린다.
 * 그 판단을 화면에 적어 두지 않으면 개발할 때 그냥 덮어쓰게 만든다.
 */
import * as U from './ui.mjs';

const P = {};
export default P;

/* ================= GR0102 출석 현황 > 기간 필터 ================= */
P['GR0102'] = () => {
  const body = `
${U.pageHd('출석 현황', '기간과 분반을 좁혀 봅니다')}

${U.card('', `${U.kv([
    ['주차', `<div class="row-c" style="gap:var(--s2)">
      <select class="input" style="width:auto"><option>1주차</option><option>3주차</option></select> ~
      <select class="input" style="width:auto"><option>8주차</option><option>12주차</option></select></div>`],
    ['강의', `<select class="input" style="width:auto" data-toast="강의를 바꿨어요">
      <option>엑셀로 시작하는 실무 데이터 분석</option><option>파이썬 업무 자동화</option></select>`],
    ['분반', U.fchips('gr-att', 'class', [['*', '전체'], 'A반', 'B반', '야간반'], { on: 'A반' })],
  ])}
  <div class="box box-pri mt6">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <div><b>3주차 ~ 8주차 · A반 <span class="pri">32명</span></b>
        <p class="t-sub mt1">평균 출석률 <b>86.4%</b> (전체 평균 81.2%보다 5.2%p 높습니다)</p></div>
      ${U.btnSay('초기화', '조건을 모두 지웠어요', { cls: 'btn-ghost' })}
    </div>
  </div>`)}

${U.card('주차별 출석률', `${U.table(['주차', '출석', '지각', '결석', '출석률'], [
    ['3주차', '30', '1', '1', U.bar(94)],
    ['4주차', '29', '2', '1', U.bar(91)],
    ['5주차', '26', '3', '3', U.bar(81)],
    ['6주차', '24', '2', '6', U.bar(75)],
    ['7주차', '28', '2', '2', U.bar(88)],
    ['8주차', '29', '1', '2', U.bar(91)],
  ])}
  <p class="t-sub mt4">6주차가 눈에 띄게 낮습니다 — 그 주에 무슨 일이 있었는지 확인해 보세요.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0103 출석 현황 > 출석 수정 모달 ================= */
P['GR0103'] = () => {
  const body = `
${U.pageHd('출석 고치기', '김수현 · 6주차')}

${U.card('', `${U.kv([
    ['수강생', '<b>김수현</b> (kim****@gmail.com)'],
    ['주차', '6주차 · 2026-07-20'],
    ['지금 기록', U.badge('결석', 'b-danger')],
  ])}
  <div class="mt6">
    <p class="t-th mb2">무엇으로 바꾸시겠어요?</p>
    <div class="chips">
      <button class="chip" type="button" data-toast="출석으로 바꿉니다">출석</button>
      <button class="chip on" type="button" data-toast="지각으로 바꿉니다">지각</button>
      <button class="chip" type="button" data-toast="결석으로 둡니다">결석</button>
    </div>
  </div>
  <div class="mt6">
    <p class="t-th mb2">고치는 이유 <span class="danger">*</span></p>
    <textarea class="input" rows="2" placeholder="예) 병원 진단서 확인함" aria-label="수정 사유"></textarea>
    <p class="t-sub mt2">사유는 <b>반드시 남깁니다.</b> 나중에 성적 이의가 들어왔을 때 근거가 됩니다.</p>
  </div>
  <label class="row-c mt6" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" checked data-toast="수강생에게 알립니다"> <b>수강생에게 알리기</b>
    <span class="t-sub">「6주차 출결이 결석 → 지각으로 바뀌었습니다」</span></label>
  <div class="btns mt7">
    ${U.btnSay('저장', '출결을 고쳤어요. 수강생에게 알림이 갔습니다', { cls: 'btn-primary btn-lg' })}
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'GR-01' })}
  </div>`)}

${U.card('수정 이력', `${U.table(['시각', '누가', '무엇을', '사유'], [
    ['2026-08-09 21:02', '박지훈(강사)', '결석 → 지각', '병원 진단서 확인'],
    ['2026-07-20 23:59', '(자동)', '— → 결석', '출석 체크 시간 내 미접속'],
  ])}
  <p class="t-sub mt4">출결은 <b>덮어쓰지 않고 쌓습니다.</b> 누가 언제 왜 바꿨는지가 남아야
    이의 신청이 들어왔을 때 답할 수 있습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0202 채점 목록 > 채점 완료 탭 ================= */
P['GR0202'] = () => {
  const 완료 = [
    ['김수현', '3. 피벗 기본', 74, '2026-07-26', true],
    ['이서연', '3. 피벗 기본', 95, '2026-07-26', false],
    ['정우성', '3. 피벗 기본', 88, '2026-07-25', false],
    ['최민아', '3. 피벗 기본', 91, '2026-07-25', false],
  ];
  const 평균 = Math.round(완료.reduce((a, [, , 점]) => a + 점, 0) / 완료.length);

  const body = `
${U.pageHd('과제 채점', '3. 피벗 기본')}

${U.tabs([{ label: '채점 대기', cnt: 0, go: 'GR0203' }, { label: '채점 완료', cnt: 완료.length }], 1)}

${U.card('', `<div class="g4 mb6">
  ${U.stat('평균', String(평균), { unit: '점', ico: '📊' })}
  ${U.stat('최고', '95', { unit: '점', ico: '🏆', cls: 's-acc' })}
  ${U.stat('최저', '74', { unit: '점', ico: '📉' })}
  ${U.stat('지각 제출', '1', { unit: '건', ico: '⏰', cls: 's-danger' })}
</div>
<div class="card"><div class="card-bd flush">
  ${완료.map(([이름, 과제, 점, 날, 지각]) => `<a class="lrow" href="${U.link('GR-03')}">
    ${U.ph(이름, 'ph-ava-sm', 이름)}
    <span class="grow"><b>${이름}</b>
      <span class="t-sub" style="display:block">${날} 채점${지각 ? ' · 지각 제출 10% 감점' : ''}</span></span>
    ${지각 ? U.badge('지각', 'b-warn') : ''}
    <b class="num" style="width:48px;text-align:right">${점}점</b>
    <span class="muted">›</span></a>`).join('')}
</div></div>`, { cls: 'mt4' })}

${U.card('점수 분포', `${U.table(['구간', '인원', ''], [
    ['90점 이상', '<b>2명</b>', U.bar(50)],
    ['80~89점', '<b>1명</b>', U.bar(25)],
    ['70~79점', '<b>1명</b>', U.bar(25)],
    ['70점 미만', '0명', U.bar(0)],
  ])}
  <p class="t-sub mt4">재채점하시면 <b>수강생에게 알림이 다시 갑니다.</b>
    점수를 올리는 것은 괜찮지만 내리실 때는 사유를 함께 적어 주세요.</p>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0203 채점 목록 > 채점 대기 없음 ================= */
P['GR0203'] = () => {
  const body = `
${U.pageHd('채점할 과제가 없습니다', '3. 피벗 기본 · 모두 채점했습니다')}

${U.card('', U.empty('✅', '밀린 채점이 없어요',
    '이 과제는 32명 전원 채점을 마쳤습니다. 다음 과제 마감은 8월 13일입니다.',
    `${U.btn('채점 완료 보기', { cls: 'btn-primary btn-lg', href: 'GR0202' })}
     ${U.btn('학생 관리', { cls: 'btn-ghost btn-lg', href: 'ST-01' })}`))}

${U.card('최근에 하신 채점', `${U.table(['과제', '채점', '평균', '마친 날'], [
    ['3. 피벗 기본', '32건', '87점', '2026-07-26'],
    ['2. 함수 조합', '30건', '84점', '2026-07-15'],
    ['1. 표 만들기 기초', '28건', '91점', '2026-07-03'],
  ])}`, { cls: 'mt6' })}

${U.card('곧 마감되는 과제', `<div class="card"><div class="card-bd flush">
  <div class="lrow">
    ${U.badge('D-4', 'b-warn')}
    <span class="grow"><b>4. 계산 필드</b>
      <span class="t-sub" style="display:block">마감 2026-08-13 23:59 · 지금 <b>18명</b> 제출</span></span>
    ${U.btnSay('안 낸 사람 독려', '미제출 14명에게 독려 메시지를 보냈어요', { cls: 'btn-ghost btn-sm' })}
  </div>
  <div class="lrow">
    ${U.badge('D-11', 'b-line')}
    <span class="grow"><b>5. 조건부 서식</b>
      <span class="t-sub" style="display:block">마감 2026-08-20 23:59 · 지금 <b>6명</b> 제출</span></span>
    <span class="muted">—</span>
  </div>
</div></div>
<p class="t-sub mt3">마감 직후에 제출이 몰립니다. 그때 채점이 밀리지 않게 미리 시간을 잡아 두세요.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0302 채점 상세 > 루브릭 점수 입력 ================= */
P['GR0302'] = () => {
  const 항목 = [
    ['피벗 구성이 정확한가', 40, 36, '슬라이서를 연결하지 않아 −4'],
    ['계산 필드를 바르게 썼는가', 30, 30, ''],
    ['보고서가 읽히는가', 20, 16, '축 이름이 없어 −4'],
    ['제출 형식을 지켰는가', 10, 10, ''],
  ];
  const 합 = 항목.reduce((a, [, , 점]) => a + 점, 0);
  const 만점 = 항목.reduce((a, [, 배]) => a + 배, 0);

  const body = `
${U.pageHd('채점', '김수현 · 3. 피벗 기본')}

${U.card('채점 기준표', `${항목.map(([이름, 배점, 점, 메모]) => `
  <div class="mb4">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <b class="grow" style="min-width:200px">${이름}</b>
      <div class="row-c" style="gap:var(--s2)">
        <input class="input num" style="width:74px;text-align:right" value="${점}" aria-label="${이름} 점수">
        <span class="t-sub nowrap">/ ${배점}점</span>
      </div>
    </div>
    ${메모 ? `<p class="t-sub mt2">${메모}</p>` : ''}
    <input class="input mt2" placeholder="감점 사유 (수강생에게 보입니다)" value="${메모}" aria-label="${이름} 사유">
  </div>`).join('')}

  <div class="box box-pri mt6">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <b>총점</b>
      <div class="row-c" style="gap:var(--s3)">
        <b class="t-sec">${합}</b><span class="t-sub">/ ${만점}점</span>
      </div>
    </div>
  </div>
  <p class="t-sub mt3">항목 점수를 고치면 총점이 저절로 바뀝니다.
    배점을 넘겨 넣으면 <b>그 칸이 빨개지고 저장이 막힙니다.</b></p>`)}

${U.card('전체 피드백', `<textarea class="input" rows="4" placeholder="수강생에게 전할 말"
    aria-label="전체 피드백">피벗 구성은 정확합니다. 다만 슬라이서를 연결하면 더 좋았겠습니다.</textarea>
  <div class="row-b mt3">
    <span class="t-sub">✓ 3초마다 임시 저장됩니다 · 마지막 21:04:12</span>
    <div class="btns">
      ${U.btnSay('임시 저장', '임시 저장했어요. 나중에 이어 하실 수 있습니다', { cls: 'btn-ghost' })}
      ${U.btnSay('채점 마치기', '채점을 마쳤어요. 수강생에게 알림이 갑니다', { cls: 'btn-primary' })}
    </div>
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0303 채점 상세 > 첨부 파일 미리보기 ================= */
P['GR0303'] = () => {
  const 파일 = [
    ['분석보고서.pdf', 'PDF', '2.1MB', true],
    ['화면캡처.png', 'PNG', '840KB', true],
    ['원본데이터.xlsx', 'XLSX', '3.2MB', false],
  ];

  const body = `
${U.pageHd('제출한 파일', '김수현 · 3. 피벗 기본')}

${U.card('', `<div class="row-b wrap-row mb4" style="gap:var(--s4)">
    <b>분석보고서.pdf</b>
    <div class="row-c" style="gap:var(--s2)">
      ${U.btnSay('‹', '이전 쪽', { cls: 'btn-ghost btn-sm' })}
      <span class="t-sub num">2 / 6쪽</span>
      ${U.btnSay('›', '다음 쪽', { cls: 'btn-ghost btn-sm' })}
      ${U.btnSay('＋', '확대했어요', { cls: 'btn-ghost btn-sm' })}
      ${U.btnSay('－', '축소했어요', { cls: 'btn-ghost btn-sm' })}
    </div>
  </div>
  ${U.ph('제출 파일 미리보기 (PDF 2쪽)', 'ph-a4', 'sub')}`)}

${U.card('첨부한 파일', `<div class="card"><div class="card-bd flush">
  ${파일.map(([이름, 형, 용량, 볼수있음]) => `<div class="lrow">
    <span class="badge ${볼수있음 ? 'b-pri' : 'b-mut'}">${형}</span>
    <span class="grow"><b>${이름}</b>
      <span class="t-sub" style="display:block">${용량}${볼수있음 ? '' : ' · 여기서는 못 봅니다'}</span></span>
    ${볼수있음 ? U.btnSay('여기서 보기', `${이름} 을 엽니다`, { cls: 'btn-ghost btn-sm' })
      : U.btnSay('내려받기', `${이름} 을 내려받았어요`, { cls: 'btn-ghost btn-sm' })}
  </div>`).join('')}
</div></div>
<p class="t-sub mt3">화면에서 볼 수 있는 것은 <b>PDF · PNG · JPG</b> 뿐입니다.
  엑셀·zip 은 내려받아 여셔야 합니다 — 브라우저가 그 형식을 못 그립니다.</p>`, { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btnSay('전부 내려받기 (zip)', '3개 파일을 묶어 내려받았어요', { cls: 'btn-ghost' })}
  ${U.btn('채점 화면으로', { cls: 'btn-primary', href: 'GR0302' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0304 채점 상세 > 미제출 학생 ================= */
P['GR0304'] = () => {
  const body = `
${U.pageHd('낸 것이 없습니다', '박서준 · 3. 피벗 기본')}

${U.card('', U.empty('📭', '제출 내역이 없어요',
    '마감(2026-07-25 23:59)이 <b>15일</b> 지났습니다. 지각 제출 기간(3일)도 끝났습니다.',
    ''))}

${U.card('어떻게 하시겠어요?', `
  <label class="row-c mb3" style="gap:var(--s2);cursor:pointer">
    <input type="radio" name="miss" checked> <b>0점으로 처리</b>
    <span class="t-sub">수료 조건의 「전체 제출」을 못 채웁니다</span></label>
  <label class="row-c mb3" style="gap:var(--s2);cursor:pointer">
    <input type="radio" name="miss"> <b>보류</b>
    <span class="t-sub">점수를 매기지 않고 둡니다. 나중에 받으실 수 있습니다</span></label>
  <label class="row-c" style="gap:var(--s2);cursor:pointer">
    <input type="radio" name="miss"> <b>마감 연장</b>
    <span class="t-sub">이 학생에게만 기한을 더 줍니다</span></label>

  <div class="box mt6"><b>0점과 보류는 다릅니다</b>
    <p class="t-sub mt1"><b>0점</b>은 「냈는데 틀렸다」와 같이 처리됩니다 — 평균 점수에 들어갑니다.
    <b>보류</b>는 평균에서 빠지고, 수료 판정 때 「미제출」로 남습니다.
    사정이 있는 학생이면 보류가 낫습니다.</p></div>

  <div class="btns mt7">
    ${U.btnSay('이대로 처리', '0점으로 처리했어요', { cls: 'btn-primary btn-lg' })}
    ${U.btnSay('독려 메시지 보내기', '박서준님에게 독려 메시지를 보냈어요', { cls: 'btn-ghost btn-lg' })}
  </div>`, { cls: 'mt6' })}

${U.card('이 학생의 다른 과제', `${U.table(['과제', '상태', '점수'], [
    ['1. 표 만들기 기초', U.badge('제출', 'b-ok'), '86점'],
    ['2. 함수 조합', U.badge('제출', 'b-ok'), '79점'],
    ['<b>3. 피벗 기본</b>', U.badge('미제출', 'b-danger'), '—'],
    ['4. 계산 필드', U.badge('진행 중', 'b-line'), '마감 D-4'],
  ])}
  <p class="t-sub mt4">앞의 둘은 냈습니다. 3번만 빠진 것이라 <b>사정이 있었을 가능성</b>이 큽니다 —
    처리 전에 한 번 물어보시는 편이 낫습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0402 수료 기준 > 영향 인원 시뮬레이션 ================= */
P['GR0402'] = () => {
  const body = `
${U.pageHd('수료 기준', '옮기면 인원이 바로 바뀝니다')}

${U.card('', `${U.kv([
    ['진도율', `<div class="row-c" style="gap:var(--s3)">
      <input type="range" class="slider" min="50" max="100" step="5" value="80" data-toast="진도 기준을 바꿨어요">
      <b class="nowrap num">80% 이상</b></div>`],
    ['과제', `<select class="input" style="width:auto" data-toast="과제 기준을 바꿨어요">
      <option>전체 제출</option><option>80% 이상 제출</option><option>보지 않음</option></select>`],
    ['최종 시험', `<div class="row-c" style="gap:var(--s3)">
      <input type="range" class="slider" min="0" max="100" step="5" value="60" data-toast="시험 기준을 바꿨어요">
      <b class="nowrap num">60점 이상</b></div>`],
  ])}
  <div class="g3 mt6">
    ${U.stat('수료 가능', '41', { unit: '명', ico: '🎓', cls: 's-ok', delta: 0 })}
    ${U.stat('조건 미달', '76', { unit: '명', ico: '⏳' })}
    ${U.stat('이미 수료', '11', { unit: '명', ico: '✅', cls: 's-acc', note: '기준을 바꿔도 유지' })}
  </div>`)}

${U.card('무엇 때문에 못 채우나', `${U.table(['미달 항목', '인원', ''], [
    ['진도만 모자람', '<b>38명</b>', U.bar(50)],
    ['과제만 모자람', '<b>19명</b>', U.bar(25)],
    ['시험만 모자람', '<b>7명</b>', U.bar(9)],
    ['둘 이상 모자람', '<b>12명</b>', U.bar(16)],
  ])}
  <p class="t-sub mt4">진도 하나만 걸린 사람이 38명으로 가장 많습니다.
    기준을 <b>75%</b>로 낮추면 그중 14명이 수료 대상이 됩니다.</p>
  <div class="btns mt4">${U.btnSay('명단 보기', '진도만 모자란 38명을 보여드릴게요', { cls: 'btn-ghost' })}</div>`,
    { cls: 'mt6' })}

${U.card('이전 기준과 견주면', `${U.table(['', '이전 (7월)', '지금'], [
    ['진도율', '70%', '<b>80%</b>'],
    ['과제', '80% 제출', '<b>전체 제출</b>'],
    ['시험', '60점', '60점'],
    ['수료 가능 인원', '68명', '<b class="danger">41명</b>'],
  ])}
  <p class="t-sub mt4">기준을 올리셔서 수료 대상이 <b>27명 줄었습니다.</b></p>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0403 수료 기준 > 게시 후 기준 변경 경고 ================= */
P['GR0403'] = () => {
  const body = `
${U.pageHd('수강 중에 기준을 바꾸십니다', '이미 듣고 있는 128명에게 영향이 갑니다')}

${U.banner('danger', '⚠', `<b>이 강의는 게시 중이고 128명이 듣고 있습니다.</b>
  <p class="t-sub mt1">기준을 올리면 <b>어제까지 수료 대상이던 사람이 오늘 아니게 됩니다.</b>
  결제할 때 본 조건과 달라지므로 분쟁이 생길 수 있습니다.</p>`)}

${U.card('무엇이 어떻게 바뀌나', `${U.table(['', '지금 기준', '바꾸려는 기준', '영향'], [
    ['진도율', '70%', '<b>80%</b>', '<b class="danger">−22명</b>'],
    ['과제', '80% 제출', '<b>전체 제출</b>', '<b class="danger">−5명</b>'],
    ['시험', '60점', '60점', '없음'],
    ['<b>수료 가능</b>', '<b>68명</b>', '<b class="danger">41명</b>', '<b class="danger">−27명</b>'],
  ])}`, { cls: 'mt6' })}

${U.card('이미 수료 처리된 11명은', `
  <label class="row-c mb3" style="gap:var(--s2);cursor:pointer">
    <input type="radio" name="keep" checked> <b>그대로 둡니다</b> <span class="t-sub">(권장)</span></label>
  <label class="row-c" style="gap:var(--s2);cursor:pointer">
    <input type="radio" name="keep"> 새 기준으로 다시 판정합니다</label>
  <div class="box box-danger mt4"><b>다시 판정하면 수료증을 회수하게 됩니다</b>
    <p class="t-sub mt1">이미 받은 수료증을 무효로 만드는 것이라 <b>권하지 않습니다.</b>
    이력서에 붙인 분이 있을 수 있습니다. 새 기준은 <b>앞으로 수료할 사람</b>에게만 적용하세요.</p></div>`,
    { cls: 'mt6' })}

${U.card('', `<label class="row-c" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-gate="crit" data-label="영향 확인">
    <b>27명이 수료 대상에서 빠지는 것을 확인했습니다</b></label>
  <label class="row-c mt3" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-gate="crit" data-label="고지 동의">
    <b>수강생 128명에게 변경을 알리겠습니다</b> <span class="t-sub">(필수)</span></label>
  <div class="err-msg mt3" data-gatemsg="crit" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-danger btn-lg is-off" type="button" data-gated="crit"
      data-toast="기준을 바꾸고 128명에게 알렸어요">기준 바꾸기</button>
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'GR-04' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= GR0502 수료 처리 > 처리 실패 ================= */
P['GR0502'] = () => {
  const 실패 = [
    ['박서준', '과제 4번 미제출', false, '보류 처리된 과제가 있어 판정을 못 했습니다'],
    ['한지민', '수강 기간 만료', false, '기간이 끝나 진도가 확정되지 않았습니다'],
    ['오세라', '일시적 오류', true, '다시 시도하면 됩니다'],
  ];

  const body = `
${U.pageHd('일부가 처리되지 않았습니다', `38명 성공 · ${실패.length}명 실패`)}

${U.banner('info', '✅', `<b>성공한 38명은 수료 처리가 끝났습니다.</b>
  <p class="t-sub mt1">수료증이 발급됐고 알림도 갔습니다. <b>다시 하실 필요 없습니다.</b></p>`)}

${U.card('처리되지 않은 사람', `<div class="card"><div class="card-bd flush">
  ${실패.map(([이름, 사유, 재시도, 설명]) => `<div class="lrow">
    ${U.ph(이름, 'ph-ava-sm', 이름)}
    <span class="grow"><b>${이름}</b>
      <span class="t-sub" style="display:block">${사유} — ${설명}</span></span>
    ${재시도 ? U.btnSay('다시', `${이름}님을 다시 처리했어요`, { cls: 'btn-ghost btn-sm' })
      : U.btn('확인하러 가기', { cls: 'btn-ghost btn-sm', href: 'ST-03' })}
  </div>`).join('')}
</div></div>`, { cls: 'mt6' })}

${U.card('사유별로 할 일', `${U.table(
    [{ t: '사유', w: '24%' }, '다시 하면 되나', '해야 할 일'],
    [
      ['<b>과제 보류</b>', '아니요', '그 과제를 0점이나 점수로 확정해 주세요'],
      ['<b>기간 만료</b>', '아니요', '기간을 연장하거나 만료 시점 진도로 판정하세요'],
      ['<b>일시적 오류</b>', '<b class="success">네</b>', '누르면 다시 처리합니다'],
    ],
  )}`, { cls: 'mt6' })}

${U.card('', `<div class="btns">
  ${U.btnSay('다시 할 수 있는 1명만', '오세라님을 다시 처리했어요', { cls: 'btn-primary' })}
  ${U.btnSay('실패 목록 엑셀로', '실패 3건을 엑셀로 내려받았어요', { cls: 'btn-ghost' })}
  ${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'MY-04' })}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};
