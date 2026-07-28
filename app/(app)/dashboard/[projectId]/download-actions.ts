"use server";

import { unlockDownload, type UnlockResult } from "@/application/download";

// 전체 다운로드 버튼이 호출 — 크레딧을 차감해 이 프로젝트 다운로드를 연다.
export async function unlockDownloadAction(projectId: string): Promise<UnlockResult> {
  return unlockDownload(projectId);
}
