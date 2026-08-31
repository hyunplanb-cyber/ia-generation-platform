/* HO 홈 (5) */
import * as U from './ui.mjs';
import { SITE, GEAR, PACKS, 기간, 남은수, REVIEWS } from './data.mjs';

export const PAGES = {};

/** 히어로 — 레이아웃 A: "폭을 꽉 채운 배경 위에 큰 검색바 1개. 아래에 숫자 지표 3개" */
const hero = (h1, lead) => `<section class="hero"><div class="hero-in">
  <h1>${h1}</h1>
  <p class="lead">${lead}</p>
  <div class="searchbar">
    <div class="fld"><span class="lb">무엇을</span><span class="val">캠핑 장비</span></div>
    <div class="fld"><span class="lb">빌리는 날</span><span class="val">8월 15일 (토)</span></div>
    <div class="fld"><span class="lb">돌려주는 날</span><span class="val">8월 17일 (월)</span></div>
    <div class="fld"><span class="lb">몇 개</span><span class="val">2개</span></div>
    ${U.btn('찾아보기', { cls: 'btn-pri go', href: 'HO-03' })}
  </div>
  <div class="hero-stats">
    <div><div class="n">1,240<span style="font-size:15px">개</span></div><div class="l">빌려줄 수 있는 장비</div></div>
    <div><div class="n">8,600<span style="font-size:15px">건</span></div><div class="l">지금까지 빌려간 횟수</div></div>
    <div><div class="n">4.8</div><div class="l">평균 별점</div></div>
  </div>
</div></section>`;

const 카테고리 = ['텐트', '타프', '침낭', '화로대', '의자', '카메라', '렌즈', '조명'];

