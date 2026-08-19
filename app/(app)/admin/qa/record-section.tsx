/* 검수 기록 — 회차별로 무엇을 보고 무엇을 고쳤는지. (2026-08-19 사장님 지시)
 *
 * 「이건 검수 결과니까 시트에 올려주거나, 우리 /admin/QA 어딘가에 영역을 만들어서
 *   결과를 넣어줘도 되고」 → 화면 쪽을 골랐다. 판단하러 들어오시는 자리가 여기라
 *   「이번에 뭘 고쳤나」와 「내가 정할 것」이 한 화면에 붙는 게 낫다.
 *
 * 회차 하나가 펼침 하나다. 맨 위 회차만 펼쳐 둔다 — 지난 것까지 다 펼치면 길기만 하다.
 */
import type { 검수회차, 검수줄 } from "@/lib/qa-record";

const 갈래빛: Record<string, string> = {
  고침: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  해당없음: "bg-muted text-muted-foreground",
  마무리에넘김: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  못고침: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  알수없음: "bg-muted text-muted-foreground",
};

/** 사장님이 읽으실 말 — 「해당없음」은 그대로 두면 무슨 뜻인지 안 보인다. */
const 갈래말: Record<string, string> = {
  고침: "고쳤다",
  해당없음: "볼 것 없었다",
  마무리에넘김: "마무리가 처리",
  못고침: "못 고쳤다",
  알수없음: "모양이 틀림",
};

function 줄카드({ 줄 }: { 줄: 검수줄 }) {
  return (
    <li className="rounded-lg border border-border px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${갈래빛[줄.갈래]}`}>
          {갈래말[줄.갈래]}
        </span>
        <span className="text-xs font-bold text-foreground [word-break:keep-all]">{줄.팩}</span>
        <span className="text-[11px] text-muted-foreground [word-break:keep-all]">{줄.항목}</span>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-foreground [word-break:keep-all]">
        {줄.무엇}
      </p>
      {줄.근거파일 && 줄.근거파일 !== "해당 없음(정상)" && (
        <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{줄.근거파일}</p>
      )}
    </li>
  );
}

export function RecordSection({ 회차 }: { 회차: 검수회차[] }) {
  if (회차.length === 0) {
    return (
      <>
        <h2 className="mt-12 text-sm font-bold text-foreground">검수 기록</h2>
        <p className="mt-2 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          아직 검수가 돌지 않았습니다.
        </p>
      </>
    );
  }

  return (
    <>
      <h2 className="mt-12 text-sm font-bold text-foreground">
        검수 기록 <span className="text-muted-foreground">{회차.length}회차</span>
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground [word-break:keep-all]">
        화요일 새벽에 루틴 넷이 팩을 눌러 보고 고친 것입니다. <b>고쳤다</b>가 있어도{" "}
        <b>나간 팩</b>에 없으면 손님에게는 아직 안 간 것입니다.
      </p>

      <div className="mt-3 space-y-3">
        {회차.map((회, i) => (
          <details
            key={회.날짜}
            open={i === 0}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <summary className="cursor-pointer list-none">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-foreground">{회.날짜}</span>
                <span className="text-xs text-muted-foreground">{회.줄.length}줄</span>
                {(["고침", "못고침", "마무리에넘김"] as const).map((g) =>
                  회.셈[g] ? (
                    <span
                      key={g}
                      className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${갈래빛[g]}`}
                    >
                      {갈래말[g]} {회.셈[g]}
                    </span>
                  ) : null,
                )}
                {회.나간팩.length > 0 && (
                  <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[11px] font-bold text-sky-700 dark:text-sky-400">
                    나간 팩 {회.나간팩.length}칸
                  </span>
                )}
              </span>
            </summary>

            {회.나간팩.length > 0 && (
              <p className="mt-2.5 rounded-lg bg-muted/50 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground [word-break:keep-all]">
                <b className="text-foreground">손님에게 나간 팩</b> — {회.나간팩.join(" · ")}
              </p>
            )}

            <ul className="mt-2.5 space-y-2">
              {회.줄.map((줄, n) => (
                <줄카드 key={`${회.날짜}-${n}`} 줄={줄} />
              ))}
            </ul>
          </details>
        ))}
      </div>
    </>
  );
}
