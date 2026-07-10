import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { drizzleProjectRepository } from "@/adapters/repository/drizzle/project-repository";
import { requireSession } from "@/application/require-session";

export async function cancelAccountDeletion() {
  const session = await requireSession();
  await db.update(user).set({ deletedAt: null }).where(eq(user.id, session.user.id));
  await drizzleProjectRepository.restoreAllByOwner(session.user.id);
}
