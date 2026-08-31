/* CT 장바구니 (3) */
import * as U from './ui.mjs';
import { GEAR } from './data.mjs';

export const PAGES = {};

const 줄 = (g, o = {}) => `<div class="rowcard${o.bad ? ' bad' : ''}">
  <label class="check none" style="padding-top:4px"><input type="checkbox" ${o.bad ? '' : 'checked'} aria-label="${g.nm} 고르기"></label>
  <div class="thumb">${U.phFix(['장비', 400, 400], 88, { seed: g.id })}</div>
  <div class="bd">
    <div class="t-card">${g.nm}</div>
    <div class="t-sub mt1">${g.brand} · ${o.opt || '기본'}</div>
    <div class="t-sub mt1">${o.기간 || '8월 15일 ~ 17일 (2박 3일)'}</div>
    ${o.bad ? `<div class="mt3">${U.banner('dan', '✕', '<b>담아 두신 사이에 다 나갔어요.</b> 8월 16일에 남은 게 없습니다.', { right: U.btn('날짜 바꾸기', { sm: true, href: 'CT-02' }) })}</div>` : ''}
    <div class="row mt3" style="gap:var(--sp-item)">
      ${U.stepper(o.qty || 1, { toast: '수량을 바꿨어요. 합계가 다시 계산됩니다' })}
      ${U.btn('빼기', { sm: true, cls: 'btn-dan', attr: ` data-toast="${g.nm}${U.조사붙이기(g.nm, '을', '를')} 뺐어요"` })}
    </div>
  </div>
  <div class="side">
    <div><b class="num" style="font-size:18px">${U.won(g.day * 3 * (o.qty || 1))}</b></div>
    <div class="t-sub">보증금 ${U.won(g.dep * (o.qty || 1))}</div>
  </div>
</div>`;

PAGES['CT-01'] = () => {
  const 담은것 = [
    { g: GEAR[0], qty: 2 },
    { g: GEAR[2], qty: 1, bad: true },
    { g: GEAR[3], qty: 1, 기간: '8월 20일 ~ 22일 (2박 3일)' },
  ];
  const 대여료 = 담은것.filter((x) => !x.bad).reduce((a, x) => a + x.g.day * 3 * x.qty, 0);
  const 할인 = Math.round(대여료 * 0.1);
  const 보증금 = 담은것.filter((x) => !x.bad).reduce((a, x) => a + x.g.dep * x.qty, 0);
  return {
    body: `${U.pageHd('장바구니', `${담은것.length}개 담겨 있어요`,
      U.btn('더 둘러보기', { href: 'PD-01' }))}

${U.banner('warn', '📅', '<b>기간이 다른 장비가 섞여 있어요.</b> 기간별로 나눠서 결제됩니다. 한꺼번에 맞추실 수도 있어요.', {
  right: U.btn('기간 한꺼번에 맞추기', { sm: true, href: 'CT-02' }),
})}

<div class="split-r mt6">
  <div>
    <h2 class="t-sec mb4">8월 15일 ~ 17일 <span class="t-sub">2박 3일 · 2건</span></h2>
    <div class="stack" style="gap:var(--sp-item)">
      ${줄(담은것[0].g, { qty: 2 })}
      ${줄(담은것[1].g, { qty: 1, bad: true })}
    </div>

    <h2 class="t-sec mt8 mb4">8월 20일 ~ 22일 <span class="t-sub">2박 3일 · 1건</span></h2>
    <div class="stack" style="gap:var(--sp-item)">
      ${줄(담은것[2].g, { qty: 1, 기간: '8월 20일 ~ 22일 (2박 3일)' })}
    </div>

    ${U.card('쿠폰', `<div class="row wrap-row" style="gap:var(--sp-item)">
      ${U.select(['쿠폰을 고르세요', '재이용 10% 할인 (3일 남음)', '기획전 쿠폰 10% (5만원 이상)'], 1)}
      ${U.btn('적용', { attr: ' data-toast="쿠폰을 적용했어요"' })}
    </div>`, { cls: 'mt8' })}

    ${U.banner('info', '⏳', '담아 두신 장비는 <b>잡아 두지 않습니다.</b> 인기 있는 날짜는 먼저 결제하신 분이 가져가요.', { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('얼마인가요', `
      ${U.sumRows([
        ['대여료', `<span class="num">${U.won(대여료)}</span>`],
        ['3일 이상 할인 10%', `<span class="num">-${U.num(할인)}원</span>`, 'minus'],
        ['배송비', '<span class="num">0원</span>'],
        ['쿠폰 (재이용 10%)', '<span class="num">-0원</span>'],
      ], ['지금 낼 돈', `<span class="num">${U.won(대여료 - 할인)}</span>`])}
      ${U.depositRow(보증금, '반납 확인 후 <b>3영업일 안에</b> 돌려드려요. 대여료와 따로 잡힙니다.')}
      <p class="t-sub mt4">재고가 없는 <b>화로대 1개</b>는 합계에서 빠져 있어요.</p>`, {
        ft: `<div class="btns-v">
          ${U.btn('신청하기', { cls: 'btn-pri', lg: true, w: true, href: 'BK-01' })}
          ${U.btn('계속 둘러보기', { w: true, href: 'PD-01' })}
        </div>`,
      })}
    ${U.card('빈 장바구니는 이렇게', `<p class="t-sub">담은 게 없을 때 화면입니다.</p>
      <div class="mt3">${U.btn('빈 장바구니 보기', { sm: true, w: true, href: 'CT-03' })}</div>`)}
  </div>
</div>`,
  };
};

