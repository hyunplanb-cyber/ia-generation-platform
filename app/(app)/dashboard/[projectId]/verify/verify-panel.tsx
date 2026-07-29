"use client";

import { type ReactNode, useActionState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { generateScenariosAction, type ProjectVerifyState } from "./actions";

const initialState: ProjectVerifyState = { report: null, error: null, limitReached: false };

// 왼쪽(children=안내·검수 항목) + 오른쪽(생성 패널) 2단 배치.
// 생성 결과(리포트)는 2단 아래 전체 폭으로 펼친다.
export function VerifyPanel({
  projectId,
  cost,
  creditsOpen,
  children,
}: {
  projectId: string;
  cost: number;
  creditsOpen: boolean;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(generateScenariosAction, initialState);
  const report = state.report;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* 왼쪽: 안내 + 검수 항목 */}
        <div className="flex min-w-0 flex-col gap-6">{children}</div>

        {/* 오른쪽: 검수 시나리오 생성 (박스 없이) */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <p className="text-sm font-bold text-foreground">검수 시나리오 생성</p>
          <p className="mt-1 text-xs text-muted-foreground">
            생성된 산출물(화면·기능·버튼 연결)을 바탕으로 만들어요.
          </p>
          <form action={formAction}>
            <input type="hidden" name="projectId" value={projectId} />
            <Button type="submit" disabled={pending} className="mt-4 w-full gap-2">
              <Sparkles className="size-4" />
              {pending
                ? "생성 중…"
                : creditsOpen
                  ? `검수 시나리오 생성 · ${cost}크레딧`
                  : "검수 시나리오 생성"}
            </Button>
          </form>
          <ul className="mt-3 flex flex-col gap-1 text-[11px] leading-relaxed text-muted-foreground">
            <li>· 생성 시 산출물 기준 검수 시나리오가 생성됩니다.</li>
            <li>· 검수 시나리오는 다운로드하여 사용 가능합니다.</li>
            <li>· 검수 시나리오 다운로드 시 별도 비용이 발생하니 참고해 주세요.</li>
          </ul>
        </div>
      </div>

      {/* 아래: 진행/오류/결과 (전체 폭) */}
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
