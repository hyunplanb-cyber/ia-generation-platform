/* SE 매물 찾기 — 내 동네 설정 · 매물 목록 · 검색 · 매물 상세 · 결과 없음 (24화면)

   ⚠ 레이아웃 B 대시보드형 — 화면 위쪽은 «지표 카드 4개»(kpis)로 연다. 히어로는 없다.
     목록은 표(dashTable)로, 상세는 «좌 본문 + 우 액션 패널»(detailSplit)로 낸다.
     스펙팩 prompt 의 「가로 행 목록」·「하단 고정 액션 바」는 손님이 AI 에게 줄 글이고,
     이 완성화면의 뼈대를 정하는 것은 팩에 함께 나가는 레이아웃 프리셋이다.
     (디럭스 = 코럴 선셋 × 목록 중심형과 «일부러» 다르다.)

   ⚠ 링크 목적지는 스펙팩 buttons 에 적힌 pageId 를 그대로 쓴다. link() 가 파일 이름으로 옮긴다.
   ⚠ 거르개·정렬·최근 검색어는 assets/js/app.js 의 장치에 «실제로» 잇는다 —
     켜짐 표시만 바뀌고 목록이 그대로면 스펙과 화면이 다른 말을 하는 것이다. */
import * as U from './ui.mjs';
import {
  CATS, CONDS, ITEMS, itemBy, userBy, TOWNS, ago, SITE,
  RANK_WORDS, RECENT_WORDS, HOT_WORDS, BOOST_FREE_LEFT,
  SE_TOWN_SUGGEST, SE_VERIFY_CAN, SE_VERIFY_CANT, SE_VERIFY_VALID,
  SE_SUGGEST, SE_RANK_AT, SE_TYPO, SE_NEAR_WORDS, SE_CONDS, SE_RANGE_HITS, SE_PER_PAGE,
} from './data.mjs';

/* ══ 공통 조각 ══════════════════════════════════════════════════════ */

/** 목록의 기본 차례 — 끌올된 글이 맨 위, 그 다음은 가까운 순(거리순이 기본 정렬이다). */
const 기본차례 = (목록 = ITEMS) => [...목록].sort((a, b) => (b.boost - a.boost) || (a.dist - b.dist));

/** 조건을 걸었을 때 몇 개가 남나 — 건수와 목록이 «같은 셈»에서 나오게 한다.
   ⛔ 화면에 숫자를 손으로 적으면 거르개가 센 수와 반드시 갈라진다. */
function 셈(조건 = {}) {
  return ITEMS.filter((it) => {
    if (조건.cat && !조건.cat.includes(it.cat)) return false;
    if (조건.cond && !조건.cond.includes(it.cond)) return false;
    if (조건.ways && !조건.ways.some((w) => it.ways.includes(w))) return false;
    if (조건.숨김 && 조건.숨김.includes(it.st)) return false;
    if (조건.최고 != null && it.price > 조건.최고) return false;
    if (조건.최저 != null && it.price < 조건.최저) return false;
    if (조건.거리 != null && it.dist > 조건.거리) return false;
    return true;
  }).length;
}

/** 매물 한 줄 — 표의 여섯 칸.
   o.강조 를 주면 그 칸을 주색 굵은 글씨로 올린다(정렬 기준이 바뀌면 보조정보도 바뀐다). */
function 매물칸(it, o = {}) {
  const 강 = (키, 글) => (o.강조 === 키 ? `<b style="color:var(--pri-text)">${글}</b>` : 글);
  const 끝난것 = it.st === '거래완료';
  return [
    `<span class="row-c">${U.phItem(40, it.id)}<span>
      <a class="strong" href="${U.link(o.go || 'SE0401')}">${U.esc(it.t)}</a>
      <span class="row-c" style="gap:4px;margin-top:2px">${it.boost ? U.boostBadge() : ''}${it.ways.includes('안전결제') ? U.badge('안전결제', 'b-ok') : ''}${U.badge(it.cond, 'b-mut')}</span>
    </span></span>`,
    `<span class="nowrap">${U.esc(it.town)}<span class="t-sub"> · ${강('dist', it.dist + 'km')}</span></span>`,
    끝난것 ? `<s class="nowrap">${U.won(it.price)}</s>` : `<b class="nowrap">${강('price', U.won(it.price))}</b>`,
    `<span class="t-sub nowrap">${강('min', ago(it.min))}</span>`,
    `<span class="t-sub nowrap">♡ ${강('wish', it.wish)} · 채팅 ${it.chat}</span>`,
    U.stBadge(it.st),
  ];
}

/** 매물 표 — 레이아웃 B 의 list 자리.
   줄마다 거르기·정렬에 쓰는 값을 실어 둔다(안 실으면 거르개가 목록을 못 줄인다).
   ⚠ tbody 에 data-sort-list 를 더해야 정렬 고르개가 «차례»를 바꾼다. */
function 매물표(목록, o = {}) {
  /* ⚠ 열이 여섯이라 좁은 칸에서는 좌우로 넘친다 — 그래서 «반드시» max 를 준다.
     max 가 없으면 표가 제 상자를 뚫고 옆 칸을 덮는다(1100px 에서 144px 이 삐져나갔다). */
  const head = [
    { t: '물건' }, { t: '동네', w: '118px' }, { t: '값', w: '110px' },
    { t: '올라온 지', w: '92px' }, { t: '관심', w: '116px' }, { t: '상태', w: '80px' },
  ];
  const 줄 = 목록.map((it, i) => ({
    data: {
      i, cat: it.cat, cond: it.cond, ways: it.ways.join(','), st: it.st, town: it.town,
      price: it.price, dist: it.dist, min: it.min, wish: it.wish,
    },
    cells: 매물칸(it, o),
  }));
  return U.dashTable(head, 줄, { listKey: 'items', max: o.max || '560px' })
    .replace('data-filter-list="items"', 'data-filter-list="items" data-sort-list="items"');
}

/** 정렬 고르개 — 네 가지. 고르면 app.js 가 줄 차례를 실제로 바꾼다. */
const 정렬칸 = (on = 'dist') => `<select class="input" style="width:auto" data-sort-cards="items" aria-label="정렬 기준">
  ${[['dist', '거리순'], ['min', '최신순'], ['price', '낮은 가격순'], ['wish', '인기순']].map(([v, l]) =>
  `<option value="${v}"${v === 'wish' ? ' data-desc' : ''}${v === on ? ' selected' : ''}>${l}</option>`).join('')}
</select>`;

/** 왼쪽 필터 패널.
   ⚠ 한때 filterSide() 가 data-reset 을 내서 app.js 가 못 알아들었다. 여기서 갈아 끼우고 있었는데,
     2026-09-11 에 ui.mjs 뿌리를 고쳤다 — 이제 filterSide() 가 data-filter-reset 을 낸다. */
function 목록필터(o = {}) {
  const 켬 = o.on || {};
  const 체크 = (키, 값) => ((켬[키] || []).includes(값) ? ' checked' : '');
  const blocks = [
    {
      t: '카테고리',
      body: CATS.slice(0, 6).map((c) => `<label><input type="checkbox" data-filter="items" data-f-key="cat" data-f-val="${U.esc(c.nm)}"${체크('cat', c.nm)}>
        <span class="grow">${c.nm}</span><span class="t-sub">${U.num(c.n)}</span></label>`).join('')
        + `<a class="link" style="display:inline-block;margin-top:6px" href="${U.link('HO0201')}">＋ 분류 전체 보기</a>`,
    },
    {
      t: '가격',
      body: `<div class="rng">
        <input class="input" type="number" placeholder="최저" data-filter="items" data-f-key="price" data-f-op="min"${켬.최저 ? ` value="${켬.최저}"` : ''}>
        <span class="t-sub">~</span>
        <input class="input" type="number" placeholder="최고" data-filter="items" data-f-key="price" data-f-op="max"${켬.최고 ? ` value="${켬.최고}"` : ''}>
      </div>
      <p class="t-sub mt2">원 단위로 적어 주세요</p>`,
    },
    {
      t: '물건 상태',
      body: CONDS.map((c) => `<label><input type="checkbox" data-filter="items" data-f-key="cond" data-f-val="${c.k}"${체크('cond', c.k)}>
        <span>${c.k}</span></label>`).join(''),
    },
    {
      t: '거래 방식',
      body: ['직거래', '택배', '안전결제'].map((w) => `<label><input type="checkbox" data-filter="items" data-f-key="ways" data-f-val="${w}"${체크('ways', w)}>
        <span>${w}</span></label>`).join(''),
    },
    {
      t: '동네 범위',
      body: `<select class="input" data-filter="items" data-f-key="dist" data-f-op="max" aria-label="동네 범위">
        ${[['', '전체'], ['1', '내 동네 (역삼동)'], ['2.5', '가까운 동네 (+3곳)'], ['10', '조금 먼 동네 (+8곳)']].map(([v, l]) =>
    `<option value="${v}"${v === (켬.거리 || '') ? ' selected' : ''}>${l}</option>`).join('')}
      </select>
      <p class="t-sub mt2">넓힐수록 먼 동네 물건까지 잡혀요</p>`,
    },
    {
      t: '그 밖에',
      body: `<label><input type="checkbox" data-filter="items" data-f-key="st" data-f-not="거래완료"${켬.숨김 === false ? '' : ' checked'}>
        <span>거래완료 숨기기</span></label>
      <p class="t-sub mt2">체크를 지우면 «그 조건만» 풀립니다</p>`,
    },
  ];
  return U.filterSide(blocks, {
    after: `<div class="mt4">${U.btn('걸린 조건 전체 해제', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-filter-reset="items"' })}</div>
      <div class="mt2">${U.btn('🔔 이 조건으로 알림 받기', { href: 'MY0601', cls: 'btn-line btn-block btn-sm' })}</div>`,
  });
}

/** 걸린 조건 줄 — app.js 가 «지금 걸린 것»을 배지로 채운다(목록과 같은 셈에서 나온다). */
const 걸린조건줄 = () => `<div class="table-bar" data-filter-applied="items" hidden>
  <span class="t-sub nowrap">걸린 조건</span>
  <span class="row-c" data-filter-applied-in></span>
  ${U.btn('전체 해제', { cls: 'btn-quiet btn-xs', attr: ' data-filter-reset="items"' })}
</div>`;

/** 같은 화면이 상태에 따라 어떻게 달라지는지 — 눌러서 볼 수 있게 길을 둔다.
   ⚠ 3뎁스 팩의 값은 「탭·상태·예외까지 펼쳐 두었다」는 것이다. 길이 없으면 손님이 못 본다. */
const 다른상태 = (title, list) => U.sec(title, `<div class="stack-sm">
  ${list.map(([id, 이름, 설명]) => `<a class="cond-row" href="${U.link(id)}">
    <b class="grow">${이름}</b><span class="t-sub">${설명}</span><span class="link">보기 ›</span></a>`).join('')}
</div>`, { desc: '같은 화면이 상태에 따라 어떻게 달라지는지 볼 수 있어요.' });

/** 목록 아래 쪽 넘김 — 「더 보기」 방식 + 쪽 번호 */
const 쪽넘김 = (전체) => `<div class="center mt-block">
  ${U.btn(`더 보기 (다음 ${SE_PER_PAGE}개)`, { cls: 'btn-ghost btn-lg', attr: ' data-toast="다음 매물을 이어 붙였어요"' })}
  <p class="t-sub mt2">${U.num(전체)}개 가운데 ${Math.min(SE_PER_PAGE, 전체)}개를 보여 드렸어요</p>
</div>`;

/** 지도 자리 — 원(범위)과 핀(동네). 지도 자리에는 사진을 넣지 않는다.
   핀을 누르면 아래 미리보기의 동네 이름이 바뀐다(app.js .map .pin). */
function 동네지도(단계 = 0) {
  const 지름 = [130, 190, 250][단계];
  const 핀 = [
    ['역삼동', 50, 50], ['논현동', 30, 32], ['삼성동', 72, 36],
    ['대치동', 66, 72], ['도곡동', 34, 70],
  ];
  return `<div class="map">
    <span class="zone" style="width:${지름}px;height:${지름}px;left:50%;top:50%;transform:translate(-50%,-50%)"></span>
    ${핀.map(([nm, x, y], i) => `<span class="pin${i === 0 ? ' on' : ''}" style="left:${x}%;top:${y}%" data-name="${nm}" title="${nm}"></span>`).join('')}
    <span style="position:absolute;left:12px;bottom:10px;font-size:12px">지도 자리 — 실제 지도는 서버가 연결되면 들어갑니다</span>
  </div>
  <div class="row-b mt3" data-map-preview>
    <span class="t-sub">고른 동네 <b data-map-name>역삼동</b> · 원 안이 지금 보는 범위예요</span>
    <span class="t-sub">${TOWNS.ranges[단계].k} · 매물 ${U.num(TOWNS.ranges[단계].n)}개</span>
  </div>`;
}

/** 범위 3단계 표 — 슬라이더 옆에 「그 범위에 잡히는 동네와 매물 수」를 나란히 둔다 */
const 범위표 = (단계 = 0) => U.dashTable(
  [{ t: '범위' }, { t: '포함 동네', w: '46%' }, { t: '매물 수', w: '110px' }, { t: '', w: '92px' }],
  TOWNS.ranges.map((r, i) => ({
    cls: i === 단계 ? 'over' : '',
    cells: [
      `<b>${r.k}</b>${i === 단계 ? ' ' + U.badge('지금 이 범위', 'b-pri') : ''}`,
      `<span class="t-sub">${r.towns.join(' · ')}</span>`,
      `<b>${U.num(r.n)}</b>`,
      i === 단계 ? '<span class="t-sub">고른 범위</span>'
        : U.btn('이 범위로', { cls: 'btn-ghost btn-xs', attr: ` data-toast="${r.k} 범위로 바꿨어요 · 매물 ${U.num(r.n)}개"` }),
    ],
  })),
);

