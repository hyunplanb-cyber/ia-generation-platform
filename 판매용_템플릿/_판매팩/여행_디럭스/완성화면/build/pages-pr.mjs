/* PR — 상품 (31 화면) */
import * as U from './ui.mjs';
import { PRODUCTS, REVIEWS, RATE_DIST, PASS, P, CAT_LABEL, REFUND_RULES } from './data.mjs';

const { ph, phMap, pcard, pcards, sec, card, banner, btn, badge, chips, tabs, table, kv, sumRows,
  won, num, off, link, empty, stars, rateLine, pageHd, stickBar, review, calendar, accordion,
  rateSummary, prodSummary, toastEl, modalEl, progress, esc } = U;

const MAIN = P('P01');

/* ===== PR01 상품 목록 ===== */
export function PR0101(ctx) {
  const id = ctx.id;
  const instantOnly = id === 'PR0102';
  const faved = id === 'PR0103';
  const soldout = id === 'PR0104';
  let list = PRODUCTS.slice();
  if (instantOnly) list = list.filter((p) => p.instant);
  const total = instantOnly ? list.length : 42;

  const body = `${pageHd('투어 · 티켓', '현지에서 바로 쓰는 상품을 카테고리별로 모았어요')}
  ${tabs(['전체', '투어', '입장권', '교통', '패스'], 0)}
  <div class="row-b wrap-row mb4">
    <div class="chips">
      ${U.chip('가격대', false)}${U.chip('평점 4.5 이상', false)}${U.chip('소요시간', false)}${U.chip('한국어 가이드', false)}${U.chip('즉시확정', instantOnly)}
    </div>
    <select class="select" style="width:auto"><option>인기순</option><option>낮은 가격순</option><option>평점순</option><option>후기 많은순</option></select>
  </div>
  <p class="t-sub mb4">총 <b class="pri">${total}개</b> 상품${instantOnly ? ' · 즉시확정 조건 적용' : ''}</p>

  ${instantOnly ? banner('pri', 'ℹ', `<b>즉시확정 상품만</b> 보고 있어요. 현지 확인이 필요한 <b>확정 대기 상품 9개</b>는 목록에서 제외했습니다. 정렬 조건(인기순)은 그대로 유지됩니다.`,
    { cls: 'mb4', right: `<a class="btn btn-ghost btn-sm" href="${link('PR0101')}">필터 해제</a>` }) : ''}

  ${soldout ? banner('warn', '⚠', `일부 상품의 <b>잔여 좌석이 모두 소진</b>되었어요. 마감된 카드는 흐리게 표시하고 다음 예약 가능일을 함께 보여드립니다.`, { cls: 'mb4' }) : ''}

  <div class="g3 g1-m">${list.map((p, i) => {
    const isOut = soldout && (i === 1 || i === 4);
    return pcard(p, {
      faved: faved && i === 0,
      dim: isOut,
      soldout: isOut,
      ribbon: isOut ? badge('마감', 'b-mut') : (p.left <= 5 ? badge(`마감임박 ${p.left}자리`, 'b-danger') : ''),
      href: isOut ? 'PR0601' : 'PR0201',
      note: isOut ? `<div class="t-sub">가장 빠른 예약 가능일 <b>9월 3일</b><br><span class="pri strong">자리 알림 신청 ›</span></div>`
        : (p.left <= 5 ? `<div class="t-sub danger strong">마감임박 ${p.left}자리</div>` : ''),
    });
  }).join('')}</div>

  ${soldout ? sec('비슷한 상품은 어때요?', `<div class="g4">${pcards([P('P02'), P('P06'), P('P10'), P('P12')], { noHeart: true })}</div>`, { desc: '마감된 상품과 일정·가격대가 비슷한 상품이에요.' }) : ''}

  <div class="pager"><span>‹</span><span class="on">1</span><a href="#">2</a><a href="#">3</a><a href="#">4</a><a href="#">5</a><a href="#">›</a></div>
  <p class="t-sub center mt4">모바일에서는 2열 그리드로 표시됩니다.</p>`;

  return {
    body, o: {
      cart: 2,
      after: faved ? toastEl('찜한 상품에 담았어요', '찜 목록 보기', 'ok') : '',
      state: instantOnly ? '즉시확정 필터 — 확정 대기 상품 제외, 결과 수 갱신'
        : faved ? '찜하기 토글 — 하트 활성화와 완료 토스트'
          : soldout ? '잔여 좌석 소진 — 카드 흐림·마감 배지·자리 알림' : '',
    },
  };
}

