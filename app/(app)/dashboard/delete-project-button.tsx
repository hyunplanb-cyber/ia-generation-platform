"use client";

import type { FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { deleteProjectAction } from "./actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!confirm("이 프로젝트와 포함된 모든 메뉴·화면이 함께 삭제돼요. 되돌릴 수 없어요.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteProjectAction.bind(null, projectId)} onSubmit={handleSubmit}>
      <button
        type="submit"
        aria-label="프로젝트 삭제"
        title="삭제"
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}
