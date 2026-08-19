/* 화면에 들어가는 내용. 여기만 고치고 generate.mjs 를 다시 돌리면 198개 화면이 함께 바뀐다.
   숫자는 한곳(이 파일)에서만 정의하고 화면들이 그대로 읽어 쓴다 —
   화면마다 손으로 다시 적으면 반드시 갈라진다(레이아웃견본_발견기록.md 지뢰 2·3·4). */

export const SITE = {
  name: '마루공방',
  mark: '마',
  tagline: '아파트 리모델링·상가 인테리어를 맡아 하는 시공 업체',
  company: '(주)마루공방 · 대표 이도목 · 서울 성동구 성수이로 12',
  biz: '사업자등록번호 214-88-01234 · 건설업 등록 서울-실내-2019-00312',
  tel: '1600-2255',
  hours: '평일 09:00~18:00 (토요일 09:00~13:00)',
  me: { name: '김하은', init: '김', mail: 'haeun@example.com', joined: '2026-05-02' },
  owner: { name: '이도목', init: '이', title: '현장소장' },
};

/* 고객이 쓰는 메뉴 / 사장님(현장 관리)이 쓰는 메뉴 — 사이드바를 나눈다.
   navByAudience(스펙팩 common)와 같은 갈래: customer / owner / account */
export const NAV_CUSTOMER = [
  ['둘러보기', [['HO0101', '홈'], ['CS0101', '시공사례'], ['HO0301', '비용 안내']]],
  ['견적·예약', [['ES0101', '견적 내기'], ['VS0101', '실측 예약'], ['CT0101', '계약·결제']]],
  ['진행·보수', [['PR0101', '공사 진행'], ['AS0101', '하자보수']]],
  ['계정', [['AU0101', '로그인'], ['AU0401', '내 정보']]],
];
export const NAV_OWNER = [
  ['현장 관리', [['OW0101', '현장 대시보드'], ['OW0201', '견적 요청함'], ['OW0301', '현장 상세'], ['OW0401', '자재·원가'], ['OW0501', '기성 청구·수금'], ['OW0601', '일정 캘린더']]],
  /* 업체 계정 — 손님용 「내 정보」(AU0401)와 다루는 것이 다르다(2026-08-18 신설) */
  ['업체 설정', [['OW0701', '업체 정보·직원']]],
];

/* ---------- 시공 분야 ---------- */
export const FIELDS = [
  { key: '아파트 전체', ic: '🏠' },
  { key: '주방', ic: '🍳' },
  { key: '욕실', ic: '🚿' },
  { key: '상업공간', ic: '🏬' },
  { key: '부분 시공', ic: '🧱' },
  { key: '베란다', ic: '🪟' },
];

/* ---------- 공정 마스터 — 팀 배정이 화면마다 흩어지지 않게 한곳에 못박는다 ----------
   레이아웃견본_발견기록.md 지뢰 3: 드롭다운 기본값을 인덱스 0 으로 고정하면 안 된다.
   화면은 반드시 이 배열의 team 값을 읽어서 기본 선택값으로 써야 한다. */
export const PROCESS = [
  { key: '철거·폐기물', team: '철거팀', days: 2 },
  { key: '설비·배관', team: '설비1팀', days: 3 },
  { key: '전기·조명', team: '전기팀', days: 2 },
  { key: '목공', team: '목공1팀', days: 6 },
  { key: '타일', team: '타일팀', days: 3 },
  { key: '도배', team: '도배팀', days: 2 },
  { key: '마루', team: '마루팀', days: 2 },
  { key: '도장', team: '도장팀', days: 2 },
  { key: '청소', team: '청소팀', days: 1 },
];
export const TEAMS = ['철거팀', '설비1팀', '설비2팀', '전기팀', '목공1팀', '목공2팀', '타일팀', '도배팀', '마루팀', '도장팀', '청소팀'];

/* ---------- 대표 현장(플래그십) — CS 상세·ES 견적·CT 계약·PR 진행·OW 현장상세가 전부 같은 숫자를 쓴다.
   32평 · 성동구 성수동 · 전체 시공 · 고급 마감 · 계약금액 34,100,000원, 24일(주말 제외).
   대금 비율 10/30/40/20% 은 ho3(비용 안내) 화면의 안내와 같은 비율이다. */
