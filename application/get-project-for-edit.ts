import type { Project } from "@/domain/project/project";
import { withProjectAuth } from "@/application/with-project-auth";

export async function getProjectForEdit(projectId: string): Promise<Project> {
  return withProjectAuth(projectId, async (project) => project);
}
