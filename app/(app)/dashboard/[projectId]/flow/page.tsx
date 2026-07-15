import { ArrowRight } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";

export default async function FlowPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { screens, buttonActions } = await getProjectScreensDetail(projectId);

  const screenById = new Map(screens.map((s) => [s.id, s]));
  // PC 화면 기준의 이동만 대표로 보여준다(개념 흐름 1개당 한 줄).
  const pcFlows = buttonActions
    .map((ba) => {
      const from = screenById.get(ba.screenId);
      const to = screenById.get(ba.targetScreenId);
      return { ba, from, to };
    })
    .filter(({ from }) => from?.deviceCode === "PC");

  const hasContent = pcFlows.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        title="FLOW"
        description="화면과 화면 사이의 이동 흐름이에요. 어느 화면의 어떤 버튼을 누르면 어디로 가는지 정리해요. 화면 이동 다이어그램(draw.io) 내보내기는 준비 중이에요."
        downloadLabel="draw.io HTML로 다운로드"
      />

      {!hasContent ? (
        <DeliverableEmpty projectId={projectId} />
      ) : (
        <ul className="flex flex-col gap-2">
          {pcFlows.map(({ ba, from, to }) => (
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
        </ul>
      )}
    </div>
  );
}
