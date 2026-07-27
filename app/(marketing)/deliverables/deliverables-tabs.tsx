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
  VerifyScenarioMockup,
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
    tone: "bg-pastel-lavender text-pastel-lavender-foreground",
    name: "기능정의서",
    role: "사이트에 필요한 요건을 업무 · 기능 · 구성 계층으로 분해하고, 유형(기능·콘텐츠·UI/UX·정책)을 붙여 정리한 요구사항 정의서예요. 실무 문서 형식 그대로 내려받을 수 있어요.",
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
    tone: "bg-pastel-yellow text-pastel-yellow-foreground",
    name: "WBS · 일정",
    role: "화면(작업)별 제작 일정을 정리해요. 전체 일정을 입력하면 화면 수에 맞춰 일정 초안을 자동으로 나눠주고, 손으로 조정한 화면은 그대로 유지돼요.",
    formats: ["엑셀"],
    mockup: <WbsMockup />,
  },
  {
    icon: Bot,
    tone: "bg-primary-soft text-primary-on-soft",
    name: "AI 빌드 스펙팩",
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
      {/* 탭 전환 — 설계도 프롬프트 / 사이트 검수 */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-5xl gap-1 px-6">
          <TabButton active={tab === "planning"} onClick={() => setTab("planning")} icon={PencilRuler}>
            설계도 프롬프트
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

// 설계도 프롬프트 산출물 6종
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

// 사이트 검수 산출물 — 검수 시나리오
function VerifyDeliverable() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-mint px-3 py-1 text-xs font-semibold text-pastel-mint-foreground">
            <ShieldQuestion className="size-3.5" /> 오픈 전 검수
          </span>
          <h2 className="mt-4 text-2xl font-bold text-foreground">사이트 검수 시나리오</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            바이브코딩으로 만든 사이트는 보이는 화면만 그럴듯할 때가 많아요. URL만 넣으면 공개 화면은
            접속·모바일·이미지·링크까지 자동으로 검사하고, 로그인·결제처럼 자동으로 볼 수 없는 화면은
            무엇을 직접 눌러봐야 하는지 <b className="font-semibold text-foreground">확인 시나리오</b>로
            짚어드려요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["자동 검사 리포트", "직접 확인 시나리오"].map((f) => (
              <span
                key={f}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
              >
                {f}
              </span>
            ))}
          </div>
          <Link href="/verify" className={`${buttonVariants({ variant: "outline" })} mt-6`}>
            내 사이트 검수해보기
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div>
          <VerifyScenarioMockup />
        </div>
      </div>
    </section>
  );
}
