import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEnabledSocialProviders } from "@/lib/social-providers";
import { LoginForm } from "./login-form";

// 로그인 후 돌아갈 곳. 외부 사이트로 튕기지 않도록 내부 경로만 허용한다.
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(next);

  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect(target);
  }

  return <LoginForm enabledSocialProviders={getEnabledSocialProviders()} next={target} />;
}
