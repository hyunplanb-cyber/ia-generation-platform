"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Network,
  LayoutList,
  FileText,
  Workflow,
  CalendarRange,
  ShieldCheck,
  ShieldQuestion,
  Palette,
  Sparkles,
  ArrowRight,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { DeleteProjectButton } from "./delete-project-button";
import { VerifyReportView } from "@/components/verify/verify-report-view";
import { buildPresetSummary, parsePresetConfig } from "@/lib/design-presets";
import type { ProjectResult } from "@/application/list-project-results";

type TabKey = "screens" | "tree" | "specs" | "flow" | "wbs" | "preset" | "verify" | "admin";

const TABS: { key: TabKey; label: string; icon: LucideIcon; href: string }[] = [
  { key: "screens", label: "IA · 화면 목록", icon: LayoutList, href: "screens" },
  { key: "tree", label: "메뉴 구조", icon: Network, href: "tree" },
  { key: "specs", label: "기능정의서", icon: FileText, href: "specs" },
  { key: "flow", label: "FLOW · 흐름도", icon: Workflow, href: "flow" },
  { key: "wbs", label: "WBS", icon: CalendarRange, href: "wbs" },
  { key: "preset", label: "디자인 프리셋", icon: Palette, href: "preset" },
  { key: "verify", label: "검수 시나리오", icon: ShieldQuestion, href: "verify" },
  { key: "admin", label: "관리자 페이지", icon: ShieldCheck, href: "admin" },
];

const REQ_TONE: Record<string, string> = {
  기능: "bg-primary-soft text-primary-on-soft",
  콘텐츠: "bg-pastel-mint text-pastel-mint-foreground",
  "UI/UX": "bg-muted text-muted-foreground",
  정책: "bg-warning-soft text-warning",
  기타: "bg-neutral-badge-soft text-neutral-badge",
};

// 산출물 탭 — 선택하면 이동하지 않고 아래에 미리보기를 보여준다.
export function ProjectDeliverablePreview({
  projectId,
  result,
}: {
  projectId: string;
  result: ProjectResult;
}) {
  const [tab, setTab] = useState<TabKey>("screens");
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="flex flex-col gap-4">
      {/* 탭 + 삭제 */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                on
                  ? "border-primary bg-primary-soft text-primary-on-soft"
                  : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted"
              }`}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          );
        })}
        <div className="ml-auto">
          <DeleteProjectButton projectId={projectId} />
        </div>
      </div>

      {/* 미리보기 */}
      <div className="rounded-xl border border-border bg-muted/10 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{active.label} 미리보기</p>
          <Link
            href={`/dashboard/${projectId}/${active.href}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            자세히 열기 <ExternalLink className="size-3.5" />
          </Link>
        </div>

        {tab === "screens" && <ScreensPreview result={result} />}
        {tab === "tree" && <TreePreview result={result} />}
        {tab === "specs" && <SpecsPreview result={result} />}
        {tab === "flow" && <FlowPreview result={result} />}
        {tab === "wbs" && <WbsPreview result={result} />}
        {tab === "preset" && <PresetPreview projectId={projectId} result={result} />}
        {tab === "verify" && <VerifyPreview projectId={projectId} result={result} />}
        {tab === "admin" && <AdminPreview />}
      </div>
    </div>
  );
}

