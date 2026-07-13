"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, ListChecks } from "lucide-react";

const NAV_ITEMS = [
  { href: "edit", label: "설정", icon: Settings },
  { href: "menus", label: "메뉴 관리", icon: ListChecks },
];

export function ProjectSubNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 sm:w-60 sm:shrink-0 sm:flex-col">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const fullHref = `/dashboard/${projectId}/${href}`;
        const isActive = pathname.startsWith(fullHref);
        return (
          <Link
            key={href}
            href={fullHref}
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary-soft text-primary-on-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
