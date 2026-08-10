/* MK 메시지·알림 (4) */
import * as U from './ui.mjs';
import { SENDS, TEMPLATES, CUSTOMERS } from './data.mjs';

export const PAGES = {};

PAGES['MK-01'] = () => ({
  body: `${U.pageHd('알림 발송', '문자·알림톡·이메일로 손님에게 소식을 보냅니다.', U.btn('발송 이력', { href: 'MK-02' }))}

<div class="split-r">
  <div>
    ${U.card('보낼 방법', `
      ${U.tabs([{ label: '알림톡' }, { label: '문자' }, { label: '이메일' }], 0, { pill: true })}
      <p class="t-sub mt4">알림톡이 가장 쌉니다(건당 13원). 실패하면 문자로 자동 전환할 수 있어요.</p>
      ${U.check('알림톡 실패 시 문자로 다시 보내기', { on: true, sub: '문자 전환 시 건당 19원이 듭니다.' })}`)}

    ${U.card('받는 사람', `
      <div class="stack mb4">
        ${U.check('개별 선택 — 고객 목록에서 고른 사람', { none: true })}
        ${U.check('세그먼트 — 조건에 맞는 사람 전부', { on: true, none: true })}
        ${U.check('전체 고객', { none: true })}
      </div>
      ${U.field('조건', `<div class="f2">${U.select(['등급 — VIP', '등급 — 단골', '등급 — 신규', '등급 — 휴면'], 0)}${U.select(['최근 방문 90일 이상', '최근 방문 30일 이내', '생일이 이번 달'], 0)}</div>`)}
      ${U.banner('info', '👥', '대상 <b>2명</b> · 예상 비용 <b>26원</b> — 조건을 바꾸면 다시 셉니다.', {
        right: U.btn('대상 보기', { sm: true, href: 'CU-01' }),
      })}`, { cls: 'mt6' })}

    ${U.card('내용', `
      <div class="row-b mb4">
        ${U.select(TEMPLATES.map((t) => t.nm), 4)}
        ${U.btn('템플릿 관리', { sm: true, href: 'MK-04' })}
      </div>
      ${U.field('제목', U.input({ v: '오랜만이에요, #{고객명}님' }))}
      ${U.field('본문', U.textarea({ v: '#{고객명}님, 마지막 방문 후 벌써 3개월이 지났어요.\n이번 달에 오시면 두피 진단을 무료로 해 드립니다.\n\n예약 → salon.example/book' }))}
      <div class="row wrap-row mb4">
        <span class="t-sub">넣을 수 있는 값:</span>
        ${U.chips(['#{고객명}', '#{예약일시}', '#{담당자}', '#{매장명}'], -1, { extra: ' data-toast="본문에 넣었어요"' })}
      </div>
      ${U.banner('warn', 'ℹ', '광고성 메시지에는 <b>수신거부 안내</b>가 자동으로 붙습니다. 법으로 정해진 것이라 뺄 수 없습니다.')}`, { cls: 'mt6' })}

    ${U.card('보낼 때', `
      <div class="stack mb4">
        ${U.check('지금 바로 보내기', { on: true, none: true })}
        ${U.check('예약 발송', { none: true })}
      </div>
      <div class="f2">${U.input({ type: 'date', v: '2026-08-12' })}${U.input({ type: 'time', v: '09:00' })}</div>
      <p class="t-sub mt3">야간(21시~08시)에는 광고성 메시지를 보낼 수 없습니다. <a href="${U.link('SE-03')}"><b>알림 설정</b></a>에서 시간을 정합니다.</p>`, { cls: 'mt6' })}
  </div>

  <div class="sticky stack">
    ${U.card('미리보기', `
      <div class="box" style="background:var(--bg)">
        <div class="t-sub mb2">알림톡 · 살롱드무드 강남점</div>
        <p style="white-space:pre-line;line-height:var(--lh-body)">오랜만이에요, 김서연님

김서연님, 마지막 방문 후 벌써 3개월이 지났어요.
이번 달에 오시면 두피 진단을 무료로 해 드립니다.

예약 → salon.example/book</p>
        <p class="t-sub mt4" style="border-top:1px solid var(--border);padding-top:8px">무료수신거부 080-000-0000</p>
      </div>`)}

    ${U.card('보내기', `
      ${U.sumRows([['대상', '2명'], ['채널', '알림톡'], ['건당', '13원']], ['예상 비용', '<span class="num">26원</span>'])}
      <p class="t-sub mt3">남은 잔액 <b class="num">48,200원</b></p>`, {
        ft: `<div class="btns-v">
          ${U.btn('나에게 테스트 발송', { w: true, attr: ' data-toast="원장님 번호로 테스트를 보냈어요" data-toast-kind="ok"' })}
          ${U.btn('발송', { cls: 'btn-pri', w: true, attr: ' data-modal="m-send"' })}
        </div>`,
      })}
  </div>
</div>

${U.modal('m-send', '2명에게 보냅니다',
  `<p>알림톡으로 <b>2명</b>에게 보냅니다. 예상 비용 <b>26원</b>.</p>
   <p class="t-sub mt4">보낸 뒤에는 취소할 수 없습니다. 미리보기를 한 번 더 확인해 주세요.</p>`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('보내기', { cls: 'btn-pri', attr: ' data-dismiss data-toast="2명에게 보냈어요" data-toast-kind="ok"' })}`)}`,
});

PAGES['MK-02'] = () => ({
  body: `${U.pageHd('발송 이력', '최근 30일 · 4건', U.btn('새 발송', { cls: 'btn-pri', href: 'MK-01' }))}

