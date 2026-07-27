import { requireSession } from "@/application/require-session";
import { drizzleVerifyRunRepository } from "@/adapters/repository/drizzle/verify-run-repository";
import type { VerifyRun } from "@/domain/ports/verify-run-repository";

// 내가 지금까지 돌린 검수 기록 전체(최신순). 대시보드 '사이트 검수' 탭에서 쓴다.
export async function listMyVerifyRuns(): Promise<VerifyRun[]> {
  const session = await requireSession();
  return drizzleVerifyRunRepository.listByUser(session.user.id);
}
