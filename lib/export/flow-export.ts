// FLOW(화면 이동)를 HTML(SVG 내장) / draw.io(mxGraph) 파일로 내보내기 위한 순수 함수들.
// 화면 위의 FlowChart와 같은 "왼→오 레이어드" 배치를 계산한다(서버·클라 공용).

export interface ExportNode {
  id: string;
  pageName: string;
  pageId: string;
}
export interface ExportEdge {
  from: string;
  to: string;
  label: string;
}

const NODE_W = 180;
const NODE_H = 60;
const COL_GAP = 110;
const ROW_GAP = 30;
const PAD = 30;

interface Pos {
  x: number;
  y: number;
}

function layout(nodes: ExportNode[], edges: ExportEdge[]) {
  const ids = new Set(nodes.map((n) => n.id));
  const valid = edges.filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);

  const outAdj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  nodes.forEach((n) => {
    outAdj.set(n.id, []);
    indeg.set(n.id, 0);
  });
  valid.forEach((e) => {
    outAdj.get(e.from)!.push(e.to);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  });

  const col = new Map<string, number>();
  const remaining = new Map(indeg);
  const queue: string[] = nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id);
  if (queue.length === 0 && nodes.length > 0) queue.push(nodes[0].id);
  queue.forEach((id) => col.set(id, 0));

  let head = 0;
  while (head < queue.length) {
    const u = queue[head++];
    const cu = col.get(u) ?? 0;
    for (const v of outAdj.get(u) ?? []) {
      col.set(v, Math.max(col.get(v) ?? 0, cu + 1));
      remaining.set(v, (remaining.get(v) ?? 1) - 1);
      if ((remaining.get(v) ?? 0) <= 0 && !queue.includes(v)) queue.push(v);
    }
  }
  nodes.forEach((n) => {
    if (!col.has(n.id)) col.set(n.id, 0);
  });

  const maxCol = Math.max(0, ...nodes.map((n) => col.get(n.id)!));
  const colNodes: ExportNode[][] = Array.from({ length: maxCol + 1 }, () => []);
  nodes.forEach((n) => colNodes[col.get(n.id)!].push(n));

  const rowIndex = new Map<string, number>();
  colNodes[0]?.forEach((n, i) => rowIndex.set(n.id, i));
  const predOf = new Map<string, string[]>();
  valid.forEach((e) => {
    if (!predOf.has(e.to)) predOf.set(e.to, []);
    predOf.get(e.to)!.push(e.from);
  });
  const bary = (id: string) => {
    const rows = (predOf.get(id) ?? [])
      .map((p) => rowIndex.get(p))
      .filter((r): r is number => r !== undefined);
    if (rows.length === 0) return Number.MAX_SAFE_INTEGER;
    return rows.reduce((s, r) => s + r, 0) / rows.length;
  };
  for (let c = 1; c <= maxCol; c++) {
    colNodes[c].sort((a, b) => bary(a.id) - bary(b.id));
    colNodes[c].forEach((n, i) => rowIndex.set(n.id, i));
  }

  const rowH = NODE_H + ROW_GAP;
  const colHeight = colNodes.map((arr) => Math.max(0, arr.length * rowH - ROW_GAP));
  const maxHeight = Math.max(NODE_H, ...colHeight);

  const pos = new Map<string, Pos>();
  colNodes.forEach((arr, c) => {
    const offsetY = (maxHeight - colHeight[c]) / 2;
    arr.forEach((n, i) => {
      pos.set(n.id, { x: PAD + c * (NODE_W + COL_GAP), y: PAD + offsetY + i * rowH });
    });
  });

  const width = PAD * 2 + (maxCol + 1) * NODE_W + maxCol * COL_GAP;
  const height = PAD * 2 + maxHeight;
  const entry = new Set(nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id));
  return { pos, width, height, valid, entry };
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// SVG 문자열(HTML 내장용).
export function buildFlowSvg(nodes: ExportNode[], edges: ExportEdge[]): string {
  if (nodes.length === 0) return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"></svg>`;
  const { pos, width, height, valid, entry } = layout(nodes, edges);

  const edgeSvg = valid
    .map((e) => {
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
      const label = e.label
        ? `<rect x="${midX - e.label.length * 4 - 6}" y="${midY - 10}" width="${e.label.length * 8 + 12}" height="20" rx="10" fill="#FBE7D3"/><text x="${midX}" y="${midY + 4}" font-size="11" fill="#B4551E" text-anchor="middle" font-family="sans-serif">${esc(e.label)}</text>`
        : "";
      return `<path d="M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}" stroke="#E2D3AE" stroke-width="1.5" fill="none" marker-end="url(#arrow)"/>${label}`;
    })
    .join("\n");

  const nodeSvg = nodes
    .map((n) => {
      const p = pos.get(n.id)!;
      const isEntry = entry.has(n.id);
      const fill = isEntry ? "#E4762C" : "#FFFFFF";
      const stroke = isEntry ? "#E4762C" : "#E2D3AE";
      const nameColor = isEntry ? "#FFFFFF" : "#1F2024";
      const idColor = isEntry ? "#FBE7D3" : "#6B6F76";
      return `<g>
  <rect x="${p.x}" y="${p.y}" width="${NODE_W}" height="${NODE_H}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
  <text x="${p.x + NODE_W / 2}" y="${p.y + 26}" font-size="13" font-weight="600" fill="${nameColor}" text-anchor="middle" font-family="sans-serif">${esc(n.pageName)}</text>
  <text x="${p.x + NODE_W / 2}" y="${p.y + 44}" font-size="11" fill="${idColor}" text-anchor="middle" font-family="monospace">${esc(n.pageId)}</text>
</g>`;
    })
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B8FA3"/>
    </marker>
  </defs>
  ${edgeSvg}
  ${nodeSvg}
</svg>`;
}

// 단독 실행 가능한 HTML 파일(SVG 내장).
export function buildFlowHtml(title: string, nodes: ExportNode[], edges: ExportEdge[]): string {
  const svg = buildFlowSvg(nodes, edges);
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)} · FLOW</title>
<style>
  body { margin: 0; font-family: sans-serif; background: #FAFAFA; color: #1F2024; }
  header { padding: 20px 28px; border-bottom: 1px solid #E7E7EA; background: #fff; }
  h1 { margin: 0; font-size: 18px; }
  p { margin: 4px 0 0; font-size: 13px; color: #6B6F76; }
  .canvas { padding: 28px; overflow: auto; }
</style>
</head>
<body>
<header><h1>${esc(title)} — 화면 이동 흐름(FLOW)</h1><p>화면과 화면 사이의 이동 흐름이에요. 진한 카드는 진입 화면입니다.</p></header>
<div class="canvas">${svg}</div>
</body>
</html>`;
}

