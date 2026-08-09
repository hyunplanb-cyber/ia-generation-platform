/* MY 마이페이지 — 3뎁스 잎사귀 14장 */
import * as U from './ui.mjs';
import { 잎 } from './sub.mjs';
import { GEAR, RENTS, 연체료, SITE } from './data.mjs';

const P = {};
export default P;
const G = GEAR[0];
const 내대여 = ['MY0101', '내 대여'];
const 상세 = ['MY0201', '대여 상세'];
const 후기 = ['MY0301', '후기 쓰기'];
const 알림 = ['MY0401', '알림·쿠폰'];

const 대여줄 = (r, o = {}) => {
  const g = U.gearOf(r.gear);
  return `<div class="rowcard${o.hot ? ' bad' : ''}">
    <div class="thumb">${U.phFix(['장비', 400, 400], 80, { seed: r.gear })}</div>
    <div class="bd"><div class="row" style="gap:5px">${U.stBadge(r.st)}${o.hot ? U.badge('연체', 'b-dan') : ''}</div>
      <div class="t-card mt2">${g.nm} × ${r.qty}개</div>
      <div class="t-sub mt1">${r.from} ~ ${r.to} · ${r.way}</div></div>
    <div class="side"><b class="num">${U.won(r.paid)}</b>
      <div class="t-sub">${r.depSt}</div></div></div>`;
};

P['MY0102'] = () => 잎({
  부모: 내대여, 제목: '상태 탭을 옮길 때',
  설명: '렌탈은 상태가 많습니다. 탭마다 몇 건인지 함께 보여줍니다.',
  본문: `${U.tabs([
    { label: '전체', cnt: 12 }, { label: '예약확정', cnt: 1 }, { label: '이용중', cnt: 1 },
    { label: '반납접수', cnt: 0 }, { label: '점검중', cnt: 1 }, { label: '정산완료', cnt: 8 }, { label: '취소', cnt: 1 },
  ], 2)}
<div class="stack mt6" style="gap:var(--sp-item)">${대여줄(RENTS[0], { hot: true })}</div>
${U.card('상태가 뜻하는 것', U.table(['상태', '무슨 뜻', { t: '내가 할 일', w: '176px' }], [
  [U.stBadge('예약확정'), '결제가 끝나고 받으실 날을 기다립니다', '받으러 가기 · 취소'],
  [U.stBadge('이용중'), '받으셔서 쓰고 계십니다', '연장 · 반납 준비'],
  [U.stBadge('반납접수'), '돌려주셨고 점검을 기다립니다', '기다리기'],
  [U.stBadge('점검중'), '구성품과 상태를 확인하고 있습니다', '기다리기'],
  [U.stBadge('정산완료'), '정산과 환급이 끝났습니다', '후기 쓰기 · 또 빌리기'],
  [U.stBadge('취소'), '취소되어 환불됐습니다', '다시 예약'],
]), { cls: 'mt8' })}
${U.banner('info', '0️⃣', '<b>0건인 탭도 보여줍니다.</b> 없애면 「그런 상태가 있는지」조차 모르게 됩니다.', { cls: 'mt6' })}`,
  다루는것: [
    ['건수 배지', '탭마다 몇 건인지 함께'],
    ['0건 탭', '없애지 않는다 — 상태 흐름을 알 수 있게'],
    ['상태 설명', '각 상태에서 무엇을 하면 되는지 표로'],
    ['빈 탭', '「지금은 없습니다」와 다른 탭으로 가는 길을 준다'],
  ],
});

