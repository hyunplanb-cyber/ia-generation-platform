/* HO 홈 — 부모 화면 3장 */
import * as U from './ui.mjs';
import { FIELDS, CASES, FAQ, REVIEWS, FLAGSHIP } from './data.mjs';

/* ---------------- HO0101 홈 ---------------- */
function HO0101() {
  const body = `
${U.sec('', `<div class="card box-pri"><div class="card-bd">
  ${U.ph('준공 사진 · 히어로', 'ph-banner', 'hero1')}
  <div class="mt6"><h1 class="t-page">우리 집은 얼마나 나올까요?</h1>
  <p class="t-sub mt2">평수와 마감 등급만 넣으면 1분 안에 예상 견적이 나옵니다.</p>
  <div class="btns mt-block">${U.btn('1분 예상 견적', { href: 'ES0101', cls: 'btn-primary btn-lg', attr: ' data-band-go' })}${U.btn('시공사례 보기', { href: 'CS0101', cls: 'btn-ghost btn-lg' })}</div>
  </div></div></div>`)}

${/* 평수 칩 — app.js 의 평수구간() 이 data-band-* 를 읽어 아래 숫자를 다시 쓰고,
      견적으로 가는 손잡이(data-band-go)에 고른 평수를 실어 준다. */''}
${(() => {
  const 구간 = [['10평대', 15, '1,500만원 ~ 2,200만원'], ['20평대', 25, '2,400만원 ~ 3,500만원'],
               ['30평대', 32, '3,200만원 ~ 4,600만원'], ['40평대 이상', 45, '4,300만원 ~ 6,200만원']];
  const 처음 = 2;
  const 칩 = 구간.map(([이름, 평, 값], i) =>
    `<button class="chip${i === 처음 ? ' on' : ''}" type="button" data-band="${이름}" data-band-pyeong="${평}" data-band-price="${값}" data-toast="그 평수 기준으로 다시 계산했어요">${이름}</button>`).join('');
  return U.sec('평수별 예상 비용', `
  <div class="chips" data-band-pick>${칩}</div>
  <div class="box mt4"><b><span data-band-name>${구간[처음][0]}</span> 아파트 전체 시공</b> 평균 <b class="pri" data-band-price-out>${구간[처음][2]}</b></div>`);
})()}

${U.sec('무엇을 고치시겠어요?', `<div class="g3">${FIELDS.map((f) => `<a class="box center" href="${U.link('ES0101')}" data-band-go>
  <div style="font-size:28px">${f.ic}</div><div class="t-card mt2">${f.key}</div></a>`).join('')}</div>`, { more: 'CS0101', moreLabel: '시공사례 둘러보기' })}

${U.sec('최근 시공 사례', `<div class="g3">${CASES.slice(0, 3).map((c) => `<a class="ccard" href="${U.link('CS0201')}">
  ${U.ph('비포·애프터', 'ph-43', c.id)}
  <div class="nm">${U.esc(c.title)}</div>
  <div class="meta">${c.area}평 · ${U.esc(c.region)} · ${c.days}일</div>
  <div class="price"><span class="now">${c.priceLabel}</span></div></a>`).join('')}</div>`, { more: 'CS0101' })}

${U.sec('공사가 어떻게 굴러가나요', `<div class="g5">${[
    ['1', '상담', '2일'], ['2', '방문 실측', '1일'], ['3', '계약', '3일'], ['4', '시공', `${FLAGSHIP.days}일`], ['5', '준공', '1일'],
  ].map(([n, t, d]) => `<div class="box center">
    <span class="badge b-pri">${n}</span><div class="t-card mt2">${t}</div><div class="t-sub mt1">${d} 걸려요</div></div>`).join('')}</div>`)}

${U.statGrid([
    U.stat('누적 시공 현장', '412곳', { cls: 's-acc' }),
    U.stat('평균 공사 기간', '19일', {}),
    U.stat('하자 접수 후 방문', '1.4일', { cls: 's-ok' }),
  ])}

${U.sec('실제 고객 후기', `<div class="g2">${REVIEWS.slice(0, 4).map((r) => U.review(r)).join('')}</div>`)}

${U.sec('자주 묻는 질문', U.accordion(FAQ, { open: 0 }))}

${U.sec('', U.banner('pri', '📐', `<b>지금 상담을 남기면 오늘 안에 담당자가 연락드려요.</b>
  <p class="t-sub mt1">가입 없이도 예상 견적을 볼 수 있어요.</p>`,
    { right: U.btn('상담 신청', { href: 'ES0101', cls: 'btn-primary' }) }))}`;

  return { body, o: {} };
}

