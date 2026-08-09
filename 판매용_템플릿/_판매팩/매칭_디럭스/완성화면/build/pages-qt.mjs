/* QT 받은 견적 — 목록 / 비교 / 상세 / 고수 선택 확인
   여러 값을 나란히 놓고 고르는 것이 이 서비스에서만 있는 흐름이다. */
import * as U from './ui.mjs';
import { QUOTES, PRO, REQ } from './data.mjs';

const reqLine = () => `<div class="card mb4"><div class="card-bd tight">
  <div class="row-b wrap-row">
    <div class="row-c wrap-row">
      ${U.badge('내 요청', 'b-pri')}
      <b>${REQ.svc}</b>
      <span class="t-sub">${REQ.when} · 역삼동 → 잠실동 · 예산 ${REQ.budget}</span>
    </div>
    <div class="row-c wrap-row">
      <span class="badge b-dan">마감까지 <span data-count="165600">46:00:00</span></span>
      <a class="link" href="${U.link('RQ-05')}">요청 수정</a>
    </div>
  </div>
</div></div>`;

/* ---------------- QT-01 견적 목록 ---------------- */
function QT01(ctx) {
  const cheapest = QUOTES.reduce((a, b) => (a.price <= b.price ? a : b));
  const bestRate = QUOTES.reduce((a, b) => (PRO(a.pro).r >= PRO(b.pro).r ? a : b));

  const body = `
  ${U.pageHd('받은 견적', `견적 <b style="color:var(--text)">5개</b> · 마감까지 2일 남음`,
    `<div class="row-c wrap-row">
      <select class="input" style="width:auto"><option>낮은 가격순</option><option>평점 높은순</option><option>빠른 응답순</option><option>도착한 순</option></select>
    </div>`)}
  ${reqLine()}

  ${U.banner('info', '⚖️', `<b>두 개 이상 고르면 나란히 비교할 수 있어요</b>
    <div class="t-sub mt1">왼쪽 네모를 눌러 고르시면 화면 아래에 비교 버튼이 나타납니다.</div>`)}

  <div class="pro-list mt4">${QUOTES.map((q, i) => U.quoteRow(q, PRO(q.pro), {
    pick: true, picked: i < 3,
    best: q.id === cheapest.id ? '최저가' : (q.id === bestRate.id ? '최고 평점' : ''),
  })).join('')}</div>

  <div class="mt-block">${U.banner('quiet', '💬', `견적이 애매하면 <b>채팅으로 먼저 물어보세요.</b>
    "사다리차 포함인가요?" 같은 질문에 답이 빠른 고수가 대체로 현장에서도 빠릅니다.`)}</div>

  ${U.sec('아직 견적이 없을 때는 이렇게 보여요', U.empty('⏳', '첫 견적을 기다리는 중이에요',
    '조건에 맞는 고수 24명에게 요청서가 갔어요. 보통 30분 안에 첫 견적이 도착합니다.<br>견적이 오면 알림으로 알려드릴게요.',
    U.btn('내 요청 보기', { href: 'MY-01', cls: 'btn-pri' }) + U.btn('고수 직접 찾기', { href: 'SE-01', cls: 'btn-ghost' })))}`;

  const stick = `<div class="stick" data-pick-bar><div class="stick-in">
    <div><b data-pick-n>3</b>개를 골랐어요 <span class="t-sub">· 2~4개까지 나란히 비교할 수 있어요</span></div>
    <div class="btns">
      <a class="btn btn-ghost" href="${U.link('QT-03')}">견적 상세 보기</a>
      <a class="btn btn-pri btn-lg" href="${U.link('QT-02')}" data-pick-go><span data-pick-n>3</span>개 비교하기</a>
    </div></div></div>`;

  return { body, o: { stick } };
}

