/* TM 직원·권한 (3) · SE 설정 (4) */
import * as U from './ui.mjs';
import { STAFF, LOGS, PRODUCTS } from './data.mjs';

export const PAGES = {};

const 메뉴권한 = ['대시보드', '고객 관리', '예약·일정', '주문·매출', '상품·재고', '메시지·알림', '통계·리포트', '직원·권한', '설정'];

/* ============================================================
   TM 직원·권한
   ============================================================ */

PAGES['TM-01'] = () => ({
  body: `${U.pageHd('직원 목록', `재직 ${STAFF.filter((s) => s.st === '재직').length}명 · 휴직 ${STAFF.filter((s) => s.st === '휴직').length}명`,
    `${U.btn('활동 로그', { href: 'TM-03' })}${U.btn('직원 초대', { cls: 'btn-pri', href: 'TM-02' })}`)}

<div class="filters">
  <input class="in search" type="search" placeholder="이름 또는 이메일로 검색">
  ${U.select(['권한 전체', '관리자', '매니저', '일반'], 0)}
  ${U.select(['재직 상태 전체', '재직', '휴직', '퇴사'], 0)}
</div>

${U.table(
  [{ t: '', w: '40px' }, '이름', { t: '역할', w: '80px' }, '이메일',
   { t: '권한', w: '72px' }, { t: '재직', w: '68px' },
   { t: '담당 고객', w: '78px', cls: 'r' }, { t: '오늘 예약', w: '78px', cls: 'r' },
   { t: '최근 접속', w: '124px' }, { t: '', w: '124px' }],
  STAFF.map((s) => [
    U.av(s.nm), `<b>${s.nm}</b>`, s.role, `<span class="sub">${s.mail}</span>`,
    U.stBadge(s.grade), U.stBadge(s.st),
    { t: `<span class="num">${s.cust}</span>`, cls: 'r' },
    { t: `<span class="num">${s.bk}</span>`, cls: 'r' },
    `<span class="num sub">${s.last}</span>`,
    `<div class="row" style="gap:4px">${U.btn('권한 수정', { sm: true, href: 'TM-02' })}${U.btn('비활성화', { sm: true, cls: 'btn-dan', attr: ` data-toast="${s.nm} 계정을 비활성화했어요"` })}</div>`,
  ]),
)}

<div class="g2 mt8">
  ${U.card('권한 등급이 하는 일', U.table(['등급', '무엇을 할 수 있나'], [
    [U.stBadge('관리자'), '모든 메뉴. 정산·환불·권한 변경까지 할 수 있습니다.'],
    [U.stBadge('매니저'), '고객·예약·주문·상품. 정산 설정과 권한 변경은 못 합니다.'],
    [U.stBadge('일반'), '자기 담당 고객과 예약만. 통계와 설정은 안 보입니다.'],
  ]))}
  ${U.card('근무 시간', `<p class="t-sub mb4">직원마다 일하는 요일과 시간을 정해 두면, 예약 캘린더에서 <b>그 시간에만</b> 예약을 잡을 수 있습니다.</p>
    ${U.table(['직원', '근무 요일', { t: '시간', w: '112px' }], STAFF.filter((s) => s.st === '재직').map((s) => [s.nm, '월·화·수·목·금', '<span class="num">10:00~19:00</span>']))}
    <div class="mt4">${U.btn('근무 시간 설정', { w: true, href: 'TM-02' })}</div>`)}
</div>`,
});

