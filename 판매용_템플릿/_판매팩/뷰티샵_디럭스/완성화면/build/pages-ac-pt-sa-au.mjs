/* 내 정보(AC) · 매장 홈(PT) · 정산(SA) · 계정(AU) */
import {
  ph, phFix, phAva, map, esc, won, num, min2h, link, stars, rateLine, badge, stBadge, btn, chip, chips, tabs,
  sec, card, banner, empty, table, kv, sumRows, accordion, stat, progress, stepbar, hsteps, modalEl, modalTpl,
  review, calendar, shopRow, dzCard, pageHd, stickBar, myNav, mgNav,
} from './ui.mjs';
import { SITE, SHOPS, CATS, AREAS, DESIGNERS, TODAY, PENDING, COUPONS, POINTS, SETTLE, REVIEWS } from './data.mjs';

const OWNER = { owner: true, noCat: true };
const S = SHOPS;

/* ============================================================
   AC0101 — 내 정보
   ============================================================ */
export function AC0101(ctx) {
  const profile = (o = {}) => card('프로필', `
    <div class="row gap6 wrap-row mb6">${phAva(96, 'me')}
      <div class="grow"><div class="btns">${btn('사진 바꾸기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="사진 고르기 창을 엽니다"' })}
        ${btn('기본 이미지로', { cls: 'btn-ghost btn-sm', attr: ' data-toast="기본 이미지로 바꿨어요"' })}</div>
        <p class="hint mt2">정사각형(400×400 이상)으로 올려주세요.</p></div></div>
    <div class="field"><div class="label">닉네임 <span class="req">*</span></div><input class="input" type="text" value="유진아">
      <p class="hint">리뷰에는 <b>유*아</b>처럼 가운데를 가려서 보여드려요.</p></div>
    <div class="field"><div class="label">휴대폰 번호 <span class="req">*</span></div>
      <div class="field-btn"><input class="input" type="tel" value="010-1234-5678"${o.verify ? '' : ' disabled'}>
        ${btn(o.verify ? '인증번호 받기' : '번호 바꾸기', { cls: 'btn-ghost', href: o.verify ? undefined : 'AC0102', attr: o.verify ? ' data-toast="인증번호를 보냈어요"' : '' })}</div>
      <p class="${o.verify ? 'hint' : 'ok'}">${o.verify ? '번호를 바꾸면 다시 인증해야 해요.' : '✓ 2026.03.11 인증 완료'}</p></div>
    <div class="field"><div class="label">이메일</div><input class="input" type="email" value="jina@example.com"></div>`);

  const noti = card('알림 받기', `
    ${[['예약 확정·거절', '매장이 예약을 확인하면 바로 알려드려요', true],
       ['방문 하루 전 알림', '전날 저녁에 한 번 알려드려요', true],
       ['리뷰 쓰기 알림', '시술이 끝나고 하루 뒤 알려드려요', true],
       ['관심 매장 소식', '새 시술·할인 소식을 알려드려요', false],
       ['마케팅 정보 수신', '이벤트와 쿠폰 소식 (선택)', false]].map(([t, d, on]) =>
      `<div class="row-b" style="padding:12px 0;border-bottom:1px solid var(--border)">
        <div><b>${t}</b><p class="t-sub mt1">${d}</p></div>
        <button class="toggle${on ? ' on' : ''}" type="button" aria-label="${t}"></button></div>`).join('')}
    <p class="hint mt3">예약 확정처럼 꼭 필요한 알림은 문자로도 함께 보내드려요.</p>`);

  const taste = card('관심 지역과 시술', `
    <div class="field"><div class="label">관심 지역 <span class="t-sub">(최대 3곳)</span></div>${chips(AREAS, [0, 1])}</div>
    <div class="field"><div class="label">관심 시술</div>${chips(CATS.map((c) => `${c.ic} ${c.nm}`), [2, 3])}</div>
    <p class="hint">고르시면 홈과 추천에 이 조건이 먼저 나와요.</p>`);

  const foot = `<div class="mt6">${card('매장을 운영하시나요?', `
    <p class="t-sub">예약·고객 관리·정산을 한 곳에서 하실 수 있어요. 입점 심사는 3~5영업일이 걸립니다.</p>
    <div class="btns mt4">${btn('매장 입점 신청', { cls: 'btn-primary', href: 'PT0201' })}</div>`)}</div>
    <p class="center mt8"><a class="btn-link" href="${link('AC0103')}" style="color:var(--muted);font-size:13px">회원 탈퇴</a></p>`;

  if (ctx.id === 'AC0102') {
    const modal = modalEl('휴대폰 번호 인증',
      `<p class="t-sub mb4"><b>010-9876-5432</b>로 인증번호를 보냈어요.</p>
       <div class="code-in">${[1, 2, 3, 4, 5, 6].map((i) => `<input type="text" maxlength="1" value="${i <= 3 ? i : ''}">`).join('')}</div>
       <p class="center mt4 t-sub">남은 시간 <b class="pri" data-count="180">3:00</b></p>
       <div class="btns mt4" style="justify-content:center">${btn('인증번호 다시 받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="인증번호를 다시 보냈어요"' })}
         ${btn('번호 바꾸기', { cls: 'btn-ghost btn-sm', attr: ' data-dismiss' })}</div>
       ${banner('warn', '⚠️', '<b>번호를 바꾸면 예약 알림도 새 번호로 갑니다.</b><div class="t-sub mt1">지금 잡혀 있는 예약 2건의 안내도 새 번호로 가요.</div>', { cls: 'mt6' })}
       <p class="hint mt3">5회 틀리면 30분간 인증할 수 없어요. (현재 0/5)</p>`,
      `${btn('취소', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('인증하기', { cls: 'btn-primary', attr: ' data-dismiss data-toast="번호를 바꿨어요" data-toast-kind="ok"' })}`);
    return {
      body: `${pageHd('내 정보')}<div class="split">${myNav(ctx.id)}<div class="col gap6">${profile({ verify: true })}${noti}</div></div>`,
      o: { state: '연락처 인증', logged: true, after: modal },
    };
  }

  if (ctx.id === 'AC0103') {
    const modal = modalEl('정말 탈퇴하시겠어요?',
      `${banner('danger', '⚠️', '<b>탈퇴하면 되돌릴 수 없어요.</b>')}
       <div class="box mt4"><b class="t-sub">없어지는 것들</b>
         <ul class="col mt2" style="gap:8px;font-size:14px">
           <li>· 예정된 예약 <b class="danger">2건</b>이 모두 취소돼요 (예약금은 규정에 따라 환불)</li>
           <li>· 적립금 <b class="danger">4,100원</b>이 사라져요</li>
           <li>· 쿠폰 <b class="danger">3장</b>이 사라져요</li>
           <li>· 작성하신 리뷰 12개는 남지만 닉네임이 “탈퇴한 사용자”로 바뀝니다</li></ul></div>
       ${card('취소될 예약', table(['일시', '매장', '시술'], [
         ['9/12(토) 14:00', '살롱 드 코랄', '발레아쥬'], ['9/18(금) 19:00', '네일 아뜰리에 봄', '젤 아트(2P)'],
       ], { fix: false }), { cls: 'mt4' })}
       <div class="field mt4"><div class="label">왜 떠나시나요? <span class="t-sub">(안 적으셔도 돼요)</span></div>
         <div class="radio-list">
           <label class="radio on" data-group="wd"><input type="radio" name="wd" checked><span class="grow">쓸 일이 없어요</span></label>
           <label class="radio" data-group="wd"><input type="radio" name="wd"><span class="grow">원하는 매장이 없어요</span></label>
           <label class="radio" data-group="wd"><input type="radio" name="wd"><span class="grow">쓰기 불편해요</span></label>
           <label class="radio" data-group="wd"><input type="radio" name="wd"><span class="grow">기타</span></label>
         </div></div>
       ${banner('mut', 'ℹ️', '탈퇴 후 <b>30일간</b>은 같은 번호로 다시 가입할 수 없어요.', { cls: 'mt4' })}
       <label class="check mt4"><input type="checkbox" data-unlock="wd-btn"><span><b>위 내용을 모두 확인했고, 탈퇴합니다</b></span></label>`,
      `${btn('그대로 쓸래요', { cls: 'btn-ghost', href: 'AC0101' })}
       <button class="btn btn-danger is-off" type="button" id="wd-btn" disabled>탈퇴하기</button>`,
      { lg: true });
    return {
      body: `${pageHd('내 정보')}<div class="split">${myNav(ctx.id)}<div class="col gap6">${profile()}</div></div>`,
      o: { state: '회원 탈퇴 확인', logged: true, after: modal },
    };
  }

  return {
    body: `${pageHd('내 정보')}<div class="split">${myNav(ctx.id)}
      <div><div class="col gap6">${profile()}${noti}${taste}</div>
        <div class="btns mt6">${btn('저장', { cls: 'btn-primary btn-lg', attr: ' data-toast="저장했어요" data-toast-kind="ok"' })}</div>
        ${foot}</div></div>`,
    o: { logged: true },
  };
}
export const AC0102 = AC0101, AC0103 = AC0101;

