import type { Screen } from "@/domain/screen/screen";

export function QuarantinedScreensSection({ screens }: { screens: Screen[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">격리된 화면</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          소속 메뉴가 삭제된 화면이에요. 데이터는 삭제되지 않고 남아있어요.
        </p>
      </div>
      {/* 카드 목록 — 좁은 화면에서 표 칸이 짓눌려 한글이 세로로 쪼개지지 않게 한다. */}
      <ul className="divide-y divide-border rounded-lg border border-border text-sm">
        {screens.map((screen) => (
          <li key={screen.id} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-0.5 shrink-0 rounded-sm bg-neutral-badge-soft px-2 py-0.5 font-mono text-xs font-medium text-neutral-badge">
              {screen.pageId}
            </span>
            <span className="min-w-0 flex-1 break-keep text-foreground">{screen.pageName}</span>
            <span className="shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
              격리됨
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
