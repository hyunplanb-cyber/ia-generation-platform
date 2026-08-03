import { notFound } from "next/navigation";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import { countScreensByProject } from "@/application/count-screens-by-project";
import { listUnfinishedProjects } from "@/application/list-unfinished-projects";
import { ProjectNotFoundError } from "@/application/with-project-auth";
import { ConceptForm } from "./concept-form";
import { DraftPicker, type Draft } from "./draft-picker";

const fmt = (d: Date) =>
  `${d.getFullYear() % 100}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;

/** 어디까지 갔는지 — 컨셉과 메뉴 초안이 채워졌는지로 본다. */
function stepOf(concept: string, menuDraft: string | null) {
  if (!concept.trim()) return { label: "컨셉을 아직 안 적었어요", step: "STEP 1", next: "edit" };
  if (!menuDraft?.trim()) return { label: "컨셉까지 적었어요", step: "STEP 2", next: "brief" };
  return { label: "메뉴까지 적었어요 · 생성만 남았어요", step: "STEP 2", next: "brief" };
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await getProjectForEdit(projectId).catch((error) => {
    if (error instanceof ProjectNotFoundError) {
      notFound();
    }
    throw error;
  });

  const counts = await countScreensByProject([projectId]);
  const hasScreens = (counts[projectId] ?? 0) > 0;

  // 만들다 만 게 있으면 이어서 갈 수 있게 목록을 넘긴다(지금 보고 있는 건 뺀다).
  // 이미 산출물을 만든 프로젝트라면 새로 시작하는 자리가 아니므로 묻지 않는다.
  const drafts: Draft[] = hasScreens
    ? []
    : (await listUnfinishedProjects(projectId)).map((p) => {
        const s = stepOf(p.concept, p.menuDraft);
        return {
          id: p.id,
          concept: p.concept.trim(),
          label: s.label,
          step: s.step,
          date: fmt(p.updatedAt),
          href: `/dashboard/${p.id}/${s.next}`,
        };
      });

  return <ConceptForm project={project} hasScreens={hasScreens} aside={<DraftPicker drafts={drafts} />} />;
}
