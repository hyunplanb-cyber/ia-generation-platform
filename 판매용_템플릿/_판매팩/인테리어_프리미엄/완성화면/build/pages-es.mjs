/* ES 견적 — 부모 화면 5장. 이 팩의 첫 번째 알맹이(계산되어 나오는 견적). */
import * as U from './ui.mjs';
import { FLAGSHIP, PROCESS, won } from './data.mjs';

/* 공정별 항목표 — es2·es3·es5가 모두 같은 숫자를 쓴다.
   합계가 반드시 FLAGSHIP.totalFirst(처음 견적, 실측 전 평균값 기준)와 같아야 한다 —
   ES0201 화면이 "지금 금액은 평균값 기준" 총액과 이 표를 나란히 보여주기 때문이다
   (레이아웃견본_발견기록.md 지뢰 2 — 문구와 표가 손으로 두 곳에 적히면 반드시 갈라진다). */
const ITEM_AMOUNTS = { '철거·폐기물': 2_600_000, '설비·배관': 3_700_000, '전기·조명': 2_800_000, '목공': 8_900_000, '타일': 5_400_000, '도배': 2_900_000, '마루': 3_800_000, '도장': 1_400_000, '청소': 900_000 };
const ITEM_TOTAL = Object.values(ITEM_AMOUNTS).reduce((a, b) => a + b, 0); // = 32,400,000 = FLAGSHIP.totalFirst
if (ITEM_TOTAL !== FLAGSHIP.totalFirst) {
  throw new Error(`ES 항목표 합계(${ITEM_TOTAL})가 FLAGSHIP.totalFirst(${FLAGSHIP.totalFirst})와 다릅니다 — 화면과 표가 갈라집니다`);
}

/* 6단계 중 3번째(공간만 고른 상태)에서 보여줄 «중간» 미리보기.
   ⚠ FLAGSHIP.totalFirst~total(32,400,000~34,100,000)을 그대로 쓰면 안 된다 —
   그건 평수·마감등급까지 다 정한 «확정 견적»이다. 아직 3단계인데 최종 확정액이
   먼저 보이면 "고를 때마다 바뀐다"는 말이 거짓이 된다(디럭스 ES-01의
   2,400만~3,100만과 같은 자리 — 같은 값을 그대로 따른다). */
const PARTIAL_PREVIEW = { low: 24_000_000, high: 31_000_000 };

/* ---------------- ES0101 견적 조건 입력 - 단계별 ----------------
   ⚠ 예전에는 «3단계 한 장면»만 그려 두고 막대에 「6단계 중 3번째」라고만 적었다.
     나머지 다섯 단계가 어디에도 없어 앞으로도 뒤로도 못 갔다(2026-08-17 사장님 지적,
     디럭스 ES-01 을 먼저 고쳤고 프리미엄이 늦게 따라온다).
   ⚠ 차례도 바뀌었다 — 1단계 «평수», 2단계 «공사 범위». 홈 히어로에서 평수를 고르고
     들어오는데 공사 범위부터 물으면 방금 고른 것이 어디 갔나 싶다.
   ⚠ 막대는 «끝낸 만큼»만 채운다. 4단계에 서 있으면 3칸이다. */
