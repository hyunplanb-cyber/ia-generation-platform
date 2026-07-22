"use server";

import { revalidatePath } from "next/cache";
import { recordPlanInterest, type InterestSource } from "@/application/plan-interest";
import { normalizePlan } from "@/lib/plans";

// 요금제 화면의 "열리면 알려주세요" 버튼.
// 폼으로 등급과 유입 경로를 받아 기록하고, 화면을 갱신해 "신청 완료"로 바꾼다.
export async function requestPlanNoticeAction(formData: FormData) {
  const planId = normalizePlan(String(formData.get("planId") ?? ""));
  const raw = String(formData.get("source") ?? "billing");
  const source: InterestSource = raw === "download" ? "download" : "billing";

  await recordPlanInterest(planId, source);
  revalidatePath("/dashboard/billing");
}
