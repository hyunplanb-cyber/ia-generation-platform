/* OW 현장 관리(업체) (6) — 업체가 여러 현장을 한 화면에서 굴리는 곳 */
import * as U from './ui.mjs';
import { SITES, OW_STATS, LEADS, MATERIALS, INVOICES, SCHEDULE, PROCESS, 공사일수, 오늘공사일 } from './data.mjs';

export const PAGES = {};

PAGES['OW-01'] = () => {
  /* 「진행 중 현장」·「밀린 공정」은 지금 이 순간의 현장 목록(SITES)에서 그대로 세는
     값이라 기간을 바꿔도 안 바뀐다 — 기간에 따라 정말 달라지는 건 매출·미수금 둘뿐이다. */
  const PERIODS = [
    { label: '이번 달', 매출라벨: '이달 매출', 매출: OW_STATS.이달매출, 미수금: OW_STATS.미수금 },
    { label: '지난 달', 매출라벨: '지난달 매출', 매출: 167_200_000, 미수금: 41_500_000 },
    { label: '올해', 매출라벨: '올해 누적 매출', 매출: 1_524_000_000, 미수금: 52_800_000 },
  ];
  const periodSelect = `<select class="sel" data-period-pick>${PERIODS.map((p, i) => `<option value="${i}"${i === 0 ? ' selected' : ''} data-매출="${p.매출}" data-미수금="${p.미수금}" data-매출라벨="${p.매출라벨}">${p.label}</option>`).join('')}</select>`;
  return {
  o: { bare: true },
  body: U.ownerShell('OW-01', `
${U.pageHd('현장 대시보드', '', periodSelect)}

<div class="g4">
  <div class="box"><div class="t-page pri">${OW_STATS.진행현장}<span style="font-size:14px">곳</span></div><div class="t-sub mt2">진행 중 현장</div></div>
  <div class="box"><div class="t-page pri"><span data-stat-num="매출">${U.num(Math.round(OW_STATS.이달매출 / 10000))}</span><span style="font-size:14px">만원</span></div><div class="t-sub mt2" data-stat-label="매출">이달 매출</div></div>
  <div class="box"><div class="t-page dan"><span data-stat-num="미수금">${U.num(Math.round(OW_STATS.미수금 / 10000))}</span><span style="font-size:14px">만원</span></div><div class="t-sub mt2">미수금</div></div>
  <div class="box"><div class="t-page dan">${OW_STATS.밀린공정}<span style="font-size:14px">건</span></div><div class="t-sub mt2">밀린 공정</div></div>
</div>

${U.sec('오늘 할 일', U.table(['할 일', ''], [
    ['기성 청구 2건', { t: U.btn('처리하러 가기', { sm: true, href: 'OW-05' }), cls: 'r' }],
    ['자재 발주 1건', { t: U.btn('처리하러 가기', { sm: true, href: 'OW-04' }), cls: 'r' }],
    ['준공 검수 방문 1건', { t: U.btn('처리하러 가기', { sm: true, href: 'OW-03' }), cls: 'r' }],
  ]), { cls: 'mt8' })}

${U.sec('진행 중 현장', `<div class="stack">${SITES.map((s) => `<div class="rowcard${s.late ? ' bad' : ''}" data-href="${U.link('OW-03')}">
  <div class="grow">
    <div class="row-b"><span class="t-card">${s.addr}</span>${s.late ? U.badge('밀림', 'b-dan') : U.badge('정상', 'b-ok')}</div>
    <div class="t-sub mt1">${s.pyeong}평 · 지금 ${s.process} · 다음 일정 ${s.next}</div>
    ${U.progress(s.progress)}
  </div>
  <div class="side"><span class="t-card">${s.progress}%</span></div>
</div>`).join('')}</div>`, { cls: 'mt8' })}

${U.sec('이번 주 일정', `<div class="row" style="gap:var(--sp-item);overflow-x:auto">
  ${['월', '화', '수', '목', '금'].map((d, i) => `<div class="box" style="flex:none;width:150px">
    <div class="t-sub strong">${d}</div>
    <div class="t-sub mt2">${SITES[i % SITES.length].addr.split(' ')[0]} · ${SITES[i % SITES.length].process}팀</div></div>`).join('')}
</div>`, { cls: 'mt8' })}

${U.banner('info', 'ℹ', `어제 들어온 견적 요청 ${LEADS.filter((l) => l.st === '새요청').length}건`, { right: U.btn('보러 가기', { sm: true, cls: 'btn-pri', href: 'OW-02' }), cls: 'mt8' })}

${U.sec('월별 매출', `<div class="row" style="align-items:flex-end;gap:var(--sp-item);height:140px">
  ${[62, 74, 58, 90, 71, 100].map((h, i) => `<div style="flex:1;text-align:center">
    <div style="height:${h}px;background:${i === 5 ? 'var(--primary)' : 'var(--pri-10)'};border-radius:4px 4px 0 0"></div>
    <div class="t-sub mt1">${i + 4}월</div></div>`).join('')}
</div><p class="t-sub mt2">오른쪽 끝 값이 위 「이달 매출」 카드와 같습니다.</p>`, { cls: 'mt8' })}
`),
  };
};

