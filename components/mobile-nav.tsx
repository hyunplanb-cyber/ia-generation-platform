"use client";

import { useRouter } from "next/navigation";
import {
  Menu,
  LayoutList,
  Package,
  LayoutGrid,
  LogIn,
  UserRound,
  LogOut,
  ShieldQuestion,
  PencilRuler,
  Gift,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

// 좁은 화면에서는 메뉴를 전부 이 안에 넣는다.
// 인스타 유입은 대부분 휴대폰이라, 여기서 "AI팩 구매"·"무엇을 받나요"에
// 닿지 못하면 사실상 없는 메뉴가 된다.
//
// 1024px(lg) 아래까지 이 버튼이 맡는다 — 이유는 nav-link.tsx 주석 참고.
export function MobileNav({ email }: { email: string | null }) {
  const router = useRouter();

  function go(href: string) {
    router.push(href);
  }

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    // 헤더는 서버에서 세션을 읽어 그리므로 새로고침해야 로그아웃 상태로 바뀐다.
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="메뉴 열기"
        className="flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => go("/dashboard/new")}>
          <PencilRuler className="size-4" />
          AI팩 만들기
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("/verify")}>
          <ShieldQuestion className="size-4" />
          사이트 검수하기
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("/deliverables")}>
          <LayoutList className="size-4" />
          무엇을 받나요
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("/packages")}>
          <Package className="size-4" />
          AI팩 구매
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => go("/free")}>
          <Gift className="size-4" />
          무료 샘플
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {email ? (
          // GroupLabel(이메일)은 반드시 Group 안에 있어야 한다(Base UI 규칙).
          // Group 없이 두면 메뉴를 여는 순간 크래시한다(Base UI error #31).
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => go("/dashboard")}>
              <LayoutGrid className="size-4" />
              나의 프로젝트
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => go("/account")}>
              <UserRound className="size-4" />
              계정 설정
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="size-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuItem onClick={() => go("/login")}>
            <LogIn className="size-4" />
            로그인
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
