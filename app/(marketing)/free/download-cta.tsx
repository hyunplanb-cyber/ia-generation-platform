"use client";

// 무료 샘플 다운로드 버튼 + 받은 직후에 뜨는 안내.
//
// 예전엔 가입해야 파일을 줬다. 지금은 누구나 받고, 가입 요청을 **받은 뒤**로 옮겼다
// (2026-08-03). 우리를 처음 본 사람에게 먼저 값을 보여주고, 그다음에 묻는다.

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Download, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function DownloadCta({ signedIn }: { signedIn: boolean }) {
  const [done, setDone] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <a
        href="/api/free-sample"
        // 다운로드는 페이지 이동이 아니라서 화면이 그대로 남는다.
        // 눌린 걸 알려주지 않으면 "받아진 건가?" 싶으므로 직접 표시한다.
        onClick={() => setDone(true)}
        className={`${buttonVariants({ size: "lg" })} shadow-primary/30 shadow-lg transition-transform hover:scale-105`}
      >
        <Download className="size-4" />
        무료로 다운로드
      </a>

      {done ? (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Check className="size-4" />
          받는 중이에요. 다운로드 폴더를 확인해 주세요.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          가입 없이 바로 받아집니다. zip 파일이에요.
        </p>
      )}

      {/* 파일을 받고 나면 자연스러운 다음 행동을 권한다. */}
      {done &&
        (signedIn ? (
          <Link
            href="/dashboard"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            내 서비스로 직접 만들어보기
            <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <div className="mt-4 w-full max-w-md rounded-xl border-2 border-primary bg-primary-soft/30 p-5 text-center">
            <p className="flex items-center justify-center gap-1.5 font-bold text-primary-on-soft">
              <Sparkles className="size-4" />
              내 서비스로도 만들어보시겠어요?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              방금 받으신 것도 컨셉과 메뉴만 넣어 자동으로 만든 거예요. 가입하면 무료 크레딧을
              드려요.
            </p>
            <Link
              href="/signup?next=/dashboard"
              className={`${buttonVariants({ size: "sm" })} mt-3`}
            >
              무료로 시작하기
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ))}
    </div>
  );
}
