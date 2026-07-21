import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Package, ShoppingBag, Sparkles } from "lucide-react";
import { PACKAGES, formatKrw } from "@/lib/packages";

export const metadata: Metadata = {
  title: "기획 패키지 구매 — 업종별 화면설계서·기능정의서 완성본",
  description:
    "이미 만들어진 업종별 기획 산출물 패키지를 바로 받아보세요. 메뉴 구조, 화면 목록, 기능정의서, 흐름도, AI 빌드 스펙팩까지 한 벌로 제공합니다.",
  keywords: ["기획서 템플릿", "화면설계서 템플릿", "기능정의서 양식", "IA 템플릿", "웹기획 산출물"],
};

export default function PackagesPage() {
  return (
    <div className="bg-background">
      <section className="bg-linear-to-br from-pastel-lavender/40 via-background to-pastel-mint/40">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
            <ShoppingBag className="size-4" />
            패키지 구매
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            직접 만들지 않아도 돼요.
            <br />
            <span className="bg-pastel-yellow rounded-lg px-2 py-0.5">이미 만들어둔 패키지</span>를
            바로 받으세요.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            업종별로 완성된 기획 산출물입니다. 화면 목록부터 기능정의서, 흐름도, AI 빌드
            스펙팩까지 한 벌로 들어 있어요. 내려받아 바로 쓰거나, 내 서비스에 맞게 고쳐
            쓰시면 됩니다.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14">
        {/* 패키지 목록 */}
        <div className="flex flex-col gap-4">
          {PACKAGES.map((pkg) => {
            const lowest = Math.min(...pkg.tiers.map((t) => t.priceKrw));
            return (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.id}`}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary-on-soft">
                    <Package className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">{pkg.title}</h2>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {pkg.industry}
                      </span>
                      {!pkg.kmongUrl && (
                        <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
                          판매 준비 중
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {pkg.tagline}
                    </p>
                    <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {[
                        ["메뉴", pkg.stats.menus],
                        ["화면", pkg.stats.screens],
                        ["요건", pkg.stats.reqs],
                        ["화면 이동", pkg.stats.flows],
                      ].map(([label, value]) => (
                        <span key={label as string} className="flex gap-1">
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="font-bold text-primary">{value}</dd>
                        </span>
                      ))}
                    </dl>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  <p className="text-xs text-muted-foreground">
                    {formatKrw(lowest)}~
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    자세히 보기
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
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
