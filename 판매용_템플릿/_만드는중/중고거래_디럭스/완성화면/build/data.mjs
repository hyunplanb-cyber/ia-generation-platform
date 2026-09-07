/* 화면에 채워 넣는 예시 내용.
   실제 데이터가 아니라 "이 자리에 무엇이 들어가는지" 보여 주는 값이다.
   한 번 정한 이름·숫자는 화면이 달라져도 같게 쓴다 — 그래야 흐름이 이어져 보인다.

   ⛔ 숫자 하나를 고치면 그 숫자로 계산되는 값을 «전부» 따라가라.
     매물 수·건수·합계는 여기 한곳에서 세어 내보낸다. 화면에서 손으로 적지 않는다.
     (2026-08-19 에 반쪽만 고쳐서 같은 강의가 화면마다 67%·40% 로 갈린 적이 있다.) */

export const SITE = {
  name: '우리동네장터',
  mark: '장',
  tagline: '가까운 이웃과 안전하게 사고파세요',
  company: '(주)우리동네장터  대표 김하늘  서울시 강남구 테헤란로 152',
  biz: '사업자등록 123-45-67890  통신판매중개업 2026-서울강남-01234',
  tel: '1544-0000',
  hours: '평일 09:00–18:00 (점심 12:00–13:00) · 주말·공휴일 휴무',
  me: '김하늘',
  myNick: '하늘이네',
  myTown: '역삼동',
  myManner: 42.5,
};

/* 손님(회원) 쪽 GNB — navByAudience.customer 와 같은 순서.
   ⚠ 이 장터에서는 «사는 쪽»과 «파는 쪽»이 같은 회원이다.
     그래서 판매하기·끌올이 손님 메뉴에 있다. 운영자 메뉴만 따로 뗀다. */
export const NAV = [
  { id: 'HO-01', label: '홈' },
  { id: 'SE-02', label: '매물 찾기' },
  { id: 'SL-01', label: '판매하기' },
  { id: 'CH-01', label: '채팅' },
  { id: 'PA-05', label: '거래' },
  { id: 'MY-01', label: '마이' },
];

/* 운영자 쪽 GNB — navByAudience.owner */
export const NAV_PRO = [
  { id: 'AD-01', label: '신고 처리' },
  { id: 'AD-03', label: '금지품목·규칙' },
  { id: 'AD-04', label: '정산·분쟁' },
];

/* 상태 배지 색 — 한곳에서 정한다. 화면마다 다른 색을 쓰면 같은 말이 달라 보인다. */
export const ST_CLS = {
  판매중: 'b-pri', 예약중: 'b-acc', 거래완료: 'b-mut', 숨김: 'b-mut',
  진행중: 'b-pri', 취소: 'b-mut', 완료: 'b-ok',
  대기: 'b-warn', 처리중: 'b-pri', 보류: 'b-mut',
  높음: 'b-danger', 보통: 'b-warn', 낮음: 'b-mut',
  끌올: 'b-acc', 안전결제: 'b-ok', 직거래: 'b-mut',
  정산대기: 'b-warn', 정산완료: 'b-ok', 분쟁: 'b-danger',
  이야기중: 'b-mut', 배송중: 'b-pri', 도착: 'b-ok',
};

/* ── 카테고리 12종 ───────────────────────────────── */
export const CATS = [
  { key: 'digital', ic: '📱', nm: '디지털기기', sub: '휴대폰·노트북·카메라', n: 1204 },
  { key: 'home', ic: '🧺', nm: '생활가전', sub: '냉장고·세탁기·청소기', n: 862 },
  { key: 'furni', ic: '🛋', nm: '가구·인테리어', sub: '책상·의자·조명', n: 731 },
  { key: 'cloth', ic: '👕', nm: '의류', sub: '남성·여성·신발', n: 1533 },
  { key: 'baby', ic: '🧸', nm: '유아용품', sub: '유모차·카시트·장난감', n: 418 },
  { key: 'book', ic: '📚', nm: '도서', sub: '수험서·소설·만화', n: 594 },
  { key: 'sport', ic: '🏸', nm: '스포츠', sub: '자전거·헬스·구기', n: 386 },
  { key: 'hobby', ic: '🎧', nm: '취미', sub: '악기·게임·피규어', n: 507 },
  { key: 'pet', ic: '🐾', nm: '반려동물용품', sub: '켄넬·급식기·의류', n: 212 },
  { key: 'plant', ic: '🪴', nm: '식물', sub: '화분·씨앗·원예용품', n: 148 },
  { key: 'ticket', ic: '🎫', nm: '티켓·교환권', sub: '공연·상품권', n: 176 },
  { key: 'etc', ic: '⋯', nm: '기타', sub: '직접 적기', n: 429 },
];
/** 전체 매물 수 — 카테고리 합에서 «세어» 낸다. 손으로 적지 않는다. */
export const TOTAL_ITEMS = CATS.reduce((a, c) => a + c.n, 0);

