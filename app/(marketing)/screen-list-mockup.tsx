const rows = [
  { pageId: "PC-HOME-0001", name: "메인 홈", badge: { label: "자동생성", tone: "neutral" } },
  { pageId: "PC-PROD-0001", name: "상품 목록", badge: { label: "수정됨", tone: "neutral" } },
  { pageId: "PC-PROD-0002", name: "상품 상세", badge: { label: "깨진 링크", tone: "danger" } },
  { pageId: "MO-CART-0001", name: "장바구니", badge: { label: "정상", tone: "success" } },
] as const;

const badgeClasses: Record<string, string> = {
  neutral: "bg-neutral-badge-soft text-neutral-badge",
  danger: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
};

export function ScreenListMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md rotate-1 rounded-lg border border-border bg-surface p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">화면 리스트</p>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          실행: IA 생성
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div
            key={row.pageId}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="rounded-sm bg-pastel-lavender px-2 py-1 font-mono text-[11px] font-medium text-pastel-lavender-foreground">
                {row.pageId}
              </span>
              <span className="truncate text-sm text-foreground">{row.name}</span>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClasses[row.badge.tone]}`}
            >
              {row.badge.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>화면 4개 · AI프롬프트 4개 준비됨</span>
        <span className="font-medium text-primary-on-soft">엑셀로 내보내기 →</span>
      </div>

      <div className="absolute -right-6 -top-6 -z-10 size-24 rounded-full bg-pastel-yellow blur-2xl" />
      <div className="absolute -bottom-8 -left-8 -z-10 size-32 rounded-full bg-pastel-mint blur-2xl" />
    </div>
  );
}
