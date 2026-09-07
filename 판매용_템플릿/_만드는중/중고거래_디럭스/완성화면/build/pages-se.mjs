/* SE 매물 찾기 — 내 동네 설정 / 매물 목록 / 검색 / 매물 상세 / 결과 없음
   ⚠ 지도·차트 자리에는 사진을 넣지 않는다. U.phMap 이 ph-map 클래스를 달아
     이미지-끼우기.mts 가 건너뛰게 한다. */
import * as U from './ui.mjs';
import {
  CATS, CONDS, ITEMS, onSale, itemBy, userBy, TOWNS, ago,
  RANK_WORDS, RECENT_WORDS, HOT_WORDS, TOTAL_ITEMS,
} from './data.mjs';

/* ---------------- SE-01 내 동네 설정 ---------------- */
function SE01() {
  const body = `
  ${U.pageHd('내 동네 설정', '동네를 정하면 가까운 물건부터 보여드려요')}

  ${U.detail2(`
    ${U.card('어디에 계신가요', `
      <div class="btns mb4">
        ${U.btn('📍 현재 위치로 찾기', { cls: 'btn-pri btn-lg', attr: ' data-toast="현재 위치를 확인했어요 · 역삼동"' })}
      </div>
      <div class="searchbar mb4">
        <input class="in" type="search" placeholder="동네 이름으로 찾기 (예: 역삼동)" value="역삼">
        <button class="btn btn-ghost btn-sm" type="button" data-toast="후보 동네를 좁혔어요">찾기</button>
      </div>
      <div class="stack-sm">
        ${[['역삼동', '서울 강남구'], ['역삼1동', '서울 강남구'], ['역촌동', '서울 은평구']]
      .map(([nm, gu], i) => `<label class="radio${i === 0 ? ' on' : ''}">
        <input type="radio" name="town"${i === 0 ? ' checked' : ''}>
        <b>${nm}</b> <span class="t-sub">${gu}</span></label>`).join('')}
      </div>
      <p class="t-sub mt3">위치를 못 쓰시면 동네 이름만으로도 정할 수 있어요.</p>`)}

    <div class="mt-block">${U.card('범위', `
      <p class="t-sub mb3">넓힐수록 매물이 많아지고, 좁힐수록 가까운 물건만 보여요.</p>
      ${TOWNS.ranges.map((r, i) => `<label class="radio${i === 0 ? ' on' : ''}">
        <input type="radio" name="range"${i === 0 ? ' checked' : ''}>
        <span class="row-b"><span><b>${r.k}</b> <span class="t-sub">${r.d}</span></span>
        <b>${U.num(r.n)}개</b></span></label>`).join('')}
      <div class="mt4">
        <div class="t-sub mb2">이 범위에 들어오는 동네</div>
        ${U.chips(TOWNS.ranges[0].towns)}
      </div>`)}</div>

    <div class="mt-block">${U.card('지금 고른 자리', `
      ${U.phMap('지도', 1200, 600)}
      <p class="t-sub mt3">지도 위 원이 고른 범위입니다. 범위를 바꾸면 원과 매물 수가 함께 바뀌어요.</p>`)}</div>
  `, `
    ${U.card('등록한 동네', `
      <div class="stack-sm">
        <div class="town-row"><b>${TOWNS.mine}</b>${U.badge('인증 완료', 'b-ok')}
          <button class="link quiet" type="button" data-toast="이 동네를 지웠어요" data-toast-act="되돌리기">지우기</button></div>
        <div class="town-row muted">비어 있음
          <button class="link" type="button" data-toast="동네를 하나 더 등록할 수 있어요">＋ 추가</button></div>
      </div>
      <p class="t-sub mt3">동네는 <b>2개까지</b> 등록할 수 있어요.</p>`)}

    <div class="mt-block">${U.banner('info', '✅', `<b>동네 인증</b>
      <div class="t-sub mt1">그 동네에서 한 번 위치를 확인해야 아래를 할 수 있어요.</div>
      <ul class="dots t-sub mt2"><li>판매글 쓰기</li><li>채팅 보내기</li><li>후기 남기기</li></ul>`)}</div>

    <div class="mt-block">${U.card('', `
      ${U.btn('이 동네로 설정', { href: 'SE-02', cls: 'btn-pri btn-block btn-lg' })}
      <p class="t-sub mt2 center">언제든 다시 바꿀 수 있어요.</p>`)}</div>
  `)}
  `;
  return { body, o: {} };
}

