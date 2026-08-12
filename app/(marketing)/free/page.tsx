import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Gift,
  FileSpreadsheet,
  FileCode2,
  Network,
  ListChecks,
  ClipboardCheck,
  CalendarDays,
  PenTool,
  Presentation,
  Check,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { splitFuncDef } from "@/lib/export/requirements";
import { buildTemplateVerifySheets } from "@/lib/export/template-verify";
import { CREATOR } from "@/template-data-creator";
import { DownloadCta } from "./download-cta";

// 인스타 릴스 유입의 착지점. 가입 없이 바로 받게 하고, 가입 권유는 받은 뒤에 띄운다
// (download-cta.tsx). 이유는 app/api/free-sample/route.ts 주석에 적어 뒀다.
const screens = CREATOR.menus.flatMap((m) => m.screens);

// 화면 수를 제목에 손으로 적어 뒀더니 샘플이 15개에서 16개로 늘었을 때
// 본문만 바뀌고 제목·설명은 15로 남았다 — 검색 결과와 브라우저 탭에는
// 아직도 옛 숫자가 뜬다. 세는 곳을 한 군데로 모은다.
export const metadata: Metadata = {
  title: `무료 기획 샘플 — 콘텐츠 판매 사이트 화면 ${screens.length}개`,
  description: `전자책·템플릿을 파는 1인 사이트를 AI로 만들 때 쓰는 기획 결과물을 무료로 받아보세요. 화면 ${screens.length}개와 화면별 AI 프롬프트가 들어 있습니다.`,
  keywords: ["무료 기획서", "AI 프롬프트 무료", "화면설계서 샘플", "바이브코딩 기획"],
};
const exceptions = screens.filter((s) => /(empty|error|closed)/.test(s.role));
// 기능정의서를 만들 때와 같은 방식으로 센다 — 여기서만 '·'로 자르면
// 화면에 적힌 숫자와 받아본 파일의 줄 수가 어긋난다.
const reqCount = screens.reduce((n, s) => n + splitFuncDef(s.func).length, 0);

// 검수 항목 수는 «세어서» 쓴다. 손으로 적으면 샘플이 자랄 때 화면과 zip 이 어긋난다
// (2026-08-12 에 README 숫자 여섯 개가 그렇게 틀어져 있었다).
// 파일을 만드는 함수를 그대로 불러 같은 값을 얻는다.
const menuOf = new Map(CREATOR.menus.flatMap((m) => m.screens.map((s) => [s.ref, m.nameKo] as const)));
const qaCount = buildTemplateVerifySheets(
  "1인 크리에이터 콘텐츠 판매 사이트",
  screens.map((s) => ({
    pageId: s.ref, pageName: s.name, menuName: menuOf.get(s.ref) ?? "",
    funcDef: s.func ?? "", role: s.role ?? "",
  })),
).scenarios.length;

// 흐름도와 메뉴구조는 두 벌씩 들어 있다 — 하나는 보라고, 하나는 고쳐 쓰라고.
// 쓰임이 다르므로 따로 센다.
const FILES = [
  { icon: FileCode2, name: "AI 빌드 지시서", ext: "md", desc: "AI에 통째로 넣는 지시 문서", hot: true },
  { icon: FileSpreadsheet, name: "화면 목록", ext: "xlsx", desc: `화면 ${screens.length}개 + 화면별 프롬프트`, hot: true },
  { icon: ListChecks, name: "기능정의서", ext: "xlsx", desc: `요구사항 ${reqCount}개 · 업무 > 기능 > 구성`, hot: false },
  // 2026-08-13 추가 — 광고에서 「화면목록 «과 검수 시나리오»」를 앞세우기로 했는데,
  // 무료로 받은 사람이 그 절반을 못 보면 말이 안 맞는다. 규모(105 vs 216~944)로 벌린다.
  { icon: ClipboardCheck, name: "검수 시나리오", ext: "xlsx", desc: `배포 전에 눌러 볼 확인 항목 ${qaCount}개`, hot: true },
  { icon: Network, name: "FLOW 흐름도", ext: "html", desc: "브라우저로 바로 열어 보기 · 메뉴별 5장", hot: false },
  { icon: PenTool, name: "FLOW 흐름도", ext: "drawio", desc: "draw.io에서 직접 고쳐 쓰기", hot: false },
  { icon: CalendarDays, name: "개발 일정표", ext: "xlsx", desc: "화면별 작업 일정 (주말 제외)", hot: false },
  { icon: FileSpreadsheet, name: "메뉴구조", ext: "xlsx", desc: "메뉴와 화면 트리", hot: false },
  { icon: Presentation, name: "메뉴구조", ext: "pptx", desc: "장표 한 장 · 보고 자료에 그대로", hot: false },
];

