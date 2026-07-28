"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// GNB 메뉴 한 칸. 현재 경로가 이 메뉴에 해당하면 아래 라인으로 위치를 표시한다.
// match(활성 판정 경로 접두사)를 안 주면 href로 판정한다.
// icon은 컴포넌트가 아니라 "렌더된 요소"로 받는다 — 서버→클라이언트 경계에서
// 함수(컴포넌트)는 넘길 수 없기 때문(아이콘 element는 넘길 수 있다).
export function NavLink({
  href,
  match,
  icon,
  children,
  prefetch,
}: {
  href: string;
  match?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  prefetch?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const base = match ?? href;
  const active = pathname === base || pathname.startsWith(`${base}/`);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-current={active ? "page" : undefined}
      className={`relative hidden items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors sm:flex ${
        active
          ? "text-primary after:absolute after:inset-x-3 after:-bottom-[11px] after:h-0.5 after:rounded-full after:bg-primary"
          : "text-foreground/80 hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
