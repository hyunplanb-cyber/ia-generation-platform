"use client";

import { useEffect, useState } from "react";
import { Network, X, ZoomIn, ZoomOut, Maximize } from "lucide-react";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.2;

// 리스트를 기본으로 보여주고, [다이어그램으로 보기]를 누르면 큰 팝업(원본 크기, 스크롤)으로 다이어그램을 띄운다.
export function DiagramOrList({
  diagram,
  title,
  children,
}: {
  diagram: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const openModal = () => {
    setZoom(1);
    setOpen(true);
  };

  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 10) / 10));
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 10) / 10));

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={openModal}
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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                  <button
                    type="button"
                    onClick={zoomOut}
                    disabled={zoom <= MIN_ZOOM}
                    aria-label="축소"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    <ZoomOut className="size-4" />
                  </button>
                  <span className="w-11 text-center text-xs font-medium tabular-nums text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={zoomIn}
                    disabled={zoom >= MAX_ZOOM}
                    aria-label="확대"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    <ZoomIn className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    aria-label="원본 크기"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Maximize className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="닫기"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto bg-white p-6">
              <div style={{ zoom }} className="w-fit">
                {diagram}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
