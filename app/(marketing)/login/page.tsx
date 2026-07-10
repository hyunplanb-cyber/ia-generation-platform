import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getEnabledSocialProviders } from "@/lib/social-providers";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm enabledSocialProviders={getEnabledSocialProviders()} />;
}
