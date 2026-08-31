/* HO 홈 — 3뎁스 잎사귀 13장 */
import * as U from './ui.mjs';
import { 잎 } from './sub.mjs';
import { GEAR, RENTS, 남은수, SITE } from './data.mjs';

const P = {};
export default P;
const 홈 = ['HO0101', '홈'];
const 카테 = ['HO0201', '카테고리 홈'];
const 결과 = ['HO0301', '기간으로 찾기'];
const 없음 = ['HO0401', '결과 없음'];
const 기획 = ['HO0501', '기획전'];

P['HO0102'] = () => 잎({
  부모: 홈, 제목: '로그인하고 들어왔을 때',
  설명: '같은 홈이지만 «내 것»이 맨 위로 올라옵니다.',
  본문: `${U.banner('warn', '⏰', '<b>반납이 1일 늦었어요.</b> 연체료 27,780원 — 오늘 돌려주시면 여기서 멈춥니다.', {
    right: U.btn('지금 반납', { sm: true, cls: 'btn-pri', href: 'RT0401' }),
  })}
${U.sec('내 대여', `<div class="cards">${RENTS.slice(0, 2).map((r) => {
    const g = U.gearOf(r.gear);
    return `<a class="item" href="${U.link('MY0201')}"><div class="thumb">${U.phGear(r.gear)}</div>
      <div class="bd"><div class="row" style="gap:5px">${U.stBadge(r.st)}</div>
        <div class="nm">${g.nm} × ${r.qty}개</div>
        <div class="meta">${r.from} ~ ${r.to}</div>
        <div class="price"><span class="d">${U.num(r.paid)}</span><span class="u">원</span></div></div></a>`;
  }).join('')}</div>`, { cls: 'mt6', more: 'MY0101', moreLabel: '내 대여 전체' })}

${U.sec('이어서 보시던 것', `<div class="cards">${GEAR.slice(1, 3).map((g) => U.gearCard(g, { left: 남은수(g.id, 15) })).join('')}</div>`)}

${U.card('쓸 수 있는 것', `<div class="g3">
  ${U.box('<div class="t-sub">적립금</div><div class="t-sec pri mt1">8,000원</div>')}
  ${U.box('<div class="t-sub">쿠폰</div><div class="t-sec mt1">2장</div><div class="t-sub mt1">재이용 10% — 3일 남음</div>')}
  ${U.box('<div class="t-sub">보증금 면제까지</div><div class="t-sec mt1">1회</div><div class="t-sub mt1">3회 중 2회 완료</div>')}
</div>`)}`,
  다루는것: [
    ['맨 위에 오는 것', '이용 중인 대여 · 연체가 있으면 그것이 가장 위'],
    ['이어보기', '최근 본 장비를 그 기간 기준으로 다시 셈해 보여준다'],
    ['안 보이는 것', '비로그인 홈의 「처음이신가요」 3단계는 숨긴다'],
    ['비로그인과 같은 것', '카테고리·인기 장비·후기는 그대로 둔다'],
  ],
});

P['HO0103'] = () => 잎({
  부모: 홈, 제목: '기간을 먼저 고를 때',
  설명: '이 서비스는 «무엇»보다 «언제»를 먼저 묻습니다.',
  본문: `${U.banner('info', '📅', '날짜를 두 번 누르면 <b>빌리는 날</b>과 <b>돌려주는 날</b>이 잡힙니다. 잡히는 즉시 아래 목록이 그 기간 기준으로 다시 셈됩니다.')}
${U.card('', U.cal('G-101', { qty: 1, sel: [15, 17] }), { cls: 'mt6' })}
${U.card('고르는 규칙', `<div class="g2">
  <ul class="stack t-sub">
    <li>· 오늘(8월 10일) 이전은 못 고릅니다</li>
    <li>· 최소 <b>1박</b>, 최대 <b>30박</b></li>
  </ul>
  <ul class="stack t-sub">
    <li>· 3개월 뒤까지만 예약됩니다</li>
    <li>· 고른 기간은 칩으로 고정돼 화면을 옮겨도 따라갑니다</li>
  </ul>
</div>`, { cls: 'mt6' })}`,
  다루는것: [
    ['첫 번째 누름', '빌리는 날로 잡히고 그 뒤 날짜만 열린다'],
    ['두 번째 누름', '돌려주는 날로 잡히고 사이가 색으로 이어진다'],
    ['다시 누르면', '처음부터 다시 고른다'],
    ['잡힌 뒤', '전체 목록의 재고와 금액이 그 기간 기준으로 다시 계산된다'],
  ],
});

