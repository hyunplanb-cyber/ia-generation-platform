/* 홈(HO) · 매장 탐색(SE) */
import {
  ph, phFix, phAva, map, esc, won, num, min2h, link, stars, rateLine, badge, btn, chip, chips, tabs,
  sec, card, banner, empty, table, kv, sumRows, accordion, stat, progress, stepbar, hsteps, skCard,
  modalEl, modalTpl, sheetEl, rateSummary, review, calendar, slots, shopCard, shopCards, shopSmall,
  shopRow, dzCard, menuRow, pageHd, stickBar, toastEl,
} from './ui.mjs';
import { SHOPS, CATS, AREAS, DESIGNERS, MENUS, ALL_ITEMS, OPTIONS, REVIEWS, RATE_DIST, RATE_ITEMS, FAQ, TICKER, COUPONS } from './data.mjs';

const S = SHOPS;

/* ============================================================
   HO0101 — 홈 (비로그인)
   레이아웃 A: 히어로는 검색바 없이 사진 모자이크(큰 1 + 작은 4).
   문구와 통합 검색바는 사진과 겹치지 않게 아래에 둔다.
   ============================================================ */
export function HO0101(ctx) {
  const mosaic = `<div class="mosaic">
    ${ph(['매장 대표', 1200, 1200], { seed: 'hero-a', cls: 'ph-flat' })}
    ${ph(['시술 결과', 800, 800], { seed: 'hero-b', cls: 'ph-flat', tiny: true })}
    ${ph(['시술 결과', 800, 800], { seed: 'hero-c', cls: 'ph-flat', tiny: true })}
    ${ph(['시술 결과', 800, 800], { seed: 'hero-d', cls: 'ph-flat', tiny: true })}
    ${ph(['시술 결과', 800, 800], { seed: 'hero-e', cls: 'ph-flat', tiny: true })}
  </div>`;

  const hero = `<section class="hero-a"><div class="wrap">
    ${mosaic}
    <div class="hero-copy">
      <h1>사진으로 먼저 고르는 <span class="hl">뷰티 예약</span></h1>
      <p class="sub">결과물을 보고 매장을 고르세요. 지역과 시술만 정하면 오늘 가능한 자리까지 한 번에 보입니다.</p>
    </div>
    <form class="searchbar" role="search">
      <div class="cell"><div class="lb">지역</div><input type="text" value="강남구" placeholder="어디에서 받을까요?"></div>
      <div class="cell"><div class="lb">시술</div><input type="text" value="네일" placeholder="어떤 시술을 받을까요?"></div>
      <button class="btn btn-primary" type="submit" style="min-width:120px">매장 찾기</button>
    </form>
    <div class="chips mt4">${['오늘 예약 가능', '주차 가능', '1인샵', '남성 전문', '야간 영업'].map((t) => chip(t)).join('')}</div>
  </div></section>`;

  const ticker = `<div class="ticker mb8"><span class="live"></span><b class="t-sub none">실시간</b>
    <ul>${TICKER.map((t) => `<li>${t}</li>`).join('')}</ul></div>`;

  const cats = sec('무슨 시술을 받으세요?', `<div class="cats">${CATS.map((c) =>
    `<a href="${link('SE0101')}"><div class="ic">${c.ic}</div><div class="nm">${c.nm}</div><div class="ct">${c.ct}</div></a>`).join('')}</div>`);

  /* 여덟 칸이라 «넷씩 두 줄»로 딱 떨어진다. 둘씩 놓으면 카드가 커서 한 화면에
     두 개밖에 안 보였다(2026-08-13 사장님 지적). */
  const hot = sec('내 주변 인기 매장', `<div class="mag mag-4">${shopCards(S.slice(0, 8), (s, i) => ({
    faved: i === 1, ribbon: i === 0 ? badge('이번 주 1위', 'b-pri') : '',
  }))}</div>`, { more: 'SE0101', desc: '강남구 기준 · 최근 4주 예약이 많은 순서' });

  const promo = sec('이번 주 할인 기획전', `<div class="g2 g1-m">
    <a class="promo" href="${link('SE0101')}"><div class="in"><span class="badge" style="background:rgba(255,255,255,.9);color:#33221E">9/8~9/14</span>
      <h3 class="mt2">가을 컬러 체인지 최대 30%</h3><p class="mt1">염색·발레아쥬 63곳</p></div></a>
    <a class="promo alt" href="${link('SE0101')}"><div class="in"><span class="badge" style="background:rgba(255,255,255,.9);color:#33221E">첫 방문</span>
      <h3 class="mt2">첫 예약 20% 할인 쿠폰</h3><p class="mt1">가입하면 바로 드려요</p></div></a>
  </div>`);

  const gallery = sec('시술 사진 리뷰', `<div class="gal gal-6">${Array.from({ length: 12 }, (_, i) =>
    `<a href="${link('RV0201')}">${ph(['리뷰 사진', 800, 800], { seed: 'g' + i, tiny: true })}</a>`).join('')}</div>`,
    { more: 'RV0201', moreLabel: '리뷰 더 보기', desc: '고객이 올린 실제 시술 사진입니다' });

  const fresh = sec('새로 들어온 매장', `<div class="carousel">${S.slice(6, 12).map((s) =>
    shopSmall(s, { note: badge('신규 입점', 'b-acc') })).join('')}</div>`);

  const join = `<div class="box-pri row-b wrap-row mb8">
    <div><h3 class="t-card">매장을 운영하고 계신가요?</h3>
      <p class="t-sub mt1">예약·고객 관리·정산을 한 곳에서. 입점 심사는 3~5영업일이 걸려요.</p></div>
    ${btn('매장 입점 신청', { cls: 'btn-primary', href: 'PT0201' })}</div>`;

  const faq = sec('자주 묻는 질문', accordion(FAQ.map((f) => ({ q: f.q, a: f.a })), 0));

  const cta = `<div class="box center" style="padding:48px 24px">
    <h2 class="t-sec">가입하면 첫 예약 20% 할인</h2>
    <p class="t-sub mt2">3초면 끝나요. 카카오로 바로 시작하세요.</p>
    <div class="btns mt6" style="justify-content:center">
      ${btn('회원가입하고 쿠폰 받기', { cls: 'btn-primary btn-lg', href: 'AU0201' })}
      ${btn('먼저 둘러보기', { cls: 'btn-ghost btn-lg', href: 'SE0101' })}</div></div>`;

  const body = `${ticker}${cats}${hot}${promo}${gallery}${fresh}${join}${faq}${cta}`;

  /* ---- 상태 화면 ---- */
  if (ctx.id === 'HO0102') {
    const notice = banner('warn', '📍', `<b>위치를 알 수 없어 강남구로 보여드리고 있어요.</b>
      <div class="t-sub mt1">브라우저 주소창 왼쪽 자물쇠 → 위치 → “허용”으로 바꾸면 내 주변 매장을 볼 수 있어요.</div>`,
      { right: `<div class="btns">${btn('지역 직접 고르기', { cls: 'btn-soft', attr: ' data-modal="m-area"' })}${btn('권한 다시 요청', { cls: 'btn-ghost', attr: ' data-toast="브라우저에 위치 권한을 다시 요청했어요"' })}</div>` });
    const areaSheet = modalTpl('m-area', '지역 직접 고르기',
      `<p class="t-sub mb4">자주 가는 지역을 고르면 다음에도 이 지역으로 보여드려요.</p>${chips(AREAS, 0)}`,
      `${btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('이 지역으로 보기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="강남구로 맞춰 보여드릴게요"' })}`);
    return { body: `${notice}<div class="mt6"></div>${body}${areaSheet}`, o: { state: '위치 권한 거부' } };
  }

  if (ctx.id === 'HO0103') {
    const modal = modalEl('예약하려면 로그인이 필요해요',
      `<p>지금 로그인하면 <b class="hl">첫 예약 20% 할인 쿠폰</b>을 바로 드려요.</p>
       <div class="mt4">${COUPONS.slice(0, 1).map((c) => `<div class="coupon"><div class="amt"><div class="v">${c.v}</div><div class="t-sub">할인</div></div>
         <div class="bd"><b>${c.nm}</b><p class="t-sub mt1">${c.cond} · ${c.to}까지</p></div></div>`).join('')}</div>
       <div class="social mt6">
         <button class="btn s-kakao" type="button" data-toast="카카오 로그인은 개발이 필요한 기능이에요">카카오로 3초 만에 시작</button>
         <a class="btn btn-ghost" href="${link('AU0101')}">이메일로 로그인</a>
       </div>
       <p class="center mt4"><a class="btn-link" href="${link('MY0101')}">비회원으로 예약 조회하기</a></p>`,
      `${btn('닫고 계속 둘러보기', { cls: 'btn-ghost', href: 'HO0101' })}`);
    return { body, o: { state: '비로그인 예약 유도', after: modal } };
  }

  return { body, o: { hero, wrapCls: 'wrap' } };
}
export const HO0102 = HO0101, HO0103 = HO0101;

