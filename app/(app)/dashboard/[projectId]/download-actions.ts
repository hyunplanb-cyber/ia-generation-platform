"use server";

import {
  unlockDownload,
  unlockBundle,
  type BundleSelection,
  type UnlockResult,
} from "@/application/download";

// 전체 다운로드 버튼이 호출 — 크레딧을 차감해 이 프로젝트 다운로드를 연다.
export async function unlockDownloadAction(projectId: string): Promise<UnlockResult> {
  return unlockDownload(projectId);
}

// 묶음 다운로드(프롬프트 + 선택한 프리셋·검수)를 한 번에 결제한다.
export async function unlockBundleAction(
  projectId: string,
  selection: BundleSelection,
): Promise<UnlockResult> {
  return unlockBundle(projectId, selection);
}
