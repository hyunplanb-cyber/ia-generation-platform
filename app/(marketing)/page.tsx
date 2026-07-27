import { HomeLanding } from "./home-landing";

export const metadata = {
  title: "카페인컬러 — 만들기 전엔 설계도, 오픈 전엔 검수",
  description:
    "AI로 사이트 만드는 사람을 위한 두 가지. 컨셉 한 줄이면 화면 목록과 화면별 프롬프트가, URL 한 줄이면 오픈 전 검수 결과가 나옵니다.",
};

export default function LandingPage() {
  return <HomeLanding />;
}