P['MY0103'] = () => 잎({
  부모: 내대여, 제목: '연체 건은 맨 위에 고정합니다',
  설명: '어느 탭에서도 보이게 둡니다. 놓치면 돈이 늡니다.',
  본문: `${U.banner('dan', '⏰', `<b>반납이 1일 늦었습니다.</b> 지금까지 연체료 <b class="num">${U.won(연체료(G.day, 1) * 2)}</b> — 오늘 돌려주시면 여기서 멈춥니다.`, {
    right: U.btn('지금 반납하기', { sm: true, cls: 'btn-pri', href: 'RT0401' }),
  })}
${U.card('', 대여줄(RENTS[0], { hot: true }), { cls: 'mt6' })}
${U.card('왜 고정하나요', `<p class="t-sub">연체는 <b>시간이 갈수록 손해가 커집니다.</b>
  다른 탭을 보고 계셔도 눈에 띄어야 해요.</p>
  <p class="t-sub mt3">그래서 「정산완료」 탭을 보고 계셔도 연체 건은 <b>맨 위에 붉게</b> 남습니다.</p>`, { cls: 'mt6' })}
${U.card('어디에 또 뜨나요', `<ul class="stack t-sub">
  <li>· <b>홈 화면</b> 맨 위</li>
  <li>· <b>내 대여</b> 목록 맨 위 (지금 이 화면)</li>
  <li>· <b>매일 아침 9시</b> 문자·카톡</li>
  <li>· 장바구니에서 새로 빌리려 하실 때</li>
</ul>
<p class="t-sub mt4">귀찮으시겠지만 <b>모르고 지나가시는 것보다는 낫습니다.</b></p>`, { cls: 'mt6' })}`,
  다루는것: [
    ['고정', '어느 탭에서도 맨 위에 붉게'],
    ['왜', '시간이 갈수록 손해가 커진다'],
    ['어디에 또', '홈 · 목록 · 문자 · 새 예약 시도 때'],
    ['해제', '반납 접수가 되면 사라진다'],
  ],
});

P['MY0104'] = () => 잎({
  부모: 내대여, 제목: '기간이나 이름으로 찾을 때',
  설명: '여러 번 빌리신 분은 목록이 길어집니다.',
  본문: `${U.card('', `<div class="filters">
    ${U.select(['전체 기간', '최근 3개월', '올해', '작년', '직접 지정'], 0)}
    <input class="in search" type="search" value="텐트" style="min-width:200px" aria-label="장비 이름">
    ${U.select(['상태 전체', '이용중', '정산완료', '취소'], 0)}
    ${U.btn('찾기', { cls: 'btn-pri' })}
    ${U.btn('조건 지우기', { href: 'MY0101' })}
  </div>
  ${U.banner('info', '🔎', '「텐트」로 <b>12건 중 4건</b>을 찾았습니다.', { cls: 'mt6' })}`)}
<div class="stack mt6" style="gap:var(--sp-item)">${대여줄(RENTS[0])}</div>
${U.card('무엇으로 찾히나요', `<ul class="stack t-sub">
  <li>· <b>장비 이름</b> — 「텐트」로 카즈미·스노우피크가 다 나옵니다</li>
  <li>· <b>대여번호</b> — R-2026… 을 그대로 넣으셔도 됩니다</li>
  <li>· <b>브랜드</b> — 「카즈미」로도 찾힙니다</li>
</ul>`, { cls: 'mt6' })}
${U.card('내려받기', `<p class="t-sub">찾으신 결과를 <b>엑셀로</b> 받으실 수 있습니다. 회사에 비용 처리하실 때 쓰세요.</p>
  <div class="btns mt4">${U.btn('엑셀로 받기', { attr: ' data-toast="4건을 엑셀로 내려받았어요" data-toast-kind="ok"' })}${U.btn('세금계산서 일괄 요청', { attr: ' data-toast="사업자 정보를 입력해 주세요"' })}</div>`, { cls: 'mt6' })}`,
  다루는것: [
    ['찾히는 것', '장비 이름 · 대여번호 · 브랜드'],
    ['조건 조합', '기간 · 이름 · 상태를 함께 걸 수 있다'],
    ['결과 수', '「12건 중 4건」처럼 전체와 함께'],
    ['내려받기', '비용 처리하시는 분을 위해 엑셀로'],
  ],
});

P['MY0202'] = () => 잎({
  부모: 상세, 제목: '진행 단계를 펼쳐 볼 때',
  설명: '예정과 실제가 다르면 그것을 표시합니다.',
  본문: `${U.card('', U.timeline([
  { k: 'done', t: '신청', d: '2026-08-10 01:12' },
  { k: 'done', t: '결제 — 대여료 240,000원', d: '2026-08-10 01:14 · 신한카드 일시불' },
  { k: 'done', t: '수령 — 매장 방문', d: '예정 8/15 10:00 → 실제 8/15 10:12 · 구성품 확인, 사진 4장' },
  { k: 'on', t: '이용 중', d: '반납 예정 8/17 18:00 — <b class="dan">1일 15시간 지남</b>' },
  { k: '', t: '반납', d: '아직' },
  { k: '', t: '점검', d: '아직 — 1~2일 걸립니다' },
  { k: '', t: '정산 · 보증금 환급', d: '아직' },
]))}
${U.card('예정과 실제', U.table(['단계', { t: '예정', w: '148px', cls: 'r' }, { t: '실제', w: '164px', cls: 'r' }], [
  ['수령', { t: '8/15 10:00', cls: 'r' }, { t: '<span class="num">8/15 10:12</span>', cls: 'r' }],
  ['반납', { t: '8/17 18:00', cls: 'r' }, { t: '<b class="dan">아직 (1일 15시간 지남)</b>', cls: 'r' }],
  ['환급', { t: '8/20 예정', cls: 'r' }, { t: '<span class="muted">반납 후 계산</span>', cls: 'r' }],
]), { cls: 'mt6' })}
${U.banner('info', '📌', '<b>늦어진 구간은 붉게 표시합니다.</b> 어디서 밀렸는지 한눈에 보이게요.', { cls: 'mt6' })}`,
  다루는것: [
    ['펼치면', '단계마다 시각과 처리 내용'],
    ['예정 vs 실제', '나란히 놓고 다르면 표시한다'],
    ['늦어진 구간', '붉게 — 어디서 밀렸는지 보이게'],
    ['남은 단계', '회색으로 두고 예상 시점을 적는다'],
  ],
});

