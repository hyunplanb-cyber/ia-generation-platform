/* AC 계정·접근 (3) · DB 대시보드 (3) */
import * as U from './ui.mjs';
import { SITE, BOOKINGS, ORDERS, PRODUCTS, SALES_7D, LOGS, CUSTOMERS, TODAY } from './data.mjs';

export const PAGES = {};

/* ============================================================
   AC 계정·접근 — 사이드바 없이 가운데 카드 한 장(solo)
   ============================================================ */

PAGES['AC-01'] = () => ({
  o: { solo: true },
  body: U.solo(
    `${SITE.biz} 관리 시스템`,
    '사장님과 직원이 쓰는 화면입니다. 손님용 예약 페이지와 다릅니다.',
    `<form>
      ${U.field('이메일', U.input({ type: 'email', ph: 'name@salon.example', v: 'jiwoo@salon.example' }), { req: true })}
      ${U.field('비밀번호',
        `<div class="in-row">${U.input({ type: 'password', v: '············' })}
         ${U.btn('👁', { sm: false, attr: ' data-toast="비밀번호를 화면에 보여 줍니다" aria-label="비밀번호 표시"' })}</div>`,
        { req: true })}
      <div class="row-b mt4">
        ${U.check('로그인 상태 유지', { on: true, none: true })}
        <a class="t-sub" href="${U.link('AC-02')}"><b>비밀번호를 잊으셨나요?</b></a>
      </div>
      ${U.btn('로그인', { cls: 'btn-pri', w: true, href: 'DB-01' })}
    </form>
    ${U.banner('warn', '⚠', '비밀번호를 <b>5번</b> 틀리면 계정이 잠깁니다. 잠기면 원장님께 잠금 해제를 요청해 주세요.', { cls: 'mt6' })}
    <p class="t-sub mt4">접속 환경 — Chrome 128 · Windows · 203.0.113.24<br>
    공용 PC에서는 「로그인 상태 유지」를 꺼 주세요.</p>`,
  ),
});

PAGES['AC-02'] = () => ({
  o: { solo: true },
  body: U.solo(
    '비밀번호 재설정',
    '가입하신 이메일로 재설정 링크를 보내 드립니다.',
    `<form>
      ${U.field('가입 이메일', U.input({ type: 'email', ph: 'name@salon.example' }), { req: true })}
      ${U.btn('재설정 링크 발송', { cls: 'btn-pri', w: true, attr: ' data-toast="재설정 링크를 보냈어요" data-toast-kind="ok"' })}
    </form>
    ${U.banner('ok', '✓', '<b>jiwoo@salon.example</b> 로 재설정 링크를 보냈습니다. 링크는 30분 뒤 만료됩니다.', { cls: 'mt6' })}
    <div class="row-b mt4">
      <span class="t-sub">재발송까지 <b class="num" data-count="180">3:00</b></span>
      ${U.btn('재발송', { sm: true, off: true })}
    </div>
    <p class="t-sub mt4">메일이 안 보이면 <b>스팸함</b>을 확인해 주세요. 그래도 없으면 주소를 다시 확인해 주세요.</p>
    <div class="mt6">${U.btn('‹ 로그인으로 돌아가기', { href: 'AC-01', w: true })}</div>`,
  ),
});

PAGES['AC-03'] = () => ({
  o: { solo: true },
  body: U.solo(
    '접근 권한이 없습니다',
    '이 메뉴는 원장·매니저만 볼 수 있어요.',
    `${U.box(U.kv([
      ['로그인 계정', '김도윤 (doyun@salon.example)'],
      ['권한 등급', U.stBadge('일반')],
      ['요청한 화면', '정산 설정 (SE-02)'],
    ], { cls: 'left' }))}
    <p class="t-sub mt4">권한이 필요하시면 원장님께 요청해 주세요. 요청 내역은 활동 로그에 남습니다.</p>
    <div class="btns-v mt6">
      ${U.btn('관리자에게 권한 요청', { cls: 'btn-pri', w: true, attr: ' data-toast="원장님께 권한 요청을 보냈어요" data-toast-kind="ok"' })}
      ${U.btn('대시보드로 돌아가기', { href: 'DB-01', w: true })}
    </div>
    <p class="t-sub mt4" style="text-align:center"><a href="${U.link('AC-01')}"><b>로그아웃</b></a></p>`,
  ),
});

/* ============================================================
   DB 대시보드
   ============================================================ */

const 오늘매출 = BOOKINGS.filter((b) => b.st !== '취소' && b.st !== '노쇼').reduce((a, b) => a + b.amt, 0);
const 미처리 = ORDERS.filter((o) => o.st === '결제완료').length;
const 부족 = PRODUCTS.filter((p) => p.st === '재고부족' || p.st === '품절');

