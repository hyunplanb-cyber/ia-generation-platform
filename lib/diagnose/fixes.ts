// 고치는 법 — 항목 20개 전부.
//
// ⛔ AI를 부르지 않는다. 이미 «재 놓은 값»을 틀에 끼워 넣을 뿐이다.
//    그래서 손님이 몇 명이 눌러도 앤트로픽 요금은 0원이다(AGENTS.md 결제 경로 규칙).
//
// 규칙이 할 수 있는 것과 없는 것을 정직하게 갈랐다.
//   · 할 수 있는 것 — 붙여 쓸 태그를 «주소·날짜까지 채워서» 만들기, 막고 있는 줄을 짚기,
//     프레임워크를 알아내 그에 맞는 방법을 일러 주기
//   · 못 하는 것 — 제목·설명문·질문형 소제목의 «완성된 문장»을 대신 써 주기.
//     이 셋은 형태와 길이까지만 일러 주고, 문장은 손님 몫으로 남긴다. 글쓰기는 규칙의 일이 아니다.
//
// 이 파일에는 node: 모듈을 import 하지 않는다.

import type { Fix } from "./types";

export type FixContext = {
  url: URL;
  robotsBody: string;
  blockedBots: string[];
  titleLen: number;
  descLen: number;
  internal: number;
  external: number;
  subs: number;
  questions: number;
  textLength: number;
  jsOnly: boolean;
  robotPreview: string;
  noindexWhere: "meta" | "header" | null;
  ms: number;
  hops: number;
  framework: string | null;
  today: string;
  quotes: number;
  stats: number;
  citeTags: number;
  stuffWord: string | null;
  stuffRatio: number;
  pairs: number;
  goodPairs: number;
  tables: number;
  goodTables: number;
  definitions: number;
  imgTotal: number;
  imgAlt: number;
};

