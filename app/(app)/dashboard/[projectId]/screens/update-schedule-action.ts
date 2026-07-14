"use server";

import { revalidatePath } from "next/cache";
import { updateScreenFields } from "@/application/update-screen-fields";

export interface UpdateScheduleState {
  error: string | null;
  values: { scheduleStart: string; scheduleEnd: string };
}

const REASON_MESSAGES: Record<string, string> = {
  "not-found": "화면을 찾을 수 없어요.",
  conflict: "다른 곳에서 먼저 저장됐어요. 새로고침 후 다시 시도해주세요.",
  "invalid-range": "종료일은 시작일보다 빠를 수 없어요.",
};

export async function updateScheduleAction(
  projectId: string,
  screenId: string,
  _prevState: UpdateScheduleState,
  formData: FormData,
): Promise<UpdateScheduleState> {
  const scheduleStart = String(formData.get("scheduleStart") ?? "");
  const scheduleEnd = String(formData.get("scheduleEnd") ?? "");
  const updatedAt = String(formData.get("updatedAt") ?? "");
  const values = { scheduleStart, scheduleEnd };

  const result = await updateScreenFields(
    projectId,
    screenId,
    { scheduleStart, scheduleEnd },
    new Date(updatedAt),
  );

  if (!result.ok) {
    return { error: REASON_MESSAGES[result.reason] ?? "저장하지 못했어요.", values };
  }

  revalidatePath(`/dashboard/${projectId}/screens`);
  return {
    error: null,
    values: {
      scheduleStart: result.screen.scheduleStart ?? "",
      scheduleEnd: result.screen.scheduleEnd ?? "",
    },
  };
}
