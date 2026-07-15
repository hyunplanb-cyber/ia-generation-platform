import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";

// mermaid 라벨에 들어갈 텍스트를 안전하게 정리한다(따옴표·특수문자 제거).
function esc(text: string): string {
  return text.replace(/["#]/g, "").replace(/[\r\n]+/g, " ").trim();
}

// FLOW → 화면 노드 + 버튼 클릭 이동 화살표(flowchart LR)
export function buildFlowDef(screens: Screen[], buttonActions: ButtonAction[]): string {
  const idOf = new Map<string, string>();
  screens.forEach((s, i) => idOf.set(s.id, `n${i}`));

  const lines = ["flowchart LR"];
  screens.forEach((s) => {
    lines.push(`  ${idOf.get(s.id)}["${esc(s.pageName)}<br/>${esc(s.pageId)}"]`);
  });
  for (const ba of buttonActions) {
    const from = idOf.get(ba.screenId);
    const to = idOf.get(ba.targetScreenId);
    if (!from || !to) continue; // 대상이 목록에 없으면(격리/삭제) 화살표 생략
    lines.push(`  ${from} -->|"${esc(ba.label)}"| ${to}`);
  }
  lines.push("  classDef node fill:#ffffff,stroke:#8b7dff,color:#333;");
  screens.forEach((s) => lines.push(`  class ${idOf.get(s.id)} node;`));
  return lines.join("\n");
}