function ES0101() {
  const SPACES = ['거실', '주방', '욕실', '침실', '베란다', '현관'];
  const 고른공간 = SPACES.slice(0, 3);
  const STEPS = ['평수', '공사 범위', '공간', '마감 등급', '거주 여부', '연락처'];
  const GRADES = [['기본', 20, '1년'], ['고급', 22, '2년'], ['프리미엄', 25, '3년']];

  const 단계막대 = `<div class="steps">${STEPS.map((s, i) =>
    `<span class="s ${i === 0 ? 'on' : ''}" data-step-dot="${i + 1}" style="cursor:pointer"><span class="n">${i + 1}</span>${s}</span>${i < STEPS.length - 1 ? '<span class="sep">›</span>' : ''}`).join('')}</div>`;

  const 단계 = (n, title, inner) => `<div data-step="${n}"${n === 1 ? '' : ' hidden'}>${U.card(title, inner)}</div>`;

  const body = `
<div data-wizard data-step-now="1" data-step-total="6">
${U.progress ? U.progress(0) : '<div class="progress"><div class="fill" style="width:0%"></div></div>'}
<p class="t-sub mt2 mb4"><span data-step-label>6단계 중 1번째</span> · 대략 2분이면 끝나요</p>
${단계막대}

<div class="split-r">
  <div>
    ${단계(1, '평수가 어떻게 되시나요?', `
      <p class="t-sub mb4">등기부나 관리비 고지서에 적힌 «공급면적» 기준이면 돼요</p>
      ${U.banner('info', 'ℹ', '홈에서 <b data-from-home-label>30평대</b><span data-from-home-josa>를</span> 고르고 오셨어요. 정확한 평수로 고쳐 주세요.', { attr: ' data-from-home hidden' })}
      <div class="field mt3"><span class="lb">평수</span>
        <div class="row"><input class="input" type="number" data-pyeong value="32" min="5" max="200" style="max-width:120px">
        <span class="t-sub">평 = <b data-pyeong-m2>105.8㎡</b></span></div>
      </div>`)}

    ${단계(2, '어디를 손보시나요?', `
      <p class="t-sub mb4">하나만 골라 주세요</p>
      <div class="g2">${['전체 시공', '부분 시공'].map((v, i) => `<label class="radio" style="height:72px">
        <input type="radio" name="범위" data-field="공사 범위" value="${v}" ${i === 0 ? 'checked' : ''}>${v}</label>`).join('')}</div>`)}

    ${단계(3, '어느 공간을 손보시나요?', `
      <p class="t-sub mb4">여러 개 고를 수 있어요</p>
      <div class="g3" data-space-pick>${SPACES.map((s) => `<label class="radio" style="height:64px">
        <input type="checkbox" data-space="${s}" ${고른공간.includes(s) ? 'checked' : ''}>${s}</label>`).join('')}</div>`)}

    ${단계(4, '마감은 어느 등급으로 볼까요?', `
      <p class="t-sub mb4">나중에 견적 결과에서도 바꿔 볼 수 있어요</p>
      <div class="g3">${GRADES.map(([nm, d, w], i) => `<label class="radio" style="height:84px">
        <input type="radio" name="등급" data-field="마감 등급" value="${nm}" ${i === 1 ? 'checked' : ''}>${nm}
        <span class="t-sub" style="display:block">공사 ${d}일 · 보증 ${w}</span></label>`).join('')}</div>`)}

    ${단계(5, '지금 살고 계신가요?', `
      <p class="t-sub mb4">사시는 채로 하는 공사는 순서와 날수가 달라져요</p>
      <div class="g3">${['거주 중', '비어 있음', '짐만 있음'].map((v, i) => `<label class="radio" style="height:64px">
        <input type="radio" name="거주" data-field="거주 여부" value="${v}" ${i === 0 ? 'checked' : ''}>${v}</label>`).join('')}</div>
      <div class="field mt5"><span class="lb">언제쯤 시작하고 싶으세요?</span>
        <select class="input" data-field="희망 착공">${['9월', '10월', '11월', '아직 모르겠어요'].map((m, i) => `<option${i === 0 ? ' selected' : ''}>${m}</option>`).join('')}</select>
      </div>`)}

    ${단계(6, '견적을 어디로 보내 드릴까요?', `
      <p class="t-sub mb4">실측 예약 때 말고는 연락드리지 않아요</p>
      <div class="field"><span class="lb">이름</span><input class="input" placeholder="김하은"></div>
      <div class="field"><span class="lb">연락처</span><input class="input" type="tel" placeholder="010-0000-0000"></div>`)}

    <div class="btns mt6 row-b">
      ${U.btn('이전', { cls: 'btn-ghost', attr: ' data-step-prev' })}
      <span class="row" style="gap:8px">
        ${U.btn('나중에 이어서 하기', { cls: 'btn-ghost btn-sm', attr: ' data-toast="임시저장했어요"' })}
        ${U.btn('다음', { cls: 'btn-primary', attr: ' data-step-next' })}
        ${U.btn('견적 결과 보기', { href: 'ES0201', cls: 'btn-primary', attr: ' data-step-done hidden' })}
      </span>
    </div>
  </div>

  <div class="sticky">
    ${U.card('지금까지 고른 조건', `
      <dl class="kv">
        <dt>평수</dt><dd data-answer="평수">32평</dd>
        <dt>공사 범위</dt><dd data-answer="공사 범위">전체 시공</dd>
        <dt>고른 공간</dt><dd><span data-space-list>${고른공간.join(', ')}</span></dd>
        <dt>마감 등급</dt><dd data-answer="마감 등급">고급</dd>
        <dt>거주 여부</dt><dd data-answer="거주 여부">거주 중</dd>
        <dt>희망 착공</dt><dd data-answer="희망 착공">9월</dd>
      </dl>
      <div class="row-b mt4"><span class="t-sub">예상 금액</span>
        <span class="t-card" data-space-price>${won(PARTIAL_PREVIEW.low)} ~ ${won(PARTIAL_PREVIEW.high)}</span></div>
      <p class="t-sub mt2">고를 때마다 이 숫자가 바로 바뀌어요</p>`)}
  </div>
</div>
</div>`;
  return { body, o: {} };
}

