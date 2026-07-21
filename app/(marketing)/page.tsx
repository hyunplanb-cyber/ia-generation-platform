import Link from "next/link";
import {
  Sparkles,
  ListChecks,
  LayoutGrid,
  MessageSquareCode,
  CalendarClock,
  FileSpreadsheet,
  Wand2,
  ArrowRight,
  Check,
  Star,
  Heart,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { BuildDemoMockup } from "./build-demo-mockup";
import { HeroReel } from "./hero-reel";

const STEP_WASH_CLASSES = [
  { bg: "bg-pastel-mint", fg: "text-pastel-mint-foreground" },
  { bg: "bg-pastel-lavender", fg: "text-pastel-lavender-foreground" },
  { bg: "bg-pastel-yellow", fg: "text-pastel-yellow-foreground" },
  { bg: "bg-primary-soft", fg: "text-primary-on-soft" },
];

const painPoints = [
  "메뉴 하나 늘어날 때마다 화면 목록을 처음부터 다시 정리하고 있나요?",
  "페이지ID를 손으로 붙이다 보면 어느샌가 번호가 꼬여있진 않나요?",
  "AI 코딩 도구에 넘길 프롬프트를 화면마다 새로 쓰느라 시간을 다 쓰고 있나요?",
  "일정표는 엑셀로 따로 관리하다 컨셉 문서와 자꾸 어긋나지 않나요?",
];

const steps = [
  {
    icon: ListChecks,
    title: "사이트 컨셉과 메뉴를 입력해요",
    description:
      "전체 일정과 메뉴 목록만 입력하면 돼요. 메뉴명(한글/영문)과 원하는 기능을 간단히 적어주세요.",
  },
  {
    icon: Wand2,
    title: "[실행: IA 생성]을 눌러요",
    description:
      "메뉴마다 필요한 화면을 자동으로 뽑아내고, 화면별 페이지ID를 규칙에 맞게 부여해요.",
  },
  {
    icon: LayoutGrid,
    title: "화면별 기능정의·AI프롬프트·일정이 채워져요",
    description:
      "버튼 클릭 시 이동할 화면까지 연결한 기능정의와, AI 코딩 도구에 바로 붙여넣을 프롬프트, 제작 일정 초안까지 한 번에 나와요.",
  },
  {
    icon: FileSpreadsheet,
    title: "검토하고 엑셀로 내려받아요",
    description:
      "자동 생성된 내용은 전부 화면에서 바로 고칠 수 있어요. 완성되면 엑셀로 내려받아 팀과 공유하거나 AI 코딩 도구에 넘기세요.",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "자동 IA 생성",
    description: "메뉴만 입력하면 메뉴당 필요한 화면을 빠짐없이 뽑아 목록으로 정리해요.",
    wash: "bg-pastel-mint",
    fg: "text-pastel-mint-foreground",
  },
  {
    icon: LayoutGrid,
    title: "페이지ID 자동 부여",
    description: "디바이스·메뉴코드 기반 규칙으로 페이지ID를 자동으로 붙이고, 프로젝트 안에서 중복 없이 관리해요.",
    wash: "bg-pastel-lavender",
    fg: "text-pastel-lavender-foreground",
  },
  {
    icon: ListChecks,
    title: "화면별 기능정의",
    description: "버튼을 누르면 어느 화면으로 이동하는지까지 연결해서 정리해요. 연결이 끊기면 바로 표시돼요.",
    wash: "bg-pastel-yellow",
    fg: "text-pastel-yellow-foreground",
  },
  {
    icon: MessageSquareCode,
    title: "AI 코딩 프롬프트",
    description: "화면마다 Claude Code, Cursor 같은 AI 코딩 도구에 바로 붙여넣을 프롬프트를 함께 만들어요.",
    wash: "bg-pastel-mint",
    fg: "text-pastel-mint-foreground",
  },
  {
    icon: CalendarClock,
    title: "제작 일정 자동 분배",
    description: "전체 일정을 입력하면 화면 수에 맞춰 일정 초안을 나눠줘요. 손으로 조정한 화면은 그대로 유지돼요.",
    wash: "bg-pastel-lavender",
    fg: "text-pastel-lavender-foreground",
  },
  {
    icon: FileSpreadsheet,
    title: "엑셀 내보내기",
    description: "완성된 IA와 일정을 엑셀 파일 하나로 내려받아 팀, 클라이언트와 바로 공유해요.",
    wash: "bg-pastel-yellow",
    fg: "text-pastel-yellow-foreground",
  },
];

const audiences = [
  "혼자 기획부터 개발까지 하는 1인 창업자",
  "매번 새 프로젝트마다 IA를 처음부터 짜는 웹기획자",
  "여러 클라이언트 프로젝트를 동시에 굴리는 에이전시 PM",
  "AI 코딩 도구로 빠르게 사이드 프로젝트를 만드는 개발자",
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-pastel-lavender via-pastel-yellow/70 to-pastel-mint">
        {/* 장식용 반짝임 — 밝은 무드를 위한 요소, 데스크톱에서만 보여요 */}
        <Star
          className="animate-float absolute top-16 left-[8%] hidden size-6 text-pastel-yellow-foreground/50 lg:block"
          style={{ animationDelay: "0.2s" }}
          fill="currentColor"
        />
        <Sparkles
          className="animate-float absolute top-40 left-[20%] hidden size-8 text-primary/40 lg:block"
          style={{ animationDelay: "1s" }}
        />
        <Heart
          className="animate-float absolute bottom-24 left-[12%] hidden size-6 text-pastel-lavender-foreground/40 lg:block"
          style={{ animationDelay: "1.6s" }}
          fill="currentColor"
        />
        <Sparkles
          className="animate-float absolute right-[6%] bottom-16 hidden size-7 text-pastel-mint-foreground/40 lg:block"
          style={{ animationDelay: "0.6s" }}
        />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
              바이브 코딩 전, 기획 한 단계
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              한 줄 프롬프트 말고
              <br />
              <span className="bg-pastel-yellow rounded-lg px-2 py-0.5">설계도 프롬프트로</span>
              <br />
              만드세요.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              AI는 <span className="font-medium text-foreground">&ldquo;잘 풀리는 상황&rdquo;</span>만
              만듭니다. 컨셉과 메뉴만 입력하면 화면 목록부터 화면별 프롬프트까지,
              빠지는 화면 없이 설계해드려요.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className={`${buttonVariants({ size: "lg" })} shadow-primary/30 shadow-lg transition-transform hover:scale-105`}
              >
                무료로 시작하기
                <ArrowRight className="size-4" />
              </Link>
              <Link href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg" })}>
                어떻게 동작하나요
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* 릴스(9:16) 소개 영상 — public/intro.mp4 넣으면 그 영상, 없으면 코드 애니메이션 */}
            <HeroReel />
          </div>
        </div>
      </section>

      {/* Positioning — AI 웹빌더가 못 채우는 기획 계층 */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-on-soft">
              왜 필요할까요?
            </span>
            <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
              AI 웹빌더가 못 채우는 <span className="bg-pastel-yellow rounded-lg px-2">‘그 사이’</span>를
              채웁니다
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              요즘 AI 웹빌더는 레이아웃과 콘텐츠를 자동 생성해 코딩 없이 ‘한 방에 완성’을 노려요. 하지만
              그 전에 필요한 <b className="font-semibold text-foreground">사이트맵·메뉴·페이지별 프롬프트</b> 같은
              <b className="font-semibold text-foreground"> 기획 산출물</b> 계층은 대부분 비어 있죠. 우리는{" "}
              <b className="font-semibold text-foreground">vibe-coding 직전, 기획을 구조화</b>하는 그 빈틈을
              채웁니다.
            </p>
          </div>

          {/* 흐름 시각화 — 가운데(우리)가 그 빈틈 */}
          <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <div className="flex flex-1 flex-col gap-1 rounded-xl border border-border bg-background p-5 text-center">
              <span className="text-2xl">💡</span>
              <p className="font-semibold text-foreground">컨셉 · 아이디어</p>
              <p className="text-xs text-muted-foreground">머릿속 구상</p>
            </div>
            <ArrowRight className="mx-auto size-5 shrink-0 rotate-90 text-muted-foreground/50 sm:rotate-0" />
            <div className="flex flex-1 flex-col gap-1 rounded-xl border-2 border-primary bg-primary-soft/40 p-5 text-center shadow-md">
              <span className="text-2xl">🧩</span>
              <p className="font-bold text-primary-on-soft">기획 구조화</p>
              <p className="text-xs font-medium text-primary-on-soft/80">
                IA · 기능정의 · 화면별 프롬프트 · 스펙팩 <b>(← 우리)</b>
              </p>
            </div>
            <ArrowRight className="mx-auto size-5 shrink-0 rotate-90 text-muted-foreground/50 sm:rotate-0" />
            <div className="flex flex-1 flex-col gap-1 rounded-xl border border-border bg-background p-5 text-center">
              <span className="text-2xl">🚀</span>
              <p className="font-semibold text-foreground">AI 빌더 · 코딩툴</p>
              <p className="text-xs text-muted-foreground">완성 사이트</p>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            잘 구조화된 기획을 넘기면, AI 빌더·코딩툴이 훨씬 정확하게 만들어요.
          </p>
        </div>
      </section>

      {/* Pain points */}
      <section className="border-t border-border bg-pastel-yellow/25">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            혹시 이런 고민, 매번 반복하고 계신가요?
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {painPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-lg border border-border bg-background p-5 shadow-sm"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-pastel-yellow text-sm font-bold text-pastel-yellow-foreground">
                  !
                </span>
                <p className="text-foreground/90">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              4단계면 충분해요
            </h2>
            <p className="mt-3 text-muted-foreground">
              복잡한 설정 없이, 입력 → 실행 → 검토 → 내보내기 순서로 끝나요.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const wash = STEP_WASH_CLASSES[i % STEP_WASH_CLASSES.length];
              return (
                <div
                  key={step.title}
                  className="relative flex flex-col gap-3 rounded-lg border border-border bg-background p-6 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex size-10 items-center justify-center rounded-full ${wash.bg} ${wash.fg}`}>
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      STEP {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Build demo — 컨셉 하나로 사이트까지 */}
      <section className="border-t border-border bg-linear-to-b from-pastel-lavender/25 to-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-on-soft">
              <Wand2 className="size-3.5" /> 실제 결과물
            </span>
            <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
              컨셉 하나로, 사이트까지
            </h2>
            <p className="mt-3 text-muted-foreground">
              메뉴·컨셉만 입력하면 <b className="font-semibold text-foreground">AI 빌드 스펙팩</b>이 나오고,
              그 파일을 Claude Code·Cowork에 넘기면 이런 사이트가 완성돼요.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,320px)_auto_minmax(0,1fr)]">
            {/* 입력 */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                입력
              </span>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">컨셉</p>
                <p className="mt-1 rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">
                  반려동물 용품 온라인 쇼핑몰
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">주요 메뉴</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {["홈", "상품", "장바구니", "마이페이지"].map((menu) => (
                    <span
                      key={menu}
                      className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary-on-soft"
                    >
                      {menu}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-2 rounded-lg bg-pastel-mint/40 px-3 py-2 text-xs text-pastel-mint-foreground">
                <FileSpreadsheet className="size-4 shrink-0" /> 스펙팩 · 엑셀 · PPT · FLOW 자동 생성
              </div>
            </div>

            {/* 화살표 */}
            <div className="flex items-center justify-center">
              <ArrowRight className="hidden size-8 text-primary/50 lg:block" />
              <ArrowRight className="size-6 rotate-90 text-primary/50 lg:hidden" />
            </div>

            {/* 결과 미리보기 */}
            <div className="flex flex-col gap-3">
              <span className="text-center text-xs font-bold uppercase tracking-wide text-muted-foreground lg:text-left">
                AI가 만든 사이트
              </span>
              <BuildDemoMockup />
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              기획부터 개발 인계까지, 빠짐없이
            </h2>
            <p className="mt-3 text-muted-foreground">
              한 번 만든 IA는 프로젝트가 끝날 때까지 이 안에서 계속 관리돼요.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`flex flex-col gap-4 rounded-lg p-6 shadow-sm transition-transform hover:-translate-y-1 hover:rotate-1 ${feature.wash}`}
                >
                  <span className={`flex size-10 items-center justify-center rounded-full bg-background/70 ${feature.fg}`}>
                    <Icon className="size-5" />
                  </span>
                  <h3 className={`font-semibold ${feature.fg}`}>{feature.title}</h3>
                  <p className="text-sm leading-6 text-foreground/80">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="border-t border-border bg-pastel-mint/20">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            이런 분들께 잘 맞아요
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {audiences.map((audience) => (
              <div key={audience} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check className="size-4" />
                </span>
                <p className="text-foreground/90">{audience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden border-t border-border bg-primary">
        <Sparkles
          className="animate-float absolute top-10 left-[15%] hidden size-6 text-primary-foreground/30 sm:block"
          style={{ animationDelay: "0.3s" }}
        />
        <Star
          className="animate-float absolute right-[18%] bottom-10 hidden size-6 text-primary-foreground/30 sm:block"
          style={{ animationDelay: "1.2s" }}
          fill="currentColor"
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground">
            다음 프로젝트, IA부터 자동화해 보세요
          </h2>
          <p className="max-w-xl text-lg text-primary-foreground/85">
            가입은 무료예요. 첫 프로젝트를 만들고 메뉴를 입력하는 데 몇 분이면 충분해요.
          </p>
          <Link
            href="/signup"
            className={`${buttonVariants({ variant: "secondary", size: "lg" })} shadow-lg transition-transform hover:scale-105`}
          >
            지금 무료로 시작하기
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
