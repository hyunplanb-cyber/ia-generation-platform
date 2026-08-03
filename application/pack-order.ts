import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { packOrder } from "@/db/schema";
import { requireSession } from "@/application/require-session";
import { getSession } from "@/lib/session";
import { confirmTossPayment } from "@/adapters/payment/toss";
import { PACKAGES, PLAN_NAMES, planOf, type PlanId } from "@/lib/packages";

export interface StartedPackOrder {
  orderId: string;
  amountKrw: number;
  orderName: string;
}

/** 팩 하나를 가리키는 키 — 저장소 파일 이름이자 주문의 짝이다. */
export function packKey(packageId: string, planId: string): string {
  return `${packageId}-${planId}`;
}

// 값은 서버가 정한다. 클라이언트가 보내는 금액을 믿으면 1원짜리 주문이 만들어진다.
export async function createPackOrder(
  packageId: string,
  planId: string,
): Promise<StartedPackOrder | null> {
  const pkg = PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return null;
  const plan = planOf(pkg, planId);
  if (!plan) return null;

  const session = await requireSession();
  const orderId = `pack_${randomUUID().replace(/-/g, "")}`;
  await db.insert(packOrder).values({
    orderId,
    userId: session.user.id,
    packageId: pkg.id,
    planId: plan.id,
    amountKrw: plan.priceKrw,
    status: "pending",
  });
  return {
    orderId,
    amountKrw: plan.priceKrw,
    orderName: `${pkg.title} ${plan.name}`,
  };
}

export type ConfirmPackResult =
  | { ok: true; packageId: string; planId: PlanId; alreadyDone: boolean }
  | { ok: false; message: string };

// 결제 성공 리다이렉트 후: 금액 검증 → 토스 승인 → 소유 확정.
// 멱등하다 — 새로고침으로 다시 들어와도 두 번 승인하지 않는다.
export async function confirmPackOrder(
  orderId: string,
  paymentKey: string,
  amount: number,
): Promise<ConfirmPackResult> {
  const session = await requireSession();
  const [order] = await db.select().from(packOrder).where(eq(packOrder.orderId, orderId));

  if (!order || order.userId !== session.user.id) {
    return { ok: false, message: "주문을 찾을 수 없어요." };
  }
  if (order.status === "paid") {
    return {
      ok: true,
      packageId: order.packageId,
      planId: order.planId as PlanId,
      alreadyDone: true,
    };
  }
  if (order.amountKrw !== amount) {
    return { ok: false, message: "결제 금액이 주문과 달라요." };
  }

  const result = await confirmTossPayment(paymentKey, orderId, amount);
  if (!result.ok) {
    await db.update(packOrder).set({ status: "failed" }).where(eq(packOrder.orderId, orderId));
    return { ok: false, message: result.message };
  }

  await db
    .update(packOrder)
    .set({ status: "paid", paymentKey, paidAt: new Date() })
    .where(eq(packOrder.orderId, orderId));

  return {
    ok: true,
    packageId: order.packageId,
    planId: order.planId as PlanId,
    alreadyDone: false,
  };
}

/**
 * 이 사람이 이 팩을 살 만큼 냈는가.
 *
 * 같은 업종의 더 높은 등급을 샀으면 아래 등급도 받을 수 있게 한다 — 프리미엄을 산
 * 사람에게 "스탠다드는 따로 사세요"라고 할 이유가 없다. 2×2라 위아래가 한 줄이
 * 아니므로, 담고 있는 것이 상위집합인 경우만 열어 준다.
 */
const COVERS: Record<string, PlanId[]> = {
  standard: ["standard"],
  plus: ["plus", "standard"], // 3뎁스는 2뎁스 설계를 품는다
  deluxe: ["deluxe", "standard"], // 여기에 검수와 완성 화면이 더해진다
  premium: ["premium", "plus", "deluxe", "standard"], // 전부 들어 있음
};

export async function ownedPlans(packageId: string): Promise<Set<string>> {
  const session = await getSession();
  if (!session) return new Set();

  const rows = await db
    .select({ planId: packOrder.planId })
    .from(packOrder)
    .where(
      and(
        eq(packOrder.userId, session.user.id),
        eq(packOrder.packageId, packageId),
        eq(packOrder.status, "paid"),
      ),
    );

  const owned = new Set<string>();
  for (const r of rows) for (const covered of COVERS[r.planId] ?? []) owned.add(covered);
  return owned;
}

export async function ownsPack(packageId: string, planId: string): Promise<boolean> {
  return (await ownedPlans(packageId)).has(planId);
}

export interface PurchasedPack {
  packageId: string;
  planId: string;
  title: string;
  planName: string;
  amountKrw: number;
  paidAt: Date | null;
  href: string;
}

/** 내가 산 AI팩 — 다시 받으러 올 수 있게 목록으로 준다. */
export async function listPurchasedPacks(): Promise<PurchasedPack[]> {
  const session = await getSession();
  if (!session) return [];

  const rows = await db
    .select()
    .from(packOrder)
    .where(and(eq(packOrder.userId, session.user.id), eq(packOrder.status, "paid")))
    .orderBy(desc(packOrder.paidAt));

  return rows.flatMap((r) => {
    const pkg = PACKAGES.find((p) => p.id === r.packageId);
    if (!pkg) return [];
    return [
      {
        packageId: r.packageId,
        planId: r.planId,
        title: pkg.title,
        planName: PLAN_NAMES[r.planId as PlanId] ?? r.planId,
        amountKrw: r.amountKrw,
        paidAt: r.paidAt,
        href: `/api/packages/${r.packageId}/${r.planId}/download`,
      },
    ];
  });
}
