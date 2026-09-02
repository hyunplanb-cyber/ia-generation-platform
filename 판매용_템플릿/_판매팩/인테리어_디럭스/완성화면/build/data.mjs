/* 화면에 채울 "있을 법한" 값들 — 인테리어 시공 견적·시공관리.
   숫자는 서로 아귀가 맞게 둔다 — 견적 화면의 총액, 계약 화면의 계약금,
   공정표의 진행률, 대시보드 숫자가 따로 놀면 사는 사람이 먼저 알아챈다. */

export const SITE = {
  name: '집짓다',
  short: '집짓다',
  mark: '집',
  concept: '아파트 리모델링·상가 인테리어를 맡아 하는 시공 업체의 사이트',
  tel: '02-000-0000',
  addr: '서울 성동구 왕십리로 000, 3층',
};

export const NAV = [
  ['시공사례', 'CS-01'],
  ['예상 견적', 'ES-01'],
  ['실측 예약', 'VS-01'],
  ['비용 안내', 'HO-03'],
];

export const ST_CLS = {
  예약확정: 'b-ok', 진행중: 'b-solid', 완료: 'b-ok', 취소: 'b-mut',
  끝남: 'b-ok', 하는중: 'b-solid', 기다림: 'b-mut', 밀림: 'b-dan',
  접수됨: 'b-warn', 방문예정: 'b-solid', 처리중: 'b-solid',
  새요청: 'b-acc', 확인중: 'b-warn', 실측잡힘: 'b-solid', 계약됨: 'b-ok', 놓침: 'b-mut',
  발주전: 'b-mut', 발주함: 'b-warn', 입고됨: 'b-ok', 반품: 'b-dan',
  예정: 'b-mut', 청구함: 'b-warn', 수금완료: 'b-ok', 연체: 'b-dan',
  발행전: 'b-mut', 발행함: 'b-ok',
};

/* ---------- 시공 분야 ---------- */
export const FIELDS = [
  { id: 'all-a', nm: '아파트 전체', ico: '🏠' },
  { id: 'kitchen', nm: '주방', ico: '🍳' },
  { id: 'bath', nm: '욕실', ico: '🛁' },
  { id: 'shop', nm: '상업공간', ico: '🏬' },
  { id: 'part', nm: '부분 시공', ico: '🧱' },
  { id: 'veranda', nm: '베란다', ico: '🌿' },
];

/* ---------- 시공 사례 ----------
   before/after 자리는 U.compare() 가 만든다 — 사진은 아직 없다(11번 절차). */
export const CASES = [
  { id: 'C-101', nm: '32평 아파트 전체 리모델링', pyeong: 32, area: '성동구', field: 'all-a', style: '모던', days: 24, price: '3,800만원대', priceMin: 36_000_000, priceMax: 41_000_000 },
  { id: 'C-102', nm: '24평 주방·거실 부분 시공', pyeong: 24, area: '마포구', field: 'kitchen', style: '내추럴', days: 12, price: '1,600만원대', priceMin: 14_500_000, priceMax: 18_000_000 },
  { id: 'C-103', nm: '욕실 2개 전체 교체', pyeong: 34, area: '송파구', field: 'bath', style: '모던', days: 9, price: '1,200만원대', priceMin: 11_000_000, priceMax: 13_500_000 },
  { id: 'C-104', nm: '카페 상업공간 신규 시공', pyeong: 28, area: '용산구', field: 'shop', style: '인더스트리얼', days: 30, price: '5,200만원대', priceMin: 48_000_000, priceMax: 56_000_000 },
  { id: 'C-105', nm: '18평 원룸 전체 시공', pyeong: 18, area: '광진구', field: 'all-a', style: '클래식', days: 15, price: '1,900만원대', priceMin: 17_000_000, priceMax: 21_000_000 },
  { id: 'C-106', nm: '베란다 확장·단열 보강', pyeong: 32, area: '강동구', field: 'veranda', style: '내추럴', days: 6, price: '650만원대', priceMin: 5_800_000, priceMax: 7_200_000 },
  { id: 'C-107', nm: '40평대 아파트 전체 시공', pyeong: 42, area: '노원구', field: 'all-a', style: '모던', days: 28, price: '4,900만원대', priceMin: 45_000_000, priceMax: 53_000_000 },
  { id: 'C-108', nm: '욕실 1개 부분 보수', pyeong: 26, area: '성동구', field: 'bath', style: '모던', days: 5, price: '480만원대', priceMin: 4_200_000, priceMax: 5_400_000 },
];
export const caseOf = (id) => CASES.find((c) => c.id === id);

