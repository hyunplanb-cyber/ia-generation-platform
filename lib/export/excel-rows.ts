// 각 산출물의 엑셀 행(데이터)을 만드는 순수 함수들(서버·클라 공용).
import type { Menu } from "@/domain/menu/menu";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";

type Row = Record<string, string | number>;

function daysBetween(start?: string | null, end?: string | null): number | string {
  if (!start || !end) return "";
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e)) return "";
  return Math.max(1, Math.round((e - s) / 86400000) + 1);
}

// 메뉴 구조 — 메뉴별 화면을 한 행씩. 상세(3뎁스)면 화면/상태·탭 열로 나눈다.
export function buildMenuTreeRows(menus: Menu[], screens: Screen[]): Row[] {
  const hasGroup = screens.some((s) => s.screenGroup);
  const rows: Row[] = [];
  for (const menu of menus) {
    const menuScreens = screens.filter((s) => s.menuId === menu.id);
    if (menuScreens.length === 0) {
      rows.push(
        hasGroup
          ? { 메뉴코드: menu.menuCode, 메뉴명: menu.nameKo, 화면: "", "상태·탭": "", 화면ID: "" }
          : { 메뉴코드: menu.menuCode, 메뉴명: menu.nameKo, 화면ID: "", 화면명: "" },
      );
      continue;
    }
    for (const s of menuScreens) {
      rows.push(
        hasGroup
          ? {
              메뉴코드: menu.menuCode,
              메뉴명: menu.nameKo,
              화면: s.screenGroup ?? s.pageName,
              "상태·탭": s.screenGroup ? s.pageName : "",
              화면ID: s.pageId,
            }
          : { 메뉴코드: menu.menuCode, 메뉴명: menu.nameKo, 화면ID: s.pageId, 화면명: s.pageName },
      );
    }
  }
  return rows;
}

// IA 화면 목록 — 메뉴·ID·명·일정·기능정의·버튼이동·프롬프트.
// 상세(3뎁스)면 화면(2뎁스)/상태·탭(3뎁스) 열을 분리한다.
export function buildScreenListRows(
  menus: Menu[],
  screens: Screen[],
  buttonActions: ButtonAction[],
): Row[] {
  const menuName = new Map(menus.map((m) => [m.id, m.nameKo]));
  const scrById = new Map(screens.map((s) => [s.id, s]));
  const hasGroup = screens.some((s) => s.screenGroup);
  return screens.map((s) => {
    const links = buttonActions
      .filter((ba) => ba.screenId === s.id)
      .map((ba) => {
        const t = scrById.get(ba.targetScreenId);
        return `${ba.label} → ${t ? t.pageName : "(삭제됨)"}`;
      })
      .join("\n");
    const nameCols: Row = hasGroup
      ? { 화면: s.screenGroup ?? s.pageName, "상태·탭": s.screenGroup ? s.pageName : "" }
      : { 화면명: s.pageName };
    return {
      메뉴: menuName.get(s.menuId) ?? "",
      ...nameCols,
      화면ID: s.pageId,
      "일정 시작": s.scheduleStart ?? "",
      "일정 종료": s.scheduleEnd ?? "",
      "설명·기능정의": s.funcDef ?? "",
      "버튼 → 이동화면": links,
      "생성 프롬프트": s.prompt ?? "",
    };
  });
}

// WBS — 작업(화면)별 일정.
export function buildWbsRows(menus: Menu[], screens: Screen[]): Row[] {
  const menuName = new Map(menus.map((m) => [m.id, m.nameKo]));
  const sorted = [...screens].sort((a, b) =>
    (a.scheduleStart ?? "").localeCompare(b.scheduleStart ?? ""),
  );
  return sorted.map((s, i) => ({
    순번: i + 1,
    "소속 메뉴": menuName.get(s.menuId) ?? "",
    "작업(화면)": s.pageName,
    화면ID: s.pageId,
    시작일: s.scheduleStart ?? "",
    종료일: s.scheduleEnd ?? "",
    "기간(일)": daysBetween(s.scheduleStart, s.scheduleEnd),
  }));
}