/* ============================================================
   HO0201 — 홈 (고객 로그인)
   ============================================================ */
export function HO0201(ctx) {
  const s = S[0];
  const next = `<div class="card mb8"><div class="card-bd">
    <div class="row-b wrap-row mb4"><div class="row-c"><span class="badge b-pri b-lg">D-8</span><b class="t-sec">다가오는 예약</b></div>
      <a class="more" href="${link('MY0101')}">내 예약 전체 ›</a></div>
    <div class="row gap6 wrap-row">
      ${phFix(['매장 대표', 1200, 900], 200, { seed: s.id })}
      <div class="grow" style="min-width:220px">
        <div class="t-card">${s.nm}</div>
        <p class="t-sub">${s.area}</p>
        <div class="mt3">${kv([['시술', '발레아쥬 (약 3시간)'], ['담당', '김수현 원장'], ['일시', '<b>2026.09.12(토) 14:00</b>']])}</div>
      </div>
      <div class="none" style="min-width:180px">
        <div class="box"><div class="t-sub">현장 결제 예정</div><div class="price">145,000원</div>
          <p class="t-sub mt1">예약금 20,000원 결제 완료</p></div>
        <div class="btns mt3">${btn('예약 상세', { cls: 'btn-primary', href: 'MY0301' })}${btn('길찾기', { cls: 'btn-ghost', attr: ' data-toast="지도 앱 연결은 개발이 필요한 기능이에요"' })}</div>
      </div>
    </div></div></div>`;

  const stats = `<div class="g3 g1-m mb8">
    ${stat('3<span class="u">회</span>', '이번 달 방문', { ic: '💇' })}
    ${stat('4,100<span class="u">원</span>', '쓸 수 있는 적립금', { ic: '🪙', d: `<a class="btn-link" href="${link('AC0201')}">내역 보기</a>` })}
    ${stat('3<span class="u">장</span>', '사용 가능 쿠폰', { ic: '🎟️', d: '<span class="danger">1장이 9/10 만료</span>' })}
  </div>`;

  const often = sec('자주 가는 매장', `<div class="mag">${shopCards([S[0], S[1]], (x) => ({
    right: btn('같은 시술로 예약', { cls: 'btn-soft btn-sm', href: 'RE0101' }), priceLabel: '지난 방문 금액',
  }))}</div>`);

  const noRv = sec('리뷰를 기다리고 있어요', card('', `
    ${[['볼륨 매직', '살롱 드 코랄', '2026.08.05 방문', '적립금 2,000원'], ['젤 원컬러', '네일 아뜰리에 봄', '2026.07.24 방문', '적립금 2,000원']].map(([m, sh, d, p]) => `
    <div class="list-row">${phFix(['시술 결과', 1000, 1000], 64, { seed: m })}
      <div class="grow"><b>${m}</b><p class="t-sub">${sh} · ${d}</p></div>
      <div class="none row-c">${badge(p, 'b-acc')}${btn('리뷰 쓰기', { cls: 'btn-primary btn-sm', href: 'RV0101' })}</div></div>`).join('')}`,
    { bdCls: 'pt0' }), { aside: badge('2건', 'b-pri') });

  const news = sec('관심 매장 새 소식', `<div class="g2 g1-m">
    ${[[S[6], '가을 톤다운 컬러 3종이 새로 올라왔어요'], [S[9], '페디큐어 전용석을 6석으로 늘렸어요']].map(([x, t]) =>
    `<a class="hcard" href="${link('SE0401')}">${phFix(['매장 대표', 1200, 900], 96, { seed: x.id + 'n' })}
      <div class="grow"><b>${x.nm}</b><p class="t-sub mt1">${t}</p><span class="t-sub">2일 전</span></div></a>`).join('')}</div>`);

  const near = sec('내 주변 추천 매장', `<div class="carousel">${S.slice(2, 8).map((x) => shopSmall(x)).join('')}</div>`, { more: 'SE0101' });

  const again = sec('같은 시술 다시 예약', `<div class="g3 g1-m">
    ${[['발레아쥬', '살롱 드 코랄', 165000, '3개월 전'], ['젤 원컬러', '네일 아뜰리에 봄', 38000, '6주 전'], ['두피 스케일링', '스캘프케어 광진', 42000, '4개월 전']].map(([m, sh, p, w]) =>
    `<a class="card" href="${link('RE0101')}"><div class="card-bd">
      <div class="t-sub">${w} 방문</div><b class="t-card" style="display:block;margin:4px 0">${m}</b>
      <p class="t-sub">${sh}</p><div class="row-b mt3"><span class="price">${won(p)}</span>${badge('다시 예약', 'b-pri')}</div>
    </div></a>`).join('')}</div>`);

  const ev = `<a class="promo" href="${link('SE0101')}"><div class="in"><span class="badge" style="background:rgba(255,255,255,.9);color:#33221E">9/8~9/14</span>
    <h3 class="mt2">가을 컬러 체인지 최대 30%</h3><p class="mt1">관심 시술로 고른 염색·발레아쥬 63곳</p></div></a>`;

  const hello = `<h1 class="t-page mb6">유진아님, 다음 방문까지 8일 남았어요</h1>`;
  const body = `${hello}${next}${stats}${often}${noRv}${news}${near}${again}${ev}`;

  if (ctx.id === 'HO0202') {
    const none = `<div class="card mb8"><div class="card-bd">${empty('🗓️', '예정된 예약이 없어요',
      '마지막 방문이 5주 전이에요. 자주 가던 매장은 이번 주에도 자리가 있어요.',
      `${btn('매장 둘러보기', { cls: 'btn-primary btn-lg', href: 'SE0101' })}`)}</div></div>`;
    const recent = sec('최근 본 매장', `<div class="g4 g1-m">${S.slice(3, 7).map((x) => shopSmall(x)).join('')}</div>`);
    const coup = banner('acc', '🎟️', '<b>첫 방문 매장 20% 할인 쿠폰</b>이 아직 남아 있어요. 9월 30일까지 쓸 수 있어요.',
      { right: btn('쿠폰함', { cls: 'btn-soft', href: 'AC0201' }) });
    return {
      body: `<h1 class="t-page mb6">유진아님, 오랜만이에요</h1>${none}${stats}${often}
        ${recent}${sec('관심 시술로 고른 추천', `<div class="mag">${shopCards(S.slice(6, 10))}</div>`)}<div class="mt6">${coup}</div>`,
      o: { state: '다가오는 예약 없음', logged: true },
    };
  }

  if (ctx.id === 'HO0203') {
    const today = `<div class="card mb8" style="border-color:var(--primary)"><div class="card-bd">
      <div class="row-b wrap-row mb4"><div class="row-c">${badge('오늘 방문', 'b-pri b-lg')}<b class="t-sec">시술 시작까지 <span class="pri" data-count="7320">2:02:00</span></b></div>
        ${badge('취소 마감 지남', 'b-mut')}</div>
      <div class="row gap6 wrap-row">
        ${phFix(['매장 대표', 1200, 900], 200, { seed: S[0].id })}
        <div class="grow" style="min-width:220px">
          <div class="t-card">${S[0].nm}</div>
          ${kv([['시술', '발레아쥬 (약 3시간)'], ['담당', '김수현 원장'], ['일시', '<b>오늘 14:00</b>'], ['주소', '서울 강남구 신사동 123-4 2층']])}
        </div>
        <div class="none btns" style="flex-direction:column;min-width:160px">
          ${btn('길찾기', { cls: 'btn-primary', attr: ' data-toast="지도 앱 연결은 개발이 필요한 기능이에요"' })}
          ${btn('매장 전화', { cls: 'btn-ghost', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}
          ${btn('예약 상세', { cls: 'btn-ghost', href: 'MY0301' })}
        </div></div>
      ${banner('warn', '⏰', '늦으실 것 같으면 <b>미리 매장에 전화</b> 주세요. 연락 없이 15분이 지나면 노쇼로 기록될 수 있어요.', { cls: 'mt4' })}
      </div></div>`;
    return { body: `<h1 class="t-page mb6">오늘 살롱 드 코랄에 가는 날이에요</h1>${today}${stats}${often}${near}`, o: { state: '방문 당일 리마인더', logged: true } };
  }

  return { body, o: { logged: true, noti: 2 } };
}
export const HO0202 = HO0201, HO0203 = HO0201;

