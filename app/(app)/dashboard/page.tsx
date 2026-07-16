import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { countScreensByProject } from "@/application/count-screens-by-project";
import { listMyProjects } from "@/application/list-my-projects";
import { requireSession } from "@/application/require-session";
import { DeleteProjectButton } from "./delete-project-button";
import { createDraftProjectAction } from "./actions";

const CARD_WASH_CLASSES = ["bg-pastel-mint", "bg-pastel-lavender", "bg-pastel-yellow"];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(date);
}

export default async function DashboardPage() {
  const [session, projects] = await Promise.all([requireSession(), listMyProjects()]);

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <div
            key={p.id}
            className={`flex flex-col gap-3 rounded-2xl p-6 shadow-sm transition-transform hover:-translate-y-1 ${CARD_WASH_CLASSES[i % CARD_WASH_CLASSES.length]}`}
          >
            <p className="line-clamp-2 font-semibold text-foreground">{p.concept}</p>
            <p className="text-sm text-foreground/80">
              {p.overallStart} ~ {p.overallEnd}
            </p>
            <p className="text-sm text-foreground/80">화면 {screenCounts[p.id] ?? 0}개</p>
            <p className="text-xs text-foreground/60">최근 수정: {formatDate(p.updatedAt)}</p>
            <div className="mt-2 flex items-center gap-2">
              <Link
                href={`/dashboard/${p.id}/menus`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                메뉴 관리
              </Link>
              <Link
                href={`/dashboard/${p.id}/edit`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                수정
              </Link>
              <DeleteProjectButton projectId={p.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
