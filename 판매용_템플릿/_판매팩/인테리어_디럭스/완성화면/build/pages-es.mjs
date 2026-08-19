/* ES 견적 (5) — 이 팩의 첫 번째 알맹이: 조건을 넣으면 계산되어 나온다 */
import * as U from './ui.mjs';
import { ESTIMATE_BASE, ESTIMATE_ITEMS, WOOD_DETAIL, 견적합계, GRADES, PAY_SCHEDULE } from './data.mjs';

export const PAGES = {};

/* ES-01 은 «화면 하나에 든 6단계 마법사»다. 스펙팩이 그렇게 적어 뒀고(「한 번에 한
   가지만 묻는 단계별 입력(6단계)」·「이전으로 돌아가도 답이 남는 것」), 프리미엄도
   1단계씩 화면을 쪼개는 대신 «동작»을 ES0102~06 으로 쪼갠다 — 즉 IA 상 화면 수는
   이대로가 맞다. 그러니 6단계를 다 넣고 앞뒤로 오갈 수 있게 만든다.
   ⚠ 예전에는 3단계 화면만 덩그러니 그려 두고 막대에 「6단계 중 3번째」라고만 적어
     두었다. 나머지 다섯 단계는 어디에도 없어서, 화면 수를 줄인 게 아니라 흐름이
     끊겨 보였다(2026-08-17 사장님 지적). */
