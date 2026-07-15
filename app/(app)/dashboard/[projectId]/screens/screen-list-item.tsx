"use client";

import { useActionState, useState } from "react";
import { ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";
import { updateScreenAction, type UpdateScreenState } from "./update-screen-action";

export function ScreenListItem({
  screen,
  projectId,
  onOpenDetail,
  isOutOfRange,
  isReversed,
  buttonActions,
  allScreens,
}: {
  screen: Screen;
  projectId: string;
  onOpenDetail: (screenId: string) => void;
  isOutOfRange: boolean;
  isReversed: boolean;
  buttonActions: ButtonAction[];
  allScreens: Screen[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
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

  const isModified =
    screen.pageIdSource === "manual" ||
    screen.pageNameSource === "manual" ||
    screen.funcDefSource === "manual" ||
    screen.promptSource === "manual" ||
    screen.scheduleLocked;

  const screenById = new Map(allScreens.map((s) => [s.id, s]));

  if (isEditing) {
    return (
      <tr className="border-t border-border">
        <td colSpan={5} className="px-4 py-3">
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
    <>
      <tr className="border-t border-border">
        <td className="px-4 py-2 align-top">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-left"
            aria-expanded={expanded}
          >
            {expanded ? (
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            )}
            <span className="rounded-sm bg-pastel-lavender px-2 py-0.5 font-mono text-xs font-medium text-pastel-lavender-foreground">
              {screen.pageId}
            </span>
          </button>
        </td>
        <td className="px-4 py-2 align-top text-foreground">{screen.pageName}</td>
        <td className="px-4 py-2 align-top">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-foreground">
              {screen.scheduleStart ?? "-"} ~ {screen.scheduleEnd ?? "-"}
            </span>
            <div className="flex flex-wrap gap-1">
              {isOutOfRange && (
                <span className="w-fit rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                  범위 이탈
                </span>
              )}
              {isReversed && (
                <span className="w-fit rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
                  일정 역전
                </span>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-2 align-top">
          <span className="rounded-full bg-neutral-badge-soft px-2 py-0.5 text-xs font-medium text-neutral-badge">
            {isModified ? "수정됨" : "자동생성"}
          </span>
        </td>
        <td className="px-4 py-2 align-top">
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              수정
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenDetail(screen.id)}>
              상세
            </Button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="border-t border-border/60 bg-muted/20">
          <td colSpan={5} className="px-4 py-4">
            <div className="flex flex-col gap-4 pl-6 text-sm">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  설명 · 기능정의
                </p>
                {screen.funcDef ? (
                  <p className="whitespace-pre-wrap text-foreground">{screen.funcDef}</p>
                ) : (
                  <p className="text-muted-foreground/60">아직 비어 있어요</p>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  버튼 · 이동 화면
                </p>
                {buttonActions.length === 0 ? (
                  <p className="text-muted-foreground/60">버튼 없음</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {buttonActions.map((ba) => {
                      const target = screenById.get(ba.targetScreenId);
                      return (
                        <li key={ba.id} className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary-on-soft">
                            {ba.label}
                          </span>
                          <ArrowRight className="size-3.5 text-muted-foreground" />
                          {target ? (
                            <span className="text-foreground">
                              <span className="font-mono text-xs text-muted-foreground">
                                {target.pageId}
                              </span>{" "}
                              {target.pageName}
                            </span>
                          ) : (
                            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
                              깨진 링크
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  AI 프롬프트
                </p>
                {screen.prompt ? (
                  <p className="whitespace-pre-wrap rounded-md border border-border bg-background px-3 py-2 text-foreground">
                    {screen.prompt}
                  </p>
                ) : (
                  <p className="text-muted-foreground/60">아직 비어 있어요</p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