/** 범위 슬라이더 — 3단계. 사이 값은 없다. */
const 범위슬라이더 = (단계 = 0) => `<div class="slider">
  <div class="fill" style="left:0;right:${[100 - 8, 50, 8][단계]}%"></div>
  <div class="kn" style="left:calc(${[0, 50, 100][단계]}% - 9px)"></div>
</div>
<div class="row-b t-sub">${TOWNS.ranges.map((r, i) => `<span${i === 단계 ? ' style="color:var(--pri-text);font-weight:700"' : ''}>${r.k}</span>`).join('')}</div>
<p class="t-sub mt3">손잡이는 세 자리에만 멈춥니다 — 사이 값은 없어요.</p>`;

/** 동네 후보 한 줄 — 친 글자를 형광펜으로 올린다 */
const 동네후보줄 = (t, 친글자) => {
  const s = String(t);
  const i = s.indexOf(친글자);
  return i < 0 ? U.esc(s) : `${U.esc(s.slice(0, i))}<span class="hl">${U.esc(친글자)}</span>${U.esc(s.slice(i + 친글자.length))}`;
};

/* ══ SE-01 내 동네 설정 ═════════════════════════════════════════════ */

const 등록동네 = () => `<div class="stack-sm">
  <div class="town-row"><b>${TOWNS.mine}</b>${U.badge('인증 완료', 'b-ok')}
    <button class="link quiet" type="button" data-toast="역삼동을 지웠어요" data-toast-act="되돌리기">지우기</button></div>
  <div class="town-row muted">두 번째 동네 자리 — 비어 있음
    <button class="link" type="button" data-toast="동네 검색에서 하나를 더 고르면 여기에 들어와요">＋ 추가</button></div>
</div>
<p class="t-sub mt3">동네는 <b>2개까지</b> 등록할 수 있어요. 새로 등록하려면 하나를 지우세요.</p>`;

const 인증안내배너 = () => U.banner('info', '✅', `<b>동네 인증을 하면 글쓰기와 채팅이 열려요</b>
  <div class="t-sub mt1">그 동네에서 한 번 위치를 확인하면 됩니다. 확인한 자리는 저장하지 않아요.</div>`,
{ right: U.btn('인증 안내 보기', { href: 'SE0105', cls: 'btn-ghost btn-sm' }) });

function SE0101(ctx) {
  const body = `
${U.pageHd('내 동네 설정', '동네를 정하면 가까운 이웃의 물건부터 보여드려요',
    `<div class="btns">${U.btn('홈으로', { href: 'HO0101', cls: 'btn-ghost' })}${U.btn('이 동네 매물 보기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['내 동네 매물', U.num(TOWNS.ranges[0].n), { unit: '건', d: TOWNS.ranges[0].d, href: 'SE0201' }],
    ['가까운 동네까지', U.num(TOWNS.ranges[1].n), { unit: '건', tone: 'k-acc', d: TOWNS.ranges[1].d, href: 'SE0201' }],
    ['조금 먼 동네까지', U.num(TOWNS.ranges[2].n), { unit: '건', tone: 'k-mut', d: TOWNS.ranges[2].d, href: 'SE0201' }],
    ['등록한 동네', '1', { unit: '곳', tone: 'k-ok', d: '2곳까지 등록할 수 있어요' }],
  ])}

${U.detailSplit(`
  ${U.card('어디에 계신가요', `
    <div class="btns mb4">
      ${U.btn('📍 현재 위치로 찾기', { cls: 'btn-pri btn-lg', attr: ' data-toast="현재 위치를 확인했어요 · 역삼동" data-toast-kind="ok"' })}
      ${U.btn('위치를 못 쓰면', { href: 'SE0102', cls: 'btn-ghost btn-lg' })}
    </div>
    <div class="searchbar mb3"><span class="ic">🔍</span>
      <input type="search" placeholder="동네 이름으로 찾기 (예: 역삼동)" aria-label="동네 검색">
      ${U.btn('찾기', { cls: 'btn-pri', attr: ' data-toast="후보 동네를 좁혔어요"' })}
    </div>
    <div class="stack-sm">
      ${SE_TOWN_SUGGEST.slice(0, 3).map((t, i) => `<label class="radio-in box${i === 0 ? ' on' : ''}">
        <input type="radio" name="town"${i === 0 ? ' checked' : ''}>
        <span class="grow"><b>${t.nm}</b> <span class="t-sub">${t.gu}</span></span>
        <span class="t-sub nowrap">매물 ${U.num(t.n)}</span></label>`).join('')}
    </div>
    <p class="t-sub mt3">이름이 같은 동네가 여럿 나오면 <a class="link" href="${U.link('SE0103')}">행정구역까지 보고</a> 고르세요.</p>`)}

  <div class="mt-block">${U.card('지도에서 본 내 동네', 동네지도(0), { bdCls: '' })}</div>

  <div class="mt-block">${U.card('어디까지 볼까요', `
    ${범위슬라이더(0)}
    <div class="mt4">
      <div class="t-sub mb2">이 범위에 들어오는 동네</div>
      ${U.chips(TOWNS.ranges[0].towns)}
    </div>
    <div class="mt4">${범위표(0)}</div>
    <p class="t-sub mt3">범위를 옮기면 지도 원 크기와 매물 수가 함께 바뀝니다 —
      <a class="link" href="${U.link('SE0104')}">옮겼을 때 화면</a></p>`)}</div>

  <div class="mt-block">${U.sec('동네 인증', `
    ${인증안내배너()}
    <div class="mt4">${U.dashTable(
    [{ t: '할 수 있는 것 · 인증 없이' }, { t: '인증해야 열리는 것' }],
    [...Array(Math.max(SE_VERIFY_CAN.length, SE_VERIFY_CANT.length))].map((_, i) => [
      SE_VERIFY_CAN[i] ? `✓ ${SE_VERIFY_CAN[i]}` : '<span class="t-sub">—</span>',
      SE_VERIFY_CANT[i] ? `🔒 ${SE_VERIFY_CANT[i]}` : '<span class="t-sub">—</span>',
    ]),
  )}</div>
    <p class="t-sub mt3">인증은 ${SE_VERIFY_VALID}마다 다시 합니다. 이사하면 동네를 바꿔 다시 인증하세요.</p>`)}</div>
`, `
  ${U.actPanel('등록한 동네', 등록동네(), '')}
  ${U.actPanel('지금 고른 설정', U.kv([
    ['동네', TOWNS.mine],
    ['범위', TOWNS.ranges[0].k],
    ['포함 동네', `${TOWNS.ranges[0].towns.length}곳`],
    ['잡히는 매물', `${U.num(TOWNS.ranges[0].n)}개`],
    ['동네 인증', U.badge('완료', 'b-ok')],
  ]), `
    ${U.btn('이 동네로 정하고 매물 보기', { href: 'SE0201', cls: 'btn-pri btn-lg' })}
    ${U.btn('동네 인증 안내', { href: 'SE0105', cls: 'btn-ghost' })}
    ${U.btn('홈으로', { href: 'HO0101', cls: 'btn-quiet' })}`)}
  ${U.actPanel('', `<p class="t-sub">동네는 언제든 다시 바꿀 수 있어요. 바꿔도 찜한 물건과 채팅은 그대로입니다.</p>`, '')}
`)}`;
  return { body, o: {} };
}

function SE0102(ctx) {
  const 방법 = [
    ['크롬 (PC)', '주소창 왼쪽 자물쇠 → 사이트 설정 → 위치 → 「허용」'],
    ['사파리 (아이폰)', '설정 → 사파리 → 위치 → 「허용」 또는 「물어보기」'],
    ['크롬 (안드로이드)', '⋮ → 설정 → 사이트 설정 → 위치 → 우리동네장터 허용'],
  ];
  const body = `