/* ============================================================
   AC0201 — 쿠폰·적립금
   ============================================================ */
export function AC0201(ctx) {
  const cpCard = (c) => `<div class="coupon ${c.soon ? 'soon' : ''} ${c.off ? 'is-off' : ''}">
    <div class="amt"><div class="v">${c.v}</div><div class="t-sub">할인</div></div>
    <div class="bd"><div class="row-b wrap-row"><b>${c.nm}</b>${c.soon ? badge('곧 만료', 'b-danger') : ''}${c.off ? badge('쓸 수 없음', 'b-mut') : ''}</div>
      <p class="t-sub mt1">${c.cond}</p>
      <p class="t-sub mt1">${c.to}까지${c.off ? ' · 5만원 이상 결제 건에만 쓸 수 있어요' : ''}</p></div></div>`;

  const balance = `<div class="card mb6"><div class="card-bd center" style="padding:32px">
    <div class="t-sub">쓸 수 있는 적립금</div>
    <div class="price-lg pri" style="font-size:44px">4,100원</div>
    <p class="t-sub mt2">예약할 때 시술 금액의 10%까지 쓸 수 있어요</p></div></div>`;

  const codeIn = (o = {}) => card('쿠폰 코드 등록', `
    <div class="field-btn">
      <input class="input ${o.err ? 'is-err' : ''}" type="text" value="${o.code || ''}" placeholder="예: BEAUTY2026">
      ${btn('등록', { cls: 'btn-primary', href: o.err ? undefined : 'AC0202', attr: o.err ? ' data-toast="코드를 다시 확인해 주세요"' : '' })}</div>
    ${o.err ? `<p class="err">${o.msg}</p>` : '<p class="hint">매장이나 이벤트에서 받은 코드를 넣어주세요. 대소문자는 구분하지 않아요.</p>'}`);

  const history = card('적립금 내역', table(['날짜', '내용', '증감'], POINTS.map(([d, t, v]) =>
    [d, t, `<b class="${v.startsWith('+') ? 'success' : 'danger'}">${v}</b>`]), { fix: false }));

  if (ctx.id === 'AC0202') {
    return {
      body: `${pageHd('쿠폰·적립금')}<div class="split">${myNav(ctx.id)}<div>
        ${balance}
        ${codeIn({ err: true, code: 'BEAUTY2025', msg: '2025년 12월 31일에 만료된 코드예요.' })}
        <div class="mt4">${card('이럴 때 등록이 안 돼요', `
          ${table(['안내 문구', '무엇을 하면 되나요'], [
            ['만료된 코드예요', '쿠폰마다 사용 기한이 있어요. 매장에 다시 문의해 주세요'],
            ['이미 사용한 코드예요', '한 번 등록한 코드는 다시 쓸 수 없어요'],
            ['대상이 아니에요', '첫 방문 고객 전용처럼 조건이 붙은 코드예요'],
            ['없는 코드예요', 'O(영문)과 0(숫자), l(엘)과 1(일)을 헷갈리지 않았는지 봐주세요'],
          ], { fix: false })}
          <p class="hint mt3">그래도 안 되면 <button class="btn-link" type="button" data-toast="고객센터 1600-0000 으로 연결합니다">고객센터</button>에 코드를 알려주세요.</p>`)}</div>
        <div class="mt6">${tabs(['사용 가능', '사용 완료', '만료'], 0, { pill: true })}
          <div class="col gap6">${COUPONS.filter((c) => !c.off).map(cpCard).join('')}</div></div>`,
      o: { state: '쿠폰 코드 등록 실패', logged: true },
    };
  }

  return {
    body: `${pageHd('쿠폰·적립금')}<div class="split">${myNav(ctx.id)}<div>
      ${balance}
      ${tabs([{ label: '사용 가능', cnt: 3 }, { label: '사용 완료', cnt: 8 }, { label: '만료', cnt: 2 }], 0, { pill: true })}
      <div class="col gap6 mb6">${COUPONS.map(cpCard).join('')}</div>
      ${codeIn()}
      <div class="mt6">${history}</div>
    </div></div>`,
    o: { logged: true },
  };
}
export const AC0202 = AC0201;

/* ============================================================
   PT0101 — 매장 홈 (대시보드)
   ============================================================ */
