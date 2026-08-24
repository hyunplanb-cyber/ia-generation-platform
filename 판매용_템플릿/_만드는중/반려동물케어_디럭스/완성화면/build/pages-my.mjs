/* MY — 마이페이지 (5화면) */
import {
  esc, won, num, ph, phFix, dogPh, badge, stBadge, btn, chips, tabs, pane, tabBox,
  sec, card, box, banner, empty, table, kv, sumRows, timeline, progress, pageHd, detail2, stickBar, modal,
  field, input, select, textarea, check, toggle, radioRow, link, vacBadge, noteCard, noteNone, gal, 조사,
} from './ui.mjs';
import {
  SITE, TODAY, DOG, MINE, CLASSES, CLS, clsNow, PRICE, unit, MY_PASS, MY_PASS2, MY_REG,
  PASS_LOG, NOTES, NO_SHOW_DAYS, DOW_CAP, STAFF,
} from './data.mjs';

const 초코 = DOG('d01');
const 보리 = DOG('d02');
const 오늘알림장 = NOTES[0];

export const PAGES = {
  /* ============================================================
     MY-01 예약 내역 — 탭 3개 + 반려견 거르개
     ⚠ 탭과 몸통을 tabBox 로 «한 상자»에 묶는다
     ============================================================ */
  'MY-01': () => {
    const 예정 = [
      { d: '2026-08-26 (수)', dog: '초코', cls: 'md', kind: '정기', st: '예정' },
      { d: '2026-08-28 (금)', dog: '초코', cls: 'md', kind: '정기', st: '예정' },
      { d: '2026-08-27 (목)', dog: '보리', cls: 'sm', kind: '낱개', st: '예정' },
      { d: '2026-08-31 (월)', dog: '초코', cls: 'md', kind: '정기', st: '예정' },
    ];
    const 완료 = [
      { d: '2026-08-21 (금)', dog: '초코', cls: 'md', kind: '정기', st: '완료', note: 'n1' },
      { d: '2026-08-19 (수)', dog: '초코', cls: 'md', kind: '정기', st: '완료', note: 'n2' },
      { d: '2026-08-17 (월)', dog: '초코', cls: 'md', kind: '정기', st: '완료', note: 'n3' },
      { d: '2026-08-12 (수)', dog: '보리', cls: 'sm', kind: '낱개', st: '완료', note: 'n5' },
    ];
    const 취소 = [
      { d: '2026-08-18 (화)', dog: '보리', cls: 'sm', kind: '낱개', st: '취소', why: '전날 통보 — 병원 진료', refund: '회차권 1회 돌려드림' },
      { d: '2026-08-05 (수)', dog: '초코', cls: 'md', kind: '정기', st: '취소', why: '당일 통보 — 늦잠', refund: '회차권 1회 차감' },
    ];

    const 줄 = (r, 오른쪽) => `<div class="rowcard" data-tag="${esc(r.dog)}">
      <div class="thumb">${dogPh(r.dog, 96)}</div>
      <div class="bd">
        <div class="row wrap-row">${stBadge(r.st)}${badge(r.kind + ' 예약', 'b-line')}</div>
        <div class="t-card mt2">${esc(r.d)}</div>
        <div class="t-sub mt1">${esc(r.dog)} · ${esc(CLS(r.cls).nm)} · 등원 ${SITE.open} ~ 하원 ${SITE.close}</div>
        ${r.why ? `<div class="t-sub mt2">${esc(r.why)} · <b>${esc(r.refund)}</b></div>` : ''}
      </div>
      <div class="side">${오른쪽(r)}</div>
    </div>`;

    /* ⚠ 탭마다 목록이 따로다. 거르는 키도 따로 두고, 칩 묶음이 셋을 한꺼번에 거른다.
       세 목록에 같은 키를 붙이면 첫째 것만 걸러진다(querySelector 는 하나만 집는다). */
    const 칸 = (key, list, 오른쪽, 빈말) => `
      <p class="t-sub mb4"><b data-filter-cnt="${key}">${list.length}</b>건이 있어요</p>
      <div class="stack" data-filter-list="${key}" style="gap:var(--sp-item)">
        ${list.map((r) => 줄(r, 오른쪽)).join('')}
      </div>
      <div hidden data-empty-for="${key}">${empty('🐾', '결과가 없습니다', 빈말, btn('예약하기', { href: 'RE-01', cls: 'btn-pri' }))}</div>`;

    const body = `${pageHd('예약 내역', `${esc(TODAY.label)} 기준입니다`)}

<div class="mb6">${chips(['전체', ...MINE.map((d) => d.nm)], 0, { boxAttr: ' data-filter-for="my1 my2 my3"' })}</div>

${tabBox(
      [{ label: '예정', cnt: 예정.length, pane: 'a' }, { label: '완료', cnt: 완료.length, pane: 'b' }, { label: '취소', cnt: 취소.length, pane: 'c' }],
      pane('a', 칸('my1', 예정, (r) => `${btn('취소', { cls: 'btn-dan', sm: true, attr: ` data-toast="${esc(r.d)} 예약을 취소했어요 — 전날까지라 회차권은 차감되지 않습니다"` })}`,
        '고르신 반려견의 예정 예약이 없어요.'), true)
      + pane('b', 칸('my2', 완료, () => `${btn('그날 알림장 보기', { href: 'MY-05', cls: 'btn-sub', sm: true })}`,
        '고르신 반려견의 완료된 등원이 없어요.'))
      + pane('c', 칸('my3', 취소, () => `${btn('다시 예약', { href: 'RE-03', cls: 'btn-ghost', sm: true })}`,
        '고르신 반려견의 취소 내역이 없어요.')),
      0,
    )}

<div class="btns mt8">
  ${btn('회차권 현황', { href: 'MY-02', cls: 'btn-ghost' })}
  ${btn('정기 등원 관리', { href: 'MY-03', cls: 'btn-ghost' })}
  ${btn('알림장함', { href: 'MY-04', cls: 'btn-sub' })}
</div>`;
    return { body, o: {} };
  },

  /* ============================================================
     MY-02 회차권 현황 — 잔여 횟수가 주인공이다
     ⚠ 여기의 「잔여 4회」는 data.mjs 한 곳에서 나온다.
       AT-02 의 등원 체크가 깎는 것도 같은 숫자다.
     ============================================================ */
  'MY-02': () => {
    const 권 = (p, dogNm, 임박) => `<div class="card"><div class="card-bd">
      <div class="row-b wrap-row mb4">
        <div class="row">${dogPh(dogNm, 44)}<span class="t-card">${esc(dogNm)}의 ${p.n}회권</span></div>
        ${임박 ? badge(`곧 만료돼요 · D-${p.leftDays}`, 'b-warn') : badge(`${p.leftDays}일 남음`, 'b-ok')}
      </div>
      <div class="row-b wrap-row">
        <div><div class="t-sub">남은 횟수</div>
          <div style="font-size:56px;font-weight:800;line-height:1.25;color:var(--primary)" class="num">${p.left}<span class="t-card muted"> / ${p.n}회</span></div></div>
        <div class="grow" style="min-width:200px">
          ${progress(p.left / p.n * 100, 임박 ? 'warn' : '')}
          <div class="t-sub mt2">구매 ${esc(p.bought)} · 만료 <b>${esc(p.until)}</b></div>
        </div>
      </div>
      ${임박 ? `<div class="mt6">${banner('warn', '⏳', `<b>${p.leftDays}일 뒤에 남은 ${p.left}회가 사라져요.</b>
        <div class="t-sub mt2">기간을 늘릴 수는 없지만, 새 회차권을 사시면 이 회차권을 먼저 씁니다.</div>`)}</div>` : ''}
    </div></div>`;

    const body = `${pageHd('회차권 현황', '등원 체크를 할 때마다 1회씩 차감됩니다.')}

${권(MY_PASS, MY_PASS.dog, false)}
<div class="mt6">${권(MY_PASS2, MY_PASS2.dog, true)}</div>

${card('정기 요일권', `
  <div class="row-b wrap-row">
    <div><div class="t-card">매주 ${MY_REG.days.join('·')} 등원</div>
      <div class="t-sub mt1">${esc(MY_REG.since)}부터 이용 중 · 주 ${MY_REG.days.length}회</div></div>
    <div class="center"><div class="t-sub">다음 자동 청구일</div>
      <div class="t-sec pri">${esc(MY_REG.next)}</div>
      <div class="t-sub">${won(MY_REG.per)}</div></div>
    ${btn('정기 등원 관리', { href: 'MY-03', cls: 'btn-ghost' })}
  </div>
  <p class="hint">정기 요일권으로 오시는 날에는 회차권이 차감되지 않아요. 정기 요일이 아닌 날에만 회차권을 씁니다.</p>`,
      { cls: 'mt6' })}

${sec('사용 내역', table(
      ['날짜', '내용', { t: '변동', cls: 'r' }, { t: '잔여', cls: 'r' }],
      PASS_LOG.map(([d, t, delta, left]) => [
        { t: esc(d), cls: 'nowrap' },
        esc(t),
        { t: delta > 0 ? `<span class="ok">+${delta}회</span>` : `<span class="dan">${delta}회</span>`, cls: 'r' },
        { t: `<b class="num">${left}회</b>`, cls: 'r' },
      ]),
    ), { desc: `${esc(초코.nm)}의 10회권 사용 내역입니다.` })}

${banner('info', '🎟', `<b>회차권은 등원 체크가 될 때 깎입니다.</b>
  <div class="t-sub mt2">예약만 해 두고 오지 않으신 날은 차감되지 않아요.
  다만 <b>당일에 결석을 알려 주시면</b> 자리를 비워 둔 것이라 1회 차감됩니다. 전날까지 알려 주시면 차감되지 않습니다.</div>`,
      { cls: 'mt8' })}

<div class="btns mt8">
  ${btn('회차권 추가 구매', { href: 'RE-05', cls: 'btn-pri' })}
  ${btn('예약 내역', { href: 'MY-01', cls: 'btn-ghost' })}
</div>`;
    return { body, o: {} };
  },

  /* ============================================================
     MY-03 정기 등원 관리 — 「지금 바로」가 아니라 「다음 주부터」
     ⚠ 해지 버튼은 확인을 거쳐야 열린다 — <a> 로 만들 수 없다
     ============================================================ */
  'MY-03': () => {
    const 칩 = DOW_CAP.map((d) => {
      const 마감 = d.cap === 0 || d.now >= d.cap;
      const 켬 = MY_REG.days.indexOf(d.d) >= 0;
      return `<button class="chip${켬 ? ' on' : ''}${마감 && !켬 ? ' is-off' : ''}" type="button"
        data-dow="${d.d}"${마감 && !켬 ? ' disabled' : ''}>${d.d}
        ${마감 && !켬 ? '<span class="x">마감</span>' : ''}</button>`;
    }).join('');

    const body = `${pageHd('정기 등원 관리', `${esc(초코.nm)}의 정기 요일권을 관리합니다`)}

${card('지금 정기 요일', `
  <div class="row-b wrap-row">
    <div><div class="t-page pri" data-reg-now>매주 ${MY_REG.days.join('·')} 등원</div>
      <div class="t-sub mt2">${esc(MY_REG.since)}부터 · 주 ${MY_REG.days.length}회 · 월 ${won(MY_REG.per)}</div></div>
    ${badge(`다음 청구 ${MY_REG.next}`, 'b-acc')}
  </div>`, { cls: 'mt8' })}

${card('요일 바꾸기', `
  <div class="chips" data-multi data-pick-scope="reg">${칩}</div>
  <p class="hint"><b data-pick-out="reg">${MY_REG.days.length}</b>개를 골랐습니다. 정원이 찬 요일은 고를 수 없어요.</p>
  ${banner('info', '📆', `<b>이번 주는 그대로 진행되고, 다음 주부터 바뀐 요일이 적용돼요.</b>
    <div class="t-sub mt2">이번 주 남은 등원(8월 26일 수 · 8월 28일 금)은 예정대로 진행합니다.
    바뀐 요일은 8월 31일(월)이 든 주부터 적용됩니다.</div>`, { cls: 'mt6' })}
  <div class="btns mt6">
    ${btn('요일 변경하기', { cls: 'btn-pri', id: 'regBtn', attr: ' data-reg-change data-pick-btn="reg"' })}
  </div>`, { cls: 'mt6' })}

${card('일시정지', `
  <div class="row-b wrap-row">
    <div><div class="t-card">한동안 쉬어갈게요</div>
      <div class="t-sub mt1">휴가·병원 입원처럼 길게 쉴 때 켜 주세요</div></div>
    ${toggle(false, '', ' data-open="pauseBox"')}
  </div>
  <div id="pauseBox" class="mt6" hidden>
    <div class="f2">
      ${field('시작일', input({ type: 'date' }))}
      ${field('종료일', input({ type: 'date' }))}
    </div>
    ${banner('warn', '⏸', `<b>이 기간엔 등원 예약과 자동 청구가 멈춰요.</b>
      <div class="t-sub mt2">정지한 날짜만큼 다음 청구액에서 빼 드립니다. 정지 중에도 낱개 예약은 회차권으로 하실 수 있어요.</div>`)}
    <div class="btns mt6">${btn('일시정지 신청', { cls: 'btn-sub', attr: ' data-notify="일시정지를 신청했어요 — 그 기간의 자동 청구가 멈춥니다"' })}</div>
  </div>`, { cls: 'mt6' })}

${card('정기 등원 해지', `
  <p>해지하시면 다음 달부터 자동 청구가 멈추고, 고르신 요일의 자리도 풀립니다.</p>
  ${banner('info', '🎟', `<b>남은 정기권은 낱개 회차권으로 전환돼요.</b>
    <div class="t-sub mt2">이번 달 남은 등원 횟수를 세어 회차권으로 바꿔 드립니다.
    지금 해지하시면 <b>3회</b>가 회차권으로 들어와, ${esc(초코.nm)}의 잔여는 ${MY_PASS.left}회 → <b>${MY_PASS.left + 3}회</b>가 됩니다.</div>`, { cls: 'mt6' })}
  <div class="mt6">
    ${check('위 내용을 확인했고, 정기 등원을 해지하겠습니다', { attr: ' data-unlock="cancelBtn"' })}
  </div>
  <div class="btns mt6">
    ${btn('정기 등원 해지', { cls: 'btn-dan', id: 'cancelBtn', off: true, attr: ' data-modal="mCancel"' })}
    ${btn('그냥 두기', { href: 'MY-01', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt6' })}

${modal('mCancel', '정말 해지하시겠어요?', `
  <p><b>매주 ${MY_REG.days.join('·')} 등원이 다음 주부터 멈춥니다.</b></p>
  <ul class="stack mt4">
    <li class="row"><span class="ok">✓</span><span>남은 정기권 3회는 낱개 회차권으로 전환됩니다 (잔여 ${MY_PASS.left} → ${MY_PASS.left + 3}회)</span></li>
    <li class="row"><span class="ok">✓</span><span>이번 주 남은 등원은 예정대로 진행됩니다</span></li>
    <li class="row"><span class="dan">·</span><span>고르신 요일의 자리는 바로 풀려 다른 아이가 채울 수 있어요</span></li>
  </ul>`,
      `${btn('돌아가기', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('해지하기', { cls: 'btn-dan', attr: ' data-notify="정기 등원을 해지했어요 — 남은 3회를 회차권으로 바꿔 드렸습니다" data-dismiss' })}`)}

<div class="btns mt8">${btn('예약 내역', { href: 'MY-01', cls: 'btn-ghost' })}</div>`;
    return { body, o: {} };
  },

  /* ============================================================
     MY-04 알림장함 — 보호자가 저녁마다 가장 먼저 여는 화면
     ============================================================ */
  'MY-04': () => {
    const 안읽음 = NOTES.filter((n) => !n.read).length;
    const 섞기 = [
      ...NOTES.map((n) => ({ d: n.date, html: noteCard(n) })),
      ...NO_SHOW_DAYS.map((n) => ({ d: n.date, html: noteNone(n) })),
    ].sort((a, b) => (a.d < b.d ? 1 : -1));

    const body = `${pageHd('알림장함', `안 읽은 알림장이 ${안읽음}건 있어요`)}

<div class="filters">
  ${select(['2026년 8월', '2026년 7월', '2026년 6월'], 0, {
        vals: ['2026-08', '2026-07', '2026-06'], attr: ' data-filter-sel="note"',
      })}
  ${chips(['전체', ...MINE.map((d) => d.nm)], 0, { boxAttr: ' data-filter-for="note"' })}
</div>

<p class="t-sub mb4"><b data-filter-cnt="note">${섞기.length}</b>건이 있어요</p>

<div class="list1" data-filter-list="note">
  ${섞기.map((x) => x.html).join('')}
</div>
<div hidden data-empty-for="note">${empty('📓', '결과가 없습니다', '고르신 반려견의 알림장이 이 달에는 없어요. 다른 달을 골라 보세요.', btn('예약하기', { href: 'RE-01', cls: 'btn-pri' }))}</div>

${banner('info', '💬', `<b>알림장은 하원 후 18:30쯤 카카오톡으로 갑니다.</b>
  <div class="t-sub mt2">못 받으셨어도 여기에 그대로 쌓여요. 등원하지 않은 날은 회색으로 표시됩니다.</div>`, { cls: 'mt8' })}

<div class="btns mt8">${btn('예약 내역', { href: 'MY-01', cls: 'btn-ghost' })}</div>`;
    return { body, o: {} };
  },

  /* ============================================================
     MY-05 알림장 상세 — 보호자가 서비스 값을 가장 크게 느끼는 자리
     사진이 가장 커야 한다.
     ============================================================ */
  'MY-05': () => {
    const n = 오늘알림장;
    const 선생 = STAFF.find((s) => s.nm === n.teacher);
    const 앞 = NOTES[1];

    const body = `
<div class="row-b wrap-row mb6">
  ${btn('‹ 이전 날 (' + esc(앞.date.slice(5)) + ')', { href: 'MY-05', cls: 'btn-ghost', sm: true })}
  <span class="t-sub">${esc(n.date)} (${esc(n.dow)})</span>
  ${btn('다음 날 ›', { cls: 'btn-ghost', sm: true, off: true, id: 'nextNote' })}
</div>

${card('', `
  <div class="row wrap-row">
    ${dogPh(n.dog, 72)}
    <div class="grow">
      <h1 class="t-sec">${esc(n.dog)}의 ${Number(n.date.slice(5, 7))}월 ${Number(n.date.slice(8, 10))}일 알림장</h1>
      <p class="t-sub mt1">담당 ${esc(n.teacher)} 선생님 (${esc(선생 ? 선생.cls.join('·') : '중형반')}) · 사진 ${n.pics}장</p>
    </div>
    <div class="center">
      <div class="t-sub">등원 · 하원</div>
      <div class="t-card num">${n.inAt} → ${n.outAt}</div>
      <div class="t-sub">재원 8시간 3분</div>
    </div>
  </div>`)}

${sec('오늘의 사진', gal(n.pics, n.id), { desc: '누르면 크게 볼 수 있어요. 길게 누르면 저장됩니다.' })}

${sec('오늘 하루', `
  ${box(`<p style="font-size:var(--fs-card);line-height:var(--lh-body)">${esc(n.sum)}</p>`)}
  <div class="g4 mt6">
    ${[['컨디션', n.cond, '😄'], ['식사', n.meal, '🍚'], ['배변', n.poop, '💩'], ['낮잠', n.nap, '😴']].map(([k, v, i]) => `<div class="box center">
      <div style="font-size:var(--fs-sec)">${i}</div>
      <div class="t-sub mt2">${esc(k)}</div>
      <div class="t-card">${esc(v)}</div></div>`).join('')}
  </div>`)}

${n.note ? banner('warn', '🔎', `<b>확인해 주세요</b><div class="mt2">${esc(n.note)}</div>`, { cls: 'mt6' }) : ''}

${sec('오늘 일과', timeline([
      { hh: n.inAt, t: '등원', d: `${esc(n.teacher)} 선생님과 인사했어요`, k: 'done' },
      { hh: '09:30', t: '자유놀이', d: '해피와 공놀이를 오래 했습니다', k: 'done' },
      { hh: '12:30', t: '점심', d: '가져오신 사료를 다 먹었어요', k: 'done' },
      { hh: '13:30', t: '낮잠', d: '두 시간 푹 잤습니다', k: 'done' },
      { hh: '15:30', t: '간식·마당 산책', d: '30분 걸었어요', k: 'done' },
      { hh: n.outAt, t: '하원', d: `${esc(초코.guardian)} 님과 집에 갔습니다`, k: 'done' },
    ]))}

${card('선생님께 한마디', `
  ${textarea({ ph: '고맙습니다! 발톱은 오늘 저녁에 깎을게요.' })}
  <div class="btns mt4">
    ${btn('답장 보내기', { cls: 'btn-pri', attr: ' data-notify="답장을 보냈어요 — 내일 아침에 담당 선생님이 확인합니다"' })}
  </div>
  <p class="hint">담당 보육교사가 다음 날 아침에 확인합니다. 급한 일은 카카오톡 ${esc(SITE.kakao)}로 남겨 주세요.</p>`,
      { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('알림장함', { href: 'MY-04', cls: 'btn-ghost' })}
  ${btn('반려견 프로필', { href: 'PL-04', cls: 'btn-sub' })}
</div>`;
    return { body, o: {} };
  },
};
