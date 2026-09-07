/* MY 마이페이지 — 프로필·매너 온도 / 구매 내역 / 찜한 물건 / 후기 쓰기 / 받은 후기 / 알림 설정
   ⚠ 후기는 «양쪽»이 쓴다. 산 사람도 평가받는 것이 이 장터가 쇼핑몰과 다른 점이라,
     MY-04 는 「내가 산 거래」인지 「내가 판 거래」인지에 따라 칩 목록이 통째로 바뀐다. */
import * as U from './ui.mjs';
import {
  SITE, USERS, userBy, ITEMS, itemBy, DEALS, REVIEWS, chipCounts, MANNER_HISTORY,
  GOOD_SELLER, GOOD_BUYER, BAD_SELLER, BAD_BUYER, CATS, TOWNS, ago, payout, fee,
} from './data.mjs';

const 나 = userBy('u6');

/* ---------------- MY-01 내 프로필·매너 온도 ---------------- */
function MY01() {
  const 내매물 = ITEMS.filter((x) => x.by === 'u6' || ['i1', 'i7'].includes(x.id));
  const 항목 = chipCounts();
  const 최대 = 항목[0][1];

  const 본문 = `
  ${U.card('', `<div class="row-b wrap-row">
    <div class="row-c" style="gap:16px">
      ${U.phAva(72, 'me')}
      <div>
        <div class="t-sec">${나.nick}</div>
        <p class="t-sub mt1">${나.town} · ${나.since} 가입</p>
      </div>
    </div>
    <div class="btns">
      ${U.btn('다른 사람에게 보이는 화면', { cls: 'btn-quiet btn-sm', attr: ' data-toast="남에게 보이는 그대로 보여드릴게요"' })}
      ${U.btn('프로필 수정', { cls: 'btn-ghost btn-sm', attr: ' data-modal="edit"' })}
    </div>
  </div>`)}

  <div class="mt-block">${U.card('매너 온도', `<div class="row-c wrap-row" style="gap:24px">
    ${U.manner(나.manner, { big: true })}
    <div class="grow">
      <div class="thermo">
        <div class="fill" style="width:${Math.round((나.manner - 30) / 20 * 100)}%"></div>
        <span class="base" style="left:${Math.round((36.5 - 30) / 20 * 100)}%" title="시작 온도 36.5도"></span>
      </div>
      <div class="row-b t-sub mt2"><span>30도</span><span>36.5도에서 시작</span><span>50도</span></div>
    </div>
  </div>
  <button class="link mt3" type="button" data-toast="어떤 후기가 몇 도씩 올렸는지 폈어요">어떻게 계산됐는지 보기</button>`)}</div>

  <div class="mt-block">${U.statRow([
    [`${나.sold}회`, '판 것'],
    [`${나.bought}회`, '산 것'],
    [`${나.resp}%`, `응답률 · 평균 ${나.respMin}분`],
    [`${나.again}%`, '또 거래하고 싶대요'],
  ], 'g4')}</div>

  <div class="mt-block">${U.card('인증', `<div class="row wrap-row" style="gap:8px">
    ${나.tags.map((t) => U.verify(t + ' 완료')).join('')}
    <span class="verify off">✓ 계좌 인증<button class="link" type="button" data-toast="계좌 인증 창을 열었어요">인증하기</button></span>
  </div>
  <p class="t-sub mt3">인증을 하면 이웃이 더 믿고 거래합니다. 계좌 인증을 해야 안전결제 정산을 받을 수 있어요.</p>`)}</div>

  ${U.sec('이웃들이 좋아한 점', `<div class="bars">
    ${항목.slice(0, 5).map(([k, n]) => `<div class="bar-row">
      <span class="nowrap t-sub" style="width:180px">${k}</span>
      ${U.progress(Math.round(n / 최대 * 100))}
      <span class="nowrap t-sub" style="width:36px;text-align:right">${n}</span></div>`).join('')}
  </div>`, { more: 'MY-05', moreLabel: '받은 후기 보기' })}

  ${U.tabs([
    { label: '판매중 매물', cnt: 내매물.filter((x) => x.st === '판매중').length, pane: 'my0' },
    { label: '거래완료', cnt: 내매물.filter((x) => x.st === '거래완료').length, pane: 'my1' },
    { label: '받은 후기', cnt: REVIEWS.length, pane: 'my2' },
  ], 0)}

  <div class="mt4">
    <div data-pane-body="my0"><div class="stack">${내매물.filter((x) => x.st === '판매중').map((x) => U.itemRow(x, { sm: true })).join('')}</div></div>
    <div data-pane-body="my1" hidden><div class="stack">${내매물.filter((x) => x.st === '거래완료').map((x) => U.itemRow(x, { sm: true })).join('')
    || U.empty('📦', '거래완료된 매물이 없어요', '', '')}</div></div>
    <div data-pane-body="my2" hidden><div class="stack-sm">
      ${REVIEWS.slice(0, 3).map((r) => {
    const u = userBy(r.who);
    return `<div class="card"><div class="card-bd">
        <div class="row-b wrap-row">
          <div class="row-c" style="gap:10px">${U.phAva(36, u.id)}<b>${u.nick}</b>${U.badge(r.side, 'b-mut')}</div>
          <span>${U.stars(r.r)}</span></div>
        <div class="chips mt2">${r.chips.map((c) => U.badge(c, 'b-mut')).join('')}</div>
        <p class="mt2">${U.esc(r.t)}</p></div></div>`;
  }).join('')}
      <div class="center mt3">${U.btn('받은 후기 모두 보기', { href: 'MY-05', cls: 'btn-ghost' })}</div>
    </div></div>
  </div>

  ${U.modal('edit', '프로필 수정', `
    <div class="fld"><span class="lb">사진</span>
      <div class="row-c" style="gap:12px">${U.phAva(56, 'me')}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="사진을 골라 주세요">바꾸기</button></div></div>
    <div class="fld"><label class="lb" for="nk">닉네임</label>
      <input class="input" id="nk" type="text" value="${나.nick}">
      <p class="t-sub mt1">30일에 한 번 바꿀 수 있어요.</p></div>
    <div class="fld"><label class="lb" for="bio">소개</label>
      <textarea class="input" id="bio" rows="3" placeholder="이웃에게 한마디"></textarea></div>`,
    U.btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('저장', { cls: 'btn-pri', attr: ' data-dismiss data-toast="프로필을 저장했어요"' }))}
  `;
  return { body: U.myPage('MY-01', 본문), o: {} };
}

