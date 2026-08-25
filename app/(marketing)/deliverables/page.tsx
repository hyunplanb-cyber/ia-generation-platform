import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DeliverablesTabs } from "./deliverables-tabs";

export const metadata = {
  title: "IA팩 사용가이드 · 카페인컬러",
  description: "AI팩 결과물 6종(메뉴 구조·화면설계·기능정의서)과 사이트 검수 시나리오 — 무엇에 쓰는지 샘플과 함께",
};

export default function DeliverablesPage() {
  return (
    <div className="flex flex-col">
      {/* ⛔ 여기 있던 머리말 절(뱃지 + 큰 제목 + 소개문)을 뺐다 — 2026-08-25 사장님이
          그 자리를 짚어 지우라고 하셨다. 위 내비게이션에 이미 「IA팩 사용가이드」가
          켜져 있어, 같은 말을 두 번 하고 페이지 첫 화면을 320px 잡아먹고 있었다.
          이제 탭이 바로 나온다.

          ⚠ 그래도 h1 은 남긴다 — «눈에만» 안 보인다(sr-only).
            페이지에 제목이 하나도 없으면 검색엔진이 무슨 페이지인지 못 읽고,
            화면낭독기를 쓰는 분은 어디에 왔는지 알 길이 없다.
            보이는 것을 지우는 것과 «없애는» 것은 다르다. */}
      <h1 className="sr-only">IA팩 사용가이드 — 만들기 전엔 AI팩, 오픈 전엔 검수</h1>

      {/* 탭: 만드는 방법 / AI팩 / 사이트 검수 */}
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
