"use server";

import { redirect } from "next/navigation";
import { deleteProject } from "@/application/delete-project";
import { createProject } from "@/application/create-project";

export async function deleteProjectAction(projectId: string) {
  await deleteProject(projectId);
  redirect("/dashboard");
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// 별도의 "새 프로젝트" 위저드 없이, 빈 프로젝트를 만들고 곧바로 STEP 1(컨셉 입력)로 보낸다.
// 컨셉 등 실제 입력은 STEP 1에서 받고, 일정은 기본값(오늘~+30일)으로 채워둔다.
export async function createDraftProjectAction() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 30);

  const project = await createProject({
    concept: "",
    menuDraft: null,
    designConcept: null,
    overallStart: toDateStr(today),
    overallEnd: toDateStr(end),
  });

  redirect(`/dashboard/${project.id}/edit`);
}
