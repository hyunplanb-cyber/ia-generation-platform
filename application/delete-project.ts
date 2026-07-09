import { drizzleProjectRepository } from "@/adapters/repository/drizzle/project-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function deleteProject(projectId: string) {
  return withProjectAuth(projectId, () => drizzleProjectRepository.delete(projectId));
}
