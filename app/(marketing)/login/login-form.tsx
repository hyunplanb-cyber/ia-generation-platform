"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import type { EnabledSocialProviders } from "@/lib/social-providers";

const REMEMBERED_EMAIL_KEY = "ia-platform:remembered-email";

export function LoginForm({
  enabledSocialProviders,
  // 로그인 후 돌아갈 경로(무료 샘플 등 특정 페이지에서 들어온 경우).
  next = "/dashboard",
}: {
  enabledSocialProviders: EnabledSocialProviders;
  next?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // localStorage는 서버에 없는 브라우저 전용 저장소라 마운트 후 한 번만
    // 읽어 초기값을 채운다 — 이 최초 동기화는 setState-in-effect 규칙의
    // 의도된 예외 케이스다(외부 시스템에서 최초 상태를 가져오는 패턴).
    const saved = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (rememberEmail) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    await authClient.signIn.email(
      { email, password, callbackURL: next, rememberMe: keepSignedIn },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          router.push(next);
          // 헤더는 서버에서 세션을 읽어 그리므로, 새로고침해야 로그인 상태로 바뀐다.
          router.refresh();
        },
        onError: () => {
          setLoading(false);
          setError("비밀번호가 일치하지 않아요.");
        },
      }
    );
  }

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-pastel-lavender/40 via-background to-pastel-mint/40 py-16">
      <div className="mx-auto flex max-w-sm flex-col gap-6 px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </span>
          <h1 className="text-2xl font-bold text-foreground">다시 만나서 반가워요</h1>
          <p className="text-sm text-muted-foreground">로그인하고 만들던 프로젝트를 이어가세요.</p>
        </div>

        <div className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-sm text-danger">{error}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={rememberEmail}
                  onCheckedChange={(checked) => setRememberEmail(checked === true)}
                />
                이메일 기억하기
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={keepSignedIn}
                  onCheckedChange={(checked) => setKeepSignedIn(checked === true)}
                />
                로그인 상태 유지
              </label>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>
          <SocialLoginButtons enabled={enabledSocialProviders} callbackURL={next} />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
