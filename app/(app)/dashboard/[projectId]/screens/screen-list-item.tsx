"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Screen } from "@/domain/screen/screen";
import { updateScreenAction, type UpdateScreenState } from "./update-screen-action";

export function ScreenListItem({ screen, projectId }: { screen: Screen; projectId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const initialState: UpdateScreenState = {
    error: null,
    editing: false,
    values: { pageId: screen.pageId, pageName: screen.pageName },
  };
  const boundAction = updateScreenAction.bind(null, projectId, screen.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (!state.editing && state.error === null && isEditing) {
      setIsEditing(false);
    }
  }

  const isModified = screen.pageIdSource === "manual" || screen.pageNameSource === "manual";

  if (isEditing) {
    return (
      <tr className="border-t border-border">
        <td colSpan={3} className="px-4 py-3">
          <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="updatedAt" value={screen.updatedAt.toISOString()} />
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor={`pageId-${screen.id}`}>페이지ID</Label>
              <Input
                id={`pageId-${screen.id}`}
                name="pageId"
                className="font-mono"
                defaultValue={state.values.pageId}
                required
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor={`pageName-${screen.id}`}>페이지명</Label>
              <Input
                id={`pageName-${screen.id}`}
                name="pageName"
                defaultValue={state.values.pageName}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "저장하는 중..." : "저장"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                취소
              </Button>
            </div>
          </form>
          {state.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border">
      <td className="px-4 py-2">
        <span className="rounded-sm bg-pastel-lavender px-2 py-0.5 font-mono text-xs font-medium text-pastel-lavender-foreground">
          {screen.pageId}
        </span>
      </td>
      <td className="px-4 py-2 text-foreground">{screen.pageName}</td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-neutral-badge-soft px-2 py-0.5 text-xs font-medium text-neutral-badge">
            {isModified ? "수정됨" : "자동생성"}
          </span>
          <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            수정
          </Button>
        </div>
      </td>
    </tr>
  );
}
