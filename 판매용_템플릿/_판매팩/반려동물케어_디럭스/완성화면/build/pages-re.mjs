/* RE — 등원 예약 (6화면) */
import {
  esc, won, num, ph, phFix, dogPh, badge, stBadge, btn, chips, tabs, pane, tabBox,
  sec, card, box, banner, table, kv, sumRows, timeline, steps, pageHd, detail2, stickBar, modal,
  field, input, select, textarea, check, toggle, radioRow, calMulti, link, vacBadge, done, 조사,
} from './ui.mjs';
import {
  SITE, TODAY, DOG, MINE, CLASSES, CLS, clsNow, PRICE, unit, DOW_CAP, CAL,
  MY_PASS, MY_REG, TODAY_STAT,
} from './data.mjs';

const 초코 = DOG('d01');
const 중형 = CLS('md');
const 예약단계 = [['① 방법', ''], ['② 요일·날짜', ''], ['③ 반 배정', ''], ['④ 결제', ''], ['⑤ 완료', '']];
/* 요일 수 → 정기권 값. RE-02 의 칩이 이 표를 뒤져 값을 다시 계산한다. */
const 요일값표 = JSON.stringify(PRICE.reg);

export const PAGES = {
  /* ============================================================
     RE-01 예약 방법 고르기
     ============================================================ */
  'RE-01': () => {
    const body = `${pageHd('어떻게 맡기시겠어요?', '두 방법 모두 회차권이나 정기권이 있어야 예약할 수 있어요.')}

${steps(예약단계, 0)}

${banner('ok', '✓', `<b>${esc(초코.nm)}는 등록과 백신 확인이 모두 끝났어요.</b>
  <div class="t-sub mt2">${esc(초코.breed)} · ${초코.kg}kg · ${esc(중형.nm)} · 백신 정상 (${초코.vacD}일 남음)</div>`,
      { cls: 'mt8', right: btn('프로필 보기', { href: 'PL-04', cls: 'btn-ghost', sm: true }) })}

${banner('warn', '⚠', `<b>${esc(DOG('d02').nm)}는 백신 만료가 ${DOG('d02').vacD}일 남았어요.</b>
  <div class="t-sub mt2">지금은 예약할 수 있지만, 만료되면 등원이 막힙니다. 미리 재접종하고 증명서를 올려 주세요.</div>`,
      { cls: 'mt3', right: btn('반려견 등록 화면으로', { href: 'PL-01', cls: 'btn-sub', sm: true }) })}

<div class="g2 mt8">
  <div class="card"><div class="card-bd">
    <div style="font-size:var(--fs-page)">🔁</div>
    <h2 class="t-sec mt3">정기 등원</h2>
    <p class="mt3">월·수·금처럼 요일을 정해두고 매주 다녀요. <b class="hl">자리를 먼저 확보할 수 있어요.</b></p>
    <ul class="stack mt6">
      <li class="row"><span class="ok">✓</span><span>고른 요일의 자리를 미리 잡아 둡니다</span></li>
      <li class="row"><span class="ok">✓</span><span>매월 1일 자동 청구 — 매번 결제하지 않아요</span></li>
      <li class="row"><span class="ok">✓</span><span>주 3회 기준 ${won(PRICE.reg[3])} (1회당 약 ${won(Math.round(PRICE.reg[3] / 12))})</span></li>
      <li class="row"><span class="muted">·</span><span class="t-sub">쉬는 날은 전날까지 알려 주셔야 차감되지 않아요</span></li>
    </ul>
    <div class="btns mt8">${btn('정기 등원 신청', { href: 'RE-02', cls: 'btn-pri', w: true })}</div>
  </div></div>

  <div class="card"><div class="card-bd">
    <div style="font-size:var(--fs-page)">📅</div>
    <h2 class="t-sec mt3">낱개 예약</h2>
    <p class="mt3">필요한 날짜만 골라 예약해요. <b class="hl">자유롭게 쓸 수 있어요.</b></p>
    <ul class="stack mt6">
      <li class="row"><span class="ok">✓</span><span>원하는 날짜만 달력에서 고릅니다</span></li>
      <li class="row"><span class="ok">✓</span><span>고른 날짜 수만큼 회차권이 차감돼요</span></li>
      <li class="row"><span class="ok">✓</span><span>10회권 기준 1회당 ${won(unit(PRICE.packs[0]))}</span></li>
      <li class="row"><span class="muted">·</span><span class="t-sub">인기 요일은 자리가 먼저 찰 수 있어요</span></li>
    </ul>
    <div class="btns mt8">${btn('낱개 예약', { href: 'RE-03', cls: 'btn-pri', w: true })}</div>
  </div></div>
</div>

${sec('지금 가지고 있는 것', `${box(`<div class="row-b wrap-row">
  <div><div class="t-sub">10회 회차권</div><div class="t-page pri">잔여 ${MY_PASS.left}회</div>
    <div class="t-sub">${MY_PASS.until}까지</div></div>
  <div><div class="t-sub">정기 요일권</div><div class="t-card">매주 ${MY_REG.days.join('·')} 등원</div>
    <div class="t-sub">다음 자동 청구 ${MY_REG.next}</div></div>
  ${btn('회차권 현황', { href: 'MY-02', cls: 'btn-ghost' })}
</div>`)}`)}`;
    return { body, o: {} };
  },

  /* ============================================================
     RE-02 정기 등원 요일 선택 — 고를 때마다 요약과 값이 «실제로» 다시 계산된다
     ============================================================ */
  'RE-02': () => {
    /* ⚠ 여기는 «새로» 정기 등원을 신청하는 화면이다 — MY-03(이미 쓰고 있는 정기 등원 관리)과
       달리 처음엔 아무 요일도 골라져 있지 않아야 한다. MY_REG.days(기존 등록)로 미리 켜 두면
       칩은 켜져 보이는데 개수·요약·다음 버튼은 "0개 골랐다"로 남아 서로 다른 말을 하게 된다
       (2026-08-24, 검수 중 발견). 그래서 이 화면만은 마감 여부만 본다. */
    const 칩 = DOW_CAP.map((d) => {
      const 마감 = d.cap === 0 || d.now >= d.cap;
      return `<button class="chip${마감 ? ' is-off' : ''}" type="button"
        data-dow="${d.d}"${마감 ? ' disabled' : ''}>${d.d}
        ${마감 ? '<span class="x">마감</span>' : `<span class="x">${d.cap - d.now}자리</span>`}</button>`;
    }).join('');

    const body = `${pageHd('정기 등원 요일', '여러 요일을 고를 수 있어요. 고른 요일의 자리를 미리 잡아 둡니다.')}

${steps(예약단계, 1)}

${card('요일 고르기', `
  <div class="chips" data-multi data-pick-scope="dow" data-price-map='${요일값표}'>${칩}</div>
  <p class="hint">지금 <b data-pick-out="dow">0</b>개를 골랐습니다. 정원이 찬 요일은 고를 수 없어요.</p>
  ${banner('warn', '📌', `<b>토요일은 이번 달 자리가 다 찼어요.</b>
    <div class="t-sub mt2">일요일과 공휴일은 쉽니다. 토요일 자리가 나면 카카오톡으로 알려드릴게요.</div>`, { cls: 'mt6' })}`,
      { cls: 'mt8' })}

${card('시작일', `
  <div class="f2">
    ${field('언제부터 시작할까요?', select(['이번 주부터 (8월 26일 수요일)', '다음 주부터 (8월 31일 월요일)', '9월 1일부터'], 1, { attr: ' data-start-sel' }))}
    ${field('', '', {})}
  </div>
  ${banner('info', '🗓', `<b>고르신 요일에 이번 주 자리가 남아 있으면 이번 주부터 시작할 수 있어요.</b>
    <div class="t-sub mt2">월요일은 오늘(${esc(TODAY.short)})이라 이미 지났고, 수요일부터 자리가 있습니다.
    정원이 차 있으면 다음 주로 밀립니다 — 그때는 저희가 먼저 알려드려요.</div>`)}`,
      { cls: 'mt6' })}

${card('요약', `
  ${sumRows([
    ['고른 요일', '<b data-dow-list>아직 요일을 고르지 않았어요</b>'],
    ['등원 횟수', '<span data-dow-per>주 0회</span>'],
    ['시작', '<b data-start-out>다음 주부터 (8월 31일 월요일)</b>'],
    ['반려견', `${esc(초코.nm)} (${esc(초코.breed)} · ${초코.kg}kg)`],
    ['배정 예정 반', esc(중형.nm)],
  ], ['월 정기권', '<span data-dow-price>—</span>'])}`, { cls: 'mt6' })}

${box(`<div class="t-card">정기 등원은 자동으로 매주 반복돼요</div>
  <p class="t-sub mt3">쉬고 싶은 날은 <b>전날까지</b> 마이페이지에서 알려 주세요. 그러면 회차가 차감되지 않습니다.
  길게 쉬실 때는 일시정지를 켜시면 그 기간 동안 자동 청구도 멈춥니다.
  그만두실 때는 언제든 해지할 수 있고, 남은 정기권은 낱개 회차권으로 바꿔 드려요.</p>
  <div class="btns mt6">${btn('정기 등원 관리 화면 보기', { href: 'MY-03', cls: 'btn-sub', sm: true })}</div>`, { cls: 'mt6' })}`;

    return {
      body,
      o: {
        stick: stickBar(
          `<div><div class="t-sub" data-dow-list>아직 요일을 고르지 않았어요</div><div class="price" data-dow-price>—</div></div>`,
          btn('반 배정 확인', { href: 'RE-04', cls: 'btn-pri', id: 'goCls', off: true, attr: ' data-pick-btn="dow"' }),
        ),
      },
    };
  },

  /* ============================================================
     RE-03 낱개 예약 날짜 선택 — 고른 날짜 수와 회차권을 «견줘» 준다
     ============================================================ */
  'RE-03': () => {
    const body = `${pageHd('날짜 고르기', '여러 날을 한 번에 고를 수 있어요. 고른 날짜 수만큼 회차권이 차감됩니다.')}

${steps(예약단계, 1)}

${banner('info', '⏰', '<b>당일 예약은 오전 8시까지만 가능해요.</b><div class="t-sub mt2">그 뒤에는 자리가 남아 있어도 반 편성이 끝나 받기 어렵습니다.</div>', { cls: 'mt8' })}

${card('9월 달력', `
  ${calMulti(CAL, { attr: ' data-pick-scope="day"' })}
  <div class="row wrap-row mt6">
    <span class="t-sub"><span class="ok">●</span> 여유</span>
    <span class="t-sub"><span class="warn">●</span> 마감 임박 (3자리 이하)</span>
    <span class="t-sub"><span class="muted">●</span> 마감 — 고를 수 없어요</span>
  </div>
  <p class="hint">정원 ${CAL.cap}마리 기준입니다. 날짜마다 남은 자리가 다릅니다.</p>`, { cls: 'mt6' })}

${card('고른 날짜', `
  <div class="t-card" data-day-list>아직 날짜를 고르지 않았어요</div>
  <p class="t-sub mt3" data-day-sum>날짜를 고르면 차감될 회차권을 알려드려요</p>
  <div class="mt6" data-pass-left="${MY_PASS.left}">
    ${sumRows([
      ['고른 날짜', '<b><span data-pick-out="day">0</span>일</b>'],
      ['보유 회차권', `${MY_PASS.left}회 (${MY_PASS.until}까지)`],
    ], ['예약 후 남는 회차권', '<span data-day-left>' + MY_PASS.left + '</span>회'])}
  </div>
  <div hidden data-day-short class="mt6">
    ${banner('dan', '⚠', `<b>회차권이 <span data-day-short-n>0</span>회 모자라요.</b>
      <div class="t-sub mt2">회차권을 더 사시거나, 고른 날짜를 줄여 주세요.</div>`,
      { right: btn('회차권 구매', { href: 'RE-05', cls: 'btn-pri', sm: true }) })}
  </div>`, { cls: 'mt6' })}`;

    return {
      body,
      o: {
        stick: stickBar(
          `<div><div class="t-sub"><span data-pick-out="day">0</span>일 골랐어요</div><div class="price" data-day-sum>날짜를 고르면 차감될 회차권을 알려드려요</div></div>`,
          `${btn('회차권 구매', { href: 'RE-05', cls: 'btn-ghost' })}
           ${btn('반 배정 확인', { href: 'RE-04', cls: 'btn-pri', id: 'goCls2', off: true, attr: ' data-pick-btn="day"' })}`,
        ),
      },
    };
  },

  /* ============================================================
     RE-04 반 배정 결과 — 자동 배정이지만 «근거»가 있다
     ============================================================ */
  'RE-04': () => {
    const 또래 = clsNow('md');
    const body = `${pageHd('반 배정 결과', '등록하신 정보로 반을 정했어요. 근거도 함께 알려드립니다.')}

${steps(예약단계, 2)}

${card('', `<div class="center">
  <div style="font-size:64px">${중형.ico}</div>
  <h2 class="t-page mt4">${esc(초코.nm)}는 <span class="pri">${esc(중형.nm)}</span>으로 배정됐어요</h2>
  <p class="t-sub mt3">${esc(중형.kg)} · 오늘 ${또래}마리가 함께하고 있어요</p>
</div>`, { cls: 'mt8' })}

${card('왜 이 반인가요?', `
  ${kv([
    ['몸무게', `<b>${초코.kg}kg</b> — ${esc(중형.nm)} 구간(${esc(중형.kg)}) 안입니다`],
    ['성향', `<b>${esc(초코.tags.join(' · '))}</b> — 자유놀이 시간이 긴 반이 맞습니다`],
    ['견종', `${esc(초코.breed)} — 단두종이 아니라 여름철 실외 활동에 제한이 없어요`],
    ['적응 테스트', '지난 6월 첫 등원 때 5문항 모두 「보통 이상」이었습니다'],
  ], { cls: 'left' })}
  <div class="mt6">${btn('반 편성 기준 자세히 보기', { href: 'HO-04', cls: 'btn-sub', sm: true })}</div>`, { cls: 'mt6' })}

${card(`${esc(중형.nm)} 지금 상황`, `
  <div class="row-b wrap-row">
    <div><div class="t-sub">정원 대비 인원</div>
      <div class="t-page pri num">${또래} <span class="t-sub">/ ${중형.cap}마리</span></div></div>
    <div class="grow" style="min-width:220px">
      <div class="t-sub mb2">${esc(초코.nm)}가 오면 ${또래 + 1}마리가 됩니다</div>
      <div class="progress"><div class="fill" style="width:${Math.round((또래 + 1) / 중형.cap * 100)}%"></div></div>
    </div>
  </div>
  <p class="t-sub mt6">${esc(중형.desc)}</p>`, { cls: 'mt6' })}

${banner('info', '🔄', `<b>성향이 다르게 나타나면 반이 조정될 수 있어요.</b>
  <div class="t-sub mt2">원장이 매일 반 편성 보드에서 확인합니다. 반이 바뀌면 그날 바로 알림을 보내드려요.</div>`, { cls: 'mt6' })}

${card('예약 요약', `
  ${sumRows([
    ['예약 방식', '정기 등원 (요일 반복)'],
    ['등원 요일', `매주 ${MY_REG.days.join('·')}`],
    ['시작일', '2026년 8월 31일 (월)부터'],
    ['반려견', `${esc(초코.nm)} · ${esc(초코.breed)} · ${초코.kg}kg`],
    ['배정 반', esc(중형.nm)],
    ['차감 예정 회차권', '0회 <span class="t-sub">(정기권은 회차를 쓰지 않아요)</span>'],
  ], ['월 정기권', won(PRICE.reg[3])])}`, { cls: 'mt6' })}`;

    return {
      body,
      o: {
        stick: stickBar(
          `<div><div class="t-sub">${esc(초코.nm)} · ${esc(중형.nm)} · 매주 ${MY_REG.days.join('·')}</div><div class="price">${won(PRICE.reg[3])}</div></div>`,
          btn('결제하기', { href: 'RE-05', cls: 'btn-pri' }),
        ),
      },
    };
  },

  /* ============================================================
     RE-05 결제 — 「자동 청구」가 이 팩만의 요소다
     ⚠ 동의해야 열리는 버튼이므로 <a> 가 아니라 <button id> 로 만든다
     ============================================================ */
  'RE-05': () => {
    const 값 = PRICE.reg[3];
    const 할인 = Math.round(값 * PRICE.siblingOff / 100);
    const 낼돈 = 값 - 할인;

    const 수단 = (t, d, extra) => `<div class="box">${d}${extra || ''}</div>`;

    const body = `${pageHd('결제', '정기 요일권은 매월 1일에 자동으로 청구됩니다.')}

${steps(예약단계, 3)}

${card('무엇을 사시나요', `
  <div class="row-b wrap-row">
    <div><div class="t-card">정기 요일권 주 3회</div>
      <div class="t-sub mt1">매주 ${MY_REG.days.join('·')} · ${esc(초코.nm)} · ${esc(중형.nm)}</div></div>
    <div class="t-sec pri">${won(값)}</div>
  </div>
  <div class="mt6">${banner('ok', '🎟', `<b>보유 회차권 ${MY_PASS.left}회는 그대로 남습니다.</b>
    <div class="t-sub mt2">정기권은 회차를 쓰지 않아요. 정기 요일 말고 다른 날에 오실 때 회차권을 쓰시면 됩니다.</div>`)}</div>`,
      { cls: 'mt8' })}

${sec('결제 수단', tabBox(
      [{ label: '카드', pane: 'c' }, { label: '간편결제', pane: 's' }, { label: '계좌이체', pane: 'b' }],
      pane('c', `${수단('카드', `
        ${field('카드 번호', input({ ph: '0000 0000 0000 0000' }), { req: true })}
        <div class="f3">
          ${field('유효기간', input({ ph: 'MM/YY' }), { req: true })}
          ${field('CVC', input({ ph: '뒷면 3자리' }), { req: true })}
          ${field('할부', select(['일시불', '2개월', '3개월', '6개월'], 0, { attr: ` data-inst-for="${낼돈}"` })
            + `<span class="hint" data-inst-out>한 번에 ${num(낼돈)}원 나갑니다</span>`)}
        </div>`)}`, true)
      + pane('s', `${수단('간편결제', `<div class="btns">
          ${['카카오페이', '네이버페이', '토스페이'].map((t) => btn(t, { cls: 'btn-ghost', attr: ` data-toast="${t} 창을 엽니다 (프로토타입)"` })).join('')}
        </div>
        <p class="hint">간편결제도 자동 청구를 걸 수 있어요.</p>`)}`)
      + pane('b', `${수단('계좌이체', `
          ${banner('warn', '⚠', '<b>계좌이체는 자동 청구가 안 됩니다.</b><div class="t-sub mt2">정기 요일권은 카드나 간편결제로만 결제할 수 있어요. 회차권 구매에는 계좌이체를 쓰실 수 있습니다.</div>')}
          <div class="btns mt6">${btn('회차권으로 바꿔 사기', { href: 'HO-02', cls: 'btn-sub' })}</div>`)}`),
      0,
    ))}

${card('자동 청구', `
  <div class="row-b wrap-row">
    <div><div class="t-card">매월 1일에 자동으로 청구됩니다</div>
      <div class="t-sub mt1">다음 청구일 ${MY_REG.next} · ${won(낼돈)}</div></div>
    ${toggle(true, '자동 청구를 켰어요 — 마이페이지에서 언제든 끌 수 있습니다')}
  </div>
  <p class="hint">해지는 마이페이지 › 정기 등원 관리에서 언제든 할 수 있어요. 해지하면 남은 정기권은 낱개 회차권으로 전환됩니다.</p>`,
      { cls: 'mt6' })}

${card('동의', `<div data-agree-scope>
  <label class="check"><input type="checkbox" data-agree-all><span><b>아래 항목에 모두 동의합니다</b></span></label>
  <div style="border-top:1px solid var(--border);margin:var(--sp-item) 0"></div>
  <div data-pick-scope="agree">
    ${check('<b>[필수]</b> 이용 약관에 동의합니다', { attr: ' data-agree', sub: '등원·하원 절차, 인계 보호자 확인, 사고 시 처리 절차를 포함합니다' })}
    ${check('<b>[필수]</b> 환불 규정에 동의합니다', { attr: ' data-agree', sub: '정기권은 일할 계산으로 환불하고, 회차권은 남은 횟수를 구매가 기준으로 환불합니다' })}
    ${check('<b>[필수]</b> 매월 자동 청구에 동의합니다', { attr: ' data-agree', sub: `매월 1일 ${won(낼돈)} · 해지 전까지 계속됩니다` })}
  </div>
  ${check('[선택] 알림장과 이벤트 소식을 카카오톡으로 받겠습니다', { on: true })}
  <div class="mt6"><span data-unlock-all="payBtn" hidden></span>
    <p class="t-sub">필수 3개 중 <b data-pick-out="agree">0</b>개에 동의하셨어요. 세 개를 모두 체크하시면 결제 버튼이 열립니다.</p></div>
</div>`, { cls: 'mt6' })}

${card('최종 결제 금액', sumRows([
      ['정기 요일권 주 3회', won(값)],
      [`형제견 할인 (${PRICE.siblingOff}%)`, `−${won(할인)}`, 'minus'],
    ], ['오늘 낼 금액', won(낼돈)]), { cls: 'mt6' })}`;

    return {
      body,
      o: {
        stick: stickBar(
          `<div><div class="t-sub">형제견 할인 −${won(할인)} 적용</div><div class="price">${won(낼돈)}</div></div>`,
          btn(`${won(낼돈)} 결제하기`, { href: 'RE-06', cls: 'btn-pri', id: 'payBtn', off: true }),
        ),
      },
    };
  },

  /* ============================================================
     RE-06 예약 완료
     ⚠ 보여 줄 게 많으므로 420px 짜리 solo 상자에 가두지 않는다 — done() 을 쓴다
     ============================================================ */
  'RE-06': () => {
    const main = `
${card('예약 요약', `
  <div class="row wrap-row mb6">
    ${dogPh(초코.nm, 72)}
    <div class="grow"><div class="t-card">${esc(초코.nm)}</div>
      <div class="t-sub">${esc(초코.breed)} · ${초코.kg}kg</div></div>
    ${badge(중형.nm, 'b-solid')}
  </div>
  ${sumRows([
    ['예약 방식', '정기 등원 (요일 반복)'],
    ['등원 요일', `매주 ${MY_REG.days.join('·')}`],
    ['첫 등원일', '2026년 8월 31일 (월)'],
    ['배정 반', `${esc(중형.nm)} (${esc(중형.kg)})`],
    ['차감된 회차권', '0회'],
  ], ['남은 회차권', `${MY_PASS.left}회`])}`)}

${card('등원 준비물', `<div class="g3">
  ${[['🦮', '목줄·하네스', '현관에서 인계할 때까지 채워 주세요'],
    ['🍖', '사료·간식', '하루치를 한 봉지에 담아 주시면 좋아요'],
    ['👕', '여벌 옷', '비 오는 날이나 물놀이 하는 날에만']].map(([i, t, d]) => `<div class="box center">
    <div style="font-size:var(--fs-page)">${i}</div>
    <div class="t-card mt2">${esc(t)}</div>
    <div class="t-sub mt1">${esc(d)}</div></div>`).join('')}
</div>`, { cls: 'mt6' })}

${banner('warn', '⏱', `<b>첫 등원 날에는 30분 정도 더 걸릴 수 있어요.</b>
  <div class="t-sub mt2">적응 테스트를 함께 합니다. 보호자님도 같이 계시면 아이가 덜 긴장해요.
  ${esc(초코.nm)}는 이미 한 번 해 봤지만, 반이 바뀌면 짧게 다시 봅니다.</div>`, { cls: 'mt6' })}

${card('하루 일과', timeline([
      { hh: '09:00', t: '등원·인사', d: '컨디션을 살피고 오늘 특이사항을 받아 적어요', k: 'done' },
      { hh: '09:30', t: '자유놀이', d: `${esc(중형.nm)} 놀이터에서 60분`, k: 'done' },
      { hh: '13:30', t: '낮잠', d: '조명을 낮추고 두 시간', k: 'done' },
      { hh: '17:00', t: '알림장 사진', d: '오늘 하루를 사진으로 남깁니다', k: 'done' },
      { hh: '18:00', t: '하원', d: '보호자 확인 후 인계합니다', k: 'done' },
    ]), { cls: 'mt6' })}`;

    const aside = `
${card('다음에 할 일', `<div class="btns-v">
  ${btn('📅 캘린더에 추가', { cls: 'btn-sub', w: true, attr: ' data-toast="매주 월·수·금 09:00 일정을 캘린더에 넣었어요"' })}
  ${btn('마이페이지로', { href: 'MY-01', cls: 'btn-ghost', w: true })}
  ${btn('홈으로', { href: 'HO-01', cls: 'btn-ghost', w: true })}
</div>`)}

${card('알림장은 어디로 오나요', `
  <div class="row wrap-row">
    <span style="font-size:var(--fs-sec)">💬</span>
    <div class="grow"><div class="t-card">카카오톡</div>
      <div class="t-sub mt1">${esc(SITE.kakao)} 채널 · 하원 후 18:30쯤</div></div>
  </div>
  <div class="mt6">${check('앱 푸시로도 받겠습니다', { on: true })}</div>
  <p class="hint">채널을 차단하시면 알림장이 가지 않아요. 못 받으신 알림장은 마이페이지 알림장함에 그대로 쌓입니다.</p>`,
      { cls: 'mt6' })}`;

    return { body: done('예약이 완료됐어요', `${esc(TODAY.label)}에 접수했습니다`, main, aside), o: {} };
  },
};
