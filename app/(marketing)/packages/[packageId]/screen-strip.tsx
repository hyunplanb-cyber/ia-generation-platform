"use client";

// 「이런 화면이 만들어집니다」 절의 가로 줄 — 두 장씩 옆으로 민다.
//
// 왜 따로 떼어냈나
//   상세는 서버 컴포넌트다. 손가락으로 미는 것(스크롤 스냅)은 CSS 만으로 되지만
//   **화살표는 스크롤 위치를 알아야** 한다 — 끝에 닿았는지에 따라 흐려져야 하니까.
//   그 한 가지 때문에 절 전체를 클라이언트로 넘기지 않고 이 줄만 뗐다.
//
// 왜 화살표가 필요한가
//   폰은 밀면 되지만 데스크톱 마우스에는 가로 스크롤이 없다.
//   휠은 세로로만 돌아서, 화살표가 없으면 첫 두 장만 보고 지나간다(2026-08-11).
//
// 화살표는 넓은 화면에서만 낸다. 폰에서는 미는 게 더 자연스럽고,
// 좁은 화면에 버튼을 얹으면 그림을 가린다.

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Shot = { file: string; id: string; name: string };

export function ScreenStrip({ shots, alt }: { shots: Shot[]; alt: string }) {
  const 줄 = useRef<HTMLDivElement>(null);
  const [왼쪽끝, set왼쪽끝] = useState(true);
  const [오른쪽끝, set오른쪽끝] = useState(false);

  const 재보기 = useCallback(() => {
    const el = 줄.current;
    if (!el) return;
    // 소수점 오차로 「끝인데 끝이 아닌」 상태가 생긴다. 1px 은 봐 준다.
    set왼쪽끝(el.scrollLeft <= 1);
    set오른쪽끝(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    재보기();
    // 창 폭이 바뀌면 한 번에 보이는 장수가 달라져서 끝 판정도 달라진다.
    window.addEventListener("resize", 재보기);
    return () => window.removeEventListener("resize", 재보기);
  }, [재보기]);

  // 한 번에 「보이는 만큼」 민다 — 두 장씩 넘어간다. 스냅이 나머지를 맞춰 준다.
  const 밀기 = (쪽: 1 | -1) =>
    줄.current?.scrollBy({ left: 쪽 * 줄.current.clientWidth, behavior: "smooth" });

  return (
    <div className="relative">
      <div
        ref={줄}
        onScroll={재보기}
        /* -mx-6 / px-6 은 폰에서 바깥 여백만큼 빼냈다가 안쪽으로 되돌리는 짝이다.
           다음 장이 화면 끝에 살짝 걸치게 해서 «밀 수 있다»를 보이게 한다.
           ⚠ scroll-px-6 이 «반드시» 따라와야 한다. 스냅은 기본적으로 스크롤 칸의
           맨 끝(패딩 바깥)에 카드를 붙이므로, 이게 없으면 브라우저가 왼쪽 여백
           24px 을 스스로 밀어내고(scrollLeft=24) 첫 장이 화면 끝에 딱 붙는다.
           글은 여백 안에 있는데 그림만 튀어나와 보인다 — 실제로 그랬다(2026-08-11). */
        className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {shots.map((s) => (
          <figure
            key={s.file}
            className="flex w-[86%] shrink-0 snap-start flex-col gap-2 sm:w-[calc(50%-1.5rem)]"
          >
            {/* 눌러서 원본을 연다. 카드가 작아 화면 속 글자가 안 읽힌다 —
                「무엇을 받는지 보여 주는」 절인데 안 읽히면 절반만 하는 셈이다. */}
            <a
              href={s.file}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:border-primary"
            >
              {/* 원본이 1440×1000 이라 비율을 못 박아 둔다 — 안 그러면 불러오는 동안 글이 밀린다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.file}
                alt={`${alt} — ${s.name}`}
                width={1440}
                height={1000}
                loading="lazy"
                className="block h-auto w-full"
              />
            </a>
            <figcaption className="flex items-baseline gap-1.5 text-xs">
              <span className="font-bold text-muted-foreground">{s.id}</span>
              <span className="text-muted-foreground/80">{s.name}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* 그림 «위»가 아니라 좌우 바깥에 걸친다. 위에 얹으면 첫 장의 머리줄을 가린다.
          끝에 닿으면 지우지 않고 흐리게 둔다 — 사라지면 옆에 있던 것이 밀려 흔들린다. */}
      {[-1, 1].map((쪽) => {
        const 왼쪽 = 쪽 === -1;
        const 꺼짐 = 왼쪽 ? 왼쪽끝 : 오른쪽끝;
        return (
          <button
            key={쪽}
            type="button"
            onClick={() => 밀기(쪽 as 1 | -1)}
            disabled={꺼짐}
            aria-label={왼쪽 ? "이전 화면 보기" : "다음 화면 보기"}
            /* z-10 이 없으면 옆에 걸친 카드의 링크가 화살표를 먹는다.
               둘 다 자리 잡은(positioned) 요소라 층을 안 정해 주면 눌러 봐야 그림이 열린다.
               실제로 그랬다(2026-08-11). */
            className={`absolute top-[38%] z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface text-foreground shadow-md transition-opacity sm:grid ${
              왼쪽 ? "-left-4" : "-right-4"
            } ${꺼짐 ? "cursor-default opacity-0" : "opacity-100 hover:bg-muted"}`}
          >
            {왼쪽 ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
          </button>
        );
      })}
    </div>
  );
}
