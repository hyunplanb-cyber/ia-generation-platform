/* 내 예약(MY) · 리뷰(RV) */
import {
  ph, phFix, phAva, map, esc, won, num, min2h, link, stars, rateLine, badge, stBadge, btn, chip, chips, tabs,
  sec, card, banner, empty, table, kv, sumRows, accordion, stat, progress, hsteps, modalEl, modalTpl,
  rateSummary, review, rateIn, calendar, slots, shopRow, dzCard, menuRow, pageHd, stickBar, myNav,
} from './ui.mjs';
import { SHOPS, DESIGNERS, ALL_ITEMS, REVIEWS, RATE_DIST, RATE_ITEMS, COUPONS } from './data.mjs';

const S = SHOPS;
const shop = S[0];

/* ============================================================
   MY0101 — 내 예약 (예정/완료/취소)
   ============================================================ */
const bkCard = (o) => `<div class="hcard ${o.cls || ''}">
  ${phFix(['매장 대표', 1200, 900], 132, { seed: o.seed || o.shop })}
  <div class="grow">
    <div class="row-c wrap-row mb2">${o.dday ? badge(o.dday, 'b-pri') : ''}${stBadge(o.st)}${o.extra || ''}</div>
    <div class="t-card" style="font-size:17px">${o.shop}</div>
    <p class="t-sub mt1">${o.menu} · ${o.dz}</p>
    <p class="mt2"><b>${o.at}</b> <span class="t-sub">${o.min ? `· 약 ${min2h(o.min)}` : ''}</span></p>
    ${o.note || ''}
  </div>
  <div class="none" style="min-width:150px">
    <div class="right"><div class="t-sub">${o.priceLabel || '현장 결제 예정'}</div><div class="price">${won(o.price)}</div></div>
    <div class="btns mt3" style="justify-content:flex-end">${o.btns}</div>
  </div></div>`;

const MY_TABS = (i) => tabs([
  { label: '예정', cnt: 2, go: 'MY0101' }, { label: '완료', cnt: 8, go: 'MY0102' }, { label: '취소', cnt: 3, go: 'MY0103' },
], i);

export function MY0101(ctx) {
  const soon = bkCard({
    shop: shop.nm, seed: 'S01', menu: '발레아쥬 · 모발 클리닉', dz: '김수현 원장', at: '2026.09.12(토) 14:00',
    min: 225, st: '확정', dday: 'D-8', price: 218900,
    btns: `${btn('변경', { cls: 'btn-ghost btn-sm', href: 'MY0401' })}${btn('취소', { cls: 'btn-ghost btn-sm', href: 'MY0501' })}${btn('상세', { cls: 'btn-soft btn-sm', href: 'MY0301' })}`,
    note: '<p class="t-sub mt2">9월 11일 18:00까지 무료 취소</p>',
  });
  const pending = bkCard({
    shop: S[1].nm, seed: 'S02', menu: '젤 아트(2P)', dz: '박지은 실장', at: '2026.09.18(금) 19:00',
    min: 90, st: '접수 대기', dday: 'D-14', price: 42000,
    btns: `${btn('취소', { cls: 'btn-ghost btn-sm', href: 'MY0501' })}${btn('상세', { cls: 'btn-soft btn-sm', href: 'MY0302' })}`,
    note: '<p class="t-sub mt2">매장이 확인하면 알려드려요 (오늘 21:00까지)</p>',
  });

  if (ctx.id === 'MY0102') {
    const done = [
      { shop: S[2].nm, seed: 'S03', menu: '볼륨 매직', dz: '김수현 원장', at: '2026.08.05(수) 11:00', st: '완료', price: 120000, rv: true },
      { shop: S[1].nm, seed: 'S02', menu: '젤 원컬러', dz: '박지은 실장', at: '2026.07.24(금) 15:00', st: '완료', price: 38000, rv: true },
      { shop: S[0].nm, seed: 'S01', menu: '발레아쥬', dz: '김수현 원장', at: '2026.06.20(토) 13:00', st: '완료', price: 165000, rv: false },
    ];
    return {
      body: `${pageHd('내 예약')}${MY_TABS(1)}
        <div class="col gap6">${done.map((d) => bkCard({
          ...d, priceLabel: '결제 금액',
          extra: d.rv ? badge('리뷰 미작성', 'b-acc') : badge('리뷰 완료', 'b-mut'),
          btns: `${d.rv ? btn('리뷰 쓰기', { cls: 'btn-primary btn-sm', href: 'RV0101' }) : btn('내 리뷰', { cls: 'btn-ghost btn-sm', href: 'RV0301' })}
            ${btn('영수증', { cls: 'btn-ghost btn-sm', attr: ' data-toast="영수증을 새 창에서 보여드려요"' })}${btn('재예약', { cls: 'btn-soft btn-sm', href: 'RE0101' })}`,
          note: '<p class="t-sub mt2">사용 제품: 웰라 코렉션 8/1 · 올라플렉스 3단계</p>',
        })).join('')}</div>`,
      o: { state: '완료 탭', logged: true },
    };
  }

  if (ctx.id === 'MY0103') {
    const cancels = [
      { shop: S[4].nm, seed: 'S05', menu: '눈썹 왁싱', dz: '이도윤 디자이너', at: '2026.07.22(수) 20:00', st: '취소', price: 20000, why: '내가 취소 · 일정 변경', refund: '전액 환불 완료 (7/20)' },
      { shop: S[3].nm, seed: 'S04', menu: '피부 관리 60분', dz: '지정 안 함', at: '2026.06.11(수) 18:00', st: '취소', price: 55000, why: '매장 사정 취소', refund: '전액 환불 완료 (6/10)' },
      { shop: S[5].nm, seed: 'S06', menu: '속눈썹 연장', dz: '최민서 디자이너', at: '2026.05.02(토) 16:00', st: '노쇼', price: 45000, why: '연락 없이 미방문', refund: '예약금 미환불' },
    ];
    return {
      body: `${pageHd('내 예약')}${MY_TABS(2)}
        ${banner('mut', 'ℹ️', '노쇼가 누적되면 일정 기간 예약이 제한돼요. 못 가실 것 같으면 미리 취소해 주세요.', { cls: 'mb6' })}
        <div class="col gap6">${cancels.map((d) => bkCard({
          ...d, priceLabel: '결제 금액', cls: d.st === '노쇼' ? 'is-alert' : '',
          note: `<p class="t-sub mt2">${d.why} · ${d.refund}${d.st === '노쇼' ? ' · <span class="danger">제한 해제 6월 1일</span>' : ''}</p>`,
          btns: `${btn('재예약', { cls: 'btn-soft btn-sm', href: 'RE0101' })}${btn('환불 문의', { cls: 'btn-ghost btn-sm', attr: ' data-toast="고객센터 1600-0000 으로 연결합니다"' })}`,
        })).join('')}</div>`,
      o: { state: '취소 탭', logged: true },
    };
  }

  if (ctx.id === 'MY0104') {
    const closed = bkCard({
      shop: shop.nm, seed: 'S01', menu: '발레아쥬 · 모발 클리닉', dz: '김수현 원장', at: '2026.09.12(토) 14:00',
      min: 225, st: '확정', dday: 'D-1', price: 218900, cls: 'is-alert',
      extra: badge('취소 마감', 'b-mut'),
      note: `<p class="t-sub mt2 danger">취소 마감: 9월 11일 18:00 (지남) · 지금은 <b>변경 요청만</b> 할 수 있어요</p>
        <p class="t-sub mt1">연락 없이 안 가시면 노쇼로 기록되고 30일간 예약이 제한돼요.</p>`,
      btns: `${btn('변경 요청', { cls: 'btn-ghost btn-sm', href: 'MY0401' })}
        <button class="btn btn-ghost btn-sm is-off" type="button" disabled title="취소 마감 시간이 지났어요">취소</button>
        ${btn('매장 전화', { cls: 'btn-soft btn-sm', href: 'MY0602' })}`,
    });
    return { body: `${pageHd('내 예약')}${MY_TABS(0)}<div class="col gap6">${closed}${pending}</div>`, o: { state: '취소 마감 지난 카드', logged: true } };
  }

  return { body: `${pageHd('내 예약')}${MY_TABS(0)}<div class="col gap6">${soon}${pending}</div>`, o: { logged: true } };
}
export const MY0102 = MY0101, MY0103 = MY0101, MY0104 = MY0101;