P['HO0104'] = () => 잎({
  부모: 홈, 제목: '성수기라 일찍 나갈 때',
  설명: '연휴·주말이 다가오면 맨 위에 띠를 답니다.',
  본문: `${U.banner('warn', '🏕', '<b>광복절 연휴(8/15~17)</b>는 캠핑 장비가 일찍 나갑니다. 지난해 이 기간에는 <b>8월 5일에 텐트가 다 나갔어요.</b> 미리 잡아 두세요.', {
    right: U.btn('그 기간 보기', { sm: true, cls: 'btn-pri', href: 'HO0301' }),
  })}
${U.card('지금 남은 상황', U.table(
  ['장비', { t: '가진 대수', w: '84px', cls: 'r' }, { t: '8/15 남음', w: '92px', cls: 'r' }, { t: '', w: '96px' }],
  GEAR.slice(0, 4).map((g) => {
    const 남 = 남은수(g.id, 15);
    return [g.nm, { t: `<span class="num">${g.total}</span>`, cls: 'r' },
      { t: 남 <= 2 ? `<b class="num dan">${남}</b>` : `<span class="num">${남}</span>`, cls: 'r' },
      U.btn('잡아두기', { sm: true, href: 'PD0201' })];
  }),
), { cls: 'mt6' })}
${U.card('이 띠는 이렇게 움직입니다', `<ul class="stack t-sub">
  <li>· 연휴 <b>2주 전</b>에 저절로 뜹니다</li>
  <li>· 닫으시면 <b>그 연휴 동안은</b> 다시 안 뜹니다</li>
  <li>· 재고가 절반 아래로 내려가면 <b>글이 바뀝니다</b> — 「거의 다 나갔어요」</li>
</ul>`, { cls: 'mt6' })}`,
  다루는것: [
    ['언제 뜨나', '연휴·주말 2주 전부터 · 재고가 절반 아래일 때'],
    ['닫으면', '그 기간 동안은 다시 안 뜬다'],
    ['글이 바뀌는 때', '남은 수에 따라 「미리 잡으세요」 → 「거의 다 나갔어요」'],
    ['할증 안내', '금·토가 낀 기간이면 20% 할증도 함께 알린다'],
  ],
});

P['HO0202'] = () => 잎({
  부모: 카테, 제목: '하위 종류로 좁혔을 때',
  설명: '칩을 누르면 목록이 걸러지고 개수가 바로 바뀝니다.',
  본문: `${U.chips(['전체 24', '텐트 6', '타프 4', '침낭 5', '화로대 3', '의자 6'], 1, { cat: true })}
${U.banner('info', '🔎', '<b>텐트</b>로 좁혔습니다 — 24개 중 <b>6개</b>. 칩을 다시 누르면 풀립니다.', { cls: 'mt6' })}
<div class="cards mt6" data-catlist>${GEAR.filter((g) => g.cat === '텐트' || g.cat === '타프').map((g) => U.gearCard(g, { left: 남은수(g.id, 15), cat: true })).join('')}</div>`,
  다루는것: [
    ['칩을 누르면', '그 종류만 남고 결과 수가 즉시 바뀐다'],
    ['다시 누르면', '그 칩만 풀린다. 「전체」를 누르면 다 풀린다'],
    ['기간 조건', '기간 필터는 그대로 유지된다 — 두 조건이 함께 걸린다'],
    ['결과가 0개면', '「이 종류는 이 기간에 다 나갔어요」와 다음 가능일을 보여준다'],
  ],
});

