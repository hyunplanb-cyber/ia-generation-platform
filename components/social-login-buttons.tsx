"use client";

import { authClient } from "@/lib/auth-client";
import type { EnabledSocialProviders } from "@/lib/social-providers";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09C3.25 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.28a12 12 0 0 0 0 10.73l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.23 0 12 0 7.31 0 3.25 2.7 1.28 6.63l3.99 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#391B1B"
        d="M12 3C6.48 3 2 6.48 2 10.7c0 2.66 1.79 5 4.5 6.36l-1.15 4.2a.4.4 0 0 0 .6.44l4.9-3.24c.37.04.76.06 1.15.06 5.52 0 10-3.48 10-7.82C22 6.48 17.52 3 12 3Z"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#03C75A" />
      <path fill="#fff" d="M14.4 6v6.06L9.6 6H6v12h3.6v-6.06L14.4 18H18V6h-3.6Z" />
    </svg>
  );
}

const providerConfig = {
  google: {
    label: "Google로 계속하기",
    icon: GoogleIcon,
    className: "border border-input bg-background text-foreground hover:bg-muted",
  },
  naver: {
    label: "네이버로 계속하기",
    icon: NaverIcon,
    className: "border border-transparent bg-[#03C75A] text-white hover:bg-[#03C75A]/90",
  },
  kakao: {
    label: "카카오로 계속하기",
    icon: KakaoIcon,
    className: "border border-transparent bg-[#FEE500] text-[#391B1B] hover:bg-[#FEE500]/90",
  },
} as const;

export function SocialLoginButtons({ enabled }: { enabled: EnabledSocialProviders }) {
  const providers = Object.keys(providerConfig) as (keyof typeof providerConfig)[];

  function handleClick(provider: keyof typeof providerConfig) {
    if (!enabled[provider]) {
      alert("이 로그인 방법은 준비 중이에요. 조금만 기다려 주세요.");
      return;
    }
    authClient.signIn.social({ provider, callbackURL: "/dashboard" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        또는
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-3">
        {providers.map((provider) => {
          const { label, icon: Icon, className } = providerConfig[provider];
          return (
            <button
              key={provider}
              type="button"
              onClick={() => handleClick(provider)}
              className={`flex h-12 w-full items-center justify-center gap-2.5 rounded-lg text-base font-medium transition-colors ${className}`}
            >
              <Icon />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
