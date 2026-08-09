/* MY 내 요청 · RV 후기 */
import * as U from './ui.mjs';
import { MYREQS, PRO, REQ, QUOTES, REVIEWS, FLOW_CUS, CATS } from './data.mjs';

/* ---------------- MY-01 내 요청 목록 ---------------- */
function MY01(ctx) {
  const body = U.myPage('MY-01', `
  ${U.pageHd('내 요청', '보낸 요청과 진행 상황을 한곳에서 볼 수 있어요',
    U.btn('새 요청서 작성', { href: 'RQ-01', cls: 'btn-pri' }))}

  ${U.tabs([
    { label: '견적 대기', cnt: 2 }, { label: '진행 중', cnt: 1 },
    { label: '완료', cnt: 5 }, { label: '취소', cnt: 1 }, { label: '전체', cnt: 9 },
  ], 4)}

  <div class="row-b wrap-row mb4">
    <div class="searchbar sm grow" style="max-width:340px"><span class="ic">🔍</span><input type="text" placeholder="서비스명·요청 번호로 찾기"></div>
    <select class="input" style="width:auto"><option>최근 3개월</option><option>최근 1년</option><option>전체 기간</option></select>
  </div>

  <div class="list">${MYREQS.map((r) => `<div class="list-row${r.hot ? ' hot' : (r.st === '진행 중' ? ' today' : '')}">
    <div class="mid">
      <div class="row-c wrap-row">${U.stBadge(r.st)}<b class="t-card">${U.esc(r.svc)}</b>
        ${r.hot ? U.badge('마감 임박', 'b-dan') : ''}${r.todo ? U.badge('후기 미작성', 'b-acc') : ''}</div>
      <div class="t-sub mt1">${r.at} 요청 · ${r.no}</div>
      <div class="mt-item">${U.esc(r.info)}</div>
    </div>
    <div class="rt">
      ${U.btn(r.act[0], { href: r.act[1], cls: 'btn-pri btn-sm' })}
      ${U.btn('요청 상세', { href: 'MY-02', cls: 'btn-ghost btn-sm' })}
    </div></div>`).join('')}</div>

  <div class="mt-block">${U.banner('quiet', '📋', `요청이 하나도 없을 때는 <a class="link" href="${U.link('MY-03')}">이런 화면</a>이 나와요.`)}</div>

  ${U.sec('상태가 무슨 뜻인가요', `<div class="g4">
    ${[['견적 대기', '고수들이 값을 보내는 중이에요. 마감 전에 골라 주세요.'],
    ['진행 중', '고수를 골랐고 아직 일이 끝나지 않았어요.'],
    ['완료', '일이 끝나고 결제까지 마쳤어요.'],
    ['취소', '요청을 거두었거나 마감까지 아무도 고르지 않았어요.']]
    .map(([t, d]) => `<div class="box soft">${U.stBadge(t)}<p class="t-sub mt2">${d}</p></div>`).join('')}
  </div>`)}`);

  return { body, o: {} };
}

