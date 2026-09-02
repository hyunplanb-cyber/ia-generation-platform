/* PR 공사 진행 — 부모 화면 6장. 이 팩의 알맹이 — 여러 날 여러 공정으로 갈라진 공사를 따라간다. */
import * as U from './ui.mjs';
import { PROCESS, FLAGSHIP, won } from './data.mjs';

/* 공정 상태 — 오늘은 착공 12일째(목공 진행 중)라고 고정해 둔다.
   PR0101·PR0102(잎사귀)·PR0201 이 전부 같은 오늘 기준을 쓴다. */
const TODAY_DAY = 12;
let acc = 0;
export const PROCESS_STATE = PROCESS.map((p) => {
  const startDay = acc; acc += p.days;
  const endDay = acc;
  const status = endDay <= TODAY_DAY ? '끝남' : (startDay < TODAY_DAY ? '하는 중' : '기다림');
  return { ...p, startDay, endDay, status };
});
export const TODAY_PCT = Math.round((TODAY_DAY / PROCESS.reduce((a, p) => a + p.days, 0)) * 100);

/* ---------------- PR0101 공정표 ---------------- */
function PR0101() {
  const doneDays = PROCESS_STATE.filter((p) => p.status === '끝남').reduce((a, p) => a + p.days, 0);
  const totalDays = PROCESS.reduce((a, p) => a + p.days, 0);
  const pct = Math.round((TODAY_DAY / totalDays) * 100);
  const body = `
${U.statGrid([
    U.stat('전체 진행률', `${pct}%`, { cls: 's-acc' }),
    U.stat('남은 날수', `${totalDays - TODAY_DAY}일`, {}),
    U.stat('오늘까지', `${TODAY_DAY}일째`, {}),
    U.stat('밀린 공정', '0개', { cls: 's-ok' }),
  ])}

${/* ⛔ 눌러도 아무것도 안 바뀌었다 (2026-09-02). 공정 일정 자료가 «한 벌»뿐이라
      거를 것도 다시 셈할 것도 없다. 없는 것을 고르게 두면 눌러도 아무 일이 없다 —
      고르개를 빼고, 이 견본이 무엇을 담고 있는지 그대로 적는다(검수항목 7-3·7-7). */''}
${U.sec('공정 일정표', `<p class="t-sub mb3">이 견본은 <b>공사 23일치 전체</b>를 한 눈에 보여 줍니다.</p>` +
    U.processBar(PROCESS_STATE, { todayPct: TODAY_PCT }) +
    `<div class="g3 mt4">${PROCESS_STATE.map((p) => `<div class="box">
      <div class="row-b"><b>${p.key}</b>${U.badge(p.status, p.status === '끝남' ? 'b-ok' : p.status === '하는 중' ? 'b-pri' : 'b-mut')}</div>
      <div class="t-sub mt1">${p.team} · ${p.days}일 (${p.startDay + 1}~${p.endDay}일차)</div></div>`).join('')}</div>`,
    { desc: `오늘은 착공 ${TODAY_DAY}일째입니다. 지금 「${PROCESS_STATE.find((p) => p.status === '하는 중')?.key}」 공정이 진행 중이에요.` })}

${U.sec('이번 주에 있을 일', U.table(['날짜', '공정', '내용'], [
    ['9/22 (화)', '목공', '주방 가구 골조 조립'],
    ['9/23 (수)', '목공', '붙박이장 설치'],
    ['9/24 (목)', '목공→타일', '목공 마감 검수, 타일팀 자재 반입'],
    ['9/25 (금)', '타일', '욕실 타일 시공 시작'],
  ]))}

<div class="btns mt6">${U.btn('오늘 현장', { href: 'PR0201', cls: 'btn-primary' })}${U.btn('사진 일지', { href: 'PR0301', cls: 'btn-ghost' })}${U.btn('추가공사 승인', { href: 'PR0401', cls: 'btn-ghost' })}${U.btn('준공 검수', { href: 'PR0501', cls: 'btn-ghost' })}</div>`;
  return { body, o: {} };
}