PAGES['DB-01'] = (ctx) => ({
  body: `${U.pageHd('대시보드', `${TODAY} · ${SITE.biz}`, `${U.btn('알림 센터', { href: 'DB-03' })}${U.btn('예약 등록', { cls: 'btn-pri', href: 'BK-03' })}`)}

${U.statRow([
  [U.won(오늘매출), '오늘 매출', { d: U.up('어제보다 12%') }],
  [`${BOOKINGS.length}건`, '오늘 예약 건수', { cls: 'ok', d: `확정 ${BOOKINGS.filter((b) => b.st === '확정').length} · 대기 ${BOOKINGS.filter((b) => b.st === '대기').length}` }],
  ['2명', '신규 고객', { cls: 'acc', d: U.up('이번 주 5명') }],
  [`${미처리}건`, '미처리 주문', { cls: 'warn', d: '확인이 필요해요' }],
])}

<div class="split-r mt8">
  <div class="stack" style="gap:var(--sp-block)">
    ${U.sec('최근 7일 매출 추이', U.bars(SALES_7D), { aside: `<span class="t-sub">합계 <b>${U.won(SALES_7D.reduce((a, b) => a + b.v, 0))}</b></span>` })}

    ${U.sec('오늘 예약', U.table(
      [{ t: '시간', w: '64px' }, '고객', '서비스', '담당', { t: '상태', w: '72px' }, { t: '금액', w: '86px', cls: 'r' }],
      BOOKINGS.map((b) => ({
        href: 'BK-02',
        cells: [`<b class="num">${b.tm}</b>`, b.nm, b.svc, b.staff, U.stBadge(b.st), { t: U.won(b.amt), cls: 'r' }],
      })),
    ), { more: 'BK-01', moreLabel: '예약 캘린더' })}

    ${U.sec('인기 상품 TOP 5', U.table(
      [{ t: '#', w: '30px' }, '상품', { t: '판매량', w: '72px', cls: 'r' }, { t: '매출', w: '92px', cls: 'r' }, { t: '추이', w: '60px' }],
      [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 5).map((p, i) => [
        `<span class="muted num">${i + 1}</span>`, p.nm,
        { t: `<span class="num">${U.num(p.sold)}</span>`, cls: 'r' },
        { t: U.won(p.price * p.sold), cls: 'r' },
        U.spark([3, 5, 4, 6, 8, 7, 9].map((n) => n + (i % 3))),
      ]),
    ), { more: 'ST-04', moreLabel: '상품별 실적' })}
  </div>

  <div class="stack" style="gap:var(--sp-block)">
    ${U.card('처리 대기', `
      <div class="stack">
        <a class="row-b" href="${U.link('OR-01')}"><span>미확인 주문</span>${U.badge(`${미처리}건`, 'b-warn')}</a>
        <a class="row-b" href="${U.link('MK-02')}"><span>답변 대기 문의</span>${U.badge('1건', 'b-warn')}</a>
        <a class="row-b" href="${U.link('PD-04')}"><span>재고 부족</span>${U.badge(`${부족.length}건`, 'b-dan')}</a>
      </div>`, { aside: U.btn('알림 센터', { href: 'DB-03', sm: true }) })}

    ${U.card('바로 가기', `<div class="btns-v">
      ${U.btn('고객 관리', { href: 'CU-01', w: true })}
      ${U.btn('예약 캘린더', { href: 'BK-01', w: true })}
      ${U.btn('주문 관리', { href: 'OR-01', w: true })}
    </div>`)}

    ${U.card('최근 활동', U.timeline(LOGS.slice(0, 4).map((l) => ({
      k: l.hot ? 'on' : '',
      t: `${l.who} · ${l.act}`,
      d: `${l.tgt} — ${l.diff}<br>${l.at}`,
    }))), { aside: U.btn('전체', { href: 'TM-03', sm: true }) })}
  </div>
</div>`,
});

