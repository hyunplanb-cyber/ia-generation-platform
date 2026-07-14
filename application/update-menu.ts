import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import type { UpdateMenuInput } from "@/domain/ports/menu-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export class MenuNotFoundError extends Error {
  constructor() {
    super("MENU_NOT_FOUND");
  }
}

export async function updateMenu(projectId: string, menuId: string, input: UpdateMenuInput) {
  return withProjectAuth(projectId, async () => {
    const menu = await drizzleMenuRepository.update(projectId, menuId, input);
    if (!menu) {
      throw new MenuNotFoundError();
    }
    return menu;
  });
}
