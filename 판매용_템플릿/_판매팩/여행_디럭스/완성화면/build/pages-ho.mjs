/* HO — 홈 (16 화면) */
import * as U from './ui.mjs';
import { PRODUCTS, CITIES, REVIEWS, TIPS, COURSES, PARTNERS, P, SEARCH_POPULAR, CAT_LABEL } from './data.mjs';

const { ph, phMap, pcard, pcards, sec, card, banner, btn, badge, chips, tabs, table, kv,
  won, num, off, link, empty, stars, rateLine, pageHd, stickBar, review, calendar, skCard, esc } = U;

const NY = PRODUCTS.filter((p) => p.city === '뉴욕');
const HOT = [P('P02'), P('P01'), P('P05'), P('P10'), P('P12'), P('P07'), P('P13'), P('P06')];

/* ===== HO01 홈 ===== */
export function HO0101(ctx) {
  const id = ctx.id;
  const logged = id === 'HO0102';
  const usd = id === 'HO0103';
  const issue = id === 'HO0104';

  const price = (p) => usd ? `$${Math.round(p.price / 1380)}` : won(p.price);
  const priceOld = (p) => usd ? `$${Math.round(p.was / 1380)}` : won(p.was);

  const hero = `<section class="hero"><div class="hero-in">
    <h1>어디로 떠나세요?</h1>
    <p class="sub">현지에서 바로 쓰는 투어·입장권·패스를 한 곳에서</p>
    <form class="searchbox">
      <div class="cell"><div class="lb">여행지</div><input type="text" placeholder="도시나 명소를 입력하세요" value="${issue ? '' : '뉴욕'}"></div>
      <div class="cell"><div class="lb">이용 날짜</div><input type="text" placeholder="날짜 선택" value="2026.08.03"></div>
      <div class="cell"><div class="lb">인원</div><input type="text" value="성인 2 · 아동 1"></div>
      <a class="btn btn-primary btn-lg" href="${link('HO0301')}">검색</a>
    </form>
    <div class="hero-stats">
      <div><div class="n">1,240만</div><div class="l">누적 이용자</div></div>
      <div><div class="n">32개국 180도시</div><div class="l">예약 가능 지역</div></div>
      <div><div class="n">4.8 / 5.0</div><div class="l">평균 만족도 (후기 86만건)</div></div>
    </div>
  </div></section>`;

  const topbar = issue ? `<div class="topbar"><div class="topbar-in">
    <span>⚠</span><b>칸쿤 지역 기상 악화</b>
    <span>8월 1~2일 해상 투어가 지연·취소될 수 있어요. 영향 여행지: 칸쿤 · 플라야델카르멘</span>
    <a href="${link('CS0402')}" style="text-decoration:underline;font-weight:600">공지 보기</a>
    <button class="x" type="button" data-close=".topbar" title="오늘 하루 보지 않기">✕</button>
  </div></div>` : '';

  /* 개인화 블록 (HO0102) */
  const personal = !logged ? '' : `
  ${sec('', `<div class="box-pri row-b wrap-row">
    <div><div class="t-card">김여행님, 뉴욕 여행이 4일 남았어요</div>
      <p class="t-sub mt1">8월 3일 첫 일정 · 자유의 여신상 크루즈 14:00 · 배터리파크 11번 부두</p></div>
    <div class="btns"><a class="btn btn-primary" href="${link('MY1001')}">내 여정 보기</a><a class="btn btn-ghost" href="${link('VC0101')}">바우처</a></div>
  </div>`)}
  ${sec('다가오는 예약', `<div class="g3 g1-m">
    ${[['D-4', '자유의 여신상 크루즈', '8월 3일 14:00', '확정'], ['D-5', '브루클린 야경 사진 투어', '8월 4일 18:30', '대기'], ['D-6', '3대 전망대 통합권', '8월 5일 자유 이용', '확정']]
      .map(([d, n, t, s]) => `<a class="card" href="${link('MY0501')}"><div class="card-bd">
        <div class="row-b"><span class="badge b-acc">${d}</span>${badge(s, s === '확정' ? 'b-ok' : 'b-warn')}</div>
        <div class="t-card mt3">${n}</div><p class="t-sub">${t}</p></div></a>`).join('')}
  </div>`, { more: 'MY0301', moreLabel: '예약 내역' })}
  ${sec('최근 본 여행지 이어보기', `<div class="carousel">${pcards([P('P04'), P('P02'), P('P03'), P('P01'), P('P06')], (p) => ({ faved: p.id === 'P04' }))}</div>`)}
  ${sec('', `<div class="g3 g1-m">
    ${card('보유 혜택', `<div class="row-b"><div><div class="price">3,500P</div><div class="t-sub">사용 가능 포인트</div></div>
      <div class="right"><div class="price">3장</div><div class="t-sub">사용 가능 쿠폰</div></div></div>
      <a class="btn btn-ghost btn-block mt4" href="${link('MY0901')}">쿠폰함 열기</a>`)}
    ${card('관심 도시 특가', `<p class="t-sub">찜한 <b>파리 몽생미셸 당일 투어</b> 가 20% 내려갔어요.</p>
      <div class="row-c mt3"><span class="price-old">198,000원</span><span class="price">158,000원</span></div>
      <a class="btn btn-primary btn-block mt4" href="${link('PR0801')}">찜한 상품 보기</a>`)}
    ${card('아직 안 쓴 후기 2건', `<p class="t-sub">루브르 박물관 · 아유타야 투어 후기를 남기면 상품당 500P를 드려요.</p>
      <a class="btn btn-ghost btn-block mt4" href="${link('MY1101')}">후기 쓰러 가기</a>`)}
  </div>`)}`;

  /* 통화·언어 패널 (HO0103) */
  const fx = !usd ? '' : sec('', `<div class="card"><div class="card-hd">
      <h3 class="t-card">통화 · 언어 설정</h3><span class="t-sub">환율 기준 2026.07.30 09:00 (KST) · 1 USD = 1,380원</span></div>
    <div class="card-bd"><div class="g2 g1-m">
      <div><div class="label">표시 통화</div>
        <div class="chips">${['KRW 원', 'USD 달러', 'EUR 유로', 'JPY 엔', 'THB 바트'].map((t, i) => U.chip(t, i === 1)).join('')}</div>
        <p class="hint">선택하면 사이트 전체 가격이 즉시 다시 계산됩니다. 실제 청구액은 카드사 환율에 따라 달라질 수 있어요.</p></div>
      <div><div class="label">표시 언어</div>
        <div class="chips">${['한국어', 'English', '日本語', '中文'].map((t, i) => U.chip(t, i === 0)).join('')}</div>
        <p class="hint">현지 이용 안내는 선택한 언어와 현지어가 함께 표시됩니다.</p></div>
    </div>
    <div class="btns mt6"><button class="btn btn-primary" type="button" data-toast="통화·언어 설정을 저장했어요" data-toast-kind="ok">설정 저장</button>
      <button class="btn btn-ghost" type="button" data-toast="처음 상태로 되돌렸어요">기본값으로</button></div></div></div>`);

  const body = `
  ${personal}
  ${fx}
  ${sec('인기 여행지', `<div class="g6">${CITIES.slice(0, 6).map((c) => `<a href="${link('HO0201')}" class="center">
      ${ph(c.en, 'ph-circle', '여행지', '400×400')}<div class="t-card mt3" style="font-size:15px">${c.name}</div><div class="t-sub">${c.cnt}개 상품</div></a>`).join('')}</div>`,
    { more: 'HO0201', moreLabel: '여행지 전체' })}

  ${sec('이번 주 인기 상품', `<div class="g4">${HOT.map((p) => pcard(p, {
    faved: logged && p.id === 'P02',
    note: usd ? `<div class="t-sub">${priceOld(p)} → <b class="pri">${price(p)}</b> 기준 표시</div>` : '',
  })).join('')}</div>`, { more: 'PR0101' })}

  ${sec('특가 · 마감임박', `<div class="carousel">${PRODUCTS.filter((p) => p.left <= 8).concat([P('P08'), P('P12')]).map((p) => pcard(p, {
    ribbon: badge(`마감임박 ${p.left}자리`, 'b-danger'),
    note: `<div class="t-sub danger strong">남은 좌석 ${p.left}자리</div>`,
  })).join('')}</div>`, { desc: '남은 좌석이 적은 순서로 보여드려요. 좌석은 실시간으로 바뀝니다.' })}

  ${sec('', `<div class="pass-banner">
    <div><div class="badge b-acc mb2">패스 상품</div>
      <h3 class="t-sec" style="color:#fff">주요 명소 최대 70% 할인</h3>
      <p class="mt2" style="color:rgba(255,255,255,.9)">전망대 · 미술관 · 크루즈를 한 장으로. 도시별 패스로 개별 구매보다 크게 절약하세요.</p></div>
    <a class="btn btn-accent btn-lg" href="${link('PR0401')}">패스 보기</a></div>`)}

  ${sec('테마별 추천', `
    ${tabs([{ label: '투어', pane: 'tour' }, { label: '입장권', pane: 'ticket' }, { label: '교통', pane: 'traffic' }], 0, { pill: true })}
    <div data-pane-body="tour"><div class="g4">${pcards(PRODUCTS.filter((p) => p.cat === 'tour').slice(0, 4))}</div></div>
    <div data-pane-body="ticket" hidden><div class="g4">${pcards(PRODUCTS.filter((p) => p.cat === 'ticket').slice(0, 4))}</div></div>
    <div data-pane-body="traffic" hidden><div class="g4">${pcards(PRODUCTS.filter((p) => p.cat === 'traffic' || p.cat === 'pass').slice(0, 4))}</div></div>`)}

  ${sec('실제 다녀온 여행자 후기', `<div class="carousel carousel-lg">${REVIEWS.slice(0, 5).map((r) => {
    const p = P(r.prod);
    return `<a class="card" href="${link('PR0701')}"><div class="card-bd">
      ${ph(r.who, 'ph-43', '후기 사진', '1200×900')}
      <div class="row-c mt3">${stars(r.rate)}<span class="t-sub">${r.date} · ${r.with}</span></div>
      <p class="mt2" style="font-size:14px;line-height:1.6">${esc(r.txt.slice(0, 62))}…</p>
      <p class="t-sub mt2">${esc(p.name)}</p>
      <p class="t-sub">${esc(r.who)}</p></div></a>`;
  }).join('')}</div>`, { more: 'PR0701' })}

  ${sec('현지 라운지 · 고객센터', `<div class="card"><div class="card-bd"><div class="g2 g1-m" style="gap:24px">
    <div>${phMap('ph-map', [{ x: 42, y: 46, n: '📍', name: '뉴욕 라운지' }], '32번가 코리아타운 일대')}</div>
    <div><h3 class="t-card">뉴욕 라운지</h3>
      ${kv([['주소', '25 W 32nd St 3F, New York, NY 10001'], ['운영시간', '매일 09:00 ~ 20:00 (현지 시각)'], ['전화', '+1 917-000-0000'], ['서비스', '짐 보관 · 유심 수령 · 바우처 인쇄 · 한국어 상담']])}
      <div class="btns mt4"><button class="btn btn-primary" type="button" data-toast="지도 앱으로 길찾기를 전달했어요">길찾기</button>
        <a class="btn btn-ghost" href="${link('CS0201')}">문의하기</a></div>
      <p class="hint">현지에서 급한 일이 생기면 24시간 긴급 회선으로 연결됩니다.</p></div>
  </div></div></div>`)}

  ${sec('여행 팁', `<div class="g4">${TIPS.map((t) => `<a class="card" href="${link('CS0101')}">
    ${ph(t.title, 'ph-16', '기획전 배너', '1600×900')}<div class="card-bd"><span class="badge b-pri">${t.tag}</span>
    <div class="t-card mt2" style="font-size:16px">${t.title}</div><p class="t-sub mt2">${t.read} 분량</p></div></a>`).join('')}</div>`)}

  ${sec('', `<div class="g2 g1-m">
    ${card('앱으로 더 편하게', `<p class="t-sub">앱에서는 바우처를 오프라인으로 저장해 인터넷 없이도 열 수 있어요. 첫 앱 예약 시 5% 추가 할인.</p>
      <div class="btns mt4"><span class="btn btn-ghost">App Store</span><span class="btn btn-ghost">Google Play</span></div>`)}
    ${card('카카오톡 채널', `<p class="t-sub">예약 확정 · 출발 알림을 카카오톡으로 받아보세요. 채널 추가 시 3,000원 쿠폰을 드립니다.</p>
      <div class="btns mt4"><button class="btn btn-accent" type="button" data-toast="카카오톡 채널이 추가되었어요" data-toast-kind="ok">채널 추가하기</button></div>`)}
  </div>`)}`;

  return {
    body,
    o: {
      hero, topbar, logged, cart: 2, noti: logged ? 3 : 0,
      state: id === 'HO0102' ? '로그인 상태(개인화) — 상단에 개인화 블록이 추가된 홈'
        : id === 'HO0103' ? '통화·언어 전환 — USD 표시로 전체 가격 재계산'
          : id === 'HO0104' ? '현지 이슈 배너 — 상단 고정 공지 노출' : '',
    },
  };
}

