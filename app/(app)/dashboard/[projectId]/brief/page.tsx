import { notFound } from "next/navigation";
import { getProjectForEdit } from "@/application/get-project-for-edit";
import { listMenus } from "@/application/list-menus";
import { ProjectNotFoundError } from "@/application/with-project-auth";
import { BriefForm } from "./brief-form";

// 자동 생성은 AI 응답을 여러 번 이어받아야 해서 1분 가까이 걸린다.
// 페이지에 걸면 이 화면에서 실행되는 서버 액션 전체에 적용된다.
// (Vercel 무료 플랜의 상한이 60초라 그 이상은 올릴 수 없다.)
export const maxDuration = 60;

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
