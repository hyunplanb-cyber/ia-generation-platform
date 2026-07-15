"use server";

import { revalidatePath } from "next/cache";
import { updateProject } from "@/application/update-project";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import { recalculateSchedule } from "@/application/recalculate-schedule";
import type { DeviceMode } from "@/domain/project/project";

export interface UpdateProjectState {
  error: string | null;
  saved: boolean;
}

const DEVICE_MODES: DeviceMode[] = ["responsive", "pc", "mobile"];

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
  const deviceModeRaw = String(formData.get("deviceMode") ?? "");
  const deviceMode: DeviceMode = DEVICE_MODES.includes(deviceModeRaw as DeviceMode)
    ? (deviceModeRaw as DeviceMode)
    : "responsive";

  if (!concept) {
    return { error: "컨셉/설명을 입력해 주세요.", saved: false };
  }
  if (!overallStart || !overallEnd) {
    return { error: "전체 시작일과 종료일을 입력해 주세요.", saved: false };
  }
  if (overallEnd < overallStart) {
    return { error: "종료일은 시작일보다 빠를 수 없어요.", saved: false };
  }

  const before = await getProjectForEdit(projectId);

  await updateProject(projectId, {
    concept,
    menuDraft: menuDraft || null,
    designConcept: designConcept || null,
    overallStart,
    overallEnd,
    deviceMode,
  });

  if (before.overallStart !== overallStart || before.overallEnd !== overallEnd) {
    await recalculateSchedule(projectId, overallStart, overallEnd);
  }

  revalidatePath(`/dashboard/${projectId}/edit`);
  revalidatePath(`/dashboard/${projectId}/brief`);
  revalidatePath(`/dashboard/${projectId}/screens`);
  return { error: null, saved: true };
}