/* ===== PR02 상품 상세 ===== */
export function PR0201(ctx) {
  const id = ctx.id;
  const p = MAIN;
  const tabIdx = { PR0202: 1, PR0203: 2, PR0204: 3, PR0205: 4 }[id] ?? 0;
  const pickup = id === 'PR0206';
  const d = off(p.was, p.price);

  const gallery = `<div class="g2 g1-m mb6" style="gap:12px">
    <div>${ph(p.id, 'ph-43', '상품 대표', '1200×900')}</div>
    <div class="g2" style="gap:12px">${[1, 2, 3, 4].map((i) => ph(p.id + 'g' + i, 'ph-43', '상품 사진', '1200×900')).join('')}</div>
  </div>`;

  const head = `<div class="row-b wrap-row mb4">
    <div><div class="badges mb2">${badge(CAT_LABEL[p.cat], 'b-line')}${badge('즉시확정', 'b-pri')}${badge('베스트', 'b-acc')}</div>
      <h1 class="t-page">${esc(p.name)}</h1>
      <div class="row-c mt2">${rateLine(p.rating, p.rv)} <a class="pri strong" href="${link('PR0701')}" style="font-size:13px">후기 전체 보기 ›</a></div></div>
    <div class="btns"><button class="btn btn-ghost" type="button" data-toast="찜한 상품에 담았어요" data-toast-kind="ok">♡ 찜하기</button>
      <button class="btn btn-ghost" type="button" data-toast="링크를 복사했어요">공유</button></div></div>`;

  const keyInfo = `<div class="g4 mb6">
    ${[['소요시간', p.dur], ['언어', '한국어 가이드'], ['확정', '즉시확정'], ['미팅 장소', p.meet]]
      .map(([k, v]) => `<div class="box"><div class="t-sub">${k}</div><div class="strong mt1">${v}</div></div>`).join('')}</div>`;

  const priceBox = card('', `<div class="row-c mb2"><span class="rate" style="font-size:22px">${d}%</span><span class="price-old">${won(p.was)}</span></div>
    <div class="price-lg">${won(p.price)} <span class="per">/ 성인 1인</span></div>
    <p class="t-sub mt2">아동(3~12세) ${won(48000)} · 유아(0~2세) 무료<br>현지 통화 기준 약 $${Math.round(p.price / 1380)}</p>
    <div class="btns mt4"><a class="btn btn-primary btn-block btn-lg" href="${link('PR0301')}">날짜 선택하기</a></div>
    <a class="btn btn-ghost btn-block mt2" href="${link('CT0101')}">장바구니에 담기</a>
    <p class="hint">무료 취소 — 출발 8일 전까지 100% 환불</p>`, { cls: 'sticky' });

  const tabList = [{ label: '상품 소개', go: 'PR0201' }, { label: '코스 일정', go: 'PR0202' },
  { label: '포함·불포함', go: 'PR0203' }, { label: '취소규정', go: 'PR0204' }, { label: `후기 ${num(p.rv)}`, go: 'PR0205' }];

  /* ---- 탭별 본문 ---- */
  const intro = `${sec('상품 소개', `<div class="card"><div class="card-bd">
    <p>맨해튼 남단 배터리파크에서 출발해 자유의 여신상을 가장 가까이서 보고, 엘리스섬 이민박물관까지 둘러보는 반일 코스입니다. 한국어 가이드가 배 위에서 뉴욕의 형성과 이민 역사를 설명해드려요.</p>
    <p class="mt3">크루즈는 하루 6회 운항하며, 오후 회차는 역광이 적어 사진이 잘 나옵니다. 엘리스섬에서는 자유 관람 시간 50분이 주어집니다.</p>
    <ul class="mt4">${['왕복 페리 티켓과 엘리스섬 입장료 포함', '한국어 가이드 동행 (회차별 1명)', '유모차 반입 가능 · 휠체어 이용 가능', '우천 시에도 정상 운항 (기상 특보 시 전액 환불)']
      .map((t) => `<li class="row-c" style="align-items:flex-start;padding:4px 0"><span class="pri">✓</span><span>${t}</span></li>`).join('')}</ul>
  </div></div>`)}`;

  const course = `${sec('코스 일정', `<div class="card"><div class="card-bd"><div class="timeline">
    ${[['13:45', '배터리파크 11번 부두 집합', '가이드가 파란 깃발을 들고 기다립니다. 여권 확인 후 티켓 배부', '체류 15분'],
    ['14:00', '리버티섬행 페리 승선', '갑판에서 자유의 여신상 촬영 · 이동 15분', '이동 15분'],
    ['14:20', '리버티섬 하선 · 여신상 관람', '기단부 외부 관람과 기념 촬영. 왕관 입장은 포함되지 않습니다', '체류 45분'],
    ['15:10', '엘리스섬으로 이동', '페리 이동 10분', '이동 10분'],
    ['15:25', '엘리스섬 이민박물관', '한국어 오디오가이드 대여 가능 · 자유 관람', '자유시간 50분', true],
    ['16:30', '배터리파크 복귀 · 해산', '원하시면 월스트리트·9/11 메모리얼까지 도보 안내', '체류 15분']]
      .map(([t, n, desc, stay, free]) => `<div class="tl-item${free ? ' is-free' : ''}">
        <div class="tm">${t}</div><div class="t-card mt1" style="font-size:16px">${n}</div>
        <p class="t-sub mt1">${desc}</p><div class="badges mt2">${badge(stay, free ? 'b-acc' : 'b-line')}</div></div>`).join('')}
  </div></div></div>`)}
  ${sec('경로 지도', `<div class="card"><div class="card-bd" style="padding:0">${phMap('ph-map', [
    { x: 24, y: 62, n: 1, name: '배터리파크' }, { x: 46, y: 44, n: 2, name: '리버티섬' }, { x: 62, y: 30, n: 3, name: '엘리스섬' },
  ], '방문지 3곳 · 총 이동거리 약 6km')}</div></div>`)}`;

  const incl = `${sec('포함 · 불포함 사항', `<div class="g2 g1-m">
    ${card('포함 사항', `<ul>${['왕복 페리 승선권', '엘리스섬 이민박물관 입장료', '한국어 가이드 동행', '생수 1병', '여행자 보험 (현지 규정에 따름)']
    .map((t) => `<li class="row-c" style="padding:6px 0"><span class="success strong">✓</span><span>${t}</span></li>`).join('')}</ul>`)}
    ${card('불포함 사항', `<ul>${['자유의 여신상 왕관 입장료 (현장 $28)', '오디오가이드 대여료 (현장 $8)', '식사와 개인 경비', '집합 장소까지의 교통비', '가이드·기사 팁 (권장 $5)']
    .map((t) => `<li class="row-c" style="padding:6px 0"><span class="danger strong">✕</span><span>${t}</span></li>`).join('')}</ul>
      <p class="hint">현장 결제 항목은 현금 또는 카드 모두 가능합니다.</p>`)}
  </div>`)}
  ${sec('', banner('pri', 'ℹ', '입장료는 포함이며 왕관 전망대만 별도입니다. 식사는 제공되지 않으니 크루즈 전에 식사하시길 권합니다.'))}`;

  const cancel = `${sec('취소 · 환불 규정', `${table(
    [{ t: '취소 시점', w: '34%' }, '환불율', '취소 수수료', '비고'],
    REFUND_RULES.tour.map((r) => ({ cls: r.now ? 'is-now' : '', cells: [r.when, `<b>${r.rate}</b>`, r.fee, r.now ? '<span class="badge b-danger">현재 위치</span>' : ''] })),
  )}
  <div class="g2 g1-m mt4">
    ${banner('ok', '✓', '<b>무료 취소 기한</b> — 2026년 7월 26일 23:59까지 (현지 시각 기준). 지금은 <b>D-4</b> 로 50% 환불 구간입니다.')}
    ${banner('pri', '🌧', '<b>기상 취소</b> — 현지 판단으로 운항이 취소되면 별도 신청 없이 전액 환불됩니다.')}
  </div>
  <p class="hint mt3">모든 기준 시각은 상품 이용 도시의 현지 시각(EDT)입니다. 한국 시각과 13시간 차이가 있으니 유의해주세요.</p>`)}`;

  const rv = `${sec('후기', `<div class="card"><div class="card-bd">
    ${rateSummary(RATE_DIST, 4.8, 2841)}
    <div class="chips mt6 mb4">${U.chip('전체', true)}${U.chip('사진 후기만', false)}${U.chip('가족', false)}${U.chip('연인', false)}${U.chip('친구', false)}${U.chip('혼자', false)}
      <select class="select" style="width:auto;height:36px"><option>최신순</option><option>도움순</option></select></div>
    ${REVIEWS.map((r) => review(r, { trans: true })).join('')}
    <a class="btn btn-ghost btn-block mt4" href="${link('PR0701')}">후기 2,841개 전체 보기</a>
  </div></div>`)}`;

  const pickupBox = !pickup ? '' : `${sec('픽업 가능 지역 확인', `<div class="card"><div class="card-bd">
    <div class="form" style="max-width:none">
      <div class="field"><label class="label">호텔명 또는 주소</label>
        <div class="row"><input class="input" value="Hilton Times Square"><button class="btn btn-primary" type="button" style="flex:none" data-toast="조회했어요">조회</button></div>
        <p class="hint">호텔 이름 일부만 입력해도 검색됩니다.</p></div>
    </div>
    ${banner('ok', '✓', '<b>픽업 가능 지역이에요.</b> 예상 픽업 시각 <b>13:05</b> · 로비에서 대기해주세요. 추가 요금 없음', { cls: 'mb3' })}
    ${banner('warn', '⚠', '<b>Brooklyn Marriott</b> 는 픽업 구역 밖이에요. 집합 장소(배터리파크 11번 부두)로 직접 오시거나 추가 요금 <b>$15</b> 로 근처 지점 픽업이 가능합니다.')}
    <div class="mt4">${phMap('ph-map', [{ x: 40, y: 40, n: '✓', name: '픽업 가능 구역', on: true }, { x: 72, y: 58, n: '✕', name: '구역 밖' }], '픽업 가능 구역 — 미드타운 · 다운타운 호텔 중심')}</div>
    ${table([{ t: '구역', w: '30%' }, '예상 픽업 시각', '추가 요금'], [
    ['미드타운 (34~59번가)', '13:00 ~ 13:10', '없음'],
    ['다운타운 (배터리파크 인근)', '13:20', '없음'],
    ['어퍼웨스트 · 어퍼이스트', '12:40', '$10'],
    ['브루클린 · 퀸즈', '픽업 불가', '집합 장소 이용'],
  ])}
  </div></div>`)}`;

  const paneMap = [intro + course + incl + cancel + rv, course, incl, cancel, rv];
  const mainPane = pickup ? intro + pickupBox : paneMap[tabIdx];

  const faq = sec('자주 묻는 질문', accordion([
    { q: '비가 오면 어떻게 되나요?', a: '가벼운 비에는 정상 운항합니다. 기상 특보로 운항이 중단되면 전액 환불되고 별도 신청은 필요하지 않습니다.' },
    { q: '집합 시간에 늦으면요?', a: '페리 시각이 정해져 있어 대기가 어렵습니다. 15분 전 도착을 권하며, 늦으실 것 같으면 바우처의 현지 연락처로 미리 알려주세요.' },
    { q: '유모차를 가져가도 되나요?', a: '가능합니다. 페리 승선 시 접어서 지정 구역에 보관합니다.' },
    { q: '왕관 전망대는 포함인가요?', a: '포함되지 않습니다. 왕관은 별도 예약제이며 현장에서 $28 에 이용하실 수 있습니다.' },
  ], 0));

  const body = `${gallery}${head}${keyInfo}
    ${tabs(tabList, pickup ? 0 : tabIdx)}
    <div class="split-r"><div>${mainPane}${faq}</div><div>${priceBox}
      ${card('미팅 장소', `${phMap('ph-map', [{ x: 44, y: 48, n: '📍', name: p.meet }], p.meet)}
        <p class="t-sub mt3">${p.meet}<br>지하철 1호선 South Ferry 역 3분 · 4/5호선 Bowling Green 역 5분</p>
        <div class="btns mt3"><button class="btn btn-ghost btn-sm" type="button" data-toast="지도 앱을 열어 이곳까지 길을 안내해요">길찾기</button>
          <a class="btn btn-ghost btn-sm" href="${link('PR0206')}">픽업 가능 지역 확인</a></div>`)}
    </div></div>`;

  return {
    body, o: {
      cart: 2,
      stick: stickBar(`<div class="row-c"><span class="rate strong">${d}%</span><span class="price">${won(p.price)}</span><span class="t-sub">/ 1인</span></div>`,
        `<a class="btn btn-ghost" href="${link('CT0101')}">장바구니</a><a class="btn btn-primary btn-lg" href="${link('PR0301')}">날짜 선택하기</a>`),
      state: { PR0202: '코스 일정 탭 — 타임라인·체류시간·지도 핀 연동', PR0203: '포함·불포함 탭 — 현장 결제 금액 표기', PR0204: '취소규정 탭 — 현재 위치 강조와 무료 취소 D-day', PR0205: '후기 탭 — 평점 분포·동행 유형 필터', PR0206: '픽업 가능 지역 확인 — 호텔 조회와 구역 판정' }[id] || '',
    },
  };
}

