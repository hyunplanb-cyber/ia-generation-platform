import { Workflow } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { ZipAllButton } from "../../zip-all-button";
import { CREDITS_OPEN } from "@/lib/flags";
import { isDownloadUnlocked } from "@/application/download";
import { downloadCost } from "@/lib/credits";
import { buildFlowGroups } from "@/lib/export/flow-groups";
import { FlowTabs } from "./flow-tabs";

export default async function FlowPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [{ screens, buttonActions }, menus, unlocked] = await Promise.all([
    getProjectScreensDetail(projectId),
    listMenus(projectId),
    isDownloadUnlocked(projectId),
  ]);

  const activeScreens = screens.filter((s) => s.status === "active");
  const cost = downloadCost(activeScreens.some((s) => s.screenGroup));
  const activeIds = new Set(activeScreens.map((s) => s.id));

  // 화면 118개를 한 장에 그리면 아무도 못 읽는다. 메뉴 간 이동 한 장 +
  // 메뉴별 한 장씩으로 나눈다(lib/export/flow-groups.ts).
  const moves = buttonActions
    .filter((ba) => activeIds.has(ba.screenId) && activeIds.has(ba.targetScreenId))
    .map((ba) => ({ from: ba.screenId, to: ba.targetScreenId, label: ba.label }));

  const groups = buildFlowGroups(
    menus.map((m) => ({ id: m.id, menuCode: m.menuCode, nameKo: m.nameKo })),
    activeScreens.map((s) => ({
      id: s.id,
      pageId: s.pageId,
      pageName: s.pageName,
      menuId: s.menuId,
    })),
    moves,
  );

  const hasContent = groups.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        icon={Workflow}
        tone="mint"
        title="FLOW·흐름도"
        description="화면과 화면 사이의 이동 흐름이에요. 메뉴 간 이동과 메뉴 안 이동을 나눠서 보여줘요."
        downloads={[]}
        actions={
          hasContent ? (
            <ZipAllButton
              projectId={projectId}
              large
              credits={cost}
              unlocked={unlocked}
              creditsOpen={CREDITS_OPEN}
            />
          ) : undefined
        }
      />

      {!hasContent ? <DeliverableEmpty projectId={projectId} /> : <FlowTabs groups={groups} />}
    </div>
  );
}
