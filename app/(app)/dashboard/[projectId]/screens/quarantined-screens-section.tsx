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
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">페이지ID</th>
              <th className="px-4 py-2 font-medium">페이지명</th>
              <th className="px-4 py-2 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {screens.map((screen) => (
              <tr key={screen.id} className="border-t border-border">
                <td className="px-4 py-2">
                  <span className="rounded-sm bg-neutral-badge-soft px-2 py-0.5 font-mono text-xs font-medium text-neutral-badge">
                    {screen.pageId}
                  </span>
                </td>
                <td className="px-4 py-2 text-foreground">{screen.pageName}</td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                    격리됨
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
