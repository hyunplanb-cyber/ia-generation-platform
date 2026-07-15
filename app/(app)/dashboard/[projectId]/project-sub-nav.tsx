"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Lightbulb,
  Palette,
  Network,
  LayoutList,
  FileText,
  Workflow,
  CalendarRange,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const INPUT_ITEMS: NavItem[] = [
  { href: "edit", label: "컨셉 입력", icon: Lightbulb },
  { href: "brief", label: "주요 메뉴·디자인 컨셉", icon: Palette },
];

const DELIVERABLE_ITEMS: NavItem[] = [
  { href: "tree", label: "메뉴 구조", icon: Network },
  { href: "screens", label: "IA · 화면 목록", icon: LayoutList },
  { href: "specs", label: "기능정의서", icon: FileText },
  { href: "flow", label: "FLOW·흐름도", icon: Workflow },
  { href: "wbs", label: "WBS", icon: CalendarRange },
  { href: "admin", label: "관리자 페이지", icon: ShieldCheck },
];

// 입력(소개) 단계로 취급할 화면들 — 나머지는 산출물 단계.
const INPUT_SLUGS = new Set(["edit", "brief", "menus"]);

export function ProjectSubNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${projectId}/`;
  const slug = pathname.startsWith(base) ? pathname.slice(base.length).split("/")[0] : "";
  const phase: "input" | "deliver" = INPUT_SLUGS.has(slug) ? "input" : "deliver";

  const phases = [
    { key: "input" as const, num: 1, label: "프로젝트 소개", entry: "edit" },
    { key: "deliver" as const, num: 2, label: "생성 산출물", entry: "tree" },
  ];
  const items = phase === "input" ? INPUT_ITEMS : DELIVERABLE_ITEMS;

  return (
    <nav className="flex flex-col gap-3">
      {/* 1순위 — 2단계 세그먼트(소개 / 산출물). 가장 크고 눈에 띄게. */}
      <div className="inline-flex w-fit rounded-full border border-border bg-muted/50 p-1.5">
        {phases.map((p) => {
          const active = phase === p.key;
          return (
            <Link
              key={p.key}
              href={`${base}${p.entry}`}
              className={`flex items-center gap-2.5 rounded-full px-6 py-2.5 text-base font-bold transition-colors ${
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`flex size-6 items-center justify-center rounded-full text-sm ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {p.num}
              </span>
              {p.label}
            </Link>
          );
        })}
      </div>

      {/* 2순위 — 활성 단계의 세부 탭 */}
      <div className="flex flex-wrap items-center gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const fullHref = `${base}${href}`;
          const isActive = pathname.startsWith(fullHref);
          return (
            <Link
              key={href}
              href={fullHref}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
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
      </div>
    </nav>
  );
}