PAGES['ES-01'] = () => {
  const SPACES = ['거실', '주방', '욕실', '침실', '베란다', '현관'];
  const 고른공간 = SPACES.slice(0, 3);
  /* ⚠ 평수를 «맨 앞»에 둔다. 홈 히어로에서 평수를 고르고 「1분 예상 견적」을
     누르는데, 그다음 화면이 공사 범위부터면 방금 고른 게 어디로 갔나 싶다.
     고르고 온 값이 1단계에 그대로 보여야 흐름이 이어진다(2026-08-17 사장님 지적). */
  const STEPS = ['평수', '공사 범위', '공간', '마감 등급', '거주 여부', '연락처'];

  /* 이 팩의 단계 막대는 .steps > .st 다(AS-03·AU-02·CT-02 와 같은 어휘).
     누르면 그 단계로 건너뛰게 data-step-dot 만 얹는다. */
  const 단계막대 = `<div class="steps">${STEPS.map((s, i) => `<div class="st ${i === 0 ? 'on' : ''}" data-step-dot="${i + 1}" style="cursor:pointer">${s}</div>`).join('')}</div>`;

  const 단계 = (n, title, body) => `<div data-step="${n}"${n === 1 ? '' : ' hidden'}>${U.card(title, body)}</div>`;

  return {
    body: `${U.pageHd('예상 견적 내기', '')}

<div data-wizard data-step-now="1" data-step-total="6">
${U.progress(0)}
<p class="t-sub mt2 mb6"><span data-step-label>6단계 중 1번째</span> · 대략 2분이면 끝나요</p>
${단계막대}

${U.detail2(
    `${단계(1, '평수가 어떻게 되시나요?', `
      <p class="t-sub mb4">등기부나 관리비 고지서에 적힌 «공급면적» 기준이면 돼요</p>
      ${U.banner('info', 'ℹ', '홈에서 <b data-from-home-label>30평대</b><span data-from-home-josa>를</span> 고르고 오셨어요. 정확한 평수로 고쳐 주세요.', { cls: 'mb4', attr: ' data-from-home hidden' })}
      <div class="field"><span class="lb">평수</span>
        <div class="row"><input class="in" type="number" data-pyeong value="${ESTIMATE_BASE.pyeong}" min="5" max="200" style="max-width:120px"><span class="t-sub">평 = <b data-pyeong-m2>${(ESTIMATE_BASE.pyeong * 3.3058).toFixed(1)}㎡</b></span></div>
      </div>`)}

    ${단계(2, '어디를 손보시나요?', `
      <p class="t-sub mb4">하나만 골라 주세요</p>
      <div class="g2">
        ${['전체 시공', '부분 시공'].map((v, i) => `<label class="box" style="text-align:center;cursor:pointer">
          <input type="radio" name="범위" data-field="공사 범위" value="${v}"${i === 0 ? ' checked' : ''} style="margin-bottom:6px">
          <div class="t-card">${v}</div>
          <div class="t-sub mt1">${i === 0 ? '집 전체를 다시 손봅니다' : '고칠 곳만 골라 손봅니다'}</div></label>`).join('')}
      </div>`)}

    ${단계(3, '어느 공간을 손보시나요?', `
      <p class="t-sub mb4">여러 개 고를 수 있어요</p>
      <div class="g3" data-space-pick>
        ${SPACES.map((s) => `<label class="box" style="text-align:center;cursor:pointer">
          ${U.ph([`${s} 사진`, 400, 300], { seed: s, cls: 'ph-card' })}
          <input type="checkbox" data-space="${s}"${고른공간.includes(s) ? ' checked' : ''} style="margin:8px 0 4px">
          <div class="t-card">${s}</div></label>`).join('')}
      </div>`)}

    ${단계(4, '마감은 어느 등급으로 볼까요?', `
      <p class="t-sub mb4">나중에 견적 결과에서도 바꿔 볼 수 있어요</p>
      <div class="g3">
        ${GRADES.map((g) => `<label class="box" style="text-align:center;cursor:pointer">
          <input type="radio" name="등급" data-field="마감 등급" value="${g.nm}"${g.nm === ESTIMATE_BASE.grade ? ' checked' : ''} style="margin-bottom:6px">
          <div class="t-card">${g.nm}</div>
          <div class="t-sub mt1">공사 ${g.days}일 · 보증 ${g.warranty}</div></label>`).join('')}
      </div>`)}

    ${단계(5, '지금 살고 계신가요?', `
      <p class="t-sub mb4">사시는 채로 하는 공사는 순서와 날수가 달라져요</p>
      <div class="g3">
        ${['거주 중', '비어 있음', '짐만 있음'].map((v, i) => `<label class="box" style="text-align:center;cursor:pointer">
          <input type="radio" name="거주" data-field="거주 여부" value="${v}"${i === 0 ? ' checked' : ''} style="margin-bottom:6px">
          <div class="t-card">${v}</div></label>`).join('')}
      </div>
      <div class="field mt6"><span class="lb">언제쯤 시작하고 싶으세요?</span>
        <select class="sel" data-field="희망 착공">${['9월', '10월', '11월', '아직 모르겠어요'].map((m) => `<option${m === ESTIMATE_BASE.startMonth ? ' selected' : ''}>${m}</option>`).join('')}</select>
      </div>`)}

    ${단계(6, '견적을 어디로 보내 드릴까요?', `
      <p class="t-sub mb4">실측 예약 때 말고는 연락드리지 않아요</p>
      <div class="field"><span class="lb">이름</span>${U.input({ ph: '김하은' })}</div>
      <div class="field"><span class="lb">연락처</span>${U.input({ ph: '010-0000-0000', type: 'tel' })}</div>
      ${U.check('공사 진행 소식을 문자로 받을게요', { on: true, none: true })}`)}

    <div class="row-b mt6">
      ${U.btn('이전', { attr: ' data-step-prev' })}
      <div class="row" style="gap:var(--sp-btn)">
        ${U.btn('나중에 이어서 하기', { sm: true, attr: ' data-toast="임시저장했어요"' })}
        ${U.btn('다음', { cls: 'btn-pri', attr: ' data-step-next' })}
        ${U.btn('견적 결과 보기', { cls: 'btn-pri', href: 'ES-02', attr: ' data-step-done hidden' })}
      </div>
    </div>`,
    U.card('지금까지 고른 조건', `
      <dl class="kv" data-answers>
        <dt>평수</dt><dd data-answer="평수">${ESTIMATE_BASE.pyeong}평</dd>
        <dt>공사 범위</dt><dd data-answer="공사 범위">${ESTIMATE_BASE.field}</dd>
        <dt>고른 공간</dt><dd><span data-space-list>${고른공간.join(', ')}</span></dd>
        <dt>마감 등급</dt><dd data-answer="마감 등급">${ESTIMATE_BASE.grade}</dd>
        <dt>거주 여부</dt><dd data-answer="거주 여부">거주 중</dd>
        <dt>희망 착공</dt><dd data-answer="희망 착공">${ESTIMATE_BASE.startMonth}</dd>
      </dl>
      <div class="row-b mt4"><span class="t-sub">예상 금액</span><span class="t-card acc" data-space-price>2,400만원 ~ 3,100만원</span></div>
    `),
  )}
</div>`,
  };
};

