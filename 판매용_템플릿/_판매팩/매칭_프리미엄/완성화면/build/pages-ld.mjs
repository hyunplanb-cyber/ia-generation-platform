/* LD 요청 받기 — 새 요청 목록 / 요청 상세 / 견적 보내기 / 크레딧 충전
   견적을 보낼 때 크레딧이 빠져나가는 것이 이 서비스만의 흐름이다. */
import * as U from './ui.mjs';
import { LEADS, REQ, PRO } from './data.mjs';

const creditBar = () => `<div class="row-c wrap-row">
  <span class="badge b-pri lg">🪙 남은 크레딧 42</span>
  <a class="link" href="${U.link('LD-04')}">충전하기</a></div>`;

/* ---------------- LD-01 새 요청 목록 ---------------- */
function LD01(ctx) {
  const body = U.proPage('LD-01', `
  ${U.pageHd('새 요청', '내 분야·지역에 맞는 요청이에요. 견적 자리는 선착순으로 찹니다.', creditBar())}

  ${U.banner('acc', '📡', `<div class="ticker" style="border:0;box-shadow:none;padding:0;background:transparent">
    <span class="live"><i></i>실시간</span>
    <span class="t"><b>방금</b> 강남구 원룸 이사 요청이 올라왔어요 · 12분 전 서초구 가정 이사 · 38분 전 강남구 사무실 이사</span></div>`,
    { right: U.btn('새로고침', { cls: 'btn-ghost btn-sm', attr: ' data-toast="새 요청 2건을 불러왔어요"' }) })}

  <div class="row-b wrap-row mt4 mb4">
    <div class="row-c wrap-row">
      <select class="input" style="width:auto"><option>이사 (내 분야)</option><option>전체 분야</option></select>
      <select class="input" style="width:auto"><option>강남·서초·송파</option><option>서울 전체</option></select>
      <select class="input" style="width:auto"><option>예산 전체</option><option>50만원 이상</option><option>100만원 이상</option></select>
      <select class="input" style="width:auto"><option>24km 이내</option><option>거리 제한 없음</option></select>
    </div>
    <select class="input" style="width:auto"><option>최신순</option><option>마감 임박순</option><option>예산 높은순</option></select>
  </div>

  <div class="list">${LEADS.map((l) => `<div class="list-row${l.hot ? ' hot' : ''}">
    <div class="mid">
      <div class="row-c wrap-row">
        <b class="t-card">${U.esc(l.svc)}</b>
        ${U.slotBadge(l.slot, l.max)}
        ${l.slot <= 2 ? U.badge('곧 마감', 'b-dan') : ''}
      </div>
      <div class="t-sub mt1">${U.esc(l.area)}</div>
      <div class="row-c wrap-row mt-item" style="gap:var(--s4);font-size:13px">
        <span><span class="muted">희망일</span> <b>${l.when}</b></span>
        <span><span class="muted">예산</span> <b>${l.budget}</b></span>
        <span class="muted">${l.ago} 등록 · ${l.no}</span>
      </div>
    </div>
    <div class="rt">
      ${U.btn(`견적 보내기 (${l.cost}크레딧)`, { href: 'LD-03', cls: 'btn-pri btn-sm' })}
      ${U.btn('요청 상세', { href: 'LD-02', cls: 'btn-ghost btn-sm' })}
      <button class="link quiet" type="button" data-toast="이 요청을 숨겼어요. 응답률에는 반영됩니다" data-toast-act="되돌리기">관심 없음</button>
    </div></div>`).join('')}</div>

  <div class="center mt-block">${U.btn('더 보기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="다음 10건을 불러왔어요"' })}</div>

  <div class="mt-block">${U.banner('info', '💡', `<b>견적 자리는 5개까지만 열려요</b>
    <div class="t-sub mt1">먼저 보낸 고수 5명의 견적만 손님에게 갑니다. 자리가 차면 더 보낼 수 없어요.
    자리가 2개 남은 요청에는 <b class="acc">주황 배지</b>가 붙습니다.</div>`)}</div>

  ${U.sec('분야별 견적 1건에 드는 크레딧', U.table(
    [{ t: '분야' }, { t: '예산대' }, { t: '크레딧' }, { t: '왜 다른가요' }],
    [
      ['용달·소량 운반', '10만원 미만', '2', '금액이 작아 낮게 잡았어요'],
      ['원룸·소형 이사', '10~50만원', '3', '가장 많이 오가는 구간이에요'],
      ['가정·사무실 이사', '50만원 이상', '5', '한 건이 크게 남는 구간이에요'],
      ['보관 이사', '금액 무관', '5', '기간이 길어 관리 부담이 커요'],
    ],
  ), { desc: '요청 예산대에 따라 자동으로 정해져요. 견적을 보낼 때 화면에 표시됩니다.' })}`);

  return { body, o: { wrapCls: 'wrap-wide' } };
}

