/* MY — 마이페이지 (40 화면) */
import * as U from './ui.mjs';
import { BOOKINGS, COUPONS, NOTIFS, REVIEWS, TRIP, P, REFUND_RULES, CAT_LABEL, SITE } from './data.mjs';

const { ph, phMap, pcards, sec, card, banner, badge, tabs, table, kv, sumRows, won, num, link,
  empty, pageHd, prodSummary, toastEl, modalEl, modalTpl, accordion, review, stars, myNav,
  progress, stepbar, qrSm, esc } = U;

/* ===== MY01 로그인 ===== */
export function MY0101(ctx) {
  const id = ctx.id;
  const fail = id === 'MY0102';
  const guest = id === 'MY0103';

  const inner = guest ? `
    <h1 class="t-sec center mb2">비회원 예약 조회</h1>
    <p class="t-sub center mb6">예약할 때 입력한 정보로 조회할 수 있어요</p>
    <div class="field"><label class="label">예약번호<span class="req">*</span></label>
      <input class="input" placeholder="TN2607-284193"><p class="hint">확정 메일이나 문자에서 확인할 수 있어요</p></div>
    <div class="field"><label class="label">여권 영문명<span class="req">*</span></label>
      <input class="input" placeholder="HONG GILDONG"></div>
    <div class="field"><label class="label">이메일<span class="req">*</span></label>
      <input class="input" placeholder="예약할 때 입력한 이메일"></div>
    <button class="btn btn-primary btn-block btn-lg mt4" type="button" onclick="location.href='${link('MY0501')}'">예약 조회</button>
    ${banner('warn', 'ℹ', '<b>조회되지 않으면</b> 예약번호의 하이픈(-)과 영문명 철자를 확인해주세요. 그래도 안 되면 고객센터로 문의해주세요.', { cls: 'mt4' })}
    ${banner('pri', '🎁', '<b>회원으로 전환하면</b> 예약이 계정에 연결되고, 바우처·후기·쿠폰을 한 곳에서 관리할 수 있어요.', {
    cls: 'mt3', right: `<a class="btn btn-ghost btn-sm" href="${link('MY0201')}">회원가입</a>`,
  })}
    <div class="btns mt6" style="justify-content:center"><a class="btn btn-ghost" href="${link('VC0101')}">바우처 바로 열람</a>
      <a class="btn btn-ghost" href="${link('MY0101')}">로그인으로</a></div>`
    : `
    <h1 class="t-sec center mb2">로그인</h1>
    <p class="t-sub center mb6">예약 내역과 바우처를 확인하세요</p>
    ${fail ? banner('danger', '⚠', `<b>이메일 또는 비밀번호가 맞지 않아요.</b>
      <div class="mt2">남은 시도 횟수 <b>2회</b> · 5회 실패하면 30분간 로그인이 잠깁니다.</div>`, { cls: 'mb4' }) : ''}
    <div class="field"><label class="label">이메일</label>
      <input class="input ${fail ? 'is-err' : ''}" value="kim@example.com"></div>
    <div class="field"><label class="label">비밀번호</label>
      <input class="input ${fail ? 'is-err' : ''}" type="password" value="••••••••">
      ${fail ? '<p class="err">비밀번호를 다시 확인해주세요. 대소문자를 구분합니다.</p>' : ''}</div>
    <div class="row-b mb4"><label class="check"><input type="checkbox" checked><span>자동 로그인</span></label>
      <button class="pri strong"  style="font-size:13px" type="button" data-toast="비밀번호 찾기는 서버가 연결되면 열립니다">비밀번호를 잊으셨나요?</button></div>
    <button class="btn btn-primary btn-block btn-lg" type="button" onclick="location.href='${link('MY0301')}'">로그인</button>
    ${fail ? `<div class="btns mt3"><button class="btn btn-ghost btn-block"  type="button" data-toast="비밀번호 찾기는 서버가 연결되면 열립니다">비밀번호 재설정 메일 받기</button></div>` : ''}

    <div class="row-c mt6 mb4"><span class="grow" style="height:1px;background:var(--border)"></span>
      <span class="t-sub">또는</span><span class="grow" style="height:1px;background:var(--border)"></span></div>
    <div class="col">
      <button class="btn btn-block" type="button" style="background:#FEE500;color:#191600" data-toast="카카오 로그인 창이 열려요">카카오로 계속하기</button>
      <button class="btn btn-ghost btn-block" type="button" data-toast="구글 로그인 창이 열려요">Google로 계속하기</button>
      <button class="btn btn-block" type="button" style="background:#111;color:#fff" data-toast="애플 로그인 창이 열려요">Apple로 계속하기</button>
    </div>
    <p class="center mt6 t-sub">아직 회원이 아니세요? <a class="pri strong" href="${link('MY0201')}">회원가입</a></p>
    <p class="center mt3"><a class="pri strong" href="${link('MY0103')}" style="font-size:13px">예약번호로 조회하기 (비회원)</a></p>`;

  const body = `<div style="max-width:440px;margin:0 auto"><div class="card"><div class="card-bd" style="padding:32px 24px">${inner}</div></div></div>`;

  return {
    body, o: {
      state: fail ? '로그인 실패 — 남은 시도 횟수와 잠금 안내' : guest ? '비회원 예약 조회 — 예약번호·영문명·이메일 조회' : '',
    },
  };
}

/* ===== MY02 회원가입 ===== */
export function MY0201(ctx) {
  const id = ctx.id;
  const dup = id === 'MY0202';
  const terms = id === 'MY0203';

  const body = `<div style="max-width:560px;margin:0 auto">
  ${banner('acc' === 'acc' ? 'pri' : 'pri', '🎁', '<b>가입하면 첫 예약 10% 쿠폰</b>을 드려요. 최소 결제 금액 30,000원, 유효기간 60일.', { cls: 'mb4' })}
  <div class="card"><div class="card-bd" style="padding:32px 24px">
    <h1 class="t-sec center mb6">회원가입</h1>

    ${dup ? banner('danger', '⚠', `<b>이미 가입된 이메일이에요.</b>
      <div class="mt2">이 이메일은 <b>카카오 계정</b>으로 가입되어 있어요. 카카오로 로그인하면 바로 이용할 수 있습니다.</div>
      <div class="btns mt3"><button class="btn btn-primary btn-sm" type="button" style="background:#FEE500;color:#191600" data-toast="카카오 로그인 창이 열려요">카카오로 로그인</button>
        <a class="btn btn-ghost btn-sm" href="${link('MY0101')}">로그인으로 이동</a>
        <button class="btn btn-ghost btn-sm"  type="button" data-toast="비밀번호 찾기는 서버가 연결되면 열립니다">비밀번호 찾기</button></div>`, { cls: 'mb4' }) : ''}

    <div class="field"><label class="label">이메일<span class="req">*</span></label>
      <input class="input ${dup ? 'is-err' : ''}" value="kim@example.com">
      ${dup ? '<p class="err">이미 사용 중인 이메일입니다.</p>' : '<p class="hint">바우처와 예약 확인 메일을 받을 주소예요</p>'}</div>

    <div class="field"><label class="label">비밀번호<span class="req">*</span></label>
      <input class="input" type="password" value="••••••••••">
      <div class="row-c mt2" style="gap:12px;flex-wrap:wrap">
        <span class="t-sub success">✓ 8자 이상</span><span class="t-sub success">✓ 영문 포함</span>
        <span class="t-sub success">✓ 숫자 포함</span><span class="t-sub muted">· 특수문자 (권장)</span></div></div>

    <div class="field"><label class="label">비밀번호 확인<span class="req">*</span></label>
      <input class="input" type="password" value="••••••••••"><p class="ok">✓ 비밀번호가 일치해요</p></div>

    <div class="field-row">
      <div class="field"><label class="label">이름<span class="req">*</span></label><input class="input" value="김여행"></div>
      <div class="field"><label class="label">여권 영문명<span class="req">*</span></label><input class="input" value="KIM YEOHAENG">
        <p class="hint">여권과 동일하게 대문자로</p></div>
    </div>

    <div class="hr"></div>
    <label class="check" style="font-weight:600"><input type="checkbox" checked><span>전체 동의</span></label>
    <div style="padding-left:26px">
      <label class="check"><input type="checkbox" checked><span><b>[필수]</b> 이용약관
        <a class="pri strong" href="${link('MY0203')}" style="font-size:13px;margin-left:6px">전문 보기</a></span></label>
      <label class="check"><input type="checkbox" checked><span><b>[필수]</b> 개인정보 수집·이용 동의
        <a class="pri strong" href="${link('MY0203')}" style="font-size:13px;margin-left:6px">전문 보기</a></span></label>
      <label class="check"><input type="checkbox"><span>[선택] 마케팅 정보 수신 동의
        <span class="sub">특가·기획전 소식을 카카오톡·이메일로 받아요</span></span></label>
      <label class="check"><input type="checkbox" checked><span><b>[필수]</b> 만 14세 이상입니다</span></label>
    </div>

    <button class="btn btn-primary btn-block btn-lg mt6" type="button" ${dup ? 'disabled' : `onclick="location.href='${link('MY0301')}'"`}>가입하기</button>
    ${dup ? '<p class="err">다른 이메일을 입력하거나 로그인해주세요.</p>' : ''}
    <p class="center mt4 t-sub">이미 회원이세요? <a class="pri strong" href="${link('MY0101')}">로그인</a></p>
  </div></div></div>

  ${terms ? modalEl('이용약관', `
    <div style="max-height:52vh;overflow:auto;font-size:13px;line-height:1.75;color:var(--muted)">
      <p><b style="color:var(--text)">제1조 (목적)</b><br>이 약관은 ${SITE.name}(이하 "회사")가 제공하는 여행상품 중개 서비스의 이용 조건과 절차, 회사와 회원의 권리·의무를 정합니다.</p>
      <p class="mt3"><b style="color:var(--text)">제2조 (정의)</b><br>"상품"이란 회사가 중개하는 투어·입장권·교통·패스 등을 말합니다. "바우처"란 현지에서 상품 이용 권리를 증명하는 전자문서를 말합니다.</p>
      <p class="mt3"><b style="color:var(--text)">제3조 (회사의 지위)</b><br>회사는 통신판매중개자로서 거래 당사자가 아니며, 상품의 이용과 관련한 이행 책임은 현지 판매자에게 있습니다.</p>
      <p class="mt3"><b style="color:var(--text)">제4조 (예약과 확정)</b><br>결제 완료 시점에 예약 신청이 접수되며, 즉시확정 상품은 결제와 동시에, 그 외 상품은 현지 판매자의 확인 후 확정됩니다.</p>
      <p class="mt3"><b style="color:var(--text)">제5조 (취소와 환불)</b><br>취소·환불은 각 상품에 표시된 규정을 따릅니다. 기준 시각은 상품 이용 도시의 현지 시각입니다.</p>
      <p class="mt3"><b style="color:var(--text)">제6조 (개인정보)</b><br>회사는 예약 이행을 위해 필요한 최소한의 정보를 현지 판매자에게 제공하며, 그 범위는 예약 단계에서 안내합니다.</p>
    </div>
    <div class="hr"></div>
    <label class="check"><input type="checkbox" checked><span><b>[필수]</b> 이용약관에 동의합니다</span></label>
    <label class="check"><input type="checkbox" checked><span><b>[필수]</b> 개인정보 수집·이용에 동의합니다</span></label>
    <label class="check"><input type="checkbox"><span>[선택] 마케팅 정보 수신에 동의합니다</span></label>`,
    `<a class="btn btn-ghost" href="${link('MY0201')}">닫기</a><a class="btn btn-primary" href="${link('MY0201')}">동의하고 닫기</a>`, { lg: true }) : ''}`;

  return {
    body, o: {
      after: '',
      state: dup ? '이메일 중복 — 기존 가입 경로 표시와 로그인 유도' : terms ? '약관 상세 보기 — 전문과 항목별 동의' : '',
    },
  };
}

