// 사이트 URL을 받아 "코드가 아니라 요청/응답만으로" 판정할 수 있는 항목을 검사한다.
// 헤드리스 브라우저 없이(가볍고 빠르게, Vercel 제한 안에서) 여러 페이지를 돌며
// 접속·속도·모바일·검색·이미지·링크 등을 본다. 홈 1페이지가 아니라 내부 링크를
// 따라 여러 페이지를 각각 검사해, "총 N페이지 × 항목"으로 검수량을 크게 늘린다.
import type { Check } from "@/domain/verify/report";

const UA = "Mozilla/5.0 (compatible; CaffeineColorVerify/1.0; +https://caffeinecolor.com)";
const PAGE_TIMEOUT = 10000;
const ASSET_TIMEOUT = 5000;
const MAX_PAGES = 6; // 홈 + 내부 링크에서 고른 최대 5페이지
const HOME_ASSETS = 12; // 홈은 이미지·링크를 넉넉히 표본 확인
const SUB_ASSETS = 6; // 하위 페이지는 표본을 줄여 시간을 아낀다
const PAGE_CONCURRENCY = 4; // 페이지를 한 번에 몇 개씩 받아올지(대상 서버 부담 완화)

export interface HttpCheckResult {
  finalUrl: string;
  ok: boolean; // 메인 페이지 자체 접속 성공 여부
  checks: Check[];
  html: string; // LLM에 넘길 축약 본문(홈)
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

// 페이지 본문까지 읽어오되, 타임아웃이 헤더뿐 아니라 '본문 읽기'까지 덮게 한다.
// (Next.js 등 스트리밍 응답은 헤더가 온 뒤에도 본문이 늦게 끝나 .text()가 무한 대기할 수 있다.)
interface PageFetch {
  url: string;
  status: number;
  statusText: string;
  ok: boolean;
  html: string;
  headers: Headers;
}
async function fetchPageText(url: string, ms: number): Promise<PageFetch> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    });
    const html = await res.text(); // 아직 타임아웃 창 안 — 스트리밍이 늘어지면 abort된다
    return {
      url: res.url || url,
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
      html,
      headers: res.headers,
    };
  } finally {
    clearTimeout(timer);
  }
}

