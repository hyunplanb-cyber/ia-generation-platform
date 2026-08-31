/* HO 홈 — 잎사귀 13장.
   부모(HO0101 홈 · HO0201 요금·코스 안내 · HO0301 시설·프로그램 소개 ·
   HO0401 반 편성 기준 소개 · HO0501 이벤트·공지 목록)의 뼈대·색·톤은
   U.shell() 이 그대로 유지해 준다. 여기서는 그 화면의 «상태·세부»만 보여 준다.

   ⚠ HO 는 «누구나 보는» 메뉴라 상단 계정 줄이 기본으로 비로그인(손님)이다.
     HO0102(로그인 상태)만 o.guest = false 로 뒤집는다 — 그 화면의 요지가 그것이다.
   ⚠ 강아지 이름·요금·회차권 잔여·날짜는 전부 data.mjs 에서 가져다 쓴다. 지어내지 않는다.
   ⚠ 「누르면 …가 됩니다」라고 글로만 적지 않는다 — app.js 의 손잡이를 실제로 단다. */
import * as U from './ui.mjs';
import {
  SITE, TODAY, PRICE, unit, CLASSES, DOGS, MINE, MY_PASS, MY_PASS2, MY_REG,
  NOTES, POSTS, FACILITY, STAFF, CAL,
} from './data.mjs';

const P = {};
export const PAGES = P;

