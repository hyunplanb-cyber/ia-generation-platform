import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { project } from "@/db/schema";
import { withProjectAuth } from "@/application/with-project-auth";
import { parsePresetConfig, type PresetConfig } from "@/lib/design-presets";

// 이 프로젝트에 저장된 상세 프리셋 설정을 읽는다(없으면 컨셉 기반 기본값).
export async function getPresetConfig(projectId: string): Promise<PresetConfig> {
  return withProjectAuth(projectId, async (p) =>
    parsePresetConfig(p.presetConfig, p.designConcept),
  );
}

// 상세 프리셋 설정을 저장한다(소유자만). 값은 JSON 문자열로 보관.
export async function savePresetConfig(
  projectId: string,
  config: PresetConfig,
): Promise<void> {
  await withProjectAuth(projectId, async () => {
    await db
      .update(project)
      .set({ presetConfig: JSON.stringify(config), updatedAt: new Date() })
      .where(eq(project.id, projectId));
  });
}
