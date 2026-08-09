import { randomUUID } from "node:crypto";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { creditOrder } from "@/db/schema";
import { requireSession } from "@/application/require-session";
import { chargeCredits } from "@/application/credit";
import { confirmTossPayment } from "@/adapters/payment/toss";
import { packById, creditsForWon, bonusPctForWon } from "@/lib/credits";
import { billingOpenFor, REVIEW_MODE, REVIEW_MAX_CHARGES } from "@/lib/flags";

export interface StartedOrder {
  orderId: string;
  amountKrw: number;
  credits: number;
  orderName: string;
}

// 충전 주문을 만든다 — 금액·크레딧은 서버가 정해 신뢰한다(클라이언트가 조작 못 함).
export async function createChargeOrder(packId: string): Promise<StartedOrder | null> {
  const pack = packById(packId);
  if (!pack) return null;
  const session = await requireSession();
  /* 화면에서 막는 것만으로는 부족하다 — 서버 액션은 주소만 알면 부를 수 있다.
     심사 기간에는 allowlist 계정만 주문을 만들 수 있어야 한다(lib/flags.ts). */
  if (!billingOpenFor(session.user.email)) return null;

  /* 심사 기간에는 계정당 충전 횟수를 못 박는다.
     테스트 키라 충전은 공짜인데 크레딧은 진짜로 쌓인다 — 횟수를 안 막으면
     한 계정이 몇 번을 누를지 우리가 알 수 없고, 그만큼 생성비가 새어나간다. */
  if (REVIEW_MODE) {
    const [{ 수 }] = await db
      .select({ 수: count() })
      .from(creditOrder)
      .where(and(eq(creditOrder.userId, session.user.id), eq(creditOrder.status, "paid")));
    if (수 >= REVIEW_MAX_CHARGES) return null;
  }
  /* 지급 크레딧은 표(pack.credits)가 아니라 «계산식»에서 뽑는다.
     심사 기간에는 보너스가 10%로 내려가는데, 표의 값은 30% 기준이라
     표를 그대로 쓰면 심사 계정에 30%가 나간다(2026-08-09). 계산식이 유일한 출처다. */
  const credits = creditsForWon(pack.priceKrw);
  const orderId = `credit_${randomUUID().replace(/-/g, "")}`;
  await db.insert(creditOrder).values({
    orderId,
    userId: session.user.id,
    packId: pack.id,
    amountKrw: pack.priceKrw,
    credits,
    status: "pending",
  });
  return {
    orderId,
    amountKrw: pack.priceKrw,
    credits,
    orderName: `${pack.name} 크레딧 ${credits}개`,
  };
}

/* 직접 입력 충전은 없앴다 — 2026-08-09.
 *
 * 토스 「홈페이지 결제경로 제작 가이드(충전업종용)」 유의사항 3번:
 *   **임의 금액입력 후 충전하는 결제 방식은 이용이 불가능해요.**
 *   반드시 10만원 이하의 금액을 «선택»하도록 구현해 주세요.
 *
 * 카드사 심사를 통과할 수 없는 방식이라 기능째 들어냈다. 상한도 문제였다 —
 * CUSTOM_MAX_WON 이 1,000,000원이라 허용치의 열 배였다.
 * 대신 CREDIT_PACKS 에 선택형 옵션을 10만원 이하로 늘렸다(lib/credits.ts).
 */

export type ConfirmResult =
  | { ok: true; credits: number; alreadyDone: boolean }
  | { ok: false; message: string };

// 결제 성공 리다이렉트 후: 금액 검증 → 토스 승인 → 크레딧 지급. 멱등(이미 지급됐으면 통과).
export async function confirmCharge(
  orderId: string,
  paymentKey: string,
  amount: number,
): Promise<ConfirmResult> {
  const session = await requireSession();
  const [order] = await db.select().from(creditOrder).where(eq(creditOrder.orderId, orderId));

  if (!order || order.userId !== session.user.id) {
    return { ok: false, message: "주문을 찾을 수 없어요." };
  }
  // 이미 지급된 주문이면 다시 지급하지 않는다(새로고침·중복 호출 방어).
  if (order.status === "paid") {
    return { ok: true, credits: order.credits, alreadyDone: true };
  }
  if (order.amountKrw !== amount) {
    return { ok: false, message: "결제 금액이 주문과 달라요." };
  }

  const result = await confirmTossPayment(paymentKey, orderId, amount);
  if (!result.ok) {
    await db.update(creditOrder).set({ status: "failed" }).where(eq(creditOrder.orderId, orderId));
    return { ok: false, message: result.message };
  }

  await chargeCredits(order.userId, order.credits, `${order.amountKrw.toLocaleString()}원 충전`, {
    orderId,
    paymentKey,
    amountKrw: order.amountKrw,
  });
  await db
    .update(creditOrder)
    .set({ status: "paid", paymentKey, paidAt: new Date() })
    .where(eq(creditOrder.orderId, orderId));

  return { ok: true, credits: order.credits, alreadyDone: false };
}
