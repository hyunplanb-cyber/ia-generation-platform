/* HO 홈 · TC 강사센터 — 3뎁스 하위 화면 8장
 *
 * 2뎁스(HO-01·HO-02·TC-01…)는 pages-ho-tc.mjs 가 그린다. 여기는 그 «안»이다 —
 * 탭을 눌렀을 때, 검색창에 글자를 넣었을 때, 볼 게 하나도 없을 때.
 *
 * 프리미엄이 디럭스보다 비싼 까닭이 이 화면들이다. 정상 흐름은 누구나 그리지만
 * 「이어보기가 없는 사람의 홈」은 시키지 않으면 아무도 안 만든다.
 */
import * as U from './ui.mjs';
import { SITE, CATS, COURSES, MYCOURSES, ASSIGNMENTS, TREND, MYTEACH, byId } from './data.mjs';

const P = {};
export default P;

/* ================= HO0102 홈·비로그인 > 분야별 추천 탭 ================= */
P['HO0102'] = () => {
  const 분야 = [
    { key: 'data', label: '데이터', neo: false },
    { key: 'dev', label: '개발', neo: false },
    { key: 'design', label: '디자인', neo: false },
    { key: 'ai', label: 'AI 활용', neo: true },
  ];
  const 묶음 = (시작) => COURSES.slice(시작, 시작 + 6);

  const 판 = 분야.map((f, i) => U.pane(f.key, `
    <div class="gal">${묶음(i * 2).map((c) => U.ccard(c)).join('')}</div>
    <div class="btns mt7" style="justify-content:center">
      ${U.btn(`${f.label} 강의 전체 보기`, { cls: 'btn-ghost btn-lg', href: 'CO-01' })}
    </div>`, i === 0)).join('');

  const body = `
${U.pageHd('분야별 추천', '탭을 바꾸면 아래 목록이 그 분야로 바뀝니다')}

${U.banner('info', '↕', `<b>탭을 눌러도 화면이 위로 튀지 않습니다.</b>
  <p class="t-sub mt1">보고 있던 자리를 그대로 두고 목록만 갈아 끼웁니다 — 탭을 오가며 비교하는 사람이 많기 때문입니다.</p>`)}

${U.sec('', `
  ${U.tabs(분야.map((f) => ({
    label: f.neo ? `${f.label} <span class="badge b-acc" style="margin-left:6px">NEW</span>` : f.label,
    pane: f.key,
  })), 0, { panes: 'ho-rec' })}
  <div data-panes-set="ho-rec" class="mt4">${판}</div>
`, { cls: 'mt6' })}

${U.card('이 화면이 다루는 것', U.kv([
    ['탭 전환', '누른 탭의 강의 6개로 목록을 갈아 끼웁니다'],
    ['스크롤 위치', '탭을 바꿔도 보던 자리를 그대로 둡니다'],
    ['NEW 배지', '새로 연 분야에만 붙습니다 (지금은 AI 활용)'],
    ['더보기', '그 분야만 걸러진 목록 화면으로 넘어갑니다'],
  ]), { cls: 'mt8' })}`;

  return { body, o: { search: false } };
};

