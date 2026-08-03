"use client";

// AI팩 구매 버튼.
//
// 크몽은 별개 판로다 — 수수료 때문에 값이 다를 수 있고, 승인도 우리 손 밖이다.
// 그래서 우리 사이트는 "구매하기 → 결제 → 바로 다운로드"가 되어야 한다(2026-08-03).
//
// 판매를 아직 열지 않았어도(PACKAGE_SALE_OPEN=false) 이미 산 사람의 다운로드는 막지 않는다.
// 막는 건 결제 시작뿐이다.

import { useState } from "react";
import { Download, Loader2, ShoppingBag } from "lucide-react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { buttonVariants } from "@/components/ui/button";
import type { StartedPackOrder } from "@/application/pack-order";
import { createPackOrderAction } from "./actions";

export function BuyButton({
  packageId,
  planId,
  planName,
  owned,
  saleOpen,
  signedIn,
  clientKey,
  customerKey,
  customerEmail,
  customerName,
  emphasis,
}: {
  packageId: string;
  planId: string;
  planName: string;
  owned: boolean;
  saleOpen: boolean;
  signedIn: boolean;
  clientKey: string;
  customerKey: string;
  customerEmail: string | null;
  customerName: string | null;
  /** 강조 색을 쓸 등급인가(프리미엄) */
  emphasis?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const href = `/api/packages/${packageId}/${planId}/download`;

  // 이미 산 사람은 언제나 다시 받을 수 있다.
  if (owned) {
    return (
      <a href={href} className={`${buttonVariants({ size: "lg" })} w-full`}>
        <Download className="size-4" />
        다운로드
      </a>
    );
  }

  if (!saleOpen) {
    return (
      // "판매 준비 중"은 값 자리에서 이미 말한다 — 여기서 또 하면 같은 말이 두 번 보인다.
      <p className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-2.5 text-center text-xs text-muted-foreground">
        결제 수단을 붙이는 중이에요.
      </p>
    );
  }

  async function buy() {
    setError(null);
    if (!signedIn) {
      window.location.href = `/signup?next=/packages/${packageId}%3Fplan=${planId}`;
      return;
    }
    setBusy(true);
    try {
      const order: StartedPackOrder | null = await createPackOrderAction(packageId, planId);
      if (!order) {
        setBusy(false);
        setError("주문을 만들지 못했어요.");
        return;
      }
      // 성공하면 successUrl로 넘어가므로 이 아래는 실행되지 않는다.
      const toss = await loadTossPayments(clientKey);
      const payment = toss.payment({ customerKey: customerKey || ANONYMOUS });
      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: order.amountKrw },
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: `${window.location.origin}/packages/success`,
        failUrl: `${window.location.origin}/packages/fail`,
        customerEmail: customerEmail ?? undefined,
        customerName: customerName ?? undefined,
      });
    } catch (e) {
      setBusy(false);
      const msg = e instanceof Error ? e.message : "결제를 시작하지 못했어요.";
      // 결제창을 그냥 닫은 건 오류가 아니다.
      if (!/취소|cancel|close|USER_CANCEL/i.test(msg)) setError(msg);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={buy}
        disabled={busy}
        className={`${buttonVariants({ size: "lg" })} w-full ${
          emphasis ? "" : "bg-foreground hover:bg-foreground/90"
        }`}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
        {planName} 구매하기
      </button>
      <p className="text-center text-xs text-muted-foreground">
        결제하면 바로 다운로드돼요.
      </p>
      {error && <p className="text-center text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
