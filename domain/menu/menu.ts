export interface Menu {
  id: string;
  projectId: string;
  nameKo: string;
  nameEn: string;
  menuCode: string;
  description: string | null;
  desiredFeatures: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
