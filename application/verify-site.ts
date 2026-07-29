import { runHttpChecks } from "@/adapters/verify/http-checks";
import { claudeVerifier } from "@/adapters/verify/llm/claude-verifier";
import { extractDocumentText } from "@/adapters/verify/extract-document";
import type { VerificationReport, Scenario } from "@/domain/verify/report";
import type { VerifyAnalysis, VerifyAnalyzerInput } from "@/domain/ports/verify-analyzer";

// 상세 생성: 회차마다 다른 관점을 주문해 겹치지 않는 시나리오를 더 뽑는다.
const DETAIL_FOCUS = [
  "예외·오류·빈 상태·실패·마감 상황과 접근성(대체텍스트·키보드)에 집중하세요. 앞 회차와 겹치지 않는 새 화면·절차 위주로.",
  "모바일·반응형·성능·SEO(제목·설명·og 공유)·다국어 관점에 집중하세요. 앞 회차와 겹치지 않는 새 화면·절차 위주로.",
];

// 기본=1회, 상세=3회 병렬 호출 후 시나리오를 병합한다(같은 화면은 스텝 합치기).
async function analyzeRounds(
  base: VerifyAnalyzerInput,
  detail: boolean,
): Promise<VerifyAnalysis> {
  const focuses: (string | undefined)[] = detail ? [undefined, ...DETAIL_FOCUS] : [undefined];
  const settled = await Promise.allSettled(
    focuses.map((focus) => claudeVerifier.analyze({ ...base, focus })),
  );
  const oks = settled
    .filter((s): s is PromiseFulfilledResult<VerifyAnalysis> => s.status === "fulfilled")
    .map((s) => s.value);
  if (oks.length === 0) {
    const rej = settled.find((s) => s.status === "rejected") as PromiseRejectedResult | undefined;
    throw rej?.reason ?? new Error("VERIFY_API_ERROR");
  }
  const byScreen = new Map<string, Scenario>();
  for (const r of oks) {
    for (const s of r.scenarios) {
      const ex = byScreen.get(s.screen);
      if (!ex) byScreen.set(s.screen, { ...s, steps: [...s.steps] });
      else for (const st of s.steps) if (!ex.steps.includes(st)) ex.steps.push(st);
    }
  }
  return {
    sensitiveScreens: [...new Set(oks.flatMap((r) => r.sensitiveScreens))],
    scenarios: [...byScreen.values()],
    summary: oks[0].summary,
  };
}

export type VerifySiteResult =
  | { ok: true; report: VerificationReport }
  | { ok: false; reason: "bad-url" | "unreachable" | "unavailable" | "failed" };

export type VerifyDocResult =
  | { ok: true; report: VerificationReport }
  | {
      ok: false;
      reason: "unsupported-doc" | "empty-doc" | "unavailable" | "bad-output" | "api-error" | "failed";
    };

// 분석 오류 메시지를 사용자용 사유로 매핑(문서·설계도 모드 공통).
function docReasonFor(error: unknown): "unavailable" | "bad-output" | "api-error" | "failed" {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "ANTHROPIC_API_KEY_MISSING") return "unavailable";
  if (msg === "VERIFY_BAD_OUTPUT") return "bad-output";
  if (msg === "VERIFY_API_ERROR") return "api-error";
  return "failed";
}

