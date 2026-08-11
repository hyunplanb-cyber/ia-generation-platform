"use client";

import { Fragment, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Download, Loader2, X } from "lucide-react";
import type { VerificationReport } from "@/domain/verify/report";
import { unlockBundleAction } from "./[projectId]/download-actions";
import { RefundNotice } from "@/components/refund-notice";

/* 손님이 적은 «한 줄 컨셉»을 파일 이름으로 만든다.
 *
 * ⚠ 2026-08-11 — 여기서 사고가 났다.
 *   손님이 컨셉을 **여러 줄로** 적으면 그 줄바꿈이 파일 이름 한가운데로 들어갔다.
 *     "메뉴구조_콘텐츠 랜덤 구매 사이트를 만들고 싶어 \r\n사람들이 a.xlsx"
 *   윈도우는 이름에 줄바꿈이 든 파일을 «만들지 못한다». 그래서 압축을 풀면
 *   11개 중 9개가 조용히 사라지고, 손님 눈에는 **「파일이 하나도 안 들어 있다」**로 보인다.
 *   지우거나 막지 않고 조용히 빠지기 때문에 아무도 모른다.
 *
 * 그래서 «막는 글자 목록»만으로는 부족하다. 눈에 안 보이는 글자를 먼저 걷어낸다.
 *
 * 차례가 중요하다 — 먼저 씻고 나서 자른다.
 *   전에는 `trim().slice(30).replace(...)` 라, 자른 뒤에 씻어서
 *   30자 안에 든 줄바꿈은 그대로 남았다.
 */
function safeFileName(concept: string): string {
  const 씻은것 = (concept || "")
    // 줄바꿈·탭은 «한 칸»으로. 지우면 앞뒤 낱말이 붙어 버린다.
    .replace(/[\r\n\t]+/g, " ")
    // 그 밖의 눈에 안 보이는 글자는 아예 뺀다.
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, "")
    // 윈도우·맥이 파일 이름에 못 쓰는 글자
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30)
    // 자르고 나서 끝에 남은 점·공백을 뗀다 — 윈도우가 끝의 점·공백을 싫어한다.
    .replace(/[.\s]+$/, "");
  return 씻은것 || "프로젝트";
}

