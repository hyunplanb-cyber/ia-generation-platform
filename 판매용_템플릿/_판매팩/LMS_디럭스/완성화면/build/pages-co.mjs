/* CO 강의 탐색 · 수강 신청 */
import * as U from './ui.mjs';
import { COURSES, CATS, LEVELS, REVIEWS, FAQ, CURRICULUM, byId } from './data.mjs';

const P = {};
export default P;

const C = byId('C01');

const filterSide = (list) => `
  <aside class="sticky">
    ${U.card('조건으로 좁히기', `
      <div class="mb4"><div class="lb">분야</div>
        <div class="checks" data-fset data-multi>
          ${CATS.map((c) => `<button class="chip" type="button" data-fgroup="${list}" data-f="cat" data-v="${c.key}" style="justify-content:flex-start;width:100%">${c.ico} ${c.key} <span class="t-sub" style="margin-left:auto">${c.n}</span></button>`).join('')}
        </div></div>
      <div class="mb4"><div class="lb">난이도</div>
        <div class="chips" data-fset data-multi>${LEVELS.map((l) => `<button class="chip chip-sm" type="button" data-fgroup="${list}" data-f="lv" data-v="${l}">${l}</button>`).join('')}</div></div>
      <div class="mb4"><label class="lb" for="price-range">가격대 <b class="pri" id="price-out">200,000원</b> 이하</label>
        <input class="slider" type="range" id="price-range" min="0" max="200000" step="10000" value="200000"
          data-out="#price-out" data-unit="원" data-pricemax="${list}"></div>
      <div class="toggle-row"><span>무료 강의만 보기</span>
        <button class="toggle" type="button" role="switch" aria-checked="false" aria-label="무료 강의만 보기"
          data-only-list="${list}" data-only-key="price" data-only-val="무료"><i></i></button></div>
    `, { ft: `<button class="btn btn-ghost btn-block" type="button" data-freset="${list}">전체 초기화</button>` })}
  </aside>`;

const sortSelect = (list) => `<select class="input" style="width:180px" data-sortlist="${list}" aria-label="정렬">
  <option value="pop">인기순</option><option value="new">최신순</option>
  <option value="rate">평점순</option><option value="price">낮은 가격순</option></select>`;

const pager = (list, on = 1) => `<div class="row-c mt8" style="justify-content:center" data-pager="${list}">
  ${[1, 2, 3, 4, 5].map((n) => `<button class="chip chip-sm${n === on ? ' on' : ''}" type="button" data-page="${n}">${n}</button>`).join('')}
  <button class="chip chip-sm" type="button" data-page="6">›</button></div>`;

/* ================= CO-01 강의 목록 ================= */
P['CO-01'] = () => {
  const body = `
${U.pageHd('강의 탐색', '1,280개 강의 가운데 지금 조건에 맞는 것은 <b class="pri" data-fcount="cat">12</b>개예요')}

<div class="split-l">
  ${filterSide('cat')}
  <div>
    <div class="card mb4"><div class="card-bd">
      <div class="row-b wrap-row">
        <div class="grow" style="min-width:220px">
          <input class="input" type="search" placeholder="강의명, 강사명으로 찾기" data-search="cat" aria-label="강의 검색">
        </div>
        ${sortSelect('cat')}
        <a class="btn btn-primary" href="${U.link('CO-02')}">검색</a>
      </div>
      <div class="chips mt3" data-chipbar="cat"></div>
    </div></div>

    <div class="g3" data-list="cat">${U.ccards(COURSES, { cols: 3 })}</div>
    <div data-list-empty="cat" hidden>${U.empty('🔍', '조건에 맞는 강의가 없어요', '조건을 하나씩 풀어 보시면 다시 나타납니다',
    `<button class="btn btn-primary" type="button" data-freset="cat">조건 모두 풀기</button>`)}</div>
    ${pager('cat')}
  </div>
</div>`;
  return { body, o: {} };
};

