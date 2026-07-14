"use server";

import { revalidatePath } from "next/cache";
import { setPromptFeedback } from "@/application/set-prompt-feedback";
import type { PromptFeedback } from "@/domain/screen/screen";

export async function setPromptFeedbackAction(
  projectId: string,
  screenId: string,
  feedback: PromptFeedback,
) {
  await setPromptFeedback(projectId, screenId, feedback);
  revalidatePath(`/dashboard/${projectId}/screens`);
}
