/* AT 등하원 관리 — 잎사귀 18장.
   부모(AT0101·AT0201·AT0301·AT0401·AT0501)의 뼈대·색·톤은 U.shell() 이 그대로 지켜 준다.
   여기서는 그 화면의 «상태 하나»만 또렷이 보여 준다.

   ★ 이 팩의 알맹이 둘이 이 메뉴에 있다.
     ① 등원 체크 한 번이 회차권을 깎는다 (AT0202·AT0204)
     ② 반 편성 보드에서 카드가 «진짜로» 옮겨진다 (AT0402·AT0403)
     카페24·아임웹으로 안 되는 자리가 여기다. 그래서 이 다섯 장은 두껍게 만든다.

   ⛔ 숫자는 한 번도 손으로 적지 않는다. DOGS·CLASSES·TODAY_STAT·ALERTS 에서 세어 쓴다.
   ⛔ 브라우저의 confirm·prompt·alert 를 쓰지 않는다. 확인·입력은 app.js 의
      물어보기()·골라받기()·적어받기() 가 data-vac-unlock·data-checkout·보드 옮기기에서
      스스로 띄운다. */
import {
  esc, num, dogPh, badge, stBadge, btn, chips, pane, tabBox, sec, card, banner,
  empty, table, kv, timeline, progress, leafHd, stickBar, stat, field,
  select, textarea, check, vacBadge, checkRow, board, 조사,
} from './ui.mjs';
import {
  TODAY, DOGS, CLASSES, CLS, clsNow, TODAY_STAT, CAME, NOTE_CNT,
  ALERTS, VAC_STAT, ROSTER_TOTAL,
} from './data.mjs';

const P = {};
export const PAGES = P;

/* ---------- 이 파일 안에서만 쓰는 셈 도구 ---------- */
const 분 = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
const 걸린 = (m) => (m >= 60 ? `${Math.floor(m / 60)}시간 ${m % 60}분` : `${m}분`);
const 반이름 = (d) => CLS(d.cls).nm;

/* ---------- 오늘 명단을 상태별로 나눈다 — 모두 DOGS 에서 «세어» 나온다 ---------- */
const 재원 = DOGS.filter((d) => d.st === '재원');
const 하원 = DOGS.filter((d) => d.st === '하원');
const 잠김 = DOGS.filter((d) => d.st === '잠김');
const 미등원 = DOGS.filter((d) => d.st === '미등원');
const 지각목록 = DOGS.filter((d) => d.st === '지각');
const 결석 = DOGS.filter((d) => d.st === '결석');
/** 아직 등원 체크가 안 된 아이 — 백신으로 잠긴 아이는 여기 넣지 않는다(누를 수 없으니까) */
const 미체크 = DOGS.filter((d) => d.st === '대기' || d.st === '미등원' || d.st === '지각');

/** 그 아이에게 오늘 나간 알림 — ALERTS 한 곳에서만 읽는다 */
const 오늘알림 = (nm) => ALERTS.filter((a) => a.dog === nm && a.when.startsWith('08-24'));

/* ============================================================
   AT0101 오늘 등원 현황판 의 갈래들
   ============================================================ */

/* ---------- AT0102 반별 탭 전환 ----------
   탭을 누르면 목록이 «실제로» 그 반만 남아야 한다 — tabBox() 가 탭과 몸통을 한 상자에 묶는다. */
P['AT0102'] = (ctx) => {
  const 반표 = (c) => {
    const 목록 = DOGS.filter((d) => d.cls === c.id);
    return table(
      [{ t: '', w: '64px' }, '이름', '견종·몸무게', { t: '예약', cls: 'c' }, { t: '상태', cls: 'c' }, { t: '등원 시각', cls: 'c' }],
      목록.map((d) => ({
        cls: d.st === '미등원' ? 'bad' : (d.st === '결석' ? 'mut' : ''),
        cells: [
          { t: dogPh(d.nm, 44), cls: 'nowrap' },
          { t: `<b>${esc(d.nm)}</b> ${d.vac !== '정상' ? (d.vac === '만료' ? '🔴' : '🟠') : ''}`, cls: 'nowrap' },
          `<span class="t-sub">${esc(d.breed)} · ${d.kg}kg</span>`,
          { t: esc(d.want || d.inAt || '09:00'), cls: 'c nowrap' },
          { t: stBadge(d.st === '재원' ? '등원중' : (d.st === '대기' || d.st === '잠김' ? '예약' : d.st)), cls: 'c' },
          { t: d.inAt ? `<b class="num">${d.inAt}</b>` : '<span class="muted">—</span>', cls: 'c nowrap' },
        ],
      })),
    );
  };

  const body = `${leafHd(ctx, '반 이름을 누르면 그 반 명단만 남습니다 — 화면 주소는 그대로예요')}

${banner('info', '🗂', `<b>탭 셋을 합치면 오늘 예약 ${TODAY_STAT.예약}마리입니다.</b>
  <div class="t-sub mt2">${CLASSES.map((c) => `${c.nm} ${DOGS.filter((d) => d.cls === c.id).length}마리`).join(' · ')} —
  탭 옆의 숫자는 «정원 대비 지금 원에 있는 인원»이라 명단 줄 수와 다를 수 있어요.</div>`, { cls: 'mb6' })}

${tabBox(
    CLASSES.map((c) => ({ label: `${c.ico} ${c.nm}`, cnt: `${clsNow(c.id)}/${c.cap}`, pane: c.id })),
    CLASSES.map((c, i) => pane(c.id, `
      <div class="row-b wrap-row mb4">
        <div class="t-card">${esc(c.nm)} <span class="t-sub">(${esc(c.kg)})</span></div>
        <div class="grow" style="min-width:220px">
          ${progress(clsNow(c.id) / c.cap * 100, clsNow(c.id) >= c.cap ? 'warn' : '')}
          <div class="t-sub mt2">정원 ${c.cap}마리 중 <b>${clsNow(c.id)}마리</b>가 지금 있어요 ·
            오늘 이 반 명단은 ${DOGS.filter((d) => d.cls === c.id).length}마리</div>
        </div>
      </div>
      <p class="t-sub mb4">${esc(c.desc)}</p>
      ${반표(c)}`, i === 0)).join(''),
    0,
  )}

<div class="btns mt8">
  ${btn('오늘 등원 현황판', { href: 'AT0101', cls: 'btn-ghost' })}
  ${btn('반 편성 보드', { href: 'AT0401', cls: 'btn-ghost' })}
</div>`;
  return { body, o: {} };
};

/* ---------- AT0103 미등원 강조 ---------- */
P['AT0103'] = (ctx) => {
  const 지금 = '09:40';
  const 카드 = (d) => {
    const 경과 = 분(지금) - 분(d.want);
    const 알림 = 오늘알림(d.nm);
    return `<div class="rowcard bad mb3">
      <div class="thumb">${dogPh(d.nm, 96)}</div>
      <div class="bd">
        <div class="row wrap-row">${stBadge('미등원')}${badge(esc(반이름(d)), 'b-line')}${badge(`${걸린(경과)} 지남`, 'b-dan')}</div>
        <div class="t-card mt2">${esc(d.nm)} — ${esc(d.want)} 예약인데 ${지금} 지금까지 체크가 없어요</div>
        <div class="t-sub mt1">보호자 ${esc(d.guardian)} · ${esc(d.phone || '등록된 번호 없음')}</div>
        <div class="t-sub mt1">보호자 연락 이력 ·
          ${알림.length ? 알림.map((a) => `${esc(a.when.slice(6))} ${esc(a.ch)} <b>${esc(a.st)}</b>`).join(' / ') : '<span class="dan">아직 없음</span>'}</div>
      </div>
      <div class="side btns-v">
        ${btn('보호자에게 연락', { cls: 'btn-pri', sm: true, attr: ` data-notify="${esc(d.guardian)} 님께 전화를 겁니다 (${esc(d.phone || '번호 없음')})"` })}
        ${btn('연락 시도 기록', { cls: 'btn-ghost', sm: true, attr: ` data-notify="${esc(d.nm)} — ${지금}에 연락을 시도한 것으로 적었어요"` })}
        ${btn('결석 처리', { href: 'AT0501', cls: 'btn-sub', sm: true })}
      </div>
    </div>`;
  };

  const body = `${leafHd(ctx, `${esc(TODAY.label)} ${지금} 기준 · 예약 시간이 지났는데 체크가 없는 아이를 맨 위로 올립니다`)}

<div class="g3 mt6">
  ${stat('미등원', TODAY_STAT.미등원, { ico: '⚠️', u: '마리', cls: 'dan', d: '9시 예약인데 아직 체크 안 됨' })}
  ${stat('가장 오래 기다린 아이', 걸린(Math.max(...미등원.map((d) => 분(지금) - 분(d.want)))), { ico: '⏱', d: `예약 ${esc(미등원[0].want)} · 지금 ${지금}` })}
  ${stat('오늘 예약', TODAY_STAT.예약, { ico: '📋', u: '마리', d: `등원 ${TODAY_STAT.등원} · 결석 ${TODAY_STAT.결석} · 지각 ${TODAY_STAT.지각}` })}
</div>

${banner('dan', '📞', `<b>미등원은 «연락이 안 된 결석»입니다 — 결석과 다르게 다룹니다.</b>
  <div class="t-sub mt2">보호자가 미리 알려 오신 결석은 회차권을 깎지 않지만, 연락 없이 안 온 노쇼는 1회 차감하고
  세 번 쌓이면 원장에게 알림이 갑니다. 먼저 전화를 걸어 보고, 그래도 연락이 닿지 않으면 노쇼로 넘깁니다.</div>`, { cls: 'mt8 mb6' })}

${sec(`먼저 확인해 주세요 — ${미등원.length}마리`, 미등원.map(카드).join(''))}

${sec('오늘 안 온 아이 전체', card('', table(
    ['이름', '반', { t: '예약', cls: 'c' }, { t: '상태', cls: 'c' }, '보호자', { t: '', cls: 'c' }],
    [...미등원, ...지각목록, ...잠김, ...결석].map((d) => ({
      cls: d.st === '미등원' ? 'bad' : (d.st === '결석' ? 'mut' : ''),
      cells: [
        { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
        esc(반이름(d)),
        { t: esc(d.want), cls: 'c nowrap' },
        { t: stBadge(d.st === '잠김' ? '예약' : d.st), cls: 'c' },
        `${esc(d.guardian)}<div class="sub">${esc(d.phone || '등록된 번호 없음')}</div>`,
        { t: btn(d.st === '잠김' ? '백신 잠금 보기' : '처리 화면', { href: d.st === '잠김' ? 'AT0204' : 'AT0501', cls: 'btn-ghost', sm: true }), cls: 'c' },
      ],
    })),
  ), { bdCls: 'pad0' }), { desc: `미등원 ${TODAY_STAT.미등원} · 지각 ${TODAY_STAT.지각} · 백신 잠김 ${잠김.length} · 결석 ${TODAY_STAT.결석} — 모두 ${미등원.length + 지각목록.length + 잠김.length + 결석.length}마리입니다.` })}

<div class="btns mt8">
  ${btn('오늘 등원 현황판', { href: 'AT0101', cls: 'btn-ghost' })}
  ${btn('노쇼 처리', { href: 'AT0503', cls: 'btn-pri' })}
  ${btn('보호자 알림 발송 관리', { href: 'HL0401', cls: 'btn-sub' })}
</div>`;
  return { body, o: { now: 지금 } };
};