PAGES['ES-02'] = () => {
  /* ⚠ ESTIMATE_ITEMS·ESTIMATE_BASE 는 전부 「고급」 마감(mult 1.22) 기준값이다.
     탭으로 등급을 바꿔도 실시간으로 반영되게, mult=1.0(「기본」) 기준으로 되돌린
     data-base 를 각 칸에 심어 두고 app.js 에서 (base × 고른 mult)로 다시 계산한다. */
  const 기준등급 = GRADES.find((g) => g.nm === ESTIMATE_BASE.grade);
  const rows = ESTIMATE_ITEMS.map((it) => {
    const base = Math.round(it.amt / 기준등급.mult);
    return [
      it.nm,
      `${it.qty}${it.unit}`,
      `<span class="num" data-base="${base}">${U.won(it.amt)}</span>`,
      U.toggle(true, '', ` data-base="${base}" data-amt="${it.amt}"`),
    ];
  });
  const minBase = Math.round(ESTIMATE_BASE.min / 기준등급.mult);
  const maxBase = Math.round(ESTIMATE_BASE.max / 기준등급.mult);
  return {
    body: `${U.pageHd('견적 결과', '')}

<div class="box">
  <div class="t-page pri" data-grade-price data-min-base="${minBase}" data-max-base="${maxBase}">${U.won(ESTIMATE_BASE.min)} ~ ${U.won(ESTIMATE_BASE.max)}</div>
  <p class="t-sub mt2">방문 실측 뒤에 확정됩니다. 지금 금액은 평균값 기준이에요.</p>
</div>

${U.box(`<div class="row-b wrap-row"><div class="chips">
  ${U.chip(`${ESTIMATE_BASE.pyeong}평`)}${U.chip(ESTIMATE_BASE.field)}${U.chip(`${ESTIMATE_BASE.grade} 마감`)}${U.chip(`${ESTIMATE_BASE.startMonth} 착공`)}
</div>${U.btn('조건 고치기', { sm: true, href: 'ES-01' })}</div>`, { cls: 'mt6' })}

<section class="sec mt8" data-grade-pick>
  <div class="sec-hd"><h2 class="t-sec">마감 등급</h2></div>
  <div class="tabs-pill">${GRADES.map((g) => `<button class="tab${g.nm === ESTIMATE_BASE.grade ? ' on' : ''}" type="button" data-mult="${g.mult}" data-days="${g.days}">${g.nm}</button>`).join('')}</div>
</section>

${U.sec('공정별 항목', U.table(
      ['공정', '수량', '금액', '포함'],
      rows,
      { foot: ['합계', '', `<span class="num" data-grade-total>${U.won(견적합계)}</span>`, ''] },
    ), { cls: 'mt6', more: 'ES-03', moreLabel: '항목 상세 보기' })}

${U.sec('이건 포함되어 있지 않아요', `<ul class="stack"><li>· 가구</li><li>· 가전</li><li>· 이사비</li><li>· 입주청소(선택 시 별도)</li></ul>`, { cls: 'mt8' })}

${U.sec('돈 내는 차례', U.table(['회차', '비율', '금액'], PAY_SCHEDULE(견적합계).map((p) => [p.nm, `${p.pct}%`, `<span class="num">${U.won(p.amt)}</span>`])), { cls: 'mt8' })}

${/* ⚠ 여기 진행 막대가 0% 로 놓여 있었다. 아직 시작도 안 한 공사라 «찰 것»이 없어서,
      뜻 없는 회색 가로줄 하나만 남았다(2026-08-18 사장님 지적). 막대를 걷어내고
      대신 공정별로 며칠씩 걸리는지를 적는다 — 그게 손님이 궁금한 것이다. */''}
${U.sec('예상 공사 기간', `<div class="row-b"><span class="t-card" data-grade-days>${기준등급.days}일 (주말 제외)</span><span class="t-sub">실측 뒤 착공일을 잡습니다</span></div>
<div class="row wrap-row mt3" style="gap:var(--sp-btn)">${ESTIMATE_ITEMS.filter((it) => it.days >= 2).map((it) => U.chip(`${it.nm} ${it.days}일`)).join('')}</div>`, { cls: 'mt8' })}

${U.stickBar('', `${U.btn('항목 상세', { href: 'ES-03' })}${U.btn('견적서 저장하기', { cls: 'btn-pri', href: 'ES-04' })}`)}`,
    o: { stick: '' },
  };
};

