import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 px-6 py-24">
      <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        사이트 컨셉과 메뉴만 입력하면
        <br />
        IA·화면기능정의·AI프롬프트·일정을 자동으로 만들어드려요.
      </h1>
      <p className="max-w-xl text-lg leading-8 text-muted-foreground">
        메뉴를 입력하고 [실행: IA 생성]을 누르면 화면별 페이지ID, 기능정의, AI
        코딩 프롬프트, 제작 일정까지 한 번에 초안이 만들어져요. 완성된
        내용은 엑셀로 내려받아 AI 코딩 도구에 바로 활용할 수 있어요.
      </p>
      <Link
        href="/signup"
        className="rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:opacity-90"
      >
        시작하기
      </Link>
    </div>
  );
}
