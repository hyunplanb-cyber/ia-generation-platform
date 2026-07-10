import { getEnabledSocialProviders } from "@/lib/social-providers";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return <LoginForm enabledSocialProviders={getEnabledSocialProviders()} />;
}
