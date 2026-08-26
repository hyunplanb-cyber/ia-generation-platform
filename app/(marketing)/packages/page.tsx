import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Sparkles } from "lucide-react";
import {
  packageProducts, planContents, packCredits, listedCategories, searchText,
} from "@/lib/packages";
import { PACKAGE_PRICES_PUBLIC, PACKAGE_SALE_OPEN } from "@/lib/flags";
import { Browse, type BrowseCard } from "./browse";

export const metadata: Metadata = {
  title: "AI팩 구매 — 업종별 화면설계서·기능정의서 완성본",
  description:
    "이미 만들어진 업종별 AI팩(기획 결과물 한 벌)을 바로 받아보세요. 메뉴 구조, 화면 목록, 기능정의서, 흐름도, AI 빌드 지시서, 디자인 규칙을 한 벌로 제공하고, 프리미엄은 만들어 둔 화면과 검수 시나리오까지 드립니다.",
  keywords: ["기획서 템플릿", "화면설계서 템플릿", "기능정의서 양식", "IA 템플릿", "웹기획 산출물"],
};

export default function PackagesPage() {
  /* 카드에 필요한 만큼만 추려 내려보낸다.
     PackageDef 를 통째로 넘기면 화면 수백 개짜리 템플릿 데이터가 브라우저로 간다. */
  const cards: BrowseCard[] = packageProducts().map(({ pkg, plan, href }) => ({
    key: `${pkg.id}-${plan.id}`,
    pkgId: pkg.id,
    title: pkg.title,
    category: pkg.category,
    planId: plan.id,
    planName: plan.name,
    depthLabel: plan.depthLabel,
    contents: planContents(plan),
    note: plan.highlights[plan.highlights.length - 1],
    credits: PACKAGE_PRICES_PUBLIC ? packCredits(plan.priceKrw) : null,
    saleOpen: PACKAGE_SALE_OPEN,
    hasSite: !!plan.siteScreens,
    href,
    find: searchText(pkg),
  }));
  const categories = listedCategories();

  return (
    <div className="bg-background">
      <section className="bg-linear-to-br from-primary-soft/40 via-background to-muted/40">
        <div className="mx-auto max-w-[1440px] px-6 pb-7 pt-14">
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
            업종별로 완성된 기획 결과물입니다. 화면 목록부터 기능정의서, 흐름도, AI 빌드 지시서,
            디자인 규칙까지 한 벌로 들어 있어요. 만들려는 사이트 규모에 맞춰 등급을
            고르시면 됩니다. 디럭스·프리미엄에는 그 설계로 이미 만들어 둔 화면과 검수 시나리오가
            함께 들어 있어요.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-6 pb-14 pt-7" data-나타남>
        {/* 갈래로 고르고, 말로 찾는다. 카드 그리기까지 Browse 가 맡는다.
            비어 있는 갈래는 서버에서 걸러 보낸다(listedCategories). */}
        <Browse cards={cards} categories={categories} />

        {/* 직접 만들기 유도 */}
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-on-soft">
            <Sparkles className="size-5" />
          </span>
          <h2 className="text-xl font-bold text-foreground">찾는 업종이 없나요?</h2>
          <p className="max-w-lg leading-relaxed text-muted-foreground">
            컨셉과 메뉴만 입력하면 내 서비스에 맞는 결과물을 직접 만들 수 있어요.
          </p>
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            무료로 만들어보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
