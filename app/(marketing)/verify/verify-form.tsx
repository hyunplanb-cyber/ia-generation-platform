"use client";

import { useActionState, useEffect, useState } from "react";
import { FileText, PencilRuler, Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VerificationReport } from "@/domain/verify/report";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { runVerifyAction, type VerifyState } from "./actions";

const initialState: VerifyState = { report: null, error: null, limitReached: false };

type Mode = "spec" | "url" | "document";

function LimitNotice({ freeLimit }: { freeLimit: number | null }) {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary-soft/30 p-6 text-center">
      <p className="font-semibold text-foreground">무료 검수 {freeLimit ?? 1}회를 다 쓰셨어요</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        검수를 계속 이용하는 유료 플랜을 준비하고 있어요. 열리면 가장 먼저 알려드릴게요.
      </p>
    </div>
  );
}

// 검수하는 동안 보여주는 "시간이 흐르는" 로딩 화면.
function LoadingScreen({ mode }: { mode: Mode }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const steps =
    mode === "url"
      ? [
          "사이트에 접속하고 있어요",
          "공개 화면을 하나씩 확인하고 있어요",
          "로그인·결제 화면 시나리오를 정리하고 있어요",
          "검수 리포트를 만들고 있어요",
        ]
      : [
          "넣어주신 내용을 읽고 있어요",
          "화면과 요건을 정리하고 있어요",
          "확인할 시나리오를 만들고 있어요",
          "검수 리포트를 만들고 있어요",
        ];
  const step = Math.min(Math.floor(elapsed / 6), steps.length - 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/85 px-6 backdrop-blur-sm">
      <Loader2 className="size-9 animate-spin text-primary" />

      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-lg font-bold text-foreground">{steps[step]}</p>
        <p className="text-sm text-muted-foreground">
          보통 <b className="font-semibold text-foreground">15~30초</b> 걸려요. 창을 닫지 말고
          기다려 주세요.
        </p>
      </div>

      {/* 진행 칸 — 실제 진행률은 알 수 없으므로 지나온 단계 수만큼 채운다 */}
      <div className="flex gap-1.5" aria-hidden="true">
        {steps.map((label, i) => (
          <span
            key={label}
            className={`h-1.5 w-7 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <p className="text-xs tabular-nums text-muted-foreground">{elapsed}초 지남</p>

      {elapsed >= 45 && (
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          사이트가 크면 조금 더 걸릴 수 있어요. 1분이 넘으면 새로고침 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}

// 결과 화면 — 리포트 + 다시 검수하기.
function ResultView({ report, onReset }: { report: VerificationReport; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">검수 결과</p>
        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="size-4" />
          다시 검수하기
        </Button>
      </div>

      <VerifyReportView report={report} />

      {report.scenarios.length > 0 && (
        <div className="flex flex-col items-center gap-2 border-t border-border/60 pt-6">
          <VerifyScenarioDownloadButton report={report} />
          <p className="text-center text-xs text-muted-foreground">
            표지·검수 현황·시나리오가 담긴 엑셀 문서로 내려받아 팀과 공유하세요.
          </p>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground">
        자동 검사는 공개 화면만 봅니다. 로그인 뒤 화면은 위 시나리오로 직접 확인하세요.
      </p>
    </div>
  );
}

// 입력 방식 한 칸 — 셋 다 펼쳐 두고, 고른 것만 활성(나머지는 딤 처리).
function ModeSection({
  active,
  onSelect,
  title,
  hint,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={active ? undefined : onSelect}
      className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
        active ? "border-primary bg-primary-soft/10" : "cursor-pointer border-border hover:border-primary/40"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className="flex w-full items-center gap-2.5 border-b-2 border-border pb-2.5 text-left"
      >
        <span
          className={`h-6 w-1.5 shrink-0 rounded-full ${active ? "bg-primary" : "bg-muted-foreground/25"}`}
        />
        <span className="flex-1 text-lg font-extrabold tracking-tight text-foreground">{title}</span>
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
            active ? "border-primary bg-primary text-primary-foreground" : "border-border"
          }`}
        >
          {active && <Check className="size-3.5" />}
        </span>
      </button>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hint}</p>
      <div className={active ? "mt-4" : "mt-4 pointer-events-none opacity-40"} aria-hidden={!active}>
        {children}
      </div>
    </div>
  );
}

export function VerifyForm({
  alreadyBlocked,
  freeLimit,
}: {
  alreadyBlocked: boolean;
  freeLimit: number | null;
}) {
  const [state, formAction, pending] = useActionState(runVerifyAction, initialState);
  const [mode, setMode] = useState<Mode>("url");
  const [fileName, setFileName] = useState<string | null>(null);
  const [specFileName, setSpecFileName] = useState<string | null>(null);
  // 결과 화면을 닫고 다시 입력 폼으로 돌아왔는지.
  const [dismissed, setDismissed] = useState(false);
  const report = state.report;
  const blocked = alreadyBlocked || state.limitReached;

  // 무료 횟수를 이미 다 썼으면 입력 폼 대신 안내만 보여준다.
  if (blocked && !report) {
    return <LimitNotice freeLimit={freeLimit} />;
  }

  // 완료 → 결과 화면. 검수 중에는 입력 폼 위에 전체 로딩 오버레이를 덮는다.
  if (report && !dismissed) {
    return <ResultView report={report} onReset={() => setDismissed(true)} />;
  }

  const isUrl = mode === "url";
  const buttonLabel = isUrl ? "사이트 검수하기" : "검수 시나리오 만들기";

  return (
    <div className="flex flex-col gap-6">
      {state.error && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}

      <form
        action={formAction}
        onSubmit={() => setDismissed(false)}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="mode" value={mode} />

        {/* 설계도 프롬프트 — 파일 등록 */}
        <ModeSection
          active={mode === "spec"}
          onSelect={() => setMode("spec")}
          title="설계도 프롬프트"
          hint="카페인컬러로 만든 IA·스펙팩을 넣으면 가장 정확한 검수 시나리오를 받을 수 있어요."
        >
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50">
            <PencilRuler className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {specFileName ?? "스펙팩 파일을 넣으세요 (.md·.json·.txt)"}
            </span>
            <span className="text-xs text-muted-foreground">
              AI 빌드 스펙팩(마크다운·JSON)을 그대로 올리면 가장 정확해요 · 8MB 이하
            </span>
            <input
              type="file"
              name="spec"
              accept=".md,.markdown,.json,.txt"
              required={mode === "spec"}
              disabled={mode !== "spec"}
              className="hidden"
              onChange={(e) => setSpecFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </ModeSection>

        {/* 사이트 URL */}
        <ModeSection
          active={mode === "url"}
          onSelect={() => setMode("url")}
          title="사이트 URL"
          hint="이미 오픈(배포)한 사이트 주소를 넣어주세요."
        >
          <Input
            name="url"
            type="text"
            inputMode="url"
            placeholder="https://내-사이트.com"
            required={mode === "url"}
            disabled={mode !== "url"}
          />
          <p className="mt-3 rounded-lg bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <b className="font-semibold text-foreground">공개 화면은 우리가 검수</b>하고,
            로그인·결제처럼 자동으로 볼 수 없는 화면은{" "}
            <b className="font-semibold text-foreground">직접 확인할 수 있도록 검수 시나리오</b>로
            짚어드려요.
          </p>
        </ModeSection>

        {/* 설계 문서(PDF·PPTX) */}
        <ModeSection
          active={mode === "document"}
          onSelect={() => setMode("document")}
          title="설계 문서(PDF·PPTX)"
          hint={'화면설계서·기획서 파일을 넣어주세요. "무엇을 확인할지" 설계도에 맞는 검수 시나리오를 만들어드려요.'}
        >
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50">
            <FileText className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {fileName ?? "화면설계서·기획서 파일을 넣으세요 (PDF·PPTX)"}
            </span>
            <span className="text-xs text-muted-foreground">
              피그마·워드·한글은 PDF로 내보내 넣으면 돼요 · 8MB 이하
            </span>
            <input
              type="file"
              name="document"
              accept=".pdf,.pptx"
              required={mode === "document"}
              disabled={mode !== "document"}
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </ModeSection>

        {/* 버튼은 한 자리 — 고른 방식에 따라 이름만 바뀐다 */}
        <Button type="submit" disabled={pending} className="mt-1 sm:w-56">
          {buttonLabel}
        </Button>
      </form>

      {/* 검수 중 — 화면 전체를 덮는 로딩 오버레이(설계도 프롬프트와 동일) */}
      {pending && <LoadingScreen mode={mode} />}
    </div>
  );
}