/* ---------------- PR0201 오늘 현장 ---------------- */
function PR0201() {
  const body = `
${U.pageHd(`오늘, 착공 ${TODAY_DAY}일째`, '2026년 9월 22일 (화)')}

${U.sec('', U.banner('pri', '🔨', `<b>목공팀 3명이 현장에 있어요.</b><div class="t-sub mt1">주방 가구 골조를 조립하고 있습니다.</div>`))}

${U.sec('오늘 찍은 사진', `<div class="g4">${Array.from({ length: 4 }, (_, i) => U.ph('오늘 현장', 'ph-11', 'today' + i)).join('')}</div>`)}

${U.sec('', U.card('현장소장의 오늘 한마디', `<p class="t-body">"오늘까지 주방 골조를 다 세웠습니다. 내일은 붙박이장 설치까지 마칠 예정이에요." — ${FLAGSHIP.manager}</p>`))}

${U.sec('오늘 끝난 일 / 내일 할 일', `<div class="g2">
  <div class="box"><b>오늘 끝난 일</b><ul class="list-plain mt2">${['거실 걸레받이 마감', '주방 골조 조립'].map((t) => `<li>· ${t}</li>`).join('')}</ul></div>
  <div class="box"><b>내일 할 일</b><ul class="list-plain mt2">${['붙박이장 설치', '침실 몰딩 작업'].map((t) => `<li>· ${t}</li>`).join('')}</ul></div>
</div>`)}

${U.sec('', U.banner('warn', '📌', '<b>집주인이 정해 주실 것 — 주방 상판 색상</b><div class="t-sub mt1">캄포블랑 / 카라라화이트 중 하나를 9/24까지 골라 주세요.</div>', { right: U.btn('지금 고르기', { href: 'CS0401', cls: 'btn-accent btn-sm' }) }))}

${U.sec('소장에게 묻기', U.card('', `<textarea class="input" placeholder="궁금한 점을 남겨 주세요"></textarea><div class="mt3">${U.btnSay('보내기', '소장님께 전달했어요')}</div>`))}

${U.sec('', U.banner('mut', '☀️', '오늘은 맑음, 이번 주 공정에 영향 없어요.'))}

<div class="row-b mt6">${U.btn('‹ 어제', { cls: 'btn-ghost btn-sm' })}<span class="t-sub">9월 22일 (화)</span>${U.btn('내일 ›', { cls: 'btn-ghost btn-sm' })}</div>`;
  return { body, o: {} };
}

/* ---------------- PR0301 현장 사진 일지 ---------------- */
function PR0301() {
  const days = [
    { date: '9월 22일 (화)', process: '목공', team: '목공1팀', n: 6 },
    { date: '9월 21일 (월)', process: '목공', team: '목공1팀', n: 5 },
    { date: '9월 19일 (토)', process: '전기·조명', team: '전기팀', n: 4 },
    { date: '9월 18일 (금)', process: '전기·조명', team: '전기팀', n: 5 },
  ];
  const body = `
${U.pageHd('현장 사진 일지', '날짜별로 묶어 최신 것부터 보여줍니다')}

${/* ⛔ 칩을 눌러도 목록이 안 줄었다 (2026-09-02). 공정은 날짜 묶음마다 있으니 거른다.
      ⚠ 공간은 자료가 없다 — 사진마다 어느 방인지 적어 둔 것이 없다. 없는 것을 고르게
      두면 눌러도 아무 일이 없다. 있는 공정만 남기고 공간은 뺐다(검수항목 7-3). */''}
${U.sec('', `<div class="row wrap-row" style="gap:24px">
  <div><p class="t-th mb2">공정</p>${U.chips(['전체', ...[...new Set(days.map((d) => d.process))]], 0, { extra: ' data-filter="사진공정"' }).replace('<button class="chip on"', '<button class="chip on" data-filter-all')}</div>
</div>`)}

<div data-filter-in="사진공정">${days.map((d) => `<div class="card mt4" data-tag="${U.esc(d.process)}"><div class="card-hd"><h3 class="t-card">${d.date}</h3><span class="t-sub">${d.process} · ${d.team} · 사진 ${d.n}장</span></div>
  <div class="card-bd"><div class="g4">${Array.from({ length: d.n }, (_, i) => U.ph('현장 사진', 'ph-11', d.date + i)).join('')}</div>
  <p class="t-sub mt3">"${d.process} 진행 상황입니다. 예정대로 진행되고 있어요." — ${FLAGSHIP.manager}</p></div></div>`).join('')}
<p class="t-sub mt3" data-filter-empty hidden>그 공정 사진이 아직 없어요.</p></div>

${U.sec('이 자리 변해 온 것', `<p class="t-sub mb3">같은 자리(주방)를 날짜별로 견줍니다</p>
  <div class="g4">${['8/28 철거 직후', '9/2 설비 완료', '9/15 전기 완료', '9/22 목공 진행 중'].map((t, i) => `<div>${U.ph(t, 'ph-11', 'compare' + i)}<p class="t-sub mt1 center">${t}</p></div>`).join('')}</div>`)}

<div class="btns mt6">${U.btn('전체 사진 내려받기', { cls: 'btn-ghost' })}${U.btn('준공 앨범으로 묶기', { cls: 'btn-ghost' })}</div>`;
  return { body, o: {} };
}

