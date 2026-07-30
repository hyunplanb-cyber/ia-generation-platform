// 판매 중인 기획 패키지 정의.
// 자체 결제(PG)가 붙기 전까지 결제는 크몽에서 처리한다.
// (우리 사이트 → 크몽 방향은 마켓 정책상 문제 없다. 반대 방향이 금지 대상.)
// kmongUrl이 null이면 아직 판매 전 → 구매 버튼 대신 "판매 준비 중"으로 표시한다.
//
// 업종 3종 × 플랜 2종 = 판매 상품 6개.
// 플랜은 "규모"로 나뉜다. 스탠다드는 2뎁스 기본판, 프리미엄은 탭·상태·예외까지
// 펼친 3뎁스 심화판(template-deep의 expandDeep이 쓰는 데이터와 같은 것).
// 두 플랜 모두 디자인 프리셋과 검수 시나리오를 포함한다 — 어느 쪽을 사도 완결형.
import { LMS, type TplMenu } from "@/template-data-lms";
import { BEAUTY } from "@/template-data-beauty";
import { TRAVEL } from "@/template-data-travel";
import { LMS_DEEP } from "@/template-data-lms-deep";
import { BEAUTY_DEEP } from "@/template-data-beauty-deep";
import { TRAVEL_DEEP } from "@/template-data-travel-deep";
import type { DeepInput } from "@/template-deep";

export interface TplData {
  project: { concept: string; designConcept: string; deviceMode: string };
  menus: TplMenu[];
}

export type PlanId = "standard" | "premium";

export interface PackagePlan {
  id: PlanId;
  /** 상품명에 붙는 플랜 이름 */
  name: string;
  priceKrw: number;
  /** 목록 카드에 쓰는 한 줄 요약 */
  summary: string;
  /** IA 깊이 라벨 */
  depthLabel: string;
  stats: { menus: number; screens: number; reqs: number; flows: number };
  /** 검수 시나리오 항목 수 표기 */
  verifyRange: string;
  /** 이 플랜에만 해당하는 강조 문구 */
  highlights: string[];
  kmongUrl: string | null;
  /** 목록에서 눈에 띄게 할 배지 */
  badge?: string;
}

export interface PackageDef {
  id: string;
  /** 목록·상세의 제목 */
  title: string;
  /** 업종 라벨 */
  industry: string;
  /** 한 줄 소개 */
  tagline: string;
  plans: PackagePlan[];
  /** 상세 페이지가 실제 산출물을 렌더링하는 데 쓰는 원본 데이터(스탠다드 기준) */
  data: TplData;
  /** 프리미엄의 3뎁스 심화 원본 */
  deep: DeepInput;
  /** 전문 공개할 프롬프트 화면 ref (나머지는 잠금 안내) */
  promptSamples: string[];
  /** 이런 분께 추천 */
  audience: string[];
  /** 이 업종에서 특히 놓치기 쉬운 지점 — 판매 논거 */
  painPoints: string[];
  seo: { title: string; description: string; keywords: string[] };
}

const countItems = (s: string) => s.split("·").filter((x) => x.trim()).length;

// 지표는 템플릿 데이터에서 직접 계산해, 화면에 적힌 숫자와 실제 산출물이 어긋나지 않게 한다.
function statsOf(data: { menus: { screens: { func: string; btns?: [string, string][] }[] }[] }) {
  const screens = data.menus.flatMap((m) => m.screens);
  return {
    menus: data.menus.length,
    screens: screens.length,
    reqs: screens.reduce((n, s) => n + countItems(s.func), 0),
    flows: screens.reduce((n, s) => n + (s.btns?.length ?? 0), 0),
  };
}

// 심화판 지표 — 기본 화면(2뎁스) + 잎사귀(3뎁스 탭·상태)를 합쳐 센다.
// expandDeep이 실제로 펼치는 화면 수와 같은 계산이라 표기와 산출물이 일치한다.
function deepStatsOf(deep: DeepInput) {
  const base = deep.menus.flatMap((m) => m.screens);
  const leaves = Object.values(deep.subs).flat();
  return {
    menus: deep.menus.length,
    screens: base.length + leaves.length,
    reqs:
      base.reduce((n, s) => n + countItems(s.func), 0) +
      leaves.reduce((n, l) => n + countItems(l.func), 0),
    flows: base.reduce((n, s) => n + (s.btns?.length ?? 0), 0),
  };
}

