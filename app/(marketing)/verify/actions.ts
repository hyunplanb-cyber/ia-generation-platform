"use server";

import { verifySite } from "@/application/verify-site";
import type { VerificationReport } from "@/domain/verify/report";

export interface VerifyState {
  report: VerificationReport | null;
  error: string | null;
}

const REASON_MESSAGE: Record<string, string> = {
  "bad-url": "주소 형식이 올바르지 않아요. https://내사이트.com 형태로 넣어주세요.",
  unreachable: "사이트에 접속하지 못했어요. 주소와 배포 상태를 확인해 주세요.",
  unavailable: "지금은 검수를 이용할 수 없어요. 잠시 후 다시 시도해 주세요.",
  failed: "검수 중 문제가 있었어요. 다시 시도해 주세요.",
};

export async function runVerifyAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const url = String(formData.get("url") ?? "").trim();
  if (!url) {
    return { report: null, error: "검사할 사이트 주소를 넣어주세요." };
  }

  const result = await verifySite(url);
  if (!result.ok) {
    return { report: null, error: REASON_MESSAGE[result.reason] ?? REASON_MESSAGE.failed };
  }
  return { report: result.report, error: null };
}
