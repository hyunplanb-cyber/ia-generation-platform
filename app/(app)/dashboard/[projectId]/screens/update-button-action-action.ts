"use server";

import { revalidatePath } from "next/cache";
import { updateButtonAction } from "@/application/update-button-action";

export async function updateButtonActionAction(
  projectId: string,
  screenId: string,
  buttonActionId: string,
  formData: FormData,
) {
  const targetScreenId = String(formData.get("targetScreenId") ?? "");
  await updateButtonAction(projectId, screenId, buttonActionId, { targetScreenId });
  revalidatePath(`/dashboard/${projectId}/screens`);
}
