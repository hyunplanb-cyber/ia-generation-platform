"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SHOWCASE_VIDEO_ID } from "@/lib/site";
import type { HomeIndustry } from "@/lib/packages";

/* 카페인컬러 첫 화면 — 「카페인컬러 홈 리뉴얼 v2」 시안을 옮긴 것 (2026-08-26).
 *
 * ⚠ 위아래(머리·꼬리)는 여기 없다. 마케팅 레이아웃의 SiteHeader·footer 가 맡는다.
 *   시안에도 머리·꼬리가 그려져 있지만 그건 «홈에서 어떻게 보이나»를 그린 것이고,
 *   진짜 머리는 로그인 상태·크레딧 잔액·좁은 화면 메뉴를 안고 있어 홈만 보고 갈아치울 수 없다.
 *   그것을 바꾸면 사용가이드·구매·검수 화면의 머리도 함께 바뀐다.
 *
 * ⚠ 색은 아래 .cc 안에만 산다. 시안의 종이색(#F1EEE8)은 사이트 기본색(#FAFAFA)보다
 *   따뜻한데, 그것을 :root 로 올리면 대시보드·결제·로그인 화면까지 다 물든다.
 *
 * 움직임은 이미 있는 것을 쓴다 — data-나타남(스크롤 따라 올라오기)·data-들썩(마우스 올리면
 * 떠오르기)은 components/scroll-reveal.tsx 와 globals.css 가 맡는다. 시안이 들고 온
 * IntersectionObserver 는 안 옮겼다. 그것은 화면을 훌쩍 건너뛰면 안 울려 그 칸이 영영
 * 숨는다 — 2026-08-25 에 실서버에서 잡아 이미 버린 방식이다.
 */

/* 첫 화면 밑을 흘러가는 띠 — AI팩과 검수가 내놓는 것들 */
const 흐르는말 = [
  "IA · 화면목록",
  "기능정의서",
  "화면별 프롬프트",
  "AI 빌드 지시서",
  "FLOW 흐름도",
  "개발 일정표",
  "검수 시나리오",
  "PASS / FAIL 결과서",
];

/* 첫 화면 오른쪽 미리보기 — 실제 산출물에서 그대로 뽑은 네 줄씩 */
const 화면목록미리 = [
  { id: "PCPR1000", name: "상품 목록 · 데이터 있음", tag: "자동" },
  { id: "PCPR1001", name: "상품 목록 · 비어 있음", tag: "예외" },
  { id: "PCCA1001", name: "장바구니 · 비어 있음", tag: "예외" },
  { id: "PCCH1002", name: "결제 · 실패", tag: "예외" },
];
const 검수미리 = [
  { id: "AUTO-02", name: "모바일 대응", tag: "PASS", kind: "pass" },
  { id: "AUTO-06", name: "이미지 깨짐", tag: "FAIL", kind: "fail" },
  { id: "SCN-01", name: "로그인 · 재현 확인", tag: "직접", kind: "man" },
  { id: "SCN-02", name: "결제 · 재현 확인", tag: "직접", kind: "man" },
];

const 산출물 = [
  { no: "01", ext: "XLSX", title: "메뉴 구조", desc: "메뉴–화면 트리" },
  { no: "02", ext: "XLSX", title: "화면 목록", desc: "화면 하나하나 + AI 프롬프트" },
  { no: "03", ext: "XLSX", title: "기능정의서", desc: "화면마다 뭘 해야 하는지" },
  { no: "04", ext: "HTML", title: "FLOW 흐름도", desc: "화면 이동 연결" },
  { no: "05", ext: "XLSX", title: "개발 일정표", desc: "화면별 개발 일정" },
  { no: "06", ext: "MD", title: "AI 빌드 지시서", desc: "넣고 한 마디면 끝" },
];

/* 다른 AI 기획 도구에 같은 한 줄을 넣어 봤을 때 «없던» 화면들.
   ⚠ 그 도구의 이름은 적지 않는다 — 비교광고가 되면 우리가 감당할 수 없다. */
const 빠진화면 = [
  "고수의 후기 기능",
  "고수가 볼 수 있는 홈 화면",
  "견적서 관리 · 보내기",
  "검색 · 결과 없음",
  "저장함 · 비어 있음",
];

const 돌린기록 = [
  { n: 144, label: "이렇게 나온 화면" },
  { n: 40, label: "걸린 시간, 분" },
  { n: 1, label: "넣은 파일은 하나" },
];

const 내놓는법 = [
  { no: "01", text: "세상에 올리기 · 도메인 · 자물쇠(HTTPS)" },
  { no: "02", text: "회원가입·로그인 · 데이터 저장" },
  { no: "03", text: "결제 받기 — 심사 두 달 동안 할 일" },
  { no: "04", text: "사진·영상 · AI 기능 붙이기" },
  { no: "05", text: "잘못 올렸을 때 되돌리기" },
  { no: "06", text: "오픈 전 마지막 점검표" },
];

const 넣는것 = [
  {
    no: "01 · 카페인컬러 AI팩",
    badge: "가장 정확해요",
    title: "여기서 만든 AI팩",
    desc: "이 프로젝트로 만든 AI팩을 그대로 씁니다. 화면과 요건을 다 알고 있으니 짚어드리는 것도 촘촘해요.",
    warn: "",
  },
  {
    no: "02 · 사이트 주소",
    badge: "결과까지 나와요",
    title: "사이트 주소 한 줄",
    desc: "지금 올려둔 사이트를 넣으면 공개 화면은 Pass·Fail 결과까지 함께 드려요.",
    warn: "로그인·결제 화면은 저희가 대신 누를 수 없어, 확인 순서로 드립니다.",
  },
  {
    no: "03 · 가지고 계신 문서",
    badge: "문서에서 뽑아요",
    title: "기획서 · 화면설계서",
    desc: "화면설계서나 기획서를 PDF로 내보내 넣어주시면 확인할 것들을 뽑아드려요.",
    warn: "문서에 적힌 게 많을수록 정확해요. 문서만으론 결과 대신 확인 순서까지.",
  },
];

const 검수결과물 = [
  { title: "검수 현황", desc: "통과·실패·주의를 한눈에" },
  { title: "자동 검사 결과서", desc: "항목마다 화면인지 기능인지" },
  { title: "확인 순서", desc: "공개·로그인·결제 눌러보는 순서" },
  { title: "엑셀 결과서", desc: "표지부터 현황까지 한 벌로" },
];

