import { ShieldCheck, Sparkles } from "lucide-react";
import { DeliverableHeader } from "../deliverable-header";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  await params;

  return (
    <div className="mx-auto flex w-full max-w-[1152px] flex-col gap-6">
      <DeliverableHeader
        icon={ShieldCheck}
        tone="mint"
        title="관리자 페이지"
        description="필요할 때만 만드는 선택 산출물이에요. 관리자용 메뉴 구조와 IA(화면 목록)를 한 벌 더 생성해요."
        downloads={[]}
      />

      <div className="flex flex-col items-start gap-4 rounded-lg border border-border bg-muted/30 px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">관리자 페이지가 필요하세요?</h2>
            <p className="text-sm text-muted-foreground">
              회원·콘텐츠·통계를 관리할 백오피스가 필요하면, 관리자용 메뉴 구조와 화면 목록을 따로
              만들어 드려요.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled
          title="준비 중이에요"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-60"
        >
          <Sparkles className="size-4" />
          관리자 페이지 생성 (준비 중)
        </button>
      </div>
    </div>
  );
}
