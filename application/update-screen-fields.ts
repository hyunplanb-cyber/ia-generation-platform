import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import type { ScreenFieldsPatch } from "@/domain/ports/screen-repository";
import type { Screen } from "@/domain/screen/screen";
import { withProjectAuth } from "@/application/with-project-auth";

export interface UpdateScreenFieldsRequest {
  pageId?: string;
  pageName?: string;
}

export type UpdateScreenFieldsResult =
  | { ok: true; screen: Screen }
  | { ok: false; reason: "not-found" | "empty" | "duplicate" | "conflict" };

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
