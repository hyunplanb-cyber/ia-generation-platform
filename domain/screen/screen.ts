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
  /**
   * 눌렀을 때 이 화면 안에서 끝나는 것 — [무엇을 누르면, 무엇이 바뀐다].
   *
   * 화면이 바뀌는 것(버튼 이동)과 나란히 가는 값이다. 이 칸이 없던 동안
   * 스펙팩이 버튼에 대해 적을 수 있는 것은 "어느 화면으로 가는가" 하나뿐이었고,
   * 그래서 만들어진 사이트는 눌러도 값이 안 바뀌는 포스터가 됐다(2026-08-06).
   *
   * 판매 템플릿에서만 채운다. 유저 프로젝트는 아직 비운다.
   */
  acts?: [string, string][];
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
