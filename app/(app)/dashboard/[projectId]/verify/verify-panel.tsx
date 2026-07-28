"use client";

import { useActionState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { runProjectVerifyAction, type ProjectVerifyState } from "./actions";

const initialState: ProjectVerifyState = { report: null, error: null, limitReached: false };

// 프로젝트 안에서 사이트 URL을 넣어 검수를 돌리고, 결과를 이 프로젝트에 저장한다.
export function VerifyPanel({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(runProjectVerifyAction, initialState);
  const report = state.report;

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="projectId" value={projectId} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3">
            <Link2 className="size-4 shrink-0 text-muted-foreground" />
            <Input
              name="url"
              type="text"
              inputMode="url"
              placeholder="https://내-사이트.com"
              className="border-0 px-0 shadow-none focus-visible:ring-0"
              required
              disabled={pending}
            />
          </div>
          <Button type="submit" disabled={pending} className="sm:w-40">
            {pending ? "검사 중…" : "사이트 검수하기"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          이미 오픈(배포)한 사이트 주소를 넣어주세요. 검수 결과는 이 프로젝트에 저장됩니다.
        </p>
      </form>

      {pending && (
        <p className="text-sm text-muted-foreground">
          사이트를 열어 하나씩 확인하고 있어요. 보통 15~30초 걸려요. 창을 닫지 마세요.
        </p>
      )}

      {state.limitReached && !pending && (
        <div className="rounded-xl border border-primary/30 bg-primary-soft/30 p-6 text-center">
          <p className="font-semibold text-foreground">무료 검수 횟수를 다 쓰셨어요</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            검수를 계속 이용하는 유료 플랜을 준비하고 있어요. 열리면 가장 먼저 알려드릴게요.
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
