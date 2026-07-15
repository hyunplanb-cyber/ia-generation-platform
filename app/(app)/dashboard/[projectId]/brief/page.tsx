import { notFound } from "next/navigation";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import { listMenus } from "@/application/list-menus";
import { ProjectNotFoundError } from "@/application/with-project-auth";
import { BriefForm } from "./brief-form";

export default async function BriefPage({
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

  const menus = await listMenus(projectId);
  const hasMenus = menus.length > 0;

  return <BriefForm project={project} hasMenus={hasMenus} />;
}
