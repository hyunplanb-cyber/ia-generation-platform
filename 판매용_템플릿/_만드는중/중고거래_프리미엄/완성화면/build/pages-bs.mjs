/* BS 끌올·광고 — 14화면 (끌올하기 5 · 광고 상품 안내 4 · 내역 5)
   ⚠ 돈을 쓰는 화면이다. 무엇에 얼마를 쓰는지가 흐리면 안 된다.
     그리고 끌올한 글에는 반드시 「끌올」 배지가 붙는다 — 광고를 숨기지 않는다.

   ⚠ 레이아웃 B 대시보드형 —
       · 화면 맨 위는 «지표 카드 4개»(kpis). 히어로는 쓰지 않는다.
       · 목록은 표(dashTable). 열이 많으면 o.max 를 줘서 표 안쪽만 구르게 한다.
       · 상세는 detailSplit — 상태를 바꾸는 버튼은 «전부» 오른쪽 액션 패널에 모은다.
       · 좌측 세로 사이드바는 shell() 이 낸다. 여기서 또 만들지 않는다.
   ⚠ 링크는 짧은 이름(BS-03)이나 스펙팩 pageId(BS0302)로 적는다. link() 가 옮겨 준다.
   ⚠ 탭과 몸통은 «같은 상자» 안에 두고 속성은 data-pane 이다(data-panes 아니다). */
import {
  pageHd, kpis, dashTable, tableBar, detailSplit, actPanel,
  sec, card, box, banner, empty, accordion, table, kv, sumRows, progress,
  badge, stBadge, boostBadge, btn, chip, modal, modalStatic,
  esc, won, num, phItem, phMap,
} from './ui.mjs';
import {
  BOOSTS, AD_SLOTS, BOOST_LOG, MY_POINT, itemBy, ITEMS, ago,
  BS_MY_POSTS, BS_FREE_SEC, BS_FREE_CYCLE, BS_LAST_FREE, BS_NEXT_FREE, BS_FREE_USED_MONTH,
  BS_PLAN_META, BS_PAY_WAYS, BS_EST_CAT, BS_EST_RANGE, BS_EST_TERM,
  BS_REFUND_RULES, BS_STOP, BS_AD_BAN, BS_FAQ, BS_LOG_MORE,
  BS_PERF_DAYS, BS_BEFORE_AFTER, BS_RECEIPT,
} from './data.mjs';

/* ─────────────────────────────────────────────────────────────
   1. 숫자는 여기서 «세어» 낸다. 화면에 손으로 적지 않는다.
   ───────────────────────────────────────────────────────────── */
const 달 = (at) => Number(String(at).split('/')[0]);
const 날 = (at) => Number(String(at).split('/')[1]);
/** 내역 전체 — BOOST_LOG 는 고치지 않고 «이어 붙인다» */
const LOG = [...BOOST_LOG, ...BS_LOG_MORE].sort((a, b) => (달(b.at) * 100 + 날(b.at)) - (달(a.at) * 100 + 날(a.at)));
const 산것 = (rows) => rows.filter((r) => r.st !== '취소');
const 합 = (rows, k) => rows.reduce((a, r) => a + r[k], 0);
const 쓴돈 = (rows) => 합(산것(rows), 'price');

const 이번달 = LOG.filter((r) => 달(r.at) === 9);
const 지난달 = LOG.filter((r) => 달(r.at) === 8);

/** 내 판매글 — 지금 순위와 끌올 뒤 순위를 함께 들고 다닌다 */
const 내글 = BS_MY_POSTS.map((p) => ({ ...p, it: itemBy(p.item) }));
const 고른글 = 내글[3];                 // 기계식 키보드 — 148번째 → 3번째
const 고른상품 = BOOSTS[1];             // 하루 상단 고정 5,000원
const 모자란돈 = Math.max(0, 고른상품.price - MY_POINT);

/** 비교 표에 쓸 다섯 상품 — 끌올 3종 + 광고 자리 2종 */
const 상품전부 = [
  ...BOOSTS.map((b) => ({ k: b.k, price: b.price, keep: b.keep, exp: b.exp, d: b.d })),
  ...AD_SLOTS.map((a) => ({ k: a.k, price: a.price, keep: a.keep, exp: a.exp, d: '사업자 광고 자리' })),
].map((x) => ({ ...x, ...BS_PLAN_META[x.k], cpm: Math.round((x.price / x.exp) * 100) / 100 }));
const 비싼것 = [...상품전부].sort((a, b) => b.price - a.price)[0];

/* ─────────────────────────────────────────────────────────────
   2. 이 갈래에서만 쓰는 작은 조각
   ───────────────────────────────────────────────────────────── */
/** 카드를 «탭»으로 쓴다 — 눌러야 실제로 아래 몸통이 바뀐다.
   ⚠ 장치를 거는 것은 class="tab" 과 감싼 .tabs 다. 겉모습은 .planbox·.pickrow 가 맡는다.
     .tabs 의 밑줄·가로 스크롤은 여기서 꺼 둔다(카드 줄이라 밑줄이 필요 없다). */
function 카드탭(items, onIdx, o = {}) {
  const 틀 = o.cols
    ? `display:grid;grid-template-columns:repeat(${o.cols},minmax(0,1fr))`
    : 'display:flex;flex-direction:column';
  return `<div class="tabs" style="${틀};gap:var(--s3);border-bottom:0;margin-bottom:0;overflow:visible">
    ${items.map((it, i) => `<button class="tab ${o.cls || ''}${i === onIdx ? ' on' : ''}" type="button" data-pane="${it.pane}" style="text-align:left">${it.html}</button>`).join('')}
  </div>`;
}
const 몸통 = (key, body, on) => `<div data-pane-body="${key}"${on ? '' : ' hidden'}>${body}</div>`;
/** 탭과 몸통을 «한 상자»에 담는다 — app.js 가 눌린 탭의 부모 안에서만 몸통을 찾는다 */
const 탭상자 = (탭, 몸통들) => `<div>${탭}<div class="mt4">${몸통들}</div></div>`;

/** 지금 순위 → 끌올 뒤 순위 */
const 순위이동 = (now, after) => `<div class="rank-move">
  <div><span class="t-sub">지금</span><div class="t-sec">${num(now)}번째</div></div>
  <div class="arrow">→</div>
  <div><span class="t-sub">끌올 뒤</span><div class="t-sec" style="color:var(--pri-text)">${after}번째</div></div>
</div>`;

/** 가로 막대 한 줄 */
const 막대 = (라벨, pct, 값, kind) => `<div class="bar-row">
  <span style="flex:none;width:110px">${라벨}</span>${progress(pct, kind)}<b style="flex:none;width:84px;text-align:right">${값}</b></div>`;

/** 이 화면의 다른 상태들 — 3뎁스 화면으로 가는 길을 끊지 않는다 */
const 다른상태 = (list) => sec('이 화면의 다른 상태', `<div class="btns">${list.map(([id, t]) => btn(t, { href: id, cls: 'btn-ghost btn-sm' })).join('')}</div>`,
  { desc: '스펙팩이 정의한 세부 상태 화면입니다. 눌러서 그 상태의 화면을 볼 수 있어요.' });

/** 끌올 배지 고지 — 여러 화면에서 같은 말로 쓴다 */
const 배지고지 = () => banner('info', '📣', `<b>끌올한 글에는 「끌올」 배지가 붙어요</b>
  <div class="t-sub mt1">목록에서 ${boostBadge()} 이렇게 보입니다. 광고라는 것을 이웃에게 숨기지 않아요.</div>`);

/** 표 머리글을 눌러 정렬한다 — 누르면 «차례가 실제로 바뀐다».
   ⚠ 「눌러 정렬」이라고 써 놓고 아무 일도 안 일어나면 그건 거짓말이다.
     app.js 에는 표 머리글 정렬이 없다(칸 고르개 정렬만 있다). app.js 는 아홉 갈래가
     함께 쓰는 파일이라 손대지 않고, 이 화면이 제 장치를 o.after 로 들고 간다. */
const 정렬머리 = (k, lb, on, dir) => `<button class="bs-th" type="button" data-k="${k}" data-lb="${lb}"${on ? ` data-dir="${dir}"` : ''} style="background:none;border:0;padding:0;font:inherit;color:${on ? 'var(--pri-text)' : 'inherit'};cursor:pointer">${lb} <span class="ar">${on ? (dir === 'desc' ? '▼' : '▲') : '⇅'}</span></button>`;

const 정렬장치 = `<script>
(function(){
  function 숫자(v){ var n = Number(String(v == null ? '' : v).replace(/[^0-9.-]/g, '')); return isNaN(n) ? 0 : n; }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.bs-th') : null;
    if (!b) return;
    var tbl = b.closest('table'); if (!tbl) return;
    var tb = tbl.tBodies[0]; if (!tb) return;
    var k = b.getAttribute('data-k');
    var dir = b.getAttribute('data-dir') === 'desc' ? 'asc' : 'desc';
    Array.prototype.forEach.call(tbl.querySelectorAll('.bs-th'), function (x) {
      x.removeAttribute('data-dir');
      x.style.color = 'inherit';
      var a = x.querySelector('.ar'); if (a) a.textContent = '\\u21C5';
    });
    b.setAttribute('data-dir', dir);
    b.style.color = 'var(--pri-text)';
    var a = b.querySelector('.ar'); if (a) a.textContent = dir === 'desc' ? '\\u25BC' : '\\u25B2';
    Array.prototype.slice.call(tb.rows).sort(function (x, y) {
      var d = 숫자(x.getAttribute('data-' + k)) - 숫자(y.getAttribute('data-' + k));
      return dir === 'desc' ? -d : d;
    }).forEach(function (r) { tb.appendChild(r); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sort-col]'), function (x) { x.textContent = b.getAttribute('data-lb'); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sort-dir]'), function (x) { x.textContent = dir === 'desc' ? '높은순' : '낮은순'; });
  });
})();
</script>`;

/** 상품 비교 표 — BS-02 와 그 정렬 상태(BS0202)가 «같은 표»를 쓴다 */
function 비교표(정렬키, 방향) {
  const 머리 = [
    { t: '상품', w: '22%' },
    { t: 정렬머리('price', '값', 정렬키 === 'price', 방향), w: '13%' },
    { t: 정렬머리('keeph', '유지 기간', 정렬키 === 'keeph', 방향), w: '13%' },
    { t: '보이는 자리', w: '20%' },
    { t: 정렬머리('exp', '하루 예상 노출', 정렬키 === 'exp', 방향), w: '16%' },
    { t: 정렬머리('cpm', '한 번 보일 때', 정렬키 === 'cpm', 방향), w: '16%' },
  ];
  const 열 = 정렬키 === 'keeph' ? 'keepH' : 정렬키;
  const 정렬됨 = [...상품전부].sort((a, b) => (방향 === 'desc' ? b[열] - a[열] : a[열] - b[열]));
  const 행 = 정렬됨.map((x) => ({
    data: { price: x.price, keeph: x.keepH, exp: x.exp, cpm: x.cpm },
    cells: [
      `<b>${esc(x.k)}</b><div class="t-sub">${esc(x.d)}</div>`,
      `<b class="price">${won(x.price)}</b>`,
      `<span class="nowrap">${esc(x.keep)}</span>`,
      `<span class="t-sub">${esc(x.where)}</span>`,
      `<span class="nowrap">${num(x.exp)}회</span>`,
      `<span class="t-sub nowrap">${x.cpm}원</span>`,
    ],
  }));
  return dashTable(머리, 행, { max: '420px' });
}