export function PT0101(ctx) {
  const stats = `<div class="g4 g1-m mb8">
    ${stat('14<span class="u">건</span>', '오늘 예약', { ic: '📋', d: `<a class="btn-link" href="${link('ST0101')}">보러 가기</a>` })}
    ${stat('3<span class="u">건</span>', '접수 대기', { ic: '⏳', d: '<span class="danger">가장 급한 건 55분 남음</span>' })}
    ${stat('842<span class="u">만원</span>', '이번 달 매출', { ic: '💰', d: '지난달보다 +12%' })}
    ${stat('4.9', '평균 별점', { ic: '⭐', d: '리뷰 1,284개' })}
  </div>`;

  const todo = card('처리가 필요한 일', `
    ${[['예약 접수 대기', 3, '2시간 안에 답해야 해요', 'ST0501', 'danger'],
       ['변경 요청', 1, '고객이 시간 변경을 요청했어요', 'ST0101', 'warn'],
       ['노쇼 확인', 2, '어제 방문 여부를 확인해 주세요', 'PT0103', 'warn'],
       ['미답변 리뷰', 4, '답글을 달면 재방문이 늘어요', 'RV0201', 'mut']].map(([t, n, d, go, kind]) =>
      `<a class="list-row" href="${link(go)}">
        <span class="none">${badge(`${n}건`, kind === 'danger' ? 'b-danger' : kind === 'warn' ? 'b-warn' : 'b-mut')}</span>
        <div class="grow"><b>${t}</b><p class="t-sub mt1">${d}</p></div>
        <span class="none muted">›</span></a>`).join('')}`);

  const timeline = card('오늘 시간대별 예약', `<div class="tgrid"><table>
    <thead><tr><th>디자이너</th>${['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'].map((h) => `<th>${h}시</th>`).join('')}</tr></thead>
    <tbody>${DESIGNERS.slice(0, 3).map((d, di) => `<tr><td>${d.nm}</td>
      ${Array.from({ length: 11 }, (_, i) => {
        const has = [[3, 4, 5, 7, 8], [0, 2, 4, 6, 9], [1, 4, 5, 9, 10]][di].includes(i);
        return `<td>${has ? `<div class="blk blk-${di + 1}">${['최유나', '한소희', '정민석', '서예린', '윤채원'][i % 5]}<div class="c">${['볼륨매직', '뿌리염색', '남성컷', '젤아트', '펌'][i % 5]}</div></div>` : ''}</td>`;
      }).join('')}</tr>`).join('')}</tbody></table></div>`);

  const chart = card('최근 7일 예약 추이', `
    <div class="row" style="align-items:flex-end;gap:16px;height:160px;padding:0 8px">
      ${[9, 12, 8, 14, 11, 18, 14].map((v, i) => `<div class="grow center" style="display:flex;flex-direction:column;justify-content:flex-end;height:100%">
        <div class="t-sub" style="font-size:12px">${v}</div>
        <div style="background:${i === 6 ? 'var(--primary)' : 'var(--pri-10)'};border-radius:8px 8px 0 0;height:${v / 18 * 100}%"></div>
        <div class="t-sub mt1" style="font-size:12px">${['9/6', '9/7', '9/8', '9/9', '9/10', '9/11', '9/12'][i]}</div></div>`).join('')}
    </div>`);

  const byDz = card('디자이너별 예약 현황', `${DESIGNERS.slice(0, 3).map((d, i) => {
    const n = [42, 38, 27][i];
    return `<div class="bar-row" style="grid-template-columns:96px 1fr 60px;margin-bottom:12px">
      <span><b>${d.nm}</b></span><span class="bar"><i style="width:${n / 42 * 100}%;background:var(--primary)"></i></span>
      <span class="right"><b>${n}건</b></span></div>`;
  }).join('')}
    <p class="hint">이번 달 기준 · 최민서 디자이너는 휴직 중이에요</p>`);

  const recentRv = card('최근 리뷰', `${REVIEWS.slice(0, 5).map((r) => `<div class="list-row">
    <span class="none">${stars(r.rate)}</span>
    <div class="grow"><p style="font-size:14px">${esc(r.txt.slice(0, 40))}…</p>
      <p class="t-sub mt1">${r.menu} · ${r.who} · ${r.date}</p></div>
    <div class="none">${r.reply ? badge('답글 완료', 'b-mut') : btn('답글 달기', { cls: 'btn-soft btn-sm', href: 'RV0201' })}</div></div>`).join('')}`,
    { aside: `<a class="more" href="${link('RV0201')}">전체 보기 ›</a>` });

  const settle = card('이번 달 정산 예정', `
    <div class="row-b wrap-row"><div><div class="t-sub">예상 정산액</div><div class="price-lg pri">7,996,400원</div>
      <p class="t-sub mt1">플랫폼 수수료 5% 뺀 금액이에요</p></div>
      <div class="right"><div class="t-sub">지급 예정일</div><b>2026.10.10</b>
        <div class="mt3">${btn('정산 내역', { cls: 'btn-soft btn-sm', href: 'SA0101' })}</div></div></div>`);

  const quick = `<div class="g3 g1-m mt8">
    ${btn('예약 접수하기', { cls: 'btn-primary btn-lg btn-block', href: 'ST0501' })}
    ${btn('시술 메뉴 관리', { cls: 'btn-ghost btn-lg btn-block', href: 'MG0101' })}
    ${btn('근무 일정 관리', { cls: 'btn-ghost btn-lg btn-block', href: 'MG0301' })}</div>`;

  const bodyMain = `${stats}${todo}
    <div class="mt6">${timeline}</div>
    <div class="g2 g1-m mt6">${chart}${byDz}</div>
    <div class="mt6">${recentRv}</div>
    <div class="mt6">${settle}</div>${quick}`;

  if (ctx.id === 'PT0102') {
    return {
      body: `${pageHd('살롱 드 코랄', '2026년 9월 12일 토요일')}
        ${banner('danger', '🔥', `<b>55분 안에 답하지 않으면 예약 1건이 자동 취소돼요.</b>
          <div class="t-sub mt1">박서연님 · 젤 아트(2P) · 9/13(토) 16:00 희망 · 남은 시간 <b data-count="3300">55:00</b></div>`,
          { cls: 'mb6', right: btn('지금 처리하기', { cls: 'btn-primary', href: 'ST0501' }) })}
        ${banner('warn', '📉', '<b>이번 달 응답률 82%</b> — 80% 아래로 떨어지면 검색에서 뒤로 밀려요.', { cls: 'mb6' })}
        ${bodyMain}`,
      o: { ...OWNER, state: '응답 지연 경고' },
    };
  }

  if (ctx.id === 'PT0103') {
    const list = [
      ['20:30', '배수지', '눈썹 왁싱', '김수현'],
      ['19:00', '강태오', '남성 커트', '이도윤'],
    ];
    return {
      body: `${pageHd('살롱 드 코랄', '2026년 9월 12일 토요일')}
        ${banner('warn', '❓', `<b>어제 예약 2건의 방문 여부가 확인되지 않았어요.</b>
          <div class="t-sub mt1">방문 완료인지 노쇼인지 정해주셔야 정산이 진행돼요. 미처리 건은 정산이 보류됩니다.</div>`, { cls: 'mb6' })}
        ${card('확인이 필요한 예약 (9월 11일)', `
          ${list.map(([tm, cx, menu, dz]) => `<div class="list-row">
            <label class="check none" style="padding:0"><input type="checkbox"></label>
            <div class="none" style="width:70px"><b>${tm}</b></div>
            <div class="grow"><b>${cx}</b><p class="t-sub mt1">${menu} · ${dz}</p></div>
            <div class="none btns" style="flex-wrap:nowrap">
              <button class="btn btn-soft btn-sm" type="button" data-toast="${cx}님을 방문 완료로 바꿨어요">방문 완료</button>
              <a class="btn btn-ghost btn-sm" href="${link('ST0601')}">노쇼</a>
              <a class="icon-btn" href="${link('ST0401')}" style="width:36px;height:36px">⋯</a></div></div>`).join('')}
          <div class="hr"></div>
          <div class="btns"><label class="check grow"><input type="checkbox"> 전체 선택</label>
            ${btn('선택한 건 모두 방문 완료', { cls: 'btn-primary', attr: ' data-toast="선택한 예약을 방문 완료로 바꿨어요" data-toast-kind="ok"' })}
            ${btn('선택한 건 모두 노쇼', { cls: 'btn-ghost', href: 'ST0601' })}</div>`, { cls: 'mb6' })}
        ${banner('mut', '💡', '보통 <b>영업 종료 후 바로</b> 처리하시면 잊지 않아요. 3일이 지나면 자동으로 방문 완료가 됩니다.', { cls: 'mb6' })}
        ${bodyMain}`,
      o: { ...OWNER, state: '노쇼 확인 대기' },
    };
  }

  return { body: `${pageHd('살롱 드 코랄', '2026년 9월 12일 토요일 · 오늘도 잘 부탁드려요')}${bodyMain}`, o: OWNER };
}
export const PT0102 = PT0101, PT0103 = PT0101;

