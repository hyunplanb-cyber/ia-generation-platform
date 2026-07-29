"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import type { VerificationReport } from "@/domain/verify/report";
import { buildVerifyScenarioSheets } from "@/lib/export/verify-scenario";
import { unlockVerifyDownloadAction } from "./verify-download-actions";

// 검수 결과를 "검수 시나리오 및 결과서" 엑셀(.xlsx)로 내려받는다.
// 표지 / 검수 현황 / 검수 시나리오 3개 시트로 구성.
// creditsOpen + verifyRunId + 아직 안 열림이면, 먼저 크레딧을 차감해 잠금을 연다(한 번 열면 계속 무료).
export function VerifyScenarioDownloadButton({
  report,
  marks,
  label = "검수 시나리오",
  verifyRunId,
  credits,
  unlocked,
  creditsOpen,
  className,
}: {
  report: VerificationReport;
  // 사용자가 직접 확인하며 고른 PASS/FAIL/WARN. 결과 칸에 채워진다.
  marks?: Record<string, string>;
  label?: string;
  verifyRunId?: string;
  credits?: number;
  unlocked?: boolean;
  creditsOpen?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // 크레딧을 내야 열리는 상태인가(결제 켜짐 + 검수기록 id 있음 + 아직 안 열림 + 원가 있음).
  const gated = !!creditsOpen && !!verifyRunId && !unlocked && (credits ?? 0) > 0;

  function writeFile() {
    const { filename, cover, status, scenarios } = buildVerifyScenarioSheets(report, marks);
    const wb = XLSX.utils.book_new();

    const coverWs = XLSX.utils.aoa_to_sheet(cover);
    coverWs["!cols"] = [{ wch: 3 }, { wch: 14 }, { wch: 72 }];
    XLSX.utils.book_append_sheet(wb, coverWs, "표지");

    const statusWs = XLSX.utils.aoa_to_sheet(status);
    statusWs["!cols"] = [{ wch: 22 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, statusWs, "검수 현황");

    const scnWs = scenarios.length
      ? XLSX.utils.json_to_sheet(scenarios)
      : XLSX.utils.aoa_to_sheet([
          ["테스트ID", "페이지", "화면구분", "테스트영역", "테스트 방법", "결과", "비고"],
        ]);
    scnWs["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 16 },
      { wch: 24 },
      { wch: 52 },
      { wch: 8 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, scnWs, "검수 시나리오");

    XLSX.writeFile(wb, filename);
  }

  async function handleClick(e: React.MouseEvent) {
    // <summary> 안에 놓여도 클릭 시 폴드가 접히지 않도록 전파를 막는다.
    e.stopPropagation();
    e.preventDefault();
    if (busy) return;

    if (gated) {
      setBusy(true);
      try {
        const r = await unlockVerifyDownloadAction(verifyRunId!);
        if (!r.ok) {
          if (r.reason === "insufficient") {
            if (window.confirm("크레딧이 부족해요. 충전 페이지로 갈까요?")) {
              router.push("/dashboard/billing");
            }
          } else {
            window.alert("다운로드에 실패했어요. 다시 시도해 주세요.");
          }
          return;
        }
        router.refresh();
      } catch {
        window.alert("결제 처리 중 문제가 있었어요. 잠시 후 다시 시도해 주세요.");
        return;
      } finally {
        setBusy(false);
      }
    }
    writeFile();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={
        className ??
        "inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
      }
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
      {label}
      {gated && <span className="text-xs opacity-75">· {credits}크레딧</span>}
    </button>
  );
}
