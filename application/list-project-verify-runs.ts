import { withProjectAuth } from "@/application/with-project-auth";
import { drizzleVerifyRunRepository } from "@/adapters/repository/drizzle/verify-run-repository";
import type { VerifyRun } from "@/domain/ports/verify-run-repository";

// 이 프로젝트에 연결된 검수 기록을 최신순으로. (소유자 확인 포함)
export async function listProjectVerifyRuns(projectId: string): Promise<VerifyRun[]> {
  return withProjectAuth(projectId, async () => {
    return drizzleVerifyRunRepository.listByProject(projectId);
  });
}