${U.statRow([
  ['4건', '발송'],
  ['540건', '보낸 수'],
  ['216건', '성공', { cls: 'ok' }],
  ['6건', '실패', { cls: 'warn' }],
], 'g4 mb6')}

<div class="filters">
  ${U.select(['최근 30일', '오늘', '최근 7일', '이번 달'], 0)}
  ${U.select(['채널 전체', '알림톡', '문자', '이메일'], 0)}
  ${U.select(['상태 전체', '발송완료', '발송실패', '예약대기'], 0)}
  ${U.btn('실패만 모아보기', { attr: ' data-toast="실패한 건만 걸렀어요"' })}
</div>

${U.banner('warn', '⏰', '<b>8/12 09:00</b> 에 나갈 예약 발송이 1건 있습니다 — 휴무 안내 (318명).', {
  right: U.btn('예약 취소', { sm: true, attr: ' data-toast="예약 발송을 취소했어요"' }),
})}

<div class="mt6">${U.table(
  [{ t: '발송일시', w: '128px' }, { t: '채널', w: '68px' }, '제목',
   { t: '대상', w: '64px', cls: 'r' }, { t: '성공', w: '64px', cls: 'r' }, { t: '실패', w: '64px', cls: 'r' },
   { t: '비용', w: '80px', cls: 'r nowrap' }, { t: '상태', w: '80px' }, { t: '', w: '76px' }],
  SENDS.map((s) => ({
    cls: s.st === '발송실패' ? 'warn' : '',
    cells: [
      `<span class="num sub">${s.at}</span>`, s.ch, `<b>${s.ttl}</b>`,
      { t: `<span class="num">${U.num(s.n)}</span>`, cls: 'r' },
      { t: `<span class="num">${U.num(s.ok)}</span>`, cls: 'r' },
      { t: s.ng ? `<span class="num strong">${s.ng}</span>` : '<span class="muted">0</span>', cls: 'r' },
      { t: `<span class="num">${U.won(s.cost)}</span>`, cls: 'r nowrap' },
      U.stBadge(s.st),
      s.ng ? U.btn('실패 보기', { sm: true, href: 'MK-03' }) : (s.st === '예약대기' ? U.btn('취소', { sm: true, cls: 'btn-dan', attr: ' data-toast="예약 발송을 취소했어요"' }) : U.btn('다시 보내기', { sm: true, href: 'MK-01' })),
    ],
  })),
)}</div>

<p class="t-sub mt6">발송 건을 누르면 <b>수신자별로 성공·실패</b>를 볼 수 있습니다.</p>`,
});

PAGES['MK-03'] = () => ({
  body: `${U.pageHd('발송 실패 상세', 'M-3310 · 2026-08-08 18:30 · 알림톡 · 노쇼 안내',
    `${U.btn('발송 이력', { href: 'MK-02' })}${U.btn('유효 번호만 다시 보내기', { cls: 'btn-pri', href: 'MK-01' })}`)}

${U.statRow([['2건', '보낸 수'], ['1건', '성공', { cls: 'ok' }], ['1건', '실패', { cls: 'dan' }], ['26원', '든 비용']], 'g4 mb6')}

${U.card('실패한 까닭', U.table(
  ['사유', { t: '건수', w: '64px', cls: 'r' }, '어떻게 하면 되나'],
  [
    ['없는 번호', { t: '<span class="num">1</span>', cls: 'r' }, '고객 정보에서 연락처를 고쳐 주세요. 아래 목록에서 바로 갈 수 있어요.'],
    ['수신거부', { t: '<span class="num">0</span>', cls: 'r' }, '광고성 메시지는 보낼 수 없습니다. 예약 안내는 갑니다.'],
    ['잔액 부족', { t: '<span class="num">0</span>', cls: 'r' }, '충전하면 자동으로 재발송됩니다.'],
    ['수신 차단', { t: '<span class="num">0</span>', cls: 'r' }, '고객이 매장 번호를 차단했습니다. 다른 채널로 보내세요.'],
  ],
))}

