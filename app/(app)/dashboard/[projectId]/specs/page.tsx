import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";

export default async function SpecsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { screens } = await getProjectScreensDetail(projectId);

  const activePcScreens = screens.filter((s) => s.status === "active" && s.deviceCode === "PC");
  const hasContent = activePcScreens.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        title="기능정의서"
        description="화면(기능) 단위로 요구사항ID·화면명·기능정의를 정리해요. 실무에서 쓰는 요구사항 정의서 형식으로 내려받을 수 있어요."
        downloadLabel="엑셀로 다운로드"
      />

      {!hasContent ? (
        <DeliverableEmpty projectId={projectId} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">요구사항ID</th>
                <th className="px-4 py-2 font-medium">화면명</th>
                <th className="px-4 py-2 font-medium">기능정의</th>
              </tr>
            </thead>
            <tbody>
              {activePcScreens.map((screen) => (
                <tr key={screen.id} className="border-t border-border align-top">
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{screen.pageId}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                    {screen.pageName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {screen.funcDef ? (
                      <span className="whitespace-pre-wrap">{screen.funcDef}</span>
                    ) : (
                      <span className="text-muted-foreground/50">아직 비어 있어요</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