/* ---------- 평수별 예상 비용(전체 시공 기준) ---------- */
export const PYEONG_COST = [
  /* 대표평 — 홈에서 「20평대」처럼 «구간»을 고르면 견적 마법사 2단계에 이 값이
     미리 채워진다. 손님은 거기서 제 평수로 고쳐 넣는다. */
  { key: '10', label: '10평대', min: 14_000_000, max: 20_000_000, 대표평: 15 },
  { key: '20', label: '20평대', min: 22_000_000, max: 30_000_000, 대표평: 25 },
  { key: '30', label: '30평대', min: 32_000_000, max: 46_000_000, 대표평: 32 },
  { key: '40', label: '40평대 이상', min: 45_000_000, max: 62_000_000, 대표평: 45 },
];

/* ---------- 마감 등급 ---------- */
export const GRADES = [
  { key: 'base', nm: '기본', mult: 1.0, days: 20, warranty: '1년' },
  { key: 'high', nm: '고급', mult: 1.22, days: 22, warranty: '2년' },
  { key: 'pre', nm: '프리미엄', mult: 1.48, days: 25, warranty: '3년' },
];

/* ---------- 견적 공정별 비중 ---------- */
export const COST_RATIO = [
  ['철거·폐기물', 8], ['설비·배관', 12], ['목공', 22], ['타일', 14],
  ['도배', 9], ['마루', 11], ['조명·전기', 10], ['기타', 14],
];

/* ---------- 견적 항목(es2 기준값 — 32평 · 고급 마감) ---------- */
export const ESTIMATE_BASE = {
  pyeong: 32, field: '전체 시공', grade: '고급', startMonth: '9월',
  min: 32_400_000, max: 39_800_000,
};
export const ESTIMATE_ITEMS = [
  { nm: '철거·폐기물', qty: 1, unit: '식', amt: 3_100_000, days: 2 },
  { nm: '설비·배관', qty: 1, unit: '식', amt: 4_600_000, days: 3 },
  { nm: '전기·조명', qty: 1, unit: '식', amt: 3_800_000, days: 2 },
  { nm: '목공', qty: 1, unit: '식', amt: 8_200_000, days: 6 },
  { nm: '타일', qty: 1, unit: '식', amt: 5_300_000, days: 3 },
  { nm: '도배', qty: 1, unit: '식', amt: 2_400_000, days: 2 },
  { nm: '마루', qty: 1, unit: '식', amt: 3_600_000, days: 2 },
  /* ⛔ 2026-09-03: 항목 아홉의 합이 32,500,000 이라 ESTIMATE_BASE.min(32,400,000)과
     100,000원 어긋나 있었다. ES-02 한 화면에 「총액 32,400,000」과 「합계 32,500,000」이
     나란히 떠 있었다. 32,400,000 쪽은 못 건드린다 — CT-01 이 그 값에 +1,700,000 을
     더해 계약총액 34,100,000 을 만들고, 목공 8,200,000 은 WOOD_DETAIL 이 붙들고 있다.
     그래서 아무 데도 안 매인 도장 한 줄에서 100,000 을 뺐다. 아래 검사가 다시 어긋나면 멈춘다. */
  { nm: '도장', qty: 1, unit: '식', amt: 1_000_000, days: 1 },
  { nm: '청소', qty: 1, unit: '식', amt: 400_000, days: 1 },
];
export const 견적합계 = ESTIMATE_ITEMS.reduce((n, x) => n + x.amt, 0);

/* 손으로 적은 숫자 둘은 반드시 갈라진다. 굽을 때마다 스스로 확인한다. */
if (견적합계 !== ESTIMATE_BASE.min) {
  throw new Error(`견적 항목 합계(${견적합계})가 ESTIMATE_BASE.min(${ESTIMATE_BASE.min})과 다릅니다 — ES-02 한 화면에 두 총액이 뜹니다`);
}