/** 어떤 틀로 만든 사이트인지 알아낸다. 처방을 그 도구에 맞게 바꾸려는 것이다. */
export function detectFramework(html: string): string | null {
  if (/\/_next\//.test(html)) return "Next.js";
  if (/__NUXT__|\/_nuxt\//.test(html)) return "Nuxt";
  if (/ng-version=/.test(html)) return "Angular";
  if (/wp-content|wp-includes/.test(html)) return "WordPress";
  if (/cdn\.shopify\.com/.test(html)) return "Shopify";
  if (/data-svelte|\/_app\/immutable\//.test(html)) return "SvelteKit";
  return null;
}

/** 서버 렌더링으로 바꾸는 법 — 쓰는 도구마다 다르다. */
function ssrAdvice(fw: string | null): string {
  switch (fw) {
    case "Next.js":
      return "이 페이지를 서버 컴포넌트로 두거나 SSR·정적 생성으로 미리 그려 보내세요. 파일 맨 위에 'use client' 가 있으면 그것부터 내려야 합니다.";
    case "Nuxt":
      return "`ssr: true`(기본값)인지 확인하고, 내용을 `<ClientOnly>` 밖으로 꺼내세요.";
    case "SvelteKit":
      return "해당 라우트에서 `export const ssr = false` 를 지우고, 데이터를 `+page.server.ts` 의 load 로 옮기세요.";
    case "Angular":
      return "Angular SSR(구 Universal)을 켜서 첫 화면을 서버에서 그려 보내세요.";
    default:
      return "본문을 서버에서 그려 보내도록(SSR 또는 정적 생성) 바꾸세요. 첫 응답 HTML 안에 글이 들어 있어야 합니다.";
  }
}

/** robots.txt 에서 «전체를 막는» 줄을 찾아 몇 번째 줄인지 짚는다. */
export function blockingLines(robotsBody: string): { line: number; text: string }[] {
  return robotsBody
    .split(/\r?\n/)
    .map((l, i) => ({ line: i + 1, text: l.trim() }))
    .filter((x) => /^disallow\s*:\s*\/\s*$/i.test(x.text));
}

const BOT_IDS: Record<string, string> = {
  "ChatGPT 학습": "GPTBot",
  "ChatGPT 검색": "OAI-SearchBot",
  Claude: "ClaudeBot",
  Perplexity: "PerplexityBot",
  "Gemini 학습": "Google-Extended",
  "Copilot · Bing": "Bingbot",
  네이버: "Yeti",
};

/**
 * 자바스크립트로 그리는 사이트에서 «내용 항목»의 0 은 「없다」가 아니라 「안 보인다」다.
 *
 * qa.iloveeye.com 이 그 예다 — 화면에는 「99% 개선」「6만 6천 건」이 잘 적혀 있는데
 * 서버가 내주는 원본은 61자뿐이라 우리 검사에 0 으로 잡힌다.
 * 그 상태에서 「통계를 8개 넣으세요」라고 하면 «이미 있는 걸 또 넣으라»는 엉뚱한 소리가 된다.
 * 그래서 이때는 처방을 통째로 갈아 끼운다.
 *
 * ⛔ 다만 «이 화면»의 이야기로만 적어라. 2026-09-01 에 여기서 「이 사이트는」이라고 썼다가
 *    엉뚱한 처방을 냈다. 같은 사이트의 사이트맵에 든 779장을 열어 보니 홈만 비어 있고
 *    나머지는 서버가 글을 3,800자씩 그대로 내주고 있었다. 「서버 렌더링을 고치라」는 말이
 *    그 손님에게는 «멀쩡한 것을 뜯어고치라»는 뜻이 될 뻔했다.
 *    사이트 전체가 어떤지는 index.ts 의 사이트 훑기가 따로 말한다.
 */
const 내용항목 = new Set(["quotes", "stats", "sources", "questions", "fresh", "direct", "lists", "tables", "definitions"]);

function 안보임(id: string, label: string, c: FixContext): Fix {
  return {
    what: `0 으로 잡혔지만 «없다»는 뜻이 아닙니다. 이 «화면»은 자바스크립트로 그려서 서버가 내주는 원본이 ${c.textLength}자뿐입니다. 화면에 잘 적어 두셨더라도 AI 봇은 그것을 받지 못합니다.`,
    // 조사를 붙이면 「통계·숫자을(를)」처럼 어색해진다. 낱말을 문장 끝에 두지 않는다.
    how:
      `새로 쓰기 전에 이 화면의 «서버 렌더링»부터 보세요 — 지금 0 으로 잡힌 것은 ${label} 자체가 아니라 «로봇이 이 화면에서 받는 것»입니다. ` +
      `그것만 고치면 이미 써 두신 내용이 그대로 살아납니다. ` +
      `사이트의 다른 쪽은 멀쩡할 수 있습니다 — 위의 「사이트 훑어보기」에서 어느 쪽이 보이고 어느 쪽이 안 보이는지 먼저 확인하세요.`,
    verify: `curl -s ${c.url.href} | grep "화면에 보이는 문구 아무거나"  → 그 문구가 나와야 로봇도 봅니다`,
  };
}

export function fixFor(id: string, c: FixContext): Fix | null {
  // 로봇이 화면을 못 받는 상태라면, 내용 항목은 「무엇을 쓰라」가 아니라 「먼저 보이게 하라」다.
  if (c.jsOnly && 내용항목.has(id)) {
    const 이름: Record<string, string> = {
      quotes: "인용문", stats: "통계·숫자", sources: "출처",
      questions: "질문형 소제목", fresh: "날짜", direct: "직답 문단",
      lists: "목록", tables: "표", definitions: "정의문",
    };
    return 안보임(id, 이름[id] ?? "내용", c);
  }

  switch (id) {
    // ── 검색 자격 ────────────────────────────────────
    case "noindex":
      return {
        what: `${c.noindexWhere === "header" ? "응답 헤더 X-Robots-Tag" : "페이지의 <meta name=\"robots\">"} 에 noindex 가 들어 있습니다.`,
        how: "그 noindex 를 지우세요. 이게 있으면 다른 걸 아무리 고쳐도 검색과 AI 답변에 나올 수 없습니다. 개발·테스트 서버 설정이 그대로 올라간 경우가 많습니다.",
        verify: `curl -sI ${c.url.href} | grep -i x-robots-tag  → 아무것도 안 나와야 정상입니다`,
      };

    case "https":
      return {
        what: "http 로 접속됩니다.",
        how: "인증서를 붙이고 http 로 들어온 요청을 https 로 넘기세요(301). 무료 인증서(Let's Encrypt)로도 됩니다.",
      };

    case "title":
      return {
        what: `제목이 ${c.titleLen ? `${c.titleLen}자입니다` : "없습니다"}. 권장은 10~60자입니다.`,
        how: "「회사·서비스 이름 + 무엇을 하는 곳인지 + (지역이나 분야)」 순서로 쓰면 대체로 맞습니다. AI가 이 사이트를 부를 때 쓰는 이름이라, 회사 이름만 덩그러니 두지 마세요.",
        snippet: `<title>여기에 제목 — ${c.url.hostname}</title>`,
      };

    case "desc":
      return {
        what: `설명문이 ${c.descLen ? `${c.descLen}자입니다` : "없습니다"}. 권장은 50~160자입니다.`,
        how: "「누구를 위해 무엇을 해 주는 곳인지」를 한두 문장으로 씁니다. AI가 사이트를 한 줄로 소개할 때 이 문장을 자주 그대로 가져다 씁니다.",
        snippet: `<meta name="description" content="여기에 50~160자 설명" />`,
      };

    case "canonical":
      return {
        what: "대표 주소 표시가 없습니다.",
        how: "페이지마다 «그 페이지의 정식 주소»를 적어 주세요. 같은 내용이 여러 주소로 열리면 점수가 나뉩니다.",
        // 물음표 뒤 꼬리(?utm_source=… 같은 것)는 떼고 알려 준다.
        // 그대로 두면 광고 링크 주소가 대표 주소로 박히는 사고가 난다.
        snippet: `<link rel="canonical" href="${c.url.origin}${c.url.pathname}" />`,
      };

    // ── AEO — 답변으로 뽑히기 위한 «모양» ──────────────
    case "direct":
      return {
        what:
          c.pairs === 0
            ? "소제목 바로 뒤에 설명 문단이 오는 곳이 없습니다."
            : `소제목과 바로 뒤 문단이 ${c.pairs}짝 있는데, 그중 알맞은 길이는 ${c.goodPairs}짝입니다.`,
        how:
          "소제목으로 «묻고» 바로 다음 문단에서 «답을 끝내» 주세요. 그 문단이 통째로 뽑혀 갑니다. " +
          "연구에서 뽑혀 간 문단은 40~60단어(우리말로 40~60어절)였고 45단어가 가장 흔했습니다. " +
          "짧으면 답이 안 되고, 길면 뒤가 잘려 나갑니다. 자세한 설명은 그다음 문단부터 쓰세요. " +
          "이런 짝이 3개면 만점입니다.",
        snippet: [
          "<h2>OO는 얼마나 걸리나요?</h2>",
          "<p>보통 3일 걸립니다. 급하면 24시간 안에도 됩니다. (…이 문단을 40~60어절로)</p>",
          "<p>여기부터 자세한 설명을 이어 씁니다.</p>",
        ].join("\n"),
      };

    case "tables":
      return {
        what: c.tables === 0 ? "표가 없습니다." : `표가 ${c.tables}개인데 알맞은 크기는 ${c.goodTables}개입니다.`,
        how:
          "가격·사양·비교처럼 «줄 세워 보여 줄 것»은 표로 두면 그대로 뽑혀 갑니다. " +
          "연구에서 뽑혀 간 표는 3~4칸 × 5~10줄이었습니다. 너무 크면 안 쓰이고, 2칸짜리는 목록이 낫습니다. " +
          "그런 표가 하나만 있어도 만점입니다.",
        snippet: [
          "구분      | 기본형    | 고급형",
          "가격      | OO만 원   | OO만 원",
          "기간      | O일       | O일",
          "포함 범위  | …         | …",
          "(맨 윗줄은 제목칸으로 두고, 5~10줄로 만드세요)",
        ].join("\n"),
      };

    case "definitions":
      return {
        what: `「~는 ~입니다」 형태의 문장이 ${c.definitions}개입니다.`,
        how:
          "AI가 「OO가 뭐예요?」에 답할 때 이 형태를 그대로 가져갑니다. " +
          "우리 서비스·업종·핵심 용어를 «한 문장으로 못박아» 두세요. 돌려 말하지 말고 단정형으로 씁니다. " +
          "3개면 만점입니다.",
        snippet: [
          "OO는 OO을 OO해 주는 서비스입니다.",
          "OO란 OO를 뜻합니다.",
          "OO는 OO와 달리 OO를 말합니다.",
        ].join("\n"),
      };

    case "alt":
      return {
        what: `그림 ${c.imgTotal}개 중 ${c.imgAlt}개에만 설명글이 붙어 있습니다.`,
        how:
          "로봇은 그림 «안»의 글자를 읽지 못합니다. 가격표나 안내문을 그림으로만 올려 두셨다면 " +
          "로봇에게는 그 내용이 아예 없는 것과 같습니다. 그림마다 「무엇을 담은 그림인지」를 적어 두세요. " +
          "장식용 그림은 빈 설명(alt=\"\")으로 두면 됩니다.",
        snippet: `<img src="…" alt="여기에 이 그림이 무엇을 보여 주는지" />`,
      };

    case "mobile":
      return {
        what: "모바일 대응 표시가 없습니다.",
        how: "<head> 안에 아래 한 줄을 넣으세요. 구글은 모바일 화면을 기준으로 색인합니다.",
        snippet: `<meta name="viewport" content="width=device-width, initial-scale=1" />`,
      };

    case "sitemap":
      return {
        what: `${c.url.origin}/sitemap.xml 을 찾지 못했습니다.`,
        how:
          c.framework === "Next.js"
            ? "app/sitemap.ts 를 만들면 Next.js 가 알아서 만들어 줍니다."
            : c.framework === "WordPress"
              ? "Yoast SEO 같은 플러그인을 켜면 자동으로 만들어 줍니다."
              : "페이지 목록을 담은 sitemap.xml 을 만들어 최상위에 두세요.",
        snippet: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${c.url.origin}/</loc><lastmod>${c.today}</lastmod></url>\n</urlset>`,
      };

    case "robots":
      return {
        what: `${c.url.origin}/robots.txt 를 찾지 못했습니다.`,
        how: "없어도 기본은 허용이지만, 적어 두면 sitemap 위치까지 알려 줄 수 있어 안전합니다. 아래 내용으로 최상위에 두세요.",
        snippet: `User-agent: *\nAllow: /\n\nSitemap: ${c.url.origin}/sitemap.xml`,
      };

    // ── AI 접근 ─────────────────────────────────────
    case "bots": {
      const lines = blockingLines(c.robotsBody);
      const ids = c.blockedBots.map((b) => BOT_IDS[b]).filter(Boolean);
      return {
        what: `${c.blockedBots.join(", ")} 가 robots.txt 에 막혀 있습니다.${
          lines.length ? ` ${lines.map((l) => l.line).join(", ")}번째 줄이 전체를 막고 있습니다: "${lines[0].text}"` : ""
        }`,
        how: "막힌 로봇을 따로 열어 주세요. 아래를 robots.txt 에 그대로 붙여 넣으시면 됩니다.",
        snippet: (ids.length ? ids : ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"])
          .map((b) => `User-agent: ${b}\nAllow: /`)
          .join("\n\n"),
        verify: `${c.url.origin}/robots.txt 를 열어 위 줄이 보이면 됩니다`,
      };
    }

    case "server-text":
      return c.jsOnly
        ? {
            what: `서버가 내주는 원본 HTML 에 글이 ${c.textLength}자뿐입니다${c.framework ? ` (${c.framework} 로 만든 사이트입니다)` : ""}. AI 로봇이 실제로 받은 내용은 이게 전부입니다 — "${c.robotPreview}"`,
            how: ssrAdvice(c.framework),
            verify: `curl -s ${c.url.href} | grep "화면에 보이는 문구 아무거나"  → 그 문구가 나와야 로봇도 봅니다`,
          }
        : {
            what: `서버가 내주는 본문이 ${c.textLength.toLocaleString("ko-KR")}자입니다. 2,000자쯤 되면 넉넉합니다.`,
            how: "AI가 답으로 옮길 만한 설명·사례·문답을 본문에 더 채우세요. 이미지 안에 든 글자는 로봇이 읽지 못합니다.",
          };


    case "speed":
      return {
        what: `첫 응답까지 ${(c.ms / 1000).toFixed(1)}초 걸렸습니다.`,
        how: "서버 응답(TTFB)을 줄이세요. 캐시를 켜거나, 첫 화면에서 무거운 조회를 걷어내면 대개 해결됩니다.",
      };


    // ── 인용 재료 (GEO 논문이 실측한 것들) ──────────────
    case "quotes":
      return {
        what: `따옴표로 옮긴 인용문이 ${c.quotes}개입니다.`,
        how:
          "논문이 잰 것은 「믿을 만한 출처(credible sources)의 문장을 그대로 옮기기」입니다 — 노출 +41%로 아홉 방법 중 가장 컸습니다. " +
          "학회 발표문·논문 결론·기관 고시·공식 지침의 «문장 자체»를 따옴표로 옮기고 어디 것인지 밝히세요. " +
          "요약해 풀어 쓰면 효과가 없습니다 — 원문 그대로여야 AI가 통째로 집어 갑니다. " +
          "⚠ 저희 검사는 따옴표가 있는지만 봅니다. 그 안이 학회 발표문인지 사내 잡담인지는 «구분하지 못합니다» — " +
          "따옴표만 늘리면 점수는 오르지만 논문이 잰 것과는 다릅니다. " +
          "태그는 없어도 됩니다. `<blockquote>` 같은 태그가 AI 인용을 늘린다는 근거는 찾지 못했습니다.",
        // ⛔ 업종을 특정하는 예시를 넣지 마라. 이 파일에서 두 번이나 그 실수를 했다 —
        //    「시술 비용 30만원」(8/31) 과 「고도 난시 99% 개선」(9/1). 둘 다 특정 손님 사이트를
        //    보면서 쓰다가 박힌 것이고, 다른 업종 손님 화면에 그대로 떠서 「왜 남의 내용이 나오지」가 됐다.
        //    처방 예시는 «어느 업종에 놓아도 말이 되는» 틀이어야 한다.
        snippet: [
          "이 화면 한 장에 아래 «형태»로 3개면 만점입니다.",
          "",
          `고객 말   → "3주 만에 문의가 두 배로 늘었습니다" — OO상사 김OO 대표`,
          `기관 발표 → OO학회는 "여기에 발표문 문장 그대로"라고 밝혔습니다 (2026년 제O회)`,
          `고시·지침 → OO부 고시 제2026-OO호는 "여기에 조문 그대로"라고 정하고 있습니다`,
        ].join("\n"),
      };

    case "stats": {
      const 더 = Math.max(0, 8 - c.stats);
      return {
        what: `단위가 붙은 수치가 ${c.stats}개입니다. 만점은 8개이니 ${더}개 더 필요합니다.`,
        how:
          "⛔ 없는 숫자를 «만들어 넣지» 마세요. 이 항목은 「숫자를 늘려라」가 아니라 " +
          "「이미 아는 사실을 검증할 수 있는 형태로 적어라」입니다. " +
          "대부분의 사이트는 사실을 갖고 있는데 두루뭉술하게 씁니다 — " +
          "「많은 고객」은 「고객사 120곳」으로, 「빠른 배송」은 「평균 3일」로, " +
          "「저렴한 가격」은 「30만 원부터」로 바꾸면 됩니다. 같은 사실인데 인용할 수 있게 됩니다. " +
          "GEO 논문 +33%. 자기 사업 숫자(처리 건수·기간·비용·만족도)가 가장 좋습니다 — " +
          "남의 통계를 인용하면 AI가 그쪽을 출처로 답니다. " +
          "이 화면 한 장에 아래 형태로 " + 더 + "개만 더 넣으면 만점입니다. " +
          "⚠ 정말 내세울 숫자가 없는 쪽(브랜드 소개·비전 같은)이라면 낮은 점수가 «맞습니다» — " +
          "AI가 그 쪽에서 인용할 것이 없다는 뜻이니, 숫자를 지어내지 말고 사실이 담긴 쪽을 따로 만드세요.",
        // 숫자는 «형태를 보여 주는 예시»다. 손님이 그대로 베끼면 거짓말이 되므로,
        // 첫 줄에서 「우리 숫자로 바꾸라」고 반드시 못박는다.
        snippet: [
          "아래 «형태»로 적으세요. 숫자는 OO 자리에 우리 것을 넣습니다.",
          "",
          "누적 실적  → 1,000건 이상 (2026년 자체 집계)",
          "기간·속도  → 평균 3일 · 최단 24시간",
          "만족도    → 4.9/5 (후기 320건)",
          "가격      → 30만 원부터 (부가세 별도)",
          "규모      → 고객사 120곳 · 업종 14개",
        ].join("\n"),
      };
    }

    case "sources":
      return {
        what: `출처로 볼 만한 것이 ${c.external + c.citeTags}건입니다. 자기네 다른 도메인은 세지 않았습니다.`,
        how: "숫자와 주장 뒤에 «어디서 나온 것인지»를 글로 적으세요. 기관명·연도·표본 수까지 적으면 충분합니다. GEO 논문 +28%. 웹에 원문이 있으면 링크를 걸면 더 좋지만 «필수는 아닙니다» — 논문이 잰 것은 글이지 링크가 아닙니다. 다만 남의 통계를 인용하면 AI가 그쪽을 출처로 답니다. 자사 실적·조사 숫자를 쓰는 편이 우리에게 유리합니다.",
        snippet: [
          "숫자 뒤에 괄호로 «어디서 나왔는지»를 붙이면 됩니다. 4곳이면 만점입니다.",
          "",
          "자체 집계  → 1,000건 이상 (2026년 OO 자체 집계)",
          "기관 발표  → OO% 개선 (2026년 OO학회 발표, 표본 OOO건)",
          "공공 자료  → 시장 규모 O조 원 (2026년 OO부 보고서)",
          "제3자 조사 → 만족도 4.9/5 (OO 리뷰 320건 조사)",
        ].join("\n"),
      };

    case "stuffing":
      return {
        what: c.stuffWord
          ? `「${c.stuffWord}」가 본문 낱말의 ${(c.stuffRatio * 100).toFixed(1)}% 를 차지합니다.`
          : "본문이 짧아 재지 못했습니다.",
        how: "같은 낱말을 억지로 반복하면 «오히려» 인용이 줄어듭니다 — GEO 논문에서 유일하게 점수가 깎인 방법입니다(−9%). 대명사·동의어로 바꾸고, 검색어를 끼워 넣으려고 늘린 문장은 지우세요. 3% 아래면 넉넉합니다.",
      };

    // ── 이해 ─────────────────────────────────────────
    case "questions":
      return {
        what: c.subs
          ? `소제목 ${c.subs}개 중 질문형이 ${c.questions}개입니다.`
          : "h2·h3 소제목이 없습니다.",
        how: "손님이 실제로 묻는 말을 그대로 소제목으로 올리세요. 「가격 안내」보다 「비용은 얼마인가요?」가 AI에게 훨씬 잘 잡힙니다. 그리고 소제목 «바로 아래 첫 문장»에서 답을 끝내 주세요 — AI는 그 문장을 통째로 가져갑니다.",
        // 업종을 특정하는 예시를 넣지 마라. 「시술 비용은 30만원부터」처럼 적어 뒀더니
        // 안과가 아닌 사이트에서 엉뚱한 소리가 됐다(2026-08-31). 다른 처방들처럼 «채워 넣는 틀»로 둔다.
        snippet: `<h2>여기에 손님이 자주 묻는 질문</h2>\n<p>여기에 한 문장으로 끝나는 답. 자세한 설명은 그다음 문단에.</p>`,
      };



    case "fresh":
      return {
        what: "언제 기준인지 알 수 있는 날짜가 없습니다.",
        how: "글마다 작성일이나 「마지막 수정일」을 눈에 보이게 적으세요. 1년 넘게 안 고친 글은 AI가 인용을 꺼립니다.",
        snippet: `<time datetime="${c.today}">${c.today} 기준</time>`,
      };

    case "contact":
      return {
        what: "전화번호·이메일·주소를 찾지 못했습니다.",
        how: "누구인지 확인되지 않는 곳은 AI가 인용을 꺼립니다. 바닥글에 눈에 보이게 적고, 아래 구조화 데이터도 함께 넣으면 확실합니다.",
        snippet: `<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"Organization",\n "name":"회사 이름","url":"${c.url.origin}",\n "telephone":"02-000-0000","address":"서울시 ..."}\n</script>`,
      };


    case "schema":
      return {
        what: "구조화 데이터가 없습니다. (필수는 아니지만 있으면 유리합니다)",
        how: "문답이 있는 페이지라면 FAQPage 를, 회사 소개라면 Organization 을 넣으세요. 아래 틀의 «여기에» 부분만 바꾸시면 됩니다.",
        snippet: `<script type="application/ld+json">\n{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[\n  {"@type":"Question","name":"여기에 질문",\n   "acceptedAnswer":{"@type":"Answer","text":"여기에 답변"}}\n]}\n</script>`,
        verify: "search.google.com/test/rich-results 에 주소를 넣으면 제대로 읽히는지 확인됩니다",
      };

    default:
      return null;
  }
}
