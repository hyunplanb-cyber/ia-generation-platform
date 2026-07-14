"use server";

import { revalidatePath } from "next/cache";
import { generateScreenPrompt } from "@/application/generate-screen-prompt";

export interface GeneratePromptResult {
  ok: boolean;
  prompt: string | null;
  unavailable: boolean;
}

export async function generatePromptAction(
  projectId: string,
  screenId: string,
): Promise<GeneratePromptResult> {
  const result = await generateScreenPrompt(projectId, screenId);

  if (!result.ok) {
    return { ok: false, prompt: null, unavailable: result.reason === "unavailable" };
  }

  revalidatePath(`/dashboard/${projectId}/screens`);
  return { ok: true, prompt: result.screen.prompt, unavailable: false };
}
