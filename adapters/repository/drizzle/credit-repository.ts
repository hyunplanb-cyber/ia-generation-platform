import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { creditLedger } from "@/db/schema";
import type { CreditRepository } from "@/domain/ports/credit-repository";
import type { CreditEntry, CreditKind, NewCreditEntry } from "@/domain/credit/credit";

function toDomain(row: typeof creditLedger.$inferSelect): CreditEntry {
  let meta: Record<string, unknown> | null = null;
  if (row.meta) {
    try {
      meta = JSON.parse(row.meta) as Record<string, unknown>;
    } catch {
      meta = null;
    }
  }
  return {
    id: row.id,
    userId: row.userId,
    amount: row.amount,
    kind: row.kind as CreditKind,
    memo: row.memo,
    expiresAt: row.expiresAt,
    meta,
    createdAt: row.createdAt,
  };
}

export const drizzleCreditRepository: CreditRepository = {
  async balance(userId: string): Promise<number> {
    const [row] = await db
      .select({ total: sql<number>`coalesce(sum(${creditLedger.amount}), 0)::int` })
      .from(creditLedger)
      .where(eq(creditLedger.userId, userId));
    return row?.total ?? 0;
  },

  async add(entry: NewCreditEntry): Promise<CreditEntry> {
    const [row] = await db
      .insert(creditLedger)
      .values({
        userId: entry.userId,
        amount: entry.amount,
        kind: entry.kind,
        memo: entry.memo,
        expiresAt: entry.expiresAt ?? null,
        meta: entry.meta ? JSON.stringify(entry.meta) : null,
      })
      .returning();
    return toDomain(row);
  },

  async list(userId: string, limit = 50): Promise<CreditEntry[]> {
    const rows = await db
      .select()
      .from(creditLedger)
      .where(eq(creditLedger.userId, userId))
      .orderBy(desc(creditLedger.createdAt))
      .limit(limit);
    return rows.map(toDomain);
  },

  async hasKind(userId: string, kind: CreditKind): Promise<boolean> {
    const [row] = await db
      .select({ id: creditLedger.id })
      .from(creditLedger)
      .where(and(eq(creditLedger.userId, userId), eq(creditLedger.kind, kind)))
      .limit(1);
    return !!row;
  },
};
