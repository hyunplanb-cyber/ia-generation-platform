import type { Metadata } from "next";
import { Fragment } from "react";
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
  MonitorPlay,
  Network,
  Package,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Users,
  Workflow,
  Wrench,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  PACKAGES,
  getPackage,
  formatKrw,
  exceptionScreens,
  deepExceptionCount,
  deepSample,
  DESIGN_PRESETS,
  PRESET_CONTENTS,
  BUILD_SCOPE,
  withTopic,
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
  {
    q: "AI로 만들면 바로 쓸 수 있는 사이트가 되나요?",
    a: "화면까지는 됩니다. 눌러서 돌아다닐 수 있는 상태로 나와요. 다만 로그인 버튼을 눌러도 실제로 로그인이 되지는 않습니다. 로그인·결제·지도·알림처럼 바깥 서비스를 불러야 하는 기능은 개발자가 붙여야 해요. 위의 '어디까지 만들어지나요?'에 업종별로 정리해 두었습니다.",
  },
  {
    q: "만드는 데 얼마나 걸리나요?",
    a: "저희가 재봤을 때 Claude Code(Opus 5, 추론 높음)로 144화면이 약 40분 걸렸습니다. 쓰시는 도구와 모델, 화면 수에 따라 달라져요. 가벼운 모델을 쓰면 더 빠르지만 결과물의 꼼꼼함은 줄어듭니다.",
  },
];

const NOTES = [
  "기획 문서 패키지입니다. 디자인 시안(GUI)과 개발 소스코드는 포함되지 않습니다.",
  "AI로 만들면 화면까지 나옵니다. 로그인·결제·지도·알림 등 외부 연동은 개발이 필요합니다.",
  "디자인 프리셋은 색상·글꼴·모서리·컴포넌트 규칙을 정리한 문서입니다.",
  "AI로 생성한 초안을 다듬은 자료로, 실제 서비스에 적용하기 전 검토가 필요합니다.",
  "결제와 파일 전달은 크몽에서 진행됩니다.",
  "디지털 콘텐츠 특성상 파일 전달 후에는 환불이 제한됩니다.",
];

// 예외·상태 화면 판별(lib/packages의 규칙과 같다). 잎사귀까지 걸러내는 데 쓴다.
const EXCEPTION_ROLE = /(empty|error|closed|pending|expired)/;
const EXCEPTION_CHIP_LIMIT = 30;

