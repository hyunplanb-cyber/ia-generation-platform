"use server";

import { revalidatePath } from "next/cache";
import { verifySite } from "@/application/verify-site";
import { getVerifyQuota } from "@/application/get-verify-quota";
import { withProjectAuth } from "@/application/with-project-auth";
import { requireSession } from "@/application/require-session";
import { getCreditBalance, spendCredits } from "@/application/credit";
import { CREDITS_OPEN } from "@/lib/flags";
import { CREDIT_COST } from "@/lib/credits";
import { drizzleVerifyRunRepository } from "@/adapters/repository/drizzle/verify-run-repository";
import type { VerificationReport } from "@/domain/verify/report";

export interface ProjectVerifyState {
  report: VerificationReport | null;
  error: string | null;
  limitReached: boolean;
}

const REASON_MESSAGE: Record<string, string> = {
  "bad-url": "주소 형식이 올바르지 않아요. https://내사이트.com 형태로 넣어주세요.",
  unreachable: "사이트에 접속하지 못했어요. 주소와 배포 상태를 확인해 주세요.",
  unavailable: "지금은 검수를 이용할 수 없어요. 잠시 후 다시 시도해 주세요.",
  failed: "검수 중 문제가 있었어요. 다시 시도해 주세요.",
};

function fail(error: string): ProjectVerifyState {
  return { report: null, error, limitReached: false };
}

// 프로젝트에 연결해서 사이트를 검수한다. 결과는 이 프로젝트의 검수 기록으로 저장된다.
export async function runProjectVerifyAction(
  _prev: ProjectVerifyState,
  formData: FormData,
): Promise<ProjectVerifyState> {
  const projectId = String(formData.get("projectId") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!projectId) return fail("프로젝트 정보를 찾지 못했어요. 새로고침 후 다시 시도해 주세요.");
  if (!url) return fail("검사할 사이트 주소를 넣어주세요.");

  // 소유자 확인 — 남의 프로젝트에 검수 결과를 붙이지 못하게 방어.
  let ownerId: string;
  try {
    const session = await requireSession();
    ownerId = session.user.id;
    await withProjectAuth(projectId, async () => true);
  } catch {
    return fail("이 프로젝트에 접근할 수 없어요.");
  }

  // 결제 전에는 무료 횟수, 결제 켜지면 크레딧으로 대체.
  if (!CREDITS_OPEN) {
    const quota = await getVerifyQuota();
    if (!quota.allowed) {
      return { report: null, error: null, limitReached: true };
    }
  }

  const cost = CREDIT_COST.verifySite;
  if (CREDITS_OPEN && (await getCreditBalance()) < cost) {
    return fail("크레딧이 부족해요. 충전한 뒤 다시 시도해 주세요.");
  }

  const result = await verifySite(url);
  if (!result.ok) return fail(REASON_MESSAGE[result.reason] ?? REASON_MESSAGE.failed);

  // 검수 성공 → 크레딧 차감(결제 켜짐일 때만).
  if (CREDITS_OPEN) {
    await spendCredits(cost, "사이트 검수(프로젝트)", { projectId });
  }

  try {
    await drizzleVerifyRunRepository.create({
      userId: ownerId,
      projectId,
      report: result.report,
    });
  } catch (error) {
    console.error("프로젝트 검수 저장 실패", error);
  }

  // 검수 기록 목록을 새로 읽어오도록.
  revalidatePath(`/dashboard/${projectId}/verify`);

  return { report: result.report, error: null, limitReached: false };
}
