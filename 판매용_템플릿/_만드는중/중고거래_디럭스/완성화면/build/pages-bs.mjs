/* BS 끌올·광고 — 끌올하기 / 광고 상품 안내 / 끌올·광고 내역
   ⚠ 돈을 쓰는 화면이다. 무엇에 얼마를 쓰는지가 흐리면 안 된다.
     그리고 끌올한 글에는 반드시 「끌올」 배지가 붙는다 — 광고를 숨기지 않는다. */
import * as U from './ui.mjs';
import {
  ITEMS, itemBy, BOOSTS, AD_SLOTS, BOOST_LOG, BOOST_SPENT, BOOST_FREE_LEFT, MY_POINT, CATS,
} from './data.mjs';

/* ---------------- BS-01 끌올하기 ---------------- */
function BS01() {
  const 내것 = ITEMS.filter((x) => ['i1', 'i5', 'i7', 'i11'].includes(x.id));
  const 고른것 = itemBy('i7');

  const 왼쪽 = `
  ${U.sec('① 어느 글을 올릴까요', `<div class="stack">
    ${내것.map((it, i) => `<label class="pickrow${i === 2 ? ' on' : ''}">
      <input type="radio" name="pick"${i === 2 ? ' checked' : ''}>
      ${U.phItem(64, it.id)}
      <span class="mid"><b>${U.esc(it.t)}</b>
        <span class="met"><span class="k">${U.won(it.price)}</span><span class="k">조회 ${it.view}</span></span></span>
      <span class="rank">지금 <b>${148 - i * 31}</b>번째</span>
    </label>`).join('')}
  </div>`)}

  ${U.sec('② 무료 끌올', U.card('', `
    <div class="row-b wrap-row">
      <div>
        <b class="t-card">24시간에 한 번 무료</b>
        <p class="t-sub mt1">아직 <b>${BOOST_FREE_LEFT}</b> 남았어요. 시간이 되면 이 단추가 켜집니다.</p>
      </div>
      ${U.btn('무료로 끌올', { cls: 'btn-pri', off: true })}
    </div>`))}

  ${U.sec('③ 지금 바로 올리려면', `<div class="g3">
    ${BOOSTS.map((b, i) => `<label class="planbox${i === 0 ? ' on' : ''}">
      <input type="radio" name="boost"${i === 0 ? ' checked' : ''}>
      <span class="nm">${b.k}</span>
      <span class="pr">${U.won(b.price)}</span>
      <span class="t-sub">${b.keep}</span>
      <span class="t-sub mt2">${b.d}</span>
      <span class="exp">${U.num(b.exp)}회쯤 더 보여요</span>
    </label>`).join('')}
  </div>`)}

  ${U.sec('광고 자리도 살 수 있어요', U.table(
    [{ t: '자리', w: '30%' }, { t: '값' }, { t: '유지' }, { t: '하루 예상 노출' }],
    AD_SLOTS.map((a) => [a.k, `<b>${U.won(a.price)}</b>`, a.keep, U.num(a.exp) + '회'])),
    { more: 'BS-02', moreLabel: '자세히 보기' })}

  ${U.banner('info', '📣', `<b>끌올한 글에는 「끌올」 배지가 붙어요</b>
    <div class="t-sub mt1">목록에서 ${U.boostBadge()} 이렇게 보입니다. 광고라는 것을 이웃에게 숨기지 않아요.</div>`)}
  `;

  const 오른쪽 = `
  ${U.card('고른 것', `
    ${U.itemRow(고른것, { href: false, heart: false, sm: true })}
    <div class="mt4">${U.kv([
      ['상품', BOOSTS[0].k],
      ['값', `<b>${U.won(BOOSTS[0].price)}</b>`],
      ['유지', BOOSTS[0].keep],
    ])}</div>
    <div class="rank-move mt4">
      <div><span class="t-sub">지금</span><div class="t-sec">86번째</div></div>
      <div class="arrow">→</div>
      <div><span class="t-sub">끌올 뒤</span><div class="t-sec" style="color:var(--pri-text)">3번째</div></div>
    </div>`)}

  <div class="mt-block">${U.card('결제', `
    ${U.tabs(['카드', '간편결제', '포인트'], 2)}
    <div class="mt3">
      ${U.kv([
      ['가진 포인트', `${U.num(MY_POINT)}P`],
      ['이번에 쓸 것', `${U.num(BOOSTS[0].price)}P`],
      ['남는 것', `${U.num(MY_POINT - BOOSTS[0].price)}P`],
    ])}
    </div>
    <div class="mt3">${U.btn('포인트 충전', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="충전 창은 서버가 연결되면 열립니다"' })}</div>`)}</div>

  <div class="mt-block">${U.card('', `
    ${U.btn('끌올하기', { cls: 'btn-pri btn-block btn-lg', attr: ' data-toast="목록 3번째로 올라갔어요"' })}
    <p class="t-sub mt2 center">누르면 바로 결제되고 목록에 반영돼요.</p>`)}</div>

  <div class="mt-block">${U.card('최근 끌올', `<div class="stack-sm">
    ${BOOST_LOG.slice(0, 3).map((b) => `<div class="row-b t-sub">
      <span>${b.at} · ${U.esc(itemBy(b.item).t).slice(0, 12)}…</span>
      <span>${b.k}</span></div>`).join('')}
  </div>
  <div class="mt3">${U.btn('내역 전체 보기', { href: 'BS-03', cls: 'btn-ghost btn-block btn-sm' })}</div>`)}</div>
  `;
  return { body: U.detail2(왼쪽, 오른쪽), o: {} };
}

/* ---------------- BS-02 광고 상품·요금 안내 ---------------- */
function BS02() {
  const 전부 = [
    ...BOOSTS.map((b) => ({ k: b.k, price: b.price, keep: b.keep, where: '매물 목록 위쪽', exp: b.exp })),
    ...AD_SLOTS,
  ];

  const body = `
  ${U.pageHd('광고 상품·요금', '끌올은 내 글을 목록 위로 올리는 것이고, 광고는 정해진 자리를 사는 것이에요')}

  ${U.sec('상품 견주기', U.table(
    [{ t: '상품', w: '24%' }, { t: '값' }, { t: '유지 기간' }, { t: '보이는 자리' }, { t: '하루 예상 노출' }],
    전부.map((x) => [x.k, `<b>${U.won(x.price)}</b>`, x.keep, x.where, U.num(x.exp) + '회']),
    { cls: 'sortable' }))}
  <p class="t-sub mt2">열 이름을 누르면 그 값으로 다시 세워요.</p>

  ${U.sec('어디에 보이나요', U.card('', `
    ${U.phMap('노출 자리 도식', 600, 400)}
    <div class="g3 mt4">
      ${[['목록 위쪽', '끌올·상단 고정이 붙는 자리'],
      ['검색 결과 첫 줄', '그 말로 찾은 사람에게 먼저'],
      ['카테고리 첫 화면', '그 분류를 여는 사람에게 먼저']]
      .map(([t, d]) => `<div><b>${t}</b><p class="t-sub mt1">${d}</p></div>`).join('')}
    </div>`))}

  ${U.sec('얼마나 보일지 미리 재보기', U.card('', `
    <div class="row wrap-row" style="gap:12px">
      <select class="input" style="flex:1 1 180px" data-recalc="est3"
        >${CATS.map((c, i) => `<option${i === 0 ? ' selected' : ''} data-vals="${c.nm}|${(c.n / 1000).toFixed(1)}배">${c.nm}</option>`).join('')}</select>
      <select class="input" style="flex:1 1 180px" data-recalc="est2"
        ><option data-vals="820회|1.8원">내 동네</option
        ><option selected data-vals="2,400회|1.9원">가까운 동네</option
        ><option data-vals="5,100회|2.4원">조금 먼 동네</option></select>
      <select class="input" style="flex:1 1 180px" data-recalc="est"
        ><option data-vals="2,400회|1,500원|0.6원">즉시 1회</option
        ><option selected data-vals="12,800회|5,000원|0.4원">24시간</option
        ><option data-vals="78,000회|25,000원|0.3원">7일</option></select>
    </div>
    <div class="mt4"><div class="g3">
      <div class="stat"><div class="n" data-recalc-out="est" data-i="0">12,800회</div><div class="l">기간 동안 예상 노출</div></div>
      <div class="stat"><div class="n" data-recalc-out="est" data-i="1">5,000원</div><div class="l">드는 값</div></div>
      <div class="stat"><div class="n" data-recalc-out="est" data-i="2">0.4원</div><div class="l">한 번 보일 때</div></div>
    </div></div>
    <p class="t-sub mt3">동네 범위를 바꾸면 하루 노출이 <b data-recalc-out="est2" data-i="0">2,400회</b>,
      한 번 보일 때 <b data-recalc-out="est2" data-i="1">1.9원</b>으로 다시 계산돼요.</p>
    <p class="t-sub mt2"><b data-recalc-out="est3" data-i="0">${CATS[0].nm}</b> 분류는 매물이 많아
      같은 값으로 <b data-recalc-out="est3" data-i="1">1.2배</b> 보입니다.</p>`))}

  ${U.accordion([
    { q: '중간에 그만두면 돈은 어떻게 되나요?', a: '<b>시작 전에는 전액</b> 돌려드립니다. 시작한 뒤에는 남은 기간만큼 계산해서 돌려드려요. 예를 들어 7일 상품을 이틀 쓰고 그만두면 5일치가 돌아옵니다.' },
    { q: '광고라는 것이 보이나요?', a: '네. <b>모든 유료 노출에는 「끌올」 배지가 붙습니다.</b> 이웃이 광고인지 아닌지 알 수 있어야 한다고 보기 때문이에요.' },
    { q: '이런 문구는 쓸 수 없어요', a: '<ul class="dots"><li>「국내 최저가」처럼 확인할 수 없는 말</li><li>실제와 다른 상태·수량</li><li>금지 품목을 돌려 말한 것</li></ul>' },
    { q: '끌올을 하면 꼭 팔리나요?', a: '아니요. 더 많이 보이게 할 뿐입니다. 사진과 설명, 값이 더 중요해요. <b>시세보다 비싸면 끌올해도 잘 안 팔립니다.</b>' },
    { q: '무료 끌올과 무엇이 다른가요?', a: '무료 끌올은 24시간에 한 번, 그 순간 목록 위로 올라갑니다. 유료 상품은 <b>정해진 기간 동안 위에 머무릅니다.</b>' },
    { q: '세금계산서를 받을 수 있나요?', a: '네. 내역 화면에서 건별로 영수증·현금영수증을 받을 수 있습니다.' },
  ], -1)}

  <div class="btns center mt-block">
    ${U.btn('끌올하러 가기', { href: 'BS-01', cls: 'btn-pri btn-lg' })}
    ${U.btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost btn-lg' })}
  </div>
  `;
  return { body: U.article(body), o: {} };
}

/* ---------------- BS-03 끌올·광고 내역 ---------------- */
function BS03() {
  const 본문 = `
  ${U.pageHd('끌올·광고 내역', '이번 달에 쓴 돈과 그 결과')}

  <div class="row-c wrap-row mb4">
    ${U.chips(['이번 달', '지난 달', '직접 지정'], 0)}
  </div>

  ${U.statRow([
    [U.won(BOOST_SPENT), '이번 달 쓴 돈'],
    [`${BOOST_LOG.filter((b) => b.st !== '취소').length}건`, '집행한 건수'],
    [`${U.num(BOOST_LOG.reduce((a, b) => a + b.exp, 0))}회`, '노출'],
    ['3.2배', '광고한 글이 받은 채팅'],
  ], 'g4')}

  <div class="mt-block">${U.banner('ok', '📈', `<b>광고한 글은 평균 3.2배 더 채팅을 받았어요</b>
    <div class="t-sub mt1">끌올하지 않은 내 글은 평균 1.7건, 끌올한 글은 5.3건이었습니다.</div>`)}</div>

  <div class="mt-block">${U.table(
    [{ t: '날짜', w: '11%' }, { t: '글' }, { t: '상품', w: '16%' }, { t: '값', w: '11%' },
    { t: '상태', w: '10%' }, { t: '성과', w: '20%' }, { t: '', w: '12%' }],
    BOOST_LOG.map((b) => {
      const it = itemBy(b.item);
      return [
        b.at,
        `<div class="row-c" style="gap:8px">${U.phItem(36, it.id)}<span>${U.esc(it.t)}</span></div>`,
        b.k,
        b.st === '취소' ? `<span class="muted"><s>${U.won(b.price)}</s><br>돌려받음</span>` : U.won(b.price),
        U.stBadge(b.st),
        b.st === '취소' ? '<span class="muted">—</span>'
          : `노출 ${U.num(b.exp)} · 클릭 ${U.num(b.clk)} · 채팅 ${b.chat}`,
        `<div class="btns">
          <button class="btn btn-quiet btn-xs" type="button" data-toast="노출·클릭·채팅을 날짜별로 폈어요">성과</button>
          <button class="btn btn-quiet btn-xs" type="button" data-modal="rc">영수증</button>
          ${b.st === '진행중' ? '<button class="btn btn-quiet btn-xs" type="button" data-modal="stop">중단</button>' : ''}
        </div>`,
      ];
    }),
    { foot: ['합계 <span class="t-sub">(취소 뺀 것)</span>', '', '', `<b>${U.won(BOOST_SPENT)}</b>`, '', `<b>노출 ${U.num(BOOST_LOG.reduce((a, b) => a + b.exp, 0))}</b>`, ''] })}</div>

  <div class="mt-block">${U.card('날짜별 성과 (9/5 하루 상단 고정)', `
    ${U.phMap('성과 추이 차트', 800, 260)}
    ${U.table([{ t: '날짜' }, { t: '노출' }, { t: '클릭' }, { t: '채팅' }],
    [['9/5', '4,120', '141', '2'], ['9/6', '3,880', '118', '1'], ['9/7 (오늘)', '1,840', '53', '0']],
    { foot: ['합계', '9,840', '312', '3'] })}`)}</div>

  ${U.modal('rc', '영수증', U.kv([
    ['거래번호', 'B-40219'],
    ['상품', '하루 상단 고정'],
    ['결제 수단', '포인트'],
    ['공급가', U.won(4546)],
    ['부가세', U.won(454)],
    ['합계', `<b>${U.won(5000)}</b>`],
  ]) + `<div class="mt3">${U.btn('현금영수증 신청', { cls: 'btn-ghost btn-sm', attr: ' data-toast="현금영수증을 신청했어요"' })}</div>`,
    U.btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }))}

  ${U.modal('stop', '광고를 중단할까요?', `
    <p class="t-sub mb3">지금 중단하면 남은 기간만큼 돌려드려요.</p>
    ${U.sumRows([['낸 돈', U.won(5000)], ['쓴 기간', '2일 / 3일'], ['돌아오는 돈', U.won(1666)]], ['환불 예정', U.won(1666)])}
    <p class="t-sub mt3">한 번 중단하면 되돌릴 수 없어요. 다시 하려면 새로 사야 합니다.</p>`,
    U.btn('그냥 둘게요', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('중단하기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="광고를 중단했어요 · 1,666원이 돌아옵니다"' }))}
  `;
  return { body: U.myPage('BS-03', 본문), o: {} };
}

export const PAGES = { 'BS-01': BS01, 'BS-02': BS02, 'BS-03': BS03 };
