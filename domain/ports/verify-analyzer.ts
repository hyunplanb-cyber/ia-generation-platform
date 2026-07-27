import type { Scenario } from "@/domain/verify/report";

// LLM에게 넘길 입력: 검사한 페이지의 주소와 내용, 페이지에서 찾은 링크.
export interface VerifyAnalyzerInput {
  url: string;
  finalUrl: string;
  html: string; // 정리·축약된 본문
  links: string[]; // 페이지에서 찾은 내부 링크(민감 화면 감지 힌트)
}

// LLM이 판단하는 "사람이 읽어야 할" 부분 — 자동 검사로는 알 수 없는 것들.
export interface VerifyAnalysis {
  sensitiveScreens: string[]; // 로그인·결제 등 자동 검수 불가로 분류한 화면
  scenarios: Scenario[]; // 확인 시나리오(공개=보조, 민감=필수)
  summary: string; // 쉬운 말 총평
}

// 사이트 내용을 읽고 검수 시나리오·요약을 만드는 분석기(구현은 어댑터).
export interface VerifyAnalyzer {
  analyze(input: VerifyAnalyzerInput): Promise<VerifyAnalysis>;
}
