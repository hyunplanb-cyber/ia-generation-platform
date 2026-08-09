/* 샘플 데이터 — 해외 투어·티켓·패스 예약 플랫폼 */

export const SITE = {
  name: '트래블나우',
  mark: 'TN',
  tel: '1544-0000',
  hours: '평일 09:00~18:00 · 주말 10:00~17:00 (현지 긴급은 24시간)',
  emergency: '+1 917-000-0000',
  company: '(주)트래블나우  ·  서울 강남구 테헤란로 000  ·  대표 홍길동',
  biz: '사업자등록번호 000-00-00000  ·  통신판매업 제2026-서울강남-0000호  ·  관광사업자 등록 제2026-000호',
};

export const NAV = [
  { label: '홈', id: 'HO0101' },
  { label: '여행지', id: 'HO0201' },
  { label: '투어·티켓', id: 'PR0101' },
  { label: '패스', id: 'PR0401' },
  { label: '기획전', id: 'HO0501' },
  { label: '바우처', id: 'VC0101' },
  { label: '마이페이지', id: 'MY0301' },
  { label: '고객센터', id: 'CS0101' },
];

export const CITIES = [
  { name: '뉴욕', en: 'New York', country: '미국', cnt: 428, tz: '한국보다 13시간 느림', temp: '24°', wx: '맑음' },
  { name: 'LA', en: 'Los Angeles', country: '미국', cnt: 316, tz: '한국보다 16시간 느림', temp: '27°', wx: '구름 조금' },
  { name: '칸쿤', en: 'Cancun', country: '멕시코', cnt: 184, tz: '한국보다 14시간 느림', temp: '31°', wx: '소나기' },
  { name: '라스베이거스', en: 'Las Vegas', country: '미국', cnt: 221, tz: '한국보다 16시간 느림', temp: '35°', wx: '맑음' },
  { name: '파리', en: 'Paris', country: '프랑스', cnt: 392, tz: '한국보다 7시간 느림', temp: '22°', wx: '흐림' },
  { name: '로마', en: 'Rome', country: '이탈리아', cnt: 268, tz: '한국보다 7시간 느림', temp: '29°', wx: '맑음' },
  { name: '방콕', en: 'Bangkok', country: '태국', cnt: 512, tz: '한국보다 2시간 느림', temp: '33°', wx: '소나기' },
  { name: '오사카', en: 'Osaka', country: '일본', cnt: 604, tz: '한국과 같음', temp: '31°', wx: '맑음' },
];

