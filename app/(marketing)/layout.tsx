import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MouseWatch } from "@/components/mouse-watch";
import { businessInfoRows } from "@/lib/business";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* 스크롤을 내리면 글·그림이 따라 올라온다. 화면은 «data-나타남» 표시만 달면 되고,
          실제 일은 여기 하나가 다 한다. 서버 컴포넌트를 클라이언트로 바꾸지 않으려는 짜임이다. */}
      <ScrollReveal />
      {/* 「지금 마우스로 보고 계신가」를 표시해 둔다. 마우스 올렸을 때 반응하는 것들이
          여기에 걸린다 — 미디어 쿼리로는 터치스크린 달린 노트북을 가려내지 못한다. */}
      <MouseWatch />
      <SiteHeader />

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-10 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2">
            <p className="text-base font-bold text-foreground">카페인컬러</p>
            <p>
              사이트 컨셉과 메뉴만 입력하면 IA·기능정의·AI프롬프트·일정까지 자동으로 만들어주는 웹기획 자동화 도구예요.
            </p>
          </div>
          {/* 전자상거래법상 사업자 정보 표시. 내용은 lib/business.ts 한 곳에서 관리한다. */}
          <dl className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-6 text-xs">
            {businessInfoRows().map(([label, value]) => (
              <span key={label} className="flex gap-1.5">
                <dt className="text-muted-foreground/70">{label}</dt>
                <dd className="text-muted-foreground">
                  {label === "문의" ? (
                    <a href={`mailto:${value}`} className="hover:text-foreground hover:underline">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
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
            <p>© {year} 카페인컬러</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