/* ---------------- MY-02 구매 내역 ---------------- */
function MY02() {
  const 산것 = [
    { d: DEALS[0], 후기: false },
    { d: DEALS[3], 후기: false },
  ];
  const 완료 = [
    { it: 'i8', with: 'u5', price: 48000, at: '8/18', way: '직거래', st: '거래완료', 후기: true },
    { it: 'i12', with: 'u3', price: 22000, at: '8/11', way: '직거래', st: '거래완료', 후기: false },
    { it: 'i16', with: 'u5', price: 30000, at: '7/29', way: '안전결제', st: '거래완료', 후기: true },
  ];

  const 줄 = (o) => {
    const it = itemBy(o.it || o.d.item);
    const u = userBy(o.with || o.d.with);
    const price = o.price || o.d.price;
    const way = o.way || '안전결제';
    const st = o.st || o.d.st;
    return `<div class="item-row" data-way="${way}" data-st="${st}">
      <span class="thumb">${U.phItem(72, it.id)}</span>
      <span class="mid">
        <b class="nm">${U.esc(it.t)}</b>
        <span class="met"><span class="k">${o.at || o.d.paidAt}</span><span class="k">판매자 ${u.nick}</span>
          ${U.badge(way, way === '안전결제' ? 'b-ok' : 'b-mut')}${U.stBadge(st)}</span>
        <span class="price">${U.won(price)}</span>
        ${way === '안전결제' && st === '진행중' ? `<span class="mini-escrow">${U.escrow(o.d ? o.d.step : 3)}</span>` : ''}
      </span>
      <span class="act">
        ${st === '거래완료'
        ? (o.후기 ? U.badge('후기 씀', 'b-mut') : U.btn('후기 쓰기', { href: 'MY-04', cls: 'btn-pri btn-sm' }))
        : U.btn('거래 상태 보기', { href: 'PA-05', cls: 'btn-ghost btn-sm' })}
        <button class="btn btn-quiet btn-xs" type="button" data-modal="rc2">영수증</button>
      </span>
    </div>`;
  };

  const 본문 = `
  ${U.pageHd('구매 내역', `모두 ${산것.length + 완료.length}건`)}

  ${U.tabs([
    { label: '진행중', cnt: 1, pane: 'bu0' },
    { label: '거래완료', cnt: 완료.length, pane: 'bu1' },
    { label: '취소', cnt: 1, pane: 'bu2' },
  ], 0)}

  <div class="row-c wrap-row mt4 mb3">
    ${U.chips(['전체', '직거래', '안전결제'], 0)}
    <select class="input" style="width:auto;margin-left:auto" data-toast="기간을 바꿔 다시 셌어요">
      <option>최근 3개월</option><option>최근 6개월</option><option>전체 기간</option></select>
  </div>

  <div>
    <div data-pane-body="bu0"><div class="stack">${줄(산것[0])}</div></div>
    <div data-pane-body="bu1" hidden><div class="stack">${완료.map(줄).join('')}</div></div>
    <div data-pane-body="bu2" hidden><div class="stack">${줄(산것[1])}</div></div>
  </div>

  <div class="mt-block">${U.banner('info', '✍', `<b>아직 후기를 안 쓴 거래가 1건 있어요</b>
    <div class="t-sub mt1">후기는 서로 남깁니다. 내가 써야 상대의 후기도 공개돼요.</div>`,
    { right: U.btn('지금 쓰기', { href: 'MY-04', cls: 'btn-pri btn-sm' }) })}</div>

  ${U.modal('rc2', '영수증', U.kv([
    ['거래번호', 'T-90412'],
    ['물건', '에어팟 프로 2세대'],
    ['물건 값', U.won(178000)],
    ['배송비', U.won(3000)],
    ['결제 수단', '카드 (일시불)'],
    ['모두', `<b>${U.won(181000)}</b>`],
  ]), U.btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' }))}
  `;
  return { body: U.myPage('MY-02', 본문), o: {} };
}

