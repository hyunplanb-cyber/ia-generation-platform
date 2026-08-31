/* MG — 원 관리자 (5화면)
   여기서 정한 숫자가 요금 안내·결제·현황판으로 그대로 흘러간다. */
import {
  esc, won, num, man, ph, phFix, dogPh, badge, stBadge, btn, chips, tabs, pane, tabBox,
  sec, card, box, banner, empty, table, kv, sumRows, timeline, progress, pageHd, stickBar, modal, stat,
  field, input, select, textarea, check, toggle, radioRow, link, ownShell, bars, donut, solo, 조사,
} from './ui.mjs';
import {
  SITE, TODAY, DOGS, DOG, CLASSES, CLS, clsNow, PRICE, unit, STAFF, ROSTER_TOTAL,
  SALES, SALES_PACK, SALES_REG, REFUNDS, TODAY_STAT,
} from './data.mjs';

const MG_NAV = [
  ['정원·요금 설정', 'MG-01'],
  ['반 배정 규칙', 'MG-02'],
  ['정산·매출', 'MG-03'],
  ['직원·계정 관리', 'MG-04'],
];
/* MG-02 미리보기가 쓸 «지금 아이들의 몸무게와 반» — 화면이 아니라 데이터에서 나온다 */
const 무게표 = JSON.stringify(DOGS.map((d) => ({ nm: d.nm, kg: d.kg, cls: d.cls })));

