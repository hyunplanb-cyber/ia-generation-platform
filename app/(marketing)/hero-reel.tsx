"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// 히어로용 9:16(릴스 비율) 소개 영상 슬롯.
// 기본은 코드로 만든 애니메이션 릴스이고, public/intro.mp4가 실제로 존재하면
// (HEAD 확인) 그 영상으로 자동 전환된다 — 파일이 없을 때 빈 영상이 뜨지 않도록.
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
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-[2rem] border-4 border-white bg-foreground shadow-2xl">
      {showVideo ? (
        <video autoPlay muted loop playsInline className="h-full w-full object-cover">
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
  bg: string;
  face?: string;
  mascot?: boolean;
  lines: { t: string; cls: string }[];
};

const SCENES: Scene[] = [
  {
    bg: "linear-gradient(160deg,#EDE9FE,#FFF3D6)",
    mascot: true,
    lines: [
      { t: "웹기획,", cls: "text-2xl font-black text-foreground" },
      { t: "아직도 밤새 하세요?", cls: "text-2xl font-black text-foreground" },
    ],
  },
  {
    bg: "linear-gradient(160deg,#DFF5EC,#EDE9FE)",
    face: "✍️",
    lines: [
      { t: "컨셉·메뉴만", cls: "text-2xl font-black text-foreground" },
      { t: "입력하면", cls: "text-2xl font-black text-primary" },
    ],
  },
  {
    bg: "linear-gradient(160deg,#FFF3D6,#DFF5EC)",
    face: "🧩",
    lines: [
      { t: "IA · 기능정의", cls: "text-xl font-black text-foreground" },
      { t: "· 프롬프트", cls: "text-xl font-black text-foreground" },
      { t: "자동으로 뚝딱!", cls: "mt-1 text-2xl font-black text-primary" },
    ],
  },
  {
    bg: "linear-gradient(160deg,#EDE9FE,#DFF5EC)",
    face: "🚀",
    lines: [
      { t: "AI 코딩툴에 쏙 →", cls: "text-xl font-black text-foreground" },
      { t: "사이트 완성!", cls: "text-2xl font-black text-primary" },
    ],
  },
  {
    bg: "linear-gradient(160deg,#5B4FE5,#8B7DFF)",
    mascot: true,
    lines: [
      { t: "IA 자동생성 플랫폼", cls: "text-xl font-black text-white" },
      { t: "지금, 무료로 시작", cls: "mt-1 text-sm font-bold text-white/85" },
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
        @keyframes reelBar {
          0% { width: 0; }
          20% { width: 100%; }
          100% { width: 100%; }
        }
        .reel-scene { opacity: 0; animation: reelScene ${TOTAL}s infinite; }
        .reel-face { animation: reelFloat 2.4s ease-in-out infinite; }
        .reel-bar-fill { animation: reelBar ${TOTAL}s infinite; }
      `}</style>

      {/* 스토리 진행 바(릴스 느낌) */}
      <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
        {SCENES.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/40">
            <div
              className="reel-bar-fill h-full rounded-full bg-white"
              style={{ animationDelay: `${i * 3}s` }}
            />
          </div>
        ))}
      </div>

      {/* 장면들 */}
      {SCENES.map((s, i) => (
        <div
          key={i}
          className="reel-scene absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
          style={{ background: s.bg, animationDelay: `${i * 3}s` }}
        >
          {s.mascot ? (
            <Image
              src="/mascot.png"
              alt="마스코트"
              width={150}
              height={185}
              priority
              className="reel-face h-auto w-[130px] object-contain drop-shadow-md"
            />
          ) : (
            <div className="reel-face text-[72px] leading-none drop-shadow-sm">{s.face}</div>
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

      {/* 워터마크 */}
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/20 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
        🐾 IA 자동생성 플랫폼
      </div>
    </>
  );
}
