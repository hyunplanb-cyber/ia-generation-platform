"use client";

import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import type { CreditPack } from "@/lib/credits";
import { createChargeOrderAction } from "./actions";

export function ChargeClient({
  packs,
  balance,
  clientKey,
  customerKey,
  customerEmail,
  customerName,
}: {
  packs: CreditPack[];
  balance: number;
  clientKey: string;
  customerKey: string;
  customerEmail: string | null;
  customerName: string | null;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function charge(pack: CreditPack) {
    setError(null);
    if (!clientKey) {
      setError("결제 설정이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setBusy(pack.id);
    try {
      const order = await createChargeOrderAction(pack.id);
      if (!order) throw new Error("주문을 만들지 못했어요.");
      const toss = await loadTossPayments(clientKey);
      const payment = toss.payment({ customerKey: customerKey || ANONYMOUS });
      // 성공하면 successUrl로 리다이렉트된다(이 아래 코드는 실행되지 않음).
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: order.amountKrw },
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: `${window.location.origin}/dashboard/billing/success`,
        failUrl: `${window.location.origin}/dashboard/billing/fail`,
        customerEmail: customerEmail ?? undefined,
        customerName: customerName ?? undefined,
      });
    } catch (e) {
      setBusy(null);
      const msg = e instanceof Error ? e.message : "결제를 시작하지 못했어요.";
      // 사용자가 결제창을 그냥 닫은 경우는 오류로 보여주지 않는다.
      if (!/취소|cancel|close|USER_CANCEL/i.test(msg)) setError(msg);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary-on-soft">
          <Coins className="size-4" /> 크레딧 충전
        </span>
        <h1 className="text-2xl font-bold text-foreground">필요할 때 충전하고, 쓴 만큼만</h1>
        <p className="text-sm text-muted-foreground">
          구독 없이 크레딧으로 가볍게. 많이 충전할수록 더 드려요.
        </p>
        <p className="mt-1 rounded-lg bg-muted px-4 py-2 text-sm font-semibold text-foreground">
          현재 잔액 <span className="text-primary">{balance.toLocaleString()}</span> 크레딧
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {packs.map((pack) => {
          const on = busy === pack.id;
          return (
            <div
              key={pack.id}
              className={`relative flex flex-col rounded-2xl border bg-background p-6 shadow-sm ${
                pack.popular ? "border-2 border-primary" : "border-border"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  가장 인기
                </span>
              )}
              <p className="text-sm font-bold text-muted-foreground">{pack.name}</p>
              <p className="mt-1 text-2xl font-extrabold text-foreground">
                {pack.priceKrw.toLocaleString()}
                <span className="text-sm font-bold text-muted-foreground">원</span>
              </p>
              <div className="mt-4 flex items-baseline gap-1.5 border-t border-dashed border-border pt-3">
                <span className="text-xl font-extrabold text-primary">{pack.credits}</span>
                <span className="text-sm font-semibold text-muted-foreground">크레딧</span>
              </div>
              <span
                className={`mt-1.5 w-fit rounded-md px-2 py-0.5 text-xs font-bold ${
                  pack.bonusPct > 0
                    ? "bg-success-soft text-success"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {pack.bonusPct > 0 ? `보너스 +${pack.bonusPct}%` : "기본 제공"}
              </span>
              <button
                type="button"
                onClick={() => charge(pack)}
                disabled={!!busy}
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-60 ${
                  pack.popular
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground text-background"
                }`}
              >
                {on ? <Loader2 className="size-4 animate-spin" /> : null}
                {on ? "결제창 여는 중" : "충전하기"}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="text-center text-sm text-danger">{error}</p>}

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        미리보기는 언제나 무료예요. 크레딧으로 <b className="text-foreground">설계도 생성 · 사이트 검수 ·
        파일 다운로드</b>를 이용해요. 각 기능의 크레딧 사용량과 환불·유효기간은 이용약관·FAQ에서 확인하세요.
      </p>
    </div>
  );
}
