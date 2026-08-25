/* 손님이 «생성 중에» 화면을 떠났다는 것을 받아 적는다.
 *
 * 왜 필요한가 — 2026-08-25 사장님 지시.
 *   「생성을 못한 것(오류)」과 「기다리다 나간 것」은 다르다.
 *   앞은 우리가 고칠 것이고, 뒤는 «우리가 너무 오래 기다리게 했다»는 뜻이다.
 *
 * ⛔ 서버만으로는 알 수가 없다. 서버 액션은 브라우저가 닫혀도 끝까지 돈다 —
 *   서버 눈에는 그냥 «성공»으로 보인다. 손님이 떠나는 순간을 아는 것은 브라우저뿐이라,
 *   떠나면서 보내는 비콘(navigator.sendBeacon)으로만 받을 수 있다.
 *
 * ⚠ 그래서 이 수는 «최소»다. 비콘이 못 갈 수도 있다(브라우저를 강제 종료, 전원 꺼짐 등).
 *   실제 이탈은 이보다 적지 않다. 많을 수는 있다.
 *
 * ⚠ 비콘은 «답을 못 받는다». 그래서 여기서는 언제나 204 로 조용히 끝낸다 —
 *   기록에 실패해도 손님 화면에 아무 일이 없어야 한다.
 */
import { getSession } from "@/lib/session";
import { 시도남기기 } from "@/application/generation-attempt";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return new Response(null, { status: 204 });

    /* sendBeacon 은 Content-Type 을 우리가 정하기 어렵다 — 글로 받아 직접 푼다. */
    const 글 = await req.text();
    let 몸: { projectId?: string; waitedMs?: number; size?: string } = {};
    try {
      몸 = JSON.parse(글);
    } catch {
      return new Response(null, { status: 204 });
    }

    /* ⚠ 손님이 보낸 수를 그대로 믿지 않는다 — 말도 안 되는 값은 버린다.
       한 시간(3,600,000ms)을 넘겨 기다렸다는 것은 시계가 틀렸거나 장난이다. */
    const 기다린 = Number(몸.waitedMs);
    const 성한기다림 =
      Number.isFinite(기다린) && 기다린 >= 0 && 기다린 <= 3_600_000 ? Math.round(기다린) : null;

    await 시도남기기({
      projectId: 몸.projectId ?? null,
      kind: "ia",
      size: 몸.size === "detail" ? "detail" : "basic",
      ok: false,
      reason: "left-during",
      waitedMs: 성한기다림,
    });
  } catch {
    /* 기록이 실패해도 손님 화면에는 아무 일이 없어야 한다 */
  }
  return new Response(null, { status: 204 });
}
