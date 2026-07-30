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
import { getProjectQuota } from "@/application/can-create-project";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { ZipAllButton } from "./zip-all-button";
import { CREDITS_OPEN } from "@/lib/flags";
import { isDownloadUnlocked, isVerifyDownloadUnlocked } from "@/application/download";
import { downloadCost, CREDIT_COST } from "@/lib/credits";
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
  const [{ limit, tab }, session, projects] = await Promise.all([
    searchParams,
    requireSession(),
    listMyProjects(),
  ]);
  const activeTab = tab === "verify" ? "verify" : "planning";
  const quota = await getProjectQuota(projects.length);
  const hitLimit = limit === "reached" || !quota.allowed;

  let body: React.ReactNode;
  if (activeTab === "verify") {
    const runs = await listMyVerifyRuns();
    const verifyUnlocks = Object.fromEntries(
      await Promise.all(runs.map(async (r) => [r.id, await isVerifyDownloadUnlocked(r.id)] as const)),
    );
    body = <VerifyTab runs={runs} verifyUnlocks={verifyUnlocks} creditsOpen={CREDITS_OPEN} />;
  } else {
    const screenCounts = await countScreensByProject(projects.map((p) => p.id));
    // 생성 완료(화면이 생긴)된 것만 목록에 노출한다. 작성 중(초안)은 감춘다.
    const completed = projects
      .filter((p) => (screenCounts[p.id] ?? 0) > 0)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const results = await listProjectResults(completed.map((p) => p.id));
    // 각 프로젝트의 다운로드 잠금 해제 여부(전체 다운로드 게이팅용).
    const unlocks = Object.fromEntries(
      await Promise.all(
        completed.map(async (p) => [p.id, await isDownloadUnlocked(p.id)] as const),
      ),
    );
    body = (
      <PlanningTab
        completed={completed}
        results={results}
        unlocks={unlocks}
        screenCounts={screenCounts}
        draftCount={projects.length - completed.length}
        hitLimit={hitLimit}
        quotaLimit={quota.limit}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">{session.user.name}님의 프로젝트</h1>
        <p className="text-muted-foreground">생성된 프로젝트입니다.</p>
      </div>

      {/* 무료 베타 안내 — 무료 크레딧으로 생성·미리보기, 그 외(다운로드·충전)는 준비중 */}
      {!CREDITS_OPEN && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary-soft/20 px-4 py-3 text-sm">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="leading-relaxed text-foreground">
            <b className="font-semibold">지금은 무료 베타예요.</b> 무료 크레딧으로 생성·미리보기는 지금 이용하실 수
            있어요. <span className="text-muted-foreground">파일 다운로드 등 그 외 사용은 준비 중입니다.</span>
          </p>
        </div>
      )}

      <DashboardTabs active={activeTab} />
      {body}
    </div>
  );
}

// ── 설계도 프롬프트 탭 ──────────────────────────────
function PlanningTab({
  completed,
  results,
  unlocks,
  screenCounts,
  draftCount,
  hitLimit,
  quotaLimit,
}: {
  completed: Awaited<ReturnType<typeof listMyProjects>>;
  results: Record<string, ProjectResult>;
  unlocks: Record<string, boolean>;
  screenCounts: Record<string, number>;
  draftCount: number;
  hitLimit: boolean;
  quotaLimit: number | null;
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
        <p className="text-sm text-muted-foreground">생성 완료 {completed.length}건</p>
        {newButton}
      </div>

      {hitLimit && (
        <p className="rounded-xl border border-border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
          무료 플랜에서는 프로젝트를 <b className="font-semibold text-foreground">{quotaLimit}개</b>까지
          만들 수 있어요. 새로 만들려면 기존 프로젝트를 지우거나, 정식 오픈까지 기다려 주세요.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {completed.map((p) => {
          const count = screenCounts[p.id] ?? 0;
          const result = results[p.id];
          const cost = downloadCost(!!result && result.screens.some((s) => s.screenGroup));
          const canAddPreset = !!result?.presetConfig && !result?.presetDownloaded;
          const canAddVerify = !!result?.latestVerifyReport && !result?.verifyDownloaded;
          const zipAddonProps = {
            presetConfig: result?.presetConfig ?? null,
            designConcept: result?.designConcept ?? null,
            canAddPreset,
            presetCost: CREDIT_COST.optionPreset,
            verifyReport: result?.latestVerifyReport ?? null,
            verifyRunId: result?.latestVerifyRunId ?? null,
            canAddVerify,
            verifyCost: CREDIT_COST.downloadVerify,
          };
          return (
            <details
              key={p.id}
              className="group rounded-2xl border border-border bg-surface shadow-sm"
            >
              <summary className="cursor-pointer list-none p-5 [&::-webkit-details-marker]:hidden">
                <div className="flex items-start justify-between gap-4">
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
                    {/* 데스크톱: 오른쪽에 다운로드 */}
                    <span className="hidden sm:block">
                      <ZipAllButton
                        projectId={p.id}
                        large
                        credits={cost}
                        unlocked={unlocks[p.id]}
                        creditsOpen={CREDITS_OPEN}
                        {...zipAddonProps}
                      />
                    </span>
                    <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
                  </div>
                </div>
                {/* 모바일: 다운로드 버튼을 카드 하단에 */}
                <div className="mt-4 sm:hidden">
                  <ZipAllButton
                    projectId={p.id}
                    large
                    credits={cost}
                    unlocked={unlocks[p.id]}
                    creditsOpen={CREDITS_OPEN}
                    {...zipAddonProps}
                  />
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
function VerifyTab({
  runs,
  verifyUnlocks,
  creditsOpen,
}: {
  runs: Awaited<ReturnType<typeof listMyVerifyRuns>>;
  verifyUnlocks: Record<string, boolean>;
  creditsOpen: boolean;
}) {
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
          <details key={run.id} className="group rounded-xl border border-border bg-surface">
            <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
              <div className="flex items-start justify-between gap-3">
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
                <div className="flex shrink-0 items-center gap-3">
                  {/* 데스크톱: 오른쪽에 다운로드 */}
                  {run.report.scenarios.length > 0 && (
                    <span className="hidden sm:block">
                      <VerifyScenarioDownloadButton report={run.report} verifyRunId={run.id} credits={CREDIT_COST.downloadVerify} unlocked={verifyUnlocks[run.id]} creditsOpen={creditsOpen} />
                    </span>
                  )}
                  <ChevronDown className="size-5 text-muted-foreground transition-transform group-open:rotate-180" />
                </div>
              </div>
              {/* 모바일: 다운로드를 카드 하단에 */}
              {run.report.scenarios.length > 0 && (
                <div className="mt-3 sm:hidden">
                  <VerifyScenarioDownloadButton report={run.report} verifyRunId={run.id} credits={CREDIT_COST.downloadVerify} unlocked={verifyUnlocks[run.id]} creditsOpen={creditsOpen} />
                </div>
              )}
            </summary>
            <div className="border-t border-border/60 p-4">
              <VerifyReportView report={run.report} preview />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