PAGES['OW-02'] = () => {
  const counts = { 새요청: LEADS.filter((l) => l.st === '새요청').length, 확인중: LEADS.filter((l) => l.st === '확인중').length, 실측잡힘: LEADS.filter((l) => l.st === '실측잡힘').length, 계약됨: LEADS.filter((l) => l.st === '계약됨').length, 놓침: LEADS.filter((l) => l.st === '놓침').length };
  return {
    o: { bare: true },
    body: U.ownerShell('OW-02', `
${U.pageHd('견적 요청함', `이번 달 요청 ${LEADS.length}건 · 실측 3건 · 계약 1건 (약 17%)`)}

${U.tabBox(
      Object.entries(counts).map(([k, v]) => ({ label: k, cnt: v, pane: k })),
      /* ⚠ 스펙이 「줄을 펼치면 나오는 손님이 넣은 조건 전부」를 약속해 두었는데
         펼칠 것이 아예 없었다(2026-08-18 사장님 지적 — 「견적 상세 같은 게 나와야
         할 것 같은데」). 따로 화면을 늘리지 않고 줄 아래로 펼친다 — 스펙 그대로다. */
      Object.keys(counts).map((k, i) => U.pane(k, `<div class="table-wrap table-scroll"><table class="table">
        <thead><tr><th>들어온 시각</th><th>평수·분야</th><th>금액</th><th>희망 착공</th><th>상태</th><th></th><th></th></tr></thead>
        <tbody>${LEADS.filter((l) => l.st === k).map((l) => `
          <tr>
            <td${l.urgent ? ' class="strong dan"' : ''}>${l.at}</td>
            <td>${l.pyeong}평 · ${l.field}</td>
            <td><span class="num">${U.won(l.amt)}</span></td>
            <td>${l.start}</td>
            <td>${U.stBadge(l.st)}</td>
            <td class="r">${U.btn('배정', { sm: true, attr: ' data-toast="담당자를 배정했어요" data-toast-kind="ok"' })}</td>
            <td class="r"><button class="btn btn-ghost btn-sm" type="button" data-lead-open="${l.id}">조건 보기 ▾</button></td>
          </tr>
          <tr class="lead-detail" data-lead-body="${l.id}" hidden>
            <td colspan="7">
              ${U.kv([
                ['요청 번호', l.id],
                ['공사 범위', l.field === '전체 시공' ? '전체 시공' : `부분 시공 — ${l.field}`],
                ['평수', `${l.pyeong}평 (${(l.pyeong * 3.3058).toFixed(1)}㎡)`],
                ['희망 착공', l.start],
                ['자동 계산 금액', `<span class="num">${U.won(l.amt)}</span>`],
                ['연락처', '010-****-1234 <span class="t-sub">(배정하면 열립니다)</span>'],
                ['손님이 남긴 말', l.field === '욕실' ? '누수가 있어서 방수부터 다시 하고 싶어요.' : '지금 살면서 공사할 수 있는지 궁금합니다.'],
              ])}
              <div class="btns mt4">${U.btn('실측 예약으로 넘기기', { sm: true, cls: 'btn-pri', href: 'VS-01' })}${U.btn('현장으로 만들기', { sm: true, href: 'OW-03' })}</div>
            </td>
          </tr>`).join('')}</tbody></table></div>`, i === 0)).join(''),
      0,
      { cls: 'mt6' },
    )}

${U.banner('warn', '⏳', '4시간 넘게 연락이 안 된 요청이 있어요 — 응답이 늦어지고 있어요.', { cls: 'mt6' })}
`),
  };
};

