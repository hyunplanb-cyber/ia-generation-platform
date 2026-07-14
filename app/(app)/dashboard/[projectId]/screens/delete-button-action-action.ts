"use server";

import { revalidatePath } from "next/cache";
import { deleteButtonAction } from "@/application/delete-button-action";

export async function deleteButtonActionAction(
  projectId: string,
  screenId: string,
  buttonActionId: string,
) {
  await deleteButtonAction(projectId, screenId, buttonActionId);
  revalidatePath(`/dashboard/${projectId}/screens`);
}