export default async function PackageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ packageId: string }>;
  searchParams: Promise<{ plan?: string }>;
}) {
  const { packageId } = await params;
  const { plan: planParam } = await searchParams;
  const pkg = getPackage(packageId);
  if (!pkg) notFound();

  const { menus, project } = pkg.data;
  const screens = menus.flatMap((m) => m.screens);
  const stateScreens = exceptionScreens(pkg.data);
  const standard = pkg.plans[0];
  const premium = pkg.plans[pkg.plans.length - 1];
  const lowest = Math.min(...pkg.plans.map((p) => p.priceKrw));
  const deepExceptions = deepExceptionCount(pkg.deep);

  // 고른 규모가 페이지 전체를 지배한다 — 지표·화면 목록·예외 화면·검수 수치까지.
  const isPremium = planParam === "premium";
  const selected = isPremium ? premium : standard;
  const other = isPremium ? standard : premium;

  // 화면 목록. 프리미엄이면 화면 밑에 3뎁스 잎사귀를 함께 편다.
  const viewMenus = menus.map((m) => {
    const rows = m.screens.map((s) => ({
      ref: s.ref,
      name: s.name,
      role: s.role,
      func: s.func,
      leaves: isPremium ? (pkg.deep.subs[s.ref] ?? []) : [],
    }));
    return {
      code: m.code,
      nameKo: m.nameKo,
      desc: m.desc,
      rows,
      count: rows.reduce((n, r) => n + 1 + r.leaves.length, 0),
    };
  });

  // 예외·상태 화면 이름. 프리미엄은 잎사귀에서 나온 것까지 합친다.
  const exceptionNames = isPremium
    ? menus.flatMap((m) =>
        m.screens.flatMap((s) => [
          ...(EXCEPTION_ROLE.test(s.role) ? [s.name] : []),
          ...(pkg.deep.subs[s.ref] ?? [])
            .filter((l) => EXCEPTION_ROLE.test(l.role))
            .map((l) => `${s.name} › ${l.name}`),
        ]),
      )
    : stateScreens.map((s) => s.name);
  const exceptionShown = exceptionNames.slice(0, EXCEPTION_CHIP_LIMIT);

  // 3뎁스로 가장 많이 펼쳐지는 화면 3개 — 스탠다드를 볼 때 "위에는 이만큼 더 있다"로 쓴다.
  const topRefs = Object.entries(pkg.deep.subs)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([ref]) => ref);
  const deepSamples = deepSample(pkg.deep, topRefs);

  // 검수 시나리오 미리보기 — 실제 생성 규칙(화면당 시나리오 1개, 기능정의를 항목으로 분해)
  // 그대로 앞부분만 보여준다. 예외 화면이 섞이도록 일반/예외를 하나씩 뽑는다.
  const firstNormal = screens.find((s) => !stateScreens.includes(s));
  const firstException = stateScreens[0];
  const verifyPreview = [firstNormal, firstException]
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .flatMap((s) => {
      const idx = screens.indexOf(s) + 1;
      const kind = stateScreens.includes(s) ? "예외·상태" : "기본";
      return s.func
        .split("·")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 3)
        .map((check, j) => ({
          id: `SCN-${String(idx).padStart(3, "0")}`,
          screen: j === 0 ? s.name : "",
          kind: j === 0 ? kind : "",
          check,
        }));
    });

  const STATS = [
    { icon: Network, label: "메뉴", value: selected.stats.menus },
    { icon: LayoutList, label: "화면", value: selected.stats.screens },
    { icon: FileText, label: "요건", value: selected.stats.reqs },
    { icon: Workflow, label: "화면 이동", value: selected.stats.flows },
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
            <b className="text-foreground">{selected.name}</b> 기준입니다.{" "}
            {withTopic(other.name)} 화면 {other.stats.screens}개예요.
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
        {/* 플랜 비교 — 이 페이지의 핵심. 고르면 아래 내용 전체가 그 규모로 바뀐다. */}
        <section id="plans" className="flex scroll-mt-20 flex-col gap-5">
          <SectionTitle>어떤 규모로 만드시나요?</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {pkg.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                pkgId={pkg.id}
                selected={plan.id === selected.id}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            두 플랜 모두 디자인 프리셋과 검수 시나리오가 들어 있어요. 차이는 설계의 깊이와
            분량입니다. 규모를 고르면 아래 내용이 전부 그 기준으로 바뀝니다.
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
            이 패키지는 그 지점들을 빠뜨리지 않도록 <b>화면 단위까지 쪼개 놓은 설계 문서</b>입니다.
            프리미엄에는 예외·상태 화면만 {deepExceptions}개가 정의돼 있어요. 화면 자체는 이
            문서를 AI에 넣으면 만들어집니다.
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

        {/* 어디까지 만들어지는지 — 구매 전에 반드시 알아야 할 경계 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>어디까지 만들어지나요?</SectionTitle>
          <p className="leading-relaxed text-muted-foreground">
            스펙팩을 AI 코딩 도구에 넣으면 <b className="text-foreground">화면이 만들어집니다.</b>{" "}
            다만 로그인·결제·지도처럼 <b className="text-foreground">바깥 서비스를 불러야 하는
            기능</b>은 눌러도 반응하지 않아요. 그 부분은 개발이 필요합니다. 사실대로 미리
            알려드립니다.
          </p>

          {pkg.demoUrl && (
            <a
              href={pkg.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-xl border border-primary bg-primary-soft/30 p-5 transition-colors hover:bg-primary-soft/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="flex items-center gap-2 font-bold text-foreground">
                  <MonitorPlay className="size-4 text-primary" />
                  말로 설명하는 대신, 직접 눌러보세요
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  이 패키지의 프리미엄 스펙팩을 Claude Code에 넣어 실제로 만든 화면{" "}
                  {premium.stats.screens}개입니다. 예외 화면까지 그대로 들어 있어요.
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                데모 보기
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-primary/30 bg-primary-soft/20 p-5">
              <p className="flex items-center gap-2 font-bold text-foreground">
                <Check className="size-4 text-primary" />
                AI가 만들어 주는 것
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {BUILD_SCOPE.made.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/85">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="flex items-center gap-2 font-bold text-foreground">
                <Wrench className="size-4 text-warning" />
                개발이 필요한 것
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {BUILD_SCOPE.needsDev.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/85">
                    <Wrench className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border bg-muted/40 px-4 py-2.5">
              <h3 className="font-bold text-foreground">
                이 업종에서 개발자에게 넘길 항목 {pkg.integrations.length}가지
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                견적을 받거나 개발을 맡길 때 그대로 쓰실 수 있게 정리했어요.
              </p>
            </div>
            <ul className="divide-y divide-border/60">
              {pkg.integrations.map((it) => (
                <li key={it.area} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
                  <p className="w-40 shrink-0 font-semibold text-foreground">{it.area}</p>
                  <p className="text-sm leading-relaxed text-foreground/80">{it.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 디자인 프리셋 3종 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>디자인 프리셋 3종</SectionTitle>
          <p className="leading-relaxed text-muted-foreground">
            AI에 화면만 시키면 <b className="text-foreground">화면마다 디자인이 제각각</b>이
            됩니다. 스펙팩과 프리셋을 함께 넣으면 {selected.name} 화면 {selected.stats.screens}개가
            같은 스타일로 나와요. 세 가지 중 원하는 하나를 고르시면 됩니다.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {DESIGN_PRESETS.map((preset, i) => (
              <div
                key={preset.no}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5"
              >
                <span className="font-mono text-xs text-muted-foreground">{preset.no}</span>
                <p className="text-lg font-bold text-foreground">{preset.name}</p>
                <p className="text-sm leading-relaxed text-foreground/80">{preset.tagline}</p>
                <p className="mt-1 border-t border-border/60 pt-2 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-primary">어울리는 곳</span>
                  <br />
                  {pkg.presetFits[i]}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="font-bold text-foreground">프리셋 한 벌에 들어 있는 것</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {PRESET_CONTENTS.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-2 text-sm leading-relaxed text-foreground/80"
                  >
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="font-bold text-foreground">쓰는 법</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                AI 코딩 도구에 <b className="text-foreground">스펙팩과 프리셋 파일을 함께</b> 넣고
                이렇게 주문하세요.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed text-foreground">
                {`AI 빌드 스펙팩과 디자인 프리셋 01(모던 네이비)을
확인해서 이 디자인 규칙대로 화면을 만들어줘.`}
              </pre>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                스펙팩이 <b className="text-foreground">무엇을 만들지</b>를, 프리셋이{" "}
                <b className="text-foreground">어떻게 보이게 할지</b>를 정합니다. 마크다운(.md)과
                JSON 두 가지로 들어 있어요.
              </p>
            </div>
          </div>
        </section>

        {/* 검수 시나리오 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>검수 시나리오 {selected.verify.scenarios}개</SectionTitle>
          <p className="leading-relaxed text-muted-foreground">
            AI로 화면을 다 만든 다음이 진짜 문제입니다. 뭐가 빠졌는지 모르니까요. 이 문서는{" "}
            <b className="text-foreground">화면 하나당 시나리오 하나</b>로, 눌러보며 확인할 항목을
            표로 정리한 점검표입니다.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["표지", "쓰는 법과 PASS · FAIL · WARN 판정 기준"],
              ["검수 현황", "시나리오 수 · 확인 항목 수 · 예외 화면 수 집계"],
              ["검수 시나리오", "화면별 확인 항목과 결과 기입란"],
            ].map(([name, desc]) => (
              <div key={name} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-bold text-foreground">{name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {["테스트ID", "화면", "화면구분", "확인 항목", "결과"].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-semibold text-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {verifyPreview.map((r, i) => (
                  <tr key={i} className="border-t border-border/60 align-top">
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {r.id}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{r.screen}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {r.kind && (
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            r.kind === "예외·상태"
                              ? "bg-warning-soft text-warning"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {r.kind}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 leading-relaxed text-foreground/80">{r.check}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted-foreground">
                      <span className="rounded border border-dashed border-border px-2 py-0.5 text-xs">
                        기입
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">
            {withTopic(selected.name)} 시나리오 {selected.verify.scenarios}개 · 확인 항목{" "}
            {selected.verify.checks}개입니다({withTopic(other.name)} {other.verify.scenarios}개 ·{" "}
            {other.verify.checks}개). 엑셀이라 결과를 적어 개발자와 그대로 주고받을 수 있어요.
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

        {/* 스탠다드를 볼 때만 — 프리미엄으로 올리면 뭐가 더 오는지 보여준다.
            (프리미엄 화면에서는 아래 화면 목록이 이미 3뎁스를 전부 펼쳐 보여준다) */}
        {!isPremium && deepSamples.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionTitle>프리미엄은 화면 하나를 이렇게 펼칩니다</SectionTitle>
            <p className="leading-relaxed text-muted-foreground">
              지금 보시는 스탠다드가 &ldquo;화면 하나&rdquo;로 두는 것을, 프리미엄은{" "}
              탭·상태·예외까지 나눠 각각을 독립된 화면으로 설계합니다. 프롬프트도 그만큼 따로
              붙어요.
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
          <SectionTitle>AI가 빠뜨리기 쉬운 예외 화면 {exceptionNames.length}개</SectionTitle>
          <p className="text-muted-foreground">
            &ldquo;만들어줘&rdquo; 한 줄로는 잘 나오지 않는, 실제 서비스에 꼭 필요한 화면들입니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {exceptionShown.map((name) => (
              <span
                key={name}
                className="rounded-lg border border-primary/25 bg-primary-soft/50 px-3 py-1.5 text-sm font-medium text-primary-on-soft"
              >
                {name}
              </span>
            ))}
            {exceptionNames.length > exceptionShown.length && (
              <span className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground">
                외 {exceptionNames.length - exceptionShown.length}개
              </span>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle>
            화면 목록 {selected.stats.screens}개 · 기능 정의
          </SectionTitle>
          <p className="text-muted-foreground">
            {isPremium
              ? "들여쓴 줄이 3뎁스입니다. 화면 하나를 탭·상태·예외로 나눠 각각 따로 설계했어요."
              : "메뉴 아래 화면을 2뎁스로 정리했습니다."}
          </p>
          <div className="flex flex-col gap-6">
            {viewMenus.map((menu) => (
              <div key={menu.code} className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-baseline gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                  <span className="font-mono text-xs text-muted-foreground">{menu.code}</span>
                  <h3 className="font-bold text-foreground">{menu.nameKo}</h3>
                  <span className="text-xs text-muted-foreground">화면 {menu.count}개</span>
                </div>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {menu.rows.map((s, i) => (
                      <Fragment key={s.ref}>
                        <tr className={i > 0 ? "border-t border-border/60 align-top" : "align-top"}>
                          <td className="w-56 px-4 py-3 font-semibold text-foreground">
                            {s.name}
                            <span className="mt-0.5 block font-mono text-xs font-normal text-muted-foreground">
                              {s.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 leading-relaxed text-foreground/80">{s.func}</td>
                        </tr>
                        {s.leaves.map((l) => (
                          <tr
                            key={`${s.ref}-${l.name}`}
                            className="border-t border-border/40 bg-muted/20 align-top"
                          >
                            <td className="w-56 py-2.5 pl-9 pr-4 text-foreground/90">
                              <span className="text-muted-foreground">└ </span>
                              {l.name}
                              <span className="mt-0.5 block pl-4 font-mono text-xs text-muted-foreground">
                                {l.role}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 leading-relaxed text-foreground/70">
                              {l.func}
                            </td>
                          </tr>
                        ))}
                      </Fragment>
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
                나머지 화면의 프롬프트는 패키지에 들어 있어요. {withTopic(selected.name)} 총{" "}
                {selected.stats.screens}개입니다.
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

function PlanCard({
  plan,
  pkgId,
  selected,
}: {
  plan: PackagePlan;
  pkgId: string;
  selected: boolean;
}) {
  return (
    <div
      id={`plan-${plan.id}`}
      className={`flex scroll-mt-24 flex-col gap-4 rounded-2xl border p-6 transition-colors ${
        selected
          ? "border-primary bg-primary-soft/20 ring-2 ring-primary/30"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-bold text-foreground">{plan.name}</p>
        <div className="flex items-center gap-1.5">
          {plan.badge && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
              {plan.badge}
            </span>
          )}
          {selected && (
            <span className="rounded-full border border-primary px-2.5 py-0.5 text-xs font-semibold text-primary">
              보는 중
            </span>
          )}
        </div>
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
          ["검수 시나리오", plan.verify.scenarios],
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

      {!selected && (
        <Link
          href={`/packages/${pkgId}?plan=${plan.id}#plans`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          이 규모로 내용 보기
          <ArrowRight className="size-4" />
        </Link>
      )}

      <div className="mt-auto pt-2">
        {plan.kmongUrl ? (
          <a
            href={plan.kmongUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonVariants({ size: "lg" })} w-full ${
              plan.id === "premium" ? "" : "bg-foreground hover:bg-foreground/90"
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
