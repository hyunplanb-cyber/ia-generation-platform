import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { buttonAction, screen } from "@/db/schema";
import type { ButtonAction } from "@/domain/screen/button-action";
import type {
  ButtonActionRepository,
  CreateButtonActionInput,
  UpdateButtonActionInput,
} from "@/domain/ports/button-action-repository";

function toDomain(row: typeof buttonAction.$inferSelect): ButtonAction {
  return {
    id: row.id,
    screenId: row.screenId,
    label: row.label,
    targetScreenId: row.targetScreenId,
    targetPageIdSnapshot: row.targetPageIdSnapshot,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const drizzleButtonActionRepository: ButtonActionRepository = {
  async create(input: CreateButtonActionInput): Promise<ButtonAction> {
    const [row] = await db
      .insert(buttonAction)
      .values({
        screenId: input.screenId,
        label: input.label,
        targetScreenId: input.targetScreenId,
        targetPageIdSnapshot: input.targetPageIdSnapshot,
      })
      .returning();
    return toDomain(row);
  },

  async listByProject(projectId: string): Promise<ButtonAction[]> {
    const rows = await db
      .select({ buttonAction: buttonAction })
      .from(buttonAction)
      .innerJoin(screen, eq(buttonAction.screenId, screen.id))
      .where(eq(screen.projectId, projectId));
    return rows.map((row) => toDomain(row.buttonAction));
  },

  async update(
    id: string,
    screenId: string,
    input: UpdateButtonActionInput,
  ): Promise<ButtonAction | null> {
    const [row] = await db
      .update(buttonAction)
      .set(input)
      .where(and(eq(buttonAction.id, id), eq(buttonAction.screenId, screenId)))
      .returning();
    return row ? toDomain(row) : null;
  },

  async delete(id: string, screenId: string): Promise<void> {
    await db
      .delete(buttonAction)
      .where(and(eq(buttonAction.id, id), eq(buttonAction.screenId, screenId)));
  },
};
