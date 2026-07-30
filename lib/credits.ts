// 크레딧 경제 — 값의 단일 출처(가격 정책서 기준). UI·서버 공용.
// 1크레딧 = 100원. 충전형(구독 아님).

export const WON_PER_CREDIT = 100;

// 무료 체험 — 가입 시 지급.
//
// 유효기간이 30일인 이유: 결제(PG)가 붙기 전까지의 한시 설정이다.
// 3일은 "빨리 써보고 충전하세요"라는 압박인데, 충전 자체가 막힌 지금은 누를 대상이 없다.
// 오히려 유튜브·인스타로 들어온 사람이 며칠 뒤 돌아왔을 때 크레딧이 없으면
// 출시일에 부를 명단이 그대로 죽는다.
// PG를 열 때 3일로 되돌릴 것. 약관 제6조⑤의 표기도 함께 고쳐야 한다.
export const FREE_CREDITS = 12;
export const FREE_TTL_DAYS = 30;
// 유상 크레딧 유효기간 — 최근 충전일 기준(여기선 지급 시점 +1년으로 단순화).
export const PAID_TTL_DAYS = 365;

// 충전 팩 — 많이 살수록 보너스 크레딧을 더 준다.
export interface CreditPack {
  id: string;
  name: string;
  priceKrw: number;
  credits: number;
  bonusPct: number;
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", name: "스타터", priceKrw: 5000, credits: 55, bonusPct: 10 },
  { id: "basic", name: "베이직", priceKrw: 10000, credits: 120, bonusPct: 20, popular: true },
  { id: "value", name: "밸류", priceKrw: 20000, credits: 260, bonusPct: 30 },
];

export function packById(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

// 실행·다운로드 소모 크레딧(손님 화면엔 노출 최소화, FAQ·약관에 상세).
export const CREDIT_COST = {
  genBasic: 4, // 설계도 생성 · 기본(30~50)
  genDetail: 8, // 설계도 생성 · 상세(100~150)
  genAdmin: 8, // 관리자 백오피스 생성
  verifyDoc: 4, // 검수 · 문서/설계도
  verifySite: 8, // 검수 · 사이트
  verifyDesignVs: 12, // 검수 · 설계 대비
  downloadScreens30: 190, // 다운로드 · 설계도 30~50
  downloadScreens150: 390, // 다운로드 · 설계도 100~150
  downloadAdmin: 290, // 다운로드 · 관리자
  downloadVerify: 99, // 다운로드 · 검수 시나리오
  optionPreset: 99, // 옵션 · 디자인 프리셋
  optionVerify: 99, // 옵션 · 검수 시나리오
} as const;

export function wonToCredits(won: number): number {
  return Math.round(won / WON_PER_CREDIT);
}

// 충전 금액별 보너스율(팩과 동일 기준). 직접 입력 충전에도 그대로 적용한다.
export function bonusPctForWon(won: number): number {
  if (won >= 20000) return 30;
  if (won >= 10000) return 20;
  if (won >= 5000) return 10;
  return 0;
}

// 충전 금액(원) → 지급 크레딧(기본 + 보너스). 5,000→55 / 10,000→120 / 20,000→260 과 일치.
export function creditsForWon(won: number): number {
  const base = Math.floor(won / WON_PER_CREDIT);
  return base + Math.floor((base * bonusPctForWon(won)) / 100);
}

// 직접 입력 충전 한도(1,000원 단위).
export const CUSTOM_MIN_WON = 1000;
export const CUSTOM_MAX_WON = 1000000;
export const CUSTOM_STEP_WON = 1000;

// 프로젝트 산출물 전체 다운로드 원가 — 상세(3뎁스)면 더 비싸다.
export function downloadCost(hasDetail: boolean): number {
  return hasDetail ? CREDIT_COST.downloadScreens150 : CREDIT_COST.downloadScreens30;
}
