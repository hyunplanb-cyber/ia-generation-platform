// 판매 중인 AI팩(기획 산출물 한 벌) 정의.
// 자체 결제(PG)가 붙기 전까지 결제는 크몽에서 처리한다.
// (우리 사이트 → 크몽 방향은 마켓 정책상 문제 없다. 반대 방향이 금지 대상.)
// kmongUrl이 null이면 아직 판매 전 → 구매 버튼 대신 "판매 준비 중"으로 표시한다.
//
// 등급은 네 칸이고, 사다리가 아니라 2×2다(자세한 축은 PlanId 주석 참고).
//   스탠다드 / 플러스 = 문서만. 2뎁스 기본판 / 탭·상태·예외까지 펼친 3뎁스 심화판
//   디럭스   / 프리미엄 = 거기에 검수 시나리오 + 실제로 만들어 둔 화면(HTML)
// 디자인 프리셋은 전 등급 공통.
// "만들기 전(설계)"과 "오픈 전(검수)"을 축으로 갈랐다.
// 만들어 둔 화면이 있는 업종에만 디럭스·프리미엄이 생긴다(현재 여행의 3뎁스뿐).
import type { DesignKey, LayoutKey } from "@/lib/design-presets";
import { splitFuncDef } from "@/lib/export/requirements";
import { COMMON_VERIFY_CHECKS } from "@/lib/export/template-verify";
import { PACKAGE_PRICES_PUBLIC } from "@/lib/flags";
import { LMS, type TplMenu } from "@/template-data-lms";
import { BEAUTY } from "@/template-data-beauty";
import { TRAVEL } from "@/template-data-travel";
import { GROUPBUY } from "@/template-data-groupbuy";
import { MATCHING } from "@/template-data-matching";
import { RENTAL } from "@/template-data-rental";
import { INTERIOR } from "@/template-data-interior";
import { LMS_DEEP } from "@/template-data-lms-deep";
import { BEAUTY_DEEP } from "@/template-data-beauty-deep";
import { TRAVEL_DEEP } from "@/template-data-travel-deep";
import { GROUPBUY_DEEP } from "@/template-data-groupbuy-deep";
import { MATCHING_DEEP } from "@/template-data-matching-deep";
import { RENTAL_DEEP } from "@/template-data-rental-deep";
import { INTERIOR_DEEP } from "@/template-data-interior-deep";
import type { DeepInput } from "@/template-deep";
import { SHOWCASE_VIDEO_ID } from "@/lib/site";

export interface TplData {
  project: { concept: string; designConcept: string; deviceMode: string };
  menus: TplMenu[];
}

/**
 * 등급은 사다리가 아니라 2×2다. 축이 둘이다 — 설계 깊이 × 완성 화면 유무.
 *
 *              문서만              + 검수 시나리오 + 완성 화면(HTML)
 *   2뎁스   standard 330크레딧        deluxe  704크레딧
 *   3뎁스   plus     503크레딧        premium 982크레딧
 *
 * 값의 뿌리는 "직접 만들면 드는 크레딧"이다. 재고는 남의 컨셉이라
 * 직접 만들기보다 비싸면 살 이유가 없다 — 그래서 그 선을 넘지 않는다.
 *
 * 2026-08-09 — 가격정책표 v4. **팩은 크레딧으로 산다.**
 * 1크레딧 = 100원이라 값을 100으로 나누면 크레딧이 된다(packCredits).
 * 충전과 지갑이 하나라 남은 크레딧이 놀지 않는다.
 *
 * 값은 두 번 움직였다.
 *   ① 다운로드 크레딧을 290/490 으로 내려 낱개 합이 413/629/880/1,228 이 됐다.
 *   ② 거기서 **20% 더 내려** 330/503/704/982 로 확정했다.
 *
 * ②의 까닭 — 낱개 합 그대로면 「직접 만들기」와 값이 **완전히 같아진다.**
 * 그런데 직접 만들기는 무료 크레딧으로 만들어 보고 마음에 들 때 결제하는데,
 * 팩은 사야 볼 수 있다. 같은 값이면 손님은 리스크가 없는 쪽을 고른다.
 * 팩은 이미 만들어 둔 파일이라 **한계원가가 0**이라 깎을 여유가 있다.
 *
 * 딸려 온 효과 — 가장 비싼 프리미엄이 982크레딧이 되어 **1회 충전(99,000원 = 1,287)에
 * 들어온다.** 전에는 1,228이라 두 번 충전해야 했다. 토스가 1회 충전을 10만원으로
 * 묶어 둔 것과 맞물리는 자리라, 값을 정할 때 이 선을 넘기지 않아야 한다.
 *
 * 이름은 일부러 사다리처럼 뒀다 — 2×2를 대놓고 보여주면 구매자가 표를 만들어
 * 계산하기 시작한다. 대신 홈에서 넷을 한 줄에 나란히 놓지 않는다.
 *
 * deluxe·premium은 완성 화면(HTML)이 실제로 있는 업종에만 생긴다 — 없는 걸 팔지 않는다.
 */
export type PlanId = "standard" | "plus" | "deluxe" | "premium";

/** 등급 키 → 한국어 이름. 판매 zip 폴더 이름도 여기서 읽는다(package-template.mts). */
export const PLAN_NAMES: Record<PlanId, string> = {
  standard: "스탠다드",
  plus: "플러스",
  deluxe: "디럭스",
  premium: "프리미엄",
};

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
  /**
   * 검수 시나리오 수 = 화면 수. 확인 항목은 기능정의를 낱개로 쪼갠 수.
   * 디럭스·프리미엄에만 있다 — "만들기 전(설계)"과 "오픈 전(검수)"을 축으로 갈랐다.
   */
  verify?: { scenarios: number; checks: number };
  /** 이 스펙팩으로 실제로 만들어 둔 화면(HTML) 수. 있으면 디럭스 또는 프리미엄. */
  siteScreens?: number;
  /** 이 플랜에만 해당하는 강조 문구 */
  highlights: string[];
  kmongUrl: string | null;
  /** 목록에서 눈에 띄게 할 배지 */
  badge?: string;
}

