"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// 히어로용 소개 애니메이션. 폰 목업 프레임 없이, 히어로 배경 안에서 자연스럽게
// 도는 느낌(투명 배경 + 부드러운 후광). public/intro.mp4가 실제 존재하면 그 영상으로 전환.
export function HeroReel() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/intro.mp4", { method: "HEAD" })
      .then((res) => {
        if (alive && res.ok) setShowVideo(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[440px] items-center justify-center">
      {showVideo ? (
        <video autoPlay muted loop playsInline className="h-full w-full rounded-3xl object-cover">
          <source src="/intro.mp4" type="video/mp4" />
          <source src="/intro.webm" type="video/webm" />
        </video>
      ) : (
        <ReelAnimation />
      )}
    </div>
  );
}

type Scene = {
  face?: string;
  mascot?: boolean;
  lines: { t: string; cls: string }[];
};

const SCENES: Scene[] = [
  {
    mascot: true,
    lines: [
      { t: "웹기획,", cls: "text-2xl font-black text-foreground" },
      { t: "아직도 밤새 하세요?", cls: "text-2xl font-black text-foreground" },
    ],
  },
  {
    face: "✍️",
    lines: [
      { t: "컨셉·메뉴만", cls: "text-2xl font-black text-foreground" },
      { t: "입력하면", cls: "text-2xl font-black text-primary" },
    ],
  },
  {
    face: "🧩",
    lines: [
      { t: "IA · 기능정의", cls: "text-xl font-black text-foreground" },
      { t: "· 프롬프트", cls: "text-xl font-black text-foreground" },
      { t: "자동으로 뚝딱!", cls: "mt-1 text-2xl font-black text-primary" },
    ],
  },
  {
    face: "🚀",
    lines: [
      { t: "AI 코딩툴에 쏙 →", cls: "text-xl font-black text-foreground" },
      { t: "사이트 완성!", cls: "text-2xl font-black text-primary" },
    ],
  },
  {
    mascot: true,
    lines: [
      { t: "IA 자동생성 플랫폼", cls: "text-2xl font-black text-primary" },
      { t: "지금, 무료로 시작", cls: "mt-1 text-sm font-bold text-muted-foreground" },
    ],
  },
];

const TOTAL = SCENES.length * 3; // 장면당 3초

function ReelAnimation() {
  return (
    <>
      <style>{`
        @keyframes reelScene {
          0%   { opacity: 0; transform: translateY(16px) scale(.94); }
          4%   { opacity: 1; transform: translateY(0) scale(1); }
          16%  { opacity: 1; transform: translateY(0) scale(1); }
          20%  { opacity: 0; transform: translateY(-16px) scale(.94); }
          100% { opacity: 0; }
        }
        @keyframes reelFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .reel-scene { opacity: 0; animation: reelScene ${TOTAL}s infinite; }
        .reel-face { animation: reelFloat 2.4s ease-in-out infinite; }
      `}</style>

      {/* 배경에 녹아드는 부드러운 후광 (텍스트·마스코트 가독성) */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/45 blur-3xl" />

      {/* 장면들 — 투명 배경으로 히어로 위에 떠 있는 느낌 */}
      {SCENES.map((s, i) => (
        <div
          key={i}
          className="reel-scene absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
          style={{ animationDelay: `${i * 3}s` }}
        >
          {s.mascot ? (
            <Image
              src="/mascot.png"
              alt="마스코트"
              width={220}
              height={270}
              priority
              className="reel-face h-auto w-44 object-contain drop-shadow-xl"
            />
          ) : (
            <div className="reel-face text-[84px] leading-none drop-shadow-sm">{s.face}</div>
          )}
          <div>
            {s.lines.map((l, j) => (
              <p key={j} className={`leading-tight ${l.cls}`}>
                {l.t}
              </p>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
