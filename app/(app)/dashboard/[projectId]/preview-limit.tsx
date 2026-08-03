// 산출물 미리보기는 앞부분만 보여준다.
//
// 미리보기는 무료고 다운로드는 크레딧을 쓴다. 화면에서 전부 읽을 수 있으면
// 파일을 받을 이유가 없어져서, 그룹마다 앞 3개만 보여주고 나머지는 개수만 알린다.
// 자르는 곳: 화면목록 · 기능정의서 · WBS · FLOW (메뉴 구조는 뼈대라 전부 보여준다)

import { Lock } from "lucide-react";

/** 한 그룹에서 보여줄 개수 */
export const PREVIEW_PER_GROUP = 3;

/** 앞 N개만 남기고, 몇 개가 잘렸는지 함께 돌려준다. */
export function limited<T>(list: T[], n: number = PREVIEW_PER_GROUP): { shown: T[]; hidden: number } {
  return { shown: list.slice(0, n), hidden: Math.max(0, list.length - n) };
}

// 남은 개수는 적지 않는다. "1개 남았다"처럼 적으면 아껴 둔 티가 나고,
// 숫자가 작을 땐 오히려 받을 이유가 없어 보인다.

/** 잘린 뒤 붙이는 안내 한 줄. 표 안이면 <tr>로 감싸야 하므로 colSpan을 준다. */
export function MoreRow({ hidden, colSpan, what }: { hidden: number; colSpan: number; what: string }) {
  if (hidden <= 0) return null;
  return (
    <tr className="border-t border-border/60 bg-muted/20">
      <td colSpan={colSpan} className="px-4 py-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Lock className="size-3.5 shrink-0" />
          다운로드하여 전체 {what}을 확인해 보세요.
        </span>
      </td>
    </tr>
  );
}

/** 표가 아닌 목록에서 쓰는 같은 안내. */
export function MoreNote({ hidden, what }: { hidden: number; what: string }) {
  if (hidden <= 0) return null;
  return (
    <p className="flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
      <Lock className="size-3.5 shrink-0" />
      다운로드하여 전체 {what}을 확인해 보세요.
    </p>
  );
}