/* ============================================================
   SE0101 — 매장 목록 (필터 사이드바 + 매거진 2열)
   ============================================================ */
function filterPanel(o = {}) {
  return card('', `<div class="filter-panel">
    <div class="fg"><h4>지역</h4>
      <select class="select"><option>강남구</option>${AREAS.slice(1).map((a) => `<option>${a}</option>`).join('')}</select></div>
    <div class="fg"><h4>시술 카테고리</h4>
      ${CATS.map((c, i) => `<label class="check"><input type="checkbox"${o.cats && o.cats.includes(i) ? ' checked' : ''}>${c.ic} ${c.nm} <span class="muted">${c.ct}</span></label>`).join('')}</div>
    <div class="fg"><h4>가격대</h4>
      <input class="range" type="range" min="0" max="200000" step="10000" value="${o.price || 120000}">
      <div class="row-b t-sub"><span>0원</span><span><b>${num(o.price || 120000)}원</b> 이하</span></div></div>
    <div class="fg"><h4>최소 평점</h4>${chips(['4.5 이상', '4.0 이상', '3.5 이상'], o.rate === undefined ? 0 : o.rate)}</div>
    <div class="fg"><div class="row-b"><h4 style="margin:0">오늘 예약 가능</h4><button class="toggle${o.today ? ' on' : ''}" type="button" aria-label="오늘 예약 가능만"></button></div>
      <p class="t-sub mt2">지금 잔여 자리가 있는 매장만 봅니다</p></div>
    <div class="fg"><h4>편의</h4>${chips(['주차 가능', '1인샵', '여성 전용', '야간 영업'], o.conv === undefined ? -1 : o.conv)}</div>
  </div>`, { cls: 'sticky' });
}

const sortBar = (label = '거리순', right = '') => `<div class="row-b wrap-row mb4">
  <div class="row-c">${right}</div>
  <div class="row-c">
    <select class="select" style="width:auto"><option>${label}</option>${['거리순', '인기순', '평점순', '최저가순'].filter((x) => x !== label).map((x) => `<option>${x}</option>`).join('')}</select>
    ${btn('🗺️ 지도로 보기', { cls: 'btn-ghost', href: 'SE0301' })}
  </div></div>`;

