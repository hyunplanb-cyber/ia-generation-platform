// 크레딧 경제 — 값의 단일 출처(가격 정책서 기준). UI·서버 공용.
// 1크레딧 = 100원. 충전형(구독 아님).

export const WON_PER_CREDIT = 100;

// 무료 체험 — 가입 시 지급, 3일 소멸.
export const FREE_CREDITS = 12;
export const FREE_TTL_DAYS = 3;
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