/* ── 값 잣대 — 이 팩의 «평당 얼마»는 여기서만 정한다 ─────────────────
 *
 * ⛔ 2026-09-03 — 한 팩 안에서 평당 단가를 두 기준으로 셈하고 있었다.
 *      HO-02(욕실)  평당 28,000원      ← 2평 욕실이면 56,000원이다
 *      HO-03(비용)  평당 1,050,000원   ← 32평이면 40,992,000원, 이 팩이 말하는 32,400,000 과 1.27배 어긋난다
 *
 * ⚠ 새 숫자를 지어내지 않았다. ESTIMATE_BASE(32평 · 전체 시공 · 고급)에서 나눈다.
 *   등급배는 GRADES 가 이미 쓰던 mult 를 그대로 쓴다.
 * ⚠ 욕실 평당가는 이 팩에 «근거가 없다» — 욕실 몇 평인지가 어디에도 없다.
 *   그래서 HO-02 에서는 지어내지 않고 실제 현장 값을 그대로 보여 준다. */
export const PRICING = {
  평당고급: ESTIMATE_BASE.min / ESTIMATE_BASE.pyeong,   // 1,012,500원
  기준등급: '고급',
  평당(등급이름) {
    const 밑 = GRADES.find((g) => g.nm === this.기준등급);
    const 그것 = GRADES.find((g) => g.nm === 등급이름);
    return this.평당고급 * ((그것 ? 그것.mult : 밑.mult) / 밑.mult);
  },
};
{
  const 셈 = Math.round(PRICING.평당('고급') * ESTIMATE_BASE.pyeong);
  if (셈 !== ESTIMATE_BASE.min) {
    throw new Error(`PRICING 이 ${셈} 인데 ESTIMATE_BASE.min 은 ${ESTIMATE_BASE.min} 입니다`);
  }
}

/* ---------- 목공 공정 세부(es3) ---------- */
export const WOOD_DETAIL = [
  { nm: '아트월 목공틀', spec: 'MDF 9T', qty: 1, unit: '식', price: 1_800_000, amt: 1_800_000 },
  { nm: '붙박이장 제작', spec: 'PB 18T', qty: 3, unit: '개', price: 950_000, amt: 2_850_000 },
  { nm: '몰딩·걸레받이', spec: 'PVC', qty: 1, unit: '식', price: 1_200_000, amt: 1_200_000 },
  { nm: '문틀·문짝 교체', spec: 'ABS도어', qty: 5, unit: '개', price: 470_000, amt: 2_350_000 },
];

/* 목공 금액은 제 세부표가 붙들고 있다 — 한쪽만 고치면 화면 둘이 갈라진다. */
{
  const 목공 = ESTIMATE_ITEMS.find((x) => x.nm === '목공');
  const 세부 = WOOD_DETAIL.reduce((n, x) => n + x.amt, 0);
  if (목공 && 세부 !== 목공.amt) {
    throw new Error(`WOOD_DETAIL 합(${세부})이 목공 항목(${목공.amt})과 다릅니다`);
  }
}

/* ---------- 계약 조항(ct1) ---------- */
export const CONTRACT_TERMS = [
  { t: '공사 범위', s: '32평 아파트 전체 리모델링. 철거~준공청소 포함, 가구·가전 별도', full: '별첨 견적서 및 공정표에 명시된 범위로 한정하며, 협의되지 않은 추가 작업은 별도 변경 견적 승인 절차를 거친다.' },
  { t: '공사 기간', s: '착공일로부터 22일(주말·공휴일 제외)', full: '천재지변, 발주자 귀책 사유, 승인 지연으로 인한 지연은 공사 기간에서 제외한다.' },
  { t: '계약 금액', s: '총 34,100,000원 (부가세 별도)', full: '실측 후 확정된 금액이며, 추가공사 발생 시 별도 변경 견적을 통해 조정한다.' },
  { t: '대금 지급 시기', s: '계약금 10% · 착공금 30% · 중도금 40% · 잔금 20%', full: '각 회차 대금은 해당 공정 착수 전 또는 준공 검수 완료 후 지급함을 원칙으로 한다.' },
  { t: '지체상금', s: '준공 지연 시 1일당 계약금액의 0.1%', full: '단, 발주자 귀책 사유 또는 천재지변으로 인한 지연은 지체일수에서 제외한다.' },
  { t: '하자보수', s: '준공일로부터 1년(고급 마감 기준 2년)', full: '통상적인 사용에 따른 하자에 한하며, 고의·과실에 의한 손상은 제외한다.' },
  { t: '계약 해지', s: '착공 전 해지 시 계약금의 10% 위약금', full: '착공 후 해지 시 기시공 부분의 기성금과 원상복구 비용을 정산한다.' },
];

