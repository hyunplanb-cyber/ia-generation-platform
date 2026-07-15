"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NotebookPen,
  Network,
  LayoutList,
  FileText,
  Workflow,
  CalendarRange,
  ShieldCheck,
} from "lucide-react";

const INPUT_ITEMS = [{ href: "edit", label: "입력", icon: NotebookPen }];

const DELIVERABLE_ITEMS = [
  { href: "tree", label: "메뉴 구조", icon: Network },
  { href: "screens", label: "IA · 화면 목록", icon: LayoutList },
  { href: "specs", label: "기능정의서", icon: FileText },
  { href: "flow", label: "FLOW", icon: Workflow },
  { href: "wbs", label: "WBS", icon: CalendarRange },
  { href: "admin", label: "관리자 페이지", icon: ShieldCheck },
];

export function ProjectSubNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  function renderItem({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: typeof NotebookPen;
  }) {
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
  }

  return (
    <nav className="flex flex-col gap-4 sm:w-60 sm:shrink-0">
      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          입력
        </p>
        {INPUT_ITEMS.map(renderItem)}
      </div>
      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          생성 산출물
        </p>
        {DELIVERABLE_ITEMS.map(renderItem)}
      </div>
    </nav>
  );
}