/* ---------- 이 파일 안에서만 쓰는 셈 ---------- */
const 두자리 = (n) => String(n).padStart(2, '0');
const DOW = ['월', '화', '수', '목', '금', '토', '일'];
const 오늘 = Date.UTC(TODAY.y, TODAY.m - 1, TODAY.d);
const 날글 = (t) => {
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${두자리(d.getUTCMonth() + 1)}-${두자리(d.getUTCDate())}`;
};
const 요일 = (t) => DOW[(new Date(t).getUTCDay() + 6) % 7];

/* 정기 등원 요일(월·수·금)에서 «오늘 다음»으로 오는 날을 센다.
   손으로 「8월 26일」이라 적으면 오늘이 바뀔 때 따라오지 않는다. */
const 다음등원 = (() => {
  for (let i = 1; i <= 7; i++) {
    const t = 오늘 + i * 86400000;
    if (MY_REG.days.includes(요일(t))) return { ymd: 날글(t), dow: 요일(t), d날: i };
  }
  return null;
})();

/* 형제견 값 — 둘째 아이부터 PRICE.siblingOff % 를 뺀다.
   ⛔ 금액을 손으로 두 번 적지 않는다. 여기서 계산해서 뽑는다. */
const 둘째값 = (p) => Math.round(p * (100 - PRICE.siblingOff) / 100);
const 형제견 = (n, p) => {
  const 줄 = Array.from({ length: n }).map((_, i) => ({
    차례: i + 1, 값: i === 0 ? p : 둘째값(p), 할인: i === 0 ? 0 : p - 둘째값(p),
  }));
  return {
    줄,
    합: 줄.reduce((s, r) => s + r.값, 0),
    정가합: p * n,
    아낀값: 줄.reduce((s, r) => s + r.할인, 0),
  };
};

/* 요금제 세 벌 — 형제견 계산기가 이 한 벌을 읽는다 */
const PLAN3 = [
  { nm: '1회 이용권', price: PRICE.once, u: '1회분' },
  { nm: '10회 회차권', price: PRICE.packs[0].price, u: `${PRICE.packs[0].days}일 동안 10회` },
  { nm: '정기 요일권 (주 3회)', price: PRICE.reg[3], u: '월 자동 청구' },
];

/* ============================================================
   HO0102 홈 > 로그인 상태(개인화)
   ⭐ HO 메뉴에서 유일하게 상단 계정 줄이 «로그인»인 화면이다.
   ============================================================ */
P['HO0102'] = (ctx) => {
  const 보리 = MINE[1];
  const 최근 = NOTES[0];

  const 다음카드 = U.card('다음 등원 예정일', `
    <div class="row wrap-row">
      <div class="grow">
        <div class="t-page pri">${U.esc(다음등원.ymd)} (${U.esc(다음등원.dow)})</div>
        <div class="t-sub mt1">오늘부터 ${다음등원.d날}일 뒤 · 정기 등원 요일 ${MY_REG.days.join('·')}</div>
      </div>
      ${U.btn('예약 내역 보기', { href: 'MY0101', cls: 'btn-sub' })}
    </div>`, { cls: 'mb6', aside: U.badge('맨 위에 고정', 'b-solid') });

  const 오늘줄 = (d) => `<div class="row wrap-row">
    ${U.dogPh(d.nm, 44)}
    <div class="grow">
      <div class="t-card">${U.esc(d.nm)} ${U.vacBadge(d)}</div>
      <div class="t-sub mt1">${U.esc(d.breed)} · ${d.kg}kg · ${U.esc(d.st === '재원' ? `${d.inAt} 등원 완료` : `${d.want} 예약 · 아직 등원 전이에요`)}</div>
    </div>
    ${U.badge(d.pass == null ? '정기 요일권' : `회차권 ${d.pass}회 남음`, d.pass != null && d.pass <= 2 ? 'b-warn' : 'b-line')}
  </div>`;

  const 회차줄 = (p) => [
    `<b>${U.esc(p.dog)}</b> · ${p.n}회권`,
    { t: `<b class="pri">${p.left}회</b>`, cls: 'r' },
    { t: `${U.esc(p.until)}까지`, cls: 'r' },
    { t: p.leftDays <= 7 ? U.badge(`D-${p.leftDays}`, 'b-warn') : U.badge(`D-${p.leftDays}`, 'b-ok'), cls: 'r' },
  ];

  const body = `${U.leafHd(ctx, '로그인하면 홈 맨 위가 우리 아이 이야기로 바뀝니다',
    U.btn('알림장함', { href: 'MY0401', cls: 'btn-ghost' }) + U.btn('등원 예약', { href: 'RE0101', cls: 'btn-pri' }))}

${다음카드}

${U.sec('오늘 우리 아이', `<div class="stack" style="gap:var(--sp-item)">
  ${MINE.map(오늘줄).join('')}
</div>`, { desc: `${U.esc(TODAY.label)} 기준입니다.` })}

${U.sec('회차권 잔여', U.table(
    ['이용권', { t: '남은 횟수', cls: 'r' }, { t: '유효기간', cls: 'r' }, { t: '남은 날', cls: 'r' }],
    [회차줄(MY_PASS), 회차줄(MY_PASS2)],
  ) + U.banner('warn', '⏳',
    `<b>${U.esc(MY_PASS2.dog)}의 회차권이 ${MY_PASS2.leftDays}일 뒤에 끝나요.</b>
     <div class="t-sub mt2">${U.esc(MY_PASS2.until)}이 지나면 남은 ${MY_PASS2.left}회가 사라집니다.
     ${U.esc(MY_PASS2.bought)}에 사서 지금까지 ${MY_PASS2.n - MY_PASS2.left}회 쓰셨어요.</div>`,
    { cls: 'mt6', right: U.btn('회차권 현황', { href: 'MY0201', cls: 'btn-sub', sm: true }) }),
  { desc: '비로그인 홈에서는 이 자리에 요금제 카드 세 장이 보입니다.' })}

${U.sec('최근 알림장', U.noteCard(최근, { href: 'MY0501' }) + `
  <div class="btns mt6">${U.btn('알림장함 전체 보기', { href: 'MY0401', cls: 'btn-sub' })}</div>`,
    { desc: `아직 읽지 않은 알림장이 있어요. ${U.esc(최근.date)} (${U.esc(최근.dow)}) 것입니다.` })}

${U.banner('dan', '💉', `<b>${U.esc(보리.nm)}의 종합백신이 ${보리.vacD}일 뒤 만료됩니다 — 새 증명서를 올려 주세요.</b>
  <div class="t-sub mt2">유효기간이 지나면 그날부터 등원 예약이 제한됩니다. 병원 수첩 사진이나 진료 영수증도 괜찮아요.</div>`,
    { right: U.btn('백신 기록 올리기', { href: 'PL0201', cls: 'btn-sub', sm: true }) })}

${U.banner('info', 'ℹ️', '<b>로그인 전 홈과 무엇이 다른가요?</b><div class="t-sub mt2">맨 위 히어로 자리가 「다음 등원 예정일」로 바뀌고, 요금제 카드 자리에 회차권 잔여가 들어옵니다. 하루 일과·시설·후기 덩어리는 그대로예요.</div>', { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('홈으로', { href: 'HO0101', cls: 'btn-ghost' })}
  ${U.btn('등원 예약하기', { href: 'RE0101', cls: 'btn-pri' })}
</div>`;

  return { body, o: { guest: false } };
};

/* ============================================================
   HO0104 홈 > 성수기·연휴 공지 배너
   ============================================================ */
P['HO0104'] = (ctx) => {
  const 연휴 = POSTS.find((p) => p.pin);          // 추석 연휴 휴무 안내 (9/24 ~ 9/27)
  const 쉬는날 = [24, 25, 26, 27];                 // 연휴 휴무 — 예약 자리를 세지 않는다
  const 자리 = CAL.left
    .map((left, i) => ({ d: i + 1, left }))
    .filter((x) => !쉬는날.includes(x.d));
  const 마감 = 자리.filter((x) => x.left === 0);
  const 임박 = 자리.filter((x) => x.left > 0 && x.left <= 3);

  const 성수기값 = Math.round(PRICE.once * (100 + PRICE.peakOn) / 100);
  const 공휴일값 = Math.round(PRICE.once * (100 + PRICE.holidayOn) / 100);

  const 배너 = U.banner('warn', '🌕',
    `<b>${U.esc(연휴.t)}</b>
     <div class="t-sub mt2">연휴 앞뒤 자리가 먼저 찹니다. 9월은 벌써 ${마감.length}일이 마감됐고, ${임박.length}일이 3자리 이하로 남았어요.</div>`,
    {
      cls: 'mb6',
      right: `${U.btn('9월 자리 보기', { href: 'RE0301', cls: 'btn-sub', sm: true })}
        ${U.btn('닫기', { cls: 'btn-ghost', sm: true, attr: ' data-close=".banner"' })}`,
    });

  const 날짜칸 = (list, kind) => list.length
    ? `<div class="row wrap-row" style="gap:var(--sp-btn)">${list.map((x) => U.badge(`9월 ${x.d}일 ${x.left === 0 ? '마감' : `${x.left}자리`}`, kind)).join('')}</div>`
    : '<p class="t-sub">해당하는 날이 없어요.</p>';

  const body = `${U.leafHd(ctx, '홈 맨 위에 붙는 공지 배너가 켜진 상태입니다',
    U.btn('9월 날짜 고르기', { href: 'RE0301', cls: 'btn-pri' }))}

${배너}

${U.sec('9월 예약 자리', `
  <div class="t-card mb3">이미 마감된 날 ${마감.length}일</div>
  ${날짜칸(마감, 'b-dan')}
  <div class="t-card mt6 mb3">3자리 이하로 남은 날 ${임박.length}일</div>
  ${날짜칸(임박, 'b-warn')}
  ${U.banner('info', '📅', `<b>${U.esc(연휴.t.replace(/^.*?\(/, '').replace(/\)$/, ''))}은 문을 닫습니다.</b>
    <div class="t-sub mt2">그 나흘은 예약 자리를 아예 세지 않습니다. 연휴에 잡혀 있던 정기 등원 요일은 회차권으로 자동 전환해 돌려드려요.</div>`, { cls: 'mt6' })}`,
    { desc: `정원은 하루 ${CAL.cap}자리입니다. ${CAL.y}년 ${CAL.m}월 기준이에요.` })}

${U.sec('성수기·공휴일 할증', U.table(
    ['언제', { t: '할증', cls: 'r' }, { t: '1회 이용권', cls: 'r' }, '설명'],
    [
      ['평일 (평소)', { t: '—', cls: 'r' }, { t: U.won(PRICE.once), cls: 'r' }, '<span class="t-sub">정가 그대로입니다</span>'],
      ['여름 성수기', { t: `<b class="acc">+${PRICE.peakOn}%</b>`, cls: 'r' }, { t: `<b class="pri">${U.won(성수기값)}</b>`, cls: 'r' }, '<span class="t-sub">7~8월 · 자리가 가장 빨리 찹니다</span>'],
      ['공휴일·연휴 앞뒤', { t: `<b class="acc">+${PRICE.holidayOn}%</b>`, cls: 'r' }, { t: `<b class="pri">${U.won(공휴일값)}</b>`, cls: 'r' }, '<span class="t-sub">예약 화면에서 미리 알려드려요</span>'],
    ],
  ) + `<p class="t-sub mt3">회차권과 정기 요일권에는 할증이 붙지 않습니다. 낱개로 예약할 때만 붙어요.</p>`)}

${U.sec('이 배너는 언제 다시 보이나요', U.kv([
    ['닫으면', '그날 하루는 다시 뜨지 않습니다. 위 「닫기」를 누르면 그 자리에서 사라져요.'],
    ['다음 날', '연휴가 아직 남아 있으면 하루에 한 번 다시 보여드립니다.'],
    ['연휴 3일 전부터', '닫으셔도 매번 보여드립니다 — 자리가 가장 빨리 차는 때라서요.'],
    ['연휴가 끝나면', '배너를 내립니다. 지난 공지는 이벤트·공지 목록에 남습니다.'],
  ], { cls: 'left' }))}

<div class="btns mt8">
  ${U.btn('공지 전문 보기', { href: 'CS0301', cls: 'btn-ghost' })}
  ${U.btn('이벤트·공지 목록', { href: 'HO0501', cls: 'btn-ghost' })}
  ${U.btn('미리 예약하기', { href: 'RE0101', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   HO0103 홈 > 회차권 요금표 펼침
   ⚠ 탭과 몸통은 반드시 U.tabBox() 로 «한 상자»에 묶는다.
   ============================================================ */
P['HO0103'] = (ctx) => {
  const 일회칸 = `
    ${U.banner('info', '☝️', '<b>오늘 하루만 맡길 때 씁니다.</b><div class="t-sub mt2">그날 자리가 있으면 바로 예약할 수 있어요. 성수기·공휴일에는 할증이 붙습니다.</div>')}
    ${U.box(`<div class="row wrap-row">
      <div class="grow"><h3 class="t-card">1회 이용권</h3>
        <p class="t-sub mt2">09:00 등원 · 18:00 하원. 알림장까지 모두 들어 있습니다.</p></div>
      <div class="t-page pri">${U.won(PRICE.once)}</div>
    </div>`, { cls: 'mt6' })}`;

  const 회차칸 = `
    ${U.banner('acc', '💡', `<b>10회권부터는 1회당 값이 ${U.won(PRICE.once - unit(PRICE.packs[0]))} 싸집니다.</b><div class="t-sub mt2">가장 많이 고르시는 것은 10회권이에요.</div>`)}
    ${U.table(
      ['이용권', { t: '총액', cls: 'r' }, { t: '1회당', cls: 'r' }, { t: '1회권 대비', cls: 'r' }, { t: '유효기간', cls: 'r' }],
      [
        ['1회 이용권', { t: U.won(PRICE.once), cls: 'r' }, { t: U.won(PRICE.once), cls: 'r' }, { t: '<span class="t-sub">기준</span>', cls: 'r' }, { t: '그날 하루', cls: 'r' }],
        ...PRICE.packs.map((p) => [
          `<b>${p.n}회권</b>`,
          { t: U.won(p.price), cls: 'r' },
          { t: `<b class="pri">${U.won(unit(p))}</b>`, cls: 'r' },
          { t: `<span class="acc">${Math.round((1 - unit(p) / PRICE.once) * 100)}% 싸요</span>`, cls: 'r' },
          { t: `${p.days}일`, cls: 'r' },
        ]),
      ],
    )}
    ${U.banner('warn', '⏳', '<b>기간이 지나면 남은 횟수가 사라져요.</b><div class="t-sub mt2">만료 7일 전에 알림을 보내드립니다.</div>', { cls: 'mt6' })}`;

  const 정기칸 = `
    ${U.banner('acc', '🔁', '<b>요일을 정해 두면 그 요일 자리를 먼저 잡아 둡니다.</b><div class="t-sub mt2">매월 1일 자동 청구 · 쉬는 기간에는 청구가 멈춥니다.</div>')}
    ${U.table(
      ['정기 요일권', { t: '월 청구액', cls: 'r' }, { t: '월 등원 횟수', cls: 'r' }, { t: '1회당', cls: 'r' }],
      Object.entries(PRICE.reg).map(([n, price]) => {
        const 횟수 = Number(n) * 4;
        return [
          `<b>주 ${n}회</b>`,
          { t: U.won(price), cls: 'r' },
          { t: `약 ${횟수}회`, cls: 'r' },
          { t: `<b class="pri">${U.won(Math.round(price / 횟수))}</b>`, cls: 'r' },
        ];
      }),
    )}`;

  const body = `${U.leafHd(ctx, '홈의 「요금은 세 가지예요」 덩어리를 표로 펼친 상태입니다',
    U.btn('결제 화면 보기', { href: 'RE0501', cls: 'btn-pri' }))}

${U.tabBox(
    [{ label: '1회 이용권', pane: 'a' }, { label: '회차권', pane: 'b' }, { label: '정기 요일권', pane: 'c' }],
    U.pane('a', 일회칸) + U.pane('b', 회차칸, true) + U.pane('c', 정기칸),
    1,
  )}

${U.banner('info', '🔗', '<b>탭을 옮겨도 화면 주소는 그대로입니다.</b><div class="t-sub mt2">뒤로가기를 누르면 탭이 아니라 홈으로 돌아갑니다.</div>', { cls: 'mt6' })}

${U.sec('추가로 넣을 수 있는 것', U.table(
    ['항목', { t: '값', cls: 'r' }, '설명'],
    PRICE.opt.map(([nm, p, d]) => [`<b>${U.esc(nm)}</b>`, { t: U.won(p), cls: 'r' }, `<span class="t-sub">${U.esc(d)}</span>`]),
  ))}

<div class="btns mt8">
  ${U.btn('요금·코스 안내 자세히', { href: 'HO0201', cls: 'btn-ghost' })}
  ${U.btn('예약 방법 고르기', { href: 'RE0101', cls: 'btn-ghost' })}
  ${U.btn('결제하기', { href: 'RE0501', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   HO0202 요금·코스 안내 > 요금제 탭 전환
   ⚠ 탭과 몸통을 U.tabBox() 로 묶는다 — 갈라 놓으면 탭 색만 바뀌고 몸통은 그대로다.
   ⚠ 스펙팩 「선택」— 고른 개수를 숫자로 보여주고, 하나도 안 골랐으면 단추를 잠근다.
   ============================================================ */
P['HO0202'] = (ctx) => {
  const 강조 = (ico, 말, 덧) => U.banner('acc', ico, `<b>${말}</b><div class="t-sub mt2">${덧}</div>`);

  const 일회칸 = `${강조('☝️', '자리가 있으면 오늘 바로 맡길 수 있어요.',
    `값은 ${U.won(PRICE.once)}. 성수기 ${PRICE.peakOn}% · 공휴일 ${PRICE.holidayOn}% 할증이 붙습니다.`)}
    ${U.card('포함되는 것', `<ul class="stack">
      ${['하루 종일 돌봄 (09:00 ~ 18:00)', '반별 자유놀이와 사회화 훈련', '점심·간식 급여와 배변 기록',
        '낮잠 시간 (아이마다 잠자리 따로)', '그날의 알림장 (사진 4~6장)'].map((t) => `<li class="row"><span class="ok">✓</span><span>${U.esc(t)}</span></li>`).join('')}
    </ul>`, { cls: 'mt6' })}`;

  const 회차칸 = `${강조('💡', `많이 살수록 1회당 값이 내려갑니다 — 30회권은 1회당 ${U.won(unit(PRICE.packs[2]))}.`,
    `1회 이용권보다 ${Math.round((1 - unit(PRICE.packs[2]) / PRICE.once) * 100)}% 쌉니다.`)}
    <div class="g3 mt6">${PRICE.packs.map((p, i) => `<div class="card"><div class="card-bd">
      ${i === 0 ? U.badge('가장 많이 씁니다', 'b-acc') : U.badge(`${p.days}일 동안`, 'b-mut')}
      <h3 class="t-card mt3">${p.n}회권</h3>
      <div class="t-page mt2 pri">${U.won(p.price)}</div>
      <div class="t-sub">1회당 <b class="acc">${U.won(unit(p))}</b></div>
    </div></div>`).join('')}</div>
    <div class="btns mt6">${U.btn('회차권 개수별로 견줘 보기', { href: 'HO0203', cls: 'btn-sub' })}</div>`;

  const 정기칸 = `${강조('🔁', '고른 요일의 자리를 먼저 잡아 둡니다.',
    `주 3회면 월 ${U.won(PRICE.reg[3])}. 매월 1일에 자동 청구되고, 일시정지 기간에는 청구가 멈춥니다.`)}
    <div class="g3 mt6">${[2, 3, 5].map((n) => `<div class="card"><div class="card-bd">
      ${n === 3 ? U.badge('가장 많이 씁니다', 'b-acc') : U.badge(`주 ${n}회`, 'b-mut')}
      <h3 class="t-card mt3">정기 요일권 주 ${n}회</h3>
      <div class="t-page mt2 pri">${U.won(PRICE.reg[n])}</div>
      <div class="t-sub">월 약 ${n * 4}회 등원</div>
    </div></div>`).join('')}</div>
    <div class="btns mt6">${U.btn('요일 고르러 가기', { href: 'RE0201', cls: 'btn-sub' })}</div>`;

  const 옵션칩 = `<div class="chips" data-pick-scope="opt">
    ${PRICE.opt.map(([nm, p]) => U.chip(`${nm} ${U.won(p)}`, false)).join('')}
  </div>`;

  const body = `${U.leafHd(ctx, '가운데 「회차권」 탭이 눌린 상태입니다. 탭을 옮기면 강조 문구도 함께 바뀝니다.')}

${U.tabBox(
    [{ label: '1회 이용권', pane: 'a' }, { label: '회차권', pane: 'b' }, { label: '정기 요일권', pane: 'c' }],
    U.pane('a', 일회칸) + U.pane('b', 회차칸, true) + U.pane('c', 정기칸),
    1,
  )}

${U.sec('추가 옵션 고르기', `${옵션칩}
  <p class="t-sub mt4"><b data-pick-out="opt">0</b>개를 골랐어요. 하나도 안 고르시면 아래 단추가 잠겨 있습니다.</p>
  <div class="btns mt4">
    ${U.btn('고른 옵션 담고 결제로', { href: 'RE0501', cls: 'btn-pri', off: true, attr: ' data-pick-btn="opt"' })}
    ${U.btn('옵션 없이 예약하기', { href: 'RE0101', cls: 'btn-ghost' })}
  </div>`, { desc: '요금제와 상관없이 등원한 날에 하나씩 붙일 수 있어요.' })}

${U.banner('info', '🔗', '<b>탭을 옮겨도 화면 주소는 그대로입니다.</b><div class="t-sub mt2">고른 탭은 그 자리에 남아 있고, 뒤로가기는 요금·코스 안내로 돌아갑니다.</div>', { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('요금·코스 안내로', { href: 'HO0201', cls: 'btn-ghost' })}
  ${U.btn('형제견 할인 계산기', { href: 'HO0204', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   HO0203 요금·코스 안내 > 회차권 개수 슬라이더
   ⭐ 개수를 바꾸면 총액·1회당 단가·할인율이 «실제로» 따라 바뀐다(탭 + 몸통 한 상자).
      할부 고르개는 app.js 의 data-inst-for / data-inst-out 이 그 자리에서 셈한다.
   ============================================================ */
P['HO0203'] = (ctx) => {
  const 최저 = PRICE.packs.reduce((a, b) => (unit(a) <= unit(b) ? a : b));

  const 칸 = (p) => {
    const 할인율 = Math.round((1 - unit(p) / PRICE.once) * 100);
    const 아낀값 = (PRICE.once - unit(p)) * p.n;
    return `
      <div class="row wrap-row">
        <div class="grow">
          <div class="t-sub">${p.n}회권 총액</div>
          <div class="t-page pri">${U.won(p.price)}</div>
        </div>
        <div class="grow">
          <div class="t-sub">1회당</div>
          <div class="t-page acc">${U.won(unit(p))}</div>
        </div>
        <div>${p === 최저 ? U.badge('가장 싼 1회당 단가', 'b-solid') : U.badge(`1회권보다 ${할인율}% 싸요`, 'b-acc')}</div>
      </div>
      <div class="mt6">
        <div class="row wrap-row"><span class="grow t-sub">1회권 대비 할인율</span><b class="acc">${할인율}%</b></div>
        ${U.progress(할인율 * 3, 'ok')}
        <p class="t-sub mt2">막대가 길수록 1회권보다 많이 아낍니다.</p>
      </div>
      ${U.sumRows([
        ['1회권으로 같은 횟수를 쓰면', U.won(PRICE.once * p.n)],
        [`${p.n}회권 값`, U.won(p.price)],
        ['유효기간', `${p.days}일 (하루 이용마다 1회 차감)`],
      ], ['아끼는 값', U.won(아낀값)])}`;
  };

  const body = `${U.leafHd(ctx, '개수를 바꾸면 총액과 1회당 단가가 그 자리에서 다시 계산됩니다',
    U.btn('회차권 사러 가기', { href: 'RE0501', cls: 'btn-pri' }))}

${U.tabBox(
    PRICE.packs.map((p, i) => ({ label: `${p.n}회권`, pane: `p${i}` })),
    PRICE.packs.map((p, i) => U.pane(`p${i}`, 칸(p), i === 0)).join(''),
    0,
  )}

${U.sec('1회당 단가를 나란히', U.bars([
    ['1회 이용권', PRICE.once, U.won(PRICE.once)],
    ...PRICE.packs.map((p) => [`${p.n}회권`, unit(p), U.won(unit(p))]),
  ]) + `<p class="t-sub mt3">막대가 짧을수록 1회당 값이 쌉니다. 가장 짧은 것이 ${최저.n}회권이에요.</p>`)}

${U.sec('할부로 나눠 내면', `
  <div class="row wrap-row">
    <div class="grow">
      <div class="t-sub">10회권 ${U.won(PRICE.packs[0].price)} 기준</div>
      <div class="t-sec mt1"><b data-inst-out>한 번에 ${U.won(PRICE.packs[0].price)} 나갑니다</b></div>
    </div>
    <div style="width:180px">
      ${U.select(['일시불', '3개월', '6개월', '12개월'], 0, {
        vals: ['0', '3', '6', '12'],
        attr: ` data-inst-for="${PRICE.packs[0].price}"`,
      })}
    </div>
  </div>
  <p class="t-sub mt3">할부는 신용카드로 결제하실 때만 고를 수 있어요. 계좌이체는 일시불입니다.</p>`,
    { desc: '몇 달로 나눌지 고르면 달마다 얼마인지 그 자리에서 셈해 드립니다.' })}

${U.banner('warn', '⏳', `<b>회차권은 발급일부터 기간이 흐릅니다.</b>
  <div class="t-sub mt2">10회권 ${PRICE.packs[0].days}일 · 20회권 ${PRICE.packs[1].days}일 · 30회권 ${PRICE.packs[2].days}일.
  기간이 지나면 남은 횟수가 사라지니, 한 달에 몇 번 오실지 먼저 세어 보세요.</div>`, { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('요금·코스 안내로', { href: 'HO0201', cls: 'btn-ghost' })}
  ${U.btn('형제견 할인도 보기', { href: 'HO0204', cls: 'btn-ghost' })}
  ${U.btn('결제하기', { href: 'RE0501', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   HO0204 요금·코스 안내 > 형제견 할인 계산기
   ⚠ 할인율은 PRICE.siblingOff 하나만 읽는다. 금액은 손으로 두 번 적지 않는다.
   ============================================================ */
P['HO0204'] = (ctx) => {
  const 마리수 = [1, 2, 3];

  const 칸 = (n) => {
    const 표 = PLAN3.map((p) => ({ p, 셈: 형제견(n, p.price) }));
    return `
      ${n === 1
        ? U.banner('info', 'ℹ️', `<b>형제견 할인은 둘째 아이부터 붙어요.</b><div class="t-sub mt2">한 마리만 등록하시면 정가 그대로입니다.</div>`)
        : U.banner('acc', '🐾', `<b>둘째 아이부터 ${PRICE.siblingOff}% 할인이 붙습니다.</b>
           <div class="t-sub mt2">${n}마리를 10회권으로 등록하시면 ${U.won(형제견(n, PRICE.packs[0].price).아낀값)}을 아껴요.</div>`)}
      ${U.table(
        ['요금제', { t: '한 마리 정가', cls: 'r' }, { t: `${n}마리 정가`, cls: 'r' }, { t: '형제견 적용가', cls: 'r' }, { t: '아끼는 값', cls: 'r' }],
        표.map(({ p, 셈 }) => [
          `<b>${U.esc(p.nm)}</b><div class="t-sub">${U.esc(p.u)}</div>`,
          { t: U.won(p.price), cls: 'r' },
          { t: U.won(셈.정가합), cls: 'r' },
          { t: `<b class="pri">${U.won(셈.합)}</b>`, cls: 'r' },
          { t: 셈.아낀값 ? `<span class="acc">−${U.won(셈.아낀값)}</span>` : '<span class="t-sub">—</span>', cls: 'r' },
        ]),
      )}
      ${U.card('10회권으로 셈해 보면', U.sumRows(
        형제견(n, PRICE.packs[0].price).줄.map((r) => [
          `${r.차례}번째 아이`,
          r.할인 ? `${U.won(r.값)} <span class="acc">(−${PRICE.siblingOff}%)</span>` : U.won(r.값),
        ]),
        ['합계', U.won(형제견(n, PRICE.packs[0].price).합)],
      ), { cls: 'mt6' })}`;
  };

  const body = `${U.leafHd(ctx, `마리 수를 고르면 ${PRICE.siblingOff}% 할인이 붙은 값이 다시 계산됩니다`,
    U.btn('반려견 등록하기', { href: 'PL0101', cls: 'btn-pri' }))}

${U.tabBox(
    마리수.map((n) => ({ label: `${n}마리`, pane: `n${n}` })),
    마리수.map((n) => U.pane(`n${n}`, 칸(n), n === 2)).join(''),
    1,
  )}

${U.sec('우리 집 아이들', `<div class="g2">
  ${MINE.map((d) => `<div class="box"><div class="row wrap-row">
    ${U.dogPh(d.nm, 56)}
    <div class="grow">
      <div class="t-card">${U.esc(d.nm)}</div>
      <div class="t-sub mt1">${U.esc(d.breed)} · ${d.kg}kg · ${U.esc(d.age)}</div>
    </div>
    ${U.badge(d === MINE[0] ? '첫째 · 정가' : `둘째 · ${PRICE.siblingOff}% 할인`, d === MINE[0] ? 'b-line' : 'b-acc')}
  </div></div>`).join('')}
</div>
<p class="t-sub mt4">${U.조사(MINE[0].nm, '이', '가')} 첫째, ${U.조사(MINE[1].nm, '이', '가')} 둘째로 잡힙니다.
  아이마다 요금제가 다르면 <b class="hl">값이 비싼 쪽에 할인이 붙도록</b> 저희가 알아서 맞춰 드려요.</p>`,
    { desc: '한 보호자 이름으로 등록된 아이들끼리 묶입니다.' })}

${U.sec('적용 조건', U.kv([
    ['누구까지', `한 보호자 이름으로 등록한 아이들끼리만 묶입니다. ${PRICE.siblingOff}%는 둘째부터 붙어요.`],
    ['어떤 요금제에', '1회 이용권·회차권·정기 요일권 모두 적용됩니다.'],
    ['언제 붙나', '결제 화면에서 자동으로 붙습니다. 따로 신청하지 않으셔도 됩니다.'],
    ['이미 산 것은', '지난 결제에는 소급되지 않습니다. 다음 결제부터 붙어요.'],
    ['다른 할인과', '성수기·공휴일 할증이 있는 날에는 할증을 먼저 얹고 그다음에 할인을 뺍니다.'],
  ], { cls: 'left' }))}

<div class="btns mt8">
  ${U.btn('요금·코스 안내로', { href: 'HO0201', cls: 'btn-ghost' })}
  ${U.btn('자주 묻는 질문', { href: 'CS0101', cls: 'btn-ghost' })}
  ${U.btn('결제하기', { href: 'RE0501', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   HO0302 시설·프로그램 소개 > 시설 사진 확대
   ⚠ 사진은 끝까지 자리표로 둔다 — 가짜 사진 주소를 지어내지 않는다.
   ============================================================ */
P['HO0302'] = (ctx) => {
  const 구역 = (nm) => (nm.includes('마당') ? '실외' : '실내');

  const 큰칸 = `<div class="car">
    <button class="car-nav prev" type="button" aria-label="이전 사진">‹</button>
    <div class="carousel">
      ${FACILITY.map(([nm, w, h, d]) => `<div style="width:100%">
        <div class="row wrap-row mb3">${U.badge(구역(nm), 구역(nm) === '실외' ? 'b-acc' : 'b-line')}<span class="t-card">${U.esc(nm)}</span></div>
        ${U.ph([nm, 1600, 1000], { seed: nm, cls: 'ph-sq' })}
        <p class="t-sub mt3">${U.esc(d)}</p>
      </div>`).join('')}
    </div>
    <button class="car-nav next" type="button" aria-label="다음 사진">›</button>
  </div>`;

  const 썸 = `<div class="cards" data-filter-list="fac">
    ${FACILITY.map(([nm, w, h, d], i) => `<button class="item" type="button" data-tag="${구역(nm)}" data-modal="fac${i}">
      <div class="thumb">${U.ph([nm, w, h], { seed: nm, cls: 'ph-card' })}</div>
      <div class="bd"><div class="nm">${U.esc(nm)}</div><div class="meta">${U.esc(d)}</div></div>
    </button>`).join('')}
  </div>`;

  const 모달들 = FACILITY.map(([nm, w, h, d], i) => U.modal(`fac${i}`, U.esc(nm),
    `${U.ph([nm, 1600, 1000], { seed: nm, cls: 'ph-sq' })}
     <p class="t-sub mt4">${U.esc(d)}</p>
     <div class="row wrap-row mt3">${U.badge(구역(nm), 'b-line')}${U.badge(`권장 ${w}×${h}`, 'b-mut')}</div>`,
    U.btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }) + U.btn('예약하기', { href: 'RE0101', cls: 'btn-pri' }),
  )).join('');

  const body = `${U.leafHd(ctx, '썸네일을 누르면 전체화면으로 크게 열립니다. 큰 사진은 ‹ › 로 넘겨요.')}

${큰칸}

${U.sec('촬영 구역', `${U.chips(['전체', '실내', '실외'], 0, { boxAttr: ' data-filter-for="fac"' })}
  <p class="t-sub mt4"><b data-filter-cnt="fac">${FACILITY.length}</b>곳을 보고 계세요.</p>
  <div class="mt4">${썸}</div>
  <div hidden data-empty-for="fac">${U.empty('📷', '이 구역에는 사진이 없어요', '다른 구역을 눌러 보세요.', U.btn('전체 보기', { href: 'HO0302', cls: 'btn-pri' }))}</div>`,
    { desc: `실내 ${FACILITY.filter(([nm]) => 구역(nm) === '실내').length}곳 · 실외 ${FACILITY.filter(([nm]) => 구역(nm) === '실외').length}곳입니다.` })}

${U.banner('info', '📐', '<b>사진 자리는 권장 크기를 그대로 지킵니다.</b><div class="t-sub mt2">가로 사진은 1600×1000, 썸네일은 1200×900 비율로 들어갑니다. 원의 실제 사진을 그 자리에 올려 주세요.</div>', { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('시설·프로그램 소개로', { href: 'HO0301', cls: 'btn-ghost' })}
  ${U.btn('CCTV 안내 보기', { href: 'HO0304', cls: 'btn-ghost' })}
  ${U.btn('예약하기', { href: 'RE0101', cls: 'btn-pri' })}
</div>`;

  return { body, o: { after: 모달들 } };
};

/* ============================================================
   HO0303 시설·프로그램 소개 > 보육교사 프로필 펼치기
   ⚠ 보육교사는 «사람»이다 — U.dogPh() 를 쓰지 않고 ph-round 로 둔다.
   ============================================================ */
P['HO0303'] = (ctx) => {
  const 활성 = STAFF.filter((s) => s.st === '활성');
  const 쉬는분 = STAFF.filter((s) => s.st !== '활성');
  const 자격 = ['반려동물관리사 2급', '반려견스타일리스트', '반려동물 응급처치 교육 이수', '아동·동물 학대 예방 교육 이수'];

  const 카드 = (s, i) => {
    const 폄 = i === 0;
    const 키 = `staff${i}`;
    return `<div class="card"><div class="card-bd">
      <div class="row wrap-row">
        ${U.phFix(['보육교사 프로필', 400, 400], 72, { cls: 'ph-round', seed: s.nm })}
        <div class="grow">
          <div class="t-card">${U.esc(s.nm)} <span class="t-sub">${U.esc(s.role)}</span></div>
          <div class="t-sub mt1">경력 ${U.esc(s.career)} · ${s.cls.length ? `담당 ${s.cls.join('·')}` : '담당 반 없음'}</div>
          <div class="mt3">${s.cls.map((c) => U.badge(c, 'b-line')).join(' ')}</div>
        </div>
      </div>
      <div${폄 ? '' : ' hidden'} data-more-body="${키}" class="mt6">
        ${U.kv([
          ['경력', `${U.esc(s.career)} · ${U.esc(SITE.name)}에서 ${U.조사(U.esc(s.role), '으로', '로')} 일하고 있어요.`],
          ['담당 반', s.cls.length ? `${s.cls.join(' · ')} — 아침 인사부터 하원 인계까지 그 반을 맡습니다.` : '반을 맡지 않고 전체를 돕습니다.'],
          ['자격증', 자격.join(' · ')],
          ['연락', `알림장에 답글을 남기시면 다음 날 ${U.esc(s.nm)} 선생님이 확인합니다. (${U.esc(s.email)})`],
        ], { cls: 'left' })}
      </div>
      <div class="btns mt4">
        ${U.btn(폄 ? '접기 ▴' : '경력·자격증 펼치기 ▾', {
          cls: 'btn-sub', sm: true,
          attr: ` data-more-toggle="${키}" data-more-label="경력·자격증 펼치기 ▾"`,
        })}
      </div>
    </div></div>`;
  };

  const body = `${U.leafHd(ctx, '맨 위 한 분이 펼쳐진 상태입니다. 접으면 이름·역할·담당 반만 남아요.')}

${U.sec(`원장·보육교사 ${활성.length}명`, `<div class="stack" style="gap:var(--sp-card-gap)">
  ${활성.map(카드).join('')}
</div>`, { desc: `${활성.filter((s) => s.role === '보육교사').length}명이 반을 나눠 맡고, 원장이 전체를 봅니다.` })}

${쉬는분.length ? U.banner('info', '💤', `<b>지금 쉬고 있는 선생님 ${쉬는분.length}명</b>
  <div class="t-sub mt2">${쉬는분.map((s) => `${U.esc(s.nm)} ${U.esc(s.role)} (경력 ${U.esc(s.career)})`).join(' · ')} — 복귀하면 목록에 다시 올라옵니다.</div>`) : ''}

${U.sec('반은 누가 맡나요', U.table(
    ['반', '담당', { t: '오늘 인원', cls: 'r' }],
    CLASSES.map((c) => {
      const 담당 = 활성.filter((s) => s.cls.includes(c.nm) && s.role === '보육교사').map((s) => s.nm);
      return [
        `<b>${c.ico} ${U.esc(c.nm)}</b><div class="t-sub">${U.esc(c.kg)}</div>`,
        담당.length ? 담당.map((n) => U.badge(n, 'b-acc')).join(' ') : U.badge('원장이 직접', 'b-line'),
        { t: `${DOGS.filter((d) => d.cls === c.id && d.st === '재원').length} / ${c.cap}마리`, cls: 'r' },
      ];
    }),
  ))}

<div class="btns mt8">
  ${U.btn('시설·프로그램 소개로', { href: 'HO0301', cls: 'btn-ghost' })}
  ${U.btn('1:1 문의하기', { href: 'CS0201', cls: 'btn-ghost' })}
  ${U.btn('예약하기', { href: 'RE0101', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   HO0304 시설·프로그램 소개 > CCTV 안내 펼치기
   ============================================================ */
P['HO0304'] = (ctx) => {
  const 실내 = 6;
  const 마당 = 2;
  const 보관일 = 7;

  const body = `${U.leafHd(ctx, '홈의 CCTV 안내 배너를 눌러 본문을 펼친 상태입니다')}

${U.banner('info', '📹', `<b>CCTV ${실내 + 마당}대 — 실내 ${실내}대, 마당 ${마당}대. 사각지대가 없습니다.</b>
  <div class="t-sub mt2">보호자님께 실시간으로 열어 드립니다. 녹화본은 ${보관일}일간 보관합니다.</div>`,
    { right: U.btn('열람 신청하기', { href: 'MY0101', cls: 'btn-sub', sm: true }) })}

${U.sec('어디를 볼 수 있나요', U.table(
    ['자리', { t: '대수', cls: 'r' }, '실시간 공개'],
    [
      ['실내 놀이터', { t: '3대', cls: 'r' }, U.badge('공개', 'b-ok')],
      ['낮잠방', { t: '2대', cls: 'r' }, U.badge('공개', 'b-ok')],
      ['현관·인계 공간', { t: '1대', cls: 'r' }, U.badge('공개', 'b-ok')],
      ['야외 마당', { t: '2대', cls: 'r' }, U.badge('공개', 'b-ok')],
      ['목욕·미용실', { t: '—', cls: 'r' }, U.badge('설치하지 않습니다', 'b-mut')],
      ['소독실·사무실', { t: '—', cls: 'r' }, U.badge('설치하지 않습니다', 'b-mut')],
    ],
  ) + `<p class="t-sub mt3">아이가 하루를 보내는 자리는 모두 열려 있습니다. 목욕실은 아이가 놀라지 않도록 카메라를 두지 않았어요.</p>`)}

${U.accordion([
    {
      q: '<b>어떻게 보나요</b> — 신청부터 접속까지',
      a: `${U.timeline([
        { hh: '1단계', t: '마이페이지에서 열람 신청', d: '반려견 등록이 끝나 있어야 합니다. 신청은 한 번만 하시면 돼요.', k: 'done' },
        { hh: '2단계', t: '원에서 확인 후 아이디 발급', d: '평일 기준 하루 안에 카카오톡으로 아이디와 임시 비밀번호를 보내드립니다.', k: 'done' },
        { hh: '3단계', t: '앱이나 웹으로 접속', d: '등원한 날 08:30부터 하원까지 볼 수 있습니다.', k: 'done' },
        { hh: '4단계', t: '하원하면 자동으로 닫힘', d: '우리 아이가 원에 없는 시간에는 열리지 않습니다.', k: 'on' },
      ])}
      <div class="btns mt4">${U.btn('마이페이지에서 신청', { href: 'MY0101', cls: 'btn-sub', sm: true })}</div>`,
    },
    {
      q: '<b>얼마나 보관하나요</b>',
      a: `<p>녹화본은 <b class="hl">${보관일}일</b> 동안만 보관하고 그 뒤에는 자동으로 지워집니다.
        사고가 있었던 날의 영상은 보호자님이 요청하시면 따로 남겨 두었다가 확인 후 함께 봅니다.</p>
        <p class="t-sub mt3">${보관일}일이 지난 영상은 원에서도 다시 볼 수 없습니다. 필요하시면 그 안에 말씀해 주세요.</p>`,
    },
    {
      q: '<b>다른 아이도 같이 찍히는데 괜찮나요</b> — 개인정보 보호',
      a: `<ul class="stack">
        <li class="row"><span class="pri">·</span><span>화면을 <b>찍거나 저장해 다른 곳에 올리는 것</b>은 안 됩니다. 다른 아이와 보호자가 함께 찍히기 때문이에요.</span></li>
        <li class="row"><span class="pri">·</span><span>아이디는 <b>보호자 한 분</b>에게만 드립니다. 가족과 나눠 쓰시려면 말씀해 주세요.</span></li>
        <li class="row"><span class="pri">·</span><span>보육교사도 함께 찍힙니다. 직원 동의를 받아 두었습니다.</span></li>
        <li class="row"><span class="pri">·</span><span>영상은 원 안에서만 저장되고 바깥으로 내보내지 않습니다.</span></li>
      </ul>
      <div class="btns mt4">${U.btn('자세한 정책 공지 보기', { href: 'CS0301', cls: 'btn-sub', sm: true })}</div>`,
    },
    {
      q: '<b>화면이 안 열려요</b>',
      a: `<p>등원하지 않은 날에는 열리지 않습니다. 등원한 날인데도 안 열리면 1:1 문의로 알려 주세요.
        아이디를 다시 보내드립니다.</p>
        <div class="btns mt4">${U.btn('1:1 문의하기', { href: 'CS0201', cls: 'btn-sub', sm: true })}</div>`,
    },
  ], 0)}

<div class="btns mt8">
  ${U.btn('시설·프로그램 소개로', { href: 'HO0301', cls: 'btn-ghost' })}
  ${U.btn('시설 사진 보기', { href: 'HO0302', cls: 'btn-ghost' })}
  ${U.btn('마이페이지', { href: 'MY0101', cls: 'btn-pri' })}
</div>`;

  return { body, o: { read: true } };
};

/* ============================================================
   HO0402 반 편성 기준 소개 > 몸무게 구간 아코디언
   ⚠ 견종별 평균 몸무게는 지어내지 않는다 — DOGS 에 등록된 아이들에서 «세어» 만든다.
   ============================================================ */
P['HO0402'] = (ctx) => {
  const 일정 = {
    sm: ['09:30 짧은 놀이 (20분씩 3번)', '11:00 이름 부르면 오기', '13:30 낮잠 2시간', '15:30 실내 간식'],
    md: ['09:30 자유놀이 60분', '11:00 사회화 훈련', '13:30 낮잠 2시간', '15:30 마당 산책 30분'],
    lg: ['09:30 마당 자유놀이 80분', '11:00 기초 훈육', '13:30 낮잠 2시간', '15:30 마당 산책 40분'],
  };

  const 견종표 = (() => {
    const m = new Map();
    for (const d of DOGS) {
      if (!m.has(d.breed)) m.set(d.breed, []);
      m.get(d.breed).push(d.kg);
    }
    return [...m.entries()].map(([breed, kgs]) => {
      const avg = Math.round((kgs.reduce((s, k) => s + k, 0) / kgs.length) * 10) / 10;
      const c = CLASSES.find((x) => avg >= x.kgMin && avg < x.kgMax) || CLASSES[CLASSES.length - 1];
      return { breed, avg, n: kgs.length, c };
    }).sort((a, b) => a.avg - b.avg);
  })();

  const 항목 = CLASSES.map((c) => {
    /* ⚠ 머리의 숫자와 아래 이름표 수가 어긋나면 안 된다 — 둘 다 «지금 그 반에 있는» 아이만 센다 */
    const 아이들 = DOGS.filter((d) => d.cls === c.id && d.st === '재원');
    const 지금 = 아이들.length;
    return {
      q: `<span class="t-card">${c.ico} ${U.esc(c.nm)}</span> <span class="t-sub">${U.esc(c.kg)} · 오늘 ${지금}/${c.cap}마리</span>`,
      a: `<p>${U.esc(c.desc)}</p>
        <div class="t-card mt6 mb3">이 반의 하루</div>
        ${U.timeline(일정[c.id].map((t) => {
          const [hh, ...나머지] = t.split(' ');
          return { hh, t: U.esc(나머지.join(' ')), k: 'done' };
        }))}
        <div class="t-card mt6 mb3">오늘 이 반에 있는 아이들 ${지금}마리</div>
        <div class="row wrap-row" style="gap:var(--sp-btn)">
          ${아이들.map((d) => U.badge(`${U.esc(d.nm)} ${d.kg}kg`, 'b-line')).join('')}
        </div>
        <p class="t-sub mt4">정원은 ${c.cap}마리입니다. 넘치면 그날 예약을 받지 않아요.</p>`,
    };
  });

  const body = `${U.leafHd(ctx, '가운데 중형반이 펼쳐진 상태입니다. 펼치면 그 반의 하루 일정까지 함께 보여요.')}

${U.banner('info', '⚖️', `<b>몸무게가 첫 기준입니다.</b>
  <div class="t-sub mt2">소형 ${CLASSES[0].kg} · 중형 ${CLASSES[1].kg} · 대형 ${CLASSES[2].kg}.
  구간 안에서 성향을 보고 반을 정합니다. 매달 체중을 재서 구간이 바뀌면 저희가 먼저 말씀드려요.</div>`)}

<div class="mt6">${U.accordion(항목, 1)}</div>

${U.sec('견종별 평균 몸무게 참고표', U.table(
    ['견종', { t: '우리 원 평균', cls: 'r' }, { t: '등록', cls: 'r' }, '예상 반'],
    견종표.map((r) => [
      `<b>${U.esc(r.breed)}</b>`,
      { t: `<b class="num">${r.avg}</b>kg`, cls: 'r' },
      { t: `${r.n}마리`, cls: 'r' },
      `${r.c.ico} ${U.badge(r.c.nm, 'b-line')}`,
    ]),
  ) + `<p class="t-sub mt3">오늘 ${SITE.name}에 등원 예정인 ${DOGS.length}마리의 몸무게를 견종별로 평균 낸 값입니다.
    같은 견종이라도 아이마다 다르니 참고로만 봐 주세요 — 반은 실제로 잰 몸무게로 정합니다.</p>`,
    { desc: `견종 ${견종표.length}가지가 다니고 있어요.` })}

${U.banner('warn', '📏', '<b>구간 경계에 있는 아이는 성향까지 보고 정합니다.</b><div class="t-sub mt2">5kg 언저리·15kg 언저리 아이는 첫 등원 날 30분 적응 테스트 결과를 함께 봅니다.</div>', { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('반 편성 기준 소개로', { href: 'HO0401', cls: 'btn-ghost' })}
  ${U.btn('사교성 평가 절차 보기', { href: 'HO0403', cls: 'btn-ghost' })}
  ${U.btn('반려견 등록하기', { href: 'PL0101', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   HO0403 반 편성 기준 소개 > 사교성 평가 절차 상세
   ============================================================ */
P['HO0403'] = (ctx) => {
  const 절차 = [
    ['0 ~ 5분', '보호자와 함께 대기실에서', '낯선 냄새와 소리에 어떻게 반응하는지 봅니다. 보호자 곁에서 편안한지가 첫 기준이에요.'],
    ['5 ~ 15분', '빈 놀이방을 혼자 둘러보기', '보육교사 한 명만 함께 들어갑니다. 구석에만 있는지, 먼저 돌아다니는지 적습니다.'],
    ['15 ~ 25분', '또래 두 마리와 만나기', '몸무게가 비슷한 아이 두 마리를 넣습니다. 다가가는 쪽인지 피하는 쪽인지 봅니다.'],
    ['25 ~ 30분', '보호자와 잠깐 떨어져 보기', '보호자가 5분 자리를 비웁니다. 짖는지, 문 앞에서 기다리는지 적습니다.'],
  ];
  const 총분 = 30;

  const 항목 = [
    ['먼저 다가감', '사람이 부르면 온다', '또래에게 먼저 다가간다', '처음 본 아이에게도 먼저 간다'],
    ['짖음', '거의 짖지 않는다', '놀 때만 짖는다', '자극이 있으면 오래 짖는다'],
    ['장난감 다툼', '양보한다', '가지고 있다가 놓아 준다', '으르렁거리며 지킨다'],
    ['사람 반응', '손을 피한다', '만지면 가만히 있다', '먼저 안기려 한다'],
    ['분리 반응', '보호자가 나가도 논다', '문 앞에서 기다린다', '계속 짖거나 헐떡인다'],
  ];

  const body = `${U.leafHd(ctx, `첫 등원 날 ${총분}분 동안 무엇을 보는지 그대로 적어 두었습니다`,
    U.btn('첫 등원 예약하기', { href: 'RE0101', cls: 'btn-pri' }))}

${U.banner('info', '🐾', `<b>몸무게로 구간을 나눈 다음, 이 ${총분}분으로 반을 정합니다.</b>
  <div class="t-sub mt2">보호자님도 함께 계셔야 합니다. 결과는 그날 바로 알려드려요.</div>`)}

${U.sec(`${총분}분 동안 이렇게 봅니다`, U.timeline(절차.map(([hh, t, d]) => ({ hh, t: U.esc(t), d: U.esc(d), k: 'done' })))
  + `<p class="t-sub mt4">네 토막을 더하면 ${총분}분입니다. 아이가 힘들어하면 중간에 멈추고 다음에 다시 봅니다.</p>`)}

${U.sec('평가 항목 5문항', U.table(
    ['항목', '1단계', '2단계', '3단계'],
    항목.map(([nm, a, b, c]) => [
      `<b>${U.esc(nm)}</b>`,
      `<span class="t-sub">${U.esc(a)}</span>`,
      `<span class="t-sub">${U.esc(b)}</span>`,
      `<span class="t-sub">${U.esc(c)}</span>`,
    ]),
  ) + `<p class="t-sub mt3">${항목.length}문항을 각각 3단계로 적습니다. 점수를 매겨 줄 세우는 것이 아니라,
    <b class="hl">어떤 아이들과 두면 편안할지</b>를 정하려고 적는 것이에요.</p>`)}

${U.sec('결과가 반으로 이어지는 방식', `<div class="g2">
  ${U.box(`<div>${U.badge('그대로 배정', 'b-ok')}</div>
    <div class="t-card mt3">몸무게 구간 안에서 성향이 무난할 때</div>
    <p class="t-sub mt2">그 반으로 바로 배정합니다. 첫 주 동안 알림장에 적응 상태를 적어 보내드려요.</p>`)}
  ${U.box(`<div>${U.badge('소그룹 전환', 'b-warn')}</div>
    <div class="t-card mt3">짖음이 3단계이거나 분리 반응이 큰 경우</div>
    <p class="t-sub mt2">3~4마리 소그룹에서 2주 동안 지냅니다. 그 뒤 다시 봐서 큰 반으로 옮깁니다.</p>`)}
  ${U.box(`<div>${U.badge('개별 관리', 'b-dan')}</div>
    <div class="t-card mt3">장난감 다툼에서 공격성이 보인 경우</div>
    <p class="t-sub mt2">바로 분리하고 보호자께 연락드립니다. 맞지 않으면 솔직하게 말씀드려요.</p>`)}
  ${U.box(`<div>${U.badge('구간 조정', 'b-acc')}</div>
    <div class="t-card mt3">몸무게가 구간 경계에 있는 경우</div>
    <p class="t-sub mt2">${CLASSES[0].kgMax}kg·${CLASSES[1].kgMax}kg 언저리 아이는 성향을 보고 위아래 반 중 편한 쪽으로 정합니다.</p>`)}
</div>`)}

${U.sec('다시 평가받고 싶으시면', U.kv([
    ['언제 요청하나', '첫 주 관찰이 끝난 뒤 언제든 요청하실 수 있어요. 몸무게가 구간을 넘었을 때도 저희가 먼저 말씀드립니다.'],
    ['어떻게 요청하나', '1:1 문의에 「재평가 요청」으로 남겨 주세요. 원장이 직접 확인합니다.'],
    ['언제 다시 보나', '요청하신 다음 등원일에 30분을 다시 봅니다. 값은 따로 받지 않습니다.'],
    ['결과는', '그날 알림장에 함께 적어 보내드립니다. 반이 바뀌면 다음 등원일부터 적용돼요.'],
  ], { cls: 'left' }) + `<div class="btns mt6">${U.btn('1:1 문의로 재평가 요청', { href: 'CS0201', cls: 'btn-sub' })}</div>`)}

<div class="btns mt8">
  ${U.btn('반 편성 기준 소개로', { href: 'HO0401', cls: 'btn-ghost' })}
  ${U.btn('몸무게 구간 보기', { href: 'HO0402', cls: 'btn-ghost' })}
  ${U.btn('자주 묻는 질문', { href: 'CS0101', cls: 'btn-ghost' })}
</div>`;

  return { body, o: { read: true } };
};

/* ============================================================
   HO0502 이벤트·공지 목록 > 카테고리 탭
   ⭐ 탭이 목록을 «실제로» 줄인다 — data-filter-for + data-tag + data-filter-cnt + data-empty-for.
      처음 열었을 때 「이벤트」가 눌려 있으므로, 나머지 줄은 미리 접어 둔다(data-out-chip).
   ============================================================ */
P['HO0502'] = (ctx) => {
  const 고정 = POSTS.filter((p) => p.pin);
  const 나머지 = POSTS.filter((p) => !p.pin);
  const 갈래 = ['공지', '이벤트', '휴무'];
  const 세기 = (c) => 나머지.filter((p) => p.cat === c).length;
  const 지금갈래 = '이벤트';

  const 칩상자 = `<div class="chips" data-filter-for="post">
    ${U.chip('전체', false, ' data-tag="전체"')}
    ${갈래.map((c) => U.chip(`${c} ${세기(c)}`, c === 지금갈래, ` data-tag="${c}"`)).join('')}
  </div>`;

  const 줄 = (p) => {
    const 접힘 = p.cat !== 지금갈래;
    return `<div class="rowcard" data-tag="${U.esc(p.cat)}"${접힘 ? ' data-out-chip="1" hidden' : ''} data-href="${U.link('CS0301')}">
      ${p.thumb ? `<div class="thumb">${U.ph(['이벤트 배너', 800, 800], { seed: p.id, cls: 'ph-sq' })}</div>` : ''}
      <div class="bd">
        <div class="row wrap-row">${U.stBadge(p.cat)}<span class="t-sub">${U.esc(p.date)}</span></div>
        <div class="t-card mt2">${U.esc(p.t)}</div>
      </div>
      <div class="side">${U.btn('보기', { href: 'CS0301', cls: 'btn-ghost', sm: true })}</div>
    </div>`;
  };

  const body = `${U.leafHd(ctx, '「이벤트」 탭이 눌린 상태입니다. 탭을 옮기면 아래 목록이 실제로 줄어듭니다.')}

${고정.map((p) => `<div class="box mb6" style="border-left:4px solid var(--primary)">
  <div class="row wrap-row">${U.badge('중요', 'b-solid')}${U.stBadge(p.cat)}<span class="t-sub">${U.esc(p.date)}</span></div>
  <div class="t-card mt3">${U.esc(p.t)}</div>
  <p class="t-sub mt3">중요 공지는 어떤 탭을 고르셔도 늘 맨 위에 남습니다.</p>
  <div class="btns mt4">${U.btn('공지 전문 보기', { href: 'CS0301', cls: 'btn-sub', sm: true })}</div>
</div>`).join('')}

${칩상자}

<p class="t-sub mt6 mb4">${U.esc(지금갈래)} <b data-filter-cnt="post">${세기(지금갈래)}</b>건이 있어요 ·
  전체 ${나머지.length}건 (${갈래.map((c) => `${c} ${세기(c)}`).join(' · ')})</p>

<div class="stack" data-filter-list="post" style="gap:var(--sp-item)">
  ${나머지.map(줄).join('')}
</div>
<div hidden data-empty-for="post">${U.empty('🔍', '이 분류에는 글이 없어요', '다른 분류를 눌러 보시거나 「전체」로 돌아가 보세요.', U.btn('전체 보기', { href: 'HO0501', cls: 'btn-pri' }))}</div>

${U.banner('info', '📌', '<b>탭을 옮겨도 화면 주소는 그대로입니다.</b><div class="t-sub mt2">뒤로가기를 누르면 탭이 아니라 이벤트·공지 목록으로 돌아갑니다.</div>', { cls: 'mt8' })}

<div class="btns mt8">
  ${U.btn('이벤트·공지 목록으로', { href: 'HO0501', cls: 'btn-ghost' })}
  ${U.btn('결과 없음 화면 보기', { href: 'HO0503', cls: 'btn-ghost' })}
  ${U.btn('홈으로', { href: 'HO0101', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   HO0503 이벤트·공지 목록 > 결과 없음
   ⭐ 「무엇을 눌렀더니 결과가 없었나」가 보여야 한다 — 고른 조건을 그대로 적어 둔다.
      기간 고르개를 「2026년 6월」로 돌려 둔 상태다(가장 오래된 글이 ${POSTS 마지막} 이라 0건).
      줄은 미리 접어 두고(data-out-sel), 기간을 「전체」로 바꾸면 실제로 다시 나온다.
   ============================================================ */
P['HO0503'] = (ctx) => {
  const 나머지 = POSTS.filter((p) => !p.pin);
  const 달들 = [...new Set(나머지.map((p) => p.date.slice(0, 7)))].sort().reverse();
  const 빈달 = '2026-06';
  const 달글 = (m) => `${Number(m.slice(0, 4))}년 ${Number(m.slice(5, 7))}월`;
  const 고른달 = 달글(빈달);
  const 오래된것 = 나머지.reduce((a, b) => (a.date < b.date ? a : b));

  const 옵션 = ['전체 기간', ...달들.map(달글), 고른달];
  const 값 = ['전체', ...달들, 빈달];

  const 줄 = (p) => `<div class="rowcard" data-tag="${U.esc(p.cat)} ${p.date.slice(0, 7)}" data-out-sel="1" hidden data-href="${U.link('CS0301')}">
    <div class="bd">
      <div class="row wrap-row">${U.stBadge(p.cat)}<span class="t-sub">${U.esc(p.date)}</span></div>
      <div class="t-card mt2">${U.esc(p.t)}</div>
    </div>
    <div class="side">${U.btn('보기', { href: 'CS0301', cls: 'btn-ghost', sm: true })}</div>
  </div>`;

  const body = `${U.leafHd(ctx, '고른 조건에 맞는 글이 하나도 없을 때의 화면입니다')}

${U.card('이렇게 걸렀습니다', `${U.kv([
    ['분류', U.badge('전체', 'b-line')],
    ['기간', U.badge(고른달, 'b-warn')],
    ['남은 글', `<b class="dan"><span data-filter-cnt="post">0</span>건</b>`],
  ], { cls: 'left' })}
  <div class="row wrap-row mt6">
    <div class="grow">${U.chips(['전체', '공지', '이벤트', '휴무'], 0, { boxAttr: ' data-filter-for="post"' })}</div>
    <div style="width:200px">
      ${U.select(옵션, 옵션.length - 1, { vals: 값, attr: ' data-filter-sel="post"' })}
    </div>
  </div>
  <p class="t-sub mt4">기간을 「전체 기간」으로 바꾸면 ${나머지.length}건이 다시 나옵니다.</p>`, { cls: 'mb6' })}

<div class="stack" data-filter-list="post" style="gap:var(--sp-item)">
  ${나머지.map(줄).join('')}
</div>

<div data-empty-for="post">${U.empty('🗓️', `${고른달}에는 올라온 글이 없어요`,
    `가장 오래된 글이 ${U.esc(오래된것.date)}에 올라온 「${U.esc(오래된것.t)}」입니다. 그보다 앞선 달에는 아직 글이 없어요.`,
    `${U.btn('전체 기간으로 보기', { href: 'HO0501', cls: 'btn-pri' })}
     ${U.btn('카테고리 탭으로', { href: 'HO0502', cls: 'btn-ghost' })}`)}</div>

${U.banner('info', '🔔', `<b>새 글이 올라오면 알려드릴까요?</b>
  <div class="t-sub mt2">카카오톡 채널 ${U.조사(U.esc(SITE.kakao), '을', '를')} 추가해 두시면 휴무·이벤트 공지를 바로 받아 보실 수 있어요.</div>`,
    { cls: 'mt8', right: U.btn('자주 묻는 질문', { href: 'CS0101', cls: 'btn-sub', sm: true }) })}

<div class="btns mt8">
  ${U.btn('이벤트·공지 목록으로', { href: 'HO0501', cls: 'btn-ghost' })}
  ${U.btn('홈으로', { href: 'HO0101', cls: 'btn-pri' })}
</div>`;

  return { body, o: {} };
};