/* ---------- 대금 회차 ---------- */
export const PAY_SCHEDULE = (total) => ([
  { nm: '계약금', pct: 10, amt: Math.round(total * 0.1), date: '오늘' },
  { nm: '착공금', pct: 30, amt: Math.round(total * 0.3), date: '9월 10일' },
  { nm: '중도금', pct: 40, amt: Math.round(total * 0.4), date: '9월 24일' },
  { nm: '잔금', pct: 20, amt: Math.round(total * 0.2), date: '준공 후' },
]);
export const 계약총액 = 34_100_000;

/* ---------- 공정표(pr1) — 32평 전체 시공, 착공 9/8, 준공 예정 9/30 ----------
   day = 착공일(9/8)로부터 며칠째. st: done·on·wait·late */
export const PROCESS = [
  { code: 'demo', nm: '철거', from: 0, to: 1, st: 'done', team: '철거팀', today: '내부 철거·폐기물 반출 완료' },
  { code: 'mech', nm: '설비·배관', from: 2, to: 4, st: 'done', team: '설비1팀', today: '급수·오배수 배관 교체 완료' },
  { code: 'elec', nm: '전기', from: 3, to: 4, st: 'done', team: '전기팀', today: '분전반·배선 작업 완료' },
  { code: 'wood', nm: '목공', from: 5, to: 10, st: 'on', team: '목공1팀', today: '거실 아트월 목공틀 작업 중' },
  { code: 'tile', nm: '타일', from: 11, to: 13, st: 'wait', team: '타일팀', today: '' },
  { code: 'paper', nm: '도배', from: 14, to: 15, st: 'wait', team: '도배팀', today: '' },
  { code: 'floor', nm: '마루', from: 16, to: 17, st: 'wait', team: '마루팀', today: '' },
  { code: 'light', nm: '조명·마무리', from: 18, to: 19, st: 'wait', team: '전기팀', today: '' },
  { code: 'clean', nm: '입주청소', from: 20, to: 20, st: 'wait', team: '청소팀', today: '' },
];
export const 공사일수 = 22;
export const 오늘공사일 = 14;
export const 진행률 = Math.round((오늘공사일 / 공사일수) * 100);

/* ---------- 오늘 현장(pr2) ---------- */
export const TODAY_SITE = {
  date: '9월 22일 (화)', dayN: 14,
  process: '타일 시공 2일차', team: '타일 2명, 설비 1명',
  needsDecision: '욕실 바닥 타일 색을 오늘까지 정해 주세요',
  managerNote: '욕실 방수 두 번째 치기 끝냈습니다. 내일 하루 말리고 모레 타일 들어갑니다',
  doneToday: ['욕실 방수 2차 완료', '거실 몰딩 마감'],
  tomorrow: ['욕실 방수 건조', '주방 타일 자재 입고'],
  weather: '내일 비 · 베란다 도장은 하루 미룰 수 있어요',
};

/* ---------- 현장 사진 일지(pr3) ---------- */
export const PHOTO_LOG = [
  { date: '9월 22일 (화)', dayN: 14, process: '타일 시공', spaces: ['거실', '욕실'], n: 8, note: '욕실 벽 타일 1차 마감' },
  { date: '9월 20일 (일)', dayN: 12, process: '목공 마감', spaces: ['거실', '주방'], n: 10, note: '아트월 목공틀 완료, 붙박이장 제작 중' },
  { date: '9월 17일 (목)', dayN: 9, process: '설비·전기', spaces: ['주방', '욕실'], n: 6, note: '배관 교체 완료, 분전반 작업 중' },
  { date: '9월 8일 (화)', dayN: 0, process: '철거', spaces: ['전체'], n: 12, note: '내부 철거 착공' },
];