/* cat: tour | ticket | traffic | pass */
export const PRODUCTS = [
  { id: 'P01', name: '뉴욕 자유의 여신상 크루즈 + 엘리스섬 입장', city: '뉴욕', cat: 'tour', dur: '3시간', rating: 4.8, rv: 2841, price: 68000, was: 92000, instant: true, ko: true, pickup: false, left: 12, meet: '배터리파크 11번 부두', with: '가족' },
  { id: 'P02', name: '뉴욕 3대 전망대 통합 입장권 (엠파이어·서밋·탑오브더락)', city: '뉴욕', cat: 'ticket', dur: '자유 이용', rating: 4.9, rv: 5120, price: 128000, was: 178000, instant: true, ko: false, pickup: false, left: 40, meet: '각 전망대 현장' },
  { id: 'P03', name: '뉴욕 근교 우드베리 아웃렛 왕복 셔틀', city: '뉴욕', cat: 'traffic', dur: '왕복 9시간', rating: 4.6, rv: 1204, price: 42000, was: 52000, instant: true, ko: true, pickup: true, left: 3, meet: '32번가 한인타운' },
  { id: 'P04', name: '뉴욕 브루클린 야경 & 덤보 사진 투어', city: '뉴욕', cat: 'tour', dur: '4시간', rating: 4.9, rv: 936, price: 79000, was: 98000, instant: false, ko: true, pickup: true, left: 5, meet: '브루클린브리지역 1번 출구', with: '연인' },
  { id: 'P05', name: 'LA 유니버설 스튜디오 1일 입장권', city: 'LA', cat: 'ticket', dur: '자유 이용', rating: 4.7, rv: 3388, price: 152000, was: 189000, instant: true, ko: false, pickup: false, left: 60, meet: '유니버설 시티워크 입구' },
  { id: 'P06', name: 'LA 그리피스 천문대 + 할리우드 사인 반일 투어', city: 'LA', cat: 'tour', dur: '5시간', rating: 4.7, rv: 1512, price: 88000, was: 112000, instant: true, ko: true, pickup: true, left: 8, meet: '호텔 픽업 또는 유니온스테이션', with: '친구' },
  { id: 'P07', name: '칸쿤 세노테 3곳 + 치첸이트사 일일투어', city: '칸쿤', cat: 'tour', dur: '12시간', rating: 4.8, rv: 742, price: 148000, was: 195000, instant: false, ko: true, pickup: true, left: 2, meet: '호텔존 픽업', with: '가족' },
  { id: 'P08', name: '칸쿤 이슬라무헤레스 카타마란 스노클링', city: '칸쿤', cat: 'tour', dur: '8시간', rating: 4.6, rv: 588, price: 112000, was: 140000, instant: true, ko: false, pickup: true, left: 16, meet: '푸에르토후아레스 항구' },
  { id: 'P09', name: '라스베이거스 그랜드캐니언 경비행기 + 헬기', city: '라스베이거스', cat: 'tour', dur: '7시간', rating: 4.9, rv: 1088, price: 468000, was: 540000, instant: false, ko: true, pickup: true, left: 4, meet: '볼더시티 공항', with: '연인' },
  { id: 'P10', name: '파리 루브르 박물관 우선입장 + 한국어 가이드', city: '파리', cat: 'ticket', dur: '2시간 30분', rating: 4.8, rv: 4210, price: 72000, was: 89000, instant: true, ko: true, pickup: false, left: 22, meet: '피라미드 앞 집합' },
  { id: 'P11', name: '파리 몽생미셸 당일 투어 (한국어)', city: '파리', cat: 'tour', dur: '13시간', rating: 4.7, rv: 1866, price: 168000, was: 198000, instant: false, ko: true, pickup: false, left: 6, meet: '오페라역 집합', with: '가족' },
  { id: 'P12', name: '로마 바티칸 박물관 + 시스티나 예배당 스킵더라인', city: '로마', cat: 'ticket', dur: '3시간', rating: 4.8, rv: 3092, price: 82000, was: 104000, instant: true, ko: true, pickup: false, left: 30, meet: '바티칸 박물관 정문' },
  { id: 'P13', name: '방콕 아유타야 유적 + 수상시장 일일투어', city: '방콕', cat: 'tour', dur: '10시간', rating: 4.6, rv: 2410, price: 58000, was: 78000, instant: true, ko: true, pickup: true, left: 18, meet: '카오산로드 또는 호텔 픽업', with: '친구' },
  { id: 'P14', name: '오사카 주유패스 2일권', city: '오사카', cat: 'pass', dur: '2일', rating: 4.8, rv: 8820, price: 52000, was: 60000, instant: true, ko: true, pickup: false, left: 99, meet: '간사이공항 카운터' },
];

export const CAT_LABEL = { tour: '투어', ticket: '입장권', traffic: '교통', pass: '패스' };

export const PASS = {
  name: '뉴욕 시티 익스플로러 패스',
  save: 68,
  price2: 148000, price3: 189000, price5: 248000,
  spots: [
    { name: '엠파이어스테이트 빌딩 전망대', price: 62000 },
    { name: '탑오브더락 전망대', price: 58000 },
    { name: '서밋 원 밴더빌트', price: 64000 },
    { name: '자유의 여신상 크루즈', price: 42000 },
    { name: '현대미술관 MoMA', price: 38000 },
    { name: '9/11 메모리얼 뮤지엄', price: 42000 },
    { name: '인트레피드 해양항공우주 박물관', price: 40000 },
    { name: '뉴욕 식물원', price: 36000 },
  ],
  reserveNeeded: [
    { name: '서밋 원 밴더빌트', note: '시간대 지정 필수 · 주말은 2주 전 마감', urgent: true },
    { name: '자유의 여신상 크루즈', note: '탑승 회차 사전 지정 필요', urgent: false },
    { name: '9/11 메모리얼 뮤지엄', note: '무료 입장 시간대만 예약 필요', urgent: false },
  ],
};

