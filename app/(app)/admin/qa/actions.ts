"use server";

/* 검수 판단 — 사장님이 「수정완료 / 패스」를 누르면 파일에 남긴다. (2026-08-19 사장님 지시)
 *
 * 「그 리스트에는 내가 수정완료/패스로 표시할 수 있게 해 두고,
 *   그럼 그 결과 값은 판단 목록에 표시됨.」
 *
 * ⚠ 여기서 팩을 고치거나 굽지 않는다. 표시만 남긴다 —
 *   실제 수정은 사장님이 «다른 채팅»에서 하시고, 검수는 «다음 루틴»이 한다.
 */
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";
import { 상태바꾸기, type 판단상태 } from "@/lib/qa-decisions";

async function 주인확인() {
  const session = await getSession();
  if (!isOwner(session?.user.email)) throw new Error("이 화면은 사이트 주인만 볼 수 있습니다.");
}

export async function 표시하기(id: string, 상태: 판단상태, 메모?: string) {
  await 주인확인();
  if (상태 !== "수정완료" && 상태 !== "패스" && 상태 !== "기다림") {
    throw new Error(`알 수 없는 상태: ${상태}`);
  }
  await 상태바꾸기(id, 상태, 메모);
  revalidatePath("/admin/qa");
}
