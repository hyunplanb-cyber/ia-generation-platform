import { drizzleButtonActionRepository } from "@/adapters/repository/drizzle/button-action-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import type { ButtonAction } from "@/domain/screen/button-action";
import { withProjectAuth } from "@/application/with-project-auth";

export interface AddButtonActionRequest {
  screenId: string;
  label: string;
  targetScreenId: string;
}

export type AddButtonActionResult =
  | { ok: true; buttonAction: ButtonAction }
  | { ok: false; reason: "screen-not-found" | "target-not-found" | "empty-label" };

export async function addButtonAction(
  projectId: string,
  input: AddButtonActionRequest,
): Promise<AddButtonActionResult> {
  return withProjectAuth(projectId, async () => {
    const label = input.label.trim();
    if (!label) {
      return { ok: false, reason: "empty-label" };
    }

    const screen = await drizzleScreenRepository.findById(input.screenId, projectId);
    if (!screen) {
      return { ok: false, reason: "screen-not-found" };
    }

    const targetScreen = await drizzleScreenRepository.findById(input.targetScreenId, projectId);
    if (!targetScreen) {
      return { ok: false, reason: "target-not-found" };
    }

    const buttonAction = await drizzleButtonActionRepository.create({
      screenId: input.screenId,
      label,
      targetScreenId: input.targetScreenId,
      targetPageIdSnapshot: targetScreen.pageId,
    });

    await drizzleScreenRepository.setFuncDefSourceManual(input.screenId, projectId);

    return { ok: true, buttonAction };
  });
}