PAGES['ES-03'] = () => ({
  body: `${U.pageHd('견적 항목 상세', `총액 ${U.won(견적합계)} · 지금 보고 계신 것: 목공 공정`)}

${U.tabBox(
    ['철거', '설비', '전기', '목공', '타일', '도배', '마루', '도장'].map((t, i) => ({ label: t, pane: t })),
    ['철거', '설비', '전기', '목공', '타일', '도배', '마루', '도장'].map((t, i) => U.pane(t, t === '목공' ? `
      ${U.detail2(
      U.table(['품명', '규격', '수량', '단가', '금액'], WOOD_DETAIL.map((d) => [d.nm, d.spec, `${d.qty}${d.unit}`, `<span class="num">${U.won(d.price)}</span>`, `<span class="num">${U.won(d.amt)}</span>`]), { foot: ['공정 합계', '', '', '', `<span class="num">${U.won(WOOD_DETAIL.reduce((n, x) => n + x.amt, 0))}</span>`] }),
      U.card('이 공정은요', `${U.kv([['걸리는 날수', '6일'], ['앞선 공정', '전기'], ['다음 공정', '타일']])}`, { aside: '' }) +
      U.box(`<p class="t-sub">목공 인건비는 지역·층수에 따라 달라집니다. 3층 이상 엘리베이터가 없으면 자재 운반비가 추가됩니다.</p>`, { cls: 'mt4' }),
    )}` : `<p class="t-sub">${t} 공정의 세부 내역입니다.</p>`, t === '목공')).join(''),
    3,
  )}

${U.box(`<div class="row-b"><span class="t-sub">회색 띠 — 전체 합계</span><span class="num t-card">${U.won(견적합계)}</span></div>`, { cls: 'mt8' })}

${U.sec('', `<div class="btns mt8">${U.btn('견적 결과로', { cls: 'btn-pri', href: 'ES-02' })}${U.btn('실측 예약', { href: 'VS-01' })}${U.btn('표 내려받기', { attr: ' data-toast="표를 내려받았어요"' })}</div>`)}`,
});

