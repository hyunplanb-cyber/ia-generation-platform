/* 화면에 들어가는 내용. 여기만 고치고 generate.mjs 를 다시 돌리면 44개 화면이 함께 바뀐다. */

export const SITE = {
  name: '배움터',
  mark: '배',
  tagline: '직장인과 학원 수강생을 위한 온라인 강의 플랫폼',
  company: '(주)배움터 · 대표 김수현 · 서울 마포구 양화로 45',
  biz: '사업자등록번호 123-45-67890 · 통신판매업 2026-서울마포-0451',
  tel: '1588-0000',
  hours: '평일 10:00~18:00 (점심 12:30~13:30)',
  me: { name: '김수현', init: '김', mail: 'sh.kim@example.com', joined: '2026-03-14' },
  teacher: { name: '박지훈', init: '박', title: '데이터 분석 강사' },
};

/* 고객이 쓰는 메뉴 / 운영자가 쓰는 메뉴 — 헤더를 나눈다 */
export const NAV_USER = [
  ['둘러보기', [['HO-01', '홈'], ['CO-01', '강의 탐색']]],
  ['학습', [['CL-01', '내 강의실'], ['CL-03', '강의 재생'], ['CL-07', '질문 게시판'], ['CL-08', '수료증']]],
  ['내 정보', [['MY-01', '마이페이지'], ['MY-02', '수강 이력'], ['TC-01', '강사센터']]],
  ['계정', [['AU-01', '로그인'], ['AU-02', '회원가입']]],
];
export const NAV_ADMIN = [
  ['강사센터', [['TC-01', '강사센터 홈']]],
  ['수업 편성', [['CU-01', '내 강의 목록'], ['CU-02', '강의 개설'], ['CU-03', '커리큘럼 편성'], ['CU-04', '영상 업로드']]],
  ['학생 관리', [['ST-01', '수강생 목록'], ['ST-04', '진도 미달자'], ['ST-05', '알림 발송']]],
  ['출결·평가', [['GR-01', '출석 현황'], ['GR-02', '과제 채점'], ['GR-04', '수료 기준']]],
  ['정산', [['MY-03', '정산 내역']]],
];

export const CATS = [
  { key: '개발', ico: '💻', n: 284 },
  { key: '데이터', ico: '📊', n: 176 },
  { key: '디자인', ico: '🎨', n: 152 },
  { key: '마케팅', ico: '📣', n: 138 },
  { key: '기획', ico: '🗂', n: 96 },
  { key: '외국어', ico: '🌍', n: 214 },
  { key: '재테크', ico: '💰', n: 88 },
  { key: '취미', ico: '🎸', n: 132 },
];

export const LEVELS = ['입문', '초급', '중급', '고급'];

/* 강의 — was(정가) / price(판매가). 무료는 price 0 */
export const COURSES = [
  { id: 'C01', name: '엑셀로 시작하는 실무 데이터 분석', by: '박지훈', cat: '데이터', lv: '입문', rate: 4.9, rv: 1284, st: 4820, was: 132000, price: 79000, hrs: 12, ep: 30, tag: 'BEST' },
  { id: 'C02', name: '파이썬 업무 자동화 30일 완성', by: '이서연', cat: '개발', lv: '초급', rate: 4.8, rv: 962, st: 3140, was: 165000, price: 99000, hrs: 18, ep: 42, tag: 'BEST' },
  { id: 'C03', name: '피그마로 만드는 첫 UI 디자인', by: '최민아', cat: '디자인', lv: '입문', rate: 4.7, rv: 741, st: 2680, was: 118000, price: 69000, hrs: 10, ep: 26 },
  { id: 'C04', name: '검색광고 실전 운영 가이드', by: '정우성', cat: '마케팅', lv: '중급', rate: 4.6, rv: 512, st: 1740, was: 148000, price: 89000, hrs: 14, ep: 32 },
  { id: 'C05', name: '기획자를 위한 SQL 첫걸음', by: '박지훈', cat: '데이터', lv: '입문', rate: 4.9, rv: 1108, st: 4210, was: 128000, price: 0, hrs: 8, ep: 20, tag: '무료' },
  { id: 'C06', name: '하루 20분 비즈니스 영어 회화', by: 'Emily Park', cat: '외국어', lv: '초급', rate: 4.8, rv: 1560, st: 6240, was: 96000, price: 59000, hrs: 20, ep: 60, tag: 'NEW' },
  { id: 'C07', name: '리액트로 만드는 실무 웹 서비스', by: '김도현', cat: '개발', lv: '중급', rate: 4.7, rv: 684, st: 2110, was: 198000, price: 129000, hrs: 24, ep: 54 },
  { id: 'C08', name: '월급쟁이 첫 재테크 수업', by: '한지민', cat: '재테크', lv: '입문', rate: 4.5, rv: 398, st: 1520, was: 88000, price: 49000, hrs: 6, ep: 16 },
  { id: 'C09', name: '통기타 코드 30개로 끝내기', by: '윤태호', cat: '취미', lv: '입문', rate: 4.9, rv: 872, st: 3380, was: 78000, price: 42000, hrs: 9, ep: 24, tag: 'NEW' },
  { id: 'C10', name: '서비스 기획 문서 작성법', by: '오세라', cat: '기획', lv: '초급', rate: 4.6, rv: 456, st: 1280, was: 112000, price: 68000, hrs: 11, ep: 28 },
  { id: 'C11', name: '데이터 시각화 실무 대시보드', by: '박지훈', cat: '데이터', lv: '중급', rate: 4.8, rv: 604, st: 1980, was: 158000, price: 98000, hrs: 15, ep: 34 },
  { id: 'C12', name: '브랜드 로고 디자인 실습', by: '최민아', cat: '디자인', lv: '중급', rate: 4.7, rv: 320, st: 940, was: 138000, price: 84000, hrs: 12, ep: 27 },
];

