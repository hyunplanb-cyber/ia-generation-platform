// AI 노출 진단 본체 — 2026-09-01 «v4» 기준.
//
// ── v4 에서 무엇이 바뀌었나 ──────────────────────────────────
// 첫 판(그라운드AI)은 개발용 초안이었고, v2·v3 은 구글 문서에 맞춘 판이었다.
// v4 는 «실측된 연구»를 앞세운다.
//
//   GEO 논문(Aggarwal 외, KDD 2024) — 질의 1만 건으로 9가지 방법의 노출 변화를 쟀다:
//     직접인용 +41% · 통계 +33% · 문장다듬기 +29% · 출처인용 +28%
//     전문용어 +18% · 쉽게쓰기 +14% · 권위어조 +12% · 특이단어 +6% · 키워드반복 −9%
//   SIGIR 2026(Vishwakarma 외) — LLM 6종 · 대조실험 25만 2천 건:
//     주제적합성·목록위치가 가장 크고, 최신 시각 표기가 일관되게 도움. «형식 변경은 미미».
//
// 그래서 —
//   · 「인용 재료」 축을 새로 만들어 가장 무겁게(40%) 뒀다. 직접인용·통계·출처인용·최신날짜·키워드반복.
//   · 「목록·표」(15점)를 뺐다. SIGIR 이 형식은 영향이 미미하다고 했고 GEO 9가지에도 없다.
//   · 「내부 링크·리다이렉트」(20점)를 뺐다. 두 연구 어디에도 측정 항목이 아니다.
//   · v3 에서 뺐던 「출처 인용」을 되살렸다 — GEO 논문이 +28% 로 «측정한» 항목이었다.
//     다만 제대로 잰다: 자기네 다른 도메인(masstige.biz ↔ masstige.io)은 출처로 세지 않는다.
//
// 배점 숫자는 여기에 없다. 전부 `criteria.ts` 에 있고 공개 페이지(/diagnose/criteria)가
// 같은 표를 읽는다. 「화면에 적힌 배점」과 「실제 채점」이 어긋날 수 없게 하려는 짜임이다.
//
// ⛔ 이 파일은 AI를 부르지 않는다. 페이지 소스만 보고 규칙으로 잰다 — 종량제 잔액과 무관하다.

import { safeFetch, normalize } from "./fetch";
import type { FetchResult } from "./fetch";
import * as K from "./checks";
import { maxOf, CRITERIA } from "./criteria";
import { fixFor, detectFramework } from "./fixes";
import type { FixContext } from "./fixes";
import { AXIS_WEIGHT, CRITERIA_VERSION } from "./types";
import type { Axis, BotRow, DiagnoseItem, DiagnoseResult, Headline, SitePage, SiteScan } from "./types";

export type { Axis, BotRow, DiagnoseItem, DiagnoseResult, Headline, SitePage, SiteScan } from "./types";
export { AXIS_LABEL, AXIS_HELP, AXIS_WEIGHT, CRITERIA_VERSION } from "./types";

/** 입력한 쪽을 포함해 최대 몇 장을 보나. 늘리면 손님이 그만큼 더 기다린다. */
export const SITE_SAMPLE = 10;
/** 한꺼번에 몇 장씩 가져오나. 남의 서버를 한 번에 열 번 두드리면 차단당한다. */
const SITE_CONCURRENCY = 3;

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pct = (got: number, max: number) => (max ? Math.round((got / max) * 100) : 0);

function grade(total: number): DiagnoseResult["grade"] {
  if (total >= 85) return "A";
  if (total >= 70) return "B";
  if (total >= 50) return "C";
  return "D";
}

/** 이미 가져다 둔 것들. 사이트를 훑을 때 robots·sitemap 을 열 번 다시 받지 않으려고 넘긴다. */
type Prefetched = {
  page: FetchResult;
  robots: { ok: boolean; body: string };
  sitemap: { ok: boolean; body: string };
};

