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

  // 두 조회를 병렬로 — Neon HTTP 왕복을 순차가 아닌 동시에 처리해 지연을 줄인다.
  const [project, menus] = await Promise.all([
    getProjectForEdit(projectId).catch((error) => {
      if (error instanceof ProjectNotFoundError) {
        notFound();
      }
      throw error;
    }),
    listMenus(projectId),
  ]);
  const hasMenus = menus.length > 0;

  return <BriefForm project={project} hasMenus={hasMenus} />;
}
