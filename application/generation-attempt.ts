import { requireSession } from "@/application/require-session";
import { db } from "@/db/client";
import { generationAttempt } from "@/db/schema";

/* 생성 시도를 «성공이든 실패든» 남긴다.
 *
 * 왜 있나 — 2026-08-25.
 *   API 열쇠가 8/15 에 만료됐는데 9일 동안 아무도 몰랐다. 성공하면 menu·screen 줄이
 *   생기지만 **실패하면 아무 흔적도 안 남았다.** 그래서 8/03 에 손님 넷이 왜 못
 *   만들었는지 끝내 못 밝혔다 — 눌렀는데 막힌 것인지, 컨셉만 적고 나간 것인지
 *   구분할 길이 없었다.
 *
 * ⚠ 크레딧 원장으로는 못 센다. 실패하면 차감을 «안 하기» 때문이다(그게 손님에게
 *    맞는 처사다). 그러니 실패는 여기 따로 남긴다.
 * ⚠ 이 기록이 실패해도 «생성 자체»는 막지 않는다. 기록은 곁다리다 —
 *    기록 때문에 손님이 못 만드는 일이 있으면 안 된다.
 */
/* ⚠ 갈래를 늘리면 lib/our-numbers.ts 의 ATTEMPT_KINDS 도 같이 늘린다.
     화면이 그 표로 이름을 붙이므로, 안 늘리면 코드가 그대로 보인다. */
export type 시도갈래 =
  | "ia" // AI팩 생성
  | "preset" // 디자인 프리셋 생성
  | "verify-pack" // AI팩 검수 (프로젝트 산출물로 검수 시나리오 만들기)
  | "verify-site" // 사이트 검수 (주소를 넣어 검사)
  | "verify-doc"; // 문서 검수 (설계도·PDF·PPTX 를 넣어 검사)
export type 시도크기 = "basic" | "detail";

export async function 시도남기기(입력: {
  projectId?: string | null;
  kind: 시도갈래;
  size?: 시도크기 | null;
  ok: boolean;
  reason?: string | null;
  menuCount?: number | null;
  screenCount?: number | null;
  /** 「생성 중 이탈」일 때만 — 몇 밀리초를 기다렸다 나갔나 */
  waitedMs?: number | null;
}): Promise<void> {
  try {
    const session = await requireSession();
    await db.insert(generationAttempt).values({
      userId: session.user.id,
      projectId: 입력.projectId ?? null,
      kind: 입력.kind,
      size: 입력.size ?? null,
      ok: 입력.ok,
      /* 까닭은 «우리가 볼» 것이다 — 손님에게 보인 문구가 아니라 코드가 돌려준 값.
         길면 잘라 둔다. 지어내지 않는다. */
      reason: 입력.reason ? String(입력.reason).slice(0, 300) : null,
      menuCount: 입력.menuCount ?? null,
      screenCount: 입력.screenCount ?? null,
      waitedMs: 입력.waitedMs ?? null,
    });
  } catch {
    /* 남기지 못해도 넘어간다 — 위 ⚠ 참고 */
  }
}
