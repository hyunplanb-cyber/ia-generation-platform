"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction, type CreateProjectState } from "./actions";

const initialState: CreateProjectState = { error: null };

export default function NewProjectPage() {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold text-foreground">새 프로젝트 만들기</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="concept">컨셉/설명</Label>
          <Textarea id="concept" name="concept" rows={4} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="overallStart">전체 시작일</Label>
          <Input id="overallStart" name="overallStart" type="date" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="overallEnd">전체 종료일</Label>
          <Input id="overallEnd" name="overallEnd" type="date" required />
        </div>
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "만드는 중..." : "만들기"}
        </Button>
      </form>
    </div>
  );
}
