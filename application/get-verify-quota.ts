import { drizzleVerifyRunRepository } from "@/adapters/repository/drizzle/verify-run-repository";
import { getCurrentPlan, isPaywallEnabled } from "@/application/get-current-plan";
import { requireSession } from "@/application/require-session";

export interface VerifyQuota {
  allowed: boolean; // 지금 검수를 한 번 더 할 수 있는가
  current: number; // 지금까지 한 검수 횟수
  limit: number | null; // 이 등급의 무료 상한. null = 무제한
}

// 이 사용자가 지금 검수를 한 번 더 할 수 있는지.
// 페이월이 꺼져 있으면 항상 허용, 켜져 있으면 등급의 verifyLimit을 따른다.
export async function getVerifyQuota(): Promise<VerifyQuota> {
  const session = await requireSession();
  if (!isPaywallEnabled()) {
    return { allowed: true, current: 0, limit: null };
  }
  const [plan, current] = await Promise.all([
    getCurrentPlan(),
    drizzleVerifyRunRepository.countByUser(session.user.id),
  ]);
  const limit = plan.verifyLimit;
  return { allowed: limit === null || current < limit, current, limit };
}