/* ===== MY03 예약 내역 ===== */
export function MY0301(ctx) {
  const id = ctx.id;
  const doneTab = id === 'MY0302';
  const cancelTab = id === 'MY0303';
  const soon = id === 'MY0304';

  const upcoming = BOOKINGS.filter((b) => b.state === '확정' || b.state === '대기');
  const done = BOOKINGS.filter((b) => b.state === '이용 완료');
  const canceled = BOOKINGS.filter((b) => b.state === '취소');
  const list = doneTab ? done : cancelTab ? canceled : upcoming;

  const bcard = (b, i) => {
    const p = P(b.prod);
    const kind = b.state === '확정' ? 'b-ok' : b.state === '대기' ? 'b-warn' : b.state === '취소' ? 'b-danger' : 'b-mut';
    const noReview = doneTab && i === 0;
    return `<div class="hcard mb3 ${b.state === '취소' ? 'is-off' : ''}">
      ${ph(p.id, 'ph-thumb', '상품')}
      <div class="grow">
        <div class="badges mb1">${badge(b.state, kind)}${b.dday ? badge(b.dday, 'b-acc') : ''}${noReview ? badge('후기 미작성', 'b-acc') : ''}</div>
        <div class="t-card" style="font-size:15px">${esc(p.name)}</div>
        <p class="t-sub mt1">${b.date} · ${b.pax}<br>예약번호 ${b.no} · ${won(b.amt)}</p>
        ${b.refund ? `<p class="t-sub mt1 success">${b.refund}</p>` : ''}
        ${cancelTab ? `<p class="t-sub mt1">취소 사유 — 일정 변경 (여행자 요청)</p>` : ''}
        <div class="btns mt3">
          <a class="btn btn-ghost btn-sm" href="${link('MY0501')}">예약 상세</a>
          ${b.state === '확정' ? `<a class="btn btn-primary btn-sm" href="${link('VC0201')}">바우처 보기</a>
            <a class="btn btn-ghost btn-sm" href="${link('MY0601')}">예약 취소</a>` : ''}
          ${b.state === '대기' ? `<a class="btn btn-ghost btn-sm" href="${link('BK0501')}">확정 대기 상세</a>` : ''}
          ${b.state === '이용 완료' ? `<a class="btn ${noReview ? 'btn-primary' : 'btn-ghost'} btn-sm" href="${link('MY0801')}">후기 쓰기</a>
            <a class="btn btn-ghost btn-sm" href="${link('MY0504')}">영수증 보기</a>
            <a class="btn btn-ghost btn-sm" href="${link('PR0201')}">재예약</a>` : ''}
          ${b.state === '취소' ? `<a class="btn btn-ghost btn-sm" href="${link('MY0504')}">환불 영수증</a>
            <a class="btn btn-ghost btn-sm" href="${link('PR0201')}">다시 예약</a>` : ''}
        </div>
      </div></div>`;
  };

  const body = `${pageHd('예약 내역', '예정된 여행과 지난 여행을 모두 볼 수 있어요')}
  <div class="split">${myNav('MY0301')}<div>
    ${tabs([{ label: '이용 예정', cnt: upcoming.length, go: 'MY0301' }, { label: '이용 완료', cnt: done.length, go: 'MY0302' }, { label: '취소', cnt: canceled.length, go: 'MY0303' }],
    doneTab ? 1 : cancelTab ? 2 : 0)}

    ${soon ? `<div class="box-danger mb4">
      <div class="row-b wrap-row mb3"><div class="row-c">${badge('D-1', 'b-danger')}<b class="t-card" style="font-size:16px">내일 출발이에요</b></div>
        <a class="btn btn-primary btn-sm" href="${link('VC0201')}">바우처 열기</a></div>
      ${kv([
      ['집합 시각', '<b>8월 3일(월) 13:45</b> (현지 시각) · 한국 시각 8월 4일 02:45'],
      ['집합 장소', '배터리파크 11번 부두 — 파란 깃발을 든 가이드'],
      ['픽업', 'Hilton Times Square 로비 · 예상 13:05'],
      ['당일 날씨', '☀ 맑음 24° / 체감 26° · 자외선 강함'],
    ])}
      ${banner('warn', '📵', '<b>바우처를 아직 저장하지 않았어요.</b> 현지에서 인터넷이 안 될 수 있으니 미리 저장해주세요.', {
      cls: 'mt3', right: `<a class="btn btn-ghost btn-sm" href="${link('VC0103')}">이미지로 저장</a>`,
    })}
      <div class="mt3"><b style="font-size:14px">준비물 체크</b>
        <div class="g3 g1-m mt2">${['여권', '바우처 저장', '편한 신발', '겉옷', '자외선 차단제', '소액 현금']
      .map((t) => `<label class="check"><input type="checkbox"><span>${t}</span></label>`).join('')}</div></div>
    </div>` : ''}

    ${cancelTab ? banner('pri', '💳', '<b>환불 진행 상태</b>는 카드사 처리 시점에 따라 1~5영업일 걸릴 수 있어요.', { cls: 'mb4' }) : ''}
    ${doneTab ? `<div class="row-b wrap-row mb4"><span class="t-sub">후기를 쓰면 상품당 <b>500P</b>를 드려요</span>
      <select class="select" style="width:auto"><option>최근 6개월</option><option>최근 1년</option><option>전체</option></select></div>` : ''}

    ${list.map(bcard).join('')}

    ${doneTab ? `<a class="btn btn-ghost btn-block mt4" href="${link('MY1101')}">내 후기 관리로 이동</a>` : ''}
    <div class="pager"><span class="on">1</span><span class="off">2</span><span class="off">›</span></div>
  </div></div>`;

  return {
    body, o: {
      logged: true, noti: 3,
      state: { MY0302: '이용 완료 탭 — 후기 미작성 배지와 영수증', MY0303: '취소 탭 — 취소 사유와 환불 진행 상태', MY0304: '출발 임박 알림 — D-1 카드 상단 고정' }[id] || '',
    },
  };
}

/* ===== MY04 예약 내역 없음 ===== */
export function MY0401(ctx) {
  const guest = ctx.id === 'MY0402';
  const body = `${pageHd('예약 내역')}
  <div class="split">${myNav('MY0301')}<div>
    ${tabs([{ label: '이용 예정', cnt: 0 }, { label: '이용 완료', cnt: 0 }, { label: '취소', cnt: 0 }], 0)}
    <div class="card">${empty('🧳', '아직 예약한 여행이 없어요',
    '가고 싶은 도시를 골라 첫 여행을 계획해보세요.',
    `<a class="btn btn-primary btn-lg" href="${link('HO0101')}">인기 여행지 둘러보기</a>`)}</div>

    ${banner('pri', '🎁', '<b>첫 예약에 쓸 수 있는 10% 쿠폰이 있어요.</b> 최소 결제 30,000원 · 유효기간 8월 31일까지', {
      cls: 'mt4', right: `<a class="btn btn-ghost" href="${link('MY0901')}">쿠폰함 보기</a>`,
    })}

    ${guest ? card('비회원으로 예약한 내역이 있나요?', `
      <p>비회원으로 예약한 건은 계정에 자동으로 연결되지 않아요. 예약번호로 불러오면 이 목록에서 함께 관리할 수 있어요.</p>
      <div class="field-row mt4">
        <div class="field"><label class="label">예약번호</label><input class="input" placeholder="TN2607-284193"></div>
        <div class="field"><label class="label">여권 영문명</label><input class="input" placeholder="HONG GILDONG"></div>
      </div>
      <div class="btns"><button class="btn btn-primary" type="button" data-toast="예약을 계정에 연결했어요" data-toast-kind="ok">계정에 연결하기</button>
        <a class="btn btn-ghost" href="${link('MY0103')}">조회 화면으로</a></div>
      <p class="hint">연결하면 바우처·후기·환불 진행 상태를 한 곳에서 볼 수 있어요.</p>`, { cls: 'mt6' })
      : `<div class="box mt6 row-b wrap-row"><div><b>비회원으로 예약하셨나요?</b>
        <p class="t-sub mt1">예약번호로 불러와 계정에 연결할 수 있어요.</p></div>
        <a class="btn btn-ghost" href="${link('MY0402')}">비회원 예약 안내</a></div>`}

    ${sec('인기 여행지', `<div class="g6 mt6">${['뉴욕', 'LA', '칸쿤', '파리', '로마', '방콕'].map((c) => `
      <a href="${link('HO0201')}" class="center">${ph(c, 'ph-circle', '여행지', '400×400')}<div class="t-card mt2" style="font-size:15px">${c}</div></a>`).join('')}</div>`)}
  </div></div>`;

  return { body, o: { logged: true, state: guest ? '비회원 예약 안내 — 예약번호로 계정 연결' : '' } };
}

