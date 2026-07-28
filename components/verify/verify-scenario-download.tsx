"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import type { VerificationReport } from "@/domain/verify/report";
import { buildVerifyScenarioSheets } from "@/lib/export/verify-scenario";

// 검수 결과를 "검수 시나리오 및 결과서" 엑셀(.xlsx)로 내려받는다.
// 표지 / 검수 현황 / 검수 시나리오 3개 시트로 구성.
export function VerifyScenarioDownloadButton({
  report,
  label = "검수 시나리오 다운로드",
}: {
  report: VerificationReport;
  label?: string;
}) {
  function handleDownload() {
    const { filename, cover, status, scenarios } = buildVerifyScenarioSheets(report);
    const wb = XLSX.utils.book_new();

    const coverWs = XLSX.utils.aoa_to_sheet(cover);
    coverWs["!cols"] = [{ wch: 3 }, { wch: 14 }, { wch: 72 }];
    XLSX.utils.book_append_sheet(wb, coverWs, "표지");

    const statusWs = XLSX.utils.aoa_to_sheet(status);
    statusWs["!cols"] = [{ wch: 22 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, statusWs, "검수 현황");

    const scnWs = scenarios.length
      ? XLSX.utils.json_to_sheet(scenarios)
      : XLSX.utils.aoa_to_sheet([["테스트ID", "화면구분", "테스트영역", "테스트 방법", "결과", "비고"]]);
    scnWs["!cols"] = [
      { wch: 12 },
      { wch: 16 },
      { wch: 24 },
      { wch: 52 },
      { wch: 8 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, scnWs, "검수 시나리오");

    XLSX.writeFile(wb, filename);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
    >
      <Download className="size-4" />
      {label}
    </button>
  );
}
