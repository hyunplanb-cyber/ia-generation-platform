/* CS 고객센터 — 잎사귀 8장.
   부모(CS0101 자주 묻는 질문 · CS0201 1:1 문의 · CS0301 공지사항 상세)의 뼈대·색·톤은
   U.shell() 이 그대로 유지해 준다. 여기서는 그 화면의 «상태·세부»만 보여 준다.

   ⚠ 이 파일에서 지킨 것
     - 숫자는 손으로 두 번 적지 않는다. FAQ·POSTS·PRICE 를 «세어서» 쓴다.
       「N건을 찾았어요」의 N 은 아래 목록을 실제로 걸러서 나온 길이다.
     - 강아지 이름은 data.mjs 의 MINE(초코·보리)뿐이다. 새 이름을 짓지 않는다.
     - 탭과 몸통은 반드시 U.tabBox() 로 «한 상자»에 묶는다. 갈라 놓으면
       app.js 가 몸통을 못 찾아 «색만 바뀌는 탭»이 된다.
     - 브라우저가 스스로 띄우는 확인·입력·경고 창을 쓰지 않는다.
       무인 검사기(헤드리스 크롬)가 그 자리에서 영원히 멈춘다. 확인이 필요하면
       app.js 의 물어보기·골라받기·적어받기 또는 U.modal() + data-modal 을 쓴다. */
import * as U from './ui.mjs';
import {
  SITE, TODAY, FAQ, QNA, POSTS, MINE, DOG, CLS,
  MY_PASS, MY_PASS2, MY_REG, PRICE, unit, STAFF, NOTES,
} from './data.mjs';

const P = {};
export const PAGES = P;

const 초코 = DOG('d01');
const 보리 = DOG('d02');
const 분류 = ['예약', '요금·회차권', '백신·건강', '반 편성', '알림장'];
const 원장 = STAFF[0];

/** 찾은 낱말에 밑줄을 긋는다. 글자는 먼저 감싸 두고(esc) 그 위에 표시만 얹는다. */
const 밑줄 = (s, w) => U.esc(s).split(w).join(`<b class="hl">${w}</b>`);

/** 「도움이 됐나요?」 한 줄 — data-vote 손잡이가 app.js 에 이미 있다.
    누르면 두 단추가 함께 잠기고 그 자리에 답이 붙는다(중복 투표 차단). */
const 투표줄 = () => `<div class="row wrap-row mt6">
  <span class="t-sub">도움이 됐나요?</span>
  <button class="btn btn-ghost btn-sm" type="button" data-vote="y">👍 네</button>
  <button class="btn btn-ghost btn-sm" type="button" data-vote="n">👎 아니요</button>
</div>`;
/** 이미 투표를 마친 줄 — 단추가 잠겨 있고 답이 붙어 있다 */
const 투표끝 = (말) => `<div class="row wrap-row mt6">
  <span class="t-sub">도움이 됐나요?</span>
  <button class="btn btn-ghost btn-sm is-off" type="button" disabled>👍 네</button>
  <button class="btn btn-ghost btn-sm is-off" type="button" disabled>👎 아니요</button>
  <span class="t-sub">${말}</span>
</div>`;

/* ============================================================
   CS0102 자주 묻는 질문 > 검색 결과
   ⭐ 검색이 «실제로» 목록을 줄인다.
      data-search-for + 줄마다 data-tag + data-filter-cnt + data-empty-for + data-search-word
   ⚠ 「4건을 찾았어요」의 4 는 아래에서 실제로 걸러 나온 줄 수다 — 손으로 적지 않았다.
   ============================================================ */