/* ---------------- ES0201 견적 결과 ---------------- */
function ES0201() {
  const rows = PROCESS.map((p) => {
    const 기준 = Math.round(ITEM_AMOUNTS[p.key] / 1.22);
    return [p.key, '1식',
      `<span data-base="${기준}">${won(ITEM_AMOUNTS[p.key])}</span>`,
      `<span data-base="${기준}">${won(ITEM_AMOUNTS[p.key])}</span>`,
      `<label class="check"><input type="checkbox" data-base="${기준}" data-amt="${ITEM_AMOUNTS[p.key]}" checked></label>`];
  });
  const body = `
${U.sec('', `<div class="card"><div class="card-bd">
  <div class="t-page" style="font-size:30px" data-grade-price data-min-base="${Math.round(FLAGSHIP.totalFirst/1.22)}" data-max-base="${Math.round(FLAGSHIP.total/1.22)}">${won(FLAGSHIP.totalFirst)} ~ ${won(FLAGSHIP.total)}</div>
  <p class="t-sub mt1">방문 실측 뒤에 확정됩니다. 지금 금액은 평균값 기준이에요.</p>
  <div class="chips mt4">${U.chips(['32평', '전체 시공', '고급 마감', '9월 착공'], [0, 1, 2, 3], {})}${U.btn('조건 고치기', { cls: 'btn-ghost btn-sm', href: 'ES0101' })}</div>
</div></div>`)}

${/* ⚠ 탭이 색만 바뀌고 금액은 그대로였다(2026-08-18). 스펙팩 acts 는 「총액과 아래
      항목표 금액이 그 등급 값으로 다시 계산된다」고 약속해 두었다. 디럭스 ES-02 와
      같은 자리·같은 셈법 — 기본 1.0 · 고급 1.22 · 프리미엄 1.48. */''}
${U.sec('마감 등급', `<div class="tabs-pill" data-grade-pick>${[['기본',1,20],['고급',1.22,22],['프리미엄',1.48,25]].map(([nm,m,d],i)=>
  `<button class="tab${i===1?' on':''}" type="button" data-mult="${m}" data-days="${d}">${nm}</button>`).join('')}</div>`)}

${U.sec('공정별 항목', U.table(['공정', '수량', '단가', '금액', '포함'], rows, { foot: ['합계', '', '', `<span data-grade-total>${won(ITEM_TOTAL)}</span>`, ''] }))}

${U.sec('이건 포함되어 있지 않아요', `<ul class="list-plain">${['가구', '가전', '이사비', '입주청소'].map((t) => `<li>· ${t}</li>`).join('')}</ul>`)}

${U.sec('돈 내는 차례', U.table(['회차', '비율', '금액'], FLAGSHIP.billing.map((b) => [b[0], `${Math.round(b[1] * 100)}%`, won(b[2])])))}

${U.sec('예상 공사 기간', `<div class="row-c"><b style="font-size:18px" data-grade-days>${FLAGSHIP.days}일</b><span class="t-sub">(주말 제외)</span></div>${U.bar(60)}`)}

<div class="card box-pri mt6"><div class="card-bd row-b wrap-row">
  <div>${U.btn('항목 상세 보기', { href: 'ES0301', cls: 'btn-ghost' })}</div>
  <div class="btns">${U.btn('견적서 저장하기', { href: 'ES0401', cls: 'btn-soft' })}${U.btn('이 견적으로 실측 예약', { href: 'VS0101', cls: 'btn-primary btn-lg' })}</div>
</div></div>`;
  return { body, o: {} };
}

