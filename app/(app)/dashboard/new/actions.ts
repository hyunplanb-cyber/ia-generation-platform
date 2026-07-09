"use server";

import { redirect } from "next/navigation";
import { createProject } from "@/application/create-project";

export interface CreateProjectState {
  error: string | null;
}

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const concept = String(formData.get("concept") ?? "").trim();
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

  await createProject({ concept, overallStart, overallEnd });
  redirect("/dashboard");
}