P['CS0102'] = (ctx) => {
  const 낱말 = '회차권';
  /* app.js 의 찾기와 «같은 규칙»으로 센다 — 줄의 글자(분류 배지 + 질문 + 답)에 낱말이 들었는가 */
  const 찾음 = FAQ.filter((f) => `${f.c} ${f.q} ${f.a}`.includes(낱말));

  const 항목 = 찾음.map((f) => ({
    attr: ` data-tag="${U.esc(f.c)}"`,
    q: `<span><span class="badge b-line" style="margin-right:var(--sp-stack)">${U.esc(f.c)}</span>${밑줄(f.q, 낱말)}</span>`,
    a: `<p>${밑줄(f.a, 낱말)}</p>${투표줄()}`,
  }));

  const body = `${U.leafHd(ctx, `찾은 낱말 「${U.esc(낱말)}」 — 질문·답변·분류에서 함께 찾습니다`)}

<div class="filters">
  ${U.input({ ph: '궁금한 것을 적어 보세요 (예: 회차권, 백신)', v: 낱말, cls: 'search', attr: ' data-search-for="faq"' })}
  ${U.chips(['전체', ...분류], 0, { boxAttr: ' data-filter-for="faq"' })}
</div>

<p class="t-sub mb4">「<b class="hl" data-search-word="faq">${U.esc(낱말)}</b>」이 든 질문 <b data-filter-cnt="faq">${찾음.length}</b>건을 찾았어요.
  질문에 없어도 <b>답변이나 분류</b>에 그 말이 있으면 함께 나옵니다.</p>

<div data-filter-list="faq">${U.accordion(항목, 0)}</div>
<div hidden data-empty-for="faq">${U.empty('🔍', '검색 결과가 없습니다',
    '「<b data-search-word="faq">—</b>」이(가) 든 질문을 못 찾았어요. 낱말을 짧게 줄이거나 위 분류를 눌러 보세요.',
    U.btn('1:1 문의하기', { href: 'CS0201', cls: 'btn-pri' }))}</div>

${U.banner('info', '🔎', `<b>찾는 요령</b>
  <div class="t-sub mt2">「회차권 환불 규정이 어떻게 되나요」처럼 길게 적으면 잘 안 나옵니다.
  <b>회차권</b> · <b>백신</b> · <b>반 편성</b>처럼 낱말 하나로 줄여 보세요.
  위 분류 단추를 함께 누르면 찾은 결과를 그 분류 안에서 다시 좁힙니다.</div>`, { cls: 'mt8' })}

${U.banner('acc', '💬', `<b>원하는 답을 못 찾으셨나요?</b>
  <div class="t-sub mt2">1:1 문의를 남기시면 평일 기준 하루 안에 답을 드립니다.
  급하시면 카카오톡 채널 ${U.esc(U.조사(SITE.kakao, '으로', '로'))} 남겨 주세요.</div>`,
    { cls: 'mt6', right: U.btn('1:1 문의', { href: 'CS0201', cls: 'btn-pri', sm: true }) })}

<div class="btns mt8">
  ${U.btn('자주 묻는 질문 전체 보기', { href: 'CS0101', cls: 'btn-ghost' })}
  ${U.btn('분류 탭으로 보기', { href: 'CS0103', cls: 'btn-ghost' })}
</div>`;

  /* 자주 묻는 질문은 로그인 없이도 보는 화면이다 — 계정 줄을 손님으로 못 박는다 */
  return { body, o: { guest: true } };
};

/* ============================================================
   CS0103 자주 묻는 질문 > 분류 탭
   ⭐ 탭과 몸통을 U.tabBox() 로 «한 상자»에 묶는다.
      따로 늘어놓으면 탭 색만 바뀌고 몸통은 그대로다(이 저장소에서 세 번 밟은 지뢰).
   ⚠ 스펙팩에 backTo 가 없다 — 그래서 머리말 아래에 돌아갈 단추를 직접 둔다.
   ============================================================ */
P['CS0103'] = (ctx) => {
  const 무리 = [{ nm: '전체', 것: FAQ }, ...분류.map((c) => ({ nm: c, 것: FAQ.filter((f) => f.c === c) }))];

  const 탭 = 무리.map((g, i) => ({ label: U.esc(g.nm), cnt: g.것.length, pane: `t${i}` }));
  const 몸통 = 무리.map((g, i) => U.pane(`t${i}`, `
    <p class="t-sub mb4">「${U.esc(g.nm)}」 분류에 ${g.것.length}건이 있어요.</p>
    ${U.accordion(g.것.map((f) => ({
    q: `<span><span class="badge b-line" style="margin-right:var(--sp-stack)">${U.esc(f.c)}</span>${U.esc(f.q)}</span>`,
    a: `<p>${U.esc(f.a)}</p>${투표줄()}`,
  })), i === 0 ? 0 : -1)}`, i === 0)).join('');

  const body = `${U.leafHd(ctx, '자주 묻는 질문 화면의 한 갈래입니다 — 분류를 누르면 그 분류의 질문만 남습니다')}

${U.sec('분류로 골라 보기', U.tabBox(탭, 몸통, 0), {
    desc: `분류 옆 숫자는 그 분류에 든 질문 수입니다. 다 더하면 ${FAQ.length}건 — 「전체」와 같습니다.`,
  })}

${U.banner('info', '🔗', `<b>탭을 옮겨도 화면 주소는 그대로입니다</b>
  <div class="t-sub mt2">뒤로가기가 탭 사이에 끼어들지 않습니다. 보시던 분류를 그대로 두고 앞 화면으로 돌아갈 수 있어요.</div>`, { cls: 'mt8' })}

${U.banner('acc', '💬', `<b>분류를 다 봐도 답이 없다면</b>
  <div class="t-sub mt2">1:1 문의를 남겨 주세요. 평일 기준 하루 안에 답을 드립니다.</div>`,
    { cls: 'mt6', right: U.btn('1:1 문의', { href: 'CS0201', cls: 'btn-pri', sm: true }) })}

<div class="btns mt8">
  ${U.btn('자주 묻는 질문 전체 보기', { href: 'CS0101', cls: 'btn-ghost' })}
  ${U.btn('낱말로 찾기', { href: 'CS0102', cls: 'btn-ghost' })}
</div>`;

  return { body, o: { guest: true } };
};

/* ============================================================
   CS0104 자주 묻는 질문 > 도움 여부 투표
   ⭐ data-vote 손잡이가 app.js 에 이미 있다 — 누르면 두 단추가 함께 잠기고 답이 붙는다.
   ⭐ 「아니요」 뒤에 받는 까닭 고르기는 data-pick-scope 로 개수·잠금이 진짜로 움직인다.
      처음에는 하나도 고르지 않았으므로 «0개»이고 보내기 단추가 잠겨 있다.
   ============================================================ */
