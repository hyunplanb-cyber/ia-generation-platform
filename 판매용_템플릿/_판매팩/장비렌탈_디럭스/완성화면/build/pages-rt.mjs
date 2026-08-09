/* RT 수령·반납 (6) */
import * as U from './ui.mjs';
import { GEAR, SITE, 구성품, 배상표, 연체료 } from './data.mjs';

export const PAGES = {};
const G = GEAR[0];

/* 받을 때와 돌려줄 때 같은 목록으로 확인한다 — 그래야 서로 견줄 수 있다 */
const 구성품체크 = (o = {}) => U.table(
  [{ t: '', w: '40px', cls: 'c' }, '구성품', { t: '개수', w: '68px', cls: 'c' }, { t: '없으면', w: '96px', cls: 'r nowrap' }, { t: '사진', w: '76px' }],
  구성품.map(([nm, n], i) => ({
    cls: o.빠짐 === i ? 'bad' : '',
    cells: [
      { t: `<input type="checkbox" ${o.빠짐 === i ? '' : 'checked'} aria-label="${nm} 확인">`, cls: 'c' },
      o.빠짐 === i ? `<b class="dan">${nm}</b> <span class="badge b-dan">안 챙기셨어요</span>` : nm,
      { t: `<span class="num">${n}</span>`, cls: 'c' },
      { t: `<span class="num">${U.won(배상표[i] ? 배상표[i][1] : 12_000)}</span>`, cls: 'r nowrap' },
      U.btn('📷', { sm: true, attr: ` data-toast="${nm} 사진을 찍었어요"` }),
    ],
  })),
);

