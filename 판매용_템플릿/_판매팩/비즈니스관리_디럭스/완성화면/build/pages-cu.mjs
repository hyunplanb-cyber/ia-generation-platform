/* CU 고객 관리 (4) */
import * as U from './ui.mjs';
import { CUSTOMERS, STAFF } from './data.mjs';

export const PAGES = {};

const 등급 = ['VIP', '단골', '신규', '휴면'];

/** 좌측 필터 패널 — 목록 화면에서만 쓴다(레이아웃 A: 표 중심) */
const 필터 = () => U.card('필터', `
  ${U.field('등급', `<div class="stack">${등급.map((g, i) => U.check(g, { on: i < 2, none: true })).join('')}</div>`)}
  ${U.field('최근 방문', U.select(['전체 기간', '최근 7일', '최근 30일', '90일 이상 미방문'], 0))}
  ${U.field('담당 직원', U.select(['전체', ...STAFF.map((s) => s.nm)], 0))}
  ${U.field('태그', U.input({ ph: '펌, 민감두피 …' }))}
  <div class="btns-v mt6">
    ${U.btn('필터 적용', { cls: 'btn-pri', w: true, attr: ' data-toast="필터를 적용했어요"' })}
    ${U.btn('초기화', { w: true, href: 'CU-01' })}
  </div>`);

PAGES['CU-01'] = () => ({
  body: `${U.pageHd('고객 목록', `전체 ${CUSTOMERS.length}명 · VIP 2명 · 이번 달 신규 2명`,
    `${U.btn('엑셀 내보내기', { attr: ' data-toast="고객 목록을 엑셀로 내려받았어요" data-toast-kind="ok"' })}${U.btn('신규 고객 등록', { cls: 'btn-pri', href: 'CU-03' })}`)}

${U.listPage(필터(), `
  <div class="filters">
    <input class="in search" type="search" placeholder="이름 또는 연락처로 검색">
    ${U.select(['최근 방문순', '누적 구매액순', '이름순'], 0)}
    ${U.btn('검색', { attr: ' data-toast="검색했어요"' })}
    ${U.btn('결과 없을 때', { sm: true, href: 'CU-04' })}
  </div>

  ${U.banner('info', '☑', '고객을 골라 <b>한 번에 알림을 보낼</b> 수 있어요. 아래 체크박스로 고르세요.', {
    right: U.btn('선택 고객에게 알림 발송', { sm: true, cls: 'btn-pri', href: 'MK-01' }),
  })}

  <div class="mt6">${U.table(
    [{ t: '<input type="checkbox" aria-label="전체 선택">', w: '34px', cls: 'c' }, '이름', '연락처',
     { t: '등급', w: '62px' }, { t: '방문', w: '54px', cls: 'r' }, { t: '누적 구매액', w: '104px', cls: 'r nowrap' },
     { t: '최근 방문', w: '92px' }, '태그', { t: '담당', w: '62px' }],
    CUSTOMERS.map((c) => ({
      href: 'CU-02',
      cells: [
        { t: `<input type="checkbox" aria-label="${c.nm} 선택">`, cls: 'c' },
        `<b>${c.nm}</b>`, `<span class="num">${c.tel}</span>`, U.stBadge(c.gr),
        { t: `<span class="num">${c.visit}</span>`, cls: 'r' },
        { t: `<span class="num">${U.won(c.amt)}</span>`, cls: 'r nowrap' },
        `<span class="num">${c.last}</span>`,
        c.tags.length ? c.tags.map((t) => U.badge(t)).join(' ') : '<span class="muted">-</span>',
        c.staff,
      ],
    })),
  )}</div>

  <div class="row-b mt6">
    <span class="t-sub">1–${CUSTOMERS.length} / ${CUSTOMERS.length}명</span>
    <div class="btns">${U.btn('‹ 이전', { sm: true, off: true })}${U.btn('1', { sm: true, cls: 'btn-pri' })}${U.btn('다음 ›', { sm: true, off: true })}</div>
  </div>`)}`,
});

