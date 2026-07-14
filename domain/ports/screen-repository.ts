import type { Screen } from "@/domain/screen/screen";

export interface CreateScreenInput {
  projectId: string;
  menuId: string;
  pageId: string;
  pageName: string;
  screenRole: string;
  deviceCode: string;
}

export interface ScreenRepository {
  createMany(inputs: CreateScreenInput[]): Promise<Screen[]>;
  listByProject(projectId: string): Promise<Screen[]>;
  countByProjectIds(projectIds: string[]): Promise<Record<string, number>>;
}