/* ─── 무엇을 만드는 사이트인가 (갈래) ────────────────────────────
 *
 * 왜 나누나 — 2026-08-10
 *   팩이 스무 칸이 되면서 한 줄로 늘어놓으면 못 찾는다.
 *   손님은 「내 업종」이 아니라 **「내가 만들려는 것의 «종류»」**로 찾는다 —
 *   미용실을 하시는 분이 「뷰티」를 찾는 게 아니라 「예약받는 사이트」를 찾는다.
 *   그래서 업종(industry)이 아니라 «만들려는 것»으로 가른다.
 *
 * 아임웹·카페24의 갈래를 참고하되 우리 것에 맞췄다.
 * 우리는 **카페24로 안 되는 맞춤형**만 판다 — 그래서 「일반 쇼핑몰」 갈래가 없다.
 *
 * ⚠ 비어 있는 갈래는 «화면에 안 나온다»(listedCategories).
 *   팩이 들어오면 저절로 나타난다. 빈 칸을 눌러 아무것도 없으면 손님이 떠난다.
 */
export const CATEGORIES = [
  { id: "booking", label: "예약·일정", desc: "날짜와 사람을 맞춰 잡는 서비스" },
  { id: "commerce", label: "커머스·거래", desc: "물건이나 서비스를 사고파는 곳" },
  { id: "matching", label: "중개·매칭", desc: "찾는 사람과 해 주는 사람을 잇는 곳" },
  { id: "learning", label: "교육·학습", desc: "가르치고 배우는 곳" },
  { id: "community", label: "커뮤니티·콘텐츠", desc: "모여서 읽고 쓰는 곳" },
  { id: "biztool", label: "관리·업무도구", desc: "안에서 쓰는 관리자 화면" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export interface PackageDef {
  id: string;
  /** 목록·상세의 제목 */
  title: string;
  /** 무엇을 만드는 사이트인가 — 목록에서 이걸로 거른다 */
  category: CategoryId;
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
  /**
   * 이 업종의 판매팩에 넣는 기본 프리셋 3종. 테마 6종에서 업종에 맞게 고른다.
   * 사양은 salePresetConfig()로 고정한다(프리텐다드·기본 모서리·넉넉한 밀도·라이트)
   * — 셋의 차이는 테마와 색뿐이다.
   * 바꾸면 build-design-presets.mts의 styles도 같이 바꾸고 그 업종 프리셋 파일을
   * 다시 만들어야 한다. 어긋나면 그 스크립트가 멈춘다.
   */
  presetStyles: [DesignKey, DesignKey, DesignKey];
  /** 위 3종이 이 업종에서 어디에 어울리는지 (presetStyles와 같은 순서) */
  presetFits: [string, string, string];
  /**
   * 판매팩 zip 파일 이름의 앞부분 — `여행_프리미엄.zip`의 "여행".
   * package-template.mts가 만드는 파일명과 같아야 산 사람에게 파일을 줄 수 있다.
   * 어긋나면 그 스크립트가 멈춘다.
   */
  fileLabel: string;
  /**
   * 판매팩에 함께 넣는 레이아웃 골격 2종.
   *
   * 색과 골격을 한 파일에 묶어 두면 "코럴을 쓰려면 사진 중심형이어야 한다"가 되어
   * 고를 수 있는 게 3가지뿐이다. 따로 넣으면 3 × 2 = 6가지가 된다(2026-08-03).
   * 업종에 어울리는 둘을, 서로 확실히 다른 골격으로 고른다.
   */
  layoutKeys: [LayoutKey, LayoutKey];
  /**
   * AI는 화면(프로토타입)까지 만들어 준다. 그 뒤 개발자가 실제로 붙여야 하는 것들.
   * 구매 후 "버튼이 안 눌려요"가 나오지 않도록 구매 전에 명확히 알린다.
   */
  integrations: { area: string; detail: string }[];
  /**
   * 이 AI팩의 스펙팩으로 실제 만들어 본 데모 사이트(public/demo/).
   * 없는 업종은 비워 둔다 — 없는 걸 링크하느니 안 보이는 게 낫다.
   */
  demoUrl?: string;
  /** 이 AI팩으로 실제 만드는 과정을 담은 유튜브 영상 ID. 없으면 영상 영역이 안 나온다. */
  videoId?: string;
  /** 이런 분께 추천 */
  audience: string[];
  /** 이 업종에서 특히 놓치기 쉬운 지점 — 판매 논거 */
  painPoints: string[];
  seo: { title: string; description: string; keywords: string[] };
}

// 요건·확인 항목을 세는 방식은 실제로 파일을 만드는 것과 **같은 함수**를 쓴다.
//
// 예전엔 여기서만 '·'로 잘라 세서, 괄호 안의 열거까지 한 개씩 세어졌다.
// 판매 페이지에는 "확인 항목 368개"라고 적히는데 파일을 열면 다른 수가 나왔다
// (2026-08-03). 세는 곳과 만드는 곳이 다르면 반드시 어긋난다.
const countItems = (s: string) => splitFuncDef(s).length;

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
    "디자인 규칙을 함께 넣으면 전 화면 스타일 통일",
  ],
  needsDev: [
    "바깥 서비스를 부르는 기능 — 로그인·결제·지도·알림 등",
    "데이터 저장 — 입력한 내용이 서버에 남는 것",
    "권한과 보안 — 누가 무엇을 볼 수 있는지",
    "배포와 도메인 연결",
  ],
} as const;

