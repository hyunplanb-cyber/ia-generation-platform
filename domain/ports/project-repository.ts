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
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  listByOwner(ownerId: string): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
  softDeleteAllByOwner(ownerId: string, deletedAt: Date): Promise<void>;
  restoreAllByOwner(ownerId: string): Promise<void>;
}