export const REVIEWS = [
  { who: '여행하는곰', init: '곰', rate: 5, date: '2026.07.12', with: '가족', pics: 2, help: 42, txt: '아이랑 같이 갔는데 가이드님이 아이 눈높이로 설명해주셔서 지루해하지 않았어요. 집합 장소도 지도로 미리 보내주셔서 헤매지 않았습니다.', prod: 'P01' },
  { who: 'jinnyy', init: 'J', rate: 5, date: '2026.07.09', with: '연인', pics: 3, help: 31, txt: '야경 시간에 맞춰 동선을 짜주셔서 사진이 정말 잘 나왔어요. 삼각대도 빌려주셨습니다. 다음에 또 신청할게요.', prod: 'P04' },
  { who: '민트초코', init: '민', rate: 4, date: '2026.07.05', with: '친구', pics: 0, help: 12, txt: '전망대는 좋았지만 주말 오후라 줄이 길었어요. 평일 오전으로 예약하시는 걸 추천합니다. 통합권 자체는 확실히 이득이에요.', prod: 'P02' },
  { who: 'travel_kim', init: 'K', rate: 5, date: '2026.06.28', with: '혼자', pics: 1, help: 27, txt: '혼자 갔는데도 편했어요. 픽업 시간이 정확했고 중간에 자유시간이 넉넉해서 원하는 곳을 더 볼 수 있었습니다.', prod: 'P06' },
  { who: '하늘여행', init: '하', rate: 4, date: '2026.06.21', with: '가족', pics: 2, help: 18, txt: '세노테 물이 정말 맑았습니다. 이동 시간이 길어서 아이가 좀 힘들어했는데, 차 안에서 잘 쉴 수 있게 챙겨주셨어요.', prod: 'P07' },
  { who: 'seoulmate', init: 'S', rate: 5, date: '2026.06.15', with: '친구', pics: 4, help: 55, txt: '우선입장이라 줄을 아예 안 섰어요. 한국어 가이드 설명이 알차서 그림 하나하나 기억에 남습니다.', prod: 'P10' },
];

export const RATE_DIST = [
  { s: 5, n: 2180 }, { s: 4, n: 512 }, { s: 3, n: 108 }, { s: 2, n: 27 }, { s: 1, n: 14 },
];

export const COURSES = [
  { name: '2박 3일 첫 방문 코스', desc: '전망대 · 크루즈 · 브루클린 야경까지 핵심만', days: 3, cnt: 6, price: 328000 },
  { name: '미술관 하루 코스', desc: 'MoMA · 메트로폴리탄 · 첼시 갤러리 산책', days: 1, cnt: 3, price: 128000 },
  { name: '아이와 함께 4일 코스', desc: '자연사박물관 · 센트럴파크 · 근교 아웃렛', days: 4, cnt: 7, price: 412000 },
];

export const PARTNERS = [
  { shop: '코리아타운 순두부', benefit: '음료 무료 제공', area: '32번가' },
  { shop: '브루클린 로스터스', benefit: '아메리카노 10% 할인', area: '덤보' },
  { shop: '첼시마켓 랍스터플레이스', benefit: '랍스터롤 15% 할인', area: '첼시' },
  { shop: '메이시스 백화점', benefit: '방문자 10% 쿠폰', area: '헤럴드스퀘어' },
];

export const TIPS = [
  { tag: '준비', title: '미국 입국 ESTA, 언제까지 신청해야 할까', read: '3분' },
  { tag: '현지', title: '뉴욕 지하철 요금과 옴니 태그 쓰는 법', read: '4분' },
  { tag: '팁', title: '레스토랑 팁 계산, 실제로 얼마 주면 되나요', read: '2분' },
  { tag: '안전', title: '여권 분실했을 때 현지에서 하는 일 3단계', read: '5분' },
];

