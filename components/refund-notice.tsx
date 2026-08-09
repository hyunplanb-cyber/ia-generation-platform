"use client";

/* 「받으면 무를 수 없다」를 «받기 전에» 한 번 알린다 — 2026-08-10.
 *
 * 왜 필요한가
 *   디지털 콘텐츠는 다운로드하는 순간 끝이다. 되돌려받을 방법이 없다.
 *   그런데 약관 제7조에만 적어 두면 아무도 안 읽는다 —
 *   나중에 「몰랐다」가 나오고, 그때는 우리도 손님도 방법이 없다.
 *
 *   전자상거래법도 같은 것을 요구한다. 디지털 콘텐츠는 청약철회를 제한할 수 있지만,
 *   **제한한다는 사실을 «구매 전에» 알렸을 때만** 그렇다.
 *   알리지 않았으면 제한이 무효가 되어 전부 환불해야 한다.
 *
 * 왜 체크박스가 아니라 «창»인가
 *   결제 화면 아래쪽 체크박스는 눈으로 넘긴다. 창은 한 번 멈춘다.
 *   멈추는 것이 목적이다 — 귀찮게 하려는 게 아니라 «본 적 있다»를 만들려는 것이다.
 *
 * ⚠ 여는 쪽에서 「받는 행위」를 이 창 뒤로 미뤄야 한다.
 *   창만 띄우고 뒤에서 이미 파일이 나가고 있으면 아무 의미가 없다.
 */

import { useEffect, useRef } from "react";
import { X, AlertTriangle } from "lucide-react";

export function RefundNotice({
  open,
  onAgree,
  onClose,
  /** 동의 버튼에 적을 말 — 「동의하고 받기」 / 「동의하고 구매하기」 */
  agreeLabel = "동의하고 받기",
  /** 무엇을 받는지 한 줄. 창에서 「무엇에 동의하는지」가 보여야 한다. */
  what,
}: {
  open: boolean;
  onAgree: () => void;
  onClose: () => void;
  agreeLabel?: string;
  what?: string;
}) {
  const 동의버튼 = useRef<HTMLButtonElement>(null);

  /* 열리면 동의 버튼에 초점을 준다 — 키보드로만 쓰시는 분이 창 안으로 들어와야 한다.
     ESC 로 닫히게 두는 것도 같은 이유다. 닫는 길이 하나뿐이면 갇힌다. */
  useEffect(() => {
    if (!open) return;
    동의버튼.current?.focus();
    const 키 = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", 키);
    // 창이 떠 있는 동안 뒤가 스크롤되면 어디를 보는지 잃는다.
    const 원래 = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", 키);
      document.body.style.overflow = 원래;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/45 p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="refund-title"
        aria-describedby="refund-body"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <span className="flex size-11 items-center justify-center rounded-full bg-warning-soft text-warning">
          <AlertTriangle className="size-5" />
        </span>

        <h2 id="refund-title" className="mt-4 pr-8 text-lg font-bold leading-snug text-foreground">
          받으신 뒤에는 교환·환불이 되지 않습니다
        </h2>

        <p id="refund-body" className="mt-3 leading-relaxed text-muted-foreground">
          디지털 콘텐츠 특성상 <b className="text-foreground">구매·다운로드 후 교환 및 반품(환불)이
          불가</b>합니다. 파일을 한 번 받으시면 돌려드릴 방법이 없습니다.
        </p>

        {what && (
          <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium text-foreground">
            {what}
          </p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          내용이 맞는지는 <b className="text-foreground">상세 페이지의 미리보기</b>에서
          받기 전에 확인하실 수 있습니다.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            ref={동의버튼}
            type="button"
            onClick={onAgree}
            className="h-12 w-full rounded-xl bg-primary text-[15px] font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {agreeLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            더 살펴볼게요
          </button>
        </div>
      </div>
    </div>
  );
}
