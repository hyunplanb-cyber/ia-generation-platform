/* OW 현장 관리 — 부모 화면 6장. 「관리자·백오피스·사장님 화면」 — 대시보드형 레이아웃이 가장 또렷하게 드러나는 자리. */
import * as U from './ui.mjs';
import { PROCESS, TEAMS, FLAGSHIP, REQUESTS, CONFLICT, won } from './data.mjs';
import { PROCESS_STATE, TODAY_PCT } from './pages-pr.mjs';

const SITES = [
  { name: FLAGSHIP.title, area: 32, pct: TODAY_PCT, next: '목공 마감 검수 9/24', delay: false },
  { name: '한강로 카페 상가', area: 24, pct: 62, next: '타일 시공 9/24', delay: true },
  { name: '옥수동 욕실 리모델링', area: 6, pct: 90, next: '준공 검수 9/26', delay: false },
];
/* 「미수금」— 대시보드(OW0101)와 청구·수금(OW0501)이 같은 말을 해야 한다(지뢰 4).
   FLAGSHIP 현장의 「예정」 회차 합으로 한곳에서만 계산해 둘 다 이 값을 쓴다. */
const UNPAID_TOTAL = FLAGSHIP.billing.filter((b) => b[4] !== '수금 완료').reduce((a, b) => a + b[2], 0);

/* ---------------- OW0101 현장 대시보드 ---------------- */
function OW0101() {
  const body = `
${U.pageHd('현장 대시보드', '이번 달 기준')}
${/* ⛔ 눌러도 아무것도 안 바뀌었다 (2026-09-02). 기간별 지표 자료가 «한 벌»뿐이라
      거를 것도 다시 셈할 것도 없다. 없는 것을 고르게 두면 눌러도 아무 일이 없다 —
      고르개를 빼고, 이 견본이 무엇을 담고 있는지 그대로 적는다(검수항목 7-3·7-7). */''}
<p class="t-sub mb6">이 견본의 숫자는 <b>이번 달 기준</b>이에요.</p>

${U.statGrid([
    U.stat('진행 중 현장', `${SITES.length}곳`, { cls: 's-acc' }),
    U.stat('이달 매출', won(38_600_000), { delta: 12, deltaUnit: '%' }),
    U.stat('미수금', won(UNPAID_TOTAL), { cls: 's-warn' }),
    U.stat('밀린 공정', '1건', { cls: 's-mut' }),
  ])}

${U.sec('오늘 해야 할 일', `<div class="checks">${[
    '기성 청구 — 성수동 리버뷰 중도금 발행',
    '자재 발주 — 한강로 카페 상가 타일 추가 주문',
    '검수 방문 — 옥수동 욕실 9/26',
  ].map((t) => `<label class="check"><input type="checkbox">${t}</label>`).join('')}</div>`)}

${U.sec('진행 중 현장', `<div class="col">${SITES.map((s) => `<a class="lrow" href="${U.link('OW0301')}" style="display:flex">
  <div class="grow"><b>${U.esc(s.name)}</b><div class="t-sub">${s.area}평 · 다음 일정 ${U.esc(s.next)}</div></div>
  <div style="width:160px">${U.barRow(s.pct)}</div>
  ${s.delay ? U.badge('밀림', 'b-danger') : U.badge('정상', 'b-ok')}</a>`).join('')}</div>`)}

${U.sec('', U.banner('danger', '⚠️', `<b>${U.esc(CONFLICT.team)}이 ${U.esc(CONFLICT.date)}에 두 현장(${CONFLICT.sites.join(' · ')})에 겹쳤어요.</b><div class="t-sub mt1">일정 캘린더에서 조정해 주세요.</div>`,
    { right: U.btn('캘린더로 조정', { href: 'OW0601', cls: 'btn-danger btn-sm' }) }))}

${U.sec('이번 주 일정', `<div class="rail">${['9/22 목공', '9/23 목공', '9/24 목공→타일 ⚠️', '9/25 타일', '9/26 옥수동 검수'].map((t) => `<div class="box center">${t}</div>`).join('')}</div>`)}

${U.sec('새 견적 요청', U.banner('acc', '📨', '<b>새 견적 요청이 1건 있어요</b> — 28평 아파트 전체 시공', { right: U.btn('요청함 보기', { href: 'OW0201', cls: 'btn-accent btn-sm' }) }))}

${U.sec('매출 추이', U.lineChart([2200, 2800, 3100, 2600, 3400, 3860], { labels: ['4월', '5월', '6월', '7월', '8월', '9월'], alt: '월별 매출(단위 만원)' }))}`;
  return { body, o: { owner: true } };
}

