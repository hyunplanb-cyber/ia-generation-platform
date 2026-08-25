/* 「AI팩을 어떻게 만드나」를 실제 화면으로 보여 주는 절. (2026-08-14 사장님 지시)
 *
 * 왜 만드나
 *   이 페이지는 「무엇을 받나」만 말하고 「어떻게 만드나」는 말하지 않았다.
 *   처음 오신 분은 «몇 분이나 걸리는지, 뭘 적어야 하는지»를 몰라 시작을 못 한다.
 *
 * 그림은 지어내지 않았다 — 사장님이 실제로 만드신 「반려동물 유치원」 녹화본
 *   (`릴스영상/_촬영영상/1. 팩생성_펫유치원.mp4`, 2784×2160 · 62초)에서 여섯 토막을 떠 왔다.
 *   값·화면·문구가 전부 진짜다.
 *
 * ⭐ 2026-08-25 사장님 지시로 «멈춘 그림»에서 «움직이는 토막»으로 바꿨다.
 *   기다리는 화면·타이핑·트리가 펼쳐지는 것은 정지 화면으로는 전해지지 않는다.
 *   ⚠ 원본이 «10배쯤 빨리 감긴» 녹화라 앞쪽 토막은 도로 늦춰야 읽힌다. 어디를 얼마나
 *     늦췄는지는 `_작업/영상토막내기.mjs` 에 적어 두었다 — 화면을 고치면 거기서 다시 뜬다.
 *     ⚠ 그 파일은 저장소에 안 들어간다(`_작업/` 이 .gitignore 다). 값만 여기 적어 둔다:
 *       step1 0.5s+0.9s ×5.5 · step2 1.4+1.7 ×3 · step3 3.0+2.1 ×2.4
 *       step4 9.4+4.2 ×1.2 · step5 29.5+7.0 ×1 · step6 38.0+7.0 ×1
 *       공통 — crop=2784:1740:0:0 → scale=1200:750 · h264 crf30 · 소리 없음
 *   ⚠ GIF 로는 안 만들었다. 같은 5초를 GIF 로 구우면 수 MB 인데 h264 는 100KB 안팎이다.
 *     여섯 토막 다 합쳐 1.9MB 다.
 */
"use client";

import { useEffect, useRef } from "react";

type 단계 = { no: string; 제목: string; 말: string; 토막: string; 걸린시간: string };

const 단계들: 단계[] = [
  {
    no: "01",
    제목: "만들 사이트를 한 줄로 적어요",
    말: "「나는 펫 유치원을 운영하고 있어. 반려동물 유치원 사이트」처럼 한 줄이면 됩니다. 기획 용어를 몰라도 괜찮아요. PC·모바일 중 어디에 맞출지와 전체 일정만 함께 골라요.",
    토막: "step1",
    걸린시간: "1분",
  },
  {
    no: "02",
    제목: "메뉴와 디자인을 고릅니다",
    말: "AI가 뽑아 준 메뉴를 보고 더하거나 뺍니다. 색·글꼴 3벌과 화면 뼈대 2벌 중에서 마음에 드는 걸 고르면, 뒤에 만들어지는 화면이 전부 그 얼굴로 나옵니다.",
    토막: "step2",
    걸린시간: "2분",
  },
  {
    no: "03",
    제목: "기다립니다",
    말: "화면 목록과 화면마다 넣을 AI 프롬프트를 씁니다. 사이트 규모에 따라 다르지만 대개 몇 분입니다. 이 사이에 하실 일은 없어요.",
    토막: "step3",
    걸린시간: "3~5분",
  },
  {
    no: "04",
    제목: "화면 목록이 나옵니다",
    말: "메뉴 아래 어떤 화면이 필요한지, 화면마다 무엇을 해야 하는지가 트리로 정리됩니다. 여기서 화면을 더하거나 지울 수 있어요. 「검색 결과 없음」 같은 빠지기 쉬운 화면까지 들어 있습니다.",
    토막: "step4",
    걸린시간: "",
  },
  {
    no: "05",
    제목: "디자인·레이아웃 프리셋을 봅니다",
    말: "고른 색과 뼈대가 실제 화면에서 어떻게 보이는지 미리 확인합니다. 색 3벌 × 뼈대 2벌 = 여섯 가지로 섞어 쓸 수 있어요.",
    토막: "step5",
    걸린시간: "",
  },
  {
    no: "06",
    제목: "검수 시나리오까지 받습니다",
    말: "오픈 전에 무엇을 눌러 봐야 하는지를 화면마다 적어 줍니다. 「이건 되겠지」 하고 넘어가는 자리가 사고가 나는 자리예요.",
    토막: "step6",
    걸린시간: "",
  },
];

