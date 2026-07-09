import { drizzleProjectRepository } from "@/adapters/repository/drizzle/project-repository";
import type { Project } from "@/domain/project/project";
import { requireSession } from "@/application/require-session";

export async function listMyProjects(): Promise<Project[]> {
  const session = await requireSession();
  return drizzleProjectRepository.listByOwner(session.user.id);
}