/* ---------------- MY-02 요청 상세 - 진행 상황 ---------------- */
function MY02(ctx) {
  const p = PRO('p1'), q = QUOTES[0];

  const main = `
  ${U.card('진행 상황', U.timeline(FLOW_CUS, 2), {
    aside: U.badge('고수 선택 차례', 'b-acc'),
  })}

  <div class="mt-block">${U.card('선택한 고수', `
    <div class="row-c wrap-row">
      ${U.phPro(72, p.id)}
      <div class="grow">
        <div class="row-c wrap-row"><b class="t-card">${U.esc(p.nm)}</b>${U.badge(p.cat, 'b-mut')}</div>
        <div class="t-sub mt1">${U.stars(p.r)} ${p.r.toFixed(1)} (${U.num(p.rv)}) · 응답률 ${p.resp}% · ${U.respText(p.respMin)}</div>
        <div class="verifies mt2">${p.tags.map(U.verify).join('')}</div>
      </div>
      <div class="btns col">
        ${U.btn('채팅하기', { href: 'CH-02', cls: 'btn-pri btn-sm' })}
        ${U.btn('전화 걸기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="010-****-1234 로 연결됩니다"' })}
      </div>
    </div>
    <div class="mt-block">${U.kv([
    ['확정 견적', `<b class="price">${U.won(q.price)}</b>`],
    ['확정 일정', '2026년 8월 20일 (목) 08:00'],
    ['예상 소요', q.hours],
  ])}</div>`)}</div>

  <div class="mt-block">${U.card('요청서에 쓴 내용', `<div class="col" style="gap:0">
    ${REQ.answers.map(([k, v], i) => `<div style="padding:var(--s3) 0${i ? ';border-top:1px solid var(--border)' : ''}">
      <div class="t-sub">${k}</div><div class="mt1">${U.esc(v)}</div></div>`).join('')}
    <div style="padding:var(--s3) 0;border-top:1px solid var(--border)">
      <div class="t-sub">사진</div>
      <div class="row mt2" style="gap:8px">${[1, 2, 3].map((i) => U.phFix(['짐 사진', 1200, 900], 80, { seed: 'up' + i })).join('')}</div>
    </div>
  </div>`, { aside: `<a class="more" href="${U.link('QT-01')}">받은 견적 5개 다시 보기 ›</a>` })}</div>`;

  const aside = `
  ${U.card('할 수 있는 일', `<div class="btns col">
    ${U.btn('일정 변경 요청', { cls: 'btn-ghost btn-block', attr: ' data-toast="고수에게 일정 변경을 요청했어요"' })}
    ${U.btn('받은 견적 다시 보기', { href: 'QT-01', cls: 'btn-ghost btn-block' })}
    ${U.btn('영수증 보기', { cls: 'btn-ghost btn-block', attr: ' data-toast="결제 후에 볼 수 있어요"' })}
    ${U.btn('취소·환불 요청', { cls: 'btn-ghost btn-block', attr: ' data-toast="취소 사유를 고르는 창이 열려요"' })}
    ${U.btn('문제 신고', { cls: 'btn-danger btn-block', attr: ' data-toast="신고 접수 창이 열려요"' })}
  </div>`)}

  <div class="mt4">${U.box(`<h4 class="t-card mb2">지금 하실 일</h4>
    <p class="t-sub">방문 전날 오후에 알림을 보내드릴게요. 주차 자리와 짐 상태를 미리 채팅으로 맞춰 두시면 당일이 훨씬 빨라요.</p>
    <div class="btns mt-block">${U.btn('채팅으로 맞추기', { href: 'CH-02', cls: 'btn-pri btn-block btn-sm' })}</div>`, { cls: 'pri' })}</div>

  <div class="mt4">${U.box(`<h4 class="t-card mb2">일이 끝나면</h4>
    <div class="col" style="gap:var(--sp-item)">
      <div class="t-sub">1. 작업이 끝난 것을 확인해요</div>
      <div class="t-sub">2. 결제 화면이 열려요</div>
      <div class="t-sub">3. 후기를 남기면 1,000 포인트</div>
    </div>`, { cls: 'soft' })}</div>`;

  const body = `
  <div class="row-b wrap-row mb4">
    <div><div class="row-c wrap-row">${U.badge('진행 중', 'b-acc')}<h1 class="t-page">${U.esc(REQ.svc)}</h1></div>
      <p class="t-sub">${REQ.no} · ${REQ.at} 요청</p></div>
  </div>
  ${U.detail2(main, aside)}`;

  return { body, o: {} };
}

