import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { planInterest } from "@/db/schema";
import { requireSession } from "@/application/require-session";
import { normalizePlan, type PlanId } from "@/lib/plans";

export type InterestSource = "download" | "billing";

/**
 * "결제 열리면 알려주세요"를 기록한다.
 * 같은 사람이 같은 등급을 여러 번 눌러도 한 번만 남는다(중복 집계 방지).
 */
export async function recordPlanInterest(
  planId: PlanId,
  source: InterestSource,
): Promise<void> {
  const session = await requireSession();
  // 무료 등급에는 알림을 신청할 이유가 없다.
  if (planId === "free") return;

  await db
    .insert(planInterest)
    .values({ userId: session.user.id, planId, source })
    .onConflictDoNothing({
      target: [planInterest.userId, planInterest.planId],
    });
}

/** 지금 사용자가 이미 알림을 신청한 등급들. 버튼 상태를 바꾸는 데 쓴다. */
export async function getMyPlanInterests(): Promise<Set<PlanId>> {
  const session = await requireSession();
  const rows = await db
    .select({ planId: planInterest.planId })
    .from(planInterest)
    .where(eq(planInterest.userId, session.user.id));
  return new Set(rows.map((r) => normalizePlan(r.planId)));
}

/** 특정 사용자가 특정 등급을 신청했는지. */
export async function hasPlanInterest(userId: string, planId: PlanId): Promise<boolean> {
  const rows = await db
    .select({ id: planInterest.id })
    .from(planInterest)
    .where(and(eq(planInterest.userId, userId), eq(planInterest.planId, planId)))
    .limit(1);
  return rows.length > 0;
}
