"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

// 페이지에 이미 있는 데이터로 클라이언트에서 엑셀을 만들어 바로 내려받는다.
// rows: [{ "컬럼명": 값, ... }] — 키 순서가 그대로 열 순서가 된다.
export function ExcelDownloadButton({
  filename,
  sheetName,
  rows,
  colWidths,
  label = "엑셀로 다운로드",
}: {
  filename: string;
  sheetName: string;
  rows: Record<string, string | number>[];
  colWidths?: number[];
  label?: string;
}) {
  function handleDownload() {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    if (colWidths) {
      worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
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