/* ================= CO-02 강의 목록 · 검색 결과 없음 ================= */
P['CO-02'] = () => {
  const body = `
${U.pageHd('강의 탐색', '조건에 맞는 강의를 찾지 못했어요')}

<div class="split-l">
  ${filterSide('cat')}
  <div>
    <div class="card mb4"><div class="card-bd">
      <div class="row-b wrap-row">
        <div class="grow" style="min-width:220px">
          <input class="input" type="search" value="블록체인 실무" data-search="cat" aria-label="강의 검색">
        </div>
        ${sortSelect('cat')}
      </div>
      <div class="chips mt3" data-chipbar="cat"></div>
      <p class="t-sub mt2">칩의 ✕를 누르면 그 조건만 풀리고 결과가 다시 늘어납니다</p>
    </div></div>

    <div data-list-empty="cat">${U.empty('🔍', "'블록체인 실무'에 대한 강의를 찾지 못했어요",
    '검색어를 줄이거나 걸어 둔 조건을 풀어 보세요. 아래 추천 강의도 참고하실 수 있어요.',
    `<button class="btn btn-primary" type="button" data-freset="cat">필터 초기화</button>
     <a class="btn btn-ghost" href="${U.link('CO-01')}">강의 목록으로</a>`)}</div>

    <div class="g3 mt6" data-list="cat" data-finit='{"__q":"블록체인 실무"}'>${U.ccards(COURSES, { cols: 3 })}</div>

    ${U.sec('이런 강의는 어때요?', `<div class="g4">${U.ccards([COURSES[0], COURSES[1], COURSES[4], COURSES[6]], { cols: 4, noHeart: true })}</div>`, { cls: 'mt8' })}
  </div>
</div>`;
  return { body, o: {} };
};

