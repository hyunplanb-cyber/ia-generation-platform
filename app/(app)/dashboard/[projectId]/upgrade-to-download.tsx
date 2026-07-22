import Link from "next/link";
import { Lock } from "lucide-react";
import { BILLING_OPEN } from "@/lib/flags";

const STYLE =
  "inline-flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-4 py-2 text-sm font-semibold text-muted-foreground";

// 무료 사용자가 다운로드하려 할 때, 실제 다운로드 버튼 대신 노출되는 안내.
// (페이월이 켜져 있을 때만 이 자리가 쓰인다.)
//
// 결제가 준비되기 전에는 누를 곳이 없으므로 링크가 아니라 안내문으로 둔다.
// 요금제 화면이 열리면(BILLING_OPEN) 그때 링크로 바뀐다.
export function UpgradeToDownload({ label = "다운로드" }: { label?: string }) {
  if (!BILLING_OPEN) {
    return (
      <span className={STYLE} title="유료 플랜에서 사용할 수 있어요. 유료 플랜은 준비 중입니다.">
        <Lock className="size-4" />
        {label}
        <span className="text-xs font-normal opacity-80">유료 플랜 준비 중</span>
      </span>
    );
  }

  return (
    <Link
      href="/dashboard/billing?from=download"
      title="다운로드는 유료 플랜에서 사용할 수 있어요."
      className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary-soft px-4 py-2 text-sm font-semibold text-primary-on-soft transition-colors hover:bg-primary-soft/70"
    >
      <Lock className="size-4" />
      {label}
      <span className="text-xs font-normal opacity-70">플랜 보기</span>
    </Link>
  );
}
