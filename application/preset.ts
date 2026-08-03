import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { project } from "@/db/schema";
import { withProjectAuth } from "@/application/with-project-auth";
import { spendCredits } from "@/application/credit";
import { CREDITS_OPEN } from "@/lib/flags";
import { CREDIT_COST, PRESET_REVISION_LIMIT } from "@/lib/credits";
import { parsePresetConfig, type PresetConfig } from "@/lib/design-presets";

// 프리셋 생성(첫 저장) 비용 — 다른 산출물 생성과 동일하게 4크레딧.
export const PRESET_GEN_COST = CREDIT_COST.genBasic;
// 프리셋 md 다운로드 비용 — 검수 시나리오 다운로드와 동일하게 99크레딧(9,900원).
export const PRESET_DOWNLOAD_COST = CREDIT_COST.optionPreset;
// 고쳐서 다시 받을 때. 처음보다 싸지만 횟수가 정해져 있다.
export const PRESET_REVISION_COST = CREDIT_COST.optionPresetRevision;
export { PRESET_REVISION_LIMIT };

export type PresetActionResult =
  | { ok: true; charged: boolean; cost?: number }
  | {
      ok: false;
      reason: "insufficient" | "not-generated" | "revision-limit";
      balance: number;
    };

export interface PresetState {
  generated: boolean;
  downloaded: boolean;
  /** 지금 설정이 마지막으로 받은 것과 다른가(= 다음 다운로드가 수정본인가). */
  changed: boolean;
  /** 수정본을 몇 번 받았나. */
  revisions: number;
  /** 다음 다운로드에 들 크레딧(0이면 무료). */
  nextCost: number;
}

// 이 프로젝트에 저장된 상세 프리셋 설정을 읽는다(없으면 컨셉 기반 기본값).
export async function getPresetConfig(projectId: string): Promise<PresetConfig> {
  return withProjectAuth(projectId, async (p) =>
    parsePresetConfig(p.presetConfig, p.designConcept),
  );
}

// 같은 설정인지 본다. 저장 형식(키 순서)이 달라도 내용이 같으면 같은 것으로 친다.
function sameConfig(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  const norm = (s: string) => {
    try {
      const o = JSON.parse(s) as Record<string, unknown>;
      return JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]]));
    } catch {
      return s;
    }
  };
  return norm(a) === norm(b);
}

// 생성/다운로드 결제 상태.
export async function getPresetState(projectId: string): Promise<PresetState> {
  return withProjectAuth(projectId, async (p) => {
    const downloaded = !!p.presetDownloadedAt;
    const changed = downloaded && !sameConfig(p.presetConfig, p.presetDownloadedConfig);
    const revisions = p.presetRevisions ?? 0;
    return {
      generated: !!p.presetConfig,
      downloaded,
      changed,
      revisions,
      nextCost: !downloaded
        ? PRESET_DOWNLOAD_COST
        : changed && revisions < PRESET_REVISION_LIMIT
          ? PRESET_REVISION_COST
          : 0,
    };
  });
}

// 프리셋 생성 — 첫 생성 때만 4크레딧 차감. 이후 설정 변경 저장은 무료.
export async function generatePreset(
  projectId: string,
  config: PresetConfig,
): Promise<PresetActionResult> {
  return withProjectAuth(projectId, async (p) => {
    const firstTime = !p.presetConfig;
    if (firstTime) {
      const spend = await spendCredits(PRESET_GEN_COST, "디자인 프리셋 생성", { projectId });
      if (!spend.ok) return { ok: false, reason: "insufficient", balance: spend.balance };
    }
    await db
      .update(project)
      .set({ presetConfig: JSON.stringify(config), updatedAt: new Date() })
      .where(eq(project.id, projectId));
    return { ok: true, charged: firstTime };
  });
}

/**
 * 프리셋 md 다운로드.
 *
 *   처음               99크레딧
 *   그대로 다시 받기     무료 (몇 번이든) — 산 것을 잃지 않게
 *   고쳐서 다시 받기     30크레딧 · 2회까지
 *   그 뒤               못 받음(마지막으로 받은 내용은 계속 무료)
 *
 * 프리셋은 프로젝트에 묶이지 않는 파일이라, 한 번 받으면 다른 프로젝트에 그대로
 * 넣어 쓸 수 있다. 그래서 고쳐 받는 것에만 값을 매기고 횟수를 둔다(2026-08-04).
 */
export async function downloadPreset(projectId: string): Promise<PresetActionResult> {
  return withProjectAuth(projectId, async (p) => {
    if (!p.presetConfig) return { ok: false, reason: "not-generated", balance: 0 };

    const firstTime = !p.presetDownloadedAt;
    const changed = !firstTime && !sameConfig(p.presetConfig, p.presetDownloadedConfig);
    const revisions = p.presetRevisions ?? 0;

    // 고치지 않았으면 언제든 그냥 준다.
    if (!firstTime && !changed) return { ok: true, charged: false, cost: 0 };

    if (changed && revisions >= PRESET_REVISION_LIMIT) {
      return { ok: false, reason: "revision-limit", balance: 0 };
    }

    const cost = firstTime ? PRESET_DOWNLOAD_COST : PRESET_REVISION_COST;
    if (CREDITS_OPEN) {
      const memo = firstTime ? "디자인 프리셋 다운로드" : "디자인 프리셋 수정본 다운로드";
      const spend = await spendCredits(cost, memo, { projectId });
      if (!spend.ok) return { ok: false, reason: "insufficient", balance: spend.balance };
    }
    // 결제가 닫혀 있어도 '무엇을 받았는지'는 남긴다 — 열었을 때 횟수가 어긋나지 않게.
    await db
      .update(project)
      .set({
        presetDownloadedAt: p.presetDownloadedAt ?? new Date(),
        presetDownloadedConfig: p.presetConfig,
        presetRevisions: firstTime ? 0 : revisions + 1,
      })
      .where(eq(project.id, projectId));

    return { ok: true, charged: CREDITS_OPEN, cost };
  });
}
