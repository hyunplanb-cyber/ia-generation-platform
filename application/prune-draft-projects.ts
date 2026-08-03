import { listUnfinishedProjects } from "@/application/list-unfinished-projects";
import { deleteProject } from "@/application/delete-project";
import { DRAFT_KEEP } from "@/lib/drafts";

/**
 * 임시 저장(만들다 만 프로젝트)은 최근 것만 남긴다.
 *
 * "AI팩 만들기"를 누를 때마다 빈 프로젝트가 하나씩 생겨서, 그냥 두면 끝없이 쌓인다
 * (실제로 한 계정에 64개까지 쌓였다 — 2026-08-03). 새로 만들 때마다 오래된 것부터
 * 정리해 열 개로 유지한다.
 *
 * **화면이 하나라도 있는 프로젝트는 건드리지 않는다.** 지우는 건 산출물을 만들지
 * 않은 껍데기뿐이다. 그래서 만들다 만 것만 잃고, 만든 것은 잃지 않는다.
 */

export async function pruneDraftProjects(keep: number = DRAFT_KEEP): Promise<number> {
  // 최근에 만진 것부터 온다. 앞의 keep개를 남기고 나머지를 지운다.
  const drafts = await listUnfinishedProjects();
  const stale = drafts.slice(keep);
  for (const p of stale) {
    // 하나가 실패해도 나머지 정리는 이어간다 — 정리는 곁다리 작업이라
    // 여기서 터져 새 프로젝트 만들기가 막히면 안 된다.
    await deleteProject(p.id).catch(() => undefined);
  }
  return stale.length;
}