/* ============================================================
   PT0201 — 매장 입점 신청
   ============================================================ */
export function PT0201(ctx) {
  const steps = stepbar(['매장 정보', '서류', '심사'], 0);

  const basic = card('매장 기본 정보', `
    <div class="field"><div class="label">상호 <span class="req">*</span></div><input class="input" type="text" value="살롱 드 코랄"></div>
    <div class="field"><div class="label">주소 <span class="req">*</span></div>
      <div class="field-btn"><input class="input" type="text" value="서울 강남구 신사동 123-4" readonly>
        ${btn('주소 찾기', { cls: 'btn-ghost', attr: ' data-toast="주소 검색 창을 엽니다"' })}</div>
      <input class="input mt2" type="text" value="2층" placeholder="상세 주소 (층·호수)"></div>
    <div class="field-row">
      <div class="field"><div class="label">매장 전화 <span class="req">*</span></div><input class="input" type="tel" value="02-000-0000"></div>
      <div class="field"><div class="label">대표자명 <span class="req">*</span></div><input class="input" type="text" value="김수현"></div></div>
    <div class="field"><div class="label">대표 시술 <span class="req">*</span> <span class="t-sub">(여러 개 고를 수 있어요)</span></div>
      ${chips(CATS.map((c) => `${c.ic} ${c.nm}`), [0, 1, 2])}</div>`);

  const hours = card('영업시간', `
    <div class="table-wrap table-scroll"><table class="table table-fix">
      <thead><tr><th style="width:80px">요일</th><th style="width:90px">영업</th><th>시작</th><th>종료</th></tr></thead>
      <tbody>${['월', '화', '수', '목', '금', '토', '일'].map((d, i) => `<tr class="${i === 0 ? 'is-off' : ''}">
        <td><b>${d}</b></td><td><button class="toggle${i === 0 ? '' : ' on'}" type="button"></button></td>
        <td>${i === 0 ? '<span class="muted">휴무</span>' : `<input class="input" style="height:36px" type="time" value="11:00">`}</td>
        <td>${i === 0 ? '<span class="muted">휴무</span>' : `<input class="input" style="height:36px" type="time" value="${i >= 5 ? '19:00' : '21:00'}">`}</td></tr>`).join('')}</tbody></table></div>`);

  const photos = card('매장 사진 <span class="badge b-pri">최소 3장</span>', `
    <div class="row wrap-row mb3" style="gap:8px">
      ${[0, 1, 2].map((i) => phFix(['매장 대표', 1200, 900], 132, { seed: 'shop' + i })).join('')}
      <div class="upload none" style="width:132px;padding:16px;display:flex;align-items:center;justify-content:center">＋</div></div>
    <p class="hint">첫 번째 사진이 목록에서 대표로 보여요. 1200×900 이상 · 최대 20장</p>`);

  const docs = card('서류와 정산 계좌', `
    <div class="field"><div class="label">사업자등록증 <span class="req">*</span></div>
      <div class="file-row is-ok">✅ <div class="grow"><b>사업자등록증.pdf</b><p class="t-sub">1.2MB · 올리기 완료</p></div>
        <button class="btn btn-ghost btn-sm none" type="button" data-toast="파일을 뺐어요">삭제</button></div>
      <p class="hint">PDF 또는 사진 · 글자가 또렷하게 보여야 해요</p></div>
    <div class="field"><div class="label">정산 계좌 <span class="req">*</span></div>
      <div class="field-row"><select class="select"><option>국민은행</option><option>신한은행</option><option>하나은행</option></select>
        <input class="input" type="text" value="123456-01-234567" placeholder="계좌번호"></div>
      <input class="input mt2" type="text" value="김수현" placeholder="예금주">
      <p class="hint">사업자등록증의 대표자명과 같아야 해요.</p></div>`);

  const side = (o = {}) => card('입점은 이렇게 진행돼요', `
    ${hsteps(['신청', '서류 확인', '승인'], o.step === undefined ? 0 : o.step)}
    <div class="hr"></div>
    ${[['1. 신청서 제출', '지금 이 화면이에요. 10분이면 끝나요'],
       ['2. 서류 확인', '사업자등록증과 계좌를 확인해요 (1~2영업일)'],
       ['3. 승인', '승인되면 바로 예약을 받을 수 있어요']].map(([t, d]) =>
      `<div style="padding:10px 0"><b>${t}</b><p class="t-sub mt1">${d}</p></div>`).join('')}
    ${banner('pri', '⏱️', '<b>보통 3~5영업일</b>이 걸려요. 서류가 또렷하면 더 빨라집니다.', { cls: 'mt3' })}
    <div class="hr"></div>
    <div class="t-sub">수수료</div><p class="mt1">예약이 완료된 건에 대해 <b class="hl">결제 금액의 5%</b>를 받습니다. 월 이용료는 없어요.</p>`,
    { cls: 'sticky' });

  const agree = card('약관 동의', `
    <label class="check"><input type="checkbox" checked><span><b>입점 이용약관에 동의합니다</b> <span class="req">*</span></span></label>
    <label class="check"><input type="checkbox" checked><span><b>정산 규정에 동의합니다</b> <span class="req">*</span>
      <span class="sub">매월 10일에 전월 정산액을 지급해요</span></span></label>
    <label class="check"><input type="checkbox"><span><b>마케팅 정보 수신에 동의합니다</b> <span class="t-sub">(선택)</span></span></label>`);

  if (ctx.id === 'PT0202') {
    return {
      body: `${pageHd('매장 입점 신청')}${stepbar(['매장 정보', '서류', '심사'], 1)}
        ${banner('danger', '📄', `<b>서류 확인에서 반려됐어요. 2가지를 다시 올려주세요.</b>
          <div class="t-sub mt1">반려일 2026.09.10 · 고치신 뒤 다시 신청하시면 1~2영업일 안에 재심사해요.</div>`, { cls: 'mb6' })}
        <div class="split-r"><div class="col gap6">
          ${card('무엇을 고쳐야 하나요', `
            <div class="list-row" style="align-items:flex-start"><span class="none" style="font-size:20px">⚠️</span>
              <div class="grow"><b>사업자등록증이 흐릿해요</b>
                <p class="t-sub mt1">상호와 사업자등록번호가 읽히지 않아요. 밝은 곳에서 다시 찍거나 PDF로 올려주세요.</p>
                <div class="file-row is-err mt3">⚠️ <div class="grow"><b>사업자등록증.jpg</b><p class="t-sub danger">글자를 읽을 수 없어요</p></div>
                  <button class="btn btn-primary btn-sm none" type="button" data-toast="파일 고르기 창을 엽니다">다시 올리기</button></div></div></div>
            <div class="list-row" style="align-items:flex-start"><span class="none" style="font-size:20px">⚠️</span>
              <div class="grow"><b>예금주가 대표자명과 달라요</b>
                <p class="t-sub mt1">사업자등록증에는 <b>김수현</b>, 계좌 예금주는 <b>김수현헤어</b>로 돼 있어요. 개인 명의 계좌이거나, 사업자 통장 사본을 함께 올려주세요.</p>
                <div class="field mt3"><div class="field-row"><select class="select"><option>국민은행</option></select>
                  <input class="input is-err" type="text" value="123456-01-234567"></div>
                  <input class="input mt2" type="text" value="김수현헤어"></div></div></div>
            <div class="list-row" style="align-items:flex-start"><span class="none" style="font-size:20px">✅</span>
              <div class="grow"><b>매장 정보와 사진은 문제없어요</b><p class="t-sub mt1">다시 올리지 않으셔도 돼요.</p></div></div>`)}
          ${docs}
        </div>
        <div class="sticky">${card('재심사 안내', `
          ${hsteps(['신청', '서류 확인', '승인'], 1)}
          <div class="hr"></div>
          ${kv([['처음 신청', '2026.09.08'], ['반려', '2026.09.10'], ['재심사', '제출 후 1~2영업일']])}
          <div class="btns mt4">${btn('고쳐서 다시 신청', { cls: 'btn-primary btn-block btn-lg', href: 'PT0301' })}</div>
          <p class="center mt3"><button class="btn-link" type="button" data-toast="입점 담당자 1600-0000(내선 2) 로 연결합니다">담당자에게 문의</button></p>`)}</div></div>`,
      o: { state: '심사 반려' },
    };
  }

  return {
    body: `${pageHd('매장 입점 신청', '10분이면 신청할 수 있어요')}${steps}
      <div class="split-r"><div class="col gap6">${basic}${hours}${photos}${docs}${agree}
        <div class="btns">${btn('임시 저장', { cls: 'btn-ghost btn-lg', attr: 'data-toast="임시 저장했어요. 나중에 이어서 쓰실 수 있어요" data-toast-kind="ok"' })}${btn('입점 신청하기', { cls: 'btn-primary btn-lg grow', href: 'PT0301' })}</div>
      </div><div>${side()}</div></div>`,
  };
}
export const PT0202 = PT0201;