/* ---------------- QT-02 견적 비교 ---------------- */
function QT02(ctx) {
  const picked = [QUOTES[0], QUOTES[1], QUOTES[2]];
  const cheap = picked.reduce((a, b) => (a.price <= b.price ? a : b));
  const top = picked.reduce((a, b) => (PRO(a.pro).r >= PRO(b.pro).r ? a : b));

  const colHd = picked.map((q) => {
    const p = PRO(q.pro);
    return `<th class="col-hd">
      <div style="display:grid;place-items:center">${U.phPro(64, p.id)}</div>
      <div class="nm">${U.esc(p.nm)}</div>
      <div class="t-sub">${p.cat}</div>
      <div class="mt2">
        ${q.id === cheap.id ? U.badge('최저가', 'b-acc') : ''}
        ${q.id === top.id ? U.badge('최고 평점', 'b-pri') : ''}
      </div>
      <button class="link quiet mt2" type="button" data-toast="비교에서 뺐어요" style="font-size:12px">비교에서 빼기</button>
    </th>`;
  }).join('');

  const rows = [
    ['견적 금액', picked.map((q) => `<div class="price${q.id === cheap.id ? ' pri' : ''}">${U.won(q.price)}</div>`), true],
    ['기본료', picked.map((q) => U.won(q.base))],
    ['추가 항목', picked.map((q) => q.extra.map(([k, v]) => `${k} ${U.won(v)}`).join('<br>') || '없음')],
    ['출장비', picked.map((q) => (q.trip ? U.won(q.trip) : '없음'))],
    ['포함되는 것', picked.map((q) => q.inc.map((x) => `<span class="badge b-ok">${x}</span>`).join(' '))],
    ['포함 안 되는 것', picked.map((q) => q.exc.map((x) => `<span class="badge b-mut">${x}</span>`).join(' '))],
    ['예상 소요 시간', picked.map((q) => q.hours), true],
    ['평점', picked.map((q) => { const p = PRO(q.pro); return `${U.stars(p.r)} <b>${p.r.toFixed(1)}</b>`; }), true],
    ['후기 수', picked.map((q) => `${U.num(PRO(q.pro).rv)}건`)],
    ['응답률', picked.map((q) => `${PRO(q.pro).resp}%`), true],
    ['인증', picked.map((q) => PRO(q.pro).tags.map(U.verify).join(' '))],
    ['취소 규정', picked.map((q) => q.cancel), true],
    ['견적 도착', picked.map((q) => q.at)],
  ];

  const tbody = rows.map(([label, cells, diff]) => {
    const best = label === '견적 금액' ? picked.findIndex((q) => q.id === cheap.id)
      : label === '평점' ? picked.findIndex((q) => q.id === top.id) : -1;
    return `<tr${diff ? ' data-diff' : ''}><td>${label}</td>${cells.map((c, i) =>
      `<td class="${i === best ? 'best' : ''}" style="text-align:center">${c}</td>`).join('')}</tr>`;
  }).join('');

  const body = `
  ${U.pageHd('견적 비교', '3개를 나란히 놓았어요. 색이 들어간 칸이 가장 좋은 값이에요.')}
  ${reqLine()}

  <div class="row-b wrap-row mb4">
    <label class="check"><input type="checkbox"><span>차이가 있는 항목만 보기</span></label>
    <a class="link" href="${U.link('QT-01')}">견적 목록으로 돌아가 다시 고르기</a>
  </div>

  <div class="table-wrap table-scroll">
    <table class="table cmp">
      <thead><tr><th>비교 항목</th>${colHd}</tr></thead>
      <tbody>${tbody}</tbody>
      <tfoot><tr><td>선택</td>${picked.map(() =>
    `<td style="text-align:center"><a class="btn btn-pri" href="${U.link('QT-04')}">이 고수 선택</a></td>`).join('')}</tr></tfoot>
    </table>
  </div>

  <p class="t-sub mt3">좁은 화면에서는 표가 옆으로 넘어가고, 맨 왼쪽 항목 칸은 자리에 붙어 있어요.</p>

  <div class="mt-block">${U.banner('info', '🧭', `<b>값만 보고 고르지 마세요</b>
    <div class="t-sub mt1">가장 싼 견적은 대개 <b>포함되지 않는 것</b>이 많습니다. 위 표에서 회색 배지를 꼭 확인하세요.
    사다리차·포장 자재·폐기물 처리는 나중에 따로 돈이 드는 항목입니다.</div>`)}</div>

  <div class="g3 mt-block">
    ${picked.map((q) => { const p = PRO(q.pro); return `<div class="card"><div class="card-bd">
      <div class="row-c">${U.phPro(44, p.id)}<div><b>${U.esc(p.nm)}</b><div class="t-sub">${U.won(q.price)}</div></div></div>
      <p class="t-sub mt3">${U.esc(q.one)}</p>
      <div class="btns col mt-block">
        ${U.btn('견적 상세 보기', { href: 'QT-03', cls: 'btn-ghost btn-sm btn-block' })}
        ${U.btn('궁금한 점 물어보기', { href: 'CH-02', cls: 'btn-ghost btn-sm btn-block' })}
      </div></div></div>`; }).join('')}
  </div>`;

  return { body, o: { wrapCls: 'wrap-wide' } };
}

