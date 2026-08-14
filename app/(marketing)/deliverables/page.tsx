import Link from "next/link";
import { LayoutList, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DeliverablesTabs } from "./deliverables-tabs";
import { HowToMake } from "./how-to-make";

export const metadata = {
  title: "IA팩 사용가이드 · 카페인컬러",
  description: "AI팩 결과물 6종(메뉴 구조·화면설계·기능정의서)과 사이트 검수 시나리오 — 무엇에 쓰는지 샘플과 함께",
};

export default function DeliverablesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border bg-linear-to-br from-primary-soft/40 via-background to-muted/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-on-soft">
            <LayoutList className="size-3.5" /> IA팩 사용가이드
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            만들기 전엔 AI팩, 오픈 전엔 검수
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            각 결과물이 무엇에 쓰이는지, 실제로 어떻게 생겼는지 샘플과 함께 소개해요.
          </p>
        </div>
      </section>

      <HowToMake />

      {/* 탭: AI팩 / 사이트 검수 */}
      <DeliverablesTabs />

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            내 프로젝트로 직접 만들어볼까요?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            컨셉과 메뉴만 입력하면 AI팩 한 벌이 몇 분 만에 완성돼요.
          </p>
          <Link
            href="/signup"
            className={`${buttonVariants({ size: "lg" })} mt-8 bg-background text-primary hover:bg-background/90`}
          >
            무료로 시작하기
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