export function SE0101(ctx) {
  const search = `<form class="searchbar mb6" role="search">
    <div class="cell"><div class="lb">지역</div><input type="text" value="강남구"></div>
    <div class="cell"><div class="lb">시술</div><input type="text" value="네일" placeholder="시술을 고르세요"></div>
    <button class="btn btn-primary" type="submit" style="min-width:110px">검색</button></form>`;

  /* SE0104 — 스켈레톤 */
  if (ctx.id === 'SE0104') {
    return {
      body: `${pageHd('매장 목록')}${search}<div class="split">${filterPanel()}<div>
        ${sortBar('거리순', '<span class="t-sub">매장을 불러오는 중이에요</span>')}
        <div class="mag">${Array.from({ length: 6 }, skCard).join('')}</div>
        <div class="center mt8"><div class="spinner"></div><p class="t-sub mt3">더 불러오는 중…</p></div>
        ${banner('mut', '🐢', '평소보다 오래 걸리고 있어요. 30초 안에 안 나오면 다시 시도해 주세요.', { cls: 'mt6', right: btn('다시 시도', { cls: 'btn-ghost', attr: ' data-toast="다시 불러올게요"' }) })}
      </div></div>`,
      o: { state: '목록 로딩(스켈레톤)' },
    };
  }

  /* SE0102 — 필터 적용 */
  if (ctx.id === 'SE0102') {
    const applied = ['강남구', '네일', '5만원 이하', '평점 4.5 이상', '주차 가능'];
    const list = S.filter((x) => x.cat === 'nail' || x.area.startsWith('강남'));
    return {
      body: `${pageHd('매장 목록')}${search}<div class="split">${filterPanel({ cats: [3], price: 50000, conv: 0 })}<div>
        <div class="box mb4"><div class="row-b wrap-row">
          <div><b>강남구</b>에서 <b>네일</b>을 <b>5만원 이하</b>로, 평점 4.5 이상 · 주차 가능한 매장 <b class="pri">${list.length}곳</b></div>
          ${btn('전체 초기화', { cls: 'btn-ghost btn-sm', href: 'SE0101' })}</div>
          <div class="chips mt3">${applied.map((t) => chip(t, true)).join('')}</div></div>
        ${sortBar('평점순')}
        <div class="mag">${shopCards(list)}</div></div></div>`,
      o: { state: '필터 적용 상태' },
    };
  }

  /* SE0103 — 오늘 예약 가능만 */
  if (ctx.id === 'SE0103') {
    const list = S.filter((x) => x.open);
    return {
      body: `${pageHd('매장 목록')}${search}<div class="split">${filterPanel({ today: true })}<div>
        ${sortBar('거리순', `${badge('오늘 예약 가능만', 'b-pri')}<span class="t-sub">${list.length}곳</span>`)}
        <div class="mag">${list.map((x, i) => shopCard(x, {
          hotTag: i < 2 ? '마감 임박' : '',
          tags: i < 2 ? ['마감 임박', ...x.tags.slice(0, 1)] : x.tags,
          right: `<div class="right"><div class="t-sub">가장 빠른 시간</div><b class="pri">${x.soon.replace('오늘 ', '')}</b>
            <div class="t-sub">남은 자리 ${i < 2 ? 1 : 3 + (i % 3)}개</div></div>`,
        })).join('')}</div></div></div>`,
      o: { state: '오늘 예약 가능만' },
    };
  }

  return {
    body: `${pageHd('매장 목록', '강남구 · 전체 시술 1,204곳')}${search}<div class="split">${filterPanel()}<div>
      ${sortBar('거리순', '<span class="t-sub">전체 <b>1,204곳</b></span>')}
      <div class="mag">${shopCards(S, (s, i) => ({ faved: i === 1 }))}</div>
      <div class="center mt8"><div class="spinner"></div><p class="t-sub mt3">스크롤하면 더 불러와요</p></div>
    </div></div>`,
  };
}
export const SE0102 = SE0101, SE0103 = SE0101, SE0104 = SE0101;

/* ============================================================
   SE0201 — 검색 결과 없음
   ============================================================ */
export function SE0201(ctx) {
  const applied = ['강남구', '왁싱', '2만원 이하', '평점 4.8 이상'];

  if (ctx.id === 'SE0202') {
    const list = [S[4], S[10], S[7], S[11]];
    return {
      body: `${pageHd('매장 목록', '검색 범위를 넓힌 결과')}
        ${banner('pri', '🔎', '강남구에 조건에 맞는 매장이 없어 <b>인근 3개 구</b>까지 넓혀 찾았어요.',
          { right: btn('원래 조건으로', { cls: 'btn-ghost', href: 'SE0201' }) })}
        <div class="card mt4 mb6"><div class="card-bd row-b wrap-row">
          <div class="grow" style="min-width:240px"><b>찾는 범위</b>
            <input class="range mt2" type="range" min="1" max="10" value="5">
            <div class="row-b t-sub"><span>1km</span><span><b>5km</b> (서초·송파·용산)</span><span>10km</span></div></div>
          <div class="chips">${applied.map((t) => chip(t, true)).join('')}</div></div></div>
        <div class="mag">${list.map((x) => shopCard(x, {
          right: `<div class="right"><div class="t-sub">여기서</div><b>${(1.2 + x.rate).toFixed(1)}km</b></div>`,
        })).join('')}</div>`,
      o: { state: '지역 확장 결과' },
    };
  }

  return {
    body: `${pageHd('매장 목록')}
      <div class="card"><div class="card-bd">
        ${empty('🔍', '‘강남구 · 왁싱’ 조건에 맞는 매장이 없어요',
          '조건을 하나만 풀어도 결과가 확 늘어나요. 가격대와 평점을 먼저 풀어보세요.',
          `${btn('필터 초기화', { cls: 'btn-primary btn-lg', href: 'SE0101' })}${btn('인근 서초구에서 찾아보기', { cls: 'btn-ghost btn-lg', href: 'SE0202' })}`)}
        <div class="hr"></div>
        <p class="t-sub mb3">지금 걸려 있는 조건 — 하나씩 지워보세요</p>
        <div class="chips">${applied.map((t) => chip(t, true)).join('')}</div>
      </div></div>
      ${sec('이런 매장은 어때요?', `<div class="mag">${shopCards([S[4], S[10], S[5], S[7]])}</div>`, { cls: 'mt8' })}
      <p class="center"><a class="btn-link" href="${link('SE0202')}">인근 서초구·송파구까지 넓혀서 찾아보기 ›</a></p>`,
  };
}
export const SE0202 = SE0201;

/* ============================================================
   SE0301 — 매장 지도
   ============================================================ */
