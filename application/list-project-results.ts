import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { buildRequirements, type Requirement } from "@/lib/export/requirements";

export interface ProjectResultScreen {
  id: string;
  menuId: string;
  pageId: string;
  pageName: string;
  scheduleStart: string | null;
  scheduleEnd: string | null;
}

export interface ProjectFlowEdge {
  from: string;
  to: string;
  label: string;
}

export interface ProjectResult {
  menus: { id: string; nameKo: string }[];
  screens: ProjectResultScreen[];
  requirements: Requirement[];
  flow: ProjectFlowEdge[];
}

// 완성된 프로젝트들의 산출물 미리보기 데이터를 한 번에 만든다.
// 내 프로젝트 목록에서 각 프로젝트를 펼쳐 탭으로 미리보기하기 위한 것.
export async function listProjectResults(
  projectIds: string[],
): Promise<Record<string, ProjectResult>> {
  const entries = await Promise.all(
    projectIds.map(async (id) => {
      const [{ screens, buttonActions }, menus] = await Promise.all([
        getProjectScreensDetail(id),
        listMenus(id),
      ]);
      const active = screens.filter((s) => s.status === "active");
      const nameById = new Map(active.map((s) => [s.id, s.pageName]));
      const flow: ProjectFlowEdge[] = buttonActions
        .filter((b) => nameById.has(b.screenId) && nameById.has(b.targetScreenId))
        .map((b) => ({
          from: nameById.get(b.screenId) ?? "",
          to: nameById.get(b.targetScreenId) ?? "",
          label: b.label,
        }));

      const result: ProjectResult = {
        menus: menus.map((m) => ({ id: m.id, nameKo: m.nameKo })),
        screens: active.map((s) => ({
          id: s.id,
          menuId: s.menuId,
          pageId: s.pageId,
          pageName: s.pageName,
          scheduleStart: s.scheduleStart,
          scheduleEnd: s.scheduleEnd,
        })),
        requirements: buildRequirements(menus, active),
        flow,
      };
      return [id, result] as const;
    }),
  );
  return Object.fromEntries(entries);
}
