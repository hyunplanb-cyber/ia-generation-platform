import Link from "next/link";
import { TriangleAlert, LayoutList } from "lucide-react";
import { getProjectScreensDetail } from "@/application/get-project-screens-detail";
import { listMenus } from "@/application/list-menus";
import { detectMixedDeviceMode } from "@/domain/screen/detect-mixed-device-mode";
import { detectMixedMenuCodeMenuIds } from "@/domain/screen/detect-mixed-menu-code";
import { detectOutOfRangeScreens } from "@/domain/schedule/detect-out-of-range-screens";
import { detectScheduleReversals } from "@/domain/schedule/detect-schedule-reversals";
import { Bot } from "lucide-react";
import { DeliverableHeader, HeaderStat } from "../deliverable-header";
import { ExcelDownloadButton } from "../excel-download-button";
import { UpgradeToDownload } from "../upgrade-to-download";
import { canDownload } from "@/application/get-current-plan";
import { FileDownloadButton } from "../file-download-button";
import { ScreensView } from "./screens-view";
import { QuarantinedScreensSection } from "./quarantined-screens-section";
import { buildSpecPackMarkdown, buildSpecPackJson } from "@/lib/export/spec-pack";

function safeFileName(concept: string): string {
  return (concept || "프로젝트").trim().slice(0, 30).replace(/[\\/:*?"<>|]/g, "_");
}

export default async function ScreensPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { project, screens, buttonActions } = await getProjectScreensDetail(projectId);
  const menus = await listMenus(projectId);
  const downloadable = await canDownload();
  const activeScreens = screens.filter((s) => s.status === "active");
  const quarantinedScreens = screens.filter((s) => s.status === "quarantined");

  const isMixed = detectMixedDeviceMode(project.deviceMode, activeScreens);
  const mixedMenuCodeIds = detectMixedMenuCodeMenuIds(menus, activeScreens);
  const mixedMenuCodeMenus = menus.filter((menu) => mixedMenuCodeIds.has(menu.id));
  const outOfRangeIds = [
    ...detectOutOfRangeScreens(project.overallStart, project.overallEnd, activeScreens),
  ];
  const reversedIds = [...detectScheduleReversals(activeScreens)];

  // 엑셀 내보내기용 행 — 메뉴별·화면별 상세를 한 행으로.
  const menuNameById = new Map(menus.map((m) => [m.id, m.nameKo]));
  const screenNameById = new Map(activeScreens.map((s) => [s.id, s]));
  const excelRows = activeScreens.map((s) => {
    const links = buttonActions
      .filter((ba) => ba.screenId === s.id)
      .map((ba) => {
        const target = screenNameById.get(ba.targetScreenId);
        return `${ba.label} → ${target ? target.pageName : "(삭제됨)"}`;
      })
      .join("\n");
    return {
      메뉴: menuNameById.get(s.menuId) ?? "",
      화면ID: s.pageId,
      화면명: s.pageName,
      "일정 시작": s.scheduleStart ?? "",
      "일정 종료": s.scheduleEnd ?? "",
      "설명·기능정의": s.funcDef ?? "",
      "버튼 → 이동화면": links,
      "생성 프롬프트": s.prompt ?? "",
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <DeliverableHeader
        icon={LayoutList}
        tone="violet"
        title="IA · 화면 목록"
        description="메뉴별로 자동 생성된 화면 목록이에요. 각 화면의 페이지ID·일정·기능정의·이동 화면을 확인하고 수정할 수 있어요."
        downloads={[]}
        actions={
          activeScreens.length > 0 ? (
            downloadable ? (
              <ExcelDownloadButton
                filename={`IA_화면목록_${safeFileName(project.concept)}.xlsx`}
                sheetName="화면목록"
                rows={excelRows}
                colWidths={[14, 14, 22, 12, 12, 40, 30, 44]}
              />
            ) : (
              <UpgradeToDownload label="엑셀로 다운로드" />
            )
          ) : undefined
        }
        meta={
          activeScreens.length > 0 ? (
            <HeaderStat label={`총 ${activeScreens.length}개 화면`} />
          ) : undefined
        }
      />

      {activeScreens.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary-soft/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Bot className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground">AI 코딩 툴로 바로 빌드하기</h2>
              <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                컨셉·메뉴·화면별 프롬프트·이동 흐름을 한 벌로 정리한 스펙팩이에요. 이 파일을 Claude
                Code·Cowork에 그대로 주면 됩니다.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {downloadable ? (
              <>
                <FileDownloadButton
                  filename={`스펙팩_${safeFileName(project.concept)}.md`}
                  content={buildSpecPackMarkdown(project, menus, activeScreens, buttonActions)}
                  mime="text/markdown;charset=utf-8"
                  label="마크다운"
                />
                <FileDownloadButton
                  filename={`스펙팩_${safeFileName(project.concept)}.json`}
                  content={buildSpecPackJson(project, menus, activeScreens, buttonActions)}
                  mime="application/json;charset=utf-8"
                  label="JSON"
                />
              </>
            ) : (
              <UpgradeToDownload label="스펙팩 다운로드" />
            )}
          </div>
        </div>
      )}

      {isMixed && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
          <TriangleAlert className="size-4 shrink-0" />
          디바이스 대응 방식이 혼재되어 있어요. 기존 화면의 페이지ID는 그대로 유지되고, 새로 생성되는 화면부터 현재 방식이 적용돼요.
        </div>
      )}

      {mixedMenuCodeMenus.map((menu) => (
        <div
          key={menu.id}
          className="flex items-center gap-2 rounded-lg bg-warning-soft px-4 py-3 text-sm font-medium text-warning"
        >
          <TriangleAlert className="size-4 shrink-0" />
          {menu.nameKo} 메뉴에 신/구 코드가 섞여 있어요. 기존 화면의 페이지ID는 유지되고, 새로 생성되는 화면부터 새 코드가 적용돼요.
        </div>
      ))}

      {activeScreens.length === 0 ? (
        <p className="text-muted-foreground">
          아직 생성된 화면이 없어요.{" "}
          <Link href={`/dashboard/${projectId}/brief`} className="font-medium text-primary underline">
            주요 메뉴·디자인 컨셉
          </Link>{" "}
          화면에서 [컨셉 분석해서 자동 생성]을 실행해 주세요.
        </p>
      ) : (
        <ScreensView
          screens={activeScreens}
          menus={menus}
          buttonActions={buttonActions}
          projectId={projectId}
          outOfRangeIds={outOfRangeIds}
          reversedIds={reversedIds}
        />
      )}

      {quarantinedScreens.length > 0 && (
        <QuarantinedScreensSection screens={quarantinedScreens} />
      )}
    </div>
  );
}
