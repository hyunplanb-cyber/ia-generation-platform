import Link from "next/link";
import {
  Plus,
  Sparkles,
  CalendarRange,
  Monitor,
  PencilRuler,
  ShieldQuestion,
  History,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { countScreensByProject } from "@/application/count-screens-by-project";
import { listMyProjects } from "@/application/list-my-projects";
import { listProjectResults, type ProjectResult } from "@/application/list-project-results";
import { listMyVerifyRuns } from "@/application/list-my-verify-runs";
import { requireSession } from "@/application/require-session";
import { canDownload } from "@/application/get-current-plan";
import { getProjectQuota } from "@/application/can-create-project";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { ZipAllButton } from "./zip-all-button";
import { UpgradeToDownload } from "./[projectId]/upgrade-to-download";
import { ProjectDeliverablePreview } from "./project-deliverable-preview";
import { createDraftProjectAction } from "./actions";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

// 상단 탭 — 설계도 프롬프트 / 사이트 검수
function DashboardTabs({ active }: { active: "planning" | "verify" }) {
  const tabs = [
    { key: "planning", label: "설계도 프롬프트", href: "/dashboard", icon: PencilRuler },
    { key: "verify", label: "사이트 검수", href: "/dashboard?tab=verify", icon: ShieldQuestion },
  ] as const;
  return (
    <div className="border-b border-border">
      <div className="flex gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const on = active === t.key;
          return (
            <Link
              key={t.key}
              href={t.href}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                on
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string; tab?: string }>;
}) {
  const [{ limit, tab }, session, projects, downloadable] = await Promise.all([
    searchParams,
    requireSession(),
    listMyProjects(),
    canDownload(),
  ]);
  const activeTab = tab === "verify" ? "verify" : "planning";
  const quota = await getProjectQuota(projects.length);
  const hitLimit = limit === "reached" || !quota.allowed;

  let body: React.ReactNode;
  if (activeTab === "verify") {
    body = <VerifyTab runs={await listMyVerifyRuns()} />;
  } else {
    const screenCounts = await countScreensByProject(projects.map((p) => p.id));
    // 생성 완료(화면이 생긴)된 것만 목록에 노출한다. 작성 중(초안)은 감춘다.
    const completed = projects
      .filter((p) => (screenCounts[p.id] ?? 0) > 0)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const results = await listProjectResults(completed.map((p) => p.id));
    body = (
      <PlanningTab
        completed={completed}
        results={results}
        screenCounts={screenCounts}
        draftCount={projects.length - completed.length}
        hitLimit={hitLimit}
        quotaLimit={quota.limit}
        downloadable={downloadable}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">{session.user.name}님의 프로젝트</h1>
        <p className="text-muted-foreground">
          설계도 프롬프트와 사이트 검수를 탭으로 나눠서 관리해요.
        </p>
      </div>

      <DashboardTabs active={activeTab} />
      {body}
    </div>
  );
}

// ── 설계도 프롬프트 탭 ──────────────────────────────
function PlanningTab({
  completed,
  results,
  screenCounts,
  draftCount,
  hitLimit,
  quotaLimit,
  downloadable,
}: {
  completed: Awaited<ReturnType<typeof listMyProjects>>;
  results: Record<string, ProjectResult>;
  screenCounts: Record<string, number>;
  draftCount: number;
  hitLimit: boolean;
  quotaLimit: number | null;
  downloadable: boolean;
}) {
  const newButton = hitLimit ? (
    <span
      className="rounded-lg border border-border bg-muted/60 px-4 py-2 text-sm font-semibold text-muted-foreground"
      title={`무료 플랜은 프로젝트 ${quotaLimit}개까지 만들 수 있어요.`}
    >
      프로젝트 {quotaLimit}개까지 (무료)
    </span>
  ) : (
    <form action={createDraftProjectAction}>
      <Button type="submit">
        <Plus className="size-4" />새 프로젝트 만들기
      </Button>
    </form>
  );

  if (completed.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-on-soft">
          <Sparkles className="size-8" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-foreground">아직 완성된 프로젝트가 없어요</h2>
          <p className="mt-2 text-muted-foreground">
            컨셉만 입력하면 AI가 메뉴 구조·화면 목록·기능정의서까지 자동으로 만들어드려요.
            {draftCount > 0 && ` (작성 중 ${draftCount}개는 완성되면 여기에 표시돼요.)`}
          </p>
        </div>
        <form action={createDraftProjectAction}>
          <Button type="submit" size="lg">
            <Plus className="size-4" />새 프로젝트 만들기
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          완성된 프로젝트 {completed.length}개
          {draftCount > 0 && ` · 작성 중 ${draftCount}개는 완성되면 표시돼요`}
        </p>
        {newButton}
      </div>

      {hitLimit && (
        <p className="rounded-xl border border-border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
          무료 플랜에서는 프로젝트를 <b className="font-semibold text-foreground">{quotaLimit}개</b>까지
          만들 수 있어요. 새로 만들려면 기존 프로젝트를 지우거나, 유료 플랜이 열릴 때까지 기다려 주세요.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {completed.map((p) => {
          const count = screenCounts[p.id] ?? 0;
          const result = results[p.id];
          return (
            <details
              key={p.id}
              className="group rounded-2xl border border-border bg-surface shadow-sm"
            >
              <summary className="cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="w-fit rounded-full bg-pastel-mint px-2.5 py-0.5 text-xs font-semibold text-pastel-mint-foreground">
                      생성 완료
                    </span>
                    <h3 className="line-clamp-1 text-base font-bold text-foreground">
                      {p.concept || "새 프로젝트"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarRange className="size-4" />
                        {p.overallStart} ~ {p.overallEnd}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Monitor className="size-4" />
                        화면 {count}개
                      </span>
                      <span className="text-xs text-muted-foreground/80">
                        최근 수정 {formatDate(p.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {downloadable ? (
                      <ZipAllButton projectId={p.id} large />
                    ) : (
                      <UpgradeToDownload label="전체 다운로드" />
                    )}
                    <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
                  </div>
                </div>
              </summary>

              <div className="border-t border-border/60 p-5">
                {result && <ProjectDeliverablePreview projectId={p.id} result={result} />}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

// ── 사이트 검수 탭 ──────────────────────────────
function VerifyTab({ runs }: { runs: Awaited<ReturnType<typeof listMyVerifyRuns>> }) {
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-pastel-mint text-pastel-mint-foreground">
          <ShieldQuestion className="size-8" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-foreground">아직 검수한 사이트가 없어요</h2>
          <p className="mt-2 text-muted-foreground">
            만든 사이트의 주소(URL)나 설계 문서를 넣으면, 오픈 전에 무엇을 확인해야 하는지 짚어드려요.
          </p>
        </div>
        <Link href="/verify">
          <Button size="lg">
            <ShieldQuestion className="size-4" />내 사이트 검수하기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="point-green flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <History className="size-4" /> 지난 검수 {runs.length}회
        </p>
        <Link href="/verify">
          <Button size="sm">
            <ShieldQuestion className="size-4" />다른 사이트 검수하기
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {runs.map((run) => (
          <details key={run.id} className="rounded-xl border border-border bg-surface">
            <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="w-fit rounded-full bg-pastel-mint px-2.5 py-0.5 text-xs font-semibold text-pastel-mint-foreground">
                    검수완료
                  </span>
                  <span className="max-w-[600px] truncate font-mono text-sm text-muted-foreground">
                    {run.target}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span>{formatDateTime(run.createdAt)}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                      검수 {run.report.checks.length}건
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                      시나리오 {run.report.scenarios.reduce((n, s) => n + s.steps.length, 0)}개
                    </span>
                  </div>
                </div>
                {run.report.scenarios.length > 0 && (
                  <VerifyScenarioDownloadButton report={run.report} />
                )}
              </div>
            </summary>
            <div className="border-t border-border/60 p-4">
              <VerifyReportView report={run.report} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
