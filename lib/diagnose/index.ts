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
import * as K from "./checks";
import { maxOf, CRITERIA } from "./criteria";
import { fixFor, detectFramework } from "./fixes";
import type { FixContext } from "./fixes";
import { AXIS_WEIGHT, CRITERIA_VERSION } from "./types";
import type { Axis, BotRow, DiagnoseItem, DiagnoseResult, Headline } from "./types";

export type { Axis, BotRow, DiagnoseItem, DiagnoseResult, Headline } from "./types";
export { AXIS_LABEL, AXIS_HELP, AXIS_WEIGHT, CRITERIA_VERSION } from "./types";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const pct = (got: number, max: number) => (max ? Math.round((got / max) * 100) : 0);

function grade(total: number): DiagnoseResult["grade"] {
  if (total >= 85) return "A";
  if (total >= 70) return "B";
  if (total >= 50) return "C";
  return "D";
}

export async function diagnose(input: string): Promise<DiagnoseResult> {
  const url = normalize(input);
  const origin = url.origin;

  const [page, robots, sitemap] = await Promise.all([
    safeFetch(url, { accept: "text/html" }),
    safeFetch(origin + "/robots.txt").catch(() => ({ ok: false, body: "" })),
    safeFetch(origin + "/sitemap.xml").catch(() => ({ ok: false, body: "" })),
  ]);

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

  return {
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
}
