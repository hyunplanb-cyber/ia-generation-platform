/* RV 후기·문의·알림 3장 · AC 계정 3장 */
import {
  ph, phAva, phFix, btn, badge, stBadge, chips, tabs, sec, card, banner, empty, table, kv,
  gauge, countdown, dealCards, leftText, review, rateSummary, rateIn, accordion,
  pageHd, detail2, myPage, soloBox, hsteps, num, won, esc, link, off,
} from './ui.mjs';
import { DEALS, dealById, pctOf, REVIEWS, RATE_DIST, QNAS, CATS } from './data.mjs';

/* ── RV-01 후기 작성·목록 ───────────────────────────── */
function rv01() {
  const d = dealById('d1');
  const main = `
    ${card('후기 쓰기', `<div class="row wrap-row mb4" style="gap:16px">
      ${phFix(['상품 사진', 1000, 1000], 88, { seed: d.id })}
      <div class="grow"><b>${esc(d.nm)}</b>
        <div class="t-sub mt1">5kg (특대과 12~14과) · 1개 · 2026년 8월 3일 받음</div></div>
    </div>
    <div class="hr"></div>
    ${rateIn('상품은 어떠셨나요?', 5)}
    <div class="field mt4"><label class="label">사진·동영상 (선택)</label>
      <div class="upload" style="padding:22px">
        <div class="ico">📷</div><b>사진을 끌어다 놓으세요</b>
        <p class="t-sub">JPG·PNG·MP4 · 최대 5개 · 사진 후기는 3,000원 쿠폰을 드립니다</p>
        ${btn('사진 고르기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="파일 선택 창이 열려요"' })}
      </div>
      <div class="row mt3" style="gap:8px">${[1, 2].map((i) => `<div style="position:relative">${phFix(['후기 사진', 1000, 1000], 80, { seed: 'up' + i })}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="사진을 뺐어요" style="position:absolute;top:-6px;right:-6px;padding:0 7px">✕</button></div>`).join('')}</div>
    </div>
    <div class="field"><label class="label">후기 내용</label>
      <textarea class="textarea" rows="5" placeholder="어떤 점이 좋았는지, 아쉬웠는지 적어 주세요. 다음 분들께 큰 도움이 됩니다."></textarea>
      <p class="hint">20자 이상 쓰시면 쿠폰이 지급됩니다</p></div>
    <div class="field"><label class="label">또 사실 건가요?</label>
      ${chips(['꼭 다시 살래요', '괜찮으면 살래요', '한 번이면 충분해요'], 0)}</div>
    <div class="row-b mt4">
      <label class="check" style="padding:0"><input type="checkbox"><span>닉네임을 가리고 올리기</span></label>
      ${btn('후기 올리기', { cls: 'btn-primary', attr: ' data-toast="후기를 올렸어요. 3,000원 쿠폰을 드렸습니다" data-toast-kind="ok"' })}
    </div>`)}

    ${card('후기', `${rateSummary(d.rate, RATE_DIST)}
      <div class="row-b mt4 wrap-row">
        ${tabs(['전체', '포토 후기', '5점', '3점 이하'], 0, { pill: true })}
        <select class="select" style="width:150px"><option>최신순</option><option>도움돼요순</option><option>별점 높은순</option></select>
      </div>
      <div class="mt4">${REVIEWS.map((r) => `${review(r, { deal: false })}
        ${r.photo ? `<div class="box box-mut" style="margin:-8px 0 20px 48px"><div class="row" style="gap:8px">${badge('진행자', 'b-pri')}<b>${esc(d.host)}</b><span class="t-sub">${r.at}</span></div>
          <p class="t-sub mt2">좋게 봐 주셔서 고맙습니다. 다음 회차는 9월 초에 열 예정이니 알림 걸어 두시면 알려드릴게요.</p></div>` : ''}`).join('')}</div>`,
    { cls: 'mt6', ft: btn('후기 더 보기', { cls: 'btn-ghost btn-block btn-sm', attr: ' data-toast="후기 20개를 더 불러왔어요"' }) })}`;

  const aside = card('후기 쓰면 좋은 점', `<div class="coupon">
      <div class="grow"><b>포토 후기 3,000원</b><p class="t-sub">사진 1장 이상 + 20자 이상</p></div>
      <div class="per">3천</div>
    </div>
    <div class="coupon mt2">
      <div class="grow"><b>일반 후기 1,000원</b><p class="t-sub">20자 이상</p></div>
      <div class="per">1천</div>
    </div>
    <div class="hr"></div>
    <b>이렇게 써 주시면 좋아요</b>
    <ul class="t-sub mt2" style="padding-left:18px;line-height:1.9">
      <li>사진은 실제 받으신 상태 그대로</li>
      <li>크기·양이 생각과 같았는지</li>
      <li>배송이 얼마나 걸렸는지</li>
      <li>아쉬웠던 점도 솔직하게</li>
    </ul>
    <div class="hr"></div>
    <p class="t-sub">광고·욕설·개인정보가 담긴 후기는 알림 없이 지워질 수 있습니다.</p>`);

  const body = `${pageHd('후기', esc(d.nm))}<div class="mt6">${detail2(main, aside)}</div>`;
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── RV-02 상품 문의(Q&A) ───────────────────────────── */
function rv02() {
  const d = dealById('d1');
  const main = `
    ${card('문의하기', `<div class="field-row">
      <div class="field grow"><label class="label">문의 유형</label>
        <select class="select"><option>상품</option><option>배송</option><option selected>성사·환불</option><option>참여·결제</option><option>기타</option></select></div>
      <div class="field grow"><label class="label">관련 공구</label>
        <select class="select"><option selected>${esc(d.nm)}</option><option>내가 참여한 다른 공구</option></select></div>
    </div>
    <div class="field"><label class="label">제목</label><input class="input" placeholder="무엇이 궁금하신가요?"></div>
    <div class="field"><label class="label">내용</label>
      <textarea class="textarea" rows="4" placeholder="자세히 적어 주시면 답이 빨라집니다"></textarea></div>
    <div class="row-b mt3">
      <label class="check" style="padding:0"><input type="checkbox"><span>비공개로 묻기 (진행자와 나만 봅니다)</span></label>
      ${btn('문의 올리기', { cls: 'btn-primary', attr: ' data-toast="문의를 올렸어요. 보통 하루 안에 답이 옵니다" data-toast-kind="ok"' })}
    </div>`)}

    ${card('많이 묻는 것', accordion([
    { q: '성사가 안 되면 결제한 돈은 어떻게 되나요?', a: '자동으로 전액 환불됩니다. 마감 직후 바로 환불이 걸리고, 카드사에 따라 2~5영업일 안에 들어옵니다.' },
    { q: '언제 받을 수 있나요?', a: `성사 확정 후 ${esc(d.ship)}입니다. 발송되면 송장번호를 알림으로 보내드립니다.` },
    { q: '옵션을 바꾸고 싶어요', a: '마감 전에는 참여를 취소하고 다시 참여하시면 됩니다. 취소 수수료는 없습니다.' },
  ], 0), { cls: 'mt6' })}

    <div class="row-b mt6 wrap-row">
      ${tabs([{ label: '전체', cnt: 48 }, { label: '답변 완료', cnt: 44 }, { label: '답변 대기', cnt: 4 }], 0)}
      <div class="row" style="gap:8px">
        <input class="input" style="width:200px" placeholder="문의 검색">
        <button class="toggle" type="button" data-toast="내 문의만 보고 있어요">내 문의만</button>
      </div>
    </div>

    <div class="mt4">${QNAS.map((q) => `<div class="card mt3"><div class="card-bd">
      <div class="row-b wrap-row"><div class="row" style="gap:10px">${phAva(34, q.who)}
        <div><b>${esc(q.q)}</b><div class="t-sub">${esc(q.who)} · ${q.at} · ${q.kind}</div></div></div>
        ${stBadge(q.st)}</div>
      ${q.a ? `<div class="box box-pri mt3"><div class="row" style="gap:8px">${badge('진행자', 'b-pri')}<b>${esc(d.host)}</b><span class="t-sub">${q.at}</span></div>
        <p class="mt2">${esc(q.a)}</p></div>`
      : `<div class="box box-warn mt3"><p class="t-sub">아직 답변이 달리지 않았습니다. 보통 하루 안에 답이 옵니다.</p></div>`}
      <div class="row mt3" style="gap:8px">
        <button class="btn btn-ghost btn-sm" type="button" data-toast="궁금해요를 눌렀어요">🙋 나도 궁금해요</button>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="신고를 접수했어요">신고</button>
      </div></div></div>`).join('')}</div>`;

  const aside = card('내 문의', `${[['성사가 안 되면 결제한 돈은?', '답변 완료'], ['제주도 배송되나요?', '답변 대기']]
    .map(([t, st]) => `<div class="row-b" style="padding:10px 0"><span class="grow">${t}</span>${badge(st, st === '답변 완료' ? 'b-ok' : 'b-warn')}</div>`).join('')}
    <div class="hr"></div>
    ${kv([['진행자 평균 답변 시간', '6시간'], ['답변률', '97%']])}
    <div class="box box-mut mt3"><p class="t-sub">답변이 달리면 앱 알림으로 알려드립니다. 알림이 꺼져 있으면 못 받으실 수 있어요.</p></div>
    <div class="btns mt3">${btn('알림 설정', { cls: 'btn-ghost btn-block btn-sm', href: 'AC-03' })}</div>
    ${btn('고객센터에 문의', { cls: 'btn-ghost btn-block btn-sm', href: 'CS-02' })}`);

  const body = `${pageHd('상품 문의', esc(d.nm))}<div class="mt6">${detail2(main, aside)}</div>`;
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── RV-03 관심 공구·알림함 ─────────────────────────── */
function rv03() {
  const liked = DEALS.slice(0, 3);
  const alarms = [
    ['성사', '「독일산 스테인리스 냄비 3종 세트」가 성사됐어요', '2시간 전', 'b-ok', 'DE-03'],
    ['마감 임박', '「병풀 진정 앰플」이 21분 뒤 마감돼요', '4시간 전', 'b-danger', 'DE-01'],
    ['환불', '「겨울 기모 맨투맨」 환불이 완료됐어요', '어제', 'b-mut', 'MY-02'],
    ['배송', '「동결건조 닭가슴살」이 발송됐어요 (한진 640123456789)', '2일 전', 'b-acc', 'MY-02'],
    ['재오픈', '찜하신 「제주 한라봉」이 다시 열렸어요', '3일 전', 'b-pri', 'DE-01'],
  ];

  const main = `
    ${tabs([{ label: '관심 공구', cnt: 3 }, { label: '오픈 예정 알림', cnt: 2 }, { label: '알림 내역', cnt: 5 }], 0)}

    ${card('관심 공구', liked.map((d) => `<div class="list-row">
      ${phFix(['상품 사진', 1000, 1000], 96, { seed: d.id })}
      <div class="grow">
        <div class="row wrap-row" style="gap:6px">${badge(off(d.was, d.now) + '%', 'b-acc')}${countdown(d.left)}
          ${pctOf(d) >= 95 ? badge('곧 성사!', 'b-ok') : ''}</div>
        <b class="mt1" style="display:block">${esc(d.nm)}</b>
        <div class="mt2" style="max-width:360px">${gauge(pctOf(d))}</div>
        <div class="t-sub mt1">${num(d.joined)}명 참여 · 담아 두신 뒤 ${num(d.joined - 40)}명 늘었어요</div>
      </div>
      <div class="right nowrap">${btn('참여하기', { cls: 'btn-primary btn-sm', href: 'JO-01' })}
        <div class="mt2"><button class="btn btn-ghost btn-sm accent" type="button" data-toast="찜 목록에서 뺐어요">♥ 빼기</button></div></div>
    </div>`).join(''), { cls: 'mt4' })}

    ${card('오픈 예정 알림', `${[['설 선물세트 한우 1++ 등급', '8월 6일 10:00'], ['캠핑용 접이식 테이블 세트', '8월 7일 12:00']]
      .map(([t, o]) => `<div class="row-b" style="padding:12px 0">
        <div class="grow"><b>${t}</b><div class="t-sub">${o} 오픈 예정</div></div>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="알림을 껐어요">알림 끄기</button></div>`).join('')}`,
    { cls: 'mt6' })}

    ${card('알림 내역', `<div class="row-b mb3">
      <span class="t-sub">읽지 않은 알림 2개</span>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="모두 읽음으로 바꿨어요">모두 읽음</button></div>
      ${alarms.map(([k, t, at, cls, go]) => `<a class="feed-row" href="${link(go)}">
        ${badge(k, cls)}<div class="grow">${t}</div><span class="t-sub nowrap">${at}</span></a>`).join('')}`,
    { cls: 'mt6' })}`;

  const aside = card('알림 받기', `<p class="t-sub">담아 두신 공구에 무슨 일이 생기면 알려드립니다.</p>
    <div class="mt3">${[['마감 임박 (3시간 전)', true], ['성사됐을 때', true], ['불발·환불', true], ['재오픈', true], ['오픈 예정', false]]
    .map(([t, on]) => `<div class="row-b" style="padding:9px 0"><span>${t}</span>
      <button class="toggle${on ? ' on' : ''}" type="button" data-toast="${t} 알림을 바꿨어요"></button></div>`).join('')}</div>
    <div class="hr"></div>
    ${btn('알림 설정 자세히', { cls: 'btn-ghost btn-block btn-sm', href: 'AC-03' })}`);

  const body = myPage('RV-03', `${pageHd('관심 공구·알림')}<div class="mt6">${detail2(main, aside)}</div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── AC-01 로그인·회원가입 ──────────────────────────── */
function ac01() {
  const body = soloBox('시작하기', '3초면 시작하실 수 있어요', `
    <div class="social">
      <button class="btn btn-block btn-lg s-kakao" type="button" data-toast="카카오 로그인 창이 열려요">카카오로 3초 만에 시작</button>
      <button class="btn btn-block s-naver" type="button" data-toast="네이버 로그인 창이 열려요">네이버로 계속하기</button>
      <button class="btn btn-block s-apple" type="button" data-toast="구글 로그인 창이 열려요">Google로 계속하기</button>
    </div>
    <div class="divider">이메일로 하기</div>
    <div class="form">
      <div class="field"><label class="label">이메일</label><input class="input" type="email" placeholder="you@example.com"></div>
      <div class="field"><label class="label">비밀번호</label><input class="input" type="password"></div>
      <div class="err">이메일 또는 비밀번호가 맞지 않습니다.</div>
      <div class="row-b mt3">
        <label class="check" style="padding:0"><input type="checkbox" checked><span>로그인 상태 유지</span></label>
        <button class="btn-link" type="button" data-toast="비밀번호 재설정 메일을 보냈어요" data-toast-kind="ok">비밀번호 찾기</button>
      </div>
      ${btn('로그인', { cls: 'btn-primary btn-lg btn-block', href: 'HO-01' })}
    </div>

    <div class="card mt6"><div class="card-bd">
      <h3 class="t-card mb3">처음이신가요? 회원가입</h3>
      ${hsteps(['정보 입력', '휴대폰 인증', '완료'], 0)}
      <div class="form mt4">
        <div class="field"><label class="label">휴대폰 번호</label>
          <div class="field-btn"><input class="input" placeholder="- 없이 숫자만">
            ${btn('인증번호 받기', { cls: 'btn-ghost', attr: ' data-toast="인증번호를 보냈어요" data-toast-kind="ok"' })}</div></div>
        <div class="field"><label class="label">인증번호</label>
          <div class="field-btn"><input class="input" placeholder="6자리"><b class="nowrap" data-count="180">03:00</b></div></div>
      </div>
      <div class="hr"></div>
      <label class="check"><input type="checkbox"><span><b>전체 동의</b></span></label>
      ${[['만 14세 이상입니다', true], ['이용약관', true], ['개인정보 처리방침', true], ['마케팅 정보 수신 (공구 소식·할인)', false]]
      .map(([t, req]) => `<div class="row-b"><label class="check"><input type="checkbox"><span>${t} ${req ? '<span class="danger">(필수)</span>' : '<span class="t-sub">(선택)</span>'}</span></label>
        <button class="btn-link" type="button" data-toast="전문을 새 창에서 열어요">보기</button></div>`).join('')}
      <div class="coupon mt4"><div class="grow"><b>가입하시면 2,000원 쿠폰</b><p class="t-sub">첫 참여에 바로 쓰실 수 있어요</p></div><div class="per">2천</div></div>
      <div class="btns mt4">${btn('가입하고 시작하기', { cls: 'btn-primary btn-lg btn-block', href: 'HO-01' })}</div>
    </div></div>

    <p class="t-sub center mt6">회원가입 없이 <button class="btn-link" type="button" data-toast="주문 조회 창을 열어요">비회원 주문 조회</button></p>`,
    { lg: true });
  return { body, o: { solo: true, full: true } };
}

/* ── AC-02 내 정보·배송지 ───────────────────────────── */
function ac02() {
  const body = myPage('AC-02', `
    ${pageHd('내 정보·배송지')}

    ${card('프로필', `<div class="row wrap-row" style="gap:20px;align-items:flex-start">
      ${phAva(88, '김하늘')}
      <div class="grow form">
        <div class="field"><label class="label">닉네임</label><input class="input" value="김하늘" style="max-width:320px">
          <p class="hint">후기와 문의에 이 이름이 보입니다</p></div>
        <div class="btns">${btn('사진 바꾸기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="파일 선택 창이 열려요"' })}</div>
      </div>
      <div class="box box-mut" style="min-width:200px">
        <div class="row-b"><span class="t-sub">참여한 공구</span><b>12건</b></div>
        <div class="row-b mt2"><span class="t-sub">쓴 후기</span><b>7건</b></div>
        <div class="row-b mt2"><span class="t-sub">성사율</span><b>83%</b></div>
      </div>
    </div>`)}

    ${card('연락처', `<div class="form">
      <div class="field"><label class="label">휴대폰</label>
        <div class="field-btn"><input class="input" value="010-1234-5678">
          ${btn('인증', { cls: 'btn-ghost', attr: ' data-toast="인증번호를 보냈어요" data-toast-kind="ok"' })}</div>
        <p class="hint">배송·성사 알림을 이 번호로 보냅니다</p></div>
      <div class="field"><label class="label">이메일</label>
        <div class="field-btn"><input class="input" value="haneul@example.com">
          ${btn('바꾸기', { cls: 'btn-ghost', attr: ' data-toast="새 주소로 인증 메일을 보냈어요" data-toast-kind="ok"' })}</div></div>
    </div>`, { cls: 'mt6' })}

    ${card('배송지', `${[
    ['집', '김하늘', '서울 성동구 아차산로 111, 302동 1804호 (04781)', true],
    ['회사', '김하늘', '서울 강남구 테헤란로 231 8층 (06142)', false],
  ].map(([nm, who, addr, main]) => `<div class="row-b list-row" style="padding:14px 0">
      <div class="grow"><div class="row" style="gap:8px"><b>${nm}</b>${main ? badge('기본 배송지', 'b-pri') : ''}</div>
        <div class="t-sub mt1">${who} · 010-1234-5678</div>
        <div class="t-sub">${addr}</div></div>
      <div class="btns nowrap">
        ${main ? '' : '<button class="btn btn-ghost btn-sm" type="button" data-toast="기본 배송지로 바꿨어요" data-toast-kind="ok">기본으로</button>'}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="수정 창을 열었어요">수정</button>
        <button class="btn btn-ghost btn-sm" type="button" data-toast="배송지를 지웠어요">삭제</button>
      </div></div>`).join('')}
    <button class="btn btn-soft btn-block btn-sm mt3" type="button" data-toast="새 배송지 입력 창을 열었어요">＋ 배송지 추가</button>`,
    { cls: 'mt6' })}

    ${card('결제 수단', `<div class="row-b list-row" style="padding:14px 0">
      <div class="grow"><b>국민카드</b> <span class="badge b-pri">기본</span>
        <div class="t-sub mt1">1234-**-**-5678 · 김하늘</div></div>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="카드를 지웠어요">삭제</button></div>
    <button class="btn btn-soft btn-block btn-sm mt3" type="button" data-toast="카드 등록 창을 열었어요">＋ 결제 수단 추가</button>`,
    { cls: 'mt6' })}

    ${card('쿠폰·적립금', `<div class="g2">
      <div class="box box-acc center"><div class="t-sub">쓸 수 있는 쿠폰</div><div class="t-sec">3장</div>
        <button class="btn btn-ghost btn-sm mt2" type="button" data-toast="쿠폰함을 열었어요">쿠폰함 보기</button></div>
      <div class="box box-ok center"><div class="t-sub">적립금</div><div class="t-sec">3,240원</div>
        <button class="btn btn-ghost btn-sm mt2" type="button" data-toast="적립금 내역을 열었어요">내역 보기</button></div>
    </div>`, { cls: 'mt6' })}

    ${card('진행자로 활동하기', `<div class="row-b wrap-row">
      <div><b>직접 공구를 열어 보실래요?</b>
        <p class="t-sub mt1">상품을 구할 곳만 있으면 누구나 진행자가 될 수 있습니다. 첫 공구는 수수료가 없습니다.</p></div>
      ${btn('진행자 시작하기', { cls: 'btn-primary', href: 'HS-01' })}</div>`, { cls: 'mt6' })}

    ${card('', `<div class="row-b wrap-row">
      <div><b>회원 탈퇴</b><p class="t-sub mt1">진행 중인 공구가 있으면 탈퇴하실 수 없습니다. 지금 진행 중인 공구가 1건 있어요.</p></div>
      ${btn('회원 탈퇴', { cls: 'btn-danger', off: true })}</div>`, { cls: 'mt6' })}`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

/* ── AC-03 알림 설정 ────────────────────────────────── */
function ac03() {
  const kinds = [
    ['찜한 공구 마감 임박', '마감 3시간 전에 알려드립니다', true],
    ['성사됐을 때', '참여하신 공구가 성사되면 바로 알려드립니다', true],
    ['불발·환불', '불발되면 환불 진행 상태를 알려드립니다', true],
    ['오픈 예정 공구', '알림 신청하신 공구가 열릴 때', true],
    ['배송', '발송·도착 예정을 알려드립니다', true],
    ['혜택·할인 소식', '쿠폰과 기획전 소식', false],
  ];
  const body = myPage('AC-03', `
    ${pageHd('알림 설정', '꼭 필요한 것만 골라 받으세요')}

    ${card('어디로 받을까요', `<div class="g4">
      ${[['앱 푸시', true], ['카카오 알림톡', true], ['문자(SMS)', false], ['이메일', false]]
      .map(([t, on]) => `<div class="box center"><b>${t}</b>
        <button class="btn btn-ghost btn-sm mt3 toggle${on ? ' on' : ''}" type="button" data-toast="${t} 알림을 바꿨어요">${on ? '켜짐' : '꺼짐'}</button></div>`).join('')}
    </div>
    <p class="t-sub mt3">앱을 지우시면 푸시 알림이 가지 않습니다. 중요한 안내는 알림톡으로도 함께 보내드립니다.</p>`)}

    ${card('무엇을 받을까요', kinds.map(([t, d, on]) => `<div class="row-b list-row" style="padding:13px 0">
      <div class="grow"><b>${t}</b><div class="t-sub">${d}</div></div>
      <button class="toggle${on ? ' on' : ''}" type="button" data-toast="${t} 알림을 바꿨어요"></button>
    </div>`).join(''), { cls: 'mt6' })}

    ${card('밤에는 보내지 않기', `<div class="row-b wrap-row">
      <div class="grow"><b>방해 금지 시간</b>
        <p class="t-sub mt1">이 시간에는 알림을 보내지 않습니다. 다만 마감 임박처럼 놓치면 안 되는 것은 다음 날 아침에 모아서 보내드립니다.</p></div>
      <button class="toggle on" type="button" data-toast="방해 금지를 바꿨어요"></button>
    </div>
    <div class="row mt3" style="gap:8px;align-items:center">
      <input class="input" type="time" value="21:00" style="width:130px">
      <span class="t-sub">부터</span>
      <input class="input" type="time" value="08:00" style="width:130px">
      <span class="t-sub">까지</span>
    </div>`, { cls: 'mt6' })}

    ${card('관심 카테고리', `<p class="t-sub mb3">고르신 카테고리에 새 공구가 열리면 알려드립니다.</p>
      ${chips(CATS.map((c) => c.nm), [0, 1, 3])}`, { cls: 'mt6' })}

    ${card('광고성 정보 수신', `<div class="row-b wrap-row">
      <div class="grow"><b>혜택·할인 소식 받기</b>
        <p class="t-sub mt1">2026년 3월 14일에 동의하셨습니다. 언제든 철회하실 수 있고, 철회하셔도 서비스 이용에는 영향이 없습니다.</p></div>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="광고성 정보 수신을 철회했어요" data-toast-kind="ok">수신 철회</button>
    </div>`, { cls: 'mt6' })}

    <div class="btns mt6">
      ${btn('저장', { cls: 'btn-primary btn-lg', attr: ' data-toast="알림 설정을 저장했어요" data-toast-kind="ok"' })}
      ${btn('기본값으로 되돌리기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="처음 상태로 되돌렸어요"' })}
    </div>`);
  return { body, o: { wrapCls: 'wrap wrap-full' } };
}

export const PAGES = {
  'RV-01': rv01, 'RV-02': rv02, 'RV-03': rv03,
  'AC-01': ac01, 'AC-02': ac02, 'AC-03': ac03,
};
