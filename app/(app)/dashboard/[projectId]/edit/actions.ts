"use server";

import { redirect } from "next/navigation";
import { updateProject } from "@/application/update-project";

export interface UpdateProjectState {
  error: string | null;
}

export async function updateProjectAction(
  projectId: string,
  _prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const concept = String(formData.get("concept") ?? "").trim();
  const menuDraft = String(formData.get("menuDraft") ?? "").trim();
  const designConcept = String(formData.get("designConcept") ?? "").trim();
  const overallStart = String(formData.get("overallStart") ?? "");
  const overallEnd = String(formData.get("overallEnd") ?? "");

  if (!concept) {
    return { error: "컨셉/설명을 입력해 주세요." };
  }
  if (!overallStart || !overallEnd) {
    return { error: "전체 시작일과 종료일을 입력해 주세요." };
  }
  if (overallEnd < overallStart) {
    return { error: "종료일은 시작일보다 빠를 수 없어요." };
  }

  await updateProject(projectId, {
    concept,
    menuDraft: menuDraft || null,
    designConcept: designConcept || null,
    overallStart,
    overallEnd,
  });
  redirect("/dashboard");
}
