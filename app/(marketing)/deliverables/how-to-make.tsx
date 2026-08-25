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
 *       step1 0.5s+0.9s ×12 · step2 1.4+1.7 ×6.75 · step3 3.0+2.1 ×5.4
 *       step4 9.4+4.2 ×2.7 · step5 29.5+7.0 ×2.25 · step6 38.0+7.0 ×2.25
 *       공통 — crop=2768:1730:8:0 → scale=800:500 (왼쪽 8px 은 녹화 창 테두리라 버린다) · h264 crf30 · 소리 없음
 *   ⚠ GIF 로는 안 만들었다. 같은 5초를 GIF 로 구우면 수 MB 인데 h264 는 100KB 안팎이다.
 *     여섯 토막 + 표지 여섯 장 다 합쳐 1.3MB 다.
 */
"use client";

import { useEffect, useRef } from "react";

type 단계 = {
  no: string;
  제목: string;
  말: string;
  토막: string;
  걸린시간: string;
  /** 상자 왼쪽 위에 붙는 이름표 — 그 토막이 «앱의 어느 화면»인지 적는다.
   *  지어낸 말이 아니라 녹화본 안 STEP 표시를 그대로 옮긴 것이다. */
  창이름: string;
  /** 카드 바탕 — 여섯 다 파스텔이고 여섯 다 다르다.
   *  ⚠ 3단 격자라 «옆»과 «바로 아래»가 닮은 색이면 안 된다. 그 차례로 골라 뒀다:
   *    모래 · 틸 · 크림 / 연둣빛 · 따뜻한크림 · 카키 */
  바탕: string;
};

