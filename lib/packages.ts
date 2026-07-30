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
  /** 검수 시나리오 수 = 화면 수. 확인 항목은 기능정의를 낱개로 쪼갠 수. */
  verify: { scenarios: number; checks: number };
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
  /** 디자인 프리셋 3종이 이 업종에서 어디에 어울리는지 (DESIGN_PRESETS와 같은 순서) */
  presetFits: [string, string, string];
  /**
   * AI는 화면(프로토타입)까지 만들어 준다. 그 뒤 개발자가 실제로 붙여야 하는 것들.
   * 구매 후 "버튼이 안 눌려요"가 나오지 않도록 구매 전에 명확히 알린다.
   */
  integrations: { area: string; detail: string }[];
  /** 이런 분께 추천 */
  audience: string[];
  /** 이 업종에서 특히 놓치기 쉬운 지점 — 판매 논거 */
  painPoints: string[];
  seo: { title: string; description: string; keywords: string[] };
}

const countItems = (s: string) => s.split("·").filter((x) => x.trim()).length;

// 모든 업종이 같은 프리셋 3종을 함께 받는다. 업종별로 다른 건 "어울리는 곳"뿐이라
// 그 문구만 PackageDef.presetFits로 따로 둔다(판매본 디자인프리셋 폴더와 같은 순서).
export const DESIGN_PRESETS = [
  { no: "01", name: "모던 네이비", tagline: "신뢰감과 밀도. 실무형 서비스의 기본값." },
  { no: "02", name: "미니멀 모노", tagline: "여백과 활자. 색을 빼면 내용이 남는다." },
  { no: "03", name: "소프트 파스텔", tagline: "부드럽고 친근하게. 처음 쓰는 사람도 겁먹지 않게." },
] as const;

/**
 * AI 코딩 도구가 어디까지 만들어 주는지 — 업종과 무관하게 같다.
 * 실측(Claude Code · Opus 5 · 추론 높음)에서 화면은 전부 나오지만,
 * 바깥 서비스를 불러야 하는 기능은 눌러도 반응하지 않는 상태로 남는다.
 */
export const BUILD_SCOPE = {
  made: [
    "화면 레이아웃과 구성요소 — 목록·상세·폼·표·모달",
    "화면 사이 이동 — 버튼을 누르면 설계한 화면으로",
    "예외·상태 화면 — 빈 목록, 오류, 마감 등",
    "디자인 프리셋을 함께 넣으면 전 화면 스타일 통일",
  ],
  needsDev: [
    "바깥 서비스를 부르는 기능 — 로그인·결제·지도·알림 등",
    "데이터 저장 — 입력한 내용이 서버에 남는 것",
    "권한과 보안 — 누가 무엇을 볼 수 있는지",
    "배포와 도메인 연결",
  ],
} as const;

/** 프리셋 문서 한 벌에 들어 있는 항목. */
export const PRESET_CONTENTS = [
  "색상 — 배경·본문·강조·경고까지 용도별 값",
  "타이포그래피 — 글꼴과 크기 단계",
  "모서리 · 여백 · 그림자",
  "컴포넌트 규칙 — 버튼·카드·입력·표",
  "화면 유형별 적용 지침",
  "AI에게 그대로 넣는 지시문",
] as const;

