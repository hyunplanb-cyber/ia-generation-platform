import { listMyProjects } from "@/application/list-my-projects";
import { getCurrentPlan } from "@/application/get-current-plan";

export interface ProjectQuota {
  allowed: boolean;
  /** 지금 가지고 있는 프로젝트 수 */
  current: number;
  /** 이 등급의 상한. null = 무제한 */
  limit: number | null;
}

/**
 * 프로젝트를 하나 더 만들 수 있는지.
 *
 * 생성 1회마다 AI 호출 비용이 발생하므로(프로젝트당 100~300원),
 * 요금제에 적힌 상한을 실제로 지켜야 비용이 통제된다.
 */
export async function getProjectQuota(knownCount?: number): Promise<ProjectQuota> {
  // 화면에서 이미 목록을 불러왔다면 그 개수를 넘겨 중복 조회를 피한다.
  const [plan, current] = await Promise.all([
    getCurrentPlan(),
    knownCount ?? listMyProjects().then((p) => p.length),
  ]);
  const limit = plan.projectLimit;
  return {
    allowed: limit === null || current < limit,
    current,
    limit,
  };
}
