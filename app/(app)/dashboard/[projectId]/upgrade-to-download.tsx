import Link from "next/link";
import { Lock } from "lucide-react";

// 무료 사용자가 다운로드하려 할 때, 실제 다운로드 버튼 대신 노출되는 안내.
// (페이월이 켜져 있을 때만 이 자리가 쓰인다.)
//
// 아직 결제 수단이 없으므로 "업그레이드하세요"라고 하면 막다른 길이 된다.
// 대신 준비 중임을 알리고 요금제 화면으로 보내 "열리면 알림"을 받는다.
// ?from=download 는 이 잠금을 거쳐 왔다는 표시로, 신청 기록에 남는다.
export function UpgradeToDownload({ label = "다운로드" }: { label?: string }) {
  return (
    <Link
      href="/dashboard/billing?from=download"
      title="다운로드는 유료 플랜에서 열려요. 아직 준비 중입니다."
      className="inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary-soft px-4 py-2 text-sm font-semibold text-primary-on-soft transition-colors hover:bg-primary-soft/70"
    >
      <Lock className="size-4" />
      {label}
      <span className="text-xs font-normal opacity-70">준비 중 · 알림 받기</span>
    </Link>
  );
}