${U.pageHd('내 동네 설정', '현재 위치를 쓸 수 없을 때',
    `<div class="btns">${U.btn('동네 이름으로 찾기', { href: 'SE0103', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['위치 권한', '거부됨', { tone: 'k-danger', d: '브라우저가 위치를 막고 있어요' }],
    ['이름으로 찾은 후보', String(SE_TOWN_SUGGEST.length), { unit: '곳', tone: 'k-acc', d: '위치 없이도 정할 수 있어요', href: 'SE0103' }],
    ['내 동네 매물', U.num(TOWNS.ranges[0].n), { unit: '건', d: '이미 정해 둔 역삼동' }],
    ['등록한 동네', '1', { unit: '곳', tone: 'k-ok', d: '2곳까지' }],
  ])}

${U.detailSplit(`
  ${U.banner('dan', '📍', `<b>현재 위치를 가져올 수 없어요</b>
    <div class="t-sub mt1">브라우저에서 위치 권한이 «거부»로 되어 있습니다. 아래 방법으로 다시 켜거나,
      동네 이름을 직접 적어 정할 수 있어요.</div>`)}

  <div class="mt-block">${U.card('브라우저에서 위치를 다시 켜는 방법', U.dashTable(
    [{ t: '쓰는 곳', w: '180px' }, { t: '이렇게 하세요' }],
    방법.map(([k, v]) => [`<b>${k}</b>`, v]),
  ) + `<p class="t-sub mt3">켠 뒤 이 화면에서 「다시 시도」를 누르면 위치를 한 번 더 물어봅니다.</p>`)}</div>

  <div class="mt-block">${U.card('위치 없이 동네 정하기', `
    <div class="searchbar mb3"><span class="ic">🔍</span>
      <input type="search" placeholder="동네 이름을 적어 주세요 (예: 역삼동)" value="역삼" aria-label="동네 검색">
      ${U.btn('찾기', { cls: 'btn-pri', attr: ' data-toast="후보 동네를 좁혔어요"' })}
    </div>
    <div class="stack-sm">
      ${SE_TOWN_SUGGEST.slice(0, 4).map((t, i) => `<a class="town-row" href="${U.link('SE0101')}">
        <b>${동네후보줄(t.nm, t.hit)}</b><span class="t-sub">${t.gu}</span>
        <span class="link">매물 ${U.num(t.n)} ›</span></a>`).join('')}
    </div>
    <p class="t-sub mt3">고른 동네는 나중에 그 자리에서 «동네 인증»을 해야 글쓰기·채팅이 열려요.</p>`)}</div>

  <div class="mt-block">${U.banner('quiet', 'ℹ', `위치는 «동네를 정할 때만» 한 번 쓰고 저장하지 않습니다.
    정확한 자리가 아니라 동네 단위로만 씁니다.`)}</div>
`, `
  ${U.actPanel('지금 상태', U.kv([
    ['위치 권한', U.badge('거부됨', 'b-danger')],
    ['정해 둔 동네', TOWNS.mine],
    ['쓸 수 있는 길', '동네 이름으로 찾기'],
  ]), `
    ${U.btn('위치 권한 다시 시도', { cls: 'btn-pri btn-lg', attr: ' data-toast="브라우저에 위치를 다시 물어봤어요"' })}
    ${U.btn('동네 이름으로 찾기', { href: 'SE0103', cls: 'btn-ghost' })}
    ${U.btn('내 동네 설정으로 돌아가기', { href: 'SE0101', cls: 'btn-quiet' })}`)}
  ${U.actPanel('그래도 안 되면', `<p class="t-sub">고객센터에 알려 주시면 같이 살펴 드릴게요.</p>`,
    U.btn('고객센터', { href: 'CS0101', cls: 'btn-ghost' }))}
`)}`;
  return { body, o: { state: '현재 위치 권한이 거부된 상태' } };
}

function SE0103(ctx) {
  const 친글자 = '역삼';
  const 같은이름 = SE_TOWN_SUGGEST.filter((t) => t.nm.startsWith('역삼')).length;
  const body = `
${U.pageHd('내 동네 설정', `「${친글자}」까지 쳤을 때 좁혀진 후보`,
    `<div class="btns">${U.btn('내 동네 설정', { href: 'SE0101', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['좁혀진 후보', String(SE_TOWN_SUGGEST.length), { unit: '곳', tone: 'k-acc', d: `「${친글자}」로 시작하거나 든 동네` }],
    ['이름이 같은 동네', String(같은이름), { unit: '곳', tone: 'k-warn', d: '행정구역까지 보고 고르세요' }],
    ['가장 매물이 많은 후보', U.num(SE_TOWN_SUGGEST[0].n), { unit: '건', d: SE_TOWN_SUGGEST[0].nm }],
    ['등록한 동네', '1', { unit: '곳', tone: 'k-ok', d: '2곳까지' }],
  ])}

${U.detailSplit(`
  ${U.card('동네 이름으로 찾기', `
    <div class="searchbar"><span class="ic">🔍</span>
      <input type="search" value="${친글자}" aria-label="동네 검색">
      ${U.btn('찾기', { cls: 'btn-pri', attr: ' data-toast="후보를 다시 좁혔어요"' })}
    </div>
    <p class="t-sub mt2">글자를 더 칠수록 후보가 줄어듭니다. 지금은 <b>${SE_TOWN_SUGGEST.length}곳</b>이 남았어요.</p>`)}

  <div class="mt-block">${U.card('후보 동네', U.dashTable(
    [{ t: '동네' }, { t: '행정구역', w: '34%' }, { t: '등록 매물', w: '110px' }, { t: '', w: '96px' }],
    SE_TOWN_SUGGEST.map((t) => [
      `<b>${동네후보줄(t.nm, t.hit)}</b>${t.mine ? ' ' + U.badge('지금 내 동네', 'b-pri') : ''}`,
      `<span class="t-sub">${t.gu}</span>`,
      `<b>${U.num(t.n)}</b>`,
      t.mine ? '<span class="t-sub">등록됨</span>'
        : U.btn('고르기', { cls: 'btn-ghost btn-xs', attr: ` data-toast="${t.nm}(${t.gu})을 골랐어요"` }),
    ]),
  ) + `<p class="t-sub mt3">⚠ <b>「역삼동」은 서울 강남구에만 있지만, 「역곡동」·「역촌동」처럼 이름이 비슷한 동네는 다른 시·군에도 있어요.</b>
      그래서 후보마다 행정구역을 함께 적어 둡니다.</p>`, { bdCls: '' })}</div>

  <div class="mt-block">${U.banner('info', '⌨', `후보는 <b>위·아래 화살표</b>로 옮기고 <b>엔터</b>로 고를 수 있어요.`)}</div>
`, `
  ${U.actPanel('고른 동네', U.kv([
    ['동네', SE_TOWN_SUGGEST[0].nm],
    ['행정구역', SE_TOWN_SUGGEST[0].gu],
    ['등록 매물', `${U.num(SE_TOWN_SUGGEST[0].n)}개`],
  ]), `
    ${U.btn('이 동네로 정하기', { href: 'SE0101', cls: 'btn-pri btn-lg' })}
    ${U.btn('이 동네 매물 보기', { href: 'SE0201', cls: 'btn-ghost' })}`)}
  ${U.actPanel('못 찾겠다면', `<p class="t-sub">현재 위치로 찾으면 한 번에 잡힙니다.</p>`,
    U.btn('📍 현재 위치로 찾기', { cls: 'btn-ghost', attr: ' data-toast="현재 위치를 확인했어요 · 역삼동"' })
    + U.btn('위치가 막혔을 때', { href: 'SE0102', cls: 'btn-quiet' }))}
`)}`;
  return { body, o: { state: '동네 검색 자동완성이 떠 있는 상태' } };
}

function SE0104(ctx) {
  const 단계 = 1;
  const r = TOWNS.ranges[단계];
  const body = `
${U.pageHd('내 동네 설정', `범위를 「${r.k}」로 옮겼을 때`,
    `<div class="btns">${U.btn('내 동네 설정', { href: 'SE0101', cls: 'btn-ghost' })}${U.btn('이 범위로 매물 보기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['이 범위 매물', U.num(r.n), { unit: '건', tone: 'k-acc', d: r.k, href: 'SE0201' }],
    ['포함 동네', String(r.towns.length), { unit: '곳', d: r.towns.join(' · ') }],
    ['내 동네만 볼 때', U.num(TOWNS.ranges[0].n), { unit: '건', tone: 'k-mut', d: '한 단계 좁히면' }],
    ['조금 먼 동네까지', U.num(TOWNS.ranges[2].n), { unit: '건', tone: 'k-mut', d: '한 단계 넓히면' }],
  ])}

${U.detailSplit(`
  ${U.card('범위 슬라이더', `
    ${범위슬라이더(단계)}
    <div class="mt4">
      <div class="t-sub mb2">이 범위에 들어오는 동네 <b>${r.towns.length}곳</b></div>
      ${U.chips(r.towns)}
    </div>`)}

  <div class="mt-block">${U.card('지도 — 원이 커졌어요', 동네지도(단계))}</div>

  <div class="mt-block">${U.card('세 단계 비교', 범위표(단계) + `
    <p class="t-sub mt3">손잡이는 세 자리에만 멈춥니다. 「내 동네」와 「가까운 동네」 사이의 값은 없어요 —
      그 사이를 잡으면 어디까지 보이는지 사람이 가늠할 수 없기 때문입니다.</p>`, { bdCls: '' })}</div>
`, `
  ${U.actPanel('지금 범위', U.kv([
    ['범위', r.k],
    ['포함 동네', `${r.towns.length}곳`],
    ['잡히는 매물', `${U.num(r.n)}개`],
    ['내 동네 대비', `+${U.num(r.n - TOWNS.ranges[0].n)}개`],
  ]), `
    ${U.btn('이 범위로 매물 보기', { href: 'SE0201', cls: 'btn-pri btn-lg' })}
    ${U.btn('한 단계 좁히기', { cls: 'btn-ghost', attr: ` data-toast="내 동네로 좁혔어요 · 매물 ${U.num(TOWNS.ranges[0].n)}개"` })}
    ${U.btn('한 단계 넓히기', { cls: 'btn-ghost', attr: ` data-toast="조금 먼 동네까지 넓혔어요 · 매물 ${U.num(TOWNS.ranges[2].n)}개"` })}
    ${U.btn('내 동네 설정으로', { href: 'SE0101', cls: 'btn-quiet' })}`)}
`)}`;
  return { body, o: { state: '범위 슬라이더를 「가까운 동네」로 옮긴 상태' } };
}

function SE0105(ctx) {
  const body = `
${U.pageHd('동네 인증 안내', '그 자리에서 위치를 한 번 확인하면 글쓰기와 채팅이 열려요',
    `<div class="btns">${U.btn('내 동네 설정', { href: 'SE0101', cls: 'btn-ghost' })}${U.btn('지금 인증하기', { cls: 'btn-pri', attr: ' data-toast="역삼동에서 위치를 확인했어요 · 인증 완료" data-toast-kind="ok"' })}</div>`)}

${U.kpis([
    ['인증한 동네', '1', { unit: '곳', tone: 'k-ok', d: `${TOWNS.mine} · 9월 2일 인증` }],
    ['인증 유효 기간', '30', { unit: '일', d: `${SE_VERIFY_VALID}마다 다시 확인해요` }],
    ['인증해야 열리는 것', String(SE_VERIFY_CANT.length), { unit: '가지', tone: 'k-acc', d: '글쓰기·채팅·제안·후기' }],
    ['인증 없이 되는 것', String(SE_VERIFY_CAN.length), { unit: '가지', tone: 'k-mut', d: '보고 찜하는 것은 다 돼요' }],
  ])}

${U.detailSplit(`
  ${U.card('어떻게 인증하나요', U.hsteps(['그 동네로 간다', '「지금 인증하기」를 누른다', '위치 확인 1회', '인증 완료'], 3)
    + `<p class="t-sub mt4">확인한 좌표는 저장하지 않고, 그 동네 안에 있었는지만 기록합니다.</p>`)}

  <div class="mt-block">${U.card('인증 없이 할 수 있는 것과 없는 것', U.dashTable(
    [{ t: '기능' }, { t: '인증 없이', w: '120px' }, { t: '인증하면', w: '120px' }],
    [...SE_VERIFY_CAN.map((k) => [k, U.badge('할 수 있어요', 'b-ok'), U.badge('그대로', 'b-mut')]),
      ...SE_VERIFY_CANT.map((k) => [`<b>${k}</b>`, U.badge('잠김', 'b-mut'), U.badge('열려요', 'b-pri')])],
  ), { bdCls: '' })}</div>

  <div class="mt-block">${U.banner('warn', '🛡', `<b>왜 인증을 받나요</b>
    <div class="t-sub mt1">동네에 살지 않는 사람이 여러 동네에 같은 글을 뿌리는 것을 막기 위해서예요.
      이웃끼리의 장터라는 것이 이 인증 하나로 지켜집니다.</div>`,
  { right: U.btn('안전거래 안내', { href: 'HO0301', cls: 'btn-ghost btn-sm' }) })}</div>

  <div class="mt-block">${U.accordion([
    { q: '동네를 옮겼어요', a: '이전 동네를 지우고 새 동네를 등록한 뒤, 그 자리에서 다시 인증하면 됩니다.' },
    { q: '회사와 집이 달라요', a: `동네는 <b>2곳까지</b> 등록할 수 있어요. 두 곳 모두 그 자리에서 한 번씩 인증하면 둘 다 씁니다.` },
    { q: '인증이 자꾸 실패해요', a: '건물 안쪽이나 지하에서는 위치가 흔들립니다. 창가나 바깥에서 한 번 더 눌러 보세요.' },
  ], -1)}</div>
`, `
  ${U.actPanel('내 인증 상태', U.kv([
    [TOWNS.mine, U.badge('인증 완료', 'b-ok')],
    ['인증한 날', '9월 2일'],
    ['다시 인증', `${SE_VERIFY_VALID} 뒤`],
    ['두 번째 동네', U.badge('등록 안 함', 'b-mut')],
  ]), `
    ${U.btn('지금 인증하기', { cls: 'btn-pri btn-lg', attr: ' data-toast="역삼동에서 위치를 확인했어요 · 인증 완료" data-toast-kind="ok"' })}
    ${U.btn('판매글 쓰러 가기', { href: 'SL0101', cls: 'btn-ghost' })}
    ${U.btn('매물부터 볼게요', { href: 'SE0201', cls: 'btn-quiet' })}`)}
`)}`;
  return { body, o: { state: '동네 인증 안내를 펼친 상태' } };
}

/* ══ SE-02 매물 목록 ═══════════════════════════════════════════════ */

/** 목록 화면 한 벌 — 기준 화면(SE0201)과 네 가지 상태가 «같은 뼈대»를 쓴다. */
function 목록화면(o = {}) {
  const 목록 = o.목록 || 기본차례();
  const 전체 = 목록.length;
  const 보이는 = o.보이는 != null ? o.보이는 : 셈({ 숨김: ['거래완료'] });
  return `
${U.pageHd(o.제목 || `${SITE.myTown} 매물`, o.부제 || '가까운 이웃이 올린 물건부터 보여드려요',
    `<div class="btns">${U.btn('검색으로', { href: 'SE0301', cls: 'btn-ghost' })}${U.btn('판매글 쓰기', { href: 'SL0101', cls: 'btn-pri' })}</div>`)}

${U.kpis(o.kpis)}

${U.filterPage(목록필터(o), `
  ${걸린조건줄()}
  ${U.tableBar(
    `<b data-filter-count="items">${U.num(보이는)}</b>건 <span class="t-sub">/ 모두 <span data-filter-total="items">${U.num(전체)}</span>건</span>
     ${o.바설명 || '<span class="t-sub">· 끌올된 글이 맨 위에 옵니다</span>'}`,
    `${정렬칸(o.정렬)}${U.btn('알림 조건 저장', { href: 'MY0601', cls: 'btn-line btn-sm' })}`,
  )}
  ${매물표(목록, { 강조: o.강조 })}
  <div data-filter-empty="items"${보이는 > 0 ? ' hidden' : ''}>
    ${U.empty('🔍', '조건에 맞는 매물이 없어요', '조건을 하나씩 풀어 보시거나 동네 범위를 넓혀 보세요.',
    U.btn('조건 전체 해제', { cls: 'btn-pri', attr: ' data-filter-reset="items"' })
    + U.btn('결과 없음 화면 보기', { href: 'SE0501', cls: 'btn-ghost' }))}
  </div>
  ${o.아래 || 쪽넘김(전체)}
`)}`;
}

function SE0201(ctx) {
  const 보이는 = 셈({ 숨김: ['거래완료'] });
  const body = 목록화면({
    kpis: [
      ['지금 보이는 매물', `<span data-filter-count="items">${U.num(보이는)}</span>`, { unit: '건', d: '거래완료는 숨긴 수예요' }],
      ['모두', `<span data-filter-total="items">${U.num(ITEMS.length)}</span>`, { unit: '건', tone: 'k-mut', d: '거래완료까지 더한 수' }],
      ['끌올된 글', String(ITEMS.filter((x) => x.boost).length), { unit: '건', tone: 'k-acc', d: '유료로 위에 올린 글이에요', href: 'BS0101' }],
      ['안전결제 되는 매물', String(셈({ ways: ['안전결제'], 숨김: ['거래완료'] })), { unit: '건', tone: 'k-ok', d: '받고 나서 돈이 넘어가요', href: 'PA0101' }],
    ],
    보이는,
    아래: 쪽넘김(ITEMS.length) + 다른상태('이 목록에서 일어나는 일', [
      ['SE0202', '조건을 걸었을 때', '카테고리·상태·거래 방식을 걸면 건수가 줄어요'],
      ['SE0203', '정렬을 바꿨을 때', '차례가 바뀌고 강조되는 보조정보도 바뀌어요'],
      ['SE0204', '거래완료를 숨겼을 때', '끝난 매물이 목록에서 빠져요'],
      ['SE0205', '결과가 없을 때', '조건 풀기 제안과 알림 걸기가 뜹니다'],
    ]),
  });
  return { body, o: {} };
}

function SE0202(ctx) {
  const 켬 = { cat: ['디지털기기'], cond: ['거의 새것'], ways: ['안전결제'] };
  const 보이는 = 셈({ ...켬, 숨김: ['거래완료'] });
  const 조건없이 = 셈({ 숨김: ['거래완료'] });
  const 싼것 = Math.min(...ITEMS.filter((x) => 켬.cat.includes(x.cat) && 켬.cond.includes(x.cond) && x.ways.includes('안전결제')).map((x) => x.price));
  const body = 목록화면({
    제목: '매물 목록',
    부제: '왼쪽에서 조건을 걸면 목록과 건수가 함께 줄어요',
    on: 켬,
    보이는,
    바설명: '<span class="t-sub">· 조건 3개가 걸려 있어요</span>',
    kpis: [
      ['조건에 맞는 매물', `<span data-filter-count="items">${U.num(보이는)}</span>`, { unit: '건', tone: 'k-acc', d: '디지털기기 · 거의 새것 · 안전결제' }],
      ['걸린 조건', '3', { unit: '개', tone: 'k-warn', d: '체크를 지우면 하나씩 풀려요' }],
      ['조건 없이 볼 때', U.num(조건없이), { unit: '건', tone: 'k-mut', d: '전체 해제를 누르면 이만큼' }],
      ['가장 싼 값', U.num(싼것), { unit: '원', d: '이 조건 안에서' }],
    ],
    아래: `<div class="mt-block">${U.banner('info', '🎛', `<b>조건을 하나만 풀면 어떻게 되나요</b>
      <div class="t-sub mt1">왼쪽 필터에서 체크를 지우면 그 조건만 풀리고 건수가 바로 올라갑니다.
        전부 풀려면 「걸린 조건 전체 해제」를 누르세요.</div>`,
    { right: U.btn('전체 해제', { cls: 'btn-pri btn-sm', attr: ' data-filter-reset="items"' }) })}</div>
      ${쪽넘김(ITEMS.length)}`,
  });
  return { body, o: { state: '카테고리·상태·거래 방식 조건이 걸린 상태' } };
}

function SE0203(ctx) {
  const 판매중 = ITEMS.filter((x) => x.st !== '거래완료');
  const 값순 = [...판매중].sort((a, b) => a.price - b.price);
  const 싼것 = 값순[0];
  const 비싼것 = 값순[값순.length - 1];
  const body = 목록화면({
    제목: '매물 목록',
    부제: '정렬을 「낮은 가격순」으로 바꿨을 때',
    목록: 값순,
    정렬: 'price',
    강조: 'price',
    보이는: 판매중.length,
    바설명: '<span class="t-sub">· 값이 싼 것부터 · 고른 정렬은 다음 화면에서도 그대로예요</span>',
    kpis: [
      ['지금 정렬', '값', { unit: '순', tone: 'k-acc', d: '낮은 가격순으로 세웠어요' }],
      ['가장 싼 매물', U.num(싼것.price), { unit: '원', d: U.esc(싼것.t) }],
      ['가장 비싼 매물', U.num(비싼것.price), { unit: '원', tone: 'k-mut', d: U.esc(비싼것.t) }],
      ['보이는 매물', `<span data-filter-count="items">${U.num(판매중.length)}</span>`, { unit: '건', d: '거래완료는 숨긴 수' }],
    ],
    아래: `<div class="mt-block">${U.card('정렬을 바꾸면 무엇이 달라지나요', U.dashTable(
      [{ t: '정렬', w: '150px' }, { t: '무엇이 앞에 오나' }, { t: '강조되는 보조정보', w: '190px' }],
      [
        ['<b>거리순</b>', '내 동네에서 가까운 물건부터', `<span class="t-sub">동네 칸의 <b>km</b></span>`],
        ['<b>최신순</b>', '방금 올라온 글부터', `<span class="t-sub">올라온 지 칸의 <b>분·시간</b></span>`],
        [`<b style="color:var(--pri-text)">낮은 가격순</b> ${U.badge('지금 이것', 'b-pri')}`, '값이 싼 물건부터', `<span class="t-sub">값 칸이 <b>굵게</b></span>`],
        ['<b>인기순</b>', '찜이 많은 물건부터', `<span class="t-sub">관심 칸의 <b>찜 수</b></span>`],
      ],
    ) + `<p class="t-sub mt3">끌올된 글은 정렬과 상관없이 맨 위에 오지만, 「끌올」 배지를 달아 광고라는 것을 숨기지 않습니다.
      지금은 값 순서를 보여 주려고 끌올을 위로 올리지 않았어요.</p>`, { bdCls: '' })}</div>
      ${쪽넘김(판매중.length)}`,
  });
  return { body, o: { state: '정렬을 「낮은 가격순」으로 바꾼 상태' } };
}

function SE0204(ctx) {
  const 전체 = ITEMS.length;
  const 보이는 = 셈({ 숨김: ['거래완료'] });
  const body = 목록화면({
    제목: '매물 목록',
    부제: '「거래완료 숨기기」를 켰을 때와 껐을 때',
    보이는,
    바설명: `<span class="t-sub">· 거래완료 ${전체 - 보이는}건을 숨겼어요</span>`,
    kpis: [
      ['지금 보이는 매물', `<span data-filter-count="items">${U.num(보이는)}</span>`, { unit: '건', tone: 'k-acc', d: '숨기기를 켠 상태' }],
      ['판매중', String(ITEMS.filter((x) => x.st === '판매중').length), { unit: '건', d: '아직 살 수 있는 물건' }],
      ['예약중', String(ITEMS.filter((x) => x.st === '예약중').length), { unit: '건', tone: 'k-warn', d: '약속이 잡힌 물건' }],
      ['거래완료', String(ITEMS.filter((x) => x.st === '거래완료').length), { unit: '건', tone: 'k-mut', d: '끄면 목록에 다시 나와요' }],
    ],
    아래: `<div class="mt-block">${U.card('이 토글이 하는 일', `
      <div class="toggle-row">
        <span><b>거래완료 숨기기</b><div class="t-sub">왼쪽 필터 「그 밖에」에 있는 체크와 같은 것입니다</div></span>
        <span class="t-sub">켜짐 → <b>${U.num(보이는)}건</b> · 꺼짐 → <b>${U.num(전체)}건</b></span>
      </div>
      <p class="t-sub mt3">켜면 거래완료 배지가 달린 줄이 목록에서 빠지고 건수가 줄어듭니다.
        끄면 값에 취소선이 그어진 채로 되돌아와요 — 시세를 가늠할 때 쓰라고 남겨 둡니다.</p>
      <div class="btns mt3">${U.btn('체크 풀어서 다시 보기', { cls: 'btn-ghost btn-sm', attr: ' data-filter-reset="items"' })}</div>`)}</div>
      ${쪽넘김(전체)}`,
  });
  return { body, o: { state: '거래완료 숨기기를 켠 상태' } };
}

function SE0205(ctx) {
  const 켬 = { cat: ['반려동물용품'], cond: ['새것'] };
  const 보이는 = 셈({ ...켬, 숨김: ['거래완료'] });
  const body = 목록화면({
    제목: '매물 목록',
    부제: '건 조건으로는 잡히는 매물이 없어요',
    on: 켬,
    보이는,
    바설명: '<span class="t-sub">· 조건 2개가 걸려 있어요</span>',
    kpis: [
      ['조건에 맞는 매물', `<span data-filter-count="items">0</span>`, { unit: '건', tone: 'k-danger', d: '반려동물용품 · 새것' }],
      ['걸린 조건', '2', { unit: '개', tone: 'k-warn', d: '하나씩 풀어 보세요' }],
      ['카테고리만 풀면', String(셈({ cond: 켬.cond, 숨김: ['거래완료'] })), { unit: '건', tone: 'k-acc', d: '「새것」만 남겼을 때' }],
      ['상태만 풀면', String(셈({ cat: 켬.cat, 숨김: ['거래완료'] })), { unit: '건', tone: 'k-acc', d: '「반려동물용품」만 남겼을 때' }],
    ],
    아래: `<div class="mt-block">${U.sec('조건을 하나씩 풀어 보세요', `<div class="stack-sm">
      ${[['카테고리 · 반려동물용품', 셈({ cond: 켬.cond, 숨김: ['거래완료'] })], ['물건 상태 · 새것', 셈({ cat: 켬.cat, 숨김: ['거래완료'] })]]
      .map(([k, n]) => `<div class="cond-row"><span class="grow">${k}</span>
        <span class="t-sub">이것만 풀면 <b>${n}개</b></span>
        ${U.btn('풀기', { cls: 'btn-ghost btn-sm', attr: ' data-filter-reset="items"' })}</div>`).join('')}
      </div>`)}
      ${U.banner('info', '🔔', `<b>올라오면 알려드릴까요?</b>
        <div class="t-sub mt1">「반려동물용품 · 새것 · 내 동네」 조건으로 새 매물이 올라오면 바로 알려드려요.</div>`,
    { right: U.btn('알림 받기', { href: 'MY0601', cls: 'btn-pri btn-sm' }) })}
      <div class="mt-block">${U.btn('결과 없음 화면 자세히 보기', { href: 'SE0501', cls: 'btn-ghost btn-block' })}</div></div>`,
  });
  return { body, o: { state: '조건에 맞는 매물이 0건인 상태' } };
}

/* ══ SE-03 검색 ════════════════════════════════════════════════════ */

/** 자동완성 후보 목록 — 친 글자를 형광펜으로 올리고 후보마다 매물 수를 적는다 */
const 후보목록 = (친글자, 고른 = -1) => `<div class="stack-sm">
  ${SE_SUGGEST.map((s, i) => `<a class="sugg${i === 고른 ? ' hl' : ''}" href="${U.link('SE0201')}"${i === 고른 ? ' style="background:var(--pri-06)"' : ''}>
    <span><span class="hl">${U.esc(친글자)}</span>${U.esc(s.w.slice(친글자.length))}</span>
    <span class="t-sub nowrap">매물 ${U.num(s.n)}개${i === 고른 ? ' · 지금 고른 후보' : ''}</span></a>`).join('')}
</div>`;

const 최근검색어칩 = () => `<div class="chips" data-recent>
  ${RECENT_WORDS.map((w) => `<button class="chip on" type="button" data-recent-x data-toast="「${w}」를 지웠어요">${w} <span class="x">✕</span></button>`).join('')}
</div>`;

const 인기표 = () => U.dashTable(
  [{ t: '순위', w: '70px' }, { t: '검색어' }, { t: '변동', w: '100px' }, { t: '매물 수', w: '110px' }, { t: '', w: '96px' }],
  RANK_WORDS.map((r, i) => [
    `<b class="${i < 3 ? '' : 't-sub'}">${i + 1}</b>`,
    `<b>${r.w}</b>`,
    r.d > 0 ? `<span style="color:var(--danger)">▲ ${r.d}</span>`
      : (r.d < 0 ? `<span style="color:var(--success)">▼ ${-r.d}</span>` : '<span class="t-sub">— 그대로</span>'),
    `<span class="t-sub">${U.num(120 + (10 - i) * 19)}</span>`,
    U.btn('이 말로 찾기', { cls: 'btn-ghost btn-xs', attr: ` data-go="${U.link('SE0201')}"` }),
  ]),
  { max: '420px' },
);

function SE0301(ctx) {
  const 미리 = 기본차례().filter((x) => x.st !== '거래완료').slice(0, 5);
  const body = `
${U.pageHd('검색', '찾는 물건 이름을 적어 보세요',
    `<div class="btns">${U.btn('매물 목록으로', { href: 'SE0201', cls: 'btn-ghost' })}${U.btn('결과 전체 보기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['「무선청소기」 결과', U.num(SE_SUGGEST[0].n), { unit: '건', tone: 'k-acc', d: '지금 올라와 있는 매물', href: 'SE0201' }],
    ['자동완성 후보', String(SE_SUGGEST.length), { unit: '개', d: '칠수록 좁혀져요', href: 'SE0302' }],
    ['최근 검색어', String(RECENT_WORDS.length), { unit: '개', tone: 'k-mut', d: '지우거나 저장을 끌 수 있어요', href: 'SE0303' }],
    ['인기 검색어', String(RANK_WORDS.length), { unit: '개', tone: 'k-ok', d: `${SE_RANK_AT} 갱신`, href: 'SE0304' }],
  ])}

${U.detailSplit(`
  <div class="searchbar lg"><span class="ic">🔍</span>
    <input type="search" placeholder="어떤 물건을 찾으세요?" value="무선청소기" aria-label="매물 검색">
    ${U.btn('찾기', { cls: 'btn-pri btn-lg', attr: ' data-toast="검색 결과를 불러왔어요"' })}
  </div>

  <div class="mt-block">${U.card('이런 말인가요', 후보목록('무선청')
    + `<p class="t-sub mt3">글자를 더 치면 후보가 줄어듭니다 — <a class="link" href="${U.link('SE0302')}">치는 중 화면</a></p>`)}</div>

  <div class="mt-block">${U.sec('최근 검색어', 최근검색어칩()
    + `<div class="row-c mt3">
        <button class="link quiet" type="button" data-recent-clear>전체 삭제</button>
        <span class="t-sub">· 칩의 ✕ 를 누르면 그 말만 지워집니다</span>
        <a class="link" href="${U.link('SE0303')}" style="margin-left:auto">검색어 저장 설정 ›</a>
      </div>`)}</div>

  ${U.sec('인기 검색어', 인기표(), { aside: `<span class="t-sub">${SE_RANK_AT} 갱신</span>`, more: 'SE0304', moreLabel: '순위 자세히' })}

  ${U.sec('이 분류 안에서만 찾기', U.card('', `
    <label class="check mb3"><input type="checkbox"><span>고른 분류 안에서만 찾을게요</span></label>
    <select class="input"><option value="">분류 고르기</option>${CATS.map((c) => `<option>${c.nm}</option>`).join('')}</select>
    <p class="t-sub mt2">분류를 좁히면 이름이 비슷한 다른 물건이 섞이지 않아요.</p>`))}

  ${U.sec('이렇게 찾으면 더 잘 나와요', U.accordion([
    {
      q: '검색 도움말 — 따옴표·제외어',
      a: `<ul class="dots"><li>낱말을 띄어 쓰면 <b>둘 다 든 것</b>을 찾습니다 — 「다이슨 청소기」</li>
        <li>빼고 찾으려면 앞에 빼기표를 붙입니다 — 「청소기 -부품」</li>
        <li>따옴표로 묶으면 <b>그대로 붙은 말</b>만 찾습니다 — 「"무선 청소기"」</li>
        <li>값을 정해 찾으려면 왼쪽 필터의 가격 칸을 쓰세요.</li></ul>`,
    },
  ], 0))}

  ${U.sec('먼저 이런 것이 나와요', U.tableBar(`<b>${U.num(SE_SUGGEST[0].n)}</b>건 가운데 <b>5</b>건 미리 보기`,
    U.btn('결과 전체 보기', { href: 'SE0201', cls: 'btn-pri btn-sm' })) + 매물표(미리))}

  <p class="t-sub mt4 center">찾는 것이 없으면 <a class="link" href="${U.link('SE0305')}">이런 화면</a>이 나와요.</p>
`, `
  ${U.actPanel('지금 찾는 말', U.kv([
    ['검색어', '무선청소기'],
    ['잡히는 매물', `${U.num(SE_SUGGEST[0].n)}개`],
    ['동네 범위', TOWNS.ranges[0].k],
    ['분류 좁히기', '안 씀'],
  ]), `
    ${U.btn('결과 전체 보기', { href: 'SE0201', cls: 'btn-pri btn-lg' })}
    ${U.btn('🔔 이 말로 알림 받기', { href: 'MY0601', cls: 'btn-ghost' })}
    ${U.btn('결과가 없을 때', { href: 'SE0501', cls: 'btn-quiet' })}`)}
  ${U.actPanel('자주 찾는 말', U.chips(HOT_WORDS, -1, { extra: ` data-go="${U.link('SE0201')}"` }), '')}
`)}`;
  return { body, o: {} };
}

function SE0302(ctx) {
  const 친글자 = '무선청';
  const body = `
${U.pageHd('검색', `「${친글자}」까지 쳤을 때`,
    `<div class="btns">${U.btn('검색으로', { href: 'SE0301', cls: 'btn-ghost' })}${U.btn('결과 전체 보기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['좁혀진 후보', String(SE_SUGGEST.length), { unit: '개', tone: 'k-acc', d: `「${친글자}」이 든 말` }],
    ['가장 많은 후보', U.num(SE_SUGGEST[0].n), { unit: '건', d: SE_SUGGEST[0].w, href: 'SE0201' }],
    ['지금 고른 후보', '2', { unit: '번째', tone: 'k-warn', d: '↑ ↓ 로 옮기고 엔터로 고릅니다' }],
    ['한 글자 더 치면', String(SE_SUGGEST.filter((s) => s.w.startsWith('무선청소')).length), { unit: '개', tone: 'k-mut', d: '「무선청소」까지 쳤을 때' }],
  ])}

${U.detailSplit(`
  <div class="searchbar lg"><span class="ic">🔍</span>
    <input type="search" value="${친글자}" aria-label="매물 검색">
    ${U.btn('찾기', { cls: 'btn-pri btn-lg', attr: ' data-toast="검색 결과를 불러왔어요"' })}
  </div>

  <div class="mt-block">${U.card('이런 말인가요 — 입력마다 다시 좁혀집니다', 후보목록(친글자, 1)
    + `<div class="row-c mt3"><span class="t-sub">↑ ↓ 로 후보를 옮기고 <b>엔터</b>로 고릅니다. <b>ESC</b> 를 누르면 후보가 닫혀요.</span></div>`)}</div>

  <div class="mt-block">${U.card('친 글자에 따라 어떻게 달라지나요', U.dashTable(
    [{ t: '친 글자', w: '140px' }, { t: '남는 후보', w: '110px' }, { t: '맨 위 후보' }],
    [
      ['<b>무</b>', '18개', '<span class="t-sub">무선이어폰 · 무선청소기 · 무선마우스 …</span>'],
      ['<b>무선</b>', '9개', '<span class="t-sub">무선청소기 · 무선이어폰 · 무선충전기</span>'],
      [`<b style="color:var(--pri-text)">무선청</b> ${U.badge('지금', 'b-pri')}`, `${SE_SUGGEST.length}개`, `<b>${SE_SUGGEST[0].w}</b> <span class="t-sub">매물 ${U.num(SE_SUGGEST[0].n)}개</span>`],
      ['<b>무선청소</b>', `${SE_SUGGEST.filter((s) => s.w.startsWith('무선청소')).length}개`, '<span class="t-sub">거의 다 좁혀졌어요</span>'],
    ],
  ), { bdCls: '' })}</div>

  ${U.banner('quiet', '⌨', `후보에 마우스를 올려도 같은 자리가 켜집니다. 고르면 그 말로 검색하고 최근 검색어에 남아요.`)}
`, `
  ${U.actPanel('고른 후보', U.kv([
    ['후보', SE_SUGGEST[1].w],
    ['잡히는 매물', `${U.num(SE_SUGGEST[1].n)}개`],
    ['고르는 법', '엔터'],
  ]), `
    ${U.btn('이 말로 찾기', { href: 'SE0201', cls: 'btn-pri btn-lg' })}
    ${U.btn('검색 화면으로', { href: 'SE0301', cls: 'btn-ghost' })}`)}
`)}`;
  return { body, o: { state: '자동완성 후보가 떠 있는 상태' } };
}

function SE0303(ctx) {
  const body = `
${U.pageHd('최근 검색어 관리', '지우거나, 아예 저장하지 않게 할 수 있어요',
    `<div class="btns">${U.btn('검색으로', { href: 'SE0301', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['저장된 검색어', String(RECENT_WORDS.length), { unit: '개', tone: 'k-acc', d: '이 기기에만 저장돼요' }],
    ['저장 설정', '켜짐', { tone: 'k-ok', d: '끄면 새 검색어가 안 쌓여요' }],
    ['보관 기간', '30', { unit: '일', tone: 'k-mut', d: '지난 것은 저절로 지워져요' }],
    ['인기 검색어', String(RANK_WORDS.length), { unit: '개', tone: 'k-mut', d: '이건 지워도 그대로예요', href: 'SE0304' }],
  ])}

${U.detailSplit(`
  ${U.card('최근 검색어', 최근검색어칩()
    + `<div class="row-c mt3">
        <button class="link quiet" type="button" data-recent-clear>전체 삭제</button>
        <span class="t-sub">· ✕ 를 누르면 «그 말만» 사라집니다</span>
      </div>`)}

  <div class="mt-block">${U.card('전체 삭제를 누르면', U.modalStatic('최근 검색어를 모두 지울까요',
    `<p>저장된 검색어 <b>${RECENT_WORDS.length}개</b>가 지워집니다. 지운 검색어는 되돌릴 수 없어요.</p>
     <p class="t-sub mt2">인기 검색어와 찜한 물건은 그대로 남습니다.</p>`,
    `${U.btn('그대로 둘게요', { cls: 'btn-ghost' })}${U.btn('모두 지우기', { cls: 'btn-danger', attr: ' data-recent-clear' })}`))}</div>

  <div class="mt-block">${U.card('검색어 저장 설정', `
    <div class="toggle-row">
      <span><b>검색어 저장하기</b><div class="t-sub">끄면 새로 찾은 말이 쌓이지 않아요. 이미 있던 것도 함께 지웁니다.</div></span>
      <button class="toggle on" type="button" data-toast="검색어 저장을 껐어요 · 쌓여 있던 말도 지웠습니다" aria-label="검색어 저장"></button>
    </div>
    <div class="toggle-row">
      <span><b>이 기기에서만 쓰기</b><div class="t-sub">다른 기기에서는 이 검색어가 보이지 않아요</div></span>
      <button class="toggle on" type="button" data-toast="이 기기에서만 쓰도록 해 두었어요" aria-label="이 기기에서만"></button>
    </div>`)}</div>

  ${U.banner('quiet', '🔒', `최근 검색어는 이 브라우저에만 저장하고 서버로 보내지 않습니다.
    공용 컴퓨터라면 저장을 꺼 두세요.`)}
`, `
  ${U.actPanel('지금 설정', U.kv([
    ['저장된 검색어', `${RECENT_WORDS.length}개`],
    ['저장하기', U.badge('켜짐', 'b-ok')],
    ['보관 기간', '30일'],
  ]), `
    ${U.btn('모두 지우기', { cls: 'btn-danger btn-lg', attr: ' data-recent-clear' })}
    ${U.btn('검색 화면으로', { href: 'SE0301', cls: 'btn-ghost' })}
    ${U.btn('알림·개인 설정', { href: 'MY0601', cls: 'btn-quiet' })}`)}
`)}`;
  return { body, o: { state: '최근 검색어를 관리하는 상태' } };
}

function SE0304(ctx) {
  const 오름 = RANK_WORDS.filter((r) => r.d > 0).length;
  const 내림 = RANK_WORDS.filter((r) => r.d < 0).length;
  const body = `
${U.pageHd('인기 검색어', `이웃들이 많이 찾는 말 ${RANK_WORDS.length}가지`,
    `<div class="btns">${U.btn('검색으로', { href: 'SE0301', cls: 'btn-ghost' })}${U.btn('매물 목록', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['1위', RANK_WORDS[0].w, { tone: 'k-acc', d: `매물 ${U.num(SE_SUGGEST[0].n)}개`, href: 'SE0201' }],
    ['순위가 오른 말', String(오름), { unit: '개', tone: 'k-warn', d: '어제보다 위로 올라왔어요' }],
    ['순위가 내린 말', String(내림), { unit: '개', tone: 'k-mut', d: '어제보다 내려갔어요' }],
    ['갱신 주기', '10', { unit: '분', tone: 'k-ok', d: `${SE_RANK_AT}에 새로 셌어요` }],
  ])}

${U.detailSplit(`
  ${U.sec('지금 순위', 인기표(), { aside: `<span class="t-sub">${SE_RANK_AT} 갱신 · 10분마다 다시 셉니다</span>` })}

  ${U.sec('어떻게 세나요', U.card('', `<ul class="dots">
    <li>지난 <b>24시간</b> 동안 찾은 횟수로 셉니다. 같은 사람이 여러 번 찾은 것은 한 번으로 봅니다.</li>
    <li>▲ ▼ 는 <b>어제 같은 시각</b>과 견준 자리 변화입니다.</li>
    <li>금지 품목과 관련된 말은 순위에서 뺍니다 — <a class="link" href="${U.link('HO0301')}">안전거래 안내</a></li>
  </ul>`))}

  ${U.banner('info', '👆', `순위의 말을 누르면 <b>그 말로 바로 찾습니다</b>. 찾은 말은 최근 검색어에 남아요.`,
    { right: U.btn('최근 검색어 관리', { href: 'SE0303', cls: 'btn-ghost btn-sm' }) })}
`, `
  ${U.actPanel('1~3위', U.kv(RANK_WORDS.slice(0, 3).map((r, i) => [`${i + 1}위`, `<b>${r.w}</b>`])), `
    ${U.btn(`「${RANK_WORDS[0].w}」로 찾기`, { href: 'SE0201', cls: 'btn-pri btn-lg' })}
    ${U.btn('검색 화면으로', { href: 'SE0301', cls: 'btn-ghost' })}`)}
  ${U.actPanel('내가 찾는 말은', `<p class="t-sub">자주 찾는 말을 알림으로 걸어 두면 새 매물이 올라올 때 알려드려요.</p>`,
    U.btn('🔔 관심 키워드 설정', { href: 'MY0601', cls: 'btn-ghost' }))}
`)}`;
  return { body, o: { state: '인기 검색어 순위를 펼친 상태' } };
}

function SE0305(ctx) {
  const 인기 = 기본차례().filter((x) => x.st !== '거래완료').slice(0, 5);
  const body = `
${U.pageHd('검색 결과', `「${SE_TYPO.typed}」로 찾은 결과가 없어요`,
    `<div class="btns">${U.btn('검색으로', { href: 'SE0301', cls: 'btn-ghost' })}${U.btn('인기 매물 보기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['「' + SE_TYPO.typed + '」 결과', '0', { unit: '건', tone: 'k-danger', d: '이 말로는 잡히는 것이 없어요' }],
    ['고쳐 찾으면', U.num(SE_TYPO.n), { unit: '건', tone: 'k-acc', d: `「${SE_TYPO.fixed}」로 찾은 결과`, href: 'SE0201' }],
    ['비슷한 말', String(SE_NEAR_WORDS.length), { unit: '개', d: '눌러서 바로 찾을 수 있어요' }],
    ['지금 인기 매물', String(인기.length), { unit: '건', tone: 'k-mut', d: '돌아가서 둘러보기', href: 'SE0201' }],
  ])}

${U.detailSplit(`
  <div class="searchbar lg"><span class="ic">🔍</span>
    <input type="search" value="${SE_TYPO.typed}" aria-label="매물 검색">
    ${U.btn('찾기', { cls: 'btn-pri btn-lg', attr: ' data-toast="검색 결과를 불러왔어요"' })}
  </div>

  <div class="mt-block">${U.banner('acc', '💡', `혹시 <b>「${SE_TYPO.fixed}」</b>를 찾으셨나요?
    <div class="t-sub mt1">이 말로 찾으면 매물 ${U.num(SE_TYPO.n)}개가 잡혀요.</div>`,
    { right: U.btn(`「${SE_TYPO.fixed}」로 찾기`, { href: 'SE0201', cls: 'btn-pri btn-sm' }) })}</div>

  <div class="mt-block">${U.empty('🔍', `「${SE_TYPO.typed}」에 맞는 매물이 없어요`,
    '글자를 잘못 치셨거나, 아직 이 동네에 그 물건이 안 올라왔을 수 있어요.', '')}</div>

  ${U.sec('이런 말은 어때요', U.chips(SE_NEAR_WORDS, -1, { extra: ` data-go="${U.link('SE0201')}"` }))}

  ${U.sec('지금 인기 있는 매물', 매물표(인기), { more: 'SE0201', moreLabel: '매물 전체 보기' })}
`, `
  ${U.actPanel('이 말로 알림 받기', `<p class="t-sub">「${SE_TYPO.fixed}」가 올라오면 바로 알려드릴까요?</p>
    ${U.kv([['알림 조건', SE_TYPO.fixed], ['동네 범위', TOWNS.ranges[1].k], ['받는 방법', '앱 알림']])}`, `
    ${U.btn('🔔 올라오면 알려주세요', { href: 'MY0601', cls: 'btn-pri btn-lg' })}
    ${U.btn('다른 말로 찾기', { href: 'SE0301', cls: 'btn-ghost' })}
    ${U.btn('인기 매물로 돌아가기', { href: 'SE0201', cls: 'btn-quiet' })}`)}
`)}`;
  return { body, o: { state: '검색 결과가 0건인 상태' } };
}

/* ══ SE-04 매물 상세 ═══════════════════════════════════════════════ */

/** 사진 자리 — 큰 사진 한 장 + 장수 표시 + 좌우 넘기기 + 아래 작은 사진 줄 */
const 사진칸 = (it, 지금 = 1) => `${U.phShot(it.id, {
  after: `<span class="gal-n">${지금} / ${it.photos}</span>
    ${it.st !== '판매중' ? /* ⚠ 덮개는 «옅게» 건다 — 자리표시자 위에 어두운 막을 덮으면
         안에 적은 「이미지 영역 (…)」이 묻혀 깨진 그림처럼 보인다(가이드 프리셋 규칙). */
    `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(240,239,235,.72);border-radius:var(--r-card)">
      <span class="badge lg" style="background:#2A2320;color:#FFFFFF">${it.st}</span></span>` : ''}
    <button class="gal-nav prev" type="button" data-toast="이전 사진" aria-label="이전 사진">‹</button>
    <button class="gal-nav next" type="button" data-toast="다음 사진" aria-label="다음 사진">›</button>`,
})}
<div class="row mt3" style="gap:8px;flex-wrap:wrap">
  ${[...Array(Math.min(it.photos, 6))].map((_, n) => U.phItem(64, it.id + n)).join('')}
  <a class="btn btn-ghost btn-sm" href="${U.link('SE0402')}" style="align-self:center">크게 보기</a>
</div>`;

/** 매물 본문 — 상세 화면 넷이 같은 본문을 쓴다(상태만 다르다) */
function 상세본문(it, o = {}) {
  const u = userBy(it.by);
  const 다른것 = ITEMS.filter((x) => x.by === it.by && x.id !== it.id).slice(0, 4);
  const 비슷 = ITEMS.filter((x) => x.cat === it.cat && x.id !== it.id).slice(0, 4);
  const 끝난것 = it.st === '거래완료';
  return `
${사진칸(it, o.지금사진 || 1)}

<div class="mt-block">
  <div class="row-c wrap-row mb2">${U.badge(it.cat, 'b-mut')}${U.stBadge(it.st)}${it.boost ? U.boostBadge() : ''}${o.내글 ? U.badge('내 글이에요', 'b-pri') : ''}${it.offer && !끝난것 ? U.badge('가격 제안 받아요', 'b-acc') : ''}</div>
  <h1 class="t-page">${U.esc(it.t)}</h1>
  <div class="price-lg mt2" style="color:var(--pri-text)">${끝난것 ? `<s>${U.won(it.price)}</s> <span class="badge b-mut lg">거래완료</span>` : U.won(it.price)}</div>
  <p class="t-sub mt2">${it.town} · ${ago(it.min)}에 올라온 글 · ${it.dist}km · 조회 ${U.num(it.view)} · 찜 ${it.wish} · 채팅 ${it.chat}</p>
</div>

<div class="mt-block">${U.kv([
    ['물건 상태', `${U.badge(it.cond, 'b-mut')} <span class="t-sub">${(CONDS.find((c) => c.k === it.cond) || {}).d || ''}</span>`],
    ['쓴 기간', it.use],
    ['카테고리', `${it.cat} › ${it.sub}`],
    ['거래 방식', U.wayBadges(it.ways) + (it.ship ? ` <span class="t-sub">택배비 ${U.won(it.ship)}</span>` : ' <span class="t-sub">택배는 안 해요</span>')],
    ['직거래 지역', `${it.town} 일대`],
    ...(it.offer ? [['가격 제안', `${U.won(it.offerMin)}부터 받아요`]] : []),
  ])}</div>

${U.sec('설명', `<p style="white-space:pre-line;line-height:var(--lh-body,1.7)">${U.esc(it.desc)}</p>`)}

${U.sec('직거래는 여기서', U.phMap('직거래 지역 지도', 1200, 500)
    + `<p class="t-sub mt3">${it.town} 일대에서 만나 거래합니다. 정확한 자리는 채팅에서 정해요.</p>
    <div class="btns mt3">${U.btn('안전거래존 보기', { href: 'CH0301', cls: 'btn-ghost btn-sm' })}</div>`)}

${U.sec('이 판매자', U.userCard(u, { href: 'MY0101', right: U.btn('프로필 보기', { href: 'MY0101', cls: 'btn-ghost btn-sm' }) }))}

${다른것.length ? U.sec(`${u.nick}님의 다른 매물`, `<div class="g4">${다른것.map((x) => U.itemCard(x, { href: 'SE0401' })).join('')}</div>`) : ''}

${U.sec('비슷한 매물', `<div class="g4">${비슷.map((x) => U.itemCard(x, { href: 'SE0401' })).join('')}</div>`, { more: 'SE0201', moreLabel: '매물 전체 보기' })}

${U.banner('warn', '🛡', `<b>돈을 먼저 보내 달라고 하면 의심하세요</b>
  <div class="t-sub mt1">안전결제를 쓰면 물건을 받고 「받았어요」를 누른 뒤에 돈이 넘어갑니다.</div>`,
    { right: U.btn('신고하기', { href: 'CH0401', cls: 'btn-ghost btn-sm' }) })}`;
}

/** 판매자 패널 — 상세 화면 넷이 함께 쓴다 */
const 판매자패널 = (u) => U.actPanel('판매자', `
  <div class="row-c">${U.phAva(44, u.id)}<div>
    <div class="row-c"><a class="strong" href="${U.link('MY0101')}">${U.esc(u.nick)}</a>${U.manner(u.manner)}</div>
    <div class="t-sub">${u.town} · 판 것 ${u.sold}회 · 응답률 ${u.resp}%</div></div></div>
  <div class="verifies mt3">${u.tags.length ? u.tags.map(U.verify).join('') : '<span class="t-sub">아직 인증한 것이 없어요</span>'}</div>`,
U.btn('판매자 프로필 보기', { href: 'MY0101', cls: 'btn-ghost' }));

function SE0401(ctx) {
  const it = itemBy('i1');
  const u = userBy(it.by);
  const body = `
${U.pageHd('매물 상세', `${it.town} · ${ago(it.min)}에 올라온 글`,
    `<div class="btns">${U.btn('매물 목록', { href: 'SE0201', cls: 'btn-ghost' })}${U.btn('채팅하기', { href: 'CH0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['파는 값', U.num(it.price), { unit: '원', d: it.offer ? `제안은 ${U.won(it.offerMin)}부터` : '값 제안은 안 받아요' }],
    ['조회', U.num(it.view), { unit: '회', tone: 'k-mut', d: '올린 지 ' + ago(it.min) }],
    ['찜', String(it.wish), { unit: '명', tone: 'k-acc', d: '이 물건을 담아 둔 이웃' }],
    ['채팅', String(it.chat), { unit: '건', tone: 'k-ok', d: '지금 이야기 중인 사람', href: 'CH0101' }],
  ])}

${U.detailSplit(상세본문(it) + 다른상태('이 매물 화면의 다른 상태', [
    ['SE0402', '사진을 크게 볼 때', '전체화면으로 넘겨 보고 배율을 바꿉니다'],
    ['SE0403', '가격을 제안할 때', '판매자가 정한 최저 금액을 검사해요'],
    ['SE0404', '거래가 끝난 매물', '값에 취소선이 그어지고 버튼이 잠깁니다'],
    ['SE0405', '내가 올린 글일 때', '수정·끌올·상태 바꾸기가 대신 보여요'],
  ]), `
  ${U.actPanel('이 매물 사기', U.kv([
    ['값', `<b>${U.won(it.price)}</b>`],
    ['택배비', it.ship ? U.won(it.ship) : '택배 안 함'],
    ['거래 방식', U.wayBadges(it.ways)],
  ]), `
    ${U.btn('채팅하기', { href: 'CH0201', cls: 'btn-pri btn-lg' })}
    ${it.ways.includes('안전결제')
    ? U.btn('안전결제로 사기', { href: 'PA0101', cls: 'btn-acc' })
    : U.btn('이 매물은 안전결제를 안 받아요', { cls: 'btn-ghost', off: true })}
    ${it.offer ? U.btn('가격 제안하기', { href: 'SE0403', cls: 'btn-ghost' }) : ''}
    <div class="row-b mt2">
      <button class="heart grow" type="button" data-wish="${it.wish}">♡ 찜하기 <span class="n">${it.wish}</span></button>
      ${U.btn('공유', { cls: 'btn-quiet btn-sm', attr: ' data-toast="이 매물 링크를 복사했어요"' })}
    </div>`, { state: it.st })}

  ${판매자패널(u)}

  ${U.actPanel('안전하게 거래하기', `<ul class="dots t-sub">
    <li>값을 먼저 보내 달라는 말은 의심하세요</li>
    <li>직거래는 사람이 많은 곳에서</li>
    <li>택배 거래는 안전결제로</li></ul>`, `
    ${U.btn('안전거래 안내', { href: 'HO0301', cls: 'btn-ghost' })}
    ${U.btn('⚑ 이 매물 신고하기', { href: 'CH0401', cls: 'btn-quiet' })}`)}
`)}`;
  return { body, o: {} };
}

function SE0402(ctx) {
  const it = itemBy('i1');
  const u = userBy(it.by);
  const 지금 = 3;
  const body = `
${U.pageHd('사진 크게 보기', `${U.esc(it.t)} — ${it.photos}장 가운데 ${지금}번째`,
    `<div class="btns">${U.btn('매물 상세로 돌아가기', { href: 'SE0401', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['사진', String(it.photos), { unit: '장', d: '판매자가 올린 사진' }],
    ['지금 보는 사진', String(지금), { unit: '번째', tone: 'k-acc', d: '← → 로 넘길 수 있어요' }],
    ['확대 배율', '150', { unit: '%', tone: 'k-warn', d: '100 · 150 · 200%' }],
    ['찜', String(it.wish), { unit: '명', tone: 'k-mut', d: '닫아도 그대로예요' }],
  ])}

${U.detailSplit(`
  <div class="lightbox">
    <div class="row-b mb3">
      <span>${U.esc(it.t)} <span class="t-sub">· ${지금} / ${it.photos}</span></span>
      <button class="btn btn-quiet btn-sm" type="button" data-go="${U.link('SE0401')}" data-toast="사진을 닫았어요">✕ 닫기</button>
    </div>
    ${U.phShot(it.id + 3, { style: 'max-height:460px' })}
    <button class="nav prev" type="button" data-toast="이전 사진 (${지금 - 1} / ${it.photos})" aria-label="이전 사진">‹</button>
    <button class="nav next" type="button" data-toast="다음 사진 (${지금 + 1} / ${it.photos})" aria-label="다음 사진">›</button>
    <div class="cap">헤드 3종 · 충전 거치대까지 함께 드립니다</div>
  </div>

  <div class="row-b mt4 wrap-row">
    <div class="row" style="gap:8px;flex-wrap:wrap">
      ${[...Array(it.photos)].map((_, n) => `<span style="${n + 1 === 지금 ? 'outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--r-btn)' : ''}">${U.phItem(56, it.id + n)}</span>`).join('')}
    </div>
    <div class="btns">
      ${U.btn('－', { cls: 'btn-ghost btn-sm', attr: ' data-toast="100%로 줄였어요"' })}
      ${U.btn('150%', { cls: 'btn-line btn-sm', attr: ' data-toast="지금 배율은 150%예요"' })}
      ${U.btn('＋', { cls: 'btn-ghost btn-sm', attr: ' data-toast="200%로 키웠어요"' })}
    </div>
  </div>

  <div class="mt-block">${U.banner('quiet', '⌨', `← → 로 사진을 넘기고, <b>ESC</b> 를 누르면 닫힙니다.
    확대한 채로 끌면 사진 안을 돌아볼 수 있어요.`)}</div>

  <div class="mt-block">${U.card('사진을 볼 때 이런 것을 살펴보세요', `<ul class="dots">
    <li>흠집이 있는 곳을 따로 찍은 사진이 있는지</li>
    <li>박스·구성품이 설명과 같은지</li>
    <li>다른 곳에서 퍼온 사진처럼 보이지는 않는지 — 이상하면 ${U.btn('신고하기', { href: 'CH0401', cls: 'btn-quiet btn-xs' })}</li>
  </ul>`)}</div>
`, `
  ${U.actPanel('지금 보는 사진', U.kv([
    ['사진', `${지금} / ${it.photos}`],
    ['배율', '150%'],
    ['올린 날', ago(it.min)],
  ]), `
    ${U.btn('매물 상세로 돌아가기', { href: 'SE0401', cls: 'btn-pri btn-lg' })}
    ${U.btn('채팅으로 물어보기', { href: 'CH0201', cls: 'btn-ghost' })}`)}
  ${판매자패널(u)}
`)}`;
  return { body, o: { state: '사진을 크게 펼친 상태' } };
}

function SE0403(ctx) {
  const it = itemBy('i1');
  const u = userBy(it.by);
  const 적은값 = 270000;
  const 모자란 = it.offerMin - 적은값;
  const body = `
${U.pageHd('가격 제안 보내기', `${U.esc(it.t)}`,
    `<div class="btns">${U.btn('매물 상세로', { href: 'SE0401', cls: 'btn-ghost' })}${U.btn('채팅으로 가기', { href: 'CH0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['파는 값', U.num(it.price), { unit: '원', d: '판매자가 적어 둔 값' }],
    ['판매자가 정한 최저', U.num(it.offerMin), { unit: '원', tone: 'k-warn', d: '이보다 낮으면 못 보내요' }],
    ['내가 적은 값', U.num(적은값), { unit: '원', tone: 'k-danger', d: `최저보다 ${U.won(모자란)} 적어요` }],
    ['보낼 수 있는 값', U.num(it.offerMin), { unit: '원부터', tone: 'k-ok', d: `${U.won(it.offerMin)} ~ ${U.won(it.price)}` }],
  ])}

${U.detailSplit(`
  ${U.card('제안 금액', `
    <div class="field">
      <label class="lb">얼마에 사고 싶으세요<span class="req">*</span></label>
      <input class="input err" type="text" value="${U.num(적은값)}" aria-label="제안 금액">
      <p class="help err">판매자가 정한 최저 금액(${U.won(it.offerMin)})보다 <b>${U.won(모자란)}</b> 적어요. 이대로는 보낼 수 없습니다.</p>
    </div>
    <div class="row-c wrap-row mb4">
      ${[it.offerMin, 300000, it.price].map((v) => `<button class="tchip" type="button" data-toast="${U.won(v)}(으)로 적었어요">${U.won(v)}</button>`).join('')}
    </div>
    <div class="field">
      <label class="lb">판매자에게 한마디 (안 적어도 돼요)</label>
      <textarea class="input" placeholder="예) 오늘 저녁에 바로 가지러 갈 수 있어요">오늘 저녁에 역삼역에서 바로 받을 수 있어요.</textarea>
    </div>
    ${U.btn('이 금액으로 보내기', { cls: 'btn-pri btn-block btn-lg', off: true })}
    <p class="t-sub mt2 center">금액이 최저보다 낮아 보낼 수 없어요.</p>`)}

  <div class="mt-block">${U.card(`최저 금액 이상으로 적었을 때`, `
    <div class="field">
      <label class="lb">얼마에 사고 싶으세요<span class="req">*</span></label>
      <input class="input" type="text" value="${U.num(it.offerMin)}" aria-label="제안 금액 (알맞게 적은 예)">
      <p class="help">판매자가 정한 최저 금액과 같아요. 바로 보낼 수 있습니다.</p>
    </div>
    ${U.btn(`${U.won(it.offerMin)}으로 제안 보내기`, { href: 'CH0201', cls: 'btn-pri btn-block btn-lg' })}
    <p class="t-sub mt2 center">보내면 판매자와의 채팅방이 열리고, 제안이 대화에 남습니다.</p>`, { cls: 'card acc' })}</div>

  <div class="mt-block">${U.dashTable(
    [{ t: '적은 금액', w: '160px' }, { t: '보낼 수 있나', w: '140px' }, { t: '이렇게 됩니다' }],
    [
      [`<b>${U.won(적은값)}</b>`, U.badge('못 보냄', 'b-dan'), '최저 금액보다 낮아 경고가 뜹니다'],
      [`<b>${U.won(it.offerMin)}</b>`, U.badge('보낼 수 있음', 'b-ok'), '채팅방이 열리고 제안이 대화에 남습니다'],
      [`<b>${U.won(it.price)}</b>`, U.badge('보낼 수 있음', 'b-ok'), '값을 그대로 받아들이는 것이라 바로 약속을 잡습니다'],
    ],
  )}</div>

  ${U.banner('quiet', '💬', `제안은 <b>매물당 하루 3번</b>까지 보낼 수 있어요. 판매자가 거절해도 채팅은 그대로 남습니다.`)}
`, `
  ${U.actPanel('제안 요약', U.kv([
    ['물건', U.esc(it.t)],
    ['파는 값', U.won(it.price)],
    ['최저 제안', U.won(it.offerMin)],
    ['내가 적은 값', `<b style="color:var(--danger)">${U.won(적은값)}</b>`],
  ]), `
    ${U.btn('이 금액으로 보내기', { cls: 'btn-pri btn-lg', off: true })}
    ${U.btn(`${U.won(it.offerMin)}으로 보내기`, { href: 'CH0201', cls: 'btn-acc' })}
    ${U.btn('그냥 채팅만 할게요', { href: 'CH0201', cls: 'btn-ghost' })}
    ${U.btn('매물로 돌아가기', { href: 'SE0401', cls: 'btn-quiet' })}`, { state: it.st })}
  ${판매자패널(u)}
`)}`;
  return { body, o: { state: '최저 금액보다 낮게 적어 경고가 뜬 상태' } };
}

function SE0404(ctx) {
  const it = itemBy('i8');
  const u = userBy(it.by);
  const 비슷 = ITEMS.filter((x) => x.cat === it.cat && x.id !== it.id && x.st !== '거래완료');
  const body = `
${U.pageHd('매물 상세', '이미 거래가 끝난 매물이에요',
    `<div class="btns">${U.btn('비슷한 매물 보기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['판 값', U.num(it.price), { unit: '원', tone: 'k-mut', d: '거래가 끝난 값이에요' }],
    ['상태', '거래완료', { tone: 'k-danger', d: `${ago(it.min)}에 올라온 글` }],
    ['조회', U.num(it.view), { unit: '회', tone: 'k-mut', d: `찜 ${it.wish} · 채팅 ${it.chat}` }],
    ['비슷한 매물', String(비슷.length), { unit: '건', tone: 'k-acc', d: '아직 살 수 있는 물건', href: 'SE0201' }],
  ])}

${U.detailSplit(`
  ${U.banner('quiet', '🔒', `<b>이 매물은 거래가 끝났어요</b>
    <div class="t-sub mt1">채팅과 안전결제는 더 이상 열리지 않습니다. 아래에서 비슷한 매물을 골라 보세요.</div>`,
    { right: U.btn('비슷한 매물', { href: 'SE0201', cls: 'btn-ghost btn-sm' }) })}
  <div class="mt-block">${상세본문(it)}</div>
`, `
  ${U.actPanel('거래가 끝난 매물', U.kv([
    ['판 값', `<s>${U.won(it.price)}</s>`],
    ['거래 방식', U.wayBadges(it.ways)],
    ['끝난 때', ago(it.min)],
  ]), `
    ${U.btn('채팅하기', { cls: 'btn-pri btn-lg', off: true })}
    ${U.btn('안전결제로 사기', { cls: 'btn-acc', off: true })}
    <p class="t-sub center" style="margin:6px 0 0">거래가 끝나 두 버튼은 열리지 않아요.</p>
    ${U.btn('비슷한 매물 보기', { href: 'SE0201', cls: 'btn-ghost' })}
    ${U.btn('🔔 이런 물건 알림 받기', { href: 'MY0601', cls: 'btn-line' })}`, { state: it.st })}

  ${판매자패널(u)}

  ${U.actPanel('이 판매자에게 사고 싶다면', `<p class="t-sub">판매자의 다른 매물을 보거나, 관심 키워드를 걸어 두면 새 글이 올라올 때 알려드려요.</p>`,
    U.btn('판매자의 다른 매물', { href: 'SE0201', cls: 'btn-ghost' }))}
`)}`;
  return { body, o: { state: '거래가 끝난 매물을 열었을 때' } };
}

function SE0405(ctx) {
  const it = itemBy('i14');
  const body = `
${U.pageHd('내 매물 상세', '내가 올린 글이라 파는 쪽 버튼이 보여요',
    `<div class="btns">${U.btn('내 판매글', { href: 'SL0501', cls: 'btn-ghost' })}${U.btn('끌올하기', { href: 'BS0101', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['조회', U.num(it.view), { unit: '회', d: `올린 지 ${ago(it.min)}` }],
    ['찜', String(it.wish), { unit: '명', tone: 'k-acc', d: '담아 둔 이웃', href: 'MY0301' }],
    ['받은 채팅', String(it.chat), { unit: '건', tone: 'k-ok', d: '답을 기다리는 사람', href: 'CH0101' }],
    ['무료 끌올까지', '7', { unit: '시간', tone: 'k-warn', d: `${BOOST_FREE_LEFT} 남았어요`, href: 'BS0101' }],
  ])}

${U.detailSplit(`
  ${U.banner('info', '✍', `<b>내가 올린 글이에요</b>
    <div class="t-sub mt1">사는 쪽 버튼(채팅하기·안전결제) 대신 <b>수정·끌올·상태 바꾸기</b>가 보입니다.</div>`,
    { right: U.btn('내 판매글 전체', { href: 'SL0501', cls: 'btn-ghost btn-sm' }) })}
  <div class="mt-block">${상세본문(it, { 내글: true })}</div>
`, `
  ${U.actPanel('내 글 관리', U.kv([
    ['상태', U.stBadge(it.st)],
    ['파는 값', `<b>${U.won(it.price)}</b>`],
    ['올린 날', ago(it.min)],
    ['무료 끌올', `${BOOST_FREE_LEFT} 뒤`],
  ]), `
    ${U.btn('글 수정하기', { href: 'SL0101', cls: 'btn-pri btn-lg' })}
    ${U.btn('끌올하기', { href: 'BS0101', cls: 'btn-acc' })}
    ${U.btn('상태 바꾸기 (예약중·거래완료)', { href: 'SL0502', cls: 'btn-ghost' })}
    ${U.btn('사진 다시 올리기', { href: 'SL0201', cls: 'btn-ghost' })}
    ${U.btn('글 지우기', { cls: 'btn-quiet', attr: ' data-toast="정말 지울까요? 지운 글은 되돌릴 수 없어요" data-toast-act="지우기"' })}`,
    { state: it.st })}

  ${U.actPanel('받은 관심', U.kv([
    ['조회', `${U.num(it.view)}회`],
    ['찜', `${it.wish}명`],
    ['채팅', `${it.chat}건`],
  ]), U.btn('채팅 보러 가기', { href: 'CH0101', cls: 'btn-ghost' }))}

  ${U.actPanel('안 팔릴 때', `<p class="t-sub">값을 조금 내리거나 끌올하면 다시 위로 올라갑니다.
    시세는 「얼마에 팔까」에서 볼 수 있어요.</p>`,
    U.btn('시세 보기', { href: 'SL0301', cls: 'btn-ghost' }))}
`)}`;
  return { body, o: { state: '내가 올린 글을 열었을 때' } };
}

/* ══ SE-05 결과 없음 ═══════════════════════════════════════════════ */

/** 걸린 조건 목록 — 「이것만 풀면 몇 개」까지 한곳에서 낸다 */
const 조건풀기 = (목록 = SE_CONDS) => `<div class="stack-sm">
  ${목록.map((c) => `<div class="cond-row">
    <span class="grow"><b>${c.k}</b></span>
    <span class="t-sub">이것만 풀면 <b>${c.hit}개</b></span>
    ${U.btn('이 조건 풀기', { cls: 'btn-ghost btn-sm', attr: ` data-go="${U.link('SE0201')}"` })}
  </div>`).join('')}
</div>`;

/** 동네 넓히기 표 — 범위마다 이 조건으로 몇 개가 잡히나 */
const 넓히기표 = () => U.dashTable(
  [{ t: '범위' }, { t: '포함 동네', w: '40%' }, { t: '잡히는 매물', w: '120px' }, { t: '', w: '120px' }],
  TOWNS.ranges.map((r, i) => ({
    cls: i === 0 ? 'over' : '',
    cells: [
      `<b>${r.k}</b>${i === 0 ? ' ' + U.badge('지금 이 범위', 'b-mut') : ''}`,
      `<span class="t-sub">${r.towns.join(' · ')}</span>`,
      `<b${SE_RANGE_HITS[i] ? ' style="color:var(--pri-text)"' : ''}>${SE_RANGE_HITS[i]}개</b>`,
      i === 0 ? '<span class="t-sub">지금 범위</span>'
        : U.btn('이 범위로 넓히기', { cls: 'btn-pri btn-xs', attr: ` data-go="${U.link('SE0201')}"` }),
    ],
  })),
);

function SE0501(ctx) {
  const 최대 = Math.max(...SE_CONDS.map((c) => c.hit));
  const body = `
${U.pageHd('결과 없음', '걸어 둔 조건에 맞는 매물이 없어요',
    `<div class="btns">${U.btn('홈으로', { href: 'HO0101', cls: 'btn-ghost' })}${U.btn('조건 다시 잡기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['조건에 맞는 매물', '0', { unit: '건', tone: 'k-danger', d: '지금 걸린 조건으로는' }],
    ['걸린 조건', String(SE_CONDS.length), { unit: '개', tone: 'k-warn', d: '하나씩 풀어 볼 수 있어요' }],
    ['하나만 풀면 최대', String(최대), { unit: '건', tone: 'k-acc', d: '카테고리 조건을 풀었을 때', href: 'SE0502' }],
    ['동네를 넓히면', String(SE_RANGE_HITS[2]), { unit: '건', tone: 'k-ok', d: '조금 먼 동네까지 봤을 때', href: 'SE0503' }],
  ])}

${U.detailSplit(`
  ${U.empty('🔍', `「${SE_TYPO.fixed}」 조건에 맞는 매물이 0개예요`,
    '조건을 하나씩 풀어 보시거나, 동네 범위를 넓혀 보세요. 알림을 걸어 두면 올라올 때 알려드립니다.', '')}

  ${U.sec('지금 걸려 있는 조건', 조건풀기(), {
    aside: U.btn('조건 전체 해제', { cls: 'btn-ghost btn-sm', attr: ` data-go="${U.link('SE0201')}"` }),
    desc: '푸는 순서는 상관없어요. 하나 풀 때마다 건수가 다시 계산됩니다.',
  })}

  ${U.sec('동네를 넓혀 볼까요', 넓히기표(), { more: 'SE0503', moreLabel: '넓히기 자세히' })}

  ${U.sec('이런 말은 어때요', U.chips(SE_NEAR_WORDS, -1, { extra: ` data-go="${U.link('SE0201')}"` }),
    { desc: '비슷한 말로 찾으면 다른 물건이 잡힐 수 있어요.' })}

  ${U.banner('info', '🔔', `<b>올라오면 알려드릴까요?</b>
    <div class="t-sub mt1">「${SE_TYPO.fixed} · 30만원 이하 · 내 동네」 조건으로 새 매물이 올라오면 바로 알려드려요.</div>`,
    { right: U.btn('알림 설정하기', { href: 'MY0601', cls: 'btn-pri btn-sm' }) })}

  ${U.sec('그래도 없으면 인기 매물부터', 매물표(기본차례().filter((x) => x.st !== '거래완료').slice(0, 5)), { more: 'SE0201' })}
`, `
  ${U.actPanel('지금 조건', U.kv([
    ['검색어', SE_TYPO.fixed],
    ['걸린 조건', `${SE_CONDS.length}개`],
    ['동네 범위', TOWNS.ranges[0].k],
    ['잡히는 매물', '<b style="color:var(--danger)">0개</b>'],
  ]), `
    ${U.btn('조건 다시 잡기', { href: 'SE0201', cls: 'btn-pri btn-lg' })}
    ${U.btn('조건 하나씩 풀기', { href: 'SE0502', cls: 'btn-ghost' })}
    ${U.btn('동네 넓히기', { href: 'SE0503', cls: 'btn-ghost' })}
    ${U.btn('🔔 알림 설정하기', { href: 'MY0601', cls: 'btn-line' })}
    ${U.btn('홈으로', { href: 'HO0101', cls: 'btn-quiet' })}`)}
`)}`;
  return { body, o: {} };
}

function SE0502(ctx) {
  const 최대 = SE_CONDS.reduce((a, c) => (c.hit > a.hit ? c : a), SE_CONDS[0]);
  const body = `
${U.pageHd('조건 하나씩 풀기', '어떤 조건을 풀면 몇 개가 잡히는지 미리 세어 두었어요',
    `<div class="btns">${U.btn('결과 없음으로', { href: 'SE0501', cls: 'btn-ghost' })}${U.btn('매물 목록으로', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['지금 잡히는 매물', '0', { unit: '건', tone: 'k-danger', d: `조건 ${SE_CONDS.length}개를 모두 걸었을 때` }],
    ['가장 많이 늘어나는 조건', String(최대.hit), { unit: '건', tone: 'k-acc', d: `${최대.k}을 풀었을 때` }],
    ['두 개를 풀면', String(SE_CONDS[1].hit + SE_CONDS[2].hit), { unit: '건', tone: 'k-ok', d: '카테고리와 값 조건을 함께 풀었을 때' }],
    ['모두 풀면', U.num(TOWNS.ranges[0].n), { unit: '건', tone: 'k-mut', d: '내 동네 전체 매물', href: 'SE0201' }],
  ])}

${U.detailSplit(`
  ${U.sec('칩마다 풀기 버튼이 있어요', `
    ${U.chips(SE_CONDS.map((c) => c.k), SE_CONDS.map((_, i) => i))}
    <p class="t-sub mt3">칩의 ✕ 를 누르면 그 조건만 빠집니다. 아래 표에서 풀었을 때 잡히는 건수를 미리 볼 수 있어요.</p>`)}

  ${U.sec('이것만 풀면 몇 개', U.dashTable(
    [{ t: '걸린 조건' }, { t: '풀면 잡히는 매물', w: '150px' }, { t: '지금과 견주면', w: '140px' }, { t: '', w: '120px' }],
    SE_CONDS.map((c) => [
      `<b>${c.k}</b>`,
      `<b style="color:var(--pri-text)">${c.hit}개</b>`,
      `<span class="t-sub">0개 → ${c.hit}개</span>`,
      U.btn('이 조건 풀기', { cls: 'btn-ghost btn-xs', attr: ` data-go="${U.link('SE0201')}"` }),
    ]),
  ), { desc: '푸는 순간 매물 목록 화면으로 되돌아가고 결과가 다시 계산됩니다.' })}

  ${U.banner('info', '↩', `<b>풀면 어디로 가나요</b>
    <div class="t-sub mt1">조건을 풀면 <b>매물 목록</b> 화면으로 되돌아가며, 왼쪽 필터에서 그 조건의 체크가 지워진 채로 결과가 다시 셈해집니다.</div>`,
    { right: U.btn('매물 목록 보기', { href: 'SE0202', cls: 'btn-ghost btn-sm' }) })}

  ${U.sec('한 번에 다 풀고 싶다면', U.card('', `
    <p>조건을 전부 풀면 내 동네 매물 <b>${U.num(TOWNS.ranges[0].n)}개</b>가 모두 보입니다.</p>
    <div class="btns mt3">${U.btn('조건 전체 해제하고 목록 보기', { href: 'SE0201', cls: 'btn-pri' })}${U.btn('동네부터 넓혀 볼게요', { href: 'SE0503', cls: 'btn-ghost' })}</div>`))}
`, `
  ${U.actPanel('풀기 전후', U.kv([
    ['지금', '<b style="color:var(--danger)">0개</b>'],
    [`${SE_CONDS[1].k} 풀면`, `<b>${SE_CONDS[1].hit}개</b>`],
    [`${SE_CONDS[3].k} 풀면`, `<b>${SE_CONDS[3].hit}개</b>`],
    ['모두 풀면', `<b>${U.num(TOWNS.ranges[0].n)}개</b>`],
  ]), `
    ${U.btn('가장 많이 늘어나는 조건 풀기', { href: 'SE0201', cls: 'btn-pri btn-lg' })}
    ${U.btn('동네 넓히기', { href: 'SE0503', cls: 'btn-ghost' })}
    ${U.btn('🔔 알림 걸기', { href: 'SE0504', cls: 'btn-line' })}
    ${U.btn('결과 없음으로', { href: 'SE0501', cls: 'btn-quiet' })}`)}
`)}`;
  return { body, o: { state: '조건을 하나씩 푸는 상태' } };
}

function SE0503(ctx) {
  const body = `
${U.pageHd('동네 넓히기 제안', '같은 조건으로 범위만 넓혔을 때 몇 개가 잡히는지 미리 세어 두었어요',
    `<div class="btns">${U.btn('결과 없음으로', { href: 'SE0501', cls: 'btn-ghost' })}${U.btn('한 번에 넓히기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['내 동네만', String(SE_RANGE_HITS[0]), { unit: '건', tone: 'k-mut', d: TOWNS.ranges[0].d }],
    ['가까운 동네까지', String(SE_RANGE_HITS[1]), { unit: '건', tone: 'k-acc', d: TOWNS.ranges[1].d }],
    ['조금 먼 동네까지', String(SE_RANGE_HITS[2]), { unit: '건', tone: 'k-ok', d: TOWNS.ranges[2].d }],
    ['걸린 조건', String(SE_CONDS.length), { unit: '개', tone: 'k-warn', d: '조건은 그대로 두고 범위만 넓혀요', href: 'SE0502' }],
  ])}

${U.detailSplit(`
  ${U.sec('범위마다 잡히는 매물', 넓히기표(), { desc: '조건은 그대로 두고 동네 범위만 넓힌 결과입니다.' })}

  ${U.sec('지도로 보면', 동네지도(1) + `<p class="t-sub mt3">원을 한 단계 키우면 논현동·삼성동·대치동이 함께 들어옵니다.</p>`)}

  ${U.sec('범위 손잡이', U.card('', 범위슬라이더(1) + `
    <div class="mt4"><div class="t-sub mb2">넓혔을 때 들어오는 동네</div>${U.chips(TOWNS.ranges[1].towns)}</div>
    <div class="btns mt4">${U.btn('가까운 동네로 넓히고 결과 보기', { href: 'SE0201', cls: 'btn-pri' })}${U.btn('내 동네 설정에서 바꾸기', { href: 'SE0101', cls: 'btn-ghost' })}</div>`))}

  ${U.banner('warn', '🚗', `<b>넓히면 거리가 멀어져요</b>
    <div class="t-sub mt1">조금 먼 동네까지 넓히면 직거래로 오가는 데 시간이 걸립니다.
      택배나 안전결제가 되는 매물인지 함께 보세요.</div>`,
    { right: U.btn('안전결제 안내', { href: 'PA0101', cls: 'btn-ghost btn-sm' }) })}
`, `
  ${U.actPanel('한 번에 적용', U.kv([
    ['지금 범위', TOWNS.ranges[0].k],
    ['넓힐 범위', TOWNS.ranges[1].k],
    ['잡히는 매물', `${SE_RANGE_HITS[0]}개 → <b style="color:var(--pri-text)">${SE_RANGE_HITS[1]}개</b>`],
    ['조건', `${SE_CONDS.length}개 그대로`],
  ]), `
    ${U.btn('가까운 동네까지 넓히기', { href: 'SE0201', cls: 'btn-pri btn-lg' })}
    ${U.btn(`조금 먼 동네까지 넓히기 (${SE_RANGE_HITS[2]}개)`, { href: 'SE0201', cls: 'btn-acc' })}
    ${U.btn('조건을 대신 풀어 볼게요', { href: 'SE0502', cls: 'btn-ghost' })}
    ${U.btn('🔔 알림 걸기', { href: 'SE0504', cls: 'btn-line' })}`)}
`)}`;
  return { body, o: { state: '동네를 넓혔을 때를 미리 셈한 상태' } };
}

function SE0504(ctx) {
  const body = `
${U.pageHd('이 조건으로 알림 걸기', '새 매물이 올라오면 바로 알려드릴게요',
    `<div class="btns">${U.btn('결과 없음으로', { href: 'SE0501', cls: 'btn-ghost' })}${U.btn('알림 설정 화면', { href: 'MY0601', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['걸어 둔 알림 조건', '1', { unit: '개', tone: 'k-acc', d: '지금 켠 조건이에요', href: 'MY0601' }],
    ['이 조건 지금 매물', '0', { unit: '건', tone: 'k-mut', d: '올라오면 알려드려요' }],
    ['지난 7일 올라온 비슷한 글', String(SE_RANGE_HITS[1]), { unit: '건', tone: 'k-ok', d: '이 정도 속도로 올라와요' }],
    ['알림 받는 시간', '09–21', { unit: '시', tone: 'k-warn', d: '밤에는 보내지 않아요', href: 'MY0601' }],
  ])}

${U.detailSplit(`
  ${U.banner('ok', '🔔', `<b>올라오면 알려드릴게요</b>
    <div class="t-sub mt1">「${SE_TYPO.fixed} · 30만원 이하 · ${TOWNS.ranges[0].k}」 조건으로 새 매물이 올라오면 바로 알림을 보냅니다.</div>`,
    { right: U.badge('켜짐', 'b-ok') })}

  <div class="mt-block">${U.card('알림 조건', `
    <div class="toggle-row">
      <span><b>이 조건으로 새 매물 알림</b>
        <div class="t-sub">켜면 조건에 맞는 글이 올라올 때마다 알려드려요</div></span>
      <button class="toggle on" type="button" data-toast="알림을 껐어요 · 다시 켜면 그대로 이어집니다" aria-label="새 매물 알림"></button>
    </div>
    <div class="mt4">${U.kv([
    ['검색어', SE_TYPO.fixed],
    ['값', '30만원 이하'],
    ['동네 범위', `${TOWNS.ranges[0].k} <a class="link" href="${U.link('SE0503')}">넓히기</a>`],
    ['카테고리', '생활가전'],
    ['거래 방식', U.wayBadges(['직거래', '안전결제'])],
  ])}</div>
    <p class="t-sub mt3">조건을 바꾸려면 <a class="link" href="${U.link('SE0201')}">매물 목록</a>에서 다시 걸고 저장하세요.</p>`)}</div>

  <div class="mt-block">${U.card('어떻게 알려드리나요', U.dashTable(
    [{ t: '알림 방법', w: '160px' }, { t: '지금 설정', w: '120px' }, { t: '이렇게 옵니다' }],
    [
      ['<b>앱 알림</b>', U.badge('켜짐', 'b-ok'), '「무선청소기 새 매물이 올라왔어요 · 역삼동 28만원」'],
      ['<b>알림함</b>', U.badge('켜짐', 'b-ok'), '앱 알림을 못 봐도 알림함에 쌓여 있어요'],
      ['<b>문자</b>', U.badge('꺼짐', 'b-mut'), '중요한 거래 알림에만 씁니다'],
    ],
  ), { bdCls: '' })}</div>

  ${U.banner('quiet', '🌙', `밤 9시부터 아침 9시 사이에는 보내지 않고 모아 두었다가 아침에 한 번에 알려드려요.
    이 시간은 알림 설정에서 바꿀 수 있어요.`,
    { right: U.btn('알림 설정', { href: 'MY0601', cls: 'btn-ghost btn-sm' }) })}
`, `
  ${U.actPanel('걸어 둔 알림', U.kv([
    ['조건', `${SE_TYPO.fixed} · 30만원 이하`],
    ['동네', TOWNS.ranges[0].k],
    ['상태', U.badge('켜짐', 'b-ok')],
  ]), `
    ${U.btn('알림 설정 화면으로', { href: 'MY0601', cls: 'btn-pri btn-lg' })}
    ${U.btn('동네를 넓혀서 걸기', { href: 'SE0503', cls: 'btn-ghost' })}
    ${U.btn('알림 끄기', { cls: 'btn-quiet', attr: ' data-toast="이 조건 알림을 껐어요" data-toast-act="되돌리기"' })}`,
    { state: '진행중' })}
  ${U.actPanel('기다리는 동안', `<p class="t-sub">비슷한 물건을 먼저 둘러보세요.</p>`,
    U.btn('인기 매물 보기', { href: 'SE0201', cls: 'btn-ghost' })
    + U.btn('홈으로', { href: 'HO0101', cls: 'btn-quiet' }))}
`)}`;
  return { body, o: { state: '이 조건으로 알림을 켠 상태' } };
}

export const PAGES = {
  SE0101, SE0102, SE0103, SE0104, SE0105,
  SE0201, SE0202, SE0203, SE0204, SE0205,
  SE0301, SE0302, SE0303, SE0304, SE0305,
  SE0401, SE0402, SE0403, SE0404, SE0405,
  SE0501, SE0502, SE0503, SE0504,
};
