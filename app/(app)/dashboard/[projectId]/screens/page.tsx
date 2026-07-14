import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { detectMixedDeviceMode } from "@/domain/screen/detect-mixed-device-mode";
import { detectMixedMenuCodeMenuIds } from "@/domain/screen/detect-mixed-menu-code";
import { detectOutOfRangeScreens } from "@/domain/schedule/detect-out-of-range-screens";
import { detectScheduleReversals } from "@/domain/schedule/detect-schedule-reversals";
import { ScreensView } from "./screens-view";
import { QuarantinedScreensSection } from "./quarantined-screens-section";

export default async function ScreensPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, screens, buttonActions } = await getProjectScreensDetail(projectId);
  const menus = await listMenus(projectId);
  const activeScreens = screens.filter((s) => s.status === "active");
  const quarantinedScreens = screens.filter((s) => s.status === "quarantined");

  const isMixed = detectMixedDeviceMode(project.deviceMode, activeScreens);
  const mixedMenuCodeIds = detectMixedMenuCodeMenuIds(menus, activeScreens);
  const mixedMenuCodeMenus = menus.filter((menu) => mixedMenuCodeIds.has(menu.id));
  const outOfRangeIds = [
    ...detectOutOfRangeScreens(project.overallStart, project.overallEnd, activeScreens),
  ];
  const reversedIds = [...detectScheduleReversals(activeScreens)];

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

      {mixedMenuCodeMenus.map((menu) => (
        <div
          key={menu.id}
          className="flex items-center gap-2 rounded-lg bg-warning-soft px-4 py-3 text-sm font-medium text-warning"
        >
          <TriangleAlert className="size-4 shrink-0" />
          {menu.nameKo} 메뉴에 신/구 코드가 섞여 있어요. 기존 화면의 페이지ID는 유지되고, 새로 생성되는 화면부터 새 코드가 적용돼요.
        </div>
      ))}

      {activeScreens.length === 0 ? (
        <p className="text-muted-foreground">
          아직 생성된 화면이 없어요.{" "}
          <Link href={`/dashboard/${projectId}/menus`} className="font-medium text-primary underline">
            메뉴 관리
          </Link>
          에서 [실행: IA 생성]을 눌러주세요.
        </p>
      ) : (
        <ScreensView
          screens={activeScreens}
          buttonActions={buttonActions}
          projectId={projectId}
          outOfRangeIds={outOfRangeIds}
          reversedIds={reversedIds}
        />
      )}

      {quarantinedScreens.length > 0 && (
        <QuarantinedScreensSection screens={quarantinedScreens} />
      )}
    </div>
  );
}
