/* SNS 검수 «껍데기» — 지킴이 스위치를 여기 둔다. (2026-08-18 사장님 지적)
 *
 * 「지킴이를 켰다가 다른 영상 수정하려고 수정화면에 들어가면 지킴이가 꺼지는거 같아」
 *
 * 맞다. 스위치를 목록 화면(page.tsx)에만 붙여 놨더니, 수정 화면(`[id]`)으로 들어가는
 * 순간 그 부품이 사라지고 30초 시계도 같이 멈췄다. 검수는 «목록에서 보고 → 들어가서
 * 고치고 → 나오고»를 되풀이하는 일이라, 제일 많이 오가는 자리에서 꺼진 셈이다.
 *
 * ⭐ 레이아웃에 두면 목록과 수정 화면을 오가도 **부품이 안 사라진다** —
 *   그 사이 화면만 갈리고 스위치는 그대로 붙어 있다. 그래서 시계도 안 멈춘다.
 */
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";
import { WatcherSwitch } from "./watcher-switch";

export default async function SnsAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  /* 주인이 아니면 «없는 페이지»로 둔다 — 안쪽 화면들과 같은 규칙이다. */
  if (!isOwner(session?.user.email)) notFound();

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 pt-6">
        {/* 지킴이는 «그 컴퓨터»에서만 돈다(녹화본·ffmpeg·열쇠가 거기 있다).
            배포된 곳에서는 «켜지는 척»을 하지 않는다 — 아래에서 단추를 잠그고 왜인지 적는다. */}
        <WatcherSwitch 배포됨={!!process.env.VERCEL} />
      </div>
      {children}
    </>
  );
}
