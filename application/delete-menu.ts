import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function deleteMenu(projectId: string, menuId: string) {
  return withProjectAuth(projectId, async () => {
    await drizzleScreenRepository.quarantineByMenu(projectId, menuId);
    await drizzleMenuRepository.delete(projectId, menuId);
  });
}
