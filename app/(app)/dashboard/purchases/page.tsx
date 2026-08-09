import type { Metadata } from "next";
import Link from "next/link";
import { Download, Package, ShoppingBag } from "lucide-react";
import { listPurchasedPacks } from "@/application/pack-order";
import { formatKrw } from "@/lib/packages";
import { 날짜 } from "@/lib/when";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "내 AI팩" };

// 시간대를 못 박은 한 벌을 쓴다 — 직접 포맷하면 서버(UTC)에서 9시간 밀린다(lib/when.ts).
function formatDate(d: Date | null): string {
  return d ? 날짜(d) : "";
}

// 산 AI팩을 다시 받는 곳.
//
// 한 번 사면 계속 받을 수 있어야 한다 — 메일함에서 링크를 찾게 만들면
// 몇 달 뒤에 반드시 문의가 들어온다(2026-08-03).
export default async function PurchasesPage() {
  const packs = await listPurchasedPacks();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">내 AI팩</h1>
        <p className="text-sm text-muted-foreground">
          구매하신 AI팩이에요. 언제든 다시 받으실 수 있습니다.
        </p>
      </div>

      {packs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary-on-soft">
            <Package className="size-5" />
          </span>
          <p className="font-semibold text-foreground">아직 구매하신 AI팩이 없어요</p>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            업종별로 화면 37~144개 규모의 기획 산출물 한 벌입니다. 먼저 무료 샘플로 어떤 문서인지
            확인해 보셔도 좋아요.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/packages" className={buttonVariants()}>
              <ShoppingBag className="size-4" />
              AI팩 보기
            </Link>
            <Link href="/free" className={buttonVariants({ variant: "outline" })}>
              무료 샘플 받기
            </Link>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {packs.map((p) => (
            <li
              key={`${p.packageId}-${p.planId}`}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Package className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">
                  {p.title}{" "}
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {p.planName}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatDate(p.paidAt)} · {formatKrw(p.amountKrw)}
                </p>
              </div>
              <a href={p.href} className={buttonVariants({ size: "sm" })}>
                <Download className="size-4" />
                다운로드
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
