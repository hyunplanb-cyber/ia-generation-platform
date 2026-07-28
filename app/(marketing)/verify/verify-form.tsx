"use client";

import { useActionState, useState } from "react";
import { Link2, FileText, PencilRuler, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { UpgradeToDownload } from "@/app/(app)/dashboard/[projectId]/upgrade-to-download";
import { runVerifyAction, type VerifyState } from "./actions";

const initialState: VerifyState = { report: null, error: null, limitReached: false };

type Mode = "spec" | "url" | "document";

const MODES: { key: Mode; icon: LucideIcon; title: string; desc: string }[] = [
  { key: "spec", icon: PencilRuler, title: "설계도 프롬프트", desc: "카페인컬러로 만든 IA·스펙팩" },
  { key: "url", icon: Link2, title: "사이트 URL", desc: "이미 오픈한 사이트 주소" },
  { key: "document", icon: FileText, title: "설계 문서", desc: "PDF·PPTX 화면설계서" },
];

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
  const report = state.report;
  const blocked = alreadyBlocked || state.limitReached;

  // 무료 횟수를 이미 다 썼으면 입력 폼 대신 안내만 보여준다.
  if (blocked && !report) {
    return <LimitNotice freeLimit={freeLimit} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 입력 방식 3가지를 한 화면에 펼쳐 놓고, 그중 하나를 골라 검수한다. */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {MODES.map((m) => {
          const Icon = m.icon;
          const on = mode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              aria-pressed={on}
              className={`flex flex-col gap-1 rounded-xl border p-3.5 text-left transition-colors ${
                on
                  ? "border-primary bg-primary-soft/40"
                  : "border-border hover:border-primary/40 hover:bg-muted/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-md ${
                    on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-bold text-foreground">{m.title}</span>
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">{m.desc}</span>
            </button>
          );
        })}
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="mode" value={mode} />

        {mode === "spec" && (
          <div className="flex flex-col gap-3">
            <Textarea
              name="spec"
              rows={7}
              placeholder="카페인컬러에서 만든 'IA·화면목록'과 'AI 빌드 스펙팩' 내용을 붙여넣으세요."
              required
              disabled={pending}
            />
            <p className="rounded-lg bg-primary-soft/30 px-4 py-3 text-xs leading-relaxed text-foreground">
              카페인컬러에서 생성한 <b className="font-semibold">IA 화면목록</b>과{" "}
              <b className="font-semibold">스펙팩</b>을 넣으면, 화면·요건을 그대로 알아{" "}
              <b className="font-semibold">가장 자세한 검수 시나리오</b>를 만들어드려요.
            </p>
            <Button type="submit" disabled={pending} className="sm:w-56">
              {pending ? "분석 중…" : "검수 시나리오 만들기"}
            </Button>
          </div>
        )}

        {mode === "url" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                name="url"
                type="text"
                inputMode="url"
                placeholder="https://내-사이트.com"
                className="flex-1"
                required
                disabled={pending}
              />
              <Button type="submit" disabled={pending} className="sm:w-40">
                {pending ? "검사 중…" : "사이트 검수하기"}
              </Button>
            </div>
            <p className="rounded-lg bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              URL을 넣으면 <b className="font-semibold text-foreground">공개 화면은 우리가 검수</b>하고,
              로그인·결제처럼 자동으로 볼 수 없는 화면은{" "}
              <b className="font-semibold text-foreground">직접 확인할 시나리오</b>로 짚어드려요.
            </p>
          </div>
        )}

        {mode === "document" && (
          <div className="flex flex-col gap-3">
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
                required
                disabled={pending}
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
            <p className="rounded-lg bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              문서만으로는 <b className="font-semibold text-foreground">&quot;무엇을 확인할지&quot;
              시나리오</b>까지 드려요. 실제 통과/실패 검수는 사이트가 만들어진 뒤 URL을 넣어주세요.
            </p>
            <Button type="submit" disabled={pending} className="sm:w-56">
              {pending ? "분석 중…" : "검수 시나리오 만들기"}
            </Button>
          </div>
        )}
      </form>

      {pending && (
        <p className="text-sm text-muted-foreground">
          {mode === "url"
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
