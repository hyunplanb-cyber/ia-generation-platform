/* 스크롤을 내리면 글·그림이 «따라 올라오는» 움직임. (2026-08-25 사장님 지시)
 *
 * 사장님이 https://www.ancors.co.kr/company 를 가리키셨다. 뜯어 보니 GSAP + ScrollTrigger
 * 를 쓰지만, 실제 움직임은 이 두 줄이 전부였다:
 *
 *   .ancors-fade            { opacity: 0; transform: translateY(32px); transition: .7s }
 *   .ancors-fade.is-visible { opacity: 1; transform: translateY(0) }
 *
 * 그래서 라이브러리를 안 들였다. GSAP+ScrollTrigger 는 눌러 담아도 60KB 가 넘는데,
 * 브라우저에 이미 있는 IntersectionObserver 로 같은 것을 서른 줄로 한다.
 * 손님이 첫 화면을 보려고 60KB 를 더 받는 것은 값이 안 맞는다.
 *
 * 쓰는 법 — 움직이게 하고 싶은 곳에 «표시만» 붙인다.
 *
 *   <section data-나타남>…</section>
 *   <li data-나타남 data-늦게="2">…</li>     ← 줄줄이 나올 때 조금씩 늦춘다 (1~5)
 *
 * ⭐ 왜 «컴포넌트로 감싸지» 않고 표시(data-속성)로 하나
 *   마케팅 화면은 거의 다 서버 컴포넌트다. 감싸는 방식이면 그 화면들이 죄다 클라이언트
 *   컴포넌트가 되어 버린다 — 첫 화면이 느려지고, 서버에서 하던 일을 브라우저로 옮기게 된다.
 *   표시만 붙이면 서버 컴포넌트는 서버 컴포넌트 그대로 두고, 이 파일 하나만 클라이언트다.
 */
"use client";

import { useEffect } from "react";

/** 화면 아래쪽 이만큼 못 미쳐도 미리 켠다 — 스크롤을 빨리 내려도 뒤늦게 뜨지 않게. */
const 미리 = "0px 0px -12% 0px";

export function ScrollReveal() {
  useEffect(() => {
    /* ⚠ 「움직임을 줄여 주세요」로 맞춰 둔 분이 있다. 그분에겐 아무것도 안 움직인다.
       멀미·현기증을 겪는 분들이 실제로 쓰는 설정이다 — 예뻐 보이자고 무시하면 안 된다. */
    const 줄이기 = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (줄이기?.matches) return;

    /* ⚠ 아주 옛 브라우저엔 IntersectionObserver 가 없다. 없으면 «다 보이게» 두고 끝낸다.
       움직임이 없는 것과 «글이 안 보이는 것»은 하늘과 땅 차이다. */
    if (typeof IntersectionObserver === "undefined") return;

    /* 여기서부터 숨겼다 보여 준다는 표시. CSS 가 이 표시를 보고 첫 모습을 정한다.
       ⛔ 이 표시를 CSS 에 그냥 박아 두면 안 된다 — 자바스크립트가 막히거나 늦으면
          글이 통째로 안 보이는 화면이 된다. 켤 수 있을 때만 켠다. */
    const 뿌리 = document.documentElement;
    뿌리.dataset.나타남 = "on";

    const 본것 = new WeakSet<Element>();
    const 살핌 = new IntersectionObserver(
      (온것) => {
        for (const x of 온것) {
          if (!x.isIntersecting) continue;
          x.target.classList.add("떴다");
          살핌.unobserve(x.target); /* 한 번 뜨면 그만 — 오르내릴 때마다 껌뻑이면 어지럽다 */
        }
      },
      { rootMargin: 미리, threshold: 0.05 },
    );

    const 걸기 = (어디: ParentNode) => {
      for (const el of Array.from(어디.querySelectorAll<HTMLElement>("[data-나타남]"))) {
        if (본것.has(el)) continue;
        본것.add(el);
        살핌.observe(el);
      }
    };
    걸기(document);

    /* ⚠ 탭을 눌러 나중에 생기는 것들도 있다 (사용가이드의 세 탭이 그렇다).
       처음 한 번만 훑으면 탭을 옮긴 뒤엔 아무것도 안 움직인다. */
    const 지켜보기 = new MutationObserver((바뀜) => {
      for (const b of 바뀜) {
        for (const n of Array.from(b.addedNodes)) {
          if (!(n instanceof HTMLElement)) continue;
          if (n.matches("[data-나타남]") && !본것.has(n)) {
            본것.add(n);
            살핌.observe(n);
          }
          걸기(n);
        }
      }
    });
    지켜보기.observe(document.body, { childList: true, subtree: true });

    return () => {
      지켜보기.disconnect();
      살핌.disconnect();
      delete 뿌리.dataset.나타남;
    };
  }, []);

  return null;
}