// 동시 실행 개수를 제한하며 매핑(대상 서버를 한꺼번에 때리지 않도록).
async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
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
function hasAttr(tag: string, name: string): boolean {
  return new RegExp(`\\b${name}\\s*=`, "i").test(tag);
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

// 페이지 표시 이름 — 같은 사이트면 경로만(홈은 '홈 (/)'), 외부면 전체 URL.
function pageLabel(u: string, origin: string): string {
  try {
    const url = new URL(u);
    if (url.origin !== origin) return u;
    const p = url.pathname + url.search;
    return p === "/" || p === "" ? "홈 (/)" : p;
  } catch {
    return u;
  }
}

async function sampleBroken(
  urls: string[],
  base: URL,
  cap: number,
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
    .slice(0, cap);

  const broken: string[] = [];
  await Promise.all(
    abs.map(async (u) => {
      try {
        const r = await fetchWithTimeout(u, "HEAD", ASSET_TIMEOUT);
        try {
          await r.body?.cancel(); // HEAD라도 본문이 오면 비워 연결을 반납
        } catch {
          /* ignore */
        }
        // HEAD를 막는 서버가 있어 405/501이면 깨짐으로 보지 않는다.
        if (r.status >= 400 && r.status !== 405 && r.status !== 501) broken.push(u);
      } catch {
        broken.push(u);
      }
    }),
  );
  return { checked: abs.length, broken };
}

// ── 한 페이지의 자동 검사 항목들 ──────────────────────────────────────────
interface PageData {
  url: string;
  label: string;
  html: string;
  status: number;
  statusText: string;
  ms: number;
  ok: boolean;
}

async function checkPage(p: PageData, origin: string, host: string, assetCap: number): Promise<Check[]> {
  const page = p.label;
  const checks: Check[] = [];
  const push = (id: string, label: string, status: Check["status"], detail: string, items?: string[]) =>
    checks.push({ id: `${page}:${id}`, page, label, status, detail, items });

  // 접속 — 페이지 자체가 안 열리면 나머지는 볼 것이 없다.
  push("reachable", "페이지 열림", p.ok ? "pass" : "fail", `${p.status || "-"} ${p.statusText} · ${(p.ms / 1000).toFixed(1)}초`);
  if (!p.ok && p.html === "") return checks;

  // 응답 속도
  push(
    "speed",
    "응답 속도",
    p.ms < 2500 ? "pass" : p.ms < 5000 ? "warn" : "fail",
    `${(p.ms / 1000).toFixed(1)}초${p.ms >= 2500 ? " — 방문자 이탈 위험" : ""}`,
  );

  // 모바일 대응(viewport)
  const hasViewport = /<meta[^>]+name\s*=\s*["']viewport["']/i.test(p.html);
  push("viewport", "모바일 대응", hasViewport ? "pass" : "fail", hasViewport ? "viewport 설정 있음" : "viewport 없음 — 모바일에서 깨질 수 있음");

  // 검색 기본(제목·설명)
  const hasTitle = /<title[^>]*>\s*\S/i.test(p.html);
  const hasDesc = /<meta[^>]+name\s*=\s*["']description["'][^>]*content\s*=\s*["']\s*\S/i.test(p.html);
  push(
    "seo",
    "검색 기본(제목·설명)",
    hasTitle && hasDesc ? "pass" : hasTitle ? "warn" : "fail",
    `제목 ${hasTitle ? "O" : "X"} · 설명 ${hasDesc ? "O" : "X"}`,
  );

  // SNS 공유 카드(Open Graph)
  const hasOg = /<meta[^>]+property\s*=\s*["']og:(title|image)["']/i.test(p.html);
  push("og", "SNS 공유 카드(OG)", hasOg ? "pass" : "warn", hasOg ? "og 태그 있음" : "og 태그 없음 — 링크 공유 시 미리보기가 빈약");

  // 대표 제목(h1) 구조
  const hasH1 = /<h1[\s/>]/i.test(p.html);
  push("h1", "대표 제목(h1)", hasH1 ? "pass" : "warn", hasH1 ? "h1 있음" : "h1 없음 — 화면 주제가 불명확(검색·접근성 불리)");

  // 문자 인코딩·언어 설정
  const hasCharset = /<meta[^>]+charset/i.test(p.html);
  const hasLang = /<html[^>]*\slang\s*=\s*["']\s*[a-z]/i.test(p.html);
  push(
    "encoding",
    "인코딩·언어 설정",
    hasCharset && hasLang ? "pass" : "warn",
    `인코딩 ${hasCharset ? "O" : "X"} · 언어(lang) ${hasLang ? "O" : "X"}`,
  );

  // 이미지 대체텍스트(alt) 누락 — 접근성·검색
  const imgTags = findTags(p.html, "img");
  const noAlt = imgTags.filter((t) => !hasAttr(t, "alt")).length;
  if (imgTags.length > 0) {
    push(
      "alt",
      "이미지 대체텍스트",
      noAlt === 0 ? "pass" : "warn",
      `이미지 ${imgTags.length}개 중 ${noAlt}개 대체텍스트(alt) 없음`,
    );
  }

  // 혼합 콘텐츠 — https 페이지에 http 리소스가 섞이면 브라우저가 차단·경고
  const isHttps = (() => {
    try {
      return new URL(p.url).protocol === "https:";
    } catch {
      return false;
    }
  })();
  if (isHttps) {
    const mixed = (p.html.match(/(?:src|href)\s*=\s*["']http:\/\//gi) ?? []).length;
    push("mixed", "혼합 콘텐츠(http 리소스)", mixed === 0 ? "pass" : "fail", mixed === 0 ? "http 리소스 없음" : `http로 불러오는 리소스 ${mixed}건 — 일부가 차단될 수 있음`);
  }

  // 이미지 깨짐
  const imgSrcs = imgTags.map((t) => attr(t, "src")).filter((s): s is string => !!s && !s.startsWith("data:"));
  const imgRes = await sampleBroken(imgSrcs, new URL(p.url), assetCap);
  push(
    "images",
    "이미지 깨짐",
    imgRes.broken.length === 0 ? "pass" : "fail",
    imgRes.checked === 0 ? "확인할 이미지 없음" : `${imgRes.checked}개 중 ${imgRes.broken.length}개 깨짐`,
    imgRes.broken.map((u) => shortenUrl(u, origin)),
  );

  // 내부 링크 깨짐
  const hrefs = findTags(p.html, "a")
    .map((t) => attr(t, "href"))
    .filter((h): h is string => !!h && !h.startsWith("#") && !/^(mailto:|tel:|javascript:)/i.test(h));
  const internal: string[] = [];
  for (const h of hrefs) {
    try {
      const a = new URL(h, p.url);
      if (a.host === host) internal.push(a.href);
    } catch {
      /* skip */
    }
  }
  const linkRes = await sampleBroken([...new Set(internal)], new URL(p.url), assetCap);
  push(
    "links",
    "내부 링크 깨짐",
    linkRes.broken.length === 0 ? "pass" : "fail",
    linkRes.checked === 0 ? "확인할 링크 없음" : `${linkRes.checked}개 중 ${linkRes.broken.length}개 깨짐`,
    linkRes.broken.map((u) => shortenUrl(u, origin)),
  );

  return checks;
}

// ── 사이트 전체(한 번만) 검사 항목들 ──────────────────────────────────────
// 상태 코드만 필요한 프로브. 본문은 반드시 비워(cancel) 연결을 즉시 반납한다.
// (본문을 안 읽고 버리면 undici 연결이 '미소비' 상태로 묶여, 같은 도메인 요청이 교착된다.)
async function probeStatus(url: string, ms: number): Promise<{ status: number; url: string } | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
    });
    try {
      await res.body?.cancel();
    } catch {
      /* ignore */
    }
    return { status: res.status, url: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function probeExists(url: string, id: string, label: string, missingDetail: string): Promise<Check> {
  const r = await probeStatus(url, ASSET_TIMEOUT);
  if (!r) return { id, label, status: "warn", detail: "확인 불가" };
  const exists = r.status < 400;
  return { id, label, status: exists ? "pass" : "warn", detail: exists ? "있음" : missingDetail };
}

async function probeHttpsRedirect(u: URL): Promise<Check> {
  const id = "site:redirect";
  const label = "HTTP→HTTPS 자동 전환";
  const r = await probeStatus(`http://${u.host}${u.pathname}`, ASSET_TIMEOUT);
  if (!r) return { id, label, status: "warn", detail: "http 접속 확인 불가" };
  const toHttps = (() => {
    try {
      return new URL(r.url).protocol === "https:";
    } catch {
      return false;
    }
  })();
  return {
    id,
    label,
    status: toHttps ? "pass" : "warn",
    detail: toHttps ? "http로 접속하면 https로 자동 이동" : "http로 접속해도 https로 넘어가지 않음",
  };
}

async function probe404(origin: string): Promise<Check> {
  const id = "site:notfound";
  const label = "없는 주소 처리(404)";
  const r = await probeStatus(`${origin}/caffeinecolor-not-found-${Date.now()}`, ASSET_TIMEOUT);
  if (!r) return { id, label, status: "warn", detail: "확인 불가" };
  const ok = r.status >= 400;
  return {
    id,
    label,
    status: ok ? "pass" : "warn",
    detail: ok ? `${r.status} — 없는 주소를 제대로 걸러냄` : `${r.status} — 없는 주소에도 정상 응답(오류 처리 필요)`,
  };
}

async function runSiteChecks(finalUrl: string, homeHeaders: Headers): Promise<Check[]> {
  const u = new URL(finalUrl);
  const origin = u.origin;
  const isHttps = u.protocol === "https:";

  const checks: Check[] = [
    {
      id: "site:https",
      label: "보안 연결(HTTPS)",
      status: isHttps ? "pass" : "warn",
      detail: isHttps ? "https 사용" : "http — 방문자 신뢰·검색에 불리",
    },
  ];

  const [redirect, robots, sitemap, notFound] = await Promise.all([
    probeHttpsRedirect(u),
    probeExists(`${origin}/robots.txt`, "site:robots", "robots.txt", "없음 — 검색엔진 수집 규칙 파일 권장"),
    probeExists(`${origin}/sitemap.xml`, "site:sitemap", "sitemap.xml", "없음 — 검색 노출에 sitemap 권장"),
    probe404(origin),
  ]);
  checks.push(redirect, robots, sitemap, notFound);

  // 기본 보안 헤더(홈 응답 헤더로 판정)
  const hsts = homeHeaders.get("strict-transport-security");
  const xcto = homeHeaders.get("x-content-type-options");
  const refpol = homeHeaders.get("referrer-policy");
  const secCount = [hsts, xcto, refpol].filter(Boolean).length;
  checks.push({
    id: "site:secheaders",
    label: "기본 보안 헤더",
    status: secCount >= 2 ? "pass" : "warn",
    detail: `HSTS ${hsts ? "O" : "X"} · X-Content-Type-Options ${xcto ? "O" : "X"} · Referrer-Policy ${refpol ? "O" : "X"}`,
  });

  return checks;
}

// 홈에서 찾은 내부 링크 중 서로 다른 페이지를 골라 크롤 대상으로 삼는다.
// 이미지·문서 등 파일 링크와 홈 자신은 제외한다.
function pickCrawlTargets(internalLinks: string[], homeUrl: string, limit: number): string[] {
  const homePath = (() => {
    try {
      return new URL(homeUrl).pathname;
    } catch {
      return "/";
    }
  })();
  const seen = new Set<string>();
  const targets: string[] = [];
  for (const href of internalLinks) {
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      continue;
    }
    const path = url.pathname;
    if (path === homePath) continue; // 홈은 이미 검사
    if (/\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|css|js|xml|json|mp4|webm|woff2?|ttf)$/i.test(path)) continue;
    if (seen.has(path)) continue;
    seen.add(path);
    targets.push(url.href);
    if (targets.length >= limit) break;
  }
  return targets;
}

async function fetchPage(url: string, origin: string): Promise<PageData> {
  const t0 = Date.now();
  try {
    const r = await fetchPageText(url, PAGE_TIMEOUT);
    return {
      url: r.url,
      label: pageLabel(r.url, origin),
      html: r.html,
      status: r.status,
      statusText: r.statusText,
      ms: Date.now() - t0,
      ok: r.ok,
    };
  } catch {
    return { url, label: pageLabel(url, origin), html: "", status: 0, statusText: "연결 실패", ms: Date.now() - t0, ok: false };
  }
}

// 기본 등급에서 노출하는 페이지 검사 항목(7개). 상세는 여기에 og·h1·인코딩·alt·혼합콘텐츠까지 전부.
const BASIC_PAGE_CHECKS = new Set(["reachable", "speed", "viewport", "seo", "images", "links"]);

export async function runHttpChecks(rawUrl: string, detail = false): Promise<HttpCheckResult> {
  const target = normalizeUrl(rawUrl);

  // 홈 페이지 — 접속 자체가 안 되면 여기서 접속 실패만 담아 돌려준다(예전과 동일).
  const t0 = Date.now();
  let home: PageFetch;
  try {
    home = await fetchPageText(target.href, PAGE_TIMEOUT);
  } catch {
    return {
      finalUrl: target.href,
      ok: false,
      checks: [
        {
          id: "reachable",
          label: "사이트 접속",
          status: "fail",
          detail: "페이지를 불러오지 못했어요(주소가 맞는지, 배포됐는지 확인).",
        },
      ],
      html: "",
      links: [],
    };
  }
  const homeMs = Date.now() - t0;
  const homeHtml = home.html;
  const finalUrl = home.url;
  const origin = new URL(finalUrl).origin;
  const host = new URL(finalUrl).host;

  // 홈에서 내부 링크 수집(크롤 대상 + LLM 참고용)
  const homeHrefs = findTags(homeHtml, "a")
    .map((t) => attr(t, "href"))
    .filter((h): h is string => !!h && !h.startsWith("#") && !/^(mailto:|tel:|javascript:)/i.test(h));
  const internalAbs: string[] = [];
  for (const h of homeHrefs) {
    try {
      const a = new URL(h, finalUrl);
      if (a.host === host) internalAbs.push(a.href);
    } catch {
      /* skip */
    }
  }
  const uniqueInternal = [...new Set(internalAbs)];
  // 기본은 홈만, 상세는 홈+주요 화면까지 크롤한다.
  const maxPages = detail ? MAX_PAGES : 1;
  // 후보를 넉넉히 뽑는다 — 리다이렉트로 같은 페이지(예: 여러 링크가 /login으로)로
  // 모이면 중복 제거 후 페이지 수가 줄기 때문에, 여유분을 두고 최종 경로로 합친다.
  const subTargets = detail ? pickCrawlTargets(uniqueInternal, finalUrl, MAX_PAGES + 3) : [];

  // 사이트 전체 검사 + 하위 페이지 받아오기를 동시에 시작
  const [siteChecks, fetchedSubs] = await Promise.all([
    runSiteChecks(finalUrl, home.headers),
    mapLimit(subTargets, PAGE_CONCURRENCY, (u) => fetchPage(u, origin)),
  ]);

  // 리다이렉트 후 '최종 경로'가 홈이나 다른 하위와 겹치면 제외(같은 페이지 중복 검사 방지).
  const seenPaths = new Set<string>([new URL(finalUrl).pathname]);
  const subPages: PageData[] = [];
  for (const p of fetchedSubs) {
    let path: string;
    try {
      path = new URL(p.url).pathname;
    } catch {
      path = p.url;
    }
    if (seenPaths.has(path)) continue;
    seenPaths.add(path);
    subPages.push(p);
    if (subPages.length >= maxPages - 1) break;
  }

  // 페이지별 검사 — 홈 먼저, 그다음 하위 페이지들
  const homeData: PageData = {
    url: finalUrl,
    label: pageLabel(finalUrl, origin),
    html: homeHtml,
    status: home.status,
    statusText: home.statusText,
    ms: homeMs,
    ok: home.ok,
  };
  const pages: PageData[] = [homeData, ...subPages];
  const perPage = await mapLimit(pages, PAGE_CONCURRENCY, (p, i) =>
    checkPage(p, origin, host, i === 0 ? HOME_ASSETS : SUB_ASSETS),
  );

  // 기본 등급은 항목을 7개로 좁힌다(사이트 전체 검사는 보안 연결만, 페이지 검사는 핵심만).
  // 상세 등급은 전부 노출 + 여러 페이지 크롤로 실제 검수 깊이가 더 깊다.
  let siteFinal = siteChecks;
  let perPageFinal = perPage.flat();
  if (!detail) {
    siteFinal = siteChecks.filter((c) => c.id === "site:https");
    perPageFinal = perPageFinal.filter((c) =>
      BASIC_PAGE_CHECKS.has(c.id.split(":").pop() ?? ""),
    );
  }
  // 순서: 사이트 전체 → 홈 → 하위 페이지. (엑셀·화면의 AUTO 번호가 이 순서로 매겨진다)
  const checks: Check[] = [...siteFinal, ...perPageFinal];

  // LLM에 넘길 본문은 태그를 살리되 스크립트/스타일을 걷어내고 길이를 제한한다.
  const trimmed = homeHtml
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 16000);

  return { finalUrl, ok: home.ok, checks, html: trimmed, links: uniqueInternal.slice(0, 40) };
}
