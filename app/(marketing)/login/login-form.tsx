import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { ReviewLogin } from "./review-login";
import type { EnabledSocialProviders } from "@/lib/social-providers";

export function LoginForm({
  enabledSocialProviders,
  // 카드사 심사 기간에만 이메일·비밀번호 칸을 함께 보여준다(lib/auth.ts 주석).
  reviewLogin = false,
  // 로그인 후 돌아갈 경로(무료 샘플 등 특정 페이지에서 들어온 경우).
  next = "/dashboard",
}: {
  enabledSocialProviders: EnabledSocialProviders;
  reviewLogin?: boolean;
  next?: string;
}) {
  // 로그인·가입 모두 소셜 계정으로만 받는다 — 비밀번호를 아예 보관하지 않기 위해서.
  const hasSocialProvider = Object.values(enabledSocialProviders).some(Boolean);

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-primary-soft/40 via-background to-muted/40 py-16">
      <div className="mx-auto flex max-w-sm flex-col gap-6 px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </span>
          <h1 className="text-2xl font-bold text-foreground">다시 만나서 반가워요</h1>
          <p className="text-sm text-muted-foreground">
            로그인하고 만들던 프로젝트를 이어가세요.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-sm">
          {hasSocialProvider && (
            <>
              <SocialLoginButtons
                enabled={enabledSocialProviders}
                callbackURL={next}
                showDivider={false}
              />
              <p className="text-center text-xs text-muted-foreground">
                가입할 때 쓰신 구글 계정으로 로그인해 주세요.
              </p>
            </>
          )}

          {/* 심사용 로그인은 소셜과 «따로» 선다. (2026-08-31)
              전에는 소셜 분기 «안»에 있어서, 구글 열쇠가 빠지면 이 문까지 함께
              사라졌다. 이 문이 있는 이유가 바로 「소셜로는 못 들어오는 사람」인데
              소셜에 딸려 사라지면 있으나 마나다. 구글 열쇠가 만료되는 날
              심사관도 같이 막히고, 화면에는 「지금은 로그인할 수 없어요」만 뜬다 —
              그 한 줄로는 무엇이 잘못됐는지 아무도 모른다. */}
          {reviewLogin && <ReviewLogin next={next} />}

          {/* 들어올 문이 «하나도» 없을 때만 안내를 남긴다. 빈 상자보다는 낫다. */}
          {!hasSocialProvider && !reviewLogin && (
            <p className="text-center text-sm text-muted-foreground">
              지금은 로그인할 수 없어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          처음이신가요?{" "}
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="font-medium text-primary hover:underline"
          >
            무료로 시작하기
          </Link>
        </p>
      </div>
    </div>
  );
}
