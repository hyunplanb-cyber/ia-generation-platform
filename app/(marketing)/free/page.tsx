import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
  Download,
  Gift,
  Lock,
  FileSpreadsheet,
  FileCode2,
  Network,
  Check,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { CREATOR } from "@/template-data-creator";

// 인스타 릴스 유입의 착지점. 파일만 주고 끝내지 않고 가입을 거치게 해
// 방문자를 회원으로 남긴다(다운로드는 /api/free-sample 에서 세션을 확인).
export const metadata: Metadata = {
  title: "무료 기획 샘플 — 콘텐츠 판매 사이트 화면 15개",
  description:
    "전자책·템플릿을 파는 1인 사이트를 AI로 만들 때 쓰는 기획 산출물을 무료로 받아보세요. 화면 15개와 화면별 AI 프롬프트가 들어 있습니다.",
  keywords: ["무료 기획서", "AI 프롬프트 무료", "화면설계서 샘플", "바이브코딩 기획"],
};

const screens = CREATOR.menus.flatMap((m) => m.screens);
const exceptions = screens.filter((s) => /(empty|error|closed)/.test(s.role));
const reqCount = screens.reduce(
  (n, s) => n + s.func.split("·").filter((x) => x.trim()).length,
  0,
);

const FILES = [
  { icon: FileCode2, name: "AI 빌드 스펙팩", ext: "md", desc: "AI에 통째로 넣는 스펙 문서", hot: true },
  { icon: FileSpreadsheet, name: "IA 화면목록", ext: "xlsx", desc: `화면 ${screens.length}개 + 화면별 프롬프트`, hot: true },
  { icon: Network, name: "메뉴구조", ext: "xlsx", desc: "메뉴와 화면 트리", hot: false },
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
            전자책·템플릿·강의자료를 직접 파는 1인 사이트의 기획 산출물이에요. 화면{" "}
            {screens.length}개와 화면별 AI 프롬프트가 들어 있습니다.
          </p>

          <div className="mt-8 flex flex-col items-center gap-2">
            {session ? (
              <>
                <a
                  href="/api/free-sample"
                  className={`${buttonVariants({ size: "lg" })} shadow-primary/30 shadow-lg transition-transform hover:scale-105`}
                >
                  <Download className="size-4" />
                  무료로 다운로드
                </a>
                <p className="text-sm text-muted-foreground">zip 파일로 바로 받아집니다.</p>
                {/* 샘플을 받은 다음 자연스러운 다음 행동 — 내 서비스로 만들어보기 */}
                <Link
                  href="/dashboard"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  내 서비스로 직접 만들어보기
                  <ArrowRight className="size-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup?next=/free"
                  className={`${buttonVariants({ size: "lg" })} shadow-primary/30 shadow-lg transition-transform hover:scale-105`}
                >
                  무료로 받기
                  <ArrowRight className="size-4" />
                </Link>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Lock className="size-3.5" />
                  가입하면 바로 받으실 수 있어요 (무료)
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-14">
        {/* 들어 있는 파일 */}
        <section className="flex flex-col gap-4">
          <SectionTitle>무엇이 들어 있나요</SectionTitle>
          <div className="flex flex-col gap-3">
            {FILES.map(({ icon: Icon, name, ext, desc, hot }) => (
              <div
                key={name}
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
              스펙팩(.md) 하나를 Claude Code나 Cursor에 넣고
            </p>
            <p className="mt-2 text-lg font-bold text-primary-on-soft">
              &ldquo;AI 빌드 스펙팩 확인해서 콘텐츠 판매 사이트 만들어줘&rdquo;
            </p>
            <p className="mt-2 text-sm text-muted-foreground">이게 전부예요.</p>
          </div>
        </section>

        {/* 업셀 */}
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-linear-to-br from-primary-soft/50 via-background to-muted/40 px-6 py-10 text-center">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            내 서비스는 어떤 화면이 나올까요?
          </h2>
          <p className="max-w-lg leading-relaxed text-muted-foreground">
            위 샘플도 컨셉과 메뉴만 넣어서 자동으로 만든 거예요. 내 서비스로도{" "}
            <b className="font-semibold text-foreground">프로젝트 1개를 무료로</b> 만들어볼 수
            있습니다. 업종별로 완성된 AI팩도 있어요.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {/* 이미 로그인했다면 가입 화면을 한 번 더 거치지 않도록 바로 대시보드로 보낸다. */}
            <Link
              href={session ? "/dashboard" : "/signup?next=/dashboard"}
              className={buttonVariants({ size: "lg" })}
            >
              무료로 만들어보기
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/packages" className={buttonVariants({ variant: "outline", size: "lg" })}>
              AI팩 보기
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
