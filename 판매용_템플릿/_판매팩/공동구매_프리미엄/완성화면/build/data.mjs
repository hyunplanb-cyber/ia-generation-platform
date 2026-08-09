/* 화면에 채워 넣을 표본 내용.
   실제 서비스 데이터가 아니라, 화면이 비어 보이지 않게 하고
   "여기에 이런 것이 들어간다"를 눈으로 확인하려고 둔 것이다. */

export const SITE = {
  name: '모아공구',
  mark: 'MG',
  company: '(주)모아공구 · 대표 서지현 · 서울 성동구 아차산로 111 5층',
  biz: '사업자등록 512-81-00947 · 통신판매 2026-서울성동-0288',
  tel: '1670-3120',
  hours: '평일 10:00–18:00 (점심 12:30–13:30) · 주말·공휴일 휴무',
};

/* 헤더는 둘로 나뉜다 — 참여자가 쓰는 것과 진행자가 쓰는 것.
   한 계정이 두 권한을 가지며, 오가는 길은 우측 상단 하나뿐이다. */
export const NAV = [
  { id: 'HO-01', label: '홈' },
  { id: 'HO-02', label: '공구 목록' },
  { id: 'HO-03', label: '마감 임박' },
  { id: 'MY-01', label: '내 공구함' },
  { id: 'RV-03', label: '관심·알림' },
];

export const NAV_OWNER = [
  { id: 'HM-01', label: '진행자 대시보드' },
  { id: 'HS-02', label: '공구 개설' },
  { id: 'HM-04', label: '발주·배송' },
  { id: 'SE-01', label: '정산' },
];

export const CATS = [
  { key: 'food', nm: '식품·간편식', ic: '🍱' },
  { key: 'living', nm: '생활·주방', ic: '🧺' },
  { key: 'beauty', nm: '뷰티', ic: '💄' },
  { key: 'baby', nm: '유아·육아', ic: '🍼' },
  { key: 'pet', nm: '반려동물', ic: '🐾' },
  { key: 'digital', nm: '디지털·가전', ic: '🎧' },
  { key: 'fashion', nm: '패션', ic: '👕' },
  { key: 'health', nm: '건강식품', ic: '💊' },
];
export const CAT_LABEL = CATS.reduce((a, c) => (a[c.key] = c.nm, a), {});

/* ---------- 공구 ----------
   pct 달성률 · joined 참여 인원 · goal 목표 인원 · left 남은 시간(분) */
export const DEALS = [
  { id: 'd1', cat: 'food', nm: '제주 한라봉 5kg 산지직송 (특대과)', host: '동네장터 지현',
    was: 39000, now: 24900, goal: 300, joined: 247, left: 187, ship: '성사 후 3일 내 발송', rate: 4.8, rv: 412 },
  { id: 'd2', cat: 'living', nm: '독일산 스테인리스 냄비 3종 세트', host: '살림고수 미란',
    was: 189000, now: 98000, goal: 150, joined: 151, left: 42, ship: '성사 후 5일 내 발송', rate: 4.9, rv: 288, done: true },
  { id: 'd3', cat: 'beauty', nm: '병풀 진정 앰플 30ml × 3개입', host: '뷰티진행자 은채',
    was: 87000, now: 41400, goal: 500, joined: 486, left: 21, ship: '성사 후 2일 내 발송', rate: 4.7, rv: 963 },
  { id: 'd4', cat: 'baby', nm: '유기농 밴드형 기저귀 대용량 4팩', host: '두아이맘 소라',
    was: 76000, now: 49900, goal: 200, joined: 88, left: 1440, ship: '성사 후 4일 내 발송', rate: 4.8, rv: 501 },
  { id: 'd5', cat: 'pet', nm: '동결건조 닭가슴살 트릿 1kg', host: '멍냥집사 태호',
    was: 52000, now: 31000, goal: 120, joined: 119, left: 96, ship: '성사 후 3일 내 발송', rate: 4.9, rv: 217 },
  { id: 'd6', cat: 'digital', nm: '노이즈캔슬링 무선 이어폰 (2026형)', host: '가전진행자 준영',
    was: 249000, now: 158000, goal: 400, joined: 132, left: 2880, ship: '성사 후 7일 내 발송', rate: 4.6, rv: 340 },
  { id: 'd7', cat: 'health', nm: '유산균 100억 CFU 3개월분', host: '헬스진행자 다은',
    was: 96000, now: 52000, goal: 250, joined: 203, left: 660, ship: '성사 후 3일 내 발송', rate: 4.7, rv: 728 },
  { id: 'd8', cat: 'fashion', nm: '겨울 기모 라운넥 맨투맨 (5color)', host: '옷장정리 하윤',
    was: 59000, now: 29900, goal: 300, joined: 41, left: 4320, ship: '성사 후 5일 내 발송', rate: 4.5, rv: 156 },
];
export const dealById = (id) => DEALS.find((d) => d.id === id) || DEALS[0];
export const pctOf = (d) => Math.min(999, Math.round(d.joined / d.goal * 100));

