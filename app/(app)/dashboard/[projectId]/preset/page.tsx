import { notFound } from "next/navigation";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import { getPresetConfig } from "@/application/preset";
import { ProjectNotFoundError } from "@/application/with-project-auth";
import { PresetForm } from "./preset-form";

export default async function PresetPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  try {
    const [proj, config] = await Promise.all([
      getProjectForEdit(projectId),
      getPresetConfig(projectId),
    ]);
    return (
      <PresetForm
        projectId={projectId}
        projectName={proj.concept || "프로젝트"}
        initial={config}
      />
    );
  } catch (e) {
    if (e instanceof ProjectNotFoundError) notFound();
    throw e;
  }
}
