/* PR 고수센터 — 홈(대시보드) / 등록 신청 / 심사 중 / 활동 설정 / 프로필·포트폴리오 */
import * as U from './ui.mjs';
import { PRO, LEADS, REVIEWS, CATS } from './data.mjs';

/* 최근 30일 성사 추이 — 막대로만 그린다(도표 라이브러리를 쓰지 않는다) */
const chart = (vals, o = {}) => `<div class="row" style="gap:3px;align-items:flex-end;height:${o.h || 120}px">
  ${vals.map((v, i) => `<div class="grow" title="${v}건" style="background:${i >= vals.length - 3 ? 'var(--primary)' : 'var(--pri-10)'};
    height:${Math.round(v / Math.max(...vals) * 100)}%;border-radius:3px 3px 0 0;min-height:3px"></div>`).join('')}
</div>`;

/* ---------------- PR-01 고수센터 홈 ---------------- */
function PR01(ctx) {
  const p = PRO('p1');
  const trend = [2, 1, 3, 2, 4, 3, 1, 2, 5, 3, 2, 4, 3, 6, 2, 3, 4, 2, 5, 3, 4, 2, 3, 5, 4, 3, 6, 4, 5, 7];

  const body = U.proPage('PR-01', `
  ${U.pageHd('고수센터', '한결이사님, 오늘 할 일이 6개 있어요',
    `<div class="btns">${U.btn('새 요청 보기', { href: 'LD-01', cls: 'btn-pri' })}${U.btn('활동 설정', { href: 'PR-04', cls: 'btn-ghost' })}</div>`)}

  ${U.statRow([
    ['12건', '오늘 들어온 새 요청', { cls: 'pri', d: '<span class="pri">▲ 어제보다 3건 많아요</span>' }],
    ['8건', '이번 주 보낸 견적', { d: '<span class="muted">크레딧 26 사용</span>' }],
    ['34%', '성사율', { d: '<span class="success">▲ 지난달 29%</span>' }],
    ['2,840,000원', '이번 달 수입', { cls: 'acc', d: '<span class="muted">정산 예정 1,452,000원</span>' }],
  ])}

  <div class="split-r mt-block" style="grid-template-columns:minmax(0,1fr) 320px">
    <div>
      ${U.card('오늘 할 일', `<div class="col" style="gap:var(--sp-item)">
        ${[['📨', '견적 보낼 요청', '5건', '마감이 가까운 건이 2개 있어요', 'LD-01', 'btn-pri'],
    ['💬', '답장 안 한 채팅', '2건', '가장 오래된 건 4시간 전이에요', 'JB-01', 'btn-ghost'],
    ['🚚', '오늘 방문', '1건', '이O진님 · 09:00 · 서초구 반포동', 'JB-02', 'btn-ghost']]
      .map(([ic, t, n, d, go, cls]) => `<div class="row-b wrap-row" style="padding:var(--s3) 0;border-bottom:1px solid var(--border)">
        <div class="row-c"><span style="font-size:20px">${ic}</span>
          <div><b>${t} <span class="pri">${n}</span></b><div class="t-sub">${d}</div></div></div>
        <a class="btn ${cls} btn-sm" href="${U.link(go)}">보기</a></div>`).join('')}
      </div>`)}

      <div class="mt-block">${U.card('최근 30일 성사 추이', `
        ${chart(trend)}
        <div class="row-b mt3"><span class="t-sub">7월 8일</span><span class="t-sub">오늘</span></div>
        <div class="mt-block">${U.kv([
      ['30일 성사', '<b>103건</b>'],
      ['보낸 견적', '<b>301건</b>'],
      ['성사율', '<b class="pri">34%</b>'],
      ['평균 견적가', '<b>276,000원</b>'],
    ])}</div>`)}</div>

      <div class="mt-block">${U.card('최근 받은 후기', REVIEWS.slice(3, 6).map((r) =>
      U.review(r, { pro: false, act: false })).join(''), {
        aside: `<span class="row-c">${U.stars(4.9)}<b>4.9</b><span class="t-sub">(328)</span></span>`,
      })}</div>
    </div>

    <div class="sticky">
      ${U.card('남은 크레딧', `
        <div class="row-b"><div><div class="big">42</div><div class="t-sub">이번 달 58 사용</div></div>
          <span style="font-size:30px">🪙</span></div>
        <div class="mt4">${U.progress(42, 'acc')}</div>
        <p class="t-sub mt2">견적 14건을 더 보낼 수 있어요. 이대로면 <b class="acc">4일 뒤</b> 바닥납니다.</p>
        <div class="btns mt-block">${U.btn('크레딧 충전', { href: 'LD-04', cls: 'btn-pri btn-block' })}</div>`, { cls: 'acc' })}

      <div class="mt4">${U.card('내 노출 상태', `
        <div class="center" style="padding:var(--s3) 0">
          <div class="big pri">4위</div>
          <div class="t-sub">강남구 · 이사 분야 (184명 중)</div>
        </div>
        <div class="mt4">${U.kv([
      ['평점', `${U.stars(p.r)} <b>${p.r.toFixed(1)}</b>`],
      ['응답률', '<b class="warn">89%</b>'],
      ['평균 응답', '<b>41분</b>'],
      ['프로필 완성도', '<b>72%</b>'],
    ])}</div>
        <button class="link mt3" type="button" data-toast="순위를 올리는 방법 안내가 열려요">순위를 올리는 방법 ›</button>`)}</div>

      <div class="mt4">${U.banner('warn', '⚠️', `<b>응답률이 90% 아래로 떨어졌어요</b>
        <div class="t-sub mt1">응답률이 낮으면 목록에서 뒤로 밀립니다. 90%를 넘기려면 앞으로 들어오는 요청 <b>3건</b>에 답하시면 돼요.
        답하기 어려운 요청은 ‘관심 없음’으로 눌러 두셔도 응답률에 반영됩니다.</div>`)}</div>

      <div class="mt4">${U.card('빠른 실행', `<div class="btns col">
        ${U.btn('새 요청 목록', { href: 'LD-01', cls: 'btn-ghost btn-block btn-sm' })}
        ${U.btn('일감 관리', { href: 'JB-01', cls: 'btn-ghost btn-block btn-sm' })}
        ${U.btn('정산 내역', { href: 'JB-03', cls: 'btn-ghost btn-block btn-sm' })}
        ${U.btn('프로필 고치기', { href: 'PR-05', cls: 'btn-ghost btn-block btn-sm' })}
      </div>`)}</div>
    </div>
  </div>`);

  return { body, o: { wrapCls: 'wrap-wide' } };
}

/* ---------------- PR-02 고수 등록 신청 ---------------- */
function PR02(ctx) {
  const main = `
  <div class="g3 mb6">
    ${[['🔍', '무엇을 보나요', '활동명·전문 분야·경력을 봅니다. 자격증이나 사업자등록증이 있으면 인증 배지가 붙어 더 잘 보여요.'],
    ['⏱', '얼마나 걸리나요', '보통 2~3영업일입니다. 서류가 흐리게 찍혔거나 빠진 게 있으면 보완을 요청드려요.'],
    ['💰', '어떻게 버나요', '등록·광고비는 없습니다. 견적을 보낼 때 크레딧을 쓰고, 성사되면 수수료 12%를 냅니다.']]
    .map(([ic, t, d]) => `<div class="box"><div style="font-size:22px">${ic}</div>
      <h3 class="t-card mt2">${t}</h3><p class="t-sub mt1">${d}</p></div>`).join('')}
  </div>

  ${U.card('기본 정보', `
    <div class="field"><label class="lb">활동명<span class="req">*</span></label>
      <input class="input" placeholder="손님에게 보이는 이름이에요 (예: 한결이사)">
      <p class="help">실명이 아니어도 됩니다. 나중에 바꾸면 쌓인 후기가 그대로 따라옵니다.</p></div>
    <div class="field"><label class="lb">한 줄 소개<span class="req">*</span></label>
      <input class="input" placeholder="예: 15년 경력, 원룸·가정 이사 전문">
      <p class="help">목록에서 이름 바로 아래 보이는 문장이에요. 40자 이내로 적어 주세요.</p></div>
    <div class="field" style="margin-bottom:0"><label class="lb">전문 분야<span class="req">*</span> <span class="t-sub">(여러 개 고를 수 있어요)</span></label>
      ${U.chips(CATS.slice(0, 8).map((c) => c.nm), [0, 3])}
      <p class="help">고른 분야의 요청만 받아요. 나중에 활동 설정에서 바꿀 수 있어요.</p></div>`)}

  <div class="mt-block">${U.card('경력과 증빙', `
    <div class="field"><label class="lb">경력<span class="req">*</span></label>
      <div class="inline"><input class="input" placeholder="15" style="max-width:120px"><span class="t-sub">년</span>
        <input class="input grow" placeholder="어디서 무엇을 하셨는지 짧게 적어 주세요"></div></div>
    <div class="field" style="margin-bottom:0"><label class="lb">자격·경력 증빙</label>
      <div class="drop"><div class="ic">📄</div><b>자격증·수료증·경력증명서를 올려 주세요</b>
        <p class="t-sub mt2">PDF·JPG·PNG · 장당 10MB · 최대 5개</p></div>
      <p class="help">필수는 아니지만, 올리시면 ‘자격증 확인’ 배지가 붙어 견적 성사율이 평균 1.4배 높아요.</p></div>`)}</div>

  <div class="mt-block">${U.card('사업자 여부', `
    <div class="g2 mb4">
      ${[['사업자예요', '세금계산서를 끊을 수 있고 사업자 배지가 붙어요', true], ['개인이에요', '개인도 활동할 수 있어요. 3.3% 원천징수됩니다', false]]
    .map(([t, d, on]) => `<button class="radio${on ? ' on' : ''}" type="button" data-group="biz"><b>${t}</b><span class="d">${d}</span></button>`).join('')}
    </div>
    <div class="g2 mb4">
      <div><label class="lb">상호</label><input class="input" placeholder="사업자등록증에 적힌 그대로"></div>
      <div><label class="lb">사업자등록번호</label><input class="input" placeholder="000-00-00000"></div>
    </div>
    <label class="lb">사업자등록증</label>
    <div class="drop"><div class="ic">🏢</div><b>사업자등록증 사본을 올려 주세요</b>
      <p class="t-sub mt2">글자가 또렷하게 보이도록 찍어 주세요</p></div>`)}</div>

  <div class="mt-block">${U.card('신원 확인', `
    <div class="row-b wrap-row" style="padding:var(--s3) 0;border-bottom:1px solid var(--border)">
      <div><b>휴대폰 본인 확인</b><div class="t-sub mt1">010-****-1234 · 2026-08-06 확인</div></div>
      ${U.verify('확인 완료')}
    </div>
    <div class="row-b wrap-row" style="padding:var(--s3) 0">
      <div><b>신분증 확인</b><div class="t-sub mt1">주민등록증·운전면허증·여권 중 하나</div></div>
      ${U.btn('신분증 올리기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="사진 고르기 창이 열려요"' })}
    </div>
    ${U.banner('quiet', '🔒', '신분증은 확인이 끝나면 즉시 지웁니다. 손님에게 보이지 않고, 확인 여부만 배지로 표시됩니다.')}`)}</div>

  <div class="mt-block">${U.card('활동 지역', `
    <div class="g2">
      <div class="map">
        <span class="pin on" style="left:44%;top:42%" data-name="강남구"></span>
        <span class="pin" style="left:28%;top:58%" data-name="서초구"></span>
        <span class="pin" style="left:62%;top:36%" data-name="송파구"></span>
        지도 영역 (구 단위 선택 · 권장 800×600)
      </div>
      <div>
        <label class="lb">구 단위로 골라 주세요</label>
        <select class="input mb3"><option>서울특별시</option><option>경기도</option></select>
        <div class="chips">${['강남구', '서초구', '송파구', '강동구', '용산구', '마포구', '성동구', '광진구']
    .map((nm, i) => U.chip(nm, i < 3)).join('')}</div>
        <p class="help">고른 지역의 요청만 받아요. 멀리 나가시려면 출장비를 따로 설정할 수 있어요.</p>
      </div>
    </div>`)}</div>

  <div class="mt-block">${U.card('정산 계좌', `
    <div class="g3">
      <div><label class="lb">은행</label><select class="input"><option>은행을 고르세요</option><option>국민</option><option>신한</option><option>하나</option></select></div>
      <div><label class="lb">계좌번호</label><input class="input" placeholder="- 없이 숫자만"></div>
      <div><label class="lb">예금주</label><input class="input" placeholder="본인 명의만 가능"></div>
    </div>
    <p class="help">신원 확인에 쓴 이름과 예금주가 같아야 해요. 다르면 정산이 보류됩니다.</p>`)}</div>

  <div class="mt-block">${U.card('약관 동의', `
    <label class="check box mb3" data-agree-all data-unlock="submit"><input type="checkbox"><span><b>전체 동의</b></span></label>
    <div data-agree-scope>
      ${[['고수 이용약관 (필수)', '견적·수수료·정산 규정이 들어 있어요'],
    ['개인정보 수집·이용 동의 (필수)', '신원 확인과 정산을 위해 씁니다'],
    ['정산 정보 제3자 제공 동의 (필수)', '세금 신고를 위해 국세청에 제출됩니다'],
    ['마케팅 정보 수신 (선택)', '요청이 몰리는 시기를 미리 알려드려요']]
      .map(([t, d]) => `<div class="row-b" style="padding:var(--s2) 0">
        <label class="check"><input type="checkbox" data-agree><span>${t}<div class="t-sub mt1">${d}</div></span></label>
        <button class="link quiet" type="button" data-toast="약관 전문이 열려요">전문 보기</button></div>`).join('')}
    </div>`)}</div>`;

  const aside = `
  ${U.card('작성 현황', `
    <div class="row-b mb2"><b>72% 채웠어요</b><span class="t-sub">8 / 11</span></div>
    ${U.progress(72)}
    <div class="col mt-block" style="gap:var(--s2)">
      ${[['기본 정보', true], ['전문 분야', true], ['경력', true], ['자격 증빙', false],
    ['사업자등록증', true], ['휴대폰 확인', true], ['신분증', false], ['활동 지역', true],
    ['정산 계좌', false], ['약관 동의', true], ['프로필 사진', true]]
      .map(([t, ok]) => `<div class="row-c" style="font-size:13px">
        <span style="color:${ok ? 'var(--success)' : 'var(--border)'};flex:none">${ok ? '✓' : '○'}</span>
        <span class="${ok ? '' : 'muted'}">${t}</span></div>`).join('')}
    </div>
    <div class="btns col mt-block">
      ${U.btn('임시 저장', { cls: 'btn-ghost btn-block', attr: ' data-toast="여기까지 저장했어요. 나중에 이어서 쓰실 수 있어요"' })}
      ${U.btn('심사 신청하기', { href: 'PR-03', cls: 'btn-pri btn-lg btn-block' })}
    </div>
    <p class="t-sub mt3 center">신청 후 2~3영업일 안에 알려드려요</p>`, { cls: 'pri' })}

  <div class="mt4">${U.box(`<h4 class="t-card mb2">이런 건 반려돼요</h4>
    <div class="col" style="gap:var(--sp-item)">
      <div class="t-sub">· 서류 글자가 안 읽힐 만큼 흐린 사진</div>
      <div class="t-sub">· 예금주와 신원 확인 이름이 다른 경우</div>
      <div class="t-sub">· 한 줄 소개에 연락처·외부 링크를 넣은 경우</div>
      <div class="t-sub">· 남의 작업 사진을 포트폴리오로 올린 경우</div>
    </div>`, { cls: 'soft' })}</div>`;

  const body = `${U.pageHd('고수로 등록하기', '일이 필요한 분을 여기서 만나세요. 등록·광고비는 없습니다.')}${U.detail2(main, aside)}`;
  return { body, o: { pro: false } };
}

/* ---------------- PR-03 고수 등록 - 심사 중 ---------------- */
function PR03(ctx) {
  const body = `
  ${U.pageHd('등록 심사 현황', '접수한 신청서를 확인하고 있어요')}

  ${U.card('', `
    ${U.hsteps(['접수 완료', '서류 확인', '신원 확인', '승인'], 1)}
    <div class="row-b wrap-row mt-block" style="padding-top:var(--sp-block);border-top:1px solid var(--border)">
      <div><div class="t-sub">접수 일시</div><b>2026년 8월 6일 (목) 11:20</b></div>
      <div><div class="t-sub">예상 완료</div><b class="pri">2026년 8월 9일 (일)</b></div>
      <div><div class="t-sub">현재 단계</div><b>서류 확인 중</b></div>
    </div>`)}

  <div class="mt-block">${U.banner('warn', '📎', `<b>보완이 필요해요 — 사업자등록증을 다시 올려 주세요</b>
    <div class="t-sub mt1">올려주신 사진이 흐려 <b>사업자등록번호가 읽히지 않습니다.</b> 밝은 곳에서 정면으로 다시 찍어 올려 주세요.
    보완 서류를 받은 뒤 1영업일 안에 확인해 드립니다. (요청일 2026-08-07)</div>`,
    { right: U.btn('다시 제출하기', { href: 'PR-02', cls: 'btn-acc' }) })}</div>

  <div class="split-r mt-block">
    <div>
      ${U.card('제출한 내용', U.kv([
    ['활동명', '한결이사'],
    ['한 줄 소개', '15년 경력, 원룸·가정 이사 전문'],
    ['전문 분야', '이사 · 수리·설치'],
    ['경력', '15년 · 한결운송 대표'],
    ['사업자', '있음 · 123-45-67890'],
    ['활동 지역', '강남구 · 서초구 · 송파구'],
    ['정산 계좌', '국민 ****-**-**1234 · 김O결'],
  ], { cls: 'left' }), { aside: `<a class="more" href="${U.link('PR-02')}">지원서 다시 보기 ›</a>` })}

      <div class="mt-block">${U.card('제출한 서류', U.table(
    [{ t: '서류' }, { t: '올린 날' }, { t: '상태' }],
    [
      ['사업자등록증', '2026-08-06', U.badge('보완 요청', 'b-warn')],
      ['화물운송종사 자격증', '2026-08-06', U.badge('확인 완료', 'b-ok')],
      ['신분증', '2026-08-06', U.badge('확인 중', 'b-pri')],
      ['경력증명서', '2026-08-06', U.badge('확인 완료', 'b-ok')],
    ],
  ), { bdCls: 'flush' })}</div>
    </div>

    <div class="sticky">
      ${U.card('승인되면 이런 것이 열려요', `<div class="col" style="gap:var(--sp-item)">
        ${[['📨', '요청 받기', '조건에 맞는 새 요청이 실시간으로 들어와요'],
      ['💸', '견적 보내기', '값과 일정을 담아 손님에게 직접 제안해요'],
      ['👤', '프로필 노출', '고수 목록과 검색 결과에 나옵니다'],
      ['📊', '고수센터', '성사율·수입·정산을 한눈에 봐요']]
      .map(([ic, t, d]) => `<div class="row" style="gap:var(--s3)">
        <span style="font-size:18px;flex:none">${ic}</span>
        <div><b>${t}</b><div class="t-sub mt1">${d}</div></div></div>`).join('')}
      </div>`, { cls: 'pri' })}

      <div class="mt4">${U.box(`<h4 class="t-card mb2">심사 중에는</h4>
        <p class="t-sub">요청을 받거나 견적을 보낼 수 없어요. 손님 화면은 그대로 쓰실 수 있습니다.</p>
        <div class="btns mt-block">${U.btn('손님 화면으로', { href: 'HO-02', cls: 'btn-ghost btn-block btn-sm' })}</div>`, { cls: 'soft' })}</div>

      <div class="mt4"><button class="link quiet" type="button" data-toast="신청을 취소할까요? 확인 창이 열려요">신청 취소하기</button>
        <p class="t-sub mt2">취소하시면 올린 서류가 모두 지워지고, 다시 신청하려면 처음부터 써야 해요.</p></div>
    </div>
  </div>

  <div class="btns center mt-block">${U.btn('고수센터 미리 보기', { href: 'PR-01', cls: 'btn-ghost' })}</div>`;

  return { body, o: { pro: false } };
}

/* ---------------- PR-04 활동 설정 ---------------- */
function PR04(ctx) {
  const note = (t) => `<p class="t-sub mt2" style="color:var(--pri-text)">💡 ${t}</p>`;

  const body = U.proPage('PR-04', `
  ${U.pageHd('활동 설정', '어떤 요청을 받을지, 언제 답할 수 있는지 정해 두세요',
    U.btn('저장', { cls: 'btn-pri', attr: ' data-toast="설정을 저장했어요" data-toast-kind="ok"' }))}

  ${U.card('제공 서비스와 시작가', `
    ${U.table([{ t: '서비스', w: '46%' }, { t: '시작가', w: '30%' }, { t: '', w: '80px' }], [
    ['원룸·소형 이사', '<input class="input" value="180,000">', '<button class="btn btn-ghost btn-xs" type="button" data-toast="줄을 지웠어요">삭제</button>'],
    ['가정 이사(반포장)', '<input class="input" value="420,000">', '<button class="btn btn-ghost btn-xs" type="button" data-toast="줄을 지웠어요">삭제</button>'],
    ['가정 이사(포장)', '<input class="input" value="680,000">', '<button class="btn btn-ghost btn-xs" type="button" data-toast="줄을 지웠어요">삭제</button>'],
    ['사무실 이사', '<input class="input" value="1,200,000">', '<button class="btn btn-ghost btn-xs" type="button" data-toast="줄을 지웠어요">삭제</button>'],
  ], { fix: true })}
    <div class="btns mt3">${U.btn('＋ 서비스 추가', { cls: 'btn-ghost btn-sm', attr: ' data-toast="빈 줄을 하나 넣었어요"' })}</div>
    ${note('시작가를 적어 두면 목록에 “180,000원~”으로 보여요. 값을 적지 않으면 목록에서 뒤로 밀립니다.')}`)}

  <div class="mt-block">${U.card('활동 지역', `
    <div class="g2">
      <div class="map">
        <div class="zone" style="left:22%;top:20%;width:56%;height:60%"></div>
        <span class="pin on" style="left:44%;top:42%" data-name="강남구"></span>
        <span class="pin" style="left:28%;top:58%" data-name="서초구"></span>
        <span class="pin" style="left:62%;top:36%" data-name="송파구"></span>
        지도 영역 (활동 반경 · 권장 800×600)
      </div>
      <div>
        <label class="lb">받을 지역</label>
        <div class="chips mb4">${['강남구', '서초구', '송파구', '강동구', '용산구', '성동구']
    .map((nm, i) => U.chip(nm, i < 3)).join('')}</div>
        <label class="lb">출장 가능 거리</label>
        <div class="slider"><div class="fill" style="left:0;right:52%"></div><span class="kn" style="left:calc(48% - 9px)"></span></div>
        <div class="row-b t-sub"><span>0km</span><b style="color:var(--text)">24km</b><span>50km</span></div>
        ${note('지역을 3곳에서 5곳으로 늘리면 들어오는 요청이 평균 1.7배 많아져요.')}
      </div>
    </div>`)}</div>

  <div class="mt-block">${U.card('요청 받을 조건', `
    <div class="g3 mb4">
      <div><label class="lb">예산 하한</label><input class="input" value="100,000">
        <p class="help">이보다 낮은 예산의 요청은 안 받아요</p></div>
      <div><label class="lb">최소 규모</label><select class="input"><option>제한 없음</option><option>원룸 이상</option><option>20평 이상</option></select></div>
      <div><label class="lb">하루 최대 요청 수</label><select class="input"><option>제한 없음</option><option>10건</option><option>5건</option></select></div>
    </div>
    <label class="lb">받지 않을 유형</label>
    <div class="chips">${['당일 요청', '보관 이사', '피아노 포함', '5층 이상 승강기 없음', '반려동물 동반']
    .map((nm, i) => U.chip(nm, i === 0 || i === 3)).join('')}</div>
    ${note('조건을 좁힐수록 들어오는 요청이 줄어요. 지금 조건이면 하루 평균 12건이 들어옵니다.')}`)}</div>

  <div class="mt-block">${U.card('응답 가능 시간', `
    ${U.table([{ t: '요일', w: '20%' }, { t: '시작' }, { t: '종료' }, { t: '쉬는 날', w: '18%' }],
    ['월', '화', '수', '목', '금', '토', '일'].map((d) => [
      `<b>${d}</b>`,
      `<select class="input"><option>08:00</option><option>09:00</option></select>`,
      `<select class="input"><option>20:00</option><option>18:00</option></select>`,
      `<label class="check"><input type="checkbox"${d === '수' ? ' checked' : ''}><span class="t-sub">쉼</span></label>`,
    ]), { fix: true })}
    <div class="mt4"><label class="lb">특정 날짜 휴무</label>
      <div class="chips">${U.chip('2026-09-14 (추석)', true)}${U.chip('2026-09-15 (추석)', true)}
        <button class="btn btn-ghost btn-sm" type="button" data-toast="달력이 열려요">＋ 날짜 추가</button></div></div>
    ${note('응답 가능 시간 밖에 들어온 요청도 목록에는 쌓여요. 다만 “지금 답할 수 있는 고수” 필터에서는 빠집니다.')}`)}</div>

  <div class="mt-block">${U.card('자동 응답 문구', `
    <textarea class="input" placeholder="요청이 들어오면 손님에게 자동으로 보낼 첫 인사">안녕하세요, 한결이사입니다. 요청 잘 받았습니다. 사진을 보내주시면 더 정확한 값을 알려드릴 수 있어요. 보통 30분 안에 견적을 보내드립니다.</textarea>
    ${note('자동 응답을 켜 두면 응답률이 올라가요. 다만 이것만으로는 견적을 보낸 것으로 치지 않습니다.')}`)}</div>

  <div class="mt-block">${U.card('휴식 모드', `
    <div class="toggle-row">
      <div><b>새 요청 받지 않기</b>
        <div class="t-sub mt1">켜면 새 요청이 들어오지 않고, 목록에서 ‘지금 쉬는 중’으로 보여요.
        진행 중인 일감과 채팅은 그대로 쓸 수 있습니다.</div></div>
      <button class="toggle" type="button" data-toast="휴식 모드를 켜면 새 요청이 들어오지 않아요"></button>
    </div>
    ${U.banner('warn', '⚠️', '휴식 모드가 <b>7일 넘게</b> 이어지면 목록 순위가 내려갑니다. 짧게 쉬실 때만 쓰세요.')}`, { cls: 'tape warn' })}</div>

  <div class="btns mt-block">
    ${U.btn('설정 저장', { cls: 'btn-pri btn-lg', attr: ' data-toast="설정을 저장했어요" data-toast-kind="ok"' })}
    ${U.btn('고수센터로', { href: 'PR-01', cls: 'btn-ghost' })}
  </div>`);

  return { body, o: {} };
}

/* ---------------- PR-05 프로필·포트폴리오 관리 ---------------- */
function PR05(ctx) {
  const works = [
    ['원룸 포장 이사 (역삼동)', '반나절', '18~22만원'],
    ['가정 이사 24평 (대치동)', '하루', '65~80만원'],
    ['사무실 이사 40석 (삼성동)', '하루', '150~180만원'],
    ['사다리차 5층 작업 (논현동)', '3시간', '25~30만원'],
    ['보관 이사 2주 (서초동)', '2회 방문', '55~70만원'],
    ['용달 소량 운반 (양재동)', '2시간', '7~10만원'],
  ];

  const main = `
  ${U.card('프로필', `
    <div class="row-c wrap-row mb6">
      ${U.phPro(96, 'p1')}
      <div>
        <div class="btns">${U.btn('사진 바꾸기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="사진 고르기 창이 열려요"' })}
          ${U.btn('지우기', { cls: 'btn-quiet btn-sm', attr: ' data-toast="사진을 지웠어요"' })}</div>
        <p class="t-sub mt2">정사각 400×400 이상 · 얼굴이나 작업 모습이 보이면 성사율이 높아요</p>
      </div>
    </div>
    <div class="field"><label class="lb">활동명</label><input class="input" value="한결이사"></div>
    <div class="field" style="margin-bottom:0"><label class="lb">한 줄 소개</label>
      <input class="input" value="15년 경력, 원룸·가정 이사 전문">
      <p class="help">목록에서 이름 아래 보여요 · 40자 이내</p></div>`)}

  <div class="mt-block">${U.card('자기소개', `
    <div class="row-c mb2" style="gap:4px;padding-bottom:var(--s2);border-bottom:1px solid var(--border)">
      ${['B', 'I', 'U', '≡', '•', '🔗'].map((t) => `<button class="btn btn-quiet btn-xs" type="button" data-toast="글자 꾸미기">${t}</button>`).join('')}
    </div>
    <textarea class="input" style="min-height:220px">15년 동안 이사만 했습니다. 원룸부터 사무실까지 해봤지만, 가장 자신 있는 건 승강기 없는 건물의 원룸 이사입니다.

짐을 옮기는 것보다 안 깨뜨리는 게 더 어렵습니다. 그래서 포장 자재는 제가 직접 골라 씁니다. 유리·도자기·모니터는 따로 싸고, 옷장 분해가 필요하면 미리 말씀 주시면 공구를 챙겨 갑니다.</textarea>
    <div class="row-b mt2"><span class="t-sub">연락처·외부 링크는 넣을 수 없어요</span><span class="t-sub">312 / 3000</span></div>`)}</div>

  <div class="mt-block">${U.card('포트폴리오', `
    <div class="drop mb4"><div class="ic">📷</div><b>작업 사진을 끌어다 놓으세요</b>
      <p class="t-sub mt2">4:3 비율 권장 · 최대 30장 · 장당 10MB</p></div>
    <p class="t-sub mb3">카드를 끌어서 순서를 바꿀 수 있어요. 맨 앞 3장이 프로필에 크게 보입니다.</p>
    <div class="gal">${works.map(([t, d, c], i) => `<div class="it">
      <div style="position:relative">
        ${U.phWork('pf' + i, { tiny: true })}
        <span class="badge b-pri" style="position:absolute;top:6px;left:6px">${i + 1}</span>
        <button class="btn btn-quiet btn-xs" type="button" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.55);color:#fff" data-toast="사진을 지웠어요">✕</button>
        <span style="position:absolute;bottom:6px;left:6px;background:rgba(0,0,0,.5);color:#fff;border-radius:6px;padding:2px 7px;font-size:11px">⠿ 끌어서 이동</span>
      </div>
      <div class="cap mt2">
        <input class="input" value="${t}" style="height:34px;font-size:13px">
        <div class="row mt1" style="gap:6px">
          <input class="input" value="${d}" style="height:32px;font-size:12px">
          <input class="input" value="${c}" style="height:32px;font-size:12px">
        </div>
      </div></div>`).join('')}</div>`)}</div>

  <div class="mt-block">${U.card('자격증·인증 배지', U.table(
    [{ t: '항목' }, { t: '올린 날' }, { t: '상태' }, { t: '', w: '110px' }],
    [
      ['사업자등록증', '2026-08-06', U.badge('승인됨', 'b-ok'), '<button class="btn btn-ghost btn-xs" type="button" data-toast="다시 올리는 창이 열려요">다시 올리기</button>'],
      ['화물운송종사 자격증', '2026-08-06', U.badge('승인됨', 'b-ok'), '<button class="btn btn-ghost btn-xs" type="button" data-toast="다시 올리는 창이 열려요">다시 올리기</button>'],
      ['운송물 배상책임보험', '2026-08-05', U.badge('심사 중', 'b-warn'), '<span class="t-sub">1~2일</span>'],
      ['정리수납 1급', '2026-07-20', U.badge('반려', 'b-dan'), '<button class="btn btn-ghost btn-xs" type="button" data-toast="반려 사유: 발급기관을 확인할 수 없어요">사유 보기</button>'],
    ],
  ) + `<div class="btns mt3">${U.btn('＋ 인증 서류 올리기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="서류 고르기 창이 열려요"' })}</div>`,
    { bdCls: '' })}</div>`;

  const aside = `
  ${U.card('프로필 완성도', `
    <div class="row-b mb2"><b class="big pri">72%</b><span class="t-sub">8 / 11</span></div>
    ${U.progress(72)}
    <p class="t-sub mt3">완성도가 높을수록 목록에서 앞에 나와요.</p>
    <div class="col mt-block" style="gap:var(--s2)">
      ${[['프로필 사진', true], ['한 줄 소개', true], ['자기소개 200자 이상', true],
    ['전문 분야', true], ['시작가', true], ['활동 지역', true],
    ['포트폴리오 3장 이상', true], ['자격증 1개 이상', true],
    ['보험 등록', false], ['응답 시간 설정', false], ['자동 응답 문구', false]]
      .map(([t, ok]) => `<div class="row-c" style="font-size:13px">
        <span style="color:${ok ? 'var(--success)' : 'var(--acc-text)'};flex:none">${ok ? '✓' : '○'}</span>
        <span class="${ok ? '' : 'strong'}">${t}</span></div>`).join('')}
    </div>
    <p class="t-sub mt3">남은 3개를 채우면 완성도 100%가 돼요.</p>`, { cls: 'pri' })}

  <div class="mt4">${U.card('손님이 보는 화면', `
    <p class="t-sub">고친 내용이 손님에게 어떻게 보이는지 확인해 보세요.</p>
    <div class="btns col mt-block">
      ${U.btn('미리 보기', { href: 'SE-03', cls: 'btn-pri btn-block' })}
      ${U.btn('포트폴리오 화면', { href: 'SE-04', cls: 'btn-ghost btn-block btn-sm' })}
    </div>`)}</div>

  <div class="mt4">${U.box(`<h4 class="t-card mb2">성사율을 올리려면</h4>
    <div class="col" style="gap:var(--sp-item)">
      <div class="t-sub">· 포트폴리오 사진에 <b>실제 현장</b>을 넣으세요</div>
      <div class="t-sub">· 작업명에 <b>평수·층수</b>를 적으면 신뢰가 높아져요</div>
      <div class="t-sub">· 비용대를 적어 두면 예산이 안 맞는 문의가 줄어요</div>
    </div>`, { cls: 'soft' })}</div>`;

  const body = `
  ${U.pageHd('프로필·포트폴리오', '손님이 고수를 고를 때 가장 오래 보는 화면이에요',
    U.btn('저장', { cls: 'btn-pri', attr: ' data-toast="프로필을 저장했어요" data-toast-kind="ok"' }))}
  ${U.detail2(main, aside)}`;

  return { body, o: {} };
}

export const PAGES = { 'PR-01': PR01, 'PR-02': PR02, 'PR-03': PR03, 'PR-04': PR04, 'PR-05': PR05 };
