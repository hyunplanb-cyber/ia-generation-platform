import { notFound } from "next/navigation";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import {
  getPresetConfig,
  getPresetState,
  PRESET_GEN_COST,
  PRESET_DOWNLOAD_COST,
} from "@/application/preset";
import { ProjectNotFoundError } from "@/application/with-project-auth";
import { CREDITS_OPEN } from "@/lib/flags";
import { PresetForm } from "./preset-form";

export default async function PresetPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  try {
    const [proj, config, state] = await Promise.all([
      getProjectForEdit(projectId),
      getPresetConfig(projectId),
      getPresetState(projectId),
    ]);
    return (
      <PresetForm
        projectId={projectId}
        projectName={proj.concept || "프로젝트"}
        initial={config}
        creditsOpen={CREDITS_OPEN}
        genCost={PRESET_GEN_COST}
        downloadCost={PRESET_DOWNLOAD_COST}
        generated={state.generated}
        downloaded={state.downloaded}
      />
    );
  } catch (e) {
    if (e instanceof ProjectNotFoundError) notFound();
    throw e;
  }
}
