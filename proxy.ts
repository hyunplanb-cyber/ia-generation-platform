import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// 세션 쿠키 존재 여부만 확인하는 낙관적(optimistic) 체크다.
// 실제 데이터 소유권 검사(예: 이 프로젝트가 내 것인지)는 여기서 하지 않는다 —
// 아키텍처 스파인 AD-7이 규정한 대로 Application Service의 withProjectAuth가 담당한다.
const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(request: NextRequest) {
  const hasSession = !!getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