/* ===== HO02 여행지 홈 ===== */
export function HO0201(ctx) {
  const id = ctx.id;
  const filtered = id === 'HO0202';
  const expand = id === 'HO0203';
  const city = CITIES[0];
  const list = filtered ? NY.filter((p) => p.cat === 'tour' || p.cat === 'ticket') : NY.concat([P('P05'), P('P12'), P('P10'), P('P06')]).slice(0, 8);

  const hero = `<section class="city-hero" style="background:linear-gradient(135deg,#24406F,#3E6AB0)"><div class="in">
    <div class="badges mb2">${badge(city.country, 'b-line')}${badge(`상품 ${city.cnt}개`, 'b-line')}</div>
    <h1 class="t-page" style="color:#fff">${city.name}</h1>
    <p class="mt2" style="color:rgba(255,255,255,.9)">전망대에서 크루즈까지, 처음 가도 헤매지 않는 뉴욕의 정석</p>
  </div></section>`;

  const catChips = `<div class="chips mb4">
    ${U.chip('전체', !filtered)}${U.chip('투어', filtered)}${U.chip('입장권', filtered)}${U.chip('교통', false)}${U.chip('패스', false)}
    ${filtered ? `<button class="btn btn-link" type="button" data-toast="조건을 모두 지웠어요">전체로 되돌리기</button>` : ''}</div>`;

  const info = card('여행 정보', expand ? `
    <div class="g2 g1-m">
      <div>${kv([['현지 시각', '<b>08:12</b> (2026.07.30) · 한국보다 13시간 느려요'],
    ['현재 날씨', `${city.wx} ${city.temp} · 체감 26°`],
    ['환율', '1 USD = 1,380원 (09:00 기준)'],
    ['팁 문화', '식당 15~20%, 택시 10~15%, 호텔 하우스키핑 2~5달러']])}</div>
      <div><div class="label">주간 날씨 예보</div>
        <div class="g6" style="gap:8px">${[['수', '☀', '24°'], ['목', '☀', '26°'], ['금', '⛅', '25°'], ['토', '🌧', '21°'], ['일', '⛅', '23°'], ['월', '☀', '27°']]
      .map(([d, i, t]) => `<div class="box center" style="padding:12px 4px"><div class="t-sub">${d}</div><div style="font-size:20px">${i}</div><div class="strong">${t}</div></div>`).join('')}</div>
        <div class="mt4"><div class="label">교통 요령</div>
          <p class="t-sub">지하철은 옴니(OMNY) 태그로 카드·휴대폰을 그대로 찍으면 됩니다. 하루 12회 이상 타면 자동으로 주간 상한이 적용돼요.</p></div>
        <div class="btns mt4"><button class="btn btn-ghost btn-sm" type="button" data-toast="비자·ESTA 안내를 열어요">비자·ESTA 안내</button><button class="btn btn-ghost btn-sm" type="button" data-toast="입국 신고 안내를 열어요">입국 신고 안내</button></div>
      </div>
    </div>` : `<div class="g3 g1-m">
      <div class="box"><div class="t-sub">현재 날씨</div><div class="t-card mt1">${city.wx} ${city.temp}</div></div>
      <div class="box"><div class="t-sub">시차</div><div class="t-card mt1">${city.tz}</div></div>
      <div class="box"><div class="t-sub">팁 문화</div><div class="t-card mt1">식당 15~20%</div></div>
    </div>
    <button class="btn btn-ghost btn-block mt4" type="button" data-go="${link('HO0203')}" onclick="location.href='HO0203.html'">여행 정보 자세히 보기</button>`,
    { aside: expand ? `<span class="t-sub">현지 08:12 기준</span>` : '' });

  const body = `
  ${catChips}
  ${filtered ? banner('pri', 'ℹ', `<b>투어 · 입장권</b> 조건으로 <b>${list.length}개</b> 상품을 보여드려요. 칩을 다시 누르면 개별 해제됩니다.`, { cls: 'mb4' }) : ''}
  ${sec(`${city.name} 인기 상품 <span class="muted" style="font-size:15px;font-weight:400">${list.length}개</span>`,
    `<div class="g4">${pcards(list)}</div>`, { more: 'PR0101' })}

  ${sec('', `<div class="box-pri">
    <div class="row-b wrap-row mb4"><div><div class="badge b-acc mb2">뉴욕 전용 패스</div>
      <h3 class="t-sec">뉴욕 시티 익스플로러 패스</h3>
      <p class="t-sub mt1">아래 8개 명소를 한 장으로 · 개별 구매 대비 <b class="danger">68% 절약</b></p></div>
      <a class="btn btn-primary" href="${link('PR0401')}">패스 상세</a></div>
    <div class="g4">${['엠파이어스테이트 전망대', '탑오브더락', '서밋 원 밴더빌트', '자유의 여신상 크루즈', 'MoMA', '9/11 메모리얼', '인트레피드 박물관', '뉴욕 식물원']
      .map((s) => `<div class="row-c"><span class="pri">✓</span><span style="font-size:14px">${s}</span></div>`).join('')}</div>
  </div>`)}

  ${sec('추천 일정', `<div class="g3 g1-m">${COURSES.map((c) => `<a class="card" href="${link('PR0101')}">
    ${ph(c.name, 'ph-16', '여행지 배너', '1600×900')}<div class="card-bd"><span class="badge b-pri">${c.days}일 코스</span>
    <div class="t-card mt2">${c.name}</div><p class="t-sub mt1">${c.desc}</p>
    <p class="mt3"><span class="t-sub">상품 ${c.cnt}개 묶음</span><br><b class="price" style="font-size:16px">${won(c.price)}</b></p></div></a>`).join('')}</div>`)}

  ${sec('현지 쿠폰 제휴처', table(
    [{ t: '가게', w: '34%' }, '지역', '혜택', { t: '', w: '96px' }],
    PARTNERS.map((x) => [`<b>${x.shop}</b>`, `<span class="muted">${x.area}</span>`, x.benefit,
      `<button class="btn btn-ghost btn-sm" type="button" data-toast="쿠폰을 받았어요. 현지에서 화면을 보여주세요" data-toast-kind="ok">받기</button>`])),
  { desc: '현지 라운지에서 발급받은 쿠폰은 매장에서 화면 제시로 사용합니다.' })}

  ${sec('여행 정보', info)}

  ${sec(`${city.name} 후기`, `<div class="g2 g1-m">${REVIEWS.slice(0, 6).map((r) => `<div class="card"><div class="card-bd">${review(r)}</div></div>`).join('')}</div>`, { more: 'PR0701' })}`;

  return {
    body, o: {
      hero, cart: 2,
      state: filtered ? '카테고리 필터 적용 — 투어·입장권 칩 선택, 결과 수 갱신'
        : expand ? '여행 정보 카드 확장 — 현지 시각·주간 예보·입국 안내' : '',
    },
  };
}

