import Link from "next/link";
import { TriangleAlert, LayoutList } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { detectMixedDeviceMode } from "@/domain/screen/detect-mixed-device-mode";
import { detectMixedMenuCodeMenuIds } from "@/domain/screen/detect-mixed-menu-code";
import { detectOutOfRangeScreens } from "@/domain/schedule/detect-out-of-range-screens";
import { detectScheduleReversals } from "@/domain/schedule/detect-schedule-reversals";
import { DeliverableHeader, HeaderStat } from "../deliverable-header";
import { ZipAllButton } from "../../zip-all-button";
import { CREDITS_OPEN } from "@/lib/flags";
import { isDownloadUnlocked } from "@/application/download";
import { downloadCost } from "@/lib/credits";
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
  const unlocked = await isDownloadUnlocked(projectId);
  const activeScreens = screens.filter((s) => s.status === "active");
  const quarantinedScreens = screens.filter((s) => s.status === "quarantined");
  const cost = downloadCost(activeScreens.some((s) => s.screenGroup));

  const isMixed = detectMixedDeviceMode(project.deviceMode, activeScreens);
  const mixedMenuCodeIds = detectMixedMenuCodeMenuIds(menus, activeScreens);
  const mixedMenuCodeMenus = menus.filter((menu) => mixedMenuCodeIds.has(menu.id));
  const outOfRangeIds = [
    ...detectOutOfRangeScreens(project.overallStart, project.overallEnd, activeScreens),
  ];
  const reversedIds = [...detectScheduleReversals(activeScreens)];

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        icon={LayoutList}
        tone="violet"
        title="IA · 화면 목록"
        description="메뉴별로 자동 생성된 화면 목록이에요. 각 화면의 페이지ID·일정·기능정의·이동 화면을 확인하고 수정할 수 있어요. 모든 산출물은 [전체 다운로드] 하나로 받아요."
        downloads={[]}
        actions={
          activeScreens.length > 0 ? (
            <ZipAllButton
              projectId={projectId}
              large
              credits={cost}
              unlocked={unlocked}
              creditsOpen={CREDITS_OPEN}
            />
          ) : undefined
        }
        meta={
          activeScreens.length > 0 ? (
            <HeaderStat label={`총 ${activeScreens.length}개 화면`} />
          ) : undefined
        }
      />

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
          <Link href={`/dashboard/${projectId}/brief`} className="font-medium text-primary underline">
            주요 메뉴·디자인 컨셉
          </Link>{" "}
          화면에서 [컨셉 분석해서 자동 생성]을 실행해 주세요.
        </p>
      ) : (
        <ScreensView
          screens={activeScreens}
          menus={menus}
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
