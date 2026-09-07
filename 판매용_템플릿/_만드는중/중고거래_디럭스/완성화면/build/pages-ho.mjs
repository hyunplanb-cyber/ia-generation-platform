/* HO 홈 — 첫 화면 / 카테고리 전체 / 안전거래 안내 / 공지·이벤트
   ⚠ 레이아웃 A(목록 중심형)는 «히어로를 두지 않는다». 제목과 필터 칩 줄로 바로 시작한다.
     그래서 이 장터의 첫 화면은 배너가 아니라 «오늘 올라온 매물»이 주인공이다. */
import * as U from './ui.mjs';
import {
  SITE, CATS, TOTAL_ITEMS, ITEMS, onSale, TOWNS, ago, itemBy,
  SCAMS, BANNED, NOTICES, FEE_RATE, CAT_WORDS, SUBCATS, HOT_WORDS,
} from './data.mjs';

/* ---------------- HO-01 홈 ---------------- */
function HO01() {
  const 목록 = onSale();
  const 끌올 = 목록.filter((x) => x.boost);
  const 나머지 = 목록.filter((x) => !x.boost);
  const 줄세우기 = [...끌올, ...나머지];

  const body = `
  <div class="page-hd row-b wrap-row">
    <div>
      <h1 class="t-page">${TOWNS.mine} 근처 매물</h1>
      <p class="t-sub">가까운 이웃이 내놓은 물건부터 보여드려요 · 지금 <b data-filter-count="home">${줄세우기.length}</b>개</p>
    </div>
    <div class="row-c wrap-row">
      ${U.btn('📍 동네 바꾸기', { href: 'SE-01', cls: 'btn-ghost' })}
      ${U.btn('판매글 쓰기', { href: 'SL-01', cls: 'btn-pri' })}
    </div>
  </div>

  <div class="chips mb4">
    ${TOWNS.ranges.map((r, i) => `<button class="chip${i === 0 ? ' on' : ''}" type="button"
      data-toast="${r.k} 범위로 바꿨어요 · 매물 ${U.num(r.n)}개">${r.k}<span class="cnt">${U.num(r.n)}</span></button>`).join('')}
  </div>

  ${U.sec('카테고리', `<div class="car">
    <button class="car-nav prev" type="button" aria-label="이전">‹</button>
    <div class="carousel cat-row">
      ${CATS.map((c) => `<a class="cat-tile" href="${U.link('SE-02')}">
        <span class="ic">${c.ic}</span><span class="nm">${c.nm}</span><span class="n">${U.num(c.n)}</span></a>`).join('')}
    </div>
    <button class="car-nav next" type="button" aria-label="다음">›</button>
  </div>`, { more: 'HO-02', moreLabel: '전체 보기' })}

  ${U.banner('warn', '🛡', `<b>시세보다 너무 싼 물건은 한 번 더 의심하세요</b>
    <div class="t-sub mt1">돈을 먼저 보내 달라는 말이 나오면 안전결제를 쓰자고 하세요. 물건을 받은 뒤에 돈이 넘어갑니다.</div>`,
    { right: U.btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' }) })}

  ${U.sec('오늘 올라온 매물', `
    <div class="row-b wrap-row mb3">
      <p class="t-sub">거리순으로 보여드려요</p>
      <select class="input" style="width:auto" data-sort-cards="home">
        <option value="dist">거리순</option>
        <option value="min">최신순</option>
        <option value="price">낮은 가격순</option>
        <option value="wish" data-desc>인기순</option>
      </select>
    </div>
    <div class="stack" data-sort-list="home" data-filter-list="home">
      ${줄세우기.map((it, i) => U.itemRow(it, { i })).join('')}
    </div>
    <div class="center mt-block">
      ${U.btn('매물 더 보기', { href: 'SE-02', cls: 'btn-ghost btn-lg' })}
      <p class="t-sub mt3">${TOWNS.ranges[0].k} 기준 ${U.num(TOWNS.ranges[0].n)}개 중 ${줄세우기.length}개를 보고 계세요.</p>
    </div>`, { more: 'SE-02', moreLabel: '매물 전체 보기' })}

  ${U.sec('공지·이벤트', `<div class="g3">
    ${NOTICES.slice(0, 3).map((n) => `<a class="card" href="${U.link('CS-03')}"><div class="card-bd">
      ${U.badge(n.c, n.c === '이벤트' ? 'b-acc' : 'b-mut')}
      <div class="t-card mt2">${U.esc(n.t)}</div>
      <div class="t-sub mt1">${n.at} · 조회 ${U.num(n.hit)}</div>
    </div></a>`).join('')}
  </div>`, { more: 'HO-04' })}

  ${U.box(`<h3 class="t-card mb2">${SITE.name}는 이렇게 씁니다</h3>
    <div class="g3 mt3">
      ${[['① 올린다', '사진을 찍어 올리면 이웃이 봅니다'],
      ['② 이야기한다', '1:1 채팅으로 값을 맞추고 만날 자리를 정합니다'],
      ['③ 거래한다', '만나서 주고받거나, 멀면 안전결제로 보냅니다']]
      .map(([t, d]) => `<div><b>${t}</b><p class="t-sub mt1">${d}</p></div>`).join('')}
    </div>
    <div class="btns mt4">${U.btn('안전거래 자세히 보기', { href: 'HO-03', cls: 'btn-ghost' })}</div>`)}
  `;
  return { body, o: {} };
}