/* ---------------- MY-03 내 요청 - 비어 있음 ---------------- */
function MY03(ctx) {
  const body = U.myPage('MY-01', `
  ${U.pageHd('내 요청', '')}

  ${U.empty('📋', '아직 보낸 요청이 없어요',
    '요청서 한 장이면 여러 고수가 값을 보내드려요. 받아보고 비교한 뒤 고르시면 됩니다.',
    U.btn('요청서 작성하기', { href: 'RQ-01', cls: 'btn-pri btn-lg' }) + U.btn('고수 둘러보기', { href: 'SE-01', cls: 'btn-ghost btn-lg' }))}

  ${U.sec('이렇게 진행돼요', `<div class="g3">
    ${[['1', '요청서 작성', '무엇을·언제·어디서·예산이 얼마인지 한 번에 한 질문씩 물어봐요. 3분이면 끝납니다.'],
    ['2', '견적 받기', '조건에 맞는 고수들에게 전달되고, 보통 30분 안에 첫 견적이 도착해요.'],
    ['3', '고수 선택', '가격·평점·응답 속도를 나란히 비교하고 한 명만 고르시면 됩니다.']]
    .map(([n, t, d]) => `<div class="box"><span class="badge b-pri lg">${n}</span>
      <h3 class="t-card mt2">${t}</h3><p class="t-sub mt1">${d}</p></div>`).join('')}
  </div>`)}

  <div class="sec">${U.card('', `<div class="row-b wrap-row">
    <div>
      <span class="badge b-acc">첫 이용 쿠폰</span>
      <h2 class="t-sec mt2">10,000원 할인 쿠폰이 있어요</h2>
      <p class="t-sub mt2">첫 이용 결제 때 자동으로 적용돼요. 2026년 12월 31일까지 쓸 수 있어요.</p>
    </div>
    ${U.btn('지금 요청서 쓰기', { href: 'RQ-01', cls: 'btn-acc btn-lg' })}
  </div>`, { cls: 'acc' })}</div>

  ${U.sec('무엇을 맡기시겠어요?', `<div class="cats">${CATS.slice(0, 8).map((c) =>
    `<a class="cat" href="${U.link('RQ-01')}"><div class="ic">${c.ic}</div><div class="nm">${c.nm}</div><div class="sub">${c.sub}</div></a>`).join('')}</div>`,
    { more: 'SE-01', moreLabel: '고수 둘러보기' })}`);

  return { body, o: {} };
}

