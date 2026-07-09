import Link from "next/link";
import { ProfileMenu } from "@/components/profile-menu";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

      <main className="flex-1">{children}</main>
    </>
  );
}
