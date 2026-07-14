"use server";

import { redirect } from "next/navigation";
import { generateScreens } from "@/application/generate-screens";

export async function generateScreensAction(projectId: string) {
  await generateScreens(projectId);
  redirect(`/dashboard/${projectId}/screens`);
}