/* ─────────────────────────────────────────────────────────────
   3. 화면
   ───────────────────────────────────────────────────────────── */
export const PAGES = {};

/* ══ BS-01 끌올하기 ═══════════════════════════════════════════ */

/** 무료 끌올 카드 — 남은 시간이 있으면 잠기고, 0이 되면 열린다.
   o.unlocked 를 주면 «0이 된 뒤» 모습으로 낸다. */
function 무료카드(o = {}) {
  const 잠김 = !o.unlocked;
  return card('무료 끌올', `
    <div class="row-b wrap-row">
      <div>
        <b class="t-card">${BS_FREE_CYCLE} 무료</b>
        <p class="t-sub mt1">${잠김
    ? `아직 <b data-count="${BS_FREE_SEC}">7:12:00</b> 남았어요. 시간이 되면 이 단추가 켜집니다.`
    : '지금 쓸 수 있어요. 누르면 목록 맨 위로 올라갑니다.'}</p>
      </div>
      ${잠김
    ? btn('무료로 끌올', { cls: 'btn-pri is-off', off: true, id: o.id || 'bs-free' })
    : btn('무료로 끌올', { cls: 'btn-pri', attr: ' data-toast="목록 3번째로 올라갔어요"' })}
    </div>
    <div class="mt3 t-sub">마지막 무료 끌올 ${BS_LAST_FREE} · 다음 ${BS_NEXT_FREE}</div>`);
}

/** 유료 상품 고르기 — 카드를 누르면 아래 몸통이 «실제로» 바뀐다 */
function 상품고르기(onIdx = 1) {
  const 순위 = [3, 2, 1];
  const 탭 = 카드탭(BOOSTS.map((b, i) => ({
    pane: 'plan' + i,
    html: `<span class="nm">${esc(b.k)}</span>
      <span class="pr">${won(b.price)}</span>
      <span class="t-sub">${esc(b.keep)}</span>
      <span class="t-sub mt2">${esc(b.d)}</span>
      <span class="exp">${num(b.exp)}회쯤 더 보여요</span>`,
  })), onIdx, { cols: 3, cls: 'planbox' });

  const 몸통들 = BOOSTS.map((b, i) => 몸통('plan' + i, `${box(`
    <div class="row-b wrap-row">
      <div><b class="t-card">${esc(b.k)}</b><p class="t-sub mt1">${esc(b.d)}</p></div>
      <div class="right"><div class="t-sec">${won(b.price)}</div><div class="t-sub">${esc(b.keep)}</div></div>
    </div>
    <div class="mt4">${kv([
    ['기간 동안 예상 노출', `<b>${num(b.exp)}회</b>`],
    ['한 번 보일 때', `${Math.round((b.price / b.exp) * 100) / 100}원`],
    ['보이는 자리', BS_PLAN_META[b.k].where],
    ['끌올 뒤 예상 순위', `<b style="color:var(--pri-text)">${순위[i]}번째</b>`],
  ])}</div>`)}
    <div class="mt3">${순위이동(고른글.rank, 순위[i])}</div>`, i === onIdx)).join('');

  return 탭상자(탭, 몸통들);
}

PAGES.BS0101 = () => {
  /* ① 올릴 글 고르기 — 누르면 «바로 아래»에서 순위 미리보기가 바뀐다 */
  const 글탭 = 카드탭(내글.map((p, i) => ({
    pane: 'post' + i,
    html: `<span class="row-c" style="gap:12px;width:100%">
      ${phItem(52, p.it.id)}
      <span class="mid"><b>${esc(p.it.t)}</b>
        <span class="met"><span class="k">${won(p.it.price)}</span><span class="k">조회 ${num(p.it.view)}</span><span class="k">${ago(p.it.min)}</span>${p.note ? badge(p.note, 'b-acc') : ''}</span></span>
      <span class="rank">지금 <b>${num(p.rank)}</b>번째</span></span>`,
  })), 3, { cls: 'pickrow' });
  const 글몸통 = 내글.map((p, i) => 몸통('post' + i, `${순위이동(p.rank, p.after)}
    <p class="t-sub mt2">${esc(p.it.t)} — ${esc(고른상품.k)}(${won(고른상품.price)})을 샀을 때 예상이에요.</p>`, i === 3)).join('');

  const 본문 = `
${sec('① 어느 글을 올릴까요', 탭상자(글탭, 글몸통), {
    desc: `내 판매중 글 ${내글.length}건. 카드를 누르면 「끌올 뒤 예상 순위」가 그 글 기준으로 다시 그려집니다.`,
    aside: btn('내 판매글 관리', { href: 'SL-05', cls: 'btn-ghost btn-sm' }),
  })}

${sec('② 무료 끌올', 무료카드(), {
    desc: `${BS_FREE_CYCLE} 무료입니다. 남은 시간이 0이 되면 단추가 켜져요.`,
    aside: btn('남은 시간 화면', { href: 'BS0102', cls: 'btn-ghost btn-sm' }),
  })}

${sec('③ 지금 바로 올리려면', 상품고르기(1), {
    desc: '카드를 누르면 값·유지 기간·예상 노출과 「끌올 뒤 예상 순위」가 바뀝니다.',
    aside: btn('상품 고르기 화면', { href: 'BS0103', cls: 'btn-ghost btn-sm' }),
  })}

${sec('광고 자리도 살 수 있어요', dashTable(
    [{ t: '자리', w: '28%' }, { t: '값', w: '16%' }, { t: '유지', w: '14%' }, { t: '보이는 자리' }, { t: '하루 예상 노출', w: '18%' }],
    AD_SLOTS.map((a) => [`<b>${esc(a.k)}</b>`, `<b class="price">${won(a.price)}</b>`, a.keep, `<span class="t-sub">${esc(a.where)}</span>`, `${num(a.exp)}회`]),
  ), { more: 'BS-02', moreLabel: '광고 상품·요금 자세히' })}

${sec('', 배지고지())}

${sec('최근 끌올 이력', dashTable(
    [{ t: '날짜', w: '14%' }, { t: '글' }, { t: '상품', w: '22%' }, { t: '값', w: '16%' }, { t: '상태', w: '12%' }],
    LOG.slice(0, 3).map((b) => [
      b.at,
      `<span class="row-c">${phItem(32, b.item)}<span>${esc(itemBy(b.item).t)}</span></span>`,
      esc(b.k),
      b.st === '취소' ? `<s class="muted">${won(b.price)}</s>` : won(b.price),
      stBadge(b.st),
    ]),
  ), { more: 'BS-03', moreLabel: '끌올·광고 내역 전체' })}

${다른상태([['BS0102', '무료 끌올 남은 시간'], ['BS0103', '유료 상품 고르기'], ['BS0104', '결제 진행 중'], ['BS0105', '끌올 완료']])}
`;

  const 액션 = `
${actPanel('고른 것', `
  <div class="row-c" style="gap:10px">${phItem(44, 고른글.it.id)}<b>${esc(고른글.it.t)}</b></div>
  <div class="mt3">${kv([
    ['상품', esc(고른상품.k)],
    ['값', `<b class="price">${won(고른상품.price)}</b>`],
    ['유지', esc(고른상품.keep)],
    ['예상 노출', `${num(고른상품.exp)}회`],
  ])}</div>
  <div class="mt3">${순위이동(고른글.rank, 2)}</div>`, '', { state: '판매중' })}

${actPanel('결제 수단', `
  ${BS_PAY_WAYS.map((w, i) => `<label class="check box${i === 2 ? ' on' : ''}" style="margin-bottom:8px">
    <input type="radio" name="bs-pay"${i === 2 ? ' checked' : ''}>
    <span><b>${esc(w.k)}</b><div class="t-sub">${esc(w.d)}</div></span></label>`).join('')}
  <div class="mt3">${sumRows([
    ['가진 포인트', `${num(MY_POINT)}P`],
    ['상품 값', won(고른상품.price)],
    ['포인트로 낼 것', `-${num(Math.min(MY_POINT, 고른상품.price))}P`],
  ], ['카드로 낼 것', won(모자란돈)])}</div>
  ${모자란돈 > 0 ? banner('warn', '⚠', `포인트가 <b>${won(모자란돈)}</b>만큼 모자라요. 모자란 만큼만 카드로 냅니다.`, { cls: 'mt3' }) : ''}`,
    btn('포인트 충전', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="충전 창은 서버가 연결되면 열립니다"' }))}

${actPanel('', '<p class="t-sub">누르면 결제창이 열리고, 결제가 끝나면 바로 목록에 반영돼요.</p>',
    `${btn(`${won(고른상품.price)} 결제하고 끌올하기`, { href: 'BS0104', cls: 'btn-pri btn-block btn-lg' })}
   ${btn('끌올 내역 보기', { href: 'BS-03', cls: 'btn-ghost btn-block btn-sm' })}`)}
`;

  const body = pageHd('끌올하기', '내 판매글을 목록 위로 올립니다',
    `<div class="btns">${btn('광고 상품 자세히', { href: 'BS-02', cls: 'btn-ghost' })}${btn('내 판매글로', { href: 'SL-05', cls: 'btn-ghost' })}</div>`)
    + kpis([
      ['내 판매중 글', num(내글.length), { unit: '건', d: '끌올할 수 있는 글', href: 'SL-05' }],
      ['무료 끌올까지', `<span data-count="${BS_FREE_SEC}">7:12:00</span>`, { tone: 'k-warn', d: `${BS_FREE_CYCLE} · 다음 ${BS_NEXT_FREE}`, href: 'BS0102' }],
      ['가진 포인트', num(MY_POINT), { unit: 'P', tone: 'k-acc', d: 모자란돈 > 0 ? `${won(모자란돈)} 모자라요` : '넉넉해요' }],
      ['이번 달 쓴 돈', num(쓴돈(이번달)), { unit: '원', tone: 'k-mut', d: `집행 ${산것(이번달).length}건`, href: 'BS-03' }],
    ])
    + detailSplit(본문, 액션);
  return { body, o: {} };
};

