/* HO 홈 · TC 강사센터 */
import * as U from './ui.mjs';
import { SITE, CATS, COURSES, MYCOURSES, REVIEWS, FAQ, QNA, TREND, STUDY_WEEK, STUDY_MONTH, MYTEACH, NOTICES, byId } from './data.mjs';

const P = {};
export default P;

/* ================= HO-01 홈 · 비로그인 ================= */
P['HO-01'] = () => {
  const pop = COURSES.slice(0, 8);
  const fresh = [COURSES[5], COURSES[8], COURSES[6], COURSES[10], COURSES[9], COURSES[11]];
  const tabCats = ['데이터', '개발', '디자인'];

  const body = `
${U.sec('', `
  <div class="card"><div class="card-bd">
    <div class="row-b wrap-row" style="gap:var(--s6)">
      <div class="grow" style="min-width:280px">
        <h1 class="t-page">배우고 싶은 것을 <span class="mark">오늘</span> 시작하세요</h1>
        <p class="t-sub mt3" style="font-size:15px">직장인과 학원 수강생을 위한 온라인 강의 플랫폼. 영상으로 배우고, 과제로 확인하고, 수료증으로 남깁니다.</p>
        <form class="mt4" role="search" onsubmit="return false">
          <div class="input-row"><input class="input" type="search" placeholder="강의명, 강사명, 분야로 찾아보세요" data-search="pop" aria-label="강의 검색">
          ${U.btn('검색', { cls: 'btn-primary', attr: ' data-toast="아래 목록이 검색어에 맞게 걸러졌어요"' })}</div>
        </form>
        <div class="chips mt3"><span class="t-sub">인기 검색어</span>
          ${['엑셀', '파이썬', '피그마', 'SQL', '영어'].map((k) => `<button class="chip chip-sm" type="button" data-fillsearch="pop" data-v="${k}">${k}</button>`).join('')}
        </div>
      </div>
      <div style="width:300px;flex:none">${U.ph('서비스 소개', 'ph-43', 'hero')}</div>
    </div>
  </div></div>
`)}

<div class="g4 mb6">
  ${U.stat('누적 수강생', '32,480', { unit: '명', ico: '👥', note: '지난달보다 1,240명 늘었어요' })}
  ${U.stat('열려 있는 강의', '1,280', { unit: '개', ico: '📚', cls: 's-acc s-ink', note: '8개 분야' })}
  ${U.stat('평균 만족도', '4.8', { unit: '점', ico: '⭐', cls: 's-ink', note: '후기 24,180개 기준' })}
  ${U.stat('발급 수료증', '12,400', { unit: '장', ico: '🎓', cls: 's-ok s-ink', note: '수료율 62%' })}
</div>

${U.sec('무엇을 배우고 싶으세요?', `
  <div class="g4 gap-s" data-fset>
    ${CATS.map((c) => `<button class="stat s-mut" type="button" data-fgroup="pop" data-f="cat" data-v="${c.key}">
      <span class="l">${c.ico} ${c.key}</span><span class="v" style="font-size:24px;color:var(--text)">${c.n}<small>개</small></span>
      <span class="foot"><span class="t-sub">눌러서 아래 목록 거르기</span></span></button>`).join('')}
  </div>
  <div class="chips mt4"><button class="chip on" type="button" data-fgroup="pop" data-f="cat" data-v="*">전체 보기</button>
    <span class="t-sub">지금 <b data-fcount="pop">8</b>개 강의를 보고 있어요</span></div>
`, { desc: '분야를 고르면 아래 인기 강의가 그 분야만 남습니다' })}

${U.sec('이번 주 인기 강의', `<div class="g4" data-list="pop">${U.ccards(pop, { cols: 4 })}</div>
  <div class="empty mt4" data-list-empty="pop" hidden><div class="ico">🔍</div><h3 class="t-sec mt3">고른 조건에 맞는 강의가 없어요</h3>
  <div class="btns"><button class="btn btn-primary" type="button" data-freset="pop">조건 모두 풀기</button></div></div>`,
    { more: 'CO-01', moreLabel: '강의 전체 보기' })}

${U.sec('새로 열린 강의', `
  <div class="rail" data-railbox="fresh">${U.ccards(fresh, { cols: 4 })}</div>
`, {
    aside: `<div class="rail-hd" data-rail="fresh"><div class="nav">
    <button type="button" data-raildir="prev" aria-label="이전">‹</button>
    <button type="button" data-raildir="next" aria-label="다음">›</button></div></div>`,
  })}

${U.sec('이달의 기획전', `<div class="g2">
  <a class="ccard" href="${U.link('CO-01')}">${U.ph('기획전 배너 · 신규 가입 할인', 'ph-43', 'ev1')}
    <div class="nm">처음 오셨나요 — 첫 수강 20% 할인</div><div class="by">가입하면 바로 쓰는 쿠폰을 드려요</div></a>
  <a class="ccard" href="${U.link('CO-01')}">${U.ph('기획전 배너 · 패키지 강의', 'ph-43', 'ev2')}
    <div class="nm">묶어 들으면 더 쌉니다 — 패키지 3종</div><div class="by">데이터 · 개발 · 디자인 입문 묶음</div></a>
</div>`)}

${U.sec('분야별 추천', `
  ${U.tabs(tabCats.map((c, i) => ({ label: c, pane: 'cat' + i })), 0, { pill: true, panes: 'rec' })}
  <div data-pane-set="rec">
    ${tabCats.map((c, i) => U.pane('cat' + i, `<div class="g3">${U.ccards(COURSES.filter((x) => x.cat === c).slice(0, 3), { cols: 3 })}</div>`, i === 0)).join('')}
  </div>
`)}

${U.sec('먼저 들은 분들의 이야기', `<div class="g3">${REVIEWS.map((r) => `<div class="card"><div class="card-bd">
    <div class="row-c">${U.ph('프로필', 'ph-ava-sm', r.who)}<div><b>${r.who}</b><div class="t-sub">${r.course}</div></div></div>
    <div class="mt3">${U.stars(r.rate)}</div>
    <p class="t-sub mt2" style="font-size:14px;color:var(--text)">${r.txt}</p></div></div>`).join('')}</div>`)}

${U.sec('', U.banner('acc', '🎤', `<b>가르치는 일에 관심 있으세요?</b><br><span class="t-sub">강의를 열고 정산까지 한 곳에서 관리할 수 있어요. 심사는 영업일 기준 3~5일 걸립니다.</span>`,
    U.btn('강사 지원하기', { cls: 'btn-primary', href: 'TC-02' })))}

${U.sec('자주 묻는 질문', U.card('', U.accordion(FAQ.map((f) => ({ q: f.q, a: f.a })), { single: true, open: 0 }), { bdCls: 'tight' }),
    { desc: '한 번에 하나씩 열립니다' })}

${U.sec('', `<div class="box-pri center">
  <h2 class="t-sec">오늘 시작하면 첫 강의는 20% 할인</h2>
  <p class="t-sub mt2">가입만 해도 쿠폰이 바로 들어옵니다</p>
  <div class="btns mt7" style="justify-content:center">
    ${U.btn('회원가입하고 쿠폰 받기', { cls: 'btn-primary btn-lg', href: 'AU-02' })}
    ${U.btn('강의 둘러보기', { cls: 'btn-ghost btn-lg', href: 'CO-01' })}
    ${U.btn('로그인', { cls: 'btn-ghost btn-lg', href: 'MY-01' })}
  </div></div>`)}
`;
  return { body, o: { searchPh: '배우고 싶은 것을 검색해 보세요' } };
};