export default async function FreePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="bg-background">
      <section className="bg-linear-to-br from-primary-soft/40 via-background to-muted/40">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
            <Gift className="size-4" />
            무료 샘플
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            내 콘텐츠 파는 사이트,
            <br />
            <span className="bg-primary-soft rounded-lg px-2 py-0.5">AI팩부터</span> 받아가세요
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            전자책·템플릿·강의자료를 직접 파는 1인 사이트의 기획 결과물이에요. 화면{" "}
            {screens.length}개와 화면별 AI 프롬프트가 들어 있습니다.
          </p>

          <div className="mt-8 flex flex-col items-center gap-2">
            <DownloadCta signedIn={Boolean(session)} />
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-14">
        {/* 들어 있는 파일 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>무엇이 들어 있나요 — 문서 {FILES.length}종</SectionTitle>
          <div className="flex flex-col gap-3">
            {FILES.map(({ icon: Icon, name, ext, desc, hot }) => (
              <div
                // 흐름도·메뉴구조는 이름이 같고 확장자만 다른 줄이 둘씩이라 함께 묶어야 한다.
                key={`${name}.${ext}`}
                className={`flex items-center gap-4 rounded-xl border p-4 ${
                  hot ? "border-primary/40 bg-primary-soft/25" : "border-border bg-surface"
                }`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                    hot ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-bold text-foreground">
                    {name}
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {ext}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 예외 화면 — 차별점 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>AI가 빠뜨리기 쉬운 화면 {exceptions.length}개도 들어 있어요</SectionTitle>
          <p className="leading-relaxed text-muted-foreground">
            &ldquo;만들어줘&rdquo; 한 줄로는 잘 나오지 않는, 실제로 꼭 필요한 화면들입니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {exceptions.map((s) => (
              <span
                key={s.ref}
                className="rounded-lg border border-primary/25 bg-primary-soft/50 px-3 py-1.5 text-sm font-medium text-primary-on-soft"
              >
                {s.name}
              </span>
            ))}
          </div>
        </section>

        {/* 화면 목록 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>
            화면 {screens.length}개 · 요건 {reqCount}개
          </SectionTitle>
          <div className="overflow-hidden rounded-xl border border-border">
            {CREATOR.menus.map((menu) => (
              <div key={menu.code}>
                <div className="flex items-baseline gap-2 border-b border-border bg-muted/40 px-4 py-2">
                  <span className="font-mono text-xs text-muted-foreground">{menu.code}</span>
                  <h3 className="text-sm font-bold text-foreground">{menu.nameKo}</h3>
                </div>
                {menu.screens.map((s) => (
                  <div
                    key={s.ref}
                    className="flex items-start gap-2 border-b border-border/60 px-4 py-2.5 text-sm"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{s.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* 사용법 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>어떻게 쓰나요</SectionTitle>
          <div className="rounded-xl border-2 border-primary bg-primary-soft/30 p-5">
            <p className="text-sm font-semibold text-muted-foreground">
              AI 빌드 지시서(.md) 하나를 Claude Code나 Cursor에 넣고
            </p>
            <p className="mt-2 text-lg font-bold text-primary-on-soft">
              &ldquo;AI 빌드 스펙팩 확인해서 콘텐츠 판매 사이트 만들어줘&rdquo;
            </p>
            <p className="mt-2 text-sm text-muted-foreground">이게 전부예요.</p>
          </div>
        </section>

        {/* 실제로 만들어 보시면 이런 것도 드려요 —
            무료 샘플은 «문서 구경»에서 끝난다. 직접 만들어 파일을 받으시면
            거기서 한 걸음 더 나가는 것이 있다는 걸 여기서 알린다(2026-08-10). */}
        <section className="flex flex-col gap-4">
          <SectionTitle>직접 만들어 파일을 받으시면 이런 것도 드려요</SectionTitle>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 flex-none items-center justify-center rounded-full bg-success/12 text-success">
                <Rocket className="size-4" />
              </span>
              <div>
                <h3 className="font-bold text-foreground">
                  「만든 사이트를 세상에 내놓는 법」 안내서
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  화면은 다 만들었는데 <b className="text-foreground">내 컴퓨터에서만 보이는</b> 데서
                  멈추시는 분이 많아요. 링크를 보내도 상대는 못 열고요.
                </p>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  저희가 이 사이트를 만들며 <b className="text-foreground">실제로 겪은 것</b>을 정리했습니다.
                </p>
                <ul className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                  <li>· 세상에 올리기 (Vercel)</li>
                  <li>· 내 도메인 붙이기 + 자물쇠</li>
                  <li>· 비밀 열쇠 다루는 법</li>
                  <li>· 회원가입·로그인 붙이기</li>
                  <li>· 데이터 저장하기 (Neon)</li>
                  <li>· 결제 받기 + 심사 두 달의 진실</li>
                  <li>· 사진·영상 만들기</li>
                  <li>· 안 망가지게 지키기·되돌리기</li>
                </ul>
                <p className="mt-3 text-sm text-muted-foreground">
                  프로젝트를 만들어 결과물을 받으시면 <b>모든 등급에 함께</b> 들어 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 맺음 — 홈 하단과 같은 이야기로 닫는다.
            무료 샘플만 받고 나가는 사람에게도 우리가 무엇을 하는 곳인지는 남겨야 한다. */}
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-linear-to-br from-primary-soft/50 via-background to-muted/40 px-6 py-10 text-center">
          <h2 className="text-xl font-bold leading-snug tracking-tight text-foreground sm:text-2xl">
            {/* 홈과 같은 색 대비 — '만들고'는 주황(설계), '오픈할 준비'는 녹색(검수). */}
            바이브코딩으로 원하는 사이트 <span className="text-primary">만들고</span>,
            <br />
            <span className="text-success">오픈할 준비</span> 되셨나요?
          </h2>
          <p className="max-w-lg leading-relaxed text-muted-foreground">
            AI는 편리하고 빠르죠. 하지만 원하는 대로 나왔는지, 정말 오픈해도 되는지 하나씩 눌러보는
            건 결국 우리 몫이에요. 내 서비스, 내 사이트잖아요 — 어떤 화면이 만들어질지 알고 만들고,
            진짜 오픈해도 되는지 꼭 확인해보세요.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/new"
              prefetch={false}
              className={buttonVariants({ size: "lg" })}
            >
              AI팩 만들기
              <ArrowRight className="size-4" />
            </Link>
            {/* 검수 버튼은 홈과 같이 녹색으로 채운다 — 테두리만 두면 둘 중 하나가 곁다리로 보인다.
                point-green이 이 버튼 안에서만 --primary를 검수 녹색으로 바꾼다(globals.css). */}
            <Link href="/verify" className={`point-green ${buttonVariants({ size: "lg" })}`}>
              내 사이트 검수하기
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
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