// 함께 받기 항목 한 줄 — 체크 시 테두리·배경 강조 + 체크 아이콘.
function AddonRow({
  checked,
  onToggle,
  label,
  cost,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  cost: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`flex items-center justify-between gap-2 rounded-lg border-2 px-3 py-2.5 text-sm transition-colors ${
        checked ? "border-primary bg-primary-soft/20" : "border-border hover:bg-muted/40"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`flex size-4 shrink-0 items-center justify-center rounded border ${
            checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
          }`}
        >
          {checked && <Check className="size-3" />}
        </span>
        <span className="font-medium text-foreground">{label}</span>
      </span>
      <span className="text-xs font-semibold text-primary">+{cost}크레딧</span>
    </button>
  );
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
  downloadOpen,
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
  /** 다운로드 버튼만 여는 스위치. 주인은 크레딧이 닫혀 있어도 받아 봐야 한다(2026-08-11). */
  downloadOpen?: boolean;
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
  // 보강은 화면 수에 따라 1~3분까지 간다. 그동안 아무 말이 없으면 멈춘 줄 안다.
  const [polishing, setPolishing] = useState(false);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [addPreset, setAddPreset] = useState(true);
  const [addVerify, setAddVerify] = useState(true);

  /* 베타(결제 전)에는 다운로드를 아직 열지 않고 "준비 중"으로 둔다.
     ⚠ 다만 «주인»에게는 연다 — 팔기 전에 손님이 받는 그 파일을 직접 열어 봐야 한다.
     크레딧 셈(creditsOpen)과는 **일부러 갈라 둔다.** 주인에게 creditsOpen 을 켜면
     다운로드가 크레딧을 먹어서(application/download.ts) 오히려 못 받게 된다. */
  const comingSoon = !(downloadOpen ?? creditsOpen);
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
    if (comingSoon) return; // 베타 — 다운로드 준비 중
    if (needsModal) {
      setModalOpen(true);
      return;
    }
    /* 물어볼 것이 없다 = 크레딧이 꺼져 있다 = 다 «공짜»다.
       그러면 「전체 다운로드」는 이 프로젝트가 가진 것을 «전부» 담아야 한다.
       ⚠ 여기에 (false, false) 가 적혀 있었다(2026-08-11 사장님 지적).
         크레딧이 꺼져 있으면 팝업이 안 뜨고, 팝업이 안 뜨니 아무도 「함께 받기」에
         체크를 못 하고, 그래서 **만들어 둔 디자인 프리셋이 조용히 빠진 채로** 나갔다.
         사장님이 프리셋을 골라 만드셨는데 zip 에 없었다.
         「전체」라고 적어 놓고 일부만 주는 것이라 값을 안 받아도 잘못이다.
         검수 시나리오도 같은 자리에서 같이 빠지고 있었다. */
    물어보고받기(!!presetConfig, !!(verifyReport && verifyRunId));
  }

  /* 「받으면 무를 수 없다」를 «파일이 나가기 전»에 한 번 알린다 — 2026-08-10.
   *
   * 값이 빠지는 경우에만 묻는다. 이미 열어 두신 것을 다시 받는 것은
   * 새로 사는 게 아니라 «가진 것을 다시 가져가는» 것이라 물을 일이 아니다 —
   * 매번 물으면 곧 아무도 안 읽는다.
   *
   * 창을 띄우기만 하고 뒤에서 받기가 시작되면 알린 뜻이 없다.
   * 그래서 받을 조건을 들고 있다가 «동의를 누른 뒤에» 부른다. */
  const [무를수없음, set무를수없음] = useState<{ p: boolean; v: boolean } | null>(null);
  function 물어보고받기(withPreset: boolean, withVerify: boolean) {
    const 값이빠지나 = total > 0;
    if (값이빠지나) { set무를수없음({ p: withPreset, v: withVerify }); return; }
    void runDownload(withPreset, withVerify);
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

      // 파일을 만들기 전에 본문을 더 좋은 모델로 다시 쓴다.
      // 화면 구성은 그대로고 설명만 촘촘해진다 — 그래서 "다듬는 중"이라고 쓴다.
      // 실패해도 멈추지 않는다. 미리보기 그대로의 본문으로라도 파일은 나가야 한다.
      setPolishing(true);
      try {
        await fetch(`/api/projects/${projectId}/enrich`, { method: "POST" });
        // 화면에서 보던 본문도 같이 새로 고친다 — 받은 파일과 대시보드가
        // 다르면 "내가 뭘 받은 거지"가 된다.
        router.refresh();
      } catch {
        // 무시 — 아래에서 지금 있는 내용으로 zip을 만든다.
      } finally {
        setPolishing(false);
      }

      const res = await fetch(`/api/projects/${projectId}/export-data`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();

      const [{ default: JSZip }, XLSX, rowsLib, flowLib, groupLib, pptLib, specLib, reqLib, verifyLib] =
        await Promise.all([
          import("jszip"),
          import("xlsx"),
          import("@/lib/export/excel-rows"),
          import("@/lib/export/flow-export"),
          import("@/lib/export/flow-groups"),
          import("@/lib/export/ppt-export"),
          import("@/lib/export/spec-pack"),
          import("@/lib/export/requirements"),
          import("@/lib/export/template-verify"),
        ]);

      const { menus, screens, buttonActions, concept } = data;
      const base = safeFileName(concept);

      // note 를 주면 「먼저 읽어 주세요」 시트를 맨 앞에 붙인다.
      // 판매팩(build-template.mts)과 같은 순서다 — 뒤에 두면 안 본다.
      const sheetBuf = (
        rows: Record<string, string | number>[],
        name: string,
        note?: string[],
      ) => {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        if (note) {
          const nws = XLSX.utils.aoa_to_sheet(note.map((l) => [l]));
          nws["!cols"] = [{ wch: 96 }];
          XLSX.utils.book_append_sheet(wb, nws, "먼저 읽어 주세요");
        }
        XLSX.utils.book_append_sheet(wb, ws, name);
        return XLSX.write(wb, { type: "array", bookType: "xlsx" });
      };

      const scrIds = new Set(screens.map((s: { id: string }) => s.id));
      // 화면명이 "기본"·"로딩"이라 그것만 적으면 어느 메뉴의 기본인지 알 수 없다.
      const menuNameOf = new Map<string, string>(
        menus.map((m: { id: string; nameKo: string }) => [m.id, m.nameKo]),
      );
      const flowNodes = screens.map(
        (s: { id: string; pageName: string; pageId: string; menuId: string }) => ({
          id: s.id,
          pageName: `${menuNameOf.get(s.menuId) ?? "기타"} · ${s.pageName}`,
          pageId: s.pageId,
        }),
      );
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
        sheetBuf(
          rowsLib.buildScreenListRows(menus, screens, buttonActions),
          "화면목록",
          verifyLib.SCREEN_LIST_NOTE,
        ),
      );
      zip.file(
        `기능정의서_${base}.xlsx`,
        sheetBuf(reqLib.buildRequirementRows(menus, screens), "기능정의서"),
      );
      zip.file(`WBS_${base}.xlsx`, sheetBuf(rowsLib.buildWbsRows(menus, screens), "WBS"));
      // drawio는 파일 하나에 탭을 여러 개 담을 수 있다. 메뉴 간 이동 한 장 +
      // 메뉴별 한 장씩으로 나눠야 열어서 고칠 수 있는 크기가 된다.
      const flowGroups = groupLib.buildFlowGroups(
        menus.map((m: { id: string; menuCode: string; nameKo: string }) => ({
          id: m.id,
          menuCode: m.menuCode,
          nameKo: m.nameKo,
        })),
        screens.map((s: { id: string; pageId: string; pageName: string; menuId: string }) => ({
          id: s.id,
          pageId: s.pageId,
          pageName: s.pageName,
          menuId: s.menuId,
        })),
        flowEdges,
      );
      zip.file(
        `FLOW_${base}.html`,
        flowGroups.length > 0
          ? flowLib.buildFlowHtmlTabs(concept || "프로젝트", flowGroups)
          : flowLib.buildFlowHtml(concept || "프로젝트", flowNodes, flowEdges),
      );
      zip.file(
        `FLOW_${base}.drawio`,
        flowGroups.length > 0
          ? flowLib.buildDrawioTabs(flowGroups)
          : flowLib.buildDrawioXml(flowNodes, flowEdges),
      );

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

      /* 「사이트 내놓는 법」 안내서를 함께 넣는다 — 2026-08-10.
         화면까지 만들어 드려도 「내 컴퓨터에서만 보인다」에서 멈추시는 분이 많다.
         원본은 판매용_템플릿/_마케팅 한 벌이고, npm run pack 이 public/guide 로 복사한다.

         ⚠ 이것 때문에 zip 전체가 실패하면 안 된다 — 안내서는 «덤»이지 본체가 아니다.
           못 가져오면 조용히 빼고 나머지를 내려준다. */
      for (const [주소, 이름] of [
        ["/guide/deploy-guide.html", "사이트_내놓는_법.html"],
        ["/guide/app-guide.html", "앱으로_내놓는_법.html"],
      ]) {
        try {
          const 안내 = await fetch(주소);
          if (안내.ok) zip.file(이름, await 안내.arrayBuffer());
        } catch {
          // 무시 — 안내서 없이 산출물만 내려준다.
        }
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
      <RefundNotice
        open={무를수없음 !== null}
        onAgree={() => {
          const 조건 = 무를수없음!;
          set무를수없음(null);
          void runDownload(조건.p, 조건.v);
        }}
        onClose={() => set무를수없음(null)}
        agreeLabel={`동의하고 ${total}크레딧으로 받기`}
        what={`${total}크레딧이 빠지고 파일이 만들어집니다.`}
      />
      <button
        type="button"
        onClick={onClick}
        disabled={busy || comingSoon}
        title={
          comingSoon
            ? "다운로드는 준비 중이에요"
            : error
              ? "다운로드에 실패했어요. 다시 시도해 주세요."
              : "모든 산출물을 zip으로 내려받기"
        }
        className={`inline-flex items-center gap-2 rounded-lg border border-primary bg-transparent font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60 ${
          large ? "px-4 py-2 text-sm" : "gap-1.5 px-2.5 py-1 text-xs"
        }`}
      >
        {busy ? (
          <Loader2 className={`${large ? "size-4" : "size-3"} animate-spin`} />
        ) : (
          <Download className={large ? "size-4" : "size-3"} />
        )}
        {polishing ? "내용을 다듬는 중…" : "전체 다운로드"}
        {comingSoon ? (
          <span className="text-xs opacity-70">· 준비 중</span>
        ) : (
          creditsOpen &&
          !polishing && (
            <span className="text-xs text-primary/70">· {gated ? (credits ?? 0) : 0}크레딧</span>
          )
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
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground">전체 다운로드</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  함께 받을 항목을 골라주세요. 선택에 따라 크레딧이 달라져요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !busy && setModalOpen(false)}
                aria-label="닫기"
                className="-mr-1 -mt-1 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
                disabled={busy}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                <span className="font-medium text-foreground">프롬프트 산출물</span>
                <span className="text-xs font-semibold text-muted-foreground">{baseAmount}크레딧</span>
              </div>

              {offerPreset && (
                <AddonRow
                  checked={addPreset}
                  onToggle={() => setAddPreset((v) => !v)}
                  label="디자인 프리셋 함께 받기"
                  cost={presetCost ?? 0}
                />
              )}
              {offerVerify && (
                <AddonRow
                  checked={addVerify}
                  onToggle={() => setAddVerify((v) => !v)}
                  label="검수 시나리오 함께 받기"
                  cost={verifyCost ?? 0}
                />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted-foreground">합계</span>
              <span className="text-base font-extrabold text-primary">{total}크레딧</span>
            </div>

            <button
              type="button"
              onClick={() => { setModalOpen(false); 물어보고받기(offerPreset && addPreset, offerVerify && addVerify); }}
              disabled={busy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {polishing ? "내용을 다듬는 중…" : `다운로드 · ${total}크레딧`}
            </button>

            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
              화면 구성은 미리보기 그대로예요. 각 화면의 설명만 더 좋은 모델로 다시 씁니다.
              <br />
              화면이 많으면 1~2분 걸릴 수 있어요.
            </p>
          </div>
        </div>
      )}
    </Fragment>
  );
}