/* ---------------- PR0401 추가공사 변경 견적 승인 ---------------- */
function PR0401() {
  const items = [
    { name: '배관 노후 교체', qty: '1식', price: 900_000, why: '철거 중 발견된 노후 배관을 함께 교체하지 않으면 2~3년 안에 누수가 재발할 수 있습니다.' },
    { name: '단열 보강 (외벽 접합부)', qty: '1식', price: 500_000, why: '외벽과 맞닿은 안방 벽면의 단열이 부족해 결로가 생길 수 있습니다.' },
    { name: '폐기물 처리 추가', qty: '1톤', price: 300_000, why: '철거량이 예상보다 많아 폐기물 처리 회차가 하나 더 필요합니다.' },
  ];
  const addTotal = items.reduce((a, i) => a + i.price, 0);
  const body = `
${U.pageHd('추가공사 변경 견적 승인', '왜 생겼는지부터 설명해 드릴게요')}

${U.sec('', U.banner('warn', '⚠️', '<b>철거 중 배관 노후와 단열 부족이 발견됐습니다.</b><div class="t-sub mt1">사진으로 상태를 확인하실 수 있어요.</div>'))}
${U.sec('', `<div class="g3">${Array.from({ length: 3 }, (_, i) => U.ph('발견된 문제 사진', 'ph-43', 'issue' + i)).join('')}</div>`)}

${U.sec('추가 항목', U.table(['내용', '수량', '금액', '승인'],
    items.map((i) => [`<b>${i.name}</b><div class="t-sub">${i.why}</div>`, i.qty, won(i.price),
      `<div class="radios-h"><label class="radio on" style="height:36px;padding:0 12px"><input type="radio" name="ap-${i.name}">승인</label><label class="radio" style="height:36px;padding:0 12px"><input type="radio" name="ap-${i.name}">거절</label></div>`]),
    { foot: ['합계', '', won(addTotal), ''] }))}

${U.sec('', U.banner('danger', '❌', '거절하면 해당 항목 없이 공사가 진행되며, 향후 관련 하자는 보증 대상에서 제외됩니다.'))}

${U.sec('승인하면', `<div class="g2">
  <div class="box"><b>공사 기간</b><div class="t-page" style="font-size:22px">+2일</div><p class="t-sub">${FLAGSHIP.days}일 → ${FLAGSHIP.days + 2}일</p></div>
  <div class="box"><b>바뀐 총액</b><div class="t-page" style="font-size:22px">${won(FLAGSHIP.total + addTotal)}</div><p class="t-sub">기존 ${won(FLAGSHIP.total)} + ${won(addTotal)}</p></div>
</div>`)}

${U.sec('남은 대금 일정 (재계산)', U.table(['회차', '금액'], [
    ['중도금', won(FLAGSHIP.billing[2][2] + addTotal * 0.6)], ['잔금', won(FLAGSHIP.billing[3][2] + addTotal * 0.4)],
  ]))}

${U.sec('', U.agreeScope(`
  ${U.agreeCheckAll('위 추가공사 내용과 금액에 동의합니다')}
  ${U.sigpad({})}
  <div class="mt4">${U.btn('승인하고 서명하기', { cls: 'btn-primary btn-lg btn-block', unlockAll: true, off: true, attr: ' data-toast="승인했어요. 공정표에 반영됩니다"' })}</div>`))}

<div class="row-b mt4"><a class="btn-link" href="${U.link('PR0101')}">나중에 정하기</a><span class="t-sub">승인이 늦어지면 그 공정에서 공사가 멈춰요</span></div>

<div class="center mt6">${U.btn('소장에게 묻기', { href: 'PR0201', cls: 'btn-ghost' })}</div>`;
  return { body, o: {} };
}

