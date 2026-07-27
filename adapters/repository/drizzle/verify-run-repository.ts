import { desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { verifyRun } from "@/db/schema";
import type { VerificationReport } from "@/domain/verify/report";
import type {
  VerifyRun,
  VerifyRunRepository,
  CreateVerifyRunInput,
} from "@/domain/ports/verify-run-repository";

function toDomain(row: typeof verifyRun.$inferSelect): VerifyRun {
  return {
    id: row.id,
    userId: row.userId,
    projectId: row.projectId,
    mode: row.mode as "site" | "document",
    target: row.target,
    report: JSON.parse(row.report) as VerificationReport,
    createdAt: row.createdAt,
  };
}

export const drizzleVerifyRunRepository: VerifyRunRepository = {
  async create(input: CreateVerifyRunInput): Promise<VerifyRun> {
    const r = input.report;
    const [row] = await db
      .insert(verifyRun)
      .values({
        userId: input.userId,
        projectId: input.projectId,
        mode: r.mode,
        target: r.url,
        report: JSON.stringify(r),
        passCount: r.passCount,
        failCount: r.failCount,
      })
      .returning();
    return toDomain(row);
  },

  async countByUser(userId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(verifyRun)
      .where(eq(verifyRun.userId, userId));
    return row?.count ?? 0;
  },

  async listByUser(userId: string): Promise<VerifyRun[]> {
    const rows = await db
      .select()
      .from(verifyRun)
      .where(eq(verifyRun.userId, userId))
      .orderBy(desc(verifyRun.createdAt));
    return rows.map(toDomain);
  },

  async findById(id: string, userId: string): Promise<VerifyRun | null> {
    const [row] = await db
      .select()
      .from(verifyRun)
      .where(and(eq(verifyRun.id, id), eq(verifyRun.userId, userId)));
    return row ? toDomain(row) : null;
  },
};
