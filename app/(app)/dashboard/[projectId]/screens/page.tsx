import Link from "next/link";
import { listScreens } from "@/application/list-screens";

export default async function ScreensPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const screens = await listScreens(projectId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">화면 리스트</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          메뉴별로 자동 생성된 화면 목록이에요.
        </p>
      </div>

      {screens.length === 0 ? (
        <p className="text-muted-foreground">
          아직 생성된 화면이 없어요.{" "}
          <Link href={`/dashboard/${projectId}/menus`} className="font-medium text-primary underline">
            메뉴 관리
          </Link>
          에서 [실행: IA 생성]을 눌러주세요.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">페이지ID</th>
                <th className="px-4 py-2 font-medium">페이지명</th>
                <th className="px-4 py-2 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {screens.map((screen) => (
                <tr key={screen.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <span className="rounded-sm bg-pastel-lavender px-2 py-0.5 font-mono text-xs font-medium text-pastel-lavender-foreground">
                      {screen.pageId}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-foreground">{screen.pageName}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-neutral-badge-soft px-2 py-0.5 text-xs font-medium text-neutral-badge">
                      자동생성
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