/* ---------------- OW0201 견적 요청함 ---------------- */
function OW0201() {
  const body = `
${U.pageHd('견적 요청함', `요청 ${REQUESTS.length}건 · 계약 성사율 34%`)}

${/* ⛔ 탭을 눌러도 다섯 줄이 그대로였다 (2026-09-02). 개수도 손으로 1 씩 적어 두어
      REQUESTS 가 바뀌면 어긋난다. 세어서 적고, 공통 거르기 장치에 잇는다. */''}
${U.tabs([{ label: '전체', cnt: REQUESTS.length, filter: '요청', all: true }].concat(
  ['새 요청', '확인 중', '실측 잡힘', '계약됨', '놓침'].map((s) => (
    { label: s, cnt: REQUESTS.filter((r) => r.status === s).length, filter: '요청' }))), 0)}

<div data-filter-in="요청">${U.table(['들어온 시각', '평수', '분야', '자동 계산 금액', '연락처', '담당자', '상태'],
    REQUESTS.map((r) => ({ attr: ` data-tag="${r.status}"`, cells: [r.at, `${r.area}평`, r.field, won(r.amount), r.phoneMasked,
      `<select class="input" style="height:34px;padding:0 8px">${['미배정', '김하은', '이도목'].map((n) => `<option${n === '미배정' && r.status !== '새 요청' ? '' : ''}>${n}</option>`).join('')}</select>`,
      U.badge(r.status, r.status === '새 요청' ? 'b-acc' : r.status === '계약됨' ? 'b-ok' : r.status === '놓침' ? 'b-danger' : 'b-pri')] })))}
<p class="t-sub mt3" data-filter-empty hidden>그 상태인 요청이 없어요.</p></div>

${U.sec('', U.card('놓친 요청 — RQ-0227', `<p class="t-sub">응답 시간 8시간 초과로 자동 마감됐습니다.</p>
  <div class="field mt3"><label class="lb">놓친 까닭</label><select class="input"><option>담당자 부재</option><option>예산 범위 밖</option><option>지역 밖</option></select></div>`))}

<div class="center mt4">${U.btn('실측 예약으로 바로 넘기기', { href: 'VS0101', cls: 'btn-primary' })}</div>`;
  return { body, o: { owner: true } };
}

