import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { deriveMenuCode } from "@/domain/menu/derive-menu-code";
import { withProjectAuth } from "@/application/with-project-auth";

export interface AddMenuRequest {
  nameKo: string;
  nameEn: string;
  description: string | null;
  desiredFeatures: string | null;
}

export async function addMenu(projectId: string, input: AddMenuRequest) {
  return withProjectAuth(projectId, async () => {
    const existing = await drizzleMenuRepository.listByProject(projectId);
    const menuCode = deriveMenuCode(input.nameEn);
    return drizzleMenuRepository.create({
      projectId,
      nameKo: input.nameKo,
      nameEn: input.nameEn,
      menuCode,
      description: input.description,
      desiredFeatures: input.desiredFeatures,
      sortOrder: existing.length,
    });
  });
}