const 단계들: 단계[] = [
  {
    no: "01",
    제목: "만들 사이트를 한 줄로 적어요",
    말: "「나는 펫 유치원을 운영하고 있어. 반려동물 유치원 사이트」처럼 한 줄이면 됩니다. 기획 용어를 몰라도 괜찮아요. PC·모바일 중 어디에 맞출지와 전체 일정만 함께 골라요.",
    토막: "step1",
    창이름: "STEP 1 · 컨셉 입력",
    바탕: "bg-primary-soft",
    걸린시간: "1분",
  },
  {
    no: "02",
    제목: "메뉴와 디자인을 고릅니다",
    말: "AI가 뽑아 준 메뉴를 보고 더하거나 뺍니다. 색·글꼴 3벌과 화면 뼈대 2벌 중에서 마음에 드는 걸 고르면, 뒤에 만들어지는 화면이 전부 그 얼굴로 나옵니다.",
    토막: "step2",
    창이름: "STEP 2 · 메뉴·디자인 컨셉",
    바탕: "bg-pastel-mint",
    걸린시간: "2분",
  },
  {
    no: "03",
    제목: "기다립니다",
    말: "화면 목록과 화면마다 넣을 AI 프롬프트를 씁니다. 사이트 규모에 따라 다르지만 대개 몇 분입니다. 이 사이에 하실 일은 없어요.",
    토막: "step3",
    창이름: "만드는 중",
    바탕: "bg-pastel-yellow",
    걸린시간: "3~5분",
  },
  {
    no: "04",
    제목: "화면 목록이 나옵니다",
    말: "메뉴 아래 어떤 화면이 필요한지, 화면마다 무엇을 해야 하는지가 트리로 정리됩니다. 여기서 화면을 더하거나 지울 수 있어요. 「검색 결과 없음」 같은 빠지기 쉬운 화면까지 들어 있습니다.",
    토막: "step4",
    창이름: "STEP 3 · 화면 목록",
    바탕: "bg-success-soft",
    걸린시간: "",
  },
  {
    no: "05",
    제목: "디자인·레이아웃 프리셋을 봅니다",
    말: "고른 색과 뼈대가 실제 화면에서 어떻게 보이는지 미리 확인합니다. 색 3벌 × 뼈대 2벌 = 여섯 가지로 섞어 쓸 수 있어요.",
    토막: "step5",
    창이름: "STEP 3 · 디자인 프리셋",
    바탕: "bg-warning-soft",
    걸린시간: "",
  },
  {
    no: "06",
    제목: "검수 시나리오까지 받습니다",
    말: "오픈 전에 무엇을 눌러 봐야 하는지를 화면마다 적어 줍니다. 「이건 되겠지」 하고 넘어가는 자리가 사고가 나는 자리예요.",
    토막: "step6",
    창이름: "STEP 3 · 검수 시나리오",
    바탕: "bg-pastel-lavender",
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
      <div className="mx-auto max-w-[1440px] px-6 pt-2 pb-16">
        {/* ⛔ 여기 있던 절 제목(「AI팩은 이렇게 만들어져요」)과 소개문을 뺐다
            (2026-08-25 사장님이 그 자리를 통째로 짚어 지우라고 하셨다).
            바로 위 페이지 머리말이 이미 「만들기 전엔 AI팩, 오픈 전엔 검수 / 각 결과물이
            무엇에 쓰이는지, 실제로 어떻게 생겼는지 샘플과 함께 소개해요」라고 말한다 —
            같은 말을 두 번 하고 있었다.
            ⚠ 다시 넣을 일이 있으면 옆 탭(AI팩)의 제목과 «같은 결»로 맞춘다. */}

        {/* 카드 셋씩 두 줄 (2026-08-25 사장님: 「너무 좌측으로 쏠리고 사이트가 너무 재미가
            없어」). 앞서는 «영상 왼쪽 + 글 오른쪽»이 한 줄을 통째로 썼는데, 영상을 400px
            로 못 박아 두니 1440에서 오른쪽 950px 이 거의 빈 종이였다. 셋씩 깔면 그 자리가
            없어진다.

            한 칸의 짜임은 레퍼런스에서 가져왔다:
              뱃지 → 그림판 → 제목 → 가는 선 → 설명 → 오른쪽 아래 동그라미

            ⚠ 동그라미에 «화살표»는 안 넣었다. 레퍼런스는 눌러서 넘어가는 카드라 화살표가
              맞지만, 여기 여섯은 «설명»이지 링크가 아니다. 눌러도 아무 데도 안 간다 —
              누를 수 있는 것처럼 보이게 만들면 안 된다. 대신 단계 번호를 넣었다.
            ⚠ 가운뎃줄(2·5번)만 조금 내려 세운다. 여섯이 자로 잰 듯 나란하면 얌전하기만
              하다. 레퍼런스가 그렇게 어긋 세워 놓았다. */}
        <ol ref={목록} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {단계들.map((s, i) => {
            /* ⛔ 한때 여섯 중 둘을 «진한» 브랜드색(주황·초록)으로 눌렀다가 뺐다
               (2026-08-25 사장님: 「여기 튀는컬러 두개변경해줘」). 그 둘만 소리를 질러
               나머지 넷과 한 벌로 안 보였다. 이제 여섯이 다 파스텔이다 — 서로 다르되
               같은 목소리다.
               ⚠ 그래서 «글자를 뒤집는» 장치도 같이 지웠다. 안 쓰는 갈래를 남겨 두면
                 다음 사람이 그게 살아 있는 줄 알고 붙잡는다. */
            const 글 = "text-foreground";
            const 옅은글 = "text-foreground/70";
            const 선 = "bg-foreground/12";
            const 뱃지 = "bg-surface text-foreground";
            return (
              <li
                key={s.no}
                data-나타남
                data-늦게={String((i % 3) + 1)}
                className={`flex flex-col rounded-3xl p-5 sm:p-6 ${s.바탕} ${
                  i % 3 === 1 ? "lg:mt-12" : ""
                }`}
              >
                {/* 그림판 — 영상이 사는 자리. 흰 종이라 녹화본이 또렷하게 뜬다. */}
                <div className="rounded-2xl bg-surface p-2.5 sm:p-3">
                  <div className="flex items-center justify-between px-1 pb-2 pt-0.5">
                    <span className="truncate text-[11px] font-semibold tracking-wide text-foreground/55">
                      {s.창이름}
                    </span>
                    <span className="flex shrink-0 gap-1" aria-hidden="true">
                      <i className="size-1.5 rounded-full bg-foreground/20" />
                      <i className="size-1.5 rounded-full bg-foreground/20" />
                      <i className="size-1.5 rounded-full bg-foreground/20" />
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl bg-surface">
                    <video
                      src={`/guide-clips/${s.토막}.mp4`}
                      poster={`/guide-clips/${s.토막}.jpg`}
                      width={800}
                      height={500}
                      className="block h-auto w-full"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label={`${s.no} ${s.제목}`}
                    />
                  </div>
                </div>

                {s.걸린시간 && (
                  <span
                    className={`mt-6 self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${뱃지}`}
                  >
                    {s.걸린시간}
                  </span>
                )}
                <h3
                  className={`text-xl font-bold [word-break:keep-all] ${글} ${
                    s.걸린시간 ? "mt-3" : "mt-6"
                  }`}
                >
                  {s.제목}
                </h3>
                <div className={`mt-5 h-px w-full ${선}`} />
                <p className={`mt-5 text-sm leading-relaxed [word-break:keep-all] ${옅은글}`}>
                  {s.말}
                </p>
                {/* mt-auto — 카드 키가 제각각이라도 번호는 바닥에 나란히 선다 */}
                <div className="mt-auto flex justify-end pt-6">
                  <span
                    className={`grid size-11 place-items-center rounded-full font-mono text-sm font-bold ${뱃지}`}
                  >
                    {s.no}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
