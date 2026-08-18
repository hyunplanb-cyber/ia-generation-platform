"use client";

/* 「지킴이 켜기」 — 이 화면이 열려 있는 동안에만 한 바퀴씩 두드린다. (2026-08-18 사장님 지시)
 *
 * 「영상이 매번 작업되는건 아니여서 컴퓨터 켤때 계속 배치 도는건 좀 부담스럽고.」
 *
 * 그래서 «상주»가 아니라 «켜 둔 동안만»이다. 탭을 닫으면 그것으로 끝난다 —
 * 끄는 것을 잊어도 남는 게 없다. 이게 작업 스케줄러보다 나은 점이다.
 *
 * ⚠ 배포된 곳(폰으로 볼 때)에서는 서버가 「여기선 안 됩니다」를 돌려준다.
 *   그때는 단추를 흐리게 두고 왜인지 적는다 — 눌리는데 아무 일 없는 것이 제일 나쁘다.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** 몇 초마다 두드리나. 굽는 데 2분쯤 걸리니 그보다 짧게 둘 이유가 없다. */
const 쉬는초 = 30;

export function WatcherSwitch() {
  const router = useRouter();
  const [켬, set켬] = useState(false);
  const [도는중, set도는중] = useState(false);
  const [알림, set알림] = useState<string | null>(null);
  const [막힘, set막힘] = useState<string | null>(null);
  const 돌고있나 = useRef(false);

  const 한바퀴 = useCallback(async () => {
    if (돌고있나.current) return;
    돌고있나.current = true;
    set도는중(true);
    try {
      const r = await fetch("/api/sns/tick", { method: "POST" });
      const 답 = await r.json();
      if (답.ok === false && 답.왜) {
        set막힘(답.왜);
        set켬(false);
        return;
      }
      if (답.마지막?.글) {
        set알림(답.마지막.글);
        /* 한 바퀴가 상태를 바꿨을 수 있다 — 목록을 새로 읽는다. */
        router.refresh();
      }
    } catch {
      set알림("두드리지 못했습니다 — 이 컴퓨터에서 서버가 도는지 보세요.");
    } finally {
      돌고있나.current = false;
      set도는중(false);
    }
  }, [router]);

  useEffect(() => {
    if (!켬) return;
    void 한바퀴();
    const 시계 = setInterval(() => void 한바퀴(), 쉬는초 * 1000);
    return () => clearInterval(시계);
  }, [켬, 한바퀴]);

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => { set막힘(null); set켬((v) => !v); }}
          className={`rounded-lg px-4 py-2 text-sm font-bold ${
            켬 ? "bg-emerald-600 text-white" : "bg-primary text-on-primary"
          }`}
        >
          {켬 ? "지킴이 켜짐 — 끄기" : "지킴이 켜기"}
        </button>
        <span className="text-xs text-muted-foreground">
          {켬
            ? `${쉬는초}초마다 봅니다. ${도는중 ? "지금 도는 중…" : "이 화면을 닫으면 멈춥니다."}`
            : "켜 두는 동안에만 「제작중」과 「등록 중」을 집어 갑니다."}
        </span>
      </div>

      {막힘 && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          <b>여기서는 못 돌립니다.</b> {막힘}
          <br />이 컴퓨터에서 <code className="font-mono">localhost:3000/admin/sns</code> 로 여시면 됩니다.
        </p>
      )}

      {알림 && !막힘 && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-muted px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
          {알림}
        </pre>
      )}
    </div>
  );
}
