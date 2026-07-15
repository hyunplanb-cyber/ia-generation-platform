"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PencilLine,
  Palette,
  Sparkles,
  Check,
  ChevronRight,
  Network,
  LayoutList,
  FileText,
  Workflow,
  CalendarRange,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

// 3단계 스텝퍼 — 컨셉 입력 → 메뉴·디자인 → 생성 산출물
const STEPS: { entry: string; title: string; label: string; icon: LucideIcon; slugs: string[] }[] = [
  { entry: "edit", title: "STEP 1", label: "컨셉 입력", icon: PencilLine, slugs: ["edit"] },
  { entry: "brief", title: "STEP 2", label: "메뉴·디자인 컨셉", icon: Palette, slugs: ["brief", "menus"] },
  {
    entry: "tree",
    title: "STEP 3",
    label: "생성 산출물",
    icon: Sparkles,
    slugs: ["tree", "screens", "specs", "flow", "wbs", "admin"],
  },
];

const DELIVERABLE_ITEMS: NavItem[] = [
  { href: "tree", label: "메뉴 구조", icon: Network },
  { href: "screens", label: "IA · 화면 목록", icon: LayoutList },
  { href: "specs", label: "기능정의서", icon: FileText },
  { href: "flow", label: "FLOW·흐름도", icon: Workflow },
  { href: "wbs", label: "WBS", icon: CalendarRange },
  { href: "admin", label: "관리자 페이지", icon: ShieldCheck },
];

export function ProjectSubNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${projectId}/`;
  const slug = pathname.startsWith(base) ? pathname.slice(base.length).split("/")[0] : "";

  let activeIndex = STEPS.findIndex((s) => s.slugs.includes(slug));
  if (activeIndex === -1) activeIndex = 2; // 알 수 없는 하위 경로는 산출물 단계로

  return (
    <nav className="flex flex-col gap-5">
      {/* 스텝퍼 */}
      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((step, i) => {
          const state = i === activeIndex ? "active" : i < activeIndex ? "done" : "todo";
          const Icon = step.icon;
          return (
            <Fragment key={step.entry}>
              <li>
                <Link
                  href={`${base}${step.entry}`}
                  aria-current={state === "active" ? "step" : undefined}
                  className={`flex items-center gap-3.5 rounded-2xl px-6 py-3.5 transition-colors ${
                    state === "active"
                      ? "bg-primary text-primary-foreground shadow-md"
                      : state === "done"
                        ? "bg-primary-soft text-primary-on-soft hover:bg-primary-soft/80"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
                      state === "active"
                        ? "bg-primary-foreground/20"
                        : state === "done"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground"
                    }`}
                  >
                    {state === "done" ? <Check className="size-6" /> : <Icon className="size-6" />}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span
                      className={`text-lg font-extrabold tracking-tight ${
                        state === "active" ? "text-primary-foreground" : ""
                      }`}
                    >
                      {step.title}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        state === "active" ? "text-primary-foreground/85" : "opacity-80"
                      }`}
                    >
                      {step.label}
                    </span>
                  </span>
                </Link>
              </li>
              {i < STEPS.length - 1 && (
                <ChevronRight className="size-6 shrink-0 text-muted-foreground/50" />
              )}
            </Fragment>
          );
        })}
      </ol>

      {/* 산출물 단계에서만 세부 탭 노출 */}
      {activeIndex === 2 && (
        <div className="flex flex-wrap items-center gap-1 border-t border-border pt-3">
          {DELIVERABLE_ITEMS.map(({ href, label, icon: Icon }) => {
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
      )}
    </nav>
  );
}
