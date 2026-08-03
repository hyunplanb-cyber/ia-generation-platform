import { ArrowRight, Workflow } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { DiagramOrList } from "../diagram-or-list";
import { FlowChart } from "../flow-chart";
import { ZipAllButton } from "../../zip-all-button";
import { CREDITS_OPEN } from "@/lib/flags";
import { isDownloadUnlocked } from "@/application/download";
import { downloadCost } from "@/lib/credits";
import { PREVIEW_PER_GROUP, MoreNote } from "../preview-limit";

export default async function FlowPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { screens, buttonActions } = await getProjectScreensDetail(projectId);
  const unlocked = await isDownloadUnlocked(projectId);

  const activeScreens = screens.filter((s) => s.status === "active");
  const cost = downloadCost(activeScreens.some((s) => s.screenGroup));
  const screenById = new Map(screens.map((s) => [s.id, s]));
  const flows = buttonActions
    .map((ba) => {
      const from = screenById.get(ba.screenId);
      const to = screenById.get(ba.targetScreenId);
      return { ba, from, to };
    })
    .filter(({ from }) => from?.status === "active");

  const hasContent = flows.length > 0;

  const flowNodes = activeScreens.map((s) => ({
    id: s.id,
    pageName: s.pageName,
    pageId: s.pageId,
  }));
  const flowEdges = flows
    .filter(({ to }) => to?.status === "active")
    .map(({ ba, to }) => ({ from: ba.screenId, to: to!.id, label: ba.label }));

  // 미리보기는 출발 화면마다 앞 3개만. 어느 화면에서 어디로 가는지 감은 잡히되
  // 전체 흐름표는 파일에서 보게 한다.
  const perFrom = new Map<string, number>();
  const shownFlows = flows.filter(({ ba }) => {
    const n = (perFrom.get(ba.screenId) ?? 0) + 1;
    perFrom.set(ba.screenId, n);
    return n <= PREVIEW_PER_GROUP;
  });
  const hiddenFlows = flows.length - shownFlows.length;

  const listView = (
    <ul className="flex flex-col gap-2">
      {shownFlows.map(({ ba, from, to }) => (
        <li
          key={ba.id}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-sm"
        >
          <span className="font-medium text-foreground">{from?.pageName ?? "?"}</span>
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-on-soft">
            {ba.label}
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          {to ? (
            <span className="font-medium text-foreground">{to.pageName}</span>
          ) : (
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
              깨진 링크
            </span>
          )}
        </li>
      ))}
      {hiddenFlows > 0 && (
        <li>
          <MoreNote hidden={hiddenFlows} what="흐름" />
        </li>
      )}
    </ul>
  );

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        icon={Workflow}
        tone="mint"
        title="FLOW·흐름도"
        description="화면과 화면 사이의 이동 흐름이에요. 어느 화면의 어떤 버튼을 누르면 어디로 가는지 정리해요."
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

      {!hasContent ? (
        <DeliverableEmpty projectId={projectId} />
      ) : (
        <DiagramOrList
          diagram={<FlowChart nodes={flowNodes} edges={flowEdges} />}
          title="흐름도 다이어그램"
        >
          {listView}
        </DiagramOrList>
      )}
    </div>
  );
}
