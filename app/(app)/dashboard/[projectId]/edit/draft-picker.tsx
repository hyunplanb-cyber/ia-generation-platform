"use client";

// "만들다 만 AI팩이 있어요" — STEP 1 화면 위쪽 버튼.
//
// "AI팩 만들기"를 누를 때마다 빈 프로젝트가 하나씩 생겨서, 들어왔다 나가기를
// 몇 번 하면 목록이 껍데기로 쌓인다. 새로 만드는 흐름을 막지 않으면서,
// 이어서 할 게 있으면 여기서 골라 가게 한다(2026-08-03).

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, History, X } from "lucide-react";
import { DRAFT_KEEP } from "@/lib/drafts";

export interface Draft {
  id: string;
  concept: string;
  /** 어디까지 갔는지 한 줄 */
  label: string;
  step: string;
  /** 26.08.03 */
  date: string;
  /** 누르면 갈 곳 */
  href: string;
}

export function DraftPicker({ drafts }: { drafts: Draft[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (drafts.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary bg-primary-soft/50 px-3.5 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-primary-soft"
      >
        <History className="size-4" />
        만들다 만 AI팩이 있어요
        <span className="rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
          {drafts.length}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="font-bold text-foreground">임시 저장된 AI팩</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  최근 임시저장된 {DRAFT_KEEP}건이 노출됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
              {drafts.map((d) => (
                <li key={d.id}>
                  <Link
                    href={d.href}
                    className="group flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">
                        {d.concept || "제목 없는 AI팩"}
                      </p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {d.date} · {d.label}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {d.step}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                닫고 새로 만들기
              </button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                안 쓸 초안은 <b className="font-semibold">내 프로젝트</b>에서 지울 수 있어요.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
