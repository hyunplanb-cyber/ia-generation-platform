"use server";

import { verifySite, verifyDocument } from "@/application/verify-site";
import type { VerificationReport } from "@/domain/verify/report";

export interface VerifyState {
  report: VerificationReport | null;
  error: string | null;
}

const MAX_DOC_BYTES = 8 * 1024 * 1024; // 8MB

const REASON_MESSAGE: Record<string, string> = {
  "bad-url": "주소 형식이 올바르지 않아요. https://내사이트.com 형태로 넣어주세요.",
  unreachable: "사이트에 접속하지 못했어요. 주소와 배포 상태를 확인해 주세요.",
  "unsupported-doc": "PDF 또는 PPTX 파일만 넣어주세요. (피그마·워드·한글은 PDF로 내보내면 돼요.)",
  "empty-doc": "문서에서 읽을 글자를 찾지 못했어요. 화면명·요건이 글로 적힌 문서일수록 좋아요.",
  unavailable: "지금은 검수를 이용할 수 없어요. 잠시 후 다시 시도해 주세요.",
  failed: "검수 중 문제가 있었어요. 다시 시도해 주세요.",
};

export async function runVerifyAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const mode = String(formData.get("mode") ?? "url");

  if (mode === "document") {
    const file = formData.get("document");
    if (!(file instanceof File) || file.size === 0) {
      return { report: null, error: "검수할 문서(PDF·PPTX)를 넣어주세요." };
    }
    if (file.size > MAX_DOC_BYTES) {
      return { report: null, error: "파일이 너무 커요. 8MB 이하로 넣어주세요." };
    }
    const bytes = await file.arrayBuffer();
    const result = await verifyDocument(file.name, bytes);
    if (!result.ok) {
      return { report: null, error: REASON_MESSAGE[result.reason] ?? REASON_MESSAGE.failed };
    }
    return { report: result.report, error: null };
  }

  const url = String(formData.get("url") ?? "").trim();
  if (!url) {
    return { report: null, error: "검사할 사이트 주소를 넣어주세요." };
  }
  const result = await verifySite(url);
  if (!result.ok) {
    return { report: null, error: REASON_MESSAGE[result.reason] ?? REASON_MESSAGE.failed };
  }
  return { report: result.report, error: null };
}
