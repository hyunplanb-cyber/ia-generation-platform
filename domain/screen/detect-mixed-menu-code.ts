import type { Menu } from "@/domain/menu/menu";
import type { Screen } from "@/domain/screen/screen";

export function detectMixedMenuCodeMenuIds(
  menus: Pick<Menu, "id" | "menuCode">[],
  screens: Pick<Screen, "menuId" | "pageId" | "deviceCode">[],
): Set<string> {
  const menuById = new Map(menus.map((menu) => [menu.id, menu]));
  const affected = new Set<string>();

  for (const screen of screens) {
    const menu = menuById.get(screen.menuId);
    if (!menu) continue;

    const issuedMenuCode = screen.pageId.slice(
      screen.deviceCode.length,
      screen.deviceCode.length + menu.menuCode.length,
    );
    if (issuedMenuCode !== menu.menuCode) {
      affected.add(menu.id);
    }
  }

  return affected;
}
