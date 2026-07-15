"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectAction, type UpdateProjectState } from "../edit/actions";
import { GenerateIaButton } from "../menus/generate-ia-button";
import { InputHint } from "../input-hint";
import type { Project } from "@/domain/project/project";

const initialState: UpdateProjectState = { error: null, saved: false };

export function BriefForm({ project, hasMenus }: { project: Project; hasMenus: boolean }) {
  const boundAction = updateProjectAction.bind(null, project.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground">주요 메뉴·디자인 컨셉</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          떠오르는 메뉴 구성과 원하는 디자인 분위기를 알려주세요. 다 적었다면 아래에서 바로 산출물을
          생성할 수 있어요.
        </p>
      </div>

      <form
        action={formAction}
        className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6 shadow-sm"
      >
        {/* 다른 페이지 필드는 값 보존을 위해 숨겨서 함께 제출 */}
        <input type="hidden" name="concept" value={project.concept} />
        <input type="hidden" name="overallStart" value={project.overallStart} />
        <input type="hidden" name="overallEnd" value={project.overallEnd} />
        <input type="hidden" name="deviceMode" value={project.deviceMode} />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="menuDraft">주요 메뉴 구성</Label>
          <InputHint>
            떠오르는 메뉴를 적으면 그 구조를 살려 IA를 만들어요. 비워두면 컨셉만으로 메뉴를 제안해요.
          </InputHint>
          <Textarea
            id="menuDraft"
            name="menuDraft"
            rows={5}
            defaultValue={project.menuDraft ?? ""}
            placeholder="예) 홈, 상품, 장바구니, 마이페이지, 고객센터"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="designConcept">디자인 컨셉</Label>
          <InputHint>
            원하는 분위기나 스타일을 적으면 각 화면의 생성 프롬프트에 반영돼요.
          </InputHint>
          <Textarea
            id="designConcept"
            name="designConcept"
            rows={4}
            defaultValue={project.designConcept ?? ""}
            placeholder="예) 미니멀하고 깔끔한, 파스텔 톤"
          />
        </div>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" disabled={pending}>
            {pending ? "저장 중..." : "입력 내용 저장"}
          </Button>
          {state.saved && !state.error && (
            <span className="flex items-center gap-1 text-sm text-primary">
              <Check className="size-4" /> 저장됐어요
            </span>
          )}
        </div>
      </form>

      {/* 분석·생성 CTA */}
      {hasMenus ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="font-semibold text-foreground">이미 산출물이 생성됐어요</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            생성된 산출물은 왼쪽 메뉴에서 확인·수정할 수 있어요. 메뉴를 직접 추가하거나 다시 생성하려면{" "}
            <Link href={`/dashboard/${project.id}/menus`} className="font-medium text-primary underline">
              메뉴 직접 편집
            </Link>
            에서 이어가세요.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary-soft/40 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">입력한 내용으로 산출물 만들기</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                컨셉과 메뉴 구성을 저장한 뒤 아래 버튼을 누르면, AI가 분석해 메뉴·화면·기능정의를 자동으로
                생성해요.
              </p>
            </div>
          </div>
          <GenerateIaButton projectId={project.id} />
          <p className="text-xs text-muted-foreground">
            메뉴를 직접 하나씩 넣고 싶다면{" "}
            <Link href={`/dashboard/${project.id}/menus`} className="font-medium text-primary underline">
              메뉴 직접 편집
            </Link>
            을 이용하세요.
          </p>
        </div>
      )}
    </div>
  );
}