/* 곧 열리는 공구 */
export const SOON = [
  { nm: '설 선물세트 한우 1++ 등급', open: '8월 6일 10:00', want: 1284 },
  { nm: '캠핑용 접이식 테이블 세트', open: '8월 7일 12:00', want: 642 },
  { nm: '무선 물걸레 청소기 신형', open: '8월 9일 20:00', want: 1907 },
];

/* 단계별 가격 — 인원이 늘수록 싸진다 */
export const TIERS = [
  { n: 50, price: 32000, done: true },
  { n: 150, price: 28000, done: true },
  { n: 250, price: 24900, done: false, now: true },
  { n: 400, price: 21900, done: false },
];

/* 옵션 */
export const OPTIONS = [
  { nm: '5kg (특대과 12~14과)', add: 0, soldout: false },
  { nm: '10kg (특대과 24~28과)', add: 22000, soldout: false },
  { nm: '5kg + 감귤 3kg 세트', add: 9000, soldout: true },
];

/* 실시간 참여 현황 */
export const JOINS = [
  { who: '김*연', at: '방금 전', opt: '5kg', qty: 1 },
  { who: '이*훈', at: '2분 전', opt: '10kg', qty: 1 },
  { who: '박*지', at: '4분 전', opt: '5kg', qty: 2 },
  { who: '최*아', at: '7분 전', opt: '5kg', qty: 1 },
  { who: '정*민', at: '11분 전', opt: '10kg', qty: 1 },
];

export const ST_CLS = {
  '진행 중': 'b-pri', '성사': 'b-ok', '불발': 'b-mut', '배송 중': 'b-acc', '배송 완료': 'b-ok',
  '환불 완료': 'b-mut', '환불 진행 중': 'b-warn', '취소': 'b-mut',
  '검수 대기': 'b-warn', '승인': 'b-ok', '반려': 'b-danger', '모집 중': 'b-pri', '마감': 'b-mut',
  '발주 대기': 'b-warn', '발송 준비': 'b-warn', '발송 완료': 'b-ok',
  '정산 예정': 'b-warn', '정산 완료': 'b-ok', '보류': 'b-danger',
  '답변 대기': 'b-warn', '답변 완료': 'b-ok',
};

/* 내가 참여한 공구 */
export const MY_JOINS = [
  { id: 'd1', st: '진행 중', paid: 24900, opt: '5kg (특대과 12~14과)', qty: 1, at: '2026-08-03', no: 'MG20260803-4417' },
  { id: 'd2', st: '성사', paid: 98000, opt: '기본 3종 세트', qty: 1, at: '2026-07-28', no: 'MG20260728-3902', back: 6000 },
  { id: 'd5', st: '배송 중', paid: 31000, opt: '1kg', qty: 1, at: '2026-07-21', no: 'MG20260721-3110', track: '640123456789' },
  { id: 'd8', st: '불발', paid: 29900, opt: '네이비 / L', qty: 1, at: '2026-07-14', no: 'MG20260714-2884' },
];

/* 진행자가 연 공구 */
export const MY_DEALS = [
  { id: 'd1', st: '모집 중', joined: 247, goal: 300, rev: 6150300, left: 187 },
  { id: 'd3', st: '모집 중', joined: 486, goal: 500, rev: 20120400, left: 21 },
  { id: 'd5', st: '성사', joined: 119, goal: 120, rev: 3689000, left: 0 },
  { id: 'd8', st: '검수 대기', joined: 0, goal: 300, rev: 0, left: 0 },
];

export const REVIEWS = [
  { who: '김하*', r: 5, at: '2026-07-30', opt: '5kg (특대과)', deal: '제주 한라봉 5kg 산지직송',
    t: '마트에서 사는 것보다 확실히 큽니다. 껍질도 잘 까지고 신맛이 거의 없어요. 다음에 또 열리면 참여합니다.', photo: true },
  { who: '이준*', r: 4, at: '2026-07-29', opt: '10kg', deal: '제주 한라봉 5kg 산지직송',
    t: '맛은 좋은데 10kg는 두 명이 먹기엔 많네요. 5kg로 충분할 것 같습니다.', photo: false },
  { who: '박민*', r: 5, at: '2026-07-27', opt: '기본 3종 세트', deal: '독일산 스테인리스 냄비 3종',
    t: '성사되고 3일 만에 왔습니다. 진행자님이 중간중간 알림을 주셔서 기다리는 게 답답하지 않았어요.', photo: true },
  { who: '최윤*', r: 5, at: '2026-07-24', opt: '1kg', deal: '동결건조 닭가슴살 트릿',
    t: '우리 강아지가 제일 좋아하는 간식입니다. 이 가격에 1kg는 어디에도 없어요.', photo: false },
];

