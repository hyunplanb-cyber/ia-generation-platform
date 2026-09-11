/* AD 운영자 — 28화면.
   신고 처리 대기열(7) · 신고 상세·조치(5) · 금지품목·거래규칙(5) · 안전결제 정산·분쟁(6) · 운영자 로그인(5)

   ⚠ 레이아웃 B «대시보드형» — 이 갈래가 그 레이아웃이 가장 또렷하게 드러나는 자리다.
       · hero   히어로 없음. 화면 맨 위에 지표 카드 «4개»(kpis)
       · list   표 중심. 머리글 고정 · 행 높이 일정 · 상태는 배지(dashTable)
       · nav    좌측 세로 사이드바 — shell() 이 AD 로 시작하는 id 를 보고 운영자 메뉴로 바꾼다.
                화면 «안»에 또 사이드바(.side / proNav)를 두지 않는다. 두 벌이 되면 뼈대가 흐려진다.
       · detail 좌 본문 + 우 액션 패널(detailSplit). 상태를 바꾸는 단추는 «전부» 오른쪽에 모은다.
   ⚠ 링크는 짧은 이름(AD-02)으로 적는다. link() 가 이 팩 파일 이름(AD0201)으로 옮긴다.
   ⚠ 사람의 계정을 막고 남의 돈을 옮기는 화면이다. 확정 전에 «무엇이 일어나는지»를 다 보여 준다. */
import {
  pageHd, kpis, dashTable, tableBar, detailSplit, actPanel,
  sec, card, box, banner, empty, table, kv, badge, stBadge, btn, chips, chip, tabs,
  timeline, modal, modalStatic, soloBox, userCard, itemRow, manner,
  link, esc, won, num, ph, phItem} from './ui.mjs';
import {
  REPORTS, REPORT_STATS, ST_CLS, BANNED, BAN_WORDS, BAN_EXCEPT,
  SETTLES, DISPUTE, itemBy, userBy, fee, payout, FEE_RATE, SITE, ago,
  ADM_STAFF, ADM_ME, ADM_DONE_REPORTS, ADM_TODAY_DONE, ADM_DUP_ROWS,
  ADM_TALK, ADM_TALK_BEFORE, ADM_PAST, ADM_TIMELINE,
  ADM_ACTS, ADM_ACT_DESC, ADM_MSGS, ADM_EFFECT,
  ADM_WORD_HITS, ADM_WORD_WARN, ADM_PREVIEW, ADM_APPEALS, ADM_RULE_LOG,
  ADM_RULE_TEXT, ADM_RULE_PREV, ADM_RULE_FROM,
  ADM_REFUND, ADM_HOLD_REASONS, ADM_TERMS,
  ADM_LOGIN_LOG, ADM_PW_RULES, ADM_LOGIN_TRY,
} from './data.mjs';

/* ─────────────── 공통 조각 ─────────────── */

/** 긴 사유를 표 칸에 들어갈 짧은 말로. 배지에 문장을 넣으면 열이 무너진다. */
const 짧은사유 = {
  '사기가 의심돼요': '사기 의심',
  '팔 수 없는 물건이에요': '금지 품목',
  '욕설·비방을 해요': '욕설·비방',
  '광고·도배예요': '광고·도배',
  '남의 사진을 가져다 썼어요': '사진 도용',
  '그 밖에': '그 밖에',
};
const 상태들 = ['대기', '처리중', '완료', '보류'];
/** 탭 배지 숫자 — 표에서 «세어» 낸다. 손으로 적으면 표와 갈라진다. */
const 셈 = (st) => (st === '완료' ? ADM_DONE_REPORTS.length : REPORTS.filter((r) => r.st === st).length);
const 기한넘김 = (r) => r.ago > 1440;          // 접수 24시간(1440분) 초과
const 대기건 = REPORTS.filter((r) => r.st === '대기');

/** 표 머리글 — 다섯 화면이 같은 열을 쓴다. 한곳에서 낸다. */
const 대기열머리 = [
  { t: '<label class="check none"><input type="checkbox" aria-label="모두 고르기"></label>', w: '44px' },
  { t: '접수', w: '128px' },
  { t: '사유', w: '110px' },
  { t: '신고 대상' },
  { t: '신고자', w: '92px' },
  { t: '누적', w: '76px' },
  { t: '긴급도', w: '80px' },
  { t: '담당자', w: '130px' },
  { t: '상태', w: '86px' },
  { t: '', w: '72px' },
];

/** 담당자 고르개 — 고르면 «같은 줄의 상태 배지»가 처리중으로 바뀐다(app.js data-row-badge).
   이미 다른 사람이 잡은 건은 잠그고 누구인지 적는다. */
function 담당칸(r, o = {}) {
  const 잠김 = o.lock && r.who !== '—' && r.who !== ADM_ME;
  if (잠김) {
    return `<span class="t-sub nowrap">🔒 ${esc(r.who)}<div class="t-sub">처리 중</div></span>`;
  }
  return `<select class="input" data-row-badge data-badge-to="처리중" data-badge-from="${r.st}"
    aria-label="${r.id} 담당자" data-toast="담당자를 지정했어요 · 상태가 처리중으로 바뀝니다">
    <option${r.who === '—' ? ' selected' : ''}>없음</option>
    ${ADM_STAFF.map((n) => `<option${r.who === n ? ' selected' : ''}>${n}</option>`).join('')}
  </select>`;
}

/** 대기열 한 줄. o.lock 이면 남이 잡은 건을 잠근다 · o.dup 이면 묶음 표시를 단다 */
function 신고행(r, o = {}) {
  const 넘 = 기한넘김(r);
  return {
    cls: 넘 ? 'over' : '',
    data: { why: r.why, lv: r.lv, kind: r.kind, ago: r.ago, dup: r.dup },
    cells: [
      `<label class="check none"><input type="checkbox" data-pick aria-label="${r.id} 고르기"${o.picked ? ' checked' : ''}></label>`,
      `<span class="nowrap">${r.at}</span>
       <div class="t-sub">${넘 ? `<b class="danger">기한 ${ago(r.ago - 1440)} 지남</b>` : `${ago(r.ago)} 접수`}</div>`,
      badge(짧은사유[r.why] || r.why, 'b-mut'),
      `<a class="strong" href="${link('AD-02')}">${esc(r.target)}</a>
       <div class="t-sub">${r.kind} · ${r.id}${r.dup > 1 && o.dup ? ` · <a class="link" href="${link('AD0104')}">묶어 보기 ›</a>` : ''}</div>`,
      `<span class="nowrap">${esc(r.by)}</span>`,
      r.dup > 1
        ? `<b class="danger nowrap">${r.dup}건</b>`
        : `<span class="t-sub nowrap">${r.dup}건</span>`,
      stBadge(r.lv),
      담당칸(r, o),
      `<span class="badge ${ST_CLS[r.st] || 'b-mut'}" data-badge-of>${r.st}</span>`,
      btn('열기', { href: 'AD-02', cls: 'btn-ghost btn-xs' }),
    ],
  };
}

/** 완료 탭 한 줄 — 담당자 자리에 «무슨 조치를 했나»를 적는다 */
const 완료행 = (r) => ({
  data: { why: r.why, lv: r.lv, kind: r.kind, ago: r.ago, dup: r.dup },
  cells: [
    `<label class="check none"><input type="checkbox" data-pick aria-label="${r.id} 고르기"></label>`,
    `<span class="nowrap">${r.at}</span><div class="t-sub">${ago(r.ago)} 접수</div>`,
    badge(짧은사유[r.why] || r.why, 'b-mut'),
    `<a class="strong" href="${link('AD-02')}">${esc(r.target)}</a><div class="t-sub">${r.kind} · ${r.id}</div>`,
    `<span class="nowrap">${esc(r.by)}</span>`,
    `<span class="t-sub nowrap">${r.dup}건</span>`,
    stBadge(r.lv),
    `<span class="nowrap">${esc(r.who)}</span><div class="t-sub">${esc(r.act)}</div>`,
    `<span class="badge ${ST_CLS[r.st] || 'b-mut'}" data-badge-of>${r.st}</span>`,
    btn('열기', { href: 'AD-02', cls: 'btn-ghost btn-xs' }),
  ],
});

/** 표에 «정렬»도 걸어 준다 — table() 은 거르개 열쇠만 달아 주므로 여기서 한 자리만 더 붙인다.
   ⛔ 넓은 일괄 치환이 아니다. 내가 방금 만든 글자 한 군데만 바꾼다. */
const 정렬걸기 = (html, key) =>
  html.replace(`<tbody data-filter-list="${key}"`, `<tbody data-filter-list="${key}" data-sort-list="${key}"`);

/** 대기열 표 — 열이 열 개라 좌우로 넘친다. «반드시» o.max 를 준다(안 그러면 화면 밖으로 나간다). */
const 대기열표 = (행들, o = {}) => {
  const html = dashTable(대기열머리, 행들, { max: o.max || '460px', listKey: o.listKey });
  return o.listKey ? 정렬걸기(html, o.listKey) : html;
};

/** 대기열 위 거르개 한 줄 — 사유·긴급도·대상 종류·기간 + 정렬 + 전체 해제 */
const 거르개줄 = (o = {}) => `<div class="row-c wrap-row mb3" style="gap:8px">
  <select class="input" style="width:auto" data-filter="rep" data-f-key="why" aria-label="사유로 좁히기">
    <option value="">모든 사유</option>
    ${Object.entries(짧은사유).map(([k, v]) => `<option value="${k}"${o.why === k ? ' selected' : ''}>${v}</option>`).join('')}
  </select>
  <select class="input" style="width:auto" data-filter="rep" data-f-key="lv" aria-label="긴급도로 좁히기">
    <option value="">모든 긴급도</option>
    ${['높음', '보통', '낮음'].map((v) => `<option value="${v}"${o.lv === v ? ' selected' : ''}>${v}</option>`).join('')}
  </select>
  <select class="input" style="width:auto" data-filter="rep" data-f-key="kind" aria-label="신고 대상 종류로 좁히기">
    <option value="">모든 대상</option>
    ${['회원', '매물', '대화'].map((v) => `<option value="${v}"${o.kind === v ? ' selected' : ''}>${v}</option>`).join('')}
  </select>
  <select class="input" style="width:auto" aria-label="기간" data-toast="고른 기간으로 대기열을 다시 불러왔어요">
    <option>최근 7일</option><option>오늘</option><option>최근 30일</option><option>전체</option>
  </select>
  <select class="input" style="width:auto" data-sort-cards="rep" aria-label="정렬">
    <option value="ago" data-desc>오래된 순</option>
    <option value="dup" data-desc>누적 신고순</option>
    <option value="ago">최근 접수순</option>
  </select>
  ${btn('전체 해제', { cls: 'btn-quiet btn-sm', attr: ' data-filter-reset="rep"' })}
</div>`;

/** 여러 건 일괄 처리 — 표 왼쪽 체크를 켜면 열린다(app.js data-pick) */
const 일괄상자 = () => card('여러 건 한꺼번에', `
  <p class="t-sub mb3">표 왼쪽 체크로 여러 건을 고르면 아래 단추가 열립니다.</p>
  <div class="row-c wrap-row" style="gap:8px" data-pick-bar hidden>
    ${badge('<b data-pick-n>0</b>건 골랐어요', 'b-pri')}
    ${btn('고른 건 반려', { cls: 'btn-ghost', attr: ' data-modal="bulk"' })}
    ${btn('고른 건 담당자 지정', { cls: 'btn-ghost', attr: ' data-toast="고른 건에 담당자를 지정했어요 · 상태가 처리중으로 바뀝니다"' })}
    ${btn('고른 건 보류', { cls: 'btn-ghost', attr: ' data-toast="고른 건을 보류로 옮겼어요"' })}
  </div>
  <p class="t-sub" data-pick-empty>아직 고른 것이 없어요.</p>`);

const 일괄모달 = () => modal('bulk', '고른 신고를 반려할까요?', `
  <p class="t-sub mb3">반려하면 신고한 분에게 「확인했지만 규정 위반이 아니다」라는 안내가 갑니다.</p>
  <div class="stack-sm">${대기건.map((r) => `<div class="cond-row">
    <span class="grow">${r.id} · ${esc(r.target)}</span>${badge(짧은사유[r.why] || r.why, 'b-mut')}</div>`).join('')}</div>
  ${banner('warn', '⚠', '<b>되돌릴 수 없어요.</b> 반려한 신고는 다시 열 수 없습니다.', { cls: 'mt3' })}`,
  btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
  + btn('반려하기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="고른 건을 반려했어요 · 신고자에게 알렸습니다"' }));

/** 대기열 일곱 화면을 오가는 줄 — 어느 상태를 보고 있는지 눈에 보이게 둔다 */
const 대기열갈래 = (here) => sec('이 화면의 다른 상태', `<div class="chips">${[
  ['AD-01', '기본 대기열'],
  ['AD0102', '상태 탭 전환'],
  ['AD0103', '사유·긴급도 필터'],
  ['AD0104', '같은 대상 묶어 보기'],
  ['AD0105', '기한 넘김 강조'],
  ['AD0106', '담당자 지정'],
  ['AD0107', '대기열 비었음'],
].map(([id, t]) => `<a class="chip${id === here ? ' on' : ''}" href="${link(id)}" data-go="${link(id)}">${t}</a>`).join('')}</div>`,
  { desc: '같은 대기열이 상태에 따라 어떻게 보이는지 펼쳐 둔 화면입니다.' });

/** 신고 상세 다섯 화면을 오가는 줄 */
const 상세갈래 = (here) => sec('이 화면의 다른 상태', `<div class="chips">${[
  ['AD-02', '기본 상세'],
  ['AD0202', '신고된 대화 원본'],
  ['AD0203', '조치 고르기'],
  ['AD0204', '안내 문구 미리보기'],
  ['AD0205', '조치 확정'],
].map(([id, t]) => `<a class="chip${id === here ? ' on' : ''}" href="${link(id)}" data-go="${link(id)}">${t}</a>`).join('')}</div>`);

const 규칙갈래 = (here) => sec('이 화면의 다른 상태', `<div class="chips">${[
  ['AD-03', '금지 품목 표'],
  ['AD0302', '금지 낱말 관리'],
  ['AD0303', '규칙 미리 재보기'],
  ['AD0304', '거래 규칙 문구 편집'],
  ['AD0305', '저장 전 영향 요약'],
].map(([id, t]) => `<a class="chip${id === here ? ' on' : ''}" href="${link(id)}" data-go="${link(id)}">${t}</a>`).join('')}</div>`);

const 정산갈래 = (here) => sec('이 화면의 다른 상태', `<div class="chips">${[
  ['AD-04', '정산 대기 표'],
  ['AD0402', '기간·검색'],
  ['AD0403', '합계 검산'],
  ['AD0404', '정산 보류'],
  ['AD0405', '분쟁 양쪽 보기'],
  ['AD0406', '분쟁 판단'],
].map(([id, t]) => `<a class="chip${id === here ? ' on' : ''}" href="${link(id)}" data-go="${link(id)}">${t}</a>`).join('')}</div>`);

const 로그인갈래 = (here) => `<div class="chips mt6">${[
  ['AD-05', '로그인'],
  ['AD0502', '로그인 실패'],
  ['AD0503', '2단계 인증'],
  ['AD0504', '비밀번호 변경'],
  ['AD0505', '비밀번호 찾기'],
].map(([id, t]) => `<a class="chip${id === here ? ' on' : ''}" href="${link(id)}" data-go="${link(id)}">${t}</a>`).join('')}</div>`;

/* 대기열 지표 카드 넷 — 화면 맨 위. 값은 REPORT_STATS 한곳에서 나온다. */
const 대기열지표 = (o = {}) => kpis([
  ['오늘 접수', num(REPORT_STATS.오늘접수), { unit: '건', d: '자정부터 지금까지' }],
  ['처리 대기', `<span data-filter-count="rep">${o.대기 != null ? o.대기 : REPORT_STATS.대기}</span>`,
    { unit: '건', tone: 'k-warn', d: o.대기 === 0 ? '남은 것이 없어요' : '거르개를 걸면 이 수도 함께 줄어요' }],
  ['평균 처리 시간', REPORT_STATS.평균처리, { tone: 'k-ok', d: '접수부터 조치까지' }],
  ['기한 넘긴 건', num(o.넘김 != null ? o.넘김 : REPORT_STATS.기한넘김), {
    unit: '건', tone: 'k-danger', d: '접수 24시간 초과', href: 'AD0105',
  }],
]);

/* ═══════════════ AD01 신고 처리 대기열 ═══════════════ */

