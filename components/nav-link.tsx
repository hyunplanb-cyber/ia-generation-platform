"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 상단 메뉴 한 칸. 현재 경로가 이 메뉴에 해당하면 아래 라인으로 위치를 표시한다.
//
// 640px(sm)이 아니라 1024px(lg)부터 펼치는 이유: 메뉴 다섯 칸에 로그인·회원가입까지
// 한 줄에 세우려면 964px가 필요한데, 640px부터 펼치면 그 사이 구간에서 헤더가
// 화면 밖으로 밀려나간다(실측 2026-08-08). 그 아래는 메뉴 버튼이 맡는다.
// match(활성 판정 경로 접두사)를 안 주면 href로 판정한다.
// icon은 컴포넌트가 아니라 "렌더된 요소"로 받는다 — 서버→클라이언트 경계에서
// 함수(컴포넌트)는 넘길 수 없기 때문(아이콘 element는 넘길 수 있다).
export function NavLink({
  href,
  match,
  exact,
  noLine,
  icon,
  children,
  prefetch,
}: {
  href: string;
  match?: string; // 활성 판정 경로. "/로 끝나면" 그 접두사로 시작하면 활성(하위 전체).
  exact?: boolean; // 정확히 일치할 때만 활성
  noLine?: boolean; // 활성 시 밑줄 없이 색만
  icon: React.ReactNode;
  children: React.ReactNode;
  prefetch?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const base = match ?? href;
  const active = exact
    ? pathname === base
    : base.endsWith("/")
      ? pathname.startsWith(base)
      : pathname === base || pathname.startsWith(`${base}/`);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-current={active ? "page" : undefined}
      className={`relative hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors lg:flex ${
        active
          ? `text-primary ${
              noLine
                ? ""
                : "after:absolute after:inset-x-3 after:-bottom-[11px] after:h-0.5 after:rounded-full after:bg-primary"
            }`
          : "text-foreground/80 hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
