"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Network,
  LayoutList,
  FileText,
  Workflow,
  CalendarRange,
  Bot,
  ArrowRight,
  ShieldQuestion,
  PencilRuler,
  Link2,
  Check,
  X,
  Lock,
  ListChecks,
  Search,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  MenuTreeMockup,
  ScreenListMockup,
  SpecMockup,
  FlowMockup,
  WbsMockup,
  SpecPackMockup,
} from "./deliverable-mockups";

type Deliverable = {
  icon: LucideIcon;
  tone: string;
  name: string;
  role: string;
  formats: string[];
  mockup: React.ReactNode;
};

const DELIVERABLES: Deliverable[] = [
  {
    icon: Network,
    tone: "bg-primary-soft text-primary-on-soft",
    name: "메뉴 구조",
    role: "사이트 전체 메뉴를 트리로 정리해 정보구조(IA)의 뼈대를 잡아요. 어떤 메뉴 아래 어떤 화면이 들어가는지 한눈에 확정할 수 있어, 기획의 출발점이 됩니다.",
    formats: ["PPT", "엑셀"],
    mockup: <MenuTreeMockup />,
  },
  {
    icon: LayoutList,
    tone: "bg-pastel-mint text-pastel-mint-foreground",
    name: "IA · 화면 목록",
    role: "메뉴별로 필요한 화면을 자동으로 뽑아 목록으로 정리해요. 화면ID·화면명·기능정의·버튼 이동·AI 생성 프롬프트까지 화면 단위로 담겨, ‘무엇을 만들지’가 확정돼요.",
    formats: ["엑셀"],
    mockup: <ScreenListMockup />,
  },
  {
    icon: FileText,
    tone: "bg-muted text-foreground",
    name: "기능정의서",
    role: "사이트에 필요한 요건을 업무 · 기능 · 구성 계층으로 분해하고, 종류(기능·콘텐츠·화면·정책)를 붙여 정리한 문서예요. 실무 문서 형식 그대로 내려받을 수 있어요.",
    formats: ["엑셀"],
    mockup: <SpecMockup />,
  },
  {
    icon: Workflow,
    tone: "bg-pastel-mint text-pastel-mint-foreground",
    name: "FLOW · 흐름도",
    role: "화면과 화면 사이의 이동을 다이어그램으로 그려요. 어느 화면의 어떤 버튼을 누르면 어디로 가는지, 사용자 동선을 한눈에 볼 수 있어요.",
    formats: ["HTML", "draw.io"],
    mockup: <FlowMockup />,
  },
  {
    icon: CalendarRange,
    tone: "bg-muted text-foreground",
    name: "개발 일정표",
    role: "화면(작업)별 제작 일정을 정리해요. 전체 일정을 입력하면 화면 수에 맞춰 일정 초안을 자동으로 나눠주고, 손으로 조정한 화면은 그대로 유지돼요.",
    formats: ["엑셀"],
    mockup: <WbsMockup />,
  },
  {
    icon: Bot,
    tone: "bg-primary-soft text-primary-on-soft",
    name: "AI 빌드 지시서",
    role: "위 모든 걸 한 벌로 정리한 마크다운·JSON이에요. 이 파일을 Claude Code·Cowork 같은 AI 코딩 도구에 그대로 넘기면, 화면 구성·이동·화면별 지시가 확정된 상태로 사이트가 만들어져요.",
    formats: ["마크다운", "JSON"],
    mockup: <SpecPackMockup />,
  },
];

type Tab = "planning" | "verify";

