"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/* 결제가 끝난 화면에서 «담아 둔 옛 화면»을 버리고 서버에서 다시 받아 온다.
 *
 * 왜 필요한가 (2026-08-31 사장님)
 *   심사 계정으로 5만원을 충전했더니 「충전이 완료됐어요 +550 크레딧」이 떴는데,
 *   상단 「내 크레딧」은 계속 **35** 였다. 크레딧은 원장에 제대로 들어가 있었다 —
 *   `Ctrl+Shift+R` 을 눌러야 585 가 보였다.
 *
 *   까닭은 Next.js 의 Router Cache 다. 화면 이동을 빠르게 하려고 서버가 그린 화면을
 *   잠시 담아 두는데, 충전은 그 «담아 둔 값»을 모른다. 그래서 성공 화면에서
 *   「대시보드로」를 누르면 **충전 전 숫자**가 그대로 보인다.
 *
 *   손님은 그걸 「돈은 나갔는데 크레딧이 안 들어왔다」로 읽는다. 결제에서 그보다
 *   무서운 오해는 없다. 새로고침을 눌러야 보이는 것은 고장이나 마찬가지다.
 *   사장님 말씀 — 「충전되면 새로고침은 자동으로 되어야 해.」
 *
 * ⚠ `router.refresh()` 는 지금 화면도 다시 그린다. 성공 화면은 그리면서 승인을
 *   부르므로(`confirmCharge`) 한 번 더 불린다. 그건 안전하다 — 이미 `paid` 인
 *   주문은 `alreadyDone` 으로 빠져 **크레딧을 두 번 주지 않는다**
 *   (`application/charge.ts:95`). 이 안전장치가 없으면 이 컴포넌트를 붙이면 안 된다.
 */
export function RefreshOnMount() {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);
  return null;
}
