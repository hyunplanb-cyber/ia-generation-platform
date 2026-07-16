"use client";

import { Download } from "lucide-react";

// 미리 만들어진 문자열(HTML, draw.io XML 등)을 파일로 내려받는다.
export function FileDownloadButton({
  filename,
  content,
  mime = "text/plain;charset=utf-8",
  label,
}: {
  filename: string;
  content: string;
  mime?: string;
  label: string;
}) {
  function handleDownload() {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
