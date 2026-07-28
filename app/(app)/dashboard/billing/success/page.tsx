import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { confirmCharge } from "@/application/charge";

// 토스 승인 API 호출이 있어 여유를 둔다.
export const maxDuration = 60;

// 토스 결제창이 성공하면 여기로 온다: ?paymentKey=..&orderId=..&amount=..
export default async function ChargeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}) {
  const { paymentKey, orderId, amount } = await searchParams;

  let ok = false;
  let message = "";
  let credits = 0;

  if (paymentKey && orderId && amount) {
    const result = await confirmCharge(orderId, paymentKey, Number(amount));
    if (result.ok) {
      ok = true;
      credits = result.credits;
    } else {
      message = result.message;
    }
  } else {
    message = "결제 정보가 올바르지 않아요.";
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-16 text-center">
      {ok ? (
        <>
          <CheckCircle2 className="size-14 text-success" />
          <h1 className="text-xl font-bold text-foreground">충전이 완료됐어요</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-primary">+{credits.toLocaleString()}</span> 크레딧이
            지급됐어요.
          </p>
        </>
      ) : (
        <>
          <XCircle className="size-14 text-danger" />
          <h1 className="text-xl font-bold text-foreground">결제를 완료하지 못했어요</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </>
      )}
      <div className="flex gap-2">
        <Link
          href="/dashboard"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          대시보드로
        </Link>
        {!ok && (
          <Link
            href="/dashboard/billing"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            다시 시도
          </Link>
        )}
      </div>
    </div>
  );
}