function AD0101(ctx) {
  const 탭몸통 = 상태들.map((st, i) => {
    const 것들 = st === '완료' ? ADM_DONE_REPORTS : REPORTS.filter((r) => r.st === st);
    const 행 = st === '완료' ? 것들.map(완료행) : 것들.map((r) => 신고행(r, { dup: true }));
    return `<div data-pane-body="q${i}"${i === 0 ? '' : ' hidden'}>
      ${것들.length
        ? `${tableBar(
          `<b><span data-filter-count="rep">${것들.length}</span>건</b>
           <span class="t-sub">· 전체 ${것들.length}건 가운데</span>
           <span data-filter-applied="rep" hidden> <span data-filter-applied-in></span></span>`,
          `${btn('신고 자세히 보기', { href: 'AD-02', cls: 'btn-ghost btn-sm' })}`,
        )}
        ${대기열표(행, { listKey: i === 0 ? 'rep' : null })}
        <p class="t-sub mt3" data-filter-empty="rep" hidden>걸어 둔 조건에 맞는 신고가 없어요. 「전체 해제」를 눌러 보세요.</p>`
        : empty('✅', `${st}인 신고가 없어요`, '', btn('대기열이 비었을 때 화면', { href: 'AD0107', cls: 'btn-ghost btn-sm' }))}
    </div>`;
  }).join('');

  const body = `
${pageHd('신고 처리 대기열', '접수된 순서대로 처리합니다 · 기한은 접수 24시간',
    `<div class="btns">${btn('금지품목·규칙 관리', { href: 'AD-03', cls: 'btn-ghost' })}${btn('신고 자세히 보기', { href: 'AD-02', cls: 'btn-pri' })}</div>`)}

${대기열지표()}

${/* ⚠ 탭과 몸통은 «같은 상자» 안에 있어야 한다 — app.js 는 눌린 탭의 부모 안에서만 몸통을 찾는다 */''}
<div>
  ${tabs(상태들.map((st, i) => ({ label: st, cnt: 셈(st), pane: 'q' + i })), 0)}
  <div class="mt4">
    ${거르개줄()}
    ${탭몸통}
  </div>
</div>

<div class="mt-block">${banner('warn', '⏰', `<b>접수 24시간이 지난 신고가 ${REPORT_STATS.기한넘김}건 있어요</b>
  <div class="t-sub mt1">R-2413 · 커피 그라인더(수동) · 사기 의심 — 보류로 둔 채 하루가 넘었습니다.</div>`,
    { right: btn('기한 넘김만 보기', { href: 'AD0105', cls: 'btn-danger btn-sm' }) })}</div>

<div class="mt-block">${banner('info', '🧷', `<b>회원 바람개비에게 신고가 5건 쌓였습니다</b>
  <div class="t-sub mt1">같은 대상에 여러 건이 들어오면 묶어서 한 번에 처리할 수 있어요.</div>`,
    { right: btn('묶어 보기', { href: 'AD0104', cls: 'btn-ghost btn-sm' }) })}</div>

<div class="mt-block">${일괄상자()}</div>

<div class="mt-block">${대기열갈래('AD-01')}</div>

${일괄모달()}
`;
  return { body, o: {} };
}

/* AD0102 — 상태 탭 전환. 탭을 바꿔도 거르개는 그대로 남는다. */
function AD0102(ctx) {
  const 처리중 = REPORTS.filter((r) => r.st === '처리중');
  const 탭몸통 = 상태들.map((st, i) => {
    const 것들 = st === '완료' ? ADM_DONE_REPORTS : REPORTS.filter((r) => r.st === st);
    const 행 = st === '완료' ? 것들.map(완료행) : 것들.map((r) => 신고행(r, { dup: true }));
    return `<div data-pane-body="q${i}"${i === 1 ? '' : ' hidden'}>
      ${것들.length
        ? `${tableBar(`<b><span${i === 1 ? ' data-filter-count="rep"' : ''}>${것들.length}</span>건</b>
            <span class="t-sub">· ${st} 탭</span>`, '')}
           ${대기열표(행, { listKey: i === 1 ? 'rep' : null })}`
        : empty('✅', `${st}인 신고가 없어요`, '', '')}
    </div>`;
  }).join('');

  const body = `
${pageHd('신고 처리 대기열 — 처리중', '탭을 바꿔도 걸어 둔 거르개는 그대로 남습니다')}

${대기열지표({ 대기: 처리중.length })}

<div>
  ${tabs(상태들.map((st, i) => ({ label: st, cnt: 셈(st), pane: 'q' + i })), 1)}
  <div class="mt4">
    ${거르개줄({ lv: '보통' })}
    ${banner('quiet', '📌', `<b>거르개는 탭을 바꿔도 풀리지 않습니다</b>
      <div class="t-sub mt1">지금 걸린 것: ${badge('긴급도 보통', 'b-mut')} — 탭만 「대기 → 처리중」으로 옮겼습니다.</div>`, { cls: 'mb3' })}
    ${탭몸통}
  </div>
</div>

<div class="mt-block">${card('탭마다 몇 건인가', table(
    [{ t: '탭' }, { t: '건수', w: '110px' }, { t: '무슨 뜻인가' }],
    상태들.map((st) => [
      stBadge(st),
      `<b>${num(셈(st))}건</b>`,
      `<span class="t-sub">${{
        대기: '아직 아무도 안 잡은 신고입니다',
        처리중: '담당자가 잡고 자료를 보고 있는 신고입니다',
        완료: `오늘 처리한 것만 보입니다 (누적 ${num(REPORT_STATS.완료)}건)`,
        보류: '자료를 기다리느라 잠시 멈춰 둔 신고입니다',
      }[st]}</span>`,
    ]),
  ), { cls: 'mt-block' })}</div>

<div class="mt-block">${대기열갈래('AD0102')}</div>
`;
  return { body, o: { state: '처리중 탭을 보고 있어요' } };
}

/* AD0103 — 사유·긴급도 필터. 상단 건수와 표가 «함께» 줄어든다. */
function AD0103(ctx) {
  const 걸린것 = 대기건.filter((r) => r.lv === '높음');
  const body = `
${pageHd('신고 처리 대기열 — 좁혀 보기', '조건을 걸면 위 지표 카드의 건수와 표가 함께 줄어듭니다')}

${대기열지표({ 대기: 대기건.length })}

<div>
  ${tabs(상태들.map((st, i) => ({ label: st, cnt: 셈(st), pane: 'q' + i })), 0)}
  <div class="mt4">
    ${거르개줄({ lv: '높음' })}
    <div data-pane-body="q0">
      ${tableBar(`<b><span data-filter-count="rep">${걸린것.length}</span>건</b>
        <span class="t-sub">· 전체 <span data-filter-total="rep">${대기건.length}</span>건 가운데</span>
        <span data-filter-applied="rep"> <span data-filter-applied-in></span></span>`,
    btn('전체 해제', { cls: 'btn-quiet btn-sm', attr: ' data-filter-reset="rep"' }))}
      ${대기열표(대기건.map((r) => 신고행(r, { dup: true })), { listKey: 'rep' })}
      <p class="t-sub mt3" data-filter-empty="rep" hidden>걸어 둔 조건에 맞는 신고가 없어요. 「전체 해제」를 눌러 보세요.</p>
    </div>
    <div data-pane-body="q1" hidden>${대기열표(REPORTS.filter((r) => r.st === '처리중').map((r) => 신고행(r)))}</div>
    <div data-pane-body="q2" hidden>${대기열표(ADM_DONE_REPORTS.map(완료행))}</div>
    <div data-pane-body="q3" hidden>${대기열표(REPORTS.filter((r) => r.st === '보류').map((r) => 신고행(r)))}</div>
  </div>
</div>

<div class="mt-block">${card('지금 걸려 있는 조건', `
  <div class="chips">
    ${chip('긴급도 높음', true)}
    ${chip('기간 최근 7일', true)}
  </div>
  <p class="t-sub mt3">칩의 ✕ 를 누르면 그 조건만 풀립니다. 모두 풀려면 아래 단추를 누르세요.</p>
  <div class="mt3">${btn('조건 전체 해제', { cls: 'btn-ghost', attr: ' data-filter-reset="rep"' })}</div>`)}</div>

<div class="mt-block">${대기열갈래('AD0103')}</div>
`;
  return { body, o: { state: '긴급도 높음으로 좁혀 보는 중' } };
}

/* AD0104 — 같은 대상 묶어 보기. 한 회원에 쌓인 5건을 한 줄로 묶고 펼친다. */
function AD0104(ctx) {
  const 묶인것 = REPORTS[0];               // R-2418 회원 바람개비 · 누적 5건
  const 나머지 = REPORTS.filter((r) => r.st === '대기' && r.id !== 묶인것.id);

  const 묶음줄 = {
    cls: 'over',
    cells: [
      `<label class="check none"><input type="checkbox" data-pick checked aria-label="묶음 고르기"></label>`,
      `<span class="nowrap">${묶인것.at}</span><div class="t-sub">가장 오래된 건 9/1</div>`,
      badge(짧은사유[묶인것.why], 'b-mut'),
      `<b>회원 바람개비</b> ${badge('묶음 5건', 'b-danger')}
       <div class="t-sub">회원 · 같은 대상에 신고가 쌓였습니다</div>`,
      `<span class="t-sub">5명</span>`,
      `<b class="danger nowrap">5건</b>`,
      stBadge('높음'),
      담당칸(묶인것),
      `<span class="badge ${ST_CLS['대기']}" data-badge-of>대기</span>`,
      btn('＋4건 더', { cls: 'btn-ghost btn-xs', attr: ' data-modal="dup"' }),
    ],
  };

  const body = `
${pageHd('신고 처리 대기열 — 같은 대상 묶어 보기', '한 회원·한 매물에 신고가 여러 건이면 묶어서 한 번에 처리합니다')}

${대기열지표({ 대기: 대기건.length })}

<div>
  ${tabs(상태들.map((st, i) => ({ label: st, cnt: 셈(st), pane: 'q' + i })), 0)}
  <div class="mt4">
    ${tableBar(`<b>${대기건.length}건</b> <span class="t-sub">· 같은 대상 5건을 한 줄로 묶어 ${나머지.length + 1}줄로 보입니다</span>`,
    btn('묶음 풀고 낱개로 보기', { href: 'AD-01', cls: 'btn-ghost btn-sm' }))}
    <div data-pane-body="q0">
      ${대기열표([묶음줄, ...나머지.map((r) => 신고행(r))])}
    </div>
    <div data-pane-body="q1" hidden>${대기열표(REPORTS.filter((r) => r.st === '처리중').map((r) => 신고행(r)))}</div>
    <div data-pane-body="q2" hidden>${대기열표(ADM_DONE_REPORTS.map(완료행))}</div>
    <div data-pane-body="q3" hidden>${대기열표(REPORTS.filter((r) => r.st === '보류').map((r) => 신고행(r)))}</div>
  </div>
</div>

<div class="mt-block">${card('펼쳐 보기 — 회원 바람개비에게 들어온 5건', `
  ${table([{ t: '신고번호', w: '110px' }, { t: '접수', w: '140px' }, { t: '사유', w: '120px' },
    { t: '신고자', w: '110px' }, { t: '긴급도', w: '90px' }, { t: '', w: '80px' }],
    ADM_DUP_ROWS.map((d) => [
      `<b>${d.id}</b>`, d.at, badge(짧은사유[d.why] || d.why, 'b-mut'), esc(d.by), stBadge(d.lv),
      btn('열기', { href: 'AD-02', cls: 'btn-ghost btn-xs' }),
    ]))}
  ${banner('warn', '⚠', `<b>서로 다른 5명이 같은 회원을 신고했습니다</b>
    <div class="t-sub mt1">그 가운데 4건이 「사기 의심」입니다. 한 건씩 보는 것보다 묶어서 보는 편이 빠릅니다.</div>`, { cls: 'mt3' })}`,
    {
      ft: `<div class="row-c wrap-row" style="gap:8px">
      ${btn('5건 한 번에 조치', { cls: 'btn-pri', attr: ' data-modal="dupfix"' })}
      ${btn('5건 한 번에 반려', { cls: 'btn-ghost', attr: ' data-modal="bulk"' })}
      ${btn('낱개로 하나씩 보기', { href: 'AD-02', cls: 'btn-ghost' })}</div>`,
    })}</div>

<div class="mt-block">${대기열갈래('AD0104')}</div>

${modal('dup', '회원 바람개비 — 신고 5건', `
  ${table([{ t: '신고번호' }, { t: '접수' }, { t: '사유' }, { t: '신고자' }],
    ADM_DUP_ROWS.map((d) => [d.id, d.at, 짧은사유[d.why] || d.why, esc(d.by)]))}`,
    btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + btn('묶어서 처리', { href: 'AD-02', cls: 'btn-pri' }))}

${modal('dupfix', '5건을 한 번에 조치할까요?', `
  <p class="t-sub mb3">묶인 5건 모두에 같은 조치가 들어갑니다.</p>
  <ul class="dots">
    <li>바람개비님 계정이 <b>7일간 정지</b>됩니다</li>
    <li>신고한 5명 «모두»에게 처리 결과가 갑니다</li>
    <li>신고 5건이 한꺼번에 «완료»로 바뀝니다</li>
  </ul>
  ${banner('warn', '⚠', '되돌리려면 운영 책임자 승인이 필요합니다.', { cls: 'mt3' })}`,
    btn('다시 볼게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + btn('5건 확정', { href: 'AD0205', cls: 'btn-pri' }))}

${일괄모달()}
`;
  return { body, o: { state: '같은 대상 5건을 묶어 보는 중' } };
}

/* AD0105 — 기한 넘김 강조. 24시간 초과 행에 붉은 띠와 경과 시간. */
function AD0105(ctx) {
  const 넘은것 = REPORTS.filter(기한넘김);
  const 임박 = REPORTS.filter((r) => !기한넘김(r) && r.ago > 720);   // 12시간 넘은 것
  const 기한순 = [...REPORTS].filter((r) => r.st !== '완료').sort((a, b) => b.ago - a.ago);

  const body = `
${pageHd('신고 처리 대기열 — 기한 넘김', '접수 24시간이 지난 신고는 줄 왼쪽에 붉은 띠가 섭니다')}

${대기열지표({ 대기: 기한순.length, 넘김: 넘은것.length })}

<div>
  ${tabs(상태들.map((st, i) => ({ label: st, cnt: 셈(st), pane: 'q' + i })), 0)}
  <div class="mt4">
    ${banner('dan', '⏰', `<b>기한을 넘긴 신고 ${넘은것.length}건 · 12시간을 넘긴 신고 ${임박.length}건</b>
      <div class="t-sub mt1">위 지표 카드의 「기한 넘긴 건 ${REPORT_STATS.기한넘김}건」과 아래 붉은 줄의 수가 같습니다.</div>`, { cls: 'mb3' })}
    ${tableBar(`<b>${기한순.length}건</b> <span class="t-sub">· 오래 기다린 순으로 세웠습니다</span>`,
    `<select class="input" style="width:auto" data-sort-cards="rep" aria-label="정렬">
        <option value="ago" data-desc selected>기한 임박순(오래된 순)</option>
        <option value="dup" data-desc>누적 신고순</option>
        <option value="ago">최근 접수순</option></select>`)}
    <div data-pane-body="q0">
      ${대기열표(기한순.map((r) => 신고행(r, { dup: true })), { listKey: 'rep' })}
    </div>
    <div data-pane-body="q1" hidden>${대기열표(REPORTS.filter((r) => r.st === '처리중').map((r) => 신고행(r)))}</div>
    <div data-pane-body="q2" hidden>${대기열표(ADM_DONE_REPORTS.map(완료행))}</div>
    <div data-pane-body="q3" hidden>${대기열표(REPORTS.filter((r) => r.st === '보류').map((r) => 신고행(r)))}</div>
  </div>
</div>

<div class="mt-block">${card('기한을 넘긴 건', table(
    [{ t: '신고번호', w: '110px' }, { t: '대상' }, { t: '접수', w: '140px' }, { t: '경과', w: '130px' }, { t: '지금 상태', w: '96px' }, { t: '', w: '80px' }],
    넘은것.map((r) => ({
      cls: 'over',
      cells: [
        `<b>${r.id}</b>`, esc(r.target), r.at,
        `<b class="danger">${ago(r.ago)}</b><div class="t-sub">기한 ${ago(r.ago - 1440)} 지남</div>`,
        stBadge(r.st),
        btn('먼저 보기', { href: 'AD-02', cls: 'btn-danger btn-xs' }),
      ],
    })),
  ))}</div>

<div class="mt-block">${대기열갈래('AD0105')}</div>
`;
  return { body, o: { state: `기한 넘김 ${넘은것.length}건 — 붉은 띠로 표시했어요` } };
}