/* ================= CO-03 강의 상세 ================= */
P['CO-03'] = () => {
  const rvOf = REVIEWS.filter((r) => r.course === C.name).concat(REVIEWS.slice(2));
  const dist = [[5, 912], [4, 264], [3, 78], [2, 21], [1, 9]];
  const total = dist.reduce((a, b) => a + b[1], 0);

  const body = `
<div class="split-r">
  <div>
    ${U.card('', `
      ${U.ph('강의 소개 영상', 'ph-169', C.id)}
      <div class="badges mt4">${U.badge(C.cat, 'b-line')}${U.badge(C.lv, 'b-line')}${U.badge('BEST', 'b-acc')}</div>
      <h1 class="t-page mt2">${C.name}</h1>
      <p class="t-sub mt2">${C.by} · ${C.ep}차시 · 총 ${C.hrs}시간 · 마지막 업데이트 2026-08-04</p>
      <div class="row-c mt3 wrap-row">${U.rateLine(C.rate, C.rv)} <span class="muted">·</span> <span>수강생 ${U.nf(C.st)}명</span>
        <button class="heart" type="button" style="position:static;box-shadow:none;border:1px solid var(--border)" aria-label="찜하기">♡</button></div>
    `, { bdCls: '' })}

    <div class="mt6">
    ${U.tabs([{ label: '강의 소개', pane: 'about' }, { label: '커리큘럼', pane: 'cur' }, { label: '강사 소개', pane: 'tut' }, { label: '수강 후기', pane: 'rv', cnt: U.nf(total) }], 0, { panes: 'detail' })}
    <div data-pane-set="detail">
      ${U.pane('about', `
        ${U.card('이 강의는 이런 분께 맞습니다', `<ul class="list-plain">
          ${['엑셀은 쓰지만 함수는 늘 검색해서 쓰는 분', '매달 같은 보고서를 손으로 다시 만드는 분', '데이터 분석을 배우고 싶은데 어디서 시작할지 모르는 분']
            .map((t) => `<li>✓ ${t}</li>`).join('')}</ul>`)}
        <div class="mt4">${U.card('이런 걸 배웁니다', `<div class="g2 gap-s">
          ${['조건에 맞는 값만 골라 합계 내기', '표를 자동으로 요약하는 피벗 테이블', '오류 없이 굴러가는 수식 짜기', '한 장으로 읽히는 보고서 만들기', '슬라이서로 걸러 보는 대시보드', '날짜·기간을 다루는 함수']
            .map((t) => `<div class="box">✓ ${t}</div>`).join('')}</div>`)}</div>
        <div class="mt4">${U.card('강의 소개', `
          <p>실무에서 데이터를 다루는 일은 대개 <b class="mark">같은 작업의 반복</b>입니다. 이 강의는 그 반복을 줄이는 데 초점을 맞췄습니다.</p>
          <p class="mt3">1장에서는 데이터를 담는 그릇, 곧 표를 표답게 만드는 규칙부터 잡습니다. 2장에서는 조건 합계와 조회 함수로 계산을 자동화하고,
          3장에서 피벗 테이블로 요약과 시각화를 다룹니다. 마지막 4장에서는 이 모든 것을 <b>한 장짜리 보고서</b>로 묶습니다.</p>
          <p class="mt3">모든 차시에 실습 파일이 함께 제공되고, 과제는 3개입니다. 과제를 모두 내고 진도율 80%를 넘기면 수료증을 받으실 수 있어요.</p>
          <div class="mt4">${U.ph('강의 상세 이미지', 'ph-banner', 'detail')}</div>`)}</div>
      `, true)}

      ${U.pane('cur', `
        ${U.card('', `<div class="row-b wrap-row">
          <div><b>${CURRICULUM.length}개 챕터 · ${CURRICULUM.reduce((a, c) => a + c.lessons.length, 0)}차시</b>
          <span class="t-sub"> · 총 ${C.hrs}시간</span></div>
          <span class="t-sub">▶ 표시가 붙은 차시는 미리 볼 수 있어요</span></div>`)}
        <div class="mt4">
        ${CURRICULUM.map((ch, i) => `<div class="cur-ch${i > 1 ? ' off' : ''}">
          <button class="hd" type="button"><span>${ch.ch}</span>
            <span class="t-sub">${ch.lessons.length}차시 · ${ch.lessons.reduce((a, l) => a + l.min, 0)}분</span></button>
          <div class="body"><div>${ch.lessons.map((l) => `<div class="cur-l">
            <span class="st">${l.free ? '▶' : '🔒'}</span><span class="grow">${l.no}. ${l.t}</span>
            ${l.free ? U.badge('미리보기', 'b-pri') : ''}<span class="tm">${l.min}분</span></div>`).join('')}</div></div>
        </div>`).join('')}
        </div>
      `)}

      ${U.pane('tut', `${U.card('', `<div class="row wrap-row" style="gap:var(--s6)">
        ${U.ph('프로필', 'ph-ava', C.by)}
        <div class="grow" style="min-width:240px">
          <h2 class="t-sec">${C.by}</h2><p class="t-sub">데이터 분석 강사 · 전 제조업 데이터팀</p>
          <p class="mt3">10년 동안 현장에서 쓰는 데이터를 다뤘습니다. 어려운 말을 줄이고, 실제로 쓰는 순서대로 가르치는 것을 좋아합니다.</p>
          <div class="g3 gap-s mt4">
            <div class="box center"><div class="t-sec">3개</div><div class="t-sub">개설 강의</div></div>
            <div class="box center"><div class="t-sec">4.9</div><div class="t-sub">평균 평점</div></div>
            <div class="box center"><div class="t-sec">${U.nf(C.st)}명</div><div class="t-sub">누적 수강생</div></div>
          </div>
        </div></div>`)}`)}

      ${U.pane('rv', `
        ${U.card('', `<div class="row wrap-row" style="gap:var(--s8)">
          <div class="center" style="flex:none"><div class="t-page pri">${C.rate.toFixed(1)}</div>${U.stars(C.rate)}
            <div class="t-sub">후기 ${U.nf(total)}개</div></div>
          <div class="grow">${dist.map(([s, n]) => `<div class="bar-row"><span class="muted" style="width:32px">${s}점</span>
            ${U.bar(Math.round(n / total * 100))}<span class="pct">${U.nf(n)}</span></div>`).join('')}</div>
        </div>`)}
        <div class="mt4">${U.fchips('rv', 'rate', ['*', ['r5', '5점'], ['r4', '4점'], ['r3', '3점 이하']], { allLabel: '전체' })}</div>
        <div class="card mt4"><div class="card-bd" data-list="rv" data-morelist="rv">
          ${rvOf.map((r, i) => `<div data-tags="rate:${r.rate === 5 ? 'r5' : r.rate === 4 ? 'r4' : 'r3'}" ${i > 3 ? 'hidden data-more-hidden' : ''}>${U.review(r)}</div>`).join('')}
          <div class="center mt4"><button class="btn btn-ghost" type="button" data-more="rv" data-more-step="2">후기 더 보기</button></div>
        </div></div>
        <div data-list-empty="rv" hidden class="mt4">${U.empty('💬', '그 별점의 후기가 없어요', '다른 별점을 눌러 보세요')}</div>
      `)}
    </div></div>

    ${U.sec('자주 묻는 질문', U.card('', U.accordion(FAQ.slice(0, 4), { single: true }), { bdCls: 'tight' }), { cls: 'mt8' })}
  </div>

  <aside class="sticky">
    ${U.card('', `
      ${U.price(C, { cls: 'price-lg' })}
      <p class="t-sub mt2">6개월 무제한 수강 · 수료증 발급</p>
      <div class="btns-v mt7">
        ${U.btn('수강 신청하기', { cls: 'btn-primary btn-lg btn-block', href: 'CO-04' })}
        ${U.btnSay('장바구니에 담기', '장바구니는 서버가 연결되면 담깁니다', { cls: 'btn-soft btn-block' })}
      </div>
      <div class="hr"></div>
      ${U.kv([['총 차시', `${C.ep}차시`], ['총 재생 시간', `${C.hrs}시간`], ['수강 기간', '결제 후 6개월'], ['수료 조건', '진도 80% · 과제 3개'], ['자료', '실습 파일 12개']])}
    `)}
    <div class="mt4">${U.banner('acc', '🎟', `<b>첫 수강 20% 쿠폰</b><br><span class="t-sub">결제 화면에서 적용됩니다</span>`,
    `<button class="btn btn-soft btn-sm" type="button" data-toast="쿠폰을 받았어요. 결제할 때 적용하세요" data-toast-kind="ok">받기</button>`)}</div>
  </aside>
</div>`;
  return { body, o: {} };
};

