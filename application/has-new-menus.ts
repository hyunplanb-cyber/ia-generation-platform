import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";

export async function hasNewMenus(projectId: string): Promise<boolean> {
  const [menus, screens] = await Promise.all([
    drizzleMenuRepository.listByProject(projectId),
    drizzleScreenRepository.listByProject(projectId),
  ]);

  const menuIdsWithScreens = new Set(
    screens.filter((screen) => screen.status !== "quarantined").map((screen) => screen.menuId),
  );

  return menus.some((menu) => !menuIdsWithScreens.has(menu.id));
}
