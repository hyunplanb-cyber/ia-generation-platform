/* ST 통계·리포트 (4) */
import * as U from './ui.mjs';
import { SALES_7D, PRODUCTS, CUSTOMERS, PERIOD } from './data.mjs';

export const PAGES = {};

const 총매출 = SALES_7D.reduce((a, b) => a + b.v, 0);
const 주문수 = 87;
const 객단가 = Math.round(총매출 / 주문수 / 100) * 100;

PAGES['ST-01'] = () => ({
  body: `${U.pageHd('매출 통계', `${PERIOD} · 전주 대비`,
    `${U.btn('고객 통계', { href: 'ST-02' })}${U.btn('리포트 내보내기', { cls: 'btn-pri', href: 'ST-03' })}`)}

<div class="filters">
  ${U.select(['최근 7일', '오늘', '이번 달', '지난 달', '직접 지정'], 0)}
  ${U.select(['전주 대비', '전월 대비', '전년 동기 대비'], 0)}
</div>

${U.statRow([
  [U.won(총매출), '총 매출', { d: U.up('전주보다 14%') }],
  [`${주문수}건`, '주문 수', { d: U.up('전주보다 9건') }],
  [U.won(객단가), '객단가', { d: U.up('전주보다 2,100원') }],
  ['3.4%', '환불률', { cls: 'warn', d: U.dn('전주보다 0.8%p') }],
])}

${U.sec('일별 매출 추이', `${U.bars(SALES_7D)}
${U.table([{ t: '날짜', w: '96px' }, { t: '매출', w: '112px', cls: 'r nowrap' }, { t: '주문', w: '68px', cls: 'r' }, { t: '객단가', w: '104px', cls: 'r nowrap' }, '비고'],
  SALES_7D.map((d, i) => {
    /* d.d 는 '8/4' 꼴이다. 표에는 연도까지 적는다 — 리포트로 뽑았을 때 언제 것인지 남아야 한다. */
    const [월, 일] = d.d.split('/');
    const 주문 = 8 + i * 2;
    return [
      `<span class="num">2026-${월.padStart(2, '0')}-${일.padStart(2, '0')}</span>`,
      { t: `<span class="num">${U.won(d.v)}</span>`, cls: 'r nowrap' },
      { t: `<span class="num">${주문}</span>`, cls: 'r' },
      { t: `<span class="num">${U.won(Math.round(d.v / 주문 / 100) * 100)}</span>`, cls: 'r nowrap' },
      i === 5 ? '<b>주말 최고 매출</b>' : (i === 6 ? '<span class="muted">오늘 · 영업 중</span>' : ''),
    ];
  }),
  { foot: ['합계', { t: U.won(총매출), cls: 'r' }, { t: `${주문수}건`, cls: 'r' }, { t: U.won(객단가), cls: 'r' }, ''] })}`,
  { cls: 'mt8', aside: '<span class="t-sub">그래프 위 숫자가 그날 매출입니다</span>' })}

<div class="g2 mt8">
  ${U.card('결제수단별 비중', U.donut([
    { d: '카드', v: 2_418_000, c: '#111111' },
    { d: '간편결제', v: 981_000, c: '#666666' },
    { d: '현금', v: 402_000, c: '#B8B8B8' },
    { d: '계좌이체', v: 148_000, c: '#E0E0E0' },
  ]))}
  ${U.card('채널별 매출', U.table(['채널', { t: '매출', w: '112px', cls: 'r nowrap' }, { t: '비중', w: '64px', cls: 'r' }], [
    ['매장 결제', { t: '<span class="num">2,104,000원</span>', cls: 'r nowrap' }, { t: '<span class="num">53%</span>', cls: 'r' }],
    ['온라인 예약', { t: '<span class="num">1,388,000원</span>', cls: 'r nowrap' }, { t: '<span class="num">35%</span>', cls: 'r' }],
    ['상품 주문', { t: '<span class="num">457,000원</span>', cls: 'r nowrap' }, { t: '<span class="num">12%</span>', cls: 'r' }],
  ]))}
</div>

${U.sec('요일·시간대별 매출', `${U.card('', `<div class="heat">
  <div></div>${['월', '화', '수', '목', '금', '토', '일'].map((d) => `<div class="h">${d}</div>`).join('')}
  ${['10시', '12시', '14시', '16시', '18시', '20시'].map((t, r) => `<div class="r">${t}</div>${[0, 1, 2, 3, 4, 5, 6].map((c) => {
    const v = (r * 3 + c * 2) % 10;
    return `<div class="c" style="background:rgba(17,17,17,${(0.04 + v * 0.07).toFixed(2)})" title="${t} ${['월', '화', '수', '목', '금', '토', '일'][c]}요일"></div>`;
  }).join('')}`).join('')}
</div>
<p class="t-sub mt4">진할수록 매출이 큰 시간대입니다. <b>토요일 14~18시</b>가 가장 붐빕니다 — 그 시간에 직원을 더 배치해 보세요.</p>`)}`, { cls: 'mt8' })}

${U.card('목표 대비', `
  <div class="row-b mb3"><span>8월 매출 목표 <b>15,000,000원</b></span><b class="num">26%</b></div>
  ${U.progress(26)}
  <p class="t-sub mt3">10일 지나 26% — 이 속도면 월말에 <b>11,847,000원</b>입니다. 목표까지 <b>3,153,000원</b> 모자랍니다.</p>`, { cls: 'mt8' })}`,
});

