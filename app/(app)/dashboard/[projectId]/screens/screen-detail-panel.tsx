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
import { generatePromptAction } from "./generate-prompt-action";
import { updatePromptAction, type UpdatePromptState } from "./update-prompt-action";
import { updateScheduleAction, type UpdateScheduleState } from "./update-schedule-action";

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

        <PromptSection screen={screen} projectId={projectId} />

        <ScheduleSection screen={screen} projectId={projectId} />

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

function PromptSection({ screen, projectId }: { screen: Screen; projectId: string }) {
  const [promptValue, setPromptValue] = useState(screen.prompt ?? "");
  const [hasPrompt, setHasPrompt] = useState(!!screen.prompt);
  const [generating, setGenerating] = useState(!screen.prompt);
  const [unavailable, setUnavailable] = useState(false);
  const [generateFailed, setGenerateFailed] = useState(false);

  useEffect(() => {
    if (screen.prompt) return;
    let cancelled = false;
    generatePromptAction(projectId, screen.id).then((result) => {
      if (cancelled) return;
      setGenerating(false);
      if (result.ok) {
        setPromptValue(result.prompt ?? "");
        setHasPrompt(true);
      } else if (result.unavailable) {
        setUnavailable(true);
      } else {
        setGenerateFailed(true);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.id]);

  const updateInitial: UpdatePromptState = { error: null, value: promptValue };
  const boundUpdateAction = updatePromptAction.bind(null, projectId, screen.id);
  const [updateState, updateFormAction, updatePending] = useActionState(
    boundUpdateAction,
    updateInitial,
  );

  const isModified = screen.promptSource === "manual";

  if (generating) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-foreground">AI 프롬프트</h3>
        <p className="text-sm text-muted-foreground">AI가 프롬프트를 만들고 있어요...</p>
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-foreground">AI 프롬프트</h3>
        <p className="text-sm text-muted-foreground">
          AI 프롬프트 기능을 아직 사용할 수 없어요. 관리자 설정이 필요해요.
        </p>
      </div>
    );
  }

  if (!hasPrompt || generateFailed) {
    return (
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-foreground">AI 프롬프트</h3>
        <p className="text-sm text-danger">프롬프트를 생성하지 못했어요.</p>
      </div>
    );
  }

  return (
    <form action={updateFormAction} className="flex flex-col gap-2">
      <input type="hidden" name="updatedAt" value={screen.updatedAt.toISOString()} />
      <div className="flex items-center justify-between">
        <Label htmlFor="prompt">AI 프롬프트</Label>
        <span className="rounded-full bg-neutral-badge-soft px-2 py-0.5 text-xs font-medium text-neutral-badge">
          {isModified ? "수정됨" : "자동생성"}
        </span>
      </div>
      <Textarea
        id="prompt"
        name="prompt"
        rows={8}
        value={promptValue}
        onChange={(e) => setPromptValue(e.target.value)}
      />
      {updateState.error && <p className="text-sm text-danger">{updateState.error}</p>}
      <Button type="submit" size="sm" disabled={updatePending} className="self-start">
        {updatePending ? "저장하는 중..." : "AI 프롬프트 저장"}
      </Button>
    </form>
  );
}

function ScheduleSection({ screen, projectId }: { screen: Screen; projectId: string }) {
  const initial: UpdateScheduleState = {
    error: null,
    values: { scheduleStart: screen.scheduleStart ?? "", scheduleEnd: screen.scheduleEnd ?? "" },
  };
  const boundAction = updateScheduleAction.bind(null, projectId, screen.id);
  const [state, formAction, pending] = useActionState(boundAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="updatedAt" value={screen.updatedAt.toISOString()} />
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">일정</h3>
        <span className="rounded-full bg-neutral-badge-soft px-2 py-0.5 text-xs font-medium text-neutral-badge">
          {screen.scheduleLocked ? "잠김" : "자동배분"}
        </span>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={`scheduleStart-${screen.id}`}>시작일</Label>
          <Input
            id={`scheduleStart-${screen.id}`}
            name="scheduleStart"
            type="date"
            defaultValue={state.values.scheduleStart}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={`scheduleEnd-${screen.id}`}>종료일</Label>
          <Input
            id={`scheduleEnd-${screen.id}`}
            name="scheduleEnd"
            type="date"
            defaultValue={state.values.scheduleEnd}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        일정을 직접 저장하면 이 화면은 &ldquo;잠김&rdquo; 상태가 되어, 전체 일정을 다시 계산해도 바뀌지 않아요.
      </p>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending} className="self-start">
        {pending ? "저장하는 중..." : "일정 저장"}
      </Button>
    </form>
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
  const options = allScreens.filter((s) => s.id !== screenId && s.status !== "quarantined");

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