/* ---------------- HO0201 시공 분야 홈 ---------------- */
function HO0201() {
  const grades = [
    ['기본', '210만원/평', '국산 표준 자재', '14일', '1년'],
    ['고급', '265만원/평', '국산 프리미엄 자재', '19일', '2년'],
    ['프리미엄', '340만원/평', '수입 자재·풀 옵션', '24일', '3년'],
  ];
  const body = `
${U.sec('', `<div class="row-c">${U.ph('욕실 시공 대표', 'ph-thumb', 'field1')}<div>
  <h1 class="t-page" style="font-size:26px">욕실 시공</h1>
  <p class="t-sub mt1">방수부터 타일·수전까지, 욕실 하나만 통째로 맡기실 때</p></div></div>`)}

${U.sec('공사 범위', U.tabBox(
    U.tabs([{ label: '전체 교체', pane: 'full' }, { label: '부분 보수', pane: 'part' }], 0),
    U.pane('full', `<p class="t-sub">타일·방수·수전·도기·환기까지 전부 새로 합니다. 공사 기간은 5~7일입니다.</p>`, true) +
    U.pane('part', `<p class="t-sub">타일이나 수전 등 일부만 바꿉니다. 공사 기간은 1~3일입니다.</p>`, false),
  ))}

${U.sec('마감 등급별 비교', U.table(['등급', '평당 단가', '자재', '걸리는 날수', '보증'],
    grades.map((g) => g)))}

${U.sec('시공 사례', `<div class="g3">${CASES.filter((c) => c.field === '욕실').concat(CASES.slice(0, 1)).slice(0, 3).map((c) => `<a class="ccard" href="${U.link('CS0201')}">
  ${U.ph('시공 사례', 'ph-43', c.id + 'f')}<div class="nm">${U.esc(c.title)}</div><div class="meta">${c.area}평 · ${c.days}일</div></a>`).join('')}</div>`)}

${U.sec('이 공사에서 자주 놓치는 것', `<div class="g3">${[
    ['방수 두 번 치기', '한 번만 하면 3년 안에 누수가 재발할 확률이 높습니다'],
    ['배관 구배', '물이 배수구로 자연스럽게 흐르도록 경사를 잡아야 합니다'],
    ['환기', '환풍기 용량이 작으면 곰팡이가 다시 생깁니다'],
  ].map(([t, d]) => `<div class="box"><b>${t}</b><p class="t-sub mt2">${d}</p></div>`).join('')}</div>`)}

${U.sec('공정 순서', U.table(['공정', '걸리는 날수'], [
    ['철거', '1일'], ['방수', '2일'], ['타일', '2일'], ['도기·수전', '1일'], ['합계', '6일'],
  ]))}

${U.sec('', U.banner('pri', '🚿', '<b>욕실 시공, 지금 조건을 넣으면 예상 금액을 바로 볼 수 있어요.</b>',
    { right: U.btn('이 분야로 견적 내기', { href: 'ES0101', cls: 'btn-primary' }) }))}`;

  return { body, o: {} };
}

/* ---------------- HO0301 비용 안내 ---------------- */
function HO0301() {
  const rows = [
    ['철거·폐기물', 8], ['설비·배관', 12], ['목공', 22], ['타일', 14],
    ['도배', 9], ['마루', 11], ['조명·전기', 10], ['기타', 14],
  ];
  const body = `
${U.pageHd('값을 숨기지 않습니다', '평수와 공사 범위를 고르면 아래 숫자가 그 조건으로 다시 계산됩니다')}

${U.sec('', `<div class="card"><div class="card-bd">
  <div class="row-b wrap-row"><span class="t-th">32평 · 전체 시공</span>${U.btn('조건 바꾸기', { cls: 'btn-ghost btn-sm', href: 'ES0101' })}</div>
  <div class="mt4"><div class="t-sub">총액 범위</div>
    <div class="t-page" style="font-size:28px">${U.won(FLAGSHIP.totalFirst)} ~ ${U.won(FLAGSHIP.total + 1_500_000)}</div></div>
  <p class="t-sub mt2">무엇이 이 폭을 만드나 — 마감 등급, 배관 노후 여부, 층수와 엘리베이터 유무 세 가지가 가장 큽니다.</p>
</div></div>`)}

${U.sec('공정별 비용 비중', `<div class="col">${rows.map(([k, v]) => `<div class="bar-row"><span style="width:110px" class="t-sub">${k}</span>${U.bar(v * 3.2)}<span class="pct">${v}%</span></div>`).join('')}</div>`)}

${U.sec('마감 등급별 차이', U.accordion([
    { q: '기본 — 평당 210만원', a: '국산 표준 자재. 걸리는 날수 14일, 보증 1년.' },
    { q: '고급 — 평당 265만원', a: '국산 프리미엄 자재. 걸리는 날수 19일, 보증 2년.' },
    { q: '프리미엄 — 평당 340만원', a: '수입 자재·풀 옵션. 걸리는 날수 24일, 보증 3년.' },
  ]))}

${U.sec('이런 비용이 더 붙을 수 있어요', `<ul class="list-plain">${[
    '폐기물 처리비 — 평당 3만원 안팎',
    '엘리베이터 사용료 — 관리사무소 규정에 따라 10만~30만원',
    '야간·주말 작업 — 상가는 별도 협의',
    '누수 발견 시 배관 교체 — 실측 후 별도 견적',
  ].map((t) => `<li>· ${t}</li>`).join('')}</ul>`)}

${U.sec('돈 내는 차례', U.steps(['계약금 10%', '착공금 30%', '중도금 40%', '잔금 20%'], -1))}

${U.sec('다른 곳 견적과 견줄 때 이것만은 보세요', `<ul class="list-plain">${[
    '평당 단가에 철거·폐기물이 포함됐는지', '마감 등급이 같은 기준인지', '보증 기간이 몇 년인지',
    '계약금 비율이 20%를 넘지 않는지', '추가공사 승인 절차가 있는지',
  ].map((t) => `<li>· ${t}</li>`).join('')}</ul>`)}

${U.sec('', U.banner('acc', '📄', '견적서 예시를 미리 볼 수 있어요.', { right: U.btn('견적서 예시 보기', { href: 'ES0201', cls: 'btn-accent' }) }))}`;

  return { body, o: {} };
}

export const PAGES = { HO0101, HO0201, HO0301 };
