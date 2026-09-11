/* 홈 (HO) — 17화면.
   HO01 홈(5) · HO02 카테고리 전체 보기(4) · HO03 안전거래·이용안내(4) · HO04 공지·이벤트(4)

   ⚠ 레이아웃 B 대시보드형 — 화면 위쪽은 «지표 카드 4개»(kpis)로 연다. 히어로를 두지 않는다.
     목록은 표(dashTable)로 낸다. 스펙팩 prompt 의 「가로 행」·「상단 GNB」는 손님이 AI 에게 줄 글이고,
     이 완성화면의 뼈대를 정하는 것은 레이아웃 프리셋이다(레이아웃_B_대시보드형.json).
   ⚠ 링크는 짧은 이름(SE-04)이나 이 팩 이름(HO0203)으로 적고 link() 에 맡긴다.
     화면 안에서는 HO-01, 파일은 HO0101 — 두 체계를 손으로 섞어 적지 않는다.
   ⚠ 상태·세부 화면(이름에 > 가 붙은 것)은 기준 화면의 조각을 그대로 쓰고
     «바뀐 자리»만 다르게 낸다. 통째로 새로 짓지 않는다. */
import {
  pageHd, kpis, dashTable, tableBar, sec, card, box, banner, badge, btn, chip, chips, tabs,
  table, kv, accordion, empty, hsteps, escrow, turnLine, feeRows, manner, itemCard, carousel,
  detailSplit, actPanel, filterPage, link, esc, won, num, stBadge, boostBadge, phItem,
} from './ui.mjs';
import {
  CATS, SUBCATS, TOWNS, TOTAL_ITEMS, ITEMS, onSale, itemBy, ago, userBy,
  NOTICES, UNREAD, UNREAD_MSGS, DEALS, SITE, BANNED, SCAMS, BOOSTS, BOOST_FREE_LEFT,
  FEE_RATE, fee, payout, ESCROW_STEPS,
  HO_SUBCAT_N, HO_subs, HO_subN, HO_RECENT_CATS, HO_TOWNS_POPULAR, HO_KEYWORDS, HO_KEYWORD_NEW,
  HO_RECENT_ITEMS, HO_ESCROW_DETAIL, HO_SCAM_TALK, HO_SCAM_STATS, HO_SCAM_TOTAL,
  HO_BAN_BORDER, HO_REPORT_FLOW, HO_REPORT_AVG, HO_MANNER_RULES, HO_words,
} from './data.mjs';

/* ── 한곳에서 세는 값 — 화면마다 손으로 적지 않는다 ───────────── */
const 오늘올라온 = ITEMS.filter((x) => x.min < 60 * 24).length;
const 진행중거래 = DEALS.filter((d) => d.st === '진행중').length;
const 금지품목 = BANNED.filter((b) => b.on);   // 올리는 즉시 «자동»으로 잡히는 것
/** 조치 배지 — 화면 셋이 같은 색을 쓴다 */
const 조치배지 = (act) => badge(act, act === '바로 숨김' ? 'b-danger' : (act === '검토 대기로' ? 'b-warn' : 'b-mut'));
const 가장많은분류 = CATS.reduce((a, c) => (c.n > a.n ? c : a), CATS[0]);

/** 이 동네가 어느 범위에 드는가 — 「내 동네=1 · 가까운 동네=2 · 조금 먼 동네=3」.
   줄에 실어 두면 app.js 거르개가 범위 칩으로 목록을 «실제로» 줄인다. */
const 범위값 = (town) => TOWNS.ranges
  .map((r, i) => (r.towns.includes(town) ? String(i + 1) : '')).filter(Boolean).join(',');

/** 홈 목록 — 끌올된 글을 위로, 그 다음은 올라온 지 가까운 순 */
const 홈목록 = () => [...onSale()].sort((a, b) => (b.boost - a.boost) || (a.min - b.min));

/** 매물 표 한 줄 — HO 갈래가 모두 같은 모양을 쓴다.
   ⚠ 상태 칸은 글자가 아니라 stBadge() 다. 색이 화면마다 갈리면 안 된다.
   ⚠ 정렬값(dist·min·wish·price)을 «줄에» 실어 둔다 — 안 실으면 고르개만 바뀌고
     차례는 그대로다(2026-09-01 검수에서 매칭 팩이 이것으로 걸렸다).
   o.pick 을 주면 맨 앞에 고르기 칸이 붙는다 — app.js 의 data-pick 이 고른 개수를 센다. */
const 매물행 = (it, o = {}) => ({
  data: {
    cat: it.cat, st: it.st, cond: it.cond, i: it.id, price: it.price,
    dist: it.dist, min: it.min, wish: it.wish,
    range: 범위값(it.town), ways: it.ways.join(','),
  },
  cells: [
    ...(o.pick ? ['<label class="check none"><input type="checkbox" data-pick aria-label="이 매물 고르기"></label>'] : []),
    `<span class="row-c">${phItem(40, it.id)}<span>
      <a class="strong" href="${link('SE-04')}">${esc(it.t)}</a>
      <span class="row-c" style="gap:4px;margin-top:2px">${it.boost ? boostBadge() : ''}${it.ways.includes('안전결제') ? badge('안전결제', 'b-ok') : ''}${badge(it.cond, 'b-mut')}</span>
    </span></span>`,
    `<span class="nowrap">${esc(it.town)}<span class="t-sub"> · ${it.dist}km</span></span>`,
    `<b class="nowrap">${won(it.price)}</b>`,
    `<span class="t-sub nowrap">${ago(it.min)}</span>`,
    `<span class="t-sub nowrap">♡ ${it.wish} · 채팅 ${it.chat}</span>`,
    stBadge(it.st),
  ],
});
const 매물표머리 = (pick) => [
  ...(pick ? [{ t: '<span class="t-sub">고르기</span>', w: '64px' }] : []),
  { t: '물건' }, { t: '동네', w: '132px' }, { t: '값', w: '116px' },
  { t: '올라온 지', w: '96px' }, { t: '관심', w: '128px' }, { t: '상태', w: '84px' },
];

/** 정렬 고르개 — 고른 기준으로 «차례가 실제로 바뀐다»(app.js 의 data-sort-cards).
   ⚠ 표의 tbody 에 data-sort-list 가 있어야 움직인다. 아래 매물표() 가 달아 준다. */
const 정렬고르개 = () => `<select class="input" style="width:auto;min-width:148px" data-sort-cards="items" aria-label="정렬 기준">
  <option value="dist">거리순</option>
  <option value="min">최신순</option>
  <option value="price">낮은 가격순</option>
  <option value="wish" data-desc>찜 많은순</option>
</select>`;

/** 매물 표 — 거르개(data-filter-list)와 정렬(data-sort-list)을 같은 tbody 에 함께 단다 */
const 매물표 = (rows, o = {}) => dashTable(매물표머리(o.pick), rows, { listKey: 'items' })
  .replace('data-filter-list="items"', 'data-filter-list="items" data-sort-list="items"');

/* ══════════════════════════════════════════════════════════════
   HO01 — 홈
   ══════════════════════════════════════════════════════════════ */

/** 홈의 지표 카드 넉 장 — 상태 화면들도 같은 자리를 쓴다(바뀌는 값만 넘겨 준다) */
const 홈지표 = () => kpis([
  ['오늘 올라온 매물', num(오늘올라온), { unit: '건', d: '24시간 안에 올라온 글', href: 'SE-02' }],
  ['가까운 동네 매물', num(TOWNS.ranges[1].n), { unit: '건', tone: 'k-acc', d: TOWNS.ranges[1].d, href: 'SE-02' }],
  ['안 읽은 채팅', num(UNREAD), { unit: '개', tone: 'k-warn', d: '답을 기다리는 이웃이 있어요', href: 'CH-01' }],
  ['진행 중인 거래', num(진행중거래), { unit: '건', tone: 'k-ok', d: '안전결제로 진행 중', href: 'PA-05' }],
]);

/** 카테고리 가로 줄 — 넘치는 줄은 «화살표»로 넘긴다. 스크롤바만 두면 지나친다. */
const 카테고리줄 = () => carousel(CATS.map((c) => `<a class="cat-tile" href="${link('HO0201')}">
  <span class="ic">${c.ic}</span><span class="nm">${esc(c.nm)}</span><span class="n">${num(c.n)}</span></a>`).join(''), { cls: 'cat-row' });

