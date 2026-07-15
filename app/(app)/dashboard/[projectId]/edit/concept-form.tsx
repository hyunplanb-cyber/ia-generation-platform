"use client";

import { useActionState, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectAction, type UpdateProjectState } from "./actions";
import { InputHint } from "../input-hint";
import type { DeviceMode, Project } from "@/domain/project/project";

const initialState: UpdateProjectState = { error: null, saved: false };

const DEVICE_OPTIONS: { value: DeviceMode; label: string; desc: string }[] = [
  { value: "responsive", label: "반응형", desc: "하나의 화면이 PC·모바일에 맞춰 자동으로 조정돼요." },
  { value: "pc", label: "PC 웹", desc: "데스크톱 화면 위주로 만들어요." },
  { value: "mobile", label: "모바일 웹(앱)", desc: "모바일 화면 위주로 만들어요." },
];

export function ConceptForm({ project, hasScreens }: { project: Project; hasScreens: boolean }) {
  const boundAction = updateProjectAction.bind(null, project.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [overallStart, setOverallStart] = useState(project.overallStart);
  const [overallEnd, setOverallEnd] = useState(project.overallEnd);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    const scheduleChanged = overallStart !== project.overallStart || overallEnd !== project.overallEnd;
    if (
      hasScreens &&
      scheduleChanged &&
      !confirm("수동으로 조정한 화면은 유지되고, 자동배분된 화면만 새로 계산됩니다. 계속할까요?")
    ) {
      e.preventDefault();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold text-foreground">컨셉 입력</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          어떤 사이트를 만들지, 어떤 기기에 맞출지, 언제까지 할지를 알려주세요. AI가 이 내용을 바탕으로
          산출물을 만들어요.
        </p>
      </div>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6 shadow-sm"
      >
        {/* 다른 페이지 필드는 값 보존을 위해 숨겨서 함께 제출 */}
        <input type="hidden" name="menuDraft" value={project.menuDraft ?? ""} />
        <input type="hidden" name="designConcept" value={project.designConcept ?? ""} />

        <div className="flex flex-col gap-2">
          <Label>디바이스 대응 방식</Label>
          <InputHint>
            어떤 기기에 맞출지 정하면, 화면ID와 화면 구성이 그 기기 기준으로 생성돼요.
          </InputHint>
          <div className="mt-1 flex flex-col gap-2">
            {DEVICE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary-soft/40"
              >
                <input
                  type="radio"
                  name="deviceMode"
                  value={opt.value}
                  defaultChecked={project.deviceMode === opt.value}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium text-foreground">{opt.label}</span>
                  <span className="block text-xs text-muted-foreground">{opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="concept">컨셉/설명</Label>
          <InputHint>
            무엇을 만드는지 구체적으로 적을수록 AI가 더 정확한 메뉴·화면을 제안해요.
          </InputHint>
          <Textarea id="concept" name="concept" rows={5} defaultValue={project.concept} required />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>전체 일정</Label>
          <InputHint>
            시작·종료일을 넣으면 생성된 화면마다 제작 일정이 자동으로 나뉘고 WBS로 정리돼요.
          </InputHint>
          <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="overallStart" className="text-xs text-muted-foreground">
                전체 시작일
              </Label>
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
              <Label htmlFor="overallEnd" className="text-xs text-muted-foreground">
                전체 종료일
              </Label>
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
        </div>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중..." : "저장하고 계속"}
          </Button>
          {state.saved && !state.error && (
            <span className="flex items-center gap-1 text-sm text-primary">
              <Check className="size-4" /> 저장됐어요
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
