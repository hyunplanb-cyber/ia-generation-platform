import { listMenus } from "@/application/list-menus";
import { hasNewMenus } from "@/application/has-new-menus";
import { GenerateScreensButton } from "./generate-screens-button";
import { MenuForm } from "./menu-form";
import { MenuListItem } from "./menu-list-item";

export default async function MenusPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const menus = await listMenus(projectId);
  const canGenerate = menus.length > 0 && (await hasNewMenus(projectId));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">메뉴 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            사이트에 필요한 메뉴를 추가해 주세요. 메뉴별로 화면이 자동 생성돼요.
          </p>
        </div>
        <GenerateScreensButton
          projectId={projectId}
          disabled={menus.length === 0}
          hasNewMenus={canGenerate}
        />
      </div>

      {menus.length === 0 ? (
        <p className="text-muted-foreground">첫 메뉴를 추가해 보세요.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {menus.map((menu, i) => (
            <MenuListItem
              key={menu.id}
              menu={menu}
              projectId={projectId}
              isFirst={i === 0}
              isLast={i === menus.length - 1}
            />
          ))}
        </ul>
      )}

      <MenuForm projectId={projectId} />
    </div>
  );
}
