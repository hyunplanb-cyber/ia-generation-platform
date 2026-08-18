/* MY 마이페이지 · AU 계정 */
import * as U from './ui.mjs';
import { SITE, CATS, COURSES, SETTLE, SETTLE_BY_MONTH, byId } from './data.mjs';

const P = {};
export default P;

/* 마이페이지 안에서 오가는 줄 (가로 한 줄 — 왼쪽 LNB를 두 벌로 만들지 않는다) */
const myNav = (on) => U.tabs([
  { label: '내 정보', go: 'MY-01' }, { label: '수강 이력', go: 'MY-02' },
  { label: '정산 내역', go: 'MY-03' }, { label: '알림 설정', go: 'MY-01' },
], on, { pill: true });

/* ================= MY-01 내 정보 ================= */
P['MY-01'] = () => {
  const body = `
${U.pageHd('마이페이지', `${SITE.me.name}님 · ${SITE.me.joined} 가입`)}
${myNav(0)}

<div class="split-r">
  <div>
    ${U.card('프로필', `
      <div class="row wrap-row" style="gap:var(--s6);align-items:center">
        ${U.ph('프로필', 'ph-ava', SITE.me.name)}
        <div class="grow" style="min-width:200px">
          <div class="btns">${U.btnSay('사진 바꾸기', '사진 업로드는 서버가 연결되면 동작합니다', { cls: 'btn-soft' })}
            ${U.btnSay('사진 지우기', '사진 삭제는 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}</div>
          <p class="t-sub mt3">권장 400×400 (1:1) · JPG · PNG · 2MB 이하</p>
        </div>
      </div>

      <div class="hr"></div>

      <div class="toggle-row" data-editrow="nick">
        <span class="grow"><span class="lb" style="margin:0">닉네임</span>
          <span data-view><b>수현쌤</b></span>
          <span data-form hidden><input class="input mt2" value="수현쌤" style="max-width:280px"></span></span>
        <div class="btns"><button class="btn btn-ghost btn-sm" type="button" data-edit="nick">수정</button>
          <button class="btn btn-primary btn-sm" type="button" data-save="nick">저장</button></div>
      </div>

      <div class="toggle-row" data-editrow="mail">
        <span class="grow"><span class="lb" style="margin:0">이메일</span>
          <span data-view><b>${SITE.me.mail}</b></span>
          <span data-form hidden><input class="input mt2" type="email" value="${SITE.me.mail}" style="max-width:280px"></span></span>
        <div class="btns"><button class="btn btn-ghost btn-sm" type="button" data-edit="mail">수정</button>
          <button class="btn btn-primary btn-sm" type="button" data-save="mail">저장</button></div>
      </div>

      <div class="toggle-row" data-editrow="phone">
        <span class="grow"><span class="lb" style="margin:0">휴대폰</span>
          <span data-view><b>010-1234-5678</b></span>
          <span data-form hidden><input class="input mt2" value="010-1234-5678" style="max-width:280px"></span></span>
        <div class="btns"><button class="btn btn-ghost btn-sm" type="button" data-edit="phone">수정</button>
          <button class="btn btn-primary btn-sm" type="button" data-save="phone">저장</button></div>
      </div>

      <div class="toggle-row">
        <span class="grow"><span class="lb" style="margin:0">비밀번호</span><span class="t-sub">2026-06-02에 마지막으로 바꿨어요</span></span>
        ${U.btn('비밀번호 바꾸기', { cls: 'btn-ghost btn-sm', href: 'AU-05' })}
      </div>
    `)}

    <div class="mt4" id="noti">${U.card('알림 받기', `
      ${[['이메일', '과제 마감·수료 안내를 메일로', true], ['앱 푸시', '이어보기·새 강의 알림', true], ['문자', '중요한 안내만', false]]
      .map(([t, d, on]) => `<div class="toggle-row"><span class="grow"><b>${t}</b><div class="t-sub">${d}</div></span>
        <button class="toggle${on ? ' on' : ''}" type="button" role="switch" aria-checked="${on}" aria-label="${t} 알림"><i></i></button></div>`).join('')}
      <p class="help">켜고 끈 상태가 그대로 남습니다</p>`)}</div>

    <div class="mt6 row-b wrap-row">
      ${U.btn('강사로 전환 신청', { cls: 'btn-primary', href: 'TC-02' })}
      ${U.btnSay('회원 탈퇴', '탈퇴 처리는 서버가 연결되면 진행됩니다', { cls: 'btn-link' })}
    </div>
  </div>

  <aside class="sticky">
    ${U.card('한눈에 보기', U.kv([
      ['수강 중', '3개'], ['수강 완료', '2개'], ['받은 수료증', '2장'],
      ['쓸 수 있는 쿠폰', '2장'], ['작성한 후기', '4개'],
    ]), { ft: `<div class="btns-v">${U.btn('수강 이력 보기', { cls: 'btn-ghost btn-block', href: 'MY-02' })}
      ${U.btn('내 강의실 가기', { cls: 'btn-ghost btn-block', href: 'CL-01' })}</div>` })}
  </aside>
</div>`;
  return { body, o: {} };
};

/* ================= MY-02 수강 이력 ================= */
P['MY-02'] = () => {
  const hist = [
    { id: 'C05', from: '2026-03-20', to: '2026-07-28', pay: 0, cert: true, refund: false },
    { id: 'C08', from: '2026-04-02', to: '2026-06-30', pay: 49000, cert: true, refund: false },
    { id: 'C01', from: '2026-05-12', to: '수강 중', pay: 79000, cert: false, refund: false },
    { id: 'C06', from: '2026-06-01', to: '수강 중', pay: 59000, cert: false, refund: false },
    { id: 'C03', from: '2026-08-03', to: '수강 중', pay: 69000, cert: false, refund: true },
  ];
  const rows = hist.map((h, i) => {
    const c = byId(h.id);
    /* ⚠ 「기간」 고르개가 알림만 띄우고 목록은 그대로였다(2026-08-18 검수 A).
       스펙팩 acts 는 「이력 목록과 합계가 함께 걸러진다」고 약속해 두었다.
       결제일 기준으로 «최근 3개월·최근 1년» 표를 미리 붙여 두면
       이미 있는 거르개(data-tags)가 그대로 걸러 준다. 오늘은 2026-08-18. */
    const 지난달수 = (2026 - Number(h.from.slice(0, 4))) * 12 + (8 - Number(h.from.slice(5, 7)));
    const 기간표 = ['t:all', 지난달수 <= 12 ? 't:1y' : '', 지난달수 <= 3 ? 't:3m' : ''].filter(Boolean).join(' ');
    return `<div data-tags="p:${h.to === '수강 중' ? 'now' : 'done'} y:2026 ${기간표}">
      <div class="acc-item">
        <button class="acc-q" type="button"><span class="row-c" style="gap:var(--gap-title)">
          ${U.ph('강의 썸네일', 'ph-thumb-sm', c.id)}
          <span><b>${c.name}</b>
            <div class="t-sub" style="font-weight:400">${h.from} ~ ${h.to} · ${h.pay === 0 ? '무료' : U.won(h.pay)}</div></span>
        </span>
        <span class="row-c" style="margin-left:auto">${h.cert ? U.badge('수료', 'b-ok') : U.badge('수강 중', 'b-pri')}<span class="mk">＋</span></span></button>
        <div class="acc-a"><div><div class="in">
          ${U.kv([
      ['결제일', h.from], ['결제 금액', h.pay === 0 ? '무료' : U.won(h.pay)],
      ['결제 수단', h.pay === 0 ? '—' : '신용카드 (일시불)'],
      ['수강 기간', `${h.from} ~ ${h.to === '수강 중' ? '2027-02-06' : h.to}`],
      ['수료 여부', h.cert ? '수료 (수료번호 CERT-2026-00' + (4100 + i) + ')' : '미수료'],
    ])}
          <div class="btns mt4">
            ${U.btnSay('영수증 보기', '영수증 발급은 서버가 연결되면 동작합니다', { cls: 'btn-ghost btn-sm' })}
            ${h.cert ? U.btn('수료증 다시 받기', { cls: 'btn-soft btn-sm', href: 'CL-08' }) : ''}
            ${h.refund ? U.btnSay('환불 신청 (D-4)', '환불 접수는 서버가 연결되면 진행됩니다', { cls: 'btn-danger btn-sm' }) : ''}
          </div>
        </div></div></div>
      </div></div>`;
  }).join('');

  const body = `
${U.pageHd('수강 이력', '줄을 누르면 결제 내역과 수료 여부가 펼쳐집니다')}
${myNav(1)}

<div class="g3 mb6">
  ${U.stat('들은 강의', '5', { unit: '개', ico: '📚', note: '2026년 누적' })}
  ${U.stat('낸 돈', '256,000', { unit: '원', ico: '💳', cls: 's-acc s-ink', note: '쿠폰 할인 42,000원 포함' })}
  ${U.stat('받은 수료증', '2', { unit: '장', ico: '🎓', cls: 's-ok', note: '재발급은 언제든 가능' })}
</div>

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    ${U.fchips('hist', 'p', ['*', ['now', '수강 중'], ['done', '수강 완료']], { allLabel: '전체' })}
    <select class="input" style="width:180px" aria-label="기간" data-fselect="hist" data-fkey="t">
      <option value="all">전체 기간</option><option value="3m">최근 3개월</option><option value="1y">최근 1년</option></select>
  </div>
  <p class="t-sub mt2">지금 <b class="pri" data-fcount="hist">5</b>건을 보고 있어요</p>
</div></div>

<div class="card"><div class="card-bd tight" data-list="hist">${rows}</div></div>
<div data-list-empty="hist" hidden class="mt4">${U.empty('📭', '그 조건의 이력이 없어요', '조건을 바꿔 보세요',
    `<button class="btn btn-primary" type="button" data-freset="hist">조건 모두 풀기</button>`)}</div>

<div class="mt6">${U.banner('mut', '🧾', `<b>세금계산서·현금영수증이 필요하세요?</b><br>
  <span class="t-sub">정산 내역 화면에서 한 번에 발급하실 수 있어요</span>`, U.btn('정산 내역 보기', { cls: 'btn-ghost', href: 'MY-03' }))}</div>
`;
  return { body, o: {} };
};

/* ================= MY-03 정산 내역 ================= */
P['MY-03'] = () => {
  const tot = SETTLE.reduce((a, s) => ({ n: a.n + s.n, gross: a.gross + s.gross, fee: a.fee + s.fee, net: a.net + s.net }), { n: 0, gross: 0, fee: 0, net: 0 });
  const rows = SETTLE.map((s) => ({
    cells: [
      { t: `<b>${s.c}</b>`, v: s.c },
      { t: U.nf(s.n) + '건', v: s.n, cls: 'right' },
      { t: U.won(s.gross), v: s.gross, cls: 'right' },
      { t: `<span class="muted">-${U.nf(s.fee)}원</span>`, v: s.fee, cls: 'right' },
      { t: `<b>${U.won(s.net)}</b>`, v: s.net, cls: 'right' },
      U.badge(s.st, s.st === '정산 완료' ? 'b-ok' : s.st === '무료 강의' ? 'b-mut' : 'b-warn'),
    ],
  }));

  const body = `
${U.pageHd('정산 내역', '표 머리글을 누르면 그 기준으로 정렬됩니다', `
  ${U.btnSay('정산 계좌 관리', '계좌 변경은 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
  ${U.btn('내역 없음', { cls: 'btn-ghost', href: 'MY-04' })}`)}
${myNav(2)}

<div class="g3 mb6">
  ${U.stat('이번 달 예상 정산액', '11,304,000', { unit: '원', ico: '💰', delta: 1820000, deltaUnit: '원', spark: U.spark([6.2, 7.1, 8.4, 8.0, 9.5, 10.2, 11.3]) })}
  ${U.stat('누적 정산액', '68,420,000', { unit: '원', ico: '📈', cls: 's-ok', delta: 11304000, deltaUnit: '원', spark: U.spark([21, 28, 35, 42, 49, 57, 68]) })}
  ${U.stat('다음 정산일', '8월 15일', { ico: '📅', cls: 's-acc s-ink', note: '전월 매출을 매월 15일에 지급' })}
</div>

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    <select class="input" style="width:200px" aria-label="정산 월" data-settle-month data-months='${U.esc(JSON.stringify(SETTLE_BY_MONTH))}'>
      <option>2026년 8월</option><option>2026년 7월</option><option>2026년 6월</option></select>
    ${U.btnSay('세금계산서 발행', '세금계산서 발행은 서버가 연결되면 동작합니다', { cls: 'btn-soft' })}
    ${U.btnSay('엑셀로 내려받기', '내려받기는 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}
  </div>
</div></div>

${U.table(
      [{ t: '강의', sort: 'text' }, { t: '판매', sort: 'num', w: '90px' }, { t: '총 매출', sort: 'num', w: '130px' },
      { t: '수수료 20%', sort: 'num', w: '130px' }, { t: '실 정산액', sort: 'num', w: '140px' }, { t: '상태', w: '110px' }],
      rows, {
    scroll: true, attr: ' data-settle-table',
    foot: `<tr><td>합계</td><td class="right">${U.nf(tot.n)}건</td><td class="right">${U.won(tot.gross)}</td>
      <td class="right">-${U.nf(tot.fee)}원</td><td class="right"><b class="pri">${U.won(tot.net)}</b></td><td></td></tr>`,
  })}

<div class="g2 mt6">
  ${U.card('건별 내역', U.accordion([
    { q: '엑셀로 시작하는 실무 데이터 분석 — 128건', a: `${U.sumRows([['판매가 79,000원 × 128건', '10,112,000원'], ['플랫폼 수수료 20%', '-2,022,400원'], ['환불 3건', '-237,000원']], ['실 정산액', '7,852,600원'])}` },
    { q: '데이터 시각화 실무 대시보드 — 41건', a: `${U.sumRows([['판매가 98,000원 × 41건', '4,018,000원'], ['플랫폼 수수료 20%', '-803,600원']], ['실 정산액', '3,214,400원'])}` },
  ], { single: true }), { bdCls: 'tight' })}
  ${U.card('정산 계좌', `${U.kv([['은행', '국민은행'], ['계좌번호', '****-**-**1234'], ['예금주', '박지훈'], ['확인', '2026-03-02 인증 완료']])}
    <p class="t-sub mt3">계좌를 바꾸면 다음 정산일부터 반영됩니다</p>`)}
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= MY-04 정산 내역 · 내역 없음 ================= */
P['MY-04'] = () => {
  const body = `
${U.pageHd('정산 내역', '고른 기간에 내역이 없어요')}
${myNav(2)}

<div class="card mb4"><div class="card-bd">
  <div class="row-b wrap-row">
    <select class="input" style="width:200px" aria-label="정산 월" data-swapsel="settle">
      <option value="none">2026년 8월</option><option value="has">2026년 7월</option><option value="none">2026년 5월</option></select>
    <span class="t-sub">기간을 바꾸면 내역이 있는 달에는 표가 나타납니다</span>
  </div>
</div></div>

<div data-swap-set="settle">
  <div data-swap-key="none">
    ${U.empty('🧾', '2026년 8월에는 정산 내역이 없어요',
    '이 달에 판매된 강의가 없습니다. 다른 기간을 골라 보시거나, 새 강의를 열어 보세요.',
    `${U.btn('강의 개설하기', { cls: 'btn-primary btn-lg', href: 'CU-02' })}
     <button class="btn btn-ghost btn-lg" type="button" data-swap="settle:has">내역이 있는 달 보기</button>`)}
  </div>
  <div data-swap-key="has" hidden>
    ${U.card('2026년 7월 정산', U.table(['강의', '판매', '실 정산액', '상태'], [
      ['엑셀 함수 특강 (단기)', '18건', '705,600원', U.badge('정산 완료', 'b-ok')],
    ]), { aside: `<button class="btn btn-ghost btn-sm" type="button" data-swap="settle:none">8월로 돌아가기</button>` })}
  </div>
</div>

<div class="g2 mt6">
  ${U.card('정산은 이렇게 이뤄져요', `<ul class="list-plain">
    <li>· <b>매월 15일</b>에 전월 매출을 정산합니다</li>
    <li>· 플랫폼 수수료는 판매가의 <b>20%</b>입니다</li>
    <li>· 환불된 건은 그 달 정산에서 빠집니다</li>
    <li>· 정산액이 1만원 미만이면 다음 달로 넘어갑니다</li>
  </ul>`, { bdCls: 'tight' })}
  ${U.card('첫 정산을 받으려면', `<ul class="list-plain">
    <li>1. 강의를 열고 검수를 통과합니다</li>
    <li>2. 수강생이 결제하면 매출이 쌓입니다</li>
    <li>3. 다음 달 15일에 계좌로 들어옵니다</li>
  </ul>
  <div class="btns mt7">${U.btn('강의 개설하기', { cls: 'btn-primary', href: 'CU-02' })}
    ${U.btn('내 강의 목록', { cls: 'btn-ghost', href: 'CU-01' })}</div>`, { bdCls: 'tight' })}
</div>`;
  return { body, o: { admin: true, search: false } };
};

/* ================= AU-01 로그인 ================= */
P['AU-01'] = () => {
  const body = `
${U.card('', `
  <h1 class="t-sec center">다시 오셨네요</h1>
  <p class="t-sub center mt2">이메일로 로그인하거나 소셜 계정으로 바로 들어오세요</p>

  <div class="field mt6"><label class="lb" for="lg-mail">이메일</label>
    <input class="input" id="lg-mail" type="email" data-gate="login" data-label="이메일" placeholder="you@example.com"></div>
  <div class="field"><label class="lb" for="lg-pw">비밀번호</label>
    <div class="input-row"><input class="input" id="lg-pw" type="password" data-gate="login" data-label="비밀번호">
      <button class="btn btn-ghost" type="button" data-eye="#lg-pw" aria-label="비밀번호 보기">👁</button></div></div>

  <div class="row-b wrap-row">
    <label class="check"><input type="checkbox"><span>로그인 상태 유지</span></label>
    <a class="btn-link" href="${U.link('AU-05')}">비밀번호를 잊으셨나요?</a>
  </div>

  <div class="err-msg mt4" data-gatemsg="login" hidden></div>

  <div class="mt7"><a class="btn btn-primary btn-lg btn-block is-off" href="${U.link('HO-02')}" data-gated="login">로그인</a></div>

  <div class="row-c mt6" style="gap:12px"><span class="hr grow" style="margin:0"></span>
    <span class="t-sub">또는</span><span class="hr grow" style="margin:0"></span></div>

  <div class="btns-v mt4">
    <button class="btn btn-block" type="button" style="background:#FEE500" data-toast="카카오 로그인은 서버가 연결되면 동작합니다">카카오로 시작하기</button>
    <button class="btn btn-block" type="button" style="background:#03C75A;color:#fff" data-toast="네이버 로그인은 서버가 연결되면 동작합니다">네이버로 시작하기</button>
    <button class="btn btn-ghost btn-block" type="button" data-toast="구글 로그인은 서버가 연결되면 동작합니다">구글로 시작하기</button>
  </div>

  <p class="center mt6 t-sub">아직 회원이 아니신가요? <a class="btn-link" href="${U.link('AU-02')}">회원가입</a></p>
`)}`;
  return { body, o: { solo: true } };
};

/* ================= AU-02 회원가입 ================= */
P['AU-02'] = () => {
  const body = `
${U.steps(['정보 입력', '휴대폰 인증', '가입 완료'], 0)}

${U.card('', `
  <div class="btns-v">
    <button class="btn btn-block" type="button" style="background:#FEE500" data-toast="카카오 간편 가입은 서버가 연결되면 동작합니다">카카오로 간편 가입</button>
    <button class="btn btn-block" type="button" style="background:#03C75A;color:#fff" data-toast="네이버 간편 가입은 서버가 연결되면 동작합니다">네이버로 간편 가입</button>
    <button class="btn btn-ghost btn-block" type="button" data-toast="구글 간편 가입은 서버가 연결되면 동작합니다">구글로 간편 가입</button>
  </div>

  <div class="row-c mt6" style="gap:12px"><span class="hr grow" style="margin:0"></span>
    <span class="t-sub">이메일로 가입</span><span class="hr grow" style="margin:0"></span></div>

  <div class="field mt4"><label class="lb" for="su-mail">이메일<span class="req">*</span></label>
    <input class="input" id="su-mail" type="email" data-gate="signup" data-label="이메일" placeholder="you@example.com">
    <div class="err-msg" hidden id="mail-dup">⚠ 이미 가입된 이메일이에요. <a class="btn-link" href="${U.link('AU-01')}">로그인하러 가기</a></div></div>

  <div class="field"><label class="lb" for="su-pw">비밀번호<span class="req">*</span></label>
    <div class="input-row"><input class="input" id="su-pw" type="password" data-pw data-gate="signup" data-label="비밀번호">
      <button class="btn btn-ghost" type="button" data-eye="#su-pw" aria-label="비밀번호 보기">👁</button></div>
    <div class="row-c mt2"><span class="bar grow"><i data-pw-bar style="width:0"></i></span>
      <span class="t-sub" style="width:40px;text-align:right" data-pw-label>—</span></div>
    <div class="row-c mt2" style="gap:14px"><span class="t-sub" data-pw-len>○ 8자 이상</span><span class="t-sub" data-pw-mix>○ 영문+숫자</span></div></div>

  <div class="field"><label class="lb" for="su-pw2">비밀번호 확인<span class="req">*</span></label>
    <input class="input" id="su-pw2" type="password" data-pw2 data-gate="signup" data-label="비밀번호 확인">
    <div class="hint-ok" data-pw2-msg hidden></div></div>

  <div class="g2 gap-s">
    <div class="field"><label class="lb" for="su-nm">이름<span class="req">*</span></label>
      <input class="input" id="su-nm" data-gate="signup" data-label="이름"></div>
    <div class="field"><label class="lb" for="su-ph">휴대폰 번호<span class="req">*</span></label>
      <input class="input" id="su-ph" inputmode="numeric" placeholder="010-0000-0000" data-gate="signup" data-label="휴대폰 번호"></div>
  </div>

  <div class="field"><span class="lb">관심 분야 <span class="t-sub">(여러 개 고를 수 있어요)</span></span>
    <div class="chips">${CATS.map((c) => `<button class="chip chip-sm" type="button" data-pickchip="interest" data-v="${c.key}">${c.ico} ${c.key}</button>`).join('')}</div>
    <div class="help">고른 분야 — <b data-pickout="interest">아직 고르지 않았어요</b></div></div>

  <div class="box mt6">
    <label class="check" style="font-weight:700"><input type="checkbox" data-agreeall="signup"><span>전체 동의</span></label>
    <div class="hr" style="margin:12px 0"></div>
    <div class="checks">
      <label class="check"><input type="checkbox" data-agree="signup" data-gate="signup" data-label="이용약관 동의">
        <span class="grow">이용약관 <span class="pri">(필수)</span></span>
        <button class="btn-link" type="button" data-toast="약관 전문은 서버가 연결되면 열립니다">보기</button></label>
      <label class="check"><input type="checkbox" data-agree="signup" data-gate="signup" data-label="개인정보 처리방침 동의">
        <span class="grow">개인정보 처리방침 <span class="pri">(필수)</span></span>
        <button class="btn-link" type="button" data-toast="전문은 서버가 연결되면 열립니다">보기</button></label>
      <label class="check"><input type="checkbox" data-agree="signup" data-agree-optional>
        <span class="grow">마케팅 정보 수신 <span class="muted">(선택)</span></span>
        <button class="btn-link" type="button" data-toast="전문은 서버가 연결되면 열립니다">보기</button></label>
    </div>
  </div>

  <div class="err-msg mt4" data-gatemsg="signup" hidden></div>
  <div class="mt7"><a class="btn btn-primary btn-lg btn-block is-off" href="${U.link('AU-03')}" data-gated="signup">다음 — 휴대폰 인증</a></div>
  <p class="center mt4 t-sub">이미 회원이신가요? <a class="btn-link" href="${U.link('AU-01')}">로그인</a></p>
`)}`;
  return { body, o: { solo: true, wide: true } };
};

/* ================= AU-03 회원가입 · 휴대폰 인증 ================= */
P['AU-03'] = () => {
  const body = `
${U.steps(['정보 입력', '휴대폰 인증', '가입 완료'], 1)}

${U.card('', `
  <h1 class="t-sec center">보내 드린 번호를 넣어 주세요</h1>
  <p class="t-sub center mt2"><b>010-1234-5678</b>로 인증번호를 보냈어요</p>

  <div class="row-c mt6" style="justify-content:center;gap:8px" data-otp>
    ${Array.from({ length: 6 }, (_, i) => `<input class="input" style="width:52px;height:60px;text-align:center;font-size:24px;font-weight:800"
      inputmode="numeric" maxlength="1" data-timeout-lock aria-label="인증번호 ${i + 1}번째 자리">`).join('')}
  </div>
  <p class="center mt3"><span class="t-sub">남은 시간</span> <b class="pri" data-countdown="180">3:00</b></p>

  <div class="err-msg center mt3" data-otp-msg hidden style="justify-content:center">⚠ 인증번호가 맞지 않아요. 다시 확인해 주세요</div>
  <div class="err-msg center mt3" data-timeout-msg hidden style="justify-content:center">⚠ 시간이 지났어요. 인증번호를 다시 받아 주세요</div>

  <div class="mt7"><a class="btn btn-primary btn-lg btn-block is-off" href="${U.link('AU-04')}" data-otp-btn>확인</a></div>

  <div class="btns mt4" style="justify-content:center">
    <button class="btn btn-ghost" type="button" data-resend>인증번호 다시 받기</button>
    <a class="btn btn-ghost" href="${U.link('AU-02')}">번호 바꾸기</a>
  </div>

  <div class="box mt6"><p class="t-sub">문자가 오지 않나요?</p>
    <ul class="list-plain mt2"><li class="t-sub">· 스팸 차단 설정을 확인해 주세요</li>
    <li class="t-sub">· 통신사 문자 수신이 막혀 있을 수 있어요</li>
    <li class="t-sub">· 그래도 오지 않으면 1588-0000으로 알려 주세요</li></ul></div>
`)}`;
  return { body, o: { solo: true } };
};

/* ================= AU-04 회원가입 완료 ================= */
P['AU-04'] = () => {
  const body = `
${U.steps(['정보 입력', '휴대폰 인증', '가입 완료'], 2)}

${U.card('', `
  ${U.result('ok', '✓', '가입을 환영해요, 김수현님', '이제 배움터의 모든 강의를 들으실 수 있어요')}

  <div class="box-acc">
    <div class="row-b wrap-row"><div><b>🎟 첫 수강 20% 할인 쿠폰을 드렸어요</b>
      <div class="t-sub mt1">2026년 9월 6일까지 · 모든 유료 강의</div></div>
      ${U.badge('쿠폰함에 담김', 'b-acc')}</div>
  </div>

  <div class="mt6"><span class="lb">관심 분야를 고르면 추천이 바뀝니다</span>
    <div class="chips mt2">${['데이터', '개발', '디자인', '외국어'].map((k, i) => `<button class="chip chip-sm${i === 0 ? ' on' : ''}" type="button" data-pickchip="rec" data-v="${k}">${k}</button>`).join('')}</div>
    <div class="help">고른 분야 — <b data-pickout="rec">데이터</b></div>
  </div>

  <h2 class="t-sec mt6 mb4">이런 강의는 어때요?</h2>
  <div class="g3" data-list="rec" data-finit='{"cat":["데이터"]}'>${U.ccards(COURSES, { cols: 3, noHeart: true })}</div>
  <div data-list-empty="rec" hidden>${U.empty('🔍', '그 분야 강의가 아직 없어요', '다른 분야를 골라 보세요')}</div>

  <div class="btns-v mt7">
    ${U.btn('강의 둘러보기', { cls: 'btn-primary btn-lg btn-block', href: 'CO-01' })}
    ${U.btn('내 강의실로 가기', { cls: 'btn-ghost btn-block', href: 'CL-01' })}
  </div>
  <p class="center mt6 t-sub">가르치는 일에 관심 있으세요? <a class="btn-link" href="${U.link('TC-02')}">강사 지원하기</a></p>
`)}`;
  return { body, o: { solo: true, wide: true } };
};

/* ================= AU-05 비밀번호 찾기 ================= */
P['AU-05'] = () => {
  const body = `
<div data-swap-set="pw">
  <div data-swap-key="ask">
    ${U.card('', `
      <h1 class="t-sec center">비밀번호를 새로 만들까요?</h1>
      <p class="t-sub center mt2">가입하신 방법을 고르시면 그 방법으로 안내를 보내 드려요</p>

      <div class="radios mt6">
        <div class="radio on" data-group="find" data-shows="mail" data-label="이메일로 받기"><span class="dot"></span>
          <span class="grow"><b>이메일로 받기</b><div class="t-sub">재설정 링크를 메일로 보냅니다</div></span></div>
        <div class="radio" data-group="find" data-shows="sms" data-label="문자로 받기"><span class="dot"></span>
          <span class="grow"><b>문자로 받기</b><div class="t-sub">인증번호를 문자로 보냅니다</div></span></div>
      </div>

      <div class="field mt6" data-shown-by="find:mail">
        <label class="lb" for="fp-mail">가입한 이메일</label>
        <input class="input" id="fp-mail" type="email" placeholder="you@example.com" data-gate="find" data-label="이메일">
        <div class="err-msg" hidden id="fp-none">⚠ 등록되지 않은 이메일이에요. 다시 확인해 주세요</div></div>
      <div class="field mt6" data-shown-by="find:sms" hidden>
        <label class="lb" for="fp-ph">가입한 휴대폰 번호</label>
        <input class="input" id="fp-ph" inputmode="numeric" placeholder="010-0000-0000"></div>

      <div class="err-msg mt3" data-gatemsg="find" hidden></div>
      <div class="mt7"><button class="btn btn-primary btn-lg btn-block is-off" type="button" data-gated="find" data-swap="pw:sent">재설정 링크 보내기</button></div>
      <p class="center mt4 t-sub"><a class="btn-link" href="${U.link('AU-01')}">로그인으로 돌아가기</a></p>
    `)}
  </div>

  <div data-swap-key="sent" hidden>
    ${U.card('', `
      ${U.result('pri', '📬', '메일함을 확인해 주세요', '보내 드린 링크를 누르면 새 비밀번호를 만들 수 있어요. 링크는 30분 동안만 쓸 수 있습니다.')}
      <div class="btns-v mt6">
        <button class="btn btn-soft btn-block" type="button" data-toast="메일을 다시 보냈어요" data-toast-kind="ok">다시 보내기</button>
        <button class="btn btn-ghost btn-block" type="button" data-swap="pw:reset">링크를 눌러 들어온 화면 보기</button>
        <a class="btn btn-ghost btn-block" href="${U.link('AU-01')}">로그인으로 돌아가기</a>
      </div>
    `)}
  </div>

  <div data-swap-key="reset" hidden>
    ${U.card('', `
      <h1 class="t-sec center">새 비밀번호를 만들어 주세요</h1>
      <div class="field mt6"><label class="lb" for="np">새 비밀번호</label>
        <div class="input-row"><input class="input" id="np" type="password" data-pw data-gate="reset" data-label="새 비밀번호">
          <button class="btn btn-ghost" type="button" data-eye="#np" aria-label="비밀번호 보기">👁</button></div>
        <div class="row-c mt2"><span class="bar grow"><i data-pw-bar style="width:0"></i></span>
          <span class="t-sub" style="width:40px;text-align:right" data-pw-label>—</span></div>
        <div class="row-c mt2" style="gap:14px"><span class="t-sub" data-pw-len>○ 8자 이상</span><span class="t-sub" data-pw-mix>○ 영문+숫자</span></div></div>
      <div class="field"><label class="lb" for="np2">새 비밀번호 확인</label>
        <input class="input" id="np2" type="password" data-pw2 data-gate="reset" data-label="비밀번호 확인">
        <div class="hint-ok" data-pw2-msg hidden></div></div>
      <div class="err-msg mt3" data-gatemsg="reset" hidden></div>
      <div class="mt7"><a class="btn btn-primary btn-lg btn-block is-off" href="${U.link('AU-01')}" data-gated="reset">비밀번호 바꾸고 로그인하기</a></div>
    `)}
  </div>
</div>`;
  return { body, o: { solo: true } };
};