PAGES['ES-04'] = () => ({
  body: U.done('견적서를 저장했어요', '견적 번호 EST-20260817-0042',
    `${U.card('저장한 견적', `${U.kv([['조건', `${ESTIMATE_BASE.pyeong}평 · ${ESTIMATE_BASE.field} · ${ESTIMATE_BASE.grade} 마감`], ['총액', `${U.won(ESTIMATE_BASE.min)} ~ ${U.won(ESTIMATE_BASE.max)}`], ['유효기간', '2026년 9월 16일까지']])}`)}
    <div class="field mt4"><span class="lb">견적서 이름</span>${U.input({ v: '성동구 32평 전체시공' })}</div>
    <div class="btns mt4">${U.btn('PDF 내려받기', { attr: ' data-toast="PDF를 내려받았어요"' })}${U.btn('문자로 받기', { attr: ' data-toast="문자로 보냈어요" data-toast-kind="ok"' })}${U.btn('링크 복사', { attr: ' data-toast="링크를 복사했어요"' })}</div>
    ${U.banner('info', 'ℹ', '이 견적은 30일 동안 유효해요. 자재 값과 인건비가 오르면 금액이 달라질 수 있어서예요.', { cls: 'mt6' })}`,
    `${U.card('다음엔 이렇게 해 보세요', `<div class="stack">
      <a class="box" href="${U.link('VS-01')}"><div class="t-card">방문 실측 예약하기</div><div class="t-sub mt1">실측을 해야 금액이 확정돼요</div></a>
      <a class="box" href="${U.link('CS-04')}"><div class="t-card">자재 미리 골라두기</div><div class="t-sub mt1">고른 자재만큼 금액이 달라져요</div></a>
      <a class="box" href="${U.link('CS-01')}"><div class="t-card">비슷한 사례 더 보기</div><div class="t-sub mt1">같은 평수 시공 사진을 봅니다</div></a>
    </div>
    ${/* ⚠ 「내 견적 목록 보기」가 ES-05(견적 견주기)로 가고 있었다 — 목록이 아니라
          «두 개를 견주는» 화면이다. 저장한 견적 목록은 AU-04(내 정보) 안에 있다
          (2026-08-18 사장님 지적). */''}
    <div class="btns mt4"><a class="more" href="${U.link('AU-04')}">내 견적 목록 보기 ›</a></div>`)}`,
  ),
});

PAGES['ES-05'] = () => ({
  body: `${U.pageHd('견적 견주기', '')}

${U.sec('내 견적', `<div class="g3">
  <label class="box" style="cursor:pointer"><input type="checkbox" checked style="margin-bottom:6px"><div class="t-card">성동구 32평 · 고급 마감</div><div class="t-sub">3,240만~3,980만</div></label>
  <label class="box" style="cursor:pointer"><input type="checkbox" checked style="margin-bottom:6px"><div class="t-card">성동구 32평 · 기본 마감</div><div class="t-sub">2,580만~3,340만</div></label>
  <label class="box" style="cursor:pointer;opacity:.5"><input type="checkbox" disabled style="margin-bottom:6px"><div class="t-card">최대 두 개까지 비교돼요</div></label>
</div>`)}

<div class="box mt6"><div class="t-page pri">고급 마감이 650만원 더 듭니다</div></div>

${U.sec('', `<div class="g2 mt6">
  ${U.card('견적 A · 고급 마감', U.table(['항목', '금액'], [['총액', '3,610만원'], ['공사 기간', '22일'], ['목공', `<span class="num">${U.won(WOOD_DETAIL.reduce((n, x) => n + x.amt, 0))}</span>`]]))}
  ${U.card('견적 B · 기본 마감', U.table(['항목', '금액'], [['총액', `<span style="background:var(--acc-12)">2,960만원</span>`], ['공사 기간', `<span style="background:var(--acc-12)">18일</span>`], ['목공', `<span class="num">6,200,000원</span>`]]))}
</div>`)}

${U.chips(['다른 것만 보기'], -1)}

${U.sec('', `<p class="t-sub mt4">A 는 마루·타일 등급이 한 칸 높고, B 는 기간이 4일 짧습니다.</p>`)}

${U.sec('', `<div class="g2">${U.btn('이 견적으로 실측 예약', { cls: 'btn-pri', w: true, href: 'VS-01' })}${U.btn('이 견적으로 실측 예약', { cls: 'btn-pri', w: true, href: 'VS-01' })}</div>`, { cls: 'mt4' })}`,
});
