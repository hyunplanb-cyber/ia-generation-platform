"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { useActionState } from "react";
import {
  FileText,
  Upload,
  ListChecks,
  Palette,
  CalendarClock,
  Sparkles,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createProjectAction,
  extractPdfTextAction,
  type CreateProjectState,
} from "./actions";
import { StepIndicator } from "./step-indicator";

const initialState: CreateProjectState = { error: null };

const STEP_LABELS = ["컨셉/설명", "메뉴 구성", "디자인 컨셉", "전체 일정"];

const STEP_WASH_CLASSES = [
  { bg: "bg-pastel-mint", fg: "text-pastel-mint-foreground" },
  { bg: "bg-pastel-lavender", fg: "text-pastel-lavender-foreground" },
  { bg: "bg-pastel-yellow", fg: "text-pastel-yellow-foreground" },
  { bg: "bg-primary-soft", fg: "text-primary-on-soft" },
];

export function NewProjectWizard() {
  const [step, setStep] = useState(0);
  const [state, formAction, pending] = useActionState(createProjectAction, initialState);
  const [, startSubmitTransition] = useTransition();

  const [concept, setConcept] = useState("");
  const [menuDraft, setMenuDraft] = useState("");
  const [designConcept, setDesignConcept] = useState("");
  const [overallStart, setOverallStart] = useState("");
  const [overallEnd, setOverallEnd] = useState("");

  const [stepError, setStepError] = useState<string | null>(null);
  const [pdfPending, setPdfPending] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function goNext() {
    if (step === 0 && !concept.trim()) {
      setStepError("컨셉/설명을 입력해 주세요.");
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handlePdfChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setPdfPending(true);
    setPdfMessage(null);
    const fd = new FormData();
    fd.set("file", file);
    const result = await extractPdfTextAction(fd);
    setPdfPending(false);

    if (result.error) {
      setPdfMessage(result.error);
      return;
    }
    if (result.text) {
      setConcept((prev) => (prev.trim() ? `${prev.trim()}\n\n${result.text}` : result.text!));
      setPdfMessage("PDF에서 텍스트를 가져왔어요.");
    }
  }

  function handleSubmit() {
    if (!overallStart || !overallEnd) {
      setStepError("전체 시작일과 종료일을 입력해 주세요.");
      return;
    }
    const fd = new FormData();
    fd.set("concept", concept);
    fd.set("menuDraft", menuDraft);
    fd.set("designConcept", designConcept);
    fd.set("overallStart", overallStart);
    fd.set("overallEnd", overallEnd);
    startSubmitTransition(() => {
      formAction(fd);
    });
  }

  const wash = STEP_WASH_CLASSES[step];

  return (
    <div className="bg-linear-to-br from-pastel-lavender/25 via-background to-pastel-mint/25 py-16">
      <div className="mx-auto flex max-w-xl flex-col gap-8 px-6">
        <div>
          <h1 className="mb-6 text-2xl font-bold text-foreground">새 프로젝트 만들기</h1>
          <StepIndicator labels={STEP_LABELS} currentStep={step} />
        </div>

        <div
          key={step}
          className="animate-in fade-in-0 slide-in-from-right-4 flex flex-col gap-5 rounded-xl border border-border bg-background p-6 shadow-sm duration-300 sm:p-8"
        >
        {step === 0 && (
          <>
            <StepHeader
              icon={FileText}
              title="어떤 사이트인가요?"
              description="사이트 컨셉과 목적을 설명해 주세요. 기획서나 소개 자료가 있다면 PDF로 올려서 텍스트를 자동으로 채울 수 있어요."
              wash={wash}
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="concept">컨셉/설명</Label>
              <Textarea
                id="concept"
                rows={6}
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={pdfPending}
                className="self-start"
              >
                {pdfPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {pdfPending ? "읽는 중..." : "PDF에서 가져오기"}
              </Button>
              {pdfMessage && <p className="text-sm text-muted-foreground">{pdfMessage}</p>}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <StepHeader
              icon={ListChecks}
              title="어떤 메뉴가 필요한가요? (선택)"
              description="지금 몰라도 괜찮아요 — 나중에 메뉴 관리에서 추가할 수 있어요. 대략적인 메뉴 구성을 적어두면 다음 단계에 도움이 돼요."
              wash={wash}
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="menuDraft">메뉴 구성 (선택)</Label>
              <Textarea
                id="menuDraft"
                rows={6}
                placeholder={"예)\n홈\n소개\n상품 목록\n문의하기"}
                value={menuDraft}
                onChange={(e) => setMenuDraft(e.target.value)}
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader
              icon={Palette}
              title="원하는 분위기가 있나요? (선택)"
              description="글로 설명해 주세요. 참고 이미지를 올리면 AI가 무드를 분석해 제작 프롬프트로 바꿔드리는 기능은 곧 추가될 예정이에요."
              wash={wash}
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="designConcept">디자인 컨셉 (선택)</Label>
              <Textarea
                id="designConcept"
                rows={5}
                placeholder="예) 미니멀하고 차분한 톤, 파스텔 컬러, 신뢰감 있는 느낌"
                value={designConcept}
                onChange={(e) => setDesignConcept(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-5 text-center">
              <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary-on-soft">
                <Sparkles className="size-5" />
              </span>
              <p className="text-sm font-medium text-foreground">
                이미지로 무드 전달하기
              </p>
              <p className="text-sm text-muted-foreground">
                참고 이미지를 올리면 AI가 분위기를 읽어 제작 프롬프트로 바꿔드려요. 준비 중이에요 — 곧 만나보실 수 있어요.
              </p>
              <Button type="button" variant="outline" size="sm" disabled className="mx-auto mt-1">
                <Upload className="size-4" />
                이미지 업로드 (준비 중)
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader
              icon={CalendarClock}
              title="전체 일정을 알려주세요"
              description="시작일과 종료일을 입력하면 이후 화면별 일정이 자동으로 나뉘어요."
              wash={wash}
            />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="overallStart">전체 시작일</Label>
              <Input
                id="overallStart"
                type="date"
                value={overallStart}
                onChange={(e) => setOverallStart(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="overallEnd">전체 종료일</Label>
              <Input
                id="overallEnd"
                type="date"
                value={overallEnd}
                onChange={(e) => setOverallEnd(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {(stepError || state.error) && (
          <p className="text-sm text-danger">{stepError ?? state.error}</p>
        )}
        </div>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
            <ArrowLeft className="size-4" />
            이전
          </Button>
          {step < STEP_LABELS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              다음
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={pending}>
              {pending ? "만드는 중..." : "프로젝트 만들기"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  icon: Icon,
  title,
  description,
  wash,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
  wash: { bg: string; fg: string };
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className={`flex size-11 items-center justify-center rounded-full ${wash.bg} ${wash.fg}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