/* ---------------- HO-02 카테고리 전체 보기 ---------------- */
function HO02() {
  const 고른것 = CATS[0];
  const 소분류 = SUBCATS.digital;
  const 미리 = ITEMS.filter((x) => x.cat === '디지털기기').slice(0, 4);

  const 왼쪽 = `<aside class="side">
    <div class="gl">대분류</div>
    ${CATS.map((c, i) => `<a href="${U.link('HO-02')}"${i === 0 ? ' class="on"' : ''}>${c.ic} ${c.nm}<span class="n">${U.num(c.n)}</span></a>`).join('')}
  </aside>`;

  const 오른쪽 = `
  ${U.pageHd(`${고른것.ic} ${고른것.nm}`, `${고른것.sub} · 매물 ${U.num(고른것.n)}개`,
    U.btn('이 분류 매물 보기', { href: 'SE-02', cls: 'btn-pri' }))}

  ${U.sec('소분류', `<div class="g4">
    ${소분류.map((sc) => `<a class="tile" href="${U.link('SE-02')}">
      <span class="nm">${sc.nm}${sc.hot ? ' ' + U.badge('인기', 'b-acc') : ''}</span>
      <span class="t-sub">${U.num(120 + sc.nm.length * 37)}개</span></a>`).join('')}
  </div>`)}

  ${U.sec('이 분류에서 자주 찾는 말', U.chips(CAT_WORDS.digital, -1, { extra: ` data-go="${U.link('SE-03')}"` }))}

  ${U.sec('대표 매물', `<div class="stack">${미리.map((it) => U.itemRow(it, { sm: true })).join('')}</div>`,
    { more: 'SE-02' })}

  ${U.box(`<h3 class="t-card mb2">이런 물건은 올릴 수 없어요</h3>
    <p class="t-sub">법으로 개인 간 거래가 막혀 있거나, 다른 사람에게 해가 될 수 있는 물건입니다.
    올리면 자동으로 숨겨지거나 검토 대기로 넘어갑니다.</p>
    ${U.chips(BANNED.filter((b) => b.on).map((b) => b.k))}
    <div class="btns mt4">${U.btn('금지 품목 자세히 보기', { href: 'HO-03', cls: 'btn-ghost' })}</div>`)}
  `;
  return { body: U.filterPage(왼쪽, 오른쪽), o: {} };
}

