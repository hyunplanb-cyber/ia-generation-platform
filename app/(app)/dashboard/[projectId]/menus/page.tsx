import { Sparkles } from "lucide-react";
import { listMenus } from "@/application/list-menus";
import { hasNewMenus } from "@/application/has-new-menus";
import { GenerateScreensButton } from "./generate-screens-button";
import { GenerateIaButton } from "./generate-ia-button";
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
        <div className="flex flex-col gap-4 rounded-lg border border-primary/30 bg-primary-soft/40 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">컨셉을 분석해 한 번에 만들어 드려요</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                프로젝트를 만들 때 적은 컨셉과 메뉴 구성을 AI가 분석해서, 메뉴와 화면(설명·기능정의·AI
                프롬프트까지)을 자동으로 생성해요. 생성된 결과는 아래에서 자유롭게 수정할 수 있어요.
              </p>
            </div>
          </div>
          <GenerateIaButton projectId={projectId} />
          <p className="text-xs text-muted-foreground">
            직접 하나씩 넣고 싶다면 아래 폼으로 메뉴를 추가한 뒤 [실행: IA 생성]을 눌러도 돼요.
          </p>
        </div>
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
