"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProject } from "@/application/update-project";
import { generateIa } from "@/application/generate-ia";
import type { DeviceMode } from "@/domain/project/project";

export interface GenerateState {
  reason: string | null;
}

const DEVICE_MODES: DeviceMode[] = ["responsive", "pc", "mobile"];

// STEP 2 — 입력값(메뉴·디자인)을 저장하고 곧바로 산출물을 생성한다.
// 별도 "저장" 버튼 없이, 생성 버튼 하나로 저장+생성을 처리한다.
export async function saveBriefAndGenerateAction(
  projectId: string,
  _prevState: GenerateState,
  formData: FormData,
): Promise<GenerateState> {
  const concept = String(formData.get("concept") ?? "").trim();
  const menuDraft = String(formData.get("menuDraft") ?? "").trim();
  const designConcept = String(formData.get("designConcept") ?? "").trim();
  const overallStart = String(formData.get("overallStart") ?? "");
  const overallEnd = String(formData.get("overallEnd") ?? "");
  const deviceModeRaw = String(formData.get("deviceMode") ?? "");
  const deviceMode: DeviceMode = DEVICE_MODES.includes(deviceModeRaw as DeviceMode)
    ? (deviceModeRaw as DeviceMode)
    : "responsive";
  // 상세 IA(3뎁스: 화면→상태·탭) 여부. 체크박스 on일 때 화면을 100개+로 촘촘히.
  const detail = formData.get("detail") === "on";

  await updateProject(projectId, {
    concept,
    menuDraft: menuDraft || null,
    designConcept: designConcept || null,
    overallStart,
    overallEnd,
    deviceMode,
  });

  const result = await generateIa(projectId, detail);
  if (result.ok) {
    revalidatePath(`/dashboard/${projectId}/menus`);
    revalidatePath(`/dashboard/${projectId}/screens`);
    redirect(`/dashboard/${projectId}/screens`);
  }
  return { reason: result.reason };
}
