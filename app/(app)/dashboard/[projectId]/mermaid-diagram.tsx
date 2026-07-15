"use client";

import { useEffect, useId, useRef, useState } from "react";

// mermaid 정의(문자열)를 받아 SVG 다이어그램으로 렌더링한다.
export function MermaidDiagram({ definition }: { definition: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const rawId = useId();
  const safeId = `mmd${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          flowchart: { htmlLabels: true, curve: "basis", nodeSpacing: 40, rankSpacing: 55 },
        });
        const { svg } = await mermaid.render(safeId, definition);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [definition, safeId]);

  if (error) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
        다이어그램을 그리지 못했어요. 리스트 보기로 확인해 주세요.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white p-4">
      <div ref={ref} className="flex min-w-fit justify-center [&_svg]:h-auto [&_svg]:max-w-none" />
    </div>
  );
}
