"use server";

import { revalidatePath } from "next/cache";
import { recordPlanInterest, type InterestSource } from "@/application/plan-interest";
import { normalizePlan } from "@/lib/plans";

// 요금제 화면의 "이 플랜이 필요해요" 버튼.
// 어떤 등급을 원했는지만 기록한다 — 연락을 약속하지는 않는다.
export async function recordPlanInterestAction(formData: FormData) {
  const planId = normalizePlan(String(formData.get("planId") ?? ""));
  const raw = String(formData.get("source") ?? "billing");
  const source: InterestSource = raw === "download" ? "download" : "billing";

  await recordPlanInterest(planId, source);
  revalidatePath("/dashboard/billing");
}
