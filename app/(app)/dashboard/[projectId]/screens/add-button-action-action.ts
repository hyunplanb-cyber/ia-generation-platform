"use server";

import { revalidatePath } from "next/cache";
import { addButtonAction } from "@/application/add-button-action";

export interface AddButtonActionState {
  error: string | null;
  values: { label: string; targetScreenId: string };
}

const REASON_MESSAGES: Record<string, string> = {
  "screen-not-found": "화면을 찾을 수 없어요.",
  "target-not-found": "이동 대상 화면을 찾을 수 없어요.",
  "empty-label": "버튼 설명을 입력해 주세요.",
};

export async function addButtonActionAction(
  projectId: string,
  screenId: string,
  _prevState: AddButtonActionState,
  formData: FormData,
): Promise<AddButtonActionState> {
  const label = String(formData.get("label") ?? "").trim();
  const targetScreenId = String(formData.get("targetScreenId") ?? "");
  const values = { label, targetScreenId };

  if (!targetScreenId) {
    return { error: "이동 대상을 선택해 주세요.", values };
  }

  const result = await addButtonAction(projectId, { screenId, label, targetScreenId });

  if (!result.ok) {
    return { error: REASON_MESSAGES[result.reason], values };
  }

  revalidatePath(`/dashboard/${projectId}/screens`);
  return { error: null, values: { label: "", targetScreenId: "" } };
}
