// 사이트 URL을 받아 "코드가 아니라 요청/응답만으로" 판정할 수 있는 항목을 검사한다.
// 헤드리스 브라우저 없이(가볍고 빠르게, Vercel 제한 안에서) 접속·이미지·링크·모바일 대응 등을 본다.
import type { Check } from "@/domain/verify/report";

const UA = "Mozilla/5.0 (compatible; CaffeineColorVerify/1.0; +https://caffeinecolor.com)";
const PAGE_TIMEOUT = 12000;
const ASSET_TIMEOUT = 6000;
const MAX_ASSETS = 15; // 이미지·링크는 표본만 확인해 시간을 아낀다

export interface HttpCheckResult {
  finalUrl: string;
  ok: boolean; // 메인 페이지 자체 접속 성공 여부
  checks: Check[];
  html: string; // LLM에 넘길 축약 본문
  links: string[]; // 찾은 내부 링크
}

// SSRF 방지 — 내부/사설 주소는 검사하지 않는다.
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/:\d+$/, "");
  return (
    h === "localhost" ||
    h === "0.0.0.0" ||
    h === "::1" ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h) ||
    h.endsWith(".local") ||
    h.endsWith(".internal")
  );
}

export function normalizeUrl(raw: string): URL {
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  const u = new URL(s); // 형식이 틀리면 throw → 상위에서 안내로 처리
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("INVALID_PROTOCOL");
  }
  if (isBlockedHost(u.host)) {
    throw new Error("BLOCKED_HOST");
  }
  return u;
}

async function fetchWithTimeout(url: string, method: "GET" | "HEAD", ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    });
  } finally {
    clearTimeout(timer);
  }
}

