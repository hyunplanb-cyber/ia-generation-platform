/* SE 고수 찾기 — 목록 / 결과 없음 / 상세 / 포트폴리오 / 찜 */
import * as U from './ui.mjs';
import { CATS, PROS, PRO, REVIEWS } from './data.mjs';

/* 좌측 필터 패널 — 레이아웃 A 의 좌우 분할을 목록에서 쓰는 자리 */
const filterPanel = () => `<aside class="filter">
  <div class="row-b mb4"><h3 class="t-card">필터</h3><button class="link quiet" type="button" data-toast="필터를 모두 해제했어요">초기화</button></div>

  <div class="fg">
    <h4>서비스</h4>
    <div class="col" style="gap:2px">
      ${[['이사', 1240], ['청소', 980], ['인테리어', 310], ['수리·설치', 720], ['과외·레슨', 460]]
    .map(([nm, n], i) => `<label class="check"><input type="checkbox"${i === 0 ? ' checked' : ''}>
      <span class="grow">${nm}</span><span class="t-sub">${U.num(n)}</span></label>`).join('')}
    </div>
    <button class="link mt2" type="button" data-toast="분야를 더 펼쳤어요">＋ 더 보기</button>
  </div>

  <div class="fg">
    <h4>활동 지역</h4>
    <select class="input mb2"><option>서울특별시</option><option>경기도</option><option>인천광역시</option></select>
    <div class="col" style="gap:2px">
      ${['강남구', '서초구', '송파구', '강동구'].map((nm, i) =>
      `<label class="check"><input type="checkbox"${i === 0 ? ' checked' : ''}><span>${nm}</span></label>`).join('')}
    </div>
  </div>

  <div class="fg">
    <h4>가격대</h4>
    <div class="slider"><div class="fill"></div><span class="kn" style="left:calc(12% - 9px)"></span><span class="kn" style="left:calc(74% - 9px)"></span></div>
    <div class="row-b t-sub"><span>10만원</span><span>50만원</span></div>
  </div>

  <div class="fg">
    <h4>평점</h4>
    <label class="check"><input type="checkbox" checked><span>4.5 이상만 보기</span></label>
    <label class="check"><input type="checkbox"><span>후기 50건 이상</span></label>
  </div>

  <div class="fg">
    <h4>인증</h4>
    ${['사업자 등록', '자격증 확인', '신원 확인'].map((nm, i) =>
    `<label class="check"><input type="checkbox"${i === 2 ? ' checked' : ''}><span>${nm}</span></label>`).join('')}
  </div>

  <div class="fg">
    <h4>응답</h4>
    <label class="check"><input type="checkbox"><span>1시간 안에 답하는 고수</span></label>
    <label class="check"><input type="checkbox"><span>지금 요청 받는 중</span></label>
  </div>

  ${U.btn('필터 적용', { cls: 'btn-pri btn-block', attr: ' data-toast="필터를 적용했어요"' })}
</aside>`;

