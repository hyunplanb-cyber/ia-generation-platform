import { getEnabledSocialProviders } from "@/lib/social-providers";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return <SignupForm enabledSocialProviders={getEnabledSocialProviders()} />;
}
