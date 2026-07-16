"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProject } from "@/application/update-project";
import { recalculateSchedule } from "@/application/recalculate-schedule";
import type { DeviceMode } from "@/domain/project/project";

export interface UpdateProjectState {
  error: string | null;
  saved: boolean;
}

const DEVICE_MODES: DeviceMode[] = ["responsive", "pc", "mobile"];

// 공통 저장 로직 — 검증 → 업데이트 → (일정 변경 시) 재계산 → 캐시 무효화.
async function saveProject(
  projectId: string,
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  const concept = String(formData.get("concept") ?? "").trim();
  const menuDraft = String(formData.get("menuDraft") ?? "").trim();
  const designConcept = String(formData.get("designConcept") ?? "").trim();
  const overallStart = String(formData.get("overallStart") ?? "");
  const overallEnd = String(formData.get("overallEnd") ?? "");
  const deviceModeRaw = String(formData.get("deviceMode") ?? "");
  const deviceMode: DeviceMode = DEVICE_MODES.includes(deviceModeRaw as DeviceMode)
    ? (deviceModeRaw as DeviceMode)
    : "responsive";

  if (!concept) return { error: "컨셉/설명을 입력해 주세요." };
  if (!overallStart || !overallEnd) return { error: "전체 시작일과 종료일을 입력해 주세요." };
  if (overallEnd < overallStart) return { error: "종료일은 시작일보다 빠를 수 없어요." };

  await updateProject(projectId, {
    concept,
    menuDraft: menuDraft || null,
    designConcept: designConcept || null,
    overallStart,
    overallEnd,
    deviceMode,
  });

  // 일정 변경 여부는 폼이 함께 보낸 원래 값(origStart/origEnd)으로 판단해,
  // 저장 때마다 프로젝트를 다시 읽는 추가 DB 왕복을 없앤다.
  const origStart = String(formData.get("origStart") ?? "");
  const origEnd = String(formData.get("origEnd") ?? "");
  if (origStart && origEnd && (origStart !== overallStart || origEnd !== overallEnd)) {
    await recalculateSchedule(projectId, overallStart, overallEnd);
  }

  revalidatePath(`/dashboard/${projectId}/edit`);
  revalidatePath(`/dashboard/${projectId}/brief`);
  revalidatePath(`/dashboard/${projectId}/screens`);
  return { ok: true };
}

// 브리프(STEP 2) 등에서 사용 — 저장만 하고 그 자리에 머무른다.
export async function updateProjectAction(
  projectId: string,
  _prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const result = await saveProject(projectId, formData);
  if ("error" in result) return { error: result.error, saved: false };
  return { error: null, saved: true };
}

// 컨셉 입력(STEP 1) — 저장 후 서버에서 바로 STEP 2로 리다이렉트(왕복 1회).
export async function saveConceptAndContinueAction(
  projectId: string,
  _prevState: UpdateProjectState,
  formData: FormData,
): Promise<UpdateProjectState> {
  const result = await saveProject(projectId, formData);
  if ("error" in result) return { error: result.error, saved: false };
  redirect(`/dashboard/${projectId}/brief`);
}
