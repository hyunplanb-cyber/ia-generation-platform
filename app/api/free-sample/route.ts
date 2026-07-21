import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { FREE_SAMPLE_BASE64, FREE_SAMPLE_FILENAME } from "@/lib/free-sample-data";

// 무료 샘플 다운로드. 로그인한 사용자에게만 내려준다 —
// 인스타 유입을 "파일만 받고 사라지는 방문자"가 아니라 회원으로 남기기 위함.
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("로그인이 필요해요.", { status: 401 });
  }

  const bytes = Buffer.from(FREE_SAMPLE_BASE64, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/zip",
      // 한글 파일명은 filename*(RFC 5987)으로 전달해야 깨지지 않는다.
      "Content-Disposition": `attachment; filename="free-sample.zip"; filename*=UTF-8''${encodeURIComponent(FREE_SAMPLE_FILENAME)}`,
      "Content-Length": String(bytes.length),
      "Cache-Control": "no-store",
    },
  });
}