/* ---------------- SE-02 매물 목록 ---------------- */
function SE02() {
  const 목록 = ITEMS;
  const 필터 = U.filterSide([
    {
      t: '카테고리',
      body: CATS.slice(0, 6).map((c) => `<label><input type="checkbox" data-filter="items" data-f-key="cat" data-f-val="${c.nm}">
        <span class="grow">${c.nm}</span><span class="t-sub">${U.num(c.n)}</span></label>`).join('')
        + `<button class="link mt2" type="button" data-toast="분류를 더 펼쳤어요">＋ 더 보기</button>`,
    },
    {
      t: '가격',
      body: `<div class="rng">
        <input class="input" type="number" placeholder="최저" data-filter="items" data-f-key="price" data-f-op="min">
        <span class="t-sub">~</span>
        <input class="input" type="number" placeholder="최고" data-filter="items" data-f-key="price" data-f-op="max">
      </div>
      <p class="t-sub mt2">원 단위로 적어 주세요</p>`,
    },
    {
      t: '물건 상태',
      body: CONDS.map((c) => `<label><input type="checkbox" data-filter="items" data-f-key="cond" data-f-val="${c.k}">
        <span>${c.k}</span></label>`).join(''),
    },
    {
      t: '거래 방식',
      body: ['직거래', '택배', '안전결제'].map((w) => `<label><input type="checkbox" data-filter="items" data-f-key="ways" data-f-val="${w}">
        <span>${w}</span></label>`).join(''),
    },
    {
      t: '동네 범위',
      body: TOWNS.ranges.map((r, i) => `<label><input type="radio" name="rng"${i === 0 ? ' checked' : ''}
        data-toast="${r.k} 범위로 바꿨어요"><span class="grow">${r.k}</span><span class="t-sub">${U.num(r.n)}</span></label>`).join(''),
    },
    {
      t: '그 밖에',
      body: `<label><input type="checkbox" checked data-filter="items" data-f-key="st" data-f-not="거래완료">
        <span>거래완료 숨기기</span></label>`,
    },
  ], {
    after: `<div class="mt4">${U.btn('전체 해제', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-filter-reset="items"' })}</div>`,
  });

  const 본문 = `
  <div class="page-hd row-b wrap-row">
    <div>
      <h1 class="t-page">${TOWNS.mine} 매물</h1>
      <p class="t-sub"><b data-filter-count="items">${목록.length}</b>개 / 모두 <span data-filter-total="items">${목록.length}</span>개</p>
    </div>
    <div class="row-c wrap-row">
      <select class="input" style="width:auto" data-sort-cards="items">
        <option value="dist">거리순</option>
        <option value="min">최신순</option>
        <option value="price">낮은 가격순</option>
        <option value="wish" data-desc>인기순</option>
      </select>
      ${U.btn('🔔 이 조건으로 알림 받기', { href: 'MY-06', cls: 'btn-ghost' })}
    </div>
  </div>

  <div class="row-c wrap-row mb4" data-filter-applied="items" hidden>
    <span class="t-sub nowrap">걸린 조건</span>
    <span class="chips" data-filter-applied-in></span>
  </div>

  <div class="stack" data-sort-list="items" data-filter-list="items">
    ${목록.map((it, i) => U.itemRow(it, { i })).join('')}
  </div>

  <div data-filter-empty="items" hidden>
    ${U.empty('🔍', '조건에 맞는 매물이 없어요', '조건을 하나씩 풀어 보시거나 동네 범위를 넓혀 보세요.',
    U.btn('조건 전체 해제', { cls: 'btn-pri', attr: ' data-filter-reset="items"' })
    + U.btn('결과 없음 화면 보기', { href: 'SE-05', cls: 'btn-ghost' }))}
  </div>

  <div class="center mt-block">
    ${U.btn('더 보기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="다음 20개를 불러왔어요"' })}
  </div>
  <div class="pager mt4">
    <button class="pg" type="button" disabled aria-label="이전">‹</button>
    <button class="pg on" type="button">1</button>
    <button class="pg" type="button" data-toast="2쪽을 불러왔어요">2</button>
    <button class="pg" type="button" data-toast="3쪽을 불러왔어요">3</button>
    <button class="pg" type="button" data-toast="다음 쪽을 불러왔어요" aria-label="다음">›</button>
  </div>
  `;
  return { body: U.filterPage(필터, 본문), o: {} };
}

