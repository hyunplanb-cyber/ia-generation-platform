import { Check, BellRing, BellOff } from "lucide-react";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import { getCurrentPlan } from "@/application/get-current-plan";
import { getMyPlanInterests } from "@/application/plan-interest";
import { requestPlanNoticeAction } from "./actions";

const HIGHLIGHT: PlanId = "standard";

function priceLabel(krw: number | null): string {
  if (krw === 0) return "무료";
  if (krw == null) return "가격 준비 중";
  return `${krw.toLocaleString()}원 / 월`;
}

export default async function BillingPage({
  searchParams,
}: {
  // 다운로드 잠금에서 넘어온 경우 ?from=download 가 붙는다(어디서 눌렀는지 기록용).
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const source = from === "download" ? "download" : "billing";
  const [current, requested] = await Promise.all([getCurrentPlan(), getMyPlanInterests()]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold text-foreground">요금제</h1>
        {source === "download" ? (
          <p className="text-sm text-muted-foreground">
            산출물 다운로드는 유료 플랜에서 열려요. 아직 준비 중이라{" "}
            <b className="font-semibold text-foreground">지금은 결제하실 수 없습니다.</b>
            <br />
            열리면 알려드릴게요.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            만들고 화면으로 확인하는 건 무료예요. 파일 다운로드는 유료 플랜에서 열립니다.
          </p>
        )}
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

              {plan.priceKrw === 0 ? (
                <span className="mt-auto rounded-lg bg-muted px-4 py-2.5 text-center text-sm font-semibold text-muted-foreground">
                  기본 제공
                </span>
              ) : requested.has(id) ? (
                <span className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-success-soft px-4 py-2.5 text-sm font-semibold text-success">
                  <BellRing className="size-4" />
                  알림 신청 완료
                </span>
              ) : (
                // 결제가 없으니 "구매"가 아니라 "열리면 알려달라"를 받는다.
                // 이 신청 수가 지금으로선 유일한 수요 지표다.
                <form action={requestPlanNoticeAction} className="mt-auto">
                  <input type="hidden" name="planId" value={id} />
                  <input type="hidden" name="source" value={source} />
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <BellOff className="size-4" />
                    열리면 알려주세요
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        알림을 신청해 주시면 결제가 열릴 때 가입하신 메일로 가장 먼저 알려드려요.
        <br />
        가격은 아직 확정되지 않았습니다.
      </p>
    </div>
  );
}
