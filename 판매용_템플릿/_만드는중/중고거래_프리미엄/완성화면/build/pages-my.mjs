/* 마이페이지 (MY) — 30화면.
   내 프로필·매너 점수 / 구매 내역 / 찜한 물건 / 후기 쓰기 / 받은 후기 / 관심 키워드·알림

   ⚠ 레이아웃 B «대시보드형» —
     · 화면 위쪽은 «지표 카드 4개»(kpis). 히어로를 두지 않는다.
     · 목록은 표(dashTable). 머리글 고정 · 행 높이 일정 · 상태는 stBadge.
     · 상세·입력 화면은 좌 본문 + 우 액션 패널(detailSplit). 상태를 바꾸는 단추는 «전부» 오른쪽.
     스펙팩 prompt 의 「가로 행」·「상단 탭」은 손님이 AI 에게 줄 글이고,
     이 완성화면의 뼈대를 정하는 것은 팩에 함께 나가는 레이아웃 프리셋이다.
   ⚠ 링크는 짧은 이름(SE-04)이나 스펙팩 pageId(MY0102)로 적고 link() 로만 옮긴다.
   ⚠ 후기는 «양쪽»이 쓴다. 산 사람도 평가받는 것이 이 장터가 쇼핑몰과 다른 점이라,
     MY0401 은 내가 산 쪽인지 판 쪽인지에 따라 칩 목록이 통째로 바뀐다. */
import * as U from './ui.mjs';
import {
  SITE, USERS, userBy, ITEMS, itemBy, ago, ESCROW_STEPS, CATS, TOWNS,
  REVIEWS, chipCounts, MANNER_HISTORY, GOOD_SELLER, GOOD_BUYER, BAD_SELLER, BAD_BUYER,
  MY_ME, MY_MANNER_BASE, MY_MANNER_UP, MY_MANNER_DOWN, MY_MANNER_UPSUM, MY_MANNER_DOWNSUM,
  MY_MANNER_SUM, MY_MANNER_NOTES, MY_BUYS, MY_BUY_N, MY_BUY_NORV, MY_TODO_REVIEWS,
  MY_WRITTEN_REVIEWS, MY_WISH, MY_WISH_DOWN, MY_WISH_OLD, MY_PRICE_BANDS,
  MY_KEYWORD_MAX, MY_KEYWORDS, MY_SAVED_SEARCH, MY_NOTI_KINDS, MY_NOTI_CHANNELS,
  MY_NOTI_PERDAY, MY_NOTI_ON, MY_QUIET, MY_NOTI_LOG, MY_RECEIPT_NO,
} from './data.mjs';

const 나 = userBy(MY_ME);
const 항목순위 = chipCounts();
const 항목최대 = 항목순위[0][1];

/* ── 여러 화면이 나눠 쓰는 조각 ─────────────────────────────── */

/** 화면 아래에 두는 «이 화면의 세부 상태» 줄.
   3뎁스 팩이라 한 화면에 상태가 여럿이다. 눌러 보지 않으면 있는 줄도 모른다.
   ⚠ 칩에 data-go 를 달면 app.js 가 그 화면으로 데려간다(고르는 칩이 아니다). */
const 상태들 = (list) => U.sec('이 화면의 세부 상태',
  `<div class="chips">${list.map(([id, t]) => `<button class="chip" type="button" data-go="${U.link(id)}">${t}</button>`).join('')}</div>`,
  { desc: '같은 화면이 상황에 따라 어떻게 달라지는지 하나씩 볼 수 있어요.' });

/** 온도계 — 매너 점수는 36.5 에서 시작해 오르내린다. 30~50 을 눈금으로 본다. */
const 온도계 = (v) => `<div class="thermo">
  <div class="fill" style="width:${Math.round((v - 30) / 20 * 100)}%"></div>
  <span class="base" style="left:${Math.round((MY_MANNER_BASE - 30) / 20 * 100)}%" title="시작 점수 ${MY_MANNER_BASE}"></span>
</div>
<div class="row-b t-sub mt2"><span>30</span><span>${MY_MANNER_BASE}에서 시작</span><span>50</span></div>`;

/** 매너 점수 큰 카드 — 이 갈래의 주인공 */
const 점수카드 = (o = {}) => U.card('매너 점수', `
  <div class="row-c wrap-row" style="gap:24px">
    ${U.manner(나.manner, { big: true })}
    <div class="grow" style="min-width:240px">${온도계(나.manner)}</div>
  </div>
  <p class="t-sub mt3">누구나 <b>${MY_MANNER_BASE}</b>에서 시작해요. 좋은 후기는 점수를 올리고 아쉬운 후기는 내립니다.
  이 장터에서 「이 사람에게 사도 되나」를 재는 유일한 자예요.</p>`, o);

/** 후기 한 장 — 받은 후기·쓴 후기·비공개 후기가 같은 모양을 쓴다.
   ⚠ 거르개가 이 카드를 줄이려면 data-chip 에 고른 항목이 쉼표로 실려 있어야 한다. */
function 후기카드(r, o = {}) {
  const u = userBy(r.who);
  const it = itemBy(r.item);
  const 고른것 = [...(r.chips || []), ...(r.bad || [])];
  return `<div class="card" data-chip="${U.esc(고른것.join(','))}" data-side="${U.esc(r.side)}">
    <div class="card-bd">
      <div class="row-b wrap-row">
        <div class="row-c" style="gap:10px">
          ${U.phAva(38, u.id)}
          <div><b>${U.esc(u.nick)}</b> ${U.manner(u.manner)}
            <div class="t-sub">${U.stars(r.r)} · ${r.at}</div></div>
        </div>
        <div class="row-c" style="gap:8px">
          ${U.badge(o.mine ? `내가 이 사람에게 ${r.side}` : `이 사람에게 ${r.side}`, 'b-mut')}
          ${r.priv ? U.badge('🔒 나에게만 보여요', 'b-warn') : ''}
          ${o.act === false ? '' : `<button class="btn btn-quiet btn-xs" type="button" data-toast="사실과 다른 후기라면 신고해 주세요. 운영자가 확인합니다">⚑ 신고</button>`}
        </div>
      </div>
      <div class="chips mt3" data-band-pick>
        ${(r.chips || []).map((c) => U.badge(c, 'b-ok')).join('')}
        ${(r.bad || []).map((c) => U.badge(c, 'b-warn')).join('')}
      </div>
      <p class="mt3">${U.esc(r.t)}</p>
      <a class="row-c mt3" style="gap:8px" href="${U.link('SE-04')}">
        ${U.phItem(36, it.id)}<span class="t-sub">${U.esc(it.t)}</span></a>
    </div></div>`;
}

/* ── 구매 내역 표 ───────────────────────────────────────────── */
const 구매머리 = [
  { t: '거래일', w: '92px' }, { t: '물건' }, { t: '판매자', w: '136px' },
  { t: '금액', w: '120px' }, { t: '상태', w: '168px' }, { t: '할 일', w: '168px' },
];

/** 안전결제 건의 단계 표시 — «작게» 한 줄.
   ⛔ 표 안에 escrow() 네 칸을 그대로 넣으면 그 줄만 키가 커져 「행 높이 일정」이 깨진다. */
const 단계줄 = (b) => (b.way !== '안전결제' || b.st === '취소' ? ''
  : `<div class="t-sub nowrap mt1" title="안전결제 ${ESCROW_STEPS.join(' › ')}">
      ${'●'.repeat(b.step)}${'○'.repeat(4 - b.step)}
      ${b.step >= 4 ? '정산까지 끝났어요' : `${ESCROW_STEPS[b.step]} 기다리는 중`}</div>`);

function 구매행(b, o = {}) {
  const it = itemBy(b.it);
  const u = userBy(b.with);
  return {
    data: { way: b.way, st: b.st, rv: b.rv ? '씀' : '안씀', price: b.price },
    cells: [
      `<span class="t-sub nowrap">${b.at}</span>`,
      `<span class="row-c">${U.phItem(40, it.id)}<span>
        <a class="strong" href="${U.link('SE-04')}">${U.esc(it.t)}</a>
        <span class="row-c" style="gap:4px;margin-top:2px">
          ${U.badge(b.way, b.way === '안전결제' ? 'b-ok' : 'b-mut')}
          <span class="t-sub">${b.no}</span></span>
      </span></span>`,
      `<span class="row-c" style="gap:6px">${U.phAva(26, u.id)}
        <a href="${U.link('MY-01')}">${U.esc(u.nick)}</a></span>`,
      `<b class="nowrap">${U.won(b.price)}</b>${b.ship ? `<div class="t-sub nowrap">배송비 ${U.won(b.ship)}</div>` : ''}`,
      `${U.stBadge(b.st)}${단계줄(b)}`,
      `<div class="btns">${
        b.st === '거래완료'
          ? (b.rv ? U.badge('후기 씀', 'b-mut') : U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' }))
          : (b.st === '취소' ? U.badge('환불 완료', 'b-mut') : U.btn('거래 상태 보기', { href: 'PA-05', cls: 'btn-ghost btn-sm' }))
      }${o.receipt === false ? '' : U.btn('영수증', { href: 'MY0204', cls: 'btn-quiet btn-sm' })}</div>`,
    ],
  };
}

/** 거래 방식 칩 + 기간 — 표 위 한 줄.
   ⚠ 「전체」 칩에는 data-f-key 를 «주지 않는다». 아무 열쇠도 안 걸린 상태가 곧 전체다. */
const 방식칩 = (key, on = 0) => `<div class="chips">${['전체', '직거래', '안전결제'].map((w, i) =>
  `<button class="chip${i === on ? ' on' : ''}" type="button" data-filter="${key}"${i ? ` data-f-key="way" data-f-val="${w}"` : ''}>${w}</button>`).join('')}</div>`;

const 구매판 = (key, rows, o = {}) => `
  ${U.tableBar(
    `<b data-filter-count="${key}">${rows.length}</b>건 <span class="t-sub">/ 모두 <span data-filter-total="${key}">${rows.length}</span>건</span>
     <span data-filter-applied="${key}" hidden style="margin-left:8px"></span>`,
    `${방식칩(key, o.way ?? 0)}
     <select class="input" style="width:auto" data-toast="기간을 바꿔 다시 셌어요">
       <option>최근 3개월</option><option>최근 6개월</option><option>전체 기간</option></select>`)}
  ${U.dashTable(구매머리, rows.map((b) => 구매행(b, o)), { listKey: key })}
  <div data-filter-empty="${key}" hidden class="mt4">${U.empty('🔎', '고른 거래 방식에 맞는 건이 없어요',
    '칩을 다시 골라 보세요.', U.btn('전체 보기', { cls: 'btn-ghost', attr: ` data-filter-reset="${key}"` }))}</div>`;

/* ── 찜 목록 표 ─────────────────────────────────────────────── */
const 찜머리 = (o = {}) => [
  ...(o.pick === false ? [] : [{ t: '<span class="t-sub">고르기</span>', w: '62px' }]),
  { t: '물건' }, { t: '동네', w: '140px' }, { t: '값', w: '210px' },
  { t: '찜한 지', w: '96px' }, { t: '값 내림 알림', w: '110px' }, { t: '상태', w: '150px' },
];

function 찜행(w, o = {}) {
  const it = itemBy(w.it);
  const 끝남 = it.st === '거래완료';
  const 흐림 = (html) => (끝남 ? `<span style="opacity:.55">${html}</span>` : html);
  const band = MY_PRICE_BANDS.find((b) => it.price >= b.min && it.price <= b.max);
  return {
    data: { cat: it.cat, town: it.town, band: band.k, price: it.price, st: it.st, down: w.was ? '값내림' : '그대로' },
    cells: [
      ...(o.pick === false ? [] : [`<label class="check none" style="padding:0"><input type="checkbox" data-pick${o.picked ? ' checked' : ''} aria-label="${U.esc(it.t)} 고르기"></label>`]),
      흐림(`<span class="row-c">
        <span class="thumb" style="position:relative;display:inline-block">${U.phItem(40, it.id)}${끝남 ? '<span class="veil" data-t="거래완료"></span>' : ''}</span>
        <span><a class="strong" href="${U.link('SE-04')}">${U.esc(it.t)}</a>
          <span class="row-c" style="gap:4px;margin-top:2px">${U.wayBadges(it.ways)}</span></span></span>`),
      흐림(`<span class="nowrap">${U.esc(it.town)}<span class="t-sub"> · ${it.dist}km</span></span>`),
      w.was
        ? `${U.priceDown(w.was, it.price)}<div class="t-sub nowrap">${w.downAt}에 내렸어요</div>`
        : 흐림(`<b class="nowrap">${U.won(it.price)}</b>`),
      `<span class="t-sub nowrap">${w.at}</span>`,
      끝남
        ? '<span class="t-sub">—</span>'
        : `<button class="toggle${w.bell ? ' on' : ''}" type="button" role="switch" aria-checked="${w.bell}" aria-label="${U.esc(it.t)} 값 내림 알림" data-toast="${w.bell ? '값 내림 알림을 껐어요' : '값이 내려가면 알려드릴게요'}"><span class="kn"></span></button>`,
      끝남
        ? `<div class="btns">${U.stBadge('거래완료')}${U.btn('비슷한 매물', { href: 'SE-02', cls: 'btn-ghost btn-sm' })}</div>`
        : `<div class="btns">${U.stBadge(it.st)}<button class="heart on" type="button" data-wish="${it.wish}" aria-label="찜 풀기">♥<span class="n">${it.wish}</span></button></div>`,
    ],
  };
}

/* ══════════════════════════════════════════════════════════════
   MY-01  내 프로필·매너 점수
   ══════════════════════════════════════════════════════════════ */