/* ============================================================
   PT0301 — 입점 심사 중
   ============================================================ */
export function PT0301(ctx) {
  return {
    body: `<div class="wrap-narrow" style="padding:0">
      <div class="center mb8"><div style="font-size:64px">🔎</div>
        <h1 class="t-page mt3">서류를 확인하고 있어요</h1>
        <p class="t-sub mt2">2026년 9월 8일에 신청하셨어요</p></div>
      ${card('진행 상황', `${hsteps(['접수 완료', '서류 확인 중', '승인'], 1)}
        <div class="hr"></div>
        <div class="timeline">
          <div class="tl-item done"><div class="tm">2026.09.08 14:22</div><b>신청서를 받았어요</b></div>
          <div class="tl-item"><div class="tm">2026.09.09 10:05</div><b>서류를 확인하는 중이에요</b>
            <p class="t-sub mt1">사업자등록증과 정산 계좌를 확인하고 있어요</p></div>
          <div class="tl-item wait"><div class="tm muted">예상 2026.09.12</div><b class="muted">승인</b>
            <p class="t-sub mt1">승인되면 바로 예약을 받을 수 있어요</p></div>
        </div>`)}
      <div class="mt6">${banner('pri', '⏱️', '<b>보통 3~5영업일</b>이 걸려요. 지금은 2일째입니다.')}</div>
      <div class="mt6">${card('제출하신 내용', `${kv([
        ['상호', '살롱 드 코랄'], ['주소', '서울 강남구 신사동 123-4 2층'],
        ['대표자', '김수현'], ['대표 시술', '헤어컷 · 펌 · 염색'],
        ['매장 사진', '3장'], ['서류', '사업자등록증.pdf'], ['정산 계좌', '국민은행 123456-01-****67 (김수현)'],
      ])}
        <div class="btns mt4">${btn('신청 내용 고치기', { cls: 'btn-ghost', href: 'PT0201' })}</div>`)}</div>
      <div class="mt6">${card('기다리는 동안 해두면 좋아요', `
        ${[['시술 메뉴 정리하기', '시술명·소요시간·가격을 미리 적어두면 승인 직후 바로 올릴 수 있어요', false],
           ['매장 사진 준비하기', '내부·시술 결과 사진을 10장쯤 준비해 주세요 (1200×900 이상)', true],
           ['디자이너 프로필 준비하기', '이름·직급·전문 시술·프로필 사진', false],
           ['근무 일정 정하기', '요일별 근무 시간과 휴게 시간', false]].map(([t, d, done]) =>
          `<label class="check" style="align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border)">
            <input type="checkbox"${done ? ' checked' : ''}>
            <span><b>${t}</b><span class="sub">${d}</span></span></label>`).join('')}`)}</div>
      ${banner('mut', '📮', '보완이 필요하면 문자와 이메일로 알려드려요. 반려되면 무엇을 고치면 되는지 항목별로 안내해요.', { cls: 'mt6' })}
      <div class="btns mt6">${btn('담당자에게 문의', { cls: 'btn-ghost btn-block btn-lg', attr: ' data-toast="입점 담당자 1600-0000(내선 2) 로 연결합니다"' })}</div>
      <p class="center mt4"><button class="btn-link" type="button" style="color:var(--muted)" data-toast="신청을 취소할까요? 다시 신청하려면 처음부터 입력해야 해요">신청 취소하기</button></p>
    </div>`,
  };
}

/* ============================================================
   SA0101 — 매장 정산 내역
   ============================================================ */
