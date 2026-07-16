import { CalendarRange } from "lucide-react";
import { listMenus } from "@/application/list-menus";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { ExcelDownloadButton } from "../excel-download-button";
import { buildWbsRows } from "@/lib/export/excel-rows";

function safeFileName(concept: string): string {
  return (concept || "프로젝트").trim().slice(0, 30).replace(/[\\/:*?"<>|]/g, "_");
}

export default async function WbsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [menus, { project, screens }] = await Promise.all([
    listMenus(projectId),
    getProjectScreensDetail(projectId),
  ]);

  const menuById = new Map(menus.map((m) => [m.id, m]));
  const activeScreens = screens
    .filter((s) => s.status === "active")
    .sort((a, b) => (a.scheduleStart ?? "").localeCompare(b.scheduleStart ?? ""));

  const hasContent = activeScreens.length > 0;

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
            <ExcelDownloadButton
              filename={`WBS_${safeFileName(project.concept)}.xlsx`}
              sheetName="WBS"
              rows={buildWbsRows(menus, activeScreens)}
              colWidths={[6, 16, 24, 14, 12, 12, 10]}
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
