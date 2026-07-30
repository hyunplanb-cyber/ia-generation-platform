import { Download, Sparkles, type LucideIcon } from "lucide-react";

const TONE: Record<string, string> = {
  violet: "bg-primary-soft text-primary-on-soft",
  mint: "bg-pastel-mint text-pastel-mint-foreground",
  yellow: "bg-muted text-muted-foreground",
  lavender: "bg-muted text-muted-foreground",
};

// 산출물 페이지 공통 헤더 — 상단 탭이 이미 페이지를 나타내므로, 여기서는
// 작은 아이콘 + 설명 문구 + 다운로드만 컴팩트하게(세로 공간 최소화).
export function DeliverableHeader({
  icon: Icon,
  tone = "violet",
  title,
  description,
  downloads,
  meta,
  actions,
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONE | string;
  title: string;
  description: string;
  // 아직 준비 중인 형식(비활성 버튼으로 표시). 예: ["PPT로 다운로드"]
  downloads: string[];
  // 개수·요약 배지 등 (선택)
  meta?: React.ReactNode;
  // 실제로 동작하는 다운로드 버튼 등(선택) — 준비 중 버튼보다 앞에 노출
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      {/* 페이지명은 상단 탭이 이미 강조하므로, 여기선 접근성용으로만 두고 설명 문구만 노출 */}
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <h1 className="sr-only">{title}</h1>
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-md ${TONE[tone] ?? TONE.violet}`}
        >
          <Icon className="size-3.5" />
        </span>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        {meta}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {actions}
        {downloads.map((label) => (
          <button
            key={label}
            type="button"
            disabled
            title="다운로드 기능은 준비 중이에요"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Download className="size-4" />
            {label}
            <span className="text-xs font-normal opacity-60">(준비 중)</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 개수 배지 — 타이틀 옆에 붙는 작은 칩.
export function HeaderStat({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {label}
    </span>
  );
}

export function DeliverableEmpty({ projectId }: { projectId: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary-on-soft">
        <Sparkles className="size-6" />
      </span>
      <p className="text-sm text-muted-foreground">
        아직 생성된 산출물이 없어요.{" "}
        <a
          href={`/dashboard/${projectId}/brief`}
          className="font-medium text-primary underline"
        >
          주요 메뉴·디자인 컨셉
        </a>{" "}
        화면에서 <b className="font-semibold text-foreground">[컨셉 분석해서 자동 생성]</b>을 실행하면
        여기에 채워져요.
      </p>
    </div>
  );
}
