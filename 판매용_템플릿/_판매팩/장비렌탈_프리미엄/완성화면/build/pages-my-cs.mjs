/* MY 마이페이지 (4) · CS 고객센터 (3) */
import * as U from './ui.mjs';
import { GEAR, RENTS, SITE, 배상표, 연체료, REVIEWS } from './data.mjs';

export const PAGES = {};
const G = GEAR[0];

/* ============================================================
   MY 마이페이지
   ============================================================ */

PAGES['MY-01'] = () => ({
  body: `${U.pageHd('내 대여', `모두 ${RENTS.length}건`, U.btn('또 빌리기', { cls: 'btn-pri', href: 'PD-01' }))}

${U.banner('dan', '⏰', '<b>반납이 1일 늦었어요.</b> 지금까지 연체료 <b class="num">27,780원</b>. 오늘 돌려주시면 여기서 멈춥니다.', {
  right: U.btn('지금 반납하기', { sm: true, cls: 'btn-pri', href: 'RT-04' }),
})}

<div class="mt6">${U.tabs([
  { label: '전체', cnt: RENTS.length }, { label: '예약확정', cnt: 0 }, { label: '이용중', cnt: 1 },
  { label: '점검중', cnt: 0 }, { label: '정산완료', cnt: 2 }, { label: '취소', cnt: 0 },
], 0)}</div>

<div class="stack mt6" style="gap:var(--sp-item)">
  ${RENTS.map((r, i) => {
    const g = U.gearOf(r.gear);
    const 다음 = r.st === '이용중'
      ? `<div class="btns-v">${U.btn('반납 안내', { sm: true, cls: 'btn-pri', href: 'RT-03' })}${U.btn('연장하기', { sm: true, href: 'BK-06' })}</div>`
      : `<div class="btns-v">${U.btn(i === 1 ? '후기 쓰기' : '또 빌리기', { sm: true, href: i === 1 ? 'MY-03' : 'PD-02' })}</div>`;
    return `<div class="rowcard" data-href="${U.link('MY-02')}" tabindex="0" role="link">
      <div class="thumb">${U.phFix(['장비', 400, 400], 88, { seed: r.gear })}</div>
      <div class="bd">
        <div class="row" style="gap:6px">${U.stBadge(r.st)}${U.badge(r.depSt === '보류중' ? '보증금 보류 중' : '보증금 환급 완료', r.depSt === '보류중' ? 'b-warn' : 'b-ok')}</div>
        <div class="t-card mt2">${g.nm} × ${r.qty}개</div>
        <div class="t-sub mt1">${r.from} ~ ${r.to} · ${r.박}박 ${r.박 + 1}일 · ${r.way}</div>
        <div class="t-sub mt1">대여번호 <span class="num">${r.id}</span></div>
        ${r.st === '이용중' ? '<div class="t-sub dan mt2"><b>반납까지 지났습니다 — 1일 15시간</b></div>' : ''}
      </div>
      <div class="side">
        <div><b class="num">${U.won(r.paid)}</b></div>
        <div class="t-sub mb3">보증금 ${U.won(r.dep)}</div>
        ${다음}
      </div>
    </div>`;
  }).join('')}
</div>

<div class="row-b mt8 wrap-row">
  <div class="row wrap-row">
    ${U.select(['전체 기간', '최근 3개월', '올해', '작년'], 0)}
    <input class="in search" type="search" placeholder="장비 이름으로 찾기" style="width:auto;min-width:200px">
  </div>
  ${U.btn('엑셀로 받기', { sm: true, attr: ' data-toast="대여 내역을 내려받았어요" data-toast-kind="ok"' })}
</div>`,
});

