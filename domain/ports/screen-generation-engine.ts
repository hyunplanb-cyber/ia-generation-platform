import type { Menu } from "@/domain/menu/menu";
import type { Project } from "@/domain/project/project";
import type { Screen } from "@/domain/screen/screen";

export interface ScreenDraft {
  pageName: string;
  screenRole: string;
}

export interface ScreenGenerationEngine {
  generate(input: {
    project: Pick<Project, "deviceMode" | "concept">;
    menu: Menu;
    existingScreens: Screen[];
  }): ScreenDraft[];
}