export function SE0301(ctx) {
  const pins = [
    { x: 22, y: 30, nm: '살롱 드 코랄', free: true }, { x: 44, y: 22, nm: '네일 아뜰리에 봄', free: true },
    { x: 62, y: 40, nm: '헤어랩 서초' }, { x: 35, y: 58, nm: '스킨스튜디오 온', free: true },
    { x: 70, y: 66, nm: '왁싱하우스 마포' }, { x: 52, y: 74, nm: '래쉬룸 용산', free: true },
    { x: 80, y: 30, nm: '컬러샵 성수', free: true }, { x: 18, y: 68, nm: '살롱 미아모레' },
  ];
  const topBar = `<div class="row-b wrap-row mb4">
    <form class="searchbar grow" role="search" style="margin:0;max-width:520px;grid-template-columns:1fr auto">
      <div class="cell"><div class="lb">지역·매장</div><input type="text" value="강남구" placeholder="지역이나 매장명"></div>
      <button class="btn btn-primary" type="submit" style="min-width:96px">검색</button></form>
    <div class="btns">${btn('📍 현재 위치에서 찾기', { cls: 'btn-ghost', attr: ' data-toast="위치 연결은 개발이 필요한 기능이에요"' })}${btn('목록으로 보기', { cls: 'btn-soft', href: 'SE0101' })}</div>
  </div>`;
  const legend = `<div class="row-c t-sub mt3" style="gap:16px;flex-wrap:wrap">
    <span class="row-c"><i style="width:12px;height:12px;border-radius:999px;background:var(--primary);display:inline-block"></i> 오늘 예약 가능</span>
    <span class="row-c"><i style="width:12px;height:12px;border-radius:999px;background:var(--muted);display:inline-block"></i> 오늘 마감</span>
    <span>지도를 움직이면 이 지역에서 다시 찾을 수 있어요</span></div>`;

  const preview = (o = {}) => `<div class="card" data-map-preview><div class="card-bd">
    <div class="row gap6 wrap-row">
      ${phFix(['매장 대표', 1200, 900], 140, { seed: 'mp' })}
      <div class="grow" style="min-width:200px">
        <div class="t-card" data-map-name>살롱 드 코랄</div>
        <p class="t-sub">강남구 신사동 · 여기서 640m</p>
        <div class="mt2">${rateLine(4.9, 1284)}</div>
        ${o.soon ? `<div class="mt2">${badge('오늘 가장 빠른 시간 14:30', 'b-pri')}</div>` : ''}
      </div>
      <div class="none right" style="min-width:150px">
        <div class="t-sub">대표 시술 최저가</div><div class="price">25,000원~</div>
        <div class="btns mt3">${btn('예약하기', { cls: 'btn-primary', href: 'RE0101' })}${btn('길찾기', { cls: 'btn-ghost', attr: ' data-toast="지도 앱 연결은 개발이 필요한 기능이에요"' })}</div>
      </div></div></div></div>`;

  if (ctx.id === 'SE0302') {
    return {
      body: `${topBar}${map(pins.map((p, i) => ({ ...p, on: i === 0 })), { cls: 'map-lg' })}${legend}
        <div class="mt4">${preview({ soon: true })}</div>
        <div class="row-b mt3"><button class="btn btn-ghost btn-sm" type="button" data-toast="왼쪽 매장으로 넘겼어요">‹ 이전 매장</button>
          <span class="t-sub">좌우로 넘기면 근처 매장을 이어서 볼 수 있어요 (1/8)</span>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="오른쪽 매장으로 넘겼어요">다음 매장 ›</button></div>`,
      o: { state: '핀 미리보기 시트' },
    };
  }

  if (ctx.id === 'SE0303') {
    return {
      body: `${topBar}
        <div class="map map-lg"><span class="lb">지도 영역 (매장 위치 · 실제 지도 서비스 연결 필요)</span></div>
        <div class="card mt4"><div class="card-bd">${empty('🗺️', '이 지역에는 등록된 매장이 없어요',
          '지도를 조금 축소하거나 옆 동네로 옮겨보세요. 가장 가까운 매장은 북동쪽으로 2.4km 떨어져 있어요.',
          `${btn('축소해서 다시 찾기', { cls: 'btn-primary btn-lg', attr: ' data-toast="한 단계 축소해 다시 찾았어요"' })}${btn('목록으로 보기', { cls: 'btn-ghost btn-lg', href: 'SE0101' })}`)}
        </div></div>`,
      o: { state: '이 지역 결과 없음' },
    };
  }

  return {
    body: `${topBar}${map(pins, { cls: 'map-lg' })}${legend}
      <div class="row-c mt4" style="justify-content:center">${btn('🔄 이 지역에서 재검색', { cls: 'btn-soft', attr: ' data-toast="현재 보이는 지역에서 다시 찾았어요"' })}</div>
      <div class="mt4">${preview()}</div>`,
  };
}
export const SE0302 = SE0301, SE0303 = SE0301;

/* ============================================================
   SE0401 — 매장 상세 (상단 전체 폭 갤러리 → 아래 정보, 액션은 하단 고정 바)
   ============================================================ */
function shopHead(s, o = {}) {
  return `<div class="row-b wrap-row mb6"><div>
    <div class="badges mb2">${s.tags.map((t) => badge(t, 'b-line')).join('')}${o.closed ? badge('예약 중단', 'b-danger') : ''}</div>
    <h1 class="t-page">${s.nm}</h1>
    <p class="t-sub mt2">${s.area} · ${rateLine(s.rate, s.rv)}</p></div>
    <div class="btns">
      <button class="btn btn-ghost" type="button" data-toast="관심 매장에 담았어요">♡ 찜하기</button>
      <button class="btn btn-ghost" type="button" data-toast="주소를 복사했어요">공유</button></div></div>`;
}

const menuAcc = (o = {}) => `<div class="card"><div class="card-bd" style="padding-top:4px;padding-bottom:4px">
  ${MENUS.map((g, gi) => `<div class="acc-item${(o.open === undefined ? 0 : o.open) === gi ? ' on' : ''}">
    <button class="acc-q" type="button">${g.cat} <span class="muted" style="font-weight:400">${g.items.length}종</span><span class="mk">＋</span></button>
    <div class="acc-a" style="color:var(--text)">
      ${g.items.map((m) => menuRow(m, {
        cls: m.hide && o.showHidden ? 'is-readonly' : '',
        badge: m.hide && o.showHidden ? badge('중단됨', 'b-mut') : '',
        right: m.hide && o.showHidden ? '' : btn('선택', { cls: 'btn-soft btn-sm', href: 'RE0101' }),
      })).join('')}
    </div></div>`).join('')}</div></div>`;

const dzList = (o = {}) => `<div class="col">${DESIGNERS.map((d) => dzCard(d, {
  right: d.off ? badge('지정 불가', 'b-mut') : `<div class="btns mt2">${btn('지정 예약', { cls: 'btn-soft btn-sm', href: 'RE0201' })}</div>`,
  extra: d.off ? '<p class="t-sub mt2">10월 복귀 예정이에요</p>' : `<p class="t-sub mt2">오늘 ${d.days.includes('토') ? '근무' : '휴무'} · 이번 주 ${d.load}</p>`,
})).join('')}</div>`;