/* ================= CO-04 수강 신청 · 결제 ================= */
P['CO-04'] = () => {
  const body = `
${U.pageHd('수강 신청', '결제 전에 한 번만 더 확인해 주세요')}

<div class="split-r" data-calc-pay data-base="${C.price}">
  <div>
    ${U.card('신청 강의', U.courseRow(C, { right: `<div style="text-align:right">${U.price(C)}</div>` }))}

    <div class="mt4">${U.card('쿠폰', `
      <div class="field"><label class="lb" for="coupon-sel">가지고 있는 쿠폰</label>
        <select class="input" id="coupon-sel" data-calc>
          <option data-rate="0" data-flat="0">쿠폰을 고르세요</option>
          <option data-rate="20" data-flat="0" selected>첫 수강 20% 할인</option>
          <option data-rate="0" data-flat="10000">여름 기획전 1만원 할인</option>
          <option data-rate="30" data-flat="0">데이터 분야 30% 할인 (오늘까지)</option>
        </select>
        <div class="help">고르면 아래 결제 금액이 그 자리에서 다시 계산됩니다</div></div>
      <div class="input-row"><input class="input" placeholder="쿠폰 코드를 직접 넣기">
        ${U.btnSay('적용', '쿠폰 코드 확인은 서버가 연결되면 동작합니다', { cls: 'btn-ghost' })}</div>`)}</div>

    <div class="mt4">${U.card('결제 수단', `
      <div class="radios">
        <div class="radio on" data-group="pay" data-shows="card" data-label="신용카드"><span class="dot"></span><span class="grow"><b>신용카드</b><div class="t-sub">국내 모든 카드 · 할부 가능</div></span></div>
        <div class="radio" data-group="pay" data-shows="kakao" data-label="카카오페이"><span class="dot"></span><span class="grow"><b>카카오페이</b><div class="t-sub">앱에서 바로 결제</div></span></div>
        <div class="radio" data-group="pay" data-shows="bank" data-label="계좌이체"><span class="dot"></span><span class="grow"><b>계좌이체</b><div class="t-sub">즉시 출금</div></span></div>
      </div>
      <div class="mt4" data-shown-by="pay:card">
        <div class="lb">할부 개월</div>
        <div class="chips">${[['일시불', 1], ['2개월', 2], ['3개월', 3], ['6개월', 6], ['12개월', 12]]
      .map(([l, m], i) => `<button class="chip${i === 0 ? ' on' : ''}" type="button" data-inst="${m}">${l}</button>`).join('')}</div>
        <div class="help" data-out-month>일시불로 결제됩니다</div>
      </div>
      <div class="mt4" data-shown-by="pay:kakao" hidden>${U.banner('mut', '💬', '결제하기를 누르면 카카오톡으로 결제 요청이 갑니다')}</div>
      <div class="mt4" data-shown-by="pay:bank" hidden>${U.banner('mut', '🏦', '이체가 확인되면 바로 수강할 수 있어요. 보통 1분 안에 확인됩니다')}</div>
    `)}</div>

    <div class="mt4">${U.card('환불 규정', `
      ${U.accordion([
      { q: '언제까지 환불되나요?', a: '결제 후 7일 이내이고 수강률이 10% 미만이면 전액 환불됩니다. 그 이후에는 남은 기간에 따라 부분 환불이 적용돼요.' },
      { q: '수강을 시작한 뒤에는요?', a: '들은 차시 수에 따라 계산합니다. 전체의 3분의 1을 넘겨 들으셨다면 환불이 어렵습니다.' },
    ], { single: true })}
      <label class="check mt4"><input type="checkbox" data-gate="pay" data-label="환불 규정 동의">
        <span>위 환불 규정을 확인했고 이에 동의합니다<span class="req">*</span></span></label>
      <div class="err-msg mt3" data-gatemsg="pay" hidden></div>`)}</div>
  </div>

  <aside class="sticky">
    ${U.card('결제 금액', `
      ${U.sumRows([
      ['강의 금액', U.won(C.price)],
      ['쿠폰 할인', '<span data-out-discount>-15,800원</span>'],
      ['결제 수단', '<span data-pick-out="pay">신용카드</span>'],
    ], ['최종 결제 금액', '<span data-out-final>63,200원</span>'])}
      <div class="btns-v mt7">
        <a class="btn btn-primary btn-lg btn-block is-off" href="${U.link('CO-05')}" data-gated="pay">결제하기</a>
        <a class="btn btn-ghost btn-block" href="${U.link('CO-06')}">결제 실패</a>
      </div>
      <p class="t-sub mt3 center">동의해야 결제 버튼이 켜집니다</p>
    `)}
  </aside>
</div>`;
  return { body, o: {} };
};

