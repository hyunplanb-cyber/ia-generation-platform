import type { Screen } from "@/domain/screen/screen";

export interface CreateScreenInput {
  projectId: string;
  menuId: string;
  pageId: string;
  pageName: string;
  screenRole: string;
  deviceCode: string;
}

export type ScreenFieldsPatch = Partial<
  Pick<Screen, "pageId" | "pageName" | "pageIdSource" | "pageNameSource">
>;

export interface ScreenRepository {
  createMany(inputs: CreateScreenInput[]): Promise<Screen[]>;
  listByProject(projectId: string): Promise<Screen[]>;
  countByProjectIds(projectIds: string[]): Promise<Record<string, number>>;
  findById(id: string, projectId: string): Promise<Screen | null>;
  updateFields(
    id: string,
    projectId: string,
    patch: ScreenFieldsPatch,
    expectedUpdatedAt: Date,
  ): Promise<Screen | null>;
}