/* ---------------- SE-03 검색 ---------------- */
function SE03() {
  const 후보 = [['무선청소기', 218], ['무선청소기 다이슨', 46], ['무선청소기 거치대', 12]];
  const 미리 = onSale().slice(0, 5);

  const body = `
  ${U.pageHd('검색', '찾는 물건 이름을 적어 보세요')}

  <div class="searchbar lg mb4">
    <input class="in" type="search" placeholder="어떤 물건을 찾으세요?" value="무선청소기">
    <button class="btn btn-pri" type="button" data-toast="검색 결과를 보여드릴게요">찾기</button>
  </div>

  ${U.card('이런 말인가요', `<div class="stack-sm">
    ${후보.map(([w, n]) => `<a class="sugg" href="${U.link('SE-02')}"><b>${w}</b><span class="t-sub">${U.num(n)}개</span></a>`).join('')}
  </div>`)}

  <div class="mt-block">${U.sec('최근 검색어', `
    <div class="chips" data-recent>
      ${RECENT_WORDS.map((w) => `<button class="chip on" type="button" data-recent-x>${w} <span class="x">✕</span></button>`).join('')}
    </div>
    <button class="link mt2" type="button" data-recent-clear>전체 삭제</button>`)}</div>

  ${U.sec('인기 검색어', `<div class="g2">
    ${RANK_WORDS.map((r, i) => `<a class="rank-row" href="${U.link('SE-02')}">
      <span class="no${i < 3 ? ' hot' : ''}">${i + 1}</span>
      <span class="w">${r.w}</span>
      <span class="d ${r.d > 0 ? 'up' : (r.d < 0 ? 'down' : 'same')}">${r.d > 0 ? '▲ ' + r.d : (r.d < 0 ? '▼ ' + -r.d : '—')}</span>
    </a>`).join('')}
  </div>`)}

  ${U.sec('이 분류 안에서만 찾기', U.card('', `
    <label class="check mb3"><input type="checkbox"><span>고른 분류 안에서만 찾을게요</span></label>
    <select class="input"><option>분류 고르기</option>${CATS.map((c) => `<option>${c.nm}</option>`).join('')}</select>`))}

  ${U.accordion([{
    q: '이렇게 찾으면 더 잘 나와요',
    a: `<ul class="dots"><li>낱말 두 개를 띄어 쓰면 <b>둘 다 든 것</b>을 찾습니다 — 「다이슨 청소기」</li>
      <li>빼고 찾으려면 앞에 빼기표를 붙입니다 — 「청소기 -부품」</li>
      <li>따옴표로 묶으면 <b>그대로 붙은 말</b>만 찾습니다 — 「"무선 청소기"」</li></ul>`,
  }], -1)}

  ${U.sec('먼저 이런 것이 나와요', `<div class="stack">${미리.map((it) => U.itemRow(it, { sm: true })).join('')}</div>`,
    { aside: U.btn('결과 전체 보기', { href: 'SE-02', cls: 'btn-pri btn-sm' }) })}

  <p class="t-sub mt4 center">찾는 것이 없으면 <a class="link" href="${U.link('SE-05')}">이런 화면</a>이 나와요.</p>
  `;
  return { body: U.article(body), o: {} };
}