PAGES['OW-03'] = () => {
  const s = SITES[0];
  return {
    o: { bare: true },
    body: U.ownerShell('OW-03', `
${U.pageHd(s.addr, `${s.pyeong}평 · 계약금액 ${U.won(s.amount)} · 진행률 ${s.progress}%`, U.btn('손님 화면으로 보기', { sm: true, href: 'PR-01' }))}

${U.tabBox(
      [{ label: '공정', pane: 'proc' }, { label: '자재', pane: 'mat' }, { label: '사진', pane: 'photo' }, { label: '정산', pane: 'money' }],
      `${U.pane('proc', `
        ${U.banner('warn', '⚠', '준공 예정일이 밀릴 수 있어요 — 9/30 → 10/2', { cls: 'mb4' })}
        ${U.gantt(PROCESS, { totalDays: 공사일수, todayDay: 오늘공사일, editable: true })}
        <p class="t-sub mt3">막대를 끌면 시작·끝 날짜가 바뀌고, 앞 공정을 밀면 뒤 공정이 따라 밀립니다.</p>
        ${(() => { const TEAMS = ['철거팀', '설비1팀', '전기팀', '목공1팀', '목공2팀', '타일팀', '도배팀', '마루팀', '청소팀'];
          return U.table(['공정', '팀 배정', '진행률', ''], PROCESS.map((p) => [p.nm, U.select(TEAMS, Math.max(0, TEAMS.indexOf(p.team)), { attr: ' data-team' }), `${p.st === 'done' ? 100 : p.st === 'on' ? 45 : 0}%`, { t: '<span class="dev-btn" style="background:none;color:var(--muted);cursor:pointer">👁</span>', cls: 'c' }]), { scroll: true, cls: 'mt6' }); })()}
        ${/* ⚠ 팀을 바꿔도 아무 말이 없었다(2026-08-18) — 겹침 경고를 «고정 문구»로만 적어 두었다.
              acts: 「팀 배정 드롭다운 → 배정된 팀이 바뀌고 일정 충돌이 있으면 경고가 뜬다」 */''}
        <p class="t-sub mt2" data-team-out data-busy="타일팀,목공1팀" data-when="9/24" data-where="용산구 한강로 카페 상가">팀을 바꾸면 일정이 겹치는지 여기서 알려 드려요. (타일팀·목공1팀은 9/24 용산구 한강로 카페 상가 현장에도 잡혀 있습니다)</p>
        ${U.sec('변경 이력', U.timeline([{ t: '목공 종료일 9/9 → 9/10 변경', d: '김소장 · 9/20' }, { t: '타일팀 배정', d: '박대리 · 9/18' }]), { cls: 'mt6' })}
      `, true)}
       ${U.pane('mat', `<p class="t-sub">자재 상세는 <a class="more" href="${U.link('OW-04')}">자재·원가 화면</a>에서 봅니다.</p>`)}
       ${U.pane('photo', `<div class="g4">${Array.from({ length: 4 }).map((_, i) => `<div class="ph t${i + 1}" style="aspect-ratio:4/3">${U.ph(['현장 사진', 800, 600], { seed: 'ow-photo' + i, cls: 'ph-card' })}</div>`).join('')}</div>`)}
       ${U.pane('money', `<p class="t-sub">정산 상세는 <a class="more" href="${U.link('OW-05')}">청구·수금 화면</a>에서 봅니다.</p>`)}`,
      0,
    )}
`),
  };
};

