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
const TYPE_RULES: { type: ReqType; kw: string[] }[] = [
  {
    type: "정책",
    kw: ["인증", "로그인", "로그아웃", "회원", "가입", "권한", "약관", "동의", "필수", "검증", "보안", "결제", "환불", "배송비", "개인정보", "쿠폰", "적립"],
  },
  {
    type: "기능",
    kw: ["검색", "등록", "추가", "삭제", "수정", "저장", "담기", "주문", "구매", "계산", "연동", "발송", "다운로드", "업로드", "선택", "이동", "조회", "관리", "적용", "취소", "재생", "예약", "신청"],
  },
  {
    type: "UI/UX",
    kw: ["버튼", "정렬", "필터", "탭", "팝업", "드롭다운", "슬라이더", "스텝퍼", "레이아웃", "배치", "스크롤", "반응형", "토글", "입력", "네비", "메뉴바", "그리드", "카드", "칩", "배너", "갤러리"],
  },
  {
    type: "콘텐츠",
    kw: ["이미지", "텍스트", "설명", "소개", "목록", "리스트", "상세", "공지", "리뷰", "후기", "안내", "요약", "정보"],
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
function splitFuncDef(funcDef: string): string[] {
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
