// 배점표 — «한 곳». 채점기(index.ts)와 공개 페이지가 둘 다 이 파일을 읽는다.
//
// 배점을 화면에 손으로 옮겨 적지 마라. 반드시 어긋난다.
// (무료 샘플 페이지에서 화면 수를 손으로 적어 뒀다가 15→16 으로 늘었을 때 제목만 옛 숫자로 남은 적이 있다)
//
// ══ v5 (2026-09-01) — GEO · AEO · SEO 를 «따로» 잰다 ═══════════════
// 셋은 목표가 다르고, 근거로 삼는 연구도 다르다. 한 덩어리로 재면 무엇을 고쳐야 할지 안 보인다.
//
//   SEO — 검색 «순위»에 오르기.        근거: 구글 공식 문서
//   AEO — 「답」으로 뽑히기.            근거: 스니펫 연구(40~60단어 · 목록 8개 이하 · 표 3~4열×5~10행)
//   GEO — AI 답변의 «출처»로 쓰이기.    근거: GEO 논문(KDD 2024) · Vercel 5억 건 실측
//
// ⛔ 이 파일에는 node: 모듈을 import 하지 마라. 공개 페이지(브라우저)도 읽는다.
// ⛔ 손님이 읽을 글이다. 특정 업종·회사 내용을 넣지 마라 — `npx tsx 검수-진단문구.mts` 로 잡힌다.
// ⛔ 초보 사장님이 읽는다. 「canonical」「SSR」 같은 말을 설명 없이 쓰지 마라.

import type { Axis } from "./types";

export type Source = { label: string; url?: string };

/** 근거로 삼은 문서들. 항목마다 어느 것을 봤는지 가리킨다. */
export const SOURCES: Record<string, Source> = {
  geo: {
    label: "Aggarwal 외 — GEO: Generative Engine Optimization (KDD 2024 · 질의 1만 건으로 9가지 방법 실측)",
    url: "https://arxiv.org/abs/2311.09735",
  },
  sigir: {
    label: "Vishwakarma 외 — What Gets Cited: Competitive GEO in AI Answer Engines (SIGIR 2026 · LLM 6종 대조실험 252,000건)",
    url: "https://arxiv.org/abs/2605.25517",
  },
  google: {
    label: "Google Search Central — AI features and your website (2026-09 확인)",
    url: "https://developers.google.com/search/docs/appearance/ai-features",
  },
  vercel: {
    label: "Vercel · MERJ — The rise of the AI crawler (GPTBot 요청 5억 건 분석)",
    url: "https://vercel.com/blog/the-rise-of-the-ai-crawler",
  },
  snippet: {
    label: "Portent — Featured Snippet Length 연구 (문단 40~60단어 · 목록 8개 상한 · 표 3~4열×5~10행)",
    url: "https://portent.com/blog/seo/featured-snippet-display-lengths-study-portent.htm",
  },
  aeo: {
    label: "AirOps — AEO Audit Checklist: 48 Critical Factors",
    url: "https://www.airops.com/blog/aeo-audit-checklist",
  },
  ours: { label: "카페인컬러 자체 판단 — 근거 문서가 없어 우리가 정한 부분" },
};

/**
 * 갈래 — 이 항목이 «사이트마다 달라지는 것»인가.
 *   기술 = 누구나 갖출 수 있다. 업종·쪽 성격과 무관하다. 낮으면 그냥 «안 한 것»이다.
 *   내용 = 그 쪽에 «무엇을 썼는가»에 달렸다. 홈 화면은 대개 낮게 나온다.
 */
export type Kind = "기술" | "내용";

export type Criterion = {
  axis: Axis;
  kind: Kind;
  id: string;
  label: string;
  max: number;
  /** 왜 보는가 — 초보도 읽을 수 있는 말로. 실측 수치가 있으면 그대로 적는다. */
  why: string;
  /** 어떻게 재는가 — 만점 조건을 숨기지 않는다. */
  how: string;
  source: keyof typeof SOURCES;
};

