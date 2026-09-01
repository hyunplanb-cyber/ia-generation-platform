// 진단 결과의 «모양»만 담는다.
//
// 화면(클라이언트 컴포넌트)도 이 타입이 필요한데, lib/diagnose/index.ts 를 그대로 부르면
// 거기 딸린 fetch.ts 의 node:dns · node:net 까지 브라우저 묶음에 끌려 들어가 빌드가 깨진다.
// 그래서 «서버만 쓰는 것»과 «양쪽이 쓰는 것»을 파일로 갈라 둔다. 이 파일에는 절대
// node: 모듈을 import 하지 마라.

/** 기준 판. 점수가 달라지면 올린다 — 손님이 「전에는 몇 점이었는데」 물을 때 근거가 된다. */
export const CRITERIA_VERSION = "2026-09-01 v5";

/**
 * 축 셋. v4 에서 «근거의 종류»에 맞춰 다시 갈랐다.
 *   access    — 봇이 내용을 받을 수 있나 (구글 색인 요건 · Vercel 렌더링 실측)
 *   cite      — 인용할 만한 재료가 있나 (GEO 논문 KDD 2024 가 «실측»한 것들)
 *   understand— 무엇에 관한 페이지인지 알아볼 수 있나 (메타·구조)
 */
export type Axis = "seo" | "aeo" | "geo";

export type BotRow = {
  id: string;
  label: string;
  weight: number;
  /** robots.txt 가 열어 주는가 */
  allowed: boolean;
  /** 자바스크립트를 실행하는가. null 은 «근거를 못 찾았다»는 뜻이다. */
  rendersJs: boolean | null;
};

/**
 * 고치는 법. 규칙만으로 만든다 — AI를 부르지 않으므로 몇 명이 눌러도 요금이 0원이다.
 *
 * 「제목·설명문·질문형 소제목」 셋은 «형태»까지만 일러 줄 수 있고 완성된 문장은 못 써 준다.
 * 그건 글쓰기라서 규칙의 몫이 아니다. 나중에 AI팩 쪽에서 다룰 일이다.
 */
export type Fix = {
  /** 지금 이 사이트가 어떤 상태인지 — 잰 값을 그대로 넣는다. */
  what: string;
  /** 무엇을 하면 되는지. */
  how: string;
  /** 붙여 쓸 수 있는 것. 주소·날짜까지 채워서 준다. */
  snippet?: string;
  /** 고친 뒤 스스로 확인하는 법. */
  verify?: string;
};

export type DiagnoseItem = {
  axis: Axis;
  id: string;
  label: string;
  got: number;
  max: number;
  note: string;
  /** 왜 중요한지 한 줄. 손님이 「그래서 뭘 고쳐요?」 할 때 답이 된다. */
  why?: string;
  /** 만점이 아닌 항목에만 붙는다. */
  fix?: Fix;
  /** 점수를 몇 점 잃었나(축 비중까지 반영). 처방을 급한 순서로 세울 때 쓴다. */
  lost?: number;
};

/** 점수보다 먼저 알려야 하는 «한 가지 큰 사실». 없으면 null. */
export type Headline = {
  tone: "danger" | "warn";
  title: string;
  body: string;
} | null;

export type DiagnoseResult = {
  url: string;
  checkedAt: string;
  version: string;
  total: number;
  grade: "A" | "B" | "C" | "D";
  axes: Record<Axis, { got: number; max: number; score: number }>;
  items: DiagnoseItem[];
  bots: BotRow[];
  headline: Headline;
  /** 자바스크립트로 그리는 사이트인가. 로봇마다 실제로 보이는 것이 갈린다. */
  jsRendered: boolean;
  /**
   * 기술/내용을 갈라 낸 점수.
   * 총점 하나만 보여 주면 「우리 업종이라 낮은 건가?」를 알 수 없다.
   *   기술 — 누구나 갖출 수 있는 것. 낮으면 그냥 안 한 것이다.
   *   내용 — 그 쪽에 무엇을 썼는가. 홈 화면은 대개 낮게 나온다.
   */
  kinds: Record<"기술" | "내용", { got: number; max: number; score: number }>;
};

export const AXIS_LABEL: Record<Axis, string> = {
  seo: "SEO",
  aeo: "AEO",
  geo: "GEO",
};

/** 축 이름만으로는 뜻이 안 통한다. 초보 사장님이 읽을 한 줄을 따로 둔다. */
export const AXIS_TITLE: Record<Axis, string> = {
  seo: "검색에 나오나",
  aeo: "답변으로 뽑히나",
  geo: "AI가 인용하나",
};

export const AXIS_HELP: Record<Axis, string> = {
  seo: "구글·네이버가 이 쪽을 검색 결과에 실을 수 있는 상태인가",
  aeo: "「OO가 뭐예요?」에 이 쪽이 «답»으로 뽑힐 만한 모양인가",
  geo: "ChatGPT·Claude 가 답을 만들 때 이 쪽을 «출처»로 쓸 만한가",
};

/**
 * 축 비중 — «근거의 세기»에 맞춘다.
 *   cite 40%   — GEO 논문(KDD 2024)이 질의 1만 건으로 «실측»한 항목들이다. 가장 단단하다.
 *   access 35% — 구글이 「색인 자격」을 유일한 요건이라 밝혔고, Vercel 이 5억 건으로 렌더링을 쟀다.
 *                다만 «문»이라 통과하면 더 못 얻는다. 그래서 인용 재료보다 살짝 낮다.
 *   understand 25% — 근거가 상대적으로 약하다. SIGIR 2026 은 「형식 변경은 영향 미미」라고 했다.
 */
export const AXIS_WEIGHT: Record<Axis, number> = {
  seo: 0.34,
  aeo: 0.33,
  geo: 0.33,
};
