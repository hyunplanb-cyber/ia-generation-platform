/* HO 홈 (3) */
import * as U from './ui.mjs';
import { SITE, FIELDS, CASES, PYEONG_COST, GRADES, COST_RATIO, REVIEWS, FAQ_HOME } from './data.mjs';

export const PAGES = {};

const hero = (h1, lead, pyeongRow) => `<section class="hero"><div class="hero-ph">${U.ph(['준공 대표 사진', 1600, 700], { seed: 'hero-main' })}</div>
  <div class="hero-in">
    <h1>${h1}</h1>
    <p class="lead">${lead}</p>
    ${pyeongRow || ''}
  </div></section>`;

PAGES['HO-01'] = () => {
  /* 처음부터 골라져 있는 칸(30평대)도 «고른 것»이다 — 손님이 칩을 건드리지 않고
     바로 「1분 예상 견적」을 눌러도 그 평수가 견적 1단계에 들어가 있어야 한다.
     그래서 링크에 처음부터 실어 둔다. 칩을 누르면 app.js 가 이 링크를 고쳐 쓴다. */
  const 기본칩 = PYEONG_COST.find((p) => p.key === '30');
  const 견적링크 = `ES-01.html?pyeong=${기본칩.대표평}&band=${encodeURIComponent(기본칩.label)}`;
  return {
  o: { hero: hero('필요한 만큼, 원하는 대로 고쳐드립니다', '아파트 리모델링부터 상가 인테리어까지. 견적부터 준공·하자보수까지 한 곳에서 확인하세요.',
    /* 칩마다 «대표 평수»를 실어 둔다. 여기서 고른 값은 견적 마법사 1단계(평수)에
       미리 채워 넣을 뿐, 단계를 건너뛰지는 않는다 — 건너뛰면 손님은 자기가 뭘
       고른 줄도 모르고 중간 단계부터 보게 된다(2026-08-17 사장님 지적). */
    `<div class="pyeong-row">
      <span class="lb">우리 집 평수</span>
      <div class="chips">${PYEONG_COST.map((p) => `<button class="chip${p.key === '30' ? ' on' : ''}" type="button" data-min="${p.min}" data-max="${p.max}" data-pyeong="${p.대표평}" data-label="${p.label}">${p.label}</button>`).join('')}</div>
      <span class="pyeong-val">30평대 아파트 전체 시공 평균 <b>3,200만원 ~ 4,600만원</b></span>
      <a class="btn btn-pri" href="${견적링크}" data-pyeong-go>1분 예상 견적</a>
    </div>`) },
  body: `${U.sec('시공 분야를 골라 보세요', `<div class="g6">${FIELDS.map((f) => `<a class="box" style="text-align:center" href="${U.link('HO-02')}">
    <div style="font-size:26px">${f.ico}</div>
    <div class="strong mt2">${f.nm}</div></a>`).join('')}</div>`)}

${U.sec('최근 시공 사례', `<div class="cards">${CASES.slice(0, 3).map((c) => U.caseCard(c)).join('')}</div>`, { more: 'CS-01', moreLabel: '전체 보기' })}

${U.sec('공사가 어떻게 굴러가나요', `<div class="g5">
  ${[['①', '상담', '2일'], ['②', '방문 실측', '1일'], ['③', '계약', '2일'], ['④', '시공', '20~25일'], ['⑤', '준공', '1일']]
    .map(([n, t, d]) => `<div class="box"><div class="t-sec pri">${n}</div>
      <div class="t-card mt2">${t}</div><p class="t-sub mt2">${d}</p></div>`).join('')}
</div>`)}

${U.sec('우리 업체는', `<div class="g3">
  <div class="box"><div class="t-page pri">312<span style="font-size:15px">건</span></div><div class="t-sub mt2">누적 시공 현장 수</div></div>
  <div class="box"><div class="t-page pri">21<span style="font-size:15px">일</span></div><div class="t-sub mt2">평균 공사 기간(30평대 전체)</div></div>
  <div class="box"><div class="t-page pri">2<span style="font-size:15px">일</span></div><div class="t-sub mt2">하자보수 접수 후 방문까지</div></div>
</div>`)}

${U.sec('쓰는 자재·마감 브랜드', `<div class="row wrap-row" style="gap:var(--sp-block);opacity:.7">
  ${['한샘', 'LX하우시스', '동화자연마루', '삼성쉐르빌', 'KCC'].map((b) => `<div class="t-card">${b}</div>`).join('')}
</div>`)}

${U.sec('시공하신 분들 이야기', `<div class="g4">${REVIEWS.map((r) => `<div class="box">
  <p>${r.t}</p>
  <p class="t-sub mt3">${r.nm} · ${r.at}</p></div>`).join('')}</div>`)}

${U.sec('자주 묻는 질문', U.accordion(FAQ_HOME, 0))}

${U.sec('', `${U.box(`<div class="row-b wrap-row" style="gap:var(--sp-block)">
  <div><h3 class="t-sec">우리 집은 얼마나 나올까요?</h3><p class="t-sub mt2">1분이면 평수·마감 등급별 예상 견적을 볼 수 있어요.</p></div>
  <a class="btn btn-pri btn-lg" href="${견적링크}" data-pyeong-go>예상 견적 내기</a>
</div>`)}`)}`,
  };
};

