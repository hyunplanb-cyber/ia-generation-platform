import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getVerifyQuota } from "@/application/get-verify-quota";
import { CREDITS_OPEN } from "@/lib/flags";
import { VerifyForm } from "./verify-form";

// 검수는 여러 페이지를 돌며 자동 검사(수십~백여 건) + LLM 시나리오까지 하므로
// 30초~1분 넘게 걸릴 수 있다. Fluid Compute에서는 무료 플랜도 300초까지 허용되므로
// 여유 있게 올려 크롤 중 타임아웃(504)이 나지 않게 한다.
export const maxDuration = 180;

export const metadata = {
  title: "사이트 검수",
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

  // 스텝(입력→검수 결과)·안내 패널·폼이 상태를 공유해야 하므로, 셸 전체를 VerifyForm(클라이언트)이 그린다.
  return (
    <main className="point-green mx-auto w-full max-w-[1440px] px-6 py-5">
      <VerifyForm alreadyBlocked={!quota.allowed} freeLimit={quota.limit} creditsOpen={CREDITS_OPEN} />
    </main>
  );
}
