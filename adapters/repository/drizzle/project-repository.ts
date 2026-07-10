import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { project } from "@/db/schema";
import type { Project, DeviceMode } from "@/domain/project/project";
import type {
  CreateProjectInput,
  ProjectRepository,
  UpdateProjectInput,
} from "@/domain/ports/project-repository";

function toDomain(row: typeof project.$inferSelect): Project {
  return {
    id: row.id,
    ownerId: row.ownerId,
    concept: row.concept,
    menuDraft: row.menuDraft,
    designConcept: row.designConcept,
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
        menuDraft: input.menuDraft,
        designConcept: input.designConcept,
        overallStart: input.overallStart,
        overallEnd: input.overallEnd,
        deviceMode: input.deviceMode,
      })
      .returning();
    return toDomain(row);
  },

  async listByOwner(ownerId: string): Promise<Project[]> {
    const rows = await db
      .select()
      .from(project)
      .where(eq(project.ownerId, ownerId))
      .orderBy(desc(project.updatedAt));
    return rows.map(toDomain);
  },

  async findById(id: string): Promise<Project | null> {
    const [row] = await db.select().from(project).where(eq(project.id, id));
    return row ? toDomain(row) : null;
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const [row] = await db
      .update(project)
      .set({
        concept: input.concept,
        menuDraft: input.menuDraft,
        designConcept: input.designConcept,
        overallStart: input.overallStart,
        overallEnd: input.overallEnd,
      })
      .where(eq(project.id, id))
      .returning();
    return toDomain(row);
  },

  async delete(id: string): Promise<void> {
    await db.delete(project).where(eq(project.id, id));
  },

  async softDeleteAllByOwner(ownerId: string, deletedAt: Date): Promise<void> {
    await db.update(project).set({ deletedAt }).where(eq(project.ownerId, ownerId));
  },

  async restoreAllByOwner(ownerId: string): Promise<void> {
    await db.update(project).set({ deletedAt: null }).where(eq(project.ownerId, ownerId));
  },
};