export const FAQS = {
  예약: [
    { q: '예약하면 바로 확정되나요?', a: '“즉시확정” 배지가 있는 상품은 결제 직후 확정되고 바우처가 바로 발급됩니다. 그 외 상품은 현지 업체 좌석 확인이 필요해 보통 24시간 안에 확정됩니다.' },
    { q: '이름을 잘못 입력했어요.', a: '출발 3일 전까지는 예약 상세 > 여행자 정보 수정에서 직접 바꿀 수 있습니다. 그 이후에는 현지 승인이 필요하니 1:1 문의로 알려주세요.' },
    { q: '아동 요금 기준이 어떻게 되나요?', a: '이용일 기준 만 나이로 계산합니다. 상품마다 기준이 달라 상세 화면의 요금 안내를 꼭 확인해주세요.' },
  ],
  결제: [
    { q: '해외 발행 카드로 결제할 수 있나요?', a: '가능합니다. 결제 화면의 “해외 발행 카드” 탭을 이용하세요. 카드사에서 해외결제가 차단돼 있으면 승인이 거절될 수 있습니다.' },
    { q: '결제했는데 확정 문자가 안 와요.', a: '결제 후 최대 10분 정도 걸릴 수 있습니다. 마이페이지 > 예약 내역에 건이 보이면 정상 접수된 상태입니다.' },
    { q: '쿠폰과 포인트를 같이 쓸 수 있나요?', a: '쿠폰 1장과 포인트는 함께 사용할 수 있습니다. 쿠폰끼리는 중복 사용이 되지 않습니다.' },
  ],
  '취소·환불': [
    { q: '무료 취소 기한은 언제까지인가요?', a: '상품 유형에 따라 다릅니다. 투어는 보통 출발 7일 전까지 100% 환불되며, 기준 시각은 현지 시각입니다.' },
    { q: '환불은 얼마나 걸리나요?', a: '카드는 3~5영업일, 간편결제는 1~3영업일이 걸립니다. 해외 발행 카드는 카드사 사정으로 더 걸릴 수 있습니다.' },
    { q: '일부 인원만 취소할 수 있나요?', a: '가능한 상품이라면 예약 취소 신청에서 부분 취소를 선택하세요. 최소 출발 인원에 영향이 있으면 안내가 표시됩니다.' },
  ],
  바우처: [
    { q: '바우처를 꼭 인쇄해야 하나요?', a: '대부분 화면 제시로 충분합니다. 다만 현지에서 인터넷이 끊길 수 있으니 이미지로 저장해두시길 권합니다.' },
    { q: 'QR이 안 열려요.', a: '바우처 상세에서 새로고침해보시고, 계속 안 되면 예약번호를 직원에게 보여주면 확인 가능합니다.' },
  ],
  '현지 이용': [
    { q: '집합 장소를 못 찾겠어요.', a: '바우처 상세의 [길찾기]를 누르면 지도 앱으로 좌표가 전달됩니다. 현지어 주소 복사 기능으로 택시 기사에게 보여줄 수도 있습니다.' },
    { q: '가이드와 연락이 안 돼요.', a: '바우처에 적힌 현지 비상 연락처로 전화해주세요. 연결이 안 되면 고객센터 긴급 회선으로 24시간 응대합니다.' },
    { q: '비가 와서 투어가 취소됐어요.', a: '현지 사정으로 취소되면 전액 환불됩니다. 별도 신청 없이 3영업일 안에 처리됩니다.' },
  ],
};

export const COUPONS = [
  { v: '10%', name: '첫 예약 감사 쿠폰', min: '30,000원 이상', until: '2026.08.31', dday: 32, target: '전 상품', state: 'ok' },
  { v: '5,000원', name: '여름 야경 기획전 쿠폰', min: '80,000원 이상', until: '2026.08.02', dday: 3, target: '기획전 대상 상품', state: 'soon' },
  { v: '15%', name: '패스 상품 단독 쿠폰', min: '100,000원 이상', until: '2026.08.10', dday: 11, target: '패스 카테고리', state: 'ok' },
  { v: '3,000원', name: '후기 작성 감사 쿠폰', min: '제한 없음', until: '2026.07.20', dday: -10, target: '전 상품', state: 'expired' },
];

export const BOOKINGS = [
  { no: 'TN2607-284193', prod: 'P01', date: '2026.08.03(월) 14:00', pax: '성인 2 · 아동 1', amt: 204000, state: '확정', dday: 'D-4', pay: '신한카드 (1234)' },
  { no: 'TN2607-284188', prod: 'P04', date: '2026.08.04(화) 18:30', pax: '성인 2', amt: 158000, state: '대기', dday: 'D-5', pay: '카카오페이' },
  { no: 'TN2607-284170', prod: 'P02', date: '2026.08.05(수) 자유 이용', pax: '성인 2 · 아동 1', amt: 384000, state: '확정', dday: 'D-6', pay: '신한카드 (1234)' },
  { no: 'TN2606-271004', prod: 'P10', date: '2026.06.18(목) 10:00', pax: '성인 2', amt: 144000, state: '이용 완료', dday: '', pay: '국민카드 (5678)' },
  { no: 'TN2606-268820', prod: 'P13', date: '2026.06.02(화) 07:30', pax: '성인 4', amt: 232000, state: '이용 완료', dday: '', pay: '네이버페이' },
  { no: 'TN2605-259911', prod: 'P08', date: '2026.05.21(목) 09:00', pax: '성인 2', amt: 224000, state: '취소', dday: '', pay: '신한카드 (1234)', refund: '환불 완료 · 2026.05.16' },
];

