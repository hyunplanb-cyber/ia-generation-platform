import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { packOrder } from "@/db/schema";
import { requireSession } from "@/application/require-session";
import { getSession } from "@/lib/session";
import { confirmTossPayment } from "@/adapters/payment/toss";
import { PACKAGES, PLAN_NAMES, planOf, packCredits, type PlanId } from "@/lib/packages";
import { isOwner } from "@/lib/flags";
import { spendCredits } from "@/application/credit";
import { billingOpenFor, planBuyableNow } from "@/lib/flags";

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
  /* 팩도 같은 문을 쓴다. 테스트 키가 붙어 있으면 **팩도 공짜로 사진다** —
     충전만 막고 여기를 열어두면 뒷문이 열린 셈이다(2026-08-09). */
  if (!billingOpenFor(session.user.email)) return null;
  // 심사 기간에는 한 등급만 연다(플러스 — 10만원 아래라 결제창이 확실히 뜬다).
  if (!planBuyableNow(plan.id)) return null;
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

export type BuyWithCreditsResult =
  | { ok: true; packageId: string; planId: PlanId; spent: number; balance: number }
  | { ok: false; reason: "closed" | "insufficient" | "unknown"; need?: number; balance?: number };

/**
 * 팩을 «크레딧으로» 산다 — 2026-08-09 에 넣었다.
 *
 * 왜 카드 직결제를 두고 이 길을 만드나
 *   충전해 둔 크레딧이 남았는데 팩은 따로 현금을 내야 했다. 지갑이 둘이라
 *   남은 크레딧이 놀았다. 지갑을 하나로 합치면 그 손해가 사라진다.
 *
 *   그리고 카드사 심사에서 「포인트 사용처」를 보여줘야 하는데(충전업종 요건),
 *   지금까지 사용처가 「만들기」 하나뿐이었다. 팩이 사용처로 붙으면 둘이 된다.
 *
 *   토스가 1회 충전을 10만원으로 묶어 둔 것도 이 길로 풀린다 — 카드 직결제는
 *   한 건에 한 금액이라 10만원 넘는 등급을 쪼갤 수 없지만, 크레딧은 나눠 채울 수 있다.
 *
 * 값은 서버가 정한다(packCredits). 클라이언트가 보내는 숫자는 믿지 않는다.
 * 이미 산 등급이면 다시 받게만 하고 크레딧을 또 깎지 않는다.
 */
export async function buyPackWithCredits(
  packageId: string,
  planId: string,
): Promise<BuyWithCreditsResult> {
  const pkg = PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return { ok: false, reason: "unknown" };
  const plan = planOf(pkg, planId);
  if (!plan) return { ok: false, reason: "unknown" };

  const session = await requireSession();
  if (!billingOpenFor(session.user.email)) return { ok: false, reason: "closed" };
  if (!planBuyableNow(plan.id)) return { ok: false, reason: "closed" };

  // 이미 가진 등급이면 값을 두 번 받지 않는다.
  if (await ownsPack(packageId, plan.id)) {
    return { ok: true, packageId, planId: plan.id as PlanId, spent: 0, balance: -1 };
  }

  const need = packCredits(plan.priceKrw);
  const spend = await spendCredits(need, `${pkg.title} ${plan.name} 구매`, {
    packageId,
    planId: plan.id,
  });
  if (!spend.ok) return { ok: false, reason: "insufficient", need, balance: spend.balance };

  /* 크레딧으로 산 것도 같은 주문 표에 남긴다 — 「내가 산 팩」 목록과 다운로드 권한이
     이 표를 보고 있어서, 따로 두면 산 게 안 보인다. 결제수단만 다르다. */
  await db.insert(packOrder).values({
    orderId: `packc_${randomUUID().replace(/-/g, "")}`,
    userId: session.user.id,
    packageId: pkg.id,
    planId: plan.id,
    amountKrw: plan.priceKrw,
    status: "paid",
    paidAt: new Date(),
  });

  return { ok: true, packageId, planId: plan.id as PlanId, spent: need, balance: spend.balance };
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

  /* 사이트 주인은 사지 않고도 내려받는다 — **팔기 전에 「손님이 받는 그 파일」을
     직접 열어 봐야** 하기 때문이다. 2026-08-10 에 뷰티샵 디럭스가
     `완성화면/index.html` 없이 엿새를 팔렸다. 주인이 자기 상품을 사야만 받을 수
     있으면 그런 것을 못 잡는다(2026-08-11 사장님 요청).

     ⚠ 여는 것은 **다운로드뿐**이다. 크레딧이 생기거나 결제가 열리는 것이 아니다.
     누가 주인인지는 `lib/flags.ts` 의 OWNER_EMAILS 한 곳에만 적혀 있다. */
  if (isOwner(session.user.email)) return new Set(Object.keys(COVERS));

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