P['MY0203'] = () => 잎({
  부모: 상세, 제목: '사진을 크게 견줘 볼 때',
  설명: '같은 자리끼리 좌우로 놓고 확대할 수 있습니다.',
  본문: `${U.card('', `<div class="chips mb6">${['정면', '옆면', '바닥', '보관가방'].map((t, i) => U.chip(t, i === 0)).join('')}</div>
  <div class="g2">
    <div><div class="t-sub mb2">받으실 때 · 8/15 10:14</div>${U.ph(['정면', 1200, 900], { seed: '정면' })}</div>
    <div><div class="t-sub mb2">돌려주실 때 · 아직</div>
      <div class="ph t2" style="aspect-ratio:4/3;display:grid;place-items:center">
        <span class="lb">반납할 때 찍으시면 여기 나란히 놓입니다</span></div></div>
  </div>`)}
${U.card('무엇에 쓰나요', `<ul class="stack t-sub">
  <li>· <b>반납 점검</b>에서 지금 상태와 견줍니다</li>
  <li>· <b>이의를 제기</b>하실 때 근거가 됩니다</li>
  <li>· 문의하실 때 <b>자동으로 붙습니다</b> — 다시 찾아 올리지 않으셔도 돼요</li>
</ul>`, { cls: 'mt6' })}
${U.card('내려받기와 보관', `<div class="btns">${U.btn('사진 전부 내려받기', { attr: ' data-toast="4장을 내려받았어요" data-toast-kind="ok"' })}</div>
  <p class="t-sub mt4">사진은 대여가 끝나고 <b>1년</b> 뒤 지웁니다. 필요하시면 미리 받아 두세요.</p>`, { cls: 'mt6' })}`,
  다루는것: [
    ['짝 맞추기', '같은 자리끼리 좌우로'],
    ['아직 없으면', '빈 칸에 「반납 때 찍으시면 여기」를 적는다'],
    ['확대', '눌러서 크게 볼 수 있다'],
    ['보관 기간', '1년 뒤 지운다 — 미리 받아 두시라고 알린다'],
  ],
});

P['MY0204'] = () => 잎({
  부모: 상세, 제목: '서류를 받을 때',
  설명: '네 가지를 한자리에서 받으실 수 있습니다.',
  본문: `${U.card('', U.table(['서류', '무엇이 들어 있나', { t: '', w: '164px' }], [
  ['<b>계약서</b>', '빌린 것 · 기간 · 금액 · 약관 · 서명', `<div class="btns">${U.btn('받기', { sm: true })}${U.btn('메일로', { sm: true })}</div>`],
  ['<b>영수증</b>', '대여료 결제 내역', `<div class="btns">${U.btn('받기', { sm: true })}${U.btn('메일로', { sm: true })}</div>`],
  ['<b>정산서</b>', '연체·파손·환급 내역', `<div class="btns">${U.btn('받기', { sm: true, off: true })}${U.btn('메일로', { sm: true, off: true })}</div>`],
  ['<b>세금계산서</b>', '사업자용', U.btn('발행 요청', { sm: true, cls: 'btn-pri' })],
]))}
${U.banner('info', 'ℹ', '<b>정산서는 정산이 끝나야</b> 받으실 수 있습니다. 지금은 아직 이용 중이에요.', { cls: 'mt6' })}
${U.card('세금계산서', `<p class="t-sub">사업자로 빌리셨으면 발행해 드립니다. <b>사업자등록번호와 이메일</b>이 필요해요.</p>
  <div class="f2 mt4">${U.input({ ph: '000-00-00000' })}${U.input({ type: 'email', ph: 'tax@company.com' })}</div>
  <div class="btns mt4">${U.btn('발행 요청', { cls: 'btn-pri', attr: ' data-toast="요청했어요. 다음 달 10일까지 발행됩니다" data-toast-kind="ok"' })}</div>
  <p class="t-sub mt3">이용하신 달의 <b>다음 달 10일</b>까지 발행됩니다.</p>`, { cls: 'mt6' })}
${U.card('언제까지 받을 수 있나요', `<p class="t-sub">모든 서류는 <b>5년</b> 동안 마이페이지에 남습니다(전자상거래법).
  그 뒤에는 지워지니 필요하시면 미리 받아 두세요.</p>`, { cls: 'mt6' })}`,
  다루는것: [
    ['네 가지', '계약서 · 영수증 · 정산서 · 세금계산서'],
    ['아직 안 되는 것', '정산 전에는 정산서를 잠근다'],
    ['받는 방법', '내려받기 · 이메일 둘 다'],
    ['보관 기간', '5년 — 법으로 정해진 기간'],
  ],
});

