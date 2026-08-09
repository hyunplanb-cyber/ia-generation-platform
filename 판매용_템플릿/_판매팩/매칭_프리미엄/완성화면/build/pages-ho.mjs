/* HO 홈 — 비로그인 / 손님 로그인 */
import * as U from './ui.mjs';
import { CATS, HOT_WORDS, PROS, REVIEWS, FAQ, PRO, CHATS, MYREQS } from './data.mjs';

const cats = (n = 12, href = 'RQ-01') => `<div class="cats">${CATS.slice(0, n).map((c) =>
  `<a class="cat" href="${U.link(href)}"><div class="ic">${c.ic}</div><div class="nm">${c.nm}</div><div class="sub">${c.sub}</div></a>`).join('')}</div>`;

const howto = (list) => `<div class="g3">${list.map(([n, t, d]) => `<div class="box">
  <div class="row-c mb2"><span class="badge b-pri lg">${n}</span></div>
  <h3 class="t-card">${t}</h3><p class="t-sub mt1">${d}</p></div>`).join('')}</div>`;

/* ---------------- HO-01 홈 - 비로그인 ---------------- */
function HO01(ctx) {
  const hero = U.heroSplit({
    kicker: '동네 고수 12,400명이 기다립니다',
    title: '어떤 도움이<br>필요하세요?',
    sub: '요청서 한 장이면 조건에 맞는 고수들이 값을 보내드려요. 받아보고 비교한 뒤 고르시면 됩니다. 손님은 무료입니다.',
    figs: [['38만 건', '누적 매칭'], ['평균 27분', '첫 견적 도착'], ['12,400명', '활동 고수']],
    card: `<h2>3분이면 요청서가 끝나요</h2>
      <form>
        <div class="searchbar lg mb4">
          <span class="ic">🔍</span>
          <input type="text" placeholder="예: 원룸 이사, 입주 청소, 수학 과외">
          ${U.btn('찾기', { cls: 'btn-pri' })}
        </div>
        <p class="t-sub mb2">이런 걸 많이 찾아요</p>
        ${U.chips(HOT_WORDS, -1, { extra: `data-go="${U.link('SE-01')}"` })}
        <div class="mt-block">${U.btn('요청서 작성하고 견적 받기', { href: 'RQ-01', cls: 'btn-pri btn-lg btn-block' })}</div>
        <p class="t-sub mt3 center">가입 없이 둘러볼 수 있어요 · 견적은 무료</p>
      </form>`,
  });

  const body = `
${U.sec('무엇을 맡기시겠어요?', cats(12), { more: 'SE-01', moreLabel: '고수 둘러보기', desc: '분야를 고르면 그에 맞는 질문만 물어봐요.' })}

${U.sec('이렇게 진행돼요', howto([
    ['1', '요청서 작성', '무엇을·언제·어디서·예산이 얼마인지 한 번에 한 질문씩 물어봐요. 3분이면 끝납니다.'],
    ['2', '견적 받기', '조건에 맞는 고수들에게 요청서가 전달되고, 보통 30분 안에 첫 견적이 도착해요.'],
    ['3', '고수 선택', '가격·평점·응답 속도를 나란히 비교하고 한 명만 고르시면 됩니다.'],
  ]))}

<div class="sec">${U.banner('info', '📡', `<div class="ticker" style="border:0;box-shadow:none;padding:0;background:transparent">
  <span class="live"><i></i>실시간</span>
  <span class="t">방금 <b>강남구</b>에서 <b>원룸 이사</b> 요청이 등록됐어요 · 2분 전 <b>서초구 입주 청소</b> · 5분 전 <b>송파구 에어컨 설치</b></span>
</div>`)}</div>

${U.sec('분야별 인기 고수', `<div class="pro-g2">${PROS.slice(0, 8).map((p, i) =>
    U.proCard(p, { why: i < 2 ? `${p.cat} 인기 ${i + 1}위` : '' })).join('')}</div>`, { more: 'SE-01' })}

${U.sec('최근 후기', U.carousel(REVIEWS.slice(0, 6).map((r) => `<div class="box">
  <div class="row-c">${U.phAva(34, r.who)}<div><b>${U.esc(r.who)}</b><div class="t-sub">${U.stars(r.r)} · ${U.esc(r.svc)}</div></div></div>
  <p class="t-sub mt3" style="color:var(--text)">${U.esc(r.t.slice(0, 78))}…</p>
  <div class="t-sub mt3">${U.esc(r.pro)} · ${r.at}</div></div>`).join(''), { cls: 'wide' }), { more: 'SE-01', moreLabel: '고수별 후기 보기' })}

${U.sec('', `<div class="card pri"><div class="card-bd">
  <div class="row-b wrap-row">
    <div>
      <span class="badge b-acc">고수 모집</span>
      <h2 class="t-sec mt2">일이 필요한 분을 여기서 만나세요</h2>
      <p class="t-sub mt2">등록은 무료입니다. 요청이 들어오면 견적을 보내고, 성사되면 수수료 12%만 냅니다.<br>
      광고비를 미리 내지 않아도 됩니다.</p>
    </div>
    <div class="btns">${U.btn('고수로 등록하기', { href: 'PR-02', cls: 'btn-pri btn-lg' })}${U.btn('고수센터 보기', { href: 'PR-01' })}</div>
  </div></div></div>`)}

${U.sec('자주 묻는 질문', U.accordion(FAQ, 0))}

${U.sec('', `<div class="box center" style="padding:var(--s12) var(--s6)">
  <h2 class="t-sec">지금 요청서를 남기면 오늘 안에 값을 받아보실 수 있어요</h2>
  <p class="t-sub mt2">가입하지 않아도 요청서를 쓸 수 있고, 다 쓴 뒤에 저장할지 고르시면 됩니다.</p>
  <div class="btns center mt-block">
    ${U.btn('요청서 작성하기', { href: 'RQ-01', cls: 'btn-pri btn-lg' })}
    ${U.btn('고수 먼저 둘러보기', { href: 'SE-01', cls: 'btn-ghost btn-lg' })}
  </div></div>`)}`;

  return { body, o: { hero, guest: true } };
}

