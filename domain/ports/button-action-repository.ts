import type { ButtonAction } from "@/domain/screen/button-action";

export interface CreateButtonActionInput {
  screenId: string;
  label: string;
  targetScreenId: string;
  targetPageIdSnapshot: string;
}

export interface UpdateButtonActionInput {
  label?: string;
  targetScreenId?: string;
  targetPageIdSnapshot?: string;
}

export interface ButtonActionRepository {
  create(input: CreateButtonActionInput): Promise<ButtonAction>;
  listByProject(projectId: string): Promise<ButtonAction[]>;
  update(id: string, screenId: string, input: UpdateButtonActionInput): Promise<ButtonAction | null>;
  delete(id: string, screenId: string): Promise<void>;
}
