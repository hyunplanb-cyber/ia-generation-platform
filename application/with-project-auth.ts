import { drizzleProjectRepository } from "@/adapters/repository/drizzle/project-repository";
import type { Project } from "@/domain/project/project";
import { requireSession } from "@/application/require-session";

export class ProjectNotFoundError extends Error {
  constructor() {
    super("PROJECT_NOT_FOUND");
  }
}

export async function withProjectAuth<T>(
  projectId: string,
  fn: (project: Project) => Promise<T>,
): Promise<T> {
  const session = await requireSession();
  const project = await drizzleProjectRepository.findById(projectId);

  if (!project || project.ownerId !== session.user.id) {
    throw new ProjectNotFoundError();
  }

  return fn(project);
}
