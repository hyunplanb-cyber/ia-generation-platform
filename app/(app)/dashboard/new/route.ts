import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProjectQuota } from "@/application/can-create-project";
import { createProject } from "@/application/create-project";
import { listUnfinishedProjects } from "@/application/list-unfinished-projects";

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// "AI팩 만들기" 메뉴 진입점.
//
// 예전엔 누를 때마다 곧바로 빈 프로젝트를 만들었다. 그래서 들어왔다 나가기를
// 몇 번 하면 목록이 껍데기로 지저분해졌다(한 손님이 90초 사이에 빈 프로젝트를
// 셋 만들고 갔다 — 2026-08-03). 이제 만들다 만 게 있으면 먼저 물어본다.
//
// ?start=1 이면 묻지 않고 새로 만든다 — "새 AI팩 시작하기"에서 온 경우다.
// (링크 프리페치로 프로젝트가 새로 생기지 않도록, 거는 쪽에서 prefetch={false}로 둔다.)
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    // 로그인이 없으면 가입으로 — 계정이 있어야 프로젝트를 만든다.
    // next를 실어 보내, 가입을 마치면 원래 하려던 "AI팩 만들기"로 이어지게 한다.
    redirect("/signup?next=/dashboard/new");
  }

  const quota = await getProjectQuota();
  if (!quota.allowed) {
    redirect("/dashboard?limit=reached");
  }

  if (new URL(request.url).searchParams.get("start") !== "1") {
    const drafts = await listUnfinishedProjects();
    if (drafts.length > 0) redirect("/dashboard/new/resume");
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
