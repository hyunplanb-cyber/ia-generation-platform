"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateIaAction } from "./generate-ia-action";

const MESSAGES: Record<string, string> = {
  unavailable:
    "AI 자동 생성 기능을 아직 사용할 수 없어요. 관리자 설정(ANTHROPIC_API_KEY)이 필요해요.",
  "no-credit":
    "AI 사용 크레딧이 부족해요. Anthropic 콘솔의 Plans & Billing에서 크레딧을 충전하면 바로 사용할 수 있어요.",
  "already-has-menus": "이미 메뉴가 있어요. 자동 생성은 메뉴가 없는 새 프로젝트에서만 실행돼요.",
  failed: "자동 생성에 실패했어요. 잠시 후 다시 시도해 주세요.",
};

export function GenerateIaButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await generateIaAction(projectId);
      if (result.ok) {
        router.push(`/dashboard/${projectId}/screens`);
      } else {
        setError(MESSAGES[result.reason] ?? "자동 생성에 실패했어요.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={handleClick} disabled={pending} className="self-start">
        <Sparkles className="size-4" />
        컨셉 분석해서 자동 생성
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
      {pending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="font-medium text-foreground">컨셉을 분석해 메뉴와 화면을 만들고 있어요...</p>
        </div>
      )}
    </div>
  );
}
