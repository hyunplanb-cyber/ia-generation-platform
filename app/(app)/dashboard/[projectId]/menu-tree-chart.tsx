import type { Menu } from "@/domain/menu/menu";
import type { Screen } from "@/domain/screen/screen";

// 샘플(pptx)처럼: 1뎁스(메뉴)는 가로로 나란히, 2뎁스(화면)는 그 아래로 세로 스택.
// 뎁스별로 색/강약을 다르게 해 구분한다.
export function MenuTreeChart({ menus, screens }: { menus: Menu[]; screens: Screen[] }) {
  return (
    <div className="inline-flex flex-col items-center px-4 py-2">
      {/* 루트(사이트 전체) */}
      <div className="rounded-md border border-border bg-muted px-5 py-2 text-sm font-bold text-foreground">
        사이트 전체
      </div>

      {menus.length > 0 && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-start">
            {menus.map((menu, i) => {
              const menuScreens = screens.filter((s) => s.menuId === menu.id);
              const isFirst = i === 0;
              const isLast = i === menus.length - 1;
              const busClass =
                menus.length === 1
                  ? "hidden"
                  : isFirst
                    ? "left-1/2 right-0"
                    : isLast
                      ? "left-0 right-1/2"
                      : "inset-x-0";

              return (
                <div key={menu.id} className="flex flex-col items-center px-3">
                  {/* 위쪽 연결선: 가로 버스 + 세로 tick */}
                  <div className="relative h-6 w-full">
                    <div className={`absolute top-0 h-px bg-border ${busClass}`} />
                    <div className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-border" />
                  </div>

                  {/* 1뎁스: 메뉴 (강조 — 채운 색) */}
                  <div className="whitespace-nowrap rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-sm">
                    {menu.nameKo}
                    <span className="ml-1.5 font-mono text-xs opacity-75">{menu.menuCode}</span>
                  </div>

                  {/* 2뎁스: 화면들 (세로 스택, 옅은 색) */}
                  {menuScreens.length > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="h-4 w-px bg-border" />
                      {menuScreens.map((s, idx) => (
                        <div key={s.id} className="flex flex-col items-center">
                          {idx > 0 && <div className="h-2.5 w-px bg-border" />}
                          <div className="min-w-[9.5rem] rounded-md border border-border bg-background px-3 py-1.5 text-center shadow-sm">
                            <div className="text-xs font-medium text-foreground">{s.pageName}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {s.pageId}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