PAGES['TM-02'] = () => ({
  body: `${U.pageHd('직원 초대', '이메일을 보내면 그 사람이 스스로 비밀번호를 정합니다.')}

<div class="split-r">
  <div>
    ${U.card('누구를', `
      ${U.field('이메일', U.input({ type: 'email', ph: 'name@salon.example' }), { req: true, hint: '이 주소로 초대 메일이 갑니다.' })}
      <div class="f2">
        ${U.field('이름', U.input({ ph: '홍길동' }), { req: true })}
        ${U.field('역할', U.select(['디자이너', '원장', '인턴', '리셉션'], 0))}
      </div>`)}

    ${U.card('권한 등급', `
      <div class="stack">
        ${U.check('관리자 — 모든 메뉴. 정산·환불·권한 변경까지', { none: true })}
        ${U.check('매니저 — 고객·예약·주문·상품. 정산과 권한 변경은 못 함', { on: true, none: true })}
        ${U.check('일반 — 자기 담당 고객과 예약만', { none: true })}
      </div>`, { cls: 'mt6' })}

    ${U.card('메뉴별로 더 세밀하게', U.table(
      ['메뉴', { t: '보기', w: '60px', cls: 'c' }, { t: '편집', w: '60px', cls: 'c' }, { t: '삭제', w: '60px', cls: 'c' }],
      메뉴권한.map((m, i) => [
        m,
        { t: `<input type="checkbox" ${i < 7 ? 'checked' : ''} aria-label="${m} 보기">`, cls: 'c' },
        { t: `<input type="checkbox" ${i < 5 ? 'checked' : ''} aria-label="${m} 편집">`, cls: 'c' },
        { t: `<input type="checkbox" ${i < 2 ? 'checked' : ''} aria-label="${m} 삭제">`, cls: 'c' },
      ]),
    ), { cls: 'mt6', aside: U.btn('등급 기본값으로', { sm: true, attr: ' data-toast="매니저 기본값으로 되돌렸어요"' }) })}

    ${U.card('담당 범위와 근무', `
      ${U.field('담당 고객', U.select(['담당 지정 안 함', '내가 예약받은 고객만', '특정 등급만'], 0))}
      ${U.field('근무 요일', `<div class="chips">${['월', '화', '수', '목', '금', '토', '일'].map((d, i) => `<button class="chip${i < 5 ? ' on' : ''}" type="button">${d}</button>`).join('')}</div>`)}
      <div class="f2">
        ${U.field('출근', U.input({ type: 'time', v: '10:00' }))}
        ${U.field('퇴근', U.input({ type: 'time', v: '19:00' }))}
      </div>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack">
    ${U.card('이 사람에게 보일 화면', `<div class="stack">
      ${메뉴권한.map((m, i) => `<div class="row-b"><span class="${i < 7 ? '' : 'muted'}">${m}</span>${i < 7 ? U.badge(i < 5 ? '편집' : '보기만', i < 5 ? 'b-ok' : 'b-mut') : U.badge('안 보임', 'b-mut')}</div>`).join('')}
    </div>`, {
      ft: `<div class="btns-v">
        ${U.btn('초대 메일 보내기', { cls: 'btn-pri', w: true, attr: ' data-toast="초대 메일을 보냈어요. 7일 안에 가입해야 합니다" data-toast-kind="ok"' })}
        ${U.btn('목록으로', { href: 'TM-01', w: true })}
      </div>`,
    })}
    ${U.banner('info', 'ℹ', '권한을 바꾸면 <b>활동 로그에 남습니다.</b> 누가 언제 무엇을 열어 줬는지 나중에 볼 수 있어요.')}
  </div>
</div>`,
});

PAGES['TM-03'] = () => ({
  body: `${U.pageHd('활동 로그', '누가 언제 무엇을 바꿨는지 남습니다.',
    `${U.btn('직원 목록', { href: 'TM-01' })}${U.btn('로그 내보내기', { attr: ' data-toast="활동 로그를 내려받았어요" data-toast-kind="ok"' })}`)}

<div class="filters">
  ${U.select(['직원 전체', ...STAFF.map((s) => s.nm)], 0)}
  ${U.select(['유형 전체', '환불', '삭제', '권한변경', '정산', '로그인'], 0)}
  ${U.input({ type: 'date', v: '2026-08-01' })}
  ${U.input({ type: 'date', v: '2026-08-10' })}
  <input class="in search" type="search" placeholder="대상으로 검색">
</div>

${U.banner('warn', '⚠', '<b>민감한 활동</b>(환불·삭제·권한 변경·정산)은 진하게 표시됩니다. 낯선 기록이 있으면 그 직원에게 확인해 주세요.')}

<div class="mt6">${U.table(
  [{ t: '일시', w: '128px' }, { t: '직원', w: '76px' }, { t: '행위', w: '112px' }, '대상', '바뀐 값', { t: '', w: '64px' }],
  LOGS.map((l) => ({
    cls: l.hot ? 'warn' : '',
    cells: [
      `<span class="num sub">${l.at}</span>`,
      `<div class="row" style="gap:5px">${U.av(l.who)}${l.who}</div>`,
      l.hot ? `<b>${l.act}</b> ⚠` : l.act,
      l.tgt,
      `<span class="sub">${l.diff}</span>`,
      l.hot ? U.badge('민감', 'b-dan') : '',
    ],
  })),
)}</div>

<div class="g2 mt8">
  ${U.card('접속 기록', U.table(['일시', '직원', 'IP', '기기'], [
    ['<span class="num sub">2026-08-10 09:12</span>', '박지우', '<span class="num">203.0.113.24</span>', 'Chrome · Windows'],
    ['<span class="num sub">2026-08-10 08:47</span>', '최민서', '<span class="num">203.0.113.31</span>', 'Safari · iPhone'],
    ['<span class="num sub">2026-08-09 22:04</span>', '김도윤', '<span class="num">198.51.100.7</span>', 'Chrome · Android'],
  ]), { aside: U.btn('전체 보기', { sm: true, attr: ' data-toast="접속 기록 전체를 엽니다"' }) })}

  ${U.card('이상하게 보이는 것', `
    ${U.banner('dan', '!', '<b>김도윤</b> 님이 8/9 22:04 에 처음 보는 IP(198.51.100.7)로 접속했습니다.')}
    <p class="t-sub mt4">평소 쓰던 곳과 다른 주소에서 들어온 기록입니다. 본인이 맞는지 확인하고,
    아니라면 그 계정의 비밀번호를 바꾸게 하세요.</p>
    <div class="btns mt4">${U.btn('이 직원에게 확인 요청', { attr: ' data-toast="확인 요청을 보냈어요" data-toast-kind="ok"' })}${U.btn('계정 비활성화', { cls: 'btn-dan', attr: ' data-toast="계정을 비활성화했어요"' })}</div>`)}
</div>`,
});

/* ============================================================
   SE 설정
   ============================================================ */

PAGES['SE-01'] = () => ({
  body: `${U.pageHd('사업장 정보', '영수증·알림·예약 화면에 이 값이 그대로 나갑니다.',
    `${U.btn('결제·정산 설정', { href: 'SE-02' })}${U.btn('알림 설정', { href: 'SE-03' })}`)}

<div class="split-r">
  <div>
    ${U.card('기본', `
      <div class="f2">
        ${U.field('사업장명', U.input({ v: '살롱드무드 강남점' }), { req: true })}
        ${U.field('업종', U.select(['미용실', '네일샵', '피부관리', '공방', '학원', '기타'], 0))}
      </div>
      <div class="f2">
        ${U.field('대표자', U.input({ v: '박지우' }), { req: true })}
        ${U.field('사업자등록번호', U.input({ v: '123-45-67890' }), { req: true, hint: '세금계산서 발행에 씁니다.' })}
      </div>
      ${U.field('주소', `<div class="in-row">${U.input({ v: '서울 강남구 테헤란로 000, 3층' })}${U.btn('주소 찾기', { attr: ' data-toast="주소 검색창을 엽니다"' })}</div>`, { req: true })}
      ${U.field('전화', U.input({ type: 'tel', v: '02-000-0000' }), { req: true })}`)}

    ${U.card('브랜드', `
      <div class="row" style="gap:var(--sp-card-pad);align-items:flex-start">
        <div style="width:120px">${U.ph(['로고', 400, 400], { seed: 'logo' })}</div>
        <div class="grow">
          ${U.field('브랜드 색상', `<div class="in-row"><input class="in" type="text" value="#111111" aria-label="브랜드 색상 코드"><input type="color" value="#111111" style="width:44px;height:36px;border:1px solid var(--border);border-radius:var(--r-in);background:var(--surface)" aria-label="색 고르기"></div>`,
            { hint: '예약 화면과 알림톡에 쓰입니다.' })}
          <p class="t-sub">로고는 정사각 400×400 이상을 권합니다. 배경이 투명한 PNG가 가장 깔끔해요.</p>
        </div>
      </div>`, { cls: 'mt6' })}

    ${U.card('영업시간', `
      ${U.table(['요일', { t: '영업', w: '60px', cls: 'c' }, { t: '여는 시간', w: '112px' }, { t: '닫는 시간', w: '112px' }],
        ['월', '화', '수', '목', '금', '토', '일'].map((d, i) => [
          d,
          { t: U.toggle(i !== 6, `${d}요일 영업 여부를 바꿨어요`), cls: 'c' },
          `<input class="in" type="time" value="10:00" aria-label="${d}요일 여는 시간"${i === 6 ? ' disabled' : ''}>`,
          `<input class="in" type="time" value="${i === 5 ? '17:00' : '19:00'}" aria-label="${d}요일 닫는 시간"${i === 6 ? ' disabled' : ''}>`,
        ]))}
      ${U.field('휴무일', `${U.input({ ph: '2026-08-15, 2026-09-28 …' })}
        <div class="mt3">${U.chips(['2026-08-15 (광복절)', '매주 일요일'], [0, 1])}</div>`, { cls: 'mt6' })}`, { cls: 'mt6' })}

    ${U.card('예약 정책', `
      <div class="f2">
        ${U.field('예약 단위', U.select(['30분', '15분', '60분'], 0), { hint: '캘린더가 이 단위로 쪼개집니다.' })}
        ${U.field('같은 시간 동시 예약 수', U.select(['1건', '2건', '3건', '제한 없음'], 0), { hint: '직원 수보다 많이 두면 겹칩니다.' })}
      </div>
      ${U.check('당일 예약을 받습니다', { on: true })}
      ${U.check('고객이 스스로 예약을 취소할 수 있습니다', { on: true, sub: '방문 24시간 전까지만 가능합니다.' })}`, { cls: 'mt6' })}

    ${U.card('지점', U.table(['지점명', '주소', { t: '상태', w: '68px' }, { t: '', w: '64px' }], [
      ['<b>강남점</b> (본점)', '서울 강남구 테헤란로 000', U.badge('운영중', 'b-ok'), U.btn('수정', { sm: true, attr: ' data-toast="지점 정보를 엽니다"' })],
      ['판교점', '경기 성남시 분당구 000', U.badge('준비중', 'b-warn'), U.btn('수정', { sm: true, attr: ' data-toast="지점 정보를 엽니다"' })],
    ]), { cls: 'mt6', aside: U.btn('+ 지점 추가', { sm: true, attr: ' data-toast="지점을 추가합니다"' }) })}
  </div>

  <div class="sticky stack">
    ${U.card('', `<div class="btns-v">
      ${U.btn('저장', { cls: 'btn-pri', w: true, attr: ' data-toast="사업장 정보를 저장했어요" data-toast-kind="ok"' })}
      ${U.btn('되돌리기', { w: true, attr: ' data-toast="마지막 저장 상태로 되돌렸어요"' })}
    </div>`)}
    ${U.card('변경 이력', U.timeline([
      { k: 'on', t: '영업시간 변경', d: '토요일 18:00 → 17:00<br>2026-08-01 · 박지우' },
      { k: 'done', t: '주소 변경', d: '2층 → 3층<br>2026-06-14 · 박지우' },
    ]), { ft: `<a class="t-sub" href="${U.link('TM-03')}"><b>활동 로그에서 전체 보기 ›</b></a>` })}
  </div>
</div>`,
});

PAGES['SE-02'] = () => ({
  body: `${U.pageHd('결제·정산 설정', '돈이 들어오고 나가는 길을 정합니다.', U.btn('사업장 정보', { href: 'SE-01' }))}

<div class="split-r">
  <div>
    ${U.card('결제 수단', U.table(['수단', { t: '연동 상태', w: '92px' }, '메모', { t: '', w: '84px' }], [
      ['카드 (PG)', U.badge('연동됨', 'b-ok'), '토스페이먼츠 · 수수료 2.9%', U.btn('설정', { sm: true, attr: ' data-toast="PG 설정을 엽니다"' })],
      ['간편결제', U.badge('연동됨', 'b-ok'), '카카오페이 · 네이버페이', U.btn('설정', { sm: true, attr: ' data-toast="간편결제 설정을 엽니다"' })],
      ['현금영수증', U.badge('연동 안 됨', 'b-warn'), '<b>발행하려면 연동이 필요합니다</b>', U.btn('연동하기', { sm: true, cls: 'btn-pri', attr: ' data-toast="현금영수증 연동을 시작합니다"' })],
      ['계좌이체', U.badge('사용', 'b-mut'), '수동 확인 — 입금을 직접 확인해야 합니다', U.btn('설정', { sm: true, attr: ' data-toast="계좌 설정을 엽니다"' })],
    ]))}

    ${U.card('정산 계좌', `
      <div class="f2">
        ${U.field('은행', U.select(['국민은행', '신한은행', '우리은행', '하나은행', '카카오뱅크'], 0), { req: true })}
        ${U.field('예금주', U.input({ v: '박지우' }), { req: true })}
      </div>
      ${U.field('계좌번호', U.input({ v: '000000-00-000000' }), { req: true, hint: '사업자등록증상 대표자 명의여야 정산됩니다.' })}
      ${U.field('정산 주기', U.select(['주 1회 (매주 화요일)', '매일', '월 2회 (1일·16일)', '월 1회 (말일)'], 0))}`, { cls: 'mt6' })}

    ${U.card('세금·영수증', `
      ${U.check('세금계산서를 발행합니다', { on: true, sub: '사업자 고객이 요청하면 자동 발행합니다.' })}
      ${U.check('현금 결제 시 현금영수증을 자동 발행합니다', { sub: '현금영수증 연동을 먼저 해 주세요.' })}
      <div class="f2 mt4">
        ${U.field('부가세', U.select(['가격에 포함 (내부거래)', '가격에 별도 표시'], 0))}
        ${U.field('PG 수수료 부담', U.select(['매장 부담', '고객 부담'], 0))}
      </div>`, { cls: 'mt6' })}

    ${U.card('쿠폰·적립', `
      ${U.check('적립금을 씁니다', { on: true, sub: '결제 금액의 일부를 다음에 쓸 수 있게 쌓아 줍니다.' })}
      <div class="f2 mt4">
        ${U.field('적립률', U.input({ v: '3' }), { hint: '결제액의 몇 %를 쌓아 줄지' })}
        ${U.field('최소 사용 금액', U.input({ v: '5,000' }), { hint: '이 금액부터 쓸 수 있습니다' })}
      </div>`, { cls: 'mt6' })}

    ${U.card('환불 규정 문구', `
      ${U.textarea({ v: '방문 24시간 전까지 취소하시면 전액 환불됩니다.\n24시간 이내 취소 시 결제액의 30%가 위약금으로 차감됩니다.\n노쇼(연락 없이 안 오심) 시 환불되지 않습니다.' })}
      <p class="t-sub mt3">이 문구가 <b>예약 화면과 영수증</b>에 그대로 나갑니다. 미리 알리지 않은 위약금은 받을 수 없으니 꼭 적어 두세요.</p>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack">
    ${U.card('연동 상태', `<div class="stack">
      <div class="row-b"><span>카드 (PG)</span>${U.badge('정상', 'b-ok')}</div>
      <div class="row-b"><span>간편결제</span>${U.badge('정상', 'b-ok')}</div>
      <div class="row-b"><span>현금영수증</span>${U.badge('연동 안 됨', 'b-warn')}</div>
      <div class="row-b"><span>정산 계좌</span>${U.badge('확인됨', 'b-ok')}</div>
    </div>`, { ft: U.btn('저장', { cls: 'btn-pri', w: true, attr: ' data-toast="결제·정산 설정을 저장했어요" data-toast-kind="ok"' }) })}
    ${U.card('다음 정산', `${U.sumRows([['정산 예정일', '2026-08-12 (화)'], ['정산 예정액', '<span class="num">2,418,000원</span>'], ['PG 수수료', '<span class="num">-70,122원</span>']], ['입금 예정', '<span class="num">2,347,878원</span>'])}`)}
  </div>
</div>`,
});

PAGES['SE-03'] = () => ({
  body: `${U.pageHd('알림 설정', '나에게 올 알림과, 손님에게 나갈 알림을 따로 정합니다.', U.btn('사업장 정보', { href: 'SE-01' }))}

<div class="split-r">
  <div>
    ${U.card('나에게 오는 알림', U.table(
      ['무슨 일이 있을 때', { t: '앱', w: '56px', cls: 'c' }, { t: '이메일', w: '64px', cls: 'c' }, { t: '문자', w: '56px', cls: 'c' }],
      [['새 예약', 1, 1, 0], ['새 주문', 1, 1, 0], ['예약 취소·노쇼', 1, 0, 1], ['재고 부족', 1, 1, 0], ['새 문의', 1, 0, 0]]
        .map(([t, a, b, c]) => [t,
          { t: U.toggle(!!a, `${t} 앱 알림을 바꿨어요`), cls: 'c' },
          { t: U.toggle(!!b, `${t} 이메일 알림을 바꿨어요`), cls: 'c' },
          { t: U.toggle(!!c, `${t} 문자 알림을 바꿨어요`), cls: 'c' }]),
    ))}

    ${U.card('손님에게 나가는 알림', U.table(
      ['언제', { t: '보냄', w: '56px', cls: 'c' }, { t: '시점', w: '188px' }, { t: '문구', w: '84px' }],
      [
        ['예약 확정', 1, '저장 즉시', U.btn('보기', { sm: true, href: 'MK-04' })],
        ['방문 하루 전 리마인드', 1, '<select class="sel" aria-label="리마인드 시점"><option>전날 18:00</option><option>전날 20:00</option><option>당일 09:00</option></select>', U.btn('보기', { sm: true, href: 'MK-04' })],
        ['노쇼 방지 확인', 0, '<select class="sel" aria-label="노쇼 확인 시점"><option>1시간 전</option><option>2시간 전</option></select>', U.btn('보기', { sm: true, href: 'MK-04' })],
        ['생일 축하', 1, '생일 당일 10:00', U.btn('보기', { sm: true, href: 'MK-04' })],
      ].map(([t, on, when, lk]) => [t, { t: U.toggle(!!on, `${t} 알림을 바꿨어요`), cls: 'c' }, when, lk]),
    ), { cls: 'mt6' })}

    ${U.card('보내지 않는 시간', `
      ${U.check('야간에는 광고성 메시지를 보내지 않습니다', { on: true, sub: '법으로 21시~08시 광고 발송이 금지되어 있습니다. 예약 안내는 이 시간에도 나갑니다.' })}
      <div class="f2 mt4">
        ${U.field('시작', U.input({ type: 'time', v: '21:00' }))}
        ${U.field('끝', U.input({ type: 'time', v: '08:00' }))}
      </div>`, { cls: 'mt6' })}

    ${U.card('담당자별 알림', `<p class="t-sub mb4">직원마다 «자기 담당 고객»의 예약 알림만 받게 할 수 있습니다.</p>
      ${U.table(['직원', { t: '자기 담당만', w: '92px', cls: 'c' }, { t: '전체 받기', w: '80px', cls: 'c' }],
        STAFF.filter((s) => s.st === '재직').map((s, i) => [s.nm,
          { t: U.toggle(i > 0, `${s.nm} 알림 범위를 바꿨어요`), cls: 'c' },
          { t: U.toggle(i === 0, `${s.nm} 전체 알림을 바꿨어요`), cls: 'c' }]))}`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack">
    ${U.card('발송 잔액', `
      ${U.sumRows([['남은 잔액', '<span class="num">48,200원</span>'], ['이번 달 쓴 돈', '<span class="num">4,170원</span>'], ['알림톡 건당', '<span class="num">13원</span>']])}
      ${U.progress(48, 'ok')}
      <p class="t-sub mt3">이 속도면 <b>약 2개월</b> 씁니다.</p>`, {
        ft: `${U.check('잔액이 10,000원 아래로 내려가면 자동 충전', { sub: '등록된 카드로 50,000원씩 충전합니다.' })}
             <div class="mt4">${U.btn('충전하기', { cls: 'btn-pri', w: true, attr: ' data-toast="충전 화면을 엽니다"' })}</div>`,
      })}
    ${U.card('', U.btn('저장', { cls: 'btn-pri', w: true, attr: ' data-toast="알림 설정을 저장했어요" data-toast-kind="ok"' }))}
  </div>
</div>`,
});

PAGES['SE-04'] = () => ({
  body: `${U.pageHd('내 계정', '박지우 · 원장 · 관리자 권한')}

<div style="max-width:760px">
  ${U.card('프로필', `
    <div class="row" style="gap:var(--sp-card-pad);align-items:flex-start">
      <div style="width:96px">${U.ph(['프로필 사진', 400, 400], { seed: 'me', cls: 'ph-round' })}</div>
      <div class="grow">
        <div class="f2">
          ${U.field('이름', U.input({ v: '박지우' }), { req: true })}
          ${U.field('연락처', U.input({ type: 'tel', v: '010-1234-5678' }))}
        </div>
        ${U.field('이메일', U.input({ type: 'email', v: 'jiwoo@salon.example', off: true }), { hint: '로그인에 쓰는 주소라 바꾸려면 원장 권한이 필요합니다.' })}
      </div>
    </div>`)}

  ${U.card('보안', `
    ${U.field('비밀번호 변경', `<div class="stack">
      ${U.input({ type: 'password', ph: '지금 비밀번호' })}
      ${U.input({ type: 'password', ph: '새 비밀번호 (8자 이상, 숫자·영문 섞어서)' })}
      ${U.input({ type: 'password', ph: '새 비밀번호 다시' })}
    </div>`)}
    <div class="btns mb6">${U.btn('비밀번호 바꾸기', { cls: 'btn-pri', attr: ' data-toast="비밀번호를 바꿨어요. 다른 기기는 다시 로그인해야 합니다" data-toast-kind="ok"' })}</div>
    <div class="row-b">
      <div>
        <div class="strong">2단계 인증</div>
        <div class="t-sub">로그인할 때 문자로 온 숫자를 한 번 더 넣습니다. 계정 도용을 크게 줄여 줍니다.</div>
      </div>
      ${U.toggle(false, '2단계 인증을 켰어요')}
    </div>`, { cls: 'mt6' })}

  ${U.card('접속 중인 기기', U.table(['기기', '위치', { t: '마지막 접속', w: '124px' }, { t: '', w: '84px' }], [
    ['<b>Chrome · Windows</b> ' + U.badge('지금 이 기기', 'b-ok'), '서울', '<span class="num sub">2026-08-10 09:12</span>', ''],
    ['Safari · iPhone', '서울', '<span class="num sub">2026-08-09 21:40</span>', U.btn('로그아웃', { sm: true, cls: 'btn-dan', attr: ' data-toast="그 기기에서 로그아웃했어요"' })],
  ]), { cls: 'mt6', aside: U.btn('다른 기기 모두 로그아웃', { sm: true, attr: ' data-toast="이 기기만 남기고 모두 로그아웃했어요" data-toast-kind="ok"' }) })}

  ${U.card('개인 설정', `
    <div class="f2">
      ${U.field('언어', U.select(['한국어', 'English'], 0))}
      ${U.field('시간대', U.select(['(GMT+9) 서울', '(GMT+0) 런던'], 0))}
    </div>
    ${U.check('내 알림을 이메일로도 받기', { on: true })}`, { cls: 'mt6' })}

  ${U.card('계정 정리', `
    <p class="t-sub">탈퇴하면 <b>내 계정만</b> 사라집니다. 사업장 데이터(고객·예약·주문)는 남습니다.
    사업장 자체를 닫으려면 원장 계정으로 <a href="${U.link('SE-01')}"><b>사업장 정보</b></a>에서 처리해 주세요.</p>
    <div class="btns mt4">${U.btn('탈퇴 안내 보기', { attr: ' data-modal="m-quit"' })}</div>`, { cls: 'mt6' })}

  <div class="btns mt8" style="justify-content:flex-end">
    ${U.btn('저장', { cls: 'btn-pri', attr: ' data-toast="내 계정 정보를 저장했어요" data-toast-kind="ok"' })}
    ${U.btn('로그아웃', { href: 'AC-01' })}
  </div>
</div>

${U.modal('m-quit', '탈퇴하면 이렇게 됩니다',
  `<ul class="stack">
    <li>· 내 계정으로는 더 이상 로그인할 수 없습니다.</li>
    <li>· 내가 남긴 <b>활동 로그와 메모는 남습니다</b> — 누가 무엇을 했는지 기록이라 지울 수 없습니다.</li>
    <li>· 담당으로 지정된 고객은 <b>담당 없음</b>이 됩니다.</li>
    <li>· 되돌릴 수 없습니다.</li>
  </ul>`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('탈퇴 신청', { cls: 'btn-dan', attr: ' data-dismiss data-toast="탈퇴 신청을 접수했어요. 원장 승인 후 처리됩니다"' })}`)}`,
});
