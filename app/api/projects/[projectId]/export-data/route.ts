import { NextResponse } from "next/server";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { ProjectNotFoundError } from "@/application/with-project-auth";

// 대시보드 "전체 다운로드"가 클라이언트에서 파일을 zip으로 묶을 수 있도록
// 프로젝트의 산출물 원본 데이터를 반환한다. 소유권은 application 레이어가 강제한다.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    const [menus, detail] = await Promise.all([
      listMenus(projectId),
      getProjectScreensDetail(projectId),
    ]);
    const screens = detail.screens.filter((s) => s.status === "active");
    const p = detail.project;
    return NextResponse.json({
      project: {
        concept: p.concept,
        designConcept: p.designConcept,
        deviceMode: p.deviceMode,
        overallStart: p.overallStart,
        overallEnd: p.overallEnd,
      },
      concept: p.concept,
      menus,
      screens,
      buttonActions: detail.buttonActions,
    });
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json({ error: "not-found" }, { status: 404 });
    }
    throw error;
  }
}