export const CRITERIA: Criterion[] = [
  // ══════════ SEO — 검색에 나오나 (합 100 · 34%) ══════════
  {
    axis: "seo", kind: "기술", id: "noindex", label: "검색 허용", max: 30,
    why: "이 쪽이 「우리를 검색에 넣지 마세요」라고 구글에 말하고 있는지 봅니다. 그렇게 되어 있으면 다른 걸 아무리 잘해도 검색에도, AI 답변에도 나올 수 없습니다. 개발 중에 걸어 둔 설정이 그대로 올라간 경우가 많습니다.",
    how: "페이지 안의 `<meta name=\"robots\">` 와 서버 응답의 `X-Robots-Tag` 를 둘 다 봅니다. 둘 다 「noindex」가 없으면 만점.",
    source: "google",
  },
  {
    axis: "seo", kind: "기술", id: "title", label: "쪽 제목", max: 14,
    why: "검색 결과에 파란 글씨로 뜨는 그 제목입니다. AI가 이 사이트를 부를 때 쓰는 이름이기도 합니다.",
    how: "10~60자면 만점. 있지만 너무 짧거나 길면 절반, 없으면 0점.",
    source: "google",
  },
  {
    axis: "seo", kind: "기술", id: "desc", label: "쪽 설명문", max: 12,
    why: "검색 결과에서 제목 아래 뜨는 두세 줄입니다. AI가 사이트를 한 줄로 소개할 때도 이 문장을 자주 그대로 가져다 씁니다.",
    how: "50~160자면 만점. 있지만 길이가 벗어나면 절반, 없으면 0점.",
    source: "google",
  },
  {
    axis: "seo", kind: "기술", id: "mobile", label: "휴대폰 화면 대응", max: 8,
    why: "구글은 «휴대폰 화면»을 기준으로 검색 순위를 매깁니다. PC 화면만 맞춰 두면 손해입니다.",
    how: "`<meta name=\"viewport\">` 표시가 있으면 만점.",
    source: "google",
  },
  {
    axis: "seo", kind: "기술", id: "https", label: "보안 접속(https)", max: 6,
    why: "주소가 `https://` 로 시작해야 합니다. 안 그러면 브라우저가 「안전하지 않음」이라 표시하고 검색에서도 불리합니다.",
    how: "주소가 https 이면 만점.",
    source: "google",
  },
  {
    axis: "seo", kind: "기술", id: "canonical", label: "대표 주소 지정", max: 6,
    why: "같은 내용이 여러 주소로 열리면(www 있는 것/없는 것 등) 검색 점수가 갈라집니다. 「이게 정식 주소」라고 한 곳을 지정해 두는 표시입니다.",
    how: "`<link rel=\"canonical\">` 이 있으면 만점.",
    source: "google",
  },
  {
    axis: "seo", kind: "기술", id: "sitemap", label: "쪽 목록 파일", max: 8,
    why: "우리 사이트에 어떤 쪽들이 있는지 적어 둔 목록(sitemap.xml)입니다. 검색 로봇이 빠짐없이 찾아가게 도와줍니다.",
    how: "`/sitemap.xml` 이 열리고 안에 주소 목록이 들어 있으면 만점.",
    source: "google",
  },
  {
    axis: "seo", kind: "기술", id: "robots", label: "로봇 안내문", max: 4,
    why: "로봇에게 「여기는 봐도 되고 저기는 보지 마세요」를 알려 주는 파일(robots.txt)입니다. 쪽 목록 위치도 여기 적어 둘 수 있습니다.",
    how: "`/robots.txt` 가 열리면 만점.",
    source: "google",
  },
  {
    axis: "seo", kind: "기술", id: "speed", label: "여는 속도", max: 6,
    why: "AI 로봇은 1~5초만 기다리고 떠납니다. 기다려 주지도, 다시 오지도 않습니다.",
    how: "첫 응답이 3초 안에 오면 만점, 넘으면 절반.",
    source: "vercel",
  },
  {
    axis: "seo", kind: "기술", id: "alt", label: "그림 설명글", max: 6,
    why: "로봇은 그림 «안»의 글자를 읽지 못합니다. 그림마다 「이건 무슨 그림」이라고 적어 두면 그 내용도 검색에 잡힙니다.",
    how: "`<img>` 중 `alt` 설명이 붙은 비율만큼 줍니다. 그림이 없으면 만점.",
    source: "aeo",
  },

  // ══════════ AEO — 답변으로 뽑히나 (합 100 · 33%) ══════════
  {
    axis: "aeo", kind: "내용", id: "questions", label: "질문형 소제목", max: 24,
    why: "손님이 실제로 묻는 말을 그대로 소제목으로 올려 두면, AI와 검색이 그 대목을 «답»으로 집어 갑니다. 「가격 안내」보다 「비용은 얼마인가요?」가 훨씬 잘 잡힙니다.",
    how: "중간 제목(h2·h3) 중 물음표로 끝나는 비율만큼 줍니다. 전부 질문형이면 만점.",
    source: "aeo",
  },
  {
    axis: "aeo", kind: "내용", id: "direct", label: "질문 바로 뒤 «직답»", max: 24,
    why: "소제목으로 묻고 «바로 다음 문단»에서 답을 끝내야 그 문단이 통째로 뽑힙니다. 연구에서 뽑혀 간 문단은 40~60단어였고, 45단어가 가장 흔했습니다. 짧으면 답이 안 되고 길면 뒤가 잘립니다.",
    how: "소제목 바로 뒤 문단이 40~60어절인 짝을 셉니다. 그런 짝이 3개면 만점.",
    source: "snippet",
  },
  {
    axis: "aeo", kind: "내용", id: "lists", label: "번호·점 목록", max: 18,
    why: "「방법 3가지」「절차」 같은 것은 목록으로 두면 그대로 뽑힙니다. 연구에서 8개 넘는 목록이 뽑힌 사례는 없었습니다 — 너무 길면 안 쓰입니다.",
    how: "항목이 2~8개인 목록을 셉니다. 그런 목록이 3개면 만점.",
    source: "snippet",
  },
  {
    axis: "aeo", kind: "내용", id: "tables", label: "비교 표", max: 12,
    why: "가격·사양·비교는 표로 두면 그대로 뽑힙니다. 연구에서 뽑혀 간 표는 3~4칸 × 5~10줄이었습니다.",
    how: "3~4칸 × 5~10줄인 표가 하나라도 있으면 만점. 표가 아예 없으면 0점.",
    source: "snippet",
  },
  {
    axis: "aeo", kind: "내용", id: "definitions", label: "「~는 ~입니다」 정의문", max: 12,
    why: "AI가 「OO가 뭐예요?」에 답할 때 이 형태의 문장을 그대로 가져갑니다. 우리 서비스가 무엇인지 한 문장으로 못박아 두세요.",
    how: "「X는 ~입니다」「X란 ~를 말합니다」 형태의 문장을 셉니다. 3개면 만점.",
    source: "aeo",
  },
  {
    axis: "aeo", kind: "기술", id: "schema", label: "질문·답 표시(FAQ 태그)", max: 10,
    why: "문답을 기계가 알아보게 표시해 두는 것입니다. 구글은 「AI에 나오려고 꼭 넣을 필요는 없다」고 밝혔습니다. 그래서 없다고 크게 깎지 않고, 있으면 얹어 줍니다.",
    how: "구조화 데이터가 있으면 4점, 그중 문답(FAQPage/QAPage)이 있으면 +6점.",
    source: "google",
  },

  // ══════════ GEO — AI가 인용하나 (합 100 · 33%) ══════════
  {
    axis: "geo", kind: "기술", id: "server-text", label: "로봇이 받는 글", max: 30,
    why: "ChatGPT·Claude·Perplexity 로봇은 «자바스크립트를 실행하지 않습니다». Vercel 이 로봇 요청 5억 건을 뜯어봤는데 실행한 흔적이 0건이었습니다. 사람 화면에 아무리 잘 적어 두어도, 서버가 처음 내주는 글에 없으면 로봇은 못 봅니다.",
    how: "서버가 내주는 원본에서 글자 수를 셉니다. 200자에서 시작해 2,000자에 만점. 글이 500자 미만인데 자바스크립트가 셋 이상이면 「화면을 자바스크립트가 그린다」고 보고 0점을 주며 맨 위에 따로 알립니다.",
    source: "vercel",
  },
  {
    axis: "geo", kind: "기술", id: "bots", label: "AI 로봇 허용", max: 16,
    why: "robots.txt 로 막아 두면 그 AI 는 이 사이트를 아예 못 읽습니다. 모르고 막아 둔 곳이 많습니다.",
    how: "ChatGPT(GPTBot·OAI-SearchBot)·Claude·Perplexity·Gemini·Bing·네이버 일곱을 각각 보고, 중요도만큼 가중치를 둬 허용된 비율만큼 줍니다.",
    source: "ours",
  },
  {
    axis: "geo", kind: "내용", id: "quotes", label: "따옴표 인용문", max: 16,
    why: "실측 연구에서 «가장 크게» 오른 방법입니다 — AI 노출 +41%. 믿을 만한 곳의 말을 따옴표로 그대로 옮겨 두면 AI가 그 대목을 통째로 가져갑니다. 요약해 풀어 쓰면 효과가 없습니다.",
    how: "따옴표(\" \" · 「」 · 『』)로 감싼 15자 이상 문장을 셉니다. 3개면 만점. 태그는 없어도 됩니다 — 연구가 잰 것은 «글»이지 태그가 아닙니다.",
    source: "geo",
  },
  {
    axis: "geo", kind: "내용", id: "stats", label: "구체적인 숫자", max: 14,
    why: "실측 연구에서 AI 노출 +33%. 「빠릅니다」보다 「평균 3일」이 인용됩니다. ⛔ 없는 숫자를 지어내라는 뜻이 아닙니다 — 이미 아는 사실을 확인할 수 있는 형태로 적으라는 뜻입니다.",
    how: "「30%」「1,143건」「5억 원」처럼 단위가 붙은 수를 셉니다(전화번호는 뺍니다). 8개면 만점.",
    source: "geo",
  },
  {
    axis: "geo", kind: "내용", id: "sources", label: "출처 표기", max: 12,
    why: "실측 연구에서 AI 노출 +28%. 숫자와 주장 뒤에 「어디서 나온 것인지」를 적어 두면 AI가 더 믿고 인용합니다.",
    how: "셋을 함께 셉니다 — ① 「(2026년 OO학회 발표, 표본 OOO건)」처럼 글로 적은 출처 ② 다른 회사 사이트로 가는 링크 ③ `<cite>` 표시. 넷이면 만점. 자기네 다른 주소는 세지 않습니다 — 자기를 인용하는 건 근거가 아니라 자기 얘기입니다.",
    source: "geo",
  },
  {
    axis: "geo", kind: "내용", id: "fresh", label: "언제 기준인지", max: 6,
    why: "AI 6종을 25만 건 대조실험한 연구에서 «최신 날짜 표기»가 인용에 일관되게 도움이 됐습니다. 언제 쓴 글인지 모르면 AI가 인용을 꺼립니다.",
    how: "본문에서 가장 최근 연도를 찾습니다. 올해나 작년이면 만점, 날짜는 있지만 오래됐으면 절반, 없으면 0점.",
    source: "sigir",
  },
  {
    axis: "geo", kind: "내용", id: "stuffing", label: "같은 말 반복 안 함", max: 6,
    why: "같은 낱말을 억지로 반복하면 «오히려» AI 노출이 줄어듭니다 — 실측 연구에서 유일하게 점수가 깎인 방법입니다(−9%).",
    how: "가장 많이 나온 낱말의 비율을 봅니다. 4% 이하면 만점, 8% 이상이면 0점. 이 선은 실제로 재서 정했습니다 — 위키백과 1.1% · 구글 문서 3.2% · BBC 3.8%.",
    source: "geo",
  },
];

