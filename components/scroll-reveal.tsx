/* 스크롤을 내리면 글·그림이 «따라 올라오는» 움직임. (2026-08-25 사장님 지시)
 *
 * 사장님이 https://www.ancors.co.kr/company 를 가리키셨다. 뜯어 보니 GSAP + ScrollTrigger
 * 를 쓰지만, 실제 움직임은 이 두 줄이 전부였다:
 *
 *   .ancors-fade            { opacity: 0; transform: translateY(32px); transition: .7s }
 *   .ancors-fade.is-visible { opacity: 1; transform: translateY(0) }
 *
 * 그래서 라이브러리를 안 들였다. GSAP+ScrollTrigger 는 눌러 담아도 60KB 가 넘는데,
 * 브라우저에 이미 있는 것들로 같은 것을 쉰 줄로 한다.
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

export function ScrollReveal() {
  useEffect(() => {
    /* ⚠ 「움직임을 줄여 주세요」로 맞춰 둔 분이 있다. 그분에겐 아무것도 안 움직인다.
       멀미·현기증을 겪는 분들이 실제로 쓰는 설정이다 — 예뻐 보이자고 무시하면 안 된다. */
    const 줄이기 = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (줄이기?.matches) return;

    /* ⚠ 아주 옛 브라우저엔 MutationObserver 나 rAF 가 없을 수 있다. 없으면 «다 보이게»
       두고 끝낸다. 움직임이 없는 것과 «글이 안 보이는 것»은 하늘과 땅 차이다. */
    if (typeof MutationObserver === "undefined" || typeof requestAnimationFrame === "undefined") return;

    /* 여기서부터 숨겼다 보여 준다는 표시. CSS 가 이 표시를 보고 첫 모습을 정한다.
       ⛔ 이 표시를 CSS 에 그냥 박아 두면 안 된다 — 자바스크립트가 막히거나 늦으면
          글이 통째로 안 보이는 화면이 된다. 켤 수 있을 때만 켠다.
       ⚠ 이름을 «나타남켬»으로 따로 둔다. 그냥 «나타남»으로 두면 html 자신이
          [data-나타남] 에 걸려 살피는 대상에 끼어든다. 해롭진 않지만 셈이 어긋난다. */
    const 뿌리 = document.documentElement;
    뿌리.dataset.나타남켬 = "on";

    /* ⛔ IntersectionObserver 를 쓰다 버렸다 (2026-08-25 실서버에서 잡았다).
       그것은 «들어왔다/나갔다»가 바뀔 때만 울린다. 그런데 화면을 훌쩍 건너뛰면 —
       닻 링크로 뛰거나, 뒤로 가기가 자리를 되살리거나, 손가락으로 확 튕기면 —
       그 칸은 「아래에서 안 보임」에서 「위에서 안 보임」으로 바뀐다. 둘 다 «안 보임»이라
       울리지 않는다. 그래서 그 칸은 영영 숨은 채로 남는다.
       실제로 실서버 맨 아래 칸(verify-flow)이 그랬다 — 끝까지 내려도 안 떴다.

       그래서 «자리를 직접 재는» 쪽으로 바꿨다. 스크롤할 때마다 화면에 프레임이 그려지기
       직전에 한 번, 아직 안 뜬 것들의 자리를 잰다. 지나갔든 들어왔든 한 번에 잡힌다.
       ⚠ 다 뜨고 나면 목록이 비고 «듣기를 그만둔다». 계속 재면 손해다.
       ⚠ requestAnimationFrame 으로 한 프레임에 한 번만 잰다. 스크롤 이벤트마다 재면
         손가락 한 번에 수십 번 재게 된다. */
    let 기다리는것: HTMLElement[] = [];
    let 예약 = 0;

    const 재기 = () => {
      예약 = 0;
      const 창키 = window.innerHeight || document.documentElement.clientHeight;
      /* 화면 아래끝에서 이만큼 못 미쳐도 미리 켠다 — 빨리 내려도 뒤늦게 뜨지 않게 */
      const 문턱 = 창키 * 0.88;
      const 남은: HTMLElement[] = [];
      for (const el of 기다리는것) {
        const 위 = el.getBoundingClientRect().top;
        if (위 < 문턱) el.classList.add("떴다");
        else 남은.push(el);
      }
      기다리는것 = 남은;
      if (!기다리는것.length) 듣기끄기();
    };
    const 예약하기 = () => {
      if (예약) return;
      예약 = requestAnimationFrame(재기);
    };
    let 듣는중 = false;
    const 듣기켜기 = () => {
      if (듣는중) return;
      듣는중 = true;
      window.addEventListener("scroll", 예약하기, { passive: true });
      window.addEventListener("resize", 예약하기, { passive: true });
    };
    const 듣기끄기 = () => {
      if (!듣는중) return;
      듣는중 = false;
      window.removeEventListener("scroll", 예약하기);
      window.removeEventListener("resize", 예약하기);
    };

    const 본것 = new WeakSet<Element>();
    const 걸기 = (어디: ParentNode) => {
      let 늘었나 = false;
      for (const el of Array.from(어디.querySelectorAll<HTMLElement>("[data-나타남]"))) {
        if (본것.has(el)) continue;
        본것.add(el);
        기다리는것.push(el);
        늘었나 = true;
      }
      if (늘었나) {
        듣기켜기();
        예약하기();
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
            기다리는것.push(n);
            듣기켜기();
          }
          걸기(n);
        }
      }
      예약하기();
    });
    지켜보기.observe(document.body, { childList: true, subtree: true });

    return () => {
      지켜보기.disconnect();
      듣기끄기();
      if (예약) cancelAnimationFrame(예약);
      delete 뿌리.dataset.나타남켬;
    };
  }, []);

  return null;
}