/* ---------------- OW0301 현장 상세 - 공정 편집 ---------------- */
function OW0301() {
  /* ⚠ 팀을 바꿔도 아무 말이 없었다(2026-08-18, 디럭스 OW-03 과 같은 자리).
        acts: 「팀 배정 드롭다운 → 배정된 팀이 바뀌고 일정 충돌이 있으면 경고가 뜬다」 */
  const rows = PROCESS_STATE.map((p) => [p.key,
    `<select class="input" data-team style="height:34px;padding:0 8px">${TEAMS.map((t) => `<option${t === p.team ? ' selected' : ''}>${t}</option>`).join('')}</select>`,
    `${p.startDay + 1}~${p.endDay}일차 (${p.days}일)`,
    U.badge(p.status, p.status === '끝남' ? 'b-ok' : p.status === '하는 중' ? 'b-pri' : 'b-mut')]);
  const body = `
${U.sec('', `<div class="row-b wrap-row"><div>
  <h1 class="t-page" style="font-size:24px">${U.esc(FLAGSHIP.title)}</h1>
  <p class="t-sub">${FLAGSHIP.area}평 · 계약금액 ${won(FLAGSHIP.total)} · 진행률 ${TODAY_PCT}% · 담당 ${FLAGSHIP.manager}</p></div>
  ${U.badge('정상 진행', 'b-ok')}</div>`)}

${U.tabBox(
    U.tabs([{ label: '공정', pane: 'process' }, { label: '자재', pane: 'material' }, { label: '사진', pane: 'photo' }, { label: '정산', pane: 'billing' }], 0),
    U.pane('process', `
      ${U.processBar(PROCESS_STATE, { todayPct: TODAY_PCT })}
      <p class="t-sub mt2">막대를 끌면 시작·끝 날짜가 바뀌고 뒤 공정이 따라 밀립니다. 이 견본에서는 표로 편집합니다.</p>
      ${U.table(['공정', '담당 팀', '일정', '상태'], rows)}
      ${U.banner('danger', '⚠️', `<span data-team-out data-busy="${U.esc(CONFLICT.team)}"
        data-when="${U.esc(CONFLICT.date)}" data-where="${U.esc(CONFLICT.sites.filter((s) => s !== FLAGSHIP.title).join(', '))}"><b>${U.esc(CONFLICT.team)} 배정 충돌</b> — ${U.esc(CONFLICT.date)}에 다른 현장(${U.esc(CONFLICT.sites.filter((s) => s !== FLAGSHIP.title).join(', '))})과 겹칩니다.</span>`)}
      <div class="btns mt3">${U.btn('공정 추가', { cls: 'btn-ghost btn-sm' })}${U.btn('공정 지우기', { cls: 'btn-ghost btn-sm' })}</div>`, true) +
    U.pane('material', `${U.btn('자재·원가로 이동', { href: 'OW0401', cls: 'btn-primary' })}`, false) +
    U.pane('photo', `<div class="g4">${Array.from({ length: 8 }, (_, i) => U.ph('현장 사진', 'ph-11', 'owphoto' + i)).join('')}</div>`, false) +
    U.pane('billing', `${U.btn('기성 청구·수금으로 이동', { href: 'OW0501', cls: 'btn-primary' })}`, false),
  )}

${U.sec('손님에게 보이는 것 / 안 보이는 것', `<div class="g2">
  <div class="box-ok"><b>손님에게 보임</b><ul class="list-plain mt2">${['공정표 진행률', '현장 사진 일지', '추가공사 승인 요청'].map((t) => `<li>· ${t}</li>`).join('')}</ul></div>
  <div class="box"><b>안 보임</b><ul class="list-plain mt2">${['원가·마진', '팀 배정 내부 메모', '거래처 연락처'].map((t) => `<li>· ${t}</li>`).join('')}</ul></div>
</div>`)}

${U.sec('변경 이력', U.table(['시각', '내용'], [
    ['9/20 08:40', `${U.esc(CONFLICT.team)} 배정 — 타일 공정`], ['9/18 17:02', '목공 일정 2일 연장'], ['9/10 09:00', '착공'],
  ]))}`;
  return { body, o: { owner: true } };
}

