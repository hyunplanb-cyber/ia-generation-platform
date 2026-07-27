// 요금제(등급) 단일 정의. 권한·한도의 유일한 출처.
// 가격과 정확한 수량은 사용 데이터를 모은 뒤 확정하므로 지금은 null/임시값으로 둔다.
// (A단계: 등급 구조와 "무엇을 여는가"만 확정. 가격 산정은 이후.)

export type PlanId = "free" | "standard" | "pro";

export interface PlanDef {
  id: PlanId;
  name: string;
  /** 원화 월 가격. 데이터 확보 후 확정 → 지금은 null(미정) */
  priceKrw: number | null;
  /** 다운로드(파일 내려받기) 허용 여부. 무료는 화면 미리보기까지만. */
  canDownload: boolean;
  /** 만들 수 있는 프로젝트 수 상한. null = 무제한 */
  projectLimit: number | null;
  /** 사이트 검수 무료 횟수 상한. null = 무제한 */
  verifyLimit: number | null;
  /** 한 줄 설명 */
  tagline: string;
  /** 이 등급에서 열리는 기능 목록(요금제 안내 화면용) */
  features: string[];
}

export const PLANS: Record<PlanId, PlanDef> = {
  free: {
    id: "free",
    name: "무료",
    priceKrw: 0,
    canDownload: false,
    projectLimit: 1,
    verifyLimit: 1,
    tagline: "만들어보고 화면으로 확인하세요.",
    features: [
      "프로젝트 1개 생성",
      "산출물 6종 화면에서 전부 확인",
      "다운로드는 유료 플랜에서",
    ],
  },
  standard: {
    id: "standard",
    name: "스탠다드",
    priceKrw: null, // 미정
    canDownload: true,
    projectLimit: null,
    verifyLimit: null,
    tagline: "산출물을 파일로 받아 실무에 바로.",
    features: [
      "프로젝트 무제한 생성",
      "산출물 6종 전체 다운로드",
      "AI 빌드 스펙팩 포함",
    ],
  },
  pro: {
    id: "pro",
    name: "프로",
    priceKrw: null, // 미정
    canDownload: true,
    projectLimit: null,
    verifyLimit: null,
    tagline: "무제한 재생성과 상위 품질까지.",
    features: [
      "스탠다드의 모든 기능",
      "재생성 무제한",
      "디자인 프리셋",
      "상위 생성 모델 선택",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "standard", "pro"];

/** DB의 plan 문자열을 안전하게 PlanId로 정규화한다(알 수 없는 값은 free). */
export function normalizePlan(plan: string | null | undefined): PlanId {
  return plan === "standard" || plan === "pro" ? plan : "free";
}

export function getPlan(plan: string | null | undefined): PlanDef {
  return PLANS[normalizePlan(plan)];
}