/* ---------------- LD-02 요청 상세 ---------------- */
function LD02(ctx) {
  const l = LEADS[0];

  const main = `
  ${U.card('손님이 쓴 요청서', `<div class="col" style="gap:0">
    ${[['어떤 이사인가요?', '원룸·소형 이사 (원룸 6평)'],
    ['언제 이사하시나요?', '2026년 8월 20일 (목) 오전 8~10시 사이 시작'],
    ['출발지는 어디인가요?', '서울 강남구 역삼동 · 3층 · 승강기 없음'],
    ['도착지는 어디인가요?', '서울 송파구 잠실동 · 12층 · 승강기 있음'],
    ['큰 짐이 있나요?', '냉장고 · 세탁기 · 옷장(분해 필요) · 책장'],
    ['예산은 어느 정도인가요?', '20만 ~ 30만원'],
    ['더 알려주실 게 있나요?', '사다리차가 필요할 것 같습니다. 오전에 끝났으면 좋겠어요.']]
    .map(([q, a], i) => `<div style="padding:var(--s4) 0${i ? ';border-top:1px solid var(--border)' : ''}">
      <div class="t-sub">${q}</div><div class="mt1">${a}</div></div>`).join('')}
  </div>`)}

  <div class="mt-block">${U.card('첨부 사진 3장', `<div class="gal">
    ${[1, 2, 3].map((i) => `<div class="it">${U.phWork('up' + i, { tiny: true })}
      <div class="cap"><div class="t-sub mt1">짐 사진 ${i}</div></div></div>`).join('')}
  </div>
  <p class="t-sub mt3">사진을 보면 짐 양을 가늠할 수 있어요. 사다리차가 필요한지도 여기서 판단하실 수 있습니다.</p>`)}</div>

  <div class="mt-block">${U.card('손님 정보', `
    <div class="row-c wrap-row">
      ${U.phAva(56, 'cus')}
      <div class="grow"><b class="t-card">김O늘님</b>
        <div class="t-sub mt1">연락처와 상세 주소는 <b>선택되신 뒤에</b> 공개돼요</div></div>
    </div>
    <div class="mt-block">${U.kv([
    ['가입 기간', '1년 2개월'],
    ['이용 횟수', '<b>6번</b> (이사 2 · 청소 1 · 기타 3)'],
    ['고수에게 준 평균 평점', `${U.stars(4.8)} <b>4.8</b>`],
    ['후기 작성률', '<b class="success">83%</b>'],
    ['취소 이력', '1회 (일정 변경)'],
  ])}</div>
    <p class="t-sub mt3">여러 번 이용하고 후기를 잘 쓰는 손님이에요.</p>`)}</div>`;

  const aside = `
  ${U.card('', `
    <div class="row-b mb3">${U.slotBadge(l.slot, l.max)}<span class="t-sub">${l.ago} 등록</span></div>
    <h3 class="t-card">${U.esc(l.svc)}</h3>
    <p class="t-sub mt1">${U.esc(l.area)}</p>
    <div class="mt-block">${U.kv([['희망일', l.when], ['예산', `<b>${l.budget}</b>`], ['요청 번호', l.no]])}</div>
    <div class="btns col mt-block">
      ${U.btn(`견적 보내기 (${l.cost}크레딧)`, { href: 'LD-03', cls: 'btn-pri btn-lg btn-block' })}
      <button class="btn btn-ghost btn-block" type="button" data-toast="이 요청을 숨겼어요">관심 없음</button>
    </div>
    <p class="t-sub mt3 center">보내면 잔액 42 → 39</p>`, { cls: 'pri' })}

  <div class="mt4">${U.card('참고 — 이 지역 비슷한 요청', `
    <div class="center" style="padding:var(--s3) 0">
      <div class="big">243,000원</div><div class="t-sub">최근 30일 평균 견적가</div>
    </div>
    ${U.kv([
    ['가장 낮은 값', '178,000원'],
    ['가장 높은 값', '320,000원'],
    ['성사된 값 평균', '<b class="pri">251,000원</b>'],
    ['비슷한 요청 수', '38건'],
  ])}
    <p class="t-sub mt3">평균보다 훨씬 낮게 부르면 성사는 되어도 남는 게 없습니다. 사다리차가 필요한 건이니 그 값을 꼭 넣으세요.</p>`)}</div>

  <div class="mt4">${U.card('먼저 견적을 보낸 고수', `
    <div class="col" style="gap:var(--sp-item)">
      ${['p3', 'p7', 'p8'].map((id) => { const p = PRO(id); return `<div class="row-c">
        ${U.phPro(36, p.id)}<div class="grow"><b style="font-size:14px">${U.esc(p.nm)}</b>
        <div class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)} · 시작가 ${U.won(p.from)}</div></div></div>`; }).join('')}
    </div>
    <p class="t-sub mt3">이미 3명이 보냈어요. 남은 자리는 <b class="acc">2개</b>입니다.</p>`, { cls: 'tape acc' })}</div>`;

  const body = `
  <div class="row-b wrap-row mb4">
    <div><div class="row-c wrap-row">${U.badge('새 요청', 'b-acc')}<h1 class="t-page">${U.esc(l.svc)}</h1></div>
      <p class="t-sub">${U.esc(l.area)} · ${l.ago} 등록</p></div>
    ${creditBar()}
  </div>
  ${U.detail2(main, aside)}`;

  return { body, o: {} };
}

