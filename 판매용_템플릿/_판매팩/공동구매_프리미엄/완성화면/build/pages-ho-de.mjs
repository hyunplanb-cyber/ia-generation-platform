/* HO 홈·탐색 13장 · DE 공구 상세 14장
   부모 화면 하나에 상태·탭을 붙여 3뎁스를 만든다. 상태가 달라도
   레이아웃·컴포넌트·톤은 부모 그대로 두고, 바뀐 자리만 바꾼다. */
import {
  ph, phFix, phAva, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, countdown, tierTable, dealCards, dealRow, leftText, review, rateSummary, accordion,
  heroBold, carousel, promo, toastNow, modalNow, skGrid, skRows, spin,
  pageHd, stickBar, detail2, timeline, num, won, esc, link, off, rateLine,
} from './ui.mjs';
import { DEALS, dealById, pctOf, CATS, SOON, TIERS, OPTIONS, JOINS, REVIEWS, RATE_DIST, QNAS, FAQ } from './data.mjs';

/* ── HO-01 홈 ──────────────────────────────────────────
   v: 'me' 개인화 · 'soon' 오픈 예정 · 'empty' 진행 공구 없음 */
function ho01(ctx, v) {
  const top = DEALS[0];
  /* 레이아웃 A 타이포 강조형 — 어두운 배경에 큰 제목,
     바로 아래 숫자 지표 4개를 가로 한 줄로. */
  const hero = v === 'me'
    ? heroBold({
      kicker: '다시 오셨네요',
      title: `서지현님이 기다리는 공구<br><em>2건</em>이 오늘 마감됩니다`,
      sub: '참여하신 공구의 달성률과 남은 시간을 먼저 보여드립니다. 아래는 관심 카테고리에서 고른 것들입니다.',
      figs: [['2건', '참여 중'], ['1건', '오늘 마감'], ['3,000원', '쓸 수 있는 적립금'], ['4장', '보유 쿠폰']],
      btns: `${btn('내 공구함 열기', { cls: 'btn-primary btn-lg', href: 'MY-01' })}
        ${btn('관심 공구 보기', { cls: 'btn-ghost btn-lg', href: 'RV-03' })}`,
    })
    : v === 'empty'
      ? heroBold({
        kicker: '오늘의 공구',
        title: '지금 열려 있는 공구가<br><em>없습니다</em>',
        sub: '진행자들이 다음 회차를 준비하고 있습니다. 알림을 걸어 두시면 열리는 즉시 알려드립니다.',
        figs: [['0개', '진행 중'], ['3개', '오픈 예정'], ['8월 6일', '가장 빠른 오픈'], ['1,284명', '알림 신청']],
        btns: `${btn('오픈 알림 받기', { cls: 'btn-primary btn-lg', attr: ' data-toast="열리면 알려드릴게요" data-toast-kind="ok"' })}
          ${btn('지난 공구 보기', { cls: 'btn-ghost btn-lg', href: 'HO-02' })}`,
      })
      : heroBold({
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

  /* 곧 열려요 — 오픈 예정 상태에서는 이 섹션이 화면의 주인공이 된다 */
  const soonCards = (big) => `<div class="${big ? 'g3' : 'g3'}">${SOON.map((s, i) => `<div class="box">
      <div class="row-b"><b>${esc(s.nm)}</b>${badge('예정', 'b-mut')}</div>
      ${big ? `<div class="mt3">${ph(['예고 상품 사진', 1000, 1000], { seed: 'soon' + i, tiny: true })}</div>` : ''}
      <p class="t-sub mt2">${s.open} 오픈 · ${num(s.want)}명이 알림을 신청했어요</p>
      ${big ? `<div class="t-page mt3" data-count="${3600 * (i + 4)}">04:00:00</div>
        <p class="t-sub">오픈까지</p>
        <div class="mt3">${kv([['예상 목표', `${num(200 + i * 100)}명`], ['예상 가격', won(19900 + i * 5000)], ['예약 대기', `${num(s.want)}명`]])}</div>` : ''}
      <button class="btn btn-soft btn-block btn-sm mt3" type="button" data-toast="열리면 알려드릴게요" data-toast-kind="ok">오픈 알림 신청</button>
    </div>`).join('')}</div>`;

  /* 개인화 — 상위 화면의 뼈대를 그대로 두고 섹션 내용만 내 것으로 바꾼다 */
  if (v === 'me') {
    const body = `
    ${sec('이어서 보시겠어요?', carousel(DEALS.slice(0, 5).map((d) => `<a class="scard" href="${link('DE-01')}">
        ${ph(['상품 사진', 1000, 1000], { seed: d.id + 'c', tiny: true })}
        <div class="bd"><div class="row-b">${countdown(d.left)}${badge(off(d.was, d.now) + '%', 'b-acc')}</div>
          <b class="mt2" style="display:block">${esc(d.nm)}</b>
          <div class="mt2">${gauge(pctOf(d))}</div>
          <div class="t-sub mt1">3일 전에 보셨어요</div></div></a>`).join('')), { more: 'RV-03', moreLabel: '관심 공구' })}

    ${sec('내 참여 진행 상황', `<div class="g2">${DEALS.slice(0, 2).map((d) => `<div class="card"><div class="card-bd">
        <div class="row-b"><b>${esc(d.nm)}</b>${stBadge('진행 중')}</div>
        <div class="mt3">${gauge(pctOf(d))}</div>
        <div class="row-b mt2"><span class="t-sub">${num(d.joined)} / ${num(d.goal)}명</span>${countdown(d.left)}</div>
        <div class="btns mt4">${btn('참여 상세', { cls: 'btn-ghost btn-sm grow', href: 'MY-02' })}
          ${btn('친구에게 알리기', { cls: 'btn-primary btn-sm grow', attr: ' data-toast="링크를 복사했어요" data-toast-kind="ok"' })}</div>
      </div></div>`).join('')}</div>`, { more: 'MY-01', moreLabel: '내 공구함' })}

    ${banner('warn', '⏰', `<b>참여하신 공구 1건이 오늘 21시에 마감됩니다.</b>
      <p class="t-sub">아직 8명이 부족합니다. 친구에게 알리면 성사가 빨라져요.</p>`,
      { right: btn('공구 보기', { cls: 'btn-primary btn-sm', href: 'DE-01' }) })}

    ${sec('관심 카테고리에서 골랐어요', dealCards(DEALS.slice(2, 6), pctOf, { cls: 'stair' }), {
      desc: '식품·간편식, 생활·주방을 관심 카테고리로 등록해 두셨습니다.',
      more: 'HO-02',
      aside: `<a class="more" href="${link('AC-03')}">관심 카테고리 고치기 ›</a>`,
    })}

    ${sec('', `<div class="card"><div class="card-bd row-b wrap-row">
      <div class="row wrap-row" style="gap:32px">
        <div><div class="t-sec">3,000원</div><div class="t-sub">적립금</div></div>
        <div><div class="t-sec">4장</div><div class="t-sub">쓸 수 있는 쿠폰</div></div>
        <div><div class="t-sec">2장</div><div class="t-sub">7일 안에 만료</div></div>
      </div>
      ${btn('쿠폰함 열기', { cls: 'btn-primary', href: 'MY-01' })}
    </div></div>`)}

    ${sec('자주 묻는 질문', accordion(FAQ.slice(0, 4), 0))}`;
    return { body, o: { hero, state: '로그인 상태 · 서지현님 (참여 2건 · 적립금 3,000원)' } };
  }

  /* 오픈 예정 섹션 */
  if (v === 'soon') {
    const body = `
    ${sec('곧 열려요', soonCards(true), { desc: '오픈 시각에 맞춰 알림을 보내드립니다. 알림을 신청한 분이 많을수록 목표 인원이 낮게 잡힙니다.' })}

    ${sec('예약 참여 대기', `${card('', table(
      [{ t: '예고 공구', w: '40%' }, '오픈', '대기 인원', '예상 가격', ''],
      SOON.map((s, i) => [
        `<b>${esc(s.nm)}</b>`, s.open, `${num(s.want)}명`, won(19900 + i * 5000),
        `<button class="btn btn-ghost btn-sm" type="button" data-toast="대기 명단에 넣었어요. 열리면 먼저 알려드릴게요" data-toast-kind="ok">대기 신청</button>`,
      ]),
    ))}`)}

    ${banner('pri', '🔔', `<b>대기 인원이 목표의 절반을 넘으면 진행자가 값을 한 단계 더 내립니다.</b>
      <p class="t-sub">지금 대기를 걸어 두시면 오픈 30분 전에 알려드립니다.</p>`,
      { right: btn('알림 설정', { cls: 'btn-ghost btn-sm', href: 'AC-03' }) })}

    ${sec('지금 참여할 수 있는 공구', dealCards(DEALS.slice(0, 4), pctOf, { cls: 'stair' }), { more: 'HO-02' })}`;
    return { body, o: { hero, state: '오픈 예정 3건 · 가장 빠른 오픈 8월 6일 10:00' } };
  }

  /* 진행 공구 없음(빈 상태) */
  if (v === 'empty') {
    const body = `
    ${empty('📭', '지금 열려 있는 공구가 없어요',
      '진행자들이 다음 회차를 준비하고 있습니다. 관심 카테고리에 알림을 걸어 두시면 열리는 즉시 알려드릴게요.',
      `${btn('오픈 예정 보기', { cls: 'btn-primary', href: 'HO-01' })}
       ${btn('알림 설정하기', { cls: 'btn-ghost', href: 'AC-03' })}`)}

    ${sec('관심 카테고리에 알림 걸기', `<div class="cats">${CATS.map((c) => `<button class="chip" type="button" data-toast="${c.nm} 공구가 열리면 알려드릴게요" data-toast-kind="ok" style="height:auto;flex-direction:column;gap:6px;padding:16px 8px;width:100%">
      <span style="font-size:24px">${c.ic}</span>${c.nm}</button>`).join('')}</div>`,
      { desc: '고른 카테고리에서 공구가 열리면 알림을 보내드립니다.' })}

    ${sec('곧 열려요', soonCards(false), { more: 'HO-01', moreLabel: '오픈 예정 전체' })}

    ${sec('지난 인기 공구 — 다시 열어 달라고 요청해 보세요', `${DEALS.slice(0, 4).map((d) => `<div class="list-row">
      ${phFix(['상품 사진', 1000, 1000], 72, { seed: d.id })}
      <div class="grow"><b>${esc(d.nm)}</b>
        <div class="t-sub">${esc(d.host)} · 지난 회차 ${num(d.joined)}명 참여 · ${won(d.now)}</div></div>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="진행자에게 재오픈 요청을 보냈어요" data-toast-kind="ok">재오픈 요청</button>
    </div>`).join('')}
    <p class="t-sub mt4">같은 요청이 100명 넘게 모이면 진행자에게 알려 재오픈을 제안합니다.</p>`)}`;
    return { body, o: { hero, state: '진행 중인 공구 0건' } };
  }

  /* 기본 홈 */
  const body = `
  ${sec('마감이 얼마 안 남았어요', carousel(DEALS.filter((d) => d.left < 700).map((d) => `<a class="scard" href="${link('DE-01')}">
      ${ph(['상품 사진', 1000, 1000], { seed: d.id + 'c', tiny: true })}
      <div class="bd">
        <div class="row-b">${countdown(d.left)}${badge(off(d.was, d.now) + '%', 'b-acc')}</div>
        <b class="mt2" style="display:block">${esc(d.nm)}</b>
        <div class="mt2">${gauge(pctOf(d))}</div>
        <div class="t-sub mt1">${num(d.joined)}명 참여</div>
      </div></a>`).join('')), { more: 'HO-03', moreLabel: '마감 임박 전체' })}

  ${sec('', `<div class="cats">${CATS.map((c) => `<a href="${link('HO-02')}"><span class="ic">${c.ic}</span><div class="nm">${c.nm}</div></a>`).join('')}</div>`)}

  ${sec('지금 뜨는 공구', dealCards(DEALS, pctOf, { cls: 'stair' }), { more: 'HO-02' })}

  ${sec('곧 열려요', soonCards(false), { more: 'HO-01', moreLabel: '오픈 예정 전체' })}

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

  ${sec('', `<div class="box center">
    <h2 class="t-sec">놓치기 전에 알림을 받아 보세요</h2>
    <p class="t-sub mt2">관심 있는 카테고리의 공구가 열리면 바로 알려드립니다.</p>
    <div class="btns mt4 center">${btn('앱 내려받기', { cls: 'btn-primary btn-lg', attr: ' data-toast="앱 스토어로 이동해요"' })}
      ${btn('알림 설정하기', { cls: 'btn-ghost btn-lg', href: 'AC-03' })}</div>
  </div>`)}`;

  return { body, o: { hero } };
}

/* ── HO-02 공구 목록 ───────────────────────────────────
   v: 'filter' 필터 적용 · 'loading' 스켈레톤 · 'wish' 찜 토글 */
function ho02(ctx, v) {
  const cnt = v === 'filter' ? 24 : 128;
  const head = `
  ${pageHd('공구 목록', `진행 중인 공구 ${num(cnt)}개`)}
  <div class="searchbar mb4">
    <input class="input" type="search" placeholder="상품명·진행자 이름으로 검색"${v === 'filter' ? ' value="한라봉"' : ''}>
    ${btn('검색', { cls: 'btn-primary', attr: ' data-toast="검색했어요"' })}
  </div>

  ${tabs(['전체', ...CATS.slice(0, 6).map((c) => c.nm)], v === 'filter' ? 1 : 0)}`;

  /* 필터 적용 상태 — 고른 조건을 칩으로 보여 주고 하나씩 뗄 수 있게 한다 */
  if (v === 'filter') {
    const body = `${head}
    ${card('', `<div class="row-b wrap-row mb3">
        <b>적용한 조건 4개</b>
        <button class="btn-link" type="button" data-toast="조건을 모두 지웠어요. 128개가 다시 나옵니다">전체 초기화</button>
      </div>
      <div class="chips">${['식품·간편식', '진행 중', '달성률 80% 이상', '무료배송'].map((t) =>
      `<button class="chip on" type="button">${t} <span class="x">✕</span></button>`).join('')}</div>
      <div class="hr"></div>
      ${kv([
      ['카테고리', '식품·간편식'],
      ['진행 상태', '진행 중 (마감된 공구 제외)'],
      ['달성률', '80% 이상 — 성사 가능성이 높은 것만'],
      ['배송', '무료배송'],
    ])}
      <p class="t-sub mt3">조건에 맞는 공구 <b>${num(cnt)}개</b>를 찾았습니다. 조건 하나를 떼면 <b>52개</b>까지 늘어납니다.</p>`,
      { cls: 'mb4' })}

    <div class="row-b mb4 wrap-row" style="gap:12px">
      <span class="t-sub">${num(cnt)}개 · 마감 임박순</span>
      <select class="select" style="width:160px"><option>마감 임박순</option><option>인기순</option><option>달성률 높은순</option><option>할인율순</option><option>최신순</option></select>
    </div>

    ${dealCards(DEALS.filter((d) => pctOf(d) >= 80), pctOf, { cls: 'stair' })}

    <div class="center mt6">
      <button class="btn btn-ghost btn-lg" type="button" data-toast="공구 12개를 더 불러왔어요">더 보기 (${num(cnt - 4)}개 남음)</button>
    </div>`;
    return { body, o: { wrapCls: 'wrap wrap-full', state: '필터 4개 적용 · 결과 24개' } };
  }

  /* 로딩(스켈레톤) — 필터 줄은 그대로 두고 카드 자리만 회색으로 */
  if (v === 'loading') {
    const body = `${head}
    <div class="row-b mt4 mb4 wrap-row" style="gap:12px">
      <div class="row wrap-row" style="gap:8px">${chips(['진행 중', '마감 임박', '달성률 80%+', '무료배송'], [0, 1])}</div>
      <div class="row" style="gap:10px">
        <span class="t-sub">불러오는 중…</span>
        <select class="select" style="width:160px" disabled><option>마감 임박순</option></select>
      </div>
    </div>

    ${skGrid(8)}
    ${spin('공구를 불러오고 있어요')}
    <div class="center mt2"><span class="t-sub">스크롤을 내리면 12개씩 더 불러옵니다</span></div>`;
    return { body, o: { wrapCls: 'wrap wrap-full', state: '불러오는 중 · 카드 자리 스켈레톤' } };
  }

  /* 관심 찜 토글 — 하트를 누른 직후 */
  if (v === 'wish') {
    const body = `${head}
    ${banner('mut', '🔒', `<b>로그인하시면 찜한 공구가 계정에 저장됩니다.</b>
      <p class="t-sub">지금은 이 브라우저에만 남습니다. 지우면 사라져요.</p>`,
      { cls: 'mb4', right: btn('로그인', { cls: 'btn-primary btn-sm', href: 'AC-01' }) })}

    <div class="row-b mb4 wrap-row" style="gap:12px">
      <div class="row wrap-row" style="gap:8px">${chips(['진행 중', '마감 임박', '달성률 80%+', '무료배송'], [0, 1])}</div>
      <div class="row" style="gap:10px">
        <span class="t-sub">${num(cnt)}개</span>
        <a class="btn btn-ghost btn-sm" href="${link('RV-03')}">♥ 찜한 공구 3개</a>
      </div>
    </div>

    <div class="stair">
      ${/* 카드는 눌러서 상세로 간다. 찜하기는 링크 안에 넣으면 눌렀을 때
            같이 화면이 넘어가므로, 링크 밖에 두고 위에 얹는다. */
    DEALS.slice(0, 4).map((d, i) => `<div style="position:relative">
        <button class="heart${i === 0 ? ' on' : ''}" type="button">${i === 0 ? '♥' : '♡'}</button>
        <a class="deal" href="${link('DE-01')}">
        ${ph(['상품 사진', 1000, 1000], { seed: d.id, tiny: true })}
        <div class="bd">
          <div class="row-b"><span class="badge b-acc">${off(d.was, d.now)}%</span>${countdown(d.left)}</div>
          <div class="ttl">${esc(d.nm)}</div>
          <div class="mt2"><span class="price-old">${won(d.was)}</span> <span class="price">${won(d.now)}</span></div>
          <div class="mt3">${gauge(pctOf(d))}</div>
          <div class="t-sub mt1">${num(d.joined)}명 참여 · 목표 ${num(d.goal)}명</div>
        </div></a></div>`).join('')}
    </div>

    ${card('찜하면 이렇게 됩니다', `<ul style="padding-left:18px;line-height:2">
      <li>달성률이 90%를 넘으면 알려드립니다 — 곧 성사될 공구를 놓치지 않게.</li>
      <li>마감 3시간 전에 한 번 더 알려드립니다.</li>
      <li>가격 단계가 내려가면 그때도 알려드립니다.</li>
    </ul>`, { cls: 'mt6', ft: btn('찜한 공구 보러 가기', { cls: 'btn-ghost btn-block btn-sm', href: 'RV-03' }) })}`;
    return {
      body,
      o: {
        wrapCls: 'wrap wrap-full',
        state: '관심 공구에 담음 · 비로그인',
        after: toastNow('관심 공구에 담았어요', { ok: true, act: '관심 공구 보기' }),
      },
    };
  }

  /* 기본 목록 */
  const body = `${head}
  <div class="row-b mt4 mb4 wrap-row" style="gap:12px">
    <div class="row wrap-row" style="gap:8px">
      ${chips(['진행 중', '마감 임박', '달성률 80%+', '무료배송'], [0, 1])}
      <button class="btn-link" type="button" data-toast="조건을 모두 지웠어요">전체 초기화</button>
    </div>
    <div class="row" style="gap:10px">
      <span class="t-sub">${num(cnt)}개</span>
      <select class="select" style="width:160px"><option>마감 임박순</option><option>인기순</option><option>달성률 높은순</option><option>할인율순</option><option>최신순</option></select>
    </div>
  </div>

  ${dealCards(DEALS, pctOf, { cls: 'stair' })}
  ${dealCards(DEALS.slice(0, 3), pctOf, { cls: 'stair', rank: false })}

  <div class="center mt6">
    <button class="btn btn-ghost btn-lg" type="button" data-toast="공구 12개를 더 불러왔어요">더 보기 (116개 남음)</button>
  </div>`;
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HO-03 마감 임박 타임딜 ───────────────────────────
   v: '1h' 1시간 내 마감 · 'noti' 알림 신청 완료 */
function ho03(ctx, v) {
  const all = DEALS.filter((d) => d.left < 1500).sort((a, b) => a.left - b.left);
  const urgent = v === '1h' ? all.filter((d) => d.left <= 60) : all;

  const clock = `<div class="box center">
    <div class="t-sub">${v === '1h' ? '1시간 안에 마감되는 공구까지' : '가장 먼저 마감되는 공구까지'}</div>
    <div class="t-page" data-count="${v === '1h' ? 1260 : 1260}" style="font-size:56px;letter-spacing:-.04em">00:21:00</div>
    <p class="t-sub">지금 참여하시면 이번 단계 가격이 그대로 적용됩니다.</p>
  </div>`;

  const rows = urgent.map((d) => {
    const need = Math.max(0, d.goal - d.joined);
    return dealRow(d, pctOf(d), {
      tail: need > 0 && need <= 20 ? badge(`${need}명이면 성사!`, 'b-danger') : '',
      right: `<div class="mt2">${btn('참여하기', { cls: 'btn-primary btn-sm', href: 'JO-01' })}</div>`,
    });
  }).join('');

  /* 1시간 내 마감 — 부족 인원을 큰 글씨로, 참여가 오르는 것을 보여 준다 */
  if (v === '1h') {
    const body = `
    ${clock}
    ${pageHd('마감 임박 타임딜', '1시간 안에 끝나는 공구만 남겼습니다',
      `<div class="row" style="gap:8px">${chips(['오늘 마감', '1시간 내 마감', '한 명만 더'], 1)}</div>`)}

    ${banner('danger', '🔥', `<b>지금이 마지막입니다.</b>
      <p class="t-sub">아래 공구는 1시간 안에 마감됩니다. 목표에 못 미치면 전액 환불되니 참여해서 손해 볼 일은 없습니다.</p>`, { cls: 'mb6' })}

    ${urgent.map((d) => {
      const need = Math.max(0, d.goal - d.joined);
      return `<div class="card mb4"><div class="card-bd">
        <div class="row wrap-row" style="gap:20px;align-items:flex-start">
          ${phFix(['상품 사진', 1000, 1000], 132, { seed: d.id })}
          <div class="grow">
            <div class="row wrap-row" style="gap:6px">${badge(off(d.was, d.now) + '%', 'b-acc')}${countdown(d.left)}</div>
            <h3 class="t-card mt2">${esc(d.nm)}</h3>
            <div class="mt3">${gauge(pctOf(d))}</div>
            <div class="t-sub mt1">${num(d.joined)}명 참여 · 목표 ${num(d.goal)}명</div>
            <div class="ticker mt3"><span class="live"></span>
              <ul><li><b>김*연</b>님이 방금 참여했어요</li><li><b>이*훈</b>님이 2분 전 참여</li></ul></div>
          </div>
          <div class="right nowrap" style="min-width:180px">
            <div class="t-sub">성사까지</div>
            <div class="t-page" style="font-size:44px">${num(need)}명</div>
            <div class="t-sub">최근 10분 동안 <b>7명</b>이 참여했어요</div>
            <div class="mt3">${btn('지금 참여하기', { cls: 'btn-primary btn-block', href: 'JO-01' })}</div>
            <div class="mt2">${btn('친구에게 알리기', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="링크를 복사했어요. 친구가 참여하면 성사가 빨라져요" data-toast-kind="ok"' })}</div>
          </div>
        </div>
      </div></div>`;
    }).join('')}

    <div class="mt8">${sec('오늘 마감되는 나머지 공구', all.filter((d) => d.left > 60).map((d) => dealRow(d, pctOf(d), {
      right: `<div class="mt2">${btn('참여하기', { cls: 'btn-ghost btn-sm', href: 'JO-01' })}</div>`,
    })).join(''), { more: 'HO-03', moreLabel: '필터 풀기' })}</div>`;
    return { body, o: { wrapCls: 'wrap wrap-full', state: '1시간 내 마감 필터 적용 · 2건' } };
  }

  /* 알림 신청 완료 */
  if (v === 'noti') {
    const body = `
    ${clock}
    ${pageHd('마감 임박 타임딜', '오늘 안에 끝나는 공구만 모았습니다',
      `<div class="row" style="gap:8px">${chips(['오늘 마감', '1시간 내 마감', '한 명만 더'], 0)}</div>`)}

    ${card('알림을 신청한 공구', `${[
      ['겨울 기모 라운넥 맨투맨 (5color)', '마감됨 · 41/300명', '다시 열리면 알림'],
      ['설 선물세트 한우 1++ 등급', '8월 6일 10:00 오픈 예정', '오픈 알림'],
    ].map(([nm, st, kind]) => `<div class="row-b" style="padding:12px 0;border-bottom:1px solid var(--border)">
      <div class="grow"><b>${nm}</b><div class="t-sub">${st}</div></div>
      <div class="row" style="gap:8px">${badge(kind, 'b-pri')}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="알림 신청을 취소했어요">신청 취소</button></div>
    </div>`).join('')}
    <p class="t-sub mt3">알림은 앱 푸시와 문자로 갑니다. 받는 방법은 알림 설정에서 고르실 수 있습니다.</p>`,
      { cls: 'mb6', ft: btn('알림 설정으로 가기', { cls: 'btn-ghost btn-block btn-sm', href: 'AC-03' }) })}

    ${rows}

    ${banner('warn', '⏰', `<b>마감된 공구도 다시 열릴 수 있어요.</b>
      <p class="t-sub">놓치신 공구에 알림을 걸어 두시면 다시 열릴 때 바로 알려드립니다.</p>`,
      { cls: 'mt6', right: btn('재오픈 알림 신청', { cls: 'btn-accent btn-sm', attr: ' data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' }) })}`;
    return {
      body,
      o: {
        wrapCls: 'wrap wrap-full',
        state: '알림 신청 완료 · 2건',
        after: toastNow('다시 열리면 알려드릴게요', { ok: true, act: '알림 설정' }),
      },
    };
  }

  /* 기본 타임딜 */
  const body = `
  ${clock}
  ${pageHd('마감 임박 타임딜', '오늘 안에 끝나는 공구만 모았습니다',
    `<div class="row" style="gap:8px">${chips(['오늘 마감', '1시간 내 마감', '한 명만 더'], 0)}</div>`)}

  ${rows}

  ${banner('warn', '⏰', `<b>마감된 공구도 다시 열릴 수 있어요.</b>
    <p class="t-sub">놓치신 공구에 알림을 걸어 두시면 다시 열릴 때 바로 알려드립니다.</p>`,
    { cls: 'mt6', right: btn('재오픈 알림 신청', { cls: 'btn-accent btn-sm', attr: ' data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' }) })}

  <div class="mt8">${sec('여유 있게 볼 수 있는 공구', dealCards(DEALS.filter((d) => d.left >= 1500), pctOf, { cls: 'stair' }), { more: 'HO-02' })}</div>`;
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── HO-04 공구 목록 - 결과 없음 ───────────────────────
   v: 'recloading' 추천 불러오는 중 */
function ho04(ctx, v) {
  const head = `
  ${pageHd('공구 목록')}
  <div class="searchbar mb4">
    <input class="input" type="search" value="무선 청소기">
    ${btn('검색', { cls: 'btn-primary', attr: ' data-toast="검색했어요"' })}
  </div>
  <div class="row wrap-row mb4" style="gap:8px">
    ${chips(['디지털·가전', '10만원 이하', '무료배송'], [0, 1, 2])}
    <button class="btn-link" type="button" data-toast="조건을 모두 지웠어요">전체 초기화</button>
  </div>`;

  if (v === 'recloading') {
    const body = `${head}
    ${empty('🔍', '‘무선 청소기’로 열린 공구가 지금은 없어요',
      '비슷한 공구를 찾고 있습니다. 잠시만요.', '')}

    ${sec('인기 카테고리로 넓혀 볼까요', `<div class="chips">${CATS.map((c) =>
      `<a class="chip" href="${link('HO-02')}">${c.ic} ${c.nm}</a>`).join('')}</div>`)}

    ${sec('이런 공구는 어떠세요', `${skGrid(4)}${spin('비슷한 공구를 찾는 중이에요')}`)}`;
    return { body, o: { wrapCls: 'wrap wrap-full', state: '검색 결과 0건 · 추천 불러오는 중' } };
  }

  const body = `${head}
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

  <div class="mt6">${sec('카테고리 둘러보기', `<div class="cats">${CATS.map((c) => `<a href="${link('HO-02')}"><span class="ic">${c.ic}</span><div class="nm">${c.nm}</div></a>`).join('')}</div>`)}</div>`;
  return { body, o: { wrapCls: 'wrap wrap-full', state: '검색 결과 0건' } };
}

/* ── DE-01 공구 상세 ───────────────────────────────────
   v: 'info' 상품정보 탭 · 'review' 후기 탭 · 'qna' 문의 탭
      'tier' 다음 단계 도달 · 'max' 1인 최대수량 초과 */
function de01(ctx, v) {
  const d = dealById('d1');
  const pct = pctOf(d);
  const tierNow = v === 'tier';
  const price = tierNow ? 21900 : d.now;

  const hero = `<section class="detail-lead"><div class="wrap">
    <div class="gal gal-3">
      ${ph(['상품 대표 사진', 1000, 1000], { seed: d.id })}
      ${ph(['상품 사진', 1000, 1000], { seed: d.id + '2', tiny: true })}
      ${ph(['상품 사진', 1000, 1000], { seed: d.id + '3', tiny: true })}
    </div>
  </div></section>`;

  const tabIdx = { info: 1, review: 2, qna: 3 }[v] ?? 0;
  const tabBar = tabs([
    { label: '공구 정보', go: 'DE0101' },
    { label: '상품정보', go: 'DE0102' },
    { label: '후기', cnt: num(d.rv), go: 'DE0103' },
    { label: '문의', cnt: QNAS.length, go: 'DE0104' },
  ], tabIdx);

  /* 어느 탭에 있어도 딜 현황(달성률·카운트다운·단계표)은 그대로 둔다 — 이 화면의 주인공이라. */
  const dealStatus = `
    ${card('', `<div class="row-b wrap-row"><b>달성률</b><span class="t-sub">목표 ${num(d.goal)}명</span></div>
      <div class="mt2">${gauge(tierNow ? 100 : pct)}</div>
      <div class="row-b mt2"><span><b style="font-size:20px">${num(tierNow ? 250 : d.joined)}명</b> 참여 중</span>
        ${tierNow ? '<b>250명 단계 달성!</b>' : `<b>${num(d.goal - d.joined)}명이면 성사!</b>`}</div>`)}

    ${card('사람이 모일수록 싸집니다', tierTable(
      tierNow
        ? [{ n: 50, price: 32000, done: true }, { n: 150, price: 28000, done: true },
          { n: 250, price: 24900, done: true }, { n: 400, price: 21900, done: false, now: true }]
        : TIERS,
      {
        next: tierNow
          ? '250명 단계를 넘어 <b>21,900원</b>이 적용됐습니다. 이미 참여하신 분께는 차액을 돌려드립니다.'
          : '다음 단계까지 <b>3명</b> 남았어요. 250명이 되면 24,900원 → <b>21,900원</b>이 됩니다.',
      },
    ), { cls: 'mt6' })}`;

  const aside = card('', `<div class="center">
      <span class="badge b-acc">${off(d.was, price)}% 할인</span>
      <div class="price-old mt1">${won(d.was)}</div>
      <div class="price-lg">${won(price)}</div>
      <p class="t-sub mt1">${tierNow ? '방금 한 단계 내려간 값입니다' : '지금 단계 가격입니다'}</p></div>
    <div class="mt4">${gauge(tierNow ? 100 : pct)}</div>
    <p class="t-sub center mt1">${num(tierNow ? 250 : d.joined)} / ${num(d.goal)}명</p>
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
    `<div class="t-sub">${num(tierNow ? 250 : d.joined)}명 참여 · ${leftText(d.left)}</div><b style="font-size:16px">${won(price)}</b>`,
    `<button class="icon-btn" type="button" aria-label="찜하기" title="찜하기" data-toast="찜 목록에 담았어요" data-toast-kind="ok">♡</button>${btn('참여하기', { cls: 'btn-primary', href: 'JO-01' })}`);

  const title = `
    <div class="row wrap-row" style="gap:8px">${badge(CATS.find((c) => c.key === d.cat).nm, 'b-mut')}${badge('조건부 결제', 'b-pri')}${countdown(d.left)}</div>
    <h1 class="t-page mt3">${esc(d.nm)}</h1>
    <div class="row wrap-row mt2" style="gap:16px">
      <span>${rateLine(d.rate, d.rv)}</span><span class="t-sub">${esc(d.ship)}</span>
    </div>
    <div class="mt6">${tabBar}</div>`;

  /* 상품정보 탭 */
  if (v === 'info') {
    const main = `${title}
    ${card('상품 구성·스펙', table(
      [{ t: '항목', w: '30%' }, '내용'],
      [
        ['상품명', '제주 한라봉 5kg 산지직송 (특대과)'],
        ['중량·과수', '5kg / 특대과 12~14과'],
        ['당도', '13브릭스 이상 선별'],
        ['원산지', '국내산 (제주 서귀포)'],
        ['보관', '서늘한 곳 · 냉장 보관 시 2주'],
        ['포장', '개별 완충 포장 · 종이 박스'],
        ['유통기한', '수확일로부터 14일'],
      ],
    ))}

    ${card('상세 이미지', `<div class="gal gal-3">
      ${ph(['상품 상세 이미지', 1000, 1400], { seed: 'i1' })}
      ${ph(['상품 상세 이미지', 1000, 1400], { seed: 'i2' })}
      ${ph(['상품 상세 이미지', 1000, 1400], { seed: 'i3' })}
    </div>`, { cls: 'mt6' })}

    ${card('옵션별 안내', OPTIONS.map((o) => `<div class="row-b" style="padding:12px 0;border-bottom:1px solid var(--border)${o.soldout ? ';opacity:.5' : ''}">
      <div><b>${esc(o.nm)}</b><div class="t-sub">${o.soldout ? '이번 회차 물량이 다 찼습니다' : '성사 후 3일 내 발송'}</div></div>
      <span class="nowrap">${o.soldout ? badge('품절', 'b-mut') : (o.add ? `+${won(o.add)}` : '기본가')}</span></div>`).join(''),
      { cls: 'mt6' })}

    ${card('원산지·인증', `${kv([
      ['생산자', '제주농원 다래 (서귀포시)'],
      ['인증', 'GAP 농산물우수관리인증 · 저농약'],
      ['검사', '잔류농약 검사 성적서 보유'],
      ['이력', '수확일·선별일이 박스에 찍혀 있습니다'],
    ])}
      <div class="row mt4" style="gap:8px">${['GAP 인증', '저농약', '산지직송'].map((t) => badge(t, 'b-ok')).join('')}</div>`,
      { cls: 'mt6' })}

    ${dealStatus}`;
    return { body: detail2(main, aside), o: { hero, stick, wrapCls: 'wrap wrap-full' } };
  }

  /* 후기 탭 */
  if (v === 'review') {
    const main = `${title}
    ${card('', `${rateSummary(d.rate, RATE_DIST)}
      <div class="row-b mt4 wrap-row"><div>${tabs(['전체', '포토 후기', '5점', '3점 이하'], 0, { pill: true })}</div>
        <select class="select" style="width:150px"><option>최신순</option><option>도움돼요순</option><option>별점 높은순</option></select></div>`)}

    ${card('포토 후기', `<div class="gal gal-6">
      ${Array.from({ length: 6 }, (_, i) => ph(['후기 사진', 1000, 1000], { seed: 'rv' + i, tiny: true })).join('')}
    </div>
    <p class="t-sub mt3">사진이 있는 후기 <b>128개</b>. 눌러서 크게 보실 수 있습니다.</p>`, { cls: 'mt6' })}

    ${card('후기 412개', `${REVIEWS.map((r, i) => `${review(r, { deal: false })}
      ${i === 0 ? `<div class="review" style="border:0;padding-top:0"><div class="box" style="padding:16px">
        <b>진행자 ${esc(d.host)}</b>
        <p class="t-sub mt1">좋게 봐주셔서 고맙습니다. 다음 회차는 9월 초에 열 예정이고, 그때는 10kg 상자도 넉넉히 준비하겠습니다.</p>
      </div></div>` : ''}`).join('')}`,
      { cls: 'mt6', ft: btn('후기 전체 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'RV-01' }) })}

    ${dealStatus}`;
    return { body: detail2(main, aside), o: { hero, stick, wrapCls: 'wrap wrap-full' } };
  }

  /* 문의 탭 */
  if (v === 'qna') {
    const main = `${title}
    ${card('자주 묻는 질문', accordion(FAQ.slice(0, 3), 0), { bdCls: 'is-plain' })}

    ${card('상품 문의', `${QNAS.map((q) => `<div style="padding:14px 0;border-bottom:1px solid var(--border)">
      <div class="row-b"><b>${esc(q.q)}</b>${stBadge(q.st)}</div>
      <div class="t-sub mt1">${esc(q.who)} · ${q.at} · ${q.kind}</div>
      ${q.a ? `<div class="box mt3" style="padding:14px"><b>진행자 답변</b><p class="t-sub mt1">${esc(q.a)}</p></div>` : ''}
    </div>`).join('')}`,
      {
        cls: 'mt6',
        aside: btn('문의 작성', { cls: 'btn-primary btn-sm', href: 'RV0202' }),
        ft: btn('문의 전체 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'RV-02' }),
      })}

    ${banner('mut', '💬', `<b>배송·환불은 고객센터가 더 빠릅니다.</b>
      <p class="t-sub">상품에 대한 것은 진행자가, 결제·환불은 고객센터가 답합니다.</p>`,
      { cls: 'mt6', right: btn('1:1 문의', { cls: 'btn-ghost btn-sm', href: 'CS-02' }) })}

    ${dealStatus}`;
    return { body: detail2(main, aside), o: { hero, stick, wrapCls: 'wrap wrap-full' } };
  }

  /* 기본 상세 (+ tier / max 상태) */
  const main = `${title}
    ${v === 'tier' ? banner('ok', '🎉', `<b>가격이 한 단계 내려갔어요 — ${won(24900)} → <b>${won(21900)}</b></b>
      <p class="t-sub">250명을 넘겼습니다. 앞 단계 가격으로 참여하신 분께는 차액 3,000원을 성사 확정 후 자동 환급해 드립니다.</p>`,
    { cls: 'mt6', right: btn('환급 안내', { cls: 'btn-ghost btn-sm', href: 'MY0203' }) }) : ''}

    ${dealStatus}

    ${card('지금 참여하고 있어요', `<div class="ticker" style="display:block">${JOINS.map((j) => `<div class="tl-item" style="padding-bottom:10px">
      <span>●</span><div class="grow"><b>${esc(j.who)}</b>님이 ${esc(j.opt)} ${j.qty}개 참여</div>
      <span class="t-sub nowrap">${j.at}</span></div>`).join('')}</div>`, { cls: 'mt6' })}

    ${banner('pri', '🔒', `<b>지금 결제하지만, 못 모으면 전액 돌려드립니다.</b>
      <p class="t-sub">마감 시각에 목표 인원에 못 미치면 그 자리에서 자동으로 전액 환불됩니다. 따로 신청하실 것은 없습니다.</p>`,
    { cls: 'mt6', right: btn('자세히', { cls: 'btn-ghost btn-sm', href: 'DE-02' }) })}

    ${card('옵션', OPTIONS.map((o) => `<div class="row-b" style="padding:10px 0${o.soldout ? ';opacity:.5' : ''}">
      <span>${esc(o.nm)}</span>
      <span class="nowrap">${o.soldout ? badge('품절', 'b-mut') : (o.add ? `+${won(o.add)}` : '기본가')}</span></div>`).join(''),
    { cls: 'mt6', aside: `<span class="t-sub">1인 최대 ${v === 'max' ? 3 : 3}개</span>` })}

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
        <a class="more" href="${link('DE0103')}">후기 탭 ›</a></div>
      <div class="mt4">${REVIEWS.slice(0, 3).map((r) => review(r, { deal: false })).join('')}</div>`, { cls: 'mt6' })}

    ${card('상품 문의', QNAS.slice(0, 3).map((q) => `<div class="row-b" style="padding:10px 0">
      <a class="grow" href="${link('DE0104')}"><b>${esc(q.q)}</b><div class="t-sub">${esc(q.who)} · ${q.at} · ${q.kind}</div></a>
      ${stBadge(q.st)}</div>`).join(''),
    { cls: 'mt6', ft: btn('문의 전체 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'RV-02' }) })}`;

  const o = { hero, stick, wrapCls: 'wrap wrap-full' };
  if (v === 'tier') {
    o.state = '가격 단계 하락 · 24,900원 → 21,900원';
    o.after = toastNow('가격이 내려갔어요 — 21,900원', { ok: true, act: '차액 환급 안내' });
  }
  if (v === 'max') {
    o.state = '1인 최대수량 초과 — 3개까지만 담을 수 있습니다';
    o.after = modalNow('한 분이 담을 수 있는 최대 수량입니다',
      `<p>이 공구는 <b>1인 최대 3개</b>까지 참여하실 수 있습니다.
        더 필요하시면 마감 후 다음 회차를 이용해 주세요.</p>
      <div class="box mt4">${kv([['담으려던 수량', '5개'], ['담을 수 있는 최대', '3개'], ['자동 보정', '3개로 맞췄습니다']])}</div>
      <p class="t-sub mt3">여러 명이 나눠 가지실 계획이라면, 각자 참여하시는 편이 목표 인원을 채우는 데도 도움이 됩니다.</p>`,
      `<button class="btn btn-ghost" type="button" data-close=".dim">그만두기</button>
       <a class="btn btn-primary" href="${link('JO-01')}">3개로 참여하기</a>`);
  }
  return { body: detail2(main, aside), o };
}

/* ── DE-02 상품 상세정보·거래 조건 ─────────────────────
   v: 'ship' 배송/환불 탭 · 'seller' 판매자 정보 탭 */
function de02(ctx, v) {
  const d = dealById('d1');
  const idx = { ship: 1, seller: 2 }[v] ?? 0;
  const head = `
  ${pageHd('상품 상세정보 · 거래 조건', esc(d.nm))}
  ${tabs([{ label: '상품 설명', go: 'DE0201' }, { label: '배송/환불', go: 'DE0202' }, { label: '판매자 정보', go: 'DE0203' }], idx)}`;

  const stick = stickBar(
    `<div class="t-sub">${num(d.joined)}명 참여 · ${leftText(d.left)}</div><b style="font-size:16px">${won(d.now)}</b>`,
    `${btn('공구로 돌아가기', { cls: 'btn-ghost', href: 'DE-01' })}${btn('참여하기', { cls: 'btn-primary', href: 'JO-01' })}`);

  /* 배송/환불 탭 */
  if (v === 'ship') {
    const body = `${head}
    ${card('성사 후 발송 일정', timeline([
      ['마감', '2026년 8월 4일 21:00'],
      ['성사 확정', '마감 직후 자동 판정'],
      ['진행자 발주', '성사 다음 날'],
      ['발송 시작', '성사 후 3일 이내'],
      ['도착', '발송 후 1~2일 (제주·도서산간 2~3일)'],
    ], 1))}

    ${card('배송비·지역', table(
      ['구분', '배송비', '도착까지', '비고'],
      [
        ['전국 (제주·도서산간 제외)', '무료', '발송 후 1~2일', '한진택배'],
        ['제주', '3,000원', '발송 후 2~3일', '항공 운송'],
        ['도서산간', '3,000원', '발송 후 2~4일', '지역에 따라 다름'],
        ['해외', ['배송 불가'], '—', '지역 제한 있음'].flat(),
      ],
    ), { cls: 'mt6' })}

    ${card('조건부 환불 규정', `<div class="box">
        <b>이 공구는 조건부 결제입니다</b>
        <p class="t-sub mt1">참여하실 때 결제가 되지만, 목표 인원에 못 미치면 자동으로 전액 환불됩니다.</p>
      </div>
      ${table(
      [{ t: '언제', w: '28%' }, '어떻게 되나', '얼마나 걸리나'],
      [
        ['마감 전 취소', '수수료 없이 전액 환불', '즉시 요청 · 카드 2~5영업일'],
        ['목표 미달로 불발', '별도 신청 없이 전액 자동 환불', '마감 직후 요청 · 카드 2~5영업일'],
        ['성사 후 단순 변심', '발주 전이면 취소 가능 · 발주 후에는 반품 규정 적용', '왕복 배송비 5,000원'],
        ['상품 하자·오배송', '전액 환불 또는 재발송', '사진 확인 후 1영업일 내 처리'],
        ['가격 단계 하락', '차액을 자동 환급', '성사 확정 후 3영업일 내'],
      ],
    )}`, { cls: 'mt6' })}

    ${card('교환·반품 기준', `<ul style="padding-left:18px;line-height:2">
      <li><b>받으신 날부터 7일 이내</b> — 상품 하자나 오배송이면 왕복 배송비를 진행자가 부담합니다.</li>
      <li><b>신선식품 단순 변심</b> — 상하기 쉬워 받으신 뒤에는 어렵습니다. 마감 전 취소를 이용해 주세요.</li>
      <li><b>배송 중 파손</b> — 개봉 사진과 함께 문의하시면 재발송하거나 전액 환불해 드립니다.</li>
      <li><b>일부만 반품</b> — 세트 상품은 나눠서 반품하실 수 없습니다.</li>
    </ul>`, { cls: 'mt6', ft: btn('환불·분쟁 정책 전체 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'CS-04' }) })}`;
    return { body, o: { stick, state: '배송/환불 탭' } };
  }

  /* 판매자 정보 탭 */
  if (v === 'seller') {
    const body = `${head}
    ${card('', `<div class="row wrap-row" style="gap:20px">
      ${phAva(88, d.host)}
      <div class="grow">
        <div class="row wrap-row" style="gap:8px">${badge('신뢰 등급 A', 'b-ok')}${badge('사업자 인증', 'b-pri')}${badge('정산 지연 0회', 'b-mut')}</div>
        <h2 class="t-sec mt2">${esc(d.host)}</h2>
        <p class="t-sub mt1">제주에서 직접 밭을 보고 골라 옵니다. 크기가 안 맞으면 그 회차는 열지 않습니다.</p>
      </div>
    </div>
    <div class="g4 mt6">
      <div class="stat"><div class="n">34회</div><div class="l">연 공구</div></div>
      <div class="stat"><div class="n">91%</div><div class="l">성사율</div></div>
      <div class="stat"><div class="n">4.8</div><div class="l">평균 평점</div></div>
      <div class="stat"><div class="n">1.2일</div><div class="l">평균 발송</div></div>
    </div>`)}

    ${card('사업자 정보', kv([
      ['상호', '제주농원 다래'],
      ['대표', '김다래'],
      ['사업자등록번호', '616-**-*****'],
      ['통신판매업', '2025-제주서귀포-0142'],
      ['소재지', '제주특별자치도 서귀포시 ***'],
      ['연락', '앱 내 1:1 문의로 받습니다'],
    ]), { cls: 'mt6' })}

    ${sec('이 진행자의 다른 공구', dealCards(DEALS.slice(0, 3), pctOf, { cls: 'stair', rank: false }), { cls: 'mt6' })}

    ${banner('mut', '🚩', `<b>문제가 있다면 신고해 주세요.</b>
      <p class="t-sub">허위 정보나 과장 광고가 있으면 검토 후 공구를 내립니다.</p>`,
      { right: `<button class="btn btn-danger btn-sm" type="button" data-toast="신고를 접수했어요. 검토 후 알려드릴게요">신고하기</button>` })}`;
    return { body, o: { stick, state: '판매자 정보 탭' } };
  }

  /* 상품 설명 탭(기본) */
  const body = `${head}
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
  ]), { cls: 'mt6', aside: `<a class="more" href="${link('DE0202')}">배송/환불 탭 ›</a>` })}

  ${card('조건부 결제 규정', `<div class="box">
      <b>이 공구는 조건부 결제입니다</b>
      <p class="t-sub mt1">참여하실 때 결제가 되지만, 목표 인원에 못 미치면 자동으로 전액 환불됩니다.</p>
    </div>
    <div class="mt4">${[
    ['성사 조건', `마감 시각(${leftText(d.left)} 뒤)까지 ${num(d.goal)}명 이상 참여`],
    ['불발 시', '마감 즉시 전액 자동 환불 · 별도 신청 불필요'],
    ['환불 시점', '카드 2~5영업일 · 계좌이체 1~2영업일 · 간편결제 즉시~1일'],
    ['차액 환급', '단계가 내려가면 차액을 성사 확정 후 자동 환급'],
    ['마감 전 취소', '수수료 없이 언제든 가능'],
  ].map(([k, val]) => `<div class="row-b" style="padding:10px 0"><b class="nowrap" style="min-width:110px">${k}</b><span class="grow" style="text-align:right">${val}</span></div>`).join('')}</div>`,
    { cls: 'mt6' })}

  ${card('교환·반품', `<ul style="padding-left:18px;line-height:2">
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
  ]), { cls: 'mt6', aside: `<a class="more" href="${link('DE0203')}">판매자 정보 탭 ›</a>` })}

  <div class="mt6">${sec('유의사항', accordion([
    { q: '신선식품이라 크기·색에 차이가 있을 수 있습니다', a: '자연에서 자란 것이라 과마다 크기와 색이 조금씩 다릅니다. 다만 적어 둔 중량과 과수는 반드시 맞춥니다.' },
    { q: '성사 뒤 발송까지 며칠 걸립니다', a: '성사가 확정되면 그때 농가에 발주가 들어갑니다. 미리 따 두지 않기 때문에 3일 정도 걸리며, 대신 그만큼 신선합니다.' },
    { q: '수량이 많으면 나눠 올 수 있습니다', a: '10kg 이상 주문하시면 박스가 두 개로 나뉘어 하루 차이로 도착할 수 있습니다.' },
  ], 0))}</div>`;
  return { body, o: { stick } };
}

/* ── DE-03 공구 마감 - 성사 ────────────────────────────
   v: 'ready' 배송 준비 안내 */
function de03(ctx, v) {
  const d = dealById('d2');
  const top = `
  <div class="box center">
    <div style="font-size:40px">🎉</div>
    <h1 class="t-page mt2">성사됐어요! 목표를 넘었습니다</h1>
    <p class="t-sub mt2">${esc(d.nm)}</p>
    <div class="row wrap-row mt4 center" style="gap:0;justify-content:center">
      <div class="stat"><div class="n">${num(d.joined)}명</div><div class="l">최종 참여</div></div>
      <div class="stat"><div class="n">${won(d.now)}</div><div class="l">확정 가격</div></div>
      <div class="stat"><div class="n">${off(d.was, d.now)}%</div><div class="l">할인율</div></div>
    </div>
  </div>`;

  /* 배송 준비 안내 */
  if (v === 'ready') {
    const body = `${top}
    ${card('지금 어디까지 왔나요', timeline([
      ['참여 마감', '2026년 8월 4일 21:00 · 완료'],
      ['성사 확정', '2026년 8월 4일 21:03 · 완료'],
      ['진행자 발주', '2026년 8월 5일 10:20 · 완료'],
      ['상품 준비·포장', '진행 중 — 오늘 안에 끝납니다'],
      ['발송 시작', '2026년 8월 8일 예정'],
    ], 3), { cls: 'mt6' })}

    ${banner('warn', '📮', `<b>배송지를 고칠 수 있는 시간이 얼마 남지 않았습니다.</b>
      <p class="t-sub">8월 7일 18시까지 고치실 수 있습니다. 그 뒤에는 송장이 찍혀 바꾸기 어렵습니다.</p>`,
      { cls: 'mt6', right: btn('배송지 확인·수정', { cls: 'btn-primary btn-sm', href: 'AC-02' }) })}

    ${card('받으실 곳', `${kv([
      ['받는 분', '서지현'],
      ['연락처', '010-****-3120'],
      ['주소', '서울 성동구 아차산로 111, 5층 (성수동2가)'],
      ['배송 요청', '부재 시 경비실에 맡겨 주세요'],
    ])}
      <div class="btns mt4">${btn('배송지 바꾸기', { cls: 'btn-ghost btn-sm', href: 'AC-02' })}
        ${btn('요청사항 고치기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="요청사항을 고쳤어요" data-toast-kind="ok"' })}</div>`,
      { cls: 'mt6' })}

    ${card('발송 전 확인해 주세요', `<ul style="padding-left:18px;line-height:2">
      <li>신선식품이라 <b>부재 시 문 앞에 두면 상할 수 있습니다.</b> 받으실 수 있는 시간을 요청사항에 적어 주세요.</li>
      <li>제주·도서산간은 항공 운송이라 하루 더 걸립니다.</li>
      <li>송장이 찍히면 문자로 알려드립니다.</li>
    </ul>`, { cls: 'mt6' })}

    <div class="btns mt6 center">
      ${btn('내 참여 상세 보기', { cls: 'btn-primary btn-lg', href: 'MY-02' })}
      ${btn('공구 화면으로', { cls: 'btn-ghost btn-lg', href: 'DE-03' })}
    </div>`;
    return { body, o: { state: '성사 · 배송 준비 중 (발주 완료)' } };
  }

  const body = `${top}
  ${card('적용된 할인 단계', `${tierTable([
    { n: 50, price: 128000, done: true },
    { n: 100, price: 112000, done: true },
    { n: 150, price: 98000, done: true, now: true },
  ])}
    <div class="box mt4"><b>150명 단계까지 달성해 98,000원이 확정됐습니다.</b>
      <p class="t-sub mt1">앞 단계 가격으로 참여하셨다면 차액이 자동으로 환급됩니다. 별도 신청은 필요 없습니다.</p></div>`,
    { cls: 'mt6' })}

  ${card('앞으로 이렇게 진행됩니다', timeline([
    ['참여 마감', '2026년 8월 4일 21:00 · 완료'],
    ['성사 확정', '2026년 8월 4일 21:03 · 완료'],
    ['진행자 발주', '2026년 8월 5일 예정'],
    ['발송 시작', '2026년 8월 8일 예정'],
    ['배송 완료', '발송 후 1~2일'],
  ], 2), { cls: 'mt6', ft: btn('배송 준비 상황 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'DE0302' }) })}

  ${banner('pri', '📦', `<b>배송지가 맞는지 확인해 주세요.</b>
    <p class="t-sub">발주 전까지는 내 공구함에서 배송지를 고치실 수 있습니다.</p>`,
    { cls: 'mt6', right: btn('내 참여 확인', { cls: 'btn-primary btn-sm', href: 'MY-02' }) })}

  ${card('받으시면 후기를 남겨 주세요', '<p class="t-sub">사진과 함께 후기를 남기시면 다음 공구에서 쓰실 수 있는 3,000원 쿠폰을 드립니다.</p>',
    { cls: 'mt6', ft: btn('후기 쓰러 가기', { cls: 'btn-accent btn-block btn-sm', href: 'RV-01' }) })}

  <div class="mt8">${sec('비슷한 공구도 열려 있어요', dealCards(DEALS.slice(0, 3), pctOf, { cls: 'stair', rank: false }), { more: 'HO-02' })}</div>

  <div class="btns mt6 center">
    ${btn('내 공구함으로', { cls: 'btn-primary btn-lg', href: 'MY-01' })}
    ${btn('재오픈 알림 신청', { cls: 'btn-ghost btn-lg', attr: ' data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' })}
  </div>`;
  return { body, o: { state: '성사 · 최종 151명' } };
}

/* ── DE-04 공구 마감 - 불발(미달) ──────────────────────
   v: 'refunding' 환불 진행 중 · 'refunded' 환불 완료 */
function de04(ctx, v) {
  const d = dealById('d8');
  const done = v === 'refunded';
  const top = `
  <div class="box center">
    <div style="font-size:40px">${done ? '✅' : '😢'}</div>
    <h1 class="t-page mt2">${done ? '환불이 모두 끝났습니다' : '아쉽게도 인원이 모이지 않았어요'}</h1>
    <p class="t-sub mt2">${esc(d.nm)}</p>
    <div class="row wrap-row mt4 center" style="gap:0;justify-content:center">
      <div class="stat"><div class="n">${num(d.joined)}명</div><div class="l">최종 참여</div></div>
      <div class="stat mut"><div class="n">${num(d.goal)}명</div><div class="l">목표</div></div>
      <div class="stat mut"><div class="n">${num(d.goal - d.joined)}명</div><div class="l">부족</div></div>
    </div>
    <div style="max-width:420px;margin:16px auto 0">${gauge(pctOf(d), { miss: true })}</div>
  </div>`;

  const reopen = `${card('', `<div class="row-b wrap-row">
    <div><b>다시 열리면 알려드릴까요?</b>
      <p class="t-sub mt1">진행자가 같은 상품으로 다시 열 때 가장 먼저 알려드립니다. 지난번보다 목표 인원을 낮춰 여는 경우가 많습니다.</p></div>
    ${btn('재오픈 알림 신청', { cls: 'btn-accent', attr: ' data-toast="다시 열리면 알려드릴게요" data-toast-kind="ok"' })}
  </div>`, { cls: 'mt6' })}`;

  /* 환불 진행 중 */
  if (v === 'refunding') {
    const body = `${top}
    ${banner('warn', '⏳', `<b>환불이 카드사로 넘어갔습니다.</b>
      <p class="t-sub">따로 하실 것은 없습니다. 카드사 처리에 2~5영업일이 걸립니다.</p>`, { cls: 'mt6' })}

    ${card('환불 진행 상태', `${timeline([
      ['불발 확정', '2026년 8월 4일 18:00 · 완료'],
      ['환불 요청 전송', '2026년 8월 4일 18:01 · 완료'],
      ['카드사 처리 중', '지금 여기 — 보통 2~5영업일 걸립니다'],
      ['환불 완료', '8월 8일쯤 예정'],
    ], 2)}
      <div class="hr"></div>
      ${kv([
      ['환불 금액', won(d.now)],
      ['환불 수단', '국민카드 1234-**-**-5678 (결제 취소)'],
      ['요청 번호', 'RF-20260804-8841'],
      ['예상 완료', '2026년 8월 8일'],
    ])}`, { cls: 'mt6', ft: btn('환불 완료 화면 보기', { cls: 'btn-ghost btn-block btn-sm', href: 'DE0403' }) })}

    ${card('궁금하실 것들', accordion([
      { q: '카드 취소인데 왜 며칠 걸리나요?', a: '카드사가 승인 취소를 처리하는 데 걸리는 시간입니다. 저희 쪽 처리는 마감 직후 끝났습니다. 결제일과 취소일이 달이 넘어가면 다음 달 청구서에서 상계되기도 합니다.' },
      { q: '중간에 확인할 방법이 있나요?', a: '내 공구함 > 참여 상세에서 지금 어디까지 갔는지 보실 수 있습니다. 완료되면 문자로도 알려드립니다.' },
      { q: '5영업일이 지났는데 안 들어왔어요', a: '1:1 문의로 요청 번호를 알려주시면 카드사에 확인해 드립니다.' },
    ], 0), { cls: 'mt6' })}

    ${reopen}

    <div class="btns mt6 center">
      ${btn('내 공구함에서 보기', { cls: 'btn-primary btn-lg', href: 'MY-02' })}
      ${btn('문의하기', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
    </div>`;
    return { body, o: { state: '불발 · 환불 진행 중 (카드사 처리)' } };
  }

  /* 환불 완료 */
  if (done) {
    const body = `${top}
    ${banner('ok', '💳', `<b>${won(d.now)}이 전액 환불됐습니다.</b>
      <p class="t-sub">국민카드 1234-**-**-5678로 승인이 취소됐습니다. 카드 명세서에서 확인하실 수 있습니다.</p>`, { cls: 'mt6' })}

    ${card('환불 내역', `${timeline([
      ['불발 확정', '2026년 8월 4일 18:00 · 완료'],
      ['환불 요청 전송', '2026년 8월 4일 18:01 · 완료'],
      ['카드사 처리', '2026년 8월 6일 · 완료'],
      ['환불 완료', '2026년 8월 6일 14:22 · 완료'],
    ], 4)}
      <div class="hr"></div>
      ${table(
      ['항목', '금액'],
      [['결제 금액', won(d.now)], ['환불 금액', `<b>${won(d.now)}</b>`], ['수수료', '0원'], ['실제 부담', '0원']],
    )}`, { cls: 'mt6', ft: btn('영수증 내려받기', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="환불 영수증을 내려받았어요" data-toast-kind="ok"' }) })}

    ${reopen}

    <div class="mt8">${sec('지금 진행 중인 비슷한 공구', dealCards(DEALS.slice(2, 5), pctOf, { cls: 'stair', rank: false }), { more: 'HO-02' })}</div>

    <div class="btns mt6 center">
      ${btn('공구 더 둘러보기', { cls: 'btn-primary btn-lg', href: 'HO-02' })}
      ${btn('내 공구함', { cls: 'btn-ghost btn-lg', href: 'MY-01' })}
    </div>`;
    return { body, o: { state: '불발 · 환불 완료 (2026-08-06)', after: toastNow('환불이 완료됐어요', { ok: true, act: '내역 보기' }) } };
  }

  const body = `${top}
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
  ])}`, { cls: 'mt6', ft: `<div class="row" style="gap:8px">
      ${btn('환불 진행 중 화면', { cls: 'btn-ghost btn-sm grow', href: 'DE0402' })}
      ${btn('환불 완료 화면', { cls: 'btn-ghost btn-sm grow', href: 'DE0403' })}</div>` })}

  ${reopen}

  <div class="mt8">${sec('지금 진행 중인 비슷한 공구', dealCards(DEALS.slice(2, 5), pctOf, { cls: 'stair', rank: false }), { more: 'HO-02' })}</div>

  <div class="btns mt6 center">
    ${btn('공구 더 둘러보기', { cls: 'btn-primary btn-lg', href: 'HO-02' })}
    ${btn('문의하기', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
  </div>`;
  return { body, o: { state: '불발 · 41/300명 · 전액 환불 진행 중' } };
}

export const PAGES = {
  'HO-01': ho01,
  HO0102: (c) => ho01(c, 'me'),
  HO0103: (c) => ho01(c, 'soon'),
  HO0104: (c) => ho01(c, 'empty'),
  'HO-02': ho02,
  HO0202: (c) => ho02(c, 'filter'),
  HO0203: (c) => ho02(c, 'loading'),
  HO0204: (c) => ho02(c, 'wish'),
  'HO-03': ho03,
  HO0302: (c) => ho03(c, '1h'),
  HO0303: (c) => ho03(c, 'noti'),
  'HO-04': ho04,
  HO0402: (c) => ho04(c, 'recloading'),

  'DE-01': de01,
  DE0102: (c) => de01(c, 'info'),
  DE0103: (c) => de01(c, 'review'),
  DE0104: (c) => de01(c, 'qna'),
  DE0105: (c) => de01(c, 'tier'),
  DE0106: (c) => de01(c, 'max'),
  'DE-02': de02,
  DE0202: (c) => de02(c, 'ship'),
  DE0203: (c) => de02(c, 'seller'),
  'DE-03': de03,
  DE0302: (c) => de03(c, 'ready'),
  'DE-04': de04,
  DE0402: (c) => de04(c, 'refunding'),
  DE0403: (c) => de04(c, 'refunded'),
};
