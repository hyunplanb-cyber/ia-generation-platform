export type ScreenStatus = "active" | "quarantined";
export type FieldSource = "auto" | "manual";
export type PromptFeedback = "up" | "down" | null;

export interface Screen {
  id: string;
  projectId: string;
  menuId: string;
  pageId: string;
  pageName: string;
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
  createdAt: Date;
  updatedAt: Date;
}
