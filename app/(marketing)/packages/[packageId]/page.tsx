import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  LayoutList,
  Layers,
  MonitorPlay,
  Network,
  ShoppingBag,
  Users,
  Workflow,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  PACKAGES,
  getPackage,
  formatKrw,
  planContents,
  BUILD_SCOPE,
  type PackagePlan,
} from "@/lib/packages";
import {
  DESIGN_OPTIONS,
  buildPresetSummary,
  salePresetConfig,
} from "@/lib/design-presets";
import { PACKAGE_PRICES_PUBLIC } from "@/lib/flags";

// 흰 바탕에 글자로 써도 읽히는 색인지. 파스텔의 노란 강조처럼 밝은 색은 배경으로만 쓴다.
// 기준을 낮추면 네이비의 주황 같은 멀쩡한 색까지 걸러져 테마 색이 사라진다.
function isTooLightForText(hex: string): boolean {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b > 180;
}

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
    q: "등급은 어떻게 고르나요?",
    a: "두 가지만 정하시면 됩니다. 첫째, 설계를 어디까지 펼칠지 — 핵심 화면만 빠르게 보려면 2뎁스(스탠다드·디럭스), 탭·상태·예외까지 촘촘히 필요하면 3뎁스(플러스·프리미엄)입니다. 둘째, 만들어 둔 화면이 필요한지 — 필요하시면 디럭스나 프리미엄을 고르세요. 그 설계로 이미 만든 화면(HTML)과 오픈 전 점검용 검수 시나리오가 함께 들어갑니다. 만들어 둔 화면이 없는 업종에는 디럭스·프리미엄이 나타나지 않습니다.",
  },
  {
    q: "디자인 시안도 들어 있나요?",
    a: "AI팩은 기획 산출물에 가까운 문서입니다. 디자인 프리셋은 색상·글꼴·컴포넌트 규칙을 정리한 문서이며 시안 이미지가 아닙니다. 다만 디자인 프리셋과 AI 빌드 스펙팩을 AI 도구에 넣거나, 디럭스·프리미엄에 들어 있는 HTML은 디자인 컨셉이 반영된 화면이라 디자인 목업으로 보실 수 있어요. (쓰시는 AI 도구에 따라 다른 결과물이 나올 수 있습니다.)",
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
  "기획 문서 한 벌(AI팩)입니다. 디자인 시안(GUI)과 개발 소스코드는 포함되지 않습니다.",
  "AI로 만들면 화면까지 나옵니다. 로그인·결제·지도·알림 등 외부 연동은 개발이 필요합니다.",
  "디자인 프리셋은 색상·글꼴·모서리·컴포넌트 규칙을 정리한 문서입니다.",
  "AI로 생성한 초안을 다듬은 자료로, 실제 서비스에 적용하기 전 검토가 필요합니다.",
  "디지털 콘텐츠 특성상 파일 전달 후에는 환불이 제한됩니다.",
];

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

  const { menus } = pkg.data;
  const standard = pkg.plans[0];
  const premium = pkg.plans[pkg.plans.length - 1];

  // 고른 등급이 페이지 전체를 지배한다 — 지표·화면 목록·예외 화면·검수 수치까지.
  const selected = pkg.plans.find((p) => p.id === planParam) ?? standard;
  // 3뎁스 화면 목록은 심화 등급(플러스·프리미엄)에서만 편다.
  // 등급이 2×2라 "스탠다드가 아니면 심화"가 아니다 — 디럭스는 2뎁스에 완성 화면만 붙은 칸이다.
  const isPremium = selected.id === "plus" || selected.id === "premium";
  // 완성 화면·검수 시나리오가 붙는 등급들. 없으면 그 얘기를 꺼내지 않는다.
  const builtPlans = pkg.plans.filter((p) => p.siteScreens);
  const hasPremium = builtPlans.length > 0;

  // ── 산출물 예시용 ─────────────────────────────────────────
  // 실제 산출물에서 뽑는다. 지어낸 값을 넣으면 받아보고 다르다고 느낀다.
  const cutText = (t: string, n: number) => (t.length > n ? `${t.slice(0, n)}…` : t);
  const splitFunc = (f: string) =>
    f
      .split("·")
      .map((x) => x.trim())
      .filter(Boolean);
  const sampleMenus = isPremium ? pkg.deep.menus : menus;
  const allDeep = sampleMenus.flatMap((m) => m.screens);
  const sampleScreens = [...new Set([...pkg.promptSamples, allDeep[0]?.ref ?? ""])]
    .map((ref) => allDeep.find((x) => x.ref === ref))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .slice(0, 4);

  // 요구사항ID는 lib/export/requirements.ts와 같은 규칙(업무-기능-구성 3단)으로 계산한다.
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const reqAll: { id: string; 업무: string; 구성: string; menu: number }[] = [];
  sampleMenus.forEach((m, mi) => {
    m.screens.forEach((sc, si) => {
      splitFunc(sc.func).forEach((item, ii) => {
        reqAll.push({
          id: `${pad2(mi + 1)}-${pad2(si + 1)}-${pad2(ii + 1)}`,
          업무: sc.name,
          구성: item,
          menu: mi,
        });
      });
    });
  });
  // 메뉴를 흩어서, 내용이 충실한 요건으로. 한 메뉴에서만 고르면 표본이 편중돼 보인다.
  const sampleReqs = [0, 2, 4, 6]
    .map(
      (mi) =>
        reqAll
          .filter((r) => r.menu === mi && r.구성.length <= 34)
          .sort((a, b) => b.구성.length - a.구성.length)[0],
    )
    .filter(Boolean)
    .slice(0, 4);

  const specSrc = sampleScreens[1] ?? sampleScreens[0];
  const specPreview = specSrc
    ? `### ${specSrc.ref.toUpperCase()} ${specSrc.name}\n· 역할: ${specSrc.role}\n· 요건: ${cutText(specSrc.func, 44)}\n· 프롬프트: ${cutText(specSrc.prompt, 60)}`
    : "";

  // 등급별 구성. 값은 플랜에서 직접 읽어 표기와 실제가 어긋나지 않게 한다.
  const matrixRows: {
    label: string;
    sub: string;
    only?: boolean;
    value: (p: PackagePlan) => string;
  }[] = [
    { label: "01 메뉴구조", sub: "메뉴-화면 트리 · 조직도 pptx", value: () => "✓" },
    {
      label: "02 IA 화면목록",
      sub: "화면ID · 화면별 AI 프롬프트",
      value: (p) => `${p.stats.screens}개`,
    },
    { label: "03 기능정의서", sub: "요건", value: (p) => `${p.stats.reqs}개` },
    { label: "04 WBS", sub: "화면별 개발 일정", value: () => "✓" },
    { label: "05 FLOW 흐름도", sub: "html · drawio", value: () => "✓" },
    { label: "07 AI 빌드 스펙팩", sub: "넣고 한 마디면 끝", value: () => "✓" },
    {
      label: "디자인 프리셋 3종",
      sub: pkg.presetStyles
        .map((s) => DESIGN_OPTIONS.find((o) => o.key === s)?.title ?? s)
        .join(" · "),
      value: () => "✓",
    },
    {
      label: "08 검수 시나리오",
      sub: "오픈 전 점검표",
      only: true,
      value: (p) => (p.verify ? `${p.verify.scenarios}개` : "—"),
    },
    {
      label: "완성 화면",
      sub: "HTML · 다시 찍어내는 생성기",
      only: true,
      value: (p) => (p.siteScreens ? `${p.siteScreens}개` : "—"),
    },
  ];

  // 프리셋 3종은 업종마다 다르다(lib/packages.ts의 presetStyles).
  // 이름을 고정해 두면 LMS엔 코럴이 들어가는데 화면엔 파스텔이라 적히는 식으로 어긋난다.
  // 미리보기 색·모서리는 판매본과 같은 사양(salePresetConfig)에서 뽑는다.
  const presets = pkg.presetStyles.map((style, i) => {
    const opt = DESIGN_OPTIONS.find((o) => o.key === style)!;
    const sum = buildPresetSummary(salePresetConfig(style));
    const accent = opt.swatches[1] ?? sum.primary;
    return {
      no: String(i + 1).padStart(2, "0"),
      name: opt.title,
      fit: pkg.presetFits[i],
      primary: sum.primary,
      accent,
      // 밝은 강조색은 배경 틴트로만 쓰고 글자는 본문색으로 적는다.
      // (테마마다 swatches[2]의 뜻이 달라서 — 네이비는 본문색, 파스텔은 민트 — 거기서 가져오면 안 된다.)
      accentText: isTooLightForText(accent) ? sum.text : accent,
      bg: opt.swatches[3] ?? sum.bg,
      text: sum.text,
      muted: sum.muted,
      border: sum.border,
      radius: sum.radius,
      fontFamily: sum.fontFamily,
    };
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
            AI팩 목록
          </Link>

          {/* 업종 뱃지는 뺐다 — 바로 아래 제목이 이미 업종을 말하고 있어서 겹쳤다. */}
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {pkg.title} <span className="bg-primary-soft rounded-lg px-2 py-0.5">AI팩</span>{" "}
            <span className="align-middle text-lg font-bold text-primary sm:text-xl">
              {selected.name}
            </span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{pkg.tagline}</p>

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
        </div>
      </section>

      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6 py-14">
        {/* 플랜 비교 — 이 페이지의 핵심. 고르면 아래 내용 전체가 그 규모로 바뀐다. */}
        <section id="plans" className="flex scroll-mt-20 flex-col gap-5">
          <SectionTitle>어떤 규모로 만드시나요?</SectionTitle>
          {/* 넷이면 2×2로 둔다 — 등급이 원래 2×2(설계 깊이 × 완성 화면)라
              한 줄로 늘어놓으면 사다리처럼 보인다. 배치가 구조를 말해주게. */}
          <div
            className={`grid gap-4 ${
              pkg.plans.length >= 4
                ? "sm:grid-cols-2"
                : pkg.plans.length === 3
                  ? "lg:grid-cols-3"
                  : "md:grid-cols-2"
            }`}
          >
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
            전 등급에 디자인 프리셋 3종이 들어 있어요.
            {hasPremium &&
              ` 검수 시나리오와 만들어 둔 화면은 ${builtPlans.map((p) => p.name).join("·")}에만 있습니다.`}{" "}
            등급을
            고르면 아래 내용이 전부 그 기준으로 바뀝니다.
          </p>
        </section>

        {/* 증거 — 말보다 실물. 구매 결정 전에 보이도록 앞쪽에 둔다. */}
        {(pkg.videoId || pkg.demoUrl) && (
          <section className="flex flex-col gap-4">
            <SectionTitle>말보다, 실제로 만든 걸 보여드릴게요</SectionTitle>
            {pkg.videoId && (
              <>
                <p className="leading-relaxed text-muted-foreground">
                  이 AI팩의 프리미엄 스펙팩을 Claude Code에 넣고 돌린 기록입니다. 화면{" "}
                  {premium.stats.screens}개가 약 40분 만에 만들어졌어요.
                </p>
                <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                  <iframe
                    className="size-full"
                    src={`https://www.youtube-nocookie.com/embed/${pkg.videoId}`}
                    title={`${pkg.title} AI팩으로 만든 화면`}
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </>
            )}
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
                    직접 눌러볼 수도 있어요
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    만들어진 화면 중 일부를 열어 뒀습니다. 예외 화면까지 그대로 들어 있어요.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                  데모 보기
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            )}
          </section>
        )}

        {/* WHY — 값의 근거. 실무 기간을 칩으로 훑게 한다(표로 두면 "이만큼 걸린다"로 읽혀 부담이 된다). */}
        <section className="flex flex-col gap-4">
          <SectionTitle>사이트 하나 만들 때 개발 단계에서 꼭 요구되는 내용입니다</SectionTitle>
          <p className="leading-relaxed text-muted-foreground">
            그 기간을 확실히 줄여 드려요. 실무에서 처음부터 만들면 이만큼 걸립니다.
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {[
              ["요건 정의", "2주", false],
              ["기능 정의", "2주", false],
              ["화면 목록", "2주", false],
              ["유저 플로우", "2주", false],
              ["화면설계서 100p", "2~3개월", true],
              ["검수 시나리오", "2주", false],
            ].map(([step, dur, hot]) => (
              <div
                key={step as string}
                className={`rounded-xl border px-4 py-3 ${
                  hot ? "border-primary bg-primary-soft" : "border-border bg-surface"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">{step}</p>
                <p
                  className={`mt-1 text-lg font-bold tabular-nums ${
                    hot ? "text-primary-on-soft" : "text-muted-foreground"
                  }`}
                >
                  {dur}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">＊ 서비스 기획 실무 기준</p>
          <p className="leading-relaxed text-muted-foreground">
            <b className="text-foreground">AI한테 시키면 되지 않냐고요?</b> 됩니다. 다만 문서
            하나하나를 따로 지시해야 하고,{" "}
            <b className="text-foreground">기준이 될 샘플이 없으면 원하는 대로 나오지 않습니다.</b>
          </p>
        </section>

        {/* SAMPLE — 이 페이지에서 유일하게 '실물'을 보여주는 곳. 말로 하는 것보다 빠르다. */}
        <section className="flex flex-col gap-4">
          <SectionTitle>이런 산출물이 들어 있어요</SectionTitle>
          <p className="leading-relaxed text-muted-foreground">
            산출물은 구매하시는 등급에 따라 다르게 구성되어 있어요. 등급별 항목은 맨 아래{" "}
            <b className="text-foreground">등급별 구성</b>에서 확인해 주세요.
          </p>

          <DocCard title="IA 화면목록" meta="xlsx">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    {["화면ID", "화면명", "기능 정의", "AI 생성 프롬프트"].map((h) => (
                      <th key={h} className="pb-2 pr-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleScreens.map((s) => (
                    <tr key={s.ref} className="border-b border-border/50 align-top last:border-0">
                      <td className="py-2.5 pr-3 font-bold text-primary">{s.ref.toUpperCase()}</td>
                      <td className="py-2.5 pr-3 text-foreground">{s.name}</td>
                      <td className="py-2.5 pr-3 leading-relaxed text-muted-foreground">
                        {cutText(s.func, 46)}
                      </td>
                      <td className="py-2.5 leading-relaxed text-muted-foreground">
                        {cutText(s.prompt, 62)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DocNote>
              외 {selected.stats.screens - sampleScreens.length}개 화면 · 화면마다 프롬프트가 붙어
              있습니다
            </DocNote>
          </DocCard>

          <DocCard title="기능정의서" meta={`xlsx · 요건 ${selected.stats.reqs}개`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    {["요구사항ID", "업무 · 기능", "구성"].map((h) => (
                      <th key={h} className="pb-2 pr-3 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sampleReqs.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-3 font-bold text-primary">{r.id}</td>
                      <td className="py-2.5 pr-3 text-foreground">{r.업무}</td>
                      <td className="py-2.5 text-muted-foreground">{cutText(r.구성, 56)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DocNote>
              업무 → 기능 → 구성 3단계 · 유형(기능·콘텐츠·UI/UX·정책)은 자동 분류됩니다
            </DocNote>
          </DocCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <DocCard title="메뉴구조" meta="xlsx · pptx">
              <p className="mb-2 text-sm font-bold text-foreground">{pkg.title}</p>
              <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                {menus.map((m) => (
                  <li key={m.code}>
                    ├ {m.code} {m.nameKo}
                    <span className="ml-1.5 text-xs text-muted-foreground/70">
                      화면 {m.screens.length}
                    </span>
                  </li>
                ))}
              </ul>
            </DocCard>

            <DocCard title="FLOW 흐름도" meta="html · drawio">
              <div className="flex flex-wrap items-center gap-1.5">
                {["상품 상세", "날짜·인원", "결제"].map((n) => (
                  <Fragment key={n}>
                    <span className="rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
                      {n}
                    </span>
                    <span className="text-xs text-muted-foreground/50">→</span>
                  </Fragment>
                ))}
                <span className="rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-semibold text-background">
                  예약 완료
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground/70">예외 →</span>
                {["결제 실패", "확정 대기", "마감"].map((n) => (
                  <span
                    key={n}
                    className="rounded-lg bg-primary-soft px-2.5 py-1.5 text-xs font-semibold text-primary-on-soft"
                  >
                    {n}
                  </span>
                ))}
              </div>
              <DocNote>화면 이동 {selected.stats.flows}개 · draw.io에서 편집</DocNote>
            </DocCard>
          </div>

          <DocCard title="AI 빌드 스펙팩" meta="md · json">
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-foreground px-4 py-3.5 text-xs leading-relaxed text-background/80">
              {specPreview}
            </pre>
            <DocNote>이 파일 하나를 AI에 넣고 “이대로 만들어줘” 하면 됩니다</DocNote>
          </DocCard>

          {selected.verify && (
            <DocCard
              title="검수 시나리오"
              meta={`xlsx · 시나리오 ${selected.verify.scenarios}개`}
              badge={selected.name}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[30rem] text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr className="border-b border-border">
                      {["테스트ID", "화면", "화면구분", "확인 항목", "결과"].map((h) => (
                        <th key={h} className="pb-2 pr-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleScreens.slice(0, 3).map((s, i) => (
                      <tr key={s.ref} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-3 font-bold text-primary">
                          SCN-{String(i + 1).padStart(3, "0")}
                        </td>
                        <td className="py-2.5 pr-3 text-foreground">{s.name}</td>
                        <td className="py-2.5 pr-3 text-muted-foreground">
                          {/(empty|error|closed|pending|expired)/.test(s.role) ? "예외·상태" : "기본"}
                        </td>
                        <td className="py-2.5 pr-3 text-muted-foreground">
                          {cutText(splitFunc(s.func)[0] ?? "화면이 정상적으로 열리는지 확인", 34)}
                        </td>
                        <td className="py-2.5 text-muted-foreground">PASS·FAIL</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <DocNote>
                화면 하나당 시나리오 하나 · 확인 항목 {selected.verify.checks}개 · 결과를 적어
                개발자와 그대로 주고받습니다
              </DocNote>
            </DocCard>
          )}

          {selected.siteScreens && (
            <DocCard
              title="완성 화면 HTML"
              meta={`${selected.siteScreens}개`}
              badge={selected.name}
            >
              <p className="mb-3 text-sm font-bold text-foreground">{pkg.title} — 전체 화면 목록</p>
              <div className="flex flex-col gap-2.5">
                {menus.slice(0, 4).map((m) => (
                  <div key={m.code} className="flex flex-wrap items-baseline gap-1.5">
                    <span className="w-28 shrink-0 text-xs font-bold text-muted-foreground">
                      {m.code} {m.nameKo}
                    </span>
                    {m.screens.slice(0, 4).map((sc) => (
                      <span
                        key={sc.ref}
                        className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                      >
                        {sc.ref.toUpperCase()} {cutText(sc.name, 10)}
                      </span>
                    ))}
                    {m.screens.length > 4 && (
                      <span className="text-xs font-bold text-muted-foreground/60">
                        ＋{m.screens.length - 4}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <DocNote>각 항목을 눌러 화면을 확인할 수 있어요</DocNote>
            </DocCard>
          )}

          <DocCard title="디자인 프리셋 3종" meta="md · json">
            <div className="grid gap-3 sm:grid-cols-3">
              {presets.map((p) => (
                <div key={p.no} className="rounded-xl border border-border p-3.5">
                  <p className="text-sm font-bold text-foreground">
                    {p.no} {p.name}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.fit}</p>
                  {/* 색·모서리만 글로 적으면 셋이 어떻게 다른지 안 그려진다.
                      판매본과 같은 사양으로 작은 화면 조각을 그려 눈으로 비교하게 둔다. */}
                  <div
                    className="mt-3 flex flex-col gap-2 border p-3"
                    style={{
                      background: p.bg,
                      borderColor: p.border,
                      borderRadius: p.radius.card,
                      fontFamily: p.fontFamily,
                    }}
                  >
                    <div>
                      <p className="text-[11px] font-bold leading-tight" style={{ color: p.text }}>
                        제목입니다
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight" style={{ color: p.muted }}>
                        서브 카피입니다
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <span
                        className="px-1.5 py-px text-[9px] font-bold"
                        style={{
                          background: `${p.accent}26`,
                          color: p.accentText,
                          borderRadius: p.radius.badge,
                        }}
                      >
                        배지 1
                      </span>
                      <span
                        className="px-1.5 py-px text-[9px] font-bold"
                        style={{
                          border: `1px solid ${p.border}`,
                          color: p.muted,
                          borderRadius: p.radius.badge,
                        }}
                      >
                        배지 2
                      </span>
                    </div>
                    <div
                      className="px-2 py-1 text-[9px]"
                      style={{
                        border: `1px solid ${p.border}`,
                        color: p.muted,
                        borderRadius: p.radius.button,
                        background: "#FFFFFF",
                      }}
                    >
                      입력창입니다
                    </div>
                    <div className="flex gap-1.5">
                      <span
                        className="px-2 py-1 text-[9px] font-bold"
                        style={{
                          background: p.primary,
                          color: "#FFFFFF",
                          borderRadius: p.radius.button,
                        }}
                      >
                        메인 버튼
                      </span>
                      <span
                        className="px-2 py-1 text-[9px] font-bold"
                        style={{
                          border: `1px solid ${p.border}`,
                          color: p.text,
                          borderRadius: p.radius.button,
                          background: "#FFFFFF",
                        }}
                      >
                        보조 버튼
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <DocNote>
              스펙팩과 함께 넣으면 화면 {selected.stats.screens}개가 같은 스타일로 나옵니다
            </DocNote>
          </DocCard>
        </section>

        {/* HOW — 왜 우리 결과가 다른가. 숫자와 대화로 보여준다. */}
        <section className="flex flex-col gap-4">
          <SectionTitle>한 줄 프롬프트로 만든 사이트, 완벽할까요?</SectionTitle>
          <p className="leading-relaxed text-muted-foreground">
            우리는 <b className="text-foreground">화면별 프롬프트 {selected.stats.screens}개</b>,{" "}
            <b className="text-foreground">기능 정의 {selected.stats.reqs}개</b>,{" "}
            <b className="text-foreground">화면 이동 흐름 {selected.stats.flows}개</b>를 근거로
            AI에게 지시합니다. 무엇을 만들지가 이미 정해져 있으니, AI는 상상하지 않고 그대로
            만들기만 하면 됩니다.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              [selected.stats.screens, "화면별 프롬프트"],
              [selected.stats.reqs, "기능 정의"],
              [selected.stats.flows, "화면 이동 흐름도"],
            ].map(([n, label]) => (
              <div
                key={label as string}
                className="rounded-xl border border-border bg-surface p-4 text-center"
              >
                <p className="text-2xl font-bold tabular-nums text-primary">{n}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-muted/40 p-5">
            <div className="flex items-start gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted-foreground/30 text-xs font-bold text-background">
                ✕
              </span>
              <p className="max-w-[80%] rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm leading-relaxed text-muted-foreground">
                장바구니 그 화면 있잖아요, 거기 문구 좀…
              </p>
            </div>
            <div className="flex flex-row-reverse items-start gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                ✓
              </span>
              <p className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium leading-relaxed text-primary-foreground">
                <b className="font-bold">{sampleScreens[0]?.ref.toUpperCase()}</b> 화면, 문구
                바꿔주세요.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            AI에게든 개발사든 <b className="text-foreground">고유 ID로 이야기하면 전달이 쉬워집니다.</b>
          </p>
        </section>

        {/* SCOPE — 구매 전에 반드시 알아야 할 경계. 여기서 오해가 생기면 분쟁이 된다. */}
        <section className="flex flex-col gap-4">
          <SectionTitle>개발에 꼭 필요한 부분까지 작업됩니다</SectionTitle>
          <div className="rounded-2xl border-2 border-foreground/25 bg-surface p-5">
            <p className="mb-3 font-bold text-foreground">개발사에 그대로 전달하셔도 됩니다</p>
            <ul className="flex flex-col gap-2">
              {BUILD_SCOPE.made.map((x) => (
                <li key={x} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-3 font-bold text-foreground">개발사에게</p>
              <ul className="flex flex-col gap-1.5 text-sm text-foreground/85">
                {["01 메뉴구조", "02 화면목록", "03 기능정의서", "05 FLOW 흐름도", "완성화면 HTML"].map(
                  (x) => (
                    <li key={x}>· {x}</li>
                  ),
                )}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-3 font-bold text-primary">AI에게</p>
              <ul className="flex flex-col gap-1.5 text-sm text-foreground/85">
                {["07 AI 빌드 스펙팩", "디자인 프리셋", "완성화면 HTML"].map((x) => (
                  <li key={x}>· {x}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-5">
            <p className="mb-3 font-bold text-muted-foreground">
              개발에서는 이런 추가 작업이 진행돼요
            </p>
            <div className="flex flex-col gap-1.5 text-sm leading-relaxed text-muted-foreground">
              {BUILD_SCOPE.needsDev.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </div>
          </div>
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

        {/* TRAP — 이 업종에서 놓치기 쉬운 것. 가격의 마지막 근거다. */}
        <section className="flex flex-col gap-4">
          <SectionTitle>AI는 이런 부분을 놓칠 수 있어요</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {pkg.painPoints.map((p, i) => (
              <div key={p} className="rounded-xl border border-border bg-surface p-5">
                <p className="text-lg font-bold text-primary">0{i + 1}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p}</p>
              </div>
            ))}
          </div>
          <p className="leading-relaxed text-muted-foreground">
            셋 다 만들다가 발견하면 <b className="text-foreground">구조를 갈아엎게 되는</b>{" "}
            것들입니다.
          </p>
          <div className="mt-2 text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            <p>편한 건 좋지만, 부족한 건 싫잖아요.</p>
            <p>그래서 이런 부분을 먼저 챙겨둔 AI팩입니다.</p>
          </div>
        </section>

        {/* FILES — 등급별 차이를 한눈에. 세부는 마지막에 본다. */}
        <section className="flex flex-col gap-4">
          <SectionTitle>등급별로 이렇게 들어 있어요</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-foreground">
                  <th className="pb-3 pr-3 text-xs font-semibold text-muted-foreground">
                    포함 내용
                  </th>
                  {pkg.plans.map((p) => (
                    <th
                      key={p.id}
                      className={`pb-3 text-center text-xs font-bold ${
                        p.siteScreens ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixRows
                  .filter((row) => pkg.plans.some((p) => row.value(p) !== "—"))
                  .map((row) => (
                  <tr
                    key={row.label}
                    className={`border-b border-border/60 ${row.only ? "bg-primary-soft/50" : ""}`}
                  >
                    <td className="py-3 pr-3">
                      <span className="font-semibold text-foreground">{row.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{row.sub}</span>
                    </td>
                    {pkg.plans.map((p) => {
                      const v = row.value(p);
                      return (
                        <td
                          key={p.id}
                          className={`py-3 text-center font-bold ${
                            v === "—"
                              ? "text-muted-foreground/40"
                              : row.only
                                ? "text-primary"
                                : "text-foreground"
                          }`}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
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

      {PACKAGE_PRICES_PUBLIC ? (
        <p className="text-3xl font-bold text-primary">{formatKrw(plan.priceKrw)}</p>
      ) : (
        <p className="text-xl font-bold text-warning">판매 준비 중</p>
      )}

      <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Layers className="size-4" />
        {plan.depthLabel}
      </p>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-y border-border/60 py-4 text-sm">
        {[
          ["메뉴", plan.stats.menus],
          ["화면", plan.stats.screens],
          ["요건", plan.stats.reqs],
          plan.verify
            ? (["검수 시나리오", plan.verify.scenarios] as const)
            : (["화면 이동", plan.stats.flows] as const),
        ].map(([label, value]) => (
          <span key={label as string} className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-bold text-foreground">{value}</dd>
          </span>
        ))}
      </dl>

      {/* 구성 목록은 홈·목록·상세가 같은 출처(planContents)와 같은 모양을 쓴다.
          세 곳이 다르게 보이면 같은 상품인지 헷갈린다. */}
      <ul className="flex flex-wrap gap-y-0.5 text-[13px] leading-relaxed text-muted-foreground">
        {planContents(plan).map((c) => (
          <li key={c} className="after:mx-[7px] after:text-border after:content-['·'] last:after:hidden">
            {c}
          </li>
        ))}
      </ul>
      {/* 구성으로는 안 보이는 것 한 줄 — 예: 화면을 다시 찍어내는 생성기 */}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {plan.highlights[plan.highlights.length - 1]}
      </p>

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
          // 결제(PG) 붙기 전까지 여기가 막다른 길이 되지 않게, 무료 샘플로 이어준다.
          // 지금 온 사람을 회원으로 남겨야 출시일에 알릴 대상이 생긴다.
          <div className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-4 text-center">
            <p className="text-sm font-semibold text-foreground">곧 판매를 시작해요</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              그동안 무료 샘플로 먼저 살펴보세요.
            </p>
            <Link
              href="/free"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              무료 샘플 받기
              <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// 산출물 예시 카드 — 제목·파일형식·등급 배지를 한 줄에 두고 내용을 아래에 편다.
function DocCard({
  title,
  meta,
  badge,
  children,
}: {
  title: string;
  meta: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
        <b className="font-bold text-foreground">{title}</b>
        <span className="text-xs font-semibold text-muted-foreground">{meta}</span>
        {badge && (
          <span className="ml-auto rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            {badge}
          </span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function DocNote({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-xs text-muted-foreground">{children}</p>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
      <span className="h-5 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  );
}