/* ---------------- RV-01 후기 작성 ---------------- */
function RV01(ctx) {
  const p = PRO('p6');

  const main = `
  ${U.card('이용 내역', `<div class="row-c wrap-row">
    ${U.phPro(60, p.id)}
    <div class="grow"><b class="t-card">${U.esc(p.nm)}</b>
      <div class="t-sub">프로필 촬영 · 2026년 7월 4일 이용 · 90,000원</div></div>
    ${U.badge('완료', 'b-ok')}
  </div>`)}

  <div class="mt-block">${U.card('얼마나 만족하셨나요?', `
    <div class="center" style="padding:var(--s5) 0">
      ${U.rateIn('전체 만족도', 5, { big: true })}
    </div>`)}</div>

  <div class="mt-block">${U.card('항목별로도 알려 주세요', `
    ${U.rateIn('친절했나요', 5)}
    ${U.rateIn('시간을 지켰나요', 5)}
    ${U.rateIn('마무리가 깔끔했나요', 4)}
    ${U.rateIn('값이 적절했나요', 0)}
    <p class="t-sub mt3">항목별 점수는 고수 프로필에 평균으로만 보여요.</p>`)}</div>

  <div class="mt-block">${U.card('사진을 올려 주시겠어요?', `
    <div class="drop">
      <div class="ic">📷</div>
      <b>사진을 끌어다 놓거나 눌러서 고르세요</b>
      <p class="t-sub mt2">최대 5장 · 사진을 올리면 500 포인트를 더 드려요</p>
    </div>
    <div class="row mt4" style="gap:var(--s2)">
      ${[1, 2].map((i) => `<div style="position:relative">${U.phFix(['후기 사진', 1200, 900], 108, { seed: 'rv' + i })}
        <button class="btn btn-quiet btn-xs" type="button" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,.55);color:#fff" data-toast="사진을 뺐어요">✕</button></div>`).join('')}
    </div>`)}</div>

  <div class="mt-block">${U.card('어떠셨는지 적어 주세요', `
    <textarea class="input" style="min-height:150px" placeholder="어떤 점이 좋았는지, 아쉬웠던 건 없었는지 적어 주세요. 다음 사람에게 큰 도움이 돼요.">사진이 정말 잘 나왔어요. 어색해하니까 계속 말 걸어주시면서 편하게 해주셨습니다. 보정본도 그날 저녁에 바로 받았어요.</textarea>
    <div class="row-b mt2"><span class="t-sub">최소 20자 이상</span><span class="t-sub">78 / 2000</span></div>

    <div class="mt-block">
      <label class="lb">다시 맡기시겠어요?</label>
      ${U.chips(['꼭 다시 맡길래요', '괜찮았어요', '글쎄요'], 0)}
    </div>`)}</div>

  <div class="mt-block">${U.card('고수에게만 보이는 피드백', `
    <p class="t-sub mb3">여기 적은 내용은 <b>공개되지 않고 고수에게만</b> 전달돼요. 공개하기는 어렵지만 알려주고 싶은 게 있으면 적어 주세요.</p>
    <textarea class="input" placeholder="예: 다음엔 조명을 조금만 더 밝게 해주시면 좋겠어요"></textarea>`, { cls: 'tape ok' })}</div>`;

  const aside = `
  ${U.card('', `
    <span class="badge b-acc">포인트</span>
    <h3 class="t-card mt2">후기를 남기면 1,000 포인트</h3>
    <p class="t-sub mt2">사진을 함께 올리면 500 포인트를 더 드려요. 포인트는 다음 결제 때 쓸 수 있어요.</p>
    <div class="mt-block">${U.kv([['글 후기', '1,000P'], ['사진 추가', '＋500P'], ['지금 받을 포인트', '<b class="pri">1,500P</b>']])}</div>`, { cls: 'pri' })}

  <div class="mt4">${U.card('공개 설정', `
    <label class="check box"><input type="checkbox"><span><b>익명으로 올리기</b>
      <div class="t-sub mt1">이름 대신 ‘김O늘’처럼 보여요. 사진은 그대로 올라갑니다.</div></span></label>
    <p class="t-sub mt3">후기는 작성 후 30일 안에 고치거나 지울 수 있어요.</p>`)}</div>

  <div class="mt4">${U.box(`<h4 class="t-card mb2">이런 후기가 도움이 돼요</h4>
    <div class="col" style="gap:var(--sp-item)">
      <div class="t-sub">· 무엇을 맡겼는지 (평수·규모·상황)</div>
      <div class="t-sub">· 걸린 시간과 실제로 낸 금액</div>
      <div class="t-sub">· 아쉬웠던 점과 그때 어떻게 했는지</div>
    </div>`, { cls: 'soft' })}</div>`;

  const stick = U.stickBar(
    '<span class="t-sub">받을 포인트 <b class="pri">1,500P</b></span>',
    U.btn('임시 저장', { cls: 'btn-ghost', attr: ' data-toast="임시 저장했어요"' }) + U.btn('후기 등록하기', { href: 'RV-02', cls: 'btn-pri btn-lg' }),
  );

  const body = `${U.pageHd('후기 쓰기', '솔직하게 적어 주세요. 다음 사람에게 큰 도움이 돼요.')}${U.detail2(main, aside)}`;
  return { body, o: { stick } };
}