// IA · 화면 목록 — 메뉴별 화면
function ScreensPreview({ result }: { result: ProjectResult }) {
  return (
    <div className="flex flex-col gap-4">
      {result.menus.map((m) => {
        const scns = result.screens.filter((s) => s.menuId === m.id);
        if (scns.length === 0) return null;
        return (
          <div key={m.id}>
            <p className="mb-1.5 text-sm font-semibold text-foreground">
              {m.nameKo}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                화면 {scns.length}개
              </span>
            </p>
            <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {scns.map((s) => (
                <li key={s.id} className="flex items-baseline gap-2 text-sm text-muted-foreground">
                  <span className="font-mono text-xs text-foreground/60">{s.pageId}</span>
                  <span className="min-w-0 truncate text-foreground">
                    {s.screenGroup ? `${s.screenGroup} · ${s.pageName}` : s.pageName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// 메뉴 구조 — 트리 다이어그램(루트 → 메뉴 → 화면)
function TreePreview({ result }: { result: ProjectResult }) {
  const { menus, screens } = result;
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full flex-col items-center px-4 py-2">
        {/* 루트 */}
        <div className="rounded-md border border-border bg-muted px-5 py-2 text-sm font-bold text-foreground">
          사이트 전체
        </div>

        {menus.length > 0 && (
          <>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-start">
              {menus.map((menu, i) => {
                const menuScreens = screens.filter((s) => s.menuId === menu.id);
                const isFirst = i === 0;
                const isLast = i === menus.length - 1;
                const busClass =
                  menus.length === 1
                    ? "hidden"
                    : isFirst
                      ? "left-1/2 right-0"
                      : isLast
                        ? "left-0 right-1/2"
                        : "inset-x-0";
                return (
                  <div key={menu.id} className="flex flex-col items-center px-3">
                    <div className="relative h-6 w-full">
                      <div className={`absolute top-0 h-px bg-border ${busClass}`} />
                      <div className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-border" />
                    </div>

                    {/* 메뉴 */}
                    <div className="whitespace-nowrap rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-sm">
                      {menu.nameKo}
                      <span className="ml-1.5 font-mono text-xs opacity-75">{menu.menuCode}</span>
                    </div>

                    {/* 화면들 */}
                    {menuScreens.length > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-px bg-border" />
                        {menuScreens.map((s, idx) => (
                          <div key={s.id} className="flex flex-col items-center">
                            {idx > 0 && <div className="h-2.5 w-px bg-border" />}
                            <div className="min-w-[9.5rem] rounded-md border border-border bg-background px-3 py-1.5 text-center shadow-sm">
                              <div className="text-xs font-medium text-foreground">{s.pageName}</div>
                              <div className="font-mono text-[11px] text-muted-foreground">
                                {s.pageId}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// 기능정의서 — 업무 · 기능 · 구성 · 유형
function SpecsPreview({ result }: { result: ProjectResult }) {
  const rows = result.requirements;
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">아직 요건이 없어요.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold text-muted-foreground">
            <th className="py-1.5 pr-3">ID</th>
            <th className="py-1.5 pr-3">업무</th>
            <th className="py-1.5 pr-3">기능</th>
            <th className="py-1.5 pr-3">구성</th>
            <th className="py-1.5">유형</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">{r.reqId}</td>
              <td className="py-1.5 pr-3 font-medium text-foreground">{r.업무}</td>
              <td className="py-1.5 pr-3 text-foreground">{r.기능}</td>
              <td className="py-1.5 pr-3 text-muted-foreground">{r.구성}</td>
              <td className="py-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${REQ_TONE[r.유형] ?? REQ_TONE.기타}`}
                >
                  {r.유형}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// FLOW · 흐름도 — 화면 이동
function FlowPreview({ result }: { result: ProjectResult }) {
  if (result.flow.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">아직 화면 이동(버튼 연결)이 없어요.</p>
    );
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {result.flow.map((e, i) => (
        <li key={i} className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="rounded-md bg-background px-2 py-0.5 font-medium text-foreground">
            {e.from}
          </span>
          {e.label && <span className="text-xs text-muted-foreground">[{e.label}]</span>}
          <ArrowRight className="size-3.5 text-muted-foreground/60" />
          <span className="rounded-md bg-background px-2 py-0.5 font-medium text-foreground">
            {e.to}
          </span>
        </li>
      ))}
    </ul>
  );
}

// WBS — 화면별 일정
function WbsPreview({ result }: { result: ProjectResult }) {
  return (
    <ul className="flex flex-col gap-1">
      {result.screens.map((s) => (
        <li
          key={s.id}
          className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-border/50 py-1.5 text-sm"
        >
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="font-mono text-xs text-foreground/60">{s.pageId}</span>
            <span className="truncate text-foreground">{s.pageName}</span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {s.scheduleStart && s.scheduleEnd ? `${s.scheduleStart} ~ ${s.scheduleEnd}` : "일정 미정"}
          </span>
        </li>
      ))}
    </ul>
  );
}

// 아직 생성 안 한 산출물 — 마케팅 문구 + 생성하기 버튼.
function GenerateCta({
  icon: Icon,
  title,
  desc,
  href,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-primary/40 bg-primary-soft/10 px-4 py-5">
      <span className="flex items-center gap-2 font-bold text-foreground">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
          <Icon className="size-4" />
        </span>
        {title}
      </span>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Sparkles className="size-4" />
        {cta}
      </Link>
    </div>
  );
}

// 디자인 프리셋 — 생성됐으면 요약, 아니면 생성 유도.
function PresetPreview({ projectId, result }: { projectId: string; result: ProjectResult }) {
  if (!result.presetConfig) {
    return (
      <GenerateCta
        icon={Palette}
        title="디자인 프리셋으로 완성도를 높이세요"
        desc="색·글꼴·모서리·밀도를 직접 골라 개발에 바로 쓰는 디자인 시스템을 만들어요. 통일된 디자인이 사이트 퀄리티를 완성합니다."
        href={`/dashboard/${projectId}/preset`}
        cta="디자인 프리셋 만들기"
      />
    );
  }
  const sum = buildPresetSummary(parsePresetConfig(result.presetConfig, result.designConcept));
  const swatch = (label: string, hex: string) => (
    <div key={label} className="flex items-center gap-1.5">
      <span className="size-5 rounded-md ring-1 ring-black/10" style={{ backgroundColor: hex }} />
      <span className="font-mono text-[11px] text-muted-foreground">{hex}</span>
    </div>
  );
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {sum.baseName} · {sum.fontLabel} · {sum.dark ? "다크" : "라이트"}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {sum.palette.map(([k, v]) => swatch(k, v))}
        {swatch("bg", sum.bg)}
        {swatch("text", sum.text)}
        {swatch("border", sum.border)}
      </div>
      <p className="text-xs text-muted-foreground">
        모서리 카드 {sum.radius.card} · 버튼 {sum.radius.button} · 밀도 {sum.densityLabel}
      </p>
    </div>
  );
}

// 검수 시나리오 — 생성됐으면 최근 결과 미리보기, 아니면 생성 유도.
function VerifyPreview({ projectId, result }: { projectId: string; result: ProjectResult }) {
  if (!result.latestVerifyReport) {
    return (
      <GenerateCta
        icon={ShieldQuestion}
        title="검수 시나리오로 오픈 전에 꼭 확인하세요"
        desc="생성된 산출물 기준으로, 화면·버튼·기능이 진짜 다 되는지 확인할 검수 시나리오를 만들어드려요."
        href={`/dashboard/${projectId}/verify`}
        cta="검수 시나리오 만들기"
      />
    );
  }
  return <VerifyReportView report={result.latestVerifyReport} preview />;
}

// 관리자 페이지 — 선택 산출물(준비 중)
function AdminPreview() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-background px-4 py-4 text-sm">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
      <p className="text-muted-foreground">
        관리자 페이지는 필요할 때만 만드는 <b className="font-semibold text-foreground">선택 산출물</b>
        이에요. 회원·콘텐츠·통계를 관리할 백오피스가 필요하면 관리자용 메뉴·화면을 따로 생성해요.
        <br />
        (자동 생성은 준비 중이에요.)
      </p>
    </div>
  );
}
