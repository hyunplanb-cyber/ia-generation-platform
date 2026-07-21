import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <>
      <SiteHeader />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-10 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-foreground">IA 자동생성 플랫폼</p>
            <p className="max-w-md">
              사이트 컨셉과 메뉴만 입력하면 IA·기능정의·AI프롬프트·일정까지 자동으로
              만들어주는 웹기획 자동화 도구예요.
            </p>
          </div>
          {/* 전자상거래법상 표시 의무 항목. 사업자등록·통신판매업 신고 후 실제 값으로 교체할 것. */}
          <dl className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-6 text-xs">
            {[
              ["상호", "[상호명]"],
              ["대표자", "[대표자명]"],
              ["사업자등록번호", "[000-00-00000]"],
              ["통신판매업 신고번호", "[제0000-지역0000호]"],
              ["주소", "[주소]"],
              ["문의", "[문의 이메일]"],
            ].map(([label, value]) => (
              <span key={label} className="flex gap-1.5">
                <dt className="text-muted-foreground/70">{label}</dt>
                <dd className="text-muted-foreground">{value}</dd>
              </span>
            ))}
          </dl>

          <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex gap-4">
              <Link href="/terms" className="hover:text-foreground">
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="font-semibold text-foreground/80 hover:text-foreground"
              >
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
