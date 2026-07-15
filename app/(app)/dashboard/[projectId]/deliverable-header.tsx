import { Download, Sparkles, type LucideIcon } from "lucide-react";

const TONE: Record<string, string> = {
  violet: "bg-primary-soft text-primary-on-soft",
  mint: "bg-pastel-mint text-pastel-mint-foreground",
  yellow: "bg-pastel-yellow text-pastel-yellow-foreground",
  lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
};

// 산출물 페이지 공통 헤더 — 아이콘 칩 + 큰 타이틀 + 다운로드를 담은 카드형 배너.
export function DeliverableHeader({
  icon: Icon,
  tone = "violet",
  title,
  description,
  downloads,
  meta,
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONE | string;
  title: string;
  description: string;
  // 형식마다 별도 버튼(예: ["PPT로 다운로드", "엑셀로 다운로드"])
  downloads: string[];
  // 개수·요약 배지 등 (선택)
  meta?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft/40 via-background to-background p-6">
      <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${TONE[tone] ?? TONE.violet}`}
          >
            <Icon className="size-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              생성 산출물
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
            {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {downloads.map((label) => (
            <button
              key={label}
              type="button"
              disabled
              title="다운로드 기능은 준비 중이에요"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground opacity-80 shadow-sm backdrop-blur"
            >
              <Download className="size-4" />
              {label}
              <span className="text-xs opacity-70">(준비 중)</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 개수 배지 — 헤더 meta 슬롯에 넣는 작은 칩.
export function HeaderStat({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
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
