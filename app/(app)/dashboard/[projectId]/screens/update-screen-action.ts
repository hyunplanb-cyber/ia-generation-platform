"use server";

import { revalidatePath } from "next/cache";
import { updateScreenFields } from "@/application/update-screen-fields";

export interface UpdateScreenState {
  error: string | null;
  editing: boolean;
  values: { pageId: string; pageName: string };
}

const REASON_MESSAGES: Record<string, string> = {
  "not-found": "화면을 찾을 수 없어요.",
  empty: "페이지ID를 입력해 주세요.",
  duplicate: "이미 사용 중인 페이지ID예요.",
  conflict: "다른 곳에서 먼저 저장됐어요. 새로고침 후 다시 시도해주세요.",
};

export async function updateScreenAction(
  projectId: string,
  screenId: string,
  _prevState: UpdateScreenState,
  formData: FormData,
): Promise<UpdateScreenState> {
  const pageId = String(formData.get("pageId") ?? "").trim();
  const pageName = String(formData.get("pageName") ?? "").trim();
  const updatedAt = String(formData.get("updatedAt") ?? "");
  const values = { pageId, pageName };

  if (!pageName) {
    return { error: "페이지명을 입력해 주세요.", editing: true, values };
  }

  const result = await updateScreenFields(
    projectId,
    screenId,
    { pageId, pageName },
    new Date(updatedAt),
  );

  if (!result.ok) {
    return { error: REASON_MESSAGES[result.reason], editing: true, values };
  }

  revalidatePath(`/dashboard/${projectId}/screens`);
  return { error: null, editing: false, values };
}
