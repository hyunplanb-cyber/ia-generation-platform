/* PA 안전결제 — 26화면 (안내 5 · 결제 5 · 발송 5 · 수령확인 5 · 거래 진행 6)

   ⚠ 레이아웃 B «대시보드형» — 화면 위쪽은 «지표 카드 4장»(kpis)으로 연다. 히어로는 없다.
     목록은 표(dashTable), 상세는 좌 본문 + 우 액션 패널(detailSplit + actPanel)이다.
     상태를 «바꾸는» 단추는 전부 오른쪽 패널에 모은다 — 하단 고정 바는 디럭스(레이아웃 A) 것이다.
   ⚠ 링크는 반드시 link() 로 적는다. 목적지는 이 팩의 파일 이름(PA0201)으로 적어도 되고
     짧은 이름(PA-02)으로 적어도 된다 — toPageId() 가 옮겨 준다.
   ⚠ 남의 돈을 다루는 화면이다. 「지금 돈이 어디 있나」와 「지금 누구 차례인가」가
     모든 화면에서 한 줄로 읽혀야 한다.
   ⚠ 세 숫자(물건 값 · 수수료 · 판매자 수령액)는 ui.mjs 의 feeRows() 한 곳에서 낸다.
     화면마다 손으로 적으면 반드시 갈라진다.
   ⛔ btn() 에 href 와 off/id 를 같이 주면 만들 때 멈춘다 — 잠글 단추는 attr:' data-go="…"' 를 쓴다. */
import * as U from './ui.mjs';
import {
  DEALS, ESCROW_STEPS, FEE_RATE, fee, payout, itemBy, userBy, ITEMS, SITE, MY_POINT,
  PA_SETTLE_DAYS, PA_SHIP_LEFT, PA_SHIP_LEFT_SEC, PA_SHIP_URGENT, PA_SHIP_URGENT_SEC,
  PA_CONFIRM_LEFT, PA_CONFIRM_URGENT, PA_CONFIRM_URGENT_SEC, PA_HOLD_SEC,
  PA_CARRIERS, PA_PAYS, PA_CARD_INSTALL, PA_EASY, PA_ADDRS, PA_SHIP_MEMOS, PA_TERMS, PA_FAILS,
  PA_TRACK, PA_TRACK_ETA, PA_TRACK_NO, PA_MONEY, PA_COMPARE, PA_RETURN,
  PA_DISPUTE_STEPS, PA_DISPUTE_DOCS, PA_DISPUTE_RESULTS,
  PA_CANCEL_REASONS, PA_CANCEL_RULES, PA_DONE, PA_COND_PICK, PA_DIFF_REASONS, PA_PACK_TIPS,
} from './data.mjs';

/* ── 이 갈래가 쓰는 거래 세 벌 ───────────────────────────────────
   역할이 맞는 쪽으로 골랐다(data.mjs 의 PA_ 주석 참고).
   · 살 것   i9  에어팟 프로 2세대 · 파는 쪽 민트초코 → PA01 안내 · PA02 결제 · PA04 수령 확인
   · 팔 것   d2  기계식 키보드   · 사는 쪽 달빛창가 → PA03 발송 등록
   · 안전결제를 안 켠 매물 i6 캠핑 의자 · 파는 쪽 바람개비 → PA0105 */
const 살것 = itemBy('i9');
const 파는이 = userBy(살것.by);
const 살돈 = 살것.price + 살것.ship;

const 산거래 = DEALS[0];                    // d1 — 내가 «산» 것(에어팟)
const 판거래 = DEALS[1];                    // d2 — 내가 «파는» 것(키보드)
const 판물건 = itemBy(판거래.item);
const 사는이 = userBy(판거래.with);          // 달빛창가 — 내 물건을 사는 쪽

const 안켠매물 = itemBy('i6');
const 안켠이 = userBy(안켠매물.by);

const 쓸포인트 = MY_POINT;
const 결제액 = 살돈 - 쓸포인트;

const 단계글 = (n) => `${['①', '②', '③', '④'][n] || ''} ${ESCROW_STEPS[n] || ''}`;
const 요율 = `${(FEE_RATE * 100).toFixed(1)}%`;

/* ── 화면 여럿이 나눠 쓰는 조각 ──────────────────────────────── */

/** 남은 시간 상자 — 글자와 «실제로 세는 초»를 같이 둔다(app.js 의 data-count). */
const 기한상자 = (라벨, 글자, 초, o = {}) => `<div class="deadline">
  <div class="t-sub">${라벨}</div>
  <div class="big"${o.danger ? ' style="color:var(--danger)"' : ''} data-count="${초}">${글자}</div>
  <div class="t-sub mt1">${글자} 남았어요</div>
  ${o.note ? `<p class="t-sub mt2">${o.note}</p>` : ''}</div>`;

/** 매물 한 줄 요약 — 상세 화면 맨 위 */
const 거래머리 = (it, u, 역할, o = {}) => U.card(o.title || '이 거래', `<div class="row-b wrap-row">
  <a class="row-c" style="gap:12px" href="${U.link('SE0401')}">
    ${U.phItem(64, it.id)}
    <span><b>${U.esc(it.t)}</b>
      <span class="row-c wrap-row mt1"><b class="price">${U.won(it.price)}</b>${U.wayBadges(it.ways)}${U.badge(it.cond, 'b-mut')}</span></span>
  </a>
  <div class="right">
    <div class="t-sub">${역할}</div>
    <div class="row-c" style="gap:6px"><a class="link" href="${U.link('MY0101')}">${U.esc(u.nick)}</a>${U.manner(u.manner)}</div>
  </div></div>${o.after || ''}`);

/** 배송 이동 기록 — PA0401 · PA0503 이 같은 것을 쓴다 */
const 배송기록 = (열림) => `${U.timeline(PA_TRACK, PA_TRACK.length)}
  <p class="t-sub mt3">운송장 <b>${PA_TRACK_NO}</b> · ${PA_TRACK_ETA}</p>
  ${열림 ? '' : ''}`;

/** 수수료 계산기 — 고르면 세 숫자가 «그 자리에서» 다시 셈된다.
   ⚠ 세 숫자의 합이 늘 맞아야 한다: 물건 값 − 수수료 = 판매자 수령액.
     그래서 값을 화면에 적지 않고 data.mjs 의 fee()/payout() 로 만들어 넣는다. */
function 수수료계산기(o = {}) {
  const 값들 = [50000, 100000, 178000, 300000, 500000, 1000000];
  const 기본 = o.price || 300000;
  const 옵션 = 값들.map((v) => `<option value="${v}" data-vals="${U.won(v)}|− ${U.won(fee(v))}|${U.won(payout(v))}|${U.won(v)} − ${U.won(fee(v))} = ${U.won(payout(v))}"${v === 기본 ? ' selected' : ''}>${U.won(v)}</option>`).join('');
  return `
  <div class="fld"><label class="lb" for="fee-price">물건 값 — 고르면 그 자리에서 다시 셉니다</label>
    <select class="input" id="fee-price" data-recalc="fee">${옵션}</select></div>
  <div class="mt3">
    <div class="sum-row"><span class="muted">물건 값</span><span data-recalc-out="fee" data-i="0">${U.won(기본)}</span></div>
    <div class="sum-row"><span class="muted">수수료 ${요율} <span class="t-sub">(파는 쪽이 냅니다)</span></span><span data-recalc-out="fee" data-i="1">− ${U.won(fee(기본))}</span></div>
    <div class="sum-row total"><span>판매자가 받는 돈</span><span class="price" data-recalc-out="fee" data-i="2">${U.won(payout(기본))}</span></div>
  </div>
  <p class="t-sub mt3">셈이 맞는지 한 줄로 — <b data-recalc-out="fee" data-i="3">${U.won(기본)} − ${U.won(fee(기본))} = ${U.won(payout(기본))}</b></p>`;
}

/** 누가 수수료를 내나 — 고르는 자리가 아니라 «정해져 있다»는 것을 보이는 자리 */
const 수수료규칙 = () => `
  <div class="stack-sm">
    <label class="radio on"><input type="radio" name="feeby" checked>
      <b>파는 쪽이 냅니다</b><span class="d">이 장터의 규칙입니다. 정산할 때 물건 값에서 ${요율}가 빠집니다.</span></label>
    <label class="radio is-off"><input type="radio" name="feeby" disabled>
      <b>사는 쪽이 냅니다</b><span class="d">이 장터에서는 고를 수 없어요. 사는 쪽은 물건 값과 배송비만 냅니다.</span></label>
  </div>
  <p class="t-sub mt3">그래서 사는 쪽이 낼 돈은 <b>${U.won(살것.price)} + 배송비 ${U.won(살것.ship)}</b>가 전부입니다.</p>`;

/** 직거래와 견주기 — 나은 쪽을 굵게 둔다 */
const 견주기표 = () => U.dashTable(
  [{ t: '무엇을', w: '26%' }, { t: '직거래' }, { t: '안전결제' }],
  PA_COMPARE.map((c) => [
    `<b>${c.k}</b>`,
    c.better === 'a' ? `<b>${c.a}</b> ${U.badge('이쪽이 나아요', 'b-acc')}` : `<span class="muted">${c.a}</span>`,
    c.better === 'b' ? `<b>${c.b}</b> ${U.badge('이쪽이 나아요', 'b-ok')}` : `<span class="muted">${c.b}</span>`,
  ]),
);

/** 안전결제를 안 켠 매물 안내 — PA0101 아래쪽, PA0105 본문 */
const 안켠안내 = () => U.banner('warn', '⚠', `<b>판매자가 안전결제를 안 켠 매물도 있어요</b>
  <div class="t-sub mt1">그때는 결제 단추가 열리지 않습니다. 직거래로 만나거나, 판매자에게 켜 달라고 부탁할 수 있어요.</div>`,
  { right: U.btn('그 화면 보기', { href: 'PA0105', cls: 'btn-ghost btn-sm' }) });

/** 오른쪽 패널 — 이 거래에 드는 돈 */
const 낼돈패널 = (btns) => U.actPanel('내가 낼 돈', U.sumRows([
  ['물건 값', U.won(살것.price)],
  ['배송비', U.won(살것.ship)],
  ['수수료', '<span class="muted">판매자가 냅니다</span>'],
], ['모두', U.won(살돈)]), btns);

