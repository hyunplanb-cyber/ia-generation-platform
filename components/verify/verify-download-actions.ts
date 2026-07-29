"use server";

import { unlockVerifyDownload, type UnlockResult } from "@/application/download";

// 검수 시나리오 다운로드 버튼이 호출 — 크레딧을 차감해 이 검수 기록의 다운로드를 연다.
export async function unlockVerifyDownloadAction(runId: string): Promise<UnlockResult> {
  return unlockVerifyDownload(runId);
}