/* ===== MY05 예약 상세 ===== */
export function MY0501(ctx) {
  const id = ctx.id;
  const editPax = id === 'MY0502';
  const locked = id === 'MY0503';
  const receipt = id === 'MY0504';
  const b = BOOKINGS[0];
  const p = P(b.prod);

  const body = `${pageHd('예약 상세', `예약번호 ${b.no}`, `<div class="row-c">${badge(b.state, 'b-ok')}
    <button class="btn btn-ghost btn-sm" type="button" data-toast="예약번호를 복사했어요">번호 복사</button></div>`)}
  <div class="split">${myNav('MY0301')}<div>

    ${locked ? banner('warn', '🔒', `<b>이 상품은 날짜·인원 변경이 안 돼요.</b> 현지 운영사가 회차별로 좌석을 확정하는 상품입니다.
      <div class="mt2">변경이 필요하면 <b>취소 후 재예약</b>해야 하며, 현재 시점 취소 수수료는 <b>30%</b> 입니다.</div>
      <div class="btns mt3"><a class="btn btn-ghost btn-sm" href="${link('MY0601')}">수수료 미리보기</a>
        <a class="btn btn-ghost btn-sm" href="${link('CS0201')}">문의하기</a></div>`, { cls: 'mb4' }) : ''}

    ${card('상품 정보', `${prodSummary(p, { date: b.date + ' · ' + p.dur, pax: b.pax })}
      <div class="mt4">${kv([
    ['이용 일시', '<b>2026년 8월 3일(월) 14:00</b> (현지 시각)'],
    ['소요시간', p.dur],
    ['집합', '13:45 · 배터리파크 11번 부두'],
    ['옵션', '호텔 픽업 (Hilton Times Square · 예상 13:05) · 일반석'],
  ])}</div>`, { cls: 'mb4' })}

    ${card('여행자 명단', editPax ? `
      ${banner('pri', 'ℹ', '<b>출발 3일 전(8월 1일)까지</b> 수정할 수 있어요. 영문명 정정은 현지 승인이 필요할 수 있습니다.', { cls: 'mb4' })}
      ${[['KIM YEOHAENG', '1990-03-11', '성인'], ['LEE SORA', '1992-07-02', '성인'], ['KIM HANEUL', '2016-04-18', '아동']]
      .map(([n, d, t], i) => `<div class="field-row"><div class="field"><label class="label">여행자 ${i + 1} 영문명 <span class="muted" style="font-weight:400">(${t})</span></label>
        <input class="input" value="${n}"></div>
        <div class="field"><label class="label">생년월일</label><input class="input" value="${d}"></div></div>`).join('')}
      <div class="btns"><button class="btn btn-primary" type="button" data-toast="여행자 정보를 저장했어요. 현지 승인 후 바우처가 갱신됩니다" data-toast-kind="ok">저장</button>
        <a class="btn btn-ghost" href="${link('MY0501')}">취소</a></div>
      <div class="hr"></div>
      <b style="font-size:14px">변경 이력</b>
      ${U.table([{ t: '변경 시각', w: '32%' }, '항목', '내용'], [
        ['2026.07.26 11:20', '여행자 1 영문명', 'HONG GILDON → KIM YEOHAENG (고객센터 처리)'],
      ])}`
      : `${U.table([{ t: '구분', w: '20%' }, '여권 영문명', '생년월일', '요금'], [
        ['성인 1 (대표)', 'KIM YEOHAENG', '1990-03-11', won(68000)],
        ['성인 2', 'LEE SORA', '1992-07-02', won(68000)],
        ['아동 1', 'KIM HANEUL', '2016-04-18', won(48000)],
      ])}
      <div class="btns mt4"><a class="btn btn-ghost btn-sm" href="${link('MY0502')}">여행자 정보 수정</a>
        <a class="btn btn-ghost btn-sm" href="${link('MY0503')}">변경 불가 항목 확인</a></div>`, { cls: 'mb4' })}

    ${card('결제 내역', receipt ? `
      <div class="box" style="background:var(--surface);border:1px solid var(--border)">
        <div class="center mb4"><div class="logo" style="justify-content:center"><span class="mark">${SITE.mark}</span>${SITE.name}</div>
          <div class="t-sec mt2">결제 영수증</div>
          <p class="t-sub">발행일 2026년 7월 30일</p></div>
        ${kv([
      ['예약번호', b.no],
      ['상품', esc(p.name)],
      ['이용일', '2026.08.03 14:00 (현지 시각)'],
      ['결제 수단', b.pay],
      ['승인번호', '30281947'],
      ['승인일시', '2026.07.30 10:22'],
      ['카드사', '신한카드 (해외 승인)'],
    ])}
        <div class="hr"></div>
        ${sumRows([
      ['상품 금액', won(184000)],
      ['쿠폰 할인 (15%)', '-27,600원', 'minus'],
      ['포인트 사용', '-3,000원', 'minus'],
      ['부가세', '포함'],
    ], ['결제 금액', won(153400)])}
        <p class="t-sub mt3">현지 통화 기준 $111.16 (1 USD = 1,380원 · 2026.07.30 09:00 기준)<br>
          최종 카드사 청구액은 카드사 적용 환율에 따라 달라질 수 있습니다.</p>
      </div>
      <div class="btns mt4"><button class="btn btn-primary" type="button" data-toast="PDF로 저장했어요" data-toast-kind="ok">PDF 저장</button>
        <button class="btn btn-ghost" type="button" data-toast="이메일로 발송했어요" data-toast-kind="ok">이메일 발송</button>
        <button class="btn btn-ghost" type="button" data-toast="인쇄 창을 열었어요">인쇄</button></div>`
      : `${sumRows([
        ['상품 금액', won(184000)],
        ['쿠폰 할인 (15%)', '-27,600원', 'minus'],
        ['포인트 사용', '-3,000원', 'minus'],
      ], ['결제 금액', won(153400)])}
      <p class="t-sub mt2">${b.pay} · 2026.07.30 10:22 승인</p>
      <div class="btns mt4"><a class="btn btn-ghost btn-sm" href="${link('MY0504')}">영수증 보기</a></div>`, { cls: 'mb4' })}

    ${card('미팅 장소', `${phMap('ph-map', [{ x: 44, y: 48, n: '📍', name: '배터리파크 11번 부두', on: true }], '배터리파크 11번 부두')}
      <p class="mt3"><b>Battery Park, Pier 11, New York, NY 10004</b></p>
      <p class="t-sub">현지 연락처 +1 917-000-0000 · 한국어 긴급 회선 +82 2-000-0000</p>
      <div class="btns mt3"><a class="btn btn-ghost btn-sm" href="${link('VC0204')}">길찾기</a>
        <a class="btn btn-primary btn-sm" href="${link('VC0201')}">바우처 보기</a></div>`, { cls: 'mb4' })}

    ${card('취소 · 환불 규정', `${banner(locked ? 'warn' : 'pri', '💡', locked
      ? '<b>이 예약은 날짜 변경이 불가하며,</b> 지금 취소하면 <b>70% 환불</b>됩니다.'
      : '<b>지금 취소하면 70% 환불</b>돼요 (128,800원). 8월 1일부터는 50% 구간으로 바뀝니다.', { cls: 'mb4' })}
      ${U.table([{ t: '취소 시점', w: '40%' }, '환불율', ''], REFUND_RULES.tour.map((r) => ({
        cls: r.when.includes('7~4') ? 'is-now' : '',
        cells: [r.when, `<b>${r.rate}</b>`, r.when.includes('7~4') ? '<span class="badge b-warn">현재 위치</span>' : ''],
      })))}
      <p class="t-sub mt3">기준 시각은 현지 시각(EDT)입니다. <a class="pri strong" href="${link('CS0501')}">전체 규정 보기</a></p>`, { cls: 'mb6' })}

    <div class="btns" style="justify-content:center">
      ${locked ? `<a class="btn btn-danger btn-lg" href="${link('MY0701')}">취소 가능 여부 확인</a>` : `<a class="btn btn-danger btn-lg" href="${link('MY0601')}">예약 취소</a>`}
      <a class="btn btn-ghost btn-lg" href="${link('CS0201')}">문의하기</a>
      <a class="btn btn-primary btn-lg" href="${link('VC0201')}">바우처 보기</a></div>
  </div></div>`;

  return {
    body, o: {
      logged: true, noti: 3,
      state: { MY0502: '여행자 정보 수정 — 수정 기한과 변경 이력', MY0503: '변경 불가 항목 — 취소 후 재예약 경로와 수수료 미리보기', MY0504: '영수증 보기 — 승인번호·현지 통화 병기와 PDF 저장' }[id] || '',
    },
  };
}