/* ================= HO-02 홈 · 수강생 로그인 ================= */
P['HO-02'] = () => {
  const cur = MYCOURSES.filter((m) => m.state === '수강 중');
  const wkTotal = STUDY_WEEK.reduce((a, b) => a + b, 0);
  const moTotal = STUDY_MONTH.reduce((a, b) => a + b, 0);

  const body = `
${U.pageHd(`${SITE.me.name}님, 오늘도 한 걸음`, '어제까지 12일 연속으로 학습했어요')}

${U.sec('', U.card('', `
  <div class="row wrap-row" style="gap:var(--s6)">
    <div style="width:240px;flex:none">${U.ph('강의 썸네일', 'ph-43', 'C01')}</div>
    <div class="grow" style="min-width:260px">
      <div class="badges mb2">${U.badge('이어보기', 'b-pri')}${U.badge('데이터', 'b-line')}</div>
      <h2 class="t-sec" data-hero-nm>엑셀로 시작하는 실무 데이터 분석</h2>
      <p class="t-sub mt1"><span data-hero-ep>12차시 · 슬라이서로 걸러 보기</span> · 8분 32초 남음</p>
      <div class="mt4">${U.barRow(40, { title: '30차시 중 12차시' })}</div>
      <p class="t-sub mt2"><b data-hero-done>12</b>/<span data-hero-total>30</span>차시 · 마지막 학습 2026-08-05</p>
      <div class="btns mt7">
        ${U.btn('이어보기', { cls: 'btn-primary btn-lg', href: 'CL-03' })}
        ${U.btn('내 강의실', { cls: 'btn-ghost btn-lg', href: 'CL-01' })}
      </div>
    </div>
  </div>`))}

${U.sec('이번 학습 요약', `
  ${U.tabs([{ label: '이번 주', swap: 'sum:week' }, { label: '이번 달', swap: 'sum:month' }], 0, { pill: true })}
  <div data-swap-set="sum">
    <div data-swap-key="week">
      <div class="g3 mb4">
        ${U.stat('학습 시간', Math.floor(wkTotal / 60) + '시간 ' + (wkTotal % 60) + '분', { ico: '⏱', delta: 62, deltaUnit: '분', spark: U.spark(STUDY_WEEK) })}
        ${U.stat('완료한 차시', '9', { unit: '차시', ico: '✅', cls: 's-acc', delta: 3, spark: U.spark([1, 2, 0, 2, 1, 2, 1]) })}
        ${U.stat('연속 학습일', '12', { unit: '일', ico: '🔥', cls: 's-ok', delta: 1, spark: U.spark([6, 7, 8, 9, 10, 11, 12]) })}
      </div>
      ${U.card('요일별 학습 시간 (분)', U.barChart(STUDY_WEEK, ['월', '화', '수', '목', '금', '토', '일'], { alt: '이번 주 요일별 학습 시간' }))}
    </div>
    <div data-swap-key="month" hidden>
      <div class="g3 mb4">
        ${U.stat('학습 시간', Math.floor(moTotal / 60) + '시간 ' + (moTotal % 60) + '분', { ico: '⏱', delta: 410, deltaUnit: '분', spark: U.spark(STUDY_MONTH) })}
        ${U.stat('완료한 차시', '38', { unit: '차시', ico: '✅', cls: 's-acc', delta: 11, spark: U.spark([2, 4, 3, 5, 4, 6, 5, 4]) })}
        ${U.stat('연속 학습일', '12', { unit: '일', ico: '🔥', cls: 's-ok', delta: 0, spark: U.spark([9, 10, 11, 12, 12, 12]) })}
      </div>
      ${U.card('주차별 학습 시간 (분)', U.barChart(STUDY_MONTH, ['1주', '2주', '3주', '4주', '5주', '6주', '7주', '8주', '9주', '10주', '11주', '12주'], { alt: '이번 달 주차별 학습 시간' }))}
    </div>
  </div>
`, { desc: '기간을 바꾸면 숫자와 그래프가 함께 바뀝니다' })}

${U.sec('수강 중인 강의', `<div class="card"><div class="card-bd flush">
  ${cur.map((m) => {
    const c = byId(m.id);
    const pct = Math.round(m.done / m.total * 100);
    return `<div class="lrow">
      ${U.ph('강의 썸네일', 'ph-thumb', c.id)}
      <div class="grow"><div class="nm">${c.name}</div>
        <div class="sub">${c.by} · 남은 차시 ${m.total - m.done}개 · 마지막 학습 ${m.last}</div>
        <div class="mt2" style="max-width:320px">${U.barRow(pct, { title: `${m.total}차시 중 ${m.done}차시` })}</div></div>
      <button class="btn btn-soft" type="button" data-pick-course data-nm="${c.name}" data-ep="${m.done + 1}차시부터 이어서" data-done="${m.done}" data-total="${m.total}" data-pct="${pct}">위로 올리기</button>
      ${U.btn('이어보기', { cls: 'btn-primary', href: 'CL-03' })}
    </div>`;
  }).join('')}
</div></div>`, { more: 'CL-01', moreLabel: '내 강의실' })}

<div class="g2 mb6">
  ${U.card('마감이 다가온 과제', `<ul class="list-plain">
    ${[['3장 과제 — 부서별 실적 대시보드', 'D-2', 'b-danger'], ['영어 회화 8주차 녹음 과제', 'D-5', 'b-warn'], ['SQL 실습 과제 2', 'D-9', 'b-mut']]
      .map(([t, d, k]) => `<li>${U.badge(d, k)}<span class="grow">${t}</span><a class="btn btn-ghost btn-sm" href="${U.link('CL-05')}">제출하기</a></li>`).join('')}
  </ul>`, { bdCls: 'tight' })}
  ${U.card('답변을 기다리는 내 질문', `<ul class="list-plain">
    ${QNA.filter((q) => q.mine).map((q) => `<li><span class="grow">${q.t}<div class="t-sub">${q.ep} · ${q.at}</div></span>
      ${U.badge(q.answered ? '답변 완료' : '답변 대기', q.answered ? 'b-ok' : 'b-warn')}</li>`).join('')}
    <li><a class="btn btn-ghost btn-sm btn-block" href="${U.link('CL-07')}">질문 게시판 열기</a></li>
  </ul>`, { bdCls: 'tight' })}
</div>

${U.sec('', U.banner('ok', '🎓', `<b>「하루 20분 비즈니스 영어 회화」 수료까지 2차시 남았어요</b><br>
  <span class="t-sub">진도율 80%를 넘기면 수료증을 바로 받을 수 있습니다</span>`, U.btn('수료 조건 보기', { cls: 'btn-primary', href: 'CL-08' })))}

${U.sec('학습 습관', `${U.card('', `${U.grass()}
  <div class="row-b mt4 wrap-row"><div class="t-sub" data-grass-out>칸을 누르면 그날 무엇을 얼마나 들었는지 보여요</div>
  <div class="legend"><span>적음</span><i style="background:#FBD3CA"></i><i style="background:#F7A695"></i><i style="background:#F0654F"></i><i style="background:#C4432E"></i><span>많음</span></div></div>`)}`,
    { desc: '최근 3개월 · 칸 하나가 하루입니다' })}

${U.sec('이런 강의는 어때요', `<div class="rail" data-railbox="rec2">${U.ccards([COURSES[6], COURSES[10], COURSES[3], COURSES[9], COURSES[5], COURSES[11]], { cols: 4 })}</div>`, {
    aside: `<div class="rail-hd" data-rail="rec2"><div class="nav">
    <button type="button" data-raildir="prev" aria-label="이전">‹</button><button type="button" data-raildir="next" aria-label="다음">›</button></div></div>`,
  })}

${U.sec('관심 분야 새 강의 · 데이터', `<div class="g3">${U.ccards(COURSES.filter((c) => c.cat === '데이터'), { cols: 3 })}</div>`)}

${U.sec('', `<div class="box center">
  <h3 class="t-sec">다 들은 강의, 한마디 남겨 주실래요?</h3>
  <p class="t-sub mt2">후기를 쓰면 다음 결제에 쓸 수 있는 3,000원 쿠폰을 드려요</p>
  <div class="btns mt7" style="justify-content:center">
    ${U.btnSay('후기 쓰러 가기', '후기 작성은 서버가 연결되면 저장됩니다', { cls: 'btn-primary btn-lg' })}
    ${U.btn('수강 이력 보기', { cls: 'btn-ghost btn-lg', href: 'MY-02' })}</div></div>`)}
`;
  return { body, o: {} };
};

