"use server";

import { redirect } from "next/navigation";
import { deleteProject } from "@/application/delete-project";

export async function deleteProjectAction(projectId: string) {
  await deleteProject(projectId);
  redirect("/dashboard");
}