PAGES['HO-01'] = () => ({
  o: { hero: hero('필요한 날에만 빌려 쓰세요', '사 두면 일 년에 두세 번 씁니다. 쓸 날만 잡아 빌리고, 쓰고 나면 돌려주세요.<br>보증금은 돌려받는 돈이라 실제로 드는 값은 대여료뿐입니다.') },
  body: `${U.sec('', `<div class="g4">${카테고리.map((c) => `<a class="box" style="text-align:center" href="${U.link('HO-02')}">
    <div style="font-size:26px">${{ 텐트: '⛺', 타프: '🏕', 침낭: '🛏', 화로대: '🔥', 의자: '🪑', 카메라: '📷', 렌즈: '🔭', 조명: '💡' }[c]}</div>
    <div class="strong mt2">${c}</div></a>`).join('')}</div>`)}

${U.sec('이번 주 많이 빌려간 장비', `<div class="cards">${GEAR.slice(0, 4).map((g) => U.gearCard(g, { left: 남은수(g.id, 15) })).join('')}</div>`,
  { more: 'PD-01', moreLabel: '전체 보기' })}

${U.sec('이번 주말 아직 남은 장비', `
  ${U.banner('warn', '⏳', '주말은 일찍 나갑니다. <b>8월 15~17일</b> 기준으로 아직 남은 것만 모았어요.')}
  <div class="cards mt6">${GEAR.slice(2, 6).map((g) => U.gearCard(g, { left: Math.max(1, 남은수(g.id, 15)) })).join('')}</div>`)}

${U.sec('세트로 빌리면 더 쌉니다', `<div class="card"><div class="card-bd row wrap-row" style="gap:var(--sp-block)">
  <div style="width:200px">${U.ph(['패키지 사진', 800, 800], { seed: 'pack' })}</div>
  <div class="grow">
    <h3 class="t-card">${PACKS[0].nm}</h3>
    <p class="t-sub mt2">${PACKS[0].items.map((id) => U.gearOf(id).nm).join(' · ')}</p>
    <p class="mt4"><span class="muted" style="text-decoration:line-through">${U.won(110_300)}</span>
      <b style="font-size:22px;margin-left:8px">${U.won(PACKS[0].day)}</b> <span class="t-sub">/ 1일</span>
      ${U.badge('22% 절약', 'b-solid')}</p>
  </div>
  <div class="btns-v" style="width:180px">
    ${U.btn('패키지 보기', { cls: 'btn-pri', href: 'PD-06', w: true })}
    ${U.btn('낱개로 고르기', { href: 'PD-01', w: true })}
  </div>
</div></div>`)}

${U.sec('처음이신가요', `<div class="g3">
  ${[['①', '고른다', '쓸 날짜를 먼저 고르면 그날 빌릴 수 있는 것만 보여드려요.'],
     ['②', '받는다', '매장에 오시거나 택배로 받으세요. 받을 때 사진을 함께 남깁니다.'],
     ['③', '돌려준다', '쓰고 나서 반납하면 점검 후 보증금을 돌려드려요.']]
    .map(([n, t, d]) => `<div class="box"><div class="t-sec pri">${n}</div>
      <div class="t-card mt2">${t}</div><p class="t-sub mt2">${d}</p></div>`).join('')}
</div>`)}

${U.sec('보증금과 연체료, 미리 알려드려요', `<div class="g2">
  ${U.card('보증금', `<p>장비가 다치지 않았는지 확인할 때까지 <b>잠시 걸어두는 돈</b>입니다.
    빠져나가지 않고 카드 한도만 잡히며, 반납 확인 후 <b>3영업일 안에</b> 풀립니다.</p>
    <p class="t-sub mt3">3회 이상 빌리시고 연체가 없으면 보증금이 면제됩니다.</p>`)}
  ${U.card('연체료', `<p>하루 늦으면 <b>1일 대여료의 30%</b>가 붙습니다.
    다음 분이 못 빌리게 되기 때문이에요.</p>
    <p class="t-sub mt3">늦을 것 같으면 <b>반납일 전에 연장</b>해 주세요. 연장이 훨씬 쌉니다.</p>`)}
</div>`, { more: 'CS-03', moreLabel: '이용 안내 전체' })}

${U.sec('빌려 쓰신 분들 이야기', `<div class="g3">${REVIEWS.map((r) => `<div class="box">
  ${U.stars(r.r)} <span class="t-sub">${r.tag}</span>
  <p class="mt3">${r.t}</p>
  <p class="t-sub mt3">${r.nm} · ${r.at}</p></div>`).join('')}</div>`)}

${U.sec('찾아오시는 길', `${U.card('', `<div class="row wrap-row" style="gap:var(--sp-block)">
  <div style="width:280px">${U.ph(['지도', 800, 600], { seed: 'map' })}</div>
  <div class="grow">${U.kv([
    ['주소', SITE.addr],
    ['전화', `<span class="num">${SITE.tel}</span>`],
    ['운영시간', '평일 10:00~19:00 · 토 10:00~17:00'],
    ['휴무', '일요일 · 공휴일'],
  ], { cls: 'left' })}
  <p class="t-sub mt4">일요일에 돌려주시려면 <b>토요일까지</b> 오셔야 해요. 택배 회수는 일요일에도 됩니다.</p></div>
</div>`)}`)}`,
});

