import { getSession } from "@/lib/session";
import { billingOpenFor } from "@/lib/flags";

/**
 * 지금 이 사람에게 크레딧 경제가 열려 있는가.
 *
 * 왜 상수(CREDITS_OPEN)를 그대로 쓰지 않나 — 2026-08-09
 *   카드사 심사 기간에는 결제를 «전체»가 아니라 «심사관 계정에만» 연다(lib/flags.ts).
 *   그런데 충전·팩 구매만 그렇게 바꾸고, **생성·다운로드는 옛 전역 스위치를 보고 있었다.**
 *   그래서 심사관이 충전은 되는데 「전체 다운로드」가 「준비 중」으로 막혀 있었다 —
 *   충전업종 심사가 요구하는 「포인트 사용처」를 못 보여주는 상태였다.
 *
 *   더 나쁜 것도 있었다. 스위치가 꺼져 있으면 다운로드를 **공짜로** 처리한다
 *   (application/download.ts). 크레딧이 안 빠지니 「이 포인트를 어디에 쓰는가」가
 *   화면에 나타나지 않는다. 심사에 필요한 그림이 정확히 안 나온다.
 *
 * 전체 공개(CREDITS_OPEN=true)면 누구에게나 true 다 — billingOpenFor 가 그렇게 판단한다.
 * 그래서 이 함수 하나로 「평상시」와 「심사 기간」이 모두 맞는다.
 */
export async function creditsOpenForMe(): Promise<boolean> {
  const session = await getSession();
  return billingOpenFor(session?.user.email);
}