PAGES['OW-04'] = () => {
  const est = MATERIALS.reduce((n, m) => n + m.qty * m.est, 0);
  const real = MATERIALS.reduce((n, m) => n + (m.real || m.est) * m.qty, 0);
  return {
    o: { bare: true },
    body: U.ownerShell('OW-04', `
${/* ⚠ 「자재 추가」·「발주서 내보내기」가 알림만 띄우고 끝났다 — 무엇을 넣는지,
      누구에게 발주하는지 고르는 자리가 없었다(2026-08-18 사장님 지적).
      스펙도 「자재 추가와 «거래처»」라고 적어 두었다. 화면을 늘리지 않고 창으로 연다. */''}
${U.pageHd('자재·원가', '', `${U.btn('자재 추가', { sm: true, attr: ' data-modal="m-add-material"' })}${U.btn('발주서 내보내기', { sm: true, cls: 'btn-pri', attr: ' data-modal="m-po"' })}`)}

<div class="g4">
  <div class="box"><div class="t-card">${U.num(Math.round(est / 10000))}만원</div><div class="t-sub mt2">자재 원가</div></div>
  <div class="box"><div class="t-card">3,596만원</div><div class="t-sub mt2">계약금액</div></div>
  ${/* ⚠ 이 표에는 «자재비»만 있고 인건비는 없다. 계약금액에서 자재비만 빼 놓고
        「마진 88%」이라 적으면 거짓말이 된다(2026-08-18, 프리미엄 OW0401 도 같은 자리).
        있는 그대로 적는다. */''}
  <div class="box"><div class="t-card">${U.num(Math.round((35_960_000 - real) / 10000))}만원</div><div class="t-sub mt2">자재 빼고 남은 돈</div></div>
  <div class="box"><div class="t-card pri">${Math.round(real / 35_960_000 * 100)}%</div><div class="t-sub mt2">계약금액 대비 자재비</div></div>
</div>

${/* ⚠ 「발주 안 한 것」 숫자는 손으로 박아 둔 4였고, 발주상태는 «누를 수 없는 배지»뿐이라
      상태를 바꿀 자리가 아예 없었다. 공정 칩도 눌리기만 하고 목록은 그대로였다(2026-08-18).
      acts: 「발주 상태 바꾸기 → 배지가 바뀌고 위 숫자가 줄어든다」·「공정 필터 → 그 공정 것만 남는다」 */''}
${U.banner('warn', '⚠', `발주 안 한 자재 <b data-po-left>${MATERIALS.filter((m) => m.st === '발주전').length}</b>건 · 그중 2건은 3일 안에 써야 합니다`, { cls: 'mt6' })}

${U.sec('', `${U.chips(['전체', '철거', '설비', '전기', '목공', '타일', '도배', '마루'], 0, { extra: ' data-proc-chip' })}`, { cls: 'mt6' })}

${U.sec('', U.table(['공정', '품명', '규격', '수량', '견적단가', '실제단가', '차액', '발주상태', '납품예정'],
      MATERIALS.map((m) => ({ cls: 'mat-row', cells: [m.proc, m.nm, m.spec, `${m.qty}${m.unit}`, `<span class="num">${U.won(m.est)}</span>`,
        `<span class="num">${m.real ? U.won(m.real) : '-'}</span>`,
        m.real ? { t: `<span class="num ${m.real > m.est ? 'dan' : 'pri'}">${m.real > m.est ? '+' : ''}${U.num((m.real - m.est) * m.qty)}원</span>`, cls: 'r' } : '-',
        { t: `<span data-po-badge>${U.stBadge(m.st)}</span>${U.select(['발주전', '발주함', '입고됨'], ['발주전', '발주함', '입고됨'].indexOf(m.st), { attr: ' data-po-st data-po-cls="b-mut,b-warn,b-ok"' })}` },
        m.st === '발주전' && m.due === '9/23' ? { t: m.due, cls: 'dan strong' } : m.due] })),
      { scroll: true, cls: 'tbl-mat', foot: ['합계', '', '', '', `<span class="num">${U.won(est)}</span>`, `<span class="num">${U.won(real)}</span>`, '', '', ''] }), { cls: 'mt6' })}

${U.modal('m-add-material', '자재 추가', `
  <div class="field"><span class="lb">공정</span>${U.select(['철거·폐기물', '설비·배관', '전기·조명', '목공', '타일', '도배', '마루'], 3)}</div>
  <div class="field"><span class="lb">품명</span>${U.input({ ph: '예: MDF 9T (아트월)' })}</div>
  <div class="row" style="gap:var(--sp-btn)">
    <div class="field grow"><span class="lb">규격</span>${U.input({ ph: '1220×2440' })}</div>
    <div class="field grow"><span class="lb">수량</span>${U.input({ ph: '8', type: 'number' })}</div>
  </div>
  <div class="field"><span class="lb">거래처</span>${U.select(['한샘 자재', '동화기업', 'LX하우시스', '지역 자재상 (성수)'])}</div>
  <div class="field"><span class="lb">견적 단가</span>${U.input({ ph: '45000', type: 'number' })}</div>
  <div class="field"><span class="lb">납품 예정일</span>${U.input({ type: 'date' })}</div>
`, `${U.btn('취소', { attr: ' data-dismiss' })}${U.btn('넣기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="자재를 한 줄 넣었어요" data-toast-kind="ok"' })}`)}

${U.modal('m-po', '발주서 내보내기', `
  <p class="t-sub mb4">발주 안 한 자재만 골라 거래처별로 묶어 드려요.</p>
  <div class="field"><span class="lb">어느 현장</span>${U.select(['성동구 왕십리 ○○아파트 101동 1203호', '마포구 아현동 ○○빌라 2층'])}</div>
  <div class="field"><span class="lb">거래처</span>${U.select(['한샘 자재 (3건)', '동화기업 (1건)', 'LX하우시스 (2건)', '전체 거래처'])}</div>
  <div class="field"><span class="lb">공정</span>${U.select(['발주 안 한 것 전부', '목공', '타일', '도배', '마루'])}</div>
  <div class="stack mt2">${U.check('납품 예정일이 3일 안인 것만', { on: true, none: true })}${U.check('단가를 뺀 채로 내보내기', { none: true })}</div>
  <div class="field mt4"><span class="lb">보낼 방법</span>${U.select(['PDF 내려받기', '거래처 이메일로 보내기', '문자로 링크 보내기'])}</div>
`, `${U.btn('취소', { attr: ' data-dismiss' })}${U.btn('발주서 만들기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="발주서를 내보냈어요" data-toast-kind="ok"' })}`)}
`),
  };
};