/* ===== PR03 날짜·옵션 선택 ===== */
export function PR0301(ctx) {
  const id = ctx.id;
  const p = MAIN;
  const timeTab = id === 'PR0302';
  const over = id === 'PR0303';
  const blocked = id === 'PR0304';
  const pickupSel = id === 'PR0305';
  const minPax = id === 'PR0306';

  const times = [
    { t: '10:00', left: 12, note: '오전 회차 · 역광 적음' },
    { t: '12:00', left: 6, note: '' },
    { t: '14:00', left: over ? 4 : 9, note: '가장 인기 있는 회차', on: true },
    { t: '16:00', left: 2, note: '일몰 촬영에 좋아요' },
    { t: '18:00', left: 0, note: '마감', off: true },
  ];

  const cal = calendar({
    sel: blocked ? 0 : 3, month: '2026년 8월',
    closed: blocked ? [3, 10, 17, 24, 31] : [10, 17, 24, 31],
    soldout: [5, 12, 19], past: [1, 2],
    marks: blocked ? [6] : [],
    prices: (d) => (d % 7 === 0 ? '72,000' : '68,000'),
    legend: blocked ? '<span class="accent">주황 테두리 = 가장 빠른 예약 가능일</span>' : '',
  });

  const paxRow = (label, sub, n, max) => `<div class="row-b" style="padding:10px 0;border-bottom:1px solid var(--border)">
    <div><div class="strong">${label}</div><div class="t-sub">${sub}</div></div>
    <div class="stepper"><button type="button" data-step="-">−</button><span class="num">${n}</span><button type="button" ${max ? 'disabled' : ''}>＋</button></div></div>`;

  const pax = card('인원 선택', `
    ${paxRow('성인', '13세 이상 · 68,000원', over ? 6 : 2, over)}
    ${paxRow('아동', '3~12세 · 48,000원', 1)}
    ${paxRow('유아', '0~2세 · 무료 (좌석 없음)', 0)}
    ${over ? banner('danger', '⚠', `<b>남은 좌석은 4자리예요.</b> 선택한 인원(성인 6 · 아동 1 = 7명)이 잔여 좌석을 넘습니다.
        <div class="btns mt3"><button class="btn btn-ghost btn-sm" type="button" data-toast="인원을 4명으로 조정했어요">4명으로 맞추기</button>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="대기 신청이 접수됐어요. 자리가 나면 알려드릴게요">초과 인원 대기 신청</button></div>`, { cls: 'mt4' })
      : `<p class="hint">나이는 <b>이용일 기준 만 나이</b>로 계산합니다. 현장에서 여권으로 확인할 수 있어요.</p>`}`);

  const opts = card('옵션 선택', `
    <div class="label">호텔 픽업</div>
    <div class="radio-list mb4">
      <label class="radio${pickupSel ? '' : ' on'}" data-group="pk"><input type="radio" name="pk" ${pickupSel ? '' : 'checked'}>
        <span><b>집합 장소로 직접 갈게요</b><span class="sub">배터리파크 11번 부두 · 추가 요금 없음</span></span></label>
      <label class="radio${pickupSel ? ' on' : ''}" data-group="pk"><input type="radio" name="pk" ${pickupSel ? 'checked' : ''}>
        <span><b>호텔 픽업을 신청할게요</b><span class="sub">1인당 +12,000원 · 미드타운·다운타운 호텔만 가능</span></span></label>
    </div>
    ${pickupSel ? `<div class="box mb4">
      <div class="field"><label class="label">호텔명 · 주소</label>
        <div class="row"><input class="input" value="Hilton Times Square, 234 W 42nd St"><button class="btn btn-primary" type="button" style="flex:none" data-toast="검색했어요">검색</button></div></div>
      ${banner('ok', '✓', '픽업 가능 구역이에요. 예상 픽업 시각 <b>13:05</b> · 추가 요금 <b>36,000원</b> (3인)', { cls: 'mb3' })}
      ${phMap('ph-map', [{ x: 46, y: 40, n: '🏨', name: '선택한 호텔', on: true }], '픽업 가능 구역 안')}
      <p class="hint">픽업 시각은 교통 상황에 따라 10분 정도 달라질 수 있어요. 로비에서 대기해주세요.</p>
    </div>` : ''}
    <div class="label">좌석 등급</div>
    <div class="radio-list">
      <label class="radio on" data-group="st"><input type="radio" name="st" checked><span><b>일반석</b><span class="sub">자유석 · 추가 요금 없음</span></span></label>
      <label class="radio" data-group="st"><input type="radio" name="st"><span><b>프리미엄 데크</b><span class="sub">1인당 +18,000원 · 상부 갑판 지정석</span></span></label>
    </div>`);

  const timeBox = card('출발 시간대', `
    ${timeTab ? `<p class="t-sub mb3">2026년 8월 3일(월) 출발 회차 · <b>현지 시각(EDT) 기준</b></p>` : ''}
    <div class="col">${times.map((t) => `<label class="radio${t.on ? ' on' : ''}${t.off ? ' is-off' : ''}" data-group="tm" style="${t.off ? 'opacity:.5;cursor:not-allowed' : ''}">
      <input type="radio" name="tm" ${t.on ? 'checked' : ''} ${t.off ? 'disabled' : ''}>
      <span class="grow"><b>${t.t}</b> ${t.note ? `<span class="sub">${t.note}</span>` : ''}</span>
      <span class="${t.left === 0 ? 'muted' : (t.left <= 4 ? 'danger strong' : 'muted')}" style="font-size:13px">${t.left === 0 ? '마감' : `잔여 ${t.left}석`}</span></label>`).join('')}</div>
    ${timeTab ? `<p class="hint">일몰 시각은 20:12 이에요. 16:00 회차는 노을 촬영에 좋습니다. 기상 특보 시 회차가 통합될 수 있어요.</p>` : ''}`);

  const total = over ? 476000 : (pickupSel ? 220000 : 184000);
  const summary = card('금액 요약', `
    ${sumRows([
    ['성인 ' + (over ? 6 : 2) + '명', won(68000 * (over ? 6 : 2))],
    ['아동 1명', won(48000)],
    ['유아 0명', '0원'],
    ...(pickupSel ? [['호텔 픽업 3명', won(36000)]] : []),
  ], ['총 결제 금액', won(total)])}
    <p class="t-sub mt2">현지 통화 기준 약 $${Math.round(total / 1380)}</p>
    <div class="btns mt4"><a class="btn btn-ghost btn-block" href="${link('CT0101')}">장바구니 담기</a></div>
    <a class="btn btn-primary btn-block btn-lg mt2 ${over || blocked ? 'is-off' : ''}" href="${over || blocked ? '#' : link('BK0101')}">바로 예약하기</a>
    ${over ? '<p class="err">잔여 좌석을 초과해 담을 수 없어요. 인원을 조정해주세요.</p>' : ''}
    ${blocked ? '<p class="err">예약할 수 없는 날짜예요. 다른 날짜를 선택해주세요.</p>' : ''}
    <p class="hint">무료 취소 — 출발 8일 전까지 100% 환불</p>`, { cls: 'sticky' });

  const minPaxBox = !minPax ? '' : card('최소 출발 인원 안내', `
    <div class="row-b mb2"><span class="strong">8월 3일 14:00 회차</span><span class="badge b-warn">확정 대기</span></div>
    <p class="t-sub mb3">현재 모인 인원 <b>4명</b> / 최소 출발 인원 <b>6명</b></p>
    ${progress(66, true)}
    ${banner('warn', '⏱', '<b>확정 마감 8월 1일 18:00 (현지 시각)</b> 까지 6명이 모이지 않으면 자동 취소되고 전액 환불됩니다.', { cls: 'mt4' })}
    <div class="mt4"><div class="label">이미 확정된 날짜</div>
      <div class="chips">${['8월 5일 14:00 (확정)', '8월 7일 10:00 (확정)', '8월 9일 14:00 (확정)'].map((t) => U.chip(t, false, `data-go="${link('PR0301')}"`)).join('')}</div></div>`);

  const blockedBox = !blocked ? '' : banner('danger', '⚠', `<b>8월 3일은 예약할 수 없어요.</b> 현지 공휴일(Labor Day 연휴) 로 운항이 없습니다.
    <div class="mt2">가장 빠른 예약 가능일은 <b>8월 6일(목)</b> 이에요.</div>
    <div class="btns mt3"><button class="btn btn-primary btn-sm" type="button" data-toast="8월 6일로 이동했어요">그 날짜로 보기</button>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="예약이 열리면 알려드릴게요" data-toast-kind="ok">오픈 알림 신청</button></div>`, { cls: 'mb4' });

  const body = `${U.stepbar(['날짜·옵션', '여행자 정보', '결제', '완료'], 0)}
    ${prodSummary(p, { date: p.city + ' · ' + p.dur, right: `<div class="price">${won(p.price)}</div><div class="t-sub">1인</div>` })}
    ${blockedBox}
    <div class="split-r mt6"><div>
      ${sec('날짜 선택', cal, { desc: '진하게 표시된 날짜만 예약할 수 있어요. 휴무일과 마감된 날짜는 선택되지 않습니다.' })}
      ${sec('시간대 선택', timeBox)}
      ${minPax ? sec('출발 확정 현황', minPaxBox) : ''}
      ${sec('인원', pax)}
      ${sec('옵션', opts)}
    </div><div>${summary}</div></div>`;

  return {
    body, o: {
      cart: 2,
      after: over ? toastEl('남은 좌석은 4자리예요. 인원을 조정해주세요') : '',
      state: { PR0302: '시간대 선택 — 회차별 잔여 좌석과 현지 시각 표기', PR0303: '잔여 좌석 초과 — 인원 보정·대기 신청·담기 비활성', PR0304: '예약 불가일 선택 — 사유 표시와 가장 빠른 가능일 제안', PR0305: '픽업 옵션 선택 — 호텔 검색·구역 지도·추가 요금', PR0306: '최소 출발 인원 안내 — 모인 인원과 확정 마감 시각' }[id] || '',
    },
  };
}

