import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { downloadUnlock } from "@/db/schema";
import { requireSession } from "@/application/require-session";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { spendCredits } from "@/application/credit";
import { downloadCost } from "@/lib/credits";

// 이 프로젝트의 다운로드가 이미 열려 있는가(크레딧을 낸 적 있는가).
export async function isDownloadUnlocked(projectId: string): Promise<boolean> {
  const session = await requireSession();
  const [row] = await db
    .select({ id: downloadUnlock.id })
    .from(downloadUnlock)
    .where(and(eq(downloadUnlock.userId, session.user.id), eq(downloadUnlock.projectId, projectId)))
    .limit(1);
  return !!row;
}

// 이 프로젝트를 상세(3뎁스)로 봐야 하는지 + 그때 다운로드 원가.
export async function downloadCostFor(projectId: string): Promise<number> {
  const { screens } = await getProjectScreensDetail(projectId);
  const hasDetail = screens.some((s) => s.status === "active" && s.screenGroup);
  return downloadCost(hasDetail);
}

export type UnlockResult =
  | { ok: true }
  | { ok: false; reason: "insufficient"; balance: number };

// 다운로드 잠금 해제 — 크레딧을 차감하고 기록한다. 이미 열려 있으면 그냥 통과(중복 차감 없음).
export async function unlockDownload(projectId: string): Promise<UnlockResult> {
  const session = await requireSession();
  if (await isDownloadUnlocked(projectId)) return { ok: true };

  // 소유권은 getProjectScreensDetail이 확인한다. 원가는 서버가 다시 계산(클라 신뢰 X).
  const { screens } = await getProjectScreensDetail(projectId);
  const active = screens.filter((s) => s.status === "active");
  const hasDetail = active.some((s) => s.screenGroup);
  const cost = downloadCost(hasDetail);

  const spend = await spendCredits(cost, hasDetail ? "상세 산출물 다운로드" : "산출물 다운로드", {
    projectId,
  });
  if (!spend.ok) return { ok: false, reason: "insufficient", balance: spend.balance };

  await db
    .insert(downloadUnlock)
    .values({ userId: session.user.id, projectId, creditsSpent: cost })
    .onConflictDoNothing();
  return { ok: true };
}
