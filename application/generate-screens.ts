import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import { rulePatternEngine } from "@/adapters/generation/rule-pattern/rule-pattern-engine";
import { derivePageId } from "@/domain/screen/derive-page-id";
import { distributeSchedule } from "@/domain/schedule/distribute-schedule";
import type { CreateScreenInput } from "@/domain/ports/screen-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function generateScreens(projectId: string): Promise<void> {
  await withProjectAuth(projectId, async (project) => {
    const menus = await drizzleMenuRepository.listByProject(projectId);
    if (menus.length === 0) return;

    const deviceCodes = project.deviceMode === "responsive" ? ["PC"] : ["PC", "MO"];
    const inputs: CreateScreenInput[] = [];

    for (const menu of menus) {
      const drafts = rulePatternEngine.generate({ project, menu, existingScreens: [] });

      for (const deviceCode of deviceCodes) {
        let serial = 1000;
        for (const draft of drafts) {
          inputs.push({
            projectId,
            menuId: menu.id,
            pageId: derivePageId(deviceCode, menu.menuCode, serial),
            pageName: draft.pageName,
            screenRole: draft.screenRole,
            deviceCode,
          });
          serial += 1;
        }
      }
    }

    const slots = distributeSchedule(project.overallStart, project.overallEnd, inputs.length);
    const inputsWithSchedule = inputs.map((input, index) => ({
      ...input,
      scheduleStart: slots[index]?.scheduleStart,
      scheduleEnd: slots[index]?.scheduleEnd,
    }));

    await drizzleScreenRepository.createMany(inputsWithSchedule);
  });
}