PAGES['RT-01'] = () => ({
  body: `${U.pageHd('장비 받기', `${G.nm} × 2개 · 8월 15일 (토)`)}

<div class="split-r">
  <div>
    ${U.card('받으신 것이 맞는지 확인해 주세요', `
      ${구성품체크()}
      <p class="t-sub mt4">전부 확인하셔야 아래 버튼이 열립니다. 이 자리에서 세어 보시는 게 나중에 편해요.</p>`)}

    ${U.card('지금 상태를 사진으로 남겨요', `
      ${U.banner('info', '📷', '<b>받을 때 사진이 반납할 때 나를 지켜 줍니다.</b> 돌려줄 때 이 사진과 나란히 놓고 견줍니다.')}
      <div class="g4 mt6">
        ${['정면', '옆면', '바닥', '보관가방'].map((t) => `<div>${U.ph([t, 800, 600], { seed: t })}
          <div class="btns mt2">${U.btn('📷 찍기', { sm: true, w: true, attr: ` data-toast="${t} 사진을 찍었어요"` })}</div></div>`).join('')}
      </div>`, { cls: 'mt6' })}

    ${U.card('이미 흠집이 있나요', `
      <p>받으실 때 <b>이미 있던 흠집</b>은 지금 알려 주세요. 신고하신 것은 <b>반납할 때 배상하지 않습니다.</b></p>
      <div class="mt4">${U.check('흠집이 있어요', { attr: ' data-toast="어디가 어떤지 아래에 적어 주세요"' })}</div>
      ${U.field('어디가 어떤가요', U.textarea({ ph: '예) 폴대 하나가 살짝 휘어 있어요. 오른쪽 지퍼가 뻑뻑합니다.' }))}
      <div class="btns">${U.btn('사진 붙이기', { sm: true, attr: ' data-toast="사진을 붙였어요"' })}${U.btn('흠집 신고하기', { sm: true, cls: 'btn-pri', attr: ' data-toast="신고했어요. 반납할 때 이 부분은 배상하지 않으셔도 됩니다" data-toast-kind="ok"' })}</div>`, { cls: 'mt6' })}

    ${U.card('쓰시는 법', `<p class="t-sub">폴대를 슬리브에 끼우고 양 끝을 그로밋에 꽂으면 섭니다. 혼자서 20분쯤 걸려요.</p>
      <div class="btns mt4">${U.btn('설치 영상 보기', { attr: ' data-toast="영상 링크를 문자로 보냈어요" data-toast-kind="ok"' })}${U.btn('주의사항 다시 보기', { href: 'PD-02' })}</div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('매장에 보여주세요', `<div style="text-align:center">
      ${U.ph(['수령 QR 코드', 400, 400], { seed: 'qr' })}
      <p class="t-sub mt3">대여번호 <b class="num">R-20260810-0031</b></p></div>`)}

    ${U.card('돌려주실 날', `<div style="text-align:center">
      <div class="t-page pri">8월 17일</div>
      <div class="strong">(월) 18시까지</div>
      <p class="t-sub mt3">${SITE.addr}</p></div>`, {
        ft: U.btn('내 달력에 넣기', { w: true, attr: ' data-toast="일정에 넣었어요" data-toast-kind="ok"' }),
      })}

    ${U.card('', `${U.check('<b>구성품과 상태를 모두 확인했습니다</b>', { attr: ' data-unlock="doGet"' })}
      <div class="mt4">${U.btn('받았습니다', { cls: 'btn-pri', lg: true, w: true, id: 'doGet', off: true, href: 'RT-02' })}</div>
      <p class="t-sub mt3">누르시면 대여가 시작되고 보증금 규정이 적용됩니다.</p>`)}
  </div>
</div>`,
});

PAGES['RT-02'] = () => ({
  body: `${U.pageHd('잘 쓰고 계신가요', `${G.nm} × 2개 · 8월 15일 ~ 17일`)}

${U.card('', `<div style="text-align:center;padding:var(--sp-block) 0">
  <div class="t-sub">돌려주실 때까지</div>
  <div class="t-page pri num" data-count="109320" style="font-size:48px">1일 6:22:00</div>
  <div class="t-sub mt3">8월 17일 (월) 18:00까지</div>
  <div class="btns mt6" style="justify-content:center">
    ${U.btn('더 쓰고 싶어요 — 연장하기', { cls: 'btn-pri', href: 'BK-06' })}
    ${U.btn('돌려주는 법', { href: 'RT-03' })}
  </div>
</div>`)}

${U.banner('info', '💡', '<b>늦을 것 같으면 지금 연장하세요.</b> 연장이 연체보다 쌉니다. 반납일이 지나면 연장이 안 돼요.', { cls: 'mt6' })}

<div class="split-r mt8">
  <div>
    ${U.card('돌려주기 전에 이것만 해 주세요', `
      <div class="stack">
        ${U.check('<b>흙과 먼지를 털어 주세요</b>', { sub: '털어만 주시면 됩니다. 물로 씻지 않으셔도 돼요. 세척이 필요할 정도면 20,000원이 붙습니다.' })}
        ${U.check('<b>완전히 말려 주세요</b>', { sub: '젖은 채로 접어 넣으면 곰팡이가 생겨 배상 대상이 됩니다. 못 말리셨으면 그대로 가져다 주세요 — 접지만 마세요.' })}
        ${U.check('<b>구성품을 다 챙겨 주세요</b>', { sub: '폴대 2, 팩 12, 스트링 4, 보관가방 1. 하나라도 빠지면 정산됩니다.' })}
        ${U.check('<b>보관가방에 넣어 주세요</b>', { sub: '가방 없이 오시면 12,000원이 붙습니다.' })}
      </div>`)}

    ${U.card('쓰시다 문제가 생겼나요', `<div class="g2">
      ${U.box(`<div class="strong">작동이 안 돼요</div>
        <p class="t-sub mt2">바로 알려 주세요. 교환이 가능한지 알아보고, 안 되면 그날 대여료를 빼 드립니다.</p>
        <div class="mt3">${U.btn('고장 신고', { sm: true, w: true, attr: ' data-toast="접수했어요. 곧 전화드릴게요" data-toast-kind="ok"' })}</div>`)}
      ${U.box(`<div class="strong">망가뜨렸어요</div>
        <p class="t-sub mt2">숨기지 마시고 미리 알려 주세요. <b>미리 신고하시면 배상액이 조정될 수 있습니다.</b></p>
        <div class="mt3">${U.btn('파손 미리 알리기', { sm: true, w: true, cls: 'btn-pri', href: 'RT-06' })}</div>`)}
    </div>`, { cls: 'mt6' })}

    ${U.card('쓰시는 법 다시 보기', `<div class="btns">
      ${U.btn('설치 영상', { attr: ' data-toast="영상을 엽니다"' })}
      ${U.btn('주의사항', { href: 'PD-02' })}
      ${U.btn('전화하기', { attr: ` data-toast="${SITE.tel}"` })}
    </div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('빌린 것', `<div class="rowcard" style="border:none;box-shadow:none;padding:0">
      <div class="thumb">${U.phFix(['장비', 400, 400], 72, { seed: G.id })}</div>
      <div class="bd"><div class="strong">${G.nm}</div><div class="t-sub mt1">2개 · ${U.stBadge('이용중')}</div></div>
    </div>
    <div class="mt4">${U.kv([['대여번호', '<span class="num">R-20260810-0031</span>'], ['보증금', '<span class="num">200,000원</span> 보류 중']])}</div>`, {
      ft: U.btn('대여 상세 보기', { w: true, href: 'MY-02' }),
    })}

    ${U.card('알림 설정', `<div class="stack">
      <div class="row-b"><span>반납 하루 전</span>${U.toggle(true, '하루 전 알림을 켰어요')}</div>
      <div class="row-b"><span>반납 3시간 전</span>${U.toggle(true, '3시간 전 알림을 켰어요')}</div>
    </div>
    <p class="t-sub mt3">반납 알림은 <b>끄지 않으시길</b> 권합니다.</p>`)}
  </div>
</div>`,
});

PAGES['RT-03'] = () => ({
  body: `${U.pageHd('어떻게 돌려드릴까요', '8월 17일 (월) 18시까지 · 남은 시간 <b class="num pri" data-count="109320">1일 6:22:00</b>')}

<div class="wrap-read">
  ${U.tabBox([{ label: '매장에 가져다 주기', pane: 'a' }, { label: '택배로 보내기', pane: 'b' }],
    `${U.pane('a', `
      ${U.card('', `${U.kv([
        ['어디로', SITE.addr],
        ['운영시간', '평일 10:00~19:00 · 토 10:00~17:00'],
        ['휴무', '일요일 · 공휴일'],
        ['전화', `<span class="num">${SITE.tel}</span>`],
      ], { cls: 'left' })}
      <div class="mt6">${U.ph(['매장 위치 지도', 1200, 500], { seed: 'map' })}</div>
      ${U.banner('warn', '⚠', '<b>일요일은 쉽니다.</b> 일요일이 반납일이면 토요일까지 오시거나 택배로 보내 주세요.', { cls: 'mt6' })}
      <p class="t-sub mt4">주차는 건물 뒤편에 두 자리 있습니다. 마감 시각 이후에 오시면 다음 영업일 접수로 잡힙니다.</p>`)}`, true)}
     ${U.pane('b', `
      ${U.card('', `
        ${U.banner('info', '📦', '<b>택배는 기사님이 가져간 날이 반납일입니다.</b> 예약만 하고 안 보내시면 연체가 됩니다.')}
        <div class="mt6">${U.field('회수 주소', U.input({ v: '서울 마포구 성미산로 000' }))}</div>
        ${U.field('회수 희망일', U.select(['8월 17일 (월) 오전', '8월 17일 (월) 오후', '8월 18일 (화) 오전'], 0))}
        <div class="btns mt4">${U.btn('회수 신청하기', { cls: 'btn-pri', attr: ' data-toast="8월 17일 오전으로 회수를 예약했어요" data-toast-kind="ok"' })}</div>
        <h4 class="t-card mt8 mb3">이렇게 싸 주세요</h4>
        <ul class="stack t-sub">
          <li>· 보관가방에 넣고 <b>받으셨던 상자</b>에 담아 주세요</li>
          <li>· 상자가 없으면 비슷한 크기 상자에 완충재를 넣어 주세요</li>
          <li>· 송장은 기사님이 붙여 드립니다</li>
        </ul>`)}`)}`,
    0, { pill: true })}

  ${U.card('이런 상태로 오면 돈이 더 붙어요', `<div class="g2">
    ${U.box(`<div class="strong dan mb2">✕ 이러면 추가 비용</div>
      ${U.ph(['젖은 채 접힌 텐트', 800, 500], { seed: 'wet' })}
      <p class="t-sub mt3"><b>젖은 채로 접어 넣음</b> — 건조비 20,000원<br>
        <b>흙이 그대로</b> — 세척비 20,000원</p>`)}
    ${U.box(`<div class="strong pri mb2">✓ 이 정도면 충분해요</div>
      ${U.ph(['털어서 가방에 넣은 텐트', 800, 500], { seed: 'dry' })}
      <p class="t-sub mt3">흙을 털고 말려서 보관가방에 넣어 주시면 됩니다.<br>
        완벽하게 깨끗할 필요는 없어요.</p>`)}
  </div>`, { cls: 'mt8' })}

  <div class="g2 mt8">
    ${U.card('늦으면 얼마', U.table(['얼마나 늦었나', { t: '얼마', w: '120px', cls: 'r nowrap' }], [
      ['1일', { t: `<span class="num">${U.won(연체료(G.day, 1) * 2)}</span>`, cls: 'r nowrap' }],
      ['2일', { t: `<span class="num">${U.won(연체료(G.day, 2) * 2)}</span>`, cls: 'r nowrap' }],
      ['3일 이상', { t: `<span class="num">${U.won(G.day * 2)}~</span>`, cls: 'r nowrap' }],
      ['7일 (연락 없음)', { t: '<b class="dan">분실 처리</b>', cls: 'r nowrap' }],
    ]))}
    ${U.card('빠지면 얼마', U.table(['무엇', { t: '얼마', w: '120px', cls: 'r nowrap' }],
      배상표.filter(([, v]) => v > 0).map(([n, v]) => [n, { t: `<span class="num">${U.won(v)}</span>`, cls: 'r nowrap' }])))}
  </div>

  <div class="btns mt8">
    ${U.btn('반납 접수하기', { cls: 'btn-pri', lg: true, href: 'RT-04' })}
    ${U.btn('연장할래요', { href: 'BK-06' })}
  </div>
</div>`,
});

PAGES['RT-04'] = () => ({
  body: `${U.pageHd('돌려드립니다', `${G.nm} × 2개 · 접수 8월 18일 09:14`)}

${U.banner('warn', '⏰', '반납 기한(8/17 18:00)이 <b>1일 지났습니다.</b> 연체료가 정산됩니다.', {
  right: U.btn('연체 안내 보기', { sm: true, href: 'RT-05' }),
})}

<div class="split-r mt6">
  <div>
    ${U.card('구성품이 다 있나요', `
      ${구성품체크({ 빠짐: 1 })}
      ${U.banner('dan', '✕', `<b>폴대 1개</b>가 안 보여요. 다시 한 번 찾아봐 주시겠어요? 없으면 <b>${U.won(15_000)}</b>이 정산됩니다.`, {
        cls: 'mt4', right: U.btn('찾았어요', { sm: true, attr: ' data-toast="다시 확인해 주세요"' }),
      })}`)}

    ${U.card('받으실 때와 견줘 보세요', `
      <p class="t-sub mb6">왼쪽이 받으실 때, 오른쪽이 지금입니다. 같은 자리를 찍어 주시면 서로 확인하기 쉬워요.</p>
      ${['정면', '옆면', '바닥', '보관가방'].map((t) => `<div class="g2 mb6">
        <div><div class="t-sub mb2">받으실 때 · ${t}</div>${U.ph([t, 800, 600], { seed: t })}</div>
        <div><div class="t-sub mb2">지금 · ${t}</div>${U.ph([t + ' 지금', 800, 600], { seed: t + 'now' })}
          <div class="btns mt2">${U.btn('📷 찍기', { sm: true, w: true, attr: ` data-toast="${t} 사진을 찍었어요" ` })}</div></div>
      </div>`).join('')}`, { cls: 'mt6' })}

    ${U.card('망가진 데가 있나요', `
      ${U.check('<b>있어요</b> — 미리 알려주시면 점검이 빨라지고 배상액이 조정될 수 있어요', { on: true })}
      ${U.field('어디가 어떤가요', U.textarea({ v: '설치하다가 폴대 하나가 부러졌습니다. 바람이 세게 불 때 무리해서 세웠어요.' }))}
      <div class="btns">${U.btn('사진 붙이기', { sm: true, attr: ' data-toast="사진을 붙였어요"' })}${U.btn('자세히 신고하기', { sm: true, href: 'RT-06' })}</div>`, { cls: 'mt6' })}

    ${U.card('상태를 스스로 확인해 주세요', `<div class="stack">
      ${U.check('흙과 먼지를 털었습니다', { on: true, none: true })}
      ${U.check('말려서 넣었습니다', { none: true, sub: '못 말리셨으면 체크하지 마세요. 접지 말고 그대로 가져다 주시면 됩니다.' })}
      ${U.check('보관가방에 넣었습니다', { on: true, none: true })}
    </div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('이대로 접수하면', `
      ${U.sumRows([
        ['연체료 1일', `<span class="num">${U.won(연체료(G.day, 1) * 2)}</span>`],
        ['폴대 1개 (미리 신고)', '<span class="num">15,000원</span>'],
        ['세척비', '<span class="num">0원</span>'],
      ], ['정산 예정', `<span class="num">${U.won(연체료(G.day, 1) * 2 + 15_000)}</span>`])}
      <div class="mt6">${U.barSplit(연체료(G.day, 1) * 2 + 15_000, 200_000 - (연체료(G.day, 1) * 2 + 15_000))}</div>
      <p class="t-sub mt3">보증금 200,000원에서 빼고 남는 돈을 돌려드립니다.</p>
      ${U.banner('info', 'ℹ', '<b>점검 후에 확정됩니다.</b> 지금 보시는 금액은 예상이에요. 수리로 될 것 같으면 더 적게 나올 수 있습니다.', { cls: 'mt4' })}`, {
        ft: `<div class="btns-v">
          ${U.btn('반납 접수하기', { cls: 'btn-pri', lg: true, w: true, href: 'ST-01' })}
          ${U.btn('반납 안내로', { w: true, href: 'RT-03' })}
        </div>
        <p class="t-sub mt3" style="text-align:center">점검에 1~2일 걸립니다.</p>`,
      })}
  </div>
</div>`,
});

PAGES['RT-05'] = () => ({
  body: `${U.pageHd('반납이 늦었어요', `${G.nm} × 2개 · 기한 8월 17일 18:00`)}

<div class="wrap-read">
  ${U.banner('dan', '⏰', '<b>1일 15시간 14분</b> 늦으셨습니다. 지금 돌려주시면 <b>1일치</b>만 붙습니다.')}

  ${U.card('', `<div style="text-align:center;padding:var(--sp-block) 0">
    <div class="t-sub">지금까지 쌓인 연체료</div>
    <div class="t-page dan num" style="font-size:48px">${U.num(연체료(G.day, 1) * 2)}원</div>
    <div class="t-sub mt3">실시간으로 늘어납니다</div>
    <div class="btns mt6" style="justify-content:center">${U.btn('지금 반납 접수하기', { cls: 'btn-pri', lg: true, href: 'RT-04' })}</div>
  </div>`, { cls: 'mt6' })}

  ${U.card('어떻게 계산되나요 — 숨기지 않고 보여드립니다', `
    ${U.table(['얼마나 늦었나', '계산', { t: '얼마', w: '116px', cls: 'r nowrap' }], [
      ['<b class="dan">지금 (1일)</b>', '46,300 × 30% × 1일 × 2개', { t: `<b class="num dan">${U.won(연체료(G.day, 1) * 2)}</b>`, cls: 'r nowrap' }],
      ['내일 이 시각 (2일)', '46,300 × 60% × 1일 × 2개', { t: `<span class="num">${U.won(연체료(G.day, 2) * 2)}</span>`, cls: 'r nowrap' }],
      ['모레 (3일)', '1일 대여료 전액 × 2개', { t: `<span class="num">${U.won(G.day * 2)}</span>`, cls: 'r nowrap' }],
    ])}
    <p class="t-sub mt4">하루가 지날 때마다 비율이 올라갑니다. <b>오늘 돌려주시는 것이 가장 쌉니다.</b></p>`, { cls: 'mt6' })}

  ${U.card('보증금에서 먼저 빠집니다', `
    ${U.barSplit(연체료(G.day, 1) * 2, 200_000 - 연체료(G.day, 1) * 2)}
    <p class="t-sub mt4">보증금 200,000원에서 연체료를 빼고 <b>${U.won(200_000 - 연체료(G.day, 1) * 2)}</b>을 돌려드립니다.</p>
    ${U.banner('warn', '⚠', '연체료가 <b>보증금을 넘으면</b> 등록하신 카드로 추가 청구됩니다. 보증금 200,000원은 <b>7일</b>이면 다 없어져요.', { cls: 'mt4' })}`, { cls: 'mt6' })}

  ${U.card('연장으로 바꿀 수 있나요', `
    <p class="dan"><b>안 됩니다.</b> 연장은 반납일 «전»에만 할 수 있어요.</p>
    <p class="t-sub mt3">이미 지난 시간은 연체로 잡힙니다. 다음에는 반납일 전에 연장해 주세요 —
      연장이 훨씬 싸고, 다음 손님도 기다리지 않습니다.</p>`, { cls: 'mt6' })}

  ${U.banner('dan', '🚨', '<b>연락 없이 7일이 지나면 분실로 처리됩니다.</b> 그때는 장비 정가(2개 590,000원)가 청구되고 법적 절차가 시작됩니다. 사정이 있으시면 꼭 연락 주세요.', { cls: 'mt6' })}

  <div class="btns mt8">
    ${U.btn('지금 반납 접수', { cls: 'btn-pri', lg: true, href: 'RT-04' })}
    ${U.btn('사정을 설명할게요', { href: 'CS-02' })}
    ${U.btn('전화하기', { attr: ` data-toast="${SITE.tel}" ` })}
  </div>
</div>`,
});

PAGES['RT-06'] = () => ({
  body: `${U.pageHd('망가진 곳 알리기', '미리 알려주시면 점검이 빨라지고 배상액이 조정될 수 있어요.')}

<div class="split-r">
  <div>
    ${U.banner('info', '🤝', '<b>정직하게 말씀하시는 게 손해가 아닙니다.</b> 숨기시면 점검에서 나오고, 그때는 조정할 여지가 없어집니다.')}

    ${U.card('무슨 일이 있었나요', `<div class="stack">
      ${U.check('<b>망가졌어요</b> — 부러지거나 찢어짐', { on: true, none: true })}
      ${U.check('<b>잃어버렸어요</b> — 부품이나 장비 전체', { none: true })}
      ${U.check('<b>더러워졌어요</b> — 지워지지 않는 얼룩', { none: true })}
      ${U.check('<b>작동이 안 돼요</b> — 지퍼·버클 등', { none: true })}
    </div>`, { cls: 'mt6' })}

    ${U.card('어디가 그런가요', `
      <div class="chips mb4">${['본체 원단', '폴대', '팩', '스트링', '지퍼', '보관가방'].map((t, i) => U.chip(t, i === 1)).join('')}</div>
      ${U.banner('warn', '💰', `<b>폴대 1개</b>의 기준 배상액은 <b>${U.won(15_000)}</b>입니다. 수리로 될 것 같으면 수리비만 받습니다.`)}
      ${U.field('얼마나 심한가요', `<div class="stack">
        ${U.check('가벼움 — 살짝 휘었거나 흠집', { none: true })}
        ${U.check('보통 — 쓸 수는 있지만 티가 남', { none: true })}
        ${U.check('심함 — 부러지거나 못 씀', { on: true, none: true })}
      </div>`)}`, { cls: 'mt6' })}

    ${U.card('사진을 붙여 주세요', `
      <p class="t-sub mb4"><b>최소 2장</b>이 필요해요 — 가까이 한 장, 전체 한 장. 사진이 있으면 판단이 훨씬 빠릅니다.</p>
      <div class="g2">
        <div>${U.ph(['가까이 찍은 사진', 800, 600], { seed: 'near' })}
          <div class="btns mt2">${U.btn('📷 찍기', { sm: true, w: true, attr: ' data-toast="가까이 사진을 찍었어요"' })}</div></div>
        <div>${U.ph(['전체가 나온 사진', 800, 600], { seed: 'far' })}
          <div class="btns mt2">${U.btn('📷 찍기', { sm: true, w: true, attr: ' data-toast="전체 사진을 찍었어요"' })}</div></div>
      </div>`, { cls: 'mt6' })}

    ${U.card('언제 어떻게 그렇게 됐나요', U.textarea({
      v: '8월 16일 저녁에 바람이 세게 불어서 텐트가 흔들렸는데, 그때 무리해서 다시 세우다가 폴대 가운데가 부러졌습니다.',
    }), { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('보험이 있으신가요', `
      ${U.banner('ok', '✓', '<b>파손 면책 보험에 가입돼 있어요.</b> 20만원까지 면책됩니다.')}
      <div class="mt4">${U.table(['', { t: '', w: '108px', cls: 'r nowrap' }], [
        ['기준 배상액', { t: '<span class="num">15,000원</span>', cls: 'r nowrap' }],
        ['보험 면책', { t: '<span class="num pri">-15,000원</span>', cls: 'r nowrap' }],
      ], { foot: ['<b>내실 돈</b>', { t: '<b class="num pri">0원</b>', cls: 'r nowrap' }] })}</div>
      <p class="t-sub mt4">보험에 안 드셨다면 15,000원이 보증금에서 빠집니다.</p>`)}

    ${U.card('면책이 안 되는 것', `<ul class="stack t-sub">
      <li>· 일부러 망가뜨린 경우</li>
      <li>· 잃어버린 경우 (분실)</li>
      <li>· 물에 잠긴 경우</li>
      <li>· 다른 사람에게 다시 빌려준 경우</li>
    </ul>
    <p class="t-sub mt3">이번 건은 <b class="pri">면책 대상입니다.</b></p>`)}

    ${U.card('', `${U.check('<b>사진과 내용을 확인했습니다</b>', { attr: ' data-unlock="doReport"' })}
      <div class="mt4">${U.btn('신고 접수하기', { cls: 'btn-pri', lg: true, w: true, id: 'doReport', off: true, href: 'ST-02' })}</div>
      <div class="mt3">${U.btn('반납 접수로 돌아가기', { w: true, href: 'RT-04' })}</div>`)}
  </div>
</div>`,
});
