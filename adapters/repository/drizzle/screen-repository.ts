import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { screen } from "@/db/schema";
import type { FieldSource, PromptFeedback, Screen, ScreenStatus } from "@/domain/screen/screen";
import type {
  CreateScreenInput,
  ScreenFieldsPatch,
  ScreenRepository,
} from "@/domain/ports/screen-repository";

function toDomain(row: typeof screen.$inferSelect): Screen {
  return {
    id: row.id,
    projectId: row.projectId,
    menuId: row.menuId,
    pageId: row.pageId,
    pageName: row.pageName,
    status: row.status as ScreenStatus,
    screenRole: row.screenRole,
    deviceCode: row.deviceCode,
    funcDef: row.funcDef,
    prompt: row.prompt,
    pageIdSource: row.pageIdSource as FieldSource,
    pageNameSource: row.pageNameSource as FieldSource,
    funcDefSource: row.funcDefSource as FieldSource,
    promptSource: row.promptSource as FieldSource,
    scheduleStart: row.scheduleStart,
    scheduleEnd: row.scheduleEnd,
    scheduleLocked: row.scheduleLocked,
    promptFeedback: row.promptFeedback as PromptFeedback,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const drizzleScreenRepository: ScreenRepository = {
  async createMany(inputs: CreateScreenInput[]): Promise<Screen[]> {
    if (inputs.length === 0) return [];
    const rows = await db
      .insert(screen)
      .values(
        inputs.map((input) => ({
          projectId: input.projectId,
          menuId: input.menuId,
          pageId: input.pageId,
          pageName: input.pageName,
          screenRole: input.screenRole,
          deviceCode: input.deviceCode,
        })),
      )
      .returning();
    return rows.map(toDomain);
  },

  async listByProject(projectId: string): Promise<Screen[]> {
    const rows = await db.select().from(screen).where(eq(screen.projectId, projectId));
    return rows.map(toDomain);
  },

  async countByProjectIds(projectIds: string[]): Promise<Record<string, number>> {
    if (projectIds.length === 0) return {};
    const rows = await db
      .select({ projectId: screen.projectId, count: sql<number>`count(*)::int` })
      .from(screen)
      .where(inArray(screen.projectId, projectIds))
      .groupBy(screen.projectId);
    return Object.fromEntries(rows.map((row) => [row.projectId, row.count]));
  },

  async findById(id: string, projectId: string): Promise<Screen | null> {
    const [row] = await db
      .select()
      .from(screen)
      .where(and(eq(screen.id, id), eq(screen.projectId, projectId)));
    return row ? toDomain(row) : null;
  },

  async updateFields(
    id: string,
    projectId: string,
    patch: ScreenFieldsPatch,
    expectedUpdatedAt: Date,
  ): Promise<Screen | null> {
    const [row] = await db
      .update(screen)
      .set(patch)
      .where(
        and(
          eq(screen.id, id),
          eq(screen.projectId, projectId),
          eq(screen.updatedAt, expectedUpdatedAt),
        ),
      )
      .returning();
    return row ? toDomain(row) : null;
  },

  async setFuncDefSourceManual(id: string, projectId: string): Promise<void> {
    await db
      .update(screen)
      .set({ funcDefSource: "manual" })
      .where(and(eq(screen.id, id), eq(screen.projectId, projectId)));
  },
};
