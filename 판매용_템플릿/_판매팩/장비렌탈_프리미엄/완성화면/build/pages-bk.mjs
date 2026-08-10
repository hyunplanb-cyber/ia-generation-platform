/* BK 예약·결제 (6) */
import * as U from './ui.mjs';
import { GEAR, SITE, 배상표 } from './data.mjs';

export const PAGES = {};
const G = GEAR[0];
const 대여료 = 139_000;
const 보증금 = 100_000;

PAGES['BK-01'] = () => ({
  body: `${U.pageHd('대여 신청', '받는 방법과 연락처만 넣으시면 됩니다.')}

${U.steps([['장바구니', '완료'], ['신청서', '지금'], ['결제', ''], ['확정', '']], 1)}

<div class="split-r mt8">
  <div>
    ${U.card('빌릴 장비', `<div class="rowcard" style="border:none;box-shadow:none;padding:0">
      <div class="thumb">${U.phFix(['장비', 400, 400], 80, { seed: G.id })}</div>
      <div class="bd"><div class="t-card">${G.nm} × 2개</div>
        <div class="t-sub mt1">8월 15일 (토) ~ 17일 (월) · 2박 3일</div></div>
    </div>`)}

    ${U.card('신청하시는 분', `
      <div class="f2">
        ${U.field('이름', U.input({ ph: '홍길동' }), { req: true })}
        ${U.field('연락처', U.input({ type: 'tel', ph: '010-0000-0000' }), { req: true, hint: '수령·반납 안내를 이 번호로 보냅니다.' })}
      </div>
      ${U.field('이메일', U.input({ type: 'email', ph: 'name@example.com' }), { hint: '계약서와 영수증을 보내드립니다.' })}`, { cls: 'mt6' })}

    ${U.card('어떻게 받으실래요', `
      <div class="stack mb6">
        ${U.check('<b>매장에서 받기</b> <span class="t-sub">— 무료</span>', { on: true, sub: `${SITE.addr} · 평일 10~19시, 토 10~17시`, none: false })}
        ${U.check('<b>택배로 받기</b> <span class="t-sub">— 왕복 6,000원</span>', { sub: '빌리는 날 아침에 도착하도록 하루 전에 보냅니다.' })}
      </div>
      ${U.field('방문 예정 시각', U.select(['10:00 ~ 11:00', '11:00 ~ 12:00', '13:00 ~ 14:00', '14:00 ~ 15:00', '17:00 ~ 18:00'], 0),
        { hint: '늦으실 것 같으면 전화 주세요. 다른 분 예약이 밀립니다.' })}
      <div class="mt4">${U.ph(['매장 위치 지도', 1200, 400], { seed: 'map' })}</div>`, { cls: 'mt6' })}

    ${U.card('돌려주실 때', `
      ${U.banner('warn', '📅', '<b>8월 17일 (월) 18시까지</b> 돌려주셔야 해요. 하루 늦으면 <b>13,890원</b>이 붙습니다.')}
      <p class="t-sub mt4">늦을 것 같으면 <b>반납일 전에 연장</b>해 주세요. 연장이 연체보다 훨씬 쌉니다.
        연장은 마이페이지에서 몇 번만 누르면 됩니다.</p>`, { cls: 'mt6' })}

    ${U.card('신분 확인', `
      <p>50만원이 넘는 장비는 받으실 때 <b>신분증을 확인</b>합니다. 지금 빌리시는 텐트는 해당되지 않아요.</p>
      <p class="t-sub mt3">대리 수령하실 경우 위임장이 필요합니다.</p>`, { cls: 'mt6' })}

    ${U.card('남기실 말씀', U.textarea({ ph: '처음이라 설치를 잘 못해요, 같은 말씀을 남겨 주시면 챙겨 드릴게요.' }), { cls: 'mt6' })}

    ${U.card('확인해 주세요', `
      ${U.check('<b>대여 약관</b>에 동의합니다', { sub: '기간·반납·연체에 대한 약속입니다.', attr: ' data-agree' })}
      ${U.check('<b>파손 배상 기준</b>을 확인했습니다', { sub: `폴대 ${U.won(배상표[0][1])} · 팩 ${U.won(배상표[1][1])} · 분실은 정가 100%`, attr: ' data-agree' })}
      ${U.check('<b>개인정보 수집·이용</b>에 동의합니다', { sub: '이름·연락처를 대여 관리 목적으로만 씁니다.', attr: ' data-agree' })}
      <div class="mt4">${U.check('<b>위 세 가지에 모두 동의합니다</b>', { attr: ' data-unlock="toPay"' })}</div>
      <p class="t-sub mt3"><a class="pri strong" href="${U.link('CS-03')}">약관 전문 보기</a></p>`, { cls: 'mt6', bdCls: '', ft: '' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('얼마인가요', `
      ${U.sumRows([
        ['대여료 (46,300 × 3일 × 2개)', '<span class="num">277,800원</span>'],
        ['금·토 할증', '<span class="num">+18,520원</span>'],
        ['3일 이상 할인 10%', '<span class="num">-29,632원</span>', 'minus'],
        ['재이용 쿠폰 10%', '<span class="num">-26,688원</span>', 'minus'],
        ['배송비', '<span class="num">0원</span>'],
      ], ['지금 낼 돈', '<span class="num">240,000원</span>'])}
      ${U.depositRow(보증금 * 2, '<b>빠져나가는 돈이 아닙니다.</b> 카드 한도만 잡아 두었다가 반납 확인 후 풀어 드려요.')}`, {
        ft: `<div class="btns-v">
          ${U.btn('결제하러 가기', { cls: 'btn-pri', lg: true, w: true, id: 'toPay', off: true, href: 'BK-02' })}
          ${U.btn('장바구니로', { w: true, href: 'CT-01' })}
        </div>
        <p class="t-sub mt3" style="text-align:center">동의에 체크하시면 결제 버튼이 열립니다.</p>`,
      })}
  </div>
</div>`,
});

