import { drizzleProjectRepository } from "@/adapters/repository/drizzle/project-repository";
import { requireSession } from "@/application/require-session";

export interface CreateProjectRequest {
  concept: string;
  menuDraft: string | null;
  designConcept: string | null;
  overallStart: string;
  overallEnd: string;
}

export async function createProject(input: CreateProjectRequest) {
  const session = await requireSession();
  return drizzleProjectRepository.create({
    ownerId: session.user.id,
    concept: input.concept,
    menuDraft: input.menuDraft,
    designConcept: input.designConcept,
    overallStart: input.overallStart,
    overallEnd: input.overallEnd,
    deviceMode: "responsive",
  });
}