PAGES['MY-02'] = () => {
  const r = RENTS[0];
  return {
    body: `${U.pageHd(`${G.nm} × ${r.qty}개`, `대여번호 ${r.id} · ${U.stBadge(r.st)}`,
      `${U.btn('연장하기', { href: 'BK-06' })}${U.btn('반납 안내', { cls: 'btn-pri', href: 'RT-03' })}`)}

${U.detail2(`
  ${U.card('어디까지 왔나요', U.timeline([
    { k: 'done', t: '신청', d: '2026-08-10 01:12' },
    { k: 'done', t: '결제 — 대여료 240,000원', d: '2026-08-10 01:14 · 신한카드' },
    { k: 'done', t: '수령 — 매장 방문', d: '2026-08-15 10:12 · 구성품 확인, 사진 4장' },
    { k: 'on', t: '이용 중', d: '반납 예정 8/17 18:00 — <b class="dan">1일 15시간 지남</b>' },
    { k: '', t: '반납', d: '아직' },
    { k: '', t: '점검', d: '아직 — 1~2일 걸립니다' },
    { k: '', t: '정산 · 보증금 환급', d: '아직' },
  ]))}

  ${U.card('기간', U.table(['', { t: '예정', w: '132px', cls: 'r' }, { t: '실제', w: '148px', cls: 'r' }], [
    ['받는 날', { t: '8/15 (토)', cls: 'r' }, { t: '8/15 10:12', cls: 'r' }],
    ['돌려주는 날', { t: '8/17 (월) 18:00', cls: 'r' }, { t: '<b class="dan">아직</b>', cls: 'r' }],
  ]), { cls: 'mt6' })}

  ${U.card('빌린 것', `${U.table(['구성품', { t: '개수', w: '80px', cls: 'c' }],
    [['본체 (이너텐트 + 플라이)', { t: '2', cls: 'c' }], ['폴대', { t: '4', cls: 'c' }],
     ['팩', { t: '24', cls: 'c' }], ['스트링', { t: '8', cls: 'c' }], ['보관가방', { t: '2', cls: 'c' }]])}
    <p class="t-sub mt4">2개를 빌리셔서 구성품도 두 벌입니다.</p>`, { cls: 'mt6' })}

  ${U.card('사진 견주기', `<p class="t-sub mb4">받으실 때 남긴 사진입니다. 돌려주실 때 같은 자리를 찍으시면 나란히 놓고 견줍니다.</p>
    <div class="g4">${['정면', '옆면', '바닥', '보관가방'].map((t) => `<div>${U.ph([t, 800, 600], { seed: t })}
      <div class="t-sub mt2" style="text-align:center">${t}</div></div>`).join('')}</div>`, { cls: 'mt6' })}`, `

  ${U.card('돈', `
    ${U.sumRows([
      ['대여료', '<span class="num">240,000원</span>'],
      ['결제 수단', '신한카드 일시불'],
    ])}
    ${U.depositRow(r.dep, '신한카드에 한도 보류 중 · 반납 확인 후 3영업일 내 해제')}
    ${U.banner('warn', '⏰', `지금 반납하시면 연체료 <b class="num">${U.won(연체료(G.day, 1) * 2)}</b>이 여기서 빠집니다.`, { cls: 'mt4' })}`, {
      ft: `<div class="btns-v">
        ${U.btn('지금 반납 접수', { cls: 'btn-pri', w: true, href: 'RT-04' })}
        ${U.btn('연장은 안 되나요', { w: true, href: 'RT-05' })}
      </div>`,
    })}

  ${U.card('서류', `<div class="btns-v">
    ${U.btn('계약서 받기', { w: true, href: 'BK-05' })}
    ${U.btn('영수증 받기', { w: true, attr: ' data-toast="이메일로 보냈어요" data-toast-kind="ok"' })}
    ${U.btn('이 대여 문의하기', { w: true, href: 'CS-02' })}
  </div>`)}`)}`,
  };
};

