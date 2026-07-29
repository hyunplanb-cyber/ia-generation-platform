"use client";

import { Fragment, useActionState, useEffect, useState } from "react";
import {
  FileText,
  PencilRuler,
  Check,
  Loader2,
  RotateCcw,
  Upload,
  ShieldCheck,
  ChevronRight,
  Search,
  Lock,
  ListChecks,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VerificationReport } from "@/domain/verify/report";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { VerifyScenarioDownloadButton } from "@/components/verify/verify-scenario-download";
import { runVerifyAction, type VerifyState } from "./actions";

const initialState: VerifyState = { report: null, error: null, limitReached: false };

type Mode = "spec" | "url" | "document";

// 규모(기본/상세) 선택 카드. 파일과 사이트가 항목·개수·가격이 다르다.
type ScaleCard = {
  key: "basic" | "detail";
  title: string;
  cost: number;
  best?: boolean; // 더 촘촘한 추천 옵션
  desc?: string;
  checks?: string;
  scnTitle?: string;
  scnDesc?: string;
  scnCount?: string;
};
const FILE_SCALES: ScaleCard[] = [
  {
    key: "basic",
    title: "기본 · 30~50개 시나리오",
    cost: 4,
    desc: "핵심 화면 위주로 빠르게. 규모가 작은 사이트라면 충분해요.",
  },
  {
    key: "detail",
    title: "상세 · 100~150개 시나리오",
    cost: 8,
    best: true,
    desc: "상세 화면과 기능까지 촘촘히. 실무 산출물 수준, 조금 더 걸려요.",
  },
];
const URL_SCALES: ScaleCard[] = [
  {
    key: "basic",
    title: "홈화면을 기준으로 7개 항목 검수",
    cost: 8,
    checks: "사이트 접속, 보안 연결(HTTPS), 모바일 대응, 검색 기본(제목·설명), 첫 응답 속도, 이미지 깨짐, 내부 링크 깨짐",
    scnTitle: "민감화면 시나리오",
    scnDesc: "핵심 기능 위주로 빠르게. 규모가 작은 사이트라면 충분해요.",
    scnCount: "30~50개 시나리오",
  },
  {
    key: "detail",
    title: "홈+주요 화면을 기준으로 11개 항목 검수",
    cost: 16,
    best: true,
    checks:
      "페이지 열림, 응답 속도, 모바일 대응, 검색 기본(제목·설명), SNS 공유 카드, 대표 제목, 인코딩·언어 설정, 이미지 대체 텍스트, 혼합 콘텐츠(http 리소스), 이미지 깨짐, 내부 링크 깨짐",
    scnTitle: "민감화면 시나리오",
    scnDesc: "상세 화면과 기능까지 촘촘히. 실무 산출물 수준, 조금 더 걸려요.",
    scnCount: "100~150개 시나리오",
  },
];