/* AD0106 — 담당자 지정. 고르면 상태가 처리중으로 바뀌고, 남이 잡은 건은 잠긴다. */
function AD0106(ctx) {
  const 보이는것 = REPORTS.filter((r) => r.st !== '완료');
  const body = `
${pageHd('신고 처리 대기열 — 담당자 지정', '담당자를 고르면 그 줄의 상태가 바로 「처리중」으로 바뀝니다')}

${대기열지표({ 대기: 대기건.length })}

<div>
  ${tabs(상태들.map((st, i) => ({ label: st, cnt: 셈(st), pane: 'q' + i })), 0)}
  <div class="mt4">
    ${banner('info', '👤', `<b>지금 로그인한 운영자는 ${ADM_ME}님입니다</b>
      <div class="t-sub mt1">다른 운영자가 이미 잡은 건은 🔒 로 잠그고 누가 보고 있는지 적어 둡니다 — 두 사람이 같은 건을 만지면 조치가 겹칩니다.</div>`, { cls: 'mb3' })}
    ${tableBar(`<b>${보이는것.length}건</b> <span class="t-sub">· 담당자 칸을 눌러 골라 보세요</span>`, '')}
    <div data-pane-body="q0">
      ${대기열표(보이는것.map((r) => 신고행(r, { lock: true })))}
    </div>
    <div data-pane-body="q1" hidden>${대기열표(REPORTS.filter((r) => r.st === '처리중').map((r) => 신고행(r, { lock: true })))}</div>
    <div data-pane-body="q2" hidden>${대기열표(ADM_DONE_REPORTS.map(완료행))}</div>
    <div data-pane-body="q3" hidden>${대기열표(REPORTS.filter((r) => r.st === '보류').map((r) => 신고행(r, { lock: true })))}</div>
  </div>
</div>

<div class="mt-block">${card('운영자별로 몇 건을 들고 있나', table(
    [{ t: '운영자', w: '140px' }, { t: '처리중', w: '110px' }, { t: '오늘 완료', w: '110px' }, { t: '' }],
    ADM_STAFF.map((n) => [
      `<b>${n}</b>${n === ADM_ME ? ' ' + badge('나', 'b-pri') : ''}`,
      `${REPORTS.filter((r) => r.who === n && r.st === '처리중').length}건`,
      `${ADM_DONE_REPORTS.filter((r) => r.who === n).length}건`,
      `<span class="t-sub">${n === ADM_ME ? '지금 이 화면을 보고 있습니다' : '잡고 있는 건은 잠겨 보입니다'}</span>`,
    ]),
  ))}</div>

<div class="mt-block">${대기열갈래('AD0106')}</div>
`;
  return { body, o: { state: '담당자를 지정하는 중' } };
}

/* AD0107 — 대기열 비었음. */
function AD0107(ctx) {
  const body = `
${pageHd('신고 처리 대기열', '처리할 신고가 남지 않았습니다')}

${대기열지표({ 대기: 0, 넘김: 0 })}

<div>
  ${tabs([{ label: '대기', cnt: 0, pane: 'q0' }, { label: '처리중', cnt: 셈('처리중'), pane: 'q1' },
    { label: '완료', cnt: 셈('완료'), pane: 'q2' }, { label: '보류', cnt: 셈('보류'), pane: 'q3' }], 0)}
  <div class="mt4">
    <div data-pane-body="q0">
      ${empty('🎉', '처리할 신고가 없어요',
    `오늘 들어온 ${REPORT_STATS.오늘접수}건을 모두 처리했습니다. 수고하셨어요.`,
    btn('완료 탭 보기', { href: 'AD0102', cls: 'btn-pri' })
    + btn('금지품목·규칙 보기', { href: 'AD-03', cls: 'btn-ghost' })
    + btn('정산·분쟁 보기', { href: 'AD-04', cls: 'btn-ghost' }))}
    </div>
    <div data-pane-body="q1" hidden>${대기열표(REPORTS.filter((r) => r.st === '처리중').map((r) => 신고행(r)))}</div>
    <div data-pane-body="q2" hidden>${대기열표(ADM_DONE_REPORTS.map(완료행))}</div>
    <div data-pane-body="q3" hidden>${대기열표(REPORTS.filter((r) => r.st === '보류').map((r) => 신고행(r)))}</div>
  </div>
</div>

<div class="mt-block">${card('오늘 처리 요약', `
  <div class="g4">
    <div class="kpi"><span class="l">오늘 접수</span><span class="v">${num(REPORT_STATS.오늘접수)}<small>건</small></span></div>
    <div class="kpi k-ok"><span class="l">오늘 완료</span><span class="v">${num(REPORT_STATS.오늘접수)}<small>건</small></span></div>
    <div class="kpi k-acc"><span class="l">평균 처리 시간</span><span class="v">${REPORT_STATS.평균처리}</span></div>
    <div class="kpi k-mut"><span class="l">기한 넘김</span><span class="v">0<small>건</small></span></div>
  </div>
  <div class="mt4">${table([{ t: '무슨 조치', w: '160px' }, { t: '건수', w: '100px' }, { t: '' }],
    [
      [badge('반려', 'b-mut'), '1건', '<span class="t-sub">규정 위반으로 보기 어려운 건</span>'],
      [badge('경고', 'b-warn'), '1건', '<span class="t-sub">경고 누적 3회가 되면 정지 검토로 넘어갑니다</span>'],
      [badge('글 삭제', 'b-danger'), '1건', '<span class="t-sub">금지 품목이 확인된 판매글</span>'],
      [badge('이용 정지', 'b-danger'), '1건', '<span class="t-sub">3일 정지 — 욕설·비방</span>'],
    ])}</div>`)}</div>

<div class="mt-block">${대기열갈래('AD0107')}</div>
`;
  return { body, o: { state: '대기열이 비었습니다' } };
}

/* ═══════════════ AD02 신고 상세·조치 ═══════════════ */

const 신고 = REPORTS[0];                       // R-2418 · 회원 바람개비 · 사기 의심
const 대상회원 = userBy('u5');                  // 바람개비
const 신고매물 = itemBy(신고.item);              // i6 캠핑 의자

/** 조치 고르개 — «고르면 실제로» 추가 입력과 안내 문구가 바뀐다(app.js data-sel-show / data-sel-text).
   ⛔ 라디오만으로는 아무 일도 일어나지 않는다. 약속한 것이 일어나게 고르개로 만든다. */
function 조치고르개(key, sel = '이용 정지') {
  return `<div class="fld">
    <label class="lb" for="act-${key}">무엇을 할까요</label>
    <select class="input" id="act-${key}" data-sel-show="${key}" data-sel-text="${key}">
      ${ADM_ACTS.map((a) => `<option${a === sel ? ' selected' : ''}>${a}</option>`).join('')}
    </select>
    <p class="t-sub mt2" data-sel-out="${key}" data-sel-map='${JSON.stringify(ADM_ACT_DESC)}'>${ADM_ACT_DESC[sel]}</p>
  </div>

  <div class="sub-fld" data-sel-case="${key}" data-sel-when="이용 정지"${sel === '이용 정지' ? '' : ' hidden'}>
    <label class="lb" for="days-${key}">정지 기간</label>
    <select class="input" id="days-${key}"><option>3일</option><option selected>7일</option><option>30일</option><option>90일</option></select>
    <p class="t-sub mt2">정지 기간에는 글쓰기와 채팅을 할 수 없습니다.</p>
  </div>
  <div class="sub-fld" data-sel-case="${key}" data-sel-when="글 삭제|노출 제한"${/글 삭제|노출 제한/.test(sel) ? '' : ' hidden'}>
    <label class="lb" for="why-${key}">삭제·제한 사유</label>
    <select class="input" id="why-${key}"><option>거래 전 선입금 유도</option><option>금지 품목</option><option>남의 사진 도용</option><option>광고·도배</option></select>
    <p class="t-sub mt2">이 사유가 회원에게 그대로 전달됩니다.</p>
  </div>
  <div class="sub-fld" data-sel-case="${key}" data-sel-when="반려"${sel === '반려' ? '' : ' hidden'}>
    <label class="lb" for="rej-${key}">신고자에게 갈 까닭</label>
    <select class="input" id="rej-${key}"><option>규정 위반으로 보기 어려움</option><option>같은 건이 이미 처리됨</option><option>자료가 모자람</option></select>
    <p class="t-sub mt2">반려하면 신고당한 분에게는 아무것도 가지 않습니다.</p>
  </div>
  <div class="sub-fld" data-sel-case="${key}" data-sel-when="경고"${sel === '경고' ? '' : ' hidden'}>
    <label class="lb">경고 누적</label>
    <p class="t-sub">지금 2회 → 이 조치로 <b>3회</b>가 됩니다. 3회가 되면 자동으로 정지 검토에 올라갑니다.</p>
  </div>
  <div class="sub-fld" data-sel-case="${key}" data-sel-when="영구 정지"${sel === '영구 정지' ? '' : ' hidden'}>
    ${banner('dan', '⛔', '<b>되돌리려면 운영 책임자 승인이 필요합니다.</b>')}
  </div>`;
}

/** 상세 화면 왼쪽 본문 — 다섯 화면이 이 조각들을 나눠 쓴다 */
const 신고요약 = () => card('', `<div class="row-b wrap-row">
  <div>
    <div class="row-c wrap-row" style="gap:6px">
      <b class="t-card">${신고.id}</b>${badge(짧은사유[신고.why], 'b-mut')}${stBadge(신고.lv)}${stBadge(신고.st)}
    </div>
    <p class="t-sub mt1">${신고.at} 접수 · ${ago(신고.ago)} 경과 · 담당 ${신고.who} · 같은 대상 누적 ${신고.dup}건</p>
  </div>
  <div class="btns">
    ${btn('‹ 이전 신고', { cls: 'btn-quiet btn-sm', attr: ' data-toast="R-2417 로 넘어갑니다"' })}
    ${btn('다음 신고 ›', { cls: 'btn-quiet btn-sm', attr: ' data-toast="R-2416 으로 넘어갑니다"' })}
  </div>
</div>`);

const 대화상자 = (o = {}) => {
  const 말들 = (o.더 ? ADM_TALK_BEFORE.concat(ADM_TALK) : ADM_TALK);
  return `<div class="talk-wrap" style="min-height:auto">
    <div class="day-sep">9월 6일</div>
    ${말들.map((m) => `<div class="bub${m.me ? ' me' : ''}${m.hl ? ' hl' : ''}">${esc(m.t)}<span class="when">${m.at}</span></div>`).join('')}
  </div>`;
};

