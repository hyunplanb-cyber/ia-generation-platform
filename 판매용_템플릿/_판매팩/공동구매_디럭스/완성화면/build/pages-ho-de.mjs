/* HO 홈·탐색 4장 · DE 공구 상세 4장 */
import {
  ph, phAva, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, countdown, tierTable, dealCards, dealRow, leftText, review, rateSummary, accordion,
  heroBold, darkBar, carousel, promo,
  pageHd, stickBar, detail2, timeline, num, won, esc, link, off, rateLine,
} from './ui.mjs';
import { DEALS, dealById, pctOf, CATS, SOON, TIERS, OPTIONS, JOINS, REVIEWS, RATE_DIST, QNAS, FAQ } from './data.mjs';

/* ── HO-01 홈 ────────────────────────────────────────── */
function ho01() {
  const top = DEALS[0];
  /* 레이아웃 A 타이포 강조형 — 사진 모자이크를 쓰지 않는다.
     어두운 배경에 큰 제목, 바로 아래 숫자 지표 4개를 가로 한 줄로. */
  const hero = heroBold({
    kicker: '오늘의 공구',
    title: `혼자 사면 <em>${won(top.was)}</em><br>${num(top.goal)}명이 모이면 <em>${won(top.now)}</em>`,
    sub: `${esc(top.nm)} · ${esc(top.host)}. 못 모으면 전액 자동 환불이라 손해 볼 일이 없습니다.`,
    figs: [
      [`${off(top.was, top.now)}%`, '지금 할인율'],
      [`${num(top.joined)}명`, `참여 중 · 목표 ${num(top.goal)}명`],
      [`${num(top.goal - top.joined)}명`, '더 모이면 성사'],
      [leftText(top.left), '마감까지'],
    ],
    btns: `${btn('지금 참여하기', { cls: 'btn-primary btn-lg', href: 'DE-01' })}
      ${btn('공구 더 보기', { cls: 'btn-ghost btn-lg', href: 'HO-02' })}`,
  });

  const body = `
  ${sec('마감이 얼마 안 남았어요', carousel(DEALS.filter((d) => d.left < 700).map((d) => `<a class="scard" href="${link('DE-01')}">
      ${ph(['상품 사진', 1000, 1000], { seed: d.id + 'c', tiny: true })}
      <div class="bd">
        <div class="row-b">${countdown(d.left)}${badge(off(d.was, d.now) + '%', 'b-acc')}</div>
        <b class="mt2" style="display:block">${esc(d.nm)}</b>
        <div class="mt2">${gauge(pctOf(d))}</div>
        <div class="t-sub mt1">${num(d.joined)}명 참여</div>
      </div></a>`).join('')), { more: 'HO-03', moreLabel: '마감 임박 전체' })}

  ${sec('', `<div class="cats">${CATS.map((c) => `<a href="${link('HO-02')}"><span class="ic">${c.ic}</span>${c.nm}</a>`).join('')}</div>`)}

  ${sec('지금 뜨는 공구', dealCards(DEALS, pctOf, { cls: 'stair' }), { more: 'HO-02' })}

  ${sec('곧 열려요', `<div class="g3">${SOON.map((s) => `<div class="box">
      <div class="row-b"><b>${esc(s.nm)}</b>${badge('예정', 'b-mut')}</div>
      <p class="t-sub mt2">${s.open} 오픈 · ${num(s.want)}명이 알림을 신청했어요</p>
      <button class="btn btn-soft btn-block btn-sm mt3" type="button" data-toast="열리면 알려드릴게요" data-toast-kind="ok">오픈 알림 신청</button>
    </div>`).join('')}</div>`)}

  ${sec('', promo({
    href: 'HS-01',
    kicker: '공구 진행자 모집',
    imgLabel: '진행자 소개 배너',
    title: '직접 공구를 열어 보실래요?',
    body: '공구 진행자는 공구를 열어 사람을 모으고, 성사되면 발주·배송까지 맡는 사람입니다. 상품을 구할 곳만 있으면 누구나 될 수 있고, 첫 공구는 수수료가 없습니다.',
    cta: '진행자 시작 안내 보기',
  }))}

  ${sec('처음이신가요? 3단계면 끝납니다', `<div class="g3">
    ${[['1', '마음에 드는 공구에 참여', '옵션과 수량을 고르고 결제합니다. 이때 결제는 되지만 아직 확정은 아닙니다.'],
    ['2', '목표 인원이 모이면 성사', '마감 시각까지 목표 인원이 모이면 성사됩니다. 사람이 많을수록 값이 더 내려갑니다.'],
    ['3', '못 모으면 전액 자동 환불', '목표에 못 미치면 그 자리에서 불발되고 결제하신 금액이 전액 돌아옵니다.']]
      .map(([n, t, d]) => `<div class="box"><div class="row" style="gap:10px"><span class="badge b-pri">${n}</span><b>${t}</b></div>
        <p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`, { more: 'CS-01', moreLabel: '이용 안내 자세히' })}

  ${sec('자주 묻는 질문', accordion(FAQ.slice(0, 4), 0))}

  ${sec('', `<div class="box box-pri center">
    <h2 class="t-sec">놓치기 전에 알림을 받아 보세요</h2>
    <p class="t-sub mt2">관심 있는 카테고리의 공구가 열리면 바로 알려드립니다.</p>
    <div class="btns mt4 center">${btn('앱 내려받기', { cls: 'btn-primary btn-lg', attr: ' data-toast="앱 스토어로 이동해요"' })}
      ${btn('알림 설정하기', { cls: 'btn-ghost btn-lg', href: 'AC-03' })}</div>
  </div>`)}`;

  return { body, o: { hero } };
}

/* ── HO-02 공구 목록 ─────────────────────────────────── */
function ho02() {
  const body = `
  ${pageHd('공구 목록', `진행 중인 공구 ${num(128)}개`)}
  <div class="searchbar mb4">
    <input class="input" type="search" placeholder="상품명·진행자 이름으로 검색">
    ${btn('검색', { cls: 'btn-primary', attr: ' data-toast="검색했어요"' })}
  </div>

  ${tabs(['전체', ...CATS.slice(0, 6).map((c) => c.nm)], 0)}

  <div class="row-b mt4 mb4 wrap-row" style="gap:12px">
    <div class="row wrap-row" style="gap:8px">
      ${chips(['진행 중', '마감 임박', '달성률 80%+', '무료배송'], [0, 1])}
      <button class="btn-link" type="button" data-toast="조건을 모두 지웠어요">전체 초기화</button>
    </div>
    <div class="row" style="gap:10px">
      <span class="t-sub">${num(128)}개</span>
      <select class="select" style="width:160px"><option>마감 임박순</option><option>인기순</option><option>달성률 높은순</option><option>할인율순</option><option>최신순</option></select>
    </div>
  </div>

  ${dealCards(DEALS, pctOf, { cls: 'stair' })}
  ${dealCards(DEALS.slice(0, 3), pctOf, { cls: 'stair' })}

  <div class="center mt6">
    <button class="btn btn-ghost btn-lg" type="button" data-toast="공구 12개를 더 불러왔어요">더 보기 (116개 남음)</button>
  </div>`;
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HO-03 마감 임박 타임딜 ─────────────────────────── */
function ho03() {
  const urgent = DEALS.filter((d) => d.left < 1500).sort((a, b) => a.left - b.left);
  const body = `
  <div class="box box-danger center">
    <div class="t-sub">가장 먼저 마감되는 공구까지</div>
    <div class="t-page" data-count="1260">00:21:00</div>
    <p class="t-sub">지금 참여하시면 이번 단계 가격이 그대로 적용됩니다.</p>
  </div>

  ${pageHd('마감 임박 타임딜', '오늘 안에 끝나는 공구만 모았습니다', `<div class="row" style="gap:8px">${chips(['오늘 마감', '1시간 내 마감', '한 명만 더'], 0)}</div>`)}

  ${urgent.map((d) => {
    const need = Math.max(0, d.goal - d.joined);
    return dealRow(d, pctOf(d), {
      tail: need > 0 && need <= 20 ? badge(`${need}명이면 성사!`, 'b-danger') : '',
      right: `<div class="mt2">${btn('참여하기', { cls: 'btn-primary btn-sm', href: 'JO-01' })}</div>`,
    });
  }).join('')}

  ${banner('warn', '⏰', `<b>마감된 공구도 다시 열릴 수 있어요.</b>
    <p class="t-sub">놓치신 공구에 알림을 걸어 두시면 다시 열릴 때 바로 알려드립니다.</p>`,
    { cls: 'mt6', right: btn('재오픈 알림 신청', { cls: 'btn-accent btn-sm', attr: ' data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' }) })}

  <div class="mt8">${sec('여유 있게 볼 수 있는 공구', dealCards(DEALS.filter((d) => d.left >= 1500), pctOf, { cls: 'stair' }), { more: 'HO-02' })}</div>`;
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HO-04 공구 목록 - 결과 없음 ────────────────────── */
function ho04() {
  const body = `
  ${pageHd('공구 목록')}
  <div class="searchbar mb4">
    <input class="input" type="search" value="무선 청소기">
    ${btn('검색', { cls: 'btn-primary', attr: ' data-toast="검색했어요"' })}
  </div>
  <div class="row wrap-row mb4" style="gap:8px">
    ${chips(['디지털·가전', '10만원 이하', '무료배송'], [0, 1, 2])}
    <button class="btn-link" type="button" data-toast="조건을 모두 지웠어요">전체 초기화</button>
  </div>

  ${empty('🔍', '‘무선 청소기’로 열린 공구가 지금은 없어요',
    '조건을 풀면 12개 공구가 나옵니다. 원하시는 상품을 요청해 두시면 공구가 열릴 때 알려드릴게요.',
    `${btn('조건 모두 풀기', { cls: 'btn-primary', href: 'HO-02' })}
     ${btn('이 상품 공구 요청하기', { cls: 'btn-accent', attr: ' data-toast="요청을 받았어요. 공구가 열리면 알려드릴게요" data-toast-kind="ok"' })}`)}

  ${card('원하시는 상품을 알려 주세요', `<div class="field-btn">
    <input class="input" value="무선 청소기" placeholder="상품명이나 브랜드를 적어 주세요">
    ${btn('요청하기', { cls: 'btn-primary', attr: ' data-toast="요청을 받았어요. 같은 요청이 모이면 진행자에게 알립니다" data-toast-kind="ok"' })}
  </div>
  <p class="t-sub mt2">같은 요청이 100명 넘게 모이면 진행자에게 알려 공구 개설을 제안합니다. 지금까지 이렇게 열린 공구가 48개 있습니다.</p>`,
    { cls: 'mt6' })}

  <div class="mt8">${sec('이런 공구는 어떠세요', dealCards(DEALS.slice(0, 4), pctOf, { cls: 'stair' }))}</div>

  <div class="mt6">${sec('카테고리 둘러보기', `<div class="cats">${CATS.map((c) => `<a href="${link('HO-02')}"><span class="ic">${c.ic}</span>${c.nm}</a>`).join('')}</div>`)}</div>`;
  return { body, o: { wrapCls: 'wrap wrap-full', state: '검색 결과 0건' } };
}

/* ── DE-01 공구 상세 ────────────────────────────────── */
function de01() {
  const d = dealById('d1');
  const pct = pctOf(d);
  const hero = `<section class="detail-lead"><div class="wrap">
    <div class="gal gal-3">
      ${ph(['상품 대표 사진', 1000, 1000], { seed: d.id })}
      ${ph(['상품 사진', 1000, 1000], { seed: d.id + '2', tiny: true })}
      ${ph(['상품 사진', 1000, 1000], { seed: d.id + '3', tiny: true })}
    </div>
  </div></section>`;

  const main = `
    <div class="row wrap-row" style="gap:8px">${badge(CATS.find((c) => c.key === d.cat).nm, 'b-mut')}${badge('조건부 결제', 'b-pri')}${countdown(d.left, { sec: d.left * 60 })}</div>
    <h1 class="t-page mt3">${esc(d.nm)}</h1>
    <div class="row wrap-row mt2" style="gap:16px">
      <span>${rateLine(d.rate, d.rv)}</span><span class="t-sub">${esc(d.ship)}</span>
    </div>

    ${card('', `<div class="row-b wrap-row"><b>달성률</b><span class="t-sub">목표 ${num(d.goal)}명</span></div>
      <div class="mt2">${gauge(pct)}</div>
      <div class="row-b mt2"><span><b class="pri" style="font-size:20px">${num(d.joined)}명</b> 참여 중</span>
        <b class="pri">${num(d.goal - d.joined)}명이면 성사!</b></div>`, { cls: 'mt6' })}

    ${card('사람이 모일수록 싸집니다', tierTable(TIERS, { next: '다음 단계까지 <b>3명</b> 남았어요. 250명이 되면 24,900원 → <b>21,900원</b>이 됩니다.' }), { cls: 'mt6' })}

    ${card('지금 참여하고 있어요', `<div class="ticker">${JOINS.map((j) => `<div class="tl-item">
      <span class="pri">●</span><div class="grow"><b>${esc(j.who)}</b>님이 ${esc(j.opt)} ${j.qty}개 참여</div>
      <span class="t-sub nowrap">${j.at}</span></div>`).join('')}</div>`, { cls: 'mt6' })}

    ${banner('pri', '🔒', `<b>지금 결제하지만, 못 모으면 전액 돌려드립니다.</b>
      <p class="t-sub">마감 시각에 목표 인원에 못 미치면 그 자리에서 자동으로 전액 환불됩니다. 따로 신청하실 것은 없습니다.</p>`,
    { cls: 'mt6', right: btn('자세히', { cls: 'btn-ghost btn-sm', href: 'DE-02' }) })}

    ${card('옵션', OPTIONS.map((o) => `<div class="row-b" style="padding:10px 0${o.soldout ? ';opacity:.5' : ''}">
      <span>${esc(o.nm)}</span>
      <span class="nowrap">${o.soldout ? badge('품절', 'b-mut') : (o.add ? `+${won(o.add)}` : '기본가')}</span></div>`).join(''),
    { cls: 'mt6' })}

    ${card('배송·정산', kv([
    ['발송 일정', d.ship],
    ['배송비', '무료 (제주·도서산간 3,000원)'],
    ['지역 제한', '없음'],
    ['교환·반품', '상품 하자 시 무료 · 단순 변심 왕복 5,000원'],
  ]), { cls: 'mt6', aside: `<a class="more" href="${link('DE-02')}">거래 조건 전체 ›</a>` })}

    ${card('진행자', `<div class="row wrap-row" style="gap:16px">
      ${phAva(72, d.host)}
      <div class="grow"><h3 class="t-card">${esc(d.host)}</h3>
        <p class="t-sub">공구 34회 진행 · 성사율 91% · 평균 평점 4.8</p>
        <p class="mt2">제주에서 직접 밭을 보고 골라 옵니다. 크기가 안 맞으면 그 회차는 열지 않습니다.</p>
        <div class="row wrap-row mt3" style="gap:8px">${badge('신뢰 등급 A', 'b-ok')}${badge('사업자 인증', 'b-pri')}${badge('정산 지연 0회', 'b-mut')}</div>
      </div></div>`, { cls: 'mt6' })}

    ${card('후기', `${rateSummary(d.rate, RATE_DIST)}
      <div class="row-b mt4"><div>${tabs(['전체', '포토 후기', '5점', '3점 이하'], 0, { pill: true })}</div>
        <a class="more" href="${link('RV-01')}">후기 전체 ›</a></div>
      <div class="mt4">${REVIEWS.slice(0, 3).map((r) => review(r, { deal: false })).join('')}</div>`, { cls: 'mt6' })}

    ${card('상품 문의', QNAS.slice(0, 3).map((q) => `<div class="row-b" style="padding:10px 0">
      <a class="grow" href="${link('RV-02')}"><b>${esc(q.q)}</b><div class="t-sub">${esc(q.who)} · ${q.at} · ${q.kind}</div></a>
      ${stBadge(q.st)}</div>`).join(''),
    { cls: 'mt6', ft: btn('문의 전체 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'RV-02' }) })}`;

  const aside = card('', `<div class="center">
      <span class="badge b-acc">${off(d.was, d.now)}% 할인</span>
      <div class="price-old mt1">${won(d.was)}</div>
      <div class="price-lg">${won(d.now)}</div>
      <p class="t-sub mt1">지금 단계 가격입니다</p></div>
    <div class="mt4">${gauge(pct)}</div>
    <p class="t-sub center mt1">${num(d.joined)} / ${num(d.goal)}명</p>
    <div class="hr"></div>
    ${kv([['마감', leftText(d.left)], ['발송', d.ship], ['최소 성사', `${num(d.goal)}명`]])}
    <div class="btns mt4">${btn('참여하기', { cls: 'btn-primary btn-lg btn-block', href: 'JO-01' })}</div>
    <div class="row mt2" style="gap:8px">
      <button class="icon-btn" type="button" aria-label="찜하기" title="찜하기" data-toast="찜 목록에 담았어요" data-toast-kind="ok">♡</button>
      <button class="btn btn-ghost btn-sm grow" type="button" data-toast="링크를 복사했어요. 친구가 참여하면 성사가 빨라져요" data-toast-kind="ok">공유</button>
    </div>
    <div class="hr"></div>
    <div class="row" style="gap:8px">
      ${btn('성사 화면', { cls: 'btn-ghost btn-sm grow', href: 'DE-03' })}
      ${btn('불발 화면', { cls: 'btn-ghost btn-sm grow', href: 'DE-04' })}
    </div>`);

  const stick = stickBar(
    `<div class="t-sub">${num(d.joined)}명 참여 · ${leftText(d.left)}</div><b style="font-size:17px">${won(d.now)}</b>`,
    `<button class="icon-btn" type="button" aria-label="찜하기" title="찜하기" data-toast="찜 목록에 담았어요" data-toast-kind="ok">♡</button>${btn('참여하기', { cls: 'btn-primary', href: 'JO-01' })}`);

  return { body: detail2(main, aside), o: { hero, stick, wrapCls: 'wrap wrap-full' } };
}

/* ── DE-02 상품 상세정보·거래 조건 ──────────────────── */
function de02() {
  const d = dealById('d1');
  const body = `
  ${pageHd('상품 상세정보 · 거래 조건', esc(d.nm))}

  ${card('상품 설명', `<p>제주 서귀포 농가에서 직접 고른 한라봉입니다. 당도 13브릭스 이상만 골라 담습니다.</p>
    <div class="gal gal-3 mt4">
      ${ph(['상품 상세 이미지', 1000, 1400], { seed: 'de1' })}
      ${ph(['상품 상세 이미지', 1000, 1400], { seed: 'de2' })}
      ${ph(['상품 상세 이미지', 1000, 1400], { seed: 'de3' })}
    </div>
    <div class="mt4">${kv([
    ['원산지', '국내산 (제주 서귀포)'],
    ['중량', '5kg (특대과 12~14과) / 10kg (24~28과)'],
    ['보관', '서늘한 곳 · 냉장 보관 시 2주'],
    ['포장', '개별 완충 포장 · 종이 박스'],
  ])}</div>`)}

  ${card('구성·옵션', table(
    ['옵션', '구성', '추가 금액', '재고'],
    [
      ['5kg (특대과 12~14과)', '한라봉 5kg', '기본가', badge('여유', 'b-ok')],
      ['10kg (특대과 24~28과)', '한라봉 10kg', '+22,000원', badge('여유', 'b-ok')],
      ['5kg + 감귤 3kg 세트', '한라봉 5kg + 감귤 3kg', '+9,000원', badge('품절', 'b-mut')],
    ],
  ), { cls: 'mt6' })}

  ${card('배송', kv([
    ['발송 시작', '성사 확정 후 3일 이내'],
    ['도착 예정', '발송 후 1~2일 (제주·도서산간 2~3일)'],
    ['배송비', '무료 (제주·도서산간 3,000원 추가)'],
    ['지역 제한', '없음'],
    ['택배사', '한진택배'],
  ]), { cls: 'mt6' })}

  ${card('조건부 결제 규정', `<div class="box box-pri">
      <b>이 공구는 조건부 결제입니다</b>
      <p class="t-sub mt1">참여하실 때 결제가 되지만, 목표 인원에 못 미치면 자동으로 전액 환불됩니다.</p>
    </div>
    <div class="mt4">${[
    ['성사 조건', `마감 시각(${leftText(d.left)} 뒤)까지 ${num(d.goal)}명 이상 참여`],
    ['불발 시', '마감 즉시 전액 자동 환불 · 별도 신청 불필요'],
    ['환불 시점', '카드 2~5영업일 · 계좌이체 1~2영업일 · 간편결제 즉시~1일'],
    ['차액 환급', '단계가 내려가면 차액을 성사 확정 후 자동 환급'],
    ['마감 전 취소', '수수료 없이 언제든 가능'],
  ].map(([k, v]) => `<div class="row-b" style="padding:10px 0"><b class="nowrap" style="min-width:110px">${k}</b><span class="grow" style="text-align:right">${v}</span></div>`).join('')}</div>`,
    { cls: 'mt6' })}

  ${card('교환·반품', `<ul style="padding-left:18px;line-height:1.9">
      <li><b>상품에 하자가 있을 때</b> — 받으신 날부터 7일 이내, 왕복 배송비는 진행자가 부담합니다.</li>
      <li><b>단순 변심</b> — 신선식품이라 받으신 뒤에는 어렵습니다. 마감 전에는 언제든 취소하실 수 있습니다.</li>
      <li><b>배송 중 파손</b> — 사진과 함께 문의하시면 재발송하거나 전액 환불해 드립니다.</li>
    </ul>`, { cls: 'mt6' })}

  ${card('진행자·판매자 정보', kv([
    ['진행자', `${esc(d.host)} (신뢰 등급 A)`],
    ['상호', '제주농원 다래'],
    ['사업자등록번호', '616-**-*****'],
    ['소재지', '제주특별자치도 서귀포시 ***'],
    ['연락처', '문의는 앱 내 1:1 문의로 받습니다'],
  ]), { cls: 'mt6' })}

  <div class="mt6">${sec('유의사항', accordion([
    { q: '신선식품이라 크기·색에 차이가 있을 수 있습니다', a: '자연에서 자란 것이라 과마다 크기와 색이 조금씩 다릅니다. 다만 적어 둔 중량과 과수는 반드시 맞춥니다.' },
    { q: '성사 뒤 발송까지 며칠 걸립니다', a: '성사가 확정되면 그때 농가에 발주가 들어갑니다. 미리 따 두지 않기 때문에 3일 정도 걸리며, 대신 그만큼 신선합니다.' },
    { q: '수량이 많으면 나눠 올 수 있습니다', a: '10kg 이상 주문하시면 박스가 두 개로 나뉘어 하루 차이로 도착할 수 있습니다.' },
  ], 0))}</div>

  <div class="btns mt6 center">${btn('공구 상세로 돌아가기', { cls: 'btn-primary btn-lg', href: 'DE-01' })}</div>`;
  return { body, o: {} };
}

/* ── DE-03 공구 마감 - 성사 ─────────────────────────── */
function de03() {
  const d = dealById('d2');
  const body = `
  <div class="box box-ok center">
    <div style="font-size:44px">🎉</div>
    <h1 class="t-page mt2">성사됐어요! 목표를 넘었습니다</h1>
    <p class="t-sub mt2">${esc(d.nm)}</p>
    <div class="row wrap-row mt4 center" style="gap:32px">
      <div><div class="t-sec">${num(d.joined)}명</div><div class="t-sub">최종 참여</div></div>
      <div><div class="t-sec">${won(d.now)}</div><div class="t-sub">확정 가격</div></div>
      <div><div class="t-sec">${off(d.was, d.now)}%</div><div class="t-sub">할인율</div></div>
    </div>
  </div>

  ${card('적용된 할인 단계', `${tierTable([
    { n: 50, price: 128000, done: true },
    { n: 100, price: 112000, done: true },
    { n: 150, price: 98000, done: true, now: true },
  ])}
    <div class="box box-ok mt4"><b>150명 단계까지 달성해 98,000원이 확정됐습니다.</b>
      <p class="t-sub mt1">앞 단계 가격으로 참여하셨다면 차액이 자동으로 환급됩니다. 별도 신청은 필요 없습니다.</p></div>`,
    { cls: 'mt6' })}

  ${card('앞으로 이렇게 진행됩니다', timeline([
    ['참여 마감', '2026년 8월 4일 21:00 · 완료'],
    ['성사 확정', '2026년 8월 4일 21:03 · 완료'],
    ['진행자 발주', '2026년 8월 5일 예정'],
    ['발송 시작', '2026년 8월 8일 예정'],
    ['배송 완료', '발송 후 1~2일'],
  ], 2), { cls: 'mt6' })}

  ${banner('pri', '📦', `<b>배송지가 맞는지 확인해 주세요.</b>
    <p class="t-sub">발주 전까지는 내 공구함에서 배송지를 고치실 수 있습니다.</p>`,
    { cls: 'mt6', right: btn('내 참여 확인', { cls: 'btn-primary btn-sm', href: 'MY-02' }) })}

  ${card('받으시면 후기를 남겨 주세요', '<p class="t-sub">사진과 함께 후기를 남기시면 다음 공구에서 쓰실 수 있는 3,000원 쿠폰을 드립니다.</p>',
    { cls: 'mt6', ft: btn('후기 쓰러 가기', { cls: 'btn-accent btn-block btn-sm', href: 'RV-01' }) })}

  <div class="mt8">${sec('비슷한 공구도 열려 있어요', dealCards(DEALS.slice(0, 3), pctOf, { cls: 'stair' }), { more: 'HO-02' })}</div>

  <div class="btns mt6 center">
    ${btn('내 공구함으로', { cls: 'btn-primary btn-lg', href: 'MY-01' })}
    ${btn('재오픈 알림 신청', { cls: 'btn-ghost btn-lg', attr: ' data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' })}
  </div>`;
  return { body, o: { state: '성사 · 최종 151명' } };
}

/* ── DE-04 공구 마감 - 불발(미달) ───────────────────── */
function de04() {
  const d = dealById('d8');
  const body = `
  <div class="box box-mut center">
    <div style="font-size:44px">😢</div>
    <h1 class="t-page mt2">아쉽게도 인원이 모이지 않았어요</h1>
    <p class="t-sub mt2">${esc(d.nm)}</p>
    <div class="row wrap-row mt4 center" style="gap:32px">
      <div><div class="t-sec">${num(d.joined)}명</div><div class="t-sub">최종 참여</div></div>
      <div><div class="t-sec muted">${num(d.goal)}명</div><div class="t-sub">목표</div></div>
      <div><div class="t-sec muted">${num(d.goal - d.joined)}명</div><div class="t-sub">부족</div></div>
    </div>
    <div style="max-width:420px;margin:16px auto 0">${gauge(pctOf(d), { miss: true })}</div>
  </div>

  ${banner('ok', '💳', `<b>결제하신 금액은 전액 자동으로 돌아갑니다.</b>
    <p class="t-sub">따로 신청하실 것은 없습니다. 아래에서 환불이 어디까지 갔는지 보실 수 있어요.</p>`, { cls: 'mt6' })}

  ${card('환불 진행 상태', `${timeline([
    ['불발 확정', '2026년 8월 4일 18:00 · 완료'],
    ['환불 요청 전송', '2026년 8월 4일 18:01 · 완료'],
    ['카드사 처리 중', '보통 2~5영업일 걸립니다'],
    ['환불 완료', '8월 8일쯤 예정'],
  ], 2)}
    <div class="hr"></div>
    ${kv([
    ['환불 금액', won(d.now)],
    ['환불 수단', '국민카드 1234-**-**-5678 (결제 취소)'],
    ['예상 완료', '2026년 8월 8일'],
  ])}`, { cls: 'mt6', ft: btn('환불 내역 자세히', { cls: 'btn-ghost btn-block btn-sm', href: 'MY-02' }) })}

  ${card('', `<div class="row-b wrap-row">
    <div><b>다시 열리면 알려드릴까요?</b>
      <p class="t-sub mt1">진행자가 같은 상품으로 다시 열 때 가장 먼저 알려드립니다. 지난번보다 목표 인원을 낮춰 여는 경우가 많습니다.</p></div>
    ${btn('재오픈 알림 신청', { cls: 'btn-accent', attr: ' data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' })}
  </div>`, { cls: 'mt6' })}

  <div class="mt8">${sec('지금 진행 중인 비슷한 공구', dealCards(DEALS.slice(2, 5), pctOf, { cls: 'stair' }), { more: 'HO-02' })}</div>

  <div class="btns mt6 center">
    ${btn('공구 더 둘러보기', { cls: 'btn-primary btn-lg', href: 'HO-02' })}
    ${btn('문의하기', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
  </div>`;
  return { body, o: { state: '불발 · 41/300명 · 전액 환불 진행 중' } };
}

export const PAGES = {
  'HO-01': ho01, 'HO-02': ho02, 'HO-03': ho03, 'HO-04': ho04,
  'DE-01': de01, 'DE-02': de02, 'DE-03': de03, 'DE-04': de04,
};