PAGES['HO-02'] = () => ({
  body: `${U.pageHd('캠핑 장비', '텐트부터 화로대까지, 쓸 날짜만 고르시면 됩니다.')}

${U.chips(['전체', '텐트', '타프', '화로대', '의자'], 0, { cat: true })}

${U.banner('info', '📅', `지금 보고 계신 기간은 <b>${기간.라벨}</b>입니다. 이 기간에 빌릴 수 있는 것만 보여드려요.`, {
  cls: 'mt6', right: `<div class="row" style="gap:var(--sp-btn)">${U.check('이 기간에 되는 것만', { on: true, none: true })}${U.btn('기간 바꾸기', { sm: true, href: 'HO-03' })}</div>`,
})}

<div class="cards mt6" data-catlist>${GEAR.filter((g) => ['텐트', '타프', '화로대', '의자'].includes(g.cat)).map((g) => U.gearCard(g, { left: 남은수(g.id, 15), cat: true })).join('')}</div>

${U.sec('처음 빌리신다면 — 인원수로 고르세요', U.table(
  ['몇 명이서', '맞는 텐트', '함께 빌리면 좋은 것'],
  [['2명 (커플·솔로)', '2~3인용', '체어 2개 · 화로대'],
   ['4명 (가족)', '4인용', '타프 · 체어 4개 · 테이블'],
   ['6명 이상', '6인용 또는 2동', '대형 타프 · 화로대 2개']],
), { cls: 'mt8' })}

${U.sec('함께 빌리면 좋아요', `<div class="cards">${GEAR.slice(1, 5).map((g) => U.gearCard(g, { left: 남은수(g.id, 15) })).join('')}</div>`)}

${U.sec('이 종류 자주 묻는 질문', U.accordion([
  { q: '비 오면 어떻게 하나요?', a: '젖은 채로 반납하셔도 됩니다. 다만 접어서 가방에 넣지 말고 그대로 가져다 주세요. 곰팡이가 생기면 배상해야 합니다. 건조비 20,000원이 붙습니다.' },
  { q: '설치를 못 하면요?', a: '장비마다 설치 영상 링크를 드리고, 매장에서 받으실 때 한 번 보여드립니다. 현장에서 막히면 전화 주세요.' },
  { q: '팩이나 폴대를 잃어버리면요?', a: '부품별 기준액이 정해져 있습니다. 폴대 15,000원, 팩 1개 1,000원입니다. 반납할 때 미리 말씀해 주시면 조정될 수 있어요.' },
  { q: '흙이 묻은 채로 반납해도 되나요?', a: '털어만 주시면 됩니다. 세척이 필요할 정도면 20,000원이 붙습니다.' },
], 0), { cls: 'mt8' })}

${U.banner('warn', '⚠', '<b>보관·사용 주의</b> — 젖은 채로 접어 넣으면 곰팡이가 생겨 배상 대상이 됩니다. 그대로 가져다 주세요.', { cls: 'mt8' })}`,
});

PAGES['HO-03'] = () => {
  const 걸린것 = GEAR.map((g) => ({ g, left: 남은수(g.id, 15) }));
  return {
    body: `${U.pageHd('찾은 결과', `${기간.라벨} · 이 기간에 빌릴 수 있는 장비 ${걸린것.filter((x) => x.left > 0).length}개`,
      U.btn('기간 바꾸기', { cls: 'btn-ghost', attr: ' data-modal="m-date"' }))}

${U.listPage(U.card('조건 좁히기', `
  ${U.field('기간', `<div class="box" style="padding:10px 12px">
    <div class="strong">8월 15일 (토)</div>
    <div class="t-sub">↓ 2박 3일</div>
    <div class="strong">8월 17일 (월)</div>
  </div>
  <div class="mt3">${U.btn('달력에서 고르기', { sm: true, w: true, attr: ' data-modal="m-date"' })}</div>`)}
  ${U.field('1일 대여료', `<div class="row"><input class="in" type="text" value="0" aria-label="최저 대여료"><span>~</span><input class="in" type="text" value="100,000" aria-label="최고 대여료"></div>`)}
  ${U.field('보증금', `<div class="stack">${U.check('없음', { none: true })}${U.check('10만원 이하', { on: true, none: true })}${U.check('10만원 초과', { none: true })}</div>`)}
  ${U.field('받는 방법', `<div class="stack">${U.check('매장 방문', { on: true, none: true })}${U.check('택배 왕복 (+6,000원)', { on: true, none: true })}</div>`)}
  ${U.field('브랜드', `<div class="stack">${['카즈미', '스노우피크', '코베아', '헬리녹스', '소니'].map((b) => U.check(b, { none: true })).join('')}</div>`)}
  <div class="btns-v mt6">
    ${U.btn('이 조건으로 찾기', { cls: 'btn-pri', w: true, attr: ' data-toast="조건을 적용했어요"' })}
    ${U.btn('조건 지우기', { w: true, href: 'HO-03' })}
  </div>`), `
  <div class="row-b mb6 wrap-row">
    ${U.chips(['전체', '텐트', '타프', '화로대', '의자', { t: '촬영 장비', cat: '촬영' }], 0, { cat: true })}
    ${U.정렬고르개('gear', [['rec', '추천순'], ['price', '대여료 낮은 순'], ['rate', '별점 높은 순', true], ['left', '많이 남은 순', true]])}
  </div>

  <div class="cards" data-catlist style="grid-template-columns:repeat(3,minmax(0,1fr))" data-sort-list="gear">
    ${걸린것.filter((x) => x.left > 0).map((x, i) => U.gearCard(x.g, { left: x.left, i, cat: true })).join('')}
  </div>

  ${U.sec('이 기간엔 다 나갔어요', `
    <p class="t-sub mb4">아래 장비는 8월 15~17일에 남은 게 없습니다. 다음 가능한 날짜를 함께 적어 뒀어요.</p>
    <div class="cards" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      ${GEAR.slice(6, 8).map((g) => U.gearCard(g, { left: 0, nextDay: '8월 20일' })).join('')}
    </div>`, { cls: 'mt8' })}

  <div class="btns mt8" style="justify-content:center">
    ${U.btn('더 보기', { attr: ' data-toast="다음 12개를 불러왔어요"' })}
    ${U.btn('결과 없을 때 화면', { sm: true, href: 'HO-04' })}
  </div>`)}

${U.modal('m-date', '언제 쓰실 건가요?',
  `${U.cal('G-101', { qty: 1, sel: [15, 17] })}
   <p class="t-sub mt4">날짜를 두 번 누르면 빌리는 날과 돌려주는 날이 잡힙니다.</p>`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('이 기간으로 보기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="8월 15~17일로 다시 찾았어요"' })}`)}`,
  };
};

PAGES['HO-04'] = () => ({
  body: `${U.pageHd('찾은 결과', '조건에 맞는 장비가 없습니다')}

