/* ST 정산 (4) */
import * as U from './ui.mjs';
import { GEAR, 정산항목, 면책액, SITE } from './data.mjs';

export const PAGES = {};
const G = GEAR[0];
const 보증금 = 200_000;
const 청구 = 정산항목.reduce((a, x) => a + x.amt, 0) - 면책액;
const 환급 = 보증금 - 청구;

PAGES['ST-01'] = () => ({
  body: `${U.pageHd('점검하고 있어요', `${G.nm} × 2개 · 8월 18일 09:14 접수`)}

<div class="wrap-read">
  ${U.card('', U.steps([
    ['반납 접수', '8/18 09:14'], ['구성품 확인', '8/18 09:30'], ['상태 점검', '진행 중'], ['정산 확정', ''],
  ], 2))}

  ${U.banner('info', '🔍', '<b>상태 점검 중입니다.</b> 오늘 18시쯤 끝날 것 같아요. 끝나면 문자로 알려드릴게요.', { cls: 'mt6' })}

  ${U.card('무엇을 보나요', U.accordion([
    { q: '① 반납 접수 — 끝났어요', a: '언제 돌려주셨는지 시각을 기록합니다. 이 시각으로 연체 여부가 정해집니다. (8/18 09:14 접수 — 기한보다 1일 늦음)' },
    { q: '② 구성품 확인 — 끝났어요', a: '목록대로 다 있는지 하나씩 셉니다. 폴대 1개가 없는 것으로 확인됐습니다.' },
    { q: '③ 상태 점검 — 지금 하고 있어요', a: '찢어짐·부러짐·오염을 봅니다. 받으실 때 사진과 견줍니다. 미리 신고해 주신 부분은 따로 표시합니다. 수리로 될 것 같으면 수리비만 받습니다.' },
    { q: '④ 정산 확정 — 아직이에요', a: '청구할 금액을 확정하고 보증금에서 뺍니다. 확정되면 이의를 제기하실 수 있는 기간이 7일 있습니다.' },
  ], 2), { cls: 'mt6' })}

  ${U.card('보증금은 언제 돌려받나요', `
    <p>점검이 끝나고 <b>3영업일 안에</b> 돌려드립니다. 지금 <b>${U.won(보증금)}</b>이 신한카드에 한도 보류 중이에요.</p>
    ${U.banner('ok', '🤝', '<b>2영업일이 넘도록 점검이 안 끝나면 자동으로 「이상 없음」 처리되고 보증금이 전액 환급됩니다.</b> 저희가 늦은 것을 손님이 기다리실 이유는 없으니까요.', { cls: 'mt4' })}`, { cls: 'mt6' })}

  ${U.card('제가 올린 사진', `<div class="g4">
    ${['정면', '옆면', '바닥', '보관가방'].map((t) => `<div>${U.ph([t, 800, 600], { seed: t + 'now' })}
      <div class="t-sub mt2" style="text-align:center">${t}</div></div>`).join('')}
  </div>`, { cls: 'mt6' })}

  <div class="btns mt8">
    ${U.btn('새로고침', { attr: ' data-toast="아직 점검 중이에요"' })}
    ${U.btn('정산 내역 미리 보기', { cls: 'btn-pri', href: 'ST-02' })}
    ${U.btn('대여 상세', { href: 'MY-02' })}
  </div>
</div>`,
});