PAGES['BK-02'] = () => ({
  body: `${U.pageHd('결제', '대여료와 보증금은 다른 돈입니다. 나눠서 보여드릴게요.')}

${U.steps([['장바구니', '완료'], ['신청서', '완료'], ['결제', '지금'], ['확정', '']], 2)}

<div class="split-r mt8">
  <div>
    ${U.card('돈이 두 갈래로 나뉩니다', `<div class="g2">
      ${U.box(`<div class="t-sub">지금 빠지는 돈</div>
        <div class="t-page pri mt2">${U.won(240_000)}</div>
        <div class="t-sub mt2">대여료입니다. 실제로 결제됩니다.</div>`)}
      ${U.box(`<div class="t-sub">걸어두는 돈</div>
        <div class="t-page mt2">${U.won(200_000)}</div>
        <div class="t-sub mt2">보증금입니다. <b>빠져나가지 않고</b> 카드 한도만 잡힙니다.</div>`)}
    </div>
    ${U.banner('info', '💳', '카드 한도에 <b>총 440,000원</b>의 여유가 있어야 결제됩니다. 보증금이 한도를 잡기 때문이에요.', { cls: 'mt6' })}`)}

    ${U.card('언제 무엇이 일어나나요', U.timeline([
      { k: 'on', t: '오늘 (8/10) — 대여료 240,000원 결제 · 보증금 200,000원 한도 보류', d: '카드 명세서에는 240,000원만 찍힙니다.' },
      { k: '', t: '8/15 — 장비 수령', d: '매장에서 받으시고 함께 사진을 남깁니다.' },
      { k: '', t: '8/17 — 반납', d: '18시까지 돌려주세요.' },
      { k: '', t: '8/18~19 — 점검', d: '구성품과 상태를 확인합니다. 1~2일 걸려요.' },
      { k: '', t: '8/20쯤 — 보증금 해제', d: '문제가 없으면 200,000원 한도가 그대로 풀립니다.' },
    ]), { cls: 'mt6' })}

    ${U.card('보증금을 어떻게 잡을까요', `
      <div class="stack mb6">
        ${U.check('<b>카드 한도 보류</b> <span class="badge b-solid">권합니다</span>', { on: true, sub: '실제로 빠져나가지 않습니다. 반납 확인 후 1~3영업일 안에 풀립니다.' })}
        ${U.check('<b>실제 결제 후 환불</b>', { sub: '200,000원이 결제되고 반납 후 돌려드립니다. 카드사에 따라 3~5영업일 걸려요.' })}
      </div>
      ${U.banner('warn', 'ℹ', '<b>계좌이체는 한도 보류가 안 됩니다.</b> 계좌이체를 고르시면 보증금이 실제로 결제됩니다.')}`, { cls: 'mt6' })}

    ${U.card('무엇으로 결제할까요', `
      ${U.tabBox([{ label: '카드', pane: 'a' }, { label: '간편결제', pane: 'b' }, { label: '계좌이체', pane: 'c' }],
        `${U.pane('a', `<div class="f2">${U.field('카드 번호', U.input({ ph: '0000-0000-0000-0000' }), { req: true })}
            ${U.field('유효기간', U.input({ ph: 'MM/YY' }), { req: true })}</div>
          ${U.field('할부', U.select(['일시불', '2개월', '3개월', '6개월'], 0), { hint: '보증금은 할부가 안 됩니다.' })}`, true)}
         ${U.pane('b', `<div class="chips">${['카카오페이', '네이버페이', '토스페이'].map((t, i) => U.chip(t, i === 0)).join('')}</div>
          <p class="t-sub mt4">간편결제도 한도 보류가 됩니다.</p>`)}
         ${U.pane('c', `${U.field('입금자명', U.input({ ph: '홍길동' }), { req: true })}
          ${U.banner('warn', '⚠', '계좌이체는 <b>보증금도 실제로 입금</b>하셔야 합니다. 반납 후 계좌로 돌려드려요.', { cls: 'mt4' })}`)}`,
        0, { pill: true })}`, { cls: 'mt6' })}

    ${U.card('보증금이 없는 분도 있어요', `
      <p>3회 이상 빌리시고 <b>연체·파손이 없으면</b> 보증금을 받지 않습니다.
        지금은 <b>2회째</b>라 한 번만 더 이용하시면 다음부터 면제됩니다.</p>
      <div class="mt4">${U.progress(66)}</div>
      <p class="t-sub mt2">3회 중 2회 완료</p>`, { cls: 'mt6' })}

    ${U.card('영수증', `<div class="f2">
      ${U.field('종류', U.select(['필요 없음', '현금영수증(소득공제)', '현금영수증(지출증빙)', '세금계산서'], 1))}
      ${U.field('번호', U.input({ ph: '010-0000-0000' }))}
    </div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('마지막 확인', `
      ${U.sumRows([
        ['대여료', '<span class="num">240,000원</span>'],
        ['결제 수단', '신한카드 · 일시불'],
      ], ['지금 결제', '<span class="num">240,000원</span>'])}
      ${U.depositRow(200_000, '한도 보류 · 반납 후 1~3영업일 내 해제')}
      <div class="mt6">${U.check('<b>대여료와 보증금이 다른 돈</b>이라는 것을 확인했습니다', { attr: ' data-unlock="doPay"' })}</div>`, {
        ft: `<div class="btns-v">
          ${U.btn('240,000원 결제하고 보증금 200,000원 걸기', { cls: 'btn-pri', w: true, id: 'doPay', off: true, href: 'BK-03' })}
          ${U.btn('결제가 안 될 때', { sm: true, w: true, href: 'BK-04' })}
        </div>`,
      })}
  </div>
</div>`,
});

PAGES['BK-03'] = () => ({
  body: `<div class="wrap-read">
  <div style="text-align:center;padding:var(--sp-sec) 0">
    <div style="font-size:52px">✅</div>
    <h1 class="t-page mt4">빌리실 준비가 됐어요</h1>
    <p class="t-sub mt3">대여번호 <b class="num">R-20260810-0031</b></p>
  </div>

  ${U.card('', `<div class="rowcard" style="border:none;box-shadow:none;padding:0">
    <div class="thumb">${U.phFix(['장비', 400, 400], 80, { seed: G.id })}</div>
    <div class="bd"><div class="t-card">${G.nm} × 2개</div>
      <div class="t-sub mt1">8월 15일 (토) ~ 17일 (월) · 2박 3일</div>
      <div class="mt2">${U.stBadge('예약확정')}</div></div>
  </div>`)}

  ${U.banner('warn', '📅', '<b>8월 17일 (월) 18시까지</b> 돌려주세요. 이 날짜만 기억하시면 됩니다.', {
    cls: 'mt6', right: U.btn('내 달력에 넣기', { sm: true, attr: ' data-toast="휴대폰 일정에 넣었어요. 하루 전과 3시간 전에 알려드릴게요" data-toast-kind="ok"' }),
  })}

  ${U.card('받으러 오실 때', `
    <div class="g2">
      <div>${U.kv([
        ['날짜', '<b>8월 15일 (토)</b>'],
        ['시각', '<b>10:00 ~ 11:00</b>'],
        ['어디로', SITE.addr],
        ['전화', `<span class="num">${SITE.tel}</span>`],
      ], { cls: 'left' })}
      <p class="t-sub mt4">📌 <b>주차는 건물 뒤편</b>에 두 자리 있습니다. 차 있으시면 말씀해 주세요.</p></div>
      <div style="text-align:center">
        ${U.ph(['수령 QR 코드', 400, 400], { seed: 'qr' })}
        <p class="t-sub mt2">매장에서 이 코드를 보여주세요</p>
        ${U.btn('크게 보기', { sm: true, attr: ' data-modal="m-qr"' })}
      </div>
    </div>`, { cls: 'mt6' })}

  ${U.card('가져오실 것', `<ul class="stack">
    <li>· <b>휴대폰</b> — 수령 QR 코드를 보여주셔야 해요</li>
    <li>· <b>장비를 담을 것</b> — 텐트 두 동이라 트렁크가 필요합니다</li>
    <li>· 신분증 — 이번 대여는 <b>필요 없습니다</b></li>
  </ul>`, { cls: 'mt6' })}

  ${U.card('결제하신 내역', `
    ${U.sumRows([['대여료', '<span class="num">240,000원</span> <span class="badge b-ok">결제 완료</span>']])}
    ${U.depositRow(200_000, '신한카드에 한도 보류 중 · 반납 확인 후 풀립니다')}
    <div class="btns mt6">${U.btn('영수증 받기', { sm: true, attr: ' data-toast="이메일로 보냈어요" data-toast-kind="ok"' })}${U.btn('계약서 받기', { sm: true, href: 'BK-05' })}</div>`, { cls: 'mt6' })}

  ${U.card('알림 받으실래요', `<div class="row-b">
    <div><div class="strong">카카오톡으로 알려드릴게요</div>
      <div class="t-sub mt1">수령 하루 전 · 반납 하루 전 · 반납 3시간 전</div></div>
    ${U.toggle(true, '카톡 알림을 켰어요')}
  </div>`, { cls: 'mt6' })}

  <div class="btns mt8">
    ${U.btn('내 대여 보기', { cls: 'btn-pri', href: 'MY-01' })}
    ${U.btn('수령 확인 화면', { href: 'RT-01' })}
    ${U.btn('홈으로', { href: 'HO-01' })}
  </div>
</div>

${U.modal('m-qr', '수령 QR 코드', `<div style="text-align:center">${U.ph(['수령 QR 코드', 600, 600], { seed: 'qr' })}
  <p class="t-sub mt4">대여번호 <b class="num">R-20260810-0031</b></p></div>`,
  U.btn('닫기', { cls: 'btn-pri', attr: ' data-dismiss' }))}`,
});

PAGES['BK-04'] = () => ({
  body: `<div class="wrap-read">
  ${U.pageHd('결제하지 못했어요', '카드 한도가 모자랍니다.')}

  ${U.banner('dan', '✕', '신한카드 승인이 거절됐습니다 — <b>한도 초과</b>')}

  ${U.card('렌탈은 한도가 더 필요합니다', `
    <p>보증금이 <b>실제로 빠져나가지는 않지만 한도는 잡습니다.</b> 그래서 대여료보다 큰 여유가 필요해요.</p>
    <div class="mt6">${U.table(['무엇', { t: '얼마', w: '120px', cls: 'r nowrap' }], [
      ['대여료 (실제 결제)', { t: '<span class="num">240,000원</span>', cls: 'r nowrap' }],
      ['보증금 (한도만 잡힘)', { t: '<span class="num">200,000원</span>', cls: 'r nowrap' }],
    ], { foot: ['<b>필요한 카드 여유</b>', { t: '<b class="num">440,000원</b>', cls: 'r nowrap' }] })}</div>
    <p class="t-sub mt4">이것이 렌탈 결제가 실패하는 가장 흔한 까닭입니다.</p>`, { cls: 'mt6' })}

  ${U.banner('warn', '⏳', '고르신 장비는 <b class="num" data-count="1140">19:00</b> 동안 잡아 두었어요. 그 안에 다시 시도해 주세요.', { cls: 'mt6' })}

  ${U.card('이렇게 해 보세요', `<div class="stack" style="gap:var(--sp-block)">
    <div class="row-b"><div><div class="strong">① 보증금을 실제 결제로 바꾸기</div>
      <div class="t-sub mt1">한도를 안 잡고 결제합니다. 반납 후 돌려드려요.</div></div>
      ${U.btn('바꾸기', { cls: 'btn-pri', href: 'BK-02' })}</div>
    <div class="row-b"><div><div class="strong">② 다른 카드로 결제하기</div>
      <div class="t-sub mt1">한도에 44만원 여유가 있는 카드로요.</div></div>
      ${U.btn('다른 카드', { href: 'BK-02' })}</div>
    <div class="row-b"><div><div class="strong">③ 수량을 줄이기</div>
      <div class="t-sub mt1">1개만 빌리면 대여료 120,000 + 보증금 100,000 = 22만원이면 됩니다.</div></div>
      ${U.btn('1개로', { href: 'BK-01' })}</div>
  </div>`, { cls: 'mt6' })}

  ${U.card('다른 까닭일 수도 있어요', `${U.table(['왜 안 됐나', '어떻게 하면 되나'], [
    ['한도 초과', '위 세 가지 중 하나를 해 보세요'],
    ['해외 결제 차단', '카드사 앱에서 국내 온라인 결제를 켜 주세요'],
    ['카드사 승인 거절', '카드사에 직접 물어보셔야 합니다'],
    ['잔액 부족 (체크카드)', '입금하시거나 다른 카드로 바꿔 주세요'],
  ])}`, { cls: 'mt6' })}

  <div class="btns mt8">${U.btn('다시 결제하기', { cls: 'btn-pri', href: 'BK-02' })}${U.btn('전화로 문의', { attr: ` data-toast="${SITE.tel} 로 전화 주세요"` })}${U.btn('1:1 문의', { href: 'CS-02' })}</div>
</div>`,
});

PAGES['BK-05'] = () => ({
  body: `${U.pageHd('대여 계약서', '받으시기 전에 한 번만 확인해 주세요.')}

<div class="split-r">
  <div>
    ${U.card('세 가지만 기억하세요', `<div class="g3">
      ${U.box('<div class="t-sec dan">30%</div><div class="strong mt2">하루 늦으면</div><p class="t-sub mt2">1일 대여료의 30%가 붙습니다. 13,890원이에요.</p>')}
      ${U.box('<div class="t-sec warn">부품별</div><div class="strong mt2">망가뜨리면</div><p class="t-sub mt2">폴대 15,000원처럼 기준액이 있어요. 미리 말씀하시면 조정됩니다.</p>')}
      ${U.box('<div class="t-sec pri">3영업일</div><div class="strong mt2">보증금은</div><p class="t-sub mt2">반납 확인 후 3영업일 안에 돌려드립니다.</p>')}
    </div>`)}

    ${U.card('계약 내용', U.kv([
      ['빌리는 것', `${G.nm} × 2개`],
      ['기간', '2026-08-15 ~ 2026-08-17 (2박 3일)'],
      ['대여료', '<span class="num">240,000원</span>'],
      ['보증금', '<span class="num">200,000원</span> (한도 보류)'],
      ['받는 방법', '매장 방문'],
      ['반납 기한', '<b>2026-08-17 18:00</b>'],
    ], { cls: 'left' }), { cls: 'mt6' })}

    ${U.card('조항', U.accordion([
      { q: '제1조 대여 기간과 반납', a: '빌리는 날 매장 운영시간 안에 받고, 반납일 18시까지 돌려주셔야 합니다. 택배 회수는 기사가 가져간 날이 반납일입니다.' },
      { q: '제2조 보증금', a: '보증금은 장비 상태를 확인할 때까지 잠시 걸어두는 돈입니다. 반납 확인 후 3영업일 안에 돌려드립니다. 정산할 것이 있으면 여기서 먼저 빼고 남는 금액을 돌려드립니다.' },
      { q: '제3조 파손·분실 배상', a: `부품별 기준액이 정해져 있습니다. ${배상표.filter(([, v]) => v > 0).map(([n, v]) => `${n} ${U.won(v)}`).join(' · ')}. 분실은 장비 정가의 100%입니다. 수리로 될 것 같으면 수리비만 받습니다. 미리 신고하시면 배상액이 조정될 수 있습니다.` },
      { q: '제4조 연체료', a: '1일 늦으면 1일 대여료의 30%, 2일이면 60%, 3일 이상이면 100% 이상이 붙습니다. 연락 없이 7일이 지나면 분실로 처리되고 장비 정가가 청구됩니다.' },
      { q: '제5조 반납 상태', a: '흙과 먼지를 털고 말려서 돌려주세요. 젖은 채로 접어 넣으면 곰팡이가 생겨 배상 대상입니다. 세척이 필요할 정도면 20,000원, 건조가 필요하면 20,000원이 붙습니다.' },
      { q: '제6조 개인정보', a: '이름·연락처·주소를 대여 관리 목적으로만 씁니다. 대여가 끝나고 5년간 보관한 뒤 파기합니다(전자상거래법).' },
    ], 0), { cls: 'mt6' })}

    ${U.card('서명', `
      <p class="t-sub mb4">아래 칸에 손가락이나 마우스로 서명해 주세요.</p>
      ${U.ph(['서명하는 칸', 1200, 300], { seed: 'sign' })}
      <div class="btns mt4">${U.btn('다시 그리기', { sm: true, attr: ' data-toast="서명을 지웠어요"' })}</div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('동의', `
      ${U.check('제1조 대여 기간과 반납', { attr: ' data-agree' })}
      ${U.check('제2조 보증금', { attr: ' data-agree' })}
      ${U.check('제3조 파손·분실 배상', { attr: ' data-agree' })}
      ${U.check('제4조 연체료', { attr: ' data-agree' })}
      <div class="mt4">${U.check('<b>모두 동의합니다</b>', { attr: ' data-unlock="doSign"' })}</div>
      <div class="mt4">${U.check('계약서 사본을 이메일로 받을게요', { on: true })}</div>`, {
        ft: `<div class="btns-v">
          ${U.btn('동의하고 서명 완료', { cls: 'btn-pri', w: true, id: 'doSign', off: true, href: 'BK-03' })}
          ${U.btn('약관 전문 보기', { w: true, href: 'CS-03' })}
        </div>`,
      })}
    ${U.banner('info', 'ℹ', '<b>겁드리려는 문서가 아닙니다.</b> 나중에 「몰랐다」가 되지 않도록 미리 알려드리는 것이에요.')}
  </div>
</div>`,
});

PAGES['BK-06'] = () => ({
  body: `${U.pageHd('더 쓰고 싶어요', '반납일 전이면 연장할 수 있습니다.')}

<div class="split-r">
  <div>
    ${U.card('지금 상태', `${U.kv([
      ['빌린 것', `${G.nm} × 2개`],
      ['반납 예정', '<b>8월 17일 (월) 18:00</b>'],
      ['남은 시간', '<b class="num pri" data-count="109320">30:22:00</b>'],
    ], { cls: 'left' })}`)}

    ${U.card('얼마나 더 쓰실래요', `
      <div class="chips mb6">${['+1일', '+2일', '+3일', '직접 고르기'].map((t, i) => U.chip(t, i === 1)).join('')}</div>
      ${U.banner('warn', '⚠', '<b>8월 19일에 다른 예약이 있어요.</b> 그래서 <b>8월 18일까지만</b> 연장됩니다.')}
      <p class="t-sub mt4">더 오래 쓰셔야 하면 전화 주세요. 다른 장비로 바꿔 드릴 수 있는지 알아보겠습니다.</p>`, { cls: 'mt6' })}

    ${U.card('연장하면 얼마', `${U.sumRows([
      ['하루 더 (46,300 × 2개)', '<span class="num">92,600원</span>'],
      ['3일 → 4일, 할인 그대로 10%', '<span class="num">-9,260원</span>', 'minus'],
    ], ['추가로 낼 돈', '<span class="num">83,340원</span>'])}
    ${U.banner('info', '💚', '<b>보증금은 그대로 유지됩니다.</b> 추가로 걸지 않아요.', { cls: 'mt4' })}`, { cls: 'mt6' })}

    ${U.card('연장이 연체보다 훨씬 쌉니다', `${U.table(['', { t: '하루 더 쓰면', w: '132px', cls: 'r nowrap' }], [
      ['<b class="pri">지금 연장하면</b>', { t: '<b class="num pri">83,340원</b>', cls: 'r nowrap' }],
      ['<b class="dan">그냥 늦으면 (연체)</b>', { t: '<b class="num dan">27,780원 + 다음 손님 불편</b>', cls: 'r nowrap' }],
    ])}
    <p class="t-sub mt4">연체료 자체는 작지만, 다음 예약이 밀리면 <b>그분 예약이 취소</b>됩니다.
      그때는 위약금이 따로 붙습니다. 연장해 주시는 쪽이 서로 편해요.</p>`, { cls: 'mt6' })}

    ${U.banner('dan', '✕', '<b>반납일이 지나면 연장이 안 됩니다.</b> 그때는 연체 정산으로 넘어가요.', {
      cls: 'mt6', right: U.btn('연체 화면 보기', { sm: true, href: 'RT-05' }),
    })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('바뀌는 것', `${U.table(['', { t: '지금', w: '92px', cls: 'r' }, { t: '연장 후', w: '92px', cls: 'r' }], [
      ['반납일', { t: '8/17', cls: 'r' }, { t: '<b class="pri">8/18</b>', cls: 'r' }],
      ['기간', { t: '2박 3일', cls: 'r' }, { t: '3박 4일', cls: 'r' }],
      ['보증금', { t: '200,000', cls: 'r' }, { t: '200,000', cls: 'r' }],
    ])}`, {
      ft: `<div class="btns-v">
        ${U.btn('83,340원 내고 연장하기', { cls: 'btn-pri', w: true, href: 'BK-02' })}
        ${U.btn('그냥 둘게요', { w: true, href: 'MY-02' })}
      </div>`,
    })}
  </div>
</div>`,
});