/* ---------- 추가공사(pr4) ---------- */
export const EXTRA_ITEMS = [
  { nm: '온수 배관 교체', qty: 12, unit: 'm', price: 9_000, amt: 108_000, why: '철거하고 보니 배관 이음새가 삭아 있었습니다. 그대로 두면 도배 뒤에 물이 새어 다시 뜯어야 합니다.' },
  { nm: '배관 자재', qty: 1, unit: '식', price: 320_000, amt: 320_000, why: '교체용 동관·이음쇠 자재비.' },
  { nm: '방수 재시공', qty: 1, unit: '식', price: 850_000, amt: 850_000, why: '기존 방수층 위로 배관 공사가 지나가 재시공이 필요합니다.' },
  { nm: '벽체 보수', qty: 1, unit: '식', price: 582_000, amt: 582_000, why: '배관 매립 부위 벽체 크랙 보수.' },
];
export const 추가공사합계 = EXTRA_ITEMS.reduce((n, x) => n + x.amt, 0);

/* ---------- 준공 검수 체크리스트(pr5) — 공간별 ---------- */
export const CHECKLIST = {
  거실: ['벽지 이음새', '걸레받이 마감', '마루 들뜸', '콘센트 작동', '조명 스위치'],
  주방: ['싱크대 수평', '수전 누수', '배수 속도', '상부장 여닫힘', '타일 줄눈'],
  욕실: ['실리콘 마감', '수전 누수', '배수 속도', '환풍기 작동', '타일 들뜸'],
  침실: ['문 여닫힘', '벽지 이음새', '콘센트 작동', '마루 들뜸'],
  베란다: ['창호 여닫힘', '방수 상태', '단열재 마감'],
  공용: ['현관 도어락', '중문 여닫힘', '복도 조명', '우편함 표기'],
};
export const CHECKLIST_ISSUES = [
  { space: '주방', item: '수전 누수', memo: '냉수 쪽 미세한 누수 확인', at: '9/28 14:20' },
  { space: '욕실', item: '타일 들뜸', memo: '바닥 배수구 옆 타일 1장', at: '9/28 15:02' },
  { space: '침실', item: '문 여닫힘', memo: '작은방 문이 뻑뻑함', at: '9/28 15:40' },
];

/* ---------- 하자보수(as) ---------- */
export const DEFECT_PARTS = [
  { key: 'paper', nm: '도배', ico: '🧻', symptoms: ['이음새가 벌어짐', '들뜸', '곰팡이', '오염'] },
  { key: 'floor', nm: '바닥', ico: '🪵', symptoms: ['들뜸', '삐걱거림', '긁힘', '색바램'] },
  { key: 'tile', nm: '타일', ico: '🧱', symptoms: ['줄눈이 갈라짐', '타일이 들뜸', '깨짐', '물이 스밈'] },
  { key: 'mech', nm: '설비·수전', ico: '🚿', symptoms: ['누수', '배수 느림', '수압 약함'] },
  { key: 'elec', nm: '전기·조명', ico: '💡', symptoms: ['작동 안 됨', '깜빡임', '스위치 불량'] },
  { key: 'window', nm: '창호', ico: '🪟', symptoms: ['여닫힘 뻑뻑함', '틈새 바람', '결로'] },
  { key: 'wood', nm: '목공', ico: '🔨', symptoms: ['문 처짐', '몰딩 들뜸', '경첩 소음'] },
];
export const DEFECTS = [
  { id: 'AS-20260924-0007', site: '성동구 ○○아파트 101동 1203호', part: '타일', symptom: '줄눈이 갈라짐', st: '처리중', at: '2026-09-22 14:10', visit: '2026-09-24 14:00' },
  { id: 'AS-20260910-0004', site: '성동구 ○○아파트 101동 1203호', part: '도배', symptom: '이음새가 벌어짐', st: '완료', at: '2026-09-08 10:20', visit: '2026-09-10 11:00', done: '2026-09-10 15:40' },
  { id: 'AS-20260830-0002', site: '성동구 ○○아파트 101동 1203호', part: '설비·수전', symptom: '배수 느림', st: '완료', at: '2026-08-28 09:15', visit: '2026-08-30 10:00', done: '2026-08-30 11:20' },
  { id: 'AS-20260815-0001', site: '성동구 ○○아파트 101동 1203호', part: '전기·조명', symptom: '스위치 불량', st: '접수됨', at: '2026-08-15 19:40', visit: null },
];
export const 보증만료 = '2027년 9월 30일';
export const 보증남은개월 = 13;

