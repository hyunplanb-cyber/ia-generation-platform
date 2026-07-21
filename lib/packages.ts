// 판매 중인 기획 패키지 정의.
// 자체 결제(PG)가 붙기 전까지 결제는 크몽에서 처리한다.
// (우리 사이트 → 크몽 방향은 마켓 정책상 문제 없다. 반대 방향이 금지 대상.)
// kmongUrl이 null이면 아직 판매 전 → 구매 버튼 대신 "판매 준비 중"으로 표시한다.
import { LMS, type TplMenu } from "@/template-data-lms";
import { BEAUTY } from "@/template-data-beauty";

export interface TplData {
  project: { concept: string; designConcept: string; deviceMode: string };
  menus: TplMenu[];
}

export interface PackageTier {
  name: string;
  priceKrw: number;
  desc: string;
}

export interface PackageDef {
  id: string;
  /** 목록·상세의 제목 */
  title: string;
  /** 업종 라벨 */
  industry: string;
  /** 한 줄 소개 */
  tagline: string;
  stats: { menus: number; screens: number; reqs: number; flows: number };
  tiers: PackageTier[];
  kmongUrl: string | null;
  /** 상세 페이지가 실제 산출물을 렌더링하는 데 쓰는 원본 데이터 */
  data: TplData;
  /** 전문 공개할 프롬프트 화면 ref (나머지는 잠금 안내) */
  promptSamples: string[];
  seo: { title: string; description: string; keywords: string[] };
}

// 지표는 템플릿 데이터에서 직접 계산해, 화면에 적힌 숫자와 실제 산출물이 어긋나지 않게 한다.
function statsOf(data: { menus: { screens: { func: string; btns?: [string, string][] }[] }[] }) {
  const screens = data.menus.flatMap((m) => m.screens);
  return {
    menus: data.menus.length,
    screens: screens.length,
    reqs: screens.reduce((n, s) => n + s.func.split("·").filter((x) => x.trim()).length, 0),
    flows: screens.reduce((n, s) => n + (s.btns?.length ?? 0), 0),
  };
}

export const PACKAGES: PackageDef[] = [
  {
    id: "lms",
    title: "온라인 강의 플랫폼 (LMS)",
    industry: "교육",
    tagline:
      "수강생 학습부터 강사의 수업 편성·학생 관리·정산까지 갖춘 강의 플랫폼 기획 패키지",
    stats: statsOf(LMS),
    tiers: [
      { name: "스탠다드", priceKrw: 49000, desc: "기획 문서 6종" },
      { name: "디럭스", priceKrw: 69000, desc: "6종 + AI 빌드 스펙팩" },
      { name: "프리미엄", priceKrw: 89000, desc: "디럭스 + 디자인 프리셋 3종" },
    ],
    kmongUrl: null, // 크몽 승인 대기 중 — 승인 후 https://kmong.com/gig/XXXXXX 로 교체
    data: LMS,
    promptSamples: ["cl3", "cu3", "co6"],
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
    stats: statsOf(BEAUTY),
    tiers: [
      { name: "스탠다드", priceKrw: 49000, desc: "기획 문서 6종" },
      { name: "디럭스", priceKrw: 69000, desc: "6종 + AI 빌드 스펙팩" },
      { name: "프리미엄", priceKrw: 89000, desc: "디럭스 + 디자인 프리셋 3종" },
    ],
    kmongUrl: null, // 등록 준비 중
    data: BEAUTY,
    promptSamples: ["re3", "mg1", "st5"],
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
];

export function getPackage(id: string): PackageDef | undefined {
  return PACKAGES.find((p) => p.id === id);
}

// 예외·상태 화면 판별. 화면명(예: "확인 및 결제")으로 걸면 정상 흐름까지 잡히므로
// 설계 시 부여한 역할(role)로 판별한다 — list-empty / error / form-closed / pending 등.
export function exceptionScreens(data: TplData) {
  return data.menus
    .flatMap((m) => m.screens)
    .filter((s) => /(empty|error|closed|pending)/.test(s.role));
}

export function formatKrw(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}