/* ================= HO0103 홈·비로그인 > 검색어 자동완성 ================= */
P['HO0103'] = () => {
  const 제안 = [
    ['강의', '엑셀 데이터 분석', '수강생 2,140명'],
    ['강의', '엑셀 피벗테이블 실무', '수강생 860명'],
    ['강의', '엑셀 함수 기초부터', '수강생 3,020명'],
    ['강사', '김서준', '엑셀·데이터 · 강의 4개'],
  ];
  const 인기 = ['파이썬 입문', '엑셀 실무', '피그마', '데이터 분석', 'SQL', '포트폴리오', '영어 회화', 'AI 활용'];
  const 최근 = ['엑셀 피벗', '파이썬 크롤링', '피그마 오토레이아웃'];

  const body = `
${U.pageHd('검색어 자동완성', '히어로 검색창에 「엑셀」을 넣은 상태입니다')}

${U.sec('', U.card('', `
  <div class="tb-search" style="max-width:none;position:relative">
    <span class="ico" aria-hidden="true">🔍</span>
    <input class="input" type="search" value="엑셀" aria-label="강의 검색" style="padding-left:38px">
  </div>

  <div class="mt4">
    <div class="t-th muted mb2">추천 검색어</div>
    <div class="card"><div class="card-bd flush">
      ${제안.map(([종, 말, 부]) => `<a class="lrow" href="${U.link('CO-01')}">
        <span class="badge ${종 === '강사' ? 'b-line' : 'b-pri'}">${종}</span>
        <span class="grow"><b><span class="mark">엑셀</span>${말.replace('엑셀', '')}</b>
          <span class="t-sub" style="display:block">${부}</span></span>
        <span class="muted">↗</span></a>`).join('')}
    </div></div>
  </div>

  <div class="mt6">
    <div class="row-b mb2"><span class="t-th muted">최근 검색어</span>
      ${U.btnSay('전체 지우기', '최근 검색어를 모두 지웠어요', { cls: 'btn-ghost btn-sm' })}</div>
    ${U.fchips('recent', 'kw', 최근, { x: true, allLabel: '전체' })}
    <p class="t-sub mt2">✕ 를 누르면 그 하나만 지워집니다.</p>
  </div>

  <div class="mt6">
    <div class="t-th muted mb2">인기 검색어</div>
    <div class="chips">${인기.map((k, i) => `<a class="chip" href="${U.link('CO-01')}"><b class="pri" style="margin-right:6px">${i + 1}</b>${k}</a>`).join('')}</div>
  </div>
`))}

${U.sec('찾는 것이 없을 때', U.card('', U.empty('🔍', '「엑셀 고급 매크로」 결과가 없어요',
    '검색어를 줄이거나 비슷한 분야를 둘러보세요. 원하는 주제를 남겨 주시면 강사에게 전달합니다.',
    `${U.btn('전체 강의 둘러보기', { cls: 'btn-primary', href: 'CO-01' })}
     ${U.btnSay('이 주제 요청하기', '요청을 받았어요. 강의가 열리면 알려드릴게요', { cls: 'btn-ghost' })}`)),
    { desc: '결과가 0건이어도 막다른 길로 두지 않습니다' })}`;

  return { body, o: { search: false, read: true } };
};

/* ================= HO0104 홈·비로그인 > FAQ 아코디언 펼침 ================= */
P['HO0104'] = () => {
  const 묶음 = [
    ['결제', [
      { q: '결제 수단은 무엇이 있나요?', a: '신용·체크카드와 간편결제(카카오페이·네이버페이·토스)를 쓰실 수 있습니다. 계좌이체는 세금계산서가 필요한 기업 수강만 따로 처리합니다.' },
      { q: '기업에서 여러 명을 한 번에 결제할 수 있나요?', a: '5명 이상이면 기업 수강 문의로 접수해 주세요. 담당자 한 분이 결제하고 수강생 계정을 나눠 드립니다. 세금계산서도 함께 발행됩니다.' },
    ]],
    ['환불', [
      { q: '수강을 시작한 뒤에도 환불되나요?', a: '결제일로부터 7일 이내이고 <b>수강 진도가 10% 미만</b>이면 전액 환불됩니다. 그 뒤에는 남은 기간에 비례해 계산합니다.' },
      { q: '수강 기간이 지나면 어떻게 되나요?', a: '기간이 끝나면 영상은 볼 수 없지만 <b>내가 쓴 필기와 과제 제출물은 그대로 남습니다.</b> 재수강은 30% 할인가로 열립니다.' },
    ]],
    ['수료', [
      { q: '수료 조건이 어떻게 되나요?', a: '진도율 80% 이상 + 과제 전체 제출 + 최종 시험 60점 이상입니다. 세 가지를 모두 채우면 수료증이 자동 발급됩니다.' },
      { q: '수료증을 어디에 쓸 수 있나요?', a: 'PDF로 내려받아 이력서에 첨부하시거나, 링크로 공유하실 수 있습니다. 링크에는 발급 번호가 들어 있어 진위를 확인할 수 있습니다.' },
    ]],
  ];

  const body = `
${U.pageHd('자주 묻는 질문', '두 번째 질문을 펼친 상태입니다')}

${U.banner('info', '☝', `<b>한 번에 하나만 열립니다.</b>
  <p class="t-sub mt1">다른 질문을 누르면 열려 있던 것이 닫힙니다 — 답이 길어 여러 개가 동시에 열리면 읽던 자리를 잃습니다.</p>`)}

${묶음.map(([이름, 목록], gi) => U.sec(`${이름} (${목록.length})`,
    U.accordion(목록.map((it) => ({
      q: it.q,
      a: `${it.a}
        <div class="row-c mt4" style="gap:var(--s3)">
          <span class="t-sub">도움이 되었나요?</span>
          ${U.btnSay('👍 네', '고맙습니다. 더 나은 답을 쓰는 데 쓰겠습니다', { cls: 'btn-ghost btn-sm' })}
          ${U.btnSay('👎 아니요', '어떤 점이 아쉬웠는지 알려주시면 고치겠습니다', { cls: 'btn-ghost btn-sm' })}
        </div>`,
    })), { single: true, open: gi === 0 ? 1 : -1 }), { cls: 'mt6' })).join('')}

${U.card('여기서 못 찾으셨다면', `<p class="t-sub">평일 10:00~18:00 에 답변드립니다. 결제·환불은 보통 한 시간 안에 처리됩니다.</p>
  <div class="btns mt4">
    ${U.btn('1:1 문의하기', { cls: 'btn-primary', href: 'MY-04' })}
    ${U.btnSay('카카오톡 채널', '채널로 이동합니다 (견본이라 열리지 않습니다)', { cls: 'btn-ghost' })}
  </div>`, { cls: 'mt8' })}`;

  return { body, o: { search: false, read: true } };
};