/* ---------- 현장 관리(업체, OW) ---------- */
export const OW_NAV = [
  ['대시보드', 'OW-01'], ['견적 요청함', 'OW-02'], ['현장', 'OW-03'],
  ['자재·원가', 'OW-04'], ['청구·수금', 'OW-05'], ['일정', 'OW-06'],
];
export const SITES = [
  { id: 'S-24', addr: '성동구 왕십리 ○○아파트 101동 1203호', pyeong: 32, process: '목공', progress: 62, next: '9/24 타일 색 확인', late: false, amount: 34_100_000 },
  { id: 'S-23', addr: '마포구 아현동 ○○빌라 2층', pyeong: 24, process: '타일', progress: 78, next: '9/23 도배 자재 입고', late: false, amount: 16_500_000 },
  { id: 'S-22', addr: '용산구 한강로 카페 상가 1층', pyeong: 28, process: '전기', progress: 34, next: '9/25 소방 점검', late: true, amount: 52_000_000 },
  { id: 'S-21', addr: '송파구 잠실동 ○○아파트 3동 802호', pyeong: 34, process: '준공청소', progress: 96, next: '9/21 준공 검수', late: false, amount: 12_800_000 },
  { id: 'S-20', addr: '광진구 구의동 원룸', pyeong: 18, process: '도배', progress: 55, next: '9/23 마루 시공', late: false, amount: 19_000_000 },
  { id: 'S-19', addr: '강동구 천호동 ○○아파트 5동 401호', pyeong: 32, process: '설비', progress: 18, next: '9/24 배관 교체', late: true, amount: 6_500_000 },
  { id: 'S-18', addr: '노원구 상계동 ○○아파트 12동 1502호', pyeong: 42, process: '철거', progress: 8, next: '9/22 폐기물 반출', late: false, amount: 49_000_000 },
];
export const OW_STATS = {
  진행현장: SITES.length,
  이달매출: SITES.reduce((n, s) => n + s.amount, 0),
  미수금: 38_200_000,
  밀린공정: SITES.filter((s) => s.late).length,
};

/* ---------- 견적 요청함(ow2) ---------- */
export const LEADS = [
  { id: 'L-091', at: '3시간 전', pyeong: 28, field: '주방', amt: 18_500_000, start: '10월 초', st: '새요청', urgent: true },
  { id: 'L-090', at: '5시간 전', pyeong: 34, field: '전체 시공', amt: 38_000_000, start: '9월 말', st: '새요청', urgent: false },
  { id: 'L-088', at: '어제', pyeong: 22, field: '욕실', amt: 12_000_000, start: '미정', st: '확인중', urgent: false },
  { id: 'L-085', at: '2일 전', pyeong: 32, field: '전체 시공', amt: 34_000_000, start: '9월 중', st: '실측잡힘', urgent: false },
  { id: 'L-081', at: '4일 전', pyeong: 26, field: '주방', amt: 15_800_000, start: '9월 초', st: '계약됨', urgent: false },
  { id: 'L-077', at: '1주 전', pyeong: 18, field: '전체 시공', amt: 19_000_000, start: '미정', st: '놓침', urgent: false },
];

/* ---------- 자재·원가(ow4) ---------- */
export const MATERIALS = [
  { proc: '목공', nm: 'MDF 9T (아트월)', spec: '1220×2440', qty: 8, unit: '장', est: 45_000, real: 47_000, st: '입고됨', due: '9/12' },
  { proc: '목공', nm: 'PB 18T (붙박이장)', spec: '1220×2440', qty: 6, unit: '장', est: 38_000, real: 38_000, st: '입고됨', due: '9/12' },
  { proc: '타일', nm: '포세린 타일', spec: '600×600', qty: 42, unit: '장', est: 12_000, real: 0, st: '발주함', due: '9/23' },
  { proc: '타일', nm: '줄눈 시멘트', spec: '25kg', qty: 4, unit: '포', est: 18_000, real: 0, st: '발주전', due: '9/23' },
  { proc: '도배', nm: '실크벽지', spec: '폭 106cm', qty: 12, unit: '롤', est: 32_000, real: 0, st: '발주전', due: '9/25' },
  { proc: '마루', nm: '강마루', spec: '155×1200', qty: 38, unit: '평', est: 68_000, real: 0, st: '발주전', due: '9/26' },
];

