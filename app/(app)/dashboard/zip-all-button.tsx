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
  /* ⭐ 다듬기(enrich) 결과를 손님에게 알린다 (2026-08-18 사장님 지시).
   *   전에는 결과를 통째로 버렸다(try { await fetch } catch {}). 그래서 우리 회사
   *   AI 잔액이 비거나 시간이 넘쳐 다듬기가 실패해도 손님은 «얇은 본문»을 받고도
   *   그런 줄 몰랐다. 돈은 이미 나간 뒤다.
   *   다시 받으면 크레딧은 안 빠지고(이미 풀린 프로젝트) 실패한 것만 다시 하므로,
   *   알려 주기만 하면 손님이 스스로 고칠 수 있다. */
  const [다듬기결과, set다듬기결과] = useState<{ 못한화면: number } | null>(null);
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
      set다듬기결과(null);
      try {
        const r = await fetch(`/api/projects/${projectId}/enrich`, { method: "POST" });
        const 결과 = await r.json().catch(() => null);
        /* 통째로 실패(ok:false)했거나 묶음 일부가 실패했으면 숫자로 알린다.
           «다시 받으면 됩니다»가 핵심이다 — 그게 사실이고 크레딧도 더 안 빠진다. */
        if (결과 && 결과.ok === false) set다듬기결과({ 못한화면: 0 });
        else if (결과 && 결과.ok && Number(결과.failedChunks) > 0) {
          const 남은 = Number(결과.total ?? 0) - (Number(결과.enriched ?? 0) + Number(결과.skipped ?? 0));
          set다듬기결과({ 못한화면: Math.max(0, 남은) });
        }
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

      /* ⭐ 파일 이름은 «번호 + 무엇인지»만 쓴다 — 판매팩과 똑같이 (2026-08-14 사장님 지시).
         전에는 `IA_화면목록_나는 펫 유치원을 운영하고 있어. 반려동물 유치원사이트.xlsx` 처럼
         손님이 적은 컨셉이 파일마다 따라붙었다. 길고, 읽기 나쁘고, 판매팩과 딴판이었다.
         **프로젝트 이름은 zip 파일 이름 한 곳에만 둔다** — 판매팩도 폴더 이름이 그 몫을 한다.

         ⚠ 덤으로 2026-08-11 의 사고가 «구조적으로» 사라졌다. 컨셉에 줄바꿈이 들어가면
           윈도우가 그 이름의 파일을 못 만들어 압축을 풀 때 조용히 빠졌는데,
           이제 안쪽 파일 이름에 손님 글이 아예 안 들어간다. */
      const zip = new JSZip();
      zip.file("01_메뉴구조.xlsx", sheetBuf(rowsLib.buildMenuTreeRows(menus, screens), "메뉴구조"));
      zip.file(
        "02_IA_화면목록.xlsx",
        sheetBuf(
          rowsLib.buildScreenListRows(menus, screens, buttonActions),
          "화면목록",
          verifyLib.SCREEN_LIST_NOTE,
        ),
      );
      zip.file(
        "03_기능정의서.xlsx",
        sheetBuf(reqLib.buildRequirementRows(menus, screens), "기능정의서"),
      );
      zip.file("04_WBS.xlsx", sheetBuf(rowsLib.buildWbsRows(menus, screens), "WBS"));
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
        "05_FLOW_흐름도.html",
        flowGroups.length > 0
          ? flowLib.buildFlowHtmlTabs(concept || "프로젝트", flowGroups)
          : flowLib.buildFlowHtml(concept || "프로젝트", flowNodes, flowEdges),
      );
      zip.file(
        "05_FLOW_흐름도.drawio",
        flowGroups.length > 0
          ? flowLib.buildDrawioTabs(flowGroups)
          : flowLib.buildDrawioXml(flowNodes, flowEdges),
      );

      const pptx = pptLib.createMenuPptx("사이트 전체", pptMenus);
      const pptBuf = (await pptx.write({ outputType: "arraybuffer" })) as ArrayBuffer;
      zip.file("06_메뉴구조.pptx", pptBuf);

      // AI 빌드용 스펙팩(마크다운 + JSON)
      const specProject = data.project ?? { concept, designConcept: "", deviceMode: "responsive", overallStart: "", overallEnd: "" };
      zip.file(
        "07_AI빌드_스펙팩.md",
        specLib.buildSpecPackMarkdown(specProject, menus, screens, buttonActions),
      );
      zip.file(
        "07_AI빌드_스펙팩.json",
        specLib.buildSpecPackJson(specProject, menus, screens, buttonActions),
      );

      /* 디자인 프리셋(선택) — 판매팩과 «똑같은 열한 개»를 담는다 (2026-08-14 사장님 지적).
         전에는 `디자인시스템_<제목>.md` 한 장뿐이었다. 판매팩은 가이드 3벌(md+json) ·
         레이아웃 2벌(md+json) · 미리보기 = 11개다.
         사장님: 「디자인 프리셋은 비용을 들여 만드는 것이라 판매팩처럼 나와야 한다.」

         손님이 고른 색·뼈대를 «맨 앞»에 두고, 나머지를 채워 3벌 × 2벌로 만든다.
         판매팩이 파는 값어치가 「3 × 2 = 여섯 가지로 섞어 쓴다」이므로 같은 값을 드린다.

         ⚠ 만드는 코드는 `lib/preset-pack.ts` 한 곳에 있다 — 판매팩을 굽는
           build-design-presets.mts 도 같은 것을 부른다. 두 곳에 적으면 반드시 갈린다. */
      if (withPreset && presetConfig) {
        const { parsePresetConfig, buildDetailedPresetMarkdown, DESIGN_OPTIONS, LAYOUTS } =
          await import("@/lib/design-presets");
        const { buildPresetPack } = await import("@/lib/preset-pack");
        const cfg = parsePresetConfig(presetConfig, designConcept ?? null);

        const 채우기 = (고른것: (string | undefined)[], 모두: string[], 몇: number) =>
          [...new Set([...고른것.filter(Boolean) as string[], ...모두])].slice(0, 몇);
        const styles = 채우기([cfg.style, cfg.styleB], DESIGN_OPTIONS.map((d) => d.key), 3);
        const layouts = 채우기([cfg.layout], LAYOUTS.map((l) => l.key), 2);

        for (const { name, text } of buildPresetPack({ styles, layouts })) {
          zip.file(`디자인프리셋/${name}`, text);
        }
        // 프로젝트에 맞춘 상세 설명은 그대로 함께 넣는다 — 프리셋 3벌이 못 담는 «이 사이트» 이야기다.
        zip.file("디자인프리셋/00_이 프로젝트에 맞춘 설명.md", buildDetailedPresetMarkdown(cfg, concept || undefined));
      }

      /* ⛔⛔ 2026-08-18: 손님이 받는 검수 시나리오가 «다른 물건»이었다.
         여기는 verifyReport(라이브 사이트를 돌며 채운 검수 «제품»의 결과)를 넣고 있었다.
         그래서 팩에 든 08_검수시나리오.xlsx 를 판매팩의 것과 견주니 —

           판매팩   테스트ID·메뉴·화면·화면ID·확인 항목·확인 방법·기대 결과   785줄
           손님것   테스트ID·페이지·화면구분·테스트영역·테스트 방법          1,022줄
                    화면ID 칸 없음 · 기대 결과 칸 없음 · 페이지 칸 1,022줄 전부 빈칸
                    공통 점검(SCN-000) 0줄

         「기대 결과」가 없으면 본 사람이 PASS/FAIL 을 못 고른다 — 점검표가 아니다
         (지침 원칙 3). 「화면ID」가 없으면 어느 화면인지도 못 짚는다.
         그리고 공통 점검(SCN-000) 열한 가지는 «뒤로가기·전체 화면 목록으로 가는 길·
         눌러도 반응 없는 버튼·이미지 자리 비율·모바일 가로 스크롤»이다 —
         우리가 사흘 동안 손으로 찾아낸 결함이 전부 그 안에 있었는데, 손님은 그 칸을
         받은 적이 없다(지침 원칙 3-2 가 2026-08-04 사고로 이미 적어 둔 것이다).

         고침: 팩에는 «설계도 기준 점검표»(buildTemplateVerifySheets)를 **늘** 넣는다.
         판매팩 여덟 벌을 만든 바로 그 함수다. 라이브 검수 결과는 그 제품의 결과물이지
         팩의 산출물이 아니다. */
      {
        const { buildTemplateVerifySheets } = await import("@/lib/export/template-verify");
        const menuNameById = new Map(menus.map((m: { id: string; nameKo: string }) => [m.id, m.nameKo]));
        const verify = buildTemplateVerifySheets(
          concept || "프로젝트",
          screens.map((s: { pageId: string; pageName: string; menuId: string; funcDef?: string; screenRole?: string }) => ({
            pageId: s.pageId,
            pageName: s.pageName,
            menuName: menuNameById.get(s.menuId) ?? "",
            funcDef: s.funcDef ?? "",
            role: s.screenRole ?? "",
          })),
        );
        const wb = XLSX.utils.book_new();
        const coverWs = XLSX.utils.aoa_to_sheet(verify.cover);
        coverWs["!cols"] = [{ wch: 3 }, { wch: 22 }, { wch: 74 }];
        XLSX.utils.book_append_sheet(wb, coverWs, "표지");
        const statusWs = XLSX.utils.aoa_to_sheet(verify.status);
        statusWs["!cols"] = [{ wch: 24 }, { wch: 46 }];
        XLSX.utils.book_append_sheet(wb, statusWs, "검수 현황");
        const scnWs = XLSX.utils.json_to_sheet(verify.scenarios);
        scnWs["!cols"] = [12, 16, 28, 12, 12, 40, 62, 10, 24].map((w) => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, scnWs, "검수 시나리오");
        zip.file("08_검수시나리오.xlsx", XLSX.write(wb, { type: "array", bookType: "xlsx" }));
      }

      /* 라이브 검수를 돌리셨으면 «그 결과»도 따로 넣는다 — 위 점검표와 다른 물건이다. */
      if (withVerify && verifyReport) {
        const { buildVerifyScenarioSheets } = await import("@/lib/export/verify-scenario");
        const { cover, status, scenarios } = buildVerifyScenarioSheets(verifyReport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cover), "표지");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(status), "검수 현황");
        if (scenarios.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(scenarios), "검수 결과");
        zip.file("08-1_검수결과(사이트).xlsx", XLSX.write(wb, { type: "array", bookType: "xlsx" }));
      }

      /* 「사이트 내놓는 법」·「앱으로 내놓는 법» — 본문 대신 «안내장»을 넣는다 (2026-08-14).
         화면까지 만들어 드려도 「내 컴퓨터에서만 보인다」에서 멈추시는 분이 많아 넣기 시작했다.

         ⚠ 전에는 본문(90KB·38KB)을 통째로 담았다. 그러면 받으신 날 글이 그대로 굳어서,
           배포 화면이 바뀌거나 앱 심사 기준이 바뀌어도 손님 파일은 옛날 글로 남는다.
           지금은 한 장짜리 안내장만 넣고 본문은 웹에 둔다 — 언제 여셔도 최신이다.
         ⚠ 판매팩과 «같은 곳»(lib/guide-links)에서 나온다. 두 곳에 적으면 갈린다. */
      const { GUIDES, buildGuideCardHtml } = await import("@/lib/guide-links");
      for (const a of GUIDES) zip.file(a.파일, buildGuideCardHtml(a));

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

      {다듬기결과 && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          <b>본문 다듬기가 다 끝나지 않았습니다.</b>
          {다듬기결과.못한화면 > 0 ? ` (화면 ${다듬기결과.못한화면}개)` : ""}
          <br />
          파일은 그대로 받으셨고, 그 화면들은 기본 본문으로 들어 있습니다.{" "}
          <b>다시 받으시면 나머지도 채워집니다 — 크레딧은 더 빠지지 않습니다.</b>
        </p>
      )}

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
