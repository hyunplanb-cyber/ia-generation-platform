import type { DeviceMode, Project } from "@/domain/project/project";

export interface CreateProjectInput {
  ownerId: string;
  concept: string;
  overallStart: string;
  overallEnd: string;
  deviceMode: DeviceMode;
}

export interface UpdateProjectInput {
  concept: string;
  overallStart: string;
  overallEnd: string;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  listByOwner(ownerId: string): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  update(id: string, input: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
}
