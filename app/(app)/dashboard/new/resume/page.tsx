import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FilePlus2, Sparkles } from "lucide-react";
import { listUnfinishedProjects } from "@/application/list-unfinished-projects";
import { DeleteProjectButton } from "../../delete-project-button";

// "AI팩 만들기"를 누를 때마다 빈 프로젝트가 생겨 목록이 껍데기로 지저분해졌다.
// 만들다 만 게 있으면 새로 만들기 전에 여기서 먼저 물어본다(2026-08-03).

const fmt = (d: Date) =>
  `${d.getFullYear() % 100}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

/** 어디까지 갔는지 — 컨셉과 메뉴 초안이 채워졌는지로 판단한다. */
function stepOf(p: { concept: string; menuDraft: string | null }) {
  if (!p.concept.trim()) return { label: "컨셉을 아직 안 적었어요", step: "STEP 1" };
  if (!p.menuDraft?.trim()) return { label: "컨셉까지 적었어요", step: "STEP 2" };
  return { label: "메뉴까지 적었어요 — 생성만 남았어요", step: "STEP 2" };
}

export default async function ResumePage() {
  const drafts = await listUnfinishedProjects();
  // 만들다 만 게 없으면 물어볼 것도 없다. 바로 새로 만든다.
  if (drafts.length === 0) redirect("/dashboard/new?start=1");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
          <Sparkles className="size-5" />
        </span>
        <h1 className="text-2xl font-bold text-foreground">만들다 만 AI팩이 있어요</h1>
        <p className="leading-relaxed text-muted-foreground">
          이어서 하시겠어요? 새로 시작하시면 빈 프로젝트가 하나 더 생겨요.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {/* 링크 안에 폼(삭제)을 넣을 수 없어, 링크와 삭제 버튼을 나란히 둔다. */}
        {drafts.map((p) => {
          const s = stepOf(p);
          return (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-background pr-3 transition-colors hover:border-primary/40"
            >
              <Link
                href={`/dashboard/${p.id}/${p.concept.trim() ? "brief" : "edit"}`}
                className="group flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {p.concept.trim() || "제목 없는 AI팩"}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {fmt(p.updatedAt)} · {s.label}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {s.step}
                </span>
                <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
              {/* 안 쓸 초안은 여기서 바로 지운다 — 안 그러면 껍데기가 계속 쌓인다 */}
              <DeleteProjectButton projectId={p.id} />
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <Link
          href="/dashboard/new?start=1"
          prefetch={false}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary bg-background px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <FilePlus2 className="size-4" />새 AI팩 시작하기
        </Link>
        <Link
          href="/dashboard"
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          내 프로젝트로 돌아가기
        </Link>
      </div>
    </div>
  );
}