P['HO0203'] = () => 잎({
  부모: 카테, 제목: '고르는 법을 펼쳤을 때',
  설명: '처음 빌리시는 분이 가장 많이 막히는 자리입니다.',
  본문: `${U.card('인원수로 고르기', U.table(
    ['몇 명이서', '맞는 텐트', '왜', '함께 빌리면'],
    [['1~2명', '2~3인용', '짐까지 넣으면 인원 +1이 편합니다', '체어 2 · 화로대'],
     ['3~4명', '4인용', '가족 기준 가장 많이 나갑니다', '타프 · 체어 4 · 테이블'],
     ['5~6명', '6인용 또는 2동', '한 동에 몰면 답답합니다', '대형 타프 · 화로대 2']],
  ))}
${U.card('계절로 고르기', U.table(['언제', '침낭 등급', '메모'], [
  ['봄·가을', '컴포트 5℃', '가장 무난합니다'],
  ['여름', '컴포트 15℃ 또는 이불', '밤에도 더우면 안 쓰게 됩니다'],
  ['겨울', '컴포트 -10℃ + 난방', '난방 장비는 따로 문의해 주세요'],
]), { cls: 'mt6' })}
${U.banner('info', '💡', '<b>초보자 세트</b>를 고르시면 이 표를 안 보셔도 됩니다. 4인 가족 기준으로 미리 묶어 뒀어요.', {
  cls: 'mt6', right: U.btn('세트 보기', { sm: true, href: 'PD0601' }),
})}`,
  다루는것: [
    ['접힌 상태', '기본은 접혀 있다. 「고르는 법」을 눌러야 펼쳐진다'],
    ['펼치면', '인원수 표 · 계절 표 · 초보자 세트 안내가 나온다'],
    ['표에서 바로', '추천 장비 이름을 누르면 그 상세로 간다'],
  ],
});

P['HO0302'] = () => 잎({
  부모: 결과, 제목: '기간을 다시 고를 때',
  설명: '기간이 바뀌면 재고와 금액이 «둘 다» 바뀝니다.',
  본문: `${U.card('', `<div class="row-b wrap-row mb6">
    ${U.box('<div class="t-sub">지금</div><div class="strong">8/15 ~ 8/17 · 2박 3일</div>')}
    <span class="t-sec muted">→</span>
    ${U.box('<div class="t-sub">바꿀 기간</div><div class="strong pri">8/13 ~ 8/15 · 2박 3일</div>')}
  </div>
  ${U.chips(['앞으로 하루', '뒤로 하루', '앞뒤 하루씩 넓히기', '직접 고르기'], 2)}
  <div class="mt6">${U.cal('G-101', { qty: 1, sel: [13, 15] })}</div>`)}
${U.card('무엇이 달라지나', U.table(['', { t: '지금 (8/15~17)', w: '132px', cls: 'r' }, { t: '바꾼 뒤 (8/13~15)', w: '140px', cls: 'r' }], [
  ['빌릴 수 있는 장비', { t: '<span class="num">18개</span>', cls: 'r' }, { t: '<b class="num pri">24개</b>', cls: 'r' }],
  ['주말 할증', { t: '<span class="num">+18,520원</span>', cls: 'r' }, { t: '<span class="num">+0원</span>', cls: 'r' }],
  ['4인 텐트 2개 총액', { t: '<span class="num">266,688원</span>', cls: 'r' }, { t: '<b class="num pri">250,020원</b>', cls: 'r' }],
]), { cls: 'mt6' })}`,
  다루는것: [
    ['달력을 다시 열면', '지금 기간이 색으로 남아 있다'],
    ['하루씩 넓히기', '앞뒤로 밀어 보며 재고가 트이는 지점을 찾는다'],
    ['바꾸면', '결과 수·할증·총액이 모두 다시 계산된다'],
    ['기간 할인', '3일·7일·30일 단계가 바뀌면 따로 알린다'],
  ],
});

