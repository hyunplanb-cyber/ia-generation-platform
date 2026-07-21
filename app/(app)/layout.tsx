import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/session";
import { daysUntilAccountDeletion } from "@/lib/account-deletion";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy.ts는 쿠키 존재 여부만 낙관적으로 확인한다 — 쿠키는 있지만 세션이
  // 만료/무효화된 경우를 여기서 실제로 검증해 로그인 화면으로 보낸다.
  // (requireSession()은 이 상황에서 에러를 던지기만 해 화면이 깨졌었다.)
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const deletedAt = session.user.deletedAt as Date | null;

  return (
    <>
      <SiteHeader />

      {deletedAt && (
        <div className="border-b border-warning/30 bg-warning-soft px-6 py-2 text-center text-sm text-warning">
          계정이 {daysUntilAccountDeletion(deletedAt)}일 후 삭제됩니다. 프로젝트를 내보내 두세요.
        </div>
      )}

      <main className="flex-1">{children}</main>
    </>
  );
}
