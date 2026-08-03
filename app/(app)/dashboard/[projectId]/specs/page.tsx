import { FileText } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { DeliverableHeader, DeliverableEmpty } from "../deliverable-header";
import { ZipAllButton } from "../../zip-all-button";
import { CREDITS_OPEN } from "@/lib/flags";
import { isDownloadUnlocked } from "@/application/download";
import { downloadCost } from "@/lib/credits";
import { buildRequirements, type ReqType } from "@/lib/export/requirements";
import { FoldList } from "../fold";

const TYPE_BADGE: Record<ReqType, string> = {
  기능: "bg-primary-soft text-primary-on-soft",
  콘텐츠: "bg-pastel-mint text-pastel-mint-foreground",
  "UI/UX": "bg-muted text-muted-foreground",
  정책: "bg-warning-soft text-warning",
  기타: "bg-neutral-badge-soft text-neutral-badge",
};

export default async function SpecsPage({
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
  const requirements = buildRequirements(menus, activeScreens);
  const hasContent = requirements.length > 0;

  // 전부 보여주되 업무(메뉴) 단위로 접는다. 요건이 400개면 펼쳐 두는 것만으로
  // 화면이 수십 번 스크롤할 길이가 된다.
  const byWork = new Map<string, typeof requirements>();
  for (const r of requirements) {
    const arr = byWork.get(r.업무);
    if (arr) arr.push(r);
    else byWork.set(r.업무, [r]);
  }
  const cost = downloadCost(activeScreens.some((s) => s.screenGroup));

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
        <FoldList
          items={[...byWork.entries()].map(([업무, list]) => ({
            key: 업무,
            title: 업무,
            meta: `요건 ${list.length}개`,
            body: (
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">요구사항ID</th>
                      <th className="px-4 py-2.5 font-semibold">기능</th>
                      <th className="px-4 py-2.5 font-semibold">구성 (세부 요건)</th>
                      <th className="px-4 py-2.5 font-semibold">유형</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={r.reqId} className="border-t border-border/60 align-top">
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="font-mono text-xs text-muted-foreground">{r.reqId}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-foreground">{r.기능}</td>
                        <td className="px-4 py-3 text-foreground">{r.구성}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[r.유형]}`}
                          >
                            {r.유형}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ),
          }))}
          flush
        />
      )}
    </div>
  );
}
