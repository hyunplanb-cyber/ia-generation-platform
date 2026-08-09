// 크레딧 경제 — 값의 단일 출처(가격 정책서 기준). UI·서버 공용.
// 1크레딧 = 100원. 충전형(구독 아님).
import { REVIEW_MODE } from "@/lib/flags";

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
// 유효기간이 90일인 이유: 결제(PG)가 붙기 전까지의 한시 설정이다.
// 3일은 "빨리 써보고 충전하세요"라는 압박인데, 충전 자체가 막힌 지금은 누를 대상이 없다.
// 오히려 유튜브·인스타로 들어온 사람이 며칠 뒤 돌아왔을 때 크레딧이 없으면
// 출시일에 부를 명단이 그대로 죽는다.
// 30일로 뒀다가 90일로 늘린 이유: PG 승인이 1~2달 걸린다. 30일이면 지금 가입한 사람은
// 문 여는 날 이미 크레딧이 소멸해 있고, 불러 놓고 아무것도 못 하게 만드는 게 된다.
// PG를 열 때 3일로 되돌릴 것. 약관 제6조⑤의 표기도 함께 고쳐야 한다.
// 35로 잡은 이유: "만들고 미리보기까지는 마음껏, 다운로드는 못 하게"의 경계다.
//   기본 생성(10) 3회 = 30 / 상세 생성(23) 1회 + 기본 1회 = 33 → 둘 다 된다.
//   가장 싼 다운로드가 99(프리셋)라 무료로는 어떤 파일도 못 받는다.
// 원가는 하이쿠 기준 1인당 최대 660원 — 신규 회원 유치비로 본다.
export const FREE_CREDITS = 35;
export const FREE_TTL_DAYS = 90;
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

/* 충전 옵션 — 반드시 «고르는» 형태여야 하고 하나도 10만원을 넘으면 안 된다.
 *
 * 토스 「홈페이지 결제경로 제작 가이드(충전업종용)」 유의사항 3번이 그렇게 요구한다.
 *   임의 금액입력 후 충전하는 결제 방식은 이용이 불가능해요.
 *   반드시 10만원 이하의 금액을 선택하도록 구현해 주세요.
 * 이 규칙을 어기면 카드사 심사에서 반려된다. 그래서 직접 입력 충전을 들어내고(charge.ts)
 * 큰 금액이 필요한 자리를 여기 선택지로 옮겼다(2026-08-09).
 *
 * credits 값은 creditsForWon() 과 반드시 같아야 한다 — 두 벌로 적으면 갈라진다.
 * 5만·9만이 보너스 30%인 것은 bonusPctForWon 이 2만원 이상을 30%로 보기 때문이다.
 */
export const CREDIT_PACKS: CreditPack[] = [
  { id: "starter", name: "스타터", priceKrw: 5000, credits: 55, bonusPct: 10 },
  { id: "basic", name: "베이직", priceKrw: 10000, credits: 120, bonusPct: 20, popular: true },
  { id: "value", name: "밸류", priceKrw: 20000, credits: 260, bonusPct: 30 },
  { id: "plus", name: "플러스", priceKrw: 50000, credits: 650, bonusPct: 30 },
  /* 팩 한 벌을 크레딧으로 살 만한 자리 — 규정이 「10만원 이하」라 99,000까지 된다.
     처음엔 90,000으로 잡았는데 그건 보수적으로 둔 값이었고, 99,000이면
     117크레딧이 더 붙어 가장 비싼 등급(프리미엄 982)도 여유 있게 덮는다. */
  { id: "max", name: "맥스", priceKrw: 99000, credits: 1287, bonusPct: 30 },
];

/** 1회 충전 상한 — 토스 충전업종 가이드가 못 박은 값. 옵션을 늘릴 때 넘기면 안 된다. */
export const MAX_CHARGE_WON = 100000;

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
  /* 2026-08-09 — 가격정책표 v4 로 내렸다(390→290 · 690→490 · 590→490).
     원가는 그대로인데 값만 내려간 것이라 원가율이 이렇게 된다.
       AI팩 30-50   총 302크레딧 = 30,200원 · 원가 3,400원 → 원가율 11.3%
       AI팩 100-150 총 518크레딧 = 51,800원 · 원가 10,900원 → 원가율 21.0%
     둘 다 건강한 선이다. 관리자는 v4 에 따로 줄이 없어 100-150 과 같이 본다. */
  downloadScreens30: 290, // 다운로드 · AI팩 30~50 — 29,000원
  downloadScreens150: 490, // 다운로드 · AI팩 100~150 — 49,000원
  downloadAdmin: 490, // 다운로드 · 관리자 (100~150과 같은 규모)
  downloadVerify: 99, // 다운로드 · 검수 시나리오
  optionPreset: 99, // 옵션 · 디자인 프리셋
  // 프리셋을 고쳐서 다시 받을 때. 프리셋은 프로젝트에 묶이지 않는 파일이라
  // 한 번 받으면 다른 프로젝트에 그대로 넣어 쓸 수 있다 — 그래서 처음 값보다 싸게,
  // 대신 횟수를 둔다(2026-08-04). 고치지 않고 그대로 다시 받는 건 계속 무료다.
  optionPresetRevision: 30, // 옵션 · 디자인 프리셋 수정본
  optionVerify: 99, // 옵션 · 검수 시나리오
} as const;

/** 프리셋 수정본을 몇 번까지 받을 수 있나. */
export const PRESET_REVISION_LIMIT = 2;

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

/** 심사 기간의 보너스율.
 *
 * 30%는 아직 확정된 값이 아니다. 손님에게 어떻게 돌려줄지(충전을 깎을지,
 * 다운로드를 깎을지)는 프로모션 설계로 따로 정하기로 했다(2026-08-09).
 * 정해지지 않은 값을 심사 계정에 그대로 적용하면 지급이 필요 이상으로 커지므로
 * 심사 기간에는 10%로 낮춰 둔다. */
export const REVIEW_BONUS_PCT = 10;

// 충전 금액별 보너스율. 심사 기간에는 금액과 무관하게 REVIEW_BONUS_PCT 로 고정한다.
export function bonusPctForWon(won: number): number {
  if (REVIEW_MODE) return won >= 1000 ? REVIEW_BONUS_PCT : 0;
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

/* 직접 입력 충전 한도는 없앴다(2026-08-09).
   최대가 1,000,000원이라 토스가 정한 1회 10만원의 «열 배»였고,
   방식 자체(임의 금액 입력)가 충전업종 심사에서 불가다. 위 CREDIT_PACKS 로 대체. */

// 프로젝트 산출물 전체 다운로드 원가 — 상세(3뎁스)면 더 비싸다.
export function downloadCost(hasDetail: boolean): number {
  return hasDetail ? CREDIT_COST.downloadScreens150 : CREDIT_COST.downloadScreens30;
}
