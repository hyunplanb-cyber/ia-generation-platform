import { notFound } from "next/navigation";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import { countScreensByProject } from "@/application/count-screens-by-project";
import { ProjectNotFoundError } from "@/application/with-project-auth";
import { EditProjectForm } from "./edit-project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await getProjectForEdit(projectId).catch((error) => {
    if (error instanceof ProjectNotFoundError) {
      notFound();
    }
    throw error;
  });

  const counts = await countScreensByProject([projectId]);
  const hasScreens = (counts[projectId] ?? 0) > 0;

  return <EditProjectForm project={project} hasScreens={hasScreens} />;
}
