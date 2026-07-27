"use client";

import { useActionState } from "react";
import { Check, AlertTriangle, X, Lock, ListChecks, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CheckStatus } from "@/domain/verify/report";
import { runVerifyAction, type VerifyState } from "./actions";

const initialState: VerifyState = { report: null, error: null };

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pass") return <Check className="size-4 shrink-0 text-success" />;
  if (status === "warn") return <AlertTriangle className="size-4 shrink-0 text-warning" />;
  return <X className="size-4 shrink-0 text-danger" />;
}

export function VerifyForm() {
  const [state, formAction, pending] = useActionState(runVerifyAction, initialState);
  const report = state.report;

  return (
    <div className="flex flex-col gap-8">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <Input
          name="url"
          type="text"
          inputMode="url"
          placeholder="https://내-사이트.com"
          className="flex-1"
          required
          disabled={pending}
        />
        <Button type="submit" disabled={pending} className="sm:w-40">
          {pending ? "검사 중…" : "사이트 검수하기"}
        </Button>
      </form>

      {pending && (
        <p className="text-sm text-muted-foreground">
          사이트를 열어 하나씩 확인하고 있어요. 보통 15~30초 걸려요. 창을 닫지 마세요.
        </p>
      )}

      {state.error && !pending && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}

      {report && !pending && (
        <div className="flex flex-col gap-6">
          {/* 요약 */}
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">검수 결과 ·</span>
              <span className="font-mono text-sm text-foreground">{report.finalUrl}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
                통과 {report.passCount}
              </span>
              {report.warnCount > 0 && (
                <span className="rounded-full bg-warning-soft px-3 py-1 text-sm font-semibold text-warning">
                  주의 {report.warnCount}
                </span>
              )}
              <span className="rounded-full bg-danger-soft px-3 py-1 text-sm font-semibold text-danger">
                실패 {report.failCount}
              </span>
            </div>
            <p className="mt-4 leading-relaxed text-foreground">{report.summary}</p>
          </div>

          {/* 자동 검사 */}
          <section className="rounded-xl border border-border bg-background p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <Search className="size-4 text-primary" /> 자동 검사
            </h3>
            <ul className="flex flex-col gap-2.5">
              {report.checks.map((c) => (
                <li key={c.id} className="flex items-start gap-2.5 text-sm">
                  <StatusIcon status={c.status} />
                  <span className="min-w-0">
                    <span className="font-medium text-foreground">{c.label}</span>
                    <span className="text-muted-foreground"> — {c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* 직접 확인 시나리오 */}
          {report.scenarios.length > 0 && (
            <section className="rounded-xl border border-border bg-background p-5">
              <h3 className="mb-1 flex items-center gap-2 font-semibold text-foreground">
                <ListChecks className="size-4 text-primary" /> 직접 확인할 것
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                자동으로 볼 수 없는 부분이에요. 아래 순서대로 눌러보며 확인하세요.
                {report.sensitiveScreens.length > 0 && (
                  <>
                    {" "}
                    로그인·결제 같은 화면(
                    <Lock className="inline size-3" /> 표시)은 특히 직접 봐야 해요.
                  </>
                )}
              </p>
              <ul className="flex flex-col gap-4">
                {report.scenarios.map((s, i) => (
                  <li key={i} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
                    <p className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground">
                      {s.area === "sensitive" && <Lock className="size-3.5 text-warning" />}
                      {s.screen}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {s.steps.map((step, j) => (
                        <li key={j} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary">·</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-center text-xs text-muted-foreground">
            자동 검사는 공개 화면만 봅니다. 로그인 뒤 화면은 위 시나리오로 직접 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
}
