import { requireSession } from "@/application/require-session";
import { daysUntilAccountDeletion } from "@/lib/account-deletion";
import { Button } from "@/components/ui/button";
import { cancelAccountDeletionAction } from "./actions";
import { DeleteAccountButton } from "./delete-account-button";

export default async function AccountPage() {
  const session = await requireSession();
  const deletedAt = session.user.deletedAt as Date | null;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 px-6 py-16">
      <h1 className="text-2xl font-bold text-foreground">계정 설정</h1>

      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">이름</p>
        <p className="text-foreground">{session.user.name}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">이메일</p>
        <p className="text-foreground">{session.user.email}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border p-5">
        {deletedAt ? (
          <>
            <p className="text-sm text-danger">
              계정이 {daysUntilAccountDeletion(deletedAt)}일 후 삭제됩니다. 프로젝트를 내보내 두세요.
            </p>
            <Button disabled variant="outline" size="sm" className="self-start">
              엑셀 다운로드 (Epic 4에서 지원 예정)
            </Button>
            <form action={cancelAccountDeletionAction}>
              <Button type="submit" variant="secondary" size="sm">
                탈퇴 취소
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              계정을 탈퇴하면 계정과 프로젝트가 30일간 유예 상태로 전환되고, 그 이후 삭제됩니다.
            </p>
            <DeleteAccountButton />
          </>
        )}
      </div>
    </div>
  );
}