export const FLAGSHIP = {
  id: 'PJ-2026-0142',
  title: '성수동 리버뷰 아파트',
  addr: '서울 성동구 성수동1가 656-***',
  area: 32,
  areaM2: 106,
  scope: '전체 시공',
  grade: '고급',
  style: '모던',
  days: 24,
  totalFirst: 32_400_000,   // 처음 견적
  total: 34_100_000,        // 확정 계약금액
  get diff() { return this.total - this.totalFirst; },
  billing: [
    ['계약금', 0.10, 3_410_000, '2026-08-20', '수금 완료'],
    ['착공금', 0.30, 10_230_000, '2026-09-10', '수금 완료'],
    ['중도금', 0.40, 13_640_000, '2026-09-24', '예정'],
    ['잔금', 0.20, 6_820_000, '2026-10-08', '예정'],
  ],
  start: '2026-09-10',
  end: '2026-10-08',
  owner: '박서준',
  manager: SITE.owner.name,
};
/* 대금 회차 합이 계약금액과 정확히 같은지, 비율×총액이 적어 둔 금액과 같은지
   빌드할 때마다 스스로 확인한다 — 손으로 두 곳에 적은 숫자는 반드시 갈라진다(지뢰 2). */
{
  const billingSum = FLAGSHIP.billing.reduce((a, b) => a + b[2], 0);
  if (billingSum !== FLAGSHIP.total) {
    throw new Error(`FLAGSHIP.billing 합계(${billingSum})가 total(${FLAGSHIP.total})과 다릅니다`);
  }
  for (const [name, rate, amount] of FLAGSHIP.billing) {
    if (Math.round(FLAGSHIP.total * rate) !== amount) {
      throw new Error(`FLAGSHIP.billing 「${name}」 — 비율 ${rate}×총액 이 적어 둔 금액 ${amount}과 다릅니다`);
    }
  }
}

/* ---------- 팀 겹침 사건 — OW 대시보드·OW 캘린더가 반드시 같은 말을 해야 한다(지뢰 4).
   타일팀이 9/24 두 현장(성수동 리버뷰 아파트 · 용산구 한강로 카페 상가)에 겹쳤다. */
export const CONFLICT = {
  team: '타일팀',
  date: '9월 24일',
  dateIso: '2026-09-24',
  sites: ['성수동 리버뷰 아파트', '용산구 한강로 카페 상가'],
};

/* ---------- 시공 사례 ---------- */
export const CASES = [
  { id: 'CS01', title: FLAGSHIP.title, area: 32, region: '서울 성동구', days: 24, priceLabel: '3,800만원대', style: '모던', field: '아파트 전체' },
  { id: 'CS02', title: '한강로 카페 상가', area: 24, region: '서울 용산구', days: 18, priceLabel: '2,600만원대', style: '인더스트리얼', field: '상업공간' },
  { id: 'CS03', title: '옥수동 욕실 리모델링', area: 6, region: '서울 성동구', days: 7, priceLabel: '850만원대', style: '내추럴', field: '욕실' },
  { id: 'CS04', title: '마포 주방 확장', area: 9, region: '서울 마포구', days: 9, priceLabel: '1,200만원대', style: '모던', field: '주방' },
  { id: 'CS05', title: '광진 24평 부분 시공', area: 24, region: '서울 광진구', days: 12, priceLabel: '1,850만원대', style: '클래식', field: '부분 시공' },
  { id: 'CS06', title: '강동 39평 아파트 전체', area: 39, region: '서울 강동구', days: 28, priceLabel: '4,600만원대', style: '모던', field: '아파트 전체' },
  { id: 'CS07', title: '성수 베란다 확장', area: 3, region: '서울 성동구', days: 4, priceLabel: '420만원대', style: '내추럴', field: '베란다' },
  { id: 'CS08', title: '왕십리 20평 신혼집', area: 20, region: '서울 성동구', days: 15, priceLabel: '2,400만원대', style: '모던', field: '아파트 전체' },
];

