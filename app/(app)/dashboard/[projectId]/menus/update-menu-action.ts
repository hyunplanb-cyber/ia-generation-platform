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

  const result = await updateMenu(projectId, menuId, {
    nameKo,
    nameEn,
    description: description || null,
    desiredFeatures: desiredFeatures || null,
  });

  if (!result.ok) {
    const error =
      result.reason === "duplicate"
        ? "영문명을 바꾸면 이미 사용 중인 코드와 겹쳐요. 다른 영문명을 입력해 주세요."
        : "이 영문명으로는 메뉴코드를 만들 수 없어요. 다른 영문명을 입력해 주세요.";
    return { error, editing: true };
  }

  revalidatePath(`/dashboard/${projectId}/menus`);
  revalidatePath(`/dashboard/${projectId}/screens`);
  return { error: null, editing: false };
}
