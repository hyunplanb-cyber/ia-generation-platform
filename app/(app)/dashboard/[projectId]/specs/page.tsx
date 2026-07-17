import { FileText } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { ExcelDownloadButton } from "../excel-download-button";
import { buildRequirements, buildRequirementRows, type ReqType } from "@/lib/export/requirements";

function safeFileName(concept: string): string {
  return (concept || "프로젝트").trim().slice(0, 30).replace(/[\\/:*?"<>|]/g, "_");
}

const TYPE_BADGE: Record<ReqType, string> = {
  기능: "bg-primary-soft text-primary-on-soft",
  콘텐츠: "bg-pastel-mint text-pastel-mint-foreground",
  "UI/UX": "bg-pastel-lavender text-pastel-lavender-foreground",
  정책: "bg-warning-soft text-warning",
  기타: "bg-neutral-badge-soft text-neutral-badge",
};

export default async function SpecsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [menus, { project, screens }] = await Promise.all([
    listMenus(projectId),
    getProjectScreensDetail(projectId),
  ]);

  const activeScreens = screens.filter((s) => s.status === "active");
  const requirements = buildRequirements(menus, activeScreens);
  const hasContent = requirements.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        icon={FileText}
        tone="lavender"
        title="기능정의서"
        description="사이트에서 필요한 요건을 업무 · 기능 · 구성 계층으로 정리하고, 유형(기능·콘텐츠·UI/UX·정책·기타)을 붙여요."
        downloads={[]}
        actions={
          hasContent ? (
            <ExcelDownloadButton
              filename={`기능정의서_${safeFileName(project.concept)}.xlsx`}
              sheetName="기능정의서"
              rows={buildRequirementRows(menus, activeScreens)}
              colWidths={[12, 16, 18, 48, 10]}
            />
          ) : undefined
        }
      />

      {!hasContent ? (
        <DeliverableEmpty projectId={projectId} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-semibold">요구사항ID</th>
                <th className="px-4 py-2.5 font-semibold">업무</th>
                <th className="px-4 py-2.5 font-semibold">기능</th>
                <th className="px-4 py-2.5 font-semibold">구성 (세부 요건)</th>
                <th className="px-4 py-2.5 font-semibold">유형</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((r, i) => {
                // 같은 업무·기능은 첫 행에만 표기해 계층이 보이게 한다.
                const prev = requirements[i - 1];
                const 업무Code = r.reqId.split("-")[0];
                const 기능Code = r.reqId.split("-").slice(0, 2).join("-");
                const showWork = !prev || prev.reqId.split("-")[0] !== 업무Code;
                const showFn = !prev || prev.reqId.split("-").slice(0, 2).join("-") !== 기능Code;
                return (
                  <tr key={r.reqId} className="border-t border-border align-top">
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{r.reqId}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                      {showWork ? r.업무 : ""}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">
                      {showFn ? r.기능 : ""}
                    </td>
                    <td className="px-4 py-3 text-foreground">{r.구성}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[r.유형]}`}
                      >
                        {r.유형}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