${U.card('수신자별 결과', U.table(
  ['고객', '연락처', { t: '결과', w: '80px' }, '사유', { t: '', w: '104px' }],
  [
    ['오재현', '<span class="num">010-2210-6647</span>', U.stBadge('발송실패'), '없는 번호 (수신처 없음)', U.btn('연락처 고치기', { sm: true, href: 'CU-02' })],
    ['윤채린', '<span class="num">010-8834-1902</span>', U.stBadge('발송완료'), '<span class="muted">-</span>', ''],
  ],
), { cls: 'mt6' })}

<div class="g2 mt8">
  ${U.card('다시 보내기', `<p class="t-sub mb4">실패한 번호를 빼고 <b>유효한 번호만</b> 골라 다시 보냅니다.</p>
    ${U.btn('유효 번호만 재발송', { cls: 'btn-pri', w: true, href: 'MK-01' })}`)}
  ${U.card('잔액·설정', `${U.sumRows([['남은 잔액', '<span class="num">48,200원</span>'], ['자동 충전', '꺼짐']])}
    <div class="btns-v mt4">${U.btn('충전하러 가기', { w: true, href: 'SE-02' })}${U.btn('알림 설정', { w: true, href: 'SE-03' })}</div>`)}
</div>`,
});

PAGES['MK-04'] = () => ({
  body: `${U.pageHd('템플릿 관리', '자주 보내는 문구를 저장해 두고 씁니다.',
    `${U.btn('발송 작성', { href: 'MK-01' })}${U.btn('템플릿 추가', { cls: 'btn-pri', attr: ' data-modal="m-tpl"' })}`)}

${U.banner('info', 'ℹ', '알림톡은 카카오 <b>승인</b>을 받아야 나갑니다. 승인 전에는 문자로 나갑니다. 심사는 보통 2~3영업일 걸려요.')}

<div class="mt6">${U.table(
  ['템플릿 이름', { t: '용도', w: '84px' }, { t: '채널', w: '72px' }, { t: '승인', w: '76px' }, '자동 발송 규칙', { t: '', w: '176px' }],
  TEMPLATES.map((t) => [
    `<b>${t.nm}</b>`, t.use, t.ch,
    t.ok === '승인' ? U.badge('승인', 'b-ok') : (t.ok === '심사중' ? U.badge('심사중', 'b-warn') : '<span class="muted">해당 없음</span>'),
    t.rule === '수동 발송' ? '<span class="muted">수동 발송</span>' : `<span>${t.rule}</span>`,
    `<div class="row" style="gap:4px">${U.btn('미리보기', { sm: true, attr: ` data-modal="m-pv"` })}${U.btn('수정', { sm: true, attr: ' data-modal="m-tpl"' })}${U.btn('복제', { sm: true, attr: ` data-toast="「${t.nm}」을 복제했어요" data-toast-kind="ok"` })}${U.btn('삭제', { sm: true, cls: 'btn-dan', attr: ` data-toast="「${t.nm}」을 지웠어요"` })}</div>`,
  ]),
)}</div>

${U.card('넣을 수 있는 값', `<div class="g2">
  ${U.kv([['#{고객명}', '김서연'], ['#{예약일시}', '8월 10일(월) 13:00'], ['#{담당자}', '박지우'], ['#{매장명}', '살롱드무드 강남점']], { cls: 'left' })}
  <p class="t-sub">본문에 그대로 적으면 보낼 때 사람마다 다른 값으로 바뀝니다.<br>
  값이 없으면 그 자리는 빈칸으로 나가니, 없는 경우도 자연스러운 문장으로 써 주세요.</p>
</div>`, { cls: 'mt8' })}

${U.modal('m-tpl', '템플릿 만들기',
  `${U.field('이름', U.input({ ph: '예) 재방문 유도' }), { req: true })}
   <div class="f2">${U.field('용도', U.select(['예약확정', '리마인드', '노쇼방지', '생일축하', '재방문유도', '휴무안내'], 4))}
   ${U.field('채널', U.select(['알림톡', '문자', '이메일'], 0))}</div>
   ${U.field('본문', U.textarea({ ph: '#{고객명}님, …' }), { req: true })}
   ${U.field('자동 발송 시점', U.select(['수동 발송', '예약 저장 즉시', '예약 1일 전 18:00', '예약 1시간 전', '최근 방문 60일 경과'], 0))}`,
  `${U.btn('닫기', { attr: ' data-dismiss' })}${U.btn('저장', { cls: 'btn-pri', attr: ' data-dismiss data-toast="템플릿을 저장했어요" data-toast-kind="ok"' })}`)}

${U.modal('m-pv', '미리보기',
  `<div class="box" style="background:var(--bg)"><p style="white-space:pre-line">김서연님, 내일 13:00에 예약이 있어요.

살롱드무드 강남점 · 담당 박지우
변경은 매장으로 연락 주세요.</p></div>`,
  U.btn('닫기', { cls: 'btn-pri', attr: ' data-dismiss' }))}`,
});
