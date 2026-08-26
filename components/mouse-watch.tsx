/* 「지금 마우스로 보고 계신가」를 표시해 둔다. (2026-08-26)
 *
 * ⛔ 왜 @media (hover: hover) 를 버렸나 — 사장님 컴퓨터에서 잡았다.
 *   사장님 노트북은 «터치스크린»이다(navigator.maxTouchPoints = 10). 윈도우는 그런 기기를
 *   통째로 「손가락으로 쓰는 기기」로 알리고, 크롬은 그 말을 그대로 옮긴다:
 *
 *     hover: hover      false        pointer: fine    false
 *     any-hover: hover  false        pointer: coarse  true
 *
 *   마우스를 꽂고 쓰고 계셔도 그렇다. any-hover 까지 false 라 «어떤» 미디어 쿼리로도
 *   가려낼 수 없다. 그 바람에 @media (hover: hover) 안에 넣어 둔 것이 —— 카드 떠오르기,
 *   단추 색 바뀌기 —— 사장님 화면에서 하나도 안 걸리고 있었다(2026-08-25 에 넣은 것부터).
 *   터치스크린 달린 윈도우 노트북은 흔하다. 사장님만의 일이 아니다.
 *
 * ⭐ 그래서 «묻지 않고 본다». 마우스가 실제로 움직이면 그때 켠다.
 *   손가락은 pointerType 이 "touch" 라 절대 안 켜진다. 하이브리드 기기에서 손가락으로
 *   건드리면 도로 끈다 — 안 그러면 «눌렀던 카드 하나만 떠 있는» 화면이 된다.
 *   (그 «붙어 있는 hover» 를 막으려고 미디어 쿼리를 썼던 것이니, 막는 일 자체는 그대로다.)
 *
 * 쓰는 법 — CSS 에서 html[data-마우스="on"] 안에 넣으면 된다. app/globals.css 의
 * data-들썩 이 그렇게 쓰고 있다.
 */
"use client";

import { useEffect } from "react";

export function MouseWatch() {
  useEffect(() => {
    /* 아주 옛 브라우저엔 PointerEvent 가 없다. 없으면 «마우스 있다»로 켜 둔다 —
       그런 브라우저는 대개 손가락 기기가 아니고, 안 켜면 아무 반응이 없는 화면이 된다. */
    const 뿌리 = document.documentElement;
    if (typeof window.PointerEvent === "undefined") {
      뿌리.dataset.마우스 = "on";
      return;
    }

    /* ⚠ pointermove 는 마우스를 움직이는 내내 쏟아진다. 매번 dataset 을 건드리면
       화면을 다시 계산하게 만든다. 바뀔 때만 적는다. */
    let 지금 = "";
    const 보기 = (e: PointerEvent) => {
      const 마우스냐 = e.pointerType === "mouse" || e.pointerType === "pen";
      const 새것 = 마우스냐 ? "on" : "";
      if (새것 === 지금) return;
      지금 = 새것;
      if (마우스냐) 뿌리.dataset.마우스 = "on";
      else delete 뿌리.dataset.마우스;
    };

    /* capture 로 듣는다. 화면 어딘가에서 이벤트를 멈춰 세워도 우리에겐 먼저 닿는다. */
    const 옵션 = { passive: true, capture: true } as const;
    window.addEventListener("pointerover", 보기, 옵션);
    window.addEventListener("pointermove", 보기, 옵션);
    window.addEventListener("pointerdown", 보기, 옵션);

    return () => {
      window.removeEventListener("pointerover", 보기, 옵션);
      window.removeEventListener("pointermove", 보기, 옵션);
      window.removeEventListener("pointerdown", 보기, 옵션);
      delete 뿌리.dataset.마우스;
    };
  }, []);

  return null;
}
