import { ShieldCheck, History, LayoutList } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listProjectVerifyRuns } from "@/application/list-project-verify-runs";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { DeliverableHeader, HeaderStat } from "../deliverable-header";
import { VerifyPanel } from "./verify-panel";

// 검수는 LLM 호출 + 여러 요청을 거쳐 15~30초가 걸릴 수 있다 → 무료 플랜 상한(60초) 명시.
export const maxDuration = 60;

function formatDate(d: Date): string {
  // 서버에서 고정 포맷으로. (예: 2026. 7. 28. 15:04)
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function ProjectVerifyPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [{ screens }, runs] = await Promise.all([
    getProjectScreensDetail(projectId),
    listProjectVerifyRuns(projectId),
  ]);
  const plannedScreens = screens.filter((s) => s.status === "active");

  return (
    <div className="point-green flex flex-col gap-6">
      <DeliverableHeader
        icon={ShieldCheck}
        tone="mint"
        title="사이트 검수"
        description="바이브코딩으로 만든 사이트, 오픈 전에 진짜 다 되는지 확인하세요."
        downloads={[]}
        meta={runs.length > 0 ? <HeaderStat label={`검수 ${runs.length}회`} /> : undefined}
      />

      {/* 설계도 대비 — 계획한 화면 목록을 옆에 두고 결과와 견줘볼 수 있게 */}
      {plannedScreens.length > 0 && (
        <details className="group rounded-xl border border-border bg-muted/20 p-4">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
            <LayoutList className="size-4 text-primary" />
            설계도에 계획한 화면 {plannedScreens.length}개
            <span className="text-xs font-normal text-muted-foreground">
              (검수 결과와 견줘보세요)
            </span>
          </summary>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {plannedScreens.map((s) => (
              <li key={s.id} className="flex items-baseline gap-2 text-sm text-muted-foreground">
                <span className="font-mono text-xs text-foreground/60">{s.pageId}</span>
                <span className="min-w-0 truncate text-foreground">{s.pageName}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* 검수 실행 */}
      <VerifyPanel projectId={projectId} />

      {/* 지난 검수 기록 */}
      {runs.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <History className="size-4 text-muted-foreground" /> 지난 검수 기록
          </h2>
          <div className="flex flex-col gap-2">
            {runs.map((run) => (
              <details key={run.id} className="rounded-xl border border-border bg-background">
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                  <span className="font-medium text-foreground">{formatDate(run.createdAt)}</span>
                  <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
                    {run.target}
                  </span>
                  {run.mode === "site" && (
                    <span className="ml-auto flex shrink-0 gap-1.5">
                      <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
                        통과 {run.report.passCount}
                      </span>
                      <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">
                        실패 {run.report.failCount}
                      </span>
                    </span>
                  )}
                </summary>
                <div className="border-t border-border/60 p-4">
                  <VerifyReportView report={run.report} />
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