/* ===== MY06 예약 취소 신청 ===== */
export function MY0601(ctx) {
  const id = ctx.id;
  const free = id === 'MY0602';
  const partial = id === 'MY0603';
  const confirm = id === 'MY0604';
  const b = BOOKINGS[0];
  const p = P(b.prod);

  const paid = 184000;
  const fee = free ? 0 : partial ? 20400 : 55200;
  const refund = paid - fee - (partial ? 116000 : 0);

  const body = `${pageHd('예약 취소 신청', `${b.no} · ${esc(p.name)}`)}
  <div class="split">${myNav('MY0301')}<div>

    ${card('취소할 예약', prodSummary(p, {
    date: b.date, pax: partial ? '성인 2 · 아동 1 → <b>성인 1 · 아동 1</b>' : b.pax,
    state: b.state, stateCls: 'b-ok',
    right: `<div class="price">${won(paid)}</div><div class="t-sub">결제 금액</div>`,
  }), { cls: 'mb4' })}

    ${free ? banner('ok', '⏱', `<b>지금은 무료 취소 기간이에요.</b> 남은 시간 <b class="danger">3일 6시간 12분</b>
      <div class="t-sub mt2">무료 취소 기한 — 2026년 8월 1일 23:59 <b>(현지 시각 EDT)</b> · 한국 시각 8월 2일 12:59</div>`, { cls: 'mb4' }) : ''}

    ${partial ? banner('pri', 'ℹ', `<b>일부 인원만 취소하고 있어요.</b> 남은 인원 기준으로 금액을 다시 계산했습니다.`, { cls: 'mb4' }) : ''}

    ${partial ? card('취소할 인원 선택', `
      ${[['성인 1 (대표) · KIM YEOHAENG', false, '취소 불가 — 대표 예약자'], ['성인 2 · LEE SORA', true, ''], ['아동 1 · KIM HANEUL', false, '']]
      .map(([n, checked, note]) => `<label class="check"><input type="checkbox" ${checked ? 'checked' : ''} ${note ? 'disabled' : ''}>
        <span>${n}${note ? `<span class="sub">${note}</span>` : ''}</span></label>`).join('')}
      ${banner('warn', '⚠', `<b>최소 출발 인원에 영향이 있어요.</b> 이 회차의 최소 출발 인원은 <b>2명</b> 이고, 취소 후 남는 인원은 <b>2명</b> 입니다. 아직 출발 조건은 유지돼요.`, { cls: 'mt3' })}`, { cls: 'mb4' }) : ''}

    ${card('환불 규정', `${U.table([{ t: '취소 시점', w: '34%' }, '환불율', '취소 수수료', ''],
    REFUND_RULES.tour.map((r) => {
      const isNow = free ? r.when.includes('8일') : r.when.includes('7~4');
      return { cls: isNow ? 'is-now' : '', cells: [r.when, `<b>${r.rate}</b>`, r.fee, isNow ? '<span class="badge b-warn">지금 여기</span>' : ''] };
    }))}
      <p class="t-sub mt3">기준 시각은 현지 시각(EDT)이에요. 한국 시각으로는 13시간 차이가 납니다.</p>`, { cls: 'mb4' })}

    ${card('환불 예정 금액', `${sumRows([
      ['결제 금액', won(paid)],
      ...(partial ? [['취소 대상 금액 (성인 1명)', won(68000)], ['유지되는 금액', won(116000)]] : []),
      ['취소 수수료' + (free ? ' (무료 취소)' : ' (30%)'), fee ? '-' + won(fee) : '0원', fee ? 'minus' : ''],
    ], ['실제 환불 금액', won(refund)])}
      ${free ? '<p class="ok mt2">무료 취소 기간이라 전액 환불돼요.</p>' : ''}
      <p class="t-sub mt3">환불 수단 — <b>${b.pay}</b> 로 <b>3~5영업일</b> 안에 환불됩니다. 카드 취소는 카드사 처리 기간이 포함된 일정이에요.</p>`, { cls: 'mb4' })}

    ${card('취소 사유', `<div class="radio-list">
      ${['일정이 변경되었어요', '다른 상품을 예약했어요', '단순히 마음이 바뀌었어요', '현지 사정·기상 문제예요', '기타 (직접 입력)']
      .map((t, i) => `<label class="radio${i === 0 ? ' on' : ''}" data-group="cr"><input type="radio" name="cr" ${i === 0 ? 'checked' : ''}><span>${t}</span></label>`).join('')}
    </div>
    <div class="field mt4"><label class="label">추가로 알려주실 내용 (선택)</label>
      <textarea class="textarea" style="min-height:80px" placeholder="서비스 개선에 참고할게요"></textarea></div>`, { cls: 'mb6' })}

    <div class="btns" style="justify-content:center">
      <button class="btn btn-danger btn-lg" type="button" data-modal="m-cancel">${partial ? '선택 인원 취소 신청' : free ? '무료 취소 진행' : '취소 신청하기'}</button>
      <a class="btn btn-ghost btn-lg" href="${link('MY0501')}">예약 유지하기</a></div>
    <p class="t-sub center mt4">취소 후에는 되돌릴 수 없어요. 같은 조건의 좌석이 남아 있지 않을 수 있습니다.</p>

    ${modalTpl('m-cancel', '정말 취소하시겠어요?', `
      ${sumRows([['결제 금액', won(paid)], ['취소 수수료', fee ? '-' + won(fee) : '0원', fee ? 'minus' : '']], ['환불 예정 금액', won(refund)])}
      <div class="box-danger mt4"><b>바우처가 즉시 무효가 돼요.</b>
        <p class="t-sub mt1">취소하면 현지에서 이용할 수 없고, 같은 조건으로 다시 예약해야 합니다.</p></div>
      <p class="t-sub mt3">${free ? '지금은 무료 취소 기간이라 전액 환불돼요.' : '8월 1일부터는 50% 구간으로 바뀌어 환불액이 더 줄어듭니다.'}</p>`,
    `<button class="btn btn-ghost" type="button" data-dismiss>예약 유지</button>
       <button class="btn btn-danger" type="button" data-dismiss>취소 확정</button>`, { lg: true })}
  </div></div>`;

  return {
    body, o: {
      logged: true,
      after: confirm ? modalEl('정말 취소하시겠어요?', `
        ${sumRows([['결제 금액', won(paid)], ['취소 수수료 (30%)', '-' + won(55200), 'minus']], ['환불 예정 금액', won(128800)])}
        <div class="box-danger mt4"><b>바우처가 즉시 무효가 돼요.</b>
          <p class="t-sub mt1">취소하면 현지에서 이용할 수 없고, 같은 조건으로 다시 예약해야 합니다.</p></div>
        <p class="t-sub mt3">8월 1일부터는 50% 구간으로 바뀌어 환불액이 더 줄어듭니다. 그래도 취소하시겠어요?</p>`,
        `<button class="btn btn-ghost" type="button" data-dismiss>예약 유지</button>
         <button class="btn btn-danger" type="button" data-dismiss>취소 확정</button>`, { lg: true }) : '',
      state: { MY0602: '무료 취소 기한 내 — 잔여 시간 카운트다운과 전액 환불', MY0603: '부분 취소 — 인원 일부 선택과 금액 재계산', MY0604: '취소 확인 모달 — 금액 재확인과 바우처 무효 고지' }[id] || '',
    },
  };
}

/* ===== MY07 취소 불가 안내 ===== */
export function MY0701(ctx) {
  const req = ctx.id === 'MY0702';
  const p = P('P02');

  const body = `${pageHd('취소 안내', 'TN2607-284170 · 3대 전망대 통합 입장권')}
  <div class="split">${myNav('MY0301')}<div>
    <div class="card mb4"><div class="card-bd center" style="padding:40px 20px">
      <div style="font-size:48px;color:var(--warning)">ℹ</div>
      <h2 class="t-sec mt3">이 예약은 취소가 어려워요</h2>
      <p class="t-sub mt2">이용일 전일까지만 취소할 수 있는 상품이에요. 도움을 드리지 못해 죄송합니다.</p>
    </div></div>

    ${card('', kv([
    ['상품', esc(p.name)],
    ['이용일', '2026년 8월 5일(수) 자유 이용'],
    ['취소 가능 기한', '<b>2026년 8월 4일 23:59 (현지 시각)</b> — 이미 지났어요'],
    ['현재 상태', '<span class="badge b-danger">취소 불가</span> · 결제 금액 384,000원'],
  ]), { cls: 'mb4' })}

    ${card('취소 · 환불 규정 원문', `<div class="acc-item on">
      <button class="acc-q" type="button">입장권 유형 환불 규정 전문<span class="mk">＋</span></button>
      <div class="acc-a">
        ${U.table([{ t: '취소 시점', w: '40%' }, '환불율', '수수료'], REFUND_RULES.ticket.map((r) => ({
    cls: r.when.includes('이용 후') ? 'is-now' : '', cells: [r.when, `<b>${r.rate}</b>`, r.fee],
  })))}
        <p class="mt3">입장권·통합권은 발권 시점에 현지 명소로 좌석이 전달되어, 이용일 당일 이후에는 취소·환불이 불가합니다. 미사용분에 대한 부분 환불도 제공되지 않습니다. (약관 제5조 2항)</p>
      </div></div>`, { cls: 'mb4' })}

    ${req ? card('예외 사유 요청', `
      ${banner('pri', 'ℹ', '<b>천재지변·질병·현지 사정</b>이라면 증빙을 확인해 도와드릴 수 있어요. 현지 업체 확인이 필요해 처리에 시간이 걸립니다.', { cls: 'mb4' })}
      <div class="field"><label class="label">사유 선택<span class="req">*</span></label>
        <div class="radio-list">
          ${[['기상 악화 · 천재지변', '현지 기상 특보, 자연재해 등'], ['질병 · 부상', '진단서 또는 소견서 필요'],
      ['현지 사정 (파업·휴관)', '운영 중단 공지 캡처 등'], ['항공편 결항 · 지연', '항공사 확인서 필요']]
        .map(([t, s], i) => `<label class="radio${i === 0 ? ' on' : ''}" data-group="ex"><input type="radio" name="ex" ${i === 0 ? 'checked' : ''}>
          <span><b>${t}</b><span class="sub">${s}</span></span></label>`).join('')}
        </div></div>
      <div class="field"><label class="label">상세 설명<span class="req">*</span></label>
        <textarea class="textarea" placeholder="언제, 어떤 일이 있었는지 구체적으로 적어주세요"></textarea></div>
      <div class="field"><label class="label">증빙 파일 첨부<span class="req">*</span></label>
        <div class="box center" style="border-style:dashed"><p class="t-sub">진단서·확인서·공지 캡처 등 (이미지·PDF · 최대 3개 · 10MB)</p>
          <button class="btn btn-ghost btn-sm mt3" type="button" data-toast="파일 선택 창을 열었어요">파일 선택</button></div></div>
      ${card('처리 절차', `<div class="steps">
        ${[['접수', '요청과 증빙을 확인합니다 (1영업일)'], ['현지 확인', '현지 운영사에 예외 처리를 요청합니다 (2~5영업일)'], ['결과 안내', '승인 여부와 환불 금액을 알려드립니다']]
        .map(([t, d], i) => `<div class="step"><div class="n">${i + 1}</div><div class="t-card" style="font-size:15px">${t}</div><p class="t-sub mt1">${d}</p></div>`).join('')}</div>
        <p class="hint">현지 운영사가 거절하면 규정대로 환불되지 않습니다. 결과는 문의 내역에서 확인할 수 있어요.</p>`, { cls: 'mt4' })}
      <div class="btns mt6"><button class="btn btn-primary btn-lg" type="button" onclick="location.href='${link('CS0301')}'">예외 요청 접수</button>
        <a class="btn btn-ghost btn-lg" href="${link('MY0701')}">취소</a></div>`, { cls: 'mb4' })
      : banner('pri', '🤝', `<b>천재지변이나 현지 사정이라면 도와드릴 수 있어요.</b> 증빙을 첨부해 예외 요청을 접수해주세요.`, {
        cls: 'mb4', right: `<a class="btn btn-primary" href="${link('MY0702')}">예외 사유 요청</a>`,
      })}

    <div class="btns" style="justify-content:center">
      <a class="btn btn-primary btn-lg" href="${link('CS0201')}">고객센터 문의</a>
      <a class="btn btn-ghost btn-lg" href="${link('MY0501')}">예약 상세로</a></div>
  </div></div>`;

  return { body, o: { logged: true, state: req ? '예외 사유 요청 — 증빙 첨부와 처리 절차' : '' } };
}