/* ---------------- MY-03 찜한 물건 ---------------- */
function MY03() {
  const 찜 = ITEMS.slice(0, 8);
  const 내림 = { i2: 410000, i9: 195000 };

  const 줄 = (it) => {
    const 끝남 = it.st === '거래완료';
    const was = 내림[it.id];
    return `<div class="item-row${끝남 ? ' done' : ''}" data-cat="${it.cat}" data-town="${it.town}" data-price="${it.price}">
      <span class="thumb">${U.phItem(80, it.id)}${끝남 ? '<span class="veil" data-t="거래완료"></span>' : ''}</span>
      <span class="mid">
        <b class="nm">${U.esc(it.t)}</b>
        <span class="met"><span class="k">${it.town}</span><span class="k">${ago(it.min)}</span><span class="k">${it.dist}km</span></span>
        ${was ? `<span class="pd"><s>${U.won(was)}</s> <b>${U.won(it.price)}</b> ${U.badge(`${U.num(was - it.price)}원 내림`, 'b-acc')}</span>`
        : `<span class="price${끝남 ? ' off' : ''}">${U.won(it.price)}</span>`}
      </span>
      <span class="act">
        <button class="heart on" type="button" data-wish="${it.wish}" aria-label="찜 풀기">♥<span class="n">${it.wish}</span></button>
        ${끝남
        ? U.btn('비슷한 매물 찾기', { href: 'SE-02', cls: 'btn-ghost btn-sm' })
        : `<button class="btn btn-quiet btn-sm" type="button" data-toast="값이 내려가면 알려드릴게요">🔔 값 내림 알림</button>`}
      </span>
    </div>`;
  };

  const 본문 = `
  ${U.pageHd('찜한 물건', `<b data-filter-count="wish">${찜.length}</b>개 / 모두 <span data-filter-total="wish">${찜.length}</span>개`,
    `<select class="input" style="width:auto" data-filter="wish" data-f-key="cat">
      <option value="">모든 분류</option>${[...new Set(찜.map((x) => x.cat))].map((c) => `<option value="${c}">${c}</option>`).join('')}</select>
     <select class="input" style="width:auto;margin-left:8px" data-filter="wish" data-f-key="town">
      <option value="">모든 동네</option>${[...new Set(찜.map((x) => x.town))].map((t) => `<option value="${t}">${t}</option>`).join('')}</select>`)}

  ${U.banner('ok', '📉', `<b>찜한 물건 2개가 값을 내렸어요</b>
    <div class="t-sub mt1">아이패드 10세대 21,000원 · 에어팟 프로 17,000원</div>`)}

  <div class="stack mt4" data-filter-list="wish">${찜.map(줄).join('')}</div>
  <div data-filter-empty="wish" hidden>${U.empty('💔', '그 묶음에는 찜한 물건이 없어요', '',
      U.btn('전체 보기', { cls: 'btn-pri', attr: ' data-filter-reset="wish"' }))}</div>

  <div class="mt-block">${U.banner('info', '🧹', `<b>30일 넘게 안 본 찜이 3개 있어요</b>
    <div class="t-sub mt1">정리하면 알림이 줄어들어요.</div>`,
    { right: U.btn('정리하기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="오래된 찜 3개를 풀었어요" data-toast-act="되돌리기"' }) })}</div>
  `;
  return { body: U.myPage('MY-03', 본문), o: {} };
}