/**
 * 프리셋 한 벌에 들어 있는 항목.
 *
 * "예쁜 색을 준다"로 팔면 안 된다 — AI 코딩 도구도 색은 알아서 그럴듯하게 고른다.
 * 프리셋이 하는 일은 **화면 수십·수백 개가 끝까지 같은 얼굴을 유지하게** 하는 것이다.
 * 한 번에 다 못 만들어 여러 번 나눠 돌리면 AI가 매번 조금씩 다른 값을 쓰는데,
 * 그때 어제 만든 화면과 오늘 만든 화면이 다른 사이트처럼 보인다(2026-08-04).
 */
export const PRESET_CONTENTS = [
  "색상 — 배경·본문·강조·경고까지 용도별 값",
  "타이포그래피 — 글꼴과 크기 단계",
  "모서리 · 여백 · 그림자",
  "컴포넌트 규칙 — 버튼·카드·입력·표",
  "화면 유형별 적용 지침",
  "AI에게 그대로 넣는 지시문",
] as const;

/** 프리셋이 왜 필요한지 — 판매 화면에서 한 줄로 쓰는 문구. */
export const PRESET_WHY =
  "화면을 여러 번 나눠 만들면 AI가 매번 조금씩 다른 색과 간격을 씁니다. 디자인 규칙은 그 값을 고정해, 첫 화면부터 마지막 화면까지 같은 얼굴을 유지하게 합니다.";

