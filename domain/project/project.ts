// 반응형(하나의 화면이 기기에 맞춰 적응) / PC 웹 전용 / 모바일 웹·앱 전용
export type DeviceMode = "responsive" | "pc" | "mobile";

export interface Project {
  id: string;
  ownerId: string;
  concept: string;
  menuDraft: string | null;
  designConcept: string | null;
  presetConfig: string | null;
  presetDownloadedAt: Date | null;
  overallStart: string;
  overallEnd: string;
  deviceMode: DeviceMode;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
