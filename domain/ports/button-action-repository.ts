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
  /** 여러 버튼을 한 번의 쿼리로 저장한다(생성 시 DB 왕복을 줄여 시간 초과를 막는다). */
  createMany(inputs: CreateButtonActionInput[]): Promise<ButtonAction[]>;
  listByProject(projectId: string): Promise<ButtonAction[]>;
  update(id: string, screenId: string, input: UpdateButtonActionInput): Promise<ButtonAction | null>;
  delete(id: string, screenId: string): Promise<void>;
}