PAGES['CT-02'] = () => ({
  body: `${U.pageHd('기간을 한꺼번에 바꾸기', '담은 장비를 모두 같은 기간으로 옮깁니다.')}

<div class="split-r">
  <div>
    ${U.card('언제로 바꿀까요', `
      <div class="row-b mb6 wrap-row">
        ${U.box('<div class="t-sub">지금</div><div class="strong">8/15 ~ 8/17 (2박 3일)</div>')}
        <span class="t-sec muted">→</span>
        ${U.box('<div class="t-sub">바꿀 기간</div><div class="strong pri">8/22 ~ 8/25 (3박 4일)</div>')}
      </div>
      ${U.cal('G-101', { qty: 1, sel: [22, 25] })}`)}

    ${U.card('담은 장비가 그 기간에 되나요', U.table(
      ['장비', { t: '수량', w: '64px', cls: 'c' }, { t: '새 기간에', w: '176px' }, { t: '', w: '96px' }],
      [
        [GEAR[0].nm, { t: '<span class="num">2</span>', cls: 'c' }, U.badge('가능', 'b-ok'), ''],
        [GEAR[2].nm, { t: '<span class="num">1</span>', cls: 'c' }, `${U.badge('8/23에 재고 없음', 'b-warn')}`, U.btn('빼기', { sm: true, cls: 'btn-dan', attr: ' data-toast="화로대를 뺐어요"' })],
        [GEAR[3].nm, { t: '<span class="num">1</span>', cls: 'c' }, U.badge('가능', 'b-ok'), ''],
      ],
    ), { cls: 'mt6', ft: `<div class="btns">${U.btn('안 되는 장비는 빼고 바꾸기', { cls: 'btn-pri', attr: ' data-toast="화로대를 빼고 8/22~25로 바꿨어요" data-toast-kind="ok"' })}</div>` })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('돈이 얼마나 달라지나요', `
      ${U.table(['', { t: '지금', w: '104px', cls: 'r nowrap' }, { t: '바꾼 뒤', w: '104px', cls: 'r nowrap' }], [
        ['기간', { t: '2박 3일', cls: 'r' }, { t: '3박 4일', cls: 'r' }],
        ['대여료', { t: '<span class="num">319,800원</span>', cls: 'r nowrap' }, { t: '<span class="num">426,400원</span>', cls: 'r nowrap' }],
        ['기간 할인', { t: '10%', cls: 'r' }, { t: '<b class="pri">20%</b>', cls: 'r' }],
        ['합계', { t: '<span class="num">287,820원</span>', cls: 'r nowrap' }, { t: '<b class="num">341,120원</b>', cls: 'r nowrap' }],
      ])}
      ${U.banner('info', '💡', '<b>하루 더 빌리는데 하루치가 안 붙어요.</b> 3박이 되면 기간 할인이 20%로 올라가서 그렇습니다.', { cls: 'mt4' })}`, {
        ft: `<div class="btns-v">
          ${U.btn('이 기간으로 바꾸기', { cls: 'btn-pri', w: true, attr: ' data-toast="기간을 바꿨어요" data-toast-kind="ok"' })}
          ${U.btn('되돌리기', { w: true, href: 'CT-01' })}
        </div>`,
      })}
  </div>
</div>`,
});

PAGES['CT-03'] = () => ({
  body: `${U.pageHd('장바구니', '아직 담은 게 없어요')}

${U.empty('🧺', '장바구니가 비어 있어요',
  '쓸 날짜를 먼저 고르시면 그 기간에 빌릴 수 있는 장비만 보여드려요.',
  `${U.btn('장비 둘러보기', { cls: 'btn-pri', href: 'PD-01' })}${U.btn('날짜부터 고르기', { href: 'PD-03' })}`)}

${U.sec('최근 보신 장비', `<div class="cards">${GEAR.slice(0, 4).map((g) => U.gearCard(g, { left: 3 })).join('')}</div>`, { cls: 'mt8' })}

${U.sec('이번 주말 아직 남았어요', `<div class="cards">${GEAR.slice(3, 7).map((g) => U.gearCard(g, { left: 2 })).join('')}</div>`)}

${U.card('처음이신가요', `<div class="g3">
  ${[['①', '고른다', '쓸 날짜를 먼저 고르면 그날 빌릴 수 있는 것만 보여드려요.'],
     ['②', '받는다', '매장에 오시거나 택배로 받으세요.'],
     ['③', '돌려준다', '반납하면 점검 후 보증금을 돌려드려요.']]
    .map(([n, t, d]) => `<div><div class="t-sec pri">${n}</div><div class="t-card mt2">${t}</div><p class="t-sub mt2">${d}</p></div>`).join('')}
</div>
<div class="btns mt6">${U.btn('이용 안내 자세히', { href: 'CS-03' })}</div>`, { cls: 'mt8' })}`,
});
