import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function deleteMenu(projectId: string, menuId: string) {
  return withProjectAuth(projectId, () => drizzleMenuRepository.delete(projectId, menuId));
}