PAGES['CU-02'] = () => {
  const c = CUSTOMERS[0];
  const 이력 = [
    { k: 'on', t: '뿌리 염색 · 72,000원', d: '2026-08-08 10:00 · 담당 박지우' },
    { k: 'done', t: '두피 스케일링 · 55,000원', d: '2026-07-18 14:30 · 담당 박지우' },
    { k: 'done', t: '알림 발송 — 8월 회원 전용 쿠폰', d: '2026-07-10 09:00 · 알림톡 · 열람함' },
    { k: 'done', t: '볼륨 매직 (중단발) · 148,000원', d: '2026-06-22 13:00 · 담당 박지우' },
    { k: 'done', t: '등급 변경 단골 → VIP', d: '2026-06-22 · 누적 300만원 달성' },
  ];
  return {
    body: `${U.pageHd(c.nm, `${c.id} · ${c.join} 가입 · 담당 ${c.staff}`,
      `${U.btn('알림 보내기', { href: 'MK-01' })}${U.btn('예약 잡기', { cls: 'btn-pri', href: 'BK-03' })}`)}

${U.detail2(`
  ${U.statRow([
    [U.won(c.amt), '누적 구매액'],
    [`${c.visit}회`, '방문 횟수'],
    [U.won(Math.round(c.amt / c.visit / 1000) * 1000), '평균 결제액'],
    [c.last, '최근 방문'],
  ])}

  ${/* ⚠ 탭과 몸통은 «같은 상자» 안에 있어야 한다.
        app.js 는 눌린 탭의 .tabs 를 찾아 그 «부모» 안에서만 [data-pane-body] 를 찾는다.
        전에는 탭을 <div class="mt8"> 에, 몸통을 <div class="mt6"> 에 따로 뒀더니
        탭은 색만 바뀌고 몸통은 그대로였다 — 눌러 보기 전에는 안 보였다(2026-08-10). */ ''}
  <div class="mt8">${U.tabs([
    { label: '방문·구매 이력', pane: 'h' }, { label: '예약 내역', pane: 'b' },
    { label: '메모', pane: 'm' }, { label: '발송 이력', pane: 's' },
  ], 0)}

  <div class="mt6">
    ${U.pane('h', U.card('', U.timeline(이력)), true)}
    ${U.pane('b', U.card('', U.table(['예약번호', '일시', '서비스', '담당', '상태'], [
      ['B-8841', '2026-08-08 10:00', '뿌리 염색', '박지우', U.stBadge('완료')],
      ['B-8790', '2026-07-18 14:30', '두피 스케일링', '박지우', U.stBadge('완료')],
      ['B-8702', '2026-06-22 13:00', '볼륨 매직 (중단발)', '박지우', U.stBadge('완료')],
    ])))}
    ${U.pane('m', U.card('관리자 메모', `
      ${U.textarea({ ph: '두피가 민감해 염색 전 패치 테스트 필요. 향 강한 제품 싫어하심.', v: '두피가 민감해 염색 전 패치 테스트 필요. 향 강한 제품 싫어하심.' })}
      <div class="btns mt4">${U.btn('메모 저장', { cls: 'btn-pri', attr: ' data-toast="메모를 저장했어요" data-toast-kind="ok"' })}</div>
      <p class="t-sub mt4">최근 수정 2026-08-08 · 박지우</p>`))}
    ${U.pane('s', U.card('', U.table(['발송일시', '채널', '제목', '결과'], [
      ['2026-08-10 09:00', '알림톡', '오늘 예약 리마인드', U.stBadge('발송완료')],
      ['2026-07-10 09:00', '알림톡', '8월 회원 전용 쿠폰', U.stBadge('발송완료')],
    ])))}
  </div></div>`, `
  ${U.card('고객 정보', U.kv([
    ['연락처', `<span class="num">${c.tel}</span>`],
    ['이메일', c.mail],
    ['등급', U.stBadge(c.gr)],
    ['담당 직원', c.staff],
    ['가입일', `<span class="num">${c.join}</span>`],
  ]), { ft: U.btn('정보 수정', { href: 'CU-03', w: true }) })}

  ${U.card('등급·태그', `
    ${U.field('등급', U.select(등급, 0))}
    ${U.field('태그', `${U.chips([...c.tags, '+ 태그 추가'], [0, 1])}`)}
    ${U.btn('변경 저장', { cls: 'btn-pri', w: true, attr: ' data-toast="등급과 태그를 저장했어요" data-toast-kind="ok"' })}`)}

  ${U.card('빠른 작업', `<div class="btns-v">
    ${U.btn('알림 보내기', { href: 'MK-01', w: true })}
    ${U.btn('예약 잡기', { href: 'BK-03', w: true })}
  </div>`)}`)}`,
  };
};

