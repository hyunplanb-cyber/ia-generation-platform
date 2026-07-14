import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { deriveMenuCode } from "@/domain/menu/derive-menu-code";
import { validateMenuCode, type MenuCodeRejection } from "@/domain/menu/menu-code-rules";
import type { Menu } from "@/domain/menu/menu";
import { withProjectAuth } from "@/application/with-project-auth";

export class MenuNotFoundError extends Error {
  constructor() {
    super("MENU_NOT_FOUND");
  }
}

export interface UpdateMenuRequest {
  nameKo: string;
  nameEn: string;
  description: string | null;
  desiredFeatures: string | null;
}

export type UpdateMenuResult = { ok: true; menu: Menu } | { ok: false; reason: MenuCodeRejection };

export async function updateMenu(
  projectId: string,
  menuId: string,
  input: UpdateMenuRequest,
): Promise<UpdateMenuResult> {
  return withProjectAuth(projectId, async () => {
    const existing = await drizzleMenuRepository.listByProject(projectId);
    const current = existing.find((m) => m.id === menuId);
    if (!current) {
      throw new MenuNotFoundError();
    }

    const derivedCode = deriveMenuCode(input.nameEn).toUpperCase();
    let menuCode = current.menuCode;
    if (derivedCode !== current.menuCode) {
      const otherCodes = existing.filter((m) => m.id !== menuId).map((m) => m.menuCode);
      const rejection = validateMenuCode(derivedCode, otherCodes);
      if (rejection) {
        return { ok: false, reason: rejection };
      }
      menuCode = derivedCode;
    }

    const menu = await drizzleMenuRepository.update(projectId, menuId, { ...input, menuCode });
    if (!menu) {
      throw new MenuNotFoundError();
    }
    return { ok: true, menu };
  });
}
