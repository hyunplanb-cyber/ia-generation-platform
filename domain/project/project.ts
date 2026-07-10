export type DeviceMode = "responsive" | "device-split";

export interface Project {
  id: string;
  ownerId: string;
  concept: string;
  menuDraft: string | null;
  designConcept: string | null;
  overallStart: string;
  overallEnd: string;
  deviceMode: DeviceMode;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