/* 소분류 — SL-01 에서 대분류를 고르면 펼쳐진다 */
export const SUBCATS = {
  digital: [
    { nm: '휴대폰', hot: true }, { nm: '노트북', hot: true }, { nm: '태블릿' },
    { nm: '카메라' }, { nm: '게임기' }, { nm: '음향기기' }, { nm: 'PC 부품' },
  ],
  home: [
    { nm: '냉장고' }, { nm: '세탁기' }, { nm: '청소기', hot: true },
    { nm: '에어컨' }, { nm: '주방가전' },
  ],
  cloth: [
    { nm: '남성 의류' }, { nm: '여성 의류', hot: true }, { nm: '신발' },
    { nm: '가방' }, { nm: '시계·주얼리' },
  ],
};

/** 분류별 자주 찾는 말 */
export const CAT_WORDS = {
  digital: ['아이폰', '갤럭시', '맥북', '아이패드', '닌텐도', '에어팟', '모니터', '그래픽카드'],
  home: ['무선청소기', '건조기', '에어프라이어', '공기청정기'],
  cloth: ['패딩', '운동화', '가죽자켓', '원피스'],
};

export const HOT_WORDS = ['무선청소기', '아이패드', '유아 책상', '자전거', '캠핑 의자'];
/* 인기 검색어 — 순위와 변동. 목록과 배지가 같은 자료를 쓴다 */
export const RANK_WORDS = [
  { w: '무선청소기', d: 0 }, { w: '아이패드', d: 2 }, { w: '자전거', d: -1 },
  { w: '캠핑 의자', d: 1 }, { w: '유아 책상', d: 0 }, { w: '에어팟', d: -2 },
  { w: '닌텐도 스위치', d: 3 }, { w: '모니터', d: 0 }, { w: '패딩', d: -1 }, { w: '책장', d: 1 },
];
export const RECENT_WORDS = ['무선청소기', '아이패드 10세대', '책상', '유아 카시트'];

/* ── 물건 상태 5단계 ─────────────────────────────── */
export const CONDS = [
  { k: '새것', d: '뜯지 않았거나 한 번도 안 썼어요', tip: '박스와 구성품이 그대로 있다면 함께 찍어 주세요' },
  { k: '거의 새것', d: '몇 번 썼지만 흠이 없어요', tip: '언제 샀고 몇 번 썼는지 적어 주세요' },
  { k: '사용감 있음', d: '쓴 자국이 보여요', tip: '흠집이 있는 곳을 따로 찍어 주면 다툼이 줄어요' },
  { k: '고장', d: '제대로 동작하지 않아요', tip: '어디가 어떻게 고장인지 꼭 적어 주세요 (고지 의무)' },
  { k: '부품용', d: '부품을 빼 쓰는 용도예요', tip: '쓸 수 있는 부품이 무엇인지 적어 주세요' },
];

/* ── 동네 ────────────────────────────────────────── */
export const TOWNS = {
  mine: '역삼동',
  ranges: [
    { k: '내 동네', d: '역삼동', towns: ['역삼동'], n: 1284 },
    { k: '가까운 동네', d: '역삼동 + 3곳', towns: ['역삼동', '논현동', '삼성동', '대치동'], n: 3420 },
    { k: '조금 먼 동네', d: '역삼동 + 8곳', towns: ['역삼동', '논현동', '삼성동', '대치동', '청담동', '신사동', '도곡동', '개포동', '수서동'], n: 7188 },
  ],
};

/* ── 회원 ────────────────────────────────────────── */
/* 매너 점수는 36.5 에서 시작한다. 후기가 쌓여 오르내린다. */
export const USERS = [
  { id: 'u1', nick: '초록나무', town: '역삼동', manner: 45.2, sold: 38, bought: 12, resp: 96, respMin: 8, again: 92, since: '2023년 5월', tags: ['본인인증', '동네인증'] },
  { id: 'u2', nick: '민트초코', town: '논현동', manner: 39.8, sold: 12, bought: 24, resp: 88, respMin: 22, again: 84, since: '2024년 2월', tags: ['본인인증'] },
  { id: 'u3', nick: '해질녘', town: '삼성동', manner: 41.0, sold: 21, bought: 9, resp: 92, respMin: 14, again: 88, since: '2023년 11월', tags: ['본인인증', '동네인증'] },
  { id: 'u4', nick: '달빛창가', town: '대치동', manner: 36.5, sold: 2, bought: 1, resp: 60, respMin: 95, again: 50, since: '2026년 8월', tags: [] },
  { id: 'u5', nick: '바람개비', town: '역삼동', manner: 34.2, sold: 7, bought: 3, resp: 71, respMin: 46, again: 62, since: '2025년 4월', tags: ['본인인증'] },
  { id: 'u6', nick: '하늘이네', town: '역삼동', manner: 42.5, sold: 24, bought: 11, resp: 92, respMin: 12, again: 88, since: '2024년 3월', tags: ['본인인증', '동네인증'] },
];
export const userBy = (id) => USERS.find((u) => u.id === id) || USERS[0];

/* ── 매물 ────────────────────────────────────────────
   화면 전체에서 같은 물건이 나온다. 값·동네·시각이 화면마다 달라지면 안 된다.
   min = 올라온 지 몇 분. 「3분 전」·정렬(최신순)이 이 값 하나에서 나온다. */
