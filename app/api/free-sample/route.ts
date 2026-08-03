import { FREE_SAMPLE_BASE64, FREE_SAMPLE_FILENAME } from "@/lib/free-sample-data";

// 무료 샘플 다운로드. 누구나 받을 수 있다.
//
// 처음엔 로그인을 요구했다 — 인스타 유입을 회원으로 남기려는 의도였다. 풀어준 이유는,
// 우리를 처음 본 사람에게 아무것도 안 보여준 채 가입부터 시키는 셈이라 대부분 그냥 나가고,
// 실제로 남은 명단도 몇 줄에 그쳤기 때문이다(2026-08-03).
// "AI팩이 뭐냐"는 말로 설명이 안 되고 파일을 열어봐야 안다. 그러니 파일이 곧 광고다.
// 가입 요청은 없애지 않고 다운로드 **뒤로** 옮겼다(free/download-cta.tsx) —
// 값을 보고 난 사람에게 묻는 편이 훨씬 잘 통한다.
//
// 파일은 19KB 상수라 서버 비용도, AI 비용도 들지 않는다. 막아서 아낄 게 없다.
export async function GET() {
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