export function SA0101(ctx) {
  const sum = (o = {}) => `<div class="g3 g1-m mb6">
    ${stat('799<span class="u">만원</span>', '이번 달 예상 정산액', { ic: '💰', d: o.hold ? '<span class="warning">보류 4.9만원 제외</span>' : '수수료 5% 뺀 금액' })}
    ${stat('4,280<span class="u">만원</span>', '올해 누적 정산액', { ic: '📈' })}
    ${stat('10<span class="u">월 10일</span>', '다음 정산 예정일', { ic: '📅', cls: 'mut', d: o.noAcc ? '<span class="danger">계좌 등록이 필요해요</span>' : '매월 10일 지급' })}
  </div>`;

  const rows = (list) => list.map((s) => ({
    cells: [s.d, s.cx, s.menu, num(s.pay) + '원', `<span class="muted">-${num(s.fee)}원</span>`, `<b>${num(s.net)}원</b>`,
      s.noshow ? badge('노쇼 예약금', 'b-danger') : s.hold ? badge('정산 보류', 'b-warn') : s.st === '지급 완료' ? badge('지급 완료', 'b-ok') : badge('정산 예정', 'b-line')],
    cls: s.hold ? 'is-diff' : '',
  }));
  const head = ['예약일', '고객', '시술', '결제 금액', '수수료(5%)', '실 정산액', '상태'];
  const foot = ['합계', '', '', '496,000원', '-24,800원', '<b>471,200원</b>', ''];

  const bar = (o = {}) => `<div class="row-b wrap-row mb4">
    <div class="row-c"><select class="select" style="width:auto"><option>2026년 9월</option><option>2026년 8월</option><option>2026년 7월</option></select>
      ${o.right || ''}</div>
    <div class="btns">${btn('세금계산서 발행', { cls: 'btn-ghost', attr: ' data-toast="세금계산서 발행은 개발이 필요한 기능이에요"' })}
      ${btn('정산 계좌 관리', { cls: 'btn-soft', attr: ' data-modal="m-acc"' })}</div></div>`;

  const accTpl = modalTpl('m-acc', '정산 계좌',
    `<div class="field"><div class="label">은행</div><select class="select"><option>국민은행</option><option>신한은행</option></select></div>
     <div class="field"><div class="label">계좌번호</div><input class="input" type="text" value="123456-01-234567"></div>
     <div class="field"><div class="label">예금주</div><input class="input" type="text" value="김수현">
       <p class="hint">사업자등록증의 대표자명과 같아야 해요.</p></div>`,
    `${btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })}${btn('저장', { cls: 'btn-primary', attr: ' data-dismiss data-toast="정산 계좌를 저장했어요" data-toast-kind="ok"' })}`);

  if (ctx.id === 'SA0102') {
    return {
      body: `${pageHd('정산 내역')}
        ${banner('warn', '⏸️', `<b>정산이 보류된 건이 1건 있어요. (49,400원)</b>
          <div class="t-sub mt1">고객이 환불을 요청해 확인하는 중이에요. 처리가 끝나면 다음 정산에 포함돼요.</div>`, { cls: 'mb6' })}
        ${sum({ hold: true })}
        ${card('보류된 건', `
          <div class="list-row" style="align-items:flex-start"><span class="none" style="font-size:20px">⏸️</span>
            <div class="grow"><b>서예린 · 젤 아트(2P) · 8월 18일</b>
              <p class="t-sub mt1">고객이 “시술이 예약과 다르게 진행됐다”며 환불을 요청했어요 (8/20 접수)</p>
              <p class="t-sub mt1"><b>해제 조건</b> — 매장 소명 또는 고객 취소. 소명하시면 2영업일 안에 결론이 나요.</p>
              <p class="t-sub mt1"><b>예상 지급일</b> — <s class="muted">10월 10일</s> → 11월 10일로 밀릴 수 있어요</p></div>
            <div class="none btns" style="flex-direction:column">
              ${btn('소명하기', { cls: 'btn-primary btn-sm', attr: ' data-toast="소명 자료를 올리는 창을 엽니다"' })}
              ${btn('담당자 문의', { cls: 'btn-ghost btn-sm', attr: ' data-toast="정산 담당 1600-0000(내선 3) 으로 연결합니다"' })}</div></div>`,
          { cls: 'mb6' })}
        ${bar()}${table(head, rows(SETTLE), { fix: true, foot })}${accTpl}`,
      o: { ...OWNER, state: '정산 보류 건' },
    };
  }

  if (ctx.id === 'SA0103') {
    return {
      body: `${pageHd('정산 내역')}
        ${banner('danger', '🏦', `<b>정산 계좌가 등록되지 않아 돈을 보내드릴 수 없어요.</b>
          <div class="t-sub mt1"><b>10월 5일까지</b> 등록해 주세요. 그때까지 등록되지 않으면 이번 정산액은 다음 달로 넘어가요.</div>`,
          { cls: 'mb6', right: btn('계좌 등록하기', { cls: 'btn-primary', attr: ' data-modal="m-acc"' }) })}
        ${sum({ noAcc: true })}
        ${card('계좌 등록', `
          <div class="field"><div class="label">은행 <span class="req">*</span></div><select class="select"><option>골라주세요</option><option>국민은행</option><option>신한은행</option></select></div>
          <div class="field"><div class="label">계좌번호 <span class="req">*</span></div><input class="input" type="text" placeholder="- 없이 숫자만"></div>
          <div class="field"><div class="label">예금주 <span class="req">*</span></div><input class="input" type="text" placeholder="예금주명">
            <p class="hint">사업자등록증의 대표자명(<b>김수현</b>)과 같아야 해요. 다르면 사업자 통장 사본이 필요해요.</p></div>
          ${banner('mut', '🔒', '계좌 정보는 정산 목적으로만 쓰고 암호화해서 보관해요.', { cls: 'mt4' })}`,
          { ft: `<div class="btns">${btn('계좌 등록하기', { cls: 'btn-primary btn-block btn-lg', attr: ' data-toast="계좌를 등록했어요. 다음 정산부터 이 계좌로 보내드려요" data-toast-kind="ok"' })}</div>`, cls: 'mb6' })}
        ${bar()}${table(head, rows(SETTLE.slice(0, 5)), { fix: true })}${accTpl}`,
      o: { ...OWNER, state: '정산 계좌 미등록' },
    };
  }

  return {
    body: `${pageHd('정산 내역', '매월 10일에 전월 정산액을 보내드려요')}
      ${sum()}${bar({ right: '<span class="t-sub">7건 · 국민은행 123456-01-****67</span>' })}
      ${table(head, rows(SETTLE), { fix: true, foot })}
      ${banner('mut', 'ℹ️', '노쇼로 처리된 예약은 <b>예약금만</b> 정산돼요. 플랫폼 수수료는 결제 금액의 5%입니다.', { cls: 'mt4' })}
      ${accTpl}`,
    o: OWNER,
  };
}
export const SA0102 = SA0101, SA0103 = SA0101;

/* ============================================================
   SA0201 — 정산 내역 없음
   ============================================================ */
