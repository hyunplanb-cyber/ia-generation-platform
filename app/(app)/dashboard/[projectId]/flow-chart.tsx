// 화면 이동 흐름을 "왼쪽 → 오른쪽" 레이어드 플로우차트로 그린다.
// 메뉴 구조 조직도와 같은 카드 스타일을 쓰고, 좌표를 직접 계산해 화살표가 항상 맞게 한다.
// (mermaid 자동 배치가 엉키던 문제를 없애기 위해 전용 컴포넌트로 그린다.)

export interface FlowNode {
  id: string;
  pageName: string;
  pageId: string;
}
export interface FlowEdge {
  from: string;
  to: string;
  label: string;
}

const NODE_W = 176;
const NODE_H = 58;
const COL_GAP = 104;
const ROW_GAP = 28;
const PAD = 28;

export function FlowChart({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) {
  if (nodes.length === 0) return null;

  const ids = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);

  // 1) 컬럼(깊이) 배치 — Kahn 위상정렬로 "진입점 = 0열", 이후 열을 왼쪽에서 채운다.
  const outAdj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  nodes.forEach((n) => {
    outAdj.set(n.id, []);
    indeg.set(n.id, 0);
  });
  validEdges.forEach((e) => {
    outAdj.get(e.from)!.push(e.to);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  });

  const col = new Map<string, number>();
  const remainingIn = new Map(indeg);
  // 진입 화살표가 없는 화면(홈 등)을 시작점으로. 없으면(순환) 첫 화면을 시작점으로.
  const queue: string[] = nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id);
  if (queue.length === 0) queue.push(nodes[0].id);
  queue.forEach((id) => col.set(id, 0));

  let head = 0;
  while (head < queue.length) {
    const u = queue[head++];
    const cu = col.get(u) ?? 0;
    for (const v of outAdj.get(u) ?? []) {
      col.set(v, Math.max(col.get(v) ?? 0, cu + 1));
      remainingIn.set(v, (remainingIn.get(v) ?? 1) - 1);
      if ((remainingIn.get(v) ?? 0) <= 0 && !queue.includes(v)) queue.push(v);
    }
  }
  // 순환 등으로 열이 안 정해진 화면은 예측 배치(선행 화면 다음 열).
  nodes.forEach((n) => {
    if (!col.has(n.id)) col.set(n.id, 0);
  });

  // 2) 열별로 묶고, 선행 화면들의 평균 위치(barycenter)로 세로 순서를 정해 교차를 줄인다.
  const maxCol = Math.max(...nodes.map((n) => col.get(n.id)!));
  const colNodes: FlowNode[][] = Array.from({ length: maxCol + 1 }, () => []);
  nodes.forEach((n) => colNodes[col.get(n.id)!].push(n));

  const rowIndex = new Map<string, number>();
  colNodes[0]?.forEach((n, i) => rowIndex.set(n.id, i));
  const predOf = new Map<string, string[]>();
  validEdges.forEach((e) => {
    if (!predOf.has(e.to)) predOf.set(e.to, []);
    predOf.get(e.to)!.push(e.from);
  });
  for (let c = 1; c <= maxCol; c++) {
    colNodes[c].sort((a, b) => bary(a.id) - bary(b.id));
    colNodes[c].forEach((n, i) => rowIndex.set(n.id, i));
  }
  function bary(id: string): number {
    const preds = predOf.get(id) ?? [];
    const rows = preds.map((p) => rowIndex.get(p)).filter((r): r is number => r !== undefined);
    if (rows.length === 0) return Number.MAX_SAFE_INTEGER; // 선행 없으면 아래로
    return rows.reduce((s, r) => s + r, 0) / rows.length;
  }

  // 3) 좌표 계산 — 각 열을 세로 가운데 정렬.
  const rowH = NODE_H + ROW_GAP;
  const colHeight = colNodes.map((arr) => Math.max(0, arr.length * rowH - ROW_GAP));
  const maxHeight = Math.max(...colHeight, NODE_H);

  const pos = new Map<string, { x: number; y: number }>();
  colNodes.forEach((arr, c) => {
    const offsetY = (maxHeight - colHeight[c]) / 2;
    arr.forEach((n, i) => {
      pos.set(n.id, {
        x: PAD + c * (NODE_W + COL_GAP),
        y: PAD + offsetY + i * rowH,
      });
    });
  });

  const width = PAD * 2 + (maxCol + 1) * NODE_W + maxCol * COL_GAP;
  const height = PAD * 2 + maxHeight;

  const entrySet = new Set(nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="flow-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
        </marker>
      </defs>

      {/* 화살표(연결선) */}
      {validEdges.map((e, i) => {
        const a = pos.get(e.from)!;
        const b = pos.get(e.to)!;
        const forward = b.x >= a.x;
        const x1 = forward ? a.x + NODE_W : a.x;
        const y1 = a.y + NODE_H / 2;
        const x2 = forward ? b.x : b.x + NODE_W;
        const y2 = b.y + NODE_H / 2;
        const dx = Math.max(40, Math.abs(x2 - x1) / 2);
        const c1x = forward ? x1 + dx : x1 - dx;
        const c2x = forward ? x2 - dx : x2 + dx;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const lw = e.label.length * 12 + 18;
        return (
          <g key={i}>
            <path
              d={`M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`}
              className="stroke-border"
              strokeWidth={1.5}
              fill="none"
              markerEnd="url(#flow-arrow)"
            />
            {e.label && (
              <foreignObject x={midX - lw / 2} y={midY - 13} width={lw} height={26}>
                <div className="flex justify-center">
                  <span className="whitespace-nowrap rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-on-soft">
                    {e.label}
                  </span>
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}

      {/* 화면 카드 */}
      {nodes.map((n) => {
        const p = pos.get(n.id)!;
        const isEntry = entrySet.has(n.id);
        return (
          <foreignObject key={n.id} x={p.x} y={p.y} width={NODE_W} height={NODE_H}>
            <div
              className={`flex h-full flex-col items-center justify-center rounded-md px-2 text-center shadow-sm ${
                isEntry
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-background text-foreground"
              }`}
            >
              <div className="line-clamp-2 text-xs font-semibold leading-tight">{n.pageName}</div>
              <div
                className={`font-mono text-[11px] ${isEntry ? "opacity-80" : "text-muted-foreground"}`}
              >
                {n.pageId}
              </div>
            </div>
          </foreignObject>
        );
      })}
    </svg>
  );
}
