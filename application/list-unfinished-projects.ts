import { listMyProjects } from "@/application/list-my-projects";
import { countScreensByProject } from "@/application/count-screens-by-project";
import type { Project } from "@/domain/project/project";

/**
 * 아직 산출물을 만들지 않은 프로젝트.
 *
 * "AI팩 만들기"를 누를 때마다 빈 프로젝트가 생겨서, 들어왔다 나가기를 몇 번 하면
 * 목록이 껍데기로 지저분해졌다(2026-08-03). 새로 만들기 전에 이걸 먼저 보여주고
 * 이어서 하게 한다.
 *
 * 최근에 만진 것부터. 화면이 하나라도 있으면 "만들다 만 것"이 아니라 완성본이다.
 */
export async function listUnfinishedProjects(exceptId?: string): Promise<Project[]> {
  const projects = await listMyProjects();
  if (projects.length === 0) return [];
  const counts = await countScreensByProject(projects.map((p) => p.id));
  return projects
    .filter((p) => p.id !== exceptId && (counts[p.id] ?? 0) === 0)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
