import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { project, screen, buttonAction } from "@/db/schema";
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
    presetConfig: row.presetConfig,
    presetDownloadedAt: row.presetDownloadedAt,
    presetDownloadedConfig: row.presetDownloadedConfig,
    presetRevisions: row.presetRevisions,
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
        deviceMode: input.deviceMode,
      })
      .where(eq(project.id, id))
      .returning();
    return toDomain(row);
  },

  async delete(id: string): Promise<void> {
    // 버튼 연결(target_screen_id)은 화면을 RESTRICT로 참조해, 화면이 남아 있으면
    // 삭제를 막는다. 그래서 프로젝트를 지우기 전에 이 프로젝트 화면들의 버튼 연결을
    // 먼저 지운다. 그러면 project → menu → screen 캐스케이드가 막히지 않는다.
    // (Neon HTTP는 트랜잭션이 없어 순차 삭제한다.)
    const screenIds = await db
      .select({ id: screen.id })
      .from(screen)
      .where(eq(screen.projectId, id));
    if (screenIds.length > 0) {
      await db.delete(buttonAction).where(
        inArray(
          buttonAction.screenId,
          screenIds.map((s) => s.id),
        ),
      );
    }
    await db.delete(project).where(eq(project.id, id));
  },

  async deleteDrafts(ownerId: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    // 초안은 화면이 없어서 버튼 연결을 먼저 지울 필요가 없다(버튼은 화면을 참조한다).
    // 메뉴는 project 캐스케이드로 함께 지워진다. 그래서 한 방이면 된다.
    await db.delete(project).where(and(eq(project.ownerId, ownerId), inArray(project.id, ids)));
  },

  async softDeleteAllByOwner(ownerId: string, deletedAt: Date): Promise<void> {
    await db.update(project).set({ deletedAt }).where(eq(project.ownerId, ownerId));
  },

  async restoreAllByOwner(ownerId: string): Promise<void> {
    await db.update(project).set({ deletedAt: null }).where(eq(project.ownerId, ownerId));
  },
};
