"use server";

import { revalidatePath } from "next/cache";
import { updateMenu } from "@/application/update-menu";

export interface UpdateMenuState {
  error: string | null;
  editing: boolean;
}

export async function updateMenuAction(
  projectId: string,
  menuId: string,
  _prevState: UpdateMenuState,
  formData: FormData,
): Promise<UpdateMenuState> {
  const nameKo = String(formData.get("nameKo") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const desiredFeatures = String(formData.get("desiredFeatures") ?? "").trim();

  if (!nameKo) {
    return { error: "메뉴명(한글)을 입력해 주세요.", editing: true };
  }
  if (!nameEn) {
    return { error: "메뉴명(영문)을 입력해 주세요.", editing: true };
  }

  await updateMenu(projectId, menuId, {
    nameKo,
    nameEn,
    description: description || null,
    desiredFeatures: desiredFeatures || null,
  });

  revalidatePath(`/dashboard/${projectId}/menus`);
  return { error: null, editing: false };
}
