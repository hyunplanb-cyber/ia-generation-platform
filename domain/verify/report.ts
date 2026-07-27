// 사이트 검수 결과의 도메인 모델.
// URL(만든 것)을 넣으면 자동 검사(공개 화면)와 재현 시나리오(민감 화면)를 함께 낸다.

export type CheckStatus = "pass" | "fail" | "warn";

// 자동으로 판정한 항목 하나(접속·이미지·링크·모바일 대응 등).
export interface Check {
  id: string;
  label: string; // 사람이 읽는 이름 — "접속 성공", "이미지 깨짐 없음"
  status: CheckStatus;
  detail: string; // 근거 한 줄 — "200 OK · 0.8초", "이미지 20개 중 2개 깨짐"
}

// 사람이 직접 확인할 시나리오. 공개 화면은 보조 확인용, 민감 화면은 자동 검수가 안 되므로 필수.
export interface Scenario {
  area: "public" | "sensitive";
  screen: string; // "장바구니", "로그인 후 마이페이지"
  steps: string[]; // 재현/확인 절차
}

export interface VerificationReport {
  mode: "site" | "document"; // URL 검수(자동 검사 포함) / 문서 기반(시나리오만)
  url: string; // 사용자가 넣은 원본(문서면 파일명)
  finalUrl: string; // 리다이렉트까지 따라간 실제 주소(문서면 파일명)
  fetchedAt: string; // ISO
  checks: Check[];
  passCount: number;
  failCount: number;
  warnCount: number;
  sensitiveScreens: string[]; // 자동 검수 불가로 분류된 화면
  scenarios: Scenario[];
  summary: string; // 쉬운 말 총평
}
