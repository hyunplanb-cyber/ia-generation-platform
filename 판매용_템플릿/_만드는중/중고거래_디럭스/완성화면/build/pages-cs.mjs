/* CS 고객센터 — 자주 묻는 질문 / 1:1 문의 / 공지사항 상세 */
import * as U from './ui.mjs';
import { FAQS, FAQ_TABS, NOTICES, INQUIRIES, SITE, FEE_RATE } from './data.mjs';

/* ---------------- CS-01 자주 묻는 질문 ---------------- */
function CS01() {
  const 셈 = (c) => (c === '전체' ? FAQS.length : FAQS.filter((f) => f.c === c).length);
  const 많이본 = FAQS.filter((f) => f.hot).sort((a, b) => a.hot - b.hot);

  /* 답 안에 관련 화면으로 가는 길을 넣는다 — 「읽고 끝」이 아니라 다음 걸음이 있어야 한다 */
  const 링크 = {
    '안전결제는 무엇인가요?': ['안전거래 안내 보기', 'HO-03'],
    '수수료는 누가 내나요?': ['안전결제 시작하기', 'PA-01'],
    '직거래와 안전결제 중 무엇이 나은가요?': ['안전거래 안내 보기', 'HO-03'],
    '매너 점수는 어떻게 오르나요?': ['내 매너 온도 보기', 'MY-05'],
    '동네 인증은 왜 하나요?': ['내 동네 설정하기', 'SE-01'],
    '신고하면 어떻게 되나요?': ['신고하는 법 보기', 'CH-04'],
    '끌올은 얼마나 자주 할 수 있나요?': ['끌올하러 가기', 'BS-01'],
    '닉네임을 바꿀 수 있나요?': ['프로필 보기', 'MY-01'],
    '거래완료로 바꾸면 되돌릴 수 있나요?': ['내 판매글 보기', 'SL-05'],
    '차단하면 무엇이 막히나요?': ['신고·차단 화면 보기', 'CH-04'],
  };

  const 문답 = (f) => ({
    q: f.q,
    a: `<p>${f.a}</p>
      ${링크[f.q] ? `<div class="btns mt3">${U.btn(링크[f.q][0], { href: 링크[f.q][1], cls: 'btn-ghost btn-sm' })}</div>` : ''}
      <div class="row-c wrap-row mt4" style="gap:8px">
        <span class="t-sub">도움이 되었나요?</span>
        <button class="btn btn-ghost btn-xs" type="button" data-toast="고맙습니다 · 더 좋은 답을 만드는 데 쓸게요">예</button>
        <button class="btn btn-ghost btn-xs" type="button" data-toast="무엇이 부족했는지 알려주시면 고칠게요">아니요</button>
      </div>`,
  });

  const body = `
  ${U.pageHd('자주 묻는 질문', `모두 ${FAQS.length}개`)}

  <div class="searchbar lg mb4">
    <input class="in" type="search" placeholder="무엇이 궁금하세요?">
    <button class="btn btn-pri" type="button" data-toast="찾은 답을 보여드릴게요">찾기</button>
  </div>

  ${U.sec('많이 본 질문', `<div class="stack-sm">
    ${많이본.map((f, i) => `<a class="rank-row" href="${U.link('CS-01')}">
      <span class="no${i < 3 ? ' hot' : ''}">${i + 1}</span>
      <span class="w">${f.q}</span>
      <span class="d same">${f.c}</span></a>`).join('')}
  </div>`)}

  ${U.tabs(FAQ_TABS.map((c, i) => ({ label: c, cnt: 셈(c), pane: 'fq' + i })), 0)}

  <div class="mt4">
    ${FAQ_TABS.map((c, i) => {
    const 것들 = c === '전체' ? FAQS : FAQS.filter((f) => f.c === c);
    return `<div data-pane-body="fq${i}"${i === 0 ? '' : ' hidden'}>
      ${것들.length
        ? U.accordion(것들.map(문답), i === 0 ? 0 : -1)
        : U.empty('📭', '이 분류에는 아직 질문이 없어요', '', U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' }))}
    </div>`;
  }).join('')}
  </div>

  <div class="mt-block">${U.banner('info', '💬', `<b>찾는 답이 없나요?</b>
    <div class="t-sub mt1">평일 기준 하루 안에 답변드려요. 운영 시간 ${SITE.hours}</div>`,
    { right: U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri btn-sm' }) })}</div>
  `;
  return { body: U.article(body), o: {} };
}

/* ---------------- CS-02 1:1 문의 ---------------- */
function CS02() {
  const 종류 = [
    ['거래에 문제가 있어요', '거래 고르기'],
    ['안전결제', '거래 고르기'],
    ['신고 결과가 궁금해요', '신고번호 적기'],
    ['계정', ''],
    ['끌올·광고 결제', '결제 내역 고르기'],
    ['그 밖에', ''],
  ];

  const body = `
  ${U.pageHd('1:1 문의', '운영자가 직접 확인하고 답해드려요')}

  ${U.banner('info', '🔎', `<b>비슷한 질문이 이미 있을 수 있어요</b>
    <div class="t-sub mt1">자주 묻는 질문에서 먼저 찾아보시면 더 빠릅니다.</div>`,
    { right: U.btn('먼저 찾아보기', { href: 'CS-01', cls: 'btn-ghost btn-sm' }) })}

  <div class="mt-block">${U.card('무엇에 관한 문의인가요', `
    <select class="input" data-sel-show="ask">
      ${종류.map(([k], i) => `<option${i === 0 ? ' selected' : ''}>${k}</option>`).join('')}
    </select>
    <div class="sub-fld mt4" data-sel-case="ask" data-sel-when="거래에 문제가 있어요|안전결제">
      <span class="lb">어느 거래인가요</span>
      <div class="stack-sm">
        ${[['에어팟 프로 2세대', '민트초코', '178,000원', '9/5'],
      ['기계식 키보드 (적축)', '달빛창가', '62,000원', '9/3']]
      .map(([t, w, p, d], i) => `<label class="radio${i === 0 ? ' on' : ''}">
          <input type="radio" name="deal"${i === 0 ? ' checked' : ''}>
          <b>${t}</b> <span class="t-sub">${w} · ${p} · ${d}</span></label>`).join('')}
      </div>
      <p class="t-sub mt2">고르시면 그 거래 내용이 문의에 자동으로 붙어요.</p>
    </div>

    <div class="sub-fld mt4" data-sel-case="ask" data-sel-when="신고 결과가 궁금해요" hidden>
      <label class="lb" for="rno">신고번호</label>
      <input class="input" id="rno" type="text" placeholder="예: R-2418">
      <p class="t-sub mt2">신고하실 때 받으신 접수번호를 적어 주세요. 알림에서 확인할 수 있어요.</p>
    </div>

    <div class="sub-fld mt4" data-sel-case="ask" data-sel-when="끌올·광고 결제" hidden>
      <span class="lb">어느 결제인가요</span>
      <select class="input"><option>9/5 · 하루 상단 고정 · 5,000원</option><option>9/2 · 즉시 끌올 · 1,500원</option><option>8/28 · 일주일 상단 고정 · 25,000원</option></select>
      <p class="t-sub mt2">고르시면 그 결제 내역이 문의에 자동으로 붙어요.</p>
    </div>

    <div class="sub-fld mt4" data-sel-case="ask" data-sel-when="계정" hidden>
      <span class="lb">어떤 계정 문제인가요</span>
      <div class="stack-sm">
        ${['로그인이 안 돼요', '닉네임을 바꾸고 싶어요', '계정을 지우고 싶어요', '동네 인증이 안 돼요']
      .map((k, i) => `<label class="radio${i === 0 ? ' on' : ''}"><input type="radio" name="acct"${i === 0 ? ' checked' : ''}>${k}</label>`).join('')}
      </div>
    </div>`)}</div>

  <div class="mt-block">${U.card('무슨 일인가요', `
    <div class="fld"><label class="lb" for="ti">제목</label>
      <input class="input" id="ti" type="text" placeholder="한 줄로 적어 주세요"></div>
    <div class="fld"><label class="lb" for="bd">내용</label>
      <textarea class="input" id="bd" rows="7" placeholder="언제 어떤 일이 있었는지 적어 주세요. 자세할수록 빨리 답해드릴 수 있어요."></textarea>
      <p class="t-sub mt1 right">0 / 2000</p></div>
    <div class="fld">
      <span class="lb">파일 붙이기</span>
      <div class="photo-grid">
        <button class="photo-add" type="button" data-toast="파일을 골라 주세요 (최대 5개 · 한 개 10MB)">
          <span style="font-size:22px">＋</span><span>파일 추가</span></button>
      </div>
      <p class="t-sub mt2">캡처를 붙여 주시면 확인이 훨씬 빨라요.</p>
    </div>`)}</div>

  <div class="mt-block">${U.card('답변을 어디로 받을까요', `
    ${[['앱 알림', true], ['이메일', true], ['문자', false]].map(([k, on]) =>
      `<label class="check"><input type="checkbox"${on ? ' checked' : ''}><span>${k}</span></label>`).join('')}
    <p class="t-sub mt3">평일 기준 <b>하루 안에</b> 답변드려요. 주말·공휴일은 다음 영업일에 답합니다.</p>`)}</div>

  <div class="btns center mt-block">
    ${U.btn('보내기', { cls: 'btn-pri btn-lg', attr: ' data-toast="문의를 보냈어요 · 답변이 오면 알려드릴게요"' })}
  </div>

  ${U.sec('보낸 문의', `<div class="stack-sm">
    ${INQUIRIES.map((q) => `<div class="cond-row">
      <span class="grow"><b>${q.t}</b><br><span class="t-sub">${q.kind} · ${q.at}</span></span>
      ${U.badge(q.st, q.st === '답변 완료' ? 'b-ok' : 'b-warn')}
      ${q.st === '답변 완료'
      ? `<button class="btn btn-ghost btn-sm" type="button" data-modal="ans">답변 보기</button>`
      : `<span class="t-sub">기다리는 중</span>`}
    </div>`).join('')}
  </div>`)}

  ${U.modal('ans', '문의와 답변', `
    <div class="talk-wrap" style="min-height:auto">
      <div class="bub me"><b>안전결제 정산이 안 왔어요</b><br>
        9월 1일에 구매확정이 됐는데 아직 입금이 안 됐습니다. 확인 부탁드립니다.
        <span class="when">9/4</span></div>
      <div class="bub">확인해 보니 등록하신 계좌의 예금주명이 회원 정보와 달라 보류돼 있었습니다.
        마이페이지에서 계좌를 다시 등록해 주시면 다음 영업일에 처리됩니다. 불편을 드려 죄송합니다.
        <span class="when">9/4 · 운영자 박서준</span></div>
    </div>
    <div class="fld mt3"><label class="lb" for="more2">이어서 물어보기</label>
      <textarea class="input" id="more2" rows="3" placeholder="더 궁금한 것이 있으면 적어 주세요"></textarea></div>
    <div class="mt3">${U.rateIn('답변이 도움이 되었나요', 0)}</div>`,
    U.btn('닫기', { cls: 'btn-ghost', attr: ' data-dismiss' })
    + U.btn('해결됐어요', { cls: 'btn-pri', attr: ' data-dismiss data-toast="문의를 닫았어요 · 고맙습니다"' }))}
  `;
  return { body: U.article(body), o: {} };
}

/* ---------------- CS-03 공지사항 상세 ---------------- */
function CS03() {
  const n = NOTICES[0];
  const 관련 = NOTICES.filter((x) => x.c === n.c && x.id !== n.id).slice(0, 5);

  const body = `
  <div class="page-hd">
    <div class="row-c wrap-row mb2">${U.badge(n.c, 'b-mut')}${U.badge('중요', 'b-pri')}</div>
    <h1 class="t-page">${U.esc(n.t)}</h1>
    <p class="t-sub mt2">${n.at} · 조회 ${U.num(n.hit)}</p>
  </div>

  ${U.banner('warn', '📅', `<b>2026-10-01 부터 바뀝니다</b>
    <div class="t-sub mt1">오늘부터 <b>24일</b> 남았어요. 그전까지는 지금 규칙이 그대로 적용됩니다.</div>`)}

  <div class="mt-block">
    <h2 class="t-sec">무엇이 바뀌나요</h2>
    <div class="mt3">${U.table(
    [{ t: '' , w: '26%' }, { t: '지금' }, { t: '10월 1일부터' }],
    [
      ['안전결제 수수료', `${(FEE_RATE * 100).toFixed(1)}%`, `<b>3.0%</b> (내립니다)`],
      ['정산 주기', '구매확정 뒤 7영업일', '<b>구매확정 뒤 5영업일</b>'],
      ['자동 구매확정', '배송 완료 뒤 7일', '배송 완료 뒤 7일 (그대로)'],
      ['무료 끌올', '24시간에 1회', '24시간에 1회 (그대로)'],
      ['판매글 유효기간', '30일', '<b>45일</b> (늘립니다)'],
    ])}</div>

    <h2 class="t-sec mt-block">왜 바꾸나요</h2>
    <p class="mt3">안전결제를 쓰시는 분이 늘면서 운영 비용이 줄었습니다. 줄어든 만큼 수수료를 내리고
    정산도 이틀 앞당깁니다. 판매글이 30일 만에 내려가 다시 올리는 것이 번거롭다는 말씀이 많아
    유효기간도 45일로 늘립니다.</p>

    <h2 class="t-sec mt-block">이미 하고 있는 거래는요</h2>
    <p class="mt3">9월 30일까지 결제된 거래는 <b>지금 규칙</b>이 그대로 적용됩니다.
    10월 1일 0시 이후 결제분부터 새 수수료와 정산 주기가 적용됩니다.
    지금 올려 두신 판매글의 유효기간도 10월 1일에 자동으로 45일 기준으로 다시 계산됩니다.</p>

    <h2 class="t-sec mt-block">더 궁금하시면</h2>
    <p class="mt3">자주 묻는 질문의 「안전결제」 분류에 더 자세히 적어 두었습니다.
    그래도 궁금한 것이 있으면 1:1 문의로 알려 주세요.</p>
  </div>

  <div class="mt-block">${U.card('붙임 파일', `<div class="stack-sm">
    ${[['개정 약관 전문.pdf', '412KB'], ['수수료 비교표.xlsx', '38KB']].map(([f, s]) =>
    `<div class="cond-row"><span class="grow">📎 ${f}</span><span class="t-sub">${s}</span>
      ${U.btn('내려받기', { cls: 'btn-ghost btn-sm', attr: ` data-toast="${f} 를 내려받았어요"` })}</div>`).join('')}
  </div>`)}</div>

  <div class="row-b wrap-row mt-block">
    ${U.btn('‹ 이전 공지', { cls: 'btn-ghost', attr: ' data-toast="「추석 연휴 고객센터 운영 안내」로 넘어갑니다"' })}
    ${U.btn('목록으로', { href: 'HO-04', cls: 'btn-ghost' })}
    ${U.btn('다음 공지 ›', { cls: 'btn-ghost', attr: ' data-toast="「허위 매물 집중 단속 안내」로 넘어갑니다"' })}
  </div>

  ${U.accordion([{
    q: `관련 공지 ${관련.length}건`,
    a: `<div class="stack-sm">${관련.map((x) => `<a class="cond-row" href="${U.link('CS-03')}">
      <span class="grow">${U.esc(x.t)}</span><span class="t-sub">${x.at}</span></a>`).join('')}</div>`,
  }], -1)}

  <div class="mt-block">${U.banner('info', '💬', `<b>이 공지에 관해 궁금한 점이 있나요?</b>`,
    { right: U.btn('문의하기', { href: 'CS-02', cls: 'btn-ghost btn-sm' }) })}</div>
  `;
  return { body: U.article(body), o: {} };
}

export const PAGES = { 'CS-01': CS01, 'CS-02': CS02, 'CS-03': CS03 };
