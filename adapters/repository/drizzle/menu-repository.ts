import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { menu } from "@/db/schema";
import type { Menu } from "@/domain/menu/menu";
import type {
  CreateMenuInput,
  MenuRepository,
  UpdateMenuInput,
} from "@/domain/ports/menu-repository";

function toDomain(row: typeof menu.$inferSelect): Menu {
  return {
    id: row.id,
    projectId: row.projectId,
    nameKo: row.nameKo,
    nameEn: row.nameEn,
    menuCode: row.menuCode,
    description: row.description,
    desiredFeatures: row.desiredFeatures,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const drizzleMenuRepository: MenuRepository = {
  async create(input: CreateMenuInput): Promise<Menu> {
    const [row] = await db
      .insert(menu)
      .values({
        projectId: input.projectId,
        nameKo: input.nameKo,
        nameEn: input.nameEn,
        menuCode: input.menuCode,
        description: input.description,
        desiredFeatures: input.desiredFeatures,
        sortOrder: input.sortOrder,
      })
      .returning();
    return toDomain(row);
  },

  async listByProject(projectId: string): Promise<Menu[]> {
    const rows = await db
      .select()
      .from(menu)
      .where(eq(menu.projectId, projectId))
      .orderBy(asc(menu.sortOrder));
    return rows.map(toDomain);
  },

  async update(projectId: string, menuId: string, input: UpdateMenuInput): Promise<Menu | null> {
    const [row] = await db
      .update(menu)
      .set({
        nameKo: input.nameKo,
        nameEn: input.nameEn,
        description: input.description,
        desiredFeatures: input.desiredFeatures,
      })
      .where(and(eq(menu.id, menuId), eq(menu.projectId, projectId)))
      .returning();
    return row ? toDomain(row) : null;
  },

  async updateSortOrder(projectId: string, menuId: string, sortOrder: number): Promise<void> {
    await db
      .update(menu)
      .set({ sortOrder })
      .where(and(eq(menu.id, menuId), eq(menu.projectId, projectId)));
  },
};
