/* SNS 검수 상태 — 이름과 색을 «한 곳»에만 둔다. (2026-08-18 사장님 지시)
 *
 * 사장님이 그린 흐름 그대로다:
 *
 *   나(루틴)  영상을 만들어 검수기에 올린다              → waiting   검토대기
 *   사장님    검수하고 「검토 완료」                      → approved  제작중
 *   나        그 내용으로 다시 굽고 검수기에 되올린다     → waiting   (다시 검토대기)
 *             …검수 ↔ 수정을 여러 번 돈다…
 *   사장님    「최종 완료」                               → final     등록 중
 *   나        유튜브(비공개)와 구글 드라이브에 올린다     → published 올림(비공개)
 *
 * ⭐ 여기서 중요한 것 — **바깥으로 나가는 일은 `final` 하나에만 걸려 있다.**
 *   `approved` 는 «다시 굽기»까지다. 되돌리기 어려운 일을 중간 단추에 매달지 않는다.
 */
export type 상태이름 = "waiting" | "approved" | "final" | "published" | "dropped";

export const 상태말: Record<string, { 글: string; 반: string; 풀이: string }> = {
  waiting: {
    글: "검토대기",
    반: "bg-amber-100 text-amber-900",
    풀이: "만들어 올려 뒀습니다. 보시고 고칠 것을 고쳐 주세요.",
  },
  approved: {
    글: "제작중",
    반: "bg-violet-100 text-violet-900",
    풀이: "검토하신 내용으로 다시 만들고 있습니다. 끝나면 검토대기로 돌아옵니다.",
  },
  final: {
    글: "등록 중",
    반: "bg-blue-100 text-blue-900",
    풀이: "최종 완료하신 것을 유튜브와 구글 드라이브에 올리고 있습니다.",
  },
  published: {
    글: "올림 (비공개)",
    반: "bg-emerald-100 text-emerald-900",
    풀이: "유튜브(비공개)와 구글 드라이브에 올렸습니다. 공개 전환은 직접 하시면 됩니다.",
  },
  dropped: {
    글: "버림",
    반: "bg-neutral-200 text-neutral-600",
    풀이: "쓰지 않기로 한 것입니다.",
  },
};

export const 상태보기 = (s: string) => 상태말[s] ?? 상태말.waiting;