const rvTab = (o = {}) => `${card('', rateSummary(RATE_DIST, 4.9, 1284, RATE_ITEMS))}
  <div class="row-b wrap-row mt6 mb4">
    ${chips(['사진 리뷰만', '헤어', '컬러', '네일', '케어'], o.on === undefined ? -1 : o.on)}
    <select class="select" style="width:auto"><option>최신순</option><option>평점순</option><option>도움순</option></select></div>
  ${card('', REVIEWS.map((r) => review(r)).join(''))}
  <div class="center mt6">${btn('리뷰 더 보기 (1,279개)', { cls: 'btn-ghost btn-lg', href: 'RV0201' })}</div>`;

const infoTab = () => `<div class="g2 g1-m">
  ${card('오시는 길', `${map([{ x: 50, y: 45, nm: '살롱 드 코랄', free: true, on: true }], { cls: 'map-sm', lb: '지도 영역 (매장 위치 · 권장 800×400)' })}
    <div class="mt4">${kv([['주소', '서울 강남구 신사동 123-4 2층 <button class="btn-link" type="button" data-toast="주소를 복사했어요">복사</button>'],
      ['전화', '02-000-0000'], ['가는 길', '3호선 신사역 8번 출구 도보 6분']])}</div>`)}
  ${card('영업시간', `${kv([['월요일', '<span class="muted">정기 휴무</span>'], ['화~금', '11:00 ~ 21:00'], ['토·일', '10:00 ~ 19:00'], ['점심시간', '없음 (예약제)']])}
    <div class="hr"></div><p class="t-sub">임시 휴무는 매장 소식에 미리 올려드려요.</p>`)}
  ${card('편의시설', `<div class="chips">${['🅿️ 주차 2시간', '📶 와이파이', '🧴 파우더룸', '♿ 엘리베이터', '💳 카드 결제', '🐶 반려동물 동반'].map((t) => `<span class="chip">${t}</span>`).join('')}</div>`)}
  ${card('취소·노쇼 정책', `<ul class="col" style="gap:8px">
    <li>· 방문 <b>하루 전 18:00</b>까지 무료 취소</li>
    <li>· 그 이후 취소 시 예약금의 <b>50%</b> 차감</li>
    <li>· 연락 없이 방문하지 않으면 예약금 전액이 매장으로 정산되고, 30일간 예약이 제한돼요</li></ul>
    <div class="hr"></div><p class="t-sub">사업자 살롱드코랄 · 123-45-67890 · 대표 김수현</p>`)}
</div>`;

export function SE0401(ctx) {
  const s = S[0];
  const gal = `<section><div class="wrap-full" style="padding:0"><div class="detail-gal">
    ${ph(['매장 대표', 1200, 1200], { seed: 'd-a', cls: 'ph-flat' })}
    ${ph(['시술 결과', 800, 800], { seed: 'd-b', cls: 'ph-flat', tiny: true })}
    ${ph(['매장 내부', 800, 800], { seed: 'd-c', cls: 'ph-flat', tiny: true })}
    ${ph(['시술 결과', 800, 800], { seed: 'd-d', cls: 'ph-flat', tiny: true })}
    ${ph(['매장 내부', 800, 800], { seed: 'd-e', cls: 'ph-flat', tiny: true })}
    <button class="btn btn-ghost btn-sm more-btn" type="button" data-toast="사진 24장을 모두 볼 수 있어요">사진 24장 모두 보기</button>
  </div></div></section>`;

  const TABS = [
    { label: '시술 메뉴', go: 'SE0402' }, { label: '디자이너', go: 'SE0403' },
    { label: '리뷰', cnt: '1,284', go: 'SE0404' }, { label: '매장 정보', go: 'SE0405' },
  ];
  const stick = stickBar(
    `<div class="t-sub">대표 시술 최저가</div><b style="font-size:19px">${won(s.from)}~</b> <span class="t-sub">가장 빠른 예약 ${s.soon}</span>`,
    `${btn('시술 메뉴 보기', { cls: 'btn-ghost', href: 'SE0501' })}${btn('예약하기', { cls: 'btn-primary', href: 'RE0101' })}`);

  /* 탭별 상태 화면 */
  if (ctx.id === 'SE0402') {
    return {
      body: `${shopHead(s)}${tabs(TABS, 0)}
        ${banner('mut', 'ℹ️', '옵션이 있는 시술은 길이·디자인에 따라 금액이 더해져요. 시술을 고르면 다음 단계에서 고를 수 있어요.', { cls: 'mb4' })}
        ${menuAcc({ open: [0, 1, 2, 3], showHidden: true })}`,
      o: { state: '시술 메뉴 탭', hero: gal, stick },
    };
  }
  if (ctx.id === 'SE0403') return { body: `${shopHead(s)}${tabs(TABS, 1)}${dzList()}`, o: { state: '디자이너 탭', hero: gal, stick } };
  if (ctx.id === 'SE0404') return { body: `${shopHead(s)}${tabs(TABS, 2)}${rvTab({ on: 0 })}`, o: { state: '리뷰 탭', hero: gal, stick } };
  if (ctx.id === 'SE0405') return { body: `${shopHead(s)}${tabs(TABS, 3)}${infoTab()}`, o: { state: '매장 정보 탭', hero: gal, stick } };

  if (ctx.id === 'SE0406') {
    const stickOff = stickBar(
      '<b class="muted">9월 20일까지 예약을 받지 않아요</b>',
      `${btn('재개되면 알림 받기', { cls: 'btn-soft', attr: ' data-toast="재개되면 알려드릴게요", data-toast-kind="ok"' })}${btn('예약하기', { cls: 'btn-primary', off: true })}`);
    return {
      body: `${banner('danger', '🚧', `<b>9월 14일부터 20일까지 내부 공사로 예약을 받지 않아요.</b>
        <div class="t-sub mt1">9월 21일(월)부터 다시 예약을 받습니다. 이미 잡힌 예약은 매장에서 따로 연락드려요.</div>`,
        { cls: 'mb6', right: btn('재개 알림 신청', { cls: 'btn-soft', attr: 'data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' }) })}
        ${shopHead(s, { closed: true })}${tabs(TABS, 0)}
        <div class="is-readonly">${menuAcc()}</div>
        ${sec('그동안 이런 매장은 어때요?', `<div class="mag">${shopCards([S[8], S[11], S[6], S[1]])}</div>`, { cls: 'mt8' })}`,
      o: { state: '휴무·예약 중단', hero: gal, stick: stickOff },
    };
  }

  const body = `${shopHead(s)}${tabs(TABS, 0)}
    <div class="split-r">
      <div>
        ${sec('시술 메뉴', menuAcc())}
        ${sec('디자이너', dzList(), { more: 'SE0601', moreLabel: '전체 보기' })}
        ${sec('리뷰', rvTab())}
        ${sec('매장 정보', infoTab())}
      </div>
      <div class="sticky">
        ${card('예약하기', `
          <div class="t-sub">대표 시술 최저가</div><div class="price-lg pri">${won(s.from)}~</div>
          <div class="mt3">${badge(`가장 빠른 예약 ${s.soon}`, 'b-pri')}</div>
          <div class="hr"></div>
          ${kv([['영업', '11:00~21:00'], ['휴무', '매주 월요일'], ['전화', '02-000-0000']])}
          <div class="btns mt4">${btn('예약하기', { cls: 'btn-primary btn-block btn-lg', href: 'RE0101' })}</div>
          <p class="t-sub center mt3">예약금 20,000원 · 하루 전 18시까지 무료 취소</p>`)}
      </div>
    </div>`;
  return { body, o: { hero: gal, stick } };
}
export const SE0402 = SE0401, SE0403 = SE0401, SE0404 = SE0401, SE0405 = SE0401, SE0406 = SE0401;

