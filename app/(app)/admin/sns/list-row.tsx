"use client";

/* 목록 한 줄 — 누르면 검수로 들어가고, 오른쪽 끝에서 지울 수 있다. (2026-08-18 사장님 지시)
 *
 * ⚠ 지우는 것은 «되돌릴 수 없다». 그래서 두 번 묻는다 —
 *   한 번 누르면 「정말 지울까요?」로 바뀌고, 그때 다시 눌러야 지워진다.
 *   확인 창(confirm)을 안 쓰는 까닭은 폰에서 잘 안 뜨는 자리가 있어서다.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteContentAction } from "./actions";
import { 상태보기 } from "@/lib/sns-status";

export function SnsListRow({
  편,
  칸수,
}: {
  편: {
    id: string; batch: string; slug: string; status: string; verticalTitle: string;
    ep: string; slotLabel: string; checkResult: string; youtubeVerticalId: string | null;
  };
  칸수: number;
}) {
  const 상태 = 상태보기(편.status);
  const [물음, set물음] = useState(false);
  const [알림, set알림] = useState("");
  const [도는중, 시작] = useTransition();

  const 지우기 = () =>
    시작(async () => {
      const r = await deleteContentAction(편.id);
      if (!r.ok) { set알림(r.왜); set물음(false); }
      /* 지워졌으면 revalidate 로 이 줄이 사라진다 — 따로 할 일이 없다. */
    });

  return (
    <li className="relative">
      <Link
        href={`/admin/sns/${편.id}`}
        className="block rounded-xl border border-border bg-surface p-5 pr-28 transition hover:border-primary hover:shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${상태.반}`}>{상태.글}</span>
          <span className="font-mono text-xs text-muted-foreground">{편.batch}</span>
          {편.slotLabel && <span className="text-xs font-semibold text-primary-on-soft">{편.slotLabel}</span>}
          {편.checkResult && (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-900">
              검사 {편.checkResult.split("\n").length}건
            </span>
          )}
        </div>
        <p className="mt-2 text-lg font-bold text-foreground [word-break:keep-all]">
          {편.verticalTitle.replaceAll("|", " ").replace(/<[^>]*>/g, "")}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {편.ep && <span>{편.ep} · </span>}
          자막 {칸수}칸
          {편.youtubeVerticalId && <span> · 유튜브 올림</span>}
        </p>
        <p className="mt-1 text-xs text-muted-foreground [word-break:keep-all]">{상태.풀이}</p>
      </Link>

      {/* 지우기 — 링크 위에 얹되 누르는 자리가 겹치지 않게 오른쪽 끝에 둔다 */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {물음 ? (
          <>
            <button
              type="button"
              onClick={지우기}
              disabled={도는중}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {도는중 ? "지우는 중…" : "정말 지웁니다"}
            </button>
            <button
              type="button"
              onClick={() => set물음(false)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground"
            >
              그만
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => set물음(true)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-rose-300 hover:text-rose-700"
          >
            지우기
          </button>
        )}
      </div>
      {알림 && <p className="mt-1 px-5 text-xs font-semibold text-rose-700">{알림}</p>}
    </li>
  );
}