// ── 상단 스텝(입력 → 검수 결과). active 로 현재 단계를 표시한다. ───────────
function VerifySteps({ active }: { active: 0 | 1 }) {
  const steps = [
    { title: "STEP 1", label: "입력", icon: Upload },
    { title: "STEP 2", label: "검수 결과", icon: ShieldCheck },
  ];
  const cur = steps[active];
  const CurIcon = cur.icon;
  return (
    <>
      {/* 모바일 — 현재 스텝 하나 + 점(좌우로 넘치지 않게) */}
      <div className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-primary-foreground shadow-md sm:hidden">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
          <CurIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-primary-foreground/75">
            {cur.title} · 2단계 중 {active + 1}
          </p>
          <p className="truncate text-lg font-extrabold tracking-tight">{cur.label}</p>
        </div>
        <ol className="flex shrink-0 items-center gap-2">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className={`block rounded-full ${
                i === active ? "size-2.5 bg-primary-foreground" : "size-2 bg-primary-foreground/35"
              }`}
            />
          ))}
        </ol>
      </div>

      {/* 데스크톱 — 2단 스텝(각 최대 429px) */}
      <ol className="hidden w-full items-stretch gap-3 sm:flex">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const on = i === active;
          const done = i < active;
          return (
            <Fragment key={s.title}>
              <li className="min-w-0 flex-1 lg:w-[429px] lg:flex-none">
                <div
                  className={`flex h-full items-center justify-center gap-3 rounded-2xl px-6 py-4 ${
                    on
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : done
                        ? "bg-primary-soft text-primary-on-soft"
                        : "bg-muted text-foreground/70"
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                      on
                        ? "bg-primary-foreground/20"
                        : done
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span className="flex items-baseline gap-2 whitespace-nowrap">
                    <span
                      className={`text-sm font-bold ${on ? "text-primary-foreground/75" : "opacity-60"}`}
                    >
                      {s.title}
                    </span>
                    <span className="text-xl font-extrabold tracking-tight">{s.label}</span>
                  </span>
                </div>
              </li>
              {i < steps.length - 1 && (
                <ChevronRight className="size-7 shrink-0 self-center text-muted-foreground/50" />
              )}
            </Fragment>
          );
        })}
      </ol>
    </>
  );
}

// 우측 안내 패널 — 설계도 프롬프트의 '이 입력으로 만들어져요'와 같은 형태.
const VERIFY_OUTPUTS: { icon: LucideIcon; label: string }[] = [
  { icon: Search, label: "공개 화면 자동 검사 · 통과/실패" },
  { icon: Lock, label: "로그인·결제 재현 시나리오" },
  { icon: ListChecks, label: "항목별 UI·기능 구분" },
];

function HelperPanel() {
  return (
    <aside className="lg:sticky lg:top-5 lg:self-start">
      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">이 검수로 확인해요</h3>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          무엇을 넣느냐에 따라 자동 검사와 재현 시나리오를 드려요.
        </p>
        <ul className="mt-4 flex flex-col gap-1.5">
          {VERIFY_OUTPUTS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2.5 rounded-lg bg-background px-3 py-2 text-sm text-foreground shadow-sm"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-on-soft">
                <Icon className="size-3.5" />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

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

// 검수하는 동안 보여주는 "시간이 흐르는" 전체 오버레이(설계도 프롬프트와 동일).
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

// 결과 화면 — 리포트(읽기 전용) + 다운로드. 결과 기록(PASS/FAIL/WARN)은 엑셀에서.
function ResultView({ report, onReset }: { report: VerificationReport; onReset: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-primary">검수 결과</p>
        <div className="flex items-center gap-2">
          {report.scenarios.length > 0 && <VerifyScenarioDownloadButton report={report} />}
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-4" />
            다시 검수하기
          </Button>
        </div>
      </div>

      <VerifyReportView report={report} preview />

      <p className="text-center text-xs text-muted-foreground">
        직접 확인 항목의 결과(PASS/FAIL/WARN)는 다운로드한 엑셀의 &apos;결과&apos; 칸에 기록하세요.
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
  creditsOpen,
}: {
  alreadyBlocked: boolean;
  freeLimit: number | null;
  creditsOpen: boolean;
}) {
  const [state, formAction, pending] = useActionState(runVerifyAction, initialState);
  const [mode, setMode] = useState<Mode>("url");
  const [scale, setScale] = useState<"basic" | "detail">("basic");
  const [fileName, setFileName] = useState<string | null>(null);
  const [specFileName, setSpecFileName] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const report = state.report;
  // 결제 켜지면 무료 횟수 제한 대신 크레딧으로 — 무료 소진 안내를 띄우지 않는다.
  const blocked = !creditsOpen && (alreadyBlocked || state.limitReached);

  const onResult = !!report && !dismissed;
  const activeStep: 0 | 1 = onResult ? 1 : 0;

  const isFile = mode === "spec" || mode === "document";
  // 파일: 기본 4 / 상세 8, 사이트: 기본 8 / 상세 16.
  const genCost = isFile ? (scale === "detail" ? 8 : 4) : scale === "detail" ? 16 : 8;

  // 무료 횟수를 다 썼고 결과도 없으면 입력 자리에 안내만.
  const leftContent =
    blocked && !report ? (
      <LimitNotice freeLimit={freeLimit} />
    ) : onResult ? (
      <ResultView report={report} onReset={() => setDismissed(true)} />
    ) : (
      <div className="flex flex-col gap-6">
        {state.error && (
          <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
            {state.error}
          </p>
        )}

        <form action={formAction} onSubmit={() => setDismissed(false)} className="flex flex-col gap-3">
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

          <input type="hidden" name="scale" value={scale} />

          {/* 규모(기본/상세) 선택 + 생성 — 설계도 프롬프트 생성 영역과 같은 형태 */}
          <div className="mt-1 rounded-2xl border-2 border-primary/25 bg-primary-soft/10 p-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <h3 className="text-base font-extrabold text-foreground">
                {isFile ? "등록한 파일로 검수 시나리오 생성하기" : "등록한 사이트 검수하고, 시나리오 생성하기"}
              </h3>
            </div>
            <p className="mb-4 pl-10 text-sm text-muted-foreground">
              {isFile
                ? "아래 버튼을 누르면 AI가 분석해 UI·기능을 중심으로 오픈 전에 꼭 확인할 검수 시나리오를 만들어드려요."
                : "아래 버튼을 누르면 AI가 사이트의 공개 화면을 검수하여 결과를 도출하고 민감 화면의 검수 시나리오를 만들어드려요."}
            </p>

            <p className="mb-1 text-sm font-bold text-foreground">얼마나 촘촘하게 검수하실건가요?</p>
            <p className="mb-2 text-xs text-muted-foreground">
              상세일수록 <b className="text-foreground">검수하는 화면·항목이 많고 더 깊게</b> 봐요. 오픈 직전이라면
              상세를 추천해요.
            </p>
            <div className="grid items-stretch gap-3 sm:grid-cols-2">
              {(isFile ? FILE_SCALES : URL_SCALES).map((c) => {
                const active = scale === c.key;
                return (
                  <button
                    type="button"
                    key={c.key}
                    onClick={() => setScale(c.key)}
                    className={`relative flex flex-col rounded-xl border-2 bg-background p-4 pt-5 text-left transition-all ${
                      active ? "border-primary shadow-md" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {c.best && (
                      <span className="absolute -top-2.5 left-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                        추천 · 가장 촘촘
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-extrabold text-foreground">{c.title}</span>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {c.cost}크레딧
                      </span>
                    </div>
                    {c.checks && (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.checks}</p>
                    )}
                    {c.scnTitle ? (
                      <div className="mt-2">
                        <p className="text-sm font-bold text-foreground">{c.scnTitle}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{c.scnDesc}</p>
                        <p className="mt-0.5 text-xs font-medium text-primary">{c.scnCount}</p>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
                    )}
                  </button>
                );
              })}
            </div>

            <ul className="mt-3 flex flex-col gap-1 text-[11px] leading-relaxed text-muted-foreground">
              <li>
                · 검수 시나리오는 100~150개를 선택해도 규모가 작아 만들 시나리오가 없으면 더 적게 생성될 수 있어요.
                규모에 맞게 선택하세요.
              </li>
              <li>
                · 검수 시나리오는 다운로드하여 사용 가능합니다. 검수 시나리오 다운로드 시 별도 비용이 발생하니 참고해
                주세요.
              </li>
            </ul>

            <Button type="submit" disabled={pending} className="mt-4">
              {isFile ? "등록 파일 분석해서 시나리오 생성" : "등록한 사이트 검수 시작"}
              {creditsOpen && <span className="ml-1.5 font-normal opacity-80">· {genCost}크레딧</span>}
            </Button>
          </div>
        </form>
      </div>
    );

  return (
    <div className="flex flex-col gap-5">
      <VerifySteps active={activeStep} />

      {!onResult && !(blocked && !report) && (
        <p className="text-sm text-muted-foreground">
          이미 오픈(배포)한 사이트 주소나 설계 문서를 넣으면, 오픈 전에 진짜 다 되는지 확인해 드려요.
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">{leftContent}</div>
        <HelperPanel />
      </div>

      {/* 검수 중 — 화면 전체를 덮는 로딩 오버레이 */}
      {pending && <LoadingScreen mode={mode} />}
    </div>
  );
}