/* ---------------- RV-02 내 후기 목록 ---------------- */
function RV02(ctx) {
  const mine = REVIEWS.slice(0, 5);
  const todo = [
    { pro: PRO('p6'), svc: '프로필 촬영', at: '2026-07-04', price: 90000 },
    { pro: PRO('p7'), svc: '에어컨 설치', at: '2026-06-22', price: 70000 },
  ];

  const body = U.myPage('RV-02', `
  ${U.pageHd('내 후기', '내가 쓴 후기와 아직 안 쓴 이용 건이에요')}

  ${U.statRow([
    ['4.8', '내가 준 평균 별점'],
    ['5건', '작성한 후기'],
    ['137', '받은 도움돼요', { cls: 'pri' }],
    ['2건', '아직 안 쓴 후기', { cls: 'acc' }],
  ])}

  <div class="mt-block">${U.tabs([{ label: '작성한 후기', cnt: 5 }, { label: '작성 안 함', cnt: 2 }], 0)}</div>

  <div class="list">${mine.map((r) => `<div class="card"><div class="card-bd">
    <div class="row-b wrap-row mb3">
      <div class="row-c">${U.phPro(44, 'p' + (mine.indexOf(r) + 1))}
        <div><b>${U.esc(r.pro)}</b><div class="t-sub">${U.esc(r.svc)} · ${r.at} 이용</div></div></div>
      <div class="btns">
        ${U.btn('수정', { cls: 'btn-ghost btn-sm', attr: mine.indexOf(r) < 2 ? ' data-toast="후기 수정 화면이 열려요"' : ' disabled' })}
        ${U.btn('삭제', { cls: 'btn-ghost btn-sm', attr: mine.indexOf(r) < 2 ? ' data-toast="정말 지울까요? 확인 창이 열려요"' : ' disabled' })}
      </div>
    </div>
    <div class="row-c">${U.stars(r.r)}<b>${r.r}.0</b>
      <span class="t-sub">· 👍 도움돼요 ${r.help}</span>
      ${mine.indexOf(r) >= 2 ? U.badge('30일이 지나 수정 불가', 'b-mut') : ''}</div>
    ${r.photo ? `<div class="row mt3" style="gap:8px">${[1, 2].map((i) => U.phFix(['후기 사진', 1200, 900], 84, { seed: r.who + i })).join('')}</div>` : ''}
    <p class="mt3">${U.esc(r.t)}</p>
    ${r.reply ? `<div class="reply"><div class="who">${U.esc(r.pro)} 답글</div>${U.esc(r.reply)}</div>` : ''}
  </div></div>`).join('')}</div>

  ${U.sec('아직 후기를 안 쓰신 이용 건', `<div class="list">${todo.map(({ pro, svc, at, price }) => `<div class="list-row hot">
    ${U.phPro(56, pro.id)}
    <div class="mid"><b class="t-card">${U.esc(svc)}</b>
      <div class="t-sub mt1">${U.esc(pro.nm)} · ${at} 이용 · ${U.won(price)}</div>
      <div class="mt-item">${U.badge('1,000 포인트', 'b-acc')} <span class="t-sub">후기를 남기면 받을 수 있어요</span></div></div>
    <div class="rt">${U.btn('후기 쓰기', { href: 'RV-01', cls: 'btn-pri btn-sm' })}</div>
  </div>`).join('')}</div>`, { desc: '이용일로부터 90일 안에만 쓸 수 있어요.' })}

  ${U.sec('후기 신고 처리', `${U.table([{ t: '후기' }, { t: '신고 사유' }, { t: '접수일' }, { t: '상태' }], [
    ['깔끔한하루 · 입주 청소', '고수가 사실과 다르다고 신고', '2026-06-05', U.badge('확인 후 유지', 'b-ok')],
  ])}
  <p class="t-sub mt3">신고가 들어오면 확인하는 동안 후기는 그대로 보입니다. 사실이 아닌 것으로 확인되면 알려드려요.</p>`)}`);

  return { body, o: {} };
}

export const PAGES = { 'MY-01': MY01, 'MY-02': MY02, 'MY-03': MY03, 'RV-01': RV01, 'RV-02': RV02 };
