"use client";

import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { type CreditPack } from "@/lib/credits";
import type { StartedOrder } from "@/application/charge";
import { createChargeOrderAction } from "./actions";

export function ChargeClient({
  packs,
  balance,
  clientKey,
  customerKey,
  customerEmail,
  customerName,
}: {
  /** chargeable — 이 금액이 지금 실제로 결제되는가(심사 기간엔 한 칸만 true) */
  packs: (CreditPack & { chargeable: boolean })[];
  balance: number;
  clientKey: string;
  customerKey: string;
  customerEmail: string | null;
  customerName: string | null;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 주문번호로 토스 결제창을 연다. 성공하면 successUrl로 리다이렉트(이후 코드 실행 안 됨).
  async function startPayment(order: StartedOrder) {
    const toss = await loadTossPayments(clientKey);
    const payment = toss.payment({ customerKey: customerKey || ANONYMOUS });
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
  }

  function handleError(e: unknown) {
    setBusy(null);
    const msg = e instanceof Error ? e.message : "결제를 시작하지 못했어요.";
    // 사용자가 결제창을 그냥 닫은 경우는 오류로 보여주지 않는다.
    if (!/취소|cancel|close|USER_CANCEL/i.test(msg)) setError(msg);
  }

  async function charge(pack: CreditPack) {
    setError(null);
    if (!clientKey) {
      setError("결제 설정이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setBusy(pack.id);
    try {
      const order = await createChargeOrderAction(pack.id);
      /* 주문이 안 만들어지는 까닭은 셋이다 — 결제가 이 계정에 안 열렸거나,
         심사 기간 충전 횟수를 다 썼거나, 지금 결제되지 않는 금액이거나.
         셋 다 손님에게는 같은 뜻이다: **이 결제는 아직 열려 있지 않다.**
         「주문을 만들지 못했어요」는 고장으로 읽혀서 손님이 다시 누르게 만든다.
         잠긴 칸에 적힌 「결제 심사중」과 같은 말로 맞춘다. */
      if (!order) throw new Error("결제 준비 중이에요.");
      await startPayment(order);
    } catch (e) {
      handleError(e);
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
              {/* 심사 기간에는 한 칸만 실제로 결제된다(lib/flags.ts REVIEW_CHARGE_WON).
                  나머지는 감추지 않고 「결제 심사중」으로 둔다 — 감추면 라인업이
                  한 칸으로 보여 「옵션 선택형」 요건이 약해진다. */}
              {pack.chargeable ? (
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
              ) : (
                <p className="mt-5 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-2.5 text-center text-sm font-semibold text-muted-foreground">
                  결제 심사중
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 직접 입력 충전 UI 는 없앴다 — 토스 충전업종 가이드가
          「임의 금액입력 후 충전하는 결제 방식은 이용이 불가능」이라 못 박았다(2026-08-09).
          큰 금액은 위 선택지(5만·9만)로 옮겼다. 전부 10만원 이하여야 한다. */}

      {error && <p className="text-center text-sm text-danger">{error}</p>}

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        미리보기는 언제나 무료예요. 크레딧으로 <b className="text-foreground">AI팩 생성 · 사이트 검수 ·
        파일 다운로드</b>를 이용해요. 각 기능의 크레딧 사용량과 환불·유효기간은 이용약관·FAQ에서 확인하세요.
      </p>
    </div>
  );
}
