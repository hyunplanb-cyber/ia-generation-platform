import { redirect } from "next/navigation";
import { CREDITS_OPEN } from "@/lib/flags";
import { requireSession } from "@/application/require-session";
import { getCreditBalance } from "@/application/credit";
import { CREDIT_PACKS } from "@/lib/credits";
import { ChargeClient } from "./charge-client";

// 토스 승인(리다이렉트 후) 등 네트워크 왕복이 있어 여유를 둔다.
export const maxDuration = 60;

export default async function BillingPage() {
  // 충전(결제)이 열리기 전에는 대시보드로 돌려보낸다(lib/flags.ts의 CREDITS_OPEN).
  if (!CREDITS_OPEN) {
    redirect("/dashboard");
  }

  const session = await requireSession();
  const balance = await getCreditBalance();

  return (
    <ChargeClient
      packs={CREDIT_PACKS}
      balance={balance}
      clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? ""}
      customerKey={session.user.id}
      customerEmail={session.user.email ?? null}
      customerName={session.user.name ?? null}
    />
  );
}