/* ---------------- QT-03 견적 상세 ---------------- */
function QT03(ctx) {
  const q = QUOTES[0], p = PRO(q.pro);
  const sum = q.base + q.extra.reduce((a, [, v]) => a + v, 0) + q.trip;

  const main = `
  ${U.card('고수가 보낸 제안', `
    <p>안녕하세요, 한결이사입니다. 요청서와 사진 잘 봤습니다.</p>
    <p class="mt3">역삼동 3층에 승강기가 없어 <b class="hl">사다리차를 쓰는 게 낫겠습니다.</b> 계단으로 옮기면 시간이 두 배로 들고, 냉장고와 세탁기는 계단 운반 중 흠집이 나기 쉽습니다. 사다리차 비용을 견적에 넣었습니다.</p>
    <p class="mt3">옷장 분해는 제가 공구를 챙겨 가겠습니다. 잠실 도착지는 승강기가 있어 내리는 건 빠를 겁니다.</p>
    <p class="mt3">오전 8시에 시작하면 <b>점심 전에 마칠 수 있습니다.</b> 짐 정리는 포함되어 있지 않지만, 큰 가구 자리 잡는 것까지는 도와드립니다.</p>
    <p class="mt3">궁금한 점 있으시면 채팅으로 편하게 물어보세요.</p>`)}

  <div class="mt-block">${U.card('금액이 이렇게 나왔어요', `
    ${U.sumRows([
    ['기본료 (원룸 이사 · 2명 · 1톤)', U.won(q.base)],
    ...q.extra.map(([k, v]) => [k, U.won(v)]),
    ['출장비', q.trip ? U.won(q.trip) : '없음'],
  ], ['합계', U.won(sum)])}
    <p class="t-sub mt3">현장에서 짐이 크게 늘지 않는 한 이 값 그대로 진행합니다. 값이 바뀌어야 할 상황이면 <b>작업 전에</b> 알려드립니다.</p>`)}</div>

  <div class="mt-block">${U.card('포함 여부', `<div class="g2">
    <div>
      <h4 class="t-card mb3" style="color:var(--success)">포함되는 것</h4>
      <div class="col" style="gap:var(--sp-item)">${q.inc.map((x) =>
    `<div class="row-c"><span style="color:var(--success)">✓</span><span>${x}</span></div>`).join('')}</div>
    </div>
    <div>
      <h4 class="t-card mb3 muted">포함되지 않는 것</h4>
      <div class="col" style="gap:var(--sp-item)">${q.exc.map((x) =>
      `<div class="row-c muted"><span>✕</span><span>${x}</span></div>`).join('')}</div>
      <p class="t-sub mt3">이 항목이 필요하시면 채팅으로 말씀 주세요. 값을 다시 매겨 드립니다.</p>
    </div>
  </div>`)}</div>

  <div class="mt-block">${U.card('예상 일정', U.timeline([
    ['오전 8:00 — 도착·확인', '짐 상태를 함께 보고 시작합니다'],
    ['오전 8:30 — 포장', '유리·도자기·모니터는 따로 쌉니다'],
    ['오전 10:00 — 사다리차 반출', '3층 창을 통해 내립니다'],
    ['오전 11:00 — 이동', '역삼동 → 잠실동, 약 30분'],
    ['오후 12:00 — 반입·마무리', '큰 가구 자리까지 잡아 드립니다'],
  ], 0))}</div>

  <div class="mt-block">${U.card('취소·환불 규정', `
    <p class="mb4"><b>${q.cancel}</b></p>
    ${U.table([{ t: '취소 시점' }, { t: '수수료' }, { t: '돌려받는 금액' }], [
    ['방문 3일 전까지', '없음', '전액'],
    ['방문 2일 전', '견적의 10%', `${U.won(Math.round(sum * 0.9))}`],
    ['방문 전날', '견적의 30%', `${U.won(Math.round(sum * 0.7))}`],
    ['당일 취소', '견적의 50%', `${U.won(Math.round(sum * 0.5))}`],
  ])}
    <p class="t-sub mt3">결제는 일이 끝난 뒤에 하므로, 취소 수수료가 붙는 경우에만 따로 청구됩니다.</p>`)}</div>`;

  const aside = `
  ${U.card('', `
    <div class="row-c mb4">${U.phPro(56, p.id)}
      <div><b class="t-card">${U.esc(p.nm)}</b>
        <div class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)} (${U.num(p.rv)}) · 응답률 ${p.resp}%</div></div></div>
    <div class="t-sub">견적 금액</div>
    <div class="price-lg">${U.won(q.price)}</div>
    <p class="t-sub mt1">예상 소요 ${q.hours} · ${q.at} 도착</p>
    <div class="btns col mt-block">
      ${U.btn('이 고수 선택하기', { href: 'QT-04', cls: 'btn-pri btn-lg btn-block' })}
      ${U.btn('궁금한 점 물어보기', { href: 'CH-02', cls: 'btn-ghost btn-block' })}
      ${U.btn('고수 프로필 보기', { href: 'SE-03', cls: 'btn-ghost btn-block' })}
    </div>
    <p class="t-sub mt3 center">고르셔도 결제는 일이 끝난 뒤에 해요.</p>`, { cls: 'pri' })}

  <div class="mt4">${U.box(`<h4 class="t-card mb2">다른 견적과 비교하면</h4>
    ${U.kv([
      ['이 견적', `<b class="pri">${U.won(q.price)}</b>`],
      ['가장 싼 견적', U.won(198000)],
      ['가장 비싼 견적', U.won(310000)],
      ['5개 평균', U.won(253000)],
    ])}
    <div class="btns mt-block">${U.btn('3개 나란히 비교', { href: 'QT-02', cls: 'btn-ghost btn-block btn-sm' })}</div>`, { cls: 'soft' })}</div>

  <div class="mt4">${U.box(`${U.verifies(p.tags)}
    <p class="t-sub mt3">사업자등록증·자격증·신분증을 플랫폼이 직접 확인했어요.</p>`, { cls: 'soft' })}</div>`;

  const stick = U.stickBar(
    `<div class="row-c"><b class="price">${U.won(q.price)}</b><span class="t-sub">· ${U.esc(p.nm)} · 예상 ${q.hours}</span></div>`,
    U.btn('채팅 문의', { href: 'CH-02', cls: 'btn-ghost' }) + U.btn('이 고수 선택하기', { href: 'QT-04', cls: 'btn-pri btn-lg' }),
  );

  return { body: U.detail2(main, aside), o: { stick, state: '견적 검토 중 — 아직 선택하지 않았어요' } };
}