PAGES['DB-02'] = () => {
  const 단계 = [
    ['사업장 정보 입력', '상호·주소·영업시간을 채웁니다', 'SE-01', true],
    ['상품 등록', '파는 서비스와 가격을 등록합니다', 'PD-02', true],
    ['직원 초대', '함께 쓸 직원을 부릅니다', 'TM-02', false],
    ['첫 고객 등록', '단골부터 한 명 넣어 봅니다', 'CU-03', false],
  ];
  const 끝 = 단계.filter((s) => s[3]).length;
  return {
    body: `${U.pageHd(`${SITE.biz}에 오신 것을 환영합니다`, '네 단계만 마치면 바로 쓰실 수 있어요.')}

${U.card('시작 체크리스트', `
  <div class="row-b mb4">
    <span class="t-sub">${끝}/${단계.length} 단계 완료</span>
    <b class="num">${Math.round(끝 / 단계.length * 100)}%</b>
  </div>
  ${U.progress(끝 / 단계.length * 100)}
  <div class="stack mt6" style="gap:var(--sp-item)">
    ${단계.map(([t, d, to, done]) => `<div class="row-b">
      <div class="row"><span>${done ? '✓' : '○'}</span><div><div class="strong">${t}</div><div class="t-sub">${d}</div></div></div>
      ${done ? U.badge('완료', 'b-ok') : U.btn('바로 가기', { href: to, sm: true, cls: 'btn-pri' })}
    </div>`).join('')}
  </div>`)}

${U.banner('info', '💡', '아직 데이터가 없어 지표가 비어 있어요. <b>샘플 데이터를 불러오면</b> 화면이 어떻게 채워지는지 미리 볼 수 있습니다.', {
    cls: 'mt8', right: U.btn('샘플 데이터 불러오기', { sm: true, attr: ' data-toast="샘플 데이터를 넣었어요. 설정에서 지울 수 있습니다" data-toast-kind="ok"' }),
  })}

${U.statRow([['0원', '오늘 매출'], ['0건', '오늘 예약'], ['0명', '신규 고객'], ['0건', '미처리 주문']], 'g4 mt8')}

${U.sec('오늘 예약', U.empty('▤', '아직 예약이 없어요', '예약을 등록하면 여기에 시간표가 나타납니다.',
    `${U.btn('예약 등록', { cls: 'btn-pri', href: 'BK-03' })}${U.btn('상품 먼저 등록', { href: 'PD-02' })}`), { cls: 'mt8' })}

<p class="t-sub mt8">처음이라 막막하시면 <a href="${U.link('SE-01')}"><b>사업장 정보</b></a>부터 채워 보세요.
도움말과 가이드는 우측 하단 <b>화면 정보</b> 버튼에서도 볼 수 있습니다.</p>`,
  };
};

PAGES['DB-03'] = () => {
  const 알림 = [
    { ico: '▤', ttl: '새 예약이 들어왔어요', d: '한소영 · 볼륨 매직 (중단발) · 8/10 13:00', at: '방금', to: 'BK-02', k: '예약', new: true },
    { ico: '▣', ttl: '새 주문 결제 완료', d: '주문 20260810-0031 · 100,000원', at: '12분 전', to: 'OR-02', k: '주문', new: true },
    { ico: '▧', ttl: '재고가 부족합니다', d: '트리트먼트 (LPP) 품절 · 두피 스케일링 3개 남음', at: '1시간 전', to: 'PD-04', k: '재고', new: true },
    { ico: '▤', ttl: '예약이 취소됐어요', d: '오재현 · 디자인 커트 · 8/10 17:30 노쇼 처리', at: '3시간 전', to: 'BK-02', k: '예약', new: false },
    { ico: '✉', ttl: '문의가 도착했어요', d: '“주차 가능한가요?” · 윤채린', at: '어제', to: 'MK-02', k: '문의', new: false },
    { ico: '⚙', ttl: '정산이 완료됐습니다', d: '8월 1주차 정산 2,418,000원 입금', at: '2일 전', to: 'SE-02', k: '시스템', new: false },
  ];
  return {
    body: `${U.pageHd('알림 센터', '읽지 않은 알림 3건', `${U.btn('모두 읽음 처리', { attr: ' data-toast="모든 알림을 읽음으로 표시했어요" data-toast-kind="ok"' })}${U.btn('알림 설정', { href: 'SE-03' })}`)}

${U.tabs([
  { label: '전체', cnt: 알림.length }, { label: '예약', cnt: 2 }, { label: '주문', cnt: 1 },
  { label: '재고', cnt: 1 }, { label: '문의', cnt: 1 }, { label: '시스템', cnt: 1 },
], 0)}

<div class="stack mt6" style="gap:var(--sp-item)">
  ${알림.map((n) => `<div class="card" data-href="${U.link(n.to)}" tabindex="0" role="link">
    <div class="card-bd row" style="gap:var(--sp-title)">
      <span style="font-size:17px;opacity:.6" aria-hidden="true">${n.ico}</span>
      <div class="grow">
        <div class="row" style="gap:6px"><b>${n.ttl}</b>${n.new ? U.badge('새 알림', 'b-acc') : ''}</div>
        <div class="t-sub mt1">${n.d}</div>
      </div>
      <span class="t-sub nowrap">${n.at}</span>
      ${U.btn('보기 ›', { href: n.to, sm: true })}
    </div></div>`).join('')}
</div>

<p class="t-sub mt8">어떤 알림을 받을지는 <a href="${U.link('SE-03')}"><b>알림 설정</b></a>에서 바꿀 수 있어요.</p>`,
  };
};
