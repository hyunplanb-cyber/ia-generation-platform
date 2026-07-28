import Link from "next/link";
import { LayoutGrid, LayoutList, Package, ShieldQuestion, PencilRuler } from "lucide-react";
import { ProfileMenu } from "@/components/profile-menu";
import { MobileNav } from "@/components/mobile-nav";
import { NavLink } from "@/components/nav-link";
import { getSession } from "@/lib/session";
import { getCreditBalance } from "@/application/credit";
import { CREDITS_OPEN } from "@/lib/flags";

// 사이트 전체가 쓰는 단 하나의 헤더.
// 마케팅 화면과 로그인 후 화면이 각자 헤더를 갖고 있어서 메뉴가 서로 다르고
// 로그인 상태가 반영되지 않는 문제가 있었다 — 여기 하나로 합친다.
export async function SiteHeader() {
  const session = await getSession();
  // 로그인 상태면 크레딧 잔액을 함께 읽어 프로필 메뉴에 보여준다(무료 크레딧도 여기서 첫 지급).
  const balance = session ? await getCreditBalance() : 0;

  // 배경은 시안의 크림(종이) 색. 페이지 본문은 흰색이어도 상단 GNB만 크림 띠로 둔다.
  return (
    <header className="sticky top-0 z-30 border-b border-[#D9CCA8] bg-[#ECE1C7]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 좁은 화면에서는 글자를 줄여 메뉴 버튼 자리를 확보한다 */}
          <Link
            href="/"
            className="flex items-center gap-2 whitespace-nowrap text-base font-bold text-foreground sm:text-lg"
          >
            {/* 시안의 브랜드 마크 — 주황 원점 + 카페인컬러 */}
            <span className="size-5 shrink-0 rounded-full bg-primary" />
            카페인컬러
          </Link>
          <span className="hidden h-5 w-px bg-border sm:block" />
          {/* 설계도 프롬프트 → 새 프로젝트를 만들고 STEP 1로. 프리페치로 프로젝트가
              새로 생기지 않도록 prefetch를 끈다. */}
          <NavLink
            href="/dashboard/new"
            match="/dashboard/"
            icon={<PencilRuler className="size-4" />}
            prefetch={false}
          >
            설계도 프롬프트
          </NavLink>
          <NavLink href="/verify" icon={<ShieldQuestion className="size-4" />}>
            사이트 검수하기
          </NavLink>
          <NavLink href="/deliverables" icon={<LayoutList className="size-4" />}>
            산출물 소개
          </NavLink>
          <NavLink href="/packages" icon={<Package className="size-4" />}>
            패키지 구매
          </NavLink>
        </div>

        <nav className="flex items-center gap-1 sm:gap-3">
          {session ? (
            <>
              {/* 넓은 화면에서만 — 좁은 화면에서는 메뉴 버튼 안에 들어 있다 */}
              <NavLink
                href="/dashboard"
                match="/dashboard"
                exact
                noLine
                icon={<LayoutGrid className="size-4" />}
              >
                나의 프로젝트
              </NavLink>
              <span className="hidden sm:block">
                <ProfileMenu email={session.user.email} balance={balance} showCharge={CREDITS_OPEN} />
              </span>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-muted sm:block"
              >
                로그인
              </Link>
              {/* 가입은 가장 중요한 행동이라 좁은 화면에서도 계속 보이게 둔다 */}
              <Link
                href="/signup"
                className="whitespace-nowrap rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 sm:px-4"
              >
                회원가입
              </Link>
            </>
          )}
          <MobileNav email={session?.user.email ?? null} />
        </nav>
      </div>
    </header>
  );
}

