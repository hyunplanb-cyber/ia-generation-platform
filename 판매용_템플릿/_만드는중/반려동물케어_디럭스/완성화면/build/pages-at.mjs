/* AT — 등하원 관리 (5화면) · 원 운영진이 쓰는 화면
   ★ 이 팩의 알맹이가 여기 둘 있다 — AT-02 등원 체크(회차권 차감)와 AT-04 반 편성 보드. */
import {
  esc, won, num, ph, phFix, dogPh, badge, stBadge, btn, chips, tabs, pane, tabBox,
  sec, card, box, banner, empty, table, kv, timeline, progress, pageHd, stickBar, modal, stat,
  field, input, select, textarea, check, toggle, radioRow, link, vacBadge, checkRow, board, 조사,
} from './ui.mjs';
import {
  SITE, TODAY, DOGS, DOG, CLASSES, CLS, clsNow, inClass, TODAY_STAT, CAME,
} from './data.mjs';

const 대기 = DOGS.filter((d) => d.st === '대기' || d.st === '잠김' || d.st === '미등원' || d.st === '지각');
const 결석 = DOGS.filter((d) => d.st === '결석');
const 재원 = DOGS.filter((d) => d.st === '재원');
const 하원 = DOGS.filter((d) => d.st === '하원');
const 미등원 = DOGS.filter((d) => d.st === '미등원');