export async function diagnose(
  input: string,
  opts: {
    /** 이미 가져온 것을 재활용한다. */
    pre?: Prefetched;
    /** 사이트맵을 타고 다른 쪽도 볼까. 훑기 안에서 다시 훑지 않도록 false 로 부른다. */
    withSite?: boolean;
  } = {},
): Promise<DiagnoseResult> {
  const url = normalize(input);
  const origin = url.origin;

  const { page, robots, sitemap } =
    opts.pre ??
    (await (async () => {
      const [p, r, s] = await Promise.all([
        safeFetch(url, { accept: "text/html" }),
        safeFetch(origin + "/robots.txt").catch(() => ({ ok: false, body: "" })),
        safeFetch(origin + "/sitemap.xml").catch(() => ({ ok: false, body: "" })),
      ]);
      return { page: p, robots: r, sitemap: s } as Prefetched;
    })());

  if (!page.ok || !page.body) {
    throw new Error("페이지를 가져오지 못했습니다 (응답 " + page.status + ")");
  }

  const html = page.body;
  const shape = K.renderShape(html);
  const text = K.stripTags(html);
  const nodes = K.readJsonLd(html);
  const types = K.typesOf(nodes);
  const hs = K.headings(html);
  const links = K.countLinks(html, url.hostname); // 점수엔 안 쓴다. 처방 문구에만 쓴다.
  const fresh = K.freshness(html, nodes);
  const cites = K.citationLinks(html, url.hostname);
  const quoteCount = K.quotations(html);
  const statCount = K.statistics(text);
  const stuffing = K.keywordStuffing(text);
  const items: DiagnoseItem[] = [];

  // 만점은 «배점표(criteria.ts)»에서 찾아 온다. 여기에 숫자를 적지 않는 것이 요점이다 —
  // 공개 페이지와 채점기가 다른 숫자를 말하는 일이 구조적으로 불가능해진다.
  // why 는 배점표(criteria.ts)에 있고 화면이 그걸 직접 읽는다. 여기서 또 적지 않는다.
  const add = (axis: Axis, id: string, label: string, got: number, note: string) =>
    items.push({ axis, id, label, got: Math.round(got), max: maxOf(id), note });

  const groups = robots.ok ? K.parseRobots(robots.body) : [];
  const botRows: BotRow[] = K.BOTS.map((b) => ({
    ...b, allowed: robots.ok ? K.botAllowed(groups, b.id) : true,
  }));
  const botMaxSum = K.BOTS.reduce((s, b) => s + b.weight, 0);
  const botGot = botRows.reduce((s, b) => s + (b.allowed ? b.weight : 0), 0);
  const blocked = botRows.filter((b) => !b.allowed).map((b) => b.label);

  // ══ SEO — 검색에 나오나 (34%) ═══════════════════════════
  const noindex = K.isNoIndex(html, page.headers);
  add("seo", "noindex", "검색 허용", noindex ? 0 : maxOf("noindex"),
    noindex ? "「검색에 넣지 마세요」로 되어 있습니다" : "정상");

  const titleRaw = html.match(K.rx.title);
  const title = titleRaw ? K.stripTags(titleRaw[1]) : "";
  add("seo", "title", "쪽 제목",
    title.length >= 10 && title.length <= 60 ? maxOf("title") : title.length ? maxOf("title") / 2 : 0,
    title.length ? `${title.length}자` : "없음");

  const desc = K.attr(html, K.rx.desc, K.rx.content) || "";
  add("seo", "desc", "쪽 설명문",
    desc.length >= 50 && desc.length <= 160 ? maxOf("desc") : desc.length ? maxOf("desc") / 2 : 0,
    desc.length ? `${desc.length}자` : "없음");

  const viewport = K.rx2.viewport.test(html);
  add("seo", "mobile", "휴대폰 화면 대응", viewport ? maxOf("mobile") : 0, viewport ? "있음" : "없음");

  const https = url.protocol === "https:";
  add("seo", "https", "보안 접속(https)", https ? maxOf("https") : 0, https ? "적용" : "미적용");

  const canon = K.attr(html, K.rx.canon, K.rx.href);
  add("seo", "canonical", "대표 주소 지정", canon ? maxOf("canonical") : 0, canon ? "있음" : "없음");

  const smOk = !!sitemap.ok && /<(urlset|sitemapindex)/i.test(sitemap.body || "");
  add("seo", "sitemap", "쪽 목록 파일", smOk ? maxOf("sitemap") : 0, smOk ? "있음" : "없음");

  add("seo", "robots", "로봇 안내문", robots.ok ? maxOf("robots") : 0, robots.ok ? "있음" : "없음");

  const fast = (page.ms ?? 9999) < 3000;
  add("seo", "speed", "여는 속도", fast ? maxOf("speed") : maxOf("speed") / 2,
    `${((page.ms ?? 0) / 1000).toFixed(1)}초`);

  const alts = K.imageAlts(html);
  add("seo", "alt", "그림 설명글",
    alts.total === 0 ? maxOf("alt") : (alts.withAlt / alts.total) * maxOf("alt"),
    alts.total === 0 ? "그림 없음" : `${alts.withAlt}/${alts.total}개에 설명 있음`);

  // ══ AEO — 답변으로 뽑히나 (33%) ═════════════════════════
  const subs = hs.filter((h) => h.level >= 2 && h.level <= 3);
  const qs = subs.filter((h) => /[?？]\s*$/.test(h.text)).length;
  add("aeo", "questions", "질문형 소제목",
    clamp(subs.length ? (qs / subs.length) * maxOf("questions") : 0, 0, maxOf("questions")),
    subs.length ? `소제목 ${subs.length}개 중 ${qs}개가 질문형` : "소제목 없음");

  const direct = K.directAnswers(html);
  add("aeo", "direct", "질문 바로 뒤 «직답»",
    clamp((direct.good / 3) * maxOf("direct"), 0, maxOf("direct")),
    direct.pairs ? `소제목+문단 ${direct.pairs}짝 중 ${direct.good}짝이 알맞은 길이` : "소제목 뒤 문단이 없음");

  const lt = K.listsAndTables(html);
  add("aeo", "lists", "번호·점 목록",
    clamp((lt.goodLists / 3) * maxOf("lists"), 0, maxOf("lists")),
    lt.lists ? `목록 ${lt.lists}개 중 ${lt.goodLists}개가 알맞은 크기` : "목록 없음");

  add("aeo", "tables", "비교 표", lt.goodTables > 0 ? maxOf("tables") : 0,
    lt.tables ? `표 ${lt.tables}개 중 ${lt.goodTables}개가 알맞은 크기` : "표 없음");

  const defs = K.definitions(text);
  add("aeo", "definitions", "「~는 ~입니다」 정의문",
    clamp((defs / 3) * maxOf("definitions"), 0, maxOf("definitions")), `${defs}개`);

  const hasLd = nodes.length > 0 && !nodes.every((n) => n.__invalid);
  const hasFaq = types.has("FAQPage") || types.has("QAPage");
  add("aeo", "schema", "질문·답 표시(FAQ 태그)", (hasLd ? 4 : 0) + (hasFaq ? 6 : 0),
    !hasLd ? "없음" : hasFaq ? "문답 표시까지 있음" : "있음(문답 표시는 없음)");

  // ══ GEO — AI가 인용하나 (33%) ═══════════════════════════
  const t = shape.textLength;
  const stMax = maxOf("server-text");
  add("geo", "server-text", "로봇이 받는 글",
    shape.jsOnly ? 0 : clamp(((t - 200) / 1800) * stMax, 0, stMax),
    shape.jsOnly ? `${t}자뿐 — 화면을 자바스크립트가 그립니다` : `${t.toLocaleString("ko-KR")}자`);

  add("geo", "bots", "AI 로봇 허용", (botGot / botMaxSum) * maxOf("bots"),
    blocked.length ? "막힘: " + blocked.join(", ") : "주요 로봇 모두 허용");

  add("geo", "quotes", "따옴표 인용문",
    clamp((quoteCount / 3) * maxOf("quotes"), 0, maxOf("quotes")), `${quoteCount}개`);

  add("geo", "stats", "구체적인 숫자",
    clamp((statCount / 8) * maxOf("stats"), 0, maxOf("stats")), `${statCount}개`);

  const citeScore = cites.domains + cites.citeTags + cites.textual;
  add("geo", "sources", "출처 표기",
    clamp((citeScore / 4) * maxOf("sources"), 0, maxOf("sources")),
    citeScore ? `${citeScore}건` : "없음");

  const thisYear = new Date().getFullYear();
  const recent = fresh.newestYear != null && thisYear - fresh.newestYear <= 1;
  add("geo", "fresh", "언제 기준인지",
    recent ? maxOf("fresh") : fresh.hasAnyDate ? maxOf("fresh") / 2 : 0,
    fresh.newestYear ? `${fresh.newestYear}년` : fresh.hasAnyDate ? "날짜는 있음" : "없음");

  const r = stuffing.ratio;
  const sfMax = maxOf("stuffing");
  add("geo", "stuffing", "같은 말 반복 안 함",
    stuffing.worst === null ? sfMax / 2
      : r <= 0.04 ? sfMax : r >= 0.08 ? 0 : sfMax * (1 - (r - 0.04) / 0.04),
    stuffing.worst ? `「${stuffing.worst}」 ${(r * 100).toFixed(1)}%` : "글이 짧아 못 잼");

  // ══ 고치는 법 붙이기 ═══════════════════════════════════
  const ctx: FixContext = {
    url,
    robotsBody: robots.body || "",
    blockedBots: blocked,
    titleLen: title.length,
    descLen: desc.length,
    internal: links.internal,
    external: cites.domains,
    subs: subs.length,
    questions: qs,
    textLength: shape.textLength,
    jsOnly: shape.jsOnly,
    robotPreview: text.slice(0, 90),
    noindexWhere: noindex ? (/noindex/i.test(page.headers?.["x-robots-tag"] ?? "") ? "header" : "meta") : null,
    ms: page.ms ?? 0,
    hops: page.hops ?? 0,
    framework: detectFramework(html),
    today: new Date().toISOString().slice(0, 10),
    quotes: quoteCount,
    stats: statCount,
    citeTags: cites.citeTags,
    stuffWord: stuffing.worst,
    stuffRatio: stuffing.ratio,
    pairs: direct.pairs,
    goodPairs: direct.good,
    tables: lt.tables,
    goodTables: lt.goodTables,
    definitions: defs,
    imgTotal: alts.total,
    imgAlt: alts.withAlt,
  };

  for (const it of items) {
    if (it.got >= it.max) continue;
    const f = fixFor(it.id, ctx);
    if (f) it.fix = f;
    it.lost = Math.round((it.max - it.got) * AXIS_WEIGHT[it.axis] * 10) / 10;
  }

  // ══ 합산 ══════════════════════════════════════════════
  const axes = {} as DiagnoseResult["axes"];
  for (const ax of ["seo", "aeo", "geo"] as const) {
    const list = items.filter((i) => i.axis === ax);
    const got = list.reduce((s, i) => s + i.got, 0);
    const max = list.reduce((s, i) => s + i.max, 0);
    axes[ax] = { got, max, score: pct(got, max) };
  }
  // 기술/내용 갈래별 합계 — 축과 별개로, 「사이트마다 달라지는 것」이 무엇인지 보여 준다.
  const kindOf = new Map(CRITERIA.map((c) => [c.id, c.kind]));
  const kinds = { 기술: { got: 0, max: 0, score: 0 }, 내용: { got: 0, max: 0, score: 0 } };
  for (const it of items) {
    const k = kindOf.get(it.id);
    if (!k) continue;
    kinds[k].got += it.got;
    kinds[k].max += it.max;
  }
  for (const k of ["기술", "내용"] as const) kinds[k].score = pct(kinds[k].got, kinds[k].max);

  const total = Math.round(
    axes.seo.score * AXIS_WEIGHT.seo +
      axes.aeo.score * AXIS_WEIGHT.aeo +
      axes.geo.score * AXIS_WEIGHT.geo,
  );

  // 점수보다 «먼저» 말해야 하는 한 가지.
  let headline: Headline = null;
  if (noindex) {
    headline = {
      tone: "danger",
      title: "검색에서 통째로 빠져 있습니다",
      body: "이 페이지에 noindex 가 걸려 있습니다. 구글이 색인하지 않으므로 AI 답변에도 나올 수 없습니다. 다른 항목을 고치기 전에 이것부터 푸셔야 합니다.",
    };
  } else if (shape.jsOnly) {
    const blind = botRows.filter((b) => b.allowed && b.rendersJs === false).map((b) => b.label);
    const sighted = botRows.filter((b) => b.allowed && b.rendersJs === true).map((b) => b.label);
    headline = {
      tone: "danger",
      title: "로봇이 받는 화면이 거의 비어 있습니다",
      body:
        `사람이 보는 화면은 자바스크립트가 그립니다. 그런데 서버가 내주는 원본에는 글이 ${shape.textLength}자뿐입니다. ` +
        (blind.length ? `${blind.join(", ")} 는 자바스크립트를 실행하지 않아 이 빈 화면을 그대로 받습니다. ` : "") +
        (sighted.length ? `${sighted.join(", ")} 만 내용을 볼 수 있습니다. ` : "") +
        "아래 낮은 점수 대부분이 이 한 가지에서 나옵니다.",
    };
  } else if (blocked.length) {
    headline = {
      tone: "warn",
      title: `robots.txt 가 ${blocked.length}개 AI를 막고 있습니다`,
      body: `${blocked.join(", ")} 가 이 사이트를 읽지 못합니다. 내용을 아무리 잘 갖춰도 이 AI들의 답에는 나올 수 없습니다.`,
    };
  }

  const result: DiagnoseResult = {
    url: page.url,
    checkedAt: new Date().toISOString(),
    version: CRITERIA_VERSION,
    total,
    grade: grade(total),
    axes,
    items,
    bots: botRows,
    headline,
    jsRendered: shape.jsOnly,
    kinds,
  };

  // 사이트맵을 타고 다른 쪽도 함께 본다. 여기서 나온 사실이 위의 머리글을 뒤집기도 한다.
  if (opts.withSite !== false) {
    const site = await scanSite(url, page.url, robots, sitemap, shape.jsOnly, shape.textLength);
    result.site = site;
    if (site.headline) result.headline = site.headline;
  }

  return result;
}

