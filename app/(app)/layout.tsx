import Link from "next/link";
import { ProfileMenu } from "@/components/profile-menu";
import { requireSession } from "@/application/require-session";
import { daysUntilAccountDeletion } from "@/lib/account-deletion";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireSession();
  const deletedAt = session.user.deletedAt as Date | null;

  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-foreground">
              IA 자동생성 플랫폼
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              대시보드
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