P['HO0303'] = () => 잎({
  부모: 결과, 제목: '조건을 여러 개 걸었을 때',
  설명: '무엇이 걸려 있는지 칩으로 보여주고, 하나씩 풀 수 있게 합니다.',
  본문: `${U.card('', `
  <div class="row-b wrap-row mb4"><span class="t-sub">걸려 있는 조건 <b>4개</b></span>
    ${U.btn('전부 풀기', { sm: true, href: 'HO0301' })}</div>
  <div class="chips">
    ${['8/15 ~ 8/17', '텐트', '5만원 이하', '매장 방문'].map((t) => `<button class="chip on" type="button">${t} <span class="x">✕</span></button>`).join('')}
  </div>
  ${U.banner('info', '🔎', '조건 4개로 <b>24개 중 6개</b>가 남았습니다.', { cls: 'mt6' })}`)}
<div class="cards mt6">${GEAR.slice(0, 3).map((g) => U.gearCard(g, { left: 남은수(g.id, 15) })).join('')}</div>
${U.card('조건이 너무 좁으면', `<p class="t-sub">결과가 3개 아래로 내려가면 <b>「이 조건을 풀면 몇 개가 더 나옵니다」</b>를 함께 보여줍니다.</p>
  <div class="stack mt4">
    <div class="row-b"><span>5만원 이하를 풀면</span><span><b class="pri">+8개</b></span></div>
    <div class="row-b"><span>매장 방문을 풀면</span><span><b class="pri">+4개</b></span></div>
  </div>`, { cls: 'mt6' })}`,
  다루는것: [
    ['칩 하나 누르면', '그 조건만 풀리고 결과가 바로 다시 셈된다'],
    ['전부 풀기', '기간만 남기고 나머지를 다 푼다'],
    ['결과가 적으면', '어떤 조건을 풀면 몇 개가 더 나오는지 알려준다'],
    ['조건 요약', '화면을 옮겼다 돌아와도 걸린 조건이 그대로 남는다'],
  ],
});

P['HO0304'] = () => 잎({
  부모: 결과, 제목: '이 기간에 다 나간 장비',
  설명: '없애지 않고 뒤로 밀어 둡니다 — 다음 가능일을 알려드려야 하니까요.',
  본문: `${U.banner('info', '📦', '빌릴 수 있는 <b>18개</b>를 먼저 보여드리고, 다 나간 <b>6개</b>는 아래에 흐리게 둡니다.')}
<div class="cards mt6">${GEAR.slice(0, 2).map((g) => U.gearCard(g, { left: 남은수(g.id, 15) })).join('')}</div>
${U.sec('이 기간엔 다 나갔어요', `<div class="cards">${GEAR.slice(6, 8).map((g, i) => U.gearCard(g, { left: 0, nextDay: i === 0 ? '8월 20일' : '8월 22일' })).join('')}</div>`, { cls: 'mt8' })}
${U.card('왜 없애지 않나요', `<p class="t-sub">없애 버리면 손님이 <b>「이 매장엔 그게 없나 보다」</b>라고 생각하고 나갑니다.
  실제로는 있고 날짜만 안 맞는 것이라, 다음 가능일을 함께 적어 두는 편이 낫습니다.</p>
  <p class="t-sub mt3">누르면 <b>자리 알림</b>을 신청하거나 그 날짜로 옮겨 볼 수 있습니다.</p>`, { cls: 'mt6' })}`,
  다루는것: [
    ['정렬', '빌릴 수 있는 것이 먼저, 다 나간 것은 맨 뒤'],
    ['카드 모양', '흐리게 하고 「8월 20일부터 가능」 배지를 붙인다'],
    ['눌렀을 때', '상세로 가되 그 기간이 막혔다는 화면(PD0501)이 열린다'],
    ['알림', '자리 나면 문자로 알려드리기를 여기서도 신청할 수 있다'],
  ],
});

