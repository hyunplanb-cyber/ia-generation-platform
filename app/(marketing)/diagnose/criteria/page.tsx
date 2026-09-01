import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ScrollText, Scale, Ban, ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CRITERIA, SOURCES, EXCLUDED, axisMax } from "@/lib/diagnose/criteria";
import { CodeText } from "../code-text";
import { SourceLink } from "../source-link";
import { AXIS_LABEL, AXIS_HELP, AXIS_TITLE, AXIS_WEIGHT, CRITERIA_VERSION } from "@/lib/diagnose/types";
import type { Axis } from "@/lib/diagnose/types";

// 배점 근거를 통째로 여는 페이지.
//
// 무료 진단은 결국 「그 점수를 왜 믿냐」에서 걸린다. 그래서 배점을 숨기지 않고 전부 연다.
// 넣은 항목보다 «뺀 항목»이 더 설득력이 있다 — llms.txt 를 왜 뺐는지가 그 예다.
//
// ⭐ 이 페이지의 숫자는 하나도 손으로 적지 않았다. 채점기가 쓰는 배점표(lib/diagnose/criteria.ts)를
//    그대로 세어서 그린다. 배점을 고치면 이 페이지도 같이 바뀐다 — 어긋날 수가 없다.

const AXES: Axis[] = ["seo", "aeo", "geo"];

export const metadata: Metadata = {
  title: "AI 노출 진단 배점표 — 무엇을 어떻게 재는지 전부 공개합니다",
  description:
    `AI 노출 무료 진단이 무엇을 보고 몇 점을 주는지 ${CRITERIA.length}개 항목 전부와 근거 문서를 공개합니다. 근거가 없어 «뺀» 항목도 함께 적었습니다.`,
  keywords: ["AI 노출 진단 기준", "GEO 배점표", "AEO 채점 기준", "llms.txt 효과"],
};

export default function CriteriaPage() {
  return (
    <div className="bg-background">
      <section className="bg-linear-to-br from-primary-soft/40 via-background to-muted/40">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
            <ScrollText className="size-4" />
            배점표 전체 공개
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            무엇을 어떻게 재는지
            <br />
            <span className="bg-primary-soft rounded-lg px-2 py-0.5">숨기지 않습니다</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            항목 {CRITERIA.length}개, 만점 조건, 근거 문서를 그대로 엽니다. 근거가 없어서{" "}
            <strong className="text-foreground">뺀 항목</strong>도 같이 적었습니다.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">채점 기준 {CRITERIA_VERSION}</p>
        </div>
      </section>

      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-14">
        {/* 축 비중 */}
        <section className="flex flex-col gap-4" data-나타남>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Scale className="size-5 text-primary" />
            세 갈래와 비중
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {AXES.map((ax) => (
              <div key={ax} className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-5">
                <div className="flex items-baseline justify-between">
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-bold text-foreground">{AXIS_TITLE[ax]}</span>
                    <span className="text-xs text-muted-foreground">{AXIS_LABEL[ax]}</span>
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {Math.round(AXIS_WEIGHT[ax] * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{AXIS_HELP[ax]}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  항목 {CRITERIA.filter((c) => c.axis === ax).length}개 · 합쳐서 {axisMax(ax)}점
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
            <p>
              셋은 «목표가 다릅니다». SEO 는 검색 순위에 오르는 것, AEO 는 「답」으로 뽑히는 것,
              GEO 는 AI 답변의 «출처»로 쓰이는 것입니다. 하나로 뭉쳐 재면 무엇을 고쳐야 할지 안 보여서
              따로 재고, 근거로 삼은 연구도 축마다 다릅니다.
            </p>
            <p>
              축마다 100점으로 재고 거의 같은 비중으로 합칩니다. 어느 하나가 더 중요하다고 말할
              근거를 찾지 못했기 때문입니다 —{" "}
              <strong className="text-foreground">모르는 것을 아는 척하지 않으려고 균등하게 뒀습니다.</strong>
            </p>
            <p>
              ⚠ <strong className="text-foreground">비중과 등급 커트(A 85 · B 70 · C 50)는 근거 문서가
              정해 준 값이 아니라 저희가 정한 판단</strong>입니다. 연구는 「무엇이 효과가 있다」까지 말하지
              몇 %로 나누라고 말해 주지 않습니다.
            </p>
          </div>
        </section>

        {/* 항목별 배점 */}
        {AXES.map((ax) => (
          <section key={ax} className="flex flex-col gap-3" data-나타남>
            <h2 className="text-xl font-bold text-foreground">
              {AXIS_TITLE[ax]} <span className="text-base font-normal text-muted-foreground">{AXIS_LABEL[ax]} — {AXIS_HELP[ax]}</span>
            </h2>
            <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {CRITERIA.filter((c) => c.axis === ax).map((c) => (
                <li key={c.id} className="flex flex-col gap-1.5 px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-bold text-foreground">{c.label}</span>
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-sm font-bold tabular-nums text-foreground">
                      {c.max}점
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{c.why}</p>
                  <p className="text-sm leading-6 text-foreground/80">
                    <span className="font-medium text-muted-foreground">재는 법 — </span>
                    <CodeText>{c.how}</CodeText>
                  </p>
                  <SourceLink source={c.source} className="text-xs" />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* 뺀 항목 — 여기가 이 페이지의 핵심이다 */}
        <section className="flex flex-col gap-3" data-나타남>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Ban className="size-5 text-destructive" />
            일부러 빼거나 낮춘 것
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            무엇을 넣었는지보다 무엇을 뺐는지가 기준의 정직함을 보여 준다고 생각합니다.
            근거가 없는 항목으로 점수를 매기면 손님이 헛일을 하게 됩니다.
          </p>
          <ul className="flex flex-col gap-3">
            {EXCLUDED.map((e) => (
              <li key={e.label} className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-bold text-foreground">{e.label}</span>
                  <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                    {e.verdict}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{e.reason}</p>
                <SourceLink source={e.source} className="text-xs" />
              </li>
            ))}
          </ul>
        </section>

        {/* 출처 */}
        <section className="flex flex-col gap-3" data-나타남>
          <h2 className="text-xl font-bold text-foreground">근거로 삼은 문서</h2>
          <ul className="flex flex-col gap-2">
            {Object.entries(SOURCES).map(([key, s]) => (
              <li key={key} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm">
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {s.label}
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">{s.label}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-sm leading-6 text-muted-foreground">
            이 진단은 페이지 소스만 보고 잽니다. 실제로 AI가 우리를 인용하는지까지는 이 방법으로
            알 수 없습니다. 기준이 바뀌면 위의 판 번호를 올리고, 바뀐 내용을 여기에 적습니다.
          </p>
        </section>

        <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-8 text-center" data-나타남>
          <h2 className="text-xl font-bold text-foreground">내 사이트는 몇 점일까요</h2>
          <Link href="/diagnose" className={buttonVariants({ size: "lg" })}>
            <ArrowLeft className="size-4" />
            무료 진단하러 가기
          </Link>
        </section>
      </div>
    </div>
  );
}
