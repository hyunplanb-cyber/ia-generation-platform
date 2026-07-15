"use server";

import { revalidatePath } from "next/cache";
import { generateIa, type GenerateIaResult } from "@/application/generate-ia";

export async function generateIaAction(projectId: string): Promise<GenerateIaResult> {
  const result = await generateIa(projectId);
  if (result.ok) {
    revalidatePath(`/dashboard/${projectId}/menus`);
    revalidatePath(`/dashboard/${projectId}/screens`);
  }
  return result;
}