P['HO0305'] = () => 잎({
  부모: 결과, 제목: '재고를 세는 동안',
  설명: '렌탈은 날짜마다 재고를 다시 세야 해서 잠깐 걸립니다.',
  본문: `${U.card('', `<div class="cards">
  ${[1, 2, 3].map(() => `<div class="item"><div class="thumb ph t2" style="aspect-ratio:1/1"></div>
    <div class="bd">
      <div style="height:18px;background:var(--border);border-radius:4px;width:72%"></div>
      <div style="height:13px;background:var(--border);border-radius:4px;width:44%;margin-top:8px;opacity:.6"></div>
      <div style="height:22px;background:var(--border);border-radius:4px;width:56%;margin-top:16px;opacity:.8"></div>
    </div></div>`).join('')}
</div>
<p class="t-sub mt6" style="text-align:center">고르신 기간에 몇 대가 남았는지 세고 있어요…</p>`)}
${U.banner('warn', '⏳', '3초가 넘으면 <b>「조금 오래 걸리네요. 기간을 좁히면 빨라집니다」</b>를 함께 띄웁니다.', { cls: 'mt6' })}`,
  다루는것: [
    ['왜 걸리나', '날짜 하나하나에 대해 몇 대가 나가 있는지 세야 한다'],
    ['화면이 튀지 않게', '카드 자리를 미리 잡아 두고 내용만 채운다'],
    ['조건은 그대로', '기간·필터 칩은 로딩 중에도 그대로 보인다'],
    ['3초가 넘으면', '기간을 좁히라는 안내를 덧붙인다'],
  ],
});

P['HO0402'] = () => 잎({
  부모: 없음, 제목: '가까운 가능 날짜 찾아 주기',
  설명: '앞뒤 2주를 훑어 «비어 있는 구간»을 스스로 찾습니다.',
  본문: `${U.banner('info', '🔍', '8월 15~17일이 막혀서 <b>앞뒤 2주</b>를 훑었습니다. 세 구간이 비어 있어요.')}
${U.card('이 날짜는 됩니다', U.table(
  ['기간', { t: '남은 대수', w: '92px', cls: 'r' }, { t: '총액', w: '116px', cls: 'r nowrap' }, { t: '지금과 견주면', w: '116px', cls: 'r' }, { t: '', w: '92px' }],
  [['8/13 ~ 8/15 (평일 2박)', { t: '<span class="num">4대</span>', cls: 'r' }, { t: '<span class="num">186,681원</span>', cls: 'r nowrap' }, { t: '<b class="pri">80,007원 쌈</b>', cls: 'r' }, U.btn('이 날짜로', { sm: true, cls: 'btn-pri', href: 'HO0301' })],
   ['8/20 ~ 8/22 (평일 2박)', { t: '<span class="num">3대</span>', cls: 'r' }, { t: '<span class="num">186,681원</span>', cls: 'r nowrap' }, { t: '<b class="pri">80,007원 쌈</b>', cls: 'r' }, U.btn('이 날짜로', { sm: true, href: 'HO0301' })],
   ['8/22 ~ 8/24 (주말 2박)', { t: '<span class="num">2대</span>', cls: 'r' }, { t: '<span class="num">266,688원</span>', cls: 'r nowrap' }, { t: '같음', cls: 'r' }, U.btn('이 날짜로', { sm: true, href: 'HO0301' })]],
), { cls: 'mt6' })}
${U.card('추천이 없을 때', `<p class="t-sub">앞뒤 2주에 빈 구간이 하나도 없으면 표 대신 <b>자리 알림 신청</b>을 크게 보여줍니다.
  없는 것을 억지로 추천하지 않습니다.</p>`, { cls: 'mt6' })}`,
  다루는것: [
    ['어디까지 찾나', '고른 날짜 앞뒤 2주'],
    ['무엇을 함께 보여주나', '남은 대수 · 총액 · 지금과 견준 차액'],
    ['평일이 섞이면', '30% 싸다는 것을 차액으로 보여준다'],
    ['빈 구간이 없으면', '추천 대신 자리 알림 신청으로 넘긴다'],
  ],
});

