"use server";

import { revalidatePath } from "next/cache";
import { recordPlanInterest, type InterestSource } from "@/application/plan-interest";
import { normalizePlan } from "@/lib/plans";
import { createChargeOrder, type StartedOrder } from "@/application/charge";

// 요금제 화면의 "이 플랜이 필요해요" 버튼(구버전). 어떤 등급을 원했는지만 기록한다.
export async function recordPlanInterestAction(formData: FormData) {
  const planId = normalizePlan(String(formData.get("planId") ?? ""));
  const raw = String(formData.get("source") ?? "billing");
  const source: InterestSource = raw === "download" ? "download" : "billing";

  await recordPlanInterest(planId, source);
  revalidatePath("/dashboard/billing");
}

// 충전 팩을 고르면 서버에서 주문을 만든다(금액·크레딧을 신뢰값으로 확정).
// 그 뒤 클라이언트가 이 주문번호로 토스 결제창을 연다.
export async function createChargeOrderAction(packId: string): Promise<StartedOrder | null> {
  return createChargeOrder(packId);
}