PAGES['ST-02'] = () => ({
  body: `${U.pageHd('고객 통계', `${PERIOD}`,
    `${U.btn('매출 통계', { href: 'ST-01' })}${U.btn('세그먼트로 알림 보내기', { cls: 'btn-pri', href: 'MK-01' })}`)}

${U.statRow([
  ['2명', '신규 고객', { d: U.up('전주보다 1명') }],
  ['62%', '재방문 비중', { d: U.up('전주보다 4%p') }],
  ['47일', '평균 재방문 주기'],
  ['3명', '이탈 위험', { cls: 'warn', d: '90일 이상 미방문' }],
])}

<div class="g2 mt8">
  ${U.card('신규 vs 재방문', U.donut([
    { d: '재방문', v: 62, c: '#111111' },
    { d: '신규', v: 38, c: '#D97757' },
  ]))}
  ${U.card('등급별 분포', U.table(['등급', { t: '인원', w: '64px', cls: 'r' }, { t: '누적 구매액', w: '116px', cls: 'r nowrap' }, { t: '비중', w: '60px', cls: 'r' }],
    ['VIP', '단골', '신규', '휴면'].map((g) => {
      const list = CUSTOMERS.filter((c) => c.gr === g);
      const amt = list.reduce((a, c) => a + c.amt, 0);
      return [U.stBadge(g),
        { t: `<span class="num">${list.length}명</span>`, cls: 'r' },
        { t: `<span class="num">${U.won(amt)}</span>`, cls: 'r nowrap' },
        { t: `<span class="num">${Math.round(list.length / CUSTOMERS.length * 100)}%</span>`, cls: 'r' }];
    })))}
</div>

${U.sec('기간별 신규 고객', U.bars(
  [{ d: '5월', v: 7 }, { d: '6월', v: 9 }, { d: '7월', v: 6 }, { d: '8월', v: 2 }],
  { fmt: (n) => `${n}명` },
), { cls: 'mt8', desc: '8월은 아직 10일밖에 지나지 않았습니다.' })}

<div class="g2 mt8">
  ${U.card('상위 매출 고객 TOP 10', U.table([{ t: '#', w: '30px' }, '고객', { t: '방문', w: '54px', cls: 'r' }, { t: '누적', w: '116px', cls: 'r nowrap' }],
    [...CUSTOMERS].sort((a, b) => b.amt - a.amt).slice(0, 6).map((c, i) => ({
      href: 'CU-02',
      cells: [`<span class="muted num">${i + 1}</span>`, `<b>${c.nm}</b> ${U.stBadge(c.gr)}`,
        { t: `<span class="num">${c.visit}</span>`, cls: 'r' },
        { t: `<span class="num">${U.won(c.amt)}</span>`, cls: 'r nowrap' }],
    }))))}

  <div class="stack" style="gap:var(--sp-block)">
    ${U.card('고객 생애가치(LTV) 추정', `
      ${U.sumRows([
        ['평균 객단가', '<span class="num">145,300원</span>'],
        ['연간 평균 방문', '<span class="num">7.8회</span>'],
        ['평균 유지 기간', '<span class="num">2.4년</span>'],
      ], ['1인당 LTV', '<span class="num">2,720,000원</span>'])}
      <p class="t-sub mt3">한 명을 데려오는 데 <b>272,000원</b>(LTV의 10%)까지는 써도 남는 장사라는 뜻입니다.</p>`)}

    ${U.card('이탈 위험 고객', `<p class="t-sub mb4">90일 이상 안 오신 분 <b>3명</b>. 재방문 유도 알림을 보내 보세요.</p>
      ${U.table(['고객', { t: '마지막 방문', w: '96px' }, { t: '누적', w: '104px', cls: 'r nowrap' }],
        [['강민혁', '<span class="num">2026-02-14</span>', { t: '<span class="num">410,000원</span>', cls: 'r nowrap' }]])}
      <div class="mt4">${U.btn('이 세그먼트에 알림 보내기', { cls: 'btn-pri', w: true, href: 'MK-01' })}</div>`)}
  </div>
</div>

${U.card('지역·연령·성별', `<div class="g3">
  ${U.kv([['강남구', '42%'], ['서초구', '23%'], ['송파구', '11%'], ['그 외', '24%']], { cls: 'left' })}
  ${U.kv([['20대', '18%'], ['30대', '44%'], ['40대', '27%'], ['50대 이상', '11%']], { cls: 'left' })}
  ${U.kv([['여성', '71%'], ['남성', '26%'], ['선택 안 함', '3%']], { cls: 'left' })}
</div>
<p class="t-sub mt4">고객 등록 때 받은 값만 셉니다. 안 받은 항목은 「선택 안 함」으로 잡힙니다.</p>`, { cls: 'mt8' })}`,
});