P['CS0104'] = (ctx) => {
  const 끝난것 = FAQ[3];                 // 요금·회차권 — 회차권은 언제까지 쓸 수 있나요?
  const 남은것 = [FAQ[0], FAQ[7]];       // 아직 투표하지 않은 질문 둘
  const 까닭 = ['찾던 내용이 아니에요', '설명이 어려워요', '내 경우와 달라요', '더 자세한 예가 필요해요'];

  const body = `${U.leafHd(ctx, '답변마다 한 번씩 「도움이 됐나요?」를 물어봅니다')}

${U.banner('info', '🗳️', `<b>한 질문에 한 번만 투표할 수 있어요</b>
  <div class="t-sub mt2">투표하면 그 자리에서 두 단추가 함께 잠깁니다. 실수로 두 번 눌러도 표가 겹치지 않습니다.
  누가 눌렀는지는 남기지 않아요 — 어떤 답변을 더 손봐야 하는지만 셉니다.</div>`)}

${U.sec('이미 투표한 질문', U.accordion([{
    q: `<span><span class="badge b-line" style="margin-right:var(--sp-stack)">${U.esc(끝난것.c)}</span>${U.esc(끝난것.q)}</span>`,
    a: `<p>${U.esc(끝난것.a)}</p>${투표끝('고맙습니다! 도움이 됐다니 다행이에요')}`,
  }], 0), { cls: 'mt8', desc: '이미 「네」를 눌러 두었습니다. 단추가 잠겨 다시 누를 수 없어요.' })}

${U.sec('아직 투표하지 않은 질문', U.accordion(남은것.map((f) => ({
    q: `<span><span class="badge b-line" style="margin-right:var(--sp-stack)">${U.esc(f.c)}</span>${U.esc(f.q)}</span>`,
    a: `<p>${U.esc(f.a)}</p>${투표줄()}`,
  })), [0, 1]), { desc: '눌러 보세요 — 그 자리에서 단추가 잠기고 인사말이 붙습니다.' })}

${U.card('도움이 되지 않았다면, 어디가 아쉬웠나요', `
  <div class="chips" data-pick-scope="why">
    ${까닭.map((t) => `<button class="chip" type="button">${U.esc(t)}</button>`).join('')}
  </div>
  <p class="hint">여러 개를 고를 수 있어요. 지금 <b data-pick-out="why">0</b>개를 골랐습니다 —
    하나 이상 고르시면 아래 단추가 열립니다.</p>
  <div class="btns mt6">
    ${U.btn('아쉬운 점 보내기', {
    cls: 'btn-pri', id: 'whyBtn', off: true,
    attr: ' data-pick-btn="why" data-notify="알려 주셔서 고맙습니다 — 이 답변부터 다시 손보겠습니다"',
  })}
    ${U.btn('1:1 문의로 물어보기', { href: 'CS0201', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt8' })}

${U.banner('acc', '📌', `<b>「아니요」가 쌓인 답변부터 다시 씁니다</b>
  <div class="t-sub mt2">한 달에 한 번 표를 모아 봅니다. 「아니요」가 많은 답변은 예시를 더 넣거나 문장을 쪼개 다시 씁니다.
  고쳐 쓴 답변은 공지사항으로도 알려 드려요.</div>`,
    { cls: 'mt6', right: U.btn('공지사항 보기', { href: 'CS0301', cls: 'btn-sub', sm: true }) })}

<div class="btns mt8">
  ${U.btn('자주 묻는 질문 전체 보기', { href: 'CS0101', cls: 'btn-ghost' })}
</div>`;

  return { body, o: { guest: true } };
};

/* ============================================================
   CS0202 1:1 문의 > 반려견 자동 연결
   ⭐ 탭을 누르면 «아래 요약이 실제로 바뀐다» — U.tabBox() 한 상자.
   ⭐ 함께 보낼 것을 고르는 체크는 data-pick-scope 로 개수·잠금이 진짜로 움직인다.
   ⚠ 이름은 data.mjs 의 MINE(초코·보리)뿐이다. 지어내지 않는다.
   ============================================================ */
P['CS0202'] = (ctx) => {
  /* 아이마다 «자동으로 붙는» 값. 전부 data.mjs 에서 읽는다. */
  const 붙는것 = {
    d01: [
      ['최근 등원', '2026-08-21 (금)'],
      ['다음 예약', '2026-08-26 (수)'],
      ['회차권', `${MY_PASS.n}회권 중 <b>${MY_PASS.left}회</b> 남음 (${MY_PASS.until}까지 · ${MY_PASS.leftDays}일)`],
      ['정기 요일', `매주 ${MY_REG.days.join('·')}`],
      ['백신', `${U.vacBadge(초코, { full: true })}`],
    ],
    d02: [
      ['최근 등원', `${TODAY.label} · 오늘 ${보리.inAt} 등원해 원에 있어요`],
      ['최근 알림장', `${NOTES.filter((n) => n.dog === '보리')[0].date} (${NOTES.filter((n) => n.dog === '보리')[0].dow})`],
      ['회차권', `${MY_PASS2.n}회권 중 <b>${MY_PASS2.left}회</b> 남음 (${MY_PASS2.until}까지 · ${MY_PASS2.leftDays}일)`],
      ['백신', `${U.vacBadge(보리, { full: true })}`],
    ],
  };

  const 탭 = MINE.map((d, i) => ({ label: `${U.esc(d.nm)} · ${U.esc(CLS(d.cls).nm)}`, pane: `dog${i}` }));
  const 몸통 = MINE.map((d, i) => U.pane(`dog${i}`, `
    <div class="row wrap-row mb4">${U.dogPh(d.nm, 56)}
      <div class="grow"><div class="t-card">${U.esc(d.nm)}</div>
        <div class="t-sub">${U.esc(d.breed)} · ${d.kg}kg · ${U.esc(CLS(d.cls).nm)} · ${U.esc(d.age)} ${U.esc(d.sex)}</div></div></div>
    ${U.kv(붙는것[d.id], { cls: 'left' })}
    <p class="hint">${U.esc(U.조사(d.nm, '이의', '의'))} 정보가 문의와 함께 전달됩니다 — 저희가 다시 여쭤보는 일이 줄어듭니다.</p>`,
  i === 0)).join('');

  const 함께 = [
    ['최근 등원·예약 내역', '언제 왔고 다음에 언제 오시는지'],
    ['회차권·정기권 잔여', '몇 회가 남았고 언제까지인지'],
    ['백신 유효기간', '종합백신·광견병이 언제까지인지'],
  ];

  const body = `${U.leafHd(ctx, '문의를 쓰는 동안 우리 아이 정보가 저절로 따라붙습니다')}

${U.banner('info', '🐾', `<b>아이를 고르면 그 아이의 정보가 자동으로 채워집니다</b>
  <div class="t-sub mt2">따로 적어 넣지 않으셔도 됩니다. 아래 탭에서 아이를 바꾸면 함께 보낼 정보도 그 아이 것으로 바뀝니다.</div>`)}

${U.card('무엇을 물어보시나요', `
  ${U.field('문의 유형', U.select(['예약', '결제', '백신', '알림장', '기타'], 0), { req: true })}
  ${U.field('문의 내용', U.textarea({ ph: '언제 있었던 일인지, 무엇이 궁금한지 적어 주세요.', attr: ' style="min-height:140px"' }), { req: true })}`,
    { cls: 'mt8' })}

${U.card(`어느 아이에 대한 문의인가요 <span class="t-sub">— 등록된 ${MINE.length}마리</span>`,
    U.tabBox(탭, 몸통, 0), { cls: 'mt6' })}

${U.card('함께 보낼 정보 고르기', `
  <div class="stack" data-pick-scope="attach">
    ${함께.map(([t, s]) => U.check(U.esc(t), { on: true, sub: U.esc(s) })).join('')}
  </div>
  <p class="hint">지금 <b data-pick-out="attach">${함께.length}</b>가지를 함께 보냅니다.
    하나도 고르지 않으면 함께 보낼 것이 없어 아래 단추가 잠깁니다.</p>
  <div class="btns mt6">
    ${U.btn('문의 제출', {
    cls: 'btn-pri', id: 'linkBtn',
    attr: ' data-pick-btn="attach" data-notify="문의를 접수했어요 — 고른 정보가 함께 전달됩니다. 평일 기준 하루 안에 답을 드립니다"',
  })}
    ${U.btn('1:1 문의 화면으로', { href: 'CS0201', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt6' })}

${U.banner('acc', '🔒', `<b>보내는 것은 이 아이의 이용 기록뿐입니다</b>
  <div class="t-sub mt2">전화번호·주소 같은 보호자 정보는 문의에 붙지 않습니다.
  담당자는 답변에 필요한 만큼만 봅니다.</div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('자주 묻는 질문 먼저 보기', { href: 'CS0101', cls: 'btn-ghost' })}
  ${U.btn('공지사항 보기', { href: 'CS0301', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   CS0203 1:1 문의 > 첨부 용량 초과
   ⭐ 보내기 단추가 «실제로» 잠긴다 — U.btn(…, { id, off: true }) 로 <button> 을 만들고
      압축 동의 체크(data-unlock)가 그것을 연다. <a> 로 만들면 잠기지 않는다.
   ⚠ 한도(파일당 10MB · 한 번에 5개)는 부모 화면 CS0201 의 안내와 같은 값이다.
   ⚠ 합계는 손으로 적지 않고 reduce 로 센다.
   ============================================================ */
P['CS0203'] = (ctx) => {
  const 한도 = 10;          // 파일당 MB — 부모 화면의 안내와 같은 값
  const 개수한도 = 5;
  const 첨부 = [
    ['진료비 영수증.jpg', 2.4, 'JPG', '동물병원에서 받은 영수증'],
    ['백신 수첩 사진.png', 3.1, 'PNG', '종합백신 접종일이 적힌 쪽'],
    ['동물병원 소견서.pdf', 1.2, 'PDF', '재접종 일정 소견'],
    ['등원 영상.mp4', 14.8, 'MP4', '아침에 찍은 30초 영상'],
  ];
  const 넘음 = 첨부.filter((f) => f[1] > 한도);
  const 총합 = 첨부.reduce((s, f) => s + f[1], 0);
  const 줄임 = 넘음.reduce((s, f) => s + Math.round(f[1] * 0.3 * 10) / 10, 0);
  const 줄인뒤 = Math.round((총합 - 넘음.reduce((s, f) => s + f[1], 0) + 줄임) * 10) / 10;
  const mb = (n) => `${Math.round(n * 10) / 10}MB`;

  const body = `${U.leafHd(ctx, '올리신 파일 하나가 한도를 넘었습니다')}

${U.banner('dan', '⚠️', `<b>${U.esc(넘음[0][0])} (${mb(넘음[0][1])})가 파일당 한도 ${한도}MB를 넘었어요</b>
  <div class="t-sub mt2">지금 올리신 것은 <b>${첨부.length}개 · 모두 ${mb(총합)}</b>입니다.
  올릴 수 있는 것은 <b>한 번에 ${개수한도}개까지, 파일당 ${한도}MB까지</b>예요.
  이 파일을 빼시거나, 아래에서 자동으로 줄여 첨부하시면 그대로 보낼 수 있습니다.</div>`)}

${U.card(`올리신 파일 ${첨부.length}개`, U.table(
    [{ t: '파일 이름' }, { t: '형식', w: '90px' }, { t: '크기', w: '110px', cls: 'r' }, { t: '상태', w: '120px' }],
    첨부.map(([nm, sz, kind, why]) => ({
      cls: sz > 한도 ? 'bad' : '',
      cells: [
        `<b>${U.esc(nm)}</b><div class="t-sub mt1">${U.esc(why)}</div>`,
        U.esc(kind),
        { t: `<span class="num">${mb(sz)}</span>`, cls: 'r' },
        sz > 한도 ? U.badge(`한도 ${한도}MB 초과`, 'b-dan') : U.badge('올릴 수 있어요', 'b-ok'),
      ],
    })),
    { foot: ['합계', '', { t: `<span class="num">${mb(총합)}</span>`, cls: 'r' }, `${첨부.length}개 / ${개수한도}개`] },
  ), { cls: 'mt8' })}

${U.card('큰 파일을 줄여서 첨부할까요', `
  ${U.box(`<div class="row-b wrap-row">
    <div><div class="t-card">${U.esc(넘음[0][0])}</div>
      <div class="t-sub mt1">지금 ${mb(넘음[0][1])} → 줄이면 약 ${mb(줄임)}</div></div>
    <div class="t-sub">첨부 전체가 ${mb(총합)} → 약 ${mb(줄인뒤)}로 줄어듭니다</div>
  </div>`)}
  <div class="mt4">${U.check('이 파일을 자동으로 줄여서 첨부합니다', {
    sub: `영상은 화면 크기를 절반으로 줄여 담습니다. 원본이 필요하시면 카카오톡 채널 ${U.esc(U.조사(SITE.kakao, '으로', '로'))} 따로 보내 주세요.`,
    attr: ' data-unlock="attBtn"',
  })}</div>
  <div class="btns mt6">
    ${U.btn('문의 제출', {
    cls: 'btn-pri', id: 'attBtn', off: true,
    attr: ' data-notify="줄인 파일과 함께 문의를 접수했어요 — 평일 기준 하루 안에 답을 드립니다"',
  })}
    ${U.btn('이 파일 빼고 보내기', {
    cls: 'btn-ghost',
    attr: ` data-toast="${U.esc(U.조사(넘음[0][0], '을', '를'))} 뺐어요 — 남은 ${첨부.length - 넘음.length}개 ${mb(총합 - 넘음[0][1])}는 그대로 올라갑니다"`,
  })}
  </div>
  <p class="hint">줄이기에 동의하시기 전까지 <b>제출 단추는 잠겨 있습니다.</b> 한도를 넘긴 채로는 보낼 수 없어요.</p>`,
    { cls: 'mt6' })}

${U.banner('info', '📎', `<b>이렇게 하시면 대개 한도 안에 들어옵니다</b>
  <div class="t-sub mt2">① 영상 대신 사진 두세 장 ② 증명서는 사진보다 PDF 가 가볍습니다
  ③ 화면을 통째로 찍기보다 필요한 쪽만 잘라 주세요.</div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('1:1 문의 화면으로', { href: 'CS0201', cls: 'btn-ghost' })}
  ${U.btn('자주 묻는 질문', { href: 'CS0101', cls: 'btn-ghost' })}
</div>`;

  return { body, o: {} };
};

/* ============================================================
   CS0204 1:1 문의 > 답변 완료 상세
   ⚠ 오늘은 ${TODAY.label} 이다. 답변이 문의보다 앞설 수 없다 —
     문의 8/18 (화) → 접수 확인 8/18 (화) → 답변 8/19 (수) → 오늘 8/24 (월).
   ⭐ 만족도는 data-pick-scope 로 «고른 개수»가 진짜로 세어지고 단추가 열린다.
      처음에는 하나도 고르지 않았으므로 0개이고 단추가 잠겨 있다.
   ============================================================ */
P['CS0204'] = (ctx) => {
  const q = QNA[0];
  const 만족 = ['매우 만족', '만족', '보통', '아쉬움', '매우 아쉬움'];

  const main = `
${U.card(U.esc(q.t), `
  <div class="row wrap-row mb6">${U.stBadge(q.st)}${U.badge(U.esc(q.kind), 'b-line')}
    <span class="t-sub">${U.esc(q.date)} (화) 접수 · 문의 번호 ${U.esc(q.id.toUpperCase())}</span></div>

  ${U.box(`<div class="t-sub mb2">내가 남긴 문의 · 2026-08-18 (화) 14:20</div><p>${U.esc(q.q)}</p>`)}

  <div class="mt6">${U.banner('ok', '💬', `<div class="t-sub mb2">${U.esc(SITE.name)} ${U.esc(원장.nm)} ${U.esc(원장.role)} · 2026-08-19 (수) 10:35</div>
    <p>${U.esc(q.a)}</p>`)}</div>

  <div class="mt6">${U.kv([
    ['환불 기준', `쓰지 않은 횟수는 산 값 그대로, 이미 쓰신 횟수는 1회 이용권 정가 ${U.won(PRICE.once)}으로 계산합니다`],
    ['신청하는 곳', '마이페이지 › 회차권 현황'],
    ['처리 기간', '신청 뒤 3영업일'],
  ], { cls: 'left' })}</div>`)}

${U.card('처리 흐름', U.timeline([
    { hh: '2026-08-18 (화) 14:20', t: '보호자님이 문의를 남겼어요', d: '요금·결제 갈래로 접수됐습니다', k: 'done' },
    { hh: '2026-08-18 (화) 14:21', t: '접수 확인 카카오톡을 보냈어요', d: `채널 ${U.esc(SITE.kakao)}에서 확인하실 수 있어요`, k: 'done' },
    { hh: '2026-08-19 (수) 10:35', t: `${U.esc(원장.nm)} ${U.esc(원장.role)}이 답변했어요`, d: '문의를 남기신 다음 날 답이 나갔습니다', k: 'done' },
    { hh: `오늘 · ${U.esc(TODAY.label)}`, t: '이어서 물어보실 수 있어요', d: '답변이 끝난 뒤에도 이 자리에서 계속 이어집니다', k: 'on' },
  ]), { cls: 'mt6' })}

${U.card('이어서 물어보기', `
  ${U.field('추가로 물어볼 것이 있으면 적어 주세요',
    U.textarea({ ph: '답변에서 이해가 안 된 부분이나 더 궁금한 것을 적어 주세요.', attr: ' style="min-height:120px"' }))}
  <div class="btns mt6">
    ${U.btn('이어서 문의 남기기', {
    cls: 'btn-pri', id: 'moreBtn',
    attr: ' data-notify="이어서 남긴 문의를 접수했어요 — 같은 담당자가 이어서 답을 드립니다"',
  })}
    ${U.btn('지난 문의 목록', { href: 'CS0201', cls: 'btn-ghost' })}
  </div>`, { cls: 'mt6' })}

${U.card('답변이 도움이 되었나요', `
  ${U.radioRow('rate', 만족, -1, { boxAttr: ' data-pick-scope="rate"' })}
  <p class="hint">지금 <b data-pick-out="rate">0</b>개를 골랐습니다 — 하나를 고르시면 아래 단추가 열립니다.
    남겨 주신 만족도는 담당자별로 모아 답변을 다듬는 데만 씁니다.</p>
  <div class="btns mt6">
    ${U.btn('만족도 보내기', {
    cls: 'btn-pri', id: 'rateBtn', off: true,
    attr: ' data-pick-btn="rate" data-notify="만족도를 보내 주셔서 고맙습니다"',
  })}
  </div>`, { cls: 'mt6' })}`;

  const aside = `
${U.card('이 문의와 함께 전달된 정보', `
  <div class="row wrap-row mb4">${U.dogPh(초코.nm, 56)}
    <div class="grow"><div class="t-card">${U.esc(초코.nm)}</div>
      <div class="t-sub">${U.esc(초코.breed)} · ${초코.kg}kg · ${U.esc(CLS(초코.cls).nm)}</div></div></div>
  ${U.kv([
    ['회차권', `${MY_PASS.n}회권 중 ${MY_PASS.left}회 남음`],
    ['만료일', `${MY_PASS.until} (${MY_PASS.leftDays}일 남음)`],
    ['산 날', MY_PASS.bought],
    ['정기 요일', `매주 ${MY_REG.days.join('·')}`],
  ], { cls: 'left' })}
  <p class="hint">문의를 남기실 때 자동으로 붙은 정보입니다.</p>`)}

${U.card('내 지난 문의', `<div class="list1">
  ${QNA.slice(1).map((x) => `<div>
    <div class="row wrap-row">${U.stBadge(x.st)}${U.badge(U.esc(x.kind), 'b-line')}<span class="t-sub">${U.esc(x.date)}</span></div>
    <div class="t-card mt2">${U.esc(x.t)}</div></div>`).join('')}
</div>
<p class="hint">모두 답변이 끝났습니다. 지난 문의는 1:1 문의 화면 아래에서 볼 수 있어요.</p>`, { cls: 'mt6' })}

<div class="btns-v mt6">
  ${U.btn('1:1 문의 화면으로', { href: 'CS0201', cls: 'btn-ghost', w: true })}
  ${U.btn('자주 묻는 질문', { href: 'CS0101', cls: 'btn-ghost', w: true })}
  ${U.btn('공지사항', { href: 'CS0301', cls: 'btn-ghost', w: true })}
</div>`;

  return { body: `${U.leafHd(ctx, '문의와 답변이 한 줄로 이어집니다')}${U.detail2(main, aside)}`, o: {} };
};

/* ============================================================
   CS0302 공지사항 상세 > 이전·다음 공지 이동
   ⭐ 「글이 주인공」인 화면이므로 o.read = true — 본문 폭을 760px 로 좁힌다
      (스펙팩 common.readingWidth).
   ⚠ 「이전·다음」은 사람마다 반대로 읽는다. 그래서 «최신 쪽 / 지난 쪽»과 날짜를 함께 적었다.
   ⚠ 순서·번호는 POSTS 에서 세어 쓴다 — 손으로 적지 않는다.
   ============================================================ */
P['CS0302'] = (ctx) => {
  const 이번 = POSTS[1];                                   // 지금 보고 있는 글
  const 자리 = POSTS.findIndex((x) => x.id === 이번.id);    // 0부터
  const 최신쪽 = POSTS[자리 - 1];                           // 날짜가 더 새것
  const 지난쪽 = POSTS[자리 + 1];                           // 날짜가 더 오래된 것
  const 줄여 = (t) => (t.length > 20 ? `${t.slice(0, 20)}…` : t);

  /* 공지 제목에 적힌 「15%」를 여기서 한 번만 두고, 값은 전부 이 하나로 계산한다 */
  const 정가 = PRICE.packs[0];
  const 깎는율 = 15;
  const 깎은값 = Math.round(정가.price * (100 - 깎는율) / 100);
  const 아낀값 = 정가.price - 깎은값;

  const body = `${U.leafHd(ctx, `공지 ${POSTS.length}개 가운데 ${자리 + 1}번째 글입니다 — 아래에서 앞뒤로 옮겨 다닐 수 있어요`)}

<div class="row wrap-row mb4">${U.stBadge(이번.cat)}<span class="t-sub">${U.esc(이번.date)} 올림</span></div>
<h2 class="t-page">${U.esc(이번.t)}</h2>

<div class="mt8" style="font-size:var(--fs-card);line-height:var(--lh-body)">
  <p>안녕하세요, ${U.esc(SITE.name)}입니다.</p>
  <p class="mt6">처음 등록하신 보호자님께 <b class="hl">첫 달 안에 ${정가.n}회권을 사시면 ${깎는율}% 깎아</b> 드립니다.
  ${U.won(정가.price)}이던 ${정가.n}회권을 <b>${U.won(깎은값)}</b>에 드리니 ${U.won(아낀값)}을 아끼시는 셈이에요.</p>
  <p class="mt4">1회당 ${U.won(unit(정가))}이던 값이 ${U.won(Math.round(깎은값 / 정가.n))}이 됩니다.
  1회 이용권 ${U.won(PRICE.once)}과 견주면 차이가 더 크게 벌어져요.
  회차권은 산 날부터 ${정가.days}일 동안 쓰실 수 있습니다.</p>
  <p class="mt4">형제견을 함께 등록하시면 둘째 아이부터 ${PRICE.siblingOff}%를 더 깎아 드립니다.
  두 할인은 함께 쓰실 수 있어요.</p>
</div>

${U.card('앞뒤 공지로 옮기기', `
  <div class="stack">
    ${최신쪽 ? `<div class="row-b wrap-row">
      <div><div class="t-sub">‹ 최신 쪽 · ${U.esc(최신쪽.date)}</div>
        <div class="t-card mt1">${U.esc(최신쪽.t)}</div></div>
      ${U.btn('이 글 보기', { href: 'CS0301', cls: 'btn-ghost', sm: true })}
    </div>` : ''}
    <div class="row-b wrap-row" style="opacity:.72">
      <div><div class="t-sub">지금 보고 있는 글 · ${U.esc(이번.date)}</div>
        <div class="t-card mt1">${U.esc(이번.t)}</div></div>
      ${U.badge(`${POSTS.length}개 중 ${자리 + 1}번째`, 'b-line')}
    </div>
    ${지난쪽 ? `<div class="row-b wrap-row">
      <div><div class="t-sub">지난 쪽 · ${U.esc(지난쪽.date)} ›</div>
        <div class="t-card mt1">${U.esc(지난쪽.t)}</div></div>
      ${U.btn('이 글 보기', { href: 'CS0301', cls: 'btn-ghost', sm: true })}
    </div>` : ''}
  </div>`, { cls: 'mt8' })}

<div class="row-b wrap-row mt6" style="border-top:var(--hair) solid var(--border);padding-top:var(--sp-block)">
  ${U.btn(`‹ ${U.esc(줄여(최신쪽.t))}`, { href: 'CS0301', cls: 'btn-ghost', sm: true })}
  ${U.btn(`${U.esc(줄여(지난쪽.t))} ›`, { href: 'CS0301', cls: 'btn-ghost', sm: true })}
</div>

${U.banner('info', '↔️', `<b>「이전·다음」 대신 날짜로 적었습니다</b>
  <div class="t-sub mt2">게시판마다 「이전」이 최신 글이기도, 지난 글이기도 해서 헷갈립니다.
  그래서 올린 날짜를 함께 적어 두었어요. 지금 글은 ${POSTS.length}개 중 ${자리 + 1}번째입니다.</div>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('공지·이벤트 목록으로', { href: 'HO0501', cls: 'btn-pri' })}
  ${U.btn('공지사항 상세로', { href: 'CS0301', cls: 'btn-ghost' })}
  ${U.btn('자주 묻는 질문', { href: 'CS0101', cls: 'btn-ghost' })}
</div>`;

  return { body, o: { read: true } };
};

/* ============================================================
   CS0303 공지사항 상세 > 첨부파일 다운로드
   ⭐ 글이 주인공인 화면 — o.read = true (본문 폭 760px)
   ⚠ 파일 이름·크기는 부모 화면 CS0301 이 적어 둔 것과 «같은 두 개»다.
      진짜 파일은 만들지 않는다. 합계는 reduce 로 센다.
   ============================================================ */
P['CS0303'] = (ctx) => {
  const 공지 = POSTS[0];                     // 추석 연휴 휴무 안내 (2026-08-20)
  const 파일 = [
    ['추석 연휴 휴무 안내문.pdf', 182, 'PDF', '쉬는 날과 다시 여는 날, 정기 등원 처리 방법이 한 장에 담겨 있어요'],
    ['9월 등원 달력.pdf', 96, 'PDF', '9월 한 달 등원 가능한 날과 마감된 날을 달력으로 그려 두었습니다'],
  ];
  const 총합 = 파일.reduce((s, f) => s + f[1], 0);

  const body = `${U.leafHd(ctx, `${U.esc(공지.t)} — 붙어 있는 파일 ${파일.length}개`)}

<div class="row wrap-row mb4">${U.stBadge(공지.cat)}${U.badge('중요', 'b-solid')}<span class="t-sub">${U.esc(공지.date)} 올림</span></div>
<h2 class="t-page">${U.esc(공지.t)}</h2>
<p class="t-sub mt3">본문에 적힌 내용을 인쇄해서 두시거나 가족과 나누실 수 있게 파일로도 올려 두었습니다.</p>

${U.card(`첨부파일 ${파일.length}개 · 모두 ${총합}KB`, `<div class="stack">
  ${파일.map(([nm, kb, kind, why]) => `<div class="row-b wrap-row">
    <div class="grow"><div class="row wrap-row"><span>📎</span><b>${U.esc(nm)}</b>
      ${U.badge(U.esc(kind), 'b-line')}<span class="t-sub num">${kb}KB</span></div>
      <div class="t-sub mt1">${U.esc(why)}</div></div>
    ${U.btn('내려받기', {
    cls: 'btn-ghost', sm: true,
    attr: ` data-toast="${U.esc(U.조사(nm, '을', '를'))} (${kb}KB) 내려받습니다"`,
  })}
  </div>`).join('')}
</div>
<div class="btns mt6">
  ${U.btn(`${파일.length}개 모두 내려받기 (${총합}KB)`, {
    cls: 'btn-pri',
    attr: ` data-toast="첨부파일 ${파일.length}개 ${총합}KB 를 한 번에 내려받습니다"`,
  })}
</div>`, { cls: 'mt8' })}

${U.banner('info', '📄', `<b>파일이 안 열리시나요</b>
  <div class="t-sub mt2">두 파일 모두 PDF 입니다. 휴대폰에서는 「파일」 앱이나 카카오톡에서 바로 열립니다.
  안 열리시면 카카오톡 채널 ${U.esc(U.조사(SITE.kakao, '으로', '로'))} 알려 주세요 — 사진으로도 보내 드립니다.</div>`, { cls: 'mt8' })}

${U.banner('acc', '🖨️', `<b>인쇄해서 현관에 붙여 두셔도 됩니다</b>
  <div class="t-sub mt2">안내문은 A4 한 장, 달력은 A4 가로 한 장으로 맞춰 두었어요.</div>`, { cls: 'mt6' })}

${U.box(`<div class="t-card mb2">파일이 바뀌면 다시 알려 드려요</div>
<p class="t-sub">${U.esc(공지.date)}에 올린 파일입니다. 연휴 일정이 바뀌면 파일을 새로 올리고
카카오톡으로 다시 알려 드립니다. 늘 이 화면의 파일이 가장 최근 것이에요.</p>`, { cls: 'mt6' })}

<div class="btns mt8">
  ${U.btn('공지사항 상세로', { href: 'CS0301', cls: 'btn-ghost' })}
  ${U.btn('공지·이벤트 목록', { href: 'HO0501', cls: 'btn-ghost' })}
  ${U.btn('1:1 문의', { href: 'CS0201', cls: 'btn-sub' })}
</div>`;

  return { body, o: { read: true } };
};