export function DeliverablesTabs() {
  const [tab, setTab] = useState<Tab>("planning");

  return (
    <div className="flex flex-col">
      {/* 탭 전환 — AI팩 / 사이트 검수 */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-5xl gap-1 px-6">
          <TabButton active={tab === "planning"} onClick={() => setTab("planning")} icon={PencilRuler}>
            AI팩
          </TabButton>
          <TabButton active={tab === "verify"} onClick={() => setTab("verify")} icon={ShieldQuestion}>
            사이트 검수
          </TabButton>
        </div>
      </div>

      {tab === "planning" ? <PlanningDeliverables /> : <VerifyDeliverable />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="size-4" />
      {children}
    </button>
  );
}

// AI팩 결과물 6종
function PlanningDeliverables() {
  return (
    <div className="flex flex-col">
      {DELIVERABLES.map((d, i) => {
        const Icon = d.icon;
        const reversed = i % 2 === 1;
        return (
          <section key={d.name} className={`border-b border-border ${reversed ? "bg-surface" : ""}`}>
            <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16">
              <div className={reversed ? "lg:order-2" : ""}>
                <div className="flex items-center gap-3">
                  <span className={`flex size-11 items-center justify-center rounded-xl ${d.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-foreground">{d.name}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{d.role}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {d.formats.map((f) => (
                    <span
                      key={f}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {f} 다운로드
                    </span>
                  ))}
                </div>
              </div>
              <div className={reversed ? "lg:order-1" : ""}>{d.mockup}</div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

// 입력 방식별 — 무엇을 넣으면 무엇이 나오는지
const VERIFY_INPUTS = [
  {
    icon: PencilRuler,
    name: "카페인컬러 AI팩",
    badge: "가장 정확",
    badgeTone: "bg-warning-soft text-warning",
    desc: "카페인컬러로 만든 AI팩(화면 목록·AI 빌드 지시서)을 그대로 넣으면, 화면과 요건을 100% 알기 때문에 재현 시나리오가 가장 촘촘하고 정확해요.",
    out: ["가장 정확한 재현 시나리오", "AI팩 대비 빠진 화면까지 점검"],
  },
  {
    icon: Link2,
    name: "사이트 URL",
    badge: "검수 + 재현",
    badgeTone: "bg-primary-soft text-primary-on-soft",
    desc: "이미 오픈(배포)한 사이트 주소를 넣으면, 공개 화면은 자동으로 검사해 통과/실패로 알려주고, 로그인·결제처럼 자동으로 못 보는 화면은 무엇을 눌러봐야 하는지 재현 시나리오로 짚어줘요.",
    out: [
      "공개 화면 자동 검사 (통과 / 실패)",
      "로그인·결제 화면 재현 시나리오",
      "항목마다 UI(화면)·기능(동작) 구분 표시",
    ],
  },
  {
    icon: FileText,
    name: "설계 문서 (PPT·PDF)",
    badge: "재현 시나리오",
    badgeTone: "bg-pastel-mint text-pastel-mint-foreground",
    desc: "화면설계서·기획서를 PDF로 내보내 넣으면, 문서에서 화면과 요건을 읽어 확인해야 할 재현 시나리오를 뽑아드려요. 아직 사이트가 없어도 ‘무엇을 확인할지’부터 준비할 수 있어요.",
    out: ["문서 기반 재현 시나리오", "빠뜨리기 쉬운 예외 화면 점검 포인트"],
  },
];

// 자동 검사 항목 샘플 — 각 항목이 UI(화면)인지 기능(동작)인지 표시
const SAMPLE_CHECKS = [
  { kind: "기능", label: "접속 · HTTPS", ok: true },
  { kind: "UI", label: "모바일 대응", ok: true },
  { kind: "UI", label: "이미지 깨짐", ok: false },
  { kind: "기능", label: "깨진 링크", ok: true },
];

// 자동으로 못 보는 화면의 재현 시나리오 샘플
const SAMPLE_SCENARIOS = [
  {
    screen: "로그인 화면",
    steps: [
      "아이디·비밀번호로 로그인이 되는지",
      "틀린 비밀번호엔 오류 메시지가 뜨는지",
      "로그인 후 마이페이지로 이동하는지",
    ],
  },
  {
    screen: "결제 화면",
    steps: [
      "카드 정보 입력이 되는지",
      "결제가 끝까지 완료되는지",
      "실패하면 안내가 뜨는지",
    ],
  },
];

function KindTag({ kind }: { kind: string }) {
  const ui = kind === "UI";
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
        ui ? "bg-pastel-mint text-pastel-mint-foreground" : "bg-primary-soft text-primary-on-soft"
      }`}
    >
      {ui ? "UI" : "기능"}
    </span>
  );
}

// 사이트 검수 결과물 — 입력 3가지 + 나오는 결과물 샘플
function VerifyDeliverable() {
  return (
    <div className="flex flex-col">
      {/* 소개 */}
      <section className="border-b border-border bg-linear-to-br from-pastel-mint/30 via-surface to-background">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-mint px-3 py-1 text-xs font-semibold text-pastel-mint-foreground">
            <ShieldQuestion className="size-3.5" /> 오픈 전 검수
          </span>
          <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">사이트 검수 시나리오</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            바이브코딩으로 만든 사이트는 보이는 화면만 그럴듯할 때가 많아요. 무엇을 넣느냐에 따라{" "}
            <b className="font-semibold text-foreground">자동 검사</b>와{" "}
            <b className="font-semibold text-foreground">재현 시나리오</b>를 드려요. 개발자가 아니어도
            그대로 눌러보며 확인할 수 있어요.
          </p>
          <Link href="/verify" className={`${buttonVariants({ variant: "outline" })} mt-6`}>
            내 사이트 검수해보기
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* 입력 3가지 → 나오는 결과물 */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h3 className="text-lg font-bold text-foreground">무엇을 넣느냐에 따라 이렇게 나와요</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            셋 다 재현 시나리오를 드려요. 카페인컬러로 만든 AI팩을 넣으면 가장 정확해요.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {VERIFY_INPUTS.map((inp) => {
              const Icon = inp.icon;
              return (
                <div
                  key={inp.name}
                  className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground">
                      <Icon className="size-5" />
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${inp.badgeTone}`}>
                      {inp.badge}
                    </span>
                  </div>
                  <h4 className="mt-4 text-base font-bold text-foreground">{inp.name}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{inp.desc}</p>
                  <ul className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
                    {inp.out.map((o) => (
                      <li key={o} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-success" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 나오는 결과물 샘플 — 자동 검사 결과서 + 재현 시나리오 */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h3 className="text-lg font-bold text-foreground">이런 결과물을 받아요</h3>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 자동 검사 결과서 */}
            <div className="rounded-2xl border border-border bg-background p-6">
              <h4 className="flex items-center gap-2 font-semibold text-foreground">
                <Search className="size-4 text-primary" /> 자동 검사 리포트
                <span className="text-xs font-normal text-muted-foreground">· 공개 화면(URL)</span>
              </h4>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
                  통과 6
                </span>
                <span className="rounded-full bg-danger-soft px-3 py-1 text-sm font-semibold text-danger">
                  실패 1
                </span>
              </div>
              <ul className="mt-4 flex flex-col gap-2.5">
                {SAMPLE_CHECKS.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm">
                    {c.ok ? (
                      <Check className="size-4 shrink-0 text-success" />
                    ) : (
                      <X className="size-4 shrink-0 text-danger" />
                    )}
                    <KindTag kind={c.kind} />
                    <span className={c.ok ? "text-foreground" : "font-medium text-foreground"}>
                      {c.label}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                항목마다 <b className="font-semibold text-foreground">UI(화면)</b>인지{" "}
                <b className="font-semibold text-foreground">기능(동작)</b>인지 표시해, 무엇이 문제인지
                바로 알 수 있어요.
              </p>
            </div>

            {/* 재현 시나리오 */}
            <div className="rounded-2xl border border-border bg-background p-6">
              <h4 className="flex items-center gap-2 font-semibold text-foreground">
                <ListChecks className="size-4 text-primary" /> 재현 시나리오
                <span className="text-xs font-normal text-muted-foreground">· 자동으로 못 보는 화면</span>
              </h4>
              <ul className="mt-4 flex flex-col gap-5">
                {SAMPLE_SCENARIOS.map((s) => (
                  <li key={s.screen}>
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      <Lock className="size-3.5 text-warning" />
                      {s.screen} <span className="text-xs text-muted-foreground">(재현)</span>
                    </p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {s.steps.map((st) => (
                        <li key={st} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary">·</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                로그인·결제처럼 자동으로 들어갈 수 없는 화면은, 이렇게{" "}
                <b className="font-semibold text-foreground">직접 눌러 확인할 순서</b>로 짚어드려요.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
