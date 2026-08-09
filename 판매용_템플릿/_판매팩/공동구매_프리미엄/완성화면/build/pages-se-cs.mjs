/* SE 정산(진행자) 9장 · CS 고객지원 12장 */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, accordion, statRow, sumRows, timeline, dealCards, toastNow, modalNow, hsteps, stepbar,
  pageHd, detail2, hostPage, myPage, num, won, esc, link,
} from './ui.mjs';
import { SETTLE, DEALS, dealById, pctOf, NOTICES, FAQ, CATS } from './data.mjs';

/* ── SE-01 정산 내역 ──────────────────────────────────
   v: 'hold' 보류 상태 · 'period' 기간 필터 · 'tax' 세금계산서 발행 */
function se01(ctx, v) {
  /* 보류 상태 */
  if (v === 'hold') {
    const body = hostPage('SE-01', `
      ${pageHd('정산 보류', '분쟁이 끝날 때까지 일부 금액을 잡아 둡니다')}

      ${banner('warn', '⏸', `<b>정산 1건이 보류 중입니다 — ${won(1204000)}</b>
        <p class="t-sub">참여자 분쟁 조정이 진행 중이라 그 금액만 잡아 두었습니다. 나머지는 예정대로 지급됩니다.</p>`)}

      ${statRow([
      [won(1204000), '보류 금액', { ic: '⏸' }],
      ['1건', '보류 건수', { ic: '📄' }],
      ['8월 12일', '해제 예정', { ic: '📅' }],
      [won(21291730), '정상 지급 예정', { ic: '💰' }],
    ])}

      ${card('보류 내역', table(
      [{ t: '공구', w: '24%' }, '보류 사유', '보류 금액', '접수일', '예상 해제', '상태'],
      [
        ['<b>병풀 진정 앰플 30ml × 3개입</b>', '참여자 분쟁 조정 (상품 하자 12건)', `<b>${won(1204000)}</b>`, '2026-08-02', '2026-08-12', badge('조정 중', 'b-warn')],
      ],
    ), { cls: 'mt6' })}

      ${card('왜 보류하나요', `<p class="t-sub">분쟁이 끝나기 전에 정산이 나가면, 환불해야 할 때 되돌릴 방법이 없습니다.
      그래서 다툼이 있는 금액만큼만 잡아 두고 나머지는 정상 지급합니다.</p>
      <div class="mt4">${timeline([
      ['분쟁 접수', '2026년 8월 2일 · 참여자 12명이 상품 하자를 신고'],
      ['해당 금액 보류', '2026년 8월 2일 · 1,204,000원'],
      ['양쪽 자료 확인', '진행 중 — 진행자 답변 제출 완료'],
      ['판단', '2026년 8월 10일 예정'],
      ['해제 또는 차감', '2026년 8월 12일 · 판단대로 처리'],
    ], 2)}</div>`, { cls: 'mt6' })}

      ${card('보류를 풀려면', `${[
      ['참여자와 합의하기', '재발송이나 부분 환불로 합의하시면 그 자리에서 조정이 끝납니다.', 'HM0405'],
      ['자료 더 내기', '포장·발송 사진이 있으면 판단이 빨라집니다.', 'CS-02'],
      ['운영팀에 문의', '진행 상황을 물어보실 수 있습니다.', 'CS-02'],
    ].map(([t, s, go]) => `<a class="list-row" href="${link(go)}">
        <div class="grow"><b>${t}</b><div class="t-sub">${s}</div></div><span class="muted">›</span></a>`).join('')}`,
      { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('반품·교환 처리하기', { cls: 'btn-primary btn-lg', href: 'HM0405' })}
        ${btn('정산 내역으로', { cls: 'btn-ghost btn-lg', href: 'SE-01' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '보류 1건 · 1,204,000원 · 조정 중' } };
  }

  /* 기간 필터 */
  if (v === 'period') {
    const body = hostPage('SE-01', `
      ${pageHd('정산 내역', '2026년 6월 1일 ~ 8월 31일 · 3건')}

      ${card('기간 고르기', `<div class="row wrap-row" style="gap:8px;align-items:center">
        ${chips(['이번 달', '지난달', '최근 3개월', '올해', '직접 고르기'], 2)}
      </div>
      <div class="row wrap-row mt4" style="gap:8px;align-items:center">
        <input class="input" type="date" value="2026-06-01" style="width:170px">
        <span class="t-sub">~</span>
        <input class="input" type="date" value="2026-08-31" style="width:170px">
        <select class="select" style="width:160px"><option>전체 상태</option><option>정산 예정</option><option>정산 완료</option><option>보류</option></select>
        <select class="select" style="width:180px"><option>전체 공구</option>${SETTLE.map((s) => `<option>${esc(s.deal)}</option>`).join('')}</select>
        ${btn('조회', { cls: 'btn-primary', attr: ' data-toast="고른 기간으로 다시 찾았어요"' })}
      </div>
      <p class="t-sub mt3">고른 기간에 <b>3건 · 순정산 ${won(SETTLE.reduce((a, s) => a + s.net, 0))}</b>이 있습니다.</p>`)}

      ${statRow([
      ['3건', '정산 건수', { ic: '📄' }],
      [won(SETTLE.reduce((a, s) => a + s.gross, 0)), '기간 매출', { ic: '💳' }],
      [won(SETTLE.reduce((a, s) => a + s.fee, 0)), '수수료', { ic: '📉' }],
      [won(SETTLE.reduce((a, s) => a + s.net, 0)), '순정산액', { ic: '💰' }],
    ])}

      ${card('월별 집계', table(
      ['정산 월', '건수', '매출', '수수료', '환불', '순정산액'],
      [
        ['2026년 6월', '1건', won(8970000), '−' + won(448500), '−' + won(209300), `<b>${won(8312200)}</b>`],
        ['2026년 7월', '2건', won(23809400), '−' + won(1189470), '−' + won(124200), `<b>${won(22495730)}</b>`],
        ['2026년 8월', '0건', '—', '—', '—', '—'],
      ],
      { foot: ['합계', '3건', won(32779400), '−' + won(1637970), '−' + won(333500), won(30807930)] },
    ), { cls: 'mt6' })}

      ${card('기간 내 정산 건', table(
      [{ t: '공구', w: '28%' }, '정산 월', '매출', '순정산액', '상태', '지급일'],
      SETTLE.map((s) => [
        `<a href="${link('SE-03')}"><b>${esc(s.deal)}</b></a>`,
        s.m.replace('-', '년 ') + '월', won(s.gross), `<b>${won(s.net)}</b>`, stBadge(s.st), s.pay,
      ]),
    ), { cls: 'mt6', ft: btn('이 기간 내역 내려받기', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="기간 내역을 엑셀로 내려받았어요" data-toast-kind="ok"' }) })}`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '기간 필터 · 2026-06-01 ~ 2026-08-31 · 3건' } };
  }

  /* 세금계산서 발행 */
  if (v === 'tax') {
    const body = hostPage('SE-01', `
      ${pageHd('세금계산서 발행', '일반과세 사업자로 등록되어 있습니다')}

      ${card('발행 대상', `<div class="row-b wrap-row mb4">
        <div class="row wrap-row" style="gap:8px">${chips(['발행 대기 2', '발행 완료 4', '전체 6'], 0)}</div>
        <select class="select" style="width:170px"><option>2026년 7월</option><option>2026년 6월</option></select>
      </div>
      ${table(
      [{ t: '', w: '36px' }, '공구', '정산 확정일', '공급가액', '부가세', '합계', '상태'],
      [
        ['<label class="check" style="padding:0"><input type="checkbox" checked><span></span></label>',
          '<b>병풀 진정 앰플 30ml × 3개입</b>', '2026-08-05', won(17264709), won(1726471), `<b>${won(18991180)}</b>`, badge('발행 대기', 'b-warn')],
        ['<label class="check" style="padding:0"><input type="checkbox" checked><span></span></label>',
          '<b>동결건조 닭가슴살 트릿 1kg</b>', '2026-07-26', won(3185955), won(318595), `<b>${won(3504550)}</b>`, badge('발행 대기', 'b-warn')],
        ['<label class="check" style="padding:0"><input type="checkbox" disabled><span></span></label>',
          '겨울 기모 맨투맨 (7월 1차)', '2026-07-10', won(7556545), won(755655), won(8312200), badge('발행 완료', 'b-ok')],
      ],
    )}`)}

      ${card('발행 정보', `${kv([
      ['공급자', '모아공구 주식회사 · 512-81-00947'],
      ['공급받는 자', '제주농원 다래 · 616-**-*****'],
      ['대표자', '서지현'],
      ['업태 / 종목', '도소매 / 농산물'],
      ['받을 이메일', 'tax@jejudarae.kr'],
      ['발행 유형', '전자세금계산서 (국세청 자동 전송)'],
    ])}
      <div class="btns mt4">${btn('발행 정보 고치기', { cls: 'btn-ghost btn-sm', href: 'SE-02' })}</div>`, { cls: 'mt6' })}

      ${card('선택한 2건 합계', `${sumRows([
      ['공급가액', won(20450664)],
      ['부가세 (10%)', won(2045066)],
    ], ['합계 금액', won(22495730)])}
      <div class="box mt3"><p class="t-sub">발행하시면 국세청에 자동 전송되고, 적어 두신 메일로 사본이 갑니다.
      발행 후 취소는 발행일이 속한 달의 말일까지만 됩니다.</p></div>`, { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('2건 발행하기', { cls: 'btn-primary btn-lg', attr: ' data-toast="세금계산서 2건을 발행했어요. 메일로 보내드립니다" data-toast-kind="ok"' })}
        ${btn('발행 내역 보기', { cls: 'btn-ghost btn-lg', href: 'SE0302' })}
        ${btn('정산 내역으로', { cls: 'btn-ghost btn-lg', href: 'SE-01' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '세금계산서 발행 대기 2건 · 22,495,730원' } };
  }

  const body = hostPage('SE-01', `
    ${pageHd('정산 내역', '배송 완료가 확인되면 7영업일 안에 보내드립니다',
    `<div class="btns">${btn('계좌·세금 설정', { cls: 'btn-ghost', href: 'SE-02' })}
      ${btn('세금계산서', { cls: 'btn-ghost', href: 'SE0104' })}</div>`)}

    ${statRow([
    ['2,250만원', '정산 예정', { ic: '💰', d: '8월 12일 지급' }],
    ['1,182만원', '정산 완료', { ic: '✅', d: '올해 누적' }],
    ['0원', '보류 금액', { ic: '⏸', d: '분쟁 없음' }],
    ['4%', '내 수수료율', { ic: '📉', d: 'A등급' }],
  ])}

    ${card('', `<div class="row-b wrap-row mb4" style="gap:12px">
      ${tabs([{ label: '전체' }, { label: '정산 예정' }, { label: '정산 완료' }, { label: '보류', go: 'SE0102' }], 0)}
      <div class="row" style="gap:8px">
        ${btn('기간 고르기', { cls: 'btn-ghost btn-sm', href: 'SE0103' })}
        ${btn('내보내기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="정산 내역을 엑셀로 내려받았어요" data-toast-kind="ok"' })}
      </div>
    </div>
    ${table(
      [{ t: '공구', w: '26%' }, '정산 월', '매출', '수수료', '환불', '순정산액', '상태', '지급일', ''],
      SETTLE.map((s) => [
        `<a href="${link('SE-03')}"><b>${esc(s.deal)}</b></a>`,
        s.m.replace('-', '년 ') + '월',
        won(s.gross),
        '−' + won(s.fee),
        s.refund ? '−' + won(s.refund) : '—',
        `<b>${won(s.net)}</b>`,
        stBadge(s.st),
        s.pay,
        btn('상세', { cls: 'btn-ghost btn-sm', href: 'SE-03' }),
      ]),
      {
        foot: ['합계', '', won(SETTLE.reduce((a, s) => a + s.gross, 0)), '−' + won(SETTLE.reduce((a, s) => a + s.fee, 0)),
          '−' + won(SETTLE.reduce((a, s) => a + s.refund, 0)), won(SETTLE.reduce((a, s) => a + s.net, 0)), '', '', ''],
      },
    )}`)}

    ${card('정산은 이렇게 진행됩니다', timeline([
    ['공구 성사', '참여자 결제가 확정됩니다'],
    ['배송 완료 확인', '송장 등록 후 자동 확인 · 보통 3~5일'],
    ['정산 확정', '환불·반품분을 빼고 금액이 확정됩니다'],
    ['지급', '확정 후 7영업일 안에 등록하신 계좌로'],
  ], 2), { cls: 'mt6' })}

    ${banner('mut', '🧾', `<b>세금계산서와 명세서</b>
      <p class="t-sub">정산 완료 건은 명세서를 언제든 내려받으실 수 있습니다. 사업자로 등록하셨다면 세금계산서도 자동 발행됩니다.</p>`,
    { cls: 'mt6', right: `<div class="btns">${btn('명세서', { cls: 'btn-ghost btn-sm', attr: ' data-toast="명세서를 내려받았어요" data-toast-kind="ok"' })}
      ${btn('세금계산서 발행', { cls: 'btn-ghost btn-sm', href: 'SE0104' })}</div>` })}`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── SE-02 정산 계좌·세금 설정 ────────────────────────
   v: 'verify' 계좌 인증 · 'biz' 사업자 등록 */
function se02(ctx, v) {
  /* 계좌 인증 */
  if (v === 'verify') {
    const body = hostPage('SE-02', `
      ${pageHd('계좌 인증', '1원을 보내 예금주가 본인인지 확인합니다')}
      ${hsteps(['계좌 입력', '1원 입금', '입금자명 확인', '완료'], 2)}

      ${card('보낸 내역', `<div class="box center">
        <div class="t-sub">아래 계좌로 1원을 보냈습니다</div>
        <div class="t-page mt2" style="font-size:22px">국민은행 123456-78-901923</div>
        <div class="t-sub mt1">예금주 서지현</div>
        <div class="hr"></div>
        <div class="t-sub">남은 시간</div>
        <div class="t-sec" data-count="540">09:00</div>
      </div>
      <p class="t-sub mt4">은행 앱이나 문자에서 <b>입금자명</b>을 확인해 주세요. “모아공구” 뒤에 붙은 <b>숫자 4자리</b>가 인증번호입니다.</p>`)}

      ${card('입금자명 확인', `<div class="form">
        <div class="field"><label class="label">입금자명에 적힌 숫자 4자리</label>
          <div class="code-in">${['3', '9', '', ''].map((n) => `<input value="${n}" maxlength="1">`).join('')}</div>
          <p class="hint">예: “모아공구3914” → 3914</p></div>
      </div>
      <div class="btns mt4">
        ${btn('인증 확인', { cls: 'btn-primary btn-lg', attr: ' data-toast="계좌 인증이 끝났어요" data-toast-kind="ok"' })}
        ${btn('1원 다시 보내기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="1원을 다시 보냈어요" data-toast-kind="ok"' })}
      </div>`, { cls: 'mt6' })}

      ${card('안 될 때는', accordion([
      { q: '1원이 안 들어왔어요', a: '은행에 따라 5분 정도 걸릴 수 있습니다. 10분이 지나도 안 들어오면 계좌번호를 다시 확인하시고 재발송해 주세요.' },
      { q: '입금자명에 숫자가 없어요', a: '일부 은행 앱은 입금자명을 줄여서 보여 줍니다. 거래내역 상세로 들어가시면 전체가 보입니다.' },
      { q: '본인 계좌가 아니면 안 되나요', a: '네. 정산은 진행자 본인 명의 계좌로만 나갑니다. 사업자 계좌는 대표자 명의여야 합니다.' },
      { q: '인증한 계좌를 바꾸고 싶어요', a: '언제든 바꾸실 수 있고, 바꾸면 다시 인증해야 합니다. 정산 지급 3일 전부터는 바꾸실 수 없습니다.' },
    ], 0), { cls: 'mt6' })}

      <div class="btns mt6">${btn('설정으로 돌아가기', { cls: 'btn-ghost btn-lg', href: 'SE-02' })}</div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '계좌 인증 중 · 1원 입금 완료 · 남은 시간 09:00' } };
  }

  /* 사업자 등록 */
  if (v === 'biz') {
    const body = hostPage('SE-02', `
      ${pageHd('사업자 등록', '사업자로 등록하시면 세금계산서를 발행할 수 있습니다')}

      ${banner('mut', 'ℹ️', `<b>사업자가 아니어도 진행자는 하실 수 있습니다.</b>
        <p class="t-sub">다만 개인이시면 정산할 때 3.3%를 원천징수합니다. 반복해서 여신다면 등록하시는 편이 유리합니다.</p>`)}

      ${card('사업자 구분', `<div class="radio-list">
        ${[['개인 (사업자 없음)', '지급할 때 3.3% 원천징수 · 5월 종합소득세 신고', false],
      ['개인사업자 — 간이과세', '연 매출 8천만원 미만 · 세금계산서 발행 의무 없음', false],
      ['개인사업자 — 일반과세', '세금계산서 자동 발행 · 부가세 신고 필요', true],
      ['법인사업자', '세금계산서 자동 발행 · 법인세 신고', false]]
      .map(([t, s, on]) => `<label class="radio${on ? ' on' : ''}" data-group="biz">
          <input type="radio" name="biz"${on ? ' checked' : ''}>
          <span class="grow"><b>${t}</b><div class="t-sub mt1">${s}</div></span></label>`).join('')}
      </div>`, { cls: 'mt6' })}

      ${card('사업자 정보', `<div class="form" style="max-width:none">
        <div class="field-row">
          <div class="field"><label class="label">사업자등록번호 <span class="req">*</span></label>
            <div class="field-btn"><input class="input" value="512-81-00947">
              ${btn('진위 확인', { cls: 'btn-ghost', attr: ' data-toast="국세청에서 확인했어요. 정상 사업자입니다" data-toast-kind="ok"' })}</div>
            <p class="ok">국세청 확인 완료 · 계속사업자</p></div>
          <div class="field"><label class="label">상호 <span class="req">*</span></label><input class="input" value="제주농원 다래"></div>
        </div>
        <div class="field-row">
          <div class="field"><label class="label">대표자명 <span class="req">*</span></label><input class="input" value="서지현"></div>
          <div class="field"><label class="label">개업일</label><input class="input" type="date" value="2024-03-02"></div>
        </div>
        <div class="field"><label class="label">사업장 주소 <span class="req">*</span></label>
          <input class="input" value="제주특별자치도 서귀포시 중산간동로 1234"></div>
        <div class="field-row">
          <div class="field"><label class="label">업태</label><input class="input" value="도소매"></div>
          <div class="field"><label class="label">종목</label><input class="input" value="농산물"></div>
        </div>
        <div class="field"><label class="label">통신판매업 신고번호</label>
          <input class="input" placeholder="2026-제주서귀포-0142">
          <p class="hint">같은 상품을 반복해서 파시면 필요합니다. 관할 구청에서 신고하실 수 있습니다.</p></div>
      </div>`, { cls: 'mt6' })}

      ${card('서류 올리기', `${[['사업자등록증', '사업자등록증_제주농원다래.pdf', '1.1MB', true],
      ['통신판매업 신고증', '', '', false]]
      .map(([t, f, sz, up]) => `<div class="field"><label class="label">${t}${up ? '' : ' <span class="t-sub">(선택)</span>'}</label>
        ${up ? `<div class="file-row is-ok"><span>📄</span><span class="grow">${f}</span><span class="t-sub">${sz}</span>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="파일을 새 창에서 열었어요">보기</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="파일을 지웠어요">삭제</button></div>`
        : `<div class="upload" style="padding:18px"><b>파일을 끌어다 놓으세요</b>
          <p class="t-sub">PDF·JPG·PNG · 10MB 이하</p></div>`}
      </div>`).join('')}
      <p class="t-sub">올려 주신 서류는 확인 뒤 즉시 암호화되어 보관되며, 정산·세무 목적으로만 씁니다.</p>`,
      { cls: 'mt6' })}

      ${card('등록하면 이렇게 바뀝니다', table(
      ['항목', '지금 (개인)', '등록 후 (일반과세)'],
      [
        ['원천징수', '3.3% 공제', '<b>없음</b>'],
        ['세금계산서', '발행 불가', '<b>정산 확정일 자동 발행</b>'],
        ['이번 달 실지급액', won(21753364), `<b>${won(22495730)}</b>`],
        ['부가세 신고', '해당 없음', '<b>직접 신고 (연 2회)</b>'],
      ],
    ), { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('등록 신청하기', { cls: 'btn-primary btn-lg', attr: ' data-toast="사업자 등록을 신청했어요. 1영업일 안에 확인해 드립니다" data-toast-kind="ok"' })}
        ${btn('나중에 하기', { cls: 'btn-ghost btn-lg', href: 'SE-02' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '사업자 등록 · 일반과세 선택' } };
  }

  const main = `
    ${banner('warn', '🔒', `<b>여기 넣으시는 정보는 암호화해서 보관합니다.</b>
      <p class="t-sub">계좌번호와 사업자 정보는 정산 목적으로만 쓰이고, 진행자님 외에는 아무도 전체를 볼 수 없습니다.</p>`)}

    ${card('정산 계좌', `<div class="form">
      <div class="field-row">
        <div class="field" style="max-width:200px"><label class="label">은행 <span class="danger">*</span></label>
          <select class="select"><option selected>국민은행</option><option>신한은행</option><option>우리은행</option><option>하나은행</option><option>토스뱅크</option><option>카카오뱅크</option></select></div>
        <div class="field grow"><label class="label">계좌번호 <span class="danger">*</span></label>
          <input class="input" value="123456-78-901923" placeholder="- 없이 숫자만"></div>
      </div>
      <div class="field"><label class="label">예금주 <span class="req">*</span></label>
        <div class="field-btn"><input class="input" value="서지현">
          ${btn('계좌 인증', { cls: 'btn-primary', href: 'SE0202' })}</div>
        <p class="hint">본인 명의 계좌만 등록하실 수 있습니다. 1원 입금으로 확인합니다.</p></div>
      <div class="box"><b>✓ 2026년 3월 14일 인증 완료</b>
        <p class="t-sub mt1">계좌를 바꾸시면 다시 인증해야 하고, 확인에 1영업일이 걸립니다.</p></div>
    </div>`, { cls: 'mt6' })}

    ${card('사업자 구분', `<div class="radio-list">
      ${[['개인 (사업자 없음)', '지급할 때 3.3%를 원천징수합니다'],
      ['개인사업자 — 간이과세', '세금계산서 발행 의무가 없습니다'],
      ['개인사업자 — 일반과세', '세금계산서를 자동 발행합니다'],
      ['법인사업자', '세금계산서를 자동 발행합니다']]
      .map(([t, d], i) => `<label class="radio" data-group="biz"><input type="radio" name="biz"${i === 2 ? ' checked' : ''}>
        <span class="grow"><b>${t}</b><div class="t-sub mt1">${d}</div></span></label>`).join('')}
    </div>`, { cls: 'mt6' })}

    ${card('사업자 정보', `<div class="btns mb4">${btn('사업자 등록·수정', { cls: 'btn-ghost btn-sm', href: 'SE0203' })}</div>
    <div class="form">
      <div class="field-row">
        <div class="field grow"><label class="label">사업자등록번호</label><input class="input" value="512-81-00947"></div>
        <div class="field grow"><label class="label">상호</label><input class="input" value="제주농원 다래"></div>
      </div>
      <div class="field"><label class="label">대표자명</label><input class="input" value="서지현"></div>
      <div class="field"><label class="label">사업장 주소</label><input class="input" value="제주특별자치도 서귀포시 중산간동로 1234"></div>
      <div class="field"><label class="label">업태 / 종목</label>
        <div class="row" style="gap:8px"><input class="input" value="도소매"><input class="input" value="농산물"></div></div>
      <div class="field"><label class="label">사업자등록증</label>
        <div class="file-row"><span class="ico">📄</span><span class="grow">사업자등록증_제주농원다래.pdf</span><span class="t-sub">1.1MB</span>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="파일을 새 창에서 열었어요">보기</button>
          <button class="btn btn-ghost btn-sm" type="button" data-toast="파일을 지웠어요">삭제</button></div>
        ${btn('다시 올리기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="파일 선택 창이 열려요"' })}</div>
    </div>`, { cls: 'mt6' })}

    ${card('세금계산서 발행 정보', `<div class="form">
      <div class="field"><label class="label">받을 이메일</label><input class="input" value="tax@jejudarae.kr"></div>
      <div class="field"><label class="label">담당자</label>
        <div class="row" style="gap:8px"><input class="input" value="서지현" placeholder="이름"><input class="input" value="010-9876-5432" placeholder="연락처"></div></div>
      <label class="check"><input type="checkbox" checked><span>정산이 확정되면 세금계산서를 자동으로 발행합니다</span></label>
    </div>`, { cls: 'mt6' })}

    ${card('정산 주기', `<div class="radio-list">
      ${[['건별 정산 (기본)', '공구마다 배송 완료 후 7영업일 안에'],
      ['월 1회 (매월 15일)', '한 달 치를 모아서 한 번에'],
      ['월 2회 (5일·20일)', '보름씩 나눠서']]
      .map(([t, d], i) => `<label class="radio" data-group="cyc"><input type="radio" name="cyc"${i === 0 ? ' checked' : ''}>
        <span class="grow"><b>${t}</b><div class="t-sub mt1">${d}</div></span></label>`).join('')}
    </div>
    <p class="t-sub mt3">어느 쪽이든 최소 정산액은 1만원입니다. 그보다 적으면 다음 회차로 넘어갑니다.</p>`, { cls: 'mt6' })}`;

  const aside = card('세금 안내', `<b>원천징수</b>
    <p class="t-sub mt1">개인(사업자 없음)이시면 지급할 때 3.3%(소득세 3% + 지방소득세 0.3%)를 떼고 드립니다. 5월 종합소득세 신고 때 정산하시면 됩니다.</p>
    <div class="hr"></div>
    <b>부가세</b>
    <p class="t-sub mt1">일반과세 사업자시면 매출에 부가세가 포함되어 있습니다. 세금계산서는 정산 확정일에 자동 발행됩니다.</p>
    <div class="hr"></div>
    <b>예시 — 이번 달</b>
    ${sumRows([
    ['순정산액', won(22495730)],
    ['원천징수 (해당 없음)', '0원'],
  ], ['실지급액', won(22495730)])}
    <div class="btns mt4">${btn('저장', { cls: 'btn-primary btn-block', attr: ' data-toast="정산 설정을 저장했어요" data-toast-kind="ok"' })}</div>
    ${btn('정산 내역으로', { cls: 'btn-ghost btn-block', href: 'SE-01' })}`);

  const body = hostPage('SE-02', `${pageHd('정산 계좌·세금 설정')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── SE-03 정산 상세 ──────────────────────────────────
   v: 'tax' 세금계산서 다운로드 */
function se03(ctx, v) {
  const s = SETTLE[0];

  /* 세금계산서 다운로드 */
  if (v === 'tax') {
    const body = hostPage('SE-01', `
      ${pageHd('세금계산서', `${esc(s.deal)} · 2026년 7월분`)}

      ${card('발행된 계산서', `<div class="box">
        <div class="row-b wrap-row">
          <div><b>전자세금계산서</b><div class="t-sub mt1">승인번호 20260805-41000000-88a3c211</div></div>
          ${badge('발행 완료', 'b-ok')}
        </div>
        <div class="hr"></div>
        <div class="g2">
          <div><div class="t-sub">공급자</div>
            <b>모아공구 주식회사</b>
            <div class="t-sub mt1">512-81-00947 · 대표 서지현<br>서울 성동구 아차산로 111 5층</div></div>
          <div><div class="t-sub">공급받는 자</div>
            <b>제주농원 다래</b>
            <div class="t-sub mt1">616-**-***** · 대표 김다래<br>제주 서귀포시 중산간동로 1234</div></div>
        </div>
        <div class="hr"></div>
        ${table(
      ['품목', '수량', '공급가액', '세액'],
      [
        ['공동구매 정산금 (2026년 7월)', '1식', won(17264709), won(1726471)],
      ],
      { foot: ['합계', '', won(17264709), won(1726471)] },
    )}
        <div class="row-b mt4"><b>합계 금액</b><b class="price-lg">${won(18991180)}</b></div>
      </div>`)}

      ${card('내려받기', `<div class="g3">
        ${[['PDF', '인쇄·보관용', '📄'], ['XML', '회계 프로그램 등록용', '🧾'], ['ZIP', '월 전체 묶음', '🗂']]
      .map(([t, s2, ic]) => `<button class="box center" type="button" data-toast="${t} 파일을 내려받았어요" data-toast-kind="ok" style="cursor:pointer;border:1px solid var(--border);background:var(--surface)">
          <div style="font-size:24px">${ic}</div><b class="mt2" style="display:block">${t}</b>
          <div class="t-sub mt1">${s2}</div></button>`).join('')}
      </div>
      <div class="btns mt4">
        ${btn('메일로 다시 받기', { cls: 'btn-ghost', attr: ' data-toast="tax@jejudarae.kr 로 다시 보냈어요" data-toast-kind="ok"' })}
        ${btn('인쇄하기', { cls: 'btn-ghost', attr: ' data-toast="인쇄 창을 열었어요"' })}
      </div>`, { cls: 'mt6' })}

      ${card('발행 이력', table(
      ['발행일', '정산 월', '공급가액', '세액', '합계', '상태', ''],
      [
        ['2026-08-05', '2026년 7월', won(17264709), won(1726471), won(18991180), badge('발행 완료', 'b-ok'),
          '<button class="btn btn-ghost btn-sm" type="button" data-toast="PDF를 내려받았어요" data-toast-kind="ok">PDF</button>'],
        ['2026-07-26', '2026년 7월', won(3185955), won(318595), won(3504550), badge('발행 완료', 'b-ok'),
          '<button class="btn btn-ghost btn-sm" type="button" data-toast="PDF를 내려받았어요" data-toast-kind="ok">PDF</button>'],
        ['2026-07-10', '2026년 6월', won(7556545), won(755655), won(8312200), badge('발행 완료', 'b-ok'),
          '<button class="btn btn-ghost btn-sm" type="button" data-toast="PDF를 내려받았어요" data-toast-kind="ok">PDF</button>'],
      ],
    ), { cls: 'mt6' })}

      ${banner('mut', '🧾', `<b>국세청에 자동으로 전송됐습니다.</b>
        <p class="t-sub">홈택스에서도 조회하실 수 있습니다. 발행 취소는 발행일이 속한 달의 말일까지만 됩니다.</p>`,
      { cls: 'mt6', right: `<button class="btn btn-ghost btn-sm" type="button" data-toast="발행 취소를 요청했어요">발행 취소</button>` })}

      <div class="btns mt6">
        ${btn('정산 상세로', { cls: 'btn-ghost btn-lg', href: 'SE-03' })}
        ${btn('정산 내역으로', { cls: 'btn-ghost btn-lg', href: 'SE-01' })}
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '세금계산서 발행 완료 · 18,991,180원' } };
  }

  const main = `
    ${card('정산 대상', `<div class="row-b wrap-row">
      <div><b>${esc(s.deal)}</b><div class="t-sub mt1">2026년 7월 30일 성사 · 최종 486명 · 배송 완료 484건</div></div>
      ${stBadge(s.st)}
    </div>`)}

    ${card('매출 구성', table(
    ['구분', '건수', '단가', '금액'],
    [
      ['기본 (3개입)', '412건', won(41400), won(17056800)],
      ['추가 구성 (6개입)', '74건', won(82800), won(6127200)],
      ['취소·환불', '−3건', '—', '−' + won(124200)],
      ['배송비 (참여자 부담)', '0건', '무료', '0원'],
    ],
    { foot: ['합계', '483건', '', won(s.gross - s.refund)] },
  ), { cls: 'mt6' })}

    ${card('차감 항목', `${sumRows([
    ['총 매출', won(s.gross)],
    ['취소·환불', '−' + won(s.refund)],
    ['플랫폼 수수료 (5%)', '−' + won(s.fee)],
    ['알림톡 발송 비용', '−4,374원 (486건 × 9원)'],
    ['쿠폰 분담금', '−' + won(96000)],
  ], ['순정산액', won(s.net - 4374 - 96000)])}
    <div class="box box-mut mt3"><p class="t-sub">쿠폰 분담금은 플랫폼 쿠폰이 쓰였을 때 진행자가 나눠 부담하는 몫입니다. 이번엔 32건에 3,000원씩 적용됐습니다.</p></div>`,
    { cls: 'mt6' })}

    ${card('진행 상태', timeline([
    ['공구 성사', '2026년 7월 30일 21:00'],
    ['배송 완료 확인', '2026년 8월 3일 · 484/486건'],
    ['정산 확정', '2026년 8월 5일 예정'],
    ['지급', `${s.pay} 예정 · 국민은행 ***-**-**1923`],
  ], 2), { cls: 'mt6' })}

    ${card('참고', `<ul style="padding-left:18px;line-height:1.9" class="t-sub">
      <li>배송이 확인되지 않은 2건은 확인되는 대로 다음 정산에 포함됩니다.</li>
      <li>반품·환불이 정산 확정 뒤에 생기면 다음 회차에서 차감됩니다.</li>
      <li>지급일이 영업일이 아니면 다음 영업일에 보내드립니다.</li>
    </ul>`, { cls: 'mt6' })}`;

  const aside = card('', `<div class="center">${stBadge(s.st)}
      <div class="price-lg mt2">${won(s.net - 4374 - 96000)}</div>
      <p class="t-sub">${s.pay} 지급 예정</p></div>
    <div class="hr"></div>
    ${kv([
    ['정산 월', s.m.replace('-', '년 ') + '월'],
    ['매출', won(s.gross)],
    ['수수료율', '5% (A등급 4% 적용 예정)'],
    ['입금 계좌', '국민은행 ***-**-**1923'],
  ])}
    <div class="btns mt4">
      ${btn('거래명세서 내려받기', { cls: 'btn-primary btn-block', attr: ' data-toast="거래명세서를 내려받았어요" data-toast-kind="ok"' })}
    </div>
    ${btn('세금계산서 보기', { cls: 'btn-ghost btn-block', href: 'SE0302' })}
    ${btn('정산 문의', { cls: 'btn-ghost btn-block', href: 'CS-02' })}
    <div class="hr"></div>
    <div class="row" style="gap:8px">
      ${btn('‹ 이전 정산', { cls: 'btn-ghost btn-sm grow', attr: ' data-toast="6월 정산으로 옮겼어요"' })}
      ${btn('다음 정산 ›', { cls: 'btn-ghost btn-sm grow', off: true })}
    </div>`);

  const body = hostPage('SE-01', `${pageHd('정산 상세')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── CS-01 이용 안내·자주 묻는 질문 ───────────────────
   v: 'host' 진행자용 탭 · 'search' 검색 결과 */
function cs01(ctx, v) {
  /* 진행자용 탭 */
  if (v === 'host') {
    const body = `
    ${pageHd('이용 안내', '진행자로 활동하시는 분을 위한 안내입니다')}
    ${tabs([{ label: '참여자용', go: 'CS0101' }, { label: '진행자용', go: 'CS0102' }], 1)}

    ${card('진행자가 하는 일', `<div class="g4">
      ${[['🔎', '상품 구하기', '팔 상품과 공급처를 정합니다'],
      ['📝', '공구 열기', '가격 단계·목표 인원·기간을 정해 올립니다'],
      ['📣', '사람 모으기', '알림과 공유로 참여자를 모읍니다'],
      ['📦', '발주·배송', '성사되면 발주하고 배송을 챙깁니다']]
      .map(([ic, t, s]) => `<div class="box"><div style="font-size:24px">${ic}</div>
        <b class="mt2" style="display:block">${t}</b><p class="t-sub mt2">${s}</p></div>`).join('')}
    </div>`)}

    ${card('진행자 자주 묻는 질문', accordion([
      { q: '사업자가 아니어도 되나요?', a: '됩니다. 다만 반복해서 파시면 통신판매업 신고가 필요할 수 있습니다. 정산할 때 개인은 3.3%를 원천징수합니다.' },
      { q: '재고를 미리 사 둬야 하나요?', a: '아니요. 성사가 확정된 뒤 발주하시면 됩니다. 재고 위험이 거의 없는 것이 공동구매의 장점입니다.' },
      { q: '검수는 얼마나 걸리나요?', a: '영업일 기준 1~2일입니다. 반려되면 무엇을 고쳐야 하는지 적어 드립니다.' },
      { q: '수수료는 얼마인가요?', a: '결제액의 5%이고 첫 공구는 0%입니다. 신뢰 등급 A가 되면 4%로 내려갑니다.' },
      { q: '언제 정산받나요?', a: '배송 완료가 확인된 뒤 7영업일 안에 등록하신 계좌로 보내드립니다.' },
      { q: '불발되면 손해인가요?', a: '아닙니다. 참여자에게 전액 환불되고 수수료도 없습니다. 다만 성사율이 낮으면 등급이 내려갑니다.' },
    ], 0), { cls: 'mt6', more: 'HS0103', moreLabel: '진행자 FAQ 전체' })}

    ${card('진행자 화면 둘러보기', `<div class="g3">
      ${[['진행자 대시보드', '오늘 할 일과 진행 중인 공구', 'HM-01'],
      ['공구 개설', '상품·가격 단계·기간 설정', 'HS-02'],
      ['참여 현황', '누가 얼마나 참여했는지', 'HM-02'],
      ['마감·성사 처리', '연장·성사·불발 결정', 'HM-03'],
      ['발주·배송', '발주서·송장·반품', 'HM-04'],
      ['정산', '수수료·세금계산서·계좌', 'SE-01']]
      .map(([t, s, go]) => `<a class="box" href="${link(go)}"><b>${t}</b>
        <p class="t-sub mt2">${s}</p></a>`).join('')}
    </div>`, { cls: 'mt6' })}

    ${card('지켜 주셔야 할 것', `<ul style="padding-left:18px;line-height:2">
      <li><b>약속한 발송일을 지켜 주세요.</b> 늦어질 것 같으면 미리 공지하시면 등급에 영향이 적습니다.</li>
      <li><b>다른 쇼핑몰 사진을 쓰지 마세요.</b> 검수에서 가장 많이 걸리는 항목입니다.</li>
      <li><b>문의에 하루 안에 답해 주세요.</b> 답변률이 노출 순위에 들어갑니다.</li>
      <li><b>금지 품목을 확인하세요.</b> 의약품·주류·건강기능식품 일부는 팔 수 없습니다.</li>
    </ul>`, { cls: 'mt6', aside: `<a class="more" href="${link('CS-04')}">환불·분쟁 정책 ›</a>` })}

    <div class="btns mt6 center">
      ${btn('진행자 시작하기', { cls: 'btn-primary btn-lg', href: 'HS-01' })}
      ${btn('진행자 전용 문의', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
    </div>`;
    return { body, o: { state: '진행자용 탭' } };
  }

  /* 검색 결과 */
  if (v === 'search') {
    const hits = [
      ['성사가 안 되면 결제한 돈은 어떻게 되나요?', '성사·환불', '자동으로 <b>전액 환불</b>됩니다. 마감 직후 바로 환불이 걸리고, 카드사에 따라 2~5영업일 안에…'],
      ['불발됐는데 환불이 안 들어왔어요', '환불 정책', '카드사에 따라 2~5영업일 걸립니다. 5영업일이 지나도 확인되지 않으시면 결제일과…'],
      ['차액 환급은 언제 되나요?', '환불 정책', '성사가 확정된 뒤 자동으로 처리됩니다. 결제하신 수단으로 그대로 <b>환불</b>해 드리며…'],
      ['마감 전에 취소할 수 있나요?', '참여·결제', '네. 마감 전에는 수수료 없이 언제든 취소하실 수 있습니다. 다만 취소하시면…'],
      ['환불 수단별 걸리는 시간', '환불 정책', '카드 2~5영업일 · 간편결제 즉시~1일 · 계좌이체 1~2영업일 · 적립금은 즉시 복구…'],
    ];
    const body = `
    ${pageHd('검색 결과', '‘환불’ 검색 결과 5건')}
    <div class="searchbar mb6">
      <input class="input" type="search" value="환불">
      ${btn('검색', { cls: 'btn-primary', attr: ' data-toast="검색했어요"' })}
    </div>
    ${chips(['전체 5', 'FAQ 4', '정책 1', '공지 0'], 0)}

    ${card('', hits.map(([q, kind, snippet]) => `<a class="list-row" href="${link(kind === '환불 정책' ? 'CS-04' : 'CS-01')}" style="align-items:flex-start">
      <div class="grow"><div class="row" style="gap:8px">${badge(kind, 'b-mut')}<b>${q}</b></div>
        <p class="t-sub mt2">${snippet}</p></div>
      <span class="muted">›</span></a>`).join(''), { cls: 'mt4' })}

    ${card('찾으시는 게 없나요', `<p class="t-sub">이렇게 검색해 보세요 — <b>환불 기간</b>, <b>불발 환불</b>, <b>차액 환급</b></p>
      <div class="row wrap-row mt3" style="gap:8px">
        ${['환불 기간', '불발 환불', '차액 환급', '취소 수수료', '반품 배송비'].map((t) =>
      `<button class="chip" type="button" data-toast="‘${t}’로 다시 찾았어요">${t}</button>`).join('')}
      </div>
      <div class="btns mt4">${btn('1:1 문의하기', { cls: 'btn-primary', href: 'CS-02' })}
        ${btn('챗봇에게 묻기', { cls: 'btn-ghost', attr: ' data-toast="챗봇 창을 열었어요"' })}</div>`,
      { cls: 'mt6' })}

    ${sec('많이 찾는 질문', accordion(FAQ.slice(0, 3), -1), { cls: 'mt6' })}`;
    return { body, o: { state: '검색 결과 · ‘환불’ 5건' } };
  }

  const body = `
  ${pageHd('이용 안내', '공동구매가 처음이셔도 어렵지 않습니다')}
  ${tabs([{ label: '참여자용', go: 'CS0101' }, { label: '진행자용', go: 'CS0102' }], 0)}

  ${card('공동구매란', `<p>정해진 인원이 모여야 거래가 성사되는 방식입니다. 사람이 많이 모일수록 값이 내려가고, 목표에 못 미치면 없던 일이 됩니다.</p>
    <div class="g3 mt4">
      ${[['💳', '조건부 결제', '참여할 때 결제하지만, 성사되기 전까지는 확정이 아닙니다.'],
    ['✅', '성사', '마감까지 목표 인원이 모이면 확정되고 배송이 시작됩니다.'],
    ['↩️', '불발', '못 모으면 그 자리에서 전액 자동 환불됩니다. 신청할 필요 없습니다.']]
      .map(([ic, t, d]) => `<div class="box"><div style="font-size:26px">${ic}</div><b class="mt2" style="display:block">${t}</b>
        <p class="t-sub mt2">${d}</p></div>`).join('')}
    </div>`)}

  ${sec('참여하시는 분', `<div class="g3">
    ${[['1', '공구 고르기', '마음에 드는 공구를 찾아 달성률과 마감 시각을 봅니다.'],
    ['2', '참여·결제', '옵션과 수량을 고르고 결제합니다. 이때는 아직 확정이 아닙니다.'],
    ['3', '기다리기', '성사되면 배송이 시작되고, 불발되면 전액 돌아옵니다.']]
      .map(([n, t, d]) => `<div class="box"><div class="row" style="gap:10px"><span class="badge b-pri">${n}</span><b>${t}</b></div>
        <p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`, { cls: 'mt8' })}

  ${sec('공구를 여시는 분 (진행자)', `<div class="g3">
    ${[['1', '상품 구하기', '팔 상품과 공급처를 정합니다. 재고를 미리 살 필요는 없습니다.'],
    ['2', '공구 열기', '가격 단계와 목표 인원을 정해 올리면 1~2일 안에 검수가 끝납니다.'],
    ['3', '발주·배송', '성사되면 발주하고 송장을 올립니다. 배송 확인 후 정산받습니다.']]
      .map(([n, t, d]) => `<div class="box"><div class="row" style="gap:10px"><span class="badge b-acc">${n}</span><b>${t}</b></div>
        <p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`, { cls: 'mt8', more: 'HS-01', moreLabel: '진행자 시작 안내' })}

  ${sec('자주 묻는 질문', `<div class="searchbar mb4">
    <input class="input" type="search" placeholder="궁금한 것을 검색해 보세요">
    ${btn('검색', { cls: 'btn-primary', href: 'CS0103' })}
  </div>
  ${chips(['전체', '참여·결제', '성사·환불', '배송', '진행자', '정산'], 0)}
  <div class="mt4">${accordion(FAQ, 0)}</div>`, { cls: 'mt8' })}

  ${sec('알아 두면 좋은 말', `<div class="g2">
    ${[['달성률', '목표 인원 대비 지금까지 모인 비율입니다. 100%가 되면 성사됩니다.'],
    ['단계별 가격', '인원 구간마다 값이 다릅니다. 더 많이 모이면 이미 참여하신 분도 차액을 돌려받습니다.'],
    ['진행자', '공구를 여는 사람입니다. 상품을 구해 오고 배송까지 챙깁니다.'],
    ['조건부 결제', '결제는 하지만 성사되어야 확정되는 방식입니다.']]
      .map(([t, d]) => `<div class="box"><b>${t}</b><p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`, { cls: 'mt8' })}

  ${card('', `<div class="row-b wrap-row">
    <div><b>여기서 해결되지 않으셨나요?</b>
      <p class="t-sub mt1">평일 10:00–18:00에 답변해 드립니다. 챗봇은 24시간 열려 있어요.</p></div>
    <div class="btns">${btn('1:1 문의하기', { cls: 'btn-primary', href: 'CS-02' })}
      ${btn('챗봇에게 묻기', { cls: 'btn-ghost', attr: ' data-toast="챗봇 창을 열었어요"' })}</div>
  </div>`, { cls: 'mt8' })}`;
  return { body, o: {} };
}

/* ── CS-02 1:1 문의 ───────────────────────────────────
   v: 'write' 문의 작성 · 'detail' 내 문의 상세 */
function cs02(ctx, v) {
  /* 내 문의 상세 */
  if (v === 'detail') {
    const body = myPage('CS-02', `
      ${pageHd('내 문의 상세', '접수번호 CS-20260804-1182')}

      ${card('', `<div class="row-b wrap-row">
        <div class="row" style="gap:10px">${badge('성사·환불', 'b-mut')}<b>불발된 공구 환불이 아직 안 들어왔어요</b></div>
        ${badge('답변 대기', 'b-warn')}
      </div>
      <div class="t-sub mt2">2026년 8월 4일 19:40 접수 · 관련 공구: 겨울 기모 맨투맨 (MG20260714-2884)</div>`)}

      ${card('진행 상태', timeline([
      ['문의 접수', '2026년 8월 4일 19:40'],
      ['담당자 배정', '2026년 8월 4일 19:42 · 결제팀'],
      ['확인 중', '지금 여기 — 카드사에 조회 중입니다'],
      ['답변', '1영업일 안에 (8월 5일 예정)'],
    ], 2), { cls: 'mt6' })}

      ${card('주고받은 내용', `<div class="review">
        <div class="row" style="gap:10px">${phAva(36, 'me')}
          <div><b>김하늘</b><div class="t-sub">2026년 8월 4일 19:40</div></div></div>
        <p class="mt3">7월 14일에 불발된 공구 환불이 아직 안 들어왔습니다.
        29,900원이고 국민카드로 결제했습니다. 벌써 3주가 지났는데 카드 명세서에도 취소 내역이 없어요.
        확인 부탁드립니다.</p>
        <div class="row mt3" style="gap:8px">${phFix(['첨부 사진', 1000, 1000], 84, { seed: 'cs1' })}</div>
      </div>
      <div class="review">
        <div class="row" style="gap:10px">${badge('운영팀', 'b-pri')}
          <div><b>모아공구 고객센터</b><div class="t-sub">2026년 8월 4일 19:42 · 자동 안내</div></div></div>
        <p class="mt3">문의 주셔서 고맙습니다. 결제팀에 배정했고 1영업일 안에 답변드리겠습니다.
        카드사 조회에 하루가 걸릴 수 있는 점 양해 부탁드립니다.</p>
      </div>`, { cls: 'mt6' })}

      ${card('추가로 물어보기', `<textarea class="textarea" rows="4" placeholder="덧붙이실 말씀이 있으면 적어 주세요"></textarea>
      <div class="row-b mt3">
        <button class="btn btn-ghost btn-sm" type="button" data-toast="파일 선택 창이 열려요">파일 첨부</button>
        ${btn('보내기', { cls: 'btn-primary', attr: ' data-toast="추가 문의를 보냈어요" data-toast-kind="ok"' })}
      </div>`, { cls: 'mt6' })}

      ${banner('mut', '📌', `<b>먼저 확인해 보시면 좋은 것</b>
        <p class="t-sub">카드 결제 취소는 결제한 달과 취소한 달이 다르면 다음 달 청구서에서 상계되기도 합니다. 이 경우 실제로 돈이 빠져나가지 않습니다.</p>`,
      { cls: 'mt6', right: btn('환불 정책 보기', { cls: 'btn-ghost btn-sm', href: 'CS-04' }) })}

      <div class="btns mt6">
        ${btn('문의 목록으로', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
        <button class="btn btn-ghost btn-lg" type="button" data-toast="문의를 닫았어요">해결됐어요 · 문의 닫기</button>
      </div>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '내 문의 상세 · 답변 대기 (접수 후 1시간)' } };
  }

  /* 문의 작성 */
  if (v === 'write') {
    const body = myPage('CS-02', `
      ${pageHd('문의 작성')}
      ${stepbar(['유형 고르기', '내용 쓰기', '접수'], 1)}

      ${card('무엇에 대한 문의인가요', `<div class="row wrap-row" style="gap:8px">
        ${chips(['참여·결제', '성사·환불', '배송', '진행자', '정산', '신고', '기타'], 1)}
      </div>
      <div class="box mt4"><b>‘성사·환불’ 문의에서 가장 많이 나오는 것</b>
        <div class="mt3">${[['불발 환불이 안 들어왔어요', 'CS-04'], ['차액 환급은 언제 되나요', 'CS-04'], ['마감 전에 취소하고 싶어요', 'MY-03']]
      .map(([t, go]) => `<a class="list-row" href="${link(go)}" style="padding:9px 0">
          <div class="grow">${t}</div><span class="muted">›</span></a>`).join('')}</div>
        <p class="t-sub mt2">위에서 답을 찾으시면 더 빠릅니다.</p></div>`)}

      ${card('내용', `<div class="form" style="max-width:none">
        <div class="field"><label class="label">관련 공구·주문</label>
          <select class="select"><option>고르지 않음</option><option selected>겨울 기모 맨투맨 (MG20260714-2884)</option><option>제주 한라봉 5kg (MG20260803-4417)</option></select>
          <p class="hint">고르시면 결제·배송 기록을 함께 보고 답변드립니다</p></div>
        <div class="field"><label class="label">제목 <span class="req">*</span></label>
          <input class="input" value="불발된 공구 환불이 아직 안 들어왔어요"></div>
        <div class="field"><label class="label">내용 <span class="req">*</span></label>
          <textarea class="textarea" rows="7">7월 14일에 불발된 공구 환불이 아직 안 들어왔습니다. 29,900원이고 국민카드로 결제했습니다. 벌써 3주가 지났는데 카드 명세서에도 취소 내역이 없어요. 확인 부탁드립니다.</textarea>
          <p class="hint">언제 무엇을 하셨고 무엇이 문제인지 적어 주시면 답이 빨라집니다</p></div>
        <div class="field"><label class="label">첨부</label>
          <div class="file-row is-ok"><span>🖼</span><span class="grow">카드명세서_20260804.jpg</span><span class="t-sub">820KB</span>
            <button class="btn btn-ghost btn-sm" type="button" data-toast="파일을 뺐어요">빼기</button></div>
          <div class="upload mt2" style="padding:18px"><b>사진이나 파일을 끌어다 놓으세요</b>
            <p class="t-sub">JPG·PNG·PDF · 최대 5개 · 파일당 10MB</p></div></div>
        <div class="field-row">
          <div class="field"><label class="label">답변 받을 방법</label>
            <select class="select"><option selected>앱 알림</option><option>이메일</option><option>문자</option></select></div>
          <div class="field"><label class="label">연락처</label><input class="input" value="010-1234-5678"></div>
        </div>
      </div>`, { cls: 'mt6' })}

      <div class="btns mt6">
        ${btn('문의 보내기', { cls: 'btn-primary btn-lg', href: 'CS0203' })}
        ${btn('임시 저장', { cls: 'btn-ghost btn-lg', attr: ' data-toast="임시 저장했어요" data-toast-kind="ok"' })}
        ${btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
      </div>
      <p class="t-sub center mt4">보통 <b>1영업일</b> 안에 답변드립니다 · 평일 10:00–18:00</p>`);
    return { body, o: { wrapCls: 'wrap wrap-full', state: '문의 작성 중 · 성사·환불' } };
  }

  const main = `
    ${banner('pri', '🤖', `<b>먼저 챗봇에게 물어보시면 더 빠릅니다.</b>
      <p class="t-sub">환불 시점, 배송 조회, 참여 취소 같은 것은 챗봇이 바로 답해 드립니다.</p>`,
    { right: btn('챗봇 열기', { cls: 'btn-primary btn-sm', attr: ' data-toast="챗봇 창을 열었어요"' }) })}

    ${card('문의하기', `<div class="field"><label class="label">어떤 문의신가요 <span class="danger">*</span></label>
      <div class="row wrap-row" style="gap:8px">
        ${chips(['참여·결제', '성사·환불', '배송', '진행자', '정산', '신고', '기타'], 1)}
      </div></div>
    <div class="field"><label class="label">관련 공구·주문 <span class="t-sub">(있으면 골라 주세요)</span></label>
      <select class="select"><option>고르지 않음</option><option selected>제주 한라봉 5kg 산지직송 (MG20260803-4417)</option><option>독일산 냄비 3종 세트 (MG20260728-3902)</option></select></div>
    <div class="field"><label class="label">제목 <span class="danger">*</span></label><input class="input" placeholder="한 줄로 요약해 주세요"></div>
    <div class="field"><label class="label">내용 <span class="danger">*</span></label>
      <textarea class="textarea" rows="6" placeholder="언제 무엇을 하셨고 무엇이 문제인지 적어 주시면 답이 빨라집니다."></textarea></div>
    <div class="field"><label class="label">첨부</label>
      <div class="upload" style="padding:20px"><b>사진이나 파일을 끌어다 놓으세요</b>
        <p class="t-sub">JPG·PNG·PDF · 최대 5개 · 파일당 10MB</p>
        ${btn('파일 고르기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="파일 선택 창이 열려요"' })}</div></div>
    <div class="field-row">
      <div class="field grow"><label class="label">답변 받을 방법</label>
        <select class="select"><option selected>앱 알림</option><option>이메일</option><option>문자</option></select></div>
      <div class="field grow"><label class="label">연락처</label><input class="input" value="010-1234-5678"></div>
    </div>
    <div class="row-b mt3">
      <span class="t-sub">보통 <b>1영업일</b> 안에 답변드립니다</span>
      ${btn('문의 작성 화면으로', { cls: 'btn-primary', href: 'CS0202' })}
    </div>`, { cls: 'mt6' })}

    ${card('내 문의 내역', table(
    ['접수일', '유형', { t: '제목', w: '32%' }, '상태', ''],
    [
      ['2026-08-04', '성사·환불', '불발된 공구 환불이 아직 안 들어왔어요', badge('답변 대기', 'b-warn'), btn('보기', { cls: 'btn-ghost btn-sm', href: 'CS0203' })],
      ['2026-07-29', '배송', '송장번호가 조회되지 않습니다', badge('답변 완료', 'b-ok'), btn('보기', { cls: 'btn-ghost btn-sm', href: 'CS0203' })],
      ['2026-07-15', '참여·결제', '쿠폰이 적용되지 않아요', badge('답변 완료', 'b-ok'), btn('보기', { cls: 'btn-ghost btn-sm', href: 'CS0203' })],
    ],
  ), { cls: 'mt6' })}

    ${card('답변 예시', `<div class="row" style="gap:10px">${badge('운영팀', 'b-pri')}<b>모아공구 고객센터</b><span class="t-sub">2026-07-30 10:12</span></div>
      <p class="mt3">안녕하세요. 확인해 보니 7월 29일 오후에 발송되어 송장번호가 아직 택배사 시스템에 올라가지 않은 상태였습니다.
      지금은 조회되실 겁니다. 8월 1일 도착 예정이며, 혹시 그때까지 안 오시면 다시 알려 주세요.</p>
      <div class="row mt3" style="gap:8px">
        <button class="btn btn-ghost btn-sm" type="button" data-toast="도움이 됐다고 표시했어요">👍 해결됐어요</button>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="추가 문의 입력창을 열었어요">추가로 물어보기</button>
      </div>`, { cls: 'mt6' })}`;

  const aside = card('빠르게 해결하기', `${[
    ['환불이 언제 들어오나요', 'CS-04'],
    ['배송 조회하기', 'MY-01'],
    ['참여 취소하기', 'MY-03'],
    ['진행자에게 직접 묻기', 'RV-02'],
    ['이용 안내 보기', 'CS-01'],
  ].map(([t, go]) => `<a class="feed-row" href="${link(go)}"><div class="grow">${t}</div><span class="muted">›</span></a>`).join('')}
    <div class="hr"></div>
    ${kv([['운영 시간', '평일 10:00–18:00'], ['평균 답변', '4시간'], ['전화', '1670-3120']])}
    <div class="box box-mut mt3"><p class="t-sub">점심시간(12:30–13:30)과 주말·공휴일에는 답변이 늦어질 수 있습니다.</p></div>`);

  const body = myPage('CS-02', `${pageHd('1:1 문의')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── CS-03 공지·이벤트 ────────────────────────────────
   v: 'notice' 공지 상세 · 'event' 이벤트 상세 */
function cs03(ctx, v) {
  /* 공지 상세 */
  if (v === 'notice') {
    const body = `
    ${pageHd('공지 상세')}
    ${card('', `<div class="row wrap-row mb3" style="gap:8px">${badge('중요', 'b-danger')}${badge('공지', 'b-mut')}
      <span class="t-sub">2026년 8월 1일 · 조회 4,182</span></div>
      <h1 class="t-page">추석 연휴 배송·정산 일정 안내</h1>
      <div class="hr"></div>
      <p>안녕하세요, 모아공구입니다.</p>
      <p class="mt3">추석 연휴(9월 24일~27일) 동안 택배사가 쉬면서 배송과 정산 일정이 아래와 같이 바뀝니다.
      연휴 전후로 공구를 여시거나 참여하시는 분은 미리 확인해 주세요.</p>

      <h3 class="t-card mt6 mb3">1. 배송</h3>
      ${table(
      ['구분', '평소', '연휴 기간'],
      [
        ['택배 접수', '매일', '<b>9월 23일 15시까지</b>'],
        ['배송 재개', '—', '<b>9월 28일부터</b>'],
        ['제주·도서산간', '2~3일', '연휴 뒤 3~5일 (물량 몰림)'],
      ],
    )}

      <h3 class="t-card mt6 mb3">2. 정산</h3>
      <p class="t-sub">정산 지급일은 <b>영업일 기준</b>으로 셉니다. 연휴는 영업일에서 빠지므로,
      9월 20일쯤 확정된 정산은 10월 초에 지급됩니다.</p>

      <h3 class="t-card mt6 mb3">3. 고객센터</h3>
      <p class="t-sub">9월 24~27일은 쉽니다. 급한 일은 챗봇으로 접수해 주시면 28일 오전에 순서대로 답변드립니다.</p>

      <div class="box mt6"><b>진행자님께</b>
        <p class="t-sub mt1">연휴 전에 마감되는 공구는 발송 일정을 넉넉히 잡아 주세요.
        연휴 중 발송으로 적으시면 검수에서 반려될 수 있습니다.
        이미 열어 두신 공구의 발송일을 늦추셔야 한다면 배송 지연 공지를 미리 보내 주세요.</p>
        <div class="btns mt3">${btn('배송 지연 공지 보내기', { cls: 'btn-ghost btn-sm', href: 'HM0404' })}</div></div>

      <div class="hr"></div>
      <p class="t-sub">문의는 1:1 문의로 남겨 주세요. 고맙습니다.</p>`)}

    ${card('', `<div class="row-b wrap-row">
      <a class="grow" href="${link('CS0302')}"><div class="t-sub">이전 글</div><b>조건부 결제 규정 일부 변경 (8/15 시행)</b></a>
      <a class="right" href="${link('CS0303')}"><div class="t-sub">다음 글</div><b>신규 진행자 지원 이벤트</b></a>
    </div>`, { cls: 'mt6' })}

    <div class="btns mt6 center">
      ${btn('목록으로', { cls: 'btn-ghost btn-lg', href: 'CS-03' })}
      ${btn('알림으로 받기', { cls: 'btn-primary btn-lg', href: 'AC-03' })}
    </div>`;
    return { body, o: { state: '공지 상세 · 2026-08-01' } };
  }

  /* 이벤트 상세 */
  if (v === 'event') {
    const body = `
    ${pageHd('이벤트 상세')}
    ${card('', `<div class="row wrap-row mb3" style="gap:8px">${badge('이벤트', 'b-pri')}
      <span class="t-sub">2026년 7월 18일 ~ 8월 31일</span>${badge('진행 중', 'b-ok')}</div>
      <h1 class="t-page">신규 진행자 지원 — 첫 공구 수수료 0%</h1>
      <div class="mt4">${ph(['이벤트 배너', 1600, 600], { seed: 'ev1' })}</div>
      <div class="hr"></div>
      <p>8월 한 달 동안 처음 공구를 여시는 분께 <b>첫 공구 수수료를 받지 않습니다.</b>
      상품을 구할 곳만 있으면 누구나 시작하실 수 있습니다.</p>

      <h3 class="t-card mt6 mb3">누가 받을 수 있나요</h3>
      <ul style="padding-left:18px;line-height:2">
        <li>모아공구에서 <b>공구를 연 적이 없는</b> 계정</li>
        <li>2026년 8월 31일까지 <b>검수를 통과해 오픈</b>한 공구</li>
        <li>계정당 1회 · 성사된 공구에 한함</li>
      </ul>

      <h3 class="t-card mt6 mb3">얼마나 아끼시나요</h3>
      ${table(
      ['공구 규모', '매출', '평소 수수료 5%', '이벤트 적용'],
      [
        ['50명 × 3만원', won(1500000), '−' + won(75000), '<b>0원</b>'],
        ['150명 × 3만원', won(4500000), '−' + won(225000), '<b>0원</b>'],
        ['300명 × 2.5만원', won(7500000), '−' + won(375000), '<b>0원</b>'],
      ],
    )}

      <h3 class="t-card mt6 mb3">유의사항</h3>
      <ul style="padding-left:18px;line-height:2" class="t-sub">
        <li>불발된 공구는 원래 수수료가 없어, 이벤트 혜택도 쓰이지 않고 남아 있습니다.</li>
        <li>결제 대행 수수료는 플랫폼 수수료에 포함되어 있어 따로 떼지 않습니다.</li>
        <li>부정한 방법으로 여러 계정을 만드시면 혜택이 취소됩니다.</li>
        <li>이벤트는 사정에 따라 조기 종료될 수 있으며, 종료 시 공지합니다.</li>
      </ul>

      <div class="box mt6 center">
        <b>남은 기간</b>
        <div class="t-page mt2" style="font-size:32px">25일</div>
        <p class="t-sub">2026년 8월 31일 23:59까지</p>
        <div class="btns mt4 center">${btn('진행자 시작하기', { cls: 'btn-primary btn-lg', href: 'HS-01' })}
          ${btn('공구 개설하기', { cls: 'btn-ghost btn-lg', href: 'HS-02' })}</div>
      </div>`)}

    ${card('함께 보면 좋은 것', `<div class="g3">
      ${[['수수료·정산 자세히', '얼마를 떼고 언제 들어오는지', 'HS0102'],
      ['진행자 FAQ', '자주 묻는 질문 13개', 'HS0103'],
      ['공구 개설하기', '10분이면 올리실 수 있습니다', 'HS-02']]
      .map(([t, s, go]) => `<a class="box" href="${link(go)}"><b>${t}</b><p class="t-sub mt2">${s}</p></a>`).join('')}
    </div>`, { cls: 'mt6' })}

    <div class="btns mt6 center">${btn('목록으로', { cls: 'btn-ghost btn-lg', href: 'CS-03' })}</div>`;
    return { body, o: { state: '이벤트 상세 · 진행 중 (8월 31일까지)' } };
  }

  const body = `
  ${pageHd('공지·이벤트')}

  ${sec('', `<div class="g2">
    <a class="promo" href="${link('CS0303')}"><b>신규 진행자 지원 이벤트</b>
      <p>첫 공구는 수수료 0%. 8월 한 달 동안 새로 시작하시는 분께 드립니다.</p>
      <span class="btn btn-accent btn-sm mt3">자세히 보기</span></a>
    <a class="promo alt" href="${link('HO-03')}"><b>여름 마감 세일</b>
      <p>8월 10일까지 열리는 공구는 배송비를 모아공구가 부담합니다.</p>
      <span class="btn btn-ghost btn-sm mt3">참여 공구 보기</span></a>
  </div>`)}

  ${chips(['전체', '공지', '이벤트', '점검', '정책 변경'], 0)}

  ${card('', NOTICES.map((n) => `<a class="row-b list-row" href="${link('CS0302')}" style="padding:14px 0">
    <div class="row grow" style="gap:10px">
      ${n.pin ? badge('중요', 'b-danger') : badge('공지', 'b-mut')}
      <b>${esc(n.t)}</b></div>
    <span class="t-sub nowrap">${n.at}</span></a>`).join('')
    + `<div class="pager mt4">
      <button class="btn btn-ghost btn-sm" type="button" disabled>‹ 이전</button>
      ${[1, 2, 3].map((p) => `<button class="btn ${p === 1 ? 'btn-primary' : 'btn-ghost'} btn-sm" type="button" data-toast="${p}페이지를 불러왔어요">${p}</button>`).join('')}
      <button class="btn btn-ghost btn-sm" type="button" data-toast="2페이지를 불러왔어요">다음 ›</button>
    </div>`, { cls: 'mt4' })}

  ${card('추석 연휴 배송·정산 일정 안내', `<div class="row-b wrap-row mb3">
    <div class="row" style="gap:8px">${badge('중요', 'b-danger')}<span class="t-sub">2026년 8월 1일</span></div>
    ${btn('공지 전체 보기', { cls: 'btn-ghost btn-sm', href: 'CS0302' })}</div>
    <p>추석 연휴(9월 24일~27일) 동안 택배사가 쉬어 배송과 정산 일정이 아래와 같이 바뀝니다.</p>
    <div class="mt4">${table(
      ['구분', '평소', '연휴 기간'],
      [
        ['택배 접수', '매일', '9월 23일 15시까지'],
        ['배송 재개', '—', '9월 28일부터'],
        ['정산 지급', '확정 후 7영업일', '연휴 제외하고 셉니다'],
        ['고객센터', '평일 10–18시', '9월 24~27일 휴무'],
      ],
    )}</div>
    <div class="box box-warn mt4"><b>진행자님께</b>
      <p class="t-sub mt1">연휴 전에 마감되는 공구는 발송 일정을 넉넉히 잡아 주세요. 연휴 중 발송으로 적으시면 검수에서 반려될 수 있습니다.</p></div>`,
    { cls: 'mt6' })}

  <div class="btns mt6 center">${btn('알림으로 받기', { cls: 'btn-primary', href: 'AC-03' })}</div>`;
  return { body, o: {} };
}

/* ── CS-04 환불·분쟁 정책 안내 ────────────────────────
   v: 'process' 분쟁 처리 절차 · 'report' 신고 접수 */
function cs04(ctx, v) {
  /* 분쟁 처리 절차 */
  if (v === 'process') {
    const body = `
    ${pageHd('분쟁 처리 절차', '진행자와 이야기가 안 될 때 운영팀이 개입합니다')}

    ${card('전체 흐름', `${hsteps(['진행자에게 문의', '신고 접수', '자료 확인', '판단', '처리'], 2)}
      <p class="t-sub mt6">대부분은 1단계에서 끝납니다. 3일 안에 답이 없거나 합의가 안 될 때만 다음으로 넘어갑니다.</p>`)}

    ${card('단계별로 무슨 일이 있나요', `${[
      ['1. 진행자에게 먼저 문의', '상품 문의나 1:1로 연락합니다. 진행자는 하루 안에 답해야 합니다.', '즉시~1일'],
      ['2. 신고 접수', '3일 안에 답이 없거나 합의가 안 되면 고객센터에 신고합니다. 익명으로도 됩니다.', '즉시'],
      ['3. 양쪽 자료 확인', '운영팀이 참여자와 진행자 양쪽에 자료를 요청합니다. 사진·대화·송장 기록을 봅니다.', '2~3영업일'],
      ['4. 판단', '규정과 자료에 따라 판단하고, 양쪽에 결과와 이유를 알려드립니다.', '5영업일 이내'],
      ['5. 처리', '환불·재발송을 실행합니다. 진행자 잘못이면 정산에서 차감하고 벌점이 쌓입니다.', '1~3영업일'],
    ].map(([t, s, when]) => `<div class="row-b list-row" style="padding:14px 0;align-items:flex-start">
        <div class="grow"><b>${t}</b><p class="t-sub mt1">${s}</p></div>
        <span class="badge nowrap">${when}</span></div>`).join('')}`, { cls: 'mt6' })}

    ${card('어떤 자료가 있으면 좋을까요', `${table(
      [{ t: '분쟁 유형', w: '24%' }, '참여자가 낼 것', '진행자가 낼 것'],
      [
        ['상품 하자·파손', '개봉 전후 사진, 받은 날짜', '포장 사진, 발송 기록'],
        ['오배송·누락', '받은 상품 사진, 구성 목록', '출고 검수 기록, 송장'],
        ['미발송', '결제 내역, 문의한 기록', '발주서, 공급처 확인서'],
        ['설명과 다름', '상세 페이지 캡처, 실물 사진', '상품 규격서, 공급처 자료'],
        ['환불 지연', '결제·취소 내역', '환불 요청 기록'],
      ],
    )}
      <div class="box mt4"><b>사진은 개봉 전부터 찍어 두세요</b>
        <p class="t-sub mt1">박스가 눌렸거나 테이프가 뜯긴 상태를 개봉 전에 찍어 두시면 배송 중 파손인지 가리기 쉽습니다.
        판단에서 가장 많이 쓰이는 자료입니다.</p></div>`, { cls: 'mt6' })}

    ${card('판단 기준', `<ul style="padding-left:18px;line-height:2">
      <li><b>상품에 하자가 있으면</b> 진행자 부담으로 환불하거나 재발송합니다.</li>
      <li><b>배송 중 파손이면</b> 택배사 책임이지만, 참여자는 진행자에게 청구하고 진행자가 택배사에 청구합니다.</li>
      <li><b>단순 변심이면</b> 상품 종류에 따라 다릅니다. 신선식품은 대부분 불가입니다.</li>
      <li><b>약속한 날짜를 크게 넘겨 발송되지 않으면</b> 참여자가 원할 때 전액 환불합니다.</li>
      <li><b>양쪽 모두 책임이 있으면</b> 비용을 나눕니다.</li>
    </ul>`, { cls: 'mt6' })}

    ${card('그래도 납득이 안 되시면', `<div class="g2">
      <div class="box"><b>한국소비자원</b>
        <p class="t-sub mt2">피해구제와 분쟁조정을 신청하실 수 있습니다. 국번없이 1372.</p></div>
      <div class="box"><b>전자거래분쟁조정위원회</b>
        <p class="t-sub mt2">전자상거래 분쟁 조정 기관입니다. 온라인으로 신청하실 수 있습니다.</p></div>
    </div>
    <p class="t-sub mt3">운영팀 판단은 강제력이 있는 것이 아니라, 플랫폼 안에서의 처리 기준입니다.</p>`, { cls: 'mt6' })}

    <div class="btns mt6 center">
      ${btn('신고 접수하기', { cls: 'btn-primary btn-lg', href: 'CS0403' })}
      ${btn('1:1 문의', { cls: 'btn-ghost btn-lg', href: 'CS-02' })}
      ${btn('정책으로 돌아가기', { cls: 'btn-ghost btn-lg', href: 'CS-04' })}
    </div>`;
    return { body, o: { state: '분쟁 처리 절차 안내' } };
  }

  /* 신고 접수 */
  if (v === 'report') {
    const body = `
    ${pageHd('신고 접수', '익명으로도 접수하실 수 있습니다')}

    ${banner('warn', '🚩', `<b>진행자에게 먼저 문의해 보셨나요?</b>
      <p class="t-sub">대부분은 진행자와 이야기하면 풀립니다. 문의 후 3일이 지났거나 합의가 안 될 때 신고해 주세요.</p>`,
      { right: btn('진행자에게 문의', { cls: 'btn-ghost btn-sm', href: 'RV-02' }) })}

    ${card('무엇을 신고하시나요', `<div class="radio-list">
      ${[['상품이 설명과 다릅니다', '사진·규격이 실물과 크게 다른 경우'],
      ['약속한 날짜에 발송되지 않았습니다', '발송 예정일을 크게 넘긴 경우'],
      ['진행자와 연락이 되지 않습니다', '문의 후 3일이 지나도 답이 없는 경우'],
      ['환불이 되지 않습니다', '환불 대상인데 처리되지 않는 경우'],
      ['금지 품목이거나 허위·과장 광고입니다', '팔 수 없는 물건이나 근거 없는 효능 표시'],
      ['그 밖의 문제', '']]
      .map(([t, s], i) => `<label class="radio${i === 1 ? ' on' : ''}" data-group="rp">
        <input type="radio" name="rp"${i === 1 ? ' checked' : ''}>
        <span class="grow"><b>${t}</b>${s ? `<div class="t-sub mt1">${s}</div>` : ''}</span></label>`).join('')}
    </div>`, { cls: 'mt6' })}

    ${card('내용', `<div class="form" style="max-width:none">
      <div class="field"><label class="label">대상 공구 <span class="req">*</span></label>
        <select class="select"><option selected>겨울 기모 라운넥 맨투맨 (5color) · 옷장정리 하윤</option><option>제주 한라봉 5kg 산지직송 · 동네장터 지현</option></select></div>
      <div class="field"><label class="label">언제 있었던 일인가요</label>
        <input class="input" type="date" value="2026-08-03" style="max-width:220px"></div>
      <div class="field"><label class="label">무슨 일이 있었나요 <span class="req">*</span></label>
        <textarea class="textarea" rows="6" placeholder="시간 순서대로 적어 주시면 확인이 빠릅니다. 진행자와 주고받은 내용이 있으면 함께 적어 주세요."></textarea></div>
      <div class="field"><label class="label">증거 자료</label>
        <div class="upload" style="padding:20px"><b>사진·대화 캡처를 올려 주세요</b>
          <p class="t-sub">JPG·PNG·PDF · 최대 10개 · 파일당 10MB</p></div>
        <p class="hint">자료가 있으면 처리 기간이 절반으로 줄어듭니다</p></div>
      <div class="field"><label class="label">원하시는 처리</label>
        ${chips(['전액 환불', '재발송', '부분 환불', '사과·시정', '판단만 원함'], 0)}</div>
      <label class="check"><input type="checkbox"><span><b>익명으로 신고하기</b>
        <div class="t-sub">진행자에게 신고자가 누구인지 알리지 않습니다. 다만 환불 처리에는 주문 정보가 필요합니다.</div></span></label>
      <label class="check"><input type="checkbox" checked><span>사실과 다른 신고는 제재를 받을 수 있음을 확인했습니다 <span class="danger">(필수)</span></span></label>
    </div>`, { cls: 'mt6' })}

    ${card('접수하면', timeline([
      ['접수 완료', '접수번호를 문자로 보내드립니다'],
      ['진행자에게 통보', '1영업일 안에 · 소명 기회를 줍니다'],
      ['양쪽 자료 확인', '2~3영업일'],
      ['판단·처리', '접수일로부터 5영업일 이내'],
    ], 0), { cls: 'mt6' })}

    <div class="btns mt6">
      ${btn('신고 접수하기', { cls: 'btn-danger btn-lg', attr: ' data-toast="신고를 접수했어요. 접수번호를 문자로 보냈습니다" data-toast-kind="ok"' })}
      ${btn('처리 절차 보기', { cls: 'btn-ghost btn-lg', href: 'CS0402' })}
      ${btn('그만두기', { cls: 'btn-ghost btn-lg', href: 'CS-04' })}
    </div>`;
    return { body, o: { state: '신고 접수 · 미발송 신고' } };
  }

  const body = `
  ${pageHd('환불·분쟁 정책', '언제 얼마가 돌아오는지 미리 알려 드립니다')}

  ${card('기본 원칙', `<div class="box">
      <b>이 플랫폼의 모든 공구는 조건부 결제입니다</b>
      <p class="t-sub mt1">참여하실 때 결제되지만, 성사되기 전까지는 확정이 아닙니다. 목표 인원에 못 미치면 <b>자동으로 전액 환불</b>됩니다. 따로 신청하실 것은 없습니다.</p>
    </div>`)}

  ${card('상황별 환불 기준', table(
    [{ t: '상황', w: '24%' }, '환불 금액', '수수료', '언제 돌아오나요'],
    [
      ['<b>미달로 불발</b><div class="t-sub">목표 인원 미달</div>', '<b>전액</b>', '없음', '마감 즉시 요청 · 2~5영업일'],
      ['<b>마감 전 취소</b><div class="t-sub">내가 직접 취소</div>', '<b>전액</b>', '없음', '취소 즉시 요청 · 2~5영업일'],
      ['<b>성사 후 발주 전 취소</b><div class="t-sub">진행자 승인 필요</div>', '전액 또는 일부', '경우에 따라', '승인 후 2~5영업일'],
      ['<b>성사 후 발주 뒤</b><div class="t-sub">이미 주문이 들어감</div>', '<span class="danger">어려움</span>', '—', '상품 받으신 뒤 반품 절차'],
      ['<b>상품 하자·오배송</b>', '<b>전액</b> 또는 재발송', '없음 (진행자 부담)', '접수 후 3영업일 이내'],
      ['<b>단순 변심 반품</b><div class="t-sub">받으신 뒤 7일 이내</div>', '상품가 − 왕복 배송비', '왕복 배송비', '반품 도착 후 3영업일'],
      ['<b>진행자 미발송</b><div class="t-sub">약속일 초과</div>', '<b>전액</b>', '없음', '확인 후 즉시'],
    ],
  ), { cls: 'mt6' })}

  ${card('환불 수단별 걸리는 시간', `${[
    ['신용·체크카드', '결제 취소 · 2~5영업일 (카드사에 따라 다름)'],
    ['카카오페이·네이버페이', '즉시~1영업일'],
    ['계좌이체', '1~2영업일 (등록하신 계좌로 입금)'],
    ['적립금·쿠폰', '즉시 복구 (쿠폰은 남은 기간 그대로)'],
  ].map(([k, v]) => `<div class="row-b" style="padding:11px 0"><b class="nowrap" style="min-width:160px">${k}</b>
      <span class="grow" style="text-align:right">${v}</span></div>`).join('')}
    <div class="box box-mut mt3"><p class="t-sub">카드 결제 취소는 카드사 마감 시간에 따라 다음 달 청구서에 반영될 수 있습니다. 이 경우 실제로 돈이 빠져나가지 않습니다.</p></div>`,
    { cls: 'mt6' })}

  ${card('진행자와 다툼이 생겼을 때', timeline([
    ['1. 진행자에게 먼저 문의', '상품 문의나 1:1로 연락합니다. 대부분 여기서 풀립니다.'],
    ['2. 3일 안에 답이 없으면 신고', '고객센터에 신고하시면 운영팀이 개입합니다.'],
    ['3. 운영팀 확인', '양쪽 이야기와 자료를 받아 5영업일 안에 판단합니다.'],
    ['4. 처리', '환불·재발송을 결정하고, 진행자 잘못이면 정산에서 차감합니다.'],
  ], 0), { cls: 'mt6', ft: btn('분쟁 처리 절차 자세히', { cls: 'btn-ghost btn-block btn-sm', href: 'CS0402' }) })}

  ${card('소비자 보호', `<div class="g2">
    <div class="box"><b>결제 대금 예치 (에스크로)</b>
      <p class="t-sub mt2">참여자가 낸 돈은 배송이 확인될 때까지 플랫폼이 맡아 둡니다. 진행자에게 바로 넘어가지 않습니다.</p></div>
    <div class="box"><b>분쟁 조정</b>
      <p class="t-sub mt2">운영팀 판단에 동의하지 못하시면 한국소비자원 또는 전자거래분쟁조정위원회에 조정을 신청하실 수 있습니다.</p></div>
  </div>`, { cls: 'mt6' })}

  ${sec('자주 묻는 질문', accordion([
    { q: '불발됐는데 환불이 안 들어왔어요', a: '카드사에 따라 2~5영업일 걸립니다. 5영업일이 지나도 확인되지 않으시면 결제일과 카드 뒷자리를 알려 주시고 문의해 주세요.' },
    { q: '차액 환급은 언제 되나요?', a: '성사가 확정된 뒤 자동으로 처리됩니다. 결제하신 수단으로 그대로 돌려드리며, 보통 성사 다음 날 안에 요청이 걸립니다.' },
    { q: '진행자가 연락이 안 됩니다', a: '문의를 남기신 뒤 3일이 지나면 고객센터에 신고해 주세요. 운영팀이 직접 확인하고, 필요하면 전액 환불 처리합니다.' },
    { q: '받은 상품이 설명과 다릅니다', a: '사진과 함께 신고해 주세요. 확인되면 반품 배송비 없이 환불되거나 재발송됩니다.' },
  ], 0), { cls: 'mt6' })}

  ${card('', `<div class="row-b wrap-row">
    <div><b>해결되지 않으셨나요?</b><p class="t-sub mt1">신고는 익명으로도 접수하실 수 있습니다.</p></div>
    <div class="btns">${btn('1:1 문의', { cls: 'btn-primary', href: 'CS-02' })}
      ${btn('신고 접수', { cls: 'btn-danger', href: 'CS0403' })}</div>
  </div>`, { cls: 'mt6' })}`;
  return { body, o: {} };
}

export const PAGES = {
  'SE-01': se01,
  SE0102: (c) => se01(c, 'hold'),
  SE0103: (c) => se01(c, 'period'),
  SE0104: (c) => se01(c, 'tax'),
  'SE-02': se02,
  SE0202: (c) => se02(c, 'verify'),
  SE0203: (c) => se02(c, 'biz'),
  'SE-03': se03,
  SE0302: (c) => se03(c, 'tax'),

  'CS-01': cs01,
  CS0102: (c) => cs01(c, 'host'),
  CS0103: (c) => cs01(c, 'search'),
  'CS-02': cs02,
  CS0202: (c) => cs02(c, 'write'),
  CS0203: (c) => cs02(c, 'detail'),
  'CS-03': cs03,
  CS0302: (c) => cs03(c, 'notice'),
  CS0303: (c) => cs03(c, 'event'),
  'CS-04': cs04,
  CS0402: (c) => cs04(c, 'process'),
  CS0403: (c) => cs04(c, 'report'),
};