// draw.io(diagrams.net) 파일 — 압축하지 않은 mxGraphModel.
export function buildDrawioXml(nodes: ExportNode[], edges: ExportEdge[]): string {
  const { pos, valid, entry } = layout(nodes, edges);
  const cells: string[] = [
    `<mxCell id="0"/>`,
    `<mxCell id="1" parent="0"/>`,
  ];
  const idOf = new Map<string, string>();
  nodes.forEach((n, i) => idOf.set(n.id, `n${i}`));
  nodes.forEach((n) => {
    const p = pos.get(n.id)!;
    const isEntry = entry.has(n.id);
    const style = isEntry
      ? "rounded=1;whiteSpace=wrap;html=1;fillColor=#E4762C;strokeColor=#E4762C;fontColor=#FFFFFF;"
      : "rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#E2D3AE;fontColor=#1F2024;";
    const value = esc(`${n.pageName}\n${n.pageId}`);
    cells.push(
      `<mxCell id="${idOf.get(n.id)}" value="${value}" style="${style}" vertex="1" parent="1"><mxGeometry x="${Math.round(p.x)}" y="${Math.round(p.y)}" width="${NODE_W}" height="${NODE_H}" as="geometry"/></mxCell>`,
    );
  });
  valid.forEach((e, i) => {
    cells.push(
      `<mxCell id="e${i}" value="${esc(e.label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;strokeColor=#8B8FA3;" edge="1" parent="1" source="${idOf.get(e.from)}" target="${idOf.get(e.to)}"><mxGeometry relative="1" as="geometry"/></mxCell>`,
    );
  });
  return `<mxfile><diagram name="FLOW"><mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" math="0" shadow="0"><root>
${cells.join("\n")}
</root></mxGraphModel></diagram></mxfile>`;
}
