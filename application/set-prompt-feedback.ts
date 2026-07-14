import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import type { PromptFeedback } from "@/domain/screen/screen";
import { withProjectAuth } from "@/application/with-project-auth";

export async function setPromptFeedback(
  projectId: string,
  screenId: string,
  feedback: PromptFeedback,
) {
  return withProjectAuth(projectId, () =>
    drizzleScreenRepository.setPromptFeedback(screenId, projectId, feedback),
  );
}
