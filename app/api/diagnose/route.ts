import { headers } from "next/headers";
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

// ⚠ 배포 전에 반드시 고칠 것 — 이 두 개는 «한 대의 메모리»에만 남는다.
//   Vercel 서버리스는 요청마다 다른 인스턴스일 수 있어서, 실제로 올리면
//   횟수 제한이 거의 안 걸리고 캐시도 잘 안 맞는다. 그때는 우리가 이미 쓰는
//   DB(drizzle)에 표 하나를 만들어 옮긴다. Redis·KV 를 새로 붙이면 그게 오히려 돈이다.
//   지금은 로컬에서 돌려 보는 단계라 이대로 둔다.
const cache = new Map<string, { at: number; data: unknown }>();
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // 메모리가 무한정 늘지 않게
  return list.length > MAX_PER_IP;
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
  if (tooMany(ip)) {
    return Response.json({ error: "잠시 후 다시 시도해 주세요" }, { status: 429 });
  }

  const key = url.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return Response.json(hit.data);
  }

  try {
    const data = await diagnose(url);
    cache.set(key, { at: Date.now(), data });
    if (cache.size > 500) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    return Response.json(data);
  } catch (e) {
    // fetch.ts 와 index.ts 가 사람이 읽을 수 있는 말로 던진다.
    const msg = e instanceof Error ? e.message : "진단에 실패했습니다";
    return Response.json({ error: msg }, { status: 400 });
  }
}
