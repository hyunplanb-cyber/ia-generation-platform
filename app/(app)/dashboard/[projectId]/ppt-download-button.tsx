"use client";

import { Download } from "lucide-react";
import { createMenuPptx, type PptMenu } from "@/lib/export/ppt-export";

// 메뉴 구조를 조직도 형태의 1장짜리 PPT로 내려받는다.
export function PptDownloadButton({
  filename,
  rootLabel,
  menus,
  label = "PPT로 다운로드",
}: {
  filename: string;
  rootLabel: string;
  menus: PptMenu[];
  label?: string;
}) {
  async function handleDownload() {
    const pptx = createMenuPptx(rootLabel, menus);
    await pptx.writeFile({ fileName: filename });
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