// 두 플랜의 뼈대는 업종이 달라도 같다. 숫자와 판매 링크만 업종별로 꽂는다.
function makePlans(
  base: TplData,
  deep: DeepInput,
  kmong: { standard: string | null; premium: string | null },
): PackagePlan[] {
  const s = statsOf(base);
  const p = deepStatsOf(deep);
  return [
    {
      id: "standard",
      name: "스탠다드",
      priceKrw: 49000,
      summary: `화면 ${s.screens}개 · 2뎁스 기본 설계`,
      depthLabel: "메뉴 → 화면 (2뎁스)",
      stats: s,
      verifyRange: "30~50",
      highlights: [
        `화면 ${s.screens}개와 화면별 프롬프트 ${s.screens}개`,
        "디자인 프리셋 3종 포함",
        "검수 시나리오 30~50개 항목",
      ],
      kmongUrl: kmong.standard,
    },
    {
      id: "premium",
      name: "프리미엄",
      priceKrw: 99000,
      summary: `화면 ${p.screens}개 · 3뎁스 심화 설계`,
      depthLabel: "메뉴 → 화면 → 탭·상태 (3뎁스)",
      stats: p,
      verifyRange: "100~150",
      highlights: [
        `화면 ${p.screens}개와 화면별 프롬프트 ${p.screens}개`,
        "탭·상태·예외까지 3뎁스로 분해",
        "검수 시나리오 100~150개 항목",
      ],
      kmongUrl: kmong.premium,
      badge: "가장 촘촘",
    },
  ];
}

export const PACKAGES: PackageDef[] = [
  {
    id: "lms",
    title: "온라인 강의 플랫폼 (LMS)",
    industry: "교육",
    tagline:
      "수강생 학습부터 강사의 수업 편성·학생 관리·정산까지 갖춘 강의 플랫폼 기획 패키지",
    plans: makePlans(LMS, LMS_DEEP, { standard: null, premium: null }),
    data: LMS,
    deep: LMS_DEEP,
    promptSamples: ["cl3", "cu3", "co6"],
    audience: [
      "인프런·클래스101 같은 강의 플랫폼을 만들려는 분",
      "사내 교육용 LMS를 구축해야 하는 담당자",
      "AI로 만들다 화면이 자꾸 빠져서 막힌 분",
    ],
    painPoints: [
      "진도율·수료 조건은 화면이 아니라 규칙이라, 말로만 시키면 AI가 매번 다르게 만든다",
      "과제 제출과 채점은 제출 전·제출 후·재제출·마감 후가 전부 다른 화면이다",
      "강사 정산은 수강료 환불이 끼는 순간 계산이 꼬인다",
    ],
    seo: {
      title: "온라인 강의 플랫폼(LMS) 화면설계서 · 기획 패키지",
      description:
        "온라인 강의 플랫폼(LMS) 기획 산출물 패키지입니다. 메뉴·화면 목록·기능정의·흐름도를 미리 확인하고 구매하세요.",
      keywords: [
        "LMS 화면설계서",
        "온라인 강의 플랫폼 기획서",
        "LMS 기획서 예시",
        "화면설계서 샘플",
        "기능정의서 예시",
      ],
    },
  },
  {
    id: "beauty",
    title: "뷰티샵 예약 플랫폼",
    industry: "뷰티·예약",
    tagline:
      "미용실·네일·왁싱·피부관리 매장을 찾아 예약하고, 매장은 예약·디자이너 일정·정산을 관리하는 예약 플랫폼 기획 패키지",
    plans: makePlans(BEAUTY, BEAUTY_DEEP, { standard: null, premium: null }),
    data: BEAUTY,
    deep: BEAUTY_DEEP,
    promptSamples: ["re3", "mg1", "st5"],
    audience: [
      "미용실·네일샵 예약 서비스를 만들려는 분",
      "지역 기반 예약 플랫폼을 준비하는 창업자",
      "노쇼·당일 취소 정책까지 설계해야 하는 분",
    ],
    painPoints: [
      "예약은 시술 소요시간과 디자이너 일정이 맞물려야 해서, 달력 하나로 끝나지 않는다",
      "당일 취소·노쇼 수수료는 화면보다 규칙이 먼저 정해져야 한다",
      "같은 시간대를 두 사람이 동시에 누르는 상황을 설계에서 빼먹기 쉽다",
    ],
    seo: {
      title: "뷰티샵 예약 플랫폼 화면설계서 · 기획 패키지",
      description:
        "미용실·네일·왁싱 예약 플랫폼 기획 산출물 패키지입니다. 예약 흐름, 매장 관리, 디자이너 일정까지 화면 목록과 기능정의를 미리 확인하세요.",
      keywords: [
        "예약 시스템 기획서",
        "미용실 예약 화면설계서",
        "네일샵 예약 앱 기획",
        "뷰티 플랫폼 기획서",
        "예약 시스템 기능정의서",
      ],
    },
  },
  {
    id: "travel",
    title: "해외 투어·티켓 예약 플랫폼",
    industry: "여행·예약",
    tagline:
      "해외 투어·입장권·패스를 날짜와 인원을 골라 예약하고, 현지에서 쓸 바우처를 받는 여행 예약 플랫폼 기획 패키지",
    plans: makePlans(TRAVEL, TRAVEL_DEEP, { standard: null, premium: null }),
    data: TRAVEL,
    deep: TRAVEL_DEEP,
    promptSamples: ["pr3", "bk6", "vc2"],
    audience: [
      "마이리얼트립 같은 투어·티켓 예약 서비스를 만들려는 분",
      "현지 투어 상품을 온라인으로 팔려는 분",
      "바우처·최소출발인원 같은 예외 처리가 필요한 분",
    ],
    painPoints: [
      "현지 시각과 한국 시각이 다르면 예약 마감 기준부터 다시 설계해야 한다",
      "최소 출발 인원 미달은 예약이 성립한 뒤에 터지는 예외라 화면이 따로 필요하다",
      "바우처는 오프라인에서 인터넷 없이 열려야 한다는 조건이 붙는다",
    ],
    seo: {
      title: "여행 예약 플랫폼 화면설계서 · 투어·티켓 기획 패키지",
      description:
        "해외 투어·티켓 예약 플랫폼 기획 산출물 패키지입니다. 날짜·인원 선택부터 바우처 발급, 최소인원 미달·예약 마감 같은 예외 화면까지 미리 확인하세요.",
      keywords: [
        "여행 예약 사이트 기획서",
        "투어 예약 화면설계서",
        "티켓 예약 앱 기획",
        "여행 플랫폼 기능정의서",
        "바우처 예약 시스템 기획",
      ],
    },
  },
];