P['HO0403'] = () => 잎({
  부모: 없음, 제목: '자리 나면 알려드리기',
  설명: '취소가 생기면 문자로 알려드립니다. 선착순입니다.',
  본문: `${U.card('신청하기', `
  <div class="f2">
    ${U.field('기다릴 기간', U.input({ v: '2026-08-15 ~ 2026-08-17' }), { req: true })}
    ${U.field('몇 개', U.select(['1개', '2개', '3개'], 1))}
  </div>
  ${U.field('문자 받을 번호', U.input({ type: 'tel', ph: '010-0000-0000' }), { req: true })}
  ${U.check('문자 수신에 동의합니다', { sub: '이 신청 건에 대해서만 보냅니다. 광고는 보내지 않아요.', attr: ' data-unlock="doAlert"' })}
  <div class="mt4">${U.btn('알림 신청하기', { cls: 'btn-pri', w: true, id: 'doAlert', off: true, attr: ' data-toast="신청했어요. 자리가 나면 문자로 알려드릴게요" data-toast-kind="ok"' })}</div>`)}
${U.card('지금 대기 상황', `<div class="row-b mb3"><span>이 기간을 기다리는 분</span><b class="num">3명</b></div>
  <div class="row-b"><span>내 순번</span><b class="num pri">4번째</b></div>
  ${U.banner('warn', '⚠', '<b>순번은 자리를 잡아 두는 것이 아닙니다.</b> 알림은 다 같이 나가고, 먼저 결제하신 분이 가져갑니다.', { cls: 'mt4' })}`, { cls: 'mt6' })}
${U.card('신청한 것 관리', U.table(['장비', '기다리는 기간', { t: '순번', w: '68px', cls: 'c' }, { t: '', w: '76px' }],
  [[GEAR[0].nm, '8/15 ~ 8/17', { t: '<b class="num">4</b>', cls: 'c' }, U.btn('취소', { sm: true, cls: 'btn-dan', attr: ' data-toast="알림 신청을 취소했어요"' })]]), { cls: 'mt6' })}`,
  다루는것: [
    ['같은 기간 중복', '이미 신청한 기간은 다시 신청되지 않는다'],
    ['순번의 뜻', '자리를 잡아 두는 것이 아니라 알림 순서일 뿐이다'],
    ['알림이 나가는 때', '취소·조기 반납으로 재고가 생긴 즉시'],
    ['만료', '기다리던 기간이 지나면 신청이 저절로 없어진다'],
  ],
});

