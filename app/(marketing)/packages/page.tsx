import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ShoppingBag, Sparkles } from "lucide-react";
import { packageProducts, planContents, formatKrw } from "@/lib/packages";
import { PACKAGE_PRICES_PUBLIC } from "@/lib/flags";

export const metadata: Metadata = {
  title: "AI팩 구매 — 업종별 화면설계서·기능정의서 완성본",
  description:
    "이미 만들어진 업종별 AI팩(기획 산출물 한 벌)을 바로 받아보세요. 메뉴 구조, 화면 목록, 기능정의서, 흐름도, AI 빌드 스펙팩, 디자인 프리셋을 한 벌로 제공하고, 프리미엄은 만들어 둔 화면과 검수 시나리오까지 드립니다.",
  keywords: ["기획서 템플릿", "화면설계서 템플릿", "기능정의서 양식", "IA 템플릿", "웹기획 산출물"],
};

export default function PackagesPage() {
  const products = packageProducts();

  return (
    <div className="bg-background">
      <section className="bg-linear-to-br from-primary-soft/40 via-background to-muted/40">
        <div className="mx-auto max-w-5xl px-6 pb-7 pt-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
            <ShoppingBag className="size-4" />
            AI팩 구매
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            직접 만들지 않아도 돼요.
            <br />
            <span className="bg-primary-soft rounded-lg px-2 py-0.5">이미 만들어둔 AI팩</span>을
            바로 받으세요.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
            업종별로 완성된 기획 산출물입니다. 화면 목록부터 기능정의서, 흐름도, AI 빌드 스펙팩,
            디자인 프리셋까지 한 벌로 들어 있어요. 만들려는 사이트 규모에 맞춰 등급을
            고르시면 됩니다. 프리미엄에는 그 설계로 이미 만들어 둔 화면과 검수 시나리오가
            함께 들어 있어요.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-14 pt-7">
        {/* 업종 × 등급. 프리미엄은 만들어 둔 화면이 있는 업종에만 생긴다. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(({ pkg, plan, href }) => {
            const isPremium = plan.id === "premium";
            return (
              <Link
                key={`${pkg.id}-${plan.id}`}
                href={href}
                className={`group flex flex-col rounded-2xl border bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                  isPremium
                    ? "border-primary/40 hover:border-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {/* 등급만 단다. 업종은 바로 아래 제목에 이미 들어 있어서
                    같은 말을 두 번 하는 셈이었다. */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      plan.siteScreens
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary-soft text-primary-on-soft"
                    }`}
                  >
                    {plan.name}
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-bold leading-snug text-foreground">
                  {pkg.title}
                </h2>
                <p className="mt-1 text-sm font-semibold text-primary">{plan.depthLabel}</p>

                {/* 무엇이 들어 있는지를 먼저 보여준다 — 등급이 넷이라 "가볍게 시작하는 분께"
                    같은 문구보다 구성이 갈리는 지점이 눈에 들어와야 고를 수 있다. */}
                <ul className="mt-4 flex flex-col gap-1 border-t border-border/60 pt-4">
                  {planContents(plan).map((c) => (
                    <li key={c} className="flex items-start gap-1.5 text-sm text-foreground/80">
                      <Check className="mt-1 size-3 shrink-0 text-primary" />
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {plan.highlights[plan.highlights.length - 1]}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                  {PACKAGE_PRICES_PUBLIC ? (
                    <p className="text-lg font-bold text-foreground">{formatKrw(plan.priceKrw)}</p>
                  ) : (
                    // 살 수 없는 동안엔 값을 걸지 않는다 — 값만 남고 돌아가는 손님을 만들지 않으려고.
                    <p className="text-sm font-semibold text-warning">판매 준비 중</p>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    자세히 보기
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>

                {PACKAGE_PRICES_PUBLIC && !plan.kmongUrl && (
                  <p className="mt-2 text-xs font-medium text-warning">판매 준비 중</p>
                )}
              </Link>
            );
          })}
        </div>

        {/* 직접 만들기 유도 */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-on-soft">
            <Sparkles className="size-5" />
          </span>
          <h2 className="text-xl font-bold text-foreground">찾는 업종이 없나요?</h2>
          <p className="max-w-lg leading-relaxed text-muted-foreground">
            컨셉과 메뉴만 입력하면 내 서비스에 맞는 산출물을 직접 만들 수 있어요.
          </p>
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            무료로 만들어보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
