import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { drizzleProjectRepository } from "@/adapters/repository/drizzle/project-repository";
import { requireSession } from "@/application/require-session";

export async function requestAccountDeletion() {
  const session = await requireSession();
  const now = new Date();
  await db.update(user).set({ deletedAt: now }).where(eq(user.id, session.user.id));
  await drizzleProjectRepository.softDeleteAllByOwner(session.user.id, now);
}