${U.empty('📅', '8월 15일 ~ 17일에 빌릴 수 있는 장비가 없어요',
  '광복절 연휴라 캠핑 장비가 일찍 나갔어요. 아래 방법 중 하나로 찾아보세요.',
  `${U.btn('기간을 하루씩 넓혀 보기', { cls: 'btn-pri', href: 'HO-03' })}${U.btn('조건 지우기', { href: 'HO-03' })}`)}

<div class="g2 mt8">
  ${U.card('이 날짜는 비어 있어요', `<div class="chips">
    ${['8/13 ~ 8/15', '8/20 ~ 8/22', '8/22 ~ 8/24'].map((d) => `<button class="chip" type="button" data-go="${U.link('HO-03')}">${d}</button>`).join('')}
  </div>
  <p class="t-sub mt4">누르면 그 날짜로 다시 찾습니다. 평일이 섞이면 대여료도 30% 쌉니다.</p>`)}
  ${U.card('걸어 둔 조건을 풀어 보세요', `<div class="stack">
    <div class="row-b"><span>브랜드 — 스노우피크만</span>${U.btn('해제', { sm: true, attr: ' data-toast="브랜드 조건을 풀었어요"' })}</div>
    <div class="row-b"><span>받는 방법 — 매장 방문만</span>${U.btn('해제', { sm: true, attr: ' data-toast="택배도 함께 봅니다"' })}</div>
    <div class="row-b"><span>보증금 — 10만원 이하</span>${U.btn('해제', { sm: true, attr: ' data-toast="보증금 조건을 풀었어요"' })}</div>
  </div>`)}
</div>

${U.card('자리 나면 알려드릴게요', `
  <p>취소가 생기면 <b>문자로</b> 바로 알려드립니다. 선착순이라 빨리 오시는 분이 가져가세요.</p>
  <div class="row wrap-row mt4" style="gap:var(--sp-item)">
    ${U.input({ ph: '010-0000-0000', type: 'tel' })}
    ${U.btn('알림 신청', { cls: 'btn-pri', attr: ' data-toast="신청했어요. 자리가 나면 문자로 알려드릴게요" data-toast-kind="ok"' })}
  </div>
  <p class="t-sub mt3">지금 이 기간을 기다리는 분이 <b>3명</b> 있습니다.</p>`, { cls: 'mt8' })}

