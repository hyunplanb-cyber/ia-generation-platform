"use client";

// 산출물 미리보기용 폴딩.
//
// 전에는 그룹마다 앞 3개만 보여주고 잘랐는데, 그러면 아껴 둔 티만 나고 정작
// 복붙은 못 막았다. 대신 전부 보여주되 접어 둔다. 화면이 짧아지고, 한 번에
// 하나만 열리니 전부 펼쳐 긁어가는 것도 성가시다(2026-08-03).
//
// 규칙 하나 — 열려 있는 게 있을 때 다른 걸 누르면 그게 닫힌다. 바깥을 눌러도 닫힌다.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export interface FoldItem {
  key: string;
  /** 접힌 상태에서 보이는 제목 */
  title: ReactNode;
  /** 제목 옆 작은 글씨 (예: 화면 9개) */
  meta?: ReactNode;
  /** 펼쳤을 때 나오는 내용 */
  body: ReactNode;
}

export function FoldList({
  items,
  /** 처음부터 열어 둘 항목. 없으면 전부 접힌 채로 시작한다. */
  defaultOpen,
  /** 표를 담을 때처럼 안쪽 여백이 필요 없을 때 */
  flush,
}: {
  items: FoldItem[];
  defaultOpen?: string;
  flush?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const ref = useRef<HTMLDivElement>(null);

  // 바깥을 누르면 닫는다. 열린 게 없을 땐 굳이 듣지 않는다.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-border bg-background">
      {items.map((it) => {
        const on = open === it.key;
        return (
          <div key={it.key} className="border-b border-border last:border-b-0">
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : it.key)}
              className={`flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors ${
                on ? "bg-primary-soft/40" : "hover:bg-muted/50"
              }`}
            >
              <ChevronRight
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${on ? "rotate-90" : ""}`}
              />
              <span className="min-w-0 flex-1 font-semibold text-foreground">{it.title}</span>
              {it.meta && (
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {it.meta}
                </span>
              )}
            </button>
            {on && <div className={flush ? "" : "px-4 pb-4"}>{it.body}</div>}
          </div>
        );
      })}
    </div>
  );
}