/* ============================================================
   MY0201 — 내 예약 비어 있음
   ============================================================ */
export function MY0201(ctx) {
  if (ctx.id === 'MY0202') {
    return {
      body: `${pageHd('내 예약')}${MY_TABS(0)}
        ${banner('danger', '🚫', `<b>노쇼가 2회 쌓여 9월 30일까지 예약할 수 없어요.</b>
          <div class="t-sub mt1">연락 없이 방문하지 않은 예약이 2건 있었어요. 남은 기간은 <b>26일</b>입니다.</div>`,
          { cls: 'mb6', right: btn('이의 신청', { cls: 'btn-soft', attr: ' data-toast="고객센터 1600-0000 으로 연결합니다"' }) })}
        ${card('예약이 제한된 이유', table(['날짜', '매장', '시술', '사유'], [
          ['2026.08.28', S[5].nm, '속눈썹 연장', '연락 없이 미방문'],
          ['2026.07.14', S[3].nm, '피부 관리 60분', '연락 없이 미방문'],
        ], { fix: false }))}
        <div class="card mt6"><div class="card-bd">${empty('⏳', '9월 30일부터 다시 예약할 수 있어요',
          '그동안 매장을 둘러보거나 관심 매장에 담아두실 수 있어요.',
          btn('매장 둘러보기', { cls: 'btn-ghost btn-lg', href: 'SE0101' }))}</div></div>`,
      o: { state: '예약 제한 상태', logged: true },
    };
  }

  return {
    body: `${pageHd('내 예약')}${MY_TABS(0)}
      <div class="card mb8"><div class="card-bd">${empty('💇‍♀️', '예정된 예약이 없어요',
        '오늘 바로 갈 수 있는 매장도 많아요. 지역과 시술만 고르면 빈 자리를 보여드릴게요.',
        btn('매장 둘러보기', { cls: 'btn-primary btn-lg', href: 'SE0101' }))}</div></div>
      ${sec('최근 본 매장', `<div class="g4 g1-m">${S.slice(0, 4).map((x) =>
        `<a class="scard" href="${link('SE0401')}">${ph(['매장 대표', 1200, 900], { seed: x.id + 'r', cls: 'ph-flat' })}
          <div class="bd"><div class="nm">${x.nm}</div><div class="meta">${x.area}</div>
            <div class="foot"><span class="price">${won(x.from)}~</span></div></div></a>`).join('')}</div>`)}
      ${banner('acc', '🎟️', '<b>첫 예약 20% 할인 쿠폰</b>이 아직 남아 있어요 · 9월 30일까지', { right: btn('쿠폰함 보기', { cls: 'btn-soft', href: 'AC0201' }) })}`,
    o: { logged: true },
  };
}
export const MY0202 = MY0201;

/* ============================================================
   MY0301 — 예약 상세
   ============================================================ */
