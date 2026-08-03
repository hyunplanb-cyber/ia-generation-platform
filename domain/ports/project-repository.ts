import type { DeviceMode, Project } from "@/domain/project/project";

export interface CreateProjectInput {
  ownerId: string;
  concept: string;
  menuDraft: string | null;
  designConcept: string | null;
  overallStart: string;
  overallEnd: string;
  deviceMode: DeviceMode;
}

export interface UpdateProjectInput {
  concept: string;
  menuDraft: string | null;
  designConcept: string | null;
  overallStart: string;
  overallEnd: string;
  deviceMode: DeviceMode;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  listByOwner(ownerId: string): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
  /**
   * 화면이 없는 초안 여러 개를 한 번에 지운다.
   * 하나씩 지우면 왕복이 개수만큼 늘어 화면이 눈에 띄게 느려진다.
   * ownerId를 조건에 함께 넣어 남의 것을 지울 수 없게 한다.
   */
  deleteDrafts(ownerId: string, ids: string[]): Promise<void>;
  softDeleteAllByOwner(ownerId: string, deletedAt: Date): Promise<void>;
  restoreAllByOwner(ownerId: string): Promise<void>;
}
