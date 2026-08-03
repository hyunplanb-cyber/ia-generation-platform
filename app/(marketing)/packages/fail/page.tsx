import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

// 토스 결제창이 실패·취소되면 여기로 온다: ?code=..&message=..&orderId=..
export default async function PackFailPage({
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
          ? "결제된 금액은 없어요. 언제든 다시 하실 수 있습니다."
          : (message ?? "잠시 후 다시 시도해 주세요.")}
      </p>
      <div className="flex gap-2">
        <Link href="/packages" className={buttonVariants()}>
          AI팩 다시 보기
        </Link>
        <Link href="/free" className={buttonVariants({ variant: "outline" })}>
          무료 샘플 받기
        </Link>
      </div>
    </div>
  );
}
