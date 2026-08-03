"use server";

import { createPackOrder, type StartedPackOrder } from "@/application/pack-order";

// AI팩 구매 버튼 → 서버에서 주문을 만든다(값은 서버가 확정한다).
// 그 뒤 클라이언트가 이 주문번호로 토스 결제창을 연다.
export async function createPackOrderAction(
  packageId: string,
  planId: string,
): Promise<StartedPackOrder | null> {
  return createPackOrder(packageId, planId);
}
