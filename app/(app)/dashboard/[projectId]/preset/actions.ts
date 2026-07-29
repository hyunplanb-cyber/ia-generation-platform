"use server";

import { revalidatePath } from "next/cache";
import { savePresetConfig, type PresetSaveResult } from "@/application/preset";
import type { PresetConfig } from "@/lib/design-presets";

// 상세 프리셋 설정을 저장한다. 첫 생성 때만 4크레딧 차감(이후 수정은 무료).
export async function savePresetConfigAction(
  projectId: string,
  config: PresetConfig,
): Promise<PresetSaveResult> {
  const result = await savePresetConfig(projectId, config);
  if (result.ok) revalidatePath(`/dashboard/${projectId}/preset`);
  return result;
}