const 공지미리 = () => `<div class="notice-list">${NOTICES.slice(0, 3).map((n) => `<a class="notice-row${n.imp ? ' imp' : ''}" href="${link('HO-04')}">
  <span>${badge(n.c, n.c === '이벤트' ? 'b-acc' : 'b-pri')}</span>
  <span class="t">${esc(n.t)}</span>
  <span class="at">${n.at}</span>
  <span class="hit">${num(n.hit)}</span></a>`).join('')}</div>`;

const 사기띠 = () => banner('warn', '⚠', `<b>시세보다 너무 싼 물건은 의심하세요.</b>
  값을 먼저 보내 달라는 말은 사기일 수 있어요. 안전결제를 쓰면 물건을 받은 뒤에 돈이 넘어갑니다.`,
  { right: btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' }) });

export const PAGES = {
  /* ── HO0101 홈 ─────────────────────────────────────── */
  HO0101(ctx) {
    /* 끌올된 글이 맨 위, 그 다음은 «거리순»이 기본이다(스펙팩 기능정의).
       고르개를 바꾸면 app.js 가 줄에 실린 값으로 차례를 실제로 다시 세운다. */
    const 목록 = [...onSale()].sort((a, b) => (b.boost - a.boost) || (a.dist - b.dist));
    const 인기 = [...onSale()].sort((a, b) => (b.wish - a.wish) || (b.view - a.view)).slice(0, 6);
    const 범위칩 = TOWNS.ranges.map((r, i) =>
      chip(`${r.k} <span class="n">${num(r.n)}</span>`, i === 1, ` data-go="${link('HO0103')}"`)).join('');

    const body = `
${pageHd(`${esc(SITE.myTown)} 장터`, `이웃이 올린 물건 ${num(TOTAL_ITEMS)}개가 지금 올라와 있어요`,
      `<div class="btns">${btn('내 동네 설정', { href: 'SE-01', cls: 'btn-ghost' })}${btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' })}</div>`)}

${홈지표()}

${sec('어느 동네까지 볼까요', `
  <div class="chips">${범위칩}</div>
  <p class="t-sub mt3">칩을 누르면 <a class="link" href="${link('HO0103')}">목록이 그 범위로 다시 채워집니다</a>.
  동네를 아직 안 정하셨나요? <a class="link" href="${link('HO0102')}">동네를 정하기 전 화면</a>을 먼저 볼 수 있어요.</p>
  <div class="searchbar mt4"><span class="ic">🔍</span>
    <input type="search" placeholder="물건 이름으로 찾아보세요 (예: 무선청소기)" aria-label="매물 검색">
    ${btn('찾기', { href: 'SE-03', cls: 'btn-pri' })}</div>`, { desc: '범위를 넓히면 더 멀리 있는 물건까지 보여요.' })}

${sec('무엇을 찾으세요', 카테고리줄(), { more: 'HO0201', moreLabel: '카테고리 전체' })}

${sec('', banner('acc', '🔔', `<b>관심 키워드에 걸린 새 매물이 ${HO_KEYWORD_NEW}건 있어요.</b>
  걸어 둔 말이 든 글이 올라오면 알려드립니다.`,
      { right: btn('내 활동이 얹힌 홈 보기', { href: 'HO0104', cls: 'btn-ghost btn-sm' }) }))}

${sec('인기 매물', carousel(인기.map((it) => itemCard(it, { why: `찜 ${it.wish}` })).join('')),
      { desc: '이번 주에 찜과 조회가 많았던 물건이에요.', more: 'SE-02', moreLabel: '매물 전체' })}

${sec('지금 올라온 매물', `
  ${tableBar(`<b>${num(목록.length)}건</b> <span class="t-sub">· 끌올된 글이 맨 위, 그 다음은 거리순</span>
      <span class="t-sub" data-pick-empty> · 왼쪽 칸으로 여러 개를 골라 한꺼번에 찜할 수 있어요</span>
      <span class="row-c" data-pick-bar hidden style="gap:8px"><b data-pick-n>0</b>개 골랐어요
        <button class="btn btn-pri btn-sm is-off" type="button" data-pick-go disabled
          data-toast="고른 매물을 모두 찜했어요">고른 매물 한꺼번에 찜하기</button>
        <span class="t-sub">두 개 이상 고르면 눌립니다</span></span>`,
      `${정렬고르개()}${btn('끌올 글은 왜 위에 있나요', { href: 'HO0105', cls: 'btn-quiet btn-sm' })}${btn('매물 전체 보기', { href: 'SE-02', cls: 'btn-ghost btn-sm' })}`)}
  ${매물표(목록.map((it) => 매물행(it, { pick: true })), { pick: true })}`)}

${sec('', 사기띠())}

${sec('공지·이벤트', card('', 공지미리(), { bdCls: 'flush' }), { more: 'HO-04' })}
`;
    return { body, o: {} };
  },

  /* ── HO0102 홈 > 동네 미설정 상태 ──────────────────────
     ⛔ 「동네 인증을 마치면 열립니다」라고 써 놓고 여는 길이 없으면 거짓말이 된다.
       잠근 단추 옆에 «가는 길»을 반드시 둔다. */
  HO0102(ctx) {
    const 지역행 = HO_TOWNS_POPULAR.map((t) => ({
      cells: [
        `<b>${esc(t.nm)}</b>`,
        `<span class="t-sub">${esc(t.gu)}</span>`,
        `<span class="nowrap">${num(t.n)}건</span>`,
        `<div class="right">${btn('둘러보기', { href: 'SE-02', cls: 'btn-ghost btn-xs' })}</div>`,
      ],
    }));

    const body = `
${pageHd('우리동네장터', '먼저 동네를 정해주세요 — 정하고 나면 가까운 물건부터 보여드려요',
      `<div class="btns">${btn('내 동네 설정', { href: 'SE-01', cls: 'btn-pri' })}</div>`)}

${kpis([
      ['설정된 동네', '없음', { tone: 'k-mut', d: '아직 정하지 않았어요', href: 'SE-01' }],
      ['둘러볼 수 있는 매물', num(TOTAL_ITEMS), { unit: '건', tone: 'k-acc', d: '동네를 정하면 가까운 순으로 보여요' }],
      ['판매글 쓰기', '잠김', { tone: 'k-warn', d: '동네 인증을 마치면 열려요' }],
      ['인기 지역', HO_TOWNS_POPULAR.length, { unit: '곳', d: '예시로 먼저 둘러볼 수 있어요' }],
    ])}

${sec('', banner('info', '📍', `<b>먼저 동네를 정해주세요.</b>
  이곳은 가까운 이웃끼리 사고파는 장터라, 동네를 정해야 목록을 채울 수 있어요.
  동네는 언제든 바꿀 수 있고, 범위도 세 단계(내 동네 · 가까운 동네 · 조금 먼 동네)로 넓힐 수 있습니다.`,
      { right: btn('내 동네 설정', { href: 'SE-01', cls: 'btn-pri btn-sm' }) }))}

${sec('세 걸음이면 끝나요', `${hsteps(['동네 고르기', '동네 인증', '매물 보기'], 0)}
  <p class="t-sub mt4">동네 인증은 한 번만 합니다. 인증을 마치면 판매글도 쓸 수 있어요.</p>`)}

${sec('지금은 목록을 채울 수 없어요',
      card('', empty('📍', '동네를 정하면 여기에 매물이 보여요',
        '이웃이 올린 물건을 거리순으로 보여드립니다. 아래 인기 지역으로 먼저 둘러볼 수도 있어요.',
        `${btn('내 동네 설정', { href: 'SE-01', cls: 'btn-pri' })}${btn('매물 전체 둘러보기', { href: 'SE-02', cls: 'btn-ghost' })}`)))}

${sec('인기 지역으로 둘러보기', `
  ${tableBar('<span class="t-sub">동네를 정하지 않아도 미리 볼 수 있어요. 값·채팅은 동네를 정한 뒤에 열립니다.</span>')}
  ${dashTable([{ t: '동네' }, { t: '구', w: '120px' }, { t: '등록 매물', w: '120px' }, { t: '', w: '110px' }], 지역행)}`)}

${sec('판매글 쓰기는 아직 잠겨 있어요', box(`<div class="row-b wrap-row" style="gap:16px">
    <div>
      <b>동네 인증을 마쳐야 글을 쓸 수 있어요</b>
      <p class="t-sub mt1">허위 매물과 원거리 사기를 막으려고, 글을 쓰기 전에 그 동네에 있다는 것을 한 번 확인합니다.
      인증은 동네 설정 화면에서 바로 할 수 있어요.</p>
    </div>
    <div class="btns">${btn('판매글 쓰기', { cls: 'btn-pri', off: true })}${btn('내 동네 설정하러 가기', { href: 'SE-01', cls: 'btn-ghost' })}</div>
  </div>`))}

${sec('', 사기띠())}
`;
    /* ⚠ 상단 바에 「📍역삼동」이 뜨면 「설정된 동네 없음」과 화면이 다른 말을 한다.
       o.guest 를 주면 상단 바가 「이용 안내 · 내 동네 설정」으로 바뀌고
       사이드바도 둘러보기 두 묶음으로 줄어든다 — 동네를 아직 안 정한 사람이 보는 길이다. */
    return { body, o: { guest: true, state: '동네를 아직 정하지 않은 상태' } };
  },

  /* ── HO0103 홈 > 동네 범위 전환 ────────────────────────
     칩은 «켜짐 표시만» 바뀌면 안 된다 — 줄에 data-range 를 실어 두고
     app.js 거르개(data-filter)가 목록을 실제로 줄인다. */
  HO0103(ctx) {
    const 목록 = 홈목록();
    const 칩 = TOWNS.ranges.map((r, i) => chip(
      `${r.k} <span class="n">${num(r.n)}</span>`, i === 1,
      ` data-filter="items" data-f-key="range" data-f-val="${i + 1}" data-toast="${esc(r.k)}(${esc(r.d)})까지 넓혀 다시 채웠어요"`)).join('');
    const 늘어난 = TOWNS.ranges[1].n - TOWNS.ranges[0].n;

    const body = `
${pageHd('어느 동네까지 볼까요', '고른 범위는 다음에 들어와도 그대로 이어집니다',
      `<div class="btns">${btn('내 동네 바꾸기', { href: 'SE-01', cls: 'btn-ghost' })}${btn('홈으로', { href: 'HO0101', cls: 'btn-quiet' })}</div>`)}

${kpis([
      ['내 동네', num(TOWNS.ranges[0].n), { unit: '건', tone: 'k-mut', d: TOWNS.ranges[0].d }],
      ['가까운 동네', num(TOWNS.ranges[1].n), { unit: '건', d: `${TOWNS.ranges[1].d} · 지금 보는 범위` }],
      ['조금 먼 동네', num(TOWNS.ranges[2].n), { unit: '건', tone: 'k-mut', d: TOWNS.ranges[2].d }],
      ['넓혀서 늘어난 매물', num(늘어난), { unit: '건', tone: 'k-acc', d: '내 동네보다 이만큼 더 보여요' }],
    ])}

${sec('범위 고르기', `
  <div class="chips">${칩}</div>
  <p class="t-sub mt3">칩을 누르면 아래 목록이 그 범위의 물건만 남기고 다시 채워집니다.
  범위별 건수는 동네에 등록된 전체 매물 수예요.</p>`)}

${sec('가까운 동네까지 본 목록', `
  ${tableBar(`<b data-filter-count="items">${목록.length}</b>건 보는 중
      <span class="t-sub">· 전체 <span data-filter-total="items">${목록.length}</span>건</span>
      <span data-filter-applied="items" hidden><span data-filter-applied-in></span></span>`,
      `${정렬고르개()}${btn('조건 모두 풀기', { cls: 'btn-quiet btn-sm', attr: ' data-filter-reset="items"' })}${btn('매물 전체 보기', { href: 'SE-02', cls: 'btn-ghost btn-sm' })}`)}
  ${매물표(목록.map(매물행))}
  <div data-filter-empty="items" hidden class="mt4">
    ${empty('🔍', '이 범위에는 올라온 물건이 없어요', '범위를 한 단계 넓혀 보시면 가까운 동네의 물건까지 보여드려요.',
      btn('조건 모두 풀기', { cls: 'btn-ghost', attr: ' data-filter-reset="items"' }))}
  </div>`)}

${sec('', banner('info', '📌', `<b>고른 범위는 기억해 둡니다.</b>
  다음에 들어와도 「${TOWNS.ranges[1].k}」로 열립니다. 바꾸고 싶으면 위 칩을 다시 누르세요.`))}
`;
    return { body, o: { state: '가까운 동네까지 범위를 넓힌 상태' } };
  },

  /* ── HO0104 홈 > 로그인 상태(개인화) ───────────────── */
  HO0104(ctx) {
    const 거래 = DEALS.find((d) => d.st === '진행중') || DEALS[0];
    const 물건 = itemBy(거래.item);
    const 상대 = userBy(거래.with);
    const 최근 = HO_RECENT_ITEMS.map(itemBy);
    const 걸린매물 = HO_KEYWORDS.map((k) => itemBy(k.item));

    const 키워드카드 = `<div class="g3">${HO_KEYWORDS.map((k) => card('', `
      <div class="row-b"><b>${esc(k.w)}</b>${badge(`새 글 ${k.n}건`, 'b-acc')}</div>
      <p class="t-sub mt2">가장 최근 글 ${esc(k.at)}</p>
      <div class="btns mt3">${btn('걸린 글 보기', { href: 'SE-03', cls: 'btn-ghost btn-sm' })}</div>`)).join('')}</div>`;

    const body = `
${pageHd(`${esc(SITE.myNick)}님, 안녕하세요`, `${esc(SITE.myTown)} 기준으로 오늘의 물건을 골라 두었어요`,
      `<div class="btns">${btn('알림 설정', { href: 'MY-06', cls: 'btn-ghost' })}${btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' })}</div>`)}

${kpis([
      ['안 읽은 채팅', num(UNREAD), { unit: '개', tone: 'k-warn', d: `안 읽은 메시지 ${UNREAD_MSGS}개`, href: 'CH-01' }],
      ['진행 중인 거래', num(진행중거래), { unit: '건', tone: 'k-ok', d: '안전결제로 진행 중', href: 'PA-05' }],
      ['관심 키워드 새 매물', num(HO_KEYWORD_NEW), { unit: '건', tone: 'k-acc', d: `키워드 ${HO_KEYWORDS.length}개를 걸어 뒀어요`, href: 'MY-06' }],
      ['최근 본 매물', num(최근.length), { unit: '개', tone: 'k-mut', d: '7일 안에 본 물건', href: 'MY-03' }],
    ])}

${sec('진행 중인 거래', card('', `
  <div class="row-b wrap-row" style="gap:12px">
    <div class="row-c">${phItem(48, 물건.id)}<div>
      <b>${esc(물건.t)}</b>
      <div class="t-sub mt1">${esc(상대.nick)}님과 ${esc(거래.side)} · ${won(거래.price)}</div></div></div>
    <div class="btns">${btn('거래 진행 보기', { href: 'PA-05', cls: 'btn-pri btn-sm' })}${btn('채팅 열기', { href: 'CH-02', cls: 'btn-ghost btn-sm' })}</div>
  </div>
  <div class="mt4">${escrow(거래.step, [거래.paidAt, 거래.sentAt || '', '', ''])}</div>
  ${turnLine(거래.leftLabel, 거래.left)}`), { more: 'PA-05', moreLabel: '거래 전체 보기' })}

${sec('관심 키워드에 걸린 새 매물', 키워드카드, { more: 'MY-06', moreLabel: '키워드 관리' })}

${sec('최근 본 매물', carousel(최근.map((it) => itemCard(it)).join('')), { desc: '이어서 보시겠어요? 값이 내려가면 알려드릴게요.' })}

${sec('키워드에 걸린 글', `
  ${tableBar(`<b>${걸린매물.length}건</b> <span class="t-sub">· 걸어 둔 말이 든 글만 모았어요</span>`,
      btn('매물 전체 보기', { href: 'SE-02', cls: 'btn-ghost btn-sm' }))}
  ${매물표(걸린매물.map(매물행))}`)}

${sec('', 사기띠())}
`;
    return { body, o: { state: '로그인해서 내 활동이 얹힌 상태' } };
  },

  /* ── HO0105 홈 > 끌올 글 구분 표시 ──────────────────── */
  HO0105(ctx) {
    const 목록 = 홈목록();
    const 끌올 = 목록.filter((x) => x.boost);
    const 일반 = 목록.filter((x) => !x.boost);

    const body = `
${pageHd('지금 올라온 매물', '끌올된 글은 위쪽에 모아 두고, 광고라는 것을 배지로 알려드려요',
      `<div class="btns">${btn('끌올·광고 안내', { href: 'BS-01', cls: 'btn-ghost' })}${btn('홈으로', { href: 'HO0101', cls: 'btn-quiet' })}</div>`)}

${kpis([
      ['끌올된 글', num(끌올.length), { unit: '건', tone: 'k-acc', d: '값을 치르고 위로 올린 글', href: 'BS-01' }],
      ['일반 글', num(일반.length), { unit: '건', d: '올라온 지 가까운 차례' }],
      ['무료 끌올까지', BOOST_FREE_LEFT, { tone: 'k-mut', d: '무료 끌올은 24시간에 한 번이에요' }],
      ['즉시 끌올 값', won(BOOSTS[0].price), { tone: 'k-warn', d: BOOSTS[0].d, href: 'BS-01' }],
    ])}

${sec('', banner('info', 'ℹ️', `<b>「${boostBadge()}」 배지가 붙은 글은 판매자가 값을 치르고 목록 위로 올린 글이에요.</b>
  광고라는 것을 숨기지 않습니다. 배지에 마우스를 올리면 같은 안내가 한 줄로 뜹니다.
  옅은 바탕에 모여 있는 위쪽 묶음이 끌올된 글이고, 아래 목록은 올라온 차례 그대로입니다.`,
      { right: btn('끌올은 어떻게 하나요', { href: 'BS-01', cls: 'btn-ghost btn-sm' }) }))}

${sec('끌올된 글', box(`
  ${tableBar(`${boostBadge()} <b>${num(끌올.length)}건</b> <span class="t-sub">· 판매자가 값을 치르고 위로 올린 글이에요</span>`,
      btn('내 글도 끌올하기', { href: 'BS-01', cls: 'btn-acc btn-sm' }))}
  ${dashTable(매물표머리(), 끌올.map(매물행))}`, { cls: 'soft' }))}

${sec('일반 글', `
  ${tableBar(`<b>${num(일반.length)}건</b> <span class="t-sub">· 올라온 지 가까운 차례</span>`,
      btn('매물 전체 보기', { href: 'SE-02', cls: 'btn-ghost btn-sm' }))}
  ${매물표(일반.map(매물행))}`)}

${sec('', banner('quiet', '💡', `끌올은 «순서»만 바꿉니다. 값·상태·거래 방식은 그대로이고,
  끌올했다고 해서 더 안전한 글이라는 뜻은 아니에요. 값이 시세보다 크게 싸면 끌올된 글이라도 의심하세요.`,
      { right: btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' }) }))}
`;
    return { body, o: { state: '끌올된 글을 따로 구분해 보여 주는 상태' } };
  },

  /* ══════════════════════════════════════════════════════════
     HO02 — 카테고리 전체 보기
     ══════════════════════════════════════════════════════════ */
  HO0201: (ctx) => 분류화면({ 고른키: 'digital', 지금: 'HO0201' }),
  HO0202: (ctx) => 분류화면({ 고른키: 'home', 지금: 'HO0202', 상태: '생활가전 대분류를 고른 상태' }),
  HO0203: (ctx) => 분류화면({ 고른키: 'digital', 지금: 'HO0203', 소분류: '태블릿', 상태: '소분류(태블릿)를 골라 미리보기를 편 상태' }),
  HO0204: (ctx) => 분류화면({ 고른키: 'plant', 지금: 'HO0204', 소분류: '씨앗', 상태: '고른 소분류에 매물이 없는 상태' }),

  /* ══════════════════════════════════════════════════════════
     HO03 — 안전거래·이용안내
     ══════════════════════════════════════════════════════════ */

  /* ── HO0301 안전거래·이용안내 ──────────────────────── */
  HO0301(ctx) {
    const 예시값 = 300000;
    const 수수료 = fee(예시값);

    const 흐름 = `<div class="g3">${[
      ['①', '판매글을 올린다', '사진을 찍고 물건 상태와 값을 적어 올립니다. 동네 인증을 한 번 해야 글을 쓸 수 있어요.'],
      ['②', '채팅으로 이야기한다', '값을 맞추고 만날 자리와 시간을 정합니다. 여기서 가격 제안을 주고받을 수 있어요.'],
      ['③', '직거래 또는 안전결제', '가까우면 만나서 주고받고, 멀면 안전결제로 보냅니다. 돈은 받은 뒤에 넘어갑니다.'],
    ].map(([n, t, d]) => card('', `<div class="t-sec">${n}</div><div class="t-card mt2">${t}</div>
      <p class="t-sub mt2">${d}</p>`)).join('')}</div>`;

    const 비교표 = table(
      [{ t: '', w: '26%' }, { t: '직거래' }, { t: '안전결제' }],
      [
        ['돈이 언제 넘어가나', '만나서 바로', '물건을 받고 「받았어요」를 누른 뒤'],
        ['드는 비용', '없음', `물건 값의 ${(FEE_RATE * 100).toFixed(1)}% (파는 쪽이 냅니다)`],
        ['만나야 하나', '네, 약속을 잡습니다', '아니요, 택배로 보냅니다'],
        ['문제가 생기면', '둘이 이야기해서 풀어야 합니다', '운영자가 양쪽 말과 사진을 보고 판단합니다'],
        ['걸리는 시간', '약속을 잡으면 그날', '보통 3~5일'],
      ], { scroll: false });

    const 사기탭 = `<div>
      ${tabs(SCAMS.map((s, i) => ({ label: s.k, cnt: HO_SCAM_STATS[s.k], pane: 'sc' + i })), 0)}
      <div class="mt4">${SCAMS.map((s, i) => `<div data-pane-body="sc${i}"${i === 0 ? '' : ' hidden'}>
        ${card('', `<p class="t-sub">이런 말이 나옵니다</p>
          <p class="mt2" style="font-size:16px">${esc(s.talk)}</p>
          <div class="mt4">${banner('warn', '🛡', `<b>이렇게 하세요</b><div class="t-sub mt1">${esc(s.how)}</div>`)}</div>`)}
      </div>`).join('')}</div>
    </div>`;

    const 금지표 = table(
      [{ t: '품목', w: '24%' }, { t: '왜 안 되나요' }, { t: '올리면 어떻게 되나요', w: '20%' }],
      BANNED.map((b) => [b.k, b.why, 조치배지(b.act)]),
      { scroll: false });

    const main = `
${sec('이렇게 거래합니다', 흐름)}

${sec('직거래와 안전결제, 무엇이 다른가요', 비교표)}

${sec('안전결제는 이렇게 굴러갑니다', `
  ${escrow(1, ['9/5 14:20', '', '', ''])}
  ${turnLine('지금은 ② 발송 차례입니다 — 판매자가 물건을 보내면 다음 칸으로 넘어가요', '2일 6시간')}
  <div class="mt-block">${accordion(HO_ESCROW_DETAIL.map((e, i) => ({
      q: `${['①', '②', '③', '④'][i]} ${e.k} — 이때 돈은 어디 있나요? ${badge(e.keep, 'b-mut')}`,
      a: `<p>${esc(e.sum)}</p><p class="mt2"><b>돈은 여기 있습니다 — ${esc(e.money)}</b></p><p class="t-sub mt2">${esc(e.more)}</p>`,
    })), 0)}</div>`, { more: 'HO0302', moreLabel: '단계별로 자세히' })}

${sec('수수료는 이렇게 빠집니다', card('', `
  ${feeRows(예시값, 수수료, payout(예시값))}
  <p class="t-sub mt3">수수료는 <b>파는 쪽</b>이 냅니다. 사는 쪽은 물건 값과 배송비만 내면 됩니다.</p>`))}

${sec('자주 나오는 사기 수법', 사기탭, { more: 'HO0303', moreLabel: '유형별 대화 예시' })}

${sec('올릴 수 없는 물건', 금지표, { more: 'HO0304', moreLabel: '왜 안 되는지 펼쳐 보기' })}

${sec('신고하면 어떻게 되나요', `
  ${hsteps(HO_REPORT_FLOW, 1)}
  <p class="t-sub mt4">평균 <b>${HO_REPORT_AVG}</b> 안에 처리합니다. 조치는 경고 · 글 삭제 · 노출 제한 · 이용 정지 중에서 정해지고,
  신고한 분과 신고당한 분 모두에게 결과를 알려드립니다.</p>
  <div class="btns mt4">${btn('신고·차단 화면 보기', { href: 'CH-04', cls: 'btn-ghost' })}</div>`)}

${sec('매너 온도가 무엇인가요', card('', `
  <div class="row-c wrap-row" style="gap:20px">
    ${manner(36.5, { big: true })}
    <div><p class="t-sub">누구나 <b>36.5도</b>에서 시작합니다.</p>
    <p class="t-sub mt1">좋은 후기를 받으면 오르고, 아쉬운 후기를 받으면 내려갑니다. 응답률도 조금 반영됩니다.</p></div>
  </div>
  <div class="mt4">${table([{ t: '온도', w: '22%' }, { t: '무엇이 달라지나요' }], HO_MANNER_RULES, { scroll: false })}</div>`))}

${sec('다투게 되면', banner('info', '⚖', `<b>안전결제 거래라면 운영자가 개입합니다</b>
  <div class="t-sub mt1">받은 물건이 설명과 다르면 «구매확정을 누르기 전에» 신고하세요.
  양쪽 사진과 대화를 보고 전액 환불 · 판매자 정산 · 일부 환불 중에서 판단합니다.
  직거래는 당사자끼리 푸는 것이 원칙이지만, 사기가 의심되면 신고해 주세요.</div>`,
      { right: btn('1:1 문의', { href: 'CS-02', cls: 'btn-ghost btn-sm' }) }))}
`;

    const acts = actPanel('안전하게 거래하기', kv([
      ['수수료', `${(FEE_RATE * 100).toFixed(1)}% · 파는 쪽`],
      ['정산', '구매확정 뒤 영업일 5일'],
      ['신고 처리', `평균 ${HO_REPORT_AVG}`],
      ['매너 온도', '36.5도에서 시작'],
    ]), `${btn('안전결제 자세히 보기', { href: 'PA-01', cls: 'btn-pri btn-block' })}
      ${btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost btn-block' })}
      ${btn('신고·차단', { href: 'CH-04', cls: 'btn-line btn-block' })}`)
      + actPanel('더 볼 것', kv([
        ['단계별 설명', `<a class="link" href="${link('HO0302')}">안전결제 4단계</a>`],
        ['사기 유형', `<a class="link" href="${link('HO0303')}">대화 예시로 보기</a>`],
        ['금지 품목', `<a class="link" href="${link('HO0304')}">왜 안 되는지</a>`],
      ]), '');

    const body = `
${pageHd('안전거래·이용안내', '돈이 언제 어디에 있는지, 문제가 생기면 누가 도와주는지 적어 두었어요')}

${kpis([
      ['안전결제 수수료', (FEE_RATE * 100).toFixed(1), { unit: '%', d: '파는 쪽이 냅니다' }],
      ['신고 평균 처리', '6', { unit: '시간', tone: 'k-warn', d: HO_REPORT_FLOW.join(' → ') }],
      ['매너 온도 시작점', '36.5', { unit: '도', tone: 'k-acc', d: '후기가 쌓여 오르내려요' }],
      ['올릴 수 없는 품목', BANNED.length, { unit: '종', tone: 'k-danger', d: `${금지품목.length}종은 올리는 즉시 자동으로 잡혀요`, href: 'HO0304' }],
    ])}

${detailSplit(main, acts)}
`;
    return { body, o: {} };
  },

  /* ── HO0302 안전거래 > 안전결제 단계 아코디언 ────────── */
  HO0302(ctx) {
    const 톤 = ['', 'k-warn', 'k-acc', 'k-ok'];
    const 항목 = HO_ESCROW_DETAIL.map((e, i) => ({
      q: `${['①', '②', '③', '④'][i]} ${e.k} — ${esc(e.sum)} ${badge(e.keep, 'b-mut')}`,
      a: `<p><b>이때 돈은 어디 있나 — ${esc(e.money)}</b></p>
        <p class="t-sub mt2">${esc(e.more)}</p>
        <div class="mt3">${kv([['걸리는 기간', e.keep], ['이 단계에서 할 일', e.sum]], { cls: 'left' })}</div>`,
    }));

    const body = `
${pageHd('안전결제 4단계', '칸을 누르면 「이때 돈은 어디 있나」가 펼쳐집니다 — 접으면 요약 한 줄만 남아요',
      `<div class="btns">${btn('안전결제 시작', { href: 'PA-01', cls: 'btn-pri' })}</div>`)}

${kpis(HO_ESCROW_DETAIL.map((e, i) => [e.k, e.keep, { tone: 톤[i], d: e.money.length > 26 ? e.money.slice(0, 25) + '…' : e.money }]))}

${sec('지금 어디까지 왔나', `
  ${escrow(1, ['9/5 14:20', '', '', ''])}
  ${turnLine('지금은 ② 발송 차례입니다 — 판매자가 운송장을 올리면 다음 칸으로 넘어가요', '2일 6시간')}`)}

${sec('단계마다 펼쳐 보기', accordion(항목, [0, 1]),
      { desc: '①·②는 펼쳐 두었고 ③·④는 접어 두었습니다. 접으면 요약 한 줄만 보입니다.' })}

${sec('기한을 넘기면', table(
      [{ t: '단계', w: '18%' }, { t: '기한' }, { t: '넘기면 어떻게 되나요' }],
      [
        ['② 발송', '3일', '자동으로 취소되고 구매자에게 전액 환불됩니다'],
        ['③ 수령 확인', '받은 뒤 7일', '자동으로 구매확정되어 판매자에게 정산이 시작됩니다'],
        ['④ 정산', '영업일 5일', '계좌 정보가 잘못되면 정산이 멈추고 알림이 갑니다'],
      ], { scroll: false }), { desc: '기한이 다가오면 알림으로 먼저 알려드려요.' })}

${sec('', banner('warn', '⚠', `<b>③ 수령 확인을 누르기 전에 물건을 꼭 열어 보세요.</b>
  「받았어요」를 누르면 돈이 판매자에게 넘어가 되돌리기 어렵습니다.
  설명과 다르면 누르지 말고 바로 신고해 주세요.`,
      { right: btn('신고·차단', { href: 'CH-04', cls: 'btn-ghost btn-sm' }) }))}
`;
    return { body, o: { state: '4단계를 펼쳐 본 상태' } };
  },

  /* ── HO0303 안전거래 > 사기 유형 탭 ────────────────── */
  HO0303(ctx) {
    const 대화 = (k) => `<div class="talk-wrap">${(HO_SCAM_TALK[k] || []).map((l) => `
      <div class="bub${l.me ? ' me' : ''}">${l.link ? `<span class="danger">${esc(l.t)}</span>` : esc(l.t)}</div>`).join('')}</div>`;

    const 판 = `<div>
      ${tabs(SCAMS.map((s, i) => ({ label: s.k, cnt: HO_SCAM_STATS[s.k], pane: 'sc' + i })), 0)}
      <div class="mt4">${SCAMS.map((s, i) => `<div data-pane-body="sc${i}"${i === 0 ? '' : ' hidden'}>
        ${card(`${esc(s.k)} — 실제로 오가는 대화`, `
          ${대화(s.k)}
          <div class="mt4">${banner('dan', '🚨', `<b>이런 말이 나오면 멈추세요</b><div class="t-sub mt1">${esc(s.talk)}</div>`)}</div>
          <div class="mt3">${banner('ok', '🛡', `<b>이렇게 하세요</b><div class="t-sub mt1">${esc(s.how)}</div>`)}</div>
          <div class="btns mt4">${btn('이 대화 신고하기', { href: 'CH-04', cls: 'btn-danger btn-sm' })}${btn('안전결제로 거래하기', { href: 'PA-01', cls: 'btn-ghost btn-sm' })}</div>`,
      { aside: badge(`최근 30일 신고 ${HO_SCAM_STATS[s.k]}건`, 'b-warn') })}
      </div>`).join('')}</div>
    </div>`;

    const body = `
${pageHd('자주 나오는 사기 수법', '탭을 누르면 그 유형의 대화 예시와 대처법으로 바뀝니다',
      `<div class="btns">${btn('안전거래 안내로', { href: 'HO0301', cls: 'btn-quiet' })}${btn('신고·차단', { href: 'CH-04', cls: 'btn-pri' })}</div>`)}

${kpis([
      ['최근 30일 사기 신고', num(HO_SCAM_TOTAL), { unit: '건', tone: 'k-danger', d: '아래 세 유형이 대부분이에요' }],
      ['선입금 유도', num(HO_SCAM_STATS['선입금 유도']), { unit: '건', tone: 'k-warn', d: '가장 많은 수법이에요' }],
      ['가짜 안전결제 링크', num(HO_SCAM_STATS['가짜 안전결제 링크']), { unit: '건', tone: 'k-acc', d: '바깥 링크는 누르지 마세요' }],
      ['물건 바꿔치기', num(HO_SCAM_STATS['물건 바꿔치기']), { unit: '건', tone: 'k-mut', d: '구매확정 전에 신고하세요' }],
    ])}

${sec('유형별로 보기', 판)}

${sec('세 가지를 한눈에', table(
      [{ t: '유형', w: '22%' }, { t: '이렇게 다가옵니다' }, { t: '이렇게 막습니다' }],
      SCAMS.map((s) => [s.k, s.talk, s.how]), { scroll: false }))}

${sec('', banner('info', '🔒', `<b>안전결제는 채팅 안의 [안전결제로 거래하기] 버튼으로만 시작합니다.</b>
  채팅으로 받은 바깥 링크는 누르지 마세요. 우리 주소와 비슷하게 꾸민 가짜 결제창이 많습니다.`,
      { right: btn('안전결제 안내', { href: 'PA-01', cls: 'btn-ghost btn-sm' }) }))}
`;
    return { body, o: { state: '「선입금 유도」 탭을 고른 상태' } };
  },

  /* ── HO0304 안전거래 > 금지 품목 표 펼치기 ─────────── */
  HO0304(ctx) {
    const 숨김 = BANNED.filter((b) => b.act === '바로 숨김');
    const 검토 = BANNED.filter((b) => b.act === '검토 대기로');
    const 최근건수 = BANNED.reduce((a, b) => a + b.n, 0);

    const 경계 = (k) => {
      const b = HO_BAN_BORDER[k];
      if (!b) return '';
      return `<div class="mt3">${kv([
        ['올릴 수 있어요', b.ok.map((t) => badge(t, 'b-ok')).join(' ')],
        ['올릴 수 없어요', b.no.map((t) => badge(t, 'b-dan')).join(' ')],
      ], { cls: 'left' })}</div>`;
    };

    const 항목 = BANNED.map((b) => ({
      q: `${esc(b.k)} ${조치배지(b.act)}`,
      a: `<p><b>왜 안 되나요 — ${esc(b.why)}</b></p>
        ${경계(b.k)}
        <p class="t-sub mt3">최근 30일에 이 품목으로 ${b.n}건이 걸렸습니다.
        ${b.on ? '올리면 자동으로 잡힙니다.' : '지금은 자동 차단을 켜 두지 않아, 신고가 들어오면 사람이 봅니다.'}</p>
        <div class="btns mt3">${btn('이런 글 신고하기', { href: 'CH-04', cls: 'btn-danger btn-sm' })}${btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost btn-sm' })}</div>`,
    }));

    const body = `
${pageHd('올릴 수 없는 물건', '품목을 누르면 왜 안 되는지와 「비슷한데 되는 것」의 경계가 펼쳐집니다',
      `<div class="btns">${btn('안전거래 안내로', { href: 'HO0301', cls: 'btn-quiet' })}${btn('신고하기', { href: 'CH-04', cls: 'btn-pri' })}</div>`)}

${kpis([
      ['올릴 수 없는 품목', BANNED.length, { unit: '종', tone: 'k-danger', d: `${금지품목.length}종은 올리는 즉시 자동으로 잡혀요` }],
      ['바로 숨김', 숨김.length, { unit: '종', tone: 'k-warn', d: '올리는 즉시 목록에서 빠집니다' }],
      ['검토 대기로', 검토.length, { unit: '종', tone: 'k-acc', d: '사람이 보고 정합니다' }],
      ['최근 30일 걸린 글', num(최근건수), { unit: '건', tone: 'k-mut', d: '자동으로 걸러졌어요' }],
    ])}

${sec('한눈에 보기', `
  ${tableBar(`<b>${BANNED.length}종</b> <span class="t-sub">· 아래 목록에서 품목을 누르면 근거가 펼쳐집니다</span>`)}
  ${dashTable(
        [{ t: '품목', w: '24%' }, { t: '왜 안 되나요' }, { t: '조치', w: '120px' }, { t: '최근 30일', w: '100px' }],
        BANNED.map((b) => ({
          cells: [
            `<b>${esc(b.k)}</b>`,
            `<span class="t-sub">${esc(b.why)}</span>`,
            조치배지(b.act),
            `<span class="nowrap">${b.n}건</span>`,
          ],
        })))}`)}

${sec('품목별로 펼쳐 보기', accordion(항목, [0]),
      { desc: '「담배 케이스」처럼 이름이 비슷해도 되는 것이 있습니다. 경계를 함께 적어 두었어요.' })}

${sec('', banner('warn', '⚠', `<b>금지 품목인 줄 모르고 올렸다면 바로 지워 주세요.</b>
  자동으로 숨겨진 글은 마이페이지 「내 판매글」에서 사유를 볼 수 있고, 세 번 넘게 걸리면 이용이 제한됩니다.`,
      { right: btn('내 판매글 보기', { href: 'SL-05', cls: 'btn-ghost btn-sm' }) }))}
`;
    return { body, o: { state: '금지 품목의 근거를 펼친 상태' } };
  },

  /* ══════════════════════════════════════════════════════════
     HO04 — 공지·이벤트
     ══════════════════════════════════════════════════════════ */
  HO0401: (ctx) => 공지화면({ on: 0 }),
  HO0402: (ctx) => 공지화면({ on: 2, 상태: '「이벤트」 탭을 고른 상태' }),
  HO0403: (ctx) => 이벤트강조(),
  HO0404: (ctx) => 공지결과없음(),
};

/* ══════════════════════════════════════════════════════════════
   공통 짜임 — 같은 기준 화면을 나눠 쓰는 상태 화면들
   ══════════════════════════════════════════════════════════════ */

/** 카테고리 전체 보기(HO02 네 화면)의 공통 뼈대.
   ⚠ 왼쪽 .side 는 «대분류 목록»이지 화면 목록이 아니다. 그래서 뒤로가기 띠를 그대로 둔다
     (shell() 은 「.side 에 지금 화면이 켜져 있으면」 뒤로가기를 뺀다 — 그 판단은
     화면끼리 형제일 때 쓰라고 만든 것이다. 지금 켜진 항목은 화면이 아니라 분류다). */
function 분류화면({ 고른키, 지금, 소분류, 상태 }) {
  const 고른 = CATS.find((c) => c.key === 고른키) || CATS[0];
  const 소분류목록 = HO_subs(고른키);
  const 고른소분류 = 소분류 ? 소분류목록.find((s) => s.nm === 소분류) : null;
  const 소분류수 = 고른소분류 ? HO_subN(고른키, 고른소분류.nm) : null;
  const 말들 = HO_words(고른키);   // ⛔ 없다고 다른 분류 말을 빌려 오지 않는다

  /* 왼쪽 대분류 목록 — 지금 고른 것만 제 화면을 가리키고, 나머지는 「대분류 선택」 상태로 간다 */
  const 왼쪽 = `<aside class="side">
    <div class="gl">대분류 ${CATS.length}종</div>
    ${CATS.map((c) => (c.key === 고른키
    ? `<a class="on" href="${link(지금)}">${c.ic} ${esc(c.nm)}<span class="n">${num(c.n)}</span></a>`
    : `<a href="${link('HO0202')}">${c.ic} ${esc(c.nm)}<span class="n">${num(c.n)}</span></a>`)).join('')}
    <div class="cr">
      <div class="t-sub">최근 본 분류</div>
      <div class="mt2">${chips(HO_RECENT_CATS, -1, { extra: ` data-go="${link('HO0202')}"` })}</div>
    </div>
  </aside>`;

  /* 소분류 격자 — 매물이 0인 칸은 「없음」으로 표시하고 그 상태 화면으로 보낸다 */
  const 격자 = `<div class="g4">${소분류목록.map((s) => {
    const n = HO_subN(고른키, s.nm);
    const 켜짐 = 고른소분류 && s.nm === 고른소분류.nm;
    const 갈곳 = n === 0 ? 'HO0204' : (켜짐 ? 지금 : 'HO0203');
    return `<a class="tile${켜짐 ? ' on' : ''}" href="${link(갈곳)}"${켜짐 ? ' aria-current="true"' : ''}>
      <span class="nm">${esc(s.nm)}${s.hot ? ' ' + badge('인기', 'b-acc') : ''}${켜짐 ? ' ' + badge('보는 중', 'b-pri') : ''}</span>
      <span class="t-sub">${n === 0 ? '올라온 글 없음' : num(n) + '개'}</span></a>`;
  }).join('')}</div>`;

  /* 대표 매물 — 고른 소분류의 것을 먼저, 모자라면 같은 대분류에서 채운다(무엇으로 채웠는지 적는다) */
  const 대분류매물 = ITEMS.filter((x) => x.cat === 고른.nm && x.st !== '거래완료');
  const 소분류매물 = 고른소분류 ? 대분류매물.filter((x) => x.sub === 고른소분류.nm) : [];
  const 미리 = (고른소분류
    ? [...소분류매물, ...대분류매물.filter((x) => !소분류매물.includes(x))]
    : 대분류매물).slice(0, 4);

  const 매물설명 = 고른소분류
    ? (소분류매물.length
      ? `「${고른소분류.nm}」 대표 매물 ${소분류매물.length}건${미리.length > 소분류매물.length ? ` · 같은 대분류에서 ${미리.length - 소분류매물.length}건 더 보여드려요` : ''}`
      : `「${고른소분류.nm}」에는 아직 글이 없어 같은 대분류의 매물을 보여드려요`)
    : `${고른.nm}에서 최근 올라온 ${미리.length}건`;

  const 오른쪽 = `
${pageHd(`${고른.ic} ${esc(고른.nm)}${고른소분류 ? ` <span class="muted">›</span> ${esc(고른소분류.nm)}` : ''}`,
    고른소분류
      ? `${esc(고른.sub)} · 「${esc(고른소분류.nm)}」 ${소분류수 === 0 ? '올라온 글 없음' : num(소분류수) + '개'}`
      : `${esc(고른.sub)} · 매물 ${num(고른.n)}개`,
    `<div class="btns">${btn('이 분류 매물 보기', { href: 'SE-02', cls: 'btn-pri' })}</div>`)}

${sec('소분류', 격자, { desc: '소분류를 누르면 아래에 그 분류의 대표 매물이 펼쳐집니다.' })}

${소분류수 === 0 ? `
${sec('', empty('🌱', `「${esc(고른소분류.nm)}」에 올라온 매물이 없어요`,
      `이 소분류에는 아직 글이 없습니다. 알림을 걸어 두면 새 글이 올라올 때 알려드리고,
       상위 분류(${esc(고른.nm)})로 넓혀 보면 ${num(고른.n)}개를 볼 수 있어요.`,
      `${btn('새 글 알림 걸어두기', { cls: 'btn-pri', attr: ` data-toast="「${esc(고른소분류.nm)}」에 새 글이 올라오면 알려드릴게요"` })}
       ${btn(`${esc(고른.nm)} 전체 보기`, { href: 'SE-02', cls: 'btn-ghost' })}
       ${btn('다른 분류 고르기', { href: 'HO0201', cls: 'btn-quiet' })}`))}

${sec('이 분류의 다른 소분류에는 글이 있어요', dashTable(
      [{ t: '소분류' }, { t: '등록 매물', w: '140px' }, { t: '', w: '120px' }],
      소분류목록.filter((s) => HO_subN(고른키, s.nm) > 0).map((s) => ({
        cells: [`<b>${esc(s.nm)}</b>`, `${num(HO_subN(고른키, s.nm))}개`,
          `<div class="right">${btn('보러 가기', { href: 'SE-02', cls: 'btn-ghost btn-xs' })}</div>`],
      }))))}
` : `
${sec('대표 매물', `
  ${tableBar(`<span class="t-sub">${매물설명}</span>`, btn('이 분류 전체 보기', { href: 'SE-02', cls: 'btn-ghost btn-sm' }))}
  ${매물표(미리.map(매물행))}`)}
`}

${sec('이 분류에서 자주 찾는 말', chips(말들, -1, { extra: ` data-go="${link('SE-03')}"` }),
    { desc: '누르면 그 말로 찾은 결과로 갑니다.' })}

${box(`<h3 class="t-card mb2">이런 물건은 올릴 수 없어요</h3>
  <p class="t-sub">법으로 개인 간 거래가 막혀 있거나, 다른 사람에게 해가 될 수 있는 물건입니다.
  올리면 자동으로 숨겨지거나 검토 대기로 넘어갑니다.</p>
  ${chips(BANNED.map((b) => b.k), -1, { extra: ` data-go="${link('HO0304')}"` })}
  <div class="btns mt4">${btn('거래 금지 품목 보기', { href: 'HO-03', cls: 'btn-ghost' })}</div>`)}
`;

  const body = `
${pageHd('카테고리 전체 보기', `12개 분류에 매물 ${num(TOTAL_ITEMS)}개가 올라와 있어요`)}

${kpis([
    ['등록 매물', num(TOTAL_ITEMS), { unit: '건', d: '12개 분류를 모두 더한 수', href: 'SE-02' }],
    ['대분류', CATS.length, { unit: '종', tone: 'k-acc', d: '왼쪽에서 골라 보세요' }],
    ['가장 많은 분류', 가장많은분류.nm, { tone: 'k-ok', d: `${num(가장많은분류.n)}건이 올라와 있어요` }],
    ['올릴 수 없는 품목', BANNED.length, { unit: '종', tone: 'k-danger', d: `${금지품목.length}종은 올리는 즉시 자동으로 잡혀요`, href: 'HO0304' }],
  ])}

${filterPage(왼쪽, 오른쪽)}
`;
  return { body, o: 상태 ? { state: 상태 } : {} };
}

/* ── 공지·이벤트 목록의 공통 뼈대 ─────────────────────── */
const 공지분류 = ['전체', '공지', '이벤트', '제재안내'];
const 공지셈 = (c) => (c === '전체' ? NOTICES.length : NOTICES.filter((n) => n.c === c).length);
const 공지색 = (c) => (c === '이벤트' ? 'b-acc' : (c === '제재안내' ? 'b-warn' : 'b-pri'));
const 디데이색 = (d) => (d <= 1 ? 'b-dan' : (d <= 3 ? 'b-warn' : 'b-pri'));
/** 새 글 표시 — 이 팩의 「오늘」은 2026-09-06 이다(거래·결제 화면이 9/5 를 쓴다).
   일주일 안에 올라온 글에 N 을 붙인다. 날짜를 손으로 찍지 말고 이 한곳에서 정한다. */
const 새글기준 = '2026-08-30';
const 새글 = (n) => n.at >= 새글기준;
const 중요공지 = NOTICES.filter((n) => n.imp);
const 진행이벤트 = NOTICES.filter((n) => n.c === '이벤트' && !n.done);
const 끝난이벤트 = NOTICES.filter((n) => n.c === '이벤트' && n.done);

const 공지행 = (n) => ({
  cls: n.done ? 'done' : '',
  data: { c: n.c, i: n.id },
  cells: [
    badge(n.c, 공지색(n.c)),
    `<a class="strong" href="${link('CS-03')}">${n.imp ? '<b>중요</b> ' : ''}${esc(n.t)}</a>
      ${n.dday && !n.done ? ' ' + badge(`D-${n.dday}`, 디데이색(n.dday)) : ''}
      ${n.done ? ' ' + badge('종료', 'b-mut') : ''}
      ${새글(n) ? ' ' + badge('N', 'b-dan') : ''}`,
    `<span class="t-sub nowrap">${n.at}</span>`,
    `<span class="t-sub nowrap">${num(n.hit)}</span>`,
  ],
});
const 공지표머리 = [{ t: '분류', w: '110px' }, { t: '제목' }, { t: '작성일', w: '116px' }, { t: '조회수', w: '90px' }];

const 쪽번호 = () => `<div class="row-c mt-block" style="gap:6px;justify-content:center">
  <button class="pg" type="button" disabled aria-label="이전">‹</button>
  <button class="pg on" type="button">1</button>
  <button class="pg" type="button" data-toast="2쪽을 불러왔어요">2</button>
  <button class="pg" type="button" data-toast="3쪽을 불러왔어요">3</button>
  <button class="pg" type="button" data-toast="다음 쪽을 불러왔어요" aria-label="다음">›</button>
</div>`;

/** 중요 공지 — 탭을 바꿔도 위쪽에 고정된다. 옅은 바탕으로 목록과 구분한다. */
const 고정띠 = () => box(`
  <div class="row-b wrap-row mb3"><b>중요 공지 ${중요공지.length}건</b>
    <span class="t-sub">탭을 바꿔도 위쪽에 그대로 붙어 있어요</span></div>
  <div class="notice-list">${중요공지.map((n) => `<a class="notice-row imp" href="${link('CS-03')}">
    <span>${badge(n.c, 공지색(n.c))}</span>
    <span class="t"><b>중요</b> ${esc(n.t)}</span>
    <span class="at">${n.at}</span>
    <span class="hit">${num(n.hit)}</span></a>`).join('')}</div>`, { cls: 'soft' });

function 공지화면({ on, 상태 }) {
  const 판 = 공지분류.map((c, i) => {
    const 것들 = c === '전체' ? NOTICES : NOTICES.filter((n) => n.c === c);
    const 나머지 = 것들.filter((n) => !n.imp);
    return `<div data-pane-body="nt${i}"${i === on ? '' : ' hidden'}>
      ${tableBar(`<b>${것들.length}건</b> <span class="t-sub">· 중요 공지 ${것들.filter((n) => n.imp).length}건은 위에 고정돼 있어요</span>`,
      `${c === '이벤트' ? btn('진행 중 이벤트만 보기', { href: 'HO0403', cls: 'btn-acc btn-sm' }) : ''}${btn('홈으로', { href: 'HO-01', cls: 'btn-ghost btn-sm' })}`)}
      ${나머지.length
      ? dashTable(공지표머리, 나머지.map(공지행))
      : empty('📭', '아직 글이 없어요', `${c} 분류에 올라온 글이 없습니다.`, btn('전체 보기', { href: 'HO0401', cls: 'btn-ghost' }))}
    </div>`;
  }).join('');

  const body = `
${pageHd('공지·이벤트', `모두 ${NOTICES.length}건 · 중요 공지 ${중요공지.length}건은 맨 위에 고정됩니다`,
    `<div class="searchbar sm" style="max-width:300px"><span class="ic">🔍</span>
      <input type="search" placeholder="제목으로 찾기" aria-label="공지 검색">
      ${btn('찾기', { cls: 'btn-pri', attr: ' data-toast="제목에 그 말이 든 글만 남깁니다"' })}</div>`)}

${kpis([
    ['전체 글', num(NOTICES.length), { unit: '건', d: '공지 · 이벤트 · 제재안내' }],
    ['중요 공지', num(중요공지.length), { unit: '건', tone: 'k-warn', d: '탭을 바꿔도 위에 고정돼요' }],
    ['진행 중인 이벤트', num(진행이벤트.length), { unit: '건', tone: 'k-acc', d: `가장 급한 것이 D-${진행이벤트[0]?.dday ?? '-'}`, href: 'HO0403' }],
    ['제재안내', num(공지셈('제재안내')), { unit: '건', tone: 'k-mut', d: '이런 글은 삭제됩니다', href: 'HO0402' }],
  ])}

${sec('', 고정띠())}

${sec('분류별로 보기', `<div>
  ${tabs(공지분류.map((c, i) => ({ label: c, cnt: 공지셈(c), pane: 'nt' + i })), on)}
  <div class="mt4">${판}</div>
</div>`, { desc: '탭을 옮겨도 화면 주소는 그대로입니다 — 뒤로가기가 탭에 끼어들지 않아요.' })}

<p class="t-sub mt4">찾는 말이 목록에 없으면 <a class="link" href="${link('HO0404')}">이런 안내</a>가 나옵니다.</p>

${쪽번호()}
`;
  return { body, o: 상태 ? { state: 상태 } : {} };
}

/** HO0403 — 진행 중 이벤트 강조 */
function 이벤트강조() {
  const 이벤트 = NOTICES.filter((n) => n.c === '이벤트');
  const 첫것 = 진행이벤트[0];

  const body = `
${pageHd('이벤트', '남은 기간을 D-N 배지로 보여 주고, 끝난 것은 흐리게 둡니다',
    `<div class="btns">${btn('공지·이벤트 전체', { href: 'HO0401', cls: 'btn-ghost' })}${btn('이벤트 참여하기', { href: 'SL-01', cls: 'btn-pri' })}</div>`)}

${kpis([
    ['진행 중인 이벤트', num(진행이벤트.length), { unit: '건', tone: 'k-acc', d: 첫것 ? esc(첫것.t) : '' }],
    ['가장 급한 것', 첫것 ? `D-${첫것.dday}` : '—', { tone: 'k-warn', d: '3일 안으로 들어오면 색이 바뀌어요' }],
    ['끝난 이벤트', num(끝난이벤트.length), { unit: '건', tone: 'k-mut', d: '흐리게 두고 「종료」를 붙여요' }],
    ['전체 글', num(NOTICES.length), { unit: '건', d: '공지·이벤트·제재안내', href: 'HO0401' }],
  ])}

${첫것 ? sec('', banner('acc', '🎁', `<b>${esc(첫것.t)}</b> — ${badge(`D-${첫것.dday}`, 디데이색(첫것.dday))} 남았어요.
  ${첫것.at}에 올라온 글이고, 참여 방법은 글 안에 적혀 있습니다.`,
    { right: btn('이벤트 보기', { href: 'CS-03', cls: 'btn-acc btn-sm' }) })) : ''}

${sec('이벤트 목록', `
  ${tableBar(`<b>${이벤트.length}건</b> <span class="t-sub">· 진행 중 ${진행이벤트.length}건 · 끝난 것 ${끝난이벤트.length}건</span>`,
    btn('공지까지 함께 보기', { href: 'HO0402', cls: 'btn-ghost btn-sm' }))}
  ${dashTable(공지표머리, 이벤트.map(공지행))}`,
  { desc: '끝난 이벤트는 흐리게 두고 「종료」 배지를 붙입니다. 눌러서 지난 내용을 볼 수는 있어요.' })}

${sec('남은 기간에 따라 색이 바뀝니다', table(
    [{ t: '남은 기간', w: '24%' }, { t: '배지', w: '20%' }, { t: '어떻게 보이나요' }],
    [
      ['4일 이상', badge('D-5', 'b-pri'), '기본 색으로 조용히 알려드려요'],
      ['1~3일', badge('D-2', 'b-warn'), '마감이 가까워 눈에 띄는 색으로 바뀝니다'],
      ['마감 당일', badge('D-DAY', 'b-dan'), '오늘 끝난다는 뜻이에요'],
      ['끝남', badge('종료', 'b-mut'), '줄 전체를 흐리게 두고 맨 아래로 내립니다'],
    ], { scroll: false }), { desc: '지금 걸린 이벤트는 D-5라 기본 색입니다.' })}
`;
  return { body, o: { state: '진행 중인 이벤트를 강조한 상태' } };
}

/** HO0404 — 결과 없음 */
function 공지결과없음() {
  const 찾은말 = '환불';

  const body = `
${pageHd('공지·이벤트', `「${찾은말}」(으)로 찾은 글이 없어요`,
    `<div class="searchbar sm" style="max-width:300px"><span class="ic">🔍</span>
      <input type="search" value="${찾은말}" aria-label="공지 검색">
      ${btn('찾기', { cls: 'btn-pri', attr: ' data-toast="제목에 그 말이 든 글만 남깁니다"' })}</div>`)}

${kpis([
    ['찾은 글', '0', { unit: '건', tone: 'k-mut', d: `「${찾은말}」이 든 제목이 없어요` }],
    ['이 분류 전체', num(공지셈('이벤트')), { unit: '건', tone: 'k-acc', d: '이벤트 분류에는 글이 있어요', href: 'HO0402' }],
    ['전체 글', num(NOTICES.length), { unit: '건', d: '분류를 풀면 이만큼 보여요', href: 'HO0401' }],
    ['많이 찾는 말', '정산', { tone: 'k-warn', d: '이 말로 다시 찾아보세요' }],
  ])}

${sec('', 고정띠())}

${sec('분류별로 보기', `<div>
  ${tabs(공지분류.map((c, i) => ({ label: c, cnt: 공지셈(c), pane: 'nt' + i })), 2)}
  <div class="mt4">
    ${empty('🔎', `「${찾은말}」로 찾은 글이 없어요`,
    `이벤트 분류에서 제목에 「${찾은말}」이 든 글을 찾지 못했습니다.
     검색어를 지우거나 분류를 「전체」로 넓혀 보세요.`,
    `${btn('검색어 지우고 전체 보기', { href: 'HO0401', cls: 'btn-pri' })}
     ${btn('이벤트 전체 보기', { href: 'HO0402', cls: 'btn-ghost' })}`)}
  </div>
</div>`)}

${sec('이런 말로 많이 찾아요', chips(['정산', '끌올', '안전결제', '금지 품목', '제재'], -1,
    { extra: ` data-go="${link('HO0401')}"` }), { desc: '누르면 그 말로 다시 찾습니다.' })}

${sec('최근 올라온 글', `
  ${tableBar('<span class="t-sub">찾는 글이 없을 때는 최근 글부터 훑어보셔도 좋아요</span>',
    btn('공지·이벤트 전체', { href: 'HO0401', cls: 'btn-ghost btn-sm' }))}
  ${dashTable(공지표머리, NOTICES.slice(0, 5).map(공지행))}`)}
`;
  return { body, o: { state: '검색 결과가 없는 상태' } };
}
