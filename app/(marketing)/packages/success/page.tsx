import Link from "next/link";
import { CheckCircle2, Download, XCircle } from "lucide-react";
import { confirmPackOrder } from "@/application/pack-order";
import { PACKAGES, PLAN_NAMES, type PlanId } from "@/lib/packages";
import { buttonVariants } from "@/components/ui/button";

// 토스 승인 API 호출이 있어 여유를 둔다.
export const maxDuration = 60;

// 토스 결제창이 성공하면 여기로 온다: ?paymentKey=..&orderId=..&amount=..
//
// 결제가 끝나면 곧바로 파일을 받을 수 있어야 한다 — 그게 크몽이 아니라 우리
// 사이트에서 파는 이유다(2026-08-03). 메일을 기다리게 하지 않는다.
export default async function PackSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentKey?: string; orderId?: string; amount?: string }>;
}) {
  const { paymentKey, orderId, amount } = await searchParams;

  let href: string | null = null;
  let label = "";
  let message = "결제 정보가 올바르지 않아요.";

  if (paymentKey && orderId && amount) {
    const result = await confirmPackOrder(orderId, paymentKey, Number(amount));
    if (result.ok) {
      const pkg = PACKAGES.find((p) => p.id === result.packageId);
      href = `/api/packages/${result.packageId}/${result.planId}/download`;
      label = `${pkg?.title ?? "AI팩"} ${PLAN_NAMES[result.planId as PlanId] ?? ""}`;
    } else {
      message = result.message;
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-6 py-16 text-center">
      {href ? (
        <>
          <CheckCircle2 className="size-14 text-success" />
          <h1 className="text-xl font-bold text-foreground">구매가 완료됐어요</h1>
          <p className="text-sm text-muted-foreground">{label}</p>
          <a href={href} className={buttonVariants({ size: "lg" })}>
            <Download className="size-4" />
            지금 다운로드
          </a>
          <p className="text-xs text-muted-foreground">
            내려받은 파일은 <b className="font-semibold">내 AI팩</b>에서 언제든 다시 받을 수 있어요.
          </p>
          <Link
            href="/dashboard/purchases"
            className="text-sm font-semibold text-primary hover:underline"
          >
            내 AI팩으로 가기
          </Link>
        </>
      ) : (
        <>
          <XCircle className="size-14 text-danger" />
          <h1 className="text-xl font-bold text-foreground">결제를 완료하지 못했어요</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
          <Link href="/packages" className={buttonVariants({ variant: "outline" })}>
            AI팩 목록으로
          </Link>
        </>
      )}
    </div>
  );
}
