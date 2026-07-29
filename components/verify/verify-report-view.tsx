import { Lock, ListChecks, Search, FileText } from "lucide-react";
import type { Check, CheckStatus, VerificationReport } from "@/domain/verify/report";

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

// 항목 한 줄 — 테스트ID(AUTO-…) + 이름 + 근거 + 결과, 실패면 근거 경로.
function CheckRow({ check, num }: { check: Check; num: number }) {
  return (
    <li className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2.5">
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">AUTO-{pad(num)}</span>
        <span className="min-w-0 flex-1">
          <span className="font-medium text-foreground">{check.label}</span>
          <span className="text-muted-foreground"> — {check.detail}</span>
        </span>
        <StatusBadge status={check.status} />
      </div>
      {check.items && check.items.length > 0 && (
        <ul className="ml-14 flex flex-col gap-0.5 border-l-2 border-danger/20 pl-3">
          {check.items.map((it, k) => (
            <li key={k} className="break-all font-mono text-[11px] text-danger/80">
              {it}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

// 검수 리포트 하나를 그리는 표시 전용 컴포넌트.
// 마케팅 /verify 와 프로젝트 대시보드 검수 탭이 같은 모습으로 보이도록 공유한다.
// 항목마다 테스트ID(AUTO-/SCN-)를 붙여 다운로드 엑셀과 번호가 맞도록 한다.
export function VerifyReportView({
  report,
  preview = false,
}: {
  report: VerificationReport;
  // 미리보기: 시나리오를 3개까지만 보여주고 "외 N개 시나리오 생성" 표기.
  preview?: boolean;
}) {
  // 자동 검사 항목의 전체 순번(엑셀 AUTO-001…과 동일 순서)을 미리 매긴다.
  const autoNum = new Map<string, number>();
  report.checks.forEach((c, i) => autoNum.set(c.id, i + 1));

  // 페이지 태그가 있으면 페이지별로 묶어 보여준다(없는 옛 결과는 한 덩어리).
  const siteChecks = report.checks.filter((c) => !c.page);
  const pageOrder: string[] = [];
  const byPage = new Map<string, Check[]>();
  for (const c of report.checks) {
    if (!c.page) continue;
    if (!byPage.has(c.page)) {
      byPage.set(c.page, []);
      pageOrder.push(c.page);
    }
    byPage.get(c.page)!.push(c);
  }
  const grouped = pageOrder.length > 0;

  // 시나리오 각 단계의 테스트ID를 미리 매긴다(엑셀의 SCN-001…과 동일 순서).
  let scn = 0;
  const stepIds = report.scenarios.map((s) => s.steps.map(() => `SCN-${pad(++scn)}`));

  return (
    <div className="flex flex-col gap-6">
      {/* 요약(총평) */}
      <div className="rounded-xl border border-border bg-background p-5">
        <p className="leading-relaxed text-foreground">{report.summary}</p>
      </div>

      {/* 자동 검사 — URL 검수일 때만. 결과 배지(총검수·PASS·WARN·FAIL)는 자동 검사 수치이므로 여기 묶는다 */}
      {report.mode === "site" && report.checks.length > 0 && (
        <section className="rounded-xl border border-border bg-background p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <Search className="size-4 text-primary" /> 자동 검사
            {grouped && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                · {pageOrder.length}개 페이지
              </span>
            )}
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            검수 시나리오 다운로드 시 전체 결과 확인이 가능합니다.
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              총 검수 {report.passCount + report.warnCount + report.failCount}
            </span>
            <span className="rounded-full bg-success-soft px-4 py-2 text-sm font-bold text-success">
              통과 · PASS {report.passCount}
            </span>
            <span className="rounded-full bg-warning-soft px-4 py-2 text-sm font-bold text-warning">
              주의 · WARN {report.warnCount}
            </span>
            <span className="rounded-full bg-danger-soft px-4 py-2 text-sm font-bold text-danger">
              실패 · FAIL {report.failCount}
            </span>
          </div>

          {grouped ? (
            <div className="flex flex-col gap-5">
              {siteChecks.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    사이트 전체
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {siteChecks.map((c) => (
                      <CheckRow key={c.id} check={c} num={autoNum.get(c.id) ?? 0} />
                    ))}
                  </ul>
                </div>
              )}
              {pageOrder.map((pg, idx) => {
                const pageChecks = byPage.get(pg)!;
                // 미리보기: 앞 2개 화면만 항목 전체, 나머지는 통과/주의/실패 건수만.
                const showFull = !preview || idx < 2;
                const cnt = { pass: 0, warn: 0, fail: 0 };
                for (const c of pageChecks) cnt[c.status]++;
                return (
                  <div key={pg} className="border-t border-border/60 pt-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <FileText className="size-3.5 text-primary" />
                        <span className="break-all">{pg}</span>
                      </p>
                      {!showFull && (
                        <span className="flex shrink-0 gap-1.5 text-xs font-semibold">
                          <span className="rounded-full bg-success-soft px-2 py-0.5 text-success">
                            통과 {cnt.pass}
                          </span>
                          {cnt.warn > 0 && (
                            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-warning">
                              주의 {cnt.warn}
                            </span>
                          )}
                          {cnt.fail > 0 && (
                            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-danger">
                              실패 {cnt.fail}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    {showFull && (
                      <ul className="flex flex-col gap-2.5">
                        {pageChecks.map((c) => (
                          <CheckRow key={c.id} check={c} num={autoNum.get(c.id) ?? 0} />
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {report.checks.map((c) => (
                <CheckRow key={c.id} check={c} num={autoNum.get(c.id) ?? 0} />
              ))}
            </ul>
          )}
        </section>
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
            {report.scenarios.map((s, i) => {
              const shown = preview ? s.steps.slice(0, 3) : s.steps;
              const rest = s.steps.length - shown.length;
              return (
                <li key={i} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
                  <p className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground">
                    {s.area === "sensitive" && <Lock className="size-3.5 text-warning" />}
                    {s.screen}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {shown.map((step, j) => (
                      <li key={j} className="flex items-baseline gap-2 text-sm text-muted-foreground">
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {stepIds[i][j]}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  {preview && rest > 0 && (
                    <p className="mt-1.5 pl-[3.25rem] text-xs font-medium text-primary">
                      외 {rest}개 시나리오 생성
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
