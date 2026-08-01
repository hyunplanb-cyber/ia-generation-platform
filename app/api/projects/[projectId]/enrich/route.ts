import { NextResponse } from "next/server";
import { enrichForDownload } from "@/application/enrich-download";
import { ProjectNotFoundError } from "@/application/with-project-auth";

// 화면이 100개 넘으면 묶음이 수십 개다. 서버 액션의 기본 제한(60초)으로는 모자라
// 별도 라우트로 뺐다 — 이 값이 다운로드 앞의 대기 시간 상한이다.
export const maxDuration = 300;

// 다운로드 직전 보강. 클라이언트가 결제 뒤·zip 만들기 전에 한 번 부른다.
// 이미 보강한 화면은 서버가 알아서 건너뛰므로 여러 번 불러도 안전하다.
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  try {
    const result = await enrichForDownload(projectId);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      return NextResponse.json({ ok: false, reason: "not-found" }, { status: 404 });
    }
    throw error;
  }
}