export const ITEMS = [
  { id: 'i1', t: '다이슨 무선청소기 V11 팝니다', price: 320000, cat: '생활가전', sub: '청소기', cond: '거의 새것', use: '6개월', town: '역삼동', dist: 0.4, min: 12, wish: 8, chat: 3, view: 124, st: '판매중', by: 'u1', ways: ['직거래', '택배', '안전결제'], ship: 3000, boost: true, offer: true, offerMin: 280000, photos: 7,
    desc: '작년 5월에 사서 6개월쯤 썼습니다. 헤드 3종 다 있고 박스도 그대로 있어요. 흡입력 이상 없고 배터리도 새것과 비슷합니다. 이사 가면서 새 청소기를 들여 내놓습니다.' },
  { id: 'i2', t: '아이패드 10세대 64G 와이파이', price: 389000, cat: '디지털기기', sub: '태블릿', cond: '거의 새것', use: '4개월', town: '논현동', dist: 1.2, min: 46, wish: 21, chat: 7, view: 402, st: '판매중', by: 'u2', ways: ['직거래', '안전결제'], ship: 0, boost: false, offer: true, offerMin: 350000, photos: 5,
    desc: '4개월 썼고 액정 흠집 없습니다. 케이스 씌워서 썼어요. 충전기 포함이고 정품 박스 있습니다.' },
  { id: 'i3', t: '원목 책상 1200x600 (직거래만)', price: 65000, cat: '가구·인테리어', sub: '책상', cond: '사용감 있음', use: '2년', town: '역삼동', dist: 0.8, min: 92, wish: 4, chat: 2, view: 88, st: '예약중', by: 'u3', ways: ['직거래'], ship: 0, boost: false, offer: false, photos: 4,
    desc: '2년 썼습니다. 상판에 잔기스가 조금 있지만 흔들림 없이 튼튼합니다. 무거워서 직거래만 가능하고, 차 가지고 오셔야 해요.' },
  { id: 'i4', t: '유아 카시트 (신생아~4세)', price: 90000, cat: '유아용품', sub: '카시트', cond: '사용감 있음', use: '18개월', town: '삼성동', dist: 2.1, min: 180, wish: 11, chat: 4, view: 213, st: '판매중', by: 'u3', ways: ['직거래', '택배'], ship: 5000, boost: false, offer: true, offerMin: 75000, photos: 6,
    desc: '아이가 커서 내놓습니다. 커버 세탁해 뒀고 사고 이력 없습니다. 설명서 있어요.' },
  { id: 'i5', t: '닌텐도 스위치 OLED + 게임 2개', price: 285000, cat: '취미', sub: '게임기', cond: '거의 새것', use: '8개월', town: '대치동', dist: 3.4, min: 240, wish: 33, chat: 12, view: 671, st: '판매중', by: 'u4', ways: ['택배', '안전결제'], ship: 3500, boost: true, offer: false, photos: 8,
    desc: '조이콘 쏠림 없습니다. 젤다·마리오카트 칩 같이 드려요. 액정보호필름 붙여서 썼습니다.' },
  { id: 'i6', t: '캠핑 의자 2개 세트', price: 35000, cat: '스포츠', sub: '캠핑', cond: '사용감 있음', use: '1년', town: '역삼동', dist: 0.6, min: 300, wish: 6, chat: 1, view: 97, st: '판매중', by: 'u5', ways: ['직거래', '택배'], ship: 4000, boost: false, offer: true, offerMin: 30000, photos: 3,
    desc: '캠핑 서너 번 갔다 왔습니다. 천에 얼룩이 조금 있지만 앉는 데 문제 없어요. 두 개 함께만 팝니다.' },
  { id: 'i7', t: '삼성 27인치 모니터 QHD', price: 145000, cat: '디지털기기', sub: '모니터', cond: '사용감 있음', use: '3년', town: '논현동', dist: 1.4, min: 420, wish: 9, chat: 3, view: 156, st: '판매중', by: 'u1', ways: ['직거래', '안전결제'], ship: 0, boost: false, offer: false, photos: 4,
    desc: '3년 썼고 밝기·색 이상 없습니다. 받침대와 전원선 함께 드립니다. HDMI 케이블은 없어요.' },
  { id: 'i8', t: '아이 자전거 16인치 (보조바퀴 포함)', price: 48000, cat: '스포츠', sub: '자전거', cond: '사용감 있음', use: '2년', town: '역삼동', dist: 0.3, min: 1400, wish: 3, chat: 0, view: 61, st: '거래완료', by: 'u6', ways: ['직거래'], ship: 0, boost: false, offer: false, photos: 5,
    desc: '아이가 커서 내놓습니다. 브레이크 정상이고 체인 기름칠 해 뒀어요.' },
  { id: 'i9', t: '에어팟 프로 2세대', price: 178000, cat: '디지털기기', sub: '음향기기', cond: '거의 새것', use: '3개월', town: '삼성동', dist: 2.3, min: 1600, wish: 27, chat: 9, view: 512, st: '판매중', by: 'u2', ways: ['택배', '안전결제'], ship: 3000, boost: false, offer: true, offerMin: 160000, photos: 6,
    desc: '선물 받았는데 귀에 안 맞아 내놓습니다. 세 달 정도 썼고 케이스 흠집 없습니다.' },
  { id: 'i10', t: '책장 5단 화이트', price: 40000, cat: '가구·인테리어', sub: '책장', cond: '사용감 있음', use: '3년', town: '대치동', dist: 3.1, min: 2200, wish: 5, chat: 2, view: 104, st: '판매중', by: 'u4', ways: ['직거래'], ship: 0, boost: false, offer: true, offerMin: 30000, photos: 3,
    desc: '이사하면서 내놓습니다. 위쪽 선반 한 칸에 눌린 자국이 있어요. 나머지는 멀쩡합니다.' },
  { id: 'i11', t: '겨울 패딩 (여성 M)', price: 55000, cat: '의류', sub: '여성 의류', cond: '거의 새것', use: '한 시즌', town: '역삼동', dist: 0.9, min: 2600, wish: 14, chat: 5, view: 288, st: '판매중', by: 'u5', ways: ['택배', '안전결제'], ship: 3000, boost: false, offer: false, photos: 5,
    desc: '작년 겨울에 두어 번 입었습니다. 오리털이고 세탁소에 다녀왔어요.' },
  { id: 'i12', t: '커피 그라인더 (수동)', price: 22000, cat: '기타', sub: '주방', cond: '사용감 있음', use: '1년', town: '논현동', dist: 1.1, min: 3200, wish: 2, chat: 1, view: 73, st: '판매중', by: 'u3', ways: ['직거래', '택배'], ship: 3000, boost: false, offer: false, photos: 3,
    desc: '원두 갈 때 잘 썼습니다. 날 상태 좋아요. 손잡이에 도색 벗겨진 곳이 조금 있습니다.' },
  { id: 'i13', t: '유아 책상·의자 세트', price: 70000, cat: '유아용품', sub: '가구', cond: '사용감 있음', use: '2년', town: '삼성동', dist: 2.0, min: 4100, wish: 7, chat: 2, view: 132, st: '판매중', by: 'u1', ways: ['직거래'], ship: 0, boost: false, offer: true, offerMin: 60000, photos: 4,
    desc: '높이 조절 됩니다. 상판에 스티커 자국이 조금 있어요. 의자 바퀴 다 굴러갑니다.' },
  { id: 'i14', t: '기계식 키보드 (적축)', price: 62000, cat: '디지털기기', sub: 'PC 부품', cond: '거의 새것', use: '5개월', town: '역삼동', dist: 0.5, min: 5000, wish: 12, chat: 4, view: 241, st: '판매중', by: 'u6', ways: ['직거래', '택배', '안전결제'], ship: 3000, boost: false, offer: false, photos: 5,
    desc: '조용한 축을 찾아서 바꿉니다. 키캡 다 있고 유선입니다. 청소해서 보내드려요.' },
  { id: 'i15', t: '반려견 이동장 (중형)', price: 28000, cat: '반려동물용품', sub: '켄넬', cond: '사용감 있음', use: '2년', town: '대치동', dist: 3.2, min: 6200, wish: 4, chat: 1, view: 66, st: '판매중', by: 'u2', ways: ['직거래', '택배'], ship: 4500, boost: false, offer: false, photos: 3,
    desc: '10kg 아이까지 들어갑니다. 문 잠금 잘 되고 바닥 매트 함께 드려요.' },
  { id: 'i16', t: '수험서 세트 (2026년판)', price: 30000, cat: '도서', sub: '수험서', cond: '사용감 있음', use: '6개월', town: '논현동', dist: 1.3, min: 7400, wish: 3, chat: 2, view: 84, st: '판매중', by: 'u5', ways: ['택배'], ship: 3000, boost: false, offer: true, offerMin: 25000, photos: 2,
    desc: '앞부분에 필기가 조금 있습니다. 뒤쪽은 깨끗해요. 다섯 권 세트로만 팝니다.' },
];
export const itemBy = (id) => ITEMS.find((x) => x.id === id) || ITEMS[0];
/** 판매중인 것만 — 목록 기본. 「거래완료 숨기기」가 켜진 상태다 */
export const onSale = () => ITEMS.filter((x) => x.st === '판매중');

