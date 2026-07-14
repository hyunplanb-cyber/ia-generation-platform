import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function listScreens(projectId: string) {
  return withProjectAuth(projectId, async (project) => ({
    project,
    screens: await drizzleScreenRepository.listByProject(projectId),
  }));
}