/** 목록에 진열되는 낱개 상품 6개 (업종 3 × 플랜 2). */
export interface PackageProduct {
  pkg: PackageDef;
  plan: PackagePlan;
  /** 목록 카드에 노출할 상품명 */
  name: string;
  href: string;
}

export function packageProducts(): PackageProduct[] {
  return PACKAGES.flatMap((pkg) =>
    pkg.plans.map((plan) => ({
      pkg,
      plan,
      name: `${pkg.title} · ${plan.name}`,
      href: `/packages/${pkg.id}#plan-${plan.id}`,
    })),
  );
}

export function getPackage(id: string): PackageDef | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function getPlan(pkg: PackageDef, id: PlanId): PackagePlan {
  return pkg.plans.find((p) => p.id === id) ?? pkg.plans[0];
}

// 예외·상태 화면 판별. 화면명(예: "확인 및 결제")으로 걸면 정상 흐름까지 잡히므로
// 설계 시 부여한 역할(role)로 판별한다 — list-empty / error / form-closed / pending 등.
const EXCEPTION_ROLE = /(empty|error|closed|pending|expired)/;

export function exceptionScreens(data: TplData) {
  return data.menus.flatMap((m) => m.screens).filter((s) => EXCEPTION_ROLE.test(s.role));
}

/** 심화판까지 합친 예외·상태 화면 수. 프리미엄의 판매 논거로 쓴다. */
export function deepExceptionCount(deep: DeepInput): number {
  const base = deep.menus.flatMap((m) => m.screens).filter((s) => EXCEPTION_ROLE.test(s.role));
  const leaves = Object.values(deep.subs)
    .flat()
    .filter((l) => EXCEPTION_ROLE.test(l.role));
  return base.length + leaves.length;
}

/** 화면 하나가 3뎁스로 어떻게 펼쳐지는지 보여주는 미리보기용. */
export function deepSample(deep: DeepInput, refs: string[]) {
  const byRef = new Map(deep.menus.flatMap((m) => m.screens).map((s) => [s.ref, s]));
  return refs
    .map((ref) => ({ screen: byRef.get(ref), leaves: deep.subs[ref] ?? [] }))
    .filter((x) => x.screen && x.leaves.length > 0)
    .map((x) => ({ screen: x.screen!, leaves: x.leaves }));
}

export function formatKrw(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}
