"use client";

import { type ReactNode, useActionState, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { generateScenariosAction, type ProjectVerifyState } from "./actions";

const initialState: ProjectVerifyState = {
  report: null,
  error: null,
  limitReached: false,
  runId: null,
};

// 생성 전: 왼쪽=안내(children) / 오른쪽=생성 패널.
// 생성 후: 왼쪽=결과 미리보기 / 오른쪽=다운로드 패널(디자인 프리셋과 동일 형태).
export function VerifyPanel({
  projectId,
  basicCost,
  detailCost,
  downloadCost,
  creditsOpen,
  children,
}: {
  projectId: string;
  basicCost: number;
  detailCost: number;
  downloadCost: number;
  creditsOpen: boolean;
  children: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(generateScenariosAction, initialState);
  const report = state.report;
  const done = !!report && !pending;

  // 로딩 초 카운팅.
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!pending) {
      setSecs(0);
      return;
    }
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [pending]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* 왼쪽: 생성 전=안내 / 생성 후=결과 미리보기 */}
        <div className="flex min-w-0 flex-col gap-6">
          {done ? <VerifyReportView report={report!} preview /> : children}
        </div>

        {/* 오른쪽: 생성 전=생성 패널 / 생성 후=다운로드 패널 */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          {done ? (
            <>
              <p className="text-sm font-bold text-foreground">검수 시나리오 다운로드</p>
              <p className="mt-1 text-xs text-muted-foreground">
                위 시나리오를 엑셀(표지·현황·시나리오)로 받아 팀과 공유하세요.
              </p>
              <div className="mt-4">
                <VerifyScenarioDownloadButton
                  report={report!}
                  label="검수 시나리오 다운로드"
                  verifyRunId={state.runId ?? undefined}
                  credits={downloadCost}
                  unlocked={false}
                  creditsOpen={creditsOpen}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                />
              </div>
              <ul className="mt-3 flex flex-col gap-1 text-[11px] leading-relaxed text-muted-foreground">
                <li>· 다운로드 크레딧은 처음 다운로드 시 한 번만 사용됩니다.</li>
                <li>· 다시 받기는 무료이며, ‘나의 프로젝트’에서 가능합니다.</li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-foreground">검수 시나리오 생성</p>
              <p className="mt-1 text-xs text-muted-foreground">
                생성된 산출물을 바탕으로 만들어요. 주요 약 30~50개 또는 상세 약 100~150개 시나리오를 만들어드려요.
              </p>
              <form action={formAction} className="mt-4 flex flex-col gap-2">
                <input type="hidden" name="projectId" value={projectId} />
                <button
                  type="submit"
                  name="mode"
                  value="basic"
                  disabled={pending}
                  className="flex w-full flex-col items-center rounded-lg bg-primary px-4 py-2.5 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <Sparkles className="size-4" /> 주요 시나리오 생성
                    <span className="opacity-80">· {basicCost}크레딧</span>
                  </span>
                  <span className="text-[11px] opacity-80">약 30~50개</span>
                </button>
                <button
                  type="submit"
                  name="mode"
                  value="detail"
                  disabled={pending}
                  className="flex w-full flex-col items-center rounded-lg border border-primary bg-transparent px-4 py-2.5 text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <Sparkles className="size-4" /> 상세 시나리오 생성
                    <span className="opacity-80">· {detailCost}크레딧</span>
                  </span>
                  <span className="text-[11px] opacity-80">약 100~150개</span>
                </button>
              </form>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                100~150개를 선택해도 규모가 작아 만들 시나리오가 없으면 더 적게 생성될 수 있어요. 규모에 맞게
                선택하세요.
              </p>
              <ul className="mt-3 flex flex-col gap-1 text-[11px] leading-relaxed text-muted-foreground">
                <li>· 생성 시 산출물 기준 검수 시나리오가 생성됩니다.</li>
                <li>· 검수 시나리오는 다운로드하여 사용 가능합니다.</li>
                <li>· 검수 시나리오 다운로드 시 별도 비용이 발생하니 참고해 주세요.</li>
              </ul>
            </>
          )}
        </div>
      </div>

      {/* 로딩 강조 + 초 카운팅 */}
      {pending && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary-soft/20 p-5">
          <Loader2 className="size-6 shrink-0 animate-spin text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-foreground">
              검수 시나리오를 만들고 있어요…{" "}
              <span className="tabular-nums text-primary">{secs}초</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              산출물을 읽어 화면별 시나리오를 짜는 중이에요. 보통 15~30초 걸려요. 창을 닫지 마세요.
            </p>
          </div>
        </div>
      )}

      {state.limitReached && !pending && (
        <div className="rounded-xl border border-primary/30 bg-primary-soft/30 p-6 text-center">
          <p className="font-semibold text-foreground">무료 이용 횟수를 다 쓰셨어요</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            계속 이용하려면 크레딧이 필요해요. 충전 기능을 준비하고 있어요. 열리면 가장 먼저 알려드릴게요.
          </p>
        </div>
      )}

      {state.error && !pending && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}
    </div>
  );
}
