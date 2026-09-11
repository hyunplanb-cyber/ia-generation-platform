/* CS 고객센터 — 15화면.
     CS0101~0105 자주 묻는 질문 (기준 + 분류 탭 · 검색 결과 · 답 펼치기 · 도움 여부 투표)
     CS0201~0205 1:1 문의       (기준 + 종류별 입력 · 거래 자동 채움 · 첨부 초과 · 답변 완료)
     CS0301~0305 공지사항 상세  (기준 + 시행일 안내 · 규칙 비교 표 · 이전·다음 · 첨부 파일)

   ⚠ 레이아웃 B 대시보드형 —
     · 화면 위쪽은 «지표 카드 4장»(kpis). 히어로를 두지 않는다.
     · 목록은 표(dashTable). 상태는 글자가 아니라 stBadge().
     · 상세는 좌 본문 + 우 액션 패널(detailSplit). 상태를 바꾸는 단추는 «전부» 우측 패널로.
     스펙팩 prompt 에 「본문 폭을 좁혀」라고 적힌 것이 있어도, 뼈대를 정하는 것은
     팩에 함께 나가는 레이아웃 프리셋이다. 둘이 다른 말을 하면 안 된다.

   ⚠ 링크는 짧은 이름(HO-03)이나 이 팩의 화면 이름(CS0204)으로 적고 link() 에 맡긴다.
   ⚠ 탭과 몸통은 «같은 상자» 안에 둔다. 속성은 data-pane / data-pane-body 다.
   ⛔ 잠글 단추에는 href 를 주지 않는다 — <a> 에는 disabled 가 없다(ui.mjs 가 멈춘다). */
import * as U from './ui.mjs';
import {
  FAQS, FAQ_TABS, NOTICES, INQUIRIES, SITE, FEE_RATE,
  CS_TODAY, CS_DDAY, CS_DESK, CS_FAQ_LINK, CS_SEARCH,
  CS_INQ_KINDS, CS_INQ_DEALS, CS_INQ_PAYS, CS_INQ_ACCT,
  CS_ATTACH, CS_ATTACH_MAX, CS_ANSWER, CS_RULE_ROWS, CS_RULE_CHANGED, CS_FILES,
} from './data.mjs';

/* ═══════════════ 자주 묻는 질문 (CS01) ═══════════════ */

const 셈 = (c) => (c === '전체' ? FAQS.length : FAQS.filter((f) => f.c === c).length);
const 많이본 = FAQS.filter((f) => f.hot).sort((a, b) => a.hot - b.hot);
const 답변대기 = INQUIRIES.filter((q) => q.st !== '답변 완료').length;

/* 「도움이 됐어요」 수 — 같은 질문이면 화면이 달라도 같은 수가 나오게 질문 글자에서 뽑는다.
   화면마다 손으로 적으면 CS0101 과 CS0104 에서 다른 수가 나온다. */
const 도움수 = (q) => 40 + (q.split('').reduce((a, c) => a + c.charCodeAt(0), 0) * 7) % 160;

/* 찾은 글자에 형광펜 — .hl 은 밑에 깔리는 형광펜 줄이다 */
const 강조 = (s, w) => U.esc(s).split(w).join(`<mark class="hl">${U.esc(w)}</mark>`);

const faqKpis = () => U.kpis([
  ['올라와 있는 질문', U.num(FAQS.length), { unit: '개', d: `분류 ${FAQ_TABS.length - 1}가지로 나눠 두었어요` }],
  ['많이 본 질문', U.num(많이본.length), { unit: '개', tone: 'k-acc', d: '이번 주에 가장 많이 열어 본 답', href: 'CS0104' }],
  ['평균 답변 시간', U.num(CS_DESK.avgHours), { unit: '시간', tone: 'k-ok', d: `1:1 문의는 ${CS_DESK.promise}` }],
  ['내가 보낸 문의', U.num(INQUIRIES.length), { unit: '건', tone: 'k-warn', d: `답변 기다리는 중 ${답변대기}건`, href: 'CS-02' }],
]);

/** 답 아래 「도움이 되었나요?」 줄.
   mode 없음 = 아직 안 누른 상태 · 'yes' = 예를 누른 뒤(중복 차단) · 'no' = 아니요를 누른 뒤 */
function 투표(f, mode) {
  const 수 = 도움수(f.q);
  if (mode === 'yes') {
    return `<div class="banner banner-ok mt4"><span class="ico">✓</span><div class="grow">
      <b>도움이 되었다고 알려 주셨어요.</b>
      <div class="t-sub mt1">투표는 질문마다 한 번만 할 수 있어요. 지금까지 ${U.num(수 + 1)}명이 도움이 됐다고 했어요.</div></div>
      <div class="btns">
        <button class="btn btn-ghost btn-xs" type="button" disabled>👍 예</button>
        <button class="btn btn-ghost btn-xs" type="button" disabled>👎 아니요</button>
      </div></div>`;
  }
  if (mode === 'no') {
    return `<div class="banner banner-warn mt4"><span class="ico">👎</span><div class="grow">
      <b>무엇이 부족했나요?</b>
      <div class="t-sub mt1">고를수록 답을 고치기 쉬워져요. 한 가지만 골라도 됩니다.</div></div></div>
      <div class="sub-fld mt3">
        ${['답이 내 상황과 달라요', '설명이 어려워요', '어디로 가야 하는지 모르겠어요', '내용이 예전 것 같아요', '답이 너무 짧아요']
      .map((k, i) => `<label class="check"><input type="checkbox"${i === 2 ? ' checked' : ''}><span>${k}</span></label>`).join('')}
        <div class="fld mt3"><label class="lb" for="why-${수}">더 적어 주실 것이 있나요</label>
          <textarea class="input" id="why-${수}" rows="2" placeholder="한 줄이면 충분해요"></textarea></div>
        <div class="btns">
          ${U.btn('보내고 1:1 문의하기', { href: 'CS-02', cls: 'btn-pri btn-sm' })}
          ${U.btn('보내기만 하기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="알려 주셔서 고맙습니다 · 답을 고치는 데 쓸게요"' })}
        </div>
        <p class="t-sub mt2">투표는 질문마다 한 번만 할 수 있어요. 다시 누르면 바뀌지 않습니다.</p>
      </div>`;
  }
  return `<div class="row-c wrap-row mt4" style="gap:8px">
    <span class="t-sub">도움이 되었나요?</span>
    ${U.btn('👍 예', { href: 'CS0105', cls: 'btn-ghost btn-xs' })}
    ${U.btn('👎 아니요', { href: 'CS0105', cls: 'btn-ghost btn-xs' })}
    <span class="t-sub">지금까지 ${U.num(수)}명이 도움이 됐다고 했어요</span>
  </div>`;
}

/** 답 한 덩이 — 답 글 · 관련 화면으로 가는 길 · 도움 여부 투표 */
function 답(f, mode, 찾는말) {
  const 길 = CS_FAQ_LINK[f.q];
  return `<p>${찾는말 ? 강조(f.a, 찾는말) : U.esc(f.a)}</p>
    ${길 ? `<div class="btns mt3">${U.btn(길[0] + ' ›', { href: 길[1], cls: 'btn-ghost btn-sm' })}</div>` : ''}
    ${투표(f, mode)}`;
}

/** 분류 탭 + 몸통. ⚠ 탭(.tabs)과 몸통([data-pane-body])은 «같은 상자» 안에 둔다 —
   app.js 는 눌린 탭의 부모 안에서만 몸통을 찾는다. */
function faqTabs(onIdx, openIdx = -1, votes = {}, 찾는말 = '') {
  return `<div>
  ${U.tabs(FAQ_TABS.map((c, i) => ({ label: c, cnt: 셈(c), pane: 'fq' + i })), onIdx)}
  <div class="mt4">
    ${FAQ_TABS.map((c, i) => {
    const 것들 = c === '전체' ? FAQS : FAQS.filter((f) => f.c === c);
    const 속 = 것들.length
      ? U.accordion(것들.map((f, j) => ({
        q: `<span class="grow">${U.badge(f.c, 'b-mut')} ${찾는말 ? 강조(f.q, 찾는말) : U.esc(f.q)}</span>`,
        a: 답(f, i === onIdx ? (votes[j] || '') : '', 찾는말),
      })), i === onIdx ? openIdx : -1)
      : U.empty('📭', '이 분류에는 아직 질문이 없어요', '가장 비슷한 질문을 다른 분류에서 찾아보시거나, 바로 물어보세요.',
        U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' }));
    return `<div data-pane-body="fq${i}"${i === onIdx ? '' : ' hidden'}>${속}</div>`;
  }).join('')}
  </div></div>`;
}

/** 검색칸 — 값이 있으면 그 말로 찾아 놓은 모습 */
const faqSearch = (value = '') => `<div class="searchbar lg">
  <span class="ic">🔍</span>
  <input type="search" placeholder="무엇이 궁금하세요? (예: 안전결제 수수료)" aria-label="자주 묻는 질문 검색"${value ? ` value="${U.esc(value)}"` : ''}>
  ${U.btn('찾기', { href: 'CS0103', cls: 'btn-pri' })}
</div>`;