export const byId = (id) => COURSES.find((c) => c.id === id) || COURSES[0];

/* 내가 듣는 강의 */
export const MYCOURSES = [
  { id: 'C01', done: 12, total: 30, last: '2026-08-05', state: '수강 중', cert: false },
  { id: 'C06', done: 48, total: 60, last: '2026-08-04', state: '수강 중', cert: false },
  { id: 'C05', done: 20, total: 20, last: '2026-07-28', state: '수강 완료', cert: true },
  { id: 'C03', done: 4, total: 26, last: '2026-07-19', state: '수강 중', cert: false },
  { id: 'C08', done: 16, total: 16, last: '2026-06-30', state: '수강 완료', cert: true },
];

/* 커리큘럼 — 챕터별 차시 */
export const CURRICULUM = [
  {
    ch: '1장 · 데이터를 보는 눈', open: true, lessons: [
      { no: 1, t: '이 강의를 듣기 전에', min: 8, done: true, free: true },
      { no: 2, t: '실무에서 쓰는 데이터란', min: 14, done: true, free: true },
      { no: 3, t: '엑셀 환경 설정하기', min: 11, done: true },
      { no: 4, t: '표를 표답게 만드는 규칙', min: 16, done: true },
    ],
  },
  {
    ch: '2장 · 함수로 계산 자동화', open: true, lessons: [
      { no: 5, t: 'SUMIFS로 조건 합계 내기', min: 18, done: true },
      { no: 6, t: 'VLOOKUP과 XLOOKUP 비교', min: 21, done: true },
      { no: 7, t: '오류를 막는 IFERROR', min: 12, done: true },
      { no: 8, t: '날짜 함수로 기간 다루기', min: 15, done: true },
      { no: 9, t: '실습 — 월별 매출표 만들기', min: 24, done: true },
    ],
  },
  {
    ch: '3장 · 피벗 테이블 실전', open: true, lessons: [
      { no: 10, t: '피벗 테이블 처음 만들기', min: 17, done: true },
      { no: 11, t: '값 요약 방식 바꾸기', min: 13, done: true },
      { no: 12, t: '슬라이서로 걸러 보기', min: 14, done: true, now: true },
      { no: 13, t: '피벗 차트로 흐름 보기', min: 19, done: false },
      { no: 14, t: '실습 — 부서별 실적 대시보드', min: 26, done: false },
    ],
  },
  {
    ch: '4장 · 보고서로 만들기', open: false, lessons: [
      { no: 15, t: '보는 사람을 정하고 시작하기', min: 12, done: false },
      { no: 16, t: '한 장에 담는 요약표', min: 18, done: false },
      { no: 17, t: '조건부 서식으로 강조하기', min: 15, done: false },
      { no: 18, t: '자동 갱신되는 보고서', min: 22, done: false },
    ],
  },
];

