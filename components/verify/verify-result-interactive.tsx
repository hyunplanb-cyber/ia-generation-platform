"use client";

import { Check, AlertTriangle, X, Lock, ListChecks, Search } from "lucide-react";
import type { CheckStatus, VerificationReport } from "@/domain/verify/report";

export type VerifyMark = "" | "pass" | "fail" | "warn";

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pass") return <Check className="size-4 shrink-0 text-success" />;
  if (status === "warn") return <AlertTriangle className="size-4 shrink-0 text-warning" />;
  return <X className="size-4 shrink-0 text-danger" />;
}

const MARK_OPTIONS: { value: VerifyMark; label: string }[] = [
  { value: "", label: "미정" },
  { value: "pass", label: "PASS" },
  { value: "fail", label: "FAIL" },
  { value: "warn", label: "WARN" },
];

// 검수 결과를 보여주되, 직접 확인 시나리오는 항목마다 PASS/FAIL/WARN을 고르게 하고
// 고른 값을 위에서 실시간으로 카운팅한다.
export function VerifyResultInteractive({
  report,
  marks,
  onChange,
}: {
  report: VerificationReport;
  marks: Record<string, VerifyMark>;
  onChange: (next: Record<string, VerifyMark>) => void;
}) {
  const setMark = (key: string, v: VerifyMark) => onChange({ ...marks, [key]: v });

  const vals = Object.values(marks).filter(Boolean);
  const pass = vals.filter((v) => v === "pass").length;
  const fail = vals.filter((v) => v === "fail").length;
  const warn = vals.filter((v) => v === "warn").length;
  const totalSteps = report.scenarios.reduce((n, s) => n + s.steps.length, 0);
  const undecided = totalSteps - pass - fail - warn;

  return (
    <div className="flex flex-col gap-6">
      {/* 요약 + 직접 확인 집계(고를수록 카운팅) */}
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {report.mode === "document" ? "문서 기반 시나리오 ·" : "검수 결과 ·"}
          </span>
          <span className="font-mono text-sm break-all text-foreground">{report.finalUrl}</span>
        </div>
        {report.mode === "site" && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
              자동 통과 {report.passCount}
            </span>
            {report.warnCount > 0 && (
              <span className="rounded-full bg-warning-soft px-3 py-1 text-sm font-semibold text-warning">
                자동 주의 {report.warnCount}
              </span>
            )}
            <span className="rounded-full bg-danger-soft px-3 py-1 text-sm font-semibold text-danger">
              자동 실패 {report.failCount}
            </span>
          </div>
        )}
        <p className="mt-4 leading-relaxed text-foreground">{report.summary}</p>

        {totalSteps > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
            <span className="text-xs font-semibold text-muted-foreground">직접 확인 집계</span>
            <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-xs font-bold text-success">
              PASS {pass}
            </span>
            <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-xs font-bold text-danger">
              FAIL {fail}
            </span>
            <span className="rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-bold text-warning">
              WARN {warn}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
              미정 {undecided}
            </span>
          </div>
        )}
      </div>

      {/* 자동 검사 — 읽기 전용(엔진 결과) */}
      {report.mode === "site" && report.checks.length > 0 && (
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
      )}

      {/* 직접 확인 시나리오 — 항목마다 PASS/FAIL/WARN 선택 */}
      {report.scenarios.length > 0 && (
        <section className="rounded-xl border border-border bg-background p-5">
          <h3 className="mb-1 flex items-center gap-2 font-semibold text-foreground">
            <ListChecks className="size-4 text-primary" /> 직접 확인할 것
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            항목마다 눌러보고 결과를 골라주세요. 고르면 위 집계에 바로 반영되고, 다운로드 문서에도
            들어갑니다.
          </p>
          <ul className="flex flex-col gap-4">
            {report.scenarios.map((s, si) => (
              <li key={si} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
                <p className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
                  {s.area === "sensitive" && <Lock className="size-3.5 text-warning" />}
                  {s.screen}
                </p>
                <ul className="flex flex-col gap-2">
                  {s.steps.map((step, sti) => {
                    const key = `${si}-${sti}`;
                    const v = marks[key] ?? "";
                    return (
                      <li key={sti} className="flex items-center gap-2 text-sm">
                        <span className="text-primary">·</span>
                        <span className="min-w-0 flex-1 text-muted-foreground">{step}</span>
                        <select
                          aria-label="확인 결과"
                          value={v}
                          onChange={(e) => setMark(key, e.target.value as VerifyMark)}
                          className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold outline-none ${
                            v === "pass"
                              ? "border-success/40 bg-success-soft text-success"
                              : v === "fail"
                                ? "border-danger/40 bg-danger-soft text-danger"
                                : v === "warn"
                                  ? "border-warning/40 bg-warning-soft text-warning"
                                  : "border-border bg-background text-muted-foreground"
                          }`}
                        >
                          {MARK_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