export function SA0201(ctx) {
  const bar = `<div class="row-b wrap-row mb6">
    <select class="select" style="width:auto"><option>2026년 8월</option><option>2026년 9월</option></select>
    ${btn('다른 기간 보기', { cls: 'btn-ghost', attr: ' data-toast="기간을 골라주세요"' })}</div>`;

  if (ctx.id === 'SA0202') {
    return {
      body: `${pageHd('정산 내역')}${bar}
        ${card('첫 정산은 이렇게 진행돼요', `${hsteps(['예약 완료', '정산 확정', '지급'], 0)}
          <div class="hr"></div>
          <div class="timeline">
            <div class="tl-item"><div class="tm">1단계</div><b>고객이 방문하고 시술이 끝나요</b>
              <p class="t-sub mt1">방문 완료로 처리하시면 정산 대상이 돼요</p></div>
            <div class="tl-item wait"><div class="tm muted">2단계</div><b class="muted">매월 말일에 그 달 정산액이 확정돼요</b>
              <p class="t-sub mt1">결제 금액에서 플랫폼 수수료 5%를 뺀 금액이에요</p></div>
            <div class="tl-item wait"><div class="tm muted">3단계</div><b class="muted">다음 달 10일에 등록하신 계좌로 보내드려요</b>
              <p class="t-sub mt1">10일이 주말·공휴일이면 그 다음 영업일에 보내요</p></div>
          </div>`, { cls: 'mb6' })}
        <div class="g2 g1-m mb6">
          ${card('수수료', `<div class="price-lg pri">5%</div><p class="t-sub mt2">예약이 완료된 건의 결제 금액 기준이에요. 월 이용료나 가입비는 없어요.</p>
            <div class="hr"></div><div class="t-sub">예를 들면</div>
            <p class="mt1">16만원 시술 → 수수료 8,000원 → <b>152,000원</b>을 받으세요</p>`)}
          ${card('정산 계좌', `<div class="row-c"><span style="font-size:22px">✅</span><b>등록 완료</b></div>
            <p class="t-sub mt2">국민은행 123456-01-****67 (김수현)</p>
            <div class="btns mt4">${btn('계좌 바꾸기', { cls: 'btn-ghost btn-block', href: 'SA0103' })}</div>`)}
        </div>
        ${banner('pri', '📅', '첫 예약이 9월에 완료되면 <b>10월 10일</b>에 첫 정산액을 보내드려요.')}`,
      o: { ...OWNER, state: '첫 정산 예정 안내' },
    };
  }

  return {
    body: `${pageHd('정산 내역')}${bar}
      <div class="card mb6"><div class="card-bd">${empty('🧾', '2026년 8월에는 정산 내역이 없어요',
        '이 기간에 완료된 예약이 없었어요. 다른 기간을 보시거나, 아래 항목을 확인해 보세요.',
        `${btn('다른 기간 보기', { cls: 'btn-primary btn-lg', attr: ' data-toast="기간을 골라주세요"' })}
         ${btn('정산 절차 보기', { cls: 'btn-ghost btn-lg', href: 'SA0202' })}`)}</div></div>
      ${banner('pri', '📅', '<b>매월 10일에 전월 정산액을 보내드려요.</b> 첫 예약이 완료되면 그 다음 달 10일이 첫 정산일이에요.', { cls: 'mb6' })}
      ${card('예약을 받으려면 확인하세요', `
        ${[['시술 메뉴가 등록돼 있나요?', '지금 12개 등록됨', 'MG0101', true],
           ['디자이너가 등록돼 있나요?', '재직 3명 · 휴직 1명', 'MG0201', true],
           ['근무 일정이 설정돼 있나요?', '최민서 디자이너 일정이 비어 있어요', 'MG0301', false],
           ['매장이 검색에 노출되나요?', '정상 노출 중', 'ST0302', true]].map(([q, a, go, ok]) =>
          `<div class="list-row"><span class="none" style="font-size:20px">${ok ? '✅' : '⚠️'}</span>
            <div class="grow"><b>${q}</b><p class="t-sub mt1 ${ok ? '' : 'danger'}">${a}</p></div>
            <div class="none">${btn(ok ? '확인' : '설정하기', { cls: ok ? 'btn-ghost btn-sm' : 'btn-primary btn-sm', href: go })}</div></div>`).join('')}`)}`,
    o: OWNER,
  };
}
export const SA0202 = SA0201;

/* ============================================================
   AU — 계정 (헤더 없는 단독 화면)
   ============================================================ */
const soloHead = (title, sub) => `<div class="center mb8">
  <a class="logo" href="${link('HO0101')}" style="justify-content:center;font-size:24px"><span class="mark">${SITE.mark}</span>${SITE.name}</a>
  <h1 class="t-sec mt6">${title}</h1>${sub ? `<p class="t-sub mt2">${sub}</p>` : ''}</div>`;

const socialBtns = (label = '로 로그인') => `<div class="social">
  <button class="btn s-kakao" type="button" data-toast="카카오 로그인 연결은 개발이 필요한 기능이에요">카카오${label}</button>
  <button class="btn s-naver" type="button" data-toast="네이버 로그인 연결은 개발이 필요한 기능이에요">네이버${label}</button>
  <button class="btn s-apple" type="button" data-toast="애플 로그인 연결은 개발이 필요한 기능이에요">Apple${label}</button></div>`;

export function AU0101(ctx) {
  return {
    body: `<div class="solo"><div class="solo-box">
      ${soloHead('다시 오셨네요', '예약하려면 로그인이 필요해요')}
      ${card('', `
        <div class="field"><div class="label">이메일</div><input class="input" type="email" value="jina@example.com" placeholder="you@example.com"></div>
        <div class="field"><div class="label">비밀번호</div><input class="input" type="password" value="12345678"></div>
        <div class="err" style="display:none">이메일이나 비밀번호가 맞지 않아요</div>
        <div class="row-b wrap-row mb4"><label class="check"><input type="checkbox" checked> 로그인 상태 유지</label>
          <a class="btn-link" href="${link('AU0501')}">비밀번호를 잊으셨나요?</a></div>
        ${btn('로그인', { cls: 'btn-primary btn-block btn-lg', href: 'HO0201' })}
        <div class="divider">또는</div>
        ${socialBtns()}`)}
      <p class="center mt6">아직 회원이 아니신가요? <a class="btn-link" href="${link('AU0201')}">회원가입</a></p>
      <p class="center mt4 t-sub">로그인하시면 보시던 화면으로 돌아가요.</p>
    </div></div>`,
    o: { solo: true, mainCls: 'p0', full: true },
  };
}

export function AU0201(ctx) {
  return {
    body: `<div class="solo"><div class="solo-box solo-lg">
      ${soloHead('회원가입', '3분이면 끝나요')}
      ${stepbar(['정보 입력', '휴대폰 인증', '완료'], 0)}
      ${card('', `
        ${socialBtns('로 간편 가입')}
        <div class="divider">또는 이메일로 가입</div>
        <div class="field"><div class="label">이메일 <span class="req">*</span></div>
          <input class="input" type="email" placeholder="you@example.com" value="jina@example.com">
          <p class="hint">예약 확인 메일을 이 주소로 보내드려요.</p>
          <div class="err" style="display:none">이미 가입된 이메일이에요. <a class="btn-link" href="${link('AU0101')}">로그인하시겠어요?</a></div></div>
        <div class="field"><div class="label">비밀번호 <span class="req">*</span></div>
          <input class="input" type="password" value="beauty2026">
          <div class="row-c mt2 t-sub" style="gap:12px;flex-wrap:wrap">
            <span class="success">✓ 8자 이상</span><span class="success">✓ 영문 포함</span><span class="success">✓ 숫자 포함</span></div></div>
        <div class="field"><div class="label">비밀번호 확인 <span class="req">*</span></div>
          <input class="input" type="password" value="beauty2026"><p class="ok">✓ 비밀번호가 같아요</p></div>
        <div class="field"><div class="label">닉네임 <span class="req">*</span></div>
          <input class="input" type="text" value="유진아"><p class="hint">리뷰에 <b>유*아</b>처럼 보여요.</p></div>
        <div class="field"><div class="label">휴대폰 번호 <span class="req">*</span></div>
          <input class="input" type="tel" value="010-1234-5678"><p class="hint">예약 확정·리마인더 문자를 보내드려요.</p></div>
        <div class="hr"></div>
        <label class="check" style="border-bottom:1px solid var(--border);padding-bottom:12px">
          <input type="checkbox" checked><span><b>전체 동의</b></span></label>
        ${[['이용약관', true], ['개인정보 처리방침', true], ['마케팅 정보 수신', false]].map(([t, req]) =>
          `<div class="row-b"><label class="check"><input type="checkbox"${req ? ' checked' : ''}>
            <span>${t} <span class="${req ? 'req' : 't-sub'}">${req ? '(필수)' : '(선택)'}</span></span></label>
            <button class="btn-link" type="button" data-toast="${t} 전문을 새 창에서 보여드려요">전문 보기</button></div>`).join('')}
        <div class="btns mt6">${btn('다음', { cls: 'btn-primary btn-block btn-lg', href: 'AU0301' })}</div>`)}
      <p class="center mt6">이미 회원이신가요? <a class="btn-link" href="${link('AU0101')}">로그인</a></p>
    </div></div>`,
    o: { solo: true, full: true },
  };
}

