/* CT 장바구니 — 3뎁스 잎사귀 7장 */
import * as U from './ui.mjs';
import { 잎 } from './sub.mjs';
import { GEAR } from './data.mjs';

const P = {};
export default P;
const 장바 = ['CT0101', '장바구니'];
const 기간바꾸기 = ['CT0201', '기간 한꺼번에 바꾸기'];
const 빈것 = ['CT0301', '빈 장바구니'];

const 줄 = (g, o = {}) => `<div class="rowcard${o.bad ? ' bad' : ''}">
  <div class="thumb">${U.phFix(['장비', 400, 400], 72, { seed: g.id })}</div>
  <div class="bd"><div class="t-card">${g.nm}</div>
    <div class="t-sub mt1">${o.기간 || '8/15 ~ 8/17 · 2박 3일'} · ${o.qty || 1}개</div>
    ${o.말 ? `<div class="mt2">${o.말}</div>` : ''}</div>
  <div class="side"><b class="num">${U.won(g.day * 3 * (o.qty || 1))}</b>
    <div class="t-sub">보증금 ${U.won(g.dep * (o.qty || 1))}</div></div></div>`;

P['CT0102'] = () => 잎({
  부모: 장바, 제목: '기간이 다른 것이 섞였을 때',
  설명: '기간별로 갈라 놓습니다. 한 번에 결제되지 않기 때문입니다.',
  본문: `${U.banner('warn', '📅', '<b>기간이 다른 장비가 섞여 있습니다.</b> 기간마다 따로 결제됩니다 — 반납일이 다르니까요.', {
    right: U.btn('한꺼번에 맞추기', { sm: true, cls: 'btn-pri', href: 'CT0201' }),
  })}
<h2 class="t-sec mt8 mb4">8월 15일 ~ 17일 <span class="t-sub">2박 3일 · 2건 · 315,800원</span></h2>
<div class="stack" style="gap:var(--sp-item)">${줄(GEAR[0], { qty: 2 })}${줄(GEAR[2])}</div>
<h2 class="t-sec mt8 mb4">8월 20일 ~ 22일 <span class="t-sub">2박 3일 · 1건 · 42,000원</span></h2>
<div class="stack" style="gap:var(--sp-item)">${줄(GEAR[3], { 기간: '8/20 ~ 8/22 · 2박 3일' })}</div>
${U.card('왜 따로 결제되나요', `<p class="t-sub">반납일이 다르면 <b>보증금을 푸는 시점도 다릅니다.</b>
  한 번에 묶으면 먼저 반납한 것도 나중 것이 끝날 때까지 보증금이 잡혀 있게 돼요. 그래서 갈라 둡니다.</p>`, { cls: 'mt8' })}`,
  다루는것: [
    ['묶는 기준', '빌리는 날 ~ 돌려주는 날이 같은 것끼리'],
    ['기간별 소계', '묶음마다 금액과 건수를 따로 보여준다'],
    ['왜 갈라야 하나', '반납일이 다르면 보증금 푸는 시점도 다르다'],
    ['한꺼번에 맞추기', '모두 같은 기간으로 옮기는 화면으로 보낸다'],
  ],
});

