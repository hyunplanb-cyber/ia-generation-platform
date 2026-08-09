import Link from "next/link";
import { Coins, Info } from "lucide-react";
import { listCredits, getCreditBalance } from "@/application/credit";
import { creditsOpenForMe } from "@/application/billing-gate";
import type { CreditEntry, CreditKind } from "@/domain/credit/credit";

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

const KIND: Record<CreditKind, { label: string; tone: string }> = {
  free: { label: "무료 지급", tone: "bg-success-soft text-success" },
  charge: { label: "충전", tone: "bg-success-soft text-success" },
  spend: { label: "사용", tone: "bg-muted text-muted-foreground" },
  refund: { label: "환불", tone: "bg-warning-soft text-warning" },
};

// 메타에서 원(₩) 금액을 꺼낸다(충전=amountKrw, 환불=refundKrw).
function wonOf(e: CreditEntry): number | null {
  const v = (e.meta?.amountKrw ?? e.meta?.refundKrw) as unknown;
  return typeof v === "number" ? v : null;
}

// 금액 표기 — 충전 +, 사용 -, 환불 기호 없음.
function AmountCell({ e }: { e: CreditEntry }) {
  const won = wonOf(e);
  if (e.kind === "spend") {
    return <span className="font-bold text-foreground">-{Math.abs(e.amount)}크레딧</span>;
  }
  if (e.kind === "refund") {
    return (
      <div className="text-right">
        <span className="font-bold text-warning">{won != null ? `${won.toLocaleString()}원` : `${Math.abs(e.amount)}크레딧`}</span>
        {won != null && (
          <div className="text-xs text-muted-foreground">{Math.abs(e.amount)}크레딧 차감</div>
        )}
      </div>
    );
  }
  // free · charge → 증가(+)
  return (
    <div className="text-right">
      <span className="font-bold text-success">+{e.amount}크레딧</span>
      {won != null && <div className="text-xs text-muted-foreground">{won.toLocaleString()}원 충전</div>}
    </div>
  );
}

export default async function CreditHistoryPage() {
  const [entries, balance] = await Promise.all([listCredits(100), getCreditBalance()]);

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Coins className="size-6 text-primary" /> 크레딧 사용 내역
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            현재 잔액 <span className="font-bold text-primary">{balance.toLocaleString()}</span> 크레딧
          </p>
        </div>
        {(await creditsOpenForMe()) && (
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Coins className="size-4" /> 충전하기
          </Link>
        )}
      </header>

      {/* 내역 */}
      {entries.length === 0 ? (
        <p className="rounded-xl border border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          아직 크레딧 사용 내역이 없어요.
        </p>
      ) : (
        <ul className="flex flex-col overflow-hidden rounded-xl border border-border">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 border-b border-border/60 bg-background px-4 py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${KIND[e.kind].tone}`}>
                  {KIND[e.kind].label}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{e.memo}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.createdAt)}</p>
                </div>
              </div>
              <AmountCell e={e} />
            </li>
          ))}
        </ul>
      )}

      {/* 환불 산정 안내 */}
      <div className="flex gap-3 rounded-xl border border-border bg-muted/20 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">환불은 이렇게 계산돼요</p>
          <p className="mt-1">
            충전 시 금액에 따라 <b className="text-foreground">보너스 크레딧(10~30%)</b>을 더 드리기
            때문에, 환불할 때는 <b className="text-foreground">이미 사용한 크레딧을 정가(1크레딧
            = 100원)로 차감</b>한 뒤 남은 충전 금액을 돌려드려요.
          </p>
          <p className="mt-1">
            예) 10,000원(120크레딧, 보너스 20 포함) 충전 후 30크레딧 사용 → 사용분 30 × 100원 =
            3,000원 차감 → <b className="text-foreground">7,000원 환불</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
