import Link from "next/link";
import { Lock } from "lucide-react";

// 무료 사용자가 다운로드하려 할 때, 실제 다운로드 버튼 대신 노출되는 업그레이드 안내.
// (페이월이 켜져 있을 때만 이 자리가 쓰인다.)
export function UpgradeToDownload({ label = "다운로드" }: { label?: string }) {
  return (
    <Link
      href="/dashboard/billing"
      title="다운로드는 유료 플랜에서 제공돼요"
      className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary-soft px-4 py-2 text-sm font-semibold text-primary-on-soft transition-colors hover:bg-primary-soft/70"
    >
      <Lock className="size-4" />
      {label}
      <span className="text-xs font-normal opacity-70">플랜 업그레이드</span>
    </Link>
  );
}
