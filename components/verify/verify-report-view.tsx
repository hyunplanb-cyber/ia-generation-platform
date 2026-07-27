import { Check, AlertTriangle, X, Lock, ListChecks, Search } from "lucide-react";
import type { CheckStatus, VerificationReport } from "@/domain/verify/report";

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pass") return <Check className="size-4 shrink-0 text-success" />;
  if (status === "warn") return <AlertTriangle className="size-4 shrink-0 text-warning" />;
  return <X className="size-4 shrink-0 text-danger" />;
}

// 검수 리포트 하나를 그리는 표시 전용 컴포넌트.
// 마케팅 /verify 와 프로젝트 대시보드 검수 탭이 같은 모습으로 보이도록 공유한다.
export function VerifyReportView({ report }: { report: VerificationReport }) {
  return (
    <div className="flex flex-col gap-6">
      {/* 요약 */}
      <div className="rounded-xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {report.mode === "document" ? "문서 기반 시나리오 ·" : "검수 결과 ·"}
          </span>
          <span className="font-mono text-sm break-all text-foreground">{report.finalUrl}</span>
        </div>
        {report.mode === "site" && (
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
        )}
        <p className="mt-4 leading-relaxed text-foreground">{report.summary}</p>
      </div>

      {/* 자동 검사 — URL 검수일 때만 */}
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

      {report.mode === "document" && (
        <p className="rounded-lg bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          문서만으로는 자동 검사(Pass/Fail)를 하지 않아요. 사이트가 만들어지면 URL을 넣어 실제 검수를
          받아보세요.
        </p>
      )}

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
    </div>
  );
}
