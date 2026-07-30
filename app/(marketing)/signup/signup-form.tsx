import Link from "next/link";
import { Sparkles, LayoutGrid, FileSpreadsheet } from "lucide-react";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import type { EnabledSocialProviders } from "@/lib/social-providers";

const BENEFITS = [
  { icon: Sparkles, text: "메뉴만 입력하면 IA가 자동으로 만들어져요" },
  { icon: LayoutGrid, text: "화면별 AI 코딩 프롬프트까지 한 번에" },
  { icon: FileSpreadsheet, text: "완성되면 엑셀로 바로 내보내요" },
];

export function SignupForm({
  enabledSocialProviders,
  // 가입 후 돌아갈 경로. 무료 샘플처럼 특정 페이지에서 들어온 경우 그 자리로 되돌린다.
  next = "/dashboard",
}: {
  enabledSocialProviders: EnabledSocialProviders;
  next?: string;
}) {
  // 가입은 소셜 계정으로만 받는다(비밀번호를 보관하지 않기 위해서).
  // 기존 이메일 계정은 로그인 화면에서 계속 사용할 수 있다.
  const hasSocialProvider = Object.values(enabledSocialProviders).some(Boolean);

  return (
    <div className="relative overflow-hidden bg-linear-to-br from-primary-soft/40 via-background to-muted/40 py-16">
      <div className="mx-auto flex max-w-sm flex-col gap-6 px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </span>
          <h1 className="text-2xl font-bold text-foreground">무료로 시작해요</h1>
          <p className="text-sm text-muted-foreground">
            구글 계정으로 10초면 가입이 끝나요.
          </p>
        </div>

        <ul className="flex flex-col gap-2 rounded-xl bg-primary-soft/60 p-4">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-sm text-primary-on-soft">
              <Icon className="size-4 shrink-0" />
              {text}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6 shadow-sm">
          {hasSocialProvider ? (
            <>
              <SocialLoginButtons
                enabled={enabledSocialProviders}
                callbackURL={next}
                showDivider={false}
              />
              <p className="text-center text-xs text-muted-foreground">
                별도 비밀번호를 만들지 않아도 돼요. 계정 정보는 저장하지 않습니다.
              </p>
            </>
          ) : (
            // 소셜 인증 키가 빠지면 가입 수단이 하나도 없게 되므로,
            // 빈 화면 대신 안내를 남긴다.
            <p className="text-center text-sm text-muted-foreground">
              지금은 가입을 받을 수 없어요. 잠시 후 다시 시도해 주세요.
            </p>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          이미 계정이 있으신가요?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-medium text-primary hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