${U.sec('비슷한 장비는 어떠세요', `<div class="cards">${GEAR.slice(1, 5).map((g) => U.gearCard(g, { left: 3 })).join('')}</div>`, { cls: 'mt8' })}`,
});

PAGES['HO-05'] = () => ({
  body: `${U.pageHd('기획전 · 특가', '종료까지 <b class="num pri" data-count="196927">2:14:22</b> 남았어요')}

${U.banner('info', '🎟', '<b>기획전 쿠폰</b> — 5만원 이상 빌리시면 10% 할인. 이번 기획전 장비에만 쓸 수 있어요.', {
  right: U.btn('쿠폰 받기', { cls: 'btn-pri', sm: true, attr: ' data-toast="쿠폰을 받았어요" data-toast-kind="ok"' }),
})}

<div class="mt6">${U.tabs([{ label: '평일 특가' }, { label: '장기 대여' }, { label: '첫 대여 혜택' }], 0, { pill: true })}</div>

<div class="cards mt6">${GEAR.slice(0, 4).map((g) => `<a class="item" href="${U.link('PD-02')}">
  <div class="thumb">${U.phGear(g.id)}<div class="on-thumb">${U.badge('30% 할인', 'b-solid')}</div></div>
  <div class="bd">
    <div class="nm">${g.nm}</div>
    <div class="meta">${g.brand}</div>
    <div class="price">
      <span class="muted t-sub" style="text-decoration:line-through">${U.won(g.day)}</span>
      <div><span class="d">${U.num(Math.round(g.day * 0.7 / 100) * 100)}</span><span class="u">원 / 1일</span></div>
    </div>
  </div></a>`).join('')}</div>

<div class="g2 mt8">
  ${U.card('평일에 빌리면 30% 쌉니다', `
    <p class="t-sub mb4">월요일부터 목요일 사이에 빌려 가시면 대여료가 30% 내려갑니다. 주말에 몰리는 걸 나누려는 것이에요.</p>
    ${U.table(['요일', '대여료'], [
      ['월 · 화 · 수 · 목', `${U.badge('30% 할인', 'b-solid')} <span class="num">32,400원</span>`],
      ['금 · 토', `${U.badge('20% 할증', 'b-warn')} <span class="num">55,600원</span>`],
      ['일', '<span class="num">46,300원</span> (정가)'],
    ])}`)}
  ${U.card('오래 빌리면 더 쌉니다', `
    ${U.table(['빌리는 기간', '할인', '4인 텐트 기준'], [
      ['3일 이상', '10%', '<span class="num">125,000원</span>'],
      ['7일 이상', '20%', '<span class="num">259,300원</span>'],
      ['30일 이상', '35%', '<span class="num">902,850원</span>'],
    ])}
    <p class="t-sub mt4">할인은 자동으로 붙습니다. 따로 고르실 것 없어요.</p>`)}
</div>

${U.card('처음 빌리시는 분은 보증금이 없어요', `
  <p>첫 대여에 한해 <b>보증금을 받지 않습니다.</b> 어떤 서비스인지 모르는 채로 큰돈을 걸어두시게 하고 싶지 않아서예요.</p>
  <p class="t-sub mt3">3회 이상 이용하시고 연체·파손이 없으면 그 뒤로도 계속 면제됩니다.</p>`, { cls: 'mt8' })}

${U.card('기획전 이용 조건', `<ul class="stack">
  <li>· 기획전 쿠폰은 <b>5만원 이상</b> 빌릴 때만 쓸 수 있습니다.</li>
  <li>· <b>세트 패키지와 신상 장비</b>는 기획전에서 빠집니다.</li>
  <li>· 평일 할인과 장기 할인은 <b>함께 적용</b>됩니다.</li>
  <li>· 기획전 쿠폰은 다른 쿠폰과 <b>함께 쓸 수 없습니다.</b></li>
</ul>`, { cls: 'mt6' })}

${U.banner('warn', '⏳', '지난 기획전은 <b>이미 끝났습니다.</b> 다음 기획전은 9월 첫 주에 열립니다.', {
  cls: 'mt6', right: U.btn('열리면 알림 받기', { sm: true, attr: ' data-toast="기획전이 열리면 알려드릴게요" data-toast-kind="ok"' }),
})}`,
});