export const RATE_DIST = [{ s: 5, n: 318 }, { s: 4, n: 71 }, { s: 3, n: 16 }, { s: 2, n: 5 }, { s: 1, n: 2 }];

export const QNAS = [
  { q: '성사가 안 되면 결제한 돈은 어떻게 되나요?', who: '김*연', at: '2026-08-03', st: '답변 완료', kind: '성사·환불',
    a: '자동으로 전액 환불됩니다. 마감 직후 바로 환불이 걸리고, 카드사에 따라 영업일 기준 2~5일 안에 들어옵니다. 따로 신청하실 것은 없습니다.' },
  { q: '10kg로 바꾸고 싶은데 옵션 변경이 되나요?', who: '이*훈', at: '2026-08-03', st: '답변 완료', kind: '참여·결제',
    a: '마감 전에는 참여를 취소하고 다시 참여하시면 됩니다. 취소는 마감 전까지 수수료 없이 됩니다.' },
  { q: '제주도도 배송되나요? 추가 배송비가 있는지 궁금합니다', who: '박*지', at: '2026-08-04', st: '답변 대기', kind: '배송' },
  { q: '박스 손상 없이 오나요? 지난번에 눌려서 왔어요', who: '최*아', at: '2026-08-04', st: '답변 대기', kind: '배송' },
];

/* 진행자 정산 */
export const SETTLE = [
  { deal: '병풀 진정 앰플 30ml × 3개입', m: '2026-07', gross: 20120400, fee: 1005020, refund: 124200, net: 18991180, st: '정산 예정', pay: '2026-08-12' },
  { deal: '동결건조 닭가슴살 트릿 1kg', m: '2026-07', gross: 3689000, fee: 184450, refund: 0, net: 3504550, st: '정산 완료', pay: '2026-07-28' },
  { deal: '겨울 기모 맨투맨 (7월 1차)', m: '2026-06', gross: 8970000, fee: 448500, refund: 209300, net: 8312200, st: '정산 완료', pay: '2026-07-12' },
];

export const NOTICES = [
  { t: '추석 연휴 배송·정산 일정 안내', at: '2026-08-01', pin: true },
  { t: '조건부 결제 규정 일부 변경 (8/15 시행)', at: '2026-07-24', pin: true },
  { t: '신규 진행자 지원 이벤트 — 첫 공구 수수료 0%', at: '2026-07-18', pin: false },
  { t: '8월 정기 점검 안내 (8/11 02:00~04:00)', at: '2026-07-11', pin: false },
];

export const FAQ = [
  { q: '공동구매는 일반 쇼핑과 뭐가 다른가요?', a: '정해진 인원이 모여야 거래가 성사됩니다. 참여할 때 결제를 하지만, 목표 인원에 못 미치면 자동으로 전액 환불됩니다. 사람이 많이 모일수록 값이 더 내려가는 것도 다른 점입니다.' },
  { q: '성사가 안 되면 어떻게 되나요?', a: '마감 시각에 목표 인원에 못 미치면 그 자리에서 불발 처리되고, 결제하신 금액이 전액 자동 환불됩니다. 따로 신청하실 것은 없고 카드사에 따라 2~5영업일 걸립니다.' },
  { q: '마감 전에 취소할 수 있나요?', a: '네. 마감 전에는 수수료 없이 언제든 취소하실 수 있습니다. 다만 취소하시면 달성률이 그만큼 내려가니, 성사를 기다리는 다른 분들을 위해 신중히 결정해 주세요.' },
  { q: '값이 내려가면 차액은 어떻게 되나요?', a: '참여하신 뒤 인원이 더 모여 다음 단계 가격이 적용되면, 차액은 성사 확정 후 자동으로 환급됩니다. 결제하신 수단으로 그대로 돌려드립니다.' },
  { q: '진행자는 누구인가요?', a: '공구를 여는 사람입니다. 상품을 구해 오고, 참여자를 모으고, 발주와 배송을 챙깁니다. 진행자는 심사를 거쳐 승인된 분만 될 수 있고, 성사율과 후기 평점이 공개됩니다.' },
  { q: '공구 진행자가 뭔가요? 어떻게 되나요?', a: '진행자 시작 안내에서 신청하시면 됩니다. 상품을 구할 수 있는 곳이 있어야 하고, 사업자가 아니어도 되지만 정산을 받으려면 본인 명의 계좌가 필요합니다.' },
];