function MY0101(ctx) {
  const 내매물 = ITEMS.filter((x) => x.by === MY_ME);
  const 판매중 = 내매물.filter((x) => x.st === '판매중');
  const 완료 = 내매물.filter((x) => x.st === '거래완료');

  const 매물표 = (list, 빈말) => (list.length
    ? U.dashTable(
      [{ t: '물건' }, { t: '값', w: '128px' }, { t: '올라온 지', w: '104px' }, { t: '관심', w: '132px' }, { t: '상태', w: '96px' }],
      list.map((it) => ({
        data: { st: it.st },
        cells: [
          `<span class="row-c">${U.phItem(40, it.id)}<a class="strong" href="${U.link('SL-05')}">${U.esc(it.t)}</a></span>`,
          `<b class="nowrap">${U.won(it.price)}</b>`,
          `<span class="t-sub nowrap">${ago(it.min)}</span>`,
          `<span class="t-sub nowrap">♡ ${it.wish} · 채팅 ${it.chat}</span>`,
          U.stBadge(it.st),
        ],
      })))
    : U.empty('📦', 빈말, '', U.btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' })));

  const 막대 = `<div class="bars">${항목순위.slice(0, 5).map(([k, n]) => `
    <a class="bar-row" href="${U.link('MY0502')}" title="이 항목을 고른 후기만 보기">
      <span class="nowrap t-sub" style="width:190px">${k}</span>
      ${U.progress(Math.round(n / 항목최대 * 100))}
      <span class="nowrap t-sub" style="width:36px;text-align:right">${n}</span></a>`).join('')}</div>`;

  const 본문 = `
${점수카드({ ft: U.btn('점수 산정 근거 펼치기', { href: 'MY0102', cls: 'btn-ghost btn-sm' }) })}

${U.sec('이웃들이 좋아한 점', `${막대}
  <p class="t-sub mt3">후기에서 이웃이 고른 항목을 많이 받은 차례로 다섯 개만 보여드려요. 막대를 누르면 그 항목을 고른 후기만 남아요.</p>`,
    { more: 'MY0501', moreLabel: '받은 후기 모두 보기' })}

<div class="mt-block">
  ${U.tabs([
    { label: '판매중 매물', cnt: 판매중.length, pane: 'pf0' },
    { label: '거래완료', cnt: 완료.length, pane: 'pf1' },
    { label: '받은 후기', cnt: REVIEWS.length, pane: 'pf2' },
  ], 0)}
  <div class="mt4">
    <div data-pane-body="pf0">${매물표(판매중, '지금 올라와 있는 판매글이 없어요')}
      <div class="mt4">${U.btn('내 판매글 관리', { href: 'SL-05', cls: 'btn-ghost btn-sm' })}</div></div>
    <div data-pane-body="pf1" hidden>${매물표(완료, '거래완료된 매물이 없어요')}</div>
    <div data-pane-body="pf2" hidden><div class="stack">
      ${REVIEWS.slice(0, 3).map((r) => 후기카드(r)).join('')}
      <div class="center mt3">${U.btn('받은 후기 모두 보기', { href: 'MY0501', cls: 'btn-ghost' })}</div>
    </div></div>
  </div>
</div>`;

  const 패널 = U.actPanel('내 프로필', `
    <div class="row-c" style="gap:12px">${U.phAva(56, 'me')}
      <div><b style="font-size:17px">${U.esc(나.nick)}</b>
        <div class="t-sub mt1">${U.esc(나.town)} · ${나.since} 가입</div></div></div>
    ${U.kv([
    ['응답률', `<b>${나.resp}%</b> <span class="muted">${U.respText(나.respMin)}</span>`],
    ['재거래 희망', `<b>${나.again}%</b>`],
    ['거래 횟수', `판 것 <b>${나.sold}</b>회 · 산 것 <b>${나.bought}</b>회`],
  ], { cls: 'mt3' })}`,
  U.btn('프로필 수정', { href: 'MY0103', cls: 'btn-pri' })
    + U.btn('남이 볼 때 화면', { href: 'MY0105', cls: 'btn-ghost' }))

    + U.actPanel('신뢰 배지', `
      <div class="row wrap-row" style="gap:8px">${나.tags.map((t) => U.verify(t + ' 완료')).join('')}</div>
      <p class="t-sub mt3">계좌 인증을 더 하면 안전결제 정산을 받을 수 있어요.</p>`,
    U.btn('인증 배지 자세히', { href: 'MY0104', cls: 'btn-ghost' }))

    + U.actPanel('바로 가기', '',
      U.btn('받은 후기 보기', { href: 'MY0501', cls: 'btn-ghost' })
      + U.btn('내 판매글 관리', { href: 'SL0501', cls: 'btn-ghost' })
      + U.btn('찜한 물건 보기', { href: 'MY0301', cls: 'btn-ghost' })
      + U.btn('알림 설정', { href: 'MY0601', cls: 'btn-ghost' }));

  const body = `
${U.pageHd('내 프로필·매너 점수', `${U.esc(나.nick)} · ${U.esc(나.town)} · ${나.since} 가입`,
    `<div class="btns">${U.btn('남이 볼 때 화면', { href: 'MY0105', cls: 'btn-ghost' })}${U.btn('프로필 수정', { href: 'MY0103', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['판 것', U.num(나.sold), { unit: '회', d: '지금까지 넘긴 물건', href: 'SL-05' }],
    ['산 것', U.num(나.bought), { unit: '회', tone: 'k-acc', d: '지금까지 받은 물건', href: 'MY0201' }],
    ['응답률', `${나.resp}%`, { tone: 'k-ok', d: U.respText(나.respMin) }],
    ['재거래 희망', `${나.again}%`, { tone: 'k-warn', d: '또 거래하고 싶대요', href: 'MY0501' }],
  ])}

${U.detailSplit(본문, 패널)}

${상태들([['MY0102', '매너 점수 근거 펼치기'], ['MY0103', '프로필 수정'], ['MY0104', '인증 배지'], ['MY0105', '남이 볼 때 화면']])}`;

  return { body, o: {} };
}

/* ---- MY0102 매너 점수 근거 펼치기 ---- */
function MY0102(ctx) {
  const 줄 = (x, 오름) => ({
    cells: [
      `<b>${x.k}</b><div class="t-sub">${x.d}</div>`,
      `<span class="nowrap">${x.n == null ? '—' : x.n + '건'}</span>`,
      x.v === 0 ? '<span class="t-sub">—</span>'
        : `<b class="nowrap" style="color:var(--${오름 ? 'success' : 'danger'})">${x.v > 0 ? '+' : ''}${x.v.toFixed(1)}</b>`,
    ],
  });
  const 머리 = [{ t: '까닭', w: '52%' }, { t: '건수', w: '96px' }, { t: '점수', w: '110px' }];

  const body = `
${U.pageHd('매너 점수 근거', '점수가 어떤 후기 항목에서 얼마씩 왔는지 펼쳤어요',
    `<div class="btns">${U.btn('접기', { href: 'MY0101', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['지금 점수', MY_MANNER_SUM.toFixed(1), { unit: '점', d: '이웃들이 만들어 준 점수' }],
    ['올린 것', `+${MY_MANNER_UPSUM.toFixed(1)}`, { tone: 'k-ok', d: `${MY_MANNER_UP.length}가지` }],
    ['내린 것', MY_MANNER_DOWNSUM.toFixed(1), { tone: 'k-danger', d: `${MY_MANNER_DOWN.length}가지` }],
    ['시작 점수', MY_MANNER_BASE.toFixed(1), { tone: 'k-mut', d: '누구나 여기서 시작해요' }],
  ])}

${U.banner('info', '🌡', `<b>점수는 한 번에 크게 바뀌지 않아요.</b>
  후기 한 건이 올리거나 내리는 폭은 작습니다. 쌓인 것이 점수가 돼요.`)}

<div class="mt-block">${U.sec('점수를 올린 것', U.dashTable(머리, MY_MANNER_UP.map((x) => 줄(x, true)),
    { foot: ['올린 것 모두', '', `<b style="color:var(--success)">+${MY_MANNER_UPSUM.toFixed(1)}</b>`] }))}</div>

${U.sec('점수를 내린 것', U.dashTable(머리, MY_MANNER_DOWN.map((x) => 줄(x, false)),
    { foot: ['내린 것 모두', '', `<b style="color:var(--danger)">${MY_MANNER_DOWNSUM.toFixed(1)}</b>`] }))}

${U.card('다 더하면', `${U.sumRows([
    ['시작 점수', MY_MANNER_BASE.toFixed(1)],
    ['올린 것', `+ ${MY_MANNER_UPSUM.toFixed(1)}`],
    ['내린 것', `− ${Math.abs(MY_MANNER_DOWNSUM).toFixed(1)}`],
  ], ['지금 내 매너 점수', `${MY_MANNER_SUM.toFixed(1)}점`])}
  <div class="mt4">${온도계(MY_MANNER_SUM)}</div>`,
    { ft: U.btn('접고 프로필로 돌아가기', { href: 'MY0101', cls: 'btn-ghost btn-sm' }) })}`;

  return { body, o: {} };
}

/* ---- MY0103 프로필 수정 ---- */
function MY0103(ctx) {
  const 본문 = `
${U.card('프로필 사진', `
  <div class="row-c wrap-row" style="gap:16px">
    ${U.phAva(72, 'me')}
    <div class="grow" style="min-width:220px">
      ${U.ph(['자를 사진 미리보기', 800, 800], { cls: 'ph-sq', style: 'max-width:200px' })}
      <p class="t-sub mt2">동그랗게 잘려 보여요. 네모난 사진을 올리면 가운데가 남습니다.</p>
    </div>
    <div class="btns">
      ${U.btn('사진 올리기', { cls: 'btn-ghost', attr: ' data-toast="사진을 골라 주세요"' })}
      ${U.btn('자르기', { cls: 'btn-ghost', attr: ' data-toast="끌어서 잘릴 자리를 맞춰 주세요"' })}
      ${U.btn('사진 지우기', { cls: 'btn-quiet', attr: ' data-toast="기본 사진으로 되돌렸어요" data-toast-act="되돌리기"' })}
    </div>
  </div>`)}

<div class="mt-block">${U.card('닉네임', `
  <div class="searchbar sm">
    <input type="text" value="${U.esc(나.nick)}" aria-label="닉네임">
    ${U.btn('중복 검사', { cls: 'btn-pri btn-sm', attr: ' data-toast="쓸 수 있는 닉네임이에요" data-toast-kind="ok"' })}
  </div>
  <p class="help mt2">✓ 쓸 수 있는 닉네임이에요.</p>
  ${U.banner('warn', '📅', `<b>닉네임은 30일에 한 번만 바꿀 수 있어요.</b>
    <div class="t-sub mt1">마지막으로 바꾼 날 2026년 8월 12일 · <b>9월 11일</b>부터 바꿀 수 있어요.
    이미 남긴 후기와 거래 기록에는 바뀐 닉네임으로 보입니다.</div>`, { cls: 'mt3' })}`)}</div>

<div class="mt-block">${U.card('소개', `
  <textarea class="input" rows="4" placeholder="이웃에게 한마디 — 어떤 물건을 주로 내놓는지 적어 두면 믿음이 갑니다">역삼동에서 아이 물건과 가전을 주로 내놓습니다. 약속 시간은 꼭 지켜요.</textarea>
  <p class="t-sub mt1 right">62 / 200</p>`)}</div>

<div class="mt-block">${U.card('공개 범위', `
  <div class="toggle-row"><span><b>동네를 보여줘요</b><div class="t-sub">끄면 「강남구」까지만 보여요</div></span>
    <button class="toggle on" type="button" role="switch" aria-checked="true" aria-label="동네 공개"><span class="kn"></span></button></div>
  <div class="toggle-row"><span><b>거래 횟수를 보여줘요</b><div class="t-sub">판 것·산 것 횟수</div></span>
    <button class="toggle on" type="button" role="switch" aria-checked="true" aria-label="거래 횟수 공개"><span class="kn"></span></button></div>`)}</div>`;

  const 패널 = U.actPanel('저장하기', `
    ${U.kv([['닉네임', U.esc(나.nick)], ['소개', '62자'], ['사진', '바꾸지 않음']])}
    <p class="t-sub mt3">저장하면 남에게 보이는 화면에 곧바로 반영돼요.</p>`,
  U.btn('저장', { cls: 'btn-pri btn-lg', attr: ' data-toast="프로필을 저장했어요" data-toast-kind="ok"' })
    + U.btn('취소', { href: 'MY0101', cls: 'btn-ghost' }))
    + U.actPanel('미리 보기', '<p class="t-sub">고친 프로필이 남에게 어떻게 보이는지 먼저 볼 수 있어요.</p>',
      U.btn('남이 볼 때 화면', { href: 'MY0105', cls: 'btn-ghost' }));

  const body = `
${U.pageHd('프로필 수정', '사진·닉네임·소개를 고칠 수 있어요')}

${U.kpis([
    ['매너 점수', 나.manner.toFixed(1), { unit: '점', d: '프로필을 고쳐도 점수는 그대로예요', href: 'MY0501' }],
    ['닉네임 바꾸기', '30', { unit: '일에 한 번', tone: 'k-warn', d: '마지막으로 바꾼 날 2026년 8월 12일' }],
    ['소개 글자', '62', { unit: '/ 200자', tone: 'k-acc', d: '적어 두면 이웃이 믿고 거래해요' }],
    ['한 인증', U.num(나.tags.length), { unit: '개', tone: 'k-ok', d: 나.tags.join(' · '), href: 'MY0104' }],
  ])}

${U.detailSplit(본문, 패널)}`;

  return { body, o: {} };
}

/* ---- MY0104 인증 배지 ---- */
function MY0104(ctx) {
  const 인증 = [
    { k: '본인인증', on: true, at: '2024년 3월', open: '판매글 쓰기 · 안전결제 · 채팅', go: null },
    { k: '동네인증', on: true, at: '2026년 8월', open: '내 동네 매물 보기 · 동네 배지', go: 'SE-01' },
    { k: '계좌 인증', on: false, at: null, open: '안전결제 정산 받기', go: null },
    { k: '사업자 인증', on: false, at: null, open: '사업자 배지 · 대량 판매', go: null },
  ];
  const body = `
${U.pageHd('인증 배지', '무엇을 인증했고, 인증하면 무엇이 열리는지',
    `<div class="btns">${U.btn('프로필로 돌아가기', { href: 'MY0101', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['한 인증', U.num(인증.filter((x) => x.on).length), { unit: '개', tone: 'k-ok', d: `모두 ${인증.length}개 가운데` }],
    ['안 한 인증', U.num(인증.filter((x) => !x.on).length), { unit: '개', tone: 'k-warn', d: '인증하면 더 열려요' }],
    ['매너 점수', 나.manner.toFixed(1), { unit: '점', d: '인증은 점수와 따로예요', href: 'MY0501' }],
    ['안전결제 거래', '12', { unit: '회', tone: 'k-acc', d: '돈이 오간 거래', href: 'PA-01' }],
  ])}

${U.banner('info', '🛡', `<b>인증은 이웃이 나를 믿는 근거가 됩니다.</b>
  인증하지 않아도 둘러볼 수는 있지만, <b>동네인증을 하지 않으면 판매글을 쓸 수 없어요.</b>`)}

<div class="mt-block">${U.dashTable(
    [{ t: '인증' }, { t: '상태', w: '150px' }, { t: '인증하면 열리는 것' }, { t: '', w: '150px' }],
    인증.map((x) => ({
      cells: [
        x.on ? `<b>${x.k}</b>` : `<b style="color:var(--muted)">${x.k}</b>`,
        x.on ? `${U.verify('완료')}<div class="t-sub nowrap mt1">${x.at}</div>` : U.badge('안 했어요', 'b-mut'),
        `<span class="${x.on ? '' : 't-sub'}">${x.open}</span>`,
        x.on
          ? '<span class="t-sub">—</span>'
          : (x.go
            ? U.btn('인증하러 가기', { href: x.go, cls: 'btn-pri btn-sm' })
            : U.btn('인증하기', { cls: 'btn-pri btn-sm', attr: ' data-toast="인증 창을 열었어요. 휴대폰 본인확인을 거칩니다"' })),
      ],
    })))}</div>

${U.sec('안 한 인증을 하면', U.card('', `
  <div class="stack-sm">
    <div class="cond-row"><span class="grow"><b>계좌 인증</b> — 안전결제로 판 돈을 받을 계좌를 확인합니다</span>
      ${U.btn('인증하기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="계좌 실명 확인 창을 열었어요"' })}</div>
    <div class="cond-row"><span class="grow"><b>사업자 인증</b> — 사업자라면 배지를 달고 여러 물건을 올릴 수 있어요</span>
      ${U.btn('인증하기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="사업자등록번호를 넣어 주세요"' })}</div>
  </div>`))}`;

  return { body, o: {} };
}

/* ---- MY0105 남이 볼 때 화면 ---- */
function MY0105(ctx) {
  const 가림 = [
    ['닉네임 · 매너 점수 · 동네', '보여요', true],
    ['판매중 매물 · 거래완료 수', '보여요', true],
    ['받은 후기(공개)', '보여요', true],
    ['받은 후기(비공개)', '나에게만 보여요', false],
    ['구매 내역 · 찜한 물건', '가려져요', false],
    ['전화번호 · 이메일 · 계좌', '가려져요', false],
  ];
  const 공개후기 = REVIEWS.filter((r) => !r.priv);

  const body = `
${U.pageHd('남이 볼 때 화면', '다른 이웃에게는 이렇게 보여요',
    `<div class="btns">${U.btn('내 화면으로 돌아가기', { href: 'MY0101', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['매너 점수', 나.manner.toFixed(1), { unit: '점', d: '남에게도 이 숫자가 보여요' }],
    ['판 것', U.num(나.sold), { unit: '회', tone: 'k-acc', d: '거래 횟수는 공개돼요' }],
    ['응답률', `${나.resp}%`, { tone: 'k-ok', d: U.respText(나.respMin) }],
    ['공개 후기', U.num(공개후기.length), { unit: '건', tone: 'k-mut', d: `비공개 ${REVIEWS.length - 공개후기.length}건은 안 보여요`, href: 'MY0504' }],
  ])}

${U.banner('acc', '👀', `<b>지금은 «다른 사람에게 보이는 그대로»를 보고 있어요.</b>
  내 화면에만 있는 것(구매 내역·찜한 물건·설정)은 여기에 나오지 않습니다.`,
    { right: U.btn('내 화면으로', { href: 'MY0101', cls: 'btn-ghost btn-sm' }) })}

<div class="mt-block">${U.card('', U.userCard(나, { href: 'MY0101', right: `<div class="btns">
  ${U.btn('채팅하기', { cls: 'btn-pri', attr: ' data-toast="남이 볼 때는 이 자리에 [채팅하기]가 있어요"' })}
  ${U.btn('신고', { cls: 'btn-quiet btn-sm', attr: ' data-toast="남이 볼 때는 이 자리에 [신고]가 있어요"' })}</div>` }))}</div>

${U.sec('무엇이 보이고 무엇이 가려지나', U.dashTable(
    [{ t: '항목' }, { t: '남에게', w: '180px' }, { t: '', w: '120px' }],
    가림.map(([k, v, on]) => ({
      cells: [on ? `<b>${k}</b>` : `<span class="t-sub">${k}</span>`, v,
        on ? U.badge('공개', 'b-ok') : U.badge('가려짐', 'b-mut')],
    }))))}

${U.sec('남에게 보이는 후기', `<div class="stack">${공개후기.slice(0, 3).map((r) => 후기카드(r, { act: false })).join('')}</div>
  <p class="t-sub mt3">비공개로 받은 후기 ${REVIEWS.length - 공개후기.length}건은 이 자리에 나오지 않아요.</p>`,
    { more: 'MY0504', moreLabel: '비공개 후기 보기' })}`;

  return { body, o: { state: '다른 사람에게 보이는 화면' } };
}

/* ══════════════════════════════════════════════════════════════
   MY-02  구매 내역
   ══════════════════════════════════════════════════════════════ */
function MY0201(ctx) {
  const 진행중 = MY_BUYS.filter((b) => b.st === '진행중');
  const 완료 = MY_BUYS.filter((b) => b.st === '거래완료');
  const 취소 = MY_BUYS.filter((b) => b.st === '취소');
  const 판매자 = userBy(MY_BUYS[0].with);
  const 다른매물 = ITEMS.filter((x) => x.by === 판매자.id && x.st === '판매중').slice(0, 4);
  const 추천 = ITEMS.filter((x) => x.cat === itemBy(완료[0].it).cat && x.st === '판매중').slice(0, 4);

  const body = `
${U.pageHd('구매 내역', `내가 산 물건 ${MY_BUYS.length}건`,
    `<div class="btns">${U.btn('매물 보러 가기', { href: 'SE0201', cls: 'btn-ghost' })}${U.btn('거래 진행 상태 보기', { href: 'PA0501', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['진행중', U.num(진행중.length), { unit: '건', d: '아직 끝나지 않은 거래', href: 'PA-05' }],
    ['거래완료', U.num(완료.length), { unit: '건', tone: 'k-ok', d: '물건을 받았어요' }],
    ['취소', U.num(취소.length), { unit: '건', tone: 'k-mut', d: '환불까지 끝났어요' }],
    ['후기 안 쓴 건', U.num(MY_BUY_NORV.length), { unit: '건', tone: 'k-warn', d: '내가 써야 상대 후기도 열려요', href: 'MY0203' }],
  ])}

${MY_BUY_NORV.length ? U.banner('info', '✍', `<b>아직 후기를 안 쓴 거래가 ${MY_BUY_NORV.length}건 있어요</b>
  <div class="t-sub mt1">후기는 서로 남깁니다. 내가 써야 상대가 나에게 쓴 후기도 열려요.</div>`,
    { right: U.btn('지금 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' }) }) : ''}

<div class="mt-block">
  ${U.tabs([
    { label: '진행중', cnt: MY_BUY_N('진행중'), pane: 'bu0' },
    { label: '거래완료', cnt: MY_BUY_N('거래완료'), pane: 'bu1' },
    { label: '취소', cnt: MY_BUY_N('취소'), pane: 'bu2' },
  ], 0)}
  <div class="mt4">
    <div data-pane-body="bu0">${구매판('buy0', 진행중)}</div>
    <div data-pane-body="bu1" hidden>${구매판('buy1', 완료)}</div>
    <div data-pane-body="bu2" hidden>${구매판('buy2', 취소)}</div>
  </div>
  <p class="t-sub mt4">상태와 상관없이 거래 방식으로만 좁혀 보고 싶다면
    <a href="${U.link('MY0202')}">거래 방식 필터 화면</a>에서 모든 건을 한 표로 볼 수 있어요.</p>
</div>

${U.sec(`${U.esc(판매자.nick)}님의 다른 매물`, U.carousel(다른매물.map((it) => U.itemCard(it)).join('') || '', { cls: '' }),
    { desc: '같은 판매자에게서 또 사면 약속 잡기가 수월해요.', more: 'SE-02', moreLabel: '매물 전체 보기' })}

${U.sec('비슷한 물건 다시 보기', U.carousel(추천.map((it) => U.itemCard(it, { why: '전에 산 것과 비슷해요' })).join('')),
    { desc: '전에 산 물건과 같은 분류에서 골랐어요.' })}

${U.sec('', U.empty('🛍', '아직 산 물건이 없어요', '이웃이 내놓은 물건을 둘러보세요.',
    U.btn('매물 보러 가기', { href: 'SE0201', cls: 'btn-pri' })), { desc: '구매 내역이 하나도 없을 때는 이렇게 보여요.' })}

${상태들([['MY0202', '거래 방식 필터'], ['MY0203', '후기 안 쓴 건'], ['MY0204', '영수증 보기']])}`;

  return { body, o: {} };
}

/* ---- MY0202 거래 방식 필터 ---- */
function MY0202(ctx) {
  const 안전 = MY_BUYS.filter((b) => b.way === '안전결제');
  const 직 = MY_BUYS.filter((b) => b.way === '직거래');

  const body = `
${U.pageHd('구매 내역 — 거래 방식 필터', '칩으로 좁히면 건수와 목록이 함께 줄어요',
    `<div class="btns">${U.btn('전체 보기로 돌아가기', { href: 'MY0201', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['모두', U.num(MY_BUYS.length), { unit: '건', d: '거래 방식을 안 가렸을 때' }],
    ['안전결제', U.num(안전.length), { unit: '건', tone: 'k-ok', d: '돈을 잠깐 맡아 둔 거래', href: 'PA-01' }],
    ['직거래', U.num(직.length), { unit: '건', tone: 'k-mut', d: '만나서 주고받은 거래' }],
    ['지금 걸린 것', U.num(안전.length), { unit: '건', tone: 'k-acc', d: '「안전결제」 칩이 켜져 있어요' }],
  ])}

${U.banner('acc', '🔎', `<b>지금은 「안전결제」 칩이 켜져 있어요.</b>
  칩을 다시 누르거나 <b>전체</b>를 누르면 모든 건이 돌아옵니다. 건수도 함께 다시 셉니다.`,
    { right: U.btn('전체 보기', { cls: 'btn-ghost btn-sm', attr: ' data-filter-reset="buyf"' }) })}

<div class="mt-block">${구매판('buyf', MY_BUYS, { way: 2 })}</div>

${U.sec('칩을 이렇게 씁니다', U.card('', `
  <ul class="t-sub" style="padding-left:18px;line-height:1.9">
    <li><b>전체</b> — 아무 조건도 안 걸린 상태입니다. 다른 칩을 누르면 저절로 꺼져요.</li>
    <li><b>직거래</b> — 만나서 주고받은 건만 남습니다.</li>
    <li><b>안전결제</b> — 돈을 잠깐 맡아 둔 건만 남습니다. 단계 표시가 붙은 건들이에요.</li>
  </ul>
  <p class="t-sub mt3">표 위 왼쪽의 <b>건수</b>는 목록과 «같은 셈»에서 나옵니다. 따로 적어 두면 반드시 갈라져요.</p>`))}`;

  return { body, o: { state: '거래 방식 — 안전결제만 보는 중' } };
}

/* ---- MY0203 후기 안 쓴 건 ---- */
function MY0203(ctx) {
  const 완료 = MY_BUYS.filter((b) => b.st === '거래완료');
  const 기한 = (b) => MY_TODO_REVIEWS.find((t) => t.it === b.it);

  const 행 = 완료.map((b) => {
    const t = 기한(b);
    const r = 구매행(b, { receipt: false });
    r.cells[5] = b.rv
      ? `${U.badge('후기 씀', 'b-mut')}<div class="t-sub nowrap mt1">고칠 수 없어요</div>`
      : `<div class="btns">${U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' })}
          ${U.badge(`D-${t ? t.left : 7}`, t && t.left <= 7 ? 'b-danger' : 'b-warn')}</div>`;
    r.cells[4] = `${U.stBadge(b.st)}${b.rv ? '' : `<div class="t-sub nowrap mt1">${t ? t.due : ''}까지</div>`}`;
    return r;
  });

  const body = `
${U.pageHd('구매 내역 — 후기 안 쓴 건', '거래가 끝나면 30일 안에 후기를 쓸 수 있어요',
    `<div class="btns">${U.btn('구매 내역으로', { href: 'MY0201', cls: 'btn-ghost' })}${U.btn('지금 쓰기', { href: 'MY0401', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['거래완료', U.num(완료.length), { unit: '건', d: '물건을 받은 거래' }],
    ['후기 안 쓴 건', U.num(MY_BUY_NORV.length), { unit: '건', tone: 'k-warn', d: '아직 쓸 수 있어요' }],
    ['후기 쓴 건', U.num(완료.length - MY_BUY_NORV.length), { unit: '건', tone: 'k-ok', d: '쓰고 나면 못 고쳐요' }],
    ['가장 급한 것', `D-${MY_TODO_REVIEWS[0].left}`, { tone: 'k-danger', d: `${MY_TODO_REVIEWS[0].due}까지`, href: 'MY0401' }],
  ])}

${U.banner('warn', '⏰', `<b>「${U.esc(itemBy(MY_TODO_REVIEWS[0].it).t)}」 후기는 D-${MY_TODO_REVIEWS[0].left} 안에 써주세요.</b>
  <div class="t-sub mt1">기한(${MY_TODO_REVIEWS[0].due})이 지나면 쓸 수 없고, 상대가 나에게 쓴 후기도 열리지 않아요.</div>`,
    { right: U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' }) })}

<div class="mt-block">${U.tableBar(
    `<b>${완료.length}</b>건 <span class="t-sub">· 후기를 쓰면 오른쪽이 회색 「후기 씀」 배지로 굳어요</span>`,
    U.btn('받은 후기 보기', { href: 'MY0501', cls: 'btn-ghost btn-sm' }))}
${U.dashTable(구매머리, 행)}</div>

${U.sec('후기는 이렇게 굳습니다', U.card('', `
  ${U.timeline([
    ['거래완료', '물건을 받고 「받았어요」를 누른 날부터 셉니다'],
    ['후기 쓰기 (D-30)', '이 사이에만 쓸 수 있어요. 「후기 쓰기」 단추가 보입니다'],
    ['보냄 — 「후기 씀」 배지', '보내고 나면 고칠 수 없고 배지로 굳습니다'],
    ['둘 다 쓰면 함께 공개', '상대도 써야 서로의 후기가 열려요'],
  ], 1)}`))}`;

  return { body, o: { state: '후기를 아직 안 쓴 거래만' } };
}

/* ---- MY0204 영수증 보기 ---- */
function MY0204(ctx) {
  const b = MY_BUYS.find((x) => x.no === MY_RECEIPT_NO);
  const it = itemBy(b.it);
  const u = userBy(b.with);
  const 수수료 = Math.round(b.price * 0.035);

  const 본문 = `
${U.card('영수증', `
  ${U.kv([
    ['거래번호', `<b>${b.no}</b>`],
    ['거래일', `2026-${b.at}`],
    ['물건', `<a href="${U.link('SE-04')}">${U.esc(it.t)}</a>`],
    ['판매자', U.esc(u.nick)],
    ['거래 방식', U.badge(b.way, 'b-ok')],
    ['결제 수단', b.pay],
  ])}
  <div class="mt4">${U.sumRows([
    ['물건 값', U.won(b.price)],
    ['배송비', U.won(b.ship)],
  ], ['내가 낸 돈', U.won(b.price + b.ship)])}</div>
  <p class="t-sub mt3">부가세가 붙는 거래가 아니에요. 개인끼리의 중고 거래입니다.</p>`)}

<div class="mt-block">${U.card('수수료는 누가 냈나', `
  ${U.feeRows(b.price, 수수료, b.price - 수수료)}
  <p class="t-sub mt3"><b>수수료는 파는 쪽이 냅니다.</b> 사는 쪽은 물건 값과 배송비만 내요.
  위 「내가 낸 돈」에 수수료가 들어 있지 않은 까닭입니다.</p>`)}</div>

<div class="mt-block">${U.card('현금영수증', `
  <p class="t-sub mb3">개인 간 중고 거래는 현금영수증 발급 대상이 아닌 경우가 많아요.
  안전결제로 결제한 건은 결제대행사 이름으로 발급됩니다.</p>
  <div class="row wrap-row" style="gap:12px">
    <input class="input" style="flex:1 1 220px" type="text" placeholder="휴대폰 번호 (- 없이)" aria-label="현금영수증 발급 번호">
    <select class="input" style="width:auto"><option>소득공제</option><option>지출증빙</option></select>
  </div>`)}</div>`;

  const 패널 = U.actPanel('이 영수증으로', `
    ${U.kv([['거래번호', b.no], ['모두', `<b>${U.won(b.price + b.ship)}</b>`], ['상태', U.stBadge(b.st)]])}`,
  U.btn('현금영수증 요청', { cls: 'btn-pri', attr: ' data-toast="현금영수증 요청을 접수했어요. 결제대행사에서 처리합니다"' })
    + U.btn('영수증 내려받기', { cls: 'btn-ghost', attr: ' data-toast="PDF 로 내려받기는 서버가 연결되면 열립니다"' })
    + U.btn('구매 내역으로', { href: 'MY0201', cls: 'btn-quiet' }), { state: b.st })
    + U.actPanel('문제가 있나요', '<p class="t-sub">금액이 다르거나 두 번 빠져나갔다면 고객센터로 알려 주세요.</p>',
      U.btn('고객센터 문의', { href: 'CS-01', cls: 'btn-ghost' }));

  const body = `
${U.pageHd('영수증 보기', `${U.esc(it.t)} · ${b.no}`)}

${U.kpis([
    ['내가 낸 돈', U.num(b.price + b.ship), { unit: '원', d: '물건 값 + 배송비' }],
    ['물건 값', U.num(b.price), { unit: '원', tone: 'k-acc', d: U.esc(it.t) }],
    ['배송비', U.num(b.ship), { unit: '원', tone: 'k-mut', d: b.ship ? '택배로 받았어요' : '배송비가 없어요' }],
    ['수수료', '판매자 부담', { tone: 'k-ok', d: `물건 값의 3.5% (${U.won(수수료)})`, href: 'PA-01' }],
  ])}

${U.detailSplit(본문, 패널)}`;

  return { body, o: {} };
}

/* ══════════════════════════════════════════════════════════════
   MY-03  찜한 물건
   ══════════════════════════════════════════════════════════════ */
function MY0301(ctx) {
  const 팔린것 = MY_WISH.filter((w) => itemBy(w.it).st === '거래완료');
  const 분류들 = [...new Set(MY_WISH.map((w) => itemBy(w.it).cat))];
  const 동네들 = [...new Set(MY_WISH.map((w) => itemBy(w.it).town))];

  const body = `
${U.pageHd('찜한 물건', `담아 둔 물건 ${MY_WISH.length}개`,
    `<div class="btns">${U.btn('묶음 보기', { href: 'MY0302', cls: 'btn-ghost' })}${U.btn('매물 보러 가기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['찜한 물건', U.num(MY_WISH.length), { unit: '개', d: '언제든 다시 볼 수 있어요' }],
    ['값이 내렸어요', U.num(MY_WISH_DOWN.length), { unit: '개', tone: 'k-acc', d: '지금이 살 때일 수 있어요', href: 'MY0303' }],
    ['팔렸어요', U.num(팔린것.length), { unit: '개', tone: 'k-mut', d: '비슷한 매물을 찾아보세요', href: 'MY0304' }],
    ['오래된 찜', U.num(MY_WISH_OLD.length), { unit: '개', tone: 'k-warn', d: '30일 넘게 안 봤어요' }],
  ])}

${MY_WISH_DOWN.length ? U.banner('ok', '📉', `<b>찜한 물건 ${MY_WISH_DOWN.length}개가 값을 내렸어요</b>
  <div class="t-sub mt1">${MY_WISH_DOWN.map((w) => `${U.esc(itemBy(w.it).t)} ${U.num(w.was - itemBy(w.it).price)}원`).join(' · ')}</div>`,
    { right: U.btn('값 내린 것만 보기', { href: 'MY0303', cls: 'btn-ghost btn-sm' }) }) : ''}

<div class="mt-block">${U.tableBar(
    `<b data-filter-count="wish">${MY_WISH.length}</b>개 <span class="t-sub">/ 모두 <span data-filter-total="wish">${MY_WISH.length}</span>개</span>
     <span data-filter-applied="wish" hidden style="margin-left:8px"></span>`,
    `<select class="input" style="width:auto" data-filter="wish" data-f-key="cat" aria-label="분류로 묶어 보기">
       <option value="">모든 분류</option>${분류들.map((c) => `<option value="${U.esc(c)}">${U.esc(c)}</option>`).join('')}</select>
     <select class="input" style="width:auto" data-filter="wish" data-f-key="town" aria-label="동네로 묶어 보기">
       <option value="">모든 동네</option>${동네들.map((t) => `<option value="${U.esc(t)}">${U.esc(t)}</option>`).join('')}</select>
     <select class="input" style="width:auto" data-filter="wish" data-f-key="band" aria-label="가격대로 묶어 보기">
       <option value="">모든 가격대</option>${MY_PRICE_BANDS.map((b) => `<option value="${b.k}">${b.k}</option>`).join('')}</select>
     ${U.btn('전체 보기', { cls: 'btn-quiet btn-sm', attr: ' data-filter-reset="wish"' })}`)}

<div class="table-bar" data-pick-bar hidden>
  <div class="grow"><b data-pick-n>0</b>개 골랐어요 <span class="t-sub">· 고른 것만 한꺼번에 다룰 수 있어요</span></div>
  <div class="row-c" style="gap:8px">
    ${U.btn('값 내림 알림 켜기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="고른 물건의 값 내림 알림을 켰어요"' })}
    ${U.btn('찜 풀기', { cls: 'btn-danger btn-sm', attr: ' data-toast="고른 물건의 찜을 풀었어요" data-toast-act="되돌리기"' })}
  </div>
</div>

${U.dashTable(찜머리(), MY_WISH.map((w) => 찜행(w)), { listKey: 'wish', max: '520px' })}
<div data-filter-empty="wish" hidden class="mt4">${U.empty('💔', '그 묶음에는 찜한 물건이 없어요',
    '묶음을 바꾸거나 전체 보기로 돌아가 보세요.', U.btn('전체 보기', { cls: 'btn-pri', attr: ' data-filter-reset="wish"' }))}</div>
</div>

${MY_WISH_OLD.length ? U.banner('info', '🧹', `<b>30일 넘게 안 본 찜이 ${MY_WISH_OLD.length}개 있어요</b>
  <div class="t-sub mt1">정리하면 알림이 줄어들어요. ${MY_WISH_OLD.map((w) => U.esc(itemBy(w.it).t)).join(' · ')}</div>`,
    { right: U.btn('정리하기', { cls: 'btn-ghost btn-sm', attr: ` data-toast="오래된 찜 ${MY_WISH_OLD.length}개를 풀었어요" data-toast-act="되돌리기"` }), cls: 'mt-block' }) : ''}

${U.sec('', U.empty('💔', '찜한 물건이 없어요', '마음에 드는 물건에 하트를 눌러 두면 여기에 모여요.',
    U.btn('매물 보러 가기', { href: 'SE0201', cls: 'btn-pri' })), { desc: '찜한 것이 하나도 없을 때는 이렇게 보여요.' })}

${상태들([['MY0302', '묶음 보기'], ['MY0303', '값 내림 표시'], ['MY0304', '판매완료된 찜'], ['MY0305', '값 내림 알림 켜기']])}`;

  return { body, o: {} };
}

/* ---- MY0302 묶음 보기 ---- */
function MY0302(ctx) {
  const 묶음 = (list) => list.map(([나눈이름, 것들]) => U.card(
    `${U.esc(나눈이름)} <span class="badge b-mut">${것들.length}개</span>`,
    것들.length
      ? U.dashTable(찜머리({ pick: false }).slice(0, 4), 것들.map((w) => ({ cells: 찜행(w, { pick: false }).cells.slice(0, 4) })))
      : '<p class="t-sub">이 묶음에는 없어요.</p>',
    { cls: 'mb4' })).join('');

  const 분류로 = [...new Set(MY_WISH.map((w) => itemBy(w.it).cat))]
    .map((c) => [c, MY_WISH.filter((w) => itemBy(w.it).cat === c)]);
  const 동네로 = [...new Set(MY_WISH.map((w) => itemBy(w.it).town))]
    .map((t) => [t, MY_WISH.filter((w) => itemBy(w.it).town === t)]);
  const 값대로 = MY_PRICE_BANDS.map((b) => [b.k, MY_WISH.filter((w) => {
    const p = itemBy(w.it).price;
    return p >= b.min && p <= b.max;
  })]);

  const body = `
${U.pageHd('찜한 물건 — 묶음 보기', '카테고리·동네·가격대로 다시 나눠 봤어요',
    `<div class="btns">${U.btn('전체 보기로 돌아가기', { href: 'MY0301', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['찜한 물건', U.num(MY_WISH.length), { unit: '개', d: '나누기 전 모두' }],
    ['분류', U.num(분류로.length), { unit: '가지', tone: 'k-acc', d: '카테고리로 나누면' }],
    ['동네', U.num(동네로.length), { unit: '곳', tone: 'k-ok', d: '동네로 나누면' }],
    ['가격대', U.num(값대로.filter((x) => x[1].length).length), { unit: '칸', tone: 'k-warn', d: '값으로 나누면' }],
  ])}

${U.banner('info', '🗂', `<b>묶음을 바꿔도 찜한 물건은 그대로예요.</b>
  보는 방법만 달라집니다. 전체 보기로 언제든 돌아올 수 있어요.`)}

<div class="mt-block">
  ${U.tabs([
    { label: '카테고리별', cnt: 분류로.length, pane: 'gr0' },
    { label: '동네별', cnt: 동네로.length, pane: 'gr1' },
    { label: '가격대별', cnt: 값대로.length, pane: 'gr2' },
  ], 0)}
  <div class="mt4">
    <div data-pane-body="gr0">${묶음(분류로)}</div>
    <div data-pane-body="gr1" hidden>${묶음(동네로)}</div>
    <div data-pane-body="gr2" hidden>${묶음(값대로)}</div>
  </div>
</div>`;

  return { body, o: { state: '묶음 보기 — 카테고리별' } };
}

/* ---- MY0303 값 내림 표시 ---- */
function MY0303(ctx) {
  const 내림 = MY_WISH_DOWN.map((w) => ({ w, it: itemBy(w.it) }));
  const 합 = 내림.reduce((a, x) => a + (x.w.was - x.it.price), 0);

  const body = `
${U.pageHd('찜한 물건 — 값 내림 표시', '이전 값에 줄을 긋고 새 값을 굵게 보여줘요',
    `<div class="btns">${U.btn('전체 보기로 돌아가기', { href: 'MY0301', cls: 'btn-ghost' })}${U.btn('알림 설정', { href: 'MY0601', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['값이 내린 찜', U.num(내림.length), { unit: '개', tone: 'k-acc', d: '지금이 살 때일 수 있어요' }],
    ['모두 내린 폭', U.num(합), { unit: '원', tone: 'k-ok', d: '찜해 둔 값에서 줄어든 돈' }],
    ['가장 많이 내린 것', U.num(Math.max(...내림.map((x) => x.w.was - x.it.price))), { unit: '원', tone: 'k-warn', d: U.esc(내림[0].it.t) }],
    ['알림 켠 물건', U.num(MY_WISH.filter((w) => w.bell).length), { unit: '개', tone: 'k-mut', d: '값이 내리면 알려드려요', href: 'MY0305' }],
  ])}

${U.banner('ok', '📉', `<b>값이 내려가면 이렇게 보여요.</b>
  이전 값에 줄을 긋고 새 값을 굵게, 오른쪽에 <b>내린 폭</b>을 배지로 답니다. 언제 내렸는지도 함께 적어요.`)}

<div class="mt-block">${U.tableBar(`<b>${내림.length}</b>개 <span class="t-sub">· 값이 내린 찜만 모았어요</span>`,
    U.btn('찜 전체 보기', { href: 'MY0301', cls: 'btn-ghost btn-sm' }))}
${U.dashTable(
    [{ t: '물건' }, { t: '동네', w: '140px' }, { t: '값 변화', w: '280px' }, { t: '내린 날', w: '120px' }, { t: '값 내림 알림', w: '110px' }],
    내림.map(({ w, it }) => ({
      cells: [
        `<span class="row-c">${U.phItem(40, it.id)}<a class="strong" href="${U.link('SE-04')}">${U.esc(it.t)}</a></span>`,
        `<span class="nowrap">${U.esc(it.town)}<span class="t-sub"> · ${it.dist}km</span></span>`,
        U.priceDown(w.was, it.price),
        `<span class="t-sub nowrap">${w.downAt}</span>`,
        `<button class="toggle${w.bell ? ' on' : ''}" type="button" role="switch" aria-checked="${w.bell}" aria-label="값 내림 알림" data-toast="값이 더 내려가면 알려드릴게요"><span class="kn"></span></button>`,
      ],
    })))}</div>

${U.sec('값이 내려도 서두르지 마세요', U.card('', `
  <p class="t-sub">값이 갑자기 크게 내려간 물건은 한 번 더 살펴보세요.
  시세보다 너무 싸면 사기일 수 있어요. 값을 먼저 보내 달라는 말이 나오면 그 자리에서 멈추고 안전결제를 쓰세요.</p>
  <div class="btns mt3">${U.btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' })}</div>`))}`;

  return { body, o: { state: '값이 내린 찜만' } };
}

/* ---- MY0304 판매완료된 찜 ---- */
function MY0304(ctx) {
  const 팔린것 = MY_WISH.filter((w) => itemBy(w.it).st === '거래완료');
  const 남은것 = MY_WISH.filter((w) => itemBy(w.it).st !== '거래완료');
  const 비슷한 = (it) => ITEMS.filter((x) => x.cat === it.cat && x.st === '판매중').slice(0, 4);

  const body = `
${U.pageHd('찜한 물건 — 판매완료된 찜', '이미 팔린 물건은 흐리게 두고 덮개를 씌워요',
    `<div class="btns">${U.btn('전체 보기로 돌아가기', { href: 'MY0301', cls: 'btn-ghost' })}${U.btn('매물 보러 가기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['팔린 찜', U.num(팔린것.length), { unit: '개', tone: 'k-mut', d: '다른 이웃이 가져갔어요' }],
    ['아직 살 수 있는 찜', U.num(남은것.length), { unit: '개', tone: 'k-ok', d: '판매중이거나 예약중' }],
    ['비슷한 매물', U.num(비슷한(itemBy(팔린것[0].it)).length), { unit: '개', tone: 'k-acc', d: '같은 분류에서 찾았어요', href: 'SE-02' }],
    ['찜한 물건', U.num(MY_WISH.length), { unit: '개', d: '모두', href: 'MY0301' }],
  ])}

${U.banner('quiet', '🏷', `<b>팔린 물건은 목록에서 지우지 않아요.</b>
  내가 무엇을 찾고 있었는지가 남아 있어야 비슷한 매물을 권할 수 있거든요. 필요 없으면 직접 치울 수 있어요.`)}

<div class="mt-block">${U.tableBar(`<b>${팔린것.length}</b>개 <span class="t-sub">· 판매완료된 찜만 모았어요</span>`,
    U.btn('팔린 찜 한꺼번에 치우기', { cls: 'btn-quiet btn-sm', attr: ` data-toast="팔린 찜 ${팔린것.length}개를 목록에서 치웠어요" data-toast-act="되돌리기"` }))}
${U.dashTable(
    [{ t: '물건' }, { t: '동네', w: '140px' }, { t: '값', w: '150px' }, { t: '상태', w: '110px' }, { t: '할 일', w: '250px' }],
    팔린것.map((w) => {
      const it = itemBy(w.it);
      return {
        cells: [
          `<span style="opacity:.55"><span class="row-c">
            <span class="thumb" style="position:relative;display:inline-block">${U.phItem(40, it.id)}<span class="veil" data-t="거래완료"></span></span>
            <span class="strong">${U.esc(it.t)}</span></span></span>`,
          `<span style="opacity:.55" class="nowrap">${U.esc(it.town)} · ${it.dist}km</span>`,
          `<span style="opacity:.55"><b class="nowrap">${U.won(it.price)}</b></span>`,
          U.stBadge('거래완료'),
          `<div class="btns">${U.btn('비슷한 매물 찾기', { href: 'SE-02', cls: 'btn-pri btn-sm' })}
            ${U.btn('목록에서 치우기', { cls: 'btn-quiet btn-sm', attr: ' data-toast="목록에서 치웠어요" data-toast-act="되돌리기"' })}</div>`,
        ],
      };
    }))}</div>

${U.sec(`「${U.esc(itemBy(팔린것[0].it).t)}」와 비슷한 매물`,
    U.carousel(비슷한(itemBy(팔린것[0].it)).map((it) => U.itemCard(it, { why: '같은 분류' })).join('')),
    { desc: '놓친 물건과 같은 분류에서 지금 살 수 있는 것만 골랐어요.', more: 'SE-02', moreLabel: '매물 전체 보기' })}`;

  return { body, o: { state: '판매완료된 찜만' } };
}

/* ---- MY0305 값 내림 알림 켜기 ---- */
function MY0305(ctx) {
  const 켤수있는 = MY_WISH.filter((w) => itemBy(w.it).st !== '거래완료');
  const 켠것 = 켤수있는.filter((w) => w.bell);

  const body = `
${U.pageHd('찜한 물건 — 값 내림 알림 켜기', '종을 누르면 그 물건 값이 내릴 때 알려드려요',
    `<div class="btns">${U.btn('전체 보기로 돌아가기', { href: 'MY0301', cls: 'btn-ghost' })}${U.btn('알림 설정으로', { href: 'MY0601', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['알림 켠 물건', U.num(켠것.length), { unit: '개', tone: 'k-ok', d: '값이 내리면 알려드려요' }],
    ['아직 안 켠 물건', U.num(켤수있는.length - 켠것.length), { unit: '개', tone: 'k-warn', d: '한꺼번에 켤 수 있어요' }],
    ['이번 달 값 내림 알림', '2', { unit: '번', tone: 'k-acc', d: '실제로 울린 횟수', href: 'MY0601' }],
    ['방해 금지 시간', `${MY_QUIET.from}~${MY_QUIET.to}`, { tone: 'k-mut', d: '이 사이에는 모아 뒀다 보내요', href: 'MY0605' }],
  ])}

${U.banner('ok', '🔔', `<b>종을 누르면 채워지고 「값이 내려가면 알려드릴게요」가 잠깐 떠요.</b>
  이 알림은 <b>알림 설정 › 찜한 물건 값 내림</b>과 이어져 있어요. 거기서 끄면 여기 종도 함께 꺼집니다.`,
    { right: U.btn('알림 설정 열기', { href: 'MY0601', cls: 'btn-ghost btn-sm' }) })}

<div class="mt-block">${U.tableBar(
    `<b>${켤수있는.length}</b>개 <span class="t-sub">· 판매완료된 물건에는 종이 없어요</span>`,
    `${U.btn('모두 켜기', { cls: 'btn-pri btn-sm', attr: ` data-toast="찜한 물건 ${켤수있는.length}개의 값 내림 알림을 켰어요"` })}
     ${U.btn('모두 끄기', { cls: 'btn-quiet btn-sm', attr: ' data-toast="값 내림 알림을 모두 껐어요" data-toast-act="되돌리기"' })}`)}

<div class="table-bar" data-pick-bar hidden>
  <div class="grow"><b data-pick-n>0</b>개 골랐어요</div>
  ${U.btn('고른 것만 알림 켜기', { cls: 'btn-pri btn-sm', attr: ' data-toast="고른 물건의 값 내림 알림을 켰어요"' })}
</div>

${U.dashTable(찜머리(), 켤수있는.map((w) => 찜행(w, { picked: w.bell })), { listKey: 'bell', max: '480px' })}</div>

${U.sec('알림이 너무 잦다면', U.card('', `
  <p class="t-sub">값 내림 알림은 <b>내린 폭이 1,000원을 넘을 때만</b> 울려요.
  그래도 잦으면 알림 설정에서 종류별로 끄거나, 방해 금지 시간을 늘려 보세요.</p>
  <div class="btns mt3">
    ${U.btn('알림 종류 고르기', { href: 'MY0604', cls: 'btn-ghost btn-sm' })}
    ${U.btn('방해 금지 시간', { href: 'MY0605', cls: 'btn-ghost btn-sm' })}</div>`))}`;

  return { body, o: { state: '값 내림 알림을 켜는 중' } };
}

/* ══════════════════════════════════════════════════════════════
   MY-04  거래 후기 쓰기
   ══════════════════════════════════════════════════════════════ */
/** 지금 후기를 쓸 거래 — «안 쓴 후기» 목록에서 가장 급한 것을 그대로 쓴다.
   ⛔ 여기서 딴 거래를 집어 오면 「D-7 안에 써주세요」 띠와 화면 속 상대가 어긋난다. */
const 후기대상 = {
  with: MY_TODO_REVIEWS[0].with,
  item: MY_TODO_REVIEWS[0].it,
  at: `2026년 ${Number(MY_TODO_REVIEWS[0].at.slice(0, 2))}월 ${Number(MY_TODO_REVIEWS[0].at.slice(3))}일`,
  산쪽: MY_TODO_REVIEWS[0].side === '샀어요',
};

/** 후기 쓰기 본문 — 산 쪽·판 쪽에 따라 칩 목록이 통째로 바뀐다.
   o.on : 좋았던 점에서 미리 골라 둔 칩 번호들
   o.bad: 아쉬운 점 칸을 열어 둘지 · o.priv: 비공개 체크를 켜 둘지 */
function 후기폼(o = {}) {
  const 산쪽 = o.산쪽 !== false;
  const 좋았던 = 산쪽 ? GOOD_SELLER : GOOD_BUYER;
  const 아쉬운 = 산쪽 ? BAD_SELLER : BAD_BUYER;
  const 고른 = o.on || [0, 1];
  const 남은 = Math.max(0, 3 - 고른.length);
  const u = userBy(o.with || 후기대상.with);
  const it = itemBy(o.item || 후기대상.item);

  return `
${U.card('', `<div class="row-b wrap-row">
  <div class="row-c" style="gap:12px">
    ${U.phAva(48, u.id)}
    <div><b style="font-size:17px">${U.esc(u.nick)}</b> ${U.manner(u.manner)}
      <p class="t-sub mt1">${U.esc(u.town)} · ${U.respText(u.respMin)}</p></div>
  </div>
  <div class="row-c" style="gap:10px">
    ${U.phItem(48, it.id)}
    <div><b>${U.esc(it.t)}</b><div class="t-sub">${U.won(it.price)} · ${후기대상.at} 거래</div></div>
  </div>
  ${U.badge(산쪽 ? '내가 산 거래' : '내가 판 거래', 'b-pri')}
</div>`)}

${U.banner('info', '🤝', `<b>${U.esc(u.nick)}님도 나에게 후기를 남길 수 있어요</b>
  <div class="t-sub mt1">서로의 후기는 <b>둘 다 쓴 뒤에</b> 공개돼요. 한쪽만 쓰면 상대에게 보이지 않습니다.</div>`, { cls: 'mt-block' })}

${U.sec('① 거래가 어떠셨나요', U.card('', `
  ${U.rateIn('별점', 5, { big: true })}
  <p class="t-sub mt2 center">★★★★★ — 아주 좋았어요</p>`))}

${U.sec('② 또 거래하고 싶으세요', U.card('', `<div class="stack-sm">
  ${[['또 거래하고 싶어요', '👍', '이웃의 재거래 희망률이 올라가요'],
    ['그저 그래요', '😐', '점수에 크게 영향을 주지 않아요'],
    ['다시는 안 할래요', '👎', '까닭을 아래에 적어 주세요']]
    .map(([k, ic], i) => `<label class="radio${i === 0 ? ' on' : ''}" data-group="again">
      <input type="radio" name="again"${i === 0 ? ' checked' : ''}><b>${ic} ${k}</b></label>`).join('')}
</div>`))}

${U.sec(`③ 어떤 점이 좋았나요 — ${산쪽 ? '판매자' : '구매자'}를 매기는 자리`, U.card('', `
  <p class="t-sub mb3">${산쪽 ? '판매자' : '구매자'}에게 어울리는 것을 골라 주세요 ·
    <b>3개까지</b> <span class="${남은 ? '' : 'danger'}">(${남은}개 남음)</span></p>
  ${U.chips(좋았던, 고른)}
  <p class="t-sub mt3">고른 항목이 상대의 프로필에 쌓여요. <b>${산쪽 ? '판매자' : '구매자'}용 목록</b>이라
    ${산쪽 ? '「포장이 꼼꼼해요」' : '「무리한 값 깎기가 없었어요」'} 같은 항목이 들어 있습니다.</p>
  <div class="btns mt3">${U.btn('산 쪽·판 쪽 목록 견주기', { href: 'MY0402', cls: 'btn-ghost btn-sm' })}
    ${U.btn('3개를 넘겨 고르면', { href: 'MY0403', cls: 'btn-quiet btn-sm' })}</div>`))}

${U.sec('④ 아쉬운 점도 있었나요', U.card('', `
  <label class="check"><input type="checkbox"${o.bad ? ' checked' : ''}><span><b>아쉬운 점도 남길게요</b>
    <div class="t-sub">켜면 아쉬운 점 칩과 자세히 적는 칸이 열려요</div></span></label>
  ${o.bad ? `<div class="mt4">
    ${U.chips(아쉬운, [0, 2])}
    <textarea class="input mt3" rows="3" placeholder="무엇이 아쉬웠는지 적어 주세요">약속 시간이 두 번 미뤄져서 기다렸습니다.</textarea>
    <p class="t-sub mt2">아쉬운 점은 상대의 매너 점수를 내립니다. 신중하게 골라 주세요.
      <b>아쉬운 점만 골라도 후기를 보낼 수 있어요.</b></p></div>`
    : `<p class="t-sub mt3">지금은 꺼져 있어요. 켜면 아래에 칸이 열립니다.
      ${U.btn('열린 모습 보기', { href: 'MY0404', cls: 'btn-quiet btn-xs' })}</p>`}`))}

${U.sec('⑤ 하고 싶은 말', U.card('', `
  <textarea class="input" rows="5" placeholder="이웃들에게 도움이 될 만한 이야기를 적어 주세요">사진 그대로였고 약속 시간에 딱 맞춰 오셨어요. 또 거래하고 싶습니다.</textarea>
  <p class="t-sub mt1 right">41 / 500</p>
  <div class="photo-grid mt3">
    <button class="photo-add" type="button" data-toast="사진을 골라 주세요">
      <span style="font-size:22px">＋</span><span>사진 (안 넣어도 돼요)</span></button>
  </div>
  <label class="check mt4"><input type="checkbox"${o.priv ? ' checked' : ''}><span>
    <b>이 후기는 ${U.esc(u.nick)}님에게만 보이게 할게요</b>
    <div class="t-sub">${o.priv ? '남에게는 안 보여요. 그래도 매너 점수에는 그대로 반영됩니다.' : '켜면 상대에게만 보여요.'}</div></span></label>
  ${o.priv ? '' : `<div class="mt2">${U.btn('비공개로 하면 어떻게 되나요', { href: 'MY0405', cls: 'btn-quiet btn-xs' })}</div>`}`))}

${U.box(`<b class="t-card">후기가 매너 점수를 만듭니다</b>
  <p class="t-sub mt2">좋은 후기는 점수를 올리고, 아쉬운 후기는 내립니다.
  누구나 <b>${MY_MANNER_BASE}</b>에서 시작해요. 이 장터에서 「이 사람에게 사도 되나」를 재는 유일한 자입니다.</p>`)}`;
}

function 후기패널(o = {}) {
  const u = userBy(o.with || 후기대상.with);
  const it = itemBy(o.item || 후기대상.item);
  return U.actPanel('후기 보내기', `
    ${U.kv([
    ['상대', U.esc(u.nick)],
    ['물건', U.esc(it.t)],
    ['거래일', 후기대상.at],
    ['내 쪽', U.badge(o.산쪽 === false ? '내가 판 거래' : '내가 산 거래', 'b-pri')],
    ['공개 범위', o.priv ? U.badge('🔒 상대에게만', 'b-warn') : '모두에게 공개'],
  ])}
    <p class="t-sub mt3">보내고 나면 <b>고칠 수 없어요.</b> 한 번 더 읽어 보세요.</p>`,
  U.btn('후기 보내기', { href: 'MY0406', cls: 'btn-pri btn-lg' })
    + U.btn('나중에 할게요', { href: 'MY0201', cls: 'btn-ghost' }), { state: '진행중' })

    + U.actPanel('이어서 볼 곳', '',
      U.btn('받은 후기 보기', { href: 'MY0501', cls: 'btn-ghost' })
      + U.btn('구매 내역으로', { href: 'MY0201', cls: 'btn-ghost' }));
}

function MY0401(ctx) {
  const body = `
${U.pageHd(`거래 후기 쓰기`, `${U.esc(userBy(후기대상.with).nick)}님과의 거래가 어땠는지 알려 주세요`)}

${U.kpis([
    ['내 매너 점수', 나.manner.toFixed(1), { unit: '점', d: '후기를 주고받으며 오르내려요', href: 'MY0501' }],
    ['안 쓴 후기', U.num(MY_TODO_REVIEWS.length), { unit: '건', tone: 'k-warn', d: '기한이 지나면 못 써요', href: 'MY0505' }],
    ['고를 수 있는 칩', '3', { unit: '개', tone: 'k-acc', d: '좋았던 점은 최대 3개', href: 'MY0403' }],
    ['남은 기한', `D-${MY_TODO_REVIEWS[0].left}`, { tone: 'k-danger', d: `${MY_TODO_REVIEWS[0].due}까지` }],
  ])}

${U.detailSplit(후기폼({ 산쪽: true }), 후기패널({ 산쪽: true }))}

${상태들([['MY0402', '산 쪽·판 쪽 구분'], ['MY0403', '칩 고르기'], ['MY0404', '아쉬운 점 켜기'], ['MY0405', '비공개 후기'], ['MY0406', '보냄 완료']])}`;

  return { body, o: {} };
}

/* ---- MY0402 산 쪽·판 쪽 구분 ---- */
function MY0402(ctx) {
  const 칩표 = (좋, 나쁨) => `
    <p class="t-sub mb3"><b>좋았던 점</b> — 3개까지 고를 수 있어요</p>
    ${U.chips(좋)}
    <p class="t-sub mt4 mb3"><b>아쉬운 점</b> — 토글을 켜야 열려요</p>
    ${U.chips(나쁨)}`;

  const body = `
${U.pageHd('거래 후기 — 산 쪽·판 쪽 구분', '내가 어느 쪽이었는지에 따라 칩 목록이 통째로 바뀝니다',
    `<div class="btns">${U.btn('후기 쓰기로 돌아가기', { href: 'MY0401', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['판매자용 칩', U.num(GOOD_SELLER.length), { unit: '개', d: '내가 «산» 거래일 때' }],
    ['구매자용 칩', U.num(GOOD_BUYER.length), { unit: '개', tone: 'k-acc', d: '내가 «판» 거래일 때' }],
    ['같이 쓰는 칩', U.num(GOOD_SELLER.filter((c) => GOOD_BUYER.includes(c)).length), { unit: '개', tone: 'k-mut', d: '양쪽에 다 있는 항목' }],
    ['고를 수 있는 수', '3', { unit: '개', tone: 'k-warn', d: '어느 쪽이든 3개까지', href: 'MY0403' }],
  ])}

${U.banner('acc', '🔁', `<b>쇼핑몰의 상품 후기와 다른 자리입니다.</b>
  이 장터에서는 <b>사는 쪽도 평가받아요.</b> 그래서 내가 어느 쪽이었는지에 따라 고를 수 있는 말이 달라집니다.`)}

<div class="mt-block">
  ${U.tabs([{ label: '내가 산 거래 — 판매자를 매김', pane: 'sd0' }, { label: '내가 판 거래 — 구매자를 매김', pane: 'sd1' }], 0)}
  <div class="mt4">
    <div data-pane-body="sd0">${U.card(`${U.badge('내가 산 거래', 'b-pri')} 판매자에게 어울리는 말`, 칩표(GOOD_SELLER, BAD_SELLER))}</div>
    <div data-pane-body="sd1" hidden>${U.card(`${U.badge('내가 판 거래', 'b-acc')} 구매자에게 어울리는 말`, 칩표(GOOD_BUYER, BAD_BUYER))}</div>
  </div>
</div>

${U.sec('두 목록을 나란히', U.dashTable(
    [{ t: '판매자를 매길 때 (내가 산 거래)' }, { t: '구매자를 매길 때 (내가 판 거래)' }],
    GOOD_SELLER.map((s, i) => ({
      cells: [
        `${s}${GOOD_BUYER.includes(s) ? ' ' + U.badge('같음', 'b-mut') : ' ' + U.badge('판매자만', 'b-pri')}`,
        `${GOOD_BUYER[i] || '—'}${GOOD_BUYER[i] && GOOD_SELLER.includes(GOOD_BUYER[i]) ? '' : ' ' + U.badge('구매자만', 'b-acc')}`,
      ],
    }))))}`;

  return { body, o: { state: '내가 산 거래 — 판매자를 매기는 중' } };
}

/* ---- MY0403 칩 고르기 ---- */
function MY0403(ctx) {
  const body = `
${U.pageHd('거래 후기 — 칩 고르기', '좋았던 점은 3개까지 고를 수 있어요',
    `<div class="btns">${U.btn('후기 쓰기로 돌아가기', { href: 'MY0401', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['고를 수 있는 수', '3', { unit: '개', d: '많이 고른다고 점수가 더 오르지 않아요' }],
    ['지금 고른 것', '3', { unit: '개', tone: 'k-ok', d: '다 골랐어요' }],
    ['남은 수', '0', { unit: '개', tone: 'k-danger', d: '더 고르려면 하나를 풀어 주세요' }],
    ['고를 수 있는 항목', U.num(GOOD_SELLER.length), { unit: '개', tone: 'k-mut', d: '판매자용 목록', href: 'MY0402' }],
  ])}

${U.banner('warn', '✋', `<b>3개까지예요.</b>
  이미 3개를 골랐습니다. 다른 것을 고르려면 <b>고른 칩의 ✕</b>를 누르거나 칩을 한 번 더 눌러 풀어 주세요.`)}

<div class="mt-block">${U.card('어떤 점이 좋았나요', `
  <p class="t-sub mb3">판매자에게 어울리는 것을 골라 주세요 · <b>3개까지</b> <span class="danger">(0개 남음)</span></p>
  ${U.chips(GOOD_SELLER, [0, 1, 4])}
  <p class="t-sub mt3">고른 칩에는 <b>✕</b>가 붙어요. 누르면 그 칩이 빠지고 남은 수가 <b>1개</b>로 돌아옵니다.</p>`)}</div>

${U.sec('고른 것이 어디에 쌓이나', U.card('', `
  <div class="bars">${항목순위.slice(0, 3).map(([k, n]) => `<div class="bar-row">
    <span class="nowrap t-sub" style="width:190px">${k}</span>
    ${U.progress(Math.round(n / 항목최대 * 100))}
    <span class="nowrap t-sub" style="width:60px;text-align:right">${n} → ${n + 1}</span></div>`).join('')}</div>
  <p class="t-sub mt3">내가 고른 칩은 상대의 프로필 「이웃들이 좋아한 점」 막대에 한 칸씩 쌓여요.</p>`),
    { more: 'MY0101', moreLabel: '막대가 쌓인 모습 보기' })}`;

  return { body, o: { state: '3개를 다 고른 상태' } };
}

/* ---- MY0404 아쉬운 점 켜기 ---- */
function MY0404(ctx) {
  const body = `
${U.pageHd('거래 후기 — 아쉬운 점 켜기', '토글을 켜면 아쉬운 점 칩과 적는 칸이 열려요')}

${U.kpis([
    ['아쉬운 점 항목', U.num(BAD_SELLER.length), { unit: '개', d: '판매자용 목록' }],
    ['지금 고른 것', '2', { unit: '개', tone: 'k-warn', d: '고른 만큼 상대 점수가 내려가요' }],
    ['내려가는 폭', '−0.5', { unit: '점', tone: 'k-danger', d: '아쉬운 후기 한 건이 내리는 폭', href: 'MY0102' }],
    ['별점 없이도', '보낼 수 있어요', { tone: 'k-mut', d: '아쉬운 점만 골라도 됩니다' }],
  ])}

${U.banner('warn', '⚠', `<b>끄면 닫히고 적어 둔 값도 지워져요.</b>
  토글을 다시 끄면 고른 칩과 적은 글이 사라집니다. 되돌릴 수 없으니 보내기 전에 한 번 더 읽어 보세요.`)}

${U.detailSplit(후기폼({ 산쪽: true, bad: true, on: [0] }), 후기패널({ 산쪽: true }))}

${U.sec('아쉬운 점을 남길 때', U.card('', `
  <ul class="t-sub" style="padding-left:18px;line-height:1.9">
    <li><b>사실만 적어 주세요.</b> 사실과 다른 후기는 신고 대상입니다.</li>
    <li>아쉬운 점만 고르고 좋았던 점은 비워 둬도 <b>보낼 수 있어요.</b></li>
    <li>아쉬운 점은 상대의 매너 점수를 내립니다. 한 번 보내면 고칠 수 없어요.</li>
  </ul>`))}`;

  return { body, o: { state: '아쉬운 점 칸이 열린 상태' } };
}

/* ---- MY0405 비공개 후기 ---- */
function MY0405(ctx) {
  const body = `
${U.pageHd('거래 후기 — 비공개 후기', '체크하면 상대에게만 보여요')}

${U.kpis([
    ['공개 범위', '상대에게만', { tone: 'k-warn', d: '남의 프로필에 안 보여요' }],
    ['매너 점수 반영', '그대로', { tone: 'k-ok', d: '비공개여도 점수는 움직여요', href: 'MY0102' }],
    ['내가 받은 비공개 후기', U.num(REVIEWS.filter((r) => r.priv).length), { unit: '건', tone: 'k-acc', d: '나만 볼 수 있어요', href: 'MY0504' }],
    ['되돌리기', '안 돼요', { tone: 'k-mut', d: '보낸 뒤에는 못 고쳐요' }],
  ])}

${U.banner('acc', '🔒', `<b>비공개로 해도 매너 점수에는 그대로 반영됩니다.</b>
  「남에게 안 보인다」와 「점수에 안 들어간다」는 다른 말이에요. 점수는 그대로 움직입니다.`)}

${U.detailSplit(후기폼({ 산쪽: true, priv: true }), 후기패널({ 산쪽: true, priv: true }))}

${U.sec('비공개 후기는 이렇게 보여요', U.dashTable(
    [{ t: '누가 볼 때' }, { t: '보이나요', w: '150px' }, { t: '무엇이 보이나' }],
    [
      { cells: ['<b>후기를 받은 상대</b>', U.badge('보여요', 'b-ok'), '별점 · 고른 칩 · 글 모두'] },
      { cells: ['<b>나(쓴 사람)</b>', U.badge('보여요', 'b-ok'), '내가 쓴 후기 목록에 🔒 표시와 함께'] },
      { cells: ['<span class="t-sub">다른 이웃</span>', U.badge('안 보여요', 'b-mut'), '프로필의 후기 목록에 나오지 않아요'] },
      { cells: ['<span class="t-sub">매너 점수 셈</span>', U.badge('들어가요', 'b-warn'), '공개 후기와 똑같이 셉니다'] },
    ]))}`;

  return { body, o: { state: '비공개로 남기는 중' } };
}

/* ---- MY0406 보냄 완료 ---- */
function MY0406(ctx) {
  const u = userBy(후기대상.with);
  const body = `
${U.pageHd('후기를 보냈어요', `${U.esc(u.nick)}님과의 거래 후기를 남겼습니다`)}

${U.kpis([
    ['보낸 후기', '1', { unit: '건', tone: 'k-ok', d: '방금 보냈어요' }],
    ['상대 후기', '기다리는 중', { tone: 'k-warn', d: '아직 안 썼어요' }],
    ['남은 안 쓴 후기', U.num(MY_TODO_REVIEWS.length - 1), { unit: '건', tone: 'k-acc', d: '이어서 쓸 수 있어요', href: 'MY0505' }],
    ['내 매너 점수', 나.manner.toFixed(1), { unit: '점', d: '상대가 쓰면 다시 셉니다', href: 'MY0501' }],
  ])}

${U.card('', U.empty('✅', '후기를 보냈어요',
    `<b>${U.esc(u.nick)}님도 쓰면 서로의 후기가 함께 공개돼요.</b><br>
     한쪽만 쓴 후기는 상대에게 보이지 않습니다. 기다리는 동안에는 「대기 중」으로 표시돼요.`,
    U.btn('받은 후기 보러 가기', { href: 'MY0501', cls: 'btn-pri btn-lg' })
    + U.btn('구매 내역으로', { href: 'MY0201', cls: 'btn-ghost btn-lg' })))}

<div class="mt-block">${U.card('지금 어디까지 왔나', `
  ${U.turnLine(`${U.esc(u.nick)}님이 후기를 쓸 차례예요`, `${MY_TODO_REVIEWS[0].left}일`)}
  ${U.timeline([
    ['내가 후기를 썼어요', '2026년 9월 11일 · 방금'],
    [`${U.esc(u.nick)}님이 쓰기를 기다리는 중`, '거래일에서 30일 안에 쓸 수 있어요'],
    ['둘 다 쓰면 함께 공개', '그때부터 서로의 프로필에 보여요'],
  ], 1)}
  <p class="t-sub mt4">상대가 끝내 쓰지 않으면 <b>기한이 지난 뒤</b> 내 후기만 공개돼요.
  기다리는 동안에도 내가 고른 칩은 상대의 매너 점수에 이미 반영됩니다.</p>`)}</div>

${U.sec('이어서 쓸 후기', MY_TODO_REVIEWS.length > 1 ? U.dashTable(
    [{ t: '상대' }, { t: '물건' }, { t: '내 쪽', w: '110px' }, { t: '기한', w: '150px' }, { t: '', w: '140px' }],
    MY_TODO_REVIEWS.slice(1).map((t) => {
      const 상대 = userBy(t.with);
      const it = itemBy(t.it);
      return {
        cells: [
          `<span class="row-c" style="gap:6px">${U.phAva(26, 상대.id)}${U.esc(상대.nick)}</span>`,
          `<span class="row-c">${U.phItem(36, it.id)}<span>${U.esc(it.t)}</span></span>`,
          U.badge(t.side === '샀어요' ? '내가 샀어요' : '내가 팔았어요', 'b-mut'),
          `<span class="nowrap">${t.due}까지 ${U.badge(`D-${t.left}`, t.left <= 7 ? 'b-danger' : 'b-warn')}</span>`,
          U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' }),
        ],
      };
    })) : '<p class="t-sub">더 쓸 후기가 없어요.</p>', { more: 'MY0505', moreLabel: '안 쓴 후기 모두 보기' })}`;

  return { body, o: { state: '후기 보냄 — 상대 후기 대기 중' } };
}

/* ══════════════════════════════════════════════════════════════
   MY-05  받은 후기·매너 점수 상세
   ══════════════════════════════════════════════════════════════ */
const 점수그래프 = () => `
  ${U.phMap('매너 점수 변화 차트 (최근 6개월)', 800, 240)}
  <div class="row-b t-sub mt3">${MANNER_HISTORY.map((h) => `<span class="center">${h.m}<br><b style="font-size:15px;color:var(--text)">${h.v.toFixed(1)}</b></span>`).join('')}</div>`;

function MY0501(ctx) {
  const 막대 = `<div class="bars">${항목순위.map(([k, n]) => `
    <a class="bar-row" href="${U.link('MY0502')}" title="「${k}」를 고른 후기만 보기">
      <span class="nowrap t-sub" style="width:200px">${k}</span>
      ${U.progress(Math.round(n / 항목최대 * 100))}
      <span class="nowrap t-sub" style="width:36px;text-align:right">${n}</span></a>`).join('')}</div>`;

  const body = `
${U.pageHd('받은 후기·매너 점수 상세', `받은 후기 ${REVIEWS.length}건 · 쓴 후기 ${MY_WRITTEN_REVIEWS.length}건`,
    `<div class="btns">${U.btn('내 프로필로', { href: 'MY0101', cls: 'btn-ghost' })}${U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['매너 점수', 나.manner.toFixed(1), { unit: '점', d: `${MY_MANNER_BASE}에서 시작했어요`, href: 'MY0102' }],
    ['받은 후기', U.num(REVIEWS.length), { unit: '건', tone: 'k-ok', d: `비공개 ${REVIEWS.filter((r) => r.priv).length}건 포함`, href: 'MY0504' }],
    ['쓴 후기', U.num(MY_WRITTEN_REVIEWS.length), { unit: '건', tone: 'k-acc', d: '내가 남긴 후기' }],
    ['안 쓴 후기', U.num(MY_TODO_REVIEWS.length), { unit: '건', tone: 'k-warn', d: '기한이 지나면 못 써요', href: 'MY0505' }],
  ])}

${U.banner('info', '✍', `<b>아직 후기를 안 쓴 거래가 ${MY_TODO_REVIEWS.length}건 있어요</b>
  <div class="t-sub mt1">내가 써야 상대의 후기도 공개돼요. 거래 뒤 30일 안에 쓸 수 있습니다.
  가장 급한 것은 <b>D-${MY_TODO_REVIEWS[0].left}</b>예요.</div>`,
    { right: U.btn('지금 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' }) })}

<div class="mt-block">${U.card('매너 점수 변화 (최근 6개월)', `
  <div class="row-c wrap-row" style="gap:24px">
    <div style="flex:none">${U.manner(나.manner, { big: true })}
      <div class="t-sub mt2 center">지금 점수</div></div>
    <div class="grow" style="min-width:280px">${점수그래프()}</div>
  </div>`, { ft: U.btn('달마다 무슨 일이 있었는지', { href: 'MY0503', cls: 'btn-ghost btn-sm' }) })}</div>

<div class="mt-block">${U.card('무엇이 올리고 무엇이 내렸나', U.dashTable(
    [{ t: '까닭', w: '48%' }, { t: '건수', w: '96px' }, { t: '점수', w: '110px' }],
    [...MY_MANNER_UP.map((x) => ({
      cells: [`<b>${x.k}</b><div class="t-sub">${x.d}</div>`, x.n == null ? '—' : `${x.n}건`,
        `<b style="color:var(--success)">+${x.v.toFixed(1)}</b>`],
    })),
    ...MY_MANNER_DOWN.map((x) => ({
      cells: [`<b>${x.k}</b><div class="t-sub">${x.d}</div>`, x.n == null ? '—' : `${x.n}건`,
        x.v === 0 ? '<span class="t-sub">—</span>' : `<b style="color:var(--danger)">${x.v.toFixed(1)}</b>`],
    }))],
    { foot: ['시작 점수 ' + MY_MANNER_BASE + ' 에서', '', `<b>${MY_MANNER_SUM.toFixed(1)}점</b>`] }),
  { ft: U.btn('근거 자세히 보기', { href: 'MY0102', cls: 'btn-ghost btn-sm' }) })}</div>

${U.sec('항목별로 몇 번 받았나', `${막대}
  <p class="t-sub mt3">막대를 누르면 그 항목을 고른 후기만 아래에 남아요.</p>`,
    { more: 'MY0502', moreLabel: '항목별로 걸러 보기' })}

<div class="mt-block">
  ${U.tabs([
    { label: '받은 후기', cnt: REVIEWS.length, pane: 'rv0' },
    { label: '쓴 후기', cnt: MY_WRITTEN_REVIEWS.length, pane: 'rv1' },
  ], 0)}
  <div class="mt4">
    <div data-pane-body="rv0"><div class="stack">${REVIEWS.map((r) => 후기카드(r)).join('')}</div></div>
    <div data-pane-body="rv1" hidden><div class="stack">${MY_WRITTEN_REVIEWS.map((r) => 후기카드(r, { mine: true, act: false })).join('')}</div></div>
  </div>
</div>

${U.sec('', U.empty('💬', '아직 받은 후기가 없어요', '거래를 마치고 후기를 주고받으면 여기에 쌓여요.',
    U.btn('매물 보러 가기', { href: 'SE0201', cls: 'btn-pri' })), { desc: '후기가 하나도 없을 때는 이렇게 보여요.' })}

${상태들([['MY0502', '항목별 걸러 보기'], ['MY0503', '점수 변화 그래프'], ['MY0504', '비공개 후기'], ['MY0505', '안 쓴 후기 알림']])}`;

  return { body, o: {} };
}

/* ---- MY0502 항목별 걸러 보기 ---- */
function MY0502(ctx) {
  const 고른항목 = 항목순위[0][0];
  const 남은 = REVIEWS.filter((r) => (r.chips || []).includes(고른항목)).length;

  /* 막대를 «칩»으로 만든다 — app.js 의 거르개가 .chip 을 손잡이로 읽는다.
     「전체」 칩에는 열쇠를 주지 않는다(아무 열쇠도 안 걸린 상태가 곧 전체). */
  const 칩막대 = `<div class="chips" style="flex-direction:column;align-items:stretch;gap:6px">
    <button class="chip" type="button" data-filter="rvf" style="justify-content:space-between">전체</button>
    ${항목순위.map(([k, n]) => `<button class="chip${k === 고른항목 ? ' on' : ''}" type="button"
      data-filter="rvf" data-f-key="chip" data-f-val="${U.esc(k)}" style="justify-content:space-between">
      ${k}<span class="cnt">${n}</span></button>`).join('')}
  </div>`;

  const body = `
${U.pageHd('받은 후기 — 항목별 걸러 보기', '막대(칩)를 누르면 그 항목을 고른 후기만 남아요',
    `<div class="btns">${U.btn('전체 보기로 돌아가기', { href: 'MY0501', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['받은 후기', U.num(REVIEWS.length), { unit: '건', d: '아무것도 안 걸었을 때' }],
    ['지금 남은 건수', U.num(남은), { unit: '건', tone: 'k-acc', d: `「${고른항목}」를 고른 후기` }],
    ['고른 항목', '1', { unit: '개', tone: 'k-ok', d: '다시 누르면 전체로 돌아와요' }],
    ['항목 가짓수', U.num(항목순위.length), { unit: '개', tone: 'k-mut', d: '후기에서 고를 수 있는 말' }],
  ])}

${U.banner('acc', '📊', `<b>지금은 「${고른항목}」만 보고 있어요.</b>
  같은 칩을 한 번 더 누르거나 <b>전체</b>를 누르면 모든 후기가 돌아옵니다. 건수도 함께 다시 셉니다.`,
    { right: U.btn('전체 보기', { cls: 'btn-ghost btn-sm', attr: ' data-filter-reset="rvf"' }) })}

<div class="mt-block">${U.detailSplit(`
  ${U.tableBar(`<b data-filter-count="rvf">${남은}</b>건 <span class="t-sub">/ 모두 <span data-filter-total="rvf">${REVIEWS.length}</span>건</span>
    <span data-filter-applied="rvf" hidden style="margin-left:8px"></span>`,
    U.btn('내 프로필로', { href: 'MY0101', cls: 'btn-ghost btn-sm' }))}
  <div class="stack" data-filter-list="rvf">${REVIEWS.map((r) => 후기카드(r)).join('')}</div>
  <div data-filter-empty="rvf" hidden class="mt4">${U.empty('🔎', '그 항목을 고른 후기가 없어요',
    '다른 항목을 눌러 보세요.', U.btn('전체 보기', { cls: 'btn-pri', attr: ' data-filter-reset="rvf"' }))}</div>`,

  U.actPanel('항목으로 거르기', `<p class="t-sub mb3">누르면 그 항목을 고른 후기만 남아요.</p>${칩막대}`,
    U.btn('전체 보기', { cls: 'btn-ghost', attr: ' data-filter-reset="rvf"' }))
  + U.actPanel('막대로 보기', `<div class="bars">${항목순위.map(([k, n]) => `<div class="bar-row">
      <span class="nowrap t-sub" style="width:120px">${k}</span>
      ${U.progress(Math.round(n / 항목최대 * 100))}
      <span class="nowrap t-sub" style="width:28px;text-align:right">${n}</span></div>`).join('')}</div>`, ''))}</div>`;

  return { body, o: { state: `항목으로 거르는 중 — ${고른항목}` } };
}

/* ---- MY0503 점수 변화 그래프 ---- */
function MY0503(ctx) {
  const 달 = MANNER_HISTORY.map((h, i) => ({
    ...h, 변화: i === 0 ? null : Math.round((h.v - MANNER_HISTORY[i - 1].v) * 10) / 10,
    note: MY_MANNER_NOTES[h.m] || '',
  }));
  const 큰변화 = 달.filter((d) => d.변화 != null && Math.abs(d.변화) >= 1);

  const body = `
${U.pageHd('매너 점수 변화 그래프', '최근 6개월 월별 점수와, 크게 오르내린 달에 무슨 일이 있었는지',
    `<div class="btns">${U.btn('받은 후기로 돌아가기', { href: 'MY0501', cls: 'btn-ghost' })}${U.btn('근거 자세히', { href: 'MY0102', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['지금 점수', 나.manner.toFixed(1), { unit: '점', d: `${MANNER_HISTORY[0].m}에는 ${MANNER_HISTORY[0].v}이었어요` }],
    ['6개월 동안', `+${(MANNER_HISTORY[5].v - MANNER_HISTORY[0].v).toFixed(1)}`, { unit: '점', tone: 'k-ok', d: '꾸준히 올랐어요' }],
    ['가장 많이 오른 달', 큰변화.length ? 큰변화[0].m : '—', { tone: 'k-acc', d: 큰변화.length ? `+${큰변화[0].변화}점` : '' }],
    ['내린 달', U.num(달.filter((d) => d.변화 != null && d.변화 < 0).length), { unit: '번', tone: 'k-mut', d: '최근 6개월 동안' }],
  ])}

<div class="mt-block">${U.card('최근 6개월', 점수그래프(), { bdCls: '' })}</div>

<div class="mt-block">${U.dashTable(
    [{ t: '달', w: '92px' }, { t: '점수', w: '110px' }, { t: '변화', w: '110px' }, { t: '무슨 일이 있었나' }],
    달.map((d) => ({
      cells: [
        `<b>${d.m}</b>`,
        `<b class="nowrap">${d.v.toFixed(1)}점</b>`,
        d.변화 == null ? '<span class="t-sub">—</span>'
          : `<b class="nowrap" style="color:var(--${d.변화 >= 0 ? 'success' : 'danger'})">${d.변화 > 0 ? '+' : ''}${d.변화.toFixed(1)}</b>`,
        d.note ? `<span>${d.note}</span>` : '<span class="t-sub">눈에 띄는 일이 없었어요</span>',
      ],
    })))}</div>

${U.banner('info', '📈', `<b>점수는 천천히 움직입니다.</b>
  후기 한 건이 올리거나 내리는 폭은 작아요. 한 달에 1점 넘게 움직였다면 그 달에 무슨 일이 있었던 겁니다 —
  위 표의 「무슨 일이 있었나」를 보세요.`, { cls: 'mt-block' })}

${U.sec('점수가 내려간 달을 다시 보기', U.card('', `
  <p class="t-sub">7월에 아쉬운 후기를 한 건 받았어요. 그 뒤로는 응답 시간을 줄여 다시 올랐습니다.
  내려간 까닭을 알면 되돌릴 수 있어요.</p>
  <div class="btns mt3">${U.btn('아쉬운 후기 보기', { href: 'MY0501', cls: 'btn-ghost btn-sm' })}
    ${U.btn('점수 산정 근거', { href: 'MY0102', cls: 'btn-ghost btn-sm' })}</div>`))}`;

  return { body, o: { state: '최근 6개월 점수 변화' } };
}

/* ---- MY0504 비공개 후기 ---- */
function MY0504(ctx) {
  const 비공개 = REVIEWS.filter((r) => r.priv);
  const 공개 = REVIEWS.filter((r) => !r.priv);

  const body = `
${U.pageHd('받은 후기 — 비공개 후기', '자물쇠가 붙은 후기는 나에게만 보여요',
    `<div class="btns">${U.btn('받은 후기 전체', { href: 'MY0501', cls: 'btn-ghost' })}${U.btn('남이 볼 때 화면', { href: 'MY0105', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['비공개 후기', U.num(비공개.length), { unit: '건', tone: 'k-warn', d: '🔒 나에게만 보여요' }],
    ['공개 후기', U.num(공개.length), { unit: '건', tone: 'k-ok', d: '남의 화면에도 보여요', href: 'MY0105' }],
    ['매너 점수 반영', '그대로', { tone: 'k-acc', d: '공개든 비공개든 똑같이 셉니다', href: 'MY0102' }],
    ['내가 쓴 비공개', '0', { unit: '건', tone: 'k-mut', d: '쓸 때 체크하면 돼요', href: 'MY0405' }],
  ])}

${U.banner('warn', '🔒', `<b>비공개 후기는 남에게 보이지 않아요.</b>
  내 프로필을 보는 다른 이웃의 화면에는 나오지 않습니다. 그래도 <b>매너 점수에는 그대로 반영</b>돼요 —
  「안 보인다」와 「안 센다」는 다른 말입니다.`)}

<div class="mt-block">${U.tableBar(`<b>${비공개.length}</b>건 <span class="t-sub">· 비공개로 받은 후기만 모았어요</span>`,
    U.btn('전체 후기 보기', { href: 'MY0501', cls: 'btn-ghost btn-sm' }))}
<div class="stack">${비공개.length ? 비공개.map((r) => 후기카드(r)).join('')
    : U.empty('🔒', '비공개로 받은 후기가 없어요', '', '')}</div></div>

${U.sec('공개·비공개가 어떻게 다른가', U.dashTable(
    [{ t: '' }, { t: '공개 후기', w: '30%' }, { t: '비공개 후기', w: '30%' }],
    [
      { cells: ['<b>내 화면</b>', '보여요', '보여요 (🔒 표시)'] },
      { cells: ['<b>남이 볼 때</b>', '보여요', '<span class="t-sub">안 보여요</span>'] },
      { cells: ['<b>매너 점수</b>', '들어가요', '들어가요'] },
      { cells: ['<b>항목별 막대</b>', '쌓여요', '쌓여요'] },
      { cells: ['<b>신고</b>', '할 수 있어요', '할 수 있어요'] },
    ]))}`;

  return { body, o: { state: '비공개로 받은 후기만' } };
}

/* ---- MY0505 안 쓴 후기 알림 ---- */
function MY0505(ctx) {
  const 급한것 = MY_TODO_REVIEWS[0];

  const body = `
${U.pageHd('안 쓴 후기 알림', `아직 후기를 안 쓴 거래가 ${MY_TODO_REVIEWS.length}건 있어요`,
    `<div class="btns">${U.btn('받은 후기로', { href: 'MY0501', cls: 'btn-ghost' })}${U.btn('지금 쓰기', { href: 'MY0401', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['안 쓴 후기', U.num(MY_TODO_REVIEWS.length), { unit: '건', tone: 'k-warn', d: '내가 써야 상대 것도 열려요' }],
    ['가장 급한 것', `D-${급한것.left}`, { tone: 'k-danger', d: `${급한것.due}까지`, href: 'MY0401' }],
    ['쓸 수 있는 기간', '30', { unit: '일', tone: 'k-mut', d: '거래가 끝난 날부터' }],
    ['기한 지난 건', '0', { unit: '건', tone: 'k-ok', d: '아직 놓친 것이 없어요' }],
  ])}

${U.banner('warn', '⏰', `<b>기한이 지나면 후기를 쓸 수 없어요.</b>
  「${U.esc(itemBy(급한것.it).t)}」은 <b>D-${급한것.left}</b>(${급한것.due}까지)예요.
  기한이 지나면 상대가 나에게 쓴 후기도 공개되지 않습니다.`,
    { right: U.btn('지금 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' }) })}

<div class="mt-block">${U.tableBar(
    `<b>${MY_TODO_REVIEWS.length}</b>건 <span class="t-sub">· 기한이 가까운 차례로</span>`,
    U.btn('구매 내역에서 보기', { href: 'MY0203', cls: 'btn-ghost btn-sm' }))}
${U.dashTable(
    [{ t: '상대' }, { t: '물건' }, { t: '내 쪽', w: '120px' }, { t: '거래일', w: '100px' }, { t: '기한', w: '170px' }, { t: '', w: '140px' }],
    MY_TODO_REVIEWS.map((t) => {
      const u = userBy(t.with);
      const it = itemBy(t.it);
      return {
        data: { left: t.left },
        cells: [
          `<span class="row-c" style="gap:6px">${U.phAva(26, u.id)}<a href="${U.link('MY-01')}">${U.esc(u.nick)}</a> ${U.manner(u.manner)}</span>`,
          `<span class="row-c">${U.phItem(36, it.id)}<a class="strong" href="${U.link('SE-04')}">${U.esc(it.t)}</a></span>`,
          U.badge(t.side === '샀어요' ? '내가 샀어요' : '내가 팔았어요', t.side === '샀어요' ? 'b-pri' : 'b-acc'),
          `<span class="t-sub nowrap">2026-${t.at}</span>`,
          `<span class="nowrap">${t.due}까지 ${U.badge(`D-${t.left}`, t.left <= 7 ? 'b-danger' : 'b-warn')}</span>`,
          U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' }),
        ],
      };
    }))}</div>

${U.sec('왜 서로 써야 하나요', U.card('', `
  <p class="t-sub">이 장터에서는 <b>사는 쪽도 평가받아요.</b> 그래서 후기를 서로 씁니다.
  한쪽만 쓴 후기는 상대에게 보이지 않아요 — 상대의 후기를 보고 따라 쓰는 일을 막기 위해서입니다.</p>
  ${U.timeline([
    ['거래완료', '물건을 주고받았어요'],
    ['한쪽이 씀', '아직 아무에게도 안 보여요 — 「대기 중」'],
    ['둘 다 씀', '서로의 후기가 함께 공개돼요'],
    ['30일 지남', '안 쓴 쪽은 못 쓰고, 쓴 쪽 후기만 공개돼요'],
  ], 1)}`))}`;

  return { body, o: { state: `안 쓴 후기 ${MY_TODO_REVIEWS.length}건 · 가장 급한 것 D-${급한것.left}` } };
}

/* ══════════════════════════════════════════════════════════════
   MY-06  관심 키워드·알림 설정
   ══════════════════════════════════════════════════════════════ */
const 키워드칩 = (list) => `<div class="chips">${list.map((k) =>
  `<button class="chip on" type="button" data-toast="「${k.w}」 키워드를 지웠어요" data-toast-act="되돌리기">${k.w}<span class="cnt">지금 ${k.n}개</span> <span class="x">✕</span></button>`).join('')}</div>`;

const 알림표 = (o = {}) => U.dashTable(
  [{ t: '알림' }, { t: '언제 울리나' }, { t: '하루 몇 번', w: '110px' }, { t: '받기', w: '110px' }],
  MY_NOTI_KINDS.map((n) => ({
    cells: [
      n.on ? `<b>${n.k}</b>` : `<span style="opacity:.55"><b>${n.k}</b></span>`,
      n.on ? `<span class="t-sub">${n.d}</span>` : `<span style="opacity:.55" class="t-sub">${n.d}</span>`,
      n.on ? `<span class="nowrap">${n.day}번</span>` : `${U.badge('안 받아요', 'b-mut')}`,
      `<button class="toggle${n.on ? ' on' : ''}" type="button" role="switch" aria-checked="${n.on}" aria-label="${n.k} 알림"
        data-toast="${n.on ? `「${n.k}」 알림을 껐어요${n.keep ? ' — 메시지를 놓칠 수 있어요' : ''}` : `「${n.k}」 알림을 켰어요`}"><span class="kn"></span></button>`,
    ],
  })), o);

const 받는곳표 = () => U.dashTable(
  [{ t: '알림' }, ...MY_NOTI_CHANNELS.map((c) => ({ t: c, w: '110px' }))],
  MY_NOTI_KINDS.map((n) => ({
    cells: [
      n.on ? `<b>${n.k}</b>` : `<span style="opacity:.55">${n.k}</span>`,
      ...MY_NOTI_CHANNELS.map((c, i) => `<label class="check none" style="padding:0">
        <input type="checkbox"${n.on && i === 0 ? ' checked' : ''}${n.on ? '' : ' disabled'} aria-label="${n.k} ${c}"></label>`),
    ],
  })));

function MY0601(ctx) {
  const body = `
${U.pageHd('관심 키워드·알림 설정', '찾는 물건이 올라오면 알려드려요',
    `<div class="btns">${U.btn('내 프로필로', { href: 'MY0101', cls: 'btn-ghost' })}${U.btn('매물 보러 가기', { href: 'SE0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['관심 키워드', `${MY_KEYWORDS.length}`, { unit: `/ ${MY_KEYWORD_MAX}개`, d: '더 넣을 수 있어요', href: 'MY0602' }],
    ['저장한 검색 조건', U.num(MY_SAVED_SEARCH.length), { unit: '개', tone: 'k-acc', d: `켜 둔 것 ${MY_SAVED_SEARCH.filter((s) => s.on).length}개`, href: 'MY0603' }],
    ['켜 둔 알림', `${MY_NOTI_ON}`, { unit: `/ ${MY_NOTI_KINDS.length}가지`, tone: 'k-ok', d: '종류별로 끌 수 있어요', href: 'MY0604' }],
    ['하루 알림', U.num(MY_NOTI_PERDAY), { unit: '번', tone: 'k-warn', d: '20번을 넘으면 줄이는 게 좋아요' }],
  ])}

${U.card('관심 키워드', `
  <div class="searchbar mb3">
    <span class="ic">🔍</span>
    <input type="text" placeholder="찾는 물건 이름 (예: 무선청소기)" aria-label="관심 키워드 추가">
    ${U.btn('추가', { cls: 'btn-pri', attr: ' data-toast="키워드를 더했어요 · 이 말이 든 매물이 올라오면 알려드릴게요"' })}
  </div>
  ${키워드칩(MY_KEYWORDS)}
  <p class="t-sub mt3"><b>${MY_KEYWORDS.length} / ${MY_KEYWORD_MAX}개</b> 등록했어요.
    칩의 ✕ 를 누르면 지워지고, 칩을 누르면 조건(분류·가격·동네)을 붙일 수 있어요.</p>
  <div class="btns mt3">${U.btn('키워드 더 넣기·지우기', { href: 'MY0602', cls: 'btn-ghost btn-sm' })}
    ${U.btn('조건 붙이기', { href: 'MY0603', cls: 'btn-ghost btn-sm' })}</div>`)}

${U.sec('저장한 검색 조건', `<div class="stack-sm">
  ${MY_SAVED_SEARCH.map((s) => `<div class="cond-row">
    <span class="grow"><b>${s.k}</b> <span class="t-sub">· ${s.d}</span>
      <span class="badge b-mut">지금 ${s.n}개</span></span>
    <button class="toggle${s.on ? ' on' : ''}" type="button" role="switch" aria-checked="${s.on}" aria-label="${s.k} 알림 켜기"
      data-toast="${s.on ? `「${s.k}」 조건 알림을 껐어요` : `「${s.k}」 조건 알림을 켰어요`}"><span class="kn"></span></button>
    <button class="link quiet" type="button" data-toast="조건을 지웠어요" data-toast-act="되돌리기">지우기</button>
  </div>`).join('')}
</div>`, { desc: '검색하다가 「이 조건 저장」을 누르면 여기에 쌓여요.', more: 'MY0603', moreLabel: '조건 고치기' })}

${U.sec('무엇을 알려드릴까요', `${알림표()}
  <p class="t-sub mt3">끈 줄은 흐려지고 「안 받아요」로 바뀝니다. <b>채팅 알림은 끄면 메시지를 놓칠 수 있어요.</b></p>`,
    { more: 'MY0604', moreLabel: '토글 자세히 보기' })}

${U.sec('어디로 받을까요', `${받는곳표()}
  <p class="t-sub mt3">종류마다 받는 곳을 다르게 고를 수 있어요. 꺼 둔 알림은 받는 곳을 고를 수 없습니다.</p>`)}

<div class="mt-block">${U.card('방해 금지 시간', `
  <div class="row-c wrap-row" style="gap:12px">
    <select class="input" style="width:auto" aria-label="시작 시각"><option>${MY_QUIET.from}</option><option>23:00</option><option>00:00</option></select>
    <span>~</span>
    <select class="input" style="width:auto" data-sel-text="quiet" aria-label="끝 시각">
      <option value="07:00">07:00</option><option value="08:00" selected>08:00</option><option value="09:00">09:00</option></select>
  </div>
  <p class="t-sub mt3" data-sel-out="quiet" data-sel-map='{"07:00":"${MY_QUIET.from}부터 07:00 까지는 모아 뒀다가 아침 7시에 한 번에 보내드려요. 채팅 알림은 예외입니다.","08:00":"${MY_QUIET.from}부터 08:00 까지는 모아 뒀다가 아침 8시에 한 번에 보내드려요. 채팅 알림은 예외입니다.","09:00":"${MY_QUIET.from}부터 09:00 까지는 모아 뒀다가 아침 9시에 한 번에 보내드려요. 채팅 알림은 예외입니다."}'>${MY_QUIET.from}부터 ${MY_QUIET.to} 까지는 모아 뒀다가 아침 8시에 한 번에 보내드려요. 채팅 알림은 예외입니다.</p>
  <div class="btns mt3">${U.btn('방해 금지 시간 자세히', { href: 'MY0605', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

${MY_NOTI_PERDAY > 20 ? U.banner('warn', '🔔', `<b>하루 알림이 ${MY_NOTI_PERDAY}번이에요</b>
  <div class="t-sub mt1">「${MY_KEYWORDS[1].w}」 키워드가 하루 11번 울립니다. 가격 조건을 좁히면 줄어들어요.</div>`,
    { right: U.btn('조건 좁히기', { href: 'MY0603', cls: 'btn-ghost btn-sm' }), cls: 'mt-block' }) : ''}

${U.sec('최근 알림', `<div class="stack-sm">
  ${MY_NOTI_LOG.map((l) => `<div class="cond-row">
    <span class="t-sub nowrap" style="width:70px">${l.at}</span>
    <span class="grow">${U.esc(l.t)}</span>
    ${U.badge(l.k, 'b-mut')}</div>`).join('')}
</div>`, { desc: '최근에 실제로 보낸 알림 5건이에요.' })}

${상태들([['MY0602', '키워드 추가·삭제'], ['MY0603', '키워드 조건 붙이기'], ['MY0604', '알림 종류 토글'], ['MY0605', '방해 금지 시간']])}`;

  return { body, o: {} };
}

/* ---- MY0602 키워드 추가·삭제 ---- */
function MY0602(ctx) {
  const 꽉찬예시 = Array.from({ length: MY_KEYWORD_MAX }, (_, i) => ({ w: i < MY_KEYWORDS.length ? MY_KEYWORDS[i].w : `키워드 ${i + 1}`, n: 3 + (i % 9) }));

  const body = `
${U.pageHd('관심 키워드 — 추가·삭제', `${MY_KEYWORD_MAX}개까지 넣을 수 있어요`,
    `<div class="btns">${U.btn('알림 설정으로', { href: 'MY0601', cls: 'btn-ghost' })}${U.btn('조건 붙이기', { href: 'MY0603', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['등록한 키워드', `${MY_KEYWORDS.length}`, { unit: `/ ${MY_KEYWORD_MAX}개`, d: `${MY_KEYWORD_MAX - MY_KEYWORDS.length}개 더 넣을 수 있어요` }],
    ['걸리는 매물', U.num(MY_KEYWORDS.reduce((a, k) => a + k.n, 0)), { unit: '개', tone: 'k-acc', d: '지금 이 말이 든 매물' }],
    ['가장 많이 걸리는 말', MY_KEYWORDS[1].w, { tone: 'k-warn', d: `지금 ${MY_KEYWORDS[1].n}개 · 하루 11번 울려요` }],
    ['가장 적게 걸리는 말', MY_KEYWORDS[2].w, { tone: 'k-mut', d: `지금 ${MY_KEYWORDS[2].n}개` }],
  ])}

${U.card('키워드 넣기', `
  <div class="searchbar mb3">
    <span class="ic">🔍</span>
    <input type="text" placeholder="찾는 물건 이름 (예: 유모차)" aria-label="관심 키워드 추가">
    ${U.btn('추가', { cls: 'btn-pri', attr: ' data-toast="「유모차」를 더했어요 · 지금 7개가 걸려요"' })}
  </div>
  <p class="t-sub">넣자마자 <b>지금 이 말이 든 매물 수</b>를 세어 칩 옆에 적어 드려요.
  다음에 새로 올라오면 알림이 갑니다.</p>`)}

<div class="mt-block">${U.card(`등록한 키워드 <span class="badge b-mut">${MY_KEYWORDS.length} / ${MY_KEYWORD_MAX}</span>`, `
  ${키워드칩(MY_KEYWORDS)}
  <p class="t-sub mt3">칩의 <b>✕</b> 를 누르면 그 키워드만 지워져요. 지운 뒤에는 그 말로 알림이 오지 않습니다.</p>`)}</div>

${U.banner('warn', '✋', `<b>${MY_KEYWORD_MAX}개를 넘기면 더 넣을 수 없어요.</b>
  아래는 ${MY_KEYWORD_MAX}개를 다 채웠을 때의 모습입니다. [추가] 단추가 잠기고 안내가 뜹니다.`, { cls: 'mt-block' })}

${U.card(`${MY_KEYWORD_MAX}개를 다 채웠을 때`, `
  <div class="searchbar mb3">
    <span class="ic">🔍</span>
    <input type="text" placeholder="더 넣을 수 없어요" aria-label="관심 키워드 추가 (잠김)" disabled>
    ${U.btn('추가', { cls: 'btn-pri', off: true })}
  </div>
  <p class="help err">키워드는 ${MY_KEYWORD_MAX}개까지예요. 하나를 지우면 다시 넣을 수 있어요.</p>
  <div class="chips mt3" data-band-pick>
    ${꽉찬예시.slice(0, 12).map((k) => `<span class="chip">${k.w}<span class="cnt">${k.n}</span></span>`).join('')}
    <span class="chip">… 그 밖에 ${MY_KEYWORD_MAX - 12}개</span>
  </div>`)}

${U.sec('키워드를 잘 고르는 법', U.card('', `
  <ul class="t-sub" style="padding-left:18px;line-height:1.9">
    <li><b>너무 넓은 말은 피하세요.</b> 「의자」보다 「캠핑 의자」가 알림이 적습니다.</li>
    <li>모델 이름을 넣으면 정확해요 — 「아이패드 10세대」처럼요.</li>
    <li>알림이 잦으면 <b>조건(분류·가격·동네)</b>을 붙여 좁히세요.</li>
  </ul>
  <div class="btns mt3">${U.btn('조건 붙이러 가기', { href: 'MY0603', cls: 'btn-ghost btn-sm' })}</div>`))}`;

  return { body, o: { state: `키워드 ${MY_KEYWORDS.length} / ${MY_KEYWORD_MAX}개` } };
}

/* ---- MY0603 키워드 조건 붙이기 ---- */
function MY0603(ctx) {
  const 본문 = `
${U.card('「무선청소기」에 조건 붙이기', `
  <div class="row wrap-row" style="gap:12px">
    <select class="input" style="flex:1 1 200px" data-recalc="kw" aria-label="분류">
      <option data-vals="41">모든 분류</option>
      ${CATS.map((c) => `<option${c.nm === '생활가전' ? ' selected' : ''} data-vals="${Math.max(1, Math.round(c.n / 96))}">${c.nm}</option>`).join('')}
    </select>
    <input class="input" style="flex:1 1 150px" type="number" placeholder="최저 가격" aria-label="최저 가격">
    <input class="input" style="flex:1 1 150px" type="number" placeholder="최고 가격" value="300000" aria-label="최고 가격">
    <select class="input" style="flex:1 1 180px" data-recalc="kwTown" aria-label="동네 범위">
      ${TOWNS.ranges.map((r, i) => `<option${i === 0 ? ' selected' : ''} data-vals="${r.k}">${r.k} (${U.num(r.n)}개)</option>`).join('')}
    </select>
  </div>
  <p class="t-sub mt4"><b data-recalc-out="kwTown" data-i="0">${TOWNS.ranges[0].k}</b> 안에서 이 조건이면
    지금 <b data-recalc-out="kw" data-i="0">9</b>개가 걸립니다.
    <span class="t-sub">— 조건을 좁힐수록 알림이 줄어요.</span></p>`)}

<div class="mt-block">${U.card('조건을 좁히면 얼마나 줄어드나', U.dashTable(
    [{ t: '조건' }, { t: '걸리는 매물', w: '130px' }, { t: '하루 알림', w: '130px' }],
    [
      { cells: ['<span class="t-sub">조건 없음 — 「무선청소기」만</span>', '<b>41개</b>', '하루 11번'] },
      { cells: ['<span class="t-sub">+ 분류 «생활가전»</span>', '<b>9개</b>', '하루 3번'] },
      { cells: ['<span class="t-sub">+ 30만원 이하</span>', '<b>6개</b>', '하루 2번'] },
      { cells: ['<b>+ 내 동네</b>', '<b>3개</b>', '<b>하루 1번</b>'] },
    ]))}</div>

<div class="mt-block">${U.card('저장한 검색 조건', `<div class="stack-sm">
  ${MY_SAVED_SEARCH.map((s) => `<div class="cond-row">
    <span class="grow"><b>${s.k}</b> <span class="t-sub">· ${s.d}</span> ${U.badge(`지금 ${s.n}개`, 'b-mut')}</span>
    <button class="toggle${s.on ? ' on' : ''}" type="button" role="switch" aria-checked="${s.on}" aria-label="${s.k} 알림"><span class="kn"></span></button>
    <button class="link quiet" type="button" data-toast="조건을 지웠어요" data-toast-act="되돌리기">지우기</button>
  </div>`).join('')}
</div>`)}</div>`;

  const 패널 = U.actPanel('이 조건으로', `
    ${U.kv([
    ['키워드', '무선청소기'],
    ['분류', '생활가전'],
    ['가격', '30만원 이하'],
    ['동네', TOWNS.ranges[0].k],
    ['걸리는 매물', '<b>3개</b>'],
  ])}
    <p class="t-sub mt3">저장하면 이 조건에 맞는 매물이 올라올 때만 알려드려요.</p>`,
  U.btn('조건 저장', { cls: 'btn-pri btn-lg', attr: ' data-toast="조건을 저장했어요 · 이제 하루 1번쯤 울립니다" data-toast-kind="ok"' })
    + U.btn('조건 지우기', { cls: 'btn-quiet', attr: ' data-toast="조건을 지웠어요 — 키워드만 남습니다" data-toast-act="되돌리기"' })
    + U.btn('알림 설정으로', { href: 'MY0601', cls: 'btn-ghost' }))
    + U.actPanel('알림이 잦다면', '<p class="t-sub">조건을 좁히거나 방해 금지 시간을 늘려 보세요.</p>',
      U.btn('알림 종류 고르기', { href: 'MY0604', cls: 'btn-ghost' })
      + U.btn('방해 금지 시간', { href: 'MY0605', cls: 'btn-ghost' }));

  const body = `
${U.pageHd('키워드 조건 붙이기', '분류·가격·동네를 붙이면 걸리는 매물 수가 다시 계산돼요')}

${U.kpis([
    ['조건 없이', '41', { unit: '개', d: '「무선청소기」만 넣었을 때' }],
    ['조건을 붙이면', '3', { unit: '개', tone: 'k-ok', d: '생활가전 · 30만원 이하 · 내 동네' }],
    ['하루 알림', '1', { unit: '번', tone: 'k-acc', d: '11번에서 1번으로 줄어요' }],
    ['저장한 조건', U.num(MY_SAVED_SEARCH.length), { unit: '개', tone: 'k-mut', d: '켜고 끌 수 있어요', href: 'MY0601' }],
  ])}

${U.detailSplit(본문, 패널)}`;

  return { body, o: { state: '무선청소기 — 조건 붙이는 중' } };
}

/* ---- MY0604 알림 종류 토글 ---- */
function MY0604(ctx) {
  const 꺼진것 = MY_NOTI_KINDS.filter((n) => !n.on);

  const body = `
${U.pageHd('알림 종류 토글', '종류별로 켜고 끌 수 있어요',
    `<div class="btns">${U.btn('알림 설정으로', { href: 'MY0601', cls: 'btn-ghost' })}${U.btn('방해 금지 시간', { href: 'MY0605', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['켜 둔 알림', `${MY_NOTI_ON}`, { unit: `/ ${MY_NOTI_KINDS.length}가지`, tone: 'k-ok', d: '켜진 것만 울려요' }],
    ['꺼 둔 알림', U.num(꺼진것.length), { unit: '가지', tone: 'k-mut', d: 꺼진것.map((n) => n.k).join(' · ') }],
    ['하루 알림', U.num(MY_NOTI_PERDAY), { unit: '번', tone: 'k-warn', d: '켜 둔 것들을 다 더한 수' }],
    ['채팅 알림', '켜짐', { tone: 'k-danger', d: '끄면 메시지를 놓칠 수 있어요' }],
  ])}

${U.banner('dan', '💬', `<b>채팅 알림은 끄지 않는 게 좋아요.</b>
  거래는 «대화»로 이뤄집니다. 채팅 알림을 끄면 약속 잡자는 말이나 값 흥정을 놓쳐
  <b>거래가 그대로 멈춥니다.</b> 방해 금지 시간에도 채팅만은 예외로 보내드려요.`,
    { right: U.btn('방해 금지 시간 보기', { href: 'MY0605', cls: 'btn-ghost btn-sm' }) })}

<div class="mt-block">${U.tableBar(
    `<b>${MY_NOTI_ON}</b>가지 켜짐 <span class="t-sub">/ 모두 ${MY_NOTI_KINDS.length}가지 · 끈 줄은 흐려집니다</span>`,
    `${U.btn('모두 켜기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="모든 알림을 켰어요"' })}
     ${U.btn('꼭 필요한 것만', { cls: 'btn-pri btn-sm', attr: ' data-toast="채팅·거래 상태만 남기고 껐어요" data-toast-act="되돌리기"' })}`)}
${알림표()}</div>

${U.sec('끄면 무슨 일이 생기나', U.dashTable(
    [{ t: '알림' }, { t: '끄면' }, { t: '놓치는 것', w: '30%' }],
    [
      { cells: ['<b>새 매물 알림</b>', '관심 키워드 매물이 올라와도 안 울려요', '<span class="t-sub">먼저 본 이웃이 가져갈 수 있어요</span>'] },
      { cells: ['<b>찜한 물건 값 내림</b>', '값이 내려도 안 알려줘요', '<span class="t-sub">싸게 살 기회</span>'] },
      { cells: ['<b>채팅</b>', '새 메시지가 와도 안 울려요', `<b class="danger">약속·흥정을 놓쳐 거래가 멈춰요</b>`] },
      { cells: ['<b>거래 상태 바뀜</b>', '발송·도착·정산을 안 알려줘요', '<span class="t-sub">구매확정 기한을 놓칠 수 있어요</span>'] },
      { cells: ['<span style="opacity:.55"><b>후기 도착</b></span>', '<span style="opacity:.55">상대가 후기를 남겨도 안 울려요</span>', '<span class="t-sub">내가 쓸 차례인 줄 모르고 넘어가요</span>'] },
      { cells: ['<span style="opacity:.55"><b>공지·이벤트</b></span>', '<span style="opacity:.55">운영자 알림을 안 받아요</span>', '<span class="t-sub">규칙이 바뀐 것을 모를 수 있어요</span>'] },
    ]))}

${U.sec('어디로 받을까요', `${받는곳표()}
  <p class="t-sub mt3">꺼 둔 알림은 받는 곳을 고를 수 없어요 — 칸이 잠깁니다.</p>`)}`;

  return { body, o: { state: `${MY_NOTI_ON} / ${MY_NOTI_KINDS.length}가지 켜짐` } };
}

/* ---- MY0605 방해 금지 시간 ---- */
function MY0605(ctx) {
  const body = `
${U.pageHd('방해 금지 시간', '이 시간에는 알림을 모아 뒀다가 아침에 한 번에 보내드려요',
    `<div class="btns">${U.btn('알림 설정으로', { href: 'MY0601', cls: 'btn-ghost' })}${U.btn('알림 종류 고르기', { href: 'MY0604', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['방해 금지', `${MY_QUIET.from}~${MY_QUIET.to}`, { tone: 'k-acc', d: '하루 10시간' }],
    ['모아 두는 알림', U.num(MY_NOTI_PERDAY - 6), { unit: '번', tone: 'k-mut', d: '하루 알림에서 채팅을 뺀 나머지' }],
    ['예외', '채팅', { tone: 'k-danger', d: '급한 알림은 그대로 보내요', href: 'MY0604' }],
    ['보내는 시각', MY_QUIET.to, { tone: 'k-ok', d: '아침에 한 번에' }],
  ])}

${U.card('시각 정하기', `
  <div class="row-c wrap-row" style="gap:12px">
    <div><div class="lb mb2">시작</div>
      <select class="input" style="width:auto" aria-label="시작 시각">
        <option>21:00</option><option selected>${MY_QUIET.from}</option><option>23:00</option><option>00:00</option></select></div>
    <span style="padding-top:26px">~</span>
    <div><div class="lb mb2">끝</div>
      <select class="input" style="width:auto" data-sel-text="quiet2" aria-label="끝 시각">
        <option value="07:00">07:00</option><option value="08:00" selected>08:00</option><option value="09:00">09:00</option></select></div>
  </div>
  <p class="t-sub mt3" data-sel-out="quiet2" data-sel-map='{"07:00":"${MY_QUIET.from} ~ 07:00 — 하루 9시간 동안 모아 뒀다가 아침 7시에 한 번에 보내드려요.","08:00":"${MY_QUIET.from} ~ 08:00 — 하루 10시간 동안 모아 뒀다가 아침 8시에 한 번에 보내드려요.","09:00":"${MY_QUIET.from} ~ 09:00 — 하루 11시간 동안 모아 뒀다가 아침 9시에 한 번에 보내드려요."}'>${MY_QUIET.from} ~ ${MY_QUIET.to} — 하루 10시간 동안 모아 뒀다가 아침 8시에 한 번에 보내드려요.</p>`)}

<div class="mt-block">${U.card('시각이 겹치면', `
  <div class="row-c wrap-row" style="gap:12px">
    <select class="input err" style="width:auto" aria-label="시작 시각 (잘못된 예)"><option selected>08:00</option></select>
    <span>~</span>
    <select class="input err" style="width:auto" aria-label="끝 시각 (잘못된 예)"><option selected>07:00</option></select>
  </div>
  <p class="help err mt2">끝 시각이 시작 시각보다 빠르면 <b>하루를 넘겨 이어지는 시간</b>으로 봅니다.
    다만 <b>같은 시각</b>을 넣으면 하루 내내 방해 금지가 되어 받을 수 없어요 — 다시 골라 주세요.</p>
  <p class="t-sub mt3">밤 10시에 시작해 아침 8시에 끝나는 것처럼 «자정을 넘기는» 시간은 정상입니다.</p>`)}</div>

${U.banner('warn', '🚨', `<b>급한 알림은 방해 금지 시간에도 그대로 갑니다.</b>
  <b>채팅</b>과 <b>안전결제 기한 임박</b>은 예외예요. 약속 시간을 놓치거나 구매확정 기한을 넘기면
  되돌릴 수 없는 일이 생기기 때문입니다.`, { cls: 'mt-block' })}

${U.sec('무엇이 모아지고 무엇이 바로 오나', U.dashTable(
    [{ t: '알림' }, { t: '방해 금지 시간에는', w: '40%' }],
    [
      { cells: ['<b>채팅</b>', `${U.badge('바로 보내요', 'b-danger')} <span class="t-sub">거래가 멈추면 안 되니까요</span>`] },
      { cells: ['<b>안전결제 기한 임박</b>', `${U.badge('바로 보내요', 'b-danger')} <span class="t-sub">기한을 놓치면 자동 취소돼요</span>`] },
      { cells: ['<b>새 매물 알림</b>', `${U.badge('모아 뒀다 보내요', 'b-mut')} <span class="t-sub">아침 ${MY_QUIET.to}</span>`] },
      { cells: ['<b>찜한 물건 값 내림</b>', `${U.badge('모아 뒀다 보내요', 'b-mut')} <span class="t-sub">아침 ${MY_QUIET.to}</span>`] },
      { cells: ['<b>거래 상태 바뀜</b>', `${U.badge('모아 뒀다 보내요', 'b-mut')} <span class="t-sub">기한 임박은 예외</span>`] },
      { cells: ['<b>후기 도착 · 공지</b>', `${U.badge('모아 뒀다 보내요', 'b-mut')} <span class="t-sub">아침 ${MY_QUIET.to}</span>`] },
    ]))}

${U.sec('모아 둔 알림은 이렇게 옵니다', U.card('', `
  <div class="stack-sm">
    <div class="cond-row"><span class="t-sub nowrap" style="width:70px">${MY_QUIET.to}</span>
      <span class="grow"><b>밤사이 알림 4건</b> — 새 매물 3건 · 값 내림 1건</span>${U.badge('묶어 보냄', 'b-acc')}</div>
    <div class="cond-row"><span class="t-sub nowrap" style="width:70px">02:14</span>
      <span class="grow">민트초코님이 메시지를 보냈어요</span>${U.badge('바로 보냄', 'b-danger')}</div>
  </div>
  <p class="t-sub mt3">모아 둔 것은 <b>한 줄로 묶어</b> 보내드려요. 알림이 네 번 울리지 않습니다.</p>`),
    { more: 'MY0601', moreLabel: '최근 알림 보기' })}`;

  return { body, o: { state: `방해 금지 ${MY_QUIET.from}~${MY_QUIET.to}` } };
}

export const PAGES = {
  MY0101, MY0102, MY0103, MY0104, MY0105,
  MY0201, MY0202, MY0203, MY0204,
  MY0301, MY0302, MY0303, MY0304, MY0305,
  MY0401, MY0402, MY0403, MY0404, MY0405, MY0406,
  MY0501, MY0502, MY0503, MY0504, MY0505,
  MY0601, MY0602, MY0603, MY0604, MY0605,
};