PAGES['OW-05'] = () => {
  const total = INVOICES.reduce((n, i) => n + i.amt, 0);
  const paid = INVOICES.filter((i) => i.st === '수금완료').reduce((n, i) => n + i.amt, 0);
  const late = INVOICES.filter((i) => i.st === '연체');
  return {
    o: { bare: true },
    body: U.ownerShell('OW-05', `
${U.pageHd('기성 청구·수금', '')}

<div class="g3">
  <div class="box"><div class="t-card dan">${U.num(Math.round((total - paid) / 10000))}만원</div><div class="t-sub mt2">미수금</div></div>
  <div class="box"><div class="t-card pri">${U.num(Math.round(paid / 10000))}만원</div><div class="t-sub mt2">이달 수금</div></div>
  <div class="box"><div class="t-card dan">${late.length}건 · ${U.num(Math.round(late.reduce((n, i) => n + i.amt, 0) / 10000))}만원</div><div class="t-sub mt2">연체</div></div>
</div>

${U.detail2(
      /* ⚠ 표를 맨몸으로 두면 옆의 「수금 예정」은 테두리 있는 카드인데 이쪽만 바탕에
         떠 있어 한 화면처럼 안 보인다. 표도 카드에 담아 짝을 맞춘다(2026-08-18). */
      U.card('청구 내역', U.table(['현장', '회차', '금액', '예정일', '청구일', '입금일', '상태', '세금계산서'],
        INVOICES.map((i) => [i.site, i.round, `<span class="num">${U.won(i.amt)}</span>`, i.due,
          i.invoiced || '-', i.paid || '-', U.stBadge(i.st),
          i.tax === '발행전' ? U.btn('발행하기', { sm: true, attr: ' data-toast="세금계산서를 발행했어요" data-toast-kind="ok"' }) : U.badge('발행함', 'b-ok')].map((c, idx) => (idx === 6 && i.st === '연체' ? { t: `${i.st} (7일 늦음)`, cls: 'dan strong' } : c))),
        { scroll: true }), { cls: 'mt6', bdCls: 'pad0' }),
      U.card('수금 예정', `${U.kv([['9/24', '<span class="num">13,640,000원</span>'], ['10/1', '<span class="num">4,200,000원</span>']])}`),
    )}
`),
  };
};

