/* SE 정산(진행자) 3장 · CS 고객지원 4장 */
import {
  ph, phAva, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, accordion, statRow, sumRows, timeline, dealCards,
  pageHd, detail2, hostPage, myPage, num, won, esc, link,
} from './ui.mjs';
import { SETTLE, DEALS, dealById, pctOf, NOTICES, FAQ, CATS } from './data.mjs';

/* ── SE-01 정산 내역 ────────────────────────────────── */
function se01() {
  const body = hostPage('SE-01', `
    ${pageHd('정산 내역', '배송 완료가 확인되면 7영업일 안에 보내드립니다',
    `<div class="btns">${btn('계좌·세금 설정', { cls: 'btn-ghost', href: 'SE-02' })}
      ${btn('내보내기', { cls: 'btn-ghost', attr: ' data-toast="정산 내역을 엑셀로 내려받았어요" data-toast-kind="ok"' })}</div>`)}

    ${statRow([
    ['2,250만원', '정산 예정', { ic: '💰', d: '8월 12일 지급' }],
    ['1,182만원', '정산 완료', { ic: '✅', d: '올해 누적' }],
    ['0원', '보류 금액', { ic: '⏸', d: '분쟁 없음' }],
    ['4%', '내 수수료율', { ic: '📉', d: 'A등급' }],
  ])}

    ${card('', `<div class="row-b wrap-row mb4" style="gap:12px">
      ${tabs(['전체', '정산 예정', '정산 완료', '보류'], 0)}
      <div class="row" style="gap:8px">
        <input class="input" type="date" value="2026-06-01" style="width:160px">
        <span class="t-sub">~</span>
        <input class="input" type="date" value="2026-08-31" style="width:160px">
        ${btn('조회', { cls: 'btn-primary btn-sm', attr: ' data-toast="고른 기간으로 다시 찾았어요"' })}
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
      ${btn('세금계산서', { cls: 'btn-ghost btn-sm', attr: ' data-toast="세금계산서를 발행했어요" data-toast-kind="ok"' })}</div>` })}`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── SE-02 정산 계좌·세금 설정 ──────────────────────── */
function se02() {
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
      <div class="field"><label class="label">예금주 <span class="danger">*</span></label>
        <div class="field-btn"><input class="input" value="서지현">
          ${btn('계좌 인증', { cls: 'btn-primary', attr: ' data-toast="1원을 보냈어요. 입금자명을 확인해 주세요" data-toast-kind="ok"' })}</div>
        <p class="hint">본인 명의 계좌만 등록하실 수 있습니다. 1원 입금으로 확인합니다.</p></div>
      <div class="box box-ok"><b>✓ 2026년 3월 14일 인증 완료</b>
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

    ${card('사업자 정보', `<div class="form">
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

/* ── SE-03 정산 상세 ────────────────────────────────── */
function se03() {
  const s = SETTLE[0];
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
    ${btn('세금계산서 발행', { cls: 'btn-ghost btn-block', attr: ' data-toast="세금계산서를 발행했어요. 메일로 보내드립니다" data-toast-kind="ok"' })}
    ${btn('정산 문의', { cls: 'btn-ghost btn-block', href: 'CS-02' })}
    <div class="hr"></div>
    <div class="row" style="gap:8px">
      ${btn('‹ 이전 정산', { cls: 'btn-ghost btn-sm grow', attr: ' data-toast="6월 정산으로 옮겼어요"' })}
      ${btn('다음 정산 ›', { cls: 'btn-ghost btn-sm grow', off: true })}
    </div>`);

  const body = hostPage('SE-01', `${pageHd('정산 상세')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── CS-01 이용 안내·자주 묻는 질문 ─────────────────── */
function cs01() {
  const body = `
  ${pageHd('이용 안내', '공동구매가 처음이셔도 어렵지 않습니다')}

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
    ${btn('검색', { cls: 'btn-primary', attr: ' data-toast="검색했어요"' })}
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

/* ── CS-02 1:1 문의 ─────────────────────────────────── */
function cs02() {
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
      ${btn('문의 보내기', { cls: 'btn-primary', attr: ' data-toast="문의를 보냈어요. 1영업일 안에 답변드릴게요" data-toast-kind="ok"' })}
    </div>`, { cls: 'mt6' })}

    ${card('내 문의 내역', table(
    ['접수일', '유형', { t: '제목', w: '32%' }, '상태', ''],
    [
      ['2026-08-04', '성사·환불', '불발된 공구 환불이 아직 안 들어왔어요', badge('답변 대기', 'b-warn'), btn('보기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="문의 상세를 열었어요"' })],
      ['2026-07-29', '배송', '송장번호가 조회되지 않습니다', badge('답변 완료', 'b-ok'), btn('보기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="문의 상세를 열었어요"' })],
      ['2026-07-15', '참여·결제', '쿠폰이 적용되지 않아요', badge('답변 완료', 'b-ok'), btn('보기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="문의 상세를 열었어요"' })],
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

/* ── CS-03 공지·이벤트 ──────────────────────────────── */
function cs03() {
  const body = `
  ${pageHd('공지·이벤트')}

  ${sec('', `<div class="g2">
    <a class="promo" href="${link('HS-01')}"><b>신규 진행자 지원 이벤트</b>
      <p>첫 공구는 수수료 0%. 8월 한 달 동안 새로 시작하시는 분께 드립니다.</p>
      <span class="btn btn-accent btn-sm mt3">진행자 시작하기</span></a>
    <a class="promo alt" href="${link('HO-03')}"><b>여름 마감 세일</b>
      <p>8월 10일까지 열리는 공구는 배송비를 모아공구가 부담합니다.</p>
      <span class="btn btn-ghost btn-sm mt3">참여 공구 보기</span></a>
  </div>`)}

  ${chips(['전체', '공지', '이벤트', '점검', '정책 변경'], 0)}

  ${card('', NOTICES.map((n) => `<a class="row-b list-row" href="${link('CS-03')}" style="padding:14px 0">
    <div class="row grow" style="gap:10px">
      ${n.pin ? badge('중요', 'b-danger') : badge('공지', 'b-mut')}
      <b>${esc(n.t)}</b></div>
    <span class="t-sub nowrap">${n.at}</span></a>`).join('')
    + `<div class="pager mt4">
      <button class="btn btn-ghost btn-sm" type="button" disabled>‹ 이전</button>
      ${[1, 2, 3].map((p) => `<button class="btn ${p === 1 ? 'btn-primary' : 'btn-ghost'} btn-sm" type="button" data-toast="${p}페이지를 불러왔어요">${p}</button>`).join('')}
      <button class="btn btn-ghost btn-sm" type="button" data-toast="2페이지를 불러왔어요">다음 ›</button>
    </div>`, { cls: 'mt4' })}

  ${card('추석 연휴 배송·정산 일정 안내', `<div class="row wrap-row mb3" style="gap:8px">${badge('중요', 'b-danger')}<span class="t-sub">2026년 8월 1일</span></div>
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

/* ── CS-04 환불·분쟁 정책 안내 ──────────────────────── */
function cs04() {
  const body = `
  ${pageHd('환불·분쟁 정책', '언제 얼마가 돌아오는지 미리 알려 드립니다')}

  ${card('기본 원칙', `<div class="box box-pri">
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
  ], 0), { cls: 'mt6' })}

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
      ${btn('신고 접수', { cls: 'btn-danger', attr: ' data-toast="신고를 접수했어요. 5영업일 안에 알려드릴게요" data-toast-kind="ok"' })}</div>
  </div>`, { cls: 'mt6' })}`;
  return { body, o: {} };
}

export const PAGES = {
  'SE-01': se01, 'SE-02': se02, 'SE-03': se03,
  'CS-01': cs01, 'CS-02': cs02, 'CS-03': cs03, 'CS-04': cs04,
};
