import { ShieldCheck, History, LayoutList } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listProjectVerifyRuns } from "@/application/list-project-verify-runs";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { isVerifyDownloadUnlocked } from "@/application/download";
import { CREDITS_OPEN } from "@/lib/flags";
import { CREDIT_COST } from "@/lib/credits";
import { DeliverableHeader, HeaderStat } from "../deliverable-header";
import { VerifyPanel } from "./verify-panel";

// 검수는 여러 페이지를 돌며 자동 검사(수십~백여 건) + LLM 시나리오까지 하므로
// 30초~1분 넘게 걸릴 수 있다. Fluid Compute에서는 무료 플랜도 300초까지 허용되므로
// 여유 있게 올린다(마케팅 /verify 와 동일).
export const maxDuration = 180;

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
  const verifyUnlocks = Object.fromEntries(
    await Promise.all(runs.map(async (r) => [r.id, await isVerifyDownloadUnlocked(r.id)] as const)),
  );

  return (
    <div className="point-green flex flex-col gap-6">
      <DeliverableHeader
        icon={ShieldCheck}
        tone="mint"
        title="사이트 검수"
        description="생성된 산출물을 기준으로, 오픈 전에 꼭 확인할 검수 시나리오를 만들어드려요."
        downloads={[]}
        meta={runs.length > 0 ? <HeaderStat label={`검수 ${runs.length}회`} /> : undefined}
      />

      {/* 왜 검수 시나리오가 필요한지 + 무엇을 검수하는지 + 몇 개가 나오는지 */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/20 p-5">
        <div>
          <p className="text-sm font-bold text-foreground">왜 검수 시나리오가 필요할까요?</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            바이브코딩·외주로 만든 사이트는 “화면은 있는데 버튼이 안 눌리거나, 계획한 기능이 빠지는” 경우가 많아요.
            생성된 산출물(화면·기능·버튼 연결)과 하나씩 대조해 <b className="text-foreground">진짜 다 됐는지</b>{" "}
            확인해야 오픈 후 사고를 막습니다.
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">
            지금 산출물 기준, 이런 부분을 검수해요
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "계획한 화면이 다 있는지",
              "버튼·링크가 설계대로 이동하는지",
              "기능정의서의 핵심 기능이 실제 되는지",
              "입력·폼 검증",
              "빈 상태·오류 처리",
              "모바일·반응형",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {plannedScreens.length > 0 ? (
          <p className="text-sm text-foreground">
            이 프로젝트는 <b className="text-primary">화면 {plannedScreens.length}개</b> 기준의 검수 시나리오가
            만들어져요.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            먼저 산출물(화면 목록)을 생성하면, 그 화면들 기준으로 검수 시나리오가 만들어져요.
          </p>
        )}
      </div>

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
                <div className="flex flex-col gap-4 border-t border-border/60 p-4">
                  <VerifyReportView report={run.report} />
                  {run.report.scenarios.length > 0 && (
                    <div className="flex justify-end">
                      <VerifyScenarioDownloadButton
                        report={run.report}
                        verifyRunId={run.id}
                        credits={CREDIT_COST.downloadVerify}
                        unlocked={verifyUnlocks[run.id]}
                        creditsOpen={CREDITS_OPEN}
                      />
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
