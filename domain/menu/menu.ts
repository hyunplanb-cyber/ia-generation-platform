/**
 * 이 메뉴를 누가 쓰는가. 없으면 손님용으로 본다.
 *
 * 손님 메뉴와 운영자 메뉴가 한 헤더에 나란히 붙은 사이트가 나와서 생긴 값이다.
 * 지금은 판매 템플릿에서만 채운다 — 사용자가 만든 프로젝트는 아직 비어 있고,
 * 그때는 예전처럼 메뉴 하나로 이어 붙인다(lib/export/spec-pack.ts).
 */
export type MenuAudience = "customer" | "owner" | "account";

export interface Menu {
  id: string;
  projectId: string;
  nameKo: string;
  nameEn: string;
  menuCode: string;
  description: string | null;
  audience?: MenuAudience;
  desiredFeatures: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