/* ---------------- HO-03 안전거래·이용안내 ---------------- */
function HO03() {
  const 예시값 = 300000;
  const 수수료 = Math.round(예시값 * FEE_RATE);

  const body = `
  ${U.pageHd('안전거래·이용안내', '돈이 언제 어디에 있는지, 문제가 생기면 누가 도와주는지 적어 두었어요')}

  ${U.sec('이렇게 거래합니다', `<div class="g3">
    ${[['①', '판매글을 올린다', '사진을 찍고 물건 상태와 값을 적어 올립니다. 동네 인증을 한 번 해야 글을 쓸 수 있어요.'],
    ['②', '채팅으로 이야기한다', '값을 맞추고 만날 자리와 시간을 정합니다. 여기서 가격 제안을 주고받을 수 있어요.'],
    ['③', '직거래 또는 안전결제', '가까우면 만나서 주고받고, 멀면 안전결제로 보냅니다.']]
      .map(([n, t, d]) => U.card('', `<div class="t-sec">${n}</div><div class="t-card mt2">${t}</div>
        <p class="t-sub mt2">${d}</p>`)).join('')}
  </div>`)}

  ${U.sec('직거래와 안전결제, 무엇이 다른가요', U.table(
    [{ t: '', w: '28%' }, { t: '직거래' }, { t: '안전결제' }],
    [
      ['돈이 언제 넘어가나', '만나서 바로', '물건을 받고 「받았어요」를 누른 뒤'],
      ['드는 비용', '없음', `물건 값의 ${(FEE_RATE * 100).toFixed(1)}% (파는 쪽이 냄)`],
      ['만나야 하나', '네', '아니요, 택배로 보냅니다'],
      ['문제가 생기면', '둘이 이야기해서 풀어야 합니다', '운영자가 양쪽 말을 듣고 판단합니다'],
      ['걸리는 시간', '약속 잡으면 그날', '보통 3~5일'],
    ]))}

  ${U.sec('안전결제는 이렇게 굴러갑니다', `
    ${U.escrow(1, ['9/5 14:20', '', '', ''])}
    ${U.turnLine('지금은 ② 발송 차례입니다 — 판매자가 물건을 보내면 다음 칸으로 넘어가요', '')}
    <div class="mt-block">${U.accordion([
      { q: '① 결제 — 이때 돈은 어디 있나요?', a: '<b>플랫폼이 맡아 둡니다.</b> 판매자에게 바로 가지 않습니다. 판매자에게는 「결제됐다」는 알림만 갑니다.' },
      { q: '② 발송 — 판매자가 안 보내면요?', a: '기한(3일) 안에 운송장을 안 올리면 <b>자동으로 취소되고 전액 환불</b>됩니다. 기한이 다가오면 판매자에게 알림이 갑니다.' },
      { q: '③ 수령 확인 — 물건이 설명과 다르면요?', a: '<b>「받았어요」를 누르기 전에</b> 신고하세요. 사진을 붙여 반품·분쟁을 신청하면 정산이 멈추고 운영자가 봅니다. 누르고 나면 돈이 이미 넘어가 되돌리기 어렵습니다.' },
      { q: '④ 정산 — 판매자는 언제 받나요?', a: `구매확정 뒤 영업일 기준 <b>5일 안에</b> 등록한 계좌로 들어갑니다. 수수료 ${(FEE_RATE * 100).toFixed(1)}%가 빠집니다.` },
    ], 0)}</div>`)}

  ${U.sec('수수료는 이렇게 빠집니다', U.card('', `
    ${U.feeRows(예시값, 수수료, 예시값 - 수수료)}
    <p class="t-sub mt3">수수료는 <b>파는 쪽</b>이 냅니다. 사는 쪽은 물건 값과 배송비만 내면 됩니다.</p>`))}

  ${U.sec('자주 나오는 사기 수법', `
    ${U.tabs(SCAMS.map((s, i) => ({ label: s.k, pane: 'scam' + i })), 0)}
    <div class="mt3">
      ${SCAMS.map((s, i) => `<div data-pane-body="scam${i}"${i === 0 ? '' : ' hidden'}>
        ${U.card('', `<p class="t-sub">이런 말이 나옵니다</p>
          <p class="mt2" style="font-size:16px">${U.esc(s.talk)}</p>
          <div class="mt4">${U.banner('warn', '🛡', `<b>이렇게 하세요</b><div class="t-sub mt1">${U.esc(s.how)}</div>`)}</div>`)}
      </div>`).join('')}
    </div>`)}

  ${U.sec('올릴 수 없는 물건', U.table(
    [{ t: '품목', w: '26%' }, { t: '왜 안 되나요' }, { t: '올리면 어떻게 되나요', w: '20%' }],
    BANNED.filter((b) => b.on).map((b) => [b.k, b.why, U.badge(b.act, b.act === '바로 숨김' ? 'b-danger' : 'b-warn')])))}

  ${U.sec('신고하면 어떻게 되나요', `
    ${U.hsteps(['접수', '검토', '조치', '결과 알림'], 1)}
    <p class="t-sub mt4">평균 <b>6시간</b> 안에 처리합니다. 조치는 경고 · 글 삭제 · 노출 제한 · 이용 정지 중에서 정해지고,
    신고한 분과 신고당한 분 모두에게 결과를 알려드립니다.</p>
    <div class="btns mt4">${U.btn('신고하는 법 보기', { href: 'CH-04', cls: 'btn-ghost' })}</div>`)}

  ${U.sec('매너 온도가 무엇인가요', U.card('', `
    <div class="row-c wrap-row" style="gap:20px">
      ${U.manner(36.5, { big: true })}
      <div><p class="t-sub">누구나 <b>36.5도</b>에서 시작합니다.</p>
      <p class="t-sub mt1">좋은 후기를 받으면 오르고, 아쉬운 후기를 받으면 내려갑니다. 응답률도 조금 반영됩니다.</p></div>
    </div>
    ${U.table([{ t: '온도', w: '22%' }, { t: '무엇이 달라지나요' }], [
    ['37도 이상', '표시가 따로 없습니다. 보통이에요'],
    ['42도 이상', '매물 목록에서 매너 온도가 눈에 띄게 보입니다'],
    ['34도 미만', '하루에 올릴 수 있는 판매글 수가 줄어듭니다'],
    ['30도 미만', '안전결제 판매가 막힙니다'],
  ])}`))}

  ${U.sec('다투게 되면', U.banner('info', '⚖', `<b>안전결제 거래라면 운영자가 개입합니다</b>
    <div class="t-sub mt1">받은 물건이 설명과 다르면 «구매확정을 누르기 전에» 신고하세요.
    양쪽 사진과 대화를 보고 전액 환불 · 판매자 정산 · 일부 환불 중에서 판단합니다.
    직거래는 당사자끼리 푸는 것이 원칙이지만, 사기가 의심되면 신고해 주세요.</div>`,
    { right: U.btn('문의하기', { href: 'CS-02', cls: 'btn-ghost btn-sm' }) }))}
  `;
  return { body: U.article(body), o: { guest: true } };
}

