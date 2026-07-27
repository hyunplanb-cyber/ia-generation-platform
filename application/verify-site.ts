import { runHttpChecks } from "@/adapters/verify/http-checks";
import { claudeVerifier } from "@/adapters/verify/llm/claude-verifier";
import type { VerificationReport } from "@/domain/verify/report";

export type VerifySiteResult =
  | { ok: true; report: VerificationReport }
  | { ok: false; reason: "bad-url" | "unreachable" | "unavailable" | "failed" };

// 사이트 URL 하나를 검수한다.
//  1) 요청/응답 기반 자동 검사(접속·이미지·링크·모바일 대응 등)
//  2) LLM이 HTML을 읽어 민감 화면 분류 + 확인 시나리오 + 쉬운 총평
// 두 결과를 하나의 리포트로 합친다.
export async function verifySite(rawUrl: string): Promise<VerifySiteResult> {
  // 1) 자동 검사 (주소 형식/차단 호스트는 여기서 걸러짐)
  let http;
  try {
    http = await runHttpChecks(rawUrl);
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
    analysis = await claudeVerifier.analyze({
      url: rawUrl,
      finalUrl: http.finalUrl,
      html: http.html,
      links: http.links,
    });
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