PAGES['CU-03'] = () => ({
  body: `${U.pageHd('고객 등록', '이름과 연락처만 있으면 등록됩니다. 나머지는 나중에 채워도 돼요.')}

<div style="max-width:720px">
  ${U.card('기본 정보', `
    <div class="f2">
      ${U.field('이름', U.input({ ph: '홍길동' }), { req: true })}
      ${U.field('연락처', U.input({ type: 'tel', ph: '010-0000-0000', cls: 'is-err' }), { req: true, err: '이미 등록된 번호예요 — 김서연(C-2417)과 같습니다.' })}
    </div>
    ${U.field('이메일', U.input({ type: 'email', ph: 'name@example.com' }), { hint: '영수증·리포트를 보낼 때 씁니다.' })}
    <div class="f2">
      ${U.field('성별', U.select(['선택 안 함', '여성', '남성'], 0))}
      ${U.field('생년월일', U.input({ type: 'date' }), { hint: '생일 축하 알림에 씁니다.' })}
    </div>`)}

  ${U.card('분류', `
    <div class="f2">
      ${U.field('등급', U.select(등급, 2))}
      ${U.field('담당 직원', U.select(STAFF.filter((s) => s.st === '재직').map((s) => s.nm), 0))}
    </div>
    ${U.field('태그', `${U.input({ ph: '태그를 입력하면 자동완성됩니다' })}
      <div class="mt3">${U.chips(['펌', '염색', '클리닉', '민감두피', '첫방문'], -1)}</div>`)}
    ${U.field('관리자 메모', U.textarea({ ph: '주의할 점, 선호하는 스타일 등' }))}`, { cls: 'mt6' })}

  ${U.card('동의', `
    ${U.check('마케팅 정보 수신에 동의합니다', { sub: '쿠폰·이벤트 알림을 보낼 수 있습니다. 동의하지 않아도 예약 안내는 갑니다.' })}
    ${U.check('개인정보 수집·이용에 동의합니다', { sub: '이름·연락처를 예약 관리 목적으로 보관합니다. 탈퇴 시 즉시 파기합니다.', attr: ' data-unlock="save"' })}`, { cls: 'mt6' })}

  <div class="btns mt8" style="justify-content:flex-end">
    ${U.btn('취소', { href: 'CU-01' })}
    ${U.btn('저장', { cls: 'btn-pri', id: 'save', off: true, attr: ' data-toast="고객을 등록했어요" data-toast-kind="ok"' })}
  </div>
  <p class="t-sub mt4" style="text-align:right">개인정보 동의에 체크하면 저장 버튼이 열립니다.</p>
</div>`,
});

PAGES['CU-04'] = () => ({
  body: `${U.pageHd('고객 목록', '검색 결과가 없습니다')}

${U.listPage(필터(), `
  <div class="filters">
    <input class="in search" type="search" value="김철수" aria-label="검색어">
    ${U.select(['최근 방문순', '누적 구매액순', '이름순'], 0)}
    ${U.btn('검색', { attr: ' data-toast="검색했어요"' })}
  </div>

  ${U.empty('◍', '「김철수」와 맞는 고객이 없어요',
    '이름 일부만 넣거나 연락처 뒤 4자리로 찾아 보세요. 등급 필터가 걸려 있으면 결과가 줄어듭니다.',
    `${U.btn('필터 초기화', { href: 'CU-01', cls: 'btn-pri' })}${U.btn('신규 고객 등록', { href: 'CU-03' })}`)}

  ${U.card('찾는 팁', `<ul class="stack">
    <li>· 이름은 <b>일부만</b> 넣어도 됩니다 — 「서연」으로도 찾힙니다.</li>
    <li>· 연락처는 <b>뒤 4자리</b>만 넣어도 됩니다.</li>
    <li>· 등급·담당 직원 필터가 켜져 있으면 결과가 줄어듭니다.</li>
  </ul>`, { cls: 'mt8' })}

  ${U.sec('최근 등록한 고객', U.table(['이름', '연락처', '등급', '등록일'],
    CUSTOMERS.slice(-3).map((c) => ({ href: 'CU-02', cells: [`<b>${c.nm}</b>`, `<span class="num">${c.tel}</span>`, U.stBadge(c.gr), `<span class="num">${c.join}</span>`] }))),
    { cls: 'mt8' })}`)}`,
});
