import type { PromptFeedback, Screen } from "@/domain/screen/screen";

export interface CreateScreenInput {
  projectId: string;
  menuId: string;
  pageId: string;
  pageName: string;
  // 상세 IA(3뎁스)의 2뎁스 화면 그룹명(기본 생성/수동 추가 시 비움)
  screenGroup?: string | null;
  screenRole: string;
  deviceCode: string;
  scheduleStart?: string;
  scheduleEnd?: string;
  // AI 분석으로 함께 생성된 경우 채워진다(수동 추가 시엔 비움)
  funcDef?: string;
  prompt?: string;
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

/**
 * 다운로드 때 다시 쓴 본문 한 화면치.
 * funcDef/prompt가 undefined면 그 칸은 손대지 않는다(사용자가 직접 고친 칸).
 */
export interface EnrichedFields {
  id: string;
  funcDef?: string;
  prompt?: string;
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
  /**
   * 다운로드 보강 결과를 저장하고 enrichedAt을 찍는다.
   * pageId·pageName·screenGroup·screenRole은 절대 건드리지 않는다(미리보기와 같아야 한다).
   * funcDefSource/promptSource도 그대로 둔다 — 여전히 사람이 아니라 AI가 쓴 칸이다.
   */
  applyEnrichment(projectId: string, updates: EnrichedFields[]): Promise<void>;
  updateSchedules(projectId: string, updates: ScheduleUpdate[]): Promise<void>;
  quarantineByMenu(projectId: string, menuId: string): Promise<void>;
  setPromptFeedback(id: string, projectId: string, feedback: PromptFeedback): Promise<void>;
}