// ══ 사이트 훑기 ═══════════════════════════════════════════
//
// 왜 필요한가 — 홈 화면 한 장은 그 사이트의 «내용»을 대표하지 못한다. 홈은 대개
// 사진과 배너라 인용문도 통계도 없다. 그런데 우리는 그걸 「이 사이트는 인용할 재료가
// 없다」로 읽어 버렸다. 사이트맵이 있으면 로봇은 그 목록을 타고 안쪽 쪽들을 읽는다.
// 그러니 우리도 그렇게 봐야 같은 것을 재는 것이다.

/** 사이트맵 XML 에서 주소만 뽑는다. 목록의 목록(sitemapindex)이면 첫 묶음을 따라간다. */
async function sitemapLocs(body: string): Promise<string[]> {
  const locs = [...body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  if (!/<sitemapindex/i.test(body)) return locs;

  // 목록의 목록이면 주소가 «또 다른 사이트맵»이다. 첫 묶음 하나만 따라간다 —
  // 다 따라가면 큰 사이트에서 수십 번을 더 가져오게 된다.
  const first = locs[0];
  if (!first) return [];
  try {
    const child = await safeFetch(first);
    if (!child.ok || !child.body) return [];
    return [...child.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  } catch {
    return [];
  }
}

/**
 * 볼 쪽을 고른다.
 *
 * 앞에서부터 열 장을 집으면 안 된다 — 사이트맵은 대개 같은 종류가 뭉쳐 있어서
 * 열 장이 전부 판박이가 된다(실제로 어느 사이트는 앞 열 장이 모두 `/qa/…` 였다).
 * 그래서 ① 주소의 첫 칸별로 묶고 ② 묶음을 돌아가며 ③ 묶음 안에서는 고르게 벌려 집는다.
 */
function pickUrls(all: string[], entryHref: string, want: number): string[] {
  const seen = new Set([entryHref, entryHref.replace(/\/$/, "")]);
  const groups = new Map<string, string[]>();

  for (const raw of all) {
    if (seen.has(raw) || seen.has(raw.replace(/\/$/, ""))) continue;
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      continue;
    }
    const key = u.pathname.split("/").filter(Boolean)[0] ?? "";
    const list = groups.get(key) ?? [];
    list.push(u.href);
    groups.set(key, list);
  }

  const picked: string[] = [];
  const keys = [...groups.keys()];
  // 묶음 안에서 고르게 벌린 순서를 미리 만든다.
  const spread = new Map<string, string[]>();
  for (const k of keys) {
    const list = groups.get(k)!;
    const step = Math.max(1, Math.floor(list.length / want));
    const out: string[] = [];
    for (let i = 0; i < list.length && out.length < want; i += step) out.push(list[i]);
    spread.set(k, out);
  }
  for (let round = 0; picked.length < want; round++) {
    let added = false;
    for (const k of keys) {
      const list = spread.get(k)!;
      if (round < list.length && picked.length < want) {
        picked.push(list[round]);
        added = true;
      }
    }
    if (!added) break;
  }
  return picked;
}

/** 같은 쪽인지 본다. 사이트맵은 `www` 를 빼거나 끝의 `/` 를 흘리는 일이 잦다. */
function samePage(a: string, b: string): boolean {
  const key = (s: string) => {
    try {
      const u = new URL(s);
      return u.host.replace(/^www\./, "") + u.pathname.replace(/\/$/, "");
    } catch {
      return s;
    }
  };
  return key(a) === key(b);
}

async function scanSite(
  entry: URL,
  entryFinalUrl: string,
  robots: { ok: boolean; body: string },
  sitemap: { ok: boolean; body: string },
  entryJsOnly: boolean,
  entryTextLength: number,
): Promise<SiteScan> {
  const empty: SiteScan = { sitemapCount: null, pages: [], best: null, headline: null };
  if (!sitemap.ok || !sitemap.body) return empty;

  const locs = await sitemapLocs(sitemap.body);
  if (!locs.length) return empty;

  // 한 장쯤은 실패하거나 입력한 쪽과 같은 곳으로 넘어간다. 그만큼 여유를 두고 고른다.
  const picked = pickUrls(locs, entry.href, SITE_SAMPLE + 1);
  const want = SITE_SAMPLE - 1;
  const pages: SitePage[] = [];

  for (let i = 0; i < picked.length && pages.length < want; i += SITE_CONCURRENCY) {
    const chunk = picked.slice(i, i + SITE_CONCURRENCY);
    const got = await Promise.all(
      chunk.map(async (href): Promise<SitePage | null> => {
        try {
          const p = await safeFetch(href, { accept: "text/html" });
          if (!p.ok || !p.body) return null;
          // 주소가 달라 보여도 결국 같은 쪽으로 넘어가는 일이 있다(www 유무·리다이렉트).
          // 그때 입력한 쪽이 목록에 한 번 더 나오면 손님이 「왜 홈이 두 번이지」 한다.
          if (samePage(p.url, entryFinalUrl)) return null;
          const r = await diagnose(href, { pre: { page: p, robots, sitemap }, withSite: false });
          const shape = K.renderShape(p.body);
          return {
            url: p.url,
            path: new URL(p.url).pathname || "/",
            total: r.total,
            aeo: r.axes.aeo.score,
            geo: r.axes.geo.score,
            content: r.kinds.내용.score,
            jsRendered: shape.jsOnly,
            textLength: shape.textLength,
          };
        } catch {
          return null; // 한 장이 실패해도 나머지는 계속 본다.
        }
      }),
    );
    for (const g of got) if (g && pages.length < want) pages.push(g);
  }

  const best = pages.length
    ? pages.reduce((a, b) => (b.content > a.content ? b : a))
    : null;

  return {
    sitemapCount: locs.length,
    pages,
    best,
    headline: siteHeadline(pages, locs.length, entryJsOnly, entryTextLength),
  };
}

/** 한 장만 봐서는 할 수 없는 말. 있을 때만 돌려준다. */
function siteHeadline(
  pages: SitePage[],
  sitemapCount: number,
  entryJsOnly: boolean,
  entryTextLength: number,
): Headline {
  if (!pages.length) return null;
  const solid = pages.filter((p) => !p.jsRendered);

  // ① 이 화면만 비어 있고 안쪽은 멀쩡한 경우 — 가장 중요한 바로잡기다.
  if (entryJsOnly && solid.length) {
    const most = solid.reduce((a, b) => (b.textLength > a.textLength ? b : a));
    return {
      tone: "warn",
      title: `비어 있는 건 이 화면이고, 사이트는 아닙니다`,
      body:
        `입력하신 쪽은 자바스크립트로 그려서 서버가 내주는 원본에 글이 ${entryTextLength}자뿐입니다. ` +
        `그래서 위 점수가 낮게 나왔습니다. 그런데 사이트맵에 적힌 ${sitemapCount.toLocaleString()}개 주소 중 ` +
        `${pages.length}장을 열어 보니 ${solid.length}장은 서버가 글을 그대로 내주고 있었습니다` +
        `(가장 많은 쪽이 ${most.textLength.toLocaleString()}자). ` +
        `AI 로봇은 사이트맵을 타고 그 쪽들을 읽습니다. ` +
        `그러니 «서버 렌더링을 통째로 고쳐야 한다»는 뜻이 아닙니다 — 이 화면 한 장의 이야기입니다.`,
    };
  }

  // ② 반대로 이 화면은 멀쩡한데 안쪽이 다 비어 있는 경우.
  if (!entryJsOnly && solid.length === 0) {
    return {
      tone: "danger",
      title: `이 화면 말고 안쪽 ${pages.length}장이 로봇에게 비어 있습니다`,
      body:
        `입력하신 쪽은 글이 보입니다. 그런데 사이트맵에서 골라 열어 본 ${pages.length}장은 ` +
        `모두 자바스크립트로 그려서 서버 원본이 비어 있습니다. ` +
        `내용이 실제로 담긴 쪽들이 AI에게 안 보이는 상태라, 이쪽을 먼저 고치는 편이 이득이 큽니다.`,
    };
  }

  return null;
}