PAGES['ST-03'] = () => ({
  body: `${U.pageHd('리포트 내보내기', '보고 자료로 쓸 파일을 만듭니다.', U.btn('매출 통계', { href: 'ST-01' }))}

<div class="split-r">
  <div>
    ${U.card('무엇을', `
      ${U.field('리포트 유형', `<div class="chips">${['매출', '고객', '상품', '예약'].map((t, i) => `<button class="chip${i === 0 ? ' on' : ''}" type="button">${t}</button>`).join('')}</div>`, { req: true })}
      ${U.field('기간', `<div class="f2">${U.input({ type: 'date', v: '2026-08-01' })}${U.input({ type: 'date', v: '2026-08-10' })}</div>`, { req: true })}`)}

    ${U.card('포함할 항목', `<div class="g2">
      ${['일별 매출', '결제수단별 비중', '채널별 매출', '요일·시간대 히트맵', '상품별 실적', '환불 내역', '목표 대비 달성률', '전기 대비 증감']
        .map((t, i) => U.check(t, { on: i < 5, none: true })).join('')}
    </div>`, { cls: 'mt6' })}

    ${U.card('어떻게', `
      ${U.field('형식', `<div class="chips">${['엑셀 (.xlsx)', 'PDF', 'CSV'].map((t, i) => `<button class="chip${i === 0 ? ' on' : ''}" type="button">${t}</button>`).join('')}</div>`)}
      ${U.field('파일명', U.input({ v: '살롱드무드_매출리포트_202608' }))}
      ${U.field('요약 코멘트', U.textarea({ ph: '이 리포트를 보는 사람에게 남길 말. 파일 첫 장에 들어갑니다.' }))}`, { cls: 'mt6' })}

    ${U.card('정기 리포트', `
      ${U.check('정기적으로 만들어 이메일로 보내기', { on: true, sub: '매번 들어와서 만들지 않아도 됩니다.' })}
      <div class="f2 mt4">
        ${U.field('주기', U.select(['매주 월요일', '매월 1일', '매월 말일'], 0))}
        ${U.field('받는 사람', U.input({ v: 'jiwoo@salon.example' }))}
      </div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack">
    ${U.card('생성 미리보기', `
      ${U.sumRows([
        ['유형', '매출 리포트'],
        ['기간', '2026-08-01 ~ 08-10'],
        ['항목', '5개'],
        ['형식', '엑셀 (.xlsx)'],
      ], ['예상 용량', '약 42KB'])}
      <div class="box mt4" style="background:var(--bg)">
        <div class="t-sub">1장 요약 · 2장 일별 매출 · 3장 결제수단 · 4장 채널 · 5장 히트맵</div>
      </div>`, {
        ft: `<div class="btns-v">
          ${U.btn('다운로드', { cls: 'btn-pri', w: true, attr: ' data-toast="리포트를 만들어 내려받았어요" data-toast-kind="ok"' })}
          ${U.btn('이메일로 보내기', { w: true, attr: ' data-toast="jiwoo@salon.example 로 보냈어요" data-toast-kind="ok"' })}
        </div>`,
      })}
  </div>
</div>

${U.card('최근 만든 리포트', U.table([{ t: '만든 날', w: '112px' }, '이름', { t: '유형', w: '68px' }, { t: '형식', w: '80px' }, { t: '', w: '80px' }], [
  ['<span class="num sub">2026-08-03</span>', '살롱드무드_매출리포트_202607', '매출', '엑셀', U.btn('다시 받기', { sm: true, attr: ' data-toast="다시 내려받았어요"' })],
  ['<span class="num sub">2026-07-01</span>', '살롱드무드_고객리포트_202606', '고객', 'PDF', U.btn('다시 받기', { sm: true, attr: ' data-toast="다시 내려받았어요"' })],
]), { cls: 'mt8' })}`,
});

PAGES['ST-04'] = () => {
  const 정렬 = [...PRODUCTS].sort((a, b) => b.price * b.sold - a.price * a.sold);
  return {
    body: `${U.pageHd('상품별 실적', `${PERIOD} · ${PRODUCTS.length}개 상품`,
      `${U.btn('매출 통계', { href: 'ST-01' })}${U.btn('상품 목록', { href: 'PD-01' })}`)}

<div class="filters">
  ${U.select(['매출순', '판매량순', '마진순'], 0)}
  ${U.select(['카테고리 전체', ...new Set(PRODUCTS.map((p) => p.cat))], 0)}
  ${U.select(['전주 대비', '전월 대비'], 0)}
</div>

${U.table(
  [{ t: '#', w: '30px' }, '상품', { t: '카테고리', w: '76px' },
   { t: '판매량', w: '68px', cls: 'r' }, { t: '매출', w: '116px', cls: 'r nowrap' },
   { t: '마진', w: '108px', cls: 'r nowrap' }, { t: '마진율', w: '68px', cls: 'r' },
   { t: '추이', w: '64px' }, { t: '재고 회전', w: '76px', cls: 'r' }],
  정렬.map((p, i) => {
    const 매출 = p.price * p.sold;
    const 마진 = (p.price - p.cost) * p.sold;
    return {
      href: 'PD-02',
      cells: [
        `<span class="muted num">${i + 1}</span>`, `<b>${p.nm}</b>`, p.cat,
        { t: `<span class="num">${U.num(p.sold)}</span>`, cls: 'r' },
        { t: `<span class="num">${U.won(매출)}</span>`, cls: 'r nowrap' },
        { t: `<span class="num">${U.won(마진)}</span>`, cls: 'r nowrap' },
        { t: `<span class="num">${Math.round(마진 / 매출 * 100)}%</span>`, cls: 'r' },
        U.spark([4, 6, 5, 7, 6, 8, 9].map((n) => n + (i % 4))),
        { t: p.stock === null ? '<span class="muted">-</span>' : `<span class="num">${(p.sold / Math.max(1, p.stock)).toFixed(1)}회</span>`, cls: 'r' },
      ],
    };
  }),
  { foot: ['', '합계', '', { t: `<span class="num">${U.num(PRODUCTS.reduce((a, p) => a + p.sold, 0))}</span>`, cls: 'r' },
    { t: U.won(PRODUCTS.reduce((a, p) => a + p.price * p.sold, 0)), cls: 'r' },
    { t: U.won(PRODUCTS.reduce((a, p) => a + (p.price - p.cost) * p.sold, 0)), cls: 'r' }, '', '', ''] },
)}

<div class="g2 mt8">
  ${U.card('잘 나가는 상품', `<div class="stack">
    ${정렬.slice(0, 3).map((p, i) => `<div class="row-b"><span><b>${i + 1}. ${p.nm}</b></span><span class="num">${U.won(p.price * p.sold)}</span></div>`).join('')}
  </div>
  <p class="t-sub mt4">이 셋이 전체 매출의 <b>62%</b>입니다. 재고와 예약 시간을 여기에 먼저 쓰세요.</p>`)}
  ${U.card('안 나가는 상품', `<div class="stack">
    ${정렬.slice(-3).reverse().map((p) => `<div class="row-b"><span>${p.nm}</span><span class="num muted">${U.num(p.sold)}건</span></div>`).join('')}
  </div>
  <p class="t-sub mt4">가격을 낮추거나, 잘 나가는 상품과 <b>묶어 파는</b> 것을 생각해 보세요.</p>`)}
</div>

${U.card('함께 팔린 상품', U.table(['같이 산 조합', { t: '건수', w: '64px', cls: 'r' }, { t: '묶음 매출', w: '116px', cls: 'r nowrap' }, '메모'], [
  ['뿌리 염색 + 홈케어 샴푸 300ml', { t: '<span class="num">31</span>', cls: 'r' }, { t: '<span class="num">3,100,000원</span>', cls: 'r nowrap' }, '<b>묶음 상품으로 만들 만합니다</b>'],
  ['디자인 커트 + 트리트먼트 (LPP)', { t: '<span class="num">18</span>', cls: 'r' }, { t: '<span class="num">1,800,000원</span>', cls: 'r nowrap' }, ''],
  ['볼륨 매직 + 두피 스케일링', { t: '<span class="num">9</span>', cls: 'r' }, { t: '<span class="num">1,827,000원</span>', cls: 'r nowrap' }, ''],
]), { cls: 'mt8' })}`,
  };
};
