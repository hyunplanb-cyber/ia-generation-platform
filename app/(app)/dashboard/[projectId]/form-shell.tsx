import type { LucideIcon } from "lucide-react";

// 입력폼 상단 그라데이션 히어로 — 단계 뱃지 + 진행률 바로 "지금 어디쯤"을 보여준다.
export function FormHero({
  eyebrow,
  step,
  totalSteps,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  const pct = Math.round((step / totalSteps) * 100);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-soft via-pastel-mint/50 to-pastel-yellow/40 px-7 py-8">
      {/* 장식용 블러 원 — 이미지 참고의 부드러운 컬러감 */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full bg-pastel-yellow/40 blur-3xl" />
      <div className="relative flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold text-primary-on-soft shadow-sm backdrop-blur">
          <Icon className="size-3.5" />
          {eyebrow} · STEP {step}/{totalSteps}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-foreground/70">{description}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-1.5 w-44 overflow-hidden rounded-full bg-background/60">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold text-primary-on-soft">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

const TONE: Record<string, string> = {
  violet: "bg-primary-soft text-primary-on-soft",
  mint: "bg-pastel-mint text-pastel-mint-foreground",
  yellow: "bg-pastel-yellow text-pastel-yellow-foreground",
  lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
};

// 필드 묶음 카드 — 컬러 아이콘 칩으로 구간을 구분해 "읽을 게 많은 리스트" 느낌을 줄인다.
export function FieldCard({
  icon: Icon,
  tone = "violet",
  title,
  hint,
  children,
}: {
  icon: LucideIcon;
  tone?: keyof typeof TONE | string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3.5">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${TONE[tone] ?? TONE.violet}`}
        >
          <Icon className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {hint && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
          <div className="mt-3.5">{children}</div>
        </div>
      </div>
    </div>
  );
}