export const VOUCHERS = [
  { no: 'TN2607-284193', prod: 'P01', use: '2026.08.03(월) 14:00', pax: '성인 2 · 아동 1', state: '사용 예정' },
  { no: 'TN2607-284170', prod: 'P02', use: '2026.08.05(수) 자유 이용', pax: '성인 2 · 아동 1', state: '사용 예정' },
  { no: 'TN2607-284188', prod: 'P04', use: '2026.08.04(화) 18:30', pax: '성인 2', state: '발급 대기' },
  { no: 'TN2606-271004', prod: 'P10', use: '2026.06.18(목) 10:00', pax: '성인 2', state: '사용 완료', usedAt: '2026.06.18 09:52 · 루브르 피라미드 입구' },
  { no: 'TN2605-259911', prod: 'P08', use: '2026.05.21(목) 09:00', pax: '성인 2', state: '만료', expired: '2026.05.21' },
];

export const NOTIFS = [
  { kind: '예약', ic: '✓', title: '예약이 확정되었어요', body: '뉴욕 자유의 여신상 크루즈 · 8월 3일 14:00', at: '2시간 전', unread: true, go: 'MY0501' },
  { kind: '공지', ic: '!', title: '칸쿤 지역 기상 악화 안내', body: '8월 1~2일 일부 해상 투어가 지연·취소될 수 있어요', at: '5시간 전', unread: true, danger: true, go: 'CS0402' },
  { kind: '예약', ic: '🎫', title: '바우처가 발급되었어요', body: '뉴욕 3대 전망대 통합 입장권 · 미리 저장해두세요', at: '어제', unread: true, go: 'VC0201' },
  { kind: '혜택', ic: '%', title: '찜한 상품이 20% 할인 중이에요', body: '파리 몽생미셸 당일 투어 · 8월 5일까지', at: '어제', unread: false, acc: true, go: 'PR0801' },
  { kind: '예약', ic: '⏰', title: '내일 출발이에요', body: '집합 장소와 시간을 다시 확인해주세요 · 배터리파크 11번 부두 13:45', at: '2일 전', unread: false, go: 'MY0304' },
  { kind: '혜택', ic: '🎟', title: '쿠폰이 3일 뒤 만료돼요', body: '여름 야경 기획전 쿠폰 5,000원', at: '3일 전', unread: false, go: 'MY0901' },
  { kind: '공지', ic: '📢', title: '개인정보 처리방침 개정 안내', body: '2026년 8월 15일부터 적용됩니다', at: '1주 전', unread: false, go: 'CS0401' },
];

export const NOTICES = [
  { cat: '현지소식', title: '칸쿤 지역 기상 악화로 일부 투어가 지연되고 있어요', date: '2026.07.29', pin: true, danger: true,
    body: '7월 28일부터 카리브 해상에 열대성 저기압이 접근하고 있습니다. 8월 1~2일 출발하는 카타마란·스노클링 등 해상 투어는 현지 판단에 따라 지연 또는 취소될 수 있습니다. 취소 시 전액 환불되며 별도 신청은 필요하지 않습니다.' },
  { cat: '운영', title: '8월 1일 새벽 시스템 점검 안내 (02:00~04:00)', date: '2026.07.27',
    body: '점검 시간에는 예약·결제가 일시 중단됩니다. 바우처 열람은 오프라인 저장본으로 가능합니다.' },
  { cat: '이벤트', title: '여름 야경 특집 기획전 오픈 — 최대 35% 할인', date: '2026.07.24',
    body: '8월 1일까지 야경 투어 62개 상품을 최대 35% 할인합니다. 기획전 전용 쿠폰도 함께 받아가세요.' },
  { cat: '현지소식', title: '파리 교통 파업 예고 (8월 6~7일)', date: '2026.07.22',
    body: '지하철 일부 노선이 감축 운행될 예정입니다. 집합 시간에 여유를 두고 출발해주세요.' },
  { cat: '운영', title: '개인정보 처리방침 개정 안내', date: '2026.07.18',
    body: '위탁 업체 목록이 추가되었습니다. 2026년 8월 15일부터 적용됩니다.' },
];