/* ---------------- SE-01 고수 목록 ---------------- */
function SE01(ctx) {
  const list = `
  <div class="row-b wrap-row mb4">
    <div>
      <h1 class="t-page">이사 고수</h1>
      <p class="t-sub">강남구 · 평점 4.5 이상 · 신원 확인 — <b>184명</b></p>
    </div>
    <div class="row-c wrap-row">
      <select class="input" style="width:auto" data-sort-cards="pros"><option value="rec">추천순</option><option value="rate" data-desc>평점 높은순</option><option value="resp">응답 빠른순</option><option value="price">가격 낮은순</option></select>
      ${U.btn('🗺 지도로 보기', { cls: 'btn-ghost', attr: ' data-toast="지도 화면은 프리미엄(3뎁스)에 들어 있어요"' })}
    </div>
  </div>

  <div class="chips mb4">
    ${U.chip('강남구', true)}${U.chip('평점 4.5 이상', true)}${U.chip('신원 확인', true)}
    <button class="link quiet" type="button" data-toast="필터를 모두 해제했어요">모두 지우기</button>
  </div>

  <div class="pro-list" data-sort-list="pros">${PROS.map((p, i) => U.proRow(p, { i })).join('')}</div>

  <div class="center mt-block">
    ${U.btn('고수 더 보기', { cls: 'btn-ghost btn-lg', attr: ' data-toast="다음 20명을 불러왔어요"' })}
    <p class="t-sub mt3">184명 중 8명을 보고 계세요. 스크롤을 내리면 자동으로 더 불러옵니다.</p>
  </div>

  <div class="mt-block">${U.banner('info', '💡', `<b>한 명씩 찾는 게 번거로우세요?</b>
    <div class="t-sub mt1">요청서를 한 장 쓰시면 조건에 맞는 고수 여러 명이 먼저 값을 보내드려요. 비교만 하시면 됩니다.</div>`,
    { right: U.btn('요청서 작성', { href: 'RQ-01', cls: 'btn-pri btn-sm' }) })}</div>

  <p class="t-sub mt4 center">조건에 맞는 고수가 없으면 <a class="link" href="${U.link('SE-02')}">이런 화면</a>이 나와요.</p>`;

  return { body: U.filterPage(filterPanel(), list), o: {} };
}

/* ---------------- SE-02 고수 목록 - 결과 없음 ---------------- */
function SE02(ctx) {
  const body = `
  <div class="row-b wrap-row mb4">
    <div><h1 class="t-page">피아노 과외 고수</h1><p class="t-sub">강남구 · 15만원 이하 · 자격증 확인 — <b>0명</b></p></div>
  </div>

  <div class="empty">
    <div class="ico">🔍</div>
    <h3 class="t-sec">강남구에서 ‘피아노 과외’ 조건에 맞는 고수가 없어요</h3>
    <p class="msg">조건을 조금만 넓히면 찾을 수 있어요.</p>
  </div>

  <div class="card mt4"><div class="card-bd">
    <h3 class="t-card mb3">지금 걸어 둔 조건</h3>
    <div class="chips">
      ${U.chip('피아노 과외', true)}${U.chip('강남구', true)}${U.chip('15만원 이하', true)}${U.chip('자격증 확인', true)}
    </div>
    <p class="t-sub mt3">칩을 눌러 하나씩 빼 보세요.</p>
  </div></div>

  ${U.sec('이렇게 해보세요', `<div class="g2">
    <div class="card tape"><div class="card-bd">
      <h3 class="t-card">지역을 서울 전체로 넓히기</h3>
      <p class="t-sub mt2">강남구 밖에도 방문 수업을 하는 고수가 많아요. 서울 전체로 넓히면 <b class="pri">42명</b>이 나와요.</p>
      <div class="btns mt-block">${U.btn('서울 전체로 보기', { href: 'SE-01', cls: 'btn-pri btn-sm' })}</div>
    </div></div>
    <div class="card tape acc"><div class="card-bd">
      <h3 class="t-card">가격대 올리기</h3>
      <p class="t-sub mt2">이 지역 피아노 과외는 회당 18~25만원이 많아요. 25만원까지 올리면 <b class="pri">11명</b>이 나와요.</p>
      <div class="btns mt-block">${U.btn('25만원까지 보기', { href: 'SE-01', cls: 'btn-ghost btn-sm' })}</div>
    </div></div>
  </div>`, { desc: '조건 하나만 풀어도 결과가 크게 달라져요.' })}

  <div class="sec">${U.box(`<div class="row-b wrap-row">
    <div>
      <span class="badge b-pri">더 쉬운 방법</span>
      <h2 class="t-sec mt2">요청서를 남기시면 고수가 먼저 연락드려요</h2>
      <p class="t-sub mt2">지금 목록에 없어도, 조건이 맞으면 고수 쪽에서 값을 보내옵니다.<br>
      비슷한 요청은 보통 <b>30분 안에</b> 첫 견적이 도착했어요.</p>
    </div>
    ${U.btn('요청서 작성하기', { href: 'RQ-01', cls: 'btn-pri btn-lg' })}
  </div>`, { cls: 'pri' })}</div>

  ${U.sec('비슷한 분야 고수', `<div class="pro-g2">${[PRO('p5'), PRO('p6'), PRO('p4'), PRO('p2')].map((p) =>
    U.proCard(p, { why: '비슷한 분야' })).join('')}</div>`, { more: 'SE-01' })}`;

  return { body, o: { wrapCls: 'wrap' } };
}

