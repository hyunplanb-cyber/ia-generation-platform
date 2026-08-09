import { Network } from "lucide-react";
import { listMenus } from "@/application/list-menus";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { DiagramView } from "../diagram-view";
import { MenuTreeChart } from "../menu-tree-chart";
import { ZipAllButton } from "../../zip-all-button";
import { creditsOpenForMe } from "@/application/billing-gate";
import { isDownloadUnlocked } from "@/application/download";
import { downloadCost } from "@/lib/credits";

export default async function TreePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [menus, { screens }, unlocked] = await Promise.all([
    listMenus(projectId),
    getProjectScreensDetail(projectId),
    isDownloadUnlocked(projectId),
  ]);

  const activeScreens = screens.filter((s) => s.status === "active");
  const hasContent = menus.length > 0;
  const cost = downloadCost(activeScreens.some((s) => s.screenGroup));

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        icon={Network}
        tone="violet"
        title="메뉴 구조"
        description="사이트 전체 메뉴를 트리로 정리해요. 메뉴 아래에 어떤 화면들이 들어가는지 한눈에 볼 수 있어요."
        downloads={[]}
        actions={
          hasContent ? (
            <ZipAllButton
              projectId={projectId}
              large
              credits={cost}
              unlocked={unlocked}
              creditsOpen={(await creditsOpenForMe())}
            />
          ) : undefined
        }
      />
      {!hasContent ? (
        <DeliverableEmpty projectId={projectId} />
      ) : (
        <DiagramView
          diagram={<MenuTreeChart menus={menus} screens={activeScreens} />}
          title="메뉴 구조 다이어그램"
          fit
          hint="메뉴와 그 아래 화면을 트리로 보여줘요. 자세히 보시려면 [크게 보기]를 눌러주세요."
        />
      )}
    </div>
  );
}
