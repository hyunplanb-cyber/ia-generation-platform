"use client";

import { useActionState, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Menu } from "@/domain/menu/menu";
import { reorderMenuAction } from "./reorder-menu-action";
import { updateMenuAction, type UpdateMenuState } from "./update-menu-action";

const initialState: UpdateMenuState = { error: null, editing: false };

export function MenuListItem({
  menu,
  projectId,
  isFirst,
  isLast,
}: {
  menu: Menu;
  projectId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const boundUpdateAction = updateMenuAction.bind(null, projectId, menu.id);
  const [state, formAction, pending] = useActionState(boundUpdateAction, initialState);

  // 저장 성공 시 조회 모드로 되돌린다. useEffect 대신 렌더 중 "이전 상태와 비교해 조정"
  // 패턴을 쓴다(react-hooks/set-state-in-effect가 금지하는, effect 안에서의 setState 회피).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (!state.editing && state.error === null && isEditing) {
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <li className="rounded-lg border border-border bg-background p-4">
        <form action={formAction} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`nameKo-${menu.id}`}>메뉴명 (한글)</Label>
              <Input id={`nameKo-${menu.id}`} name="nameKo" defaultValue={menu.nameKo} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`nameEn-${menu.id}`}>메뉴명 (영문)</Label>
              <Input id={`nameEn-${menu.id}`} name="nameEn" defaultValue={menu.nameEn} required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`description-${menu.id}`}>설명 (선택)</Label>
            <Textarea
              id={`description-${menu.id}`}
              name="description"
              rows={2}
              defaultValue={menu.description ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`desiredFeatures-${menu.id}`}>원하는 기능 (선택)</Label>
            <Textarea
              id={`desiredFeatures-${menu.id}`}
              name="desiredFeatures"
              rows={2}
              defaultValue={menu.desiredFeatures ?? ""}
            />
          </div>
          {state.error && <p className="text-sm text-danger">{state.error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "저장하는 중..." : "저장"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              취소
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-pastel-lavender px-2 py-0.5 font-mono text-xs font-medium text-pastel-lavender-foreground">
            {menu.menuCode}
          </span>
          <span className="font-semibold text-foreground">{menu.nameKo}</span>
          <span className="text-sm text-muted-foreground">({menu.nameEn})</span>
        </div>
        {menu.description && <p className="text-sm text-muted-foreground">{menu.description}</p>}
      </div>
      <div className="flex items-center gap-1">
        {!isFirst && (
          <form action={reorderMenuAction.bind(null, projectId, menu.id, "up")}>
            <Button type="submit" variant="ghost" size="icon" aria-label="위로 이동">
              <ChevronUp className="size-4" />
            </Button>
          </form>
        )}
        {!isLast && (
          <form action={reorderMenuAction.bind(null, projectId, menu.id, "down")}>
            <Button type="submit" variant="ghost" size="icon" aria-label="아래로 이동">
              <ChevronDown className="size-4" />
            </Button>
          </form>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
          수정
        </Button>
      </div>
    </li>
  );
}