/* ================= TC-01 강사센터 홈 ================= */
P['TC-01'] = () => {
  const todo = [
    ['검수 대기 강의', 1, 'CU-06', 'b-warn'],
    ['채점 대기 과제', 24, 'GR-02', 'b-danger'],
    ['진도 미달 학생', 32, 'ST-04', 'b-warn'],
    ['미답변 질문', 2, 'CL-07', 'b-mut'],
  ];
  const rows = MYTEACH.map((t) => {
    const c = byId(t.id);
    return {
      attr: ' data-row',
      cells: [
        `<b>${c.name}</b><div class="t-sub">${U.badge(t.st, t.stCls)}</div>`,
        { t: U.nf(t.students) + '명', v: t.students, cls: 'right' },
        { t: t.rate ? U.stars(t.rate) + ' ' + t.rate.toFixed(1) : '—', v: t.rate, cls: 'right' },
        { t: `<div style="min-width:120px">${U.barRow(t.done)}</div>`, v: t.done },
        { t: t.edited, v: t.edited },
        `<a class="btn btn-ghost btn-sm" href="${U.link('CU-03')}">편성</a>`,
      ],
    };
  });

  const body = `
${U.pageHd('강사센터', `${SITE.teacher.name} 강사님 · 오늘은 2026년 8월 7일이에요`, `
  ${U.btn('새 강의 개설', { cls: 'btn-primary', href: 'CU-02' })}
  ${U.btn('학생 관리', { cls: 'btn-ghost', href: 'ST-01' })}
  ${U.btn('채점하기', { cls: 'btn-ghost', href: 'GR-02' })}`)}

<div class="g4 mb6">
  ${U.stat('개설한 강의', '5', { unit: '개', ico: '📚', delta: 1, spark: U.spark([2, 2, 3, 3, 4, 4, 5]), attr: ' data-sort-table="#perf" data-sort-col="0"' })}
  ${U.stat('총 수강생', '427', { unit: '명', ico: '👥', cls: 's-acc', delta: 38, spark: U.spark([280, 305, 330, 348, 372, 401, 427]), attr: ' data-sort-table="#perf" data-sort-col="1"' })}
  ${U.stat('채점 대기', '24', { unit: '건', ico: '📝', cls: 's-mut s-ink', delta: -6, spark: U.spark([41, 38, 34, 33, 29, 27, 24]), attr: ' data-sort-table="#perf" data-sort-col="3"' })}
  ${U.stat('이번 달 예상 정산', '11,304,000', { unit: '원', ico: '💰', cls: 's-ok', delta: 1820000, deltaUnit: '원', spark: U.spark([6.2, 7.1, 8.4, 8.0, 9.5, 10.2, 11.3]), attr: ' data-sort-table="#perf" data-sort-col="1"' })}
</div>
<p class="t-sub mb6">지표 카드를 누르면 아래 「강의별 성과」 표가 그 기준으로 다시 정렬됩니다.</p>

${U.sec('처리가 필요한 일', U.card('', `
  <ul class="list-plain">${todo.map(([t, n, go, k]) => `<li data-row>
    ${U.badge(U.nf(n) + '건', k)}<span class="grow">${t}</span>
    <a class="btn btn-ghost btn-sm" href="${U.link(go)}">보러 가기</a>
    <button class="btn btn-soft btn-sm" type="button" data-resolve="todo" data-n="${n}">처리 완료</button>
  </li>`).join('')}</ul>
  <div class="empty" data-resolve-empty="todo" hidden style="padding:32px"><div class="ico">🎉</div><h3 class="t-sec mt3">밀린 일이 없어요</h3></div>`,
    { aside: `<span class="t-sub">남은 일 <b class="pri" data-resolve-count="todo">${todo.reduce((a, b) => a + b[1], 0)}</b>건</span>`, bdCls: 'tight' }))}

${U.sec('수강 신청 추이', `
  ${U.tabs([{ label: '7일', swap: 'trend:7' }, { label: '30일', swap: 'trend:30' }, { label: '90일', swap: 'trend:90' }], 1, { pill: true })}
  <div data-swap-set="trend">
    ${[7, 30, 90].map((d) => `<div data-swap-key="${d}"${d === 30 ? '' : ' hidden'}>
      ${U.card('', `<div class="row-b wrap-row mb4">
        <div><div class="t-sub">최근 ${d}일 신청</div><div class="t-sec">${U.nf(TREND[d].reduce((a, b) => a + b, 0))}건</div></div>
        <div><div class="t-sub">직전 ${d}일 대비</div><div>${U.delta(d === 7 ? 41 : d === 30 ? 312 : 684, '건')}</div></div>
        <div><div class="t-sub">하루 평균</div><div class="t-sec">${Math.round(TREND[d].reduce((a, b) => a + b, 0) / TREND[d].length)}건</div></div>
      </div>
      ${U.lineChart(TREND[d], { labels: d === 7 ? ['8/1', '8/4', '8/7'] : d === 30 ? ['7/9', '7/23', '8/7'] : ['5/10', '6/25', '8/7'], alt: `최근 ${d}일 수강 신청 추이` })}`)}
    </div>`).join('')}
  </div>
`, { desc: '기간을 바꾸면 차트와 옆 숫자가 함께 바뀝니다' })}

${U.sec('강의별 성과', U.table(
    [{ t: '강의', sort: 'text' }, { t: '수강생', sort: 'num', w: '110px' }, { t: '평점', sort: 'num', w: '130px' }, { t: '완주율', sort: 'num', w: '170px' }, { t: '최근 수정', sort: 'text', w: '120px' }, { t: '', w: '90px' }],
    rows, { attr: ' id="perf"', scroll: true }))}

<div class="g2 mb6">
  ${U.card('최근 수강 후기', `<ul class="list-plain">${REVIEWS.slice(0, 5).map((r) => `<li>
    <span class="grow"><b>${U.stars(r.rate)}</b> ${r.txt.slice(0, 34)}…<div class="t-sub">${r.course} · ${r.who}</div></span></li>`).join('')}
    </ul>`, { bdCls: 'tight' })}
  ${U.card('답변을 기다리는 질문', `<ul class="list-plain">${QNA.filter((q) => !q.answered).map((q) => `<li>
    <span class="grow">${q.t}<div class="t-sub">${q.ep} · ${q.at}</div></span>
    <a class="btn btn-ghost btn-sm" href="${U.link('CL-07')}">답하기</a></li>`).join('')}
    </ul>`, { bdCls: 'tight' })}
</div>

<div class="g2 mb6">
  ${U.card('진도 미달 학생', `
    <div class="row-b"><div><div class="t-sub">진도율 30% 미만 · 14일 이상 미접속</div><div class="t-page pri">32<small style="font-size:18px">명</small></div></div>
    <div style="width:120px">${U.spark([18, 22, 25, 27, 30, 31, 32])}</div></div>
    <div class="btns mt7">${U.btn('일괄 독려 메시지 보내기', { cls: 'btn-primary', href: 'ST-05' })}${U.btn('명단 보기', { cls: 'btn-ghost', href: 'ST-04' })}</div>`)}
  ${U.card('이번 달 정산 예정', `
    ${U.sumRows([['총 매출', '14,130,000원'], ['플랫폼 수수료 20%', '-2,826,000원']], ['실 정산액', '11,304,000원'])}
    <p class="t-sub mt3">8월 15일에 등록된 계좌로 지급됩니다</p>
    <div class="btns mt7">${U.btn('정산 내역 보기', { cls: 'btn-ghost', href: 'MY-03' })}</div>`)}
</div>

${U.sec('플랫폼 공지', U.card('', `<ul class="list-plain">${NOTICES.map((n) => `<li>
  ${n.new ? U.badge('NEW', 'b-acc') : ''}<span class="grow">${n.t}</span><span class="t-sub">${n.at}</span></li>`).join('')}</ul>`, { bdCls: 'tight' }))}
`;
  return { body, o: { admin: true, search: false } };
};