PAGES['HO-02'] = () => {
  const field = FIELDS[2]; // 욕실 예시
  return {
    body: `${U.pageHd(`${field.nm} 시공`, '전체 교체부터 부분 보수까지, 이 분야만 모아 보여드려요.')}

${U.tabBox(
    [{ label: '전체 교체', pane: 'full' }, { label: '부분 보수', pane: 'part' }],
    `${U.pane('full', `<p class="t-sub">타일·방수·수전·도기까지 전체를 새로 시공합니다. 평균 5~9일 걸립니다.</p>`, true)}
     ${U.pane('part', `<p class="t-sub">타일 부분 교체, 수전만 교체 등 필요한 부분만 시공합니다. 평균 1~3일 걸립니다.</p>`)}`,
    0,
  )}

${U.sec('마감 등급별 비교', U.table(
    ['등급', '평당 단가', '쓰는 자재', '걸리는 날수', '보증 기간'],
    GRADES.map((g) => [g.nm, `<span class="num">${U.won(Math.round(28_000 * g.mult))}</span>`, g.key === 'base' ? '국산 표준' : g.key === 'high' ? '수입 타일·도기' : '수입 프리미엄 브랜드', `${g.days - 15}일`, g.warranty]),
  ), { cls: 'mt8' })}

${U.sec('이 분야 시공 사례', `<div class="cards">${CASES.filter((c) => c.field === 'bath').concat(CASES.slice(0, 2)).slice(0, 3).map((c) => U.caseCard(c)).join('')}</div>`, { cls: 'mt8' })}

${U.sec('이 공사에서 자주 놓치는 것', `<div class="g3">
  ${U.box(`<div class="t-card">방수 두 번 치기</div><p class="t-sub mt2">한 번만 치면 3~5년 뒤 누수로 이어질 수 있습니다.</p>`)}
  ${U.box(`<div class="t-card">배관 구배</div><p class="t-sub mt2">경사가 안 맞으면 물이 안 빠지고 고입니다.</p>`)}
  ${U.box(`<div class="t-card">환기</div><p class="t-sub mt2">환풍기 용량이 작으면 곰팡이가 생기기 쉽습니다.</p>`)}
</div>`, { cls: 'mt8' })}

${U.sec('공정 순서', U.table(['공정', '걸리는 날수'], [['철거', '1일'], ['방수', '2일'], ['타일', '2일'], ['도기·수전', '1일']], { foot: ['합계', '6일'] }), { cls: 'mt8' })}

${U.sec('이 분야 자주 묻는 질문', U.accordion([
      { q: '방수는 몇 번 치나요?', a: '기본 2회, 프리미엄 마감은 3회 시공합니다.' },
      { q: '타일 줄눈 색은 고를 수 있나요?', a: '네, 계약 후 자재 확정 단계에서 색상표를 보고 고르실 수 있습니다.' },
      { q: '욕실 2개를 동시에 하면 더 빠른가요?', a: '팀을 나눠 진행하면 순차 시공보다 2~3일 단축됩니다.' },
      { q: '변기·세면대 교체도 포함인가요?', a: '전체 교체 등급에는 기본 포함, 부분 보수는 별도 협의합니다.' },
    ], 0), { cls: 'mt8' })}

${U.box(`<div class="row-b wrap-row"><span class="t-card">이 분야로 견적 내볼까요?</span>${U.btn('예상 견적 내기', { cls: 'btn-pri', href: 'ES-01' })}</div>`, { cls: 'mt8' })}`,
  };
};

