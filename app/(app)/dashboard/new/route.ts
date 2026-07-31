import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProjectQuota } from "@/application/can-create-project";
import { createProject } from "@/application/create-project";

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// "설계도 프롬프트" 메뉴 진입점 — 빈 프로젝트를 만들고 곧바로 STEP 1(컨셉 입력)로 보낸다.
// GNB 링크에서 바로 새 프로젝트를 시작할 수 있게 라우트로 뺐다.
// (링크 프리페치로 프로젝트가 새로 생기지 않도록, 거는 쪽에서 prefetch={false}로 둔다.)
export async function GET() {
  const session = await getSession();
  if (!session) {
    // 로그인이 없으면 가입으로 — 계정이 있어야 프로젝트를 만든다.
    // next를 실어 보내, 가입을 마치면 원래 하려던 "새 설계도 만들기"로 이어지게 한다.
    redirect("/signup?next=/dashboard/new");
  }

  const quota = await getProjectQuota();
  if (!quota.allowed) {
    redirect("/dashboard?limit=reached");
  }

  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 30);

  const project = await createProject({
    concept: "",
    menuDraft: null,
    designConcept: null,
    overallStart: toDateStr(today),
    overallEnd: toDateStr(end),
  });

  redirect(`/dashboard/${project.id}/edit`);
}
