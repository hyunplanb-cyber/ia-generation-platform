import { drizzleButtonActionRepository } from "@/adapters/repository/drizzle/button-action-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function getProjectScreensDetail(projectId: string) {
  return withProjectAuth(projectId, async (project) => {
    const [screens, buttonActions] = await Promise.all([
      drizzleScreenRepository.listByProject(projectId),
      drizzleButtonActionRepository.listByProject(projectId),
    ]);
    return { project, screens, buttonActions };
  });
}
