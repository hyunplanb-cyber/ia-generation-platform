import { count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { project } from "@/db/schema";
import type { Project, DeviceMode } from "@/domain/project/project";
import type { CreateProjectInput, ProjectRepository } from "@/domain/ports/project-repository";

function toDomain(row: typeof project.$inferSelect): Project {
  return {
    id: row.id,
    ownerId: row.ownerId,
    concept: row.concept,
    overallStart: row.overallStart,
    overallEnd: row.overallEnd,
    deviceMode: row.deviceMode as DeviceMode,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}

export const drizzleProjectRepository: ProjectRepository = {
  async create(input: CreateProjectInput): Promise<Project> {
    const [row] = await db
      .insert(project)
      .values({
        ownerId: input.ownerId,
        concept: input.concept,
        overallStart: input.overallStart,
        overallEnd: input.overallEnd,
        deviceMode: input.deviceMode,
      })
      .returning();
    return toDomain(row);
  },

  async countByOwner(ownerId: string): Promise<number> {
    const [row] = await db
      .select({ value: count() })
      .from(project)
      .where(eq(project.ownerId, ownerId));
    return row?.value ?? 0;
  },
};
