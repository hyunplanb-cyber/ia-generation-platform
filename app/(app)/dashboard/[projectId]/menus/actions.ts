"use server";

import { revalidatePath } from "next/cache";
import { addMenu } from "@/application/add-menu";

export interface AddMenuState {
  error: string | null;
  successToken: number;
}

export async function addMenuAction(
  projectId: string,
  prevState: AddMenuState,
  formData: FormData,
): Promise<AddMenuState> {
  const nameKo = String(formData.get("nameKo") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const desiredFeatures = String(formData.get("desiredFeatures") ?? "").trim();

  if (!nameKo) {
    return { error: "메뉴명(한글)을 입력해 주세요.", successToken: prevState.successToken };
  }
  if (!nameEn) {
    return { error: "메뉴명(영문)을 입력해 주세요.", successToken: prevState.successToken };
  }

  await addMenu(projectId, {
    nameKo,
    nameEn,
    description: description || null,
    desiredFeatures: desiredFeatures || null,
  });

  revalidatePath(`/dashboard/${projectId}/menus`);
  return { error: null, successToken: prevState.successToken + 1 };
}
