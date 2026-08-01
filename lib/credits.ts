// 크레딧 경제 — 값의 단일 출처(가격 정책서 기준). UI·서버 공용.
// 1크레딧 = 100원. 충전형(구독 아님).

export const WON_PER_CREDIT = 100;

/**
 * 크레딧이 모자랄 때 보여줄 문구.
 * 충전이 아직 안 열린 동안에는 "충전하세요"라고 하면 안 된다 — 갈 곳이 없다.
 */
export function insufficientCreditMessage(creditsOpen: boolean): string {
  return creditsOpen
    ? "크레딧이 부족해요. 충전한 뒤 다시 시도해 주세요."
    : "무료 크레딧을 다 쓰셨어요. 충전 기능을 준비하고 있어요.";
}

// 무료 체험 — 가입 시 지급.
//
// 유효기간이 30일인 이유: 결제(PG)가 붙기 전까지의 한시 설정이다.
// 3일은 "빨리 써보고 충전하세요"라는 압박인데, 충전 자체가 막힌 지금은 누를 대상이 없다.
// 오히려 유튜브·인스타로 들어온 사람이 며칠 뒤 돌아왔을 때 크레딧이 없으면
// 출시일에 부를 명단이 그대로 죽는다.
// PG를 열 때 3일로 되돌릴 것. 약관 제6조⑤의 표기도 함께 고쳐야 한다.
// 35로 잡은 이유: "만들고 미리보기까지는 마음껏, 다운로드는 못 하게"의 경계다.
//   기본 생성(10) 3회 = 30 / 상세 생성(23) 1회 + 기본 1회 = 33 → 둘 다 된다.
//   가장 싼 다운로드가 99(프리셋)라 무료로는 어떤 파일도 못 받는다.
// 원가는 하이쿠 기준 1인당 최대 660원 — 신규 회원 유치비로 본다.
export const FREE_CREDITS = 35;
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
  // 2026-08-01 가격정책표 기준. 디자인 프리셋 생성도 genBasic을 쓴다(application/preset.ts).
  genBasic: 12, // AI팩 생성 · 기본(30~50) — 1,200원
  genDetail: 28, // AI팩 생성 · 상세(100~150) — 2,800원
  genAdmin: 28, // 관리자 백오피스 생성
  // 검수 생성값은 고정이 아니라 verifyGenCost(묶음 수)로 구한다(아래 참고).
  // 아래 세 값은 옛 고정 요금 — 지금은 쓰지 않는다. 지우지 않은 이유는
  // 예전 결제 기록의 메모를 읽을 때 대조할 것이 필요해서다.
  verifyDoc: 10, // (미사용) 옛 문서 검수 고정값
  verifySite: 23, // (미사용) 옛 사이트 검수 고정값
  verifyDesignVs: 30, // (미구현) 설계 대비 검수 — 만들면 그때 값을 정한다
  downloadScreens30: 390, // 다운로드 · AI팩 30~50 — 39,000원
  downloadScreens150: 690, // 다운로드 · AI팩 100~150 — 69,000원
  downloadAdmin: 590, // 다운로드 · 관리자
  downloadVerify: 99, // 다운로드 · 검수 시나리오
  optionPreset: 99, // 옵션 · 디자인 프리셋
  optionVerify: 99, // 옵션 · 검수 시나리오
} as const;

/**
 * 검수 생성값 — 묶음(호출) 수에 비례해 받는다.
 *
 * 검수는 한 번에 넣을 수 있는 양이 정해져 있어서(화면 10개 / 문서 16,000자 / 페이지 1개),
 * 규모가 크면 그만큼 여러 번 나눠 본다. 원가도 딱 그 횟수에 비례한다 —
 * 2026-08-01 실측으로 한 묶음이 약 200~300원이다.
 *
 * 그래서 값도 같은 축으로 매긴다. "화면 156개니까 16묶음, 138크레딧"은 손님에게
 * 근거가 보이지만, "상세는 23크레딧"은 왜인지 알 수 없고 큰 프로젝트에서 적자가 났다.
 */
export const VERIFY_BASE_CREDITS = 10;
export const VERIFY_PER_CHUNK_CREDITS = 8;

export function verifyGenCost(chunks: number): number {
  return VERIFY_BASE_CREDITS + VERIFY_PER_CHUNK_CREDITS * Math.max(1, chunks);
}

/** 검수 한 묶음이 담는 양 — 값 안내와 실제 분할이 어긋나지 않게 여기 모아 둔다. */
export const VERIFY_CHUNK = {
  screens: 10, // 스펙팩: 화면 N개씩
  docChars: 16000, // 업로드 문서: 글자 N자씩
  maxDocChunks: 8, // 문서는 최대 N토막까지만
  maxSitePages: 6, // 사이트: 홈+주요 화면 최대 N페이지
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