// HTML 속성값의 엔티티를 실제 문자로 되돌린다.
// (특히 &amp; — 이걸 안 풀면 Next 이미지 URL이 &amp;w=... 로 깨져 멀쩡한 이미지를 '깨짐'으로 오탐한다.)
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#38;/g, "&")
    .replace(/&#x26;/gi, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// 아주 단순한 정규식 파싱(무거운 DOM 라이브러리 대신). MVP엔 충분하다.
function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return m ? decodeEntities(m[1]) : null;
}
function findTags(html: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>`, "gi");
  return html.match(re) ?? [];
}

// 깨진 항목을 사람이 읽기 좋게 — 같은 사이트면 경로만, 외부면 전체 URL.
function shortenUrl(u: string, origin: string): string {
  try {
    const url = new URL(u);
    return url.origin === origin ? url.pathname + url.search : u;
  } catch {
    return u;
  }
}

async function sampleBroken(
  urls: string[],
  base: URL,
): Promise<{ checked: number; broken: string[] }> {
  const abs = urls
    .map((u) => {
      try {
        return new URL(u, base).href;
      } catch {
        return null;
      }
    })
    .filter((u): u is string => !!u && /^https?:/i.test(u))
    .slice(0, MAX_ASSETS);

  const broken: string[] = [];
  await Promise.all(
    abs.map(async (u) => {
      try {
        const r = await fetchWithTimeout(u, "HEAD", ASSET_TIMEOUT);
        // HEAD를 막는 서버가 있어 405/501이면 깨짐으로 보지 않는다.
        if (r.status >= 400 && r.status !== 405 && r.status !== 501) broken.push(u);
      } catch {
        broken.push(u);
      }
    }),
  );
  return { checked: abs.length, broken };
}

export async function runHttpChecks(rawUrl: string): Promise<HttpCheckResult> {
  const target = normalizeUrl(rawUrl);
  const checks: Check[] = [];

  const t0 = Date.now();
  let res: Response;
  let html = "";
  try {
    res = await fetchWithTimeout(target.href, "GET", PAGE_TIMEOUT);
    html = await res.text();
  } catch {
    checks.push({
      id: "reachable",
      label: "사이트 접속",
      status: "fail",
      detail: "페이지를 불러오지 못했어요(주소가 맞는지, 배포됐는지 확인).",
    });
    return { finalUrl: target.href, ok: false, checks, html: "", links: [] };
  }
  const ms = Date.now() - t0;
  const finalUrl = res.url || target.href;

  // 1) 접속
  checks.push({
    id: "reachable",
    label: "사이트 접속",
    status: res.ok ? "pass" : "fail",
    detail: `${res.status} ${res.statusText} · ${(ms / 1000).toFixed(1)}초`,
  });

  // 2) HTTPS
  const isHttps = new URL(finalUrl).protocol === "https:";
  checks.push({
    id: "https",
    label: "보안 연결(HTTPS)",
    status: isHttps ? "pass" : "warn",
    detail: isHttps ? "https 사용" : "http — 방문자 신뢰·검색에 불리",
  });

  // 3) 모바일 대응(viewport)
  const hasViewport = /<meta[^>]+name\s*=\s*["']viewport["']/i.test(html);
  checks.push({
    id: "viewport",
    label: "모바일 대응",
    status: hasViewport ? "pass" : "fail",
    detail: hasViewport ? "viewport 설정 있음" : "viewport 없음 — 모바일에서 깨질 수 있음",
  });

  // 4) 제목·설명(검색 유입)
  const hasTitle = /<title[^>]*>\s*\S/i.test(html);
  const hasDesc = /<meta[^>]+name\s*=\s*["']description["'][^>]*content\s*=\s*["']\s*\S/i.test(html);
  checks.push({
    id: "seo",
    label: "검색 기본(제목·설명)",
    status: hasTitle && hasDesc ? "pass" : "warn",
    detail: `제목 ${hasTitle ? "O" : "X"} · 설명 ${hasDesc ? "O" : "X"}`,
  });

  // 5) 로딩 속도(대략)
  checks.push({
    id: "speed",
    label: "첫 응답 속도",
    status: ms < 2500 ? "pass" : ms < 5000 ? "warn" : "fail",
    detail: `${(ms / 1000).toFixed(1)}초${ms >= 2500 ? " — 방문자 이탈 위험" : ""}`,
  });

  // 6) 이미지 깨짐
  const imgs = findTags(html, "img")
    .map((t) => attr(t, "src"))
    .filter((s): s is string => !!s && !s.startsWith("data:"));
  const origin = new URL(finalUrl).origin;
  const imgRes = await sampleBroken(imgs, new URL(finalUrl));
  checks.push({
    id: "images",
    label: "이미지 깨짐",
    status: imgRes.broken.length === 0 ? "pass" : "fail",
    detail:
      imgRes.checked === 0
        ? "확인할 이미지 없음"
        : `${imgRes.checked}개 중 ${imgRes.broken.length}개 깨짐`,
    items: imgRes.broken.map((u) => shortenUrl(u, origin)),
  });

  // 7) 내부 링크 깨짐
  const host = new URL(finalUrl).host;
  const hrefs = findTags(html, "a")
    .map((t) => attr(t, "href"))
    .filter((h): h is string => !!h && !h.startsWith("#") && !/^(mailto:|tel:|javascript:)/i.test(h));
  const internal: string[] = [];
  for (const h of hrefs) {
    try {
      const abs = new URL(h, finalUrl);
      if (abs.host === host) internal.push(abs.href);
    } catch {
      /* skip */
    }
  }
  const uniqueInternal = [...new Set(internal)];
  const linkRes = await sampleBroken(uniqueInternal, new URL(finalUrl));
  checks.push({
    id: "links",
    label: "내부 링크 깨짐",
    status: linkRes.broken.length === 0 ? "pass" : "fail",
    detail:
      linkRes.checked === 0
        ? "확인할 링크 없음"
        : `${linkRes.checked}개 중 ${linkRes.broken.length}개 깨짐`,
    items: linkRes.broken.map((u) => shortenUrl(u, origin)),
  });

  // LLM에 넘길 본문은 태그를 살리되 스크립트/스타일을 걷어내고 길이를 제한한다.
  const trimmed = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 16000);

  return { finalUrl, ok: res.ok, checks, html: trimmed, links: uniqueInternal.slice(0, 40) };
}
