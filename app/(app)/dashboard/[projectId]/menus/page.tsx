import Link from "next/link";
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
          <h1 className="text-2xl font-bold text-foreground">메뉴 직접 편집</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            메뉴를 직접 추가·수정하고 [실행: IA 생성]으로 화면을 만들어요. 컨셉으로 한 번에
            만들려면{" "}
            <Link href={`/dashboard/${projectId}/edit`} className="font-medium text-primary underline">
              입력
            </Link>{" "}
            화면을 이용하세요.
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
