"use client";

import { useActionState, useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectAction, type UpdateProjectState } from "./actions";
import type { Project } from "@/domain/project/project";

const initialState: UpdateProjectState = { error: null };

export function EditProjectForm({
  project,
  hasScreens,
}: {
  project: Project;
  hasScreens: boolean;
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
    <div className="bg-linear-to-br from-pastel-lavender/25 via-background to-pastel-yellow/20 py-16">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-on-soft">
            <Pencil className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">프로젝트 수정</h1>
            <p className="text-sm text-muted-foreground">언제든 내용을 다시 고칠 수 있어요.</p>
          </div>
        </div>
        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="concept">컨셉/설명</Label>
            <Textarea id="concept" name="concept" rows={4} defaultValue={project.concept} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="menuDraft">메뉴 구성 (선택)</Label>
            <Textarea id="menuDraft" name="menuDraft" rows={4} defaultValue={project.menuDraft ?? ""} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="designConcept">디자인 컨셉 (선택)</Label>
            <Textarea
              id="designConcept"
              name="designConcept"
              rows={3}
              defaultValue={project.designConcept ?? ""}
            />
          </div>
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
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중..." : "저장"}
          </Button>
        </form>
      </div>
    </div>
  );
}
