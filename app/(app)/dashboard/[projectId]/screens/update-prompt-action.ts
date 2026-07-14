"use server";

import { revalidatePath } from "next/cache";
import { updateScreenFields } from "@/application/update-screen-fields";

export interface UpdatePromptState {
  error: string | null;
  value: string;
}

const REASON_MESSAGES: Record<string, string> = {
  "not-found": "화면을 찾을 수 없어요.",
  conflict: "다른 곳에서 먼저 저장됐어요. 새로고침 후 다시 시도해주세요.",
};

export async function updatePromptAction(
  projectId: string,
  screenId: string,
  _prevState: UpdatePromptState,
  formData: FormData,
): Promise<UpdatePromptState> {
  const prompt = String(formData.get("prompt") ?? "");
  const updatedAt = String(formData.get("updatedAt") ?? "");

  const result = await updateScreenFields(projectId, screenId, { prompt }, new Date(updatedAt));

  if (!result.ok) {
    return { error: REASON_MESSAGES[result.reason] ?? "저장하지 못했어요.", value: prompt };
  }

  revalidatePath(`/dashboard/${projectId}/screens`);
  return { error: null, value: result.screen.prompt ?? "" };
}
