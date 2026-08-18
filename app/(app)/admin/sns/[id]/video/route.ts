/* 구운 영상을 «검수 화면에서 바로 돌려 보게» 흘려 준다. (2026-08-18 사장님 지시)
 *
 *   GET /admin/sns/<id>/video?판=916    세로
 *   GET /admin/sns/<id>/video?판=169    가로
 *
 * 왜 이렇게 하나
 *   사장님: 「검수기에서 너가 만든 영상을 봐야 하는데 그게 될까?」
 *   지금까지 검수기에 가는 건 «칸별 정지 그림»뿐이었다. 넘어가는 속도도, 소리도, 흐름도
 *   그림으로는 안 보인다. 그런데 영상 파일은 **사장님 컴퓨터의 %TEMP%** 에 있다.
 *
 *   그래서 «검수기를 로컬(localhost)에서 열 때만» 그 파일을 읽어 흘려 준다.
 *   ⚠ 배포된 caffeinecolor.com 에서는 그 파일이 없으므로 404 다. 그게 맞다 —
 *     13MB 짜리 mp4 를 DB 에 넣거나 저장소에 올리는 것은 다음 이야기다.
 *
 * ⚠ 아무 파일이나 못 읽게 막는다 — DB 에 적힌 경로만, 그것도 «구운 영상 폴더 안»만 연다.
 *   경로를 손님이 고를 수 있으면 그 순간 아무 파일이나 읽히는 구멍이 된다.
 */
import { createReadStream, statSync, existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { snsContent } from "@/db/schema";
import { getSession } from "@/lib/session";
import { isOwner } from "@/lib/flags";

/** 구운 영상이 놓이는 곳. `영상굽기.mjs` 의 `W` 와 같아야 한다. */
const 구운방 = resolve((process.env.TEMP ?? tmpdir()).replace(/\\/g, "/"), "cc-vid-w2");

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!isOwner(session?.user.email)) return new Response("no", { status: 404 });

  const { id } = await params;
  const 판 = new URL(req.url).searchParams.get("판") === "169" ? "169" : "916";

  const [편] = await db.select().from(snsContent).where(eq(snsContent.id, id));
  if (!편) return new Response("no", { status: 404 });

  const 적힌길 = 판 === "169" ? 편.videoHorizontal : 편.videoVertical;
  if (!적힌길) {
    return new Response("영상 경로가 아직 안 적혔습니다 — 검수보내기를 다시 돌리세요.", { status: 404 });
  }

  /* 구운 영상 폴더 «안»인지 확인한다. 밖이면 안 연다. */
  const 길 = resolve(적힌길);
  if (!(길 === 구운방 || 길.startsWith(구운방 + sep))) {
    return new Response("그 자리는 못 엽니다.", { status: 403 });
  }
  if (!existsSync(길)) {
    return new Response(
      "이 컴퓨터에 그 영상이 없습니다. 로컬(localhost)에서 열어 보시거나, 다시 구워 주세요.",
      { status: 404 },
    );
  }

  const 크기 = statSync(길).size;
  const 범위 = req.headers.get("range");
  const 머리 = {
    "content-type": "video/mp4",
    "accept-ranges": "bytes",
    "cache-control": "no-store",
  };

  /* 브라우저가 «앞뒤로 끌어 보려면» Range 를 받아 줘야 한다. 없으면 통째로만 재생된다. */
  if (범위) {
    const m = /bytes=(\d*)-(\d*)/.exec(범위);
    const 처음 = m?.[1] ? Number(m[1]) : 0;
    const 끝 = m?.[2] ? Number(m[2]) : 크기 - 1;
    if (Number.isNaN(처음) || Number.isNaN(끝) || 처음 > 끝 || 끝 >= 크기) {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${크기}` } });
    }
    const 스트림 = createReadStream(길, { start: 처음, end: 끝 });
    return new Response(Readable.toWeb(스트림) as ReadableStream, {
      status: 206,
      headers: { ...머리, "content-range": `bytes ${처음}-${끝}/${크기}`, "content-length": String(끝 - 처음 + 1) },
    });
  }

  const 스트림 = createReadStream(길);
  return new Response(Readable.toWeb(스트림) as ReadableStream, {
    status: 200,
    headers: { ...머리, "content-length": String(크기) },
  });
}
