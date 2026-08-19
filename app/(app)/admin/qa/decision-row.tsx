"use client";

/* 판단 한 칸 — 펼쳐 읽고, 「수정완료 / 패스」를 누른다. */
import { useState, useTransition } from "react";
import { 표시하기 } from "./actions";
import type { 판단건 } from "@/lib/qa-decisions";

const 상태빛: Record<string, string> = {
  기다림: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  수정완료: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  패스: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export function DecisionRow({ 것 }: { 것: 판단건 }) {
  const [펼침, 펼치기] = useState(것.상태 === "기다림");
  const [메모, 메모쓰기] = useState(것.메모 ?? "");
  const [보냄, 보내기] = useTransition();

  const 누름 = (상태: "수정완료" | "패스" | "기다림") =>
    보내기(async () => {
      await 표시하기(것.id, 상태, 메모);
    });

  return (
    <li className="rounded-xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${상태빛[것.상태] ?? ""}`}>
          {것.상태}
        </span>
        <button
          type="button"
          onClick={() => 펼치기((v) => !v)}
          className="grow text-left text-[15px] font-bold text-foreground [word-break:keep-all]"
        >
          {것.제목}
        </button>
        <span className="text-xs text-muted-foreground">{것.팩}</span>
      </div>

      {펼침 && (
        <div className="border-t border-border px-4 py-4 text-sm leading-relaxed text-foreground [word-break:keep-all]">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-bold text-muted-foreground">무엇이 문제인가</dt>
              <dd className="mt-1 whitespace-pre-wrap">{것.무엇}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">왜 루틴이 못 고쳤나</dt>
              <dd className="mt-1 whitespace-pre-wrap">{것.왜못고쳤나}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">정해 주셔야 하는 것</dt>
              <dd className="mt-1 whitespace-pre-wrap font-semibold">{것.여쭙는것}</dd>
            </div>
            {것.근거파일 && (
              <div>
                <dt className="text-xs font-bold text-muted-foreground">근거 파일</dt>
                <dd className="mt-1 break-all font-mono text-xs">{것.근거파일}</dd>
              </div>
            )}
          </dl>

          <label className="mt-4 block">
            <span className="text-xs font-bold text-muted-foreground">메모 (안 적어도 됩니다)</span>
            <textarea
              value={메모}
              onChange={(e) => 메모쓰기(e.target.value)}
              rows={2}
              placeholder="어떻게 정하셨는지 한 줄 남기면 다음에 도움이 됩니다"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={보냄}
              onClick={() => 누름("수정완료")}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              수정완료
            </button>
            <button
              type="button"
              disabled={보냄}
              onClick={() => 누름("패스")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-foreground disabled:opacity-50"
            >
              패스 (안 고쳐도 됨)
            </button>
            {것.상태 !== "기다림" && (
              <button
                type="button"
                disabled={보냄}
                onClick={() => 누름("기다림")}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground underline disabled:opacity-50"
              >
                되돌리기
              </button>
            )}
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            <b>수정완료</b> — 다른 채팅에서 고치셨다는 뜻입니다. 다음 검수 루틴이 <b>제대로 고쳐졌는지 검수</b>합니다.
            <br />
            <b>패스</b> — 안 고쳐도 되는 것입니다. 루틴이 다시 올리지 않습니다.
          </p>
        </div>
      )}
    </li>
  );
}