// 검수 시나리오 수치. lib/export/template-verify.ts의 생성 규칙과 같은 계산이라
// 판매 페이지에 적힌 숫자와 실제 파일이 어긋나지 않는다.
function verifyOf(funcs: string[]) {
  return {
    scenarios: funcs.length,
    checks: funcs.reduce((n, f) => n + Math.max(1, countItems(f)), 0),
  };
}

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
  const baseFuncs = base.menus.flatMap((m) => m.screens).map((x) => x.func);
  const sv = verifyOf(baseFuncs);
  const pv = verifyOf([
    ...deep.menus.flatMap((m) => m.screens).map((x) => x.func),
    ...Object.values(deep.subs)
      .flat()
      .map((l) => l.func),
  ]);
  return [
    {
      id: "standard",
      name: "스탠다드",
      priceKrw: 49000,
      summary: `화면 ${s.screens}개 · 2뎁스 기본 설계`,
      depthLabel: "메뉴 → 화면 (2뎁스)",
      stats: s,
      verify: sv,
      highlights: [
        `화면 ${s.screens}개와 화면별 프롬프트 ${s.screens}개`,
        "디자인 프리셋 3종 포함",
        `검수 시나리오 ${sv.scenarios}개`,
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
      verify: pv,
      highlights: [
        `화면 ${p.screens}개와 화면별 프롬프트 ${p.screens}개`,
        "탭·상태·예외까지 3뎁스로 분해",
        `검수 시나리오 ${pv.scenarios}개`,
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
    presetFits: [
      "B2B 교육, 사내 LMS, 기업 대상 강의 플랫폼",
      "전문가용 도구, 관리자 콘솔, 정보 밀도가 높은 화면",
      "B2C 강의 서비스, 취미·키즈 교육, 일반 사용자 대상",
    ],
    integrations: [
      { area: "로그인·회원가입", detail: "이메일 가입, 카카오·구글 등 소셜 로그인" },
      { area: "수강 결제", detail: "카드·간편결제(PG), 환불과 부분 취소" },
      { area: "강의 영상", detail: "영상 업로드·인코딩·스트리밍, 이어보기 시점 저장" },
      { area: "과제 파일", detail: "제출 파일 업로드와 보관" },
      { area: "알림", detail: "과제 마감·수강 안내 이메일/알림톡 발송" },
      { area: "강사 정산", detail: "정산액 계산과 계좌 지급" },
    ],
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
    presetFits: [
      "신뢰감이 중요한 피부관리·클리닉, 프랜차이즈 살롱",
      "감각적인 편집숍형 살롱, 남성 전용 바버샵",
      "네일·속눈썹 등 캐주얼 뷰티, 20~30대 타깃 매장",
    ],
    integrations: [
      { area: "로그인·회원가입", detail: "이메일 가입, 카카오 등 소셜 로그인, 휴대폰 본인인증" },
      { area: "예약금·결제", detail: "카드·간편결제(PG), 취소 수수료와 환불" },
      { area: "지도·위치", detail: "매장 찾기, 내 주변 검색, 길찾기 연결" },
      { area: "예약 알림", detail: "확정·리마인더·노쇼 안내 알림톡/문자 발송" },
      { area: "사진 업로드", detail: "시술 사진과 리뷰 이미지 저장" },
      { area: "예약 충돌 처리", detail: "같은 시간대 동시 예약을 막는 서버 처리" },
    ],
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
    presetFits: [
      "신뢰가 중요한 해외 투어·티켓 예약, 대형 여행 플랫폼",
      "사진이 주인공인 감성 여행 브랜드, 소규모 프라이빗 투어",
      "액티비티·레저 예약, 20~30대 자유여행객 타깃",
    ],
    integrations: [
      { area: "로그인·회원가입", detail: "이메일 가입, 소셜 로그인, 비회원 예약 조회" },
      { area: "예약 결제", detail: "카드·간편결제(PG), 해외 결제와 환율, 부분 취소 환불" },
      { area: "지도·위치", detail: "집합 장소 안내, 길찾기, 픽업 구역 조회" },
      { area: "바우처", detail: "QR 코드 발급과 현장 검증, 오프라인 보기" },
      { area: "알림", detail: "예약 확정·출발 임박·기상 취소 안내 발송" },
      { area: "다국어·통화", detail: "현지어 표기와 통화 변환" },
    ],
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
      // 상세는 고른 규모 기준으로 열린다(화면 목록·검수 수치까지 그 규모로 바뀐다).
      href: `/packages/${pkg.id}?plan=${plan.id}`,
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

/**
 * 받침 여부에 맞는 조사를 붙인다 — "스탠다드는", "프리미엄은".
 * 플랜 이름이 화면 문구에 섞여 나오므로 조사를 고정해 두면 어색해진다.
 */
export function withTopic(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasFinalConsonant = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${hasFinalConsonant ? "은" : "는"}`;
}