P['MY0205'] = () => 잎({
  부모: 상세, 제목: '취소된 대여',
  설명: '왜 취소됐고 얼마가 돌아갔는지 남깁니다.',
  본문: `${U.banner('info', '↩', '<b>2026년 7월 12일에 취소하셨습니다.</b> 전액 환불됐어요.')}
${U.card('', U.kv([
  ['대여번호', '<span class="num">R-20260710-0022</span>'],
  ['장비', '스노우피크 타프 헥사 × 1개'],
  ['빌릴 예정이던 기간', '<span class="num">2026-07-18 ~ 07-20</span>'],
  ['취소한 때', '<span class="num">2026-07-12 14:30</span>'],
  ['취소 사유', '고객 요청 — 일정 변경'],
  ['상태', U.stBadge('취소')],
]), { cls: 'mt6' })}
${U.card('환불 내역', `${U.sumRows([
  ['결제했던 대여료', '<span class="num">96,000원</span>'],
  ['취소 수수료', '<span class="num">0원</span>'],
], ['돌려받은 돈', '<span class="num pri">96,000원</span>'])}
${U.banner('ok', '✓', '<b>받으시기 6일 전에 취소하셔서 전액 환불</b>됐습니다. (3일 전까지는 100%)', { cls: 'mt4' })}
<p class="t-sub mt4">보증금 80,000원의 카드 한도 보류도 함께 풀렸습니다 — 2026-07-13 처리.</p>`, { cls: 'mt6' })}
${U.card('다시 빌리시겠어요', `<div class="row-b wrap-row">
  <div><div class="strong">스노우피크 타프 헥사</div>
    <div class="t-sub mt1">그때 못 쓰신 것입니다. 지금은 4대 중 3대 남아 있어요.</div></div>
  ${U.btn('날짜 고르기', { cls: 'btn-pri', href: 'PD0301' })}
</div>`, { cls: 'mt6' })}`,
  다루는것: [
    ['남기는 것', '언제 · 왜 취소했고 얼마가 돌아갔는지'],
    ['수수료 근거', '며칠 전 취소라 몇 %인지 밝힌다'],
    ['보증금', '한도 보류도 함께 풀렸다는 것을 적는다'],
    ['다시 빌리기', '못 쓰신 장비를 다시 권한다'],
  ],
});