/* ---------------- SE-04 매물 상세 ---------------- */
function SE04() {
  const it = itemBy('i1');
  const u = userBy(it.by);
  const 다른것 = ITEMS.filter((x) => x.by === it.by && x.id !== it.id).slice(0, 4);
  const 비슷 = ITEMS.filter((x) => x.cat === it.cat && x.id !== it.id).slice(0, 4);

  const 왼쪽 = `
  <div class="gal">
    ${U.phShot(it.id, { after: `<span class="gal-n">1 / ${it.photos}</span>` })}
    <button class="gal-nav prev" type="button" data-toast="이전 사진" aria-label="이전 사진">‹</button>
    <button class="gal-nav next" type="button" data-toast="다음 사진" aria-label="다음 사진">›</button>
  </div>
  <div class="row mt3" style="gap:8px">
    ${[1, 2, 3, 4, 5].map((n) => U.phItem(64, it.id + n)).join('')}
  </div>

  <div class="mt-block">
    <div class="row-c wrap-row mb2">${U.badge(it.cat, 'b-mut')}${it.offer ? U.badge('가격 제안 받아요', 'b-acc') : ''}${U.wayBadges(it.ways)}</div>
    <h1 class="t-page">${U.esc(it.t)}</h1>
    <div class="t-page mt2" style="color:var(--pri-text)">${U.won(it.price)}</div>
    <p class="t-sub mt2">${it.town} · ${ago(it.min)} · ${it.dist}km · 조회 ${it.view} · 찜 ${it.wish} · 채팅 ${it.chat}</p>
  </div>

  <div class="mt-block">${U.kv([
    ['물건 상태', `${U.badge(it.cond, 'b-mut')} <span class="t-sub">${CONDS.find((c) => c.k === it.cond).d}</span>`],
    ['쓴 기간', it.use],
    ['거래 방식', U.wayBadges(it.ways) + (it.ship ? ` <span class="t-sub">배송비 ${U.won(it.ship)}</span>` : '')],
    ['직거래 지역', `${it.town} 일대`],
  ])}</div>

  ${U.sec('설명', `<p style="white-space:pre-line;line-height:var(--lh-body,1.7)">${U.esc(it.desc)}</p>
    <button class="link mt2" type="button" data-toast="설명을 모두 폈어요">더 보기</button>`)}

  ${U.sec('직거래는 여기서', `${U.phMap('지도', 800, 400)}
    <p class="t-sub mt2">${it.town} 일대에서 만나 거래합니다. 정확한 자리는 채팅에서 정해요.</p>
    <div class="btns mt3">${U.btn('안전거래존 보기', { href: 'CH-03', cls: 'btn-ghost btn-sm' })}</div>`)}

  ${U.sec('이 판매자', U.userCard(u, { href: 'MY-01', right: U.btn('다른 매물 보기', { href: 'SE-02', cls: 'btn-ghost btn-sm' }) }))}

  ${U.sec(`${u.nick}님의 다른 매물`, `<div class="g4">${다른것.map((x) => U.itemCard(x)).join('')}</div>`)}

  ${U.sec('비슷한 매물', `<div class="g4">${비슷.map((x) => U.itemCard(x)).join('')}</div>`)}

  ${U.banner('warn', '🛡', `<b>돈을 먼저 보내 달라고 하면 의심하세요</b>
    <div class="t-sub mt1">안전결제를 쓰면 물건을 받고 「받았어요」를 누른 뒤에 돈이 넘어갑니다.</div>`,
    { right: U.btn('신고하기', { href: 'CH-04', cls: 'btn-ghost btn-sm' }) })}
  `;

  const 오른쪽 = `
  ${U.card('', `
    <div class="t-sec">${U.won(it.price)}</div>
    <p class="t-sub mt1">${it.ship ? `택배 시 배송비 ${U.won(it.ship)} 별도` : '직거래만 가능해요'}</p>
    <div class="mt4">${U.btn('채팅하기', { href: 'CH-02', cls: 'btn-pri btn-block btn-lg' })}</div>
    ${it.ways.includes('안전결제')
      ? `<div class="mt2">${U.btn('안전결제로 사기', { href: 'PA-01', cls: 'btn-ghost btn-block' })}</div>`
      : `<div class="mt2">${U.btn('이 매물은 안전결제를 안 받아요', { cls: 'btn-ghost btn-block', off: true })}</div>`}
    ${it.offer ? `<div class="mt2">${U.btn(`가격 제안하기 (${U.won(it.offerMin)}부터)`, { cls: 'btn-ghost btn-block', attr: ' data-toast="제안 금액을 적어 보내면 채팅으로 이어져요"' })}</div>` : ''}
    <div class="row-b mt4">
      <button class="heart grow" type="button" data-wish="${it.wish}">♡ 찜하기 <span class="n">${it.wish}</span></button>
      <button class="btn btn-quiet btn-sm" type="button" data-toast="링크를 복사했어요">공유</button>
    </div>`)}

  <div class="mt-block">${U.card('판매자', `
    ${U.phAva(48, u.id)}
    <div class="mt3"><a class="t-card" href="${U.link('MY-01')}">${u.nick}</a> ${U.manner(u.manner)}</div>
    <p class="t-sub mt1">${u.town} · 판 것 ${u.sold}회 · 응답률 ${u.resp}%</p>
    <div class="verifies mt3">${u.tags.map(U.verify).join('')}</div>`)}</div>

  <div class="mt-block">${U.card('', `
    <button class="link quiet" type="button" data-modal="rep">⚑ 이 매물 신고하기</button>
    <div class="mt2"><a class="link quiet" href="${U.link('CH-04')}">이 사용자 글 안 보기</a></div>`)}</div>
  ${U.modal('rep', '무엇을 신고할까요', `<p class="t-sub">고르시면 신고 화면으로 넘어가 자세히 적을 수 있어요.</p>
    <div class="stack-sm mt3">${['사기가 의심돼요', '팔 수 없는 물건이에요', '남의 사진을 가져다 썼어요'].map((k) =>
    `<a class="radio" href="${U.link('CH-04')}">${k}</a>`).join('')}</div>`,
    U.btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }))}
  `;

  return { body: U.detail2(왼쪽, 오른쪽), o: {} };
}

