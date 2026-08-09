"use server";

import { buyPackWithCredits, type BuyWithCreditsResult } from "@/application/pack-order";

/* AI팩은 «크레딧으로» 산다 — 2026-08-09.
 *
 * 전에는 카드 직결제였다. 그러면 지갑이 둘이 된다 — 충전해 둔 크레딧이 남았는데
 * 팩은 또 현금을 내야 해서 남은 크레딧이 놀았다.
 *
 * 두 길을 다 열어 두지 않은 까닭: 같은 팩에 값이 둘로 보인다.
 * 손님은 반드시 알아채고, 그때부터 비싼 쪽은 「속는 길」이 된다.
 *
 * 값은 서버가 정한다(packCredits). 클라이언트가 보내는 숫자는 믿지 않는다.
 */
export async function buyPackWithCreditsAction(
  packageId: string,
  planId: string,
): Promise<BuyWithCreditsResult> {
  return buyPackWithCredits(packageId, planId);
}
