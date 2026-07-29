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

// 관리자 페이지·사이트 검수는 성격이 달라(별도 생성/별도 행동) 탭에서 잠시 숨긴다.
// 내일 각각 "관리자 백오피스 생성"·"검수" 옵션으로 재배치 예정. 페이지는 남아 있어 직접 URL은 동작.
const DELIVERABLE_ITEMS: NavItem[] = [
  { href: "tree", label: "메뉴 구조", icon: Network },
  { href: "screens", label: "IA · 화면 목록", icon: LayoutList },
  { href: "specs", label: "기능정의서", icon: FileText },
  { href: "flow", label: "FLOW·흐름도", icon: Workflow },
  { href: "wbs", label: "WBS", icon: CalendarRange },
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
          {/* 좌측: 산출물 세부 탭 + (데스크톱) 추가 산출물 요약 */}
          <div className="lg:w-52 lg:shrink-0">
            <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 lg:pt-1">
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
            {/* 데스크톱: 탭 아래 빈 공간에 추가 산출물 요약 */}
            <div className="hidden lg:block">
              <AddonNav base={base} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            {children}
            <AddonSection base={base} />
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}

// 데스크톱 좌측 컬럼(탭 아래)용 컴팩트 요약 — 하단 강조 섹션과 함께 눈에 띄게.
function AddonNav({ base }: { base: string }) {
  const items: {
    href?: string;
    title: string;
    badge: string;
    tone: "ready" | "action" | "soon";
    icon: LucideIcon;
  }[] = [
    { href: `${base}preset`, title: "디자인 프리셋", badge: "4크레딧", tone: "action", icon: Palette },
    {
      href: `${base}verify`,
      title: "검수 시나리오",
      badge: "4크레딧",
      tone: "action",
      icon: ShieldQuestion,
    },
    { href: `${base}admin`, title: "관리자 산출물", badge: "준비 중", tone: "soon", icon: ShieldCheck },
  ];
  return (
    <div className="mt-3">
      <div className="mb-3 h-px bg-border" />
      <p className="mb-1.5 px-1.5 text-sm font-extrabold text-foreground">완성도를 높이세요.</p>
      <div className="flex flex-col">
        {items.map((it) => {
          const Icon = it.icon;
          const badgeClass =
            it.tone === "action"
              ? "bg-primary text-primary-foreground"
              : it.tone === "ready"
                ? "bg-success-soft text-success"
                : "bg-muted text-muted-foreground";
          const inner = (
            <div className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-2 transition-colors hover:bg-muted">
              <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="truncate">{it.title}</span>
              </span>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                {it.badge}
              </span>
            </div>
          );
          return it.href ? (
            <Link key={it.title} href={it.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={it.title}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}

// 완성도를 높이는 추가 산출물 — 기본 탭과 다른 프리미엄 느낌으로 강조.
function AddonSection({ base }: { base: string }) {
  return (
    <section className="mt-8 rounded-2xl border-2 border-primary/25 bg-primary-soft/20 p-5">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h3 className="text-base font-extrabold text-foreground">완성도를 높이는 추가 산출물</h3>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        기본 산출물에 이걸 더하면 실제로 바로 쓸 수 있는 수준으로 올라가요. 필요한 것만 고르세요.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <AddonCard
          href={`${base}preset`}
          icon={Palette}
          title="디자인 프리셋"
          desc="색·글꼴·모서리·밀도를 직접 골라 개발에 바로 쓰는 디자인 시스템 문서를 만들어요."
          badge="생성 · 4크레딧"
          tone="action"
        />
        <AddonCard
          href={`${base}verify`}
          icon={ShieldQuestion}
          title="검수 시나리오"
          desc="설계도 대비 진짜 다 됐는지 확인할 검수 시나리오 + 자동 검사."
          badge="생성 · 4크레딧"
          tone="action"
        />
        <AddonCard
          href={`${base}admin`}
          icon={ShieldCheck}
          title="관리자 산출물"
          desc="회원·상품·주문·통계를 다루는 백오피스 IA 한 벌."
          badge="준비 중"
          tone="soon"
        />
      </div>
    </section>
  );
}

function AddonCard({
  href,
  icon: Icon,
  title,
  desc,
  badge,
  tone,
}: {
  href?: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  badge: string;
  tone: "ready" | "action" | "soon";
}) {
  const badgeClass =
    tone === "action"
      ? "bg-primary text-primary-foreground"
      : tone === "ready"
        ? "bg-success-soft text-success"
        : "bg-muted text-muted-foreground";
  const inner = (
    <div
      className={`flex h-full flex-col gap-1.5 rounded-xl border border-border bg-background p-4 transition-all ${
        href ? "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md" : ""
      }`}
    >
      <span className="flex items-center gap-2 font-bold text-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
          <Icon className="size-4" />
        </span>
        {title}
      </span>
      <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      <span className={`mt-1 w-fit rounded-md px-2 py-0.5 text-xs font-bold ${badgeClass}`}>
        {badge}
      </span>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