export const INQUIRIES = [
  { title: '픽업 호텔을 변경하고 싶어요', type: '예약 변경', date: '2026.07.28', state: '답변 완료', prod: 'P07',
    q: '8월 3일 세노테 투어 픽업 호텔을 하드록 호텔에서 리우 칸쿤으로 바꾸고 싶습니다. 가능한가요?',
    a: '리우 칸쿤은 픽업 가능 구역에 포함되어 있어 변경해두었습니다. 픽업 시각은 07:10으로 20분 앞당겨지니 참고해주세요. 변경된 바우처는 방금 이메일로 다시 보냈습니다.',
    at: '2026.07.28 16:41', by: '고객경험팀 이서연' },
  { title: '영문명이 여권과 한 글자 다릅니다', type: '바우처', date: '2026.07.26', state: '답변 완료', prod: 'P01',
    q: 'HONG GILDONG 으로 넣어야 하는데 HONG GILDON 으로 등록됐어요. 현지에서 문제가 될까요?',
    a: '크루즈 상품은 이름 확인이 엄격하지 않지만, 안전하게 정정 처리해두었습니다. 재발급된 바우처를 확인해주세요.',
    at: '2026.07.26 11:20', by: '고객경험팀 박도윤' },
  { title: '환불이 아직 안 들어왔어요', type: '취소·환불', date: '2026.07.29', state: '답변 대기', prod: 'P08',
    q: '5월 21일 취소한 건인데 카드 취소가 확인되지 않습니다.' },
];

export const SEARCH_POPULAR = ['뉴욕 전망대', '칸쿤 세노테', '유니버설 스튜디오', '몽생미셸', '오사카 주유패스', '그랜드캐니언'];

export const TRIP = {
  city: '뉴욕', period: '2026.08.03 ~ 08.07', cnt: 5, dday: 'D-4',
  days: [
    { label: '8월 3일 (월)', wx: '맑음 24°', local: '현지 08:00 기준 · 한국보다 13시간 느려요',
      items: [
        { t: '09:30', dur: '3시간', name: '뉴욕 3대 전망대 — 서밋 원 밴더빌트', meet: '그랜드센트럴 42번가 입구', pax: '성인 2 · 아동 1', state: '확정' },
        { t: '14:00', dur: '3시간', name: '자유의 여신상 크루즈 + 엘리스섬', meet: '배터리파크 11번 부두', pax: '성인 2 · 아동 1', state: '확정', gap: '앞 일정에서 이동에 40분 걸려요. 조금 빠듯해요' },
        { t: '19:00', dur: null, name: '이 시간에 갈 만한 곳', ghost: true, sug: '브루클린 야경 사진 투어 · 79,000원' },
      ] },
    { label: '8월 4일 (화)', wx: '구름 26°', local: '현지 08:00 기준 · 한국보다 13시간 느려요',
      items: [
        { t: '18:30', dur: '4시간', name: '브루클린 야경 & 덤보 사진 투어', meet: '브루클린브리지역 1번 출구', pax: '성인 2', state: '대기' },
      ] },
    { label: '8월 5일 (수)', wx: '맑음 27°', local: '현지 08:00 기준 · 한국보다 13시간 느려요',
      items: [
        { t: '10:00', dur: '9시간', name: '우드베리 아웃렛 왕복 셔틀', meet: '32번가 한인타운', pax: '성인 2', state: '확정' },
        { t: '17:00', dur: '2시간', name: '탑오브더락 전망대 (통합권)', meet: '록펠러센터 지하 1층', pax: '성인 2 · 아동 1', state: '확정', overlap: '10:00~19:00 일정과 겹쳐요' },
      ] },
  ],
};

export const REFUND_RULES = {
  tour: [
    { when: '출발 8일 전까지', rate: '100%', fee: '없음' },
    { when: '출발 7~4일 전', rate: '70%', fee: '30%' },
    { when: '출발 3~2일 전', rate: '50%', fee: '50%' },
    { when: '출발 1일 전 ~ 당일', rate: '0%', fee: '전액', now: true },
  ],
  ticket: [
    { when: '이용일 전일까지', rate: '100%', fee: '없음' },
    { when: '이용일 당일', rate: '0%', fee: '전액' },
    { when: '이용 후 · 미사용', rate: '0%', fee: '전액' },
  ],
  pass: [
    { when: '첫 사용 전 · 구매 후 90일 내', rate: '100%', fee: '없음' },
    { when: '첫 사용 후', rate: '0%', fee: '전액' },
    { when: '유효기간 만료 후', rate: '0%', fee: '전액' },
  ],
};

export function P(id) { return PRODUCTS.find((p) => p.id === id); }