/* ===== MY08 후기 작성 ===== */
export function MY0801(ctx) {
  const id = ctx.id;
  const short = id === 'MY0802';
  const upFail = id === 'MY0803';
  const p = P('P10');

  const body = `${pageHd('후기 작성', '다녀온 여행을 기록하면 다음 여행자에게 큰 도움이 돼요')}
  <div class="split">${myNav('MY1101')}<div>
    ${card('', prodSummary(p, { date: '2026.06.18(목) 10:00 이용', pax: '성인 2' }), { cls: 'mb4' })}

    <div class="card"><div class="card-bd">
      <div class="field center"><label class="label" style="text-align:center">전체 만족도<span class="req">*</span></label>
        <div style="font-size:36px;color:var(--accent);letter-spacing:4px">★★★★★</div>
        <p class="t-sub mt2">아주 좋았어요 (5.0)</p></div>

      <div class="hr"></div>
      <div class="field"><label class="label">세부 평가</label>
        ${[['가이드', 5], ['일정 구성', 4], ['가격 대비 만족도', 5]].map(([k, v]) => `
          <div class="row-b" style="padding:8px 0"><span>${k}</span>
            <span style="color:var(--accent);font-size:18px;letter-spacing:2px">${'★'.repeat(v)}${'☆'.repeat(5 - v)}</span></div>`).join('')}</div>

      <div class="field"><label class="label">어떤 점이 좋았나요?<span class="req">*</span></label>
        <textarea class="textarea ${short ? 'is-err' : ''}" placeholder="집합 장소, 가이드 설명, 코스 구성처럼 구체적인 이야기가 도움이 돼요">${short ? '좋았어요' : '우선입장이라 줄을 아예 안 섰어요. 한국어 가이드 설명이 알차서 그림 하나하나 기억에 남습니다. 아이와 함께 갔는데도 지루해하지 않았어요.'}</textarea>
        <div class="row-b mt2">
          <span class="${short ? 'err' : 't-sub'}" style="margin:0">${short ? '최소 20자 이상 써주세요 — 현재 4자' : '최소 20자 이상 · 현재 82자'}</span>
          <span class="t-sub">${short ? '4' : '82'} / 1000</span></div>
        ${short ? `<div class="box mt3"><b style="font-size:14px">이렇게 써보세요</b>
          <p class="t-sub mt2">"집합 장소를 찾기 쉬웠고, 가이드님이 아이 눈높이에 맞춰 설명해주셨어요. 오후 회차라 사진도 잘 나왔습니다."</p></div>` : ''}</div>

      <div class="field"><label class="label">사진 첨부 <span class="muted" style="font-weight:400">(최대 5장)</span></label>
        ${upFail ? `
        <div class="row wrap-row mb3" style="gap:8px">
          ${[1, 2].map((i) => `<div style="position:relative;width:96px">${ph('rv' + i, 'ph-11', '후기 사진', '800×800')}
            <button class="heart" type="button" style="top:4px;right:4px;width:24px;height:24px;line-height:24px;font-size:12px">✕</button></div>`).join('')}
          <div style="width:96px;aspect-ratio:1/1;border:1px dashed var(--danger);border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--danger);font-size:12px;text-align:center">업로드<br>실패</div>
        </div>
        ${banner('danger', '⚠', `<b>사진 2장을 올리지 못했어요.</b>
          <div class="mt2"><b>IMG_4821.heic</b> — 지원하지 않는 형식이에요 (JPG·PNG만 가능)<br>
          <b>IMG_4822.jpg</b> — 용량 초과 (12.4MB / 최대 10MB)</div>
          <div class="btns mt3"><button class="btn btn-primary btn-sm" type="button" data-toast="자동으로 리사이즈했어요 (12.4MB → 2.1MB)">자동 리사이즈해서 재시도</button>
            <button class="btn btn-ghost btn-sm" type="button" data-toast="실패한 파일만 다시 시도합니다">실패한 파일만 재시도</button></div>`)}`
      : `<div class="row wrap-row" style="gap:8px">
          ${[1, 2, 3].map((i) => `<div style="position:relative;width:96px">${ph('rv' + i, 'ph-11', '후기 사진', '800×800')}
            <button class="heart" type="button" style="top:4px;right:4px;width:24px;height:24px;line-height:24px;font-size:12px">✕</button></div>`).join('')}
          <button type="button" style="width:96px;aspect-ratio:1/1;border:1px dashed var(--border);border-radius:12px;background:var(--bg);color:var(--muted);font-size:24px;cursor:pointer" data-toast="사진을 더 올려요">＋</button>
        </div>
        <p class="hint">JPG·PNG · 장당 10MB 이하 · 3 / 5장 첨부됨</p>`}</div>

      <div class="field"><label class="label">동행 유형</label>
        <div class="chips">${['혼자', '친구', '연인', '가족'].map((t, i) => U.chip(t, i === 3)).join('')}</div></div>

      ${banner('acc' === 'acc' ? 'ok' : 'ok', '🎁', '<b>사진 후기를 남기면 500포인트를 드려요.</b> 글만 남기면 200포인트가 지급됩니다.', { cls: 'mb4' })}

      <div class="btns"><button class="btn btn-primary btn-lg ${short ? 'is-off' : ''}" type="button" ${short ? 'disabled' : `onclick="location.href='${link('MY1101')}'"`}>등록하기</button>
        <button class="btn btn-ghost btn-lg" type="button" data-toast="임시 저장했어요" data-toast-kind="ok">임시 저장</button>
        <a class="btn btn-ghost btn-lg" href="${link('MY0301')}">예약 내역으로</a></div>
      ${short ? '<p class="err">20자 이상 입력하면 등록할 수 있어요. 작성 중인 내용은 임시 저장됩니다.</p>' : ''}
    </div></div>
  </div></div>`;

  return {
    body, o: {
      logged: true,
      state: short ? '글자수 미달 — 등록 비활성과 작성 예시' : upFail ? '사진 업로드 실패 — 사유 표시와 자동 리사이즈 제안' : '',
    },
  };
}

/* ===== MY09 쿠폰함 ===== */
export function MY0901(ctx) {
  const id = ctx.id;
  const soon = id === 'MY0902';
  const codeFail = id === 'MY0903';

  const ccard = (c, pin) => `<div class="coupon mb3 ${c.state === 'soon' || pin ? 'soon' : ''} ${c.state === 'expired' ? 'is-off' : ''}">
    <div class="amt"><div class="v">${c.v}</div><div class="t-sub">할인</div></div>
    <div class="bd row-b wrap-row">
      <div><div class="t-card" style="font-size:16px">${c.name}</div>
        <p class="t-sub mt1">${c.min} · ${c.target}</p>
        <p class="t-sub">유효기간 ${c.until}까지
          ${c.dday > 0 && c.dday <= 7 ? `<b class="danger">D-${c.dday}</b>` : c.dday <= 0 ? '<span class="muted">(만료)</span>' : `<span class="muted">(D-${c.dday})</span>`}</p></div>
      <div class="btns">
        ${c.state === 'expired' ? badge('만료', 'b-mut')
      : `<a class="btn ${c.dday <= 7 ? 'btn-primary' : 'btn-ghost'} btn-sm" href="${link('PR0101')}">사용 가능 상품</a>`}
      </div></div></div>`;

  const usable = COUPONS.filter((c) => c.state !== 'expired');
  const body = `${pageHd('쿠폰함', '보유 쿠폰 3장 · 사용 가능 포인트 3,500P',
    `<div class="btns"><a class="btn btn-ghost" href="${link('MY1301')}">포인트 내역</a></div>`)}
  <div class="split">${myNav('MY0901')}<div>

    <div class="card mb6"><div class="card-bd">
      <label class="label">쿠폰 코드 등록</label>
      <div class="row"><input class="input ${codeFail ? 'is-err' : ''}" value="${codeFail ? 'summer2026' : ''}" placeholder="예: SUMMER2026">
        <button class="btn btn-primary" type="button" style="flex:none" data-toast="쿠폰을 등록했어요. 결제할 때 고르실 수 있어요" data-toast-kind="ok">등록</button></div>
      ${codeFail ? `<p class="err">등록할 수 없는 코드예요 — <b>이미 사용된 쿠폰</b>입니다. (2026.07.12 사용)</p>
        <div class="box-warn mt3"><b>이런 이유일 수 있어요</b>
          <ul class="mt2">${['존재하지 않는 코드 — 대소문자와 숫자 0/O 를 확인해주세요',
      '이미 사용된 코드 — 계정당 1회만 등록할 수 있어요',
      '기간이 만료된 코드 — 배포 종료일을 확인해주세요']
        .map((t) => `<li class="t-sub" style="padding:2px 0">· ${t}</li>`).join('')}</ul>
          <div class="btns mt3"><button class="btn btn-ghost btn-sm" type="button" data-toast="입력창을 비웠어요">다시 입력</button>
            <a class="btn btn-ghost btn-sm" href="${link('CS0201')}">문의하기</a></div></div>`
      : '<p class="hint">이벤트나 제휴처에서 받은 코드를 입력하면 쿠폰함에 담겨요. 코드는 대소문자를 구분하지 않습니다.</p>'}
    </div></div>

    ${tabs([{ label: '사용 가능', cnt: 3 }, { label: '사용 완료', cnt: 5 }, { label: '만료', cnt: 2 }], 0)}

    ${soon ? `${banner('danger', '⏱', `<b>만료가 임박한 쿠폰이 1장 있어요.</b> 7일 이내 만료 쿠폰을 위로 올려드렸어요.`, {
      cls: 'mb4', right: `<button class="btn btn-ghost btn-sm" type="button" data-toast="만료 전에 알려드릴게요" data-toast-kind="ok">만료 전 알림 신청</button>`,
    })}
      ${ccard(COUPONS[1], true)}
      <div class="hr"></div>` : ''}

    ${(soon ? usable.filter((c) => c.state !== 'soon') : usable).map((c) => ccard(c)).join('')}
    ${COUPONS.filter((c) => c.state === 'expired').map((c) => ccard(c)).join('')}

    ${banner('pri', '💡', '쿠폰은 <b>1건의 예약에 1장만</b> 사용할 수 있고, 포인트와는 함께 쓸 수 있어요. 취소하면 유효기간이 남은 쿠폰은 복원됩니다.', { cls: 'mt4' })}
  </div></div>`;

  return {
    body, o: {
      logged: true,
      state: soon ? '만료 임박 강조 — 상단 고정과 D-day 붉은 표시' : codeFail ? '코드 등록 실패 — 사유별 문구와 재입력' : '',
    },
  };
}