// 사이트 URL 하나를 검수한다.
//  1) 요청/응답 기반 자동 검사(접속·이미지·링크·모바일 대응 등)
//  2) LLM이 HTML을 읽어 민감 화면 분류 + 확인 시나리오 + 쉬운 총평
// 두 결과를 하나의 리포트로 합친다.
export async function verifySite(rawUrl: string, detail = false): Promise<VerifySiteResult> {
  // 1) 자동 검사 (주소 형식/차단 호스트는 여기서 걸러짐). 상세면 여러 페이지 + 전체 항목.
  let http;
  try {
    http = await runHttpChecks(rawUrl, detail);
  } catch (error) {
    if (error instanceof Error && (error.message === "BLOCKED_HOST" || error.message === "INVALID_PROTOCOL")) {
      return { ok: false, reason: "bad-url" };
    }
    // URL 형식 오류(new URL throw) 등
    return { ok: false, reason: "bad-url" };
  }

  if (!http.ok && http.html === "") {
    // 접속 자체가 안 된 경우 — 자동 검사 결과(접속 실패)만 담아 돌려준다.
    return {
      ok: true,
      report: {
        mode: "site",
        url: rawUrl,
        finalUrl: http.finalUrl,
        fetchedAt: new Date().toISOString(),
        checks: http.checks,
        passCount: 0,
        failCount: http.checks.filter((c) => c.status === "fail").length,
        warnCount: 0,
        sensitiveScreens: [],
        scenarios: [],
        summary:
          "사이트에 접속하지 못했어요. 주소가 정확한지, 사이트가 실제로 배포(오픈)됐는지 확인한 뒤 다시 시도해 주세요.",
      },
    };
  }

  // 2) LLM 분석. 실패해도 자동 검사 결과는 살려서 돌려준다(부분 성공).
  let analysis;
  try {
    analysis = await analyzeRounds(
      { mode: "site", label: http.finalUrl, content: http.html, links: http.links },
      detail,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "ANTHROPIC_API_KEY_MISSING") {
      return { ok: false, reason: "unavailable" };
    }
    console.error("verifySite: 분석 실패", error);
    analysis = {
      sensitiveScreens: [] as string[],
      scenarios: [],
      summary: "자동 검사는 마쳤지만, 시나리오 분석 중 문제가 있었어요. 잠시 후 다시 시도해 주세요.",
    };
  }

  const passCount = http.checks.filter((c) => c.status === "pass").length;
  const failCount = http.checks.filter((c) => c.status === "fail").length;
  const warnCount = http.checks.filter((c) => c.status === "warn").length;

  return {
    ok: true,
    report: {
      mode: "site",
      url: rawUrl,
      finalUrl: http.finalUrl,
      fetchedAt: new Date().toISOString(),
      checks: http.checks,
      passCount,
      failCount,
      warnCount,
      sensitiveScreens: analysis.sensitiveScreens,
      scenarios: analysis.scenarios,
      summary: analysis.summary,
    },
  };
}

// 카페인컬러에서 만든 설계도(IA 화면목록·스펙팩) 텍스트를 그대로 검수한다.
// 화면·요건을 글로 아는 상태라 시나리오가 가장 촘촘하다. 자동 검사(사이트)는 없다.
export async function verifyText(
  label: string,
  rawText: string,
  detail = false,
): Promise<VerifyDocResult> {
  const text = rawText.trim();
  if (text.length < 20) {
    return { ok: false, reason: "empty-doc" };
  }

  let analysis;
  try {
    analysis = await analyzeRounds(
      { mode: "document", label, content: text.slice(0, 16000), links: [] },
      detail,
    );
  } catch (error) {
    console.error("verifyText: 분석 실패", error);
    return { ok: false, reason: docReasonFor(error) };
  }

  return {
    ok: true,
    report: {
      mode: "document",
      url: label,
      finalUrl: label,
      fetchedAt: new Date().toISOString(),
      checks: [],
      passCount: 0,
      failCount: 0,
      warnCount: 0,
      sensitiveScreens: analysis.sensitiveScreens,
      scenarios: analysis.scenarios,
      summary: analysis.summary,
    },
  };
}

// 설계 문서(PDF·PPTX)를 검수한다. 실제 사이트가 아니므로 자동 검사 없이 시나리오만 낸다.
export async function verifyDocument(
  filename: string,
  bytes: ArrayBuffer,
  detail = false,
): Promise<VerifyDocResult> {
  let text: string;
  try {
    text = await extractDocumentText(filename, bytes);
  } catch (error) {
    if (error instanceof Error && error.message === "UNSUPPORTED_DOC") {
      return { ok: false, reason: "unsupported-doc" };
    }
    if (error instanceof Error && error.message === "EMPTY_DOC") {
      return { ok: false, reason: "empty-doc" };
    }
    console.error("verifyDocument: 추출 실패", error);
    return { ok: false, reason: "failed" };
  }

  let analysis;
  try {
    analysis = await analyzeRounds({ mode: "document", label: filename, content: text, links: [] }, detail);
  } catch (error) {
    console.error("verifyDocument: 분석 실패", error);
    return { ok: false, reason: docReasonFor(error) };
  }

  return {
    ok: true,
    report: {
      mode: "document",
      url: filename,
      finalUrl: filename,
      fetchedAt: new Date().toISOString(),
      checks: [], // 문서는 자동 검사 불가
      passCount: 0,
      failCount: 0,
      warnCount: 0,
      sensitiveScreens: analysis.sensitiveScreens,
      scenarios: analysis.scenarios,
      summary: analysis.summary,
    },
  };
}
