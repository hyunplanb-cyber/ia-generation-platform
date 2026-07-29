"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { generateScenariosAction, type ProjectVerifyState } from "./actions";

const initialState: ProjectVerifyState = { report: null, error: null, limitReached: false };

// 생성된 산출물을 바탕으로 검수 시나리오를 만든다(사이트 URL 불필요).
export function VerifyPanel({
  projectId,
  cost,
  creditsOpen,
}: {
  projectId: string;
  cost: number;
  creditsOpen: boolean;
}) {
  const [state, formAction, pending] = useActionState(generateScenariosAction, initialState);
  const report = state.report;

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="projectId" value={projectId} />
        <Button type="submit" disabled={pending} className="w-full gap-2 sm:w-auto">
          <Sparkles className="size-4" />
          {pending
            ? "생성 중…"
            : creditsOpen
              ? `검수 시나리오 생성 · ${cost}크레딧`
              : "검수 시나리오 생성"}
        </Button>
        <p className="text-xs text-muted-foreground">
          생성된 산출물(화면·기능·버튼 연결)을 바탕으로 검수 시나리오를 만들어요. 다운로드(엑셀)는 이후 별도예요.
        </p>
      </form>

      {pending && (
        <p className="text-sm text-muted-foreground">
          산출물을 읽어 검수 시나리오를 만들고 있어요. 보통 15~30초 걸려요. 창을 닫지 마세요.
        </p>
      )}

      {state.limitReached && !pending && (
        <div className="rounded-xl border border-primary/30 bg-primary-soft/30 p-6 text-center">
          <p className="font-semibold text-foreground">무료 이용 횟수를 다 쓰셨어요</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            계속 이용하는 유료 플랜을 준비하고 있어요. 열리면 가장 먼저 알려드릴게요.
          </p>
        </div>
      )}

      {state.error && !pending && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}

      {report && !pending && (
        <div className="flex flex-col gap-6">
          <VerifyReportView report={report} />
          {report.scenarios.length > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-border/60 pt-6">
              <VerifyScenarioDownloadButton report={report} />
              <p className="text-center text-xs text-muted-foreground">
                표지·검수 현황·시나리오가 담긴 엑셀 문서로 내려받아 팀과 공유하세요.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
