import Link from "next/link";
import { Plus, Sparkles, CalendarRange, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { countScreensByProject } from "@/application/count-screens-by-project";
import { listMyProjects } from "@/application/list-my-projects";
import { requireSession } from "@/application/require-session";
import { canDownload } from "@/application/get-current-plan";
import { DeleteProjectButton } from "./delete-project-button";
import { ZipAllButton } from "./zip-all-button";
import { UpgradeToDownload } from "./[projectId]/upgrade-to-download";
import { createDraftProjectAction } from "./actions";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
}

const BADGE_TONE: Record<string, string> = {
  mint: "bg-pastel-mint text-pastel-mint-foreground",
  lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
  yellow: "bg-pastel-yellow text-pastel-yellow-foreground",
};

// 생성 완료 시 내려받을 수 있는 산출물 파일들(실제 내보내기는 준비 중).
const DELIVERABLE_FILES = ["메뉴 구조", "IA·화면목록", "기능정의서", "FLOW·흐름도", "WBS", "AI 스펙팩"];

// 프로젝트가 지금 어느 단계인지 → 뱃지 + 클릭 시 이동할 "마지막 입력 단계".
function stepOf(concept: string, screenCount: number) {
  if (screenCount > 0)
    return { label: "생성 완료", href: "screens", tone: "mint", generated: true };
  if (concept.trim() !== "")
    return { label: "STEP 2 · 메뉴·디자인", href: "brief", tone: "lavender", generated: false };
  return { label: "STEP 1 · 컨셉 입력", href: "edit", tone: "yellow", generated: false };
}

export default async function DashboardPage() {
  const [session, projects, downloadable] = await Promise.all([
    requireSession(),
    listMyProjects(),
    canDownload(),
  ]);

  if (projects.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-6 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-soft text-primary-on-soft">
          <Sparkles className="size-8" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">첫 프로젝트를 시작해 볼까요?</h1>
          <p className="mt-2 text-muted-foreground">
            컨셉만 입력하면 AI가 메뉴 구조·화면 목록·기능정의서까지 자동으로 만들어드려요.
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

  const screenCounts = await countScreensByProject(projects.map((p) => p.id));
  // 최신순(최근 수정) 정렬
  const sorted = [...projects].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{session.user.name}님의 프로젝트</h1>
          <p className="mt-1 text-muted-foreground">진행 중인 프로젝트 {projects.length}개가 있어요.</p>
        </div>
        <form action={createDraftProjectAction}>
          <Button type="submit">
            <Plus className="size-4" />새 프로젝트 만들기
          </Button>
        </form>
      </div>

      <ul className="flex flex-col gap-3">
        {sorted.map((p) => {
          const count = screenCounts[p.id] ?? 0;
          const step = stepOf(p.concept, count);
          return (
            <li
              key={p.id}
              className="group relative rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              {/* 카드 전체 클릭 → 마지막 입력 단계로 이동 */}
              <Link
                href={`/dashboard/${p.id}/${step.href}`}
                aria-label={`${p.concept || "새 프로젝트"} 열기`}
                className="absolute inset-0 z-10 rounded-2xl"
              />

              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONE[step.tone]}`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <h3 className="line-clamp-1 text-base font-bold text-foreground">
                    {p.concept || "새 프로젝트 (작성 중)"}
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

                  {/* 생성 완료 프로젝트: 포함 산출물 + 전체 다운로드(zip) */}
                  {step.generated && (
                    <div className="relative z-20 mt-1 flex flex-wrap items-center gap-1.5">
                      {DELIVERABLE_FILES.map((file) => (
                        <span
                          key={file}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {file}
                        </span>
                      ))}
                      {downloadable ? (
                        <ZipAllButton projectId={p.id} />
                      ) : (
                        <UpgradeToDownload label="전체 다운로드" />
                      )}
                    </div>
                  )}
                </div>

                {/* 삭제(아이콘) — 카드 링크 위로 올려 독립 클릭 */}
                <div className="relative z-20 shrink-0">
                  <DeleteProjectButton projectId={p.id} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