const MAX_BY_ID = new Map(CRITERIA.map((c) => [c.id, c.max]));
export function maxOf(id: string): number {
  const m = MAX_BY_ID.get(id);
  if (m == null) throw new Error(`배점표에 없는 항목입니다: ${id}`);
  return m;
}

/** 갈래별 만점(기술/내용). 총점 하나로는 안 보이는 것을 갈라 보여 주려는 것이다. */
export function kindMax(kind: Kind): number {
  return CRITERIA.filter((c) => c.kind === kind).reduce((s, c) => s + c.max, 0);
}

/** 축별 만점. 셋 다 100 이 되게 맞춰 뒀다. */
export function axisMax(axis: Axis): number {
  return CRITERIA.filter((c) => c.axis === axis).reduce((s, c) => s + c.max, 0);
}

/**
 * «일부러 빼거나 낮춘» 항목들.
 * 무엇을 넣었는지보다 무엇을 뺐는지가 기준의 정직함을 보여 준다.
 */
export const EXCLUDED = [
  {
    label: "llms.txt",
    verdict: "배점에서 뺐습니다 (0점)",
    reason:
      "구글이 공식 문서에서 「구글 검색은 그것을 쓰지 않는다. 넣어도 노출이나 순위에 도움도 해도 되지 않는다」고 밝혔습니다. 근거가 없는 항목으로 점수를 매기면 손님이 헛일을 하게 됩니다. 만들어 주겠다며 돈을 받는 곳이 있는데, 적어도 «점수가 오른다»는 말은 사실이 아닙니다.",
    source: "google" as const,
  },
  {
    label: "구조화 데이터를 «필수»로 보는 것",
    verdict: "필수에서 가산으로 낮췄습니다 (10점)",
    reason:
      "구글이 「AI 기능에 나오려고 따로 추가해야 할 특별한 표시는 없다」고 밝혔습니다. 있으면 유리한 것은 맞지만, 없다고 크게 깎을 근거는 없습니다. 스키마에 절반 넘는 점수를 주는 진단 도구가 있는데, 그 배점의 근거는 확인하지 못했습니다.",
    source: "google" as const,
  },
  {
    label: "글솜씨 — 문장 다듬기 · 전문 용어 · 쉽게 쓰기",
    verdict: "재고 싶지만 규칙으로는 못 잽니다",
    reason:
      "실측 연구에서 각각 +29% · +18% · +14% 로 «효과가 확인된» 방법들입니다. 그런데 글의 품질이라 페이지 소스만 보고는 잴 수 없습니다. 어설픈 대용품(문장 길이 따위)으로 점수를 매기면 손님을 엉뚱한 데로 보냅니다. 못 재는 것을 재는 척하지 않는 편이 낫습니다.",
    source: "geo" as const,
  },
  {
    label: "홈페이지 «밖»의 평판 — 뉴스·블로그·후기",
    verdict: "이 진단에서는 재지 않습니다",
    reason:
      "AI 는 우리가 우리를 설명한 글과, 남이 우리를 언급한 글을 함께 보고 판단합니다. 이 진단은 «홈페이지 안»만 봅니다. 점수가 높은데 AI 답변에 안 나온다면 바깥에 언급이 쌓이지 않은 것일 수 있습니다.",
    source: "ours" as const,
  },
  {
    label: "봇마다 자바스크립트를 읽는지",
    verdict: "점수에는 안 넣고, 화면에서 갈라 보여만 줍니다",
    reason:
      "ChatGPT·Claude·Perplexity 는 자바스크립트를 실행하지 않고(Vercel 5억 건 분석, 실행 흔적 0건), Gemini 와 Bing 은 실행합니다. 네이버는 공식 문서가 밝히지 않아 «확인 안 됨»으로 둡니다. 이걸 점수에 넣으면 같은 사이트가 봇마다 다른 점수를 갖게 되어 총점의 뜻이 흐려집니다.",
    source: "vercel" as const,
  },
  {
    label: "실제로 AI가 우리를 인용하는지",
    verdict: "이 진단에서는 재지 않습니다",
    reason:
      "AI에 직접 물어 답변에 브랜드가 나오는지 보는 건 가능하지만, 물어볼 때마다 비용이 들고 같은 질문에도 답이 매번 달라집니다. 무료 진단에서 다룰 만한 숫자가 아니라 상담 때 사람이 따로 확인할 몫입니다.",
    source: "ours" as const,
  },
];
