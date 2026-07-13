"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addMenuAction, type AddMenuState } from "./actions";

const initialState: AddMenuState = { error: null, successToken: 0 };

export function MenuForm({ projectId }: { projectId: string }) {
  const boundAction = addMenuAction.bind(null, projectId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form
      key={state.successToken}
      action={formAction}
      className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nameKo">메뉴명 (한글)</Label>
          <Input id="nameKo" name="nameKo" placeholder="예: 회원" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nameEn">메뉴명 (영문)</Label>
          <Input id="nameEn" name="nameEn" placeholder="예: Member" required />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">설명 (선택)</Label>
        <Textarea id="description" name="description" rows={2} placeholder="이 메뉴가 어떤 역할을 하는지 간단히 적어주세요." />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="desiredFeatures">원하는 기능 (선택)</Label>
        <Textarea
          id="desiredFeatures"
          name="desiredFeatures"
          rows={2}
          placeholder="예: 예약하기 — 원하는 날짜/시간에 미용 예약"
        />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "추가하는 중..." : "메뉴 추가"}
      </Button>
    </form>
  );
}