/* ---------------- QT-04 고수 선택 - 확인 ---------------- */
function QT04(ctx) {
  const q = QUOTES[0], p = PRO(q.pro);

  const inner = `
    <div class="row-c mb4">${U.phPro(64, p.id)}
      <div><b class="t-card">${U.esc(p.nm)}</b>
        <div class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)} (${U.num(p.rv)}) · 응답률 ${p.resp}%</div>
        <div class="verifies mt1">${p.tags.map(U.verify).join('')}</div></div></div>

    ${U.kv([
    ['서비스', REQ.svc],
    ['견적 금액', `<b class="price">${U.won(q.price)}</b>`],
    ['예상 소요', q.hours],
    ['희망 일정', REQ.when],
  ])}

    <div class="mt-block">
      <h4 class="t-card mb3">고르시면 이렇게 됩니다</h4>
      <div class="col" style="gap:var(--sp-item)">
        ${[['🔓', '서로 연락처가 공개돼요', '고수에게 이름·연락처·상세 주소가 전달됩니다.'],
    ['📨', '나머지 고수 4명에게는 자동으로 안내가 가요', '따로 연락하지 않으셔도 됩니다.'],
    ['💳', '결제는 일이 끝난 뒤에 해요', '지금은 돈이 나가지 않습니다. 미리 보내는 계약금도 없습니다.'],
    ['↩️', '방문 3일 전까지는 수수료 없이 취소할 수 있어요', '그 뒤는 고수가 정한 취소 규정을 따릅니다.']]
      .map(([ic, t, d]) => `<div class="row" style="gap:var(--s3)">
        <span style="font-size:18px;flex:none">${ic}</span>
        <div><b>${t}</b><div class="t-sub mt1">${d}</div></div></div>`).join('')}
      </div>
    </div>

    <label class="check box mt-block" data-unlock="pick"><input type="checkbox">
      <span><b>위 내용을 확인했어요</b></span></label>`;

  const body = `
  ${U.pageHd('이 고수에게 맡길까요?', '마지막으로 한 번만 확인해 주세요.')}

  ${U.card('', inner, { ft: `<div class="btns" style="justify-content:flex-end">
      ${U.btn('다시 생각해볼게요', { href: 'QT-02', cls: 'btn-ghost' })}
      ${U.btn('이 고수로 선택하기', { cls: 'btn-pri btn-lg is-off', id: 'pick', off: true })}
    </div>` })}

  <p class="t-sub center mt4">체크를 하셔야 선택 버튼이 켜져요.</p>

  <div class="mt-block">${U.banner('warn', '🔒', `<b>앱 밖에서 송금하지 마세요</b>
    <div class="t-sub mt1">계좌로 먼저 보내달라는 요구를 받으시면 응하지 마시고 신고해 주세요. 앱을 거치지 않은 거래는 도와드릴 수 없어요.</div>`)}</div>

  ${U.sec('고르고 나면', `<div class="g3">
    ${[['💬', '채팅으로 조율', '방문 시간·주차·짐 상태를 미리 맞춰 두세요.', 'CH-02'],
    ['📋', '내 요청에서 진행 확인', '어디까지 왔는지 한눈에 볼 수 있어요.', 'MY-01'],
    ['💳', '끝난 뒤 결제', '작업이 끝난 것을 확인한 뒤 결제합니다.', 'PY-01']]
    .map(([ic, t, d, go]) => `<a class="box" href="${U.link(go)}">
      <div style="font-size:22px">${ic}</div><h3 class="t-card mt2">${t}</h3><p class="t-sub mt1">${d}</p></a>`).join('')}
  </div>`)}`;

  return { body, o: { wrapCls: 'wrap-read' } };
}

export const PAGES = { 'QT-01': QT01, 'QT-02': QT02, 'QT-03': QT03, 'QT-04': QT04 };
