"use client";

/* 카드사 심사 기간에만 뜨는 이메일·비밀번호 로그인.
 *
 * 평소에는 아예 그려지지 않는다(REVIEW_MODE 가 꺼져 있으면 부모가 안 넘겨준다).
 * 가입은 서버에서 닫혀 있어(disableSignUp) 여기로는 «로그인만» 된다.
 * 자세한 까닭은 lib/auth.ts 주석 참고.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function ReviewLogin({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await authClient.signIn.email({ email, password, callbackURL: next });
    if (err) {
      setBusy(false);
      // 왜 안 되는지 구체적으로 말하지 않는다 — 계정이 있는지 없는지를 알려주는 셈이 된다.
      setError("아이디 또는 비밀번호를 확인해 주세요.");
      return;
    }
    window.location.href = next;
  }

  return (
    <form onSubmit={submit} /* 위에 소셜 버튼이 있을 때만 나누는 선을 긋는다 — 이 폼이 맨 위면 선이 홀로 뜬다.
         구글 열쇠가 없는 자리(로컬)에서는 이 폼만 남는다. */
      className="flex flex-col gap-3 border-t border-dashed border-border pt-4 first:border-t-0 first:pt-0">
      <p className="text-xs font-semibold text-muted-foreground">심사용 계정으로 로그인</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        autoComplete="username"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        autoComplete="current-password"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-bold text-background disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" />}
        로그인
      </button>
      {error && <p className="text-center text-xs font-medium text-danger">{error}</p>}
    </form>
  );
}
