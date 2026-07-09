"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "./actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!confirm("이 프로젝트와 포함된 모든 메뉴·화면이 함께 삭제돼요. 되돌릴 수 없어요.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deleteProjectAction.bind(null, projectId)} onSubmit={handleSubmit}>
      <Button type="submit" variant="destructive" size="sm">
        삭제
      </Button>
    </form>
  );
}
