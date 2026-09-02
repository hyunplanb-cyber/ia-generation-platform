import { and, eq, gt, lt, sql as raw } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { diagnoseCache, diagnoseHit } from "@/db/schema";
import { diagnose } from "@/lib/diagnose";

// AI 노출 진단 — 손님이 «남의 주소»를 넣으면 우리 서버가 대신 가져와 채점한다.
// 브라우저는 남의 사이트를 직접 못 읽어서(CORS) 서버가 대신 해야 한다.
//
// ⛔ 이건 AI를 안 부른다. 페이지 소스만 보고 규칙으로 채점하므로 종량제 잔액과 무관하다.
//    (AGENTS.md 의 결제 경로 규칙 — 여기는 손님 몫 API 가 아니다)
//
// dns·net 모듈로 SSRF 를 막기 때문에 엣지가 아니라 노드에서 돌아야 한다.
export const runtime = "nodejs";

const CACHE_MS = 10 * 60 * 1000; // 같은 주소는 10분간 재사용
const WINDOW_MS = 60 * 1000; // 같은 곳에서 1분에
const MAX_PER_IP = 5; // 5번까지
const MAX_URL_CHARS = 300;

// ⭐ 2026-09-02 — 횟수와 담아 둔 것을 «메모리에서 DB 로» 옮겼다.
//
//   전에는 `new Map()` 두 개에 담았다. 이 컴퓨터에서는 잘 돌았지만 버셀
//   서버리스는 요청마다 다른 인스턴스일 수 있어서, 한 대가 센 횟수를 다음
//   요청이 못 본다. 그대로 올렸으면 **횟수 제한이 사실상 없는 채로** 손님에게
//   나갔고, 남의 서버를 대신 두드리는 자리라 그건 우리 이름으로 가는 짐이다.
//
// ⚠ Redis·KV 를 새로 붙이지 않는다. 그게 오히려 돈이다. 이미 쓰는 DB 에 둔다.
// ⚠ 여기서 DB 가 죽으면 «진단을 막지» 않는다. 무료로 주는 것이고, 재는 것이
//   못 돌았다고 손님 화면을 닫아 버릴 이유가 없다. 대신 조용히 통과시킨다.

/** 이 곳이 최근 1분에 몇 번 눌렀나. 재지 못하면 «막지 않는다». */
async function tooMany(ip: string): Promise<boolean> {
  const 부터 = new Date(Date.now() - WINDOW_MS);
  try {
    await db.insert(diagnoseHit).values({ ip });
    const [{ 몇 }] = await db
      .select({ 몇: raw<number>`count(*)::int` })
      .from(diagnoseHit)
      .where(and(eq(diagnoseHit.ip, ip), gt(diagnoseHit.createdAt, 부터)));
    return 몇 > MAX_PER_IP;
  } catch {
    return false;
  }
}

/** 자국이 무한정 쌓이지 않게 가끔 쓸어 낸다. 스무 번에 한 번이면 넉넉하다.
 *  ⚠ 지우는 데 시간이 걸려도 손님을 기다리게 하지 않는다 — 답을 보낸 뒤에 돈다. */
function 쓸어내기(): void {
  if (Math.random() > 0.05) return;
  const 부터 = new Date(Date.now() - WINDOW_MS);
  void db.delete(diagnoseHit).where(lt(diagnoseHit.createdAt, 부터)).catch(() => {});
  void db
    .delete(diagnoseCache)
    .where(lt(diagnoseCache.createdAt, new Date(Date.now() - CACHE_MS)))
    .catch(() => {});
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "요청 형식을 확인해 주세요" }, { status: 400 });
  }

  const url = String(body.url ?? "").trim();
  if (!url) return Response.json({ error: "주소를 입력해 주세요" }, { status: 400 });
  if (url.length > MAX_URL_CHARS) {
    return Response.json({ error: "주소가 너무 깁니다" }, { status: 400 });
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (await tooMany(ip)) {
    return Response.json({ error: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  }

  const key = url.toLowerCase();
  try {
    const [담긴것] = await db
      .select({ data: diagnoseCache.data })
      .from(diagnoseCache)
      .where(
        and(
          eq(diagnoseCache.urlKey, key),
          gt(diagnoseCache.createdAt, new Date(Date.now() - CACHE_MS)),
        ),
      )
      .limit(1);
    if (담긴것) {
      쓸어내기();
      return Response.json(담긴것.data);
    }
  } catch {
    // 담아 둔 것을 못 읽으면 그냥 새로 잰다. 손님에게는 아무 차이가 없다.
  }

  try {
    const data = await diagnose(url);
    try {
      await db
        .insert(diagnoseCache)
        .values({ urlKey: key, data })
        .onConflictDoUpdate({
          target: diagnoseCache.urlKey,
          set: { data, createdAt: new Date() },
        });
    } catch {
      // 담아 두지 못해도 답은 이미 나왔다. 다음 사람이 한 번 더 잴 뿐이다.
    }
    쓸어내기();
    return Response.json(data);
  } catch (e) {
    // fetch.ts 와 index.ts 가 사람이 읽을 수 있는 말로 던진다.
    const msg = e instanceof Error ? e.message : "진단에 실패했습니다";
    return Response.json({ error: msg }, { status: 400 });
  }
}
