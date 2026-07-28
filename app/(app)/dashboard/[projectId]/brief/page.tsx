import { notFound } from "next/navigation";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import { listMenus } from "@/application/list-menus";
import { ProjectNotFoundError } from "@/application/with-project-auth";
import { BriefForm } from "./brief-form";

// 자동 생성은 AI 응답을 여러 번 이어받아야 해서 시간이 걸린다.
// 특히 상세(3뎁스) 모드는 화면이 100개+라 뼈대+세부 생성이 1~2분까지 늘어난다.
// 페이지에 걸면 이 화면에서 실행되는 서버 액션 전체에 적용된다.
// Fluid Compute(신규 프로젝트 기본 활성)에서는 무료 플랜도 상한이 300초라
// 예전 60초 제한 때 상세 모드가 타임아웃(504)나던 문제를 풀기 위해 넉넉히 올린다.
export const maxDuration = 300;

export default async function BriefPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  // 두 조회를 병렬로 — Neon HTTP 왕복을 순차가 아닌 동시에 처리해 지연을 줄인다.
  const [project, menus] = await Promise.all([
    getProjectForEdit(projectId).catch((error) => {
      if (error instanceof ProjectNotFoundError) {
        notFound();
      }
      throw error;
    }),
    listMenus(projectId),
  ]);
  const hasMenus = menus.length > 0;

  return <BriefForm project={project} hasMenus={hasMenus} />;
}