/* ===== HO03 검색 결과 ===== */
export function HO0301(ctx) {
  const id = ctx.id;
  const map = id === 'HO0302';
  const filtered = id === 'HO0303';
  const loading = id === 'HO0304';
  const q = '뉴욕';
  const total = filtered ? 18 : 42;
  const list = filtered ? NY.filter((p) => p.rating >= 4.7 && p.price <= 130000) : PRODUCTS.slice(0, 8);

  const filterPanel = `<aside class="card filter-panel sticky"><div class="card-hd"><h3 class="t-card">필터</h3>
    ${filtered ? '<button class="btn btn-link" type="button" data-toast="고른 조건을 모두 지웠어요">전체 초기화</button>' : ''}</div>
    <div class="card-bd" style="padding-top:0">
      <div class="fg"><h4>여행지</h4>
        ${['뉴욕 (42)', 'LA (18)', '보스턴 (7)', '워싱턴 (5)'].map((t, i) => `<label class="check"><input type="checkbox" ${i === 0 ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>
      <div class="fg"><h4>카테고리</h4>
        ${Object.values(CAT_LABEL).map((t, i) => `<label class="check"><input type="checkbox" ${filtered && i < 2 ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>
      <div class="fg"><h4>가격대</h4>
        <input class="range" type="range" min="0" max="500000" value="${filtered ? 130000 : 500000}" step="10000">
        <div class="row-b t-sub"><span>0원</span><span><b class="pri">${filtered ? '130,000원' : '500,000원+'}</b></span></div></div>
      <div class="fg"><h4>평점</h4>
        ${['4.5 이상', '4.0 이상', '3.5 이상'].map((t, i) => `<label class="check"><input type="radio" name="rt" ${filtered && i === 0 ? 'checked' : ''}><span>${stars(5)} ${t}</span></label>`).join('')}</div>
      <div class="fg"><h4>소요시간</h4>
        ${['3시간 이하', '3~6시간', '6시간 이상', '자유 이용'].map((t) => `<label class="check"><input type="checkbox"><span>${t}</span></label>`).join('')}</div>
      <div class="fg"><h4>기타</h4>
        <label class="check"><input type="checkbox" checked><span>한국어 가이드</span></label>
        <label class="check"><input type="checkbox"><span>즉시확정만</span></label>
        <label class="check"><input type="checkbox"><span>호텔 픽업 포함</span></label></div>
    </div></aside>`;

  const sortBar = `<div class="row-b wrap-row mb4">
    <div><span class="t-card">'${q}' 검색 결과</span> <span class="muted">총 <b class="pri">${total}개</b> 상품</span></div>
    <div class="row-c">
      <select class="select" style="width:auto"><option>인기순</option><option>낮은 가격순</option><option>평점순</option></select>
      ${map ? `<a class="btn btn-primary btn-sm" href="${link('HO0301')}">목록으로 보기</a>` : `<a class="btn btn-ghost btn-sm" href="${link('HO0302')}">🗺 지도로 보기</a>`}
    </div></div>`;

  const chipRow = filtered ? `<div class="mb4">
    <div class="chips mb2">${U.chip('뉴욕', true)}${U.chip('투어', true)}${U.chip('입장권', true)}${U.chip('13만원 이하', true)}${U.chip('평점 4.5 이상', true)}${U.chip('한국어 가이드', true)}
      <button class="btn btn-link" type="button" data-toast="고른 조건을 모두 지웠어요">전체 초기화</button></div>
    <p class="t-sub">뉴욕에서 <b>투어·입장권</b> 중 <b>13만원 이하</b>, <b>평점 4.5 이상</b>, <b>한국어 가이드</b> 조건으로 ${total}개를 찾았어요.</p></div>` : '';

  let resultArea;
  if (loading) {
    resultArea = `<div class="g3 g1-m">${Array.from({ length: 6 }, skCard).join('')}</div>
      <div class="center mt8"><div class="spinner"></div>
      <p class="t-sub mt3">상품을 불러오는 중이에요. 잠시만 기다려주세요.</p>
      <p class="t-sub">10초 이상 걸리면 네트워크 상태를 확인해주세요.</p></div>`;
  } else if (map) {
    resultArea = `<div class="card mb4"><div class="card-bd" style="padding:0">
        ${phMap('ph-map', [
      { x: 30, y: 38, n: 1, name: '배터리파크 11번 부두' }, { x: 52, y: 26, n: 2, name: '엠파이어스테이트 빌딩', on: true },
      { x: 66, y: 52, n: 3, name: '브루클린브리지역' }, { x: 44, y: 64, n: 4, name: '32번가 한인타운' },
      { x: 74, y: 30, n: 5, name: '록펠러센터' }], '미팅 장소 5곳 — 핀을 누르면 상품이 보여요')}
      </div>
      <div class="card-ft row-b wrap-row"><span class="t-sub">지도를 움직이면 이 지역의 상품을 다시 찾습니다.</span>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="이 지역에서 다시 검색했어요">이 지역 재검색</button></div></div>
      <div data-map-preview class="mb4">${U.prodSummary(P('P02'), {
      date: '<span data-map-name>엠파이어스테이트 빌딩</span> · 미팅 장소',
      right: `<div class="price">${won(P('P02').price)}</div><a class="btn btn-primary btn-sm mt2" href="${link('PR0201')}">상세 보기</a>`,
    })}</div>
      <div class="g3 g1-m">${pcards(list.slice(0, 3))}</div>`;
  } else {
    resultArea = `<div class="g3 g1-m">${pcards(list)}</div>
      ${filtered ? '' : `<div class="center mt8"><div class="spinner"></div><p class="t-sub mt3">스크롤하면 상품을 더 불러옵니다</p></div>`}`;
  }

  const body = `${pageHd('상품 검색', '여행지 · 카테고리 · 가격대로 원하는 상품을 좁혀보세요')}
    <div class="split">${filterPanel}<div>${sortBar}${chipRow}${resultArea}</div></div>
    <p class="t-sub mt6">모바일에서는 [필터] 버튼을 누르면 하단 시트로 열립니다.</p>`;

  return {
    body, o: {
      q, cart: 2,
      state: map ? '지도 보기 전환 — 미팅 장소 핀과 미리보기 카드'
        : filtered ? '필터 적용 상태 — 선택 칩 노출, 결과 수 42 → 18개'
          : loading ? '로딩(스켈레톤) — 검색어·필터 유지, 추가 로딩 스피너' : '',
    },
  };
}

/* ===== HO04 검색 결과 없음 ===== */
export function HO0401(ctx) {
  const typo = ctx.id === 'HO0402';
  const q = typo ? '뉴육 전망대' : '뉴욕 야간 열기구';

  const body = `${pageHd('검색 결과', `'${q}' 로 검색했어요`)}
  ${typo ? `<div class="card mb6"><div class="card-bd center">
      <p class="t-sub">혹시 이걸 찾으셨나요?</p>
      <p class="t-sec mt2">"<a class="pri" href="${link('HO0301')}" style="text-decoration:underline">뉴욕 전망대</a>" <span class="muted" style="font-size:15px;font-weight:400">검색 결과 42개</span></p>
      <div class="btns mt4" style="justify-content:center">
        <a class="btn btn-primary" href="${link('HO0301')}">뉴욕 전망대로 다시 검색</a>
        <button class="btn btn-ghost" type="button" data-toast="오타를 고치지 않고 그대로 찾아요">'${q}' 그대로 검색</button></div>
    </div></div>` : ''}

  <div class="card">${empty('🔍', `'${q}'에 맞는 상품을 찾지 못했어요`,
    '검색어의 띄어쓰기를 확인하거나, 필터를 조금 넓혀보세요.',
    `<a class="btn btn-primary" href="${link('HO0301')}">필터 초기화</a><a class="btn btn-ghost" href="${link('PR0101')}">전체 상품 보기</a>`)}</div>

  ${typo ? sec('최근 검색어', `<div class="chips">${['뉴욕 전망대', '자유의 여신상', '우드베리 아웃렛', '브루클린 야경'].map((t) => U.chip(t, false, `data-go="${link('HO0301')}"`)).join('')}
    <button class="btn btn-link" type="button" data-toast="최근 검색어를 모두 지웠어요">전체 삭제</button></div>`) : ''}

  ${sec('이런 상품은 어때요?', `<div class="g4">${pcards([P('P02'), P('P01'), P('P04'), P('P03')])}</div>`)}
  ${sec('인기 검색어', `<div class="chips">${SEARCH_POPULAR.map((t, i) => U.chip(`${i + 1}. ${t}`, false, `data-go="${link('HO0301')}"`)).join('')}</div>`)}`;

  return { body, o: { q, cart: 2, state: typo ? '오타 추천 — 유사 검색어 제안과 최근 검색어' : '' } };
}

/* ===== HO05 테마 기획전 ===== */
export function HO0501(ctx) {
  const id = ctx.id;
  const gotCoupon = id === 'HO0502';
  const ended = id === 'HO0503';
  const list = [P('P04'), P('P02'), P('P08'), P('P12'), P('P10'), P('P06'), P('P13'), P('P01')];
  const evPrice = (p) => Math.round(p.price * 0.78 / 1000) * 1000;

  const hero = `<section class="city-hero" style="${ended ? 'filter:grayscale(.85);opacity:.85;' : ''}background:linear-gradient(135deg,#26314F,#3E6AB0)">
    <div class="in">
      <div class="badges mb2">${badge(ended ? '종료된 기획전' : '진행 중', ended ? 'b-mut' : 'b-acc')}${badge('2026.07.18 ~ 08.01', 'b-line')}</div>
      <h1 class="t-page" style="color:#fff">여름 야경 특집</h1>
      <p class="mt2" style="color:rgba(255,255,255,.92)">해가 길어진 도시의 밤, 야경 투어 62개 상품 <b>최대 35% 할인</b></p>
    </div></section>`;

  const countdown = ended
    ? banner('mut', '⏱', `<b>2026년 8월 1일에 종료된 기획전이에요.</b> 기획전가는 해제되어 정상가로 표시됩니다.`, { cls: 'mb6' })
    : banner('danger', '⏱', `<b>종료까지 3일 12시간</b> 남았어요 · 2026년 8월 1일 23:59 (KST) 마감`, {
      cls: 'mb6', right: `<span class="t-sub">쿠폰은 기획전 기간에만 받을 수 있어요</span>`,
    });

  const nextTeaser = card('다음 기획전 예고', `<div class="row-b wrap-row">
    <div><div class="t-card">가을 미식 기행 — 9월 5일 오픈</div>
      <p class="t-sub mt1">파리·로마·오사카 미식 투어를 최대 30% 할인 예정이에요.</p></div>
    <button class="btn btn-primary" type="button" data-toast="오픈하면 알려드릴게요" data-toast-kind="ok">오픈 알림 신청</button></div>`);

  const body = `
  ${countdown}
  ${tabs(['가족여행', '미식', '야경', '액티비티', '근교 당일치기'], 2, { pill: true })}

  ${sec('', `<div class="box">
    <p>도시의 밤은 낮과 완전히 다른 얼굴을 보여줍니다. 이번 기획전은 <b>해가 지는 시각에 맞춰 동선을 짠 투어</b>만 모았어요.</p>
    <p class="t-sub mt3">💬 큐레이터 한 줄 — "8월 초는 일몰이 늦고 습도가 낮아 현지 밤 풍경이 가장 예쁜 시기예요." (뉴욕 담당 최지훈)</p>
  </div>`)}

  ${ended ? '' : sec('', `<div class="g2 g1-m">
    ${['15% 기획전 쿠폰|80,000원 이상 결제 시|기획전 대상 62개 상품', '5,000원 야경 쿠폰|50,000원 이상 결제 시|야경 카테고리 전용']
      .map((s, i) => { const [v, min, tg] = s.split('|'); return `<div class="coupon">
        <div class="amt"><div class="v">${v.split(' ')[0]}</div><div class="t-sub">할인</div></div>
        <div class="bd row-b wrap-row"><div><div class="t-card" style="font-size:16px">${v}</div>
          <p class="t-sub mt1">${min}<br>${tg}</p></div>
          <button class="btn ${gotCoupon && i === 0 ? 'btn-ghost is-off' : 'btn-primary'}" type="button" data-getcoupon>${gotCoupon && i === 0 ? '받음' : '받기'}</button></div></div>`; }).join('')}
  </div>
  ${gotCoupon ? banner('ok', '✓', `<b>15% 기획전 쿠폰을 받았어요.</b> 결제 화면에서 적용할 수 있어요. 쿠폰은 계정당 1회만 받을 수 있습니다.`, {
      cls: 'mt4', right: `<a class="btn btn-ghost btn-sm" href="${link('MY0901')}">쿠폰함</a>`,
    }) : `<p class="hint mt3">쿠폰은 계정당 1회만 받을 수 있어요. 로그인하지 않으면 받기 단계에서 로그인 화면으로 이동합니다.</p>`}`)}

  ${sec(`기획전 대상 상품 <span class="muted" style="font-size:15px;font-weight:400">62개</span>`, `
    <div class="row-b wrap-row mb4"><span class="t-sub">${ended ? '기획전가가 해제되어 정상가로 표시됩니다' : '기획전가는 8월 1일까지만 적용돼요'}</span>
      <select class="select" style="width:auto"><option>추천순</option><option>낮은 가격순</option><option>할인율순</option></select></div>
    <div class="g4">${list.map((p) => pcard(p, {
    ribbon: ended ? '' : badge('기획전가', 'b-danger'),
    dim: ended,
    note: ended ? '<div class="t-sub">기획전 종료 · 정상가</div>'
      : `<div class="t-sub"><s class="muted">${won(p.price)}</s> → <b class="danger">${won(evPrice(p))}</b> 기획전가</div>`,
  })).join('')}</div>`)}

  ${sec('여행지별로 보기', `<div class="col">${[['뉴욕', 18], ['파리', 14], ['방콕', 11], ['오사카', 9], ['칸쿤', 10]].map(([c, n], i) => `
    <div class="acc-item card" style="padding:0 20px">
      <button class="acc-q" type="button">${c} <span class="muted" style="font-weight:400">${n}개 상품</span><span class="mk">＋</span></button>
      <div class="acc-a"><div class="g3 g1-m mb4">${pcards(list.slice(i, i + 3), { noHeart: true })}</div></div>
    </div>`).join('')}</div>`)}

  ${sec('함께 보면 좋은 기획전', `<div class="g3 g1-m">${[['가족과 함께 여름방학', '~08.20', '최대 28%'], ['근교 당일치기 모음', '~08.10', '최대 22%'], ['미식 도시 산책', '09.05 오픈', '예정']]
    .map(([t, d, r]) => `<a class="card" href="${link('HO0501')}">${ph(t, 'ph-16', '기획전 배너', '1600×900')}<div class="card-bd">
      <div class="row-b"><span class="badge b-pri">${d}</span><b class="danger">${r}</b></div>
      <div class="t-card mt2">${t}</div></div></a>`).join('')}</div>`)}

  ${ended ? sec('', nextTeaser) + sec('상시 할인 중인 야경 상품', `<div class="g4">${pcards([P('P04'), P('P06'), P('P08'), P('P13')])}</div>`) : ''}`;

  return {
    body, o: {
      hero, cart: 2,
      after: gotCoupon ? U.toastEl('쿠폰을 받았어요. 결제할 때 적용하세요', '쿠폰함 보기', 'ok') : '',
      state: gotCoupon ? '기획전 쿠폰 받기 — 버튼 상태 전환, 중복 수령 차단'
        : ended ? '기획전 종료 — 배너 흐림, 기획전가 해제, 다음 기획전 예고' : '',
    },
  };
}