export function HomeLanding({
  packs,
  saleOpen,
}: {
  packs: HomeIndustry[];
  /** 우리 사이트에서 «지금 살 수 있나»(lib/flags.ts). 아니면 「자세히 보기」로 말을 낮춘다. */
  saleOpen: boolean;
}) {
  const [고른업종, 업종고르기] = useState(0);
  const 뿌리 = useRef<HTMLDivElement>(null);
  const 막대 = useRef<HTMLDivElement>(null);
  const 얼룩 = useRef<HTMLDivElement>(null);

  /* 얼마나 읽었나 — 맨 위 3px 띠. 딸려서 첫 화면 얼룩도 아주 조금 뒤처져 움직인다.
     ⚠ 스크롤마다 재지 않고 한 프레임에 한 번만 잰다. 안 그러면 손가락 한 번에 수십 번 잰다. */
  useEffect(() => {
    let 예약 = 0;
    const 재기 = () => {
      예약 = 0;
      const y = window.scrollY || 0;
      const 끝 = document.documentElement.scrollHeight - window.innerHeight;
      if (막대.current) 막대.current.style.width = (끝 > 0 ? (y / 끝) * 100 : 0) + "%";
      if (얼룩.current) 얼룩.current.style.transform = `translate3d(0,${(y * 0.09).toFixed(1)}px,0)`;
    };
    const 예약하기 = () => {
      if (!예약) 예약 = requestAnimationFrame(재기);
    };
    window.addEventListener("scroll", 예약하기, { passive: true });
    window.addEventListener("resize", 예약하기, { passive: true });
    재기();
    return () => {
      window.removeEventListener("scroll", 예약하기);
      window.removeEventListener("resize", 예약하기);
      if (예약) cancelAnimationFrame(예약);
    };
  }, []);

  /* 숫자가 0에서 차오른다.
     ⭐ 화면(HTML)에는 «다 찬 수»를 적어 둔다. 여기서 0부터 적으면 스크립트가 막히거나
       그 칸을 훌쩍 건너뛴 분에게 「0」만 남는다 — 안 움직이는 것보다 나쁜, 틀린 숫자다. */
  useEffect(() => {
    const 줄이기 = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (줄이기?.matches) return;
    if (typeof IntersectionObserver === "undefined") return;
    const 칸 = 뿌리.current;
    if (!칸) return;
    const 그림들: number[] = [];
    const 본다 = new IntersectionObserver(
      (들) => {
        for (const e of 들) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          본다.unobserve(el);
          const 끝 = Number(el.dataset.세기);
          if (!끝) continue;
          const 시작 = performance.now();
          const 한번 = (지금: number) => {
            const p = Math.min(1, (지금 - 시작) / 900);
            el.textContent = String(Math.round(끝 * (1 - Math.pow(1 - p, 3))));
            if (p < 1) 그림들.push(requestAnimationFrame(한번));
          };
          그림들.push(requestAnimationFrame(한번));
        }
      },
      { threshold: 0.5 },
    );
    for (const el of Array.from(칸.querySelectorAll<HTMLElement>("[data-세기]"))) 본다.observe(el);
    return () => {
      본다.disconnect();
      for (const t of 그림들) cancelAnimationFrame(t);
    };
  }, []);

  const 업종 = packs[고른업종] ?? packs[0];

  return (
    <div className="cc" ref={뿌리}>
      {/* 얼마나 읽었나 */}
      <div className="prog" aria-hidden="true">
        <div ref={막대} />
      </div>

      {/* ── 첫 화면 ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="blob" ref={얼룩} aria-hidden="true" />
        <div className="wrap">
          <div className="pill" data-나타남>
            <span className="dot" aria-hidden="true" />
            만들기 전에 한 번, 오픈 전에 한 번
          </div>

          <h1 data-나타남>
            만들기 전엔 <span className="o">설계도.</span>
            <br />
            오픈 전엔 <span className="t">검수.</span>
          </h1>

          <div className="hero-grid">
            <div className="hero-copy" data-나타남>
              <p>
                바이브코딩으로 사이트 만드는 사람을 위한 두 가지.
                <br />
                <b>컨셉 한 줄</b>이면 → 화면별 프롬프트와 AI 빌드 지시서 (Cursor·Claude Code에 바로).
                <br />
                <b>URL 한 줄</b>이면 → 오픈 전 검수 결과서.
              </p>
              <div className="ctas">
                {/* /dashboard/new 는 열리는 즉시 새 프로젝트를 만드는 자리라,
                    프리페치가 켜져 있으면 마우스만 올려도 프로젝트가 생긴다. */}
                <Link className="btn btn-ink" href="/dashboard/new" prefetch={false}>
                  AI팩 만들기 <span aria-hidden="true">→</span>
                </Link>
                <Link className="btn btn-paper" href="/verify">
                  내 사이트 검수하기 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="hero-cards" data-나타남>
              <div className="mini">
                <div className="mini-h">
                  <span>02_IA_화면목록.xlsx</span>
                  <span>43</span>
                </div>
                {화면목록미리.map((r) => (
                  <div className="mini-r" key={r.id}>
                    <span className="mid o">{r.id}</span>
                    <span className="mnm">{r.name}</span>
                    <span className="mtg">{r.tag}</span>
                  </div>
                ))}
              </div>
              <div className="mini">
                <div className="mini-h">
                  <span>검수 결과</span>
                  <span>
                    <span className="pass">9</span> / <span className="fail">3</span>
                  </span>
                </div>
                {검수미리.map((r) => (
                  <div className="mini-r" key={r.id}>
                    <span className="mid">{r.id}</span>
                    <span className="mnm">{r.name}</span>
                    <span className={`mtg ${r.kind}`}>{r.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 흘러가는 띠 — 우리가 내놓는 것들의 이름표.
            ⚠ 여기만 .wrap(가운데 1240px) 밖에 둔다. 화면 끝에서 끝까지 흘러야
              «끊기지 않고 지나간다»는 느낌이 산다(2026-08-26 사장님 지시).
            ⚠ 같은 벌을 «넷» 이어 붙인다. 애니메이션이 track 의 절반(=두 벌)만큼 밀고
              처음으로 돌아가는데, 그 두 벌이 화면보다 좁으면 돌아가는 순간 뒤가 비어
              빈 칸이 지나간다. 둘만 붙였을 땐 1240px 안에 갇혀 있어 안 드러났지만,
              화면을 다 쓰면 넓은 모니터에서 바로 보인다. 넷이면 2,700px 까지 덮는다. */}
        <div className="marquee">
          <div className="mq-track">
            {[0, 1, 2, 3].map((n) => (
              <div className="mq-set" key={n} aria-hidden={n !== 0}>
                {흐르는말.map((w) => (
                  <span className="mq-i" key={w}>
                    {w}
                    <span className="mq-x" aria-hidden="true">
                      ✳
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 01 AI팩 만들기 ───────────────────────────────────── */}
      <section className="sec" id="track-01">
        <div className="wrap">
          <div className="lead-row" data-나타남>
            <div className="lead-copy">
              <span className="eye">01 AI팩 만들기</span>
              <h2>
                한 줄 컨셉이
                <br />
                바로 만들 <span className="o">재료</span>가 됩니다.
              </h2>
              <p>
                메뉴 구조·화면 목록·기능정의·흐름·일정까지 자동으로. 여기서 끝이 아니라{" "}
                <b>화면별 프롬프트와 AI 빌드 지시서</b>까지 나와, Cursor·Claude Code에 그대로 넣으면
                화면이 됩니다.
              </p>
            </div>
            <div className="fig">
              <Image
                src="/character/02_home_concept_to_aipack.webp"
                alt="한 줄 컨셉을 메뉴·화면 목록·기능정의·흐름·일정으로 뽑아내는 카페인컬러 캐릭터"
                width={899}
                height={967}
                priority
                sizes="(max-width: 1080px) 300px, 420px"
              />
            </div>
          </div>

          <ol className="cards6">
            {산출물.map((d) => (
              <li className="card6" key={d.no} data-나타남 data-들썩>
                <span className="tag">
                  {d.no} · {d.ext}
                </span>
                <span className="c6t">{d.title}</span>
                <span className="c6d">{d.desc}</span>
              </li>
            ))}
          </ol>

          {/* 「AI는 잘 되는 화면만 만든다」는 우리 주장이었는데, 이제 재 본 기록이 있다.
              ⚠ 그 도구의 이름은 쓰지 않는다. 비교광고가 되면 우리가 감당할 수 없다. */}
          <div className="cmp">
            <div className="cmp-copy" data-나타남>
              <span className="eye">직접 비교했어요</span>
              <h3>
                한 줄 프롬프트로
                <br />
                AI 도구에서 사이트를
                <br />
                만들어 봤어요.
              </h3>
              <p>
                돌아온 화면 목록에 이런 게 없었어요. 손님이 볼 화면은 그럴듯했는데, 정작 내가 매일
                열어야 할 화면이 통째로 비어 있었습니다.
              </p>
              <p className="fine">
                &lsquo;숨고 같은 사이트 만들어줘. 견적을 요청하고 서로 소통하고, 일정을 잡는 사이트
                만들어줘.&rsquo;
                <br />한 줄로 직접 비교했어요(2026년 8월). 그 도구가 낸 화면은 「요청자 화면」뿐이었고,
                「고수 화면」은 없었습니다. 요청서를 보냈지만, 받는 사람은 고려되지 않았어요.
              </p>
            </div>
            <div className="miss">
              {빠진화면.map((m) => (
                <div className="miss-r" key={m} data-나타남>
                  <span className="x" aria-hidden="true">
                    ✕
                  </span>
                  <span className="mtx">{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 직접 돌려봤어요 (어두운 칸) ────────────────────────── */}
      <section className="sec sec-tight">
        <div className="wrap">
          <div className="dark">
            <div className="dk-top">
              <div className="dk-copy" data-나타남>
                <span className="eye warm">직접 돌려봤어요</span>
                <h2>
                  AI팩을 AI 도구에 넣고
                  <br />
                  만들어 봤어요.
                </h2>
                <p>
                  지시서 파일 하나를 Claude Code에 넣고 돌린 기록이에요.
                  <br />
                  위에 적은 빠지기 쉬운 화면까지 한 벌로 넣어 돌렸고, 약 40분 만에 화면 144개가
                  만들어졌습니다.
                </p>
              </div>
              <div className="stats">
                {돌린기록.map((s) => (
                  <div className="stat" key={s.label} data-나타남>
                    <span className="sn" data-세기={s.n}>
                      {s.n}
                    </span>
                    <span className="sl">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="vid" data-나타남>
              <div className="vid-h">
                <span>Claude Code에 넣고 돌린 화면, 그대로 녹화</span>
                <span className="rec">● 실제 기록</span>
              </div>
              <div className="vid-f">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${SHOWCASE_VIDEO_ID}`}
                  title="AI팩(빌드 지시서)으로 화면 144개를 만드는 기록"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 함께 드려요 — 내놓는 법 ───────────────────────────── */}
      <section className="sec">
        <div className="wrap">
          <div className="ship">
            <div className="ship-copy" data-나타남>
              <span className="eye">함께 드려요</span>
              <h3>
                만들고 나서 배포하는 방법,
                <br />
                앱으로 만드는 방법을
                <br />
                적어 뒀어요.
              </h3>
              <p>
                화면은 다 만들었는데 <b>내 컴퓨터에서만 보이는</b> 데서 멈추시는 분이 많습니다. 처음엔
                저희도 어려웠어요. 그때 알게 된 것을 <b>「만든 사이트를 세상에 내놓는 법」</b>으로
                정리해 결과물에 함께 넣었습니다.
              </p>
              <Link className="btn btn-ink" href="/dashboard/new" prefetch={false}>
                무료로 만들어보기 <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ol className="guide">
              {내놓는법.map((g) => (
                <li className="guide-r" key={g.no} data-나타남 data-들썩>
                  <span className="gn">{g.no}</span>
                  <span className="gt">{g.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 02 검수 ─────────────────────────────────────────── */}
      <section className="sec sec-tight" id="track-02">
        <div className="wrap">
          <div className="band">
            <div className="lead-row" data-나타남>
              <div className="lead-copy">
                <span className="eye">02 검수 시나리오</span>
                <h2>
                  사람처럼 눌러보며
                  <br />
                  진짜 다 되는지,
                  <br />
                  <span className="o">검수합니다.</span>
                </h2>
                <p>
                  전문 에이전시에서는 반드시 거치는 단계예요. 하지만 바이브코딩은 이 부분을
                  지나칩니다. URL이나 설계 문서를 넣으면 확인할 것을 시나리오로 짚어주고, 공개 화면은
                  검수 결과(Pass/Fail)까지 냅니다.
                </p>
              </div>
              <div className="fig">
                <Image
                  src="/character/05_home_site_inspection.webp"
                  alt="공개 화면을 통과·실패·주의로 가려 검수하는 카페인컬러 캐릭터"
                  width={783}
                  height={681}
                  sizes="(max-width: 1080px) 300px, 380px"
                />
              </div>
            </div>

            <div className="cards3">
              {넣는것.map((i) => (
                <div className="in" key={i.no} data-나타남 data-들썩>
                  <div className="in-h">
                    <span className="in-n">{i.no}</span>
                    <span className="in-b">{i.badge}</span>
                  </div>
                  <span className="in-t">{i.title}</span>
                  <span className="in-d">{i.desc}</span>
                  {i.warn ? (
                    <span className="in-w">
                      <span aria-hidden="true">⚠</span> {i.warn}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="vgrid">
              <div className="vleft">
                <div className="vbox" data-나타남>
                  <span className="vb-tag pass">공개 화면</span>
                  <span className="vb-t">누구나 보는 화면</span>
                  <span className="vb-d">사람처럼 눌러보고 Pass·Fail로 알려드려요</span>
                </div>
                <div className="vbox" data-나타남>
                  <span className="vb-tag fail">민감한 화면</span>
                  <span className="vb-t">로그인 · 결제 화면</span>
                  <span className="vb-d">
                    민감한 화면은 직접 확인하실 수 있도록 순서를 적어드려요
                  </span>
                </div>
                {/* 단추는 결과서 상자 «안»에 있었다 — 결과서의 일부처럼 보여서,
                    「이 결과서를 눌러라」인지 「내 사이트를 맡겨라」인지 흐렸다.
                    왼쪽 칸 바닥으로 뺐다(2026-08-26 사장님 지시). 여기는 「무엇을 봐 드리나」를
                    말하는 칸이라, 그 말끝에 「그럼 맡겨 보세요」가 오는 것이 자연스럽다.
                    비어 있던 아래쪽도 이걸로 채워진다. */}
                <Link className="btn btn-ink btn-wide" href="/verify">
                  내 사이트 검수하기 <span aria-hidden="true">→</span>
                </Link>
              </div>

              {/* 예시 주소는 남의 것도 우리 것도 아닌 가상의 주소를 쓴다.
                  우리 주소를 쓰면 아래 실패 세 줄이 「이 사이트가 지금 이렇게 망가져 있다」로 읽힌다. */}
              <div className="report" data-나타남>
                <div className="rp-h">
                  <span>검수 결과 · myshop.co.kr</span>
                  <span className="dim">공개 12화면</span>
                </div>
                <div className="rp-s">
                  <div className="rs pass">
                    <span className="rsn" data-세기="9">
                      9
                    </span>
                    <span className="rsl">PASS</span>
                  </div>
                  <div className="rs fail">
                    <span className="rsn" data-세기="3">
                      3
                    </span>
                    <span className="rsl">FAIL</span>
                  </div>
                </div>
                <div className="rp-f">
                  <div className="rf">
                    <span className="x" aria-hidden="true">
                      ✕
                    </span>
                    모바일에서 신청 버튼이 화면 밖으로 나감
                  </div>
                  <div className="rf">
                    <span className="x" aria-hidden="true">
                      ✕
                    </span>
                    &lsquo;장바구니 비어 있음&rsquo; 화면 없음
                  </div>
                  <div className="rf">
                    <span className="x" aria-hidden="true">
                      ✕
                    </span>
                    상품 목록 대표 이미지 깨짐
                  </div>
                </div>
                <div className="rp-c">이런 결과물을 받아요</div>
                <div className="rp-o">
                  {검수결과물.map((o) => (
                    <div className="ro" key={o.title}>
                      <span className="rot">{o.title}</span>
                      <span className="rod">{o.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 업종별 팩 ────────────────────────────────────── */}
      <section className="sec" id="packs">
        <div className="wrap">
          <div className="packs-top">
            <div className="lead-copy" data-나타남>
              <span className="eye">03 업종별 팩 사기</span>
              <h2>
                바로 사용하는
                <br />
                업종별 AI팩
              </h2>
              <p>
                직접 만들기 전에, 이미 완성된 업종별 결과물 한 벌부터. 화면·예외까지 다 들어있어요.
              </p>
            </div>
            <Link className="btn btn-paper" href="/packages">
              AI팩 더보기 <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="tabs" role="tablist" aria-label="업종 고르기">
            {packs.map((p, i) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                id={`tab-${p.key}`}
                aria-selected={i === 고른업종}
                aria-controls="plan-panel"
                tabIndex={i === 고른업종 ? 0 : -1}
                className={i === 고른업종 ? "tab on" : "tab"}
                onClick={() => 업종고르기(i)}
              >
                {p.tab}
              </button>
            ))}
          </div>

          <div
            className="plans"
            id="plan-panel"
            role="tabpanel"
            aria-labelledby={`tab-${업종?.key ?? ""}`}
          >
            {(업종?.plans ?? []).map((p) => (
              <Link className="plan" href={p.href} key={p.id} data-들썩>
                <span className="pl-tier">{p.tier}</span>
                <span className="pl-name">{업종.name}</span>
                <span className="pl-scope">{p.scope}</span>
                <span className="pl-price">
                  {p.credits === null ? (
                    "판매 준비 중"
                  ) : (
                    <>
                      <b>{p.credits.toLocaleString()}</b> 크레딧
                    </>
                  )}
                </span>
                {/* 값은 내걸었지만 아직 못 사는 동안 — 구매 목록 화면과 같은 말을 쓴다.
                    값 자리가 이미 「판매 준비 중」이면 여기선 안 적는다(같은 말 두 번). */}
                {p.credits !== null && !saleOpen ? (
                  <span className="pl-soon">판매 준비 중</span>
                ) : null}
                {/* 구성 목록은 홈·목록·상세가 «같은 출처(planContents)와 같은 모양»을 쓴다.
                    한 줄에 하나씩 세우면 카드가 두 배로 길어져 넷을 견주기 어렵다. */}
                <span className="pl-items">
                  {p.items.map((it) => (
                    <span className="pl-i" key={it}>
                      {it}
                    </span>
                  ))}
                </span>
                <span className="pl-go">{saleOpen ? "구매하기 →" : "자세히 보기 →"}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 마지막 ──────────────────────────────────────────── */}
      <section className="sec sec-last">
        <div className="wrap">
          <div className="dark cta" data-나타남>
            <h2>
              바이브코딩으로
              <br />
              원하는 사이트 만들고
              <br />
              오픈할 준비 되셨나요?
            </h2>
            <div className="cta-r">
              <p>
                AI는 편리하고 빠르죠. 하지만 원하는 대로 나왔는지, 정말 오픈해도 되는지 하나씩
                눌러보는 건 결국 우리 몫이에요. 내 서비스, 내 사이트잖아요 — 어떤 화면이 만들어질지
                알고 만들고, 진짜 오픈해도 되는지 꼭 확인해보세요.
              </p>
              <div className="ctas">
                <Link className="btn btn-o" href="/dashboard/new" prefetch={false}>
                  AI팩 만들기 <span aria-hidden="true">→</span>
                </Link>
                <Link className="btn btn-ghost" href="/verify">
                  내 사이트 검수하기 <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .cc {
          --paper: #f1eee8;
          --ink: #191713;
          /* 2026-09-02 — 옅은 바탕(#F7F5F1) 위에서 3.99 였다. 색기는 그대로 두고 밝기만 내렸다. */
          --o: #b23b1a; /* 흰 5.94 · 옅은 바탕 5.46 · 흘러가는 띠(#E7E2D8) 4.60 */
          --t1: #5c5545;
          /* 2026-09-02 — 작은 꼬리표가 #F4F1EA 위에서 4.36 이었다. */
          --t2: #746d5d; /* 4.55~4.92 */
          /* 2026-09-02 — 이 색이 여덟 건 가운데 여섯을 냈다. 9~10px 잔글씨가 2.71,
             40px 「검수.」가 2.34 였다(큰 글자 기준 3.0). 옅게 보이라고 둔 색인데
             «안 읽히는» 데까지 가 있었다. 옅음은 지키고 읽히는 데까지만 내린다. */
          --t3: #736954; /* 흰 바탕 5.42 · 가장 어두운 바탕 4.68 */
          /* 2026-09-02 — 옅은 설명이 #E9E4DA 위에서 2.92 였다. 옅음은 지키되 읽히는 데까지. */
          --t4: #6a6458; /* 4.63~5.87 */
          --band: #e7e2d8;
          --band2: #eae5db;
          --band3: #e9e4da;
          --tint: #f4f1ea;
          --tint2: #f7f5f1;
          --tint3: #fbfaf7;
          --pass: #1f6b48;
          /* 2026-09-02 — ✕ 표가 옅은 붉은 칸(#E3CCC1) 위에서 3.54 였다. */
          --fail: #a33024; /* 4.55~6.99 */
          --warm: #e8956f;
          /* 2026-09-02 — 큰 숫자라 기준이 3.0 인데 2.90 이었다. --primary 와 같이 간다. */
          --num: #bc5918;

          background: var(--paper);
          color: var(--ink);
          overflow-x: hidden;
          text-wrap: pretty;
          word-break: keep-all;
          -webkit-font-smoothing: antialiased;
        }
        /* ⚠ 좌우 여백은 시안의 20px 이 아니라 사이트 기준인 24px 이다(px-6).
           같은 팩 카드가 구매 목록·팩 상세에도 나오는데, 거기 여백이 24px 이라
           20px 로 두면 카드 폭이 291 대 289 로 2px 어긋난다. 눈에는 안 보여도
           「셋이 같아야 한다」는 약속이 숫자로 깨진다(2026-08-26). */
        .wrap {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* 얼마나 읽었나 — 머리(z-30) 위에 얹는다 */
        .prog {
          position: fixed;
          inset: 0 0 auto 0;
          height: 3px;
          z-index: 40;
          pointer-events: none;
        }
        .prog > div {
          height: 3px;
          width: 0;
          background: var(--o);
          border-radius: 0 3px 3px 0;
        }

        /* ── 첫 화면 ── */
        .hero {
          position: relative;
          padding: 88px 0 0;
        }
        .blob {
          position: absolute;
          inset: -14% -8% auto -8%;
          height: 130%;
          background-image:
            radial-gradient(closest-side at 18% 22%, rgba(215, 72, 31, 0.16), transparent),
            radial-gradient(closest-side at 84% 6%, rgba(233, 205, 150, 0.4), transparent);
          filter: blur(10px);
          pointer-events: none;
        }
        .hero > .wrap {
          position: relative;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px 8px 10px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 100px;
          font-size: 12px;
          letter-spacing: 0.1em;
          color: var(--t2);
          white-space: nowrap;
        }
        .dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--o);
        }
        .hero h1 {
          margin: 26px 0 0;
          font-size: clamp(40px, 8.6vw, 138px);
          line-height: 0.98;
          letter-spacing: -0.055em;
          font-weight: 600;
        }
        .hero h1 .o {
          color: var(--o);
        }
        .hero h1 .t {
          color: #736954;
        }
        /* ⚠ 아래 여백(112px)이 첫 화면과 흘러가는 띠 사이의 «유일한» 틈이다.
             띠는 .wrap 밖에 있어서 자기 위쪽 여백을 갖지 않는다 — 여기를 줄이면
             카드와 띠가 곧바로 붙는다(2026-08-26 사장님: 「두 개 사이 간격 넓혀줘」). */
        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.86fr);
          gap: 44px;
          align-items: end;
          padding: 52px 0 112px;
        }
        .hero-copy p {
          margin: 0;
          font-size: 18px;
          line-height: 1.72;
          color: var(--t1);
          max-width: 720px;
        }
        .hero-copy b {
          color: var(--ink);
          font-weight: 600;
        }
        .ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        /* 단추 — «:global 로 감싸는 까닭»
           styled-jsx 는 이 파일이 «직접 쓴 태그»에만 제 반 이름을 붙인다. <Link> 는 우리
           태그가 아니라 next/link 의 컴포넌트라 안 붙는다. 그냥 .btn 이라고 적으면 규칙이
           통째로 헛돌아 단추가 맨몸 글자로 나온다 — 옮기던 날 실제로 그랬다.
           .cc 로 이 화면 안에 가둬 두고 :global 로 감싸면 남의 화면으로 새지 않는다. */
        .cc :global(.btn) {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          white-space: nowrap;
          padding: 19px 32px;
          font-size: 15px;
          font-weight: 500;
          border-radius: 100px;
          transition:
            background 0.28s,
            color 0.28s,
            transform 0.28s,
            box-shadow 0.28s;
        }
        .cc :global(.btn-ink) {
          background: var(--ink);
          color: var(--paper);
          box-shadow: 0 12px 30px rgba(25, 23, 19, 0.18);
        }
        .cc :global(.btn-paper) {
          background: rgba(255, 255, 255, 0.9);
          color: var(--ink);
          box-shadow: 0 8px 22px rgba(25, 23, 19, 0.07);
        }
        .cc :global(.btn-o) {
          background: var(--o);
          color: #fff;
        }
        .cc :global(.btn-ghost) {
          background: rgba(241, 238, 232, 0.1);
          color: var(--paper);
        }
        /* ⚠ margin-top: auto — 왼쪽 칸의 «바닥»에 붙는다. 그래야 두 칸이 같은 선에서
             끝나 격자가 안 흐트러진다. 칸이 안 늘어나는 좁은 화면에서는 저절로
             두 상자 바로 밑에 붙는다(늘 자리가 없으면 auto 는 0이다). */
        .cc :global(.btn-wide) {
          display: flex;
          justify-content: center;
          padding: 18px;
          margin-top: auto;
        }
        /* ⛔ 문지기가 @media (hover: hover) 가 «아니다». 사장님 노트북이 터치스크린이라
           윈도우가 그것을 손가락 기기로 알려, 그 안에 넣은 것이 하나도 안 걸렸다.
           components/mouse-watch.tsx 가 마우스가 실제로 움직일 때만 표시를 붙인다. */
        :global(html[data-마우스="on"]) .cc :global(.btn-ink):hover {
          background: var(--o);
          transform: translateY(-2px);
        }
        :global(html[data-마우스="on"]) .cc :global(.btn-paper):hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(25, 23, 19, 0.12);
        }
        :global(html[data-마우스="on"]) .cc :global(.btn-o):hover,
        :global(html[data-마우스="on"]) .cc :global(.btn-ghost):hover {
          background: var(--paper);
          color: var(--ink);
          transform: translateY(-2px);
        }

        /* 첫 화면 미리보기 두 장 */
        .hero-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .mini {
          background: #fff;
          border-radius: 16px;
          padding: 6px;
          box-shadow: 0 14px 36px rgba(25, 23, 19, 0.08);
          overflow: hidden;
        }
        .mini-h {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 12px;
          font-size: 10px;
          color: var(--t3);
        }
        .mini-h .pass {
          color: var(--pass);
        }
        .mini-h .fail {
          color: var(--fail);
        }
        .mini-r {
          display: grid;
          grid-template-columns: 62px minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
          padding: 10px 12px;
          margin-bottom: 3px;
          background: var(--tint2);
          border-radius: 9px;
          font-size: 11px;
        }
        .mid {
          color: var(--t3);
        }
        .mid.o {
          color: var(--o);
        }
        .mnm {
          color: var(--t1);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mtg {
          font-size: 9px;
          color: var(--t3);
        }
        .mtg.pass {
          color: var(--pass);
        }
        .mtg.fail {
          color: var(--fail);
        }

        /* 흘러가는 띠 */
        /* ⚠ 모서리를 뗐다. 가운데 1240px 안에 있을 땐 «알약»이라 끝이 둥근 게 맞았는데,
             화면을 꽉 채우면 그 둥근 끝이 화면 밖으로 나가 잘린 자국처럼 보인다. */
        .marquee {
          overflow: hidden;
          background: var(--band);
          padding: 16px 0;
        }
        .mq-track {
          display: flex;
          width: max-content;
          animation: cc-mq 30s linear infinite;
        }
        .mq-set {
          display: flex;
          gap: 34px;
          padding-right: 34px;
          font-size: 12px;
          letter-spacing: 0.14em;
          color: var(--t2);
          white-space: nowrap;
        }
        .mq-i {
          display: inline-flex;
          gap: 34px;
        }
        .mq-x {
          color: var(--o);
        }
        @keyframes cc-mq {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        /* 「움직임을 줄여 주세요」로 맞춰 두신 분에게는 흐르지 않는다 */
        @media (prefers-reduced-motion: reduce) {
          .mq-track {
            animation: none;
          }
        }

        /* ── 절 공통 ── */
        .sec {
          padding: 110px 0;
        }
        .sec-tight {
          padding: 0;
        }
        /* 시안은 꼬리까지 같은 종이색이라 아래 여백이 0이었다. 우리 꼬리는 «흰» 칸이라
           그대로 두면 검은 카드가 흰 칸에 바로 부딪는다 — 종이를 한 뼘 남겨 준다. */
        .sec-last {
          padding: 110px 0 72px;
        }
        .eye {
          display: block;
          font-size: 11px;
          letter-spacing: 0.2em;
          color: var(--o);
        }
        .eye.warm {
          color: var(--warm);
        }
        .lead-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.62fr);
          gap: 48px;
          align-items: end;
        }
        .lead-copy h2 {
          margin: 22px 0 0;
          font-size: clamp(32px, 4.4vw, 68px);
          line-height: 1.06;
          letter-spacing: -0.045em;
          font-weight: 600;
        }
        .lead-copy h2 .o {
          color: var(--o);
        }
        .lead-copy p {
          margin: 22px 0 0;
          max-width: 560px;
          font-size: 17px;
          line-height: 1.75;
          color: var(--t1);
        }
        .lead-copy b {
          color: var(--ink);
          font-weight: 600;
        }
        .fig {
          justify-self: end;
        }
        .fig :global(img) {
          display: block;
          width: 100%;
          max-width: 420px;
          height: auto;
        }

        /* 산출물 여섯 칸 */
        .cards6 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin: 48px 0 0;
          padding: 0;
          list-style: none;
        }
        .card6 {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 30px 28px 34px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 10px 28px rgba(25, 23, 19, 0.06);
        }
        .tag {
          align-self: flex-start;
          padding: 5px 11px;
          background: var(--tint);
          border-radius: 100px;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--t2);
          white-space: nowrap;
        }
        .c6t {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.025em;
        }
        .c6d {
          font-size: 14px;
          line-height: 1.6;
          color: var(--t2);
        }

        /* 직접 비교했어요 */
        .cmp {
          display: grid;
          grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr);
          gap: 52px;
          align-items: center;
          margin-top: 110px;
        }
        .cmp-copy h3 {
          margin: 18px 0 0;
          font-size: clamp(24px, 2.5vw, 38px);
          line-height: 1.22;
          letter-spacing: -0.035em;
          font-weight: 600;
        }
        .cmp-copy p {
          margin: 18px 0 0;
          font-size: 16px;
          line-height: 1.75;
          color: var(--t1);
        }
        .cmp-copy .fine {
          font-size: 14px;
          color: var(--t3);
        }
        .miss {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .miss-r {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 26px;
          background: var(--band3);
          border-radius: 100px;
        }
        .miss-r .x {
          flex: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          background: rgba(192, 57, 43, 0.14);
          border-radius: 50%;
          font-size: 12px;
          color: var(--fail);
        }
        .mtx {
          font-size: clamp(16px, 1.8vw, 24px);
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--t4);
          text-decoration: line-through;
          text-decoration-color: rgba(192, 57, 43, 0.4);
        }

        /* 어두운 칸 */
        .dark {
          background: var(--ink);
          color: var(--paper);
          border-radius: 30px;
          padding: 88px 56px;
        }
        .dk-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.72fr);
          gap: 56px;
          align-items: end;
        }
        .dk-copy h2 {
          margin: 22px 0 0;
          font-size: clamp(30px, 4.2vw, 64px);
          line-height: 1.06;
          letter-spacing: -0.045em;
          font-weight: 600;
        }
        .dk-copy p {
          margin: 22px 0 0;
          max-width: 560px;
          font-size: 17px;
          line-height: 1.75;
          color: var(--t3);
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .stat {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 22px 20px;
          background: rgba(241, 238, 232, 0.07);
          border-radius: 18px;
        }
        .sn {
          font-size: clamp(28px, 3vw, 46px);
          line-height: 1;
          color: var(--num);
        }
        .sl {
          font-size: 12px;
          line-height: 1.4;
          color: var(--t4);
        }
        .vid {
          margin-top: 52px;
          background: rgba(241, 238, 232, 0.06);
          border-radius: 22px;
          padding: 10px;
        }
        .vid-h {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 12px 14px;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: var(--t4);
        }
        .rec {
          color: var(--o);
          white-space: nowrap;
        }
        .vid-f {
          position: relative;
          padding-top: 56.25%;
          background: #0d0c0a;
          border-radius: 14px;
          overflow: hidden;
        }
        .vid-f iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }

        /* 내놓는 법 */
        .ship {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 56px;
          align-items: start;
        }
        .ship-copy h3 {
          margin: 20px 0 0;
          font-size: clamp(26px, 3.1vw, 46px);
          line-height: 1.14;
          letter-spacing: -0.04em;
          font-weight: 600;
        }
        .ship-copy p {
          margin: 20px 0 24px;
          max-width: 500px;
          font-size: 16px;
          line-height: 1.75;
          color: var(--t1);
        }
        .ship-copy b {
          color: var(--ink);
          font-weight: 600;
        }
        .guide {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .guide-r {
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
          padding: 20px 24px;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 22px rgba(25, 23, 19, 0.05);
        }
        .gn {
          font-size: 11px;
          color: var(--o);
        }
        .gt {
          font-size: 17px;
          line-height: 1.5;
        }

        /* 02 검수 — 크림 칸 */
        .band {
          background: var(--band2);
          border-radius: 30px;
          padding: 84px 56px 76px;
        }
        .cards3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 44px;
        }
        .in {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 28px 26px 30px;
          background: var(--tint3);
          border-radius: 20px;
        }
        .in-h {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .in-n {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: var(--t3);
        }
        .in-b {
          flex: none;
          padding: 5px 10px;
          background: var(--ink);
          color: var(--paper);
          border-radius: 100px;
          font-size: 10px;
          white-space: nowrap;
        }
        .in-t {
          font-size: 21px;
          font-weight: 600;
          letter-spacing: -0.025em;
        }
        .in-d {
          font-size: 14px;
          line-height: 1.65;
          color: var(--t1);
        }
        .in-w {
          margin-top: auto;
          padding: 10px 12px;
          background: rgba(192, 57, 43, 0.08);
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.6;
          color: var(--fail);
        }
        .vgrid {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          gap: 44px;
          align-items: start;
          margin-top: 44px;
        }
        .vleft {
          display: flex;
          flex-direction: column;
          gap: 10px;
          /* ⚠ .vgrid 가 align-items: start 라 이 칸은 «내용만큼»만 높다. 늘려 둬야
             밑에 붙인 단추가 옆 결과서 바닥과 같은 선에 선다. */
          align-self: stretch;
        }
        .vbox {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 26px;
          background: var(--tint3);
          border-radius: 20px;
        }
        .vb-tag {
          align-self: flex-start;
          padding: 5px 11px;
          border-radius: 100px;
          font-size: 10px;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }
        .vb-tag.pass {
          color: var(--pass);
          background: rgba(31, 107, 72, 0.1);
        }
        .vb-tag.fail {
          color: var(--fail);
          background: rgba(192, 57, 43, 0.1);
        }
        .vb-t {
          font-size: 21px;
          font-weight: 600;
          letter-spacing: -0.025em;
        }
        .vb-d {
          font-size: 16px;
          line-height: 1.6;
          color: var(--t2);
        }

        /* 검수 결과서 */
        .report {
          background: #fff;
          border-radius: 24px;
          padding: 10px;
          box-shadow: 0 18px 44px rgba(25, 23, 19, 0.1);
        }
        .rp-h {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 16px 14px;
          font-size: 11px;
        }
        .rp-h .dim {
          color: var(--t3);
        }
        .rp-s {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .rs {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding: 20px 22px;
          border-radius: 16px;
        }
        .rs.pass {
          background: rgba(31, 107, 72, 0.09);
          color: var(--pass);
        }
        .rs.fail {
          background: rgba(192, 57, 43, 0.09);
          color: var(--fail);
        }
        .rsn {
          font-size: 42px;
          line-height: 1;
        }
        .rsl {
          font-size: 12px;
          letter-spacing: 0.12em;
        }
        .rp-f {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-top: 8px;
        }
        .rf {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px 16px;
          background: var(--tint2);
          border-radius: 12px;
          font-size: 15px;
          color: var(--t1);
        }
        .rf .x {
          color: var(--fail);
        }
        .rp-c {
          padding: 16px 16px 10px;
          font-size: 10px;
          letter-spacing: 0.16em;
          color: var(--t3);
        }
        .rp-o {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .ro {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 18px;
          background: var(--tint2);
          border-radius: 14px;
        }
        .rot {
          font-size: 15px;
          font-weight: 600;
        }
        .rod {
          font-size: 13px;
          color: var(--t2);
        }

        /* 03 업종별 팩 */
        .packs-top {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
        }
        .tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 38px 0 20px;
        }
        .tab {
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 20px;
          border: 0;
          border-radius: 100px;
          cursor: pointer;
          background: #fff;
          color: var(--t1);
          box-shadow: 0 6px 16px rgba(25, 23, 19, 0.05);
          transition:
            background 0.25s,
            color 0.25s;
        }
        .tab.on {
          background: var(--ink);
          color: var(--paper);
          box-shadow: 0 10px 22px rgba(25, 23, 19, 0.18);
        }
        .plans {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .cc :global(.plan) {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 30px 26px 28px;
          background: #fff;
          border-radius: 22px;
          box-shadow: 0 10px 28px rgba(25, 23, 19, 0.06);
          /* ⚠ 셋을 «한 줄»에 다 적는다. transition 은 한 줄짜리(shorthand)라 따로 적으면
             앞의 것을 지운다. 앞 둘(떠오름·그림자)은 globals.css 의 data-들썩 이 주던 것인데,
             여기서 opacity 만 적으면 그 둘이 지워져 «안 떠오르는» 카드가 된다.
             8/25 에 어긋나며 오르던 카드가 한꺼번에 뜬 것도 이 한 줄 때문이었다. */
          transition:
            transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.35s ease,
            opacity 0.3s ease;
        }
        /* 넷을 나란히 «견주는» 자리다. 하나에 마우스를 올리면 나머지가 물러선다 —
           고르는 동안 눈이 한 칸에만 머문다.
           ⚠ 손가락으로 쓰는 동안에는 안 건다. 거기선 «한 번 누른» 상태가 그대로 붙어,
             건드린 카드 하나만 밝고 나머지 셋이 영영 흐린 화면이 된다.
             막는 일은 mouse-watch.tsx 가 한다 — 손가락이 닿는 순간 표시를 뗀다.
           ⚠ 물러서는 것은 opacity 하나뿐이다. 여기서 transform 을 건드리면 이 규칙이
             data-들썩 의 «떠오름»보다 힘이 세서 그것을 눌러 버린다 — 밝아지되 안 떠오른다. */
        :global(html[data-마우스="on"]) .plans:hover :global(.plan) {
          opacity: 0.5;
        }
        :global(html[data-마우스="on"]) .plans:hover :global(.plan):hover {
          opacity: 1;
        }
        .pl-tier {
          align-self: flex-start;
          padding: 5px 11px;
          background: var(--pack-tier-bg);
          border-radius: 100px;
          font-size: 10px;
          letter-spacing: 0.14em;
          color: var(--pack-tier);
          white-space: nowrap;
        }
        .pl-name {
          margin-top: -8px;
          font-size: 23px;
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.25;
        }
        .pl-scope {
          margin-top: -10px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--t2);
        }
        .pl-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
          padding: 14px 16px;
          background: var(--pack-tint);
          border-radius: 14px;
          font-size: 12px;
          color: var(--t2);
        }
        .pl-price b {
          font-size: 32px;
          line-height: 1;
          font-weight: 600;
          color: var(--ink);
        }
        /* 줄줄이 이어 쓰고 사이에 가운뎃점을 넣는다 — 상세 화면의 구성 목록과 같은 모양.
           ⚠ 점을 «항목 뒤»에 붙인다(::after). 앞에 붙이면 줄이 바뀔 때 점이 줄머리에 혼자
             떨어져, 새 줄이 점으로 시작하는 이상한 모양이 된다. */
        .pl-soon {
          margin-top: -10px;
          font-size: 12px;
          font-weight: 500;
          color: #8a5a00;
        }
        /* ⚠ 색만은 이 화면 것(--t1/--t3)이 아니라 «사이트 공통»(--list-ink/--list-dot)을 쓴다.
             같은 목록이 구매 목록·팩 상세에도 나오고, 셋이 같아 보여야 한다.
             홈만 제 색을 들고 있으면 다음에 한 곳을 고칠 때 조용히 어긋난다. */
        .pl-items {
          display: flex;
          flex-wrap: wrap;
          font-size: 13px;
          line-height: 1.7;
          color: var(--list-ink);
        }
        .pl-i::after {
          content: "·";
          margin: 0 7px;
          color: var(--list-dot);
        }
        .pl-i:last-child::after {
          display: none;
        }
        .pl-go {
          margin-top: auto;
          padding-top: 18px;
          font-size: 11px;
          letter-spacing: 0.1em;
        }

        /* 마지막 */
        .cta {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.88fr);
          gap: 56px;
          align-items: end;
          padding: 96px 56px;
        }
        .cta h2 {
          margin: 0;
          font-size: clamp(30px, 4.4vw, 68px);
          line-height: 1.05;
          letter-spacing: -0.05em;
          font-weight: 600;
        }
        .cta-r {
          display: flex;
          flex-direction: column;
          gap: 26px;
        }
        .cta-r p {
          margin: 0;
          font-size: 17px;
          line-height: 1.78;
          color: var(--t3);
        }
        .cta .ctas {
          margin-top: 0;
        }

        /* ── 좁은 화면 ─────────────────────────────────────── */
        @media (max-width: 1080px) {
          .hero-grid,
          .lead-row,
          .cmp,
          .dk-top,
          .ship,
          .vgrid,
          .cta {
            grid-template-columns: minmax(0, 1fr);
            gap: 36px;
          }
          .fig {
            justify-self: start;
          }
          .fig :global(img) {
            max-width: 300px;
          }
          .cards6,
          .cards3,
          .plans {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .dark,
          .band {
            padding: 60px 32px;
          }
          .cta {
            padding: 64px 32px;
          }
        }
        @media (max-width: 720px) {
          .hero {
            padding-top: 56px;
          }
          /* 폰에서는 112px 이 «빈 화면 한 장»이 된다. 절반으로 줄인다. */
          .hero-grid {
            padding-bottom: 60px;
          }
          .sec {
            padding: 72px 0;
          }
          .sec-last {
            padding: 72px 0 48px;
          }
          .cmp {
            margin-top: 72px;
          }
          .hero-cards,
          .cards6,
          .cards3,
          .plans,
          .rp-o {
            grid-template-columns: minmax(0, 1fr);
          }
          .stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 6px;
          }
          .stat {
            padding: 16px 14px;
          }
          .cc :global(.btn) {
            padding: 16px 24px;
            font-size: 14px;
          }
          .dark,
          .band {
            padding: 44px 20px;
            border-radius: 22px;
          }
          .cta {
            padding: 48px 20px;
          }
          .miss-r {
            padding: 16px 20px;
          }
          .guide-r {
            padding: 16px 18px;
          }
          .gt {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