// 검수 시나리오 수치. lib/export/template-verify.ts의 생성 규칙과 같은 계산이라
// 판매 페이지에 적힌 숫자와 실제 파일이 어긋나지 않는다.
function verifyOf(funcs: string[]) {
  return {
    scenarios: funcs.length,
    // 화면별 항목 + 사이트 전체를 두고 보는 공통 점검(뒤로가기·헤더·죽은 버튼 등).
    // 공통 점검은 화면 수와 무관하게 고정이라 그 개수를 더한다(template-verify.ts).
    checks:
      funcs.reduce((n, f) => n + Math.max(1, countItems(f)), 0) + COMMON_VERIFY_CHECKS,
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

// 플랜의 뼈대는 업종이 달라도 같다. 숫자와 판매 링크만 업종별로 꽂는다.
// site.base / site.deep 에 완성 화면 수를 주면 그 칸(deluxe / premium)이 생긴다.
function makePlans(
  base: TplData,
  deep: DeepInput,
  kmong: {
    standard: string | null;
    plus: string | null;
    deluxe?: string | null;
    premium?: string | null;
  },
  site?: { base?: number; deep?: number },
): PackagePlan[] {
  const s = statsOf(base);
  const p = deepStatsOf(deep);
  // 검수 시나리오 수는 그 등급이 담는 설계 분량을 따라간다.
  const sv = verifyOf(base.menus.flatMap((m) => m.screens).map((x) => x.func));
  const pv = verifyOf([
    ...deep.menus.flatMap((m) => m.screens).map((x) => x.func),
    ...Object.values(deep.subs)
      .flat()
      .map((l) => l.func),
  ]);
  const plans: PackagePlan[] = [
    {
      id: "standard",
      name: PLAN_NAMES.standard,
      priceKrw: 33000, // 330크레딧 — 낱개 합 413 에서 20% 내린 값(v4 확정 판매가)
      summary: `화면 ${s.screens}개 · 기본 설계`,
      depthLabel: "메뉴 → 화면까지",
      stats: s,
      highlights: [
        `화면 ${s.screens}개와 화면별 프롬프트 ${s.screens}개`,
        "디자인 프리셋 포함",
        "가볍게 시작하는 분께",
      ],
      kmongUrl: kmong.standard,
    },
    {
      id: "plus",
      name: PLAN_NAMES.plus,
      priceKrw: 50300, // 503크레딧 — 낱개 합 629 에서 20% 내린 값
      summary: `화면 ${p.screens}개 · 상세 설계`,
      depthLabel: "메뉴 → 화면 → 화면 속 탭·예외까지",
      stats: p,
      highlights: [
        `화면 ${p.screens}개와 화면별 프롬프트 ${p.screens}개`,
        "화면 안의 탭과 예외 화면까지 따로 세워요",
        "실무에서 2~3개월 걸리는 분량",
      ],
      kmongUrl: kmong.plus,
    },
  ];

  // 2뎁스 설계로 만들어 둔 화면이 있을 때만 디럭스가 생긴다.
  if (site?.base) {
    plans.push({
      id: "deluxe",
      name: PLAN_NAMES.deluxe,
      priceKrw: 70400, // 704크레딧 — 낱개 합 880 에서 20% 내린 값
      summary: `설계 ${s.screens}개 + 만들어 둔 화면 ${site.base}개`,
      depthLabel: "메뉴 → 화면까지 + 완성 화면",
      stats: s,
      verify: sv,
      siteScreens: site.base,
      highlights: [
        `이미 만들어 둔 화면 ${site.base}개 (HTML)`,
        `검수 시나리오 ${sv.scenarios}개 · 확인 항목 ${sv.checks}개`,
        "화면을 고쳐서 다시 뽑는 도구 포함",
      ],
      kmongUrl: kmong.deluxe ?? null,
    });
  }

  // 3뎁스 설계로 만들어 둔 화면이 있을 때만 프리미엄이 생긴다.
  if (site?.deep) {
    plans.push({
      id: "premium",
      name: PLAN_NAMES.premium,
      priceKrw: 98200, // 982크레딧 — 낱개 합 1,228 에서 20% 내린 값. 1회 충전(1,287)에 들어온다
      summary: `설계 ${p.screens}개 + 만들어 둔 화면 ${site.deep}개`,
      depthLabel: "메뉴 → 화면 → 화면 속 탭·예외까지 + 완성 화면",
      stats: p,
      verify: pv,
      siteScreens: site.deep,
      highlights: [
        `이미 만들어 둔 화면 ${site.deep}개 (HTML)`,
        `검수 시나리오 ${pv.scenarios}개 · 확인 항목 ${pv.checks}개`,
        "화면을 고쳐서 다시 뽑는 도구 포함",
      ],
      kmongUrl: kmong.premium ?? null,
      badge: "전부 들어 있음",
    });
  }
  return plans;
}

export const PACKAGES: PackageDef[] = [
  {
    id: "lms",
    title: "온라인 강의 플랫폼 (LMS)",
    category: "learning",
    industry: "교육",
    tagline:
      "수강생 학습부터 강사의 수업 편성·학생 관리·정산까지 갖춘 강의 플랫폼 AI팩",
    /* 2뎁스 44화면은 코럴 선셋 + 대시보드형,
       3뎁스 132화면은 모던 네이비 + 에디토리얼형으로 만들었다(2026-08-09).
       두 등급의 프리셋을 «일부러» 다르게 뒀다 — 같은 스펙팩이라도 프리셋을 갈아
       끼우면 화면이 이렇게 달라진다는 것을 나란히 보여 주는 것이 이 팩의 값이다.
       한동안 site 를 아예 안 넘겨서 디럭스가 빠져 있었다(같은 날 발견). */
    plans: makePlans(
      LMS,
      LMS_DEEP,
      { standard: null, plus: null, deluxe: null, premium: null },
      { base: 44, deep: 132 },
    ),
    data: LMS,
    deep: LMS_DEEP,
    promptSamples: ["cl3", "cu3", "co6"],
    presetStyles: ["navy", "mono", "coral"],
    presetFits: [
      "B2B 교육, 사내 LMS, 기업 대상 강의 플랫폼",
      "전문가용 도구, 관리자 콘솔, 정보 밀도가 높은 화면",
      "B2C 강의 서비스, 취미·키즈 교육, 일반 사용자 대상",
    ],
    layoutKeys: ["console", "magazine"],
    fileLabel: "LMS",
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
      title: "온라인 강의 플랫폼(LMS) 화면설계서 · AI팩",
      description:
        "온라인 강의 플랫폼(LMS) AI팩(기획 산출물 한 벌)입니다. 메뉴·화면 목록·기능정의·흐름도를 미리 확인하고 구매하세요.",
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
    category: "booking",
    industry: "뷰티·예약",
    tagline:
      "미용실·네일·왁싱·피부관리 매장을 찾아 예약하고, 매장은 예약·디자이너 일정·정산을 관리하는 예약 플랫폼 AI팩",
    // 화면을 실제로 만들어 뒀다 → 디럭스·프리미엄이 둘 다 생긴다.
    // 2뎁스 49화면은 소프트 파스텔, 3뎁스 136화면은 코럴 선셋으로 만들었다.
    plans: makePlans(
      BEAUTY,
      BEAUTY_DEEP,
      { standard: null, plus: null, deluxe: null, premium: null },
      { base: 49, deep: 136 },
    ),
    data: BEAUTY,
    deep: BEAUTY_DEEP,
    promptSamples: ["re3", "mg1", "st5"],
    // 내추럴 그린은 뷰티에 안 어울려 소프트 파스텔로 바꿨다(2026-08-04).
    presetStyles: ["coral", "mono", "pastel"],
    presetFits: [
      "네일·속눈썹·왁싱 등 캐주얼 뷰티, 20~30대 타깃 매장",
      "감각적인 편집숍형 살롱, 남성 전용 바버샵",
      "부드러운 인상이 중요한 피부관리·에스테틱, 아이·산모 대상 케어",
    ],
    layoutKeys: ["showcase", "calm"],
    fileLabel: "뷰티샵",
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
      title: "뷰티샵 예약 플랫폼 화면설계서 · AI팩",
      description:
        "미용실·네일·왁싱 예약 플랫폼 AI팩(기획 산출물 한 벌)입니다. 예약 흐름, 매장 관리, 디자이너 일정까지 화면 목록과 기능정의를 미리 확인하세요.",
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
    category: "booking",
    industry: "여행·예약",
    tagline:
      "해외 투어·입장권·패스를 날짜와 인원을 골라 예약하고, 현지에서 쓸 바우처를 받는 여행 예약 플랫폼 AI팩",
    // 여행만 화면을 실제로 만들어 뒀다 → 디럭스·프리미엄이 둘 다 생긴다.
    // 2뎁스 43화면은 소프트 파스텔, 3뎁스 144화면은 모던 네이비로 만들었다.
    plans: makePlans(
      TRAVEL,
      TRAVEL_DEEP,
      { standard: null, plus: null, deluxe: null, premium: null },
      { base: 43, deep: 144 },
    ),
    data: TRAVEL,
    deep: TRAVEL_DEEP,
    promptSamples: ["pr3", "bk6", "vc2"],
    presetStyles: ["navy", "mono", "pastel"],
    presetFits: [
      "신뢰가 중요한 해외 투어·티켓 예약, 대형 여행 플랫폼",
      "사진이 주인공인 감성 여행 브랜드, 소규모 프라이빗 투어",
      "액티비티·레저 예약, 20~30대 자유여행객 타깃",
    ],
    layoutKeys: ["search", "showcase"],
    fileLabel: "여행",
    integrations: [
      { area: "로그인·회원가입", detail: "이메일 가입, 소셜 로그인, 비회원 예약 조회" },
      { area: "예약 결제", detail: "카드·간편결제(PG), 해외 결제와 환율, 부분 취소 환불" },
      { area: "지도·위치", detail: "집합 장소 안내, 길찾기, 픽업 구역 조회" },
      { area: "바우처", detail: "QR 코드 발급과 현장 검증, 오프라인 보기" },
      { area: "알림", detail: "예약 확정·출발 임박·기상 취소 안내 발송" },
      { area: "다국어·통화", detail: "현지어 표기와 통화 변환" },
    ],
    // 프리미엄 스펙팩(144화면)을 Claude Code(Opus 5)로 그대로 구현한 결과.
    demoUrl: "/demo/travel/index.html",
    videoId: SHOWCASE_VIDEO_ID,
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
      title: "여행 예약 플랫폼 화면설계서 · 투어·티켓 AI팩",
      description:
        "해외 투어·티켓 예약 플랫폼 AI팩(기획 산출물 한 벌)입니다. 날짜·인원 선택부터 바우처 발급, 최소인원 미달·예약 마감 같은 예외 화면까지 미리 확인하세요.",
      keywords: [
        "여행 예약 사이트 기획서",
        "투어 예약 화면설계서",
        "티켓 예약 앱 기획",
        "여행 플랫폼 기능정의서",
        "바우처 예약 시스템 기획",
      ],
    },
  },
  {
    id: "groupbuy",
    title: "공동구매(공구) 플랫폼",
    category: "commerce",
    industry: "커머스·공구",
    tagline:
      "목표 인원이 차야 할인가로 성사되고 미달이면 전액 환불되는, 조건부 결제 공동구매 플랫폼 AI팩",
    // 화면을 실제로 만들어 뒀다 → 네 등급이 다 생긴다.
    // 2뎁스 37화면은 코럴 선셋, 3뎁스 125화면은 미니멀 모노로 만들었다(완성화면 CSS에서 잰 값).
    plans: makePlans(
      GROUPBUY,
      GROUPBUY_DEEP,
      { standard: null, plus: null, deluxe: null, premium: null },
      { base: 37, deep: 125 },
    ),
    data: GROUPBUY,
    deep: GROUPBUY_DEEP,
    promptSamples: ["ho1", "de2", "jo3"],
    // build-design-presets.mts 의 TARGETS.groupbuy 와 «같은 순서»라야 한다(그 파일이 대조한다).
    presetStyles: ["navy", "mono", "coral"],
    presetFits: [
      "신뢰가 중요한 대형 공동구매·소셜커머스, 안정감 있는 브랜드",
      "감각적인 셀렉트 공구·인플루언서 공구, 편집숍형 큐레이션",
      "생활밀착 저가 공구·맘카페형, 20~30대 모바일 타깃",
    ],
    layoutKeys: ["bold", "bento"],
    fileLabel: "공동구매",
    integrations: [
      { area: "로그인·회원가입", detail: "이메일 가입, 카카오·네이버 소셜 로그인" },
      { area: "조건부 결제", detail: "성사 전 결제 보류, 미달 시 전액 자동 환불" },
      { area: "재고·수량", detail: "동시 참여로 목표 수량을 넘지 않게 막는 서버 처리" },
      { area: "배송", detail: "송장 등록과 배송 조회 연동" },
      { area: "알림", detail: "달성 임박·성사·취소 안내 알림톡 발송" },
      { area: "진행자 정산", detail: "성사분 정산액 계산과 계좌 지급" },
    ],
    audience: [
      "공동구매 플랫폼을 만들려는 분",
      "인플루언서 공구를 시스템으로 옮기려는 분",
      "목표 미달 시 자동 환불까지 설계해야 하는 분",
    ],
    painPoints: [
      "목표 미달 취소는 결제가 끝난 뒤에 터지는 예외라 화면이 따로 필요하다",
      "달성률과 남은 시간은 화면이 아니라 규칙이라, 말로만 시키면 매번 다르게 만든다",
      "같은 수량을 여러 사람이 동시에 누르는 상황을 설계에서 빼먹기 쉽다",
    ],
    seo: {
      title: "공동구매(공구) 플랫폼 화면설계서 · AI팩",
      description:
        "공동구매 플랫폼 AI팩(기획 산출물 한 벌)입니다. 목표 달성·조건부 결제·미달 환불까지 화면 목록과 기능정의를 미리 확인하세요.",
      keywords: [
        "공동구매 사이트 기획서",
        "공구 플랫폼 화면설계서",
        "소셜커머스 기획서 예시",
        "공동구매 기능정의서",
        "조건부 결제 시스템 기획",
      ],
    },
  },
  {
    id: "matching",
    title: "동네 서비스 매칭 플랫폼",
    category: "matching",
    industry: "매칭·중개",
    tagline:
      "요청서 한 장을 보내면 고수들이 각자 값을 불러 견적을 보내고, 비교해서 고르는 매칭 플랫폼 AI팩",
    /* 2뎁스 43화면은 모던 네이비 + 좌우 분할형,
       3뎁스 159화면은 미니멀 모노 + 목록 중심형으로 만들었다(2026-08-10).
       두 등급의 프리셋을 «일부러» 다르게 뒀다 — 같은 스펙팩이라도 프리셋을 갈아
       끼우면 화면이 이렇게 달라진다는 것을 나란히 보여 주는 것이 이 팩의 값이다. */
    plans: makePlans(
      MATCHING,
      MATCHING_DEEP,
      { standard: null, plus: null, deluxe: null, premium: null },
      { base: 43, deep: 159 },
    ),
    data: MATCHING,
    deep: MATCHING_DEEP,
    promptSamples: ["ho1", "re2", "qu3"],
    presetStyles: ["navy", "mono", "forest"],
    presetFits: [
      "신뢰가 먼저인 매칭·중개 서비스, 이사·인테리어처럼 금액이 큰 분야",
      "과외·레슨·컨설팅처럼 사람 자체가 상품인 분야",
      "청소·수리·돌봄처럼 생활에 가까운 분야, 안심이 중요한 서비스",
    ],
    layoutKeys: ["split", "list"],
    fileLabel: "매칭",
    integrations: [
      { area: "로그인·회원가입", detail: "이메일 가입, 소셜 로그인, 고수 본인인증" },
      { area: "견적 크레딧", detail: "고수가 견적을 보낼 때 차감하는 크레딧 충전·결제" },
      { area: "채팅", detail: "손님과 고수의 실시간 대화, 사진·파일 주고받기" },
      { area: "지도·위치", detail: "활동 지역 설정과 내 주변 고수 찾기" },
      { area: "알림", detail: "새 요청·견적 도착·선택 결과 발송" },
      { area: "고수 정산", detail: "완료 건 정산액 계산과 계좌 지급" },
    ],
    audience: [
      "숨고 같은 서비스 매칭 플랫폼을 만들려는 분",
      "지역 기반 전문가 중개 서비스를 준비하는 창업자",
      "요청서·견적·선택까지 3자 흐름을 설계해야 하는 분",
    ],
    painPoints: [
      "한 계정이 손님과 고수 두 권한을 오가는 구조라, 화면을 두 벌로 세워야 한다",
      "요청서는 한 번에 한 질문씩 물어야 해서 단계마다 화면이 갈린다",
      "견적은 보낸 뒤 취소·수정·만료가 전부 다른 화면이다",
    ],
    seo: {
      title: "서비스 매칭 플랫폼 화면설계서 · 숨고형 AI팩",
      description:
        "동네 서비스 매칭 플랫폼 AI팩(기획 산출물 한 벌)입니다. 요청서·견적 비교·채팅·정산까지 화면 목록과 기능정의를 미리 확인하세요.",
      keywords: [
        "매칭 플랫폼 기획서",
        "숨고 같은 사이트 기획",
        "견적 비교 서비스 화면설계서",
        "중개 플랫폼 기능정의서",
        "요청서 시스템 기획",
      ],
    },
  },
  {
    id: "rental",
    title: "장비 렌탈·대여 예약 플랫폼",
    category: "commerce",
    industry: "렌탈·대여",
    tagline:
      "캠핑·카메라 장비를 날짜를 잡아 빌려주고 돌려받는 렌탈 예약 플랫폼 AI팩. 날짜별 재고 달력부터 반납·연체·보증금 정산까지",
    /* 2뎁스 37화면은 내추럴 그린 + 검색 중심형,
       3뎁스 161화면은 레트로 페이퍼 + 목록 중심형으로 만들었다(2026-08-10).
       두 등급의 프리셋을 «일부러» 다르게 뒀다 — 같은 스펙팩이라도 프리셋을 갈아
       끼우면 화면이 이렇게 달라진다는 것을 나란히 보여 주는 것이 이 팩의 값이다. */
    plans: makePlans(
      RENTAL,
      RENTAL_DEEP,
      { standard: null, plus: null, deluxe: null, premium: null },
      { base: 37, deep: 161 },
    ),
    data: RENTAL,
    deep: RENTAL_DEEP,
    promptSamples: ["pd3", "rt5", "st2"],
    presetStyles: ["forest", "mono", "retro"],
    presetFits: [
      "캠핑·아웃도어 장비 렌탈, 친환경·자연을 앞세우는 브랜드",
      "카메라·음향처럼 사양이 중요한 전문 장비 렌탈, 표와 숫자가 주인공인 화면",
      "빈티지·감성 소품 대여, 파티·촬영 소품처럼 분위기를 파는 대여",
    ],
    layoutKeys: ["search", "list"],
    fileLabel: "장비렌탈",
    integrations: [
      { area: "로그인·회원가입", detail: "이메일 가입, 소셜 로그인, 고가 장비 신분 확인" },
      { area: "결제·보증금", detail: "대여료 결제와 «보증금 카드 한도 보류»(승인 후 해제)" },
      { area: "날짜별 재고", detail: "장비마다 날짜별 가용 수량 계산 — 쇼핑몰 재고와 다른 구조" },
      { area: "택배 왕복", detail: "발송 예약과 회수 신청, 송장 조회" },
      { area: "알림", detail: "수령 안내·반납 하루 전·3시간 전·연체·환급 완료" },
      { area: "정산·환급", detail: "연체료·파손 배상 계산과 보증금 차감, 초과분 카드 청구" },
    ],
    audience: [
      "캠핑·카메라 장비 렌탈 사이트를 만들려는 분",
      "물건을 «기간»으로 빌려주는 서비스를 준비하는 창업자",
      "쇼핑몰 솔루션으로는 안 되는 대여 구조를 설계해야 하는 분",
    ],
    painPoints: [
      "쇼핑몰 재고는 「몇 개 남았나」인데 렌탈 재고는 「이 날짜에 비었나」라, 상품 모델부터 다르다",
      "보증금은 대여료와 다른 돈인데 한 화면에 섞이면 손님이 반드시 오해한다",
      "같은 「이용 중」 화면이 반납 하루 전·당일·연체 중에 각각 달라야 한다",
      "반납은 접수·점검·정산·환급 네 단계라 화면이 그만큼 갈린다",
    ],
    seo: {
      title: "장비 렌탈 예약 플랫폼 화면설계서 · 대여 서비스 AI팩",
      description:
        "캠핑·카메라 장비 렌탈 예약 플랫폼 AI팩(기획 산출물 한 벌)입니다. 날짜별 재고 달력·보증금·반납·연체·파손 정산까지 화면 목록과 기능정의를 미리 확인하세요.",
      keywords: [
        "렌탈 사이트 기획서",
        "대여 예약 플랫폼 화면설계서",
        "장비 렌탈 기능정의서",
        "보증금 결제 기획",
        "날짜별 재고 관리 설계",
      ],
    },
  },
  {
    id: "interior",
    title: "인테리어 시공 견적·시공관리",
    category: "commerce",
    industry: "인테리어·시공",
    // ⚠ 매칭(숨고형) 팩의 presetFits[0] "이사·인테리어처럼 금액이 큰 분야"와 헷갈리지 않게
    //   가른다 — 매칭은 «여러 고수를 이어 주는 플랫폼», 이 팩은 «한 시공 업체»의 사이트다.
    tagline:
      "아파트 리모델링·상가 인테리어를 맡아 하는 한 시공 업체의 사이트 AI팩. 예상 견적부터 공정표·현장 사진 일지·추가공사 승인·준공 검수·하자보수까지",
    /* A 회차(2026-08-17) — 디럭스(2뎁스 39화면)는 미니멀 모노 + 사진 중심형으로 만들었다.
       B 회차(2026-08-17) — 프리미엄(3뎁스 198화면)을 레트로 페이퍼 + 대시보드형으로 만든다. */
    plans: makePlans(
      INTERIOR,
      INTERIOR_DEEP,
      { standard: null, plus: null, deluxe: null, premium: null },
      { base: 39, deep: 198 },
    ),
    data: INTERIOR,
    deep: INTERIOR_DEEP,
    promptSamples: ["pr1", "pr4", "as1"],
    presetStyles: ["mono", "navy", "retro"],
    presetFits: [
      "공간 사진이 주인공인 인테리어 스튜디오, 미니멀·모던 시공",
      "아파트 리모델링·상업 공간처럼 금액이 크고 공정이 많은 시공, 표와 일정이 주인공인 화면",
      "목공·타일·빈티지 감성 시공, 작은 공방형 업체",
    ],
    layoutKeys: ["showcase", "console"],
    fileLabel: "인테리어",
    integrations: [
      { area: "로그인·회원가입", detail: "이메일 가입, 소셜 로그인, 손님·업체(현장 관리자) 두 권한 구분" },
      { area: "결제·분할 청구", detail: "계약금·착공금·중도금·잔금 분할 결제, 카드·계좌이체·무통장" },
      { area: "전자서명", detail: "계약서 서명과 준공 검수 확인에 쓰는 서명 캡처·저장" },
      { area: "사진·영상 업로드", detail: "현장 사진 일지, 추가공사 근거 사진, 하자보수 접수 사진 저장" },
      { area: "알림", detail: "실측 예약 확인·공정 진행·추가공사 승인 요청·하자보수 처리 발송" },
      { area: "주소·지도", detail: "시공 현장 주소 검색과 실측·방문 일정 안내" },
    ],
    audience: [
      "인테리어·리모델링 시공 업체의 사이트를 만들려는 분",
      "여러 고수를 이어 주는 매칭이 아니라 «내 업체 하나»의 사이트가 필요한 분",
      "견적뿐 아니라 공정표·현장 일지·추가공사 승인·준공 검수까지 갖춰야 하는 분",
    ],
    painPoints: [
      "쇼핑몰은 물건 하나를 담아 한 번에 결제하지만, 인테리어는 실측 뒤 금액이 바뀌고 여러 날 여러 공정으로 갈라진다",
      "공사 도중 생기는 추가공사는 변경 견적을 다시 받아 승인해야 하는데, 이 승인 화면 자체가 쇼핑몰 솔루션에는 없다",
      "준공 검수와 하자보수는 결제가 끝난 뒤에도 이어지는 화면이라 설계에서 빠뜨리기 쉽다",
    ],
    seo: {
      title: "인테리어 시공 견적·시공관리 화면설계서 · AI팩",
      description:
        "인테리어 시공 업체 사이트 AI팩(기획 산출물 한 벌)입니다. 예상 견적·공정표·현장 사진 일지·추가공사 승인·준공 검수·하자보수까지 화면 목록과 기능정의를 미리 확인하세요.",
      keywords: [
        "인테리어 시공 사이트 기획서",
        "리모델링 견적 화면설계서",
        "공정표 시스템 기획",
        "인테리어 업체 홈페이지 기능정의서",
        "하자보수 접수 화면 설계",
      ],
    },
  },
];

/**
 * 목록·랜딩에 진열할 업종.
 *
 * 네 등급이 다 갖춰진 업종만 올린다. 스탠다드·플러스뿐이면 2×2가 반만 보여
 * "왜 이건 두 개뿐이지"가 먼저 걸리기 때문이다.
 *
 * 2026-08-09 — 공동구매와 LMS 를 더했다.
 * 2026-08-10 — 매칭을 더했다. **다섯 업종 스무 칸이 모두 찼다.**
 *   여행 43/144 · 뷰티샵 49/136 · 공동구매 37/125 · LMS 44/132 · 매칭 43/159
 *   (디럭스 2뎁스 화면 수 / 프리미엄 3뎁스 화면 수)
 */
const LISTED_IDS = new Set(["travel", "beauty", "groupbuy", "lms", "matching", "rental", "interior"]);

/**
 * 이 등급 zip에 실제로 들어가는 것.
 *
 * 목록 카드와 메인 랜딩이 같은 출처를 쓴다 — 두 곳에 손으로 적어두면 등급을 고칠 때
 * 한쪽만 바뀐다. 순서와 이름은 package-template.mts가 zip에 담는 파일과 맞춰 뒀다.
 */
export function planContents(plan: PackagePlan): string[] {
  // 손님 말로 부른다 — 「IA」·「WBS」·「프리셋」은 웹 기획 실무자만 아는 말이라,
  // 개발자가 아닌 손님에게는 빈칸이나 마찬가지다(2026-08-08).
  // 다만 「기능정의서」는 그대로 둔다: zip 안 파일 이름이 그렇고, 손님이 개발사에
  // 넘길 때 개발사가 이 이름으로 부른다. 우리가 바꾸면 손님이 다시 통역해야 한다.
  const items = [
    "메뉴구조",
    `화면 목록 ${plan.stats.screens}개`,
    `기능정의서 ${plan.stats.reqs}개 — 화면마다 뭘 해야 하는지`,
    "개발 일정표",
    "FLOW 흐름도",
    "AI 빌드 지시서",
    "디자인 규칙 (색·글꼴 3종 · 화면 배치 2종)",
    "사이트 내놓는 법 안내서 — 배포·도메인·로그인·결제",
  ];
  if (plan.verify) items.push(`검수 시나리오 ${plan.verify.scenarios}개`);
  if (plan.siteScreens) items.push(`완성 화면 ${plan.siteScreens}개 (HTML)`);
  return items;
}

/** 목록에 진열되는 낱개 상품 (진열 업종 × 플랜). */
export interface PackageProduct {
  pkg: PackageDef;
  plan: PackagePlan;
  /** 목록 카드에 노출할 상품명 */
  name: string;
  href: string;
}

export function packageProducts(): PackageProduct[] {
  return PACKAGES.filter((pkg) => LISTED_IDS.has(pkg.id)).flatMap((pkg) =>
    pkg.plans.map((plan) => ({
      pkg,
      plan,
      name: `${pkg.title} · ${plan.name}`,
      // 상세는 고른 규모 기준으로 열린다(화면 목록·검수 수치까지 그 규모로 바뀐다).
      href: `/packages/${pkg.id}?plan=${plan.id}`,
    })),
  );
}

/**
 * 진열된 팩이 «실제로 있는» 갈래만 — 개수를 함께 준다.
 *
 * 비어 있는 갈래를 보여 주지 않는 까닭 — 눌러서 아무것도 없으면
 * 손님은 「이 사이트에 물건이 없구나」로 읽는다. 여섯 칸을 미리 벌여 놓고
 * 넷이 비어 있으면 스무 칸이 있어도 빈약해 보인다.
 */
export function listedCategories(): { id: CategoryId; label: string; desc: string; count: number }[] {
  const 셈 = new Map<CategoryId, number>();
  for (const pkg of PACKAGES) {
    if (!LISTED_IDS.has(pkg.id)) continue;
    셈.set(pkg.category, (셈.get(pkg.category) ?? 0) + pkg.plans.length);
  }
  return CATEGORIES.filter((c) => 셈.has(c.id)).map((c) => ({ ...c, count: 셈.get(c.id)! }));
}

/**
 * 목록에서 찾을 때 쓰는 글자 뭉치.
 *
 * 제목만 뒤지면 「미용실」로 못 찾는다 — 팩 이름이 「뷰티샵 예약 플랫폼」이기 때문이다.
 * 손님이 실제로 칠 말은 업종·소개·SEO 키워드에 흩어져 있으므로 다 합쳐 둔다.
 * (검색은 화면에서 하므로 미리 만들어 내려보낸다 — 팩 원본을 통째로 보내면
 *  화면 수백 개짜리 데이터가 브라우저로 넘어간다.)
 */
export const searchText = (pkg: PackageDef): string =>
  [pkg.title, pkg.industry, pkg.tagline, ...pkg.seo.keywords, ...pkg.audience]
    .join(" ")
    .toLowerCase();

/**
 * 메인 랜딩이 쓰는 가벼운 카드 데이터.
 * 랜딩은 클라이언트 컴포넌트라 PackageDef를 통째로 넘기면 템플릿 데이터(화면 수백 개)가
 * 클라이언트 번들에 딸려 들어간다. 서버에서 필요한 값만 뽑아 넘긴다.
 */
export interface AiPackCard {
  href: string;
  /** 카드 상단 영문 라벨 */
  code: string;
  title: string;
  planName: string;
  screens: number;
  /** 설계 깊이 한 줄 — 목록 카드와 같은 문구 */
  depthLabel: string;
  /** zip에 들어가는 것 — 목록 카드와 같은 출처(planContents) */
  contents: string[];
  price: string;
  badge?: string;
}

export function aiPackCards(): AiPackCard[] {
  return packageProducts().map(({ pkg, plan, href }) => ({
    href,
    code: pkg.id.toUpperCase(),
    title: pkg.title,
    planName: plan.name,
    screens: plan.stats.screens,
    depthLabel: plan.depthLabel,
    contents: planContents(plan),
    // 살 수 있는 길이 열리기 전까지는 값 대신 상태를 적는다(lib/flags.ts).
    price: PACKAGE_PRICES_PUBLIC ? formatPackPrice(plan.priceKrw) : "판매 준비 중",
    badge: plan.badge,
  }));
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

/** 이 등급을 사는 데 드는 크레딧. 1크레딧 = 100원이라 값에서 바로 나온다.
 *  값과 크레딧을 두 벌로 적지 않으려고 계산으로 둔다 — 두 벌은 반드시 갈라진다. */
export function packCredits(priceKrw: number): number {
  return Math.round(priceKrw / 100);
}

/** 화면에 적을 값 — 팩은 크레딧으로 사므로 크레딧이 주(主)다.
 *
 * 원 환산을 괄호로 함께 적는다. 「629크레딧」만 있으면 처음 온 사람은 그게
 * 얼마인지 가늠할 수 없고, 「62,900원」만 있으면 실제로 무엇을 내는지와 어긋난다. */
export function formatPackPrice(priceKrw: number): string {
  return `${packCredits(priceKrw).toLocaleString()}크레딧`;
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

/**
 * 산 사람에게 내려줄 zip 파일 이름 — `여행_프리미엄.zip`.
 * package-template.mts가 만드는 이름과 같은 규칙이다(어긋나면 그 스크립트가 멈춘다).
 */
export function packFileName(pkg: PackageDef, planId: PlanId): string {
  return `${pkg.fileLabel}_${PLAN_NAMES[planId]}.zip`;
}

/** 그 팩·등급이 실제로 파는 물건인가(디럭스·프리미엄은 완성 화면이 있는 업종에만 있다). */
export function planOf(pkg: PackageDef, planId: string): PackagePlan | undefined {
  return pkg.plans.find((p) => p.id === planId);
}