P['CT0103'] = () => 잎({
  부모: 장바, 제목: '담아 둔 사이에 나갔을 때',
  설명: '장바구니는 자리를 잡아 두지 않습니다.',
  본문: `${U.banner('dan', '✕', '<b>화로대가 다 나갔습니다.</b> 담아 두신 뒤 다른 분이 먼저 결제하셨어요.')}
<div class="stack mt6" style="gap:var(--sp-item)">
  ${줄(GEAR[0], { qty: 2 })}
  ${줄(GEAR[2], { bad: true, 말: `<div class="row wrap-row" style="gap:var(--sp-btn)">${U.btn('날짜 바꾸기', { sm: true, cls: 'btn-pri', href: 'CT0201' })}${U.btn('빼기', { sm: true, cls: 'btn-dan', attr: ' data-toast="화로대를 뺐어요"' })}${U.btn('자리 알림', { sm: true, href: 'PD0504' })}</div>` })}
</div>
${U.banner('warn', '🔒', '<b>이 줄이 있는 동안은 결제가 막힙니다.</b> 모르고 결제되게 두면 나중에 취소 연락을 드려야 해서 서로 곤란합니다.', { cls: 'mt6' })}
${U.card('왜 잡아 두지 않나요', `<p class="t-sub">담아 두는 것만으로 자리를 잡아 두면, 사실 마음이 없는 사람이 재고를 묶어 두게 됩니다.
  그러면 정말 빌리려는 분이 못 빌려요. <b>결제하신 분이 가져가는 것</b>이 가장 공평합니다.</p>
  <p class="t-sub mt3">다만 <b>결제를 시작하시면 20분 동안 잡아 둡니다.</b> 카드 정보를 넣는 사이에 뺏기지 않게요.</p>`, { cls: 'mt6' })}`,
  다루는것: [
    ['표시', '그 줄만 붉은 테두리 + 사유'],
    ['결제 차단', '문제가 있는 줄이 남아 있으면 결제 버튼이 안 열린다'],
    ['세 갈래', '날짜 바꾸기 · 빼기 · 자리 알림'],
    ['20분 홀드', '결제를 «시작»하면 그때부터 잡아 둔다'],
  ],
});

P['CT0104'] = () => 잎({
  부모: 장바, 제목: '수량을 바꿀 때',
  설명: '그 자리에서 재고를 다시 확인합니다.',
  본문: `${U.card('', `<div class="stack" style="gap:var(--sp-item)">
    ${줄(GEAR[0], { qty: 2, 말: `<div class="row" style="gap:var(--sp-item)">${U.stepper(2, { toast: '수량을 바꿨어요' })}<span class="t-sub">이 기간 최대 <b class="pri">2개</b></span></div>` })}
  </div>
  ${U.banner('warn', '⚠', '<b>3개로는 안 됩니다.</b> 8월 16일에 2대만 남아 있어요.', { cls: 'mt6' })}`)}
${U.card('바뀌는 것', U.table(['수량', { t: '대여료', w: '124px', cls: 'r nowrap' }, { t: '보증금', w: '124px', cls: 'r nowrap' }, { t: '되나', w: '84px' }], [
  ['1개', { t: '<span class="num">133,344원</span>', cls: 'r nowrap' }, { t: '<span class="num">100,000원</span>', cls: 'r nowrap' }, U.badge('가능', 'b-ok')],
  ['<b>2개</b>', { t: '<b class="num">266,688원</b>', cls: 'r nowrap' }, { t: '<b class="num">200,000원</b>', cls: 'r nowrap' }, U.badge('가능', 'b-ok')],
  ['3개', { t: '<span class="muted">-</span>', cls: 'r nowrap' }, { t: '<span class="muted">-</span>', cls: 'r nowrap' }, U.badge('8/16 막힘', 'b-dan')],
]), { cls: 'mt6' })}`,
  다루는것: [
    ['바뀌는 것 셋', '줄 금액 · 전체 합계 · 보증금 합계가 함께 바뀐다'],
    ['재고 확인', '올릴 때마다 그 기간에 되는지 다시 본다'],
    ['최대치', '이 기간에 몇 개까지 되는지 옆에 적어 둔다'],
    ['0으로 내리면', '「빼시겠어요?」를 한 번 묻는다'],
  ],
});

