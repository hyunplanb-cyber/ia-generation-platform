export type ScreenStatus = "active" | "quarantined";
export type FieldSource = "auto" | "manual";
export type PromptFeedback = "up" | "down" | null;

export interface Screen {
  id: string;
  projectId: string;
  menuId: string;
  pageId: string;
  pageName: string;
  // 상세 IA(3뎁스)에서 이 화면이 속한 2뎁스 화면 그룹명. 기본 생성은 null.
  screenGroup: string | null;
  status: ScreenStatus;
  screenRole: string;
  deviceCode: string;
  funcDef: string | null;
  prompt: string | null;
  pageIdSource: FieldSource;
  pageNameSource: FieldSource;
  funcDefSource: FieldSource;
  promptSource: FieldSource;
  scheduleStart: string | null;
  scheduleEnd: string | null;
  scheduleLocked: boolean;
  promptFeedback: PromptFeedback;
  // 다운로드 때 오푸스가 본문을 다시 쓴 시각(안 썼으면 null).
  enrichedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
