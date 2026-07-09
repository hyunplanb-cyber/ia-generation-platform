import { drizzleProjectRepository } from "@/adapters/repository/drizzle/project-repository";
import { requireSession } from "@/application/require-session";

export async function countMyProjects(): Promise<number> {
  const session = await requireSession();
  return drizzleProjectRepository.countByOwner(session.user.id);
}
