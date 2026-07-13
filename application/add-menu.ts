import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { deriveMenuCode } from "@/domain/menu/derive-menu-code";
import { validateMenuCode, type MenuCodeRejection } from "@/domain/menu/menu-code-rules";
import { withProjectAuth } from "@/application/with-project-auth";
import type { Menu } from "@/domain/menu/menu";

export interface AddMenuRequest {
  nameKo: string;
  nameEn: string;
  description: string | null;
  desiredFeatures: string | null;
  manualMenuCode: string | null;
}

export type AddMenuResult = { ok: true; menu: Menu } | { ok: false; reason: MenuCodeRejection };

export async function addMenu(projectId: string, input: AddMenuRequest): Promise<AddMenuResult> {
  return withProjectAuth(projectId, async () => {
    const existing = await drizzleMenuRepository.listByProject(projectId);
    const existingCodes = existing.map((m) => m.menuCode);

    const candidateCode = input.manualMenuCode?.trim()
      ? input.manualMenuCode.trim().toUpperCase()
      : deriveMenuCode(input.nameEn).toUpperCase();

    const rejection = validateMenuCode(candidateCode, existingCodes);
    if (rejection) {
      return { ok: false, reason: rejection };
    }

    const menu = await drizzleMenuRepository.create({
      projectId,
      nameKo: input.nameKo,
      nameEn: input.nameEn,
      menuCode: candidateCode,
      description: input.description,
      desiredFeatures: input.desiredFeatures,
      sortOrder: existing.length,
    });
    return { ok: true, menu };
  });
}
