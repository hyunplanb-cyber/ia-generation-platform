"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import type { EnabledSocialProviders } from "@/lib/social-providers";

export function LoginForm({ enabledSocialProviders }: { enabledSocialProviders: EnabledSocialProviders }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    await authClient.signIn.email(
      { email, password, callbackURL: "/dashboard" },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: () => {
          setLoading(false);
          setError("비밀번호가 일치하지 않아요.");
        },
      }
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold text-foreground">로그인</h1>
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
        <Button type="submit" disabled={loading}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>
      <SocialLoginButtons enabled={enabledSocialProviders} />
    </div>
  );
}