P['MY0302'] = () => 잎({
  부모: 후기, 제목: '별점을 줄 때',
  설명: '항목을 넷으로 나눕니다 — 렌탈에서 궁금한 것이 다릅니다.',
  본문: `${U.card('', `<div style="text-align:center;padding:var(--sp-block) 0">
    <div style="font-size:44px;letter-spacing:6px" class="pri">★★★★★</div>
    <div class="t-card mt4">아주 만족해요</div>
  </div>
  <div class="stack mt6">
    ${[['장비 상태', '깨끗하고 멀쩡했나요', 5], ['설명과 같은지', '사진·설명대로였나요', 5],
       ['받고 돌려주기', '편했나요', 4], ['응대', '물어봤을 때 친절했나요', 5]]
      .map(([t, d, v]) => `<div class="row-b"><div><div class="strong">${t}</div><div class="t-sub">${d}</div></div>
        <div style="font-size:22px;letter-spacing:3px" class="pri">${'★'.repeat(v)}${'☆'.repeat(5 - v)}</div></div>`).join('')}
  </div>`)}
${U.card('왜 이 넷인가요', U.table(['항목', '왜 묻나'], [
  ['<b>장비 상태</b>', '남이 쓰던 것을 빌리는 서비스입니다. 가장 궁금한 것이에요'],
  ['<b>설명과 같은지</b>', '사진과 다르면 그날 캠핑을 망칩니다'],
  ['<b>받고 돌려주기</b>', '매장이 멀거나 택배가 늦으면 그것도 비용입니다'],
  ['<b>응대</b>', '현장에서 막혔을 때 연락이 되는지가 중요합니다'],
]), { cls: 'mt6' })}
${U.banner('info', '⭐', '<b>전체 별점만 받으면 무엇이 좋았는지 모릅니다.</b> 나눠 받으면 다음 손님이 훨씬 잘 고르실 수 있어요.', { cls: 'mt6' })}`,
  다루는것: [
    ['넷으로 나눔', '상태 · 설명 일치 · 편의 · 응대'],
    ['왜 이 넷인가', '렌탈에서만 궁금한 것들이다'],
    ['전체 별점', '항목 평균이 아니라 따로 받는다'],
    ['미입력', '전체 별점만 필수, 항목은 선택'],
  ],
});

P['MY0303'] = () => 잎({
  부모: 후기, 제목: '사진을 올릴 때',
  설명: '실제로 쓰는 모습이 다음 분께 가장 도움이 됩니다.',
  본문: `${U.banner('ok', '📷', '<b>사진을 올리시면 적립금 2,000원을 더 드려요.</b> 글보다 사진 한 장이 더 잘 알려줍니다.')}
${U.card('', `<div class="g4">${[1, 2, 3, 4].map((i) => `<div>${U.ph([`사진 ${i}`, 800, 600], { seed: 'rv' + i })}
  <div class="btns mt2">${U.btn(i <= 2 ? '바꾸기' : '올리기', { sm: true, w: true, attr: ` data-toast="사진 ${i}을 올렸어요"` })}</div></div>`).join('')}</div>
<p class="t-sub mt6">최대 <b>5장</b>까지 · 한 장에 10MB까지. 크면 저희가 줄여서 올립니다.</p>`, { cls: 'mt6' })}
${U.card('어떤 사진이 도움이 되나요', `<div class="g2">
  ${U.box(`<div class="strong pri mb2">✓ 이런 사진</div><ul class="stack t-sub">
    <li>· 실제로 설치해 둔 모습</li><li>· 크기를 가늠할 수 있는 사진 (사람이나 물건과 함께)</li>
    <li>· 안쪽이 어떻게 생겼는지</li></ul>`)}
  ${U.box(`<div class="strong mb2">△ 이런 사진은 덜해요</div><ul class="stack t-sub">
    <li>· 가방에 든 채로</li><li>· 상품 사진과 똑같은 각도</li>
    <li>· 풍경만 나온 사진</li></ul>`)}
</div>`, { cls: 'mt6' })}
${U.card('사진은 어떻게 쓰이나요', `<ul class="stack t-sub">
  <li>· 장비 상세의 <b>후기 탭</b>에 나옵니다</li>
  <li>· 얼굴이나 차 번호가 나온 사진은 <b>가려 드립니다</b></li>
  <li>· 광고에는 쓰지 않습니다 — 쓰게 되면 따로 여쭙습니다</li>
</ul>`, { cls: 'mt6' })}`,
  다루는것: [
    ['혜택', '사진을 올리면 적립금 2,000원 추가'],
    ['어떤 사진', '설치해 둔 모습 · 크기 가늠 · 안쪽'],
    ['개인정보', '얼굴·차 번호는 가려 준다'],
    ['용도', '후기 탭에만. 광고는 따로 동의를 받는다'],
  ],
});

