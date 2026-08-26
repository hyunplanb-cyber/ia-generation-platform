/* 지킴이 «한 바퀴» — 검수 화면이 열려 있는 동안에만 두드린다. (2026-08-18 사장님 지시)
 *
 * 「검수기를 내가 켜고, 켜져 있는 동안 배치를 돌리는 방법은?
 *   영상이 매번 작업되는건 아니여서 컴퓨터 켤때 계속 배치 도는건 좀 부담스럽고.」
 *
 * 맞는 말이다. 영상은 주에 한두 번인데 작업 스케줄러로 5분마다 돌리면
 * 하루 288번 헛도는 셈이다. 그래서 «켜 두는 동안만» 도는 쪽으로 만든다.
 *
 * ⭐ 왜 이게 되는가 — 검수기를 `localhost:3000` 으로 여시면 **그 Next 서버가 이 컴퓨터에서
 *   돌고 있다.** 녹화본·ffmpeg·구글 드라이브·유튜브 열쇠가 다 그 서버 옆에 있다.
 *   따로 창을 띄울 것 없이 이 서버가 그대로 일하면 된다.
 *
 * ⛔ 배포된 곳(caffeinecolor.com)에서는 **아무것도 안 한다.** 거기엔 녹화본도 ffmpeg 도 없다.
 *   폰으로 검수하실 때 조용히 실패하는 대신, 「여기선 안 됩니다」를 분명히 돌려준다.
 */
import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";

/** 굽는 데 2분 안팎 걸린다. 서버리스 상한과 상관없는 로컬 전용이지만 넉넉히 둔다. */
export const maxDuration = 300;

/* 한 바퀴가 도는 동안 또 두드려도 겹치지 않게 «지금 도는 중»을 들고 있는다.
   겹치면 같은 영상을 두 번 굽고, 검수기에 두 번 밀어 넣는다. */
let 도는중 = false;
let 마지막: { 때: string; 글: string } | null = null;

export async function POST(req: Request) {
  const session = await getSession();
  if (!isOwner(session?.user.email)) return NextResponse.json({ ok: false, 왜: "주인만" }, { status: 404 });

  /* 배포된 곳인지 본다. VERCEL 은 Vercel 이 스스로 넣어 주는 값이다. */
  if (process.env.VERCEL) {
    return NextResponse.json({ ok: false, 왜: "배포된 곳에서는 안 돕니다 — 녹화본과 ffmpeg 이 그 컴퓨터에 있습니다." });
  }
  if (도는중) return NextResponse.json({ ok: true, 도는중: true, 마지막 });

  /* ⭐ 「드라이브 사본 채우기」도 여기로 부른다 (2026-08-26 사장님: 「드라이브 채우기가 어디 있지?」)
     그동안 지킴이가 「--드라이브채우기 로 채우면 됩니다」라고 «명령어»를 적어 줬는데,
     그 글을 읽는 곳은 검수 화면이라 거기서 할 수 있는 일이 없었다 — 막다른 안내였다.
     같은 길로 깃발만 하나 더 넘긴다. 새 길을 파지 않는다. */
  let 일 = "";
  try { 일 = ((await req.json()) as { 일?: string })?.일 ?? ""; } catch { /* 몸이 없으면 그냥 한 바퀴 */ }
  const 덧 = 일 === "드라이브채우기" ? ["--드라이브채우기"] : [];

  도는중 = true;
  const 뿌리 = process.cwd();
  const 지킴이 = resolve(뿌리, "판매용_템플릿/_마케팅/_작업/sns지킴이.mts");
  try {
    const 글 = await new Promise<string>((풀기, 깨기) => {
      /* npx 를 안 거친다 — 윈도우에서 .cmd 를 못 찾거나(ENOENT), 폴더 이름의 빈칸에서
         잘리거나(「02. 웹기획자」), Node 24 가 .cmd 실행을 막는다(EINVAL). 셋 다 겪었다. */
      execFile(process.execPath, ["--import", "tsx", 지킴이, ...덧], { cwd: 뿌리, maxBuffer: 1 << 26 },
        (오류, 나온글) => (오류 ? 깨기(오류) : 풀기(나온글)));
    });
    마지막 = { 때: new Date().toISOString(), 글: 글.trim().split("\n").slice(-6).join("\n") };
    return NextResponse.json({ ok: true, 도는중: false, 마지막 });
  } catch (e) {
    마지막 = { 때: new Date().toISOString(), 글: e instanceof Error ? e.message : String(e) };
    return NextResponse.json({ ok: false, 왜: "한 바퀴가 실패했습니다", 마지막 });
  } finally {
    도는중 = false;
  }
}
