/* 우리 숫자 — 회원 · AI팩 생성 · 생성 시도 · 프리셋 · 검수 시나리오 · 다운로드.
 *
 * 「회원수, ai팩 생성, 생성시도, 디자인프리셋 생성, 검수시나리오생성, 다운로드 수
 *   알 수 있는 대시보드 만들어줘」 (2026-08-25 사장님)
 * 「검수기들처럼 열 수 있게 만들어줘」 — 그래서 파일을 만드는 글이 아니라 «화면»으로 둔다.
 *
 * SNS 검수기(`/admin/sns`)·검수 판단(`/admin/qa`)과 같은 자리에 두고 `isOwner()` 로 막는다.
 * 끌 서버가 없어서 막힐 일이 없고, **폰에서도 본다.**
 *
 * 이 파일은 셋만 한다 — ① 주인인지 보고 ② 숫자를 읽고 ③ 화면에 넘긴다.
 *   세는 법  → `lib/our-numbers.ts`      (화면과 `대시보드.mts` 가 같은 것을 본다)
 *   보이는 것 → `./stats-view.tsx`        (떼어 둬야 눈으로 그려 볼 수 있다)
 */
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";
import { readOurNumbers } from "@/lib/our-numbers";
import { StatsView } from "./stats-view";

export const metadata = { title: "우리 숫자 — 카페인컬러" };
/* 볼 때마다 새로 센다 — 캐시로 굳히면 어제 숫자를 오늘 것으로 본다. */
export const dynamic = "force-dynamic";

export default async function 우리숫자페이지() {
  const session = await getSession();
  /* 주인이 아니면 «없는 페이지»로 둔다 — 「권한이 없습니다」는 여기 뭐가 있다고 알려 준다. */
  if (!isOwner(session?.user.email)) notFound();

  return <StatsView n={await readOurNumbers()} />;
}