P['CT0105'] = () => 잎({
  부모: 장바, 제목: '쿠폰을 적용할 때',
  설명: '쓸 수 있는 것과 없는 것을 이유와 함께 보여줍니다.',
  본문: `${U.card('', `${U.field('쿠폰 고르기', U.select(['쿠폰을 고르세요', '재이용 10% 할인 (3일 남음)', '기획전 10% (5만원 이상)', '첫 캠핑 20% (캠핑 장비만)'], 1))}
  ${U.table(['쿠폰', { t: '할인', w: '104px', cls: 'r nowrap' }, { t: '쓸 수 있나', w: '196px' }], [
    ['<b>재이용 10% 할인</b>', { t: '<b class="num pri">-31,580원</b>', cls: 'r nowrap' }, U.badge('적용됨', 'b-ok')],
    ['기획전 10%', { t: '<span class="num">-31,580원</span>', cls: 'r nowrap' }, '<span class="t-sub">다른 쿠폰과 같이 못 씁니다</span>'],
    ['첫 캠핑 20%', { t: '<span class="muted">-</span>', cls: 'r nowrap' }, '<span class="t-sub">카메라 장비가 섞여 있습니다</span>'],
  ])}`)}
${U.card('얼마가 되나', U.sumRows([
  ['대여료', '<span class="num">315,800원</span>'],
  ['3일 이상 할인 10%', '<span class="num">-31,580원</span>', 'minus'],
  ['재이용 쿠폰 10%', '<span class="num">-28,422원</span>', 'minus'],
  ['적립금 사용', '<span class="num">-8,000원</span>', 'minus'],
], ['지금 낼 돈', '<span class="num">247,798원</span>']), { cls: 'mt6' })}
${U.banner('info', 'ℹ', '쿠폰은 <b>기간 할인이 붙은 뒤 금액</b>에 적용됩니다. 적립금은 맨 마지막에 빠집니다.', { cls: 'mt6' })}`,
  다루는것: [
    ['못 쓰는 쿠폰', '숨기지 않고 «왜 못 쓰는지»를 적는다'],
    ['겹쳐 쓰기', '쿠폰끼리는 하나만, 기간 할인·적립금과는 함께'],
    ['계산 순서', '기간 할인 → 쿠폰 → 적립금'],
    ['최소 금액', '미달이면 「5,000원만 더 담으면 쓸 수 있어요」를 알린다'],
  ],
});

P['CT0202'] = () => 잎({
  부모: 기간바꾸기, 제목: '줄마다 되는지 판정',
  설명: '새 기간에 무엇이 되고 무엇이 안 되는지 하나씩 봅니다.',
  본문: `${U.card('', U.table(
  ['장비', { t: '수량', w: '64px', cls: 'c' }, { t: '8/22', w: '68px', cls: 'c' }, { t: '8/23', w: '68px', cls: 'c' }, { t: '8/24', w: '68px', cls: 'c' }, { t: '판정', w: '132px' }],
  [[GEAR[0].nm, { t: '2', cls: 'c' }, { t: '<span class="num">3</span>', cls: 'c' }, { t: '<span class="num">2</span>', cls: 'c' }, { t: '<span class="num">4</span>', cls: 'c' }, U.badge('가능', 'b-ok')],
   [GEAR[2].nm, { t: '1', cls: 'c' }, { t: '<span class="num">5</span>', cls: 'c' }, { t: '<b class="num dan">0</b>', cls: 'c' }, { t: '<span class="num">6</span>', cls: 'c' }, U.badge('8/23 없음', 'b-warn')],
   [GEAR[3].nm, { t: '1', cls: 'c' }, { t: '<span class="num">9</span>', cls: 'c' }, { t: '<span class="num">8</span>', cls: 'c' }, { t: '<span class="num">9</span>', cls: 'c' }, U.badge('가능', 'b-ok')]],
))}
${U.banner('warn', '⚠', '<b>화로대만 안 됩니다.</b> 빼고 옮기시거나, 하루 짧게 잡으시면 됩니다(8/22~8/23).', {
  cls: 'mt6', right: `<div class="btns">${U.btn('빼고 옮기기', { sm: true, cls: 'btn-pri', attr: ' data-toast="화로대를 빼고 8/22~25로 바꿨어요" data-toast-kind="ok"' })}${U.btn('하루 짧게', { sm: true, attr: ' data-toast="8/22~8/23으로 잡았어요"' })}</div>`,
})}`,
  다루는것: [
    ['날짜별로', '한 줄에 대해 새 기간의 모든 날을 훑는다'],
    ['세 가지 판정', '가능 · 일부 날 없음 · 전 기간 불가'],
    ['어느 날인지', '「8/23 없음」처럼 짚어서 말한다'],
    ['두 갈래', '안 되는 것만 빼기 · 기간을 줄이기'],
  ],
});

