"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { unlockDownloadAction } from "./[projectId]/download-actions";

function safeFileName(concept: string): string {
  return (concept || "프로젝트").trim().slice(0, 30).replace(/[\\/:*?"<>|]/g, "_");
}

// "전체 다운로드" — 프로젝트의 모든 산출물을 zip 하나로 묶어 내려받는다.
// 무거운 라이브러리(xlsx/jszip/pptxgenjs)는 클릭 시점에 동적 로딩.
// creditsOpen이 켜져 있고 아직 안 열린 프로젝트면, 먼저 크레딧을 차감해 잠금을 연다.
export function ZipAllButton({
  projectId,
  large,
  credits,
  unlocked,
  creditsOpen,
}: {
  projectId: string;
  large?: boolean;
  credits?: number;
  unlocked?: boolean;
  creditsOpen?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  // 크레딧을 내야 열리는 상태인가(결제 켜짐 + 아직 안 열림 + 원가 있음).
  const gated = !!creditsOpen && !unlocked && (credits ?? 0) > 0;

  async function handleDownload(e: MouseEvent) {
    // <summary> 안에 놓여도 클릭 시 폴드가 접히지 않도록.
    e.stopPropagation();
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      if (gated) {
        const r = await unlockDownloadAction(projectId);
        if (!r.ok) {
          setBusy(false);
          // 부족 알림은 버튼 옆이 아니라 알럿으로 — 레이아웃이 흔들리지 않게.
          if (r.reason === "insufficient") {
            if (window.confirm("크레딧이 부족해요. 충전 페이지로 갈까요?")) {
              router.push("/dashboard/billing");
            }
          } else {
            setError(true);
          }
          return;
        }
        router.refresh(); // 잠금 해제 상태를 화면에 반영
      }
      const res = await fetch(`/api/projects/${projectId}/export-data`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      const [{ default: JSZip }, XLSX, rowsLib, flowLib, pptLib, specLib, reqLib] = await Promise.all([
        import("jszip"),
        import("xlsx"),
        import("@/lib/export/excel-rows"),
        import("@/lib/export/flow-export"),
        import("@/lib/export/ppt-export"),
        import("@/lib/export/spec-pack"),
        import("@/lib/export/requirements"),
      ]);

      const { menus, screens, buttonActions, concept } = data;
      const base = safeFileName(concept);

      const sheetBuf = (rows: Record<string, string | number>[], name: string) => {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, name);
        return XLSX.write(wb, { type: "array", bookType: "xlsx" });
      };

      const scrIds = new Set(screens.map((s: { id: string }) => s.id));
      const flowNodes = screens.map((s: { id: string; pageName: string; pageId: string }) => ({
        id: s.id,
        pageName: s.pageName,
        pageId: s.pageId,
      }));
      const flowEdges = buttonActions
        .filter(
          (b: { screenId: string; targetScreenId: string }) =>
            scrIds.has(b.screenId) && scrIds.has(b.targetScreenId),
        )
        .map((b: { screenId: string; targetScreenId: string; label: string }) => ({
          from: b.screenId,
          to: b.targetScreenId,
          label: b.label,
        }));
      const pptMenus = menus.map((m: { menuCode: string; nameKo: string; id: string }) => ({
        code: m.menuCode,
        name: m.nameKo,
        screens: screens
          .filter((s: { menuId: string }) => s.menuId === m.id)
          .map((s: { pageId: string; pageName: string }) => ({
            pageId: s.pageId,
            pageName: s.pageName,
          })),
      }));

      const zip = new JSZip();
      zip.file(`메뉴구조_${base}.xlsx`, sheetBuf(rowsLib.buildMenuTreeRows(menus, screens), "메뉴구조"));
      zip.file(
        `IA_화면목록_${base}.xlsx`,
        sheetBuf(rowsLib.buildScreenListRows(menus, screens, buttonActions), "화면목록"),
      );
      zip.file(
        `기능정의서_${base}.xlsx`,
        sheetBuf(reqLib.buildRequirementRows(menus, screens), "기능정의서"),
      );
      zip.file(`WBS_${base}.xlsx`, sheetBuf(rowsLib.buildWbsRows(menus, screens), "WBS"));
      zip.file(`FLOW_${base}.html`, flowLib.buildFlowHtml(concept || "프로젝트", flowNodes, flowEdges));
      zip.file(`FLOW_${base}.drawio`, flowLib.buildDrawioXml(flowNodes, flowEdges));

      const pptx = pptLib.createMenuPptx("사이트 전체", pptMenus);
      const pptBuf = (await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer;
      zip.file(`메뉴구조_${base}.pptx`, pptBuf);

      // AI 빌드용 스펙팩(마크다운 + JSON)
      const specProject = data.project ?? { concept, designConcept: "", deviceMode: "responsive", overallStart: "", overallEnd: "" };
      zip.file(
        `스펙팩_${base}.md`,
        specLib.buildSpecPackMarkdown(specProject, menus, screens, buttonActions),
      );
      zip.file(
        `스펙팩_${base}.json`,
        specLib.buildSpecPackJson(specProject, menus, screens, buttonActions),
      );

      // 상세 디자인 시스템 문서 — 프리셋을 생성(설정 저장)한 프로젝트에만 담는다.
      if (specProject.presetConfig) {
        const { parsePresetConfig, buildDetailedPresetMarkdown } = await import("@/lib/design-presets");
        const presetCfg = parsePresetConfig(specProject.presetConfig, specProject.designConcept);
        zip.file(`디자인시스템_${base}.md`, buildDetailedPresetMarkdown(presetCfg, concept || undefined));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}_산출물.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      title={error ? "다운로드에 실패했어요. 다시 시도해 주세요." : "모든 산출물을 zip으로 내려받기"}
      className={`inline-flex items-center gap-2 rounded-lg border border-primary bg-transparent font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-60 ${
        large ? "px-4 py-2 text-sm" : "gap-1.5 px-2.5 py-1 text-xs"
      }`}
    >
      {busy ? (
        <Loader2 className={`${large ? "size-4" : "size-3"} animate-spin`} />
      ) : (
        <Download className={large ? "size-4" : "size-3"} />
      )}
      전체 다운로드
      {gated && <span className="text-xs text-primary/70">· {credits}크레딧</span>}
    </button>
  );
}
