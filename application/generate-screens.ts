import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import { rulePatternEngine } from "@/adapters/generation/rule-pattern/rule-pattern-engine";
import { derivePageId } from "@/domain/screen/derive-page-id";
import { selectNewScreenDrafts } from "@/domain/screen/select-new-screen-drafts";
import { distributeSchedule } from "@/domain/schedule/distribute-schedule";
import type { CreateScreenInput } from "@/domain/ports/screen-repository";
import { withProjectAuth } from "@/application/with-project-auth";

export async function generateScreens(projectId: string): Promise<void> {
  await withProjectAuth(projectId, async (project) => {
    const menus = await drizzleMenuRepository.listByProject(projectId);
    if (menus.length === 0) return;

    const existingScreens = await drizzleScreenRepository.listByProject(projectId);
    const existingCountByMenuDevice = new Map<string, number>();
    for (const screen of existingScreens) {
      const key = `${screen.menuId}::${screen.deviceCode}`;
      existingCountByMenuDevice.set(key, (existingCountByMenuDevice.get(key) ?? 0) + 1);
    }

    const deviceCodes = project.deviceMode === "mobile" ? ["MO"] : ["PC"];
    const candidates: CreateScreenInput[] = [];

    for (const menu of menus) {
      const menuExistingScreens = existingScreens.filter((screen) => screen.menuId === menu.id);
      const drafts = rulePatternEngine.generate({ project, menu, existingScreens: menuExistingScreens });

      for (const deviceCode of deviceCodes) {
        let serial = 1000 + (existingCountByMenuDevice.get(`${menu.id}::${deviceCode}`) ?? 0);
        for (const draft of drafts) {
          candidates.push({
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

    const newInputs = selectNewScreenDrafts(candidates, existingScreens);
    if (newInputs.length === 0) return;

    const slots = distributeSchedule(project.overallStart, project.overallEnd, newInputs.length);
    const inputsWithSchedule = newInputs.map((input, index) => ({
      ...input,
      scheduleStart: slots[index]?.scheduleStart,
      scheduleEnd: slots[index]?.scheduleEnd,
    }));

    await drizzleScreenRepository.createMany(inputsWithSchedule);
  });
}
