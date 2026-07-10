"use client";

import { useActionState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectAction, type UpdateProjectState } from "./actions";
import type { Project } from "@/domain/project/project";

const initialState: UpdateProjectState = { error: null };

export function EditProjectForm({ project }: { project: Project }) {
  const boundAction = updateProjectAction.bind(null, project.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

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
              defaultValue={project.overallStart}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="overallEnd">전체 종료일</Label>
            <Input
              id="overallEnd"
              name="overallEnd"
              type="date"
              defaultValue={project.overallEnd}
              required
            />
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
