import { claudeIaEnricher } from "@/adapters/generation/llm/claude-ia-enricher";
import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import type { EnrichScreenInput } from "@/domain/ports/ia-enricher";
import type { EnrichedFields } from "@/domain/ports/screen-repository";
import { MAX_FUNC_DEF_LENGTH } from "@/domain/screen/func-def-limit";
import { withProjectAuth } from "@/application/with-project-auth";

export type EnrichDownloadResult =
  | { ok: true; total: number; enriched: number; skipped: number; failedChunks: number }
  | { ok: false; reason: "unavailable" | "no-credit" | "failed" };

/**
 * 다운로드 직전에 화면 본문을 더 좋은 모델로 다시 쓴다.
 *
 * 다시 쓰는 것: 기능정의 · AI 프롬프트 본문
 * 절대 안 건드리는 것: 화면 개수 · 화면ID · 화면명 · 메뉴 구조
 *   → 미리보기에서 본 화면 구성이 그대로 나온다. "다른 게 나오면 어쩌지"가 성립하지 않는다.
 * 사용자가 손으로 고친 칸(source가 'manual')도 그대로 둔다.
 *
 * 이미 보강한 화면(enrichedAt이 있는)은 건너뛴다 — 다시 받을 때 또 돈이 나가지 않는다.
 * 실패해도 예외를 던지지 않는다: 고객은 이미 다운로드를 눌렀고, 보강이 안 되면
 * 하이쿠가 쓴 본문 그대로라도 파일은 나가야 한다. 실패는 숫자로 돌려준다.
 */
export async function enrichForDownload(projectId: string): Promise<EnrichDownloadResult> {
  return withProjectAuth(projectId, async (project) => {
    const [menus, screens] = await Promise.all([
      drizzleMenuRepository.listByProject(projectId),
      drizzleScreenRepository.listByProject(projectId),
    ]);
    const menuNameById = new Map(menus.map((m) => [m.id, m.nameKo]));

    const active = screens.filter((s) => s.status === "active");
    const targets = active.filter((s) => !s.enrichedAt);
    if (targets.length === 0) {
      return { ok: true, total: active.length, enriched: 0, skipped: active.length, failedChunks: 0 };
    }

    // 양쪽 다 사람이 고친 화면은 다시 쓸 게 없다 — 모델에 보내지 않고 표시만 남긴다.
    const nothingToWrite = targets.filter(
      (s) => s.funcDefSource === "manual" && s.promptSource === "manual",
    );
    const toWrite = targets.filter(
      (s) => s.funcDefSource !== "manual" || s.promptSource !== "manual",
    );

    // ref는 화면ID를 쓴다(프로젝트 안에서 유일하고, uuid보다 짧아 토큰이 덜 든다).
    const byRef = new Map<string, (typeof toWrite)[number]>();
    for (const s of toWrite) {
      if (!byRef.has(s.pageId)) byRef.set(s.pageId, s);
    }

    const inputs: EnrichScreenInput[] = [...byRef.values()].map((s) => ({
      ref: s.pageId,
      menuKo: menuNameById.get(s.menuId) ?? "메뉴",
      screenGroup: s.screenGroup,
      pageName: s.pageName,
      screenRole: s.screenRole,
      funcDef: s.funcDef ?? "",
      prompt: s.prompt ?? "",
      keepFuncDef: s.funcDefSource === "manual",
      keepPrompt: s.promptSource === "manual",
    }));

    // 전체 화면 목록은 이미 보강한 것까지 포함해서 준다 — 이 사이트에 어떤 화면이
    // 있는지 알아야 "여기서 어디로 간다"를 제대로 쓴다.
    const roster = active
      .map((s) => `${s.pageId}: ${s.screenGroup ? `${s.screenGroup} · ` : ""}${s.pageName}`)
      .join("\n");

    const startedAt = Date.now();
    let result;
    try {
      result = await claudeIaEnricher.enrich(
        {
          concept: project.concept,
          designConcept: project.designConcept,
          deviceMode: project.deviceMode,
          roster,
        },
        inputs,
      );
    } catch (error) {
      if (error instanceof Error && error.message === "ANTHROPIC_API_KEY_MISSING") {
        return { ok: false, reason: "unavailable" };
      }
      if (error instanceof Error && error.message.includes("credit balance")) {
        return { ok: false, reason: "no-credit" };
      }
      console.error("enrichForDownload failed:", error);
      return { ok: false, reason: "failed" };
    }

    const updates: EnrichedFields[] = [];
    for (const got of result.screens) {
      const target = byRef.get(got.ref);
      if (!target) continue;
      const patch: EnrichedFields = { id: target.id };
      // 빈 응답으로 멀쩡한 본문을 지우지 않는다. 길이 상한도 저장 전에 막는다.
      if (target.funcDefSource !== "manual" && got.funcDef) {
        patch.funcDef = got.funcDef.slice(0, MAX_FUNC_DEF_LENGTH);
      }
      if (target.promptSource !== "manual" && got.prompt) {
        patch.prompt = got.prompt;
      }
      updates.push(patch);
    }
    // 보낼 게 없던 화면도 끝난 것으로 표시해, 다음 다운로드가 매번 다시 훑지 않게 한다.
    updates.push(...nothingToWrite.map((s) => ({ id: s.id })));

    await drizzleScreenRepository.applyEnrichment(projectId, updates);

    // 실제 원가·소요 시간은 여기서만 알 수 있다. 가격표를 이 숫자로 고친다.
    const u = result.usage;
    console.log(
      `enrich: 화면 ${updates.length}/${targets.length} · ${Math.round((Date.now() - startedAt) / 1000)}초 · ` +
        `묶음 실패 ${result.failedChunks}/${result.totalChunks} · ` +
        `입력 ${u.inputTokens} (캐시읽기 ${u.cacheReadTokens} / 캐시쓰기 ${u.cacheWriteTokens}) · 출력 ${u.outputTokens}`,
    );

    return {
      ok: true,
      total: active.length,
      enriched: updates.length,
      skipped: active.length - targets.length,
      failedChunks: result.failedChunks,
    };
  });
}