PAGES['MY-03'] = () => ({
  body: `${U.pageHd('후기 남기기', '다음에 빌리실 분께 큰 도움이 됩니다.')}

<div class="split-r">
  <div>
    ${U.card('', `<div class="rowcard" style="border:none;box-shadow:none;padding:0">
      <div class="thumb">${U.phFix(['장비', 400, 400], 72, { seed: 'G-105' })}</div>
      <div class="bd"><div class="t-card">${GEAR[4].nm}</div>
        <div class="t-sub mt1">2026-07-22 ~ 07-24 · 2박 3일</div></div>
    </div>`)}

    ${U.card('별점을 주세요', `
      <div style="text-align:center;padding:var(--sp-block) 0">
        <div style="font-size:40px;letter-spacing:4px" class="pri">★★★★★</div>
        <div class="t-card mt3">아주 만족해요</div>
      </div>
      <div class="stack mt6">
        ${[['장비 상태', '깨끗하고 멀쩡했나요'], ['설명과 같은지', '사진·설명대로였나요'],
           ['받고 돌려주기', '편했나요'], ['응대', '물어봤을 때 친절했나요']]
          .map(([t, d]) => `<div class="row-b"><div><div class="strong">${t}</div><div class="t-sub">${d}</div></div>
            <div style="font-size:22px;letter-spacing:3px" class="pri">★★★★★</div></div>`).join('')}
      </div>`, { cls: 'mt6' })}

    ${U.card('어떠셨나요', `
      ${U.textarea({ ph: '어떤 점이 좋았는지, 다음 분이 알아두면 좋을 점을 적어 주세요. 20자 이상.' })}
      <p class="t-sub mt2">0 / 20자</p>`, { cls: 'mt6' })}

    ${U.card('사진을 올려 주시면', `
      ${U.banner('ok', '📷', '<b>적립금 2,000원을 더 드려요.</b> 실제로 쓰는 모습이 다음 분께 가장 도움이 됩니다.')}
      <div class="g4 mt6">${[1, 2, 3, 4].map((i) => `<div>${U.ph([`사진 ${i}`, 800, 600], { seed: 'rv' + i })}
        <div class="btns mt2">${U.btn('📷 올리기', { sm: true, w: true, attr: ' data-toast="사진을 올렸어요"' })}</div></div>`).join('')}</div>`, { cls: 'mt6' })}

    ${U.card('어떤 용도로 쓰셨나요', U.chips(['가족캠핑', '백패킹', '차박', '촬영', '행사', '기타'], 3), { cls: 'mt6' })}

    ${U.card('다음 분께 팁 하나', U.textarea({ ph: '예) 설치는 생각보다 쉬웠어요. 팩은 여분으로 몇 개 더 빌리시는 걸 권합니다.' }), { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('적립금', `${U.sumRows([
      ['후기 쓰기', '<span class="num">3,000원</span>'],
      ['사진 올리기', '<span class="num">2,000원</span>'],
    ], ['받으실 적립금', '<span class="num pri">5,000원</span>'])}
    <p class="t-sub mt4">적립금은 다음에 빌리실 때 바로 쓰실 수 있습니다.</p>`, {
      ft: `${U.check('비공개로 남길게요', { sub: '별점만 반영되고 글은 안 보입니다. 적립금은 그대로 드려요.' })}
        <div class="mt4">${U.btn('후기 올리기', { cls: 'btn-pri', lg: true, w: true, href: 'MY-01' })}</div>`,
    })}

    ${U.card('다른 분들은 이렇게', `<div class="stack" style="gap:var(--sp-block)">
      ${REVIEWS.slice(0, 2).map((r) => `<div>${U.stars(r.r)} <span class="t-sub">${r.tag}</span>
        <p class="t-sub mt2">${r.t}</p></div>`).join('')}
    </div>`)}
  </div>
</div>`,
});

