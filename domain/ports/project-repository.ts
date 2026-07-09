import type { DeviceMode, Project } from "@/domain/project/project";

export interface CreateProjectInput {
  ownerId: string;
  concept: string;
  overallStart: string;
  overallEnd: string;
  deviceMode: DeviceMode;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  countByOwner(ownerId: string): Promise<number>;
}
