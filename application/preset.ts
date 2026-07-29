import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { project } from "@/db/schema";
import { withProjectAuth } from "@/application/with-project-auth";
import { spendCredits } from "@/application/credit";
import { CREDITS_OPEN } from "@/lib/flags";
import { CREDIT_COST } from "@/lib/credits";
import { parsePresetConfig, type PresetConfig } from "@/lib/design-presets";

// 프리셋 "생성"(첫 저장) 비용 — 검수 시나리오 생성과 동일하게 4크레딧.
export const PRESET_GEN_COST = CREDIT_COST.genBasic;

export type PresetSaveResult =
  | { ok: true; charged: boolean }
  | { ok: false; reason: "insufficient"; balance: number };

// 이 프로젝트에 저장된 상세 프리셋 설정을 읽는다(없으면 컨셉 기반 기본값).
export async function getPresetConfig(projectId: string): Promise<PresetConfig> {
  return withProjectAuth(projectId, async (p) =>
    parsePresetConfig(p.presetConfig, p.designConcept),
  );
}

// 이 프로젝트가 이미 프리셋을 생성(=크레딧 차감)했는가.
export async function isPresetGenerated(projectId: string): Promise<boolean> {
  return withProjectAuth(projectId, async (p) => !!p.presetConfig);
}

// 상세 프리셋 설정을 저장한다(소유자만).
// 처음 생성할 때만 4크레딧을 차감하고, 그 뒤 수정은 무료.
export async function savePresetConfig(
  projectId: string,
  config: PresetConfig,
): Promise<PresetSaveResult> {
  return withProjectAuth(projectId, async (p) => {
    const firstTime = !p.presetConfig;
    let charged = false;

    if (CREDITS_OPEN && firstTime) {
      const spend = await spendCredits(PRESET_GEN_COST, "디자인 프리셋 생성", { projectId });
      if (!spend.ok) return { ok: false, reason: "insufficient", balance: spend.balance };
      charged = true;
    }

    await db
      .update(project)
      .set({ presetConfig: JSON.stringify(config), updatedAt: new Date() })
      .where(eq(project.id, projectId));

    return { ok: true, charged };
  });
}
