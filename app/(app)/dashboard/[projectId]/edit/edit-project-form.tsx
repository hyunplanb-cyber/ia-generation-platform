"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectAction, type UpdateProjectState } from "./actions";
import { GenerateIaButton } from "../menus/generate-ia-button";
import type { Project } from "@/domain/project/project";

const initialState: UpdateProjectState = { error: null };

export function EditProjectForm({
  project,
  hasScreens,
  hasMenus,
}: {
  project: Project;
  hasScreens: boolean;
  hasMenus: boolean;
}) {
  const boundAction = updateProjectAction.bind(null, project.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [overallStart, setOverallStart] = useState(project.overallStart);
  const [overallEnd, setOverallEnd] = useState(project.overallEnd);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const scheduleChanged = overallStart !== project.overallStart || overallEnd !== project.overallEnd;
    if (
      hasScreens &&
      scheduleChanged &&
      !confirm(
        "수동으로 조정한 화면은 유지되고, 자동배분된 화면만 새로 계산됩니다. 계속할까요?",
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground">입력</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          컨셉과 주요 메뉴 구성, 디자인 컨셉을 적어주세요. 이 내용을 AI가 분석해 산출물을 만들어요.
        </p>
      </div>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-xl border border-border bg-background p-6 shadow-sm"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="concept">컨셉/설명</Label>
          <p className="text-xs text-muted-foreground">어떤 사이트인지, 핵심 기능은 무엇인지 적어주세요.</p>
          <Textarea id="concept" name="concept" rows={4} defaultValue={project.concept} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="menuDraft">주요 메뉴 구성 (선택)</Label>
          <p className="text-xs text-muted-foreground">
            떠오르는 메뉴를 자유롭게 적어주세요. 비워두면 컨셉만으로 AI가 메뉴를 제안해요.
          </p>
          <Textarea
            id="menuDraft"
            name="menuDraft"
            rows={4}
            defaultValue={project.menuDraft ?? ""}
            placeholder="예) 홈, 상품, 장바구니, 마이페이지, 고객센터"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="designConcept">디자인 컨셉 (선택)</Label>
          <p className="text-xs text-muted-foreground">원하는 분위기나 스타일이 있으면 적어주세요.</p>
          <Textarea
            id="designConcept"
            name="designConcept"
            rows={3}
            defaultValue={project.designConcept ?? ""}
            placeholder="예) 미니멀하고 깔끔한, 파스텔 톤"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="overallStart">전체 시작일</Label>
            <Input
              id="overallStart"
              name="overallStart"
              type="date"
              value={overallStart}
              onChange={(e) => setOverallStart(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="overallEnd">전체 종료일</Label>
            <Input
              id="overallEnd"
              name="overallEnd"
              type="date"
              value={overallEnd}
              onChange={(e) => setOverallEnd(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>디바이스 대응 방식</Label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="deviceMode"
              value="responsive"
              defaultChecked={project.deviceMode === "responsive"}
            />
            반응형 하나로
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name="deviceMode"
              value="device-split"
              defaultChecked={project.deviceMode === "device-split"}
            />
            PC·모바일 분리
          </label>
        </div>
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        <Button type="submit" variant="secondary" disabled={pending} className="self-start">
          {pending ? "저장 중..." : "입력 내용 저장"}
        </Button>
      </form>

      {/* 분석·생성 CTA */}
      {hasMenus ? (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="font-semibold text-foreground">이미 산출물이 생성됐어요</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            생성된 산출물은 왼쪽 메뉴에서 확인·수정할 수 있어요. 메뉴를 직접 추가하거나 다시
            생성하려면{" "}
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
        <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary-soft/40 p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">입력한 내용으로 산출물 만들기</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                위 내용을 저장한 뒤 아래 버튼을 누르면, AI가 컨셉과 메뉴 구성을 분석해 메뉴·화면·기능정의를
                자동으로 생성해요.
              </p>
            </div>
          </div>
          <GenerateIaButton projectId={project.id} />
          <p className="text-xs text-muted-foreground">
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
    </div>
  );
}