/* ---------- 자재·마감 ---------- */
export const MATERIALS = [
  { id: 'M01', part: '바닥', name: '강마루 오크내추럴', brand: '동화자연마루', grade: '고급', add: 0 },
  { id: 'M02', part: '바닥', name: '강화마루 화이트오크', brand: 'LX하우시스', grade: '기본', add: -320000 },
  { id: 'M03', part: '벽', name: '실크벽지 그레이지', brand: '개나리벽지', grade: '고급', add: 180000 },
  { id: 'M04', part: '주방', name: '인조대리석 상판 캄포블랑', brand: '한화L&C', grade: '프리미엄', add: 1_420_000 },
  { id: 'M05', part: '욕실', name: '포세린 타일 600×600', brand: '대동타일', grade: '고급', add: 640000 },
  { id: 'M06', part: '창호', name: '3중 유리 시스템창호', brand: 'LX Z:IN', grade: '프리미엄', add: 2_180_000 },
];

/* ---------- 후기 ---------- */
export const REVIEWS = [
  { who: '박서준', area: 32, region: '성동구', rate: 5, txt: '공정표대로 하루도 안 밀리고 끝났어요. 사진 일지 덕분에 매일 확인할 수 있어 안심됐습니다.', date: '2026-08-02' },
  { who: '최유나', area: 24, region: '용산구', rate: 5, txt: '추가공사 견적을 승인 전에 사진으로 다 보여줘서 믿고 진행했어요.', date: '2026-07-21' },
  { who: '한지수', area: 6, region: '성동구', rate: 4, txt: '욕실 하나였는데도 견적 항목을 세세하게 알려주셔서 좋았습니다.', date: '2026-07-05' },
  { who: '오세훈', area: 39, region: '강동구', rate: 5, txt: '준공 검수 체크리스트가 꼼꼼해서 하자 없이 잘 마무리됐어요.', date: '2026-06-18' },
];

export const FAQ = [
  { q: '방문 실측은 비용이 드나요?', a: '실측 방문비는 받지 않습니다. 40분에서 1시간 정도 걸립니다.' },
  { q: '계약금은 얼마나 되나요?', a: '전체 공사금액의 10%입니다. 착공금 30%, 중도금 40%, 잔금 20%로 나누어 냅니다.' },
  { q: '공사 중 추가 비용이 생기면 어떻게 하나요?', a: '변경 견적을 먼저 보여드리고 승인하셔야 진행됩니다. 임의로 진행하지 않습니다.' },
  { q: '하자보수는 언제까지 되나요?', a: '준공 후 1년간 무상 하자보수가 됩니다. 부위별로 보증 기간이 다를 수 있어요.' },
  { q: '거주하면서 공사할 수 있나요?', a: '부분 시공은 가능하지만, 전체 시공은 비워 두시는 것을 권장합니다.' },
];

/* ---------- 견적 요청함(OW0201) ---------- */
export const REQUESTS = [
  { id: 'RQ-0231', at: '10분 전', area: 28, field: '아파트 전체', amount: 29_800_000, status: '새 요청', phoneMasked: '010-****-2231' },
  { id: 'RQ-0230', at: '1시간 전', area: 12, field: '욕실', amount: 9_200_000, status: '확인 중', phoneMasked: '010-****-8842' },
  { id: 'RQ-0229', at: '어제', area: 34, field: '아파트 전체', amount: 36_500_000, status: '실측 잡힘', phoneMasked: '010-****-1190' },
  { id: 'RQ-0228', at: '2일 전', area: 9, field: '주방', amount: 8_400_000, status: '계약됨', phoneMasked: '010-****-5521' },
  { id: 'RQ-0227', at: '3일 전', area: 18, field: '상업공간', amount: 16_900_000, status: '놓침', phoneMasked: '010-****-7710' },
];

/* ---------- 하자보수 접수 내역 ---------- */
export const AS_CASES = [
  { id: 'AS-0091', part: '설비', symptom: '싱크대 하부 누수', status: '방문 예정', at: '2026-09-05', urgency: '급함' },
  { id: 'AS-0088', part: '타일', symptom: '욕실 바닥 타일 들뜸', status: '처리 중', at: '2026-08-29', urgency: '보통' },
  { id: 'AS-0081', part: '도배', symptom: '천장 벽지 이음새 벌어짐', status: '완료', at: '2026-08-11', urgency: '천천히' },
];

export const won = (n) => Math.round(n).toLocaleString('ko-KR') + '원';