/* ---------------- MY-04 거래 후기 쓰기 ---------------- */
function MY04() {
  const u = userBy('u2');
  const it = itemBy('i9');
  /* 이 화면의 알맹이 — 내가 «산 쪽»이면 판매자를 매기고, «판 쪽»이면 구매자를 매긴다.
     그래서 칩 목록이 통째로 바뀐다. 쇼핑몰의 상품 리뷰와 다른 자리다. */
  const 산쪽인가 = true;
  const 좋았던 = 산쪽인가 ? GOOD_SELLER : GOOD_BUYER;
  const 아쉬운 = 산쪽인가 ? BAD_SELLER : BAD_BUYER;

  const body = `
  ${U.pageHd('거래 후기 쓰기', '거래가 어땠는지 알려 주세요')}

  ${U.card('', `<div class="row-b wrap-row">
    <div class="row-c" style="gap:12px">
      ${U.phAva(48, u.id)}
      <div><b>${u.nick}</b> ${U.manner(u.manner)}
        <p class="t-sub mt1">${U.esc(it.t)} · 9월 5일 거래</p></div>
    </div>
    ${U.badge(산쪽인가 ? '내가 산 거래' : '내가 판 거래', 'b-pri')}
  </div>`)}

  ${U.banner('info', '🤝', `<b>${u.nick}님도 나에게 후기를 남길 수 있어요</b>
    <div class="t-sub mt1">서로의 후기는 <b>둘 다 쓴 뒤에</b> 공개돼요. 한쪽만 쓰면 상대에게 보이지 않습니다.</div>`,
    { cls: 'mt4' })}

  ${U.sec('① 어떠셨나요', U.card('', `
    ${U.rateIn('별점', 5, { big: true })}
    <p class="t-sub mt2 center">아주 좋았어요</p>`))}

  ${U.sec('② 또 거래하고 싶으세요', U.card('', `<div class="stack-sm">
    ${[['또 거래하고 싶어요', '👍'], ['그저 그래요', '😐'], ['다시는 안 할래요', '👎']]
      .map(([k, ic], i) => `<label class="radio${i === 0 ? ' on' : ''}">
        <input type="radio" name="again"${i === 0 ? ' checked' : ''}><span class="ic">${ic}</span> ${k}</label>`).join('')}
  </div>`))}

  ${U.sec('③ 어떤 점이 좋았나요', U.card('', `
    <p class="t-sub mb3">${산쪽인가 ? '판매자' : '구매자'}에게 어울리는 것을 골라 주세요 · <b>3개까지</b> (2개 남음)</p>
    ${U.chips(좋았던, [0])}
    <p class="t-sub mt3">고른 항목이 상대의 프로필에 쌓여요.</p>`))}

  ${U.sec('④ 아쉬운 점도 있었나요', U.card('', `
    <label class="check"><input type="checkbox" data-unlock="badbox"><span><b>아쉬운 점도 남길게요</b></span></label>
    <div class="mt3" id="badbox">
      ${U.chips(아쉬운)}
      <textarea class="input mt3" rows="3" placeholder="무엇이 아쉬웠는지 적어 주세요"></textarea>
      <p class="t-sub mt2">아쉬운 점은 상대의 매너 온도를 내립니다. 신중하게 골라 주세요.</p>
    </div>`))}

  ${U.sec('⑤ 하고 싶은 말', U.card('', `
    <textarea class="input" rows="5" placeholder="이웃들에게 도움이 될 만한 이야기를 적어 주세요"></textarea>
    <p class="t-sub mt1 right">0 / 500</p>
    <div class="photo-grid mt3">
      <button class="photo-add" type="button" data-toast="사진을 골라 주세요">
        <span style="font-size:22px">＋</span><span>사진 (안 넣어도 돼요)</span></button>
    </div>
    <label class="check mt3"><input type="checkbox"><span>이 후기는 ${u.nick}님에게만 보이게 할게요</span></label>
    <p class="t-sub mt1">비공개로 해도 매너 온도에는 그대로 반영됩니다.</p>`))}

  ${U.box(`<b class="t-card">후기가 매너 온도를 만듭니다</b>
    <p class="t-sub mt2">좋은 후기는 온도를 올리고, 아쉬운 후기는 내립니다.
    누구나 <b>36.5도</b>에서 시작해요. 이 장터에서 「이 사람에게 사도 되나」를 재는 유일한 자입니다.</p>`)}
  `;

  const 아래바 = U.stickBar(
    `<span class="t-sub">별점을 매기면 보낼 수 있어요</span>`,
    U.btn('나중에 할게요', { href: 'MY-02', cls: 'btn-ghost' })
    + U.btn('후기 보내기', { href: 'MY-05', cls: 'btn-pri' }));

  return { body: U.article(body), o: { stick: 아래바 } };
}

