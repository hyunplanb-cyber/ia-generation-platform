// AI 노출 진단 — 판정에 쓰는 재료들.
//
// 여기 있는 검사는 전부 «페이지 소스만 보고 알 수 있는 것»이다. AI에게 물어보지 않는다.
// 그래서 이 기능은 앤트로픽 종량제를 한 푼도 안 쓴다 — AGENTS.md 의 결제 경로 규칙과
// 부딪히지 않는 이유다. 실제로 AI가 우리를 인용하는지는 이 방식으로 알 수 없고,
// 그건 상담 때 사람이 따로 확인할 몫이다.
//
// 그라운드AI 에서 만든 로직을 카페인컬러로 옮겨 왔다(2026-08-31). 점수 배분은 원본 그대로 둔다.

/**
 * 우리가 확인하는 AI 수집 로봇. weight 는 막혔을 때 잃는 점수다.
 *
 * `rendersJs` — 그 봇이 자바스크립트를 «실행»하는가. 이게 갈리는 이유는,
 * 자바스크립트로 그리는 사이트에서는 robots.txt 로 열어 줘도 못 읽는 봇이 있기 때문이다.
 *   true  = 실행한다 · false = 안 한다 · null = 근거를 못 찾았다(모름)
 *
 * 근거 —
 *   · GPTBot·ClaudeBot·PerplexityBot: Vercel + MERJ 가 GPTBot 요청 5억 건 이상을 분석했는데
 *     자바스크립트 실행 증거가 «0건». JS 파일을 받아 가긴 해도(약 11.5%) 실행은 안 한다.
 *     AI 봇은 1~5초 타임아웃으로 긁어서, 그 규모로 렌더링할 여력이 없다.
 *   · Gemini: Googlebot 의 렌더링 서비스(WRS)를 쓰므로 실행한다.
 *   · Bingbot: 2019-10 부터 Chromium 기반 Edge 엔진으로 렌더링한다. 그 색인이 Copilot 을 받친다.
 *   · 네이버 Yeti: **실행한다는 확언을 못 찾았다.** 네이버 웹마스터 가이드는 「JS 를 실행한 뒤의
 *     콘텐츠도 읽을 수 있도록 **SSR 도입을 권장**한다」고만 적혀 있다 — 실행 여부를 밝히지 않고,
 *     오히려 SSR 을 권한다. Vercel 같은 대규모 실측도 없다. 그래서 `null`(모름)로 둔다.
 *     다만 권고가 SSR 인 만큼, 실무에서는 «기대지 않는» 쪽이 안전하다.
 */
export const BOTS = [
  { id: "GPTBot", label: "ChatGPT 학습", weight: 8, rendersJs: false },
  { id: "OAI-SearchBot", label: "ChatGPT 검색", weight: 7, rendersJs: false },
  { id: "ClaudeBot", label: "Claude", weight: 7, rendersJs: false },
  { id: "PerplexityBot", label: "Perplexity", weight: 6, rendersJs: false },
  { id: "Google-Extended", label: "Gemini 학습", weight: 5, rendersJs: true },
  { id: "Bingbot", label: "Copilot · Bing", weight: 4, rendersJs: true },
  { id: "Yeti", label: "네이버", weight: 3, rendersJs: null },
] as const;

export type { BotRow } from "./types";

type RobotsRule = { type: "allow" | "disallow"; path: string };
export type RobotsGroup = { agents: string[]; rules: RobotsRule[] };

/** robots.txt 를 User-agent 묶음으로 쪼갠다. */
export function parseRobots(txt: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let cur: RobotsGroup | null = null;

  for (const raw of String(txt).split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;

    const key = m[1].toLowerCase();
    const val = m[2].trim();

    if (key === "user-agent") {
      // 규칙이 하나라도 붙은 묶음이면 새 묶음을 연다.
      // (User-agent 가 연달아 나오면 같은 묶음을 공유하는 게 robots.txt 규약이다.)
      if (!cur || cur.rules.length) {
        cur = { agents: [], rules: [] };
        groups.push(cur);
      }
      cur.agents.push(val.toLowerCase());
    } else if (cur && (key === "allow" || key === "disallow")) {
      cur.rules.push({ type: key, path: val });
    }
  }
  return groups;
}

/**
 * 특정 로봇이 «최상위 경로(/)» 를 읽을 수 있는지.
 * robots.txt 는 가장 긴 경로 규칙이 이긴다.
 */