PAGES.BS0102 = () => {
  const 본문 = `
${sec('남은 시간', card('', `
  <div class="deadline">
    <div class="t-sub">다음 무료 끌올까지</div>
    <div class="big" data-count="${BS_FREE_SEC}">7:12:00</div>
    <div class="t-sub mt2">${BS_FREE_CYCLE} · 마지막 무료 끌올 ${BS_LAST_FREE} · 다음 ${BS_NEXT_FREE}</div>
  </div>
  <div class="mt4">${무료카드()}</div>
  <label class="check box mt3"><input type="checkbox" data-unlock="bs-free">
    <span><b>남은 시간이 0 이 된 뒤 모습 보기</b>
    <div class="t-sub">체크하면 위 단추의 잠금이 풀리고 색이 살아납니다 — 실제로는 시간이 0이 될 때 저절로 풀립니다.</div></span></label>`),
    { desc: '시간은 1초씩 실제로 줄어듭니다. 0이 되면 단추가 켜지고 색이 바뀝니다.' })}

${sec('두 가지 모습', `<div class="g2">
  ${card('① 남아 있을 때 (지금)', `
    ${btn('무료로 끌올', { cls: 'btn-pri btn-block is-off', off: true })}
    <p class="t-sub mt2">회색 · 눌리지 않음 · 옆에 남은 시간</p>`)}
  ${card('② 0이 된 뒤', `
    ${btn('무료로 끌올', { cls: 'btn-pri btn-block', attr: ' data-toast="목록 3번째로 올라갔어요"' })}
    <p class="t-sub mt2">주색 · 눌리며 · 「지금 쓸 수 있어요」</p>`)}
</div>`)}

${sec('', banner('info', '⏱', `<b>무료 끌올은 ${BS_FREE_CYCLE}입니다.</b>
  <div class="t-sub mt1">글이 여러 개여도 계정 기준으로 한 번입니다. 지금 바로 올리고 싶으면 유료 상품을 쓰세요.</div>`,
    { right: btn('유료 상품 보기', { href: 'BS0103', cls: 'btn-ghost btn-sm' }) }))}
`;

  const 액션 = `
${actPanel('무료 끌올', kv([
    ['주기', BS_FREE_CYCLE],
    ['이번 달 쓴 횟수', `${BS_FREE_USED_MONTH}회`],
    ['마지막', BS_LAST_FREE],
    ['다음', `<b>${BS_NEXT_FREE}</b>`],
  ]), `${btn('무료로 끌올', { cls: 'btn-pri btn-block is-off', off: true })}
   ${btn('지금 바로 올리기 (유료)', { href: 'BS0103', cls: 'btn-ghost btn-block' })}`, { state: '진행중' })}

${actPanel('', `<p class="t-sub">기다리지 않고 지금 올리려면 유료 상품을 쓰세요. 가장 싼 것은 ${won(BOOSTS[0].price)}입니다.</p>`,
    btn('끌올하기로 돌아가기', { href: 'BS-01', cls: 'btn-ghost btn-block btn-sm' }))}
`;

  const body = pageHd('무료 끌올 남은 시간', '24시간에 한 번 · 0이 되면 잠금이 풀립니다')
    + kpis([
      ['남은 시간', `<span data-count="${BS_FREE_SEC}">7:12:00</span>`, { tone: 'k-warn', d: '1초씩 실제로 줄어듭니다' }],
      ['주기', '24', { unit: '시간', d: '계정 기준 한 번' }],
      ['이번 달 쓴 횟수', String(BS_FREE_USED_MONTH), { unit: '회', tone: 'k-acc', d: '무료 끌올' }],
      ['다음 가능 시각', BS_NEXT_FREE, { tone: 'k-mut', d: `마지막 ${BS_LAST_FREE}` }],
    ])
    + detailSplit(본문, 액션);
  return { body, o: { state: '무료 끌올 잠김 · 남은 시간 7시간 12분' } };
};

PAGES.BS0103 = () => {
  const 순위 = [3, 2, 1];
  const 본문 = `
${sec('상품 고르기', 상품고르기(1), {
    desc: '카드를 누르면 값·유지 기간·예상 노출과 「끌올 뒤 예상 순위」가 그 자리에서 바뀝니다.',
  })}

${sec('세 상품을 나란히', dashTable(
    [{ t: '상품', w: '24%' }, { t: '값', w: '15%' }, { t: '유지 기간', w: '15%' }, { t: '예상 노출', w: '16%' }, { t: '한 번 보일 때', w: '15%' }, { t: '끌올 뒤 순위', w: '15%' }],
    BOOSTS.map((b, i) => [
      `<b>${esc(b.k)}</b>`,
      `<b class="price">${won(b.price)}</b>`,
      esc(b.keep),
      `${num(b.exp)}회`,
      `<span class="t-sub">${Math.round((b.price / b.exp) * 100) / 100}원</span>`,
      `<b style="color:var(--pri-text)">${순위[i]}번째</b>`,
    ]),
  ))}

${sec('', banner('warn', '💡', `<b>끌올을 해도 시세보다 비싸면 잘 안 팔려요.</b>
  <div class="t-sub mt1">더 많이 보이게 할 뿐입니다. 사진·설명·값을 먼저 손보시는 편이 낫습니다.</div>`))}

${sec('', 배지고지())}
`;

  const 액션 = `
${actPanel('고른 것', `
  <div class="row-c" style="gap:10px">${phItem(44, 고른글.it.id)}<b>${esc(고른글.it.t)}</b></div>
  <div class="mt3">${kv([
    ['고른 상품', `<b>${esc(고른상품.k)}</b>`],
    ['값', `<b class="price">${won(고른상품.price)}</b>`],
    ['유지', esc(고른상품.keep)],
    ['예상 노출', `${num(고른상품.exp)}회`],
  ])}</div>
  <div class="mt3">${순위이동(고른글.rank, 2)}</div>
  <p class="t-sub mt2">고른 것 <b>1개</b> — 하나도 안 고르면 아래 단추가 잠깁니다.</p>`,
    `${btn(`${won(고른상품.price)} 결제하기`, { href: 'BS0104', cls: 'btn-pri btn-block btn-lg' })}
   ${btn('무료 끌올 기다리기', { href: 'BS0102', cls: 'btn-ghost btn-block btn-sm' })}`, { state: '진행중' })}

${actPanel('아무것도 안 골랐을 때', '<p class="t-sub">고른 상품이 <b>0개</b>면 결제 단추가 이렇게 잠깁니다.</p>',
    btn('결제하기', { cls: 'btn-pri btn-block is-off', off: true }))}
`;

  const body = pageHd('유료 상품 고르기', '즉시 · 하루 · 일주일 — 고르면 그 자리에서 값과 순위가 바뀝니다')
    + kpis([
      ['고를 수 있는 상품', String(BOOSTS.length), { unit: '종', d: '즉시 · 하루 · 일주일' }],
      ['가장 싼 값', num(BOOSTS[0].price), { unit: '원', tone: 'k-acc', d: esc(BOOSTS[0].keep) }],
      ['가장 큰 노출', num(BOOSTS[2].exp), { unit: '회', tone: 'k-ok', d: esc(BOOSTS[2].keep) }],
      ['지금 내 글 순위', num(고른글.rank), { unit: '번째', tone: 'k-warn', d: esc(고른글.it.t) }],
    ])
    + detailSplit(본문, 액션);
  return { body, o: { state: `${고른상품.k} 고름 · ${won(고른상품.price)}` } };
};

PAGES.BS0104 = () => {
  const 본문 = `
${sec('결제창을 기다리는 중', modalStatic('결제창이 열렸어요', `
  <div class="center" style="padding:var(--s6) 0">
    <div style="font-size:40px">💳</div>
    <p class="t-card mt3">카드사 결제창에서 결제를 끝내 주세요</p>
    <p class="t-sub mt2">남은 시간 <b data-count="180">3:00</b> · 시간이 지나면 결제가 취소됩니다</p>
    <div class="mt4" style="max-width:320px;margin:0 auto">${progress(35)}</div>
  </div>
  <div class="mt4">${kv([
    ['글', esc(고른글.it.t)],
    ['상품', esc(고른상품.k)],
    ['결제 수단', `포인트 ${num(Math.min(MY_POINT, 고른상품.price))}P + 카드 ${won(모자란돈)}`],
    ['낼 돈', `<b class="price">${won(고른상품.price)}</b>`],
  ])}</div>`,
    `${btn('결제 진행 중…', { cls: 'btn-pri btn-block is-off', off: true })}
   <p class="t-sub mt2 center">단추는 결제가 끝날 때까지 잠겨 있습니다 — 두 번 눌러도 두 번 결제되지 않아요.</p>`),
    { desc: '결제창이 떠 있는 동안에는 이 화면이 잠깁니다.' })}

${sec('결제창을 닫았을 때', banner('dan', '⚠', `<b>결제가 끝나지 않았어요</b>
  <div class="t-sub mt1">결제창을 닫으셨거나 시간이 지났습니다. 돈은 빠져나가지 않았어요. 다시 시도하시겠어요?</div>`,
    { right: `<div class="btns">${btn('다시 결제', { href: 'BS-01', cls: 'btn-pri btn-sm' })}${btn('그만두기', { href: 'BS-03', cls: 'btn-ghost btn-sm' })}</div>` }))}

${sec('중복 결제를 막는 방법', card('', `<ul class="dots">
  <li>결제창이 열린 뒤에는 <b>[결제하기] 단추가 잠깁니다</b> — 두 번 눌러도 요청은 한 번만 갑니다.</li>
  <li>같은 글·같은 상품은 <b>3분 안에 다시 결제할 수 없습니다.</b></li>
  <li>결제가 끝나기 전에 화면을 새로 고쳐도 <b>진행 중인 결제 한 건</b>만 남습니다.</li>
  <li>돈이 빠져나갔는데 끌올이 안 됐다면 <b>자동으로 되돌려 드립니다.</b></li>
</ul>`))}
`;

  const 액션 = `
${actPanel('결제 중', kv([
    ['낼 돈', `<b class="price">${won(고른상품.price)}</b>`],
    ['상품', esc(고른상품.k)],
    ['글', esc(고른글.it.t)],
    ['남은 시간', '<b data-count="180">3:00</b>'],
  ]), `${btn('결제 진행 중…', { cls: 'btn-pri btn-block btn-lg is-off', off: true })}
   ${btn('결제 취소하고 돌아가기', { href: 'BS-01', cls: 'btn-ghost btn-block btn-sm' })}`, { state: '진행중' })}

${actPanel('', '<p class="t-sub">결제가 끝나면 바로 다음 화면에서 「목록 몇 번째로 올라갔는지」를 알려드려요.</p>',
    btn('결제가 끝난 뒤 화면 보기', { href: 'BS0105', cls: 'btn-ghost btn-block btn-sm' }))}
`;

  const body = pageHd('결제 진행 중', '결제창에서 결제를 끝내 주세요 — 이 화면은 잠겨 있습니다')
    + kpis([
      ['낼 돈', num(고른상품.price), { unit: '원', d: esc(고른상품.k) }],
      ['남은 시간', '<span data-count="180">3:00</span>', { tone: 'k-warn', d: '지나면 결제가 취소됩니다' }],
      ['결제 수단', '포인트+카드', { tone: 'k-acc', d: `${num(Math.min(MY_POINT, 고른상품.price))}P + ${won(모자란돈)}` }],
      ['중복 결제', '차단됨', { tone: 'k-mut', d: '단추가 잠겨 있어요' }],
    ])
    + detailSplit(본문, 액션);
  return { body, o: { state: '결제창 대기 중 · 단추 잠김' } };
};

