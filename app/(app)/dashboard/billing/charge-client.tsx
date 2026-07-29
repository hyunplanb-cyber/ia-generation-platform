"use client";

import { useState } from "react";
import { Coins, Loader2, Minus, Plus } from "lucide-react";
import { ANONYMOUS, loadTossPayments } from "@tosspayments/tosspayments-sdk";
import {
  type CreditPack,
  creditsForWon,
  bonusPctForWon,
  CUSTOM_MIN_WON,
  CUSTOM_MAX_WON,
  CUSTOM_STEP_WON,
} from "@/lib/credits";
import type { StartedOrder } from "@/application/charge";
import { createChargeOrderAction, createCustomChargeOrderAction } from "./actions";

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
  const [customWon, setCustomWon] = useState(30000);

  const customCredits = creditsForWon(customWon);
  const customBonus = bonusPctForWon(customWon);

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
      if (!order) throw new Error("주문을 만들지 못했어요.");
      await startPayment(order);
    } catch (e) {
      handleError(e);
    }
  }

  async function chargeCustom() {
    setError(null);
    if (!clientKey) {
      setError("결제 설정이 아직 준비되지 않았어요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    // 1,000원 단위로 맞춘다.
    const amount = Math.round(customWon / CUSTOM_STEP_WON) * CUSTOM_STEP_WON;
    if (amount < CUSTOM_MIN_WON) {
      setError(`최소 ${CUSTOM_MIN_WON.toLocaleString()}원부터 충전할 수 있어요.`);
      return;
    }
    setCustomWon(amount);
    setBusy("custom");
    try {
      const order = await createCustomChargeOrderAction(amount);
      if (!order) throw new Error("금액을 확인해 주세요.");
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

      {/* 직접 입력 충전 — 다운로드처럼 큰 금액이 필요할 때 한 번에 */}
      <div className="rounded-2xl border border-border bg-background p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-foreground">원하는 만큼 충전</p>
            <p className="text-xs text-muted-foreground">1,000원 단위로 직접 입력하세요.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCustomWon((w) => Math.max(CUSTOM_MIN_WON, w - 10000))}
              className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
              aria-label="1만원 줄이기"
            >
              <Minus className="size-4" />
            </button>
            <div className="flex items-baseline gap-1 rounded-lg border border-border px-3 py-2">
              <input
                type="number"
                step={CUSTOM_STEP_WON}
                min={CUSTOM_MIN_WON}
                max={CUSTOM_MAX_WON}
                value={customWon}
                onChange={(e) =>
                  setCustomWon(Math.min(CUSTOM_MAX_WON, Math.max(0, Math.floor(Number(e.target.value)))))
                }
                className="w-28 bg-transparent text-right text-lg font-extrabold text-foreground outline-none"
              />
              <span className="text-sm font-bold text-muted-foreground">원</span>
            </div>
            <button
              type="button"
              onClick={() => setCustomWon((w) => Math.min(CUSTOM_MAX_WON, w + 10000))}
              className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
              aria-label="1만원 늘리기"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-3">
          <p>
            <span className="text-xl font-extrabold text-primary">
              {customCredits.toLocaleString()}
            </span>
            <span className="ml-1 text-sm font-semibold text-muted-foreground">크레딧</span>
            {customBonus > 0 && (
              <span className="ml-2 rounded-md bg-success-soft px-2 py-0.5 text-xs font-bold text-success">
                보너스 +{customBonus}%
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={chargeCustom}
            disabled={!!busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy === "custom" ? <Loader2 className="size-4 animate-spin" /> : null}
            {busy === "custom" ? "결제창 여는 중" : "충전하기"}
          </button>
        </div>
      </div>

      {error && <p className="text-center text-sm text-danger">{error}</p>}

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        미리보기는 언제나 무료예요. 크레딧으로 <b className="text-foreground">설계도 생성 · 사이트 검수 ·
        파일 다운로드</b>를 이용해요. 각 기능의 크레딧 사용량과 환불·유효기간은 이용약관·FAQ에서 확인하세요.
      </p>
    </div>
  );
}
