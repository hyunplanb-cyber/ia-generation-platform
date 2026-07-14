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

export interface UpdateMenuInput {
  nameKo: string;
  nameEn: string;
  menuCode: string;
  description: string | null;
  desiredFeatures: string | null;
}

export interface MenuRepository {
  create(input: CreateMenuInput): Promise<Menu>;
  listByProject(projectId: string): Promise<Menu[]>;
  update(projectId: string, menuId: string, input: UpdateMenuInput): Promise<Menu | null>;
  updateSortOrder(projectId: string, menuId: string, sortOrder: number): Promise<void>;
  delete(projectId: string, menuId: string): Promise<void>;
}
