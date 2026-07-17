import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, LayoutGrid } from "lucide-react";
import { ProfileMenu } from "@/components/profile-menu";
import { auth } from "@/lib/auth";
import { daysUntilAccountDeletion } from "@/lib/account-deletion";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy.ts는 쿠키 존재 여부만 낙관적으로 확인한다 — 쿠키는 있지만 세션이
  // 만료/무효화된 경우를 여기서 실제로 검증해 로그인 화면으로 보낸다.
  // (requireSession()은 이 상황에서 에러를 던지기만 해 화면이 깨졌었다.)
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }
  const deletedAt = session.user.deletedAt as Date | null;

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 로고 → 홈(랜딩) */}
            <Link href="/" className="flex items-center gap-1.5 text-lg font-bold text-foreground">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-primary-on-soft">
                <Sparkles className="size-3.5" />
              </span>
              IA 자동생성 플랫폼
            </Link>
            <span className="hidden h-5 w-px bg-border sm:block" />
            {/* 나의 프로젝트 → 대시보드 */}
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              <LayoutGrid className="size-4" />
              나의 프로젝트
            </Link>
          </div>
          <ProfileMenu />
        </div>
      </header>

      {deletedAt && (
        <div className="border-b border-warning/30 bg-warning-soft px-6 py-2 text-center text-sm text-warning">
          계정이 {daysUntilAccountDeletion(deletedAt)}일 후 삭제됩니다. 프로젝트를 내보내 두세요.
        </div>
      )}

      <main className="flex-1">{children}</main>
    </>
  );
}
