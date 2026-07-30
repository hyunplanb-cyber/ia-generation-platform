import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  Check,
  FileText,
  LayoutList,
  Layers,
  Lock,
  Network,
  Package,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Users,
  Workflow,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  PACKAGES,
  getPackage,
  formatKrw,
  exceptionScreens,
  deepExceptionCount,
  deepSample,
  type PackagePlan,
} from "@/lib/packages";

// 판매 상세이자 검색 유입 페이지.
// 앞쪽은 판매(플랜 비교·추천 대상·포함 산출물), 뒤쪽은 실제 산출물 공개로 신뢰를 준다.
// 핵심 자산인 화면별 프롬프트는 일부만 공개한다(판매 상품과 겹치지 않게).
export function generateStaticParams() {
  return PACKAGES.map((p) => ({ packageId: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ packageId: string }>;
}): Promise<Metadata> {
  const { packageId } = await params;
  const pkg = getPackage(packageId);
  if (!pkg) return {};
  const max = pkg.plans[pkg.plans.length - 1];
  return {
    title: `${pkg.seo.title} — 최대 화면 ${max.stats.screens}개`,
    description: pkg.seo.description,
    keywords: pkg.seo.keywords,
    alternates: { canonical: `/packages/${pkg.id}` },
  };
}

// 두 플랜 모두에 들어가는 산출물. 수량만 플랜에 따라 달라진다.
const DELIVERABLES = [
  { icon: Network, label: "메뉴 구조", desc: "메뉴 트리와 조직도 슬라이드" },
  { icon: LayoutList, label: "IA · 화면 목록", desc: "화면ID 체계와 디바이스 구분" },
  { icon: FileText, label: "기능정의서", desc: "화면마다 무엇이 되어야 하는지" },
  { icon: Workflow, label: "FLOW · 흐름도", desc: "버튼을 누르면 어디로 가는지" },
  { icon: CalendarRange, label: "WBS 일정", desc: "화면별 작업 일정표" },
  { icon: Package, label: "AI 빌드 스펙팩", desc: "Cursor · Claude Code에 넣는 한 벌" },
  { icon: Palette, label: "디자인 프리셋 3종", desc: "색 · 글꼴 · 컴포넌트 규칙" },
  { icon: ShieldCheck, label: "검수 시나리오", desc: "오픈 전 점검 항목표" },
];

const FAQ = [
  {
    q: "어떤 파일로 받나요?",
    a: "엑셀(.xlsx), 파워포인트(.pptx), 마크다운(.md) 파일을 ZIP 한 벌로 받으시게 됩니다. 별도 프로그램 없이 바로 열어보실 수 있어요.",
  },
  {
    q: "구매한 뒤 제 마음대로 고쳐 써도 되나요?",
    a: "네. 산출물에 대한 권리는 구매자에게 있고, 상업적 목적으로도 자유롭게 쓰실 수 있습니다.",
  },
  {
    q: "Cursor나 Claude Code에 바로 쓸 수 있나요?",
    a: "화면마다 생성 프롬프트가 붙어 있어서 그대로 붙여넣으시면 됩니다. AI 빌드 스펙팩은 프로젝트 전체 맥락을 한 번에 넘기는 용도예요.",
  },
  {
    q: "스탠다드와 프리미엄, 뭘 골라야 하나요?",
    a: "만들려는 사이트 규모로 고르시면 됩니다. 핵심 기능만 빠르게 만들어볼 계획이면 스탠다드, 실제로 운영할 서비스를 만든다면 탭·상태·예외까지 들어 있는 프리미엄을 권해드려요.",
  },
  {
    q: "디자인 시안도 들어 있나요?",
    a: "아니요. 이 패키지는 기획 문서입니다. 디자인 프리셋은 색상·글꼴·컴포넌트 규칙을 정리한 문서이지 시안 이미지가 아닙니다.",
  },
];

const NOTES = [
  "기획 문서 패키지입니다. 디자인 시안(GUI)과 개발 소스코드는 포함되지 않습니다.",
  "디자인 프리셋은 색상·글꼴·모서리·컴포넌트 규칙을 정리한 문서입니다.",
  "AI로 생성한 초안을 다듬은 자료로, 실제 서비스에 적용하기 전 검토가 필요합니다.",
  "결제와 파일 전달은 크몽에서 진행됩니다.",
  "디지털 콘텐츠 특성상 파일 전달 후에는 환불이 제한됩니다.",
];

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = await params;
  const pkg = getPackage(packageId);
  if (!pkg) notFound();

  const { menus, project } = pkg.data;
  const screens = menus.flatMap((m) => m.screens);
  const stateScreens = exceptionScreens(pkg.data);
  const premium = pkg.plans[pkg.plans.length - 1];
  const lowest = Math.min(...pkg.plans.map((p) => p.priceKrw));
  const deepExceptions = deepExceptionCount(pkg.deep);

  // 3뎁스로 가장 많이 펼쳐지는 화면 3개를 프리미엄 미리보기로 보여준다.
  const topRefs = Object.entries(pkg.deep.subs)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([ref]) => ref);
  const deepSamples = deepSample(pkg.deep, topRefs);

  const STATS = [
    { icon: Network, label: "메뉴", value: premium.stats.menus },
    { icon: LayoutList, label: "화면", value: premium.stats.screens },
    { icon: FileText, label: "요건", value: premium.stats.reqs },
    { icon: Workflow, label: "화면 이동", value: premium.stats.flows },
  ];

  return (
    <div className="bg-background">
      {/* 히어로 */}
      <section className="bg-linear-to-br from-primary-soft/40 via-background to-muted/40">
        <div className="mx-auto max-w-5xl px-6 pb-12 pt-7">
          <Link
            href="/packages"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            패키지 목록
          </Link>

          <span className="mt-5 inline-block rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            {pkg.industry}
          </span>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {pkg.title}
            <br />
            <span className="bg-primary-soft rounded-lg px-2 py-0.5">기획 패키지</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{pkg.tagline}</p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-background px-4 py-3 shadow-sm"
              >
                <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="size-3.5" />
                  {label}
                </dt>
                <dd className="mt-0.5 text-2xl font-bold text-primary">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-sm text-muted-foreground">
            프리미엄 기준입니다. 스탠다드는 화면 {pkg.plans[0].stats.screens}개예요.
          </p>

          <p className="mt-6 text-lg font-bold text-foreground">
            {formatKrw(lowest)}부터
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              규모에 따라 두 가지
            </span>
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-14">
        {/* 플랜 비교 — 이 페이지의 핵심 */}
        <section className="flex flex-col gap-5">
          <SectionTitle>어떤 규모로 만드시나요?</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {pkg.plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            두 플랜 모두 디자인 프리셋과 검수 시나리오가 들어 있어요. 차이는 설계의 깊이와
            분량입니다.
          </p>
        </section>

        {/* 이런 분께 추천 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>이런 분께 맞아요</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-3">
            {pkg.audience.map((a) => (
              <li
                key={a}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
                  <Users className="size-4" />
                </span>
                <p className="leading-relaxed text-foreground/85">{a}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 판매 논거 — 이 업종에서 놓치기 쉬운 것 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>이 업종에서 특히 자주 빠지는 것들</SectionTitle>
          <ul className="flex flex-col gap-3">
            {pkg.painPoints.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 rounded-xl border border-border bg-surface px-5 py-4"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                <p className="leading-relaxed text-foreground/85">{p}</p>
              </li>
            ))}
          </ul>
          <p className="rounded-xl bg-primary-soft/40 px-5 py-4 leading-relaxed text-foreground">
            이 패키지는 그 지점들을 <b>이미 화면으로 만들어 둔</b> 설계도입니다. 프리미엄에는
            예외·상태 화면만 {deepExceptions}개가 들어 있어요.
          </p>
        </section>

        {/* 포함 산출물 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>받으시는 산출물</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DELIVERABLES.map(({ icon: Icon, label, desc }) => (
              <li key={label} className="rounded-xl border border-border bg-surface p-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary-on-soft">
                  <Icon className="size-4" />
                </span>
                <p className="mt-3 font-bold text-foreground">{label}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            엑셀(.xlsx) · 파워포인트(.pptx) · 마크다운(.md) 파일을 ZIP 한 벌로 받으시게 됩니다.
          </p>
        </section>

        {/* ── 여기부터 실제 내용 공개 ── */}
        <section className="flex flex-col gap-3">
          <SectionTitle>사이트 컨셉</SectionTitle>
          <p className="leading-relaxed text-foreground/85">{project.concept}</p>
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle>메뉴 구조</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {menus.map((m) => (
              <div key={m.code} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-bold text-foreground">{m.nameKo}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
                <p className="mt-2 text-xs font-semibold text-primary">
                  화면 {m.screens.length}개
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 프리미엄 차별점 — 3뎁스로 어떻게 펼쳐지는지 */}
        {deepSamples.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionTitle>프리미엄은 화면 하나를 이렇게 펼칩니다</SectionTitle>
            <p className="leading-relaxed text-muted-foreground">
              스탠다드가 &ldquo;화면 하나&rdquo;로 두는 것을, 프리미엄은 탭·상태·예외까지
              나눠 각각을 독립된 화면으로 설계합니다. 프롬프트도 그만큼 따로 붙어요.
            </p>
            <div className="flex flex-col gap-3">
              {deepSamples.map(({ screen, leaves }) => (
                <div key={screen.ref} className="overflow-hidden rounded-xl border border-border">
                  <div className="flex flex-wrap items-baseline gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                    <Layers className="size-4 shrink-0 text-primary" />
                    <h3 className="font-bold text-foreground">{screen.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      3뎁스 {leaves.length}개로 분해
                    </span>
                  </div>
                  <ul className="divide-y divide-border/60">
                    {leaves.map((l) => (
                      <li key={l.name} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
                        <p className="w-48 shrink-0 font-semibold text-foreground">
                          {l.name}
                          <span className="mt-0.5 block font-mono text-xs font-normal text-muted-foreground">
                            {l.role}
                          </span>
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/80">{l.func}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4">
          <SectionTitle>AI가 빠뜨리기 쉬운 예외 화면 {stateScreens.length}개</SectionTitle>
          <p className="text-muted-foreground">
            &ldquo;만들어줘&rdquo; 한 줄로는 잘 나오지 않는, 실제 서비스에 꼭 필요한 화면들입니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {stateScreens.map((s) => (
              <span
                key={s.ref}
                className="rounded-lg border border-primary/25 bg-primary-soft/50 px-3 py-1.5 text-sm font-medium text-primary-on-soft"
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle>화면 목록 {screens.length}개 · 기능 정의</SectionTitle>
          <div className="flex flex-col gap-6">
            {menus.map((menu) => (
              <div key={menu.code} className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-baseline gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                  <span className="font-mono text-xs text-muted-foreground">{menu.code}</span>
                  <h3 className="font-bold text-foreground">{menu.nameKo}</h3>
                  <span className="text-xs text-muted-foreground">
                    화면 {menu.screens.length}개
                  </span>
                </div>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {menu.screens.map((s, i) => (
                      <tr
                        key={s.ref}
                        className={i > 0 ? "border-t border-border/60 align-top" : "align-top"}
                      >
                        <td className="w-56 px-4 py-3 font-semibold text-foreground">
                          {s.name}
                          <span className="mt-0.5 block font-mono text-xs font-normal text-muted-foreground">
                            {s.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 leading-relaxed text-foreground/80">{s.func}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle>화면별 AI 생성 프롬프트</SectionTitle>
          <p className="text-muted-foreground">
            화면마다 AI 코딩 도구에 그대로 넣는 프롬프트가 붙어 있습니다. 아래는{" "}
            {pkg.promptSamples.length}개 예시예요.
          </p>
          <div className="flex flex-col gap-3">
            {screens
              .filter((s) => pkg.promptSamples.includes(s.ref))
              .map((s) => (
                <div key={s.ref} className="rounded-xl border border-border bg-surface p-5">
                  <p className="font-bold text-foreground">{s.name}</p>
                  <p className="mt-2 leading-relaxed text-foreground/80">{s.prompt}</p>
                </div>
              ))}
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-6 text-muted-foreground">
              <Lock className="size-5 shrink-0" />
              <p className="text-sm leading-relaxed">
                나머지 화면의 프롬프트는 패키지에 들어 있어요. 프리미엄은 총{" "}
                {premium.stats.screens}개입니다.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="flex flex-col gap-4">
          <SectionTitle>자주 묻는 질문</SectionTitle>
          <div className="flex flex-col gap-2">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-border bg-surface px-5 py-4"
              >
                <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none">
                  <span className="text-primary">Q. </span>
                  {q}
                </summary>
                <p className="mt-3 leading-relaxed text-foreground/80">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 유의사항 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>구매 전 확인해 주세요</SectionTitle>
          <ul className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 px-5 py-4">
            {NOTES.map((n) => (
              <li key={n} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/80">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {n}
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col items-center gap-5 rounded-2xl bg-linear-to-br from-primary-soft/50 via-background to-muted/40 px-6 py-12 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            내 서비스에 맞게 직접 만들 수도 있어요
          </h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            컨셉과 메뉴만 입력하면 화면 목록부터 화면별 프롬프트까지, 빠지는 화면 없이
            설계해드려요.
          </p>
          <Link
            href="/signup"
            className={`${buttonVariants({ size: "lg" })} shadow-primary/30 shadow-lg transition-transform hover:scale-105`}
          >
            무료로 시작하기
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: PackagePlan }) {
  const isPremium = plan.id === "premium";
  return (
    <div
      id={`plan-${plan.id}`}
      className={`flex scroll-mt-24 flex-col gap-4 rounded-2xl border p-6 ${
        isPremium ? "border-primary bg-primary-soft/20" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-bold text-foreground">{plan.name}</p>
        {plan.badge && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {plan.badge}
          </span>
        )}
      </div>

      <p className="text-3xl font-bold text-primary">{formatKrw(plan.priceKrw)}</p>

      <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Layers className="size-4" />
        {plan.depthLabel}
      </p>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-y border-border/60 py-4 text-sm">
        {[
          ["메뉴", plan.stats.menus],
          ["화면", plan.stats.screens],
          ["요건", plan.stats.reqs],
          ["검수 항목", plan.verifyRange],
        ].map(([label, value]) => (
          <span key={label as string} className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-bold text-foreground">{value}</dd>
          </span>
        ))}
      </dl>

      <ul className="flex flex-col gap-2">
        {plan.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/85">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2">
        {plan.kmongUrl ? (
          <a
            href={plan.kmongUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonVariants({ size: "lg" })} w-full ${
              isPremium ? "" : "bg-foreground hover:bg-foreground/90"
            }`}
          >
            <ShoppingBag className="size-4" />
            {plan.name} 구매하기
          </a>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-foreground">판매 준비 중이에요</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              아래에서 내용을 먼저 확인해 보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
      <span className="h-5 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  );
}