/* ---------------- LD-03 견적 보내기 ---------------- */
function LD03(ctx) {
  const l = LEADS[0];

  const main = `
  ${U.card('견적 금액', `
    <div class="field"><label class="lb">기본료<span class="req">*</span></label>
      <div class="inline"><input class="input" value="180,000"><span class="t-sub">원</span></div>
      <p class="help">원룸 이사 기본 구성(기사 2명 · 1톤 차량 · 포장 자재) 기준으로 적어 주세요.</p></div>

    <label class="lb">추가 항목</label>
    <div class="col mb3" style="gap:var(--sp-btn)">
      ${[['사다리차 (3층)', '40,000'], ['에어컨 탈부착', '20,000']].map(([k, v]) => `<div class="row" style="gap:var(--s2)">
        <input class="input grow" value="${k}"><input class="input none" value="${v}" style="width:140px">
        <button class="btn btn-ghost none" type="button" data-toast="줄을 지웠어요">✕</button></div>`).join('')}
    </div>
    ${U.btn('＋ 항목 추가', { cls: 'btn-ghost btn-sm', attr: ' data-toast="빈 줄을 하나 넣었어요"' })}

    <div class="field mt-block" style="margin-bottom:0"><label class="lb">출장비</label>
      <div class="inline"><input class="input" value="0" style="max-width:180px"><span class="t-sub">원 · 활동 지역 안이라 받지 않음</span></div></div>`)}

  <div class="mt-block">${U.card('포함 여부', `<div class="g2">
    <div>
      <h4 class="t-card mb3" style="color:var(--success)">포함되는 것</h4>
      ${['포장 자재', '사다리차', '기본 정리', '옷장 분해·조립', '짐 정리']
    .map((t, i) => `<label class="check"><input type="checkbox"${i < 4 ? ' checked' : ''}><span>${t}</span></label>`).join('')}
    </div>
    <div>
      <h4 class="t-card mb3 muted">포함되지 않는 것</h4>
      ${['에어컨 설치비', '폐기물 처리', '입주 청소', '보관료']
      .map((t, i) => `<label class="check"><input type="checkbox"${i < 2 ? ' checked' : ''}><span>${t}</span></label>`).join('')}
      <p class="t-sub mt3">포함 안 되는 것을 분명히 적으면 현장에서 다투는 일이 줄어요.</p>
    </div>
  </div>`)}</div>

  <div class="mt-block">${U.card('일정', `
    <div class="field"><label class="lb">예상 소요 시간</label>
      <div class="inline"><input class="input" value="3" style="max-width:100px"><span class="t-sub">~</span>
        <input class="input" value="4" style="max-width:100px"><span class="t-sub">시간</span></div></div>
    <div class="field" style="margin-bottom:0"><label class="lb">가능한 날짜 <span class="t-sub">(여러 개 고를 수 있어요)</span></label>
      <div class="chips">${['8월 20일 (목) 오전', '8월 20일 (목) 오후', '8월 21일 (금) 오전', '8월 22일 (토) 오전']
    .map((t, i) => U.chip(t, i === 0 || i === 2)).join('')}</div>
      <p class="help">손님이 적은 희망일은 <b>8월 20일 (목) 오전</b>이에요.</p></div>`)}</div>

  <div class="mt-block">${U.card('제안 메시지', `
    <div class="row-b mb2"><span class="t-sub">손님이 가장 먼저 읽는 글이에요</span>
      ${U.btn('자주 쓰는 문구 불러오기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="저장해 둔 문구 4개가 열려요"' })}</div>
    <textarea class="input" style="min-height:180px">안녕하세요, 한결이사입니다. 요청서와 사진 잘 봤습니다.