P['MY0304'] = () => 잎({
  부모: 후기, 제목: '후기를 올리고 나면',
  설명: '적립금이 언제 들어오고 언제까지 고칠 수 있는지 알려드립니다.',
  본문: `${U.banner('ok', '🎉', '<b>후기가 올라갔습니다. 고맙습니다!</b>')}
${U.card('', `${U.sumRows([
  ['후기 작성', '<span class="num">3,000원</span>'],
  ['사진 2장', '<span class="num">2,000원</span>'],
], ['받으신 적립금', '<span class="num pri">5,000원</span>'])}
<p class="t-sub mt4">적립금은 <b>바로</b> 쓰실 수 있습니다. 쌓인 날부터 1년 안에 쓰세요.</p>`, { cls: 'mt6' })}
${U.card('언제 보이나요', U.timeline([
  { k: 'done', t: '올리셨습니다', d: '방금' },
  { k: 'on', t: '확인 중 (하루 안)', d: '개인정보가 나온 사진이 있는지 봅니다' },
  { k: '', t: '장비 상세에 노출', d: '후기 탭에 나옵니다' },
]), { cls: 'mt6' })}
${U.card('고치거나 지우기', `<ul class="stack t-sub">
  <li>· <b>7일 안에</b> 고치실 수 있습니다</li>
  <li>· 언제든 <b>지우실</b> 수 있습니다 — 다만 적립금은 회수됩니다</li>
  <li>· 비공개로 바꾸시면 별점만 반영되고 글은 안 보입니다</li>
</ul>
<div class="btns mt4">${U.btn('내 후기 보기', { href: 'MY0101' })}${U.btn('고치기', { attr: ' data-toast="후기 수정 화면을 엽니다"' })}</div>`, { cls: 'mt6' })}
${U.card('다른 후기도 써 주시겠어요', `<p class="t-sub">아직 후기를 안 쓰신 대여가 <b>2건</b> 있습니다.</p>
  <div class="btns mt4">${U.btn('이어서 쓰기', { cls: 'btn-pri', href: 'MY0301' })}</div>`, { cls: 'mt6' })}`,
  다루는것: [
    ['적립금', '얼마를 언제 받는지 · 언제까지 쓰는지'],
    ['확인 절차', '개인정보가 나온 사진을 거른다'],
    ['수정·삭제', '7일 안에 수정 · 삭제 시 적립금 회수'],
    ['이어 쓰기', '아직 안 쓴 대여로 이어 준다'],
  ],
});

P['MY0402'] = () => 잎({
  부모: 알림, 제목: '알림을 켜고 끌 때',
  설명: '반납 알림만은 끄지 마시라고 권합니다.',
  본문: `${U.card('', U.table(
  ['무슨 일이 있을 때', { t: '문자', w: '72px', cls: 'c' }, { t: '카톡', w: '72px', cls: 'c' }, { t: '이메일', w: '76px', cls: 'c' }],
  [['수령 안내', 1, 1, 0], ['<b>반납 하루 전</b>', 1, 1, 0], ['<b>반납 3시간 전</b>', 1, 1, 0],
   ['<b>연체 안내</b>', 1, 1, 1], ['점검 완료', 0, 1, 1], ['보증금 환급 완료', 1, 1, 1],
   ['자리 알림', 1, 0, 0], ['기획전·쿠폰', 0, 1, 1]]
    .map(([t, a, b, c]) => [t,
      { t: U.toggle(!!a, `${t} 문자 알림을 바꿨어요`), cls: 'c' },
      { t: U.toggle(!!b, `${t} 카톡 알림을 바꿨어요`), cls: 'c' },
      { t: U.toggle(!!c, `${t} 이메일 알림을 바꿨어요`), cls: 'c' }]),
))}
${U.banner('warn', '⚠', '<b>반납 알림은 끄지 않으시길 권합니다.</b> 잊으시면 하루에 27,780원이 붙습니다.', { cls: 'mt6' })}
${U.card('끄시려고 하면', `<p class="t-sub">반납 알림을 끄려 하시면 <b>한 번 더 여쭙습니다.</b></p>
  ${U.box(`<div class="strong mb2">정말 끄시겠어요?</div>
    <p class="t-sub">반납일을 잊으시면 연체료가 붙습니다. 지난 3개월 동안 알림을 끄신 분의
      <b>18%</b>가 연체하셨어요.</p>
    <div class="btns mt4">${U.btn('그래도 끌게요', { sm: true, cls: 'btn-dan' })}${U.btn('켜 둘게요', { sm: true, cls: 'btn-pri' })}</div>`)}`, { cls: 'mt6' })}
${U.card('광고성 알림', `<p class="t-sub">기획전·쿠폰 알림은 <b>광고</b>입니다. 언제든 끄실 수 있고,
  끄셔도 <b>예약·반납 안내는 그대로</b> 갑니다.</p>
  <p class="t-sub mt3">야간(21시~08시)에는 광고를 보내지 않습니다.</p>`, { cls: 'mt6' })}`,
  다루는것: [
    ['즉시 반영', '저장 버튼 없이 토글하는 즉시'],
    ['반납 알림', '끄려 하면 한 번 더 여쭙는다'],
    ['근거', '「끄신 분의 18%가 연체」처럼 숫자로 말한다'],
    ['광고 구분', '광고와 안내를 갈라 두고 야간 발송을 막는다'],
  ],
});

