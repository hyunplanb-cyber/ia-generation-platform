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
  ShieldQuestion,
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
    slugs: ["tree", "screens", "specs", "flow", "wbs", "admin", "verify"],
  },
];

const DELIVERABLE_ITEMS: NavItem[] = [
  { href: "tree", label: "메뉴 구조", icon: Network },
  { href: "screens", label: "IA · 화면 목록", icon: LayoutList },
  { href: "specs", label: "기능정의서", icon: FileText },
  { href: "flow", label: "FLOW·흐름도", icon: Workflow },
  { href: "wbs", label: "WBS", icon: CalendarRange },
  { href: "admin", label: "관리자 페이지", icon: ShieldCheck },
  { href: "verify", label: "사이트 검수", icon: ShieldQuestion },
];

// 상단 스텝퍼 + (산출물 단계에서만) 좌측 세로 탭 + 콘텐츠 레이아웃을 함께 그린다.
export function ProjectShell({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/dashboard/${projectId}/`;
  const slug = pathname.startsWith(base) ? pathname.slice(base.length).split("/")[0] : "";

  let activeIndex = STEPS.findIndex((s) => s.slugs.includes(slug));
  if (activeIndex === -1) activeIndex = 2;
  const isDeliver = activeIndex === 2;

  const activeStep = STEPS[activeIndex];
  const ActiveIcon = activeStep.icon;

  return (
    <div className="flex flex-col gap-5">
      {/* 모바일 스텝퍼 — 현재 스텝 하나만 크게 보이고, 오른쪽 점으로 3단계 위치를 표시한다.
          예전엔 데스크톱용 3단 스텝퍼가 좁은 화면을 넘쳐 페이지가 좌우로 밀렸다.
          점(dot)은 각 단계로 이동하는 링크라 앞뒤 이동도 된다. */}
      <div className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-3.5 text-primary-foreground shadow-md sm:hidden">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
          <ActiveIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-primary-foreground/75">
            {activeStep.title} · {STEPS.length}단계 중 {activeIndex + 1}
          </p>
          <p className="truncate text-lg font-extrabold tracking-tight">{activeStep.label}</p>
        </div>
        <ol className="flex shrink-0 items-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.entry} className="flex">
              <Link
                href={`${base}${s.entry}`}
                aria-label={`${s.title} ${s.label}`}
                aria-current={i === activeIndex ? "step" : undefined}
                className={`block rounded-full transition-all ${
                  i === activeIndex
                    ? "size-2.5 bg-primary-foreground"
                    : i < activeIndex
                      ? "size-2 bg-primary-foreground/70"
                      : "size-2 bg-primary-foreground/35"
                }`}
              />
            </li>
          ))}
        </ol>
      </div>

      {/* 데스크톱 스텝퍼 — 상단 풀와이드 3단(모바일에서는 위 컴팩트 버전으로 대체) */}
      <ol className="hidden w-full items-stretch gap-3 sm:flex">
        {STEPS.map((step, i) => {
          const state = i === activeIndex ? "active" : i < activeIndex ? "done" : "todo";
          const Icon = step.icon;
          return (
            <Fragment key={step.entry}>
              <li className="flex-1">
                <Link
                  href={`${base}${step.entry}`}
                  aria-current={state === "active" ? "step" : undefined}
                  className={`flex h-full items-center justify-center gap-3 rounded-2xl px-6 py-4 transition-colors ${
                    state === "active"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : state === "done"
                        ? "bg-primary-soft text-primary-on-soft hover:bg-primary-soft/80"
                        : "bg-muted text-foreground/70 hover:bg-muted/70"
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                      state === "active"
                        ? "bg-primary-foreground/20"
                        : state === "done"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground"
                    }`}
                  >
                    {state === "done" ? <Check className="size-5" /> : <Icon className="size-5" />}
                  </span>
                  <span className="flex items-baseline gap-2 whitespace-nowrap">
                    <span
                      className={`text-sm font-bold ${
                        state === "active" ? "text-primary-foreground/75" : "opacity-60"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-xl font-extrabold tracking-tight">{step.label}</span>
                  </span>
                </Link>
              </li>
              {i < STEPS.length - 1 && (
                <ChevronRight className="size-7 shrink-0 self-center text-muted-foreground/50" />
              )}
            </Fragment>
          );
        })}
      </ol>

      {isDeliver ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* 좌측 산출물 세부 탭 (세로) */}
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:w-52 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0 lg:pt-1">
            {DELIVERABLE_ITEMS.map(({ href, label, icon: Icon }) => {
              const fullHref = `${base}${href}`;
              const isActive = pathname.startsWith(fullHref);
              return (
                <Link
                  key={href}
                  href={fullHref}
                  className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
