import { CalendarRange } from "lucide-react";
import { Fragment } from "react";
import { listMenus } from "@/application/list-menus";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { ZipAllButton } from "../../zip-all-button";
import { CREDITS_OPEN } from "@/lib/flags";
import { isDownloadUnlocked } from "@/application/download";
import { downloadCost } from "@/lib/credits";
import { PREVIEW_PER_GROUP, MoreRow } from "../preview-limit";

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

  // 미리보기는 메뉴마다 앞 3개만. 일정순 정렬은 그대로 두고 메뉴별로만 센다.
  const seen = new Map<string, number>();
  const rows: { screen: (typeof activeScreens)[number]; hiddenAfter: number }[] = [];
  const perMenu = new Map<string, number>();
  for (const s of activeScreens) perMenu.set(s.menuId, (perMenu.get(s.menuId) ?? 0) + 1);
  for (const s of activeScreens) {
    const n = (seen.get(s.menuId) ?? 0) + 1;
    seen.set(s.menuId, n);
    if (n > PREVIEW_PER_GROUP) continue;
    const total = perMenu.get(s.menuId) ?? 0;
    rows.push({
      screen: s,
      hiddenAfter: n === PREVIEW_PER_GROUP && total > PREVIEW_PER_GROUP ? total - PREVIEW_PER_GROUP : 0,
    });
  }
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
              {rows.map(({ screen, hiddenAfter }) => (
                <Fragment key={screen.id}>
                <tr className="border-t border-border">
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
                <MoreRow hidden={hiddenAfter} colSpan={5} what="작업" />
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
