// 기능정의서(요구사항 정의서)용 — 화면을 나열하는 게 아니라
// 업무(메뉴) > 기능(화면) > 구성(세부 요건) 계층으로 요건을 분해하고, 유형을 붙인다.
import type { Menu } from "@/domain/menu/menu";
import type { Screen } from "@/domain/screen/screen";

export type ReqType = "기능" | "콘텐츠" | "UI/UX" | "정책" | "기타";

export interface Requirement {
  reqId: string;
  업무: string;
  기능: string;
  구성: string;
  유형: ReqType;
}

// 세부 요건 문장에서 유형을 추정한다(키워드 기반, 1차 분류 — 사용자가 조정 가능).
//
// 아래 규칙은 위에서부터 먼저 걸리는 것이 이긴다. 그래서 순서가 곧 우선순위다.
// 사전에 없는 단어는 전부 「기타」로 떨어지는데, 예전엔 그 비율이 29%까지 갔다
// (87개 중 25개 — 2026-08-03). 사는 사람이 열면 "분류를 하다 만 건가" 싶어지는
// 숫자라, 실제로 기타로 빠졌던 말들을 사전에 채워 넣었다.
const TYPE_RULES: { type: ReqType; kw: string[] }[] = [
  // 동사가 섞여 있어도 성격이 뒤집히지 않는 말들을 맨 앞에 둔다.
  // 예: "구매 후기 3건"은 '구매' 때문에 기능으로 갔지만, 실제로는 보여주는 콘텐츠다.
  {
    type: "콘텐츠",
    kw: ["후기", "리뷰", "평점", "별점", "공지", "약관 전문", "일러스트", "이력"],
  },
  {
    type: "정책",
    kw: ["인증", "로그인", "로그아웃", "회원", "가입", "권한", "약관", "동의", "필수", "검증", "보안", "결제", "환불", "배송비", "개인정보", "쿠폰", "적립", "워터마크", "저작권", "유효기간", "만료", "제한", "비밀번호", "마감", "기준", "조건", "최소", "최대", "한도", "정책", "규정", "수수료", "위약", "보증", "본인확인"],
  },
  {
    type: "기능",
    kw: ["검색", "등록", "추가", "삭제", "수정", "변경", "저장", "담기", "주문", "구매", "계산", "합산", "연동", "발송", "알림", "다운로드", "업로드", "선택", "이동", "조회", "관리", "적용", "취소", "재생", "예약", "신청", "설정", "지정", "추천", "확대", "축소", "뷰어", "플레이어", "보기", "공유", "복사", "내보내기", "새로고침", "초기화", "정산", "발급", "처리", "작성", "첨부", "자동", "추출", "채점", "진입", "확인", "체크", "열기", "접기", "펼침", "노출", "갱신", "동기화", "제안", "참여", "배정", "반영", "전환", "일괄", "정지", "재개", "이어보기", "펼치기", "접기", "닫기", "열람", "조절", "제거", "압축", "차단", "승인", "거절", "반려", "팔로우", "구독", "연장", "재발급", "검수", "지원", "배속", "정렬"],
  },
  {
    type: "UI/UX",
    kw: ["버튼", "정렬", "필터", "탭", "팝업", "드롭다운", "슬라이더", "스텝퍼", "레이아웃", "배치", "스크롤", "반응형", "토글", "입력", "네비", "메뉴바", "그리드", "카드", "칩", "배너", "갤러리", "캐러셀", "바로가기", "링크", "배지", "아이콘", "모달", "툴팁", "체크박스", "달력", "캘린더", "썸네일", "아코디언", "색상", "강조", "빨강", "회색", "하이라이트", "테이블", "매트릭스", "그래프", "차트", "막대", "폼", "사이드바", "헤더", "푸터", "토스트", "아바타", "구분선", "여백"],
  },
  {
    type: "콘텐츠",
    kw: ["이미지", "사진", "텍스트", "문구", "설명", "소개", "목록", "리스트", "상세", "안내", "요약", "정보", "제목", "이름", "가격", "금액", "표시", "현황", "통계", "매출", "건수", "영수증", "내역", "상태", "시간", "시각", "날짜", "기간", "상품", "매장", "고객", "강의", "수량", "인원", "재고", "이메일", "연락처", "주소", "장소", "사유", "여부", "결과", "메모", "카테고리", "난이도", "프로필", "명단", "점수", "총점", "합계", "기록", "진도율", "출석률", "잔여", "남은", "예상", "현재", "최근", "순위", "인기", "시술", "질문", "답변", "문의", "메시지", "배송", "대상", "번호", "차시", "노트", "자막", "경력", "잔액", "길이", "용량", "개수", "단위", "비율", "등급", "타입", "형식"],
  },
];

function classify(text: string): ReqType {
  for (const rule of TYPE_RULES) {
    if (rule.kw.some((k) => text.includes(k))) return rule.type;
  }
  return "기타";
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// 기능정의를 요건 한 줄씩으로 나눈다.
// 구분자는 '·' 와 쉼표, 줄바꿈이다. 다만 괄호 안의 구분자는 요건을 나누는 게 아니라
// 그 요건의 내용을 열거하는 것이므로 자르지 않는다.
// (예: "필터(여행지·가격·소요시간)" 은 세 조각이 아니라 한 요건이다.
//  괄호를 무시하고 자르면 "필터(여행지" / "소요시간)" 처럼 깨진 줄이 남는다.)
export function splitFuncDef(funcDef: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let buf = "";
  const flush = () => {
    const t = buf.trim();
    if (t) items.push(t);
    buf = "";
  };
  for (const ch of funcDef) {
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth = Math.max(0, depth - 1);

    if (depth === 0 && (ch === "·" || ch === "," || ch === "\n")) {
      flush();
      continue;
    }
    buf += ch;
  }
  flush();
  return items;
}

export function buildRequirements(menus: Menu[], screens: Screen[]): Requirement[] {
  const rows: Requirement[] = [];
  let 업무n = 0;
  for (const menu of menus) {
    const menuScreens = screens.filter((s) => s.menuId === menu.id);
    if (menuScreens.length === 0) continue;
    업무n++;
    let 기능n = 0;
    for (const s of menuScreens) {
      기능n++;
      const items = splitFuncDef(s.funcDef ?? "");
      const list = items.length > 0 ? items : [s.pageName];
      let 구성n = 0;
      for (const item of list) {
        구성n++;
        rows.push({
          reqId: `${pad(업무n)}-${pad(기능n)}-${pad(구성n)}`,
          업무: menu.nameKo,
          기능: s.pageName,
          구성: item,
          유형: classify(item),
        });
      }
    }
  }
  return rows;
}

// 엑셀 내보내기용(한글 헤더 = 열 순서).
export function buildRequirementRows(menus: Menu[], screens: Screen[]): Record<string, string>[] {
  return buildRequirements(menus, screens).map((r) => ({
    요구사항ID: r.reqId,
    업무: r.업무,
    기능: r.기능,
    구성: r.구성,
    유형: r.유형,
  }));
}
