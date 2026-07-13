import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function listMenus(projectId: string) {
  return withProjectAuth(projectId, () => drizzleMenuRepository.listByProject(projectId));
}
