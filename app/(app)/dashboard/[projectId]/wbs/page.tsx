import { CalendarRange } from "lucide-react";
import { listMenus } from "@/application/list-menus";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { ZipAllButton } from "../../zip-all-button";
import { CREDITS_OPEN } from "@/lib/flags";
import { isDownloadUnlocked } from "@/application/download";
import { downloadCost } from "@/lib/credits";
import { FoldList } from "../fold";

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

  // 전부 보여주되 한 주 단위로 접는다. 118개를 펼쳐 두면 화면이 한없이 길어진다.
  // 시작일이 없는 화면은 마지막 "일정 미정"으로 모은다.
  const monday = (iso: string) => {
    const d = new Date(iso + "T00:00:00Z");
    const shift = (d.getUTCDay() + 6) % 7; // 월요일을 주의 첫날로
    d.setUTCDate(d.getUTCDate() - shift);
    return d.toISOString().slice(0, 10);
  };
  const fmt = (iso: string) => `${Number(iso.slice(5, 7))}월 ${Number(iso.slice(8, 10))}일`;
  const byWeek = new Map<string, typeof activeScreens>();
  for (const s of activeScreens) {
    const key = s.scheduleStart ? monday(s.scheduleStart) : "";
    const arr = byWeek.get(key);
    if (arr) arr.push(s);
    else byWeek.set(key, [s]);
  }
  const weeks = [...byWeek.entries()].sort((a, b) => (a[0] || "9999").localeCompare(b[0] || "9999"));
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
        <FoldList
          items={weeks.map(([weekStart, list], i) => ({
            key: weekStart || "none",
            title: weekStart ? `${i + 1}주차 · ${fmt(weekStart)}부터` : "일정 미정",
            meta: `작업 ${list.length}개`,
            body: (
              <div className="overflow-x-auto border-t border-border">
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
                    {list.map((screen) => (
                      <tr key={screen.id} className="border-t border-border/60">
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
            ),
          }))}
          flush
        />
      )}
    </div>
  );
}
