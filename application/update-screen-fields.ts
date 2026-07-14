import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import type { ScreenFieldsPatch } from "@/domain/ports/screen-repository";
import { MAX_FUNC_DEF_LENGTH } from "@/domain/screen/func-def-limit";
import type { Screen } from "@/domain/screen/screen";
import { withProjectAuth } from "@/application/with-project-auth";

export interface UpdateScreenFieldsRequest {
  pageId?: string;
  pageName?: string;
  funcDef?: string;
  prompt?: string;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export type UpdateScreenFieldsResult =
  | { ok: true; screen: Screen }
  | {
      ok: false;
      reason: "not-found" | "empty" | "duplicate" | "conflict" | "too-long" | "invalid-range";
    };

function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string; cause?: { code?: string } })?.code
    ?? (error as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}

export async function updateScreenFields(
  projectId: string,
  screenId: string,
  input: UpdateScreenFieldsRequest,
  expectedUpdatedAt: Date,
): Promise<UpdateScreenFieldsResult> {
  return withProjectAuth(projectId, async () => {
    const current = await drizzleScreenRepository.findById(screenId, projectId);
    if (!current) {
      return { ok: false, reason: "not-found" };
    }

    const patch: ScreenFieldsPatch = {};

    if (input.pageId !== undefined) {
      const pageId = input.pageId.trim();
      if (pageId !== current.pageId) {
        if (!pageId) {
          return { ok: false, reason: "empty" };
        }
        patch.pageId = pageId;
        patch.pageIdSource = "manual";
      }
    }

    if (input.pageName !== undefined) {
      const pageName = input.pageName.trim();
      if (pageName !== current.pageName) {
        patch.pageName = pageName;
        patch.pageNameSource = "manual";
      }
    }

    if (input.funcDef !== undefined) {
      const funcDef = input.funcDef;
      if (funcDef.length > MAX_FUNC_DEF_LENGTH) {
        return { ok: false, reason: "too-long" };
      }
      if (funcDef !== (current.funcDef ?? "")) {
        patch.funcDef = funcDef;
        patch.funcDefSource = "manual";
      }
    }

    if (input.prompt !== undefined) {
      const prompt = input.prompt;
      if (prompt !== (current.prompt ?? "")) {
        patch.prompt = prompt;
        patch.promptSource = "manual";
      }
    }

    if (input.scheduleStart !== undefined || input.scheduleEnd !== undefined) {
      const scheduleStart = input.scheduleStart ?? current.scheduleStart ?? "";
      const scheduleEnd = input.scheduleEnd ?? current.scheduleEnd ?? "";
      if (scheduleStart > scheduleEnd) {
        return { ok: false, reason: "invalid-range" };
      }
      if (scheduleStart !== (current.scheduleStart ?? "") || scheduleEnd !== (current.scheduleEnd ?? "")) {
        patch.scheduleStart = scheduleStart;
        patch.scheduleEnd = scheduleEnd;
        patch.scheduleLocked = true;
      }
    }

    if (Object.keys(patch).length === 0) {
      return { ok: true, screen: current };
    }

    try {
      const updated = await drizzleScreenRepository.updateFields(
        screenId,
        projectId,
        patch,
        expectedUpdatedAt,
      );
      if (!updated) {
        return { ok: false, reason: "conflict" };
      }
      return { ok: true, screen: updated };
    } catch (error) {
      if (isUniqueViolation(error)) {
        return { ok: false, reason: "duplicate" };
      }
      throw error;
    }
  });
}