/* 편성 중인 커리큘럼 (강사 화면) */
export const DRAFT_CURRICULUM = [
  {
    ch: '1장 · 오리엔테이션', lessons: [
      { t: '강의 소개와 목표', min: 9, linked: true, free: true },
      { t: '실습 자료 내려받기', min: 6, linked: true, free: true },
    ],
  },
  {
    ch: '2장 · 기초 다지기', lessons: [
      { t: '작업 환경 만들기', min: 14, linked: true },
      { t: '첫 번째 예제 따라 하기', min: 22, linked: true },
      { t: '자주 하는 실수 세 가지', min: 17, linked: false },
    ],
  },
  {
    ch: '3장 · 실전 프로젝트', lessons: [
      { t: '요구사항 정리하기', min: 19, linked: true },
      { t: '화면 설계와 구현', min: 31, linked: false },
      { t: '마무리와 다음 단계', min: 12, linked: false },
    ],
  },
];

/* 수강생 */
export const STUDENTS = [
  { nm: '김서준', mail: 'seojun@example.com', from: '2026-05-12', pct: 92, hw: 3, last: '2026-08-05', days: 1, st: '수료 가능' },
  { nm: '이하윤', mail: 'hayun@example.com', from: '2026-05-14', pct: 78, hw: 3, last: '2026-08-04', days: 2, st: '진행 중' },
  { nm: '박도윤', mail: 'doyun@example.com', from: '2026-05-15', pct: 64, hw: 2, last: '2026-08-01', days: 5, st: '진행 중' },
  { nm: '최시우', mail: 'siwoo@example.com', from: '2026-05-18', pct: 41, hw: 2, last: '2026-07-24', days: 13, st: '진행 중' },
  { nm: '정지호', mail: 'jiho@example.com', from: '2026-05-20', pct: 12, hw: 0, last: '2026-07-08', days: 29, st: '진도 미달' },
  { nm: '강예린', mail: 'yerin@example.com', from: '2026-05-21', pct: 88, hw: 3, last: '2026-08-06', days: 0, st: '수료 가능' },
  { nm: '윤채원', mail: 'chaewon@example.com', from: '2026-05-22', pct: 55, hw: 1, last: '2026-07-30', days: 7, st: '진행 중' },
  { nm: '임건우', mail: 'gunwoo@example.com', from: '2026-05-25', pct: 0, hw: 0, last: '2026-05-25', days: 73, st: '미시작' },
  { nm: '한소율', mail: 'soyul@example.com', from: '2026-05-26', pct: 96, hw: 3, last: '2026-08-06', days: 0, st: '수료 가능' },
  { nm: '오지안', mail: 'jian@example.com', from: '2026-05-28', pct: 33, hw: 1, last: '2026-07-19', days: 18, st: '진도 미달' },
  { nm: '서주원', mail: 'juwon@example.com', from: '2026-06-01', pct: 71, hw: 2, last: '2026-08-03', days: 3, st: '진행 중' },
  { nm: '문태민', mail: 'taemin@example.com', from: '2026-06-02', pct: 24, hw: 0, last: '2026-07-11', days: 26, st: '진도 미달' },
];

/* 후기 */
export const REVIEWS = [
  { who: '김서준', init: '김', rate: 5, date: '2026-08-01', txt: '실무에서 바로 쓸 수 있는 예제라 좋았어요. 특히 피벗 부분은 세 번 돌려 봤습니다.', help: 42, course: '엑셀로 시작하는 실무 데이터 분석', reply: '끝까지 들어 주셔서 고맙습니다. 3장 실습 파일은 계속 업데이트할게요.', replyAt: '2026-08-02' },
  { who: '이하윤', init: '이', rate: 5, date: '2026-07-28', txt: '설명이 차분해서 초보인 저도 따라갈 수 있었어요. 자막이 정확한 것도 좋았습니다.', help: 31, course: '엑셀로 시작하는 실무 데이터 분석' },
  { who: '박도윤', init: '박', rate: 4, date: '2026-07-22', txt: '전반적으로 만족합니다. 다만 2장 후반부는 조금 빠르게 느껴졌어요.', help: 18, course: '기획자를 위한 SQL 첫걸음' },
  { who: '최시우', init: '최', rate: 5, date: '2026-07-15', txt: '과제 피드백이 상세해서 놀랐습니다. 혼자 공부할 때보다 훨씬 빨리 늘었어요.', help: 27, course: '파이썬 업무 자동화 30일 완성' },
  { who: '강예린', init: '강', rate: 3, date: '2026-07-09', txt: '내용은 좋은데 실습 파일이 최신 버전과 조금 달랐어요. 그 부분만 보완되면 좋겠습니다.', help: 9, course: '피그마로 만드는 첫 UI 디자인' },
  { who: '한소율', init: '한', rate: 5, date: '2026-07-02', txt: '퇴근하고 하루 20분씩 들었는데 두 달 만에 다 들었어요. 분량이 부담 없습니다.', help: 22, course: '하루 20분 비즈니스 영어 회화' },
];

