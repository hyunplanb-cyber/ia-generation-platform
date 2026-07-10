import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// 세션 쿠키 존재 여부만 확인하는 낙관적(optimistic) 체크다.
// 실제 데이터 소유권 검사(예: 이 프로젝트가 내 것인지)는 여기서 하지 않는다 —
// 아키텍처 스파인 AD-7이 규정한 대로 Application Service의 withProjectAuth가 담당한다.
//
// /login·/signup에서 "이미 로그인함 → /dashboard로 보내기"는 여기서 하지 않는다.
// 쿠키는 있지만 세션이 만료/삭제된 상태(stale cookie)일 때, 여기서 낙관적으로
// /dashboard로 보내면 (app)/layout.tsx의 실제 세션 검증이 다시 /login으로 돌려보내
// 무한 리다이렉트 루프가 생긴다. 그래서 그 판단은 실제 세션을 조회할 수 있는
// login/signup 페이지(Server Component)가 직접 한다.
export function proxy(request: NextRequest) {
  const hasSession = !!getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
