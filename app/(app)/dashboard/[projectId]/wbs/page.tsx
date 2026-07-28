import { CalendarRange } from "lucide-react";
import { listMenus } from "@/application/list-menus";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { ZipAllButton } from "../../zip-all-button";
import { CREDITS_OPEN } from "@/lib/flags";
import { isDownloadUnlocked } from "@/application/download";
import { downloadCost } from "@/lib/credits";

export default async function WbsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [menus, { screens }, unlocked] = await Promise.all([
    listMenus(projectId),
    getProjectScreensDetail(projectId),
    isDownloadUnlocked(projectId),
  ]);

  const menuById = new Map(menus.map((m) => [m.id, m]));
  const activeScreens = screens
    .filter((s) => s.status === "active")
    .sort((a, b) => (a.scheduleStart ?? "").localeCompare(b.scheduleStart ?? ""));

  const hasContent = activeScreens.length > 0;
  const cost = downloadCost(activeScreens.some((s) => s.screenGroup));

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        icon={CalendarRange}
        tone="yellow"
        title="WBS"
        description="화면(작업)별 제작 일정을 정리해요. 순번·소속 메뉴·시작/종료일·기간으로 엑셀 내보내기가 돼요."
        downloads={[]}
        actions={
          hasContent ? (
            <ZipAllButton
              projectId={projectId}
              large
              credits={cost}
              unlocked={unlocked}
              creditsOpen={CREDITS_OPEN}
            />
          ) : undefined
        }
      />

      {!hasContent ? (
        <DeliverableEmpty projectId={projectId} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">작업(화면)</th>
                <th className="px-4 py-2 font-medium">소속 메뉴</th>
                <th className="px-4 py-2 font-medium">시작일</th>
                <th className="px-4 py-2 font-medium">종료일</th>
                <th className="px-4 py-2 font-medium">산출물</th>
              </tr>
            </thead>
            <tbody>
              {activeScreens.map((screen) => (
                <tr key={screen.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{screen.pageName}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {screen.pageId}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {menuById.get(screen.menuId)?.nameKo ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                    {screen.scheduleStart ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                    {screen.scheduleEnd ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">UI정의서</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