/* ===== PR04 패스 상품 상세 ===== */
export function PR0401(ctx) {
  const id = ctx.id;
  const cmp = id === 'PR0402';
  const need = id === 'PR0403';
  const sum = PASS.spots.reduce((a, b) => a + b.price, 0);

  const kinds = [
    { n: '2일권', p: PASS.price2, spots: '명소 5곳 선택', save: 58 },
    { n: '3일권', p: PASS.price3, spots: '명소 7곳 선택', save: 68, best: true },
    { n: '5일권', p: PASS.price5, spots: '명소 8곳 전체', save: 74 },
  ];

  const body = `
  ${sec('', `<div class="pass-banner">
    <div><div class="badge b-acc mb2">뉴욕 · 패스</div>
      <h1 class="t-page" style="color:#fff">${PASS.name}</h1>
      <p class="mt2" style="color:rgba(255,255,255,.9)">인기 명소 8곳을 한 장으로 · 개별 구매 대비 <b>${PASS.save}% 절약</b></p>
      <div class="row-c mt4">${stars(4.8)}<b style="color:#fff">4.8</b><span style="color:rgba(255,255,255,.8)">(후기 8,820)</span></div></div>
    <div class="right"><div class="t-sub" style="color:rgba(255,255,255,.75)">개별 구매 합계 ${won(sum)}</div>
      <div class="price-lg" style="color:#fff">${won(PASS.price3)}</div>
      <div class="t-sub" style="color:rgba(255,255,255,.8)">3일권 기준 · 1인</div></div>
  </div>`)}

  ${tabs([{ label: '패스 소개', go: 'PR0401' }, { label: '권종별 비교', go: 'PR0402' }, { label: '사전 예약 필수 명소', go: 'PR0403' }], cmp ? 1 : (need ? 2 : 0))}

  ${cmp ? sec('권종별 비교', `${table(
    [{ t: '항목', w: '26%' }, '2일권', '3일권 (추천)', '5일권'],
    [
      { cls: '', cells: ['가격 (성인 1인)', won(PASS.price2), `<b class="pri">${won(PASS.price3)}</b>`, won(PASS.price5)] },
      { cls: 'is-diff', cells: ['선택 가능 명소 수', '5곳', '7곳', '8곳 전체'] },
      { cls: 'is-diff', cells: ['절약률', '58%', '68%', '74%'] },
      { cls: '', cells: ['이용 기간', '첫 사용일부터 2일', '첫 사용일부터 3일', '첫 사용일부터 5일'] },
      { cls: 'is-diff', cells: ['서밋 원 밴더빌트', '✕ 미포함', '✓ 포함', '✓ 포함'] },
      { cls: 'is-diff', cells: ['뉴욕 식물원', '✕ 미포함', '✕ 미포함', '✓ 포함'] },
      { cls: '', cells: ['크루즈 우선 승선', '✕', '✓', '✓'] },
      { cls: '', cells: ['유효기간', '구매 후 1년', '구매 후 1년', '구매 후 1년'] },
    ], { scroll: true, fix: true })}
    <div class="g3 g1-m mt4">${kinds.map((k) => `<div class="card"><div class="card-bd center">
      ${k.best ? badge('가장 많이 선택', 'b-acc') : '<span class="badge b-line">&nbsp;</span>'}
      <div class="t-card mt2">${k.n}</div><div class="price-lg mt2">${won(k.p)}</div>
      <p class="t-sub">${k.spots} · ${k.save}% 절약</p>
      <button class="btn ${k.best ? 'btn-primary' : 'btn-ghost'} btn-block mt3" type="button" data-toast="${k.n}을 선택했어요">이 권종 선택</button></div></div>`).join('')}</div>
    <p class="hint mt3">권종을 선택하면 하단 구매 바의 금액이 함께 바뀝니다.</p>`) : ''}

  ${need ? sec('사전 예약이 필요한 명소', `
    ${banner('warn', '⚠', '패스가 있어도 <b>아래 명소는 시간대 예약이 별도로 필요</b>합니다. 예약하지 않으면 입장이 거절될 수 있어요.', { cls: 'mb4' })}
    <div class="col">${PASS.reserveNeeded.map((s) => `<div class="hcard">
      ${ph(s.name, 'ph-thumb', '이미지')}
      <div class="grow"><div class="row-c mb1">${badge(s.urgent ? '마감 임박' : '여유 있음', s.urgent ? 'b-danger' : 'b-ok')}</div>
        <div class="t-card" style="font-size:16px">${s.name}</div>
        <p class="t-sub mt1">${s.note}</p></div>
      <div style="flex:none"><button class="btn btn-primary btn-sm" type="button" data-toast="예약 페이지로 이동합니다">시간대 예약</button></div></div>`).join('')}</div>
    ${card('예약 방법', `<div class="steps">
      ${['패스를 구매하고 바우처 번호를 받습니다', '명소 공식 예약 페이지에서 바우처 번호로 시간대를 지정합니다', '지정한 시간에 입구에서 패스 QR과 예약 확인서를 함께 제시합니다']
      .map((t, i) => `<div class="step"><div class="n">${i + 1}</div><p>${t}</p></div>`).join('')}</div>`, { cls: 'mt4' })}`) : ''}

  ${!cmp && !need ? `
  ${sec('포함 명소', `<div class="card"><div class="card-bd">
    <div class="g2 g1-m mb4">${PASS.spots.map((s) => `<div class="row-c" style="gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
      ${ph(s.name, 'ph-sq', '이미지')}<div class="grow"><div class="strong">${s.name}</div><div class="t-sub">개별 정가 ${won(s.price)}</div></div>
      <a class="btn btn-ghost btn-sm" href="${link('PR0201')}" style="flex:none">명소 상세</a></div>`).join('')}</div>
    ${table([{ t: '구분', w: '50%' }, '금액'], [
    ['명소 8곳 개별 구매 합계', won(sum)],
    { cls: 'is-now', cells: ['<b>3일권 패스 가격</b>', `<b class="pri">${won(PASS.price3)}</b>`] },
    ['절약 금액', `<b class="danger">${won(sum - PASS.price3)} (${PASS.save}%)</b>`],
  ])}
  </div></div>`)}

  ${sec('권종별 가격', `<div class="g3 g1-m">${kinds.map((k) => `<div class="card"><div class="card-bd center">
    ${k.best ? badge('가장 많이 선택', 'b-acc') : '<span class="badge b-line">선택 가능</span>'}
    <div class="t-card mt3">${k.n}</div><div class="price-lg mt2">${won(k.p)}</div>
    <p class="t-sub">${k.spots}<br>${k.save}% 절약</p>
    <a class="btn ${k.best ? 'btn-primary' : 'btn-ghost'} btn-block mt4" href="${link('PR0301')}">이 권종 선택</a></div></div>`).join('')}</div>
    <p class="t-sub center mt3"><a class="pri strong" href="${link('PR0402')}">권종별 차이 자세히 비교하기 ›</a></p>`)}

  ${sec('이용 기간 규칙', `<div class="card"><div class="card-bd">
    <p><b>첫 사용일로부터 연속 N일</b> 동안 사용합니다. 사용하지 않은 날은 이월되지 않아요.</p>
    <div class="box mt4"><b>예시</b> — 3일권을 8월 3일 오전에 처음 사용했다면
      <div class="mt2">이용 가능 기간은 <b>8월 3일 00:00 ~ 8월 5일 23:59 (현지 시각)</b> 입니다.</div>
      <div class="t-sub mt2">구매 후 1년 안에 첫 사용을 시작하면 되고, 첫 사용 전에는 100% 환불됩니다.</div></div>
  </div></div>`)}

  ${sec('사용 방법', `<div class="steps">
    ${[['구매', '결제하면 바우처가 바로 발급됩니다'], ['바우처 받기', '마이페이지 또는 이메일에서 QR을 확인하고 저장해두세요'], ['입구에서 QR 제시', '각 명소 입구에서 QR을 보여주면 바로 입장합니다']]
    .map(([t, d], i) => `<div class="step"><div class="n">${i + 1}</div><div class="t-card" style="font-size:16px">${t}</div><p class="t-sub mt1">${d}</p></div>`).join('')}</div>`)}

  ${sec('주의사항', `<div class="box-warn"><ul>
    ${['서밋 원 밴더빌트 등 일부 명소는 <b>사전 시간대 예약이 필수</b>입니다.',
      '같은 명소 재입장은 불가하며, 각 명소는 1회만 이용할 수 있습니다.',
      '명소 운영시간과 휴관일은 현지 사정에 따라 변경될 수 있습니다.',
      '첫 사용 이후에는 환불되지 않습니다.']
      .map((t) => `<li class="row-c" style="align-items:flex-start;padding:4px 0"><span class="warning">•</span><span>${t}</span></li>`).join('')}</ul>
    <p class="t-sub mt3"><a class="pri strong" href="${link('PR0403')}">사전 예약이 필요한 명소 확인하기 ›</a></p></div>`)}
  ` : ''}`;

  return {
    body, o: {
      cart: 2,
      stick: stickBar(`<div><span class="t-sub">3일권 · 성인 1인</span><div class="row-c"><span class="rate strong">${PASS.save}% 절약</span><span class="price">${won(PASS.price3)}</span></div></div>`,
        `<a class="btn btn-primary btn-lg" href="${link('PR0301')}">구매하기</a>`),
      state: cmp ? '권종별 비교 — 2·3·5일권 차이 항목 강조' : need ? '사전 예약 필수 명소 — 예약 방법 단계 안내' : '',
    },
  };
}

