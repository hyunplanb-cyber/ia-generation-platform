import { Lock, ListChecks, Search } from "lucide-react";
import type { CheckStatus, VerificationReport } from "@/domain/verify/report";

const STATUS_KO: Record<CheckStatus, string> = { pass: "PASS", warn: "WARN", fail: "FAIL" };

// 우측 끝에 붙는 결과 라벨(PASS/FAIL/WARN).
function StatusBadge({ status }: { status: CheckStatus }) {
  const tone =
    status === "pass"
      ? "bg-success-soft text-success"
      : status === "warn"
        ? "bg-warning-soft text-warning"
        : "bg-danger-soft text-danger";
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>
      {STATUS_KO[status]}
    </span>
  );
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

// 검수 리포트 하나를 그리는 표시 전용 컴포넌트.
// 마케팅 /verify 와 프로젝트 대시보드 검수 탭이 같은 모습으로 보이도록 공유한다.
// 항목마다 테스트ID(AUTO-/SCN-)를 붙여 다운로드 엑셀과 번호가 맞도록 한다.
export function VerifyReportView({ report }: { report: VerificationReport }) {
  // 시나리오 각 단계의 테스트ID를 미리 매긴다(엑셀의 SCN-001…과 동일 순서).
  let scn = 0;
  const stepIds = report.scenarios.map((s) => s.steps.map(() => `SCN-${pad(++scn)}`));

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

      {/* 자동 검사 — URL 검수일 때만. 좌측에 테스트ID, 우측 끝에 PASS/FAIL/WARN */}
      {report.mode === "site" && report.checks.length > 0 && (
        <section className="rounded-xl border border-border bg-background p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Search className="size-4 text-primary" /> 자동 검사
          </h3>
          <ul className="flex flex-col gap-2.5">
            {report.checks.map((c, i) => (
              <li key={c.id} className="flex items-center gap-2.5 text-sm">
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  AUTO-{pad(i + 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-foreground">{c.label}</span>
                  <span className="text-muted-foreground"> — {c.detail}</span>
                </span>
                <StatusBadge status={c.status} />
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

      {/* 직접 확인 시나리오 — 항목마다 테스트ID(SCN-…). 결과 표시는 다운로드 엑셀에서 */}
      {report.scenarios.length > 0 && (
        <section className="rounded-xl border border-border bg-background p-5">
          <h3 className="mb-1 flex items-center gap-2 font-semibold text-foreground">
            <ListChecks className="size-4 text-primary" /> 직접 확인할 것
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            자동으로 볼 수 없는 부분이에요. 아래 순서대로 눌러보며 확인하고,{" "}
            <b className="font-semibold text-foreground">결과(PASS/FAIL/WARN)는 다운로드한 엑셀에
            기록</b>하세요.
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
                    <li key={j} className="flex items-baseline gap-2 text-sm text-muted-foreground">
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {stepIds[i][j]}
                      </span>
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