P['MY0403'] = () => 잎({
  부모: 알림, 제목: '자리 알림 신청 목록',
  설명: '무엇을 얼마나 기다리고 계신지 한자리에서 봅니다.',
  본문: `${U.card('', U.table(
  ['장비', { t: '기다리는 기간', w: '148px' }, { t: '수량', w: '64px', cls: 'c' }, { t: '순번', w: '68px', cls: 'c' }, { t: '신청일', w: '104px' }, { t: '', w: '76px' }],
  [[G.nm, '8/15 ~ 8/17', { t: '3', cls: 'c' }, { t: '<b class="num">4</b>', cls: 'c' }, '<span class="num sub">8/10</span>', U.btn('취소', { sm: true, cls: 'btn-dan', attr: ' data-toast="취소했어요"' })],
   [GEAR[6].nm, '9/05 ~ 9/07', { t: '1', cls: 'c' }, { t: '<b class="num pri">1</b>', cls: 'c' }, '<span class="num sub">8/09</span>', U.btn('취소', { sm: true, cls: 'btn-dan', attr: ' data-toast="취소했어요"' })]],
))}
${U.card('알림이 나간 기록', U.table([{ t: '언제', w: '132px' }, '무엇', { t: '결과', w: '132px' }], [
  ['<span class="num sub">2026-08-08 14:22</span>', '카즈미 텐트 8/15~17 자리 남', U.badge('놓쳤어요', 'b-mut')],
  ['<span class="num sub">2026-07-30 09:10</span>', 'DJI 짐벌 8/02~04 자리 남', U.badge('빌리셨어요', 'b-ok')],
]), { cls: 'mt6' })}
${U.banner('info', '⚡', '<b>알림을 받으시면 서둘러 주세요.</b> 기다리시는 분 모두에게 함께 나가고 먼저 결제하신 분이 가져갑니다.', { cls: 'mt6' })}
${U.card('저절로 없어지는 때', `<ul class="stack t-sub">
  <li>· 기다리시던 <b>기간이 지나면</b></li>
  <li>· 그 기간에 <b>다른 것을 빌리시면</b></li>
  <li>· 신청한 지 <b>90일</b>이 지나면</li>
</ul>`, { cls: 'mt6' })}`,
  다루는것: [
    ['목록', '장비 · 기간 · 수량 · 순번 · 신청일'],
    ['지난 알림', '나갔는데 놓치신 것도 남긴다'],
    ['선착순 안내', '순번이 자리를 잡아 두지 않는다'],
    ['자동 만료', '기간 지남 · 대체 예약 · 90일'],
  ],
});

P['MY0404'] = () => 잎({
  부모: 알림, 제목: '쿠폰 탭을 옮길 때',
  설명: '만료가 가까운 것을 먼저 보여드립니다.',
  본문: `${U.tabBox([{ label: '쓸 수 있어요', cnt: 2, pane: 'a' }, { label: '썼어요', cnt: 3, pane: 'b' }, { label: '기간 지남', cnt: 1, pane: 'c' }],
  `${U.pane('a', `<div class="stack" style="gap:var(--sp-item)">
    ${[['재이용 10% 할인', '5만원 이상 · 9월 20일까지', '3일 남음', true],
       ['첫 캠핑 20% 할인', '캠핑 장비만 · 12월 31일까지', '', false]]
      .map(([nm, cond, left, urgent]) => `<div class="rowcard">
        <div class="bd"><div class="t-card">${nm}</div><div class="t-sub mt1">${cond}</div></div>
        <div class="side">${left ? U.badge(left, urgent ? 'b-dan' : 'b-mut') : ''}
          <div class="mt2">${U.btn('쓰러 가기', { sm: true, cls: 'btn-pri', href: 'PD0101' })}</div></div>
      </div>`).join('')}
  </div>`, true)}
   ${U.pane('b', `<div class="stack" style="gap:var(--sp-item)">
    <div class="rowcard"><div class="bd"><div class="t-card muted">여름 기획전 10%</div>
      <div class="t-sub mt1">2026-07-22 사용 · 15,600원 할인</div></div></div>
   </div>`)}
   ${U.pane('c', `<div class="stack" style="gap:var(--sp-item)">
    <div class="rowcard"><div class="bd"><div class="t-card muted">신규 가입 5,000원</div>
      <div class="t-sub mt1">2026-06-30 만료 · 못 쓰셨어요</div></div></div>
   </div>`)}`,
  0)}
${U.card('쿠폰 등록', `<div class="row" style="gap:var(--sp-item)">
  ${U.input({ ph: '쿠폰 번호를 넣으세요' })}
  ${U.btn('등록', { cls: 'btn-pri', attr: ' data-toast="쿠폰을 등록했어요" data-toast-kind="ok"' })}
</div>`, { cls: 'mt6' })}
${U.banner('warn', '⏳', '<b>3일 안에 만료되는 쿠폰이 1장 있습니다.</b> 만료 3일 전에 문자로도 알려드려요.', { cls: 'mt6' })}`,
  다루는것: [
    ['탭 셋', '쓸 수 있음 · 썼음 · 기간 지남'],
    ['만료 임박', '3일 이내는 붉게 · 문자로도 알린다'],
    ['쓴 쿠폰', '얼마나 할인받았는지 남긴다'],
    ['못 쓴 것', '만료된 것도 보여준다 — 다음엔 챙기시게'],
  ],
});