/* ---------------- SE-03 고수 상세 ---------------- */
function SE03(ctx) {
  const p = PRO('p1');
  const dist = [{ s: 5, n: 281 }, { s: 4, n: 34 }, { s: 3, n: 9 }, { s: 2, n: 3 }, { s: 1, n: 1 }];

  const main = `
  ${U.card('제공 서비스와 가격', U.table(
    [{ t: '서비스', w: '46%' }, { t: '시작가', w: '27%' }, { t: '보통 걸리는 시간' }],
    [
      ['원룸·소형 이사', `<b>${U.won(180000)}</b>`, '3~4시간'],
      ['가정 이사(반포장)', `<b>${U.won(420000)}</b>`, '5~6시간'],
      ['가정 이사(포장)', `<b>${U.won(680000)}</b>`, '6~8시간'],
      ['사무실 이사', `<b>${U.won(1200000)}</b>`, '하루'],
      ['용달·소량 운반', `<b>${U.won(70000)}</b>`, '1~2시간'],
    ],
  ) + `<p class="t-sub mt3">시작가는 가장 작은 규모 기준이에요. 짐 양·층수·사다리차 여부에 따라 달라지니 견적을 받아 보세요.</p>`,
    { bdCls: 'flush' })}

  <div class="mt-block">${U.card('자기소개', `
    <p>15년 동안 이사만 했습니다. 원룸부터 사무실까지 해봤지만, 가장 자신 있는 건 <b class="hl">승강기 없는 건물의 원룸 이사</b>입니다.</p>
    <p class="mt3">짐을 옮기는 것보다 <b>안 깨뜨리는 게</b> 더 어렵습니다. 그래서 포장 자재는 제가 직접 골라 씁니다. 유리·도자기·모니터는 따로 싸고, 옷장 분해가 필요하면 미리 말씀 주시면 공구를 챙겨 갑니다.</p>
    <p class="mt3">약속한 시간에는 반드시 도착합니다. 앞 건이 늦어질 것 같으면 전날에 미리 연락드립니다. 지난 3년간 지각은 두 번, 두 번 모두 사유를 알리고 비용을 깎아 드렸습니다.</p>
    <div class="mt-block">${U.kv([
      ['보유 차량', '1톤 2대 · 2.5톤 1대'],
      ['함께 일하는 인원', '기사 포함 2~4명'],
      ['보험', '운송물 배상책임보험 가입 (건당 최대 500만원)'],
      ['쉬는 날', '매주 수요일 · 명절 당일'],
    ], { cls: 'left' })}</div>`)}</div>

  <div class="mt-block">${U.card('작업 사진', `<div class="gal">
    ${['원룸 포장 마무리', '사다리차 작업', '사무실 이사 현장'].map((t, i) => `<div class="it">
      ${U.phWork('w' + i, { tiny: true })}
      <div class="cap"><b>${t}</b><div class="t-sub">2026년 ${6 - i}월</div></div></div>`).join('')}
  </div>`, { aside: `<a class="more" href="${U.link('SE-04')}">포트폴리오 전체 24장 ›</a>` })}</div>

  <div class="mt-block">${U.card('후기 328건', `
    ${U.rateSummary(4.9, dist)}
    <div class="chips mt-block">${U.chip('전체', true)}${U.chip('사진 있는 후기 62')}${U.chip('원룸 이사 210')}${U.chip('가정 이사 88')}</div>
    <div class="mt-item">${REVIEWS.filter((r) => r.r >= 4).slice(0, 3).map((r) => U.review(r, { pro: false })).join('')}</div>
    <div class="btns center mt-block">${U.btn('후기 더 보기', { cls: 'btn-ghost', attr: ' data-toast="다음 10건을 불러왔어요"' })}</div>`)}</div>

  <div class="mt-block">${U.card('활동 지역', `
    <div class="map">
      <div class="zone" style="left:24%;top:18%;width:52%;height:64%"></div>
      <span class="pin on" style="left:46%;top:44%" data-name="강남구 (본점)"></span>
      <span class="pin" style="left:30%;top:60%" data-name="서초구"></span>
      <span class="pin" style="left:64%;top:34%" data-name="송파구"></span>
      지도 영역 (활동 반경 · 권장 1200×600)
    </div>
    <div class="mt3" data-map-preview><b data-map-name>강남구 (본점)</b> <span class="t-sub">를 포함해 강남·서초·송파에서 활동해요. 그 밖 지역은 출장비가 붙습니다.</span></div>`)}</div>

  <div class="mt-block">${U.card('취소·환불 규정', U.table(
    [{ t: '취소 시점' }, { t: '수수료' }],
    [['방문 3일 전까지', '없음'], ['방문 2일 전', '견적의 10%'], ['방문 전날', '견적의 30%'], ['당일 취소', '견적의 50%']],
  ), { bdCls: 'flush' })}</div>`;

  const aside = `
  ${U.card('', `
    <div class="t-sub">시작가</div>
    <div class="price-lg">${U.won(p.from)}</div>
    <p class="t-sub mt1">원룸·소형 이사 기준</p>
    <div class="mt-block btns col">
      ${U.btn('견적 요청하기', { href: 'RQ-01', cls: 'btn-pri btn-lg btn-block' })}
      ${U.btn('채팅으로 물어보기', { href: 'CH-02', cls: 'btn-ghost btn-block' })}
    </div>
    <div class="row mt3" style="gap:8px">
      <button class="heart grow" type="button" style="width:auto">♡ 찜하기</button>
      <button class="btn btn-ghost grow" type="button" data-toast="주소를 복사했어요">공유</button>
    </div>
    <hr style="border:0;border-top:1px solid var(--border);margin:var(--sp-block) 0">
    ${U.kv([
    ['응답 가능', '평일 08:00–20:00'],
    ['쉬는 날', '수요일'],
    ['지금', '<b class="success">요청 받는 중</b>'],
  ])}
    <p class="t-sub mt3">지금 요청하시면 보통 <b>12분</b> 안에 답이 옵니다.</p>`, { cls: 'pri' })}

  <div class="mt4">${U.box(`<h4 class="t-card mb2">무엇이 확인됐나요</h4>
    <div class="col" style="gap:var(--sp-item)">
      ${[['사업자 등록', '한결이사 · 123-45-67890'], ['자격증', '화물운송종사 자격증'], ['신원 확인', '휴대폰·신분증 확인 완료']]
      .map(([k, v]) => `<div>${U.verify(k)}<div class="t-sub mt1">${v}</div></div>`).join('')}
    </div>
    <p class="t-sub mt3">플랫폼이 서류 원본을 확인한 항목입니다.</p>`, { cls: 'soft' })}</div>`;

  const hero = `<section class="hero-split" style="padding:var(--s10) 0"><div class="wrap in">
    <div>
      <div class="row-c wrap-row mb4">${U.phPro(96, p.id)}
        <div>
          <div class="row-c wrap-row"><h1 class="t-sec">${U.esc(p.nm)}</h1>${U.badge(p.cat, 'b-pri')}</div>
          <p class="t-sub mt1">${U.esc(p.one)}</p>
          <div class="verifies mt2">${p.tags.map(U.verify).join('')}</div>
        </div>
      </div>
      <p class="t-sub">${U.esc(p.area)}에서 활동 · ${p.since}부터 ${U.num(p.done)}건</p>
    </div>
    <div>${U.trust(p)}</div>
  </div></section>`;

  const stick = U.stickBar(
    `<div class="row-c"><span class="t-sub">시작가</span><b class="price">${U.won(p.from)}</b>
     <span class="t-sub">· ${U.stars(p.r)} ${p.r.toFixed(1)} · 응답률 ${p.resp}%</span></div>`,
    U.btn('채팅 문의', { href: 'CH-02', cls: 'btn-ghost' }) + U.btn('견적 요청하기', { href: 'RQ-01', cls: 'btn-pri btn-lg' }),
  );

  return { body: U.detail2(main, aside), o: { hero, stick } };
}

