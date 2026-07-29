"use server";

import { revalidatePath } from "next/cache";
import { verifyText } from "@/application/verify-site";
import { getVerifyQuota } from "@/application/get-verify-quota";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { withProjectAuth } from "@/application/with-project-auth";
import { requireSession } from "@/application/require-session";
import { getCreditBalance, spendCredits } from "@/application/credit";
import { CREDITS_OPEN } from "@/lib/flags";
import { CREDIT_COST } from "@/lib/credits";
import { buildSpecPackMarkdown } from "@/lib/export/spec-pack";
import { drizzleVerifyRunRepository } from "@/adapters/repository/drizzle/verify-run-repository";
import type { VerificationReport } from "@/domain/verify/report";

export interface ProjectVerifyState {
  report: VerificationReport | null;
  error: string | null;
  limitReached: boolean;
  runId: string | null;
}

function fail(error: string): ProjectVerifyState {
  return { report: null, error, limitReached: false, runId: null };
}

// 생성된 산출물(화면·기능·버튼 연결)을 바탕으로 검수 시나리오를 만든다. 사이트 URL은 필요 없다.
export async function generateScenariosAction(
  _prev: ProjectVerifyState,
  formData: FormData,
): Promise<ProjectVerifyState> {
  const projectId = String(formData.get("projectId") ?? "");
  // 규모: 주요(30~50개·4크레딧) / 상세(100~150개·8크레딧). IA 생성과 동일한 2단.
  const detailMode = String(formData.get("mode") ?? "basic") === "detail";
  if (!projectId) return fail("프로젝트 정보를 찾지 못했어요. 새로고침 후 다시 시도해 주세요.");

  let ownerId: string;
  try {
    const session = await requireSession();
    ownerId = session.user.id;
    await withProjectAuth(projectId, async () => true);
  } catch {
    return fail("이 프로젝트에 접근할 수 없어요.");
  }

  // 결제 전에는 무료 횟수, 결제 켜지면 크레딧으로.
  if (!CREDITS_OPEN) {
    const quota = await getVerifyQuota();
    if (!quota.allowed) return { report: null, error: null, limitReached: true, runId: null };
  }
  const cost = detailMode ? CREDIT_COST.genDetail : CREDIT_COST.genBasic;
  if (CREDITS_OPEN && (await getCreditBalance()) < cost) {
    return fail("크레딧이 부족해요. 충전한 뒤 다시 시도해 주세요.");
  }

  // 산출물 → 텍스트(스펙팩) → 시나리오 생성.
  const [detail, menus] = await Promise.all([
    getProjectScreensDetail(projectId),
    listMenus(projectId),
  ]);
  const screens = detail.screens.filter((s) => s.status === "active");
  if (screens.length === 0) {
    return fail("먼저 산출물(화면 목록)을 생성해 주세요. 그 화면들 기준으로 시나리오를 만들어요.");
  }
  const label = detail.project.concept || "검수 시나리오";

  // 주요: 한 번 호출(핵심 화면 위주, 약 30~50개).
  // 상세: 화면을 10개씩 최대 4묶음으로 나눠 병렬 호출해 시나리오를 합침(약 100~150개).
  let report: VerificationReport;
  if (detailMode) {
    const CHUNK = 10;
    const MAX_CHUNKS = 4;
    const chunks: (typeof screens)[] = [];
    for (let i = 0; i < screens.length && chunks.length < MAX_CHUNKS; i += CHUNK) {
      chunks.push(screens.slice(i, i + CHUNK));
    }
    const results = await Promise.all(
      chunks.map((ch) =>
        verifyText(label, buildSpecPackMarkdown(detail.project, menus, ch, detail.buttonActions)).catch(
          () => ({ ok: false as const, reason: "failed" as const }),
        ),
      ),
    );
    const oks = results.filter(
      (r): r is { ok: true; report: VerificationReport } => r.ok,
    );
    if (oks.length === 0) return fail("검수 시나리오를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
    report = { ...oks[0].report, scenarios: oks.flatMap((r) => r.report.scenarios) };
  } else {
    const result = await verifyText(
      label,
      buildSpecPackMarkdown(detail.project, menus, screens, detail.buttonActions),
    );
    if (!result.ok) return fail("검수 시나리오를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
    report = result.report;
  }

  if (CREDITS_OPEN) {
    await spendCredits(cost, detailMode ? "검수 시나리오 생성(상세)" : "검수 시나리오 생성(주요)", {
      projectId,
    });
  }

  let runId: string | null = null;
  try {
    const run = await drizzleVerifyRunRepository.create({
      userId: ownerId,
      projectId,
      report,
    });
    runId = run.id;
  } catch (error) {
    console.error("검수 시나리오 저장 실패", error);
  }

  revalidatePath(`/dashboard/${projectId}/verify`);
  return { report, error: null, limitReached: false, runId };
}
