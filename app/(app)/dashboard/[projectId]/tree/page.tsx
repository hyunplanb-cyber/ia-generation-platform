import { listMenus } from "@/application/list-menus";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { DiagramOrList } from "../diagram-or-list";
import { buildMenuTreeDef } from "../diagram-defs";

export default async function TreePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [menus, { screens }] = await Promise.all([
    listMenus(projectId),
    getProjectScreensDetail(projectId),
  ]);

  const activeScreens = screens.filter((s) => s.status === "active");
  const hasContent = menus.length > 0;
  const treeDef = buildMenuTreeDef("사이트 전체", menus, activeScreens);

  const listView = (
    <div className="overflow-hidden rounded-lg border border-border">
          {menus.map((menu, i) => {
            const menuScreens = activeScreens.filter((s) => s.menuId === menu.id);
            return (
              <div key={menu.id} className={i > 0 ? "border-t border-border" : ""}>
                <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5">
                  <span className="rounded-sm bg-pastel-lavender px-2 py-0.5 font-mono text-xs font-medium text-pastel-lavender-foreground">
                    {menu.menuCode}
                  </span>
                  <span className="font-semibold text-foreground">{menu.nameKo}</span>
                  <span className="text-xs text-muted-foreground">({menu.nameEn})</span>
                </div>
                {menuScreens.length === 0 ? (
                  <p className="px-4 py-3 pl-10 text-sm text-muted-foreground">
                    아직 이 메뉴의 화면이 없어요.
                  </p>
                ) : (
                  <ul>
                    {menuScreens.map((screen) => (
                      <li
                        key={screen.id}
                        className="flex items-center gap-3 border-t border-border/60 px-4 py-2.5 pl-10 text-sm"
                      >
                        <span className="text-muted-foreground/50">└</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {screen.pageId}
                        </span>
                        <span className="text-foreground">{screen.pageName}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        title="메뉴 구조"
        description="사이트 전체 메뉴를 트리로 정리해요. 메뉴 아래에 어떤 화면들이 들어가는지 한눈에 볼 수 있어요."
        downloads={["PPT로 다운로드", "엑셀로 다운로드"]}
      />
      {!hasContent ? (
        <DeliverableEmpty projectId={projectId} />
      ) : (
        <DiagramOrList definition={treeDef}>{listView}</DiagramOrList>
      )}
    </div>
  );
}