/* 탭 안에 들어가는 «몸통». 절 껍데기(section·배경)를 두지 않는다 —
   다른 탭(AI팩·사이트 검수)과 같은 결이라야 탭을 옮겨 다닐 때 안 튄다. */
export function HowToMakeBody() {
  const 목록 = useRef<HTMLOListElement>(null);

  /* 화면에 «들어온» 토막만 돌린다.
   *
   * ⚠ 여섯을 한꺼번에 돌리면 폰에서 버벅인다. 브라우저가 알아서 늦춰 주기도 하지만
   *   기기마다 다르다 — 보이는 것만 돌리는 편이 확실하다.
   * ⚠ 안 보이면 «멈추기»만 하고 되감지 않는다. 되감으면 스크롤을 오르내릴 때마다
   *   토막이 처음부터 다시 시작해 눈이 어지럽다.
   * ⚠ 이 자리를 따로 함수로 빼지 않는다 — 훅은 이름이 use 로 시작해야 해서
   *   한글 이름을 붙이면 린터(react-hooks/rules-of-hooks)가 막는다. */
  useEffect(() => {
    const 자리 = 목록.current;
    if (!자리) return;
    const 것들 = Array.from(자리.querySelectorAll("video"));
    /* 옛 브라우저나 테스트 환경엔 없을 수 있다 — 없으면 그냥 다 돌린다 */
    if (typeof IntersectionObserver === "undefined") {
      것들.forEach((v) => void v.play().catch(() => undefined));
      return;
    }
    const 살핌 = new IntersectionObserver(
      (온것) => {
        for (const x of 온것) {
          const v = x.target as HTMLVideoElement;
          if (x.isIntersecting) void v.play().catch(() => undefined);
          else v.pause();
        }
      },
      { rootMargin: "160px 0px", threshold: 0.15 },
    );
    것들.forEach((v) => 살핌.observe(v));
    return () => 살핌.disconnect();
  }, []);

  return (
    <section>
      {/* ⚠ 이 칸은 «옆 탭들과 같은 폭»이라야 한다 (2026-08-25 사장님 지적).
          여기만 max-w-5xl(1024px)이었고 탭 띠·AI팩·사이트 검수는 모두 1440px 이라,
          탭을 「만드는 방법」으로 옮기는 순간 제목이 200px 쯤 안으로 쑥 들어갔다.
          ⚠ 셋이 늘 같이 움직인다 — 하나를 고치면 나머지 둘도 본다. */}
      <div className="mx-auto max-w-[1440px] px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl [word-break:keep-all]">
          AI팩은 이렇게 만들어져요
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground [word-break:keep-all]">
          아래는 실제로 <b className="text-foreground">반려동물 유치원 사이트</b>를 만든 화면 그대로예요.
          한 줄 적고 기다리면 끝입니다 — 전부 합쳐 <b className="text-foreground">10분 안팎</b>이에요.
        </p>

        {/* 목록 — 줄마다 «가는 선» 하나로 나뉜다. 카드도 상자도 두지 않는다.
            왼쪽에 움직이는 화면, 오른쪽에 번호·제목·설명. */}
        <ol ref={목록} className="mt-12 flex flex-col">
          {단계들.map((s) => (
            <li
              key={s.no}
              className="grid grid-cols-1 items-center gap-6 border-t border-border py-8 md:grid-cols-[1.55fr_1fr] md:gap-12 md:py-10 lg:gap-16"
            >
              <div className="overflow-hidden rounded-2xl bg-surface">
                <video
                  src={`/guide-clips/${s.토막}.mp4`}
                  poster={`/guide-clips/${s.토막}.jpg`}
                  width={1200}
                  height={750}
                  className="block h-auto w-full"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`${s.no} ${s.제목}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-semibold text-primary">{s.no}</span>
                  {s.걸린시간 && (
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-on-soft">
                      {s.걸린시간}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-xl font-bold text-foreground sm:text-2xl [word-break:keep-all]">
                  {s.제목}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
                  {s.말}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
