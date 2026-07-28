import { Fragment } from "react";
import { redirect } from "next/navigation";
import {
  Upload,
  ShieldCheck,
  ChevronRight,
  Search,
  Lock,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { getVerifyQuota } from "@/application/get-verify-quota";
import { VerifyForm } from "./verify-form";

// 검수는 LLM 호출 + 여러 요청을 거쳐 15~30초가 걸릴 수 있다 → 무료 플랜 상한(60초) 명시.
export const maxDuration = 60;

export const metadata = {
  title: "사이트 검수 · 카페인컬러",
  description:
    "URL만 넣으면 공개 화면은 자동으로 검수하고, 로그인·결제 화면은 직접 확인할 시나리오를 짚어드려요.",
};

// 설계도 프롬프트 화면과 같은 형태의 상단 스텝. 검수는 입력 → 결과 2단계.
function VerifySteps() {
  const steps = [
    { title: "STEP 1", label: "입력", icon: Upload, active: true },
    { title: "STEP 2", label: "검수 결과", icon: ShieldCheck, active: false },
  ];
  return (
    <ol className="flex w-full items-stretch gap-2 sm:gap-3">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <Fragment key={s.title}>
            {/* 프롬프트 탭과 같은 스텝 크기(최대 429px). 2단계라 우측은 비워둔다. */}
            <li className="min-w-0 flex-1 sm:w-[429px] sm:flex-none">
              <div
                className={`flex h-full items-center justify-center gap-3 rounded-2xl px-4 py-4 sm:gap-4 sm:px-6 sm:py-5 ${
                  s.active
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-foreground/70"
                }`}
              >
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full sm:size-14 ${
                    s.active ? "bg-primary-foreground/20" : "bg-background text-muted-foreground"
                  }`}
                >
                  <Icon className="size-6 sm:size-7" />
                </span>
                <span className="flex items-baseline gap-2 whitespace-nowrap">
                  <span
                    className={`text-xs font-bold sm:text-sm ${
                      s.active ? "text-primary-foreground/75" : "opacity-60"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="text-lg font-extrabold tracking-tight sm:text-xl">{s.label}</span>
                </span>
              </div>
            </li>
            {i < steps.length - 1 && (
              <ChevronRight className="size-6 shrink-0 self-center text-muted-foreground/50 sm:size-7" />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

// 우측 안내 패널 — 설계도 프롬프트의 '이 입력으로 만들어져요'와 같은 형태.
const VERIFY_OUTPUTS: { icon: LucideIcon; label: string }[] = [
  { icon: Search, label: "공개 화면 자동 검사 · 통과/실패" },
  { icon: Lock, label: "로그인·결제 재현 시나리오" },
  { icon: ListChecks, label: "항목별 UI·기능 구분" },
];

export default async function VerifyPage() {
  // 로그인 사용자만 이용. 미로그인은 로그인 후 이 페이지로 돌아오게 한다.
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/verify");
  }

  const quota = await getVerifyQuota();

  return (
    <main className="point-green mx-auto w-full max-w-[1440px] px-6 py-5">
      <div className="flex flex-col gap-5">
        <VerifySteps />

        <p className="text-sm text-muted-foreground">
          이미 오픈(배포)한 사이트 주소나 설계 문서를 넣으면, 오픈 전에 진짜 다 되는지 확인해 드려요.
        </p>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* 좌측 콘텐츠 — 입력 폼 */}
          <div className="flex flex-col gap-6">
            <VerifyForm alreadyBlocked={!quota.allowed} freeLimit={quota.limit} />
          </div>

          {/* 우측 안내 패널 */}
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">이 검수로 확인해요</h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                무엇을 넣느냐에 따라 자동 검사와 재현 시나리오를 드려요.
              </p>
              <ul className="mt-4 flex flex-col gap-1.5">
                {VERIFY_OUTPUTS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 rounded-lg bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary-on-soft">
                      <Icon className="size-3.5" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
