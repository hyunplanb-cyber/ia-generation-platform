import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { countMyProjects } from "@/application/count-my-projects";

export default async function DashboardPage() {
  const projectCount = await countMyProjects();

  if (projectCount === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="text-lg font-medium text-foreground">첫 프로젝트를 만들어 보세요</p>
        <Link href="/dashboard/new" className={buttonVariants({ size: "lg" })}>
          새 프로젝트 만들기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 py-12">
      <p className="text-muted-foreground">프로젝트 {projectCount}개가 있어요.</p>
      <Link href="/dashboard/new" className={buttonVariants()}>
        새 프로젝트 만들기
      </Link>
    </div>
  );
}
