/* 검수 판단 목록 — 루틴이 「근거가 없어 못 고친 것」을 여기 올린다. (2026-08-19 사장님 지시)
 *
 * 「루틴이 판단 필요로 수정하지 못해서 남긴 내용이 나오도록 해줘. SNS 검수기처럼 화면을
 *   하나 만들어 줘도 좋아. 그 리스트에는 내가 수정완료/패스로 표시할 수 있게 해 두고」
 *
 * 흐름
 *   ① 검수 루틴이 못 고친 것을 올린다 (기다림)
 *   ② 사장님이 여기서 보고, 다른 채팅에서 고친 뒤 「수정완료」 또는 「패스」
 *   ③ 다음 루틴이 「수정완료」 건을 **검수 항목에 넣어 제대로 고쳐졌는지 본다**
 *
 * SNS 검수기와 같은 자리(`/admin`)에 두고 `isOwner()` 로 막는다 — 폰에서도 볼 수 있다.
 */
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";
import { 판단읽기, 차례대로 } from "@/lib/qa-decisions";
import { DecisionRow } from "./decision-row";

export const metadata = { title: "검수 판단 — 카페인컬러" };
/* 루틴이 파일을 고치면 바로 보여야 한다 — 캐시로 굳히지 않는다. */
export const dynamic = "force-dynamic";

export default async function 검수판단페이지() {
  const session = await getSession();
  /* 주인이 아니면 «없는 페이지»로 둔다 — SNS 검수기와 같은 규칙. */
  if (!isOwner(session?.user.email)) notFound();

  const 목록 = await 판단읽기();
  const 것들 = 차례대로(목록.건);
  const 기다림 = 것들.filter((x) => x.상태 === "기다림");
  const 처리됨 = 것들.filter((x) => x.상태 !== "기다림");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">검수 판단</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
        검수 루틴이 <b>근거가 없어 못 고친 것</b>입니다. 지어내서 고치면 팩 전체의 믿음이 깎이니
        여기로 올려 둡니다.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed text-foreground [word-break:keep-all]">
        <b>어떻게 쓰나</b>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>아래를 보고 <b>다른 채팅에서 고치라고 지시</b>하십니다</li>
          <li>고치셨으면 <b>수정완료</b>, 안 고쳐도 되면 <b>패스</b>를 누르십니다</li>
          <li>
            다음 검수 루틴이 <b>수정완료 건을 검수 항목에 넣어</b> 제대로 고쳐졌는지 봅니다
            (넣고 나면 이 목록에서 사라집니다)
          </li>
        </ol>
      </div>

      {기다림.length === 0 && 처리됨.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          기다리는 것이 없습니다.
        </p>
      ) : (
        <>
          <h2 className="mt-8 text-sm font-bold text-foreground">
            기다리는 것 <span className="text-muted-foreground">{기다림.length}건</span>
          </h2>
          {기다림.length === 0 ? (
            <p className="mt-2 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              모두 처리하셨습니다.
            </p>
          ) : (
            <ul className="mt-2 space-y-3">
              {기다림.map((것) => (
                <DecisionRow key={것.id} 것={것} />
              ))}
            </ul>
          )}

          {처리됨.length > 0 && (
            <>
              <h2 className="mt-10 text-sm font-bold text-foreground">
                처리하신 것 <span className="text-muted-foreground">{처리됨.length}건</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground [word-break:keep-all]">
                <b>수정완료</b>는 다음 루틴이 검수한 뒤 사라지고, <b>패스</b>는 그대로 남습니다.
              </p>
              <ul className="mt-2 space-y-3">
                {처리됨.map((것) => (
                  <DecisionRow key={것.id} 것={것} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
