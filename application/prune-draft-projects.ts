import { drizzleProjectRepository as repo } from "@/adapters/repository/drizzle/project-repository";
import { listUnfinishedProjects } from "@/application/list-unfinished-projects";
import { requireSession } from "@/application/require-session";
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
 *
 * 한 번에 지운다. 하나씩 지우면 왕복이 개수만큼 늘어(64개면 200번 넘게)
 * "AI팩 만들기"를 누르고 화면이 뜨기까지 눈에 띄게 느려진다.
 */
export async function pruneDraftProjects(keep: number = DRAFT_KEEP): Promise<number> {
  // 최근에 만진 것부터 온다. 앞의 keep개를 남기고 나머지를 지운다.
  const drafts = await listUnfinishedProjects();
  const stale = drafts.slice(keep);
  if (stale.length === 0) return 0;

  const session = await requireSession();
  // 정리는 곁다리 작업이라, 실패해도 새 프로젝트 만들기를 막지 않는다.
  await repo
    .deleteDrafts(
      session.user.id,
      stale.map((p) => p.id),
    )
    .catch(() => undefined);
  return stale.length;
}
