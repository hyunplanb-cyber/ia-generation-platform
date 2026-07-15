"use client";

import { useEffect, useId, useRef, useState } from "react";

// mermaid 정의(문자열)를 받아 SVG 다이어그램을 "원본 크기"로 렌더링한다.
// (부모가 스크롤 컨테이너를 제공한다.)
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
          flowchart: { htmlLabels: true, curve: "basis", nodeSpacing: 45, rankSpacing: 60 },
        });
        const { svg } = await mermaid.render(safeId, definition);
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = svg;
        // mermaid는 svg에 width="100%" + max-width를 걸어 축소시킨다.
        // viewBox 기준 실제 크기로 되돌려 글씨가 읽히게 한다.
        const el = ref.current.querySelector("svg");
        if (el) {
          const vb = (el.getAttribute("viewBox") || "").split(/\s+/);
          if (vb.length === 4) {
            el.setAttribute("width", vb[2]);
            el.setAttribute("height", vb[3]);
          }
          el.style.maxWidth = "none";
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [definition, safeId]);

  if (error) {
    return <p className="text-sm text-muted-foreground">다이어그램을 그리지 못했어요.</p>;
  }

  return <div ref={ref} className="inline-block" />;
}
