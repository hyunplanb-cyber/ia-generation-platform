import { Download } from "lucide-react";

export function DeliverableHeader({
  title,
  description,
  downloadLabel,
}: {
  title: string;
  description: string;
  downloadLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        disabled
        title="다운로드 기능은 준비 중이에요"
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground opacity-70"
      >
        <Download className="size-4" />
        {downloadLabel} (준비 중)
      </button>
    </div>
  );
}

export function DeliverableEmpty({ projectId }: { projectId: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground">
        아직 생성된 산출물이 없어요.{" "}
        <a
          href={`/dashboard/${projectId}/menus`}
          className="font-medium text-primary underline"
        >
          메뉴 관리
        </a>
        에서 <b className="font-semibold text-foreground">[컨셉 분석해서 자동 생성]</b>을 실행하면
        여기에 채워져요.
      </p>
    </div>
  );
}