P['HO0502'] = () => 잎({
  부모: 기획, 제목: '쿠폰을 받았을 때',
  설명: '한 번만 받을 수 있고, 받은 뒤에는 버튼이 바뀝니다.',
  본문: `${U.card('', `<div class="row-b wrap-row">
    <div><div class="t-card">기획전 10% 할인 쿠폰</div>
      <div class="t-sub mt1">5만원 이상 · 8월 31일까지 · 기획전 장비에만</div></div>
    ${U.btn('받았어요 ✓', { off: true })}
  </div>
  ${U.banner('ok', '🎟', '<b>쿠폰함에 넣었습니다.</b> 결제할 때 고르시면 됩니다.', {
    cls: 'mt6', right: U.btn('쿠폰함 보기', { sm: true, href: 'MY0401' }),
  })}`)}
${U.card('이 쿠폰이 되는 곳', U.table(['장비', { t: '할인 뒤', w: '116px', cls: 'r nowrap' }, { t: '쓸 수 있나', w: '96px' }],
  GEAR.slice(0, 4).map((g, i) => [g.nm,
    { t: `<span class="num">${U.won(Math.round(g.day * 3 * 0.9))}</span>`, cls: 'r nowrap' },
    i === 3 ? U.badge('5만원 미만', 'b-mut') : U.badge('됩니다', 'b-ok')])), { cls: 'mt6' })}
${U.card('겹쳐 쓸 수 있나요', `<ul class="stack t-sub">
  <li>· 기간 할인(3일 10% 등)과는 <b>함께 붙습니다</b></li>
  <li>· 평일 할인과도 <b>함께 붙습니다</b></li>
  <li>· 다른 쿠폰과는 <b>같이 못 씁니다</b> — 더 싼 쪽 하나만 적용됩니다</li>
  <li>· 적립금과는 <b>함께 쓸 수 있습니다</b></li>
</ul>`, { cls: 'mt6' })}`,
  다루는것: [
    ['받기 전', '「쿠폰 받기」 오렌지 버튼'],
    ['받은 뒤', '「받았어요 ✓」로 바뀌고 눌리지 않는다'],
    ['로그인 안 했으면', '먼저 로그인으로 보낸다 — 받아 놓고 사라지면 안 된다'],
    ['겹쳐 쓰기', '기간·평일 할인과는 함께, 다른 쿠폰과는 따로'],
  ],
});

P['HO0503'] = () => 잎({
  부모: 기획, 제목: '기획전이 끝났을 때',
  설명: '값이 정가로 돌아가고, 다음 기획전을 안내합니다.',
  본문: `${U.banner('warn', '⏳', '<b>여름 캠핑 기획전은 8월 9일에 끝났습니다.</b> 지금 보시는 값은 정가입니다.')}
${U.card('', `<div class="cards">${GEAR.slice(0, 2).map((g) => `<div class="item off">
  <div class="thumb">${U.phGear(g.id)}<div class="on-thumb">${U.badge('기획전 끝', 'b-mut')}</div></div>
  <div class="bd"><div class="nm">${g.nm}</div>
    <div class="meta">기획전가 ${U.won(Math.round(g.day * 0.7))} → 정가</div>
    <div class="price"><span class="d">${U.num(g.day)}</span><span class="u">원 / 1일</span></div></div></div>`).join('')}</div>`, { cls: 'mt6' })}
${U.card('다음 기획전', `<div class="row-b wrap-row">
  <div><div class="t-card">가을 캠핑 기획전</div>
    <div class="t-sub mt1">9월 1일 ~ 9월 21일 · 최대 35% 할인 예정</div></div>
  ${U.btn('열리면 알려주세요', { cls: 'btn-pri', attr: ' data-toast="기획전이 열리면 문자로 알려드릴게요" data-toast-kind="ok"' })}
</div>`, { cls: 'mt6' })}
${U.sec('지금도 싼 것', `<p class="t-sub mb4">기획전이 아니어도 <b>평일 30% 할인</b>과 <b>장기 대여 할인</b>은 늘 붙습니다.</p>
  <div class="cards">${GEAR.slice(2, 4).map((g) => U.gearCard(g, { left: 남은수(g.id, 20) })).join('')}</div>`, { cls: 'mt8' })}`,
  다루는것: [
    ['끝나면', '기획전가가 풀리고 정가가 나온다. 배너는 흐려지고 종료일이 적힌다'],
    ['받아 둔 쿠폰', '유효기간이 남았으면 그대로 쓸 수 있다'],
    ['다음 기획전', '예정 기간과 할인율을 미리 알리고 알림을 받게 한다'],
    ['대신 보여줄 것', '상시로 붙는 평일·장기 할인 장비'],
  ],
});