/* ---------------- ES0301 견적 항목 상세 ---------------- */
function ES0301() {
  const detailRows = {
    '철거·폐기물': [['거실·주방 철거', '1식', 1, '식', won(1_600_000), won(1_600_000)], ['폐기물 처리', '5톤', 1, '식', won(1_000_000), won(1_000_000)]],
    /* 행 금액의 합이 반드시 공정 합계(ITEM_AMOUNTS)와 같아야 한다 — 손으로 두 곳에 적으면 갈라진다
       (레이아웃견본_발견기록.md 지뢰 2). 1,440,000 + 2,360,000 + 5,100,000 = 8,900,000 로 맞춘다. */
    '목공': [['걸레받이·몰딩', '32', '평', 1, won(45_000), won(1_440_000)], ['붙박이장', '2', '조', 1, won(1_180_000), won(2_360_000)], ['목공 인건비', '6', '일', 1, won(850_000), won(5_100_000)]],
  };
  const tabList = PROCESS.map((p, i) => ({ label: p.key, pane: p.key }));
  const panes = PROCESS.map((p, i) => {
    /* 자재비(55%)를 먼저 반올림하고, 인건비는 «나머지»로 계산해 둘의 합이 항상
       공정 합계와 정확히 같게 만든다 — 각자 반올림하면 1원 단위로 어긋날 수 있다. */
    const materialAmt = Math.round(ITEM_AMOUNTS[p.key] * 0.55);
    const laborAmt = ITEM_AMOUNTS[p.key] - materialAmt;
    /* 단가 열과 금액 열이 곱셈으로 어긋나지 않도록, 개수는 항상 1로 두고
       단가=금액을 그대로 쓴다(며칠 걸리는지는 옆 「이 공정은요」 카드에 따로 적는다). */
    const rows = detailRows[p.key] || [[p.key + ' 자재', '1', '식', 1, won(materialAmt), won(materialAmt)], [p.key + ` 인건비(${p.days}일)`, '1', '식', 1, won(laborAmt), won(laborAmt)]];
    return U.pane(p.key, `
      ${U.table(['품명', '수량', '단위', '개수', '단가', '금액'], rows, { foot: ['공정 합계', '', '', '', '', won(ITEM_AMOUNTS[p.key])] })}
      <div class="split-r mt4">
        <div>${U.banner('mut', '💬', `<b>왜 이 값인가</b><div class="t-sub mt1">${p.key} 인건비는 지역·층수(엘리베이터 유무)에 따라 달라집니다. 이 현장은 3층·엘리베이터 있음 기준입니다.</div>`)}</div>
        <div>${U.card('이 공정은요', U.kv([['걸리는 날수', `${p.days}일`], ['담당 팀', p.team]]))}</div>
      </div>`, i === 3);
  }).join('');
  const body = `
${U.pageHd('견적 항목 상세', `총액 ${won(ITEM_TOTAL)} · 지금 보고 계신 것: 목공 공정`)}
${U.tabBox(U.tabs(tabList, 3), panes)}
<div class="row-b mt6"><span></span><div class="btns">${U.btn('표 내려받기', { cls: 'btn-ghost' })}${U.btn('견적 결과로', { href: 'ES0201', cls: 'btn-primary' })}</div></div>`;
  return { body, o: {} };
}

