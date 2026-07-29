"use client";

import { Fragment, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import type { VerificationReport } from "@/domain/verify/report";
import { unlockBundleAction } from "./[projectId]/download-actions";

function safeFileName(concept: string): string {
  return (concept || "프로젝트").trim().slice(0, 30).replace(/[\\/:*?"<>|]/g, "_");
}

// "전체 다운로드" — 프로젝트의 프롬프트 산출물을 zip 하나로 묶어 내려받는다.
// 아직 안 받은 디자인 프리셋·검수 시나리오가 있으면, 함께 받을지 묻는 팝업을 띄우고
// 선택에 따라 크레딧을 한 번에 차감한 뒤 한 zip으로 내려준다.
export function ZipAllButton({
  projectId,
  large,
  credits,
  unlocked,
  creditsOpen,
  presetConfig,
  designConcept,
  canAddPreset,
  presetCost,
  verifyReport,
  verifyRunId,
  canAddVerify,
  verifyCost,
}: {
  projectId: string;
  large?: boolean;
  credits?: number;
  unlocked?: boolean;
  creditsOpen?: boolean;
  presetConfig?: string | null;
  designConcept?: string | null;
  canAddPreset?: boolean;
  presetCost?: number;
  verifyReport?: VerificationReport | null;
  verifyRunId?: string | null;
  canAddVerify?: boolean;
  verifyCost?: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [addPreset, setAddPreset] = useState(true);
  const [addVerify, setAddVerify] = useState(true);

  const gated = !!creditsOpen && !unlocked && (credits ?? 0) > 0;
  const offerPreset = !!creditsOpen && !!canAddPreset && !!presetConfig;
  const offerVerify = !!creditsOpen && !!canAddVerify && !!verifyReport && !!verifyRunId;
  // 함께 받을 항목이 있거나 아직 결제 전이면 팝업으로 물어본다.
  const needsModal = !!creditsOpen && (gated || offerPreset || offerVerify);

  const baseAmount = gated ? (credits ?? 0) : 0;
  const presetAmount = offerPreset && addPreset ? (presetCost ?? 0) : 0;
  const verifyAmount = offerVerify && addVerify ? (verifyCost ?? 0) : 0;
  const total = baseAmount + presetAmount + verifyAmount;

  function onClick(e: MouseEvent) {
    // <summary> 안에 놓여도 폴드가 접히지 않도록.
    e.stopPropagation();
    e.preventDefault();
    if (needsModal) {
      setModalOpen(true);
      return;
    }
    void runDownload(false, false);
  }

  // 실제 다운로드 — 결제(묶음) 후 zip을 만들어 내려준다.
  async function runDownload(withPreset: boolean, withVerify: boolean) {
    setBusy(true);
    setError(false);
    try {
      if (creditsOpen) {
        const r = await unlockBundleAction(projectId, {
          base: true,
          preset: withPreset,
          verifyRunId: withVerify ? (verifyRunId ?? null) : null,
        });
        if (!r.ok) {
          setBusy(false);
          if (r.reason === "insufficient") {
            if (window.confirm("크레딧이 부족해요. 충전 페이지로 갈까요?")) {
              router.push("/dashboard/billing");
            }
          } else {
            setError(true);
          }
          return;
        }
        router.refresh();
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

      // 디자인 프리셋(선택) — 디자인 시스템 문서
      if (withPreset && presetConfig) {
        const { parsePresetConfig, buildDetailedPresetMarkdown } = await import("@/lib/design-presets");
        const cfg = parsePresetConfig(presetConfig, designConcept ?? null);
        zip.file(`디자인시스템_${base}.md`, buildDetailedPresetMarkdown(cfg, concept || undefined));
      }

      // 검수 시나리오(선택) — 엑셀(표지·현황·시나리오)
      if (withVerify && verifyReport) {
        const { buildVerifyScenarioSheets } = await import("@/lib/export/verify-scenario");
        const { cover, status, scenarios } = buildVerifyScenarioSheets(verifyReport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cover), "표지");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(status), "검수 현황");
        const scnWs = scenarios.length
          ? XLSX.utils.json_to_sheet(scenarios)
          : XLSX.utils.aoa_to_sheet([
              ["테스트ID", "페이지", "화면구분", "테스트영역", "테스트 방법", "결과", "비고"],
            ]);
        XLSX.utils.book_append_sheet(wb, scnWs, "검수 시나리오");
        zip.file(`검수시나리오_${base}.xlsx`, XLSX.write(wb, { type: "array", bookType: "xlsx" }));
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
      setModalOpen(false);
    }
  }

  return (
    <Fragment>
      <button
        type="button"
        onClick={onClick}
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
        {creditsOpen && (
          <span className="text-xs text-primary/70">· {gated ? (credits ?? 0) : 0}크레딧</span>
        )}
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!busy) setModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-background p-5 text-left shadow-xl"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <h3 className="text-base font-bold text-foreground">전체 다운로드</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              프롬프트 산출물과 함께 받을 항목을 골라주세요. 선택에 따라 크레딧이 달라져요.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                <span className="font-medium text-foreground">프롬프트 산출물</span>
                <span className="text-xs font-semibold text-muted-foreground">{baseAmount}크레딧</span>
              </div>

              {offerPreset && (
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted/40">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addPreset}
                      onChange={(e) => setAddPreset(e.target.checked)}
                      className="size-4 accent-primary"
                    />
                    <span className="font-medium text-foreground">디자인 프리셋 함께 받기</span>
                  </span>
                  <span className="text-xs font-semibold text-primary">+{presetCost}크레딧</span>
                </label>
              )}

              {offerVerify && (
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted/40">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addVerify}
                      onChange={(e) => setAddVerify(e.target.checked)}
                      className="size-4 accent-primary"
                    />
                    <span className="font-medium text-foreground">검수 시나리오 함께 받기</span>
                  </span>
                  <span className="text-xs font-semibold text-primary">+{verifyCost}크레딧</span>
                </label>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">합계</span>
              <span className="text-base font-extrabold text-primary">{total}크레딧</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={busy}
                className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void runDownload(offerPreset && addPreset, offerVerify && addVerify)}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                다운로드 · {total}크레딧
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}