/* ---------------- MY-05 받은 후기·매너 온도 상세 ---------------- */
function MY05() {
  const 항목 = chipCounts();
  const 최대 = 항목[0][1];
  const 받은 = REVIEWS;
  const 쓴것 = REVIEWS.slice(0, 3);

  const 후기카드 = (r, 내가쓴것) => {
    const u = userBy(r.who);
    const it = itemBy(r.item);
    return `<div class="card mb4"><div class="card-bd">
      <div class="row-b wrap-row">
        <div class="row-c" style="gap:10px">
          ${U.phAva(38, u.id)}
          <div><b>${u.nick}</b> ${U.manner(u.manner)}
            <div class="t-sub">${U.stars(r.r)} · ${r.at}</div></div>
        </div>
        <div class="row-c" style="gap:8px">
          ${U.badge(내가쓴것 ? `내가 ${r.side === '팔았어요' ? '샀어요' : '팔았어요'}` : `이 사람에게 ${r.side}`, 'b-mut')}
          ${r.priv ? U.badge('🔒 나에게만', 'b-mut') : ''}
          <button class="btn btn-quiet btn-xs" type="button" data-toast="사실과 다른 후기라면 신고해 주세요">⚑</button>
        </div>
      </div>
      <div class="chips mt3">
        ${r.chips.map((c) => U.badge(c, 'b-ok')).join('')}
        ${(r.bad || []).map((c) => U.badge(c, 'b-warn')).join('')}
      </div>
      <p class="mt3">${U.esc(r.t)}</p>
      <a class="row-c mt3" style="gap:8px" href="${U.link('SE-04')}">
        ${U.phItem(36, it.id)}<span class="t-sub">${U.esc(it.t)}</span></a>
    </div></div>`;
  };

  const 본문 = `
  ${U.pageHd('받은 후기·매너 온도', `후기 ${받은.length}건`)}

  ${U.card('매너 온도', `<div class="row-b wrap-row" style="gap:24px">
    ${U.manner(나.manner, { big: true })}
    <div class="grow" style="min-width:260px">
      ${U.phMap('매너 온도 추이 차트', 800, 240)}
      <div class="row-b t-sub mt2">${MANNER_HISTORY.map((h) => `<span>${h.m}<br><b>${h.v}</b></span>`).join('')}</div>
    </div>
  </div>`)}

  <div class="mt-block">${U.card('무엇이 올리고 무엇이 내렸나', U.table(
    [{ t: '까닭', w: '46%' }, { t: '건수' }, { t: '온도' }],
    [
      ['좋은 후기', '18건', '<b style="color:var(--success)">+6.0도</b>'],
      ['아쉬운 후기', '2건', '<b style="color:var(--danger)">−1.5도</b>'],
      ['빠른 응답 (평균 12분)', '—', '<b style="color:var(--success)">+0.5도</b>'],
      ['약속 어김', '0건', '—'],
    ], { foot: ['모두 합쳐', '', `<b>${나.manner}도</b>`] }))}</div>

  ${U.sec('항목별로 몇 번 받았나', `<div class="bars">
    ${항목.map(([k, n]) => `<button class="bar-row btn-bar" type="button" data-toast="「${k}」를 고른 후기 ${n}건만 보여드릴게요">
      <span class="nowrap t-sub" style="width:200px;text-align:left">${k}</span>
      ${U.progress(Math.round(n / 최대 * 100))}
      <span class="nowrap t-sub" style="width:36px;text-align:right">${n}</span></button>`).join('')}
  </div>
  <p class="t-sub mt3">막대를 누르면 그 항목을 고른 후기만 아래에 남아요.</p>`)}

  ${U.banner('info', '✍', `<b>아직 후기를 안 쓴 거래가 3건 있어요</b>
    <div class="t-sub mt1">내가 써야 상대의 후기도 공개돼요. 거래 후 30일 안에 쓸 수 있습니다.</div>`,
    { right: U.btn('지금 쓰기', { href: 'MY-04', cls: 'btn-pri btn-sm' }) })}

  <div class="mt-block">
    ${U.tabs([
    { label: '받은 후기', cnt: 받은.length, pane: 'rv0' },
    { label: '쓴 후기', cnt: 쓴것.length, pane: 'rv1' },
  ], 0)}
    <div class="mt4">
      <div data-pane-body="rv0">${받은.map((r) => 후기카드(r, false)).join('')}</div>
      <div data-pane-body="rv1" hidden>${쓴것.map((r) => 후기카드(r, true)).join('')}</div>
    </div>
  </div>
  `;
  return { body: U.myPage('MY-05', 본문), o: {} };
}