/* ---------------- SE-04 고수 포트폴리오 ---------------- */
function SE04(ctx) {
  const p = PRO('p1');
  const works = [
    ['원룸 포장 이사 (역삼동)', '반나절', '18~22만원', '이사'],
    ['가정 이사 24평 (대치동)', '하루', '65~80만원', '이사'],
    ['사무실 이사 40석 (삼성동)', '하루', '150~180만원', '사무실'],
    ['사다리차 5층 작업 (논현동)', '3시간', '25~30만원', '이사'],
    ['보관 이사 2주 (서초동)', '2회 방문', '55~70만원', '보관'],
    ['용달 소량 운반 (양재동)', '2시간', '7~10만원', '용달'],
    ['원룸 반포장 (신사동)', '3시간', '15~18만원', '이사'],
    ['피아노 포함 가정 이사', '하루', '80~95만원', '이사'],
    ['사무실 부분 이전 (선릉)', '반나절', '60~75만원', '사무실'],
  ];

  const body = `
  <div class="row-b wrap-row mb4">
    <a class="row-c" href="${U.link('SE-03')}">${U.phPro(52, p.id)}
      <div><b class="t-card">${U.esc(p.nm)}</b><div class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)} (${U.num(p.rv)}) · 작업 사진 24장</div></div></a>
    ${U.btn('견적 요청', { href: 'RQ-01', cls: 'btn-pri' })}
  </div>

  <div class="chips mb4">
    ${U.chip('전체 24', true)}${U.chip('이사 14')}${U.chip('사무실 5')}${U.chip('보관 3')}${U.chip('용달 2')}
  </div>

  <div class="gal">${works.map(([t, d, c, k], i) => `<div class="it">
    ${U.phWork('pf' + i, { tiny: true })}
    <div class="cap"><b>${t}</b>
      <div class="t-sub">걸린 기간 ${d} · 비용대 ${c}</div>
      <div class="mt1">${U.badge(k, 'b-mut')}</div></div></div>`).join('')}</div>

  <div class="center mt-block">${U.btn('사진 더 보기 (15장)', { cls: 'btn-ghost btn-lg', attr: ' data-toast="다음 9장을 불러왔어요"' })}</div>

  ${U.sec('사진을 누르면 이렇게 크게 보여요', `<div class="lightbox">
    <button class="nav prev" type="button" aria-label="이전">‹</button>
    <button class="nav next" type="button" aria-label="다음">›</button>
    <div style="max-width:640px;margin:0 auto">${U.phWork('big', {})}</div>
    <div class="cap" style="max-width:640px;margin:var(--s4) auto 0">
      <div class="row-b wrap-row">
        <div>
          <b style="font-size:16px">가정 이사 24평 (대치동)</b>
          <div style="opacity:.75;margin-top:4px">걸린 기간 하루 · 비용대 65~80만원 · 2026년 6월</div>
          <p style="margin-top:10px;max-width:44em">3층에서 12층으로 옮기는 작업이었습니다. 사다리차를 쓰고 유리 제품은 따로 포장했습니다. 오전 8시에 시작해 오후 4시에 마쳤습니다.</p>
        </div>
        <div class="btns">
          <a class="btn btn-pri" href="${U.link('RQ-01')}">이 작업처럼 견적 요청</a>
          <button class="btn btn-ghost" type="button" data-toast="신고를 접수했어요" style="background:transparent;border-color:rgba(255,255,255,.3);color:#fff">신고</button>
        </div>
      </div>
      <div style="opacity:.6;margin-top:14px;font-size:12px">4 / 24 · 좌우 화살표로 넘겨 보세요</div>
    </div>
  </div>`, { desc: '어두운 배경 위에 사진과 설명이 뜨고, 좌우 화살표로 넘깁니다.' })}

  <div class="center mt-block">${U.btn('이 고수에게 견적 요청하기', { href: 'RQ-01', cls: 'btn-pri btn-lg' })}</div>`;

  return { body, o: {} };
}