export function MY0301(ctx) {
  const steps = (i, list) => card('진행 상태', hsteps(list || ['접수', '확정', '방문 예정', '완료'], i));

  const content = (o = {}) => card('예약 내용', `
    ${shopRow(shop, { sub: `${shop.area} · 02-000-0000`, right: btn('매장 상세', { cls: 'btn-ghost btn-sm', href: 'SE0401' }) })}
    <div class="hr"></div>
    ${[['발레아쥬', 180, 165000], ['모발 클리닉', 45, 55000]].map(([nm, m, p]) =>
      `<div class="row-b" style="padding:8px 0"><span><b>${nm}</b> <span class="t-sub">약 ${min2h(m)}</span></span><span>${won(p)}</span></div>`).join('')}
    <div class="row-b" style="padding:8px 0"><span class="t-sub">옵션 — 중단발 · 포인트 2개</span><span>+23,000원</span></div>
    <div class="hr"></div>
    ${kv([['담당 디자이너', '김수현 원장'], ['예약 일시', `<b>${o.at || '2026.09.12(토) 14:00 ~ 17:45'}</b>`], ['총 소요시간', '약 3시간 45분']])}
    <div class="box mt4"><div class="t-sub mb2">요청사항</div>앞머리는 짧게, 뿌리는 어둡게 부탁드려요.</div>`);

  const pay = card('결제 내역', `${sumRows([
    ['시술 금액', '220,000원'], ['옵션 추가', '+23,000원'], ['지명료', '+10,000원'],
    ['쿠폰 할인', '-10,000원', 'minus'], ['적립금 사용', '-4,100원', 'minus'],
  ], ['총 금액', '238,900원'])}
    <div class="hr"></div>
    <div class="sum-row"><span>예약금 <span class="badge b-ok">결제 완료</span></span><span><b>20,000원</b></span></div>
    <div class="sum-row sub"><span>방문해서 결제할 금액</span><span>218,900원</span></div>
    <p class="hint mt3">신한카드 1234 · 2026.09.04 21:12 결제</p>`);

  const contact = card('매장 연락 · 오시는 길', `${map([{ x: 50, y: 45, nm: shop.nm, free: true, on: true }], { cls: 'map-sm', lb: '지도 영역 (매장 위치 · 권장 800×400)' })}
    <p class="mt3"><b>서울 강남구 신사동 123-4 2층</b></p>
    <div class="btns mt3">${btn('길찾기', { cls: 'btn-primary', attr: ' data-toast="지도 앱 연결은 개발이 필요한 기능이에요"' })}
      ${btn('매장 전화', { cls: 'btn-ghost', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}</div>`);

  const head = (no, st) => `<div class="row-b wrap-row mb6"><div>
    <p class="t-sub">예약번호 ${no} <button class="btn-link" type="button" data-toast="예약번호를 복사했어요">복사</button></p>
    <h1 class="t-page mt1">${shop.nm}</h1></div>${stBadge(st)}</div>`;

  if (ctx.id === 'MY0302') {
    return {
      body: `${head('BK-20260918-0092', '접수 대기')}
        ${banner('warn', '⏱️', '<b>매장이 확인하는 중이에요.</b><div class="t-sub mt1">오늘 21:00까지 답이 없으면 예약은 자동 취소되고 예약금 10,000원이 바로 환불돼요. (남은 시간 <b data-count="5400">1:30:00</b>)</div>', { cls: 'mb6' })}
        <div class="split-r"><div class="col gap6">${steps(0)}${content({ at: '2026.09.18(금) 19:00 ~ 20:30' })}${pay}${contact}</div>
        <div class="sticky">${card('할 수 있는 일', `<div class="btns" style="flex-direction:column">
          ${btn('매장에 문의하기', { cls: 'btn-ghost btn-block', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}
          ${btn('예약 요청 철회', { cls: 'btn-danger btn-block', href: 'MY0501' })}</div>
          <p class="hint mt3">아직 확정 전이라 수수료 없이 철회할 수 있어요.</p>`)}</div></div>`,
      o: { state: '매장 확인 대기', logged: true },
    };
  }

  if (ctx.id === 'MY0303') {
    return {
      body: `${head('BK-20260502-0771', '노쇼')}
        ${banner('danger', '🚫', `<b>이 예약은 노쇼로 기록됐어요. (처리 2026.05.02 17:20)</b>
          <div class="t-sub mt1">예약금 45,000원은 환불되지 않고 매장으로 정산됐어요. 5월 2일부터 30일간 예약이 제한됩니다.</div>`, { cls: 'mb6' })}
        <div class="split-r"><div class="col gap6">
          ${steps(3, ['접수', '확정', '방문 예정', '노쇼'])}
          ${content({ at: '2026.05.02(토) 16:00 ~ 17:30' })}
          ${card('결제 내역', `<div class="sum-row"><span>예약금</span><span>45,000원</span></div>
            <div class="sum-row"><span>환불</span><span class="danger">환불 없음 (노쇼)</span></div>`)}
        </div>
        <div class="sticky">${card('사실과 다른가요?', `<p class="t-sub">방문하셨는데 노쇼로 잘못 기록됐다면 이의 신청을 해주세요. 매장 확인 후 24시간 안에 철회될 수 있어요.</p>
          <div class="btns mt4" style="flex-direction:column">
            ${btn('이의 신청하기', { cls: 'btn-primary btn-block', attr: ' data-toast="이의 신청이 접수됐어요. 2영업일 안에 답을 드려요" data-toast-kind="ok"' })}
            ${btn('매장 전화', { cls: 'btn-ghost btn-block', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}</div>`)}</div></div>`,
      o: { state: '노쇼 처리됨', logged: true },
    };
  }

  if (ctx.id === 'MY0304') {
    return {
      body: `${head('BK-20260912-0417', '변경 요청 중')}
        ${banner('acc', '🔄', '<b>변경을 요청했어요. 매장이 확인하는 중입니다.</b><div class="t-sub mt1">9월 6일 18:00까지 답이 없으면 요청은 자동 취소되고 원래 예약이 유지돼요.</div>', { cls: 'mb6' })}
        <div class="split-r"><div class="col gap6">
          ${card('무엇이 바뀌나요', `<div class="g2 g1-m">
            <div class="box"><div class="t-sub mb2">지금 예약</div><b>9월 12일(토) 14:00</b><p class="t-sub mt1">김수현 원장 · 238,900원</p></div>
            <div class="box-pri"><div class="t-sub mb2">요청한 예약</div><b>9월 16일(수) 14:00</b><p class="t-sub mt1">김수현 원장 · 238,900원</p></div>
          </div>
          <p class="hint mt3">금액 차이가 없어 추가 결제나 환불은 없어요.</p>`)}
          ${content()}${pay}
        </div>
        <div class="sticky">${card('할 수 있는 일', `<div class="btns" style="flex-direction:column">
          ${btn('변경 요청 철회', { cls: 'btn-ghost btn-block', attr: ' data-toast="변경 요청을 철회했어요. 원래 예약이 그대로 유지돼요"' })}
          ${btn('매장에 문의', { cls: 'btn-ghost btn-block', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}</div>
          <p class="hint mt3">매장이 승인하면 알림을 보내드려요.</p>`)}</div></div>`,
      o: { state: '변경 요청 중', logged: true },
    };
  }

  return {
    body: `${head('BK-20260912-0417', '확정')}
      <div class="split-r"><div class="col gap6">${steps(2)}${content()}${pay}${contact}</div>
      <div class="sticky">
        ${card('취소·변경 안내', `${banner('pri', '🕒', '<b class="hl">9월 11일 18시까지 무료 취소</b>')}
          <p class="hint mt3">그 이후 취소하면 예약금 20,000원의 50%인 10,000원이 차감돼요.</p>
          <div class="btns mt4" style="flex-direction:column">
            ${btn('예약 변경', { cls: 'btn-ghost btn-block', href: 'MY0401' })}
            ${btn('예약 취소', { cls: 'btn-danger btn-block', href: 'MY0501' })}</div>`)}
        <div class="mt4">${card('방문 후', `<p class="t-sub">시술이 끝나면 리뷰를 남겨주세요. 사진을 올리면 적립금 2,000원을 드려요.</p>
          <div class="btns mt3">${btn('리뷰 쓰기', { cls: 'btn-soft btn-block', href: 'RV0101' })}</div>`)}</div>
      </div></div>`,
    o: { logged: true },
  };
}
export const MY0302 = MY0301, MY0303 = MY0301, MY0304 = MY0301;

/* ============================================================
   MY0401 — 예약 변경
   ============================================================ */
export function MY0401(ctx) {
  const now = card('지금 예약', `${kv([['매장', shop.nm], ['시술', '발레아쥬 · 모발 클리닉'], ['담당', '김수현 원장'],
    ['일시', '<b>2026.09.12(토) 14:00 ~ 17:45</b>'], ['결제', '예약금 20,000원 결제 완료']])}`, { cls: 'box-mut' });

  const dzPick = card('담당 디자이너', `<div class="radio-list">
    ${DESIGNERS.slice(0, 3).map((d, i) => `<label class="radio${i === 0 ? ' on' : ''}${d.off ? ' is-off' : ''}" data-group="mdz">
      <input type="radio" name="mdz"${i === 0 ? ' checked' : ''}>
      <span class="grow"><b>${d.nm} ${d.rank}</b> ${i === 0 ? badge('현재', 'b-pri') : ''}
        <span class="t-sub" style="display:block">지명료 ${d.fee ? won(d.fee) : '없음'} · ${d.tags.join(' · ')}</span></span></label>`).join('')}
  </div>`);

  if (ctx.id === 'MY0402') {
    return {
      body: `${pageHd('예약 변경')}
        <div class="split-r"><div class="col gap6">${now}
          ${card('바꿀 날짜·시간', `<div class="g2 g1-m">${calendar({ sel: 16 })}
            <div>${slots({ sel: '11:00', needMin: 225 })}</div></div>`)}
          ${card('담당 디자이너', `<div class="radio-list">
            <label class="radio" data-group="mdz2"><input type="radio" name="mdz2"><span class="grow"><b>김수현 원장</b> ${badge('현재', 'b-mut')}<span class="t-sub" style="display:block">지명료 10,000원</span></span></label>
            <label class="radio on" data-group="mdz2"><input type="radio" name="mdz2" checked><span class="grow"><b>박지은 실장</b> ${badge('바꿀 담당', 'b-pri')}<span class="t-sub" style="display:block">지명료 5,000원</span></span></label>
          </div>`)}
        </div>
        <div class="sticky">
          ${card('금액이 이렇게 달라져요', `
            ${table(['항목', '지금', '바꾼 뒤'], [
              ['시술 금액', '243,000원', '243,000원'],
              { cells: ['지명료', '10,000원', '<b class="pri">5,000원</b>'], cls: 'is-diff' },
              ['할인', '-14,100원', '-14,100원'],
            ], { scroll: false, foot: ['합계', '238,900원', '<b>233,900원</b>'] })}
            <div class="box-ok mt4"><div class="row-b"><b>돌려받을 금액</b><b class="price">5,000원</b></div>
              <p class="t-sub mt2">예약금에서 차액이 생기지 않아 <b>방문 시 결제 금액</b>이 5,000원 줄어듭니다. 따로 환불 절차는 없어요.</p></div>
            <div class="box mt3"><div class="t-sub mb2">추가 결제가 필요한 경우</div>
              <p class="t-sub">바꾼 예약이 더 비싸면 차액만 카드로 결제하고, 환불이 생기면 결제 수단으로 3~5영업일 안에 돌려드려요.</p></div>
            <div class="btns mt4">${btn('이대로 변경 요청', { cls: 'btn-primary btn-block btn-lg', href: 'MY0301' })}</div>`)}
        </div></div>`,
      o: { state: '차액 결제·환불', logged: true },
    };
  }

  if (ctx.id === 'MY0403') {
    return {
      body: `${pageHd('예약 변경')}
        ${banner('warn', '🔁', `<b>변경 가능 횟수(2회)를 모두 쓰셨어요.</b>
          <div class="t-sub mt1">8월 30일과 9월 3일에 한 번씩 바꾸셨어요. 더 바꾸시려면 취소한 뒤 다시 예약하셔야 해요.</div>`, { cls: 'mb6' })}
        <div class="split-r"><div class="col gap6">${now}
          <div class="is-readonly">${card('바꿀 날짜·시간', `<div class="g2 g1-m">${calendar({ sel: -1 })}<div>${slots({ sel: '' })}</div></div>`)}</div>
        </div>
        <div class="sticky">${card('이제 어떻게 하나요', `
          <p class="t-sub">취소 후 다시 예약하실 수 있어요. 다만 지금은 무료 취소 기한 안이라 <b>수수료 없이</b> 취소됩니다.</p>
          <div class="box mt3"><div class="sum-row"><span>돌려받는 예약금</span><b>20,000원</b></div>
            <div class="sum-row sub"><span>수수료</span><span>0원 (무료 취소 기한 내)</span></div></div>
          <div class="btns mt4" style="flex-direction:column">
            ${btn('취소하고 다시 예약', { cls: 'btn-primary btn-block', href: 'MY0501' })}
            ${btn('매장에 직접 문의', { cls: 'btn-ghost btn-block', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}</div>`)}</div></div>`,
      o: { state: '변경 횟수 소진', logged: true },
    };
  }

  return {
    body: `${pageHd('예약 변경', '날짜·시간과 담당 디자이너를 바꿀 수 있어요')}
      <div class="split-r"><div class="col gap6">${now}
        ${card('바꿀 날짜·시간', `<div class="g2 g1-m">${calendar({ sel: 16 })}
          <div>${slots({ sel: '14:00', needMin: 225 })}
            <div class="box mt4"><div class="row-b"><span class="t-sub">고른 시간</span><b>9월 16일(수) 14:00 ~ 17:45</b></div></div></div></div>`)}
        ${dzPick}
      </div>
      <div class="sticky">${card('변경 안내', `
        ${kv([['바꾸는 날짜', '<b>9월 16일(수) 14:00</b>'], ['담당', '김수현 원장 (그대로)'], ['금액 차이', '없음']])}
        <div class="hr"></div>
        <ul class="col" style="gap:8px;font-size:14px">
          <li>· <b class="hl">변경은 1회 더 가능</b>해요 (2회 중 1회 사용)</li>
          <li>· 매장이 확인한 뒤 확정돼요. 보통 2시간 안에 답이 옵니다</li>
          <li>· 확정 전까지 원래 예약이 그대로 유지돼요</li></ul>
        <div class="btns mt4">${btn('변경 요청하기', { cls: 'btn-primary btn-block btn-lg', href: 'MY0301' })}</div>
        <p class="center mt3"><a class="btn-link" href="${link('MY0601')}">변경 기한이 지났나요?</a></p>`)}</div></div>`,
    o: { logged: true },
  };
}
export const MY0402 = MY0401, MY0403 = MY0401;

/* ============================================================
   MY0501 — 예약 취소 확인 (모달)
   ============================================================ */
export function MY0501(ctx) {
  const back = `${pageHd('예약 상세')}<div class="split-r"><div class="col gap6">
    ${card('예약 내용', kv([['매장', shop.nm], ['시술', '발레아쥬 · 모발 클리닉'], ['담당', '김수현 원장'], ['일시', '<b>2026.09.12(토) 14:00</b>']]))}
  </div><div class="sticky">${card('결제', sumRows([['총 금액', '238,900원'], ['예약금 결제', '20,000원']]))}</div></div>`;

  const reasons = `<div class="field"><div class="label">취소 사유 <span class="req">*</span></div>
    <div class="radio-list">
      <label class="radio on" data-group="rs"><input type="radio" name="rs" checked><span class="grow">일정이 바뀌었어요</span></label>
      <label class="radio" data-group="rs"><input type="radio" name="rs"><span class="grow">단순 변심이에요</span></label>
      <label class="radio" data-group="rs"><input type="radio" name="rs"><span class="grow">매장 사정으로 못 가게 됐어요</span></label>
      <label class="radio" data-group="rs"><input type="radio" name="rs"><span class="grow">기타</span></label>
    </div></div>`;

  if (ctx.id === 'MY0502') {
    const modal = modalEl('정말 취소하시겠어요?',
      `${banner('warn', '⏰', '<b>무료 취소 기한(9월 11일 18:00)이 지났어요.</b><div class="t-sub mt1">지금 취소하면 예약금의 50%가 수수료로 차감돼요.</div>')}
       <div class="box mt4">${sumRows([
         ['결제한 예약금', '20,000원'],
         ['취소 수수료 (50%)', '-10,000원', 'minus'],
       ], ['돌려받는 금액', '10,000원'])}
       <p class="hint mt3">환불은 결제하신 신한카드로 3~5영업일 안에 처리돼요.</p></div>
       ${reasons}
       <div class="box-pri mt4"><b>혹시 시간만 바꾸면 될까요?</b>
         <p class="t-sub mt1">변경은 수수료 없이 1회 더 할 수 있어요.</p>
         <div class="btns mt3">${btn('시간만 바꾸기', { cls: 'btn-soft btn-sm', href: 'MY0401' })}</div></div>
       <label class="check mt4"><input type="checkbox" data-unlock="cx-btn2"><span><b>수수료 10,000원이 차감되는 것을 확인했고, 취소하면 되돌릴 수 없다는 것을 이해했어요</b></span></label>`,
      `${btn('예약 유지하기', { cls: 'btn-ghost', href: 'MY0301' })}
       <button class="btn btn-danger is-off" type="button" id="cx-btn2" disabled>10,000원 환불받고 취소</button>`,
      { lg: true });
    return { body: back, o: { state: '수수료 발생 취소', after: modal, logged: true } };
  }

  const modal = modalEl('정말 취소하시겠어요?',
    `${card('', `${kv([['매장', shop.nm], ['시술', '발레아쥬 · 모발 클리닉'], ['일시', '<b>9월 12일(토) 14:00</b>']])}`, { cls: 'box-mut' })}
     ${reasons}
     <div class="box mt4">${sumRows([
       ['결제한 예약금', '20,000원'],
       ['취소 수수료', '0원 <span class="t-sub">(무료 취소 기한 안)</span>'],
     ], ['돌려받는 금액', '20,000원'])}
     <p class="hint mt3">환불은 결제하신 신한카드로 3~5영업일 안에 처리돼요.</p></div>
     ${banner('danger', '⚠️', '<b>취소 후에는 되돌릴 수 없어요.</b><div class="t-sub mt1">같은 시간을 다시 잡지 못할 수 있어요.</div>', { cls: 'mt4' })}
     ${banner('mut', 'ℹ️', '<b>취소와 노쇼는 달라요.</b> 미리 취소하면 아무 불이익이 없지만, 연락 없이 안 가시면 노쇼로 기록돼 30일간 예약이 제한돼요.', { cls: 'mt3' })}
     <label class="check mt4"><input type="checkbox" data-unlock="cx-btn"><span><b>위 내용을 확인했고, 예약을 취소합니다</b></span></label>`,
    `${btn('예약 유지하기', { cls: 'btn-ghost', href: 'MY0301' })}
     <button class="btn btn-danger is-off" type="button" id="cx-btn" disabled>예약 취소하기</button>`,
    { lg: true });

  return { body: back, o: { after: modal, logged: true } };
}
export const MY0502 = MY0501;

/* ============================================================
   MY0601 — 변경·취소 마감됨
   ============================================================ */
export function MY0601(ctx) {
  if (ctx.id === 'MY0602') {
    return {
      body: `${pageHd('매장에 연락하기')}
        <div class="wrap-narrow" style="padding:0">
          ${card(shop.nm, `
            <div class="center" style="padding:16px 0"><div class="price-lg">02-000-0000</div>
              <p class="t-sub mt2">지금 영업 중 · 오늘 21:00까지</p>
              <div class="btns mt4" style="justify-content:center">${btn('📞 지금 전화 걸기', { cls: 'btn-primary btn-lg', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}</div></div>
            <div class="hr"></div>
            ${kv([['영업시간', '화~금 11:00~21:00 · 토·일 10:00~19:00'], ['정기 휴무', '매주 월요일'], ['주소', '서울 강남구 신사동 123-4 2층']])}`)}
          <div class="mt6">${card('영업이 끝났다면', `<p class="t-sub mb3">메시지를 남기면 매장이 다음 영업일에 확인해요.</p>
            <textarea class="textarea" placeholder="예: 9월 12일 14시 예약인데 갑자기 일이 생겨 못 갈 것 같습니다. 확인 부탁드립니다.">9월 12일 14시 예약인데 일정이 생겨 방문이 어려울 것 같습니다. 확인 부탁드립니다.</textarea>
            <div class="btns mt3">${btn('메시지 남기기', { cls: 'btn-soft btn-block', attr: ' data-toast="메시지를 남겼어요. 매장이 확인하면 알려드릴게요" data-toast-kind="ok"' })}</div>`)}</div>
          ${banner('mut', 'ℹ️', '기한이 지난 뒤의 변경·취소는 <b>매장이 정합니다.</b> 연락하셔도 처리되지 않을 수 있어요.', { cls: 'mt4' })}
          <p class="center mt6"><a class="btn-link" href="${link('MY0301')}">예약 상세로 돌아가기</a></p>
        </div>`,
      o: { state: '매장 연락 안내', logged: true },
    };
  }

  return {
    body: `${pageHd('예약 변경·취소')}
      ${banner('mut', '🔒', '<b>변경·취소 가능 시간이 지났어요 (마감: 9월 11일 18:00)</b><div class="t-sub mt1">지금부터는 앱에서 바꾸거나 취소할 수 없어요.</div>', { cls: 'mb6' })}
      <div class="split-r"><div class="col gap6">
        ${card('예약 내용', kv([['매장', shop.nm], ['시술', '발레아쥬 · 모발 클리닉'], ['담당', '김수현 원장'],
          ['일시', '<b>2026.09.12(토) 14:00 ~ 17:45</b>'], ['결제', '예약금 20,000원 결제 완료 · 현장 218,900원']]), { cls: 'box-mut' })}
        <div class="is-readonly">${card('바꿀 날짜·시간', `<div class="g2 g1-m">${calendar({ sel: -1 })}<div>${slots({ sel: '' })}</div></div>`)}</div>
      </div>
      <div class="sticky">${card('이제 어떻게 하나요', `
        ${banner('warn', '⚠️', '방문하지 않으면 <b>노쇼로 기록</b>되어 예약금이 환불되지 않고 30일간 예약이 제한돼요.')}
        <p class="t-sub mt3">사정이 생기셨다면 매장에 직접 연락해 주세요. 매장 재량으로 조정될 수 있어요.</p>
        <div class="btns mt4" style="flex-direction:column">
          ${btn('📞 매장에 전화하기', { cls: 'btn-primary btn-block', href: 'MY0602' })}
          ${btn('예약 상세로 돌아가기', { cls: 'btn-ghost btn-block', href: 'MY0301' })}</div>`)}</div></div>`,
    o: { logged: true },
  };
}
export const MY0602 = MY0601;

/* ============================================================
   RV0101 — 리뷰 작성
   ============================================================ */
export function RV0101(ctx) {
  const info = card('어떤 시술이었나요', `${shopRow(S[2], {
    sub: '볼륨 매직 · 김수현 원장',
    extra: '<p class="t-sub mt1">2026.08.05(수) 방문 · 약 2시간 30분</p>',
  })}`);

  const rates = card('별점을 매겨주세요', `${rateIn('시술 만족도', 5)}${rateIn('친절도', 5)}${rateIn('청결도', 4)}`);

  const photoOk = card('시술 사진 <span class="badge b-acc">적립금 2,000원</span>', `
    <div class="row wrap-row mb3" style="gap:8px">
      ${[0, 1].map((i) => `<div style="position:relative">${phFix(['리뷰 사진', 800, 800], 96, { seed: 'up' + i })}
        <button class="heart" type="button" style="width:24px;height:24px;line-height:24px;font-size:12px;top:4px;right:4px" data-toast="사진을 뺐어요">✕</button></div>`).join('')}
    </div>
    <div class="upload"><div style="font-size:32px">📷</div>
      <p class="mt2"><b>사진을 끌어다 놓거나 눌러서 고르세요</b></p>
      <p class="t-sub mt1">최대 5장 · 장당 10MB · JPG·PNG</p></div>`);

  const bodyIn = (o = {}) => card('어떠셨나요', `
    <textarea class="textarea ${o.err ? 'is-err' : ''}" placeholder="어떤 점이 좋았는지, 어떻게 요청했는지 적어주시면 다른 분들께 큰 도움이 돼요.">${o.text || '뿌리 볼륨이 딱 원하는 만큼 살았어요. 세 시간 걸렸지만 중간에 음료도 챙겨주시고 편했습니다. 다음에도 원장님께 받으려고요.'}</textarea>
    <div class="row-b mt2"><span class="${o.err ? 'err' : 'hint'}" style="margin:0">${o.err ? '20자 이상 적어주세요' : '최소 20자'}</span>
      <span class="${o.err ? 'err' : 'hint'}" style="margin:0"><b>${o.len === undefined ? 73 : o.len}</b> / 20자</span></div>
    ${o.err ? `<div class="box mt4"><b class="t-sub">이런 걸 적어주시면 좋아요</b>
      <ul class="col mt2" style="gap:6px;font-size:14px">
        <li>· 어떤 스타일을 요청했고 어떻게 나왔는지</li>
        <li>· 상담이 충분했는지, 시간은 얼마나 걸렸는지</li>
        <li>· 다시 갈 생각이 있는지</li></ul></div>` : ''}`);

  const again = card('다시 방문할 생각이 있나요', `<div class="row" style="gap:12px">
    <label class="radio on grow" data-group="again"><input type="radio" name="again" checked><span class="grow center"><b>네, 또 갈래요</b></span></label>
    <label class="radio grow" data-group="again"><input type="radio" name="again"><span class="grow center"><b>아니요</b></span></label></div>`);

  const foot = (o = {}) => `<div class="btns mt6">${btn('임시 저장', { cls: 'btn-ghost btn-lg', attr: ' data-toast="임시 저장했어요. 30일 안에 이어서 쓸 수 있어요"' })}
    ${o.off
      ? '<button class="btn btn-primary btn-lg grow is-off" type="button" disabled>20자 이상 적어야 등록할 수 있어요</button>'
      : btn('리뷰 등록하기', { cls: 'btn-primary btn-lg grow', href: 'RV0301' })}</div>`;

  if (ctx.id === 'RV0102') {
    const err = card('시술 사진 <span class="badge b-acc">적립금 2,000원</span>', `
      ${banner('danger', '⚠️', '<b>3장 중 2장을 올리지 못했어요.</b><div class="t-sub mt1">아래에서 실패한 파일만 다시 고르시면 돼요. 성공한 사진은 그대로 남아 있어요.</div>', { cls: 'mb4' })}
      <div class="file-row is-ok">✅ <div class="grow"><b>IMG_2841.jpg</b><p class="t-sub">2.4MB · 올리기 완료</p></div>${phFix(['리뷰 사진', 800, 800], 40, { seed: 'f1' })}</div>
      <div class="file-row is-err">⚠️ <div class="grow"><b>IMG_2842.heic</b><p class="t-sub danger">HEIC 형식은 올릴 수 없어요. JPG나 PNG로 바꿔주세요.</p></div></div>
      <div class="file-row is-err">⚠️ <div class="grow"><b>IMG_2843.jpg</b><p class="t-sub danger">파일이 14.2MB예요. 10MB 아래로 줄여주세요.</p></div></div>
      <div class="btns mt3">${btn('실패한 사진만 다시 고르기', { cls: 'btn-primary', attr: ' data-toast="파일 고르기 창을 엽니다"' })}
        ${btn('그냥 1장으로 등록', { cls: 'btn-ghost', attr: ' data-toast="사진 1장으로 진행할게요"' })}</div>
      ${banner('mut', '🗜️', '10MB가 넘는 사진은 <b>자동으로 줄여서</b> 올려드릴 수도 있어요. 화질이 조금 낮아집니다.', { cls: 'mt4', right: btn('자동으로 줄이기', { cls: 'btn-soft btn-sm', attr: ' data-toast="사진을 줄여서 다시 올릴게요"' }) })}`);
    return { body: `${pageHd('리뷰 작성')}<div class="wrap-narrow" style="padding:0"><div class="col gap6">${info}${rates}${err}${bodyIn()}${again}</div>${foot()}</div>`, o: { state: '사진 첨부 오류', logged: true } };
  }

  if (ctx.id === 'RV0103') {
    return {
      body: `${pageHd('리뷰 작성')}<div class="wrap-narrow" style="padding:0"><div class="col gap6">${info}${rates}${photoOk}
        ${bodyIn({ err: true, text: '좋았어요', len: 5 })}${again}</div>
        ${banner('mut', '💾', '지금 상태로 <b>임시 저장</b>은 할 수 있어요. 나중에 이어서 쓰시면 됩니다.', { cls: 'mt4' })}
        ${foot({ off: true })}</div>`,
      o: { state: '최소 글자수 미달', logged: true },
    };
  }

  if (ctx.id === 'RV0104') {
    const modal = modalEl('쓰다 만 리뷰가 있어요',
      `<p><b>2026.08.28 21:14</b>에 저장해 둔 내용이 있어요.</p>
       <div class="box mt4"><p class="t-sub mb2">저장된 내용</p>
         <p>“뿌리 볼륨이 딱 원하는 만큼 살았어요. 세 시간 걸렸지만…”</p>
         <div class="row-c mt3">${badge('별점 3종 입력됨', 'b-line')}${badge('사진 2장', 'b-line')}</div></div>
       ${banner('mut', '📷', '첨부하셨던 사진 2장도 <b>그대로 복원</b>돼요.', { cls: 'mt3' })}`,
      `${btn('새로 쓰기', { cls: 'btn-ghost', attr: ' data-dismiss data-toast="새로 쓰기로 시작할게요"' })}${btn('이어서 쓰기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="저장해 둔 내용을 불러왔어요" data-toast-kind="ok"' })}`);
    return { body: `${pageHd('리뷰 작성')}<div class="wrap-narrow" style="padding:0"><div class="col gap6">${info}${rates}${photoOk}${bodyIn()}${again}</div>${foot()}</div>`,
      o: { state: '임시 저장 불러오기', after: modal, logged: true } };
  }

  return {
    body: `${pageHd('리뷰 작성', '남겨주신 리뷰는 다음 분들께 큰 도움이 돼요')}
      <div class="wrap-narrow" style="padding:0">
        <div class="col gap6">${info}${rates}${photoOk}${bodyIn()}${again}</div>
        ${banner('acc', '🪙', '<b>사진과 함께 올리면 적립금 2,000원</b>을 바로 드려요. 글만 쓰시면 500원입니다.', { cls: 'mt4' })}
        ${foot()}
        <p class="center mt4 t-sub">작성 기간이 지났나요? <a class="btn-link" href="${link('RV0401')}">확인하기</a></p>
      </div>`,
    o: { logged: true },
  };
}
export const RV0102 = RV0101, RV0103 = RV0101, RV0104 = RV0101;

/* ============================================================
   RV0201 — 매장 리뷰 목록
   ============================================================ */
export function RV0201(ctx) {
  const head = `<div class="row-b wrap-row mb6"><div>
    <h1 class="t-page">${shop.nm} 리뷰</h1>
    <p class="t-sub mt2">${shop.area} · ${rateLine(shop.rate, shop.rv)}</p></div>
    ${btn('매장 상세', { cls: 'btn-ghost', href: 'SE0401' })}</div>`;

  if (ctx.id === 'RV0202') {
    return {
      body: `${head}${card('', rateSummary(RATE_DIST, 4.9, 1284, RATE_ITEMS))}
        <div class="row-b wrap-row mt6 mb4">
          <div class="row-c">${chips(['사진 리뷰만', '헤어', '컬러', '네일', '케어'], 0)}
            <span class="t-sub">사진 리뷰 <b>418</b>개</span></div>
          <div class="row-c">${chips(['격자로 보기', '목록으로 보기'], 0)}</div></div>
        <div class="gal gal-6">${Array.from({ length: 24 }, (_, i) =>
          `<a href="${link('SE0602')}">${ph(['리뷰 사진', 800, 800], { seed: 'rp' + i })}</a>`).join('')}</div>
        <div class="center mt8">${btn('사진 더 보기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="다음 24장을 불러왔어요"' })}</div>`,
      o: { state: '사진 리뷰만 보기' },
    };
  }

  if (ctx.id === 'RV0203') {
    return {
      body: `${head}
        <div class="card"><div class="card-bd">${empty('✍️', '아직 리뷰가 없어요',
          '이 매장은 최근에 입점했어요. 첫 리뷰를 남기면 적립금 3,000원을 드려요.',
          `${btn('이 매장 예약하기', { cls: 'btn-primary btn-lg', href: 'RE0101' })}`)}</div></div>
        ${sec('근처 매장 리뷰 둘러보기', `<div class="mag">${S.slice(1, 3).map((x) =>
          `<a class="mcard" href="${link('RV0201')}"><div class="top">${ph(['매장 대표', 1200, 900], { seed: x.id + 'v', cls: 'ph-flat' })}
            <div class="over"><div class="tags">${badge(`리뷰 ${num(x.rv)}개`, 'hot')}</div><div class="nm">${x.nm}</div></div></div>
            <div class="bd"><div class="row-b"><span class="t-sub">${x.area}</span><span>${rateLine(x.rate, x.rv)}</span></div></div></a>`).join('')}</div>`,
          { cls: 'mt8' })}`,
      o: { state: '리뷰 없음' },
    };
  }

  return {
    body: `${head}${card('', rateSummary(RATE_DIST, 4.9, 1284, RATE_ITEMS))}
      <div class="row-b wrap-row mt6 mb4">
        ${chips(['사진 리뷰만', '헤어', '컬러', '네일', '케어'])}
        <select class="select" style="width:auto"><option>최신순</option><option>평점순</option><option>도움순</option></select></div>
      ${card('', REVIEWS.map((r) => review(r, { report: true })).join(''))}
      <div class="pager"><span>‹</span><span class="on">1</span><span class="off">2</span><span class="off">3</span><span class="off">4</span><span>›</span></div>`,
  };
}
export const RV0202 = RV0201, RV0203 = RV0201;

/* ============================================================
   RV0301 — 내 리뷰 목록
   ============================================================ */
export function RV0301(ctx) {
  const todo = card('아직 안 쓴 리뷰 <span class="badge b-acc">2건</span>', `
    ${[['볼륨 매직', S[2].nm, '2026.08.05 방문', '25일 남음'], ['젤 원컬러', S[1].nm, '2026.07.24 방문', '7일 남음']].map(([m, sh, d, left]) => `
    <div class="list-row">${phFix(['시술 결과', 1000, 1000], 64, { seed: m })}
      <div class="grow"><b>${m}</b><p class="t-sub">${sh} · ${d}</p></div>
      <div class="none row-c">${badge(left, left.startsWith('7') ? 'b-danger' : 'b-line')}${btn('리뷰 쓰기', { cls: 'btn-primary btn-sm', href: 'RV0101' })}</div></div>`).join('')}`,
    { cls: 'mb8' });

  const myRv = (o = {}) => REVIEWS.slice(0, 3).map((r, i) => `<div class="card mb4"><div class="card-bd">
    <div class="row-b wrap-row mb3">
      <div class="row-c">${badge(r.menu, 'b-line')}${r.reply ? badge('매장 답글 있음', 'b-pri') : ''}${o.late && i === 2 ? badge('수정 기한 지남', 'b-mut') : ''}</div>
      <span class="t-sub">${r.date} 작성</span></div>
    <div class="row-c mb2"><b>${['헤어랩 서초', '네일 아뜰리에 봄', '살롱 드 코랄'][i]}</b>${stars(r.rate)}</div>
    <p>${esc(r.txt)}</p>
    ${r.pics ? `<div class="row mt3" style="gap:8px">${Array.from({ length: r.pics }, (_, k) => phFix(['리뷰 사진', 800, 800], 72, { seed: r.who + k })).join('')}</div>` : ''}
    ${r.reply ? `<div class="review"><div class="reply" style="margin-left:0"><b>매장 답글</b> · ${r.replyAt}<br>${esc(r.reply)}</div></div>` : ''}
    <div class="row-b wrap-row mt4" style="border-top:1px solid var(--border);padding-top:12px">
      <div class="row-c t-sub">👍 도움이 됐어요 <b>${r.help}</b> · 적립금 <b class="pri">+2,000원</b> 지급</div>
      <div class="btns">${o.late && i === 2
        ? '<button class="btn btn-ghost btn-sm is-off" type="button" disabled title="작성 후 30일이 지났어요">수정</button><button class="btn btn-ghost btn-sm is-off" type="button" disabled>삭제</button>'
        : `${btn('수정', { cls: 'btn-ghost btn-sm', href: 'RV0101' })}${btn('삭제', { cls: 'btn-ghost btn-sm', attr: ' data-toast="리뷰를 지울까요? 지우면 적립금도 회수돼요"' })}`}</div></div>
  </div></div>`).join('');

  if (ctx.id === 'RV0302') {
    return {
      body: `${pageHd('내 리뷰')}
        ${banner('mut', '🔒', '<b>작성 후 30일이 지난 리뷰는 수정·삭제할 수 없어요.</b><div class="t-sub mt1">리뷰가 자주 바뀌면 다른 분들이 참고하기 어려워서예요. 매장 답글은 계속 보입니다.</div>',
          { cls: 'mb6', right: btn('문의하기', { cls: 'btn-soft', attr: ' data-toast="고객센터 1600-0000 으로 연결합니다"' }) })}
        ${myRv({ late: true })}`,
      o: { state: '수정 기한 경과', logged: true },
    };
  }

  if (ctx.id === 'RV0303') {
    return {
      body: `${pageHd('내 리뷰')}${todo}${myRv()}`,
      o: {
        state: '매장 답글 알림', logged: true,
        after: `${toastElLocal()}`,
      },
    };
  }

  return { body: `${pageHd('내 리뷰', '지금까지 12개를 남기셨어요 · 받은 적립금 18,500원')}${todo}${myRv()}`, o: { logged: true } };
}
function toastElLocal() {
  return `<div class="toast toast-ok" style="bottom:88px">
    <span>💬 살롱 드 코랄이 내 리뷰에 답글을 남겼어요 — “수현입니다. 톤 유지하시려면…”</span>
    <span class="act">리뷰 보기</span></div>
    <div class="toast" style="bottom:24px"><span>알림을 더 받고 싶으세요?</span><span class="act">알림 설정</span></div>`;
}
export const RV0302 = RV0301, RV0303 = RV0301;

/* ============================================================
   RV0401 — 리뷰 작성 기간 지남
   ============================================================ */
export function RV0401(ctx) {
  if (ctx.id === 'RV0402') {
    const list = [
      ['볼륨 매직', S[2].nm, '2026.08.05 방문', 25, 2000],
      ['젤 원컬러', S[1].nm, '2026.07.24 방문', 7, 2000],
      ['두피 스케일링', S[7].nm, '2026.07.19 방문', 2, 500],
    ];
    return {
      body: `${pageHd('아직 쓸 수 있는 리뷰', '마감이 가까운 순서로 보여드려요')}
        ${banner('acc', '⏳', '<b>2일 안에 마감되는 리뷰가 1건</b> 있어요. 놓치면 적립금도 받을 수 없어요.', { cls: 'mb6' })}
        <div class="col gap6">${list.map(([m, sh, d, left, pt]) => `<div class="hcard ${left <= 3 ? 'is-alert' : ''}">
          ${phFix(['시술 결과', 1000, 1000], 96, { seed: m })}
          <div class="grow"><div class="row-c wrap-row mb2">${badge(`${left}일 남음`, left <= 3 ? 'b-danger' : left <= 7 ? 'b-warn' : 'b-line')}${badge(`적립금 ${num(pt)}원`, 'b-acc')}</div>
            <b style="font-size:16px">${m}</b><p class="t-sub mt1">${sh} · ${d}</p></div>
          <div class="none">${btn('바로 쓰기', { cls: 'btn-primary btn-sm', href: 'RV0101' })}</div></div>`).join('')}</div>
        <p class="center mt6"><a class="btn-link" href="${link('RV0301')}">내가 쓴 리뷰 보기</a></p>`,
      o: { state: '작성 가능 리뷰 목록', logged: true },
    };
  }

  return {
    body: `${pageHd('리뷰 작성')}
      ${banner('mut', '🔒', '<b>리뷰 작성 기간이 지났어요 (방문일로부터 30일)</b><div class="t-sub mt1">2026.05.02 방문 건이라 8일 전에 마감됐어요.</div>', { cls: 'mb6' })}
      <div class="wrap-narrow" style="padding:0">
        ${card('어떤 시술이었나요', shopRow(S[5], { sub: '속눈썹 연장 · 최민서 디자이너', extra: '<p class="t-sub mt1">2026.05.02(토) 방문</p>' }))}
        <div class="is-readonly mt6">
          ${card('별점', `${rateIn('시술 만족도', 0)}${rateIn('친절도', 0)}${rateIn('청결도', 0)}`)}
          <div class="mt6">${card('어떠셨나요', '<textarea class="textarea" disabled placeholder="작성 기간이 지나 입력할 수 없어요"></textarea>')}</div>
        </div>
        ${card('왜 기간이 있나요', `<p class="t-sub">시술받은 지 오래되면 기억이 흐려져 다른 분들께 도움이 덜 돼요.
          그래서 <b class="hl">방문일로부터 30일</b> 안에만 쓸 수 있게 하고 있어요.</p>
          <p class="t-sub mt3">기간이 지난 뒤에도 매장에 남기고 싶은 말이 있다면 매장에 직접 문의해 주세요.</p>`, { cls: 'mt6' })}
        <div class="btns mt6">${btn('아직 쓸 수 있는 리뷰 보기', { cls: 'btn-primary btn-block btn-lg', href: 'RV0402' })}</div>
        <div class="btns mt2">${btn('매장에 문의하기', { cls: 'btn-ghost btn-block', attr: ' data-toast="02-000-0000 으로 연결합니다"' })}</div>
      </div>`,
    o: { logged: true },
  };
}
export const RV0402 = RV0401;
