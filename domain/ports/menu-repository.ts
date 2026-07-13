import type { Menu } from "@/domain/menu/menu";

export interface CreateMenuInput {
  projectId: string;
  nameKo: string;
  nameEn: string;
  menuCode: string;
  description: string | null;
  desiredFeatures: string | null;
  sortOrder: number;
}

export interface MenuRepository {
  create(input: CreateMenuInput): Promise<Menu>;
  listByProject(projectId: string): Promise<Menu[]>;
}