/* ---------------- SE-05 찜한 고수 ---------------- */
function SE05(ctx) {
  const saved = [
    { p: PRO('p1'), at: '2026-08-04', chg: ['새 후기 3건'] },
    { p: PRO('p2'), at: '2026-08-02', chg: ['가격이 내려갔어요'] },
    { p: PRO('p4'), at: '2026-07-28', chg: [] },
    { p: PRO('p6'), at: '2026-07-19', chg: ['지금 휴무'] },
  ];

  const body = U.myPage('SE-05', `
  ${U.pageHd('찜한 고수', '4명 · 값이 바뀌거나 새 후기가 달리면 여기서 알려드려요',
    U.btn('고수 더 찾기', { href: 'SE-01', cls: 'btn-ghost' }))}

  ${U.banner('info', '✅', `<b>여러 명을 골라 한 번에 견적을 요청할 수 있어요</b>
    <div class="t-sub mt1">왼쪽 네모를 눌러 고르시면 아래에 버튼이 나타납니다. 요청서는 한 번만 쓰면 돼요.</div>`)}

  <div class="pro-list mt4">${saved.map(({ p, at, chg }) => U.proRow(p, {
    pick: true, ctaLabel: '견적 요청',
    tail: chg.map((c) => U.badge(c, c === '지금 휴무' ? 'b-mut' : 'b-acc')).join('') + `<span class="t-sub">${at} 찜</span>`,
  })).join('')}</div>

  <div class="mt-block">${U.sec('최근 본 고수', U.carousel(PROS.slice(4, 8).map((p) => `<a class="box" href="${U.link('SE-03')}">
    ${U.phPro(56, p.id)}
    <div class="mt3"><b>${U.esc(p.nm)}</b><div class="t-sub">${U.stars(p.r)} ${p.r.toFixed(1)} · ${U.won(p.from)}~</div></div>
    <div class="mt3"><button class="heart" type="button">♡</button></div>
  </a>`).join(''), { cls: 'narrow' }))}</div>

  <div class="mt-block">${U.box(`<h3 class="t-card">찜이 비어 있으면 이렇게 보여요</h3>
    <div class="mt4">${U.empty('🤍', '아직 찜한 고수가 없어요',
      '마음에 드는 고수를 찜해 두면 값이 바뀌거나 새 후기가 달릴 때 알려드려요.',
      U.btn('고수 둘러보기', { href: 'SE-01', cls: 'btn-pri' }) + U.btn('요청서 작성', { href: 'RQ-01', cls: 'btn-ghost' }))}</div>`,
    { cls: 'soft' })}</div>`);

  const stick = U.stickBar(
    '<b data-pick-n>2</b>명을 골랐어요',
    U.btn('고른 고수에게 한 번에 견적 요청', { href: 'RQ-01', cls: 'btn-pri btn-lg' }),
  );

  return { body, o: { stick } };
}

export const PAGES = { 'SE-01': SE01, 'SE-02': SE02, 'SE-03': SE03, 'SE-04': SE04, 'SE-05': SE05 };
