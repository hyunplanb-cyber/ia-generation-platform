/* CL 내 강의실·재생·과제·질문·수료 — 3뎁스 하위 화면 21장
 *
 * 산 뒤에 벌어지는 일이 전부 여기 있다. 기간이 끝나고, 영상이 안 열리고,
 * 파일이 크고, 이미 낸 과제를 다시 내고, 수료 조건이 하나 모자란다.
 * 이 스물한 갈래를 안 그리면 개발자가 「그때는 어떻게 하죠」를 스물한 번 묻는다.
 */
import * as U from './ui.mjs';
import { MYCOURSES, byId } from './data.mjs';

const P = {};
export default P;

const C = byId('C01');

/* ================= CL0102 내 강의실 > 수강 완료 탭 ================= */
P['CL0102'] = () => {
  const 완료 = [
    ['C02', true, '2026-05-20', '2027-05-20'],
    ['C05', false, null, '2026-11-02'],
  ];

  const body = `
${U.pageHd('내 강의실', '다 들은 강의 2개')}

${U.tabs([{ label: '수강 중', cnt: 3, go: 'CL-01' }, { label: '수강 완료', cnt: 2 }, { label: '만료', cnt: 1, go: 'CL0104' }], 1)}

${U.sec('', `<div class="card mt4"><div class="card-bd flush">
  ${완료.map(([id, 수료, 날, 재수강]) => {
    const c = byId(id);
    return `<div class="lrow">
      ${U.ph('강의', 'ph-thumb-sm', id)}
      <span class="grow"><b>${c.name}</b>
        <span class="t-sub" style="display:block">${c.by} · ${c.ep}차시 전부 들음
          ${수료 ? ` · 수료 ${날}` : ' · 최종 시험 미응시'}</span></span>
      ${수료 ? U.badge('수료', 'b-ok') : U.badge('미수료', 'b-mut')}
      ${수료
        ? U.btnSay('수료증 받기', '수료증을 PDF로 내려받았어요', { cls: 'btn-ghost btn-sm' })
        : U.btn('조건 확인', { cls: 'btn-ghost btn-sm', href: 'CL0802' })}
    </div>`;
  }).join('')}
</div></div>`)}

${U.banner('info', '✍', `<b>후기를 남기면 다음 강의에 3,000원 쿠폰을 드립니다.</b>
  <p class="t-sub mt1">다 들으신 강의 2개 중 아직 후기가 없는 것이 2개입니다.</p>`,
    U.btnSay('후기 쓰기', '후기 작성 화면으로 갑니다', { cls: 'btn-primary' }))}

${U.card('다시 듣고 싶으실 때', U.kv([
    ['재수강 가능 기간', '수료일로부터 <b>1년</b>'],
    ['재수강 값', '정가의 <b>30%</b>'],
    ['남는 것', '내가 쓴 노트와 제출한 과제는 기간과 상관없이 그대로 남습니다'],
    ['수료증', '한 번 받으면 만료되지 않습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0103 내 강의실 > 수강 기간 만료 임박 ================= */
P['CL0103'] = () => {
  const body = `
${U.pageHd('수강 기간이 곧 끝납니다', '남은 차시를 먼저 알려드립니다')}

${U.banner('danger', '⏳', `<b>${C.name} · 6일 남았습니다.</b>
  <p class="t-sub mt1">2026년 8월 15일 자정에 끝납니다. <b>아직 18차시가 남았습니다</b> —
  하루 3차시씩 들으시면 기한 안에 끝납니다.</p>`,
    U.btnSay('기간 연장 신청', '연장 신청 화면으로 갑니다', { cls: 'btn-primary' }))}

${U.card('', `${U.courseRow(C, {
    extra: `<div class="mt3">${U.barRow(40, { title: '30차시 중 12차시' })}</div>
      <p class="t-sub mt2"><b class="danger">18차시</b> 남음 · 약 7시간 20분 분량</p>`,
    right: U.badge('D-6', 'b-danger'),
  })}
  <div class="btns mt7">
    ${U.btn('이어보기', { cls: 'btn-primary btn-lg', href: 'CL-03' })}
    ${U.btnSay('연장 신청', '연장 신청 화면으로 갑니다', { cls: 'btn-ghost btn-lg' })}
  </div>`, { cls: 'mt6' })}

${U.card('기간이 끝나면 어떻게 되나', `${U.table(['항목', '기간 중', '기간이 끝난 뒤'], [
    ['영상 보기', '✅', '<b class="danger">✕ 안 됩니다</b>'],
    ['첨부 자료 내려받기', '✅', '<b class="danger">✕ 안 됩니다</b>'],
    ['내가 쓴 노트', '✅', '✅ 그대로 남습니다'],
    ['제출한 과제와 점수', '✅', '✅ 그대로 남습니다'],
    ['수료증', '조건 충족 시', '✅ 이미 받은 것은 유지'],
  ])}
  <p class="t-sub mt4">연장은 <b>1개월 9,900원</b>입니다. 만료 뒤에도 30일 안에는 연장하실 수 있습니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0104 내 강의실 > 수강 기간 만료 ================= */
P['CL0104'] = () => {
  const c = byId('C05');

  const body = `
${U.pageHd('기간이 끝난 강의', '재수강하시면 그대로 이어집니다')}

${U.tabs([{ label: '수강 중', cnt: 3, go: 'CL-01' }, { label: '수강 완료', cnt: 2, go: 'CL0102' }, { label: '만료', cnt: 1 }], 2)}

${U.card('', `<div class="is-off">${U.courseRow(c, {
    extra: `<p class="t-sub mt2">2026-02-02 ~ <b>2026-08-02 만료</b> · 21/${c.ep}차시까지 들으셨습니다</p>`,
    right: U.badge('만료', 'b-mut'),
  })}</div>
  <div class="btns mt7">
    ${U.btnSay(`재수강 ${U.won(Math.round(c.price * 0.3 / 100) * 100)}`, '재수강 결제 화면으로 갑니다', { cls: 'btn-primary btn-lg' })}
    ${U.btn('내 노트 보기', { cls: 'btn-ghost btn-lg', href: 'CL0302' })}
  </div>
  <p class="t-sub mt3">재수강하시면 <b>진도와 노트가 그대로</b> 이어집니다. 22차시부터 보시면 됩니다.</p>`, { cls: 'mt4' })}

${U.card('지금 볼 수 있는 것', `${U.kv([
    ['영상', `${U.badge('잠김', 'b-mut')} 재수강하시면 열립니다`],
    ['첨부 자료', `${U.badge('잠김', 'b-mut')} 기간 중 받아 두신 파일은 그대로 쓰실 수 있습니다`],
    ['내 노트 42개', `${U.badge('열람 가능', 'b-ok')} 읽기와 내보내기 모두 됩니다`],
    ['제출한 과제 6건', `${U.badge('열람 가능', 'b-ok')} 점수와 강사 피드백도 보입니다`],
    ['수료증', `${U.badge('발급 불가', 'b-mut')} 진도 70%에서 멈춰 조건을 못 채웠습니다`],
  ])}`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0202 내 강의실 비어 있음 > 환불로 비워진 상태 ================= */
P['CL0202'] = () => {
  const body = `
${U.pageHd('내 강의실이 비어 있습니다', '환불 처리로 강의가 빠졌습니다')}

${U.card('', U.empty('↩', '환불이 처리되어 강의실이 비었어요',
    '2026년 8월 7일에 신청하신 환불이 처리됐습니다. 환불금은 결제하신 카드로 <b>3~5영업일</b> 안에 들어갑니다.',
    `${U.btnSay('환불 진행 상태 보기', '환불 내역 화면으로 갑니다', { cls: 'btn-ghost btn-lg' })}
     ${U.btn('강의 둘러보기', { cls: 'btn-primary btn-lg', href: 'CO-01' })}`))}

${U.card('환불 진행 상태', `${U.steps(['신청 접수', '검토', '승인', '카드사 취소', '입금 완료'], 3)}
  ${U.kv([
    ['신청', '2026-08-07 11:20'],
    ['승인', '2026-08-08 09:14'],
    ['환불액', '<b>63,200원</b> (79,000원에서 진도 10% 차감)'],
    ['수단', '신한카드 1234 — <b>결제하신 수단으로만</b> 돌려드립니다'],
    ['예상 입금', '2026-08-13 (카드사에 따라 다릅니다)'],
  ])}`, { cls: 'mt6' })}

${U.banner('info', '🎟', `<b>다시 들으실 때 쓰실 쿠폰을 드렸습니다.</b>
  <p class="t-sub mt1">같은 강의를 다시 결제하시면 <b>30% 할인</b>됩니다. 90일 안에 쓰시면 됩니다.</p>`,
    U.btn('강의 보러 가기', { cls: 'btn-primary', href: 'CO-03' }))}`;

  return { body, o: {} };
};

/* ================= CL0302 강의 재생 > 강의 노트 탭 ================= */
P['CL0302'] = () => {
  const 노트 = [
    ['12:04', '슬라이서는 피벗 여러 개에 한 번에 연결할 수 있다 — 보고서 연결 메뉴'],
    ['08:31', '이름 정의는 Ctrl+F3. 범위가 늘어나도 자동으로 따라오게 하려면 표로 만들 것'],
    ['03:12', '실습 파일은 4챕터 폴더에 있음'],
  ];

  const body = `
${U.pageHd('강의 노트', '적으면 그 시점이 함께 저장됩니다')}

${U.tabs([{ label: '차시 목록', go: 'CL-03' }, { label: '노트', cnt: 노트.length }, { label: '첨부 자료', cnt: 4, go: 'CL0303' }, { label: '질문', cnt: 12, go: 'CL-07' }], 1)}

${U.card('', `<div class="row-b wrap-row mb3" style="gap:var(--s4)">
    <b class="t-card">12차시 · 슬라이서로 걸러 보기</b>
    <span class="t-sub">지금 <b class="num">12:41</b> 지점</span>
  </div>
  <textarea class="input" rows="3" placeholder="여기에 적으면 12:41 이 함께 저장됩니다" aria-label="새 노트"></textarea>
  <div class="row-b mt3">
    <span class="t-sub">✓ 3초마다 저장됩니다 · 마지막 저장 20:15:22</span>
    ${U.btnSay('저장', '노트를 저장했어요 (12:41)', { cls: 'btn-primary btn-sm' })}
  </div>`, { cls: 'mt4' })}

${U.sec('', `<div class="card"><div class="card-bd flush">
  ${노트.map(([시각, 글]) => `<div class="lrow">
    ${U.btnSay(시각, `${시각} 지점으로 옮겼어요`, { cls: 'btn-ghost btn-sm' })}
    <span class="grow">${글}</span>
    ${U.btnSay('수정', '노트를 고칠 수 있어요', { cls: 'btn-ghost btn-sm' })}
    ${U.btnSay('삭제', '노트를 지웠어요', { cls: 'btn-ghost btn-sm' })}
  </div>`).join('')}
</div></div>`, { cls: 'mt6' })}

${U.card('', `<div class="row-b wrap-row" style="gap:var(--s4)">
  <p class="t-sub">이 강의의 노트 42개를 한 파일로 받으실 수 있습니다.</p>
  <div class="btns">
    ${U.btnSay('마크다운으로', '노트를 .md 파일로 내려받았어요', { cls: 'btn-ghost' })}
    ${U.btnSay('PDF로', '노트를 PDF로 내려받았어요', { cls: 'btn-ghost' })}
  </div>
</div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0303 강의 재생 > 첨부 자료 탭 ================= */
P['CL0303'] = () => {
  const 자료 = [
    ['1차시', '실습_원본데이터.xlsx', 'XLSX', '2.4MB', true],
    ['3차시', '피벗_완성본.xlsx', 'XLSX', '1.8MB', true],
    ['4차시', '대시보드_템플릿.zip', 'ZIP', '12.6MB', true],
    ['5차시', '함수_요약표.pdf', 'PDF', '640KB', true],
    ['6차시', '(아직 올라오지 않음)', '—', '—', false],
  ];

  const body = `
${U.pageHd('첨부 자료', '차시마다 붙은 실습 파일입니다')}

${U.tabs([{ label: '차시 목록', go: 'CL-03' }, { label: '노트', cnt: 3, go: 'CL0302' }, { label: '첨부 자료', cnt: 4 }, { label: '질문', cnt: 12, go: 'CL-07' }], 2)}

${U.card('', `<div class="row-b wrap-row mb4" style="gap:var(--s4)">
    <b>파일 4개 · 모두 17.4MB</b>
    ${U.btnSay('전체 받기 (zip)', '4개 파일을 하나로 묶어 내려받았어요', { cls: 'btn-primary btn-sm' })}
  </div>
  <div class="card"><div class="card-bd flush">
  ${자료.map(([차시, 이름, 형, 용량, 있음]) => `<div class="lrow${있음 ? '' : ' is-off'}">
    <span class="badge ${있음 ? 'b-line' : 'b-mut'}">${차시}</span>
    <span class="grow"><b>${이름}</b>
      ${있음 ? `<span class="t-sub" style="display:block">${형} · ${용량}</span>` : '<span class="t-sub" style="display:block">강사가 준비 중입니다</span>'}</span>
    ${있음 ? U.btnSay('받기', `${이름} 을 내려받았어요`, { cls: 'btn-ghost btn-sm' }) : '<span class="muted">—</span>'}
  </div>`).join('')}
  </div></div>`, { cls: 'mt4' })}

${U.card('자료를 받을 수 있는 조건', U.kv([
    ['수강 기간 중', '모두 받으실 수 있습니다'],
    ['기간이 끝난 뒤', '<b>받으실 수 없습니다</b> — 기간 중에 미리 받아 두세요'],
    ['이미 받은 파일', '기기에 남아 있는 것은 계속 쓰실 수 있습니다'],
    ['재배포', '개인 학습용입니다. 공유·재판매는 안 됩니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0304 강의 재생 > 재생 설정 ================= */
P['CL0304'] = () => {
  const body = `
${U.pageHd('재생 설정', '이 기기에 저장되어 다음에도 그대로 적용됩니다')}

${U.card('', `<div class="player"><div class="stage">영상 영역 (12차시 · 슬라이서로 걸러 보기)</div></div>`)}

${U.card('설정', `${U.kv([
    ['재생 속도', `<div class="row-c" style="gap:var(--s3)">
      <input type="range" class="slider" min="0.5" max="2" step="0.25" value="1.25" data-toast="1.25배로 바꿨어요">
      <b class="nowrap num">1.25배</b></div>`],
    ['자막', `<select class="input" style="width:auto" data-toast="자막을 바꿨어요">
      <option>한국어</option><option>English</option><option>끄기</option></select>`],
    ['자막 크기', `<select class="input" style="width:auto" data-toast="자막 크기를 바꿨어요">
      <option>보통</option><option>크게</option><option>아주 크게</option></select>`],
    ['화질', `<select class="input" style="width:auto" data-toast="화질을 바꿨어요">
      <option>자동 (권장)</option><option>1080p</option><option>720p</option><option>480p</option></select>`],
    ['다음 차시 자동 재생', `<label class="row-c" style="gap:var(--s2);cursor:pointer">
      <input type="checkbox" checked data-toast="자동 재생을 켰어요"> 켬</label>`],
  ])}`, { cls: 'mt6' })}

${U.card('설정이 어디에 저장되나', U.kv([
    ['저장 위치', '<b>이 기기</b>에 저장됩니다 — 계정이 아니라 브라우저 단위입니다'],
    ['다른 기기', '기기마다 따로 정하실 수 있습니다. 사무실은 자막 끄고, 집은 켜는 식으로'],
    ['화질 자동', '연결 속도를 보고 고릅니다. 끊기면 한 단계 내렸다가 회복되면 올립니다'],
    ['배속', '<b>차시가 바뀌어도 유지</b>됩니다 — 매번 다시 맞추지 않으셔도 됩니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0305 강의 재생 > 차시 완료 처리 ================= */
P['CL0305'] = () => {
  const body = `
${U.pageHd('차시를 다 들으셨습니다', '진도가 올라갔습니다')}

${U.card('', `<div class="player"><div class="stage">영상 영역 · 재생 완료</div></div>
  <div class="box box-pri mt4">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <div><b>✅ 12차시 완료</b>
        <p class="t-sub mt1">진도가 <b>37% → 40%</b> 로 올랐습니다</p></div>
      <div class="grow" style="min-width:200px">${U.barRow(40, { title: '30차시 중 12차시' })}</div>
    </div>
  </div>
  <div class="row-b wrap-row mt6" style="gap:var(--s4)">
    <p class="t-sub"><b class="num">5초</b> 뒤에 13차시로 넘어갑니다</p>
    <div class="btns">
      ${U.btnSay('지금 넘어가기', '13차시로 갑니다', { cls: 'btn-primary' })}
      ${U.btnSay('여기 머무르기', '자동 넘김을 껐어요', { cls: 'btn-ghost' })}
    </div>
  </div>`)}

${U.card('언제 「들었다」로 치나', `${U.kv([
    ['완료 기준', '영상의 <b>95% 이상</b>을 보면 완료로 칩니다'],
    ['건너뛰기', '앞으로 감아 95%에 닿아도 <b>완료로 치지 않습니다</b>'],
    ['배속', '2배로 보셔도 완료로 칩니다 — 본 시간이 아니라 «본 구간»을 셉니다'],
    ['다시 보기', '완료한 차시를 다시 봐도 진도는 그대로입니다'],
  ])}
  <div class="box mt4"><b>왜 95% 인가</b>
    <p class="t-sub mt1">마지막 인사말까지 끝까지 듣는 사람은 드뭅니다. 100%로 잡으면
    다 들은 사람이 미완료로 남아 수료 조건에서 걸립니다.</p></div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0306 강의 재생 > 동시 접속 차단 ================= */
P['CL0306'] = () => {
  const body = `
${U.pageHd('다른 기기에서 재생 중입니다', '한 번에 한 곳에서만 보실 수 있습니다')}

${U.card('', U.result('warn', '📵', '다른 기기에서 보고 있어요',
    '같은 계정으로 다른 기기가 재생 중입니다. 이 기기에서 이어보시려면 그쪽 재생을 끊습니다.',
    `${U.btnSay('이 기기에서 이어보기', '다른 기기의 재생을 끊고 여기서 이어갑니다', { cls: 'btn-primary btn-lg' })}
     ${U.btn('내 강의실로', { cls: 'btn-ghost btn-lg', href: 'CL-01' })}`))}

${U.card('지금 접속 중인 기기', `${U.table(['기기', '위치', '마지막 접속', ''], [
    ['<b>Windows · Chrome</b> (지금 이 기기)', '서울', '방금', U.badge('여기', 'b-pri')],
    ['iPhone · Safari', '서울', '3분 전 · <b>재생 중</b>', U.btnSay('끊기', '그 기기의 재생을 끊었어요', { cls: 'btn-ghost btn-sm' })],
  ])}`, { cls: 'mt6' })}

${U.card('왜 막나요', `<p class="t-sub">한 계정을 여러 사람이 나눠 쓰면 강사에게 돌아갈 몫이 줄어듭니다.
  그래서 <b>동시 재생은 한 곳</b>으로 제한합니다.</p>
  ${U.kv([
    ['동시 재생', '<b>1대</b>'],
    ['등록 기기', '제한 없음 — 기기를 바꿔 가며 보시는 것은 괜찮습니다'],
    ['짧은 시간에 여러 번', '10분 안에 5회 이상 기기가 바뀌면 30분 잠깁니다'],
    ['가족과 함께 쓰신다면', '계정을 나누는 것보다 <b>2인 패키지</b>가 쌉니다'],
  ])}`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0402 재생 오류 > 인코딩 미완료 ================= */
P['CL0402'] = () => {
  const body = `
${U.pageHd('아직 준비 중인 영상입니다', '강사가 올린 영상을 변환하고 있습니다')}

${U.card('', `<div class="player-err">
    <div style="font-size:34px">🎞</div>
    <b>영상을 처리하고 있어요</b>
    <p class="t-sub">올린 영상을 화질별로 변환하는 중입니다</p>
  </div>
  <div class="mt6">${U.kv([
    ['차시', '18차시 · 조건부 서식으로 강조하기'],
    ['올린 시각', '2026-08-09 19:40'],
    ['진행', `${U.barRow(72)}`],
    ['예상 완료', '<b>20:35 쯤</b> (약 18분 남음)'],
  ])}</div>
  <div class="btns mt7">
    ${U.btnSay('다 되면 알려주기', '준비되면 알림을 보내드릴게요', { cls: 'btn-primary btn-lg' })}
    ${U.btn('다른 차시 보기', { cls: 'btn-ghost btn-lg', href: 'CL-03' })}
  </div>`)}

${U.banner('info', '💡', `<b>이건 고장이 아닙니다.</b>
  <p class="t-sub mt1">영상 하나를 1080p·720p·480p 세 벌로 만드는 데 보통 길이의 1.5배쯤 걸립니다.
  40분짜리면 한 시간쯤입니다. 다 되면 알림을 보내드립니다.</p>`)}

${U.card('오래 걸린다면', `<p class="t-sub">2시간이 지나도 안 끝나면 변환이 막힌 것일 수 있습니다. 강사에게 알려 주세요.</p>
  <div class="btns mt4">${U.btn('강사에게 문의', { cls: 'btn-ghost', href: 'CL-07' })}</div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CL0403 재생 오류 > 재생 권한 없음 ================= */
P['CL0403'] = () => {
  const body = `
${U.pageHd('이 영상을 재생할 수 없습니다', '무엇 때문인지에 따라 다른 안내가 나갑니다')}

${U.card('', U.result('danger', '🔒', '수강 기간이 끝났습니다',
    `<b>${C.name}</b> 의 수강 기간이 2026년 8월 2일에 끝났습니다.
     노트와 과제는 그대로 보실 수 있습니다.`,
    `${U.btnSay('재수강 23,700원', '재수강 결제 화면으로 갑니다', { cls: 'btn-primary btn-lg' })}
     ${U.btn('내 노트 보기', { cls: 'btn-ghost btn-lg', href: 'CL0302' })}`))}

${U.card('사유별 안내', `${U.table(
    [{ t: '사유', w: '22%' }, '문구', '다음에 할 일'],
    [
      ['<b>수강 기간 만료</b>', '「수강 기간이 2026-08-02 에 끝났습니다」', '재수강 결제 (정가의 30%)'],
      ['<b>환불 처리됨</b>', '「환불이 처리되어 재생할 수 없습니다」', '다시 결제하기 · 환불 내역 확인'],
      ['<b>강의 내림</b>', '「강사가 이 강의를 내렸습니다」', '기간 내 수강자는 계속 볼 수 있게 예외 처리'],
      ['<b>결제 대기</b>', '「입금이 확인되지 않았습니다」', '입금 계좌 다시 보기'],
    ],
  )}
  <p class="t-sub mt4">「재생 권한이 없습니다」 하나로 끝내면, 돈을 낸 사람도 안 낸 사람도 같은 문구를 봅니다.</p>`,
    { cls: 'mt6' })}

${U.card('잘못된 안내라고 생각되시면', `<p class="t-sub">결제하셨는데 이 화면이 나온다면 주문번호와 함께 알려 주세요. 바로 열어 드립니다.</p>
  <div class="btns mt4">${U.btn('고객센터 문의', { cls: 'btn-ghost', href: 'MY-04' })}</div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CL0502 과제 제출 > 파일 용량 초과 ================= */
P['CL0502'] = () => {
  const 파일 = [
    ['분석보고서.xlsx', '3.2MB', true],
    ['원본데이터_전체.zip', '48.6MB', false],
    ['화면캡처.png', '1.1MB', true],
    ['발표영상.mp4', '124MB', false],
  ];

  const body = `
${U.pageHd('일부 파일이 너무 큽니다', '나머지 첨부는 그대로 두었습니다')}

${U.banner('danger', '📦', `<b>20MB 를 넘는 파일 2개는 올리지 못했습니다.</b>
  <p class="t-sub mt1">작은 파일 2개는 그대로 붙어 있습니다 — 처음부터 다시 고르지 않으셔도 됩니다.</p>`,
    U.btnSay('큰 파일만 빼기', '20MB를 넘는 파일 2개를 뺐어요', { cls: 'btn-primary' }))}

${U.card('첨부한 파일', `<div class="card"><div class="card-bd flush">
  ${파일.map(([이름, 용량, ok]) => `<div class="lrow${ok ? '' : ' is-off'}">
    <span class="badge ${ok ? 'b-ok' : 'b-danger'}">${ok ? '올림' : '초과'}</span>
    <span class="grow"><b>${이름}</b>
      <span class="t-sub" style="display:block">${용량}${ok ? '' : ' · 20MB 를 넘습니다'}</span></span>
    ${U.btnSay('빼기', `${이름} 을 뺐어요`, { cls: 'btn-ghost btn-sm' })}
  </div>`).join('')}
</div></div>
<p class="t-sub mt3">지금 올린 것 <b>4.3MB</b> / 20MB</p>`, { cls: 'mt6' })}

${U.card('큰 파일은 이렇게', U.kv([
    ['압축', 'zip 으로 묶으면 엑셀·CSV 는 보통 70%까지 줄어듭니다'],
    ['나눠 올리기', '20MB 씩 나눠 여러 번 제출하실 수 있습니다 (제출 횟수는 그대로)'],
    ['영상 과제', '유튜브에 <b>일부 공개</b>로 올리고 링크를 본문에 붙여 주세요'],
    ['허용 형식', 'xlsx · csv · pdf · png · jpg · zip — 실행 파일은 받지 않습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CL0503 과제 제출 > 임시 저장 상태 ================= */
P['CL0503'] = () => {
  const body = `
${U.pageHd('쓰던 답안이 남아 있습니다', '2026-08-08 22:41 에 저장된 것입니다')}

${U.banner('info', '💾', `<b>이어서 쓰시겠어요?</b>
  <p class="t-sub mt1">지난번에 쓰시던 답안이 저장되어 있습니다. 불러오면 지금 쓰신 내용을 덮어씁니다.</p>`,
    `${U.btnSay('불러오기', '저장본을 불러왔어요', { cls: 'btn-primary' })}
     ${U.btnSay('저장본 지우기', '저장본을 지웠어요', { cls: 'btn-ghost' })}`)}

${U.card('무엇이 다른가', `${U.table(['', '저장본 (8/8 22:41)', '지금 쓰신 것'], [
    ['본문', '1,240자', '312자'],
    ['첨부', '2개 (4.3MB)', '없음'],
    ['마지막 문단', '「피벗으로 월별 합계를 낸 뒤…」', '「분석 결과…」'],
  ])}`, { cls: 'mt6' })}

${U.card('자동 저장은 이렇게 돕니다', `${U.kv([
    ['저장 주기', '<b>3초</b>마다 · 글자가 바뀌었을 때만'],
    ['어디에', '이 기기의 브라우저에 저장됩니다 — 서버로 보내지 않습니다'],
    ['얼마나', '<b>7일</b> 보관합니다. 제출하면 바로 지웁니다'],
    ['저장 실패', '창 위에 「저장하지 못했어요 · 다시 시도」가 뜹니다 — 조용히 넘기지 않습니다'],
  ])}
  <div class="box mt4"><b>왜 서버에 안 보내나</b>
    <p class="t-sub mt1">쓰다 만 답안이 서버에 남으면 강사에게 보일 수 있습니다.
    제출을 누르기 전까지는 내 기기 밖으로 나가지 않습니다.</p></div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CL0504 과제 제출 > 재제출 상태 ================= */
P['CL0504'] = () => {
  const body = `
${U.pageHd('이미 제출하신 과제입니다', '다시 내시면 점수가 초기화됩니다')}

${U.banner('warn', '↻', `<b>재제출은 2번 중 1번 남았습니다.</b>
  <p class="t-sub mt1">다시 내시면 <b>지금 받은 점수(88점)가 지워지고</b> 다시 채점을 기다립니다.
  강사 피드백도 새로 받으십니다.</p>`)}

${U.card('지금 제출된 답안', `${U.kv([
    ['제출 시각', '2026-08-06 21:05'],
    ['채점 상태', `${U.badge('채점 완료', 'b-ok')} 2026-08-07 14:22`],
    ['점수', '<b class="t-sec">88</b> / 100'],
    ['강사 피드백', '「피벗 구성은 정확합니다. 다만 슬라이서를 연결하면 더 좋았겠습니다.」'],
    ['첨부', '분석보고서.xlsx (3.2MB)'],
  ])}
  <div class="btns mt6">
    ${U.btnSay('제출본 열어 보기', '제출한 답안을 엽니다', { cls: 'btn-ghost' })}
    ${U.btnSay('첨부 받기', '분석보고서.xlsx 를 내려받았어요', { cls: 'btn-ghost' })}
  </div>`, { cls: 'mt6' })}

${U.card('다시 내시겠어요?', `<p class="t-sub mb4">아래를 확인하시고 진행해 주세요.</p>
  ${U.kv([
    ['지금 점수', '<b class="danger">88점이 지워집니다</b>'],
    ['남은 횟수', '이번을 쓰면 <b>0번</b> 남습니다'],
    ['채점 대기', '보통 1~2일 걸립니다'],
    ['마감', '2026-08-13 까지는 재제출하셔도 감점이 없습니다'],
  ])}
  <label class="row-c mt4" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-gate="re" data-label="재제출 확인"> 위 내용을 확인했습니다</label>
  <div class="err-msg mt3" data-gatemsg="re" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-primary btn-lg is-off" type="button" data-gated="re"
      data-toast="다시 제출했어요. 기존 점수는 지워지고 채점을 기다립니다">다시 제출하기</button>
    ${U.btn('그냥 두기', { cls: 'btn-ghost btn-lg', href: 'CL-05' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CL0505 과제 제출 > 제출 완료 ================= */
P['CL0505'] = () => {
  const body = `
${U.pageHd('과제를 냈습니다', '채점을 기다리시면 됩니다')}

${U.card('', U.result('ok', '✅', '제출 완료',
    '2026-08-09 20:22 에 접수했습니다. 마감(오늘 23:59)까지 <b>3시간 37분</b> 남았으니 필요하면 다시 내셔도 됩니다.',
    `${U.btn('제출 내역 보기', { cls: 'btn-primary btn-lg', href: 'CL-05' })}
     ${U.btn('강의로 돌아가기', { cls: 'btn-ghost btn-lg', href: 'CL-03' })}`))}

${U.card('낸 내용', U.kv([
    ['과제', '함수 조합 과제 — VLOOKUP + IFERROR'],
    ['본문', '1,240자'],
    ['첨부', '분석보고서.xlsx (3.2MB) · 화면캡처.png (1.1MB)'],
    ['제출 시각', '<b>2026-08-09 20:22</b> · 마감 3시간 37분 전'],
  ]), { cls: 'mt6' })}

${U.card('채점은 언제 되나', `${U.kv([
    ['보통', '<b>1~2일</b>'],
    ['마감 직후', '제출이 몰려 3~4일 걸릴 수 있습니다'],
    ['알림', '채점이 끝나면 알림을 보내드립니다'],
    ['이의 신청', '점수를 받은 뒤 7일 안에 하실 수 있습니다'],
  ])}
  <p class="t-sub mt4">이 과제는 수료 조건에 들어갑니다 — 전체 6개 중 <b>5개</b>를 내셨습니다.</p>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CL0602 과제 마감됨 > 지각 제출 허용 ================= */
P['CL0602'] = () => {
  const body = `
${U.pageHd('마감은 지났지만 낼 수 있습니다', '감점을 미리 알려드립니다')}

${U.banner('warn', '⏰', `<b>지각 제출 기간입니다 — 2일 6시간 남았습니다.</b>
  <p class="t-sub mt1">마감은 2026-08-07 23:59 였습니다. 이 강사는 <b>3일까지</b> 지각 제출을 받고,
  <b>하루에 10%</b>씩 깎습니다. 지금 내시면 <b>20% 감점</b>입니다.</p>`)}

${U.card('감점이 어떻게 되나', `${U.table(['언제 내면', '감점', '100점 만점이면'], [
    ['마감 전', '없음', '100점'],
    ['1일 지각', '−10%', '90점'],
    ['<b>2일 지각 (지금)</b>', '<b class="danger">−20%</b>', '<b>80점</b>'],
    ['3일 지각', '−30%', '70점'],
    ['4일 이후', '받지 않습니다', '0점'],
  ])}
  <p class="t-sub mt4">감점은 <b>강사가 정한 정책</b>입니다. 강의마다 다를 수 있어 이 화면에 그대로 적어 둡니다.</p>`,
    { cls: 'mt6' })}

${U.card('과제 제출', `${U.badge('지각 제출', 'b-warn')}
  <textarea class="input mt3" rows="5" placeholder="답안을 적어 주세요" aria-label="과제 본문"></textarea>
  <div class="mt4">
    <label class="btn btn-ghost" style="cursor:pointer">파일 첨부
      <input type="file" hidden data-toast="파일을 붙였어요"></label>
    <span class="t-sub" style="margin-left:var(--s3)">20MB 까지 · xlsx · pdf · png · zip</span>
  </div>
  <label class="row-c mt6" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-gate="late" data-label="감점 확인">
    <b>20% 감점을 확인했습니다</b></label>
  <div class="err-msg mt3" data-gatemsg="late" hidden></div>
  <div class="btns mt6">
    <button class="btn btn-primary btn-lg is-off" type="button" data-gated="late"
      data-toast="지각 제출했어요. 20% 감점이 적용됩니다">지각 제출하기</button>
  </div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CL0702 질문 게시판 > 질문 작성 폼 ================= */
P['CL0702'] = () => {
  const 비슷 = [
    ['슬라이서가 다른 피벗에 연결이 안 됩니다', 3, true],
    ['피벗 새로고침하면 서식이 풀려요', 5, true],
    ['계산 필드에서 나누기가 이상하게 나옵니다', 1, false],
  ];

  const body = `
${U.pageHd('질문하기', '지금 보던 차시와 시점이 자동으로 붙습니다')}

${U.card('', `${U.kv([
    ['관련 차시', '<b>12차시 · 슬라이서로 걸러 보기</b>'],
    ['재생 시점', `<b class="num">12:41</b> ${U.btnSay('시점 바꾸기', '시점을 지울 수 있어요', { cls: 'btn-ghost btn-sm' })}`],
  ])}
  <input class="input mt4" placeholder="제목 — 무엇이 안 되는지 한 줄로" aria-label="질문 제목">
  <textarea class="input mt3" rows="6" placeholder="어떻게 했더니 무엇이 나왔는지 적어 주시면 빨리 답해 드릴 수 있어요" aria-label="질문 본문"></textarea>
  <div class="row-c mt4" style="gap:var(--s3)">
    <label class="btn btn-ghost btn-sm" style="cursor:pointer">🖼 이미지<input type="file" hidden data-toast="이미지를 붙였어요"></label>
    ${U.btnSay('&lt;/&gt; 코드 블록', '코드 블록을 넣었어요', { cls: 'btn-ghost btn-sm' })}
  </div>
  <label class="row-c mt6" style="gap:var(--s2);cursor:pointer">
    <input type="checkbox" data-toast="비공개로 바꿨어요 — 강사만 볼 수 있습니다">
    <b>비공개 질문</b> <span class="t-sub">강사만 봅니다</span></label>
  <div class="btns mt7">
    ${U.btnSay('질문 올리기', '질문을 올렸어요. 보통 4시간 안에 답이 옵니다', { cls: 'btn-primary btn-lg' })}
    ${U.btn('취소', { cls: 'btn-ghost btn-lg', href: 'CL-07' })}
  </div>`)}

${U.card('혹시 이 질문 아닌가요?', `<p class="t-sub mb4">제목을 적으실 때 비슷한 질문을 찾아 보여드립니다. 이미 답이 있으면 기다리지 않으셔도 됩니다.</p>
  <div class="card"><div class="card-bd flush">
  ${비슷.map(([제목, 답, 해결]) => `<a class="lrow" href="${U.link('CL-07')}">
    ${해결 ? U.badge('해결', 'b-ok') : U.badge('대기', 'b-mut')}
    <span class="grow">${제목}</span>
    <span class="t-sub">답변 ${답}</span><span class="muted">›</span></a>`).join('')}
  </div></div>`, { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};

/* ================= CL0703 질문 게시판 > 미답변만 보기 ================= */
P['CL0703'] = () => {
  const 대기 = [
    ['조건부 서식이 인쇄하면 사라집니다', '18차시', '2일 4시간'],
    ['피벗 원본이 바뀌면 자동 갱신되나요', '9차시', '1일 6시간'],
    ['맥에서 슬라이서가 안 보여요', '12차시', '7시간'],
  ];

  const body = `
${U.pageHd('아직 답이 없는 질문', '오래 기다린 것부터 위에 둡니다')}

${U.sec('', `
  <div class="row-b wrap-row mb4" style="gap:var(--s4)">
    ${U.fchips('qna', 'state', [['*', '전체 12'], ['wait', '미답변 3']], { on: 'wait' })}
    ${U.tabs(['오래 기다린 순', '최신순'], 0, { pill: true })}
  </div>
  <div class="card"><div class="card-bd flush">
  ${대기.map(([제목, 차시, 경과]) => `<a class="lrow" href="${U.link('CL-07')}">
    ${U.badge(경과, Number(경과.split('일')[0]) >= 2 ? 'b-danger' : 'b-warn')}
    <span class="grow"><b>${제목}</b>
      <span class="t-sub" style="display:block">${차시} · 답변 대기</span></span>
    <span class="muted">›</span></a>`).join('')}
  </div></div>`)}

${U.banner('info', '⏱', `<b>이 강사의 평균 답변 시간은 4시간입니다.</b>
  <p class="t-sub mt1">2일 넘게 답이 없는 질문은 저희가 강사에게 다시 알립니다.
  그래도 답이 없으면 고객센터가 대신 확인해 드립니다.</p>`)}

${U.card('걸러도 아무것도 없을 때', U.empty('🎉', '미답변 질문이 없어요',
    '모든 질문에 답이 달렸습니다. 필터를 풀면 전체 12개를 보실 수 있습니다.',
    U.btnSay('필터 풀기', '전체 질문을 보여드릴게요', { cls: 'btn-ghost' })), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0704 질문 게시판 > 질문 없음 ================= */
P['CL0704'] = () => {
  const body = `
${U.pageHd('이 차시에는 아직 질문이 없습니다', '12차시 · 슬라이서로 걸러 보기')}

${U.card('', U.empty('💬', '첫 질문을 남겨 보세요',
    '막히신 부분을 적어 주시면 강사가 답해 드립니다. 이 강사는 <b>평균 4시간</b> 안에 답합니다.',
    `${U.btn('질문 작성하기', { cls: 'btn-primary btn-lg', href: 'CL0702' })}
     ${U.btn('전체 차시 질문 보기', { cls: 'btn-ghost btn-lg', href: 'CL-07' })}`))}

${U.card('다른 차시에는 질문이 있습니다', `<div class="card"><div class="card-bd flush">
  ${[['3차시', 5], ['9차시', 3], ['18차시', 4]].map(([차시, n]) => `<a class="lrow" href="${U.link('CL-07')}">
    <span class="badge b-line">${차시}</span>
    <span class="grow">질문 ${n}개</span><span class="muted">›</span></a>`).join('')}
</div></div>`, { cls: 'mt6' })}

${U.card('질문하기 전에', `<p class="t-sub mb4">아래에 이미 답이 있을 수 있습니다.</p>
  <div class="btns">
    ${U.btn('자주 묻는 질문', { cls: 'btn-ghost', href: 'HO0104' })}
    ${U.btn('첨부 자료 확인', { cls: 'btn-ghost', href: 'CL0303' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= CL0802 수료증 > 수료 조건 미충족 ================= */
P['CL0802'] = () => {
  const 조건 = [
    ['진도율', '80%', '72%', false, '남은 3차시를 들으면 채워집니다', 'CL-03'],
    ['과제 제출', '6건 전부', '5건', false, '「최종 대시보드 만들기」가 남았습니다', 'CL-05'],
    ['최종 시험', '60점 이상', '84점', true, '', ''],
  ];

  const body = `
${U.pageHd('수료 조건이 아직 남았습니다', '두 가지만 채우면 발급됩니다')}

${U.card('', `${조건.map(([이름, 필요, 지금, ok, 안내, 가기]) => `
  <div class="box ${ok ? '' : 'box-danger'} mb3">
    <div class="row-b wrap-row" style="gap:var(--s4)">
      <div class="grow" style="min-width:220px">
        <div class="row-c" style="gap:var(--s2)">
          <b>${이름}</b>${ok ? U.badge('충족', 'b-ok') : U.badge('부족', 'b-danger')}
        </div>
        <p class="t-sub mt1">필요 <b>${필요}</b> · 지금 <b class="${ok ? 'success' : 'danger'}">${지금}</b>
          ${안내 ? ` — ${안내}` : ''}</p>
      </div>
      ${가기 ? U.btn('하러 가기', { cls: 'btn-ghost', href: 가기 }) : ''}
    </div>
  </div>`).join('')}

  <div class="btns mt6">
    <button class="btn btn-primary btn-lg" type="button" disabled>수료증 발급 (조건을 채우면 열립니다)</button>
  </div>`)}

${U.card('남은 분량', `${U.kv([
    ['안 들은 차시', '<b>3차시</b> · 약 42분'],
    ['안 낸 과제', '<b>1건</b> · 최종 대시보드 만들기 (마감 2026-08-20)'],
    ['다 하면', '<b>수료증이 바로 발급</b>됩니다 — 따로 신청하지 않으셔도 됩니다'],
  ])}`, { cls: 'mt6' })}

${U.banner('info', '📅', `<b>수강 기간이 끝나기 전에 채우셔야 합니다.</b>
  <p class="t-sub mt1">2026년 12월 12일까지입니다. 기간이 끝나면 영상을 못 보므로 진도를 더 올릴 수 없습니다.</p>`)}`;

  return { body, o: { read: true } };
};

/* ================= CL0803 수료증 > 공유·다운로드 ================= */
P['CL0803'] = () => {
  const body = `
${U.pageHd('수료증', '수료번호 LMS-2026-004821')}

${U.card('', `${U.ph('수료증 미리보기 (A4 가로)', 'ph-a4', 'cert')}
  <div class="btns mt6">
    ${U.btnSay('PDF 내려받기', '수료증을 PDF로 내려받았어요', { cls: 'btn-primary btn-lg' })}
    ${U.btnSay('링크드인에 올리기', '링크드인 공유 창을 엽니다 (견본이라 열리지 않습니다)', { cls: 'btn-ghost btn-lg' })}
  </div>`)}

${U.card('수료 정보', U.kv([
    ['강의', C.name],
    ['수료자', '김수현'],
    ['수료일', '2026-08-09'],
    ['수료번호', `<b class="num">LMS-2026-004821</b> ${U.btnSay('복사', '수료번호를 복사했어요', { cls: 'btn-ghost btn-sm' })}`],
    ['진도', '100% · 30/30차시'],
    ['최종 점수', '<b>91</b> / 100'],
  ]), { cls: 'mt6' })}

${U.card('진위 확인', `<p class="t-sub">수료증에 붙은 QR 이나 아래 주소로 누구나 확인할 수 있습니다.
  이력서에 붙이실 때 이 주소를 함께 적어 주세요.</p>
  <div class="row-c mt4" style="gap:var(--s2)">
    <input class="input grow" value="baeumteo.kr/verify/LMS-2026-004821" readonly aria-label="확인 주소">
    ${U.btnSay('복사', '주소를 복사했어요', { cls: 'btn-ghost' })}
  </div>
  <p class="t-sub mt3">확인 페이지에는 <b>강의명·수료일·수료번호만</b> 나옵니다 — 점수와 개인정보는 보이지 않습니다.</p>`,
    { cls: 'mt6' })}

${U.card('재발급 이력', U.kv([
    ['최초 발급', '2026-08-09 20:31'],
    ['재발급', '없음'],
    ['재발급 조건', '횟수 제한 없습니다. 수료번호는 바뀌지 않습니다'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { read: true } };
};