/* ================= CO-05 수강 신청 · 완료 ================= */
P['CO-05'] = () => {
  const body = `
<div class="wrap-narrow">
  ${U.card('', `
  ${U.result('ok', '✓', '수강 신청이 완료됐어요', '결제 확인 메일을 sh.kim@example.com 으로 보냈습니다',
    `${U.btn('바로 학습 시작하기', { cls: 'btn-primary btn-lg', href: 'CL-03' })}
     ${U.btn('내 강의실 가기', { cls: 'btn-ghost btn-lg', href: 'CL-01' })}`)}

  <div class="box mt6">
    <div class="row-b wrap-row"><span class="muted">주문번호</span>
      <button class="btn-link" type="button" data-copy="ORD-20260807-004182">ORD-20260807-004182 · 복사</button></div>
    <div class="row-b wrap-row mt2"><span class="muted">결제 금액</span><b>63,200원</b></div>
    <div class="row-b wrap-row mt2"><span class="muted">결제 수단</span><span>신용카드 (일시불)</span></div>
  </div>

  <div class="mt4">${U.card('신청한 강의', U.courseRow(C, {
      right: U.btn('바로 보기', { cls: 'btn-soft', href: 'CL-03' }),
      extra: `<div class="mt2">${U.badge('수강 기간 2026-08-07 ~ 2027-02-06', 'b-line')}</div>`,
    }))}</div>

  <div class="mt4">${U.card('', U.accordion([{
      q: '영수증 보기', a: `${U.sumRows([
        ['강의 금액', U.won(C.price)], ['쿠폰 할인', '-15,800원'], ['공급가액', '57,455원'], ['부가세', '5,745원'],
      ], ['합계', '63,200원'])}
      <p class="t-sub mt3">현금영수증·세금계산서는 마이페이지 &gt; 수강 이력에서 발급하실 수 있어요.</p>`,
    }]), { bdCls: 'tight' })}</div>
  `)}
</div>`;
  return { body, o: {} };
};