/* ============================================================
   SE0501 — 시술 메뉴 상세
   ============================================================ */
export function SE0501(ctx) {
  const m = ALL_ITEMS.find((x) => x.id === 'M07');
  const gal = `<section><div class="wrap-full" style="padding:0"><div class="detail-gal">
    ${ph(['시술 대표', 1200, 1200], { seed: 'm-a', cls: 'ph-flat' })}
    ${ph(['시술 결과', 800, 800], { seed: 'm-b', cls: 'ph-flat', tiny: true })}
    ${ph(['시술 결과', 800, 800], { seed: 'm-c', cls: 'ph-flat', tiny: true })}
    ${ph(['시술 결과', 800, 800], { seed: 'm-d', cls: 'ph-flat', tiny: true })}
    ${ph(['시술 결과', 800, 800], { seed: 'm-e', cls: 'ph-flat', tiny: true })}
  </div></div></section>`;

  const head = `<div class="row-b wrap-row mb6"><div>
    <div class="badges mb2">${badge('컬러', 'b-line')}${badge('옵션 선택', 'b-pri')}</div>
    <h1 class="t-page">${m.nm}</h1>
    <p class="t-sub mt2">${S[0].nm} · 약 ${min2h(m.min)} · ${rateLine(4.9, 312)}</p></div>
    <div class="right"><div class="t-sub">기본 가격</div><div class="price-lg">${won(m.price)}</div></div></div>`;

  const optTable = table(
    [{ t: '옵션', w: '38%' }, '추가 금액', '추가 소요시간', ''],
    OPTIONS.flatMap((g) => [
      { cells: [`<b>${g.g}</b>`, '', '', ''], cls: 'is-now' },
      ...g.list.map(([nm, add, min]) => [nm, add ? `+${won(add)}` : '없음', min ? `+${min}분` : '없음',
        `<label class="check" style="padding:0"><input type="radio" name="${g.g}"${add === 0 ? ' checked' : ''}></label>`]),
    ]), { fix: true });

  const stick = stickBar(
    `<div class="t-sub">선택한 옵션 기준</div><b style="font-size:19px">180,000원 · 약 3시간 20분</b>`,
    btn('이 시술로 예약하기', { cls: 'btn-primary', href: 'RE0101' }));

  if (ctx.id === 'SE0502') {
    return {
      body: `${head}
        ${card('옵션별 가격', `${optTable}
          <div class="box-pri mt4"><div class="row-b wrap-row">
            <div><b>중단발 + 포인트 2개</b>를 고르면<div class="t-sub mt1">기본 165,000원 + 옵션 23,000원</div></div>
            <div class="right"><div class="t-sub">예상 결제 금액</div><div class="price-lg pri">188,000원</div>
              <div class="t-sub">약 3시간 35분</div></div></div></div>
          ${banner('mut', 'ℹ️', '디자이너 지명료는 여기에 포함되지 않아요. 다음 단계에서 디자이너를 고르면 더해집니다.', { cls: 'mt4' })}`)}`,
      o: { state: '옵션별 가격 표', hero: gal, stick },
    };
  }

  if (ctx.id === 'SE0503') {
    return {
      body: `${head}
        ${card('이 시술 리뷰', empty('✍️', '아직 이 시술 리뷰가 없어요',
          '첫 리뷰를 남기면 적립금 3,000원을 드려요. 사진을 함께 올리면 더 도움이 됩니다.',
          `${btn('매장 전체 리뷰 보기', { cls: 'btn-primary btn-lg', href: 'RV0201' })}`))}
        ${sec('비슷한 시술 리뷰', card('', REVIEWS.slice(0, 2).map((r) => review(r)).join('')), { cls: 'mt8' })}`,
      o: { state: '이 시술 리뷰 없음', hero: gal, stick },
    };
  }

  const body = `${head}
    <div class="split-r"><div>
      ${sec('시술 설명', card('', `<p>${m.desc} 탈색 1~2회를 거친 뒤 원하는 톤을 얹습니다. 모발 손상도에 따라 당일 진행이 어려울 수 있어, 시술 전에 모발 상태를 먼저 확인해요.</p>
        <div class="mt4">${kv([['소요 시간', `약 ${min2h(m.min)} (옵션에 따라 +40분)`], ['기본 가격', won(m.price)], ['추천 대상', '기존 염색 이력이 적은 모발'], ['유지 기간', '6~8주']])}</div>`))}
      ${sec('옵션별 추가 요금', optTable)}
      ${sec('시술 전후 사진', `<div class="g2">
        <div>${ph(['시술 전', 800, 800], { seed: 'b1' })}<p class="t-sub center mt2">시술 전</p></div>
        <div>${ph(['시술 후', 800, 800], { seed: 'a1' })}<p class="t-sub center mt2">시술 후 (중단발 · 애쉬 브라운)</p></div>
      </div>`)}
      ${sec('주의사항과 준비물', accordion([
        { q: '시술 전에 알아두세요', a: '· 시술 24시간 안에 다른 염색·펌을 했다면 진행이 어려워요.<br>· 두피에 상처가 있으면 시술을 미루는 게 좋아요.<br>· 셀프 염색 이력이 있으면 예상보다 시간이 더 걸릴 수 있어요.' },
        { q: '무엇을 준비해 가면 되나요', a: '· 원하는 톤이 담긴 사진 2~3장<br>· 목이 넓은 옷 (어깨에 색이 묻지 않게)<br>· 3시간 이상 걸리니 이어폰이나 읽을거리를 챙기세요.' },
        { q: '시술 후 관리', a: '· 48시간은 머리를 감지 마세요.<br>· 컬러 전용 샴푸를 쓰면 색이 오래갑니다.<br>· 2~3주 뒤 톤 보정을 권해드려요.' },
      ], 0))}
      ${sec('이 시술 리뷰', `${card('', rateSummary(RATE_DIST, 4.9, 312, RATE_ITEMS))}
        <div class="mt4">${card('', REVIEWS.slice(0, 3).map((r) => review(r)).join(''))}</div>
        <div class="center mt4">${btn('이 시술 리뷰 더 보기', { cls: 'btn-ghost', href: 'RV0201' })}</div>`)}
    </div>
    <div class="sticky">${card('예약 요약', `
      ${kv([['시술', m.nm], ['기본', won(m.price)], ['옵션', '길이 · 디자인 난이도'], ['소요', `약 ${min2h(m.min)}`]])}
      <div class="hr"></div>
      <div class="sum-row total"><span>예상 금액</span><span class="price">165,000원~</span></div>
      <div class="btns mt4">${btn('이 시술로 예약하기', { cls: 'btn-primary btn-block btn-lg', href: 'RE0101' })}
        ${btn('옵션별 가격 보기', { cls: 'btn-ghost btn-block', href: 'SE0502' })}</div>`)}</div></div>`;

  return { body, o: { hero: gal, stick } };
}
export const SE0502 = SE0501, SE0503 = SE0501;