/* ---------- AT0104 백신 만료 경고 ---------- */
P['AT0104'] = (ctx) => {
  const 만료 = DOGS.filter((d) => d.vac === '만료');
  const 임박 = DOGS.filter((d) => d.vac === '임박');
  const 대상 = [...만료, ...임박];

  const body = `${leafHd(ctx, '이름 옆 표시를 누르면 백신 만료 대시보드로 갑니다')}

<div class="g3">
  ${stat('백신 만료', VAC_STAT.만료, { ico: '🔴', u: '마리', cls: 'dan', d: '등원 체크가 잠깁니다' })}
  ${stat('만료 임박', VAC_STAT.임박, { ico: '🟠', u: '마리', cls: 'warn', d: '30일 안에 만료돼요' })}
  ${stat('정상', VAC_STAT.정상, { ico: '🟢', u: '마리', cls: 'ok', d: `오늘 명단 ${VAC_STAT.전체}마리 기준 (전체 원생 ${ROSTER_TOTAL}마리)` })}
</div>

${banner('warn', '💉', `<b>🔴 만료 · 🟠 만료 임박 — 오늘 명단에서 ${대상.length}마리에 표시가 붙어 있습니다.</b>
  <div class="t-sub mt2">만료된 아이는 등원 체크 버튼 자체가 잠깁니다. 임박한 아이는 체크는 되지만
  보호자에게 재접종 안내가 함께 나갑니다. 종합백신(DHPPL)과 광견병 둘 다 유효기간 안이어야 합니다.</div>`, { cls: 'mt8 mb6' })}

${card('표시가 붙은 아이', `
  <div class="row wrap-row mb4">
    ${chips(['전체', '만료', '임박'], 0, { boxAttr: ' data-filter-for="vac"' })}
    <span class="t-sub"><b data-filter-cnt="vac">${대상.length}</b>마리가 보이고 있어요</span>
  </div>
  ${table(
    ['이름', '반', '견종·몸무게', { t: '백신 상태', cls: 'c' }, { t: '오늘 등원', cls: 'c' }, { t: '', cls: 'c' }],
    대상.map((d) => ({
      cls: d.vac === '만료' ? 'bad' : '',
      attr: ` data-tag="${d.vac}"`,
      cells: [
        { t: `<b>${esc(d.nm)}</b> ${d.vac === '만료' ? '🔴' : '🟠'}`, cls: 'nowrap' },
        esc(반이름(d)),
        `<span class="t-sub">${esc(d.breed)} · ${d.kg}kg</span>`,
        { t: vacBadge(d, { full: true }), cls: 'c nowrap' },
        { t: d.vac === '만료' ? '<span class="dan">체크 잠김</span>' : stBadge(d.st === '재원' ? '등원중' : (d.st === '대기' ? '예약' : d.st)), cls: 'c' },
        { t: btn('백신 대시보드', { href: 'HL0101', cls: 'btn-ghost', sm: true }), cls: 'c' },
      ],
    })),
    { attr: ' data-filter-list="vac"' },
  )}
  <div hidden data-empty-for="vac">${empty('💉', '고른 조건에 맞는 아이가 없어요', '위의 단추를 「전체」로 돌려 보세요.')}</div>`,
    { bdCls: 'pad0', cls: 'mb6' })}

${sec('오늘 나간 백신 안내', card('', table(
    ['보낸 때', '아이', '보호자', { t: '채널', cls: 'c' }, { t: '결과', cls: 'c' }, '보낸 말'],
    ALERTS.filter((a) => a.kind === '백신 만료').map((a) => ({
      cls: a.st === '실패' ? 'bad' : '',
      cells: [
        { t: esc(a.when), cls: 'nowrap' },
        { t: `<b>${esc(a.dog)}</b>`, cls: 'nowrap' },
        esc(a.guardian),
        { t: esc(a.ch), cls: 'c nowrap' },
        { t: stBadge(a.st), cls: 'c' },
        `<span class="t-sub">${esc(a.msg)}</span>`,
      ],
    })),
  ), { bdCls: 'pad0' }), { desc: '전달에 실패한 건은 보호자 알림 발송 관리에서 다시 보낼 수 있습니다.' })}

<div class="btns mt8">
  ${btn('오늘 등원 현황판', { href: 'AT0101', cls: 'btn-ghost' })}
  ${btn('백신 만료 잠금 화면', { href: 'AT0204', cls: 'btn-pri' })}
  ${btn('백신 만료 대시보드', { href: 'HL0101', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ============================================================
   AT0201 등원 체크 의 갈래들 — ★ 이 팩의 알맹이 ①
   ============================================================ */

/* ---------- ★ AT0202 등원 체크·회차권 차감 ----------
   글로만 적지 않는다. 위 명단의 [등원 체크]는 «진짜로» 눌린다 —
   누르면 시각이 적히고, 잔여 회차가 눈앞에서 1 줄고, 「등원 완료」 숫자가 는다. */
P['AT0202'] = (ctx) => {
  const 회차권아이 = 미체크.filter((d) => d.pass != null);
  const 요일권아이 = 미체크.filter((d) => d.pass == null);
  const 보기 = 재원.slice(0, 4);

  const body = `${leafHd(ctx, '체크 한 번이 시각 기록과 회차권 차감을 «함께» 합니다 — 아래에서 직접 눌러 보세요')}

<div class="g3">
  ${stat('아직 안 온 아이', `<span data-untick>${미체크.length}</span>`, { ico: '⏳', u: '마리', d: '<span data-untick-msg>등원 체크를 기다리고 있어요</span>' })}
  ${stat('등원 완료', TODAY_STAT.등원, { ico: '✅', u: '마리', cls: 'ok', numAttr: ' data-done-n', d: `오늘 예약 ${TODAY_STAT.예약}마리 중` })}
  ${stat('오늘 깎일 회차', 회차권아이.length, { ico: '🎟', u: '회', d: 요일권아이.length ? `회차권 ${회차권아이.length}마리 · 정기 요일권 ${요일권아이.length}마리는 차감 없음` : `아직 안 온 ${미체크.length}마리가 모두 회차권 이용자예요` })}
</div>

${banner('info', '🎟', `<b>[등원 체크]를 누르면 그 자리에서 세 가지가 함께 일어납니다.</b>
  <div class="t-sub mt2">① 지금 시각이 적히고 ② 그 아이의 회차권이 1회 깎이고 ③ 5분짜리 되돌리기가 뜹니다.
  ${요일권아이.length ? `정기 요일권으로 오는 ${esc(조사(요일권아이.map((d) => d.nm).join('·'), '는', '는'))} 회차가 깎이지 않습니다.` : ''}</div>`, { cls: 'mt8 mb6' })}

${card('① 아직 안 온 아이 — 여기서 눌러 보세요', 미체크.map((d) => checkRow(d, { mode: 'in' })).join(''), { bdCls: 'pad0' })}

${sec('② 누르고 나면 이렇게 남습니다', card('', 보기.map((d) => checkRow(d, { mode: 'in' })).join(''), { bdCls: 'pad0' }),
    { desc: `이미 등원한 ${TODAY_STAT.등원}마리 중 ${보기.length}마리만 보여 드립니다. 시각과 「회차권 1회 차감」이 한 줄에 함께 남습니다.` })}

${sec('회차권이 어떻게 깎이는지', card('', `
  ${table(
    ['이름', '반', { t: '예약', cls: 'c' }, { t: '지금 잔여', cls: 'c' }, { t: '체크하면', cls: 'c' }, { t: '차감 뒤', cls: 'c' }],
    미체크.map((d) => [
      { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
      esc(반이름(d)),
      { t: esc(d.want), cls: 'c nowrap' },
      { t: d.pass == null ? '<span class="muted">정기 요일권</span>' : `<b class="num">${d.pass}</b>회`, cls: 'c nowrap' },
      { t: d.pass == null ? '<span class="muted">차감 없음</span>' : '<span class="dan">−1회</span>', cls: 'c nowrap' },
      { t: d.pass == null ? '<span class="muted">—</span>' : `<b class="num">${d.pass - 1}</b>회`, cls: 'c nowrap' },
    ]),
    {
      foot: ['합계', '', '', { t: `${num(회차권아이.reduce((s, d) => s + d.pass, 0))}회`, cls: 'c' },
        { t: `−${회차권아이.length}회`, cls: 'c' },
        { t: `${num(회차권아이.reduce((s, d) => s + d.pass - 1, 0))}회`, cls: 'c' }],
    },
  )}`, { bdCls: 'pad0' }), { desc: '회차권을 다 쓴 아이는 등원 체크 전에 결제 안내가 먼저 뜹니다.' })}

${잠김.length ? banner('dan', '🔒', `<b>${esc(조사(잠김.map((d) => d.nm).join('·'), '은', '는'))} 백신이 만료돼 이 명단에서 체크할 수 없습니다.</b>
  <div class="t-sub mt2">원장 승인으로 오늘 하루만 열 수 있습니다.</div>`,
    { cls: 'mt6', right: btn('백신 만료 잠금 화면', { href: 'AT0204', cls: 'btn-dan', sm: true }) }) : ''}

<div class="btns mt8">
  ${btn('등원 체크', { href: 'AT0201', cls: 'btn-ghost' })}
  ${btn('되돌리기', { href: 'AT0203', cls: 'btn-ghost' })}
  ${btn('지각 표시', { href: 'AT0205', cls: 'btn-ghost' })}
  ${btn('오늘 등원 현황판', { href: 'AT0101', cls: 'btn-sub' })}
</div>`;
  /* 이 화면의 «지금»은 아침 09:34 다 — 09:00 예약 아이를 지금 누르면 「지각 34분」이 함께 붙는다 */
  return { body, o: { now: '09:34' } };
};

/* ---------- AT0203 되돌리기 ---------- */
P['AT0203'] = (ctx) => {
  const 예시 = 재원[0];
  const body = `${leafHd(ctx, '잘못 눌렀으면 5분 안에 되돌립니다 — 시각과 회차권이 함께 돌아옵니다')}

<div class="g3">
  ${stat('아직 안 온 아이', `<span data-untick>${미체크.length}</span>`, { ico: '⏳', u: '마리', d: '<span data-untick-msg>등원 체크를 기다리고 있어요</span>' })}
  ${stat('등원 완료', TODAY_STAT.등원, { ico: '✅', u: '마리', cls: 'ok', numAttr: ' data-done-n', d: '되돌리면 이 숫자도 함께 줄어요' })}
  ${stat('되돌릴 수 있는 시간', 5, { ico: '↩️', u: '분', cls: 'warn', d: '지나면 되돌리기 링크가 사라집니다' })}
</div>

${banner('info', '↩️', `<b>아래에서 [등원 체크]를 누른 다음, 바로 나타나는 [되돌리기]를 다시 눌러 보세요.</b>
  <div class="t-sub mt2">되돌리면 ① 적힌 시각이 지워지고 ② 깎였던 회차권이 되돌아오고 ③ 「등원 완료」 숫자가 원래대로 돌아갑니다.
  숫자만 되돌리는 게 아니라 그 줄이 통째로 «누르기 전»으로 돌아갑니다.</div>`, { cls: 'mt8 mb6' })}

${card('눌렀다가 되돌려 보세요', 미체크.map((d) => checkRow(d, { mode: 'in' })).join(''), { bdCls: 'pad0' })}

${sec('되돌리기가 사는 5분', `<div class="g2">
  <div class="box">
    ${timeline([
    { hh: '0:00', t: '등원 체크를 눌렀습니다', d: '시각이 적히고 회차권이 1회 깎입니다. 되돌리기가 5:00 부터 세기 시작해요.' },
    { hh: '0:00 ~ 5:00', t: '되돌릴 수 있는 동안', k: 'on', d: '[되돌리기]를 누르면 시각·회차권·완료 숫자가 모두 원래대로 돌아갑니다.' },
    { hh: '5:00', t: '되돌리기가 사라집니다', k: 'done', d: '이 뒤로는 원 관리자 화면에서 기록을 고쳐야 합니다.' },
  ])}
  </div>
  <div class="box">
    <div class="t-card mb3">5분이 지난 뒤의 줄</div>
    <p class="t-sub mb4">되돌리기 링크가 사라지고 시각과 차감 기록만 남습니다.</p>
    ${card('', checkRow(예시, { mode: 'in' }), { bdCls: 'pad0' })}
    <p class="t-sub mt4">${esc(조사(예시.nm, '이는', '는'))} ${esc(예시.inAt)}에 등원했고 회차권이 1회 깎였습니다.
    이 줄은 이제 되돌릴 수 없습니다.</p>
  </div>
</div>`)}

${banner('warn', '⏱', `<b>5분이 지난 뒤에 잘못을 발견했다면 원 관리자에서 고칩니다.</b>
  <div class="t-sub mt2">기록을 고치면 보호자에게도 「회차권을 돌려드렸어요」 안내가 나갑니다. 원장 계정만 할 수 있습니다.</div>`,
    { cls: 'mt6', right: btn('원 관리자', { href: 'MG0101', cls: 'btn-ghost', sm: true }) })}

<div class="btns mt8">
  ${btn('등원 체크', { href: 'AT0201', cls: 'btn-ghost' })}
  ${btn('등원 체크·회차권 차감', { href: 'AT0202', cls: 'btn-pri' })}
</div>`;
  return { body, o: { now: '09:34' } };
};

/* ---------- ★ AT0204 백신 만료 잠금 ----------
   ⛔ 잠긴 버튼에도 data-checkin 손잡이가 «그대로» 붙어 있어야 한다.
      없으면 원장 승인으로 잠금을 풀어도 버튼이 여전히 안 먹는다(2026-08-25 디럭스 사고).
      ui.mjs 의 checkRow() 잠김 갈래를 그대로 쓰면 이미 그렇게 돼 있다. */
P['AT0204'] = (ctx) => {
  const 만료 = DOGS.filter((d) => d.vac === '만료');
  const 임박 = DOGS.filter((d) => d.vac === '임박');
  const 안내 = ALERTS.filter((a) => a.kind === '백신 만료');

  const body = `${leafHd(ctx, '백신이 만료된 아이는 등원 체크 버튼 자체가 잠깁니다 — 원장 승인으로만 열립니다')}

<div class="g3">
  ${stat('체크가 잠긴 아이', 만료.length, { ico: '🔒', u: '마리', cls: 'dan', d: `오늘 명단 ${TODAY_STAT.예약}마리 중` })}
  ${stat('만료 임박', 임박.length, { ico: '🟠', u: '마리', cls: 'warn', d: '체크는 되지만 재접종 안내가 함께 나갑니다' })}
  ${stat('오늘 나간 안내', 안내.length, { ico: '📨', u: '건', d: `전달 실패 ${안내.filter((a) => a.st === '실패').length}건` })}
</div>

${banner('dan', '🔒', `<b>${만료.map((d) => `${esc(d.nm)}(${Math.abs(d.vacD)}일 지남)`).join(' · ')} — 종합백신이 만료됐습니다.</b>
  <div class="t-sub mt2">만료된 날부터 등원이 제한됩니다. 재접종 증명서가 올라오면 저절로 풀립니다.
  오늘 하루만 받아야 할 사정이 있으면 <b>[원장 승인으로 풀기]</b>를 누르세요 — 왜 열었는지가 기록에 남습니다.</div>`, { cls: 'mt8 mb6' })}

${card('잠긴 줄 — [원장 승인으로 풀기]를 눌러 보세요', 만료.map((d) => checkRow(d, { mode: 'in' })).join(''), { bdCls: 'pad0' })}

${banner('info', '🔑', `<b>승인하면 그 줄이 이렇게 바뀝니다.</b>
  <div class="t-sub mt2">① 회색이던 [등원 체크]가 눌리게 열리고 ② 「백신 확인이 필요해요」가
  「원장 승인으로 오늘 하루만 열림」으로 바뀌고 ③ 보호자에게 재접종 안내가 나갑니다.
  열린 버튼은 여느 줄과 똑같이 시각을 적고 회차권을 1회 깎습니다.</div>`, { cls: 'mt6 mb6' })}

${sec('만료 임박 — 잠기지는 않습니다', card('', table(
    ['이름', '반', { t: '백신', cls: 'c' }, { t: '오늘', cls: 'c' }, { t: '회차권', cls: 'c' }],
    임박.map((d) => [
      { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
      esc(반이름(d)),
      { t: vacBadge(d, { full: true }), cls: 'c nowrap' },
      { t: stBadge(d.st === '재원' ? '등원중' : (d.st === '결석' ? '결석' : '예약')), cls: 'c' },
      { t: d.pass == null ? '<span class="muted">정기 요일권</span>' : `잔여 <b class="num">${d.pass}</b>회`, cls: 'c nowrap' },
    ]),
  ), { bdCls: 'pad0' }), { desc: `만료까지 30일 안으로 들어온 ${임박.length}마리입니다. 등원은 되지만 안내 문자가 함께 나갑니다.` })}

${sec('오늘 나간 백신 안내', card('', table(
    ['보낸 때', '아이', '보호자', { t: '채널', cls: 'c' }, { t: '결과', cls: 'c' }, '보낸 말'],
    안내.map((a) => ({
      cls: a.st === '실패' ? 'bad' : '',
      cells: [
        { t: esc(a.when), cls: 'nowrap' },
        { t: `<b>${esc(a.dog)}</b>`, cls: 'nowrap' },
        esc(a.guardian),
        { t: esc(a.ch), cls: 'c nowrap' },
        { t: stBadge(a.st), cls: 'c' },
        `<span class="t-sub">${esc(a.msg)}</span>`,
      ],
    })),
  ), { bdCls: 'pad0' }), { desc: '전달 실패는 다른 채널로 다시 보내야 합니다 — 보호자가 못 본 채로 등원할 수 있습니다.' })}

${sec('오늘의 원장 승인 기록', empty('🗂', '오늘은 아직 승인한 기록이 없어요',
    '위에서 [원장 승인으로 풀기]를 누르면 누가·언제·어느 아이를 열었는지 이 자리에 쌓입니다.'))}

<div class="btns mt8">
  ${btn('등원 체크', { href: 'AT0201', cls: 'btn-ghost' })}
  ${btn('백신 만료 경고', { href: 'AT0104', cls: 'btn-ghost' })}
  ${btn('백신 만료 대시보드', { href: 'HL0101', cls: 'btn-pri' })}
</div>`;
  return { body, o: { now: '09:34' } };
};

/* ---------- AT0205 지각 표시 ---------- */
P['AT0205'] = (ctx) => {
  const 지금 = '09:34';
  const 늦은아이 = 미체크.filter((d) => 분(지금) - 분(d.want) >= 15);
  const 아직아이 = 미체크.filter((d) => 분(지금) - 분(d.want) < 15);

  const body = `${leafHd(ctx, `예약 시간보다 15분 넘게 늦게 체크하면 「지각」 배지가 저절로 붙습니다 — 지금 ${지금}`)}

<div class="g3 mt6">
  ${stat('지금 시각', 지금, { ico: '🕐', d: `${esc(TODAY.label)} 아침` })}
  ${stat('지금 누르면 지각', 늦은아이.length, { ico: '🟡', u: '마리', cls: 'warn', d: `예약 시간이 ${지금} 기준 15분 넘게 지난 아이` })}
  ${stat('아직 지각 아님', 아직아이.length, { ico: '🟢', u: '마리', cls: 'ok', d: 아직아이.length ? `${아직아이.map((d) => `${esc(d.nm)} ${esc(d.want)} 예약`).join(' · ')}` : '해당 없음' })}
</div>

${banner('warn', '⏰', `<b>지각은 사람이 고르는 것이 아니라 «시각 차이»로 저절로 붙습니다.</b>
  <div class="t-sub mt2">아래에서 ${늦은아이.length ? `${늦은아이.map((d) => esc(d.nm)).join('·')} 줄의` : ''} [등원 체크]를 누르면
  「지각 ${분(지금) - 분(늦은아이.length ? 늦은아이[0].want : '09:00')}분」 배지가 시각 옆에 함께 붙습니다.
  ${아직아이.length ? `${esc(조사(아직아이.map((d) => d.nm).join('·'), '은', '는'))} ${esc(아직아이[0].want)} 예약이라 아직 지각이 아닙니다 — 배지가 붙지 않아요.` : ''}</div>`, { cls: 'mt8 mb6' })}

${card('눌러서 견줘 보세요', 미체크.map((d) => checkRow(d, { mode: 'in' })).join(''), { bdCls: 'pad0' })}

<div class="g3 mt6">
  ${stat('아직 안 온 아이', `<span data-untick>${미체크.length}</span>`, { ico: '⏳', u: '마리', d: '<span data-untick-msg>등원 체크를 기다리고 있어요</span>' })}
  ${stat('등원 완료', TODAY_STAT.등원, { ico: '✅', u: '마리', cls: 'ok', numAttr: ' data-done-n', d: `오늘 예약 ${TODAY_STAT.예약}마리 중` })}
  ${stat('지각으로 세는 기준', 15, { ico: '📏', u: '분', d: '예약 시각과 체크 시각의 차이' })}
</div>

${sec('보호자가 미리 알려 오신 지각', 지각목록.length ? card('', table(
    ['이름', '반', { t: '예약', cls: 'c' }, { t: '알려온 도착 예정', cls: 'c' }, { t: '차이', cls: 'c' }, { t: '', cls: 'c' }],
    지각목록.map((d) => [
      { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
      esc(반이름(d)),
      { t: esc(d.want), cls: 'c nowrap' },
      { t: `<b class="warn">${esc(d.eta)}</b>`, cls: 'c nowrap' },
      { t: badge(`${걸린(분(d.eta) - 분(d.want))} 늦음`, 'b-warn'), cls: 'c nowrap' },
      { t: btn('지각 예상 시간', { href: 'AT0504', cls: 'btn-ghost', sm: true }), cls: 'c' },
    ]),
  ), { bdCls: 'pad0' }) : empty('🕐', '미리 알려 오신 지각이 없어요', '오늘은 모두 예약 시간을 그대로 지키기로 하셨습니다.'),
    { desc: '미리 알려 주신 경우에는 지각으로 세지 않고 목록에만 올려 둡니다.' })}

${card('지각 사유 메모', `
  ${field('어느 아이', select(미체크.map((d) => `${d.nm} (${반이름(d)} · ${d.want} 예약)`), 0), { req: true })}
  ${field('사유 메모 (알림장에 함께 붙습니다)', textarea({ ph: '길이 많이 막혀 늦으셨다고 합니다. 아침 산책은 건너뛰고 바로 자유놀이로 붙였어요.' }))}
  ${check('보호자에게도 이 메모를 보냅니다', { on: true })}
  <div class="btns mt6">
    ${btn('메모 저장', { cls: 'btn-pri', attr: ' data-notify="지각 사유 메모를 저장했어요 — 오늘 알림장에 함께 붙습니다"' })}
    ${btn('결석으로 넘기기', { href: 'AT0501', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('등원 체크', { href: 'AT0201', cls: 'btn-ghost' })}
  ${btn('결석·지각 처리', { href: 'AT0501', cls: 'btn-sub' })}
</div>`;
  return { body, o: { now: 지금 } };
};

/* ============================================================
   AT0301 하원 체크 의 갈래들
   ============================================================ */

/* ---------- AT0302 인계 보호자 확인 ---------- */
P['AT0302'] = (ctx) => {
  const body = `${leafHd(ctx, '등록된 보호자가 맞는지 확인하고 보냅니다 — 안전상 가장 중요한 자리입니다')}

<div class="g3">
  ${stat('지금 재원 중', `<span data-instay>${재원.length}</span>`, { ico: '🏠', u: '마리', d: '아직 원에 있는 아이들' })}
  ${stat('하원 완료', 하원.length, { ico: '👋', u: '마리', cls: 'ok', d: '오늘 집에 간 아이들' })}
  ${stat('대리 하원', 0, { ico: '🪪', u: '건', d: '오늘은 아직 없습니다' })}
</div>

${banner('warn', '🔐', `<b>[하원 체크]를 누르면 먼저 «등록된 보호자가 맞는지» 묻습니다.</b>
  <div class="t-sub mt2">「본인이 오셨어요」를 고르면 바로 하원 처리되고, 「다른 분이 오셨어요」를 고르면
  오신 분의 이름과 관계를 적어야 합니다. 대리 하원은 기록에 따로 남고 보호자에게도 알림이 갑니다.
  이름을 적지 않으면 하원 처리가 멈춥니다 — 확인 없이 아이를 보내지 않습니다.</div>`, { cls: 'mt8 mb6' })}

${card('재원 중인 아이 — [하원 체크]를 눌러 보세요', 재원.map((d) => checkRow(d, { mode: 'out' })).join(''), { bdCls: 'pad0' })}

${sec('등록 보호자 대조표', card('', `
  <div class="row wrap-row mb4">
    ${chips(재원.map((d) => d.nm), -1, { boxAttr: ' data-multi data-pick-scope="out"' })}
  </div>
  <p class="hint"><b data-pick-out="out">0</b>마리를 골랐습니다. 여러 보호자가 함께 오셨을 때 한 번에 확인할 수 있어요.</p>
  <div class="btns mt4">
    ${btn('고른 아이 인계 확인', { cls: 'btn-pri', id: 'outBulk', off: true, attr: ' data-pick-btn="out" data-notify="고른 아이의 인계 보호자를 확인한 것으로 적었어요"' })}
  </div>
  <div class="mt6">${table(
    [{ t: '', w: '56px' }, '이름', '반', '등록 보호자', '연락처', { t: '등원', cls: 'c' }],
    재원.map((d) => [
      { t: dogPh(d.nm, 40), cls: 'nowrap' },
      { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
      esc(반이름(d)),
      esc(d.guardian),
      { t: esc(d.phone || '등록된 번호 없음'), cls: 'nowrap' },
      { t: `<b class="num">${esc(d.inAt)}</b>`, cls: 'c nowrap' },
    ]),
  )}</div>`), { desc: '보호자 사진은 반려견 등록 화면에서 올려 두면 이 표에 함께 뜹니다.' })}

${banner('info', '🪪', `<b>대리 하원으로 적는 것</b>
  <div class="t-sub mt2">오신 분의 이름과 아이와의 관계(가족·이웃·펫시터 등)를 적습니다.
  적힌 내용은 그날 기록과 알림장에 함께 남고, 등록 보호자에게 「○○ 님이 데려가셨어요」 알림이 갑니다.</div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('하원 체크', { href: 'AT0301', cls: 'btn-ghost' })}
  ${btn('재원 시간 자동 계산', { href: 'AT0303', cls: 'btn-ghost' })}
  ${btn('하원 후 알림장 연동', { href: 'AT0304', cls: 'btn-pri' })}
</div>`;
  return { body, o: { now: '17:48' } };
};

/* ---------- AT0303 재원 시간 자동 계산 ----------
   ⛔ 손으로 두 번 적지 않는다. data-stay(등원 시각) + data-stay-out 을 두면
      app.js 의 재원시계()가 지금 시각과의 «차이»를 1초마다 새로 적는다. */
P['AT0303'] = (ctx) => {
  const 저녁 = '17:48';                       /* 이 화면의 «지금» — 아래 o.now 와 같은 값을 쓴다 */
  const 확정 = 하원.map((d) => ({ d, 분수: 분(d.outAt) - 분(d.inAt) }));
  const 평균 = Math.round(확정.reduce((s, x) => s + x.분수, 0) / 확정.length);
  const 가장이른 = 재원.reduce((a, b) => (분(a.inAt) <= 분(b.inAt) ? a : b));
  /* 처음 그릴 때부터 맞는 값이 적혀 있어야 한다 — 그 뒤로는 app.js 의 재원시계가 1초마다 고친다 */
  const 지금까지 = (d) => 걸린(분(저녁) - 분(d.inAt));

  const body = `${leafHd(ctx, '등원 시각부터 저절로 세어 올립니다 — 하원 체크를 누르는 순간 그 값이 확정됩니다')}

<div class="g3">
  ${stat('가장 오래 있은 아이', `<span data-stay="${가장이른.inAt}"><span data-stay-out>${지금까지(가장이른)}</span></span>`, { ico: '⏱', d: `${esc(가장이른.nm)} · ${esc(가장이른.inAt)} 등원` })}
  ${stat('지금 재원 중', 재원.length, { ico: '🏠', u: '마리', d: '이 아이들의 시간이 지금도 늘어나고 있어요' })}
  ${stat('오늘 하원한 아이 평균', 걸린(평균), { ico: '📊', cls: 'ok', d: `${확정.map((x) => `${esc(x.d.nm)} ${걸린(x.분수)}`).join(' · ')}` })}
</div>

${banner('info', '⏱', `<b>재원 시간은 사람이 적는 값이 아닙니다.</b>
  <div class="t-sub mt2">등원 체크가 적어 둔 시각과 지금 시각의 차이를 화면이 1초마다 다시 셉니다.
  아래 표의 「재원 시간」 칸을 잠깐 보고 계시면 숫자가 늘어납니다.
  [하원 체크]를 누르면 그 순간의 값이 「오늘 재원 ○시간 ○분」으로 굳어 기록에 남습니다.</div>`, { cls: 'mt8 mb6' })}

${card('지금 재원 중인 아이 — 시간이 늘어나고 있어요', table(
    [{ t: '', w: '56px' }, '이름', '반', { t: '등원 시각', cls: 'c' }, { t: '재원 시간 (지금)', cls: 'c' }, { t: '하원 예정', cls: 'c' }],
    재원.map((d) => [
      { t: dogPh(d.nm, 40), cls: 'nowrap' },
      { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
      esc(반이름(d)),
      { t: `<b class="num">${esc(d.inAt)}</b>`, cls: 'c nowrap' },
      { t: `<span class="pc-pass" data-stay="${d.inAt}"><b data-stay-out>${지금까지(d)}</b></span>`, cls: 'c nowrap' },
      { t: '<span class="muted">18:00</span>', cls: 'c nowrap' },
    ]),
  ), { bdCls: 'pad0', cls: 'mb6' })}

${sec('눌러서 확정해 보세요', card('', 재원.slice(0, 3).map((d) => checkRow(d, { mode: 'out' })).join(''), { bdCls: 'pad0' }),
    { desc: '[하원 체크] → 인계 보호자 확인 → 그 자리에서 「오늘 재원 ○시간 ○분」이 굳습니다.' })}

${sec('오늘 확정된 재원 시간', card('', table(
    ['이름', '반', { t: '등원', cls: 'c' }, { t: '하원', cls: 'c' }, { t: '재원 시간', cls: 'c' }, { t: '알림장', cls: 'c' }],
    확정.map(({ d, 분수 }) => [
      { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
      esc(반이름(d)),
      { t: `<b class="num">${esc(d.inAt)}</b>`, cls: 'c nowrap' },
      { t: `<b class="num">${esc(d.outAt)}</b>`, cls: 'c nowrap' },
      { t: `<b>${걸린(분수)}</b>`, cls: 'c nowrap' },
      { t: badge('발송 대상', 'b-ok'), cls: 'c' },
    ]),
    { foot: ['평균', '', '', '', { t: 걸린(평균), cls: 'c' }, ''] },
  ), { bdCls: 'pad0' }), { desc: '야간 연장 돌봄은 18시 이후 1시간당 요금이 붙습니다 — 확정된 재원 시간으로 계산합니다.' })}

<div class="btns mt8">
  ${btn('하원 체크', { href: 'AT0301', cls: 'btn-ghost' })}
  ${btn('인계 보호자 확인', { href: 'AT0302', cls: 'btn-ghost' })}
  ${btn('하원 후 알림장 연동', { href: 'AT0304', cls: 'btn-pri' })}
</div>`;
  return { body, o: { now: 저녁 } };
};

/* ---------- AT0304 하원 후 알림장 연동 ---------- */
P['AT0304'] = (ctx) => {
  const 눌러볼것 = 재원.slice(0, 3);
  const body = `${leafHd(ctx, '하원 체크가 끝난 아이는 알림장 발송 대상에 저절로 올라갑니다')}

<div class="g3">
  ${stat('알림장 발송 대상', `<span data-note-target>${하원.length}</span>`, { ico: '📓', u: '마리', cls: 'warn', d: '하원 체크를 누를 때마다 늘어납니다' })}
  ${stat('오늘 등원한 아이', CAME.length, { ico: '🐾', u: '마리', d: `재원 ${재원.length} · 하원 ${하원.length}` })}
  ${stat('알림장 작성 상태', `${NOTE_CNT.작성완료}/${NOTE_CNT.전체}`, { ico: '✍️', cls: 'ok', d: `작성중 ${NOTE_CNT.작성중} · 미작성 ${NOTE_CNT.미작성}` })}
</div>

${banner('info', '📓', `<b>아래에서 [하원 체크]를 누르면 위의 「알림장 발송 대상」 숫자가 그 자리에서 늘어납니다.</b>
  <div class="t-sub mt2">손으로 목록에 옮겨 적지 않습니다. 하원한 아이는 그날 사진과 하루 일과가 이미 쌓여 있으므로
  알림장 작성 화면을 열면 등원·하원 시각과 반이 미리 채워져 있습니다.</div>`, { cls: 'mt8 mb6' })}

${card(`하원 완료 — 이미 대상에 올라간 ${하원.length}마리`, 하원.map((d) => checkRow(d, { mode: 'out' })).join(''), { bdCls: 'pad0', cls: 'mb6' })}

${card('아직 재원 중 — 눌러서 대상에 올려 보세요', 눌러볼것.map((d) => checkRow(d, { mode: 'out' })).join(''), { bdCls: 'pad0' })}

${sec('알림장이 이어받는 값', `<div class="g2">
  <div class="box">
    <div class="t-card mb3">하원 체크가 넘겨주는 것</div>
    ${kv([
    ['등원 시각', '체크한 그대로'],
    ['하원 시각', '체크한 그대로'],
    ['오늘 재원 시간', '두 시각의 차이로 계산'],
    ['반', '오늘 있던 반 (보드에서 옮겼으면 옮긴 반)'],
    ['담당 보육교사', '그 반 담당 선생님'],
    ['인계 보호자', '본인 / 대리 하원이면 오신 분'],
  ])}
  </div>
  <div class="box">
    <div class="t-card mb3">선생님이 채우는 것</div>
    ${kv([
    ['오늘 사진', '3장 이상 권합니다'],
    ['컨디션', '활발함 · 평온함 · 힘없음'],
    ['식사·배변·낮잠', '세 가지 상태'],
    ['하루 이야기', '즐겨쓰는 문장을 눌러 붙일 수 있어요'],
    ['확인해 주세요', '보호자가 집에서 살펴야 할 것'],
  ])}
    <div class="btns mt6">${btn('알림장 작성으로', { href: 'NW0101', cls: 'btn-pri', sm: true })}</div>
  </div>
</div>`)}

${banner('warn', '🕕', `<b>알림장은 보통 저녁 18시 30분에 카카오톡으로 나갑니다.</b>
  <div class="t-sub mt2">그 시각까지 미작성으로 남은 아이가 있으면 발송 관리 화면에 붉게 뜹니다.
  지금 미작성은 ${NOTE_CNT.미작성}마리입니다.</div>`,
    { cls: 'mt6', right: btn('알림장 발송 관리', { href: 'NW0301', cls: 'btn-ghost', sm: true }) })}

<div class="btns mt8">
  ${btn('하원 체크', { href: 'AT0301', cls: 'btn-ghost' })}
  ${btn('재원 시간 자동 계산', { href: 'AT0303', cls: 'btn-ghost' })}
  ${btn('알림장 작성', { href: 'NW0101', cls: 'btn-pri' })}
</div>`;
  return { body, o: { now: '17:48' } };
};

/* ============================================================
   AT0401 반 편성 보드 의 갈래들 — ★ 이 팩의 알맹이 ②
   ⚠ 반·정원·카드는 모두 CLASSES 와 inClass() 에서 나온다.
     그래서 칸 머리의 숫자와 카드 수가 어긋날 수 없다.
   ============================================================ */

/** 보드 아래에 붙는 «옮긴 아이» 알림 — 다섯 잎사귀가 같은 조각을 쓴다 */
const 보드알림 = `<div hidden data-board-msg class="mt6">
  ${banner('acc', '↔', `<b>자동 배정과 다르게 옮긴 아이</b><div class="t-sub mt2" data-board-list></div>
    <div class="t-sub mt2">저장하면 반이 바뀐 아이의 보호자에게 알림이 나갑니다.</div>`)}
</div>`;

/** 하단 고정 바 — 정원을 넘기면 app.js 가 이 저장 단추를 스스로 잠근다 */
const 보드바 = (왼쪽) => stickBar(
  `<div><div class="t-sub">옮긴 뒤 저장해야 반영됩니다</div><div class="t-card">${왼쪽}</div></div>`,
  `${btn('되돌리기', { cls: 'btn-ghost', attr: ' data-toast="새로고침하면 자동 배정 결과로 돌아갑니다"' })}
   ${btn('저장하고 보호자에게 알림', { cls: 'btn-pri', id: 'boardSave', attr: ' data-board-save' })}`,
);

/* ---------- ★ AT0402 카드 드래그 재배정 ---------- */
P['AT0402'] = (ctx) => {
  const body = `${leafHd(ctx, `카드를 끌어다 놓으면 «진짜로» 반이 바뀝니다 — 지금 원에 있는 ${재원.length}마리`)}

${banner('info', '🖐', `<b>옮기는 길이 둘입니다.</b>
  <div class="t-sub mt2">① 카드를 <b>끌어다</b> 다른 반 칸에 놓습니다 — 지나가는 동안 그 칸이 파랗게 켜집니다.
  ② 끌기가 어려우면 <b>카드를 한 번 누르고</b>(테두리가 켜집니다) <b>옮길 반의 빈 자리를 누르세요</b> — 같은 결과입니다.
  옮긴 카드는 주황 테두리가 남아 「자동 배정과 다르게 옮긴 아이」로 아래에 모입니다.</div>`, { cls: 'mb6' })}

<div class="g3 mb6">
  ${CLASSES.map((c) => stat(`${c.ico} ${c.nm}`, `${clsNow(c.id)}/${c.cap}`, {
    d: `${esc(c.kg)} · 남은 자리 ${c.cap - clsNow(c.id)}`,
    cls: clsNow(c.id) >= c.cap ? 'warn' : '',
  })).join('')}
</div>

${board()}
${보드알림}

${sec('옮기는 동안 화면이 하는 일', `<div class="g2">
  <div class="box">
    ${timeline([
    { hh: '①', t: '카드를 잡습니다', d: '카드를 누르거나 끌기 시작하면 그 카드에 파란 테두리가 생깁니다.' },
    { hh: '②', t: '지나가는 칸이 켜집니다', k: 'on', d: '놓을 수 있는 칸이 점선으로 둘러싸이며 옅게 칠해집니다 — 어디에 놓이는지 헷갈리지 않게.' },
    { hh: '③', t: '몸무게를 먼저 봅니다', d: '옮기려는 반의 몸무게 구간을 벗어나면 「몸무게 차이가 큽니다」를 먼저 묻습니다.' },
    { hh: '④', t: '왜 옮기는지 적습니다', d: '자동 배정과 다르므로 짧은 사유를 받습니다. 취소하면 카드는 제자리에 남습니다.' },
    { hh: '⑤', t: '인원이 다시 세어집니다', k: 'done', d: '두 칸의 머리 숫자가 함께 바뀌고, 정원을 넘긴 칸이 있으면 저장이 잠깁니다.' },
  ])}
  </div>
  <div class="box">
    <div class="t-card mb3">취소하고 되돌리는 길</div>
    ${kv([
    ['사유 창에서 취소', '카드가 옮겨지지 않고 원래 칸에 그대로 남습니다'],
    ['몸무게 확인에서 취소', '같습니다 — 옮기기 전 상태로 끝납니다'],
    ['잘못 옮겼을 때', '그 카드를 다시 원래 반으로 끌어다 놓으면 됩니다'],
    ['전부 되돌리기', '아래 [되돌리기] — 자동 배정 결과로 돌아갑니다'],
  ], { cls: 'left' })}
    <p class="t-sub mt4">저장하기 전까지는 아무것도 반영되지 않습니다. 보호자에게 알림이 나가는 것도 저장한 뒤입니다.</p>
  </div>
</div>`)}

<div class="btns mt8">
  ${btn('반 편성 보드', { href: 'AT0401', cls: 'btn-ghost' })}
  ${btn('정원 초과 차단', { href: 'AT0403', cls: 'btn-ghost' })}
  ${btn('재배정 사유 입력', { href: 'AT0404', cls: 'btn-ghost' })}
</div>`;
  return { body, o: { stick: 보드바('정원을 넘긴 반이 있으면 저장할 수 없어요') } };
};

/* ---------- ★ AT0403 정원 초과 차단 ---------- */
P['AT0403'] = (ctx) => {
  /* 어느 반이 가장 먼저 넘치나 — 남은 자리가 가장 적은 반을 «세어» 고른다 */
  const 빠듯한 = CLASSES.map((c) => ({ c, 남: c.cap - clsNow(c.id) })).sort((a, b) => a.남 - b.남)[0];
  const 넘기려면 = 빠듯한.남 + 1;

  const body = `${leafHd(ctx, '정원을 넘긴 칸은 머리가 붉어지고 저장이 잠깁니다 — 다른 아이를 먼저 옮겨야 합니다')}

${banner('warn', '🚧', `<b>${조사(빠듯한.c.nm, '은', '는')} 지금 ${clsNow(빠듯한.c.id)}/${빠듯한.c.cap} 이라 자리가 ${빠듯한.남}개 남았습니다.</b>
  <div class="t-sub mt2">여기로 <b>${넘기려면}마리</b>를 더 옮기면 ${clsNow(빠듯한.c.id) + 넘기려면}/${빠듯한.c.cap} 이 되어
  그 칸 머리가 붉게 바뀌고 아래 [저장]이 「정원을 넘긴 반이 있어요」로 잠깁니다. 직접 해 보세요 —
  그 뒤 한 마리를 도로 빼면 저장이 다시 열립니다.</div>`, { cls: 'mb6' })}

${card('반별 정원', table(
    ['반', '몸무게 구간', { t: '정원', cls: 'c' }, { t: '지금', cls: 'c' }, { t: '남은 자리', cls: 'c' }, { t: '', w: '220px' }],
    CLASSES.map((c) => ({
      cls: clsNow(c.id) > c.cap ? 'bad' : '',
      cells: [
        { t: `<b>${c.ico} ${esc(c.nm)}</b>`, cls: 'nowrap' },
        esc(c.kg),
        { t: `<b class="num">${c.cap}</b>`, cls: 'c nowrap' },
        { t: `<b class="num">${clsNow(c.id)}</b>`, cls: 'c nowrap' },
        { t: c.cap - clsNow(c.id) === 0 ? '<span class="dan">없음</span>' : `<b class="num">${c.cap - clsNow(c.id)}</b>`, cls: 'c nowrap' },
        progress(clsNow(c.id) / c.cap * 100, clsNow(c.id) >= c.cap ? 'dan' : (c.cap - clsNow(c.id) <= 2 ? 'warn' : '')),
      ],
    })),
    {
      foot: ['합계', '', { t: num(CLASSES.reduce((s, c) => s + c.cap, 0)), cls: 'c' },
        { t: num(CLASSES.reduce((s, c) => s + clsNow(c.id), 0)), cls: 'c' },
        { t: num(CLASSES.reduce((s, c) => s + c.cap - clsNow(c.id), 0)), cls: 'c' }, ''],
    },
  ), { cls: 'mb6' })}

${board()}
${보드알림}

${sec('정원을 넘겼을 때', `<div class="g2">
  <div class="box dan">
    <div class="t-card mb3">화면이 막는 것</div>
    ${kv([
    ['칸 머리', '숫자와 반 이름이 붉게 바뀝니다'],
    ['저장 단추', '눌리지 않게 잠기고 글자가 「정원을 넘긴 반이 있어요」로 바뀝니다'],
    ['보호자 알림', '저장이 안 되므로 나가지 않습니다'],
  ], { cls: 'left' })}
  </div>
  <div class="box">
    <div class="t-card mb3">푸는 길</div>
    <p class="t-sub">넘친 칸에서 아이 하나를 다른 반으로 옮기면 그 자리에서 잠금이 풀립니다.
    정원 자체를 늘려야 한다면 원 관리자의 반 배정 규칙에서 고칩니다 —
    다만 정원은 보육교사 한 사람이 볼 수 있는 수로 정해 둔 값이라 함부로 늘리지 않습니다.</p>
    <div class="btns mt6">${btn('반 배정 규칙 설정', { href: 'MG0201', cls: 'btn-sub', sm: true })}</div>
  </div>
</div>`)}

<div class="btns mt8">
  ${btn('반 편성 보드', { href: 'AT0401', cls: 'btn-ghost' })}
  ${btn('카드 드래그 재배정', { href: 'AT0402', cls: 'btn-ghost' })}
  ${btn('몸무게 차이 경고', { href: 'AT0405', cls: 'btn-ghost' })}
</div>`;
  return { body, o: { stick: 보드바('정원을 넘긴 반이 있으면 저장할 수 없어요') } };
};

/* ---------- AT0404 재배정 사유 입력 ----------
   ⛔ 브라우저 prompt 를 쓰지 않는다. 보드에서 카드를 옮기면 app.js 의 적어받기() 가
      「반 재배정 사유」 입력 창을 스스로 띄운다. */
P['AT0404'] = (ctx) => {
  const 이력 = ALERTS.filter((a) => a.kind === '반 변경');

  const body = `${leafHd(ctx, '자동 배정과 다르게 옮길 때는 짧은 사유를 남겨야 합니다 — 나중에 왜 그랬는지 알 수 있어야 하니까요')}

${banner('info', '✍️', `<b>보드에서 카드를 옮기면 「반 재배정 사유」 입력 창이 먼저 뜹니다.</b>
  <div class="t-sub mt2">사유를 적고 [확인]을 눌러야 카드가 실제로 옮겨집니다. [취소]하면 카드는 제자리에 남습니다.
  적은 사유는 아래 「옮긴 아이」 목록에 아이 이름과 함께 붙어 남고, 저장할 때 기록으로 넘어갑니다.</div>`, { cls: 'mb6' })}

${board()}
${보드알림}

${card('자주 쓰는 사유를 미리 골라 두기', `
  ${field('기본 사유', select(
    ['성향이 맞지 않아서', '몸무게가 경계에 걸쳐서', '보호자 요청', '보육교사 배치 사정', '적응 기간이라 잠깐', '직접 적기'],
    0,
    { attr: ' data-reveal-when="직접 적기" data-reveal-box="whyEtc"' },
  ), { hint: '고른 값이 사유 창에 미리 채워집니다. 「직접 적기」를 고르면 아래 칸이 나옵니다.' })}
  ${field('사유를 직접 적기', textarea({ ph: '오늘만 두유와 떨어뜨려 놓기로 했습니다. 내일은 원래 반으로 돌립니다.' }), { id: 'whyEtc', hide: true })}
  ${check('사유를 보호자에게도 함께 보냅니다', { on: true, sub: '끄면 「반이 바뀌었어요」만 나가고 이유는 원 안에만 남습니다' })}
  <div class="btns mt6">
    ${btn('기본 사유 저장', { cls: 'btn-pri', attr: ' data-notify="기본 사유를 저장했어요 — 다음부터 사유 창에 미리 채워집니다"' })}
  </div>`, { cls: 'mt6 mb6' })}

${sec('지난 반 변경 알림 이력', 이력.length ? card('', table(
    ['보낸 때', '아이', '보호자', { t: '채널', cls: 'c' }, { t: '결과', cls: 'c' }, '보낸 말'],
    이력.map((a) => ({
      cls: a.st === '실패' ? 'bad' : '',
      cells: [
        { t: esc(a.when), cls: 'nowrap' },
        { t: `<b>${esc(a.dog)}</b>`, cls: 'nowrap' },
        esc(a.guardian),
        { t: esc(a.ch), cls: 'c nowrap' },
        { t: stBadge(a.st), cls: 'c' },
        `<span class="t-sub">${esc(a.msg)}</span>`,
      ],
    })),
  ), { bdCls: 'pad0' }) : empty('🗂', '지난 반 변경이 없어요', '보드에서 옮기고 저장하면 여기에 쌓입니다.'),
    { desc: '보호자에게 나간 문구만 여기 남습니다. 적어 둔 사유는 원 안에서만 보이고 밖으로 나가지 않습니다.' })}

<div class="btns mt8">
  ${btn('반 편성 보드', { href: 'AT0401', cls: 'btn-ghost' })}
  ${btn('카드 드래그 재배정', { href: 'AT0402', cls: 'btn-ghost' })}
  ${btn('저장 후 보호자 알림', { href: 'AT0406', cls: 'btn-pri' })}
</div>`;
  return { body, o: { stick: 보드바('사유를 적지 않으면 카드가 옮겨지지 않아요') } };
};

/* ---------- AT0405 몸무게 차이 경고 ----------
   경계값은 지어내지 않는다 — CLASSES 의 kgMin·kgMax 를 그대로 읽는다. */
P['AT0405'] = (ctx) => {
  const 벗어난 = 재원.filter((d) => {
    const c = CLS(d.cls);
    return d.kg < c.kgMin || d.kg > c.kgMax;
  });
  const 반별 = CLASSES.map((c) => {
    const 목록 = 재원.filter((d) => d.cls === c.id);
    const kgs = 목록.map((d) => d.kg);
    return { c, 목록, 가장가벼운: Math.min(...kgs), 가장무거운: Math.max(...kgs) };
  }).filter((x) => x.목록.length);

  const body = `${leafHd(ctx, '큰 아이와 작은 아이를 같이 두지 않습니다 — 경계를 넘기면 옮기기 전에 먼저 묻습니다')}

${banner('warn', '⚖️', `<b>몸무게 구간을 벗어난 반으로 옮기려 하면 「몸무게 차이 확인」이 먼저 뜹니다.</b>
  <div class="t-sub mt2">예를 들어 대형반의 ${esc(반별[반별.length - 1].목록.reduce((a, b) => (a.kg >= b.kg ? a : b)).nm)}(${반별[반별.length - 1].목록.reduce((a, b) => (a.kg >= b.kg ? a : b)).kg}kg)를
  소형반(${CLASSES[0].kgMin}~${CLASSES[0].kgMax}kg) 칸으로 끌면 「큰 아이를 작은 아이들과 같이 두게 됩니다. 그래도 옮길까요?」를 묻습니다.
  [옮기기]를 고르면 사유를 적고 옮기고, [취소]하면 카드는 제자리에 남습니다.</div>`, { cls: 'mb6' })}

${card('반별 몸무게 경계 — 지어낸 값이 아니라 반 설정에서 읽습니다', table(
    ['반', '몸무게 구간', { t: '지금 인원', cls: 'c' }, { t: '가장 가벼운', cls: 'c' }, { t: '가장 무거운', cls: 'c' }, { t: '반 안 차이', cls: 'c' }],
    반별.map(({ c, 목록, 가장가벼운, 가장무거운 }) => [
      { t: `<b>${c.ico} ${esc(c.nm)}</b>`, cls: 'nowrap' },
      `${c.kgMax === 99 ? `${c.kgMin}kg 이상` : `${c.kgMin} ~ ${c.kgMax}kg`}`,
      { t: `<b class="num">${목록.length}</b>마리`, cls: 'c nowrap' },
      { t: `${가장가벼운}kg`, cls: 'c nowrap' },
      { t: `${가장무거운}kg`, cls: 'c nowrap' },
      { t: `<b>${Math.round((가장무거운 - 가장가벼운) * 10) / 10}kg</b>`, cls: 'c nowrap' },
    ]),
  ), { cls: 'mb6' })}

${벗어난.length
    ? banner('dan', '⚠️', `<b>지금 경계를 벗어난 자리에 있는 아이가 ${벗어난.length}마리 있습니다.</b>
      <div class="t-sub mt2">${벗어난.map((d) => `${esc(d.nm)} ${d.kg}kg — ${esc(반이름(d))}`).join(' · ')}</div>`, { cls: 'mb6' })
    : banner('ok', '✅', `<b>지금은 경계를 벗어난 자리에 있는 아이가 없습니다.</b>
      <div class="t-sub mt2">재원 중인 ${재원.length}마리가 모두 제 몸무게 구간의 반에 있습니다.
      아래 보드에서 일부러 다른 반으로 끌어다 놓으면 경고가 어떻게 뜨는지 볼 수 있어요.</div>`, { cls: 'mb6' })}

${board()}
${보드알림}

${card('견줘 볼 아이 고르기', `
  <div class="chips" data-multi data-pick-scope="kg">
    ${재원.map((d) => `<button class="chip" type="button">${esc(d.nm)} <span class="x">${d.kg}kg</span></button>`).join('')}
  </div>
  <p class="hint mt3"><b data-pick-out="kg">0</b>마리를 골랐습니다. 두 마리 이상 고르면 몸무게 차이를 견줘 볼 수 있어요.</p>
  <div class="btns mt4">
    ${btn('고른 아이 몸무게 차이 보기', { cls: 'btn-pri', id: 'kgBtn', off: true, attr: ' data-pick-btn="kg" data-notify="고른 아이들의 몸무게 차이를 계산했어요 — 8kg 이상 벌어지면 같은 반을 권하지 않습니다"' })}
  </div>`, { cls: 'mt6 mb6' })}

${banner('info', '📏', `<b>왜 몸무게로 나누나요?</b>
  <div class="t-sub mt2">놀이 중 부딪히는 힘이 몸무게에 그대로 비례하기 때문입니다.
  ${CLASSES.map((c) => `${c.nm} ${c.kgMax === 99 ? `${c.kgMin}kg 이상` : `${c.kgMin}~${c.kgMax}kg`}`).join(' · ')} —
  첫 등원 날 30분 적응 테스트로 성향을 함께 봅니다. 반별 놀이 공간은 벽으로 나뉘어 있습니다.</div>`)}

<div class="btns mt8">
  ${btn('반 편성 보드', { href: 'AT0401', cls: 'btn-ghost' })}
  ${btn('정원 초과 차단', { href: 'AT0403', cls: 'btn-ghost' })}
  ${btn('반 배정 규칙 설정', { href: 'MG0201', cls: 'btn-sub' })}
</div>`;
  return { body, o: { stick: 보드바('몸무게 구간을 벗어나면 옮기기 전에 먼저 묻습니다') } };
};

/* ---------- AT0406 저장 후 보호자 알림 ---------- */
P['AT0406'] = (ctx) => {
  const 이력 = ALERTS.filter((a) => a.kind === '반 변경');

  const body = `${leafHd(ctx, '저장하면 반이 바뀐 아이의 보호자에게만 알림이 나갑니다 — 안 바뀐 아이에게는 가지 않습니다')}

${banner('info', '📨', `<b>보드에서 카드를 옮긴 다음 아래 [저장하고 보호자에게 알림]을 눌러 보세요.</b>
  <div class="t-sub mt2">옮긴 아이가 없으면 「옮긴 아이가 없어요」라고 답합니다.
  옮긴 아이가 있으면 몇 마리의 보호자에게 알림을 보냈는지 숫자로 알려 주고, 카드의 주황 표시가 지워집니다.
  저장하기 전에는 아무 알림도 나가지 않습니다.</div>`, { cls: 'mb6' })}

${board()}
${보드알림}

${sec('나가는 알림 문구', `<div class="g2">
  <div class="box">
    <div class="t-card mb3">보호자가 받는 말</div>
    ${이력.length ? `<p class="t-sub" style="line-height:var(--lh-body)">「${esc(이력[0].msg)}」</p>` : ''}
    <p class="t-sub mt4">아이 이름과 «어느 반에서 어느 반으로» 바뀌었는지만 적습니다.
    원 안에서 적은 재배정 사유는 「사유를 보호자에게도 함께 보냅니다」를 켜 두었을 때만 붙습니다.</p>
    <div class="btns mt6">${btn('사유 함께 보내기 설정', { href: 'AT0404', cls: 'btn-ghost', sm: true })}</div>
  </div>
  <div class="box">
    <div class="t-card mb3">보내는 차례</div>
    ${timeline([
    { hh: '①', t: '카카오톡 채널', d: '가장 먼저 보냅니다. 대부분 여기서 읽습니다.' },
    { hh: '②', t: '앱 푸시', d: '카카오톡을 받지 않기로 하신 보호자에게 갑니다.' },
    { hh: '③', t: '문자', d: '앞의 둘이 모두 실패했을 때 마지막으로 보냅니다.', k: 'done' },
  ])}
    <p class="t-sub mt4">세 갈래가 모두 실패하면 보호자 알림 발송 관리에 붉게 남습니다 — 전화로 알려 드려야 합니다.</p>
  </div>
</div>`)}

${sec('지난 반 변경 알림 결과', 이력.length ? card('', table(
    ['보낸 때', '아이', '보호자', { t: '채널', cls: 'c' }, { t: '결과', cls: 'c' }, { t: '', cls: 'c' }],
    이력.map((a) => ({
      cls: a.st === '실패' ? 'bad' : '',
      cells: [
        { t: esc(a.when), cls: 'nowrap' },
        { t: `<b>${esc(a.dog)}</b>`, cls: 'nowrap' },
        esc(a.guardian),
        { t: esc(a.ch), cls: 'c nowrap' },
        { t: stBadge(a.st), cls: 'c' },
        {
          t: a.st === '실패'
            ? btn('다시 보내기', { cls: 'btn-pri', sm: true, attr: ` data-notify="${esc(a.guardian)} 님께 다른 채널로 다시 보냈어요"` })
            : '<span class="muted">—</span>',
          cls: 'c',
        },
      ],
    })),
    { foot: ['합계', `${이력.length}건`, '', '', { t: `실패 ${이력.filter((a) => a.st === '실패').length}건`, cls: 'c' }, ''] },
  ), { bdCls: 'pad0' }) : empty('📨', '보낸 알림이 없어요', '보드에서 옮기고 저장하면 여기에 쌓입니다.'))}

<div class="btns mt8">
  ${btn('반 편성 보드', { href: 'AT0401', cls: 'btn-ghost' })}
  ${btn('재배정 사유 입력', { href: 'AT0404', cls: 'btn-ghost' })}
  ${btn('보호자 알림 발송 관리', { href: 'HL0401', cls: 'btn-sub' })}
</div>`;
  return { body, o: { stick: 보드바('옮긴 아이의 보호자에게만 알림이 나갑니다') } };
};

/* ============================================================
   AT0501 결석·지각 처리 의 갈래들
   ============================================================ */

/* ---------- AT0502 사전·당일 통보 구분 ---------- */
P['AT0502'] = (ctx) => {
  const 고를것 = [...결석, ...미등원, ...지각목록];
  const 사전 = 결석.filter((d) => d.absKind === '사전 통보');
  const 당일 = 결석.filter((d) => d.absKind === '당일 통보');

  const body = `${leafHd(ctx, '회차권을 깎느냐 마느냐가 «언제 알려 오셨는지»로 갈립니다')}

<div class="g3">
  ${stat('사전 통보', 사전.length, { ico: '🟢', u: '마리', cls: 'ok', d: '전날까지 알려 오심 · 차감 없음' })}
  ${stat('당일 통보', 당일.length, { ico: '🟡', u: '마리', cls: 'warn', d: '오늘 아침에 알려 오심 · 1회 차감' })}
  ${stat('처리할 아이', 고를것.length, { ico: '📋', u: '마리', d: `결석 ${결석.length} · 미등원 ${미등원.length} · 지각 ${지각목록.length}` })}
</div>

${card('① 처리할 아이 고르기', `
  <div class="chips" data-multi data-pick-scope="abs">
    ${고를것.map((d) => `<button class="chip" type="button">${esc(d.nm)} <span class="x">${esc(반이름(d))}</span></button>`).join('')}
  </div>
  <p class="hint mt3"><b data-pick-out="abs">0</b>마리를 골랐습니다. 한 번에 여러 마리를 같은 통보 시점으로 처리할 수 있어요.</p>`,
    { cls: 'mt8 mb6' })}

${card('② 통보 시점 고르기 — 고르면 아래 규정 문구가 바뀝니다', `
  ${field('언제 알려 오셨나요', select(
    ['사전 통보 (전날까지 알려 오심)', '당일 통보 (오늘 아침에 알려 오심)'],
    0,
    { attr: ' data-reveal-when="당일 통보 (오늘 아침에 알려 오심)" data-reveal-box="cutBox"' },
  ), { req: true })}

  ${banner('ok', '🎟', `<b>사전 통보 — 회차권을 깎지 않습니다.</b>
    <div class="t-sub mt2">전날까지 알려 주시면 그 자리를 다른 아이에게 내어 줄 수 있어 손해가 없습니다.
    보호자에게는 「오늘 결석으로 처리했어요. 회차권은 차감되지 않습니다」라고 나갑니다.</div>`, { cls: 'mt4' })}

  <div id="cutBox" hidden class="mt4">
    ${banner('dan', '🎟', `<b>당일 통보 — 회차권이 1회 차감됩니다.</b>
      <div class="t-sub mt2">오늘 아침에 알려 주시면 이미 그 아이 자리를 비워 둔 뒤라 1회 차감합니다.
      보호자에게는 「오늘 결석으로 처리했어요. 회차권 1회가 차감됩니다」라고 나갑니다.
      정기 요일권으로 오는 아이는 차감 대상이 아닙니다.</div>`)}
  </div>

  ${field('보호자에게 보낼 말', textarea({ ph: '오늘 결석으로 처리했어요. 다음 등원 때 뵙겠습니다.' }), { cls: 'mt4' })}`,
    { cls: 'mb6' })}

${card('③ 확정 전 요약', `
  ${kv([
    ['고른 아이', '<b data-pick-out="abs">0</b>마리'],
    ['통보 시점', '위에서 고른 값으로 처리됩니다'],
    ['회차권', '사전 통보는 차감 없음 · 당일 통보는 1회 차감'],
    ['보호자 알림', '처리와 동시에 카카오톡으로 나갑니다'],
  ])}
  <div class="btns mt6">
    ${btn('결석 처리하고 보호자에게 알림', { cls: 'btn-pri', id: 'absConfirm', off: true, attr: ' data-pick-btn="abs" data-notify="결석으로 처리했어요 — 보호자에게 알림을 보냈습니다"' })}
    ${btn('노쇼로 넘기기', { href: 'AT0503', cls: 'btn-ghost' })}
  </div>
  <p class="t-sub mt3">아이를 하나도 고르지 않으면 위 단추가 눌리지 않습니다 — 빈 채로 알림이 나가는 사고를 막습니다.</p>`)}

${sec('오늘 결석 명단', card('', table(
    ['이름', '반', { t: '통보 시점', cls: 'c' }, { t: '회차권', cls: 'c' }, { t: '지금 잔여', cls: 'c' }, { t: '처리 뒤', cls: 'c' }],
    결석.map((d) => [
      { t: `<b>${esc(d.nm)}</b>`, cls: 'nowrap' },
      esc(반이름(d)),
      { t: badge(d.absKind, d.absKind === '사전 통보' ? 'b-ok' : 'b-warn'), cls: 'c nowrap' },
      { t: d.absKind === '사전 통보' ? '<span class="ok">차감 안 함</span>' : '<span class="dan">1회 차감</span>', cls: 'c nowrap' },
      { t: d.pass == null ? '<span class="muted">정기 요일권</span>' : `<b class="num">${d.pass}</b>회`, cls: 'c nowrap' },
      { t: d.pass == null ? '<span class="muted">—</span>' : `<b class="num">${d.absKind === '사전 통보' ? d.pass : d.pass - 1}</b>회`, cls: 'c nowrap' },
    ]),
  ), { bdCls: 'pad0' }), { desc: `사전 통보 ${사전.length}마리는 그대로, 당일 통보 ${당일.length}마리는 1회씩 깎입니다 — 오늘 깎이는 회차는 모두 ${당일.filter((d) => d.pass != null).length}회입니다.` })}

<div class="btns mt8">
  ${btn('결석·지각 처리', { href: 'AT0501', cls: 'btn-ghost' })}
  ${btn('노쇼 처리', { href: 'AT0503', cls: 'btn-ghost' })}
  ${btn('보호자 알림 발송 관리', { href: 'HL0401', cls: 'btn-sub' })}
</div>`;
  return { body, o: {} };
};

/* ---------- AT0503 노쇼 처리 ---------- */
P['AT0503'] = (ctx) => {
  const 지금 = '09:40';
  /* 누적 횟수 — 오늘 한 번 + 지난 결석 알림 이력을 «세어» 만든다. 손으로 적지 않는다. */
  const 누적 = (d) => 1 + ALERTS.filter((a) => a.kind === '결석' && a.dog === d.nm && !a.when.startsWith('08-24')).length;
  const 한도 = 3;

  const body = `${leafHd(ctx, `연락 없이 안 온 아이입니다 — ${지금} 기준 ${미등원.length}마리`)}

<div class="g3">
  ${stat('오늘 노쇼', 미등원.length, { ico: '🚫', u: '마리', cls: 'dan', d: '예약 시간이 지났는데 연락이 없어요' })}
  ${stat('회차권 차감', 미등원.filter((d) => d.pass != null).length, { ico: '🎟', u: '회', cls: 'warn', d: '노쇼는 당일 통보와 같이 1회 차감합니다' })}
  ${stat('원장 알림 기준', 한도, { ico: '🔔', u: '회', d: `노쇼가 ${한도}번 쌓이면 원장에게 알림이 갑니다` })}
</div>

${banner('dan', '🚫', `<b>노쇼는 결석과 다릅니다 — 먼저 연락을 시도하고, 그래도 닿지 않을 때 처리합니다.</b>
  <div class="t-sub mt2">아이가 집에서 아픈 것일 수도 있어 바로 처리하지 않습니다.
  전화 → 문자 → 카카오톡 차례로 시도한 기록을 남기고, 그날 안에 답이 없으면 노쇼로 확정합니다.
  확정하면 회차권 1회가 깎이고 누적 횟수가 하나 올라갑니다.</div>`, { cls: 'mt8 mb6' })}

${미등원.map((d) => {
    const 이력 = 오늘알림(d.nm);
    const n = 누적(d);
    return `<div class="rowcard bad mb3">
      <div class="thumb">${dogPh(d.nm, 96)}</div>
      <div class="bd">
        <div class="row wrap-row">${badge('노쇼', 'b-dan')}${badge(esc(반이름(d)), 'b-line')}${badge(`${걸린(분(지금) - 분(d.want))} 지남`, 'b-warn')}</div>
        <div class="t-card mt2">${esc(d.nm)} — ${esc(d.want)} 예약, ${지금}까지 연락 없음</div>
        <div class="t-sub mt1">보호자 ${esc(d.guardian)} · ${esc(d.phone || '등록된 번호 없음')} ·
          회차권 ${d.pass == null ? '정기 요일권 (차감 없음)' : `잔여 ${d.pass}회 → 처리하면 ${d.pass - 1}회`}</div>
        <div class="t-sub mt3">연락 시도 —
          ${이력.length ? 이력.map((a) => `${esc(a.when.slice(6))} ${esc(a.ch)} <b>${esc(a.st)}</b>`).join(' / ') : '<span class="dan">아직 없음</span>'}</div>
        <div class="mt3" style="max-width:320px">
          ${progress(n / 한도 * 100, n >= 한도 ? 'dan' : 'warn')}
          <div class="t-sub mt2">노쇼 누적 <b>${n}</b>회 / ${한도}회 ${n >= 한도 ? '— 원장에게 알림이 갑니다' : `— ${한도 - n}번 더 쌓이면 원장에게 알림이 갑니다`}</div>
        </div>
      </div>
      <div class="side btns-v">
        ${btn('전화 걸기', { cls: 'btn-pri', sm: true, attr: ` data-notify="${esc(d.guardian)} 님께 전화를 겁니다 (${esc(d.phone || '번호 없음')})"` })}
        ${btn('연락 시도 기록', { cls: 'btn-ghost', sm: true, attr: ` data-notify="${esc(d.nm)} — ${지금}에 연락을 시도한 것으로 적었어요"` })}
        ${btn('노쇼로 확정', { cls: 'btn-dan', sm: true, attr: ` data-notify="${esc(조사(d.nm, '을', '를'))} 노쇼로 확정했어요 — 회차권 1회가 깎이고 누적 ${n}회가 됩니다" data-notify-once="노쇼로 확정됨"` })}
      </div>
    </div>`;
  }).join('')}

${sec('오늘 나간 결석 알림', card('', table(
    ['보낸 때', '아이', '보호자', { t: '채널', cls: 'c' }, { t: '결과', cls: 'c' }, '보낸 말'],
    ALERTS.filter((a) => a.kind === '결석').map((a) => ({
      cls: a.st === '실패' ? 'bad' : '',
      cells: [
        { t: esc(a.when), cls: 'nowrap' },
        { t: `<b>${esc(a.dog)}</b>`, cls: 'nowrap' },
        esc(a.guardian),
        { t: esc(a.ch), cls: 'c nowrap' },
        { t: stBadge(a.st), cls: 'c' },
        `<span class="t-sub">${esc(a.msg)}</span>`,
      ],
    })),
  ), { bdCls: 'pad0' }), { desc: '노쇼로 확정하기 전에 보낸 안내도 여기 함께 남습니다.' })}

${banner('warn', '🔔', `<b>노쇼가 ${한도}번 쌓이면 어떻게 되나요?</b>
  <div class="t-sub mt2">원장에게 알림이 가고, 보호자와 한 번 이야기를 나눕니다.
  아이가 아픈 사정이었다면 누적을 지워 드립니다. 반복되면 정기 등원 요일을 다시 잡자고 권합니다 —
  자리를 비워 두는 동안 다른 아이가 못 오기 때문입니다.</div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('결석·지각 처리', { href: 'AT0501', cls: 'btn-ghost' })}
  ${btn('사전·당일 통보 구분', { href: 'AT0502', cls: 'btn-ghost' })}
  ${btn('미등원 강조', { href: 'AT0103', cls: 'btn-sub' })}
</div>`;
  return { body, o: { now: 지금 } };
};

/* ---------- AT0504 지각 예상 시간 ---------- */
P['AT0504'] = (ctx) => {
  const 지금 = '10:35';
  const 목록 = 지각목록.map((d) => ({
    d,
    늦음: 분(d.eta) - 분(d.want),
    지남: 분(지금) - 분(d.eta),
  }));
  /* 다시 잡는 시각은 «지금 뒤»만 고를 수 있어야 한다 — 지금에서 15분씩 더해 만든다 */
  const 새예정 = [1, 2, 3, 4].map((k) => {
    const t = 분(지금) + k * 15;
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  });

  const body = `${leafHd(ctx, `보호자가 알려 오신 도착 예정 시간입니다 — 지금 ${지금}, 예정 시간이 지나면 다시 여쭙습니다`)}

<div class="g3">
  ${stat('지금 시각', 지금, { ico: '🕐', d: esc(TODAY.label) })}
  ${stat('알려 오신 지각', 목록.length, { ico: '🟡', u: '마리', cls: 'warn', d: 목록.map((x) => `${esc(x.d.nm)} ${esc(x.d.eta)} 예정`).join(' · ') })}
  ${stat('예정 시간을 넘긴 아이', 목록.filter((x) => x.지남 > 0).length, { ico: '🔔', u: '마리', cls: 'dan', d: '재확인 알림을 보낼 때입니다' })}
</div>

${목록.map(({ d, 늦음, 지남 }) => `<div class="rowcard ${지남 > 0 ? 'bad' : ''} mt8">
  <div class="thumb">${dogPh(d.nm, 96)}</div>
  <div class="bd">
    <div class="row wrap-row">${stBadge('지각')}${badge(esc(반이름(d)), 'b-line')}${badge(`${걸린(늦음)} 늦음`, 'b-warn')}${지남 > 0 ? badge(`예정에서 ${걸린(지남)} 지남`, 'b-dan') : ''}</div>
    <div class="t-card mt2">${esc(d.nm)} — ${esc(d.want)} 예약, ${esc(d.eta)} 도착 예정</div>
    <div class="t-sub mt1">보호자 ${esc(d.guardian)}${d.phone ? ` · ${esc(d.phone)}` : ''} ·
      회차권 ${d.pass == null ? '정기 요일권' : `잔여 ${d.pass}회`} · 지각은 회차권을 깎지 않습니다</div>
    <div class="mt4">${timeline([
    { hh: esc(d.want), t: '원래 예약 시간', d: '이 시각에 맞춰 반과 자리를 비워 두었습니다.' },
    { hh: esc(d.eta), t: '보호자가 알려 오신 도착 예정', k: 'on', d: `예약보다 ${걸린(늦음)} 늦습니다. 아침 산책은 건너뛰고 자유놀이부터 붙입니다.` },
    { hh: 지금, t: 지남 > 0 ? `지금 — 예정에서 ${걸린(지남)} 지났습니다` : '지금 — 아직 예정 시간 안입니다', k: 지남 > 0 ? '' : 'done', d: 지남 > 0 ? '재확인 알림을 보내거나 전화를 걸 때입니다.' : '조금 더 기다려 봅니다.' },
  ])}</div>
  </div>
  <div class="side btns-v">
    ${btn('도착 재확인 보내기', { cls: 'btn-pri', sm: true, attr: ` data-notify="${esc(d.guardian)} 님께 「지금 어디쯤이신가요?」 재확인을 보냈어요"` })}
    ${btn('전화 걸기', { cls: 'btn-ghost', sm: true, attr: ` data-notify="${esc(d.guardian)} 님께 전화를 겁니다${d.phone ? ` (${esc(d.phone)})` : ''}"` })}
    ${btn('등원 체크로', { href: 'AT0201', cls: 'btn-ghost', sm: true })}
    ${btn('결석으로 넘기기', { href: 'AT0502', cls: 'btn-sub', sm: true })}
  </div>
</div>`).join('')}

${card('도착 예정 시간 고쳐 적기', `
  ${field('어느 아이', select(목록.map((x) => `${x.d.nm} (${반이름(x.d)} · ${x.d.want} 예약)`), 0), { req: true })}
  ${field('새 도착 예정 시간', select(새예정, 0, { attr: ' data-start-sel' }), { req: true, hint: `지금은 ${지금} 이라 이미 지난 시각은 고를 수 없게 두었습니다.` })}
  ${banner('info', '⏰', `고른 시각으로 바꾸면 <b data-start-out>${새예정[0]}</b> 에 다시 확인합니다. 그때까지 자리를 비워 둡니다.`, { cls: 'mt2' })}
  ${field('메모', textarea({ ph: '길이 많이 막힌다고 하십니다. 도착하면 바로 자유놀이에 붙여 주세요.' }), { cls: 'mt4' })}
  <div class="btns mt6">
    ${btn('도착 예정 시간 저장', { cls: 'btn-pri', attr: ' data-notify="도착 예정 시간을 고쳤어요 — 그 시각에 다시 확인합니다"' })}
    ${btn('예정 시간 지나면 자동으로 다시 묻기', { cls: 'btn-ghost', attr: ' data-toast="예정 시간이 지나면 보호자에게 재확인 알림이 저절로 나갑니다"' })}
  </div>`, { cls: 'mt8 mb6' })}

${banner('warn', '⏰', `<b>미리 알려 주신 지각은 「지각」으로 세지 않습니다.</b>
  <div class="t-sub mt2">예약 시간보다 15분 넘게 늦게 체크하면 배지가 저절로 붙지만,
  보호자가 미리 알려 오신 경우에는 목록에만 올려 두고 배지를 붙이지 않습니다.
  회차권도 그대로 1회만 깎입니다 — 늦게 왔다고 더 깎지 않습니다.</div>`)}

<div class="btns mt8">
  ${btn('결석·지각 처리', { href: 'AT0501', cls: 'btn-ghost' })}
  ${btn('지각 표시', { href: 'AT0205', cls: 'btn-ghost' })}
  ${btn('오늘 등원 현황판', { href: 'AT0101', cls: 'btn-sub' })}
</div>`;
  return { body, o: { now: 지금 } };
};
