"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  Sparkles,
  Loader2,
  Network,
  LayoutList,
  FileText,
  Workflow,
  CalendarRange,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "../form-shell";
import { saveBriefAndGenerateAction, type GenerateState } from "./actions";
import { DESIGN_OPTIONS, type DesignKey } from "@/lib/design-presets";
import { CREDIT_COST } from "@/lib/credits";
import type { Project } from "@/domain/project/project";

const initialState: GenerateState = { reason: null };

const MESSAGES: Record<string, string> = {
  unavailable: "AI 자동 생성 기능을 아직 사용할 수 없어요. 관리자 설정(ANTHROPIC_API_KEY)이 필요해요.",
  "insufficient-credit": "크레딧이 부족해요. 충전한 뒤 다시 시도해 주세요.",
  "no-credit":
    "AI 사용 크레딧이 부족해요. Anthropic 콘솔의 Plans & Billing에서 크레딧을 충전하면 바로 사용할 수 있어요.",
  "already-has-menus": "이미 메뉴가 있어요. 자동 생성은 메뉴가 없는 새 프로젝트에서만 실행돼요.",
  "too-large": "메뉴가 많아 생성 결과가 한 번에 담기지 못했어요. 메뉴 구성을 조금 줄이거나 다시 시도해 주세요.",
  failed: "자동 생성에 실패했어요. 잠시 후 다시 시도해 주세요.",
};

// 생성은 30초~1분쯤 걸린다. 같은 문장만 떠 있으면 멈춘 것처럼 보이므로,
// AI가 실제로 거치는 단계를 순서대로 보여준다.
const PROGRESS_STEPS = [
  "컨셉을 읽고 있어요",
  "메뉴를 나누고 있어요",
  "메뉴마다 화면을 뽑고 있어요",
  "화면별 기능정의를 쓰고 있어요",
  "화면별 AI 프롬프트를 쓰고 있어요",
  "화면 사이 이동을 연결하고 있어요",
  "일정을 나누고 있어요",
  "거의 다 됐어요",
];

const DELIVERABLES = [
  { icon: Network, label: "메뉴 구조" },
  { icon: LayoutList, label: "IA · 화면 목록+화면별 프롬프트" },
  { icon: FileText, label: "기능정의서" },
  { icon: Workflow, label: "FLOW·흐름도" },
  { icon: CalendarRange, label: "WBS 일정" },
  { icon: Package, label: "AI 빌드 스펙팩" },
];

// 생성 규모 — 화면 수로 나뉘고, 크레딧(요금)도 다르다.
// key "detail"이 true면 상세(3뎁스). 액션은 formData.get("detail")==="on"으로 읽는다.
type Scale = "basic" | "detail";
// 크레딧 값은 lib/credits.ts에서 가져온다. 손으로 적으면 값을 올릴 때 여기만 남는다
// (실제로 4/8이 그대로 남아 화면에만 옛 값이 보였다).
const SCALE_OPTIONS: { key: Scale; title: string; credit: string; desc: string }[] = [
  {
    key: "basic",
    title: "기본 · 30~50화면",
    credit: `${CREDIT_COST.genBasic}크레딧`,
    desc: "핵심 화면 위주로 빠르게(2뎁스). 처음엔 이걸로 충분해요.",
  },
  {
    key: "detail",
    title: "상세 · 100~150화면",
    credit: `${CREDIT_COST.genDetail}크레딧`,
    desc: "상태·탭·예외까지 촘촘히(3뎁스). 실무 산출물 수준, 조금 더 걸려요.",
  },
];

