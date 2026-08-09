/* HM 공구 관리(진행자) 5장 — 대시보드 · 참여 현황 · 마감·성사 · 발주·배송 · 공지 발송 */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, table, kv,
  gauge, countdown, tierTable, leftText, statRow, progress, sumRows,
  pageHd, detail2, hostPage, num, won, esc, link, off,
} from './ui.mjs';
import { DEALS, dealById, pctOf, MY_DEALS, JOINS, TIERS } from './data.mjs';

/* ── HM-01 진행자 대시보드 ────────────────────────────── */
function hm01() {
  const rows = MY_DEALS.map((m) => {
    const d = dealById(m.id);
    const pct = m.goal ? Math.round(m.joined / m.goal * 100) : 0;
    const risk = m.st === '모집 중' && pct < 60 && m.left < 1500;
    return {
      cls: risk ? 'is-diff' : '',
      cells: [
        `<a href="${link('HM-02')}"><b>${esc(d.nm)}</b></a>${risk ? ' ' + badge('미달 위험', 'b-danger') : ''}`,
        stBadge(m.st),
        m.goal ? gauge(pct) : '—',
        m.joined ? `${num(m.joined)} / ${num(m.goal)}명` : '—',
        m.left ? countdown(m.left) : '—',
        m.rev ? won(m.rev) : '—',
        `<div class="btns nowrap">${btn('현황', { cls: 'btn-ghost btn-sm', href: 'HM-02' })}
          ${btn('공지', { cls: 'btn-ghost btn-sm', href: 'HM-05' })}</div>`,
      ],
    };
  });

  const body = hostPage('HM-01', `
    ${pageHd('진행자 대시보드', '오늘 처리할 일과 진행 중인 공구를 한자리에서 봅니다',
    `<div class="btns">${btn('새 공구 개설', { cls: 'btn-primary', href: 'HS-02' })}</div>`)}

    ${statRow([
    ['3개', '진행 중 공구', { ic: '📦', d: '검수 대기 1개' }],
    ['852명', '총 참여자', { ic: '👥', d: '이번 주 +214' }],
    ['2,996만원', '이번 달 매출', { ic: '💳', d: '전월 대비 +34%' }],
    ['2,250만원', '정산 예정', { ic: '💰', d: '8월 12일' }],
  ])}

    ${banner('danger', '⚠️', `<b>「제주 한라봉」이 미달 위험이에요.</b>
      <p class="t-sub">3시간 7분 남았는데 53명이 부족합니다. 참여자에게 공유를 부탁하거나 마감을 늘려 보세요.</p>`,
    { right: `<div class="btns">${btn('독려 보내기', { cls: 'btn-primary btn-sm', href: 'HM-05' })}${btn('마감 늘리기', { cls: 'btn-ghost btn-sm', href: 'HM-03' })}</div>` })}

    ${card('내 공구', table(
    [{ t: '공구', w: '28%' }, '상태', { t: '달성률', w: '16%' }, '참여', '남은 시간', '매출', { t: '', w: '140px' }],
    rows,
  ), { cls: 'mt6', aside: `<a class="more" href="${link('HM-02')}">참여 현황 ›</a>` })}

    <div class="g3 mt6">
      ${card('처리할 일', `${[
    ['발주 대기', '1건', 'HM-04', 'b-warn'],
    ['배송 대기', '119건', 'HM-04', 'b-warn'],
    ['미답변 문의', '2건', 'RV-02', 'b-danger'],
    ['검수 반려', '1건', 'HS-03', 'b-danger'],
  ].map(([t, n, go, k]) => `<a class="feed-row" href="${link(go)}"><div class="grow">${t}</div>${badge(n, k)}</a>`).join('')}`)}

      ${card('마감 임박', `${MY_DEALS.filter((m) => m.left && m.left < 700).map((m) => {
    const d = dealById(m.id);
    return `<div style="padding:8px 0"><div class="row-b"><b>${esc(d.nm).slice(0, 16)}…</b>${countdown(m.left)}</div>
          <div class="mt2">${gauge(Math.round(m.joined / m.goal * 100))}</div></div>`;
  }).join('')}`, { ft: btn('마감·성사 처리', { cls: 'btn-ghost btn-block btn-sm', href: 'HM-03' }) })}

      ${card('내 성적', `${kv([
    ['성사율', '91% (34회 중 31회)'],
    ['평균 평점', '4.8'],
    ['배송 지연', '0회'],
    ['신뢰 등급', badge('A', 'b-ok') + ' 수수료 4%'],
  ])}
        <div class="box box-ok mt3"><p class="t-sub">A등급이라 목록에서 위쪽에 노출되고 수수료가 1% 낮습니다.</p></div>`)}
    </div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HM-02 공구별 참여 현황 ─────────────────────────── */
function hm02() {
  const d = dealById('d1');
  const pct = pctOf(d);
  const people = [
    ['김하*', '5kg', 1, 24900, '2026-08-04 18:24', '정상'],
    ['이준*', '10kg', 1, 46900, '2026-08-04 17:51', '정상'],
    ['박민*', '5kg', 2, 49800, '2026-08-04 16:32', '정상'],
    ['최윤*', '5kg', 1, 24900, '2026-08-04 15:10', '취소'],
    ['정태*', '10kg', 1, 46900, '2026-08-04 14:47', '정상'],
    ['손예*', '5kg', 3, 74700, '2026-08-04 13:02', '정상'],
  ];

  const main = `
    ${card('', `<div class="row-b wrap-row">
      <div class="grow"><h2 class="t-card">${esc(d.nm)}</h2>
        <div class="t-sub mt1">2026년 8월 5일 10:00 ~ 8월 12일 23:59 · 목표 ${num(d.goal)}명</div></div>
      ${countdown(d.left, { sec: d.left * 60 })}
    </div>
    <div class="mt4">${gauge(pct)}</div>
    <div class="row-b mt2"><span><b class="pri" style="font-size:20px">${num(d.joined)}명</b> / ${num(d.goal)}명</span>
      <b class="pri">${num(d.goal - d.joined)}명이면 성사</b></div>`)}

    ${card('시간대별 참여', `<div class="row-b mb4">${tabs(['24시간', '7일', '전체'], 0, { pill: true })}
      <span class="t-sub">오늘 <b>+62명</b> · 시간당 평균 3.1명</span></div>
      ${ph(['시간대별 참여 추이 막대 차트', 1200, 360], { cls: 'ph-flat' })}
      <div class="box box-warn mt4"><b>지금 속도면 목표에 못 미칩니다</b>
        <p class="t-sub mt1">남은 3시간 동안 시간당 3.1명이면 약 10명이 더 참여합니다. 53명이 필요하니 독려가 필요합니다.</p></div>`,
    { cls: 'mt6' })}

    ${card('가격 단계', tierTable(TIERS, { next: '250명까지 <b>3명</b> 남았습니다. 넘으면 참여자 전원에게 차액 3,000원이 환급됩니다.' }), { cls: 'mt6' })}

    ${card('참여자', `<div class="row-b wrap-row mb4" style="gap:12px">
      <div class="row wrap-row" style="gap:8px">
        <input class="input" style="width:200px" placeholder="닉네임 검색">
        ${btn('검색', { cls: 'btn-primary btn-sm', attr: ' data-toast="검색했어요"' })}
        ${chips(['전체', '정상', '취소'], 0)}
      </div>
      <div class="btns">
        ${btn('엑셀 내보내기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="참여자 명단을 엑셀로 내려받았어요" data-toast-kind="ok"' })}
        ${btn('공지 보내기', { cls: 'btn-primary btn-sm', href: 'HM-05' })}
      </div>
    </div>
    ${table(
      ['닉네임', '옵션', '수량', '결제액', '참여 시각', '상태'],
      people.map(([nm, opt, qty, pay, at, st]) => ({
        cls: st === '취소' ? 'is-diff' : '',
        cells: [
          `<div class="row" style="gap:8px">${phAva(28, nm)}<b>${nm}</b></div>`,
          opt, `${qty}개`, won(pay), at,
          st === '취소' ? badge('취소·환불', 'b-mut') : badge('정상', 'b-ok'),
        ],
      })),
    )}
    <p class="t-sub mt3">전체 ${num(d.joined)}명 중 앞 6명만 보여 드립니다. 취소된 건은 달성률에서 이미 빠져 있습니다.</p>`,
    { cls: 'mt6' })}`;

  const aside = card('요약', `${kv([
    ['참여', `${num(d.joined)}명`],
    ['취소', '8명'],
    ['총 수량', '271개'],
    ['총 결제액', won(6150300)],
    ['예상 수수료', won(246012)],
  ])}
    <div class="hr"></div>
    <div class="btns">
      ${btn('참여자에게 공지', { cls: 'btn-primary btn-block', href: 'HM-05' })}
    </div>
    ${btn('마감·성사 처리', { cls: 'btn-ghost btn-block', href: 'HM-03' })}
    ${btn('참여자 화면 보기', { cls: 'btn-ghost btn-block', href: 'DE-01' })}
    <div class="hr"></div>
    <b>옵션별 집계</b>
    <div class="mt2">${[['5kg', 189], ['10kg', 58], ['세트(품절)', 0]].map(([o, n]) => `<div class="row-b" style="padding:6px 0"><span class="t-sub">${o}</span><b>${n}개</b></div>`).join('')}</div>`);

  const body = hostPage('HM-02', `${pageHd('공구별 참여 현황')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HM-03 마감·성사 처리 ───────────────────────────── */
function hm03() {
  const d = dealById('d1');
  const pct = pctOf(d);
  const main = `
    ${card('마감 대상', `<div class="row wrap-row" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 104, { seed: d.id })}
      <div class="grow"><b>${esc(d.nm)}</b>
        <div class="t-sub mt1">마감 2026년 8월 12일 23:59 · ${leftText(d.left)}</div>
        <div class="mt2" style="max-width:400px">${gauge(pct)}</div>
        <div class="t-sub mt1">${num(d.joined)} / ${num(d.goal)}명 · <b class="danger">${num(d.goal - d.joined)}명 부족</b></div></div>
      ${countdown(d.left, { sec: d.left * 60 })}
    </div>`)}

    ${banner('warn', '🤔', `<b>지금 마감하면 불발됩니다.</b>
      <p class="t-sub">목표 300명 중 247명입니다. 최소 성사 인원(250명)에도 3명이 모자랍니다.</p>`, { cls: 'mt6' })}

    ${card('어떻게 할까요', `<div class="radio-list">
      <label class="radio" data-group="act"><input type="radio" name="act" checked>
        <span class="grow"><b>마감을 늘린다</b>
          <div class="t-sub mt1">참여자에게 자동으로 알립니다. 지난 3회 통계로는 24시간 늘렸을 때 평균 41명이 더 모였습니다.</div>
          <div class="row mt2" style="gap:8px">
            <select class="select" style="width:150px"><option>12시간</option><option selected>24시간</option><option>48시간</option><option>72시간</option></select>
            <span class="t-sub">→ 8월 13일 23:59까지</span></div></span></label>
      <label class="radio" data-group="act"><input type="radio" name="act">
        <span class="grow"><b>그대로 마감하고 불발 처리한다</b>
          <div class="t-sub mt1">참여자 ${num(d.joined)}명에게 전액 자동 환불됩니다. 총 ${won(6150300)}입니다.</div></span></label>
      <label class="radio" data-group="act"><input type="radio" name="act">
        <span class="grow"><b>목표를 낮춰 성사시킨다</b>
          <div class="t-sub mt1">최소 성사 인원을 247명으로 낮춥니다. 참여자에게 가격 단계가 그대로임을 알려야 합니다.</div>
          <div class="box box-warn mt2"><p class="t-sub">공급처에서 247개도 받아 주는지 먼저 확인하세요. 확인 없이 성사시키면 배송 지연으로 등급이 내려갑니다.</p></div></span></label>
    </div>`, { cls: 'mt6' })}

    ${card('성사되면 이렇게 됩니다', `${[
    ['확정 가격', '24,900원 (250명 단계에 3명 부족 → 현재 단계 유지)'],
    ['총 수량', '271개 (5kg 189 · 10kg 58 · 취소분 제외)'],
    ['참여자 알림', `${num(d.joined)}명에게 성사 안내 자동 발송`],
    ['다음 할 일', '공급처 발주 → 송장 등록 → 배송 알림'],
  ].map(([k, v]) => `<div class="row-b" style="padding:10px 0"><b class="nowrap" style="min-width:100px">${k}</b>
      <span class="grow" style="text-align:right">${v}</span></div>`).join('')}`, { cls: 'mt6' })}`;

  const aside = card('처리', `<div class="box box-mut center">
      <div class="t-sub">마감까지</div><div class="t-sec" data-count="11220">03:07:00</div></div>
    <div class="hr"></div>
    ${kv([['참여', `${num(d.joined)}명`], ['목표', `${num(d.goal)}명`], ['부족', `${num(d.goal - d.joined)}명`], ['총 결제액', won(6150300)]])}
    <div class="btns mt4">
      ${btn('고른 대로 처리하기', { cls: 'btn-primary btn-lg btn-block', attr: ' data-modal="mdClose"' })}
    </div>
    ${btn('먼저 독려 보내기', { cls: 'btn-accent btn-block', href: 'HM-05' })}
    ${btn('참여 현황 보기', { cls: 'btn-ghost btn-block', href: 'HM-02' })}
    <template id="mdClose"><div class="modal">
      <div class="hd">마감을 24시간 늘릴까요?</div>
      <div class="bd">
        <p>마감이 <b>8월 13일 23:59</b>로 바뀝니다.</p>
        <div class="mt3">${kv([
    ['알림 발송', `참여자 ${num(d.joined)}명에게 자동 발송`],
    ['가격 단계', '그대로 유지됩니다'],
    ['늘릴 수 있는 횟수', '남은 1회 (공구당 최대 2회)'],
  ])}</div>
        <div class="box box-warn mt3"><p class="t-sub">늘린 뒤에도 못 모으면 그때 불발 처리되고 전액 환불됩니다.</p></div>
      </div>
      <div class="ft">
        <button class="btn btn-ghost" type="button" data-dismiss data-toast="그대로 두었어요">취소</button>
        <button class="btn btn-primary" type="button" data-dismiss data-toast="마감을 8월 13일 23:59로 늘리고 참여자 247명에게 알렸어요" data-toast-kind="ok">늘리기</button>
      </div></div></template>`);

  const body = hostPage('HM-03', `${pageHd('마감·성사 처리')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full', state: '마감 3시간 전 · 53명 부족' } };
}

/* ── HM-04 발주·배송 관리 ───────────────────────────── */
function hm04() {
  const d = dealById('d2');
  const ships = [
    ['김하*', '기본 3종 세트', 1, '서울 성동구 아차산로 111…', '640123456789', '발송 완료'],
    ['이준*', '기본 3종 세트', 1, '경기 성남시 분당구 판교로…', '640123456790', '발송 완료'],
    ['박민*', '기본 3종 세트', 2, '부산 해운대구 센텀중앙로…', '', '발송 준비'],
    ['최윤*', '기본 3종 세트', 1, '제주 제주시 첨단로…', '', '발송 준비'],
    ['정태*', '기본 3종 세트', 1, '대전 유성구 대학로…', '', '발송 준비'],
  ];

  const main = `
    ${card('성사 집계', `<div class="row-b wrap-row">
      <div><b>${esc(d.nm)}</b><div class="t-sub mt1">2026년 8월 4일 성사 · 최종 ${num(d.joined)}명</div></div>
      ${badge('성사', 'b-ok')}
    </div>
    <div class="hr"></div>
    <div class="g4">
      ${[['총 수량', '164개'], ['기본 3종 세트', '151개'], ['추가 구성', '13개'], ['발주 금액', won(9840000)]]
      .map(([k, v]) => `<div class="box center"><div class="t-sub">${k}</div><b class="mt1" style="display:block;font-size:18px">${v}</b></div>`).join('')}
    </div>
    <div class="btns mt4">
      ${btn('발주서 내려받기 (엑셀)', { cls: 'btn-primary', attr: ' data-toast="발주서를 내려받았어요" data-toast-kind="ok"' })}
      ${btn('공급처에 메일 보내기', { cls: 'btn-ghost', attr: ' data-toast="공급처에 발주서를 보냈어요" data-toast-kind="ok"' })}
    </div>`)}

    ${card('배송 진행', `<div class="row-b mb3"><b>151건 중 32건 발송 완료</b><span class="t-sub">21%</span></div>
      ${progress(21)}
      <div class="row wrap-row mt4" style="gap:10px">
        ${[['준비', 119, 'b-warn'], ['발송', 32, 'b-ok'], ['완료', 0, 'b-mut']]
      .map(([t, n, k]) => `<div class="box center grow"><div class="t-sub">${t}</div><b class="mt1" style="display:block;font-size:20px">${n}건</b>
          <div class="mt2">${badge(t, k)}</div></div>`).join('')}
      </div>`, { cls: 'mt6' })}

    ${card('송장번호 등록', `<div class="upload" style="padding:22px">
      <div class="ico">📄</div><b>엑셀 파일을 끌어다 놓으세요</b>
      <p class="t-sub">참여 번호와 송장번호 두 열만 있으면 됩니다 · XLSX·CSV</p>
      <div class="btns mt3">
        ${btn('양식 내려받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="양식을 내려받았어요" data-toast-kind="ok"' })}
        ${btn('파일 올리기', { cls: 'btn-primary btn-sm', attr: ' data-toast="송장번호 119건을 등록했어요" data-toast-kind="ok"' })}
      </div>
    </div>`, { cls: 'mt6' })}

    ${card('배송지 목록', `<div class="row-b wrap-row mb4" style="gap:12px">
      <div class="row wrap-row" style="gap:8px">
        <input class="input" style="width:180px" placeholder="닉네임·송장번호 검색">
        ${chips(['전체', '발송 준비', '발송 완료'], 0)}
      </div>
      ${btn('배송지 엑셀 내려받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="배송지 목록을 내려받았어요" data-toast-kind="ok"' })}
    </div>
    ${table(
      [{ t: '', w: '36px' }, '참여자', '옵션', '수량', { t: '배송지', w: '26%' }, '송장번호', '상태'],
      ships.map(([nm, opt, qty, addr, tr, st]) => [
        `<label class="check" style="padding:0"><input type="checkbox"${st === '발송 준비' ? ' checked' : ''}><span></span></label>`,
        `<div class="row" style="gap:8px">${phAva(28, nm)}<b>${nm}</b></div>`,
        opt, `${qty}개`, addr,
        tr || `<input class="input" placeholder="송장번호" style="width:150px">`,
        stBadge(st),
      ]),
    )}
    <div class="row-b mt4">
      <label class="check" style="padding:0"><input type="checkbox" checked><span>발송 준비 전체 선택 (119건)</span></label>
      <div class="btns">
        ${btn('발송 완료로 바꾸기', { cls: 'btn-primary btn-sm', attr: ' data-toast="119건을 발송 완료로 바꿨어요" data-toast-kind="ok"' })}
        ${btn('배송 출발 알림 보내기', { cls: 'btn-accent btn-sm', href: 'HM-05' })}
      </div>
    </div>`, { cls: 'mt6' })}

    ${card('반품·교환 접수', `${[
    ['최윤*', '박스가 눌려 왔어요 (사진 첨부)', '2026-08-05', '접수'],
    ['정태*', '구성이 하나 빠졌습니다', '2026-08-05', '처리 중'],
  ].map(([nm, why, at, st]) => `<div class="row-b list-row" style="padding:12px 0">
      <div class="grow"><div class="row" style="gap:8px">${phAva(28, nm)}<b>${nm}</b><span class="t-sub">${at}</span></div>
        <p class="t-sub mt1">${why}</p></div>
      <div class="btns nowrap">${badge(st, st === '접수' ? 'b-warn' : 'b-pri')}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="재발송을 접수했어요" data-toast-kind="ok">재발송</button>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="환불을 접수했어요" data-toast-kind="ok">환불</button></div>
    </div>`).join('')}`, { cls: 'mt6' })}`;

  const aside = card('배송 요약', `${kv([
    ['성사 인원', `${num(d.joined)}명`],
    ['총 수량', '164개'],
    ['발송 완료', '32건'],
    ['발송 준비', '119건'],
    ['반품 접수', '2건'],
  ])}
    <div class="mt3">${progress(21)}</div>
    <div class="hr"></div>
    <div class="btns">
      ${btn('배송 출발 알림', { cls: 'btn-primary btn-block', href: 'HM-05' })}
    </div>
    ${btn('배송 지연 공지', { cls: 'btn-ghost btn-block', href: 'HM-05' })}
    ${btn('정산 내역 보기', { cls: 'btn-ghost btn-block', href: 'SE-01' })}
    <div class="hr"></div>
    <div class="box box-warn"><b>배송 지연은 등급에 영향이 있어요</b>
      <p class="t-sub mt1">약속한 발송일을 넘기면 신뢰 등급이 내려갑니다. 늦어질 것 같으면 미리 공지해 주세요.</p></div>`);

  const body = hostPage('HM-04', `${pageHd('발주·배송 관리', esc(d.nm))}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HM-05 참여자 공지·알림 발송 ────────────────────── */
function hm05() {
  const main = `
    ${card('보낼 공구와 대상', `<div class="field"><label class="label">공구</label>
      <select class="select">${MY_DEALS.map((m) => `<option>${esc(dealById(m.id).nm)}</option>`).join('')}</select></div>
      <div class="field"><label class="label">받는 사람</label>
        <div class="radio-list">
          ${[['참여자 전체', '247명'], ['취소하지 않은 참여자', '239명'], ['아직 안 받으신 분', '119명'], ['특정 옵션만', '5kg 189명']]
      .map(([t, n], i) => `<label class="radio" data-group="seg"><input type="radio" name="seg"${i === 0 ? ' checked' : ''}>
          <span class="grow"><b>${t}</b> <span class="t-sub">${n}</span></span></label>`).join('')}
        </div></div>`)}

    ${card('무엇을 보낼까요', `<div class="field"><label class="label">공지 유형</label>
      <select class="select"><option selected>마감 임박 독려</option><option>성사 안내</option><option>배송 출발</option><option>배송 지연 사과</option><option>감사 인사</option><option>직접 쓰기</option></select></div>
      <div class="field"><label class="label">제목</label><input class="input" value="{{닉네임}}님, {{남은시간}} 뒤 마감돼요!"></div>
      <div class="field"><label class="label">내용</label>
        <textarea class="textarea" rows="7">{{닉네임}}님, 안녕하세요. {{공구명}} 진행자입니다.

지금 {{현재인원}}명이 모였고, {{부족인원}}명만 더 모이면 성사됩니다. 마감까지 {{남은시간}} 남았어요.

친구에게 링크를 보내 주시면 큰 힘이 됩니다. 성사되면 {{확정가}}에 받으실 수 있어요.

{{초대링크}}</textarea></div>
      <div class="box box-mut mt3"><b>쓸 수 있는 치환 변수</b>
        <div class="row wrap-row mt2" style="gap:6px">
          ${['{{닉네임}}', '{{공구명}}', '{{현재인원}}', '{{부족인원}}', '{{남은시간}}', '{{확정가}}', '{{송장번호}}', '{{초대링크}}']
      .map((v) => `<button class="btn btn-ghost btn-sm" type="button" data-toast="${v} 를 넣었어요">${v}</button>`).join('')}
        </div></div>`, { cls: 'mt6' })}

    ${card('어떻게 보낼까요', `<div class="row wrap-row" style="gap:12px">
      ${[['앱 알림', true, '무료'], ['카카오 알림톡', true, '건당 9원'], ['문자(SMS)', false, '건당 20원']]
      .map(([t, on, c]) => `<label class="check" style="padding:10px 14px;border:1px solid var(--border);border-radius:var(--r-input)">
        <input type="checkbox"${on ? ' checked' : ''}><span><b>${t}</b> <span class="t-sub">${c}</span></span></label>`).join('')}
    </div>
    <div class="hr"></div>
    <div class="radio-list">
      <label class="radio" data-group="when"><input type="radio" name="when" checked><span class="grow"><b>지금 바로 보내기</b></span></label>
      <label class="radio" data-group="when"><input type="radio" name="when"><span class="grow"><b>예약해서 보내기</b>
        <div class="row mt2" style="gap:8px"><input class="input" type="date" value="2026-08-05" style="width:170px">
        <input class="input" type="time" value="10:00" style="width:130px"></div></span></label>
    </div>`, { cls: 'mt6' })}

    ${card('보낸 이력', table(
    ['보낸 날', '공구', '유형', '대상', '채널', '도달'],
    [
      ['2026-08-03 20:00', '제주 한라봉 5kg', '마감 임박 독려', '198명', '앱·알림톡', '96%'],
      ['2026-07-28 11:00', '독일산 냄비 3종', '성사 안내', '151명', '앱·알림톡', '99%'],
      ['2026-07-21 15:30', '닭가슴살 트릿', '배송 출발', '119명', '앱·알림톡·문자', '100%'],
    ],
  ), { cls: 'mt6' })}`;

  const aside = card('미리보기', `<div class="box box-mut">
      <div class="t-sub">받는 사람 · 김하늘</div>
      <b class="mt2" style="display:block">김하늘님, 3시간 7분 뒤 마감돼요!</b>
      <p class="t-sub mt2" style="white-space:pre-line">김하늘님, 안녕하세요. 제주 한라봉 5kg 산지직송 진행자입니다.

지금 247명이 모였고, 53명만 더 모이면 성사됩니다. 마감까지 3시간 7분 남았어요.

친구에게 링크를 보내 주시면 큰 힘이 됩니다. 성사되면 24,900원에 받으실 수 있어요.

https://moagonggu.kr/d/d1</p></div>
    <div class="hr"></div>
    ${kv([
    ['받는 사람', '247명'],
    ['채널', '앱 알림 · 알림톡'],
    ['예상 도달', '약 237명 (96%)'],
    ['드는 비용', '2,223원 (알림톡 247건)'],
  ])}
    <div class="box box-mut mt3"><p class="t-sub">비용은 정산할 때 매출에서 빠집니다.</p></div>
    <div class="btns mt4">${btn('보내기', { cls: 'btn-primary btn-lg btn-block', attr: ' data-toast="247명에게 보냈어요" data-toast-kind="ok"' })}</div>
    ${btn('다른 사람으로 미리보기', { cls: 'btn-ghost btn-block', attr: ' data-toast="이준서님 기준으로 바꿨어요"' })}`);

  const body = hostPage('HM-05', `${pageHd('참여자 공지·알림 발송')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

export const PAGES = { 'HM-01': hm01, 'HM-02': hm02, 'HM-03': hm03, 'HM-04': hm04, 'HM-05': hm05 };