/* ================= TC-02 강사 지원 ================= */
P['TC-02'] = () => {
  const body = `
${U.pageHd('강사로 활동해 보세요', '심사는 영업일 기준 3~5일 걸립니다')}

<div class="g3 mb6">
  ${[['📌', '전문성', '해당 분야 실무 경력 2년 이상 또는 그에 준하는 자격'], ['🎬', '강의 품질', '소리와 화면이 또렷한 영상 · 차시당 10분 이상'], ['🤝', '수강생 응대', '질문에 영업일 기준 2일 안에 답할 수 있는 분']]
      .map(([i, t, d]) => `<div class="card"><div class="card-bd"><div style="font-size:26px">${i}</div>
      <h3 class="t-card mt2">${t}</h3><p class="t-sub mt2">${d}</p></div></div>`).join('')}
</div>

<div class="split-r">
  <div>
    ${U.card('지원서', `
      <div class="field"><label class="lb" for="tc-nick">활동명<span class="req">*</span></label>
        <input class="input" id="tc-nick" data-gate="apply" data-label="활동명" placeholder="수강생에게 보일 이름"></div>
      <div class="field"><label class="lb" for="tc-intro">한 줄 소개<span class="req">*</span></label>
        <input class="input" id="tc-intro" data-gate="apply" data-label="한 줄 소개" data-charcount="intro" maxlength="60" placeholder="어떤 걸 가르치는 분인지 한 줄로">
        <div class="help"><b data-charout="intro">0</b>/60자</div></div>

      <div class="field"><span class="lb">전문 분야<span class="req">*</span> <span class="t-sub">(여러 개 고를 수 있어요 · 최대 3개)</span></span>
        <div class="chips">${CATS.map((c) => `<button class="chip" type="button" data-pickchip="field" data-v="${c.key}" data-max="3">${c.ico} ${c.key}</button>`).join('')}</div>
        <div class="help">고른 분야 — <b data-pickout="field">아직 고르지 않았어요</b></div></div>

      <div class="field"><label class="lb" for="tc-career">경력<span class="req">*</span></label>
        <textarea class="input" id="tc-career" data-gate="apply" data-label="경력" placeholder="어디서 무엇을 얼마나 했는지 적어 주세요"></textarea></div>

      <div class="field"><span class="lb">경력·자격 증빙</span>
        <div class="drop" data-drop="proof"><div class="ico">📎</div>
          <p class="mt2"><b>파일을 끌어다 놓거나 눌러서 고르세요</b></p>
          <p class="t-sub">PDF · JPG · PNG · 최대 5개 · 개당 10MB</p></div>
        <div data-filebox="proof" data-max="5" data-names="경력증명서.pdf,자격증.jpg,포트폴리오.pdf,수상내역.png,재직증명서.pdf"></div>
        <div class="help">올린 파일 <b data-fileout="proof">0/5개 · 0.0MB</b></div></div>

      <div class="field"><label class="lb" for="tc-topic">개설하고 싶은 강의 주제</label>
        <input class="input" id="tc-topic" placeholder="예 · 실무자를 위한 데이터 시각화"></div>

      <h3 class="t-card mt6 mb3">정산 계좌</h3>
      <div class="g3 gap-s">
        <div class="field"><label class="lb" for="tc-bank">은행<span class="req">*</span></label>
          <select class="input" id="tc-bank" data-gate="apply" data-label="은행"><option value="">고르기</option>
          ${['국민', '신한', '우리', '하나', '농협', '카카오뱅크', '토스뱅크'].map((b) => `<option>${b}</option>`).join('')}</select></div>
        <div class="field"><label class="lb" for="tc-acc">계좌번호<span class="req">*</span></label>
          <input class="input" id="tc-acc" data-gate="apply" data-label="계좌번호" inputmode="numeric" placeholder="- 없이 숫자만"></div>
        <div class="field"><label class="lb" for="tc-owner">예금주<span class="req">*</span></label>
          <input class="input" id="tc-owner" data-gate="apply" data-label="예금주"></div>
      </div>

      <label class="check mt4"><input type="checkbox" data-gate="apply" data-label="강사 이용약관 동의">
        <span>강사 이용약관과 정산 규정에 동의합니다<span class="req">*</span> <button class="btn-link" type="button" data-toast="약관 전문은 서버가 연결되면 열립니다">전문 보기</button></span></label>

      <div class="err-msg mt4" data-gatemsg="apply" hidden></div>
    `, {
      ft: `<div class="row-b wrap-row"><span class="t-sub">심사는 영업일 기준 3~5일 걸려요</span>
      <div class="btns">${U.btnSay('임시 저장', '임시 저장은 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
      <a class="btn btn-primary is-off" href="${U.link('TC-03')}" data-gated="apply">지원서 제출</a></div></div>`,
    })}
  </div>

  <aside class="sticky">
    ${U.card('심사는 이렇게 진행돼요', `
      ${U.steps(['접수', '서류 확인', '최종 승인'], 0)}
      <p class="t-sub mt4">제출하면 바로 접수되고, 담당자가 서류를 확인합니다. 보완이 필요하면 메일로 알려 드려요.</p>
      <div class="btns mt7">${U.btn('지원 현황 보기', { cls: 'btn-ghost btn-block', href: 'TC-03' })}</div>`)}
    <div class="mt4">${U.card('알아 두실 것', `<ul class="list-plain">
      <li>· 정산은 매월 15일에 전월 매출을 지급합니다</li>
      <li>· 플랫폼 수수료는 판매가의 20%입니다</li>
      <li>· 심사 중에도 수강생으로 강의를 들을 수 있어요</li></ul>`, { bdCls: 'tight' })}</div>
  </aside>
</div>
`;
  return { body, o: { admin: true, search: false } };
};

/* ================= TC-03 강사 지원 · 심사 중 ================= */
P['TC-03'] = () => {
  const body = `
${U.pageHd('지원 현황', '접수 번호 AP-2026-0812')}

${U.card('', `
  <div class="center" style="padding:8px 0 var(--s6)">
    ${U.steps(['접수 완료', '서류 확인 중', '최종 승인'], 1)}
  </div>
  ${U.kv([['접수 일시', '2026년 8월 12일 14:22'], ['예상 완료일', '<b class="pri">9월 18일쯤</b>'], ['담당', '강사 심사팀']])}
`)}

<div class="mt4">${U.banner('warn', '⚠️', `<b>보완 요청이 왔어요</b><br>
  <span class="t-sub">경력증명서의 재직 기간이 지원서에 적으신 내용과 달라요. 확인 후 다시 올려 주세요. (요청일 2026-08-14)</span>`,
    U.btn('다시 제출하기', { cls: 'btn-primary', href: 'TC-02' }))}</div>

<div class="g2 mt6">
  ${U.card('제출한 내용', `${U.kv([
    ['활동명', '박지훈'],
    ['한 줄 소개', '실무에서 쓰는 데이터를 가르칩니다'],
    ['전문 분야', '데이터 · 개발'],
    ['증빙 파일', '3개 (경력증명서.pdf 외 2개)'],
    ['개설 예정 주제', '실무자를 위한 데이터 시각화'],
    ['정산 계좌', '국민 ****-**-**1234 (박지훈)'],
  ])}`, { ft: `<div class="btns"><a class="btn btn-ghost" href="${U.link('TC-02')}">지원서 다시 보기</a></div>` })}

  ${U.card('심사 단계 설명', U.accordion([
    { q: '1 · 접수 완료', a: '지원서와 첨부 파일이 정상적으로 들어왔는지 확인합니다. 보통 당일에 끝나요.' },
    { q: '2 · 서류 확인 중', a: '경력·자격 증빙이 지원서 내용과 맞는지 봅니다. 여기서 보완 요청이 나가는 경우가 가장 많아요.' },
    { q: '3 · 최종 승인', a: '승인되면 강사센터 메뉴가 열리고 바로 강의를 개설할 수 있습니다. 결과는 메일로도 보내 드려요.' },
  ], { single: true, open: 1 }), { bdCls: 'tight' })}
</div>

<div class="mt6">${U.banner('mut', '📚', `<b>심사 중에도 수강생으로 강의를 들으실 수 있어요</b><br>
  <span class="t-sub">지원 결과와 관계없이 수강에는 영향이 없습니다</span>`,
    `<div class="btns">${U.btn('강의 탐색', { cls: 'btn-primary', href: 'CO-01' })}
    ${U.btnSay('지원 취소', '지원 취소는 서버가 연결되면 처리됩니다', { cls: 'btn-danger' })}</div>`)}</div>
`;
  return { body, o: { admin: true, search: false } };
};
