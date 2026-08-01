// 다운로드할 때 화면 본문을 더 좋은 모델로 다시 쓰는 포트.
//
// 생성(미리보기)은 계속 하이쿠다. 여기는 다운로드 순간에만 돈다.
// 재생성이 아니라 "보강"이라는 게 핵심이다 — 뼈대(화면 목록·화면ID·화면명·메뉴)는
// 입력으로 주기만 하고 절대 돌려받지 않는다. 돌려받는 건 기능정의·프롬프트 본문뿐이다.
// 그래서 "미리보기와 다른 게 나오면 어쩌지"가 성립하지 않는다.

export interface EnrichContext {
  concept: string;
  designConcept: string | null;
  deviceMode: string;
  /** 전체 화면 목록 한 줄 요약(다른 화면과의 관계를 알고 쓰라고 준다) */
  roster: string;
}

export interface EnrichScreenInput {
  /** 이 화면을 되찾을 열쇠. 화면ID(pageId)를 그대로 쓴다. */
  ref: string;
  menuKo: string;
  screenGroup: string | null;
  pageName: string;
  screenRole: string;
  /** 하이쿠가 쓴 현재 본문(더 낫게 고쳐 쓰라고 준다) */
  funcDef: string;
  prompt: string;
  /** 사용자가 손으로 고친 칸은 다시 쓰지 않는다 */
  keepFuncDef: boolean;
  keepPrompt: boolean;
}

export interface EnrichedScreen {
  ref: string;
  funcDef: string;
  prompt: string;
}

export interface EnrichUsage {
  inputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
}

export interface EnrichResult {
  screens: EnrichedScreen[];
  usage: EnrichUsage;
  /** 실패한 묶음 수 / 전체 묶음 수 — 부분 실패를 그대로 알린다. */
  failedChunks: number;
  totalChunks: number;
}

export interface IaEnricher {
  /** opts.model은 모델 비교용 — 평소엔 어댑터의 기본 모델을 쓴다. */
  enrich(
    ctx: EnrichContext,
    screens: EnrichScreenInput[],
    opts?: { model?: string },
  ): Promise<EnrichResult>;
}
