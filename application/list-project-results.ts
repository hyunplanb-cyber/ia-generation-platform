import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";

export interface ProjectResultScreen {
  id: string;
  menuId: string;
  pageId: string;
  pageName: string;
}

export interface ProjectResult {
  menus: { id: string; nameKo: string }[];
  screens: ProjectResultScreen[];
}

// 완성(생성 완료)된 프로젝트들의 결과(메뉴·화면 목록)를 한 번에 불러온다.
// 내 프로젝트 목록에서 각 프로젝트를 펼쳤을 때 인라인으로 보여주기 위한 데이터.
export async function listProjectResults(
  projectIds: string[],
): Promise<Record<string, ProjectResult>> {
  const entries = await Promise.all(
    projectIds.map(async (id) => {
      const [{ screens }, menus] = await Promise.all([
        getProjectScreensDetail(id),
        listMenus(id),
      ]);
      const result: ProjectResult = {
        menus: menus.map((m) => ({ id: m.id, nameKo: m.nameKo })),
        screens: screens
          .filter((s) => s.status === "active")
          .map((s) => ({
            id: s.id,
            menuId: s.menuId,
            pageId: s.pageId,
            pageName: s.pageName,
          })),
      };
      return [id, result] as const;
    }),
  );
  return Object.fromEntries(entries);
}