export const PAGES = {

  /* ══════════ PA01 안전결제 시작·안내 ══════════════════════════ */

  PA0101(ctx) {
    const 본문 = `
${거래머리(살것, 파는이, '파는 쪽')}

<div class="mt-block">${U.sec('안전결제는 이렇게 굴러갑니다', `
  ${U.escrow(0)}
  ${U.turnLine('아직 시작 전이에요 — 결제하면 ① 칸이 채워집니다')}
  <div class="mt-block">${U.accordion(PA_MONEY.map((m) => ({
      q: m.q, a: `<p>${m.a}</p><p class="t-sub mt2">걸리는 기간 — <b>${m.term}</b></p>`,
    })), 0)}</div>
  <div class="mt3">${U.btn('네 칸을 모두 펼쳐 보기', { href: 'PA0102', cls: 'btn-ghost btn-sm' })}</div>`,
      { desc: '돈은 물건을 받고 확인할 때까지 우리동네장터가 맡아 둡니다.' })}</div>

<div class="mt-block">${U.sec('수수료는 얼마인가요', `
  ${U.card('수수료 계산기', 수수료계산기())}
  <div class="mt-block">${U.card('누가 수수료를 내나요', 수수료규칙())}</div>
  <div class="mt3">${U.btn('계산기만 크게 보기', { href: 'PA0103', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

<div class="mt-block">${U.sec('직거래와 무엇이 다른가요', `
  ${견주기표()}
  ${U.banner('info', '💡', `<b>이 매물에는 안전결제를 권합니다.</b>
    <div class="t-sub mt1">${U.esc(파는이.town)}까지 ${살것.dist}km 떨어져 있고 값이 ${U.won(살것.price)}이라, 만나는 품보다 맡아 두는 쪽이 편합니다.</div>`,
      { cls: 'mt4', right: U.btn('나란히 견주기', { href: 'PA0104', cls: 'btn-ghost btn-sm' }) })}`)}</div>

<div class="mt-block">${U.sec('반품·환불은 어떻게 되나요', U.accordion(PA_RETURN, -1))}</div>

<div class="mt-block">${U.sec('다투게 되면 어떻게 되나요', `
  ${U.card('', `${U.timeline(PA_DISPUTE_STEPS.map(([t]) => [t, '']), 0)}
    <p class="t-sub mt3">분쟁을 넣으면 <b>정산이 멈춥니다.</b> 운영자가 양쪽 사진과 대화를 보고
    ${PA_DISPUTE_RESULTS.map((r) => `<b>${r}</b>`).join(' · ')} 가운데 하나로 판단합니다. 보통 영업일 3일쯤 걸려요.</p>`)}`)}</div>

<div class="mt-block">${안켠안내()}</div>
`;

    const 패널 = 낼돈패널(`
  ${U.btn('결제하기', { href: 'PA0201', cls: 'btn-pri btn-lg' })}
  ${U.btn('직거래로 하기', { href: 'CH0301', cls: 'btn-ghost' })}
  ${U.btn('안전거래 안내 보기', { href: 'HO0301', cls: 'btn-ghost' })}`)
      + U.actPanel('파는 쪽', `${U.userCard(파는이, { href: 'MY0101' })}`, `
  ${U.btn('채팅으로 물어보기', { href: 'CH0201', cls: 'btn-ghost' })}`)
      + U.actPanel('', U.banner('warn', '⚠', `<b>바깥 링크로 결제하라는 말은 사기입니다.</b>
    <div class="t-sub mt1">안전결제는 채팅 안의 [안전결제로 거래하기] 단추로만 시작합니다.</div>`), '');

    const body = `
${U.pageHd('안전결제로 거래하기', '돈을 맡아 두었다가, 물건을 받고 확인하면 그때 판매자에게 넘깁니다',
      `<div class="btns">${U.btn('안전거래 안내', { href: 'HO0301', cls: 'btn-ghost' })}${U.btn('결제하기', { href: 'PA0201', cls: 'btn-pri' })}</div>`)}

${U.kpis([
      ['물건 값', U.num(살것.price), { unit: '원', d: U.esc(살것.t) }],
      ['배송비', U.num(살것.ship), { unit: '원', tone: 'k-mut', d: '판매자가 정한 값' }],
      ['내가 낼 돈', U.num(살돈), { unit: '원', tone: 'k-acc', d: '수수료는 파는 쪽이 냅니다' }],
      ['판매자가 받는 돈', U.num(payout(살것.price)), { unit: '원', tone: 'k-ok', d: `수수료 ${요율} 뺀 값`, href: 'PA0103' }],
    ])}

${U.detailSplit(본문, 패널)}`;
    return { body, o: {} };
  },

  /* ── PA0102 단계 펼치기 ─────────────────────────────────────── */
  PA0102(ctx) {
    const 본문 = `
${거래머리(살것, 파는이, '파는 쪽')}

<div class="mt-block">${U.sec('네 칸을 모두 펼쳤어요', `
  ${U.escrow(0)}
  ${U.turnLine('아직 시작 전이에요 — 결제하면 ① 칸이 채워집니다')}
  <div class="mt-block">${U.accordion(PA_MONEY.map((m) => ({
      q: m.q,
      a: `<p>${m.a}</p>
        <div class="cond-row mt3"><span class="grow">이 칸에 걸리는 기간</span><b>${m.term}</b></div>`,
    })), [0, 1, 2, 3])}</div>
  <p class="t-sub mt3">칸 제목을 다시 누르면 접힙니다. 다른 화면으로 가지 않아요.</p>
  <div class="mt3">${U.btn('모두 접기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="칸 제목을 누르면 그 자리에서 접힙니다"' })}
  ${U.btn('안내 화면으로', { href: 'PA0101', cls: 'btn-ghost btn-sm' })}</div>`,
      { desc: '단계마다 돈이 어디에 있고, 얼마나 걸리는지 한 자리에서 봅니다.' })}</div>

<div class="mt-block">${U.sec('네 칸을 한 표로', U.dashTable(
      [{ t: '단계', w: '132px' }, { t: '돈은 어디에' }, { t: '걸리는 기간', w: '168px' }],
      PA_MONEY.map((m, i) => [
        `<b>${단계글(i)}</b>`,
        m.a.replace(/<[^>]+>/g, ''),
        `<b>${m.term}</b>`,
      ]),
      { max: '340px' },
    ))}</div>
`;
    const 패널 = 낼돈패널(`
  ${U.btn('결제하기', { href: 'PA0201', cls: 'btn-pri btn-lg' })}
  ${U.btn('안내 화면으로 돌아가기', { href: 'PA0101', cls: 'btn-ghost' })}`);

    const body = `
${U.pageHd('안전결제 4단계 — 펼쳐 보기', '칸을 누르면 그 자리에서 펴지고 접힙니다')}
${U.kpis(PA_MONEY.map((m, i) => [단계글(i), m.term, { tone: ['', 'k-acc', 'k-warn', 'k-ok'][i], d: i === 3 ? '이때 수수료가 빠집니다' : '돈은 아직 맡아 둡니다' }]))}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '네 칸을 모두 펼친 상태' } };
  },

  /* ── PA0103 수수료 계산기 ───────────────────────────────────── */
  PA0103(ctx) {
    const 본문 = `
${U.sec('물건 값을 넣으면 바로 셉니다', `
  ${U.card('', 수수료계산기())}
  ${U.banner('info', '🧮', `<b>세 숫자는 늘 아귀가 맞습니다.</b>
    <div class="t-sub mt1">물건 값 − 수수료 = 판매자가 받는 돈. 이 식이 깨지지 않게 한 곳에서 셉니다.</div>`, { cls: 'mt4' })}`,
      { desc: `수수료는 물건 값의 ${요율}입니다. 배송비에는 수수료가 붙지 않아요.` })}

<div class="mt-block">${U.sec('누가 수수료를 내나요', U.card('', 수수료규칙()))}</div>

<div class="mt-block">${U.sec('값대로 미리 본 표', U.dashTable(
      [{ t: '물건 값' }, { t: `수수료 ${요율}` }, { t: '판매자가 받는 돈' }, { t: '사는 쪽이 낼 돈' }],
      [50000, 100000, 178000, 300000, 500000, 1000000].map((v) => [
        `<b>${U.won(v)}</b>`,
        `<span class="muted">− ${U.won(fee(v))}</span>`,
        `<b>${U.won(payout(v))}</b>`,
        `<span class="muted">${U.won(v)} + 배송비</span>`,
      ]),
      { max: '320px' },
    ), { desc: '사는 쪽이 낼 돈에는 수수료가 들어 있지 않습니다.' })}</div>
`;
    const 패널 = U.actPanel('이 거래에 맞춰 보면', U.feeRows(살것.price, fee(살것.price), payout(살것.price))
      + `<p class="t-sub mt3">${U.esc(살것.t)} 기준입니다.</p>`, `
  ${U.btn('결제하기', { href: 'PA0201', cls: 'btn-pri btn-lg' })}
  ${U.btn('안내 화면으로', { href: 'PA0101', cls: 'btn-ghost' })}`)
      + U.actPanel('', U.banner('quiet', '📌', `수수료는 <b>정산할 때</b> 빠집니다. 판매자가 미리 낼 돈은 없어요.`), '');

    const body = `
${U.pageHd('수수료 계산기', `물건 값을 고르면 수수료와 판매자 수령액이 그 자리에서 다시 셈됩니다`)}
${U.kpis([
      ['수수료율', 요율, { d: '물건 값 기준 · 배송비 제외' }],
      ['누가 내나', '파는 쪽', { tone: 'k-acc', d: '사는 쪽은 물건 값과 배송비만' }],
      ['이 거래 수수료', U.num(fee(살것.price)), { unit: '원', tone: 'k-warn', d: U.esc(살것.t) }],
      ['판매자 수령액', U.num(payout(살것.price)), { unit: '원', tone: 'k-ok', d: `${U.won(살것.price)} − ${U.won(fee(살것.price))}` }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '수수료 계산기를 편 상태' } };
  },

  /* ── PA0104 직거래와 견주기 ─────────────────────────────────── */
  PA0104(ctx) {
    const 나은쪽 = PA_COMPARE.filter((c) => c.better === 'b').length;
    const 본문 = `
${U.sec('두 가지를 나란히', `
  <div>
    ${U.tabs([{ label: '나란히 보기', pane: 'cmp0' }, { label: '직거래만', pane: 'cmp1' }, { label: '안전결제만', pane: 'cmp2' }], 0)}
    <div class="mt4" data-pane-body="cmp0">${견주기표()}</div>
    <div class="mt4" data-pane-body="cmp1" hidden>
      ${U.dashTable([{ t: '무엇을', w: '32%' }, { t: '직거래' }],
      PA_COMPARE.map((c) => [`<b>${c.k}</b>`, c.better === 'a' ? `<b>${c.a}</b> ${U.badge('이쪽이 나아요', 'b-acc')}` : c.a]))}
    </div>
    <div class="mt4" data-pane-body="cmp2" hidden>
      ${U.dashTable([{ t: '무엇을', w: '32%' }, { t: '안전결제' }],
      PA_COMPARE.map((c) => [`<b>${c.k}</b>`, c.better === 'b' ? `<b>${c.b}</b> ${U.badge('이쪽이 나아요', 'b-ok')}` : c.b]))}
    </div>
  </div>`, { desc: '굵은 글씨와 배지가 붙은 쪽이 그 항목에서 나은 쪽입니다.' })}

<div class="mt-block">${U.sec('이 매물에는 어느 쪽이 맞나요', `
  ${U.card('', `<div class="row-b wrap-row">
    <div>${U.esc(살것.t)} · ${U.won(살것.price)} · ${U.esc(파는이.town)}에서 ${살것.dist}km</div>
    ${U.badge('안전결제를 권합니다', 'b-ok')}</div>
    <p class="t-sub mt3">여섯 항목 가운데 <b>${나은쪽}가지</b>에서 안전결제가 낫습니다.
    값이 ${U.won(살것.price)}으로 작지 않고, 만나려면 ${살것.dist}km를 오가야 합니다.
    가까운 이웃과 몇 천원짜리를 주고받을 때는 직거래가 더 빠릅니다.</p>`)}`)}</div>

<div class="mt-block">${안켠안내()}</div>
`;
    const 패널 = U.actPanel('고르기', `<p class="t-sub">어느 쪽으로 하시겠어요?</p>
  <div class="mt3">${U.sumRows([['물건 값', U.won(살것.price)], ['직거래로 하면', '수수료 없음'], ['안전결제로 하면', `수수료 ${U.won(fee(살것.price))} (판매자 부담)`]])}</div>`, `
  ${U.btn('안전결제로 결제하기', { href: 'PA0201', cls: 'btn-pri btn-lg' })}
  ${U.btn('직거래로 약속 잡기', { href: 'CH0301', cls: 'btn-ghost' })}
  ${U.btn('안내 화면으로', { href: 'PA0101', cls: 'btn-ghost' })}`);

    const body = `
${U.pageHd('직거래와 견주기', '두 열을 나란히 놓고, 항목마다 나은 쪽을 표시했어요')}
${U.kpis([
      ['견준 항목', U.num(PA_COMPARE.length), { unit: '가지', d: '값·시간·안전' }],
      ['직거래가 나은 것', U.num(PA_COMPARE.length - 나은쪽), { unit: '가지', tone: 'k-acc', d: '비용 · 미리 보기 · 속도' }],
      ['안전결제가 나은 것', U.num(나은쪽), { unit: '가지', tone: 'k-ok', d: '돈 · 만남 · 다툼' }],
      ['이 매물 추천', '안전결제', { tone: 'k-ok', d: `${살것.dist}km 떨어져 있어요` }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '두 열을 나란히 놓고 본 상태' } };
  },

  /* ── PA0105 판매자가 안전결제를 안 켰을 때 ──────────────────── */
  PA0105(ctx) {
    const 본문 = `
${U.banner('warn', '⚠', `<b>이 매물은 판매자가 안전결제를 켜 두지 않았어요.</b>
  <div class="t-sub mt1">그래서 결제로 넘어갈 수 없습니다. 아래 두 가지 가운데 하나를 고르세요.</div>`)}

<div class="mt-block">${거래머리(안켠매물, 안켠이, '파는 쪽', { title: '이 매물' })}</div>

<div class="mt-block">${U.sec('고를 수 있는 길', `
  <div class="g2">
    ${U.card('① 직거래로 만나기', `<p class="t-sub">${U.esc(안켠이.town)}까지 ${안켠매물.dist}km입니다.
      안전거래존에서 만나 물건을 보고 값을 치르면 수수료가 들지 않아요.</p>
      <div class="mt4">${U.btn('거래 약속 잡기', { href: 'CH0301', cls: 'btn-pri btn-block' })}</div>`)}
    ${U.card('② 판매자에게 켜 달라고 하기', `<p class="t-sub">판매자가 판매글에서 안전결제를 켜면 이 화면의 결제 단추가 열립니다.
      부탁을 보내면 채팅으로 전해집니다.</p>
      <div class="mt4">${U.btn('안전결제를 켜 달라고 보내기', { cls: 'btn-ghost btn-block', attr: ' data-toast="판매자에게 부탁을 보냈어요 · 채팅으로 답이 옵니다"' })}</div>`)}
  </div>`)}</div>

<div class="mt-block">${U.sec('직거래로 할 때 꼭 지킬 것', U.card('', `<ul class="dots">
  <li>사람이 많고 CCTV가 있는 <b>안전거래존</b>에서 만나세요</li>
  <li>물건을 <b>받은 자리에서</b> 켜 보고 값을 치르세요</li>
  <li>먼저 보내 달라는 말은 사기일 수 있어요 — 그때는 거래를 멈추세요</li>
</ul>
<div class="mt4">${U.btn('안전거래 안내 보기', { href: 'HO0301', cls: 'btn-ghost btn-sm' })}
${U.btn('안전결제 안내로', { href: 'PA0101', cls: 'btn-ghost btn-sm' })}</div>`))}</div>
`;
    const 패널 = U.actPanel('결제', `${U.sumRows([['물건 값', U.won(안켠매물.price)], ['배송비', U.won(안켠매물.ship)]], ['모두', U.won(안켠매물.price + 안켠매물.ship)])}
  <p class="t-sub mt3">판매자가 안전결제를 켜기 전에는 이 단추가 열리지 않아요. 「곧 열린다」고 말하지 않겠습니다.</p>`, `
  ${U.btn('안전결제로 결제하기', { cls: 'btn-pri btn-lg', id: 'pay-locked', off: true })}
  ${U.btn('직거래로 하기', { href: 'CH0301', cls: 'btn-ghost' })}
  ${U.btn('판매자에게 켜 달라고 하기', { cls: 'btn-ghost', attr: ' data-toast="판매자에게 부탁을 보냈어요"' })}`, { state: '분쟁' })
      + U.actPanel('파는 쪽', U.userCard(안켠이, { href: 'MY0101' }), U.btn('채팅으로', { href: 'CH0201', cls: 'btn-ghost' }));

    const body = `
${U.pageHd('이 매물은 안전결제를 쓸 수 없어요', '판매자가 켜 두지 않아 결제로 넘어갈 수 없습니다')}
${U.kpis([
      ['이 매물 값', U.num(안켠매물.price), { unit: '원', d: U.esc(안켠매물.t) }],
      ['안전결제', '꺼짐', { tone: 'k-danger', d: '판매자가 켜야 열립니다' }],
      ['거래 방식', 안켠매물.ways.join(' · '), { tone: 'k-mut', d: '판매글에 적힌 것' }],
      ['만나는 거리', 안켠매물.dist, { unit: 'km', tone: 'k-acc', d: `${U.esc(안켠이.town)}`, href: 'CH0301' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '판매자가 안전결제를 켜지 않아 결제가 잠긴 상태' } };
  },

  /* ══════════ PA02 결제 ═════════════════════════════════════════ */

  PA0201(ctx) {
    const 주소칸 = PA_ADDRS.map((a, i) => `<label class="radio${i === 0 ? ' on' : ''}">
      <input type="radio" name="addr"${i === 0 ? ' checked' : ''}>
      <b>${a.k}${a.main ? ` ${U.badge('기본', 'b-mut')}` : ''}</b>
      <span class="d">${U.esc(a.who)} · ${a.tel}<br>${U.esc(a.addr)} (${a.zip})</span></label>`).join('');

    const 수단탭 = `<div>
      ${U.tabs(PA_PAYS.map((p, i) => ({ label: p.k, pane: `pay${i}` })), 0)}
      <div class="mt4" data-pane-body="pay0">
        <div class="row wrap-row" style="gap:12px">
          <div class="fld" style="flex:1 1 240px"><label class="lb" for="cd">카드 번호</label>
            <input class="input" id="cd" type="text" inputmode="numeric" placeholder="0000 0000 0000 0000"></div>
          <div class="fld" style="flex:1 1 120px"><label class="lb" for="ex">유효기간</label>
            <input class="input" id="ex" type="text" placeholder="MM/YY"></div>
        </div>
        <div class="fld"><label class="lb" for="ins">할부</label>
          <select class="input" id="ins">${PA_CARD_INSTALL.map((v) => `<option>${v}</option>`).join('')}</select></div>
        <p class="t-sub">${PA_PAYS[0].lim}</p>
      </div>
      <div class="mt4" data-pane-body="pay1" hidden>
        <div class="g3">${PA_EASY.map((e, i) => `<label class="radio${i === 0 ? ' on' : ''}">
          <input type="radio" name="easy"${i === 0 ? ' checked' : ''}><b>${e}</b></label>`).join('')}</div>
        <p class="t-sub mt3">${PA_PAYS[1].lim}</p>
      </div>
      <div class="mt4" data-pane-body="pay2" hidden>
        <div class="fld"><label class="lb" for="bk">은행</label>
          <select class="input" id="bk"><option>국민은행</option><option>신한은행</option><option>우리은행</option><option>하나은행</option><option>농협</option></select></div>
        <div class="fld"><label class="lb" for="bn">계좌번호</label>
          <input class="input" id="bn" type="text" inputmode="numeric" placeholder="- 없이 적어 주세요"></div>
        <p class="t-sub">${PA_PAYS[2].lim}</p>
      </div>
      <div class="mt3">${U.btn('수단별 입력칸 자세히 보기', { href: 'PA0202', cls: 'btn-ghost btn-sm' })}</div>
    </div>`;

    const 본문 = `
${U.stepbar(['받는 곳', '결제 수단', '동의', '결제'], 0)}

<div class="mt-block">${U.card('받는 사람과 배송지', `
  <div class="row wrap-row" style="gap:12px">
    <div class="fld" style="flex:1 1 200px"><label class="lb" for="rn">이름</label>
      <input class="input" id="rn" type="text" value="${U.esc(SITE.me)}"></div>
    <div class="fld" style="flex:1 1 200px"><label class="lb" for="rt">연락처</label>
      <input class="input" id="rt" type="tel" value="010-0000-0000"></div>
  </div>
  <div class="fld"><span class="lb">배송지 고르기</span>
    <div class="stack-sm">${주소칸}</div>
    <button class="link mt2" type="button" data-toast="새 주소를 적는 칸을 열었어요">＋ 새 주소 추가</button></div>
  <div class="fld"><label class="lb" for="memo">배송 요청 사항</label>
    <select class="input" id="memo">${PA_SHIP_MEMOS.map((m) => `<option>${m}</option>`).join('')}</select></div>`)}</div>

<div class="mt-block">${U.card('결제 수단', 수단탭)}</div>

<div class="mt-block">${U.card('포인트·쿠폰', `
  <div class="row-c" style="gap:8px">
    <input class="input" type="text" inputmode="numeric" value="${U.num(쓸포인트)}" style="flex:1" aria-label="쓸 포인트">
    <button class="btn btn-ghost btn-sm" type="button" data-toast="가진 포인트 ${U.num(MY_POINT)}P를 모두 담았어요">모두 사용</button>
  </div>
  <p class="t-sub mt2">가진 포인트 <b>${U.num(MY_POINT)}P</b> — 1P는 1원입니다.</p>
  <div class="fld mt3"><label class="lb" for="cp">쿠폰</label>
    <select class="input" id="cp"><option>쓸 쿠폰 없음</option><option>첫 거래 3,000원 할인</option></select></div>`)}</div>

<div class="mt-block" data-agree-scope>${U.card('필수 약관 동의 3가지', `
  <label class="check strong mb3"><input type="checkbox" data-agree-all data-unlock="paybtn">
    <span><b>아래 세 가지에 모두 동의합니다</b> — 체크하면 결제 단추가 열립니다</span></label>
  ${PA_TERMS.map((t) => `<label class="check"><input type="checkbox" data-agree>
    <span class="grow">${U.badge(t.k, 'b-mut')} ${U.esc(t.t)}<span class="t-sub" style="display:block">${U.esc(t.d)}</span></span>
    <button class="link quiet" type="button" data-toast="약관 전문을 열었어요">보기</button></label>`).join('')}
  <p class="t-sub mt3">셋을 다 체크해야 결제할 수 있어요.
  ${U.btn('안 체크했을 때 어떻게 보이나', { href: 'PA0203', cls: 'btn-ghost btn-xs' })}</p>`)}</div>

<div class="mt-block">${U.sec('결제할 때 알아 두실 것', `
  <div class="stack-sm">
    ${U.banner('info', '⏳', `<b>결제창이 뜨는 동안에는 단추가 눌리지 않습니다.</b>
      <div class="t-sub mt1">두 번 눌러 두 번 결제되는 일이 없게 막아 둡니다. 창을 닫지 마세요.</div>`,
      { right: U.btn('진행 중 화면', { href: 'PA0204', cls: 'btn-ghost btn-sm' }) })}
    ${U.banner('warn', '⚠', `<b>결제가 안 될 때는 다른 수단으로 해 보세요.</b>
      <div class="t-sub mt1">한도 초과 · 카드 정보 오류 · 잔액 부족이 흔한 사유입니다.</div>`,
      { right: U.btn('실패 화면', { href: 'PA0205', cls: 'btn-ghost btn-sm' }) })}
    ${U.banner('quiet', '🔔', `<b>결제 뒤 판매자 확인까지 보통 몇 시간 걸립니다.</b>
      <div class="t-sub mt1">판매자는 <b>3일 안에</b> 물건을 보내야 합니다. 안 보내면 자동으로 취소되고 전액 환불됩니다.</div>`)}
  </div>`)}</div>
`;

    const 패널 = U.actPanel('주문 요약', `
  <div class="row-c" style="gap:12px">${U.phItem(56, 살것.id)}
    <div><b>${U.esc(살것.t)}</b><p class="t-sub mt1">${U.esc(파는이.nick)} · ${U.badge(살것.cond, 'b-mut')}</p></div></div>
  <div class="mt4">${U.sumRows([
      ['물건 값', U.won(살것.price)],
      ['배송비', U.won(살것.ship)],
      ['수수료 부담', '<span class="muted">판매자가 냅니다</span>'],
      ['포인트 사용', `− ${U.won(쓸포인트)}`],
    ], ['총 결제액', U.won(결제액)])}</div>`, `
  ${U.btn('결제하기', { cls: 'btn-pri btn-lg', id: 'paybtn', off: true, attr: ` data-go="${U.link('PA0501')}"` })}
  ${U.btn('거래 진행 상태 보기', { href: 'PA0501', cls: 'btn-ghost' })}
  ${U.btn('안전결제 안내로', { href: 'PA0101', cls: 'btn-ghost' })}`)
      + U.actPanel('', U.banner('info', '🛡', `<b>결제한 돈은 판매자에게 바로 가지 않아요.</b>
    <div class="t-sub mt1">${U.esc(SITE.name)}가 맡아 두었다가, 물건을 받고 「받았어요」를 누르면 그때 넘어갑니다.</div>`), '');

    const body = `
${U.pageHd('결제', `${U.esc(살것.t)} · ${U.esc(파는이.nick)}님에게서 삽니다`)}
${U.kpis([
      ['물건 값', U.num(살것.price), { unit: '원' }],
      ['배송비', U.num(살것.ship), { unit: '원', tone: 'k-mut' }],
      ['포인트 사용', U.num(쓸포인트), { unit: '원', tone: 'k-acc', d: `가진 포인트 ${U.num(MY_POINT)}P` }],
      ['총 결제액', U.num(결제액), { unit: '원', tone: 'k-ok', d: '수수료는 판매자가 냅니다' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: {} };
  },

  /* ── PA0202 결제 수단 탭 ────────────────────────────────────── */
  PA0202(ctx) {
    const 본문 = `
${U.sec('수단을 고르면 입력 형태가 통째로 바뀝니다', `
  <div>
    ${U.tabs(PA_PAYS.map((p, i) => ({ label: p.k, pane: `m${i}` })), 0)}
    <div class="mt4" data-pane-body="m0">${U.card('카드', `
      <div class="row wrap-row" style="gap:12px">
        <div class="fld" style="flex:1 1 240px"><label class="lb" for="c1">카드 번호</label>
          <input class="input" id="c1" type="text" inputmode="numeric" placeholder="0000 0000 0000 0000"></div>
        <div class="fld" style="flex:1 1 120px"><label class="lb" for="c2">유효기간</label>
          <input class="input" id="c2" type="text" placeholder="MM/YY"></div>
        <div class="fld" style="flex:1 1 120px"><label class="lb" for="c3">앞 두 자리 생년</label>
          <input class="input" id="c3" type="text" inputmode="numeric" placeholder="90"></div>
      </div>
      <div class="fld"><label class="lb" for="c4">할부</label>
        <select class="input" id="c4">${PA_CARD_INSTALL.map((v) => `<option>${v}</option>`).join('')}</select>
        <p class="t-sub mt1">5만원 이상부터 할부를 고를 수 있어요.</p></div>
      ${U.banner('quiet', '💳', `<b>한 번에 낼 수 있는 값</b> — ${PA_PAYS[0].lim}`)}`)}</div>

    <div class="mt4" data-pane-body="m1" hidden>${U.card('간편결제', `
      <div class="g3">${PA_EASY.map((e, i) => `<label class="radio${i === 0 ? ' on' : ''}">
        <input type="radio" name="e2"${i === 0 ? ' checked' : ''}><b>${e}</b>
        <span class="d">앱으로 넘어갔다 돌아옵니다</span></label>`).join('')}</div>
      <p class="t-sub mt3">카드 번호를 적지 않아도 돼서 가장 빠릅니다.</p>
      ${U.banner('quiet', '📱', `<b>한 번에 낼 수 있는 값</b> — ${PA_PAYS[1].lim}`, { cls: 'mt4' })}`)}</div>

    <div class="mt4" data-pane-body="m2" hidden>${U.card('계좌이체', `
      <div class="fld"><label class="lb" for="b1">은행</label>
        <select class="input" id="b1"><option>국민은행</option><option>신한은행</option><option>우리은행</option><option>하나은행</option><option>농협</option></select></div>
      <div class="fld"><label class="lb" for="b2">계좌번호</label>
        <input class="input" id="b2" type="text" inputmode="numeric" placeholder="- 없이 적어 주세요"></div>
      <div class="fld"><label class="lb" for="b3">예금주</label>
        <input class="input" id="b3" type="text" value="${U.esc(SITE.me)}"></div>
      ${U.banner('quiet', '🏦', `<b>한 번에 낼 수 있는 값</b> — ${PA_PAYS[2].lim}`)}`)}</div>
  </div>`, { desc: '탭을 옮겨도 화면 주소는 그대로입니다. 뒤로가기가 탭에 끼어들지 않아요.' })}

<div class="mt-block">${U.sec('수단별 한도 한눈에', U.dashTable(
      [{ t: '수단', w: '132px' }, { t: '무엇' }, { t: '한 번에 낼 수 있는 값' }],
      PA_PAYS.map((p) => [`<b>${p.k}</b>`, p.d, `<b>${p.lim}</b>`]),
    ), { desc: `이 거래 결제액은 ${U.won(결제액)}이라 세 수단 모두 쓸 수 있어요.` })}</div>
`;
    const 패널 = U.actPanel('이 거래', U.sumRows([
      ['물건 값', U.won(살것.price)], ['배송비', U.won(살것.ship)], ['포인트 사용', `− ${U.won(쓸포인트)}`],
    ], ['총 결제액', U.won(결제액)]), `
  ${U.btn('결제 화면으로 돌아가기', { href: 'PA0201', cls: 'btn-pri btn-lg' })}
  ${U.btn('결제가 안 될 때', { href: 'PA0205', cls: 'btn-ghost' })}`);

    const body = `
${U.pageHd('결제 수단 고르기', '카드 · 간편결제 · 계좌이체 — 고른 수단의 입력칸만 보입니다')}
${U.kpis([
      ...PA_PAYS.map((p, i) => [`${p.k} 한도`, p.lim.split(' · ')[0].replace('1회 ', ''), { tone: ['', 'k-acc', 'k-ok'][i], d: p.lim.split(' · ')[1] }]),
      ['이 거래 결제액', U.num(결제액), { unit: '원', tone: 'k-warn', d: '세 수단 모두 쓸 수 있어요' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '카드 탭을 고른 상태' } };
  },

  /* ── PA0203 약관 동의 잠금 ──────────────────────────────────── */
  PA0203(ctx) {
    const 본문 = `
${U.banner('dan', '⛔', `<b>약관에 동의해주세요.</b>
  <div class="t-sub mt1">필수 3가지 가운데 <b>1가지</b>를 아직 체크하지 않았습니다. 셋을 다 체크해야 결제 단추가 열려요.</div>`)}

<div class="mt-block" data-agree-scope>${U.card('필수 약관 동의 3가지', `
  <label class="check strong mb3"><input type="checkbox" data-agree-all data-unlock="paybtn2">
    <span><b>아래 세 가지에 모두 동의합니다</b> — 체크하면 결제 단추가 열립니다</span></label>
  ${PA_TERMS.map((t, i) => {
      const 안함 = i === 2;
      return `<label class="check"${안함 ? ' style="border-radius:var(--r-btn);background:var(--dan-06,rgba(200,60,40,.07))"' : ''}>
      <input type="checkbox" data-agree${안함 ? '' : ' checked'}>
      <span class="grow">${U.badge(t.k, 안함 ? 'b-dan' : 'b-mut')}
        <span${안함 ? ' style="color:var(--danger);font-weight:700"' : ''}>${U.esc(t.t)}</span>
        <span class="t-sub" style="display:block">${U.esc(t.d)}${안함 ? ' — <b style="color:var(--danger)">아직 체크하지 않았어요</b>' : ''}</span></span>
      <button class="link quiet" type="button" data-toast="약관 전문을 열었어요">보기</button></label>`;
    }).join('')}
  <div class="mt4">${U.sumRows([['체크한 것', '2 / 3'], ['남은 것', '<b style="color:var(--danger)">전자금융거래 이용약관</b>']])}</div>`)}</div>

<div class="mt-block">${U.sec('왜 셋을 다 받나요', U.dashTable(
      [{ t: '약관', w: '36%' }, { t: '무엇에 쓰나' }],
      PA_TERMS.map((t) => [`<b>${U.esc(t.t)}</b>`, U.esc(t.d)]),
    ))}</div>
`;
    const 패널 = U.actPanel('결제', U.sumRows([
      ['물건 값', U.won(살것.price)], ['배송비', U.won(살것.ship)], ['포인트 사용', `− ${U.won(쓸포인트)}`],
    ], ['총 결제액', U.won(결제액)])
      + `<p class="t-sub mt3" style="color:var(--danger)">필수 약관 3가지를 다 체크하면 열립니다.</p>`, `
  ${U.btn('결제하기', { cls: 'btn-pri btn-lg', id: 'paybtn2', off: true, attr: ` data-go="${U.link('PA0501')}"` })}
  ${U.btn('결제 화면으로', { href: 'PA0201', cls: 'btn-ghost' })}`, { state: '대기' });

    const body = `
${U.pageHd('약관에 동의해주세요', '필수 3가지를 다 체크해야 결제 단추가 열립니다')}
${U.kpis([
      ['필수 약관', '3', { unit: '가지', d: '모두 동의해야 합니다' }],
      ['체크한 것', '2', { unit: '가지', tone: 'k-ok', d: '안전결제 · 개인정보 제공' }],
      ['남은 것', '1', { unit: '가지', tone: 'k-danger', d: '전자금융거래 이용약관' }],
      ['결제 단추', '잠김', { tone: 'k-warn', d: '체크하면 열립니다' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '필수 약관 1가지를 안 체크해 결제가 잠긴 상태' } };
  },

  /* ── PA0204 결제 진행 중 ────────────────────────────────────── */
  PA0204(ctx) {
    const 본문 = `
${U.card('', `<div class="deadline">
  <div class="t-sub">결제창에서 끝내 주세요</div>
  <div class="big">결제 진행 중…</div>
  <p class="t-sub mt2">카드사 창이 열려 있습니다. <b>창을 닫지 마세요.</b>
  끝나면 이 화면이 저절로 다음으로 넘어갑니다.</p>
</div>`)}

<div class="mt-block">${U.sec('지금 무슨 일이 일어나고 있나요', U.timeline([
      ['결제 요청을 보냈어요', '방금'],
      ['카드사 창에서 확인 중', '기다리는 중'],
      ['결제 결과 받기', ''],
      ['판매자에게 알림 보내기', ''],
    ], 1))}</div>

<div class="mt-block">${U.sec('알아 두실 것', `<div class="stack-sm">
  ${U.banner('info', '🔒', `<b>결제 단추는 지금 눌리지 않습니다.</b>
    <div class="t-sub mt1">두 번 눌러 두 번 결제되는 일을 막으려고 잠가 두었어요.</div>`)}
  ${U.banner('warn', '⚠', `<b>창을 닫으면 결제가 끊깁니다.</b>
    <div class="t-sub mt1">끊기면 「결제가 끝나지 않았어요」라고 알려 드리고, 처음부터 다시 하시면 됩니다.</div>`)}
  ${U.banner('quiet', '🕒', `<b>취소하면 매물 홀드가 풀립니다.</b>
    <div class="t-sub mt1">결제하는 동안 다른 사람이 못 사도록 이 매물을 잠깐 잡아 둡니다.
    취소하면 곧바로 풀려 다른 사람이 살 수 있어요.</div>`)}
</div>`)}</div>
`;
    const 패널 = U.actPanel('매물 홀드', `<div class="deadline" style="padding:var(--s4)">
  <div class="t-sub">홀드가 풀리기까지</div>
  <div class="big" data-count="${PA_HOLD_SEC}">9:40</div>
</div>
<p class="t-sub mt3">이 시간 안에 결제를 끝내지 않으면 매물이 다시 열립니다.</p>
<div class="mt3">${U.sumRows([['물건 값', U.won(살것.price)], ['배송비', U.won(살것.ship)], ['포인트 사용', `− ${U.won(쓸포인트)}`]], ['총 결제액', U.won(결제액)])}</div>`, `
  ${U.btn('결제 중…', { cls: 'btn-pri btn-lg', id: 'paying', off: true })}
  ${U.btn('결제 취소하고 돌아가기', { cls: 'btn-ghost', attr: ' data-toast="결제를 취소했어요 · 매물 홀드가 풀렸습니다" data-go="' + U.link('PA0201') + '"' })}
  ${U.btn('결제가 실패하면', { href: 'PA0205', cls: 'btn-quiet' })}`, { state: '처리중' });

    const body = `
${U.pageHd('결제 진행 중', '카드사 창에서 확인을 마치면 저절로 넘어갑니다')}
${U.kpis([
      ['총 결제액', U.num(결제액), { unit: '원', d: U.esc(살것.t) }],
      ['지금 상태', '카드사 확인 중', { tone: 'k-warn', d: '창을 닫지 마세요' }],
      ['결제 단추', '잠김', { tone: 'k-mut', d: '중복 결제를 막는 중' }],
      ['매물 홀드', '9분 40초', { tone: 'k-danger', d: '지나면 다른 사람이 살 수 있어요' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '결제창을 기다리는 중 — 단추가 잠겨 있습니다' } };
  },

  /* ── PA0205 결제 실패 ───────────────────────────────────────── */
  PA0205(ctx) {
    const 본문 = `
${U.banner('dan', '⛔', `<b>결제가 되지 않았어요 — 한도 초과</b>
  <div class="t-sub mt1">${PA_FAILS[0].why} 돈은 빠져나가지 않았습니다.</div>`)}

<div class="mt-block">${U.sec('흔한 사유와 다음에 할 일', U.dashTable(
      [{ t: '사유', w: '148px' }, { t: '무슨 뜻인가' }, { t: '어떻게 하나' }],
      PA_FAILS.map((f, i) => ({
        cls: i === 0 ? 'on' : '',
        cells: [
          `${U.badge(f.k, i === 0 ? 'b-dan' : 'b-mut')}`,
          U.esc(f.why),
          `<b>${U.esc(f.how)}</b>`,
        ],
      })),
    ))}</div>

<div class="mt-block">${U.sec('다른 수단으로 해 보기', `<div class="g3">
  ${PA_PAYS.map((p, i) => `${U.card(p.k, `<p class="t-sub">${U.esc(p.d)}</p>
    <p class="t-sub mt2">${p.lim}</p>
    <div class="mt4">${U.btn(`${p.k}로 다시 하기`, { href: 'PA0202', cls: i === 2 ? 'btn-pri btn-block' : 'btn-ghost btn-block' })}</div>`)}`).join('')}
</div>`, { desc: '한도에 걸렸다면 계좌이체가 가장 넉넉합니다.' })}</div>

<div class="mt-block">${U.banner('quiet', '🔁', `<b>몇 번을 다시 해도 값이 두 번 빠지지 않습니다.</b>
  <div class="t-sub mt1">실패한 결제는 승인 자체가 나지 않은 것이라 취소할 것도 없어요.</div>`)}</div>
`;
    const 패널 = U.actPanel('매물 홀드', `<div class="deadline" style="padding:var(--s4)">
  <div class="t-sub">홀드가 풀리기까지</div>
  <div class="big" style="color:var(--danger)" data-count="${PA_HOLD_SEC}">9:40</div>
</div>
<p class="t-sub mt3">이 시간이 지나면 매물이 다시 열려 다른 사람이 살 수 있어요.</p>`, `
  ${U.btn('다시 시도하기', { href: 'PA0201', cls: 'btn-pri btn-lg' })}
  ${U.btn('다른 수단으로 하기', { href: 'PA0202', cls: 'btn-ghost' })}
  ${U.btn('안전결제 안내로', { href: 'PA0101', cls: 'btn-ghost' })}`, { state: '보류' });

    const body = `
${U.pageHd('결제가 되지 않았어요', '돈은 빠져나가지 않았습니다. 사유를 보고 다시 해 보세요')}
${U.kpis([
      ['결과', '실패', { tone: 'k-danger', d: PA_FAILS[0].k }],
      ['빠져나간 돈', '0', { unit: '원', tone: 'k-ok', d: '승인이 나지 않았어요' }],
      ['총 결제액', U.num(결제액), { unit: '원', tone: 'k-mut', d: '다시 하면 이 값입니다' }],
      ['매물 홀드', '9분 40초', { tone: 'k-warn', d: '이 안에 다시 해 주세요' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '결제 실패 — 한도 초과' } };
  },

  /* ══════════ PA03 발송 등록 (판매자) ═══════════════════════════ */

  PA0301(ctx) {
    const 운송장안내 = PA_CARRIERS.reduce((o, c) => { o[c.k] = `${c.k}${U.조사붙이기(c.k, '은', '는')} <b>${c.len}</b>예요.`; return o; }, { 고르기: '택배사를 먼저 골라 주세요.' });

    const 본문 = `
${거래머리(판물건, 사는이, '사는 쪽', {
      after: `<div class="mt4">${U.kv([
        ['받는 사람', `${U.esc(사는이.nick)} (010-****-0000)`],
        ['받는 주소', `${U.esc(PA_ADDRS[0].addr)} (${PA_ADDRS[0].zip})`],
        ['배송 요청', PA_SHIP_MEMOS[0]],
        ['결제', `${U.won(판거래.price)} · ${판거래.paidAt} 결제됨`],
      ])}</div>`,
    })}

<div class="mt-block">${U.card('', 기한상자('발송 기한까지', PA_SHIP_LEFT, PA_SHIP_LEFT_SEC, {
      note: `기한을 넘기면 <b>자동으로 취소되고 구매자에게 전액 환불</b>됩니다. 못 보내게 되셨으면 아래에서 미리 알려 주세요.`,
    }) + `<div class="mt3 center">${U.btn('기한이 얼마 안 남으면', { href: 'PA0302', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

<div class="mt-block">${U.card('운송장 등록', `
  <div class="fld"><label class="lb" for="cr">택배사</label>
    <select class="input" id="cr" data-sel-text="carrier" data-sel-show="carrier">
      <option>고르기</option>${PA_CARRIERS.map((c, i) => `<option${i === 0 ? ' selected' : ''}>${c.k}</option>`).join('')}</select></div>
  <div class="fld"><label class="lb" for="tr">운송장 번호</label>
    <input class="input" id="tr" type="text" inputmode="numeric" placeholder="${PA_CARRIERS[0].ph}">
    <p class="t-sub mt1" data-sel-out="carrier" data-sel-map='${JSON.stringify(운송장안내).replace(/'/g, '&#39;')}'>${PA_CARRIERS[0].k}${U.조사붙이기(PA_CARRIERS[0].k, '은', '는')} <b>${PA_CARRIERS[0].len}</b>예요.</p></div>
  <p class="t-sub">자릿수가 안 맞으면 등록할 때 붉은 안내가 뜹니다.
  ${U.btn('자릿수·형식 검사 보기', { href: 'PA0303', cls: 'btn-ghost btn-xs' })}</p>
  <div class="mt4">${U.btn('택배 말고 직접 만나서 전달했어요', { href: 'PA0304', cls: 'btn-line' })}</div>`)}</div>

<div class="mt-block">${U.card('포장 사진 (안 넣어도 돼요)', `
  <div class="photo-grid">
    ${[1, 2, 3].map((i) => `<div class="photo-cell">
      <label class="check none" style="position:absolute;top:6px;left:6px;z-index:1;padding:0">
        <input type="checkbox" data-pick${i === 1 ? ' checked' : ''}></label>
      ${U.phFix(['포장 사진', 1200, 900], 160, { seed: 'pack' + i })}</div>`).join('')}
    <button class="photo-add" type="button" data-toast="포장 사진을 골라 주세요 (최대 5장)">
      <span style="font-size:22px">＋</span><span>사진 추가</span></button>
  </div>
  <div class="banner banner-quiet mt3" data-pick-bar hidden>
    <span class="ico">🖼</span><div class="grow">사진 <b data-pick-n>0</b>장을 골랐어요</div>
    <button class="btn btn-ghost btn-sm" type="button" data-pick-go data-toast="고른 사진을 지웠어요">고른 것 지우기</button></div>
  <p class="t-sub mt3" data-pick-empty hidden>아직 고른 사진이 없어요.</p>
  <div class="mt4">${U.accordion([{ q: '포장할 때 조심할 것', a: `<ul class="dots">${PA_PACK_TIPS.map((t) => `<li>${U.esc(t)}</li>`).join('')}</ul>` }], -1)}</div>`)}</div>

<div class="mt-block">${U.banner('info', '🔔', `<b>등록하면 ${U.esc(사는이.nick)}님에게 알림이 갑니다.</b>
  <div class="t-sub mt1">배송 조회가 붙고, 물건이 도착하면 「받았어요」를 누를 수 있게 됩니다.</div>`)}</div>

<div class="mt-block">${U.sec('못 보내게 됐을 때', U.card('', `
  <p class="t-sub">기한 안에 못 보낼 것 같으면 미리 취소를 요청하세요.
  구매자에게 사유가 그대로 전해지고 전액 환불됩니다. 취소가 잦으면 판매가 제한될 수 있어요.</p>
  <div class="mt4">${U.btn('발송 취소 요청하기', { cls: 'btn-danger', attr: ' data-modal="pa-cancel"' })}
  ${U.btn('단계별 취소 조건 보기', { href: 'PA0504', cls: 'btn-ghost' })}</div>`))}</div>
`;

    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(1, [판거래.paidAt, '', '', ''])}
  ${U.turnLine('내가 보낼 차례예요', PA_SHIP_LEFT)}`, '', { state: '진행중' })
      + U.actPanel('정산 예정', U.feeRows(판거래.price, fee(판거래.price), payout(판거래.price))
        + `<p class="t-sub mt3">구매자가 「받았어요」를 누른 뒤 <b>영업일 ${PA_SETTLE_DAYS}일</b> 안에 들어갑니다.</p>`, `
  ${U.btn('발송 등록하기', { href: 'PA0305', cls: 'btn-pri btn-lg' })}
  ${U.btn('거래 진행 상태 보기', { href: 'PA0501', cls: 'btn-ghost' })}
  ${U.btn('채팅으로', { href: 'CH0201', cls: 'btn-ghost' })}`);

    const 모달 = U.modal('pa-cancel', '발송을 취소할까요?', `
  <p class="t-sub mb3">구매자에게 사유가 그대로 전달되고 전액 환불됩니다.</p>
  <div class="stack-sm">${PA_CANCEL_REASONS.filter((r) => r.side !== '구매').map((r, i) =>
      `<label class="radio${i === 0 ? ' on' : ''}"><input type="radio" name="pcx"${i === 0 ? ' checked' : ''}>${U.esc(r.k)}</label>`).join('')}</div>
  ${U.banner('warn', '⚠', '<b>취소가 잦으면 판매가 제한될 수 있어요.</b>', { cls: 'mt3' })}`,
      U.btn('그냥 둘게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
      + U.btn('취소 요청 보내기', { cls: 'btn-danger', attr: ' data-dismiss data-toast="취소를 요청했어요 · 구매자에게 알렸습니다"' }));

    const body = `
${U.pageHd('발송 등록', `${U.esc(사는이.nick)}님이 산 ${U.esc(판물건.t)}${U.조사붙이기(판물건.t, '을', '를')} 보냅니다`)}
${U.kpis([
      ['받은 돈', U.num(판거래.price), { unit: '원', d: `${판거래.paidAt} 결제됨` }],
      ['발송 기한', PA_SHIP_LEFT, { tone: 'k-warn', d: '넘기면 자동 취소·환불', href: 'PA0302' }],
      ['정산 예정액', U.num(payout(판거래.price)), { unit: '원', tone: 'k-ok', d: `수수료 ${U.won(fee(판거래.price))} 뺀 값` }],
      ['지금 차례', '나(판매자)', { tone: 'k-acc', d: '운송장을 올려 주세요' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { after: 모달 } };
  },

  /* ── PA0302 발송 기한 카운트 ────────────────────────────────── */
  PA0302(ctx) {
    const 본문 = `
${U.banner('dan', '⏰', `<b>발송 기한이 하루도 안 남았어요.</b>
  <div class="t-sub mt1">기한을 넘기면 거래가 <b>자동으로 취소되고 구매자에게 전액 환불</b>됩니다.</div>`)}

<div class="mt-block">${U.card('', 기한상자('발송 기한까지', PA_SHIP_URGENT, PA_SHIP_URGENT_SEC, {
      danger: true,
      note: '24시간 밑으로 내려가면 숫자가 붉게 바뀝니다. 지금이 그 상태예요.',
    }))}</div>

<div class="mt-block">${거래머리(판물건, 사는이, '사는 쪽')}</div>

<div class="mt-block">${U.sec('기한을 넘기면 어떻게 되나요', U.timeline([
      ['기한이 지남', '남은 시간 0'],
      ['거래가 자동으로 취소됨', '곧바로'],
      ['구매자에게 전액 환불', '영업일 1~3일'],
      ['판매자에게 취소 기록이 남음', '잦으면 판매 제한'],
    ], 0), { desc: '아무도 누르지 않아도 저절로 굴러가는 절차입니다.' })}</div>

<div class="mt-block">${U.sec('지금 할 수 있는 것', U.dashTable(
      [{ t: '지금 하면', w: '30%' }, { t: '어떻게 되나' }],
      [
        ['<b>운송장을 올린다</b>', '거래가 ③ 수령 확인으로 넘어갑니다. 가장 좋은 길이에요.'],
        ['<b>직접 만나서 전달한다</b>', `운송장 없이 「만나서 전달」로 바꿉니다. ${U.esc(사는이.nick)}님이 받았다고 누르면 정산됩니다.`],
        ['<b>취소를 요청한다</b>', '구매자에게 사유가 전해지고 전액 환불됩니다. 취소 기록이 남습니다.'],
        ['<span class="muted">아무것도 안 한다</span>', '<span class="muted">기한이 지나면 자동 취소·환불됩니다. 가장 나쁜 길입니다.</span>'],
      ],
    ))}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(1, [판거래.paidAt, '', '', ''])}
  ${U.turnLine('내가 보낼 차례예요', PA_SHIP_URGENT)}`, '', { state: '진행중' })
      + U.actPanel('', '', `
  ${U.btn('지금 운송장 올리기', { href: 'PA0301', cls: 'btn-pri btn-lg' })}
  ${U.btn('직접 전달로 바꾸기', { href: 'PA0304', cls: 'btn-ghost' })}
  ${U.btn('취소 절차 보기', { href: 'PA0504', cls: 'btn-ghost' })}
  ${U.btn('구매자에게 채팅', { href: 'CH0201', cls: 'btn-quiet' })}`);

    const body = `
${U.pageHd('발송 기한이 얼마 남지 않았어요', '남은 시간을 실시간으로 셉니다')}
${U.kpis([
      ['남은 시간', PA_SHIP_URGENT, { tone: 'k-danger', d: '24시간 밑 — 붉게 표시' }],
      ['넘기면', '자동 취소', { tone: 'k-warn', d: '구매자에게 전액 환불' }],
      ['환불될 돈', U.num(판거래.price + 판거래.ship), { unit: '원', tone: 'k-mut', d: '물건 값 + 배송비' }],
      ['못 받게 될 정산', U.num(payout(판거래.price)), { unit: '원', tone: 'k-acc', d: '지금 보내면 받습니다' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '발송 기한 24시간 미만 — 자동 취소가 다가옵니다' } };
  },

  /* ── PA0303 택배사·운송장 입력 ──────────────────────────────── */
  PA0303(ctx) {
    const 운송장안내 = PA_CARRIERS.reduce((o, c) => { o[c.k] = `${c.k}${U.조사붙이기(c.k, '은', '는')} <b>${c.len}</b>예요.`; return o; }, { 고르기: '택배사를 먼저 골라 주세요.' });
    const 본문 = `
${U.card('택배사와 운송장', `
  <div class="fld"><label class="lb" for="cr2">택배사 — 고르면 아래 안내가 바뀝니다</label>
    <select class="input" id="cr2" data-sel-text="carrier2">
      <option>고르기</option>${PA_CARRIERS.map((c, i) => `<option${i === 3 ? ' selected' : ''}>${c.k}</option>`).join('')}</select></div>
  <div class="fld"><label class="lb" for="tr2">운송장 번호</label>
    <input class="input" id="tr2" type="text" value="12345" style="border-color:var(--danger)">
    <p class="t-sub mt1" style="color:var(--danger)"><b>자릿수가 맞지 않아요.</b> 적으신 것은 5자리입니다.</p>
    <p class="t-sub mt1" data-sel-out="carrier2" data-sel-map='${JSON.stringify(운송장안내).replace(/'/g, '&#39;')}'>${PA_CARRIERS[3].k}${U.조사붙이기(PA_CARRIERS[3].k, '은', '는')} <b>${PA_CARRIERS[3].len}</b>예요.</p></div>`)}

<div class="mt-block">${U.sec('택배사별 운송장 자릿수', U.dashTable(
      [{ t: '택배사', w: '148px' }, { t: '자릿수' }, { t: '보기', w: '190px' }],
      PA_CARRIERS.map((c, i) => ({
        cls: i === 3 ? 'on' : '',
        cells: [`<b>${c.k}</b>`, c.len, `<span class="muted">${c.ph}</span>`],
      })),
    ), { desc: '택배사를 바꾸면 위 입력칸 아래 안내도 함께 바뀝니다.' })}</div>

<div class="mt-block">${U.sec('형식 검사는 이렇게 합니다', U.dashTable(
      [{ t: '적은 것', w: '34%' }, { t: '어떻게 되나' }],
      [
        ['<span class="muted">12345</span>', '<b style="color:var(--danger)">자릿수가 모자랍니다.</b> 등록할 수 없어요.'],
        ['<span class="muted">1234-5678-9012</span>', '가운데 줄표는 지우고 숫자만 셉니다. 12자리로 봅니다.'],
        ['<span class="muted">EE123456789KR</span>', '우체국택배는 영문이 섞일 수 있어 그대로 받습니다.'],
        ['<b>6712339044 18</b>', '<b style="color:var(--pri-text,var(--primary))">맞습니다.</b> 등록하면 배송 조회가 붙습니다.'],
      ],
    ))}</div>

<div class="mt-block">${U.banner('info', '🚚', `<b>등록하면 배송 조회가 붙습니다.</b>
  <div class="t-sub mt1">구매자 화면에 이동 기록이 그대로 보이고, 도착하면 「받았어요」 단추가 열립니다.</div>`,
      { right: U.btn('배송 조회 화면', { href: 'PA0503', cls: 'btn-ghost btn-sm' }) })}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(1, [판거래.paidAt, '', '', ''])}
  ${U.turnLine('운송장을 올릴 차례예요', PA_SHIP_LEFT)}`, '', { state: '진행중' })
      + U.actPanel('', `<p class="t-sub">자릿수가 맞아야 등록됩니다. 지금은 5자리라 잠겨 있어요.</p>`, `
  ${U.btn('발송 등록하기', { cls: 'btn-pri btn-lg', id: 'ship-locked', off: true })}
  ${U.btn('발송 등록 화면으로', { href: 'PA0301', cls: 'btn-ghost' })}
  ${U.btn('직접 전달로 바꾸기', { href: 'PA0304', cls: 'btn-ghost' })}`);

    const body = `
${U.pageHd('택배사·운송장 입력', '택배사를 고르면 자릿수 안내가 바뀌고, 형식이 안 맞으면 붉게 알려 줍니다')}
${U.kpis([
      ['고른 택배사', PA_CARRIERS[3].k, { d: PA_CARRIERS[3].len }],
      ['적은 자릿수', '5', { unit: '자리', tone: 'k-danger', d: '13자리가 필요해요' }],
      ['등록 단추', '잠김', { tone: 'k-warn', d: '자릿수가 맞으면 열립니다' }],
      ['택배사 수', U.num(PA_CARRIERS.length), { unit: '곳', tone: 'k-mut', d: '자릿수가 저마다 다릅니다' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '운송장 자릿수가 맞지 않는 상태' } };
  },

  /* ── PA0304 직접 전달로 바꾸기 ──────────────────────────────── */
  PA0304(ctx) {
    const 본문 = `
${U.banner('info', '🤝', `<b>「만나서 전달」로 바꿨어요.</b>
  <div class="t-sub mt1">운송장 입력칸을 닫았습니다. 이제 배송 조회 대신 <b>구매자의 수령 확인</b>으로만 거래가 넘어갑니다.</div>`)}

<div class="mt-block">${거래머리(판물건, 사는이, '사는 쪽')}</div>

<div class="mt-block">${U.card('보내는 방법', `
  <div class="stack-sm">
    <label class="radio"><input type="radio" name="way2">
      <b>택배로 보내기</b><span class="d">택배사와 운송장을 적습니다. 배송 조회가 붙어요.</span></label>
    <label class="radio on"><input type="radio" name="way2" checked>
      <b>만나서 전달하기</b><span class="d">운송장이 없습니다. 구매자가 「받았어요」를 눌러야 정산됩니다.</span></label>
  </div>
  <div class="sub-fld mt4" hidden>
    <p class="t-sub">운송장 입력칸은 닫혀 있습니다 — 「택배로 보내기」를 고르면 다시 열립니다.</p>
  </div>
  <div class="mt4">${U.btn('택배로 되돌리기', { href: 'PA0303', cls: 'btn-ghost' })}</div>`)}</div>

<div class="mt-block">${U.sec('만나서 전달할 때 달라지는 것', U.dashTable(
      [{ t: '무엇이', w: '30%' }, { t: '택배' }, { t: '만나서 전달' }],
      [
        ['<b>배송 조회</b>', '붙습니다', '<span class="muted">없습니다</span>'],
        ['<b>정산 방아쇠</b>', '구매확정 또는 7일 자동 확정', '<b>구매자의 수령 확인으로만</b>'],
        ['<b>자동 구매확정</b>', '배달 완료 뒤 7일', '<span class="muted">없습니다 — 눌러 주어야 합니다</span>'],
        ['<b>다툼이 생기면</b>', '이동 기록이 증거가 됩니다', '채팅과 사진으로 가립니다'],
      ],
    ))}</div>

<div class="mt-block">${U.banner('warn', '⚠', `<b>만나서 전달은 자동 확정이 없습니다.</b>
  <div class="t-sub mt1">구매자가 「받았어요」를 누르지 않으면 정산이 시작되지 않아요. 만난 자리에서 눌러 달라고 부탁하세요.</div>`,
      { right: U.btn('안전거래존 보기', { href: 'HO0301', cls: 'btn-ghost btn-sm' }) })}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(1, [판거래.paidAt, '', '', ''])}
  ${U.turnLine('만나서 전달할 차례예요', PA_SHIP_LEFT)}`, '', { state: '진행중' })
      + U.actPanel('정산 예정', U.feeRows(판거래.price, fee(판거래.price), payout(판거래.price))
        + `<p class="t-sub mt3">구매자가 수령을 확인하면 영업일 ${PA_SETTLE_DAYS}일 안에 들어갑니다.</p>`, `
  ${U.btn('만나서 전달했어요 — 등록', { href: 'PA0305', cls: 'btn-pri btn-lg' })}
  ${U.btn('약속 잡기', { href: 'CH0301', cls: 'btn-ghost' })}
  ${U.btn('채팅으로', { href: 'CH0201', cls: 'btn-ghost' })}`);

    const body = `
${U.pageHd('직접 만나서 전달하기', '운송장 없이 진행합니다 — 구매자의 수령 확인으로만 정산돼요')}
${U.kpis([
      ['보내는 방법', '만나서 전달', { tone: 'k-acc', d: '운송장 칸을 닫았어요' }],
      ['배송 조회', '없음', { tone: 'k-mut', d: '이동 기록이 남지 않습니다' }],
      ['자동 구매확정', '없음', { tone: 'k-warn', d: '구매자가 눌러야 합니다' }],
      ['정산 예정액', U.num(payout(판거래.price)), { unit: '원', tone: 'k-ok', d: `수수료 ${U.won(fee(판거래.price))} 뺀 값` }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '만나서 전달로 바꾼 상태 — 운송장 칸이 닫혔습니다' } };
  },

  /* ── PA0305 발송 등록 완료 ──────────────────────────────────── */
  PA0305(ctx) {
    const 본문 = `
${U.banner('ok', '✅', `<b>${U.esc(사는이.nick)}님에게 알렸어요.</b>
  <div class="t-sub mt1">구매자 화면에 배송 조회가 붙었고, 물건이 도착하면 「받았어요」 단추가 열립니다.</div>`)}

<div class="mt-block">${U.card('등록한 것', U.kv([
      ['택배사', PA_CARRIERS[0].k],
      ['운송장 번호', `<b>${판거래.track.replace(/^\S+\s/, '')}</b>`],
      ['보낸 때', 판거래.sentAt],
      ['받는 사람', `${U.esc(사는이.nick)} · ${U.esc(PA_ADDRS[0].addr)}`],
    ]) + `<div class="mt4">${U.btn('배송 조회 보기', { href: 'PA0503', cls: 'btn-ghost btn-sm' })}
    ${U.btn('운송장 고치기', { href: 'PA0303', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

<div class="mt-block">${거래머리(판물건, 사는이, '사는 쪽')}</div>

<div class="mt-block">${U.card('', 기한상자('자동 구매확정까지', PA_CONFIRM_LEFT, 5 * 86400 + 12 * 3600, {
      note: `구매자가 아무것도 누르지 않아도 이 기간이 지나면 <b>자동으로 구매확정</b>되고, 영업일 ${PA_SETTLE_DAYS}일 안에 정산됩니다.`,
    }))}</div>

<div class="mt-block">${U.sec('다음은 이렇게 흘러갑니다', U.timeline([
      ['결제', 판거래.paidAt],
      ['발송 등록', 판거래.sentAt],
      ['구매자 수령 확인', `${PA_CONFIRM_LEFT} 안에 (안 누르면 자동 확정)`],
      ['정산', `확정 뒤 영업일 ${PA_SETTLE_DAYS}일`],
    ], 2))}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(2, [판거래.paidAt, 판거래.sentAt, '', ''])}
  ${U.turnLine('구매자가 받았다고 누르기를 기다리는 중', 판거래.left)}`, '', { state: '진행중' })
      + U.actPanel('정산 예정', U.feeRows(판거래.price, fee(판거래.price), payout(판거래.price)), `
  ${U.btn('거래 진행 상태 보기', { href: 'PA0501', cls: 'btn-pri btn-lg' })}
  ${U.btn('채팅으로', { href: 'CH0201', cls: 'btn-ghost' })}
  ${U.btn('발송 등록 화면으로', { href: 'PA0301', cls: 'btn-ghost' })}`);

    const body = `
${U.pageHd('발송 등록을 마쳤어요', `${U.esc(판물건.t)} · ${판거래.track}`)}
${U.kpis([
      ['등록 결과', '알림 보냄', { tone: 'k-ok', d: `${U.esc(사는이.nick)}님에게 갔어요` }],
      ['보낸 때', 판거래.sentAt, { tone: 'k-mut', d: PA_CARRIERS[0].k }],
      ['자동 구매확정까지', PA_CONFIRM_LEFT, { tone: 'k-warn', d: '지나면 저절로 확정됩니다' }],
      ['정산 예정액', U.num(payout(판거래.price)), { unit: '원', tone: 'k-acc', d: `확정 뒤 영업일 ${PA_SETTLE_DAYS}일` }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '발송 등록 완료 — 구매자의 수령 확인을 기다립니다' } };
  },

  /* ══════════ PA04 수령 확인·구매확정 ═══════════════════════════ */

  PA0401(ctx) {
    const 낸돈 = 산거래.price + 산거래.ship;
    const 본문 = `
${U.card('배송', `<div class="row-b wrap-row">
  <div class="row-c" style="gap:12px">${U.phItem(56, 살것.id)}
    <div><b>${U.esc(살것.t)}</b>
      <p class="t-sub mt1">${U.esc(파는이.nick)}님이 보냈어요 · ${PA_TRACK_NO}</p></div></div>
  ${U.stBadge('도착')}</div>
<div class="mt4">${배송기록()}</div>
<div class="mt3">${U.btn('이동 기록 펼쳐 보기', { href: 'PA0503', cls: 'btn-ghost btn-sm' })}</div>`)}

<div class="mt-block">${U.card('', 기한상자('자동 구매확정까지', PA_CONFIRM_LEFT, 5 * 86400 + 12 * 3600, {
      note: `이 시간이 지나면 <b>자동으로 확정</b>되고 판매자에게 돈이 넘어갑니다. 물건에 문제가 있으면 그 전에 알려 주세요.`,
    }) + `<div class="mt3 center">${U.btn('하루 밑으로 남으면', { href: 'PA0402', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

<div class="mt-block">${U.card('물건은 어떤가요', `
  <div class="stack-sm">
    ${PA_COND_PICK.map((c, i) => `<label class="radio${i === 0 ? ' on' : ''}">
      <input type="radio" name="pcond"${i === 0 ? ' checked' : ''}${i === 0 ? ' data-unlock="confirmbtn"' : ''}>
      <b>${c.k}</b><span class="d">${c.d}</span></label>`).join('')}
  </div>
  <div class="sub-fld mt4">
    <p class="t-sub mb2">「설명과 달라요」를 고르면 이렇게 바뀝니다 —
    ${U.btn('그 화면 보기', { href: 'PA0403', cls: 'btn-ghost btn-xs' })}</p>
    <div class="photo-grid">
      <button class="photo-add" type="button" data-toast="다른 점이 보이게 찍어 주세요 (최대 5장)">
        <span style="font-size:22px">＋</span><span>사진 추가</span></button>
    </div>
    <textarea class="input mt3" rows="3" placeholder="무엇이 어떻게 다른지 적어 주세요"></textarea>
  </div>`)}</div>

<div class="mt-block">${U.sec('반품을 요청하려면', `
  ${U.card('', U.timeline([
      ['구매확정을 누르기 전에 신청', '받은 날부터 7일 안에'],
      ['사진과 사유를 냅니다', '최대 5장'],
      ['판매자가 받아들이면 물건을 되돌려 보냅니다', ''],
      ['판매자가 받은 것을 확인하면 환불', '영업일 1~3일'],
    ], 0))}
  <div class="mt-block">${U.accordion(PA_RETURN, -1)}</div>`)}</div>

<div class="mt-block">${U.sec('말이 안 통하면 — 분쟁 신청', U.card('', `
  <p class="t-sub">분쟁을 넣으면 <b>정산이 멈춥니다.</b> 운영자가 양쪽 사진과 대화를 보고
  ${PA_DISPUTE_RESULTS.map((r) => `<b>${r}</b>`).join(' · ')} 가운데 하나로 판단합니다. 보통 영업일 3일쯤 걸려요.</p>
  <div class="mt4">${U.btn('분쟁 진행 화면 보기', { href: 'PA0505', cls: 'btn-ghost' })}
  ${U.btn('신고하기', { href: 'CH0401', cls: 'btn-danger' })}</div>`))}</div>
`;

    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(2, [산거래.paidAt, PA_TRACK[0][1], '', ''])}
  ${U.turnLine('내가 확인할 차례예요', PA_CONFIRM_LEFT)}`, '', { state: '진행중' })
      + U.actPanel('낸 돈', U.sumRows([
        ['물건 값', U.won(산거래.price)],
        ['배송비', U.won(산거래.ship)],
      ], ['모두', U.won(낸돈)])
      + `<label class="check mt4"><input type="checkbox" data-unlock="confirmbtn">
        <span>물건을 <b>열어 보고</b> 확인했어요 — 체크하면 확정 단추가 열립니다</span></label>
      <p class="t-sub mt2">확정하면 <b>${U.won(산거래.price)}</b>${U.조사붙이기(U.won(산거래.price), '이', '가')} ${U.esc(파는이.nick)}님에게 갑니다.
      누르면 <a class="link" href="${U.link('PA0404')}">되돌릴 수 없다는 확인 창</a>이 먼저 뜹니다.</p>`, `
  ${U.btn('받았어요 — 구매확정', { cls: 'btn-pri btn-lg', id: 'confirmbtn', off: true, attr: ' data-modal="pa-ok"' })}
  ${U.btn('거래 진행 상태 보기', { href: 'PA0501', cls: 'btn-ghost' })}
  ${U.btn('후기 남기기', { href: 'MY0401', cls: 'btn-ghost' })}
  ${U.btn('신고하기', { href: 'CH0401', cls: 'btn-quiet' })}`)
      + U.actPanel('', U.banner('warn', '⚠', `<b>확정하기 전에 꼭 열어 보세요.</b>
    <div class="t-sub mt1">확정하면 돈이 판매자에게 넘어가 되돌리기 어렵습니다.</div>`), '');

    const 모달 = U.modal('pa-ok', '구매를 확정할까요?', `
  <p style="font-size:16px"><b>${U.won(산거래.price)}</b>${U.조사붙이기(U.won(산거래.price), '이', '가')} ${U.esc(파는이.nick)}님에게 갑니다.</p>
  ${U.banner('warn', '⚠', '<b>되돌릴 수 없어요.</b> 물건에 문제가 있으면 지금 멈추고 알려 주세요.', { cls: 'mt3' })}
  <div class="mt3">${U.kv([['물건', U.esc(살것.t)], ['판매자', U.esc(파는이.nick)], ['넘어갈 돈', U.won(산거래.price)]])}</div>
  <p class="t-sub mt3">확정한 뒤에는 후기를 남길 수 있어요.</p>`,
      U.btn('아직요', { cls: 'btn-ghost', attr: ' data-dismiss' })
      + U.btn('확정하기', { href: 'PA0405', cls: 'btn-pri' }));

    const body = `
${U.pageHd('수령 확인·구매확정', `${U.esc(살것.t)} · ${U.esc(파는이.nick)}님에게서 샀어요`)}
${U.kpis([
      ['배송', '도착', { tone: 'k-ok', d: `${PA_TRACK[PA_TRACK.length - 1][1]} 배달 완료`, href: 'PA0503' }],
      ['자동 확정까지', PA_CONFIRM_LEFT, { tone: 'k-warn', d: '지나면 저절로 확정돼요', href: 'PA0402' }],
      ['낸 돈', U.num(낸돈), { unit: '원', d: `물건 값 + 배송비` }],
      ['판매자에게 갈 돈', U.num(산거래.price), { unit: '원', tone: 'k-acc', d: '확정하면 넘어갑니다' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { after: 모달 } };
  },

  /* ── PA0402 자동 확정 카운트 ────────────────────────────────── */
  PA0402(ctx) {
    const 본문 = `
${U.banner('dan', '⏰', `<b>하루도 안 남았어요 — 지나면 자동으로 확정돼요.</b>
  <div class="t-sub mt1">자동 확정되면 ${U.won(산거래.price)}${U.조사붙이기(U.won(산거래.price), '이', '가')} ${U.esc(파는이.nick)}님에게 넘어가고 되돌리기 어렵습니다.</div>`)}

<div class="mt-block">${U.card('', 기한상자('자동 구매확정까지', PA_CONFIRM_URGENT, PA_CONFIRM_URGENT_SEC, {
      danger: true,
      note: '하루 밑으로 내려가면 숫자가 붉게 바뀝니다. 지금이 그 상태예요.',
    }))}</div>

<div class="mt-block">${U.card('아직 못 열어 봤다면', `
  <p class="t-sub">집을 비웠거나 물건을 아직 못 열어 봤으면 기간을 늘려 달라고 할 수 있어요.
  판매자가 받아들이면 <b>3일</b>이 더 붙습니다.</p>
  <div class="fld mt4"><label class="lb" for="why">늘려 달라는 까닭 (안 적어도 돼요)</label>
    <textarea class="input" id="why" rows="3" placeholder="예: 출장 중이라 아직 못 열어 봤어요"></textarea></div>
  ${U.btn('기간 연장 요청 보내기', { cls: 'btn-pri', attr: ' data-toast="연장을 요청했어요 · 판매자가 받아들이면 3일이 더 붙습니다"' })}`)}</div>

<div class="mt-block">${U.sec('시간이 지나면 이렇게 됩니다', U.timeline([
      ['남은 시간 0', PA_CONFIRM_URGENT + ' 뒤'],
      ['자동으로 구매확정', '곧바로'],
      [`판매자에게 ${U.won(산거래.price)} 정산 시작`, `영업일 ${PA_SETTLE_DAYS}일`],
      ['후기를 쓸 수 있게 됨', '확정 뒤 30일 안에'],
    ], 0))}</div>

<div class="mt-block">${U.banner('warn', '⚠', `<b>물건에 문제가 있으면 «지금» 알려 주세요.</b>
  <div class="t-sub mt1">확정 뒤에는 반품·분쟁을 넣기 어렵습니다.</div>`,
      { right: U.btn('설명과 달라요', { href: 'PA0403', cls: 'btn-ghost btn-sm' }) })}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(2, [산거래.paidAt, PA_TRACK[0][1], '', ''])}
  ${U.turnLine('내가 확인할 차례예요', PA_CONFIRM_URGENT)}`, '', { state: '진행중' })
      + U.actPanel('', `<p class="t-sub">지금 확정하면 곧바로 정산이 시작됩니다.</p>`, `
  ${U.btn('지금 확정하기', { href: 'PA0401', cls: 'btn-pri btn-lg' })}
  ${U.btn('기간 연장 요청', { cls: 'btn-ghost', attr: ' data-toast="연장을 요청했어요"' })}
  ${U.btn('설명과 다릅니다', { href: 'PA0403', cls: 'btn-ghost' })}
  ${U.btn('판매자에게 채팅', { href: 'CH0201', cls: 'btn-quiet' })}`);

    const body = `
${U.pageHd('자동 구매확정이 얼마 안 남았어요', '지나면 저절로 확정되고 판매자에게 정산됩니다')}
${U.kpis([
      ['남은 시간', PA_CONFIRM_URGENT, { tone: 'k-danger', d: '하루 밑 — 붉게 표시' }],
      ['지나면', '자동 확정', { tone: 'k-warn', d: '되돌리기 어렵습니다' }],
      ['넘어갈 돈', U.num(산거래.price), { unit: '원', tone: 'k-acc', d: `${U.esc(파는이.nick)}님에게` }],
      ['연장하면', '+3일', { tone: 'k-ok', d: '판매자가 받아들일 때' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '자동 구매확정 24시간 미만' } };
  },

  /* ── PA0403 설명과 다름 ─────────────────────────────────────── */
  PA0403(ctx) {
    const 본문 = `
${U.banner('warn', '📷', `<b>「설명과 달라요」를 고르셨어요.</b>
  <div class="t-sub mt1">구매확정 단추를 감췄습니다. 사진과 사유를 내면 반품이나 분쟁으로 넘어갑니다.</div>`)}

<div class="mt-block">${U.card('물건은 어떤가요', `
  <div class="stack-sm">
    ${PA_COND_PICK.map((c, i) => `<label class="radio${i === 1 ? ' on' : ''}">
      <input type="radio" name="pcond2"${i === 1 ? ' checked' : ''}>
      <b>${c.k}</b><span class="d">${c.d}</span></label>`).join('')}
  </div>
  <div class="sub-fld mt4">
    <div class="fld"><span class="lb">무엇이 다른가요 — 고르기</span>
      <div class="stack-sm">${PA_DIFF_REASONS.map((r, i) => `<label class="check"><input type="checkbox"${i === 0 ? ' checked' : ''}><span>${U.esc(r)}</span></label>`).join('')}</div></div>
    <div class="fld"><span class="lb">사진 (최대 5장)</span>
      <div class="photo-grid">
        ${[1, 2].map((i) => `<div class="photo-cell">${U.phFix(['받은 물건 사진', 1200, 900], 160, { seed: 'diff' + i })}</div>`).join('')}
        <button class="photo-add" type="button" data-toast="다른 점이 보이게 찍어 주세요">
          <span style="font-size:22px">＋</span><span>사진 추가</span></button>
      </div>
      <p class="t-sub mt2">판매글 사진과 견줄 수 있게, 같은 자리를 찍어 주시면 좋아요.</p></div>
    <div class="fld"><label class="lb" for="dw">무엇이 어떻게 다른지</label>
      <textarea class="input" id="dw" rows="4">사진에는 없던 긁힘이 오른쪽 아래에 있습니다. 구성품 가운데 케이블이 빠졌어요.</textarea></div>
  </div>`)}</div>

<div class="mt-block">${U.sec('어느 쪽으로 하시겠어요', U.dashTable(
      [{ t: '고르면', w: '28%' }, { t: '어떻게 되나' }, { t: '걸리는 기간', w: '150px' }],
      [
        ['<b>반품 요청</b>', '판매자가 받아들이면 물건을 되돌려 보내고 전액 환불받습니다.', '영업일 1~3일'],
        ['<b>분쟁 신청</b>', '정산이 멈추고 운영자가 양쪽 말을 듣습니다.', '영업일 3일쯤'],
        ['<span class="muted">그냥 확정</span>', '<span class="muted">돈이 넘어갑니다. 뒤에 되돌리기 어렵습니다.</span>', '<span class="muted">즉시</span>'],
      ],
    ))}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(2, [산거래.paidAt, PA_TRACK[0][1], '', ''])}
  ${U.turnLine('내가 알릴 차례예요', PA_CONFIRM_LEFT)}`, '', { state: '진행중' })
      + U.actPanel('구매확정', `<p class="t-sub">「설명과 달라요」를 고르셔서 <b>구매확정 단추를 감췄습니다.</b>
    다시 「설명대로예요」를 고르면 나타납니다.</p>`, `
  ${U.btn('반품 요청하기', { cls: 'btn-pri btn-lg', attr: ' data-toast="반품을 요청했어요 · 판매자에게 사진과 사유가 전해집니다"' })}
  ${U.btn('분쟁 신청하기', { href: 'PA0505', cls: 'btn-danger' })}
  ${U.btn('신고하기', { href: 'CH0401', cls: 'btn-ghost' })}
  ${U.btn('수령 확인 화면으로', { href: 'PA0401', cls: 'btn-quiet' })}`, { state: '보류' });

    const body = `
${U.pageHd('설명과 달라요', '사진과 사유를 내면 반품이나 분쟁으로 넘어갑니다')}
${U.kpis([
      ['고른 상태', '설명과 달라요', { tone: 'k-danger', d: '확정 단추를 감췄어요' }],
      ['낸 사진', '2', { unit: '장', tone: 'k-acc', d: '최대 5장까지' }],
      ['낸 돈', U.num(산거래.price + 산거래.ship), { unit: '원', tone: 'k-mut', d: '아직 맡아 두고 있어요' }],
      ['남은 시간', PA_CONFIRM_LEFT, { tone: 'k-warn', d: '그 전에 알려야 합니다' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '설명과 다름 — 구매확정 단추를 감춘 상태' } };
  },

  /* ── PA0404 구매확정 확인 ───────────────────────────────────── */
  PA0404(ctx) {
    const 확인모달 = U.modalStatic('구매를 확정할까요?', `
  <p style="font-size:17px"><b>${U.won(산거래.price)}</b>${U.조사붙이기(U.won(산거래.price), '이', '가')} ${U.esc(파는이.nick)}님에게 갑니다.</p>
  ${U.banner('dan', '⚠', '<b>되돌릴 수 없어요.</b> 물건에 문제가 있으면 지금 멈추고 알려 주세요.', { cls: 'mt3' })}
  <div class="mt4">${U.kv([
      ['물건', U.esc(살것.t)],
      ['판매자', U.esc(파는이.nick)],
      ['넘어갈 돈', `<b>${U.won(산거래.price)}</b>`],
      ['판매자가 실제로 받는 돈', `${U.won(payout(산거래.price))} <span class="t-sub">(수수료 ${U.won(fee(산거래.price))} 뺀 값)</span>`],
      ['정산 시점', `확정 뒤 영업일 ${PA_SETTLE_DAYS}일 안에`],
    ])}</div>
  <p class="t-sub mt4">확정한 뒤에는 <b>후기</b>를 남길 수 있어요. 후기는 상대의 매너 온도에 반영됩니다.</p>`,
      U.btn('취소', { cls: 'btn-ghost', href: 'PA0401' })
      + U.btn('확정하기', { cls: 'btn-pri', href: 'PA0405' }));

    const 본문 = `
${U.sec('확인 모달은 이렇게 생겼어요', `<div style="max-width:520px">${확인모달}</div>`,
      { desc: '「받았어요 — 구매확정」을 누르면 이 창이 먼저 뜹니다. 되돌릴 수 없는 일이라 한 번 더 묻습니다.' })}

<div class="mt-block">${U.sec('확정을 누르면 무슨 일이 일어나나요', U.timeline([
      ['구매확정', '지금'],
      [`맡아 둔 ${U.won(산거래.price)}이 판매자 몫으로 넘어감`, '곧바로'],
      [`수수료 ${U.won(fee(산거래.price))}${U.조사붙이기(U.won(fee(산거래.price)), '을', '를')} 뺀 ${U.won(payout(산거래.price))} 정산`, `영업일 ${PA_SETTLE_DAYS}일 안에`],
      ['후기 쓰기가 열림', '확정 뒤 30일 안에'],
    ], 0))}</div>

<div class="mt-block">${U.banner('warn', '⚠', `<b>확정 뒤에는 반품·분쟁을 넣기 어렵습니다.</b>
  <div class="t-sub mt1">물건이 설명과 다르면 «누르기 전에» 알려 주세요.</div>`,
      { right: U.btn('설명과 달라요', { href: 'PA0403', cls: 'btn-ghost btn-sm' }) })}</div>
`;
    const 패널 = U.actPanel('이 거래', U.kv([
      ['물건', U.esc(살것.t)],
      ['판매자', U.esc(파는이.nick)],
      ['낸 돈', U.won(산거래.price + 산거래.ship)],
      ['넘어갈 돈', `<b>${U.won(산거래.price)}</b>`],
    ]), `
  ${U.btn('확정하기', { href: 'PA0405', cls: 'btn-pri btn-lg' })}
  ${U.btn('아직요 — 돌아가기', { href: 'PA0401', cls: 'btn-ghost' })}
  ${U.btn('후기 미리 보기', { href: 'MY0401', cls: 'btn-quiet' })}`, { state: '대기' });

    const body = `
${U.pageHd('구매확정 확인', '되돌릴 수 없는 일이라 한 번 더 묻습니다')}
${U.kpis([
      ['넘어갈 돈', U.num(산거래.price), { unit: '원', tone: 'k-danger', d: `${U.esc(파는이.nick)}님에게` }],
      ['되돌리기', '안 됩니다', { tone: 'k-warn', d: '확정 뒤에는 분쟁도 어려워요' }],
      ['판매자 수령액', U.num(payout(산거래.price)), { unit: '원', tone: 'k-ok', d: `수수료 ${U.won(fee(산거래.price))} 뺀 값` }],
      ['정산 시점', `영업일 ${PA_SETTLE_DAYS}일`, { tone: 'k-mut', d: '확정한 날부터' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '구매확정 확인 창이 떠 있는 상태' } };
  },

  /* ── PA0405 확정 완료 ───────────────────────────────────────── */
  PA0405(ctx) {
    const 다른매물 = ITEMS.filter((x) => x.by === 살것.by && x.id !== 살것.id);
    const 본문 = `
${U.banner('ok', '🎉', `<b>거래가 끝났어요.</b>
  <div class="t-sub mt1">${U.won(산거래.price)}${U.조사붙이기(U.won(산거래.price), '이', '가')} ${U.esc(파는이.nick)}님 몫으로 넘어갔습니다.</div>`)}

<div class="mt-block">${U.card('정산 안내', `${U.feeRows(산거래.price, fee(산거래.price), payout(산거래.price))}
  <p class="t-sub mt3">판매자가 등록한 계좌로 <b>영업일 ${PA_SETTLE_DAYS}일</b> 안에 들어갑니다.
  사는 쪽이 더 낼 돈은 없어요.</p>`)}</div>

<div class="mt-block">${U.card('', `<div class="deadline">
  <div class="t-sub">이 거래로 할 수 있는 일</div>
  <div class="big">후기 남기기</div>
  <p class="t-sub mt2">후기는 상대의 <b>매너 온도</b>에 반영됩니다. 다음 사람이 「이 사람에게 사도 되나」를 재는 자예요.
  확정 뒤 <b>30일</b> 안에 쓸 수 있습니다.</p>
  <div class="mt4">${U.btn('후기 남기기', { href: 'MY0401', cls: 'btn-pri btn-lg' })}</div>
</div>`)}</div>

<div class="mt-block">${U.sec('이 거래 기록', U.dashTable(
      [{ t: '언제', w: '148px' }, { t: '무슨 일' }],
      [
        [산거래.paidAt, `결제 — ${U.won(산거래.price + 산거래.ship)}`],
        [PA_TRACK[0][1], `판매자 발송 — ${PA_TRACK_NO}`],
        [PA_TRACK[PA_TRACK.length - 1][1], '배달 완료'],
        ['방금', `<b>구매확정 — ${U.won(산거래.price)}이 판매자 몫으로</b>`],
        [`영업일 ${PA_SETTLE_DAYS}일 안`, `정산 ${U.won(payout(산거래.price))}`],
      ],
    ))}</div>

<div class="mt-block">${U.sec(`${U.esc(파는이.nick)}님의 다른 매물`, U.carousel(
      다른매물.map((it) => U.itemCard(it, { href: 'SE0401' })).join(''), { cls: 'cats' }),
      { more: 'SE0201', moreLabel: '매물 더 보기' })}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(3, [산거래.paidAt, PA_TRACK[0][1], '방금', `영업일 ${PA_SETTLE_DAYS}일 안`])}
  ${U.turnLine('끝났어요 — 정산만 남았습니다')}`, '', { state: '완료' })
      + U.actPanel('', `<p class="t-sub">후기는 한 번만 쓸 수 있어요. 사는 쪽과 파는 쪽이 서로 씁니다.</p>`, `
  ${U.btn('후기 남기기', { href: 'MY0401', cls: 'btn-pri btn-lg' })}
  ${U.btn('거래 진행 상태 보기', { href: 'PA0501', cls: 'btn-ghost' })}
  ${U.btn('구매 내역 보기', { href: 'MY0201', cls: 'btn-ghost' })}
  ${U.btn('매물 더 보러 가기', { href: 'SE0201', cls: 'btn-quiet' })}`);

    const body = `
${U.pageHd('구매를 확정했어요', `${U.esc(살것.t)} · ${U.esc(파는이.nick)}님과의 거래가 끝났습니다`)}
${U.kpis([
      ['거래 상태', '완료', { tone: 'k-ok', d: '되돌릴 수 없습니다' }],
      ['넘어간 돈', U.num(산거래.price), { unit: '원', d: `${U.esc(파는이.nick)}님 몫으로` }],
      ['판매자 정산액', U.num(payout(산거래.price)), { unit: '원', tone: 'k-acc', d: `영업일 ${PA_SETTLE_DAYS}일 안에` }],
      ['후기 쓰기', '30일 안', { tone: 'k-warn', d: '매너 온도에 반영됩니다', href: 'MY0401' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '구매확정 완료 — 정산을 기다립니다' } };
  },

  /* ══════════ PA05 거래 진행 상태 ═══════════════════════════════ */

  PA0501(ctx) {
    const 산것들 = DEALS.filter((d) => d.side === '구매');
    const 판것들 = DEALS.filter((d) => d.side === '판매');
    const 진행 = (list) => list.filter((d) => d.st === '진행중').length;
    const 정산예정 = DEALS.filter((d) => d.side === '판매' && d.st !== '취소')
      .reduce((a, d) => a + payout(d.price), 0);

    /* 표 한 줄 — 목록은 표로 낸다(레이아웃 B 의 list 슬롯) */
    const 표줄 = (d) => {
      const it = itemBy(d.item);
      const u = userBy(d.with);
      return {
        data: { st: d.st, side: d.side },
        cells: [
          `<span class="row-c">${U.phItem(36, it.id)}<a class="strong" href="${U.link('SE0401')}">${U.esc(it.t)}</a></span>`,
          `<span class="nowrap">${U.esc(u.nick)}</span>`,
          `<b class="nowrap">${U.won(d.price)}</b>`,
          `<span class="nowrap">${단계글(d.step)}</span>`,
          `<span class="t-sub nowrap">${d.st === '진행중' ? d.left : '—'}</span>`,
          U.stBadge(d.st),
        ],
      };
    };

    /* 진행 중인 거래 한 장 — 4칸 단계 표시 · 시각 기록 · 다음 차례 · 배송 조회 */
    const 거래카드 = (d) => {
      const it = itemBy(d.item);
      const u = userBy(d.with);
      const 시각 = [d.paidAt || '', d.sentAt || '', d.step >= 3 ? '9/5 11:40' : '', d.settleAt || ''];
      const 다음 = d.st !== '진행중' ? ''
        : (d.side === '구매'
          ? U.btn('수령 확인하기', { href: 'PA0401', cls: 'btn-pri' })
          : U.btn('발송 등록하기', { href: 'PA0301', cls: 'btn-pri' }));
      return `<div class="card mb6"><div class="card-bd">
        <div class="row-b wrap-row mb4">
          <a class="row-c" style="gap:12px" href="${U.link('SE0401')}">
            ${U.phItem(56, it.id)}
            <span><b>${U.esc(it.t)}</b>
              <span class="row-c wrap-row mt1"><b class="price">${U.won(d.price)}</b>
              <span class="t-sub">${d.side === '구매' ? '판매자' : '구매자'} ${U.esc(u.nick)}</span></span></span>
          </a>
          <div class="row-c" style="gap:8px">${U.stBadge(d.st)}${U.badge(d.side, 'b-mut')}</div>
        </div>

        ${U.escrow(d.step, 시각)}
        ${U.turnLine(d.leftLabel, d.st === '진행중' ? d.left : '')}

        ${d.track ? `<div class="mt4">${U.accordion([{
        q: `배송 조회 펼치기 — ${d.track}`,
        a: `${U.timeline(PA_TRACK, PA_TRACK.length)}
            <p class="t-sub mt3">${PA_TRACK_ETA}</p>
            <div class="mt3">${U.btn('배송 조회 크게 보기', { href: 'PA0503', cls: 'btn-ghost btn-sm' })}</div>`,
      }], -1)}</div>` : ''}

        <div class="mt4">${U.sumRows(
        d.side === '구매'
          ? [['결제 금액', U.won(d.price + d.ship)], ['배송비', U.won(d.ship)]]
          : [['결제 금액', U.won(d.price)], [`수수료 ${요율}`, `− ${U.won(fee(d.price))}`]],
        d.side === '구매' ? null : ['정산 예정액', U.won(payout(d.price))],
      )}
        ${d.settleAt ? `<p class="t-sub mt2">정산 예정 <b>${d.settleAt}</b></p>` : ''}</div>

        <div class="btns mt4">
          ${다음}
          ${U.btn('채팅으로', { href: 'CH0201', cls: 'btn-ghost' })}
          ${U.btn('단계 자세히', { href: 'PA0502', cls: 'btn-ghost' })}
          ${U.btn('취소·환불 요청', { href: 'PA0504', cls: 'btn-quiet' })}
        </div>
      </div></div>`;
    };

    const 끝난줄 = (list) => `<div class="stack-sm">${list.map((d) => {
      const it = itemBy(d.item);
      return `<div class="cond-row"><span class="grow">${U.esc(it.t)}</span>
        <span class="t-sub">${U.won(d.price)}</span>${U.stBadge(d.st)}
        ${d.st === '완료' ? U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-ghost btn-sm' }) : ''}</div>`;
    }).join('') || '<p class="t-sub">아직 없어요</p>'}`;

    const 판 = (list, 키) => `
  ${U.tableBar(`<b>${U.num(list.length)}건</b> <span class="t-sub">· 진행 중 ${U.num(진행(list))}건</span>`,
      `${U.btn('끝난 거래만 보기', { href: 'PA0506', cls: 'btn-ghost btn-sm' })}`)}
  ${U.dashTable(
        [{ t: '물건' }, { t: '상대', w: '108px' }, { t: '금액', w: '112px' }, { t: '단계', w: '112px' }, { t: '남은 시간', w: '112px' }, { t: '상태', w: '84px' }],
        list.map(표줄), { max: '300px', listKey: 키 },
      )}
  <div class="mt-block">${list.filter((d) => d.st === '진행중').map(거래카드).join('')
      || U.empty('📦', '진행 중인 거래가 없어요', '', U.btn('매물 보러 가기', { href: 'SE0201', cls: 'btn-pri' }))}</div>
  <div class="mt-block">${U.sec('끝난 거래', U.accordion([{
        q: `끝난 거래 ${list.filter((d) => d.st !== '진행중').length}건 펼치기`,
        a: 끝난줄(list.filter((d) => d.st !== '진행중')) + `<div class="mt3">${U.btn('끝난 거래 전체 보기', { href: 'PA0506', cls: 'btn-ghost btn-sm' })}</div>`,
      }], -1))}</div>`;

    const 본문 = `
<div>
  ${U.tabs([
      { label: '내가 산 것', cnt: 진행(산것들), pane: 'deal0' },
      { label: '내가 판 것', cnt: 진행(판것들), pane: 'deal1' },
    ], 0)}
  <div class="mt4" data-pane-body="deal0">${판(산것들, 'deal-buy')}</div>
  <div class="mt4" data-pane-body="deal1" hidden>${판(판것들, 'deal-sell')}</div>
</div>

<div class="mt-block">${U.sec('분쟁 접수 상태', U.card('', `
  <div class="row-b wrap-row"><span>지금 접수된 분쟁이 <b>없습니다.</b></span>${U.badge('없음', 'b-ok')}</div>
  <p class="t-sub mt3">물건이 설명과 다르면 구매확정을 누르기 전에 분쟁을 넣을 수 있어요.
  넣으면 정산이 멈추고 운영자가 양쪽 말을 듣습니다.</p>
  <div class="mt4">${U.btn('분쟁이 접수되면 이렇게 보여요', { href: 'PA0505', cls: 'btn-ghost' })}</div>`))}</div>
`;

    const 패널 = U.actPanel('지금 기다리는 것', `<div class="stack-sm">
  ${DEALS.filter((d) => d.st === '진행중').map((d) => {
      const it = itemBy(d.item);
      return `<div class="cond-row"><span class="grow">${U.esc(it.t)}</span>
      <span class="t-sub nowrap">${d.left}</span></div>
      <p class="t-sub">${U.esc(d.leftLabel)}</p>`;
    }).join('')}
</div>`, `
  ${U.btn('수령 확인하기', { href: 'PA0401', cls: 'btn-pri' })}
  ${U.btn('발송 등록하기', { href: 'PA0301', cls: 'btn-acc' })}
  ${U.btn('채팅으로', { href: 'CH0201', cls: 'btn-ghost' })}`)
      + U.actPanel('더 보기', '', `
  ${U.btn('단계 표시 자세히', { href: 'PA0502', cls: 'btn-ghost' })}
  ${U.btn('배송 조회 펼치기', { href: 'PA0503', cls: 'btn-ghost' })}
  ${U.btn('거래 취소 요청', { href: 'PA0504', cls: 'btn-ghost' })}
  ${U.btn('끝난 거래', { href: 'PA0506', cls: 'btn-ghost' })}`);

    const body = `
${U.pageHd('거래 진행 상태', '안전결제로 진행 중인 거래와 끝난 거래를 한자리에서 봅니다',
      `<div class="btns">${U.btn('안전결제 안내', { href: 'PA0101', cls: 'btn-ghost' })}${U.btn('채팅', { href: 'CH0101', cls: 'btn-pri' })}</div>`)}
${U.kpis([
      ['진행 중인 거래', U.num(진행(DEALS)), { unit: '건', d: '산 것 + 판 것' }],
      ['내 차례', U.num(0), { unit: '건', tone: 'k-mut', d: '지금은 상대를 기다리는 중' }],
      ['들어올 정산 예정액', U.num(정산예정), { unit: '원', tone: 'k-ok', d: `수수료 ${요율} 뺀 값` }],
      ['끝난 거래', U.num(PA_DONE.length), { unit: '건', tone: 'k-acc', d: '완료 · 취소', href: 'PA0506' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: {} };
  },

  /* ── PA0502 단계 표시 ───────────────────────────────────────── */
  PA0502(ctx) {
    const 칸설명 = (d) => {
      const it = itemBy(d.item);
      const u = userBy(d.with);
      const 시각 = [d.paidAt || '', d.sentAt || '', d.step >= 3 ? '9/5 11:40' : '', d.settleAt || ''];
      return U.card(`${U.esc(it.t)} · ${d.side}`, `
        ${U.escrow(d.step, 시각)}
        ${U.turnLine(d.leftLabel, d.st === '진행중' ? d.left : '')}
        <div class="mt4">${U.dashTable(
        [{ t: '칸', w: '110px' }, { t: '어떻게 보이나', w: '150px' }, { t: '시각 기록' }],
        ESCROW_STEPS.map((s, i) => [
          `<b>${단계글(i)}</b>`,
          i < d.step ? `${U.badge('지남 — 채움', 'b-ok')}` : (i === d.step ? `${U.badge('지금 — 테두리 굵게', 'b-pri')}` : `${U.badge('남음 — 회색', 'b-mut')}`),
          시각[i] ? `<b>${시각[i]}</b>` : '<span class="muted">아직</span>',
        ]),
      )}</div>
        <p class="t-sub mt3">상대 — ${U.esc(u.nick)} ${U.manner(u.manner)}</p>`);
    };

    const 본문 = `
${U.sec('칸은 세 가지로 보입니다', U.dashTable(
      [{ t: '칸', w: '160px' }, { t: '어떻게 보이나' }],
      [
        [`${U.badge('지난 칸', 'b-ok')}`, '옅은 바탕으로 <b>채우고</b> 동그라미에 ✓ 를 넣습니다. 그 아래에 <b>시각을 적습니다.</b>'],
        [`${U.badge('지금 칸', 'b-pri')}`, '테두리를 <b>두 배로 굵게</b> 두릅니다. 색만으로 가르지 않아요.'],
        [`${U.badge('남은 칸', 'b-mut')}`, '<span class="muted">회색으로 두고 시각 자리는 비워 둡니다.</span>'],
      ],
    ), { desc: '색을 못 가리는 분도 알아볼 수 있게 테두리 굵기와 ✓ 를 함께 씁니다.' })}

<div class="mt-block">${U.sec('지금 내 거래 두 건', `<div class="stack-sm">
  ${DEALS.filter((d) => d.st === '진행중').map(칸설명).join('<div class="mt-block"></div>')}
</div>`)}</div>

<div class="mt-block">${U.sec('끝난 거래는 이렇게', 칸설명(DEALS[2]))}</div>
`;
    const 패널 = U.actPanel('지금 누구 차례인가', `<div class="stack-sm">
  ${DEALS.filter((d) => d.st === '진행중').map((d) => `<div class="cond-row">
    <span class="grow">${U.esc(itemBy(d.item).t)}</span><b class="nowrap">${단계글(d.step)}</b></div>
    <p class="t-sub">${U.esc(d.leftLabel)} · ${d.left} 남음</p>`).join('')}
</div>`, `
  ${U.btn('거래 진행 상태로', { href: 'PA0501', cls: 'btn-pri btn-lg' })}
  ${U.btn('수령 확인하기', { href: 'PA0401', cls: 'btn-ghost' })}
  ${U.btn('발송 등록하기', { href: 'PA0301', cls: 'btn-ghost' })}`);

    const body = `
${U.pageHd('단계 표시 자세히', '지난 칸은 채우고 시각을 적고, 지금 칸은 테두리를 굵게, 남은 칸은 회색으로 둡니다')}
${U.kpis(ESCROW_STEPS.map((s, i) => [단계글(i), i < 2 ? '지남' : (i === 2 ? '지금' : '남음'),
      { tone: i < 2 ? 'k-ok' : (i === 2 ? '' : 'k-mut'), d: i === 0 ? DEALS[1].paidAt : (i === 1 ? DEALS[1].sentAt : (i === 2 ? DEALS[1].left + ' 남음' : '아직')) }]))}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '단계 표시를 펼쳐 본 상태' } };
  },

  /* ── PA0503 배송 조회 펼치기 ────────────────────────────────── */
  PA0503(ctx) {
    const 본문 = `
${U.card('배송 조회', `<div class="row-b wrap-row">
  <div class="row-c" style="gap:12px">${U.phItem(56, 살것.id)}
    <div><b>${U.esc(살것.t)}</b><p class="t-sub mt1">${PA_TRACK_NO}</p></div></div>
  ${U.stBadge('도착')}</div>
<div class="mt4">${U.timeline(PA_TRACK, PA_TRACK.length)}</div>
<div class="row-b wrap-row mt4">
  <span class="t-sub">도착 예정일 — <b>${PA_TRACK_ETA}</b></span>
  <button class="link" type="button" data-toast="이동 기록을 접었어요 · 다시 누르면 펴집니다">접기</button></div>`)}

<div class="mt-block">${U.sec('이동 기록 표로 보기', U.dashTable(
      [{ t: '언제', w: '148px' }, { t: '어디서' }, { t: '무슨 일', w: '150px' }],
      PA_TRACK.map(([t, at], i) => [
        `<b>${at}</b>`,
        U.esc(t),
        i === PA_TRACK.length - 1 ? U.stBadge('도착') : U.stBadge('배송중'),
      ]),
    ))}</div>

<div class="mt-block">${U.sec('조회가 안 될 때', `${U.accordion([
      { q: '「조회되지 않는 운송장입니다」라고 나와요', a: '택배사에 물건이 들어간 뒤에야 기록이 붙습니다. 판매자가 막 등록했다면 <b>몇 시간</b> 기다려 주세요.' },
      { q: '기록이 이틀째 그대로예요', a: '연휴나 물량이 몰릴 때는 허브에서 하루 이틀 머무를 수 있어요. 사흘 넘게 그대로면 판매자에게 물어보고, 그래도 안 풀리면 분쟁을 넣을 수 있습니다.' },
      { q: '운송장 번호가 틀린 것 같아요', a: '판매자가 고칠 수 있습니다. 채팅으로 알려 주세요. 자릿수가 안 맞으면 아예 등록이 안 됩니다.' },
    ], -1)}
    ${U.banner('warn', '⚠', `<b>조회가 안 된다고 자동 확정 시간이 멈추지는 않습니다.</b>
      <div class="t-sub mt1">기록이 이상하면 그대로 두지 말고 채팅이나 분쟁으로 알려 주세요.</div>`, { cls: 'mt4' })}`)}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(2, [산거래.paidAt, PA_TRACK[0][1], '', ''])}
  ${U.turnLine('내가 확인할 차례예요', PA_CONFIRM_LEFT)}`, '', { state: '진행중' })
      + U.actPanel('', `<p class="t-sub">도착 예정일 <b>${PA_TRACK_ETA}</b></p>`, `
  ${U.btn('수령 확인하기', { href: 'PA0401', cls: 'btn-pri btn-lg' })}
  ${U.btn('거래 진행 상태로', { href: 'PA0501', cls: 'btn-ghost' })}
  ${U.btn('판매자에게 채팅', { href: 'CH0201', cls: 'btn-ghost' })}
  ${U.btn('조회가 이상해요', { href: 'PA0505', cls: 'btn-quiet' })}`);

    const body = `
${U.pageHd('배송 조회', '택배 이동 기록을 펼쳤어요 — 다시 누르면 접힙니다')}
${U.kpis([
      ['지금 상태', '배달 완료', { tone: 'k-ok', d: PA_TRACK[PA_TRACK.length - 1][1] }],
      ['이동 기록', U.num(PA_TRACK.length), { unit: '건', d: '보냄 → 도착' }],
      ['도착 예정일', PA_TRACK_ETA.replace(' 도착 예정', ''), { tone: 'k-acc', d: '예정보다 빨리 왔어요' }],
      ['자동 확정까지', PA_CONFIRM_LEFT, { tone: 'k-warn', d: '그 전에 확인해 주세요', href: 'PA0402' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '배송 이동 기록을 펼친 상태' } };
  },

  /* ── PA0504 거래 취소 요청 ──────────────────────────────────── */
  PA0504(ctx) {
    const 사유 = PA_CANCEL_REASONS.filter((r) => r.side !== '판매');
    const 본문 = `
${거래머리(살것, 파는이, '파는 쪽', { title: '취소할 거래' })}

<div class="mt-block">${U.card('왜 취소하시나요', `
  <div class="stack-sm">${사유.map((r, i) => `<label class="radio${i === 0 ? ' on' : ''}">
    <input type="radio" name="cxr"${i === 0 ? ' checked' : ''}><b>${U.esc(r.k)}</b></label>`).join('')}</div>
  <div class="fld mt4"><label class="lb" for="cxw">한마디 (안 적어도 돼요)</label>
    <textarea class="input" id="cxw" rows="3" placeholder="상대에게 그대로 전해집니다"></textarea></div>`)}</div>

<div class="mt-block">${U.card('상대에게 이렇게 갑니다 — 미리 보기', `
  <div class="box" style="border-left:4px solid var(--primary)">
    <div class="row-c" style="gap:10px">${U.phAva(34, 'me')}<b>${U.esc(SITE.myNick)}</b><span class="t-sub">방금</span></div>
    <p class="mt3">${U.esc(SITE.myNick)}님이 <b>거래 취소</b>를 요청했습니다.</p>
    <p class="t-sub mt2">물건 — ${U.esc(살것.t)} (${U.won(살것.price)})<br>
    까닭 — ${U.esc(사유[0].k)}</p>
    <p class="t-sub mt2">받아들이시면 결제한 돈이 전액 환불됩니다.</p>
  </div>
  <p class="t-sub mt3">보내기 전에 무엇이 갈지 그대로 보여 드립니다.</p>`)}</div>

<div class="mt-block">${U.sec('단계마다 취소되는 조건이 다릅니다', U.dashTable(
      [{ t: '어느 단계에서', w: '140px' }, { t: '취소되나' }, { t: '누가 눌러야', w: '160px' }, { t: '환불 예상 시점' }],
      PA_CANCEL_RULES.map((r, i) => ({
        cls: i === 1 ? 'on' : '',
        cells: [
          `<b>${r.step}</b>`,
          i === 4 ? `<span style="color:var(--danger)"><b>${r.can}</b></span>` : `<b>${r.can}</b>`,
          `<span class="muted">${r.who}</span>`,
          r.back,
        ],
      })),
      { max: '320px' },
    ), { desc: '지금 이 거래는 ② 발송 전입니다 — 상대가 받아들이면 취소됩니다.' })}</div>

<div class="mt-block">${U.banner('info', '💳', `<b>환불은 낸 수단으로 돌아갑니다.</b>
  <div class="t-sub mt1">카드는 승인 취소라 카드사 사정에 따라 영업일 1~3일 걸립니다. 계좌이체는 등록한 계좌로 들어가요.</div>`)}</div>
`;
    const 패널 = U.actPanel('환불 예상', U.sumRows([
      ['물건 값', U.won(살것.price)],
      ['배송비', U.won(살것.ship)],
      ['떼는 돈', '<span class="muted">없음</span>'],
    ], ['돌려받을 돈', U.won(살돈)])
      + `<p class="t-sub mt3">지금 단계에서는 <b>상대가 받아들이면</b> 곧바로 취소됩니다.
      영업일 <b>1~3일</b> 안에 낸 수단으로 돌아가요.</p>`, `
  ${U.btn('취소 요청 보내기', { cls: 'btn-danger btn-lg', attr: ' data-toast="취소를 요청했어요 · 상대의 확인을 기다립니다"' })}
  ${U.btn('그냥 둘게요', { href: 'PA0501', cls: 'btn-ghost' })}
  ${U.btn('상대에게 먼저 물어보기', { href: 'CH0201', cls: 'btn-ghost' })}`, { state: '대기' });

    const body = `
${U.pageHd('거래 취소 요청', '까닭을 고르면 상대에게 갈 안내를 미리 보여 드립니다')}
${U.kpis([
      ['지금 단계', 단계글(1), { tone: 'k-acc', d: '발송 전 — 상대 확인이 필요해요' }],
      ['돌려받을 돈', U.num(살돈), { unit: '원', tone: 'k-ok', d: '물건 값 + 배송비 전액' }],
      ['떼는 돈', '0', { unit: '원', tone: 'k-mut', d: '취소 수수료 없음' }],
      ['환불 예상', '영업일 1~3일', { tone: 'k-warn', d: '낸 수단으로 돌아갑니다' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '취소 요청을 적는 중 — 아직 보내지 않았습니다' } };
  },

  /* ── PA0505 분쟁 진행 중 ────────────────────────────────────── */
  PA0505(ctx) {
    const 본문 = `
${U.banner('dan', '⚖', `<b>분쟁이 접수됐어요 — 정산이 멈췄습니다.</b>
  <div class="t-sub mt1">결과가 나올 때까지 ${U.esc(파는이.nick)}님에게 돈이 넘어가지 않습니다. 보통 영업일 3일쯤 걸려요.</div>`)}

<div class="mt-block">${거래머리(살것, 파는이, '파는 쪽', { title: '분쟁 중인 거래' })}</div>

<div class="mt-block">${U.sec('운영자 검토 단계', `
  ${U.card('', `${U.timeline(PA_DISPUTE_STEPS, 1)}
    <p class="t-sub mt3">지금은 <b>양쪽 자료를 받는 중</b>입니다. 9/8까지 낸 자료만 검토에 들어갑니다.</p>`)}`)}</div>

<div class="mt-block">${U.sec('낸 자료', `
  ${U.dashTable(
      [{ t: '무엇', w: '40%' }, { t: '몇 개', w: '96px' }, { t: '누가 냈나' }],
      PA_DISPUTE_DOCS.map((d) => [`<b>${U.esc(d.k)}</b>`, `${d.n}개`, d.who]),
    )}
  ${U.card('자료 더 내기', `
    <div class="photo-grid">
      <button class="photo-add" type="button" data-toast="사진을 골라 주세요 (최대 10장)">
        <span style="font-size:22px">＋</span><span>사진 추가</span></button>
    </div>
    <div class="fld mt3"><label class="lb" for="dd">덧붙일 말</label>
      <textarea class="input" id="dd" rows="3" placeholder="운영자가 읽습니다. 사실만 적어 주세요"></textarea></div>
    ${U.btn('자료 내기', { cls: 'btn-pri', attr: ' data-toast="자료를 냈어요 · 운영자가 확인합니다"' })}
    <p class="t-sub mt3">9/8까지 낸 것만 검토에 들어갑니다.</p>`, { cls: 'mt-block' })}`)}</div>

<div class="mt-block">${U.sec('결과는 셋 중 하나입니다', U.dashTable(
      [{ t: '결과', w: '180px' }, { t: '어떻게 되나' }],
      [
        [`<b>${PA_DISPUTE_RESULTS[0]}</b>`, `낸 돈 ${U.won(산거래.price + 산거래.ship)}이 그대로 돌아옵니다. 물건은 판매자에게 되돌려 보냅니다.`],
        [`<b>${PA_DISPUTE_RESULTS[1]}</b>`, `멈춰 두었던 돈이 판매자에게 넘어갑니다. 물건은 그대로 두시면 됩니다.`],
        [`<b>${PA_DISPUTE_RESULTS[2]}</b>`, `양쪽 말이 다 맞을 때입니다. 값의 일부를 돌려받고 물건은 그대로 둡니다.`],
      ],
    ), { desc: '결과가 정해지면 알림과 채팅으로 알려 드립니다.' })}</div>

<div class="mt-block">${U.banner('quiet', '🔔', `<b>그동안 자동 구매확정도 멈춥니다.</b>
  <div class="t-sub mt1">분쟁이 끝날 때까지 시간이 흘러도 저절로 확정되지 않아요.</div>`)}</div>
`;
    const 패널 = U.actPanel('지금 어디까지', `${U.escrow(2, [산거래.paidAt, PA_TRACK[0][1], '', ''])}
  ${U.turnLine('운영자가 보고 있어요', '영업일 3일')}`, '', { state: '분쟁' })
      + U.actPanel('멈춘 돈', U.sumRows([
        ['물건 값', U.won(산거래.price)],
        ['배송비', U.won(산거래.ship)],
      ], ['맡아 둔 돈', U.won(산거래.price + 산거래.ship)])
      + `<p class="t-sub mt3">${U.badge('정산 보류', 'b-danger')} 결과가 나올 때까지 아무 쪽으로도 가지 않습니다.</p>`, `
  ${U.btn('자료 더 내기', { cls: 'btn-pri', attr: ' data-toast="자료를 낼 칸을 열었어요"' })}
  ${U.btn('운영자에게 문의', { href: 'CS0101', cls: 'btn-ghost' })}
  ${U.btn('신고하기', { href: 'CH0401', cls: 'btn-ghost' })}
  ${U.btn('거래 진행 상태로', { href: 'PA0501', cls: 'btn-quiet' })}`);

    const body = `
${U.pageHd('분쟁 진행 중', '운영자가 양쪽 말을 듣고 있습니다 — 그동안 정산이 멈춥니다')}
${U.kpis([
      ['분쟁 상태', '검토 중', { tone: 'k-danger', d: PA_DISPUTE_STEPS[1][0] }],
      ['정산', '보류', { tone: 'k-warn', d: '결과가 나올 때까지' }],
      ['맡아 둔 돈', U.num(산거래.price + 산거래.ship), { unit: '원', d: '아무 쪽으로도 안 갑니다' }],
      ['낸 자료', U.num(PA_DISPUTE_DOCS.reduce((a, d) => a + d.n, 0)), { unit: '개', tone: 'k-acc', d: '9/8까지 더 낼 수 있어요' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '분쟁 접수 — 정산 보류 중' } };
  },

  /* ── PA0506 끝난 거래 ───────────────────────────────────────── */
  PA0506(ctx) {
    const 날짜순 = [...PA_DONE].sort((a, b) => (a.at < b.at ? 1 : -1));
    const 후기안쓴 = 날짜순.filter((d) => d.st === '완료' && !d.review);
    const 줄 = (d) => {
      const it = itemBy(d.item);
      const u = userBy(d.with);
      return {
        data: { st: d.st, side: d.side },
        cells: [
          `<span class="t-sub nowrap">${d.at}</span>`,
          `<span class="row-c">${U.phItem(36, it.id)}<a class="strong" href="${U.link('SE0401')}">${U.esc(it.t)}</a></span>`,
          `<span class="nowrap">${U.badge(d.side, 'b-mut')} ${U.esc(u.nick)}</span>`,
          `<b class="nowrap">${U.won(d.price)}</b>`,
          U.stBadge(d.st),
          d.st !== '완료' ? '<span class="muted">—</span>'
            : (d.review ? `<span class="t-sub">썼어요</span>`
              : `${U.badge('안 썼어요', 'b-warn')} ${U.btn('쓰기', { href: 'MY0401', cls: 'btn-ghost btn-xs' })}`),
        ],
      };
    };

    const 본문 = `
${U.sec('접어 두었다가 펼쳐 봅니다', U.accordion([{
      q: `끝난 거래 ${날짜순.length}건 펼치기 — 날짜순`,
      a: `${U.tableBar(`<b>${U.num(날짜순.length)}건</b> <span class="t-sub">· 완료 ${날짜순.filter((d) => d.st === '완료').length}건 · 취소 ${날짜순.filter((d) => d.st === '취소').length}건</span>`,
        U.btn('진행 중인 거래로', { href: 'PA0501', cls: 'btn-ghost btn-sm' }))}
      ${U.dashTable(
          [{ t: '언제', w: '112px' }, { t: '물건' }, { t: '상대', w: '140px' }, { t: '금액', w: '108px' }, { t: '상태', w: '84px' }, { t: '후기', w: '132px' }],
          날짜순.map(줄), { max: '320px', listKey: 'deal-done' },
        )}`,
    }], 0), { desc: '거래 진행 상태 화면에서는 접혀 있습니다. 여기서는 펼친 채로 보여 드려요.' })}

<div class="mt-block">${U.sec('후기를 아직 안 쓴 거래', 후기안쓴.length
      ? `<div class="stack-sm">${후기안쓴.map((d) => {
        const it = itemBy(d.item);
        const u = userBy(d.with);
        return `<div class="cond-row">
          ${U.phItem(40, it.id)}
          <span class="grow"><b>${U.esc(it.t)}</b>
            <span class="t-sub" style="display:block">${d.at} · ${U.esc(u.nick)} · ${U.won(d.price)}</span></span>
          ${U.badge('후기 안 씀', 'b-warn')}
          ${U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-pri btn-sm' })}</div>`;
      }).join('')}</div>`
      : U.empty('✍', '후기를 다 쓰셨어요', '', ''),
      { desc: '거래가 끝난 뒤 30일 안에 쓸 수 있어요. 후기는 상대의 매너 온도에 반영됩니다.' })}</div>

<div class="mt-block">${U.sec('취소된 거래는 왜 취소됐나', U.dashTable(
      [{ t: '언제', w: '112px' }, { t: '물건' }, { t: '까닭' }],
      날짜순.filter((d) => d.st === '취소').map((d) => [
        `<span class="t-sub">${d.at}</span>`,
        U.esc(itemBy(d.item).t),
        '판매자가 기한 안에 안 보내 <b>자동 취소·환불</b>됐습니다',
      ]),
    ))}</div>
`;
    const 패널 = U.actPanel('끝난 거래 셈', U.sumRows([
      ['완료', `${날짜순.filter((d) => d.st === '완료').length}건`],
      ['취소', `${날짜순.filter((d) => d.st === '취소').length}건`],
      ['후기 안 쓴 것', `<b>${후기안쓴.length}건</b>`],
    ], ['모두', `${날짜순.length}건`]), `
  ${U.btn('후기 쓰기', { href: 'MY0401', cls: 'btn-pri btn-lg' })}
  ${U.btn('받은 후기 보기', { href: 'MY0501', cls: 'btn-ghost' })}
  ${U.btn('진행 중인 거래로', { href: 'PA0501', cls: 'btn-ghost' })}
  ${U.btn('구매 내역', { href: 'MY0201', cls: 'btn-quiet' })}`);

    const body = `
${U.pageHd('끝난 거래', '거래완료·취소된 건을 접어 두었다가 날짜순으로 펼쳐 봅니다')}
${U.kpis([
      ['끝난 거래', U.num(날짜순.length), { unit: '건', d: '완료 + 취소' }],
      ['완료', U.num(날짜순.filter((d) => d.st === '완료').length), { unit: '건', tone: 'k-ok', d: '정산까지 끝난 것' }],
      ['취소', U.num(날짜순.filter((d) => d.st === '취소').length), { unit: '건', tone: 'k-mut', d: '전액 환불됐어요' }],
      ['후기 안 쓴 것', U.num(후기안쓴.length), { unit: '건', tone: 'k-warn', d: '30일 안에 쓸 수 있어요', href: 'MY0401' }],
    ])}
${U.detailSplit(본문, 패널)}`;
    return { body, o: { state: '끝난 거래를 펼친 상태' } };
  },
};
