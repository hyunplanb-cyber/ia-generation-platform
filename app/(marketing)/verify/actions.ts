"use server";

import { verifySite, verifyDocument } from "@/application/verify-site";
import { getVerifyQuota } from "@/application/get-verify-quota";
import { requireSession } from "@/application/require-session";
import { drizzleVerifyRunRepository } from "@/adapters/repository/drizzle/verify-run-repository";
import type { VerificationReport } from "@/domain/verify/report";

export interface VerifyState {
  report: VerificationReport | null;
  error: string | null;
  // 무료 검수 횟수를 다 써서 막힌 상태(요금제 준비 중 안내를 띄운다)
  limitReached: boolean;
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

function fail(error: string): VerifyState {
  return { report: null, error, limitReached: false };
}

export async function runVerifyAction(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  // 검수는 로그인 사용자만. (미로그인은 페이지에서 로그인으로 보냄 — 여기선 방어)
  let session;
  try {
    session = await requireSession();
  } catch {
    return fail("로그인이 필요해요. 로그인 후 다시 시도해 주세요.");
  }

  // 무료 횟수 확인. 다 썼으면 실행하지 않고 안내만.
  const quota = await getVerifyQuota();
  if (!quota.allowed) {
    return { report: null, error: null, limitReached: true };
  }

  const mode = String(formData.get("mode") ?? "url");

  let report: VerificationReport;
  if (mode === "document") {
    const file = formData.get("document");
    if (!(file instanceof File) || file.size === 0) {
      return fail("검수할 문서(PDF·PPTX)를 넣어주세요.");
    }
    if (file.size > MAX_DOC_BYTES) {
      return fail("파일이 너무 커요. 8MB 이하로 넣어주세요.");
    }
    const result = await verifyDocument(file.name, await file.arrayBuffer());
    if (!result.ok) return fail(REASON_MESSAGE[result.reason] ?? REASON_MESSAGE.failed);
    report = result.report;
  } else {
    const url = String(formData.get("url") ?? "").trim();
    if (!url) return fail("검사할 사이트 주소를 넣어주세요.");
    const result = await verifySite(url);
    if (!result.ok) return fail(REASON_MESSAGE[result.reason] ?? REASON_MESSAGE.failed);
    report = result.report;
  }

  // 결과 저장(무료 횟수 집계 + 내 프로젝트 연동 기반). 저장 실패가 결과를 막지 않게 방어.
  try {
    await drizzleVerifyRunRepository.create({
      userId: session.user.id,
      projectId: null,
      report,
    });
  } catch (error) {
    console.error("verify 저장 실패", error);
  }

  return { report, error: null, limitReached: false };
}