/* ================= CO-06 수강 신청 · 결제 실패 ================= */
P['CO-06'] = () => {
  const body = `
<div class="wrap-narrow">
  ${U.card('', `
  ${U.result('warn', '!', '결제가 완료되지 않았어요', '신청하신 내용은 그대로 남아 있으니 다시 시도하시면 됩니다')}

  <div class="box-warn">
    <b>카드 한도를 초과했어요</b>
    <p class="t-sub mt2">카드사에서 「한도 초과(51)」로 응답했습니다. 이번 달 사용 한도를 넘겼을 때 나오는 안내예요.</p>
    ${U.accordion([{
    q: '자세히 보기', a: `<ul class="list-plain">
      <li>· 응답 코드 51 · 한도 초과</li>
      <li>· 시도 시각 2026-08-07 14:22</li>
      <li>· 카드사 고객센터에 한도 상향을 요청하거나, 다른 결제 수단을 고르시면 됩니다</li>
      <li>· 결제가 되지 않았으므로 금액이 빠져나가지 않았습니다</li></ul>`,
  }], { single: true })}
  </div>

  <div class="mt6">${U.card('다른 결제 수단으로 해볼까요?', `
    <div class="radios">
      <div class="radio on" data-group="retry" data-label="신용카드"><span class="dot"></span><span class="grow"><b>다른 신용카드</b></span></div>
      <div class="radio" data-group="retry" data-label="카카오페이"><span class="dot"></span><span class="grow"><b>카카오페이</b><div class="t-sub">한도와 무관하게 계좌에서 바로 결제</div></span></div>
      <div class="radio" data-group="retry" data-label="계좌이체"><span class="dot"></span><span class="grow"><b>계좌이체</b></span></div>
    </div>`, {
    ft: `<div class="btns"><a class="btn btn-primary" href="${U.link('CO-04')}"><span data-pick-out="retry">신용카드</span>(으)로 다시 시도</a>
      <a class="btn btn-ghost" href="${U.link('CO-03')}">강의 상세로 돌아가기</a></div>`,
  })}</div>

  <div class="mt4">${U.banner('mut', '☎️', `<b>계속 실패한다면 알려 주세요</b><br>
    <span class="t-sub">고객센터 1588-0000 · 평일 10:00~18:00</span>`,
    U.btnSay('1:1 문의하기', '문의 접수는 서버가 연결되면 동작합니다', { cls: 'btn-ghost' }))}</div>
  `)}
</div>`;
  return { body, o: {} };
};
