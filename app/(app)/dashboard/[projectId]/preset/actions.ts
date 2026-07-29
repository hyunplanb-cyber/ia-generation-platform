"use server";

import { revalidatePath } from "next/cache";
import { savePresetConfig } from "@/application/preset";
import type { PresetConfig } from "@/lib/design-presets";

// 상세 프리셋 설정을 저장한다. 설정만 고르는 동작이라 크레딧은 들지 않는다.
export async function savePresetConfigAction(projectId: string, config: PresetConfig) {
  await savePresetConfig(projectId, config);
  revalidatePath(`/dashboard/${projectId}/preset`);
  return { ok: true as const };
}
