import type { Project } from "@/domain/project/project";
import type { Menu } from "@/domain/menu/menu";
import type { Screen } from "@/domain/screen/screen";

export interface PromptGeneratorInput {
  project: Pick<Project, "concept">;
  menu: Pick<Menu, "nameKo" | "nameEn" | "description">;
  screen: Pick<Screen, "pageName" | "funcDef">;
  siblingScreens: Pick<Screen, "pageName">[];
}

export interface PromptGenerator {
  generate(input: PromptGeneratorInput): Promise<string>;
}