export const PAGES = {
  /* ============================================================
     MG-01 정원·요금 설정 — 숫자 하나가 여러 화면과 이어진다
     ============================================================ */
  'MG-01': (ctx) => {
    const 안 = `${pageHd('정원·요금 설정', `${esc(TODAY.label)} 기준 · 전체 원생 ${ROSTER_TOTAL}마리`)}

${banner('warn', '🔗', `<b>여기서 고친 숫자는 요금 안내·예약·결제·현황판에 그대로 나갑니다.</b>
  <div class="t-sub mt2">정원을 줄이면 이미 잡힌 예약을 옮겨야 하고, 값을 바꾸면 신규 구매부터 적용됩니다.</div>`, { cls: 'mt8' })}

${card('반별 정원', `
  <div class="g3">
    ${CLASSES.map((c) => `<div class="box">
      <div class="t-card">${c.ico} ${esc(c.nm)}</div>
      <div class="t-sub mt1">${esc(c.kg)}</div>
      <div class="row mt4">
        <div style="width:120px">${input({ type: 'number', v: String(c.cap), attr: ` data-cap-in="${c.id}" data-cap-now="${clsNow(c.id)}" min="0"` })}</div>
        <span class="t-sub">마리</span>
      </div>
      <div class="mt3" data-cap-out="${c.id}"><span class="t-sub">지금 ${clsNow(c.id)}마리 · 여유 ${c.cap - clsNow(c.id)}자리</span></div>
    </div>`).join('')}
  </div>
  <p class="hint">지금 다니는 아이보다 적게 줄이면 붉은 글씨로 알려드립니다. 그래도 저장할 수는 있지만, 반 편성 보드에서 그만큼 옮겨야 해요.</p>`,
      { cls: 'mt6' })}

${card('요금표', `
  ${table(
        ['상품', { t: '값', cls: 'r' }, { t: '1회당', cls: 'r' }, '유효기간', { t: '고치기', cls: 'c' }],
        [
          ['1회 이용권', { t: won(PRICE.once), cls: 'r' }, { t: won(PRICE.once), cls: 'r' }, '당일',
            { t: `<div style="width:140px;margin-left:auto">${input({ type: 'number', v: String(PRICE.once) })}</div>`, cls: 'c' }],
          ...PRICE.packs.map((p) => [
            `${p.n}회 회차권`, { t: won(p.price), cls: 'r' }, { t: won(unit(p)), cls: 'r' }, `${p.days}일`,
            { t: `<div style="width:140px;margin-left:auto">${input({ type: 'number', v: String(p.price) })}</div>`, cls: 'c' }]),
          /* ⚠ 팔리는 등급을 «손으로 적지» 않는다 — 손님이 보는 요금표(HO0103)와
             요일 고르기(RE0203)는 PRICE.reg 를 통째로 펴서 다섯 줄을 보여 주는데,
             여기만 [2,3,5] 로 못 박혀 있어 주 1회·주 4회는 원장이 값을 못 고쳤다.
             파는 것과 고칠 수 있는 것이 갈리면 값이 반드시 어긋난다. (2026-09-01) */
          ...Object.keys(PRICE.reg).map(Number).map((n) => [
            `정기 요일권 주 ${n}회`, { t: won(PRICE.reg[n]), cls: 'r' }, { t: `약 ${won(Math.round(PRICE.reg[n] / (n * 4)))}`, cls: 'r' }, '월 자동 청구',
            { t: `<div style="width:140px;margin-left:auto">${input({ type: 'number', v: String(PRICE.reg[n]) })}</div>`, cls: 'c' }]),
        ],
      )}
  <div class="mt6">${banner('info', '🎟', `<b>값을 바꾸면 기존 회차권 보유자에게는 적용되지 않고, 신규 구매부터 적용돼요.</b>
    <div class="t-sub mt2">이미 산 회차권은 산 값 그대로 씁니다. 정기 요일권은 다음 청구일(9월 1일)부터 새 값으로 청구됩니다.</div>`)}</div>`,
      { cls: 'mt6' })}

${card('추가 옵션', table(
        ['항목', { t: '값', cls: 'r' }, '설명', { t: '고치기', cls: 'c' }],
        PRICE.opt.map(([nm, p, d]) => [
          `<b>${esc(nm)}</b>`, { t: won(p), cls: 'r' }, `<span class="t-sub">${esc(d)}</span>`,
          { t: `<div style="width:140px;margin-left:auto">${input({ type: 'number', v: String(p) })}</div>`, cls: 'c' },
        ]),
      ), { cls: 'mt6' })}

${card('할증·할인', `
  <div class="g3">
    ${field('성수기 할증 (%)', input({ type: 'number', v: String(PRICE.peakOn) }), { hint: '7~8월 · 예약 화면에서 미리 알려 줍니다' })}
    ${field('공휴일 할증 (%)', input({ type: 'number', v: String(PRICE.holidayOn) }), { hint: '법정 공휴일에만 붙습니다' })}
    ${field('형제견 할인 (%)', input({ type: 'number', v: String(PRICE.siblingOff) }), { hint: '둘째 아이부터 · 결제 화면에서 자동 적용' })}
  </div>`, { cls: 'mt6' })}`;

    return {
      body: ownShell('MG-01', 안, MG_NAV),
      o: {
        wide: true,
        stick: stickBar(
          '<div class="t-sub">저장하면 요금 안내(HO-02)·결제(RE-05)·현황판(AT-01)에 함께 반영됩니다</div>',
          `${btn('되돌리기', { cls: 'btn-ghost', attr: ' data-toast="고친 값을 되돌렸어요"' })}
           ${btn('저장', { cls: 'btn-pri', attr: ' data-notify="정원과 요금을 저장했어요 — 요금 안내와 결제 화면에 반영됩니다"' })}`,
        ),
      },
    };
  },

  /* ============================================================
     MG-02 반 배정 규칙 설정 — 반 배정이 임의가 아니라 «이 화면이 정한 규칙»이다
     경계값을 바꾸면 몇 마리가 반이 달라지는지 «실제로» 세어 보여 준다.
     ============================================================ */
  'MG-02': () => {
    const 안 = `${pageHd('반 배정 규칙 설정', '예약할 때 자동으로 도는 배정 규칙입니다')}

${card('몸무게 경계값', `
  <div class="g2">
    ${field('소형반 ~ 중형반 경계', `
      <input class="in" type="range" min="2" max="10" step="0.5" value="5" data-boundary="소형">
      <div class="t-card mt2">소형반은 <b class="pri" data-boundary-v="소형">5kg</b> 미만</div>`)}
    ${field('중형반 ~ 대형반 경계', `
      <input class="in" type="range" min="10" max="25" step="0.5" value="15" data-boundary="대형">
      <div class="t-card mt2">대형반은 <b class="pri" data-boundary-v="대형">15kg</b> 이상</div>`)}
  </div>
  <div class="box mt6" data-boundary-src='${무게표}'>
    <div data-boundary-out><span class="t-sub">손잡이를 옮기면 지금 다니는 아이 중 몇 마리가 반이 달라지는지 알려드려요</span></div>
  </div>
  <p class="hint">규칙을 바꿔도 «지금 있는» 아이의 반이 저절로 바뀌지는 않습니다. 반 편성 보드에서 옮겨 주셔야 해요.</p>`,
      { cls: 'mt8' })}

${card('지금 구간', `<div class="g3">
  ${CLASSES.map((c) => `<div class="box">
    <div class="t-card">${c.ico} ${esc(c.nm)}</div>
    <div class="t-sec pri mt2">${esc(c.kg)}</div>
    <div class="t-sub mt2">지금 ${clsNow(c.id)}마리 / 정원 ${c.cap}</div>
  </div>`).join('')}
</div>`, { cls: 'mt6' })}

${card('사교성 평가 항목', `
  <p class="t-sub mb4">첫 등원 날 30분 적응 테스트에서 봅니다. 각 문항을 3단계(좋음·보통·주의)로 적어요.</p>
  ${table(
        ['문항', '무엇을 보나', { t: '쓰나요', cls: 'c' }, { t: '', cls: 'c' }],
        [
          ['다른 아이에게 먼저 다가가나', '적극성 · 소그룹 배정 판단', { t: toggle(true, '「먼저 다가가나」 문항을 그대로 씁니다'), cls: 'c' },
            { t: btn('지우기', { cls: 'btn-dan', sm: true, attr: ' data-toast="문항을 지우려면 저장해야 합니다"' }), cls: 'c' }],
          ['낯선 소리에 짖나', '짖음 정도 · 소그룹 전환 판단', { t: toggle(true, '「낯선 소리에 짖나」 문항을 그대로 씁니다'), cls: 'c' },
            { t: btn('지우기', { cls: 'btn-dan', sm: true, attr: ' data-toast="문항을 지우려면 저장해야 합니다"' }), cls: 'c' }],
          ['장난감을 두고 다투나', '공격성 · 개별 관리 판단', { t: toggle(true, '「장난감 다툼」 문항을 그대로 씁니다'), cls: 'c' },
            { t: btn('지우기', { cls: 'btn-dan', sm: true, attr: ' data-toast="문항을 지우려면 저장해야 합니다"' }), cls: 'c' }],
          ['사람이 다가가면 어떤가', '사람 반응 · 보육교사 배치 판단', { t: toggle(true, '「사람 반응」 문항을 그대로 씁니다'), cls: 'c' },
            { t: btn('지우기', { cls: 'btn-dan', sm: true, attr: ' data-toast="문항을 지우려면 저장해야 합니다"' }), cls: 'c' }],
          ['보호자와 떨어질 때 어떤가', '분리 불안 · 첫 주 관찰 강도', { t: toggle(false, '「분리 반응」 문항을 켰어요'), cls: 'c' },
            { t: btn('지우기', { cls: 'btn-dan', sm: true, attr: ' data-toast="문항을 지우려면 저장해야 합니다"' }), cls: 'c' }],
        ],
      )}
  <div class="btns mt6">${btn('＋ 문항 추가', { cls: 'btn-sub', attr: ' data-toast="새 문항 칸을 열었어요"' })}</div>`,
      { cls: 'mt6' })}

${card('자동 배정', `
  <div class="row-b wrap-row">
    <div><div class="t-card">예약할 때 자동으로 반을 정합니다</div>
      <div class="t-sub mt1">끄면 예약이 「반 미정」으로 들어오고, 원장이 반 편성 보드에서 손으로 배정합니다</div></div>
    ${toggle(true, '자동 배정을 껐어요 — 이제 예약은 「반 미정」으로 들어오고 보드에서 직접 배정하셔야 합니다')}
  </div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${btn('반 편성 보드', { href: 'AT-04', cls: 'btn-pri' })}
  ${btn('저장', { cls: 'btn-ghost', attr: ' data-notify="반 배정 규칙을 저장했어요"' })}
</div>`;

    return { body: ownShell('MG-02', 안, MG_NAV), o: { wide: true } };
  },

  /* ============================================================
     MG-03 정산·매출 — 「회차권 판매」와 「정기권 자동청구」를 나눠 보여 주는 것이
     이 팩만의 항목이다.
     ⚠ 합계는 손으로 적지 않는다 — data.mjs 가 건수 × 단가로 세어 준다.
     ============================================================ */
  'MG-03': () => {
    /* 기간을 바꾸면 지표 넷이 실제로 다시 계산된다.
       지난 달·올해 값은 이번 달 값에서 비례로 잡은 견본이다 — 화면 안에서 앞뒤가 맞는다. */
    const 기간 = [
      { t: '이번 달 (8월)', lb: SALES.period, m: 1 },
      { t: '지난 달 (7월)', lb: '2026년 7월 1일 ~ 7월 31일', m: 1.24 },
      { t: '올해 전체', lb: '2026년 1월 1일 ~ 8월 24일', m: 7.6 },
    ];
    const 안 = `${pageHd('정산·매출', `<span data-period-label>${esc(SALES.period)}</span>`)}

<div class="filters">
  <select class="sel" data-period>
    ${기간.map((p, i) => `<option${i === 0 ? ' selected' : ''} data-label="${esc(p.lb)}"
      data-total="${Math.round(SALES.total * p.m)}" data-pack="${Math.round(SALES.pack * p.m)}"
      data-reg="${Math.round(SALES.reg * p.m)}" data-refund="${Math.round(SALES.refund * p.m)}">${esc(p.t)}</option>`).join('')}
  </select>
  ${btn('정산서 다운로드', { cls: 'btn-ghost', attr: ' data-toast="정산서(xlsx)를 만들고 있어요 — 잠시 뒤 내려받기가 시작됩니다"' })}
</div>

<div class="g4 mt6">
  ${stat('총 매출', man(SALES.total), { ico: '💰', d: '<span data-period-label>' + esc(SALES.period) + '</span>', numAttr: ' data-sales="total"' })}
  ${stat('회차권 판매', man(SALES.pack), { ico: '🎟', cls: 'ok', d: `${SALES_PACK.reduce((s, r) => s + r.cnt, 0)}건`, numAttr: ' data-sales="pack"' })}
  ${stat('정기권 자동청구', man(SALES.reg), { ico: '🔁', cls: 'ok', d: `${SALES_REG.reduce((s, r) => s + r.cnt, 0)}건`, numAttr: ' data-sales="reg"' })}
  ${stat('환불', man(SALES.refund), { ico: '↩️', cls: 'dan', d: `${REFUNDS.length}건`, numAttr: ' data-sales="refund"' })}
</div>

${card('매출 구성', sumRows([
      ['회차권 판매 (1회권 포함)', won(SALES.pack)],
      ['정기권 자동청구', won(SALES.reg)],
      ['환불·취소', `−${won(SALES.refund)}`, 'minus'],
    ], ['총 매출', won(SALES.total)]), { cls: 'mt6' })}

${card('요금제별 판매 건수', `
  ${bars([...SALES_PACK, ...SALES_REG].map((r) => [r.nm, r.cnt, `${r.cnt}건 · ${man(r.cnt * r.price)}`]))}
  <p class="hint">막대는 건수 기준입니다. 오른쪽 금액은 건수 × 단가로 계산한 값이에요.</p>`, { cls: 'mt6' })}

${card('결제 수단별 비중', donut(SALES.pay), { cls: 'mt6' })}

${sec('환불·취소 내역', table(
      ['날짜', '반려견', '사유', '내용', { t: '금액', cls: 'r' }],
      REFUNDS.map((r) => [
        { t: `<span class="num">${esc(r.date)}</span>`, cls: 'nowrap' },
        `<b>${esc(r.dog)}</b>`,
        esc(r.why),
        `<span class="t-sub">${esc(r.kind)}</span>`,
        { t: `<span class="dan">−${won(r.amt)}</span>`, cls: 'r nowrap' },
      ]),
      { foot: ['', '', '', '합계', { t: `−${won(SALES.refund)}`, cls: 'r' }] },
    ))}

${banner('info', '🔁', `<b>정기권 자동청구는 매월 1일에 한 번에 돕니다.</b>
  <div class="t-sub mt2">이번 달 자동청구는 8월 1일에 ${SALES_REG.reduce((s, r) => s + r.cnt, 0)}건 나갔습니다.
  일시정지 중인 아이는 그만큼 빼고 청구합니다.</div>`, { cls: 'mt8' })}

<div class="btns mt8">${btn('직원·계정 관리', { href: 'MG-04', cls: 'btn-ghost' })}</div>`;

    return { body: ownShell('MG-03', 안, MG_NAV), o: { wide: true } };
  },

  /* ============================================================
     MG-04 직원·계정 관리 — 원장 한 명이 보육교사 몇을 관리하는 소규모 사업장
     ============================================================ */
  'MG-04': () => {
    const 안 = `${pageHd('직원·계정 관리', `${STAFF.filter((s) => s.st === '활성').length}명이 일하고 있어요`,
      btn('＋ 직원 초대', { cls: 'btn-pri', attr: ' data-modal="mInvite"' }))}

${table(
      ['이름', { t: '역할', cls: 'c' }, '담당 반', '이메일', '경력', { t: '계정', cls: 'c' }, { t: '', cls: 'c' }],
      STAFF.map((s) => ({
        cls: s.st === '비활성' ? 'mut' : '',
        cells: [
          { t: `<b>${esc(s.nm)}</b>`, cls: 'nowrap' },
          {
            t: s.role === '원장'
              ? badge('원장', 'b-solid')
              : `<div style="width:130px;margin:0 auto">${select(['원장', '보육교사'], 1, { attr: ' data-toast="역할을 바꿨어요 — 볼 수 있는 화면이 달라집니다"' })}</div>`,
            cls: 'c',
          },
          s.cls.length ? s.cls.map((c) => badge(c, 'b-line')).join(' ') : '<span class="muted">없음</span>',
          `<span class="t-sub">${esc(s.email)}</span>`,
          esc(s.career),
          { t: stBadge(s.st), cls: 'c' },
          {
            t: s.role === '원장'
              ? '<span class="muted">—</span>'
              : (s.st === '활성'
                ? btn('퇴사 처리', { cls: 'btn-dan', sm: true, attr: ' data-modal="mOff"' })
                : btn('다시 활성화', { cls: 'btn-ghost', sm: true, attr: ` data-notify="${esc(s.nm)} 님의 계정을 다시 켰어요"` })),
            cls: 'c',
          },
        ],
      })),
    )}

${sec('역할이 볼 수 있는 화면', table(
      ['화면', { t: '원장', cls: 'c' }, { t: '보육교사', cls: 'c' }],
      [
        ['등하원 체크 · 반 편성 보드', { t: '✅', cls: 'c' }, { t: '✅', cls: 'c' }],
        ['알림장 작성 · 발송', { t: '✅', cls: 'c' }, { t: '✅', cls: 'c' }],
        ['건강기록 · 사고 기록', { t: '✅', cls: 'c' }, { t: '✅', cls: 'c' }],
        ['백신 만료 대시보드', { t: '✅', cls: 'c' }, { t: '✅', cls: 'c' }],
        ['정원·요금 설정', { t: '✅', cls: 'c' }, { t: '<span class="muted">✕</span>', cls: 'c' }],
        ['정산·매출', { t: '✅', cls: 'c' }, { t: '<span class="muted">✕</span>', cls: 'c' }],
        ['직원·계정 관리', { t: '✅', cls: 'c' }, { t: '<span class="muted">✕</span>', cls: 'c' }],
      ],
    ), { desc: '보육교사는 돈과 관련된 화면을 볼 수 없습니다.' })}

${modal('mInvite', '직원 초대', `
  ${field('이메일', input({ type: 'email', ph: 'name@dogmaru.kr' }), { req: true, hint: '이 주소로 초대 링크가 갑니다' })}
  ${field('이름', input({ ph: '홍길동' }), { req: true })}
  ${field('역할', select(['보육교사', '원장'], 0))}
  ${field('담당 반', `<div class="chips" data-multi>${CLASSES.map((c) => `<button class="chip" type="button">${esc(c.nm)}</button>`).join('')}</div>`,
      { hint: '여러 반을 맡을 수 있어요' })}`,
      `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('초대 메일 보내기', { cls: 'btn-pri', attr: ' data-notify="초대 메일을 보냈어요 — 링크는 7일 동안 쓸 수 있습니다" data-dismiss' })}`)}

${modal('mOff', '계정을 비활성화할까요?', `
  <p><b>비활성화하면 그 사람은 더 이상 로그인할 수 없습니다.</b></p>
  ${banner('info', '📓', '<b>비활성화해도 과거에 작성한 알림장 기록은 남아요.</b><div class="t-sub mt2">보호자가 받은 알림장의 담당 선생님 이름도 그대로입니다. 지우는 것이 아니라 «들어오지 못하게» 하는 것입니다.</div>', { cls: 'mt4' })}
  <div class="mt4">${check('담당하던 반을 다른 선생님께 넘겼습니다', { attr: ' data-unlock="offBtn"' })}</div>`,
      `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}
   ${btn('비활성화', { cls: 'btn-dan', id: 'offBtn', off: true, attr: ' data-notify="계정을 비활성화했어요 — 과거 기록은 그대로 남습니다" data-dismiss' })}`)}

<div class="btns mt8">${btn('정원·요금 설정', { href: 'MG-01', cls: 'btn-ghost' })}</div>`;

    return { body: ownShell('MG-04', 안, MG_NAV), o: { wide: true } };
  },

  /* ============================================================
     MG-05 운영자 로그인 — 보호자 로그인과 «다른 주소, 다른 화면»
     정말 몇 줄뿐인 화면이라 가운데 좁은 카드를 그대로 쓴다.
     ============================================================ */
  'MG-05': () => {
    const body = solo(
      `${SITE.mark} 원 운영진 로그인`,
      `${esc(SITE.name)} 원장·보육교사용 화면입니다`,
      `
      ${field('이메일', input({ type: 'email', ph: 'name@dogmaru.kr' }), { req: true })}
      ${field('비밀번호', input({ type: 'password', ph: '비밀번호' }), { req: true })}
      <div class="row-b mb6">
        ${check('로그인 상태 유지', { on: true })}
        <a class="more" href="${link('MG0503')}">비밀번호를 잊으셨나요?</a>
      </div>
      ${btn('로그인', { href: 'AT-01', cls: 'btn-pri', w: true, lg: true })}
      ${banner('info', '🔑', `<b>처음 로그인하시면 비밀번호를 바꿔 주세요.</b>
        <div class="t-sub mt2">원장이 보낸 임시 비밀번호는 첫 로그인 뒤 쓸 수 없게 됩니다.</div>`, { cls: 'mt6' })}
      <div class="center mt6">
        <p class="t-sub">보호자이신가요?</p>
        <div class="btns mt3" style="justify-content:center">
          ${btn('보호자 화면으로 가기', { href: 'HO-01', cls: 'btn-ghost' })}
        </div>
      </div>
      <div class="center mt6">
        <p class="t-sub">${esc(SITE.tel)} · ${esc(SITE.email)}</p>
      </div>`,
    );
    return { body, o: { solo: true, bare: true } };
  },
};