/* ===== PR05 상품 비교 ===== */
export function PR0501(ctx) {
  const id = ctx.id;
  const few = id === 'PR0502';
  const diffOnly = id === 'PR0503';
  const list = few ? [P('P01')] : [P('P01'), P('P04'), P('P06')];

  const rows = [
    { k: '가격 (성인 1인)', v: list.map((p) => `<b class="price" style="font-size:16px">${won(p.price)}</b><br><s class="t-sub">${won(p.was)}</s>`), diff: true },
    { k: '소요시간', v: list.map((p) => p.dur), diff: true },
    { k: '한국어 가이드', v: list.map((p) => p.ko ? '✓ 포함' : '✕ 없음'), diff: false },
    { k: '호텔 픽업', v: list.map((p) => p.pickup ? '✓ 가능 (유료)' : '✕ 불가'), diff: true },
    { k: '미팅 장소', v: list.map((p) => p.meet), diff: true },
    { k: '즉시확정', v: list.map((p) => p.instant ? '✓ 즉시확정' : '△ 현지 확인 필요'), diff: true },
    { k: '취소 가능 시점', v: list.map((p, i) => i === 1 ? '출발 3일 전까지 100%' : '출발 8일 전까지 100%'), diff: true },
    { k: '평점 · 후기', v: list.map((p) => `${p.rating.toFixed(1)} (${num(p.rv)})`), diff: true },
    { k: '잔여 좌석', v: list.map((p) => p.left <= 5 ? `<b class="danger">${p.left}자리</b>` : `${p.left}자리`), diff: true },
  ];
  const shown = diffOnly ? rows.filter((r) => r.diff) : rows;

  const body = `${pageHd('상품 비교', few ? '비교할 상품을 2개 이상 담아주세요' : `${list.length}개 상품을 나란히 비교하고 있어요 (최대 3개)`,
    few ? '' : `<div class="btns">${diffOnly ? `<a class="btn btn-ghost" href="${link('PR0501')}">전체 항목 보기</a>` : `<a class="btn btn-ghost" href="${link('PR0503')}">차이 항목만 보기</a>`}</div>`)}

  ${few ? `<div class="card mb6">${empty('⚖', '비교할 상품이 하나뿐이에요',
    '상품을 하나 더 담으면 항목별로 나란히 비교할 수 있어요. 최대 3개까지 담을 수 있습니다.',
    `<a class="btn btn-primary" href="${link('PR0101')}">상품 검색해서 추가</a><a class="btn btn-ghost" href="${link('PR0801')}">찜한 상품에서 담기</a>`)}</div>
    ${sec('최근 본 상품에서 담기', `<div class="g4">${pcards([P('P04'), P('P06'), P('P02'), P('P03')], { noHeart: true, ribbon: badge('비교 추가', 'b-pri') })}</div>`)}`
      : `
  ${diffOnly ? banner('pri', 'ℹ', `값이 같은 항목 <b>${rows.length - shown.length}개</b>는 접었어요. 취소 규정과 픽업 여부처럼 <b>다른 값만</b> 보여드립니다.`, { cls: 'mb4' }) : ''}
  <div class="table-wrap table-scroll"><table class="table table-fix">
    <thead><tr><th style="width:180px">비교 항목</th>
      ${list.map((p) => `<th style="width:auto">
        <div style="padding:12px 0">${ph(p.id, 'ph-16', '상품 대표', '1600×900')}
        <div class="t-card mt2" style="font-size:15px;white-space:normal">${esc(p.name)}</div>
        <div class="t-sub" style="font-weight:400">${p.city}</div></div></th>`).join('')}</tr></thead>
    <tbody>${shown.map((r) => `<tr class="${r.diff ? 'is-diff' : ''}"><td><b>${r.k}</b></td>${r.v.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}
      <tr><td></td>${list.map(() => `<td><a class="btn btn-primary btn-block" href="${link('PR0301')}">예약하기</a>
        <button class="btn btn-ghost btn-block mt2 btn-sm" type="button" data-toast="비교 목록에서 제외했어요">비교 제외</button></td>`).join('')}</tr>
    </tbody></table></div>
  <p class="t-sub mt4">배경이 옅게 칠해진 행은 상품 간 값이 다른 항목이에요.</p>`}`;

  return {
    body, o: {
      cart: 2,
      state: few ? '비교 대상 부족 — 추가 경로 안내와 최대 3개 제한' : diffOnly ? '차이 항목만 보기 — 같은 값 행 접기' : '',
    },
  };
}

/* ===== PR06 예약 마감·품절 ===== */
export function PR0601(ctx) {
  const id = ctx.id;
  const applied = id === 'PR0602';
  const season = id === 'PR0603';
  const p = season ? P('P08') : MAIN;

  const body = `${prodSummary(p, { cls: 'is-off', date: season ? '운영 시즌 종료' : '8월 3일(월) 14:00 회차', state: season ? '시즌 종료' : '예약 마감', stateCls: 'b-mut' })}

  ${season
      ? banner('mut', '🍂', `<b>이 상품은 운영 시즌이 종료되었어요.</b> 카타마란 스노클링은 우기(9~11월)에 운항하지 않습니다.
        <div class="mt2">다음 시즌은 <b>2026년 12월</b> 에 열릴 예정이에요.</div>`, { cls: 'mt6 mb6' })
      : banner('mut', '🚫', `<b>이 날짜는 예약이 마감되었어요.</b> 마감 사유 — <b>좌석 소진</b> (판매 종료·시즌 종료가 아닙니다)
        <div class="mt2">가장 빠른 예약 가능일은 <b>9월 3일(수)</b> 이에요.</div>`, { cls: 'mt6 mb6' })}

  ${applied ? banner('ok', '✓', `<b>자리 알림을 신청했어요.</b> 카카오톡과 이메일로 알려드릴게요.
      <div class="t-sub mt2">알림은 자리가 나는 즉시 1회 발송되며, 마이페이지 &gt; 알림 설정에서 언제든 끌 수 있어요.</div>`, {
    cls: 'mb6',
    right: `<div class="btns"><button class="btn btn-ghost btn-sm" type="button" data-toast="알림 신청을 취소했어요">신청 취소</button>
      <a class="btn btn-ghost btn-sm" href="${link('MY1301')}">알림 설정</a></div>`,
  }) : ''}

  <div class="g2 g1-m mb6">
    ${card(season ? '다음 시즌 알림' : '다른 날짜로 보기', season
    ? `<p class="t-sub">2026년 12월 예약이 열리면 가장 먼저 알려드릴게요.</p>
         <button class="btn btn-primary btn-block mt4" type="button" data-toast="다음 시즌이 열리면 알려드릴게요" data-toast-kind="ok">오픈 알림 신청</button>`
    : `<p class="t-sub">9월 3일(수) 14:00 회차에 <b>18자리</b> 가 남아 있어요.</p>
         <a class="btn btn-primary btn-block mt4" href="${link('PR0301')}">그 날짜로 보기</a>`)}
    ${card(applied ? '수신 채널' : '자리 알림 신청', applied
      ? `${U.kv([['카카오톡', '010-****-1234'], ['이메일', 'kim****@gmail.com']])}
         <p class="hint">두 채널 모두 켜져 있어요.</p>`
      : `<p class="t-sub">취소 좌석이 나오면 카카오톡·이메일로 알려드려요.</p>
         <a class="btn btn-ghost btn-block mt4" href="${link('PR0602')}">자리가 나면 알려주세요</a>`)}
  </div>

  ${season ? sec('같은 시기에 갈 만한 상품', `<div class="g4">${pcards([P('P07'), P('P13'), P('P10'), P('P12')], { noHeart: true })}</div>`,
        { desc: '9~11월에도 운영하는 상품만 골랐어요.' }) : ''}

  ${sec('비슷한 상품', `<div class="g4">${pcards([P('P02'), P('P04'), P('P06'), P('P03')], { noHeart: true })}</div>`, { more: 'PR0101' })}

  ${season ? sec('지난 시즌 후기', `<div class="card"><div class="card-bd">${REVIEWS.slice(3, 5).map((r) => review(r)).join('')}</div></div>`) : ''}`;

  return {
    body, o: {
      cart: 2,
      after: applied ? toastEl('자리가 나면 알려드릴게요', '알림 설정', 'ok') : '',
      state: applied ? '재입고 알림 신청 완료 — 수신 채널 표시와 신청 취소' : season ? '시즌 종료 상태 — 다음 시즌 예정월과 대체 상품' : '',
    },
  };
}

/* ===== PR07 후기 전체보기 ===== */
export function PR0701(ctx) {
  const id = ctx.id;
  const picOnly = id === 'PR0702';
  const none = id === 'PR0703';
  const p = none ? P('P12') : MAIN;
  const list = picOnly ? REVIEWS.filter((r) => r.pics > 0) : REVIEWS;

  const body = `${prodSummary(p, { right: `<a class="btn btn-ghost btn-sm" href="${link('PR0201')}">상품 상세</a>` })}
  <div class="mt6"></div>

  ${none ? `<div class="card">${empty('✍', '아직 후기가 없어요',
    '이번 달에 새로 등록된 상품이에요. 첫 후기를 남기면 <b>1,000포인트</b>를 드립니다.',
    `<a class="btn btn-primary" href="${link('PR0101')}">같은 카테고리 후기 보기</a><a class="btn btn-ghost" href="${link('CS0201')}">상품 문의하기</a>`)}</div>`
      : `
  ${sec('', card('', U.rateSummary(RATE_DIST, 4.8, 2841)))}

  <div class="row-b wrap-row mb4">
    <div class="chips">${U.chip('전체', !picOnly)}${U.chip('사진 후기만', picOnly)}${U.chip('5점', false)}${U.chip('4점 이하', false)}</div>
    <div class="row-c">
      <select class="select" style="width:auto"><option>최신순</option><option>도움순</option></select>
      ${picOnly ? `<a class="btn btn-ghost btn-sm" href="${link('PR0701')}">목록형으로</a>` : `<a class="btn btn-ghost btn-sm" href="${link('PR0702')}">갤러리형으로</a>`}
    </div></div>

  ${picOnly ? `
    <p class="t-sub mb4">사진이 첨부된 후기 <b class="pri">${list.length}개</b> · 사진을 누르면 확대해서 볼 수 있어요.</p>
    ${sec('', `<div class="g6">${list.flatMap((r) => Array.from({ length: r.pics }, (_, i) => `<a href="#" title="${esc(r.who)}">${ph(r.who + i, 'ph-11', '후기 사진', '800×800')}</a>`)).join('')}</div>`)}
    <div class="card"><div class="card-bd">${list.map((r) => review(r)).join('')}</div></div>`
        : `<div class="card"><div class="card-bd">${list.map((r) => review(r, { trans: true })).join('')}</div></div>
    <button class="btn btn-ghost btn-block mt4" type="button" data-toast="후기를 더 불러왔어요">후기 더 보기 (2,835개 남음)</button>`}`}`;

  return {
    body, o: {
      cart: 2,
      state: picOnly ? '사진 후기만 필터 — 갤러리 그리드 전환' : none ? '후기 없음 — 첫 후기 혜택 안내' : '',
    },
  };
}

/* ===== PR08 찜한 상품 ===== */
export function PR0801(ctx) {
  const id = ctx.id;
  const priceDown = id === 'PR0802';
  const none = id === 'PR0803';
  const list = [P('P11'), P('P02'), P('P07'), P('P04'), P('P08'), P('P12'), P('P06'), P('P10'), P('P13'), P('P01'), P('P03'), P('P05')];
  const down = priceDown ? [P('P11'), P('P07'), P('P12')] : list;

  const body = `${pageHd(none ? '찜한 상품' : `찜한 상품 <span class="muted" style="font-size:18px;font-weight:400">${list.length}개</span>`,
    none ? '' : '가격이 내려가거나 마감이 가까워지면 알려드려요',
    none ? '' : `<div class="btns"><button class="btn btn-ghost" type="button" data-toast="3개 항목을 선택했어요">선택 삭제</button>
      <button class="btn btn-danger" type="button" data-modal="m-clear">전체 비우기</button></div>`)}

  ${none ? `<div class="card">${empty('♡', '아직 찜한 상품이 없어요',
    '마음에 드는 상품의 <b>하트</b>를 눌러보세요. 가격이 내려가면 알려드릴게요.',
    `<a class="btn btn-primary" href="${link('PR0101')}">인기 상품 둘러보기</a>`)}</div>
    ${sec('추천 상품', `<div class="g4">${pcards([P('P02'), P('P01'), P('P10'), P('P12')])}</div>`)}
    ${sec('최근 본 상품', `<div class="carousel">${pcards([P('P04'), P('P06'), P('P03'), P('P13'), P('P07')], { noHeart: true })}</div>`)}`
      : `
  <div class="row-b wrap-row mb4">
    <div class="chips">${U.chip('뉴욕', false)}${U.chip('파리', false)}${U.chip('투어', false)}${U.chip('입장권', false)}${U.chip('예약 가능한 것만', false)}${priceDown ? U.chip('가격 인하만', true) : ''}</div>
    <select class="select" style="width:auto"><option>담은 순</option><option>낮은 가격순</option><option>할인율순</option></select>
  </div>

  ${priceDown
        ? banner('ok', '↓', `찜한 상품 중 <b>3개</b> 의 가격이 내려갔어요. 인하 상품만 모아서 보여드립니다.`, {
          cls: 'mb4',
          right: `<div class="row-c"><span class="t-sub">가격 알림</span><button class="toggle on" type="button" aria-label="가격 알림"></button></div>`,
        })
        : `<div class="box row-b wrap-row mb4"><div><b>가격이 내려가면 알려드릴게요</b>
        <p class="t-sub mt1">찜한 상품의 가격이 3% 이상 내려가면 카카오톡으로 알림을 보냅니다.</p></div>
      <button class="toggle on" type="button" aria-label="가격 알림 켜기"></button></div>`}

  ${priceDown ? `<div class="card mb6"><div class="card-hd"><h3 class="t-card">수신 채널</h3></div><div class="card-bd">
      <div class="g3 g1-m">
        <label class="check"><input type="checkbox" checked><span>카카오톡 <span class="sub">010-****-1234</span></span></label>
        <label class="check"><input type="checkbox" checked><span>이메일 <span class="sub">kim****@gmail.com</span></span></label>
        <label class="check"><input type="checkbox"><span>앱 푸시 <span class="sub">앱 설치 필요</span></span></label>
      </div></div></div>` : ''}

  <div class="g4">${down.map((p, i) => {
          const isOut = !priceDown && (i === 4 || i === 8);
          const isDown = priceDown || i === 0 || i === 2;
          return pcard(p, {
            faved: true, dim: isOut, soldout: isOut,
            ribbon: isOut ? badge('예약 마감', 'b-mut') : (isDown ? badge('가격 인하', 'b-danger') : ''),
            href: isOut ? 'PR0601' : 'PR0201',
            note: isOut ? `<div class="t-sub"><span class="pri strong">비슷한 상품 보기 ›</span></div>`
              : (isDown ? `<div class="t-sub"><b class="danger">5,000원 내려갔어요</b> · 담을 때 ${won(p.price + 5000)}</div>` : ''),
          });
        }).join('')}</div>

  <div class="card mt6"><div class="card-bd">
    <p class="t-sub mb3">카드마다 아래 동작을 바로 할 수 있어요.</p>
    <div class="btns"><a class="btn btn-primary btn-sm" href="${link('PR0301')}">날짜 선택</a>
      <a class="btn btn-ghost btn-sm" href="${link('CT0101')}">장바구니 담기</a>
      <a class="btn btn-ghost btn-sm" href="${link('PR0501')}">비교에 추가</a>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="찜을 해제했어요" data-toast-act="되돌리기">찜 해제</button></div>
  </div></div>`}

  ${U.modalTpl('m-clear', '찜한 상품을 모두 비울까요?',
        `<p>${list.length}개 상품이 목록에서 사라져요. 되돌릴 수 없습니다.</p>`,
        `<button class="btn btn-ghost" type="button" data-dismiss>취소</button><button class="btn btn-primary" type="button" data-dismiss>전체 비우기</button>`)}`;

  return {
    body, o: {
      cart: 2,
      state: priceDown ? '가격 인하 알림 — 이전가 비교와 수신 채널 설정' : none ? '찜 비어 있음 — 하트 사용법과 추천 상품' : '',
    },
  };
}
