"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

// 이메일별로 고정되지만 서로 달라 보이는(랜덤한) 아바타 배경색.
const AVATAR_COLORS = [
  "#5B4FE5",
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

export function ProfileMenu({ email }: { email: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
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
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push("/account")}>계정 설정</DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>로그아웃</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
