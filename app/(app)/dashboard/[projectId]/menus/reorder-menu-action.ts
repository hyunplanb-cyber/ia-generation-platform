"use server";

import { revalidatePath } from "next/cache";
import { reorderMenu, type ReorderDirection } from "@/application/reorder-menu";

export async function reorderMenuAction(projectId: string, menuId: string, direction: ReorderDirection) {
  await reorderMenu(projectId, menuId, direction);
  revalidatePath(`/dashboard/${projectId}/menus`);
}