/* ---------- 청구·수금(ow5) ---------- */
export const INVOICES = [
  { site: 'S-24', round: '계약금', amt: 3_410_000, due: '8/17', invoiced: '8/17', paid: '8/17', st: '수금완료', tax: '발행함' },
  { site: 'S-24', round: '착공금', amt: 10_230_000, due: '9/10', invoiced: '9/10', paid: '9/10', st: '수금완료', tax: '발행함' },
  { site: 'S-24', round: '중도금', amt: 13_640_000, due: '9/24', invoiced: null, paid: null, st: '예정', tax: '발행전' },
  { site: 'S-22', round: '착공금', amt: 15_600_000, due: '9/16', invoiced: '9/16', paid: null, st: '연체', tax: '발행함' },
  { site: 'S-19', round: '계약금', amt: 650_000, due: '9/1', invoiced: '9/1', paid: '9/1', st: '수금완료', tax: '발행함' },
];

/* ---------- 일정 캘린더(ow6) ---------- */
export const SCHEDULE = [
  { date: 15, site: 'S-24', team: '목공1팀', kind: 'work' },
  { date: 15, site: 'S-23', team: '타일팀', kind: 'work' },
  { date: 22, site: 'S-24', team: '타일팀', kind: 'work' },
  { date: 22, site: 'S-19', team: '설비1팀', kind: 'work' },
  { date: 24, site: 'S-24', team: '타일팀', kind: 'work' },
  { date: 24, site: 'S-22', team: '타일팀', kind: 'work' },
  { date: 25, site: 'S-18', team: '실측', kind: 'visit' },
];

/* ---------- 후기 ---------- */
export const REVIEWS = [
  { nm: '김**', at: '32평 · 전체 시공', t: '공정표가 눈에 보이니 언제 뭐가 되는지 알 수 있어서 좋았어요. 추가공사도 사진으로 먼저 보여주셔서 믿고 승인했습니다.' },
  { nm: '이**', at: '욕실 2개 · 부분 시공', t: '준공 검수 때 하나씩 체크하면서 봤는데, 사소한 것도 바로바로 고쳐 주셨어요.' },
  { nm: '박**', at: '카페 · 상업공간', t: '현장 사진 일지가 매일 올라와서 못 가봐도 안심이 됐습니다.' },
  { nm: '최**', at: '24평 · 주방 시공', t: '견적서에 항목이 다 나와 있어서 다른 곳이랑 비교하기 쉬웠어요.' },
];

/* ---------- FAQ ---------- */
export const FAQ_HOME = [
  { q: '방문 실측은 비용이 드나요?', a: '아니요, 방문비는 받지 않습니다. 실측은 40분에서 1시간 정도 걸립니다.' },
  { q: '견적이 실측 후에 왜 바뀌나요?', a: '배관·전기 상태, 벽면 수평 등은 철거해 봐야 정확히 알 수 있는 경우가 있습니다. 실측으로 대부분은 확정되지만 철거 중 발견되는 사항은 추가 견적 승인을 거쳐 진행합니다.' },
  { q: '공사 중에 얼마나 자주 확인할 수 있나요?', a: '현장 사진 일지가 공정마다 올라오고, 궁금한 점은 소장에게 바로 물어보실 수 있습니다.' },
  { q: '하자보수는 언제까지 되나요?', a: '기본 마감은 1년, 고급 마감은 2년, 프리미엄 마감은 3년 보증됩니다.' },
  { q: '계약금은 얼마인가요?', a: '계약금은 총 공사비의 10%이며, 착공금·중도금·잔금으로 나누어 냅니다.' },
];

export const TODAY = '2026-09-22';