/* ---------------- SE-05 결과 없음 ---------------- */
function SE05() {
  const 걸린것 = [['카테고리 · 디지털기기', 18], ['가격 30만원 이하', 6], ['거의 새것', 11], ['안전결제 가능', 4]];
  const 인기 = onSale().slice(0, 4);

  const body = `
  ${U.pageHd('매물 목록', '조건에 맞는 매물 <b>0개</b>')}

  ${U.empty('🔍', '「무선청소기」 조건에 맞는 매물이 없어요',
    '조건을 하나씩 풀어 보시거나, 동네 범위를 넓혀 보세요.', '')}

  ${U.sec('걸린 조건을 하나씩 풀어 보세요', `<div class="stack-sm">
    ${걸린것.map(([k, n]) => `<div class="cond-row">
      <span class="grow">${k}</span>
      <span class="t-sub">이것만 풀면 <b>${n}개</b></span>
      ${U.btn('풀기', { href: 'SE-02', cls: 'btn-ghost btn-sm' })}
    </div>`).join('')}
  </div>`)}

  ${U.sec('동네를 넓혀 볼까요', `<div class="g3">
    ${TOWNS.ranges.map((r, i) => U.card('', `<div class="t-card">${r.k}</div>
      <p class="t-sub mt1">${r.d}</p>
      <div class="t-sec mt2">${U.num(i === 0 ? 0 : (i === 1 ? 3 : 11))}개</div>
      <div class="mt3">${U.btn(i === 0 ? '지금 이 범위' : '이 범위로 넓히기',
      { href: 'SE-02', cls: i === 0 ? 'btn-ghost btn-block btn-sm' : 'btn-pri btn-block btn-sm' })}</div>`)).join('')}
  </div>`)}

  ${U.banner('info', '🔔', `<b>올라오면 알려드릴까요?</b>
    <div class="t-sub mt1">「무선청소기 · 30만원 이하 · 내 동네」 조건으로 새 매물이 올라오면 바로 알려드려요.</div>`,
    { right: U.btn('알림 받기', { href: 'MY-06', cls: 'btn-pri btn-sm' }) })}

  ${U.sec('이런 말은 어때요', U.chips(HOT_WORDS, -1, { extra: ` data-go="${U.link('SE-02')}"` }))}

  ${U.sec('지금 인기 있는 매물', `<div class="g4">${인기.map((x) => U.itemCard(x)).join('')}</div>`,
    { more: 'SE-02' })}
  `;
  return { body, o: {} };
}

export const PAGES = { 'SE-01': SE01, 'SE-02': SE02, 'SE-03': SE03, 'SE-04': SE04, 'SE-05': SE05 };
