"use server";

import { revalidatePath } from "next/cache";
import { MAX_FUNC_DEF_LENGTH } from "@/domain/screen/func-def-limit";
import { updateScreenFields } from "@/application/update-screen-fields";

export interface UpdateFuncDefState {
  error: string | null;
  value: string;
}

const REASON_MESSAGES: Record<string, string> = {
  "not-found": "화면을 찾을 수 없어요.",
  conflict: "다른 곳에서 먼저 저장됐어요. 새로고침 후 다시 시도해주세요.",
  "too-long": `기능정의는 최대 ${MAX_FUNC_DEF_LENGTH}자까지 입력할 수 있어요.`,
};

export async function updateFuncDefAction(
  projectId: string,
  screenId: string,
  _prevState: UpdateFuncDefState,
  formData: FormData,
): Promise<UpdateFuncDefState> {
  const funcDef = String(formData.get("funcDef") ?? "");
  const updatedAt = String(formData.get("updatedAt") ?? "");

  const result = await updateScreenFields(projectId, screenId, { funcDef }, new Date(updatedAt));

  if (!result.ok) {
    return { error: REASON_MESSAGES[result.reason] ?? "저장하지 못했어요.", value: funcDef };
  }

  revalidatePath(`/dashboard/${projectId}/screens`);
  return { error: null, value: result.screen.funcDef ?? "" };
}
