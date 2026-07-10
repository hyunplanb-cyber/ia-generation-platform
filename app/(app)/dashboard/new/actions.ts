"use server";

import { redirect } from "next/navigation";
import { createProject } from "@/application/create-project";
import { extractPdfText } from "@/lib/extract-pdf-text";
import { requireSession } from "@/application/require-session";

export interface CreateProjectState {
  error: string | null;
}

export async function createProjectAction(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const concept = String(formData.get("concept") ?? "").trim();
  const menuDraft = String(formData.get("menuDraft") ?? "").trim();
  const designConcept = String(formData.get("designConcept") ?? "").trim();
  const overallStart = String(formData.get("overallStart") ?? "");
  const overallEnd = String(formData.get("overallEnd") ?? "");

  if (!concept) {
    return { error: "컨셉/설명을 입력해 주세요." };
  }
  if (!overallStart || !overallEnd) {
    return { error: "전체 시작일과 종료일을 입력해 주세요." };
  }
  if (overallEnd < overallStart) {
    return { error: "종료일은 시작일보다 빠를 수 없어요." };
  }

  await createProject({
    concept,
    menuDraft: menuDraft || null,
    designConcept: designConcept || null,
    overallStart,
    overallEnd,
  });
  redirect("/dashboard");
}

export interface ExtractPdfTextResult {
  text?: string;
  error?: string;
}

export async function extractPdfTextAction(formData: FormData): Promise<ExtractPdfTextResult> {
  // 로그인한 사용자만 서버 리소스(PDF 파싱)를 쓸 수 있도록 확인.
  await requireSession();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "PDF 파일을 선택해 주세요." };
  }
  if (file.type !== "application/pdf") {
    return { error: "PDF 파일만 업로드할 수 있어요." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "파일 크기는 10MB 이하로 올려주세요." };
  }

  try {
    const buffer = await file.arrayBuffer();
    const text = await extractPdfText(buffer);
    if (!text) {
      return { error: "PDF에서 텍스트를 찾지 못했어요." };
    }
    return { text };
  } catch {
    return { error: "PDF를 읽지 못했어요. 다른 파일로 시도해 주세요." };
  }
}
