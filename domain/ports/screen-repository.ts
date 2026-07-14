import type { PromptFeedback, Screen } from "@/domain/screen/screen";

export interface CreateScreenInput {
  projectId: string;
  menuId: string;
  pageId: string;
  pageName: string;
  screenRole: string;
  deviceCode: string;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export type ScreenFieldsPatch = Partial<
  Pick<
    Screen,
    | "pageId"
    | "pageName"
    | "pageIdSource"
    | "pageNameSource"
    | "funcDef"
    | "funcDefSource"
    | "prompt"
    | "promptSource"
    | "scheduleStart"
    | "scheduleEnd"
    | "scheduleLocked"
  >
>;

export interface ScheduleUpdate {
  id: string;
  scheduleStart: string;
  scheduleEnd: string;
}

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
  setFuncDefSourceManual(id: string, projectId: string): Promise<void>;
  updateSchedules(projectId: string, updates: ScheduleUpdate[]): Promise<void>;
  quarantineByMenu(projectId: string, menuId: string): Promise<void>;
  setPromptFeedback(id: string, projectId: string, feedback: PromptFeedback): Promise<void>;
}
