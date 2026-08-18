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
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

/** 몇 초마다 두드리나. 굽는 데 2분쯤 걸리니 그보다 짧게 둘 이유가 없다. */
const 쉬는초 = 30;
/** 켬/끔을 브라우저에 적어 둔다. 검수하다 새로고침하면 꺼지던 것을 막는다.
 *
 * ⚠ 처음엔 useEffect 로 읽어 setState 했는데, 그건 «그리자마자 다시 그리는» 모양이라
 *   리액트가 말린다. 브라우저 저장소는 리액트 «바깥»에 있는 상태이므로
 *   useSyncExternalStore 로 구독하는 것이 맞다 — 서버에서 그릴 때 값도 따로 줄 수 있어
 *   화면이 어긋나지 않는다. */
const 기억키 = "sns-watcher-on";
const 바뀜 = "sns-watcher-changed";

const 저장소 = {
  구독(알려줘: () => void) {
    window.addEventListener(바뀜, 알려줘);
    window.addEventListener("storage", 알려줘);   // 다른 탭에서 바꿨을 때
    return () => {
      window.removeEventListener(바뀜, 알려줘);
      window.removeEventListener("storage", 알려줘);
    };
  },
  읽기: () => window.localStorage.getItem(기억키) === "1",
  서버에서: () => false,
  쓰기(값: boolean) {
    window.localStorage.setItem(기억키, 값 ? "1" : "0");
    window.dispatchEvent(new Event(바뀜));
  },
};

export function WatcherSwitch() {
  const router = useRouter();
  const 켬 = useSyncExternalStore(저장소.구독, 저장소.읽기, 저장소.서버에서);
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
        저장소.쓰기(false);
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

  /* ⚠ 유튜브에 세로·가로 둘을 올리는 도중에 창이 닫히면 하나만 올라간다.
     도는 중일 때만 붙잡는다 — 평소엔 아무 말 없이 닫히게 둔다. */
  useEffect(() => {
    if (!도는중) return;
    const 붙잡기 = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", 붙잡기);
    return () => window.removeEventListener("beforeunload", 붙잡기);
  }, [도는중]);

  useEffect(() => {
    if (!켬) return;
    /* 첫 바퀴도 시계에 맡긴다 — 그리는 도중에 상태를 바꾸면 리액트가 말린다.
       0초 뒤라 사람 눈에는 「누르자마자」와 같다. */
    const 첫바퀴 = setTimeout(() => void 한바퀴(), 0);
    const 시계 = setInterval(() => void 한바퀴(), 쉬는초 * 1000);
    return () => { clearTimeout(첫바퀴); clearInterval(시계); };
  }, [켬, 한바퀴]);

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => { set막힘(null); 저장소.쓰기(!켬); }}
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
