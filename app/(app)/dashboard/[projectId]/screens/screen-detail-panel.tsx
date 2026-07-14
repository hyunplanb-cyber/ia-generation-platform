"use client";

import { useActionState, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Screen } from "@/domain/screen/screen";
import type { ButtonAction } from "@/domain/screen/button-action";
import { MAX_FUNC_DEF_LENGTH } from "@/domain/screen/func-def-limit";
import { updateFuncDefAction, type UpdateFuncDefState } from "./update-func-def-action";
import { addButtonActionAction, type AddButtonActionState } from "./add-button-action-action";
import { updateButtonActionAction } from "./update-button-action-action";
import { deleteButtonActionAction } from "./delete-button-action-action";

const selectClasses =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ScreenDetailPanel({
  screen,
  allScreens,
  buttonActions,
  projectId,
  onClose,
}: {
  screen: Screen;
  allScreens: Screen[];
  buttonActions: ButtonAction[];
  projectId: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const funcDefInitial: UpdateFuncDefState = { error: null, value: screen.funcDef ?? "" };
  const boundFuncDefAction = updateFuncDefAction.bind(null, projectId, screen.id);
  const [funcDefState, funcDefFormAction, funcDefPending] = useActionState(
    boundFuncDefAction,
    funcDefInitial,
  );
  const [funcDefText, setFuncDefText] = useState(funcDefState.value);

  const nearLimit = funcDefText.length >= MAX_FUNC_DEF_LENGTH * 0.9;
  const targetOptions = allScreens.filter((s) => s.id !== screen.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-lg flex-col gap-6 overflow-y-auto bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="rounded-sm bg-pastel-lavender px-2 py-0.5 font-mono text-xs font-medium text-pastel-lavender-foreground">
              {screen.pageId}
            </span>
            <h2 className="mt-1 text-lg font-bold text-foreground">{screen.pageName}</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="닫기">
            <X className="size-4" />
          </Button>
        </div>

        <form action={funcDefFormAction} className="flex flex-col gap-2">
          <input type="hidden" name="updatedAt" value={screen.updatedAt.toISOString()} />
          <Label htmlFor="funcDef">기능정의</Label>
          <Textarea
            id="funcDef"
            name="funcDef"
            rows={8}
            maxLength={MAX_FUNC_DEF_LENGTH}
            value={funcDefText}
            onChange={(e) => setFuncDefText(e.target.value)}
          />
          <p className={`text-xs ${nearLimit ? "text-warning" : "text-muted-foreground"}`}>
            {funcDefText.length.toLocaleString()} / {MAX_FUNC_DEF_LENGTH.toLocaleString()}자
          </p>
          {funcDefState.error && <p className="text-sm text-danger">{funcDefState.error}</p>}
          <Button type="submit" size="sm" disabled={funcDefPending} className="self-start">
            {funcDefPending ? "저장하는 중..." : "기능정의 저장"}
          </Button>
        </form>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-foreground">버튼 - 이동 대상</h3>
          <ul className="flex flex-col gap-2">
            {buttonActions.map((ba) => (
              <ButtonActionRow
                key={ba.id}
                buttonAction={ba}
                allScreens={allScreens}
                projectId={projectId}
                screenId={screen.id}
              />
            ))}
          </ul>
          <AddButtonActionForm projectId={projectId} screenId={screen.id} targetOptions={targetOptions} />
        </div>
      </div>
    </div>
  );
}

function ButtonActionRow({
  buttonAction,
  allScreens,
  projectId,
  screenId,
}: {
  buttonAction: ButtonAction;
  allScreens: Screen[];
  projectId: string;
  screenId: string;
}) {
  const target = allScreens.find((s) => s.id === buttonAction.targetScreenId);
  const brokenLink = !target || target.status === "quarantined";
  const renamed = !brokenLink && target!.pageId !== buttonAction.targetPageIdSnapshot;
  const options = allScreens.filter((s) => s.id !== screenId);

  return (
    <li className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground">{buttonAction.label}</span>
        <form action={deleteButtonActionAction.bind(null, projectId, screenId, buttonAction.id)}>
          <Button type="submit" variant="ghost" size="sm">
            삭제
          </Button>
        </form>
      </div>
      <form action={updateButtonActionAction.bind(null, projectId, screenId, buttonAction.id)}>
        <select
          name="targetScreenId"
          defaultValue={buttonAction.targetScreenId}
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className={selectClasses}
        >
          {brokenLink && (
            <option value={buttonAction.targetScreenId} disabled>
              {buttonAction.targetPageIdSnapshot} (삭제됨/격리됨)
            </option>
          )}
          {options.map((s) => (
            <option key={s.id} value={s.id}>
              {s.pageId} — {s.pageName}
            </option>
          ))}
        </select>
      </form>
      {brokenLink && (
        <span className="w-fit rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
          깨진 링크
        </span>
      )}
      {renamed && (
        <span className="w-fit rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">
          연결 대상 이름이 바뀌었어요
        </span>
      )}
    </li>
  );
}

function AddButtonActionForm({
  projectId,
  screenId,
  targetOptions,
}: {
  projectId: string;
  screenId: string;
  targetOptions: Screen[];
}) {
  const initial: AddButtonActionState = { error: null, values: { label: "", targetScreenId: "" } };
  const boundAction = addButtonActionAction.bind(null, projectId, screenId);
  const [state, formAction, pending] = useActionState(boundAction, initial);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3"
    >
      <Label htmlFor="label">버튼 설명</Label>
      <Input id="label" name="label" defaultValue={state.values.label} placeholder="예: 계속 쇼핑하기" />
      <Label htmlFor="targetScreenId">이동 대상</Label>
      <select
        id="targetScreenId"
        name="targetScreenId"
        defaultValue={state.values.targetScreenId}
        className={selectClasses}
      >
        <option value="">선택해 주세요</option>
        {targetOptions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.pageId} — {s.pageName}
          </option>
        ))}
      </select>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "추가하는 중..." : "버튼 추가"}
      </Button>
    </form>
  );
}
