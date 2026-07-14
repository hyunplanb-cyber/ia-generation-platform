import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { detectMixedDeviceMode } from "@/domain/screen/detect-mixed-device-mode";
import { ScreensView } from "./screens-view";

export default async function ScreensPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, screens, buttonActions } = await getProjectScreensDetail(projectId);
  const isMixed = detectMixedDeviceMode(project.deviceMode, screens);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">화면 리스트</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          메뉴별로 자동 생성된 화면 목록이에요.
        </p>
      </div>

      {isMixed && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
          <TriangleAlert className="size-4 shrink-0" />
          디바이스 대응 방식이 혼재되어 있어요. 기존 화면의 페이지ID는 그대로 유지되고, 새로 생성되는 화면부터 현재 방식이 적용돼요.
        </div>
      )}

      {screens.length === 0 ? (
        <p className="text-muted-foreground">
          아직 생성된 화면이 없어요.{" "}
          <Link href={`/dashboard/${projectId}/menus`} className="font-medium text-primary underline">
            메뉴 관리
          </Link>
          에서 [실행: IA 생성]을 눌러주세요.
        </p>
      ) : (
        <ScreensView screens={screens} buttonActions={buttonActions} projectId={projectId} />
      )}
    </div>
  );
}
