"use client";

// AI팩 구매 버튼 — 크레딧으로 산다(2026-08-09).
//
// 크몽은 별개 판로다 — 수수료 때문에 값이 다를 수 있고, 승인도 우리 손 밖이다.
// 그래서 우리 사이트는 "구매하기 → 결제 → 바로 다운로드"가 되어야 한다(2026-08-03).
//
// 카드 직결제를 걷어낸 까닭: 지갑이 둘이면 남은 크레딧이 논다.
// 크레딧이 모자라면 값을 알려 주고 충전으로 보낸다 — 그 자리에서 막지 않는다.
//
// 판매를 아직 열지 않았어도(PACKAGE_SALE_OPEN=false) 이미 산 사람의 다운로드는 막지 않는다.
// 막는 건 결제 시작뿐이다.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, Coins } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { buyPackWithCreditsAction } from "./actions";

export function BuyButton({
  packageId,
  planId,
  credits,
  owned,
  saleOpen,
  signedIn,
  emphasis,
}: {
  packageId: string;
  planId: string;
  /** 이 등급을 사는 데 드는 크레딧 — 값은 서버가 정한다(packCredits) */
  credits: number;
  owned: boolean;
  saleOpen: boolean;
  signedIn: boolean;
  /** 강조 색을 쓸 등급인가(프리미엄) */
  emphasis?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const href = `/api/packages/${packageId}/${planId}/download`;

  // 이미 산 사람은 언제나 다시 받을 수 있다.
  if (owned) {
    return (
      <a href={href} className={`${buttonVariants({ size: "lg" })} w-full`}>
        <Download className="size-4" />
        다운로드
      </a>
    );
  }

  if (!saleOpen) {
    return (
      // "판매 준비 중"은 값 자리에서 이미 말한다 — 여기서 또 하면 같은 말이 두 번 보인다.
      <p className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-2.5 text-center text-xs text-muted-foreground">
        결제 수단을 붙이는 중이에요.
      </p>
    );
  }

  async function buy() {
    setError(null);
    if (!signedIn) {
      window.location.href = `/signup?next=/packages/${packageId}%3Fplan=${planId}`;
      return;
    }
    setBusy(true);
    const r = await buyPackWithCreditsAction(packageId, planId);
    if (r.ok) {
      /* 산 즉시 파일로 보낸다 — 「결제하면 바로 다운로드」가 우리 강점이다.
       *
       * ⚠ 여기서 return 하고 끝내면 «로딩이 영영 안 멈춘다».
       *   다운로드 주소로 보내는 것은 «화면을 넘기는 것»이 아니다 — 파일만 내려오고
       *   페이지는 그 자리에 남는다. 그래서 setBusy(false) 를 안 하면 돌아가는 표시가
       *   계속 돈다. 실제로 「파일은 받아졌는데 무한 로딩」으로 나왔다(2026-08-09).
       *
       *   refresh() 는 산 것을 화면에 반영한다 — 버튼이 「다운로드」로 바뀐다.
       *   안 하면 방금 산 사람에게 여전히 「크레딧으로 받기」가 보여서
       *   두 번 사는 줄 알고 놀란다(값은 두 번 안 빠지지만 그건 손님이 모른다). */
      window.location.href = href;
      setBusy(false);
      router.refresh();
      return;
    }
    setBusy(false);
    if (r.reason === "insufficient") {
      /* 여기서 막지 않는다. 얼마가 모자란지 말해 주고 충전으로 보낸다 —
         "크레딧이 부족합니다"만 띄우면 손님은 갈 곳을 스스로 찾아야 한다. */
      const 모자람 = (r.need ?? 0) - (r.balance ?? 0);
      setError(`크레딧이 ${모자람.toLocaleString()}개 모자라요. 충전하고 다시 눌러 주세요.`);
      return;
    }
    setError(r.reason === "closed" ? "아직 판매를 열지 않았어요." : "구매하지 못했어요.");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={buy}
        disabled={busy}
        className={`${buttonVariants({ size: "lg" })} w-full ${
          emphasis ? "" : "bg-foreground hover:bg-foreground/90"
        }`}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Coins className="size-4" />}
        {credits.toLocaleString()}크레딧으로 받기
      </button>
      <p className="text-center text-xs text-muted-foreground">
        누르면 크레딧이 빠지고 바로 다운로드돼요.
      </p>
      {error && <p className="text-center text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}