function AD0201(ctx) {
  const 왼쪽 = `
${신고요약()}

<div class="mt-block">${sec('① 신고한 분이 적은 것', card('', `
  <p class="t-sub mb2">${esc(신고.by)}님 · ${신고.at}</p>
  <p>채팅에서 「지금 바로 입금하시면 오늘 보내드린다」며 계좌를 먼저 알려줬습니다.
  안전결제로 하자고 했더니 「수수료가 아까우니 그냥 계좌로 보내라」고 했어요.
  같은 물건이 다른 동네에도 똑같은 사진으로 올라와 있습니다.</p>
  <div class="row wrap-row mt4" style="gap:8px">${[1, 2, 3, 4].map((n) => phItem(92, 'ev' + n)).join('')}</div>
  <p class="t-sub mt2">첨부한 캡처 4장 — 신고한 분이 올린 증거입니다.</p>`))}</div>

<div class="mt-block">${sec('② 신고된 대화 원본', card('', `
  ${대화상자()}
  <p class="t-sub mt3">노란 바탕이 신고된 말입니다.</p>
  <div class="btns mt3">
    ${btn('대화 원본 크게 보기', { href: 'AD0202', cls: 'btn-ghost btn-sm' })}
    ${btn('앞뒤 맥락 더 보기', { cls: 'btn-quiet btn-sm', attr: ' data-toast="앞뒤 대화를 더 폈어요"' })}
  </div>`))}</div>

<div class="mt-block">${sec('③ 신고된 회원', `
  ${userCard(대상회원, { href: 'MY-01' })}
  <div class="mt4">${kv([
    ['가입일', 대상회원.since],
    ['거래 수', `판 것 ${대상회원.sold}건 · 산 것 ${대상회원.bought}건`],
    ['매너 점수', manner(대상회원.manner)],
    ['응답률', `${대상회원.resp}%`],
    ['과거 신고', `${ADM_PAST.length}건`],
    ['경고 누적', `<b class="danger">2회</b> (3회면 정지 검토)`],
  ])}</div>
  <div class="mt4">${table([{ t: '언제', w: '140px' }, { t: '무슨 신고' }, { t: '어떻게 했나', w: '120px' }],
    ADM_PAST.map(([at, why, act, cls]) => [at, why, badge(act, cls)]))}</div>
  ${banner('warn', '⚠', `<b>같은 사유(사기 의심)로 이번이 4번째입니다</b>
    <div class="t-sub mt1">경고 2회가 쌓여 있어요. 규정상 이용 정지를 검토할 자리입니다.</div>`, { cls: 'mt3' })}
  <div class="btns mt3">${btn('회원 프로필 보기', { href: 'MY-01', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

<div class="mt-block">${sec('④ 신고된 매물', `
  ${itemRow(신고매물, { href: 'SE-04' })}
  <p class="t-sub mt2">신고된 판매글입니다. 조치에서 「글 삭제」를 고르면 이 글이 내려갑니다.</p>`)}</div>

<div class="mt-block">${sec('⑤ 양쪽에 갈 안내 문구 — 이 문구가 그대로 갑니다', card('', `
  <div class="t-sub mb2">신고한 분(${esc(신고.by)})에게</div>
  ${box(`<p data-sel-out="act" data-sel-map='${JSON.stringify(Object.fromEntries(Object.entries(ADM_MSGS).map(([k, v]) => [k, v.rep])))}'>${ADM_MSGS['이용 정지'].rep}</p>`)}
  <div class="t-sub mb2 mt4">신고당한 분(${esc(대상회원.nick)})에게</div>
  ${box(`<p data-sel-out="act" data-sel-map='${JSON.stringify(Object.fromEntries(Object.entries(ADM_MSGS).map(([k, v]) => [k, v.tgt || '<span class="muted">반려는 신고당한 분에게 아무것도 보내지 않습니다.</span>'])))}'>${ADM_MSGS['이용 정지'].tgt}</p>`)}
  <p class="t-sub mt3">오른쪽에서 조치를 바꾸면 이 두 문구가 바로 바뀝니다.
  <a class="link" href="${link('AD0204')}">크게 보기 ›</a></p>`))}</div>

<div class="mt-block">${sec('⑥ 처리 이력', card('', timeline(ADM_TIMELINE, 2)))}</div>

<div class="mt-block">${상세갈래('AD-02')}</div>
`;

  const 오른쪽 = `
${actPanel('조치', 조치고르개('act'),
    btn('안내 문구 미리보기', { href: 'AD0204', cls: 'btn-ghost' })
    + btn('조치 확정', { cls: 'btn-pri btn-lg', attr: ' data-modal="fix"' }),
    { state: 신고.st })}

${actPanel('내부 메모', `
  <textarea class="input" rows="3" placeholder="회원에게는 안 보여요">같은 사진이 3개 동네에 올라와 있음. 계좌번호 대조 필요.</textarea>`,
    btn('메모 저장', { cls: 'btn-ghost', attr: ' data-toast="내부 메모를 저장했어요"' }))}

${actPanel('그 밖에', '',
    btn('보류로 두기', { cls: 'btn-ghost', attr: ' data-modal="hold"' })
    + btn('신고된 대화 원본', { href: 'AD0202', cls: 'btn-ghost' })
    + btn('대기열로 돌아가기', { href: 'AD-01', cls: 'btn-quiet' }))}
`;

  const body = detailSplit(왼쪽, 오른쪽) + `
${modal('fix', '이대로 확정할까요?', `
  <p class="t-sub mb3">확정하면 아래가 <b>바로</b> 일어납니다.</p>
  <ul class="dots">${ADM_EFFECT.map((t) => `<li>${t}</li>`).join('')}</ul>
  ${banner('warn', '⚠', '되돌리려면 운영 책임자 승인이 필요합니다.', { cls: 'mt3' })}`,
    btn('다시 볼게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + btn('확정 화면으로', { href: 'AD0205', cls: 'btn-pri' }))}

${modal('hold', '보류로 둘까요?', `
  <div class="fld"><label class="lb" for="hw">왜 보류하나요</label>
    <textarea class="input" id="hw" rows="3" placeholder="예: 계좌번호 대조 결과를 기다리는 중"></textarea></div>
  <div class="fld"><label class="lb" for="hd">언제 다시 볼까요</label>
    <select class="input" id="hd"><option>내일</option><option selected>3일 뒤</option><option>일주일 뒤</option></select></div>
  <p class="t-sub">그날이 되면 대기열에 다시 올라옵니다.</p>`,
    btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + btn('보류로 두기', { href: 'AD-01', cls: 'btn-pri' }))}
`;
  return { body, o: {} };
}

/* AD0202 — 신고된 대화 원본 */
function AD0202(ctx) {
  const 왼쪽 = `
${신고요약()}

<div class="mt-block">${sec('신고된 대화 — 시간순으로 그대로', card('', `
  <p class="t-sub mb3">신고된 말에 <span class="hl">노란 바탕</span>을 칠했습니다. 앞뒤 맥락이 함께 보이도록 그 전후를 같이 펼쳤습니다.</p>
  ${대화상자({ 더: true })}
  <div class="row-b wrap-row mt3">
    <span class="t-sub">${ADM_TALK_BEFORE.length + ADM_TALK.length}개의 말 가운데 ${ADM_TALK.filter((m) => m.hl).length}개가 신고됐습니다.</span>
    <div class="btns">
      ${btn('더 앞으로', { cls: 'btn-quiet btn-sm', attr: ' data-toast="앞쪽 대화를 더 폈어요"' })}
      ${btn('더 뒤로', { cls: 'btn-quiet btn-sm', attr: ' data-toast="뒤쪽 대화를 더 폈어요"' })}
    </div>
  </div>`))}</div>

<div class="mt-block">${sec('캡처와 원본 대조', card('', `
  <p class="t-sub mb3">신고한 분이 올린 캡처(왼쪽)와 우리 쪽에 남은 원본(오른쪽)이 같은지 봅니다.
  캡처는 잘리거나 고쳐질 수 있어 <b>반드시 원본과 견줍니다</b>.</p>
  <div class="split-2">
    <div class="side-a">
      <div class="row-c wrap-row mb2">${badge('신고자 캡처', 'b-mut')}<span class="t-sub">${esc(신고.by)}님이 올림</span></div>
      ${ph(['신고자가 올린 대화 캡처', 900, 1200], { seed: 'cap1' })}
    </div>
    <div class="side-b">
      <div class="row-c wrap-row mb2">${badge('서버 원본', 'b-ok')}<span class="t-sub">지운 말 없음</span></div>
      ${ph(['서버에 남은 대화 원본', 900, 1200], { seed: 'cap2' })}
    </div>
  </div>
  ${banner('ok', '✅', `<b>캡처와 원본이 같습니다</b>
    <div class="t-sub mt1">지워지거나 덧붙은 말이 없습니다. 신고 내용을 그대로 받아들여도 됩니다.</div>`, { cls: 'mt4' })}`))}</div>

<div class="mt-block">${상세갈래('AD0202')}</div>
`;

  const 오른쪽 = `
${actPanel('이 대화를 보고', `
  <p class="t-sub">대화에서 확인된 것</p>
  <ul class="dots mt2">
    <li>안전결제를 거절하고 <b>계좌 직접 입금</b>을 요구했습니다</li>
    <li>「다른 분도 기다린다」며 <b>서두르게</b> 했습니다</li>
    <li>구매자는 입금하지 않았습니다 — <b>피해는 아직 없습니다</b></li>
  </ul>`, '', { state: 신고.lv })}

${actPanel('조치', 조치고르개('act2', '경고'),
    btn('안내 문구 미리보기', { href: 'AD0204', cls: 'btn-ghost' })
    + btn('조치 확정', { href: 'AD0205', cls: 'btn-pri btn-lg' }))}

${actPanel('그 밖에', '',
    btn('신고 상세로 돌아가기', { href: 'AD-02', cls: 'btn-ghost' })
    + btn('대기열로 돌아가기', { href: 'AD-01', cls: 'btn-quiet' }))}
`;
  return { body: detailSplit(왼쪽, 오른쪽), o: { state: '신고된 대화 원본을 보는 중' } };
}

/* AD0203 — 조치 고르기. 고른 것에 따라 추가 입력과 안내 문구가 바뀐다. */
function AD0203(ctx) {
  const 왼쪽 = `
${신고요약()}

<div class="mt-block">${sec('무엇을 고를 수 있나', card('', `
  <p class="t-sub mb3">오른쪽 액션 패널에서 조치를 고르면 <b>아래 칸이 바뀝니다</b> —
  정지를 고르면 기간 칸이, 삭제를 고르면 사유 칸이 열립니다.
  반려를 고르면 신고당한 분에게는 아무것도 가지 않고 신고자에게 갈 문구로 바뀝니다.</p>
  ${table([{ t: '조치', w: '130px' }, { t: '무슨 일이 일어나나' }, { t: '추가 입력', w: '150px' }],
    [
      [badge('반려', 'b-mut'), ADM_ACT_DESC['반려'], '신고자에게 갈 까닭'],
      [badge('경고', 'b-warn'), ADM_ACT_DESC['경고'], '없음 (누적만 오름)'],
      [badge('글 삭제', 'b-danger'), ADM_ACT_DESC['글 삭제'], '삭제 사유'],
      [badge('노출 제한', 'b-warn'), ADM_ACT_DESC['노출 제한'], '제한 사유'],
      [badge('이용 정지', 'b-danger'), ADM_ACT_DESC['이용 정지'], '정지 기간'],
      [badge('영구 정지', 'b-danger'), ADM_ACT_DESC['영구 정지'], '운영 책임자 승인'],
    ])}`))}</div>

<div class="mt-block">${sec('고른 조치에 따라 갈 문구', card('', `
  <div class="t-sub mb2">신고한 분(${esc(신고.by)})에게</div>
  ${box(`<p data-sel-out="act" data-sel-map='${JSON.stringify(Object.fromEntries(Object.entries(ADM_MSGS).map(([k, v]) => [k, v.rep])))}'>${ADM_MSGS['이용 정지'].rep}</p>`)}
  <div class="t-sub mb2 mt4">신고당한 분(${esc(대상회원.nick)})에게</div>
  ${box(`<p data-sel-out="act" data-sel-map='${JSON.stringify(Object.fromEntries(Object.entries(ADM_MSGS).map(([k, v]) => [k, v.tgt || '<span class="muted">반려는 신고당한 분에게 아무것도 보내지 않습니다.</span>'])))}'>${ADM_MSGS['이용 정지'].tgt}</p>`)}
  <p class="t-sub mt3">오른쪽에서 조치를 바꾸면 이 두 문구가 바로 바뀝니다.</p>`))}</div>

<div class="mt-block">${상세갈래('AD0203')}</div>
`;

  const 오른쪽 = `
${actPanel('조치 고르기', 조치고르개('act'),
    btn('문구 그대로 보기', { href: 'AD0204', cls: 'btn-ghost' })
    + btn('조치 확정', { href: 'AD0205', cls: 'btn-pri btn-lg' }),
    { state: 신고.st })}

${actPanel('그 밖에', '',
    btn('신고 상세로', { href: 'AD-02', cls: 'btn-ghost' })
    + btn('대기열로 돌아가기', { href: 'AD-01', cls: 'btn-quiet' }))}
`;
  return { body: detailSplit(왼쪽, 오른쪽), o: { state: '조치를 고르는 중 — 고르면 아래 칸이 바뀝니다' } };
}

/* AD0204 — 안내 문구 미리보기 */
function AD0204(ctx) {
  const 왼쪽 = `
${신고요약()}

${banner('warn', '✉', `<b>이 문구가 그대로 갑니다</b>
  <div class="t-sub mt1">아래 모양 그대로 알림과 메일로 나갑니다. 고치지 않으면 이 글이 두 사람에게 전달됩니다.</div>`, { cls: 'mt-block' })}

<div class="mt-block">${sec('신고한 분에게', card('', `
  <div class="row-b wrap-row mb3">
    <div class="row-c" style="gap:8px">${badge('받는 사람', 'b-pri')}<b>${esc(신고.by)}</b></div>
    <span class="t-sub">알림 + 메일</span>
  </div>
  ${box(`<p><b>[우리동네장터] 신고 처리 결과를 알려드립니다</b></p>
    <p class="mt3" data-sel-out="msg" data-sel-map='${JSON.stringify(Object.fromEntries(Object.entries(ADM_MSGS).map(([k, v]) => [k, v.rep])))}'>${ADM_MSGS['이용 정지'].rep}</p>
    <p class="t-sub mt3">문의가 있으시면 고객센터(${SITE.tel})로 알려 주세요.</p>`)}`))}</div>

<div class="mt-block">${sec('신고당한 분에게', card('', `
  <div class="row-b wrap-row mb3">
    <div class="row-c" style="gap:8px">${badge('받는 사람', 'b-warn')}<b>${esc(대상회원.nick)}</b></div>
    <span class="t-sub">알림 + 메일</span>
  </div>
  ${box(`<p><b>[우리동네장터] 회원님의 활동에 조치가 있었습니다</b></p>
    <p class="mt3" data-sel-out="msg" data-sel-map='${JSON.stringify(Object.fromEntries(Object.entries(ADM_MSGS).map(([k, v]) => [k, v.tgt || '<span class="muted">이 조치에서는 신고당한 분에게 아무것도 보내지 않습니다.</span>'])))}'>${ADM_MSGS['이용 정지'].tgt}</p>
    <p class="t-sub mt3">이의가 있으시면 고객센터로 알려 주세요.</p>`)}`))}</div>

<div class="mt-block">${sec('보내기 전에 확인할 것', card('', `
  <label class="check"><input type="checkbox" checked>회원의 실명·전화번호가 문구에 들어가지 않았나</label>
  <label class="check"><input type="checkbox" checked>정지 기간과 시작일이 조치와 같은가</label>
  <label class="check"><input type="checkbox">이의 제기 방법을 적어 두었나</label>`))}</div>

<div class="mt-block">${상세갈래('AD0204')}</div>
`;

  const 오른쪽 = `
${actPanel('문구 고르기', `
  <div class="fld">
    <label class="lb" for="msgsel">조치</label>
    <select class="input" id="msgsel" data-sel-text="msg">
      ${ADM_ACTS.map((a) => `<option${a === '이용 정지' ? ' selected' : ''}>${a}</option>`).join('')}
    </select>
    <p class="t-sub mt2">고르면 왼쪽 두 문구가 그 조치의 글로 바뀝니다.</p>
  </div>
  <div class="fld">
    <label class="lb" for="tone">말투</label>
    <select class="input" id="tone" data-toast="말투를 바꿨어요 — 문구를 다시 보세요">
      <option selected>기본 (정중한 안내)</option><option>짧게</option><option>규정 조항 포함</option>
    </select>
  </div>`,
    btn('문구 직접 고치기', { cls: 'btn-ghost', attr: ' data-modal="edit"' })
    + btn('이 문구로 확정', { href: 'AD0205', cls: 'btn-pri btn-lg' }),
    { state: 신고.st })}

${actPanel('그 밖에', '',
    btn('조치 다시 고르기', { href: 'AD0203', cls: 'btn-ghost' })
    + btn('신고 상세로', { href: 'AD-02', cls: 'btn-quiet' }))}
`;

  const body = detailSplit(왼쪽, 오른쪽) + modal('edit', '문구 고치기', `
  <div class="fld"><label class="lb" for="e1">신고한 분에게</label>
    <textarea class="input" id="e1" rows="4">신고해 주셔서 고맙습니다. 확인 결과 규정 위반이 확인되어 해당 회원에게 7일 이용 정지 조치를 했습니다.</textarea></div>
  <div class="fld"><label class="lb" for="e2">신고당한 분에게</label>
    <textarea class="input" id="e2" rows="4">회원님의 계정이 2026년 9월 7일부터 7일간 정지되었습니다. 사유는 「거래 전 선입금 유도」입니다.</textarea></div>
  <p class="t-sub">고친 문구도 기록에 남습니다.</p>`,
    btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + btn('고친 문구 쓰기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="문구를 고쳤어요"' }));

  return { body, o: { state: '양쪽에 갈 문구를 그대로 보는 중' } };
}

/* AD0205 — 조치 확정 */
function AD0205(ctx) {
  const 왼쪽 = `
${신고요약()}

<div class="mt-block">${modalStatic('이대로 확정할까요?', `
  <p class="t-sub mb3">확정하면 아래가 <b>바로</b> 일어납니다. 눌러야 일어나고, 누르기 전에는 아무것도 바뀌지 않습니다.</p>
  ${kv([
    ['신고번호', 신고.id],
    ['대상', `${esc(대상회원.nick)} (회원)`],
    ['조치', `${badge('이용 정지', 'b-danger')} <b>7일</b>`],
    ['기간', '2026-09-07 ~ 2026-09-14'],
    ['함께 내릴 글', `1건 — ${esc(신고매물.t)}`],
    ['알림', '양쪽 모두에게 (알림 + 메일)'],
  ])}
  <div class="mt4"><b class="t-card">무엇이 일어나나</b>
    <ul class="dots mt2">${ADM_EFFECT.map((t) => `<li>${t}</li>`).join('')}</ul></div>
  ${banner('dan', '⛔', `<b>되돌리는 방법</b>
    <div class="t-sub mt1">확정한 뒤 24시간 안에는 「조치 취소」로 되돌릴 수 있습니다. 그 뒤에는 운영 책임자 승인이 필요합니다.
    되돌리면 양쪽에 「조치가 취소되었습니다」라는 안내가 다시 갑니다.</div>`, { cls: 'mt4' })}`,
    btn('다시 볼게요', { href: 'AD0204', cls: 'btn-ghost' })
    + btn('확정', { cls: 'btn-pri', attr: ' data-modal="done"' }))}</div>

<div class="mt-block">${sec('확정한 뒤 이렇게 됩니다', card('', timeline([
    ['접수됨 · 민트초코', '09-07 08:12'],
    ['담당자 지정 · 박서준', '09-07 08:40'],
    ['자료 확인 중', '09-07 09:15'],
    ['조치 확정 · 이용 정지 7일', '지금'],
    ['양쪽에 알림 발송', '확정 직후'],
    ['정지 해제', '09-14'],
  ], 3)))}</div>

<div class="mt-block">${상세갈래('AD0205')}</div>
`;

  const 오른쪽 = `
${actPanel('확정할 조치', `
  ${kv([['조치', badge('이용 정지', 'b-danger')], ['기간', '7일'], ['글 삭제', '1건'], ['알림', '양쪽']])}
  <label class="check mt3"><input type="checkbox" data-unlock="go-fix">위 내용을 확인했고 <b>되돌리기 어렵다</b>는 것을 압니다</label>`,
    btn('조치 확정', { cls: 'btn-pri btn-lg', off: true, id: 'go-fix', attr: ' data-modal="done"' })
    + btn('보류로 두기', { cls: 'btn-ghost', attr: ' data-toast="보류로 옮겼어요 · 3일 뒤 대기열에 다시 올라옵니다"' })
    + btn('대기열로 돌아가기', { href: 'AD-01', cls: 'btn-quiet' }),
    { state: 신고.st })}

${actPanel('되돌리기', `
  <p class="t-sub">확정 뒤 <b>24시간</b> 안에는 이 화면에서 바로 취소할 수 있습니다.
  그 뒤에는 운영 책임자 승인을 받아야 합니다.</p>`,
    btn('되돌리기 규정 보기', { href: 'AD-03', cls: 'btn-quiet' }))}
`;

  const body = detailSplit(왼쪽, 오른쪽) + modal('done', '조치를 확정했습니다', `
  <p>바람개비님 계정을 <b>7일간 정지</b>했고, 신고된 판매글 1건을 내렸습니다.</p>
  <p class="t-sub mt3">양쪽에 안내가 발송됐습니다. 24시간 안에는 이 조치를 되돌릴 수 있습니다.</p>`,
    btn('되돌리기', { cls: 'btn-ghost', attr: ' data-dismiss data-toast="조치를 되돌렸어요 · 양쪽에 취소 안내가 갑니다"' })
    + btn('대기열로', { href: 'AD-01', cls: 'btn-pri' }));

  return { body, o: { state: '확정 직전 — 아직 아무것도 바뀌지 않았습니다' } };
}

/* ═══════════════ AD03 금지품목·거래규칙 ═══════════════ */

const 걸린매물합 = BANNED.reduce((a, b) => a + (b.on ? b.n : 0), 0);
const 켜진품목 = BANNED.filter((b) => b.on).length;

const 규칙지표 = () => kpis([
  ['금지 품목 분류', num(BANNED.length), { unit: '개', d: `켜 둔 것 ${켜진품목}개` }],
  ['지금 걸리는 매물', num(걸린매물합), { unit: '건', tone: 'k-warn', d: '켜 둔 규칙에 걸린 매물', href: 'AD0303' }],
  ['금지 낱말', num(BAN_WORDS.length), { unit: '개', tone: 'k-acc', d: `예외 낱말 ${BAN_EXCEPT.length}개`, href: 'AD0302' }],
  ['이의 제기 대기', num(ADM_APPEALS.length), { unit: '건', tone: 'k-danger', d: '잘못 걸렸다는 말이 들어온 것' }],
]);

const 품목표 = () => dashTable(
  [{ t: '품목', w: '180px' }, { t: '왜 안 되나요' }, { t: '올리면', w: '200px' },
  { t: '걸리는 매물', w: '110px' }, { t: '켜기', w: '76px' }, { t: '', w: '130px' }],
  BANNED.map((b, i) => ({
    data: { on: b.on ? 'on' : 'off' },
    cells: [
      `<b>${esc(b.k)}</b>`,
      `<span class="t-sub">${esc(b.why)}</span>`,
      `<select class="input" data-sel-text="act${i}" aria-label="${esc(b.k)} 자동 조치">
        <option${b.act === '바로 숨김' ? ' selected' : ''}>바로 숨김</option>
        <option${b.act === '검토 대기로' ? ' selected' : ''}>검토 대기로</option>
        <option${b.act === '경고만' ? ' selected' : ''}>경고만</option></select>
      <div class="t-sub mt1" data-sel-out="act${i}" data-sel-map='{"바로 숨김":"올리는 즉시 목록에서 빠집니다","검토 대기로":"검토 대기로 넘어가 운영자가 봅니다","경고만":"올린 분에게 경고만 보냅니다"}'>${
        b.act === '바로 숨김' ? '올리는 즉시 목록에서 빠집니다' : (b.act === '검토 대기로' ? '검토 대기로 넘어가 운영자가 봅니다' : '올린 분에게 경고만 보냅니다')}</div>`,
      b.on ? `<b>${num(b.n)}건</b>` : '<span class="muted">꺼 둠</span>',
      `<button class="toggle${b.on ? ' on' : ''}" type="button" role="switch" aria-checked="${b.on}" aria-label="${esc(b.k)} 규칙 켜기"><span class="kn"></span></button>`,
      `<div class="btns">${btn('수정', { cls: 'btn-quiet btn-xs', attr: ' data-toast="고칠 수 있게 열었어요"' })}
        ${btn('끄기', { cls: 'btn-quiet btn-xs', attr: ' data-toast="규칙을 껐어요 · 걸려 있던 매물이 다시 보입니다"' })}</div>`,
    ],
  })),
  { max: '460px' },
);

const 낱말상자 = () => `
${card('금지 낱말', `
  <div class="searchbar sm mb3">
    <input type="text" placeholder="막을 낱말 (예: 처방약)" aria-label="막을 낱말">
    ${btn('추가', { cls: 'btn-pri btn-sm', attr: ' data-toast="낱말을 더했어요 · 지금 이 말이 든 매물이 몇 개인지 세었습니다"' })}
  </div>
  <div class="chips">
    ${BAN_WORDS.map((w) => `<button class="chip on" type="button" data-toast="「${w}」를 금지 낱말에서 뺐어요">${w}<span class="cnt">${ADM_WORD_HITS[w] || 1}</span> <span class="x">✕</span></button>`).join('')}
  </div>
  <p class="t-sub mt3">칩 옆 숫자는 <b>지금 그 말이 든 매물 수</b>입니다. ✕ 를 누르면 그 낱말만 빠집니다.</p>`)}

<div class="mt-block">${card('이 낱말은 걸지 않기 (예외)', `
  <p class="t-sub mb3">「담배 케이스」처럼 금지 낱말이 들어 있지만 팔아도 되는 것들이에요.</p>
  <div class="chips">
    ${BAN_EXCEPT.map((w) => `<button class="chip on" type="button" data-toast="예외에서 뺐어요">${w} <span class="x">✕</span></button>`).join('')}
  </div>
  <div class="searchbar sm mt3">
    <input type="text" placeholder="예외로 둘 말" aria-label="예외 낱말">
    ${btn('예외 추가', { cls: 'btn-ghost btn-sm', attr: ' data-toast="예외 낱말에 넣었어요"' })}
  </div>`)}</div>

<div class="mt-block">${banner('warn', '⚠', `<b>「${ADM_WORD_WARN}」는 너무 흔한 말이에요</b>
  <div class="t-sub mt1">지금 걸면 「${ADM_WORD_WARN} 진열장」·「${ADM_WORD_WARN} 냉장고」 같은 매물 ${ADM_WORD_HITS[ADM_WORD_WARN]}건도 함께 걸립니다.
  예외 낱말을 먼저 넣어 주세요.</div>`,
  { right: btn('미리 재보기', { href: 'AD0303', cls: 'btn-ghost btn-sm' }) })}</div>`;

const 문구상자 = () => card('이용안내 화면에 그대로 나가는 글', `
  <textarea class="input" rows="9" aria-label="거래 규칙 문구">${esc(ADM_RULE_TEXT)}</textarea>
  <p class="t-sub mt2">이 글은 <a class="link" href="${link('HO-03')}">안전거래·이용안내</a> 화면에 그대로 나갑니다.</p>
  <div class="btns mt3">
    ${btn('이용안내 화면 보기', { href: 'HO-03', cls: 'btn-ghost' })}
    ${btn('이전 글과 견주기', { href: 'AD0304', cls: 'btn-ghost' })}
  </div>`);

function AD0301(ctx) {
  const body = `
${pageHd('금지품목·거래규칙 관리', '규칙 하나가 매물 수십 개를 내립니다. 저장 전에 숫자를 보세요',
    `<div class="btns">${btn('신고 대기열로', { href: 'AD-01', cls: 'btn-ghost' })}${btn('이용안내 화면 보기', { href: 'HO-03', cls: 'btn-pri' })}</div>`)}

${규칙지표()}

<div>
  ${tabs([
    { label: '금지 품목', cnt: BANNED.length, pane: 'b0' },
    { label: '금지 낱말', cnt: BAN_WORDS.length, pane: 'b1' },
    { label: '거래 규칙 문구', pane: 'b2' },
  ], 0)}
  <div class="mt4">
    <div data-pane-body="b0">
      ${tableBar(`<b>${num(걸린매물합)}건</b> <span class="t-sub">· 지금 켜 둔 규칙에 걸려 있는 매물</span>`,
    btn('＋ 품목 추가', { cls: 'btn-ghost btn-sm', attr: ' data-toast="새 줄이 열렸어요"' }))}
      ${품목표()}
    </div>
    <div data-pane-body="b1" hidden>${낱말상자()}</div>
    <div data-pane-body="b2" hidden>${문구상자()}</div>
  </div>
</div>

<div class="mt-block">${card('저장하기 전에 미리 재보기', `
  <p class="t-sub mb3">지금 올라와 있는 매물 전체에 이 규칙을 걸어 보고, 몇 개가 걸리는지만 세어 봅니다. <b>저장은 하지 않습니다.</b></p>
  <div class="btns">
    ${btn('미리 재보기', { href: 'AD0303', cls: 'btn-ghost' })}
    ${btn('저장 전 영향 요약', { href: 'AD0305', cls: 'btn-pri' })}
  </div>`)}</div>

<div class="mt-block">${card('잘못 걸려 이의 제기된 것', table(
    [{ t: '매물' }, { t: '올린 분', w: '120px' }, { t: '걸린 까닭', w: '140px' }, { t: '언제', w: '90px' }, { t: '', w: '120px' }],
    ADM_APPEALS.map(([t, who, why, at]) => [
      esc(t), esc(who), why, at,
      btn('되살리기', { cls: 'btn-ghost btn-xs', attr: ' data-toast="매물을 되살렸어요 · 올린 분에게 알렸습니다"' }),
    ]),
  ))}</div>

<div class="mt-block">${card('규칙이 바뀐 이력', table(
    [{ t: '언제', w: '130px' }, { t: '누가', w: '100px' }, { t: '무엇을' }],
    ADM_RULE_LOG,
  ))}</div>

<div class="mt-block">${규칙갈래('AD-03')}</div>
`;
  return { body, o: {} };
}

function AD0302(ctx) {
  const body = `
${pageHd('금지 낱말 관리', '낱말 하나를 막으면 그 말이 든 매물이 함께 걸립니다')}

${kpis([
    ['금지 낱말', num(BAN_WORDS.length), { unit: '개', d: '지금 막고 있는 말' }],
    ['이 말이 든 매물', num(Object.values(ADM_WORD_HITS).reduce((a, b) => a + b, 0)), { unit: '건', tone: 'k-warn', d: '모두 더한 수' }],
    ['예외 낱말', num(BAN_EXCEPT.length), { unit: '개', tone: 'k-acc', d: '걸지 않기로 한 말' }],
    ['잘못 걸릴 것 같은 것', num(ADM_PREVIEW.오탐), { unit: '건', tone: 'k-danger', d: '미리 재보기에서 나온 수', href: 'AD0303' }],
  ])}

${낱말상자()}

<div class="mt-block">${card('낱말마다 몇 건이 걸리나', dashTable(
    [{ t: '낱말', w: '160px' }, { t: '이 말이 든 매물', w: '150px' }, { t: '예외로 뺀 것', w: '150px' }, { t: '' }],
    BAN_WORDS.map((w) => [
      `<b>${w}</b>`,
      `<b>${num(ADM_WORD_HITS[w] || 1)}건</b>`,
      BAN_EXCEPT.filter((e) => e.includes(w)).length
        ? `${BAN_EXCEPT.filter((e) => e.includes(w)).length}건`
        : '<span class="muted">없음</span>',
      ADM_WORD_HITS[w] >= 9
        ? `<span class="t-sub"><b class="danger">흔한 말</b> — 예외를 먼저 넣는 편이 좋습니다</span>`
        : '<span class="t-sub">좁게 걸립니다</span>',
    ]),
  ), { bdCls: 'p0' })}</div>

<div class="mt-block">${규칙갈래('AD0302')}</div>
`;
  return { body, o: { state: '금지 낱말을 고치는 중 — 아직 저장하지 않았습니다' } };
}

function AD0303(ctx) {
  const body = `
${pageHd('규칙 미리 재보기', '지금 올라와 있는 매물 전체에 걸어 보고 몇 개가 걸리는지만 셉니다')}

${kpis([
    ['재본 매물', num(ADM_PREVIEW.재본), { unit: '건', d: '지금 올라와 있는 매물 전체' }],
    ['걸리는 매물', num(ADM_PREVIEW.걸림), { unit: '건', tone: 'k-warn', d: '규칙에 걸려 숨겨질 것' }],
    ['잘못 걸릴 것 같은 것', num(ADM_PREVIEW.오탐), { unit: '건', tone: 'k-danger', d: '사람이 봐야 할 것' }],
    ['저장 여부', '안 함', { tone: 'k-mut', d: '이 화면에서는 아무것도 바뀌지 않습니다' }],
  ])}

${banner('info', '🧪', `<b>여기서는 아무것도 저장되지 않습니다</b>
  <div class="t-sub mt1">규칙을 실제로 켜려면 「저장 전 영향 요약」에서 확정해야 합니다.</div>`,
    { right: btn('영향 요약으로', { href: 'AD0305', cls: 'btn-ghost btn-sm' }) })}

<div class="mt-block">${card('잘못 걸릴 것 같은 매물 ' + ADM_PREVIEW.오탐 + '건', dashTable(
    [{ t: '매물' }, { t: '걸린 까닭', w: '150px' }, { t: '올린 분', w: '120px' }, { t: '', w: '120px' }],
    ADM_PREVIEW.cases.map(([t, why, who]) => [
      esc(t), why, esc(who),
      btn('예외로', { cls: 'btn-ghost btn-xs', attr: ' data-toast="예외 낱말에 넣었어요 · 걸리는 수가 줄었습니다"' }),
    ]),
  ), { bdCls: 'p0' })}</div>

<div class="mt-block">${card('어느 규칙이 몇 건을 잡았나', table(
    [{ t: '규칙', w: '200px' }, { t: '잡은 매물', w: '120px' }, { t: '자동 조치', w: '140px' }, { t: '' }],
    BANNED.filter((b) => b.on).map((b) => [
      `<b>${esc(b.k)}</b>`, `${num(b.n)}건`, badge(b.act, b.act === '바로 숨김' ? 'b-danger' : 'b-warn'),
      `<span class="t-sub">${esc(b.why)}</span>`,
    ]),
  ))}</div>

<div class="mt-block">${card('다시 재보기', `
  <p class="t-sub mb3">예외 낱말을 고친 뒤 다시 눌러 보세요. 걸리는 수가 바로 다시 셈해집니다.</p>
  <div class="btns">
    ${btn('다시 재보기', { cls: 'btn-pri', attr: ' data-toast="매물 7,200건에 다시 걸어 봤어요 · 29건이 걸립니다"' })}
    ${btn('금지 낱말 고치러 가기', { href: 'AD0302', cls: 'btn-ghost' })}
  </div>`)}</div>

<div class="mt-block">${규칙갈래('AD0303')}</div>
`;
  return { body, o: { state: '미리 재보는 중 — 저장하지 않습니다' } };
}

function AD0304(ctx) {
  const body = `
${pageHd('거래 규칙 문구 편집', '여기에 적는 글이 손님 화면(안전거래·이용안내)에 그대로 나갑니다')}

${kpis([
    ['이 글이 나가는 화면', '1곳', { d: '안전거래·이용안내', href: 'HO-03' }],
    ['글자 수', num(ADM_RULE_TEXT.replace(/\s/g, '').length), { unit: '자', tone: 'k-acc', d: '공백 뺀 수' }],
    ['바뀌는 날', ADM_RULE_FROM, { tone: 'k-warn', d: '이날 0시부터 손님 화면에 나갑니다' }],
    ['고친 이력', num(ADM_RULE_LOG.length), { unit: '건', tone: 'k-mut', d: '누가 무엇을 고쳤나' }],
  ])}

${banner('warn', '📢', `<b>바꾸면 ${ADM_RULE_FROM}부터 반영됩니다</b>
  <div class="t-sub mt1">그 전까지는 지금 글이 그대로 보이고, 회원에게는 공지로 미리 알립니다.</div>`)}

<div class="mt-block">${card('고치는 글', `
  <textarea class="input" rows="10" aria-label="거래 규칙 문구">${esc(ADM_RULE_TEXT)}</textarea>
  <div class="row-b wrap-row mt3">
    <div class="row-c" style="gap:8px">
      <label class="lb" style="margin:0" for="from">언제부터</label>
      <select class="input" id="from" style="width:auto"><option selected>${ADM_RULE_FROM}</option><option>저장하는 즉시</option><option>다음 달 1일</option></select>
    </div>
    <div class="btns">
      ${btn('손님 화면 미리보기', { href: 'HO-03', cls: 'btn-ghost' })}
      ${btn('저장', { cls: 'btn-pri', attr: ' data-toast="문구를 저장했어요 · ' + ADM_RULE_FROM + '부터 손님 화면에 나갑니다"' })}
    </div>
  </div>`)}</div>

<div class="mt-block">${sec('이전 글과 견주기', `<div class="split-2">
  <div class="side-a">
    <div class="row-c wrap-row mb2">${badge('지금 나가는 글', 'b-mut')}<span class="t-sub">2026-07-30 부터</span></div>
    ${box(`<p style="white-space:pre-line">${esc(ADM_RULE_PREV)}</p>`)}
  </div>
  <div class="side-b">
    <div class="row-c wrap-row mb2">${badge('바꿀 글', 'b-pri')}<span class="t-sub">${ADM_RULE_FROM} 부터</span></div>
    ${box(`<p style="white-space:pre-line">${esc(ADM_RULE_PREV)}</p>
      <p class="mt3"><span class="hl">거래 전 선입금을 요구하는 것은 금지합니다. 값을 먼저 보내 달라는 말을 들으면 바로 신고해 주세요.</span></p>`)}
  </div>
</div>
<p class="t-sub mt3">노란 바탕이 <b>새로 더한 문단</b>입니다. 지운 문단은 없습니다.</p>`)}</div>

<div class="mt-block">${card('문구가 바뀐 이력', table(
    [{ t: '언제', w: '130px' }, { t: '누가', w: '100px' }, { t: '무엇을' }, { t: '', w: '110px' }],
    ADM_RULE_LOG.map(([at, who, what]) => [at, who, what,
      btn('그때 글 보기', { cls: 'btn-quiet btn-xs', attr: ' data-toast="그때 글을 열었어요"' })]),
  ))}</div>

<div class="mt-block">${규칙갈래('AD0304')}</div>
`;
  return { body, o: { state: '문구를 고치는 중 — 아직 저장하지 않았습니다' } };
}

function AD0305(ctx) {
  const 왼쪽 = `
${modalStatic(`이 규칙을 켜면 매물 ${ADM_PREVIEW.걸림}개가 숨겨집니다`, `
  <p class="t-sub mb3">저장을 누르면 아래가 <b>바로</b> 일어납니다. 누르기 전에는 아무것도 바뀌지 않습니다.</p>
  ${kv([
    ['재본 매물', `${num(ADM_PREVIEW.재본)}건`],
    ['숨겨질 매물', `<b class="danger">${num(ADM_PREVIEW.걸림)}건</b>`],
    ['잘못 걸릴 것 같은 것', `<b class="danger">${ADM_PREVIEW.오탐}건</b> — 먼저 예외로 빼는 편이 좋습니다`],
    ['영향받는 회원', '28명'],
    ['알림', '숨겨진 글을 올린 분에게 사유와 함께'],
  ])}
  <div class="mt4"><b class="t-card">무엇이 일어나나</b>
    <ul class="dots mt2">
      <li>매물 <b>${num(ADM_PREVIEW.걸림)}건</b>이 목록·검색에서 빠집니다</li>
      <li>올린 분 <b>28명</b>에게 「어떤 규칙에 걸렸는지」가 함께 갑니다</li>
      <li>이의 제기가 들어오면 <b>이의 제기 대기</b>에 쌓입니다</li>
      <li>이 규칙 변경은 <b>바뀐 이력</b>에 남습니다</li>
    </ul></div>
  ${banner('warn', '⚠', `<b>되돌릴 수 있습니다</b>
    <div class="t-sub mt1">규칙을 다시 끄면 숨겨졌던 매물이 되살아납니다. 다만 그 사이에 받은 알림은 취소되지 않습니다.</div>`, { cls: 'mt4' })}`,
    btn('취소', { href: 'AD-03', cls: 'btn-ghost' })
    + btn('잘못 걸릴 것 먼저 보기', { href: 'AD0303', cls: 'btn-ghost' }))}

<div class="mt-block">${card('영향받는 매물 ' + ADM_PREVIEW.걸림 + '건 가운데 먼저 볼 것', dashTable(
    [{ t: '매물' }, { t: '걸린 까닭', w: '150px' }, { t: '올린 분', w: '120px' }, { t: '', w: '110px' }],
    ADM_PREVIEW.cases.map(([t, why, who]) => [
      esc(t), why, esc(who),
      btn('예외로', { cls: 'btn-ghost btn-xs', attr: ' data-toast="예외 낱말에 넣었어요 · 숨겨질 수가 줄었습니다"' }),
    ]),
  ), { bdCls: 'p0', ft: `<span class="t-sub">나머지 ${ADM_PREVIEW.걸림 - ADM_PREVIEW.오탐}건은 규칙에 또렷하게 걸리는 것입니다.</span>` })}</div>

<div class="mt-block">${규칙갈래('AD0305')}</div>
`;

  const 오른쪽 = `
${actPanel('저장할까요', `
  ${kv([
    ['숨겨질 매물', `<b class="danger">${num(ADM_PREVIEW.걸림)}건</b>`],
    ['알림 받을 회원', '28명'],
    ['적용', '저장하는 즉시'],
  ])}
  <label class="check mt3"><input type="checkbox" data-unlock="go-save">숨겨질 ${num(ADM_PREVIEW.걸림)}건을 확인했습니다</label>`,
    btn('저장하고 규칙 켜기', { cls: 'btn-pri btn-lg', off: true, id: 'go-save', attr: ' data-toast="규칙을 저장했어요 · 매물 34건이 숨겨졌습니다"' })
    + btn('영향받는 매물 보기', { href: 'AD0303', cls: 'btn-ghost' })
    + btn('취소', { href: 'AD-03', cls: 'btn-quiet' }),
    { state: '보류' })}

${actPanel('되돌리기', `
  <p class="t-sub">규칙을 다시 끄면 숨겨졌던 매물이 되살아납니다. 「금지품목·거래규칙 관리」의 켜기 단추를 끄면 됩니다.</p>`,
    btn('규칙 표로 가기', { href: 'AD-03', cls: 'btn-quiet' }))}
`;
  return { body: detailSplit(왼쪽, 오른쪽), o: { state: '저장 전 — 아직 아무것도 바뀌지 않았습니다' } };
}

/* ═══════════════ AD04 안전결제 정산·분쟁 ═══════════════ */

const 정산대기 = SETTLES.filter((s) => s.st === '정산대기');
const 정산완료 = SETTLES.filter((s) => s.st === '정산완료');
const 분쟁건 = SETTLES.filter((s) => s.st === '분쟁');
const 보관중 = 정산대기.reduce((a, s) => a + s.price, 0) + 분쟁건.reduce((a, s) => a + s.price, 0);
const 이번주정산 = 정산대기.reduce((a, s) => a + payout(s.price), 0);
const 수수료수입 = SETTLES.reduce((a, s) => a + fee(s.price), 0);
const 분쟁매물 = itemBy(분쟁건[0].item);

/** 정산 표 — 합계 줄(tfoot)에서 «결제액 − 수수료 = 수령액»이 늘 맞아야 한다 */
function 정산표(것들, o = {}) {
  const 결제합 = 것들.reduce((a, s) => a + s.price, 0);
  const 수수료합 = 것들.reduce((a, s) => a + fee(s.price), 0);
  /* 분쟁 건에 일부 환불이 걸리면 수령액이 줄어 «합이 어긋난다» — 검산이 잡아내야 할 것이 이것이다 */
  const 환불 = o.환불 ? 것들.filter((s) => s.no === ADM_REFUND.no).length * ADM_REFUND.amount : 0;
  const 수령합 = 것들.reduce((a, s) => a + payout(s.price), 0) - 환불;

  return dashTable(
    [{ t: '거래번호', w: '110px' }, { t: '물건' }, { t: '구매자', w: '100px' }, { t: '판매자', w: '100px' },
    { t: '결제액', w: '110px' }, { t: '수수료', w: '105px' }, { t: '수령액', w: '110px' },
    { t: '정산 예정일', w: '105px' }, { t: '상태', w: '92px' }, { t: '', w: '104px' }],
    것들.map((s) => {
      const it = itemBy(s.item);
      const 깎임 = o.환불 && s.no === ADM_REFUND.no;
      return {
        cls: 깎임 ? 'over' : '',
        cells: [
          `<b>${s.no}</b>`,
          `<a class="strong" href="${link('PA-05')}">${esc(it.t)}</a>`,
          esc(s.buyer), esc(s.seller),
          `<span class="nowrap">${won(s.price)}</span>`,
          `<span class="nowrap">− ${won(fee(s.price))}</span>`,
          깎임
            ? `<b class="nowrap danger">${won(payout(s.price) - ADM_REFUND.amount)}</b><div class="t-sub">일부 환불 ${won(ADM_REFUND.amount)} 뺌</div>`
            : `<b class="nowrap">${won(payout(s.price))}</b>`,
          s.due,
          stBadge(s.st),
          s.st === '분쟁'
            ? btn('분쟁 보기', { href: 'AD0405', cls: 'btn-pri btn-xs' })
            : (s.st === '정산완료'
              ? btn('내역', { cls: 'btn-quiet btn-xs', attr: ' data-toast="정산 내역을 열었어요"' })
              : btn('정산 보류', { href: 'AD0404', cls: 'btn-ghost btn-xs' })),
        ],
      };
    }),
    {
      max: '420px',
      foot: ['합계', '', '', '',
        `<b>${won(결제합)}</b>`, `<b>− ${won(수수료합)}</b>`, `<b>${won(수령합)}</b>`, '', '', ''],
    },
  );
}

/** 합계 검산 — 결제액 합 − 수수료 합 = 수령액 합 인가 */
function 검산(것들, o = {}) {
  const 결제합 = 것들.reduce((a, s) => a + s.price, 0);
  const 수수료합 = 것들.reduce((a, s) => a + fee(s.price), 0);
  const 환불 = o.환불 ? 것들.filter((s) => s.no === ADM_REFUND.no).length * ADM_REFUND.amount : 0;
  const 수령합 = 것들.reduce((a, s) => a + payout(s.price), 0) - 환불;
  const 맞나 = 결제합 - 수수료합 === 수령합;
  return 맞나
    ? banner('ok', '🧮', `<b>합계가 맞습니다</b>
      <div class="t-sub mt1">결제액 ${won(결제합)} − 수수료 ${won(수수료합)} = 수령액 ${won(수령합)}</div>`)
    : banner('dan', '🧮', `<b>합계가 맞지 않습니다 — ${won((결제합 - 수수료합) - 수령합)} 차이</b>
      <div class="t-sub mt1">결제액 ${won(결제합)} − 수수료 ${won(수수료합)} = ${won(결제합 - 수수료합)} 인데
      수령액 합은 ${won(수령합)} 입니다. 어긋난 줄: <b>${ADM_REFUND.no}</b> (분쟁 일부 환불 ${won(ADM_REFUND.amount)}이 빠졌습니다).</div>`,
      { right: btn('그 줄 보기', { href: 'AD0406', cls: 'btn-danger btn-sm' }) });
}

const 정산지표 = (o = {}) => kpis([
  ['지금 보관 중인 돈', `<span data-recalc-out="term" data-i="0">${won(보관중)}</span>`,
    { d: '구매확정 전이라 아직 판매자에게 안 간 돈' }],
  ['이번 주 정산 예정', `<span data-recalc-out="term" data-i="1">${won(이번주정산)}</span>`,
    { tone: 'k-acc', d: `${정산대기.length}건` }],
  ['분쟁 진행', `<span data-recalc-out="term" data-i="2">${분쟁건.length}</span>`,
    { unit: '건', tone: 'k-danger', d: '판단을 기다리는 건', href: 'AD0405' }],
  ['고른 기간 수수료 수입', `<span data-recalc-out="term" data-i="3">${won(수수료수입)}</span>`,
    { tone: 'k-ok', d: `물건 값의 ${(FEE_RATE * 100).toFixed(1)}%` }],
]);

/** 기간 고르개 — 고르면 지표 카드 «넷이 함께» 다시 셈해진다(app.js data-recalc) */
const 기간고르개 = () => `<select class="input" style="width:auto" data-recalc="term" aria-label="기간"
  ><option selected data-vals="${won(보관중)}|${won(이번주정산)}|${분쟁건.length}|${won(수수료수입)}">${ADM_TERMS[0]}</option
  ><option data-vals="0원|0원|1|${won(Math.round(수수료수입 * 2.4))}">${ADM_TERMS[1]}</option
  ><option data-vals="${won(보관중)}|${won(이번주정산)}|${분쟁건.length}|${won(Math.round(수수료수입 * 3.4))}">${ADM_TERMS[2]}</option></select>`;

function AD0401(ctx) {
  const body = `
${pageHd('안전결제 정산·분쟁', '남의 돈을 다루는 화면입니다. 숫자가 서로 맞는지 늘 확인하세요',
    `<div class="btns">${btn('신고 대기열로', { href: 'AD-01', cls: 'btn-ghost' })}${btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-pri' })}</div>`)}

${정산지표()}

<div>
  ${tabs([
    { label: '정산 대기', cnt: 정산대기.length, pane: 's0' },
    { label: '정산 완료', cnt: 정산완료.length, pane: 's1' },
    { label: '분쟁', cnt: 분쟁건.length, pane: 's2' },
  ], 0)}
  <div class="mt4">
    <div class="row-c wrap-row mb3" style="gap:8px">
      ${기간고르개()}
      <div class="searchbar sm" style="max-width:300px">
        <input type="search" placeholder="거래번호·닉네임으로 찾기" aria-label="거래 검색">
        ${btn('찾기', { href: 'AD0402', cls: 'btn-ghost btn-sm' })}
      </div>
      ${btn('정산 내보내기', { cls: 'btn-ghost btn-sm', attr: ' style="margin-left:auto" data-toast="정산 내역 파일(CSV)을 만들었어요"' })}
    </div>

    <div data-pane-body="s0">
      ${tableBar(`<b>${정산대기.length}건</b> <span class="t-sub">· 정산 예정일이 가까운 순</span>`, '')}
      ${정산표(정산대기)}
      <div class="mt3">${검산(정산대기)}</div>
    </div>
    <div data-pane-body="s1" hidden>
      ${tableBar(`<b>${정산완료.length}건</b> <span class="t-sub">· 판매자에게 이미 넘어간 돈</span>`, '')}
      ${정산표(정산완료)}
      <div class="mt3">${검산(정산완료)}</div>
    </div>
    <div data-pane-body="s2" hidden>
      ${tableBar(`<b>${분쟁건.length}건</b> <span class="t-sub">· 판단이 끝날 때까지 돈이 나가지 않습니다</span>`,
    btn('분쟁 양쪽 보기', { href: 'AD0405', cls: 'btn-pri btn-sm' }))}
      ${정산표(분쟁건)}
    </div>
  </div>
</div>

<div class="mt-block">${banner('warn', '⚖', `<b>분쟁 ${분쟁건.length}건이 판단을 기다립니다 — ${ADM_REFUND.no}</b>
  <div class="t-sub mt1">${esc(분쟁매물.t)} · 구매자 ${esc(DISPUTE.buyer.nick)} ↔ 판매자 ${esc(DISPUTE.seller.nick)}</div>`,
    { right: btn('양쪽 주장 보기', { href: 'AD0405', cls: 'btn-danger btn-sm' }) })}</div>

<div class="mt-block">${card('이 화면에서 할 수 있는 것', `<div class="g2">
  ${box(`<b class="t-card">정산 쪽</b>
    <ul class="dots mt2">
      <li>기간을 골라 지표 카드 넷을 다시 세기 — <a class="link" href="${link('AD0402')}">기간·검색</a></li>
      <li>합계가 맞는지 검산하기 — <a class="link" href="${link('AD0403')}">합계 검산</a></li>
      <li>정산을 잠시 멈추기 — <a class="link" href="${link('AD0404')}">정산 보류</a></li>
    </ul>`)}
  ${box(`<b class="t-card">분쟁 쪽</b>
    <ul class="dots mt2">
      <li>양쪽 주장과 사진을 나란히 보기 — <a class="link" href="${link('AD0405')}">분쟁 양쪽 보기</a></li>
      <li>환불·정산·일부 환불을 판단하기 — <a class="link" href="${link('AD0406')}">분쟁 판단</a></li>
      <li>거래가 어디까지 왔는지 보기 — <a class="link" href="${link('PA-05')}">거래 진행 상태</a></li>
    </ul>`)}
</div>`)}</div>

<div class="mt-block">${정산갈래('AD-04')}</div>
`;
  return { body, o: {} };
}

function AD0402(ctx) {
  const body = `
${pageHd('정산·분쟁 — 기간·검색', '기간을 고르면 위 지표 카드 넷이 함께 다시 셈해집니다')}

${정산지표()}

<div class="mt-block">${card('좁혀 보기', `
  <div class="g3">
    <div class="fld"><label class="lb" for="t1">기간</label>${기간고르개()}</div>
    <div class="fld"><label class="lb" for="t2">상태</label>
      <select class="input" id="t2"><option>모든 상태</option><option>정산 대기</option><option>정산 완료</option><option>분쟁</option></select></div>
    <div class="fld"><label class="lb" for="t3">금액</label>
      <select class="input" id="t3"><option>모든 금액</option><option>10만원 미만</option><option>10만~50만원</option><option>50만원 이상</option></select></div>
  </div>
  <div class="fld">
    <label class="lb" for="q">거래번호·닉네임으로 찾기</label>
    <div class="searchbar">
      <span class="ic">🔍</span>
      <input type="search" id="q" placeholder="예: T-90412 또는 하늘이네" value="T-904">
      ${btn('찾기', { cls: 'btn-pri', attr: ' data-toast="찾은 결과만 보여드릴게요"' })}
    </div>
  </div>
  <div class="row-b wrap-row">
    <span class="t-sub">지금 걸린 것: ${badge('이번 달', 'b-mut')} ${badge('「T-904」로 찾음', 'b-mut')}</span>
    <div class="btns">
      ${btn('초기화', { cls: 'btn-quiet', attr: ' data-toast="조건을 모두 풀었어요 · 지표 카드가 이번 달로 돌아갑니다"' })}
      ${btn('정산 내보내기', { cls: 'btn-ghost', attr: ' data-toast="찾은 결과만 파일(CSV)로 만들었어요"' })}
    </div>
  </div>`)}</div>

<div class="mt-block">${sec(`찾은 결과 ${SETTLES.filter((s) => s.no.startsWith('T-904')).length}건`,
    정산표(SETTLES.filter((s) => s.no.startsWith('T-904'))))}</div>

<div class="mt-block">${banner('quiet', '📅', `<b>기간을 바꾸면 표와 지표가 «같은 셈»에서 나옵니다</b>
  <div class="t-sub mt1">위 카드의 숫자는 표에서 세어 낸 것입니다. 따로 적어 두지 않아 갈라지지 않습니다.</div>`)}</div>

<div class="mt-block">${정산갈래('AD0402')}</div>
`;
  return { body, o: { state: '이번 달 · 「T-904」로 찾은 결과' } };
}

function AD0403(ctx) {
  const 전체 = SETTLES;
  const body = `
${pageHd('정산·분쟁 — 합계 검산', '결제액 합 − 수수료 합 = 수령액 합. 하나라도 어긋나면 돈이 새고 있다는 뜻입니다')}

${kpis([
    ['결제액 합', won(전체.reduce((a, s) => a + s.price, 0)), { d: `거래 ${전체.length}건` }],
    ['수수료 합', won(전체.reduce((a, s) => a + fee(s.price), 0)), { tone: 'k-ok', d: `물건 값의 ${(FEE_RATE * 100).toFixed(1)}%` }],
    ['수령액 합', won(전체.reduce((a, s) => a + payout(s.price), 0) - ADM_REFUND.amount), { tone: 'k-warn', d: '일부 환불이 빠진 뒤' }],
    ['어긋난 줄', '1', { unit: '건', tone: 'k-danger', d: ADM_REFUND.no, href: 'AD0406' }],
  ])}

<div class="mt-block">${sec('① 정산 대기 — 합계가 맞는 경우', `
  ${정산표(정산대기)}
  <div class="mt3">${검산(정산대기)}</div>`)}</div>

<div class="mt-block">${sec('② 전체 — 합계가 어긋나는 경우', `
  ${정산표(전체, { 환불: true })}
  <div class="mt3">${검산(전체, { 환불: true })}</div>
  <p class="t-sub mt3">어긋난 줄은 표에서도 왼쪽에 붉은 띠가 섭니다. 그 줄의 수령액은
  분쟁 판단에서 내린 <b>일부 환불 ${won(ADM_REFUND.amount)}</b>만큼 깎였습니다 —
  돈이 샌 것이 아니라 <b>환불로 나간 것</b>입니다.</p>`)}</div>

<div class="mt-block">${card('검산이 어긋나는 까닭은 보통 셋입니다', table(
    [{ t: '까닭', w: '200px' }, { t: '어떻게 보이나' }, { t: '무엇을 하나', w: '200px' }],
    [
      ['분쟁 일부 환불', '그 줄의 수령액만 깎여 있습니다', '판단 기록을 확인하면 맞습니다'],
      ['정산 보류', '수령액은 그대로인데 돈이 안 나갔습니다', '보류 사유를 확인합니다'],
      ['수수료율이 바뀐 건', `지금은 ${(FEE_RATE * 100).toFixed(1)}%인데 옛 건은 다른 값입니다`, '거래 시점의 수수료율로 다시 셉니다'],
    ],
  ))}</div>

<div class="mt-block">${card('검산 다시 돌리기', `
  <p class="t-sub mb3">기간을 바꾸거나 보류 건을 푼 뒤 다시 눌러 보세요.</p>
  <div class="btns">
    ${btn('검산 다시 돌리기', { cls: 'btn-pri', attr: ' data-toast="다시 셈했어요 · 어긋난 줄 1건은 분쟁 일부 환불로 확인됩니다"' })}
    ${btn('어긋난 줄로 가기', { href: 'AD0406', cls: 'btn-ghost' })}
  </div>`)}</div>

<div class="mt-block">${정산갈래('AD0403')}</div>
`;
  return { body, o: { state: '합계 검산 — 어긋난 줄 1건' } };
}

function AD0404(ctx) {
  const 그건 = 정산대기[0];
  const it = itemBy(그건.item);
  const 왼쪽 = `
${card('', `<div class="row-b wrap-row">
  <div>
    <div class="row-c wrap-row" style="gap:6px"><b class="t-card">${그건.no}</b>${stBadge(그건.st)}</div>
    <p class="t-sub mt1">${esc(it.t)} · 구매자 ${esc(그건.buyer)} ↔ 판매자 ${esc(그건.seller)} · 정산 예정일 ${그건.due}</p>
  </div>
  ${btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-ghost btn-sm' })}
</div>`)}

<div class="mt-block">${sec('돈이 어떻게 나뉘나', card('', kv([
    ['결제액', won(그건.price)],
    ['수수료', `− ${won(fee(그건.price))} (${(FEE_RATE * 100).toFixed(1)}%)`],
    ['판매자 수령 예정', `<b>${won(payout(그건.price))}</b>`],
    ['정산 예정일', 그건.due],
    ['보류하면', `<b class="danger">이 날짜에 돈이 나가지 않습니다</b>`],
  ])))}</div>

<div class="mt-block">${sec('판매자에게 갈 안내 — 이 문구가 그대로 갑니다', card('', `
  ${box(`<p><b>[우리동네장터] 정산이 잠시 보류되었습니다</b></p>
    <p class="mt3">거래 <b>${그건.no}</b>의 정산이 <b>구매자 분쟁 접수</b>로 잠시 멈췄습니다.
    양쪽 자료를 확인한 뒤 <b>3영업일 안에</b> 다시 알려드리겠습니다.
    확인이 끝나면 보류가 풀리고 정산이 이어집니다.</p>
    <p class="t-sub mt3">문의: 고객센터 ${SITE.tel}</p>`)}
  <p class="t-sub mt3">보류 사유를 고르면 이 문구의 굵은 부분이 바뀝니다.</p>`))}</div>

<div class="mt-block">${sec('보류를 푸는 절차', card('', timeline([
    ['보류 걸기 · 사유 기록', '지금'],
    ['판매자에게 안내 발송', '보류 직후'],
    ['자료 확인 (최대 3영업일)', '진행'],
    ['보류 해제 또는 분쟁 판단', ''],
    ['정산 재개 · 양쪽에 알림', ''],
  ], 2)))}</div>

<div class="mt-block">${card('지금 보류 중인 건', table(
    [{ t: '거래번호', w: '120px' }, { t: '물건' }, { t: '보류 사유', w: '180px' }, { t: '보류일', w: '100px' }, { t: '', w: '120px' }],
    [[`<b>${ADM_REFUND.no}</b>`, esc(분쟁매물.t), '구매자 분쟁 접수', '09-05',
      btn('분쟁 보기', { href: 'AD0405', cls: 'btn-ghost btn-xs' })]],
  ))}</div>

<div class="mt-block">${정산갈래('AD0404')}</div>
`;

  const 오른쪽 = `
${actPanel('정산 보류', `
  <div class="fld">
    <label class="lb" for="hr">왜 보류하나요</label>
    <select class="input" id="hr">${ADM_HOLD_REASONS.map((r) => `<option>${r}</option>`).join('')}</select>
  </div>
  <div class="fld">
    <label class="lb" for="hn">판매자에게 전할 말</label>
    <textarea class="input" id="hn" rows="3" placeholder="판매자에게 그대로 전달됩니다">양쪽 자료를 확인하는 동안 정산을 잠시 멈춥니다.</textarea>
  </div>
  <div class="fld">
    <label class="lb" for="hd2">언제까지</label>
    <select class="input" id="hd2"><option selected>3영업일</option><option>7영업일</option><option>판단이 끝날 때까지</option></select>
  </div>
  ${banner('warn', '⚠', '보류하면 정산 예정일이 지나도 돈이 나가지 않습니다.')}`,
    btn('보류 걸기', { cls: 'btn-pri btn-lg', attr: ' data-modal="hold3"' })
    + btn('그냥 정산하기', { cls: 'btn-ghost', attr: ' data-toast="예정일에 정산됩니다"' }),
    { state: 그건.st })}

${actPanel('보류 해제', `
  <p class="t-sub">확인이 끝나면 여기서 보류를 풉니다. 푸는 즉시 다음 정산일에 돈이 나가고 양쪽에 알림이 갑니다.</p>`,
    btn('보류 해제하기', { cls: 'btn-ghost', attr: ' data-toast="보류를 풀었어요 · 다음 정산일에 지급됩니다"' })
    + btn('정산·분쟁으로', { href: 'AD-04', cls: 'btn-quiet' }))}
`;

  const body = detailSplit(왼쪽, 오른쪽) + modal('hold3', '정산을 보류할까요?', `
  <p class="t-sub mb3">보류하면 아래가 일어납니다.</p>
  <ul class="dots">
    <li>${그건.due} 예정이던 <b>${won(payout(그건.price))}</b> 지급이 멈춥니다</li>
    <li>판매자 ${esc(그건.seller)}님에게 <b>사유가 그대로</b> 전달됩니다</li>
    <li>구매자에게는 「확인 중」이라고만 알립니다</li>
  </ul>
  ${banner('quiet', '↩', '보류는 언제든 풀 수 있습니다. 푼 뒤에는 다음 정산일에 지급됩니다.', { cls: 'mt3' })}`,
    btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + btn('보류 걸기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="정산을 보류했어요 · 판매자에게 알렸습니다"' }));

  return { body, o: { state: '정산 보류를 거는 중' } };
}

function AD0405(ctx) {
  const 왼쪽 = `
${card('', `<div class="row-b wrap-row">
  <div>
    <div class="row-c wrap-row" style="gap:6px"><b class="t-card">${DISPUTE.no}</b>${stBadge('분쟁')}${badge('정산 보류 중', 'b-warn')}</div>
    <p class="t-sub mt1">${esc(분쟁매물.t)} · 결제액 ${won(분쟁건[0].price)} · 09-05 접수</p>
  </div>
  ${btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-ghost btn-sm' })}
</div>`)}

<div class="mt-block">${sec('양쪽 주장', `<div class="split-2">
  <div class="side-a">
    <div class="row-c wrap-row mb2">${badge('구매자', 'b-pri')}<b>${esc(DISPUTE.buyer.nick)}</b>
      <span class="t-sub">${DISPUTE.buyer.at} 냄</span></div>
    <p>${esc(DISPUTE.buyer.say)}</p>
    <div class="row wrap-row mt3" style="gap:8px">
      ${[1, 2, 3].map((n) => phItem(96, 'db' + n)).join('')}
    </div>
    <p class="t-sub mt2">받은 뒤 찍은 사진 ${DISPUTE.buyer.photos}장</p>
  </div>
  <div class="side-b">
    <div class="row-c wrap-row mb2">${badge('판매자', 'b-acc')}<b>${esc(DISPUTE.seller.nick)}</b>
      <span class="t-sub">${DISPUTE.seller.at} 냄</span></div>
    <p>${esc(DISPUTE.seller.say)}</p>
    <div class="row wrap-row mt3" style="gap:8px">
      ${[1, 2].map((n) => phItem(96, 'ds' + n)).join('')}
    </div>
    <p class="t-sub mt2">보내기 전 포장 사진 ${DISPUTE.seller.photos}장</p>
  </div>
</div>`)}</div>

<div class="mt-block">${sec('사진 나란히 대조', card('', `
  <p class="t-sub mb3">같은 곳을 찍은 사진을 위아래로 붙여 봅니다. 왼쪽이 <b>보내기 전</b>, 오른쪽이 <b>받은 뒤</b>입니다.</p>
  <div class="split-2">
    <div class="side-a">
      <div class="row-c wrap-row mb2">${badge('보내기 전 (판매자)', 'b-acc')}</div>
      ${ph(['판매자 포장 사진 — 조이콘 부분', 1200, 900], { seed: 'cmp-a' })}
    </div>
    <div class="side-b">
      <div class="row-c wrap-row mb2">${badge('받은 뒤 (구매자)', 'b-pri')}</div>
      ${ph(['구매자 개봉 사진 — 조이콘 부분', 1200, 900], { seed: 'cmp-b' })}
    </div>
  </div>
  ${banner('warn', '🔍', `<b>판매자 포장 사진에도 오른쪽 조이콘 긁힘이 보입니다</b>
    <div class="t-sub mt1">보내기 전에 이미 있던 흠으로 보입니다. 다만 판매글에는 적혀 있지 않았습니다.
    게임 칩은 양쪽 사진에서 <b>두 개 모두</b> 확인됩니다.</div>`, { cls: 'mt4' })}`))}</div>

<div class="mt-block">${sec('언제 무엇이 들어왔나', card('', timeline([
    ['구매자 결제', '09-01 18:20'],
    ['판매자 발송', '09-02 10:05'],
    ['구매자 수령', '09-04 14:30'],
    [`구매자 분쟁 접수 · 사진 ${DISPUTE.buyer.photos}장`, DISPUTE.buyer.at],
    [`판매자 반박 · 사진 ${DISPUTE.seller.photos}장`, DISPUTE.seller.at],
    ['운영자 판단', ''],
  ], 5)))}</div>

<div class="mt-block">${card('추가 자료 요청', `
  <p class="t-sub mb3">한쪽 자료만으로는 판단하기 어려울 때, 양쪽에 자료를 더 요청할 수 있습니다.</p>
  <div class="btns">
    ${btn('구매자에게 요청', { cls: 'btn-ghost', attr: ' data-toast="구매자에게 추가 사진을 요청했어요"' })}
    ${btn('판매자에게 요청', { cls: 'btn-ghost', attr: ' data-toast="판매자에게 송장·포장 사진을 요청했어요"' })}
    ${btn('양쪽 모두에게', { cls: 'btn-ghost', attr: ' data-toast="양쪽에 추가 자료를 요청했어요 · 3일 안에 답이 없으면 지금 자료로 판단합니다"' })}
  </div>`)}</div>

<div class="mt-block">${정산갈래('AD0405')}</div>
`;

  const 오른쪽 = `
${actPanel('이 분쟁', `${kv([
    ['거래번호', DISPUTE.no],
    ['결제액', won(분쟁건[0].price)],
    ['수수료', won(fee(분쟁건[0].price))],
    ['판매자 수령 예정', won(payout(분쟁건[0].price))],
    ['지금 돈은', '<b>플랫폼이 보관 중</b>'],
  ])}`, '', { state: '분쟁' })}

${actPanel('판단하기', `
  <p class="t-sub">양쪽 자료를 다 보셨다면 판단으로 넘어갑니다. 판단은 <b>되돌릴 수 없습니다</b>.</p>`,
    btn('분쟁 판단하러 가기', { href: 'AD0406', cls: 'btn-pri btn-lg' })
    + btn('추가 자료 더 받기', { cls: 'btn-ghost', attr: ' data-toast="양쪽에 추가 자료를 요청했어요"' })
    + btn('정산·분쟁으로', { href: 'AD-04', cls: 'btn-quiet' }))}
`;
  return { body: detailSplit(왼쪽, 오른쪽), o: { state: '양쪽 주장을 나란히 보는 중' } };
}

function AD0406(ctx) {
  const 값 = 분쟁건[0].price;
  const 판단맵 = {
    '구매자에게 전액 환불': `${won(값)}을 구매자에게 돌려주고 판매자에게는 아무것도 가지 않습니다.`,
    '판매자에게 정산': `${won(payout(값))}이 판매자에게 갑니다. 구매자에게는 돌려주지 않습니다.`,
    '일부 환불': `아래에 적은 금액을 구매자에게 돌려주고 나머지를 판매자에게 정산합니다.`,
  };
  const 왼쪽 = `
${card('', `<div class="row-b wrap-row">
  <div>
    <div class="row-c wrap-row" style="gap:6px"><b class="t-card">${DISPUTE.no}</b>${stBadge('분쟁')}</div>
    <p class="t-sub mt1">${esc(분쟁매물.t)} · 결제액 ${won(값)} · 구매자 ${esc(DISPUTE.buyer.nick)} ↔ 판매자 ${esc(DISPUTE.seller.nick)}</p>
  </div>
  ${btn('양쪽 주장 다시 보기', { href: 'AD0405', cls: 'btn-ghost btn-sm' })}
</div>`)}

<div class="mt-block">${sec('무엇을 근거로 판단하나', card('', `
  ${table([{ t: '본 것', w: '200px' }, { t: '무엇이 확인됐나' }],
    [
      ['판매자 포장 사진', '보내기 전에 이미 오른쪽 조이콘에 긁힘이 있었습니다'],
      ['구매자 개봉 사진', '같은 자리의 긁힘이 그대로 보입니다 — 배송 중 생긴 흠이 아닙니다'],
      ['판매글 본문', `「${esc(분쟁매물.cond)}」이라고만 적혀 있고 <b>긁힘은 적지 않았습니다</b>`],
      ['게임 칩', '양쪽 사진에서 두 개 모두 확인됩니다 — 구매자 주장과 다릅니다'],
    ])}
  ${banner('quiet', '⚖', `<b>흠은 있었으나 적지 않았고, 칩은 다 보냈습니다</b>
    <div class="t-sub mt1">둘 다 조금씩 맞습니다. 이럴 때 쓰는 것이 「일부 환불」입니다.</div>`, { cls: 'mt3' })}`))}</div>

<div class="mt-block">${sec('양쪽에 갈 문구 — 이 문구가 그대로 갑니다', card('', `
  <div class="t-sub mb2">구매자(${esc(DISPUTE.buyer.nick)})에게</div>
  ${box(`<p>양쪽 자료를 확인했습니다. 판매자 포장 사진에서 조이콘 흠집이 이미 확인되어
    판매글에 적지 않은 점을 인정해 <b>${won(ADM_REFUND.amount)}을 환불</b>합니다.
    게임 칩은 두 개 모두 보낸 것으로 확인되었습니다.</p>`)}
  <div class="t-sub mb2 mt4">판매자(${esc(DISPUTE.seller.nick)})에게</div>
  ${box(`<p>흠집을 판매글에 적지 않으신 점이 확인되어 <b>${won(ADM_REFUND.amount)}을 구매자에게 환불</b>하고,
    나머지 <b>${won(payout(값) - ADM_REFUND.amount)}</b>을 정산합니다.
    다음부터는 흠이 있는 곳을 사진과 글로 함께 알려 주세요.</p>`)}
  <p class="t-sub mt3">판단을 바꾸면 이 두 문구도 함께 바뀝니다.</p>`))}</div>

<div class="mt-block">${sec('돈이 어떻게 나뉘나', card('', kv([
    ['결제액', won(값)],
    ['구매자에게 환불', `<b class="danger">${won(ADM_REFUND.amount)}</b>`],
    ['수수료', `− ${won(fee(값))}`],
    ['판매자에게 정산', `<b>${won(payout(값) - ADM_REFUND.amount)}</b>`],
    ['검산', `${won(값)} − ${won(ADM_REFUND.amount)} − ${won(fee(값))} = ${won(payout(값) - ADM_REFUND.amount)} ✓`],
  ])))}</div>

<div class="mt-block">${정산갈래('AD0406')}</div>
`;

  const 오른쪽 = `
${actPanel('어떻게 판단할까요', `
  <div class="fld">
    <label class="lb" for="dj">판단</label>
    <select class="input" id="dj" data-sel-show="dj" data-sel-text="dj">
      <option>구매자에게 전액 환불</option>
      <option>판매자에게 정산</option>
      <option selected>일부 환불</option>
    </select>
    <p class="t-sub mt2" data-sel-out="dj" data-sel-map='${JSON.stringify(판단맵)}'>${판단맵['일부 환불']}</p>
  </div>

  <div class="sub-fld" data-sel-case="dj" data-sel-when="일부 환불">
    <label class="lb" for="amt">환불할 금액</label>
    <div class="row-c" style="gap:8px">
      <input class="input" id="amt" type="text" inputmode="numeric" value="50,000" style="flex:1">
      <span class="nowrap">원</span>
    </div>
    <p class="t-sub mt2">구매자에게 ${won(ADM_REFUND.amount)} · 판매자에게 ${won(payout(값) - ADM_REFUND.amount)}</p>
  </div>

  <div class="fld mt4">
    <label class="lb" for="why3">판단 근거 <span class="req">*</span></label>
    <textarea class="input" id="why3" rows="4" placeholder="양쪽 사진과 대화를 보고 무엇을 근거로 판단했는지 (반드시 적어 주세요)">판매자 포장 사진에 조이콘 흠집이 이미 보임. 판매글에 흠집을 적지 않음. 게임 칩은 두 개 모두 확인됨. 흠집 미고지만 인정해 일부 환불.</textarea>
    <p class="t-sub mt2">근거는 기록에 남고, 이의 제기가 들어오면 이 글을 봅니다.</p>
  </div>

  <label class="check"><input type="checkbox" data-unlock="go-dj">확정하면 <b>되돌릴 수 없다</b>는 것을 압니다</label>`,
    btn('판단 확정', { cls: 'btn-pri btn-lg', off: true, id: 'go-dj', attr: ' data-modal="djfix"' })
    + btn('추가 자료 더 받기', { cls: 'btn-ghost', attr: ' data-toast="양쪽에 추가 자료를 요청했어요"' })
    + btn('양쪽 주장 다시 보기', { href: 'AD0405', cls: 'btn-quiet' }),
    { state: '분쟁' })}

${actPanel('확정하면', `
  ${kv([
    ['구매자에게', `<b>${won(ADM_REFUND.amount)}</b> 환불`],
    ['판매자에게', `<b>${won(payout(값) - ADM_REFUND.amount)}</b> 정산`],
    ['알림', '양쪽 모두에게'],
    ['되돌리기', '<b class="danger">할 수 없음</b>'],
  ])}`, '')}
`;

  const body = detailSplit(왼쪽, 오른쪽) + modal('djfix', '이대로 확정할까요?', `
  <p class="t-sub mb3">확정하면 <b>돈이 바로 움직입니다</b>.</p>
  <ul class="dots">
    <li>구매자 ${esc(DISPUTE.buyer.nick)}님에게 <b>${won(ADM_REFUND.amount)}</b>이 환불됩니다 (2~3영업일)</li>
    <li>판매자 ${esc(DISPUTE.seller.nick)}님에게 <b>${won(payout(값) - ADM_REFUND.amount)}</b>이 정산됩니다</li>
    <li>양쪽에 위 안내 문구와 <b>판단 근거</b>가 그대로 전달됩니다</li>
    <li>이 거래의 정산 보류가 풀립니다</li>
  </ul>
  ${banner('dan', '⛔', '<b>확정한 뒤에는 되돌릴 수 없습니다.</b> 이의 제기는 고객센터를 통해서만 받습니다.', { cls: 'mt3' })}`,
    btn('다시 볼게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + btn('판단 확정', { href: 'AD-04', cls: 'btn-pri' }));

  return { body, o: { state: '분쟁 판단 — 확정 전입니다' } };
}

/* ═══════════════ AD05 운영자 로그인 ═══════════════ */

const 로그인안내 = () => banner('info', '👤', `<b>회원 로그인과 다른 곳이에요</b>
  <div class="t-sub mt1">이웃과 물건을 사고파시려면 <a class="link" href="${link('HO-01')}">앞 화면</a>에서 로그인해 주세요.
  이 화면은 신고·정산을 다루는 운영자 전용입니다.</div>`);

const 접속기록 = () => `<div class="mt-block">${card('최근 접속 기록', table(
  [{ t: '언제', w: '170px' }, { t: '어디서' }, { t: '결과', w: '90px' }],
  ADM_LOGIN_LOG.map(([at, where, r]) => [at, where, badge(r, r === '성공' ? 'b-ok' : 'b-danger')]),
), { ft: '<span class="t-sub">모든 접속은 기록됩니다. 낯선 기록이 보이면 바로 비밀번호를 바꿔 주세요.</span>' })}</div>`;

function AD0501(ctx) {
  const body = soloBox('운영자 로그인', '신고·정산을 다루는 화면입니다', `
  ${로그인안내()}

  <div class="fld mt4"><label class="lb" for="em">이메일</label>
    <input class="input" id="em" type="email" placeholder="운영자 계정 이메일" value="admin@example.com" autocomplete="username"></div>
  <div class="fld"><label class="lb" for="pw">비밀번호</label>
    <input class="input" id="pw" type="password" placeholder="비밀번호" autocomplete="current-password"></div>
  <label class="check"><input type="checkbox">이 기기를 기억하기 <span class="t-sub">— 공용 PC 에서는 켜지 마세요</span></label>

  <div class="mt4">${btn('로그인', { href: 'AD-01', cls: 'btn-pri btn-block btn-lg' })}</div>
  <p class="t-sub center mt3">로그인하면 <b>2단계 인증</b> 화면으로 넘어갑니다.</p>

  <div class="center mt4">
    <a class="link quiet" href="${link('AD0505')}">비밀번호를 잊으셨나요?</a>
  </div>

  <div class="mt-block">${card('로그인이 지나가면 이 화면이 나옵니다', `
    <div class="t-sub mb3">① 2단계 인증 — 등록한 휴대폰으로 보낸 6자리 숫자</div>
    <div class="otp">${[1, 2, 3, 4, 5, 6].map((i) => `<span${i <= 2 ? ' class="on"' : ''}>${i <= 2 ? [4, 8][i - 1] : ''}</span>`).join('')}</div>
    <div class="row-b mt3">
      <span class="t-sub">남은 시간 <b>2:47</b> · 여섯 칸을 채우면 바로 확인합니다</span>
      ${btn('2단계 인증 화면 보기', { href: 'AD0503', cls: 'btn-ghost btn-sm' })}
    </div>`)}</div>

  <div class="mt-block">${banner('warn', '🔒', `<b>비밀번호를 ${ADM_LOGIN_TRY.최대}회 틀리면 ${ADM_LOGIN_TRY.잠금} 동안 잠깁니다</b>
    <div class="t-sub mt1">틀릴 때마다 남은 시도 횟수를 알려드립니다. 어느 쪽이 틀렸는지는 알려드리지 않습니다.</div>`,
      { right: btn('실패 화면 보기', { href: 'AD0502', cls: 'btn-ghost btn-sm' }) })}</div>

  <div class="mt-block">${card('로그인 뒤 바로 가는 곳', `<div class="btns">
    ${btn('신고 대기열로', { href: 'AD-01', cls: 'btn-ghost' })}
    ${btn('정산·분쟁으로', { href: 'AD-04', cls: 'btn-ghost' })}
  </div>`)}</div>

  ${접속기록()}

  <div class="mt-block">${box(`<b class="t-card">임시 비밀번호로 들어오셨다면</b>
    <p class="t-sub mt2">바로 새 비밀번호를 정하는 화면으로 넘어갑니다. 건너뛸 수 없어요.</p>
    <div class="mt3">${btn('그 화면 보기', { href: 'AD0504', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

  ${로그인갈래('AD-05')}
  `, { lg: true });
  return { body, o: { solo: true } };
}

function AD0502(ctx) {
  const t = ADM_LOGIN_TRY;
  const body = soloBox('운영자 로그인', '', `
  ${로그인안내()}

  <div class="fld mt4"><label class="lb" for="em2">이메일</label>
    <input class="input" id="em2" type="email" value="admin@example.com" autocomplete="username"></div>
  <div class="fld"><label class="lb" for="pw2">비밀번호</label>
    <input class="input err" id="pw2" type="password" value="wrongpassword" autocomplete="current-password" aria-describedby="pwerr"></div>

  ${banner('dan', '⚠', `<b>이메일 또는 비밀번호가 맞지 않아요</b>
    <div class="t-sub mt1" id="pwerr">남은 시도 <b>${t.남은}회</b> · ${t.최대}회 실패하면 <b>${t.잠금} 동안</b> 잠깁니다.
    어느 쪽이 틀렸는지는 알려드리지 않습니다 — 계정이 있는지 없는지를 감추기 위해서예요.</div>`, { cls: 'mt3' })}

  <div class="mt4">${btn('다시 로그인', { href: 'AD-01', cls: 'btn-pri btn-block btn-lg' })}</div>
  <div class="center mt4"><a class="link quiet" href="${link('AD0505')}">비밀번호를 잊으셨나요?</a></div>

  <div class="mt-block">${card('5회 실패하면 이렇게 됩니다', `
    <div class="stack-sm">
      <div class="cond-row"><span class="grow">1~${t.남은 + 1}회 실패</span>${badge('남은 횟수 안내', 'b-mut')}</div>
      <div class="cond-row"><span class="grow">${t.최대}회 실패</span>${badge(`${t.잠금} 잠금`, 'b-danger')}</div>
      <div class="cond-row"><span class="grow">잠긴 동안</span><span class="t-sub">남은 시간이 화면에 보입니다 · 비밀번호 찾기는 그대로 됩니다</span></div>
    </div>
    ${banner('warn', '🔒', `<b>지금 잠겨 있다면</b>
      <div class="t-sub mt1">남은 시간 <b>28:14</b> — 그 뒤에 다시 시도할 수 있습니다.
      기다리지 않으려면 비밀번호 재설정 링크를 받아 주세요.</div>`,
    { right: btn('비밀번호 찾기', { href: 'AD0505', cls: 'btn-ghost btn-sm' }), cls: 'mt3' })}`)}</div>

  ${접속기록()}

  ${로그인갈래('AD0502')}
  `, { lg: true });
  return { body, o: { solo: true, state: `로그인 실패 — 남은 시도 ${t.남은}회` } };
}

function AD0503(ctx) {
  const body = soloBox('2단계 인증', '', `
  <p class="t-sub center">등록한 휴대폰(010-****-1234)으로 보낸 <b>6자리 숫자</b>를 적어 주세요.</p>

  <div class="otp mt6">
    ${[1, 2, 3, 4, 5, 6].map((i) => `<input class="otp-cell" type="text" inputmode="numeric" maxlength="1" aria-label="인증번호 ${i}번째 자리"${i <= 4 ? ' value="' + [4, 8, 1, 2][i - 1] + '"' : ''}>`).join('')}
  </div>
  <p class="t-sub center mt3">여섯 칸을 다 채우면 <b>누르지 않아도</b> 바로 확인합니다.</p>

  <div class="row-b mt4">
    <span class="t-sub">남은 시간 <b>2:47</b></span>
    <button class="link" type="button" data-toast="인증번호를 다시 보냈어요 · 3분 안에 넣어 주세요">코드 다시 받기</button>
  </div>

  <div class="mt4">${btn('확인', { href: 'AD-01', cls: 'btn-pri btn-block btn-lg' })}</div>

  <div class="mt-block">${card('코드가 틀렸을 때는 이렇게 보입니다', `
    <div class="otp err">${[1, 2, 3, 4, 5, 6].map((i) => `<span>${[9, 9, 9, 9, 9, 9][i - 1]}</span>`).join('')}</div>
    ${banner('dan', '⚠', `<b>인증번호가 맞지 않아요</b>
      <div class="t-sub mt1">칸이 붉게 바뀌고 적은 숫자가 지워집니다. 남은 시도 <b>2회</b>.</div>`, { cls: 'mt3' })}`)}</div>

  <div class="mt-block">${box(`<b class="t-card">코드가 안 와요</b>
    <p class="t-sub mt2">3분이 지나도 오지 않으면 「코드 다시 받기」를 눌러 주세요.
    휴대폰을 바꾸셨다면 운영 책임자에게 2단계 인증 초기화를 요청해야 합니다.</p>`)}</div>

  ${로그인갈래('AD0503')}
  `, { lg: true, steps: `<div class="stepbar mb4">
    <span class="s done"><span class="n">✓</span>이메일·비밀번호</span><span class="sep">›</span>
    <span class="s on"><span class="n">2</span>2단계 인증</span><span class="sep">›</span>
    <span class="s"><span class="n">3</span>운영자 화면</span></div>` });
  return { body, o: { solo: true, state: '2단계 인증 — 6자리를 기다리는 중' } };
}

function AD0504(ctx) {
  const body = soloBox('새 비밀번호를 정해 주세요', '', `
  ${banner('warn', '🔑', `<b>임시 비밀번호로 들어오셨습니다</b>
    <div class="t-sub mt1">운영자 계정은 임시 비밀번호로 일을 볼 수 없습니다. <b>건너뛸 수 없어요.</b></div>`)}

  <div class="fld mt4"><label class="lb" for="np">새 비밀번호</label>
    <input class="input" id="np" type="password" placeholder="새 비밀번호" autocomplete="new-password"></div>
  <div class="fld"><label class="lb" for="np2">한 번 더</label>
    <input class="input err" id="np2" type="password" placeholder="같은 비밀번호를 한 번 더" autocomplete="new-password">
    <p class="t-sub mt2 danger">두 번 적은 비밀번호가 서로 다릅니다.</p></div>

  <div class="mt4">${card('비밀번호 규칙', `<div class="stack-sm">
    ${ADM_PW_RULES.map(([t, ok]) => `<div class="cond-row">
      <span class="grow">${ok ? '✅' : '⬜'} ${t}</span>${ok ? badge('맞음', 'b-ok') : badge('아직', 'b-mut')}</div>`).join('')}
  </div>
  <p class="t-sub mt3">다섯 가지를 모두 맞춰야 아래 단추가 열립니다.</p>`)}</div>

  <label class="check mt4"><input type="checkbox" data-unlock="pw-go">규칙을 모두 맞췄습니다</label>
  ${/* ⛔ 잠긴 단추는 <a> 로 만들 수 없다(<a> 에는 disabled 가 없다). 그래서 <button> 으로 두고
       열린 뒤 «갈 길»은 모달 안의 <a> 가 맡는다 — app.js 에는 data-go 를 눌러 옮겨 주는
       일반 장치가 «없다». 그대로 두면 열어 놓고 아무 데도 못 가는 단추가 된다. */''}
  <div class="mt3">${btn('비밀번호 바꾸고 들어가기', { cls: 'btn-pri btn-block btn-lg', off: true, id: 'pw-go', attr: ' data-modal="pwdone"' })}</div>
  <p class="t-sub center mt3">바꾸지 않으면 운영자 화면으로 들어갈 수 없습니다.</p>

  ${modal('pwdone', '비밀번호를 바꿨습니다', `
    <p>이제 운영자 화면으로 들어갈 수 있습니다.</p>
    <p class="t-sub mt3">다음 로그인부터는 새 비밀번호를 쓰세요. 90일 뒤에 다시 바꾸라는 안내가 갑니다.</p>`,
      btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })
      + btn('신고 대기열로', { href: 'AD-01', cls: 'btn-pri' }))}

  ${접속기록()}

  ${로그인갈래('AD0504')}
  `, { lg: true, steps: `<div class="stepbar mb4">
    <span class="s done"><span class="n">✓</span>임시 비밀번호로 로그인</span><span class="sep">›</span>
    <span class="s on"><span class="n">2</span>비밀번호 변경</span><span class="sep">›</span>
    <span class="s"><span class="n">3</span>운영자 화면</span></div>` });
  return { body, o: { solo: true, state: '최초 로그인 — 비밀번호를 바꿔야 들어갈 수 있습니다' } };
}

function AD0505(ctx) {
  const body = soloBox('비밀번호 찾기', '', `
  <p class="t-sub center">가입한 이메일을 적어 주시면 <b>재설정 링크</b>를 보내드립니다.</p>

  <div class="fld mt6"><label class="lb" for="fe">가입 이메일</label>
    <input class="input" id="fe" type="email" placeholder="운영자 계정 이메일" autocomplete="username"></div>

  <div class="mt4">${btn('재설정 링크 보내기', { cls: 'btn-pri btn-block btn-lg', attr: ' data-toast="메일을 보냈습니다 (계정이 있는 경우)"' })}</div>

  ${banner('info', '🔒', `<b>계정이 있는지 없는지는 알려드리지 않습니다</b>
    <div class="t-sub mt1">없는 이메일을 적어도 <b>똑같은 안내</b>가 보입니다.
    누가 운영자인지 밖에서 알아낼 수 없게 하려는 것입니다.</div>`, { cls: 'mt4' })}

  <div class="mt-block">${card('보내고 나면 이렇게 보입니다', `
    ${banner('ok', '✉', `<b>메일을 보냈습니다</b>
      <div class="t-sub mt1">받은 편지함을 확인해 주세요. 링크는 <b>30분</b> 동안만 쓸 수 있습니다.
      메일이 안 보이면 스팸함도 봐 주세요.</div>`)}
    <div class="row-b wrap-row mt3">
      <span class="t-sub">다시 보내기까지 <b>1:42</b></span>
      ${btn('다시 보내기', { cls: 'btn-ghost btn-sm', off: true, attr: ' data-toast="아직 기다려 주세요"' })}
    </div>`)}</div>

  <div class="center mt-block"><a class="link quiet" href="${link('AD-05')}">‹ 로그인으로 돌아가기</a></div>

  ${로그인갈래('AD0505')}
  `, { lg: true });
  return { body, o: { solo: true } };
}

/* ─────────────── 내보내기 ─────────────── */
export const PAGES = {
  AD0101, AD0102, AD0103, AD0104, AD0105, AD0106, AD0107,
  AD0201, AD0202, AD0203, AD0204, AD0205,
  AD0301, AD0302, AD0303, AD0304, AD0305,
  AD0401, AD0402, AD0403, AD0404, AD0405, AD0406,
  AD0501, AD0502, AD0503, AD0504, AD0505,
};
