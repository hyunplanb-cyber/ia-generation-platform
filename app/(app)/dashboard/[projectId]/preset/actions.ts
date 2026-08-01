"use server";

import { revalidatePath } from "next/cache";
import {
  generatePreset,
  downloadPreset,
  type PresetActionResult,
} from "@/application/preset";
import type { PresetConfig } from "@/lib/design-presets";

// 프리셋 생성 — 첫 생성 때만 PRESET_GEN_COST 차감(값은 lib/credits.ts).
export async function generatePresetAction(
  projectId: string,
  config: PresetConfig,
): Promise<PresetActionResult> {
  const result = await generatePreset(projectId, config);
  if (result.ok) revalidatePath(`/dashboard/${projectId}/preset`);
  return result;
}

// 프리셋 md 다운로드 결제 — 첫 다운로드 때만 PRESET_DOWNLOAD_COST 차감.
export async function downloadPresetAction(projectId: string): Promise<PresetActionResult> {
  const result = await downloadPreset(projectId);
  if (result.ok) revalidatePath(`/dashboard/${projectId}/preset`);
  return result;
}
