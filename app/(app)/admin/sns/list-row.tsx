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
    ep: string; slotLabel: string; checkResult: string; watcherError: string; youtubeVerticalId: string | null;
  };
  칸수: number;
}) {
  const 상태 = 상태보기(편.status, 편.watcherError);
  const [물음, set물음] = useState(false);
  const [알림, set알림] = useState("");
  const [도는중, 시작] = useTransition();

  const 지우기 = () =>
    시작(async () => {
      const r = await deleteContentAction(편.id);
      if (!r.ok) { set알림(r.왜); set물음(false); }
      /* 지워졌으면 revalidate 로 이 줄이 사라진다 — 따로 할 일이 없다. */
    });

  /* ⏭ 로 시작하는 줄은 «사유를 적고 넘어간 것»이라 걸림이 아니다 (2026-08-18).
     세는 곳이 세 군데(검수목록·이 화면·재검사)라 규칙을 같은 모양으로 둔다. */
  const 검사줄 = (편.checkResult || "").split(String.fromCharCode(10)).filter(Boolean);
  const 막는것 = 검사줄.filter((l) => !l.startsWith("⏭")).length;
  const 넘어간것 = 검사줄.length - 막는것;

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
          {막는것 > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-900">
              검사 {막는것}건
            </span>
          )}
          {넘어간것 > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              넘어감 {넘어간것}
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
        {/* ⛔ 지킴이가 막혔으면 «남게» 보여 준다 (2026-08-25).
            상태만 「등록 중」으로 두면 아무 일도 안 일어나는데 일어나는 중인 것처럼 보인다.
            사장님이 그것 때문에 「멈춘 것 같다」고 하셨다. */}
        {편.watcherError && (
          <p className="mt-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-900 [word-break:keep-all]">
            <b>⛔ 지킴이가 여기서 막혔습니다 — 그래서 안 올라갑니다.</b>
            <br />
            {편.watcherError}
          </p>
        )}
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