P['MY0405'] = () => 잎({
  부모: 알림, 제목: '적립금이 어떻게 쌓였나',
  설명: '언제 없어지는지가 가장 중요합니다.',
  본문: `${U.card('', `<div style="text-align:center;padding:var(--sp-block) 0">
    <div class="t-sub">쓸 수 있는 적립금</div>
    <div class="t-page pri num" style="font-size:44px">13,000원</div>
  </div>
  ${U.sumRows([
    ['이번 달 없어질 것', '<span class="num warn">0원</span>'],
    ['다음 달 없어질 것', '<span class="num warn">3,000원</span>'],
    ['최소 사용 금액', '<span class="num">1,000원</span>'],
  ])}`)}
${U.card('쌓이고 쓴 내역', U.table([{ t: '언제', w: '116px' }, '무엇으로', { t: '금액', w: '104px', cls: 'r nowrap' }, { t: '남은 것', w: '104px', cls: 'r nowrap' }], [
  ['<span class="num sub">2026-08-20</span>', '후기 작성 + 사진', { t: '<span class="num pri">+5,000원</span>', cls: 'r nowrap' }, { t: '<span class="num">13,000원</span>', cls: 'r nowrap' }],
  ['<span class="num sub">2026-07-26</span>', '후기 작성', { t: '<span class="num pri">+3,000원</span>', cls: 'r nowrap' }, { t: '<span class="num">8,000원</span>', cls: 'r nowrap' }],
  ['<span class="num sub">2026-07-22</span>', '대여료에 사용', { t: '<span class="num">-2,000원</span>', cls: 'r nowrap' }, { t: '<span class="num">5,000원</span>', cls: 'r nowrap' }],
  ['<span class="num sub">2026-07-05</span>', '보증금을 적립금으로 받음', { t: '<span class="num pri">+7,000원</span>', cls: 'r nowrap' }, { t: '<span class="num">7,000원</span>', cls: 'r nowrap' }],
]), { cls: 'mt6' })}
${U.banner('warn', '⏳', '<b>쌓인 날부터 1년</b>이 지나면 없어집니다. 없어지기 <b>30일 전</b>에 문자로 알려드려요.', { cls: 'mt6' })}
${U.card('어떻게 쌓이나요', U.table(['무엇으로', { t: '얼마', w: '132px', cls: 'r nowrap' }], [
  ['후기 작성', { t: '<span class="num">3,000원</span>', cls: 'r nowrap' }],
  ['후기에 사진 올리기', { t: '<span class="num">2,000원</span>', cls: 'r nowrap' }],
  ['보증금을 적립금으로 받기', { t: '<span class="num">환급액의 5% 더</span>', cls: 'r nowrap' }],
  ['친구 소개', { t: '<span class="num">5,000원</span>', cls: 'r nowrap' }],
]), { cls: 'mt6' })}`,
  다루는것: [
    ['가장 위에', '쓸 수 있는 금액과 «곧 없어질» 금액'],
    ['내역', '쌓임·사용·소멸을 시간 순으로'],
    ['소멸 예고', '30일 전에 문자로 알린다'],
    ['쌓는 법', '어떻게 하면 쌓이는지 표로'],
  ],
});