export function BriefForm({
  project,
  hasMenus,
  creditsOpen,
}: {
  project: Project;
  hasMenus: boolean;
  creditsOpen: boolean;
}) {
  const boundAction = saveBriefAndGenerateAction.bind(null, project.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [scale, setScale] = useState<Scale>("basic");
  // 버튼에 붙일 소모 크레딧. 규모 카드와 같은 출처를 써서 두 표기가 어긋나지 않게 한다.
  const scaleCredit =
    SCALE_OPTIONS.find((o) => o.key === scale)?.credit ?? SCALE_OPTIONS[0].credit;
  // 기존 프로젝트가 저장한 값이 3개 중 하나면 그걸 고르고, 아니면 첫 번째로.
  const [design, setDesign] = useState<DesignKey>(
    DESIGN_OPTIONS.find((d) => d.concept === project.designConcept)?.key ?? "navy",
  );
  const designConcept = DESIGN_OPTIONS.find((d) => d.key === design)!.concept;

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        떠오르는 메뉴 구성과 원하는 디자인 분위기를 알려주세요. 다 적었다면 아래에서 바로 산출물을
        생성할 수 있어요.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <form action={formAction} className="flex flex-col gap-8">
          {/* 다른 페이지 필드는 값 보존을 위해 숨겨서 함께 제출 */}
          <input type="hidden" name="concept" value={project.concept} />
          <input type="hidden" name="overallStart" value={project.overallStart} />
          <input type="hidden" name="overallEnd" value={project.overallEnd} />
          <input type="hidden" name="deviceMode" value={project.deviceMode} />

          <FormSection
            title="주요 메뉴 구성"
            hint="떠오르는 메뉴를 적으면 그 구조를 살려 IA를 만들어요. 비워두면 컨셉만으로 메뉴를 제안해요."
          >
            <Textarea
              id="menuDraft"
              name="menuDraft"
              rows={6}
              defaultValue={project.menuDraft ?? ""}
              placeholder="예) 홈, 상품, 장바구니, 마이페이지, 고객센터"
            />
          </FormSection>

          {/* 예전엔 "각 화면의 생성 프롬프트에 반영돼요"라고 적혀 있었다.
              화면마다 색을 박았더니 나중에 고른 디자인 프리셋과 싸워서 그만뒀다(2026-08-04).
              지금 이 선택이 가는 곳은 둘 — 디자인 프리셋의 출발점, 그리고 스펙팩 맨 앞 한 줄. */}
          <FormSection
            title="디자인 컨셉"
            hint="고른 분위기가 디자인 프리셋의 출발점이 되고, 스펙팩 첫 장에 적혀요. 나중에 프리셋에서 색·글꼴을 직접 손볼 수 있어요."
          >
            <input type="hidden" name="designConcept" value={designConcept} />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {DESIGN_OPTIONS.map((opt) => {
                const on = design === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setDesign(opt.key)}
                    aria-pressed={on}
                    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors ${
                      on
                        ? "border-primary bg-background ring-2 ring-primary/30"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="font-semibold text-foreground">{opt.title}</span>
                    <span className="text-xs leading-relaxed text-muted-foreground">{opt.desc}</span>
                    <span className="mt-1.5 flex gap-1">
                      {opt.swatches.map((c) => (
                        <span
                          key={c}
                          className="size-4 rounded-full border border-black/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </FormSection>

          {/* 산출물 생성 영역 — 디자인 컨셉 바로 아래 */}
          {hasMenus ? (
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">이미 산출물이 생성됐어요</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                생성된 산출물은 상단 <b className="font-semibold text-foreground">STEP 3 · 생성 산출물</b>
                에서 확인·수정할 수 있어요. 메뉴를 직접 추가하거나 다시 생성하려면{" "}
                <Link
                  href={`/dashboard/${project.id}/menus`}
                  className="font-medium text-primary underline"
                >
                  메뉴 직접 편집
                </Link>
                에서 이어가세요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary-soft/30 p-6">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Sparkles className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-foreground">입력한 내용으로 산출물 만들기</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    아래 버튼을 누르면 입력한 내용을 저장하고, AI가 분석해 메뉴·화면·기능정의를 자동으로
                    생성해요.
                  </p>
                </div>
              </div>
              {/* 생성 규모 선택 — 화면 수(2뎁스/3뎁스)에 따라 크레딧이 다르다.
                  선택값은 hidden input의 detail(on/off)로 액션에 전달된다. */}
              <input type="hidden" name="detail" value={scale === "detail" ? "on" : "off"} />
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">얼마나 촘촘하게 만들까요?</p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {SCALE_OPTIONS.map((opt) => {
                    const on = scale === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setScale(opt.key)}
                        disabled={pending}
                        aria-pressed={on}
                        className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors disabled:opacity-60 ${
                          on
                            ? "border-primary bg-background ring-2 ring-primary/30"
                            : "border-border bg-background hover:border-primary/40"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">{opt.title}</span>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              on
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {opt.credit}
                          </span>
                        </span>
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  선택한 규모만큼 크레딧이 차감돼요.
                  {!creditsOpen && " 지금은 가입 시 드린 무료 크레딧에서 빠져요."}
                </p>
              </div>

              <Button type="submit" size="lg" disabled={pending} className="self-start">
                <Sparkles className="size-4" />
                컨셉 분석해서 자동 생성
                <span className="ml-1 font-normal opacity-80">· {scaleCredit}</span>
              </Button>
              {state.reason && (
                <p className="text-sm text-danger">
                  {MESSAGES[state.reason] ?? "자동 생성에 실패했어요."}
                  {state.reason === "insufficient-credit" && (
                    <Link
                      href={`/dashboard/billing`}
                      className="ml-2 font-semibold text-primary underline"
                    >
                      충전하기
                    </Link>
                  )}
                </p>
              )}
            </div>
          )}
        </form>

        {/* 생성될 산출물 미리보기 — 오른쪽 패널 */}
        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-xl border border-border bg-muted/20 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">이렇게 만들어져요</h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              생성 버튼을 누르면 아래 6가지 산출물이 자동으로 완성돼요.
            </p>
            <ul className="mt-4 flex flex-col gap-1.5">
              {DELIVERABLES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                >
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary-soft text-primary-on-soft">
                    <Icon className="size-3.5" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              AI 빌드 스펙팩은 파일 다운로드 시 확인됩니다.
            </p>
          </div>
        </aside>
      </div>

      {pending && <GeneratingOverlay />}
    </div>
  );
}

// 생성 대기 화면. pending일 때만 화면에 붙으므로, 마운트되는 순간이 곧 시작 시점이다
// (그래서 따로 초기화할 필요가 없다).
function GeneratingOverlay() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // 8초에 한 단계씩 넘어가고 마지막 문구에서 멈춘다. 실제 진행률이 아니라 안내다.
  const step = Math.min(Math.floor(elapsed / 8), PROGRESS_STEPS.length - 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/85 px-6 backdrop-blur-sm">
      <Loader2 className="size-9 animate-spin text-primary" />

      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-lg font-bold text-foreground">{PROGRESS_STEPS[step]}</p>
        <p className="text-sm text-muted-foreground">
          보통 <b className="font-semibold text-foreground">30초~1분</b> 걸려요. 창을 닫지 말고
          기다려 주세요.
        </p>
      </div>

      {/* 진행 칸 — 실제 진행률은 알 수 없으므로 지나온 단계 수만큼 채운다 */}
      <div className="flex gap-1.5" aria-hidden="true">
        {PROGRESS_STEPS.map((label, i) => (
          <span
            key={label}
            className={`h-1.5 w-7 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      <p className="text-xs tabular-nums text-muted-foreground">{elapsed}초 지남</p>

      {elapsed >= 75 && (
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          메뉴가 많으면 조금 더 걸릴 수 있어요. 2분이 넘으면 새로고침 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