PAGES.BS0105 = () => {
  /* 끌올한 내 글이 3번째로 올라온 «실제» 목록 미리보기 */
  const 미리 = (() => {
    const 남 = ITEMS.filter((x) => x.st === '판매중' && x.id !== 고른글.it.id).slice(0, 5);
    const 줄 = [];
    남.forEach((it, i) => {
      if (i === 2) 줄.push({ it: 고른글.it, me: true });
      줄.push({ it, me: false });
    });
    return 줄.slice(0, 6);
  })();

  const 본문 = `
${sec('', banner('ok', '🎉', `<b>목록 3번째로 올라갔어요</b>
  <div class="t-sub mt1">${esc(고른글.it.t)} — ${num(고른글.rank)}번째에서 3번째로 <b>${num(고른글.rank - 3)}칸</b> 올라갔습니다.</div>`,
    { right: btn('매물 목록에서 보기', { href: 'SE-02', cls: 'btn-ghost btn-sm' }) }))}

${sec('지금 목록은 이렇게 보여요', dashTable(
    [{ t: '', w: '52px' }, { t: '물건' }, { t: '동네', w: '120px' }, { t: '값', w: '120px' }, { t: '올라온 지', w: '96px' }],
    미리.map((r, i) => ({
      cls: r.me ? 'hl' : '',
      cells: [
        `<b style="color:${r.me ? 'var(--pri-text)' : 'var(--muted)'}">${i + 1}</b>`,
        `<span class="row-c">${phItem(32, r.it.id)}<span>${esc(r.it.t)} ${r.me ? boostBadge() : ''}</span></span>`,
        esc(r.it.town),
        `<b class="nowrap">${won(r.it.price)}</b>`,
        `<span class="t-sub nowrap">${r.me ? '방금' : ago(r.it.min)}</span>`,
      ],
    })),
  ), { desc: '끌올한 글에는 「끌올」 배지가 그대로 붙습니다 — 광고라는 것을 이웃에게 숨기지 않아요.' })}

${sec('다음 무료 끌올', card('', `
  <div class="row-b wrap-row">
    <div><b class="t-card">${BS_NEXT_FREE}</b><p class="t-sub mt1">${BS_FREE_CYCLE} 무료로 올릴 수 있어요.</p></div>
    ${btn('남은 시간 보기', { href: 'BS0102', cls: 'btn-ghost btn-sm' })}
  </div>`))}

${sec('', 배지고지())}
`;

  const 액션 = `
${actPanel('끌올 결과', kv([
    ['글', esc(고른글.it.t)],
    ['상품', esc(고른상품.k)],
    ['낸 돈', `<b class="price">${won(고른상품.price)}</b>`],
    ['지금 순위', '<b style="color:var(--pri-text)">3번째</b>'],
    ['유지', esc(고른상품.keep)],
  ]) + `<div class="mt3">${순위이동(고른글.rank, 3)}</div>`, `
  ${btn('끌올 내역 보기', { href: 'BS-03', cls: 'btn-pri btn-block btn-lg' })}
  ${btn('영수증 보기', { href: 'BS0304', cls: 'btn-ghost btn-block' })}
  ${btn('다른 글도 끌올하기', { href: 'BS-01', cls: 'btn-ghost btn-block btn-sm' })}`, { state: '완료' })}

${actPanel('다음 무료 끌올', `<div class="center"><div class="t-sec">${BS_NEXT_FREE}</div><p class="t-sub mt1">${BS_FREE_CYCLE}</p></div>`,
    btn('남은 시간 보기', { href: 'BS0102', cls: 'btn-ghost btn-block btn-sm' }))}
`;

  const body = pageHd('끌올 완료', '결제가 끝나고 목록에 반영됐습니다')
    + kpis([
      ['지금 순위', '3', { unit: '번째', tone: 'k-ok', d: `${num(고른글.rank)}번째에서 올라옴` }],
      ['올라간 칸', num(고른글.rank - 3), { unit: '칸', tone: 'k-acc', d: esc(고른글.it.t) }],
      ['기간 동안 예상 노출', num(고른상품.exp), { unit: '회', d: `${고른상품.k} · ${고른상품.keep}` }],
      ['다음 무료 끌올', BS_NEXT_FREE, { tone: 'k-mut', d: BS_FREE_CYCLE, href: 'BS0102' }],
    ])
    + detailSplit(본문, 액션);
  return { body, o: { state: '끌올 완료 · 목록 3번째' } };
};

/* ══ BS-02 광고 상품·요금 안내 ════════════════════════════════ */

