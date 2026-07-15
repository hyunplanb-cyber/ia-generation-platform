import { Lightbulb } from "lucide-react";

export function InputHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
      <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
      <span>{children}</span>
    </p>
  );
}
