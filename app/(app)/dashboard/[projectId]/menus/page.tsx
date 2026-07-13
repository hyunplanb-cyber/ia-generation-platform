import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listMenus } from "@/application/list-menus";
import { MenuForm } from "./menu-form";

export default async function MenusPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const menus = await listMenus(projectId);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">메뉴 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            사이트에 필요한 메뉴를 추가해 주세요. 메뉴별로 화면이 자동 생성돼요.
          </p>
        </div>
        <Button type="button" disabled title="준비 중이에요 — 곧 만나보실 수 있어요">
          <Sparkles className="size-4" />
          실행: IA 생성
        </Button>
      </div>

      {menus.length === 0 ? (
        <p className="text-muted-foreground">첫 메뉴를 추가해 보세요.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {menus.map((menu) => (
            <li
              key={menu.id}
              className="flex flex-col gap-1 rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-sm bg-pastel-lavender px-2 py-0.5 font-mono text-xs font-medium text-pastel-lavender-foreground">
                  {menu.menuCode}
                </span>
                <span className="font-semibold text-foreground">{menu.nameKo}</span>
                <span className="text-sm text-muted-foreground">({menu.nameEn})</span>
              </div>
              {menu.description && (
                <p className="text-sm text-muted-foreground">{menu.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <MenuForm projectId={projectId} />
    </div>
  );
}