/* ---------------- OW0401 자재·원가 ---------------- */
function OW0401() {
  const STATUS = ['발주 전', '발주함', '입고됨'];
  const items = PROCESS.map((p, i) => {
    /* ⚠ 자재비 밑값이 34,600,000 — 계약금액(34,100,000)보다 «컸다». 그래서 위 카드가
          마진율 -3%를 초록색 「좋음」으로 띄우고 있었다(2026-08-18).
          인테리어 자재비는 계약금액의 40% 안쪽이 보통이라 0.38로 잡는다. */
    const est = Math.round((FLAGSHIP.total * 0.38 / 9) * (0.8 + i * 0.05));
    const actual = i % 3 === 0 ? Math.round(est * 1.04) : est;
    return { p, est, actual, statusIdx: i % 3 };
  });
  /* 상단 지표 카드는 반드시 아래 표에서 «계산해서» 뽑는다 — 표와 따로 손으로 적으면
     반드시 갈라진다(레이아웃견본_발견기록.md 지뢰 2). */
  /* ⚠ 발주 상태가 «누를 수 없는 배지»뿐이라 바꿀 자리가 없었고, 공정 칩도 눌리기만 하고
        목록은 그대로였다(2026-08-18, 디럭스 OW-04 와 같은 자리).
        acts: 「발주 상태 바꾸기 → 배지가 바뀌고 위 숫자가 줄어든다」·「공정 필터 → 그 공정 것만 남는다」 */
  const rows = items.map(({ p, est, actual, statusIdx }) => ({ cls: 'mat-row', attr: ` data-tag="${p.key}"`, cells: [p.key, p.key + ' 자재 일체', '1식', won(est), won(actual), won(actual - est),
    `<span data-po-badge>${U.badge(STATUS[statusIdx], ['b-mut', 'b-pri', 'b-ok'][statusIdx])}</span>`
    + `<select class="input" data-po-st data-po-cls="b-mut,b-pri,b-ok" style="height:34px;padding:0 8px;margin-top:4px">${STATUS.map((s, i) => `<option${i === statusIdx ? ' selected' : ''}>${s}</option>`).join('')}</select>`] }));
  const notOrdered = items.filter((it) => it.statusIdx === 0).length;
  const costTotal = items.reduce((a, it) => a + it.actual, 0);
  /* 이 표에는 «자재비»만 있고 인건비는 없다. 그러니 계약금액에서 자재비만 뺀 값을
     「마진」이라 부르면 거짓말이 된다 — 있는 그대로 「자재비 비중」으로 적는다. */
  const matShare = Math.round((costTotal / FLAGSHIP.total) * 100);
  const body = `
${U.pageHd('자재·원가', `${U.esc(FLAGSHIP.title)}`)}

${U.statGrid([
    U.stat('발주 안 한 것', `<span data-po-left>${notOrdered}</span>건`, { cls: 's-warn' }),
    U.stat('원가 합계', won(costTotal), {}),
    U.stat('계약금액 대비 자재비 비중', `${matShare}%`, { cls: matShare > 45 ? 's-warn' : 's-ok' }),
    U.stat('납품 지연', '1건', { cls: 's-mut' }),
  ])}

${/* 2026-09-02 — data-proc-chip 이 달려 있는데 받는 코드가 없어 목록이 안 줄었다.
      코드 주석에 2026-08-18 부터 적혀 있던 자리다. 공통 거르기 장치에 잇는다. */''}
${U.sec('', U.chips(['전체', '철거', '설비', '전기', '목공', '타일', '도배'], 0, { extra: ' data-filter="자재공정"' }).replace('<button class="chip on"', '<button class="chip on" data-filter-all'))}

<div data-filter-in="자재공정">${U.table(['공정', '품명', '수량', '견적 단가', '실제 단가', '차액', '발주 상태'], rows, { cls: 'tbl-mat' })}
<p class="t-sub mt3" data-filter-empty hidden>그 공정 자재가 없어요.</p></div>

${U.sec('', U.banner('warn', '🚚', '<b>납품 지연</b> — 타일(포세린 600×600)이 9/23 예정에서 9/25로 늦어졌어요.'))}

<div class="btns mt4">${U.btn('자재 추가', { cls: 'btn-ghost' })}${U.btn('거래처 관리', { cls: 'btn-ghost' })}${U.btn('발주서 내보내기', { cls: 'btn-primary' })}</div>`;
  return { body, o: { owner: true } };
}

/* ---------------- OW0501 기성 청구·수금 ---------------- */
function OW0501() {
  const body = `
${U.pageHd('기성 청구·수금')}

${U.statGrid([
    U.stat('미수금 총액', won(UNPAID_TOTAL), { cls: 's-warn' }),
    U.stat('이달 수금액', won(17_050_000), { delta: 8, deltaUnit: '%' }),
    U.stat('연체 건', '0건', { cls: 's-ok' }),
    U.stat('세금계산서 미발행', '1건', {}),
  ])}

${/* ⛔ 현장 칩을 눌러도 아래 표가 안 바뀌었다 (2026-09-02). 거르기를 붙이려 했는데
      billing 자료가 FLAGSHIP «한 현장»에만 있다 — 거를 것이 없다. 없는 것을
      있는 척하지 않고, 이 견본이 한 현장만 담고 있다는 것을 그대로 적는다
      (검수항목 7-7). 다른 현장 자료가 생기면 그때 data-filter 를 붙인다. */''}
${U.sec('', U.chips([FLAGSHIP.title], 0, {}) + `<p class="t-sub mt2">이 견본은 <b>${U.esc(FLAGSHIP.title)}</b> 한 현장의 청구·수금만 담고 있어요.</p>`)}

${U.table(['회차', '금액', '예정일', '상태', ''], FLAGSHIP.billing.map((b) => [b[0], won(b[2]), b[3], U.badge(b[4], b[4] === '수금 완료' ? 'b-ok' : 'b-mut'),
    b[4] === '수금 완료' ? '<label class="check"><input type="checkbox" checked disabled>입금 확인</label>' : `${U.btnSay('청구서 만들기', '청구서를 만들었어요. 상태가 「청구함」으로 바뀌었어요')}`]))}

${U.sec('세금계산서', U.table(['회차', '발행 상태'], [['계약금', U.badge('발행 완료', 'b-ok')], ['착공금', U.badge('발행 완료', 'b-ok')], ['중도금', U.badge('미발행', 'b-mut')]]))}

${U.sec('수금 예정 달력', U.calendar({ sel: 24, marks: [24, 8], month: '2026년 9월' }))}`;
  return { body, o: { owner: true } };
}

