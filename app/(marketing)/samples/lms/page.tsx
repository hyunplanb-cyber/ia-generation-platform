import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Lock, Network, LayoutList, Workflow, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LMS } from "@/template-data-lms";

// 검색 유입용 공개 샘플. 로그인 없이 볼 수 있고, 실제 산출물 내용을 그대로 노출해
// "LMS 화면설계서 예시" 같은 검색어에 걸리게 한다.
// 다만 핵심 자산인 화면별 프롬프트는 일부만 공개한다(판매 상품과 겹치지 않도록).
export const metadata: Metadata = {
  title: "온라인 강의 플랫폼(LMS) 화면설계서 예시 — 화면 37개 전체 공개",
  description:
    "온라인 강의 플랫폼(LMS) 기획 산출물 실물 예시입니다. 메뉴 7개, 화면 37개, 요건 241개, 화면 이동 55개를 전부 공개합니다. IA·화면목록·기능정의서·흐름도 샘플을 확인하세요.",
  keywords: [
    "LMS 화면설계서",
    "온라인 강의 플랫폼 기획서",
    "LMS 기획서 예시",
    "화면설계서 샘플",
    "IA 예시",
    "기능정의서 예시",
    "웹기획 산출물",
  ],
};

const screens = LMS.menus.flatMap((m) => m.screens);
const buttonCount = screens.reduce((n, s) => n + (s.btns?.length ?? 0), 0);
const reqCount = screens.reduce(
  (n, s) => n + s.func.split("·").filter((x) => x.trim()).length,
  0,
);
// 예외·상태 화면(우리 차별점) 추림
const stateScreens = screens.filter((s) =>
  /없음|비어|오류|실패|마감|대기|확인/.test(s.name),
);
// 프롬프트는 대표 3개만 전문 공개
const PROMPT_SAMPLES = ["cl3", "cu3", "co6"];

const STATS = [
  { icon: Network, label: "메뉴", value: LMS.menus.length },
  { icon: LayoutList, label: "화면", value: screens.length },
  { icon: FileText, label: "요건", value: reqCount },
  { icon: Workflow, label: "화면 이동", value: buttonCount },
];

export default function LmsSamplePage() {
  return (
    <div className="bg-background">
      {/* 헤더 */}
      <section className="bg-linear-to-br from-pastel-lavender/40 via-background to-pastel-mint/40">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
            공개 샘플
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            온라인 강의 플랫폼(LMS)
            <br />
            <span className="bg-pastel-yellow rounded-lg px-2 py-0.5">화면설계서 예시</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            실제로 만들어진 기획 산출물입니다. 화면 {screens.length}개와 요건 {reqCount}개를
            그대로 공개하니, 내 프로젝트에 필요한 화면이 무엇인지 확인해 보세요.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-background px-4 py-3 shadow-sm"
              >
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="size-3.5" />
                  {label}
                </dt>
                <dd className="mt-0.5 text-2xl font-bold text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-14 px-6 py-14">
        {/* 컨셉 */}
        <section className="flex flex-col gap-3">
          <SectionTitle>사이트 컨셉</SectionTitle>
          <p className="leading-relaxed text-foreground/85">{LMS.project.concept}</p>
        </section>

        {/* 메뉴 구조 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>메뉴 구조</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LMS.menus.map((m) => (
              <div key={m.code} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-bold text-foreground">{m.nameKo}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                <p className="mt-2 text-xs font-semibold text-primary">
                  화면 {m.screens.length}개
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 예외 화면 — 우리 차별점 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>AI가 빠뜨리기 쉬운 예외 화면 {stateScreens.length}개</SectionTitle>
          <p className="text-muted-foreground">
            &ldquo;만들어줘&rdquo; 한 줄로는 잘 나오지 않는, 실제 서비스에 꼭 필요한 화면들입니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {stateScreens.map((s) => (
              <span
                key={s.ref}
                className="rounded-lg border border-primary/25 bg-primary-soft/50 px-3 py-1.5 text-sm font-medium text-primary-on-soft"
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>

        {/* 화면 목록 전체 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>화면 목록 {screens.length}개 · 기능 정의</SectionTitle>
          <div className="flex flex-col gap-6">
            {LMS.menus.map((menu) => (
              <div key={menu.code} className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-baseline gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                  <span className="font-mono text-xs text-muted-foreground">{menu.code}</span>
                  <h3 className="font-bold text-foreground">{menu.nameKo}</h3>
                  <span className="text-xs text-muted-foreground">
                    화면 {menu.screens.length}개
                  </span>
                </div>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {menu.screens.map((s, i) => (
                      <tr
                        key={s.ref}
                        className={i > 0 ? "border-t border-border/60 align-top" : "align-top"}
                      >
                        <td className="w-56 px-4 py-3 font-semibold text-foreground">
                          {s.name}
                          <span className="mt-0.5 block font-mono text-xs font-normal text-muted-foreground">
                            {s.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 leading-relaxed text-foreground/80">{s.func}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {/* 프롬프트 샘플 — 일부만 공개 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>화면별 AI 생성 프롬프트</SectionTitle>
          <p className="text-muted-foreground">
            화면마다 AI 코딩 도구에 그대로 넣는 프롬프트가 붙어 있습니다. 아래는 {PROMPT_SAMPLES.length}개
            예시예요.
          </p>
          <div className="flex flex-col gap-3">
            {screens
              .filter((s) => PROMPT_SAMPLES.includes(s.ref))
              .map((s) => (
                <div key={s.ref} className="rounded-xl border border-border bg-surface p-5">
                  <p className="font-bold text-foreground">{s.name}</p>
                  <p className="mt-2 leading-relaxed text-foreground/80">{s.prompt}</p>
                </div>
              ))}
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-6 text-muted-foreground">
              <Lock className="size-5 shrink-0" />
              <p className="text-sm leading-relaxed">
                나머지 {screens.length - PROMPT_SAMPLES.length}개 화면의 프롬프트는 직접 프로젝트를
                만들면 전부 확인할 수 있어요.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center gap-5 rounded-2xl bg-linear-to-br from-pastel-lavender/50 via-pastel-yellow/30 to-pastel-mint/50 px-6 py-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            내 서비스도 이렇게 만들어드려요
          </h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            컨셉과 메뉴만 입력하면 화면 목록부터 화면별 프롬프트까지, 빠지는 화면 없이
            설계해드려요.
          </p>
          <Link
            href="/signup"
            className={`${buttonVariants({ size: "lg" })} shadow-primary/30 shadow-lg transition-transform hover:scale-105`}
          >
            무료로 시작하기
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
      <span className="h-5 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  );
}
