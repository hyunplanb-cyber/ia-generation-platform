import Link from "next/link";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold text-foreground">
            IA 자동생성 플랫폼
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              회원가입
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-foreground">IA 자동생성 플랫폼</p>
            <p className="max-w-md">
              사이트 컨셉과 메뉴만 입력하면 IA·기능정의·AI프롬프트·일정까지 자동으로
              만들어주는 웹기획 자동화 도구예요.
            </p>
          </div>
          <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex gap-4">
              <Link href="/terms" className="hover:text-foreground">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                개인정보처리방침
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                문의하기
              </Link>
            </nav>
            <p>© {year} IA 자동생성 플랫폼</p>
          </div>
        </div>
      </footer>
    </>
  );
}
