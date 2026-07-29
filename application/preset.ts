import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { project } from "@/db/schema";
import { withProjectAuth } from "@/application/with-project-auth";
import { spendCredits } from "@/application/credit";
import { CREDITS_OPEN } from "@/lib/flags";
import { CREDIT_COST } from "@/lib/credits";
import { parsePresetConfig, type PresetConfig } from "@/lib/design-presets";

// 프리셋 생성(첫 저장) 비용 — 다른 산출물 생성과 동일하게 4크레딧.
export const PRESET_GEN_COST = CREDIT_COST.genBasic;
// 프리셋 md 다운로드 비용 — 검수 시나리오 다운로드와 동일하게 99크레딧(9,900원).
export const PRESET_DOWNLOAD_COST = CREDIT_COST.optionPreset;

export type PresetActionResult =
  | { ok: true; charged: boolean }
  | { ok: false; reason: "insufficient" | "not-generated"; balance: number };

export interface PresetState {
  generated: boolean;
  downloaded: boolean;
}

// 이 프로젝트에 저장된 상세 프리셋 설정을 읽는다(없으면 컨셉 기반 기본값).
export async function getPresetConfig(projectId: string): Promise<PresetConfig> {
  return withProjectAuth(projectId, async (p) =>
    parsePresetConfig(p.presetConfig, p.designConcept),
  );
}

// 생성/다운로드 결제 상태.
export async function getPresetState(projectId: string): Promise<PresetState> {
  return withProjectAuth(projectId, async (p) => ({
    generated: !!p.presetConfig,
    downloaded: !!p.presetDownloadedAt,
  }));
}

// 프리셋 생성 — 첫 생성 때만 4크레딧 차감. 이후 설정 변경 저장은 무료.
export async function generatePreset(
  projectId: string,
  config: PresetConfig,
): Promise<PresetActionResult> {
  return withProjectAuth(projectId, async (p) => {
    const firstTime = !p.presetConfig;
    if (CREDITS_OPEN && firstTime) {
      const spend = await spendCredits(PRESET_GEN_COST, "디자인 프리셋 생성", { projectId });
      if (!spend.ok) return { ok: false, reason: "insufficient", balance: spend.balance };
    }
    await db
      .update(project)
      .set({ presetConfig: JSON.stringify(config), updatedAt: new Date() })
      .where(eq(project.id, projectId));
    return { ok: true, charged: CREDITS_OPEN && firstTime };
  });
}

// 프리셋 md 다운로드 — 첫 다운로드 때만 99크레딧 차감. 이후 재다운로드 무료.
export async function downloadPreset(projectId: string): Promise<PresetActionResult> {
  return withProjectAuth(projectId, async (p) => {
    if (!p.presetConfig) return { ok: false, reason: "not-generated", balance: 0 };
    const firstTime = !p.presetDownloadedAt;
    if (CREDITS_OPEN && firstTime) {
      const spend = await spendCredits(PRESET_DOWNLOAD_COST, "디자인 프리셋 다운로드", { projectId });
      if (!spend.ok) return { ok: false, reason: "insufficient", balance: spend.balance };
      await db
        .update(project)
        .set({ presetDownloadedAt: new Date() })
        .where(eq(project.id, projectId));
    }
    return { ok: true, charged: CREDITS_OPEN && firstTime };
  });
}
