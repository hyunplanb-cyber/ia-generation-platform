import { drizzleButtonActionRepository } from "@/adapters/repository/drizzle/button-action-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import type { ButtonAction } from "@/domain/screen/button-action";
import { withProjectAuth } from "@/application/with-project-auth";

export interface UpdateButtonActionRequest {
  label?: string;
  targetScreenId?: string;
}

export type UpdateButtonActionResult =
  | { ok: true; buttonAction: ButtonAction }
  | { ok: false; reason: "not-found" | "target-not-found" | "empty-label" };

export async function updateButtonAction(
  projectId: string,
  screenId: string,
  buttonActionId: string,
  input: UpdateButtonActionRequest,
): Promise<UpdateButtonActionResult> {
  return withProjectAuth(projectId, async () => {
    const patch: { label?: string; targetScreenId?: string; targetPageIdSnapshot?: string } = {};

    if (input.label !== undefined) {
      const label = input.label.trim();
      if (!label) {
        return { ok: false, reason: "empty-label" };
      }
      patch.label = label;
    }

    if (input.targetScreenId !== undefined) {
      const targetScreen = await drizzleScreenRepository.findById(input.targetScreenId, projectId);
      if (!targetScreen) {
        return { ok: false, reason: "target-not-found" };
      }
      patch.targetScreenId = input.targetScreenId;
      patch.targetPageIdSnapshot = targetScreen.pageId;
    }

    const updated = await drizzleButtonActionRepository.update(buttonActionId, screenId, patch);
    if (!updated) {
      return { ok: false, reason: "not-found" };
    }

    await drizzleScreenRepository.setFuncDefSourceManual(screenId, projectId);

    return { ok: true, buttonAction: updated };
  });
}
