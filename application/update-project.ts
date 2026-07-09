import { drizzleProjectRepository } from "@/adapters/repository/drizzle/project-repository";
import type { UpdateProjectInput } from "@/domain/ports/project-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function updateProject(projectId: string, input: UpdateProjectInput) {
  return withProjectAuth(projectId, () => drizzleProjectRepository.update(projectId, input));
}
