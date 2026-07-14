"use client";

import { useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateScreensAction } from "./generate-screens-action";

export function GenerateScreensButton({ projectId, disabled }: { projectId: string; disabled: boolean }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      generateScreensAction(projectId);
    });
  }

  return (
    <>
      <Button
        type="button"
        disabled={disabled || pending}
        onClick={handleClick}
        title={disabled ? "메뉴를 1개 이상 추가하면 사용할 수 있어요" : undefined}
      >
        <Sparkles className="size-4" />
        실행: IA 생성
      </Button>
      {pending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="font-medium text-foreground">화면을 생성하고 있어요...</p>
        </div>
      )}
    </>
  );
}