export const PAGES = {
  /* ============================================================
     AT-01 오늘 등원 현황판 — 원장이 매일 아침 가장 먼저 여는 화면
     숫자와 상태가 한눈에 들어와야 한다.
     ============================================================ */
  'AT-01': () => {
    const 반칸 = (c) => {
      const 목록 = DOGS.filter((d) => d.cls === c.id);
      return table(
        [{ t: '', w: '64px' }, '이름', '견종·몸무게', { t: '예약', cls: 'c' }, { t: '상태', cls: 'c' }, { t: '등원 시각', cls: 'c' }],
        목록.map((d) => ({
          cls: d.st === '미등원' ? 'bad' : (d.st === '결석' ? 'mut' : ''),
          cells: [
            { t: dogPh(d.nm, 44), cls: 'nowrap' },
            { t: `<b>${esc(d.nm)}</b> ${d.vac !== '정상' ? `<span title="${d.vac === '만료' ? '백신 만료' : '백신 만료 임박'}">${d.vac === '만료' ? '🔴' : '🟠'}</span>` : ''}`, cls: 'nowrap' },
            `<span class="t-sub">${esc(d.breed)} · ${d.kg}kg</span>`,
            { t: esc(d.want || d.inAt || '09:00'), cls: 'c nowrap' },
            { t: stBadge(d.st === '재원' ? '등원중' : (d.st === '대기' || d.st === '잠김' ? '예약' : d.st)), cls: 'c' },
            { t: d.inAt ? `<b class="num">${d.inAt}</b>` : '<span class="muted">—</span>', cls: 'c nowrap' },
          ],
        })),
      );
    };

    const body = `${pageHd(`오늘 등원 현황판 <span class="t-sub" style="font-weight:400">${esc(TODAY.label)}</span>`,
      `지금 ${TODAY_STAT.재원}마리가 원에 있어요`,
      `${btn('등원 체크', { href: 'AT-02', cls: 'btn-pri' })}${btn('하원 체크', { href: 'AT-03', cls: 'btn-ghost' })}`)}

<div class="g4">
  ${stat('오늘 예약', TODAY_STAT.예약, { ico: '📋', u: '마리', d: '정기 등원과 낱개 예약을 합한 수' })}
  ${stat('등원 완료', TODAY_STAT.등원, { ico: '✅', u: '마리', cls: 'ok', d: `지금 재원 ${TODAY_STAT.재원} · 하원 ${TODAY_STAT.하원}` })}
  ${stat('미등원', TODAY_STAT.미등원, { ico: '⚠️', u: '마리', cls: 'dan', d: '9시 예약인데 아직 체크 안 됨' })}
  ${stat('백신 만료 임박', TODAY_STAT.백신임박, { ico: '💉', u: '마리', cls: 'warn', d: '30일 안에 만료돼요' })}
</div>

${미등원.length ? sec('먼저 확인해 주세요', 미등원.map((d) => `<div class="rowcard bad mb3">
  <div class="thumb">${dogPh(d.nm, 96)}</div>
  <div class="bd">
    <div class="row wrap-row">${stBadge('미등원')}${badge(esc(CLS(d.cls).nm), 'b-line')}</div>
    <div class="t-card mt2">${esc(d.nm)} — ${esc(d.want)} 예약인데 아직 체크 안 됨</div>
    <div class="t-sub mt1">보호자 ${esc(d.guardian)} · ${esc(d.phone || '연락처 없음')} · 연락 시도 없음</div>
  </div>
  <div class="side btns-v">
    ${btn('보호자에게 연락', { cls: 'btn-pri', sm: true, attr: ` data-notify="${esc(d.guardian)} 님께 전화를 겁니다 (${esc(d.phone || '')})"` })}
    ${btn('결석 처리', { href: 'AT-05', cls: 'btn-ghost', sm: true })}
  </div>
</div>`).join('')) : ''}

${sec('반별 명단', tabBox(
      CLASSES.map((c) => ({ label: `${c.ico} ${c.nm}`, cnt: `${clsNow(c.id)}/${c.cap}`, pane: c.id })),
      CLASSES.map((c, i) => pane(c.id, `
        <div class="row-b wrap-row mb4">
          <div class="t-card">${esc(c.nm)} <span class="t-sub">(${esc(c.kg)})</span></div>
          <div class="grow" style="min-width:220px">
            ${progress(clsNow(c.id) / c.cap * 100, clsNow(c.id) >= c.cap ? 'warn' : '')}
            <div class="t-sub mt2">정원 ${c.cap}마리 중 <b>${clsNow(c.id)}마리</b>가 지금 있어요</div>
          </div>
        </div>
        ${반칸(c)}`, i === 0)).join(''),
      0,
    ), { desc: '🔴 백신 만료 · 🟠 만료 임박 — 이름 옆에 표시됩니다.' })}

<div class="btns mt8">
  ${btn('등원 체크', { href: 'AT-02', cls: 'btn-pri' })}
  ${btn('하원 체크', { href: 'AT-03', cls: 'btn-ghost' })}
  ${btn('반 편성 보드', { href: 'AT-04', cls: 'btn-ghost' })}
  ${btn('백신 만료 확인', { href: 'HL-01', cls: 'btn-sub' })}
</div>`;
    return { body, o: { wide: true } };
  },

  /* ============================================================
     ★ AT-02 등원 체크 — 체크 한 번이 회차권 차감으로 바로 이어진다
     ⚠ 백신 만료 아이의 버튼은 <button disabled> 다. <a> 로 만들면 잠글 수 없다.
     ============================================================ */
  'AT-02': () => {
    const 체크할것 = 대기;
    const body = `${pageHd('등원 체크', `${esc(TODAY.label)} · 체크하면 시각이 적히고 회차권이 1회 깎입니다`,
      btn('오늘 현황판', { href: 'AT-01', cls: 'btn-ghost' }))}

<div class="g3">
  ${stat('아직 안 온 아이', `<span data-untick>${체크할것.filter((d) => d.st !== '잠김').length}</span>`, { ico: '⏳', u: '마리', d: '<span data-untick-msg>등원 체크를 기다리고 있어요</span>' })}
  ${stat('등원 완료', TODAY_STAT.등원, { ico: '✅', u: '마리', cls: 'ok', d: '오늘 예약 ' + TODAY_STAT.예약 + '마리 중' })}
  ${stat('결석 처리됨', TODAY_STAT.결석, { ico: '🏠', u: '마리', d: '미리 알려 주신 결석입니다' })}
</div>

${banner('info', '🎟', `<b>등원 체크를 누르면 그 자리에서 세 가지가 함께 일어납니다.</b>
  <div class="t-sub mt2">① 지금 시각이 적히고 ② 그 아이의 회차권이 1회 깎이고 ③ 5분 동안 되돌리기가 뜹니다.
  정기 요일권으로 오는 아이는 회차가 깎이지 않습니다.</div>`, { cls: 'mt8' })}

${card('오늘 예약 명단', 체크할것.map((d) => checkRow(d, { mode: 'in' })).join(''), { cls: 'mt6', bdCls: 'pad0' })}

${sec('이미 등원한 아이', card('', 재원.slice(0, 5).map((d) => checkRow(d, { mode: 'in' })).join('')
      + `<div class="pc-check"><div class="who"><span class="t-sub">그 밖에 ${재원.length - 5 + 하원.length}마리가 더 등원했어요</span></div>
        <div class="act">${btn('현황판에서 전체 보기', { href: 'AT-01', cls: 'btn-ghost', sm: true })}</div></div>`,
      { bdCls: 'pad0' }))}

${sec('오늘 결석', card('', table(
      ['이름', '반', '통보 시점', { t: '회차권', cls: 'c' }, { t: '', cls: 'c' }],
      결석.map((d) => [
        { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
        esc(CLS(d.cls).nm),
        `${badge(d.absKind, d.absKind === '사전 통보' ? 'b-ok' : 'b-warn')}`,
        { t: d.absKind === '사전 통보' ? '<span class="ok">차감 안 함</span>' : '<span class="dan">1회 차감</span>', cls: 'c nowrap' },
        { t: btn('처리 화면', { href: 'AT-05', cls: 'btn-ghost', sm: true }), cls: 'c' },
      ]),
    ), { bdCls: 'pad0' }), { desc: '전날까지 알려 주신 결석은 회차권을 깎지 않습니다.' })}

<div class="btns mt8">
  ${btn('반 편성 보드', { href: 'AT-04', cls: 'btn-ghost' })}
  ${btn('결석·지각 처리', { href: 'AT-05', cls: 'btn-sub' })}
</div>`;
    /* 이 화면의 «지금»은 아침이다 — 09:34 를 기준으로 시각을 적는다.
       09:00 예약 아이를 지금 체크하면 34분 늦은 것이라 「지각」 배지가 함께 붙는다. */
    return { body, o: { wide: true, now: '09:34' } };
  },

  /* ============================================================
     AT-03 하원 체크 — 인계 보호자 확인이 안전상 가장 중요한 자리
     ============================================================ */
  'AT-03': () => {
    const body = `${pageHd('하원 체크', `${esc(TODAY.label)} · 인계 보호자를 확인하고 보내 주세요`,
      btn('오늘 현황판', { href: 'AT-01', cls: 'btn-ghost' }))}

<div class="g3">
  ${stat('지금 재원 중', `<span data-instay>${재원.length}</span>`, { ico: '🏠', u: '마리', d: '아직 원에 있는 아이들' })}
  ${stat('하원 완료', 하원.length, { ico: '👋', u: '마리', cls: 'ok', d: '오늘 집에 간 아이들' })}
  ${stat('알림장 발송 대상', `<span data-note-target>${하원.length}</span>`, { ico: '📓', u: '마리', cls: 'warn', d: '하원한 아이는 자동으로 올라갑니다' })}
</div>

${banner('warn', '🔐', `<b>등록된 보호자가 맞는지 반드시 확인하고 보내 주세요.</b>
  <div class="t-sub mt2">다른 분이 오셨으면 [대리 하원]을 고르고 오신 분의 이름과 관계를 적습니다.
  대리 하원은 기록에 따로 남고, 보호자에게도 알림이 갑니다.</div>`, { cls: 'mt8' })}

${card('재원 중인 아이', 재원.map((d) => checkRow(d, { mode: 'out' })).join(''), { cls: 'mt6', bdCls: 'pad0' })}

${sec('하원 완료', card('', 하원.map((d) => checkRow(d, { mode: 'out' })).join(''), { bdCls: 'pad0' }),
      { desc: '하원한 아이는 알림장 발송 대상 목록에 자동으로 올라갑니다.' })}

<div class="btns mt8">
  ${btn('알림장 작성하러 가기', { href: 'NW-01', cls: 'btn-pri' })}
  ${btn('오늘 현황판', { href: 'AT-01', cls: 'btn-ghost' })}
</div>`;
    /* 이 화면의 «지금»은 저녁이다 — 재원 시간이 실제로 여덟 시간쯤 나와야 한다 */
    return { body, o: { wide: true, now: '17:48' } };
  },

  /* ============================================================
     ★ AT-04 반 편성 보드 — 끌어다 놓으면 «진짜로» 반이 바뀐다
     이 팩에서 꼭 살려야 하는 화면이다.
     ============================================================ */
  'AT-04': () => {
    const body = `${pageHd('반 편성 보드', `${esc(TODAY.label)} · 지금 원에 있는 ${재원.length}마리`,
      btn('등원 현황판', { href: 'AT-01', cls: 'btn-ghost' }))}

${banner('info', '🖐', `<b>카드를 끌어다 다른 반에 놓으면 반이 바뀝니다.</b>
  <div class="t-sub mt2">끌기가 어려우면 <b>카드를 한 번 누르고</b>(테두리가 켜집니다) <b>옮길 반의 빈 자리를 누르세요</b> — 같은 결과입니다.
  옮기면 인원이 다시 세어지고, 정원을 넘기면 그 반 머리가 붉어지며 저장이 잠깁니다.</div>`, { cls: 'mt8' })}

<div class="mt6">${board()}</div>

<div hidden data-board-msg class="mt6">
  ${banner('acc', '↔', `<b>자동 배정과 다르게 옮긴 아이</b><div class="t-sub mt2" data-board-list></div>
    <div class="t-sub mt2">저장하면 반이 바뀐 아이의 보호자에게 알림이 나갑니다.</div>`)}
</div>

${sec('반 편성 규칙', `<div class="g3">
  ${CLASSES.map((c) => `<div class="box">
    <div class="t-card">${c.ico} ${esc(c.nm)}</div>
    <div class="t-sub mt1">${esc(c.kg)} · 정원 ${c.cap}마리</div>
    <p class="t-sub mt3">${esc(c.desc)}</p>
  </div>`).join('')}
</div>
<p class="t-sub mt4">몸무게 구간을 벗어난 반으로 옮기려 하면 <b>「몸무게 차이가 큽니다」</b> 확인을 먼저 묻습니다.
자동 배정과 다르게 옮길 때는 짧은 사유를 남겨야 합니다 — 나중에 왜 그랬는지 알 수 있어야 하니까요.</p>
<div class="btns mt6">${btn('반 배정 규칙 설정', { href: 'MG-02', cls: 'btn-sub', sm: true })}</div>`)}`;

    return {
      body,
      o: {
        wide: true,
        stick: stickBar(
          '<div><div class="t-sub">옮긴 뒤 저장해야 반영됩니다</div><div class="t-card">정원을 넘긴 반이 있으면 저장할 수 없어요</div></div>',
          `${btn('되돌리기', { cls: 'btn-ghost', attr: ' data-toast="새로고침하면 자동 배정 결과로 돌아갑니다"' })}
           ${btn('저장하고 보호자에게 알림', { cls: 'btn-pri', id: 'boardSave', attr: ' data-board-save' })}`,
        ),
      },
    };
  },

  /* ============================================================
     AT-05 결석·지각 처리 — 회차권 차감이 «사전 통보냐»로 갈린다
     ============================================================ */
  'AT-05': () => {
    const 지각 = DOGS.filter((d) => d.st === '지각');

    const 결석칸 = `
      ${card('결석 처리할 아이 고르기', `
        <div class="chips" data-multi data-pick-scope="abs">
          ${[...미등원, ...지각, ...결석].map((d) => `<button class="chip" type="button">${esc(d.nm)} <span class="x">${esc(CLS(d.cls).nm)}</span></button>`).join('')}
        </div>
        <p class="hint"><b data-pick-out="abs">0</b>마리를 골랐습니다. 한 번에 여러 마리를 처리할 수 있어요.</p>`)}

      ${card('통보 시점', `
        ${radioRow('abs', ['사전 통보 (전날까지 알려 오심)', '당일 통보 (오늘 아침에 알려 오심)', '노쇼 (연락이 없음)'], 0)}
        <div class="mt6">${banner('info', '🎟', `<b>사전 통보는 회차권이 차감되지 않아요. 당일 통보는 차감됩니다.</b>
          <div class="t-sub mt2">당일에 알려 주시면 이미 그 아이 자리를 비워 둔 것이라 1회 차감합니다.
          노쇼는 당일 통보와 같이 1회 차감하고, 세 번 쌓이면 원장에게 알림이 갑니다.</div>`)}</div>
        ${field('메모 (보호자에게 보낼 말)', textarea({ ph: '오늘 결석으로 처리했어요. 회차권은 차감되지 않습니다.' }), { cls: 'mt6' })}
        <div class="btns mt6">
          ${btn('결석 처리하고 보호자에게 알림', { cls: 'btn-pri', id: 'absBtn', off: true, attr: ' data-pick-btn="abs" data-notify="결석으로 처리했어요 — 보호자에게 알림을 보냈습니다"' })}
        </div>`, { cls: 'mt6' })}

      ${sec('노쇼 — 연락 없이 안 온 아이', table(
        ['이름', '반', '예약', '보호자', '연락 시도', { t: '', cls: 'c' }],
        미등원.map((d) => ({
          cls: 'bad',
          cells: [
            { t: `<b>${esc(d.nm)}</b> ${badge('노쇼', 'b-dan')}`, cls: 'nowrap' },
            esc(CLS(d.cls).nm),
            { t: esc(d.want), cls: 'nowrap' },
            `${esc(d.guardian)}<div class="sub">${esc(d.phone || '')}</div>`,
            '<span class="muted">아직 없음</span>',
            { t: btn('연락 시도 기록', { cls: 'btn-ghost', sm: true, attr: ` data-notify="${esc(d.guardian)} 님께 연락을 시도한 것으로 적었어요 (${esc(TODAY.short)} 09:40)"` }), cls: 'c' },
          ],
        })),
      ))}`;

    const 지각칸 = `
      ${지각.length ? table(
        ['이름', '반', '예약 시간', '알려온 도착 예정', '차이', { t: '', cls: 'c' }],
        지각.map((d) => [
          { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
          esc(CLS(d.cls).nm),
          { t: esc(d.want), cls: 'nowrap' },
          { t: `<b class="warn">${esc(d.eta)}</b>`, cls: 'nowrap' },
          { t: badge('80분 늦음', 'b-warn'), cls: 'nowrap' },
          { t: btn('등원 체크로', { href: 'AT-02', cls: 'btn-ghost', sm: true }), cls: 'c' },
        ]),
      ) : empty('🕐', '지각한 아이가 없어요', '오늘은 모두 제 시간에 왔습니다.')}
      ${banner('info', '⏰', `<b>예약 시간보다 15분 넘게 늦게 체크하면 「지각」 배지가 자동으로 붙습니다.</b>
        <div class="t-sub mt2">보호자가 미리 알려 주신 경우에는 지각으로 세지 않고 여기 목록에만 올려 둡니다.</div>`, { cls: 'mt6' })}`;

    const body = `${pageHd('결석·지각 처리', `${esc(TODAY.label)} · 결석 ${TODAY_STAT.결석}마리 · 노쇼 ${TODAY_STAT.미등원}마리 · 지각 ${TODAY_STAT.지각}마리`,
      btn('오늘 현황판', { href: 'AT-01', cls: 'btn-ghost' }))}

${tabBox(
      [{ label: '결석 처리', cnt: TODAY_STAT.결석 + TODAY_STAT.미등원, pane: 'a' }, { label: '지각 목록', cnt: TODAY_STAT.지각, pane: 'b' }],
      pane('a', 결석칸, true) + pane('b', 지각칸),
      0,
    )}

<div class="btns mt8">
  ${btn('보호자 알림 발송 관리', { href: 'HL-04', cls: 'btn-sub' })}
  ${btn('등원 체크', { href: 'AT-02', cls: 'btn-ghost' })}
</div>`;
    return { body, o: { wide: true } };
  },
};