PAGES.BS0201 = () => {
  const body = `
${pageHd('광고 상품·요금 안내', '끌올은 내 글을 목록 위로 올리는 것이고, 광고는 정해진 자리를 사는 것이에요',
    `<div class="btns">${btn('끌올하러 가기', { href: 'BS-01', cls: 'btn-pri' })}${btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost' })}</div>`)}

${kpis([
    ['상품', String(상품전부.length), { unit: '종', d: '끌올 3 · 광고 자리 2' }],
    ['가장 싼 값', num(BOOSTS[0].price), { unit: '원', tone: 'k-acc', d: esc(BOOSTS[0].k) }],
    ['가장 큰 노출', num(BOOSTS[2].exp), { unit: '회', tone: 'k-ok', d: `${BOOSTS[2].k} · ${BOOSTS[2].keep}` }],
    ['광고 배지', '100', { unit: '%', tone: 'k-warn', d: '모든 유료 노출에 붙습니다' }],
  ])}

${sec('상품 견주기', `
  ${tableBar(`<b>${상품전부.length}종</b> <span class="t-sub">· 열 머리글(값 · 유지 기간 · 하루 예상 노출 · 한 번 보일 때)을 누르면 차례가 바뀝니다</span>`,
    btn('정렬 상태 화면', { href: 'BS0202', cls: 'btn-ghost btn-sm' }))}
  ${비교표('price', 'asc')}`,
    { desc: '값은 크게, 조건은 작게 적었습니다. 「한 번 보일 때」가 실제로 싼지 비싼지를 가르는 값입니다.' })}

${sec('어디에 보이나요', card('', `
  ${phMap('노출 자리 도식 (목록 화면을 작게 그리고 상품 자리를 표시)', 600, 400)}
  <div class="g3 mt4">
    ${[['매물 목록 위쪽', '끌올·상단 고정이 붙는 자리', '끌올 3종'],
    ['검색 결과 첫 줄', '그 말로 찾은 사람에게 먼저', '검색 결과 상단'],
    ['카테고리 첫 화면', '그 분류를 여는 사람에게 먼저', '카테고리 첫 화면']]
    .map(([t, d, p]) => `<div class="box"><b>${t}</b><p class="t-sub mt1">${d}</p><div class="mt2">${badge(p, 'b-acc')}</div></div>`).join('')}
  </div>`))}

${sec('얼마나 보일지 미리 재보기', card('', `
  <div class="row wrap-row" style="gap:12px">
    <select class="input" style="flex:1 1 180px" aria-label="카테고리" data-recalc="est3"
      >${BS_EST_CAT.map((c, i) => `<option${i === 0 ? ' selected' : ''} value="${esc(c.nm)}" data-vals="${esc(c.nm)}|${c.mul}|${esc(c.d)}">${esc(c.nm)}</option>`).join('')}</select>
    <select class="input" style="flex:1 1 180px" aria-label="동네 범위" data-recalc="est2"
      >${BS_EST_RANGE.map((r, i) => `<option${i === 1 ? ' selected' : ''} value="${esc(r.nm)}" data-vals="${r.exp}|${r.cpm}">${esc(r.nm)}</option>`).join('')}</select>
    <select class="input" style="flex:1 1 180px" aria-label="기간" data-recalc="est"
      >${BS_EST_TERM.map((t, i) => `<option${i === 1 ? ' selected' : ''} value="${esc(t.nm)}" data-vals="${t.vals.join('|')}">${esc(t.nm)}</option>`).join('')}</select>
  </div>
  <div class="g3 mt4">
    <div class="box center"><div class="t-sec" data-recalc-out="est" data-i="0">${BS_EST_TERM[1].vals[0]}</div><div class="t-sub">기간 동안 예상 노출</div></div>
    <div class="box center"><div class="t-sec" data-recalc-out="est" data-i="1">${BS_EST_TERM[1].vals[1]}</div><div class="t-sub">드는 값</div></div>
    <div class="box center"><div class="t-sec" data-recalc-out="est" data-i="2">${BS_EST_TERM[1].vals[2]}</div><div class="t-sub">한 번 보일 때</div></div>
  </div>
  <p class="t-sub mt3">동네 범위를 바꾸면 하루 노출이 <b data-recalc-out="est2" data-i="0">${BS_EST_RANGE[1].exp}</b>,
    한 번 보일 때 <b data-recalc-out="est2" data-i="1">${BS_EST_RANGE[1].cpm}</b>으로 다시 계산돼요.</p>
  <p class="t-sub mt2"><b data-recalc-out="est3" data-i="0">${BS_EST_CAT[0].nm}</b> 분류는 같은 값으로
    <b data-recalc-out="est3" data-i="1">${BS_EST_CAT[0].mul}</b> 보입니다 —
    <span data-recalc-out="est3" data-i="2">${BS_EST_CAT[0].d}</span>.</p>`),
    { aside: btn('계산기 화면', { href: 'BS0203', cls: 'btn-ghost btn-sm' }) })}

${sec('정산·환불 규정', table(
    [{ t: '언제 그만두나', w: '34%' }, { t: '돌려받는 비율', w: '20%' }, { t: '위약금', w: '14%' }, { t: '비고' }],
    BS_REFUND_RULES.map((r) => [esc(r.when), `<b>${r.back}</b>`, r.fee, `<span class="t-sub">${esc(r.note)}</span>`]),
  ), { aside: btn('환불 계산 예시', { href: 'BS0204', cls: 'btn-ghost btn-sm' }), desc: '시작 전 취소는 전액, 시작 뒤는 남은 기간만큼 돌려드립니다.' })}

${sec('', 배지고지())}

${sec('쓸 수 없는 광고 문구', card('', `<div class="stack-sm">
  ${BS_AD_BAN.map((b) => `<div class="cond-row"><span class="grow"><b>${esc(b.t)}</b><div class="t-sub">${esc(b.why)}</div></span>${badge('금지', 'b-dan')}</div>`).join('')}
</div>`))}

${sec('사업자 광고와 개인 끌올은 다릅니다', `<div class="g2">
  ${card('개인 끌올', `<ul class="dots">
    <li>내가 올린 <b>중고 물건 한 건</b>을 목록 위로 올립니다</li>
    <li>본인인증만 하면 됩니다</li>
    <li>${won(BOOSTS[0].price)}부터</li>
    <li>「끌올」 배지가 붙습니다</li></ul>`)}
  ${card('사업자 광고', `<ul class="dots">
    <li><b>검색·카테고리 자리</b>를 삽니다</li>
    <li>사업자 등록 확인이 필요합니다</li>
    <li>${won(AD_SLOTS[0].price)}부터</li>
    <li>「광고」 표시 의무가 더 셉니다</li></ul>`)}
</div>`)}

${sec('자주 묻는 질문', accordion(BS_FAQ, 0), { more: 'CS-01', moreLabel: '고객센터 전체 질문' })}

${다른상태([['BS0202', '상품 비교 표 정렬'], ['BS0203', '예상 계산기'], ['BS0204', '환불 규정 펼치기']])}

<div class="btns center mt-block">
  ${btn('끌올하러 가기', { href: 'BS-01', cls: 'btn-pri btn-lg' })}
  ${btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost btn-lg' })}
</div>
`;
  return { body, o: { after: 정렬장치 } };
};

PAGES.BS0202 = () => {
  const body = `
${pageHd('상품 비교 표 정렬', '값 열을 눌러 「높은순」으로 세운 상태입니다',
    btn('안내 화면으로', { href: 'BS-02', cls: 'btn-ghost' }))}

${kpis([
    ['정렬 기준', '<span data-sort-col>값</span>', { d: '열 머리글을 누르면 바뀝니다' }],
    ['정렬 방향', '<span data-sort-dir>높은순</span>', { tone: 'k-acc', d: '한 번 더 누르면 낮은순' }],
    ['줄 세운 상품', String(상품전부.length), { unit: '종', tone: 'k-mut', d: '끌올 3 · 광고 자리 2' }],
    ['맨 위 상품', esc(비싼것.k), { tone: 'k-ok', d: won(비싼것.price) }],
  ])}

${sec('상품 비교 표', `
  ${tableBar('지금 <b data-sort-col>값</b> <b data-sort-dir>높은순</b> <span class="t-sub">· 고른 열 머리글은 색이 바뀌고 ▼▲ 로 방향을 보여 줍니다</span>',
    btn('계산기 화면', { href: 'BS0203', cls: 'btn-ghost btn-sm' }))}
  ${비교표('price', 'desc')}`,
    { desc: '값 · 유지 기간 · 하루 예상 노출 · 한 번 보일 때 — 네 열을 누를 수 있습니다. 누르면 표의 차례가 실제로 바뀝니다.' })}

${sec('눌러 보면', `<div class="g3">
  ${[['값 ▼', '비싼 상품부터 — 일주일 상단 고정이 맨 위'],
    ['하루 예상 노출 ▼', '많이 보이는 것부터 — 노출로 견줄 때'],
    ['한 번 보일 때 ▲', '싸게 보이는 것부터 — 실제 이득을 보는 눈']]
    .map(([t, d]) => `<div class="box"><b>${t}</b><p class="t-sub mt1">${d}</p></div>`).join('')}
</div>`)}

${sec('', banner('info', '↕', `<b>같은 표를 어느 열로 세우냐에 따라 답이 달라집니다.</b>
  <div class="t-sub mt1">값만 보면 즉시 끌올이 싸지만, 「한 번 보일 때」로 세우면 일주일 상단 고정이 가장 쌉니다
  (${BOOSTS[0].k} ${상품전부[0].cpm}원 · ${BOOSTS[2].k} ${상품전부[2].cpm}원).</div>`,
    { right: btn('끌올하러 가기', { href: 'BS-01', cls: 'btn-ghost btn-sm' }) }))}
`;
  return { body, o: { state: '값 열 · 높은순', after: 정렬장치 } };
};

PAGES.BS0203 = () => {
  const body = `
${pageHd('예상 계산기', '카테고리 · 동네 범위 · 기간을 고르면 예상 노출과 값이 다시 계산됩니다',
    btn('안내 화면으로', { href: 'BS-02', cls: 'btn-ghost' }))}

${kpis([
    ['기간 동안 예상 노출', `<span data-recalc-out="est" data-i="0">${BS_EST_TERM[1].vals[0]}</span>`, { d: '고른 기간 기준' }],
    ['드는 값', `<span data-recalc-out="est" data-i="1">${BS_EST_TERM[1].vals[1]}</span>`, { tone: 'k-acc', d: '부가세 포함' }],
    ['한 번 보일 때', `<span data-recalc-out="est" data-i="2">${BS_EST_TERM[1].vals[2]}</span>`, { tone: 'k-ok', d: '값 ÷ 노출' }],
    ['하루 노출 (동네 범위)', `<span data-recalc-out="est2" data-i="0">${BS_EST_RANGE[1].exp}</span>`, { tone: 'k-warn', d: '범위를 넓히면 늘어납니다' }],
  ])}

${sec('조건 고르기', card('', `
  <div class="row wrap-row" style="gap:12px">
    <label class="grow" style="flex:1 1 200px"><span class="lb">카테고리</span>
      <select class="input" data-recalc="est3"
        >${BS_EST_CAT.map((c, i) => `<option${i === 0 ? ' selected' : ''} value="${esc(c.nm)}" data-vals="${esc(c.nm)}|${c.mul}|${esc(c.d)}">${esc(c.nm)}</option>`).join('')}</select></label>
    <label class="grow" style="flex:1 1 200px"><span class="lb">동네 범위</span>
      <select class="input" data-recalc="est2"
        >${BS_EST_RANGE.map((r, i) => `<option${i === 1 ? ' selected' : ''} value="${esc(r.nm)}" data-vals="${r.exp}|${r.cpm}">${esc(r.nm)}</option>`).join('')}</select></label>
    <label class="grow" style="flex:1 1 200px"><span class="lb">기간</span>
      <select class="input" data-recalc="est"
        >${BS_EST_TERM.map((t, i) => `<option${i === 1 ? ' selected' : ''} value="${esc(t.nm)}" data-vals="${t.vals.join('|')}">${esc(t.nm)}</option>`).join('')}</select></label>
  </div>
  <div class="g3 mt4">
    <div class="box center"><div class="t-sec" data-recalc-out="est" data-i="0">${BS_EST_TERM[1].vals[0]}</div><div class="t-sub">기간 동안 예상 노출</div></div>
    <div class="box center"><div class="t-sec" data-recalc-out="est" data-i="1">${BS_EST_TERM[1].vals[1]}</div><div class="t-sub">드는 값</div></div>
    <div class="box center"><div class="t-sec" data-recalc-out="est" data-i="2">${BS_EST_TERM[1].vals[2]}</div><div class="t-sub">한 번 보일 때</div></div>
  </div>
  <p class="t-sub mt3"><b data-recalc-out="est3" data-i="0">${BS_EST_CAT[0].nm}</b> 분류는 같은 값으로
    <b data-recalc-out="est3" data-i="1">${BS_EST_CAT[0].mul}</b> 보입니다 —
    <span data-recalc-out="est3" data-i="2">${BS_EST_CAT[0].d}</span>.</p>
  <p class="t-sub mt2">동네 범위를 바꾸면 하루 노출이 <b data-recalc-out="est2" data-i="0">${BS_EST_RANGE[1].exp}</b>,
    한 번 보일 때 <b data-recalc-out="est2" data-i="1">${BS_EST_RANGE[1].cpm}</b>으로 바뀝니다.</p>`))}

${sec('조건별로 얼마나 다른가', `<div class="g2">
  ${card('동네 범위', `<div class="bars">${BS_EST_RANGE.map((r) => 막대(esc(r.nm), r.pct, r.exp, r.nm === '가까운 동네' ? 'acc' : '')).join('')}</div>
    <p class="t-sub mt2">넓힐수록 더 보이지만 한 번 보일 때 값도 올라갑니다 (${BS_EST_RANGE[0].cpm} → ${BS_EST_RANGE[2].cpm}).</p>`)}
  ${card('기간', `<div class="bars">${BS_EST_TERM.map((t) => 막대(esc(t.nm), t.pct, t.vals[0], t.nm === '7일' ? 'ok' : '')).join('')}</div>
    <p class="t-sub mt2">길수록 한 번 보일 때 값이 내려갑니다 (${BS_EST_TERM[0].vals[2]} → ${BS_EST_TERM[2].vals[2]}).</p>`)}
</div>`)}

${sec('카테고리별 경쟁', card('', `<div class="bars">
  ${BS_EST_CAT.map((c, i) => 막대(esc(c.nm), [100, 82, 62][i], c.mul, i === 0 ? 'acc' : '')).join('')}
</div>
<p class="t-sub mt3">매물이 많은 분류일수록 같은 값으로 더 자주 보입니다 — 대신 옆에 놓이는 경쟁 매물도 많습니다.</p>`))}

${sec('', banner('warn', '📐', `<b>여기 숫자는 «예상»입니다.</b>
  <div class="t-sub mt1">지난 4주 같은 조건의 평균으로 낸 값이라, 실제 노출은 요일과 시간대에 따라 달라집니다.</div>`,
    { right: btn('끌올하러 가기', { href: 'BS-01', cls: 'btn-ghost btn-sm' }) }))}
`;
  return { body, o: { state: '디지털기기 · 가까운 동네 · 24시간' } };
};

PAGES.BS0204 = () => {
  const 하루값 = Math.round(BS_STOP.paid / BS_STOP.totalDays);
  const body = `
${pageHd('환불 규정', '시작 전에는 전액, 시작 뒤에는 남은 기간만큼 돌려드립니다',
    btn('안내 화면으로', { href: 'BS-02', cls: 'btn-ghost' }))}

${kpis([
    ['시작 전 취소', '100', { unit: '%', tone: 'k-ok', d: '노출이 시작되기 전' }],
    ['시작 뒤', '남은 기간만큼', { tone: 'k-warn', d: '쓴 날은 하루로 셉니다' }],
    ['위약금', '0', { unit: '원', tone: 'k-acc', d: '떼는 돈이 없습니다' }],
    ['돌려받는 데', '3', { unit: '영업일', tone: 'k-mut', d: '결제 수단으로 되돌아갑니다' }],
  ])}

${sec('언제 그만두느냐에 따라', dashTable(
    [{ t: '언제 그만두나', w: '34%' }, { t: '돌려받는 비율', w: '20%' }, { t: '위약금', w: '14%' }, { t: '비고' }],
    BS_REFUND_RULES.map((r) => [`<b>${esc(r.when)}</b>`, `<b class="price">${r.back}</b>`, r.fee, `<span class="t-sub">${esc(r.note)}</span>`]),
  ), { desc: '규정 위반으로 내려간 광고만 돌려드리지 않습니다. 그 밖에는 모두 남은 기간만큼 돌아옵니다.' })}

${sec('계산 예시 — 일주일 상품을 이틀 쓰고 그만두면', card('', `
  ${table([{ t: '항목', w: '38%' }, { t: '셈' }, { t: '값', w: '22%' }], [
    ['낸 돈', `${esc(BS_STOP.k)} 한 건`, `<b>${won(BS_STOP.paid)}</b>`],
    ['하루치', `${won(BS_STOP.paid)} ÷ ${BS_STOP.totalDays}일`, won(하루값)],
    ['쓴 기간', `${BS_STOP.usedDays}일 (${BS_STOP.at} 시작 · 오늘까지)`, `-${won(하루값 * BS_STOP.usedDays)}`],
    ['남은 기간', `${BS_STOP.leftDays}일`, won(BS_STOP.paid - 하루값 * BS_STOP.usedDays)],
  ], { foot: ['돌려받는 돈', `${won(BS_STOP.paid)} × ${BS_STOP.leftDays}일 ÷ ${BS_STOP.totalDays}일`, `<b class="price">${won(BS_STOP.back)}</b>`] })}
  <p class="t-sub mt3">시간 단위까지 따져 계산하므로 위 표와 실제 금액이 몇 원 다를 수 있습니다.
    중단 화면에서 <b>확정 금액</b>을 먼저 보여드린 뒤 확인을 받습니다.</p>`),
    { aside: btn('중단 화면 보기', { href: 'BS0305', cls: 'btn-ghost btn-sm' }) })}

${sec('돌려받는 길', card('', `<ol class="dots">
  <li>내역 화면에서 진행 중인 건의 <b>[중단하기]</b>를 누릅니다</li>
  <li>돌려받을 금액을 확인하고 <b>확인</b>합니다 — 중단하면 되돌릴 수 없습니다</li>
  <li>결제한 수단으로 <b>3영업일 안</b>에 되돌아갑니다 (포인트는 즉시)</li>
  <li>현금영수증을 끊었다면 <b>자동으로 취소 처리</b>됩니다</li>
</ol>`), { aside: btn('내역으로', { href: 'BS-03', cls: 'btn-ghost btn-sm' }) })}

${sec('', banner('dan', '⚠', `<b>규정 위반으로 내려간 광고는 돌려드리지 않습니다.</b>
  <div class="t-sub mt1">금지 품목, 허위 문구, 바깥 거래 유도로 신고가 들어와 내려간 경우입니다.</div>`,
    { right: btn('금지되는 광고 문구', { href: 'BS-02', cls: 'btn-ghost btn-sm' }) }))}
`;
  return { body, o: { state: '환불 규정 펼침' } };
};

/* ══ BS-03 끌올·광고 내역 ═════════════════════════════════════ */

/** 내역 표 한 벌 — 여러 화면이 같은 모양으로 쓴다.
   ⚠ 열이 일곱이라 o.max 를 줘서 표 «안쪽»만 구르게 한다(안 그러면 화면 밖으로 삐져나간다). */
function 내역표(rows, o = {}) {
  const 행 = rows.map((b) => {
    const it = itemBy(b.item);
    return {
      data: { st: b.st, per: 달(b.at) === 9 ? '이번 달' : '지난 달' },
      cells: [
        `<span class="nowrap">${b.at}</span>`,
        `<span class="row-c">${phItem(32, it.id)}<span>${esc(it.t)}</span></span>`,
        esc(b.k),
        b.st === '취소'
          ? `<span class="muted"><s>${won(b.price)}</s><br><span style="font-size:12px">돌려받음</span></span>`
          : `<b class="nowrap">${won(b.price)}</b>`,
        stBadge(b.st),
        b.st === '취소' ? '<span class="muted">—</span>'
          : `<span class="t-sub nowrap">노출 ${num(b.exp)} · 클릭 ${num(b.clk)} · 채팅 ${b.chat}</span>`,
        `<div class="btns">
          <button class="btn btn-quiet btn-xs" type="button" data-toast="노출·클릭·채팅을 날짜별로 폈어요">성과</button>
          <button class="btn btn-quiet btn-xs" type="button" data-modal="rc">영수증</button>
          ${b.st === '진행중' ? '<button class="btn btn-quiet btn-xs" type="button" data-modal="stop">중단</button>' : ''}
        </div>`,
      ],
    };
  });
  return dashTable(
    [{ t: '날짜', w: '9%' }, { t: '글', w: '26%' }, { t: '상품', w: '14%' }, { t: '값', w: '11%' },
      { t: '상태', w: '9%' }, { t: '성과', w: '19%' }, { t: '', w: '12%' }],
    행,
    { max: '460px', listKey: o.listKey, foot: o.foot },
  );
}

/** 영수증·중단 모달 — 내역을 보여 주는 화면들이 함께 쓴다 */
const 영수증모달 = () => modal('rc', '영수증', kv([
  ['거래번호', BS_RECEIPT.no],
  ['결제 일시', BS_RECEIPT.at],
  ['상품', esc(BS_RECEIPT.k)],
  ['결제 수단', esc(BS_RECEIPT.way)],
  ['공급가', won(BS_RECEIPT.supply)],
  ['부가세', won(BS_RECEIPT.vat)],
  ['합계', `<b class="price">${won(BS_RECEIPT.total)}</b>`],
]) + `<div class="btns mt3">
  ${btn('현금영수증 신청', { cls: 'btn-ghost btn-sm', attr: ' data-toast="현금영수증을 신청했어요 (휴대폰 010-****-5678)"' })}
  ${btn('내려받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="영수증 PDF 내려받기는 서버가 연결되면 열립니다"' })}
</div>`, btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }) + btn('영수증 화면으로', { href: 'BS0304', cls: 'btn-pri' }));

const 중단모달 = () => modal('stop', '광고를 중단할까요?', `
  <p class="t-sub mb3">지금 중단하면 남은 기간(${BS_STOP.leftDays}일)만큼 돌려드려요.</p>
  ${sumRows([
  ['낸 돈', won(BS_STOP.paid)],
  ['쓴 기간', `${BS_STOP.usedDays}일 / ${BS_STOP.totalDays}일`],
  ['남은 기간', `${BS_STOP.leftDays}일`],
], ['돌려받는 돈', won(BS_STOP.back)])}
  <p class="t-sub mt3">한 번 중단하면 <b>되돌릴 수 없어요.</b> 다시 하려면 새로 사야 합니다.</p>`,
  btn('그냥 둘게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
  + btn('자세히 보기', { href: 'BS0305', cls: 'btn-ghost' })
  + btn('중단하기', { cls: 'btn-danger', attr: ` data-dismiss data-toast="광고를 중단했어요 · ${won(BS_STOP.back)}이 돌아옵니다"` }));

PAGES.BS0301 = () => {
  const 기간옵션 = [
    { nm: '이번 달', rows: 이번달, val: '이번 달' },
    { nm: '지난 달', rows: 지난달, val: '지난 달' },
    { nm: '전체', rows: LOG, val: '' },
    { nm: '직접 지정 (8/1~8/10)', rows: [], val: '8월 초' },
  ];
  const vals = (o) => [won(쓴돈(o.rows)), `${산것(o.rows).length}건`, `${num(합(o.rows, 'exp'))}회`, o.nm].join('|');

  const body = `
${pageHd('끌올·광고 내역', '쓴 돈과 그 결과를 한 화면에서 봅니다',
    `<div class="btns">${btn('끌올하러 가기', { href: 'BS-01', cls: 'btn-pri' })}${btn('내 판매글로', { href: 'SL-05', cls: 'btn-ghost' })}</div>`)}

${kpis([
    ['<span data-recalc-out="hist" data-i="3">이번 달</span> 쓴 돈', `<span data-recalc-out="hist" data-i="0">${won(쓴돈(이번달))}</span>`, { d: '취소한 건은 빼고 셉니다' }],
    ['집행 건수', `<span data-recalc-out="hist" data-i="1">${산것(이번달).length}건</span>`, { tone: 'k-acc', d: `전체 ${LOG.length}건 중` }],
    ['노출', `<span data-recalc-out="hist" data-i="2">${num(합(이번달, 'exp'))}회</span>`, { tone: 'k-ok', d: `클릭 ${num(합(이번달, 'clk'))}회` }],
    ['광고한 글이 받은 채팅', String(BS_BEFORE_AFTER.x), { unit: '배', tone: 'k-warn', d: `안 한 글 ${BS_BEFORE_AFTER.beforeChat}건 → ${BS_BEFORE_AFTER.afterChat}건` }],
  ])}

${sec('', banner('ok', '📈', `<b>광고한 글은 평균 ${BS_BEFORE_AFTER.x}배 더 채팅을 받았어요</b>
  <div class="t-sub mt1">끌올하지 않은 내 글은 평균 ${BS_BEFORE_AFTER.beforeChat}건, 끌올한 글은 ${BS_BEFORE_AFTER.afterChat}건이었습니다.</div>`,
    { right: btn('성과 자세히', { href: 'BS0303', cls: 'btn-ghost btn-sm' }) }))}

${sec('내역', `
  <div class="row wrap-row mb4" style="gap:12px;align-items:flex-end">
    <label style="flex:0 1 280px"><span class="lb">기간</span>
      <select class="input" data-filter="hist" data-f-key="per" data-recalc="hist">
        ${기간옵션.map((o, i) => `<option${i === 0 ? ' selected' : ''} value="${esc(o.val)}" data-vals="${esc(vals(o))}">${esc(o.nm)}</option>`).join('')}
      </select></label>
    <div class="grow"><span class="lb">상태</span>
      <div class="chips">${['전체', '진행중', '끝남', '취소'].map((t, i) =>
    chip(t, i === 0, `data-filter="hist" data-f-key="st"${t === '전체' ? '' : ` data-f-val="${t}"`}`)).join('')}</div></div>
  </div>

  ${tableBar(`<b><span data-filter-count="hist">${이번달.length}</span>건</b> <span class="t-sub">/ 전체 <span data-filter-total="hist">${LOG.length}</span>건 · 기간과 상태를 고르면 표가 실제로 줄어듭니다</span>`,
    `${btn('기간 고르기 화면', { href: 'BS0302', cls: 'btn-ghost btn-sm' })}${btn('영수증 화면', { href: 'BS0304', cls: 'btn-ghost btn-sm' })}`)}

  ${내역표(LOG, { listKey: 'hist' })}
  <div data-filter-empty="hist" hidden class="mt4">
    ${empty('🧾', '아직 끌올한 적이 없어요', '고른 기간에 집행한 끌올·광고가 없습니다. 기간을 넓혀 보시거나 지금 끌올해 보세요.',
    `${btn('끌올하러 가기', { href: 'BS-01', cls: 'btn-pri' })}${btn('광고 상품 보기', { href: 'BS-02', cls: 'btn-ghost' })}`)}
  </div>`,
    { desc: '상태 배지는 셋으로 갈라 둡니다 — 진행중 · 끝남 · 취소. 진행 중인 건에만 [중단] 단추가 붙습니다.' })}

${sec('행을 펼치면 성과가 나옵니다', accordion([{
    q: `9/10 · ${esc(itemBy(BS_STOP.item).t)} · ${esc(BS_STOP.k)} — 성과 보기`,
    a: `${phMap('성과 추이 차트 (날짜별 노출·클릭·채팅 막대)', 800, 260)}
      ${table([{ t: '날짜', w: '22%' }, { t: '노출' }, { t: '클릭' }, { t: '채팅' }, { t: '광고', w: '16%' }],
      BS_PERF_DAYS.map((d) => [d.d, num(d.exp), num(d.clk), `${d.chat}건`, d.ad ? badge('집행', 'b-acc') : '<span class="muted">—</span>']),
      { foot: ['합계', num(합(BS_PERF_DAYS, 'exp')), num(합(BS_PERF_DAYS, 'clk')), `${합(BS_PERF_DAYS, 'chat')}건`, ''] })}`,
  }], 0), { aside: btn('성과 펼치기 화면', { href: 'BS0303', cls: 'btn-ghost btn-sm' }) })}

${sec('영수증·중단', card('', `<p class="t-sub">표의 [영수증]·[중단] 단추를 누르면 모달이 뜹니다. 각각 따로 펼쳐 둔 화면도 있어요.</p>
  <div class="btns mt3">
    ${btn('영수증 보기 화면', { href: 'BS0304', cls: 'btn-ghost btn-sm' })}
    ${btn('진행 중 중단 화면', { href: 'BS0305', cls: 'btn-ghost btn-sm' })}
    ${btn('환불 규정', { href: 'BS0204', cls: 'btn-ghost btn-sm' })}
  </div>`))}

${다른상태([['BS0302', '기간 고르기'], ['BS0303', '성과 펼치기'], ['BS0304', '영수증 보기'], ['BS0305', '진행 중 중단']])}
`;
  return { body, o: { after: 영수증모달() + 중단모달() } };
};

PAGES.BS0302 = () => {
  const 기간들 = [
    { key: '이번 달', rows: 이번달, note: '9/1 ~ 9/11' },
    { key: '지난 달', rows: 지난달, note: '8/1 ~ 8/31' },
    { key: '직접 지정', rows: [], note: '8/1 ~ 8/10 으로 잡았을 때' },
  ];
  const vals = (g) => [won(쓴돈(g.rows)), `${산것(g.rows).length}건`, `${num(합(g.rows, 'exp'))}회`, g.key].join('|');

  const 검산 = (g) => {
    const r = 산것(g.rows);
    if (!r.length) return '<div class="box mt4"><b>검산</b> <span class="t-sub">— 집행한 건이 없어 합계는 0원입니다. 행이 없으니 더할 것도 없습니다.</span></div>';
    return `<div class="box mt4"><b>검산</b>
      <div class="t-sub mt1">행의 값을 더하면 ${r.map((x) => num(x.price)).join(' + ')} = <b>${num(쓴돈(g.rows))}</b>원 —
      위 합계 카드의 <b>${won(쓴돈(g.rows))}</b>과 같습니다. ${badge('맞음', 'b-ok')}</div>
      <div class="t-sub mt1">취소한 건 ${g.rows.length - r.length}건은 합계에서 뺐습니다.</div></div>`;
  };

  const body = `
${pageHd('기간 고르기', '기간을 바꾸면 표와 합계 카드가 동시에 다시 계산됩니다',
    btn('내역으로 돌아가기', { href: 'BS-03', cls: 'btn-ghost' }))}

${kpis([
    ['<span data-recalc-out="per2" data-i="3">이번 달</span> 쓴 돈', `<span data-recalc-out="per2" data-i="0">${won(쓴돈(이번달))}</span>`, { d: '취소한 건은 뺐습니다' }],
    ['집행 건수', `<span data-recalc-out="per2" data-i="1">${산것(이번달).length}건</span>`, { tone: 'k-acc', d: `전체 ${LOG.length}건 중` }],
    ['노출', `<span data-recalc-out="per2" data-i="2">${num(합(이번달, 'exp'))}회</span>`, { tone: 'k-ok', d: '고른 기간 합' }],
    ['검산', '맞음', { tone: 'k-ok', d: '합계 = 행의 합' }],
  ])}

${sec('기간', card('', `
  <label style="max-width:360px;display:block"><span class="lb">기간 고르기</span>
    <select class="input" data-sel-show="per2" data-recalc="per2">
      ${기간들.map((g, i) => `<option${i === 0 ? ' selected' : ''} value="${esc(g.key)}" data-vals="${esc(vals(g))}">${esc(g.key)} (${esc(g.note)})</option>`).join('')}
    </select></label>
  <p class="t-sub mt3">고르면 아래 표와 위 합계 카드가 «같은 셈»에서 다시 그려집니다 — 두 곳에 따로 적지 않습니다.</p>`))}

${기간들.map((g, i) => `<div data-sel-case="per2" data-sel-when="${esc(g.key)}"${i === 0 ? '' : ' hidden'}>
  ${sec(`${esc(g.key)} 내역`, g.rows.length
    ? `${tableBar(`<b>${g.rows.length}건</b> <span class="t-sub">· ${esc(g.note)} · 취소 ${g.rows.length - 산것(g.rows).length}건</span>`,
      btn('내역 전체', { href: 'BS-03', cls: 'btn-ghost btn-sm' }))}
      ${내역표(g.rows, { foot: ['합계', '', '', `<b>${won(쓴돈(g.rows))}</b>`, '', `<b>노출 ${num(합(g.rows, 'exp'))}</b>`, ''] })}
      ${검산(g)}`
    : `${empty('🧾', '이 기간에는 내역이 없어요', `${esc(g.note)} 사이에 집행한 끌올·광고가 없습니다.`,
      `${btn('기간 넓히기', { href: 'BS-03', cls: 'btn-ghost' })}${btn('끌올하러 가기', { href: 'BS-01', cls: 'btn-pri' })}`)}
      ${검산(g)}`)}
</div>`).join('')}

${sec('', banner('info', '🧮', `<b>합계와 행의 합은 «같은 셈»에서 나옵니다.</b>
  <div class="t-sub mt1">두 곳에 따로 적으면 반드시 갈라집니다. 그래서 표 아래에 검산 줄을 두어 눈으로 확인할 수 있게 했습니다.</div>`))}
`;
  return { body, o: { state: '이번 달', after: 영수증모달() + 중단모달() } };
};

PAGES.BS0303 = () => {
  const 최대 = Math.max(...BS_PERF_DAYS.map((d) => d.exp));
  const 전 = BS_PERF_DAYS.filter((d) => !d.ad);
  const 후 = BS_PERF_DAYS.filter((d) => d.ad);
  const 평균 = (rows, k) => Math.round(합(rows, k) / rows.length);
  const 클릭률 = (합(BS_PERF_DAYS, 'clk') / 합(BS_PERF_DAYS, 'exp') * 100).toFixed(1);

  const body = `
${pageHd('성과 펼치기', `9/10 · ${esc(itemBy(BS_STOP.item).t)} · ${esc(BS_STOP.k)}`,
    btn('내역으로 돌아가기', { href: 'BS-03', cls: 'btn-ghost' }))}

${kpis([
    ['노출', num(합(BS_PERF_DAYS, 'exp')), { unit: '회', d: '4일 합' }],
    ['클릭', num(합(BS_PERF_DAYS, 'clk')), { unit: '회', tone: 'k-acc', d: `클릭률 ${클릭률}%` }],
    ['채팅', String(합(BS_PERF_DAYS, 'chat')), { unit: '건', tone: 'k-ok', d: '광고 기간에 온 것' }],
    ['광고 전후', String(BS_BEFORE_AFTER.x), { unit: '배', tone: 'k-warn', d: `노출 ${num(평균(전, 'exp'))} → ${num(평균(후, 'exp'))}` }],
  ])}

${sec('행을 열면 이렇게 보입니다', accordion([
    {
      q: `9/10 · ${esc(itemBy(BS_STOP.item).t)} · ${esc(BS_STOP.k)} — 접으려면 다시 누르세요`,
      a: `${phMap('성과 추이 차트 (날짜별 노출·클릭·채팅 막대)', 800, 260)}
      <div class="bars mt4">
        ${BS_PERF_DAYS.map((d) => 막대(d.d, Math.round(d.exp / 최대 * 100), `${num(d.exp)}회`, d.ad ? 'acc' : '')).join('')}
      </div>
      <div class="mt4">${table(
        [{ t: '날짜', w: '22%' }, { t: '노출' }, { t: '클릭' }, { t: '채팅' }, { t: '광고', w: '16%' }],
        BS_PERF_DAYS.map((d) => ({
          cls: d.ad ? 'hl' : '',
          cells: [d.d, num(d.exp), num(d.clk), `${d.chat}건`, d.ad ? badge('집행', 'b-acc') : '<span class="muted">—</span>'],
        })),
        { foot: ['합계', num(합(BS_PERF_DAYS, 'exp')), num(합(BS_PERF_DAYS, 'clk')), `${합(BS_PERF_DAYS, 'chat')}건`, ''] },
      )}</div>`,
    },
    {
      q: `9/9 · ${esc(itemBy('i14').t)} · 즉시 끌올 — 성과 보기`,
      a: `<p class="t-sub mb3">즉시 끌올은 한 번 올리고 끝나서, 올린 날 하루에 성과가 몰립니다.</p>
      ${table([{ t: '날짜', w: '22%' }, { t: '노출' }, { t: '클릭' }, { t: '채팅' }],
        [['9/9', '2,180', '74', '1건'], ['9/10', '0', '0', '0건'], ['9/11 (오늘)', '0', '0', '0건']],
        { foot: ['합계', '2,180', '74', '1건'] })}`,
    },
  ], 0), { desc: '누르면 그 자리에서 펴지고 접힙니다 — 다른 화면으로 가지 않습니다.' })}

${sec('광고 전후 견주기', `<div class="g2">
  ${card('광고 전 (9/8~9/9)', kv([
    ['하루 평균 노출', `${num(평균(전, 'exp'))}회`],
    ['하루 평균 클릭', `${num(평균(전, 'clk'))}회`],
    ['온 채팅', `${합(전, 'chat')}건`],
  ]))}
  ${card('광고 뒤 (9/10~9/11)', kv([
    ['하루 평균 노출', `<b style="color:var(--pri-text)">${num(평균(후, 'exp'))}회</b>`],
    ['하루 평균 클릭', `<b style="color:var(--pri-text)">${num(평균(후, 'clk'))}회</b>`],
    ['온 채팅', `<b style="color:var(--pri-text)">${합(후, 'chat')}건</b>`],
  ]))}
</div>
<div class="mt4">${banner('ok', '📈', `<b>노출이 ${(평균(후, 'exp') / 평균(전, 'exp')).toFixed(1)}배, 채팅이 ${BS_BEFORE_AFTER.x}배 늘었어요.</b>
  <div class="t-sub mt1">다만 채팅이 늘어도 값이 시세보다 높으면 거래로 이어지지 않습니다.</div>`)}</div>`)}

${sec('', banner('info', '🔎', `<b>노출·클릭·채팅은 이렇게 셉니다.</b>
  <div class="t-sub mt1">노출은 목록에 «보인» 횟수, 클릭은 글을 «연» 횟수, 채팅은 그 글로 «말을 건» 사람 수입니다.
  같은 사람이 여러 번 봐도 하루 한 번으로 셉니다.</div>`,
    { right: btn('광고 상품·요금', { href: 'BS-02', cls: 'btn-ghost btn-sm' }) }))}
`;
  return { body, o: { state: '9/10 일주일 상단 고정 · 펼침' } };
};

PAGES.BS0304 = () => {
  const body = `
${pageHd('영수증 보기', `거래번호 ${BS_RECEIPT.no} · ${esc(BS_RECEIPT.k)}`,
    btn('내역으로 돌아가기', { href: 'BS-03', cls: 'btn-ghost' }))}

${kpis([
    ['거래번호', BS_RECEIPT.no, { d: BS_RECEIPT.at }],
    ['합계', num(BS_RECEIPT.total), { unit: '원', tone: 'k-acc', d: '부가세 포함' }],
    ['부가세', num(BS_RECEIPT.vat), { unit: '원', tone: 'k-mut', d: `공급가 ${won(BS_RECEIPT.supply)}` }],
    ['현금영수증', BS_RECEIPT.cash, { tone: 'k-warn', d: '아래에서 신청할 수 있어요' }],
  ])}

${sec('영수증', modalStatic('영수증', `
  ${kv([
    ['거래번호', `<b>${BS_RECEIPT.no}</b>`],
    ['결제 일시', BS_RECEIPT.at],
    ['상품', esc(BS_RECEIPT.k)],
    ['글', esc(itemBy(BS_STOP.item).t)],
    ['결제 수단', esc(BS_RECEIPT.way)],
  ])}
  <div class="mt4">${sumRows([
    ['공급가', won(BS_RECEIPT.supply)],
    ['부가세 (10%)', won(BS_RECEIPT.vat)],
  ], ['합계', won(BS_RECEIPT.total)])}</div>
  <div class="mt4">${banner('quiet', '🧾', `현금영수증 <b>${BS_RECEIPT.cash}</b> · 발행하면 ${esc(BS_RECEIPT.cashWay)} 로 등록됩니다.`)}</div>`,
    `${btn('현금영수증 발행 요청', { cls: 'btn-pri', attr: ` data-toast="현금영수증을 신청했어요 (${esc(BS_RECEIPT.cashWay)})"` })}
   ${btn('내려받기 (PDF)', { cls: 'btn-ghost', attr: ' data-toast="영수증 PDF 내려받기는 서버가 연결되면 열립니다"' })}`),
    { desc: '내역 표의 [영수증] 단추를 누르면 이 내용이 모달로 뜹니다. 여기서는 펼쳐 두었습니다.' })}

${sec('현금영수증', card('', `
  <div class="row-b wrap-row">
    <div><b class="t-card">현금영수증 ${BS_RECEIPT.cash}</b>
      <p class="t-sub mt1">소득공제용으로 ${esc(BS_RECEIPT.cashWay)} 에 발행합니다. 사업자라면 지출증빙으로 바꿀 수 있어요.</p></div>
    <div class="btns">
      ${btn('소득공제용 발행', { cls: 'btn-pri btn-sm', attr: ' data-toast="소득공제용 현금영수증을 신청했어요"' })}
      ${btn('지출증빙용 발행', { cls: 'btn-ghost btn-sm', attr: ' data-toast="지출증빙용 현금영수증을 신청했어요"' })}
    </div>
  </div>
  <div class="mt4">${table([{ t: '항목', w: '30%' }, { t: '내용' }], [
    ['발행 구분', '소득공제용 / 지출증빙용'],
    ['발행 대상', `${esc(BS_RECEIPT.cashWay)} (사업자는 사업자등록번호)`],
    ['발행 시점', '신청한 날 다음 영업일'],
    ['취소했을 때', '환불되면 자동으로 취소 처리됩니다'],
  ])}</div>`))}

${sec('', banner('info', '📄', `<b>세금계산서가 필요하시면 고객센터로 문의해 주세요.</b>
  <div class="t-sub mt1">사업자 광고(검색 결과 상단 · 카테고리 첫 화면)는 세금계산서를 끊어 드립니다.</div>`,
    { right: btn('고객센터', { href: 'CS-01', cls: 'btn-ghost btn-sm' }) }))}

<div class="btns center mt-block">
  ${btn('내역으로', { href: 'BS-03', cls: 'btn-pri' })}
  ${btn('광고 상품·요금', { href: 'BS-02', cls: 'btn-ghost' })}
</div>
`;
  return { body, o: { state: `${BS_RECEIPT.no} · ${won(BS_RECEIPT.total)}` } };
};

PAGES.BS0305 = () => {
  const 하루값 = Math.round(BS_STOP.paid / BS_STOP.totalDays);
  const it = itemBy(BS_STOP.item);

  const 본문 = `
${sec('', banner('dan', '⚠', `<b>중단하면 되돌릴 수 없어요</b>
  <div class="t-sub mt1">지금 중단하면 남은 ${BS_STOP.leftDays}일치가 돌아오지만, 같은 자리를 다시 쓰려면 새로 사야 합니다.</div>`))}

${sec('무엇을 중단하나요', card('', `
  <div class="row-c" style="gap:12px">${phItem(56, it.id)}
    <div class="grow"><b class="t-card">${esc(it.t)}</b>
      <p class="t-sub mt1">${esc(BS_STOP.k)} · ${BS_STOP.at} 시작 · ${won(BS_STOP.paid)}</p></div>
    ${stBadge('진행중')}</div>
  <div class="mt4">${kv([
    ['상품', esc(BS_STOP.k)],
    ['시작', `${BS_STOP.at} 14:02`],
    ['전체 기간', `${BS_STOP.totalDays}일`],
    ['쓴 기간', `${BS_STOP.usedDays}일`],
    ['남은 기간', `<b>${BS_STOP.leftDays}일</b>`],
  ])}</div>`))}

${sec('돌려받을 금액', card('', `
  ${table([{ t: '항목', w: '38%' }, { t: '셈' }, { t: '값', w: '22%' }], [
    ['낸 돈', esc(BS_STOP.k), `<b>${won(BS_STOP.paid)}</b>`],
    ['하루치', `${won(BS_STOP.paid)} ÷ ${BS_STOP.totalDays}일`, won(하루값)],
    ['쓴 기간', `${BS_STOP.usedDays}일`, `-${won(하루값 * BS_STOP.usedDays)}`],
    ['남은 기간', `${BS_STOP.leftDays}일`, won(BS_STOP.paid - 하루값 * BS_STOP.usedDays)],
  ], { foot: ['돌려받는 돈', `${won(BS_STOP.paid)} × ${BS_STOP.leftDays}일 ÷ ${BS_STOP.totalDays}일`, `<b class="price">${won(BS_STOP.back)}</b>`] })}
  <p class="t-sub mt3">위약금은 없습니다. 결제한 수단으로 3영업일 안에 되돌아갑니다(포인트는 즉시).</p>`),
    { aside: btn('환불 규정 보기', { href: 'BS0204', cls: 'btn-ghost btn-sm' }) })}

${sec('중단하면 잃는 것', card('', `<ul class="dots">
  <li>남은 ${BS_STOP.leftDays}일 동안 받을 <b>예상 노출 ${num(BS_STOP.lostExp)}회</b>가 사라집니다</li>
  <li>지금까지 쌓인 노출·클릭·채팅 기록은 <b>내역에 그대로 남습니다</b></li>
  <li>글은 내려가지 않습니다 — <b>「끌올」 배지만 떨어집니다</b></li>
  <li>같은 자리를 다시 쓰려면 <b>새로 사야 합니다</b> (이어 붙일 수 없어요)</li>
</ul>`))}

${sec('중단 확인 모달', modalStatic('광고를 중단할까요?', `
  <p class="t-sub mb3">지금 중단하면 남은 기간(${BS_STOP.leftDays}일)만큼 돌려드려요.</p>
  ${sumRows([
    ['낸 돈', won(BS_STOP.paid)],
    ['쓴 기간', `${BS_STOP.usedDays}일 / ${BS_STOP.totalDays}일`],
    ['남은 기간', `${BS_STOP.leftDays}일`],
  ], ['돌려받는 돈', won(BS_STOP.back)])}
  <p class="t-sub mt3">한 번 중단하면 <b>되돌릴 수 없어요.</b></p>`,
    `${btn('그냥 둘게요', { cls: 'btn-ghost' })}
   ${btn('중단하기', { cls: 'btn-danger', attr: ` data-toast="광고를 중단했어요 · ${won(BS_STOP.back)}이 돌아옵니다"` })}`),
    { desc: '내역 표의 [중단] 단추를 누르면 이 모달이 뜹니다. 여기서는 펼쳐 두었습니다.' })}
`;

  const 액션 = `
${actPanel('중단 확인', `${sumRows([
    ['낸 돈', won(BS_STOP.paid)],
    ['쓴 기간', `${BS_STOP.usedDays}일 / ${BS_STOP.totalDays}일`],
    ['남은 기간', `${BS_STOP.leftDays}일`],
  ], ['돌려받는 돈', won(BS_STOP.back)])}
  <label class="check box mt3"><input type="checkbox" data-unlock="bs-stop">
    <span><b>되돌릴 수 없다는 것을 확인했어요</b>
    <div class="t-sub">체크해야 아래 중단 단추가 열립니다.</div></span></label>`,
    `${btn('중단하고 환불받기', { cls: 'btn-danger btn-block btn-lg is-off', off: true, id: 'bs-stop', attr: ` data-toast="광고를 중단했어요 · ${won(BS_STOP.back)}이 돌아옵니다"` })}
   ${btn('그냥 둘게요', { href: 'BS-03', cls: 'btn-ghost btn-block' })}`, { state: '진행중' })}

${actPanel('남은 기간 동안', `<div class="center">
    <div class="t-sec">${num(BS_STOP.lostExp)}회</div>
    <p class="t-sub mt1">중단하면 사라지는 예상 노출</p></div>
  <div class="mt3">${progress(Math.round(BS_STOP.usedDays / BS_STOP.totalDays * 100))}</div>
  <p class="t-sub mt2 center">${BS_STOP.usedDays}일 / ${BS_STOP.totalDays}일 지남</p>`,
    btn('성과 먼저 보기', { href: 'BS0303', cls: 'btn-ghost btn-block btn-sm' }))}
`;

  const body = pageHd('진행 중 중단', `${esc(BS_STOP.k)} · ${BS_STOP.at} 시작 · 남은 ${BS_STOP.leftDays}일`)
    + kpis([
      ['낸 돈', num(BS_STOP.paid), { unit: '원', d: esc(BS_STOP.k) }],
      ['쓴 기간', `${BS_STOP.usedDays}일`, { tone: 'k-mut', d: `전체 ${BS_STOP.totalDays}일` }],
      ['돌려받는 돈', num(BS_STOP.back), { unit: '원', tone: 'k-ok', d: `남은 ${BS_STOP.leftDays}일치` }],
      ['사라지는 노출', num(BS_STOP.lostExp), { unit: '회', tone: 'k-danger', d: '되돌릴 수 없습니다' }],
    ])
    + detailSplit(본문, 액션);
  return { body, o: { state: '중단 확인 대기 · 되돌릴 수 없음' } };
};
