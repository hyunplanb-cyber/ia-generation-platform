"use client";

import { useActionState, useState } from "react";
import { FileText, PencilRuler, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { UpgradeToDownload } from "@/app/(app)/dashboard/[projectId]/upgrade-to-download";
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
  const report = state.report;
  const blocked = alreadyBlocked || state.limitReached;

  // 무료 횟수를 이미 다 썼으면 입력 폼 대신 안내만 보여준다.
  if (blocked && !report) {
    return <LimitNotice freeLimit={freeLimit} />;
  }

  const isUrl = mode === "url";
  const buttonLabel = pending
    ? isUrl
      ? "검사 중…"
      : "분석 중…"
    : isUrl
      ? "사이트 검수하기"
      : "검수 시나리오 만들기";

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-3">
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

      {pending && (
        <p className="text-sm text-muted-foreground">
          {isUrl
            ? "사이트를 열어 하나씩 확인하고 있어요. 보통 15~30초 걸려요. 창을 닫지 마세요."
            : "내용을 읽어 확인할 시나리오를 만들고 있어요. 잠시만요."}
        </p>
      )}

      {state.error && !pending && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {state.error}
        </p>
      )}

      {report && !pending && (
        <div className="flex flex-col gap-6">
          <VerifyReportView report={report} />

          {/* 시나리오 다운로드 — 유료 기능(현재 준비 중) */}
          {report.scenarios.length > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-border/60 pt-6">
              <UpgradeToDownload label="검수 시나리오 다운로드" />
              <p className="text-center text-xs text-muted-foreground">
                시나리오를 문서로 내려받아 팀과 공유하는 기능을 준비하고 있어요.
              </p>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            자동 검사는 공개 화면만 봅니다. 로그인 뒤 화면은 위 시나리오로 직접 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
}
