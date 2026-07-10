"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, LayoutGrid, FileSpreadsheet } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import type { EnabledSocialProviders } from "@/lib/social-providers";

const BENEFITS = [
  { icon: Sparkles, text: "메뉴만 입력하면 IA가 자동으로 만들어져요" },
  { icon: LayoutGrid, text: "화면별 AI 코딩 프롬프트까지 한 번에" },
  { icon: FileSpreadsheet, text: "완성되면 엑셀로 바로 내보내요" },
];

export function SignupForm({ enabledSocialProviders }: { enabledSocialProviders: EnabledSocialProviders }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setGeneralError(null);

    await authClient.signUp.email(
      { email, password, name, callbackURL: "/dashboard" },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setLoading(false);
          if (ctx.error.status === 422 || /already exists|이미/i.test(ctx.error.message ?? "")) {
            setEmailError("이미 가입된 이메일이에요. 로그인해 주세요.");
          } else {
            setGeneralError("가입하지 못했어요. 다시 시도해 주세요.");
          }
        },
      }
    );
  }

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-pastel-yellow/40 via-background to-pastel-lavender/40 py-16">
      <div className="mx-auto flex max-w-sm flex-col gap-6 px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </span>
          <h1 className="text-2xl font-bold text-foreground">무료로 시작해요</h1>
          <p className="text-sm text-muted-foreground">가입은 1분이면 충분해요.</p>
        </div>

        <ul className="flex flex-col gap-2 rounded-xl bg-primary-soft/60 p-4">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-sm text-primary-on-soft">
              <Icon className="size-4 shrink-0" />
              {text}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {emailError && (
                <p className="text-sm text-danger">{emailError}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            {generalError && <p className="text-sm text-danger">{generalError}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "가입 중..." : "가입하기"}
            </Button>
          </form>
          <SocialLoginButtons enabled={enabledSocialProviders} />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
