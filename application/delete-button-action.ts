import { drizzleButtonActionRepository } from "@/adapters/repository/drizzle/button-action-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function deleteButtonAction(
  projectId: string,
  screenId: string,
  buttonActionId: string,
): Promise<void> {
  return withProjectAuth(projectId, async () => {
    await drizzleButtonActionRepository.delete(buttonActionId, screenId);
    await drizzleScreenRepository.setFuncDefSourceManual(screenId, projectId);
  });
}
