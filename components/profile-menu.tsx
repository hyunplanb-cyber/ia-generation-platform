"use client";

import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

// 이메일별로 고정되지만 서로 달라 보이는(랜덤한) 아바타 배경색.
const AVATAR_COLORS = [
  "#0E6F60",
  "#FF8A65",
  "#26A69A",
  "#EC407A",
  "#42A5F5",
  "#FFA726",
  "#66BB6A",
  "#AB47BC",
];

function colorFor(email: string): string {
  let hash = 0;
  for (const ch of email) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function ProfileMenu({
  email,
  balance,
  showCharge,
}: {
  email: string;
  balance: number;
  showCharge: boolean;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    // 헤더는 서버에서 세션을 읽어 그리므로, 새로고침해야 로그아웃 상태로 바뀐다.
    router.refresh();
  }

  // 이메일 계정(@ 앞부분) 첫 알파벳
  const initial = (email.split("@")[0]?.trim()?.[0] ?? "U").toUpperCase();
  const bg = colorFor(email || "user");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="프로필 메뉴"
        style={{ backgroundColor: bg }}
        className="flex size-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
      >
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {/* 내 크레딧 잔액 — 클릭 시 사용 내역 */}
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/billing/history")}
          className="flex items-center justify-between gap-3"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Coins className="size-3.5 text-primary" /> 내 크레딧
          </span>
          <span className="text-sm font-bold text-foreground">{balance.toLocaleString()}</span>
        </DropdownMenuItem>
        {showCharge && (
          <DropdownMenuItem onClick={() => router.push("/dashboard/billing")}>
            충전하기
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/account")}>계정 설정</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>로그아웃</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