/* ---------------- ES0401 견적 저장 완료 ---------------- */
function ES0401() {
  const body = U.result('ok', '✓', '견적서를 저장했어요', '견적 번호 EST-20260817-0042')
    + U.sec('', U.card('', `
      ${U.kv([['조건', '32평 · 전체 시공 · 고급 마감'], ['총액', `${won(FLAGSHIP.totalFirst)} ~ ${won(FLAGSHIP.total)}`], ['유효기간', '2026년 9월 16일까지']])}
      <div class="field mt4"><label class="lb">견적서 이름</label><input class="input" value="성동구 32평 전체시공"></div>
      <div class="btns mt4">${U.btn('PDF 내려받기', { cls: 'btn-ghost' })}${U.btn('문자로 받기', { cls: 'btn-ghost', attr: ' data-toast="문자로 보냈어요"' })}${U.btn('링크 복사', { cls: 'btn-ghost', attr: ' data-toast="링크를 복사했어요"' })}</div>`))
    + U.sec('', U.banner('warn', '⏰', '이 견적은 30일 동안 유효해요. 자재 값과 인건비가 오르면 금액이 달라질 수 있어서예요.'))
    + U.sec('이제 뭘 하면 되나요?', `<div class="g3">${[
      ['방문 실측 예약하기', 'VS0101'], ['자재 미리 골라두기', 'CS0401'], ['비슷한 사례 더 보기', 'CS0101'],
    ].map(([t, href]) => `<a class="box center" href="${U.link(href)}"><b>${t}</b></a>`).join('')}</div>`)
    + `<div class="center mt6">${U.btn('내 견적 목록 보기', { href: 'ES0501', cls: 'btn-ghost' })}</div>`;
  return { body, o: {} };
}

/* ---------------- ES0501 견적 견주기 ---------------- */
function ES0501() {
  /* B(프리미엄) 공정별 금액을 먼저 만들고, 총액은 그 합으로 «계산해서» 쓴다.
     헤드라인 문구도 이 값에서 뺄셈하므로 표와 절대 갈라지지 않는다(지뢰 2). */
  const B_AMOUNTS = Object.fromEntries(PROCESS.map((p) => [p.key, Math.round(ITEM_AMOUNTS[p.key] * 1.18)]));
  const A_total = ITEM_TOTAL;
  const B_total = Object.values(B_AMOUNTS).reduce((a, b) => a + b, 0);
  const rows = [
    ['총액', won(A_total), won(B_total), true],
    ['마감 등급', '고급', '프리미엄', true],
    ['공사 기간', `${FLAGSHIP.days}일`, `${FLAGSHIP.days + 4}일`, true],
    ...PROCESS.map((p) => [p.key, won(ITEM_AMOUNTS[p.key]), won(B_AMOUNTS[p.key]), true]),
    ['포함 안 된 것', '가구·가전·이사비', '가구·가전·이사비', false],
  ];
  const body = `
${U.pageHd('견적 견주기', '저장한 견적 중 두 개를 골라 나란히 비교합니다')}

${U.sec('', `<div class="t-page" style="font-size:24px">고급 마감이 <span class="pri">${won(B_total - A_total)}</span> 더 듭니다</div>`)}

${U.sec('', U.table(['항목', '견적 A (고급)', '견적 B (프리미엄)'],
    rows.map(([k, a, b, diff]) => [{ t: k, cls: 'strong' }, { t: a, cls: diff ? 'b-pri-cell' : '' }, { t: b, cls: diff ? 'b-pri-cell' : '' }])))}

<div class="row-b mt2">${U.btn('다른 것만 보기', { cls: 'btn-ghost btn-sm' })}<span class="t-sub">값이 다른 줄은 배경이 옅게 칠해집니다</span></div>

${U.sec('', U.banner('mut', 'ℹ️', 'A 는 기간이 4일 짧고, B 는 마루·타일 등급이 한 칸 높아요.'))}

<div class="g2 mt6">
  <div class="center">${U.btn('A 견적으로 실측 예약', { href: 'VS0101', cls: 'btn-primary btn-block' })}</div>
  <div class="center">${U.btn('B 견적으로 실측 예약', { href: 'VS0101', cls: 'btn-ghost btn-block' })}</div>
</div>`;
  return { body, o: {} };
}

export const PAGES = { ES0101, ES0201, ES0301, ES0401, ES0501 };
