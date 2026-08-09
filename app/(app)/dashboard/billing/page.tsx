import { redirect } from "next/navigation";
import { billingOpenFor, chargeableNow } from "@/lib/flags";
import { requireSession } from "@/application/require-session";
import { getCreditBalance } from "@/application/credit";
import { CREDIT_PACKS, creditsForWon, bonusPctForWon } from "@/lib/credits";
import { ChargeClient } from "./charge-client";

// 토스 승인(리다이렉트 후) 등 네트워크 왕복이 있어 여유를 둔다.
export const maxDuration = 60;

export default async function BillingPage() {
  /* 충전이 열리기 전에는 대시보드로 돌려보낸다.
     심사 기간에는 전체가 아니라 allowlist 계정에만 열린다 — lib/flags.ts 주석 참고.
     세션을 먼저 가져와야 「누구인지」로 판단할 수 있다. */
  const session = await requireSession();
  if (!billingOpenFor(session.user.email)) {
    redirect("/dashboard");
  }

  const balance = await getCreditBalance();

  return (
    <ChargeClient
      packs={CREDIT_PACKS.map((p) => ({
        ...p,
        credits: creditsForWon(p.priceKrw),
        bonusPct: bonusPctForWon(p.priceKrw),
        // 심사 기간에는 한 칸만 실제로 결제된다. 나머지는 「결제 심사중」으로 보인다.
        chargeable: chargeableNow(p.priceKrw),
      }))}
      balance={balance}
      clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ""}
      customerKey={session.user.id}
      customerEmail={session.user.email ?? null}
      customerName={session.user.name ?? null}
    />
  );
}