export function botAllowed(groups: RobotsGroup[], botId: string): boolean {
  const id = botId.toLowerCase();
  let group = groups.find((g) => g.agents.includes(id));
  if (!group) group = groups.find((g) => g.agents.includes("*"));
  if (!group) return true; // 규칙이 없으면 허용이 기본값이다

  let best: RobotsRule | null = null;
  for (const r of group.rules) {
    if (r.path === "") continue; // 빈 Disallow 는 «전체 허용»이라는 뜻이다
    // 우리는 첫 화면만 본다. 하위 경로에만 걸린 규칙은 건너뛴다.
    if (!"/".startsWith(r.path.replace(/\*.*$/, ""))) continue;
    if (!best || r.path.length > best.path.length) best = r;
  }
  if (!best) return true;
  return best.type === "allow";
}

// ── 태그 읽기 ───────────────────────────────────────────
// 전용 HTML 파서를 안 쓴다. 여기서 보는 태그는 형태가 단순해서 정규식으로 충분하고,
// 의존성을 늘리지 않아야 어디서든 그대로 돌릴 수 있다.
export const rx = {
  jsonld: /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  title: /<title[^>]*>([\s\S]*?)<\/title>/i,
  desc: /<meta[^>]+name\s*=\s*["']description["'][^>]*>/i,
  content: /content\s*=\s*["']([^"']*)["']/i,
  canon: /<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i,
  href: /href\s*=\s*["']([^"']*)["']/i,
  lang: /<html[^>]+lang\s*=\s*["']([^"']*)["']/i,
  h: /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi,
  list: /<(ul|ol|table)[\s>]/gi,
  time: /<time[^>]+datetime\s*=/i,
  a: /<a[^>]+href\s*=\s*["']([^"']+)["']/gi,
};

/** 태그를 걷어내고 사람이 읽는 글만 남긴다. 본문 분량을 재는 데 쓴다. */
export function stripTags(html: string): string {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type JsonLdNode = Record<string, unknown> & { __invalid?: boolean };

/** 구조화 데이터(JSON-LD)를 긁어 온다. 깨진 것은 __invalid 로 표시해 점수에 반영한다. */
export function readJsonLd(html: string): JsonLdNode[] {
  const out: JsonLdNode[] = [];
  let m: RegExpExecArray | null;
  rx.jsonld.lastIndex = 0;

  while ((m = rx.jsonld.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const o of list) {
        if (o && Array.isArray(o["@graph"])) out.push(...(o["@graph"] as JsonLdNode[]));
        else if (o) out.push(o as JsonLdNode);
      }
    } catch {
      out.push({ __invalid: true });
    }
  }
  return out;
}

export function typesOf(nodes: JsonLdNode[]): Set<string> {
  const s = new Set<string>();
  for (const n of nodes) {
    const t = n?.["@type"];
    const list = Array.isArray(t) ? t : [t];
    for (const x of list) if (x) s.add(String(x));
  }
  return s;
}

export type Heading = { level: number; text: string };

export function headings(html: string): Heading[] {
  const out: Heading[] = [];
  let m: RegExpExecArray | null;
  rx.h.lastIndex = 0;
  while ((m = rx.h.exec(html))) out.push({ level: Number(m[1]), text: stripTags(m[2]) });
  return out;
}

/** 태그를 찾아 그 안의 속성 하나를 꺼낸다. */
export function attr(html: string, tagRx: RegExp, attrRx: RegExp): string | null {
  const t = html.match(tagRx);
  if (!t) return null;
  const a = t[0].match(attrRx);
  return a ? a[1].trim() : null;
}

export function countMatches(html: string, re: RegExp): number {
  re.lastIndex = 0;
  let n = 0;
  while (re.exec(html)) n++;
  return n;
}

// ── 2026-08-31 새 기준에서 추가된 재료들 ───────────────────
// 근거: 구글 공식 문서(developers.google.com/search/docs/appearance/ai-features) 는
//   「AI 기능에 나오려고 새 파일이나 마크업을 만들 필요는 없다. 특별한 schema.org 도 없다」
//   「색인되고 스니펫으로 보일 자격이 있어야 한다」 두 가지를 말한다.
// 그래서 «색인 자격»을 새로 재고, llms.txt·스키마의 몸집은 줄였다.

export const rx2 = {
  robotsMeta: /<meta[^>]+name\s*=\s*["']robots["'][^>]*>/i,
  viewport: /<meta[^>]+name\s*=\s*["']viewport["'][^>]*>/i,
  script: /<script[\s>]/gi,
  img: /<img[\s>]/gi,
  imgAlt: /<img[^>]+alt\s*=\s*["'][^"']+["']/gi,
  ogTitle: /<meta[^>]+property\s*=\s*["']og:(title|description)["'][^>]*>/i,
};

/** 색인을 막고 있나. 본문 meta 와 응답 헤더 «둘 다» 본다. */
export function isNoIndex(html: string, headers?: Record<string, string>): boolean {
  const tag = html.match(rx2.robotsMeta)?.[0] ?? "";
  const content = tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
  const header = headers?.["x-robots-tag"] ?? "";
  return /noindex/i.test(content) || /noindex/i.test(header);
}

/**
 * 서버가 내주는 HTML 에 «사람이 읽을 글»이 얼마나 들어 있나.
 *
 * 이게 이번 개편의 핵심이다. 자바스크립트로 그리는 사이트는 서버 HTML 에
 * 「로딩 중...」만 있고 내용이 없다. AI 수집 로봇 상당수는 자바스크립트를 실행하지 않아
 * 그 빈 화면을 그대로 받는다. 그런데 옛 기준은 이걸 「본문 짧음·목록 없음·소제목 없음…」
 * 처럼 낱개 실패 열두 개로 흩어 놓아서, 진짜 원인 하나가 파묻혔다.
 */
export function renderShape(html: string) {
  const text = stripTags(html);
  const scripts = countMatches(html, rx2.script);
  // 글이 거의 없는데 script 만 잔뜩이면 «자바스크립트가 그리는 사이트»다.
  const jsOnly = text.length < 500 && scripts >= 3;
  return { textLength: text.length, scripts, jsOnly };
}

/** 링크를 안팎으로 나눠 센다. */
export function countLinks(html: string, hostname: string) {
  rx.a.lastIndex = 0;
  let m: RegExpExecArray | null;
  let internal = 0;
  let external = 0;
  while ((m = rx.a.exec(html))) {
    const href = m[1];
    if (/^https?:\/\//i.test(href)) {
      if (href.includes(hostname)) internal++;
      else external++;
    } else if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
      internal++;
    }
  }
  return { internal, external };
}

/** 최근 날짜가 보이나. AI 는 「언제 기준인지」모르는 글을 잘 안 쓴다. */
export function freshness(html: string, nodes: JsonLdNode[]) {
  const iso = html.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/g) ?? [];
  const ko = html.match(/\b(20\d{2})[.\s년]\s*(\d{1,2})[.\s월]/g) ?? [];
  const fromLd = nodes
    .map((n) => String(n?.dateModified ?? n?.datePublished ?? ""))
    .filter(Boolean);
  const all = [...iso, ...fromLd.map((d) => d.slice(0, 10))].filter((s) => /^20\d{2}-\d{2}-\d{2}$/.test(s));
  const years = all.map((s) => Number(s.slice(0, 4)));
  const newest = years.length ? Math.max(...years) : null;
  return { hasAnyDate: iso.length + ko.length + fromLd.length > 0, newestYear: newest };
}

// ── 2026-09-01 v4: GEO 논문(KDD 2024)이 «실측»한 것들을 잰다 ──────────
// Aggarwal 외, GEO: Generative Engine Optimization, KDD 2024 (arXiv 2311.09735)
// 질의 1만 건으로 9가지 방법을 재 봤더니 —
//   직접 인용문 +41% · 통계 +33% · 문장 다듬기 +29% · 출처 인용 +28%
//   전문용어 +18% · 쉽게쓰기 +14% · 권위어조 +12% · 특이단어 +6% · 키워드반복 −9%(해로움)
// 우리가 HTML 만 보고 잴 수 있는 것은 앞의 넷 중 셋과 마지막 하나다.

/** 브랜드 이름만 뽑는다. `geo.masstige.biz` · `masstige.io` 를 «같은 집»으로 보려는 것이다. */
export function baseName(hostname: string): string {
  const parts = hostname.toLowerCase().replace(/^www\./, "").split(".");
  if (parts.length < 2) return parts[0] ?? "";
  // co.kr · com.au 처럼 두 칸짜리 꼬리를 감안해 뒤에서 세 번째까지 본다
  const tail2 = parts.slice(-2).join(".");
  const twoPartSuffix = /^(co|or|ne|go|ac|pe|re|com|net|org|gov|edu)\.[a-z]{2}$/.test(tail2);
  return twoPartSuffix ? (parts[parts.length - 3] ?? "") : (parts[parts.length - 2] ?? "");
}

/**
 * 출처로 «칠 만한» 바깥 링크만 센다. (GEO 논문 「Cite Sources」 +28%)
 * 자기네 다른 도메인은 빼야 한다 — masstige.biz 가 masstige.io 를 걸어 둔 걸
 * 「출처 5개」로 세던 것이 v2 의 잘못이었다.
 */
export function citationLinks(html: string, hostname: string) {
  const mine = baseName(hostname);
  rx.a.lastIndex = 0;
  let m: RegExpExecArray | null;
  const domains = new Set<string>();
  while ((m = rx.a.exec(html))) {
    const href = m[1];
    if (!/^https?:\/\//i.test(href)) continue;
    try {
      const h = new URL(href).hostname;
      if (baseName(h) !== mine) domains.add(baseName(h));
    } catch {
      // 주소 형식이 아니면 버린다
    }
  }
  // <cite> 태그도 출처 표시다
  const citeTags = countMatches(html, /<cite[\s>]/gi);

  // 글자로만 적은 출처도 센다.
  //
  // 2026-09-01 에 고쳤다. 태그만 보다가 이런 걸 0점 처리하고 있었다 —
  //   「(2017년 대한안과학회 제118회 학술대회 발표, 300명 대상)」
  //   「(출처: … V-TORIC ICL 3개월 경과관찰 230안 임상결과)」
  // 누가 봐도 출처인데 «태그가 아니라서» 못 봤다. 잘 쓴 글에 0점을 주면
  // 손님을 엉뚱한 데로 보낸다. GEO 논문의 「Cite Sources」도 원래 «글»을 다룬 것이지
  // HTML 태그를 다룬 것이 아니다.
  //
  // 다만 아무 괄호나 세면 안 되므로, «출처를 뜻하는 낱말»이 든 것만 센다.
  const text = stripTags(html);
  const textual = new Set(
    (text.match(/[(（][^)）]{6,80}[)）]/g) ?? [])
      .filter((s) =>
        /(출처|자료|근거|발표|학회|논문|저널|심포지엄|보고서|조사|통계|임상|기준|고시|백서|연구)/.test(s),
      )
      // 같은 출처를 여러 번 적어도 한 번으로 센다
      .map((s) => s.replace(/\s+/g, "")),
  );

  return { domains: domains.size, citeTags, textual: textual.size };
}

/**
 * 직접 인용문. GEO 논문에서 가장 크게 오른 항목(+41%).
 *
 * ⚠ 2026-09-01 에 고쳤다. 처음에는 `<blockquote>`·`<q>`·`<cite>` «태그»만 셌는데,
 * 그건 근거와 어긋난다. GEO 논문은 «글»을 고쳐서 쟀다 — 문단에 따옴표 인용을 넣어
 * 노출이 +41% 올랐다는 실험이지, 태그를 붙여서 오른 게 아니다.
 * 조사해 봐도 `<cite>` 태그가 AEO 에 도움이 된다는 자료는 하나도 없었다.
 * (LLM 파싱에 중요하다고 언급되는 시맨틱 태그는 main·article·section·제목 계층이다)
 *
 * 그래서 «따옴표로 옮긴 글»을 직접 센다. 태그는 그중 한 가지 방식일 뿐이다.
 */
export function quotations(html: string) {
  const tagged =
    countMatches(html, /<blockquote[\s>]/gi) + countMatches(html, /<q[\s>]/gi);

  // 따옴표로 감싼 «문장급» 글. 낱말 하나를 강조한 따옴표는 인용이 아니므로 길이로 거른다.
  const text = stripTags(html);
  const quoted = new Set(
    (text.match(/[“"「『]([^”"」』]{15,300})[”"」』]/g) ?? []).map((s) => s.replace(/\s+/g, "")),
  );

  return tagged + quoted.size;
}

/**
 * 통계·숫자. GEO 논문 +33%.
 * 「30%」「1,143건」「5억 원」처럼 «단위가 붙은 수»만 센다.
 * 전화번호·날짜만 잔뜩 있는 걸 통계로 착각하지 않으려는 것이다.
 */
export function statistics(text: string) {
  const withUnit = text.match(/\d[\d,.]*\s*(%|퍼센트|배|명|건·?|건|개|원|달러|위|점|년\s*대비|만|억|조)/g) ?? [];
  // 전화번호 형태는 통계가 아니다
  const phones = text.match(/\b\d{2,4}-\d{3,4}-\d{4}\b/g) ?? [];
  return Math.max(0, withUnit.length - phones.length);
}

/**
 * 키워드 반복. GEO 논문에서 «유일하게 점수를 깎은» 방법(−9%).
 * 한 낱말이 본문에서 지나치게 반복되면 표시한다. 흔한 조사·접속어는 뺀다.
 */
const STOP = new Set([
  "그리고","하지만","그러나","때문에","합니다","있습니다","입니다","됩니다","위해","통해",
  "대한","대해","이런","저런","그런","것을","것이","수가","수는","등의","및","the","and","for","with","this","that",
]);
export function keywordStuffing(text: string) {
  const words = (text.match(/[가-힣A-Za-z]{2,}/g) ?? []).map((w) => w.toLowerCase());
  if (words.length < 200) return { worst: null as string | null, ratio: 0 };
  const freq = new Map<string, number>();
  for (const w of words) {
    if (STOP.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  let worst: string | null = null;
  let top = 0;
  for (const [w, n] of freq) if (n > top) { top = n; worst = w; }
  return { worst, ratio: top / words.length };
}

// ── v5: AEO(답변으로 뽑히기)를 제대로 재는 재료들 ──────────────────
// 근거 — 스니펫 연구:
//   · 문단형 스니펫은 40~60단어(약 45단어가 가장 흔함). 40 미만은 잘리고 60 초과는 «…»로 끊긴다.
//   · 목록형 스니펫에서 8개 넘는 항목은 발견되지 않았다 — 8이 상한으로 보인다.
//   · 표형 스니펫은 3~4열 × 5~10행.
//   · 「질문을 소제목으로 던지고 첫 문장에서 바로 답한다」가 공통 형태다.

/** 한글은 띄어쓰기 단위가 영어 단어와 달라, «어절»로 세고 영어는 낱말로 센다. */
export function wordCount(s: string): number {
  return (s.trim().match(/\S+/g) ?? []).length;
}

/**
 * 소제목 바로 뒤에 «직답 문단»이 오는가.
 * AEO 의 핵심 형태다 — 묻고 곧바로 답해야 스니펫으로 뽑힌다.
 * 40~60어절이면 좋다(연구값). 그보다 짧으면 답이 안 되고, 길면 잘린다.
 */
export function directAnswers(html: string) {
  // 소제목과 그 «바로 다음» 문단을 짝지어 본다.
  const rx = /<h([2-3])[^>]*>([\s\S]*?)<\/h\1>\s*(?:<[^>]+>\s*)*?<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  let 짝 = 0;
  let 알맞음 = 0;
  while ((m = rx.exec(html))) {
    짝++;
    const n = wordCount(stripTags(m[3]));
    if (n >= 40 && n <= 60) 알맞음++;
  }
  return { pairs: 짝, good: 알맞음 };
}

/**
 * 「X는 ~입니다」 같은 정의형 문장.
 * AI 가 「OO가 뭐야?」에 답할 때 그대로 가져가는 형태다.
 */
export function definitions(text: string) {
  const pat = /[가-힣A-Za-z0-9][가-힣A-Za-z0-9\s]{1,30}(?:은|는|이란|란)\s+[^.!?]{10,120}(?:입니다|이다|을 말합니다|를 말합니다|을 뜻합니다|를 뜻합니다)/g;
  return new Set((text.match(pat) ?? []).map((s) => s.replace(/\s+/g, ""))).size;
}

/** 목록과 표를 «항목 수까지» 본다. 스니펫에 뽑히려면 크기가 맞아야 한다. */
export function listsAndTables(html: string) {
  const 목록: number[] = [];
  const ulol = /<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = ulol.exec(html))) 목록.push(countMatches(m[2], /<li[\s>]/gi));

  const 표: { cols: number; rows: number }[] = [];
  const tb = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  while ((m = tb.exec(html))) {
    const rows = countMatches(m[1], /<tr[\s>]/gi);
    const firstRow = m[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/i)?.[1] ?? "";
    표.push({ cols: countMatches(firstRow, /<t[hd][\s>]/gi), rows });
  }
  // 연구값: 목록은 2~8개, 표는 3~4열 × 5~10행일 때 스니펫으로 잘 뽑힌다.
  return {
    lists: 목록.length,
    goodLists: 목록.filter((n) => n >= 2 && n <= 8).length,
    tables: 표.length,
    goodTables: 표.filter((t) => t.cols >= 3 && t.cols <= 4 && t.rows >= 5 && t.rows <= 10).length,
  };
}

/** 그림에 설명글(alt)이 붙어 있나. 로봇은 그림 안 글자를 못 읽는다. */
export function imageAlts(html: string) {
  const total = countMatches(html, rx2.img);
  const withAlt = countMatches(html, rx2.imgAlt);
  return { total, withAlt };
}
