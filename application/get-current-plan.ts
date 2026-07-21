import { requireSession } from "@/application/require-session";
import { getPlan, type PlanDef } from "@/lib/plans";

// 페이월(다운로드 게이트) 전역 스위치.
// 결제 수단이 붙기 전까지는 꺼둔다(=모두 다운로드 가능). 결제 준비되면 이 env를 켠다.
export function isPaywallEnabled(): boolean {
  return process.env.PAYWALL_ENABLED === "true";
}

// 현재 로그인 사용자의 요금제. 세션의 plan 필드를 정규화해 반환한다.
export async function getCurrentPlan(): Promise<PlanDef> {
  const session = await requireSession();
  // Better Auth additionalFields로 plan이 세션 user에 실려 온다(없으면 free로 정규화).
  const plan = (session.user as { plan?: string | null }).plan;
  return getPlan(plan);
}

// 이 사용자가 지금 다운로드할 수 있는가.
// 페이월이 꺼져 있으면 항상 허용, 켜져 있으면 요금제의 canDownload를 따른다.
export async function canDownload(): Promise<boolean> {
  if (!isPaywallEnabled()) return true;
  const plan = await getCurrentPlan();
  return plan.canDownload;
}
