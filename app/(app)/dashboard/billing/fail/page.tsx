import Link from "next/link";
import { XCircle } from "lucide-react";

// 토스 결제창이 실패·취소되면 여기로 온다: ?code=..&message=..&orderId=..
export default async function ChargeFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; message?: string }>;
}) {
  const { code, message } = await searchParams;
  const canceled = code === "USER_CANCEL" || /취소|cancel/i.test(message ?? "");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-16 text-center">
      <XCircle className="size-14 text-muted-foreground" />
      <h1 className="text-xl font-bold text-foreground">
        {canceled ? "결제를 취소했어요" : "결제가 완료되지 않았어요"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {canceled
          ? "언제든 다시 충전할 수 있어요. 크레딧은 차감되지 않았어요."
          : (message ?? "잠시 후 다시 시도해 주세요.")}
      </p>
      <div className="flex gap-2">
        <Link
          href="/dashboard/billing"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          다시 충전하기
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
        >
          대시보드로
        </Link>
      </div>
    </div>
  );
}