/* ===== MY10 내 여정 ===== */
export function MY1001(ctx) {
  const id = ctx.id;
  const overlap = id === 'MY1002';
  const share = id === 'MY1003';

  const dayBlock = (d, di) => `<div class="card mb4"><div class="card-hd">
      <div><h3 class="t-card">${d.label}</h3><p class="t-sub mt1">${d.local}</p></div>
      <span class="badge b-line">${d.wx}</span></div>
    <div class="card-bd">
      ${d.items.map((it) => {
    const isOverlap = overlap && it.overlap;
    if (it.ghost) {
      return `<div class="itin"><div class="ax">${it.t}</div><div>
          <div class="blk ghost"><b>${it.name}</b><p class="t-sub mt1">${it.sug}</p>
          <a class="btn btn-ghost btn-sm mt2" href="${link('PR0201')}">상품 보기</a></div></div></div>`;
    }
    return `<div class="itin"><div class="ax">${it.t}<br><span style="font-size:11px">${it.dur}</span></div><div>
        ${it.gap ? `<div class="gap">⚠ ${it.gap}</div>` : ''}
        <div class="blk ${isOverlap ? 'warn' : ''}">
          <div class="row-b wrap-row"><b>${esc(it.name)}</b>${badge(it.state, it.state === '확정' ? 'b-ok' : 'b-warn')}</div>
          <p class="t-sub mt1">${it.meet} · ${it.pax}</p>
          ${isOverlap ? `<p class="danger strong mt2" style="font-size:13px">일정이 겹쳐요 — ${it.overlap}</p>` : ''}
          <div class="btns mt2"><a class="btn btn-ghost btn-sm" href="${link('VC0201')}">바우처 보기</a>
            <a class="btn btn-ghost btn-sm" href="${link('MY0501')}">예약 상세</a>
            ${isOverlap ? `<a class="btn btn-danger btn-sm" href="${link('MY0601')}">일정 변경·취소</a>` : ''}</div>
        </div></div></div>`;
  }).join('')}
    </div></div>`;

  const body = `${pageHd('내 여정', '예약한 상품을 날짜순 일정표로 보여드려요')}
  <div class="split">${myNav('MY1001')}<div>

    <div class="card mb6"><div class="card-bd"><div class="row-b wrap-row" style="gap:20px">
      <div class="row-c" style="gap:16px">${ph('뉴욕trip', 'ph-sq')}
        <div><div class="badges mb1">${badge(TRIP.dday, 'b-acc')}${badge(`예약 ${TRIP.cnt}건`, 'b-line')}</div>
          <div class="t-sec">${TRIP.city} 여행</div>
          <p class="t-sub">${TRIP.period} · 5일</p></div></div>
      <div class="btns">
        <a class="btn ${share ? 'btn-primary' : 'btn-ghost'}" href="${link('MY1003')}">동행자에게 공유</a>
        <a class="btn btn-ghost" href="${link('MY1003')}">일정표 저장</a></div>
    </div></div></div>

    ${overlap ? banner('danger', '⚠', `<b>8월 5일 일정이 겹쳐요.</b> 우드베리 아웃렛 셔틀(10:00~19:00)과 탑오브더락(17:00~19:00)이 같은 시간대에 있어요.
      <div class="mt2">셔틀은 중간 이탈이 불가하니, 전망대를 다른 날로 옮기시는 걸 권해요. 전망대까지 이동에 <b>1시간 20분</b> 걸립니다.</div>`, { cls: 'mb4' }) : ''}

    ${share ? `<div class="card mb6"><div class="card-hd"><h3 class="t-card">일정표 공유 · 저장</h3></div><div class="card-bd">
      <div class="g4 g1-m mb4">
        <button class="btn btn-accent" type="button" data-toast="카카오톡으로 공유했어요" data-toast-kind="ok">카카오톡 공유</button>
        <button class="btn btn-ghost" type="button" data-toast="링크를 복사했어요" data-toast-kind="ok">링크 복사</button>
        <button class="btn btn-ghost" type="button" data-toast="이미지로 저장했어요" data-toast-kind="ok">이미지 저장</button>
        <button class="btn btn-ghost" type="button" data-toast="PDF로 저장했어요" data-toast-kind="ok">PDF 저장</button>
      </div>
      ${kv([
    ['공유 링크', 'https://travelnow.kr/t/ny-0803-x8Kd2 <span class="t-sub">(7일간 유효)</span>'],
    ['공유 범위', '일정·집합 장소·시간 (결제 정보와 여행자 생년월일은 제외)'],
    ['집합 장소 표기', '한국어 + <b>현지어 병기</b> — 택시 기사에게 보여줄 수 있어요'],
  ])}
      <label class="check mt3"><input type="checkbox" checked><span>오프라인 열람용으로 기기에 저장 <span class="sub">인터넷이 없어도 일정과 바우처를 볼 수 있어요</span></span></label>
      ${banner('ok', '✓', '<b>오프라인 저장을 완료했어요.</b> 마지막 동기화 2026.08.02 21:40', { cls: 'mt3' })}
    </div></div>` : ''}

    ${TRIP.days.map(dayBlock).join('')}

    ${sec('빈 시간에 갈 만한 곳', `<div class="g4">${pcards([P('P04'), P('P02'), P('P06'), P('P03')], { noHeart: true })}</div>`,
    { desc: '일정 사이 비어 있는 시간대와 이동 거리를 고려해 추천했어요.' })}

    <p class="t-sub mt6">타임라인은 모바일에서 세로 한 줄로 접혀 표시됩니다. 예정된 여정이 없으면 빈 상태 안내가 보여요.</p>
  </div></div>`;

  return {
    body, o: {
      logged: true, noti: 3,
      state: overlap ? '일정 겹침 경고 — 겹치는 구간과 이동 시간 안내' : share ? '일정표 공유·저장 — 현지어 병기와 오프라인 캐시' : '',
    },
  };
}

