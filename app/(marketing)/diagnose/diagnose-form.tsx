"use client";

// AI 노출 진단 화면.
//
// 주소 하나만 받는다. 물어볼 것을 늘리면 「해볼까」 하던 사람이 그 자리에서 나간다 —
// 무료 샘플에서 가입을 뒤로 미룬 것과 같은 이유다(app/api/free-sample/route.ts).
//
// 결과를 남기지 않는다. 점수는 화면에만 뜨고 DB 에 저장하지 않는다.
// 「내 사이트 주소를 남 서버에 적어도 되나」 하는 망설임을 없애는 쪽이 먼저다.

import { useState } from "react";
import { Search, Loader2, AlertCircle, Check, Minus, X, TriangleAlert, Wrench, Info, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// ⛔ "@/lib/diagnose" 에서 끌어오면 안 된다 — 거기 딸린 node:dns 까지 브라우저 묶음에
//    들어가 빌드가 깨진다(2026-08-31 실제로 겪음). 화면은 types 만 본다.
import type { DiagnoseResult, Axis } from "@/lib/diagnose/types";
import { AXIS_LABEL, AXIS_HELP, AXIS_TITLE } from "@/lib/diagnose/types";
// 배점표는 브라우저에서도 안전하다(node: 모듈을 안 쓴다). 채점기와 «같은 파일»을 읽으므로
// 화면에 뜨는 배점이 실제 채점과 어긋날 수 없다.
import { CRITERIA, SOURCES } from "@/lib/diagnose/criteria";
import { CodeText } from "./code-text";
import { SourceLink } from "./source-link";

const GRADE_TONE: Record<DiagnoseResult["grade"], string> = {
  A: "bg-emerald-500",
  B: "bg-sky-500",
  C: "bg-amber-500",
  D: "bg-rose-500",
};

/** 항목 id 로 배점 기준을 찾는다. 매번 훑지 않게 한 번만 만들어 둔다. */
const CRITERION_BY_ID = new Map(CRITERIA.map((c) => [c.id, c]));
const criterionOf = (id: string) => CRITERION_BY_ID.get(id);

/** 만점이면 ○, 0점이면 ✕, 그 사이는 △. 숫자만 보면 무엇을 고쳐야 할지 안 보인다. */
function mark(got: number, max: number) {
  if (got >= max) return { Icon: Check, tone: "text-emerald-600", bg: "bg-emerald-50" };
  if (got <= 0) return { Icon: X, tone: "text-rose-600", bg: "bg-rose-50" };
  return { Icon: Minus, tone: "text-amber-600", bg: "bg-amber-50" };
}

export function DiagnoseForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  // 배점 기준을 펼쳐 둔 항목들. 여러 개를 동시에 열어 견줄 수 있게 Set 으로 둔다.
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggleCriterion = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setOpenIds(new Set());
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "진단에 실패했습니다");
      else setResult(data as DiagnoseResult);
    } catch {
      setError("연결이 끊겼어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <form onSubmit={submit} className="flex w-full flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="mysite.co.kr"
          // https:// 를 안 붙여도 되게 서버가 알아서 채운다. 손님에게 형식을 요구하지 않는다.
          className="h-12 flex-1 text-base"
          disabled={loading}
          aria-label="진단할 사이트 주소"
        />
        <Button type="submit" size="lg" className="h-12 px-6" disabled={loading || !url.trim()}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {loading ? "살펴보는 중" : "무료로 진단"}
        </Button>
      </form>

      {loading && (
        <p className="text-center text-sm text-muted-foreground">
          사이트와 robots.txt · sitemap.xml 을 읽고 있어요. 10초쯤 걸립니다.
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-8">
          {/* 점수보다 «먼저» 말해야 하는 한 가지. 낮은 점수 열둘이 사실 한 원인일 때가 많다. */}
          {result.headline && (
            <div
              className={`flex gap-3 rounded-2xl border p-5 ${
                result.headline.tone === "danger"
                  ? "border-rose-200 bg-rose-50"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <TriangleAlert
                className={`mt-0.5 size-5 shrink-0 ${
                  result.headline.tone === "danger" ? "text-rose-600" : "text-amber-600"
                }`}
              />
              <div className="flex flex-col gap-1">
                <p className="font-bold text-foreground">{result.headline.title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{result.headline.body}</p>
              </div>
            </div>
          )}

          {/* 종합 점수 */}
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="text-sm text-muted-foreground">{result.url}</p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-bold tracking-tight text-foreground">
                {result.total}
              </span>
              <span className="text-2xl text-muted-foreground">점</span>
              <span
                className={`${GRADE_TONE[result.grade]} rounded-lg px-3 py-1 text-2xl font-bold text-white`}
              >
                {result.grade}
              </span>
            </div>
          </div>

          {/* 기술 / 내용 — 「우리 업종이라 낮은 건가?」에 답해 주는 자리.
              총점 하나만 보여 주면 손님이 그걸 구분할 수 없다. */}
          <div className="grid gap-4 sm:grid-cols-2">
            {(["기술", "내용"] as const).map((k) => (
              <div key={k} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-foreground">
                    {k === "기술" ? "기술 점수" : "내용 점수"}
                  </span>
                  <span className="text-3xl font-bold text-foreground">{result.kinds[k].score}</span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {k === "기술"
                    ? "누구나 갖출 수 있는 것 — 색인·봇 허용·서버 렌더링·메타태그. 업종과 상관없습니다. 낮으면 «안 한 것»입니다."
                    : "이 화면에 «무엇을 썼는가» — 인용문·통계·출처·최신 날짜. 홈 화면은 대개 낮게 나옵니다. 자료·FAQ 쪽을 따로 재 보세요."}
                </p>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${k === "기술" ? "bg-sky-500" : "bg-primary"}`}
                    style={{ width: `${result.kinds[k].score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 세 축 */}
          <div className="grid gap-4 sm:grid-cols-3">
            {(Object.keys(result.axes) as Axis[]).map((ax) => (
              <div key={ax} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
                <div className="flex items-baseline justify-between">
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-bold text-foreground">{AXIS_TITLE[ax]}</span>
                    <span className="text-xs font-medium text-muted-foreground">{AXIS_LABEL[ax]}</span>
                  </span>
                  <span className="text-2xl font-bold text-foreground">{result.axes[ax].score}</span>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">{AXIS_HELP[ax]}</p>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${result.axes[ax].score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* AI 수집 로봇.
              robots.txt 로 열어 줬다고 다 읽는 게 아니다. 자바스크립트로 그리는 사이트면
              «JS 를 실행하는 봇»만 내용을 본다. 그걸 안 갈라 주면 초록불 일곱 개를 보고
              「다 잘 읽어 간다」고 오해한다. */}
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground">AI 수집 로봇</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {/* 「사이트는」이라고 쓰지 마라. 여기 붙는 «빈 화면» 표시는 잰 그 한 장의 이야기다.
                  같은 사이트라도 쪽마다 서버 렌더링 여부가 갈린다 — 아래 「사이트 훑어보기」가 그 증거다. */}
              {result.jsRendered
                ? "이 화면은 자바스크립트로 그려집니다. 그래서 robots.txt 가 열어 줘도 «이 화면의 내용까지» 보는 봇은 따로입니다."
                : "robots.txt 에서 막고 있으면 그 AI 는 이 사이트를 아예 못 읽습니다."}
            </p>
            <div className="flex flex-wrap gap-2">
              {result.bots.map((b) => {
                // 막혔으면 그것부터. 열려 있어도 JS 를 못 읽으면 «빈 화면»을 받는다.
                const state = !b.allowed
                  ? { tone: "bg-rose-50 text-rose-700", Icon: X, tail: "막힘" }
                  : result.jsRendered && b.rendersJs === false
                    ? { tone: "bg-rose-50 text-rose-700", Icon: X, tail: "빈 화면" }
                    : result.jsRendered && b.rendersJs === null
                      ? { tone: "bg-amber-50 text-amber-700", Icon: Minus, tail: "확인 안 됨" }
                      : { tone: "bg-emerald-50 text-emerald-700", Icon: Check, tail: null };
                return (
                  <span
                    key={b.id}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${state.tone}`}
                  >
                    <state.Icon className="size-3.5" />
                    {b.label}
                    {state.tail && <span className="text-xs opacity-70">· {state.tail}</span>}
                  </span>
                );
              })}
            </div>
            {result.jsRendered && (
              <p className="text-xs leading-5 text-muted-foreground/80">
                GPTBot·ClaudeBot·PerplexityBot 은 자바스크립트를 실행하지 않습니다 — Vercel 이
                GPTBot 요청 5억 건 이상을 분석했는데 실행 증거가 0건이었습니다. 반면 Gemini 는
                Googlebot 의 렌더링을 쓰고, Bingbot 은 Chromium 엔진으로 직접 그려서 봅니다.
                네이버는 공식 문서가 실행 여부를 밝히지 않고 「SSR 도입을 권장한다」고만 해서
                «확인 안 됨»으로 둡니다 — 권고가 SSR 인 만큼 기대지 않는 편이 안전합니다.
              </p>
            )}
          </section>

          {/* 사이트 훑어보기.
              한 장만 보고 「이 사이트는 …」이라고 말하지 않기 위한 자리다.
              홈은 대개 사진과 배너뿐이라 내용 점수가 낮게 나오는데, 그것을
              「이 사이트에는 쓸 내용이 없다」로 읽으면 처방이 통째로 틀린다. */}
          {result.site && result.site.pages.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-foreground">사이트 훑어보기</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  사이트맵에 적힌{" "}
                  <strong className="text-foreground">
                    {result.site.sitemapCount?.toLocaleString()}개
                  </strong>{" "}
                  주소 중 {result.site.pages.length}장을 골라 함께 열어 봤습니다. AI 로봇도
                  사이트맵을 타고 이렇게 안쪽까지 읽습니다.
                </p>
              </div>

              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {result.site.pages.map((p) => (
                  <li key={p.url} className="flex items-center gap-3 px-4 py-3">
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                        p.jsRendered
                          ? "bg-rose-50 text-rose-600"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {p.jsRendered ? "비어 있음" : "글 보임"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground" title={p.url}>
                      {p.path}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {p.textLength.toLocaleString()}자
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                      {p.total}점
                    </span>
                  </li>
                ))}
              </ul>

              {result.site.best && !result.site.best.jsRendered && (
                <p className="text-sm leading-6 text-muted-foreground">
                  이 중 AI가 인용할 만한 재료가 가장 많은 쪽은{" "}
                  <strong className="text-foreground">{result.site.best.path}</strong> 입니다(내용{" "}
                  {result.site.best.content}점). 내용을 더 손보실 거라면 홈보다 이런 쪽을 먼저
                  보시는 편이 이득이 큽니다.
                </p>
              )}

              <p className="text-xs leading-5 text-muted-foreground/80">
                ⚠ 위의 총점과 항목별 점수는 «입력하신 그 한 장»의 것입니다. 여기 목록은 사이트가
                전체적으로 어떤지 보는 용도이지, 총점에 합산되지 않습니다.
              </p>
            </section>
          )}

          {/* 항목 하나마다 «그 자리에서» 고치는 법까지 보여 준다.
              판정과 처방을 따로 두면 「내부 링크가 0개」를 읽고 다시 아래로 내려가
              같은 항목을 찾아야 한다. 손님은 그 왕복을 안 한다. */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-foreground">
                항목별 {result.items.length}가지와 고치는 법
              </h2>
              <p className="text-sm text-muted-foreground">
                만점이 아닌 항목에는 고치는 법을 함께 적었습니다.{" "}
                <span className="font-medium text-foreground">고치면 +N점</span> 이 큰 것부터
                손대시면 총점이 가장 빨리 오릅니다.
              </p>
            </div>

            {(Object.keys(result.axes) as Axis[]).map((ax) => (
              <div key={ax} className="flex flex-col gap-2">
                <h3 className="flex items-baseline gap-2 text-sm font-bold text-foreground">
                  {AXIS_TITLE[ax]} <span className="text-xs font-medium text-muted-foreground">{AXIS_LABEL[ax]}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {AXIS_HELP[ax]} · {result.axes[ax].score}점
                  </span>
                </h3>

                <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                  {result.items
                    .filter((i) => i.axis === ax)
                    .map((it) => {
                      const { Icon, tone, bg } = mark(it.got, it.max);
                      return (
                        <li key={it.id} className="flex flex-col gap-3 px-4 py-4">
                          {/* 판정 줄 */}
                          <div className="flex items-start gap-3">
                            <span className={`mt-0.5 rounded-full p-1 ${bg} ${tone}`}>
                              <Icon className="size-3.5" />
                            </span>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-baseline gap-x-2">
                                <span className="font-medium text-foreground">{it.label}</span>
                                {/* 「이 항목은 어떻게 몇 점으로 재나」를 그 자리에서 편다.
                                    전체 배점표(/diagnose/criteria)는 그대로 두고, 여기선 이 항목만 보여 준다. */}
                                <button
                                  type="button"
                                  onClick={() => toggleCriterion(it.id)}
                                  aria-expanded={openIds.has(it.id)}
                                  aria-label={`${it.label} 배점 기준 보기`}
                                  title="이 항목의 배점 기준 보기"
                                  className="inline-flex items-center gap-0.5 rounded text-xs text-muted-foreground transition-colors hover:text-primary"
                                >
                                  <Info className="size-3.5" />
                                  <ChevronDown
                                    className={`size-3 transition-transform ${openIds.has(it.id) ? "rotate-180" : ""}`}
                                  />
                                </button>
                                {it.fix && (
                                  <span className="rounded-md bg-primary-soft px-1.5 py-0.5 text-xs font-semibold text-foreground">
                                    고치면 +{it.lost}점
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-sm text-muted-foreground">{it.note}</p>
                              {/* 통과한 항목엔 처방이 없으니, 왜 보는 항목인지라도 남겨 준다.
                                  틀린 항목은 아래 처방이 그 설명을 대신한다. */}
                              {!it.fix && it.why && (
                                <p className="mt-1 text-xs leading-5 text-muted-foreground/70">
                                  {it.why}
                                </p>
                              )}

                              {/* 펼친 배점 기준 — 배점표(criteria.ts)를 그대로 읽는다.
                                  채점기가 쓰는 표와 «같은 파일»이라 어긋날 수 없다. */}
                              {openIds.has(it.id) && criterionOf(it.id) && (
                                <dl className="mt-2 flex flex-col gap-1.5 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-5">
                                  <div className="flex gap-2">
                                    <dt className="shrink-0 font-semibold text-foreground">배점</dt>
                                    <dd className="text-muted-foreground">{criterionOf(it.id)!.max}점 만점</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="shrink-0 font-semibold text-foreground">재는 법</dt>
                                    <dd className="text-muted-foreground">
                                      <CodeText>{criterionOf(it.id)!.how}</CodeText>
                                    </dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="shrink-0 font-semibold text-foreground">왜</dt>
                                    <dd className="text-muted-foreground">{criterionOf(it.id)!.why}</dd>
                                  </div>
                                  <div className="flex gap-2">
                                    <dt className="shrink-0 font-semibold text-foreground">근거</dt>
                                    <dd>
                                      <SourceLink source={criterionOf(it.id)!.source} prefix={false} />
                                    </dd>
                                  </div>
                                </dl>
                              )}
                            </div>
                            <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                              {it.got}/{it.max}
                            </span>
                          </div>

                          {/* 그 자리에 붙는 처방 */}
                          {it.fix && (
                            <div className="ml-9 flex flex-col gap-2 rounded-lg border-l-2 border-primary/40 bg-muted/40 py-2 pl-4 pr-3">
                              <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                <Wrench className="size-3.5" />
                                고치는 법
                              </p>
                              <p className="text-sm leading-6 text-muted-foreground">{it.fix.what}</p>
                              <p className="text-sm leading-6 text-foreground">{it.fix.how}</p>
                              {it.fix.snippet && (
                                <pre className="overflow-x-auto rounded-lg bg-background p-3 text-xs leading-5 text-foreground">
                                  <code>{it.fix.snippet}</code>
                                </pre>
                              )}
                              {it.fix.verify && (
                                <p className="text-xs leading-5 text-muted-foreground/80">
                                  확인하는 법 — {it.fix.verify}
                                </p>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </section>

          <p className="text-center text-xs text-muted-foreground">
            페이지 소스만 보고 잰 값이에요. 실제로 AI가 인용하는지는 이 방법으로는 알 수 없습니다.
            <br />
            채점 기준 {result.version} ·{" "}
            <a href="/diagnose/criteria" className="underline underline-offset-4 hover:text-foreground">
              배점표 보기
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
