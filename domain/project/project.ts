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
  /** 마지막으로 결제하고 받은 프리셋 설정(JSON). 지금 설정과 다르면 수정본이다. */
  presetDownloadedConfig: string | null;
  /** 수정본을 몇 번 받았나. */
  presetRevisions: number;
  overallStart: string;
  overallEnd: string;
  deviceMode: DeviceMode;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