/* ---------------- OW0601 일정 캘린더 ---------------- */
function OW0601() {
  const body = `
${U.pageHd('일정 캘린더', '여러 현장의 일정을 한 달력에 겹쳐 봅니다')}

${/* ⛔ 눌러도 아무것도 안 바뀌었다 (2026-09-02). 달력 자료가 «한 벌»뿐이라
      거를 것도 다시 셈할 것도 없다. 없는 것을 고르게 두면 눌러도 아무 일이 없다 —
      고르개를 빼고, 이 견본이 무엇을 담고 있는지 그대로 적는다(검수항목 7-3·7-7). */''}
<p class="t-sub mb6">이 견본은 <b>2026년 9월 한 달</b>을 보여 줍니다.</p>
${U.sec('', U.chips(['전체 팀', ...TEAMS.slice(0, 6)], 0, { extra: ' data-filter="팀"' }).replace('<button class="chip on"', '<button class="chip on" data-filter-all'))}

<div class="split-r">
  <div>${U.card('', U.calendar({ sel: 24, marks: [24], month: '2026년 9월' }))}</div>
  <div class="sticky">
    ${U.card('9월 24일 (목) 일정', `
      ${U.banner('danger', '⚠️', `<b>${U.esc(CONFLICT.team)} 겹침</b><div class="t-sub mt1">${CONFLICT.sites.join(' · ')} — 같은 날 배정됐어요.</div>`)}
      ${/* 팀 칩을 누르면 그 팀 일정만 남는다 (2026-09-02). */''}
      <div class="col mt3" data-filter-in="팀">
        <div class="box" data-tag="${U.esc(CONFLICT.team)}"><b>${U.esc(CONFLICT.sites[0])}</b><div class="t-sub">${U.esc(CONFLICT.team)} · 목공 마감 검수</div></div>
        <div class="box" data-tag="${U.esc(CONFLICT.team)}"><b>${U.esc(CONFLICT.sites[1])}</b><div class="t-sub">${U.esc(CONFLICT.team)} · 타일 시공 시작</div></div>
        <div class="box" data-tag="청소팀"><b>옥수동 욕실 리모델링</b><div class="t-sub">청소팀 · 준공 검수 방문 예정</div></div>
        <p class="t-sub" data-filter-empty hidden>그 팀은 이 날 일정이 없어요.</p>
      </div>
      <div class="mt4">${U.btn('일정 추가', { cls: 'btn-primary btn-block' })}</div>`)}
    ${U.card('공휴일·공사 금지일', U.kv([['추석 연휴', '9/14~9/16'], ['아파트 공사 금지', '일요일 전체']]), { cls: 'mt4' })}
  </div>
</div>`;
  return { body, o: { owner: true } };
}


/* ---------------- OW0701 업체 정보·직원 관리 (2026-08-18 신설) ----------------
   ⚠ 손님용 「내 정보」(AU0401)와 «다른 화면»이다. 손님 것은 내 현장·저장한 견적을
     다루고, 여기는 사업자 정보·직원 권한·거래처를 다룬다. 둘을 섞지 않는다.
   사장님 지적: 「내 정보가 손님의 것과 업체의 것이 따로 있어야 함」. */