/* ---------------- HO-04 공지·이벤트 목록 ---------------- */
function HO04() {
  const 분류 = ['전체', '공지', '이벤트', '제재안내'];
  const 셈 = (c) => (c === '전체' ? NOTICES.length : NOTICES.filter((n) => n.c === c).length);
  const 고정 = NOTICES.filter((n) => n.imp);
  const 나머지 = NOTICES.filter((n) => !n.imp);

  const 줄 = (n, 고정인가) => `<a class="notice-row${고정인가 ? ' imp' : ''}${n.done ? ' done' : ''}" href="${U.link('CS-03')}">
    <span class="c">${U.badge(n.c, n.c === '이벤트' ? 'b-acc' : (n.c === '제재안내' ? 'b-warn' : 'b-mut'))}</span>
    <span class="t">${고정인가 ? '<b>중요</b> ' : ''}${U.esc(n.t)}
      ${n.dday && !n.done ? U.badge(`D-${n.dday}`, 'b-pri') : ''}
      ${n.done ? U.badge('종료', 'b-mut') : ''}</span>
    <span class="at">${n.at}</span>
    <span class="hit">${U.num(n.hit)}</span>
  </a>`;

  const body = `
  ${U.pageHd('공지·이벤트', `모두 ${NOTICES.length}건`,
    `<div class="searchbar" style="max-width:280px"><input class="in" type="search" placeholder="제목으로 찾기">
      <button class="btn btn-pri btn-sm" type="button" data-toast="검색 결과를 보여드릴게요">찾기</button></div>`)}

  ${U.tabs(분류.map((c, i) => ({ label: c, cnt: 셈(c), pane: 'nt' + i })), 0)}

  <div class="mt4">
    <div data-pane-body="nt0">
      <div class="notice-list">${고정.map((n) => 줄(n, true)).join('')}${나머지.map((n) => 줄(n)).join('')}</div>
    </div>
    ${분류.slice(1).map((c, i) => {
    const 것들 = NOTICES.filter((n) => n.c === c);
    return `<div data-pane-body="nt${i + 1}" hidden>
      ${것들.length
        ? `<div class="notice-list">${고정.filter((n) => n.c === c).map((n) => 줄(n, true)).join('')}${것들.filter((n) => !n.imp).map((n) => 줄(n)).join('')}</div>`
        : U.empty('📭', '아직 글이 없어요', `${c} 분류에 올라온 글이 없습니다.`, U.btn('전체 보기', { href: 'HO-04', cls: 'btn-ghost' }))}
    </div>`;
  }).join('')}
  </div>

  <div class="pager mt-block">
    <button class="pg" type="button" disabled aria-label="이전">‹</button>
    <button class="pg on" type="button">1</button>
    <button class="pg" type="button" data-toast="2쪽을 불러왔어요">2</button>
    <button class="pg" type="button" data-toast="3쪽을 불러왔어요">3</button>
    <button class="pg" type="button" data-toast="다음 쪽을 불러왔어요" aria-label="다음">›</button>
  </div>
  `;
  return { body, o: {} };
}

export const PAGES = { 'HO-01': HO01, 'HO-02': HO02, 'HO-03': HO03, 'HO-04': HO04 };
