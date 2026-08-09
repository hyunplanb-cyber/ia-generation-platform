/* JB 진행 관리 · AU 계정 */
import * as U from './ui.mjs';
import { JOBS, SETTLES, PRO, FLOW_PRO, SITE, CATS } from './data.mjs';

/* ---------------- JB-01 일감 목록 ---------------- */
function JB01(ctx) {
  const body = U.proPage('JB-01', `
  ${U.pageHd('일감', '보낸 견적부터 정산까지 여기서 봅니다')}

  ${U.statRow([
    ['34%', '성사율', { cls: 'pri', d: '<span class="success">▲ 지난달 29%</span>' }],
    ['41분', '평균 응답 시간', { d: '<span class="warning">▼ 목표 30분</span>' }],
    ['2건', '이번 주 방문', { cls: 'acc' }],
  ], 'g3')}

  <div class="mt-block">${U.tabs([
    { label: '보낸 견적', cnt: 8 }, { label: '성사', cnt: 3 },
    { label: '진행 중', cnt: 2 }, { label: '완료', cnt: 41 }, { label: '전체', cnt: 54 },
  ], 4)}</div>

  <div class="row-b wrap-row mb4">
    <div class="searchbar sm grow" style="max-width:340px"><span class="ic">🔍</span><input type="text" placeholder="손님·서비스명·일감 번호로 찾기"></div>
    <select class="input" style="width:auto"><option>최근 3개월</option><option>최근 1년</option><option>전체 기간</option></select>
  </div>

  <div class="list">${JOBS.map((j) => `<div class="list-row${j.today ? ' today' : (j.st === '보낸 견적' ? ' hot' : '')}">
    <div class="mid">
      <div class="row-c wrap-row">${U.stBadge(j.st)}<b class="t-card">${U.esc(j.svc)}</b>
        ${j.today ? U.badge('이번 주', 'b-acc') : ''}
        ${j.st === '보낸 견적' ? U.badge('마감까지 2일', 'b-dan') : ''}</div>
      <div class="t-sub mt1">${U.esc(j.cus)}님 · ${j.no}</div>
      <div class="mt-item"><b>${j.when}</b> <span class="t-sub">· 견적 ${U.won(j.price)}</span></div>
    </div>
    <div class="rt">
      ${U.btn(j.next[0], { href: j.next[1], cls: 'btn-pri btn-sm' })}
      ${U.btn('일감 상세', { href: 'JB-02', cls: 'btn-ghost btn-sm' })}
    </div></div>`).join('')}</div>

  ${U.sec('상태가 무슨 뜻인가요', `<div class="g4">
    ${[['보낸 견적', '손님이 아직 고르지 않았어요. 마감이 지나면 자동으로 닫힙니다.'],
    ['성사', '손님이 나를 골랐어요. 일정을 확정하고 연락처를 확인하세요.'],
    ['진행 중', '일정이 잡혔고 아직 작업이 끝나지 않았어요.'],
    ['완료', '작업을 마쳤어요. 손님 결제 후 5영업일 안에 정산됩니다.']]
    .map(([t, d]) => `<div class="box soft">${U.stBadge(t)}<p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`)}

  ${U.sec('일감이 없을 때는 이렇게 보여요', U.empty('📭', '아직 일감이 없어요',
    '새 요청 목록에서 조건에 맞는 요청을 찾아 견적을 보내 보세요.',
    U.btn('새 요청 보기', { href: 'LD-01', cls: 'btn-pri' }) + U.btn('활동 설정 확인', { href: 'PR-04', cls: 'btn-ghost' })))}`);

  return { body, o: { wrapCls: 'wrap-wide' } };
}

/* ---------------- JB-02 일감 상세 ---------------- */
function JB02(ctx) {
  const j = JOBS[1];

  const main = `
  ${U.card('진행 상황', U.timeline(FLOW_PRO, 2), { aside: U.badge('일정 확정 차례', 'b-acc') })}

  <div class="mt-block">${U.card('손님이 쓴 요청 내용', `<div class="col" style="gap:0">
    ${[['어떤 이사인가요?', '가정 이사(포장) · 24평'],
    ['언제 이사하시나요?', '2026년 8월 9일 (일) 오전 9시'],
    ['출발지', '서초구 반포동 · 8층 · 승강기 있음'],
    ['도착지', '성동구 성수동 · 3층 · 승강기 없음'],
    ['큰 짐', '냉장고 2대 · 피아노 · 대형 소파 · 붙박이장 없음'],
    ['예산', '80만 ~ 120만원'],
    ['추가 요청', '피아노는 조율까지는 필요 없고 옮기기만 하면 됩니다.']]
    .map(([q, a], i) => `<div style="padding:var(--s3) 0${i ? ';border-top:1px solid var(--border)' : ''}">
      <div class="t-sub">${q}</div><div class="mt1">${a}</div></div>`).join('')}
  </div>`)}</div>

  <div class="mt-block">${U.card('내가 보낸 견적', `
    ${U.sumRows([
    ['기본료 (가정 이사 포장 · 24평)', U.won(680000)],
    ['피아노 운반', U.won(150000)],
    ['사다리차 (도착지 3층)', U.won(50000)],
    ['출장비', '없음'],
  ], ['견적 금액', U.won(880000)])}
    <div class="mt-block">${U.kv([
    ['보낸 날', '2026-08-03 09:12'],
    ['쓴 크레딧', '5'],
    ['포함', '포장 자재 · 피아노 운반 · 사다리차 · 짐 정리'],
    ['포함 안 됨', '폐기물 처리 · 입주 청소'],
    ['취소 규정', '방문 3일 전까지 무료, 이후 30%'],
  ])}</div>`, { aside: U.badge('선택됨', 'b-pri') })}</div>

  <div class="mt-block">${U.card('작업 완료 처리', `
    <p class="t-sub mb4">작업을 마치신 뒤에 눌러 주세요. 손님에게 확인 요청이 가고, 손님이 확인하면 결제 화면이 열립니다.</p>
    <div class="field"><label class="lb">실제 작업 시간</label>
      <div class="inline"><input class="input" value="09:00" style="max-width:130px"><span class="t-sub">~</span>
        <input class="input" value="16:30" style="max-width:130px"></div></div>
    <div class="field"><label class="lb">완료 사진 <span class="t-sub">(선택 · 분쟁이 생겼을 때 근거가 돼요)</span></label>
      <div class="drop" style="padding:var(--s5)"><div class="ic">📷</div><b>완료 사진을 올려 주세요</b></div></div>
    <div class="field" style="margin-bottom:0"><label class="lb">손님에게 남길 말 <span class="t-sub">(선택)</span></label>
      <textarea class="input" placeholder="예: 피아노는 벽에서 10cm 띄워 두었습니다. 불편하시면 연락 주세요."></textarea></div>
    <div class="btns mt-block">${U.btn('작업 완료 처리하기', { cls: 'btn-pri btn-lg', attr: ' data-toast="손님에게 확인 요청을 보냈어요" data-toast-kind="ok"' })}</div>`,
    { cls: 'tape ok' })}</div>`;

  const aside = `
  ${U.card('손님 연락처', `
    <div class="row-c mb3">${U.phAva(48, 'cus2')}
      <div><b>이O진님</b><div class="t-sub">가입 2년 · 이용 11번</div></div></div>
    ${U.banner('ok', '🔓', '<b>성사되어 연락처가 공개됐어요</b>')}
    <div class="mt4">${U.kv([
    ['연락처', '<b>010-2345-6789</b>'],
    ['출발지', '서초구 반포동 123-4 <b>801호</b>'],
    ['도착지', '성동구 성수동 55-1 <b>302호</b>'],
  ], { cls: 'left' })}</div>
    <div class="btns col mt-block">
      ${U.btn('채팅하기', { href: 'CH-02', cls: 'btn-pri btn-block' })}
      ${U.btn('전화 걸기', { cls: 'btn-ghost btn-block', attr: ' data-toast="010-2345-6789 로 연결됩니다"' })}
    </div>
    <p class="t-sub mt3">연락처는 일이 끝나고 30일 뒤에 가려집니다.</p>`, { cls: 'pri' })}

  <div class="mt4">${U.card('확정된 일정', `
    <div class="center" style="padding:var(--s3) 0">
      <div class="big">8월 9일</div><div class="t-sub">일요일 오전 9:00</div>
    </div>
    ${U.kv([['예상 소요', '6~8시간'], ['남은 시간', '<b class="acc">3일</b>']])}
    <div class="btns col mt-block">
      ${U.btn('일정 변경 요청', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="손님에게 일정 변경을 요청했어요"' })}
    </div>`)}</div>

  <div class="mt4">${U.card('추가 금액 요청', `
    <p class="t-sub mb3">현장에서 짐이 늘거나 예상 못 한 작업이 생겼을 때 요청하세요. <b>작업을 시작하기 전에</b> 손님 동의를 받아야 합니다.</p>
    <div class="field"><label class="lb">사유</label><select class="input"><option>짐이 예상보다 많음</option><option>추가 분해·조립</option><option>사다리차 추가</option><option>기타</option></select></div>
    <div class="field" style="margin-bottom:0"><label class="lb">추가 금액</label>
      <div class="inline"><input class="input" placeholder="0"><span class="t-sub">원</span></div></div>
    <div class="btns mt-block">${U.btn('추가 금액 요청', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="손님에게 추가 금액 동의를 요청했어요"' })}</div>`,
    { cls: 'tape acc' })}</div>

  <div class="mt4">${U.box(`<h4 class="t-card mb2 danger">취소 요청</h4>
    <p class="t-sub">고수가 취소하면 손님이 다시 요청서를 써야 합니다. 그래서 페널티가 있어요.</p>
    <div class="mt3">${U.table([{ t: '취소 시점' }, { t: '페널티' }], [
      ['방문 3일 전까지', '경고 1회'],
      ['방문 2일 전~전날', '경고 2회 · 노출 7일 감소'],
      ['당일 취소', '경고 3회 · 활동 정지 14일'],
    ])}</div>
    <div class="btns mt-block">${U.btn('취소 요청하기', { cls: 'btn-danger btn-block btn-sm', attr: ' data-toast="취소 사유를 고르는 창이 열려요"' })}</div>`,
    { cls: 'soft' })}</div>`;

  const body = U.proPage('JB-01', `
  <div class="row-b wrap-row mb4">
    <div><div class="row-c wrap-row">${U.stBadge(j.st)}<h1 class="t-page">${U.esc(j.svc)}</h1></div>
      <p class="t-sub">${j.no} · ${j.when} · 서초구 반포동 → 성동구 성수동</p></div>
    <b class="price-lg">${U.won(j.price)}</b>
  </div>
  ${U.detail2(main, aside)}`);

  return { body, o: { wrapCls: 'wrap-wide' } };
}

/* ---------------- JB-03 정산 내역 ---------------- */
function JB03(ctx) {
  const rows = SETTLES.map((s) => {
    const fee = Math.round(s.paid * s.fee);
    return [
      `<b>${s.svc}</b><div class="t-sub">${s.no}</div>`,
      s.done,
      `<span class="num">${U.won(s.paid)}</span>`,
      `<span class="num muted">-${U.won(fee)}</span>`,
      `<span class="num"><b>${U.won(s.paid - fee)}</b></span>`,
      U.stBadge(s.st),
      s.pay,
    ];
  });
  const totPaid = SETTLES.reduce((a, s) => a + s.paid, 0);
  const totFee = SETTLES.reduce((a, s) => a + Math.round(s.paid * s.fee), 0);

  const body = U.proPage('JB-03', `
  ${U.pageHd('정산 내역', '완료 확인 후 5영업일 안에 등록하신 계좌로 보내드려요',
    `<div class="btns">${U.btn('명세서 내려받기', { cls: 'btn-ghost', attr: ' data-toast="엑셀 파일을 내려받아요"' })}
      ${U.btn('세금계산서 발행', { cls: 'btn-ghost', attr: ' data-toast="세금계산서 발행 창이 열려요"' })}</div>`)}

  ${U.statRow([
    ['1,452,000원', '정산 예정', { cls: 'pri', d: '<span class="muted">1건 · 완료 확인 대기</span>' }],
    ['2,840,000원', '이번 달 정산 완료', { d: '<span class="muted">3건</span>' }],
    ['184,800원', '보류 금액', { cls: 'acc', d: '<span class="warning">1건 · 분쟁 확인 중</span>' }],
    ['12%', '내 수수료율', { d: '<span class="success">실버 등급</span>' }],
  ])}

  <div class="mt-block">
    <div class="row-b wrap-row mb4">
      <div class="chips">${U.chip('전체 5', true)}${U.chip('지급 완료 3')}${U.chip('정산 예정 1')}${U.chip('보류 1')}</div>
      <select class="input" style="width:auto"><option>2026년 8월</option><option>2026년 7월</option><option>최근 6개월</option></select>
    </div>

    ${U.table(
    [{ t: '일감', w: '24%' }, { t: '완료일' }, { t: '결제액' }, { t: '수수료' }, { t: '순정산액' }, { t: '상태' }, { t: '지급일' }],
    rows,
    { foot: ['<b>합계</b>', '', `<b class="num">${U.won(totPaid)}</b>`, `<b class="num">-${U.won(totFee)}</b>`, `<b class="num">${U.won(totPaid - totFee)}</b>`, '', ''] },
  )}
  </div>

  <div class="split-r mt-block">
    <div>
      ${U.card('수수료율은 등급에 따라 달라져요', `
        ${U.table([{ t: '등급' }, { t: '조건' }, { t: '수수료율' }], [
    ['브론즈', '누적 성사 20건 미만', '15%'],
    ['<b class="pri">실버 (지금)</b>', '20건 이상 · 평점 4.5 이상', '<b class="pri">12%</b>'],
    ['골드', '100건 이상 · 평점 4.7 이상 · 응답률 90%', '10%'],
    ['플래티넘', '300건 이상 · 평점 4.8 이상 · 응답률 95%', '8%'],
  ])}
        <div class="mt-block">${U.banner('info', '🎯', `<b>골드까지 얼마 안 남았어요</b>
          <div class="t-sub mt1">누적 성사 <b>103건</b> · 평점 <b>4.9</b> — 응답률만 <b class="warning">89% → 90%</b>로 올리면 수수료가 12%에서 10%로 내려가요.
          앞으로 들어오는 요청 3건에 답하시면 됩니다.</div>`)}</div>`)}

      <div class="mt-block">${U.card('보류된 정산', `
        ${U.banner('warn', '⏸', `<b>J-1009 · 원룸·소형 이사 — 184,800원이 보류 중이에요</b>
          <div class="t-sub mt1">손님이 물건 파손을 신고해 확인하고 있습니다. 보통 3~5영업일 걸려요.
          확인이 끝나면 알림으로 알려드리고, 문제가 없으면 다음 정산에 합쳐 보내드립니다.</div>`)}
        <div class="btns mt-block">${U.btn('내 의견 제출', { cls: 'btn-ghost btn-sm', attr: ' data-toast="의견 제출 창이 열려요"' })}
          ${U.btn('사진 근거 올리기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="사진 고르기 창이 열려요"' })}</div>`)}</div>
    </div>

    <div class="sticky">
      ${U.card('정산 계좌', `
        ${U.kv([['은행', '국민은행'], ['계좌', '****-**-**1234'], ['예금주', '김O결']])}
        <div class="btns col mt-block">
          ${U.btn('계좌 바꾸기', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="본인 확인 후 바꿀 수 있어요"' })}
          ${U.btn('세금 설정', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="사업자·원천징수 설정 창이 열려요"' })}
        </div>
        <p class="t-sub mt3">예금주는 신원 확인에 쓴 이름과 같아야 해요.</p>`)}

      <div class="mt4">${U.box(`<h4 class="t-card mb2">정산은 이렇게 돌아가요</h4>
        <div class="col" style="gap:var(--sp-item)">
          <div class="t-sub">1. 작업 완료 처리</div>
          <div class="t-sub">2. 손님이 확인 (최대 3일, 무응답 시 자동 확인)</div>
          <div class="t-sub">3. 손님 결제</div>
          <div class="t-sub">4. <b>5영업일 뒤</b> 계좌로 입금</div>
        </div>
        <p class="t-sub mt3">사업자는 세금계산서를, 개인은 3.3% 원천징수 후 지급됩니다.</p>`, { cls: 'soft' })}</div>

      <div class="mt4">${U.card('빠른 이동', `<div class="btns col">
        ${U.btn('고수센터', { href: 'PR-01', cls: 'btn-ghost btn-block btn-sm' })}
        ${U.btn('일감 목록', { href: 'JB-01', cls: 'btn-ghost btn-block btn-sm' })}
      </div>`)}</div>
    </div>
  </div>

  ${U.sec('정산 내역이 없을 때는 이렇게 보여요', U.empty('💳', '아직 정산 내역이 없어요',
    '일을 마치고 손님이 결제하면 여기에 쌓여요.',
    U.btn('새 요청 보기', { href: 'LD-01', cls: 'btn-pri' })))}`);

  return { body, o: { wrapCls: 'wrap-wide' } };
}

/* ---------------- AU-01 로그인 ---------------- */
function AU01(ctx) {
  const body = U.soloBox('로그인', '', `
    <form>
      <div class="field"><label class="lb">이메일</label>
        <input class="input" type="email" placeholder="you@example.com"></div>
      <div class="field"><label class="lb">비밀번호</label>
        <input class="input err" type="password" value="········">
        <p class="help err">이메일이나 비밀번호가 맞지 않아요. 다시 확인해 주세요.</p></div>
      <div class="row-b mb6">
        <label class="check"><input type="checkbox" checked><span class="t-sub">로그인 상태 유지</span></label>
        <a class="link quiet" href="${U.link('AU-05')}">비밀번호 찾기</a>
      </div>
      ${U.btn('로그인', { cls: 'btn-pri btn-lg btn-block' })}
    </form>

    <div class="divider">또는</div>
    <div class="btns col">
      <button class="sns-btn kakao" type="button" data-toast="카카오 로그인 창이 열려요">💬 카카오로 계속하기</button>
      <button class="sns-btn naver" type="button" data-toast="네이버 로그인 창이 열려요">N 네이버로 계속하기</button>
      <button class="sns-btn google" type="button" data-toast="구글 로그인 창이 열려요">G 구글로 계속하기</button>
    </div>

    <p class="t-sub center mt-block">아직 회원이 아니신가요? <a class="link" href="${U.link('AU-02')}">회원가입</a></p>
    <p class="t-sub center mt3" style="padding-top:var(--s4);border-top:1px solid var(--border)">
      고수도 <b>같은 계정</b>으로 로그인해요. 로그인한 뒤 고수센터로 넘어가시면 됩니다.</p>
    <p class="t-sub center mt4"><a class="link quiet" href="${U.link('HO-01')}">둘러보기</a></p>`);

  return { body, o: { solo: true } };
}

/* ---------------- AU-02 회원가입 ---------------- */
function AU02(ctx) {
  const body = U.soloBox('회원가입', '', `
    <div class="btns col mb6">
      <button class="sns-btn kakao" type="button" data-toast="카카오로 간편 가입해요">💬 카카오로 3초 만에 가입</button>
      <button class="sns-btn naver" type="button" data-toast="네이버로 간편 가입해요">N 네이버로 가입</button>
      <button class="sns-btn google" type="button" data-toast="구글로 간편 가입해요">G 구글로 가입</button>
    </div>
    <div class="divider">또는 이메일로 가입</div>

    <form>
      <div class="field"><label class="lb">이메일<span class="req">*</span></label>
        <input class="input" type="email" value="hyun@example.com">
        <p class="help">이미 가입된 이메일이면 알려드릴게요.</p></div>

      <div class="field"><label class="lb">비밀번호<span class="req">*</span></label>
        <input class="input" type="password" value="········">
        <div class="row mt2" style="gap:var(--s4)">
          <span class="t-sub" style="color:var(--success)">✓ 8자 이상</span>
          <span class="t-sub" style="color:var(--success)">✓ 영문 포함</span>
          <span class="t-sub">○ 숫자 포함</span>
        </div></div>

      <div class="field"><label class="lb">비밀번호 확인<span class="req">*</span></label>
        <input class="input" type="password" value="········"></div>

      <div class="g2">
        <div class="field"><label class="lb">이름<span class="req">*</span></label><input class="input" value="김하늘"></div>
        <div class="field"><label class="lb">휴대폰<span class="req">*</span></label><input class="input" value="010-1234-5678"></div>
      </div>

      <div class="field"><label class="lb">사는 지역</label>
        <div class="row" style="gap:var(--s2)">
          <select class="input"><option>서울특별시</option><option>경기도</option></select>
          <select class="input"><option>강남구</option><option>서초구</option></select>
        </div>
        <p class="help">가까운 고수를 먼저 보여드리는 데 씁니다.</p></div>

      <div class="field"><label class="lb">관심 있는 서비스 <span class="t-sub">(여러 개 고를 수 있어요)</span></label>
        ${U.chips(CATS.slice(0, 8).map((c) => c.nm), [0, 1])}</div>

      <div class="field">
        <label class="check box mb2" data-agree-all data-unlock="next"><input type="checkbox"><span><b>전체 동의</b></span></label>
        <div data-agree-scope>
          ${[['이용약관 (필수)', true], ['개인정보 처리방침 (필수)', true], ['마케팅 정보 수신 (선택)', false]]
    .map(([t]) => `<div class="row-b" style="padding:3px 0">
      <label class="check"><input type="checkbox" data-agree><span class="t-sub">${t}</span></label>
      <button class="link quiet" type="button" data-toast="전문이 열려요" style="font-size:12px">전문 보기</button></div>`).join('')}
        </div>
      </div>

      ${U.btn('다음 — 휴대폰 인증', { href: 'AU-03', cls: 'btn-pri btn-lg btn-block' })}
    </form>

    <p class="t-sub center mt-block">이미 계정이 있으신가요? <a class="link" href="${U.link('AU-01')}">로그인</a></p>`,
    { lg: true, steps: U.stepbar(['정보 입력', '인증', '완료'], 0) });

  return { body, o: { solo: true } };
}

/* ---------------- AU-03 회원가입 - 휴대폰 인증 ---------------- */
function AU03(ctx) {
  const body = U.soloBox('휴대폰 인증', '<b style="color:var(--text)">010-1234-5678</b>로 인증번호를 보냈어요', `
    <div class="row-b mb2"><label class="lb" style="margin:0">인증번호 6자리</label>
      <span class="t-sub">남은 시간 <b class="danger" data-count="180">3:00</b></span></div>
    <div class="otp mb3">
      ${['1', '3', '5', '', '', ''].map((v, i) => `<span class="${i === 3 ? 'on' : ''}">${v}</span>`).join('')}
    </div>

    <div class="row-b mb6">
      <button class="link" type="button" data-toast="인증번호를 다시 보냈어요">인증번호 다시 받기</button>
      <button class="link quiet" type="button" data-toast="번호를 바꾸는 화면으로 돌아가요">번호 바꾸기</button>
    </div>

    ${U.btn('인증하고 다음', { href: 'AU-04', cls: 'btn-pri btn-lg btn-block' })}

    <div class="mt-block" style="padding-top:var(--sp-block);border-top:1px solid var(--border)">
      <p class="t-sub mb3">— 인증번호가 틀리면 이렇게 보여요 —</p>
      <div class="otp err mb2">${['1', '3', '5', '9', '2', '4'].map((v) => `<span>${v}</span>`).join('')}</div>
      <p class="help err">인증번호가 맞지 않아요. 5번 더 틀리면 잠시 잠깁니다. (1 / 5)</p>
      <p class="t-sub mt3">재발송 대기 중일 때는 버튼이 <b>“다시 받기 (42초)”</b>로 바뀌어 눌리지 않아요.</p>
    </div>

    <div class="mt-block">${U.box(`<h4 class="t-card mb2">왜 인증이 필요한가요?</h4>
      <p class="t-sub">사람이 직접 만나 일하는 서비스라서요. 실제 연락이 닿는 번호인지 확인해야
      약속한 날에 서로 연락할 수 있고, 문제가 생겼을 때 도와드릴 수 있어요.</p>
      <p class="t-sub mt2">번호는 고수를 고르기 전까지 <b>가려진 채로</b> 전달됩니다.</p>`, { cls: 'soft' })}</div>`,
    { steps: U.stepbar(['정보 입력', '인증', '완료'], 1) });

  return { body, o: { solo: true } };
}

/* ---------------- AU-04 회원가입 완료 ---------------- */
function AU04(ctx) {
  const body = U.soloBox('', '', `
    <div class="center mb6">
      <div style="font-size:52px;color:var(--success)">✓</div>
      <h1 class="t-sec mt3">가입을 환영해요, 김하늘님</h1>
      <p class="t-sub mt2">이제 요청서 한 장이면 동네 고수들이 값을 보내드려요.</p>
    </div>

    ${U.card('', `<div class="row-c">
      <span style="font-size:30px">🎟</span>
      <div class="grow"><b class="t-card">첫 이용 10,000원 할인 쿠폰</b>
        <div class="t-sub mt1">첫 결제 때 자동으로 적용돼요 · 2026년 12월 31일까지</div></div>
    </div>`, { cls: 'acc' })}

    <div class="mt-block">
      <h3 class="t-card mb3">이런 고수는 어때요?</h3>
      <p class="t-sub mb3">가입할 때 고르신 <b>이사 · 청소</b>에 맞춰 골라 봤어요.</p>
      <div class="col" style="gap:var(--sp-cards)">
        ${['p1', 'p2', 'p3'].map((id) => { const p = PRO(id); return `<a class="row-c" href="${U.link('SE-03')}">
          ${U.phPro(48, p.id)}
          <div class="grow"><b>${U.esc(p.nm)}</b>
            <div class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)} (${U.num(p.rv)}) · 시작가 ${U.won(p.from)}</div></div>
          <span class="btn btn-ghost btn-sm">보기</span></a>`; }).join('')}
      </div>
    </div>

    <div class="btns col mt-block">
      ${U.btn('요청서 작성하기', { href: 'RQ-01', cls: 'btn-pri btn-lg btn-block' })}
      ${U.btn('고수 둘러보기', { href: 'SE-01', cls: 'btn-ghost btn-block' })}
    </div>

    <p class="t-sub center mt-block" style="padding-top:var(--s4);border-top:1px solid var(--border)">
      직접 일을 맡고 싶으세요? <a class="link quiet" href="${U.link('PR-02')}">고수로 등록하기</a></p>`,
    { lg: true, steps: U.stepbar(['정보 입력', '인증', '완료'], 2) });

  return { body, o: { solo: true } };
}

/* ---------------- AU-05 비밀번호 찾기 ---------------- */
function AU05(ctx) {
  const body = U.soloBox('비밀번호 찾기', '가입하신 이메일을 알려주세요', `
    <form>
      <div class="field"><label class="lb">이메일</label>
        <input class="input" type="email" placeholder="you@example.com"></div>
      ${U.btn('재설정 링크 보내기', { cls: 'btn-pri btn-lg btn-block' })}
    </form>

    <div class="mt-block" style="padding-top:var(--sp-block);border-top:1px solid var(--border)">
      <p class="t-sub mb4">— 상황별로 이렇게 보여요 —</p>

      <div class="box soft mb3 center">
        <div style="font-size:34px">📧</div>
        <b class="t-card">메일함을 확인해 주세요</b>
        <p class="t-sub mt2">hyun@example.com 으로 재설정 링크를 보냈어요.<br>링크는 30분 동안 쓸 수 있어요.</p>
        <button class="link mt3" type="button" data-toast="메일을 다시 보냈어요">다시 보내기</button>
      </div>

      <div class="mb3">${U.banner('dan', '❌', `<b>등록되지 않은 이메일이에요</b>
        <div class="t-sub mt1">오타가 없는지 확인해 보시고, 아직 가입하지 않으셨다면
        <a class="link" href="${U.link('AU-02')}">회원가입</a>을 해주세요.</div>`)}</div>

      <div>${U.banner('info', '💬', `<b>카카오로 가입하신 계정이에요</b>
        <div class="t-sub mt1">이 계정은 비밀번호가 없어요. <a class="link" href="${U.link('AU-01')}">카카오로 로그인</a>해 주세요.</div>`)}</div>
    </div>

    <div class="mt-block" style="padding-top:var(--sp-block);border-top:1px solid var(--border)">
      <p class="t-sub mb4">— 링크를 눌러 들어오면 이 화면이 나와요 —</p>
      <div class="box">
        <h3 class="t-card mb4">새 비밀번호를 정해 주세요</h3>
        <div class="field"><label class="lb">새 비밀번호</label>
          <input class="input" type="password" value="········">
          <div class="row mt2" style="gap:var(--s4)">
            <span class="t-sub" style="color:var(--success)">✓ 8자 이상</span>
            <span class="t-sub" style="color:var(--success)">✓ 영문 포함</span>
            <span class="t-sub" style="color:var(--success)">✓ 숫자 포함</span>
          </div></div>
        <div class="field"><label class="lb">새 비밀번호 확인</label><input class="input" type="password" value="········"></div>
        ${U.btn('비밀번호 바꾸기', { href: 'AU-01', cls: 'btn-pri btn-block' })}
      </div>
      <p class="t-sub center mt3">바꾸고 나면 로그인 화면으로 돌아가요.</p>
    </div>

    <p class="t-sub center mt-block"><a class="link" href="${U.link('AU-01')}">로그인으로 돌아가기</a></p>`,
    { lg: true });

  return { body, o: { solo: true } };
}

export const PAGES = {
  'JB-01': JB01, 'JB-02': JB02, 'JB-03': JB03,
  'AU-01': AU01, 'AU-02': AU02, 'AU-03': AU03, 'AU-04': AU04, 'AU-05': AU05,
};
