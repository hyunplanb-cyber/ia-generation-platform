import { claudePromptGenerator } from "@/adapters/prompt/llm/claude-prompt-generator";
import { drizzleMenuRepository } from "@/adapters/repository/drizzle/menu-repository";
import { drizzleScreenRepository } from "@/adapters/repository/drizzle/screen-repository";
import type { Screen } from "@/domain/screen/screen";
import { withProjectAuth } from "@/application/with-project-auth";

export type GenerateScreenPromptResult =
  | { ok: true; screen: Screen }
  | { ok: false; reason: "not-found" | "unavailable" };

export async function generateScreenPrompt(
  projectId: string,
  screenId: string,
): Promise<GenerateScreenPromptResult> {
  return withProjectAuth(projectId, async (project) => {
    const screen = await drizzleScreenRepository.findById(screenId, projectId);
    if (!screen) {
      return { ok: false, reason: "not-found" };
    }

    if (screen.prompt) {
      return { ok: true, screen };
    }

    const menus = await drizzleMenuRepository.listByProject(projectId);
    const menu = menus.find((m) => m.id === screen.menuId);
    if (!menu) {
      return { ok: false, reason: "not-found" };
    }

    const allScreens = await drizzleScreenRepository.listByProject(projectId);
    const siblingScreens = allScreens.filter(
      (s) => s.menuId === screen.menuId && s.id !== screen.id,
    );

    try {
      const prompt = await claudePromptGenerator.generate({
        project: { concept: project.concept },
        menu: { nameKo: menu.nameKo, nameEn: menu.nameEn, description: menu.description },
        screen: { pageName: screen.pageName, funcDef: screen.funcDef },
        siblingScreens: siblingScreens.map((s) => ({ pageName: s.pageName })),
      });

      const updated = await drizzleScreenRepository.updateFields(
        screenId,
        projectId,
        { prompt },
        screen.updatedAt,
      );

      return { ok: true, screen: updated ?? { ...screen, prompt } };
    } catch (error) {
      if (error instanceof Error && error.message === "ANTHROPIC_API_KEY_MISSING") {
        return { ok: false, reason: "unavailable" };
      }
      throw error;
    }
  });
}
