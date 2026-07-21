import { Check } from "lucide-react";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import { getCurrentPlan } from "@/application/get-current-plan";

const HIGHLIGHT: PlanId = "standard";

function priceLabel(krw: number | null): string {
  if (krw === 0) return "무료";
  if (krw == null) return "가격 준비 중";
  return `${krw.toLocaleString()}원 / 월`;
}

export default async function BillingPage() {
  const current = await getCurrentPlan();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">요금제</h1>
        <p className="text-sm text-muted-foreground">
          지금은 모든 기능을 무료로 사용하실 수 있어요. 유료 플랜은 곧 시작됩니다.
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = current.id === id;
          const isHighlight = id === HIGHLIGHT;
          return (
            <div
              key={id}
              className={`flex flex-col gap-5 rounded-2xl border bg-background p-6 shadow-sm ${
                isHighlight ? "border-2 border-primary" : "border-border"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
                  {isHighlight && (
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-on-soft">
                      추천
                    </span>
                  )}
                  {isCurrent && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      현재 플랜
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              </div>

              <p className="text-xl font-extrabold text-foreground">{priceLabel(plan.priceKrw)}</p>

              <ul className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/85">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled
                className="mt-auto cursor-not-allowed rounded-lg bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground"
                title="유료 플랜은 준비 중이에요"
              >
                {plan.priceKrw === 0 ? "기본 제공" : "준비 중"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        가격과 시작 시점은 확정되는 대로 안내드릴게요.
      </p>
    </div>
  );
}