/** 맨 아래 안내 띠 — 운영 시간과 답변까지 걸리는 시간 */
const faqFoot = () => U.sec('', U.banner('info', '💬', `<b>찾는 답이 없나요? 운영자가 직접 답해드려요.</b>
  <div class="t-sub mt1">${CS_DESK.promise}에 답해드려요(최근 평균 ${CS_DESK.avgHours}시간). ${CS_DESK.note}
  <br>전화 ${SITE.tel} · ${SITE.hours}</div>`,
  { right: U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri btn-sm' }) }));

/** 많이 본 질문 상위 5개 — 누르면 그 답이 펼쳐진 화면으로 간다 */
const faqTop = () => U.sec('많이 본 질문', U.card('', `<div>
  ${많이본.map((f, i) => `<a class="rank-row" href="${U.link('CS0104')}">
    <span class="no${i < 3 ? ' hot' : ''}">${i + 1}</span>
    <span class="w">${U.esc(f.q)}</span>
    <span class="d">${U.badge(f.c, 'b-mut')}</span>
    <span class="d same">👍 ${U.num(도움수(f.q))}</span></a>`).join('')}
</div>`, { bdCls: 'p0' }), { aside: '<span class="t-sub">이번 주 기준</span>' });

/** 고객센터에서 나가는 길 — 공지·안전거래 안내로 이어 준다 */
const faqLinks = () => U.sec('최근 공지', U.card('', `<div class="notice-list">
  ${NOTICES.slice(0, 3).map((n) => `<a class="notice-row${n.imp ? ' imp' : ''}" href="${U.link('CS0301')}">
    <span>${U.badge(n.c, n.c === '이벤트' ? 'b-acc' : 'b-pri')}</span>
    <span class="t">${U.esc(n.t)}</span>
    <span class="at">${n.at}</span>
    <span class="hit">${U.num(n.hit)}</span></a>`).join('')}
</div>`, { bdCls: 'p0' }), { more: 'HO-04', moreLabel: '공지·이벤트 전체' });

/* ---------------- CS0101 자주 묻는 질문 ---------------- */
function CS0101() {
  const body = `
${U.pageHd('자주 묻는 질문', `궁금한 것을 먼저 찾아보세요 · 질문 ${U.num(FAQS.length)}개`,
    `<div class="btns">${U.btn('안전거래 안내 보기', { href: 'HO-03', cls: 'btn-ghost' })}${U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' })}</div>`)}

${faqKpis()}

${U.sec('무엇이 궁금하세요', `${faqSearch()}
  <div class="row-c wrap-row mt3" style="gap:6px">
    <span class="t-sub">많이 찾는 말</span>
    ${U.chips(['안전결제 수수료', '정산 언제', '동네 인증', '끌올', '차단'], -1, { extra: ` data-go="${U.link('CS0103')}"` })}
  </div>`, { desc: '찾은 글자는 질문과 답 안에서 형광펜으로 보여 드려요. 결과가 없으면 바로 문의로 이어집니다.' })}

${faqTop()}

${U.sec('분류별로 보기', faqTabs(0, 0), {
    aside: `<a class="more" href="${U.link('CS0102')}">분류 탭 자세히 ›</a>`,
  })}

${faqLinks()}

${faqFoot()}
`;
  return { body, o: {} };
}

/* ---------------- CS0102 자주 묻는 질문 > 분류 탭 ---------------- */
function CS0102() {
  const body = `
${U.pageHd('자주 묻는 질문', '분류 탭 — 「안전결제」를 고른 모습',
    `<div class="btns">${U.btn('자주 묻는 질문 처음으로', { href: 'CS-01', cls: 'btn-ghost' })}${U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' })}</div>`)}

${faqKpis()}

${U.sec('무엇이 궁금하세요', faqSearch())}

${U.sec('', U.banner('acc', '🗂', `<b>지금 「안전결제」 분류를 보고 있어요.</b>
  <div class="t-sub mt1">탭마다 옆의 숫자가 그 분류에 있는 질문 수예요.
  고른 탭은 다른 화면에 갔다 와도 그대로 열려 있습니다 — 처음부터 다시 고르지 않아도 돼요.</div>`))}

${U.sec('분류별로 보기', faqTabs(2, 0), {
    aside: `<span class="t-sub">전체 ${U.num(FAQS.length)}개 가운데 ${U.num(셈('안전결제'))}개</span>`,
  })}

${U.sec('분류마다 몇 개인가요', U.dashTable(
    [{ t: '분류' }, { t: '질문 수', w: '110px' }, { t: '가장 많이 본 질문' }, { t: '', w: '96px' }],
    FAQ_TABS.slice(1).map((c) => {
      const 첫 = FAQS.filter((f) => f.c === c).sort((a, b) => (a.hot || 99) - (b.hot || 99))[0];
      return [
        `<b>${U.esc(c)}</b>`,
        `${U.num(셈(c))}개`,
        `<span class="t-sub">${U.esc(첫 ? 첫.q : '—')}</span>`,
        U.btn('보기', { href: 'CS0104', cls: 'btn-ghost btn-xs' }),
      ];
    }),
  ))}

${faqFoot()}
`;
  return { body, o: {} };
}

/* ---------------- CS0103 자주 묻는 질문 > 검색 결과 ---------------- */
function CS0103() {
  const 말 = CS_SEARCH.fixed;
  const 맞은것 = FAQS.filter((f) => f.q.includes(말) || f.a.includes(말) || f.c.includes(말));

  const body = `
${U.pageHd('자주 묻는 질문', `「${U.esc(CS_SEARCH.typed)}」로 찾은 결과`,
    `<div class="btns">${U.btn('검색 지우기', { href: 'CS-01', cls: 'btn-ghost' })}${U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' })}</div>`)}

${U.kpis([
    ['찾은 답', U.num(맞은것.length), { unit: '개', d: `「${U.esc(말)}」이(가) 들어 있는 질문과 답` }],
    ['찾은 말', `${U.esc(말)}`, { tone: 'k-acc', d: `「${U.esc(CS_SEARCH.typed)}」을(를) 고쳐서 찾았어요` }],
    ['올라와 있는 질문', U.num(FAQS.length), { unit: '개', tone: 'k-mut', d: '모든 분류를 통틀어', href: 'CS-01' }],
    ['평균 답변 시간', U.num(CS_DESK.avgHours), { unit: '시간', tone: 'k-ok', d: `못 찾으면 ${CS_DESK.promise}에 답해드려요`, href: 'CS-02' }],
  ])}

${U.sec('무엇이 궁금하세요', faqSearch(CS_SEARCH.typed))}

${U.sec('', U.banner('quiet', '↩', `혹시 <b>「${U.esc(말)}」</b>을(를) 찾으셨나요? 그렇게 고쳐서 찾은 결과예요.`,
    { right: U.btn(`「${U.esc(CS_SEARCH.typed)}」 그대로 찾기`, { cls: 'btn-ghost btn-sm', attr: ` data-toast="「${U.esc(CS_SEARCH.typed)}」로는 찾은 답이 없어요"` }) }))}

${U.sec(`찾은 답 ${U.num(맞은것.length)}개`, U.accordion(맞은것.map((f, i) => ({
    q: `<span class="grow">${U.badge(f.c, 'b-mut')} ${강조(f.q, 말)}</span>`,
    a: 답(f, '', 말),
  })), 0), { aside: '<span class="t-sub">찾은 글자는 형광펜으로 칠했어요</span>' })}

${U.sec(`「${U.esc(CS_SEARCH.noHit)}」처럼 찾은 답이 없을 때는 이렇게 보여요`, U.card('', `
  ${U.empty('🔍', `「${U.esc(CS_SEARCH.noHit)}」로 찾은 답이 없어요`,
    '중고거래 장터는 회원끼리 사고파는 곳이라 제조사 무상수리는 다루지 않아요.<br>비슷한 말로 다시 찾아보시거나, 바로 물어보세요.',
    `${U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' })}${U.btn('안전거래 안내 보기', { href: 'HO-03', cls: 'btn-ghost' })}`)}
  <div class="divider"></div>
  <p class="t-th mb2">이렇게 찾아보시면 어때요</p>
  ${U.chips(['설명과 다른 물건', '환불', '반품', '하자'], -1, { extra: ` data-go="${U.link('CS0103')}"` })}
`))}

${faqFoot()}
`;
  return { body, o: {} };
}

/* ---------------- CS0104 자주 묻는 질문 > 답 펼치기 ---------------- */
function CS0104() {
  const body = `
${U.pageHd('자주 묻는 질문', '질문을 누르면 답이 펼쳐집니다',
    `<div class="btns">${U.btn('자주 묻는 질문 처음으로', { href: 'CS-01', cls: 'btn-ghost' })}${U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' })}</div>`)}

${faqKpis()}

${U.sec('무엇이 궁금하세요', faqSearch())}

${U.sec('', U.banner('info', '👆', `<b>지금 답 두 개가 펼쳐져 있어요.</b>
  <div class="t-sub mt1">질문 줄을 한 번 더 누르면 다시 접힙니다. 여러 개를 한꺼번에 펼쳐 두고 견줘 볼 수도 있어요.
  답 안의 파란 단추를 누르면 그 일을 하는 화면으로 바로 갑니다.</div>`))}

${U.sec('분류별로 보기', faqTabs(0, [0, 2]), {
    aside: '<span class="t-sub">펼친 답 2개</span>',
  })}

${faqTop()}

${faqFoot()}
`;
  return { body, o: {} };
}

/* ---------------- CS0105 자주 묻는 질문 > 도움 여부 투표 ---------------- */
function CS0105() {
  const body = `
${U.pageHd('자주 묻는 질문', '도움이 되었는지 알려 주신 뒤의 모습',
    `<div class="btns">${U.btn('자주 묻는 질문 처음으로', { href: 'CS-01', cls: 'btn-ghost' })}${U.btn('1:1 문의하기', { href: 'CS-02', cls: 'btn-pri' })}</div>`)}

${faqKpis()}

${U.sec('', U.banner('ok', '🗳', `<b>투표해 주셔서 고맙습니다.</b>
  <div class="t-sub mt1">투표는 질문마다 한 번만 할 수 있어요 — 이미 누른 질문의 단추는 잠깁니다.
  「아니요」를 고르시면 무엇이 부족했는지 묻고, 그대로 1:1 문의로 이어 드려요.</div>`))}

${U.sec('분류별로 보기', faqTabs(0, [0, 2], { 0: 'yes', 2: 'no' }), {
    aside: '<span class="t-sub">첫 질문은 「예」 · 세 번째 질문은 「아니요」를 고른 모습</span>',
  })}

${U.sec('이 투표는 어디에 쓰이나요', U.card('', `
  ${U.kv([
    ['모으는 것', '질문마다 「도움됐다 / 아쉽다」 수와, 아쉽다를 고른 까닭'],
    ['보는 사람', '고객센터 운영자 — 매주 아쉽다가 많은 질문부터 답을 고칩니다'],
    ['한 번만 세는 까닭', '같은 사람이 여러 번 눌러 수를 부풀리지 못하게 막아요'],
    ['답을 고치면', '그 질문을 봤던 분께는 알리지 않아요. 다시 찾아오시면 고쳐진 답이 보입니다'],
  ])}`))}

${faqFoot()}
`;
  return { body, o: {} };
}

/* ═══════════════ 1:1 문의 (CS02) ═══════════════ */

const 문의kpis = (o = {}) => U.kpis([
  ['보낸 문의', U.num(INQUIRIES.length), { unit: '건', d: '최근 30일' }],
  ['답변 완료', U.num(INQUIRIES.length - 답변대기), { unit: '건', tone: 'k-ok', d: `평균 ${CS_DESK.avgHours}시간 만에 답했어요`, href: 'CS0205' }],
  ['기다리는 중', U.num(답변대기), { unit: '건', tone: 'k-warn', d: `접수 뒤 ${CS_DESK.promise}에 답해드려요` }],
  ['자주 묻는 질문', U.num(FAQS.length), { unit: '개', tone: 'k-mut', d: o.faqDesc || '먼저 찾아보시면 더 빨라요', href: 'CS-01' }],
]);

/** 문의 종류 고르개 — 고른 값에 따라 아래 딸린 칸이 열리고 닫힌다(app.js 의 data-sel-show). */
function 종류고르개(선택 = '거래에 문제가 있어요') {
  return `<select class="input" data-sel-show="ask" aria-label="문의 종류">
    ${CS_INQ_KINDS.map(({ k }) => `<option${k === 선택 ? ' selected' : ''}>${k}</option>`).join('')}
  </select>`;
}

/** 거래 고르기 칸 — 고르면 요약 카드가 자동으로 붙는다 */
function 거래칸(선택 = 0, o = {}) {
  const 열림 = o.when || '거래에 문제가 있어요|안전결제';
  return `<div class="sub-fld mt4" data-sel-case="ask" data-sel-when="${열림}"${o.hidden ? ' hidden' : ''}>
    <span class="lb">어느 거래인가요</span>
    <div class="stack-sm">
      ${CS_INQ_DEALS.map((d, i) => `<label class="radio${i === 선택 ? ' on' : ''}">
        <input type="radio" name="deal"${i === 선택 ? ' checked' : ''}>
        <b>${U.esc(d.t)}</b>
        <span class="d">${U.esc(d.who)} · ${U.won(d.price)} · ${d.at} · ${d.way}</span></label>`).join('')}
    </div>
    <p class="t-sub mt2">고르시면 그 거래의 매물·상대·금액·날짜가 문의에 자동으로 붙어요.</p>
    <div class="btns mt3">${U.btn('거래 골라 붙이기', { href: 'CS0203', cls: 'btn-ghost btn-sm' })}</div>
  </div>`;
}

/** 신고번호 칸 */
function 신고칸(o = {}) {
  return `<div class="sub-fld mt4" data-sel-case="ask" data-sel-when="신고 결과가 궁금해요"${o.hidden ? ' hidden' : ''}>
    <div class="fld"><label class="lb" for="rno">신고 접수번호</label>
      <input class="input" id="rno" type="text" placeholder="예: R-2418"${o.value ? ` value="${U.esc(o.value)}"` : ''}>
      <p class="t-sub mt2">신고하실 때 받으신 접수번호예요. 알림함이나 신고 화면에서 다시 볼 수 있어요.</p></div>
    <div class="btns">${U.btn('내 신고 내역에서 찾기', { href: 'CH-04', cls: 'btn-ghost btn-sm' })}</div>
  </div>`;
}

/** 끌올·광고 결제 내역 칸 */
function 결제칸(o = {}) {
  return `<div class="sub-fld mt4" data-sel-case="ask" data-sel-when="끌올·광고 결제"${o.hidden ? ' hidden' : ''}>
    <span class="lb">어느 결제인가요</span>
    <select class="input" aria-label="결제 내역">
      ${CS_INQ_PAYS.map((p) => `<option>${p.at} · ${U.esc(p.nm)} · ${U.won(p.price)}</option>`).join('')}
    </select>
    <p class="t-sub mt2">고르시면 그 결제 내역이 문의에 자동으로 붙어요.</p>
    <div class="btns mt3">${U.btn('끌올·광고 내역 보기', { href: 'BS-03', cls: 'btn-ghost btn-sm' })}</div>
  </div>`;
}

/** 계정 문제 칸 */
function 계정칸(o = {}) {
  return `<div class="sub-fld mt4" data-sel-case="ask" data-sel-when="계정"${o.hidden ? ' hidden' : ''}>
    <span class="lb">어떤 계정 문제인가요</span>
    <div class="stack-sm">
      ${CS_INQ_ACCT.map((k, i) => `<label class="radio${i === 0 ? ' on' : ''}">
        <input type="radio" name="acct"${i === 0 ? ' checked' : ''}><b>${k}</b></label>`).join('')}
    </div>
  </div>`;
}

/** 고른 거래 요약 카드 — 자동으로 붙는 것 */
function 거래요약(d) {
  return U.card('문의에 붙은 거래', `
    ${U.kv([
    ['매물', `${U.esc(d.t)}`],
    ['상대', `${U.esc(d.who)}`],
    ['금액', `<b>${U.won(d.price)}</b>`],
    ['거래한 날', d.at],
    ['거래 방식', U.wayBadges([d.way])],
    ['거래 번호', `<span class="t-sub">${d.no}</span>`],
    ['지금 상태', U.stBadge(d.st)],
  ])}
    <p class="t-sub mt3">이 내용은 문의를 보낼 때 함께 전해져요. 운영자가 거래를 다시 찾지 않아도 돼서 답이 빨라집니다.</p>`, {
    aside: U.badge('자동으로 붙었어요', 'b-ok'),
    ft: `<div class="btns">
      ${U.btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-ghost btn-sm' })}
      ${U.btn('고르기 해제', { cls: 'btn-quiet btn-sm', attr: ' data-toast="붙인 거래를 뗐어요 · 다시 고를 수 있어요"' })}
    </div>`,
  });
}

/** 제목·내용·첨부 카드 */
function 내용카드(o = {}) {
  const 첨부 = o.attach || `<div class="photo-grid">
      <button class="photo-add" type="button" data-toast="파일을 골라 주세요 (최대 ${CS_ATTACH_MAX.n}개 · 한 개 ${CS_ATTACH_MAX.mb}MB)">
        <span style="font-size:22px">＋</span><span>파일 추가</span></button>
    </div>
    <p class="t-sub mt2">최대 ${CS_ATTACH_MAX.n}개 · 한 개 ${CS_ATTACH_MAX.mb}MB까지 붙일 수 있어요. 캡처를 붙여 주시면 확인이 훨씬 빨라요.</p>
    <div class="btns mt3">${U.btn('파일 붙이기', { href: 'CS0204', cls: 'btn-ghost btn-sm' })}</div>`;

  return U.card('무슨 일인가요', `
    <div class="fld"><label class="lb" for="ti">제목</label>
      <input class="input" id="ti" type="text" placeholder="한 줄로 적어 주세요"${o.title ? ` value="${U.esc(o.title)}"` : ''}>
      <p class="t-sub mt1 right">${o.title ? o.title.length : 0} / 60</p></div>
    <div class="fld"><label class="lb" for="bd">내용</label>
      <textarea class="input" id="bd" rows="7" placeholder="언제 어떤 일이 있었는지 적어 주세요. 자세할수록 빨리 답해드릴 수 있어요.">${o.body ? U.esc(o.body) : ''}</textarea>
      <p class="t-sub mt1 right">${o.body ? o.body.length : 0} / 2000</p></div>
    <div class="fld"><span class="lb">파일 붙이기</span>${첨부}</div>`);
}

/** 답변 받을 곳 카드 */
const 받을곳카드 = () => U.card('답변을 어디로 받을까요', `
  ${[['앱 알림', true], ['이메일 (hanul@example.com)', true], ['문자 (010-****-1234)', false]]
    .map(([k, on]) => `<label class="check"><input type="checkbox"${on ? ' checked' : ''}><span>${k}</span></label>`).join('')}
  <p class="t-sub mt3"><b>${CS_DESK.promise}</b>에 답해드려요(최근 평균 ${CS_DESK.avgHours}시간). ${CS_DESK.note}</p>`);

/** 보낸 문의 표 */
const 보낸문의표 = () => U.dashTable(
  [{ t: '문의 제목' }, { t: '종류', w: '132px' }, { t: '보낸 날', w: '104px' }, { t: '상태', w: '96px' }, { t: '', w: '104px' }],
  INQUIRIES.map((q) => [
    `<b>${U.esc(q.t)}</b>`,
    `<span class="t-sub nowrap">${U.esc(q.kind)}</span>`,
    `<span class="t-sub nowrap">${q.at}</span>`,
    U.badge(q.st, q.st === '답변 완료' ? 'b-ok' : 'b-warn'),
    q.st === '답변 완료'
      ? U.btn('답변 보기', { href: 'CS0205', cls: 'btn-ghost btn-xs' })
      : '<span class="t-sub nowrap">기다리는 중</span>',
  ]),
  { max: '260px' },
);

/** 우측 액션 패널 — 상태를 바꾸는 단추(보내기·닫기)는 전부 여기로 모은다 */
function 문의액션(o = {}) {
  const 요약 = U.actPanel('문의 보내기', U.kv([
    ['문의 종류', o.kind || '거래에 문제가 있어요'],
    ['붙인 거래', o.deal || '닌텐도 스위치 OLED'],
    ['붙인 파일', o.files || `0개 / ${CS_ATTACH_MAX.n}개`],
    ['예상 답변 시간', `<b>${CS_DESK.promise}</b>`],
  ]), `${o.sendBtn || U.btn('문의 보내기', { cls: 'btn-pri btn-block', attr: ' data-toast="문의를 보냈어요 · 답변이 오면 알림으로 알려드릴게요" data-toast-kind="ok"' })}
    ${U.btn('임시 저장', { cls: 'btn-ghost btn-block', attr: ' data-toast="적으신 내용을 임시 저장했어요"' })}`,
  { state: o.state });

  const 빠른길 = U.actPanel('먼저 여기부터', `<p class="t-sub">비슷한 질문이 이미 있을 수 있어요. 자주 묻는 질문에서 찾으면 기다리지 않아도 됩니다.</p>`,
    `${U.btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost btn-block' })}
     ${U.btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-ghost btn-block' })}
     ${U.btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-block' })}`);

  const 안내 = U.actPanel('고객센터', U.kv([
    ['전화', `<b>${SITE.tel}</b>`],
    ['운영 시간', `<span class="t-sub">${SITE.hours}</span>`],
  ]), '');

  return (o.extra || '') + 요약 + 빠른길 + 안내;
}

/* ---------------- CS0201 1:1 문의 ---------------- */
function CS0201() {
  const 본문 = `
${U.banner('info', '🔎', `<b>비슷한 질문이 이미 있을 수 있어요.</b>
  <div class="t-sub mt1">자주 묻는 질문에서 먼저 찾아보시면 기다리지 않고 바로 아실 수 있어요.</div>`,
    { right: U.btn('먼저 찾아보기', { href: 'CS-01', cls: 'btn-ghost btn-sm' }) })}

<div class="mt-block">${U.card('무엇에 관한 문의인가요', `
  ${종류고르개()}
  <p class="t-sub mt2">고르신 종류에 따라 아래에 필요한 칸이 열려요. 종류를 바꾸면 적으신 내용을 지울지 먼저 여쭤봅니다.</p>
  ${거래칸(0)}
  ${신고칸({ hidden: true })}
  ${결제칸({ hidden: true })}
  ${계정칸({ hidden: true })}
  <div class="btns mt4">${U.btn('종류를 바꾸면 어떻게 되나요', { href: 'CS0202', cls: 'btn-quiet btn-sm' })}</div>`)}</div>

<div class="mt-block">${거래요약(CS_INQ_DEALS[0])}</div>

<div class="mt-block">${내용카드()}</div>

<div class="mt-block">${받을곳카드()}</div>

${U.sec('보낸 문의', `${U.tableBar(`<b>${U.num(INQUIRIES.length)}건</b> <span class="t-sub">· 답변이 오면 알림으로 알려드려요</span>`,
    U.btn('답변 완료된 문의 보기', { href: 'CS0205', cls: 'btn-ghost btn-sm' }))}
  ${보낸문의표()}`)}
`;

  const body = `
${U.pageHd('1:1 문의', '운영자가 직접 확인하고 답해드려요',
    `<div class="btns">${U.btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost' })}${U.btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-ghost' })}</div>`)}

${문의kpis()}

${U.detailSplit(본문, 문의액션())}
`;
  return { body, o: {} };
}

/* ---------------- CS0202 1:1 문의 > 문의 종류별 입력 ---------------- */
function CS0202() {
  const 본문 = `
${U.banner('warn', '🔁', `<b>문의 종류를 「신고 결과가 궁금해요」로 바꿨어요.</b>
  <div class="t-sub mt1">종류마다 필요한 것이 달라서 아래 칸이 통째로 바뀝니다 —
  거래 문제면 <b>거래 고르기</b>, 신고 결과면 <b>신고번호</b>, 결제 문제면 <b>결제 내역 고르기</b>가 열려요.
  이미 적으신 내용이 있으면 지울지 먼저 여쭤봅니다.</div>`)}

<div class="mt-block">${U.card('무엇에 관한 문의인가요', `
  ${종류고르개('신고 결과가 궁금해요')}
  <p class="t-sub mt2">고르개를 바꿔 보세요 — 아래 칸이 그 종류에 맞게 바뀝니다.</p>
  ${거래칸(0, { hidden: true })}
  ${신고칸({ value: 'R-2418' })}
  ${결제칸({ hidden: true })}
  ${계정칸({ hidden: true })}`, { aside: U.badge('신고 결과가 궁금해요', 'b-pri') })}</div>

<div class="mt-block">${U.card('종류마다 무엇이 열리나요', U.dashTable(
    [{ t: '문의 종류' }, { t: '열리는 칸' }, { t: '자동으로 붙는 것' }],
    [
      ['거래에 문제가 있어요', '거래 고르기', '매물 · 상대 · 금액 · 날짜'],
      ['안전결제', '거래 고르기', '매물 · 상대 · 금액 · 결제 단계'],
      ['신고 결과가 궁금해요', '신고 접수번호', '신고한 날 · 신고 사유 · 처리 상태'],
      ['계정', '어떤 계정 문제인가요', '가입일 · 인증 상태'],
      ['끌올·광고 결제', '결제 내역 고르기', '결제일 · 상품 · 금액 · 영수증'],
      ['그 밖에', '따로 없음', '따로 없음'],
    ].map((r) => [`<b>${r[0]}</b>`, r[1], `<span class="t-sub">${r[2]}</span>`]),
    { max: '300px' },
  ), { bdCls: 'p0' })}</div>

<div class="mt-block">${U.modalStatic('문의 종류를 바꿀까요?', `
  <p>지금 종류는 <b>거래에 문제가 있어요</b>, 바꾸려는 종류는 <b>신고 결과가 궁금해요</b>입니다.</p>
  <p class="mt3">종류를 바꾸면 <b>골라 두신 거래와 적으신 내용이 지워집니다.</b>
  제목과 내용은 그대로 두고 딸린 칸만 바꿀 수는 없어요 — 종류마다 운영자가 보는 것이 다르기 때문이에요.</p>
  ${U.banner('quiet', '💾', '지우기 전에 <b>임시 저장</b>을 해 두면, 같은 종류로 돌아왔을 때 다시 불러올 수 있어요.')}`,
    `${U.btn('그대로 둘게요', { cls: 'btn-ghost', attr: ' data-toast="종류를 그대로 두었어요"' })}
     ${U.btn('지우고 바꾸기', { cls: 'btn-danger', attr: ' data-toast="종류를 바꾸고 딸린 칸을 비웠어요"' })}`)}</div>

<div class="mt-block">${내용카드({ title: '신고 결과가 언제 나오나요' })}</div>
`;

  const body = `
${U.pageHd('1:1 문의', '문의 종류별 입력 — 고른 종류에 따라 칸이 바뀝니다',
    `<div class="btns">${U.btn('1:1 문의 처음으로', { href: 'CS-02', cls: 'btn-ghost' })}${U.btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost' })}</div>`)}

${문의kpis()}

${U.detailSplit(본문, 문의액션({ kind: '신고 결과가 궁금해요', deal: '없음 (신고번호 R-2418)', state: '작성 중' }))}
`;
  return { body, o: {} };
}

/* ---------------- CS0203 1:1 문의 > 거래 자동 채움 ---------------- */
function CS0203() {
  const d = CS_INQ_DEALS[0];
  const 본문 = `
${U.banner('ok', '✓', `<b>「${U.esc(d.t)}」 거래를 골랐어요.</b>
  <div class="t-sub mt1">고른 거래의 매물·상대·금액·날짜가 아래 요약 카드로 자동으로 붙었어요.
  운영자가 거래를 다시 찾지 않아도 돼서 답이 빨라집니다. 다른 거래로 바꾸시려면 <b>고르기 해제</b>를 누르세요.</div>`)}

<div class="mt-block">${U.card('무엇에 관한 문의인가요', `
  ${종류고르개('거래에 문제가 있어요')}
  ${거래칸(0)}`, { aside: U.badge('거래 1건 골랐어요', 'b-ok') })}</div>

<div class="mt-block">${거래요약(d)}</div>

<div class="mt-block">${U.card('고르기를 풀면 이렇게 됩니다', `
  ${U.kv([
    ['붙었던 요약 카드', '문의에서 떨어져 나갑니다'],
    ['적으신 제목·내용', '그대로 남아요 — 지워지지 않습니다'],
    ['다시 고르기', '위 목록에서 다른 거래를 고르면 그 거래로 다시 붙어요'],
  ])}
  <div class="btns mt4">
    ${U.btn('고르기 해제', { cls: 'btn-ghost', attr: ' data-toast="붙인 거래를 뗐어요 · 제목과 내용은 그대로예요"' })}
    ${U.btn('내 거래 전체 보기', { href: 'PA-05', cls: 'btn-ghost' })}
  </div>`)}</div>

<div class="mt-block">${내용카드({
    title: '받은 물건이 설명과 달라요',
    body: '조이콘에 긁힘이 없다고 하셨는데 받아 보니 오른쪽에 긁힘이 있습니다. 게임 칩도 한 개만 왔어요. 사진 붙입니다.',
  })}</div>

<div class="mt-block">${받을곳카드()}</div>
`;

  const body = `
${U.pageHd('1:1 문의', '거래를 고르면 요약이 자동으로 붙습니다',
    `<div class="btns">${U.btn('1:1 문의 처음으로', { href: 'CS-02', cls: 'btn-ghost' })}${U.btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-ghost' })}</div>`)}

${문의kpis()}

${U.detailSplit(본문, 문의액션({ deal: `${d.t} (${d.no})`, files: `2개 / ${CS_ATTACH_MAX.n}개`, state: '작성 중' }))}
`;
  return { body, o: {} };
}

/* ---------------- CS0204 1:1 문의 > 첨부 용량 초과 ---------------- */
function CS0204() {
  const 넘는것 = CS_ATTACH.filter((f) => f.mb > CS_ATTACH_MAX.mb);
  const 개수초과 = CS_ATTACH.length - CS_ATTACH_MAX.n;
  const 합 = CS_ATTACH.reduce((a, f) => a + f.mb, 0);

  const 첨부표 = U.dashTable(
    [{ t: '파일 이름' }, { t: '크기', w: '96px' }, { t: '상태', w: '132px' }, { t: '', w: '104px' }],
    CS_ATTACH.map((f, i) => {
      const 큼 = f.mb > CS_ATTACH_MAX.mb;
      const 넘침 = i >= CS_ATTACH_MAX.n;
      const 나쁨 = 큼 || 넘침;
      return {
        cls: 나쁨 ? 'over' : '',
        cells: [
          `<span class="${나쁨 ? 'danger' : ''}"><b>${U.esc(f.nm)}</b></span>`,
          `<span class="nowrap ${큼 ? 'danger' : 't-sub'}">${f.mb.toFixed(1)}MB</span>`,
          큼 ? U.badge(`${CS_ATTACH_MAX.mb}MB 넘음`, 'b-danger')
            : (넘침 ? U.badge(`${CS_ATTACH_MAX.n}개 넘음`, 'b-danger') : U.badge('붙일 수 있어요', 'b-ok')),
          나쁨
            ? `<button class="btn btn-quiet btn-xs" type="button" data-toast="${U.esc(f.nm)} 를 뺐어요">빼기</button>`
            : '<span class="t-sub">—</span>',
        ],
      };
    }),
    { max: '320px' },
  );

  const 본문 = `
${U.banner('dan', '⚠', `<b>붙일 수 없는 파일이 있어요.</b>
  <div class="t-sub mt1">한 번에 <b>${CS_ATTACH_MAX.n}개</b>까지, 한 파일은 <b>${CS_ATTACH_MAX.mb}MB</b>까지 붙일 수 있어요.
  지금 ${U.num(CS_ATTACH.length)}개(모두 ${합.toFixed(1)}MB)를 고르셨고, 그 가운데 ${U.num(넘는것.length)}개가 용량을 넘었습니다${개수초과 > 0 ? `. 개수도 ${개수초과}개 넘었어요` : ''}.
  <b>넘는 파일만 붉게</b> 표시했어요 — 나머지는 그대로 붙습니다.</div>`,
    { right: U.btn('넘는 파일 모두 빼기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="용량을 넘은 파일 2개를 뺐어요"' }) })}

<div class="mt-block">${U.card('고르신 파일', 첨부표, {
    aside: `<span class="t-sub">${U.num(CS_ATTACH.length)}개 / ${CS_ATTACH_MAX.n}개 · ${합.toFixed(1)}MB</span>`,
    bdCls: 'p0',
  })}</div>

<div class="mt-block">${U.banner('info', '🗜', `<b>사진은 자동으로 줄여서 붙일 수 있어요.</b>
  <div class="t-sub mt1">「물건사진_원본.heic」(14.8MB)를 긴 쪽 1600px JPG 로 줄이면 <b>약 1.8MB</b>가 됩니다.
  글자나 화면 캡처는 알아볼 수 있게 그대로 두고 사진만 줄여요. 영상은 줄일 수 없어 링크로 보내 주셔야 해요.</div>`,
    { right: U.btn('사진 줄여서 붙이기', { cls: 'btn-pri btn-sm', attr: ' data-toast="사진 1개를 1.8MB로 줄여 붙였어요"' }) })}</div>

<div class="mt-block">${U.card('영상처럼 큰 파일은요', `
  ${U.kv([
    ['붙일 수 있는 것', '사진(JPG · PNG · HEIC) · 문서(PDF) · 화면 캡처'],
    ['붙일 수 없는 것', `영상(MOV · MP4) 처럼 ${CS_ATTACH_MAX.mb}MB 를 크게 넘는 파일`],
    ['그럴 때는', '영상은 클라우드에 올리고 <b>보기 링크</b>를 내용에 붙여 주세요. 링크만으로도 확인할 수 있어요'],
    ['개인정보', '계좌번호·주민번호가 찍힌 캡처는 가리고 올려 주세요'],
  ])}`)}</div>

<div class="mt-block">${내용카드({
    title: '받은 물건이 설명과 달라요',
    /* ⚠ 위에 이미 있는 표를 여기 한 번 더 그리지 않는다 —
       같은 표가 한 화면에 둘이면 어느 것이 참인지 헷갈린다. 여기는 «붙는 것과 안 붙는 것»만 한 줄씩. */
    attach: `<div class="stack-sm">${CS_ATTACH.map((f, i) => {
      const 나쁨 = f.mb > CS_ATTACH_MAX.mb || i >= CS_ATTACH_MAX.n;
      return `<div class="cond-row">
        <span class="grow${나쁨 ? ' danger' : ''}">📎 <b>${U.esc(f.nm)}</b> <span class="t-sub">· ${f.mb.toFixed(1)}MB</span></span>
        ${나쁨 ? U.badge('안 붙어요', 'b-danger') : U.badge('붙어요', 'b-ok')}</div>`;
    }).join('')}</div>
      <p class="t-sub mt2">붉은 줄은 붙지 않아요. 빼거나 줄인 뒤에 보내 주세요.</p>`,
  })}</div>
`;

  const 보내기잠금 = `<button class="btn btn-pri btn-block" type="button" disabled>문의 보내기</button>
    <p class="t-sub mt2 center">붉은 파일을 빼거나 줄이면 보낼 수 있어요.</p>`;

  const body = `
${U.pageHd('1:1 문의', `첨부 용량 초과 — ${U.num(넘는것.length)}개가 ${CS_ATTACH_MAX.mb}MB를 넘었어요`,
    `<div class="btns">${U.btn('1:1 문의 처음으로', { href: 'CS-02', cls: 'btn-ghost' })}${U.btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost' })}</div>`)}

${U.kpis([
    ['고른 파일', U.num(CS_ATTACH.length), { unit: '개', tone: 'k-danger', d: `${CS_ATTACH_MAX.n}개까지 붙일 수 있어요` }],
    ['모두 더한 크기', 합.toFixed(1), { unit: 'MB', tone: 'k-warn', d: `한 파일은 ${CS_ATTACH_MAX.mb}MB까지` }],
    ['넘은 파일', U.num(넘는것.length), { unit: '개', tone: 'k-danger', d: '붉게 표시한 줄이에요' }],
    ['줄이면 붙는 것', '1', { unit: '개', tone: 'k-ok', d: '사진 1개는 줄여서 붙일 수 있어요' }],
  ])}

${U.detailSplit(본문, 문의액션({
    files: `${U.num(CS_ATTACH.length)}개 / ${CS_ATTACH_MAX.n}개 (붉은 줄 ${넘는것.length}개 제외)`,
    sendBtn: 보내기잠금,
    state: '보류',
  }))}
`;
  return { body, o: {} };
}

/* ---------------- CS0205 1:1 문의 > 답변 완료 ---------------- */
function CS0205() {
  const a = CS_ANSWER;
  const 대화 = `<div class="talk-wrap">
    ${a.talk.map((t) => `<div class="bub${t.me ? ' me' : ''}">${U.esc(t.say)}
      <span class="when">${t.at}${t.by ? ` · ${U.esc(t.by)}` : ''}</span></div>`).join('')}
  </div>`;

  const 본문 = `
${U.banner('ok', '✓', `<b>답변이 도착했어요.</b>
  <div class="t-sub mt1">${a.talk[0].at} 에 보내신 문의에 ${a.talk.length - 2 > 0 ? '두 번' : '한 번'} 답해드렸어요.
  더 궁금한 것이 있으면 아래에서 <b>이어서 물어보실</b> 수 있고, 다 풀렸으면 오른쪽에서 <b>해결됐어요</b>로 닫을 수 있어요.</div>`)}

<div class="mt-block">${U.card(U.esc(a.t), 대화, {
    aside: `${U.badge(a.kind, 'b-mut')}${U.badge('답변 완료', 'b-ok')}`,
  })}</div>

<div class="mt-block">${U.card('이어서 물어보기', `
  <div class="fld"><label class="lb" for="more">더 궁금한 것이 있으면 적어 주세요</label>
    <textarea class="input" id="more" rows="4" placeholder="같은 문의에 이어서 물어보면 앞선 대화를 함께 보고 답해드려요."></textarea>
    <p class="t-sub mt1">이어서 물으면 이 문의가 다시 <b>접수</b> 상태가 되고, 같은 담당자가 이어 답해드려요.</p></div>
  <div class="fld"><span class="lb">파일 붙이기</span>
    <div class="photo-grid">
      <button class="photo-add" type="button" data-toast="파일을 골라 주세요 (최대 ${CS_ATTACH_MAX.n}개 · 한 개 ${CS_ATTACH_MAX.mb}MB)">
        <span style="font-size:22px">＋</span><span>파일 추가</span></button>
    </div></div>`)}</div>

<div class="mt-block">${U.card('답변이 도움이 되었나요', `
  ${U.rateIn('답변 만족도', 0, { big: true })}
  <p class="t-sub mt3">별을 눌러 매겨 주세요. 매기신 점수는 담당자에게 보이고, 낮게 주시면 무엇이 아쉬웠는지 한 줄 여쭤봅니다.</p>
  <div class="fld mt4"><label class="lb" for="sat">한 줄 남기기 (안 적으셔도 돼요)</label>
    <input class="input" id="sat" type="text" placeholder="예: 정산 날짜까지 알려 주셔서 좋았어요"></div>
  <div class="btns">${U.btn('만족도 보내기', { cls: 'btn-ghost', attr: ' data-toast="평가해 주셔서 고맙습니다"' })}</div>`)}</div>

${U.sec('보낸 문의', 보낸문의표())}
`;

  const 액션 = U.actPanel('이 문의', U.kv([
    ['문의 번호', `<span class="t-sub">${a.no}</span>`],
    ['문의 종류', U.esc(a.kind)],
    ['보낸 날', a.talk[0].at.slice(0, 10)],
    ['마지막 답변', a.talk[a.talk.length - 1].at.slice(0, 10)],
    ['담당자', U.esc(a.talk[1].by)],
  ]), `${U.btn('이어서 묻기 보내기', { cls: 'btn-pri btn-block', attr: ' data-toast="이어서 보낸 문의가 접수됐어요 · 같은 담당자가 이어 답해드려요"' })}
    ${U.btn('해결됐어요 (닫기)', { cls: 'btn-ghost btn-block', attr: ' data-toast="문의를 닫았어요 · 고맙습니다" data-toast-kind="ok"' })}
    ${U.btn('새 문의 쓰기', { href: 'CS-02', cls: 'btn-quiet btn-block' })}`, { state: '완료' });

  const 다음 = U.actPanel('이 답변과 이어지는 곳', '', `${U.btn('거래 진행 상태 보기', { href: 'PA-05', cls: 'btn-ghost btn-block' })}
    ${U.btn('안전결제 안내', { href: 'PA-01', cls: 'btn-ghost btn-block' })}
    ${U.btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost btn-block' })}`);

  const body = `
${U.pageHd('1:1 문의', '답변 완료 — 문의와 답변을 대화로 볼 수 있어요',
    `<div class="btns">${U.btn('1:1 문의 처음으로', { href: 'CS-02', cls: 'btn-ghost' })}${U.btn('자주 묻는 질문', { href: 'CS-01', cls: 'btn-ghost' })}</div>`)}

${문의kpis({ faqDesc: '비슷한 일이 또 생기면 여기부터' })}

${U.detailSplit(본문, 액션 + 다음)}
`;
  return { body, o: {} };
}

/* ═══════════════ 공지사항 상세 (CS03) ═══════════════ */

const N = NOTICES[0];
const 관련공지 = NOTICES.filter((x) => x.c === N.c && x.id !== N.id).slice(0, 5);
const 앞뒤 = (() => {
  const i = NOTICES.findIndex((x) => x.id === N.id);
  return { prev: i > 0 ? NOTICES[i - 1] : null, next: NOTICES[i + 1] || null, i };
})();

const 공지kpis = () => U.kpis([
  ['조회', U.num(N.hit), { unit: '회', d: `${N.at} 에 올린 공지예요` }],
  ['시행까지', U.num(CS_DDAY), { unit: '일', tone: 'k-warn', d: `${N.from} 0시부터 새 규칙`, href: 'CS0302' }],
  ['바뀌는 항목', U.num(CS_RULE_CHANGED), { unit: '개', tone: 'k-acc', d: `모두 ${CS_RULE_ROWS.length}개 가운데`, href: 'CS0303' }],
  ['붙임 파일', U.num(CS_FILES.length), { unit: '개', tone: 'k-mut', d: CS_FILES.map((f) => f.kind).join(' · '), href: 'CS0305' }],
]);

/** 공지 제목 덩이 */
const 공지머리 = (o = {}) => `<div class="page-hd">
  <div class="row-c wrap-row mb2" style="gap:6px">${U.badge(N.c, 'b-pri')}${N.imp ? U.badge('중요', 'b-acc') : ''}${o.extra || ''}</div>
  <h2 class="t-page">${U.esc(N.t)}</h2>
  <p class="t-sub mt2">${N.at} 올림 · 조회 ${U.num(N.hit)}회 · 고객센터 공지</p>
</div>`;

/** 「지금 → 바뀐 뒤」 두 열 표. 달라지는 줄만 강조하고, 그 규칙이 걸리는 화면으로 이어 준다. */
const 규칙표 = (o = {}) => U.dashTable(
  [{ t: '무엇이', w: '24%' }, { t: '지금' }, { t: `${N.from}부터` }, { t: '', w: '84px' }]
    .concat(o.link === false ? [] : [{ t: '걸리는 화면', w: '132px' }]),
  CS_RULE_ROWS.map((r) => ({
    cells: [
      `<b>${U.esc(r.k)}</b>`,
      r.chg ? `<span class="t-sub strike">${U.esc(r.now)}</span>` : `<span class="t-sub">${U.esc(r.now)}</span>`,
      r.chg ? `<b class="hl">${U.esc(r.next)}</b>` : `<span class="t-sub">${U.esc(r.next)} (그대로)</span>`,
      r.chg ? U.badge('바뀜', 'b-acc') : U.badge('그대로', 'b-mut'),
    ].concat(o.link === false ? [] : [U.btn(r.go[1], { href: r.go[0], cls: 'btn-ghost btn-xs' })]),
  })),
  { max: o.max || '340px' },
);

/** 첨부 파일 목록 */
const 첨부목록 = () => `<div class="stack-sm">
  ${CS_FILES.map((f) => `<div class="cond-row">
    <span class="grow">📎 <b>${U.esc(f.nm)}</b> <span class="t-sub">· ${f.size}</span></span>
    ${U.badge(f.kind, 'b-mut')}
    ${U.btn('내려받기', { cls: 'btn-ghost btn-sm', attr: ` data-toast="${U.esc(f.nm)} 를 내려받았어요" data-toast-kind="ok"` })}
  </div>`).join('')}
</div>`;

/** 이전·다음 공지 줄. ⛔ 첫 글에서 「이전」은 잠긴다 — 잠기는 것은 <button> 이어야 한다(<a> 에는 disabled 가 없다). */
function 앞뒤줄(o = {}) {
  const 이전 = 앞뒤.prev
    ? U.btn(`‹ ${U.esc(앞뒤.prev.t)}`, { cls: 'btn-ghost', attr: ` data-toast="「${U.esc(앞뒤.prev.t)}」로 넘어갑니다"` })
    : `<button class="btn btn-ghost" type="button" disabled title="가장 최근 공지라 이전 글이 없어요">‹ 이전 공지 없음</button>`;
  const 다음 = 앞뒤.next
    ? U.btn(`${U.esc(앞뒤.next.t)} ›`, { href: o.nextHref || 'CS0304', cls: 'btn-ghost' })
    : `<button class="btn btn-ghost" type="button" disabled title="가장 오래된 공지예요">다음 공지 없음 ›</button>`;
  return `<div class="row-b wrap-row" style="gap:8px">${이전}${U.btn('목록으로', { href: 'HO-04', cls: 'btn-line' })}${다음}</div>`;
}

/** 우측 액션 패널 */
function 공지액션(o = {}) {
  const 정보 = U.actPanel('이 공지', U.kv([
    ['분류', U.badge(N.c, 'b-pri')],
    ['올린 날', N.at],
    ['조회', `${U.num(N.hit)}회`],
    ['시행일', `<b>${N.from}</b>`],
    ['남은 날', o.done ? U.badge('시행 중', 'b-ok') : `<b>${U.num(CS_DDAY)}일</b>`],
    ['붙임', `${U.num(CS_FILES.length)}개`],
  ]), `${U.btn('공지 목록으로', { href: 'HO-04', cls: 'btn-pri btn-block' })}
    ${U.btn('이 공지에 관해 문의하기', { href: 'CS-02', cls: 'btn-ghost btn-block' })}
    ${U.btn('링크 복사', { cls: 'btn-quiet btn-block', attr: ' data-toast="공지 링크를 복사했어요"' })}`,
  { state: o.state });

  const 자세히 = U.actPanel('자세히 보기', '', `${U.btn('시행일 안내', { href: 'CS0302', cls: 'btn-ghost btn-block' })}
    ${U.btn('규칙 비교 표', { href: 'CS0303', cls: 'btn-ghost btn-block' })}
    ${U.btn('이전·다음 공지', { href: 'CS0304', cls: 'btn-ghost btn-block' })}
    ${U.btn('붙임 파일', { href: 'CS0305', cls: 'btn-ghost btn-block' })}`);

  const 관련 = U.actPanel(`관련 공지 ${관련공지.length}건`, `<div class="stack-sm">
    ${관련공지.map((x) => `<a class="sugg" href="${U.link('CS0301')}">
      <span class="grow">${U.esc(x.t)}</span><span class="t-sub nowrap">${x.at}</span></a>`).join('')}
  </div>`, '');

  return (o.extra || '') + 정보 + 자세히 + 관련;
}

/* ---------------- CS0301 공지사항 상세 ---------------- */
function CS0301() {
  const 본문 = `
${공지머리()}

${U.banner('warn', '📅', `<b>${N.from} 0시부터 바뀝니다.</b>
  <div class="t-sub mt1">오늘(${CS_TODAY}) 기준 <b>${U.num(CS_DDAY)}일</b> 남았어요.
  그전까지는 지금 규칙이 그대로 적용되고, 시행일이 지나면 이 띠가 「시행 중」으로 바뀝니다.</div>`,
    { right: U.btn('시행일 안내 자세히', { href: 'CS0302', cls: 'btn-ghost btn-sm' }) })}

<div class="mt-block">
  <h2 class="t-sec">무엇이 바뀌나요</h2>
  <p class="t-sub mt2">모두 ${CS_RULE_ROWS.length}가지 가운데 <b>${U.num(CS_RULE_CHANGED)}가지</b>가 달라집니다. 달라지는 줄만 형광펜으로 칠했어요.</p>
  <div class="mt3">${규칙표()}</div>
  <div class="btns mt3">${U.btn('규칙 비교 표 자세히 보기', { href: 'CS0303', cls: 'btn-ghost btn-sm' })}</div>

  <h2 class="t-sec mt-block">왜 바꾸나요</h2>
  <p class="t-body mt3">안전결제를 쓰시는 분이 늘면서 다툼이 줄고 운영 비용도 줄었습니다.
  줄어든 만큼 수수료를 ${(FEE_RATE * 100).toFixed(1)}%에서 3.0%로 내리고, 정산도 이틀 앞당깁니다.
  판매글이 30일 만에 내려가 다시 올리는 것이 번거롭다는 말씀이 많아 유효기간도 45일로 늘립니다.</p>

  <h2 class="t-sec mt-block">이미 하고 있는 거래는요</h2>
  <p class="t-body mt3">${N.from} 전에 결제된 거래는 <b>지금 규칙</b>이 그대로 적용됩니다.
  ${N.from} 0시 이후 결제분부터 새 수수료와 정산 주기가 적용돼요.
  지금 올려 두신 판매글의 유효기간도 시행일에 자동으로 45일 기준으로 다시 계산됩니다 — 따로 하실 일은 없어요.</p>

  <h2 class="t-sec mt-block">더 궁금하시면</h2>
  <p class="t-body mt3">자주 묻는 질문의 「안전결제」 분류에 더 자세히 적어 두었습니다.
  그래도 궁금한 것이 있으면 1:1 문의로 알려 주세요. ${CS_DESK.promise}에 답해드립니다.</p>
  <div class="btns mt3">${U.btn('안전결제 질문 보기', { href: 'CS0102', cls: 'btn-ghost btn-sm' })}${U.btn('안전거래 안내', { href: 'HO-03', cls: 'btn-ghost btn-sm' })}</div>
</div>

<div class="mt-block">${U.card('붙임 파일', 첨부목록(), {
    aside: `<span class="t-sub">${U.num(CS_FILES.length)}개</span>`,
    ft: `<div class="btns">${U.btn('붙임 파일 모두 보기', { href: 'CS0305', cls: 'btn-ghost btn-sm' })}</div>`,
  })}</div>

<div class="mt-block">${앞뒤줄()}</div>

<div class="mt-block">${U.accordion([{
    q: `관련 공지 ${관련공지.length}건 펼치기`,
    a: `<div class="stack-sm">${관련공지.map((x) => `<a class="cond-row" href="${U.link('CS0301')}">
      <span class="grow">${U.esc(x.t)}</span><span class="t-sub nowrap">${x.at} · 조회 ${U.num(x.hit)}</span></a>`).join('')}</div>`,
  }], -1)}</div>

<div class="mt-block">${U.banner('info', '💬', `<b>이 공지에 관해 궁금한 점이 있나요?</b>
  <div class="t-sub mt1">공지 번호를 적지 않으셔도 돼요 — 문의를 열면 어느 공지에 관한 것인지 자동으로 붙습니다.</div>`,
    { right: U.btn('문의하기', { href: 'CS-02', cls: 'btn-pri btn-sm' }) })}</div>
`;

  const body = `
${U.pageHd('공지사항', `${U.esc(N.c)} · ${N.at}`,
    `<div class="btns">${U.btn('공지 목록으로', { href: 'HO-04', cls: 'btn-ghost' })}${U.btn('문의하기', { href: 'CS-02', cls: 'btn-pri' })}</div>`)}

${공지kpis()}

${U.detailSplit(본문, 공지액션({ state: '진행중' }))}
`;
  return { body, o: {} };
}

/* ---------------- CS0302 공지사항 상세 > 시행일 안내 ---------------- */
function CS0302() {
  const 지난날 = Math.max(0, Math.round((Date.parse(CS_TODAY) - Date.parse(N.at)) / 86400000));
  const 전체 = 지난날 + CS_DDAY;
  const 바뀌는것 = CS_RULE_ROWS.filter((r) => r.chg);

  const 본문 = `
${공지머리({ extra: U.badge(`시행 ${CS_DDAY}일 전`, 'b-warn') })}

${U.banner('warn', '📅', `<b>${N.from} 0시부터 바뀝니다 — ${U.num(CS_DDAY)}일 남았어요.</b>
  <div class="t-sub mt1">오늘은 ${CS_TODAY} 입니다. 시행일까지는 <b>지금 규칙</b>이 그대로예요.</div>
  <div class="mt3">${U.progress(Math.round(지난날 / 전체 * 100), 'acc')}</div>
  <div class="t-sub mt2">공지를 올린 ${N.at} 부터 ${U.num(전체)}일 가운데 ${U.num(지난날)}일이 지났어요.</div>`)}

<div class="mt-block">${U.card('시행 전과 시행 뒤, 이 띠가 이렇게 달라져요', `
  <p class="t-th mb2">지금 (시행 전)</p>
  ${U.banner('warn', '📅', `<b>${N.from} 0시부터 바뀝니다</b>
    <div class="t-sub mt1">${U.num(CS_DDAY)}일 남음 · 그전까지는 지금 규칙이 그대로예요</div>`)}
  <div class="divider"></div>
  <p class="t-th mb2">${N.from} 이 지나면</p>
  ${U.banner('ok', '✓', `<b>${N.from} 부터 시행 중입니다</b>
    <div class="t-sub mt1">새 규칙이 적용되고 있어요. 남은 날짜 대신 <b>시행 중</b> 배지가 붙습니다.</div>`,
    { right: U.badge('시행 중', 'b-ok') })}
  <p class="t-sub mt3">시행일이 없는 공지(이벤트·안내)에는 이 띠 자체가 붙지 않아요.</p>`)}</div>

<div class="mt-block">${U.card('바뀐 내용 요약', `
  <p class="t-sub mb3">시행일이 지나면 아래 ${U.num(바뀌는것.length)}가지가 달라집니다. 나머지 ${U.num(CS_RULE_ROWS.length - 바뀌는것.length)}가지는 그대로예요.</p>
  <ul class="dots">
    ${바뀌는것.map((r) => `<li><b>${U.esc(r.k)}</b> — ${U.esc(r.now)} → <b class="hl">${U.esc(r.next)}</b></li>`).join('')}
  </ul>
  <div class="btns mt4">${U.btn('두 열 비교 표로 보기', { href: 'CS0303', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

<div class="mt-block">${U.card('시행일 앞뒤로 무엇이 달라지나요', U.dashTable(
    [{ t: '언제 결제한 거래인가', w: '34%' }, { t: '어느 규칙으로', w: '26%' }, { t: '무슨 뜻인가요' }],
    [
      [`${N.from} 전에 결제`, U.badge('지금 규칙', 'b-mut'), `수수료 ${(FEE_RATE * 100).toFixed(1)}% · 정산 7영업일 그대로`],
      [`${N.from} 0시 이후 결제`, U.badge('새 규칙', 'b-acc'), '수수료 3.0% · 정산 5영업일'],
      ['이미 올려 둔 판매글', U.badge('자동 적용', 'b-ok'), '시행일에 유효기간이 45일 기준으로 다시 계산돼요'],
    ].map((r) => [`<b>${r[0]}</b>`, r[1], `<span class="t-sub">${r[2]}</span>`]),
    { max: '260px' },
  ), { bdCls: 'p0' })}</div>

<div class="mt-block">${앞뒤줄()}</div>

<div class="mt-block">${U.banner('info', '🔔', `<b>시행일에 알림을 받으시겠어요?</b>
  <div class="t-sub mt1">시행 하루 전과 시행 당일 아침에 앱 알림으로 알려드려요.</div>`,
    { right: U.btn('시행일 알림 받기', { cls: 'btn-pri btn-sm', attr: ' data-toast="시행 하루 전에 알려드릴게요" data-toast-kind="ok"' }) })}</div>
`;

  const body = `
${U.pageHd('공지사항', `시행일 안내 — ${N.from} 시행까지 ${U.num(CS_DDAY)}일`,
    `<div class="btns">${U.btn('공지 처음으로', { href: 'CS0301', cls: 'btn-ghost' })}${U.btn('공지 목록으로', { href: 'HO-04', cls: 'btn-ghost' })}</div>`)}

${공지kpis()}

${U.detailSplit(본문, 공지액션({ state: '진행중' }))}
`;
  return { body, o: {} };
}

/* ---------------- CS0303 공지사항 상세 > 규칙 비교 표 ---------------- */
function CS0303() {
  const 바뀌는것 = CS_RULE_ROWS.filter((r) => r.chg);

  const 본문 = `
${공지머리({ extra: U.badge(`${CS_RULE_CHANGED}가지 바뀜`, 'b-acc') })}

${U.banner('acc', '📊', `<b>지금과 ${N.from} 이후를 두 열로 견줘 놓았어요.</b>
  <div class="t-sub mt1">모두 ${CS_RULE_ROWS.length}줄 가운데 <b>달라지는 ${U.num(CS_RULE_CHANGED)}줄</b>만 형광펜으로 칠하고 「바뀜」 배지를 달았어요.
  그대로인 줄은 옅게 두었습니다. 맨 오른쪽 단추를 누르면 그 규칙이 실제로 걸리는 화면으로 갑니다.</div>`)}

<div class="mt-block">
  <h2 class="t-sec">지금 → ${N.from}부터</h2>
  <p class="t-sub mt2">표가 옆으로 넘치면 표 안에서 좌우로 밀어 보세요. 머리글은 표 위에 붙어 있어요.</p>
  <div class="mt3">${규칙표({ max: '420px' })}</div>
</div>

<div class="mt-block">${U.card('달라지는 줄만 모으면', `
  ${U.kv(바뀌는것.map((r) => [U.esc(r.k), `<span class="t-sub strike">${U.esc(r.now)}</span> → <b class="hl">${U.esc(r.next)}</b>`]))}
  <p class="t-sub mt3">그대로인 것: ${CS_RULE_ROWS.filter((r) => !r.chg).map((r) => U.esc(r.k)).join(' · ')}</p>`)}</div>

<div class="mt-block">${U.card('이 규칙이 걸리는 화면', `
  <p class="t-sub mb3">규칙이 실제로 적용되는 자리를 함께 붙여 두었어요. 「내 거래는 어떻게 되나」가 바로 보이게 하려는 것이에요.</p>
  <div class="stack-sm">
    ${CS_RULE_ROWS.map((r) => `<div class="cond-row">
      <span class="grow"><b>${U.esc(r.k)}</b> <span class="t-sub">· ${r.chg ? `${U.esc(r.now)} → ${U.esc(r.next)}` : '그대로'}</span></span>
      ${r.chg ? U.badge('바뀜', 'b-acc') : U.badge('그대로', 'b-mut')}
      ${U.btn(`${U.esc(r.go[1])} 열기`, { href: r.go[0], cls: 'btn-ghost btn-sm' })}
    </div>`).join('')}
  </div>`)}</div>

<div class="mt-block">${U.card('수수료가 내리면 얼마나 달라지나요', `
  ${U.dashTable(
    [{ t: '판 값', w: '30%' }, { t: `지금 (${(FEE_RATE * 100).toFixed(1)}%)` }, { t: `${N.from}부터 (3.0%)` }, { t: '차이', w: '108px' }],
    [50000, 100000, 245000, 500000].map((p) => {
      const 지금 = Math.round(p * FEE_RATE);
      const 나중 = Math.round(p * 0.03);
      return [
        `<b>${U.won(p)}</b>`,
        `<span class="t-sub">${U.won(지금)}</span>`,
        `<b>${U.won(나중)}</b>`,
        `<b class="success nowrap">-${U.won(지금 - 나중)}</b>`,
      ];
    }),
    { max: '260px' },
  )}
  <p class="t-sub mt3">파는 쪽이 내는 수수료예요. 사는 쪽이 내는 돈은 달라지지 않습니다.</p>
  <div class="btns mt3">${U.btn('수수료 계산기 열기', { href: 'PA-01', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

<div class="mt-block">${앞뒤줄()}</div>
`;

  const body = `
${U.pageHd('공지사항', `규칙 비교 표 — ${CS_RULE_ROWS.length}줄 가운데 ${U.num(CS_RULE_CHANGED)}줄이 달라져요`,
    `<div class="btns">${U.btn('공지 처음으로', { href: 'CS0301', cls: 'btn-ghost' })}${U.btn('문의하기', { href: 'CS-02', cls: 'btn-pri' })}</div>`)}

${공지kpis()}

${U.detailSplit(본문, 공지액션({ state: '진행중' }))}
`;
  return { body, o: {} };
}

/* ---------------- CS0304 공지사항 상세 > 이전·다음 공지 ---------------- */
function CS0304() {
  const 본문 = `
${공지머리({ extra: U.badge(`목록에서 ${앞뒤.i + 1}번째`, 'b-mut') })}

${U.banner('quiet', '↔', `<b>이 공지는 목록에서 가장 최근 글이에요 — 그래서 「이전 공지」가 잠겨 있어요.</b>
  <div class="t-sub mt1">첫 글에서는 이전이, 마지막 글에서는 다음이 눌리지 않습니다.
  잠긴 단추는 눌러도 아무 일이 없고, 왜 잠겼는지 단추 위에 올리면 보여요.</div>`)}

<div class="mt-block">${U.card('이웃한 공지', `
  <div class="stack-sm">
    <div class="cond-row">
      <span class="t-sub nowrap" style="width:80px">이전 글</span>
      <span class="grow t-sub">없어요 — 가장 최근 공지입니다</span>
      ${U.badge('잠김', 'b-mut')}
      <button class="btn btn-ghost btn-sm" type="button" disabled title="가장 최근 공지라 이전 글이 없어요">‹ 이전</button>
    </div>
    <div class="cond-row" style="border-color:var(--primary)">
      <span class="t-sub nowrap" style="width:80px">지금 글</span>
      <span class="grow"><b>${U.esc(N.t)}</b> <span class="t-sub">· ${N.at}</span></span>
      ${U.badge('보는 중', 'b-pri')}
      <button class="btn btn-quiet btn-sm" type="button" disabled>여기예요</button>
    </div>
    <div class="cond-row">
      <span class="t-sub nowrap" style="width:80px">다음 글</span>
      <span class="grow"><b>${U.esc(앞뒤.next.t)}</b> <span class="t-sub">· ${앞뒤.next.at}</span></span>
      ${U.badge(앞뒤.next.c, 'b-mut')}
      ${U.btn('다음 ›', { href: 'CS0301', cls: 'btn-ghost btn-sm' })}
    </div>
  </div>
  <p class="t-sub mt3">「다음」은 목록에서 한 칸 아래(더 예전) 공지로 갑니다. 분류를 걸어 두어도 순서는 올린 날짜 기준이에요.</p>`)}</div>

<div class="mt-block">${U.card('목록에서 이 공지의 자리', U.dashTable(
    [{ t: '', w: '72px' }, { t: '분류', w: '96px' }, { t: '제목' }, { t: '올린 날', w: '110px' }, { t: '조회', w: '88px' }],
    NOTICES.slice(0, 5).map((x, i) => ({
      cells: [
        i === 앞뒤.i ? U.badge('지금', 'b-pri') : `<span class="t-sub">${i + 1}</span>`,
        U.badge(x.c, x.c === '이벤트' ? 'b-acc' : 'b-mut'),
        i === 앞뒤.i
          ? `<b>${U.esc(x.t)}</b>`
          : `<a href="${U.link('CS0301')}">${U.esc(x.t)}</a>`,
        `<span class="t-sub nowrap">${x.at}</span>`,
        `<span class="t-sub nowrap">${U.num(x.hit)}</span>`,
      ],
    })),
    { max: '300px' },
  ), { bdCls: 'p0', ft: `<div class="btns">${U.btn('공지 목록 전체 보기', { href: 'HO-04', cls: 'btn-ghost btn-sm' })}</div>` })}</div>

<div class="mt-block">${앞뒤줄({ nextHref: 'CS0301' })}</div>

<div class="mt-block">${U.banner('info', '💬', '<b>찾으시는 공지가 목록에 안 보이나요?</b>', { right: U.btn('문의하기', { href: 'CS-02', cls: 'btn-ghost btn-sm' }) })}</div>
`;

  const body = `
${U.pageHd('공지사항', '이전·다음 공지 — 첫 글에서는 이전이 잠깁니다',
    `<div class="btns">${U.btn('공지 처음으로', { href: 'CS0301', cls: 'btn-ghost' })}${U.btn('공지 목록으로', { href: 'HO-04', cls: 'btn-pri' })}</div>`)}

${공지kpis()}

${U.detailSplit(본문, 공지액션({ state: '진행중' }))}
`;
  return { body, o: {} };
}

/* ---------------- CS0305 공지사항 상세 > 첨부 파일 ---------------- */
function CS0305() {
  const 안열리는것 = CS_FILES.filter((f) => f.x);

  const 파일표 = U.dashTable(
    [{ t: '파일 이름' }, { t: '형식', w: '88px' }, { t: '크기', w: '88px' }, { t: '바로 열기', w: '128px' }, { t: '', w: '108px' }],
    CS_FILES.map((f) => [
      `<b>📎 ${U.esc(f.nm)}</b>`,
      U.badge(f.kind, 'b-mut'),
      `<span class="t-sub nowrap">${f.size}</span>`,
      f.x ? `<span class="t-sub">안 열려요</span>` : U.badge('브라우저에서 열림', 'b-ok'),
      U.btn('내려받기', { cls: 'btn-ghost btn-xs', attr: ` data-toast="${U.esc(f.nm)} 를 내려받았어요" data-toast-kind="ok"` }),
    ]),
    { max: '300px' },
  );

  const 본문 = `
${공지머리({ extra: U.badge(`붙임 ${CS_FILES.length}개`, 'b-mut') })}

${U.banner('info', '📎', `<b>이 공지에 파일 ${U.num(CS_FILES.length)}개가 붙어 있어요.</b>
  <div class="t-sub mt1">내려받기를 누르면 저장되고, 다 받으면 아래쪽에 「내려받았어요」 알림이 잠깐 떴다 사라집니다.</div>`,
    { right: U.btn('모두 내려받기 (zip)', { cls: 'btn-pri btn-sm', attr: ' data-toast="붙임 파일 3개를 zip 으로 내려받았어요" data-toast-kind="ok"' }) })}

<div class="mt-block">${U.card('붙임 파일', 파일표, {
    aside: `<span class="t-sub">모두 ${U.num(CS_FILES.length)}개 · 634KB</span>`,
    bdCls: 'p0',
  })}</div>

${안열리는것.length ? `<div class="mt-block">${U.banner('warn', '⚠', `<b>「${U.esc(안열리는것[0].nm)}」은 브라우저에서 바로 안 열려요.</b>
  <div class="t-sub mt1">표 파일(XLSX)은 브라우저가 읽지 못해 화면에 바로 못 띄웁니다. 내려받아 엑셀이나 구글 스프레드시트로 열어 주세요.
  같은 내용을 그림으로 만든 <b>「바뀌는 규칙 한 장 요약.png」</b>도 함께 붙여 두었어요 — 그건 바로 보입니다.</div>`,
  { right: U.btn('한 장 요약 보기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="바뀌는 규칙 한 장 요약.png 를 열었어요"' }) })}</div>` : ''}

<div class="mt-block">${U.card('한 장 요약 미리보기', `
  ${U.phMap('바뀌는 규칙 한 장 요약 (공지 첨부 이미지)', 1200, 800, { seed: 'notice-summary' })}
  <p class="t-sub mt3">이미지 파일은 이렇게 화면에서 바로 볼 수 있어요. 크게 보시려면 내려받아 주세요.</p>
  <div class="btns mt3">${U.btn('이미지 내려받기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="바뀌는 규칙 한 장 요약.png 를 내려받았어요" data-toast-kind="ok"' })}</div>`)}</div>

<div class="mt-block">${U.card('파일이 안 열릴 때는', `
  ${U.kv([
    ['PDF 가 안 열려요', '브라우저에서 바로 열립니다. 안 열리면 내려받아 PDF 뷰어로 열어 주세요'],
    ['XLSX 가 안 열려요', '엑셀·구글 스프레드시트·한셀로 열 수 있어요. 같은 내용의 PNG 요약도 붙어 있습니다'],
    ['파일이 깨져요', '내려받다 끊긴 것일 수 있어요. 다시 내려받아 보시고 그래도 안 되면 문의해 주세요'],
    ['휴대폰에서 안 열려요', '파일 앱에 저장한 뒤 여는 것이 가장 확실해요'],
  ])}
  <div class="btns mt4">${U.btn('이 파일에 관해 문의하기', { href: 'CS-02', cls: 'btn-ghost btn-sm' })}</div>`)}</div>

<div class="mt-block">${앞뒤줄()}</div>
`;

  const body = `
${U.pageHd('공지사항', `붙임 파일 ${U.num(CS_FILES.length)}개 — 이름·크기와 내려받기`,
    `<div class="btns">${U.btn('공지 처음으로', { href: 'CS0301', cls: 'btn-ghost' })}${U.btn('공지 목록으로', { href: 'HO-04', cls: 'btn-ghost' })}</div>`)}

${공지kpis()}

${U.detailSplit(본문, 공지액션({ state: '진행중' }))}
`;
  return { body, o: {} };
}

export const PAGES = {
  CS0101, CS0102, CS0103, CS0104, CS0105,
  CS0201, CS0202, CS0203, CS0204, CS0205,
  CS0301, CS0302, CS0303, CS0304, CS0305,
};
