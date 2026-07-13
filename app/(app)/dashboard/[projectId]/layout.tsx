import { notFound } from "next/navigation";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import { ProjectNotFoundError } from "@/application/with-project-auth";
import { ProjectSubNav } from "./project-sub-nav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  await getProjectForEdit(projectId).catch((error) => {
    if (error instanceof ProjectNotFoundError) {
      notFound();
    }
    throw error;
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 sm:flex-row sm:gap-10">
      <ProjectSubNav projectId={projectId} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
