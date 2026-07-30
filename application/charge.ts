import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { creditOrder } from "@/db/schema";
import { requireSession } from "@/application/require-session";
import { chargeCredits } from "@/application/credit";
import { confirmTossPayment } from "@/adapters/payment/toss";
import {
  packById,
  creditsForWon,
  CUSTOM_MIN_WON,
  CUSTOM_MAX_WON,
  CUSTOM_STEP_WON,
} from "@/lib/credits";

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
  const orderId = `credit_${randomUUID().replace(/-/g, "")}`;
  await db.insert(creditOrder).values({
    orderId,
    userId: session.user.id,
    packId: pack.id,
    amountKrw: pack.priceKrw,
    credits: pack.credits,
    status: "pending",
  });
  return {
    orderId,
    amountKrw: pack.priceKrw,
    credits: pack.credits,
    orderName: `${pack.name} 크레딧 ${pack.credits}개`,
  };
}

// 직접 입력 충전(1,000원 단위) 주문 생성. 금액·크레딧은 서버가 확정한다.
export async function createCustomChargeOrder(amountKrw: number): Promise<StartedOrder | null> {
  if (
    !Number.isFinite(amountKrw) ||
    amountKrw < CUSTOM_MIN_WON ||
    amountKrw > CUSTOM_MAX_WON ||
    amountKrw % CUSTOM_STEP_WON !== 0
  ) {
    return null;
  }
  const session = await requireSession();
  const credits = creditsForWon(amountKrw);
  const orderId = `credit_${randomUUID().replace(/-/g, "")}`;
  await db.insert(creditOrder).values({
    orderId,
    userId: session.user.id,
    packId: "custom",
    amountKrw,
    credits,
    status: "pending",
  });
  return { orderId, amountKrw, credits, orderName: `크레딧 ${credits}개 충전` };
}

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
