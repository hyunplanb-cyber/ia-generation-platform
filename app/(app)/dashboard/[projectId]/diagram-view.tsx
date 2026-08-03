"use client";

// 다이어그램을 화면에 바로 띄우는 틀.
//
// 메뉴 구조·FLOW는 목록으로 늘어놓으면 관계가 안 보이고 화면만 길어진다.
// 그림을 기본으로 보여주고, 좁으면 가로로 밀어 보게 한다. 크게 볼 땐 팝업으로.

import { useEffect, useState } from "react";
import { Maximize, X, ZoomIn, ZoomOut } from "lucide-react";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2;
const STEP = 0.2;

export function DiagramView({
  diagram,
  title,
  hint,
}: {
  diagram: React.ReactNode;
  title: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - STEP) * 10) / 10));
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + STEP) * 10) / 10));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : <span />}
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setOpen(true);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Maximize className="size-4" />
          크게 보기
        </button>
      </div>

      <div className="overflow-auto rounded-xl border border-border bg-white p-5">
        <div className="w-fit">{diagram}</div>
      </div>

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
