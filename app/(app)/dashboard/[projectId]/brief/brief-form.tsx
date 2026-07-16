"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "../form-shell";
import { saveBriefAndGenerateAction, type GenerateState } from "./actions";
import type { Project } from "@/domain/project/project";

const initialState: GenerateState = { reason: null };

const MESSAGES: Record<string, string> = {
  unavailable: "AI 자동 생성 기능을 아직 사용할 수 없어요. 관리자 설정(ANTHROPIC_API_KEY)이 필요해요.",
  "no-credit":
    "AI 사용 크레딧이 부족해요. Anthropic 콘솔의 Plans & Billing에서 크레딧을 충전하면 바로 사용할 수 있어요.",
  "already-has-menus": "이미 메뉴가 있어요. 자동 생성은 메뉴가 없는 새 프로젝트에서만 실행돼요.",
  failed: "자동 생성에 실패했어요. 잠시 후 다시 시도해 주세요.",
};

export function BriefForm({ project, hasMenus }: { project: Project; hasMenus: boolean }) {
  const boundAction = saveBriefAndGenerateAction.bind(null, project.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        떠오르는 메뉴 구성과 원하는 디자인 분위기를 알려주세요. 다 적었다면 아래에서 바로 산출물을
        생성할 수 있어요.
      </p>

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
            rows={5}
            defaultValue={project.menuDraft ?? ""}
            placeholder="예) 홈, 상품, 장바구니, 마이페이지, 고객센터"
          />
        </FormSection>

        <FormSection
          title="디자인 컨셉"
          hint="원하는 분위기나 스타일을 적으면 각 화면의 생성 프롬프트에 반영돼요."
        >
          <Textarea
            id="designConcept"
            name="designConcept"
            rows={4}
            defaultValue={project.designConcept ?? ""}
            placeholder="예) 미니멀하고 깔끔한, 파스텔 톤"
          />
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
            <Button type="submit" size="lg" disabled={pending} className="self-start">
              <Sparkles className="size-4" />
              컨셉 분석해서 자동 생성
            </Button>
            {state.reason && (
              <p className="text-sm text-danger">
                {MESSAGES[state.reason] ?? "자동 생성에 실패했어요."}
              </p>
            )}
            <p className="text-xs leading-relaxed text-muted-foreground">
              메뉴를 직접 하나씩 넣고 싶다면{" "}
              <Link
                href={`/dashboard/${project.id}/menus`}
                className="font-medium text-primary underline"
              >
                메뉴 직접 편집
              </Link>
              을 이용하세요.
            </p>
          </div>
        )}
      </form>

      {pending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="font-medium text-foreground">컨셉을 분석해 메뉴와 화면을 만들고 있어요...</p>
        </div>
      )}
    </div>
  );
}