/* ===== MY11 내 후기 ===== */
export function MY1101(ctx) {
  const id = ctx.id;
  const expired = id === 'MY1102';
  const edit = id === 'MY1103';

  const pending = [
    { p: P('P10'), date: '2026.06.18 이용', dday: 5 },
    { p: P('P13'), date: '2026.06.02 이용', dday: 2 },
    { p: P('P08'), date: '2026.05.21 이용', dday: -3, over: true },
  ];
  const mine = [
    { ...REVIEWS[0], prod: 'P01', reply: '소중한 후기 감사합니다. 다음에도 편안한 여행 되시길 바랍니다.', replyAt: '2026.07.13' },
    { ...REVIEWS[3], prod: 'P06' },
  ];

  const body = `${pageHd('내 후기', '작성 가능한 후기와 내가 쓴 후기를 모았어요')}
  <div class="split">${myNav('MY1101')}<div>

    <div class="box-pri mb6 row-b wrap-row">
      <div class="row-c" style="gap:32px;flex-wrap:wrap">
        <div><div class="price">2,500P</div><div class="t-sub">후기로 모은 포인트</div></div>
        <div><div class="price">73</div><div class="t-sub">받은 도움돼요</div></div>
        <div><div class="price">11</div><div class="t-sub">작성한 후기</div></div>
      </div>
      <a class="btn btn-ghost" href="${link('MY0901')}">포인트 사용하기</a></div>

    ${tabs([{ label: '작성 가능', cnt: 3, go: 'MY1101' }, { label: '작성 완료', cnt: 11, go: 'MY1103' }], edit ? 1 : 0)}

    ${edit ? `
    ${banner('pri', 'ℹ', '<b>후기는 작성 후 30일까지 수정할 수 있어요.</b> 삭제하면 지급된 포인트가 회수됩니다.', { cls: 'mb4' })}
    ${mine.map((r, i) => `<div class="card mb4"><div class="card-bd">
      ${prodSummary(P(r.prod), { right: `<a class="btn btn-ghost btn-sm" href="${link('PR0201')}">상품 상세</a>` })}
      <div class="hr"></div>
      ${i === 0 ? `
        <div class="field"><label class="label">별점</label>
          <div style="font-size:28px;color:var(--accent);letter-spacing:3px">★★★★★</div></div>
        <div class="field"><label class="label">본문</label><textarea class="textarea">${esc(r.txt)}</textarea>
          <p class="hint">작성일 ${r.date} · 수정 가능 기한 2026.08.11 (D-12)</p></div>
        <div class="field"><label class="label">사진</label>
          <div class="row" style="gap:8px">${[1, 2].map((k) => `<div style="position:relative;width:96px">${ph(r.who + k, 'ph-11', '후기 사진', '800×800')}
            <button class="heart" type="button" style="top:4px;right:4px;width:24px;height:24px;line-height:24px;font-size:12px">✕</button></div>`).join('')}
            <button type="button" style="width:96px;aspect-ratio:1/1;border:1px dashed var(--border);border-radius:12px;background:var(--bg);color:var(--muted);font-size:24px" data-toast="사진을 더 올려요">＋</button></div></div>
        <div class="btns"><button class="btn btn-primary" type="button" data-toast="후기를 수정했어요" data-toast-kind="ok">수정 저장</button>
          <button class="btn btn-danger" type="button" data-modal="m-rvdel">삭제</button>
          <a class="btn btn-ghost" href="${link('MY1101')}">취소</a></div>`
      : `${review(r)}
        <div class="row-b mt3"><span class="t-sub">작성일 ${r.date} · 도움돼요 ${r.help}</span>
          <div class="btns"><button class="btn btn-ghost btn-sm" type="button" data-toast="수정 화면을 열었어요">수정</button>
            <button class="btn btn-ghost btn-sm" type="button" data-modal="m-rvdel">삭제</button></div></div>`}
    </div></div>`).join('')}
    ${modalTpl('m-rvdel', '후기를 삭제할까요?',
      `<p>삭제하면 되돌릴 수 없어요.</p>
       <div class="box-warn mt3"><b>지급된 500포인트가 회수됩니다.</b>
         <p class="t-sub mt1">현재 보유 포인트가 부족하면 다음 적립에서 차감돼요.</p></div>`,
      `<button class="btn btn-ghost" type="button" data-dismiss>유지하기</button>
       <button class="btn btn-danger" type="button" data-dismiss>삭제</button>`)}`
      : `
    ${expired ? banner('mut', 'ℹ', `<b>작성 기한이 지난 예약이 1건 있어요.</b> 후기는 <b>이용일로부터 30일 이내</b>에만 쓸 수 있어요.
      <div class="t-sub mt2">기한이 지나면 포인트가 지급되지 않습니다.</div>`, { cls: 'mb4' }) : ''}

    ${pending.map((x) => `<div class="hcard mb3 ${x.over ? 'is-off' : ''}" ${x.dday <= 3 && !x.over ? 'style="border-color:var(--danger)"' : ''}>
      ${ph(x.p.id, 'ph-thumb', '상품')}
      <div class="grow"><div class="badges mb1">
        ${x.over ? badge('작성 기한 만료', 'b-mut') : badge(`작성 기한 D-${x.dday}`, x.dday <= 3 ? 'b-danger' : 'b-acc')}</div>
        <div class="t-card" style="font-size:15px">${esc(x.p.name)}</div>
        <p class="t-sub mt1">${x.date}</p>
        ${x.over ? `<p class="t-sub mt1">이용일로부터 30일이 지나 작성할 수 없어요 · 포인트 미지급</p>` : ''}</div>
      <div style="flex:none">${x.over
        ? `<a class="btn btn-ghost btn-sm" href="${link('PR0201')}">같은 상품 재예약</a>`
        : `<a class="btn btn-primary btn-sm" href="${link('MY0801')}">후기 쓰기</a>`}</div></div>`).join('')}

    ${sec('작성 완료한 후기', `<div class="card"><div class="card-bd">
      ${mine.map((r) => `${review(r)}
        <div class="row-b" style="padding-bottom:16px"><span class="t-sub">${esc(P(r.prod).name.slice(0, 28))}…</span>
          <div class="btns"><a class="btn btn-ghost btn-sm" href="${link('MY1103')}">수정</a>
            <a class="btn btn-ghost btn-sm" href="${link('MY1103')}">삭제</a></div></div>`).join('')}
      <a class="btn btn-ghost btn-block mt3" href="${link('MY1103')}">작성 완료 11개 전체 보기</a>
    </div></div>`)}`}
  </div></div>`;

  return {
    body, o: {
      logged: true,
      state: expired ? '작성 기한 만료 — 회색 처리와 포인트 미지급 사유' : edit ? '후기 수정·삭제 — 30일 제한과 포인트 회수 고지' : '',
    },
  };
}

/* ===== MY12 알림함 ===== */
export function MY1201(ctx) {
  const id = ctx.id;
  const pinSoon = id === 'MY1202';
  const none = id === 'MY1203';

  const ncard = (n) => `<div class="notice ${n.unread ? 'unread' : ''}">
    <span class="dot ${n.unread ? '' : 'hide'}"></span>
    <span class="ic ${n.danger ? 'danger' : n.acc ? 'acc' : ''}">${n.ic}</span>
    <a class="grow" href="${link(n.go)}">
      <div class="row-b wrap-row"><b>${n.title}</b><span class="t-sub">${n.at}</span></div>
      <p class="t-sub mt1">${n.body}</p>
      <div class="badges mt2">${badge(n.kind, n.danger ? 'b-danger' : n.kind === '혜택' ? 'b-acc' : 'b-line')}</div></a>
    <button class="btn btn-ghost btn-sm" type="button" data-toast="알림을 삭제했어요" data-toast-act="되돌리기" style="flex:none">삭제</button></div>`;

  const body = `${pageHd('알림함', none ? '' : '읽지 않은 알림 3개',
    none ? '' : `<div class="btns"><button class="btn btn-ghost" type="button" data-toast="모두 읽음으로 처리했어요">모두 읽음</button>
      <a class="btn btn-ghost" href="${link('MY1301')}">알림 설정</a></div>`)}
  <div class="split">${myNav('MY1201')}<div>
    ${tabs([{ label: '전체', cnt: none ? 0 : 7 }, { label: '예약', cnt: none ? 0 : 3 }, { label: '혜택', cnt: none ? 0 : 2 }, { label: '공지', cnt: none ? 0 : 2 }], 0)}

    ${none ? `<div class="card">${empty('🔔', '새로운 알림이 없어요',
    '예약 확정·출발 안내·특가 소식을 알림으로 받아보세요.',
    `<a class="btn btn-primary" href="${link('MY1301')}">알림 수신 설정</a><a class="btn btn-ghost" href="${link('CS0401')}">공지사항 보기</a>`)}</div>
      ${banner('warn', '📵', `<b>앱 푸시가 차단된 것 같아요.</b> 기기 설정 &gt; 알림에서 트래블나우 알림을 허용해주세요.
        <div class="t-sub mt2">카카오톡·이메일 수신은 켜져 있어요.</div>`, { cls: 'mt4' })}`
      : `
    ${pinSoon ? `<div class="box-danger mb4">
      <div class="row-b wrap-row mb3"><div class="row-c">${badge('D-1 · 상단 고정', 'b-danger')}<b class="t-card" style="font-size:16px">내일 출발이에요</b></div>
        <span class="t-sub">1시간 전</span></div>
      ${kv([
        ['집합 시각', '<b>8월 3일(월) 13:45</b> (현지 시각)'],
        ['집합 장소', '배터리파크 11번 부두 · 파란 깃발 가이드'],
        ['당일 날씨', '☀ 맑음 24° · 자외선 강함'],
        ['준비물', '여권 · 바우처 · 겉옷 · 자외선 차단제'],
      ])}
      ${banner('warn', '📵', '<b>바우처를 아직 저장하지 않았어요.</b> 현지에서 인터넷이 안 될 수 있어요.', {
        cls: 'mt3', right: `<a class="btn btn-primary btn-sm" href="${link('VC0201')}">바우처 열기</a>`,
      })}
    </div>` : ''}

    <div class="card mb4"><div class="card-bd" style="padding:0">
      ${NOTIFS.filter((n) => n.danger).map(ncard).join('')}
    </div><div class="card-ft t-sub">공지·현지 이슈 알림은 상단에 고정됩니다.</div></div>

    <div class="card"><div class="card-bd" style="padding:0">
      ${NOTIFS.filter((n) => !n.danger).map(ncard).join('')}
    </div></div>

    <div class="row-b wrap-row mt4">
      <p class="t-sub">30일이 지난 알림은 자동으로 사라져요. 카드를 옆으로 밀어도 삭제할 수 있어요.</p>
      <button class="btn btn-ghost btn-sm" type="button" data-toast="알림을 모두 비웠어요">전체 비우기</button></div>`}
  </div></div>`;

  return {
    body, o: {
      logged: true, noti: none ? 0 : 3,
      state: pinSoon ? '출발 임박 알림 고정 — 집합 정보와 바우처 미저장 경고' : none ? '알림 없음 — 수신 설정 점검과 푸시 차단 감지' : '',
    },
  };
}