역삼동 3층에 승강기가 없어 사다리차를 쓰는 게 낫겠습니다. 계단으로 옮기면 시간이 두 배로 들고, 냉장고와 세탁기는 계단 운반 중 흠집이 나기 쉽습니다. 사다리차 비용을 견적에 넣었습니다.

옷장 분해는 제가 공구를 챙겨 가겠습니다. 오전 8시에 시작하면 점심 전에 마칠 수 있습니다.</textarea>
    <div class="row-b mt2"><span class="t-sub">최소 30자</span><span class="t-sub">208 / 1000</span></div>
    <label class="check mt3"><input type="checkbox"><span class="t-sub">이 문구를 ‘자주 쓰는 문구’로 저장할게요</span></label>`)}</div>`;

  const aside = `
  ${U.card('손님에게는 이렇게 보여요', `
    <div class="box soft" style="padding:var(--s4)">
      <div class="row-c">${U.phPro(44, 'p1')}
        <div><b>한결이사</b><div class="t-sub">${U.stars(4.9)} 4.9 (328)</div></div></div>
      <div class="row-b mt3"><span class="t-sub">예상 3~4시간</span><b class="price">240,000원</b></div>
      <p class="t-sub mt2" style="color:var(--text)">사다리차 포함, 오전 8시 시작해 점심 전에 끝냅니다</p>
      <div class="verifies mt3">${U.verify('사업자')}${U.verify('자격증')}</div>
    </div>
    <p class="t-sub mt3">비교 화면에서는 금액·평점·응답률이 나란히 놓입니다.</p>`)}

  <div class="mt4">${U.card('금액 정리', `
    ${U.sumRows([
    ['기본료', U.won(180000)],
    ['사다리차 (3층)', U.won(40000)],
    ['에어컨 탈부착', U.won(20000)],
    ['출장비', '없음'],
  ], ['견적 금액', U.won(240000)])}
    <p class="t-sub mt3">성사되면 수수료 12%(28,800원)를 뺀 <b>211,200원</b>이 정산돼요.</p>`)}</div>

  <div class="mt4">${U.card('', `
    ${U.banner('acc', '🪙', `<b>${l.cost}크레딧이 차감돼요</b>
      <div class="t-sub mt1">잔액 <b>42 → 39</b> · 보낸 뒤에는 돌려받을 수 없어요.</div>`)}
    <div class="btns col mt-block">
      ${U.btn('견적 보내기', { href: 'JB-01', cls: 'btn-pri btn-lg btn-block' })}
      ${U.btn('임시 저장', { cls: 'btn-ghost btn-block', attr: ' data-toast="임시 저장했어요. 크레딧은 빠지지 않았어요"' })}
      ${U.btn('크레딧 충전', { href: 'LD-04', cls: 'btn-quiet btn-block btn-sm' })}
    </div>
    <p class="t-sub mt3 center">견적 자리 ${l.slot} / ${l.max} 남음</p>`, { cls: 'acc' })}</div>`;

  const body = `
  ${U.pageHd('견적 보내기', `${U.esc(l.svc)} · ${U.esc(l.area)} · 희망일 ${l.when}`, creditBar())}
  ${U.detail2(main, aside)}`;

  return { body, o: {} };
}