/* ---------------- PR0501 준공 검수 체크리스트 ---------------- */
function PR0501() {
  const items = ['마감 상태', '수평', '문 여닫힘', '수전 누수', '콘센트', '조명'];
  const spaces = [{ label: '거실', pane: 'living' }, { label: '주방', pane: 'kitchen' }, { label: '욕실', pane: 'bath' }, { label: '침실', pane: 'room' }, { label: '베란다', pane: 'terrace' }, { label: '공용', pane: 'common' }];
  const panes = spaces.map((s, i) => U.pane(s.pane, `<div class="checks">${items.map((it, j) => `<div class="row-b" style="padding:8px 0;border-bottom:1px solid var(--border)">
    <span>${it}</span><div class="radios-h"><label class="radio${i === 0 && j < 5 ? ' on' : ''}" style="height:36px;padding:0 12px"><input type="radio" name="${s.pane}-${it}">괜찮음</label><label class="radio" style="height:36px;padding:0 12px"><input type="radio" name="${s.pane}-${it}">문제 있음</label></div>
  </div>`).join('')}</div>`, i === 0)).join('');
  const body = `
${U.pageHd('준공 검수 체크리스트', '48개 항목 중 41개 확인')}
${U.bar(85)}

${U.sec('공간별 검수', U.tabBox(U.tabs(spaces, 0), panes))}

${U.sec('', U.banner('warn', '📷', '문제 있음을 고르면 사진 올리기와 메모칸이 열립니다.'))}
${U.sec('', U.card('', `${U.ph('문제 사진 올리기', 'ph-169', 'defect')}<textarea class="input mt3" placeholder="문제 내용을 적어 주세요"></textarea>`))}

${U.sec('문제로 잡힌 것', U.table(['공간', '항목', '메모'], [
    ['욕실', '수전 누수', '온수 수전에서 미세한 누수 발견'],
    ['침실', '문 여닫힘', '문이 바닥에 살짝 걸림'],
  ]))}

${U.sec('', U.banner('mut', 'ℹ️', '재시공 요청 후 처리 기한은 7일입니다.'))}

<div class="row-b mt6"><a href="${U.link('AS0101')}" class="btn-link">문제가 더 있어요 — 하자보수 접수</a>
  ${U.btn('준공 승인', { href: 'CT0301', cls: 'btn-primary btn-lg', off: true, attr: ' title="41/48 — 모든 항목을 확인해야 열립니다"' })}</div>`;
  return { body, o: {} };
}

/* ---------------- PR0601 공사 진행 - 진행 중 없음 ---------------- */
function PR0601() {
  const body = U.empty('🏗️', '지금 진행 중인 공사가 없어요',
    '아직 계약 전이시거나, 지난 공사가 모두 끝났어요.',
    `${U.btn('예상 견적 내기', { href: 'ES0101', cls: 'btn-primary' })}${U.btn('하자보수 접수', { href: 'AS0101', cls: 'btn-ghost' })}`)
    + U.sec('지난 공사', U.accordion([
      { q: '지난 공사 보기', a: U.table(['현장', '완료일', '보증 남은 기간'], [[FLAGSHIP.title, FLAGSHIP.end, '11개월']]) },
    ]))
    + U.sec('', U.banner('mut', 'ℹ️', '하자보수 보증 기간이 11개월 남았어요.'));
  return { body, o: {} };
}

export const PAGES = { PR0101, PR0201, PR0301, PR0401, PR0501, PR0601 };
