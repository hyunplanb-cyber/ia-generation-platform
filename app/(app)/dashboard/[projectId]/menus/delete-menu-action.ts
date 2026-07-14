"use server";

import { revalidatePath } from "next/cache";
import { deleteMenu } from "@/application/delete-menu";

export async function deleteMenuAction(projectId: string, menuId: string) {
  await deleteMenu(projectId, menuId);
  revalidatePath(`/dashboard/${projectId}/menus`);
}