PAGES['OW-06'] = () => {
  const teams = ['목공1팀', '목공2팀', '타일팀', '설비1팀', '도배팀'];
  return {
    o: { bare: true },
    body: U.ownerShell('OW-06', `
${U.pageHd('일정 캘린더', '', `${U.tabs([{ label: '주 보기' }, { label: '월 보기' }], 1, { pill: true })}${U.btn('일정 추가', { sm: true, attr: ' data-toast="일정을 넣었어요"' })}`)}

${U.sec('', `<div class="chips">${teams.map((t, i) => U.chip(t, i < 3)).join('')}</div>`, { cls: 'mt4' })}

<div class="box mt6" style="overflow-x:auto">
  <div style="display:grid;grid-template-columns:repeat(7,minmax(90px,1fr));gap:1px;background:var(--border);border:1px solid var(--border);border-radius:var(--r-card);overflow:hidden;min-width:640px">
    ${['일', '월', '화', '수', '목', '금', '토'].map((d) => `<div style="background:var(--surface);text-align:center;padding:6px;font-size:12px;color:var(--muted)">${d}</div>`).join('')}
    ${Array.from({ length: 30 }).map((_, i) => {
      const d = i + 1;
      const items = SCHEDULE.filter((s) => s.date === d);
      const holiday = (d % 7 === 0);
      return `<div style="background:${holiday ? '#FAFAF8' : 'var(--surface)'};min-height:74px;padding:4px;font-size:11px">
        <div class="num" style="font-weight:600">${d}</div>
        ${items.slice(0, 2).map((s) => `<div class="badge ${s.kind === 'visit' ? 'b-line' : 'b-solid'}" style="display:block;margin-top:2px;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.site}·${s.team}</div>`).join('')}
        ${items.length > 2 ? `<div class="t-sub" style="font-size:10px">+${items.length - 2}건</div>` : ''}
      </div>`;
    }).join('')}
  </div>
</div>

${U.banner('dan', '⚠', '타일팀이 9/24에 두 현장에 잡혔습니다.', { cls: 'mt6' })}

${U.sec('이번 주 팀별 가동률', `<div class="stack">${teams.map((t, i) => `<div class="row" style="gap:var(--sp-item)"><span class="t-sub" style="width:80px">${t}</span>${U.progress(90 - i * 10)}<span class="t-sub">${90 - i * 10}%</span></div>`).join('')}</div>`, { cls: 'mt6' })}
`),
  };
};