PAGES['MY-04'] = () => ({
  body: `${U.pageHd('알림과 쿠폰', '받을 알림을 정하고 쿠폰·적립금을 확인하세요.')}

<div class="split-r">
  <div>
    ${U.card('어떤 알림을 받으실래요', U.table(
      ['무슨 일이 있을 때', { t: '문자', w: '68px', cls: 'c' }, { t: '카톡', w: '68px', cls: 'c' }, { t: '이메일', w: '72px', cls: 'c' }],
      [['수령 안내', 1, 1, 0], ['반납 하루 전', 1, 1, 0], ['반납 3시간 전', 1, 1, 0],
       ['연체 안내', 1, 1, 1], ['점검 완료', 0, 1, 1], ['보증금 환급 완료', 1, 1, 1],
       ['자리 알림 (기다리던 날짜)', 1, 0, 0], ['기획전·쿠폰', 0, 1, 1]]
        .map(([t, a, b, c]) => [t,
          { t: U.toggle(!!a, `${t} 문자 알림을 바꿨어요`), cls: 'c' },
          { t: U.toggle(!!b, `${t} 카톡 알림을 바꿨어요`), cls: 'c' },
          { t: U.toggle(!!c, `${t} 이메일 알림을 바꿨어요`), cls: 'c' }]),
    ), { cls: '', ft: '<p class="t-sub">⚠ <b>반납 알림은 끄지 않으시길 권합니다.</b> 잊으면 연체료가 붙어요.</p>' })}

    ${U.card('자리 나면 알려달라고 하신 것', U.table(
      ['장비', { t: '기다리는 기간', w: '148px' }, { t: '순번', w: '68px', cls: 'c' }, { t: '', w: '72px' }],
      [[GEAR[0].nm, '8/15 ~ 8/17', { t: '<b class="num">4</b>번째', cls: 'c' }, U.btn('취소', { sm: true, cls: 'btn-dan', attr: ' data-toast="알림 신청을 취소했어요"' })],
       [GEAR[6].nm, '9/05 ~ 9/07', { t: '<b class="num">1</b>번째', cls: 'c' }, U.btn('취소', { sm: true, cls: 'btn-dan', attr: ' data-toast="알림 신청을 취소했어요"' })]],
    ), { cls: 'mt6' })}

    ${U.card('쿠폰', `
      ${U.tabBox([{ label: '쓸 수 있어요', cnt: 2, pane: 'a' }, { label: '썼어요', cnt: 3, pane: 'b' }, { label: '기간 지남', cnt: 1, pane: 'c' }],
        `${U.pane('a', `<div class="stack" style="gap:var(--sp-item)">
          ${[['재이용 10% 할인', '5만원 이상 · 9월 20일까지', '3일 남음', true],
             ['첫 캠핑 20% 할인', '캠핑 장비만 · 12월 31일까지', '', false]]
            .map(([nm, cond, left, urgent]) => `<div class="rowcard">
              <div class="bd"><div class="t-card">${nm}</div><div class="t-sub mt1">${cond}</div></div>
              <div class="side">${left ? U.badge(left, urgent ? 'b-dan' : 'b-mut') : ''}</div>
            </div>`).join('')}
        </div>`, true)}
         ${U.pane('b', '<p class="t-sub">이미 쓰신 쿠폰 3장이 있습니다.</p>')}
         ${U.pane('c', '<p class="t-sub">기간이 지난 쿠폰 1장이 있습니다.</p>')}`, 0)}
      <div class="row mt6" style="gap:var(--sp-item)">
        ${U.input({ ph: '쿠폰 번호를 넣으세요' })}
        ${U.btn('등록', { attr: ' data-toast="쿠폰을 등록했어요" data-toast-kind="ok"' })}
      </div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('적립금', `<div style="text-align:center;padding:var(--sp-item) 0">
      <div class="t-page pri num">8,000원</div></div>
      ${U.sumRows([['이번 달 없어질 것', '<span class="num warn">0원</span>'], ['최소 사용 금액', '<span class="num">1,000원</span>']])}
      <p class="t-sub mt3">쌓인 날부터 <b>1년</b>이 지나면 없어집니다.</p>`, {
        ft: U.btn('쌓인 내역 보기', { w: true, attr: ' data-toast="적립 내역을 엽니다"' }),
      })}

    ${U.card('보증금 면제까지', `
      <div class="row-b mb3"><span>3회 중 <b class="pri">2회</b></span><b class="num">66%</b></div>
      ${U.progress(66)}
      <p class="t-sub mt3">한 번 더 이용하시면 <b>다음부터 보증금을 받지 않습니다.</b></p>`)}

    ${U.card('연락처', `${U.kv([['전화', `<span class="num">${SITE.tel}</span>`], ['운영시간', '평일 10~19시']])}
      <div class="mt4">${U.btn('1:1 문의', { w: true, href: 'CS-02' })}</div>`)}
  </div>
</div>`,
});

/* ============================================================
   CS 고객센터
   ============================================================ */

PAGES['CS-01'] = () => ({
  body: `${U.pageHd('무엇이 궁금하세요', '많이 물어보시는 것부터 모았어요.')}

<div class="wrap-read">
  <div class="row" style="gap:var(--sp-item)">
    <input class="in search" type="search" placeholder="궁금한 것을 적어 보세요 — 예) 보증금, 연체" style="flex:1">
    ${U.btn('찾기', { cls: 'btn-pri', attr: ' data-toast="찾았어요"' })}
  </div>

  <div class="mt6">${U.chips(['전체', '보증금', '연체·파손', '반납', '받기·배송', '대여', '환불'], 0)}</div>

  ${U.card('많이 물어보시는 것', U.accordion([
    {
      q: '보증금은 언제 돌려받나요?',
      a: `반납하시고 <b>점검이 끝난 뒤 3영업일 안에</b> 돌려드립니다. 점검은 보통 1~2일 걸려요.
        「카드 한도 보류」로 걸어 두셨으면 입금이 아니라 <b>한도가 풀리는 것</b>이라 통장에는 아무것도 안 들어옵니다.
        카드 한도를 확인해 보세요. <a class="pri strong" href="${U.link('ST-03')}">환급 화면 보기</a>`,
    },
    {
      q: '반납이 늦으면 얼마가 붙나요?',
      a: `1일 늦으면 <b>1일 대여료의 30%</b>, 2일이면 60%, 3일 이상이면 100% 이상입니다.
        늦을 것 같으면 <b>반납일 전에 연장</b>해 주세요 — 연장이 훨씬 쌉니다.
        <a class="pri strong" href="${U.link('BK-06')}">연장하러 가기</a>`,
    },
    {
      q: '비 맞은 장비는 어떻게 반납하나요?',
      a: `<b>접지 말고 그대로 가져다 주세요.</b> 젖은 채로 접어서 가방에 넣으면 곰팡이가 생겨 배상 대상이 됩니다.
        말리지 못하셨어도 괜찮습니다. 건조비 20,000원만 정산돼요. 곰팡이가 생기면 원단값 40,000원입니다.`,
    },
    {
      q: '카드 한도 보류가 무슨 뜻인가요?',
      a: `카드사에 「이 사람 한도 중 얼마는 잠깐 못 쓰게 해 주세요」라고 요청하는 것입니다.
        <b>돈이 실제로 나가지 않고</b> 명세서에도 안 찍힙니다. 반납 후 풀어 드리면 한도가 원래대로 돌아옵니다.
        다만 <b>결제할 때는 한도가 잡히므로</b> 대여료 + 보증금만큼 여유가 있어야 결제됩니다.`,
    },
    {
      q: '예약한 날짜를 바꿀 수 있나요?',
      a: `받으시기 <b>3일 전까지</b>는 자유롭게 바꾸실 수 있습니다. 그 뒤로는 바꾸실 수 없고 취소만 됩니다
        (1일 전 50% 환불, 당일은 환불 불가). 바꾸시려는 날짜에 재고가 있어야 하니 미리 확인해 주세요.
        <a class="pri strong" href="${U.link('PD-03')}">재고 달력 보기</a>`,
    },
  ], 0), { cls: 'mt8' })}

  ${U.card('그 밖에', U.accordion([
    { q: '택배로 받을 수 있나요?', a: '됩니다. 왕복 6,000원이고, 빌리시는 날 아침에 도착하도록 하루 전에 보냅니다. 도서산간은 추가 비용이 있어요.' },
    { q: '구성품이 빠지면 어떻게 되나요?', a: `부품별 기준액이 정산됩니다. ${배상표.filter(([, v]) => v > 0).slice(0, 3).map(([n, v]) => `${n} ${U.won(v)}`).join(' · ')}. 나중에 찾으셔서 가져오시면 돌려드립니다.` },
    { q: '설치를 못 하겠어요.', a: '받으실 때 한 번 보여드리고 설치 영상 링크를 문자로 보내드립니다. 현장에서 막히시면 운영시간 안에 전화 주세요.' },
    { q: '다른 사람이 대신 받아도 되나요?', a: '됩니다. 다만 고가 장비(50만원 초과)는 위임장과 신분증이 필요합니다.' },
    { q: '보증금 없이 빌릴 수 있나요?', a: '첫 대여는 보증금이 없습니다. 그리고 3회 이상 이용하시고 연체·파손이 없으면 그 뒤로도 면제됩니다.' },
  ], -1), { cls: 'mt6' })}

  ${U.card('원하는 답이 없으신가요', `<div class="row-b wrap-row">
    <div><div class="strong">직접 물어봐 주세요</div>
      <div class="t-sub mt1">평일 기준 1영업일 안에 답변드립니다. 급하시면 전화 주세요 — <span class="num">${SITE.tel}</span></div></div>
    ${U.btn('1:1 문의하기', { cls: 'btn-pri', href: 'CS-02' })}
  </div>`, { cls: 'mt8' })}
</div>`,
});

PAGES['CS-02'] = () => ({
  body: `${U.pageHd('물어보기', '평일 기준 1영업일 안에 답변드립니다.')}

<div class="split-r">
  <div>
    ${U.card('무엇에 대한 문의인가요', `
      ${U.field('종류', U.select(['고르세요', '대여 관련', '보증금', '정산 이의', '파손·분실', '받기·배송', '그 밖에'], 3), { req: true })}
      ${U.banner('warn', '⏳', '<b>정산 이의는 기한이 있습니다.</b> 정산 확정 후 <b>7일 안에</b>만 제기하실 수 있어요. 남은 기간 <b>7일</b> (8월 25일까지).')}`)}

    ${U.card('어떤 대여인가요', `
      ${U.field('대여 고르기', U.select(RENTS.map((r) => `${r.id} · ${U.gearOf(r.gear).nm} · ${r.from}`), 0))}
      ${U.box(`<div class="t-sub">고르신 대여</div>
        ${U.kv([['장비', `${G.nm} × 2개`], ['기간', '8/15 ~ 8/17'], ['대여번호', '<span class="num">R-20260810-0031</span>']], { cls: 'left' })}`)}
      <p class="t-sub mt3">고르시면 장비·기간·대여번호가 자동으로 채워집니다.</p>`, { cls: 'mt6' })}

    ${U.card('무슨 말씀이신가요', `
      ${U.textarea({ v: '흙 오염으로 세척비 20,000원이 잡혔는데, 받을 때 이미 바닥에 흙이 묻어 있었습니다. 수령 사진 4번째를 봐 주시겠어요?' })}
      <p class="t-sub mt2">10자 이상 적어 주세요.</p>`, { cls: 'mt6' })}

    ${U.card('사진을 붙여 주시면 훨씬 빨라요', `
      <p class="t-sub mb4">정산이나 파손 문의는 <b>사진이 있으면 하루가 줄어듭니다.</b> 최대 5장, 10MB까지.</p>
      <div class="g4">${['수령 사진', '반납 사진', '추가 1', '추가 2'].map((t) => `<div>${U.ph([t, 800, 600], { seed: t })}
        <div class="btns mt2">${U.btn('붙이기', { sm: true, w: true, attr: ` data-toast="${t}을(를) 붙였어요"` })}</div></div>`).join('')}</div>`, { cls: 'mt6' })}

    ${U.card('답변을 어디로 받으실래요', `<div class="stack">
      ${U.check('문자로', { on: true, none: true })}
      ${U.check('이메일로', { on: true, none: true })}
    </div>`, { cls: 'mt6' })}

    ${U.card('지난 문의', U.table([{ t: '언제', w: '112px' }, '제목', { t: '종류', w: '84px' }, { t: '상태', w: '92px' }], [
      ['<span class="num sub">2026-07-25</span>', '보증금이 아직 안 풀렸어요', '보증금', U.badge('답변 완료', 'b-ok')],
      ['<span class="num sub">2026-07-05</span>', '팩을 하나 잃어버렸습니다', '파손·분실', U.badge('답변 완료', 'b-ok')],
    ]), { cls: 'mt6' })}
  </div>

  <div class="sticky stack" style="gap:var(--sp-block)">
    ${U.card('', `<div class="btns-v">
      ${U.btn('문의 보내기', { cls: 'btn-pri', lg: true, w: true, attr: ' data-toast="문의를 보냈어요. 1영업일 안에 답변드릴게요" data-toast-kind="ok"' })}
      ${U.btn('자주 묻는 질문 먼저 보기', { w: true, href: 'CS-01' })}
    </div>`)}

    ${U.card('급하시면', `${U.kv([
      ['전화', `<b class="num">${SITE.tel}</b>`],
      ['운영시간', '평일 10:00~19:00'],
      ['토요일', '10:00~17:00'],
      ['일요일', '쉽니다'],
    ], { cls: 'left' })}
    <p class="t-sub mt4">반납이 늦어지실 것 같으면 <b>전화가 가장 빠릅니다.</b></p>`)}
  </div>
</div>`,
});

PAGES['CS-03'] = () => ({
  body: `${U.pageHd('이용 안내 · 약관', '겁드리려는 문서가 아닙니다. 미리 알려드리는 것이에요.')}

<div class="wrap-read">
  ${U.card('세 가지만 기억하세요', `<div class="g3">
    ${U.box('<div class="t-sec dan">30%</div><div class="strong mt2">하루 늦으면</div><p class="t-sub mt2">1일 대여료의 30%가 붙습니다. 늦을 것 같으면 미리 연장하세요.</p>')}
    ${U.box('<div class="t-sec warn">부품별</div><div class="strong mt2">망가뜨리면</div><p class="t-sub mt2">기준액이 정해져 있어요. 미리 말씀하시면 조정될 수 있습니다.</p>')}
    ${U.box('<div class="t-sec pri">3영업일</div><div class="strong mt2">보증금은</div><p class="t-sub mt2">반납 확인 후 3영업일 안에 돌려드립니다.</p>')}
  </div>`)}

  <div class="mt8">${U.tabBox(
    [{ label: '대여', pane: 'a' }, { label: '보증금', pane: 'b' }, { label: '연체', pane: 'c' },
     { label: '파손 배상', pane: 'd' }, { label: '취소·환불', pane: 'e' }, { label: '반납 상태', pane: 'f' }],
    `${U.pane('a', U.card('', `
        <h3 class="t-card mb3">누가 빌릴 수 있나요</h3>
        <p class="t-sub">만 19세 이상이면 됩니다. 고가 장비(50만원 초과)는 받으실 때 신분증을 확인합니다.</p>
        <h3 class="t-card mt6 mb3">얼마나 빌릴 수 있나요</h3>
        <p class="t-sub">최소 1박부터 최대 30박까지입니다. 그보다 길게 필요하시면 전화 주세요.</p>
        <h3 class="t-card mt6 mb3">하시면 안 되는 것</h3>
        <ul class="stack t-sub"><li>· 다른 사람에게 다시 빌려주기</li><li>· 개조하거나 부품 바꾸기</li>
          <li>· 영업 목적으로 쓰기 (따로 문의해 주세요)</li></ul>`), true)}
     ${U.pane('b', U.card('', `
        <p>보증금은 <b>장비 상태를 확인할 때까지 잠시 걸어두는 돈</b>입니다. 대여료와 다릅니다.</p>
        <div class="mt6">${U.table(['방식', '어떻게', { t: '언제 돌려받나', w: '132px' }], [
          ['카드 한도 보류', '<b>돈이 안 나갑니다.</b> 한도만 잡혀요', '반납 확인 후 1~3영업일'],
          ['실제 결제 후 환불', '결제되고 나중에 돌려드립니다', '반납 확인 후 3~5영업일'],
          ['적립금으로 받기', '5% 더 드립니다', '바로'],
        ])}</div>
        ${U.banner('ok', '🎁', '<b>첫 대여는 보증금이 없습니다.</b> 3회 이상 이용하고 연체·파손이 없으면 그 뒤로도 면제됩니다.', { cls: 'mt6' })}`))}
     ${U.pane('c', U.card('', `
        ${U.table(['얼마나 늦었나', '얼마', '메모'], [
          ['1일', '1일 대여료의 <b>30%</b>', ''],
          ['2일', '1일 대여료의 <b>60%</b>', ''],
          ['3일 이상', '1일 대여료의 <b>100%</b> 이상', '다음 예약이 취소되면 위약금이 더해집니다'],
          ['7일 (연락 없음)', '<b class="dan">분실 처리</b>', '장비 정가가 청구되고 법적 절차가 시작됩니다'],
        ])}
        ${U.banner('info', '💡', '<b>연장이 연체보다 훨씬 쌉니다.</b> 반납일 «전»에만 연장할 수 있으니 미리 눌러 주세요.', { cls: 'mt6' })}
        <p class="t-sub mt4">연체료는 보증금에서 먼저 빠지고, 보증금을 넘으면 등록하신 카드로 청구됩니다.</p>`))}
     ${U.pane('d', U.card('', `
        ${U.table(['어디가', { t: '얼마', w: '120px', cls: 'r nowrap' }, '메모'],
          배상표.map(([n, v]) => [n,
            { t: v ? `<span class="num">${U.won(v)}</span>` : '<b class="dan">정가 100%</b>', cls: 'r nowrap' },
            n === '원단 찢어짐' ? '수리로 되면 수리비만 받습니다' : (n === '분실' ? '못 찾으신 경우' : '')]))}
        ${U.banner('ok', '🤝', '<b>미리 신고하시면 배상액이 조정될 수 있습니다.</b> 숨기시면 점검에서 나오고 그때는 조정할 여지가 없어집니다.', { cls: 'mt6' })}
        <p class="t-sub mt4">파손 면책 보험(하루 3,000원)을 붙이시면 20만원까지 면책됩니다.
          다만 <b>고의·분실·침수</b>는 면책되지 않습니다.</p>`))}
     ${U.pane('e', U.card('', `
        ${U.table(['언제 취소하시나', { t: '얼마 돌려받나', w: '132px', cls: 'r' }], [
          ['받으시기 3일 전까지', { t: '<b class="pri">100%</b>', cls: 'r' }],
          ['1~2일 전', { t: '50%', cls: 'r' }],
          ['당일', { t: '<b class="dan">환불 안 됩니다</b>', cls: 'r' }],
        ])}
        ${U.box(`<div class="strong mb2">예를 들면</div>
          <p class="t-sub">8월 15일에 받으실 예정이면 <b>8월 12일 밤 12시까지</b> 취소하시면 전액 돌려받습니다.
            13~14일에 취소하시면 절반, 15일 당일은 안 됩니다.</p>`, { cls: 'mt6' })}
        <p class="t-sub mt4">저희 사정(장비 파손·재고 부족)으로 못 빌려드리게 되면 <b>언제든 전액 환불</b>하고
          비슷한 장비를 대신 준비해 드립니다.</p>`))}
     ${U.pane('f', U.card('', `
        <div class="g2">
          ${U.box(`<div class="strong pri mb2">✓ 이 정도면 충분해요</div>
            ${U.ph(['털어서 넣은 상태', 800, 500], { seed: 'ok1' })}
            <p class="t-sub mt3">흙을 털고 말려서 보관가방에 넣기</p>`)}
          ${U.box(`<div class="strong dan mb2">✕ 이러면 추가 비용</div>
            ${U.ph(['젖은 채 접힌 상태', 800, 500], { seed: 'ng1' })}
            <p class="t-sub mt3">젖은 채 접어 넣음 — 건조비 20,000원<br>흙이 그대로 — 세척비 20,000원</p>`)}
        </div>
        <p class="t-sub mt6"><b>완벽하게 깨끗할 필요는 없습니다.</b> 저희가 다시 손질합니다.
          다만 곰팡이가 생길 정도면 원단을 바꿔야 해서 배상 대상이 됩니다.</p>`))}`,
    0, { pill: true },
  )}</div>

  ${U.card('내 대여로 계산해 볼까요', `
    <p class="t-sub mb4">지금 빌리고 계신 것 기준으로 연체료와 환불액을 계산해 드립니다.</p>
    ${U.table(['대여', { t: '지금 취소하면', w: '124px', cls: 'r' }, { t: '하루 늦으면', w: '124px', cls: 'r' }], [
      [`${G.nm} × 2 (이용중)`, { t: '<span class="muted">이미 받으심</span>', cls: 'r' }, { t: `<b class="num dan">${U.won(연체료(G.day, 1) * 2)}</b>`, cls: 'r' }],
    ])}`, { cls: 'mt8' })}

  ${U.card('규정이 바뀌면', `${U.table([{ t: '언제', w: '124px' }, '무엇이 바뀌었나'], [
    ['<span class="num sub">2026-07-01</span>', '보증금 면제 조건을 5회 → <b>3회</b>로 낮췄습니다'],
    ['<span class="num sub">2026-05-15</span>', '연체료를 40% → <b>30%</b>로 낮췄습니다'],
  ])}
  <p class="t-sub mt4">이미 예약하신 건은 <b>예약 당시 규정</b>이 적용됩니다.</p>`, { cls: 'mt6' })}

  <div class="btns mt8">
    ${U.btn('약관 전문 내려받기', { attr: ' data-toast="약관 PDF를 내려받았어요" data-toast-kind="ok"' })}
    ${U.btn('자주 묻는 질문', { href: 'CS-01' })}
    ${U.btn('직접 물어보기', { cls: 'btn-pri', href: 'CS-02' })}
  </div>
</div>`,
});