/* 질문 */
export const QNA = [
  { t: 'SUMIFS에서 조건이 3개 이상일 때는 어떻게 하나요?', who: '이하윤', ep: '6차시 · VLOOKUP과 XLOOKUP 비교', at: '2026-08-05', answered: true, mine: false, like: 12, body: '조건이 두 개까지는 잘 되는데 세 개부터 값이 0으로 나옵니다. 범위 크기를 맞춰야 하나요?', reply: '조건 범위와 합계 범위의 행 수가 다르면 0이 나옵니다. 세 조건 모두 같은 행 범위인지 먼저 확인해 보세요. 표 전체를 「표 서식」으로 만들어 두면 범위가 자동으로 맞춰집니다.' },
  { t: '피벗 테이블 슬라이서가 회색으로 비활성입니다', who: '김수현', ep: '12차시 · 슬라이서로 걸러 보기', at: '2026-08-04', answered: true, mine: true, like: 8, body: '슬라이서를 넣으려는데 메뉴가 눌리지 않아요.', reply: '표 안에 커서를 두고 삽입하셔야 합니다. 표 바깥을 클릭한 상태면 비활성으로 보입니다.' },
  { t: '실습 파일이 열리지 않아요 (버전 문제일까요)', who: '정지호', ep: '9차시 · 실습 — 월별 매출표 만들기', at: '2026-08-03', answered: false, mine: false, like: 3, body: '2016 버전인데 파일이 열리다가 멈춥니다.' },
  { t: '수료 조건에 과제도 포함되나요?', who: '김수현', ep: '전체', at: '2026-08-02', answered: false, mine: true, like: 5, body: '진도율만 채우면 되는 줄 알았는데 과제도 봐야 하는지 궁금합니다.' },
  { t: 'XLOOKUP이 없는 버전에서는 무엇을 쓰나요?', who: '박도윤', ep: '6차시 · VLOOKUP과 XLOOKUP 비교', at: '2026-07-31', answered: true, mine: false, like: 19, body: '회사 엑셀에 XLOOKUP이 없습니다.', reply: 'INDEX + MATCH 조합으로 같은 일을 할 수 있습니다. 6차시 마지막 5분에 그 방법을 다뤘어요.' },
];

/* 과제 */
export const ASSIGNMENTS = [
  { nm: '김서준', t: '3장 과제 — 부서별 실적 대시보드', at: '2026-08-05 21:14', late: false, files: 2, score: null },
  { nm: '이하윤', t: '3장 과제 — 부서별 실적 대시보드', at: '2026-08-05 23:47', late: false, files: 1, score: null },
  { nm: '박도윤', t: '3장 과제 — 부서별 실적 대시보드', at: '2026-08-06 09:02', late: true, files: 3, score: null },
  { nm: '강예린', t: '3장 과제 — 부서별 실적 대시보드', at: '2026-08-04 18:30', late: false, files: 2, score: null },
  { nm: '한소율', t: '3장 과제 — 부서별 실적 대시보드', at: '2026-08-04 20:11', late: false, files: 1, score: null },
  { nm: '서주원', t: '2장 과제 — 월별 매출표 만들기', at: '2026-07-28 22:05', late: false, files: 2, score: 92 },
  { nm: '윤채원', t: '2장 과제 — 월별 매출표 만들기', at: '2026-07-29 10:41', late: true, files: 1, score: 78 },
  { nm: '최시우', t: '2장 과제 — 월별 매출표 만들기', at: '2026-07-27 19:20', late: false, files: 3, score: 85 },
];

/* 정산 */
export const SETTLE = [
  { c: '엑셀로 시작하는 실무 데이터 분석', n: 128, gross: 10112000, fee: 2022400, net: 8089600, st: '정산 예정' },
  { c: '기획자를 위한 SQL 첫걸음', n: 246, gross: 0, fee: 0, net: 0, st: '무료 강의' },
  { c: '데이터 시각화 실무 대시보드', n: 41, gross: 4018000, fee: 803600, net: 3214400, st: '정산 예정' },
  { c: '엑셀 함수 특강 (단기)', n: 18, gross: 882000, fee: 176400, net: 705600, st: '정산 완료' },
];

/* 달마다 다른 정산 내역 — 「정산 월」을 고르면 표와 합계가 그 달 것으로 바뀐다.
   ⚠ 2026-08-18 검수: 고르개가 알림만 띄우고 표는 그대로였다. 스펙팩 acts 는
     「표와 위의 합계 금액이 그 기간 것으로 다시 계산된다」고 약속해 두었는데,
     달별 자료가 아예 없어 바꿀 것이 없었다. 그래서 여기서 만든다.
   수수료는 20%, 실수령은 나머지 — 세 달 다 같은 셈법이라 숫자가 서로 맞는다. */
