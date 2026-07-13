"use server";

import { revalidatePath } from "next/cache";
import { addMenu } from "@/application/add-menu";

export interface AddMenuFormValues {
  nameKo: string;
  nameEn: string;
  description: string;
  desiredFeatures: string;
}

export interface AddMenuState {
  error: string | null;
  needsManualCode: boolean;
  values: AddMenuFormValues;
}

const EMPTY_VALUES: AddMenuFormValues = {
  nameKo: "",
  nameEn: "",
  description: "",
  desiredFeatures: "",
};

export async function addMenuAction(
  projectId: string,
  prevState: AddMenuState,
  formData: FormData,
): Promise<AddMenuState> {
  const nameKo = String(formData.get("nameKo") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const desiredFeatures = String(formData.get("desiredFeatures") ?? "").trim();
  const manualMenuCode = String(formData.get("manualMenuCode") ?? "").trim();
  const values: AddMenuFormValues = { nameKo, nameEn, description, desiredFeatures };

  if (!nameKo) {
    return { error: "메뉴명(한글)을 입력해 주세요.", needsManualCode: prevState.needsManualCode, values };
  }
  if (!nameEn) {
    return { error: "메뉴명(영문)을 입력해 주세요.", needsManualCode: prevState.needsManualCode, values };
  }

  const result = await addMenu(projectId, {
    nameKo,
    nameEn,
    description: description || null,
    desiredFeatures: desiredFeatures || null,
    manualMenuCode: manualMenuCode || null,
  });

  if (!result.ok) {
    const error =
      result.reason === "duplicate"
        ? "이미 사용 중인 코드예요, 직접 입력해 주세요."
        : "메뉴코드를 자동으로 만들 수 없어요. 직접 입력해 주세요.";
    return { error, needsManualCode: true, values };
  }

  revalidatePath(`/dashboard/${projectId}/menus`);
  return { error: null, needsManualCode: false, values: EMPTY_VALUES };
}
