import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getProjectQuota } from "@/application/can-create-project";
import { createProject } from "@/application/create-project";
import { pruneDraftProjects } from "@/application/prune-draft-projects";

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// "AI팩 만들기" 메뉴 진입점 — 빈 프로젝트를 만들고 곧바로 STEP 1(컨셉 입력)로 보낸다.
//
// 만들다 만 프로젝트는 여기서 가로막지 않는다. STEP 1 화면에 "만들다 만 AI팩이 있어요"
// 버튼을 두고, 누르면 목록을 띄워 고르게 한다(2026-08-03).
// (링크 프리페치로 프로젝트가 새로 생기지 않도록, 거는 쪽에서 prefetch={false}로 둔다.)
export async function GET() {
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

  // 만들다 만 프로젝트는 최근 10개만 남긴다. 방금 만든 게 가장 최근이라 살아남는다.
  // 화면이 하나라도 있는 프로젝트는 건드리지 않는다(prune-draft-projects.ts).
  await pruneDraftProjects();

  redirect(`/dashboard/${project.id}/edit`);
}
