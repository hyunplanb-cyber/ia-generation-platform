"use client";

import { Check } from "lucide-react";

interface StepDef {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function StepIndicator({
  steps,
  currentStep,
}: {
  steps: StepDef[];
  currentStep: number;
}) {
  return (
    <ol className="flex flex-row gap-4 sm:flex-col sm:gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <li key={step.label} className="flex flex-1 flex-col items-center sm:flex-none sm:flex-row sm:items-stretch">
            <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-center">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${
                  isCompleted
                    ? "bg-success text-primary-foreground"
                    : isCurrent
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`hidden w-px flex-1 border-l-2 border-dashed sm:block ${
                    isCompleted ? "border-success" : "border-border"
                  }`}
                  style={{ minHeight: "28px" }}
                />
              )}
            </div>
            <span
              className={`mt-1.5 text-center text-xs font-medium transition-colors duration-300 sm:mt-0 sm:ml-3 sm:pb-7 sm:text-left sm:text-sm ${
                isCurrent ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
