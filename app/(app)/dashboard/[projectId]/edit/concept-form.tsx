"use client";

import { useActionState, useState, type FormEvent } from "react";
import {
  Network,
  LayoutList,
  FileText,
  Workflow,
  CalendarRange,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveConceptAndContinueAction, type UpdateProjectState } from "./actions";
import { FormSection } from "../form-shell";
import type { DeviceMode, Project } from "@/domain/project/project";

const initialState: UpdateProjectState = { error: null, saved: false };

const DEVICE_OPTIONS: { value: DeviceMode; label: string; desc: string }[] = [
  { value: "responsive", label: "반응형", desc: "하나의 화면이 PC·모바일에 맞춰 자동으로 조정돼요." },
  { value: "pc", label: "PC 웹", desc: "데스크톱 화면 위주로 만들어요." },
  { value: "mobile", label: "모바일 웹(앱)", desc: "모바일 화면 위주로 만들어요." },
];

// 이 입력으로 만들어지는 산출물 — 오른쪽 패널에서 "결과물 미리보기"로 동기부여.
const DELIVERABLES = [
  { icon: Network, label: "메뉴 구조" },
  { icon: LayoutList, label: "IA · 화면 목록+화면별 프롬프트" },
  { icon: FileText, label: "기능정의서" },
  { icon: Workflow, label: "FLOW·흐름도" },
  { icon: CalendarRange, label: "WBS 일정" },
];

export function ConceptForm({ project, hasScreens }: { project: Project; hasScreens: boolean }) {
  const boundAction = saveConceptAndContinueAction.bind(null, project.id);
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
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground">
        어떤 사이트를 만들지, 어떤 기기에 맞출지, 언제까지 할지를 알려주세요. AI가 이 내용을 바탕으로
        산출물을 만들어요.
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <form action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* 다른 페이지 필드는 값 보존을 위해 숨겨서 함께 제출 */}
          <input type="hidden" name="menuDraft" value={project.menuDraft ?? ""} />
          <input type="hidden" name="designConcept" value={project.designConcept ?? ""} />
          {/* 일정 변경 감지용 원래 값(서버가 재계산 여부를 DB 재조회 없이 판단) */}
          <input type="hidden" name="origStart" value={project.overallStart} />
          <input type="hidden" name="origEnd" value={project.overallEnd} />

          <FormSection
            title="디바이스 대응 방식"
            hint="어떤 기기에 맞출지 정하면, 화면ID와 화면 구성이 그 기기 기준으로 생성돼요."
          >
            <div className="grid gap-2.5 sm:grid-cols-3">
              {DEVICE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="group flex cursor-pointer flex-col gap-1 rounded-lg border border-border p-3 text-sm transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary-soft/40"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{opt.label}</span>
                    <input
                      type="radio"
                      name="deviceMode"
                      value={opt.value}
                      defaultChecked={project.deviceMode === opt.value}
                      className="accent-primary"
                    />
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">{opt.desc}</span>
                </label>
              ))}
            </div>
          </FormSection>

          <FormSection
            title="컨셉 / 설명"
            hint="무엇을 만드는지 구체적으로 적을수록 AI가 더 정확한 메뉴·화면을 제안해요."
          >
            <Textarea
              id="concept"
              name="concept"
              rows={5}
              defaultValue={project.concept}
              placeholder="예) 20~30대 여성을 위한 온라인 클래스 플랫폼. 클래스 탐색·수강·커뮤니티 기능이 필요해요."
              required
            />
          </FormSection>

          <FormSection
            title="전체 일정"
            hint="시작·종료일을 넣으면 생성된 화면마다 제작 일정이 자동으로 나뉘고 WBS로 정리돼요."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </FormSection>

          {state.error && <p className="text-sm text-danger">{state.error}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "저장 중..." : "저장하고 계속"}
            </Button>
          </div>
        </form>

        {/* 결과물 미리보기 패널 */}
        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-xl border border-border bg-muted/20 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">이 입력으로 만들어져요</h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              컨셉만 채우면 아래 5가지 산출물이 자동으로 완성돼요.
            </p>
            <ul className="mt-4 flex flex-col gap-1.5">
              {DELIVERABLES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-2.5 rounded-lg bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                >
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary-soft text-primary-on-soft">
                    <Icon className="size-3.5" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