/* OW-07 업체 정보·직원 관리 (2026-08-18 신설)
   ⚠ 손님용 「내 정보」(AU-04)와 «다른 화면»이다. 손님 것은 내 현장·저장한 견적을
     다루고, 여기는 사업자 정보·직원 권한·거래처처럼 손님에게 없는 것을 다룬다.
     사장님 지적: 「내 정보가 손님의 것과 업체의 것이 따로 있어야 함」. */
PAGES['OW-07'] = () => {
  const 권한 = ['대표', '소장', '경리'];
  const 볼수있나 = [
    ['현장 대시보드', 'O', 'O', 'X'],
    ['견적 요청함', 'O', 'O', 'X'],
    ['현장 상세', 'O', 'O', 'X'],
    ['자재·원가', 'O', 'O', 'O'],
    ['청구·수금', 'O', 'X', 'O'],
    ['일정 캘린더', 'O', 'O', 'X'],
  ];
  const 직원 = [
    { nm: '이도목', tel: '010-0000-0001', role: '대표', at: '오늘 08:12' },
    { nm: '김현장', tel: '010-0000-0002', role: '소장', at: '오늘 07:40' },
    { nm: '박경리', tel: '010-0000-0003', role: '경리', at: '어제 18:22' },
  ];
  const 거래처 = [
    ['한샘 자재', '정담당', '010-1111-2222', '월말 결제'],
    ['동화기업', '최담당', '010-3333-4444', '주문 시 선결제'],
    ['성수 인력팀', '오반장', '010-5555-6666', '주급'],
  ];
  return {
    o: { bare: true },
    body: U.ownerShell('OW-07', `
${U.pageHd('업체 정보·직원 관리', '손님 화면의 「내 정보」와는 다른 곳이에요 — 여기는 사업자·직원·거래처를 다룹니다')}

${U.detail2(
      `${U.card('업체 기본 정보', `
        ${U.kv([
          ['상호', '(주)마루공방'],
          ['사업자등록번호', '123-45-67890 <span class="t-sub">🔒 바꾸려면 문의해 주세요</span>'],
          ['대표자', '이도목'],
          ['주소', '서울 성동구 성수이로 12'],
          ['대표 전화', '02-000-0000'],
        ])}
        <div class="btns mt4">${U.btn('고치기', { sm: true, attr: ' data-modal="m-biz"' })}</div>`)}

      ${U.sec('직원 계정', U.table(['이름', '연락처', '권한', '마지막 접속', ''],
        직원.map((s) => [s.nm, s.tel,
          `<select class="sel" data-staff-role style="width:110px">${권한.map((r) => `<option${r === s.role ? ' selected' : ''}>${r}</option>`).join('')}</select>`,
          s.at,
          { t: U.btn('내보내기', { sm: true, attr: ` data-toast="${s.nm} 님을 내보냈어요"` }), cls: 'r' }]),
        { scroll: true }), {
        cls: 'mt8',
        aside: U.btn('직원 부르기', { sm: true, cls: 'btn-pri', attr: ' data-modal="m-invite"' }),
      })}
      <p class="t-sub mt2" data-role-note>권한을 바꾸면 그 사람이 볼 수 있는 화면이 바로 달라져요.</p>

      ${U.sec('권한별로 볼 수 있는 화면', U.table(['화면', ...권한],
        볼수있나.map(([nm, ...v]) => [nm, ...v.map((x) => ({ t: x === 'O' ? '<span class="pri strong">O</span>' : '<span class="t-sub">X</span>', cls: 'c' }))]),
        { scroll: true }), { cls: 'mt8' })}

      ${U.sec('거래처', U.table(['거래처', '담당자', '연락처', '거래 조건'], 거래처, { scroll: true }), {
        cls: 'mt8',
        desc: '자재·원가 화면에서 발주서를 만들 때 여기 거래처를 고릅니다.',
        aside: U.btn('거래처 추가', { sm: true, attr: ' data-modal="m-vendor"' }),
      })}`,

      `${U.card('손님 화면에 보이는 것', `
        ${U.ph(['업체 대표 사진', 600, 400], { seed: 'owner-hero', cls: 'ph-card' })}
        <div class="field mt3"><span class="lb">업체 소개</span>${U.textarea({ v: '2008년부터 성동구에서 아파트 리모델링을 해 왔습니다. 공정마다 사진으로 알려 드립니다.' })}</div>
        <p class="t-sub">시공사례·견적 화면 아래에 이대로 보입니다.</p>
        <div class="btns mt3">${U.btn('손님 화면에서 보기', { sm: true, href: 'HO-01' })}</div>`)}

      ${U.card('알림 받을 사람', `<div class="stack">
        ${[['견적 요청', '이도목'], ['기성 청구', '박경리'], ['하자 접수', '김현장']].map(([k, who]) => `
          <div class="row-b"><span class="t-sub">${k}</span>${U.select(직원.map((s) => s.nm), 직원.findIndex((s) => s.nm === who))}</div>`).join('')}
      </div>`)}

      ${U.card('사업자 서류', `
        ${U.kv([['사업자등록증', '<span class="badge b-ok">올림</span>'], ['통장 사본', '<span class="badge b-mut">아직</span>']])}
        <p class="t-sub mt2">세금계산서 발행에 쓰입니다.</p>
        ${U.uploadDrop('사업자등록증·통장 사본을 올려 주세요')}`)}`,
    )}

${U.modal('m-biz', '업체 정보 고치기', `
  <div class="field"><span class="lb">상호</span>${U.input({ v: '(주)마루공방' })}</div>
  <div class="field"><span class="lb">사업자등록번호</span>${U.input({ v: '123-45-67890', off: true })}<span class="hint">바꾸려면 문의해 주세요</span></div>
  <div class="field"><span class="lb">대표자</span>${U.input({ v: '이도목' })}</div>
  <div class="field"><span class="lb">주소</span>${U.input({ v: '서울 성동구 성수이로 12' })}</div>
  <div class="field"><span class="lb">대표 전화</span>${U.input({ v: '02-000-0000', type: 'tel' })}</div>
`, `${U.btn('취소', { attr: ' data-dismiss' })}${U.btn('저장', { cls: 'btn-pri', attr: ' data-dismiss data-toast="업체 정보를 고쳤어요" data-toast-kind="ok"' })}`)}

${U.modal('m-invite', '직원 부르기', `
  <p class="t-sub mb4">문자로 초대장을 보냅니다. 받은 사람이 눌러 가입하면 목록에 들어와요.</p>
  <div class="field"><span class="lb">이름</span>${U.input({ ph: '홍길동' })}</div>
  <div class="field"><span class="lb">연락처</span>${U.input({ ph: '010-0000-0000', type: 'tel' })}</div>
  <div class="field"><span class="lb">권한</span>${U.select(권한, 1)}</div>
`, `${U.btn('취소', { attr: ' data-dismiss' })}${U.btn('초대 보내기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="초대 문자를 보냈어요" data-toast-kind="ok"' })}`)}

${U.modal('m-vendor', '거래처 추가', `
  <div class="field"><span class="lb">거래처 이름</span>${U.input({ ph: '예: 한샘 자재' })}</div>
  <div class="field"><span class="lb">종류</span>${U.select(['자재상', '인력팀', '장비 임대', '폐기물 처리'])}</div>
  <div class="field"><span class="lb">담당자</span>${U.input({ ph: '정담당' })}</div>
  <div class="field"><span class="lb">연락처</span>${U.input({ ph: '010-0000-0000', type: 'tel' })}</div>
  <div class="field"><span class="lb">거래 조건</span>${U.select(['월말 결제', '주문 시 선결제', '주급', '건별 정산'])}</div>
`, `${U.btn('취소', { attr: ' data-dismiss' })}${U.btn('넣기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="거래처를 넣었어요" data-toast-kind="ok"' })}`)}
`),
  };
};