/* ============================================================
   SE0601 — 디자이너 소개
   ============================================================ */
export function SE0601(ctx) {
  const d = DESIGNERS[0];
  const head = (o = {}) => `<div class="card mb8"><div class="card-bd">
    <div class="row gap6 wrap-row">
      ${phAva(132, d.id + 'big')}
      <div class="grow" style="min-width:240px">
        <div class="row-c wrap-row"><h1 class="t-page">${d.nm}</h1><span class="badge b-pri b-lg">${d.rank}</span>${o.off ? badge('휴직 중', 'b-mut') : ''}</div>
        <p class="t-sub mt2">${S[0].nm} · ${stars(d.rate)} <b>${d.rate.toFixed(1)}</b> (리뷰 ${d.rv})</p>
        <div class="badges mt3">${d.tags.map((t) => badge(t, 'b-pri')).join('')}</div>
        <p class="mt4">${d.career}. 모발 손상도를 먼저 보고 시술 범위를 정하는 편이라, 상담이 조금 긴 편이에요.
          밝은 컬러와 볼륨 매직을 가장 많이 합니다.</p>
      </div>
      <div class="none" style="min-width:180px">
        ${card('', `<div class="t-sub">지명료</div><div class="price">${won(d.fee)}</div>
          <div class="hr"></div><div class="t-sub mb2">예약 가능 요일</div>
          <div class="chips">${['월', '화', '수', '목', '금', '토', '일'].map((x) =>
            `<span class="chip chip-sm${d.days.includes(x) && !o.off ? ' on' : ' is-off'}">${x}</span>`).join('')}</div>`)}
      </div></div></div></div>`;

  const stick = stickBar(`<div class="t-sub">지명료</div><b style="font-size:19px">${won(d.fee)}</b> <span class="t-sub">이번 주 ${d.load}</span>`,
    btn('이 디자이너로 예약하기', { cls: 'btn-primary', href: 'RE0101' }));

  if (ctx.id === 'SE0602') {
    const modal = modalEl('',
      `${ph(['시술 결과', 1000, 1000], { seed: 'zoom' })}
       <div class="mt4"><b>발레아쥬 · 애쉬 브라운</b><p class="t-sub mt1">중단발 · 약 3시간 20분 · 김수현 원장</p></div>
       <p class="t-sub mt3">사진 저장과 재배포는 매장 동의 없이 할 수 없어요.</p>`,
      `${btn('‹ 이전', { cls: 'btn-ghost', attr: ' data-toast="이전 사진"' })}${btn('이 시술로 예약', { cls: 'btn-primary', href: 'RE0101' })}${btn('다음 ›', { cls: 'btn-ghost', attr: ' data-toast="다음 사진"' })}`,
      { lg: true });
    return { body: `${head()}${sec('대표 작업', `<div class="gal gal-3">${Array.from({ length: 9 }, (_, i) => ph(['시술 결과', 1000, 1000], { seed: 'w' + i })).join('')}</div>`)}`,
      o: { state: '포트폴리오 확대', stick, after: modal } };
  }

  if (ctx.id === 'SE0603') {
    const stickOff = stickBar('<b class="muted">10월 6일까지 지정 예약을 받지 않아요</b>',
      `${btn('복귀 알림 받기', { cls: 'btn-soft', attr: ' data-toast="복귀하면 알려드릴게요"' })}${btn('이 디자이너로 예약하기', { cls: 'btn-primary', off: true })}`);
    return {
      body: `${banner('warn', '🌿', '<b>김수현 원장은 10월 6일까지 휴직 중이에요.</b><div class="t-sub mt1">복귀 후 지정 예약을 다시 받습니다. 그 전에는 아래 디자이너를 지정하실 수 있어요.</div>',
        { cls: 'mb6', right: btn('복귀 알림 신청', { cls: 'btn-soft', attr: 'data-toast="복귀하시면 알려드릴게요" data-toast-kind="ok"' }) })}
        ${head({ off: true })}
        ${sec('대신 지정할 수 있는 디자이너', `<div class="col">${DESIGNERS.slice(1, 3).map((x) => dzCard(x, {
          right: `<div class="btns mt2">${btn('지정 예약', { cls: 'btn-soft btn-sm', href: 'RE0201' })}</div>`,
          extra: `<p class="t-sub mt2">겹치는 전문 시술: ${x.tags[0]}</p>`,
        })).join('')}</div>`)}`,
      o: { state: '휴직·예약 불가', stick: stickOff },
    };
  }

  const body = `${head()}
    ${sec('대표 작업', `<div class="gal gal-3">${Array.from({ length: 9 }, (_, i) =>
      `<a href="${link('SE0602')}">${ph(['시술 결과', 1000, 1000], { seed: 'w' + i })}</a>`).join('')}</div>`,
      { desc: '사진을 누르면 크게 볼 수 있어요' })}
    ${sec('이 디자이너 리뷰', `${card('', rateSummary(RATE_DIST, 4.9, 482, RATE_ITEMS))}
      <div class="mt4">${card('', REVIEWS.filter((r) => r.dz.startsWith('김수현')).map((r) => review(r)).join(''))}</div>`)}`;

  return { body, o: { stick } };
}
export const SE0602 = SE0601, SE0603 = SE0601;