const 정산줄 = (c, n, 단가, st) => {
  const gross = n * 단가;
  const fee = Math.round(gross * 0.2);
  return { c, n, gross, fee, net: gross - fee, st };
};
export const SETTLE_BY_MONTH = {
  '2026년 8월': SETTLE,
  '2026년 7월': [
    정산줄('엑셀로 시작하는 실무 데이터 분석', 104, 79000, '정산 완료'),
    정산줄('기획자를 위한 SQL 첫걸음', 198, 0, '무료 강의'),
    정산줄('데이터 시각화 실무 대시보드', 33, 98000, '정산 완료'),
    정산줄('엑셀 함수 특강 (단기)', 22, 49000, '정산 완료'),
  ],
  '2026년 6월': [
    정산줄('엑셀로 시작하는 실무 데이터 분석', 87, 79000, '정산 완료'),
    정산줄('기획자를 위한 SQL 첫걸음', 151, 0, '무료 강의'),
    정산줄('데이터 시각화 실무 대시보드', 29, 98000, '정산 완료'),
  ],
};

/* 강사가 개설한 강의 */
export const MYTEACH = [
  { id: 'C01', st: '게시 중', stCls: 'b-ok', students: 128, rate: 4.9, done: 62, edited: '2026-08-04' },
  { id: 'C11', st: '게시 중', stCls: 'b-ok', students: 41, rate: 4.8, done: 48, edited: '2026-07-30' },
  { id: 'C05', st: '검수 대기', stCls: 'b-warn', students: 246, rate: 4.9, done: 71, edited: '2026-08-06' },
  { id: 'C02', st: '작성 중', stCls: 'b-mut', students: 0, rate: 0, done: 0, edited: '2026-08-05' },
  { id: 'C12', st: '게시 중지', stCls: 'b-danger', students: 12, rate: 4.4, done: 33, edited: '2026-06-18' },
];

/* 자주 묻는 질문 */
export const FAQ = [
  { q: '수강 기간은 얼마나 되나요?', a: '결제일로부터 6개월 동안 무제한으로 다시 볼 수 있어요. 기간이 끝나기 7일 전에 안내를 보내 드립니다.' },
  { q: '환불은 어떻게 하나요?', a: '결제 후 7일 이내이고 수강률이 10% 미만이면 전액 환불됩니다. 그 이후에는 남은 기간에 따라 부분 환불이 적용돼요.' },
  { q: '수료증은 어떤 조건에서 받나요?', a: '진도율 80% 이상, 과제 3개 제출, 출석 기준 충족 세 가지를 모두 채우면 발급됩니다. 조건은 강의마다 다를 수 있어요.' },
  { q: '모바일에서도 들을 수 있나요?', a: '네, 같은 계정으로 로그인하면 이어보기 지점까지 그대로 이어집니다.' },
  { q: '강사로 지원하려면 무엇이 필요한가요?', a: '활동명, 전문 분야, 경력 증빙 자료가 필요합니다. 심사는 영업일 기준 3~5일 걸려요.' },
];

/* 차트 데이터 */
export const TREND = {
  7: [38, 44, 41, 52, 61, 57, 68],
  30: [22, 28, 31, 26, 34, 41, 38, 44, 39, 47, 52, 48, 55, 61, 58, 64, 59, 66, 71, 68, 74, 69, 77, 82, 78, 85, 81, 88, 92, 96],
  90: [12, 18, 22, 19, 26, 31, 28, 35, 33, 41, 38, 46, 44, 52, 49, 57, 54, 62, 59, 67, 64, 72, 69, 77, 74, 82, 79, 87, 84, 92, 89, 97, 94, 102, 99, 107],
};
export const STUDY_WEEK = [42, 68, 0, 95, 51, 120, 84];
export const STUDY_MONTH = [180, 240, 165, 320, 275, 410, 355, 290, 380, 445, 320, 500];

export const NOTICES = [
  { t: '8월 정산 일정 안내 (8/15 지급)', at: '2026-08-03', new: true },
  { t: '강의 검수 기준이 일부 바뀝니다', at: '2026-07-29', new: true },
  { t: '영상 업로드 최대 용량이 2GB로 늘었어요', at: '2026-07-21' },
  { t: '여름 기획전 참여 강사 모집', at: '2026-07-14' },
];