function OW0701() {
  const 권한 = ['대표', '소장', '경리'];
  const 직원 = [
    ['이도목', '010-0000-0001', '대표', '오늘 08:12'],
    ['김현장', '010-0000-0002', '소장', '오늘 07:40'],
    ['박경리', '010-0000-0003', '경리', '어제 18:22'],
  ];
  const 볼수있나 = [
    ['현장 대시보드', 'O', 'O', 'X'], ['견적 요청함', 'O', 'O', 'X'],
    ['현장 상세', 'O', 'O', 'X'], ['자재·원가', 'O', 'O', 'O'],
    ['청구·수금', 'O', 'X', 'O'], ['일정 캘린더', 'O', 'O', 'X'],
  ];
  const 거래처 = [
    ['한샘 자재', '정담당', '010-1111-2222', '월말 결제'],
    ['동화기업', '최담당', '010-3333-4444', '주문 시 선결제'],
    ['성수 인력팀', '오반장', '010-5555-6666', '주급'],
  ];
  const 잠김 = '123-45-67890 <span class="t-sub">🔒 바꾸려면 문의해 주세요</span>';
  const 직원표 = U.table(['이름', '연락처', '권한', '마지막 접속', ''], 직원.map((r) => {
    const 고르개 = '<select class="input" data-staff-role style="width:110px">'
      + 권한.map((x) => '<option' + (x === r[2] ? ' selected' : '') + '>' + x + '</option>').join('')
      + '</select>';
    return [r[0], r[1], 고르개, r[3], U.btn('내보내기', { cls: 'btn-sm', attr: ' data-toast="' + r[0] + ' 님을 내보냈어요"' })];
  }));

  const body = [
    U.pageHd('업체 정보·직원 관리', '손님 화면의 「내 정보」와는 다른 곳이에요 — 여기는 사업자·직원·거래처를 다룹니다'),
    '<div class="split-r"><div>',
    U.card('업체 기본 정보',
      U.kv([['상호', '(주)마루공방'], ['사업자등록번호', 잠김], ['대표자', '이도목'],
        ['주소', '서울 성동구 성수이로 12'], ['대표 전화', '02-000-0000']])
      + '<div class="mt3">' + U.btn('고치기', { attr: ' data-toast="업체 정보를 고칠 수 있어요"' }) + '</div>'),
    U.sec('직원 계정', 직원표, { cls: 'mt4' }),
    '<p class="t-sub mt2" data-role-note>권한을 바꾸면 그 사람이 볼 수 있는 화면이 바로 달라져요.</p>',
    U.sec('권한별로 볼 수 있는 화면', U.table(['화면'].concat(권한), 볼수있나), { cls: 'mt5' }),
    U.sec('거래처', U.table(['거래처', '담당자', '연락처', '거래 조건'], 거래처),
      { cls: 'mt5', desc: '자재·원가 화면에서 발주서를 만들 때 여기 거래처를 고릅니다.' }),
    '<div class="mt3">'
      + U.btn('거래처 추가', { attr: ' data-toast="거래처를 넣었어요"' })
      + U.btn('직원 부르기', { cls: 'btn-primary', attr: ' data-toast="초대 문자를 보냈어요"' })
      + '</div>',
    '</div><div class="sticky">',
    U.card('손님 화면에 보이는 것',
      U.ph('업체 대표 사진', 'ph-43', 'owner-hero')
      + '<p class="t-sub mt3">2008년부터 성동구에서 아파트 리모델링을 해 왔습니다. 공정마다 사진으로 알려 드립니다.</p>'
      + '<div class="mt3">' + U.btn('손님 화면에서 보기', { cls: 'btn-sm', href: 'HO0101' }) + '</div>'),
    U.card('알림 받을 사람',
      U.kv([['견적 요청', '이도목'], ['기성 청구', '박경리'], ['하자 접수', '김현장']]), { cls: 'mt4' }),
    U.card('사업자 서류',
      U.kv([['사업자등록증', '올림'], ['통장 사본', '아직']])
      + '<p class="t-sub mt2">세금계산서 발행에 쓰입니다.</p>', { cls: 'mt4' }),
    '</div></div>',
  ].join('\n');
  return { body, o: { owner: true } };
}

export const PAGES = { OW0101, OW0201, OW0301, OW0401, OW0501, OW0601, OW0701 };