PAGES['HO-03'] = () => ({
  body: `${U.pageHd('비용 안내', '값을 숨기지 않습니다')}

${U.box(`<div class="row-b wrap-row" style="gap:var(--sp-block)">
  <div class="row" style="gap:var(--sp-btn)">${U.chips(['10평대', '20평대', '30평대', '40평대 이상'], 2)}</div>
  <div class="row" style="gap:var(--sp-btn)">${U.chips(['전체 시공', '부분 시공'], 0)}</div>
</div>`)}

${U.sec('총액 범위', `<div class="box">
  <div class="row-b"><span class="t-card">30평대 · 전체 시공</span><span class="t-page pri">${U.won(PYEONG_COST[2].min)} ~ ${U.won(PYEONG_COST[2].max)}</span></div>
  <div class="mt4" style="height:14px;border-radius:999px;background:var(--pri-10);position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;left:22%;right:18%;background:var(--primary)"></div>
  </div>
  <p class="t-sub mt3">무엇이 이 폭을 만드나 — ① 마감 등급(기본~프리미엄) ② 배관·전기 노후 정도 ③ 층수·엘리베이터 유무</p>
</div>`, { cls: 'mt8' })}

${U.sec('공정별 비용 비중', `${U.table(['공정', '비중', ''], COST_RATIO.map(([nm, pct]) => [nm, `${pct}%`, { t: `<div style="height:8px;border-radius:999px;background:var(--border);overflow:hidden;width:120px"><div style="height:100%;width:${pct * 4}%;background:var(--primary)"></div></div>`, cls: '' }]))}`, { cls: 'mt8' })}

${U.sec('마감 등급별 차이', U.table(
    ['등급', '평당 단가(전체 시공 기준)', '보증 기간'],
    GRADES.map((g) => [g.nm, `<span class="num">${U.won(Math.round(1_050_000 * g.mult))}</span>`, g.warranty]),
  ), { cls: 'mt8' })}

${U.sec('이런 비용이 더 붙을 수 있어요', `<ul class="stack">
  <li>· 폐기물 처리 — 규모에 따라 30~80만원</li>
  <li>· 엘리베이터 사용료 — 관리사무소 규정에 따라 10~30만원</li>
  <li>· 야간·주말 작업 — 상업공간은 협의 후 할증</li>
  <li>· 철거 중 누수·배관 노후 발견 시 — 배관 교체 추가 견적</li>
</ul>`, { cls: 'mt8' })}

${U.sec('돈 내는 차례', U.steps([['계약금 10%'], ['착공금 30%'], ['중도금 40%'], ['잔금 20%']], 1), { cls: 'mt8' })}

${U.sec('다른 곳 견적과 견줄 때 이것만은 보세요', `<ul class="stack">
  <li>· 철거 범위와 폐기물 처리비가 포함됐는지</li>
  <li>· 방수 횟수가 명시돼 있는지</li>
  <li>· 자재 브랜드·등급이 구체적으로 적혀 있는지</li>
  <li>· 공사 기간과 지체상금 조항이 있는지</li>
  <li>· 하자보수 기간이 얼마인지</li>
</ul>`, { cls: 'mt8' })}

${U.box(`<div class="row-b wrap-row"><span class="t-card">견적서 예시가 궁금하신가요?</span>${U.btn('견적서 예시 보기', { cls: 'btn-pri', href: 'ES-02' })}</div>`, { cls: 'mt8' })}`,
});