/* ===== MY13 계정 설정 ===== */
export function MY1301(ctx) {
  const id = ctx.id;
  const emailChange = id === 'MY1302';
  const leave = id === 'MY1303';

  const sideMenu = `<aside class="side"><div class="gl">계정 설정</div>
    ${['프로필', '이메일 변경', '비밀번호', '소셜 계정', '알림 수신', '마케팅 동의', '표시 설정', '저장된 여행자', '개인정보 내려받기']
      .map((t, i) => `<a href="#s${i}"${i === (emailChange ? 1 : 0) ? ' class="on"' : ''}>${t}</a>`).join('')}
    <div class="gl">기타</div><a href="${link('MY1303')}" style="color:var(--muted)">회원 탈퇴</a></aside>`;

  const body = `${pageHd('계정 설정', 'kim@example.com · 2024년 3월 가입')}
  <div class="split">${sideMenu}<div>

    ${card('프로필', `<div class="field-row">
      <div class="field"><label class="label">이름</label><input class="input" value="김여행"></div>
      <div class="field"><label class="label">여권 영문명</label><input class="input" value="KIM YEOHAENG"></div></div>
      <div class="field" style="max-width:320px"><label class="label">휴대폰 번호</label><input class="input" value="010-1234-5678"></div>
      ${banner('pri', 'ℹ', '<b>예약에 쓰인 영문명은 여기서 바꿔도 이미 한 예약에는 반영되지 않아요.</b> 기존 예약은 예약 상세에서 개별 수정해주세요.', { cls: 'mb4' })}
      <div class="btns"><button class="btn btn-primary" type="button" data-toast="프로필을 저장했어요" data-toast-kind="ok">저장</button></div>`,
    { cls: 'mb4' })}

    ${card('이메일 변경', emailChange ? `
      <div class="field" style="max-width:420px"><label class="label">현재 이메일</label><input class="input" value="kim@example.com" disabled></div>
      <div class="field" style="max-width:420px"><label class="label">새 이메일</label>
        <div class="row-c"><input class="input" value="kim.travel@gmail.com" disabled>${badge('확인 대기', 'b-warn')}</div></div>
      ${banner('warn', '📧', `<b>kim.travel@gmail.com 으로 인증 메일을 보냈어요.</b>
        <div class="mt2">메일의 링크를 눌러야 변경이 완료돼요. 링크는 <b>24시간</b> 동안 유효합니다.</div>
        <div class="t-sub mt2">인증이 끝날 때까지는 기존 이메일(kim@example.com)로 계속 발송됩니다.</div>`, { cls: 'mb4' })}
      <div class="btns"><button class="btn btn-primary" type="button" data-toast="인증 메일을 다시 보냈어요" data-toast-kind="ok">인증 메일 재발송</button>
        <button class="btn btn-ghost" type="button" data-toast="변경 요청을 취소했어요">변경 취소</button></div>
      <p class="hint">메일이 안 보이면 스팸함을 확인해주세요. 발신 주소 no-reply@travelnow.kr</p>`
      : `<div class="field" style="max-width:420px"><label class="label">현재 이메일</label><input class="input" value="kim@example.com" disabled></div>
      <div class="field" style="max-width:420px"><label class="label">새 이메일</label><input class="input" placeholder="새 이메일을 입력하세요"></div>
      <div class="btns"><a class="btn btn-primary" href="${link('MY1302')}">인증 메일 발송</a></div>
      <p class="hint">인증을 완료하기 전까지는 기존 이메일로 발송됩니다.</p>`, { cls: 'mb4' })}

    ${card('비밀번호 변경', `<div class="form">
      <div class="field"><label class="label">현재 비밀번호</label><input class="input" type="password" value="••••••••"></div>
      <div class="field"><label class="label">새 비밀번호</label><input class="input" type="password" value="••••••••••">
        <div class="row-c mt2" style="gap:12px;flex-wrap:wrap"><span class="t-sub success">✓ 8자 이상</span>
          <span class="t-sub success">✓ 영문 포함</span><span class="t-sub success">✓ 숫자 포함</span></div></div>
      <div class="field"><label class="label">새 비밀번호 확인</label><input class="input" type="password" value="••••••••••"><p class="ok">✓ 일치해요</p></div>
      <button class="btn btn-primary" type="button" data-toast="비밀번호를 변경했어요" data-toast-kind="ok">비밀번호 변경</button></div>`, { cls: 'mb4' })}

    ${card('소셜 계정 연결', `${[['카카오', true, false], ['구글', false, false], ['애플', true, true]]
      .map(([n, connected, last]) => `<div class="row-b" style="padding:12px 0;border-bottom:1px solid var(--border)">
        <div><b>${n}</b> ${connected ? badge('연결됨', 'b-ok') : badge('미연결', 'b-mut')}
          <div class="t-sub mt1">${connected ? (last ? '마지막 로그인 수단이라 해제할 수 없어요' : 'kim****@kakao.com') : '연결하면 간편하게 로그인할 수 있어요'}</div></div>
        ${connected
        ? `<button class="btn btn-ghost btn-sm" type="button" ${last ? 'disabled' : 'data-toast="연결을 해제했어요"'}>해제</button>`
        : `<button class="btn btn-ghost btn-sm" type="button" data-toast="계정을 연결했어요" data-toast-kind="ok">연결</button>`}</div>`).join('')}`,
      { cls: 'mb4' })}

    ${card('알림 수신 설정', `${U.table([{ t: '알림 종류', w: '34%' }, '카카오톡', '이메일', '앱 푸시'],
        [['예약 안내 <span class="t-sub">(확정·출발·바우처)</span>', 1, 1, 1],
        ['혜택 · 특가 <span class="t-sub">(찜 할인·쿠폰 만료)</span>', 1, 0, 1],
        ['공지 · 현지 이슈', 1, 1, 1]].map(([k, a, b, c]) => [k,
          `<button class="toggle ${a ? 'on' : ''}" type="button"></button>`,
          `<button class="toggle ${b ? 'on' : ''}" type="button"></button>`,
          `<button class="toggle ${c ? 'on' : ''}" type="button"></button>`]))}
      <p class="hint">예약 확정과 출발 안내는 여행에 꼭 필요한 정보라 최소 1개 채널은 켜두시길 권해요.</p>`, { cls: 'mb4' })}

    ${card('마케팅 수신 동의', `<div class="row-b">
      <div><b>마케팅 정보 수신에 동의</b><p class="t-sub mt1">최근 변경일 2026년 5월 12일 · 동의 상태</p></div>
      <button class="toggle on" type="button"></button></div>
      <div class="hr"></div>
      ${U.table([{ t: '변경 시각', w: '34%' }, '항목', '변경 내용'], [
          ['2026.05.12 21:04', '마케팅 수신', '미동의 → 동의'],
          ['2024.03.02 10:11', '마케팅 수신', '동의 (가입 시)'],
        ])}`, { cls: 'mb4' })}

    ${card('표시 설정', `<div class="g2 g1-m">
      <div class="field"><label class="label">표시 언어</label>
        <select class="select"><option>한국어</option><option>English</option></select></div>
      <div class="field"><label class="label">결제 통화</label>
        <select class="select"><option>KRW 원</option><option>USD 달러</option></select></div></div>
      <p class="hint">결제 통화를 바꾸면 상품 가격이 해당 통화로 표시됩니다. 실제 청구는 카드사 환율이 적용돼요.</p>
      <div class="btns"><button class="btn btn-primary" type="button" data-toast="표시 설정을 저장했어요" data-toast-kind="ok">저장</button></div>`, { cls: 'mb4' })}

    ${card('저장된 여행자 정보', `<p class="t-sub mb3">자주 함께 가는 동행자를 저장해두면 예약할 때 바로 불러올 수 있어요.</p>
      ${U.table([{ t: '영문명', w: '32%' }, '생년월일', '관계', ''], [
          ['LEE SORA', '1992-07-02', '배우자', `<button class="btn btn-ghost btn-sm" type="button" data-toast="삭제했어요">삭제</button>`],
          ['KIM HANEUL', '2016-04-18', '자녀', `<button class="btn btn-ghost btn-sm" type="button" data-toast="삭제했어요">삭제</button>`],
        ])}
      <div class="btns mt4"><button class="btn btn-ghost" type="button" data-toast="여행자 추가 창을 열었어요">＋ 여행자 추가</button></div>`, { cls: 'mb4' })}

    ${card('내 개인정보 내려받기', `<p>요청하시면 보관 중인 개인정보와 예약 기록을 정리해 <b>가입 이메일로 보내드려요.</b></p>
      <p class="t-sub mt2">처리에 최대 3영업일이 걸리며, 파일은 암호가 걸린 ZIP으로 전송됩니다.</p>
      <div class="btns mt4"><button class="btn btn-ghost" type="button" data-toast="내려받기를 요청했어요. 3영업일 안에 메일로 보내드립니다" data-toast-kind="ok">내려받기 요청</button></div>`,
      { cls: 'mb6' })}

    <div class="center"><button class="btn btn-link" type="button" data-modal="m-leave" style="color:var(--muted);font-weight:400">회원 탈퇴</button></div>

    ${modalTpl('m-leave', '정말 탈퇴하시겠어요?', `
      <div class="box-danger mb3"><b>탈퇴하면 아래 정보가 모두 사라져요.</b>
        <ul class="mt2">${['보유 쿠폰 3장', '포인트 3,500P', '작성한 후기 11개', '예약 기록과 바우처']
        .map((t) => `<li class="t-sub" style="padding:2px 0">· ${t}</li>`).join('')}</ul></div>
      <p class="t-sub">같은 이메일로 30일 안에는 재가입할 수 없어요.</p>`,
      `<button class="btn btn-ghost" type="button" data-dismiss>계정 유지</button>
       <a class="btn btn-danger" href="${link('MY1303')}">탈퇴 진행</a>`)}
  </div></div>

  ${leave ? modalEl('회원 탈퇴', `
    ${banner('danger', '🚫', '<b>진행 중인 예약이 있어 탈퇴할 수 없어요.</b> 예약을 모두 이용하거나 취소한 뒤에 다시 시도해주세요.', { cls: 'mb4' })}
    ${U.table([{ t: '예약', w: '46%' }, '이용일', '상태'], [
        ['자유의 여신상 크루즈', '8월 3일', '<span class="badge b-ok">확정</span>'],
        ['브루클린 야경 투어', '8월 4일', '<span class="badge b-warn">대기</span>'],
        ['3대 전망대 통합권', '8월 5일', '<span class="badge b-ok">확정</span>'],
      ])}
    <div class="hr"></div>
    <div class="field"><label class="label">탈퇴 사유 (선택)</label>
      <select class="select"><option>여행 계획이 없어요</option><option>다른 서비스를 이용해요</option>
        <option>개인정보가 걱정돼요</option><option>서비스가 불편해요</option><option>기타</option></select></div>
    <div class="box-warn"><b>소멸되는 혜택</b>
      <p class="t-sub mt1">쿠폰 3장 · 포인트 3,500P · 후기 11개 · 재가입 제한 30일</p></div>`,
    `<a class="btn btn-ghost" href="${link('MY1301')}">계정 유지</a>
     <button class="btn btn-danger" type="button" disabled>탈퇴 (예약 정리 후 가능)</button>`, { lg: true }) : ''}`;

  return {
    body, o: {
      logged: true, noti: 3,
      state: emailChange ? '이메일 변경 인증 — 확인 대기 배지와 재발송' : leave ? '회원 탈퇴 확인 — 소멸 고지와 진행 중 예약 차단' : '',
    },
  };
}