/* ================= HO0202 홈·로그인 > 이어보기 없음 ================= */
P['HO0202'] = () => {
  const 수강중 = MYCOURSES.filter((m) => m.state === '수강 중').slice(0, 2);

  const body = `
${U.pageHd(`${SITE.me.name}님, 첫 차시부터 시작해요`, '아직 본 영상이 없어 이어볼 자리가 없습니다')}

${U.sec('', U.card('', U.empty('▶', '최근 시청 기록이 없어요',
    '강의를 결제하셨지만 아직 영상을 열지 않으셨습니다. 첫 차시는 8분이면 끝나요.',
    `${U.btn('첫 차시 보러 가기', { cls: 'btn-primary btn-lg', href: 'CL-03' })}
     ${U.btn('강의 둘러보기', { cls: 'btn-ghost btn-lg', href: 'CO-01' })}`)))}

${U.sec('결제하신 강의', `<div class="card"><div class="card-bd flush">
  ${수강중.map((m) => {
    const c = byId(m.id);
    return `<a class="lrow" href="${U.link('CL-03')}">
      ${U.ph('강의', 'ph-thumb-sm', c.id)}
      <span class="grow"><b>${c.name}</b>
        <span class="t-sub" style="display:block">1차시 · ${c.by} · 아직 시작 전</span></span>
      <span class="badge b-line">0%</span>
      <span class="muted">›</span></a>`;
  }).join('')}
</div></div>`, { more: 'CL-01', moreLabel: '내 강의실' })}

${U.sec('학습 목표를 정해 두면 이어가기 쉬워요', U.card('', `
  <p class="t-sub mb4">목표를 정하면 홈에 남은 분량이 뜨고, 정한 요일에 알림을 보냅니다. 언제든 바꾸실 수 있습니다.</p>
  ${U.kv([
    ['주당 학습 시간', '<b>3시간</b> — 하루 25분씩 주 5일이면 채워집니다'],
    ['학습할 요일', '월 · 화 · 목 · 금 · 토'],
    ['목표 수료일', '<b>2026-09-30</b> — 남은 30차시 기준으로 계산했습니다'],
  ])}
  <div class="btns mt7">
    ${U.btnSay('이대로 시작하기', '목표를 저장했어요. 월요일 저녁 8시에 알려드릴게요', { cls: 'btn-primary' })}
    ${U.btnSay('직접 정하기', '목표 설정 화면으로 갑니다', { cls: 'btn-ghost' })}
  </div>`), { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= HO0203 홈·로그인 > 마감 임박 과제 알림 ================= */
P['HO0203'] = () => {
  const 목록 = [
    { d: -1, nm: '피벗테이블로 월별 매출 요약하기', c: '엑셀로 시작하는 실무 데이터 분석', due: '어제 23:59', state: '지남' },
    { d: 0, nm: '함수 조합 과제 — VLOOKUP + IFERROR', c: '엑셀로 시작하는 실무 데이터 분석', due: '오늘 23:59', state: '오늘' },
    { d: 1, nm: '크롤링 결과를 CSV 로 저장하기', c: '파이썬 업무 자동화 첫걸음', due: '내일 23:59', state: '임박' },
    { d: 4, nm: '와이어프레임 3장 만들기', c: '피그마로 만드는 서비스 화면', due: '8월 13일 23:59', state: '여유' },
  ];
  const 색 = { 지남: 'b-mut', 오늘: 'b-danger', 임박: 'b-danger', 여유: 'b-line' };

  const body = `
${U.pageHd('마감 임박 과제', '하루 안에 내야 하는 것부터 위에 둡니다')}

${U.banner('danger', '⏰', `<b>오늘 자정까지 내야 하는 과제가 1개 있습니다.</b>
  <p class="t-sub mt1">늦게 내면 감점되지만 제출은 됩니다. 마감 뒤 제출은 강사가 인정할 때만 채점됩니다.</p>`,
    U.btn('지금 제출하기', { cls: 'btn-primary', href: 'CL-05' }))}

${U.sec('', `<div class="card mt6"><div class="card-bd flush">
  ${목록.map((a) => `<a class="lrow${a.state === '지남' ? ' is-off' : ''}" href="${U.link('CL-05')}">
    <span class="badge ${색[a.state]}">${a.d < 0 ? '마감 지남' : a.d === 0 ? 'D-DAY' : `D-${a.d}`}</span>
    <span class="grow"><b>${a.nm}</b>
      <span class="t-sub" style="display:block">${a.c} · ${a.due}</span></span>
    <span class="muted">${a.state === '지남' ? '늦은 제출' : '제출하기'} ›</span></a>`).join('')}
</div></div>`)}

${U.card('알림을 어떻게 받을지', `${U.kv([
    ['마감 하루 전', '저녁 8시에 한 번'],
    ['마감 당일', '오전 10시 · 저녁 9시 두 번'],
    ['마감 지난 뒤', '보내지 않습니다 — 이미 늦은 일로 계속 알리지 않습니다'],
  ])}
  <div class="btns mt7">
    ${U.btnSay('알림 다시 받기', '이 과제 알림을 다시 켰어요', { cls: 'btn-ghost' })}
    ${U.btn('전체 과제 보기', { cls: 'btn-ghost', href: 'CL-05' })}
  </div>`, { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= HO0204 홈·로그인 > 학습 습관 캘린더 ================= */
P['HO0204'] = () => {
  const body = `
${U.pageHd('학습 습관', '최근 3개월 · 칸에 마우스를 올리면 그날 학습 시간이 보입니다')}

${U.sec('', `<div class="g3 mb4">
  ${U.stat('연속 학습일', '12', { unit: '일', ico: '🔥', cls: 's-ok', note: '오늘까지' })}
  ${U.stat('최고 기록', '23', { unit: '일', ico: '🏆', cls: 's-acc', note: '2026년 6월' })}
  ${U.stat('3개월 학습일', '58', { unit: '일', ico: '📅', note: '92일 중 63%' })}
</div>
${U.card('', `<div class="row-b mb4">
    ${U.btnSay('‹ 이전 3개월', '2026년 2~4월로 옮겼어요', { cls: 'btn-ghost btn-sm' })}
    <b>2026년 5월 ~ 8월</b>
    ${U.btnSay('다음 3개월 ›', '이미 가장 최근입니다', { cls: 'btn-ghost btn-sm' })}
  </div>
  ${U.grass(13)}`)}`)}

${U.card('색이 뜻하는 것', `${U.kv([
    ['빈 칸', '그날은 학습하지 않았습니다 — 회색으로 둡니다'],
    ['옅은 색', '30분 미만'],
    ['중간 색', '30분 ~ 1시간 30분'],
    ['진한 색', '1시간 30분 이상'],
  ])}
  <p class="t-sub mt4">연속 학습일은 <b>자정을 기준</b>으로 셉니다. 새벽 2시에 본 것은 전날이 아니라 그날로 칩니다.</p>`,
    { cls: 'mt6' })}`;

  return { body, o: {} };
};

/* ================= TC0102 강사센터 홈 > 수강 신청 추이 차트 ================= */
P['TC0102'] = () => {
  const 강의들 = MYTEACH.slice(0, 3);
  /* TREND 는 7·30·90 으로 이미 나뉘어 있다 — 기간 전환이 이 화면의 주제라 그대로 쓴다. */
  const 기간 = [
    { key: 'd7', label: '7일', vals: TREND[7], labels: ['8/3', '8/5', '8/7', '8/9'] },
    { key: 'd30', label: '30일', vals: TREND[30], labels: ['7/11', '7/21', '7/31', '8/9'] },
    { key: 'd90', label: '90일', vals: TREND[90], labels: ['5/12', '6/11', '7/11', '8/9'] },
  ];

  const 판 = 기간.map((p, i) => U.pane(p.key, `
    ${U.lineChart(p.vals, { labels: p.labels, alt: `최근 ${p.label} 수강 신청 추이` })}
    <div class="g3 mt6">
      ${U.stat('기간 합계', p.vals.reduce((a, b) => a + b, 0) + '건', { ico: '🧾', delta: i === 0 ? 4 : i === 1 ? 38 : 112 })}
      ${U.stat('하루 평균', (p.vals.reduce((a, b) => a + b, 0) / p.vals.length).toFixed(1) + '건', { ico: '📈' })}
      ${U.stat('가장 많았던 날', '8월 6일', { ico: '⭐', cls: 's-acc', note: '19건 · 기획전 노출일' })}
    </div>`, i === 1)).join('');

  const body = `
${U.pageHd('수강 신청 추이', '기간과 강의를 바꾸면 그래프가 함께 바뀝니다')}

${U.sec('', `
  <div class="row-b wrap-row mb4" style="gap:var(--s4)">
    ${U.tabs(기간.map((p) => ({ label: p.label, pane: p.key })), 1, { panes: 'tc-trend' })}
    ${U.fchips('tc-course', 'course', [['*', '전체 강의'], ...강의들.map((t) => [t.id, byId(t.id).name.slice(0, 12)])])}
  </div>
  <div data-panes-set="tc-trend">${판}</div>
`)}

${U.banner('info', '⚠', `<b>데이터가 없는 구간은 0 이 아니라 «빈 곳»으로 둡니다.</b>
  <p class="t-sub mt1">강의를 열기 전 날짜까지 0 으로 그리면 그래프가 실제보다 나빠 보입니다.
  7월 11일 이전은 이 강의가 없던 기간이라 선이 시작되지 않습니다.</p>`)}

${U.card('숫자를 읽는 법', U.kv([
    ['수강 신청', '결제가 끝난 건만 셉니다 — 장바구니에 담은 것은 빼고 셉니다'],
    ['전일 대비', '어제 같은 시각까지와 견줍니다. 오늘은 아직 진행 중이라 옅게 표시합니다'],
    ['환불', '신청에서 빼지 않고 따로 봅니다 — 정산 화면에서 확인하세요'],
  ]), { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};

/* ================= TC0103 강사센터 홈 > 처리할 일 없음 ================= */
P['TC0103'] = () => {
  const body = `
${U.pageHd('오늘 처리할 일이 없습니다', '검수 대기 · 채점 대기 · 진도 독려가 모두 0건입니다')}

${U.sec('', U.card('', U.empty('✅', '밀린 일이 없어요',
    '채점도 끝났고 검수 중인 강의도 없습니다. 다음 주 학생들이 과제를 내면 다시 여기에 쌓입니다.',
    `${U.btn('새 강의 개설하기', { cls: 'btn-primary btn-lg', href: 'CU-01' })}
     ${U.btn('학생 관리', { cls: 'btn-ghost btn-lg', href: 'ST-01' })}`)))}

${U.sec('지난주에 하신 일', `<div class="g3">
  ${U.stat('채점한 과제', '42', { unit: '건', ico: '✍', delta: 8 })}
  ${U.stat('답변한 질문', '11', { unit: '건', ico: '💬', cls: 's-acc', delta: 3 })}
  ${U.stat('새 수강생', '27', { unit: '명', ico: '🎓', cls: 's-ok', delta: 5 })}
</div>`, { cls: 'mt6', desc: '8월 3일 ~ 8월 9일' })}

${U.sec('비어 있는 동안 해 두면 좋은 것', `<div class="g3">
  ${U.card('미리보기 영상 올리기', `<p class="t-sub">미리보기가 있는 강의는 결제 전환율이 <b>1.7배</b>입니다. 3분이면 충분합니다.</p>
    <div class="btns mt4">${U.btn('강의 관리로', { cls: 'btn-ghost btn-sm', href: 'CU-01' })}</div>`)}
  ${U.card('진도 미달 학생에게 한마디', `<p class="t-sub">2주 넘게 안 들어온 학생이 <b>6명</b> 있습니다. 독려 메시지를 한 번에 보낼 수 있어요.</p>
    <div class="btns mt4">${U.btn('학생 관리로', { cls: 'btn-ghost btn-sm', href: 'ST-01' })}</div>`)}
  ${U.card('후기에 답글 달기', `<p class="t-sub">답글이 달린 후기는 다른 수강생이 <b>더 오래</b> 읽습니다. 미답변 4건이 있습니다.</p>
    <div class="btns mt4">${U.btn('후기 보기', { cls: 'btn-ghost btn-sm', href: 'GR-01' })}</div>`)}
</div>`, { cls: 'mt6' })}`;

  return { body, o: { admin: true } };
};
