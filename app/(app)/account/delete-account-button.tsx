"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { requestAccountDeletionAction } from "./actions";

export function DeleteAccountButton() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!confirm("계정과 모든 프로젝트가 30일 후 삭제돼요. 그 전에 취소할 수 있어요.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={requestAccountDeletionAction} onSubmit={handleSubmit}>
      <Button type="submit" variant="destructive" size="sm">
        계정 탈퇴
      </Button>
    </form>
  );
}