P['CT0203'] = () => 잎({
  부모: 기간바꾸기, 제목: '돈이 얼마나 달라지나',
  설명: '기간을 바꾸면 할인 단계가 바뀌어 오히려 싸질 때가 있습니다.',
  본문: `${U.card('', U.table(
  ['', { t: '지금 (8/15~17)', w: '140px', cls: 'r nowrap' }, { t: '바꾼 뒤 (8/22~25)', w: '148px', cls: 'r nowrap' }, { t: '차액', w: '116px', cls: 'r nowrap' }],
  [['기간', { t: '2박 3일', cls: 'r' }, { t: '3박 4일', cls: 'r' }, { t: '<span class="muted">+1박</span>', cls: 'r' }],
   ['대여료', { t: '<span class="num">315,800원</span>', cls: 'r nowrap' }, { t: '<span class="num">421,067원</span>', cls: 'r nowrap' }, { t: '<span class="num">+105,267원</span>', cls: 'r nowrap' }],
   ['주말 할증', { t: '<span class="num warn">+18,520원</span>', cls: 'r nowrap' }, { t: '<span class="num">+0원</span>', cls: 'r nowrap' }, { t: '<span class="num pri">-18,520원</span>', cls: 'r nowrap' }],
   ['기간 할인', { t: '10%', cls: 'r' }, { t: '<b class="pri">20%</b>', cls: 'r' }, { t: '<span class="pri">한 단계 올라감</span>', cls: 'r' }],
   ['보증금', { t: '<span class="num">340,000원</span>', cls: 'r nowrap' }, { t: '<span class="num">340,000원</span>', cls: 'r nowrap' }, { t: '<span class="muted">같음</span>', cls: 'r' }]],
  { foot: ['<b>지금 낼 돈</b>', { t: '<span class="num">302,688원</span>', cls: 'r nowrap' }, { t: '<b class="num">336,854원</b>', cls: 'r nowrap' }, { t: '<b class="num">+34,166원</b>', cls: 'r nowrap' }] },
))}
${U.banner('ok', '💡', '<b>하루를 더 빌리는데 하루치가 다 붙지 않습니다.</b> 3박이 되면 기간 할인이 20%로 올라가고 주말 할증도 빠져서요.', { cls: 'mt6' })}`,
  다루는것: [
    ['나란히', '지금과 바꾼 뒤를 한 줄씩 견준다'],
    ['할인 단계', '3일·7일·30일을 넘기면 그것을 따로 알린다'],
    ['보증금', '기간이 바뀌어도 그대로라는 것을 명시'],
    ['왜 이 표가 필요한가', '「하루 더 = 하루치 더」가 아니라는 것을 보여줘야 한다'],
  ],
});

P['CT0302'] = () => 잎({
  부모: 빈것, 제목: '비었을 때 무엇을 보여주나',
  설명: '텅 빈 화면으로 두지 않습니다.',
  본문: `${U.empty('🧺', '아직 담은 게 없어요', '쓸 날짜를 먼저 고르시면 그 기간에 빌릴 수 있는 것만 보여드려요.',
    `${U.btn('날짜부터 고르기', { cls: 'btn-pri', href: 'PD0301' })}${U.btn('장비 둘러보기', { href: 'PD0101' })}`)}
${U.sec('최근 보신 장비', `<div class="cards">${GEAR.slice(0, 2).map((g) => U.gearCard(g, { left: 3 })).join('')}</div>`, { cls: 'mt8' })}
${U.sec('찜해 두신 것', `<div class="cards">${GEAR.slice(2, 3).map((g) => U.gearCard(g, { left: 5 })).join('')}</div>`)}
${U.sec('이번 주말 아직 남았어요', `<div class="cards">${GEAR.slice(3, 5).map((g) => U.gearCard(g, { left: 2 })).join('')}</div>`)}`,
  다루는것: [
    ['왜 채우나', '빈 화면은 나가는 화면이다. 다음에 할 일을 준다'],
    ['보여주는 순서', '최근 본 것 → 찜한 것 → 이번 주말 남은 것'],
    ['처음 오신 분', '아무 기록이 없으면 인기 장비와 3단계 안내를 보여준다'],
  ],
});
