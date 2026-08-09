"use server";

import { revalidatePath } from "next/cache";
import { verifyText } from "@/application/verify-site";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { withProjectAuth } from "@/application/with-project-auth";
import { requireSession } from "@/application/require-session";
import { getCreditBalance, spendCredits } from "@/application/credit";
import { creditsOpenForMe } from "@/application/billing-gate";
import { VERIFY_CHUNK, verifyGenCost, insufficientCreditMessage } from "@/lib/credits";
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
  // 규모: 주요(핵심 화면 한 묶음) / 상세(화면 10개씩 전부).
  // 크레딧은 고정값이 아니라 묶음 수로 정한다(verifyGenCost).
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

  // 이 경로는 우리가 만든 산출물이라 화면 수를 정확히 안다 → 값을 미리 확정할 수 있다.
  // 주요: 한 번(핵심 화면 위주). 상세: 화면 10개씩 전부 나눠 본다.
  const plannedChunks = detailMode
    ? Math.ceil(screens.length / VERIFY_CHUNK.screens)
    : 1;
  // 한도는 크레딧 하나로만 정한다(기능별 무료 횟수를 두지 않는다).
  if ((await getCreditBalance()) < verifyGenCost(plannedChunks)) {
    return { report: null, error: insufficientCreditMessage(await creditsOpenForMe()), limitReached: true, runId: null };
  }

  let report: VerificationReport;
  let doneChunks: number;
  if (detailMode) {
    // 예전에는 4묶음(앞 40화면)에서 끊었다. 156화면짜리를 사고도 앞 40개만 검수받았다는 뜻이라
    // 상한을 없앴다. 값이 묶음 수에 비례하므로 많이 보면 그만큼 더 받는다.
    const chunks: (typeof screens)[] = [];
    for (let i = 0; i < screens.length; i += VERIFY_CHUNK.screens) {
      chunks.push(screens.slice(i, i + VERIFY_CHUNK.screens));
    }
    const results = await Promise.all(
      chunks.map((ch) =>
        verifyText(label, buildSpecPackMarkdown(detail.project, menus, ch, detail.buttonActions)).catch(
          () => ({ ok: false as const, reason: "failed" as const }),
        ),
      ),
    );
    const oks = results.filter(
      (r): r is { ok: true; report: VerificationReport; chunks: number } => r.ok,
    );
    if (oks.length === 0) return fail("검수 시나리오를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
    report = { ...oks[0].report, scenarios: oks.flatMap((r) => r.report.scenarios) };
    doneChunks = oks.length;
  } else {
    const result = await verifyText(
      label,
      buildSpecPackMarkdown(detail.project, menus, screens, detail.buttonActions),
    );
    if (!result.ok) return fail("검수 시나리오를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
    report = result.report;
    doneChunks = result.chunks;
  }
  // 실제로 성공한 묶음만큼만 받는다.
  const cost = verifyGenCost(doneChunks);

  // 생성이 성공했을 때만 차감한다(실패하면 무과금).
  await spendCredits(cost, detailMode ? "검수 시나리오 생성(상세)" : "검수 시나리오 생성(주요)", {
    projectId,
  });

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
