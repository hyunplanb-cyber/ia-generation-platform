"use client";

import { useState } from "react";
import { Network, List } from "lucide-react";
import { MermaidDiagram } from "./mermaid-diagram";

// 다이어그램 / 리스트 두 뷰를 토글한다. list는 서버에서 렌더된 JSX를 children으로 받는다.
export function DiagramOrList({
  definition,
  children,
}: {
  definition: string;
  children: React.ReactNode;
}) {
  const [view, setView] = useState<"diagram" | "list">("diagram");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1 self-start rounded-lg border border-border bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setView("diagram")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "diagram"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Network className="size-4" />
          다이어그램
        </button>
        <button
          type="button"
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "list"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <List className="size-4" />
          리스트
        </button>
      </div>

      {view === "diagram" ? <MermaidDiagram definition={definition} /> : children}
    </div>
  );
}