/* ---------------- HO-02 홈 - 손님 로그인 ---------------- */
function HO02(ctx) {
  const p1 = PRO('p1'), p7 = PRO('p7');

  const body = `
<div class="page-hd">
  <h1 class="t-page">안녕하세요, 김하늘님</h1>
  <p class="t-sub">할 일이 있는 것부터 위에 모아 뒀어요.</p>
</div>

${U.sec('', `<div class="card acc"><div class="card-bd">
  <div class="row-b wrap-row mb4">
    <div class="row-c wrap-row">${U.badge('진행 중인 요청', 'b-acc')}<b class="t-card">원룸·소형 이사</b>
      <span class="t-sub">R-20260806-0142 · 8월 20일 (목) 오전</span></div>
    <span class="badge b-dan">마감까지 <span data-count="165600">46:00:00</span></span>
  </div>
  <div class="row-b wrap-row">
    <div class="row" style="gap:var(--s8)">
      <div><div class="big">5개</div><div class="t-sub">받은 견적</div></div>
      <div><div class="big">19.8만~31만</div><div class="t-sub">견적 범위</div></div>
      <div><div class="big">4.6~5.0</div><div class="t-sub">고수 평점</div></div>
    </div>
    <div class="btns">
      ${U.btn('견적 비교하기', { href: 'QT-02', cls: 'btn-pri btn-lg' })}
      ${U.btn('견적 목록', { href: 'QT-01' })}
    </div>
  </div>
  <p class="t-sub mt4">다음 할 일 — 견적 3개를 골라 나란히 비교해 보세요. 마감 후에는 견적이 사라집니다.</p>
</div></div>`)}

<div class="split-r">
  <div>
    ${U.sec('읽지 않은 메시지', `<div class="card"><div class="card-bd flush">
      ${CHATS.slice(0, 2).map((c) => { const p = PRO(c.pro); return `<a class="ch-row" href="${U.link('CH-02')}">
        ${U.phPro(44, p.id)}
        <div class="mid"><div class="row-c"><b>${U.esc(p.nm)}</b>${U.stBadge(c.st)}</div>
          <div class="last">${U.esc(c.last)}</div><div class="of">${U.esc(c.of)}</div></div>
        <div class="rt">${c.at}${c.unread ? `<div class="unread">${c.unread}</div>` : ''}</div></a>`; }).join('')}
    </div></div>`, { more: 'CH-01', moreLabel: '채팅 전체' })}

    ${U.sec('예정된 일정', `<div class="list-row today">
      ${U.phPro(60, p7.id)}
      <div class="mid">
        <div class="row-c wrap-row"><b class="t-card">에어컨 설치</b>${U.badge('확정', 'b-ok')}</div>
        <div class="t-sub mt1">${U.esc(p7.nm)} · 8월 9일 (일) 14:00 · 강남구 역삼동</div>
        <div class="t-sub mt1">방문 전날 오후에 다시 알려드릴게요.</div>
      </div>
      <div class="rt">
        ${U.btn('채팅하기', { href: 'CH-02', cls: 'btn-pri btn-sm' })}
        ${U.btn('요청 상세', { href: 'MY-02', cls: 'btn-ghost btn-sm' })}
      </div></div>`)}

    ${U.sec('', U.banner('acc', '✍️', `<b>후기를 안 쓰신 이용 건이 1개 있어요</b>
      <div class="t-sub mt1">프로필 촬영 · 스튜디오 온 · 7월 4일 이용 — 후기를 남기면 1,000 포인트를 드려요.</div>`,
    { right: U.btn('후기 쓰기', { href: 'RV-01', cls: 'btn-acc btn-sm' }) }))}

    ${U.sec('다시 맡기기', `<p class="t-sub" style="margin-top:calc(-1 * var(--sp-item));margin-bottom:var(--sp-title)">지난번에 맡기셨던 고수예요. 요청서를 다시 쓰지 않아도 바로 보낼 수 있어요.</p>
      <div class="pro-g2">${[PRO('p6'), PRO('p5'), PRO('p7')].map((p) =>
        U.proCard(p, { why: '지난 이용' })).join('')}</div>`)}

    ${U.sec('최근 본 고수', U.carousel(PROS.slice(2, 8).map((p) => `<a class="box" href="${U.link('SE-03')}">
      ${U.phPro(56, p.id)}
      <div class="mt3"><b>${U.esc(p.nm)}</b><div class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)} · 시작가 ${U.won(p.from)}</div></div>
    </a>`).join(''), { cls: 'narrow' }))}
  </div>

  <div class="sticky">
    ${U.card('내 요청 요약', `
      ${U.kv([
    ['견적 대기', '<b>2건</b>'],
    ['진행 중', '<b>1건</b>'],
    ['완료', '<b>5건</b>'],
    ['쓸 수 있는 쿠폰', '<b class="pri">1장</b>'],
  ])}
      <div class="btns mt-block">${U.btn('내 요청 전체', { href: 'MY-01', cls: 'btn-ghost btn-block' })}</div>`)}

    <div class="mt4">${U.card('내 지역에서 많이 찾는 서비스', `
      <p class="t-sub mb3">강남구 · 최근 7일</p>
      <div class="col">
        ${[['🧽', '입주 청소', '평균 18만원'], ['🔧', '에어컨 청소', '평균 9만원'], ['📦', '원룸 이사', '평균 24만원'], ['🪳', '가정 방역', '평균 12만원']]
    .map(([ic, nm, pr]) => `<a class="row-b" href="${U.link('RQ-01')}">
      <span class="row-c"><span>${ic}</span><b>${nm}</b></span><span class="t-sub">${pr}</span></a>`).join('')}
      </div>`)}</div>

    <div class="mt4">${U.box(`<h3 class="t-card">새로 맡길 일이 있으세요?</h3>
      <p class="t-sub mt2">요청서는 3분이면 끝나요.</p>
      <div class="btns mt-block">${U.btn('요청서 작성', { href: 'RQ-01', cls: 'btn-pri btn-block' })}</div>`, { cls: 'pri' })}</div>
  </div>
</div>`;

  return { body, o: {} };
}

export const PAGES = { 'HO-01': HO01, 'HO-02': HO02 };
