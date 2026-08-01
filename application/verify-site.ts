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

// 문서를 한 번에 다 넣을 수 없어 토막으로 나눈다. 토막 하나가 LLM 한 번.
const DOC_CHUNK_CHARS = 16000;
// 상세라도 토막이 무한정 늘지 않게 막는다(= 최대 호출 수). 16,000자 × 8 = 12만 자.
const MAX_DOC_CHUNKS = 8;

function chunkText(text: string, size: number, max: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length && out.length < max; i += size) {
    out.push(text.slice(i, i + size));
  }
  return out.length > 0 ? out : [""];
}

/**
 * 여러 입력을 동시에 분석하고 하나로 합친다(같은 화면은 절차를 합침).
 *
 * 예전에는 '같은 홈 HTML'을 관점만 바꿔 3번 봤다. 그래서 상세를 골라도 실제로
 * 보는 화면은 홈 하나뿐이었고, "홈+주요 화면", "3뎁스까지"라는 판매 문구와 어긋났다.
 * 지금은 입력 자체가 여럿이다 — 사이트는 페이지마다, 문서는 토막마다 한 번씩.
 * 관점(focus)은 입력 순서대로 돌려 붙여, 넓이(여러 화면)와 깊이(여러 관점)를 함께 가져간다.
 */
async function analyzeMany(
  inputs: VerifyAnalyzerInput[],
  detail: boolean,
): Promise<VerifyAnalysis & { chunks: number }> {
  // 기본은 첫 입력 한 번만 — 값이 싼 등급이라 넓이를 사지 않는다.
  const targets = detail ? inputs : inputs.slice(0, 1);
  const settled = await Promise.allSettled(
    targets.map((input, i) =>
      claudeVerifier.analyze({
        ...input,
        // 첫 입력은 기본 관점, 이후는 관점을 번갈아 준다.
        focus: detail && i > 0 ? DETAIL_FOCUS[(i - 1) % DETAIL_FOCUS.length] : undefined,
      }),
    ),
  );
  const oks = settled
    .filter((s): s is PromiseFulfilledResult<VerifyAnalysis> => s.status === "fulfilled")
    .map((s) => s.value);
  if (oks.length === 0) {
    const rej = settled.find((s) => s.status === "rejected") as PromiseRejectedResult | undefined;
    throw rej?.reason ?? new Error("VERIFY_API_ERROR");
  }
  if (oks.length < targets.length) {
    console.error(`verify: 분석 ${targets.length - oks.length}/${targets.length}건 실패(나머지는 살림)`);
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
    // 값은 실제로 성공한 묶음 수만큼만 받는다(실패한 묶음은 안 받는다).
    chunks: oks.length,
  };
}

// 문서 하나를 토막으로 나눠 분석한다. 기본은 앞 토막만, 상세는 전체(최대 8토막).
function docInputs(label: string, text: string): VerifyAnalyzerInput[] {
  return chunkText(text, DOC_CHUNK_CHARS, MAX_DOC_CHUNKS).map((content, i, all) => ({
    mode: "document" as const,
    label: all.length > 1 ? `${label} (${i + 1}/${all.length})` : label,
    content,
    links: [],
  }));
}

// chunks = 실제로 돈 묶음 수. 값을 이 수로 매기므로(verifyGenCost) 부르는 쪽에 돌려준다.
export type VerifySiteResult =
  | { ok: true; report: VerificationReport; chunks: number }
  | { ok: false; reason: "bad-url" | "unreachable" | "unavailable" | "failed" };

export type VerifyDocResult =
  | { ok: true; report: VerificationReport; chunks: number }
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
      chunks: 0,
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
    // 상세면 크롤한 페이지마다 한 번씩 본다(기본은 홈만).
    analysis = await analyzeMany(
      http.pages.map((p) => ({
        mode: "site" as const,
        label: p.label === "/" ? http.finalUrl : `${http.finalUrl} · ${p.label}`,
        content: p.html,
        // 링크 목록은 홈에서 뽑은 것 하나로 충분하다(민감 화면 추론용 힌트).
        links: http.links,
      })),
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
      // 시나리오를 못 만들었으니 묶음값은 안 받는다(자동 검사만 한 셈).
      chunks: 0,
    };
  }

  const passCount = http.checks.filter((c) => c.status === "pass").length;
  const failCount = http.checks.filter((c) => c.status === "fail").length;
  const warnCount = http.checks.filter((c) => c.status === "warn").length;

  return {
    ok: true,
    chunks: analysis.chunks,
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
    analysis = await analyzeMany(docInputs(label, text), detail);
  } catch (error) {
    console.error("verifyText: 분석 실패", error);
    return { ok: false, reason: docReasonFor(error) };
  }

  return {
    ok: true,
    chunks: analysis.chunks,
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
    analysis = await analyzeMany(docInputs(filename, text), detail);
  } catch (error) {
    console.error("verifyDocument: 분석 실패", error);
    return { ok: false, reason: docReasonFor(error) };
  }

  return {
    ok: true,
    chunks: analysis.chunks,
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
