import { redirect } from "next/navigation";
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

export default async function VerifyPage() {
  // 로그인 사용자만 이용. 미로그인은 로그인 후 이 페이지로 돌아오게 한다.
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/verify");
  }

  const quota = await getVerifyQuota();

  return (
    <main className="point-green mx-auto max-w-[820px] px-6 py-14">
      <header className="border-b border-border pb-8">
        <p className="text-sm font-semibold text-primary">사이트 검수</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          오픈 전에, 진짜 다 되는지 확인하세요
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          AI로 만든 사이트는 보이는 화면만 그럴듯해요. URL을 넣으면 공개 화면은 우리가 검수하고,
          로그인·결제처럼 자동으로 볼 수 없는 화면은 직접 확인할 시나리오로 짚어드려요.
        </p>
      </header>

      <div className="pt-8">
        <VerifyForm alreadyBlocked={!quota.allowed} freeLimit={quota.limit} />
      </div>
    </main>
  );
}