/** 「몇 분 전」 — min 하나에서 만든다. 화면마다 따로 적지 않는다. */
export function ago(min) {
  if (min < 60) return `${min}분 전`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`;
  return `${Math.floor(min / 1440)}일 전`;
}

/* ── 채팅 ────────────────────────────────────────── */
export const CHATS = [
  { id: 'c1', with: 'u1', item: 'i1', last: '네고 조금만 가능할까요?', at: '방금', unread: 2, side: '구매', st: '이야기중' },
  { id: 'c2', with: 'u2', item: 'i9', last: '내일 저녁 7시에 역삼역 어떠세요?', at: '12분 전', unread: 0, side: '구매', st: '예약중' },
  { id: 'c3', with: 'u4', item: 'i14', last: '안전결제로 하겠습니다', at: '1시간 전', unread: 1, side: '판매', st: '이야기중' },
  { id: 'c4', with: 'u3', item: 'i3', last: '내일 오후에 가지러 갈게요', at: '3시간 전', unread: 0, side: '구매', st: '예약중' },
  { id: 'c5', with: 'u5', item: 'i8', last: '잘 받았습니다. 감사합니다!', at: '어제', unread: 0, side: '판매', st: '거래완료' },
  { id: 'c6', with: 'u2', item: 'i6', last: '사진 몇 장만 더 볼 수 있을까요?', at: '2일 전', unread: 0, side: '판매', st: '이야기중' },
];
/** 안 읽은 대화 수 — 목록에서 «세어» 낸다 */
export const UNREAD = CHATS.reduce((a, c) => a + (c.unread > 0 ? 1 : 0), 0);
export const UNREAD_MSGS = CHATS.reduce((a, c) => a + c.unread, 0);

/* 채팅방 한 편의 대화 — CH-02 가 쓴다 */
export const TALK = [
  { me: false, t: '안녕하세요, 아직 판매하시나요?', at: '오후 2:10' },
  { me: true, t: '네 판매합니다!', at: '오후 2:12', read: true },
  { me: false, t: '헤드 3종 다 있다고 하셨는데 사진 한 장만 더 볼 수 있을까요?', at: '오후 2:13' },
  { me: true, t: '', at: '오후 2:15', read: true, photo: 2 },
  { me: false, t: '감사합니다. 네고 조금만 가능할까요?', at: '오후 2:20' },
  { me: false, kind: 'offer', price: 290000, at: '오후 2:20' },
  { me: true, kind: 'sys', t: '값을 먼저 보내 달라는 말은 사기일 수 있어요. 안전결제를 쓰면 물건을 받은 뒤에 돈이 넘어갑니다.', at: '' },
];

/* ── 거래(안전결제) ──────────────────────────────── */
export const ESCROW_STEPS = ['결제', '발송', '수령 확인', '정산'];
export const DEALS = [
  { id: 'd1', item: 'i9', side: '구매', with: 'u2', price: 178000, ship: 3000, step: 1, st: '진행중', paidAt: '9/5 14:20', sentAt: null, leftLabel: '판매자가 보내기를 기다리는 중', left: '2일 6시간' },
  { id: 'd2', item: 'i14', side: '판매', with: 'u4', price: 62000, ship: 3000, step: 2, st: '진행중', paidAt: '9/3 10:02', sentAt: '9/4 09:40', leftLabel: '구매자가 받았다고 누르기를 기다리는 중', left: '3일 2시간', track: 'CJ대한통운 1234-5678-9012' },
  { id: 'd3', item: 'i11', side: '판매', with: 'u3', price: 55000, ship: 3000, step: 3, st: '완료', paidAt: '8/28 11:15', sentAt: '8/29 08:30', leftLabel: '정산 예정', left: '9/12', settleAt: '9/12' },
  { id: 'd4', item: 'i6', side: '구매', with: 'u5', price: 35000, ship: 4000, step: 0, st: '취소', paidAt: '8/20 19:44', sentAt: null, leftLabel: '기한 안에 안 보내 자동 취소·환불됨', left: '—' },
];
/** 수수료율 — 한곳에서 정한다. 화면 셋이 이 값을 나눠 쓴다 */
export const FEE_RATE = 0.035;
export const fee = (price) => Math.round(price * FEE_RATE);
export const payout = (price) => price - fee(price);

/* ── 후기·매너 ───────────────────────────────────── */
/* 파는 쪽을 매길 때와 사는 쪽을 매길 때 목록이 다르다 — 이 장터의 알맹이다 */
export const GOOD_SELLER = ['시간 약속을 잘 지켜요', '설명과 물건이 같아요', '응답이 빨라요', '친절해요', '포장이 꼼꼼해요'];
export const GOOD_BUYER = ['시간 약속을 잘 지켜요', '무리한 값 깎기가 없었어요', '응답이 빨라요', '친절해요', '약속을 안 미뤄요'];
export const BAD_SELLER = ['약속 시간에 안 왔어요', '설명과 물건이 달라요', '연락이 잘 안 돼요', '무례했어요'];
export const BAD_BUYER = ['약속 시간에 안 왔어요', '무리하게 값을 깎아요', '연락이 잘 안 돼요', '무례했어요'];

export const REVIEWS = [
  { id: 'r1', who: 'u1', side: '팔았어요', item: 'i7', r: 5, chips: ['시간 약속을 잘 지켜요', '설명과 물건이 같아요'], t: '설명 그대로였고 약속 시간에 딱 맞춰 오셨어요. 또 거래하고 싶습니다.', at: '9/2' },
  { id: 'r2', who: 'u3', side: '샀어요', item: 'i11', r: 5, chips: ['포장이 꼼꼼해요', '응답이 빨라요'], t: '포장을 꼼꼼하게 해 주셔서 그대로 잘 받았습니다.', at: '8/30' },
  { id: 'r3', who: 'u2', side: '팔았어요', item: 'i9', r: 4, chips: ['친절해요'], t: '친절하게 답해 주셨어요. 다만 약속이 한 번 미뤄져서 아쉬웠습니다.', at: '8/24' },
  { id: 'r4', who: 'u5', side: '샀어요', item: 'i8', r: 5, chips: ['시간 약속을 잘 지켜요', '무리한 값 깎기가 없었어요'], t: '깔끔하게 거래했습니다. 감사합니다.', at: '8/18', priv: true },
  { id: 'r5', who: 'u4', side: '팔았어요', item: 'i14', r: 3, chips: [], bad: ['연락이 잘 안 돼요'], t: '연락이 느려서 약속 잡는 데 며칠 걸렸습니다.', at: '8/11' },
];
/** 항목별 몇 번 받았나 — 후기에서 «세어» 낸다. 막대와 목록이 같은 값을 쓴다 */
export function chipCounts() {
  const m = new Map();
  for (const r of REVIEWS) for (const c of r.chips) m.set(c, (m.get(c) || 0) + 1);
  // 화면이 허전하지 않게 예시 가중치를 더한다 — 어디까지나 견본 데이터다
  const 가중 = { '시간 약속을 잘 지켜요': 16, '설명과 물건이 같아요': 11, '응답이 빨라요': 9, '친절해요': 7, '포장이 꼼꼼해요': 5 };
  for (const [k, v] of Object.entries(가중)) m.set(k, (m.get(k) || 0) + v);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}
export const MANNER_HISTORY = [
  { m: '4월', v: 38.2 }, { m: '5월', v: 39.4 }, { m: '6월', v: 40.1 },
  { m: '7월', v: 41.3 }, { m: '8월', v: 42.0 }, { m: '9월', v: 42.5 },
];

/* ── 끌올·광고 ───────────────────────────────────── */
export const BOOSTS = [
  { k: '즉시 끌올', price: 1500, keep: '즉시 1회', exp: 2400, d: '지금 이 순간 목록 맨 위로' },
  { k: '하루 상단 고정', price: 5000, keep: '24시간', exp: 12800, d: '하루 동안 목록 위쪽에 고정' },
  { k: '일주일 상단 고정', price: 25000, keep: '7일', exp: 78000, d: '한 주 동안 목록 위쪽에 고정' },
];
export const AD_SLOTS = [
  { k: '검색 결과 상단', price: 8000, keep: '24시간', where: '검색 결과 첫 줄', exp: 18000 },
  { k: '카테고리 첫 화면', price: 12000, keep: '24시간', where: '그 분류 첫 화면 위쪽', exp: 26000 },
];
export const BOOST_LOG = [
  { at: '9/5', item: 'i1', k: '하루 상단 고정', price: 5000, st: '진행중', exp: 9840, clk: 312, chat: 3 },
  { at: '9/2', item: 'i5', k: '즉시 끌올', price: 1500, st: '끝남', exp: 2410, clk: 88, chat: 2 },
  { at: '8/28', item: 'i14', k: '일주일 상단 고정', price: 25000, st: '끝남', exp: 74200, clk: 1840, chat: 11 },
  { at: '8/20', item: 'i11', k: '즉시 끌올', price: 1500, st: '취소', exp: 0, clk: 0, chat: 0 },
];
/** 쓴 돈 합계 — 내역에서 «세어» 낸다 */
export const BOOST_SPENT = BOOST_LOG.filter((b) => b.st !== '취소').reduce((a, b) => a + b.price, 0);
export const BOOST_FREE_LEFT = '7시간 12분';
export const MY_POINT = 4200;

/* ── 신고(운영자) ────────────────────────────────── */
export const REPORT_REASONS = [
  { k: '사기가 의심돼요', ic: '⚠', extra: '어떤 점이 의심되나요' },
  { k: '팔 수 없는 물건이에요', ic: '🚫', extra: '어떤 품목인가요' },
  { k: '욕설·비방을 해요', ic: '💢', extra: '어느 말이었나요' },
  { k: '광고·도배예요', ic: '📢', extra: '어떤 광고인가요' },
  { k: '남의 사진을 가져다 썼어요', ic: '🖼', extra: '원본을 어디서 보셨나요' },
  { k: '그 밖에', ic: '⋯', extra: '무슨 일이 있었나요' },
];
export const REPORTS = [
  { id: 'R-2418', at: '09-07 08:12', ago: 26, why: '사기가 의심돼요', target: '회원 바람개비', kind: '회원', by: '민트초코', dup: 5, lv: '높음', who: '박서준', st: '대기', item: 'i6' },
  { id: 'R-2417', at: '09-07 07:40', ago: 58, why: '팔 수 없는 물건이에요', target: '매물 · 수험서 세트(2026년판)', kind: '매물', by: '해질녘', dup: 1, lv: '보통', who: '—', st: '대기', item: 'i16' },
  { id: 'R-2416', at: '09-06 23:10', ago: 620, why: '남의 사진을 가져다 썼어요', target: '매물 · 닌텐도 스위치 OLED', kind: '매물', by: '초록나무', dup: 2, lv: '보통', who: '이도현', st: '처리중', item: 'i5' },
  { id: 'R-2415', at: '09-06 19:02', ago: 868, why: '욕설·비방을 해요', target: '대화 · 달빛창가', kind: '대화', by: '하늘이네', dup: 1, lv: '높음', who: '—', st: '대기', item: 'i10' },
  { id: 'R-2414', at: '09-06 14:31', ago: 1139, why: '광고·도배예요', target: '회원 달빛창가', kind: '회원', by: '초록나무', dup: 3, lv: '낮음', who: '박서준', st: '처리중', item: 'i10' },
  { id: 'R-2413', at: '09-05 22:18', ago: 2112, why: '사기가 의심돼요', target: '매물 · 커피 그라인더(수동)', kind: '매물', by: '민트초코', dup: 1, lv: '보통', who: '—', st: '보류', item: 'i12' },
];
/** 지표 카드는 표에서 «세어» 낸다. 손으로 적으면 표와 갈라진다 */
export const REPORT_STATS = {
  오늘접수: 42,
  대기: REPORTS.filter((r) => r.st === '대기').length,
  처리중: REPORTS.filter((r) => r.st === '처리중').length,
  보류: REPORTS.filter((r) => r.st === '보류').length,
  완료: 231,
  평균처리: '6시간',
  기한넘김: REPORTS.filter((r) => r.ago > 1440).length,
};
export const ACTIONS = [
  { k: '반려 (문제 없음)', d: '신고자에게 「확인했지만 규정 위반이 아니다」라고 알립니다' },
  { k: '경고', d: '회원에게 경고를 보냅니다. 세 번 쌓이면 자동으로 정지 검토에 올라갑니다' },
  { k: '글 삭제', d: '그 판매글을 내립니다. 회원에게 사유와 함께 알립니다' },
  { k: '노출 제한', d: '글은 두되 목록·검색에서 뺍니다. 링크로는 열립니다' },
  { k: '이용 정지', d: '기간 동안 글쓰기·채팅을 막습니다', days: true },
  { k: '영구 정지', d: '계정을 영구히 막습니다. 되돌리려면 운영 책임자 승인이 필요합니다' },
];

/* ── 금지품목·규칙(운영자) ───────────────────────── */
export const BANNED = [
  { k: '주류·담배', why: '주류·담배는 온라인 통신판매가 법으로 금지돼 있습니다', act: '바로 숨김', n: 12, on: true },
  { k: '의약품·건강기능식품', why: '약사법상 개인 간 거래가 금지됩니다', act: '바로 숨김', n: 8, on: true },
  { k: '반려동물(생물)', why: '동물보호법상 온라인 분양·판매가 제한됩니다', act: '검토 대기로', n: 3, on: true },
  { k: '모조품·이미테이션', why: '상표법 위반입니다', act: '바로 숨김', n: 21, on: true },
  { k: '상품권·기프티콘 대량', why: '자금세탁 우려로 대량 거래를 제한합니다', act: '검토 대기로', n: 6, on: true },
  { k: '수제 식품', why: '식품위생법상 신고 없이 만든 식품은 팔 수 없습니다', act: '경고만', n: 4, on: false },
];
export const BAN_WORDS = ['담배', '전자담배', '주류', '위스키', '레플리카', '이미테이션', '처방약'];
export const BAN_EXCEPT = ['담배 케이스', '주류 진열장', '위스키 잔'];

/* ── 정산·분쟁(운영자) ───────────────────────────── */
export const SETTLES = [
  { no: 'T-90412', item: 'i9', buyer: '하늘이네', seller: '민트초코', price: 178000, due: '09-12', st: '정산대기' },
  { no: 'T-90408', item: 'i14', buyer: '달빛창가', seller: '하늘이네', price: 62000, due: '09-11', st: '정산대기' },
  { no: 'T-90395', item: 'i11', buyer: '해질녘', seller: '하늘이네', price: 55000, due: '09-05', st: '정산완료' },
  { no: 'T-90371', item: 'i5', buyer: '바람개비', seller: '달빛창가', price: 285000, due: '보류', st: '분쟁' },
  { no: 'T-90360', item: 'i2', buyer: '초록나무', seller: '민트초코', price: 389000, due: '09-02', st: '정산완료' },
];
export const DISPUTE = {
  no: 'T-90371',
  buyer: { nick: '바람개비', say: '사진에는 조이콘 흠집이 없었는데 받아 보니 오른쪽 조이콘에 긁힘이 있습니다. 게임 칩도 한 개만 왔어요.', at: '09-05 20:11', photos: 3 },
  seller: { nick: '달빛창가', say: '보낼 때 흠집은 없었습니다. 게임 칩은 두 개 다 넣어 보냈고 포장 사진도 있습니다.', at: '09-06 09:24', photos: 2 },
};

/* ── 고객센터 ────────────────────────────────────── */
export const FAQ_TABS = ['전체', '거래', '안전결제', '신고·제재', '매너 점수', '끌올·광고', '계정'];
export const FAQS = [
  { c: '안전결제', q: '안전결제는 무엇인가요?', a: '돈을 판매자에게 바로 보내지 않고 플랫폼이 잠깐 맡아 둡니다. 물건을 받고 「받았어요」를 누르면 그때 판매자에게 넘어갑니다.', hot: 1 },
  { c: '안전결제', q: '수수료는 누가 내나요?', a: '파는 쪽이 냅니다. 물건 값의 3.5%가 정산할 때 빠집니다. 사는 쪽은 물건 값과 배송비만 냅니다.', hot: 2 },
  { c: '거래', q: '직거래와 안전결제 중 무엇이 나은가요?', a: '가까운 이웃과 만나서 물건을 보고 사면 직거래가 빠릅니다. 멀리 있거나 값이 큰 물건은 안전결제를 권합니다.', hot: 3 },
  { c: '매너 점수', q: '매너 점수는 어떻게 오르나요?', a: '36.5에서 시작합니다. 좋은 후기를 받으면 오르고 아쉬운 후기를 받으면 내려갑니다. 응답률도 조금 반영됩니다.', hot: 4 },
  { c: '거래', q: '동네 인증은 왜 하나요?', a: '가까운 이웃끼리 거래하는 곳이라, 그 동네에 있다는 것을 한 번 확인합니다. 인증하지 않으면 판매글을 쓸 수 없습니다.', hot: 5 },
  { c: '신고·제재', q: '신고하면 어떻게 되나요?', a: '접수 → 검토 → 조치 → 결과 알림 순으로 진행됩니다. 평균 6시간 안에 처리되고 결과는 알림으로 알려드립니다.' },
  { c: '끌올·광고', q: '끌올은 얼마나 자주 할 수 있나요?', a: '무료 끌올은 24시간에 한 번입니다. 더 빨리 올리고 싶으면 유료 끌올을 쓸 수 있고, 그 글에는 「끌올」 배지가 붙습니다.' },
  { c: '계정', q: '닉네임을 바꿀 수 있나요?', a: '30일에 한 번 바꿀 수 있습니다. 이미 남긴 후기와 거래 기록에는 바뀐 닉네임으로 보입니다.' },
  { c: '거래', q: '거래완료로 바꾸면 되돌릴 수 있나요?', a: '직거래는 되돌릴 수 있습니다. 안전결제는 구매확정을 누르면 돈이 넘어가므로 되돌릴 수 없습니다.' },
  { c: '신고·제재', q: '차단하면 무엇이 막히나요?', a: '그 사람의 판매글이 내 목록에 안 보이고, 그 사람이 나에게 채팅을 걸 수 없습니다. 차단은 언제든 풀 수 있습니다.' },
];
export const NOTICES = [
  { id: 'n1', c: '공지', t: '거래 규칙이 2026년 10월 1일부터 바뀝니다', at: '2026-09-05', hit: 2841, imp: true, from: '2026-10-01' },
  { id: 'n2', c: '제재안내', t: '허위 매물 집중 단속 안내', at: '2026-09-03', hit: 1922, imp: true },
  { id: 'n3', c: '이벤트', t: '첫 판매글 쓰면 끌올 1회 무료', at: '2026-09-01', hit: 5104, dday: 5 },
  { id: 'n4', c: '공지', t: '안전결제 정산 주기가 짧아집니다 (7일 → 5일)', at: '2026-08-28', hit: 3310 },
  { id: 'n5', c: '이벤트', t: '여름맞이 캠핑용품 기획전', at: '2026-08-12', hit: 4488, done: true },
  { id: 'n6', c: '공지', t: '추석 연휴 고객센터 운영 안내', at: '2026-08-30', hit: 1204 },
  { id: 'n7', c: '제재안내', t: '이런 글은 삭제됩니다 — 금지 품목 안내', at: '2026-08-20', hit: 2670 },
  { id: 'n8', c: '공지', t: '앱 2.4 업데이트 — 관심 키워드 알림이 빨라집니다', at: '2026-08-14', hit: 1988 },
];
export const INQUIRIES = [
  { t: '안전결제 정산이 안 왔어요', at: '2026-09-04', st: '답변 완료', kind: '안전결제' },
  { t: '신고한 건은 어떻게 됐나요?', at: '2026-08-29', st: '답변 완료', kind: '신고 결과가 궁금해요' },
  { t: '끌올 결제가 두 번 됐습니다', at: '2026-08-21', st: '접수', kind: '끌올·광고 결제' },
];

/* ── 사기 유형(안내 화면) ────────────────────────── */
export const SCAMS = [
  { k: '선입금 유도', talk: '「지금 입금하시면 바로 보내드릴게요. 다른 분이 기다리셔서요」', how: '값이 시세보다 크게 싸고 서두르라고 하면 의심하세요. 안전결제를 쓰자고 하면 대개 물러섭니다.' },
  { k: '가짜 안전결제 링크', talk: '「이 링크로 결제해 주세요」 하며 우리 것과 비슷한 주소를 보냅니다', how: '안전결제는 채팅 안의 [안전결제로 거래하기] 버튼으로만 시작합니다. 바깥 링크는 누르지 마세요.' },
  { k: '물건 바꿔치기', talk: '사진과 다른 물건을 보내고 「그거 맞다」고 우깁니다', how: '받자마자 열어 보고, 다르면 «구매확정을 누르기 전에» 신고하세요. 확정 뒤에는 돈이 이미 넘어갑니다.' },
];

/* ── 안전거래존 ──────────────────────────────────── */
export const SAFE_SPOTS = [
  { nm: '역삼역 2번 출구 앞', d: '지하철역 · CCTV 있음', km: 0.4 },
  { nm: '역삼1동 주민센터 로비', d: '공공기관 · 평일 09–18시', km: 0.9 },
  { nm: '강남경찰서 지구대 앞', d: '경찰 관서 앞 · 24시간', km: 1.6 },
];