PAGES['ST-02'] = () => ({
  body: `${U.pageHd('정산 내역', `${G.nm} × 2개 · 점검 완료 8월 18일 18:02`)}

<div class="split-r">
  <div>
    ${U.banner('warn', '📋', '점검 결과 — <b>1일 연체</b>와 <b>폴대 1개 파손</b>, <b>흙 오염</b>이 확인됐습니다.')}

    ${U.card('무엇을 얼마나 청구하나요', `
      <p class="t-sub mb4">항목을 누르시면 <b>근거와 계산식</b>이 펼쳐집니다. 금액만 적고 넘어가지 않습니다.</p>
      ${/* 제목과 금액을 «한 덩어리»로 묶어 넣는다. 따로 넣으면 아코디언의 ＋ 표시까지
            세 조각이 되어 폭이 모자랄 때 6px 씩 삐져나온다(2026-08-10 에 재서 찾았다). */ ''}
      ${U.accordion(정산항목.map((x) => ({
        q: `<span class="grow row-b" style="gap:var(--sp-item)"><span>${x.nm}</span><span class="num strong">${U.won(x.amt)}</span></span>`,
        a: `<div class="g2">
          <div>${U.kv([['계산', x.calc], ['근거', x.근거]], { cls: 'left' })}</div>
          <div>${U.ph(['근거 사진', 800, 600], { seed: x.nm })}</div>
        </div>`,
      })), 0)}
      <div class="mt6">${U.table([{ t: '항목', w: '' }, { t: '금액', w: '124px', cls: 'r nowrap' }],
        [...정산항목.map((x) => [x.nm, { t: `<span class="num">${U.won(x.amt)}</span>`, cls: 'r nowrap' }]),
         [`<span class="pri">파손 면책 보험 적용</span>`, { t: `<span class="num pri">-${U.num(면책액)}원</span>`, cls: 'r nowrap' }]],
        { foot: ['<b>청구 합계</b>', { t: `<b class="num">${U.won(청구)}</b>`, cls: 'r nowrap' }] })}</div>`, { cls: 'mt6' })}

    ${U.card('보증금에서 이렇게 빠집니다', `
      ${U.barSplit(청구, 환급)}
      <div class="mt6">${U.sumRows([
        ['보증금', `<span class="num">${U.won(보증금)}</span>`],
        ['정산 청구', `<span class="num">-${U.num(청구)}원</span>`],
      ], ['돌려받으실 돈', `<span class="num pri">${U.won(환급)}</span>`])}</div>
      ${U.banner('info', 'ℹ', '청구액이 보증금보다 <b>적어서 추가로 내실 것은 없습니다.</b> 넘었다면 등록하신 카드로 차액이 청구됐을 거예요.', { cls: 'mt4' })}`, { cls: 'mt6' })}

    ${U.card('납득이 안 되시면', `
      <p>사진과 계산식을 보시고 <b>다르다고 생각되시면 말씀해 주세요.</b> 확정 후 <b>7일 안에</b> 이의를 제기하실 수 있습니다.</p>
      <div class="mt4">${U.check('이의가 있어요', { attr: ' data-toast="아래에 내용을 적어 주세요"' })}</div>
      ${U.field('어떤 점이 다른가요', U.textarea({ ph: '예) 흙 오염은 받을 때부터 있던 것 같습니다. 수령 사진을 봐 주세요.' }))}
      <div class="btns">${U.btn('사진 붙이기', { sm: true, attr: ' data-toast="사진을 붙였어요"' })}${U.btn('이의 접수하기', { sm: true, cls: 'btn-pri', href: 'CS-02' })}</div>
      <p class="t-sub mt3">이의를 접수하시면 정산이 <b>보류</b>되고 다시 확인합니다. 보통 2영업일 걸려요.</p>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('정리하면', `
      ${U.sumRows([
        ['보증금', `<span class="num">${U.won(보증금)}</span>`],
        ['연체료', `<span class="num">-${U.num(정산항목[0].amt)}원</span>`],
        ['파손 (보험 면책)', '<span class="num">0원</span>'],
        ['세척비', `<span class="num">-${U.num(정산항목[2].amt)}원</span>`],
      ], ['환급 예정', `<span class="num pri">${U.won(환급)}</span>`])}
      <p class="t-sub mt4">이의 제기 기한 <b>2026년 8월 25일</b>까지 (남은 7일)</p>`, {
        ft: `<div class="btns-v">
          ${U.btn('정산 확정하기', { cls: 'btn-pri', w: true, attr: ' data-modal="m-fix"' })}
          ${U.btn('정산서 내려받기', { w: true, attr: ' data-toast="정산서를 내려받았어요" data-toast-kind="ok"' })}
          ${U.btn('이의 제기', { w: true, href: 'CS-02' })}
        </div>`,
      })}
  </div>
</div>

${U.modal('m-fix', `${U.won(청구)}으로 확정할까요`,
  `<p>확정하시면 보증금에서 빼고 <b class="num">${U.won(환급)}</b>을 돌려드립니다.</p>
   <p class="t-sub mt4">확정 후에도 <b>7일 안에는</b> 이의를 제기하실 수 있습니다.</p>`,
  `${U.btn('더 볼게요', { attr: ' data-dismiss' })}${U.btn('확정하기', { cls: 'btn-pri', attr: ' data-dismiss data-go' })}`)}`,
});

PAGES['ST-03'] = () => ({
  body: `${U.pageHd('보증금 돌려드리기', `${G.nm} × 2개 · 정산 확정 8월 18일`)}

<div class="wrap-read">
  ${U.card('', `<div style="text-align:center;padding:var(--sp-block) 0">
    <div class="t-sub">돌려받으실 돈</div>
    <div class="t-page pri num" style="font-size:48px">${U.num(환급)}원</div>
    <div class="t-sub mt3">보증금 ${U.num(보증금)} − 정산 ${U.num(청구)} = ${U.num(환급)}원</div>
  </div>`)}

  ${U.card('어떻게 받으실래요', `
    <div class="stack">
      ${U.check(`<b>카드 한도 보류를 풀기</b> <span class="badge b-solid">권합니다</span> <span class="t-sub">— 1~3영업일</span>`,
        { on: true, sub: '실제로 빠져나간 돈이 없어서 «입금»이 아니라 «한도 해제»입니다. 카드 명세서에는 아무것도 안 찍혀요.' })}
      ${U.check('<b>계좌로 받기</b> <span class="t-sub">— 3~5영업일</span>', { sub: '한도 보류를 풀고 계좌로 입금해 드립니다. 조금 더 걸립니다.' })}
      ${U.check(`<b>적립금으로 받기</b> <span class="badge b-acc">5% 더</span> <span class="t-sub">— 바로</span>`,
        { sub: `${U.won(환급)} 대신 ${U.won(Math.round(환급 * 1.05))}을 적립금으로 드립니다. 다음에 빌리실 때 쓰실 수 있어요.` })}
    </div>`, { cls: 'mt6' })}

  ${U.card('「한도 해제」가 무슨 뜻인가요', `
    <p class="t-sub">가장 많이 물어보시는 것입니다.</p>
    <div class="g2 mt4">
      ${U.box(`<div class="strong mb2">보증금을 걸 때</div>
        <p class="t-sub">카드사에 「이 사람 한도 중 20만원은 잠깐 못 쓰게 해 주세요」라고 요청합니다.
        <b>돈이 나가지는 않습니다.</b> 명세서에도 안 찍혀요.</p>`)}
      ${U.box(`<div class="strong mb2">보증금을 풀 때</div>
        <p class="t-sub">「이제 풀어 주세요」라고 요청합니다. 그러면 한도가 원래대로 돌아옵니다.
        <b>입금이 아니라 «해제»</b>라서 통장에 돈이 들어오지 않습니다.</p>`)}
    </div>
    <p class="t-sub mt4">그래서 「환급됐다는데 통장에 안 들어왔어요」라는 말씀을 자주 듣습니다.
      카드 한도를 확인해 보시면 늘어나 있을 거예요.</p>`, { cls: 'mt6' })}

  ${U.card('지금 어디까지 왔나요', U.steps([
    ['정산 확정', '8/18 18:30'], ['환급 요청', '8/18 18:31'], ['카드사 처리', '진행 중'], ['완료', ''],
  ], 2), { cls: 'mt6' })}

  ${U.banner('warn', '⏳', '<b>카드사 사정으로 며칠 더 걸릴 수 있습니다.</b> 7영업일이 지나도 한도가 안 풀리면 알려 주세요 — 저희가 카드사에 직접 확인하겠습니다.', {
    cls: 'mt6', right: U.btn('문의하기', { sm: true, href: 'CS-02' }),
  })}

  <div class="btns mt8">
    ${U.btn('이 방법으로 받기', { cls: 'btn-pri', lg: true, href: 'ST-04' })}
    ${U.btn('정산 내역 다시 보기', { href: 'ST-02' })}
    ${U.btn('환급 내역서', { attr: ' data-toast="내역서를 내려받았어요" data-toast-kind="ok"' })}
  </div>
</div>`,
});

PAGES['ST-04'] = () => ({
  body: `<div class="wrap-read">
  <div style="text-align:center;padding:var(--sp-sec) 0">
    <div style="font-size:52px">🎉</div>
    <h1 class="t-page mt4">${U.num(환급)}원 돌려드렸어요</h1>
    <p class="t-sub mt3">8월 20일 14:22 · 신한카드 한도 보류 해제</p>
  </div>

  ${U.card('이번 대여, 이렇게 마무리됐어요', U.table(['', { t: '', w: '148px', cls: 'r nowrap' }], [
    ['빌린 것', { t: `${G.nm} × 2개`, cls: 'r' }],
    ['기간', { t: '8/15 ~ 8/17 (2박 3일)', cls: 'r' }],
    ['낸 대여료', { t: '<span class="num">240,000원</span>', cls: 'r nowrap' }],
    ['걸었던 보증금', { t: `<span class="num">${U.won(보증금)}</span>`, cls: 'r nowrap' }],
    ['정산 (연체·파손·세척)', { t: `<span class="num">-${U.num(청구)}원</span>`, cls: 'r nowrap' }],
  ], { foot: ['<b>돌려받은 돈</b>', { t: `<b class="num pri">${U.won(환급)}</b>`, cls: 'r nowrap' }] }), { cls: 'mt6' })}

  <div class="btns mt6">
    ${U.btn('영수증 받기', { sm: true, attr: ' data-toast="이메일로 보냈어요" data-toast-kind="ok"' })}
    ${U.btn('정산서 받기', { sm: true, attr: ' data-toast="이메일로 보냈어요" data-toast-kind="ok"' })}
  </div>

  ${U.card('후기를 남겨 주시겠어요', `<div class="row-b wrap-row">
    <div><div class="strong">적립금 3,000원을 드려요</div>
      <div class="t-sub mt1">사진까지 올려 주시면 2,000원을 더 드립니다.</div></div>
    ${U.btn('후기 쓰기', { cls: 'btn-pri', href: 'MY-03' })}
  </div>`, { cls: 'mt8' })}

  ${U.card('한 번만 더 빌리시면 보증금이 없어져요', `
    <div class="row-b mb3"><span>3회 중 <b class="pri">2회</b> 완료</span><b class="num">66%</b></div>
    ${U.progress(66)}
    <p class="t-sub mt3">연체가 있으셨지만 <b>정산을 끝내셨으니 횟수는 그대로 올라갑니다.</b>
      한 번 더 이용하시면 다음부터 보증금을 받지 않습니다.</p>`, { cls: 'mt6' })}

  ${U.card('다음에 쓰실 쿠폰이 나왔어요', `<div class="row-b">
    <div><div class="strong">재이용 10% 할인</div><div class="t-sub mt1">9월 20일까지 · 5만원 이상</div></div>
    ${U.badge('쿠폰함에 넣었어요', 'b-ok')}
  </div>`, { cls: 'mt6' })}

  <div class="btns mt8">
    ${U.btn('이 장비 또 빌리기', { cls: 'btn-pri', href: 'PD-02' })}
    ${U.btn('내 대여 내역', { href: 'MY-01' })}
    ${U.btn('홈으로', { href: 'HO-01' })}
  </div>

  <p class="t-sub mt8" style="text-align:center">궁금한 게 있으시면 ${SITE.tel} 로 전화 주세요.</p>
</div>`,
});
