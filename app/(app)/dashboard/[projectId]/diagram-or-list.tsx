"use client";

import { useEffect, useState } from "react";
import { Network, X } from "lucide-react";
import { MermaidDiagram } from "./mermaid-diagram";

// 리스트를 기본으로 보여주고, [다이어그램으로 보기]를 누르면 큰 팝업(원본 크기, 스크롤)으로 다이어그램을 띄운다.
export function DiagramOrList({
  definition,
  title,
  children,
}: {
  definition: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Network className="size-4" />
        다이어그램으로 보기
      </button>

      {children}

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/50 p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="font-semibold text-foreground">{title}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-white p-6">
              <MermaidDiagram definition={definition} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