export function AU0301(ctx) {
  return {
    body: `<div class="solo"><div class="solo-box">
      ${soloHead('휴대폰 인증', '')}
      ${stepbar(['정보 입력', '휴대폰 인증', '완료'], 1)}
      ${card('', `
        <p class="center mb6"><b>010-1234-5678</b>로<br>인증번호 6자리를 보냈어요</p>
        <div class="code-in">${[1, 2, 3, 4, 5, 6].map((i) => `<input type="text" maxlength="1" value="${i <= 4 ? [8, 3, 1, 9][i - 1] : ''}" ${i === 5 ? 'autofocus' : ''}>`).join('')}</div>
        <p class="center mt4 t-sub">남은 시간 <b class="pri" data-count="180">3:00</b></p>
        <div class="btns mt6" style="justify-content:center">
          ${btn('인증번호 다시 받기', { cls: 'btn-ghost', attr: ' data-toast="인증번호를 다시 보냈어요 (하루 5회까지)"' })}
          ${btn('번호 바꾸기', { cls: 'btn-ghost', href: 'AU0201' })}</div>
        <div class="hr"></div>
        <p class="t-sub center">문자가 안 오나요? 스팸함을 확인하시거나, 통신사 스팸 차단 설정을 확인해 주세요.</p>
        <div class="btns mt6">${btn('인증 완료', { cls: 'btn-primary btn-block btn-lg', href: 'AU0401' })}</div>`)}
      <div class="mt6">${card('인증번호가 틀렸을 때', `
        <div class="code-in">${[1, 2, 3, 4, 5, 6].map(() => '<input class="is-err" type="text" maxlength="1" value="0">').join('')}</div>
        <p class="err center mt3">인증번호가 맞지 않아요. 다시 확인해 주세요. (2/5회)</p>
        <p class="t-sub center mt2">5회 틀리면 30분간 인증할 수 없어요.</p>`, { cls: 'box-mut' })}</div>
    </div></div>`,
    o: { solo: true, full: true },
  };
}

export function AU0401(ctx) {
  return {
    body: `<div class="solo"><div class="solo-box solo-lg">
      <div class="center mb8"><div style="font-size:64px">🎉</div>
        <h1 class="t-page mt3">유진아님, 가입을 환영해요</h1>
        <p class="t-sub mt2">이제 예약할 수 있어요</p></div>
      ${stepbar(['정보 입력', '휴대폰 인증', '완료'], 2)}
      <div class="coupon mb6"><div class="amt"><div class="v">20%</div><div class="t-sub">할인</div></div>
        <div class="bd"><b>신규 가입 축하 쿠폰</b>
          <p class="t-sub mt1">첫 예약에 쓸 수 있어요 · 3만원 이상 · 최대 1만원</p>
          <p class="t-sub mt1">2026년 10월 12일까지</p></div></div>
      ${card('관심 지역과 시술을 고르면 딱 맞는 매장을 추천해드려요', `
        <div class="field"><div class="label">자주 가는 지역</div>${chips(AREAS, [0])}</div>
        <div class="field"><div class="label">관심 있는 시술</div>${chips(CATS.map((c) => `${c.ic} ${c.nm}`), [3])}</div>
        <p class="hint">나중에 내 정보에서 언제든 바꿀 수 있어요.</p>`)}
      <div class="btns mt6">${btn('매장 둘러보기', { cls: 'btn-primary btn-block btn-lg', href: 'SE0101' })}</div>
      <p class="center mt4">매장을 운영하시나요? <a class="btn-link" href="${link('PT0201')}">입점 신청하기</a></p>
      ${banner('mut', '🔔', '예약 확정과 방문 하루 전 알림을 받으시려면 <b>알림을 허용</b>해 주세요.', { cls: 'mt8' })}
    </div></div>`,
    o: { solo: true, full: true },
  };
}

export function AU0501(ctx) {
  return {
    body: `<div class="solo"><div class="solo-box">
      ${soloHead('비밀번호 찾기', '가입하신 이메일을 알려주시면 재설정 링크를 보내드려요')}
      ${card('', `
        <div class="field"><div class="label">이메일</div><input class="input" type="email" placeholder="you@example.com" value="jina@example.com"></div>
        ${btn('재설정 메일 보내기', { cls: 'btn-primary btn-block btn-lg', attr: ' data-toast="재설정 메일을 보냈어요" data-toast-kind="ok"' })}`)}
      <div class="mt6">${card('메일을 보낸 뒤', `
        <div class="center" style="padding:8px 0"><div style="font-size:44px">📮</div>
          <p class="mt3"><b>jina@example.com</b>으로 보냈어요</p>
          <p class="t-sub mt2">메일 안의 링크를 눌러 새 비밀번호를 정해주세요. 링크는 30분 동안만 열려요.</p></div>
        <div class="hr"></div>
        <p class="t-sub">메일이 오지 않았나요? 스팸함을 확인해 보시고, 그래도 없으면 다시 보내주세요.</p>
        <div class="btns mt3">${btn('다시 보내기 (60초 뒤)', { cls: 'btn-ghost btn-block', off: true })}</div>`, { cls: 'box-mut' })}</div>
      <div class="mt6">${card('이런 안내가 뜰 수도 있어요', `
        ${banner('warn', '🔍', '<b>가입 이력이 없는 이메일이에요.</b><div class="t-sub mt1">오타가 없는지 확인해 보시거나, 다른 이메일로 가입하셨을 수 있어요.</div>', { cls: 'mb3' })}
        ${banner('acc', '💬', '<b>카카오로 가입하신 계정이에요.</b><div class="t-sub mt1">비밀번호 없이 카카오 버튼으로 로그인하시면 돼요.</div>')}`,
        { cls: 'box-mut' })}</div>
      <p class="center mt6"><a class="btn-link" href="${link('AU0101')}">로그인으로 돌아가기</a></p>
    </div></div>`,
    o: { solo: true, full: true },
  };
}