/* ---------------- LD-04 크레딧 충전 ---------------- */
function LD04(ctx) {
  const packs = [
    { n: 50, price: 50000, off: 0 },
    { n: 100, price: 95000, off: 5 },
    { n: 300, price: 270000, off: 10, best: true },
    { n: 500, price: 425000, off: 15 },
  ];
  const use = [4, 6, 3, 8, 5, 2, 7, 4, 9, 6, 3, 5];

  const main = `
  ${U.card('충전하기', `<div class="g4">
    ${packs.map((p) => `<button class="radio${p.best ? ' on' : ''}" type="button" data-group="pack" style="text-align:center">
      ${p.best ? `<div style="margin-bottom:6px">${U.badge('가장 많이 골라요', 'b-acc')}</div>` : ''}
      <b style="font-size:24px">${p.n}</b>
      <span class="d">크레딧</span>
      <div class="price mt2">${U.won(p.price)}</div>
      ${p.off ? `<div class="t-sub mt1"><b class="pri">${p.off}% 할인</b> · 1크레딧 ${Math.round(p.price / p.n)}원</div>`
      : `<div class="t-sub mt1">1크레딧 ${Math.round(p.price / p.n)}원</div>`}
    </button>`).join('')}
  </div>
  <p class="t-sub mt4">300크레딧이면 원룸 이사 견적을 100건 보낼 수 있어요.</p>`)}

  <div class="mt-block">${U.card('자동 충전', `
    <div class="toggle-row">
      <div><b>잔액이 10 아래로 내려가면 자동으로 충전</b>
        <div class="t-sub mt1">요청이 몰릴 때 크레딧이 떨어져 견적을 못 보내는 일을 막아 줘요.</div></div>
      <button class="toggle on" type="button" data-toast="자동 충전을 껐어요"></button>
    </div>
    <div class="g2 mt4">
      <div><label class="lb">충전할 크레딧</label><select class="input"><option>100 크레딧 (95,000원)</option><option>50 크레딧</option><option>300 크레딧</option></select></div>
      <div><label class="lb">한 달 최대</label><select class="input"><option>2회까지</option><option>1회</option><option>제한 없음</option></select></div>
    </div>`)}</div>

  <div class="mt-block">${U.card('결제 수단', `
    <div class="g3 mb4">
      ${[['💳', '신용·체크카드', true], ['📱', '간편결제', false], ['🏦', '계좌이체', false]]
    .map(([ic, t, on]) => `<button class="radio${on ? ' on' : ''}" type="button" data-group="pay" style="text-align:center">
      <div style="font-size:22px">${ic}</div><b style="margin-top:6px">${t}</b></button>`).join('')}
    </div>
    <select class="input"><option>신한카드 (1234) · 기본 카드</option><option>＋ 새 카드 등록</option></select>
    <label class="check box mt4"><input type="checkbox" checked><span>세금계산서를 받을게요 <span class="t-sub">(사업자 등록 완료)</span></span></label>`)}</div>

  <div class="mt-block">${U.card('사용 내역', U.table(
    [{ t: '날짜' }, { t: '내용' }, { t: '증감' }, { t: '잔액' }],
    [
      ['2026-08-06', '견적 발송 · 원룸 이사 (R-...0142)', '<span class="danger">-3</span>', '42'],
      ['2026-08-06', '견적 발송 · 사무실 이사 (R-...0131)', '<span class="danger">-5</span>', '45'],
      ['2026-08-05', '충전 · 100 크레딧', '<span class="success">+100</span>', '50'],
      ['2026-08-05', '견적 발송 · 가정 이사 (R-...0402)', '<span class="danger">-5</span>', '-50'],
      ['2026-08-04', '환불 · 요청 취소로 자리 반환', '<span class="success">+3</span>', '-45'],
    ],
  ), { bdCls: 'flush', aside: '<a class="more" href="#">전체 내역 ›</a>' })}</div>`;

  const aside = `
  ${U.card('잔액', `
    <div class="row-b"><div><div class="big">42</div><div class="t-sub">남은 크레딧</div></div>
      <span style="font-size:32px">🪙</span></div>
    <div class="mt4">${U.progress(42, 'acc')}</div>
    <p class="t-sub mt2">이번 달 <b>58</b> 사용 · 지난달 71</p>
    <div class="mt-block">
      <div class="t-sub mb2">최근 12개월 사용</div>
      <div class="row" style="gap:3px;align-items:flex-end;height:64px">
        ${use.map((v, i) => `<div class="grow" style="background:${i >= 9 ? 'var(--accent)' : 'var(--acc-12)'};
          height:${Math.round(v / Math.max(...use) * 100)}%;border-radius:2px 2px 0 0"></div>`).join('')}
      </div>
    </div>
    <div class="btns mt-block">${U.btn('270,000원 충전하기', { cls: 'btn-pri btn-lg btn-block', attr: ' data-toast="결제 창이 열려요"' })}</div>`, { cls: 'acc' })}

  <div class="mt4">${U.card('견적 1건에 드는 크레딧', U.table(
    [{ t: '예산대' }, { t: '크레딧' }],
    [['10만원 미만', '2'], ['10~50만원', '3'], ['50만원 이상', '5'], ['보관 이사', '5']],
  ), { bdCls: 'flush' })}</div>

  <div class="mt4">${U.box(`<h4 class="t-card mb2">유효기간과 환불</h4>
    <div class="col" style="gap:var(--sp-item)">
      <div class="t-sub">· 크레딧은 <b>충전일로부터 1년</b> 동안 쓸 수 있어요</div>
      <div class="t-sub">· 쓰지 않은 크레딧은 7일 안에 <b>전액 환불</b>됩니다</div>
      <div class="t-sub">· 한 건이라도 쓰면 남은 분량만 환불돼요 (할인은 정가 기준으로 다시 계산)</div>
      <div class="t-sub">· 손님이 요청을 취소하면 쓴 크레딧을 돌려드려요</div>
    </div>
    <div class="btns mt-block">${U.btn('환불 신청', { cls: 'btn-ghost btn-sm btn-block', attr: ' data-toast="환불 신청 창이 열려요"' })}</div>`,
    { cls: 'soft' })}</div>`;

  const body = U.proPage('LD-04', `
  ${U.pageHd('크레딧', '견적을 보낼 때 쓰는 크레딧이에요. 등록비나 광고비는 없습니다.')}
  ${U.detail2(main, aside)}`);

  return { body, o: { wrapCls: 'wrap-wide' } };
}

export const PAGES = { 'LD-01': LD01, 'LD-02': LD02, 'LD-03': LD03, 'LD-04': LD04 };
