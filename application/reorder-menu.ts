import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export type ReorderDirection = "up" | "down";

export async function reorderMenu(projectId: string, menuId: string, direction: ReorderDirection) {
  return withProjectAuth(projectId, async () => {
    const menus = await drizzleMenuRepository.listByProject(projectId);
    const index = menus.findIndex((m) => m.id === menuId);
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= menus.length) return;

    const current = menus[index];
    const target = menus[targetIndex];
    await drizzleMenuRepository.updateSortOrder(projectId, current.id, target.sortOrder);
    await drizzleMenuRepository.updateSortOrder(projectId, target.id, current.sortOrder);
  });
}
