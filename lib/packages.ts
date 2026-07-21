// 판매 중인 기획 패키지 정의.
// 자체 결제(PG)가 붙기 전까지 결제는 크몽에서 처리한다.
// (우리 사이트 → 크몽 방향은 마켓 정책상 문제 없다. 반대 방향이 금지 대상.)
// kmongUrl이 null이면 아직 판매 전 → 구매 버튼 대신 "판매 준비 중"으로 표시한다.
import { LMS } from "@/template-data-lms";

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
}

const lmsScreens = LMS.menus.flatMap((m) => m.screens);
const lmsReqs = lmsScreens.reduce(
  (n, s) => n + s.func.split("·").filter((x) => x.trim()).length,
  0,
);
const lmsFlows = lmsScreens.reduce((n, s) => n + (s.btns?.length ?? 0), 0);

export const PACKAGES: PackageDef[] = [
  {
    id: "lms",
    title: "온라인 강의 플랫폼 (LMS)",
    industry: "교육",
    tagline:
      "수강생 학습부터 강사의 수업 편성·학생 관리·정산까지 갖춘 강의 플랫폼 기획 패키지",
    stats: {
      menus: LMS.menus.length,
      screens: lmsScreens.length,
      reqs: lmsReqs,
      flows: lmsFlows,
    },
    tiers: [
      { name: "스탠다드", priceKrw: 49000, desc: "기획 문서 6종" },
      { name: "디럭스", priceKrw: 69000, desc: "6종 + AI 빌드 스펙팩" },
      { name: "프리미엄", priceKrw: 89000, desc: "디럭스 + 디자인 프리셋 3종" },
    ],
    kmongUrl: null, // 크몽 승인 대기 중 — 승인 후 https://kmong.com/gig/XXXXXX 로 교체
  },
];

export function getPackage(id: string): PackageDef | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export function formatKrw(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}
