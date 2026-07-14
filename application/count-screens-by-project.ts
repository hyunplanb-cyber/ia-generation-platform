import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";

export async function countScreensByProject(projectIds: string[]): Promise<Record<string, number>> {
  return drizzleScreenRepository.countByProjectIds(projectIds);
}