/* ---------------- MY-06 관심 키워드·알림 설정 ---------------- */
function MY06() {
  const 키워드 = [['무선청소기', 12], ['아이패드', 34], ['유아 책상', 5], ['캠핑 의자', 8]];
  const 조건 = [
    ['무선청소기 · 30만원 이하 · 내 동네', true],
    ['아이패드 · 40만원 이하 · 가까운 동네', true],
    ['자전거 · 10만원 이하 · 내 동네', false],
  ];
  const 알림 = [
    ['새 매물 알림', '관심 키워드에 맞는 물건이 올라오면', true],
    ['찜한 물건 값 내림', '찜해 둔 물건의 값이 내려가면', true],
    ['채팅', '새 메시지가 오면', true],
    ['거래 상태 바뀜', '발송·도착·정산 같은 것이 바뀌면', true],
    ['후기 도착', '상대가 나에게 후기를 남기면', true],
    ['공지·이벤트', '운영자가 알릴 것이 있으면', false],
  ];

  const 본문 = `
  ${U.pageHd('관심 키워드·알림', '찾는 물건이 올라오면 알려드려요')}

  ${U.card('관심 키워드', `
    <div class="searchbar mb3">
      <input class="in" type="text" placeholder="찾는 물건 이름 (예: 무선청소기)">
      <button class="btn btn-pri btn-sm" type="button" data-toast="키워드를 더했어요 · 지금 이 말이 든 매물이 있으면 알려드릴게요">추가</button>
    </div>
    <div class="chips">
      ${키워드.map(([w, n]) => `<button class="chip on" type="button">${w}<span class="cnt">${n}</span> <span class="x">✕</span></button>`).join('')}
    </div>
    <p class="t-sub mt3">${키워드.length} / 30개 등록했어요. 칩을 누르면 조건(분류·가격·동네)을 붙일 수 있어요.</p>`)}

  <div class="mt-block">${U.card('키워드에 조건 붙이기 — 무선청소기', `
    <div class="row wrap-row" style="gap:12px">
      <select class="input" style="flex:1 1 180px" data-recalc="kw"
        ><option data-vals="41">모든 분류</option>${CATS.map((c) => `<option${c.nm === '생활가전' ? ' selected' : ''} data-vals="${Math.max(1, Math.round(c.n / 96))}">${c.nm}</option>`).join('')}</select>
      <input class="input" style="flex:1 1 140px" type="number" placeholder="최저 가격">
      <input class="input" style="flex:1 1 140px" type="number" placeholder="최고 가격" value="300000">
      <select class="input" style="flex:1 1 160px" data-recalc="kwTown"
        >${TOWNS.ranges.map((r, i) => `<option${i === 0 ? ' selected' : ''} data-vals="${r.k}">${r.k}</option>`).join('')}</select>
    </div>
    <p class="t-sub mt3"><b data-recalc-out="kwTown" data-i="0">${TOWNS.ranges[0].k}</b> 안에서
      이 조건이면 지금 <b data-recalc-out="kw" data-i="0">9</b>개가 걸립니다.</p>`)}</div>

  ${U.sec('저장한 검색 조건', `<div class="stack-sm">
    ${조건.map(([k, on]) => `<div class="cond-row">
      <span class="grow">${k}</span>
      <button class="toggle${on ? ' on' : ''}" type="button" role="switch" aria-checked="${on}" aria-label="알림 켜기"><span class="kn"></span></button>
      <button class="link quiet" type="button" data-toast="조건을 지웠어요" data-toast-act="되돌리기">지우기</button>
    </div>`).join('')}
  </div>`)}

  ${U.sec('무엇을 알려드릴까요', U.table(
    [{ t: '알림', w: '26%' }, { t: '언제' }, { t: '받기', w: '14%' }],
    알림.map(([k, d, on]) => [
      `<b>${k}</b>`, `<span class="t-sub">${d}</span>`,
      `<button class="toggle${on ? ' on' : ''}" type="button" role="switch" aria-checked="${on}" aria-label="${k} 알림"><span class="kn"></span></button>`,
    ])))}

  ${U.sec('어디로 받을까요', U.table(
    [{ t: '알림', w: '26%' }, { t: '앱 푸시' }, { t: '문자' }, { t: '카카오톡' }, { t: '이메일' }],
    알림.slice(0, 4).map(([k]) => [
      k,
      ...[0, 1, 2, 3].map((i) => `<label class="check none"><input type="checkbox"${i === 0 ? ' checked' : ''} aria-label="${k}"></label>`),
    ])))}

  <div class="mt-block">${U.card('방해 금지 시간', `
    <div class="row-c wrap-row" style="gap:12px">
      <select class="input" style="width:auto" data-sel-text="quietFrom"><option>22:00</option><option>23:00</option><option>00:00</option></select>
      <span>~</span>
      <select class="input" style="width:auto" data-sel-text="quiet"><option>07:00</option><option selected>08:00</option><option>09:00</option></select>
    </div>
    <p class="t-sub mt2" data-sel-out="quietFrom" data-sel-map='{"22:00":"밤 10시부터 시작합니다.","23:00":"밤 11시부터 시작합니다.","00:00":"자정부터 시작합니다."}'>밤 10시부터 시작합니다.</p>
    <p class="t-sub mt2" data-sel-out="quiet" data-sel-map='{"07:00":"22시부터 07시까지는 모아 뒀다가 아침 7시에 한 번에 보내드려요. 채팅 알림은 예외입니다.","08:00":"22시부터 08시까지는 모아 뒀다가 아침 8시에 한 번에 보내드려요. 채팅 알림은 예외입니다.","09:00":"22시부터 09시까지는 모아 뒀다가 아침 9시에 한 번에 보내드려요. 채팅 알림은 예외입니다."}'>22시부터 08시까지는 모아 뒀다가 아침 8시에 한 번에 보내드려요. 채팅 알림은 예외입니다.</p>`)}</div>

  <div class="mt-block">${U.banner('warn', '🔔', `<b>하루 알림이 20개를 넘어요</b>
    <div class="t-sub mt1">「아이패드」 키워드가 하루 11번 울립니다. 가격 조건을 좁히면 줄어들어요.</div>`,
    { right: U.btn('조건 좁히기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="가격 조건을 좁혀 보세요"' }) })}</div>

  ${U.sec('최근 알림', `<div class="stack-sm">
    ${[['방금', '「무선청소기」 새 매물 — 다이슨 V11 320,000원'],
    ['12분 전', '찜한 「아이패드 10세대」가 21,000원 내렸어요'],
    ['1시간 전', '민트초코님이 메시지를 보냈어요'],
    ['3시간 전', '「기계식 키보드」 구매자가 받았다고 확인했어요'],
    ['어제', '해질녘님이 후기를 남겼어요']]
      .map(([at, t]) => `<div class="cond-row"><span class="t-sub nowrap" style="width:64px">${at}</span><span class="grow">${t}</span></div>`).join('')}
  </div>`)}
  `;
  return { body: U.myPage('MY-06', 본문), o: {} };
}

export const PAGES = { 'MY-01': MY01, 'MY-02': MY02, 'MY-03': MY03, 'MY-04': MY04, 'MY-05': MY05, 'MY-06': MY06 };
